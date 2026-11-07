'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../assets/core.js');require('../assets/core_enhanced.js');
const P=require('../assets/pro_reports.js');
const L=require('../assets/page_kits.js');

test('20 official-source-linked professional reference packs with distinct IDs and five families',()=>{
 assert.equal(P.PACKS.length,20);
 assert.equal(new Set(P.PACKS.map(x=>x.id)).size,20);
 assert.equal(new Set(P.PACKS.map(x=>x.family)).size,5);
 for(const p of P.PACKS){assert.match(p.source,/^https:\/\//);assert.equal(p.patterns.length,6);assert.equal(p.colors.bg.length,7);}
 assert.equal(L.BUILTINS.length,20,'legacy templates must remain available');
});
test('120 pages are valid, editable, no hard-coded figures, no original brand mark or logo',()=>{
 let count=0;
 for(const p of P.PACKS){
  const pages=P.buildPack(p.id);assert.equal(pages.length,6);
  for(let i=0;i<6;i++){
   const pg=pages[i];count++;
   assert.equal(pg.transition,'none');assert.equal(pg.customTab,true);assert.ok(pg.elements.length>=4);
   assert.equal(C.normalizeProject({pages:[pg],title:'sample'}).pages.length,1);
   const ids=new Set();
   for(const e of pg.elements){
    assert.ok(e.x>=0&&e.y>=0&&e.x+e.w<=1280&&e.y+e.h<=720,`${p.id}/${i}/${e.type}: ${e.x} ${e.y} ${e.w} ${e.h}`);
    assert.ok(!ids.has(e.id));ids.add(e.id);
    assert.equal(e.locked,false);assert.equal(e.hidden,false);assert.equal(e.verified,false);assert.equal(e.source,'');
    assert.ok(!e.data?.src);
    assert.deepEqual(e.effects,[]);
    if(['bar','line','donut'].includes(e.type))assert.ok(e.data.values.every(v=>v===0),p.id);
   }
   const wire=JSON.stringify(pg);
   assert.ok(!wire.includes(p.originalTitle));assert.ok(!wire.includes(p.company));assert.ok(!wire.includes(p.source));
   assert.ok(!wire.includes('https://'),'generated pages contain no external data URLs');
  }
 }
 assert.equal(count,120);
});
test('repeated pack insertions regenerate page and element identities',()=>{
 const a=P.buildPack('FIN-17'),b=P.buildPack('FIN-17');
 assert.notEqual(a[0].id,b[0].id);
 assert.notEqual(a[0].elements[0].id,b[0].elements[0].id);
 assert.equal(new Set([...a,...b].flatMap(x=>[x.id,...x.elements.map(e=>e.id)])).size,[...a,...b].flatMap(x=>[x.id,...x.elements.map(e=>e.id)]).length);
});
test('each pack has six purposeful layouts with at least three distinct element compositions',()=>{
 for(const p of P.PACKS){
  const pages=P.buildPack(p.id);const types=pages.map(x=>x.elements.map(e=>e.type).join(','));
  assert.ok(new Set(types).size>=3,p.id);
  assert.ok(pages.every(x=>x.elements.some(e=>e.type==='title')));
 }
});
test('palette override retains page semantics and valid geometry',()=>{
 const original=P.buildPage('STR-01',2),over=P.buildPage('STR-01',2,'wood');
 assert.deepEqual(original.elements.map(e=>[e.type,e.x,e.y,e.w,e.h,e.text]),over.elements.map(e=>[e.type,e.x,e.y,e.w,e.h,e.text]));
 assert.equal(original.elements.length,over.elements.length);
 assert.throws(()=>P.buildPack('unknown'),/Unknown/);
 assert.throws(()=>P.buildPage('STR-01',6),/존재하지/);
});
