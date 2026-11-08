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
 let rows,originalRows=null;
 if(kind==='table'){
  const selected=W.select(source,spec.sheetId,spec.range);
  if(selected.rows.length>24||selected.rows[0]?.length>10)throw Error('연결 표는 24행·10열 이하로 선택하세요.');
  originalRows=selected.rows;
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
 // Never turn Excel text identifiers (e.g. region "00123") into the number
 // 123 when compacting charts. Keep cached display strings for native tables.
 const cols=rows[0].length,flat=snapshot.sheets[0].cells;
 for(let r=0;r<rows.length;r++)for(let c=0;c<cols;c++){
  const target=flat[r*cols+c],value=rows[r][c];
  if(originalRows){
   const original=originalRows[r][c];
   target.type=original.type;target.value=original.value;target.raw=original.raw;
   target.formatted=original.formatted;target.format=original.format;
   // Calculated results are frozen in the compact snapshot. Do not carry a
   // formula that references unembedded workbook cells.
   target.formula=null;target.cached=false;
  }else if(typeof value==='string'){
   target.type='str';target.value=value;target.raw=value;target.formatted=value;
   target.format='General';target.formula=null;target.cached=false;
  }
 }

 snapshot.sheets[0].id=spec.sheetId;
 snapshot.sheets[0].name=origin.name+' (분석 결과)';
 snapshot.warnings=['대용량 엑셀 '+originalCells+'셀 중 보고서에는 시각화에 필요한 계산 결과만 보존했습니다. 다른 원본 데이터·수식을 분석하려면 XLSX를 재업로드하세요.'];
 const provenance=source.fileName+' / '+origin.name+'!'+spec.range+' · 선택 통계 결과 (대용량 원본은 XLSX에 보관)';
 const compactSpec=DM.binding({
  origin:provenance,
  datasetId:source.id,sheetId:spec.sheetId,range:'A1:'+W.columnName(rows[0].length-1)+rows.length,
  labelColumn:kind==='table'?Math.min(spec.labelColumn,rows[0].length-1):0,
  valueColumn:kind==='table'?Math.min(spec.valueColumn,rows[0].length-1):1,
  filterColumn:null,filterValue:'',header:kind==='table'?spec.header:true,
  sort:'source',aggregate:'sum',analysisMode:'raw'
 });
 const reduced=DM.dataset(snapshot);
 const updated=DM.materialize(block,reduced,compactSpec);
 updated.source=provenance;
 updated.verified=false;
 return {dataset:reduced,block:C.normalizeBlock(updated),mode:'analysis-only',originalCells,storedCells:reduced.sheets.reduce((n,s)=>n+s.cells.length,0)};
}
const api={NATIVE_CELLS,prepare};
root.DocutLargeDataset=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
