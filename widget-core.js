/* Shared by the web preview and Scriptable. No network or device APIs here. */
(function(root) {
  const PERIOD = 2 * 60 * 60 * 1000;
  const EPOCH = Date.parse('2026-10-07T00:00:00+03:00');
  function validate(data) {
    if (!data || data.schema !== 1 || !Array.isArray(data.entries) || data.entries.length < 6) throw Error('Koleksiyon biçimi geçersiz.');
    const ids = new Set();
    for (const e of data.entries) {
      if (!e || !['id','expression','meaning','example','translation'].every(k => typeof e[k] === 'string' && e[k].trim())) throw Error('Eksik ifade içeriği.');
      if (ids.has(e.id)) throw Error('Tekrarlanan ifade kimliği.');
      ids.add(e.id);
    }
    return data;
  }
  function slot(time) { return Math.floor((time - EPOCH) / PERIOD); }
  function selection(data, time) {
    const n = data.entries.length, bucket = Math.max(0, slot(time));
    const start = (bucket * 6) % n;
    return { bucket, start, entries: Array.from({length:6},(_,i)=>data.entries[(start+i)%n]),
      next: EPOCH + (bucket + 1) * PERIOD };
  }
  const api = { PERIOD, EPOCH, validate, slot, selection };
  if (typeof module !== 'undefined') module.exports = api;
  else root.IfadeCore = api;
})(this);
