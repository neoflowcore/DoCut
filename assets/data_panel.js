(function(root){
'use strict';
const C=root.DocutCore,W=root.DocutWorkbook,DM=root.DocutDataMotion,A=root.DocutAnalytics,M=root.DocutLargeDataset,REF=root.DocutDatasetRefresh,SLOTS=root.DocutChartSlotMapper,PACK=root.DocutTemplateDataMapper;
function suggestedPalette(page,selected,ubs){
 if(ubs)return 'ubs';
 const known=['editorial-blue','emerald-market',...(root.DocutRefArt?.palettes()||[]).map(x=>x.id)];
 const remembered=selected?.data?.palette;
 if(known.includes(remembered))return remembered;
 const pageStyle=page?.elements?.find(el=>known.includes(el.data?.palette))?.data?.palette;
 if(pageStyle)return pageStyle;
 const family=page?.designIdentity;
 const familyStyle=family==='STR-01'?'editorial-blue':family==='STR-02'?'emerald-market':root.DocutRefArt?.get(family)?.chartKey;
 return known.includes(familyStyle)?familyStyle:'default';
}
function mount(api){let candidate=null,bound=null,serial=0,proposal=null,baseline=null,selectedBlock=null,uploadedCandidate=false,slotOverride=false,operationOverride=false,slotChoices=[],manualOverrides={},manualLabelOverride=false;const get=id=>document.getElementById(id),esc=C.escapeHTML;
 const dialog=document.createElement('dialog');dialog.id='dataMotionDialog';dialog.className='recovery-dialog data-dialog';document.body.append(dialog);
 function open(){serial++;candidate=null;proposal=null;baseline=null;uploadedCandidate=false;slotOverride=false;operationOverride=false;manualOverrides={};manualLabelOverride=false;selectedBlock=api.getSelected?.()||null;if(!['bar','line','donut','table','kpi'].includes(selectedBlock?.type))selectedBlock=null;
  const currentPage=api.getPage?.();slotChoices=SLOTS?.list(currentPage,{selectedId:selectedBlock?.id})||[];
  if(selectedBlock&&!slotChoices.some(x=>x.id===selectedBlock.id)&&!selectedBlock.locked&&!selectedBlock.hidden)slotChoices.unshift({id:selectedBlock.id,type:selectedBlock.type,text:String(selectedBlock.text||selectedBlock.type).slice(0,90),selected:true,placeholder:false});
  const slotHtml=slotChoices.map(x=>'<option value="'+esc(x.id)+'"'+(selectedBlock?.id===x.id?' selected':'')+'>'+esc(SLOTS?.label(x)||x.text)+'</option>').join('');

  dialog.innerHTML='<div class="recovery-title"><strong>데이터 → 모션 차트·표</strong><button type="button" id="dataClose" aria-label="데이터 설정 닫기">✕</button></div><p>XLSX·CSV를 브라우저 안에서 읽습니다. 매크로·외부 연결을 실행하지 않습니다. 저장된 수식 계산값을 우선 보존하고, 캐시가 없는 일반 수식은 안전한 자체 계산기로 처리합니다. 원본 파일은 변경하지 않습니다. 일반 자료는 원자료를 보존하며, 대용량 엑셀은 선택한 통계 결과만 보고서에 저장합니다. 원본 수식·추가 열을 분석할 때는 XLSX 재업로드가 필요합니다. HTML은 연결된 결과만 보존합니다.</p><label class="field-label" for="workbookFile">자료 파일 (XLSX 50MB·수식 10000개 / CSV 1MB 이하)</label><input id="workbookFile" type="file" accept=".xlsx,.csv,.tsv"><label class="field-label" for="dataRefreshTarget">기존 자료 전체 갱신 대상 (선택 후 새 XLSX/CSV 업로드)</label><select id="dataRefreshTarget" class="inspect-select"><option value="">새 파일로 별도 시각화 생성</option>'+api.getProject().datasets.map(d=>'<option value="'+esc(d.id)+'">'+esc(d.fileName)+' · 연결된 차트 일괄 갱신</option>').join('')+'</select><label class="field-label" for="existingDataset">저장된 자료</label><select id="existingDataset" class="inspect-select"><option value="">선택하세요</option>'+api.getProject().datasets.map(d=>'<option value="'+esc(d.id)+'">'+esc(d.fileName)+'</option>').join('')+'</select><div id="dataOptions" hidden><p class="data-source-trail" id="dataSourceTrail"></p><label class="field-label" for="dataOperation">삽입 방식</label><select id="dataOperation" class="inspect-select"><option value="new">새 시각화 삽입</option>'+(api.getProject().datasets.length?'<option value="refresh">기존 자료 교체 · 모든 연결 시각화 갱신</option>':'')+''+(slotChoices.length?'<option value="replace" '+(selectedBlock?'selected':'')+'>템플릿 차트 자리에 연결 · 위치 유지</option>':'')+'</select><label class="field-label" for="dataTargetSlot">연결할 템플릿 차트 자리</label><select id="dataTargetSlot" class="inspect-select"><option value="">새 차트 개체 추가</option>'+slotHtml+'</select><label class="field-label" for="workbookSheet">시트</label><select id="workbookSheet" class="inspect-select"></select><label class="field-label" for="workbookRange">셀 범위</label><input id="workbookRange" class="inspect-input" value="A1:B5" placeholder="A1:C12"><div class="inspect-row"><label>범주 열 (범위 내 1부터)<input id="labelColumn" class="inspect-input" type="number" value="1" min="1" max="256"></label><label>숫자 열 (범위 내 1부터)<input id="valueColumn" class="inspect-input" type="number" value="2" min="1" max="256"></label></div><div class="inspect-row"><label>기간·필터 열 (없으면 0)<input id="filterColumn" class="inspect-input" type="number" value="0" min="0" max="256"></label><label>초기 필터 값<input id="filterValue" class="inspect-input" maxlength="2000" placeholder="빈칸: 전체"></label></div><label><input id="dataHeader" type="checkbox" checked> 첫 행은 제목</label><div class="inspect-row"><label>시각화<select id="dataKind" class="inspect-select"><option value="bar">막대</option><option value="line">선</option><option value="donut">도넛</option><option value="table">표</option><option value="kpi">KPI 합계</option></select></label><label>단위 (자동 환산 없음)<input id="dataUnit" class="inspect-input" maxlength="20" placeholder="명·원·건"></label></div><div class="inspect-row"><label>분석 방식<select id="dataAnalysisMode" class="inspect-select"><option value="raw">원본 행 그대로</option><option value="group">범주별 그룹 집계</option><option value="histogram">값 분포 · 히스토그램</option><option value="cumulative">순서대로 누적합</option></select></label><label>집계 함수<select id="dataAggregate" class="inspect-select"><option value="sum">합계 SUM</option><option value="mean">평균 AVERAGE</option><option value="count">건수 COUNT</option><option value="min">최솟값 MIN</option><option value="max">최댓값 MAX</option><option value="median">중앙값 MEDIAN</option><option value="last">마지막 값 LAST</option></select></label></div><div class="inspect-row"><label>히스토그램 구간(2~30)<input id="dataBins" type="number" class="inspect-input" min="2" max="120" value="10"></label><label>차트 디자인<select id="dataChartStyle" class="inspect-select"><option value="default">기본 보고서 차트</option><option value="ubs">UBS 금색 벡터 차트</option><option value="editorial-blue">전략 리서치 · 블루 데이터 차트</option><option value="emerald-market">글로벌 시장 · 그린 데이터 차트</option></select></label></div><label id="dataUBSPlacementField" hidden><input id="dataUBSPlacement" type="checkbox"> UBS 원본 차트 영역에 맞춰 데이터 차트 배치</label><div class="inspect-inline"><button type="button" id="dataAutoDetect" class="inspect-action">표 열·시각화 자동 추천</button></div><p class="caption-small" id="dataStatsSummary" aria-live="polite">데이터를 선택하면 기초통계가 표시됩니다.</p><label class="field-label" for="dataBasisDate">기준일</label><input id="dataBasisDate" class="inspect-input" type="date"><div class="data-preview-wrap"><table id="dataPreviewTable" class="data-preview"></table></div><details><summary>원자료 경고</summary><p id="dataWarnings" class="caption-small"></p></details><button type="button" id="dataReview" class="inspect-action">범위·변경 검토</button><button type="button" id="dataReviewPack" class="inspect-action">현재 회사 6페이지 · 제목이 맞는 차트만 자동 연결</button><button type="button" id="dataApply" class="primary-btn" disabled>검토한 시각화 삽입</button><section id="dataBatchReview" class="data-batch-review" aria-label="6페이지 자동 연결 상세" hidden></section></div><p id="dataStatus" role="status" class="frame-review">파일을 선택하거나 저장된 자료를 여세요. 구형 XLS는 XLSX·CSV로 저장한 뒤 가져오세요.</p>';
  // Register company-specific palettes as real select controls; names are never interpolated into HTML.
  const paletteSelect=get('dataChartStyle');
  for(const option of root.DocutRefArt?.palettes()||[]){
   if(!option||!/^[-a-z0-9]+$/.test(option.id)||!Object.prototype.hasOwnProperty.call(C.CHART_PALETTES||{},option.id))continue;
   if([...paletteSelect.options].some(x=>x.value===option.id))continue;
   const el=document.createElement('option');el.value=option.id;el.textContent=option.name||option.id;paletteSelect.append(el);
  }
  const p=api.getProject();if(!p.datasets)p.datasets=[];
  get('dataReviewPack').disabled=!Boolean(api.getPage?.()?.designIdentity)||!PACK;
   get('dataReviewPack').textContent=api.getPage?.()?.designIdentity==='FIN-16'?'UBS 원본 6페이지 · 숫자 열 수동 연결 검토':'현재 회사 6페이지 · 제목이 맞는 차트만 자동 연결';
  get('dataTargetSlot').onchange=()=>{slotOverride=true;operationOverride=true;const el=selectedSlot();get('dataOperation').value=el?'replace':'new';if(el){get('dataKind').value=el.type;if(el.data?.palette&&[...get('dataChartStyle').options].some(o=>o.value===el.data.palette))get('dataChartStyle').value=el.data.palette;}preview();invalidate();};
  get('dataRefreshTarget').onchange=()=>{
   serial++;candidate=null;uploadedCandidate=false;proposal=null;baseline=null;
   get('workbookFile').value='';get('dataOptions').hidden=true;
   get('dataApply')?.setAttribute('disabled','');
   get('dataStatus').textContent=get('dataRefreshTarget').value?'기존 자료를 안전하게 갱신할 새 파일을 선택하세요.':'새 시각화를 만들 XLSX/CSV를 선택하세요.';
  };
  get('dataClose').onclick=()=>{serial++;dialog.close();};
  get('workbookFile').onchange=async ev=>{const file=ev.target.files?.[0],token=++serial;if(!file)return;candidate=null;proposal=null;get('dataOptions').hidden=true;get('dataStatus').textContent='자료 분석 중…';try{const refreshTarget=get('dataRefreshTarget').value;const meta={id:refreshTarget||C.uid('data'),fileName:file.name,lastModified:file.lastModified};let result;if(/\.xlsx$/i.test(file.name)){if(file.size>W.LIMITS.bytes)throw Error('XLSX 파일은 50MB 이하만 지원합니다.');result=await W.importWorkbook(await file.arrayBuffer(),meta);}else if(/\.(csv|tsv)$/i.test(file.name)){if(file.size>1024*1024)throw Error('CSV·TSV는 1MB 이하만 지원합니다.');result=W.fromRows(root.DocutDataIO.parseDelimited(await file.text()),meta);}else throw Error('XLSX·CSV·TSV 파일만 지원합니다. 구형 XLS는 XLSX로 변환하세요.');if(token!==serial||!dialog.open)return;uploadedCandidate=true;load(result);if(refreshTarget){get('dataOperation').value='refresh';get('dataStatus').textContent='일괄 갱신 대상: '+api.getProject().datasets.find(d=>d.id===refreshTarget)?.fileName+' · 검토를 누르면 기존 연결 전체를 확인합니다.';}}catch(e){if(token===serial)get('dataStatus').textContent=e.message;}};
  get('existingDataset').onchange=ev=>{serial++;uploadedCandidate=false;get('dataRefreshTarget').value='';const ds=api.getProject().datasets.find(d=>d.id===ev.target.value);if(ds)load(ds);};
  get('workbookSheet').onchange=()=>{manualOverrides={};manualLabelOverride=false;resetRange();autoSuggest();preview();invalidate();};
  for(const id of ['dataOperation','workbookRange','labelColumn','valueColumn','filterColumn','filterValue','dataHeader','dataKind','dataUnit','dataBasisDate','dataAnalysisMode','dataAggregate','dataBins','dataChartStyle','dataUBSPlacement'])get(id).onchange=()=>{if(id==='dataOperation')operationOverride=true;if(id==='labelColumn'){manualLabelOverride=true;manualOverrides={};}if(id==='workbookRange'||id==='dataHeader'){manualOverrides={};manualLabelOverride=false;}preview();invalidate();};
  get('dataAutoDetect').onclick=()=>{manualLabelOverride=false;autoSuggest();};get('dataReview').onclick=review;get('dataReviewPack').onclick=reviewPack;get('dataApply').onclick=apply;dialog.showModal();if(selectedBlock?.dataBinding){const ds=api.getProject().datasets.find(d=>d.id===selectedBlock.dataBinding.datasetId);if(ds){load(ds);get('existingDataset').value=ds.id;get('workbookSheet').value=selectedBlock.dataBinding.sheetId;get('workbookRange').value=selectedBlock.dataBinding.range;get('labelColumn').value=selectedBlock.dataBinding.labelColumn+1;get('valueColumn').value=selectedBlock.dataBinding.valueColumn+1;get('filterColumn').value=selectedBlock.dataBinding.filterColumn===null?0:selectedBlock.dataBinding.filterColumn+1;get('filterValue').value=selectedBlock.dataBinding.filterValue;get('dataHeader').checked=selectedBlock.dataBinding.header;get('dataKind').value=selectedBlock.type;get('dataUnit').value=selectedBlock.unit||'';get('dataBasisDate').value=selectedBlock.asOfDate||'';preview();}}
 }
 function selectedSlot(){const id=get('dataTargetSlot')?.value;if(!id)return null;const pg=api.getPage?.();const el=pg?.elements?.find(e=>e.id===id);if(!el||el.locked||el.hidden||!slotChoices.some(s=>s.id===id))return null;return el;}
 function invalidate(){proposal=null;get('dataApply').disabled=true;get('dataApply').textContent='검토한 시각화 삽입';get('dataBatchReview').hidden=true;get('dataBatchReview').replaceChildren();}
 function resetRange(){const sheet=candidate.sheets.find(s=>s.id===get('workbookSheet').value);get('workbookRange').value='A1:'+W.columnName(Math.max(0,sheet.columns-1))+Math.max(1,sheet.rows);}
 function load(ds){candidate=ds;manualOverrides={};manualLabelOverride=false;get('workbookSheet').innerHTML=ds.sheets.map(s=>'<option value="'+esc(s.id)+'">'+esc(s.name)+' · '+s.rows+'행 × '+s.columns+'열</option>').join('');get('dataOptions').hidden=false;get('dataWarnings').textContent=ds.warnings.length?ds.warnings.join('\n'):'저장된 셀 값입니다. 데이터 사실·계산 정확성은 작성자가 확인하세요.';get('dataStatus').textContent=ds.fileName+(ds.warnings?.some(w=>w.includes('대용량 엑셀'))?' · 선택 통계 결과만 저장됨(다른 원본 열은 XLSX 재업로드 필요)':' · 원본 셀 값·서식 보존')+(ds.formulaStats?.total?' · 수식 '+ds.formulaStats.total+'개 (캐시 '+ds.formulaStats.cached+' / 재계산 '+ds.formulaStats.recalculated+' / 검토 '+ds.formulaStats.unresolved+')':'');resetRange();autoSuggest();invalidate();preview();}
 function autoSuggest(){if(!candidate||!A)return;try{
   const suggestion=A.suggest(candidate,get('workbookSheet').value,get('workbookRange').value);
   get('labelColumn').value=suggestion.labelColumn+1;get('valueColumn').value=suggestion.valueColumn+1;
   get('dataHeader').checked=suggestion.header;get('dataAnalysisMode').value=suggestion.analysisMode;
   get('dataAggregate').value=suggestion.aggregate;
   if(!slotOverride&&!selectedBlock&&SLOTS){const proposed=SLOTS.choose(api.getPage?.(),suggestion.recommendedChart);if(proposed)get('dataTargetSlot').value=proposed.id;}
   const chosen=selectedSlot();
   if(!operationOverride&&!get('dataRefreshTarget').value)get('dataOperation').value=chosen?'replace':'new';
   get('dataKind').value=chosen?.type||selectedBlock?.type||suggestion.recommendedChart;
   const slot=A.ubsSlot(api.getPage?.(),api.getProject().frame);
   get('dataUBSPlacementField').hidden=!slot;
   get('dataUBSPlacement').checked=Boolean(slot);
   get('dataChartStyle').value=suggestedPalette(api.getPage?.(),chosen||selectedBlock,Boolean(slot)&&!chosen);
   get('dataStatsSummary').textContent='자동 감지 · '+suggestion.sampleRows+'행 · '+suggestion.distinctLabels+'개 범주 / 범주열 '+(suggestion.labelColumn+1)+' '+(suggestion.labelConfidence==='unconfirmed-numeric-dimension'?'(수동 확인 필수)': '(제목·형식 기반)')+' / '+suggestion.columns.map(c=>c.name+(c.numeric?'(숫자)':'')).join(', ')+(suggestion.warning?' · '+suggestion.warning:'');
   invalidate();
  }catch(e){get('dataStatsSummary').textContent='자동 추천 불가: '+e.message;}
 }
 function preview(){if(!candidate)return;try{const selected=W.select(candidate,get('workbookSheet').value,get('workbookRange').value,{maxRows:25,maxColumns:20});get('dataSourceTrail').textContent=candidate.fileName+' → '+selected.sheet.name+' → '+get('workbookRange').value;const table=get('dataPreviewTable');table.replaceChildren();selected.rows.slice(0,25).forEach(row=>{const tr=document.createElement('tr');row.forEach(c=>{const td=document.createElement('td');td.textContent=c.formatted;td.title=c.address+' · '+c.format+(c.formula!==null?' · 수식 캐시':'');tr.append(td);});table.append(tr);});try{if(get('dataKind').value!=='table'&&A){const spec=DM.binding({datasetId:candidate.id,sheetId:get('workbookSheet').value,range:get('workbookRange').value,labelColumn:Number(get('labelColumn').value)-1,valueColumn:Number(get('valueColumn').value)-1,header:get('dataHeader').checked,filterColumn:Number(get('filterColumn').value)?Number(get('filterColumn').value)-1:null,filterValue:get('filterValue').value,analysisMode:get('dataAnalysisMode').value,aggregate:get('dataAggregate').value,bins:Number(get('dataBins').value)});const sampleSize=spec.header?257:256;const result=DM.values(candidate,spec,{maxRows:sampleSize});const sampled=selected.requestedRows>sampleSize;get('dataStatsSummary').textContent=(sampled?'표본 통계 ('+result.rows.length+'행) · 검토 시 전체 '+selected.requestedRows+'행 재계산 · ':'전체 범위 통계 · ')+A.summaryText(result.summary)+' · '+result.series.length+'개 그래프 점';}}catch(e){get('dataStatsSummary').textContent='수치 분석: '+e.message;}}catch(e){get('dataStatus').textContent=e.message;}}
 function renderBatchMapping(plan){
  const panel=get('dataBatchReview');panel.replaceChildren();
  const mapped=plan.updates||plan.suggestions||[],skipped=plan.skipped||[],slots=plan.reviewSlots||[];
  const heading=document.createElement('h3');heading.textContent=(plan.family==='FIN-16'?'UBS 원본 6페이지 · 13·16쪽 엑셀 삽입':'6페이지 엑셀 차트 연결')+' · '+mapped.length+'개 가능 / '+skipped.length+'개 보류';
  panel.append(heading);
  const tip=document.createElement('p');tip.textContent=(plan.family==='FIN-16'?'UBS 원본 13·16쪽은 의미가 확인된 엑셀 숫자 열을 차트마다 직접 지정한 후에만 삽입합니다. 원본 PDF 도형과 편집 가능한 텍스트는 남습니다. ':'')+(plan.labelConfidence==='unconfirmed-numeric-dimension'?'숫자 범주열은 먼저 범주 열 번호를 직접 확인하세요. ':'')+'열 선택 뒤에는 다시 검토해야 적용됩니다.';panel.append(tip);
  const table=document.createElement('table'),thead=document.createElement('thead'),headRow=document.createElement('tr');
  for(const label of ['페이지','차트','추천 열','수동 열 지정','판정']){const th=document.createElement('th');th.textContent=label;headRow.append(th);}
  thead.append(headRow);table.append(thead);
  const tbody=document.createElement('tbody');
  for(const item of slots){
   const key=item.pageId+':'+item.id,m=mapped.find(x=>x.pageId===item.pageId&&(x.blockId===item.id||x.id===item.id));
   const fail=skipped.find(x=>x.pageId===item.pageId&&x.blockId===item.id),tr=document.createElement('tr');
   for(const value of [item.pageName||item.pageId,item.text||item.type,m?.columnName||'—']){
    const td=document.createElement('td');td.textContent=value;tr.append(td);
   }
   const selectCell=document.createElement('td'),select=document.createElement('select');
   select.className='inspect-select';select.setAttribute('aria-label',String(item.pageName||'페이지')+' '+String(item.text||'차트')+' 숫자 열 직접 지정');
   const autoOption=document.createElement('option');autoOption.value='';autoOption.textContent='자동 추천 / 보류 유지';select.append(autoOption);
   for(const column of plan.numericColumns||[]){
    const option=document.createElement('option');option.value=String(column.index);option.textContent=column.name+' (열 '+(column.index+1)+(column.numeric?' · 숫자 추정':' · 유형 미확인; 전체 검증')+')';select.append(option);
   }
   select.value=manualOverrides[key]??'';
   select.onchange=()=>{
    if(select.value)manualOverrides[key]=select.value;else delete manualOverrides[key];
    proposal=null;get('dataApply').disabled=true;
    get('dataStatus').textContent='숫자 열 선택이 변경되었습니다. 6페이지 자동 연결 검토를 다시 실행해야 적용할 수 있습니다.';
   };
   selectCell.append(select);tr.append(selectCell);
   const result=document.createElement('td');
   result.textContent=m?(m.confirmed?'작성자 지정 · 전체 데이터 확인 필요':'자동 추천 · '+(m.matchReason||'명칭 일치')+' · 점수 '+m.matchScore+' (정확도 % 아님)'):'보류: '+(fail?.reason||'지표 일치 미확인');
   tr.append(result);tbody.append(tr);
  }
  table.append(tbody);panel.append(table);panel.hidden=false;
 }
 function reviewPack(){try{
  if(!PACK||!candidate)throw Error('자동 매핑할 엑셀 데이터를 먼저 선택하세요.');
  if(get('dataRefreshTarget').value||get('dataOperation').value==='refresh')throw Error('기존 데이터 전체 교체 중에는 새 팩 자동 매핑을 동시에 실행하지 않습니다. 교체 완료 후 다시 실행하세요.');
  const p=api.getProject(),page=api.getPage?.(),family=page?.designIdentity;
  baseline=JSON.stringify(p);
  const opts={designIdentity:family,packInstanceId:page?.designPackId||'',currentPageId:page?.id||'',
   sheetId:get('workbookSheet').value,range:get('workbookRange').value,header:get('dataHeader').checked,
   analysisMode:get('dataAnalysisMode').value,aggregate:get('dataAggregate').value,
   manualOverrides:{...manualOverrides},...(manualLabelOverride?{labelColumn:Number(get('labelColumn').value)-1}:{})};
  const inspect=PACK.plan(p,candidate,{...opts,previewOnly:true});
  if(!inspect.suggestions.length){
   proposal=null;renderBatchMapping(inspect);get('dataApply').disabled=true;
   get('dataStatus').textContent=inspect.labelConfidence==='unconfirmed-numeric-dimension'?'범주열이 숫자형이라 자동 매칭이 중단되었습니다. 범주 열 번호를 직접 수정한 뒤 6페이지 연결 검토를 다시 누르세요.':'자동 일치가 확인되지 않았습니다. 표의 수동 열 지정에서 올바른 숫자 열을 선택하고 다시 검토하세요.';
   return;
  }
  let planned;
  try{planned=PACK.plan(p,candidate,opts);}
  catch(error){
   proposal=null;renderBatchMapping(inspect);get('dataApply').disabled=true;
   get('dataStatus').textContent='자동/수동으로 선택한 열의 전체 데이터 검증에 실패했습니다: '+error.message+' · 수동 열을 고치고 다시 검토하세요.';
   return;
  }
  proposal={packBind:planned};
  renderBatchMapping(planned);
  const assignments=planned.updates.map(item=>item.pageName+' ['+item.kind+'] ← '+item.columnName).slice(0,24).join(' / ');
  const skipped=planned.skipped.length?' · 보류 '+planned.skipped.length+'개: '+planned.skipped.slice(0,3).map(item=>item.reason).join(' / '):'';
  get('dataStatus').textContent='현재 템플릿 묶음 · 원자료 '+planned.sourceCells.toLocaleString('ko-KR')+
   '셀 / 저장 결과 '+planned.storedCells.toLocaleString('ko-KR')+'셀 · 분석 '+planned.analysisMode+'/'+planned.aggregate+
   ' · 연결 '+planned.updates.length+'개: '+assignments+skipped+' · 열 선택과 원본 수치를 확인하고 적용하세요.';
  get('dataApply').textContent='검토한 '+planned.updates.length+'개 템플릿 차트 연결 적용';
  get('dataApply').disabled=false;
 }catch(e){proposal=null;get('dataBatchReview').hidden=true;get('dataBatchReview').replaceChildren();get('dataApply').disabled=true;get('dataStatus').textContent=e.message;}}
 function review(){try{if(!candidate)throw Error('자료를 선택하세요.');get('dataBatchReview').hidden=true;get('dataBatchReview').replaceChildren();get('dataApply').textContent='검토한 시각화 삽입';const p=api.getProject();baseline=JSON.stringify(p);if(get('dataOperation').value==='refresh'){
    const target=get('dataRefreshTarget').value;
    if(!REF||!uploadedCandidate||!target||candidate.id!==target)throw Error('기존 자료를 선택한 뒤 새 XLSX/CSV를 업로드해야 일괄 갱신할 수 있습니다.');
    const prepared=REF.plan(p,candidate,target);
    proposal={bulkRefresh:prepared};
    get('dataStatus').textContent='원자료 일괄 갱신 검토: '+prepared.sourceFile+' · 연결된 '+prepared.linkedObjects+'개 시각화 · '+prepared.sourceCells.toLocaleString('ko-KR')+'셀 읽음 · '+prepared.storedCells.toLocaleString('ko-KR')+'셀 보존'+(prepared.mode==='derived-results'?' (대용량: 선택 결과만 보존)':'')+(prepared.warnings.length?' / 주의: '+prepared.warnings.join(' · '):'')+' · 적용 시 기존 값이 함께 갱신됩니다.';
    get('dataApply').disabled=false;return;
   }
  const old=p.datasets.find(d=>d.id===candidate.id);if(!old&&p.datasets.length>=10)throw Error('프로젝트당 자료는 최대 10개입니다.');const raw={datasetId:candidate.id,sheetId:get('workbookSheet').value,range:get('workbookRange').value,labelColumn:Number(get('labelColumn').value)-1,valueColumn:Number(get('valueColumn').value)-1,filterColumn:Number(get('filterColumn').value)?Number(get('filterColumn').value)-1:null,filterValue:get('filterValue').value,header:get('dataHeader').checked,sort:'source',aggregate:get('dataAggregate').value,analysisMode:get('dataAnalysisMode').value,bins:Number(get('dataBins').value)};
 const spec=DM.binding(raw),kind=get('dataKind').value,replace=get('dataOperation').value==='replace',target=replace?selectedSlot():null;
 if(replace&&!target)throw Error('연결할 템플릿 차트를 선택하세요. 원래 차트가 삭제·잠금된 경우 창을 다시 여세요.');
 const initialSize={w:Math.min(600,p.frame.width-100),h:Math.min(kind==='kpi'?220:360,p.frame.height-250)};
 const placement=!target&&SLOTS?SLOTS.place(api.getPage?.(),p.frame,initialSize):{x:50,y:200,...initialSize,overlapRatio:0,clear:true};
 const block=target?{...C.clone(target),type:kind}:C.makeBlock(kind,placement.x,placement.y,{text:kind==='kpi'?'0\n연결 지표':candidate.fileName+' · '+kind,w:placement.w,h:placement.h});const slot=A?.ubsSlot(api.getPage?.(),p.frame);const chooseUBS=slot&&get('dataUBSPlacement').checked&&['bar','line'].includes(kind)&&get('dataOperation').value!=='replace';if(chooseUBS){Object.assign(block,{x:slot.x,y:slot.y,w:slot.w,h:slot.h});block.style={...block.style,background:'#ffffff',radius:0,shadow:0,borderWidth:0};}if(['bar','line','donut'].includes(kind)){block.data={...(block.data||{}),palette:(get('dataChartStyle').value==='ubs'||Object.prototype.hasOwnProperty.call(C.CHART_PALETTES||{},get('dataChartStyle').value))?get('dataChartStyle').value:'default'};}block.unit=get('dataUnit').value;block.asOfDate=get('dataBasisDate').value;bound=DM.materialize(block,candidate,spec);const values=DM.values(candidate,spec,{allowText:kind==='table'});const changes=old?DM.diff(old,candidate):[];
 const stored=M.prepare(candidate,spec,kind,bound,values);
 proposal={dataset:stored.dataset,block:stored.block,replaceId:target?.id||null};get('dataStatus').textContent=values.sourceLabel+' / '+values.rows.length+'개 데이터 행 / '+(kind==='kpi'?'통계 집계':get('dataAnalysisMode').selectedOptions[0].textContent)+' / '+(old?changes.length+'셀 변경':'새 자료 스냅샷')+' / 기준일 '+(block.asOfDate||'미입력')+' · '+(proposal.replaceId?'선택 객체 ID·위치 유지 / 연결 변경':'새 객체 삽입')+(stored.mode==='analysis-only'?' · 대용량 모드: '+stored.originalCells.toLocaleString('ko-KR')+'셀 분석 후 선택 결과 '+stored.storedCells+'셀만 보고서에 보존(다른 원본 범위는 재업로드 필요)':'')+(target?' · 원래 템플릿 차트 자리·크기·색상 유지':!chooseUBS&&placement.overlapRatio>.02?' · 주의: 새 차트가 기존 본문과 겹칠 수 있습니다. 적용 후 위치를 조정하세요.':' · 빈 영역 자동 배치')+' · 확인 후 적용하세요.';get('dataApply').disabled=false;
 }catch(e){proposal=null;get('dataApply').disabled=true;get('dataStatus').textContent=e.message;}}
 function apply(){try{if(!proposal||JSON.stringify(api.getProject())!==baseline)throw Error('검토 후 문서가 변경되었습니다. 자료 검토를 다시 실행하세요.');if(proposal.bulkRefresh){if(!api.commitRefresh)throw Error('일괄 갱신 적용 기능이 누락되었습니다.');api.commitRefresh(proposal.bulkRefresh);}else if(proposal.packBind){if(!api.commitPack)throw Error('템플릿 차트 일괄 연결 기능을 불러오지 못했습니다.');api.commitPack(proposal.packBind);}else api.commit(proposal);dialog.close();}catch(e){get('dataStatus').textContent=e.message;}}
 return {open};
}
root.DocutDataPanel={mount,suggestedPalette};
if(typeof module!=='undefined'&&module.exports)module.exports=root.DocutDataPanel;
})(typeof globalThis!=='undefined'?globalThis:this);
