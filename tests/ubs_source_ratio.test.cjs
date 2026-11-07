const {test}=require('node:test');const assert=require('node:assert/strict');
require('../assets/core.js');require('../assets/core_enhanced.js');require('../assets/ubs_fidelity.js');require('../assets/ubs_vector_source.js');require('../assets/pro_reports.js');
const C=global.DocutCore, source=global.DocutUBSVectorSource, PRO=global.DocutProReports;
test('UBS source-ratio pack references actual six 2025 PDF pages, never fabricated full likeness',()=>{
 const pages=PRO.buildPack('FIN-16','original');
 assert.deepEqual(pages.map(p=>p.referenceFidelity.sourcePage),[5,8,11,13,16,18]);
 assert.ok(pages.every(p=>p.referenceFidelity.mode==='source-ratio'));
 assert.ok(pages.every(p=>p.referenceFidelity.measuredScore===null));
 assert.ok(pages.every(p=>p.referenceFidelity.status==='editor_browser_unverified'));
 assert.ok(pages.every(p=>p.elements.length===0),'No fake editable assets');
});
test('UBS vector package contains path geometry without PDF paragraphs, pictures or UBS brand glyphs',async()=>{
 await source.ready;
 assert.equal(source.status,'ready');
 for(const no of source.sourcePages){
   const svg=source.pages[String(no)];
   assert.ok(svg.startsWith('<svg'));assert.match(svg,/<path\b/);
   assert.doesNotMatch(svg,/<(?:text|image|script|foreignObject)\b/i);
   assert.ok(svg.length>2000);
   const page=source.make(source.sourcePages.indexOf(no));
   const layer=source.layer(page);
   assert.match(layer,/<svg/);assert.match(layer,/ubs-source-layer/);
 }
});
test('Normalized project retains sourced page identity and does not insert PDF images',()=>{
 const pg=source.make(3),project=C.createProject(5);project.pages[0]=pg;
 const restored=C.normalizeProject(project).pages[0];
 assert.equal(restored.referenceFidelity.sourcePage,13);
 assert.equal(restored.referenceFidelity.mode,'source-ratio');
 assert.equal(restored.elements.length,0);
});
test('Other report packs and legacy UBS palette remain distinct',()=>{
 assert.equal(PRO.buildPage('FIN-16',0,'wood').referenceFidelity,undefined);
 assert.equal(PRO.buildPage('EARN-06',0).referenceFidelity,undefined);
});