/* V0.26: read-only bilingual review candidates, individually approved text-only changes. */
(function(root){
 'use strict';
 const SAFE_TYPES=new Set(['title','text','card','bullet','quote']);
 const PAGE_FIELDS=Object.freeze({tab:'페이지 탭 제목',headline:'페이지 헤드라인',subtitle:'페이지 설명'});
 const RULES=[
  {id:'ko-dwed',lang:'ko',description:'명백한 오탈자: 됬 → 됐',pattern:/됬/g,replacement:'됐'},
  {id:'ko-dweyo',lang:'ko',description:'일반적인 활용: 되요 → 돼요',pattern:/되요(?=[\s.,!?]|$)/g,replacement:'돼요'},
  {id:'ko-halsu',lang:'ko',description:'의존 명사 띄어쓰기: 할 수',pattern:/할수(?=[\s.,!?]|$)/g,replacement:'할 수'},
  {id:'ko-check',lang:'ko',description:'일반적인 서술어 띄어쓰기',pattern:/(검토|확인|진행) (하였|했습니다|합니다)/g,replacement:(_m,a,b)=>a+b},
  {id:'en-teh',lang:'en',description:'영문 철자: teh → the',pattern:/\bteh\b/gi,replacement:'the'},
  {id:'en-recieve',lang:'en',description:'영문 철자: recieve → receive',pattern:/\brecieve\b/gi,replacement:'receive'},
  {id:'en-seperate',lang:'en',description:'영문 철자: seperate → separate',pattern:/\bseperate\b/gi,replacement:'separate'},
  {id:'en-definately',lang:'en',description:'영문 철자: definately → definitely',pattern:/\bdefinately\b/gi,replacement:'definitely'},
  {id:'en-occured',lang:'en',description:'영문 철자: occured → occurred',pattern:/\boccured\b/gi,replacement:'occurred'},
  {id:'en-adress',lang:'en',description:'영문 철자: adress → address',pattern:/\badress\b/gi,replacement:'address'},
  {id:'en-double',lang:'en',description:'중복 영문 단어',pattern:/\b([a-z]{2,})\s+\1\b/gi,replacement:(_m,a)=>a},
  {id:'spacing',lang:'mixed',description:'중복 공백',pattern:/[^\S\r\n]{2,}/g,replacement:' '}
 ];
 const NUMBERS=/[-+]?\d+(?:[,.]\d+)*(?:\s?(?:%|％|‰|원|명|개|억|만|천|년|월|일|배|회|건|쪽|p))?/g;
 const urls=/\b(?:https?:\/\/|www\.)\S+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/gi;
 // Recognized source/reference lines are immutable in the conservative editor.
 // Users can change them explicitly in the ordinary inspector after reviewing evidence.
 const EVIDENCE_LINES=/(?:^|[\n(\[])\s*(?:출처|자료\s*출처|참고\s*자료|근거(?:\s*자료)?|source|references?)\s*[:：][^\n)\]]*/gi;
 function numbers(text){return String(text||'').match(NUMBERS)||[];}
 function sameNumbers(before,after){return JSON.stringify(numbers(before))===JSON.stringify(numbers(after));}
 function evidenceTokens(value){
  const text=String(value||'');
  return {links:Array.from(text.matchAll(urls),m=>m[0]),lines:Array.from(text.matchAll(EVIDENCE_LINES),m=>m[0])};
 }
 function sameEvidence(before,after){return JSON.stringify(evidenceTokens(before))===JSON.stringify(evidenceTokens(after));}
 function eligible(el){return !!el&&SAFE_TYPES.has(el.type)&&!el.locked&&!el.hidden&&!(Array.isArray(el.richText)&&el.richText.length);}
 function getTarget(project,ref){if(!project||!Array.isArray(project.pages)||!ref)return null;const p=project.pages.find(x=>x.id===ref.pageId);if(!p)return null;return p.elements.find(x=>x.id===ref.elementId)||null;}
 function findIssues(project,{scope='all',pageIndex=0,selectedId=null,lang='both',limit=300,ignored=null}={}){
  const result=[],seen=new Set();if(!Array.isArray(project?.pages))return result;
  const pages=scope==='all'?project.pages:project.pages.slice(pageIndex,pageIndex+1);
  const limitSafe=Math.max(1,Math.min(800,Number(limit)||300));
  for(const p of pages){
   if(!p)continue;const pi=project.pages.indexOf(p),targets=[];
   if(scope!=='selected'){
    for(const [field,label] of Object.entries(PAGE_FIELDS))targets.push({field,label,text:String(p[field]||'')});
   }
   for(const el of p.elements||[]){if(scope==='selected'&&el.id!==selectedId||!eligible(el))continue;targets.push({elementId:el.id,label:el.type,text:String(el.text||'')});}
   for(const target of targets){
    const text=target.text;if(!text||text.length>12000)continue;
    const protectedRanges=[...text.matchAll(urls),...text.matchAll(EVIDENCE_LINES)].map(m=>[m.index,m.index+m[0].length]);
    for(const rule of RULES){if(lang!=='both'&&rule.lang!==lang&&rule.lang!=='mixed')continue;
     const rx=new RegExp(rule.pattern.source,rule.pattern.flags);let m;
     while((m=rx.exec(text))!==null){if(!m[0]){rx.lastIndex++;continue;}
      if(protectedRanges.some(([a,b])=>m.index<b&&m.index+m[0].length>a))continue;
      if(rule.lang==='en'&&m[0].length>=3&&m[0]===m[0].toUpperCase())continue;
      let next=m[0].replace(new RegExp(rule.pattern.source,rule.pattern.flags.replace('g','')),rule.replacement);
      if(rule.lang==='en'&&m[0][0]===m[0][0]?.toUpperCase())next=next[0].toUpperCase()+next.slice(1);
      if(next===m[0])continue;
      const after=text.slice(0,m.index)+next+text.slice(m.index+m[0].length);
      if(!sameNumbers(text,after)||!sameEvidence(text,after))continue;
      const ref=target.field?{field:target.field,elementId:null}:{elementId:target.elementId};
      const issue={id:`${p.id}:${target.field||target.elementId}:${m.index}:${rule.id}`,pageIndex:pi,pageId:p.id,...ref,targetLabel:target.label,rule:rule.id,lang:rule.lang,reason:rule.description,start:m.index,before:m[0],after:next,originalText:text,proposedText:after};
      if(ignored?.has(issue.id+'|'+issue.originalText))continue;
      const spanKey=issue.pageId+'|'+(issue.field||issue.elementId)+'|'+issue.start;
      if(seen.has(spanKey))continue;
      seen.add(spanKey);result.push(issue);if(result.length>=limitSafe)return result;
     }
    }
   }
  }
  return result;
 }
 function planChange(project,ref,originalText,newText){
  const page=project?.pages?.find(p=>p.id===ref?.pageId);
  const isPageField=!!ref?.field;
  if(isPageField&&(!Object.hasOwn(PAGE_FIELDS,ref.field)||ref.elementId))throw Error('지원하지 않는 페이지 필드입니다.');
  const el=isPageField?page:getTarget(project,ref);
  if(!el)throw Error('검토 대상 요소가 삭제되거나 이동됐습니다.');
  if(!isPageField){
   if(!SAFE_TYPES.has(el.type))throw Error('표·차트 원자료와 출처·의견은 이 기능에서 수정하지 않습니다.');
   if(el.locked||el.hidden)throw Error('잠김·숨김 요소를 직접 수정할 수 없습니다.');
   if(Array.isArray(el.richText)&&el.richText.length)throw Error('부분 서식 요소는 원본 서식 보호를 위해 이 기능에서 수정하지 않습니다.');
  }
  const currentText=isPageField?el[ref.field]:el.text;
  if(currentText!==originalText)throw Error('검토 도중 원문이 변경됐습니다. 새로 점검하세요.');
  const next=String(newText??'');if(!next.trim()||next.length>12000||next===originalText)throw Error('비어 있거나 동일한 문장·길이 초과 제안은 반영하지 않습니다.');
  if(!sameNumbers(originalText,next))throw Error('숫자·날짜·단위가 바뀌었습니다. 일반 문장 교정에서 수정할 수 없습니다.');
  if(!sameEvidence(originalText,next))throw Error('출처 표기·URL·이메일이 바뀌었습니다. 일반 문장 교정에서 수정할 수 없습니다.');
  return {pageId:ref.pageId,elementId:isPageField?null:ref.elementId,...(isPageField?{field:ref.field}:{}),originalText,nextText:next};
 }
 function applyPlan(project,plan){
  const verified=planChange(project,plan,plan.originalText,plan.nextText);
  if(verified.field){const page=project.pages.find(p=>p.id===verified.pageId);page[verified.field]=verified.nextText;return page;}
  const el=getTarget(project,verified);el.text=verified.nextText;el.verified=false;
  return el;
 }
 function aiPrompt(el,{title='',pageTitle=''}={}){
  if(!eligible(el))throw Error('잠김·숨김·서식 변경 위험이 없는 텍스트 요소를 선택하세요.');
  return ['[DoCut · 한국어/영어 보고서 문장 개선 요청]','이 요청은 사용자에 의해 별도 외부 AI로 복사될 수 있습니다. DoCut은 자동 전송하지 않습니다.','목적: 정중하고 간결한 업무 보고서 문체로 다듬되 의미와 사실을 유지합니다.','규칙: 숫자, 날짜, 단위, 법령명, 고유명사, 출처는 변경하거나 추가하지 마세요. 추측이나 새로운 근거를 만들지 마세요.','결과: 수정 제안 문장만 출력하세요. HTML/JSON/Markdown 설명 없이 복사 가능한 일반 텍스트로 제시하세요.',`보고서: ${String(title).slice(0,90)}`,`페이지: ${String(pageTitle).slice(0,80)}`,'[사용자가 선택한 원문]',String(el.text||'').slice(0,12000)].join('\n');
 }
 const api={SAFE_TYPES,PAGE_FIELDS,RULES,numbers,sameNumbers,evidenceTokens,sameEvidence,eligible,getTarget,findIssues,planChange,applyPlan,aiPrompt};
 root.DocutValidation=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
