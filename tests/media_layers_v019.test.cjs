'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../assets/core.js');require('../assets/core_enhanced.js');
const M=require('../assets/media_layout.js');
const L=require('../assets/layer_ops.js');
const X=require('../assets/export.js');
const P=require('../assets/pptx.js');
const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/6VwAAAAASUVORK5CYII=';
const uid=(()=>{let n=0;return type=>(type||'el')+'-'+(++n)})();

test('PNG and bounded JPEG/WebP headers: no external resource or invalid dimensions',()=>{
 assert.deepEqual(M.dimensions(PNG),{width:1,height:1});
 const jpeg=Buffer.from([0xff,0xd8,0xff,0xc0,0,11,8,0,2,0,4,3,1,0x11,0,2,0x11,0,3,0x11,0,0xff,0xd9]);
 assert.deepEqual(M.dimensions('data:image/jpeg;base64,'+jpeg.toString('base64')),{width:4,height:2});
 const webp=Buffer.from('RIFF________WEBPVP8X\0\0\0\0\0\0\0\0\x03\0\0\x01\0\0','binary');
 const webpSize=M.dimensions('data:image/webp;base64,'+webp.toString('base64'));
 assert.equal(webpSize===null||Number.isInteger(webpSize.width),true);
 assert.equal(M.dimensions('https://remote.example.net/pixel.png'),null);
 assert.equal(M.dimensions('data:image/svg+xml;base64,AAAA'),null);
 assert.equal(M.dimensions('data:image/png;base64,AAAA'),null);
});

test('cover cropping obeys focal position, zoom and scale; contain never distorts',()=>{
 const cover=M.frame({width:800,height:400},{w:300,h:300},{imageFit:'cover',focusX:0,focusY:50,cropZoom:1});
 assert.equal(cover.mode,'cover');assert.equal(cover.w,600);assert.equal(cover.h,300);
 assert.equal(cover.source.left,0);assert.equal(cover.source.right,.5);
 const right=M.frame({width:800,height:400},{w:300,h:300},{imageFit:'cover',focusX:100,focusY:50,cropZoom:1});
 assert.equal(right.source.left,.5);assert.equal(right.source.right,0);
 const zoom=M.frame({width:800,height:400},{w:300,h:300},{imageFit:'cover',focusX:50,focusY:50,cropZoom:2});
 assert.equal(zoom.w,1200);assert.equal(zoom.h,600);assert.equal(zoom.source.left,.375);assert.equal(zoom.source.top,.25);
 const contain=M.frame({width:800,height:400},{w:300,h:300},{imageFit:'contain',focusX:50,focusY:50,cropZoom:3});
 assert.deepEqual([contain.w,contain.h,contain.x,contain.y],[300,150,0,75]);
 const fill=M.frame({width:800,height:400},{w:300,h:300},{imageFit:'fill'});
 assert.deepEqual([fill.w,fill.h,fill.x,fill.y],[300,300,0,0]);
});

test('crop drag maps pointer movement to clamped non-destructive focal percentages',()=>{
 const box={w:200,h:100},f=M.frame({width:600,height:200},box,{imageFit:'cover',focusX:50,focusY:50});
 const next=M.dragFocus(f,box,50,50,40,-30);
 assert.equal(next.focusX,10);assert.equal(next.focusY,50);
 assert.deepEqual(M.dragFocus(f,box,99,0,-1000,0),{focusX:100,focusY:0});
 assert.deepEqual(M.dragFocus({mode:'fill'},box,30,40,80,20),{focusX:30,focusY:40});
});

test('aspect-lock resize bounds protect full element and preserve prior ratio',()=>{
 const original={x:150,y:100,w:400,h:200};
 assert.deepEqual(M.resizeBox(original,{w:600,h:200},'w',{width:1280,height:720},true),{w:600,h:300});
 assert.deepEqual(M.resizeBox(original,{w:400,h:300},'h',{width:1280,height:720},true),{w:600,h:300});
 const limited=M.resizeBox({...original,x:1040},{w:900,h:300},'w',{width:1280,height:720},true);
 assert.equal(limited.w,240);assert.equal(limited.h,120);
 const free=M.resizeBox(original,{w:650,h:111},'both',{width:1280,height:720},false);
 assert.deepEqual(free,{w:650,h:111});
});

test('schema-3 round-trip preserves image focal point, alt, zoom, ratio-lock and source integrity',()=>{
 const p=C.createProject(1),block=C.makeBlock('image',30,60,{data:{src:PNG,width:1,height:1,alt:'Diagram & title'},style:{...C.makeBlock('image',10,10).style,imageFit:'cover',focusX:11,focusY:78,cropZoom:1.75,aspectLock:true}});
 p.pages[0].elements.push(block);
 const restored=C.normalizeProject(p).pages[0].elements.at(-1);
 assert.deepEqual(restored.data,{src:PNG,alt:'Diagram & title',width:1,height:1});
 assert.equal(restored.style.focusX,11);assert.equal(restored.style.focusY,78);
 assert.equal(restored.style.cropZoom,1.75);assert.equal(restored.style.aspectLock,true);
 const markup=X.renderInner(restored);
 assert.match(markup,/alt="Diagram &amp; title"/);assert.match(markup,/docut-image-frame/);
 assert.match(markup,/position:absolute/);
 assert.match(X.exportHTML(p),/\"cropZoom\":1\.75/);
});

test('PPTX in memory encodes source crop and contain geometry as editable picture frames',()=>{
 const p=C.createProject(1);p.pages[0].elements=[];
 p.pages[0].elements.push(C.makeBlock('image',100,70,{w:400,h:200,data:{src:PNG,alt:'tiny'},style:{...C.makeBlock('image',0,0).style,imageFit:'cover',focusX:30,focusY:80,cropZoom:1.5}}));
 p.pages[0].elements.push(C.makeBlock('image',600,70,{w:400,h:200,data:{src:PNG,alt:'tiny'},style:{...C.makeBlock('image',0,0).style,imageFit:'contain',focusX:50,focusY:50}}));
 const bytes=Buffer.from(P.createPPTX(p));const xml=bytes.toString('latin1');
 assert.equal((xml.match(/<p:pic>/g)||[]).length,2);
 assert.match(xml,/<a:srcRect l="[1-9]\d*" t="[1-9]\d*" r="[1-9]\d*" b="[1-9]\d*"\/>/);
 assert.match(xml,/DoCut Image/);
 assert.match(xml,/<a:off x="/);
});

test('multi-selection duplication remaps group only within copied items, keeps citations and skips locked',()=>{
 const elements=[{id:'a',x:4,y:3,w:40,h:40,groupId:'g',text:'one',source:'Source A'},
  {id:'b',x:52,y:3,w:40,h:40,groupId:'g',text:'two',source:'Source B'},
  {id:'c',x:100,y:3,w:40,h:40,locked:true,source:'Source C'}];
 const r=L.duplicate(elements,['a','b','c'],uid);
 assert.equal(r.added.length,2);assert.equal(r.elements.length,5);
 assert.notEqual(r.added[0].groupId,'g');assert.equal(r.added[0].groupId,r.added[1].groupId);
 assert.equal(r.added[0].source,'Source A');assert.equal(r.added[1].source,'Source B');
 assert.equal(elements.length,3);assert.equal(elements[0].x,4);
 assert.equal(L.remove(elements,['a','c']).removed.length,1);
 assert.equal(L.remove(elements,['a','c']).elements.some(e=>e.id==='c'),true);
});

test('clipboard can copy locked elements, but deletion and direct duplication cannot',()=>{
 const locked=[{id:'lock',x:0,y:0,w:100,h:100,locked:true}];
 assert.equal(L.duplicate(locked,['lock'],uid).added.length,0);
 assert.equal(L.duplicate(locked,['lock'],uid,{width:1280,height:720},26,120,true).added.length,1);
 assert.throws(()=>L.duplicate(Array.from({length:120},(_,i)=>({id:String(i),w:40,h:40,x:0,y:0})),['0'],uid),/120/);
});

test('multi nudge preserves inter-item spacing and bounds, never moves locked items',()=>{
 const elements=[{id:'a',x:0,y:70,w:100,h:100},{id:'b',x:1170,y:72,w:110,h:100},{id:'c',x:50,y:70,w:40,h:50,locked:true}];
 const blocked=L.nudge(elements,['a','b','c'],10,0);
 assert.equal(blocked.changed,false);assert.equal(elements[0].x,0);
 const down=L.nudge(elements,['a','b','c'],0,10);
 assert.equal(down.changed,true);assert.deepEqual(elements.map(e=>e.y),[80,82,70]);
 const back=L.nudge(elements,['a','b','c'],-100,-100);
 assert.equal(back.dx,0);assert.equal(back.dy,-80);
 assert.deepEqual(elements.map(e=>e.y),[0,2,70]);
});

test('duplicate page regenerates page, element and group identities with same provenance',()=>{
 const p={id:'page-old',tab:'Analysis',elements:[{id:'a',groupId:'x',source:'A'},{id:'b',groupId:'x',source:'B'},{id:'c',groupId:'z',evidence:'Evidence'}]};
 const next=L.duplicatePage(p,uid);assert.notEqual(p.id,next.id);
 assert.notEqual(p.elements[0].id,next.elements[0].id);assert.notEqual(next.elements[0].groupId,'x');assert.equal(next.elements[0].groupId,next.elements[1].groupId);assert.notEqual(next.elements[2].groupId,'z');
 assert.equal(next.elements[2].evidence,'Evidence');assert.equal(p.elements[0].id,'a');
});


test('layer folders preserve stack identity and use labels without mutating source order',()=>{
 const items=[{id:'A',groupId:'g',groupLabel:'근거 자료',text:'One',locked:true},{id:'solo',text:'Independent'},{id:'B',groupId:'g',groupLabel:'근거 자료',text:'Two'},{id:'C',groupId:'h',text:'Three'}];
 const groups=L.folders(items);
 assert.deepEqual(groups.map(x=>x.kind+':' +(x.id||x.el.id)),['group:g','item:solo','group:h']);
 assert.equal(groups[0].name,'근거 자료');
 assert.deepEqual(groups[0].elements.map(x=>x.id),['A','B']);
 assert.equal(items[1].id,'solo');
 const p=C.createProject(1);p.pages[0].elements.push(C.makeBlock('shape',10,10,{groupId:'g',groupLabel:'근거 자료'}));
 const normalized=C.normalizeProject(p);
 assert.equal(normalized.pages[0].elements.at(-1).groupLabel,'근거 자료');
 assert.throws(()=>C.normalizeProject({...p,pages:p.pages.map(pg=>({...pg,elements:pg.elements.map(e=>({...e,groupLabel:'가'.repeat(81)}))}))}),/group label/i);
});


test('multi-align shifts group without changing relative geometry and skips locked layers',()=>{
 const items=[{id:'A',x:110,y:90,w:120,h:80},{id:'B',x:410,y:240,w:80,h:70},{id:'lock',x:40,y:20,w:180,h:100,locked:true}];
 const res=L.alignGroup(items,['A','B','lock'],'align-hcenter',{width:1280,height:720});
 assert.equal(res.changed,true);assert.equal(items[1].x-items[0].x,300);assert.equal(items[1].y-items[0].y,150);assert.equal(items[2].x,40);
 assert.equal(items[0].x+(items[1].x+items[1].w-items[0].x)/2,640);
 const bottom=L.alignGroup(items,['A','B'],'align-bottom',{width:1280,height:720});
 assert.equal(bottom.changed,true);assert.equal(items[1].y+items[1].h,672);assert.equal(items[2].y,20);
 assert.equal(L.alignGroup(items,['lock'],'garbage').changed,false);
});

test('distribute three selected layers deterministically; reject impossible collisions without mutations',()=>{
 const list=[{id:'c',x:550,y:20,w:100,h:40},{id:'a',x:10,y:20,w:100,h:40},{id:'b',x:300,y:20,w:100,h:40},{id:'locked',x:250,y:20,w:100,h:40,locked:true}];
 const result=L.distribute(list,['a','b','c','locked'],'x');
 assert.equal(result.changed,true);assert.equal(result.gap,170);assert.equal(list[2].x,280);assert.equal(list[3].x,250);
 assert.equal(list[0].x,550);assert.equal(list[1].x,10);
 const overlap=[{id:'a',x:0,y:0,w:100,h:30},{id:'b',x:70,y:0,w:100,h:30},{id:'c',x:140,y:0,w:100,h:30}];
 const original=JSON.stringify(overlap);const fail=L.distribute(overlap,['a','b','c'],'x');
 assert.equal(fail.changed,false);assert.match(fail.reason,/overlap/);assert.equal(JSON.stringify(overlap),original);
 const vertical=[{id:'a',x:20,y:5,w:60,h:50},{id:'b',x:20,y:150,w:60,h:50},{id:'c',x:20,y:305,w:60,h:50}];
 L.distribute(vertical,['a','b','c'],'y');assert.equal(vertical[1].y,155);
});


test('phone JPEG EXIF orientation 6 swaps natural display axes without touching original bytes',()=>{
 const tiff=Buffer.alloc(26);tiff.write('II',0,'ascii');tiff.writeUInt16LE(42,2);tiff.writeUInt32LE(8,4);tiff.writeUInt16LE(1,8);tiff.writeUInt16LE(0x112,10);tiff.writeUInt16LE(3,12);tiff.writeUInt32LE(1,14);tiff.writeUInt16LE(6,18);
 const app1=Buffer.concat([Buffer.from('Exif\0\0','binary'),tiff]);
 const exif=Buffer.concat([Buffer.from([0xff,0xe1,0,app1.length+2]),app1]);
 const sof=Buffer.from([0xff,0xc0,0,11,8,0,2,0,4,3,1,0x11,0,2,0x11,0,3,0x11,0]);
 const jpeg=Buffer.concat([Buffer.from([0xff,0xd8]),exif,sof,Buffer.from([0xff,0xd9])]);
 const src='data:image/jpeg;base64,'+jpeg.toString('base64');
 assert.deepEqual(M.dimensions(src),{width:2,height:4});
 assert.deepEqual(M.dimensions('data:image/jpeg;base64,'+Buffer.concat([Buffer.from([0xff,0xd8]),sof,Buffer.from([0xff,0xd9])]).toString('base64')),{width:4,height:2});
});

test('actual WebP VP8X and VP8L image metadata use correct width/height',()=>{
 const webp1='UklGRlwAAABXRUJQVlA4WAoAAAAQAAAACgAABgAAQUxQSAoAAAABB9DwiAhERP8DVlA4ICwAAADQAQCdASoLAAcAAgAwJaACdLoB+AADsAD+7ylH/kpxr83f//8KtwxDUcAAAA==';
 const webp2='UklGRh4AAABXRUJQVlA4TBEAAAAvCoABEAdQsqaUteGBiOh/AAA=';
 assert.deepEqual(M.dimensions('data:image/webp;base64,'+webp1),{width:11,height:7});
 assert.deepEqual(M.dimensions('data:image/webp;base64,'+webp2),{width:11,height:7});
});
