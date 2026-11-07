'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../assets/core.js');require('../assets/story_player.js');require('../assets/core_enhanced.js');
const B=require('../assets/branding.js');require('../assets/page_kits.js');const CAT=require('../assets/effect_catalog.js');const FX=require('../assets/interaction_fx.js');
require('../assets/stat_charts.js');require('../assets/easing.js');require('../assets/visual_motion.js');const X=require('../assets/export.js');const S=require('../assets/effect_studio.js');
const kinds=['ambient-aura','edge-light','cursor-glow'];
test('the three light sources have independent DOM overlays and keep the text layer intact',()=>{
 const element=C.makeBlock('card',24,48,{text:'원본 사실은 그대로',source:'테스트 근거',effects:kinds.map(kind=>C.makeEffect(kind,650,0))});
 const rendered=X.renderBlock(element,true);
 for(const layer of ['ambient','edge','cursor'])assert.ok(rendered.includes('docut-fx-layer-'+layer),layer);
 assert.equal((rendered.match(/docut-fx-layer docut-fx-layer-/g)||[]).length,3);
 assert.ok(rendered.includes('원본 사실은 그대로'));
 assert.ok(rendered.includes('data-source="테스트 근거"'));
 const duplicates=FX.markup([C.makeEffect('cursor-glow'),C.makeEffect('cursor-glow')]);
 assert.equal((duplicates.match(/docut-fx-layer-cursor/g)||[]).length,1);
});
test('CSS for interactive layering does not suppress keyboard selection or reduced motion',()=>{
 assert.ok(FX.CSS.includes('prefers-reduced-motion:reduce'));
 assert.ok(FX.CSS.includes('selected.docut-fx-edge-light'));
 assert.ok(!FX.CSS.includes('infinite'));
 assert.ok(FX.CSS.includes('pointer-events:none'));
});
test('icon-first 89 item gallery contains runnable atomic, preset, recipe and scene effects',()=>{
 assert.equal(CAT.PRESETS.length,33);assert.equal(CAT.KINDS.length,32);
 assert.equal(S.options().length,89);assert.equal(CAT.GALLERY.length,89);assert.equal(CAT.RECIPES.length,13);
 for(const item of CAT.PRESETS){const type=S.compatibleType(item,'card');const fx=S.buildEffect(item,type);assert.ok(fx.length<=3&&fx.length>=1,item.id);for(const f of fx)assert.ok(C.EFFECTS.some(([id])=>id===f.kind),f.kind)}
 assert.equal(S.compatibleType(CAT.PRESETS.find(p=>p.id==='statistic'),'card'),'stat');
 const stat=S.sample(CAT.PRESETS.find(p=>p.id==='statistic'),'stat');
 assert.equal(stat.type,'stat');assert.ok(stat.effects.length);
});
test('background alpha is independent from text opacity across rgba, hex8 and invalid colors',()=>{
 assert.equal(B.backgroundAlpha('#6699cc88',.5),'rgba(102,153,204,0.2667)');
 assert.equal(B.backgroundAlpha('#369c',.25),'rgba(51,102,153,0.2)');
 assert.equal(B.backgroundAlpha('rgba(40,50,60,0.4)',.25),'rgba(40,50,60,0.1)');
 assert.equal(B.backgroundAlpha('rgb(40,50,60)',0),'rgba(40,50,60,0)');
 assert.equal(B.backgroundAlpha('rgb(100%,0%,0%)',.2),'rgba(255,0,0,0.2)');
 assert.equal(B.backgroundAlpha('url(javascript:alert(1))',1),'transparent');
 const e=C.makeBlock('card',10,10,{style:{background:'#f5f6f7',backgroundOpacity:.1,color:'#000000',opacity:1}});
 const css=X.styleOf(e);assert.ok(css.includes('background:rgba(245,246,247,0.1)'));assert.ok(css.includes('opacity:1;'));assert.ok(!css.includes('undefined'));
});
test('exported HTML also embeds the independent runtime and actual layer markup',()=>{
 const project=C.createProject(1),element=project.pages[0].elements.find(e=>e.type==='card');
 element.effects=kinds.map(k=>C.makeEffect(k,600,0));
 const out=X.exportHTML(project);
 for(const layer of ['ambient','edge','cursor'])assert.ok(out.includes('docut-fx-layer-'+layer),layer);
 assert.ok(out.includes('window.DocutInteractionFX?.install(document)'));
});
test('all brand positions fit 1280x720 safe area with normalized shape/font',()=>{
 for(const p of Object.keys(B.POSITIONS)){
  const master=B.normalize({logoPosition:p,logoShape:'circle',logoSize:180,logoInset:112,fontFamily:'Noto Sans KR'});
  const box=B.geometry(master);assert.ok(box.x>=0&&box.y>=0&&box.x+box.w<=1280&&box.y+box.h<=720,p);
 }
 const bad=B.normalize({logoPosition:'<script>',logoShape:'x',fontFamily:'XSS'});
 assert.equal(bad.logoShape,'circle');assert.equal(bad.fontFamily,'Pretendard');
});
