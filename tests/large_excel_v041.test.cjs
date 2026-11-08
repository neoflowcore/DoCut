'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
require('../assets/core.js');
require('../assets/story_player.js');
require('../assets/core_enhanced.js');
const SAX=require('../assets/xlsx_sax.js');
const F=require('../assets/formula_engine.js');
const W=require('../assets/workbook.js');
require('../assets/analytics_engine.js');
const DM=require('../assets/data_motion.js');
const M=require('../assets/large_dataset.js');
const C=globalThis.DocutCore,X=require('../assets/export.js');
test('v0.41 raises filled-cell cap to three million without raising file/formula cap',()=>{
 assert.equal(W.LIMITS.cells,3000000);
 assert.equal(W.LIMITS.rows,30000);
 assert.equal(W.LIMITS.columns,256);
 assert.equal(W.LIMITS.bytes,50*1024*1024);
 assert.equal(W.LIMITS.formulas,10000);
 assert.deepEqual(W.range('A1:IV30000').end,{row:29999,col:255});
 assert.throws(()=>W.range('A1:IW30000'),/한도/);
 assert.throws(()=>W.range('A1:IV30001'),/한도/);
});
test('bounded SAX handles rich shared strings, zero, negative, inline text and formulas',()=>{
 const shared=SAX.parseSharedStrings('<sst><si><t>A&amp;B</t></si><si><r><t>rich</t></r><r><t> text</t></r><rPh><t>skip</t></rPh></si></sst>');
 assert.deepEqual(shared,['A&B','rich text']);
 const input='<worksheet><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>부동산 &amp; 차트</t></is></c><c r="B1"><v>-2</v></c><c r="C1"><f>SUM(B1:B2)</f><v>0</v></c><c r="D1" t="s"><v>1</v></c><c r="E1"/></row></sheetData></worksheet>';
 const rows=[];assert.equal(SAX.parseSheet(input,c=>rows.push(c)),5);
 assert.equal(rows[0].inline,'부동산 & 차트');
 assert.equal(rows[1].raw,'-2');
 assert.equal(rows[2].formula,'SUM(B1:B2)');
 assert.equal(rows[2].raw,'0');
 assert.equal(rows[3].raw,'1');
 assert.equal(rows[4].raw,'');
 assert.throws(()=>SAX.parseSheet('<worksheet><sheetData><row><c r="A1"></row></sheetData></worksheet>',()=>{}),/중첩|태그/);
 assert.throws(()=>SAX.parseSheet('<!DOCTYPE foo><worksheet><sheetData/></worksheet>',()=>{}),/허용/);
});
test('sparse selector reads only requested columns and bounded preview rows',()=>{
 const rows=Array.from({length:120},(_,r)=>Array.from({length:80},(_,c)=>r*80+c));
 const source=W.fromRows(rows,{id:'matrix'});
 const area=W.select(source,'1','A1:CB120',{columns:[0,79],maxRows:2});
 assert.equal(area.requestedRows,120);
 assert.equal(area.rows.length,2);
 assert.equal(area.rows[1].length,80);
 assert.equal(area.rows[1][79].value,159);
 assert.equal(area.rows[1][0].value,80);
 assert.equal(area.rows[1][1],undefined);
 assert.equal(W.select(source,'1','A1:CB120',{maxRows:1,maxColumns:4}).rows[0][3].value,3);
});
test('formula engine short circuits no formulas and saved-cache-only workbooks',()=>{
 const plain=Array.from({length:50000},(_,i)=>({row:i,col:0,value:1,formula:null,cached:false}));
 assert.equal(F.evaluateFormulas([{name:'Plain',cells:plain}]).total,0);
 const cached=Array.from({length:10000},(_,i)=>({row:i,col:1,value:3,formula:'1+2',cached:true}));
 const stats=F.evaluateFormulas([{name:'Caches',cells:cached}]);
 assert.equal(stats.cached,10000);assert.equal(stats.recalculated,0);
});
test('large workbook keeps chart numeric values and exports a compact, attributed report snapshot',()=>{
 const rows=[['Category','Value',...Array.from({length:98},(_,i)=>'Field'+i)]];
 for(let i=0;i<90;i++)rows.push(['G'+(i+1),i%3===0?-i:i,...Array(98).fill(i)]);
 const source=W.fromRows(rows,{id:'large-r',fileName:'large-report.xlsx'});
 const spec=DM.binding({datasetId:source.id,sheetId:'1',range:'A1:B91',labelColumn:0,valueColumn:1,header:true});
 const block=DM.materialize(C.makeBlock('bar',200,200,{text:'Dynamic source',data:{labels:[],values:[],palette:'ubs'}}),source,spec);
 const saved=M.prepare(source,spec,'bar',block,DM.values(source,spec));
 assert.equal(saved.mode,'analysis-only');
 assert.equal(saved.originalCells,9100);
 assert.equal(saved.storedCells,182);
 assert.deepEqual(saved.block.data.values,block.data.values);
 assert.match(saved.block.source,/large-report.xlsx/);
 assert.match(saved.dataset.warnings[0],/재업로드/);
 assert.equal(DM.values(saved.dataset,saved.block.dataBinding).series.length,90);
 const project=C.createProject(1);project.datasets=[saved.dataset];project.pages[0].elements.push(saved.block);
 const html=X.exportHTML(project);assert.ok(html.includes('chart-svg'));assert.ok(html.includes('large-report.xlsx'));assert.ok(html.includes('DocutXLSXSax'));
});
test('optional stress SAX scan exceeds the legacy 600,000 cell cap',{skip:!process.env.DOCUT_LARGE_QA},()=>{
 const columns=100,rows=8000;let xml='<worksheet><sheetData>';
 for(let r=1;r<=rows;r++){xml+='<row r="'+r+'">';for(let c=0;c<columns;c++)xml+='<c r="'+W.columnName(c)+r+'"><v>'+r+'</v></c>';xml+='</row>';}
 xml+='</sheetData></worksheet>';
 let count=0;SAX.parseSheet(xml,()=>count++);
 assert.equal(count,800000);
});
