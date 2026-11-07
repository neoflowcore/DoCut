'use strict';
/* 18-page focused layout unit gates. No browser/visual claims. */
const {test}=require('node:test'),assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../assets/pro_reports.js'),'utf8');
const root={DocutCore:{
 uid:(prefix)=>prefix+'-fixture',
 makeBlock:(type,x,y,options)=>({type,x,y,...options}),
 normalizeBlock:x=>x
}};
vm.runInNewContext(src,{globalThis:root,module:{exports:{}},console});
const P=root.DocutProReports;
test('three priority packs have 18 distinct edit-ready layouts',()=>{
 const unique=new Set();
 for(const id of ['STR-01','STR-02','FIN-17']){
  const pages=P.buildPack(id);assert.equal(pages.length,6);
  assert.equal(P.find(id).patterns.length,6);
  for(let i=0;i<pages.length;i++){
   const page=pages[i];assert.ok(page.elements.length>=6,id+' / '+i);
   const parts=page.elements.map(e=>[e.type,e.x,e.y,e.w,e.h].join(':')).join('|');
   unique.add(parts);
   assert.ok(page.elements.every(e=>e.x>=0&&e.y>=0&&e.x+e.w<=1280&&e.y+e.h<=720),id+' / '+i+' geometry');
   assert.ok(page.elements.every(e=>e.locked===false));
   assert.ok(page.elements.every(e=>Array.isArray(e.effects)&&e.effects.length===0));
   assert.ok(page.elements.filter(e=>e.type==='kpi').every(e=>String(e.text).startsWith('—')));
  }
 }
 assert.equal(unique.size,18);
});
test('legacy other 17 company packs remain accessible and user data is never fabricated',()=>{
 assert.equal(P.PACKS.length,20);
 for(const pack of P.PACKS){
  const pages=P.buildPack(pack.id);
  assert.equal(pages.length,6);
  assert.ok(pack.source.startsWith('https://'));
  for(const page of pages){
   assert.equal(page.layout,'blank');
   assert.equal(page.transition,'none');
   assert.match(page.subtitle,/실제 자료와 출처 입력 전/);
  }
 }
 assert.match(src,/DocutUBSVectorSource/);
});
