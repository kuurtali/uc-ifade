"""Build deterministic, locally rendered lock-screen cards; no remote services."""
import argparse
import hashlib
import json
import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
OUT = ROOT
OUT.mkdir(exist_ok=True)
W, H = 1290, 2796
RENDER_VERSION = '3'

def font(size, bold=False):
    custom = os.environ.get('CARD_FONT_BOLD' if bold else 'CARD_FONT')
    candidates = [custom] if custom else []
    candidates += ([r'C:/Windows/Fonts/segoeuib.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'] if bold else
                   [r'C:/Windows/Fonts/segoeui.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'])
    for path in candidates:
        if path and Path(path).exists():
            return ImageFont.truetype(path, size)
    raise RuntimeError('Set CARD_FONT and CARD_FONT_BOLD to Unicode TTF font paths.')

def wrap(draw, text, f, max_width):
    lines, line = [], ''
    for word in text.split():
        candidate = (line + ' ' + word).strip()
        if draw.textlength(candidate, font=f) > max_width and line:
            lines.append(line)
            line = word
        else:
            line = candidate
    if line:
        lines.append(line)
    if any(draw.textlength(line, font=f) > max_width for line in lines):
        raise ValueError('Unbreakable text exceeds card width')
    return lines

def prepare(root=ROOT, require_complete=False):
    catalog=json.loads((root/'catalog.json').read_text(encoding='utf-8'))
    order=json.loads((root/'deck-order.json').read_text(encoding='utf-8'))
    indexed={e['id']:e for e in catalog['entries']}
    if not indexed: raise ValueError('Empty catalog')
    if catalog['total'] != len(indexed): raise ValueError('Catalog total mismatch')
    if len(indexed)!=len(catalog['entries']): raise ValueError('Duplicate catalog IDs')
    if len(order)!=len(set(order)): raise ValueError('Duplicate deck IDs')
    for e in catalog['entries']:
        if e['status'] not in ('ready','pending'): raise ValueError('Unknown content status')
        if e['status']=='ready' and not all(isinstance(e.get(k),str) and e[k].strip() for k in ['meaning','example','translation']):
            raise ValueError('Ready entry has missing content: '+e['id'])
    ready=[e for e in catalog['entries'] if e['status']=='ready']
    if set(order)!={e['id'] for e in ready}: raise ValueError('Deck must contain every ready entry exactly once')
    complete=len(ready)==len(indexed)
    if require_complete and not complete:
        raise ValueError(f"Full release blocked: {len(indexed)-len(ready)} entries still need meaning, example and translation")
    entries=[]
    for identity in order:
        e=indexed[identity]
        entries.append({'entryId':identity,'expression':e.get('displayExpression',e['expression']),
          'meaning':e['meaning'],'example':e['example'],'translation':e['translation'],
          'kind':'Kalıp' if e['kind']=='phrase' else 'Kelime','level':e['level'],
          'source':e['source'],'note':e.get('note',''),'repeat':False})
    groups=group_entries(entries,complete)
    return catalog,entries,groups,complete

def group_entries(entries, complete):
    groups=[]
    for i in range(0,len(entries),3):
        group=entries[i:i+3]
        if len(group)<3:
            if not complete: break
            group=group+[dict(entries[j%len(entries)],repeat=True) for j in range(3-len(group))]
        groups.append(group)
    return groups

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--require-complete',action='store_true',help='Reject a full release with any pending content')
    ap.add_argument('--validate-only',action='store_true')
    args=ap.parse_args()
    catalog,entries,groups,complete=prepare(require_complete=args.require_complete)
    print(f"Catalog: {catalog['total']}; ready: {len(entries)}; pending: {catalog['total']-len(entries)}")
    if args.validate_only: return
    cards=[]
    for number,group in enumerate(groups,1):
        img = Image.new('RGB', (W, H), '#0d181c')
        d = ImageDraw.Draw(img)
        # Clock and widgets occupy the empty upper area; notifications the lower area.
        d.line((108, 677, 1182, 677), fill='#34504f', width=2)
        d.text((108, 698), 'ÜÇ İFADE', font=font(28, True), fill='#8ed4bf')
        d.text((970, 698), f'KART {number:04d}', font=font(28), fill='#8ba29f')
        for slot, entry in enumerate(group):
            top = 770 + slot * 440
            x, width = 108, 1074
            label=f'{entry["level"]}  ·  {entry["kind"].upper()}'
            if entry['repeat']: label+='  ·  TEKRAR'
            d.text((x, top), label, font=font(26), fill='#8ed4bf')
            y = top + 45
            for text, size, bold, color, gap in [
                (entry['expression'], 65, True, '#f3f0e9', 14),
                (entry['meaning'], 39, False, '#b9cec8', 25),
                (entry['example'], 43, False, '#f3f0e9', 12),
                (entry['translation'], 36, False, '#a6b8b4', 0),
            ]:
                f = font(size, bold)
                for line in wrap(d, text, f, width):
                    d.text((x, y), line, font=f, fill=color)
                    y += round(size * 1.25)
                y += gap
            if y > top + 408: raise ValueError(f'Overflow on card {number}: {entry["expression"]} ({y-top}px)')
            if slot < 2:
                d.line((108, top+420, 1182, top+420), fill='#29423f', width=2)
        signature = hashlib.sha256((RENDER_VERSION+json.dumps(group,ensure_ascii=False,sort_keys=True)).encode()).hexdigest()[:12]
        filename = f'card-{number:06d}-{signature}.jpg'
        img.save(OUT / filename, quality=93, optimize=True, subsampling=0)
        cards.append({'id': number, 'image': filename, 'entryIds':[e['entryId'] for e in group], 'entries':group})
    manifest={'version':2,'stage':'complete' if complete else 'content-in-progress',
              'complete':complete,'catalogTotal':catalog['total'],'readyExpressions':len(entries),
              'pendingExpressions':catalog['total']-len(entries),'targetExpressions':catalog['total'],
              'count':len(cards),'width':W,'height':H,'hours':list(range(8,23)),
              'cycleAtEnd':complete,'cards':cards}
    # The phone downloads only lightweight image pointers, not thousands of examples.
    phone=dict(manifest,cards=[{k:v for k,v in c.items() if k!='entries'} for c in cards])
    (ROOT/'manifest.json').write_text(json.dumps(phone,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    (ROOT/'manifest.js').write_text('window.CARD_MANIFEST = '+json.dumps(manifest,ensure_ascii=False)+';\n',encoding='utf-8')
    print(f"Validated and rendered {len(cards)} cards ({W} x {H}).")

if __name__=='__main__': main()
