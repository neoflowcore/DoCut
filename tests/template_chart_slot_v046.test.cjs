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
require('../assets/refpack_04_deloitte.js');
require('../assets/refpack_05_accenture.js');
require('../assets/refpack_06_meta.js');
require('../assets/refpack_07_alphabet.js');
require('../assets/refpack_08_microsoft.js');
require('../assets/refpack_09_apple.js');
require('../assets/refpack_10_nvidia.js');
require('../assets/refpack_11_tesla.js');
require('../assets/refpack_12_netflix.js');
require('../assets/refpack_13_amazon.js');
require('../assets/refpack_14_goldman.js');
require('../assets/refpack_15_jpmorgan.js');
require('../assets/refpack_17_blackrock.js');
require('../assets/refpack_18_wef.js');
require('../assets/refpack_19_imf.js');
require('../assets/refpack_20_worldbank.js');
const P=require('../assets/pro_reports.js');
const S=require('../assets/chart_slot_mapper.js');
const W=require('../assets/workbook.js');
require('../assets/analytics_engine.js');
const DM=require('../assets/data_motion.js');
const M=require('../assets/large_dataset.js');
const X=require('../assets/export.js');

test('all 19 native independent company packs retain their identity and authored chart tags after JSON normalization',()=>{
 assert.equal(P.PACKS.length,20);
 let pageCount=0,slotCount=0;
 for(const identity of P.PACKS.filter(p=>p.id!=='FIN-16')){
  const pages=P.buildPack(identity.id);
  assert.equal(pages.length,6,identity.id);
  for(const page of pages){
   pageCount++;
   const restored=C.normalizeProject({title:'Portfolio',pages:[page]}).pages[0];
   assert.equal(restored.designIdentity,identity.id,identity.id+' '+page.tab);
   const raw=page.elements.filter(e=>['bar','line','donut'].includes(e.type)&&!e.dataBinding);
   const slots=S.list(restored);
   assert.equal(slots.length,raw.length,identity.id+'/'+page.tab);
   for(const {id} of slots){
    const el=restored.elements.find(e=>e.id===id);
    assert.equal(el.templateSlot,true);
    assert.deepEqual(el.data.values,[0,0,0,0]);
   }
   slotCount+=slots.length;
  }
 }
 assert.equal(pageCount,114);
 assert.ok(slotCount>=20,'Each authored chart should be discoverable');
});
test('single authored line or donut slot is chosen even when spreadsheet heuristics suggest bar',()=>{
 const line=P.buildPage('EARN-10',3),slot=S.choose(line,'bar');
 assert.equal(slot.type,'line');
 const donut=P.buildPage('FIN-17',4),other=S.choose(donut,'bar');
 assert.equal(other.type,'donut');
});
test('never auto-select a handmade, verified, locked, hidden or already linked chart',()=>{
 const page=P.buildPage('EARN-10',3),orig=S.choose(page,'line');
 const manual=C.normalizeBlock(C.makeBlock('bar',80,250,{w:300,h:240,data:{labels:['A','B'],values:[0,0],palette:'default'}}));
 page.elements.push(manual);
 assert.ok(!S.list(page).some(x=>x.id===manual.id));
 const exists=page.elements.find(e=>e.id===orig.id);
 exists.locked=true;
 assert.equal(S.choose(page,'line'),null);
 exists.locked=false;exists.hidden=true;
 assert.equal(S.choose(page,'line'),null);
 exists.hidden=false;exists.dataBinding={datasetId:'x',sheetId:'1',range:'A1:B3',labelColumn:0,valueColumn:1,header:true};
 assert.equal(S.choose(page,'line'),null);
});
test('preserve the authored chart id, exact position, theme and text while connecting actual numeric spreadsheet data',()=>{
 const page=P.buildPage('EARN-10',3),chosen=S.choose(page,'line');
 const old=page.elements.find(e=>e.id===chosen.id);
 const ds=DM.dataset(W.fromRows([['Year','Sales'],['2024',120],['2025',-50],['2026',0]],{id:'sales',fileName:'revenue.xlsx'}));
 const spec=DM.binding({datasetId:ds.id,sheetId:'1',range:'A1:B4',labelColumn:0,valueColumn:1,header:true});
 const bound=DM.materialize(old,ds,spec);
 assert.deepEqual([bound.id,bound.x,bound.y,bound.w,bound.h,bound.type],[old.id,old.x,old.y,old.w,old.h,'line']);
 assert.equal(bound.data.palette,old.data.palette);
 assert.deepEqual(bound.data.values,[120,-50,0]);
 const report=C.createProject(1);report.datasets=[ds];report.pages[0]=page;report.pages[0].elements[page.elements.indexOf(old)]=bound;
 const normalized=C.normalizeProject(report),serialized=JSON.stringify(normalized);
 const restored=C.normalizeProject(JSON.parse(serialized));
 const loaded=restored.pages[0].elements.find(e=>e.id===old.id);
 assert.equal(loaded.templateSlot,true);
 assert.equal(S.list(restored.pages[0]).some(x=>x.id===old.id),false,'Already-linked chart cannot be auto-replaced');
 assert.deepEqual(loaded.data.values,[120,-50,0]);
 assert.ok(X.exportHTML(restored).includes('revenue.xlsx'));
});
test('the preview dialog contains an explicit, non-destructive choice of template chart slot or new block',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const panel=fs.readFileSync(path.join(__dirname,'../assets/data_panel.js'),'utf8');
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const scripts=[...html.matchAll(/<script src="\.\/assets\/([^"]+)" defer><\/script>/g)].map(x=>x[1]);
 assert.ok(scripts.indexOf('chart_slot_mapper.js')>scripts.indexOf('pro_reports.js'));
 assert.ok(scripts.indexOf('chart_slot_mapper.js')<scripts.indexOf('data_panel.js'));
 assert.match(panel,/dataTargetSlot/);
 assert.match(panel,/SLOTS\.choose/);
 assert.match(panel,/selectedSlot\(\)/);
 assert.match(panel,/replaceId:target\?\.id\|\|null/);
 assert.match(panel,/if\(replace&&!target\)throw Error/);
});

test('new chart placement searches free report space before overlapping existing content',()=>{
 const crowded={elements:[
  C.normalizeBlock(C.makeBlock('title',55,95,{w:580,h:95,text:'Executive headline'})),
  C.normalizeBlock(C.makeBlock('text',55,235,{w:580,h:300,text:'Primary narrative'}))
 ]};
 const placement=S.place(crowded,{width:1280,height:720},{w:540,h:280});
 assert.ok(placement.clear,'right side should have a free region');
 assert.ok(placement.x>=580,'new chart must avoid the left-side editorial copy');
 assert.ok(placement.x+placement.w<=1280);
 assert.ok(placement.y+placement.h<=720);
 const full={elements:[C.normalizeBlock(C.makeBlock('text',0,0,{w:1280,h:720,text:'Existing content'}))]};
 const warning=S.place(full,{width:1280,height:720},{w:550,h:300});
 assert.equal(warning.clear,false);
 assert.ok(warning.overlapRatio>.02);
});
