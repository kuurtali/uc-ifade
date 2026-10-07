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
RENDER_VERSION = '5-six-compact'
PER_CARD = 6
TARGET = 6000
THEMES = {
    'black': {'label':'Siyah', 'background':'#000000','accent':'#c9d1dc','line':'#30343b','muted':'#aeb4bf','meaning':'#d1d5dd'},
    'navy': {'label':'Lacivert', 'background':'#08152e','accent':'#91bcff','line':'#283b5c','muted':'#b0bdd2','meaning':'#cbd9ef'},
    'purple': {'label':'Mor / yumuşak sarı', 'background':'#1c1129','accent':'#edcf83','line':'#3b2d49','muted':'#bcb0c9','meaning':'#dcd2e5'},
}

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
    complete=len(ready)==len(indexed) and len(indexed)>=TARGET
    if require_complete and not complete:
        raise ValueError(f"Full release blocked: {max(TARGET,len(indexed))-len(ready)} entries still need complete content")
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
    for i in range(0,len(entries),PER_CARD):
        group=entries[i:i+PER_CARD]
        if len(group)<PER_CARD:
            if not complete: break
            group=group+[dict(entries[j%len(entries)],repeat=True) for j in range(PER_CARD-len(group))]
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
      images={}
      for theme_name,theme in THEMES.items():
        img = Image.new('RGB', (W, H), theme['background'])
        d = ImageDraw.Draw(img)
        # Clock and widgets occupy the empty upper area; notifications the lower area.
        d.text((90, 689), 'İFADE', font=font(23), fill=theme['muted'])
        d.text((1080, 689), f'{number:04d}', font=font(23), fill=theme['muted'])
        for slot, entry in enumerate(group):
            top = 757 + slot * 245
            x, width = 90, 1110
            y = top
            expression=entry['expression']+(' · tekrar' if entry['repeat'] else '')
            for text, size, bold, color, gap in [
                (expression, 42, True, theme['accent'], 2),
                (entry['meaning'], 32, False, theme['meaning'], 9),
                (entry['example'], 34, False, '#f5f2f8', 3),
                (entry['translation'], 30, False, theme['muted'], 0),
            ]:
                f = font(size, bold)
                for line in wrap(d, text, f, width):
                    d.text((x, y), line, font=f, fill=color)
                    y += round(size * 1.18)
                y += gap
            if y > top + 224: raise ValueError(f'Overflow on card {number}: {entry["expression"]} ({y-top}px)')
            if slot < PER_CARD-1:
                d.line((90, top+232, 1200, top+232), fill=theme['line'], width=1)
        signature = hashlib.sha256((RENDER_VERSION+json.dumps([group,theme],ensure_ascii=False,sort_keys=True)).encode()).hexdigest()[:12]
        filename = f'card-{number:06d}-{theme_name}-{signature}.jpg'
        img.save(OUT / filename, quality=93, optimize=True, subsampling=0)
        images[theme_name]=filename
        if number==1:
            alias={'black':'siyah.jpg','navy':'lacivert.jpg','purple':'mor.jpg'}[theme_name]
            (OUT/alias).write_bytes((OUT/filename).read_bytes())
            if theme_name=='purple': (OUT/'0001.jpg').write_bytes((OUT/filename).read_bytes())
      cards.append({'id': number, 'image': images['purple'], 'images':images, 'entryIds':[e['entryId'] for e in group], 'entries':group})
    manifest={'version':3,'deckVersion':'mixed-six-v1','expressionsPerCard':PER_CARD,
              'stage':'complete' if complete else 'content-in-progress',
              'complete':complete,'catalogTotal':catalog['total'],'readyExpressions':len(entries),
              'pendingExpressions':catalog['total']-len(entries),'targetExpressions':TARGET,
              'additionalExpressionsNeeded':max(0,TARGET-catalog['total']),
              'count':len(cards),'width':W,'height':H,'hours':list(range(8,23)),
              'cycleAtEnd':complete,'defaultTheme':'purple',
              'themes':{k:v['label'] for k,v in THEMES.items()},'cards':cards}
    # The phone downloads only lightweight image pointers, not thousands of examples.
    phone=dict(manifest,cards=[{k:v for k,v in c.items() if k!='entries'} for c in cards])
    (ROOT/'manifest.json').write_text(json.dumps(phone,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    for theme_name in THEMES:
        themed=dict(phone,cards=[dict(c,image=c['images'][theme_name]) for c in phone['cards']])
        (ROOT/f'manifest-{theme_name}.json').write_text(json.dumps(themed,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    (ROOT/'manifest.js').write_text('window.CARD_MANIFEST = '+json.dumps(manifest,ensure_ascii=False)+';\n',encoding='utf-8')
    print(f"Validated and rendered {len(cards)} cards ({W} x {H}).")

if __name__=='__main__': main()
