'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
require('../assets/core.js');
require('../assets/story_player.js');
require('../assets/core_enhanced.js');
require('../assets/workbook.js');
require('../assets/analytics_engine.js');
require('../assets/data_motion.js');
require('../assets/export.js');
const C=global.DocutCore,W=global.DocutWorkbook,A=global.DocutAnalytics,DM=global.DocutDataMotion,X=global.DocutExporter;
C.CHART_PALETTES={default:['#b78e64'],ubs:['#94752f','#94752f','#94752f']};
const data=W.fromRows([['Group','Value','Quarter'],['Seoul','12','Q1'],['Busan','-2','Q1'],['Seoul','8','Q2'],['Busan','4','Q2'],['Incheon','0','Q2']],{id:'excel-local',fileName:'synthetic.csv'});
const ds=DM.dataset(data),base={datasetId:ds.id,sheetId:'1',range:'A1:C6',labelColumn:0,valueColumn:1,header:true};
test('descriptive statistics use sample variance and correct signed changes',()=>{
 const s=A.describe([1,2,3,4,5]);
 assert.equal(s.count,5);assert.equal(s.sum,15);assert.equal(s.mean,3);
 assert.equal(s.median,3);assert.equal(s.p25,2);assert.equal(s.p75,4);
 assert.equal(s.variance,2.5);assert.equal(s.stddev,Math.sqrt(2.5));assert.equal(s.changePercent,400);
 assert.equal(A.describe([-4,-2,0]).median,-2);
 assert.equal(A.describe([0,5]).changePercent,null);
});
test('automatic columns, headers and numeric category from table selection',()=>{
 const picked=A.suggest(ds,'1','A1:C6');
 assert.equal(picked.header,true);
 assert.equal(picked.labelColumn,0);
 assert.equal(picked.valueColumn,1);
 assert.equal(picked.recommendedChart,'bar');
 assert.equal(picked.distinctLabels,3);
});
test('sum/mean/median/count aggregation from worksheet table, preserve negative',()=>{
 const b=DM.binding({...base,analysisMode:'group',aggregate:'sum'});
 const values=DM.values(ds,b);
 assert.deepEqual(values.series.map(p=>[p.label,p.value]),[['Seoul',20],['Busan',2],['Incheon',0]]);
 assert.equal(values.summary.count,5);assert.equal(values.summary.sum,22);assert.equal(values.summary.min,-2);
 assert.deepEqual(DM.values(ds,{...b,aggregate:'mean'}).series.map(p=>p.value),[10,1,0]);
 assert.deepEqual(DM.values(ds,{...b,aggregate:'median'}).series.map(p=>p.value),[10,1,0]);
 assert.deepEqual(DM.values(ds,{...b,aggregate:'count'}).series.map(p=>p.value),[2,2,1]);
});
test('histogram counts every negative and zero observation; cumulative series preserves order',()=>{
 const h=DM.values(ds,{...base,analysisMode:'histogram',bins:4});
 assert.equal(h.series.length,4);assert.equal(h.series.reduce((n,p)=>n+p.value,0),5);
 assert.deepEqual(DM.values(ds,{...base,analysisMode:'cumulative'}).series.map(p=>p.value),[12,10,18,22,22]);
});
test('numeric conversion refuses missing values without silently inserting zero',()=>{
 const broken=DM.dataset(W.fromRows([['Group','Value'],['Good','10'],['Bad','']],{id:'broken'}));
 assert.throws(()=>DM.values(broken,{...base,datasetId:broken.id,range:'A1:B3'}),/숫자|missing|캐시/);
});
test('dense XLSX-style 100 bar series survive normalization and render labels, negatives and zero baseline',()=>{
 const rows=[['Index','Amount']];
 for(let i=0;i<100;i++)rows.push(['M'+(i+1),String(i%7===0?-(i+1):i+1)]);
 const source=DM.dataset(W.fromRows(rows,{id:'dense'})),spec=DM.binding({...base,datasetId:source.id,range:'A1:B101'});
 const element=C.makeBlock('bar',200,230,{text:'엑셀 UBS 실측',w:780,h:340,data:{labels:[],values:[],palette:'ubs'},style:{background:'#ffffff',shadow:0,radius:0}});
 const linked=DM.materialize(element,source,spec);
 assert.equal(linked.data.values.length,100);
 assert.equal(C.normalizeBlock(linked).data.values.length,100);
 const svg=X.svgChart(linked);
 assert.equal((svg.match(/<rect /g)||[]).length,100);
 assert.ok(svg.includes('chart-svg-dense'));assert.ok(svg.includes('#94752f'));
 assert.ok(svg.includes('stroke="#777f80"'));
 assert.ok(svg.includes('M1: -1'));
});
test('999 points must explicitly fail raw; grouping yields <=120 and retains total',()=>{
 const rows=[['Category','Value']];
 for(let i=0;i<999;i++)rows.push(['G'+(i%20),'1']);
 const source=DM.dataset(W.fromRows(rows,{id:'thousand'}));
 assert.throws(()=>DM.values(source,{...base,datasetId:source.id,range:'A1:B1000'}),/120|최대/);
 const grouped=DM.values(source,{...base,datasetId:source.id,range:'A1:B1000',analysisMode:'group'});
 assert.equal(grouped.series.length,20);
 assert.equal(grouped.series.reduce((n,p)=>n+p.value,0),999);
});
test('source-ratio UBS chart placement is bounded and only activates for original chart pages',()=>{
 const rect=A.ubsSlot({referenceFidelity:{sourcePage:13,mode:'source-ratio'}},{width:1280,height:720});
 assert.ok(rect&&rect.x>0&&rect.w>500&&rect.x+rect.w<=1280);
 assert.equal(A.ubsSlot({referenceFidelity:{sourcePage:8,mode:'source-ratio'}},{width:1280,height:720}),null);
});

