'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../assets/core.js');
require('../assets/core_enhanced.js');
const Q=require('../assets/proposal.js');
const X=require('../assets/export.js');

function pair(){
 const old=C.createProject(3,'policy');old.title='Original';
 old.pages[0].elements[0].source='Official memo, page 7';
 old.pages[0].elements[0].asOfDate='2026-10-31';
 old.pages[0].elements[0].unit='%';
 old.pages[0].elements[0].evidence='70 / 100 × 100';
 old.pages[0].elements[0].verified=true;
 old.pages[1].elements[1].source='Budget 2026';old.pages[1].elements[1].verified=true;
 const candidate=C.clone(old);
 candidate.title='AI Title';candidate.theme='ambient';
 candidate.pages[0].elements[0].text='Revised decision: 70%';
 candidate.pages[0].elements[0].source='';candidate.pages[0].elements[0].asOfDate='';candidate.pages[0].elements[0].unit='';candidate.pages[0].elements[0].evidence='';
 candidate.pages[0].elements[0].verified=true;
 candidate.pages[1].elements[1].text='New text';candidate.pages[1].elements[1].verified=true;
 return {old,candidate};
}
test('source, as-of date, unit and evidence are strict and survive JSON/HTML round-trips',()=>{
 const {old}=pair(),fresh=C.normalizeProject(old),el=fresh.pages[0].elements[0];
 assert.equal(el.source,'Official memo, page 7');assert.equal(el.asOfDate,'2026-10-31');
 assert.equal(el.unit,'%');assert.equal(el.evidence,'70 / 100 × 100');
 assert.ok(X.exportHTML(old).includes('Official memo, page 7'));
 assert.ok(X.exportHTML(old).includes('title="출처: Official memo, page 7'));
 const bad=C.clone(old);bad.pages[0].elements[0].asOfDate='2026-02-30';
 assert.throws(()=>C.normalizeProject(bad),/Invalid basis date/);
 assert.ok(!C.validDate('2025-02-29'));assert.ok(C.validDate('2024-02-29'));
});
test('analysis is non-mutating and defaults to no approval',()=>{
 const {old,candidate}=pair(),snapshot=JSON.stringify(old);
 const analysis=Q.analyze(old,candidate);
 assert.equal(analysis.changedPages,2);assert.deepEqual(analysis.settings,['title','theme']);
 assert.equal(JSON.stringify(old),snapshot);
 assert.throws(()=>Q.apply(old,analysis,[]),/Select at least/);
});
test('page 1 approval only preserves page 2 and shared project settings',()=>{
 const {old,candidate}=pair(),diff=Q.analyze(old,candidate),out=Q.apply(old,diff,[0],false,{approveNumeric:true}).project;
 assert.equal(out.title,'Original');assert.equal(out.theme,'wood');
 assert.equal(out.pages[0].elements[0].text,'Revised decision: 70%');
 assert.equal(out.pages[0].elements[0].source,'Official memo, page 7');
 assert.equal(out.pages[0].elements[0].asOfDate,'2026-10-31');
 assert.equal(out.pages[0].elements[0].unit,'%');
 assert.equal(out.pages[0].elements[0].evidence,'70 / 100 × 100');
 assert.equal(out.pages[0].elements[0].verified,false);
 assert.equal(out.pages[1].elements[1].text,old.pages[1].elements[1].text);
 assert.equal(out.pages[1].elements[1].verified,true);
});
test('approving document settings alone never changes report pages',()=>{
 const {old,candidate}=pair(),diff=Q.analyze(old,candidate),out=Q.apply(old,diff,[],true).project;
 assert.equal(out.title,'AI Title');assert.equal(out.theme,'ambient');
 assert.equal(out.pages[0].elements[0].text,old.pages[0].elements[0].text);
});
test('verification cannot be asserted by AI without content modifications',()=>{
 const {old}=pair();old.pages[0].elements[0].verified=false;
 const proposed=C.clone(old);proposed.pages[0].elements[0].verified=true;
 const analysis=Q.analyze(old,proposed);
 assert.equal(analysis.changedPages,0);
 const changed=C.clone(proposed);changed.pages[1].elements[0].text='Modified';
 const r=Q.apply(old,Q.analyze(old,changed),[1]);
 assert.equal(r.project.pages[0].elements[0].verified,false);
 assert.equal(r.project.pages[1].elements[0].verified,false);
});
test('AI can propose added elements and new pages but never automatically verifies them',()=>{
 const {old}=pair(),next=C.clone(old);
 next.pages[1].elements.push(C.makeBlock('kpi',500,200,{text:'999',source:'AI suggestion',verified:true}));
 next.pages.push(C.createPage(3,4));next.pages.at(-1).elements[0].verified=true;
 const analysis=Q.analyze(old,next);assert.equal(analysis.changedPages,2);
 const out=Q.apply(old,analysis,[1,3],false,{approveNumeric:true,allowEvidenceChange:true}).project;
 assert.equal(out.pages.length,4);
 assert.equal(out.pages[1].elements.at(-1).verified,false);
 assert.equal(out.pages[3].elements[0].verified,false);
});
test('explicit AI deletions cannot leave an empty report',()=>{
 const old=C.createProject(1),candidate=C.clone(old);
 // One valid page is required at the schema boundary; an invalid project is rejected.
 candidate.pages=[];assert.throws(()=>Q.analyze(old,candidate),/Page count/);
});
test('partial page ID renames are flagged as ambiguous and never implicitly delete the original',()=>{
 const {old,candidate}=pair(),id=old.pages[0].id;
 candidate.pages[0].id='new-id-supplied-by-ai';
 const a=Q.analyze(old,candidate);assert.equal(a.identityWarnings,1);
 assert.equal(a.matchingMode,'stable-id');
 const remove=a.rows.find(r=>r.originIndex===0),addition=a.rows.find(r=>r.proposalIndex===0);
 assert.equal(remove.kind,'삭제');assert.equal(addition.kind,'추가');
 const noOp=Q.apply(old,a,[addition.index],false,{approveNumeric:true}).project;
 assert.equal(noOp.pages.length,old.pages.length+1);
 assert.ok(noOp.pages.some(pg=>pg.id===id));
 assert.ok(noOp.pages.some(pg=>pg.id==='new-id-supplied-by-ai'));
 const originalBlockIds=new Set(old.pages.flatMap(pg=>pg.elements.map(e=>e.id)));
 assert.ok(noOp.pages.find(pg=>pg.id==='new-id-supplied-by-ai').elements.every(el=>!originalBlockIds.has(el.id)),'new page must not duplicate original element IDs');
});
test('untrusted proposed strings are HTML escaped, no active code in HTML',()=>{
 const {old,candidate}=pair();candidate.pages[0].elements[0].text='<script>window.bad=1</script>';
 const out=Q.apply(old,Q.analyze(old,candidate),[0],false,{approveNumeric:true}).project;
 const html=X.exportHTML(out);
 assert.ok(!html.includes('<script>window.bad=1</script>'));
 assert.ok(html.includes('&lt;script&gt;window.bad=1&lt;/script&gt;'));
});
test('audit reports date and unit gaps on numeric blocks, while search finds provenance',()=>{
 const {old}=pair(),bar=C.makeBlock('bar',100,200,{source:'Economic report',asOfDate:'',unit:''});
 old.pages[0].elements.push(bar);
 const issues=C.auditProject(old).filter(x=>x.id===bar.id);
 assert.ok(issues.some(x=>x.type==='basis-date'));assert.ok(issues.some(x=>x.type==='unit'));
 assert.ok(C.searchProject(old,'Official memo').length>=1);
 assert.ok(C.searchProject(old,'2026-10-31').length>=1);
});
test('HTML result retains explicit metadata on elements, but not AI verification claims',()=>{
 const project=C.createProject(1);
 project.pages[0].elements[0].source='2026 memo';
 project.pages[0].elements[0].evidence='Text explanation';
 project.pages[0].elements[0].asOfDate='2026-11-01';
 project.pages[0].elements[0].unit='KRW';
 const html=X.exportHTML(project);
 assert.match(html,/기준일: 2026-11-01/);
 assert.match(html,/단위: KRW/);
 assert.match(html,/근거: Text explanation/);
});
test('AI deleting a middle page cannot accidentally replace the following page',()=>{
 const old=C.createProject(4,'research'),candidate=C.clone(old),deleted=old.pages[1].id;
 candidate.pages.splice(1,1);
 const analysis=Q.analyze(old,candidate);
 assert.equal(analysis.matchingMode,'stable-id');
 assert.equal(analysis.changedPages,1);
 const row=analysis.rows.find(r=>r.originIndex===1);
 assert.equal(row.kind,'삭제');
 const out=Q.apply(old,analysis,[row.index],false,{approveNumeric:true}).project;
 assert.equal(out.pages.length,3);
 assert.deepEqual(out.pages.map(x=>x.id),old.pages.filter(x=>x.id!==deleted).map(x=>x.id));
});
test('AI inserting a middle page preserves the surrounding original order',()=>{
 const old=C.createProject(3),candidate=C.clone(old);
 const inserted=C.createPage(10,11);inserted.tab='Middle evidence';
 candidate.pages.splice(1,0,inserted);
 const analysis=Q.analyze(old,candidate);
 assert.equal(analysis.changedPages,1);
 const row=analysis.rows.find(r=>r.originIndex==null);
 const out=Q.apply(old,analysis,[row.index],false,{approveNumeric:true}).project;
 assert.deepEqual(out.pages.map(x=>x.id),[old.pages[0].id,inserted.id,old.pages[1].id,old.pages[2].id]);
});
test('reordered AI pages are detected, never silently reordered',()=>{
 const old=C.createProject(3),candidate=C.clone(old);
 candidate.pages=[candidate.pages[2],candidate.pages[0],candidate.pages[1]];
 const analysis=Q.analyze(old,candidate);
 assert.equal(analysis.changedPages,0);
 assert.equal(analysis.reorderWarnings,3);
 assert.throws(()=>Q.apply(old,analysis,[]),/Select at least/);
});
test('oversized project pages and rich runs fail clearly instead of silently dropping evidence',()=>{
 const p=C.createProject(1);p.pages[0].elements=Array.from({length:121},(_,i)=>C.makeBlock('text',i,0,{text:'Evidence '+i}));
 assert.throws(()=>C.normalizeProject(p),/over 120 elements/);
 const p2=C.createProject(1);p2.pages[0].elements[0].richText=Array.from({length:61},(_,i)=>({text:'Run '+i}));
 assert.throws(()=>C.normalizeProject(p2),/over|exceeds 60/);
});

test('native oversized text/charts/tables/effect stacks fail explicitly instead of silently clipping',()=>{
 const scenarios=[
  [C.makeBlock('text',10,10,{text:'X'.repeat(12001)}),/12000 characters/],
  [C.makeBlock('bar',10,10,{data:{labels:Array.from({length:13},(_,i)=>'L'+i),values:Array.from({length:13},(_,i)=>i)}}),/12 data points/],
  [C.makeBlock('table',10,10,{data:{rows:Array.from({length:25},()=>['a','b'])}}),/24 rows/],
  [C.makeBlock('table',10,10,{data:{rows:[[...Array.from({length:11},()=>'-')]]}}),/10 columns/],
  [C.makeBlock('table',10,10,{data:{rows:[['Heading'],['Y'.repeat(401)]]}}),/400 characters/],
  [C.makeBlock('text',10,10,{effects:Array.from({length:4},()=>C.makeEffect('rise'))}),/3 motion effects/]
 ];
 for(const [block,why] of scenarios)assert.throws(()=>C.normalizeBlock(block),why);
});

test('standalone HTML source drawer includes per-page safe metadata but is absent in empty provenance reports',()=>{
 const p=C.createProject(2);
 p.pages[0].elements[0].source='Finance memorandum';
 p.pages[0].elements[0].asOfDate='2026-11-03';
 p.pages[0].elements[0].evidence='ratio = value / total';
 const html=X.exportHTML(p);
 assert.match(html,/id="sources"/);assert.match(html,/id="sourcePanel"/);
 assert.match(html,/id="docut-sources"/);assert.match(html,/Finance memorandum/);
 assert.match(html,/function sourceField\(/);
 p.pages[0].elements[0].source='';p.pages[0].elements[0].asOfDate='';p.pages[0].elements[0].evidence='';
 const plain=X.exportHTML(p);
 assert.doesNotMatch(plain,/id="sources"/);
 assert.doesNotMatch(plain,/id="docut-sources"/);
});

test('CSV and spreadsheet import reject oversize data instead of silently clipping rows and cells',()=>{
 const D=require('../assets/data_io.js');
 assert.throws(()=>D.parseDelimited('A,B\n'+Array.from({length:101},(_,i)=>`row${i},${i}`).join('\n')),/100 rows/);
 assert.throws(()=>D.parseDelimited(Array.from({length:17},()=>1).join(',')),/16 columns/);
 assert.throws(()=>D.parseDelimited('A,'+'z'.repeat(2001)),/2000 characters/);
 assert.throws(()=>D.applyData(C.makeBlock('bar',0,0),Array.from({length:13},(_,i)=>`Row${i},${i}`).join('\n')),/12 data points/);
 assert.throws(()=>D.applyData(C.makeBlock('bar',0,0),'Label,Value\nA,3\nB,Not-a-number'),/Invalid numeric/);
 assert.throws(()=>D.applyData(C.makeBlock('table',0,0),Array.from({length:25},()=>`A,B`).join('\n')),/24 rows/);
 assert.throws(()=>D.applyData(C.makeBlock('table',0,0),Array.from({length:11},()=>`X`).join(',')),/10 columns/);
 const csv='Year,Value\n2024,-30\n2025,45';assert.deepEqual(D.applyData(C.makeBlock('bar',0,0),csv).values,[-30,45]);
});

test('rendered elements carry source/date/unit/evidence as escaped inert attributes for fallback import',()=>{
 const el=C.makeBlock('text',30,100,{
  source:'Publisher "Official" <2026>',asOfDate:'2026-11-03',unit:'KRW',evidence:'10 < 12 & denominator'
 });
 const html=X.renderBlock(el);
 assert.match(html,/data-source="Publisher &quot;Official&quot; &lt;2026&gt;"/);
 assert.match(html,/data-as-of-date="2026-11-03"/);
 assert.match(html,/data-unit="KRW"/);
 assert.match(html,/data-evidence="10 &lt; 12 &amp; denominator"/);
 assert.doesNotMatch(html,/<script>/);
});

test('AI assistant Markdown JSON blocks and project wrappers parse as DATA only',()=>{
 const p=C.createProject(1),payload=JSON.stringify({project:p});
 const code='AI proposed changes:\n```json\n'+payload+'\n```\nReview before use.';
 const parsed=Q.parsePayload(code);
 assert.equal(parsed.format,'Markdown JSON (project wrapper)');
 assert.equal(parsed.ignoredText,true);
 assert.deepEqual(parsed.project.pages.map(x=>x.id),p.pages.map(x=>x.id));
 assert.equal(Q.parsePayload(JSON.stringify(p)).format,'JSON');
 assert.throws(()=>Q.parsePayload('```js\n'+payload+'\n```'),/one fenced JSON/);
 assert.throws(()=>Q.parsePayload('```json\n'+payload+'\n```\n```json\n'+payload+'\n```'),/one fenced JSON/);
 assert.throws(()=>Q.parsePayload('{"pages": [,{]}'),/valid JSON/);
 assert.throws(()=>Q.parsePayload('{"notAProject": 1}'),/pages array/);
});

test('charts render accessible source-unit-aware data labels for signed values',()=>{
 const chart=C.makeBlock('bar',30,100,{text:'YoY change',unit:'%',data:{labels:['2024','2025'],values:[-30,45]}});
 const html=X.renderInner(chart);
 assert.match(html,/aria-label="2024: -30 %"/);
 assert.match(html,/aria-label="2025: 45 %"/);
 assert.match(html,/chart-unit/);
 assert.match(html,/\(-?%\)/); // unit visibly distinguishes percentage from raw value
});

test('AI diff calls out numeric changes, including table data and chart series',()=>{
 const before=C.createProject(2),candidate=C.clone(before);
 before.pages[0].elements[0].text='LTV 70%';candidate.pages[0].elements[0].text='LTV 60%';
 const tbl=C.makeBlock('table',50,260,{data:{rows:[['Year','Amount'],['2026','100']]}});
 before.pages[0].elements.push(tbl);candidate.pages[0].elements.push(C.clone(tbl));
 candidate.pages[0].elements.at(-1).data.rows[1][1]='130';
 const analysis=Q.analyze(before,candidate),first=analysis.rows[0];
 assert.equal(first.stats.numericChanged,2);
 assert.ok(first.details.some(x=>x.includes('수치 변경 요소 2')));
 assert.ok(first.stats.numericExamples.some(x=>x.includes('70%')&&x.includes('60%')));
 assert.ok(first.stats.numericExamples.some(x=>x.includes('100')&&x.includes('130')));
});

test('chart native roundtrip refuses mismatched category and value counts',()=>{
 assert.throws(()=>C.normalizeBlock(C.makeBlock('bar',0,0,{data:{labels:['A','B'],values:[1]}})),/counts differ/);
 assert.throws(()=>C.normalizeBlock(C.makeBlock('line',0,0,{data:{labels:['A'],values:['abc']}})),/non-numeric/);
 assert.deepEqual(C.normalizeBlock(C.makeBlock('line',0,0,{data:{labels:['A','B'],values:[-2,5]}})).data.values,[-2,5]);
});

test('chart CSV import refuses ignored third-party columns instead of pretending complete fidelity',()=>{
 const D=require('../assets/data_io.js');
 assert.throws(()=>D.applyData(C.makeBlock('bar',30,30),'Item,Value,Notes\nA,15,Provisional'),/exactly two CSV columns/);
});

test('native chart, rich text and motion data cannot silently clip out-of-range values',()=>{
 const table=C.makeBlock('text',0,0,{richText:[{text:'X'.repeat(1001)}]});
 assert.throws(()=>C.normalizeBlock(table),/1000 characters/);
 assert.throws(()=>C.normalizeBlock(C.makeBlock('bar',0,0,{data:{labels:['A'],values:[1e12]}})),/supported -1e9/);
 assert.throws(()=>C.normalizeBlock(C.makeBlock('donut',0,0,{data:{labels:['A'],values:[-1]}})),/negative/);
 assert.throws(()=>C.normalizeBlock(C.makeBlock('bar',0,0,{data:{labels:['A'],values:[null]}})),/non-numeric/);
 assert.throws(()=>C.normalizeBlock(C.makeBlock('text',0,0,{source:'z'.repeat(2001)})),/source exceeds 2000/);
});
test('manual chart and table series reject malformed or extra data atomically',()=>{
 assert.throws(()=>C.parseSeries(Array.from({length:13},(_,i)=>`Item${i}: ${i}`).join('\n')),/12 values/);
 assert.throws(()=>C.parseSeries('A:10\nnot-a-number\nB:20'),/no partial update/);
 assert.throws(()=>C.parseSeries('A: 10000000000'),/out of/);
 assert.deepEqual(C.parseSeries('A: -12\nB: 27').values,[-12,27]);
 assert.throws(()=>C.parseGrid(Array.from({length:25},(_,i)=>'A\t'+i).join('\n')),/24 rows/);
 assert.throws(()=>C.parseGrid(Array(11).fill('X').join('\t')),/10 columns/);
 assert.throws(()=>C.parseGrid('A|'+'X'.repeat(401)),/400 characters/);
 assert.deepEqual(C.parseGrid('A|B\nX|Y').rows,[['A','B'],['X','Y']]);
});

test('duplicated native IDs are rejected rather than silently replaced by random IDs',()=>{
 const p=C.createProject(2);p.pages[1].id=p.pages[0].id;
 assert.throws(()=>C.normalizeProject(p),/Duplicate page ID/);
 const q=C.createProject(1);q.pages[0].elements[1].id=q.pages[0].elements[0].id;
 assert.throws(()=>C.normalizeProject(q),/Duplicate element ID/);
 const r=C.createProject(1);r.pages[0].elements[0].id=r.pages[0].id;
 assert.throws(()=>C.normalizeProject(r),/Duplicate element ID/);
});

test('incomplete native page and unknown element type cannot masquerade as empty content',()=>{
 const p=C.createProject(1);delete p.pages[0].elements;
 assert.throws(()=>C.normalizeProject(p),/missing its elements array/);
 const q=C.createProject(1);q.pages[0].elements[0].type='unknown-complex-widget';
 assert.throws(()=>C.normalizeProject(q),/Unsupported native element type/);
});
