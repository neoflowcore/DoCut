'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../assets/core.js');
require('../assets/story_player.js');
require('../assets/core_enhanced.js');
require('../assets/branding.js');
require('../assets/editorial_mckinsey.js');
require('../assets/editorial_bcg.js');
require('../assets/reference_identity_core.js');
require('../assets/refpack_03_bain.js');
const P=require('../assets/pro_reports.js');
const W=require('../assets/workbook.js');
require('../assets/analytics_engine.js');
require('../assets/data_motion.js');
require('../assets/large_dataset.js');
const S=require('../assets/chart_slot_mapper.js');
const T=require('../assets/template_data_mapper.js');
const L=require('../assets/layer_ops.js');

const source=()=>W.fromRows([['Period','투자 거래액','회수액'],['Q1',12,3],['Q2',-8,6]],{id:'record',fileName:'metrics.xlsx'});
const twoPacks=()=>{
 const p=C.createProject(1);p.pages=[...P.buildPack('STR-03'),...P.buildPack('STR-03')];return p;
};
const linked=(pages)=>pages.flatMap(pg=>pg.elements.filter(el=>el.dataBinding));
test('two identical professional report packs carry separate persistent IDs',()=>{
 const project=twoPacks(),first=project.pages[0].designPackId,second=project.pages[6].designPackId;
 assert.ok(first&&second&&first!==second);
 assert.ok(project.pages.slice(0,6).every(pg=>pg.designPackId===first));
 assert.ok(project.pages.slice(6).every(pg=>pg.designPackId===second));
 const roundTrip=C.normalizeProject(JSON.parse(JSON.stringify(project)));
 assert.equal(roundTrip.pages[0].designPackId,first);
 assert.equal(roundTrip.pages[6].designPackId,second);
});
test('only the selected 6-page report is rebound, with no changes to the neighboring pack',()=>{
 const p=twoPacks(),packId=p.pages[6].designPackId;
 const before=JSON.stringify(p);
 const plan=T.plan(p,source(),{designIdentity:'STR-03',packInstanceId:packId,sheetId:'1',range:'A1:C3'});
 assert.equal(plan.updates.length,2);
 const after=T.apply(p,plan);
 assert.equal(linked(after.pages.slice(0,6)).length,0);
 assert.equal(linked(after.pages.slice(6)).length,2);
 assert.equal(JSON.stringify(p),before,'no mutation of original project');
 assert.deepEqual(linked(after.pages.slice(6)).map(e=>e.data.values),[[12,-8],[3,6]]);
});
test('ambiguous source pack selection is rejected instead of updating every matching company',()=>{
 const p=twoPacks(),copy=JSON.stringify(p);
 assert.throws(()=>T.plan(p,source(),{designIdentity:'STR-03',sheetId:'1',range:'A1:C3'}),/묶음이 여럿/);
 assert.equal(JSON.stringify(p),copy);
});
test('legacy 12-page reports without pack IDs are scoped to six contiguous pages from current selection',()=>{
 const p=twoPacks();p.pages.forEach(page=>{delete page.designPackId;});
 assert.throws(()=>T.plan(p,source(),{designIdentity:'STR-03',sheetId:'1',range:'A1:C3'}),/현재 작업할 페이지/);
 const plan=T.plan(p,source(),{designIdentity:'STR-03',currentPageId:p.pages[7].id,sheetId:'1',range:'A1:C3'});
 const after=T.apply(p,plan);
 assert.equal(linked(after.pages.slice(0,6)).length,0);
 assert.equal(linked(after.pages.slice(6)).length,2);
});
test('page duplication creates a new isolated pack identity and keeps authored editability',()=>{
 const p=P.buildPack('STR-03'),first=p[2],next=L.duplicatePage(first,C.uid);
 assert.ok(next.designPackId!==first.designPackId);
 assert.equal(next.designIdentity,first.designIdentity);
 assert.ok(next.elements.some(e=>e.templateSlot===true));
 assert.equal(next.elements.length,first.elements.length);
});
test('duplicating an element does not make it eligible for surprise automatic Excel binding',()=>{
 const page=P.buildPage('STR-03',2),slots=S.list(page);
 assert.ok(slots.length>=1);
 const src=page.elements.find(e=>e.id===slots[0].id);
 const doubled=L.duplicate(page.elements,[src.id],C.uid);
 assert.equal(doubled.added.length,1);
 assert.equal(doubled.added[0].templateSlot,false);
 const all=S.list({...page,elements:doubled.elements});
 assert.ok(all.some(e=>e.id===src.id));
 assert.ok(!all.some(e=>e.id===doubled.added[0].id));
});
test('BCG chart style and design identity survive JSON reload just like McKinsey',()=>{
 for(const identity of ['STR-01','STR-02']){
  const pack=P.buildPack(identity),result=C.normalizeProject({title:'test',pages:pack});
  for(const pg of result.pages){assert.equal(pg.designIdentity,identity);assert.equal(pg.designPackId,result.pages[0].designPackId);}
 }
});
