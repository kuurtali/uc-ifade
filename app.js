'use strict';
const manifest = window.CARD_MANIFEST;
const $ = id => document.getElementById(id);
let active = 0;
let theme = manifest.defaultTheme || 'purple';
try { const saved=localStorage.getItem('uc-ifade-theme-six'); if(manifest.themes?.[saved]) theme=saved; } catch {}
for (const [value,label] of Object.entries(manifest.themes || {black:'Siyah'})) {
  const option=document.createElement('option'); option.value=value; option.textContent=label;
  $('theme-select').append(option);
}
function cardImage(card) { return card.images?.[theme] || card.image; }
let remembered = 0;
try { remembered = Number(localStorage.getItem('uc-ifade-preview-six') || 0); } catch {}
if (Number.isInteger(remembered) && remembered >= 0 && remembered < manifest.count) active = remembered;
for (const card of manifest.cards) {
  const option = document.createElement('option');
  option.value = card.id - 1; option.textContent = String(card.id).padStart(2, '0');
  $('card-select').append(option);
}
$('total').textContent = '/ ' + manifest.count;
const formatNumber = n => n.toLocaleString('tr-TR');
$('collection-title').textContent = `${formatNumber(manifest.catalogTotal)} kaynak girdisi · ${formatNumber(manifest.readyExpressions)} hazır ifade`;
$('collection-status').textContent = manifest.complete
  ? `Bütün koleksiyon hazır. Günde ${manifest.expressionsPerCard * manifest.hours.length} ifadeyle bir tur yaklaşık ${Math.ceil(manifest.count / 15)} gün sürer.`
  : `${formatNumber(manifest.pendingExpressions)} ifadenin anlam ve örnekleri hazırlanacak. Şu anda ${manifest.count} altılı kart kullanılabilir. 6.000 hedefi için ayrıca ${formatNumber(manifest.additionalExpressionsNeeded || 0)} ek girdi gerekiyor.`;
function element(tag, text, cls) {
  const el = document.createElement(tag); el.textContent = text; if (cls) el.className = cls; return el;
}
function render() {
  const card = manifest.cards[active];
  if (!card) {
    $('previous').disabled = $('next').disabled = $('copy').disabled = true;
    $('download').removeAttribute('href');
    $('status').textContent = 'Henüz tamamlanmış üçlü kart bulunmuyor.';
    return;
  }
  $('theme-select').value = theme;
  $('wallpaper').src = cardImage(card);
  $('wallpaper').alt = card.entries.map(e => `${e.expression}: ${e.meaning}. ${e.example} ${e.translation}`).join(' / ');
  $('download').href = cardImage(card);
  $('download').download = `uc-ifade-${theme}-${String(card.id).padStart(4,'0')}.jpg`;
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
  try { localStorage.setItem('uc-ifade-preview-six', active); } catch {}
}
$('previous').addEventListener('click', () => {if(active > 0){active--;render();}});
$('next').addEventListener('click', () => {if(active < manifest.count-1){active++;render();}});
$('card-select').addEventListener('change', e => {active = Number(e.target.value);render();});
$('theme-select').addEventListener('change',e=>{
  theme=e.target.value;
  try {localStorage.setItem('uc-ifade-theme-six',theme);} catch {}
  render();
});
$('copy').addEventListener('click', async () => {
  const url = new URL(cardImage(manifest.cards[active]), location.href).href;
  if (location.protocol === 'file:') { $('status').textContent = 'Paylaşılabilir bağlantı GitHub Pages yayını açılınca hazır olacak.'; return; }
  try {await navigator.clipboard.writeText(url);$('status').textContent = 'Görsel bağlantısı kopyalandı.';}
  catch { $('status').textContent = url; }
});
render();

// Load the source catalogue only on demand; paint 24 results at a time.
let catalogEntries = null;
let catalogLoading = null;
let visibleCount = 24;
async function loadCatalog() {
  if (catalogEntries) return;
  if (catalogLoading) return catalogLoading;
  $('load-catalog').disabled = true;
  $('catalog-status').textContent = 'Kaynak listeler yükleniyor…';
  catalogLoading = (async () => {
    try {
      const response = await fetch('catalog.json');
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      if (!Array.isArray(data.entries)) throw new Error('Invalid catalogue');
      catalogEntries = data.entries;
      $('load-catalog').hidden = true;
      renderCatalog();
    } catch {
      $('catalog-status').textContent = 'Liste yüklenemedi. İnternet bağlantını kontrol edip yeniden dene.';
      $('load-catalog').disabled = false;
    } finally { catalogLoading = null; }
  })();
  return catalogLoading;
}
function renderCatalog() {
  if (!catalogEntries) return;
  const query = $('search').value.trim().toLocaleLowerCase('tr-TR');
  const source = $('source-filter').value, level = $('level-filter').value, status = $('ready-filter').value;
  const results = catalogEntries.filter(e => (!source || e.source === source) && (!level || e.level === level) &&
    (!status || e.status === status) && (!query || [e.expression, e.displayExpression, e.meaning, ...e.variants].filter(Boolean).join(' ').toLocaleLowerCase('tr-TR').includes(query)));
  $('catalog-entries').replaceChildren();
  for (const e of results.slice(0, visibleCount)) {
    const article = element('article', '', 'entry catalog-entry');
    article.append(element('small', `${e.level} · ${e.source}`), element('h3', e.displayExpression || e.expression));
    if (e.status === 'ready') {
      article.append(element('p', e.meaning, 'meaning'), element('p', e.example, 'example'), element('p', e.translation, 'translation'));
    } else article.append(element('p', 'Anlamı ve örneği hazırlanıyor', 'pending-label'));
    const link = element('a', `Kaynak PDF · s. ${e.sourcePage}`, 'source-link');
    link.href = e.sourceUrl + '#page=' + e.sourcePage;
    link.target = '_blank'; link.rel = 'noopener';
    article.append(link);
    $('catalog-entries').append(article);
  }
  $('catalog-status').textContent = `${formatNumber(results.length)} sonuç · ${formatNumber(Math.min(visibleCount, results.length))} gösteriliyor`;
  $('more-catalog').hidden = visibleCount >= results.length;
}
$('load-catalog').addEventListener('click', loadCatalog);
$('more-catalog').addEventListener('click', () => {visibleCount += 24; renderCatalog();});
for (const id of ['search', 'source-filter', 'level-filter', 'ready-filter']) {
  $(id).addEventListener(id === 'search' ? 'input' : 'change', async () => {
    visibleCount = 24; await loadCatalog(); renderCatalog();
  });
}
