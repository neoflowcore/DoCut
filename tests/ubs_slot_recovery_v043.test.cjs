'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {collect,apply}=require('../assets/ubs_slot_recovery.js');
function sheet(id,edition='2025',elements=[]){
 return {id,designIdentity:'FIN-16',elements,referenceFidelity:{mode:'source-ratio',sourceEdition:edition,sourcePage:13}};
}
test('UBS asynchronous slot loading repairs only missing placeholders, never existing user edits',()=>{
 let indexCalls=0;
 const vector={status:'ready',sourcePages:[5,8,11,13,16,18],
  make(index){indexCalls++;return {elements:[{id:'new-'+indexCalls,type:'text',text:'',x:90,y:100,w:200,h:50}]};}
 };
 const userEdited=sheet('existing','2025',[{id:'text-with-user-value',type:'text',text:'KEEP VALUE',x:100,y:200,w:200,h:60}]);
 const preexisting=sheet('preexisting-2026','2026',[]);
 const ordinary={id:'other',elements:[],referenceFidelity:{mode:'adapted-16:9',sourceEdition:'2025',sourcePage:13}};
 const document={pages:[sheet('empty'),userEdited,preexisting,ordinary]};
 const pending=collect(document,vector);
 assert.equal(pending.length,1);assert.equal(pending[0].id,'empty');
 assert.equal(apply(document,pending),1);
 assert.equal(document.pages[0].elements.length,1);
 assert.equal(document.pages[1].elements[0].text,'KEEP VALUE');
 assert.equal(document.pages[2].elements.length,0);
 assert.equal(document.pages[3].elements.length,0);
 assert.equal(collect(document,vector).length,0,'no duplicate slot recovery');
 assert.equal(apply(document,pending),0,'race-safe idempotent update');
 assert.equal(indexCalls,1);
});
test('UBS source cannot be restored before ready, and mismatched source page is untouched',()=>{
 const pg={pages:[sheet('notloaded')]};
 assert.deepEqual(collect(pg,{status:'loading',sourcePages:[13],make:()=>({elements:[{}]})}),[]);
 assert.deepEqual(collect(pg,{status:'ready',sourcePages:[5,8],make:()=>({elements:[{}]})}),[]);
 assert.deepEqual(collect(pg,{status:'unavailable',sourcePages:[13],make:()=>({elements:[{}]})}),[]);
});
test('UBS recovery rejects empty or excessive slot snapshots',()=>{
 const pg={pages:[sheet('empty')]};
 assert.deepEqual(collect(pg,{status:'ready',sourcePages:[13],make:()=>({elements:[]})}),[]);
 assert.deepEqual(collect(pg,{status:'ready',sourcePages:[13],make:()=>({elements:Array(121).fill({type:'text'})})}),[]);
});
