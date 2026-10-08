// Built into Ifade.js together with widget-core.js. Only reads the public
// collection and its own local cache; never runs code downloaded from the web.
const Core = module.exports;
const BASE = 'https://kuurtali.github.io/uc-ifade/';
const fm = FileManager.local();
const cachePath = fm.joinPath(fm.documentsDirectory(), 'ifade-collection-v1.json');
let offline = false;
async function collection() {
  let cached = null;
  try { if (fm.fileExists(cachePath)) cached = JSON.parse(fm.readString(cachePath)); Core.validate(cached && cached.data); }
  catch (_) { cached = null; }
  if (cached && Date.now() - cached.savedAt < 24*60*60*1000) return cached.data;
  try {
    const req = new Request(BASE + 'widget-data.json?day=' + Math.floor(Date.now()/86400000));
    req.timeoutInterval = 20;
    const data = Core.validate(await req.loadJSON());
    fm.writeString(cachePath, JSON.stringify({savedAt:Date.now(),data}));
    return data;
  } catch (err) {
    if (cached) { offline = true; return cached.data; }
    throw Error('İlk kurulum için internet gerekiyor. Scriptable içinde bir kez çalıştır.');
  }
}
function text(parent, value, size, color, bold=false, lines=2) {
  const t=parent.addText(value); t.font=bold?Font.semiboldSystemFont(size):Font.systemFont(size);
  t.textColor=new Color(color); t.lineLimit=lines; t.minimumScaleFactor=0.8; return t;
}
function entry(parent,e,width,compact) {
  const cell=parent.addStack(); cell.layoutVertically(); cell.size=new Size(width,0);
  cell.url=BASE+'?entry='+encodeURIComponent(e.id);
  text(cell,e.expression,compact?13:12,'edcf83',true,2);
  text(cell,e.meaning,10,'e3d8ed',false,2);
  cell.addSpacer(2);
  text(cell,e.example,10,'ffffff',false,3);
  text(cell,e.translation,9,'c5b8d0',false,3);
  return cell;
}
async function main() {
  const data=await collection(), now=Date.now(), selected=Core.selection(data,now);
  const widget=new ListWidget(); widget.backgroundColor=new Color('1c1129');
  widget.setPadding(12,12,12,12); widget.url=BASE;
  widget.refreshAfterDate=new Date(selected.next);
  const family=config.widgetFamily || 'large';
  if (family.startsWith('accessory')) {
    widget.setPadding(0,0,0,0);
    const offset=Math.max(0,Math.min(5,parseInt(args.widgetParameter || '0',10)||0));
    const e=selected.entries[offset];
    text(widget,e.expression+' · '+e.meaning,12,'ffffff',true,2);
    if(family==='accessoryRectangular') text(widget,e.example,10,'ffffff',false,2);
    widget.url=BASE+'?entry='+encodeURIComponent(e.id);
  } else {
    const header=widget.addStack(); header.layoutHorizontally();
    text(header,'İFADE',10,'edcf83',true,1); header.addSpacer();
    text(header,(offline?'Çevrimdışı · ':'')+data.entries.length+' ifade',9,'bcb0c9',false,1);
    widget.addSpacer(8);
    if(family==='large' || family==='extraLarge') {
      for(let row=0;row<3;row++) {
        const line=widget.addStack(); line.layoutHorizontally();
        entry(line,selected.entries[row*2],160,false); line.addSpacer(12);
        entry(line,selected.entries[row*2+1],160,false);
        if(row<2) widget.addSpacer();
      }
    } else if (family==='medium') {
      const line=widget.addStack();line.layoutHorizontally();
      entry(line,selected.entries[0],160,true);line.addSpacer(12);entry(line,selected.entries[1],160,true);
    } else entry(widget,selected.entries[0],0,true);
  }
  Script.setWidget(widget);
  if(!config.runsInWidget) await widget.presentLarge();
}
try { await main(); }
catch(err) {
  const w=new ListWidget();w.backgroundColor=new Color('1c1129');
  text(w,'İfade',16,'edcf83',true);text(w,String(err.message||err),12,'ffffff',false,6);
  w.url=BASE;w.refreshAfterDate=new Date(Date.now()+15*60000);Script.setWidget(w);
  if(!config.runsInWidget) await w.presentLarge();
}
Script.complete();
