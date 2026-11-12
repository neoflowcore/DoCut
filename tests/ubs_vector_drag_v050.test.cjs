'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const V=require('../assets/ubs_vector_edit.js');
test('SVG drag snaps to half user-unit and respects existing translation bounds',()=>{
 assert.deepEqual(V.dragPosition(0,0,12.26,-4.74),{dx:12.5,dy:-4.5});
 assert.deepEqual(V.dragPosition(199.5,-199.5,25,-25),{dx:200,dy:-200});
 assert.deepEqual(V.dragPosition(-12,15,12,-15),{dx:0,dy:0});
 assert.equal(V.dragPosition(0,0,Infinity,4),null);
 assert.equal(V.dragPosition(0,0,NaN,4),null);
});
test('screen coordinates convert with inverse SVG CTM, not raw canvas pixels',()=>{
 const svg={getScreenCTM:()=>({inverse:()=>({a:.5,b:0,c:0,d:.25,e:-20,f:-10})})};
 assert.deepEqual(V.svgPoint(svg,{clientX:100,clientY:80}),{x:30,y:10});
 assert.equal(V.svgPoint(null,{clientX:1,clientY:2}),null);
 assert.equal(V.svgPoint({getScreenCTM(){throw Error('disposed')}},{clientX:1,clientY:2}),null);
});
test('pointer capture, cancel and single undoable commit are wired without CI',()=>{
 const code=fs.readFileSync(path.join(__dirname,'../assets/ubs_vector_edit.js'),'utf8');
 const css=fs.readFileSync(path.join(__dirname,'../assets/styles.css'),'utf8');
 for(const event of ['pointerdown','pointermove','pointerup','pointercancel'])
  assert.ok(code.includes("addEventListener('"+event+"'"));
 assert.match(code,/setPointerCapture/);assert.match(code,/releasePointerCapture/);
 assert.match(code,/finishDrag\(true\)/);assert.match(code,/finishDrag\(false\)/);
 assert.match(code,/options\.commit/);
 assert.match(css,/ubs-vector-dragging/);assert.match(css,/touch-action:none/);
});
