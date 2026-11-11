(function(root){
'use strict';
// Conservative multi-page Excel-to-authored-chart matching.
// No arbitrary numeric column guessing: an exact, explainable header match
// is required even when there is only one numeric column.
const C=root.DocutCore,W=root.DocutWorkbook,DM=root.DocutDataMotion,A=root.DocutAnalytics,M=root.DocutLargeDataset,S=root.DocutChartSlotMapper;
const copy=x=>JSON.parse(JSON.stringify(x));
const IGNORE=new Set(['실제','실측','엑셀','연결','차트','그래프','데이터','자료','입력','결과','원본','시트','분석','비교','검토','기준','기간','분기','분기별','연도','연도별','연간','월별','추이','시계열','항목별','확인','업로드','단위','주요','보고서','지표','현황','변화','및','조사','비중','금액','값','total','data','value','chart','trend','series','actual','source','review','figure','quarter','quarterly','annual','report','metrics','지역','지역별','추세','전망','요인','분포','시각화','업데이트','추천','성장률비교']);
// Narrow bilingual metric terms. Deliberately omit broad, ambiguous words
// such as performance, return or value to avoid cross-mapping unrelated KPIs.
const METRIC_ALIASES=Object.freeze({
 '매출':['revenue','sales'], '이익':['profit','earnings'], '수익':['profit','earnings'],
 '회수':['exit','realization','realisation'], '투자':['investment','capex'], '거래':['deals','deal','transaction','transactions'],
 '비용':['expense','expenses','cost'], '원가':['cost'],
 '성장':['growth'], '위험':['risk'], '물가':['inflation'],
 '배출':['emissions','emission'], '자원':['resource','resources'],
 '생산':['production'], '인도':['delivery','deliveries'],
 '설비':['capex'], '고객':['customer','customers']
});
// Report-chart auto binding is intentionally stricter than keyword search.
// Exact metric words win; inferred matches must explain *every* substantive
// part of the title (e.g. "투자 거래" cannot match an "투자 회수" column).
// High-precision compound names whose business meanings are unambiguous.
// Exact aliases supplement, rather than replace, the token-based confidence gate.
const COMPOUND_ALIASES=Object.freeze({
 '투자 거래':['investment','investment deals','investment transactions'],
 '매출액':['revenue','sales','net sales'],
 '영업이익':['operating profit','operating income'],
 '매출총이익':['gross profit'],
 '영업비용':['operating expenses','operating costs'],
 '운영비용':['operating expenses','operating costs'],
 '영업현금흐름':['operating cash flow'],
 '영업이익률':['operating margin'],
 '이익률':['profit margin','margin'],
 '물가상승률':['inflation','inflation rate'],
 '성장률':['growth rate','growth'],
 '배출량':['emissions'],
 '총자산':['total assets'],
 '순이익':['net income','net profit'],
 '현금흐름':['cash flow']
});
const SAFE_SUFFIXES=new Set(['액','금액','총액','수','율','률','비율','비중','합계','s','es']);
const SAFE_PREFIXES=new Set(['영업','총','순','당기','누적','연간','분기','월간','전체','글로벌']);
const RISKY_METRICS=new Set(['원가','비용','수익','이익','손실','회수','매출','투자','성장','금리','배출','생산','매입','물가','환율','cost','profit','earnings','growth','loss','revenue','sales','investment','capex','exit','risk','inflation','expense']);
function terms(value){
 return [...new Set(String(value||'').normalize('NFKC').toLowerCase()
  .split(/[^\p{L}\p{N}]+/u)
  .map(t=>t.replace(/^(?:전년|사업부별|지역별|기간별|항목별)/,''))
  .filter(t=>t.length>=2&&!IGNORE.has(t)))];
}
function wordMatch(title,header){
 if(title===header)return {score:6,reason:'exact'};
 if(METRIC_ALIASES[title]?.includes(header)||METRIC_ALIASES[header]?.includes(title))return {score:5,reason:'alias'};
 if(title.length<2||header.length<2)return {score:0,reason:'none'};
 if(header.startsWith(title)&&SAFE_SUFFIXES.has(header.slice(title.length)))return {score:4,reason:'suffix'};
 if(header.endsWith(title)&&SAFE_PREFIXES.has(header.slice(0,header.length-title.length)))return {score:4,reason:'prefix'};
 return {score:0,reason:'none'};
}
function metricUnit(value){
 const s=String(value??'').normalize('NFKC').toLowerCase();
 if(/[%％]|\b(?:percent|percentage|pct)\b|퍼센트/.test(s))return 'ratio';
 if(/[$₩€¥]|\b(?:usd|krw|eur|jpy|dollars?|won)\b|(?:억원|만원|천원|원|달러|유로)/.test(s))return 'currency';
 if(/\b(?:persons?|people|users?|employees?)\b|(?:명|인원|사람)/.test(s))return 'persons';
 return null;
}
function evidence(slotTitle,header){
 const a=terms(slotTitle),b=terms(header);
 const leftUnit=metricUnit(slotTitle),rightUnit=metricUnit(header);
 if(leftUnit&&rightUnit&&leftUnit!==rightUnit)return {score:0,coverage:0,reason:'conflicting units: '+leftUnit+' / '+rightUnit};
 const compound=COMPOUND_ALIASES[a.join(' ')]||(a.length===1?COMPOUND_ALIASES[a[0]]:null);
 if(compound?.includes(b.join(' ')))return {score:6,coverage:1,reason:'precise bilingual metric'};
 if(!a.length||!b.length)return {score:0,coverage:0,reason:'no metric words'};
 const matched=[],unmatched=[],used=new Set();
 for(const t of a){
  const hits=b.map((h,i)=>({...wordMatch(t,h),from:t,to:h,index:i}))
   .filter(x=>!used.has(x.index)).sort((x,y)=>y.score-x.score);
  if(hits[0]?.score>0){matched.push(hits[0]);used.add(hits[0].index);}
  else unmatched.push(t);
 }
 const coverage=matched.length/a.length;
 if(coverage<1)return {score:0,coverage,reason:'title tokens missing: '+unmatched.join(', ')};
 for(const word of b){
  if(!RISKY_METRICS.has(word))continue;
  if(matched.some(m=>word===m.to||word===m.from||wordMatch(m.from,word).score>=4))continue;
  return {score:0,coverage,reason:'different additional metric: '+word};
 }
 return {score:matched.reduce((n,x)=>n+x.score,0),coverage,reason:matched.map(x=>x.reason).join('+')};
}
function similarity(slotTitle,header){return evidence(slotTitle,header).score;}
function candidateColumns(source,sheetId,range,options={}){
 const stats=A.suggest(source,sheetId,range);
 if(!stats.header&&options.header!==true)throw Error('자동 매핑은 제목 행이 필요합니다. 첫 행에 범주와 숫자 열 제목을 넣고 재시도하세요.');
 if(Object.prototype.hasOwnProperty.call(options,'labelColumn')){
  const explicit=Number(options.labelColumn);
  if(!Number.isInteger(explicit)||!stats.columns.some(c=>c.index===explicit))throw Error('작성자가 선택한 범주 열이 유효하지 않습니다. 범위 내 열 번호를 다시 확인하세요.');
  stats.labelColumn=explicit;
  stats.labelConfidence='writer-selected';
 }
 const candidates=stats.columns.filter(c=>c.index!==stats.labelColumn);
 if(!candidates.length)throw Error('범주 이외의 데이터 열이 없습니다.');
 const numeric=candidates.filter(c=>c.numeric);
 return {stats,numeric,candidates};
}
function match(slots,source,sheetId,range,options={}){
 if(!Array.isArray(slots)||!slots.length)return {mappings:[],skipped:[]};
 const {stats,numeric,candidates}=candidateColumns(source,sheetId,range,options);
 const result=[],skipped=[];
 const overrides=options.manualOverrides&&typeof options.manualOverrides==='object'&&!Array.isArray(options.manualOverrides)?options.manualOverrides:{};
 if(stats.labelConfidence==='unconfirmed-numeric-dimension'){
  return {mappings:[],skipped:slots.map(slot=>({pageId:slot.pageId,blockId:slot.id,reason:'범주 열이 모두 숫자인 표에서 확인되지 않았습니다. 범주 열 번호를 직접 선택하고 다시 검토하세요.'})),
   numericColumns:candidates.map(c=>({index:c.index,name:c.name,numeric:c.numeric})),
   detectedHeader:stats.header,previewSampleRows:stats.sampleRows,labelColumn:stats.labelColumn,labelConfidence:stats.labelConfidence};
 }
 for(const slot of slots){
  const key=slot.pageId+':'+slot.id,manual=overrides[key];
  if(manual!=null&&manual!==''){
   const index=Number(manual),found=Number.isInteger(index)?candidates.find(c=>c.index===index):null;
   if(!found)skipped.push({pageId:slot.pageId,blockId:slot.id,reason:'직접 지정한 열이 변경되었거나 범위에 없습니다. 다시 선택하세요.'});
   else result.push({...slot,labelColumn:stats.labelColumn,valueColumn:found.index,columnName:found.name,matchScore:0,matchReason:'user-confirmed',confirmed:true});
   continue;
  }
  const scored=numeric.map(c=>({...c,evidence:evidence(slot.text,c.name)}))
   .sort((a,b)=>b.evidence.score-a.evidence.score||a.index-b.index);
  const winner=scored[0],runner=scored[1];
  if(!winner||winner.evidence.score<4){
   skipped.push({pageId:slot.pageId,blockId:slot.id,reason:'차트 제목에 의미상 일치하는 수치 열이 없습니다. 자동 연결 대신 개별 지정하세요.'});
   continue;
  }
  // Avoid ambiguous columns, including a near-exact second match.
  if(runner&&runner.evidence.score>0&&winner.evidence.score-runner.evidence.score<2){
   skipped.push({pageId:slot.pageId,blockId:slot.id,reason:'비슷한 수치 열 둘 이상이 있습니다: '+winner.name+' / '+runner.name+'. 직접 선택하세요.'});
   continue;
  }
  result.push({...slot,labelColumn:stats.labelColumn,valueColumn:winner.index,
   columnName:winner.name,matchScore:winner.evidence.score,matchReason:winner.evidence.reason});
 }
 return {mappings:result,skipped,numericColumns:candidates.map(c=>({index:c.index,name:c.name,numeric:c.numeric})),detectedHeader:stats.header,previewSampleRows:stats.sampleRows,labelColumn:stats.labelColumn,labelConfidence:stats.labelConfidence};
}
function plan(project,source,options={}){
 if(!project||!Array.isArray(project.pages)||!Array.isArray(project.datasets)||!source||!Array.isArray(source.sheets))throw Error('보고서 또는 엑셀 데이터가 잘못되었습니다.');
 const family=String(options.designIdentity||'');
 const packInstanceId=String(options.packInstanceId||'');
 if(!/^(?:STR|EARN|CORP|FIN|PUB)-\d{2}$/.test(family))throw Error('전문 보고서 템플릿을 선택한 뒤 연결하세요.');
 const sheetId=String(options.sheetId||''),selected=source.sheets.find(sh=>sh.id===sheetId);
 if(!selected)throw Error('자동 매핑할 엑셀 시트를 선택하세요.');
 const range=String(options.range||'');
 W.range(range); // prevent injection and invalid A1 syntax
 if(options.analysisMode==='histogram')throw Error('분포 히스토그램은 보고서 차트별 개별 연결에서 사용하세요. 6페이지 자동 매핑이 원래 지표를 빈도 그래프로 바꾸지 않도록 차단했습니다.');
 const analysisMode=['raw','group','cumulative'].includes(options.analysisMode)?options.analysisMode:'raw';
 const aggregate=['sum','mean','count','min','max','median','last'].includes(options.aggregate)?options.aggregate:'sum';
 const familyPages=project.pages.filter(p=>p.designIdentity===family);
 const groupIds=new Set(familyPages.map(p=>p.designPackId).filter(Boolean));
 let scoped=familyPages;
 if(packInstanceId)scoped=familyPages.filter(p=>p.designPackId===packInstanceId);
 else if(groupIds.size>1||groupIds.size===1&&familyPages.some(p=>!p.designPackId)){
  throw Error('같은 회사 템플릿 묶음이 여럿입니다. 현재 페이지에서 해당 묶음만 선택한 뒤 다시 시도하세요.');
 }else if(groupIds.size===0&&familyPages.length>6){
  // Legacy saved documents may not have a persistent pack ID.
  // Partition contiguous same-family pages into six-page groups from the
  // currently selected page; never accidentally overwrite other packs.
  const currentId=String(options.currentPageId||'');
  const selectedIndex=project.pages.findIndex(pg=>pg.id===currentId);
  if(selectedIndex<0||project.pages[selectedIndex].designIdentity!==family)throw Error('구버전 보고서는 현재 작업할 페이지를 먼저 지정해야 합니다.');
  let runStart=selectedIndex;
  while(runStart>0&&project.pages[runStart-1].designIdentity===family&&!project.pages[runStart-1].designPackId)runStart--;
  const beginning=runStart+Math.floor((selectedIndex-runStart)/6)*6;
  scoped=project.pages.slice(beginning,beginning+6).filter(p=>p.designIdentity===family&&!p.designPackId);
 }
 if(!scoped.length)throw Error('선택한 템플릿 묶음을 찾지 못했습니다. 페이지를 다시 선택하세요.');
 const targets=scoped.flatMap(page=>
  S.list(page).filter(s=>s.placeholder).map(s=>({...s,pageId:page.id,pageName:page.tab})));
 if(!targets.length)throw Error('해당 보고서에서 연결되지 않은 원본 차트 자리를 찾지 못했습니다.');
 const matched=match(targets,source,sheetId,range,{...options,header:options.header===true});
 if(options.previewOnly===true)return {family,packInstanceId,sheetId,range,reviewSlots:targets,
  numericColumns:matched.numericColumns,suggestions:matched.mappings,skipped:matched.skipped,
  mode:analysisMode,aggregate,previewSampleRows:matched.previewSampleRows,labelColumn:matched.labelColumn,labelConfidence:matched.labelConfidence};
 if(!matched.mappings.length)throw Error('차트 제목과 명확하게 연결할 열 제목이 없습니다. 각 차트를 선택해 개별 연결하세요.');
 if(source.warnings?.some(w=>/대용량 (?:Excel|엑셀|원본)/.test(w)&&/(?:결과만|선택|보존)/.test(w)))throw Error('저장된 대용량 파생 결과에서는 원본 열을 추정하지 않습니다. 전체 XLSX를 다시 업로드하세요.');
 const existing=project.datasets.find(ds=>ds.id===source.id),cells=source.sheets.reduce((n,sh)=>n+sh.cells.length,0);
 if(!existing&&project.datasets.length>=10)throw Error('한 보고서는 데이터 원본을 최대 10개까지 보존합니다.');
 if(existing&&cells>M.NATIVE_CELLS)throw Error('이미 연결된 대용량 원본에는 자동 팩 매핑을 추가하지 않습니다. 새 파일로 불러온 뒤 진행하세요.');
 if(cells>M.NATIVE_CELLS&&matched.mappings.length>30)throw Error('대용량 자료의 동시 연결 차트는 30개까지 지원합니다.');
 const results=[],skipped=matched.skipped.slice(),snapshots=[];
 for(const entry of matched.mappings){
  const snapshotCount=snapshots.length;
  const pg=project.pages.find(p=>p.id===entry.pageId),block=S.target(pg,entry.id);
  const provenance=(source.fileName+' / '+selected.name+'!'+range+' / '+entry.columnName+
   (entry.confirmed?' · 작성자가 열을 직접 지정':' · 헤더 의미 자동 연결')).slice(0,480);
  const binding=DM.binding({datasetId:source.id,sheetId,range,labelColumn:entry.labelColumn,
   valueColumn:entry.valueColumn,header:true,sort:'source',aggregate,analysisMode,origin:provenance});
  try{
   const values=DM.values(source,binding);
   const materialized=DM.materialize(block,source,binding);
   if(cells<=M.NATIVE_CELLS)results.push({...entry,block:materialized,originalSnapshot:JSON.stringify(block)});
   else{
    const compact=M.prepare(source,binding,block.type,materialized,values);
    if(compact.mode!=='analysis-only')throw Error('일괄 결과 스냅샷 생성 실패');
    const number=snapshots.length+1,sh=copy(compact.dataset.sheets[0]),derived='auto-'+number;
    sh.id=derived;sh.name=(selected.name+'!'+range+' · '+entry.columnName).slice(0,99);
    snapshots.push(sh);
    const cb=DM.binding({...compact.block.dataBinding,sheetId:derived,
     origin:source.fileName+' / '+selected.name+'!'+range+' / '+entry.columnName+' · 계산 결과'});
    results.push({...entry,block:DM.materialize(compact.block,{...compact.dataset,sheets:[{...compact.dataset.sheets[0],id:derived}]},cb),originalSnapshot:JSON.stringify(block)});
   }
  }catch(error){snapshots.length=snapshotCount;skipped.push({pageId:entry.pageId,blockId:entry.id,reason:String(error.message||error).slice(0,250)});}
 }
 if(!results.length)throw Error('자동 매핑한 차트가 데이터 형식·점수 제한을 통과하지 못했습니다. 제외: '+skipped.map(s=>s.reason).slice(0,3).join(' / '));
 let stored;
 if(cells<=M.NATIVE_CELLS)stored=DM.dataset(source);
 else{
  stored=DM.dataset({id:source.id,kind:'csv',fileName:source.fileName,importedAt:source.importedAt||new Date().toISOString(),
   lastModified:source.lastModified??null,date1904:false,sheets:snapshots,warnings:[
    '대용량 Excel '+cells+'셀에서 명확히 연결된 '+results.length+'개 차트의 계산 결과만 보존했습니다.',
    '원본 통합문서는 별도로 보관하세요. 새로운 범위를 분석하려면 원본 XLSX 재업로드가 필요합니다.'
   ]});
 }
 // Do not overwrite other linked dataset blocks if an old dataset already exists.
 return {family,packInstanceId,sheetId,range,dataset:stored,sourceCells:cells,reviewSlots:targets,numericColumns:matched.numericColumns,
  storedCells:stored.sheets.reduce((n,s)=>n+s.cells.length,0),
  updates:results.map(r=>({pageId:r.pageId,blockId:r.id,block:r.block,columnName:r.columnName,
   pageName:r.pageName,kind:r.type,matchScore:r.matchScore,matchReason:r.matchReason,confirmed:r.confirmed===true,originalSnapshot:r.originalSnapshot})),
  skipped,analysisMode,aggregate,mode:cells<=M.NATIVE_CELLS?'original-cells':'derived-results'};
}
function apply(project,proposal){
 if(!proposal||!proposal.updates?.length||!proposal.dataset)throw Error('적용할 자동 차트 연결 결과가 없습니다.');
 const next=copy(project),existing=next.datasets.findIndex(d=>d.id===proposal.dataset.id);
 if(existing>=0){
  const old=next.datasets[existing];
  if(JSON.stringify(old)!==JSON.stringify(proposal.dataset))throw Error('이미 저장된 자료가 변경되어 자동 연결이 취소됐습니다. 새 자료 ID로 업로드하세요.');
 }else{if(next.datasets.length>=10)throw Error('자료를 더 저장할 수 없습니다.');next.datasets.push(copy(proposal.dataset));}
 for(const item of proposal.updates){
  const page=next.pages.find(p=>p.id===item.pageId);
  if(!page||page.designIdentity!==proposal.family||(proposal.packInstanceId&&page.designPackId!==proposal.packInstanceId))throw Error('페이지 또는 템플릿 묶음이 변경되어 자동 연결을 취소했습니다.');
  const current=S.target(page,item.blockId);
  if(!S.isPlaceholder(current)||item.block.id!==current.id||item.block.type!==current.type||item.originalSnapshot!==JSON.stringify(current))throw Error('검토 후 차트 내용·스타일·위치가 변경돼 적용을 취소했습니다. 다시 검토하세요.');
  page.elements[page.elements.indexOf(current)]=copy(item.block);
 }
 return C.normalizeProject(next);
}
const api=Object.freeze({terms,similarity,evidence,candidateColumns,match,plan,apply});
root.DocutTemplateDataMapper=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
