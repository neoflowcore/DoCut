#!/usr/bin/env node
'use strict';
/* Independent browser graphics evidence. Run: node tools/capture_ubs_vector_browser.cjs http://127.0.0.1:8765/ /tmp/ubs_browser
   Prerequisite: npm install --no-save playwright && npx playwright install chromium.
   Never derive the reference screenshot from the same SVG; the PDF reference is separately rendered by score_ubs_browser.py. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
async function main(){
 const {chromium}=require('playwright');
 const base=process.argv[2]||'http://127.0.0.1:8765/';
 const out=path.resolve(process.argv[3]||'/tmp/ubs_browser');
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try {
  const page=await browser.newPage({viewport:{width:1263,height:893},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.DocutUBSVectorSource?.status==='ready',{timeout:30000});
  const vector=await page.evaluate(()=>({...window.DocutUBSVectorSource.pages}));
  const pages=[5,8,11,13,16,18];
  for(const n of pages){
   const svg=vector[String(n)];
   if(!svg||!/^<svg\b/.test(svg)||/<(?:text|image|script|foreignObject)\b/i.test(svg))throw Error('Invalid or text-contaminated UBS vector page '+n);
   await page.setContent('<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:white}svg{display:block;width:1263px;height:893px}</style></head><body>'+svg+'</body></html>');
   const output=path.join(out,'ubs_p'+n+'_browser.png');
   await page.screenshot({path:output});
   console.log(n,path.basename(output),crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex'));
  }
  if(errors.length)throw Error('Page JavaScript errors: '+errors.join('; '));
 }finally {await browser.close();}
}
main().catch(err=>{console.error(err.stack||String(err));process.exitCode=1;});
