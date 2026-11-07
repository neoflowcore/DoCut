'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../assets/core.js');require('../assets/core_enhanced.js');
const I=require('../assets/import_review.js'),T=require('../assets/text_rewrite.js');
const create=()=>C.createProject(3);

test('V0.20 import inspector available and version explicit',()=>{assert.equal(C.VERSION,'0.33.0-development');assert.equal(typeof I.analyze,'function')});
test('import counts preserve evidence, verification, media and formatted data',()=>{
 const p=create(),b=p.pages[0].elements[0];b.source='document';b.verified=true;b.richText=[{text:'hi',bold:true}];const c=I.counts(p);
 assert.equal(c.pages,3);assert.equal(c.evidence,1);assert.equal(c.verified,1);assert.equal(c.rich,1);assert.ok(c.blocks>0);
});
test('real outgoing media counted and local embedded media retained',()=>{
 const p=create();p.pages[0].elements.push(C.makeBlock('image',10,20,{data:{src:'',alt:'A'}}));let c=I.counts(p);assert.equal(c.images,1);assert.equal(c.missingImages,1);
 p.pages[0].elements.at(-1).data.src='data:image/png;base64,AAAA';c=I.counts(p);assert.equal(c.missingImages,0);
});
test('overflow outside 16:9 is not silently considered visible',()=>{
 const p=create();p.pages[0].elements.push(C.makeBlock('shape',1200,600,{w:110,h:180}));assert.ok(I.counts(p).offcanvas>=1);
});
test('non-native import requires explicit risk acknowledgement',()=>{
 const x=I.analyze(create(),{mode:'css-approximation',project:create(),warnings:[],losses:[]});assert.equal(x.requireAcknowledgement,true);assert.ok(x.findings.some(f=>f.kind==='approximation'));
});
test('native project without loss warning need not acknowledge',()=>{
 const x=I.analyze(create(),{mode:'native-json',project:create()});assert.equal(x.requireAcknowledgement,false);
});
test('parser truncation is high risk and duplicates collapse',()=>{
 const x=I.analyze(create(),{mode:'native',project:create(),warnings:['Only first 50 pages imported','Only first 50 pages imported']});assert.equal(x.severe,1);assert.equal(x.findings.filter(f=>f.origin==='parser').length,1);
});
test('merging into more than 50 pages is identified',()=>{
 const p=create();p.pages=Array.from({length:49},(_,i)=>C.createPage(i,49));assert.equal(I.analyze(p,{mode:'native-json',project:create()}).appendAllowed,false);
});
test('inert visual preview escapes source HTML and cannot execute code',()=>{
 const p=create();p.pages[0].elements[0].text='<img src=x onerror=alert(1)>';
 const m=I.pagePreview(p.pages[0]);assert.ok(m.includes('&lt;img'));assert.ok(!m.includes('<img src=x'));assert.ok(!m.includes('onclick='));
});
test('preview yields bounded coordinates with no unsanitized values',()=>{
 const p=create();p.pages[0].elements[0].x=-1e9;p.pages[0].elements[0].y=1e12;
 const out=I.pagePreview(p.pages[0]);assert.ok(!out.includes('Infinity'));assert.ok(!out.includes('NaN'));assert.ok(out.includes('left:0.000%'));
});
test('literal text replace keeps original and casefold safe',()=>{
 assert.deepEqual(T.replaceLiteral('abc ABC abc','abc','X',true),{text:'X ABC X',hits:2});
 assert.deepEqual(T.replaceLiteral('abc ABC abc','abc','X',false),{text:'X X X',hits:3});
 assert.equal(T.replaceLiteral('İi','i','X',false).text,'İX');
});
test('replacement explicitly excludes sources and statistical raw data',()=>{
 const p=create();const e=p.pages[0].elements[0];e.text='Risk Risk';e.source='Risk';e.evidence='Risk';e.verified=true;
 const plan=T.preview(p,'Risk','Mitigation');const after=T.apply(p,plan,[e.id]);const saved=after.project.pages[0].elements[0];
 assert.equal(saved.text,'Mitigation Mitigation');assert.equal(saved.source,'Risk');assert.equal(saved.evidence,'Risk');assert.equal(saved.verified,false);assert.equal(e.text,'Risk Risk');
});
test('locked and formatted layers are excluded by default and counted',()=>{
 const p=create();let a=p.pages[0].elements[0],b=p.pages[0].elements[1];a.text='Risk';a.locked=true;b.text='Risk';b.richText=[{text:'Risk',bold:true}];
 const plan=T.preview(p,'Risk','Safe');assert.equal(plan.hits,0);assert.equal(plan.skippedLocked,1);assert.equal(plan.skippedFormatted,1);
});
test('formatted replacement opt-in shows warning and resets rich runs only for approved block',()=>{
 const p=create(),e=p.pages[0].elements[0];e.text='Risk';e.richText=[{text:'Risk',bold:true}];
 const plan=T.preview(p,'Risk','Safe',{includeFormatted:true});assert.equal(plan.rows.length,1);assert.equal(plan.rows[0].formatWillReset,true);
 const n=T.apply(p,plan,[e.id]);assert.equal(n.project.pages[0].elements[0].richText.length,0);assert.equal(p.pages[0].elements[0].richText.length,1);
});
test('all-or-nothing on stale targeted element',()=>{
 const p=create(),e=p.pages[0].elements[0];e.text='Risk';const plan=T.preview(p,'Risk','Safe');p.pages[0].elements[0].text='Changed Risk';
 assert.throws(()=>T.apply(p,plan,[e.id]),/검토 이후 변경/);assert.equal(p.pages[0].elements[0].text,'Changed Risk');
});
test('unapproved candidates left untouched',()=>{
 const p=create(),a=p.pages[0].elements[0],b=p.pages[0].elements[1];a.text='Risk';b.text='Risk';const plan=T.preview(p,'Risk','Safe');
 const r=T.apply(p,plan,[a.id]);assert.equal(r.changed,1);assert.equal(r.project.pages[0].elements[1].text,'Risk');
});
test('search replacement scope and exact case settings',()=>{
 const p=create();p.pages[0].elements[0].text='RISK';p.pages[1].elements[0].text='RISK';
 assert.equal(T.preview(p,'RISK','OK',{pageIndex:1,caseSensitive:true}).hits,1);
 assert.equal(T.preview(p,'risk','OK',{pageIndex:1,caseSensitive:true}).hits,0);
});
test('length overflow is skipped rather than silently truncated',()=>{
 const p=create(),e=p.pages[0].elements[0];e.text='RISK '.repeat(1500);const plan=T.preview(p,'RISK','Long replacement');
 assert.equal(plan.rows.length,0);assert.equal(plan.skippedOverflow,1500);
});
test('more than two thousand occurrences is rejected, not partially applied',()=>{
 const p=create();p.pages[0].elements[0].text='a'.repeat(2200);assert.throws(()=>T.preview(p,'a','b'),/2,000/);
});
test('provenance fields not eligible even when they contain query',()=>{
 const p=create(),e=p.pages[0].elements[0];e.text='Content';e.source='Risk';e.notes='Risk';
 assert.equal(T.preview(p,'Risk','X').hits,0);
});
test('empty or oversize query fails before change',()=>{
 const p=create();assert.throws(()=>T.preview(p,' ','x'));assert.throws(()=>T.preview(p,'A'.repeat(121),'x'));assert.throws(()=>T.preview(p,'a','a'));
});
