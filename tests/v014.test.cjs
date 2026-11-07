'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../assets/core.js');require('../assets/core_enhanced.js');
const E=require('../assets/easing.js');const P=require('../assets/pptx.js');const X=require('../assets/export.js');const H=require('../assets/css_import.js');

test('current development version is identified, not confused with original V0.12',()=>assert.equal(C.VERSION,'0.34.0-development'));
test('custom start pose keeps preset end pose',()=>{
 const fx=C.normalizeEffect({...C.makeEffect('rise'),start:{x:88,y:0,scale:1,rotate:0,opacity:.2}});
 assert.equal(E.effectPose(fx,0).x,88);assert.equal(E.effectPose(fx,0).opacity,.2);
 assert.equal(E.effectPose(fx,1).y,0);assert.equal(E.effectPose(fx,1).opacity,1);
});
test('custom end pose keeps preset start pose',()=>{
 const fx=C.normalizeEffect({...C.makeEffect('slide-left'),end:{x:45,opacity:.4,scale:1,rotate:90}});
 assert.equal(E.effectPose(fx,0).x,-65);assert.equal(E.effectPose(fx,1).x,45);
});
test('pose model persists brightness and blur',()=>{
 const fx=C.normalizeEffect({...C.makeEffect('zoom'),start:{x:0,y:0,rotate:0,scale:.5,opacity:.8,blur:8,brightness:1.4},end:{x:0,y:0,rotate:0,scale:1.25,opacity:1,blur:0,brightness:1}});
 const project=C.createProject();project.pages[0].elements[0].effects=[fx];
 const out=C.normalizeProject(project).pages[0].elements[0].effects[0];
 assert.equal(out.start.blur,8);assert.equal(out.start.brightness,1.4);
 assert.equal(out.end.scale,1.25);assert.ok(E.effectPose(out,0.5).blur>0);
});
test('mid keyframes preserve seven pose channels',()=>{
 const fx=C.normalizeEffect({...C.makeEffect('rise'),keyframes:[{at:.3,x:30,y:15,rotate:40,scale:1.3,opacity:.6,blur:4,brightness:1.2}]});
 const p=E.effectPose(fx,.3);assert.equal(p.x,30);assert.equal(p.blur,4);assert.equal(p.brightness,1.2);
});
test('large motion duration bounds sampling, motion remains finite',()=>{
 const out=E.buildFrames([C.makeEffect('fade',4000,8000),C.makeEffect('rise',4000,8000),C.makeEffect('glow',4000,8000)],1000/60);
 assert.ok(out.frames.length<=361);assert.equal(out.frames.at(-1).offset,1);assert.ok(out.frames.every(x=>!JSON.stringify(x).includes('NaN')));
});
test('dense layout uses distinct visible coordinates and preserves data source',()=>{
 const project=C.createProject(),p=project.pages[0];p.elements=[];
 for(let i=0;i<11;i++)p.elements.push(C.makeBlock('text',10+i,20+i,{source:'Ref '+i,text:'Item '+i}));
 const before=p.elements.map(e=>e.text);C.applyLayout(p,'three',true);
 assert.deepEqual(p.elements.map(e=>e.text),before);
 assert.equal(new Set(p.elements.map(e=>e.x+':'+e.y)).size,11);
 assert.equal(p.elements[10].source,'Ref 10');
});
test('locked elements are not moved in dense layout',()=>{
 const p=C.createProject().pages[0];p.elements.push(C.makeBlock('text',25,300,{locked:true}));C.applyLayout(p,'three',true);assert.equal(p.elements.at(-1).x,25);
});
test('overflowing imported element normalized into 16:9 canvas',()=>{
 const b=C.normalizeBlock({...C.makeBlock('text',1255,702),x:1255,y:702,w:700,h:120});
 assert.ok(b.x+b.w<=C.WIDTH);assert.ok(b.y+b.h<=C.HEIGHT);
});
test('embedded image filter allows local data only',()=>{
 assert.ok(H.embeddedImage({getAttribute:()=> 'data:image/png;base64,iVBORw0KGgo='}).startsWith('data:image'));
 assert.equal(H.embeddedImage({getAttribute:()=> 'https://tracker.test/pic.png'}),'');
 assert.equal(H.embeddedImage({getAttribute:()=> 'data:image/svg+xml;base64,AAAA'}),'');
});
test('PPTX image filenames unique across slides, and report master logo appears',()=>{
 const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/6VwAAAAASUVORK5CYII=';
 const p=C.createProject(2);p.pages.forEach(pg=>pg.elements.push(C.makeBlock('image',40,100,{data:{src:image,alt:'local image'}})));
 p.master.logo=image;
 const data=Buffer.from(P.createPPTX(p)).toString('latin1');
 const names=[...data.matchAll(/ppt\/media\/image\d+\.png/g)].map(m=>m[0]);
 assert.equal(new Set(names).size,4);assert.equal(names.length,8); // local headers + central directory
 assert.match(data, /<p:pic>/);
});
test('PPTX rich text emits editable run styles',()=>{
 const p=C.createProject(1),e=p.pages[0].elements[0];
 e.text='Bold Normal';e.richText=[{text:'Bold',bold:true,color:'#aa0000'},{text:' Normal',normalWeight:true,underline:true}];
 const ppt=Buffer.from(P.createPPTX(p)).toString('utf8');assert.match(ppt,/b="1"/);assert.match(ppt,/u="sng"/);assert.match(ppt,/AA0000/);
});
test('PPTX line chart preserves descending and ascending segments',()=>{
 const p=C.createProject(1);p.pages[0].elements=[C.makeBlock('line',40,90,{data:{labels:['1','2','3'],values:[30,15,40]}})];
 const ppt=Buffer.from(P.createPPTX(p)).toString('utf8');assert.match(ppt,/flipV="1"/);
});
test('HTML output keeps edited pose values in native project JSON',()=>{
 const p=C.createProject(1),e=p.pages[0].elements[0];e.effects=[C.normalizeEffect({...C.makeEffect('fade'),end:{x:45,y:0,rotate:0,scale:1,opacity:1}})];
 const html=X.exportHTML(p);assert.match(html,/\"x\":45/);
});
test('data quality warns on sourced-but-unverified, missing source, and explicit low contrast',()=>{
 const p=C.createProject(1),els=p.pages[0].elements;
 const bar=C.makeBlock('bar',40,100,{source:'data.csv',verified:false});
 const kpi=C.makeBlock('kpi',500,100,{source:'',verified:true});
 const quote=C.makeBlock('quote',60,400,{text:'Text',style:{color:'#777777',background:'#888888',size:24}});
 els.push(bar,kpi,quote);
 const kinds=C.auditProject(p).map(x=>x.type);
 assert.ok(kinds.includes('verification'));assert.ok(kinds.includes('source'));assert.ok(kinds.includes('contrast'));
});
test('remote passive media URLs are removed before inert HTML parsing',()=>{
 const input='<img src="https://tracking.invalid/a.png" srcset="https://tracking.invalid/2.png 2x" alt="Hello"><img src="data:image/png;base64,AAAA">';
 const clean=H.neutralizeRemoteMedia(input);
 assert.ok(!clean.includes('tracking.invalid'));assert.match(clean,/data:image\/png;base64,AAAA/);assert.match(clean,/alt="Hello"/);
});
test('PowerPoint theme background uses the report theme instead of all-white',()=>{
 const p=C.createProject(1);p.theme='ambient';const contents=Buffer.from(P.createPPTX(p)).toString('utf8');
 assert.match(contents, /<a:gradFill/);assert.match(contents, /val="1E2536"/);assert.match(contents, /val="141822"/);
});
