'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../assets/core.js');require('../assets/stat_charts.js');require('../assets/core_enhanced.js');require('../assets/effect_catalog.js');
const Q=require('../assets/proposal.js');
function make(){
 const p=C.createProject(3,'policy');
 p.pages[0].elements[0].text='2025 policy: 70%';
 p.pages[0].elements[0].source='Official report 2025';
 p.pages[0].elements[0].asOfDate='2025-12-31';
 p.pages[0].elements[0].unit='%';
 p.pages[0].elements[0].evidence='2025 survey';
 p.pages[0].elements[0].verified=true;
 return p;
}
const analyze=(a,b)=>Q.analyze(a,b);
const first=analysis=>analysis.rows.find(r=>r.originIndex===0);

test('locked original is not edited or unlocked through an approved AI page',()=>{
 const a=make();a.pages[0].elements[0].locked=true;
 const b=C.clone(a);b.pages[0].elements[0].text='AI changed 90%';b.pages[0].elements[0].locked=false;
 const diff=analyze(a,b);const row=first(diff);
 assert.equal(row.review.lockedProtected,1);assert.equal(row.review.items[0].kind,'보호');
 assert.equal(row.changed,false);
 assert.throws(()=>Q.apply(a,diff,[],true),/Select at least/);
 assert.equal(a.pages[0].elements[0].text,'2025 policy: 70%');
 assert.equal(a.pages[0].elements[0].locked,true);
});
test('AI removal of locked block is ignored with its ID, order, and verification preserved',()=>{
 const a=make();a.pages[0].elements[1].locked=true;
 const b=C.clone(a);b.pages[0].elements.splice(1,1);b.pages[0].elements[0].text='Changed ordinary text';
 const row=first(analyze(a,b));assert.equal(row.review.lockedProtected,1);
 const out=Q.apply(a,analyze(a,b),[0],false,{approveNumeric:true}).project;
 assert.deepEqual(out.pages[0].elements.map(x=>x.id),a.pages[0].elements.map(x=>x.id));
 assert.deepEqual(out.pages[0].elements[1],C.normalizeProject(a).pages[0].elements[1]);
});
test('all-locked page deletion is refused in stable-ID mode',()=>{
 const a=make();a.pages[0].elements[0].locked=true;
 const b=C.clone(a);b.pages.splice(0,1);
 const diff=analyze(a,b),row=first(diff);
 assert.equal(row.blockedDeletion,true);
 assert.throws(()=>Q.apply(a,diff,[row.index]),/Locked elements prevent deleting/);
});
test('locked positional last-page deletion is refused, same page ID is not guessed',()=>{
 const a=make(),b=C.clone(a);a.pages[2].elements[0].locked=true;
 b.pages=[b.pages[0],b.pages[1]];
 b.pages.forEach((page,i)=>page.id='renamed-'+i);
 const diff=analyze(a,b);assert.equal(diff.matchingMode,'position');
 assert.throws(()=>Q.apply(a,diff,[2]),/Locked elements prevent deleting/);
});
test('unlocked page deletion still works with direct approval',()=>{
 const a=make(),b=C.clone(a);b.pages.splice(1,1);
 const diff=analyze(a,b),row=diff.rows.find(r=>r.originIndex===1);
 const result=Q.apply(a,diff,[row.index],false,{approveNumeric:true});
 assert.equal(result.project.pages.length,2);
});
test('evidence proposal is separately disclosed, and requires opt-in',()=>{
 const a=make(),b=C.clone(a);b.pages[0].elements[0].source='AI invented reference';
 const d=analyze(a,b);assert.equal(d.rows[0].review.evidenceProposals,1);assert.equal(d.rows[0].changed,true);
 assert.throws(()=>Q.apply(a,d,[0]),/evidence changes need explicit/);
 assert.match(Q.formatReview(d,[0]),/출처·근거 변경 별도 승인/);
});
test('evidence-only approved proposal changes source and clears previous verification',()=>{
 const a=make(),b=C.clone(a);b.pages[0].elements[0].source='New checked official report';
 const out=Q.apply(a,analyze(a,b),[0],false,{allowEvidenceChange:true}).project;
 assert.equal(out.pages[0].elements[0].source,'New checked official report');
 assert.equal(out.pages[0].elements[0].verified,false);
});
test('missing or blank evidence never deletes existing official source even with opt-in',()=>{
 const a=make(),b=C.clone(a);b.pages[0].elements[0].text='Revised introduction';
 ['source','asOfDate','unit','evidence'].forEach(k=>b.pages[0].elements[0][k]='');
 const d=analyze(a,b),out=Q.apply(a,d,[0],false,{allowEvidenceChange:true,approveNumeric:true}).project.pages[0].elements[0];
 assert.equal(d.rows[0].review.evidenceProposals,0);
 assert.equal(out.source,'Official report 2025');assert.equal(out.unit,'%');assert.equal(out.evidence,'2025 survey');
 assert.equal(out.verified,false);
});
test('unit and date proposals require evidence opt-in independently of number changes',()=>{
 const a=make(),b=C.clone(a);b.pages[0].elements[0].unit='basis points';b.pages[0].elements[0].asOfDate='2026-11-04';
 const d=analyze(a,b);
 assert.equal(d.rows[0].review.evidenceProposals,1);
 assert.throws(()=>Q.apply(a,d,[0]),/evidence changes need explicit/);
 const out=Q.apply(a,d,[0],false,{allowEvidenceChange:true}).project.pages[0].elements[0];
 assert.equal(out.unit,'basis points');assert.equal(out.asOfDate,'2026-11-04');
});
test('statistic data unit cannot be overwritten without evidence acknowledgement',()=>{
 const a=make(),blk=C.makeBlock('bar',80,260,{data:{labels:['A','B'],values:[30,70],unit:'percent'},source:'Official CSV'});
 a.pages[0].elements.push(blk);const b=C.clone(a);b.pages[0].elements.at(-1).data.unit='numbers';
 const d=analyze(a,b);assert.equal(d.rows[0].review.evidenceProposals,1);
 assert.throws(()=>Q.apply(a,d,[0]),/evidence changes need explicit/);
});
test('numeric revisions require explicit acceptance and then clear verification',()=>{
 const a=make(),b=C.clone(a);b.pages[0].elements[0].text='2025 policy: 95%';
 const d=analyze(a,b);assert.equal(d.rows[0].review.numericRisks,1);
 assert.throws(()=>Q.apply(a,d,[0]),/Numerical changes/);
 const out=Q.apply(a,d,[0],false,{approveNumeric:true}).project.pages[0].elements[0];
 assert.equal(out.text,'2025 policy: 95%');assert.equal(out.verified,false);
});
test('new numeric claims require acknowledgment even if the previous text had no number',()=>{
 const a=make();a.pages[0].elements[1].text='No quantitative claim';
 const b=C.clone(a);b.pages[0].elements[1].text='One new number 42';
 const d=analyze(a,b);assert.equal(d.rows[0].review.numericRisks,1);
 assert.throws(()=>Q.apply(a,d,[0]),/Numerical changes/);
 assert.equal(Q.apply(a,d,[0],false,{approveNumeric:true}).project.pages[0].elements[1].text,'One new number 42');
});
test('table numeric edits are not approved by ordinary text review',()=>{
 const a=make(),tbl=C.makeBlock('table',100,240,{data:{rows:[['period','value'],['2025','10']]}});
 a.pages[0].elements.push(tbl);
 const b=C.clone(a);b.pages[0].elements.at(-1).data.rows[1][1]='20';
 const d=analyze(a,b);assert.equal(d.rows[0].review.numericRisks,1);
 assert.throws(()=>Q.apply(a,d,[0]),/Numerical changes/);
 assert.equal(Q.apply(a,d,[0],false,{approveNumeric:true}).project.pages[0].elements.at(-1).data.rows[1][1],'20');
});
test('new AI verification claims never elevate verified flag',()=>{
 const a=make();a.pages[0].elements[1].verified=false;const b=C.clone(a);
 b.pages[0].elements[1].text='Changed, checked by AI';b.pages[0].elements[1].verified=true;
 const d=analyze(a,b);assert.ok(d.rows[0].review.items.some(r=>r.flags.some(s=>s.includes('AI 검증'))));
 assert.equal(Q.apply(a,d,[0]).project.pages[0].elements[1].verified,false);
});
test('retained unmodified metadata does not reset verified true',()=>{
 const a=make(),b=C.clone(a);b.pages[0].elements[1].text='Different notes';
 const out=Q.apply(a,analyze(a,b),[0]).project;
 assert.equal(out.pages[0].elements[0].verified,true);
});
test('new AI blocks cannot be marked fact-verified',()=>{
 const a=make(),b=C.clone(a);b.pages[0].elements.push(C.makeBlock('text',10,20,{text:'Unreviewed',verified:true}));
 const d=analyze(a,b),out=Q.apply(a,d,[0]).project;
 assert.equal(out.pages[0].elements.at(-1).verified,false);
});
test('AI page approvals reject unknown/unchanged indices even if a setting was approved',()=>{
 const a=make(),b=C.clone(a);b.title='New title';b.pages[0].elements[1].text='Changed';
 const d=analyze(a,b);
 assert.throws(()=>Q.apply(a,d,[99],true,{settingSelection:['title']}),/unknown or unchanged/);
 assert.throws(()=>Q.apply(a,d,[1],true,{settingSelection:['title']}),/unknown or unchanged/);
 assert.throws(()=>Q.apply(a,d,['not-an-index'],true,{settingSelection:['title']}),/unknown or unchanged/);
 assert.equal(Q.apply(a,d,[0],true,{settingSelection:['title']}).project.title,'New title');
});
test('page transition-only proposals appear in the review and require page approval',()=>{
 const a=make(),b=C.clone(a);
 b.pages[0].transition='slide';
 const d=analyze(a,b);
 assert.equal(d.rows[0].changed,true);
 assert.ok(d.rows[0].metadataDiff.some(x=>x.field==='transition'&&x.after==='slide'));
 assert.equal(d.rows[0].review.numericRisks,0);
 assert.equal(Q.apply(a,d,[0]).project.pages[0].transition,'slide');
 assert.match(Q.formatReview(d,[0]),/Page transition: fade -> slide/);
});
test('page headline numeric revisions require independent factual review',()=>{
 const a=make(),b=C.clone(a);
 a.pages[0].headline='2025 target 70%';b.pages[0].headline='2025 target 90%';
 const d=analyze(a,b);
 assert.equal(d.rows[0].review.metadataNumericRisk,true);
 assert.throws(()=>Q.apply(a,d,[0]),/Numerical changes/);
 assert.equal(Q.apply(a,d,[0],false,{approveNumeric:true}).project.pages[0].headline,'2025 target 90%');
});
test('document title numeric change cannot bypass the report-wide numeric acknowledgment',()=>{
 const a=make(),b=C.clone(a);
 b.title='Goal 2027: 97%';
 const d=analyze(a,b);
 assert.equal(d.settingsReview.find(x=>x.key==='title').numericRisk,true);
 assert.throws(()=>Q.apply(a,d,[],true,{settingSelection:['title']}),/Numerical changes need explicit/);
 assert.equal(Q.apply(a,d,[],true,{settingSelection:['title'],approveNumeric:true}).project.title,b.title);
});
test('master footer changes that insert or remove numeric claims require acknowledgment',()=>{
 const a=make(),b=C.clone(a);
 a.master.footer='Prepared for the team';b.master.footer='Achieved 98% in 2026';
 const d=analyze(a,b);
 assert.equal(d.settingsReview.find(x=>x.key==='master').numericRisk,true);
 assert.throws(()=>Q.apply(a,d,[],true,{settingSelection:['master']}),/Numerical changes need explicit/);
 assert.equal(Q.apply(a,d,[],true,{settingSelection:['master'],approveNumeric:true}).project.master.footer,'Achieved 98% in 2026');
});
test('non-numeric theme changes remain independently approvable without numeric consent',()=>{
 const a=make(),b=C.clone(a);b.theme='mint';
 const d=analyze(a,b);
 assert.equal(d.settingsReview.find(x=>x.key==='theme').numericRisk,false);
 assert.equal(Q.apply(a,d,[],true,{settingSelection:['theme']}).project.theme,'mint');
});
test('AI rich text must describe the exact displayed text, not substitute undisclosed numbers',()=>{
 const a=make(),b=C.clone(a);
 b.pages[0].elements[1].text='Total 10%';
 b.pages[0].elements[1].richText=[{text:'Total 90%',bold:true}];
 assert.throws(()=>Q.analyze(a,b),/text and rich-text runs with different content/);
 b.pages[0].elements[1].richText[0].text='Total 10%';
 const d=Q.analyze(a,b);
 assert.ok(d.rows[0].review.numericRisks>0);
 assert.throws(()=>Q.apply(a,d,[0]),/Numerical changes/);
});
test('AI candidate cannot be silently modified after its exact review snapshot',()=>{
 const a=make(),b=C.clone(a);
 b.pages[0].elements[1].text='Reviewed change';
 const d=Q.analyze(a,b);
 d.candidate.pages[0].elements[1].text='Unreviewed 999%';
 assert.throws(()=>Q.apply(a,d,[0],false,{approveNumeric:true}),/AI proposal changed after analysis/);
});
test('AI cannot create locked hidden layers or conceal existing unlocked text',()=>{
 const a=make(),b=C.clone(a),existing=a.pages[0].elements[1];
 b.pages[0].elements[1].locked=true;b.pages[0].elements[1].hidden=true;
 b.pages[0].elements[1].text='Proposed visible text';
 const added=C.makeBlock('text',10,10,{text:'AI inserted',locked:true,hidden:true});
 b.pages[0].elements.push(added);
 const d=analyze(a,b);
 assert.equal(d.rows[0].review.lockOverrides,2);
 const out=Q.apply(a,d,[0]).project.pages[0].elements;
 const retained=out.find(e=>e.id===existing.id),inserted=out.find(e=>e.id===added.id);
 assert.equal(retained.text,'Proposed visible text');
 assert.equal(retained.locked,false);assert.equal(retained.hidden,false);
 assert.equal(inserted.locked,false);assert.equal(inserted.hidden,false);
});
test('unselected changes never touch other pages or shared settings',()=>{
 const a=make(),b=C.clone(a);b.pages[0].elements[1].text='Selected edit';b.pages[2].elements[1].text='Unselected';b.title='AI changes title';
 const d=analyze(a,b),out=Q.apply(a,d,[0]).project;
 assert.equal(out.title,a.title);assert.equal(out.pages[2].elements[1].text,a.pages[2].elements[1].text);
});
test('review never mutates incoming or current, and has bounded excerpt lengths',()=>{
 const a=make(),b=C.clone(a);b.pages[0].elements[1].text='Y'.repeat(5000);
 const old=JSON.stringify(a),next=JSON.stringify(b),d=analyze(a,b);
 assert.equal(JSON.stringify(a),old);assert.equal(JSON.stringify(b),next);
 assert.ok(d.rows[0].review.items.every(r=>r.before.length<=140&&r.after.length<=140));
});
test('review counts errors and formats diff text without full raw HTML payload',()=>{
 const a=make(),b=C.clone(a);b.pages[0].elements[0].source='Changed source';b.pages[0].elements[0].text='2025 policy: 80%';
 const d=analyze(a,b),txt=Q.formatReview(d,[0]);
 assert.match(txt,/Selected pages are proposals only/);
 assert.match(txt,/Numbers:/);
 assert.match(txt,/Before:/);
 assert.match(txt,/출처·근거 변경 별도 승인/);
 assert.ok(!txt.includes('"schema":3'));
});
test('unselected review export marks the page as not selected',()=>{
 const a=make(),b=C.clone(a);b.pages[0].elements[1].text='Edited';
 const d=analyze(a,b);assert.match(Q.formatReview(d),/not selected/);
});
test('ambiguous IDs still need separate explicit approvals',()=>{
 const a=make(),b=C.clone(a);b.pages[0].id='AI-replaced-id';
 const d=analyze(a,b);assert.ok(d.ambiguousIds>=1);
 assert.equal(d.rows.some(r=>r.kind==='삭제'),true);
 assert.equal(d.rows.some(r=>r.kind==='추가'),true);
});
test('page with locked and editable elements retains locked when AI reorders list',()=>{
 const a=make();a.pages[0].elements[0].locked=true;
 const b=C.clone(a);b.pages[0].elements.reverse();b.pages[0].elements[0].text='Edited unlocked';
 const d=analyze(a,b),out=Q.apply(a,d,[0],false,{approveNumeric:true}).project;
 assert.ok(out.pages[0].elements.some(e=>e.id===a.pages[0].elements[0].id&&e.text===a.pages[0].elements[0].text));
});

test('selecting just one text element leaves other changes on the same page untouched',()=>{
 const a=make(),b=C.clone(a),left=a.pages[0].elements[0].id,right=a.pages[0].elements[1].id;
 b.pages[0].elements[0].text='2025 policy: 80%';b.pages[0].elements[1].text='Ignored alternate';
 const d=analyze(a,b),result=Q.apply(a,d,[],false,{elementSelection:{0:[left]},approveNumeric:true}).project;
 assert.equal(result.pages[0].elements[0].text,'2025 policy: 80%');
 assert.equal(result.pages[0].elements[1].text,a.pages[0].elements[1].text);
 assert.equal(result.pages[0].id,a.pages[0].id);
 assert.equal(result.pages[0].tab,a.pages[0].tab);
 assert.ok(!result.pages[0].elements.find(x=>x.id===right).locked);
});
test('selecting a new element inserts it while skipping unselected new content',()=>{
 const a=make(),b=C.clone(a);
 const first=C.makeBlock('text',40,40,{text:'Approve insertion'}),other=C.makeBlock('text',40,90,{text:'Do not insert'});
 b.pages[0].elements.splice(1,0,first,other);
 const d=analyze(a,b),result=Q.apply(a,d,[],false,{elementSelection:{0:[first.id]}}).project;
 assert.equal(result.pages[0].elements.length,a.pages[0].elements.length+1);
 assert.equal(result.pages[0].elements[1].id,first.id);
 assert.ok(!result.pages[0].elements.some(x=>x.id===other.id));
 assert.equal(result.pages[0].elements[1].verified,false);
});
test('individual deletion removes only the selected unlocked element',()=>{
 const a=make(),b=C.clone(a),gone=b.pages[0].elements[1].id;
 b.pages[0].elements.splice(1,1);b.pages[0].elements[0].text='Unapproved change 11%';
 const d=analyze(a,b),out=Q.apply(a,d,[],false,{elementSelection:{0:[gone]}}).project;
 assert.equal(out.pages[0].elements.some(x=>x.id===gone),false);
 assert.equal(out.pages[0].elements[0].text,a.pages[0].elements[0].text);
});
test('individual locked deletion and replacement cannot be approved',()=>{
 const a=make();a.pages[0].elements[1].locked=true;
 const b=C.clone(a),id=b.pages[0].elements[1].id;b.pages[0].elements.splice(1,1);
 const d=analyze(a,b);
 assert.throws(()=>Q.apply(a,d,[],false,{elementSelection:{0:[id]}}),/unchanged, locked/);
});
test('individual approval rejects an element ID that was not in the diff',()=>{
 const a=make(),b=C.clone(a);b.pages[0].elements[1].text='Changed';
 const d=analyze(a,b);
 assert.throws(()=>Q.apply(a,d,[],false,{elementSelection:{0:[a.pages[0].elements[0].id]}}),/outside the reviewed diff/);
 assert.throws(()=>Q.apply(a,d,[],false,{elementSelection:{0:['missing']}}),/outside the reviewed diff/);
});
test('a proposed numeric edit on an unselected neighbor does not block selected safe text',()=>{
 const a=make(),b=C.clone(a);const id=b.pages[0].elements[1].id;
 b.pages[0].elements[0].text='2025 policy: 80%';b.pages[0].elements[1].text='Safe summary update';
 const d=analyze(a,b);assert.equal(d.rows[0].review.numericRisks,1);
 const out=Q.apply(a,d,[],false,{elementSelection:{0:[id]}}).project;
 assert.equal(out.pages[0].elements[0].text,'2025 policy: 70%');
 assert.equal(out.pages[0].elements[1].text,'Safe summary update');
});
test('numeric edit in the selected element requires numeric consent even in partial mode',()=>{
 const a=make(),b=C.clone(a),id=b.pages[0].elements[0].id;
 b.pages[0].elements[0].text='2025 policy: 85%';
 const d=analyze(a,b);
 assert.throws(()=>Q.apply(a,d,[],false,{elementSelection:{0:[id]}}),/Numerical changes/);
 const out=Q.apply(a,d,[],false,{elementSelection:{0:[id]},approveNumeric:true}).project;
 assert.equal(out.pages[0].elements[0].text,'2025 policy: 85%');
});
test('evidence-only individual edit requires separate explicit approval',()=>{
 const a=make(),b=C.clone(a),id=b.pages[0].elements[0].id;
 b.pages[0].elements[0].source='Other verified source';
 const d=analyze(a,b);
 assert.throws(()=>Q.apply(a,d,[],false,{elementSelection:{0:[id]}}),/evidence changes/);
 const out=Q.apply(a,d,[],false,{elementSelection:{0:[id]},allowEvidenceChange:true}).project;
 assert.equal(out.pages[0].elements[0].source,'Other verified source');
 assert.equal(out.pages[0].elements[0].verified,false);
});
test('unreviewed page settings are not inherited by an element-only approval',()=>{
 const a=make(),b=C.clone(a),id=b.pages[0].elements[1].id;
 b.pages[0].tab='AI supplied new headline';b.pages[0].background='#ff0000';
 b.pages[0].elements[1].text='Updated element';
 const d=analyze(a,b),out=Q.apply(a,d,[],false,{elementSelection:{0:[id]}}).project;
 assert.equal(out.pages[0].tab,a.pages[0].tab);
 assert.equal(out.pages[0].background,a.pages[0].background);
 assert.equal(out.pages[0].elements[1].text,'Updated element');
});
test('mixed whole-page and element-only approvals on distinct pages are atomic',()=>{
 const a=make(),b=C.clone(a),id=b.pages[1].elements[1].id;
 b.pages[0].elements[1].text='Whole page';b.pages[1].elements[1].text='Chosen element';b.pages[1].elements[0].text='Unchosen element';
 const d=analyze(a,b),out=Q.apply(a,d,[0],false,{elementSelection:{1:[id]}}).project;
 assert.equal(out.pages[0].elements[1].text,'Whole page');
 assert.equal(out.pages[1].elements[1].text,'Chosen element');
 assert.equal(out.pages[1].elements[0].text,a.pages[1].elements[0].text);
});
test('page-level and element-level double approvals cannot conflict',()=>{
 const a=make(),b=C.clone(a);b.pages[0].elements[1].text='Change';
 const d=analyze(a,b),id=b.pages[0].elements[1].id;
 assert.throws(()=>Q.apply(a,d,[0],false,{elementSelection:{0:[id]}}),/existing matched page only/);
});
test('a partial element requires matching old and new page IDs with a validated index',()=>{
 const a=make(),b=C.clone(a);b.pages[0].id='New AI page id';
 const d=analyze(a,b),id=a.pages[0].elements[0].id;
 assert.throws(()=>Q.apply(a,d,[],false,{elementSelection:{0:[id]}}),/existing matched page only/);
});
test('new numerical blocks require opt-in even if source is not yet verified',()=>{
 const a=make(),b=C.clone(a),newEl=C.makeBlock('kpi',40,100,{text:'999'});
 b.pages[0].elements.push(newEl);const d=analyze(a,b),id=newEl.id;
 assert.equal(d.rows[0].review.numericRisks,1);
 assert.throws(()=>Q.apply(a,d,[],false,{elementSelection:{0:[id]}}),/Numerical changes/);
 const out=Q.apply(a,d,[],false,{elementSelection:{0:[id]},approveNumeric:true}).project;
 assert.equal(out.pages[0].elements.at(-1).verified,false);
});
test('deleting a numeric block requires opt-in even for partial approval',()=>{
 const a=make(),b=C.clone(a),id=b.pages[0].elements[0].id;
 b.pages[0].elements.shift();const d=analyze(a,b);
 assert.ok(d.rows[0].review.numericRisks>0);
 assert.throws(()=>Q.apply(a,d,[],false,{elementSelection:{0:[id]}}),/Numerical changes/);
});
test('review log records individual element selections without embedding whole source',()=>{
 const a=make(),b=C.clone(a),id=b.pages[0].elements[1].id;
 b.pages[0].elements[1].text='Changed';const d=analyze(a,b);
 const report=Q.formatReview(d,[],{0:[id]});
 assert.match(report,/Selected element IDs:/);
 assert.match(report,new RegExp(id));
 assert.ok(report.length<20000);
});

test('reordering a locked layer in an AI page never changes its original z-order index',()=>{
 const a=make();a.pages[0].elements[0].locked=true;
 const b=C.clone(a),original=a.pages[0].elements[0].id;
 b.pages[0].elements.push(b.pages[0].elements.shift());
 b.pages[0].elements[0].text='Different unlocked text';
 const d=analyze(a,b);assert.ok(d.rows[0].review.lockedProtected>=1);
 const out=Q.apply(a,d,[0]).project;
 assert.equal(out.pages[0].elements[0].id,original);
 assert.equal(out.pages[0].elements[0].locked,true);
});

test('direct proposal API refuses stale original even if caller holds an older analysis',()=>{
 const a=make(),b=C.clone(a);b.pages[0].elements[1].text='AI suggestion';
 const diff=analyze(a,b);a.pages[0].elements[1].text='Human edited before review';
 assert.throws(()=>Q.apply(a,diff,[0]),/Document changed after AI analysis/);
});
test('AI only claims verified on an unchanged element: no approval is offered, claim still visible',()=>{
 const a=make();a.pages[0].elements[1].verified=false;
 const b=C.clone(a);b.pages[0].elements[1].verified=true;
 const diff=analyze(a,b),item=diff.rows[0].review.items.find(e=>e.id===a.pages[0].elements[1].id);
 assert.ok(item.flags.some(x=>x.includes('검증 주장')));
 assert.equal(diff.rows[0].changed,false);
});

test('newly added sources need explicit evidence acknowledgment in granular and whole-page approvals',()=>{
 const a=make(),b=C.clone(a),added=C.makeBlock('text',110,120,{text:'Source claim',source:'Unverified AI citation',verified:true});
 b.pages[0].elements.push(added);
 const d=analyze(a,b),row=d.rows[0],item=row.review.items.find(x=>x.id===added.id);
 assert.equal(item.provenanceFields.includes('source'),true);
 assert.equal(row.review.evidenceProposals,1);
 assert.throws(()=>Q.apply(a,d,[0]),/evidence changes/);
 assert.throws(()=>Q.apply(a,d,[],false,{elementSelection:{0:[added.id]}}),/evidence changes/);
 const out=Q.apply(a,d,[],false,{elementSelection:{0:[added.id]},allowEvidenceChange:true}).project;
 assert.equal(out.pages[0].elements.find(x=>x.id===added.id).source,'Unverified AI citation');
 assert.equal(out.pages[0].elements.find(x=>x.id===added.id).verified,false);
});
test('new numeric claim and newly generated citation require separate dual approvals',()=>{
 const a=make(),b=C.clone(a),added=C.makeBlock('kpi',110,120,{text:'Growth 75%',source:'AI source'});
 b.pages[0].elements.push(added);
 const d=analyze(a,b);
 assert.throws(()=>Q.apply(a,d,[0]),/Numerical changes/);
 assert.throws(()=>Q.apply(a,d,[0],false,{approveNumeric:true}),/evidence changes/);
 assert.throws(()=>Q.apply(a,d,[0],false,{allowEvidenceChange:true}),/Numerical changes/);
 assert.ok(Q.apply(a,d,[0],false,{approveNumeric:true,allowEvidenceChange:true}).project.pages[0].elements.some(e=>e.id===added.id));
});

test('shared settings can be reviewed and approved individually',()=>{
 const a=make(),b=C.clone(a);b.title='Proposed title';b.theme='ambient';b.master.footer='AI footer';
 const d=analyze(a,b);
 assert.deepEqual(d.settings,['title','theme','master']);
 assert.ok(d.settingsReview.some(x=>x.key==='master'&&x.after.includes('AI footer')));
 const out=Q.apply(a,d,[],true,{settingSelection:['title']});
 assert.equal(out.project.title,'Proposed title');assert.equal(out.project.theme,a.theme);
 assert.equal(out.project.master.footer,a.master.footer);
 assert.deepEqual(out.settingsApplied,['title']);
 assert.match(Q.formatReview(d,[],{},['title']),/Setting title \[selected\]/);
 assert.match(Q.formatReview(d,[],{},['title']),/Setting theme \[not selected\]/);
});
test('setting selector rejects unknown fields and never copies an unselected master logo',()=>{
 const a=make(),b=C.clone(a);b.master.logo='data:image/png;base64,'+'a'.repeat(900);b.title='Safe change';
 const d=analyze(a,b);assert.ok(d.settingsReview.find(x=>x.key==='master').after.includes('embedded image'));
 assert.ok(!JSON.stringify(d.settingsReview).includes('a'.repeat(50)));
 assert.throws(()=>Q.apply(a,d,[],true,{settingSelection:['auth']}),/Unknown or unchanged/);
 assert.throws(()=>Q.apply(a,d,[],false,{settingSelection:['title']}),/requires explicit/);
 const out=Q.apply(a,d,[],true,{settingSelection:['title']}).project;
 assert.equal(out.title,'Safe change');assert.equal(out.master.logo,a.master.logo);
});
