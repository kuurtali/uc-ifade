"""Export pending batches and accept reviewed original translations/examples.

No API credentials or paid services required. Source PDFs are not required here.
"""
import argparse
import json
from pathlib import Path
from build import ROOT, prepare
from ordering import mixed

FIELDS = ('meaning','example','translation')

def accept(catalog, order, batch):
    """Validate the entire batch before mutating either input."""
    ids={e['id']:e for e in catalog['entries']}
    if not batch: raise ValueError('Empty content batch')
    for identity, content in batch.items():
        if identity not in ids: raise ValueError('Unknown ID: '+identity)
        if ids[identity]['status']=='ready': raise ValueError('Already published: '+identity)
        if not all(isinstance(content.get(k),str) and content[k].strip() for k in FIELDS):
            raise ValueError('Missing meaning/example/translation: '+identity)
        if content.get('reviewed') is not True: raise ValueError('Review required: '+identity)
        if content.get('expression') != ids[identity]['expression']:
            raise ValueError('Expression does not match source: '+identity)
        for key in ('note','displayExpression'):
            if key in content and not isinstance(content[key],str): raise ValueError('Invalid '+key)
    # Mix words, phrases and levels; keep all previously published positions.
    for entry in mixed(catalog['entries']):
        if entry['id'] not in batch: continue
        content=batch[entry['id']]
        entry.update({k:content[k].strip() for k in FIELDS})
        entry.update(status='ready',contentOrigin='project-original')
        for key in ('note','displayExpression'):
            if key in content:
                entry[key]=content[key].strip()
        order.append(entry['id'])
    catalog['ready']=len(order)
    catalog['pending']=catalog['total']-len(order)

def main():
    ap=argparse.ArgumentParser()
    sub=ap.add_subparsers(dest='action',required=True)
    export=sub.add_parser('export')
    export.add_argument('output',type=Path)
    export.add_argument('--limit',type=int,default=100)
    export.add_argument('--source',choices=['Oxford 3000','Oxford 5000','Oxford Phrase List'])
    accept_parser=sub.add_parser('accept')
    accept_parser.add_argument('input',type=Path)
    args=ap.parse_args()
    catalog=json.loads((ROOT/'catalog.json').read_text(encoding='utf-8'))
    if args.action=='export':
        if not 1<=args.limit<=1000: raise ValueError('Limit must be 1–1000')
        pending=[e for e in mixed(catalog['entries']) if e['status']=='pending' and (not args.source or e['source']==args.source)][:args.limit]
        batch={e['id']:{'expression':e['expression'],'level':e['level'],'sourceText':e['sourceText'],
                       'meaning':'','example':'','translation':'','reviewed':False} for e in pending}
        args.output.write_text(json.dumps(batch,ensure_ascii=False,indent=2),encoding='utf-8')
        print(f'Exported {len(batch)} pending entries.')
        return
    prepare()  # Reject an already inconsistent catalogue before merging.
    order=json.loads((ROOT/'deck-order.json').read_text(encoding='utf-8'))
    batch=json.loads(args.input.read_text(encoding='utf-8-sig'))
    accept(catalog,order,batch)
    content_path=ROOT/'content.json'
    content=json.loads(content_path.read_text(encoding='utf-8')) if content_path.exists() else {}
    content.update(batch)
    # Write only after the complete batch passes review and field validation.
    for filename,data in [('content.json',content),('catalog.json',catalog),('deck-order.json',order)]:
        target=ROOT/filename
        temp=target.with_suffix(target.suffix+'.tmp')
        temp.write_text(json.dumps(data,ensure_ascii=False,indent=2 if filename!='catalog.json' else None),encoding='utf-8')
        temp.replace(target)
    print(f"Accepted {len(batch)} entries; {catalog['pending']} still pending. Run python build.py next.")

if __name__=='__main__': main()
