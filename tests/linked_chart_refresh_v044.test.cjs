'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../assets/core.js');
require('../assets/story_player.js');
require('../assets/core_enhanced.js');
const W=require('../assets/workbook.js');
require('../assets/analytics_engine.js');
const DM=require('../assets/data_motion.js');
const X=require('../assets/export.js');
const M=require('../assets/large_dataset.js');
function base(){
 const ds=DM.dataset(W.fromRows([['Period','Value'],['A',12],['B',-5],['C',0]],{id:'source',fileName:'tracked.xlsx'}));
 const spec=DM.binding({datasetId:'source',sheetId:'1',range:'A1:B4',labelColumn:0,valueColumn:1,header:true});
 const b=DM.materialize(C.makeBlock('bar',100,300,{w:670,h:260,data:{labels:[],values:[],palette:'default'}}),ds,spec);
 const p=C.createProject(1);p.datasets=[ds];p.pages[0].elements.push(b);return p;
}
test('reopening a project recomputes chart from updated authoritative cells, not stale block data',()=>{
 const project=base(),original=JSON.parse(JSON.stringify(project));
 const modified=JSON.parse(JSON.stringify(project));
 const cell=modified.datasets[0].sheets[0].cells.find(c=>c.address==='B3');
 cell.value=42;cell.raw='42';cell.formatted='42';
 assert.deepEqual(modified.pages[0].elements.at(-1).data.values,[12,-5,0],'chart was intentionally stale in JSON');
 const restored=C.normalizeProject(modified);
 assert.deepEqual(restored.pages[0].elements.at(-1).data.values,[12,42,0]);
 assert.deepEqual(project,original,'project input not mutated');
 assert.equal(restored.pages[0].elements.at(-1).source,'tracked.xlsx / 데이터!A1:B4');
 assert.deepEqual(restored.pages[0].elements.at(-1).data.labels,['A','B','C']);
});
test('same data source updates two connected report charts in different page layouts',()=>{
 const project=base(),second=JSON.parse(JSON.stringify(project.pages[0]));
 second.id='different-page';second.elements[second.elements.length-1].id='second-chart';
 second.elements.at(-1).data.palette='default';
 project.pages.push(second);
 const cell=project.datasets[0].sheets[0].cells.find(c=>c.address==='B2');
 cell.value=-20;cell.raw='-20';cell.formatted='-20';
 const result=C.normalizeProject(project);
 assert.deepEqual(result.pages.map(pg=>pg.elements.at(-1).data.values),[[-20,-5,0],[-20,-5,0]]);
 assert.ok(result.pages.every(pg=>pg.elements.at(-1).dataBinding?.datasetId==='source'));
});
test('standalone HTML exports refreshed chart from dataset, not outdated cached content',()=>{
 const p=base(),b=p.pages[0].elements.at(-1);
 b.data.values=[777,777,777];
 const content=X.exportHTML(p);
 assert.ok(content.includes('chart-svg'));
 assert.ok(!content.includes('777,777,777'));
 assert.ok(content.includes('12,-5,0'));
});
test('source changes with an invalid blank numeric cell are not silently coerced to zero',()=>{
 const p=base(),cell=p.datasets[0].sheets[0].cells.find(c=>c.address==='B3');
 cell.type='blank';cell.value=null;cell.formatted='';cell.raw='';
 assert.throws(()=>C.normalizeProject(p),/숫자|캐시|결측/);
});
test('compact large workbook snapshots rehydrate their selected chart only',()=>{
 const rows=[['Category','Number',...Array.from({length:98},(_,i)=>'Extra '+i)]];
 for(let i=0;i<70;i++)rows.push(['Region '+i,i-30,...Array(98).fill(i)]);
 const ds=DM.dataset(W.fromRows(rows,{id:'large',fileName:'huge.xlsx'}));
 const spec=DM.binding({datasetId:'large',sheetId:'1',range:'A1:B71',labelColumn:0,valueColumn:1,header:true});
 const bar=DM.materialize(C.makeBlock('bar',80,250,{w:800,h:250,data:{labels:[],values:[],palette:'default'}}),ds,spec);
 const compact=M.prepare(ds,spec,'bar',bar,DM.values(ds,spec));
 assert.ok(compact.storedCells<compact.originalCells);
 const p=C.createProject(1);p.pages[0].elements.push(compact.block);p.datasets=[compact.dataset];
 const result=C.normalizeProject(p);
 assert.deepEqual(result.pages[0].elements.at(-1).data.values,bar.data.values);
 assert.equal(result.pages[0].elements.at(-1).data.values.length,70);
});
