'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../assets/core.js');
require('../assets/story_player.js');
require('../assets/core_enhanced.js');
const W=require('../assets/workbook.js');
require('../assets/analytics_engine.js');
const DM=require('../assets/data_motion.js');
const M=require('../assets/large_dataset.js');
const Refresh=require('../assets/dataset_refresh.js');
const X=require('../assets/export.js');
function source(id,values,fileName=id+'.xlsx'){
 return DM.dataset(W.fromRows([['Period','Amount'],...values.map((n,i)=>['Q'+(i+1),n])],{id,fileName}));
}
function chart(ds,kind='bar',bounds='A1:B4'){
 const spec=DM.binding({datasetId:ds.id,sheetId:ds.sheets[0].id,range:bounds,labelColumn:0,valueColumn:1,header:true});
 return DM.materialize(C.makeBlock(kind,70,240,{w:710,h:300,data:{labels:[],values:[],palette:'default'}}),ds,spec);
}
function projectWithTwoCharts(){
 const ds=source('original',[12,-5,0]);
 const p=C.createProject(2);p.datasets=[ds];
 p.pages[0].elements.push(chart(ds));
 p.pages[1].elements.push(chart(ds,'line'));
 return p;
}
function largeSource(id,start){
 const rows=[['Region','Value','Memo',...Array.from({length:97},(_,j)=>'Field'+j)]];
 for(let i=0;i<70;i++)rows.push([i===0?'00123':'Z'+i,start+i,'Text'+i,...Array.from({length:97},(_,j)=>i+j)]);
 const src=W.fromRows(rows,{id,fileName:id+'.xlsx'});
 const label=src.sheets[0].cells.find(c=>c.row===1&&c.col===0);
 Object.assign(label,{type:'s',value:'00123',raw:'00123',formatted:'00123'});
 const price=src.sheets[0].cells.find(c=>c.row===2&&c.col===1);
 price.formatted='₩ '+price.value+'.00';price.format='₩#,##0.00';
 return DM.dataset(src);
}
test('small source replacement refreshes all bound pages atomically without mutating old project',()=>{
 const before=projectWithTwoCharts(),snapshot=JSON.stringify(before),newFile=source('upload',[15,8,-2],'new.xlsx');
 const plan=Refresh.plan(before,newFile,'original');
 assert.equal(plan.mode,'original-cells');assert.equal(plan.linkedObjects,2);
 const after=Refresh.apply(before,plan);
 assert.deepEqual(after.pages.map(p=>p.elements.at(-1).data.values),[[15,8,-2],[15,8,-2]]);
 assert.deepEqual(after.pages.map(p=>p.elements.at(-1).dataBinding.datasetId),['original','original']);
 assert.ok(after.pages.every(p=>p.elements.at(-1).source.includes('new.xlsx')));
 assert.equal(after.datasets[0].fileName,'new.xlsx');
 assert.equal(JSON.stringify(before),snapshot,'never mutate source before successful application');
});
test('mass refresh with 7100 cells persists compact chart+table sheets and original origin',()=>{
 const old=largeSource('old',15),newFile=largeSource('new',-25);
 const p=C.createProject(2);p.datasets=[old];
 p.pages[0].elements.push(chart(old,'bar','A1:B71'));
 p.pages[1].elements.push(chart(old,'table','A1:C4'));
 const before=JSON.stringify(p);
 const plan=Refresh.plan(p,newFile,old.id);
 assert.equal(plan.mode,'derived-results');
 assert.equal(plan.sourceCells,7100);
 assert.equal(plan.linkedObjects,2);
 assert.equal(plan.storedCells,154);
 assert.equal(plan.dataset.sheets.length,2);
 const revised=Refresh.apply(p,plan);
 const bar=revised.pages[0].elements.at(-1),table=revised.pages[1].elements.at(-1);
 assert.equal(bar.data.labels[0],'00123','numeric-looking region code remains text');
 assert.equal(bar.data.values[0],-25);
 assert.equal(bar.dataBinding.datasetId,old.id);
 assert.match(bar.dataBinding.origin,/new.xlsx \/ 데이터!A1:B71/);
 assert.match(bar.source,/재업로드한 통계 결과/);
 assert.equal(table.data.rows[1][0],'00123');
 assert.equal(table.data.rows[2][1],'₩ -24.00','Excel display formatting remains');
 assert.equal(JSON.stringify(p),before,'old linked report is not modified');
 const html=X.exportHTML(revised);
 assert.ok(html.includes('chart-svg'));
 assert.ok(html.includes('new.xlsx'));
 assert.ok(html.includes('00123'));
});
test('validation rejects missing old worksheet, bad new data or locked linked blocks without mutation',()=>{
 const p=projectWithTwoCharts(),snapshot=JSON.stringify(p);
 const candidate=source('upload',[15,7,3]);
 candidate.sheets[0].name='Renamed';
 assert.throws(()=>Refresh.plan(p,candidate,'original'),/시트 이름/);
 const same=source('upload',[15,7,3]);
 p.pages[1].elements.at(-1).locked=true;
 assert.throws(()=>Refresh.plan(p,same,'original'),/잠겨/);
 assert.equal(p.datasets[0].fileName,'original.xlsx');
 p.pages[1].elements.at(-1).locked=false;
 same.sheets[0].cells.find(c=>c.address==='B2').value=null;
 assert.throws(()=>Refresh.plan(p,same,'original'),/숫자|캐시|결측/);
});
test('safe apply rejects newly added links and missing pages after review',()=>{
 const p=projectWithTwoCharts(),plan=Refresh.plan(p,source('uploaded',[1,2,3]),'original');
 const other=chart(p.datasets[0]);other.id='new-after-review';p.pages[0].elements.push(other);const beforeCount=p.pages[0].elements.length;
 assert.throws(()=>Refresh.apply(p,plan),/변경|재검토/);
 assert.equal(p.pages[0].elements.length,beforeCount,'project was not mutated by failed apply');
 const clean=projectWithTwoCharts(),ready=Refresh.plan(clean,source('uploaded',[1,2,3]),'original');
 clean.pages.pop();
 assert.throws(()=>Refresh.apply(clean,ready),/변경|재검토/);
});
test('derived snapshot cannot be incorrectly refreshed as though it contained the original workbook',()=>{
 const old=largeSource('old',15),newFile=largeSource('new',30),p=C.createProject(1);p.datasets=[old];p.pages[0].elements.push(chart(old,'bar','A1:B71'));
 const first=Refresh.apply(p,Refresh.plan(p,newFile,'old'));
 assert.throws(()=>Refresh.plan(first,largeSource('another',60),'old'),/선택 통계 결과/);
});
test('source range preserves original sheet even if workbook reorders its sheet IDs',()=>{
 const p=projectWithTwoCharts(),newFile=source('upload',[4,5,6]);
 newFile.sheets[0].id='sheet-9';
 const plan=Refresh.plan(p,newFile,'original'),result=Refresh.apply(p,plan);
 assert.equal(result.pages[0].elements.at(-1).dataBinding.sheetId,'sheet-9');
 assert.deepEqual(result.pages[1].elements.at(-1).data.values,[4,5,6]);
});
test('origin string survives normalized model and any invalid origin is explicitly rejected',()=>{
 const p=projectWithTwoCharts(),ds=p.datasets[0],b=p.pages[0].elements.at(-1);
 const spec=DM.binding({...b.dataBinding,origin:'original.xlsx / Data!A1:B4 · generated source'});
 const derived=DM.materialize(b,ds,spec),report=C.normalizeProject({...p,pages:[{...p.pages[0],elements:[derived]}]});
 assert.equal(report.pages[0].elements[0].source,spec.origin);
 assert.equal(report.pages[0].elements[0].dataBinding.origin,spec.origin);
 assert.throws(()=>DM.binding({...spec,origin:'X'.repeat(501)}),/한도/);
});
