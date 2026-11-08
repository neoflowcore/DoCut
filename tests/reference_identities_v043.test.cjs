'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../assets/core.js');
require('../assets/story_player.js');
require('../assets/core_enhanced.js');
require('../assets/branding.js');
require('../assets/editorial_mckinsey.js');
require('../assets/editorial_bcg.js');
const R=require('../assets/reference_identity_core.js');
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
const W=require('../assets/workbook.js');
require('../assets/analytics_engine.js');
const DM=require('../assets/data_motion.js');
const X=require('../assets/export.js');
const Panel=require('../assets/data_panel.js');
const {PACKS}=P;
const EXPECTED=['STR-01','STR-02','STR-03','STR-04','STR-05','EARN-06','EARN-07','CORP-08','CORP-09','EARN-10','EARN-11','EARN-12','CORP-13','FIN-14','FIN-15','FIN-16','FIN-17','PUB-18','PUB-19','PUB-20'];
const BRANDED=EXPECTED.filter(id=>id!=='FIN-16');
const paletteId=id=>R.get(id)?.chartKey||(id==='STR-01'?'editorial-blue':id==='STR-02'?'emerald-market':null);
test('all 20 catalog IDs are preserved and 17 additional independent identity modules register',()=>{
 assert.deepEqual(PACKS.map(p=>p.id),EXPECTED);
 assert.equal(R.ids().length,17);
 assert.equal(new Set(R.ids()).size,17);
 for(const id of BRANDED)assert.ok(paletteId(id),id);
});
test('19 native company identities have six distinctly editable 16:9 pages (UBS special vector is separate)',()=>{
 const firstPage=new Set();
 for(const p of PACKS){
  if(p.id==='FIN-16')continue; // UBS source-ratio SVG loads asynchronously; not a native page-geometry claim.
  const pages=P.buildPack(p.id),layouts=new Set();
  assert.equal(pages.length,6,p.id);
  for(let i=0;i<pages.length;i++){
   const pg=pages[i];
   assert.equal(pg.customTab,true,p.id+'/'+i);
   assert.equal(pg.designIdentity,p.id,'template identity must survive creation');
   assert.equal(pg.transition,'none',p.id+'/'+i);
   assert.ok(pg.elements.length>=5&&pg.elements.length<=120,p.id+'/'+i);
   assert.ok(pg.elements.some(e=>e.type==='title'),p.id+'/'+i);
   const normalized=C.normalizeProject({title:'Layout test',pages:[pg]});
   assert.equal(normalized.pages[0].designIdentity,p.id,'native JSON load must retain template identity');
   const ids=new Set();
   for(const e of pg.elements){
    assert.ok(e.x>=0&&e.y>=0&&e.x+e.w<=1280&&e.y+e.h<=720,p.id+'/'+i+'/'+e.type);
    assert.ok(!ids.has(e.id),p.id+'/'+i);ids.add(e.id);
    assert.equal(e.locked,false);assert.equal(e.hidden,false);assert.equal(e.verified,false);
    assert.deepEqual(e.effects,[]);assert.equal(e.source,'');
    if(['bar','line','donut'].includes(e.type))assert.deepEqual(e.data.values,[0,0,0,0],p.id+'/'+i);
   }
   const serialized=JSON.stringify(pg);
   assert.ok(!serialized.includes(p.company),p.id+'/'+i);
   assert.ok(!serialized.includes(p.originalTitle),p.id+'/'+i);
   assert.ok(!serialized.includes(p.source),p.id+'/'+i);
   const signature=pg.elements.map(e=>[e.type,e.x,e.y,e.w,e.h]).join('|');
   layouts.add(signature);
   if(i===0&&p.id!=='FIN-16'){assert.ok(!firstPage.has(signature),p.id+' repeats another company cover');firstPage.add(signature);}
  }
  assert.equal(layouts.size,6,p.id);
 }
});
test('original palette override never silently rearranges text or geometry',()=>{
 for(const id of BRANDED)for(let i=0;i<6;i++){
  const a=P.buildPage(id,i),b=P.buildPage(id,i,'wood');
  const projection=pg=>pg.elements.map(e=>[e.type,e.x,e.y,e.w,e.h,e.text]);
  assert.deepEqual(projection(a),projection(b),id+'/'+i);
 }
});
test('company chart types and palette survive Excel negative/zero data replacement and HTML export',()=>{
 const raw=W.fromRows([['Period','Value'],['Quarter A','12'],['Quarter B','-5'],['Quarter C','0']],{id:'data-v043',fileName:'earnings.xlsx'});
 const ds=DM.dataset(raw);
 const spec=DM.binding({datasetId:ds.id,sheetId:'1',range:'A1:B4',labelColumn:0,valueColumn:1,header:true});
 let count=0;
 for(const id of BRANDED){
  const pg=P.buildPack(id).find(page=>page.elements.some(e=>['bar','line'].includes(e.type)));
  if(!pg)continue;
  const target=pg.elements.find(e=>['bar','line'].includes(e.type)),linked=DM.materialize(target,ds,spec);
  assert.deepEqual(linked.data.values,[12,-5,0],id);
  assert.equal(linked.data.palette,target.data.palette,id);
  const project=C.createProject(3);project.pages=[pg];project.datasets=[ds];
  project.pages[0].elements[pg.elements.indexOf(target)]=linked;
  const html=X.exportHTML(project);
  assert.ok(html.includes('chart-svg'),id);
  assert.ok(html.includes('earnings.xlsx'),id);
  assert.ok(html.includes(target.data.palette),id);
  count++;
 }
 assert.equal(count,19,'Every native company family must include a bar or line slot that survives Excel rebind');
});
test('data-linked 360-point bar charts retain the full source after normalization',()=>{
 const labels=Array.from({length:360},(_,i)=>'P'+i),values=Array.from({length:360},(_,i)=>i-180);
 const template=C.makeBlock('bar',120,260,{w:720,h:302,effects:[],dataBinding:{datasetId:'src',sheetId:'1',range:'A1:B360',labelColumn:0,valueColumn:1,header:true},data:{labels,values,palette:'default'}});
 const el=C.normalizeBlock(template);
 assert.equal(el.data.labels.length,360);assert.equal(el.data.values.length,360);
 assert.equal(el.data.values[0],-180);
 assert.equal(el.data.values[359],179);
 const svg=X.svgChart(el);
 assert.equal((svg.match(/<rect /g)||[]).length,360);
});
test('all authoring palettes are registered by data engine and distinct by identity',()=>{
 assert.equal(R.palettes().length,17);
 for(const p of R.palettes())assert.ok(Array.isArray(C.CHART_PALETTES[p.id])&&C.CHART_PALETTES[p.id].length>=2,p.id);
 assert.notDeepEqual(C.CHART_PALETTES['bain-red-deals'],C.CHART_PALETTES['lime-human-capital']);
 assert.notDeepEqual(C.CHART_PALETTES['nvidia-chart-green'],C.CHART_PALETTES['blackrock-strategy']);
});

test('native registry has independently authored cover geometry and each pack keeps its own palette',()=>{
 const covers=new Map();
 for(const id of BRANDED){
  const pg=P.buildPage(id,0);
  const signature=pg.elements.map(e=>[e.type,e.x,e.y,e.w,e.h].join(':')).join('|');
  assert.ok(!covers.has(signature),id+' unexpectedly matches '+covers.get(signature));
  covers.set(signature,id);
  const pal=paletteId(id);
  assert.ok(pal&&Array.isArray(C.CHART_PALETTES[pal]),id);
 }
 assert.equal(covers.size,19);
});
test('palette inference survives page JSON normalization and works on every page including cover without charts',()=>{
 for(const id of BRANDED){
  const expected=paletteId(id);
  for(let i=0;i<6;i++){
   const page=P.buildPage(id,i);
   const saved=C.normalizeProject({title:'palette',pages:[page]}).pages[0];
   assert.equal(Panel.suggestedPalette(saved,null,false),expected,id+'/'+i);
  }
 }
 assert.equal(Panel.suggestedPalette(P.buildPage('FIN-16',0),null,true),'ubs');
 assert.equal(Panel.suggestedPalette({designIdentity:'unknown',elements:[]},null,false),'default');
});
test('portfolio donut palette remains linked and preserves nonnegative category values',()=>{
 const pg=P.buildPack('FIN-17').find(p=>p.elements.some(e=>e.type==='donut'));
 assert.ok(pg);
 const target=pg.elements.find(e=>e.type==='donut');
 const dataset=DM.dataset(W.fromRows([['Class','AUM'],['A',12],['B',5],['C',0]],{id:'invest',fileName:'portfolio.xlsx'}));
 const spec=DM.binding({datasetId:dataset.id,sheetId:'1',range:'A1:B4',labelColumn:0,valueColumn:1,header:true});
 const linked=DM.materialize(target,dataset,spec);
 assert.deepEqual(linked.data.values,[12,5,0]);
 assert.equal(linked.data.palette,'blackrock-strategy');
 const p=C.createProject(3);p.pages=[pg];p.datasets=[dataset];p.pages[0].elements[pg.elements.indexOf(target)]=linked;
 const html=X.exportHTML(p);
 assert.ok(html.includes('blackrock-strategy'));
 assert.ok(html.includes('portfolio.xlsx'));
});
