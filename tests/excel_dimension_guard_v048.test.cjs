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
const P=require('../assets/pro_reports.js');
const W=require('../assets/workbook.js');
const A=require('../assets/analytics_engine.js');
require('../assets/data_motion.js');
require('../assets/large_dataset.js');
require('../assets/chart_slot_mapper.js');
const T=require('../assets/template_data_mapper.js');
const make=(rows,id='dimension')=>W.fromRows(rows,{id,fileName:id+'.xlsx'});
const report=()=>{const project=C.createProject(1);project.pages=P.buildPack('STR-03');return project;};
test('numeric year header is a dimension when not the first column',()=>{
 const source=make([['Revenue','Year','Profit'],[100,2024,20],[120,2025,30]]);
 const found=A.suggest(source,'1','A1:C3');
 assert.equal(found.header,true);
 assert.equal(found.labelColumn,1);
 assert.equal(found.valueColumn,0);
 assert.equal(found.labelConfidence,'header-dimension');
});
test('Korean numeric period and regional text are real dimensions',()=>{
 const cases=[
  {rows:[['매출액','연도','이익'],[100,2024,30],[120,2025,40]],label:1,value:0},
  {rows:[['지역','매출'],['서울',10],['부산',20]],label:0,value:1},
  {rows:[['Revenue','Quarter'],[10,1],[20,2]],label:1,value:0}
 ];
 for(const c of cases){const source=make(c.rows);const result=A.suggest(source,'1','A1:'+W.columnName(c.rows[0].length-1)+'3');
  assert.deepEqual([result.labelColumn,result.valueColumn],[c.label,c.value]);
 }
});
test('numeric-only ambiguous categories are withheld until writer explicitly selects a category column',()=>{
 const source=make([['UnknownX','Revenue'],[2024,10],[2025,20]]),project=report();
 const found=A.suggest(source,'1','A1:B3');
 assert.equal(found.labelConfidence,'unconfirmed-numeric-dimension');
 const opts={designIdentity:'STR-03',sheetId:'1',range:'A1:B3'};
 const preview=T.plan(project,source,{...opts,previewOnly:true});
 assert.equal(preview.suggestions.length,0);
 assert.equal(preview.skipped.length,2);
 assert.throws(()=>T.plan(project,source,opts),/명확하게 연결할 열 제목/);
 const reviewed=T.plan(project,source,{...opts,labelColumn:0,previewOnly:true});
 assert.equal(reviewed.labelConfidence,'writer-selected');
 assert.throws(()=>T.plan(project,source,{...opts,labelColumn:30}),/범주 열/);
 assert.ok(project.pages.every(p=>p.elements.every(b=>!b.dataBinding)));
});
test('conservative bilingual metric matching still supports investment and exit independently',()=>{
 const project=report(),source=make([['Period','Investment','Exit'],['Q1',40,10],['Q2',-8,3]]);
 const plan=T.plan(project,source,{designIdentity:'STR-03',sheetId:'1',range:'A1:C3'});
 assert.deepEqual(plan.updates.map(u=>u.columnName),['Investment','Exit']);
 assert.ok(T.similarity('투자 거래','Investment')>0);
 const next=T.apply(project,plan);
 assert.deepEqual(next.pages[2].elements.filter(el=>el.dataBinding).map(el=>el.data.values),[[40,-8],[10,3]]);
});
test('explicit conflicting unit headers do not auto-map as an equivalent metric',()=>{
 assert.equal(T.similarity('매출액 ($)','Revenue (%)'),0);
 assert.equal(T.similarity('인원 (명)','Users (USD)'),0);
 assert.ok(T.similarity('매출액','Revenue')>0);
 assert.equal(T.similarity('매출','매출 원가'),0);
});
test('manual label change disables stale reviewed batch in browser source',()=>{
 const panel=fs.readFileSync(path.join(__dirname,'../assets/data_panel.js'),'utf8');
 assert.match(panel,/manualLabelOverride=true;manualOverrides=\{\}/);
 assert.match(panel,/manualLabelOverride\?\{labelColumn:Number/);
 assert.match(panel,/proposal=null;get\('dataApply'\)\.disabled=true/);
});
