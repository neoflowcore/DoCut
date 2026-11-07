'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../assets/core.js');require('../assets/story_player.js');require('../assets/core_enhanced.js');
const B=require('../assets/branding.js');const K=require('../assets/page_kits.js');const CAT=require('../assets/effect_catalog.js');const FX=require('../assets/interaction_fx.js');
require('../assets/stat_charts.js');require('../assets/easing.js');require('../assets/visual_motion.js');const X=require('../assets/export.js');
const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/eoYAAAAASUVORK5CYII=';
test('twenty visual-first layouts remain independent and editable without fake data',()=>{
 assert.equal(K.BUILTINS.length,20);assert.equal(new Set(K.BUILTINS.map(x=>x.tone)).size>=9,true);
 for(const k of K.BUILTINS){const p=K.pageFromKit(k.id);assert.ok(p.elements.some(e=>e.type==='title'));assert.ok(p.elements.every(e=>!e.source&&!e.verified&&e.effects.length<=3),k.id)}
});
test('master brand preserves positions, circle mask and global font across save normalization',()=>{
 const p=C.createProject(2);p.master={...p.master,logo:png,logoShape:'circle',logoPosition:'bottom-right',logoSize:99,logoInset:18,fontFamily:'SUIT'};
 const saved=C.normalizeProject(p);assert.equal(saved.master.logoPosition,'bottom-right');assert.equal(saved.master.fontFamily,'SUIT');assert.equal(saved.master.logoSize,99);
 assert.equal(B.geometry(saved.master).x,1280-99-18);assert.equal(B.geometry(saved.master).y,720-99-18);
 assert.ok(B.markup(saved.master,0,2).includes('border-radius:50%'));
 assert.ok(B.markup(saved.master,0,2).includes('right:135px'));
 for(const key of Object.keys(B.POSITIONS)){p.master.logoPosition=key;const geom=B.geometry(p.master);assert.ok(geom.x>=0&&geom.y>=0&&geom.x+geom.w<=1280&&geom.y+geom.h<=720,key)}
});
test('card alpha changes only background and keeps text at full opacity',()=>{
 const e=C.makeBlock('card',30,40,{w:300,h:150,text:'문구 선명하게 유지',style:{background:'#336699',color:'#FFFFFF',opacity:1,backgroundOpacity:.25}});
 const normalized=C.normalizeBlock(e),css=X.styleOf(normalized);
 assert.equal(normalized.style.backgroundOpacity,.25);assert.ok(css.includes('background:rgba(51,102,153,0.25)'),css);
 assert.ok(css.includes('opacity:1;'));assert.ok(css.includes('color:#FFFFFF;'));
 assert.equal(B.backgroundAlpha('#336699',0),'rgba(51,102,153,0)');
});
test('a single card stacks entry, cursor light and ambient while preserving text',()=>{
 const e=C.makeBlock('card',30,40,{text:'확인용 카드',effects:CAT.createStack('cursor-spotlight','card')});
 const div=X.renderBlock(C.normalizeBlock(e),true);
 assert.ok(div.includes('docut-fx-cursor-glow'));assert.ok(div.includes('docut-fx-ambient-aura'));
 assert.ok(div.includes('확인용 카드'));assert.ok(FX.CSS.includes('pointer-x'));
});
test('standalone HTML includes actual cursor runtime, brand logo geometry and alpha',()=>{
 const p=C.createProject(1);p.master.logo=png;p.master.logoPosition='top-right';p.master.logoShape='circle';p.master.logoSize=88;
 const e=p.pages[0].elements.find(e=>e.type==='card');assert.ok(e);e.style.background='#335577';e.style.backgroundOpacity=.45;e.effects=CAT.createStack('kinetic-card','card');
 const output=X.exportHTML(p);assert.ok(output.includes('docut-fx-cursor-tilt'));assert.ok(output.includes('window.DocutInteractionFX?.install(document)'));assert.ok(output.includes('border-radius:50%'));assert.ok(output.includes('background:rgba(51,85,119,0.45)'));assert.ok(!output.includes('src="http'));
});
