'use strict';
// Source-only contract: routine code uploads must not spend Actions/Vercel build budget.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
test('V0.26 Git integration must not auto-deploy any Vercel branch',()=>{
 const configuration=JSON.parse(fs.readFileSync(path.join(ROOT,'vercel.json'),'utf8'));
 assert.equal(configuration.git?.deploymentEnabled,false);
 assert.equal(configuration.$schema,'https://openapi.vercel.sh/vercel.json');
});
test('V0.26 does not ship GitHub Actions that start on push',()=>{
 const dir=path.join(ROOT,'.github','workflows');
 assert.equal(fs.existsSync(dir)?fs.readdirSync(dir).filter(n=>/\.ya?ml$/i.test(n)).length:0,0);
});
test('89 design references are source metadata, not licensed screenshots or videos',()=>{
 const catalog=JSON.parse(fs.readFileSync(path.join(ROOT,'docs','REFERENCE_CATALOG_SOURCE_V026.json'),'utf8'));
 assert.equal(catalog.source.fileCount,89);
 assert.equal(catalog.source.containsActualVideoOrAudio,false);
 assert.equal(catalog.source.containsRunnableCode,false);
 assert.equal(catalog.screenshots.length,89);
 assert.equal(catalog.referenceGroups.reduce((sum,x)=>sum+x.images,0),89);
});
