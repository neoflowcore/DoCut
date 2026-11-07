'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../assets/core.js');
require('../assets/core_enhanced.js');
const X=require('../assets/export.js');
const P=require('../assets/pptx.js');

test('50-page, 800-element report stays editable through HTML and PPTX exports without installers',()=>{
 const p=C.createProject(8,'research');
 p.pages=Array.from({length:50},(_,i)=>{
  const page=C.createPage(i,50,'research');
  page.tab=`Section ${i+1}`;
  page.elements=Array.from({length:16},(_,j)=>C.makeBlock('text',(j%4)*302,(Math.floor(j/4))*169,{
   w:278,h:145,text:`Item ${i}-${j}: evidence and recommendation`,source:`reference ${i}.${j}`,verified:false,
   richText:[{text:`Item ${i}-${j}`,bold:true,color:'#48657A'},{text:': evidence and recommendation'}],
   effects:[C.makeEffect('rise',600),C.makeEffect('fade',420,100)]
  }));
  return page;
 });
 const normalized=C.normalizeProject(p);
 assert.equal(normalized.pages.length,50);
 assert.equal(normalized.pages.reduce((n,pg)=>n+pg.elements.length,0),800);
 assert.equal(new Set(normalized.pages.flatMap(pg=>pg.elements.map(el=>el.id))).size,800);
 const html=X.exportHTML(normalized);
 assert.match(html,/Section 50/);
 assert.match(html,/reference 49\.15/);
 const pptx=Buffer.from(P.createPPTX(normalized));
 assert.ok(pptx.length>100000);
 assert.ok(pptx.toString('latin1').includes('ppt/slides/slide50.xml'));
});

test('text posing as an HTML end script tag remains inert report content',()=>{
 const p=C.createProject(1);
 const dangerous='Notice </script><script>window.__docut_attack=1</script> & <strong>plain</strong>';
 p.pages[0].elements=[C.makeBlock('text',40,120,{text:dangerous,effects:[]})];
 const html=X.exportHTML(p);
 assert.ok(!html.includes('<script>window.__docut_attack=1</script>'));
 assert.ok(html.includes('&lt;script&gt;'));
 assert.ok(html.includes('\\u003c/script\\u003e') || html.includes('\\u003c'));
});
