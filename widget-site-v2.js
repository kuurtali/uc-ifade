'use strict';
let data,offset=0,limit=24,timer,scriptCode='';
const $=s=>document.querySelector(s), format=n=>n.toLocaleString('tr-TR');
const el=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;return n};
const time=t=>new Intl.DateTimeFormat('tr-TR',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Istanbul'}).format(t);
function sample(s,i){const node=el('div','sample');node.append(el('p','meaning',(i+1)+' · '+s.meaning),el('p','example',s.example),el('p','translation',s.translation));return node}
function openEntry(id,push=true){
 const e=IfadeCore.findEntry(data,id);if(!e)return;
 const body=$('#detail-body');body.replaceChildren(el('p','source',e.source+' · '+e.level),el('h2','',e.expression),...e.examples.map(sample));
 for(const source of e.sources||[e]){const link=el('a','source',source.source+' · sayfa '+source.sourcePage+' ↗');link.href=source.sourceUrl+'#page='+source.sourcePage;body.append(link)}
 body.append(el('p','attribution','İki örnek ve çevirileri bu proje için yazıldı. AI destekli dilsel inceleme; bağımsız insan doğrulaması değildir.'));
 const report=el('a','source','Düzeltme öner ↗');report.href='https://github.com/kuurtali/uc-ifade/issues/new?title='+encodeURIComponent('İçerik: '+e.expression)+'&body='+encodeURIComponent('Kayıt: '+e.id+'\nÖrnek: 1 / 2\nDüzeltme önerisi:\nGerekçe veya sözlük bağlantısı:\n');body.append(report);
 if(!$('#detail').open)$('#detail').showModal();if(push)history.replaceState(null,'','?entry='+encodeURIComponent(e.id));
}
function paint(){
 if(!data)return;const selected=IfadeCore.selection(data,Date.now()+offset*IfadeCore.PERIOD);
 $('#widget-count').textContent=format(data.entries.length)+' ifade';$('#count').textContent=format(data.entries.length);
 $('#slot-time').textContent=time(selected.next-IfadeCore.PERIOD)+'–'+time(selected.next);
 $('#current-six').replaceChildren(...selected.entries.map(e=>{const a=el('a','mini-card');a.href='?entry='+e.id;a.append(el('h3','',e.expression),...e.examples.map(sample));a.addEventListener('click',ev=>{ev.preventDefault();openEntry(e.id)});return a}));
 $('#now').textContent=offset===0?'Şu anki grup':(offset>0?'+':'')+offset+' grup · Şimdiye dön';
 clearTimeout(timer);const current=IfadeCore.selection(data,Date.now());timer=setTimeout(paint,Math.max(100,current.next-Date.now()+50));
}
function search(){
 if(!data)return;const q=$('#search').value.trim().toLocaleLowerCase('tr-TR');
 const found=data.entries.filter(e=>(e.expression+' '+e.examples.map(s=>s.meaning+' '+s.example+' '+s.translation).join(' ')).toLocaleLowerCase('tr-TR').includes(q));
 $('#search-status').textContent=format(found.length)+' kayıt'+(q?' bulundu':' · her birinde çevirili iki örnek');
 $('#results').replaceChildren(...found.slice(0,limit).map(e=>{const b=el('button','result');b.append(el('span','tag',e.level+' · '+(e.kind==='phrase'?'KALIP':'KELİME')),el('h3','',e.expression),el('p','',e.meaning));b.addEventListener('click',()=>openEntry(e.id));return b}));
 $('#more').hidden=limit>=found.length;
}
$('#prev').onclick=()=>{offset--;paint()};$('#next').onclick=()=>{offset++;paint()};$('#now').onclick=()=>{offset=0;paint()};
$('#search').addEventListener('input',()=>{limit=24;search()});$('#more').onclick=()=>{limit+=24;search()};
$('#detail .close').onclick=()=>$('#detail').close();$('#detail').addEventListener('close',()=>history.replaceState(null,'',location.pathname+location.hash));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)paint()});
fetch('Ifade-v2.js?v=20261010').then(r=>{if(!r.ok)throw Error();return r.text()}).then(s=>{scriptCode=s;$('#script-text').value=s}).catch(()=>{$('#copy-status').textContent='Kod yüklenemedi. Bağlantını kontrol edip sayfayı yenile.'});
$('#copy-script').onclick=async()=>{if(!scriptCode){$('#copy-status').textContent='Kod henüz yüklenmedi. Birkaç saniye sonra tekrar dokun.';return;}try{await navigator.clipboard.writeText(scriptCode);$('#copy-status').textContent='Kopyalandı. Mevcut Phrases/İfade betiğinin tamamını bununla değiştir veya yeni bir betiğe yapıştır.'}catch(_){$('#manual-copy').open=true;$('#script-text').focus();$('#script-text').select();$('#copy-status').textContent='Aşağıdaki metnin tümünü seçip kopyala.'}};
fetch('collection-v2.json?v=20261010').then(r=>{if(!r.ok)throw Error('Koleksiyon yüklenemedi');return r.json()}).then(d=>{data=IfadeCore.validate(d);paint();search();const id=new URLSearchParams(location.search).get('entry');if(id)openEntry(id,false)}).catch(err=>{$('#current-six').replaceChildren(el('p','error',err.message+'. Sayfayı yeniden yükle.'));$('#widget-count').textContent='Bağlantı bekleniyor'});
