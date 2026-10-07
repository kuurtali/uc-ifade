"""Import all entries from the three official PDFs; retain provenance and variants.

Usage: python import_catalog.py --pdf-dir ../
Requires pdfplumber. Does not invent translations or copy dictionary examples.
"""
import argparse
import csv
import hashlib
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path
import pdfplumber

ROOT = Path(__file__).resolve().parent
SOURCES = [
 ('Oxford_3000.pdf', 'Oxford 3000', 'word', 'https://www.oxfordlearnersdictionaries.com/external/pdf/wordlists/oxford-3000-5000/The_Oxford_3000.pdf'),
 ('Oxford_5000_Ek_2000.pdf', 'Oxford 5000', 'word', 'https://www.oxfordlearnersdictionaries.com/external/pdf/wordlists/oxford-3000-5000/The_Oxford_5000.pdf'),
 ('Oxford_Phrase_List_750.pdf', 'Oxford Phrase List', 'phrase', 'https://www.oxfordlearnersdictionaries.com/external/pdf/wordlists/oxford-phrase-list/Oxford%20Phrase%20List.pdf')]

def clean(s):
 return re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', s)).strip()

def key(s):
 s=clean(s).casefold().replace('…','').replace('...','')
 return re.sub(r'\s+(?:sb/sth|sb|sth)$', '', s).strip()

def rows(path):
 with pdfplumber.open(path) as pdf:
  for page_num,p in enumerate(pdf.pages,1):
   for left,right in [(40,171),(171,302),(302,432),(432,557)]:
    chars=[c for c in p.chars if left<=c['x0']<right and c['top']<797 and
           (abs(c['size']-9)<.2 or 'UtopiaStd-Bold' in c['fontname'])]
    grouped={}
    for c in chars: grouped.setdefault(round(c['top'],1),[]).append(c)
    for y,cs in sorted(grouped.items()):
     cs.sort(key=lambda c:c['x0'])
     text=clean(''.join(c['text'] for c in cs))
     main=clean(''.join(c['text'] for c in cs if 'MyriadPro-Regular' in c['fontname']))
     if text: yield {'page':page_num,'text':text,'main':main}

def import_sources(pdf_dir):
 entries=[]
 for filename,source,kind,url in SOURCES:
  current=None
  level=None
  for row in rows(pdf_dir/filename):
   text=row['text']
   if kind=='phrase' and re.fullmatch('[ABC][12]',text):
    level=text
    continue
   if kind=='phrase':
    # Two light-font example lines contain fallback regular glyphs; exclude them.
    is_main=bool(row['main']) and row['main']==text
    if not is_main:
     if current: current['variants'].append(text)
     continue
    expression=text
    raw=text
   else:
    if not row['main']:
     if current: current['sourceText']+=' '+text
     continue
    # A lexical head may include a parenthesized sense and superscript number.
    match=re.search(r'\s+(?=(?:n[.,]|v\.|adj\.|adv\.|prep\.|conj\.|det\.|pron\.|exclam\.|number\b|ordinal number\b|modal v\.|auxiliary v\.|indefinite article\b|definite article\b|infinitive marker\b))',text)
    if not match: raise ValueError('Unrecognized source line: '+text)
    expression=text[:match.start()]
    raw=text
   current={'id':'ox-'+hashlib.sha256((source+'|'+raw).encode()).hexdigest()[:16],
            'expression':expression,'kind':kind,'level':level,'source':source,
            'sourceUrl':url,'sourcePage':row['page'],'sourceText':raw,'variants':[],
            'status':'pending','meaning':None,'example':None,'translation':None,'note':''}
   entries.append(current)
 for e in entries:
  if e['kind']=='word':
   levels=re.findall(r'\b[ABC][12]\b',e['sourceText'])
   if not levels: raise ValueError('Missing CEFR: '+e['expression'])
   e['level']=min(levels)
 assert len({e['id'] for e in entries})==len(entries), 'Duplicate source identity'
 return entries

def merge_content(entries):
 lookup={}
 for e in entries:
  for form in [e['expression'],*e['variants']]:
   lookup.setdefault((key(form),e['kind']),[]).append(e)
 with (ROOT/'data.tsv').open(encoding='utf-8',newline='') as f:
  seed=list(csv.DictReader(f,delimiter='\t'))
 order=[]
 for row in seed:
  kind='phrase' if row['kind']=='Kalıp' else 'word'
  candidates=lookup.get((key(row['expression']),kind),[])
  if not candidates:raise ValueError('Seed not in Oxford sources: '+row['expression'])
  # Seed source labels disambiguate any cross-list entries.
  e=next((e for e in candidates if e['source']==row['source']),candidates[0])
  e.update({k:row[k] for k in ['meaning','example','translation','note']})
  e.update({'displayExpression':row['expression'],'status':'ready','contentOrigin':'project-original', 'level':row['level']})
  order.append(e['id'])
 # Content files can be completed independently of the source catalog.
 content_path=ROOT/'content.json'
 if content_path.exists():
  extra=json.loads(content_path.read_text(encoding='utf-8'))
  ids={e['id']:e for e in entries}
  for identity,content in extra.items():
   if identity not in ids:raise ValueError('Unknown content identity: '+identity)
   if not all(content.get(k,'').strip() for k in ['meaning','example','translation']):
    raise ValueError('Incomplete content: '+identity)
   for k in ['meaning','example','translation','note','displayExpression']:
    if k in content:ids[identity][k]=content[k]
   ids[identity].update(status='ready',contentOrigin='project-original')
 # Existing cards keep their original order. New ready entries only append.
 deck_file=ROOT/'deck-order.json'
 old=json.loads(deck_file.read_text(encoding='utf-8')) if deck_file.exists() else order
 ready={e['id'] for e in entries if e['status']=='ready'}
 if any(i not in ready for i in old):raise ValueError('Published content cannot disappear silently')
 old.extend(e['id'] for e in entries if e['status']=='ready' and e['id'] not in old)
 return old

def main():
 ap=argparse.ArgumentParser()
 ap.add_argument('--pdf-dir',type=Path,default=ROOT.parent)
 args=ap.parse_args()
 entries=import_sources(args.pdf_dir)
 order=merge_content(entries)
 counts=dict(Counter(e['source'] for e in entries))
 catalog={'schemaVersion':2,'sources':counts,'total':len(entries),'ready':len(order),
          'pending':len(entries)-len(order),'entries':entries}
 (ROOT/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
 (ROOT/'deck-order.json').write_text(json.dumps(order,indent=2),encoding='utf-8')
 print(json.dumps({k:v for k,v in catalog.items() if k!='entries'},ensure_ascii=False))

if __name__=='__main__': main()
