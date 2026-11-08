'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const C=require('../assets/core.js');
require('../assets/story_player.js');
require('../assets/core_enhanced.js');
const W=require('../assets/workbook.js');
require('../assets/analytics_engine.js');
const DM=require('../assets/data_motion.js');
const M=require('../assets/large_dataset.js');
const X=require('../assets/export.js');
function embedded(moduleName){
 const js=readFileSync(join(__dirname,'../assets/export.js'),'utf8');
 const line=js.split('\n').find(s=>s.trimStart().startsWith('const '+moduleName+'='));
 assert.ok(line,'Missing '+moduleName);
 const literal=line.trim().slice(('const '+moduleName+'=').length).replace(/;$/,'');
 return JSON.parse(literal);
}
test('standalone HTML embedded runtimes match the current browser modules exactly',()=>{
 const modules={
  embeddedSAX:'xlsx_sax.js',
  embeddedFormula:'formula_engine.js',
  embeddedWorkbook:'workbook.js',
  embeddedAnalytics:'analytics_engine.js',
  embeddedDataMotion:'data_motion.js'
 };
 for(const [name,file] of Object.entries(modules)){
  assert.equal(embedded(name),readFileSync(join(__dirname,'../assets',file),'utf8'),'stale standalone HTML module: '+name);
 }
});
test('data preview samples only 256 body rows; review uses all rows without truncation',()=>{
 const rows=[['Category','Amount']];
 for(let i=0;i<500;i++)rows.push(['R'+i,i-240]);
 const ds=DM.dataset(W.fromRows(rows,{id:'sample',fileName:'preview.csv'}));
 const spec=DM.binding({datasetId:ds.id,sheetId:'1',range:'A1:B501',labelColumn:0,valueColumn:1,header:true,analysisMode:'raw'});
 const preview=DM.values(ds,spec,{maxRows:257});
 const full=DM.values(ds,spec);
 assert.equal(preview.rawSeries.length,256);
 assert.equal(full.rawSeries.length,500);
 assert.equal(full.rawSeries.at(-1).value,259);
 assert.equal(preview.rawSeries.at(-1).value,15);
});
test('large compact chart keeps a leading-zero text identifier through restore and HTML export',()=>{
 const rows=[['Region','Amount',...Array.from({length:98},(_,j)=>'Column'+j)]];
 for(let i=0;i<55;i++)rows.push([i===0?'00123':'CODE-'+i,i-15,...Array(98).fill(i)]);
 const src=W.fromRows(rows,{id:'large',fileName:'financial.xlsx'});
 const lead=src.sheets[0].cells.find(c=>c.row===1&&c.col===0);
 Object.assign(lead,{type:'s',value:'00123',raw:'00123',formatted:'00123'});
 const spec=DM.binding({datasetId:src.id,sheetId:'1',range:'A1:B56',labelColumn:0,valueColumn:1,header:true});
 const b=DM.materialize(C.makeBlock('bar',85,250,{w:790,h:280,data:{labels:[],values:[],palette:'default'}}),src,spec);
 const result=M.prepare(src,spec,'bar',b,DM.values(src,spec));
 assert.equal(result.mode,'analysis-only');
 assert.equal(result.block.data.labels[0],'00123');
 assert.match(result.block.dataBinding.origin,/financial.xlsx \/ 데이터!A1:B56/);
 const p=C.createProject(1);p.datasets=[result.dataset];p.pages[0].elements.push(result.block);
 const reopened=C.normalizeProject(p),retained=reopened.pages[0].elements.at(-1);
 assert.equal(retained.data.labels[0],'00123');
 assert.equal(retained.source,result.block.source);
 const html=X.exportHTML(reopened);
 assert.ok(html.includes('00123'));
 assert.ok(html.includes('financial.xlsx'));
});
test('large compact table retains cached display formatting and text identifiers',()=>{
 const rows=[['Code','Revenue',...Array.from({length:98},(_,j)=>'Other'+j)]];
 for(let i=0;i<55;i++)rows.push([i===0?'00123':'ITEM'+i,i-18,...Array(98).fill(i)]);
 const src=W.fromRows(rows,{id:'table',fileName:'finance.xlsx'});
 Object.assign(src.sheets[0].cells.find(c=>c.row===1&&c.col===0),{type:'s',value:'00123',raw:'00123',formatted:'00123'});
 const n=src.sheets[0].cells.find(c=>c.row===2&&c.col===1);
 n.format='₩#,##0.00';n.formatted='₩ -17.00';
 const spec=DM.binding({datasetId:src.id,sheetId:'1',range:'A1:B4',labelColumn:0,valueColumn:1,header:true});
 const b=DM.materialize(C.makeBlock('table',100,250,{w:780,h:260}),src,spec);
 const compact=M.prepare(src,spec,'table',b);
 const p=C.createProject(1);p.datasets=[compact.dataset];p.pages[0].elements.push(compact.block);
 const restored=C.normalizeProject(p).pages[0].elements.at(-1);
 assert.equal(restored.data.rows[1][0],'00123');
 assert.equal(restored.data.rows[2][1],'₩ -17.00');
 assert.equal(restored.source,compact.block.source);
});

test('CSV import preserves leading-zero identifiers while keeping ordinary numeric values',()=>{
 const ds=W.fromRows([['ZIP','Amount'],['00123','12.5'],['00007','-8'],['0.45','0'] ],{id:'zip',fileName:'codes.csv'});
 const rows=ds.sheets[0].cells;
 const get=(r,c)=>rows.find(cell=>cell.row===r&&cell.col===c);
 assert.equal(get(1,0).type,'str');
 assert.equal(get(1,0).value,'00123');
 assert.equal(get(2,0).type,'str');
 assert.equal(get(2,0).value,'00007');
 assert.equal(get(1,1).type,'n');
 assert.equal(get(1,1).value,12.5);
 assert.equal(get(2,1).value,-8);
 assert.equal(get(3,0).value,0.45);
 assert.equal(get(3,1).value,0);
});
