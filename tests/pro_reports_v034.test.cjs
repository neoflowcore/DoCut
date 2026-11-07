const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../assets/core.js');
require('../assets/story_player.js');
require('../assets/core_enhanced.js');
require('../assets/effect_catalog.js');
require('../assets/pro_reports.js');
const P=global.DocutProReports;
const geo=pg=>pg.elements.map(e=>[e.type,Math.round(e.x),Math.round(e.y),Math.round(e.w),Math.round(e.h)].join('/')).join('|');
test('Twenty independent visual systems have genuinely different page silhouettes',()=>{
 assert.equal(P.PACKS.length,20);
 assert.equal(new Set(P.PACKS.map(p=>p.designSystem)).size,20);
 assert.equal(new Set(P.PACKS.map(p=>geo(P.buildPage(p.id,0)))).size,20);
 assert.notEqual(geo(P.buildPage('STR-04',0)),geo(P.buildPage('EARN-06',0)),'Deloitte and Meta must not share the same layout');
});
test('All 120 pages are separate layouts, not 20 repainted 6-page templates',()=>{
 const sigs=[];
 for(const p of P.PACKS){
   const pack=P.buildPack(p.id);
   assert.equal(pack.length,6,p.company);
   assert.equal(new Set(pack.map(x=>geo(x))).size,6,p.company);
   for(const pg of pack){
    sigs.push(geo(pg));assert.ok(pg.elements.length>=6, p.company);
    assert.ok(pg.elements.every(x=>x.x>=0&&x.y>=0&&x.w>0&&x.h>0&&x.x+x.w<=1280&&x.y+x.h<=720),p.company);
    assert.ok(pg.elements.every(x=>!x.source&&!x.verified&&!x.locked),p.company);
    for(const x of pg.elements){if(['bar','line','donut'].includes(x.type))assert.ok(x.data.values.every(v=>v===0));if(x.type==='kpi')assert.ok(x.text.startsWith('—'));}
   }
 }
 assert.equal(new Set(sigs).size,120);
});
test('Palette changes preserve layout architecture and keep the source content empty',()=>{
 for(const p of P.PACKS){
  const a=P.buildPage(p.id,0,'original'),b=P.buildPage(p.id,0,'wood');
  assert.equal(geo(a),geo(b));
  assert.equal(a.elements.length,b.elements.length);
  assert.notEqual(a.background,b.background);
 }
});
test('Padlock is accessible directly on the canvas and locked objects remain selectable',()=>{
 const fs=require('node:fs');const app=fs.readFileSync(require.resolve('../assets/app.js'),'utf8');const css=fs.readFileSync(require.resolve('../assets/styles.css'),'utf8');
 assert.match(app,/canvas-lock-toggle/);
 assert.match(app,/if\(el\.locked\)\{selectElement\(id\);return;\}/);
 assert.match(app,/data-lock-id/);
 assert.match(css,/\.canvas-lock-toggle\.is-locked/);
 assert.match(app,/잠금 해제/);
});
