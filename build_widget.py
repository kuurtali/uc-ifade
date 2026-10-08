"""Rebuild distributable widget assets from the canonical attributed collection."""
import json
from pathlib import Path
root=Path(__file__).resolve().parent
data=json.loads((root/'collection.json').read_text(encoding='utf8'))
assert data['schema']==1 and len(data['entries'])==5753
assert len({e['id'] for e in data['entries']})==5753
fields=['id','expression','meaning','example','translation']
for e in data['entries']:
    assert all(isinstance(e[k],str) and e[k].strip() for k in fields),e['id']
lean={k:data[k] for k in ['schema','version','periodHours']}
lean['entries']=[{k:e[k] for k in fields} for e in data['entries']]
(root/'widget-data.json').write_text(json.dumps(lean,ensure_ascii=False,separators=(',',':')),encoding='utf8')
(root/'Ifade.js').write_text('// İfade · 6 expressions · 2 hours · github.com/kuurtali/uc-ifade\n'+(root/'widget-core.js').read_text(encoding='utf8')+'\n'+(root/'widget-runtime.js').read_text(encoding='utf8'),encoding='utf8')
print('Built Ifade.js and widget-data.json: 5753 complete entries.')
