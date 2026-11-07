'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../assets/core.js');require('../assets/core_enhanced.js');
const L=require('../assets/semantic_layout.js');
function block(type,id,text='검토 내용'){return C.clone(C.makeBlock(type,70,200,{id,text,w:220,h:100}));}
function page(elements){return {id:'page-test',layout:'hero',elements};}
function payload(e){const {x,y,w,h,...data}=e;return data;}
test('all structures preserve exact content and metadata without mutating preview source',()=>{
 for(const layout of Object.keys(L.STRATEGIES)){
  const p=page([block('card','body'),block('title','heading','제목'),block('kpi','metric','12\n지표')]);p.elements[0].source='원본';p.elements[0].data={rows:[['A',-42]]};const before=C.clone(p);
  const plan=L.plan(p,layout);assert.deepEqual(p,before);assert.equal(plan.ok,true,layout+JSON.stringify(plan.issues));L.apply(p,plan);
  assert.deepEqual(p.elements.map(payload),before.elements.map(payload));
  for(let i=0;i<p.elements.length;i++)for(let j=i+1;j<p.elements.length;j++)if(layout!=='blank')assert.equal(L.intersects(p.elements[i],p.elements[j]),false,layout);
 }
});
test('title is placed by meaning instead of input array order',()=>{const p=page([block('card','body'),block('title','heading','핵심 결론')]);const plan=L.plan(p,'two');assert.ok(plan.ok);assert.ok(plan.after.elements[1].y<plan.after.elements[0].y);});
test('locked obstacle stays exact and movable content avoids it',()=>{const fixed=block('card','locked');Object.assign(fixed,{x:48,y:200,w:400,h:250,locked:true});const p=page([fixed,block('card','body')]);const plan=L.plan(p,'metrics');assert.ok(plan.ok,JSON.stringify(plan.issues));assert.deepEqual(plan.after.elements[0],fixed);assert.equal(L.intersects(plan.after.elements[0],plan.after.elements[1]),false);});
test('a locked member pins the entire group',()=>{const a=block('text','a'),b=block('text','b');Object.assign(a,{groupId:'g',locked:true});Object.assign(b,{groupId:'g',x:300});const p=page([a,b,block('text','c')]),plan=L.plan(p,'three');assert.ok(plan.ok);assert.deepEqual(plan.after.elements.slice(0,2),p.elements.slice(0,2));});
test('moving groups retain internal geometry and font size',()=>{const a=block('text','a'),b=block('text','b');Object.assign(a,{groupId:'g',x:0,y:0,w:180,h:80});Object.assign(b,{groupId:'g',x:200,y:0,w:180,h:80});const plan=L.plan(page([a,b]),'two');assert.ok(plan.ok);const [aa,bb]=plan.after.elements;assert.equal(bb.x-aa.x,200);assert.equal(bb.w,b.w);assert.deepEqual(bb.style,b.style);});
test('overflow cancels entire proposal rather than compressing, deleting, or partially applying',()=>{const p=page(Array.from({length:30},(_,i)=>block('table','t'+i))),before=C.clone(p),plan=L.plan(p,'three');assert.equal(plan.ok,false);assert.deepEqual(plan.after,before);assert.equal(plan.moves.length,0);assert.throws(()=>L.apply(p,plan));assert.deepEqual(p,before);});
test('stale preview is rejected atomically',()=>{const p=page([block('card','one')]),plan=L.plan(p,'two');p.elements[0].text='다른 편집';const snapshot=C.clone(p);assert.throws(()=>L.apply(p,plan),/다시 분석/);assert.deepEqual(p,snapshot);});
test('different layouts keep distinct geometry beyond legacy slot counts',()=>{const p=page(Array.from({length:6},(_,i)=>block('text','e'+i,'짧은 문구')));const plans=['two','three','metrics','split','chart','timeline'].map(id=>L.plan(p,id));assert.ok(plans.every(p=>p.ok));assert.equal(new Set(plans.map(p=>JSON.stringify(p.after.elements.map(e=>[e.x,e.y,e.w,e.h])))).size,6);});
test('hidden nodes are untouched and blank does not rearrange content',()=>{const p=page([Object.assign(block('card','hidden'),{hidden:true}),block('title','title')]);assert.deepEqual(L.plan(p,'blank').after,p);assert.deepEqual(L.plan(p,'hero').after.elements[0],p.elements[0]);});
test('layout review is wired and PPTX is absent from active editor',()=>{const fs=require('node:fs'),html=fs.readFileSync('index.html','utf8'),app=fs.readFileSync('assets/app.js','utf8');assert.ok(html.includes('semantic_layout.js'));assert.ok(app.includes('previewSemanticLayout(layout.dataset.layout)'));assert.ok(!html.includes('data-action="export-pptx"'));assert.ok(!html.includes('src="./assets/pptx.js"'));});
test('accepted geometry survives project JSON reload and independent HTML output',()=>{
 require('../assets/easing.js');require('../assets/visual_motion.js');require('../assets/stat_charts.js');
 const X=require('../assets/export.js'),p=C.createProject(1);p.pages[0]=page([block('title','h','최종 제목'),block('card','c','출처 보존')]);
 const proposal=L.plan(p.pages[0],'split');assert.ok(proposal.ok);L.apply(p.pages[0],proposal);
 const restored=C.normalizeProject(JSON.parse(JSON.stringify(p)));assert.deepEqual(restored.pages[0].elements.map(e=>[e.x,e.y,e.w,e.h]),p.pages[0].elements.map(e=>[e.x,e.y,e.w,e.h]));
 const html=X.exportHTML(restored);assert.ok(html.includes('최종 제목'));for(const e of restored.pages[0].elements){assert.ok(html.includes('left:'+e.x+'px'));assert.ok(html.includes('width:'+e.w+'px'));}
});
