// İfade v2 · Two examples per entry
/* Shared selection logic; accepts only the complete two-example format. */
(function(root) {
  'use strict';
  const PERIOD = 2 * 60 * 60 * 1000;
  const EPOCH = Date.parse('2026-10-07T00:00:00+03:00');
  const validText = v => typeof v === 'string' && v.trim().length > 0;
  function validate(data) {
    if (!data || data.schema !== 2 || data.periodHours !== 2 || !validText(data.version) ||
        !Array.isArray(data.entries) || data.entries.length < 6) throw Error('İki örnekli koleksiyon biçimi geçersiz.');
    const ids = new Set();
    for (const e of data.entries) {
      if (!e || !validText(e.id) || !validText(e.expression) || ids.has(e.id)) throw Error('İfade kimliği eksik veya tekrarlanıyor.');
      if (!Array.isArray(e.examples) || e.examples.length !== 2 ||
          e.examples.some(s => !s || !['meaning','example','translation'].every(k => validText(s[k])))) throw Error('Her ifadede iki tam örnek bulunmalı.');
      if (e.examples[0].example.trim().toLowerCase() === e.examples[1].example.trim().toLowerCase()) throw Error('Örnekler birbirinden farklı olmalı.');
      if (!['same-sense','different-sense'].includes(e.examples[1].relation)) throw Error('İkinci örneğin anlam ilişkisi eksik.');
      ids.add(e.id);
    }
    if (data.aliases && Object.entries(data.aliases).some(([from,to]) => ids.has(from) || !ids.has(to) || from===to)) throw Error('Eski bağlantı eşlemesi geçersiz.');
    return data;
  }
  function slot(time) {
    if (!Number.isFinite(time)) throw Error('Tarih geçersiz.');
    return Math.max(0,Math.floor((time-EPOCH)/PERIOD));
  }
  function selection(data,time) {
    const bucket=slot(time), start=(bucket*6)%data.entries.length;
    return {bucket,start,entries:Array.from({length:6},(_,i)=>data.entries[(start+i)%data.entries.length]),next:EPOCH+(bucket+1)*PERIOD};
  }
  function findEntry(data,id) {
    return data.entries.find(e=>e.id===(data.aliases?.[id] || id));
  }
  const api={PERIOD,EPOCH,validate,slot,selection,findEntry};
  if(typeof module!=='undefined')module.exports=api;else root.IfadeCore=api;
})(this);

// V2 has its own cache and endpoint. The installed V1 script keeps working.
const Core=module.exports;
const BASE='https://kuurtali.github.io/uc-ifade/';
const fm=FileManager.local();
const path=fm.joinPath(fm.documentsDirectory(),'ifade-collection-v2.json');
let offline=false;
async function loadCollection() {
  let cache=null;
  try {
    cache=JSON.parse(fm.readString(path));
    Core.validate(cache.data);
    if(!Number.isFinite(cache.savedAt))throw Error('Invalid cache date');
  } catch(_) {cache=null;}
  const age=cache?Date.now()-cache.savedAt:Infinity;
  if(cache && age>=0 && age<86400000)return cache.data;
  try {
    const request=new Request(BASE+'widget-data-v2.json?day='+Math.floor(Date.now()/86400000));
    request.timeoutInterval=20;
    const data=Core.validate(await request.loadJSON());
    fm.writeString(path,JSON.stringify({savedAt:Date.now(),data}));
    return data;
  } catch(_) {
    if(cache){offline=true;return cache.data;}
    throw Error('İlk yükleme için internet gerekiyor. Scriptable’da Phrases betiğini bir kez çalıştır.');
  }
}
function text(parent,value,size,color,bold=false,lines=0) {
  const t=parent.addText(value);
  t.font=bold?Font.semiboldSystemFont(size):Font.systemFont(size);
  t.textColor=new Color(color);t.lineLimit=lines;t.minimumScaleFactor=1;
  return t;
}
function example(parent,s,n) {
  text(parent,n+' · '+s.meaning,8.5,'d7c2eb',false);
  text(parent,s.example,9.5,'ffffff',false);
  text(parent,s.translation,8.5,'c9bdd3',false);
}
function entry(parent,e,width) {
  const cell=parent.addStack();cell.layoutVertically();cell.size=new Size(width,0);
  cell.url=BASE+'?entry='+encodeURIComponent(e.id);
  text(cell,e.expression,11,'edcf83',true);
  cell.addSpacer(2);
  example(cell,e.examples[0],1);
  cell.addSpacer(3);
  example(cell,e.examples[1],2);
  return cell;
}
async function main() {
  const data=await loadCollection(), chosen=Core.selection(data,Date.now());
  const w=new ListWidget();w.backgroundColor=new Color('1c1129');w.setPadding(12,12,12,12);
  w.url=BASE;w.refreshAfterDate=new Date(chosen.next);
  const family=config.widgetFamily||'large';
  if(family.startsWith('accessory')) {
    const i=Math.max(0,Math.min(5,parseInt(args.widgetParameter||'0',10)||0));
    const e=chosen.entries[i];w.setPadding(0,0,0,0);
    text(w,e.expression+' · '+e.examples[0].meaning,11,'ffffff',true,2);
    if(family==='accessoryRectangular')text(w,e.examples[0].example,9,'ffffff',false,2);
    w.url=BASE+'?entry='+encodeURIComponent(e.id);
  } else {
    const h=w.addStack();h.layoutHorizontally();text(h,'İFADE',9,'edcf83',true,1);h.addSpacer();
    text(h,(offline?'Çevrimdışı · ':'')+data.entries.length+' ifade',8,'bcb0c9',false,1);
    w.addSpacer(7);
    // Large: two columns, three rows. Every example and translation is rendered.
    const rows=(family==='large'||family==='extraLarge')?3:1;
    const columns=family==='small'?1:2;
    for(let row=0;row<rows;row++) {
      const line=w.addStack();line.layoutHorizontally();
      entry(line,chosen.entries[row*2],columns===2?165:0);
      if(columns===2){line.addSpacer(10);entry(line,chosen.entries[row*2+1],165);}
      if(row<rows-1)w.addSpacer();
    }
  }
  Script.setWidget(w);if(!config.runsInWidget)await w.presentLarge();
}
try {await main();}
catch(err) {
  const w=new ListWidget();w.backgroundColor=new Color('1c1129');w.setPadding(12,12,12,12);
  text(w,'İfade',16,'edcf83',true);text(w,String(err.message||err),11,'ffffff',false,6);
  w.url=BASE;w.refreshAfterDate=new Date(Date.now()+900000);Script.setWidget(w);
  if(!config.runsInWidget)await w.presentLarge();
}
Script.complete();
