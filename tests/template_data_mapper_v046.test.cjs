'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../assets/core.js');
require('../assets/story_player.js');
require('../assets/core_enhanced.js');
require('../assets/branding.js');
require('../assets/reference_identity_core.js');
require('../assets/refpack_03_bain.js');
require('../assets/refpack_10_nvidia.js');
require('../assets/refpack_17_blackrock.js');
const P=require('../assets/pro_reports.js');
const W=require('../assets/workbook.js');
require('../assets/analytics_engine.js');
const DM=require('../assets/data_motion.js');
require('../assets/large_dataset.js');
require('../assets/chart_slot_mapper.js');
const T=require('../assets/template_data_mapper.js');
const X=require('../assets/export.js');
function make(id='STR-03'){const p=C.createProject(1);p.pages=P.buildPack(id);return p;}
test('Bain investment vs exit chart slots are populated from different well-matched Excel headers',()=>{
 const p=make(),original=JSON.stringify(p);
 const file=W.fromRows([['기간','투자 거래액','회수액'],['1분기',12,7],['2분기',-5,3],['3분기',0,9]],{id:'file',fileName:'finance.xlsx'});
 const preview=T.plan(p,file,{designIdentity:'STR-03',sheetId:'1',range:'A1:C4'});
 assert.deepEqual(preview.updates.map(x=>x.columnName),['투자 거래액','회수액']);
 assert.equal(preview.updates.length,2);
 assert.equal(preview.skipped.length,0);
 const result=T.apply(p,preview),pg=result.pages[2];
 const linked=pg.elements.filter(el=>el.dataBinding);
 assert.deepEqual(linked.map(e=>e.data.values),[[12,-5,0],[7,3,9]]);
 assert.deepEqual(linked.map(e=>e.type),['bar','line']);
 assert.equal(linked[0].data.palette,'bain-red-deals');
 assert.equal(linked[1].data.palette,'bain-red-deals');
 assert.equal(result.datasets.length,1);
 assert.equal(JSON.stringify(p),original,'dry-run and apply must not mutate caller');
 assert.ok(X.exportHTML(result).includes('finance.xlsx'));
});
test('ambiguous numeric columns and unrelated titles remain unbound without guessed data',()=>{
 const p=make(),file=W.fromRows([['시점','회수액','회수량','투자 거래액'],['1',3,4,12],['2',2,5,13]],{id:'amb',fileName:'risk.xlsx'});
 const plan=T.plan(p,file,{designIdentity:'STR-03',sheetId:'1',range:'A1:D3'});
 assert.equal(plan.updates.length,1,'only clearly matched investment/exit item may be considered');
 assert.ok(plan.skipped.length>0);
});
test('no matching financial header yields explicit refusal, not fabricated numbers',()=>{
 const p=make(),file=W.fromRows([['기간','꽃 판매','해당없음'],['첫째',1,10],['둘째',2,20]],{id:'flowers',fileName:'flower.xlsx'});
 assert.throws(()=>T.plan(p,file,{designIdentity:'STR-03',sheetId:'1',range:'A1:C3'}),/명확하게 연결할 열 제목/);
 assert.ok(p.pages.every(page=>page.elements.every(e=>!e.dataBinding)));
});
test('large workbook preserves distinct derived chart source, original IDs and page designs',()=>{
 const p=make(),base=JSON.stringify(p);
 const rows=[['기간','투자 거래액','회수액',...Array.from({length:97},(_,i)=>'추가'+i)]];
 for(let i=0;i<100;i++)rows.push(['분기'+i,i-34,i*2,...Array.from({length:97},(_,j)=>i+j)]);
 const data=W.fromRows(rows,{id:'large-pack',fileName:'investments.xlsx'});
 const plan=T.plan(p,data,{designIdentity:'STR-03',sheetId:'1',range:'A1:C101'});
 assert.equal(plan.mode,'derived-results');
 assert.equal(plan.sourceCells,10100);
 assert.equal(plan.updates.length,2);
 assert.equal(plan.dataset.sheets.length,2);
 const applied=T.apply(p,plan);
 const linked=applied.pages[2].elements.filter(e=>e.dataBinding);
 assert.equal(linked[0].data.values.length,100);
 assert.equal(linked[1].data.values.length,100);
 assert.match(linked[0].source,/투자 거래액/);
 assert.match(linked[1].source,/회수액/);
 assert.equal(linked[0].data.values[0],-34);
 assert.equal(linked[1].data.values[0],0);
 assert.equal(JSON.stringify(p),base);
 assert.equal(applied.pages[2].designIdentity,'STR-03');
 const html=X.exportHTML(applied);
 assert.ok(html.includes('investments.xlsx'));
 assert.ok(html.includes('chart-svg'));
});
test('apply refuses modified/locked chart and leaves the original project untouched',()=>{
 const p=make(),file=W.fromRows([['기간','투자 거래액','회수액'],['Q1',5,8],['Q2',4,9]],{id:'b',fileName:'b.xlsx'});
 const plan=T.plan(p,file,{designIdentity:'STR-03',sheetId:'1',range:'A1:C3'});
 p.pages[2].elements.find(e=>e.id===plan.updates[0].blockId).locked=true;
 const before=JSON.stringify(p);
 assert.throws(()=>T.apply(p,plan),/차트|선택|변경|취소/);
 assert.equal(JSON.stringify(p),before);
});
test('previously mapped chart will not be selected or overwritten on second apply',()=>{
 const p=make(),file=W.fromRows([['기간','투자 거래액','회수액'],['Q1',5,8],['Q2',4,9]],{id:'c',fileName:'c.xlsx'});
 const plan=T.plan(p,file,{designIdentity:'STR-03',sheetId:'1',range:'A1:C3'}),next=T.apply(p,plan);
 assert.throws(()=>T.plan(next,file,{designIdentity:'STR-03',sheetId:'1',range:'A1:C3'}),/연결되지 않은 원본 차트/);
});
test('no auto-binding when Excel sheet lacks a header row',()=>{
 const p=make(),file=W.fromRows([[1,20,10],[2,13,4],[3,19,5]],{id:'headerless',fileName:'bare.xlsx'});
 assert.throws(()=>T.plan(p,file,{designIdentity:'STR-03',sheetId:'1',range:'A1:C3'}),/제목 행/);
});
test('multiple reports only update the chosen identity, not another family',()=>{
 const p=make(),other=P.buildPack('EARN-10');p.pages.push(...other);
 const oldOther=C.normalizeProject(p).pages.slice(6);
 const data=W.fromRows([['기간','투자 거래액','회수액'],['Q1',5,6],['Q2',8,10]],{id:'f',fileName:'f.xlsx'});
 const plan=T.plan(p,data,{designIdentity:'STR-03',sheetId:'1',range:'A1:C3'}),next=T.apply(p,plan);
 assert.deepEqual(next.pages.slice(6),oldOther);
 assert.equal(next.pages.slice(0,6).flatMap(pg=>pg.elements.filter(e=>e.dataBinding)).length,2);
});
test('UI includes opt-in six-page mapping and requires review/apply safety gate',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const index=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const panel=fs.readFileSync(path.join(__dirname,'../assets/data_panel.js'),'utf8');
 const app=fs.readFileSync(path.join(__dirname,'../assets/app.js'),'utf8');
 const scripts=[...index.matchAll(/<script src="\.\/assets\/([^"]+)" defer><\/script>/g)].map(m=>m[1]);
 assert.ok(scripts.indexOf('template_data_mapper.js')>scripts.indexOf('chart_slot_mapper.js'));
 assert.ok(scripts.indexOf('template_data_mapper.js')<scripts.indexOf('data_panel.js'));
 assert.match(panel,/id="dataReviewPack"/);
 assert.match(panel,/PACK\.plan\(p,candidate,/);
 assert.match(panel,/api\.commitPack\(proposal\.packBind\)/);
 assert.match(app,/commitPack:prepared/);
 assert.match(app,/preMutationBackup\('before inserting Excel values into company report charts'\)/);
 assert.match(app,/mapper\.apply\(project,prepared\)/);
});

test('1000 source rows can be grouped by original category into 10 chart points without losing the total',()=>{
 const p=make(),rows=[['기간','투자 거래액','회수액']];
 for(let i=0;i<1000;i++)rows.push(['Q'+(i%10),1,2]);
 const dataset=W.fromRows(rows,{id:'grouped',fileName:'group.xlsx'});
 const plan=T.plan(p,dataset,{designIdentity:'STR-03',sheetId:'1',range:'A1:C1001',analysisMode:'group',aggregate:'sum'});
 assert.equal(plan.analysisMode,'group');assert.equal(plan.aggregate,'sum');
 const ready=T.apply(p,plan),b=ready.pages[2].elements.filter(el=>el.dataBinding);
 assert.deepEqual(b.map(el=>el.data.values.length),[10,10]);
 assert.deepEqual(b.map(el=>el.data.values[0]),[100,200]);
 assert.equal(b[0].data.values.reduce((a,v)=>a+v,0),1000);
 assert.equal(b[1].data.values.reduce((a,v)=>a+v,0),2000);
});
test('can connect untouched template slots using the same existing normalized source snapshot',()=>{
 const p=make(),source=W.fromRows([['기간','투자 거래액','회수액'],['Q1',5,8],['Q2',3,9]],{id:'existing',fileName:'existing.xlsx'});
 p.datasets=[DM.dataset(source)];
 const plan=T.plan(p,p.datasets[0],{designIdentity:'STR-03',sheetId:'1',range:'A1:C3'}),ready=T.apply(p,plan);
 assert.equal(ready.datasets.length,1);
 assert.equal(ready.pages.flatMap(page=>page.elements.filter(el=>el.dataBinding)).length,2);
});

test('conservative bilingual metric aliases connect Investment and Exit to separate native chart slots',()=>{
 const report=make(),english=W.fromRows([['Period','Investment','Exit'],['Q1',40,10],['Q2',-8,3]],{id:'bilingual',fileName:'global.xlsx'});
 const proposal=T.plan(report,english,{designIdentity:'STR-03',sheetId:'1',range:'A1:C3'});
 assert.deepEqual(proposal.updates.map(x=>x.columnName),['Investment','Exit']);
 const ready=T.apply(report,proposal);
 assert.deepEqual(ready.pages[2].elements.filter(x=>x.dataBinding).map(x=>x.data.values),[[40,-8],[10,3]]);
 assert.ok(T.similarity('분기 매출','Revenue')>0);
 assert.ok(T.similarity('성장 추이','Growth')>0);
 assert.equal(T.similarity('회수 추세','Return'),0,'ambiguous financial return is not silently treated as exit');
 assert.equal(T.similarity('투자 거래','Inflation'),0);
});

test('template-wide auto matching never silently repurposes financial metrics as histogram bins',()=>{
 const report=make(),file=W.fromRows([['기간','투자 거래액','회수액'],['Q1',5,8],['Q2',3,9]],{id:'hist',fileName:'hist.xlsx'});
 assert.throws(()=>T.plan(report,file,{designIdentity:'STR-03',sheetId:'1',range:'A1:C3',analysisMode:'histogram'}),/히스토그램/);
});
