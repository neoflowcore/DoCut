'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const R=require('../assets/rich_text.js');
const text=value=>({nodeType:3,nodeValue:value});
const tag=(name,children=[],styles={})=>({nodeType:1,tagName:name.toUpperCase(),style:styles,childNodes:children,getAttribute(){return null;}});
const field=(...children)=>({childNodes:children});
test('format runs above 1000 characters are split, never silently truncated',()=>{
 const input='A'.repeat(2300);const result=R.collect(field(tag('strong',[text(input)])));
 assert.equal(result.text,input);assert.equal(result.richText.length,3);
 assert.deepEqual(result.richText.map(x=>x.text.length),[1000,1000,300]);
 assert.equal(result.richText.map(x=>x.text).join(''),input);
 assert(result.richText.every(x=>x.bold));
});
test('unstyled text keeps its original content without unnecessary rich runs',()=>{
 const result=R.collect(field(text('plain '+ 'x'.repeat(11700))));
 assert.equal(result.text.length,11706);assert.deepEqual(result.richText,[]);
});
test('more than 12000 characters is rejected rather than clipped',()=>{
 assert.throws(()=>R.collect(field(text('x'.repeat(12001)))),/12000/);
});
test('more than 60 formatting runs is rejected with no partial result',()=>{
 const pieces=[];for(let i=0;i<61;i++)pieces.push(tag(i%2?'strong':'em',[text('S')]));
 assert.throws(()=>R.collect(field(...pieces)),/60 format runs/);
});
test('surrogate pairs remain intact across split boundaries',()=>{
 const source='x'.repeat(999)+'\ud83d\ude00'+'y'.repeat(2000);
 const result=R.collect(field(tag('strong',[text(source)])));
 assert.equal(result.text,source);assert.equal(result.richText.map(x=>x.text).join(''),source);
 assert(result.richText.every(x=>!x.text.endsWith('\ud83d')));
});
