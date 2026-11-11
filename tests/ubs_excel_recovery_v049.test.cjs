'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const C=require('../assets/core.js');
require('../assets/story_player.js');
require('../assets/core_enhanced.js');
require('../assets/branding.js');
require('../assets/ubs_vector_source.js');
require('../assets/ubs_fidelity.js');
require('../assets/reference_identity_core.js');
require('../assets/pro_reports.js');
const P=globalThis.DocutProReports;
const V=globalThis.DocutUBSVectorSource;
const W=require('../assets/workbook.js');
require('../assets/analytics_engine.js');
require('../assets/data_motion.js');
require('../assets/large_dataset.js');
require('../assets/chart_slot_mapper.js');
const T=require('../assets/template_data_mapper.js');
const U=require('../assets/ubs_pack_mapper.js');
const X=require('../assets/export.js');
const excel=(rows,id='ubs-xlsx')=>W.fromRows(rows,{id,fileName:id+'.xlsx'});
const sourceRows=[['Year','Distribution','Wealth'],[2024,100,400],[2025,130,460]];
async function prepared(){
 await V.ready;
 assert.equal(V.status,'ready','original source SVG must be ready, no silently substituted adaptation');
 const p=C.createProject(1);p.pages=P.buildPack('FIN-16','original');
 return p;
}
function opts(p,extra={}){
 return {designIdentity:'FIN-16',packInstanceId:p.pages[0].designPackId,
  sheetId:'1',range:'A1:C3',...extra};
}
function overrides(preview,columns=[1,2]){
 return Object.fromEntries(preview.reviewSlots.map((slot,i)=>[slot.pageId+':'+slot.id,String(columns[i])]));
}
test('original vector loader remains six pages and has 157 native text regions',async()=>{
 const p=await prepared();
 assert.deepEqual(p.pages.map(x=>x.referenceFidelity.sourcePage),[5,8,11,13,16,18]);
 assert.deepEqual(p.pages.map(x=>x.elements.length),[13,24,28,26,26,40]);
 assert.ok(p.pages.every(x=>x.referenceFidelity.measuredScore===null));
 assert.ok(p.pages.every(x=>x.elements.every(e=>e.type==='text'&&!e.text)));
 assert.equal(U.targets(p.pages,p.frame).length,2);
});
test('FIN-16 returns two virtual slots with no false automatic Excel metric binding',async()=>{
 const p=await prepared(),src=excel(sourceRows);
 const state=JSON.stringify(p),preview=T.plan(p,src,opts(p,{previewOnly:true}));
 assert.equal(preview.reviewSlots.length,2);
 assert.equal(preview.suggestions.length,0);
 assert.equal(preview.skipped.length,2);
 assert.deepEqual(preview.reviewSlots.map(x=>x.type),['bar','bar']);
 assert.equal(JSON.stringify(p),state,'review is non-destructive');
 assert.throws(()=>T.plan(p,src,opts(p)),/수동|직접/);
});
test('manual chart assignment binds both native UBS slots without touching the source SVG',async()=>{
 const p=await prepared(),src=excel(sourceRows,'ubs-manual'),unchanged=JSON.stringify(p);
 const preview=T.plan(p,src,opts(p,{previewOnly:true}));
 const plan=T.plan(p,src,opts(p,{manualOverrides:overrides(preview)}));
 assert.equal(plan.updates.length,2);
 assert.ok(plan.updates.every(x=>x.virtual&&x.confirmed&&x.matchReason==='writer-selected-ubs'));
 assert.ok(plan.updates.every(x=>x.block.data.palette==='ubs'));
 const next=T.apply(p,plan);
 assert.equal(JSON.stringify(p),unchanged);
 assert.deepEqual(next.pages[3].elements.at(-1).data.values,[100,130]);
 assert.deepEqual(next.pages[4].elements.at(-1).data.values,[400,460]);
 assert.equal(next.pages[3].elements.at(-1).dataBinding?.datasetId,src.id);
 assert.equal(next.pages[3].referenceFidelity.mode,'source-ratio');
 assert.equal(next.pages[3].referenceFidelity.measuredScore,null);
 assert.match(X.exportHTML(next),/ubs-manual\.xlsx/);
 assert.match(X.exportHTML(next),/ubs-source-layer/);
});
test('a second import cannot cover either already linked UBS chart position',async()=>{
 const p=await prepared(),src=excel(sourceRows);
 const review=T.plan(p,src,opts(p,{previewOnly:true}));
 const next=T.apply(p,T.plan(p,src,opts(p,{manualOverrides:overrides(review)})));
 assert.throws(()=>T.plan(next,src,opts(next,{previewOnly:true})),/이미 사용 중/);
});
test('reviewed UBS mapping refuses a changed chart region or modified source page atomically',async()=>{
 const p=await prepared(),src=excel(sourceRows);
 const review=T.plan(p,src,opts(p,{previewOnly:true}));
 const plan=T.plan(p,src,opts(p,{manualOverrides:overrides(review)}));
 p.pages[3].elements[0].x+=5;
 const before=JSON.stringify(p);
 assert.throws(()=>T.apply(p,plan),/변경/);
 assert.equal(JSON.stringify(p),before);
});
test('separate UBS six-page instances never share data or chart placement',async()=>{
 const p=await prepared(),second=P.buildPack('FIN-16','original');
 p.pages.push(...second);
 const src=excel(sourceRows),options={...opts(p),packInstanceId:second[0].designPackId};
 const preview=T.plan(p,src,{...options,previewOnly:true});
 const next=T.apply(p,T.plan(p,src,{...options,manualOverrides:overrides(preview)}));
 assert.equal(next.pages.slice(0,6).flatMap(pg=>pg.elements.filter(el=>el.dataBinding)).length,0);
 assert.equal(next.pages.slice(6).flatMap(pg=>pg.elements.filter(el=>el.dataBinding)).length,2);
});
test('negative and zero numeric values remain signed, while non-numbers fail closed',async()=>{
 const p=await prepared(),valid=excel([['Year','Distribution','Wealth'],[2024,-6,0],[2025,0,9]],'signed');
 const preview=T.plan(p,valid,opts(p,{previewOnly:true}));
 const plan=T.plan(p,valid,opts(p,{manualOverrides:overrides(preview)}));
 assert.deepEqual(plan.updates[0].block.data.values,[-6,0]);
 const invalid=excel([['Year','Distribution','Wealth'],[2024,'unknown',0],[2025,4,9]],'invalid');
 const reviewed=T.plan(p,invalid,opts(p,{manualOverrides:overrides(preview)}));
 assert.equal(reviewed.updates.length,1);
 assert.ok(reviewed.skipped.length>0);
});
test('an unrecognized all-numeric category requires explicit dimension confirmation',async()=>{
 const p=await prepared(),src=excel([['X','Distribution','Wealth'],[2024,5,7],[2025,6,9]]);
 const preview=T.plan(p,src,opts(p,{previewOnly:true}));
 assert.equal(preview.labelConfidence,'unconfirmed-numeric-dimension');
 assert.equal(preview.suggestions.length,0);
 const writer=T.plan(p,src,opts(p,{labelColumn:0,manualOverrides:overrides(preview),previewOnly:true}));
 assert.equal(writer.labelConfidence,'writer-selected');
 assert.equal(writer.suggestions.length,2);
});
test('large workbook exports only the selected derived chart series and source trail',async()=>{
 const p=await prepared(),rows=[['Year','Distribution','Wealth',...Array.from({length:69},(_,i)=>'Extra'+i)]];
 for(let n=0;n<82;n++)rows.push([n+2000,n-40,100+n,...Array(69).fill(n)]);
 const src=excel(rows,'large-ubs');
 const options=opts(p,{range:'A1:C83'});
 const review=T.plan(p,src,{...options,previewOnly:true});
 const plan=T.plan(p,src,{...options,manualOverrides:overrides(review)});
 assert.equal(plan.mode,'derived-results');
 assert.ok(plan.storedCells<plan.sourceCells);
 const done=T.apply(p,plan);
 assert.equal(done.pages[3].elements.at(-1).data.values.length,82);
 assert.equal(done.pages[3].elements.at(-1).data.values[0],-40);
 assert.match(done.pages[3].elements.at(-1).source,/large-ubs\.xlsx/);
});
test('UI wiring loads UBS mapper after the generic matcher, and has a retry control',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const panel=fs.readFileSync(path.join(__dirname,'../assets/data_panel.js'),'utf8');
 const app=fs.readFileSync(path.join(__dirname,'../assets/app.js'),'utf8');
 const sources=[...html.matchAll(/<script src="\.\/assets\/([^"]+)" defer><\/script>/g)].map(m=>m[1]);
 assert.ok(sources.indexOf('ubs_pack_mapper.js')>sources.indexOf('template_data_mapper.js'));
 assert.ok(sources.indexOf('ubs_pack_mapper.js')<sources.indexOf('data_panel.js'));
 assert.match(html,/id="kitUBSRetry"/);
 assert.match(app,/case 'kit-ubs-retry'/);
 assert.match(app,/docut-ubs-vector-error/);
 assert.match(panel,/plan\.family==='FIN-16'/);
});
