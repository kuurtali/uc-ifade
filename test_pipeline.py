import copy
import json
import tempfile
import unittest
from pathlib import Path
from build import group_entries, prepare, ROOT
from content_tool import accept

class PipelineTests(unittest.TestCase):
    def test_full_collection_covers_all_once_before_repeat(self):
        for count in (1,2,5750,5753,10000):
            entries=[{'entryId':str(i),'repeat':False} for i in range(count)]
            groups=group_entries(entries,True)
            flat=[e for group in groups for e in group]
            self.assertTrue(all(len(group)==3 for group in groups))
            self.assertEqual([e['entryId'] for e in flat[:count]],[str(i) for i in range(count)])
            self.assertTrue(all(e['repeat'] for e in flat[count:]))

    def test_partial_tail_waits_without_reordering(self):
        entries=[{'entryId':str(i)} for i in range(32)]
        first=group_entries(entries,False)
        self.assertEqual(len(first),10)
        expanded=group_entries(entries+[{'entryId':'32'}],False)
        self.assertEqual(first,expanded[:10])
        self.assertEqual([e['entryId'] for e in expanded[-1]],['30','31','32'])

    def test_real_catalog_and_release_gate(self):
        catalog,ready,groups,complete=prepare()
        self.assertGreaterEqual(len(catalog['entries']),5750)
        self.assertEqual(len(ready),catalog['ready'])
        self.assertEqual(sum(catalog['sources'].values()),catalog['total'])
        if not complete:
            with self.assertRaisesRegex(ValueError,'Full release blocked'): prepare(require_complete=True)

    def test_invalid_ready_content_and_duplicate_ids_block(self):
        catalog=json.loads((ROOT/'catalog.json').read_text(encoding='utf-8'))
        order=json.loads((ROOT/'deck-order.json').read_text(encoding='utf-8'))
        with tempfile.TemporaryDirectory(dir=ROOT) as tmp:
            path=Path(tmp)
            (path/'deck-order.json').write_text(json.dumps(order),encoding='utf-8')
            invalid=copy.deepcopy(catalog)
            next(e for e in invalid['entries'] if e['status']=='ready')['example']=''
            (path/'catalog.json').write_text(json.dumps(invalid),encoding='utf-8')
            with self.assertRaisesRegex(ValueError,'missing content'): prepare(path)
            invalid=copy.deepcopy(catalog)
            invalid['entries'][0]['id']=invalid['entries'][1]['id']
            (path/'catalog.json').write_text(json.dumps(invalid),encoding='utf-8')
            with self.assertRaises(ValueError): prepare(path)

    def test_import_rejects_unreviewed_and_preserves_existing_order(self):
        catalog={'total':2,'entries':[{'id':'a','expression':'old','status':'ready'},
                                    {'id':'b','expression':'new','status':'pending'}]}
        order=['a']
        batch={'b':{'expression':'new','meaning':'yeni','example':'This bag is new.',
                    'translation':'Bu çanta yeni.','reviewed':False}}
        before=copy.deepcopy(catalog)
        with self.assertRaisesRegex(ValueError,'Review required'): accept(catalog,order,batch)
        self.assertEqual(catalog,before)
        self.assertEqual(order,['a'])
        batch['b']['reviewed']=True
        accept(catalog,order,batch)
        self.assertEqual(order,['a','b'])
        self.assertEqual(catalog['pending'],0)

if __name__=='__main__': unittest.main()

