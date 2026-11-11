/* FIN-16 / UBS 2025: transactional XLSX-to-source-SVG chart insets.
 * The original 6 PDF-vector pages remain immutable; no blank overlay appears
 * until a human explicitly selects the numeric column and reviews the data.
 */
(function(root){
'use strict';
const C=root.DocutCore,W=root.DocutWorkbook,A=root.DocutAnalytics,DM=root.DocutDataMotion,
 M=root.DocutLargeDataset,T=root.DocutTemplateDataMapper;
// UBS palette must exist before the normalizer processes chart data, even when
// other reference packs or the exported HTML runtime use custom palettes.
C.CHART_PALETTES={...(C.CHART_PALETTES||{}),ubs:(C.CHART_PALETTES||{}).ubs||
 ['#94752F','#AB914E','#BFA96A','#776128','#D0BC87','#675420']};
const copy=x=>JSON.parse(JSON.stringify(x));
const SLOTS=Object.freeze({13:'자산 분포 · 직접 지정한 숫자열',16:'자산 집계 · 직접 지정한 숫자열'});
function scope(project,options={}){
 if(!project||!Array.isArray(project.pages)||!Array.isArray(project.datasets))throw Error('UBS 보고서 프로젝트가 올바르지 않습니다.');
 const all=project.pages.filter(p=>p.designIdentity==='FIN-16');
 const group=String(options.packInstanceId||'');
 if(group){
  const pages=all.filter(p=>p.designPackId===group);
  if(!pages.length)throw Error('선택한 UBS 6페이지 묶음을 찾지 못했습니다.');
  return pages;
 }
 const ids=new Set(all.map(p=>p.designPackId).filter(Boolean));
 if(ids.size>1||ids.size===1&&all.some(p=>!p.designPackId))
  throw Error('UBS 묶음이 여럿입니다. 편집 중인 6페이지 묶음을 선택하세요.');
 if(ids.size===0&&all.length>6){
  const id=String(options.currentPageId||'');
  const selected=project.pages.findIndex(p=>p.id===id);
  if(selected<0||project.pages[selected].designIdentity!=='FIN-16')throw Error('구버전 UBS 페이지를 먼저 선택하세요.');
  let first=selected;
  while(first>0&&project.pages[first-1].designIdentity==='FIN-16'&&!project.pages[first-1].designPackId)first--;
  const at=first+Math.floor((selected-first)/6)*6;
  return project.pages.slice(at,at+6).filter(p=>p.designIdentity==='FIN-16'&&!p.designPackId);
 }
 if(!all.length)throw Error('UBS FIN-16 템플릿을 찾지 못했습니다.');
 return all;
}
function slotRect(page,frame){
 const n=page?.referenceFidelity?.sourcePage;
 if(page.designIdentity!=='FIN-16'||page.referenceFidelity?.sourceEdition!=='2025'||
  page.referenceFidelity?.mode!=='source-ratio'||!Object.hasOwn(SLOTS,n))return null;
 const rect=A?.ubsSlot?.(page,frame);
 if(!rect||!['x','y','w','h'].every(k=>Number.isFinite(rect[k]))||rect.w<200||rect.h<100||
  rect.x<0||rect.y<0||rect.x+rect.w>C.WIDTH||rect.y+rect.h>C.HEIGHT)return null;
 return rect;
}
function occupied(page,rect){
 return (page.elements||[]).some(e=>{
  if(!e||!['bar','line','donut','table','stat'].includes(e.type))return false;
  const w=Math.max(0,Math.min(rect.x+rect.w,e.x+e.w)-Math.max(rect.x,e.x));
  const h=Math.max(0,Math.min(rect.y+rect.h,e.y+e.h)-Math.max(rect.y,e.y));
  return w*h/(rect.w*rect.h)>.35;
 });
}
function targets(pages,frame){
 return pages.flatMap(page=>{
  const rect=slotRect(page,frame);
  if(!rect||occupied(page,rect)||!Array.isArray(page.elements)||page.elements.length>=120)return [];
  const n=page.referenceFidelity.sourcePage;
  return [{id:'ubs-chart-'+page.id+'-'+n,pageId:page.id,pageName:page.tab,
   type:'bar',text:SLOTS[n],virtual:true,placeholder:true,...rect}];
 });
}
function blockFor(entry){
 const block=C.makeBlock('bar',entry.x,entry.y,{
  w:entry.w,h:entry.h,text:entry.text,locked:false,hidden:false,verified:false,
  effects:[],source:'',unit:'',evidence:'',asOfDate:'',
  style:{background:'#FFFFFF',color:'#24282D',font:'Arial',size:18,
   radius:0,shadow:0,opacity:1,borderWidth:0},
  data:{labels:['범주 A','범주 B'],values:[0,0],palette:'ubs',unit:''}
 });
 return C.normalizeBlock(block);
}
function plan(project,source,options={}){
 if(options.designIdentity!=='FIN-16'||!source||!Array.isArray(source.sheets))throw Error('UBS/엑셀 데이터가 올바르지 않습니다.');
 const pages=scope(project,options);
 if(pages.some(page=>page.referenceFidelity?.mode!=='source-ratio'||page.referenceFidelity.sourceEdition!=='2025'))
  throw Error('UBS 원본 비율 SVG 2025 페이지에만 6페이지 차트 연결이 가능합니다.');
 const items=targets(pages,project.frame),packInstanceId=String(options.packInstanceId||'');
 if(!items.length)throw Error('UBS 13·16쪽의 차트 영역이 이미 사용 중이거나 해당 페이지가 없습니다.');
 const sheetId=String(options.sheetId||''),sheet=source.sheets.find(s=>s.id===sheetId);
 if(!sheet)throw Error('엑셀 시트를 선택하세요.');
 const range=String(options.range||'');W.range(range);
 if(options.analysisMode==='histogram')throw Error('UBS 원본 차트 슬롯에서는 히스토그램으로 지표 의미를 바꾸지 않습니다.');
 const analysisMode=['raw','group','cumulative'].includes(options.analysisMode)?options.analysisMode:'raw';
 const aggregate=['sum','mean','count','min','max','median','last'].includes(options.aggregate)?options.aggregate:'sum';
 const {stats,candidates}=T.candidateColumns(source,sheetId,range,{...options,header:options.header===true});
 const numericColumns=candidates.map(c=>({index:c.index,name:c.name,numeric:c.numeric}));
 const manual=options.manualOverrides&&typeof options.manualOverrides==='object'&&!Array.isArray(options.manualOverrides)?options.manualOverrides:{};
 const suggestions=[],skipped=[];
 for(const slot of items){
  const key=slot.pageId+':'+slot.id,value=manual[key];
  if(stats.labelConfidence==='unconfirmed-numeric-dimension'){
   skipped.push({pageId:slot.pageId,blockId:slot.id,reason:'범주열이 숫자입니다. 범주 열 번호를 먼저 직접 지정하세요.'});
   continue;
  }
  if(value==null||value===''){
   skipped.push({pageId:slot.pageId,blockId:slot.id,reason:'UBS 차트는 자동 수치 매칭하지 않습니다. 값 열을 직접 지정해야 합니다.'});
   continue;
  }
  const i=Number(value),column=Number.isInteger(i)?candidates.find(c=>c.index===i):null;
  if(!column){
   skipped.push({pageId:slot.pageId,blockId:slot.id,reason:'지정한 값 열이 선택 범위에 없거나 범주 열과 같습니다.'});
   continue;
  }
  suggestions.push({...slot,labelColumn:stats.labelColumn,valueColumn:i,
   columnName:column.name,confirmed:true,matchScore:0,matchReason:'writer-selected-ubs'});
 }
 const common={family:'FIN-16',packInstanceId,sheetId,range,reviewSlots:items,numericColumns,
  skipped,analysisMode,aggregate,mode:analysisMode,previewSampleRows:stats.sampleRows,
  labelColumn:stats.labelColumn,labelConfidence:stats.labelConfidence};
 if(options.previewOnly===true)return {...common,suggestions};
 if(!suggestions.length)throw Error('UBS 원본 차트는 범주열을 확인하고 각 그래프의 값 열을 직접 지정한 뒤 검토해야 합니다.');
 if(root.DocutUBSVectorSource?.status!=='ready')throw Error('UBS 원본 SVG 6페이지가 완전히 로드된 뒤에만 엑셀 차트를 삽입할 수 있습니다. 템플릿 창에서 원본 벡터 상태를 확인하세요.');
 if(source.warnings?.some(w=>/대용량 (?:Excel|엑셀|원본)/.test(w)&&/(?:결과만|선택|보존)/.test(w)))
  throw Error('대용량 파생 결과를 원본으로 취급할 수 없습니다. XLSX를 다시 업로드하세요.');
 const sourceCells=source.sheets.reduce((n,s)=>n+s.cells.length,0);
 const original=project.datasets.find(d=>d.id===source.id);
 if(!original&&project.datasets.length>=10)throw Error('원본 데이터는 보고서당 10개까지 저장합니다.');
 if(original&&sourceCells>M.NATIVE_CELLS)throw Error('기존 대용량 데이터에 신규 연결할 수 없습니다. 원본 파일을 새 ID로 불러오세요.');
 const updates=[],derived=[],problems=skipped.slice();
 for(const entry of suggestions){
  const page=pages.find(p=>p.id===entry.pageId),snapshot=JSON.stringify(page);
  let block=blockFor(entry);
  // Render the writer-selected, original Excel header rather than a generic
  // metric placeholder; do not infer units or facts from the company template.
  block.text=(entry.text.split(' · ')[0]+' · '+entry.columnName).slice(0,100);
  const origin=(source.fileName+' / '+sheet.name+'!'+range+' / '+entry.columnName+' · UBS 차트 작성자 열 지정').slice(0,480);
  const binding=DM.binding({datasetId:source.id,sheetId,range,labelColumn:entry.labelColumn,
   valueColumn:entry.valueColumn,header:true,sort:'source',analysisMode,aggregate,origin});
  try{
   const values=DM.values(source,binding);
   block=DM.materialize(block,source,binding);
   if(sourceCells>M.NATIVE_CELLS){
    const result=M.prepare(source,binding,'bar',block,values);
    if(result.mode!=='analysis-only')throw Error('선택 데이터 저장 모드 오류');
    const one=copy(result.dataset.sheets[0]),id='ubs-chart-'+(derived.length+1);
    one.id=id;one.name=(sheet.name+' '+entry.columnName).slice(0,99);derived.push(one);
    const small={...result.dataset,sheets:[{...result.dataset.sheets[0],id}]};
    const smallBinding=DM.binding({...result.block.dataBinding,sheetId:id,origin:origin+' · 계산 결과'});
    block=DM.materialize(result.block,small,smallBinding);
   }
   updates.push({pageId:entry.pageId,blockId:entry.id,pageName:entry.pageName,
    columnName:entry.columnName,kind:'bar',confirmed:true,matchScore:0,
    matchReason:'writer-selected-ubs',virtual:true,block,originalSnapshot:snapshot,
    area:{x:entry.x,y:entry.y,w:entry.w,h:entry.h}});
  }catch(error){
   problems.push({pageId:entry.pageId,blockId:entry.id,reason:String(error?.message||error).slice(0,250)});
  }
 }
 if(!updates.length)throw Error('UBS 원본 자료 값·범위 전체 검증을 통과하지 못했습니다: '+problems.map(p=>p.reason).slice(0,3).join(' / '));
 const stored=sourceCells<=M.NATIVE_CELLS?DM.dataset(source):DM.dataset({
  id:source.id,kind:'csv',fileName:source.fileName,importedAt:source.importedAt||new Date().toISOString(),
  lastModified:source.lastModified??null,date1904:false,sheets:derived,
  warnings:['UBS 연계 엑셀 '+sourceCells+'셀에서 검토한 계산 결과 '+updates.length+'개 차트만 저장합니다.',
   '원본 XLSX는 별도 보관하고 새로운 범위 분석 시 재업로드하세요.']});
 return {...common,sourceCells,storedCells:stored.sheets.reduce((n,s)=>n+s.cells.length,0),
  dataset:stored,updates,skipped:problems,mode:sourceCells<=M.NATIVE_CELLS?'original-cells':'derived-results'};
}
function apply(project,proposal){
 if(!proposal||proposal.family!=='FIN-16'||!Array.isArray(proposal.updates)||!proposal.updates.length||
  !proposal.dataset||!Array.isArray(project?.pages)||!Array.isArray(project?.datasets))
  throw Error('UBS에 적용할 검토된 데이터가 없습니다.');
 const next=copy(project),index=next.datasets.findIndex(d=>d.id===proposal.dataset.id);
 if(index>=0){
  if(JSON.stringify(next.datasets[index])!==JSON.stringify(proposal.dataset))
   throw Error('원본 데이터가 검토 후 변경되어 적용하지 않았습니다.');
 }else{
  if(next.datasets.length>=10)throw Error('원본 데이터 저장 한도를 초과했습니다.');
  next.datasets.push(copy(proposal.dataset));
 }
 const seen=new Set();
 for(const item of proposal.updates){
  const page=next.pages.find(p=>p.id===item.pageId),slot=page&&slotRect(page,next.frame);
  if(!page||page.designIdentity!=='FIN-16'||(proposal.packInstanceId&&page.designPackId!==proposal.packInstanceId)||
   seen.has(page.id)||!slot||page.elements.length>=120||occupied(page,slot)||
   JSON.stringify(page)!==item.originalSnapshot||
   !['x','y','w','h'].every(k=>Math.abs(slot[k]-item.area?.[k])<.001&&Math.abs(slot[k]-item.block?.[k])<.001)||
   item.block?.type!=='bar'||item.block?.dataBinding?.datasetId!==proposal.dataset.id)
   throw Error('UBS 원본 차트/페이지가 검토 후 변경됐습니다. 추가하지 않고 다시 검토하세요.');
  seen.add(page.id);
  page.elements.push(copy(item.block));
 }
 return C.normalizeProject(next);
}
const api=Object.freeze({scope,slotRect,occupied,targets,blockFor,plan,apply});
root.DocutUBSPackMapper=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
