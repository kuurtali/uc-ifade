"""Build deterministic, locally rendered lock-screen cards; no remote services."""
import csv
import json
import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
OUT = ROOT
OUT.mkdir(exist_ok=True)
W, H = 1290, 2796

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

with (ROOT / 'data.tsv').open(encoding='utf-8', newline='') as stream:
    entries = list(csv.DictReader(stream, delimiter='\t'))
required = ['expression', 'meaning', 'example', 'translation', 'level', 'kind', 'source']
assert len(entries) and len(entries) % 3 == 0, 'Each card must contain exactly three entries'
assert len({e['expression'] for e in entries}) == len(entries), 'Duplicate expressions'
for e in entries:
    assert all(e.get(k, '').strip() for k in required), e
    assert e['level'] in ['A1', 'A2', 'B1', 'B2', 'C1']

cards = []
for offset in range(0, len(entries), 3):
    number = offset // 3 + 1
    img = Image.new('RGB', (W, H), '#0d181c')
    d = ImageDraw.Draw(img)
    # Clock and widgets occupy the empty upper area; notifications the lower area.
    d.line((108, 677, 1182, 677), fill='#34504f', width=2)
    d.text((108, 698), 'ÜÇ İFADE', font=font(28, True), fill='#8ed4bf')
    d.text((1002, 698), f'{number:02d} / {len(entries)//3:02d}', font=font(28), fill='#8ba29f')
    for slot, entry in enumerate(entries[offset:offset+3]):
        top = 770 + slot * 440
        x, width = 108, 1074
        d.text((x, top), f'{entry["level"]}  ·  {entry["kind"].upper()}', font=font(26), fill='#8ed4bf')
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
        assert y <= top + 408, f'Overflow on card {number}: {entry["expression"]} ({y-top}px)'
        if slot < 2:
            d.line((108, top+420, 1182, top+420), fill='#29423f', width=2)
    filename = f'{number:04d}.jpg'
    img.save(OUT / filename, quality=93, optimize=True, subsampling=0)
    cards.append({'id': number, 'image': filename, 'entries': entries[offset:offset+3]})
manifest = {'version': 1, 'stage': 'prototype', 'readyExpressions': len(entries),
            'targetExpressions': 5750, 'count': len(cards), 'width': W, 'height': H,
            'hours': list(range(8, 23)), 'cards': cards}
(ROOT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
# Embedded data lets the preview work even when index.html is opened directly.
(ROOT / 'manifest.js').write_text('window.CARD_MANIFEST = ' + json.dumps(manifest, ensure_ascii=False) + ';\n', encoding='utf-8')
print(f'Validated and rendered {len(entries)} expressions, {len(cards)} cards ({W} x {H}).')
