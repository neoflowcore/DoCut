(function(root){
'use strict';
// Large input workbooks are analysed in memory; only the chosen, verified
// chart/table result is embedded in the editable report. No silent truncation.
const C=root.DocutCore,W=root.DocutWorkbook,DM=root.DocutDataMotion;
const NATIVE_CELLS=5000;
function prepare(source,spec,kind,block,analysed){
 if(!source||!spec||!block)throw Error('저장할 엑셀 자료와 연결 정보가 없습니다.');
 const originalCells=source.sheets.reduce((n,s)=>n+s.cells.length,0);
 if(originalCells<=NATIVE_CELLS){
  return {dataset:DM.dataset(source),block:C.normalizeBlock(block),mode:'full',originalCells,storedCells:originalCells};
 }
 const origin=source.sheets.find(s=>s.id===spec.sheetId);
 if(!origin)throw Error('원본 워크시트를 찾지 못했습니다.');
 let rows;
 if(kind==='table'){
  const selected=W.select(source,spec.sheetId,spec.range);
  if(selected.rows.length>24||selected.rows[0]?.length>10)throw Error('연결 표는 24행·10열 이하로 선택하세요.');
  rows=selected.rows.map(row=>row.map(c=>c.value==null?'':c.value));
 }else if(kind==='kpi'){
  const n=Number(String(block.text||'').split('\n')[0]);
  if(!Number.isFinite(n))throw Error('KPI 결과가 숫자가 아닙니다. 원자료 범위를 확인하세요.');
  rows=[['지표','계산값'],['KPI',n]];
 }else if(['bar','line','donut'].includes(kind)){
  const resolved=analysed||DM.values(source,spec);
  rows=[['범주','계산값'],...resolved.series.map(p=>[p.label,p.value])];
  if(rows.length<=1)throw Error('저장할 차트 값이 없습니다.');
 }else throw Error('대용량 자료 저장 대상이 잘못되었습니다.');
 const snapshot=W.fromRows(rows,{id:source.id,fileName:source.fileName,lastModified:source.lastModified});
 snapshot.sheets[0].id=spec.sheetId;
 snapshot.sheets[0].name=origin.name+' (분석 결과)';
 snapshot.warnings=['대용량 엑셀 '+originalCells+'셀 중 보고서에는 시각화에 필요한 계산 결과만 보존했습니다. 다른 원본 데이터·수식을 분석하려면 XLSX를 재업로드하세요.'];
 const compactSpec=DM.binding({
  datasetId:source.id,sheetId:spec.sheetId,range:'A1:'+W.columnName(rows[0].length-1)+rows.length,
  labelColumn:kind==='table'?Math.min(spec.labelColumn,rows[0].length-1):0,
  valueColumn:kind==='table'?Math.min(spec.valueColumn,rows[0].length-1):1,
  filterColumn:null,filterValue:'',header:kind==='table'?spec.header:true,
  sort:'source',aggregate:'sum',analysisMode:'raw'
 });
 const reduced=DM.dataset(snapshot);
 const updated=DM.materialize(block,reduced,compactSpec);
 updated.source=source.fileName+' / '+origin.name+'!'+spec.range+' · 선택 통계 결과 (대용량 원본은 XLSX에 보관)';
 updated.verified=false;
 return {dataset:reduced,block:C.normalizeBlock(updated),mode:'analysis-only',originalCells,storedCells:reduced.sheets.reduce((n,s)=>n+s.cells.length,0)};
}
const api={NATIVE_CELLS,prepare};
root.DocutLargeDataset=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
