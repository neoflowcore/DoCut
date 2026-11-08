'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
execFileSync('python3',['tests/fixtures/make_report_workbook.py','/tmp/docut_excel_v039.xlsx'],{stdio:'inherit'});
async function main(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
 const page=await browser.newPage({viewport:{width:1452,height:952},acceptDownloads:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file:///vercel/DoCut/index.html');
 await page.waitForFunction(()=>window.DocutUBSVectorSource?.status==='ready',{timeout:30000});
 await page.locator('[data-action="template-gallery"]').first().click();
 await page.locator('[data-kit-choice="FIN-16"]').click();
 await page.locator('#kitPackAdd').click();
 await page.evaluate(()=>DocutApp.selectPage(4));
 assert.equal(await page.evaluate(()=>DocutApp.getProject().pages[DocutApp.getState().pageIndex].referenceFidelity.sourcePage),13);
 await page.locator('[data-action="data-motion"]').click();
 assert.ok(await page.locator('#dataMotionDialog').isVisible());
 await page.locator('#workbookFile').setInputFiles('/tmp/docut_excel_v039.xlsx');
 await page.waitForFunction(()=>!document.querySelector('#dataOptions').hidden&&window.DocutAnalytics!=null,{timeout:30000});
 let loaded=await page.evaluate(()=>({sheetCount:document.querySelector('#workbookSheet').options.length,range:document.querySelector('#workbookRange').value,label:document.querySelector('#labelColumn').value,value:document.querySelector('#valueColumn').value,style:document.querySelector('#dataChartStyle').value,place:document.querySelector('#dataUBSPlacement').checked,stats:document.querySelector('#dataStatsSummary').textContent.slice(0,170)}));
 console.log('LOAD',JSON.stringify(loaded));
 assert.equal(loaded.sheetCount,2);
 assert.equal(loaded.range,'A1:C81');
 assert.equal(loaded.value,'2');
 assert.equal(loaded.style,'ubs');
 assert.equal(loaded.place,true);
 assert.ok(loaded.stats.includes('유효 80'));
 await page.locator('#dataReview').click();
 console.log('REVIEW',await page.locator('#dataStatus').innerText());
 assert.equal(await page.locator('#dataApply').isDisabled(),false);
 await page.locator('#dataApply').click();
 const first=await page.evaluate(()=>{
 const pr=DocutApp.getProject(),pg=pr.pages[DocutApp.getState().pageIndex];
 const bar=pg.elements.find(el=>el.dataBinding?.sheetId==='1');
 const dom=document.querySelector('.element[data-id="'+bar?.id+'"]');
 const svg=dom?.querySelector('svg.chart-svg');
 return {datasetCount:pr.datasets.length,type:bar?.type,valueCount:bar?.data.values.length,negative:bar?.data.values.filter(v=>v<0).length,
  sourcePage:pg.referenceFidelity.sourcePage,palette:bar?.data.palette,mode:bar?.dataBinding.analysisMode,slot:bar?{x:bar.x,y:bar.y,w:bar.w,h:bar.h}:null,
  rects:svg?.querySelectorAll('rect').length,hasGrid:svg?.classList.contains('chart-svg-dense'),htmlExport:DocutExporter.exportHTML(pr).includes('chart-svg-dense')};
 });
 console.log('INSERT',JSON.stringify(first));
 assert.equal(first.valueCount,80);assert.equal(first.negative,8);
 assert.equal(first.datasetCount,1);assert.equal(first.palette,'ubs');
 assert.ok(first.slot.x>100&&first.slot.w>600&&first.rects===80&&first.htmlExport);
 assert.ok(first.hasGrid);
 const exported=await page.evaluate(()=>DocutExporter.exportHTML(DocutApp.getProject()));
 const offlinePage=await browser.newPage({viewport:{width:1452,height:952}});
 const offlineErrors=[];offlinePage.on('pageerror',e=>offlineErrors.push(e.message));
 await offlinePage.setContent(exported,{waitUntil:'domcontentloaded'});
 const offline=await offlinePage.evaluate(()=>({analytics:typeof window.DocutAnalytics,source:!!document.getElementById('docut-project'),charts:[...document.querySelectorAll('svg.chart-svg-dense')].map(svg=>({rects:svg.querySelectorAll('rect').length,labels:svg.querySelectorAll('title').length})),errors:[...document.querySelectorAll('.data-motion-controls')].map(e=>e.textContent).filter(t=>/오류|한도|12개|120개/.test(t))}));
 console.log('OFFLINE',JSON.stringify(offline),'pageErrors',offlineErrors);
 assert.equal(offline.analytics,'object');
 assert.ok(offline.charts.some(c=>c.rects===80));
 assert.deepEqual(offline.errors,[]);
 assert.deepEqual(offlineErrors,[]);
 await offlinePage.close();
 await page.screenshot({path:'/tmp/docut_excel_ubs_overlay.png'});
 await page.locator('[data-action="data-motion"]').click();
 await page.locator('#existingDataset').selectOption({index:1});
 await page.locator('#workbookSheet').selectOption({index:1});
 await page.locator('#dataAnalysisMode').selectOption('group');
 await page.locator('#dataAggregate').selectOption('sum');
 await page.locator('#dataKind').selectOption('bar');
 await page.locator('#dataReview').click();
 console.log('GROUP_REVIEW',await page.locator('#dataStatus').innerText());
 assert.equal(await page.locator('#dataApply').isDisabled(),false);
 await page.locator('#dataApply').click();
 const group=await page.evaluate(()=>{
 const pg=DocutApp.getProject().pages[DocutApp.getState().pageIndex];
 const bars=pg.elements.filter(e=>e.dataBinding);
 return bars.map(b=>({mode:b.dataBinding.analysisMode,labels:b.data.labels,values:b.data.values}));
 });
 console.log('GROUP',JSON.stringify(group));
 assert.ok(group.some(g=>g.mode==='group'&&g.labels.length===3&&g.values.includes(200)));
 assert.deepEqual(errors,[]);
 await page.close();
 console.log('PASS REAL XLSX → 80-bar UBS slot → 2-sheet grouping → HTML export');
 }finally{await browser.close();}
}
main().catch(e=>{console.error('FAIL',e.stack||e);process.exitCode=1;});

