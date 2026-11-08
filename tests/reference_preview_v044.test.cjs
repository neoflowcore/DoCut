'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../assets/core.js');
require('../assets/story_player.js');
require('../assets/core_enhanced.js');
require('../assets/page_kits.js');
const K=globalThis.DocutPageKits;
require('../assets/reference_identity_core.js');
require('../assets/refpack_04_deloitte.js');
require('../assets/refpack_05_accenture.js');
require('../assets/refpack_18_wef.js');
const R=require('../assets/reference_identity_core.js');
function report(id,n){const p=R.build(id,n);p.designIdentity=id;return p;}
test('professional detailed template previews render every element, not the old first 60',()=>{
 const page=report('PUB-18',2);
 assert.ok(page.elements.length>20);
 const long=C.normalizeProject({title:'Long',pages:[page]}).pages[0];
 const preview=K.previewMarkup(long);
 assert.equal((preview.match(/class="kit-map-block"/g)||[]).length,long.elements.length);
 assert.ok(preview.includes('container')===false);
 assert.ok(preview.includes('font-size:clamp('));
});
test('thumbnail remains bounded and selected-page detail remains complete',()=>{
 const page=report('STR-04',5);
 const mini=K.previewMarkup(page,{compact:true});
 const detail=K.previewMarkup(page);
 assert.equal((mini.match(/class="kit-map-block"/g)||[]).length,Math.min(22,page.elements.length));
 assert.equal((detail.match(/class="kit-map-block"/g)||[]).length,page.elements.length);
});
test('native 120-element report composition does not silently truncate',()=>{
 const doc=C.createProject(1),page=doc.pages[0];page.designIdentity='STR-04';
 page.layout='blank';page.elements=[];
 for(let i=0;i<100;i++){
  const el=C.makeBlock('shape',(i%20)*60,(Math.floor(i/20))*80,{w:20,h:20,text:'',style:{background:'#FF0000',opacity:1}});
  page.elements.push(C.normalizeBlock(el));
 }
 const p=C.normalizeProject(doc).pages[0];
 const html=K.previewMarkup(p);
 assert.equal((html.match(/class="kit-map-block"/g)||[]).length,100);
 assert.equal((K.previewMarkup(p,{compact:true}).match(/class="kit-map-block"/g)||[]).length,22);
});
test('template gallery preview text is escaped and never executable',()=>{
 const page=report('STR-05',0),el=page.elements.find(e=>e.type==='title');
 el.text='<img src=x onerror=alert(1)>';
 const html=K.previewMarkup(page);
 assert.ok(html.includes('&lt;img'));
 assert.ok(!html.includes('<img src=x'));
});
