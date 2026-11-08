'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../assets/core.js');
require('../assets/story_player.js');
require('../assets/core_enhanced.js');
require('../assets/branding.js');
const M=require('../assets/editorial_mckinsey.js');
const B=require('../assets/editorial_bcg.js');
const P=require('../assets/pro_reports.js');
const W=require('../assets/workbook.js');
require('../assets/analytics_engine.js');
const DM=require('../assets/data_motion.js');
const X=require('../assets/export.js');
const PACKS=[['STR-01','editorial-blue'],['STR-02','emerald-market']];
test('v0.42 two independently authored premium masters replace bundle-card templates',()=>{
 assert.equal(P.PACKS.length,20);
 for(const [id] of PACKS){
  const pages=P.buildPack(id);
  assert.equal(pages.length,6);
  assert.ok(pages.every(pg=>pg.elements.some(e=>e.type==='title')));
  assert.equal(new Set(pages.map(pg=>pg.elements.map(e=>e.type+':'+e.x+':'+e.w).join('|'))).size,6);
  assert.ok(pages.some(pg=>pg.elements.filter(e=>e.type==='shape').length>=8));
  pages.forEach((pg,i)=>{
   assert.equal(pg.transition,'none');
   assert.equal(pg.customTab,true);
   assert.ok(pg.elements.length>=9);
   assert.ok(pg.elements.length<=120);
   assert.doesNotThrow(()=>C.normalizeProject({title:'template',pages:[pg]}),id+' '+i);
   const known=new Set();
   for(const el of pg.elements){
    assert.ok(el.x>=0&&el.y>=0&&el.x+el.w<=1280&&el.y+el.h<=720,id+' '+i);
    assert.ok(!known.has(el.id));known.add(el.id);
    assert.equal(el.source,'');assert.equal(el.verified,false);
    assert.equal(el.locked,false);assert.equal(el.hidden,false);
    assert.deepEqual(el.effects,[]);
   }
  });
 }
 const a=P.buildPage('STR-01',0),b=P.buildPage('STR-02',0);
 assert.notEqual(a.background,b.background);
 assert.notEqual(a.elements.find(e=>e.type==='title').text,b.elements.find(e=>e.type==='title').text);
 assert.notDeepEqual(a.elements.map(e=>[e.type,e.x,e.y,e.w,e.h]),b.elements.map(e=>[e.type,e.x,e.y,e.w,e.h]));
});
test('palette overrides preserve geometry and semantics without source-image reuse',()=>{
 for(const [id] of PACKS)for(let page=0;page<6;page++){
  const original=P.buildPage(id,page),alternative=P.buildPage(id,page,'wood');
  const projection=pg=>pg.elements.map(e=>[e.type,e.x,e.y,e.w,e.h,e.text]);
  assert.deepEqual(projection(original),projection(alternative),id+' page '+page);
  assert.equal(original.elements.length,alternative.elements.length);
  const catalog=P.find(id);
  const serialized=JSON.stringify(original);
  assert.ok(!serialized.includes(catalog.company),id+' company');
  assert.ok(!serialized.includes(catalog.originalTitle),id+' title');
  assert.ok(!serialized.includes(catalog.source),id+' PDF URL');
  assert.ok(!serialized.includes('https://'),id+' asset URL');
 }
});
test('both masters retain user Excel numerical values, negative values and per-master chart style',()=>{
 for(const [id,palette] of PACKS){
  const pg=P.buildPack(id).find(x=>x.elements.some(e=>e.type==='bar'));
  const target=pg.elements.find(e=>e.type==='bar');
  assert.equal(target.data.palette,palette);
  assert.deepEqual(target.data.values,[0,0,0,0]);
  const data=DM.dataset(W.fromRows([['Area','Change'],['A',12],['B',-5],['C',0]],{id:'import-'+id,fileName:'analysis.xlsx'}));
  const spec=DM.binding({datasetId:data.id,sheetId:'1',range:'A1:B4',labelColumn:0,valueColumn:1,header:true});
  const linked=DM.materialize(target,data,spec);
  assert.deepEqual(linked.data.values,[12,-5,0]);
  assert.equal(linked.data.palette,palette);
  const project=C.createProject(3);project.pages=[pg];project.datasets=[data];
  project.pages[0].elements[pg.elements.indexOf(target)]=linked;
  const html=X.exportHTML(project);
  assert.ok(html.includes('chart-svg'),id);
  assert.ok(html.includes(palette),id);
  assert.ok(html.includes('analysis.xlsx'),id);
  assert.ok(html.includes('12,-5,0'),id);
 }
});
test('editorial masters preserve unique identities and safe standalone HTML',()=>{
 const first=P.buildPack('STR-01'),again=P.buildPack('STR-01');
 assert.notEqual(first[0].id,again[0].id);
 assert.notEqual(first[0].elements[0].id,again[0].elements[0].id);
 const project=C.createProject(6);project.pages=first;
 const out=X.exportHTML(project);
 assert.ok(out.startsWith('<!doctype html>'));
 assert.ok(out.includes('editorial-blue'));
 assert.ok(out.includes('</body></html>'));
 assert.ok(!out.includes('https://www.mckinsey.com/'));
 assert.ok(!out.includes('<img src="https://'));
});
