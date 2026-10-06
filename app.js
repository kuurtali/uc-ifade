'use strict';
const manifest = window.CARD_MANIFEST;
const $ = id => document.getElementById(id);
let active = 0;
const remembered = Number(localStorage.getItem('uc-ifade-preview') || 0);
if (Number.isInteger(remembered) && remembered >= 0 && remembered < manifest.count) active = remembered;
for (const card of manifest.cards) {
  const option = document.createElement('option');
  option.value = card.id - 1; option.textContent = String(card.id).padStart(2, '0');
  $('card-select').append(option);
}
$('total').textContent = '/ ' + manifest.count;
function element(tag, text, cls) {
  const el = document.createElement(tag); el.textContent = text; if (cls) el.className = cls; return el;
}
function render() {
  const card = manifest.cards[active];
  $('wallpaper').src = card.image;
  $('wallpaper').alt = card.entries.map(e => `${e.expression}: ${e.meaning}. ${e.example} ${e.translation}`).join(' / ');
  $('download').href = card.image;
  $('download').download = `uc-ifade-${String(card.id).padStart(4,'0')}.jpg`;
  $('card-select').value = active;
  $('previous').disabled = active === 0; $('next').disabled = active === manifest.count - 1;
  $('entries').replaceChildren();
  for (const e of card.entries) {
    const article = element('article', '', 'entry');
    article.append(element('small', `${e.level} · ${e.kind} · ${e.source}`), element('h3', e.expression),
      element('p', e.meaning, 'meaning'), element('p', e.example, 'example'), element('p', e.translation, 'translation'));
    if (e.note) article.append(element('p', e.note, 'note'));
    $('entries').append(article);
  }
  $('status').textContent = '';
  localStorage.setItem('uc-ifade-preview', active);
}
$('previous').addEventListener('click', () => {if(active > 0){active--;render();}});
$('next').addEventListener('click', () => {if(active < manifest.count-1){active++;render();}});
$('card-select').addEventListener('change', e => {active = Number(e.target.value);render();});
$('copy').addEventListener('click', async () => {
  const url = new URL(manifest.cards[active].image, location.href).href;
  if (location.protocol === 'file:') { $('status').textContent = 'Paylaşılabilir bağlantı GitHub Pages yayını açılınca hazır olacak.'; return; }
  try {await navigator.clipboard.writeText(url);$('status').textContent = 'Görsel bağlantısı kopyalandı.';}
  catch { $('status').textContent = url; }
});
render();
