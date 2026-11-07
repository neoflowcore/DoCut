const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
async function run(){
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
for(const viewport of [{width:1452,height:952},{width:390,height:844}]){
 const page=await browser.newPage({viewport,deviceScaleFactor:1,acceptDownloads:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file:///vercel/DoCut/index.html');
 await page.waitForFunction(()=>DocutUBSVectorSource.status==='ready',{timeout:15000});
 await page.locator('[data-action="template-gallery"]').first().click();
 await page.locator('[data-kit-choice="FIN-16"]').click();
 const observed=await page.evaluate(()=>{
 const d=document.querySelector('#kitDialog'),v=document.querySelector('#kitPreviewCanvas'),layer=v.querySelector('.ubs-source-layer');
 const norm=r=>({x:r.x,y:r.y,w:r.width,h:r.height});
 const D=norm(d.getBoundingClientRect()),V=norm(v.getBoundingClientRect()),L=norm(layer.getBoundingClientRect());
 return {D,V,L,category:document.querySelector('#kitCategory').value,hasSvg:!!v.querySelector('svg'),previewPages:document.querySelectorAll('#kitPackPageStrip [data-kit-page]').length,firstItem:document.querySelector('[data-kit-choice="FIN-16"]')?.getAttribute('aria-pressed')};
 });
 console.log('GALLERY',viewport.width,JSON.stringify(observed));
 assert.equal(observed.firstItem,'true');
 assert.ok(observed.V.h>120,'Preview canvas must have height');
 assert.ok(observed.L.w<=observed.V.w+1&&observed.L.h<=observed.V.h+1,'SVG layer contained');
 assert.ok(observed.L.x>=observed.V.x-1&&observed.L.y>=observed.V.y-1,'SVG layer positioned in preview');
 assert.ok(observed.hasSvg,'SVG visible');
 assert.equal(observed.previewPages,6);
 for(let i=0;i<6;i++){
   await page.locator('#kitPackPageStrip [data-kit-page="'+i+'"]').click();
   assert.ok(await page.locator('#kitPreviewCanvas .ubs-source-layer svg').count()>0,'preview page '+i);
 }
 await page.screenshot({path:'/tmp/ubs_gallery_fixed_'+viewport.width+'.png'});
 await page.locator('#kitPackAdd').click();
 const state=await page.evaluate(()=>({count:DocutApp.getProject().pages.length,ubs:DocutApp.getProject().pages.filter(p=>p.referenceFidelity?.mode==='source-ratio').map(p=>({pg:p.referenceFidelity.sourcePage,n:p.elements.length})),current:DocutApp.getProject().pages[DocutApp.getState().pageIndex].referenceFidelity?.sourcePage,editToggle:!!document.getElementById('ubsVectorToggle'),source:document.querySelector('#slide .ubs-source-layer svg')?.getAttribute('viewBox')}));
 console.log('INSERT',viewport.width,JSON.stringify(state));
 assert.equal(state.ubs.length,6);assert.deepEqual(state.ubs.map(p=>p.n),[13,24,28,26,26,40]);
 assert.equal(state.count,11);
 assert.ok(state.source,'source SVG in editor');
 assert.ok(await page.locator('#ubsVectorToggle').isVisible());
 await page.locator('#ubsVectorToggle').click();
 assert.ok(await page.locator('#ubsVectorPanel').isVisible());
 await page.evaluate(()=>DocutUBSVectorEdit.instance.select(0));
 await page.locator('[data-ubs-prop="fill"]').fill('#5599aa');
 await page.locator('[data-ubs-prop="fill"]').dispatchEvent('change');
 const edited=await page.evaluate(()=>DocutApp.getProject().pages[DocutApp.getState().pageIndex].referenceFidelity.vectorEdits['0']?.fill);
 assert.equal(edited,'#5599aa');
 const exportQA=await page.evaluate(()=>{
   const native=DocutApp.getProject(),html=DocutExporter.exportHTML(native),
         json=JSON.stringify(native),roundtrip=DocutCore.normalizeProject(JSON.parse(json)),
         active=roundtrip.pages[DocutApp.getState().pageIndex];
   return {htmlSVG:html.includes('data-ubs-vector-index="0"'),
           htmlStyle:html.includes('fill:#5599aa !important'),
           htmlPageCount:(html.match(/data-docut-page="/g)||[]).length,
           jsonRestored:active.referenceFidelity.vectorEdits['0'].fill,
           mappedSlots:native.pages.filter(p=>p.referenceFidelity?.mode==='source-ratio').every(p=>p.elements.every(e=>e.x>=0&&e.y>=0&&e.x+e.w<=1280.1&&e.y+e.h<=720.1)),
           upperLeft:active.elements[0].x};
 });
 console.log('EXPORT',viewport.width,JSON.stringify(exportQA));
 assert.ok(exportQA.htmlSVG&&exportQA.htmlStyle);
 assert.equal(exportQA.htmlPageCount,11);
 assert.equal(exportQA.jsonRestored,'#5599aa');
 assert.ok(exportQA.mappedSlots);
 console.log('EDIT',viewport.width,edited);
 await page.locator('[data-ubs-reset]').click();
 assert.ok(await page.evaluate(()=>!DocutApp.getProject().pages[DocutApp.getState().pageIndex].referenceFidelity.vectorEdits));
 await page.locator('[data-ubs-close]').click();
 assert.ok(!await page.locator('#ubsVectorPanel').isVisible());
 assert.deepEqual(errors,[], 'No runtime errors');
 await page.close();
}
} finally {await browser.close();}
console.log('PASS UBS gallery scope + six page preview + insertion + vector editor desktop/mobile');
}
run().catch(err=>{console.error(err.stack);process.exit(1)});

