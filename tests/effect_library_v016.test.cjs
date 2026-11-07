'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const C=require('../assets/core.js');require('../assets/core_enhanced.js');
const CAT=require('../assets/effect_catalog.js');
const E=require('../assets/easing.js');
const M=require('../assets/visual_motion.js');
const X=require('../assets/export.js');
const H=require('../assets/css_import.js');

test('V0.27 catalog retains 9 palettes and 12 layouts with 32 motions',()=>{
 assert.equal(Object.keys(CAT.PALETTES).length,9);assert.equal(Object.keys(C.LAYOUTS).length,12);
 assert.equal(CAT.TRANSITIONS.length,11);assert.equal(CAT.KINDS.length,32);
 assert.equal(CAT.PRESETS.length,33);assert.equal(C.THEMES.length,9);
 assert.equal(new Set(CAT.KINDS.map(x=>x.kind)).size,CAT.KINDS.length);
});
test('all catalog presets build no more than 3 deterministic effects',()=>{
 for(const p of CAT.PRESETS){const candidate=['title','text','quote','kpi','bar','line','donut','stat','image','table','shape'].find(t=>p.kinds.every(k=>CAT.supports(k,t)));
  assert.ok(candidate,'no supported shape for '+p.id);
  const effects=CAT.createStack(p.id,candidate);assert.ok(effects.length>0&&effects.length<=3,p.id);
  assert.deepEqual(effects.map(e=>e.kind),p.kinds);assert.ok(effects.every(e=>e.duration>=100&&e.duration<=4000));
 }
});
test('unsupported chart preset cannot be applied to a title, and missing presets fail',()=>{
 assert.throws(()=>CAT.createStack('trend','title'),/수 없는/);
 assert.throws(()=>CAT.createStack('no-such-preset','text'),/Unknown/);
 assert.equal(CAT.recommended('kpi'),'numbers');assert.equal(CAT.recommended('donut'),'share');
});
test('transition and palette survive strict schema-3 import/roundtrip',()=>{
 const p=C.createProject(2);p.theme='cobalt';p.pages[0].transition='wipe';p.pages[1].transition='zoom';
 p.pages[0].elements.push(C.makeBlock('line',100,80,{data:{labels:['2025','2026'],values:[100,140],palette:'bronze',unit:'kg'}}));
 const normalized=C.normalizeProject(p);assert.equal(normalized.pages[0].transition,'wipe');assert.equal(normalized.pages[1].transition,'zoom');
 assert.equal(normalized.pages[0].elements.at(-1).data.palette,'bronze');
 const html=X.exportHTML(p);assert.match(html,/data-docut-transition="wipe"/);assert.match(html,/data-docut-transition="zoom"/);
 assert.match(html,/\.slide\.theme-cobalt/);assert.match(html,/"palette":"bronze"/);
});
test('malformed transition converts to documented fade default',()=>{
 const p=C.createProject(1);p.pages[0].transition='script:inject';const out=C.normalizeProject(p);assert.equal(out.pages[0].transition,'fade');
});
test('chart palettes render SVG using selected bronze series colors',()=>{
 const p=C.createProject(1),b=C.makeBlock('bar',40,120,{data:{labels:['A'],values:[23],palette:'bronze'}});
 const safe=C.normalizeBlock(b);assert.match(X.renderBlock(safe),/fill="#685746"/);
});
test('2.5D rotation channels interpolate and render CSS finite transforms',()=>{
 const fx=C.normalizeEffect({...C.makeEffect('flip-x',800),start:{rotateX:-80,rotateY:12,opacity:.1}});
 assert.equal(E.effectPose(fx,0).rotateX,-80);assert.equal(E.effectPose(fx,0).rotateY,12);
 const middle=E.effectPose(fx,.5);assert.ok(middle.rotateX<0);assert.match(E.cssPose(middle).transform,/perspective\(1200px\) rotateX/);
 assert.equal(E.effectPose(C.makeEffect('flip-y'),0).rotateY,-74);
});
test('first motion does not flash before its delay; second entrance does not erase first final opacity',()=>{
 const stack=[C.makeEffect('fade',600,200),C.makeEffect('fade-up',600,150)];
 assert.equal(E.composeEffects(stack,0).opacity,0);
 assert.equal(E.composeEffects(stack,100).opacity,0);
 assert.equal(E.composeEffects(stack,850).opacity,1);
 assert.equal(E.composeEffects(stack,1550).opacity,1);
});
test('bounded frame sampler never produces NaN or Infinity across 3D types',()=>{
 const stack=[C.makeEffect('tilt',3200,900),C.makeEffect('depth-in',3200,900),C.makeEffect('flip-x',3200,900)];
 const built=E.buildFrames(stack,1000/60);assert.ok(built.frames.length<=361);
 assert.ok(built.frames.every(f=>!/[Nn]a[Nn]|Infinity/.test(JSON.stringify(f))));
});
test('visual runtime schedules sequential effects and safely parses number labels',()=>{
 const plan=M.timePlan([C.makeEffect('fade-up',650,70),C.makeEffect('counter-up',900,30)]);
 assert.equal(plan[0].start,70);assert.equal(plan[1].start,750);
 const num=M.parseNumber('₩1,234.50 만원');assert.equal(num.target,1234.5);assert.equal(num.decimals,2);
 assert.equal(M.formatNumber(num,0),'₩0.00 만원');assert.equal(M.formatNumber(num,1),'₩1,234.50 만원');
 assert.equal(M.parseNumber('No amount'),null);
});
test('new visual runtime is embedded byte for byte in offline standalone export',()=>{
 const js=fs.readFileSync(path.join(__dirname,'../assets/visual_motion.js'),'utf8');
 const html=X.exportHTML(C.createProject(1));assert.ok(html.includes('<script>'+js+'</script>'));
 assert.match(html,/playPageTransition/);assert.match(html,/DocutVisualMotion\.play/);
 assert.ok(!html.includes('src="http'));
});
test('HTML importer reads local raster CSS backgrounds, no remote asset leakage',()=>{
 const css=H.parseDeclarations('background-image:url(data:image/png;base64,iVBORw0KGgo=);color:#333333');
 assert.ok(H.embeddedBackground(css).startsWith('data:image/png;base64'));
 assert.equal(H.embeddedBackground({background:'url(https://external.invalid/track.png)'}),'');
});
