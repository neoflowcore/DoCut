const {test}=require('node:test');const assert=require('node:assert/strict');
require('../assets/core.js');require('../assets/story_player.js');require('../assets/core_enhanced.js');require('../assets/ubs_vector_source.js');require('../assets/ubs_vector_edit.js');
const C=global.DocutCore,SVG=global.DocutUBSVectorSource,EDIT=global.DocutUBSVectorEdit;
test('source-ratio UBS editor guard and CSS color conversion',()=>{
 assert.equal(EDIT.validPage({referenceFidelity:{mode:'source-ratio',sourceEdition:'2025',sourcePage:13}}),true);
 assert.equal(EDIT.validPage({referenceFidelity:{mode:'adapted-16:9',sourcePage:13}}),false);
 assert.equal(EDIT.rgbHex('rgb(189,36,50)'),'#bd2432');
});
test('vector source SVG is indexed for editing and graphically unmodified by default',async()=>{
 await SVG.ready;assert.equal(SVG.status,'ready');const p=SVG.make(3),markup=SVG.layer(p);
 assert.match(markup,/data-ubs-vector-index="0"/);assert.match(markup,/<svg\b/);
 assert.doesNotMatch(markup,/data-ubs-overrides="true"/);
 assert.doesNotMatch(markup,/<(?:text|image|script|foreignObject)\b/i);
});
test('non-destructive vector overrides roundtrip through native project JSON',async()=>{
 await SVG.ready;const p=SVG.make(3),project=C.createProject(5);
 p.referenceFidelity.vectorEdits={'0':{fill:'#ab1234',stroke:'#0a1b2c',opacity:0.55,strokeWidth:1.5,dx:8,dy:-2,hidden:false},'3':{hidden:true}};
 project.pages[0]=p;const normalized=C.normalizeProject(project),again=C.normalizeProject(JSON.parse(JSON.stringify(normalized)));
 assert.deepEqual(again.pages[0].referenceFidelity.vectorEdits,p.referenceFidelity.vectorEdits);
 const markup=SVG.layer(again.pages[0]);
 assert.match(markup,/\[data-ubs-vector-index="0"\]/);
 assert.match(markup,/fill:#ab1234 !important/);
 assert.match(markup,/translate:8px -2px !important/);
 assert.match(markup,/display:none !important/);
 assert.equal(again.pages[0].referenceFidelity.measuredScore,null);
});
test('native import rejects malformed vector edits without silent loss',async()=>{
 await SVG.ready;for(const value of [{'-1':{fill:'#abcdef'}},{'1':{fill:'red'}},{'1':{dx:900}},{'1':{script:'alert(1)'}},{'1':{opacity:Infinity}}]){
  const project=C.createProject(5);project.pages[0]=SVG.make(0);project.pages[0].referenceFidelity.vectorEdits=value;
  assert.throws(()=>C.normalizeProject(project),/UBS vector/);
 }
});
