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
