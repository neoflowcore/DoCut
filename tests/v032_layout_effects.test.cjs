'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const C=require('../assets/core.js');require('../assets/story_player.js');require('../assets/core_enhanced.js');
require('../assets/semantic_layout.js');require('../assets/branding.js');require('../assets/stat_charts.js');
const CAT=require('../assets/effect_catalog.js'),IC=require('../assets/effect_icons.js');
const E=require('../assets/easing.js');require('../assets/interaction_fx.js');require('../assets/visual_motion.js');
const X=require('../assets/export.js'),B=require('../assets/box_layout.js');
const FRAME={width:1280,height:720};

test('all 89 effect entries have independent IDs and meaning-based SVG drawings',()=>{
 assert.equal(CAT.GALLERY.length,89);
 assert.equal(new Set(CAT.GALLERY.map(x=>x.id)).size,89);
 assert.equal(new Set(CAT.GALLERY.map(x=>IC.icon(x))).size,89);
 for(const e of CAT.GALLERY){const html=IC.icon(e);assert.ok(html.includes('<svg')&&html.includes('</svg>'));assert.ok(!html.includes('<script'));}
 assert.equal(CAT.GALLERY.filter(x=>x.mode==='transition').length,11);
});

test('each of the 78 object effects generates playable animation frames',()=>{
 const types=['card','title','text','kpi','bar','line','donut','stat','table'];let total=0;
 for(const entry of CAT.GALLERY.filter(x=>x.mode!=='transition')){
  const kinds=entry.kinds||[entry.kind],type=types.find(t=>kinds.every(k=>CAT.supports(k,t)));
  assert.ok(type,entry.id);const effects=entry.kinds?CAT.createStack(entry.id,type):[C.normalizeEffect(C.makeEffect(entry.kind,620,0))];
  assert.ok(effects.length>=1&&effects.length<=3,entry.id);
  const frames=E.buildFrames(effects,1000/60);
  assert.ok(frames.duration>0&&frames.frames.length>=2,entry.id);total++;
 }
 assert.equal(total,78);
});

test('column of four subtitle/body/image groups becomes valid proportional 2x2 automatically',()=>{
 const original=B.preset({count:4,direction:'column',media:true});
 assert.throws(()=>B.createPage(original,FRAME));
 const result=B.autoCreatePage(original,FRAME);
 assert.equal(result.page.elements.length,13);
 assert.equal(result.mode,'2×2 자동 배치');
 assert.equal(result.page.elements.filter(e=>e.type==='image').length,4);
 assert.ok(result.page.elements.every(e=>e.x>=0&&e.y>=0&&e.x+e.w<=1280&&e.y+e.h<=720));
});

test('autoPlan retains native document IDs, text, values and evidence with no mutation',()=>{
 const page=B.createPage(B.preset({count:2,direction:'row',media:false}),FRAME);
 const chart=page.elements.find(e=>e.type==='card');
 chart.source='검증 근거';chart.asOfDate='2026-11-07';chart.unit='원';chart.evidence='산식';
 const old=C.clone(page),result=B.autoPlan(page,B.preset({count:4,direction:'column',media:true}),FRAME);
 assert.ok(result.ok,JSON.stringify(result.issues));
 assert.deepEqual(page,old);
 assert.deepEqual(result.after.elements.map(e=>[e.id,e.text,e.source,e.asOfDate,e.unit,e.evidence]),old.elements.map(e=>[e.id,e.text,e.source,e.asOfDate,e.unit,e.evidence]));
});

test('outgoing page cue persists across project JSON and standalone HTML without changing entry',()=>{
 const project=C.createProject(5),target=project.pages[0].elements.find(e=>e.type==='card');
 const old=C.clone(target.effects),stack=CAT.createStack('next-left',target.type);
 target.exitOnNext=stack;const restored=C.normalizeProject(project);const persisted=restored.pages[0].elements.find(e=>e.id===target.id);
 assert.equal(persisted.exitOnNext[0].end.x,-150);
 assert.deepEqual(persisted.effects,old);
 const doc=X.exportHTML(restored);
 assert.ok(doc.includes('exitOnNext'));
 assert.ok(doc.includes('function sceneLeave(next)'));
 assert.ok(!doc.includes('canvasContextTools'));
});

test('offline editor bundler has CSS and at least 45 ordered local scripts including the icon and UBS modules',()=>{
 const html=fs.readFileSync('index.html','utf8');const scripts=[...html.matchAll(/<script src="\.\/(assets\/[^"]+\.js)" defer><\/script>/g)];
 assert.ok(scripts.length>=46);
 assert.ok(scripts.some(m=>m[1]==='assets/ubs_fidelity.js'));
 assert.ok(scripts.some(m=>m[1]==='assets/effect_icons.js'));
 assert.ok(fs.existsSync('tools/bundle_studio_v032.py'));
});
