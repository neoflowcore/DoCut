/* DoCut V0.21 quality review: deterministic, offline, non-mutating advisory checks.
   An issue is a review prompt, not a factual verification or an overall completion score. */
(function(root){
 'use strict';
 const C=root.DocutCore;
 const MAX_ISSUES=1200;
 const SEVERITIES=['critical','review','suggestion'];
 const SEVERITY_NAME={critical:'우선 확인',review:'검토 필요',suggestion:'개선 제안'};
 const CATEGORY_NAME={story:'논리 구조',evidence:'근거·수치',layout:'레이아웃',access:'가독성·접근성',motion:'모션·성능'};
 const METRIC_TYPES=new Set(['bar','line','donut','kpi','table','stat']);
 const READABLE_TYPES=new Set(['title','text','card','kpi','note','bullet','quote','source']);
 const COSTLY_EFFECTS=new Set(['parallax','tilt','depth-in','flip-x','flip-y','shimmer','breathe','float','glow','shake-soft','chart-draw','stat-reveal']);
 const PLACEHOLDER=/(?:placeholder|sample data|sample\b|enter (?:title|text|data)|insert|\uc785\ub825\ud558\uc138\uc694|\uc785\ub825\ud574\uc8fc\uc138\uc694|\uc0d8\ud50c|\uc608\uc2dc\s*(?:\ub370\uc774\ud130|\ubb38\uad6c)|\uadfc\uac70\uc640 \ud575\uc2ec \uba54\uc2dc\uc9c0\ub97c \uba85\ud655\ud558\uac8c)/i;
 const NUMERIC_CLAIM=/(?:\d+(?:[.,]\d+)?\s*%|\d+(?:,\d{3})+\s*(?:\uc6d0|\uba85|\uac74|\uac1c)|\d+(?:\.\d+)?\s*(?:\uc5b5\s*\uc6d0|\uc870\s*\uc6d0))/;
 const str=(v)=>String(v==null?'':v);
 const sane=(v,max=140)=>str(v).replace(/[\u0000-\u001f\u007f]+/g,' ').replace(/\s+/g,' ').trim().slice(0,max);
 function finite(v){const n=Number(v);return Number.isFinite(n)?n:null;}
 function rect(el){const a=['x','y','w','h'].map(k=>finite(el[k]));return a.some(v=>v===null)?null:{x:a[0],y:a[1],w:a[2],h:a[3]};}
 function overlap(a,b){const w=Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x));const h=Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));const small=Math.min(a.w*a.h,b.w*b.h);return small>0?w*h/small:0;}
 function issuesFilter(report,severity='all',category='all'){
  if(!report||!Array.isArray(report.issues))return [];
  return report.issues.filter(i=>(severity==='all'||i.severity===severity)&&(category==='all'||i.category===category));
 }
 function questionFor(role){const s=str(role);
  if(/요약|결론|권고|최종|선택안|판단/.test(s))return '이 페이지를 보고 독자가 어떤 결정을 내려야 하는가?';
  if(/대안|비교|사례|벤치마크|비용|편익/.test(s))return '비교 기준, 대안별 작용과 부작용, 선택 근거는 무엇인가?';
  if(/실행|일정|이행|향후|추진|후속/.test(s))return '누가 무엇을 언제까지 실행하고, 어떤 기준으로 확인하는가?';
  if(/현황|배경|문제|영향|원인|위험/.test(s))return '지금 상황과 문제의 원인, 직접 영향을 받는 사람은 누구인가?';
  if(/자료|근거|분석|방법|실적|성과|증감|결과/.test(s))return '이 판단의 원자료, 기준일, 분모와 해석 한계는 무엇인가?';
  return '이 장의 핵심 주장과 확인할 증거는 무엇인가?';
 }
 function analyze(project){
  if(!project||!Array.isArray(project.pages))throw Error('DoCut quality review needs pages');
  const issues=[],keys=new Set(),pages=[],pageIssueTotals=new Map(),counts={critical:0,review:0,suggestion:0};
  const categoryCounts={story:0,evidence:0,layout:0,access:0,motion:0};
  let total=0;
  function add(pi,id,rule,severity,category,message,hint,relatedId){
   if(!SEVERITIES.includes(severity)||!CATEGORY_NAME[category])return;
   const key=[pi,id||'',rule,relatedId||''].join(':');if(keys.has(key))return;keys.add(key);
   total++;counts[severity]++;categoryCounts[category]++;pageIssueTotals.set(pi,(pageIssueTotals.get(pi)||0)+1);
   if(issues.length>=MAX_ISSUES)return;
   issues.push({pageIndex:pi,id:id||null,relatedId:relatedId||null,rule,type:rule,severity,category,message,hint});
  }
  const seenTabs=new Map(),seenElementIds=new Map();
  const expected=(typeof C?.storyLabels==='function'?C.storyLabels(project.storyType||'strategy',project.pages.length):[]);
  project.pages.forEach((pg,pi)=>{
   const els=Array.isArray(pg.elements)?pg.elements:[],visible=els.filter(e=>!e.hidden),tab=sane(pg.tab,120);
   const summary={index:pi,title:tab||'제목 없음',suggested:expected[pi]||'추가 분석',question:questionFor(expected[pi]||tab),elements:els.length,visible:visible.length,sourceCount:visible.filter(e=>sane(e.source)).length,verifiedCount:visible.filter(e=>e.verified).length,metricCount:visible.filter(e=>METRIC_TYPES.has(e.type)).length,issueCount:0};
   pages.push(summary);
   if(!els.length||!visible.length)add(pi,null,'EMPTY_PAGE','critical','story','페이지에 표시되는 내용이 없습니다.','이 페이지를 채우거나 빈 페이지가 의도적인지 확인하세요.');
   if(!tab||tab==='페이지')add(pi,null,'NO_TAB','review','story','페이지 탭 제목을 구체화해야 합니다.','한 문장의 핵심 판단이 드러나는 제목을 입력하세요.');
   const key=tab.toLocaleLowerCase();
   if(key){if(seenTabs.has(key))add(pi,null,'DUPLICATE_TAB','suggestion','story','앞쪽 페이지와 탭 제목이 같습니다.','서로 다른 페이지라면 역할이 구분되도록 제목을 조정하세요.');else seenTabs.set(key,pi);}
   const titles=visible.filter(e=>e.type==='title');
   if(!titles.length)add(pi,null,'NO_TITLE','review','story','화면 안에 큰 제목 요소가 없습니다.','페이지 핵심 메시지가 보이도록 제목을 추가하세요.');
   if(titles.length>1)add(pi,null,'MULTIPLE_TITLES','suggestion','story','큰 제목 요소가 여러 개입니다.','주제목과 보조제목의 시각적 위계를 점검하세요.');
   // IDs are document identity even when a layer is hidden. Audit all IDs, but
   // restrict editorial/content warnings to visible objects to reduce noise.
   const sourceIds=new Set();
   els.forEach(el=>{
    const id=str(el?.id);
    if(!id)return;
    if(sourceIds.has(id))add(pi,id,'DUPLICATE_ID','critical','layout','동일 페이지에 요소 ID가 중복됩니다.','프로젝트를 JSON으로 저장하고 요소 식별자를 정리하세요.');
    sourceIds.add(id);
    if(seenElementIds.has(id)&&seenElementIds.get(id)!==pi)add(pi,id,'DUPLICATE_GLOBAL_ID','critical','layout','다른 페이지에서도 동일한 요소 ID를 사용합니다.','페이지 간 복사/이동의 식별자를 중복 없이 수정해야 합니다.');
    else seenElementIds.set(id,pi);
   });
   let costlyMotionLayers=0;
   visible.forEach((el,ei)=>{
    const id=str(el.id)||null,style=el.style||{},txt=str(el.text),d=el.data||{};
    if(PLACEHOLDER.test(txt))add(pi,id,'PLACEHOLDER','review','story','샘플 또는 작성 안내 문구가 남아 있을 수 있습니다.','실제 발표할 내용으로 교체하거나 의도한 문구인지 확인하세요.');
    if(el.type==='title'&&txt.trim().length>85)add(pi,id,'LONG_TITLE','suggestion','story','제목이 길어 한눈에 읽기 어려울 수 있습니다.','결론 중심 한 문장으로 줄일지 검토하세요.');
    const source=sane(el.source,300),date=sane(el.asOfDate,20),unit=sane(el.unit||d.unit,100);
    if(METRIC_TYPES.has(el.type)){
     if(!source)add(pi,id,'MISSING_SOURCE','review','evidence','수치·표의 출처가 입력되지 않았습니다.','원자료명과 발행기관 등 확인 가능한 출처를 기록하세요.');
     else if(!el.verified)add(pi,id,'NOT_VERIFIED','review','evidence','출처는 있으나 수치의 사용자 검증은 완료되지 않았습니다.','원자료와 날짜·산식을 확인한 뒤 직접 검증 표시하세요.');
     if(source&&!date)add(pi,id,'MISSING_DATE','review','evidence','출처 기준일이 없습니다.','기준일(YYYY-MM-DD)을 확인하고 기록하세요.');
     if(['bar','line','donut','kpi','stat'].includes(el.type)&&!unit)add(pi,id,'MISSING_UNIT','review','evidence','숫자의 단위가 없습니다.','%, 명, 건, 원 등 원자료와 일치하는 단위를 입력하세요.');
    }
    if(el.verified&&!source&&METRIC_TYPES.has(el.type))add(pi,id,'UNSUPPORTED_VERIFICATION','critical','evidence','출처 없이 검증 완료 표시가 되어 있습니다.','검증 사실과 근거를 확인하고 표시를 재검토하세요.');
    if(!METRIC_TYPES.has(el.type)&&READABLE_TYPES.has(el.type)&&NUMERIC_CLAIM.test(txt)&&!source)add(pi,id,'TEXT_NUMBER_SOURCE','suggestion','evidence','본문에 정량적 주장이 있으나 출처가 없습니다.','숫자와 단위를 원자료에 대조하세요. 날짜·페이지 번호 등이라면 무시할 수 있습니다.');
    if(el.type==='stat'){
     const warnings=root.DocutStatCharts?.warnings?.(d)||[];
     warnings.slice(0,12).forEach((w,j)=>add(pi,id,'STAT_'+j,'critical','evidence','통계 자료 확인: '+sane(w,180),'원본 표, 한계값, 표본 조건과 분석 가정을 다시 확인하세요.'));
     if(el.verified&&warnings.length)add(pi,id,'STAT_VERIFIED_INVALID','critical','evidence','통계 입력 경고가 있는데 검증 완료 표시가 있습니다.','경고를 해결하고 검증 상태를 재검토하세요.');
    }
    if(['bar','line','donut'].includes(el.type)){
     const values=Array.isArray(d.values)?d.values:[],names=Array.isArray(d.labels)?d.labels:[];
     if(!values.length||values.length!==names.length||values.some(v=>finite(v)===null))add(pi,id,'CHART_DATA','critical','evidence','차트 항목과 수치가 일치하지 않거나 비어 있습니다.','원자료의 행수·수치형식·누락 항목을 확인하세요.');
     const categories=names.map(v=>sane(v,100).toLocaleLowerCase()).filter(Boolean);
     if(categories.length!==new Set(categories).size)add(pi,id,'CHART_DUPLICATE_LABEL','review','evidence','한 차트에 같은 항목명이 반복됩니다.','중복 범주인지 원자료에서 확인하세요. 시간대·집단 구분이 필요한 경우 상세히 기록하세요.');
     if(el.type==='donut'&&values.length&&values.every(v=>finite(v)!==null&&finite(v)===0))add(pi,id,'DONUT_ZERO_TOTAL','critical','evidence','도넛 차트의 모든 값이 0이어서 비중을 표시할 수 없습니다.','값과 분모의 정의를 원자료에서 확인하고, 값이 0뿐이라면 비교표로 표시하세요.');
     if(el.type==='donut'&&values.some(v=>finite(v)!==null&&finite(v)<0))add(pi,id,'DONUT_NEGATIVE','critical','evidence','음수는 도넛 차트의 비중으로 나타낼 수 없습니다.','차트 종류 또는 데이터 정의를 변경하세요.');
     if(el.type==='donut'&&unit==='%'&&values.length){const sum=values.reduce((t,v)=>t+(finite(v)||0),0);if(Math.abs(sum-100)>0.51)add(pi,id,'DONUT_PERCENT','suggestion','evidence','백분율 도넛 차트의 값 합계가 100%와 다릅니다.','반올림 및 전체 모집단 정의를 확인하세요.');}
    }
    if(el.type==='table'&&Array.isArray(d.rows)&&d.rows.length){
     const width=Math.max(...d.rows.map(r=>Array.isArray(r)?r.length:0));
     if(d.rows.some(r=>!Array.isArray(r)||r.length!==width))add(pi,id,'TABLE_COLUMNS','review','evidence','표의 행마다 열 개수가 다릅니다.','열 제목과 누락된 셀을 확인하세요.');
     if(d.rows[0].some?.(cell=>!sane(cell)))add(pi,id,'TABLE_HEADER','suggestion','evidence','표의 헤더에 빈 셀이 있습니다.','열 제목을 입력하거나 장식용 빈칸인지 확인하세요.');
    }
    const geometry=rect(el);
    if(!geometry||geometry.w<=0||geometry.h<=0)add(pi,id,'INVALID_GEOMETRY','critical','layout','요소의 위치·크기 값이 잘못되었습니다.','크기·좌표를 확인하세요.');
    else if(geometry.x<0||geometry.y<0||geometry.x+geometry.w>C.WIDTH+1||geometry.y+geometry.h>C.HEIGHT+1)add(pi,id,'OUTSIDE_SLIDE','critical','layout','요소가 16:9 슬라이드 바깥으로 벗어납니다.','캔버스 안으로 옮기거나 크기를 줄이세요.');
    if(['text','title','quote','bullet'].includes(el.type)&&geometry&&geometry.w>0&&geometry.h>0){
     const size=Math.max(12,finite(style.size)||20),lineHeight=Math.max(0.8,finite(style.lineHeight)||1.3);
     const charRows=txt.split('\n').reduce((n,line)=>n+Math.max(1,Math.ceil(line.length/Math.max(1,geometry.w/(size*0.72)))),0);
     if(charRows*size*lineHeight>geometry.h*1.17)add(pi,id,'TEXT_DENSITY','suggestion','access','텍스트가 프레임보다 길어 잘릴 수 있습니다.','문장을 나누거나 폰트/줄간격/박스 높이를 조절하세요.');
    }
    if(READABLE_TYPES.has(el.type)){
     const fg=str(style.color),bg=str(style.background);
     const contrast=C?.contrastRatio?.(fg,bg);
     if(contrast!==null&&contrast!==undefined){const large=(finite(style.size)||20)>=24||((finite(style.size)||20)>=19&&finite(style.weight)>=700);
      if(contrast<(large?3:4.5))add(pi,id,'LOW_CONTRAST','review','access','글자와 직접 지정 배경의 대비가 낮습니다.','본문은 일반 글씨 4.5:1, 큰 글씨 3:1 대비를 기준으로 확인하세요.');
     }
    }
    if(el.type==='image'){
     if(!str(d.src).startsWith('data:image/'))add(pi,id,'IMAGE_EMPTY','review','access','이미지 원본이 연결되지 않았습니다.','로컬 이미지 파일을 다시 지정하세요.');
     if(!sane(d.alt)&&!d.decorative)add(pi,id,'IMAGE_ALT','suggestion','access','이미지 대체 설명이 없습니다.','의미 있는 사진·도표에는 대체 설명을 입력하세요.');
    }
    const effects=Array.isArray(el.effects)?el.effects:[];
    if(effects.some(e=>COSTLY_EFFECTS.has(str(e?.kind))))costlyMotionLayers++;
    if(effects.length>3)add(pi,id,'MOTION_STACK','critical','motion','요소 모션이 최대 3개를 초과합니다.','3개 이하로 정리하고 다른 단계는 페이지 전환으로 분리하세요.');
    const totalMotion=effects.reduce((sum,e)=>sum+(finite(e?.duration)||0)+(finite(e?.delay)||0),0);
    if(totalMotion>15000)add(pi,id,'LONG_MOTION','suggestion','motion','한 요소의 등장 모션이 15초를 넘습니다.','모션 지연을 줄이거나 보고서 재생에서 기다림이 적절한지 확인하세요.');
   });
   if(costlyMotionLayers>5)add(pi,null,'MOTION_BUDGET','suggestion','motion',`${costlyMotionLayers}개 요소에 화면 처리 비용이 상대적으로 높은 모션이 포함됩니다.`, '실제 프레임률은 측정되지 않았습니다. 동시 재생 수, 저사양 모드, 숨겨진 탭 정지를 수기 확인하세요.');
   // Surface major collisions only among content peers; overlays on decorative shapes
   // and deliberate text-on-card containments are not treated as certain errors.
   let overlapChecks=0;
   for(let a=0;a<visible.length&&overlapChecks<12;a++)for(let b=a+1;b<visible.length&&overlapChecks<12;b++){
    const left=visible[a],right=visible[b],r1=rect(left),r2=rect(right);
    if(!r1||!r2||!r1.w||!r2.w||!r1.h||!r2.h)continue;
    if(['shape','divider'].includes(left.type)||['shape','divider'].includes(right.type))continue;
    if(left.groupId&&left.groupId===right.groupId)continue;
    if(!(READABLE_TYPES.has(left.type)&&READABLE_TYPES.has(right.type))&&!(METRIC_TYPES.has(left.type)&&METRIC_TYPES.has(right.type)))continue;
    const area1=r1.w*r1.h,area2=r2.w*r2.h;
    if(area1<2500||area2<2500)continue;
    const ratio=overlap(r1,r2);
    if(ratio>0.55&&ratio<0.97){overlapChecks++;add(pi,left.id,'BLOCK_OVERLAP','suggestion','layout','내용 요소끼리 크게 겹쳐 일부가 가려질 수 있습니다.','의도적인 겹침인지 확인하고, 필요하면 두 요소의 위치·레이어 순서를 바꾸세요.',right.id);}
   }
  });
  for(const pg of pages)pg.issueCount=pageIssueTotals.get(pg.index)||0;
  issues.sort((a,b)=>SEVERITIES.indexOf(a.severity)-SEVERITIES.indexOf(b.severity)||a.pageIndex-b.pageIndex||a.rule.localeCompare(b.rule));
  return {version:'quality-v021',title:sane(project.title,130)||'제목 없음',mode:project.storyType||'strategy',pages,issues,counts,categoryCounts,total,truncated:Math.max(0,total-issues.length),scope:'구조·근거 입력 여부에 대한 안내입니다. 사실·저작권·수치 정확도를 자동으로 증명하지 않습니다.'};
 }
 function formatTxt(result){
  if(!result||!Array.isArray(result.issues))throw Error('Quality review result missing');
  const lines=['DoCut 보고서 품질 점검 · 자동 진단 (사용자 확인 필요)',result.title,'유형: '+result.mode,'',result.scope,'','[요약]',
   '페이지 '+result.pages.length+' · 총 권고 '+result.total+' · 우선 확인 '+result.counts.critical+' · 검토 필요 '+result.counts.review+' · 개선 제안 '+result.counts.suggestion];
  if(result.truncated)lines.push('화면 표시 한도 초과: 추가 '+result.truncated+'건은 생략됨');
  lines.push('','[스토리보드 · 현재 / 권장]');
  for(const pg of result.pages)lines.push(`${pg.index+1}쪽 | 현재 ${sane(pg.title)} | 권장 역할 ${sane(pg.suggested)} | 핵심 질문 ${sane(pg.question)} | 요소 ${pg.visible}/${pg.elements} | 출처 ${pg.sourceCount} | 사용자검증표시 ${pg.verifiedCount} | 점검 ${pg.issueCount}`);
  lines.push('','[문제 및 점검 제안]');
  for(const i of result.issues)lines.push(`${i.pageIndex+1}쪽 | ${SEVERITY_NAME[i.severity]} | ${CATEGORY_NAME[i.category]} | ${sane(i.rule)} | ${sane(i.id,90)||'페이지'}${i.relatedId?' ↔ '+sane(i.relatedId,90):''} | ${sane(i.message,200)} | ${sane(i.hint,250)}`);
  lines.push('','보고서의 진위·품질 점수·완성률을 나타내지 않습니다. 사용자가 반드시 원자료와 슬라이드를 직접 확인해야 합니다.');
  return lines.join('\n');
 }
 function formatCsv(result){
  if(!result||!Array.isArray(result.issues))throw Error('Quality review result missing');
  // CSV is opened by spreadsheet software: quote every cell, and neutralize
  // formulas or command-like prefixes, including after whitespace.
  const csvCell=value=>{const original=str(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,' ');
   const safe=/^[\s]*[=+\-@]/.test(original)?"'"+original:original;
   return '"'+safe.replace(/"/g,'""')+'"';};
  const columns=['페이지','페이지 제목','우선순위','분류','규칙','요소 ID','관련 요소 ID','진단 의견','확인 안내'];
  const rows=[columns,...result.issues.map(i=>[i.pageIndex+1,result.pages[i.pageIndex]?.title||'',SEVERITY_NAME[i.severity],CATEGORY_NAME[i.category],i.rule,i.id||'',i.relatedId||'',i.message,i.hint])];
  return '\ufeff'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n';
 }
 function aiChecklist(result){
  if(!result||!Array.isArray(result.issues))throw Error('Quality review result missing');
  const selected=result.issues.slice(0,80);
  return ['DoCut 편집 프로젝트 품질 개선 요청 (진단 결과 기반)',
   '입력 문서의 확인된 내용과 ID, 데이터, 출처, 기준일, 근거, 검증 표시를 임의로 변경하지 마세요.',
   '아래 목록은 자동 진단이며 사실 오류 판정이 아닙니다. 먼저 원자료 확인이 필요한 부분을 질문하고, 레이아웃/표현 개선만 제안하세요.',
   '보고서 형태는 16:9 한 화면에 한 페이지, 기승전결/근거→비교→권고→실행, 최대 요소 모션 3개로 유지하세요.',
   '수치·통계 원자료를 창작하지 말고 미확인 항목은 [자료 확인 필요]로 남기세요.',
   '사용자 승인 없이 기존 문서 전체를 덮어쓰지 마세요. 수정 가능한 경우 schema=3 JSON을 페이지별 검토 가능하게 제시하세요.',
   '',`제목: ${result.title}`,'[현재/권장 페이지 역할]',...result.pages.map(p=>`${p.index+1}. ${p.title} / ${p.suggested} / 질문: ${p.question}`),
   '',`[진단 ${result.total}건 중 앞 ${selected.length}건]`,...selected.map(i=>`${i.pageIndex+1}쪽 ${SEVERITY_NAME[i.severity]}: ${i.message} — ${i.hint}`),
   '', '이 요청에는 프로젝트 원본 JSON이 포함되지 않습니다. 실제 편집하려면 사용자가 별도로 프로젝트 데이터를 제공해야 합니다.'].join('\n');
 }
 // Side-by-side diagnostics are NOT a measure of visual similarity or factual truth.
 // Compare candidates independently: importing may change the narrative page count.
 function compare(before,after){const current=analyze(before),candidate=analyze(after);const changes={};
  for(const severity of SEVERITIES)changes[severity]=candidate.counts[severity]-current.counts[severity];
  return {current:{pages:current.pages.length,total:current.total,counts:current.counts},candidate:{pages:candidate.pages.length,total:candidate.total,counts:candidate.counts},changes,comparable:'independent-candidate-only',note:'진단 항목 수 차이는 품질 점수·원본 디자인 일치율·사실 확인 결과가 아닙니다.'};
 }
 const api={analyze,compare,filter:issuesFilter,formatTxt,formatCsv,aiChecklist,SEVERITY_NAME,CATEGORY_NAME,MAX_ISSUES};
 root.DocutQualityReview=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
