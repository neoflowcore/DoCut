'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../assets/core.js');require('../assets/core_enhanced.js');
const P=require('../assets/pptx.js');

test('PPTX OOXML accessible descriptions preserve evidence as data without cluttering slides',()=>{
 const p=C.createProject(1),els=p.pages[0].elements;
 for(const [i,type] of ['text','bar','table','image'].entries()){
  const e=C.makeBlock(type,50+i*50,50+i*80,{source:'Report & Audit <2026>',asOfDate:'2026-11-03',unit:'%',evidence:'Numerator / denominator',verified:false});
  if(type==='image')e.data={src:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/6VwAAAAASUVORK5CYII=',alt:'Marker'};
  els.push(e);
 }
 const pptx=Buffer.from(P.createPPTX(p)).toString('utf8');
 assert.match(pptx,/descr="출처: Report &amp; Audit &lt;2026&gt;/);
 assert.match(pptx,/기준일: 2026-11-03/);
 assert.match(pptx,/단위: %/);
 assert.match(pptx,/근거·산식: Numerator \/ denominator/);
 assert.match(pptx,/검증 상태: 미확인/);
 assert.equal((pptx.match(/descr="출처: Report &amp; Audit/g)||[]).length,4);
});
