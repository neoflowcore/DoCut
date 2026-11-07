(function(root){
'use strict';
// Private, offline editorial review annotations. Not report contents or verified evidence.
const C=root.DocutCore;
if(!C)throw Error('Core model is required for local review annotations');
const MAX_NOTES=300,MAX_REPLIES=16,MAX_BODY=2000,MAX_AUTHOR=48;
const priorities=['high','normal','low'],statuses=['open','resolved'];
const plain=value=>String(value??'');
const iso=value=>typeof value==='string'&&value.length<=40&&!Number.isNaN(Date.parse(value))&&/^\d{4}-\d{2}-\d{2}T/.test(value);
const idOK=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,96}$/.test(value);
const now=()=>new Date().toISOString();
const token=prefix=>prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12);
function text(value,max,label,required=false){
 const out=plain(value);if(out.length>max)throw Error(label+' exceeds '+max+' characters; review data was not truncated');
 if(required&&!out.trim())throw Error(label+' cannot be blank');return out;
}
function normalizeReply(value){
 if(!value||typeof value!=='object'||!idOK(value.id))throw Error('Invalid review reply identity');
 if(!iso(value.at))throw Error('Invalid review reply timestamp');
 return {id:value.id,author:text(value.author,MAX_AUTHOR,'Reply author'),body:text(value.body,MAX_BODY,'Reply text',true),at:value.at};
}
function normalize(input){
 if(input==null)return[];
 if(!Array.isArray(input))throw Error('Reviews must be an array; project import refused');
 if(input.length>MAX_NOTES)throw Error('Review count exceeds '+MAX_NOTES+'; import refused to avoid dropping feedback');
 const unique=new Set();
 return input.map((raw,i)=>{
  if(!raw||typeof raw!=='object'||!idOK(raw.id)||unique.has(raw.id))throw Error('Invalid or duplicate review ID at row '+(i+1));
  unique.add(raw.id);
  if(!priorities.includes(raw.priority))throw Error('Unsupported review priority at row '+(i+1));
  if(!statuses.includes(raw.status))throw Error('Unsupported review status at row '+(i+1));
  if(!iso(raw.createdAt)||!iso(raw.updatedAt))throw Error('Invalid review timestamp at row '+(i+1));
  if(raw.replies!=null&&!Array.isArray(raw.replies))throw Error('Review replies must be an array');
  const replies=raw.replies||[];
  if(replies.length>MAX_REPLIES)throw Error('Review has more than '+MAX_REPLIES+' replies; import refused');
  const ids=new Set();const cleanReplies=replies.map(r=>{const reply=normalizeReply(r);if(ids.has(reply.id)||unique.has(reply.id))throw Error('Duplicate reply ID');ids.add(reply.id);unique.add(reply.id);return reply;});
  if(raw.resolvedFingerprint&&!/^[a-f0-9]{8}$/i.test(raw.resolvedFingerprint))throw Error('Invalid review resolution fingerprint; no information was discarded');
  const resolvedAt=raw.resolvedAt||'';
  if(resolvedAt&&!iso(resolvedAt))throw Error('Invalid resolved timestamp');
  return {id:raw.id,pageId:text(raw.pageId,100,'Page reference'),elementId:text(raw.elementId,100,'Element reference'),author:text(raw.author,MAX_AUTHOR,'Review author'),body:text(raw.body,MAX_BODY,'Review text',true),priority:raw.priority,status:raw.status,createdAt:raw.createdAt,updatedAt:raw.updatedAt,resolvedAt:raw.status==='resolved'?resolvedAt:'',resolvedBy:raw.status==='resolved'?text(raw.resolvedBy,MAX_AUTHOR,'Resolver'):'',resolvedFingerprint:raw.status==='resolved'&&/^[a-f0-9]{8}$/i.test(raw.resolvedFingerprint||'')?raw.resolvedFingerprint:'',replies:cleanReplies,anchorHint:text(raw.anchorHint,360,'Anchor hint')};
 });
}
function newReview({pageId='',elementId='',author='',body,priority='normal',anchorHint=''}={}){
 return normalize([{id:token('rv'),pageId,elementId,author,body,priority,status:'open',createdAt:now(),updatedAt:now(),resolvedAt:'',resolvedBy:'',resolvedFingerprint:'',replies:[],anchorHint}])[0];
}
function insert(project,data){const review=newReview(data);const next=normalize([...(project.reviews||[]),review]);project.reviews=next;return review;}
function edit(project,id,body){const reviews=normalize(project.reviews||[]),note=reviews.find(n=>n.id===id);if(!note)throw Error('Review not found');const next=text(body,MAX_BODY,'Review text',true);if(note.body!==next&&note.status==='resolved'){note.status='open';note.resolvedAt='';note.resolvedBy='';note.resolvedFingerprint='';}note.body=next;note.updatedAt=now();project.reviews=reviews;return note;}
function reply(project,id,{body,author=''}){const reviews=normalize(project.reviews||[]),note=reviews.find(n=>n.id===id);if(!note)throw Error('Review not found');if(note.status!=='open')throw Error('Reopen the resolved review before replying');if(note.replies.length>=MAX_REPLIES)throw Error('This review already has '+MAX_REPLIES+' replies');note.replies.push(normalizeReply({id:token('rp'),body,author,at:now()}));note.updatedAt=now();project.reviews=reviews;return note;}
function fingerprint(note,pages){
 const place=anchor(note,pages);if(place.state==='orphan')return 'missing';
 if(place.state==='document')return '';
 const pg=pages[place.pageIndex];
 const data=note.elementId?place.element:{tab:pg.tab,headline:pg.headline,subtitle:pg.subtitle,background:pg.background,layout:pg.layout,transition:pg.transition,elements:pg.elements};
 let h=2166136261;for(const ch of JSON.stringify(data||{})){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return (h>>>0).toString(16).padStart(8,'0');
}
function isStale(note,pages){return note.status==='resolved'&&Boolean(note.resolvedFingerprint)&&fingerprint(note,pages)!==note.resolvedFingerprint;}
function setStatus(project,id,status,author=''){const reviews=normalize(project.reviews||[]),note=reviews.find(n=>n.id===id);if(!note)throw Error('Review not found');if(!statuses.includes(status))throw Error('Invalid review status');note.status=status;note.resolvedAt=status==='resolved'?now():'';note.resolvedBy=status==='resolved'?text(author,MAX_AUTHOR,'Resolver'):'';note.resolvedFingerprint=status==='resolved'?fingerprint(note,project.pages):'';note.updatedAt=now();project.reviews=reviews;return note;}
function setPriority(project,id,priority){const reviews=normalize(project.reviews||[]),note=reviews.find(n=>n.id===id);if(!note)throw Error('Review not found');if(!priorities.includes(priority))throw Error('Invalid priority');note.priority=priority;note.updatedAt=now();project.reviews=reviews;return note;}
function retarget(project,id,pageId='',elementId=''){const reviews=normalize(project.reviews||[]),note=reviews.find(n=>n.id===id);if(!note)throw Error('Review not found');note.pageId=text(pageId,100,'Page reference');note.elementId=text(elementId,100,'Element reference');note.anchorHint='';note.status='open';note.resolvedBy='';note.resolvedAt='';note.resolvedFingerprint='';note.updatedAt=now();project.reviews=reviews;return note;}
function anchor(note,pages){if(!note.pageId)return note.anchorHint?{state:'orphan',pageIndex:-1,element:null,label:'가져온 메모 · 원본 위치 연결 해제'}:{state:'document',pageIndex:-1,element:null,label:'보고서 전체'};
 const index=(pages||[]).findIndex(p=>p.id===note.pageId);if(index<0)return{state:'orphan',pageIndex:-1,element:null,label:'삭제되거나 연결이 끊긴 페이지'};
 const page=pages[index];if(!note.elementId)return{state:'page',pageIndex:index,element:null,label:(index+1)+'페이지 · '+page.tab};
 const element=page.elements.find(e=>e.id===note.elementId);if(!element)return{state:'orphan',pageIndex:index,element:null,label:(index+1)+'페이지 · 연결된 요소 없음'};
 return{state:'element',pageIndex:index,element,label:(index+1)+'페이지 · '+(element.text||element.type).slice(0,65)};
}
function summary(project){const reviews=normalize(project.reviews||[]),pages=project.pages||[];return{total:reviews.length,open:reviews.filter(n=>n.status==='open').length,resolved:reviews.filter(n=>n.status==='resolved').length,highOpen:reviews.filter(n=>n.status==='open'&&n.priority==='high').length,staleResolved:reviews.filter(n=>isStale(n,pages)).length,orphans:reviews.filter(n=>anchor(n,pages).state==='orphan').length,replies:reviews.reduce((n,r)=>n+r.replies.length,0)};}
function filter(project,{status='all',priority='all',query=''}={}){
 const q=plain(query).trim().toLocaleLowerCase();return normalize(project.reviews||[]).filter(n=>(status==='all'||n.status===status)&&(priority==='all'||n.priority===priority)&&(!q||[n.body,n.author,n.anchorHint,...n.replies.flatMap(r=>[r.author,r.body]),anchor(n,project.pages).label].join(' ').toLocaleLowerCase().includes(q))).sort((a,b)=>(a.status===b.status?0:a.status==='open'?-1:1)||(priorities.indexOf(a.priority)-priorities.indexOf(b.priority))||a.createdAt.localeCompare(b.createdAt));
}
const prName={high:'높음',normal:'보통',low:'낮음'},stName={open:'미해결',resolved:'해결'};
function exportText(project){const rows=normalize(project.reviews||[]);return [`[DoCut 내부 검토 메모]`,`문서: ${project.title||''}`,`검토 기록: ${rows.length}개`,`이 파일은 원문 사실·수치 검증 증명서가 아닙니다. 작성자 입력 검토 의견입니다.`,``,...rows.flatMap((n,i)=>{const a=anchor(n,project.pages);return[`${i+1}. [${stName[n.status]} / ${prName[n.priority]}${isStale(n,project.pages)?' / 이후 원문 변경됨':''}] ${a.label}`,`작성자: ${n.author||'익명'} | 작성: ${n.createdAt} | 수정: ${n.updatedAt}`,`메모: ${n.body}`,n.anchorHint?'기존 위치 참고: '+n.anchorHint:'',n.status==='resolved'?`해결: ${n.resolvedBy||'미기입'} (${n.resolvedAt})`:'',...n.replies.map((r,j)=>`  답글 ${j+1} | ${r.author||'익명'} | ${r.at}: ${r.body}`),''];})].join('\n');}
function csvCell(value){let raw=plain(value);if(/^[\s\u0000-\u001f]*[=+\-@]/.test(raw)||/^[\t\r]/.test(raw))raw="'"+raw;return '"'+raw.replace(/"/g,'""')+'"';}
function exportCSV(project){const rows=normalize(project.reviews||[]),header=['검토ID','상태','우선순위','연결 위치','작성자','본문','작성시각','수정시각','해결자','해결시각','답글수','답글내용','해결 이후 원문 변경'];return [header.map(csvCell).join(','),...rows.map(n=>{const fields=[n.id,stName[n.status],prName[n.priority],anchor(n,project.pages).label,n.author,n.body,n.createdAt,n.updatedAt,n.resolvedBy,n.resolvedAt,n.replies.length,n.replies.map(r=>`[${r.author||'익명'}] ${r.body}`).join(' | '),isStale(n,project.pages)?'예':'아니오'];return fields.map(csvCell).join(',');})].join('\r\n');}
function importWithRemap(targetReviews,sourceReviews,pageMap,elementMap,uid){
 const dest=normalize(targetReviews),src=normalize(sourceReviews);if(dest.length+src.length>MAX_NOTES)throw Error('Importing feedback exceeds '+MAX_NOTES+' notes; no source review was dropped');
 const remapped=src.map(n=>({...n,id:uid('rv'),pageId:pageMap.get(n.pageId)||'',elementId:elementMap.get(n.elementId)||'',anchorHint:(!pageMap.has(n.pageId)&&n.pageId)?'가져온 원본 위치: '+n.pageId+(n.elementId?' / '+n.elementId:''):(n.anchorHint||''),replies:n.replies.map(r=>({...r,id:uid('rp')}))}));return normalize([...dest,...remapped]);
}
// Review-only exchange. No report body or media is carried in the packet.
function exportPacket(project){return JSON.stringify({kind:'docut-private-review-packet',version:1,createdAt:project.createdAt,exportedAt:now(),reportTitle:plain(project.title),reviews:normalize(project.reviews||[])},null,2);}
function inspectPacket(project,input){
 const raw=typeof input==='string'?JSON.parse(input):input;
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||raw.kind!=='docut-private-review-packet'||raw.version!==1)throw Error('Not a supported DoCut private review packet');
 if(typeof raw.createdAt!=='string'||raw.createdAt!==project.createdAt)throw Error('Packet belongs to another original report; no comments were merged');
 const imported=normalize(raw.reviews),existing=normalize(project.reviews||[]),byId=new Map(existing.map(n=>[n.id,n]));
 const added=[],duplicates=[],conflicts=[];
 for(const note of imported){const old=byId.get(note.id);if(!old)added.push(note);else if(JSON.stringify(old)===JSON.stringify(note))duplicates.push(note.id);else conflicts.push(note.id);}
 if(conflicts.length)throw Error('Existing review IDs have different content ('+conflicts.length+'); import refused to prevent overwriting another reviewer');
 if(existing.length+added.length>MAX_NOTES)throw Error('Merged reviews exceed '+MAX_NOTES+'; import refused to avoid dropping feedback');
 return {added,duplicateCount:duplicates.length,existingCount:existing.length,orphanCount:added.filter(n=>anchor(n,project.pages).state==='orphan').length,packetCount:imported.length};
}
function mergePacket(project,packet){const plan=inspectPacket(project,packet);return normalize([...(project.reviews||[]),...plan.added]);}
const api={MAX_NOTES,MAX_REPLIES,MAX_BODY,MAX_AUTHOR,normalize,newReview,insert,edit,reply,setStatus,setPriority,retarget,anchor,fingerprint,isStale,summary,filter,exportText,exportCSV,exportPacket,inspectPacket,mergePacket,importWithRemap};
root.DocutReviewBoard=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
