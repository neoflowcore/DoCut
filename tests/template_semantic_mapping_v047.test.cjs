'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const C=require('../assets/core.js');
require('../assets/story_player.js');
require('../assets/core_enhanced.js');
require('../assets/branding.js');
require('../assets/reference_identity_core.js');
require('../assets/refpack_03_bain.js');
require('../assets/refpack_10_nvidia.js');
require('../assets/refpack_17_blackrock.js');
require('../assets/pro_reports.js');
const P=globalThis.DocutProReports;
const W=require('../assets/workbook.js');
require('../assets/analytics_engine.js');
require('../assets/data_motion.js');
require('../assets/large_dataset.js');
const S=require('../assets/chart_slot_mapper.js');
const T=require('../assets/template_data_mapper.js');
const X=require('../assets/export.js');
function project(identity='STR-03'){
 const p=C.createProject(1);p.pages=P.buildPack(identity);return p;
}
function excel(rows,id='input'){return W.fromRows(rows,{id,fileName:id+'.xlsx'});}
function config(p,extra={}){
 return {designIdentity:p.pages[0].designIdentity,packInstanceId:p.pages[0].designPackId,sheetId:'1',range:'A1:C3',...extra};
}
test('single unrelated numeric column cannot be silently bound to the only available metric',()=>{
 const p=project(),source=excel([['Period','Temperature'],['Q1',25],['Q2',26]]);
 const preview=T.plan(p,source,config(p,{range:'A1:B3',previewOnly:true}));
 assert.equal(preview.suggestions.length,0);
 assert.equal(preview.skipped.length,2);
 assert.equal(preview.numericColumns.length,1);
 assert.throws(()=>T.plan(p,source,config(p,{range:'A1:B3'})),/명확하게 연결할 열 제목/);
 assert.ok(p.pages.every(pg=>pg.elements.every(el=>!el.dataBinding)));
});
test('compound title scoring distinguishes investment transactions from investment exit data',()=>{
 assert.ok(T.similarity('투자 거래','투자 거래액')>T.similarity('투자 거래','투자 회수액'));
 assert.equal(T.similarity('매출','매출원가'),0);
 assert.equal(T.similarity('매출','매출 원가'),0);
 assert.ok(T.similarity('매출','매출액')>0);
 assert.equal(T.similarity('회수','Return'),0);
});
test('precise bilingual expressions are explained but ambiguous general terms stay unbound',()=>{
 const cases=[['매출액','Revenue'],['영업비용','Operating Expenses'],['순이익','Net Income'],['이익률 추이','Margin'],['투자 거래','Investment'],['회수 추세','Exit']];
 for(const [a,b] of cases)assert.ok(T.evidence(a,b).score>=4,a+' vs '+b);
 for(const [a,b] of [['매출','Inflation'],['회수','Return'],['투자','Profit'],['이익률','Price']])
  assert.equal(T.similarity(a,b),0,a+' must reject '+b);
});
test('duplicate equally-matching Excel headers are skipped rather than choosing first by index',()=>{
 const p=project(),source=excel([['Period','회수액','회수액','투자 거래액'],['Q1',8,9,11],['Q2',7,6,12]]);
 const plan=T.plan(p,source,config(p,{range:'A1:D3'}));
 assert.equal(plan.updates.length,1);
 assert.equal(plan.updates[0].columnName,'투자 거래액');
 assert.equal(plan.skipped.length,1);
 assert.match(plan.skipped[0].reason,/비슷한 수치 열 둘 이상/);
});
test('preview-only returns all report slots and selectable columns even with no automatic matches',()=>{
 const p=project(),source=excel([['기간','기온','습도'],['Q1',12,33],['Q2',15,40]]);
 const snap=JSON.stringify(p);
 const preview=T.plan(p,source,config(p,{previewOnly:true}));
 assert.equal(preview.reviewSlots.length,2);
 assert.equal(preview.suggestions.length,0);
 assert.deepEqual(preview.numericColumns.map(c=>c.name),['기온','습도']);
 assert.equal(JSON.stringify(p),snap);
});
test('a manually selected column becomes linked only after full data review and preserves chart structure',()=>{
 const p=project(),source=excel([['Period','Temperature'],['Q1',19],['Q2',-4]]);
 const opts=config(p,{range:'A1:B3'}),inspect=T.plan(p,source,{...opts,previewOnly:true});
 const slot=inspect.reviewSlots[0],original=p.pages.find(pg=>pg.id===slot.pageId).elements.find(e=>e.id===slot.id);
 const manualOverrides={[slot.pageId+':'+slot.id]:'1'};
 const plan=T.plan(p,source,{...opts,manualOverrides});
 assert.equal(plan.updates.length,1);
 assert.equal(plan.updates[0].confirmed,true);
 assert.equal(plan.updates[0].matchReason,'user-confirmed');
 assert.match(plan.updates[0].block.source,/작성자가 열을 직접 지정/);
 const next=T.apply(p,plan),bound=next.pages.find(pg=>pg.id===slot.pageId).elements.find(e=>e.id===slot.id);
 assert.deepEqual(bound.data.values,[19,-4]);
 assert.deepEqual([bound.id,bound.x,bound.y,bound.w,bound.h,bound.data.palette],
  [original.id,original.x,original.y,original.w,original.h,original.data.palette]);
 assert.match(X.exportHTML(next),/Temperature/);
});
test('a manually selected textual rather than numeric column is refused, not quietly coerced to 0',()=>{
 const p=project(),source=excel([['Period','Notes','Exit'],['Q1','bad',4],['Q2','none',8]]);
 const preview=T.plan(p,source,config(p,{previewOnly:true}));
 const first=preview.reviewSlots[0],key=first.pageId+':'+first.id;
 assert.ok(preview.numericColumns.some(c=>c.name==='Notes'&&!c.numeric));
 const plan=T.plan(p,source,config(p,{manualOverrides:{[key]:1}}));
 assert.equal(plan.updates.length,1,'the valid Exit chart remains usable');
 assert.ok(plan.skipped.some(s=>s.blockId===first.id));
 assert.ok(p.pages.every(pg=>pg.elements.every(e=>!e.dataBinding)),'review never mutates report');
});
test('a stale chart changed after review invalidates whole batch without overwriting handmade edits',()=>{
 const p=project(),source=excel([['Period','투자 거래액','회수액'],['Q1',5,10],['Q2',7,12]]);
 const plan=T.plan(p,source,config(p)),first=plan.updates[0];
 const current=p.pages.find(pg=>pg.id===first.pageId).elements.find(e=>e.id===first.blockId);
 current.x+=12;
 const snapshot=JSON.stringify(p);
 assert.throws(()=>T.apply(p,plan),/위치가 변경|다시 검토/);
 assert.equal(JSON.stringify(p),snapshot);
});
test('multiple copies of same report never mix manual overrides between pack IDs',()=>{
 const p=project(),second=P.buildPack('STR-03');
 p.pages.push(...second);
 const source=excel([['Period','Temperature'],['Q1',20],['Q2',30]]);
 const selected=config(p,{range:'A1:B3',packInstanceId:second[0].designPackId});
 const preview=T.plan(p,source,{...selected,previewOnly:true});
 const target=preview.reviewSlots[0],manualOverrides={[target.pageId+':'+target.id]:'1'};
 const ready=T.apply(p,T.plan(p,source,{...selected,manualOverrides}));
 assert.equal(ready.pages.slice(0,6).flatMap(pg=>pg.elements.filter(e=>e.dataBinding)).length,0);
 assert.equal(ready.pages.slice(6).flatMap(pg=>pg.elements.filter(e=>e.dataBinding)).length,1);
});
test('large workbook can store manually confirmed derived results with provenance, not 10000 untouched cells',()=>{
 const p=project(),rows=[['Period','Temperature',...Array.from({length:98},(_,i)=>'Other'+i)]];
 for(let i=0;i<90;i++)rows.push(['P'+i,i-35,...Array(98).fill(i)]);
 const source=excel(rows,'big'),opts=config(p,{range:'A1:B91'});
 const preview=T.plan(p,source,{...opts,previewOnly:true}),one=preview.reviewSlots[0];
 const plan=T.plan(p,source,{...opts,manualOverrides:{[one.pageId+':'+one.id]:1}});
 assert.equal(plan.mode,'derived-results');
 assert.equal(plan.sourceCells,9100);
 assert.ok(plan.storedCells<plan.sourceCells);
 const stored=T.apply(p,plan),block=stored.pages.flatMap(pg=>pg.elements).find(el=>el.id===one.id);
 assert.match(block.source,/Temperature/);
 assert.equal(block.data.values[0],-35);
 assert.equal(block.data.values.length,90);
 assert.match(X.exportHTML(stored),/big.xlsx/);
});
test('UI keeps manual selection separate from the actual apply button',()=>{
 const panel=fs.readFileSync(path.join(__dirname,'../assets/data_panel.js'),'utf8');
 assert.match(panel,/manualOverrides/);
 assert.match(panel,/select\.onchange=\(\)=>\{/);
 assert.match(panel,/proposal=null;get\('dataApply'\)\.disabled=true/);
 assert.match(panel,/previewOnly:true/);
 assert.match(panel,/PACK\.plan\(p,candidate,opts\)/);
 assert.match(panel,/renderBatchMapping/);
 assert.match(panel,/td\.textContent/); // ordinary DOM rendering, not raw cell HTML
});


test('manual inspection still lists typed header columns when the first rows contain no numeric observations',()=>{
 const p=project(),source=excel([['Period','Metric'],['Q1','unavailable'],['Q2','not-a-number']]);
 const preview=T.plan(p,source,config(p,{range:'A1:B3',header:true,previewOnly:true}));
 assert.equal(preview.suggestions.length,0);
 assert.equal(preview.numericColumns.length,1);
 assert.equal(preview.numericColumns[0].numeric,false);
 const slot=preview.reviewSlots[0];
 assert.throws(()=>T.plan(p,source,config(p,{range:'A1:B3',header:true,manualOverrides:{[slot.pageId+':'+slot.id]:1}})),/통과하지 못했습니다/);
 assert.ok(p.pages.every(pg=>pg.elements.every(e=>!e.dataBinding)));
});
test('donut chart never accepts negative values from an automatic or manually mapped Excel column',()=>{
 const p=project('FIN-17'),sheet=excel([['Period','Investment'],['Q1',-10],['Q2',5]],'allocation');
 const original=JSON.stringify(p);
 const opt={designIdentity:'FIN-17',packInstanceId:p.pages[0].designPackId,sheetId:'1',range:'A1:B3'};
 const preview=T.plan(p,sheet,{...opt,previewOnly:true});
 const donut=preview.reviewSlots.find(x=>x.type==='donut');
 assert.ok(donut);
 const select={[donut.pageId+':'+donut.id]:1};
 assert.throws(()=>T.plan(p,sheet,{...opt,manualOverrides:select}),/통과하지 못했습니다|음수/);
 assert.equal(JSON.stringify(p),original);
});
