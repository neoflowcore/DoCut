'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../assets/core.js');
require('../assets/story_player.js');
require('../assets/core_enhanced.js');
require('../assets/branding.js');
require('../assets/editorial_mckinsey.js');
require('../assets/editorial_bcg.js');
require('../assets/reference_identity_core.js');
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
require('../assets/page_kits.js');
const K=globalThis.DocutPageKits;
const NATIVE=P.PACKS.filter(p=>p.id!=='FIN-16');
function overlap(a,b){
 const width=Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x);
 const height=Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y);
 return Math.max(0,width)*Math.max(0,height);
}
test('20 public reference families remain selectable and 19 preserve native six-page identities',()=>{
 assert.equal(P.PACKS.length,20);
 assert.equal(NATIVE.length,19);
 let pages=0;const coverLayouts=new Set();
 for(const entry of NATIVE){
  const pack=P.buildPack(entry.id);assert.equal(pack.length,6,entry.id);
  const layouts=new Set();
  for(const page of pack){
   pages++;
   assert.equal(page.designIdentity,entry.id);
   assert.equal(page.layout,'blank');
   assert.equal(page.transition,'none');
   assert.equal(page.customTab,true);
   assert.ok(page.elements.length>=5&&page.elements.length<=120,entry.id+' '+page.tab);
   assert.ok(page.elements.some(b=>b.type==='title'));
   const normalized=C.normalizeProject({title:'QA',pages:[page]}).pages[0];
   assert.equal(normalized.designIdentity,entry.id);
   const signature=page.elements.map(el=>[el.type,el.x,el.y,el.w,el.h].join(':')).join('|');
   layouts.add(signature);
   if(page===pack[0]){assert.ok(!coverLayouts.has(signature),'duplicate cover geometry: '+entry.id);coverLayouts.add(signature);}
   const content=page.elements.filter(el=>['text','title','kpi'].includes(el.type));
   for(let i=0;i<content.length;i++){
    const a=content[i];
    assert.ok(a.x>=0&&a.y>=0&&a.x+a.w<=1280&&a.y+a.h<=720,entry.id+'/'+page.tab);
    for(let j=i+1;j<content.length;j++){
     assert.equal(overlap(a,content[j]),0,'overlapping editable text blocks: '+entry.id+'/'+page.tab);
    }
   }
   for(const element of page.elements){
    assert.ok(element.x>=0&&element.y>=0&&element.x+element.w<=1280&&element.y+element.h<=720);
    assert.equal(element.verified,false,'unverified sample');
    assert.equal(element.hidden,false);
    assert.equal(element.locked,false);
    assert.deepEqual(element.effects,[]);
    assert.notEqual(element.type,'image','third-party images are not bundled');
    if(['bar','line','donut'].includes(element.type))assert.ok(element.data.values.every(n=>n===0),'no invented numeric report figures');
   }
  }
  assert.equal(layouts.size,6,'page variety lost: '+entry.id);
 }
 assert.equal(pages,114);
 assert.equal(coverLayouts.size,19);
});
test('preview remains complete for native company detail and compact in the gallery',()=>{
 for(const entry of NATIVE){
  const page=P.buildPage(entry.id,Math.min(3,5));
  const preview=K.previewMarkup(page);
  const thumbnail=K.previewMarkup(page,{compact:true});
  assert.equal((preview.match(/class="kit-map-block"/g)||[]).length,page.elements.length);
  assert.equal((thumbnail.match(/class="kit-map-block"/g)||[]).length,Math.min(22,page.elements.length));
 }
});
