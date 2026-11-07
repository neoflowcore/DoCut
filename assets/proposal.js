(function(root){
'use strict';
// AI proposals are untrusted offline data: never execute them or accept verification claims.
const C=root.DocutCore;
if(!C)throw Error('DoCut core required for proposals');
const provenance=['source','asOfDate','unit','evidence','notes'];
const clone=value=>C.clone(value);
const withoutVerification=block=>{const x=clone(block);delete x.verified;return JSON.stringify(x);};
const contentChanged=(a,b)=>withoutVerification(a)!==withoutVerification(b);
function parsePayload(raw){
 let input=String(raw||'').replace(/^\ufeff/,'').trim(),format='JSON',ignoredText=false;
 if(!input)throw Error('AI proposal is empty');
 if(input.length>8000000)throw Error('AI proposal exceeds 8MB');
 if(input.includes('```')){
  const matches=[...input.matchAll(/```(?:json)?[ \t]*\r?\n([\s\S]*?)\r?\n```/gi)];
  if(matches.length!==1||input.replace(matches[0][0],'').includes('```'))throw Error('Use exactly one fenced JSON block; JavaScript and mixed code are not accepted');
  ignoredText=!!input.replace(matches[0][0],'').trim();input=matches[0][1].trim();format='Markdown JSON';
 }
 let value;try{value=JSON.parse(input)}catch(e){throw Error('The AI response is not valid JSON: '+e.message)}
 if(value&&typeof value==='object'&&!Array.isArray(value)&&!Array.isArray(value.pages)){
  const key=['project','docutProject','document'].find(k=>value[k]&&Array.isArray(value[k].pages));
  if(key){value=value[key];format+=' ('+key+' wrapper)';}
 }
 if(!value||!Array.isArray(value.pages))throw Error('AI JSON must contain a DoCut pages array or a project wrapper');
 return {project:value,format,ignoredText};
}
// A generated proposal may suggest content, but it cannot unlock, remove or
// silently rewrite a locked original block. Evidence changes need a separate opt-in.
function evidenceChange(before,proposed){
 if(!proposed)return [];
 const fields=provenance.filter(k=>String(proposed[k]||'').trim()&&(!before||JSON.stringify(proposed[k])!==JSON.stringify(before[k]||'')));
 if(proposed.data&&String(proposed.data.unit||'').trim()&&(!before||!before.data||JSON.stringify(proposed.data.unit)!==JSON.stringify(before.data.unit||'')))fields.push('data.unit');
 return fields;
}
function preparedPage(previous,proposed,options={}){
 const next=clone(proposed),prior=previous?.elements||[],original=new Map(prior.map(e=>[e.id,e]));
 next.elements=next.elements.map(block=>{
  const before=original.get(block.id);
  if(!before){block.verified=false;block.locked=false;block.hidden=false;return block;}
  if(before.locked)return clone(before);
  // Locking or hiding a layer requires an explicit action in the local editor.
  // An AI-generated proposal is not a substitute for those user controls.
  block.locked=false;block.hidden=before.hidden===true;
  for(const field of provenance){
   if(!options.allowEvidenceChange||!String(block[field]||'').trim())block[field]=before[field]||'';
  }
  if(before.data&&block.data&&Object.hasOwn(before.data,'unit')&&(!options.allowEvidenceChange||!String(block.data.unit||'').trim()))block.data.unit=before.data.unit;
  block.verified=contentChanged(before,block)?false:before.verified===true;
  return block;
 });
 // Locked originals keep their exact element payload and original z-order slot;
 // a proposal cannot move a locked block behind a different layer either.
 const lockedAt=prior.map((e,i)=>({e,i})).filter(x=>x.e.locked);
 if(lockedAt.length){
  const ids=new Set(lockedAt.map(x=>x.e.id));
  next.elements=next.elements.filter(e=>!ids.has(e.id));
  for(const {e,i} of lockedAt)next.elements.splice(Math.min(i,next.elements.length),0,clone(e));
 }
 if(previous)next.id=previous.id;
 return next;
}
function short(value,max=140){const s=String(value??'').replace(/\s+/g,' ').trim();return s.length>max?s.slice(0,max-1)+'…':s;}
function reviewElements(before,after,rawProposal){
 const original=new Map((before?.elements||[]).map(e=>[e.id,e]));
 const proposed=new Map((rawProposal?.elements||[]).map(e=>[e.id,e]));
 const final=new Map((after?.elements||[]).map(e=>[e.id,e]));
 const ids=[...new Set([...original.keys(),...proposed.keys(),...final.keys()])];
 const items=[];let lockedProtected=0,lockOverrides=0,evidenceProposals=0,numericRisks=0;
 for(const id of ids){
  const old=original.get(id),suggested=proposed.get(id),next=final.get(id);
  const locked=!!old?.locked && (!suggested||JSON.stringify(old)!==JSON.stringify(suggested)||((before?.elements||[]).findIndex(x=>x.id===id)!==(rawProposal?.elements||[]).findIndex(x=>x.id===id)));
  if(locked)lockedProtected++;
  const override=!!suggested&&(!!suggested.locked!==!!old?.locked||!!suggested.hidden!==!!old?.hidden);
  if(override)lockOverrides++;
  const provenanceFields=old?.locked?[]:evidenceChange(old,suggested);
  if(provenanceFields.length)evidenceProposals++;
  const oldNumbers=numericTerms(old),newNumbers=numericTerms(next);
  const numerical=JSON.stringify(oldNumbers)!==JSON.stringify(newNumbers);
  // Adding a quantitative claim is as significant as changing or deleting one.
  const numericRisk=numerical;
  if(numericRisk)numericRisks++;
  const changed=(!old&&!!next)||(!!old&&!next)||(!!old&&!!next&&contentChanged(old,next));
  if(!changed&&!locked&&!override&&!provenanceFields.length&&!(suggested?.verified===true&&old?.verified!==true))continue;
  const fields=[];
  if(old&&next){
   if(old.type!==next.type)fields.push('요소 유형');
   if(old.text!==next.text)fields.push('본문');
   if(JSON.stringify(old.data)!==JSON.stringify(next.data))fields.push('원자료');
   if(JSON.stringify(old.style)!==JSON.stringify(next.style))fields.push('서식');
   if(['x','y','w','h'].some(k=>old[k]!==next[k]))fields.push('위치·크기');
   if(JSON.stringify(old.effects)!==JSON.stringify(next.effects))fields.push('모션');
   if(provenance.some(k=>JSON.stringify(old[k])!==JSON.stringify(next[k])))fields.push('출처·근거');
  }
  const evidenceDiff=provenanceFields.map(field=>({
   field,before:short(field==='data.unit'?old?.data?.unit:old?.[field],110),after:short(field==='data.unit'?suggested?.data?.unit:suggested?.[field],110)
  }));
  const previewNumbers=values=>values.slice(0,24).join(', ')+(values.length>24?` … 외 ${values.length-24}개`:values.length?'':'없음');
  const flags=[locked?'잠금 보호 · 변경 무시':null,override?'잠금·표시 상태 변경 제안 무시':null,provenanceFields.length?'출처·근거 변경 별도 승인':null,numericRisk?'수치 변경 재확인':null,suggested?.verified===true&&old?.verified!==true?'AI 검증 주장 무시':null].filter(Boolean);
  items.push({id,evidenceDiff,kind:!old?'추가':!next?'삭제':locked?'보호':'수정',type:(next||old)?.type||'text',label:short((next||old)?.text||id,55),before:short(old?.text),after:short(next?.text),fields,flags,locked,provenanceFields,numericRisk,changed,numericBefore:previewNumbers(oldNumbers),numericAfter:previewNumbers(newNumbers)});
 }
 return {items,lockedProtected,lockOverrides,evidenceProposals,numericRisks};
}
function numericTerms(block){
 if(!block)return [];
 const stored=String(block.text||'');
 const display=Array.isArray(block.richText)&&block.richText.length?block.richText.map(r=>String(r?.text||'')).join(''):stored;
 // The HTML renderer uses rich text runs, while plain text export uses `text`.
 // Compare both when they diverge so proposed numbers cannot hide in formatting.
 const parts=display===stored?[stored]:[stored,display];
 if(['bar','line','donut'].includes(block.type))parts.push(...(block.data?.values||[]),...(block.data?.labels||[]));
 if(block.type==='table')parts.push(...(block.data?.rows||[]).flat());
 if(block.type==='stat'){parts.push(...(block.data?.rows||[]).flat());for(const key of ['lower','center','upper'])if(block.data?.limits?.[key]!=null)parts.push(block.data.limits[key]);if(block.data?.referenceValue!=null)parts.push(block.data.referenceValue);}
 return parts.map(x=>String(x)).join(' ').match(/-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?%?/g)||[];
}
function describeNumericChanges(before,after){
 const old=new Map((before?.elements||[]).map(e=>[e.id,e])),seen=new Set(),out=[];
 for(const element of after?.elements||[]){
  seen.add(element.id);const previous=old.get(element.id),a=numericTerms(previous),b=numericTerms(element);
  if(JSON.stringify(a)!==JSON.stringify(b))out.push({id:element.id,old:a.slice(0,8).join(', ')||'없음',next:b.slice(0,8).join(', ')||'없음'});
 }
 for(const element of before?.elements||[])if(!seen.has(element.id)){
  const numbers=numericTerms(element);if(numbers.length)out.push({id:element.id,old:numbers.slice(0,8).join(', '),next:'삭제'});
 }
 return out;
}
function labelOf(page,index){return page?.tab||('페이지 '+(index+1));}
function pageChanges(before,after,rawProposal){
 const claims=(rawProposal?.elements||[]).filter(e=>e.verified===true&&!(before?.elements||[]).find(o=>o.id===e.id)?.verified).length;
 const numeric=describeNumericChanges(before,after),numericChanged=numeric.length,numericExamples=numeric.slice(0,3).map(x=>x.old+' → '+x.next);
 if(!before&&after)return {inserted:after.elements.length,removed:0,updated:0,retained:0,verificationClaims:claims,numericChanged,numericExamples};
 if(before&&!after)return {inserted:0,removed:before.elements.length,updated:0,retained:0,verificationClaims:0,numericChanged,numericExamples};
 const a=new Map(before.elements.map(x=>[x.id,x])),b=new Map(after.elements.map(x=>[x.id,x]));
 let updated=0,retained=0;
 for(const e of after.elements){const prior=a.get(e.id);if(!prior)continue;if(contentChanged(prior,e))updated++;else retained++;}
 return {inserted:[...b.keys()].filter(k=>!a.has(k)).length,removed:[...a.keys()].filter(k=>!b.has(k)).length,updated,retained,verificationClaims:claims,numericChanged,numericExamples};
}
function rowOf(index,prior,proposed,originIndex,proposalIndex,positional){
 const converted=proposed?preparedPage(prior,proposed):null,stats=pageChanges(prior,converted,proposed),review=reviewElements(prior,converted,proposed);
 const identityMismatch=!!(prior&&proposed&&prior.id!==proposed.id);
 const mode=!prior?'추가':!proposed?'삭제':identityMismatch?'페이지 ID 변경':'수정';
 const metadataKeys=['tab','headline','subtitle','background','layout','customTab','transition'];
 const metadataDiff=metadataKeys.filter(key=>JSON.stringify(prior?.[key]??'')!==JSON.stringify(converted?.[key]??''))
  .map(key=>({field:key,before:short(prior?.[key],160),after:short(converted?.[key],160)}));
 const pageMetadataChanged=metadataDiff.length>0;
 // Headline and subtitle can contain numerical claims even when not represented
 // by a canvas element. Page-level approvals must review those changes too.
 const narrative=pg=>numericTerms({text:['tab','headline','subtitle'].map(key=>String(pg?.[key]??'')).join('\n')});
 const metadataNumericRisk=JSON.stringify(narrative(prior))!==JSON.stringify(narrative(converted));
 if(metadataNumericRisk)review.numericRisks++;
 review.metadataNumericRisk=metadataNumericRisk;
 const orderChanged=!!(prior&&converted&&prior.elements.map(e=>e.id).join('|')!==converted.elements.map(e=>e.id).join('|'));
 const changed=!prior||!proposed||pageMetadataChanged||orderChanged||stats.inserted>0||stats.removed>0||stats.updated>0||identityMismatch||review.evidenceProposals>0;
 const details=[mode,stats.inserted?`새 요소 ${stats.inserted}`:null,stats.removed?`삭제 요소 ${stats.removed}`:null,stats.updated?`수정 요소 ${stats.updated}`:null,stats.numericChanged?`수치 변경 요소 ${stats.numericChanged}`:null,metadataNumericRisk?'페이지 제목·요약 수치 확인':null,pageMetadataChanged?'제목/페이지 설정 변경':null,orderChanged?'레이어 순서 변경':null,review.lockedProtected?`잠금 요소 ${review.lockedProtected}개 보호`:null,review.lockOverrides?`잠금·표시 제안 ${review.lockOverrides}개 무시`:null,review.evidenceProposals?`출처 변경 제안 ${review.evidenceProposals}개`:null,stats.verificationClaims?`AI 검증 주장 ${stats.verificationClaims}건 무시`:null].filter(Boolean);
 return {index,originIndex,proposalIndex,oldLabel:labelOf(prior,index),newLabel:labelOf(proposed,index),kind:mode,changed,details,metadataDiff,stats,idMismatch:identityMismatch,positional,review,blockedDeletion:!!prior&&!proposed&&prior.elements.some(e=>e.locked)};
}
function describeSetting(value,key){
 if(key==='master'){
  const master=value||{};
  const logo=String(master.logo||'');
  return 'footer: '+short(master.footer,75)+'; page numbers: '+(master.pageNumbers!==false?'on':'off')+'; logo: '+(logo?'embedded image ('+logo.length+' chars)':'none');
 }
 return short(value,160);
}
function settingHasNumericChange(before,after,key){
 // Project titles and master footers are displayed as report claims. They
 // must not bypass the numeric opt-in just because they are not canvas blocks.
 if(!['title','master'].includes(key))return false;
 const text=value=>key==='master'?String(value?.footer||''):String(value||'');
 return JSON.stringify(numericTerms({text:text(before)}))!==JSON.stringify(numericTerms({text:text(after)}));
}
function analyze(current,proposal){
 const before=C.normalizeProject(current),incoming=C.normalizeProject(proposal);
 for(const [pageIndex,page] of incoming.pages.entries())for(const block of page.elements){
  if(block.richText?.length&&block.richText.map(run=>run.text).join('')!==block.text){
   throw Error('AI proposal page '+(pageIndex+1)+' has text and rich-text runs with different content; fix before review');
  }
 }
 const incomingById=new Map(incoming.pages.map((pg,i)=>[pg.id,i]));
 const oldIds=new Set(before.pages.map(pg=>pg.id));
 const commonIds=before.pages.filter(pg=>incomingById.has(pg.id)).length;
 const positional=commonIds===0;
 const rows=[];
 if(positional){for(let i=0;i<Math.max(before.pages.length,incoming.pages.length);i++)rows.push(rowOf(i,before.pages[i]||null,incoming.pages[i]||null,i<before.pages.length?i:null,i<incoming.pages.length?i:null,true));}
 else{
  for(let i=0;i<before.pages.length;i++){const pg=before.pages[i],ni=incomingById.get(pg.id);rows.push(rowOf(rows.length,pg,ni===undefined?null:incoming.pages[ni],i,ni===undefined?null:ni,false));}
  for(let i=0;i<incoming.pages.length;i++){const pg=incoming.pages[i];if(!oldIds.has(pg.id))rows.push(rowOf(rows.length,null,pg,null,i,false));}
 }
 const settings=['title','theme','storyType','master'].filter(key=>JSON.stringify(before[key])!==JSON.stringify(incoming[key]));
 const settingsReview=settings.map(key=>({key,before:describeSetting(before[key],key),after:describeSetting(incoming[key],key),numericRisk:settingHasNumericChange(before[key],incoming[key],key)}));
 const reordered=positional?0:rows.filter(r=>r.originIndex!=null&&r.proposalIndex!=null&&r.originIndex!==r.proposalIndex).length;
 // With some stable IDs in common, a missing original ID and a newly supplied ID
 // may be a rename, a deletion+insertion, or both. Never infer a replacement.
 // Flag the ambiguity and require separate explicit checkboxes for both operations.
 const removed=rows.filter(r=>r.originIndex!=null&&r.proposalIndex==null).length;
 const added=rows.filter(r=>r.originIndex==null&&r.proposalIndex!=null).length;
 const ambiguousIds=positional?0:Math.min(removed,added);
 return {originalSignature:JSON.stringify(current),candidateSignature:JSON.stringify(incoming),candidate:incoming,rows,settings,settingsReview,matchingMode:positional?'position':'stable-id',changedPages:rows.filter(r=>r.changed).length,identityWarnings:rows.filter(r=>r.idMismatch).length+ambiguousIds,reorderWarnings:reordered,ambiguousIds};
}
function applyElements(prior,proposed,ids,options={}){
 if(!prior||!proposed)throw Error('An element-only approval needs an existing matched page');
 const selected=new Set(ids);
 if(!selected.size)return clone(prior);
 const from=new Map(prior.elements.map(e=>[e.id,e]));
 const desired=new Map(proposed.elements.map(e=>[e.id,e]));
 for(const id of selected){
  if(!from.has(id)&&!desired.has(id))throw Error('Selected AI element is no longer in the reviewed proposal');
  if(from.get(id)?.locked)throw Error('Locked source element cannot be replaced or deleted by AI');
 }
 const prepared=preparedPage(prior,proposed,options);
 const target=new Map(prepared.elements.map(e=>[e.id,e]));
 const next=clone(prior);
 next.elements=next.elements.filter(e=>!selected.has(e.id)||target.has(e.id)).map(e=>selected.has(e.id)?clone(target.get(e.id)):e);
 const existing=new Set(next.elements.map(e=>e.id));
 for(let index=0;index<proposed.elements.length;index++){
  const e=proposed.elements[index];if(!selected.has(e.id)||existing.has(e.id))continue;
  let priorNeighbor=-1;
  for(let j=index-1;j>=0;j--){priorNeighbor=next.elements.findIndex(n=>n.id===proposed.elements[j].id);if(priorNeighbor>=0)break;}
  next.elements.splice(priorNeighbor>=0?priorNeighbor+1:next.elements.length,0,clone(target.get(e.id)));existing.add(e.id);
 }
 return next;
}
function apply(current,analysis,approvedRows=[],approveSettings=false,options={}){
 if(!analysis?.candidate?.pages||!analysis.rows)throw Error('Run proposal analysis before applying changes');
 if(analysis.originalSignature!==JSON.stringify(current))throw Error('Document changed after AI analysis; review the proposal again');
 if(analysis.candidateSignature!==JSON.stringify(analysis.candidate))throw Error('AI proposal changed after analysis; review it again');
 const base=C.normalizeProject(current),incoming=analysis.candidate;
 if(!Array.isArray(approvedRows))throw Error('Approved page selection must be an array');
 const approved=new Set();
 for(const raw of approvedRows){
  const index=Number(raw),row=analysis.rows[index];
  if((typeof raw!=='number'&&typeof raw!=='string')||!Number.isInteger(index)||!row||!row.changed)throw Error('Page approval references an unknown or unchanged diff');
  approved.add(index);
 }
 const selected=analysis.rows.filter(r=>r.changed&&approved.has(r.index));
 const elementSelection=options.elementSelection||{};
 const partial=[];
 for(const [key,values] of Object.entries(elementSelection)){
  const index=Number(key),row=analysis.rows[index];
  if(!Number.isInteger(index)||!row||approved.has(index)||row.originIndex==null||row.proposalIndex==null||row.idMismatch)throw Error('Element approval must target an existing matched page only');
  if(!Array.isArray(values)||!values.length)continue;
  const ids=new Set(values);
  if(values.some(id=>typeof id!=='string'||id.length>100))throw Error('Invalid selected element ID');
  for(const id of ids){const item=row.review.items.find(e=>e.id===id);if(!item||item.locked||!item.changed&&!item.provenanceFields.length)throw Error('Selected AI element is unchanged, locked or outside the reviewed diff');}
  partial.push({row,ids});
 }
 const settingsSelection=options.settingSelection;
 if(settingsSelection!==undefined&&!Array.isArray(settingsSelection))throw Error('Setting approval list must be an array');
 const settingsToApply=!approveSettings?[]:settingsSelection===undefined?[...analysis.settings]:[...new Set(settingsSelection)];
 if(settingsSelection&&settingsSelection.some(k=>typeof k!=='string'||!analysis.settings.includes(k)))throw Error('Unknown or unchanged setting cannot be approved');
 if(!approveSettings&&settingsSelection?.length)throw Error('Setting selection requires explicit settings approval');
 if(!selected.length&&!partial.length&&!settingsToApply.length)throw Error('Select at least one changed page, element, or document setting');
 if(selected.some(r=>r.blockedDeletion))throw Error('Locked elements prevent deleting the page; unlock and re-analyze before deleting');
 const partialItems=partial.flatMap(({row,ids})=>row.review.items.filter(item=>ids.has(item.id)));
 const settingsNumericRisk=settingsToApply.some(key=>settingHasNumericChange(base[key],incoming[key],key));
 if((selected.some(r=>r.review.numericRisks>0)||partialItems.some(item=>item.numericRisk)||settingsNumericRisk)&&!options.approveNumeric)throw Error('Numerical changes need explicit risk acknowledgement');
 if((selected.some(r=>r.review.evidenceProposals>0)||partialItems.some(item=>item.provenanceFields.length))&&!options.allowEvidenceChange)throw Error('Proposed evidence changes need explicit separate approval');
 const result=clone(base);let pages;
 if(analysis.matchingMode==='stable-id'){
  const remove=new Set(selected.filter(r=>r.originIndex!=null&&r.proposalIndex==null).map(r=>base.pages[r.originIndex].id));
  const update=new Map(selected.filter(r=>r.originIndex!=null&&r.proposalIndex!=null).map(r=>[base.pages[r.originIndex].id,r]));
  pages=base.pages.filter(pg=>!remove.has(pg.id)).map(pg=>{
   const row=update.get(pg.id);return row?preparedPage(pg,incoming.pages[row.proposalIndex],options):clone(pg);
  });
  for(const {row,ids} of partial){
   const pageID=base.pages[row.originIndex].id;
   const index=pages.findIndex(pg=>pg.id===pageID);
   if(index<0)throw Error('Original page disappeared during partial AI review');
   pages[index]=applyElements(pages[index],incoming.pages[row.proposalIndex],[...ids],options);
  }
  const additions=selected.filter(r=>r.originIndex==null&&r.proposalIndex!=null).sort((a,b)=>a.proposalIndex-b.proposalIndex);
  for(const row of additions){const proposed=incoming.pages[row.proposalIndex],newPage=preparedPage(null,proposed);
   // The proposal may describe an existing page under a new page ID, with its
   // original child element IDs. When inserting it beside its original, generate
   // new IDs for colliding children instead of rejecting the approved addition.
   const occupied=new Set(pages.flatMap(pg=>pg.elements.map(e=>e.id)));
   for(const block of newPage.elements){if(occupied.has(block.id)){do{block.id=C.uid();}while(occupied.has(block.id));}occupied.add(block.id);}
   let position=-1;
   for(let j=row.proposalIndex-1;j>=0;j--){position=pages.findIndex(pg=>pg.id===incoming.pages[j].id);if(position>=0)break;}
   if(position>=0)pages.splice(position+1,0,newPage);
   else{let following=-1;for(let j=row.proposalIndex+1;j<incoming.pages.length;j++){following=pages.findIndex(pg=>pg.id===incoming.pages[j].id);if(following>=0)break;}pages.splice(following>=0?following:pages.length,0,newPage);}
  }
 }else{
  pages=[];
  for(let i=0;i<Math.max(base.pages.length,incoming.pages.length);i++){
   const oldPage=base.pages[i],newPage=incoming.pages[i];
   if(approved.has(i)&&analysis.rows[i]?.changed){if(newPage)pages.push(preparedPage(oldPage,newPage,options));}
   else if(oldPage){
    const partialRow=partial.find(p=>p.row.originIndex===i);
    pages.push(partialRow?applyElements(oldPage,newPage,[...partialRow.ids],options):clone(oldPage));
   }
  }
 }
 if(pages.length<1||pages.length>50)throw Error('Resulting page count must be 1–50');
 result.pages=pages;
 if(settingsToApply.length)for(const key of settingsToApply)result[key]=clone(incoming[key]);
 return {project:C.normalizeProject(result),changedPages:selected.length+partial.length,settingsApplied:settingsToApply};
}
function formatReview(analysis,approvedRows=[],selectedElements={},selectedSettings=[]){
 if(!analysis?.rows)throw Error('No reviewed proposal available');
 const approved=new Set(approvedRows.map(Number));
 const lines=['DoCut AI proposal review · source-only', 'No source verification is performed by this review', 'Selected pages are proposals only, not approval of factual correctness',''];
 for(const setting of analysis.settingsReview||[]){
  lines.push('Setting '+setting.key+' ['+(selectedSettings.includes(setting.key)?'selected':'not selected')+']');
  lines.push('  Before: '+setting.before+' / After: '+setting.after+(setting.numericRisk?' [Numeric change needs verification]':''));
 }
 for(const row of analysis.rows){
  lines.push(`${row.index+1}. ${row.oldLabel} -> ${row.newLabel} [${approved.has(row.index)?'selected':'not selected'}]`);
  lines.push(`  ${row.details.join(' | ')||'Unchanged'}${row.blockedDeletion?' | Locked page deletion blocked':''}`);
  for(const d of row.metadataDiff||[])lines.push(`  Page ${d.field}: ${d.before} -> ${d.after}`);
  if(selectedElements[row.index]?.length)lines.push(`  Selected element IDs: ${selectedElements[row.index].join(', ')}`);
  for(const item of row.review.items){lines.push(`  - ${item.kind} ${item.id} (${item.type}): ${item.fields.join(', ')||'protected'}`);
   if(item.before!==item.after)lines.push(`    Before: ${item.before} / After: ${item.after}`);
   if(item.numericRisk)lines.push(`    Numbers: ${item.numericBefore} -> ${item.numericAfter}`);
   for(const diff of item.evidenceDiff)lines.push(`    Evidence ${diff.field}: ${diff.before} -> ${diff.after}`);
   if(item.flags.length)lines.push(`    Warnings: ${item.flags.join('; ')}`);
  }
 }
 return lines.join('\n')+'\n';
}
const api={parsePayload,analyze,apply,preparedPage,pageChanges,contentChanged,describeNumericChanges,reviewElements,evidenceChange,formatReview,applyElements};
root.DocutProposal=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
