'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const SOURCE=fs.readFileSync(path.join(__dirname,'../assets/ubs_vector_source.js'),'utf8');
const NUMBERS=[5,8,11,13,16,18];
function makeEnvironment({malicious=false,badRegions=false}={}){
 const events=[],svg=Object.fromEntries(NUMBERS.map(no=>[String(no),malicious&&no===13?'<svg><script>alert(1)</script></svg>':'<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0 L10 10"/></svg>']));
 const regions=Object.fromEntries(NUMBERS.map(no=>[String(no),badRegions&&no===13?[['bad']]:[[20,30,50,18,12,400]]]));
 let reads=0;
 class FakeBlob{stream(){return {pipeThrough(){return {valid:true};}}}}
 class FakeResponse{async text(){return JSON.stringify((reads++%2)===0?svg:regions);}}
 const sandbox={Blob:FakeBlob,Response:FakeResponse,Uint8Array,atob:()=>'\x01',
  Event:class{constructor(type){this.type=type;}},dispatchEvent:e=>events.push(e.type),module:{exports:{}}};
 vm.runInNewContext(SOURCE,sandbox,{filename:'ubs_vector_source.js'});
 return {sandbox,events,api:sandbox.DocutUBSVectorSource,reads:()=>reads,
  enable(){sandbox.DecompressionStream=class{constructor(type){assert.equal(type,'gzip');}};}};
}
test('missing gzip decoder never creates a false-ready original, and emits recoverable error',async()=>{
 const env=makeEnvironment(),{api,events}=env;
 await api.ready;
 assert.equal(api.status,'unavailable');
 assert.match(api.error,/DecompressionStream/);
 assert.match(api.layer({referenceFidelity:{mode:'source-ratio',sourcePage:13}}),/로드 실패/);
 assert.deepEqual(events,['docut-ubs-vector-error']);
});
test('retry after failed startup rehydrates exactly six pages and shares a single in-flight decode',async()=>{
 const env=makeEnvironment(),{api,events}=env;
 await api.ready;env.enable();
 const [first,second]=await Promise.all([api.retry(),api.retry()]);
 assert.equal(api.status,'ready');
 assert.equal(first,second);
 assert.equal(env.reads(),2);
 assert.equal(Object.keys(api.pages).length,6);
 assert.match(api.layer({referenceFidelity:{mode:'source-ratio',sourcePage:13}}),/<svg/);
 assert.deepEqual(events,['docut-ubs-vector-error','docut-ubs-vector-ready']);
 await api.retry();assert.equal(env.reads(),2,'retries never decode already available source');
});
test('malicious SVG and damaged slot geometry fail closed, not partially loaded',async()=>{
 for(const flags of [{malicious:true},{badRegions:true}]){
  const env=makeEnvironment(flags),{api}=env;env.enable();
  await api.ready; // startup begins without decoder; retry with explicitly enabled one
  await api.retry();
  assert.equal(api.status,'unavailable');
  assert.deepEqual(Object.keys(api.pages),[]);
  assert.match(api.error,/UBS SVG|좌표/);
 }
});
