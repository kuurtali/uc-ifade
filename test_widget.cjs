const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const core=require('./widget-core.js');
const fake={schema:1,entries:Array.from({length:5753},(_,i)=>({id:'e'+i,expression:'word '+i,meaning:'anlam',example:'This is a short example.',translation:'Bu kısa bir örnektir.'}))};
core.validate(fake);
const real=core.validate(JSON.parse(fs.readFileSync('widget-data.json','utf8')));
const full=JSON.parse(fs.readFileSync('collection.json','utf8'));
assert.equal(real.entries.length,5753);
assert.equal(full.entries.filter(e=>e.kind==='phrase').length,750);
assert.deepEqual(real.entries.map(e=>e.id),full.entries.map(e=>e.id));
for(const e of full.entries){
  assert(!Object.values(e).some(v=>typeof v==='string'&&v.includes('\ufffd')));
  if(e.attribution)assert(/#\d+/.test(e.attribution));
}
const out=[];for(let n=0;n<959;n++)out.push(...core.selection(fake,core.EPOCH+n*core.PERIOD).entries.map(e=>e.id));
assert.equal(new Set(out.slice(0,5753)).size,5753);assert.equal(out[5753],'e0');
assert.equal(core.selection(fake,core.EPOCH+core.PERIOD-1).start,0);
assert.equal(core.selection(fake,core.EPOCH+core.PERIOD).start,6);
assert.equal(core.selection(fake,Date.parse('2026-10-08T00:00:00+03:00')).start,72);
assert.throws(()=>core.validate({schema:1,entries:[...fake.entries.slice(0,6),fake.entries[0]]}));
const code=fs.readFileSync('widget-core.js','utf8')+'\n'+fs.readFileSync('widget-runtime.js','utf8');
function element(){return {children:[],addStack(){const e=element();this.children.push(e);return e},addText(value){const e={value};this.children.push(e);return e},addSpacer(){},layoutVertically(){},layoutHorizontally(){},setPadding(){},async presentLarge(){}}}
async function run({cached=null,network=true,family='large'}){
 let saved=cached?JSON.stringify(cached):null,calls=0,shown;
 const ctx={module:{exports:{}},config:{widgetFamily:family,runsInWidget:true},args:{widgetParameter:null},
   FileManager:{local:()=>({documentsDirectory:()=>'/data',joinPath:(a,b)=>a+'/'+b,fileExists:()=>saved!==null,readString:()=>saved,writeString:(p,s)=>saved=s})},
   Request:class {async loadJSON(){calls++;if(!network)throw Error('offline');return fake}},
   ListWidget:class {constructor(){Object.assign(this,element())}},Font:{semiboldSystemFont:n=>n,systemFont:n=>n},
   Color:class{constructor(x){this.hex=x}},Size:class{constructor(w,h){this.width=w;this.height=h}},
   Script:{setWidget:w=>shown=w,complete(){}},Date,Set,JSON,Error,parseInt,encodeURIComponent};
 await vm.runInNewContext('(async()=>{'+code+'})()',ctx);
 const strings=[];function walk(e){if(e.value)strings.push(e.value);for(const c of e.children||[])walk(c)}walk(shown);
 return {calls,strings,shown,saved};
}
(async()=>{
 const fresh=await run({});assert.equal(fresh.calls,1);assert.equal(fresh.strings.filter(t=>t.startsWith('word ')).length,6);
 const cached=await run({cached:{savedAt:Date.now(),data:fake},network:false});assert.equal(cached.calls,0);
 const offline=await run({cached:{savedAt:0,data:fake},network:false});assert.equal(offline.strings.filter(t=>t.startsWith('word ')).length,6);
 const broken=await run({network:false});assert(broken.strings.some(t=>t.includes('internet')));
 const lock=await run({family:'accessoryRectangular'});assert.equal(lock.strings.length,2);
 console.log('PASS: complete 5753-entry traversal, 2-hour boundaries, midnight, unique IDs, six items, fresh cache, offline fallback, first-run failure, lock-screen rendering.');
})().catch(e=>{console.error(e);process.exitCode=1});
