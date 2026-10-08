'use strict';
let data,offset=0,limit=24,timer,scriptCode='';
const $=s=>document.querySelector(s), format=n=>n.toLocaleString('tr-TR');
const el=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;return n};
const time=t=>new Intl.DateTimeFormat('tr-TR',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Istanbul'}).format(t);
function openEntry(id,push=true){
 const e=data.entries.find(x=>x.id===id);if(!e)return;
 const body=$('#detail-body');body.replaceChildren(el('p','source',e.source+' · '+e.level),el('h2','',e.expression),el('p','meaning',e.meaning),el('p','example',e.example),el('p','translation',e.translation));
 const src=el('a','source','Oxford listesi · sayfa '+e.sourcePage+' ↗');src.href=e.sourceUrl+'#page='+e.sourcePage;body.append(src);
 const attribution=el('p','attribution',e.attribution || 'Örnek ve çeviri bu proje için yazıldı.');
 if(e.attribution){const ids=[...e.attribution.matchAll(/#(\d+)/g)].map(m=>m[1]);ids.forEach((id,i)=>{attribution.append(document.createTextNode(' · '));const a=el('a','',i===0?'İngilizce kaynak':'Türkçe kaynak');a.href='https://tatoeba.org/en/sentences/show/'+id;attribution.append(a)});}
 body.append(attribution);if(!$('#detail').open)$('#detail').showModal();if(push)history.replaceState(null,'','?entry='+encodeURIComponent(id));
}
function paint(){
 if(!data)return;const selected=IfadeCore.selection(data,Date.now()+offset*IfadeCore.PERIOD);
 $('#widget-count').textContent=format(data.entries.length)+' ifade';$('#count').textContent=format(data.entries.length);
 $('#slot-time').textContent=time(selected.next-IfadeCore.PERIOD)+'–'+time(selected.next);
 const nodes=selected.entries.map(e=>{const a=el('a','mini-card');a.href='?entry='+e.id;a.append(el('h3','',e.expression),el('p','meaning',e.meaning),el('p','example',e.example),el('p','translation',e.translation));a.addEventListener('click',ev=>{ev.preventDefault();openEntry(e.id)});return a});
 $('#current-six').replaceChildren(...nodes);$('#now').textContent=offset===0?'Şu anki grup':(offset>0?'+':'')+offset+' grup · Şimdiye dön';
 clearTimeout(timer);const current=IfadeCore.selection(data,Date.now());timer=setTimeout(paint,Math.max(100,current.next-Date.now()+50));
}
function search(){
 if(!data)return;const q=$('#search').value.trim().toLocaleLowerCase('tr-TR');
 const found=data.entries.filter(e=>(e.expression+' '+e.meaning).toLocaleLowerCase('tr-TR').includes(q));
 $('#search-status').textContent=format(found.length)+' kayıt'+(q?' bulundu':' · tümünde anlam ve çevirili örnek');
 $('#results').replaceChildren(...found.slice(0,limit).map(e=>{const b=el('button','result');b.append(el('span','tag',e.level+' · '+(e.kind==='phrase'?'KALIP':'KELİME')),el('h3','',e.expression),el('p','',e.meaning));b.addEventListener('click',()=>openEntry(e.id));return b}));
 $('#more').hidden=limit>=found.length;
}
$('#prev').onclick=()=>{offset--;paint()};$('#next').onclick=()=>{offset++;paint()};$('#now').onclick=()=>{offset=0;paint()};
$('#search').addEventListener('input',()=>{limit=24;search()});$('#more').onclick=()=>{limit+=24;search()};
$('#detail .close').onclick=()=>$('#detail').close();$('#detail').addEventListener('close',()=>history.replaceState(null,'',location.pathname+location.hash));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)paint()});
const scriptReady=fetch('Ifade.js?v=full-v1').then(r=>{if(!r.ok)throw Error();return r.text()}).then(s=>{scriptCode=s;$('#script-text').value=s}).catch(()=>{$('#copy-status').textContent='Kod yüklenemedi. İnternet bağlantını kontrol edip sayfayı yenile.'});
$('#copy-script').onclick=async()=>{if(!scriptCode){$('#copy-status').textContent='Kod henüz yüklenmedi. Birkaç saniye sonra tekrar dokun.';return;}try{await navigator.clipboard.writeText(scriptCode);$('#copy-status').textContent='Kopyalandı. Scriptable’da + ile yeni açıp boş alana yapıştır.'}catch(_){$('#manual-copy').open=true;$('#script-text').focus();$('#script-text').select();$('#copy-status').textContent='Aşağıdaki hazır metnin tümünü seçip kopyala.'}};
fetch('collection.json?v=review-1801').then(r=>{if(!r.ok)throw Error('Koleksiyon yüklenemedi');return r.json()}).then(d=>{data=IfadeCore.validate(d);paint();search();const id=new URLSearchParams(location.search).get('entry');if(id)openEntry(id,false)}).catch(err=>{$('#current-six').replaceChildren(el('p','error',err.message+'. Sayfayı yeniden yükle.'));$('#widget-count').textContent='Bağlantı bekleniyor'});
