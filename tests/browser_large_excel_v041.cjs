'use strict';
// Manually launched browser acceptance gate; intentionally not included in CI.
const assert=require('node:assert/strict'),{chromium}=require('playwright');
const {execFileSync}=require('node:child_process');
const {resolve}=require('node:path'),{pathToFileURL}=require('node:url');
const input=process.env.DOCUT_LARGE_WORKBOOK||'/tmp/docut_large_v041.xlsx';
const rows=Number(process.env.DOCUT_LARGE_ROWS||6500),columns=Number(process.env.DOCUT_LARGE_COLUMNS||120);
const columnName=i=>{let s='';for(i++;i>0;i=Math.floor((i-1)/26))s=String.fromCharCode(65+(i-1)%26)+s;return s;};
const expectedCells=rows*columns+2,expectedRange='A1:'+columnName(columns-1)+(rows+1);
if(!process.env.DOCUT_LARGE_WORKBOOK){
 execFileSync('python3',['tools/create_large_excel_fixture.py','--rows',String(rows),'--columns',String(columns),'--output',input],{stdio:'inherit'});
}
async function run(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--js-flags=--max-old-space-size=4096']});
 try{
  const page=await browser.newPage({viewport:{width:1452,height:952}});
  const errors=[];page.on('pageerror',error=>errors.push(String(error.message)));
  await page.goto(pathToFileURL(resolve('index.html')).href,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.DocutApp&&!!window.DocutLargeDataset,{timeout:30000});
  await page.locator('[data-action="data-motion"]').click();
  await page.locator('#workbookFile').setInputFiles(input);
  await page.waitForFunction(()=>!document.getElementById('dataOptions').hidden,{timeout:180000});
  const loaded=await page.evaluate(()=>({
   sheet:document.querySelector('#workbookSheet').selectedOptions[0].textContent,
   mode:document.querySelector('#dataAnalysisMode').value,
   status:document.querySelector('#dataStatus').textContent,
   range:document.querySelector('#workbookRange').value
  }));
  assert.ok(loaded.sheet.includes((rows+1)+'행'),loaded.sheet);
  assert.equal(loaded.range,expectedRange);
  assert.equal(loaded.mode,'group');
  await page.locator('#dataReview').click();
  const review=await page.locator('#dataStatus').innerText();
  assert.match(review,/대용량 모드/);
  assert.ok(review.includes(expectedCells.toLocaleString('ko-KR')+'셀'),review);
  assert.equal(await page.locator('#dataApply').isDisabled(),false);
  await page.locator('#dataApply').click();
  const result=await page.evaluate(()=>{
   const p=window.DocutApp.getProject();
   const block=p.pages.flatMap(pg=>pg.elements).find(el=>el.dataBinding);
   return {datasets:p.datasets.length,stored:p.datasets[0]?.sheets[0].cells.length,
    values:block?.data.values,source:block?.source,html:window.DocutExporter.exportHTML(p)};
  });
  assert.equal(result.datasets,1);
  assert.ok(result.stored<=102);
  assert.equal(result.values.length,50);
  assert.ok(result.source.includes('대용량 원본'));
  const offline=await browser.newPage({viewport:{width:1452,height:952}});
  const exportErrors=[];offline.on('pageerror',e=>exportErrors.push(e.message));
  await offline.setContent(result.html,{waitUntil:'domcontentloaded'});
  assert.ok(await offline.locator('.chart-svg').count());
  assert.deepEqual(exportErrors,[]);
  assert.deepEqual(errors,[]);
  console.log('PASS',expectedCells,'XLSX cells, group chart, compact saved data, standalone HTML, no JS errors');
  await offline.close();await page.close();
 }finally{await browser.close();}
}
run().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
