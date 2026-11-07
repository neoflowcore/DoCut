(function(root){
'use strict';
// Exact literal, opt-in text replacement. No regular expressions or HTML execution.
// Provenance fields and numbers stored in chart data are never modified.
const C=root.DocutCore;
if(!C)throw Error('DocutCore required before text_rewrite');
function matches(haystack,needle,caseSensitive){
 if(!needle)return [];const text=String(haystack||'');
 const found=[];
 // Substring-based case folding keeps source offsets correct when a Unicode fold
 // changes code-unit length (for example dotted capital I).
 for(let offset=0;offset<=text.length-needle.length;){
  const direct=text.slice(offset,offset+needle.length);
  const equal=caseSensitive?direct===needle:direct.toLocaleLowerCase()===needle.toLocaleLowerCase();
  if(equal){found.push(offset);offset+=needle.length;if(found.length>2000)throw Error('한 요소에 일치 항목이 2,000개를 초과해 변경을 취소했습니다. 검색 범위를 좁히세요.');}
  else offset++;
 }
 return found;
}
function replaceLiteral(text,needle,replacement,caseSensitive){
 const locations=matches(text,needle,caseSensitive);if(!locations.length)return {text:String(text||''),hits:0};
 const orig=String(text||'');let pos=0,result='';for(const start of locations){result+=orig.slice(pos,start)+replacement;pos=start+needle.length;}return {text:result+orig.slice(pos),hits:locations.length};
}
function preview(project,query,replace,opts={}){
 const needle=String(query??''),replacement=String(replace??'');
 if(!needle.trim()||needle.length>120||replacement.length>300)throw Error('검색어는 1~120자, 바꿀 내용은 300자 이하로 입력하세요.');
 if(needle===replacement)throw Error('검색어와 바꿀 내용이 같습니다.');
 const pageScope=Number.isInteger(opts.pageIndex)&&opts.pageIndex>=0?opts.pageIndex:null,caseSensitive=!!opts.caseSensitive;
 const rows=[];let hits=0,skippedLocked=0,skippedFormatted=0,skippedOverflow=0,scanned=0;
 (project?.pages||[]).forEach((page,pi)=>{
  if(pageScope!==null&&pi!==pageScope)return;
  for(const element of page.elements||[]){scanned++;
   if(!['title','text','bullet','quote','card','kpi','source','note','bar','line','donut','table','stat'].includes(element.type))continue;
   const original=String(element.text||'');const occurrences=matches(original,needle,caseSensitive);
   if(!occurrences.length)continue;
   if(element.locked){skippedLocked+=occurrences.length;continue;}
   if(element.richText?.length&&!opts.includeFormatted){skippedFormatted+=occurrences.length;continue;}
   const result=replaceLiteral(original,needle,replacement,caseSensitive);
   if(result.text.length>12000){skippedOverflow+=occurrences.length;continue;}
   rows.push({pageIndex:pi,id:element.id,type:element.type,old:original,newText:result.text,hits:occurrences.length,formatWillReset:!!element.richText?.length,
    snippet:original.slice(Math.max(0,occurrences[0]-32),Math.min(original.length,occurrences[0]+needle.length+50))});hits+=occurrences.length;
  }
 });
 return {rows,hits,skippedLocked,skippedFormatted,skippedOverflow,scanned,needle,replacement,caseSensitive,includeFormatted:!!opts.includeFormatted,scope:pageScope};
}
function apply(project,plan,approvedIds){
 if(!plan||!Array.isArray(plan.rows))throw Error('No reviewed changes');
 const approved=new Set(approvedIds||[]),next=C.clone(project);let changed=0,occurrences=0;
 // Verify ALL approved records before touching the clone: no partial silent write.
 for(const row of plan.rows){if(!approved.has(row.id))continue;
  const el=next.pages[row.pageIndex]?.elements.find(e=>e.id===row.id);
  if(!el||el.locked||String(el.text||'')!==row.old||row.newText.length>12000)throw Error('편집 대상이 검토 이후 변경됐습니다. 다시 분석하세요.');
 }
 for(const row of plan.rows){if(!approved.has(row.id))continue;
  const el=next.pages[row.pageIndex].elements.find(e=>e.id===row.id);el.text=row.newText;
  if(row.formatWillReset)el.richText=[];
  el.verified=false;changed++;occurrences+=row.hits;
 }
 return {project:next,changed,occurrences};
}
const api={matches,replaceLiteral,preview,apply};root.DocutTextRewrite=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
