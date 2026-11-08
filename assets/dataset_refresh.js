(function(root){
'use strict';
// Transactional replacement of one existing XLSX/CSV source and every
// editable chart/table/KPI that is bound to it. Never replace links partially.
const C=root.DocutCore,W=root.DocutWorkbook,DM=root.DocutDataMotion,M=root.DocutLargeDataset;
const copy=x=>JSON.parse(JSON.stringify(x));
function sourceSheet(oldDataset,incoming,oldId){
 const oldSheet=oldDataset.sheets.find(s=>s.id===oldId);
 if(!oldSheet)throw Error('이전 자료의 시트 ID를 찾지 못했습니다: '+oldId);
 const matches=incoming.sheets.filter(s=>String(s.name).toLocaleLowerCase()===String(oldSheet.name).toLocaleLowerCase());
 if(matches.length!==1)throw Error('원본 갱신 중 시트 이름이 일치하지 않습니다: '+oldSheet.name+'. 동일한 시트 이름으로 다시 업로드하거나 차트를 개별 연결하세요.');
 return matches[0];
}
function plan(project,incoming,targetId){
 if(!project||!Array.isArray(project.pages)||!Array.isArray(project.datasets)||!incoming||!Array.isArray(incoming.sheets))throw Error('프로젝트·업로드 자료가 잘못되었습니다.');
 const current=project.datasets.find(ds=>ds.id===targetId);
 if(!current)throw Error('갱신할 기존 자료를 찾지 못했습니다.');
 if(current.sheets.some(s=>s.name.includes('(분석 결과)')||/^derived-\d+$/.test(s.id))||current.warnings?.some(w=>w.includes('대용량 원본')||w.includes('대용량 엑셀')&&w.includes('다른 원본')))throw Error('이 자료는 대용량 원본의 선택 통계 결과만 저장된 자료입니다. 원본 전체를 다시 업로드해 각 차트를 연결하세요.');
 if(!['xlsx','csv'].includes(incoming.kind))throw Error('지원하지 않는 업로드 자료 형식입니다.');
 const refs=[];
 for(const page of project.pages)for(const block of page.elements||[])if(block.dataBinding?.datasetId===targetId){
  if(!['bar','line','donut','table','kpi'].includes(block.type))throw Error('일괄 갱신할 수 없는 개체 종류입니다: '+block.type);
  if(block.locked)throw Error('연결된 개체가 잠겨 있습니다: '+page.tab+' / '+block.id+'. 잠금을 해제한 뒤 갱신하세요.');
  refs.push({pageId:page.id,blockId:block.id,block});
 }
 if(!refs.length)throw Error('이 자료에 연결된 시각화 개체가 없습니다.');
 const source={...incoming,id:targetId};
 const originalCells=source.sheets.reduce((n,s)=>n+s.cells.length,0);
 if(originalCells>W.LIMITS.cells)throw Error('새 엑셀 통합문서가 '+W.LIMITS.cells+'셀을 초과했습니다.');
 if(originalCells>M.NATIVE_CELLS&&refs.length>30)throw Error('대용량 원본 일괄 갱신은 연결 객체 30개까지 지원합니다. 범위를 나누어 처리하세요.');
 const mapped=refs.map(({pageId,blockId,block})=>{
  const sheet=sourceSheet(current,source,block.dataBinding.sheetId);
  const raw={...block.dataBinding,datasetId:targetId,sheetId:sheet.id};
  delete raw.origin; // old derived provenance must never hide the new source.
  const binding=DM.binding(raw),clean={...block,dataBinding:binding};
  const materialized=DM.materialize(clean,source,binding);
  return {pageId,blockId,block:materialized,binding,oldSheetId:block.dataBinding.sheetId,sourceSheetName:sheet.name,sourceRange:block.dataBinding.range,kind:block.type};
 });
 let normalized,updates,mode;
 if(originalCells<=M.NATIVE_CELLS){
  normalized=DM.dataset(source);mode='original-cells';
  updates=mapped.map(link=>({...link,block:DM.materialize(link.block,normalized,link.binding)}));
 }else{
  // Preserve only computed, individually attributed, bounded report data.
  // One sheet per linked chart prevents mixing source ranges or formula caches.
  const sheets=[],plans=[];
  mapped.forEach((link,i)=>{
   const originalValues=DM.values(source,link.binding,{allowText:link.kind==='table'});
   const compact=M.prepare(source,link.binding,link.kind,link.block,originalValues);
   if(compact.mode!=='analysis-only')throw Error('원자료 분석 스냅샷 생성에 실패했습니다.');
   const sheet=copy(compact.dataset.sheets[0]),sheetId='derived-'+(i+1);
   sheet.id=sheetId;
   sheet.name=(link.sourceSheetName+'!'+link.sourceRange+' · 계산 결과').slice(0,99);
   sheets.push(sheet);
   const binding=DM.binding({...compact.block.dataBinding,datasetId:targetId,sheetId,
    origin:source.fileName+' / '+link.sourceSheetName+'!'+link.sourceRange+' · 재업로드한 통계 결과'});
   plans.push({...link,block:compact.block,binding});
  });
  const raw={id:targetId,kind:'csv',fileName:source.fileName,importedAt:source.importedAt||new Date().toISOString(),lastModified:source.lastModified??null,date1904:false,sheets,
   warnings:['대용량 원본 '+originalCells+'셀을 검토하고 연결된 '+mapped.length+'개 시각화의 결과만 보존했습니다. 다른 범위를 분석하려면 XLSX를 다시 업로드하세요.','원본 수식은 계산된 결과로 고정되며, 실제 Excel 원본을 별도로 보관하세요.']};
  normalized=DM.dataset(raw);mode='derived-results';
  updates=plans.map(link=>({...link,block:DM.materialize(link.block,normalized,link.binding)}));
 }
 const storedCells=normalized.sheets.reduce((n,s)=>n+s.cells.length,0);
 const truncationWarnings=[];
 for(const item of mapped){
  const previous=current.sheets.find(s=>s.id===item.oldSheetId);
  const next=source.sheets.find(s=>s.id===item.binding.sheetId);
  if(previous&&next&&next.rows>previous.rows)truncationWarnings.push(item.sourceSheetName+': 신규 행은 기존 지정 범위 '+item.sourceRange+' 밖일 수 있습니다.');
 }
 return {targetId,dataset:normalized,changes:updates.map(x=>({pageId:x.pageId,blockId:x.blockId,block:x.block})),
  mode,sourceCells:originalCells,storedCells,sourceFile:source.fileName,linkedObjects:updates.length,
  warnings:[...new Set(truncationWarnings)].slice(0,12)};
}
function apply(project,proposal){
 if(!proposal||!Array.isArray(proposal.changes)||!proposal.changes.length||!proposal.dataset)throw Error('적용할 자료 갱신안이 없습니다.');
 const copyProject=copy(project),index=copyProject.datasets?.findIndex(ds=>ds.id===proposal.targetId);
 if(index==null||index<0||proposal.dataset.id!==proposal.targetId)throw Error('자료 갱신 대상이 변경되었습니다. 다시 검토하세요.');
 const expected=copyProject.pages.flatMap(p=>(p.elements||[]).filter(el=>el.dataBinding?.datasetId===proposal.targetId).map(el=>p.id+':'+el.id));
 const announced=proposal.changes.map(item=>item.pageId+':'+item.blockId);
 if(expected.length!==announced.length||new Set(expected).size!==expected.length||new Set(announced).size!==announced.length||expected.some(key=>!announced.includes(key)))throw Error('연결 개체 수 또는 ID가 갱신 검토 후 변경되었습니다. 재검토하세요.');
 const checked=[];
 for(const change of proposal.changes){
  const page=copyProject.pages.find(p=>p.id===change.pageId);
  const block=page?.elements?.find(b=>b.id===change.blockId);
  if(!block||block.locked||block.dataBinding?.datasetId!==proposal.targetId)throw Error('연결 차트가 변경되었습니다. 다시 검토하세요.');
  if(change.block.id!==block.id||change.block.dataBinding?.datasetId!==proposal.targetId)throw Error('업데이트 데이터가 다른 개체를 가리킵니다.');
  checked.push({page,idx:page.elements.indexOf(block),block:change.block});
 }
 copyProject.datasets[index]=copy(proposal.dataset);
 for(const item of checked)item.page.elements[item.idx]=copy(item.block);
 // Validate every link in the resulting project before returning any changes.
 return C.normalizeProject(copyProject);
}
const api={plan,apply};
root.DocutDatasetRefresh=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
