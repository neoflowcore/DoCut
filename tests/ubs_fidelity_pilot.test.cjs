const {test}=require('node:test');const assert=require('node:assert/strict');
require('../assets/core.js');require('../assets/core_enhanced.js');require('../assets/pro_reports.js');require('../assets/ubs_fidelity.js');
const UBS=global.DocutUBSFidelity,PRO=global.DocutProReports,C=global.DocutCore;
test('UBS pilot is vector-only 16:9 with explicit unverified status',()=>{
 const pages=PRO.buildPack('FIN-16');assert.equal(pages.length,6);
 for(const p of pages){assert.equal(p.referenceFidelity.mode,'adapted-16:9');assert.equal(p.referenceFidelity.status,'unverified');assert.equal(p.referenceFidelity.measuredScore,null);assert.ok(p.elements.length>30);assert.ok(p.elements.every(e=>['shape','text'].includes(e.type)),'No bitmap/photo is allowed in vector pilot');assert.ok(p.elements.every(e=>e.x>=0&&e.y>=0&&e.x+e.w<=1280&&e.y+e.h<=720));assert.ok(p.elements.every(e=>e.verified===false));}
});
test('UBS six pages have different vector topology and a real red accent',()=>{
 const pages=PRO.buildPack('FIN-16');let signatures=pages.map(p=>p.elements.map(e=>`${e.type}:${Math.round(e.x)}:${Math.round(e.y)}:${Math.round(e.w)}:${Math.round(e.h)}`).join(';'));
 assert.equal(new Set(signatures).size,6);assert.ok(pages[0].elements.some(e=>e.style.background==='#F0EEE8'));assert.ok(pages.every(p=>p.elements.some(e=>e.style.background==='#BD2432')));
});
test('legacy palette fallback remains available; unrelated packs unchanged',()=>{
 assert.equal(PRO.buildPage('FIN-16',0,'wood').referenceFidelity,undefined);
 assert.equal(PRO.buildPage('EARN-06',0).referenceFidelity,undefined);
});
test('UBS pilot can be imported as editable native objects with content intact',()=>{
 const a=PRO.buildPage('FIN-16',0);const project=C.createProject(5);project.pages[0]=a;const again=C.normalizeProject(project);
 assert.equal(again.pages[0].elements.length,a.elements.length);
 assert.ok(again.pages[0].elements.some(e=>e.type==='shape'&&e.style.background==='#F0EEE8'));
});

test('SVG-compatible hairlines are preserved as editable one-pixel shapes',()=>{
 const shape=C.makeBlock('shape',45,70,{w:1,h:2,text:'',style:{background:'#B12030',opacity:1}});const thin=C.normalizeBlock(shape);assert.equal(thin.w,1);assert.equal(thin.h,2);const title=C.normalizeBlock(C.makeBlock('title',50,90,{w:2,h:2}));assert.ok(title.w>=40);
});
