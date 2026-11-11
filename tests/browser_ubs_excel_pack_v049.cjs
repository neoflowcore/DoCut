'use strict';
// Manual Playwright acceptance: no GitHub Actions, no automatic release build.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const fixture=path.join('/tmp','docut_ubs_v049.xlsx');
const target=process.env.DOCUT_QA_URL||'file://'+path.resolve(__dirname,'../index.html');
execFileSync('python3',[path.join(__dirname,'fixtures/make_report_workbook.py'),fixture],{stdio:'inherit'});
async function run(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const viewport of [{width:1452,height:952},{width:390,height:844}]){
   const page=await browser.newPage({viewport,acceptDownloads:true,deviceScaleFactor:1});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(target,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.DocutUBSVectorSource?.status==='ready',{timeout:25000});
   await page.locator('[data-action="template-gallery"]').first().click();
   await page.locator('[data-kit-choice="FIN-16"]').click();
   assert.equal(await page.locator('#kitUBSRetry').isVisible(),false);
   assert.equal(await page.locator('#kitPackAdd').isDisabled(),false);
   assert.equal(await page.locator('#kitPackPageStrip [data-kit-page]').count(),6);
   await page.locator('#kitPackAdd').click();
   const original=await page.evaluate(()=>DocutApp.getProject().pages.filter(p=>p.referenceFidelity?.mode==='source-ratio').map(p=>p.elements.length));
   assert.deepEqual(original,[13,24,28,26,26,40]);
   await page.evaluate(()=>DocutApp.selectPage(4)); // 13th official source PDF page
   await page.locator('[data-action="data-motion"]').first().click();
   await page.locator('#workbookFile').setInputFiles(fixture);
   await page.waitForFunction(()=>!document.querySelector('#dataOptions').hidden,{timeout:30000});
   await page.locator('#dataReviewPack').click();
   assert.equal(await page.locator('#dataApply').isDisabled(),true,'UBS must never auto-bind arbitrary numeric header');
   const selects=page.locator('#dataBatchReview select');
   assert.equal(await selects.count(),2);
   await selects.nth(0).selectOption('1');
   await selects.nth(1).selectOption('1');
   assert.equal(await page.locator('#dataApply').isDisabled(),true,'each manual edit must invalidate old review');
   await page.locator('#dataReviewPack').click();
   assert.equal(await page.locator('#dataApply').isDisabled(),false);
   await page.locator('#dataApply').click();
   const audit=await page.evaluate(()=>{
    const p=DocutApp.getProject(),pages=p.pages.filter(x=>x.referenceFidelity?.mode==='source-ratio');
    const charts=pages.map(x=>x.elements.filter(e=>e.dataBinding));
    const exportHTML=DocutExporter.exportHTML(p);
    return {counts:charts.map(x=>x.length),
     signed:charts.map(xs=>xs.map(b=>({n:b.data.values.length,neg:b.data.values.filter(n=>n<0).length,palette:b.data.palette,
      source:b.source,first:b.data.values[0],pos:[b.x,b.y,b.w,b.h]}))),
     exported:exportHTML.includes('docut_ubs_v049.xlsx'),
     sourceSVG:exportHTML.includes('ubs-source-layer'),
     projectJSON:JSON.stringify(DocutCore.normalizeProject(p)).includes('docut_ubs_v049.xlsx')};
   });
   assert.deepEqual(audit.counts,[0,0,0,1,1,0]);
   assert.ok(audit.signed[3][0].n===80&&audit.signed[4][0].n===80);
   assert.equal(audit.signed[3][0].neg,8);
   assert.equal(audit.signed[3][0].palette,'ubs');
   assert.ok(audit.exported&&audit.sourceSVG&&audit.projectJSON);
   const screenshot=path.join('/tmp','docut_ubs_v049_'+viewport.width+'.png');
   await page.screenshot({path:screenshot});
   assert.deepEqual(errors,[],'No application JavaScript errors');
   console.log('UBS 6-page Excel mapping PASS',viewport.width,JSON.stringify(audit).slice(0,1500),screenshot);
   await page.close();
  }
 }finally{await browser.close();}
}
run().catch(e=>{console.error('UBS manual-browser QA FAILED',e.stack||e);process.exitCode=1;});
