(function(root){
 'use strict';
 const F=root.DocutFrame;
 const C=root.DocutCore, X=root.DocutExporter, D=root.DocutDataIO, R=root.DocutRichText, Q=root.DocutProposal, S=root.DocutStatCharts;
 if(!C||!X){document.body.textContent='DoCut 실행 구성 요소가 누락되었습니다.';return;}
 const $=id=>document.getElementById(id), qs=(sel,el=document)=>el.querySelector(sel), qsa=(sel,el=document)=>Array.from(el.querySelectorAll(sel));
 const VALID=root.DocutValidation, TRANS=root.DocutPageTransitions, REF=root.DocutReferenceMap, FXSTUDIO=root.DocutEffectStudio;
 const ST=root.DocutStoryPlayer, REV=root.DocutReviewBoard, KITS=root.DocutPageKits, PRO=root.DocutProReports, P=root.DocutPersistence, MEDIA=root.DocutMediaLayout, LAYERS=root.DocutLayerOps, IMPORT=root.DocutImportReview, REWRITE=root.DocutTextRewrite, QUALITY=root.DocutQualityReview, HISTORY_LIMIT=36;
 const writerId='docut-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
 const getStore=()=>{try{return root.localStorage;}catch(_){return null;}};
 const initialSaved=P?P.inspect(getStore(),C.normalizeProject):{status:'unavailable',error:'Persistence module unavailable'};
 const labels={title:'큰 제목',text:'본문',card:'설명 카드',kpi:'핵심 지표',bar:'막대 차트',line:'추세 차트',donut:'도넛 차트',stat:'통계 차트 9종',table:'비교 표',shape:'도형',note:'의견 수렴',image:'이미지',bullet:'핵심 논점',quote:'강조 문구',divider:'구분선',source:'출처·각주'};
 const effectNames=Object.fromEntries(C.EFFECTS);
 let project=initialSaved.project||C.createProject(5);
 const state={pageIndex:0,selectedId:null,leftTab:'structure',rightMode:'inspector',includeLockedFont:false,validationMode:'typo',validationScope:'current',validationLanguage:'both',validationIgnored:new Set(),validationIssues:[],validationVisible:80,validationProposal:null,validationAITarget:null,fit:1,zoom:100,scale:1,grid:false,preview:false,animations:[],history:[],future:[],moving:null,editingId:null,toastTimer:null,saving:false,clipboard:null,selectedIds:new Set(),snap:true,imageCropEditingId:null,collapsedGroups:new Set(),importFile:null,importCandidate:null,importAnalysis:null,importPreviewIndex:0,rewritePlan:null,rewriteBaseline:null,csvCandidate:null,aiCandidate:null,aiBaseline:null,aiApprovalSignature:null,scrubTime:0,bezierDrag:null,richRange:null,tableCell:{row:0,col:0},importBaseline:null,importSerial:0,backupCandidate:null,backupBaseline:null,reviewStatus:'all',reviewPriority:'all',reviewQuery:'',reviewVisible:35,reviewImportCandidate:null,reviewImportSerial:0,kitSelection:"STR-01",kitPreviewIndex:0,kitSnapshot:null,kitImportCandidate:null,kitImportSerial:0,kitCorruptExport:null,qualityReport:null,qualitySeverity:"all",qualityCategory:"all",exportedBackups:false,editCheckpointed:false,editValidationError:null,saveToken:initialSaved.token||null,saveProblem:['corrupt','corrupt-legacy'].includes(initialSaved.status)?{type:'corrupt',detail:initialSaved.error}:null,exportedLocal:false,exportedLocalHash:null,exportedCorrupt:false};
 function updateSaveUI(){
  const bar=$('saveRiskBanner'),status=$('saveIndicator'),issue=state.saveProblem;
  bar.hidden=!issue;
  if(issue){status.textContent=issue.type==='conflict'?'저장 충돌 · 다른 탭 편집본 보호':issue.type==='corrupt'?'복구 필요 · 손상 데이터 보호':'자동 저장 실패 · JSON 백업 필요';
   $('saveRiskText').textContent=issue.type==='conflict'?'다른 창에서 저장본이 변경되었습니다. 이 창의 수정 내용은 자동으로 덮어쓰지 않습니다.':issue.type==='corrupt'?'저장본 손상이 발견되어 새 빈 문서로 덮어쓰지 않았습니다.':'브라우저 저장을 완료하지 못했습니다. 현재 문서를 JSON으로 백업하세요.';
  }else status.innerHTML='<span class="status-dot"></span> 로컬 자동 저장';
 }
 function reportStorageProblem(type,detail){const same=state.saveProblem?.type===type;state.saveProblem={type,detail:String(detail||'')};updateSaveUI();if(!same)toast(type==='conflict'?'다른 탭의 변경사항이 감지되었습니다. 저장본을 덮어쓰지 않습니다.':'자동 저장 문제가 감지되었습니다. JSON 백업을 권장합니다.');}
 function persist(){
  if(!P){reportStorageProblem('failed','Missing persistence module');return false;}
  project.updatedAt=new Date().toISOString();
  const result=P.write(getStore(),C.normalizeProject,project,state.saveToken,writerId);
  if(result.status==='saved'){state.saveToken=result.token;state.saveProblem=null;state.exportedLocal=false;state.exportedLocalHash=null;updateSaveUI();return true;}
  reportStorageProblem(result.status==='conflict'?'conflict':result.status==='corrupt'?'corrupt':'failed',result.error||'Local storage is unavailable');
  return false;
 }
 function workingCopyIsBackedUp(){return Boolean(state.exportedLocal&&state.exportedLocalHash===P.checksum(JSON.stringify(project)));}
 function exportWorkingCopy(){const snapshot=C.normalizeProject(project);X.downloadFile(X.filenameSafe(project.title)+'_UNSAVED.docut.json',JSON.stringify(snapshot,null,2),'application/json;charset=utf-8');state.exportedLocal=true;state.exportedLocalHash=P.checksum(JSON.stringify(project));toast('현재 편집본 JSON을 별도로 저장했습니다.');}
 function storageIssueDialog(){const issue=state.saveProblem;if(!issue)return;const corrupt=issue.type==='corrupt';
  $('storageIssueTitle').textContent=corrupt?'손상된 자동 저장 보호':issue.type==='conflict'?'다른 탭과 저장 충돌':'자동 저장 실패';
  $('storageIssueDetail').textContent=issue.detail||$('saveRiskText').textContent;
  $('storageLoadExternal').hidden=corrupt||issue.type!=='conflict';$('storageOverwriteExternal').hidden=corrupt||issue.type!=='conflict';$('storageRawExport').hidden=!corrupt;$('storageResetCorrupt').hidden=!corrupt;
  openDialog('storageIssueDialog');
 }
 function loadExternalSaved(){if(state.saveProblem?.type!=='conflict')return;const latest=P.inspect(getStore(),C.normalizeProject);if(!['current','legacy'].includes(latest.status))return toast('최신 저장본을 정상적으로 읽을 수 없습니다.');
  const backup=P.makeBackup(getStore(),project,'before accepting another tab');if(!['saved','unchanged'].includes(backup.status)&&!workingCopyIsBackedUp())return toast('현재 편집본 보존 실패: 먼저 JSON을 다운로드하세요.');
  project=latest.project;state.saveToken=latest.token;state.saveProblem=null;state.exportedLocal=false;state.exportedLocalHash=null;state.history=[];state.future=[];state.pageIndex=0;state.selectedId=null;state.selectedIds.clear();closeDialog('storageIssueDialog');renderAll();updateSaveUI();toast('다른 탭의 최신 저장본을 불러왔습니다.');
 }
 function overwriteExternalSaved(){if(state.saveProblem?.type!=='conflict')return;if(!root.confirm('다른 탭의 저장본을 백업한 뒤 현재 편집본으로 교체하시겠습니까?'))return;
  const result=P.resolveExternal(getStore(),C.normalizeProject,project,writerId);
  if(result.status!=='saved'){reportStorageProblem(result.status==='conflict'?'conflict':'failed',result.error||'Could not preserve other tab');return;}
  state.saveToken=result.token;state.saveProblem=null;state.exportedLocal=false;state.exportedLocalHash=null;closeDialog('storageIssueDialog');updateSaveUI();toast('기존 저장본을 백업하고 현재 문서를 저장했습니다.');
 }
 function downloadDamagedCheckpoint(){const latest=P.inspect(getStore(),C.normalizeProject);if(!latest.status.startsWith('corrupt'))return toast('손상된 자동저장 원본이 없습니다.');X.downloadFile('DoCut_Damaged_Local_Checkpoint.txt',latest.raw,'text/plain;charset=utf-8');state.exportedCorrupt={status:latest.status,hash:P.checksum(latest.raw)};toast('손상된 원본을 TXT로 저장했습니다.');}
 function resetDamagedCheckpoint(){if(!state.exportedCorrupt)return toast('먼저 손상된 원본을 TXT로 내려받으세요.');if(!root.confirm('손상된 저장본을 별도로 다운로드했습니까? 이 문서로 새 자동저장을 시작하시겠습니까?'))return;
  const storage=getStore(),latest=P.inspect(storage,C.normalizeProject);if(!latest.status.startsWith('corrupt')||latest.status!==state.exportedCorrupt.status||P.checksum(latest.raw)!==state.exportedCorrupt.hash)return toast('손상된 원본이 다운로드 이후 변경됐습니다. 새 원본을 먼저 내려받으세요.');
  try{storage.removeItem(latest.status==='corrupt'?P.KEY:P.LEGACY);}catch(e){return toast('브라우저 저장 접근 오류: '+e.message);}
  state.saveToken=P.inspect(storage,C.normalizeProject).token;state.saveProblem=null;state.exportedCorrupt=false;
  if(persist()){closeDialog('storageIssueDialog');toast('손상된 원본을 보호한 뒤 새 자동저장을 시작했습니다.');}
 }
 function toast(message){const node=$('toast');node.textContent=message;node.classList.add('show');clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>node.classList.remove('show'),3600);}
 function page(){return project.pages[state.pageIndex]||project.pages[0];}
 function selected(){return page()?.elements.find(e=>e.id===state.selectedId)||null;}
 function checkpoint(){if(state.history.length%8===0)backup('history checkpoint');state.history.push(C.clone(project));if(state.history.length>HISTORY_LIMIT)state.history.shift();state.future=[];}
 function mutate(fn,render=true){checkpoint();fn();persist();if(render)renderAll();}
 function undo(){if(!state.history.length)return toast('실행 취소 기록이 없습니다.');state.future.push(C.clone(project));project=state.history.pop();reconcile();persist();renderAll();}
 function redo(){if(!state.future.length)return toast('다시 실행 기록이 없습니다.');state.history.push(C.clone(project));project=state.future.pop();reconcile();persist();renderAll();}
 function reconcile(){maintainSelection();state.pageIndex=C.clamp(state.pageIndex,0,project.pages.length-1);if(!selected())state.selectedId=null;$('projectName').value=project.title;}
 const PADLOCK_SVG={
  closed:'<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>',
  open:'<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 017-2"/></svg>'
 };
 function updateSelectionDOM(){
  qsa('.element',$('slide')).forEach(n=>{
   const model=page().elements.find(el=>el.id===n.dataset.id),isLocked=!!model?.locked;
   const active=n.dataset.id===state.selectedId||state.selectedIds.has(n.dataset.id)||Boolean(selected()?.groupId&&model?.groupId===selected().groupId);
   n.classList.toggle('selected',active);n.classList.toggle('crop-editing',n.dataset.id===state.imageCropEditingId);
   n.querySelector('.resize-handle')?.remove();n.querySelector('.canvas-lock-toggle')?.remove();
   if(!active||state.preview||!model)return;
   const button=document.createElement('button');button.type='button';button.className='canvas-lock-toggle '+(isLocked?'is-locked':'is-unlocked');
   if(model.w<170||model.h<62)button.classList.add('compact');
   button.dataset.lockId=model.id;button.setAttribute('aria-label',isLocked?'자물쇠 열기 · 선택한 박스 잠금 해제':'자물쇠 잠그기 · 선택한 박스 잠금');
   button.title=isLocked?'클릭하여 잠금 해제':'클릭하여 잠금';
   button.innerHTML=(isLocked?PADLOCK_SVG.closed:PADLOCK_SVG.open)+`<span>${isLocked?'잠금 해제':'잠금'}</span>`;
   n.appendChild(button);
   if(!isLocked){const h=document.createElement('div');h.className='resize-handle';h.setAttribute('aria-label','Resize element');n.appendChild(h);}
  });
 }
 function writePageHash(){const hash=F.hashFor(project,page().id);if(root.location.hash!==hash)root.history.replaceState(null,'',hash);}
 function renderFrame(){const f=F.activate(project.frame);
  for(const id of ['slide','slideOuter','previewSlide']){const node=$(id);if(node){node.style.width=f.width+'px';node.style.height=f.height+'px';if(id==='previewSlide')node.style.flexBasis=f.width+'px';}}
  $('slideOuter').style.marginLeft=-f.width/2+'px';$('slideOuter').style.marginTop=-f.height/2+'px';
  const corner=qs('.left-corner');if(corner)corner.textContent=f.label+' · '+f.width+' × '+f.height;
  const options=project.groups.map(g=>`<button type="button" data-primary-group="${C.escapeHTML(g.id)}" aria-current="${g.id===page().groupId}" ${project.pages.some(p=>p.groupId===g.id)?'':'disabled'}>${C.escapeHTML(g.title)}</button>`).join('');
  for(const id of ['editorPrimaryTabs','previewPrimaryTabs']){let wrap=$(id);if(!wrap){wrap=document.createElement('nav');wrap.id=id;wrap.className='primary-tabs';wrap.setAttribute('aria-label','상위 주제 탭');if(id==='editorPrimaryTabs')qs('.canvas-toolbar').after(wrap);else $('previewViewport').before(wrap);}wrap.innerHTML=options;}
  const thumbs=qsa('.page-thumb');thumbs.forEach(n=>n.style.aspectRatio=f.width+'/'+f.height);
 }
 function masterMarkup(index){return root.DocutBranding?.markup(project.master,index,project.pages.length,project.frame)||'';}
 function renderSlide(){const pg=page();root.DocutScene.refresh(pg);root.DocutScene.currentPage=pg.elements;$('slide').className='slide theme-'+project.theme;$('slide').style.background=pg.background||'';const svgLayer=root.DocutUBSVectorSource?.layer(pg)||'';$('slide').innerHTML=svgLayer+pg.elements.map(b=>X.renderBlock(b,true)).join('')+(pg.referenceFidelity?.mode==='source-ratio'?'':masterMarkup(state.pageIndex));updateSelectionDOM();$('currentTabName').textContent=pg.tab;root.DocutDataMotion?.mount($('slide'),project,X.svgChart);root.DocutUBSVectorEdit?.instance?.sync();}
 function themeMini(theme){if(CAT?.PALETTES?.[theme]){const p=CAT.PALETTES[theme];return [p.bg,p.foreground];}const styles={wood:['#f2e7d6','#715a47'],consulting:['#f7f9fd','#203d65'],quarterly:['#dedff6','#545d9a'],ambient:['#222639','#e8d9d0'],editorial:['#eae3d5','#6d5d43'],slate:['#262b33','#d1d7df'],mint:['#e7f2ed','#245d4c']};return styles[theme]||styles.wood;}
 function renderPageList(){pageStrip?.render();const colors=themeMini(project.theme),node=$('pageList');node.innerHTML=project.pages.map((p,i)=>{if(p.groupId!==page().groupId)return ''; const thumbs=p.elements.filter(e=>!e.hidden).slice(0,18).map(e=>`<i class="mini-element mini-${C.escapeHTML(e.type)}" style="left:${(e.x/C.WIDTH*100).toFixed(2)}%;top:${(e.y/C.HEIGHT*100).toFixed(2)}%;width:${(e.w/C.WIDTH*100).toFixed(2)}%;height:${(e.h/C.HEIGHT*100).toFixed(2)}%"></i>`).join('');return `<button draggable="true" class="page-item ${i===state.pageIndex?'active':''}" data-page-index="${i}" aria-label="Page ${i+1} ${C.escapeHTML(p.tab)}"><span class="page-thumb" style="background:${colors[0]};color:${colors[1]};aspect-ratio:${C.WIDTH}/${C.HEIGHT}">${thumbs}</span><span class="page-desc"><span class="number">${String(i+1).padStart(2,'0')} / ${String(project.pages.length).padStart(2,'0')}</span><span class="name">${C.escapeHTML(p.tab)}</span>${project.reviews?.some(n=>n.pageId===p.id&&n.status==='open')?`<span class="review-page-pill">검토 ${project.reviews.filter(n=>n.pageId===p.id&&n.status==='open').length}</span>`:''}</span></button>`;}).join('');$('pageCount').textContent=project.pages.length;}
 function renderLayerList(){
  const nodes=[...page().elements].reverse(),esc=C.escapeHTML;
  const renderOne=(el,grouped=false)=>`<div class="layer-row ${grouped?'layer-child':''}"><button draggable="true" class="layer-item ${state.selectedIds.has(el.id)||state.selectedId===el.id?'active':''} ${el.hidden?'muted':''}" data-layer-id="${esc(el.id)}" title="${esc((el.text||'').slice(0,100))}"><span class="layer-ico">${({title:'T',text:'P',bar:'B',line:'L',donut:'D',stat:'Σ',table:'T',card:'C',kpi:'K',shape:'S',note:'N',image:'I',bullet:'1',quote:'Q',divider:'-',source:'R'})[el.type]||'E'}</span><span class="layer-label">${esc((el.text||el.type).split('\n')[0].slice(0,60))}</span></button><button type="button" class="mini-layer mini-layer-padlock" data-lock-id="${esc(el.id)}" aria-label="${el.locked?'잠금 해제':'잠금'}" title="${el.locked?'잠금 해제':'잠금'}">${el.locked?PADLOCK_SVG.closed:PADLOCK_SVG.open}</button><button class="mini-layer" data-hide-id="${esc(el.id)}" aria-label="Toggle visibility" title="Toggle visibility">${el.hidden?'x':'v'}</button></div>`;
  $('layerList').innerHTML=LAYERS.folders(nodes).map(entry=>{
   if(entry.kind==='item')return renderOne(entry.el);
   const collapsed=state.collapsedGroups.has(entry.id),active=entry.elements.some(el=>state.selectedIds.has(el.id)||state.selectedId===el.id);
   return `<div class="layer-folder" role="group" aria-label="${esc(entry.name)}"><div class="layer-folder-header"><button class="folder-toggle" data-collapse-group="${esc(entry.id)}" aria-label="${collapsed?'그룹 펼치기':'그룹 접기'}" aria-expanded="${!collapsed}">${collapsed?'▸':'▾'}</button><button class="folder-select ${active?'active':''}" data-select-group="${esc(entry.id)}" title="${esc(entry.name)}">▣ ${esc(entry.name)} <small>(${entry.elements.length})</small></button></div>${collapsed?'':entry.elements.map(el=>renderOne(el,true)).join('')}</div>`;
  }).join('');$('layerCount').textContent=nodes.length;
 }
 function renderThemes(){qsa('.quick-design-grid [data-theme]').forEach(b=>{const active=b.dataset.theme===project.theme;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});const node=$('themeList');node.innerHTML=C.THEMES.map(t=>{const colors=themeMini(t.id);return `<button class="theme-button ${project.theme===t.id?'active':''}" data-theme="${t.id}"><span class="theme-swatch" style="background:${colors[0]};color:${colors[1]};aspect-ratio:${C.WIDTH}/${C.HEIGHT}"><span></span></span><span class="theme-details"><strong>${t.name}</strong><small>${t.hint}</small></span></button>`}).join('');renderReferences();}
 function renderReferences(){
  const chooser=$('quickTransition');if(chooser){chooser.innerHTML=(CAT?.TRANSITIONS||[]).map(t=>`<option value="${C.escapeHTML(t.id)}" ${t.id===(page()?.transition||'fade')?'selected':''}>${C.escapeHTML(t.name)}</option>`).join('');}
  const area=$('referenceCatalog');if(!REF||!area||area.dataset.rendered==='v026')return;
  const esc=C.escapeHTML;
  area.innerHTML=REF.DATA.groups.map(g=>{
   const mapped=REF.DATA.items.filter(x=>x.group===g.id),canUse=g.operation!=='guide';
   return `<details class="reference-group"><summary>${esc(g.title)} · ${g.images}장</summary><p class="caption-small">${esc(g.note)}</p>${canUse?`<button type="button" class="inspect-action reference-group-action" data-ref-group="${esc(g.id)}">${esc(g.summary)} 추천 적용</button>`:''}<div class="reference-images">${mapped.map(item=>`<div class="reference-image-row"><span class="reference-index">${String(item.index+1).padStart(2,'0')}</span><span class="reference-desc" title="${esc(item.filename)}">${esc(item.description)}<small>${esc(item.status==='reference-only'?'개념 참고':item.status==='duplicate-example'?'중복·대체 컷':item.status==='approximate-implemented-family'?'유사 기능 구현, 원본 미대조':'전용 동작 미검증')}</small></span>${item.kind!=='guide'&&item.status!=='duplicate-example'?`<button type="button" data-ref-image="${item.index}" title="선택한 자료를 코드상 유사 프리셋에 연결">적용</button>`:''}</div>`).join('')}</div></details>`;
  }).join('');area.dataset.rendered='v026';filterReferences($('referenceSearch')?.value||'');
 }
 function filterReferences(raw){
  const query=String(raw||'').trim().toLocaleLowerCase(),area=$('referenceCatalog'),out=$('referenceMatchCount');
  if(!area||!REF)return;let matches=0;
  const groups=Array.from(area.querySelectorAll('.reference-group'));
  groups.forEach((g,i)=>{
   const group=REF.DATA.groups[i],groupMatch=query&&((group?.title||'')+' '+(group?.note||'')).toLocaleLowerCase().includes(query);
   let count=0;Array.from(g.querySelectorAll('.reference-image-row')).forEach((row,j)=>{
    const item=REF.DATA.items.filter(x=>x.group===group.id)[j];
    const haystack=[String((item?.index??-1)+1),String(item?.index??''),item?.filename,item?.description,item?.status].join(' ').toLocaleLowerCase();
    const visible=!query||groupMatch||haystack.includes(query);row.hidden=!visible;if(visible)count++;
   });
   g.hidden=count===0;matches+=count;if(query&&count)g.open=true;
  });
  if(out)out.textContent=query?`${matches}개 검색됨 · 총 ${REF.DATA.items.length}개`:`${REF.DATA.items.length}개 중 ${REF.DATA.items.length}개 항목`;
  const empty=$('referenceSearchEmpty');if(empty)empty.hidden=matches>0;
 }
 function applyReference(kind,target){
  if(!CAT||!['preset','transition','palette','layout'].includes(kind))return toast('이 레퍼런스는 개념·원리 분류로, 자동 적용할 효과가 없습니다.');
  try{if(kind==='preset'){
   const element=selected();if(!element||element.locked)return toast('먼저 잠금 해제된 적용 대상 요소를 선택하세요.');
   const stack=CAT.createStack(target,element.type);
   mutate(()=>{const current=selected();if(!current||current.locked)throw Error('선택한 요소가 바뀌었습니다.');current.effects=stack.map(C.clone);});
   play($('slide'));toast('선택 요소에 유사 효과를 적용했습니다. 원본 프레임과 동일하지 않습니다.');
  }else if(kind==='transition'){
   if(!CAT.TRANSITIONS.some(t=>t.id===target))throw Error('지원하지 않는 페이지 전환');
   if(page().transition!==target)mutate(()=>{page().transition=target;});
   const a=TRANS?.play($('slide'),target);if(a){stopAnimation();state.animations.push(a);}toast('현재 페이지 전환을 변경했습니다. 원본 참조와 픽셀 일치율은 미검증입니다.');
  }else if(kind==='palette'){
   if(!CAT.PALETTES[target])throw Error('지원하지 않는 팔레트');
   if(project.theme!==target)mutate(()=>{project.theme=target;});toast('기존 본문·출처를 유지하고 색상 프리셋을 적용했습니다.');
  }else{
   if(!C.LAYOUTS[target])throw Error('지원하지 않는 레이아웃');
   previewSemanticLayout(target);
  }}catch(error){toast('프리셋 적용 취소: '+error.message);}
 }
 let layoutProposal=null;
 function previewSemanticLayout(layout){
  layoutProposal=root.DocutSemanticLayout.plan(page(),layout);
  let dialog=$('semanticLayoutDialog');
  if(!dialog){dialog=document.createElement('dialog');dialog.id='semanticLayoutDialog';dialog.className='recovery-dialog';document.body.append(dialog);}
  const draw=pg=>'<div class="semantic-map">'+pg.elements.filter(e=>!e.hidden).map(e=>'<span title="'+C.escapeHTML(e.text||e.type)+'" style="left:'+e.x/1280*100+'%;top:'+e.y/720*100+'%;width:'+e.w/1280*100+'%;height:'+e.h/720*100+'%;background:'+(e.locked?'#aa895c':'#427e9c')+'">'+C.escapeHTML((e.text||e.type).slice(0,36))+'</span>').join('')+'</div>';
  dialog.innerHTML='<div class="recovery-title"><strong>의미 기반 배치 · 적용 전 비교</strong><button type="button" id="semanticCancel" aria-label="배치 취소">✕</button></div><p>원문·수치·출처 '+layoutProposal.summary.retained+'개 보존 / 잠금 '+layoutProposal.summary.locked+'개 / 그룹 '+layoutProposal.summary.groups+'개</p><div class="semantic-compare"><section><h3>현재</h3>'+draw(layoutProposal.before)+'</section><section><h3>변경 후</h3>'+draw(layoutProposal.after)+'</section></div><p role="status">'+(layoutProposal.ok?'배치 가능: '+layoutProposal.moves.length+'개 요소 위치·크기 변경. 적용 후 Undo로 복원할 수 있습니다.':C.escapeHTML(layoutProposal.issues[0].message))+'</p><button type="button" id="semanticApply" class="primary-btn" '+(layoutProposal.ok?'':'disabled')+'>배치 적용</button>';
  $('semanticCancel').onclick=()=>{dialog.close();layoutProposal=null;};
  $('semanticApply').onclick=()=>{try{const proposal=layoutProposal;if(!proposal?.ok)return;root.DocutSemanticLayout.apply(C.clone(page()),proposal);mutate(()=>root.DocutSemanticLayout.apply(page(),proposal));dialog.close();layoutProposal=null;toast('콘텐츠를 보존하고 배치를 적용했습니다.');}catch(e){toast(e.message);}};
  dialog.showModal();
 }
 function selectElement(id,add=false){if(id!==state.imageCropEditingId)state.imageCropEditingId=null;if(!add&&id){const parent=page().elements.find(e=>e.id===id);if(parent?.groupId){state.selectedIds=new Set(page().elements.filter(e=>e.groupId===parent.groupId).map(e=>e.id));state.selectedId=id;updateSelectionDOM();renderLayerList();renderInspector();renderTimeline();if(state.rightMode==='validation')renderValidation();return;}}if(add){if(state.selectedIds.has(id))state.selectedIds.delete(id);else if(id)state.selectedIds.add(id);}else state.selectedIds=new Set(id?[id]:[]);state.selectedId=id;updateSelectionDOM();renderLayerList();renderInspector();renderTimeline();if(state.rightMode==='validation')renderValidation();}
 function renderAll(){document.body.classList.toggle('docut-previewing',state.preview);F.activate(project.frame);reconcile();renderFrame();renderSlide();renderPageList();renderLayerList();renderThemes();renderInspector();renderTimeline();displayLayouts();if(state.rightMode==='validation')renderValidation();updateZoom();pageStrip?.render();}
 function closePages(){document.body.classList.remove('mobile-pages-open');$('mobilePagesBackdrop').hidden=true;$('mobilePagesToggle').setAttribute('aria-expanded','false');}
 function togglePages(){const open=document.body.classList.toggle('mobile-pages-open');$('mobilePagesBackdrop').hidden=!open;$('mobilePagesToggle').setAttribute('aria-expanded',String(open));}
 function selectPage(index){const i=C.clamp(index,0,project.pages.length-1);state.pageIndex=i;state.selectedId=null;state.imageCropEditingId=null;closePages();renderAll();writePageHash();}
 function textField(label,path,value,extra=''){return `<div class="inspect-field"><label>${label}</label><input class="inspect-input" data-path="${path}" value="${C.escapeHTML(value??'')}" ${extra}></div>`;}
 function numField(label,path,value,min=0,max=2000,step=1){return textField(label,path,value,`type="number" min="${min}" max="${max}" step="${step}"`);}
 function colorField(label,path,value){return `<div class="inspect-field"><label>${label}</label><input class="inspect-input" data-path="${path}" type="color" value="${/^#[0-9a-f]{6}$/i.test(value||'')?value:'#ffffff'}"></div>`;}
 function section(title,content){return `<section class="inspect-section"><div class="inspect-section-title">${title}</div>${content}</section>`;}
 function renderInspector(){const openPoseSections=new Set(qsa('details[data-pose-section]', $('inspector')).filter(n=>n.open).map(n=>n.dataset.poseSection));const el=selected();$('inspectorTitle').textContent=el?(labels[el.type]||'요소 속성'):'페이지 설정';$('selectionType').textContent=el?el.type.toUpperCase():'PAGE';let html='';
  if(!el){const pg=page();html+=section('페이지 구성',textField('탭 제목','page.tab',pg.tab)+textField('핵심 헤드라인','page.headline',pg.headline)+`<div class="inspect-field"><label>설명 / 메모</label><textarea class="inspect-textarea" data-path="page.subtitle" rows="3">${C.escapeHTML(pg.subtitle)}</textarea></div>`+colorField('배경색','page.background',pg.background)+`<div class="inspect-field"><label>페이지 장면 전환</label><select class="inspect-select" data-path="page.transition">${(CAT?.TRANSITIONS||[]).map(t=>`<option value="${t.id}" ${t.id===(pg.transition||'fade')?'selected':''}>${t.name}</option>`).join('')}</select></div><div class="inspect-inline"><button class="inspect-action" data-action="clear-page-bg">테마 배경 사용</button></div>`);
    html+=section('영상형 장면·캡션',`<p class="caption-small">페이지별 3~60초 재생. 자동재생은 재생 화면에서 직접 시작하며, 공개 HTML도 같은 장면 시간과 캡션을 사용할 수 있습니다. 캡션은 공개 화면에 표시되는 문구이므로 내부 담당자 정보는 입력하지 마세요.</p><div class="inspect-field"><label for="pageDurationSeconds">장면 재생 시간 (초)</label><input class="inspect-input" id="pageDurationSeconds" data-playback-seconds type="number" min="3" max="60" step="0.5" value="${ST.duration(pg.playbackMs)/1000}"></div><div class="inspect-field"><label for="storyCaptionStyle">캡션 화면 스타일</label><select class="inspect-select" id="storyCaptionStyle" data-caption-style>${[['cinema','시네마틱 · 어두운 자막'],['glass','글라스 · 반투명 패널'],['minimal','미니멀 · 은은한 텍스트']].map(([id,label])=>`<option value="${id}" ${pg.captionStyle===id?'selected':''}>${label}</option>`).join('')}</select></div><div class="inspect-field"><label for="storyCaptionScript">화면 캡션 · 한 줄당 시작-종료 | 문구</label><textarea id="storyCaptionScript" class="inspect-textarea" rows="5" placeholder="0-4 | 핵심 결론\n4-9 | 근거와 시사점">${C.escapeHTML(ST.toScript(pg.captions||[]))}</textarea></div><div class="inspect-inline"><button class="inspect-action" data-action="caption-apply">캡션 시간·문구 검토 후 적용</button></div><p class="caption-small">예: 00:00.0-00:04.0 | 핵심 메시지 · 최대 16개, 220자/개. 겹치거나 장면 시간을 넘는 캡션은 전체 반영을 취소합니다.</p>`);
    html+=section('페이지 작업',`<div class="inspect-inline"><button class="inspect-action" data-action="auto-motion-page">✦ 요소별 추천 모션</button></div><div class="inspect-inline"><button class="inspect-action" data-action="duplicate-page">페이지 복제</button><button class="inspect-action" data-action="move-page-prev">← 앞</button><button class="inspect-action" data-action="move-page-next">뒤 →</button></div><div class="inspect-inline" style="margin-top:9px"><button class="inspect-action danger" data-action="delete-page">페이지 삭제</button></div>`);
    html+=section('사용 방법',`<div class="empty-select"><strong>영상 편집하듯 보고서를 제작합니다.</strong>요소를 선택하면 위치·서체·색상·모션 속성이 여기에 나타납니다.<ul><li>더블클릭: 텍스트 직접 편집</li><li>모서리 드래그: 크기 변경</li><li>Ctrl + ← / →: 페이지 이동</li><li>Ctrl + D: 요소 복제</li><li>Delete: 선택 요소 삭제</li></ul></div>`);
  }else{
    const s=el.style;
    if(el.type!=='shape'&&el.type!=='image'){html+=section('콘텐츠',`<div class="inspect-field"><label>표시할 텍스트</label><textarea class="inspect-textarea" data-path="element.text" rows="4">${C.escapeHTML(el.text)}</textarea></div>`+(el.type==='bar'||el.type==='line'||el.type==='donut'?`<div class="inspect-field"><label>차트 데이터 · 한 줄에 '이름: 숫자'</label><textarea class="inspect-textarea" data-path="chart.series" rows="4">${C.escapeHTML((el.data.labels||[]).map((l,i)=>l+': '+(el.data.values[i]??0)).join('\n'))}</textarea></div>`:'')+(el.type==='table'?`<div class="inspect-field"><label>표 데이터 · | 기호로 열 구분</label><textarea class="inspect-textarea" data-path="table.rows" rows="5">${C.escapeHTML((el.data.rows||[]).map(row=>row.join(' | ')).join('\n'))}</textarea></div>`:''));}
    if(el.type==='stat'&&S){const kind=S.lookup[el.data?.kind]||S.KINDS[0],warnings=S.warnings(el.data||{});
      const controls=`<div class="inspect-field"><label>통계 시각화 유형</label><select class="inspect-select" data-stat-kind aria-label="통계 차트 유형">${S.KINDS.map(k=>`<option value="${k.id}" ${k.id===kind.id?'selected':''}>${C.escapeHTML(k.name)}</option>`).join('')}</select></div>`+
       `<p class="caption-small">${C.escapeHTML(kind.hint)}. 유형을 바꾸면 입력값은 실행 취소로 복원할 수 있습니다.</p>`+
       `<div class="inspect-inline"><button class="inspect-action" type="button" data-action="stat-copy-columns" title="엑셀이나 CSV 첫 행에 붙여넣을 통계 필드명 복사">자료 열 제목 복사</button></div>`+
       `<div class="inspect-field"><label>원자료 · ${C.escapeHTML(kind.columns.join(' | '))}</label><textarea class="inspect-textarea" rows="6" data-stat-rows aria-label="통계 원자료">${C.escapeHTML(S.formatRows(el.data))}</textarea></div>`+
       (kind.id==='control'?`<div class="inspect-row">${[['lower','하한'],['center','중심'],['upper','상한']].map(([key,label])=>`<label class="inspect-field">${label}<input class="inspect-input" data-stat-limit="${key}" type="number" step="any" value="${el.data?.limits?.[key]??''}" placeholder="값 입력"></label>`).join('')}</div>`:'')+
       (kind.id==='forest'?`<div class="inspect-field"><label>비교 기준선 (선택 · 직접 입력한 0 / 1 / 기타 값)</label><input class="inspect-input" type="number" step="any" data-stat-reference aria-label="포레스트 플롯 비교 기준선" value="${el.data?.referenceValue??''}" placeholder="미지정 · 기준선을 생성하지 않음"></div>`:'')+
       `<div class="inspect-field"><label>통계 색상 팔레트</label><select class="inspect-select" data-stat-palette>${Object.keys(C.CHART_PALETTES||{}).map(key=>`<option value="${key}" ${el.data?.palette===key?'selected':''}>${C.escapeHTML(key)}</option>`).join('')}</select></div>`+
       warnings.map(w=>`<p class="caption-small stat-warning">${C.escapeHTML(w)}</p>`).join('')+
       `<p class="caption-small">숫자와 근거가 없으면 차트가 표시되지 않습니다. CSV/TSV 행도 붙여넣을 수 있습니다. 내용 변경 시 검증 상태는 해제됩니다.</p>`;
      html+=section('근거 기반 통계차트',controls);
    }
    if(el.type==='image')html+=section('이미지',`<button class="inspect-action" data-action="upload-image">PNG / JPG / WEBP 선택</button><button class="inspect-action ${state.imageCropEditingId===el.id?'active':''}" data-action="toggle-image-crop" aria-pressed="${state.imageCropEditingId===el.id}">${state.imageCropEditingId===el.id?'초점 위치 편집 종료':'사진 안쪽 드래그로 초점 위치 편집 (방향키 1% · Shift 10%)'}</button><button class="inspect-action" data-action="reset-image-focus">초점·확대 초기화</button><div class="inspect-field"><label>대체 설명 (스크린리더 및 HTML)</label><input class="inspect-input" data-adv="data.alt" maxlength="300" value="${C.escapeHTML(el.data?.alt||'')}" placeholder="이미지의 의미를 구체적으로 설명"></div><label class="inspect-field"><input type="checkbox" data-path="style.aspectLock" ${s.aspectLock?'checked':''}> 크기 비율 유지 (숫자·모서리 드래그)</label><p class="caption-small">이미지 프레임은 비파괴적으로 조정됩니다. 원본 사진은 변경하지 않습니다. 원본 이미지는 보존되며 초점·확대 설정은 HTML에 반영됩니다.</p>`);
    if(el.groupId)html+=section('레이어 폴더',textField('그룹 이름 · 최대 80자','group.name',el.groupLabel||'그룹',`maxlength="80"`)+`<p class="caption-small">그룹 전체에 같은 이름을 적용합니다. 자식 레이어를 접거나 펼칠 수 있으며 겹침 순서는 변경되지 않습니다.</p>`);
    html+=section('위치와 크기',`<div class="inspect-row">${numField('X 위치','element.x',Math.round(el.x),0,C.WIDTH)}${numField('Y 위치','element.y',Math.round(el.y),0,C.HEIGHT)}</div><div class="inspect-row">${numField('너비','element.w',Math.round(el.w),40,C.WIDTH)}${numField('높이','element.h',Math.round(el.h),30,C.HEIGHT)}</div><div class="inspect-inline"><button class="inspect-action" data-action="move-front">맨 앞으로</button><button class="inspect-action" data-action="move-back">맨 뒤로</button></div>`);
    html+=section('캔버스 기준 정렬',`<div class="inspect-row" style="grid-template-columns:repeat(3,minmax(0,1fr))"><button class="inspect-action" data-action="align-left">왼쪽</button><button class="inspect-action" data-action="align-hcenter">가운데</button><button class="inspect-action" data-action="align-right">오른쪽</button><button class="inspect-action" data-action="align-top">위쪽</button><button class="inspect-action" data-action="align-vcenter">중앙</button><button class="inspect-action" data-action="align-bottom">아래쪽</button></div>`);
    let typo='';if(!['shape','image'].includes(el.type)){typo=`<div class="inspect-row">${numField('글자 크기 (px)','style.size',s.size,10,100)}<div class="inspect-field"><label>글꼴</label><select class="inspect-select" data-path="style.font">${['Pretendard','Noto Sans KR','Nanum Gothic','Nanum Myeongjo','Noto Serif KR','SUIT','Gmarket Sans','Arial','Georgia','system-ui'].map(x=>`<option ${x===s.font?'selected':''}>${x}</option>`).join('')}</select></div></div><div class="inspect-row"><div class="inspect-field"><label>굵기</label><select class="inspect-select" data-path="style.weight">${[300,400,500,600,700,800,900].map(n=>`<option ${n===s.weight?'selected':''}>${n}</option>`).join('')}</select></div><div class="inspect-field"><label>정렬</label><select class="inspect-select" data-path="style.align">${['left','center','right'].map(x=>`<option value="${x}" ${s.align===x?'selected':''}>${({left:'왼쪽',center:'중앙',right:'오른쪽'})[x]}</option>`).join('')}</select></div></div>`;}
    html+=section('스타일',typo+`<div class="inspect-row">${colorField('글자색','style.color',s.color)}${colorField('배경색','style.background',s.background)}</div><div class="inspect-inline"><button class="inspect-action" data-action="clear-element-bg">배경 투명</button></div><div class="inspect-row">${numField('모서리 (px)','style.radius',s.radius,0,80)}${numField('그림자','style.shadow',s.shadow,0,80)}</div><div class="inspect-field"><label>요소 전체 불투명도 (글자 포함) ${Math.round(s.opacity*100)}%</label><input class="inspect-input" data-path="style.opacity" type="range" min="0.1" max="1" step="0.05" value="${s.opacity}"></div><div class="inspect-field"><label>배경 불투명도 ${Math.round((s.backgroundOpacity??1)*100)}% · 글자는 그대로 유지</label><input class="inspect-input" type="range" data-path="style.backgroundOpacity" min="0" max="1" step="0.05" value="${s.backgroundOpacity??1}"></div>`);
    if(el.effects.some(fx=>['cursor-glow','cursor-tilt','ambient-aura','edge-light'].includes(fx.kind)))html+=section('라이트·커서 반응 조절',`<p class="caption-small">선택한 박스에만 적용되며, 인쇄 시 포인터 반응은 정적으로 표시됩니다. 설정을 바꾼 뒤 박스 위에서 마우스를 움직여 확인하세요.</p><div class="inspect-row">${colorField('빛 색상','style.fxLightColor',s.fxLightColor||'#71aeff')}${numField('빛 반경 (px)','style.fxGlowRadius',s.fxGlowRadius??220,80,500,10)}</div><div class="inspect-row">${numField('빛 강도 (0–1)','style.fxGlowStrength',s.fxGlowStrength??.7,0,1,.05)}${numField('기울기 최대각 (°)','style.fxTiltStrength',s.fxTiltStrength??6.5,0,18,.5)}</div>${numField('엣지 라이트 속도 (초)','style.fxEdgeSpeed',s.fxEdgeSpeed??6,2,14,.5)}<p class="caption-small">빛 반경·색상·강도·각도·속도는 요소별로 저장되며 내보낸 HTML에도 반영됩니다.</p>`);
    const slots=el.effects.map((fx,i)=>`<div class="effect-slot"><div class="effect-slot-header"><span>효과 ${i+1} · ${effectNames[fx.kind]||fx.kind}</span><div class="effect-order-tools"><button type="button" data-move-effect="${i}:-1" title="순서 올리기" ${i===0?'disabled':''}>↑</button><button type="button" data-move-effect="${i}:1" title="순서 내리기" ${i===el.effects.length-1?'disabled':''}>↓</button><button type="button" data-remove-effect="${i}" title="효과 제거">×</button></div></div><div class="inspect-field"><label>동작</label><select class="inspect-select" data-effect="${i}" data-effect-key="kind">${motionOptions(el.type,fx.kind)}</select></div><div class="inspect-row">${numEffectField('시간 (ms)',i,'duration',fx.duration,100,3000)}${numEffectField('지연 (ms)',i,'delay',fx.delay,0,8000)}</div></div>`).join('');
    html+=section('모션 스택 · 최대 3개',slots+`<button type="button" class="inspect-action premium-cta" data-action="effects-studio">✦ 89개 모션 아이콘 열기</button>${el.exitOnNext?.length?'<div class="inspect-inline"><span class="caption-small">다음 페이지 이동 시 퇴장 설정됨</span><button type="button" class="inspect-action" data-action="clear-next-exit">퇴장 해제</button></div>':''}<div class="inspect-inline"><button class="inspect-action" data-action="add-effect" ${el.effects.length>=3?'disabled':''}>+ 모션 추가</button><button class="inspect-action" data-action="restart-preview">▶ 현재 모션</button><button class="inspect-action" data-action="smart-motion-block">추천 모션</button></div><p class="caption-small">효과는 위에서 아래로 순서대로 재생됩니다. 무한 반복 효과는 사용하지 않습니다.</p>`);
    html+=section('요소 작업',`<div class="inspect-inline"><button class="inspect-action" data-action="duplicate">${chosen().length>1?'선택 개체 모두 복제':'복제 Ctrl+D'}</button><button class="inspect-action danger" data-action="delete-element">${chosen().length>1?'선택 개체 모두 삭제':'삭제'}</button></div>`);
    if(chosen().length>1)html+=section('다중 선택 · '+chosen().length+'개',`<div class="inspect-inline"><button class="inspect-action" data-action="batch-lock">선택 잠금</button><button class="inspect-action" data-action="batch-unlock">잠금 해제</button><button class="inspect-action" data-action="batch-hide">선택 숨김</button><button class="inspect-action" data-action="batch-show">숨김 해제</button></div><div class="inspect-inline"><button class="inspect-action" data-action="distribute-h">가로 간격 균등</button><button class="inspect-action" data-action="distribute-v">세로 간격 균등</button></div><p class="caption-small">정렬은 전체 레이어 위치를 함께 이동하여 상대 간격을 유지합니다. 균등 간격은 겹침 없이 3개 이상일 때만 적용합니다. 잠긴 레이어는 제외됩니다. Delete / Ctrl+D / 방향키는 선택한 레이어 전체에 적용합니다.</p>`);
  }
  $('inspector').innerHTML=html;renderAdvancedInspector(el);qsa('details[data-pose-section]', $('inspector')).forEach(n=>{n.open=openPoseSections.has(n.dataset.poseSection);});syncRightPanel();
 }
 function motionOptions(type,current){
  const original=C.EFFECTS.filter(([id])=>!CAT?.KINDS.some(k=>k.kind===id));
  const base='<optgroup label="기본 모션">'+original.map(([id,name])=>`<option value="${id}" ${id===current?'selected':''}>${C.escapeHTML(name)}</option>`).join('')+'</optgroup>';
  return base+Object.entries(CAT?.CATEGORIES||{}).filter(([key])=>key!=='transition').map(([key,name])=>{const kinds=CAT.KINDS.filter(k=>k.category===key&&(CAT.supports(k.kind,type)||k.kind===current));if(!kinds.length)return '';return `<optgroup label="${C.escapeHTML(name)}">${kinds.map(k=>`<option value="${k.kind}" ${k.kind===current?'selected':''}>${C.escapeHTML(k.name)}</option>`).join('')}</optgroup>`;}).join('');
 }
 function presetGallery(type){const groups=Object.entries(CAT?.CATEGORIES||{}).filter(([key])=>key!=='transition');return `<div class="motion-preset-help">모션은 선택 요소에만 적용되며, Undo로 복원할 수 있습니다.</div>`+groups.map(([key,name])=>{const values=CAT.PRESETS.filter(p=>p.category===key&&p.kinds.every(k=>CAT.supports(k,type)));if(!values.length)return '';return `<div class="motion-preset-category"><strong>${C.escapeHTML(name)}</strong><div class="motion-preset-grid">${values.map(p=>`<button type="button" class="motion-preset-card" data-visual-preset="${p.id}" aria-label="${C.escapeHTML(p.name)} 효과 적용">${C.escapeHTML(p.name)}<small>${p.kinds.map(k=>CAT.KINDS.find(x=>x.kind===k)?.name||k).join(' · ')}</small></button>`).join('')}</div></div>`;}).join('');}
 function numEffectField(label,i,key,value,min,max){return `<div class="inspect-field"><label>${label}</label><input class="inspect-input" type="number" data-effect="${i}" data-effect-key="${key}" value="${value}" min="${min}" max="${max}" step="50"></div>`;}
 function timelineMax(){return Math.max(8000,Math.min(42000,Math.ceil(Math.max(0,...page().elements.map(e=>E?.totalDuration(e.effects)||0))/1000)*1000));}
 function renderTimeline(){const max=timelineMax();$('timelineScrub').max=max;$('timelineDuration').textContent=`${Math.round(max/1000)}초 구간 · 최대 3개 효과`;const es=page().elements,area=$('timelineTracks'),count=es.reduce((n,e)=>n+e.effects.length,0);$('effectCount').textContent=count+' effects';$('timeRuler').innerHTML=Array.from({length:9},(_,i)=>`<span>${(max*i/8000).toFixed(max===8000?0:1)}s</span>`).join('');area.innerHTML=es.map(el=>{let previous=0;const bars=(el.effects||[]).map((fx,index)=>{const left=previous+(fx.delay||0);previous=left+fx.duration;return `<span class="effect-bar" data-timeline-element="${C.escapeHTML(el.id)}" data-timeline-index="${index}" style="left:${Math.min(98,left/max*100)}%;width:${Math.max(2,fx.duration/max*100)}%" title="${C.escapeHTML(fx.kind)}"><span class="effect-duration-handle" title="Adjust duration"></span>${(fx.keyframes||[]).map((k,j)=>`<i class="keyframe-mark" style="left:${k.at*100}%" data-keyframe-timeline="${index}:${j}" title="Drag keyframe"></i>`).join('')}${C.escapeHTML(fx.kind)}</span>`}).join('');return `<div class="timeline-track ${state.selectedId===el.id?'active':''}" data-track-id="${C.escapeHTML(el.id)}"><span class="track-name">${C.escapeHTML(el.type)} - ${C.escapeHTML((el.text||'').slice(0,18))}</span><div class="track-bars">${bars}</div></div>`;}).join('')||'<p class="timeline-empty">Add an element to set its motion</p>';}
 function updateZoom(){const area=$('stageArea').getBoundingClientRect();state.fit=Math.max(.01,Math.min(1.2,(area.width-48)/C.WIDTH,(area.height-52)/C.HEIGHT));state.scale=state.fit*state.zoom/100;$('slideOuter').style.transform=`scale(${state.scale})`;$('zoomRange').value=state.zoom;$('zoomDisplay').textContent=state.zoom===100?'맞춤':state.zoom+'%';}
 function stopAnimation(){state.animations.forEach(a=>{try{a.cancel()}catch(e){}});state.animations=[];}
 function play(pageElement){stopAnimation();if(root.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;for(const el of page().elements){if(el.hidden||!el.effects.length)continue;const dom=qsa('.element',pageElement).find(n=>n.dataset.id===el.id);if(!dom)continue;const built=E?.buildFrames(el.effects,1000/60);if(!built?.duration)continue;const animation=dom.animate(built.frames,{duration:built.duration,fill:'both',easing:'linear'});state.animations.push(animation);const visual=M?.play(dom,el.effects);if(visual)state.animations.push({cancel:()=>visual.cancel(),pause:()=>visual.animations.forEach(a=>a.pause()),play:()=>visual.animations.forEach(a=>a.play()),animations:visual.animations});}
  if(state.preview&&storyController){const rate=storyController.getState().speed;state.animations.forEach(a=>{try{if(typeof a.playbackRate==='number')a.playbackRate=rate;else a.animations?.forEach(b=>b.playbackRate=rate);}catch(_){}});} }
 let storyController=null;
 function refreshStoryState(snapshot){
  if(!state.preview||!storyController)return;
  const t=snapshot||storyController.getState(),running=t.playing;
  $('storyToggle').textContent=running?'Ⅱ 일시정지':'▶ 자동재생';$('storyToggle').setAttribute('aria-pressed',String(running));
  $('storySeek').max=t.durationMs;$('storySeek').value=Math.round(t.elapsedMs);
  $('storyClock').textContent=ST.printStamp(t.elapsedMs)+' / '+ST.printStamp(t.durationMs);
  $('storyAllSeek').max=t.totalMs;$('storyAllSeek').value=Math.round(t.globalElapsedMs);$('storyAllClock').textContent=ST.printStamp(t.globalElapsedMs)+' / '+ST.printStamp(t.totalMs);
  qsa('[data-story-index]',$('storyboardStrip')).forEach((node,i)=>{const active=i===t.index;node.setAttribute('aria-current',String(active));const part=qs('.storyboard-progress',node);if(part)part.style.width=active?Math.round(t.progress*1000)/10+'%':i<t.index?'100%':'0%';});
  $('storySpeed').value=String(t.speed);$('storyLoop').checked=t.loop;
  const cue=$('storyCaptions').checked?ST.activeCaption(page().captions||[],t.elapsedMs):'';
  $('previewCaption').textContent=cue;$('previewCaption').className='preview-caption caption-style-'+(ST.STYLES.includes(page().captionStyle)?page().captionStyle:'cinema');$('previewCaption').hidden=!cue;
 }
 function renderStoryboardStrip(){const total=ST.totalDuration(project.pages)||1,wrap=$('storyboardStrip');if(!wrap)return;
  wrap.innerHTML=project.pages.map((pg,i)=>`<button type="button" class="storyboard-scene" data-story-index="${i}" aria-current="${i===state.pageIndex?'true':'false'}" style="flex-grow:${Math.round(1000*ST.duration(pg.playbackMs)/total)}" title="${C.escapeHTML(pg.tab)} · ${ST.duration(pg.playbackMs)/1000}초"><span class="storyboard-progress" style="width:0%"></span><span class="storyboard-scene-label">${String(i+1).padStart(2,'0')} ${C.escapeHTML(pg.tab)}</span><small>${ST.duration(pg.playbackMs)/1000}s</small></button>`).join('');
 }
 function previewJump(index){
  if(!state.preview||!storyController)return selectPage(index);
  storyController.jump(C.clamp(index,0,project.pages.length-1));
 }
 function applyStoryDuration(raw){
  if(selected())return toast('페이지 설정을 선택한 뒤 변경하세요.');
  let ms;try{const n=Number(raw);if(raw===''||!Number.isFinite(n))throw Error('숫자를 입력하세요.');ms=ST.duration(Math.round(n*1000));ST.validateCaptions(page().captions,ms);}catch(error){toast('장면 시간 유지: '+error.message);renderInspector();return;}
  if(ms===ST.duration(page().playbackMs))return;
  mutate(()=>{page().playbackMs=ms;});toast('현재 페이지 자동재생 시간 '+(ms/1000)+'초로 변경했습니다.');
 }
 function applyCaptionScript(){
  if(selected())return toast('페이지를 선택한 뒤 캡션을 편집하세요.');
  const field=$('storyCaptionScript');if(!field)return;
  let cues;try{cues=ST.parseScript(field.value,ST.duration(page().playbackMs));}catch(error){toast('원본 캡션 유지: '+error.message);return;}
  if(JSON.stringify(cues)===JSON.stringify(page().captions||[])){toast('캡션 내용이 변경되지 않았습니다.');return;}
  mutate(()=>{page().captions=cues;});toast('현재 페이지 캡션 '+cues.length+'개를 적용했습니다.');
 }
 let previewExitToken=0;
 function previewNavigate(i){const token=++previewExitToken,old=page();
  if(i<=state.pageIndex||!state.preview||root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches){selectPage(i);renderPreview();return;}
  const exitItems=old.elements.filter(e=>!e.hidden&&e.exitOnNext?.length);
  if(!exitItems.length){selectPage(i);renderPreview();return;}
  let duration=0;for(const item of exitItems){const target=qsa('.element',$('previewSlide')).find(n=>n.dataset.id===item.id);if(!target?.animate)continue;
   const built=root.DocutEasing?.buildFrames(item.exitOnNext,1000/60);if(!built?.duration)continue;
   const time=Math.min(950,Math.max(200,built.duration));duration=Math.max(duration,time);
   try{state.animations.push(target.animate(built.frames,{duration:time,fill:'forwards',easing:'linear'}));}catch(_){}}
  if(!duration){selectPage(i);renderPreview();return;}
  root.setTimeout(()=>{if(token!==previewExitToken||!state.preview)return;selectPage(i);renderPreview();},duration);
 }
 function showPreview(){if(state.editingId)finishEditing();state.imageCropEditingId=null;qs('.rightbar')?.classList.remove('show');state.preview=true;state.selectedId=null;$('previewOverlay').hidden=false;
  storyController?.destroy();storyController=ST.makeController({getPages:()=>project.pages,onPage:i=>previewNavigate(i),onTick:refreshStoryState});
  renderStoryboardStrip();storyController.jump(state.pageIndex);refreshStoryState();}
 function renderPreview(){renderFrame();const pg=page(),node=$('previewSlide');root.DocutScene.refresh(pg);root.DocutScene.currentPage=pg.elements;node.className='slide theme-'+project.theme;node.style.background=pg.background||'';node.innerHTML=(root.DocutUBSVectorSource?.layer(pg)||'')+pg.elements.map(el=>X.renderBlock(el)).join('')+(pg.referenceFidelity?.mode==='source-ratio'?'':masterMarkup(state.pageIndex));qsa('textarea[data-note-id]',node).forEach(t=>{const key='docut-note:'+t.dataset.noteId;try{t.value=localStorage.getItem(key)||'';}catch(e){}t.addEventListener('input',()=>{try{localStorage.setItem(key,t.value)}catch(e){}});});$('previewCounter').textContent=String(state.pageIndex+1).padStart(2,'0')+' / '+String(project.pages.length).padStart(2,'0');$('previewTabs').innerHTML=project.pages.map((p,i)=>p.groupId!==page().groupId?'':`<button data-preview-index="${i}" class="${i===state.pageIndex?'active':''}">${C.escapeHTML(p.tab)}</button>`).join('');root.DocutDataMotion?.mount(node,project,X.svgChart);resizePreview();refreshStoryState();play(node);const transition=TRANS?.play(node,pg.transition||'fade',{speed:storyController?.getState()?.speed||1});if(transition)state.animations.push(transition);}
 function resizePreview(){const area=$('previewViewport').getBoundingClientRect();const scale=Math.max(.01,Math.min(1.8,(area.width-36)/C.WIDTH,(area.height-26)/C.HEIGHT));$('previewSlide').style.transform=`scale(${scale})`;}
 function closePreview(){previewExitToken++;stopAnimation();storyController?.destroy();storyController=null;
  if(document.fullscreenElement===$('previewOverlay'))document.exitFullscreen?.().catch(()=>{});
  state.preview=false;$('previewOverlay').hidden=true;$('previewCaption').hidden=true;renderAll();}
 // Private feedback is kept in native JSON only and is never painted on report slides.
 function showReviews(){if(!REV)return toast('내부 검토 모듈을 불러오지 못했습니다.');
  const scope=$('reviewScope');scope.querySelector('option[value="element"]').disabled=!selected();if(!selected()&&scope.value==='element')scope.value='page';
  renderReviews();openDialog('reviewDialog');
 }
 function renderReviews(){if(!REV)return;const stats=REV.summary(project),rows=REV.filter(project,{status:state.reviewStatus,priority:state.reviewPriority,query:state.reviewQuery}),escape=C.escapeHTML;
  $('reviewSummary').textContent=`검토 ${stats.total}건 · 미해결 ${stats.open}건(높음 ${stats.highOpen}) · 해결 ${stats.resolved}건(원문 변경 후 재검토 ${stats.staleResolved}) · 연결 해제 ${stats.orphans}건 · 답글 ${stats.replies}건`;
  const visible=rows.slice(0,state.reviewVisible);
  $('reviewList').innerHTML=visible.map(note=>{const a=REV.anchor(note,project.pages),orphan=a.state==='orphan',replies=note.replies.map(reply=>`<div class="review-reply"><strong>${escape(reply.author||'익명')}</strong> <time>${escape(reply.at.slice(0,16).replace('T',' '))}</time><p>${escape(reply.body)}</p></div>`).join('');
    return `<article class="review-note" data-review-note="${escape(note.id)}"><div class="review-note-head"><span class="review-priority review-${escape(note.priority)}">${({high:'높음',normal:'보통',low:'낮음'})[note.priority]}</span><strong>${note.status==='open'?'미해결':'해결'}</strong><span>${escape(note.author||'익명')}</span></div><p class="review-body">${escape(note.body)}</p>${REV.isStale(note,project.pages)?'<p class="review-stale">해결 처리 뒤 원문이 변경됐습니다. 재검토가 필요합니다.</p>':''}<p class="review-location ${orphan?'review-orphan':''}">${escape(a.label)} · ${escape(note.updatedAt.slice(0,16).replace('T',' '))}</p>${note.anchorHint?`<p class="review-location">${escape(note.anchorHint)}</p>`:''}
     ${replies}<div class="review-note-actions"><button type="button" class="inspect-action" data-review-act="jump" data-review-id="${escape(note.id)}" ${a.pageIndex<0?'disabled':''}>해당 위치로</button><button type="button" class="inspect-action" data-review-act="status" data-review-id="${escape(note.id)}">${note.status==='open'?'해결 표시':'재검토'}</button>${orphan?`<button type="button" class="inspect-action" data-review-act="retarget" data-review-id="${escape(note.id)}">현재 페이지/요소에 다시 연결</button>`:''}<label class="review-priority-select">우선순위<select class="inspect-input" data-review-priority="${escape(note.id)}"><option value="high" ${note.priority==='high'?'selected':''}>높음</option><option value="normal" ${note.priority==='normal'?'selected':''}>보통</option><option value="low" ${note.priority==='low'?'selected':''}>낮음</option></select></label></div>
     <details class="review-edit-details"><summary>본문 수정</summary><label>수정할 메모<textarea class="inspect-textarea" data-review-edit="${escape(note.id)}" maxlength="2000">${escape(note.body)}</textarea></label><button class="inspect-action" type="button" data-review-act="edit" data-review-id="${escape(note.id)}">수정 저장 (실행취소 가능)</button></details>
     ${note.status==='open'?`<details class="review-edit-details"><summary>답글 작성</summary><label>답글<textarea class="inspect-textarea" data-review-reply="${escape(note.id)}" maxlength="2000" placeholder="수정 요청에 대한 답변"></textarea></label><button class="inspect-action" data-review-act="reply" data-review-id="${escape(note.id)}">답글 저장</button></details>`:''}</article>`;}).join('')||'<p class="review-empty">조건에 맞는 검토 메모가 없습니다. 새로운 의견을 추가할 수 있습니다.</p>';
  if(rows.length>state.reviewVisible)$('reviewList').insertAdjacentHTML('beforeend',`<button type="button" class="inspect-action review-more" data-review-act="more">추가 ${Math.min(35,rows.length-state.reviewVisible)}건 보기 (${state.reviewVisible}/${rows.length})</button>`);
 }
 function reviewAdd(){if(!REV)return;const scope=$('reviewScope').value,pg=page(),id=scope==='element'?(selected()?.id||null):null;if(scope==='element'&&!id)return toast('선택한 요소가 없습니다. 현재 페이지 또는 보고서 전체를 선택하세요.');
  const data={author:$('reviewAuthor').value,body:$('reviewNewText').value,priority:$('reviewNewPriority').value,pageId:scope==='document'?'':pg.id,elementId:id||''};
  try{mutate(()=>REV.insert(project,data));$('reviewNewText').value='';state.reviewVisible=35;renderReviews();toast('내부 검토 의견을 보존했습니다.');}catch(error){toast('검토 메모 추가 취소: '+error.message);}
 }
 function onReviewAction(action,id){if(!REV)return;const note=(project.reviews||[]).find(n=>n.id===id),author=$('reviewAuthor').value;
  if(action==='more'){state.reviewVisible=Math.min(REV.MAX_NOTES,state.reviewVisible+35);renderReviews();return;}
  if(!note)return toast('검토 메모가 변경됐습니다. 목록을 다시 확인하세요.');
  if(action==='jump'){const a=REV.anchor(note,project.pages);if(a.pageIndex<0)return toast('원본 페이지가 삭제됐습니다. 재연결 후 이동하세요.');closeDialog('reviewDialog');selectPage(a.pageIndex);if(a.element)selectElement(note.elementId);return;}
  if(action==='retarget'){if(!root.confirm('현재 페이지/선택 요소에 이 검토 메모를 다시 연결하시겠습니까?'))return;mutate(()=>REV.retarget(project,id,page().id,selected()?.id||''));renderReviews();return;}
  try{if(action==='status')mutate(()=>REV.setStatus(project,id,note.status==='open'?'resolved':'open',author));
   else if(action==='reply'){const input=qs(`[data-review-reply="${id}"]`,$('reviewList'));if(!input)return;mutate(()=>REV.reply(project,id,{body:input.value,author}));}
   else if(action==='edit'){const input=qs(`[data-review-edit="${id}"]`,$('reviewList'));if(!input)return;mutate(()=>REV.edit(project,id,input.value));}
   renderReviews();
  }catch(error){toast('검토 메모 변경 취소: '+error.message);}
 }
 function reviewExport(format){if(!REV)return;const text=format==='csv'?REV.exportCSV(project):REV.exportText(project);X.downloadFile(X.filenameSafe(project.title)+'_PRIVATE_REVIEWS.'+(format==='csv'?'csv':'txt'),text,format==='csv'?'text/csv;charset=utf-8':'text/plain;charset=utf-8');toast('내부 검토 메모를 별도 파일로 저장했습니다. 외부 공유 전 확인하세요.');}
 function reviewExportPacket(){if(!REV)return;X.downloadFile(X.filenameSafe(project.title)+'_PRIVATE_REVIEWS.docut.reviews.json',REV.exportPacket(project),'application/json;charset=utf-8');toast('검토 의견과 작성자가 들어 있는 공유용 JSON을 다운로드했습니다. 외부 공유 전 이름과 내용을 확인하세요.');}
 function clearReviewImport(){state.reviewImportCandidate=null;state.reviewImportSerial++;$('reviewImportReview').hidden=true;$('reviewImportApprove').checked=false;$('reviewImportApply').disabled=true;$('reviewImportSummary').textContent='';}
 async function onReviewImport(file){if(!file)return;clearReviewImport();const serial=state.reviewImportSerial,baseline=JSON.stringify(project);
  if(file.size>1024*1024)return toast('검토 메모 공유 파일은 1MB 이하로 제한합니다.');
  try{const raw=await file.text();if(serial!==state.reviewImportSerial||JSON.stringify(project)!==baseline)throw Error('파일을 읽는 동안 프로젝트가 변경됐습니다. 새로 검토하세요.');
   const plan=REV.inspectPacket(project,raw);
   state.reviewImportCandidate={raw,baseline,plan};$('reviewImportReview').hidden=false;
   $('reviewImportSummary').textContent=`${file.name} · 새 의견 ${plan.added.length}건 / 동일 의견 ${plan.duplicateCount}건 / 기존 의견 ${plan.existingCount}건 · 연결 해제 ${plan.orphanCount}건. 본문/차트 데이터는 포함되지 않습니다. 작성자 이름이 포함될 수 있습니다.`;
   $('reviewImportApprove').checked=false;$('reviewImportApply').disabled=true;
  }catch(error){clearReviewImport();toast('검토 의견 파일 분석 실패: '+error.message);}
 }
 function applyReviewImport(){const candidate=state.reviewImportCandidate;if(!candidate||!$('reviewImportApprove').checked)return;
  if(candidate.baseline!==JSON.stringify(project))return toast('파일 검토 후 현재 문서가 변경됐습니다. 다시 파일을 선택하세요.');
  try{const next=REV.mergePacket(project,candidate.raw);if(next.length===project.reviews.length){clearReviewImport();return toast('새로 합칠 검토 의견이 없습니다.');}
   if(!preMutationBackup('before private review packet merge'))return;
   mutate(()=>{project.reviews=next;});clearReviewImport();renderReviews();toast('원본 메모를 보존하며 신규 검토 의견만 합쳤습니다.');
  }catch(error){toast('검토 의견 합치기 취소: '+error.message);}
 }
 function reviewCopyForAI(){if(!REV)return;const rows=REV.filter(project,{status:'open'});if(!rows.length)return toast('미해결 의견이 없습니다.');const request=['[DoCut 내부 검토 메모 기반 개선 요청]', '아래는 검증된 사실이 아니라 사람이 작성한 검토 의견입니다. 수치·출처는 원자료를 대조한 뒤 수정을 제안하고, 기존 내용을 자동 덮어쓰지 마세요.',...rows.map((n,i)=>`${i+1}. (${REV.anchor(n,project.pages).label}) [${n.priority}] ${n.body}`)];copyText(request.join('\n'),'미해결 검토 의견 AI 요청');}
 function onMainAction(action){switch(action){
  case 'toggle-pages':togglePages();break;case 'close-pages':closePages();break;case 'close-inspector':qs('.rightbar').classList.remove('show');break;
  case 'search':showSearch();break;case 'close-search':closeDialog('searchDialog');break;
  case 'validate':if(state.rightMode==='validation')showElementPanel();else showValidation('typo');break;
  case 'validation-element':showElementPanel();break;case 'validation-more':state.validationVisible+=80;renderValidation();break;case 'validation-reset-ignored':state.validationIgnored.clear();renderValidation();break;case 'validation-refresh':renderValidation();break;case 'validation-copy-prompt':copyValidationPrompt();break;case 'validation-compare':compareValidationProposal();break;case 'validation-apply-proposal':applyValidationProposal();break;
  case 'quality':showQuality();break;case 'close-quality':closeDialog('qualityDialog');break;
  case 'quick-transition-apply':applyReference('transition',$('quickTransition').value);break;case 'preview-page-transition':{stopAnimation();const a=TRANS?.play($('slide'),page().transition||'fade');if(a)state.animations.push(a);break;}
  case 'template-gallery':showKits();break;case 'kit-close':clearKitImport();closeDialog('kitDialog');break;case 'kit-insert':insertKit();break;case 'kit-insert-pack':insertProfessionalPack();break;case 'kit-capture':captureKit();break;case 'kit-delete':deleteKit();break;case 'kit-export':exportKitBook();break;case 'kit-import-open':$('kitFileInput').click();break;case 'kit-import-cancel':clearKitImport();break;case 'kit-import-apply':applyKitImport();break;case 'kit-reload':readKits();clearKitImport();renderKits();break;case 'kit-damaged-export':exportDamagedKitStore();break;case 'kit-damaged-reset':resetDamagedKitStore();break;
  case 'effects-studio':if(!FXSTUDIO)return toast('효과 미리보기 모듈을 불러오지 못했습니다.');FXSTUDIO.open({
   getSelected:()=>selected(),
   apply:(stack,name)=>{const el=selected();if(!el||el.locked)throw Error('선택 요소가 바뀌었거나 잠겨 있습니다.');mutate(()=>{selected().effects=stack.map(C.clone);});play($('slide'));toast(name+' 적용');},
   applyExit:(stack,name)=>{const el=selected();if(!el||el.locked)throw Error('잠긴 요소는 변경할 수 없습니다.');mutate(()=>{selected().exitOnNext=stack.map(C.normalizeEffect);});toast(name+' · 다음 페이지로 이동할 때 실행');},
   applyTransition:(id,name)=>{if(page().transition!==id)mutate(()=>{page().transition=id;});const a=TRANS?.play($('slide'),id);if(a)state.animations.push(a);toast(name+' 적용');},
   showReferences:()=>onMainAction('open-effect-library')});break;
  case 'clear-next-exit':if(selected()&&!selected().locked)mutate(()=>{selected().exitOnNext=[];});break;
  case 'reviews':showReviews();break;case 'review-close':closeDialog('reviewDialog');break;case 'review-export-packet':reviewExportPacket();break;case 'review-import-open':$('reviewImportInput').click();break;case 'review-import-cancel':clearReviewImport();break;case 'review-import-apply':applyReviewImport();break;case 'review-add':reviewAdd();break;case 'review-export-txt':reviewExport('txt');break;case 'review-export-csv':reviewExport('csv');break;case 'review-copy-ai':reviewCopyForAI();break;
  case 'quality-refresh':showQuality();break;case 'quality-export':exportQualityTxt();break;case 'quality-export-csv':exportQualityCsv();break;case 'quality-copy-ai':copyQualityPrompt();break;case 'quality-to-reviews':qualityToReviews();break;
  case 'recovery':showRecovery();break;case 'close-recovery':closeDialog('recoveryDialog');break;
  case 'close-backup-compare':state.backupCandidate=null;state.backupBaseline=null;closeDialog('backupCompareDialog');break;
  case 'download-backup':downloadSelectedBackup();break;case 'apply-backup':applySelectedBackup();break;
  case 'download-damaged-backups':downloadDamagedBackups();break;case 'reset-damaged-backups':resetDamagedBackups();break;
  case 'create-backup':{const r=backup('manual');if(!['saved','unchanged'].includes(r?.status))toast('로컬 백업을 보존하지 못했습니다. 백업 상태를 확인하고 JSON 파일로 저장하세요.');showRecovery();break;}
  case 'open-storage-issue':storageIssueDialog();break;case 'close-storage-issue':closeDialog('storageIssueDialog');break;
  case 'reset-image-focus':if(selected()?.type==='image'&&!selected().locked){const e=selected();if(e.style.focusX!==50||e.style.focusY!==50||e.style.cropZoom!==1)mutate(()=>{e.style.focusX=50;e.style.focusY=50;e.style.cropZoom=1;});}break;
  case 'export-working-copy':exportWorkingCopy();break;case 'load-external-saved':loadExternalSaved();break;case 'overwrite-external-saved':overwriteExternalSaved();break;
  case 'download-damaged':downloadDamagedCheckpoint();break;case 'reset-damaged':resetDamagedCheckpoint();break;
  case 'close-import':closeDialog('importDialog');break;case 'close-import-mode':clearImportCandidate();closeDialog('importModeDialog');break;
  case 'import-review-report':downloadImportReview();break;
  case 'rewrite-preview':previewRewrite();break;case 'rewrite-apply':applyRewrite();break;case 'rewrite-select-all':selectRewrite(true);break;case 'rewrite-select-none':selectRewrite(false);break;
  case 'import-append':applyImport('append');break;case 'import-replace':applyImport('replace');break;
  case 'ai-bridge':openDialog('aiDialog');hideExportMenu();break;
  case 'ai-analyze':inspectAI();break;case 'ai-export-review':exportAIReview();break;case 'ai-apply':applyAI();break;case 'ai-select-all':selectAI(true);break;case 'ai-select-none':selectAI(false);break;case 'close-ai':closeDialog('aiDialog');break;
  case 'export-audit':X.downloadFile('DoCut_Audit.txt',auditText());hideExportMenu();break;
  case 'group':groupSelection();break;case 'ungroup':ungroupSelection();break;
  case 'distribute-h':distribute('x');break;case 'distribute-v':distribute('y');break;
  case 'copy-to-page':moveSelectedToPage($('transferTarget')?.value,false);break;
  case 'move-to-page':moveSelectedToPage($('transferTarget')?.value,true);break;
  case 'toggle-snap':state.snap=!state.snap;$('snapToggle').classList.toggle('active',state.snap);break;
  case 'pause-motion':state.animations.forEach(a=>{try{a.pause?.();}catch(_){}});break;
  case 'stop-motion':stopAnimation();previewTime(0);break;
  case 'timeline-start':$('timelineScrub').value=0;previewTime(0);break;
  case 'auto-motion-page':if(!CAT)break;mutate(()=>page().elements.filter(e=>!e.locked).forEach(e=>{try{e.effects=CAT.createStack(CAT.recommended(e.type),e.type);}catch(_){e.effects=[C.makeEffect('fade-up',650,80)];}}));toast('페이지 전체에 유형별 추천 모션을 적용했습니다.');break;
  case 'smart-motion-block':if(!selected()||!CAT)break;mutate(()=>chosen().filter(e=>!e.locked).forEach(e=>{try{e.effects=CAT.createStack(CAT.recommended(e.type),e.type);}catch(_){e.effects=[C.makeEffect('fade-up',650,80)];}}));toast('선택한 요소의 추천 모션을 적용했습니다.');break;
  case 'stagger-motion':mutate(()=>page().elements.filter(e=>!e.locked).forEach((e,i)=>e.effects=[C.makeEffect('rise',650,i*125)]));break;
  case 'focus-motion':qs('.timeline')?.scrollIntoView({block:'nearest',behavior:'smooth'});break;
  case 'import-csv':if(['table','bar','line','donut','stat'].includes(selected()?.type))$('csvInput').click();else toast('표 또는 차트를 먼저 선택하세요.');break;
  case 'stat-copy-columns':if(selected()?.type==='stat'&&S)copyText(S.lookup[selected().data.kind].columns.join('\t'),'통계 차트 자료 열 제목');break;
  case 'csv-cancel':state.csvCandidate=null;closeDialog('csvReviewDialog');break;
  case 'csv-apply':applyCSVPreview();break;
  case 'brand-settings':state.selectedId=null;state.selectedIds.clear();showElementPanel();renderAll();qs('.rightbar')?.classList.add('show');toast('페이지 설정의 로고·전체 글꼴 옵션을 열었습니다.');break;
  case 'open-effect-library':toggleLeftTab('styles');$('referenceDetails').open=true;$('referenceSearch')?.focus();toast('89장 레퍼런스는 이미지 분류 자료입니다. 효과는 적용 버튼으로 사용할 수 있습니다.');break;
  case 'apply-global-font':{const font=project.master?.fontFamily||'Pretendard',includeLocked=state.includeLockedFont;let count=0;mutate(()=>{for(const pg of project.pages)for(const el of pg.elements)if((includeLocked||!el.locked)&&!['shape','image','divider'].includes(el.type)){el.style.font=font;count++;}});toast(`${count}개 텍스트 상자에 ${font} 적용 · ${includeLocked?'잠금 요소 포함':'잠금 요소 보존'}`);break;}
  case 'upload-logo':$('brandLogoInput').click();break;case 'clear-logo':mutate(()=>{project.master.logo=''});break;

  case 'undo':undo();break;case 'redo':redo();break;
  case 'import':$('importInput').click();break;
  case 'box-layout':boxLayoutPanel.open();break;
  case 'quick-create':quickPanel.open();break;
  case 'scene-settings':scenePanel.open();break;
  case 'data-motion':dataPanel.open();break;
  case 'frame-settings':projectPanel.open();break;
  case 'save-json':X.downloadFile(X.filenameSafe(project.title)+'.docut.json',JSON.stringify(C.normalizeProject(project),null,2),'application/json;charset=utf-8');toast('편집 가능한 JSON 프로젝트를 저장했습니다.');break;
  case 'export-html':X.downloadFile(X.filenameSafe(project.title)+'.html',X.exportHTML(project),'text/html;charset=utf-8');toast('오프라인 실행형 HTML 보고서를 내보냈습니다.');hideExportMenu();break;
  case 'export-txt':X.downloadFile(X.filenameSafe(project.title)+'_HTML.txt',X.exportHTML(project),'text/plain;charset=utf-8');toast('HTML 코드가 담긴 TXT를 내보냈습니다.');hideExportMenu();break;
  case 'export-text':X.downloadFile(X.filenameSafe(project.title)+'_본문.txt',X.exportText(project));toast('본문 요약 TXT를 내보냈습니다.');hideExportMenu();break;
  case 'copy-prompt':copyText(X.aiPrompt(project));hideExportMenu();break;
  case 'preview':showPreview();break;case 'close-preview':closePreview();break;
  case 'caption-apply':applyCaptionScript();break;
  case 'story-toggle':if(state.preview&&storyController){if(storyController.getState().playing){storyController.pause();state.animations.forEach(a=>{try{a.pause?.();}catch(_){}});}else{storyController.play();if(storyController.getState().elapsedMs<200)play($('previewSlide'));else state.animations.forEach(a=>{try{a.play?.();}catch(_){}});}refreshStoryState();}break;
  case 'story-stop':if(state.preview&&storyController){storyController.stop();stopAnimation();refreshStoryState();}break;
  case 'story-fullscreen':if(state.preview){const overlay=$('previewOverlay');if(document.fullscreenElement===overlay)document.exitFullscreen?.().catch(()=>toast('전체화면을 종료하지 못했습니다.'));else overlay.requestFullscreen?.().catch(()=>toast('이 브라우저에서 전체화면을 사용할 수 없습니다.'));}break;
  case 'restart-preview':if(state.preview)play($('previewSlide'));else{play($('slide'));toast('현재 페이지 모션을 재생합니다.')}break;
  case 'previous-page':if(state.preview)previewJump(state.pageIndex-1);else selectPage(state.pageIndex-1);break;
  case 'next-page':if(state.preview)previewJump(state.pageIndex+1);else selectPage(state.pageIndex+1);break;
  case 'fit':state.zoom=100;updateZoom();break;
  case 'toggle-focus':$('app').classList.toggle('focus-stage');updateZoom();break;
  case 'toggle-inspector':qs('.rightbar').classList.toggle('show');break;
  case 'toggle-grid':state.grid=!state.grid;$('stageArea').classList.toggle('show-grid',state.grid);$('gridToggle').classList.toggle('active',state.grid);break;
  case 'story-menu':$('storySelector').hidden=!$('storySelector').hidden;break;
  case 'create-story':{const count=+$('storyCount').value,mode=$('storyMode').value==='analysis'?'research':$('storyMode').value;if(!root.confirm('현재 페이지 내용을 대체하고 '+count+'장 기본 구성으로 새로 만드시겠습니까?'))return;mutate(()=>{const p=C.createProject(count,mode);p.theme=project.theme;p.title=project.title;project=p;state.pageIndex=0;state.selectedId=null;});toast('보고서의 기승전결 구성을 생성했습니다.');break;}
  case 'add-page':if(project.pages.length>=50)return toast('최대 50페이지까지 지원합니다.');mutate(()=>{const pg=C.createPage(state.pageIndex+1,project.pages.length+1);pg.groupId=page().groupId||project.groups[0].id;const probe=root.DocutSemanticLayout.plan(pg,'two',project.frame);if(probe.ok)pg.elements=probe.after.elements;project.pages.splice(state.pageIndex+1,0,pg);state.pageIndex++;state.selectedId=null;C.relabelPages(project)});break;
  case 'duplicate-page':if(project.pages.length>=50)return toast('최대 50페이지까지 지원합니다.');mutate(()=>{const newPage=LAYERS.duplicatePage(page(),C.uid);project.pages.splice(state.pageIndex+1,0,newPage);state.pageIndex++;state.selectedId=null;state.selectedIds.clear();});break;
  case 'delete-page':if(project.pages.length<2)return toast('최소 한 페이지는 있어야 합니다.');if(!root.confirm('현재 페이지를 삭제하시겠습니까?'))return;mutate(()=>{project.pages.splice(state.pageIndex,1);state.pageIndex=Math.max(0,state.pageIndex-1);state.selectedId=null;C.relabelPages(project);});break;
  case 'move-page-prev':movePage(-1);break;case 'move-page-next':movePage(1);break;
  case 'duplicate':duplicate();break;case 'delete-element':removeElement();break;
  case 'batch-lock':case 'batch-unlock':case 'batch-hide':case 'batch-show':batchSet(action);break;
  case 'move-front':reorderElement('front');break;case 'move-back':reorderElement('back');break;
  case 'align-left':case 'align-hcenter':case 'align-right':case 'align-top':case 'align-vcenter':case 'align-bottom':alignElement(action);break;
  case 'clear-page-bg':mutate(()=>page().background='');break;
  case 'clear-element-bg':if(selected())mutate(()=>selected().style.background='transparent');break;
  case 'add-effect':if(!selected())break;if(selected().effects.length>=3)return toast('요소당 모션은 최대 3개입니다.');mutate(()=>selected().effects.push(C.makeEffect('fade',650,0)));break;
  case 'upload-image':if(selected()?.type==='image')$('imageInput').click();break;
  case 'reset-image-crop':if(selected()?.type==='image'&&!selected().locked)mutate(()=>{selected().style.focusX=50;selected().style.focusY=50;selected().style.cropZoom=1;});break;
  case 'toggle-image-crop':if(selected()?.type==='image'&&!selected().locked){state.imageCropEditingId=state.imageCropEditingId===selected().id?null:selected().id;updateSelectionDOM();renderInspector();toast(state.imageCropEditingId?'이미지 내부를 드래그해 초점을 이동합니다.':'이미지 초점 편집을 종료했습니다.');}break;
  default:break;
 }}
 function movePage(delta){const next=state.pageIndex+delta;if(next<0||next>=project.pages.length)return;mutate(()=>{const pg=project.pages.splice(state.pageIndex,1)[0];project.pages.splice(next,0,pg);state.pageIndex=next;});}
 function duplicate(){
  const ids=chosen().map(e=>e.id),editable=LAYERS.pick(page().elements,ids);
  if(!editable.length)return toast('복제할 잠금 해제된 요소를 선택하세요.');
  if(page().elements.length+editable.length>120)return toast('페이지당 최대 120개 요소입니다. 현재 선택을 복제할 수 없습니다.');
  mutate(()=>{const result=LAYERS.duplicate(page().elements,ids,C.uid,{width:C.WIDTH,height:C.HEIGHT});page().elements=result.elements;state.selectedIds=new Set(result.ids);state.selectedId=result.ids[0]||null;});
  toast(editable.length+'개 요소를 복제했습니다.');
}
 function removeElement(){
  const ids=chosen().map(e=>e.id),editable=LAYERS.pick(page().elements,ids);
  if(!editable.length)return toast('잠금 해제된 요소를 선택하세요.');
  mutate(()=>{page().elements=LAYERS.remove(page().elements,ids).elements;state.selectedId=null;state.selectedIds.clear();});
  toast(editable.length+'개 요소를 삭제했습니다.');
}
function batchSet(action){
 const ids=new Set(chosen().map(e=>e.id));if(!ids.size)return;
 const key=action.endsWith('lock')||action.endsWith('unlock')?'locked':'hidden';
 const val=action==='batch-lock'||action==='batch-hide';
 const target=page().elements.filter(e=>ids.has(e.id)&&e[key]!==val);if(!target.length)return;
 mutate(()=>target.forEach(e=>e[key]=val));
 toast(target.length+'개 요소에 '+(val?'설정':'해제')+'했습니다.');
}
 function alignElement(action){const list=chosen().filter(el=>!el.locked),ids=list.map(el=>el.id);if(!ids.length)return;const probe=LAYERS.alignGroup(list.map(C.clone),ids,action,{width:C.WIDTH,height:C.HEIGHT});if(!probe.changed)return;mutate(()=>LAYERS.alignGroup(page().elements,ids,action,{width:C.WIDTH,height:C.HEIGHT}));}
 function reorderElement(direction){if(!selected())return;mutate(()=>{const a=page().elements;const index=a.findIndex(e=>e.id===state.selectedId);const el=a.splice(index,1)[0];if(direction==='front')a.push(el);else a.unshift(el);});}
 function addElement(type){mutate(()=>{const count=page().elements.length;const block=C.makeBlock(type,100,200);if(!['shape','image','divider'].includes(type))block.style.font=project.master?.fontFamily||'Pretendard';const where=findEmptyRect(block.w,block.h);block.x=where.x;block.y=where.y;page().elements.push(block);state.selectedId=block.id;state.selectedIds=new Set([block.id]);});toast((labels[type]||type)+' 요소가 추가되었습니다.');}
 function toggleLeftTab(tab){state.leftTab=tab;qsa('[data-left-tab]').forEach(b=>b.classList.toggle('tab-active',b.dataset.leftTab===tab));$('leftStructure').hidden=tab!=='structure';$('leftInsert').hidden=tab!=='insert';$('leftStyles').hidden=tab!=='styles';}
 function hideExportMenu(){$('exportMenu').hidden=true;$('exportToggle').setAttribute('aria-expanded','false');}
 async function copyText(text,label='AI 제작 프롬프트'){try{await navigator.clipboard.writeText(text);toast(label+'를 클립보드에 복사했습니다.');}catch(e){const input=document.createElement('textarea');input.value=text;input.style.position='fixed';input.style.left='-9999px';document.body.appendChild(input);input.select();const ok=document.execCommand('copy');input.remove();toast(ok?label+'를 복사했습니다.':'클립보드 접근이 차단되었습니다.');}}
 async function onImport(file){if(!file)return;
  const baseline=JSON.stringify(project),serial=++state.importSerial;state.importBaseline=null;state.importCandidate=null;state.importAnalysis=null;
  if(file.size>12*1024*1024){$('importInput').value='';return toast('가져오기 파일은 최대 12MB까지 지원합니다.');}
  try{const text=await file.text();let imported;
   if(/\.json$/i.test(file.name))imported={project:C.normalizeProject(JSON.parse(text)),mode:'native-json',warnings:[]};
   else if(/\.html?$/i.test(file.name)||/^\s*<(?:!doctype|html|head|body|section|article|div)\b/i.test(text))imported=X.decodeHTML(text);
   else imported=X.decodeText(text);
   if(serial!==state.importSerial||JSON.stringify(project)!==baseline)throw Error('편집 중 문서가 변경되었습니다. 안전을 위해 다시 파일을 선택하세요.');
   state.importFile=file;state.importCandidate=imported;state.importBaseline=baseline;
   state.importAnalysis=IMPORT.analyze(project,imported);state.importPreviewIndex=0;
   $('importModeAcknowledge').checked=false;
   renderImportReview(file.name);
   openDialog('importModeDialog');
  }catch(error){if(serial===state.importSerial){state.importCandidate=null;state.importFile=null;state.importBaseline=null;}toast('가져오기 분석 실패: '+error.message);}
  finally{$('importInput').value='';}
 }
 function clearImportCandidate(){state.importFile=null;state.importCandidate=null;state.importAnalysis=null;state.importBaseline=null;state.importSerial++;$('importInput').value='';}
 function renderImportReview(filename=''){
  const analysis=state.importAnalysis,candidate=state.importCandidate;if(!analysis||!candidate)return;
  const a=analysis.after,b=analysis.before;
  $('importModeSummary').textContent=`${filename||state.importFile?.name||'가져온 파일'} · ${analysis.mode} | 현재 ${b.pages}페이지/${b.blocks}요소 → 후보 ${a.pages}페이지/${a.blocks}요소 | 출처 포함 ${a.evidence} · 표 ${a.tables} · 통계 ${a.stats}`;
  $('importModeWarnings').innerHTML=analysis.findings.map(f=>`<p class="import-warning-${f.kind}">[${f.kind==='loss'?'내용 손실·범위':f.kind==='approximation'?'근사 변환':'안내'}] ${C.escapeHTML(f.message)}</p>`).join('')||'<p>추가 손실이 감지되지 않았습니다. 실제 표시와 수치의 정확성은 별도 확인하세요.</p>';
  if(QUALITY){const impact=QUALITY.compare(project,candidate.project);const a=impact.current.counts,b=impact.candidate.counts;
   $('importQualityImpact').textContent=`편집 전 자동 진단: 우선 ${a.critical} / 검토 ${a.review} / 제안 ${a.suggestion} → 변환 후보 독립 진단: 우선 ${b.critical} / 검토 ${b.review} / 제안 ${b.suggestion}. ${impact.note}`;
  }else $('importQualityImpact').textContent='품질 비교 모듈이 없어 기존의 변환 경고만 표시합니다.';
  $('importPreviewPage').innerHTML=analysis.pageRows.map(row=>`<option value="${row.index}">${row.index+1}. ${C.escapeHTML(row.title)} (${row.blocks}개)</option>`).join('');
  $('importModeAcknowledgeLabel').hidden=!analysis.requireAcknowledgement;
  renderImportPreview();refreshImportActions();
 }
 function renderImportPreview(){const data=state.importCandidate,analysis=state.importAnalysis;if(!data||!analysis)return;
  const index=Math.max(0,Math.min(data.project.pages.length-1,state.importPreviewIndex));state.importPreviewIndex=index;$('importPreviewPage').value=String(index);
  const p=data.project.pages[index],info=analysis.pageRows[index];
  $('importPreviewSummary').textContent=`${index+1} / ${analysis.pageRows.length} · ${p.tab} · ${info.blocks}요소 · 출처 ${info.evidence} · 검증 표시 ${info.verified}`;
  $('importPreviewCanvas').innerHTML=IMPORT.pagePreview(p);
  const original=project.pages[index]||null;$('importCurrentSummary').textContent=original?'현재 '+(index+1)+'쪽 · '+original.tab:'현재 문서에 같은 순서의 페이지가 없습니다';
  $('importCurrentCanvas').innerHTML=IMPORT.pagePreview(original);
 }
 function refreshImportActions(){const analysis=state.importAnalysis;const allowed=!!analysis&&(!analysis.requireAcknowledgement||$('importModeAcknowledge').checked);
  qs('[data-action="import-append"]',$('importModeDialog')).disabled=!allowed||!analysis?.appendAllowed;
  qs('[data-action="import-replace"]',$('importModeDialog')).disabled=!allowed||analysis.after.pages<1||analysis.after.blocks<1;
 }
 function downloadImportReview(){const analysis=state.importAnalysis;if(!analysis)return;
  const report=['DoCut 비실행 보고서 가져오기 검토','검토 시각: '+new Date().toISOString(),
   '파일: '+(state.importFile?.name||''),'모드: '+analysis.mode,
   `현재 ${analysis.before.pages}페이지 ${analysis.before.blocks}요소 / 변환 ${analysis.after.pages}페이지 ${analysis.after.blocks}요소`,
   '이 자료는 원본 픽셀/실행 기능 동일성을 입증하지 않습니다.','',
   '변환 경고:',...analysis.findings.map(f=>`[${f.kind}] ${f.message}`),'','페이지별 후보:',
   ...analysis.pageRows.map(p=>`${p.index+1}쪽 ${p.title} / 요소 ${p.blocks} / 출처 ${p.evidence} / 검증 표시 ${p.verified}`),
   '', '[정적 후보 독립 진단 · 품질 점수 아님]', $('importQualityImpact').textContent];
  X.downloadFile('DoCut_Import_Review.txt',report.join('\n'));toast('비교·손실 검토 기록을 TXT로 저장했습니다.');
 }
 function invalidateRewrite(){state.rewritePlan=null;state.rewriteBaseline=null;$('rewriteApply').disabled=true;$('rewriteResults').textContent='검색 및 변경 전 검토가 필요합니다.';$('rewriteSummary').textContent='변경 전 분석을 실행하세요.';}
 function previewRewrite(){if(!REWRITE)return toast('본문 교체 검토 모듈이 없습니다.');
  try{const scope=$('rewriteScope').value;
   const plan=REWRITE.preview(project,$('rewriteQuery').value,$('rewriteReplacement').value,{pageIndex:scope==='current'?state.pageIndex:null,caseSensitive:$('rewriteCase').checked,includeFormatted:$('rewriteFormatted').checked});
   state.rewritePlan=plan;state.rewriteBaseline=JSON.stringify(project);
   $('rewriteSummary').textContent=`변경 가능 ${plan.rows.length}요소 · ${plan.hits}회 / 잠금 ${plan.skippedLocked}회 · 서식 보호 ${plan.skippedFormatted}회 · 길이 초과 ${plan.skippedOverflow}회 (자동 선택 없음)`;
   $('rewriteResults').innerHTML=plan.rows.map(r=>`<label class="rewrite-row"><input type="checkbox" data-rewrite-id="${C.escapeHTML(r.id)}"><span><b>${r.pageIndex+1}쪽 · ${C.escapeHTML(r.type)} · ${r.hits}건</b><small>${C.escapeHTML(r.snippet)}</small><small>${C.escapeHTML(r.old.slice(0,70))} → ${C.escapeHTML(r.newText.slice(0,70))}</small>${r.formatWillReset?'<small class="rewrite-alert">선택 적용 시 이 요소의 부분 글자 서식이 해제됩니다.</small>':''}</span></label>`).join('')||'<p>변경 가능한 텍스트가 없습니다. 잠금·서식 제한을 확인하세요.</p>';
   refreshRewriteActions();
  }catch(error){invalidateRewrite();$('rewriteSummary').textContent='검토 실패: '+error.message;}
 }
 function refreshRewriteActions(){$('rewriteApply').disabled=!state.rewritePlan||!qsa('[data-rewrite-id]:checked',$('rewriteResults')).length;}
 function selectRewrite(checked){qsa('[data-rewrite-id]',$('rewriteResults')).forEach(c=>c.checked=checked);refreshRewriteActions();}
 function applyRewrite(){if(!state.rewritePlan||!REWRITE)return toast('먼저 변경 전 검토를 실행하세요.');
  if(state.rewriteBaseline!==JSON.stringify(project)){invalidateRewrite();return toast('검토 도중 보고서가 바뀌었습니다. 다시 분석하세요.');}
  const ids=qsa('[data-rewrite-id]:checked',$('rewriteResults')).map(n=>n.dataset.rewriteId);if(!ids.length)return toast('적용할 요소를 선택하세요.');
  try{const result=REWRITE.apply(project,state.rewritePlan,ids);
   if(!preMutationBackup('before approved text replacement'))return;
   mutate(()=>{project=result.project;state.selectedId=null;state.selectedIds.clear();});invalidateRewrite();renderSearchResults();
   toast(`${result.changed}개 요소·${result.occurrences}회 교체했습니다. 수치·근거를 다시 확인하세요.${state.saveProblem?' 자동저장 실패: JSON을 내려받으세요.':''}`);
  }catch(error){toast('일괄 수정 중단: '+error.message);invalidateRewrite();}
 }
 function setValue(path,raw){const el=selected(),pg=page();if(!path)return;
  if(el?.locked)return;
  if(path==='group.name'&&el?.groupId){const label=String(raw).trim().slice(0,80)||'그룹';page().elements.filter(e=>e.groupId===el.groupId).forEach(e=>e.groupLabel=label);return;}
  if(path==='chart.series'&&el){delete el.dataBinding;el.data={...el.data,...C.parseSeries(raw)};el.verified=false;return;}
  if(path==='table.rows'&&el){delete el.dataBinding;el.data={...el.data,...C.parseGrid(raw),cells:[]};el.verified=false;return;}
  const [kind,key]=path.split('.');const owner=kind==='page'?pg:kind==='style'?el?.style:kind==='element'?el:null;if(!owner)return;
  if(kind==='element'&&['w','h'].includes(key)&&el?.style?.aspectLock){
   const wanted={w:key==='w'?Number(raw):el.w,h:key==='h'?Number(raw):el.h};
   const size=MEDIA.resizeBox(el,wanted,key,{width:C.WIDTH,height:C.HEIGHT},true);el.w=size.w;el.h=size.h;return;
  }
  if(kind==='style'&&key==='aspectLock'){owner[key]=raw===true;return;}
  if(kind==='image'&&key==='alt'){owner.alt=String(raw).slice(0,300);return;}
  if(['x','y','w','h','size','radius','shadow','weight','opacity','backgroundOpacity','fxGlowStrength','fxGlowRadius','fxTiltStrength','fxEdgeSpeed','focusX','focusY','cropZoom'].includes(key)){
   const ranges={x:[0,C.WIDTH-(el?.w||40)],y:[0,C.HEIGHT-(el?.h||30)],w:[40,C.WIDTH-(el?.x||0)],h:[30,C.HEIGHT-(el?.y||0)],size:[10,100],radius:[0,80],shadow:[0,80],weight:[300,900],opacity:[.1,1],backgroundOpacity:[0,1],fxGlowStrength:[0,1],fxGlowRadius:[80,500],fxTiltStrength:[0,18],fxEdgeSpeed:[2,14],focusX:[0,100],focusY:[0,100],cropZoom:[1,4]};owner[key]=C.clamp(raw,...ranges[key]);
  }
  else{if(kind==='style'&&key==='fxLightColor'&&!/^#[a-f0-9]{6}$/i.test(String(raw)))return;owner[key]=String(raw).slice(0,key==='text'?12000:6000);if(kind==='element'&&key==='text'&&el){if(el.type==='kpi')delete el.dataBinding;el.richText=[];el.verified=false;}if(kind==='page'&&key==='tab')pg.customTab=true;}
 }
 function onInspectorField(ev,immediate=false){const target=ev.target;if(!target.dataset.path&&!target.dataset.effect)return;
  const path=target.dataset.path,fxIndex=target.dataset.effect,fxKey=target.dataset.effectKey;
  if(immediate&&!['range','color'].includes(target.type))return;
  if(selected()?.locked&&path&&!path.startsWith('page.'))return toast('잠긴 레이어를 먼저 잠금 해제하세요.');
  if(path==='group.name'&&selected()?.groupId&&page().elements.some(el=>el.groupId===selected().groupId&&el.locked)){toast('그룹 이름을 바꾸기 전에 잠긴 구성원을 모두 잠금 해제하세요.');renderInspector();return;}
  // Validate structured text BEFORE recording an Undo checkpoint or mutating the element.
  // Invalid rows/values are not partially applied and the user sees a concrete error.
  try{if(path==='chart.series')C.parseSeries(target.value);else if(path==='table.rows')C.parseGrid(target.value);}catch(e){toast('입력값 보존: '+e.message);return;}
  if(target.dataset.modified!=='1'){checkpoint();target.dataset.modified='1';}
  if(path)setValue(path,target.type==='checkbox'?target.checked:target.value);else if(selected()){const fx=selected().effects[Number(fxIndex)];if(fx){fx[fxKey]=fxKey==='kind'?target.value:C.clamp(target.value,fxKey==='duration'?100:0,fxKey==='duration'?3000:8000);}}
  persist();renderSlide();renderPageList();renderLayerList();renderTimeline();if(path==='page.tab')$('currentTabName').textContent=page().tab;
 }
 function captureLiveEditing(field){
  const el=page().elements.find(e=>e.id===state.editingId);if(!el||!field)return true;
  let next;try{next=R.collect(field);}catch(e){state.editValidationError=String(e.message||e);toast('텍스트를 아직 저장하지 못했습니다: '+state.editValidationError);return false;}
  state.editValidationError=null;
  if(el.text===next.text&&JSON.stringify(el.richText||[])===JSON.stringify(next.richText))return true;
  if(!state.editCheckpointed){checkpoint();state.editCheckpointed=true;}
  el.text=next.text;el.richText=next.richText;el.verified=false;
  // No DOM replacement: Korean IME and current caret remain undisturbed.
  persist();return true;
 }
 function finishEditing(){if(!state.editingId)return;
  const dom=qsa('.element',$('slide')).find(e=>e.dataset.id===state.editingId),field=dom?qs('.plain-text',dom):null;
  if(field&&!captureLiveEditing(field)){field.focus();return;}
  state.editingId=null;state.editCheckpointed=false;state.editValidationError=null;state.richRange=null;$('richEditorToolbar').hidden=true;renderAll();
 }
 function startEdit(id){const el=page().elements.find(e=>e.id===id);if(!el||el.locked)return;if(!['title','text','bullet','quote','source'].includes(el.type)){selectElement(id);qs('[data-path="element.text"]',$('inspector'))?.focus();return;}state.editingId=id;state.editCheckpointed=false;state.editValidationError=null;selectElement(id);$('richEditorToolbar').hidden=false;const dom=qsa('.element',$('slide')).find(n=>n.dataset.id===id);const field=qs('.plain-text',dom);if(!field)return;dom.classList.add('editing');field.contentEditable='true';field.spellcheck=false;field.focus();const range=document.createRange();range.selectNodeContents(field);const selection=root.getSelection();selection.removeAllRanges();selection.addRange(range);field.addEventListener('blur',ev=>{if(state.editingId!==id)return;const selection=root.getSelection();if(selection.rangeCount)state.richRange=selection.getRangeAt(0).cloneRange();if(ev.relatedTarget&&($('richEditorToolbar').contains(ev.relatedTarget)||$('canvasContextTools')?.contains(ev.relatedTarget)))return;setTimeout(()=>{if(state.editingId===id&&!state.contextOpen&&!$('richEditorToolbar').contains(document.activeElement))finishEditing();},0);});}
 function beginPointer(ev){if(state.preview||state.editingId||ev.target.closest('.canvas-lock-toggle'))return;const target=ev.target.closest('.element');if(!target||ev.button!==0)return;ev.preventDefault();const id=target.dataset.id,el=page().elements.find(e=>e.id===id);if(!el)return;if(el.locked){selectElement(id);return;}if(ev.ctrlKey||ev.shiftKey){selectElement(id,true);return;}
  const keepMulti=state.selectedIds.has(id)&&state.selectedIds.size>1;
  if(!keepMulti){state.selectedId=id;state.selectedIds=new Set(el.groupId?page().elements.filter(other=>other.groupId===el.groupId).map(other=>other.id):[id]);}updateSelectionDOM();renderLayerList();renderInspector();renderTimeline();
  const mode=ev.target.closest('.resize-handle')?'resize':state.imageCropEditingId===id?'crop':'move';
  const media=mode==='crop'?MEDIA.metadata(el.data):null;const cropFrame=media?MEDIA.frame(media,{w:el.w,h:el.h},el.style):null;
  if(mode==='crop'&&(!cropFrame||cropFrame.mode==='fill'))return toast('크롭 위치 편집은 원본 이미지를 선택하고 Cover 또는 Contain으로 설정해야 합니다.');
  const multi=mode==='move'&&state.selectedIds.has(id)&&state.selectedIds.size>1;
  const group=mode==='move'&&(multi||el.groupId)?(multi?chosen().filter(other=>!other.locked):page().elements.filter(other=>other.groupId===el.groupId&&!other.locked)):[el];state.moving={id,mode,startX:ev.clientX,startY:ev.clientY,origin:{x:el.x,y:el.y,w:el.w,h:el.h},members:group.map(other=>({id:other.id,x:other.x,y:other.y,w:other.w,h:other.h})),node:target,pointerId:ev.pointerId,changed:false,crop:mode==='crop'?{frame:cropFrame,focusX:el.style.focusX??50,focusY:el.style.focusY??50}:null};target.setPointerCapture(ev.pointerId);
 }
 function movePointer(ev){
  const m=state.moving;if(!m||ev.pointerId!==m.pointerId)return;
  const element=page().elements.find(e=>e.id===m.id);if(!element||element.locked)return;
  const dx=(ev.clientX-m.startX)/state.scale,dy=(ev.clientY-m.startY)/state.scale;
  if(!m.changed){if(Math.hypot(dx,dy)<1.5)return;checkpoint();m.changed=true;}
  if(m.mode==='crop'){
   const next=MEDIA.dragFocus(m.crop.frame,{w:element.w,h:element.h},m.crop.focusX,m.crop.focusY,dx,dy);element.style.focusX=next.focusX;element.style.focusY=next.focusY;
   const info=MEDIA.metadata(element.data),g=MEDIA.frame(info,{w:element.w,h:element.h},element.style),img=qs('img',m.node);
   if(g&&img){img.style.left=(g.x/element.w*100)+'%';img.style.top=(g.y/element.h*100)+'%';img.style.width=(g.w/element.w*100)+'%';img.style.height=(g.h/element.h*100)+'%';}
   return;
  }
  const snap=v=>state.grid?Math.round(v/8)*8:Math.round(v);
  if(m.mode==='move'){
   const members=m.members.filter(t=>page().elements.some(e=>e.id===t.id&&!e.locked));
   const minX=Math.min(...members.map(t=>t.x)),maxX=Math.max(...members.map(t=>t.x+t.w));
   const minY=Math.min(...members.map(t=>t.y)),maxY=Math.max(...members.map(t=>t.y+t.h));
   let deltaX=snap(C.clamp(dx,-minX,C.WIDTH-maxX)),deltaY=snap(C.clamp(dy,-minY,C.HEIGHT-maxY));
   if(state.snap){
    const active=m.members.find(t=>t.id===m.id)||m.members[0],ids=new Set(members.map(t=>t.id));
    const other=page().elements.filter(e=>!e.hidden&&!ids.has(e.id));
    const xLines=[0,C.WIDTH/2,C.WIDTH,...other.flatMap(e=>[e.x,e.x+e.w/2,e.x+e.w])];
    const yLines=[0,C.HEIGHT/2,C.HEIGHT,...other.flatMap(e=>[e.y,e.y+e.h/2,e.y+e.h])];
    const choose=(edges,targets)=>{let best=null;for(const edge of edges)for(const guide of targets){const offset=guide-edge,abs=Math.abs(offset);if(abs<=9&&(!best||abs<best.abs))best={offset,guide,abs};}return best;};
    const sx=choose([active.x+deltaX,active.x+active.w/2+deltaX,active.x+active.w+deltaX],xLines);
    const sy=choose([active.y+deltaY,active.y+active.h/2+deltaY,active.y+active.h+deltaY],yLines);
    if(sx)deltaX=C.clamp(deltaX+sx.offset,-minX,C.WIDTH-maxX);
    if(sy)deltaY=C.clamp(deltaY+sy.offset,-minY,C.HEIGHT-maxY);
    const gx=$('guideVertical'),gy=$('guideHorizontal');gx.hidden=!sx;gy.hidden=!sy;
    if(sx)gx.style.left=sx.guide+'px';if(sy)gy.style.top=sy.guide+'px';
   }
   members.forEach(t=>{const e=page().elements.find(b=>b.id===t.id);e.x=snap(t.x+deltaX);e.y=snap(t.y+deltaY);const n=qsa('.element',$('slide')).find(n=>n.dataset.id===e.id);if(n){n.style.left=e.x+'px';n.style.top=e.y+'px';}});
  }else{
   const size=MEDIA.resizeBox({...m.origin,x:element.x,y:element.y},{w:m.origin.w+dx,h:m.origin.h+dy},'both',{width:C.WIDTH,height:C.HEIGHT},Boolean(element.style?.aspectLock||ev.shiftKey));
   element.w=size.w;element.h=size.h;
   m.node.style.width=element.w+'px';m.node.style.height=element.h+'px';
  }
 }
 function endPointer(ev){
  const m=state.moving;if(!m||ev.pointerId!==m.pointerId)return;
  try{m.node.releasePointerCapture(ev.pointerId)}catch(e){}
  state.moving=null;$('guideVertical').hidden=true;$('guideHorizontal').hidden=true;
  if(m.changed){
   if(ev.type==='pointercancel'){
    m.members.forEach(t=>{const e=page().elements.find(x=>x.id===t.id);if(e){e.x=t.x;e.y=t.y;e.w=t.w;e.h=t.h;}});
    const target=page().elements.find(e=>e.id===m.id);if(target){target.w=m.origin.w;target.h=m.origin.h;if(m.crop){target.style.focusX=m.crop.focusX;target.style.focusY=m.crop.focusY;}}
    state.history.pop();renderAll();
   }else{persist();renderSlide();renderInspector();renderTimeline();renderPageList();}
  }
 }
 function handleKeys(e){const typing=e.target.closest('input,textarea,select,[contenteditable=true]');if(e.key==='Escape'){if(document.body.classList.contains('mobile-pages-open')){closePages();return;}for(const el of qsa('dialog[open]')){closeDialog(el.id);return;}if(qs('.rightbar.show')){qs('.rightbar').classList.remove('show');return;}if(state.preview){closePreview();return;}if(state.editingId){cancelEditing();return;}hideExportMenu();selectElement(null);return;}
  if(typing)return;
  if(e.ctrlKey&&e.key==='ArrowRight'){e.preventDefault();if(state.preview)previewJump(state.pageIndex+1);else selectPage(state.pageIndex+1);return;}
  if(e.ctrlKey&&e.key==='ArrowLeft'){e.preventDefault();if(state.preview)previewJump(state.pageIndex-1);else selectPage(state.pageIndex-1);return;}
  if(e.ctrlKey&&/^[1-9]$/.test(e.key)){const group=project.groups[Number(e.key)-1],index=group?project.pages.findIndex(p=>p.groupId===group.id):-1;e.preventDefault();if(index>=0){if(state.preview)previewJump(index);else selectPage(index);}return;}
  if(state.preview){
   if([' ','Spacebar'].includes(e.key)){e.preventDefault();document.querySelector('[data-action="story-toggle"]')?.click();}
   else if(e.key==='ArrowRight'&&!e.ctrlKey){e.preventDefault();previewJump(state.pageIndex+1);}
   else if(e.key==='ArrowLeft'&&!e.ctrlKey){e.preventDefault();previewJump(state.pageIndex-1);}
   return;
  }
  if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='q'){e.preventDefault();showQuality();return;}
  if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='m'){e.preventDefault();showReviews();return;}
  if(e.ctrlKey&&e.key.toLowerCase()==='f'){e.preventDefault();showSearch();return;}if(e.ctrlKey&&e.key.toLowerCase()==='g'){e.preventDefault();if(e.shiftKey)ungroupSelection();else groupSelection();return;}if(e.altKey&&(e.key==='ArrowUp'||e.key==='ArrowDown')){e.preventDefault();shiftPageOrder(state.pageIndex,state.pageIndex+(e.key==='ArrowUp'?-1:1));return;}if(e.ctrlKey&&e.key.toLowerCase()==='z'){e.preventDefault();undo();return;}
  if(e.ctrlKey&&e.key.toLowerCase()==='y'){e.preventDefault();redo();return;}
  if(e.ctrlKey&&e.key.toLowerCase()==='c'&&selected()){
   e.preventDefault();state.clipboard=chosen().map(el=>C.clone(el));toast(state.clipboard.length+'개 요소를 내부 클립보드에 복사했습니다.');return;
  }
  if(e.ctrlKey&&e.key.toLowerCase()==='v'&&state.clipboard){
   e.preventDefault();const source=Array.isArray(state.clipboard)?state.clipboard:[state.clipboard];if(source.length+page().elements.length>120)return toast('페이지당 120개 요소 제한으로 붙여넣기를 취소했습니다.');mutate(()=>{
    const original=Array.isArray(state.clipboard)?state.clipboard:[state.clipboard];
    const result=LAYERS.duplicate(original,original.map(el=>el.id),C.uid,{width:C.WIDTH,height:C.HEIGHT},26,120,true);
    const copies=result.added;
    page().elements.push(...copies);state.selectedIds=new Set(copies.map(x=>x.id));state.selectedId=copies[0]?.id||null;
   });return;
  }
  if(e.ctrlKey&&e.key.toLowerCase()==='d'){e.preventDefault();duplicate();return;}
  if((e.key==='Delete'||e.key==='Backspace')&&selected()){e.preventDefault();removeElement();return;}
  if(e.key==='Enter'&&selected()&&!selected().locked){e.preventDefault();startEdit(state.selectedId);return;}
  if(state.imageCropEditingId===selected()?.id&&selected()?.type==='image'&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
   e.preventDefault();const element=selected(),size=MEDIA.metadata(element.data),frame=size?MEDIA.frame(size,{w:element.w,h:element.h},element.style):null;
   if(element.locked||!frame||frame.mode==='fill')return;
   const amount=e.shiftKey?10:1,xf=C.clamp((element.style.focusX??50)+(e.key==='ArrowRight'?amount:e.key==='ArrowLeft'?-amount:0),0,100),yf=C.clamp((element.style.focusY??50)+(e.key==='ArrowDown'?amount:e.key==='ArrowUp'?-amount:0),0,100);
   if(xf!==(element.style.focusX??50)||yf!==(element.style.focusY??50))mutate(()=>{element.style.focusX=xf;element.style.focusY=yf;});return;
  }
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)&&selected()){
   const ids=chosen().map(el=>el.id),list=LAYERS.pick(page().elements,ids);if(!list.length)return;
   e.preventDefault();const delta=e.shiftKey?10:1;
   const dx=e.key==='ArrowLeft'?-delta:e.key==='ArrowRight'?delta:0,dy=e.key==='ArrowUp'?-delta:e.key==='ArrowDown'?delta:0;
   const probe=LAYERS.nudge(list.map(C.clone),ids,dx,dy,{width:C.WIDTH,height:C.HEIGHT});
   if(probe.changed)mutate(()=>LAYERS.nudge(page().elements,ids,dx,dy,{width:C.WIDTH,height:C.HEIGHT}));
  }
 }
 // V0.13 recovery extensions: all mutations share the original history boundary.
 const E=root.DocutEasing, M=root.DocutVisualMotion, CAT=root.DocutEffectCatalog;
 const backupKey='docut-studio-backups';
 function readBackups(){return P?P.readBackups(getStore()):[];}
 function maintainSelection(){const ids=new Set(page().elements.map(el=>el.id));state.selectedIds=new Set([...state.selectedIds].filter(id=>ids.has(id)));if(state.selectedId&&!ids.has(state.selectedId))state.selectedId=null;}
 function chosen(){return page().elements.filter(el=>state.selectedIds.has(el.id)||el.id===state.selectedId);}
 function backup(label='automatic'){
  const result=P?.makeBackup(getStore(),project,label);
  if(result&& !['saved','unchanged'].includes(result.status))console.warn('Backup unavailable:',result.error||result.status);
  return result;
 }
 function preMutationBackup(label){
  const safety=backup(label);
  if(['saved','unchanged'].includes(safety?.status)||workingCopyIsBackedUp())return true;
  toast('변경 적용을 보류했습니다. 원본 백업을 보존하지 못했습니다. 먼저 현재 문서를 JSON으로 다운로드하세요.');
  return false;
 }
 function openDialog(id){const el=$(id);if(!el)return;if(typeof el.showModal==='function'&&!el.open)el.showModal();else el.hidden=false;}
 function closeDialog(id){const el=$(id);if(!el)return;if(typeof el.close==='function'&&el.open)el.close();else el.hidden=true;}
 function displayLayouts(){const node=$('layoutList');if(!node)return;node.innerHTML=Object.entries(C.LAYOUTS).map(([id,name])=>`<button class="layout-choice ${page().layout===id?'active':''}" data-layout="${id}"><span class="layout-preview layout-${id}"></span><span>${C.escapeHTML(name)}</span></button>`).join('');}
 // Page kits have a separate device-local storage boundary. They never write into the
 // report's private reviews, source/evidence, numeric data or original page identities.
 function readKits(){state.kitSnapshot=KITS?.storageRead(getStore())||{status:'error',error:'Page kit library unavailable'};return state.kitSnapshot;}
 function clearKitImport(){state.kitImportSerial++;state.kitImportCandidate=null;$('kitImportReview').hidden=true;$('kitImportApprove').checked=false;$('kitImportApply').disabled=true;$('kitImportSummary').textContent='';}
 function showKits(){if(!KITS)return toast('페이지 키트 모듈을 읽을 수 없습니다.');readKits();clearKitImport();renderKits();openDialog('kitDialog');}
 function kitMiniPreview(pg){
  const safe=C.escapeHTML;
  return pg.elements.filter(b=>b.type!=='source').slice(0,13).map(b=>{const foreground=b.style?.color||'#304555';const kind=['bar','line','donut','table'].includes(b.type)?'chart':b.type;return `<i class="kit-preview-block kit-pro-${kind}" style="left:${(b.x/1280*100).toFixed(2)}%;top:${(b.y/720*100).toFixed(2)}%;width:${(b.w/1280*100).toFixed(2)}%;height:${(b.h/720*100).toFixed(2)}%;background:${['title','text'].includes(b.type)?safe(foreground):safe(b.style?.background||'#C3D4DE')}"></i>`;}).join('');
 }
 function renderKits(){if(!KITS)return;
  const snap=state.kitSnapshot||readKits(),book=snap.status==='ok'?snap.book:KITS.empty(),builtin=KITS.BUILTINS.map(v=>({...v,isLocal:false})),personal=book.templates.map(v=>({...v,ko:v.name,hint:'이 페이지의 구조·스타일만 보관됨',tone:'paper',isLocal:true}));
  const previewFor=pg=>pg.referenceFidelity?.mode==='source-ratio'?(root.DocutUBSVectorSource?.preview(pg)||'<div class="ubs-source-loading">UBS 벡터 준비 중</div>'):KITS.previewMarkup(pg);
  const category=$('kitCategory').value,proMode=category.startsWith('pro'),personalOnly=category==='내 템플릿',q=String($('kitSearch').value||'').trim().toLocaleLowerCase(),colorChoice=$('kitPalette').value,safe=C.escapeHTML;
  const list=proMode?(PRO?.PACKS||[]).filter(p=>(category==='pro'||p.family===category.slice(4))):personalOnly?personal:builtin.filter(k=>category==='legacy'||k.category===category);
  const visible=list.filter(k=>!q||[k.name||'',k.ko||'',k.company||'',k.originalTitle||'',k.family||'',k.category||'',k.hint||''].join(' ').toLocaleLowerCase().includes(q));
  if(!visible.some(k=>k.id===state.kitSelection)){state.kitSelection=visible[0]?.id||'';state.kitPreviewIndex=0;}
  $('kitGallery').innerHTML=visible.length?visible.map(k=>{
   const pro=proMode,pg=pro?PRO.buildPage(k.id,0,colorChoice):k.isLocal?k:KITS.builtPage(k.id,colorChoice);
   const title=pro?k.company:k.ko,subtitle=pro?(k.id==='FIN-16'&&colorChoice==='original'?'2025 원본 도형 기반 · 6장 · SVG 그래픽 실측':`${PRO.FAMILY_KO[k.family]} · ${k.design} · 6페이지`):k.name+' · '+k.category;
   return `<button type="button" class="kit-choice ${pro?'pro-pack-choice':''} ${k.id===state.kitSelection?'selected':''}" data-kit-choice="${safe(k.id)}" aria-pressed="${k.id===state.kitSelection?'true':'false'}"><span class="kit-choice-swatch kit-choice-preview" style="background:${safe(pg.background||'#F7F7F4')}">${pro?previewFor(pg):kitMiniPreview(pg)}</span><span><b>${safe(title)}</b><small>${safe(subtitle)}</small></span></button>`;
  }).join(''):'<p class="caption-small">검색에 맞는 레퍼런스가 없습니다.</p>';
  $('kitStorageStatus').textContent=snap.status==='ok'?`개인 템플릿 ${book.templates.length}/${KITS.MAX_KITS}개 · 이 기기에만 저장됩니다.`:'개인 템플릿 저장소 오류: '+snap.error;
  $('kitDamagedExport').hidden=snap.status!=='error'||!snap.raw;$('kitDamagedReset').hidden=snap.status!=='error'||!snap.raw;
  const chosen=visible.find(k=>k.id===state.kitSelection);const isPro=Boolean(chosen&&proMode);
  $('kitPackAdd').hidden=!isPro;$('kitPackPageStrip').hidden=!isPro;$('kitReferenceNote').hidden=!isPro;
  $('kitDialog').querySelector('[data-action=kit-insert]').disabled=!chosen;
  if(!chosen){$('kitPreviewCanvas').innerHTML='';$('kitPreviewTitle').textContent='레퍼런스를 선택하세요';$('kitDelete').hidden=true;return;}
  let pg;
  if(isPro){
   pg=PRO.buildPage(chosen.id,state.kitPreviewIndex,colorChoice);
   $('kitPackPageStrip').innerHTML=chosen.patterns.map((name,i)=>{const item=PRO.buildPage(chosen.id,i,colorChoice);return `<button type="button" class="kit-pack-page ${i===state.kitPreviewIndex?'active':''}" data-kit-page="${i}" aria-label="${i+1}페이지 ${safe(item.tab)}" aria-pressed="${i===state.kitPreviewIndex}"><span class="kit-pack-mini" style="background:${safe(item.background)}">${previewFor(item)}</span><b>${String(i+1).padStart(2,'0')}</b><span>${safe(item.tab)}</span></button>`;}).join('');
   $('kitReferenceEvidence').textContent=pg.referenceFidelity?'UBS 2025 원본 비율 벡터 뼈대 / PDF SVG 그래픽 점수 99% 이상 / 브라우저 출력 별도 검증':chosen.evidence==='official_index_only'?'공식 IR 자료 색인 확인 · 상세 페이지 검증 필요':'공개 원문을 참고한 독립 구성';
   const link=$('kitReferenceSource'),src=pg.referenceFidelity?.sourceUrl||chosen.source;link.href=/^https:\/\/[^\s"'<>]+$/i.test(src)?src:'#';link.textContent=pg.referenceFidelity?'UBS 2025 원본 PDF ↗':'공식 원본 보기 ↗';
   $('kitPreviewTitle').textContent=chosen.company+' · '+pg.tab;
   $('kitPreviewDescription').textContent=pg.referenceFidelity?'UBS PDF 실제 도형 좌표 기반 · 글자/사진/로고 제외 · 원본 비율 SVG · 텍스트는 편집기로 추가':chosen.design+' · 독립 구성 / 원문 이미지는 미포함';
   $('kitPreviewDetails').textContent=pg.referenceFidelity?`원본 PDF ${pg.referenceFidelity.sourcePage}쪽 · SVG 벡터 그래픽 실측 ${pg.referenceFidelity.graphicsAuditScore?.toFixed(3)}% · 본문·숫자 별도 입력 · 브라우저 원본 일치율 미검증`:`전문 레이아웃 ${state.kitPreviewIndex+1}/6 · 편집 요소 ${pg.elements.length}개 · 수치/출처 미입력 · 기존 페이지 유지`;
  }else{
   pg=KITS.pageFromKit(chosen.isLocal?chosen:chosen.id,chosen.isLocal?'original':colorChoice);
   $('kitPreviewTitle').textContent=chosen.ko+' · '+chosen.name;
   $('kitPreviewDescription').textContent=chosen.hint+(chosen.isLocal?' · 개인 템플릿 색상 유지':colorChoice!=='original'?' · 컬러 팔레트 변경':'');
   $('kitPreviewDetails').textContent=`편집 요소 ${pg.elements.length}개 · 독립 신규 페이지 추가 · 기존 페이지 ${project.pages.length}장 유지`;
  }
  $('kitPreviewStage').style.background=pg.background||'#F7F7F4';$('kitPreviewCanvas').innerHTML=previewFor(pg);
  $('kitDelete').hidden=!chosen.isLocal;
 }
 root.addEventListener?.('docut-ubs-vector-ready',()=>{if($('kitDialog')?.open)renderKits();if(page()?.referenceFidelity?.mode==='source-ratio')renderSlide();});
 function insertKit(){if(!KITS)return;const key=state.kitSelection,snap=state.kitSnapshot||readKits();if(project.pages.length>=50)return toast('50페이지 한도를 초과해 추가를 취소했습니다.');
  const pro=$('kitCategory').value.startsWith('pro')&&PRO?.find(key);
  const template=pro||KITS.BUILTINS.find(k=>k.id===key)||((snap.status==='ok'&&snap.book.templates.find(k=>k.id===key))||null);
  if(!template)return toast('선택한 레퍼런스를 확인하세요.');
  let next;try{next=pro?PRO.buildPage(key,state.kitPreviewIndex,$('kitPalette').value):KITS.pageFromKit(template.id.startsWith('user-')?template:template.id,template.id.startsWith('user-')?'original':$('kitPalette').value);if(project.pages.some(p=>p.id===next.id))throw Error('Page identity collision');}catch(e){return toast('페이지 생성 취소: '+e.message);}
  if(next.referenceFidelity?.mode==='source-ratio'&&root.DocutUBSVectorSource?.status!=='ready')return toast('UBS 원본 벡터 로딩이 완료되지 않았습니다. 잠시 후 다시 추가하세요.');
   if(!preMutationBackup('before inserting report reference page'))return;
  mutate(()=>{next.groupId=page().groupId;project.pages.splice(state.pageIndex+1,0,next);state.pageIndex++;state.selectedId=null;state.selectedIds.clear();});writePageHash();
  closeDialog('kitDialog');toast('기존 페이지를 유지하고 '+next.tab+' 레이아웃을 추가했습니다. 실제 수치·근거를 입력하세요.');
 }
 function insertProfessionalPack(){const id=state.kitSelection,p=PRO?.find(id);
  if(!p||!$('kitCategory').value.startsWith('pro'))return toast('전문 보고서 팩을 먼저 선택하세요.');
  if(project.pages.length+6>50)return toast('6페이지 추가 시 최대 50페이지를 초과합니다. 기존 페이지를 정리하거나 낱장으로 추가하세요.');
  let pages;try{pages=PRO.buildPack(id,$('kitPalette').value);if(pages.length!==6||new Set(pages.map(x=>x.id)).size!==6)throw Error('페이지 구성 검증 실패');}catch(e){return toast('보고서 생성 취소: '+e.message);}
  if(pages.some(pg=>pg.referenceFidelity?.mode==='source-ratio')&&root.DocutUBSVectorSource?.status!=='ready')return toast('UBS 원본 벡터 로딩이 완료되지 않았습니다. 빈 페이지 삽입을 차단했습니다.');
   if(!preMutationBackup('before inserting six-page professional report'))return;
  mutate(()=>{const groupId=page().groupId;pages.forEach(p=>p.groupId=groupId);project.pages.splice(state.pageIndex+1,0,...pages);state.pageIndex+=1;state.selectedId=null;state.selectedIds.clear();});writePageHash();
  closeDialog('kitDialog');toast(p.company+' 레퍼런스 기반 6페이지를 추가했습니다. 모든 차트·표 수치 및 근거를 입력하세요.');
 }
 function storeKit(next,expected){const r=KITS.saveBook(getStore(),next,expected);if(r.status!=='saved'){toast('개인 템플릿 저장 보류: '+r.error+' · 다른 탭 확인 또는 JSON 내보내기를 이용하세요.');return false;}state.kitSnapshot={status:'ok',book:r.book,raw:r.raw};renderKits();return true;}
 function captureKit(){const snap=state.kitSnapshot||readKits();if(snap.status!=='ok')return toast('손상된 템플릿 저장소는 덮어쓰지 않습니다.');
  try{const template=KITS.capture(page(),$('kitCustomName').value);const next=KITS.addKit(snap.book,template);
   if(storeKit(next,snap.raw)){$('kitCustomName').value='';state.kitSelection=template.id;renderKits();toast('본문·수치·출처를 제거하고 현재 페이지의 스타일·구조만 개인 템플릿에 저장했습니다.');}
  }catch(e){toast('템플릿 저장 취소: '+e.message);}
 }
 function deleteKit(){const snap=state.kitSnapshot||readKits();if(snap.status!=='ok')return toast('템플릿 저장소를 먼저 복구하세요.');const kit=snap.book.templates.find(k=>k.id===state.kitSelection);if(!kit)return;
  if(!root.confirm('개인 템플릿 '+kit.name+'을(를) 이 기기에서 삭제하시겠습니까? 보고서 페이지는 삭제되지 않습니다.'))return;
  try{const next=KITS.deleteKit(snap.book,kit.id);if(storeKit(next,snap.raw)){state.kitSelection='executive';renderKits();toast('개인 템플릿만 삭제했습니다. 보고서 본문은 유지됩니다.');}}catch(e){toast(e.message);}
 }
 function exportKitBook(){const snap=state.kitSnapshot||readKits();if(snap.status!=='ok')return toast('개인 템플릿을 안전하게 읽을 수 없습니다. 손상 원본을 먼저 보존하세요.');
  X.downloadFile('DoCut_Private_Page_Kits.json',KITS.exportBook(snap.book),'application/json;charset=utf-8');toast('본문·근거·이미지를 제외한 개인 템플릿 라이브러리를 다운로드했습니다.');
 }
 async function previewKitImport(file){if(!file)return;clearKitImport();if(file.size>450000)return toast('키트 JSON 파일은 450KB 이하여야 합니다.');
  const serial=state.kitImportSerial,snap=state.kitSnapshot||readKits();if(snap.status!=='ok')return toast('손상된 기존 라이브러리에는 가져오지 않습니다.');
  try{const raw=await file.text();if(serial!==state.kitImportSerial||getStore()?.getItem(KITS.KEY)!==snap.raw)throw Error('파일 읽기 중 다른 탭에서 라이브러리가 변경됐습니다.');
   const plan=KITS.inspectPacket(snap.book,raw);state.kitImportCandidate={raw,baselineRaw:snap.raw,plan};$('kitImportReview').hidden=false;
   $('kitImportSummary').textContent=`${file.name} · 신규 ${plan.added.length}종, 기존 동일 ${plan.duplicates}종. 신규 이름: ${plan.added.map(x=>x.name).join(', ')||'없음'}. 기존 템플릿은 덮어쓰지 않습니다.`;
   $('kitImportApprove').checked=false;$('kitImportApply').disabled=true;
  }catch(e){toast('키트 가져오기 분석 취소: '+e.message);}
 }
 function applyKitImport(){const candidate=state.kitImportCandidate,snap=state.kitSnapshot||readKits();if(!candidate||!$('kitImportApprove').checked)return;
  if(snap.status!=='ok'||snap.raw!==candidate.baselineRaw||getStore()?.getItem(KITS.KEY)!==candidate.baselineRaw){clearKitImport();return toast('검토 중 키트 라이브러리가 변경됐습니다. 다시 읽으세요.');}
  try{const merged=KITS.mergePacket(snap.book,candidate.raw);if(storeKit(merged,candidate.baselineRaw)){clearKitImport();toast('개인 템플릿 '+candidate.plan.added.length+'종을 기존 항목 유지하며 병합했습니다.');}}
  catch(e){toast('키트 병합 취소: '+e.message);}
 }
 function exportDamagedKitStore(){const snap=KITS.storageRead(getStore());if(snap.status!=='error'||!snap.raw)return;X.downloadFile('DoCut_Damaged_Page_Kits.txt',snap.raw,'text/plain;charset=utf-8');state.kitCorruptExport=P.checksum(snap.raw);toast('손상된 원본 TXT를 다운로드했습니다.');}
 function resetDamagedKitStore(){const snap=KITS.storageRead(getStore());if(!state.kitCorruptExport||snap.status!=='error'||!snap.raw||P.checksum(snap.raw)!==state.kitCorruptExport)return toast('손상된 최신 원본 TXT를 먼저 저장하세요.');
  if(!root.confirm('손상 원본을 저장했습니까? 템플릿 라이브러리만 초기화하고 기존 보고서 JSON은 유지하시겠습니까?'))return;
  try{const storage=getStore();if(storage.getItem(KITS.KEY)!==snap.raw)throw Error('다른 탭에서 라이브러리가 변경됐습니다.');storage.removeItem(KITS.KEY);state.kitCorruptExport=null;readKits();state.kitSelection='executive';renderKits();toast('손상된 템플릿 라이브러리만 새로 시작했습니다. 보고서 원본은 그대로입니다.');}catch(e){toast('키트 초기화 실패: '+e.message);}
 }
 function syncRightPanel(){
  const active=state.rightMode==='validation';
  $('inspector').hidden=active;$('validationPanel').hidden=!active;
  if(active){$('inspectorTitle').textContent='검증 · '+({typo:'오탈자',report:'보고서 문제',ai:'AI 문장 개선'}[state.validationMode]||'');$('selectionType').textContent='CHECK';}
  const button=qs('[data-action="validate"]');if(button){button.setAttribute('aria-pressed',String(active));button.classList.toggle('active',active);}
 }
 function showValidation(mode){if(!VALID)return toast('한국어·영어 검증 모듈을 불러오지 못했습니다.');
  if(state.editingId)finishEditing();state.rightMode='validation';state.validationMode=['typo','report','ai'].includes(mode)?mode:'typo';
  closePages();qs('.rightbar')?.classList.add('show');renderValidation();syncRightPanel();
 }
 function showElementPanel(){state.rightMode='inspector';$('inspector').hidden=false;$('validationPanel').hidden=true;renderInspector();syncRightPanel();}
 function resetValidationProposal(){state.validationProposal=null;if($('validationProposedText'))$('validationProposedText').value='';$('validationDiff').hidden=true;$('validationApplyProposal').disabled=true;}
 function validationIgnoreKey(issue){return issue.id+'|'+issue.originalText;}
 function renderValidation(){if(state.rightMode!=='validation'||!VALID)return;
  syncRightPanel();const mode=state.validationMode,esc=C.escapeHTML;
  qsa('[data-validation-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.validationMode===mode);b.setAttribute('aria-selected',String(b.dataset.validationMode===mode));});
  $('validationOptions').hidden=mode==='ai';$('validationAI').hidden=mode!=='ai';
  $('validationScope').value=state.validationScope;$('validationLanguage').value=state.validationLanguage;
  const area=$('validationResults');state.validationIssues=[];
  if(mode==='typo'){
   $('validationHelp').textContent='한·영 기본 철자·중복·공백만 보수적으로 안내합니다. 한국어 문법 전반을 판정하지 않습니다.';
   const issues=VALID.findIssues(project,{scope:state.validationScope,pageIndex:state.pageIndex,selectedId:state.selectedId,lang:state.validationLanguage,ignored:state.validationIgnored});state.validationIssues=issues;
   $('validationSummary').textContent=`교정 후보 ${issues.length}건 · 자동 수정 없음${state.validationIgnored.size?' · 이 세션에서 '+state.validationIgnored.size+'건 제외':''}${issues.length>=300?' · 검사 최대 300건':''}`;
   area.innerHTML=issues.length?issues.slice(0,state.validationVisible).map((issue,i)=>`<article class="validation-item"><span class="validation-item-meta">${issue.pageIndex+1}쪽 · ${esc(issue.targetLabel||'본문')} · ${esc(issue.lang==='ko'?'한국어':issue.lang==='en'?'영어':'공백')} · ${esc(issue.reason)}</span><div class="validation-change"><del>${esc(issue.before)}</del><span aria-label="바꿀 문구">→ ${esc(issue.after)}</span></div><div class="validation-item-actions"><button data-validation-locate="${i}" class="inspect-action">요소 찾기</button><button data-validation-fix="${i}" class="inspect-action">이 항목만 적용</button><button data-validation-ignore="${i}" class="inspect-action" title="이번 편집 세션에서 같은 원문의 이 후보만 제외합니다">무시</button></div></article>`).join(''):'<p class="validation-empty">현재 범위에서 로컬 규칙에 해당하는 후보가 없습니다. 전체 맞춤법 무오류를 뜻하지 않습니다.</p>';
   if(issues.length>state.validationVisible)area.insertAdjacentHTML('beforeend',`<button class="inspect-action validation-more" data-action="validation-more">${issues.length-state.validationVisible}건 더 보기</button>`);
   if(state.validationIgnored.size)area.insertAdjacentHTML('beforeend','<button class="inspect-action validation-reset-ignored" data-action="validation-reset-ignored">이번 세션 무시 항목 다시 표시</button>');
  }else if(mode==='report'){
   $('validationHelp').textContent='보고서의 근거·숫자·배치·논리 흐름을 정적 규칙으로 점검합니다. 진위와 내용의 정확성은 사람이 확인해야 합니다.';
   if(!QUALITY){$('validationSummary').textContent='보고서 점검 엔진 없음';area.innerHTML='';return;}
   const report=QUALITY.analyze(project);const issues=(report.issues||[]).filter(it=>state.validationScope!=='selected'||(!!state.selectedId&&(it.id===state.selectedId||it.relatedId===state.selectedId))).filter(it=>state.validationScope!=='current'||it.pageIndex===state.pageIndex);
   state.validationIssues=issues;$('validationSummary').textContent=`우선 검토 ${issues.filter(i=>i.severity==='critical').length}건 · 기타 ${issues.filter(i=>i.severity!=='critical').length}건 · 자동 수정 없음`;
   area.innerHTML=issues.length?issues.slice(0,state.validationVisible).map((it,i)=>`<button class="validation-item validation-report-hit" data-validation-quality="${i}"><span class="validation-item-meta">${it.pageIndex+1}쪽 · ${esc(QUALITY.CATEGORY_NAME?.[it.category]||it.category)} · ${esc(QUALITY.SEVERITY_NAME?.[it.severity]||it.severity)}</span><strong>${esc(it.message)}</strong><small>${esc(it.hint)}</small><span class="validation-item-link">위치로 이동</span></button>`).join(''):'<p class="validation-empty">이 범위에서 자동 경고가 없습니다. 수기 검토는 별도로 필요합니다.</p>';
   if(issues.length>state.validationVisible)area.insertAdjacentHTML('beforeend',`<button class="inspect-action validation-more" data-action="validation-more">${issues.length-state.validationVisible}건 더 보기</button>`);
  }else{
   $('validationHelp').textContent='외부 AI 자동 호출 없음 · 선택 문장을 복사하고 별도 받은 제안문만 비교·승인합니다.';
   area.innerHTML='';const el=selected(),pg=page();const targetKey=pg?.id+'|'+el?.id;
   if(targetKey!==state.validationAITarget){state.validationAITarget=targetKey;resetValidationProposal();}
   if(!VALID.eligible(el)){$('validationSummary').textContent='잠기지 않은 일반 텍스트 요소를 캔버스에서 하나 선택하세요. 차트·표·부분서식 요소는 보호됩니다.';$('validationProposedText').disabled=true;$('validationApplyProposal').disabled=true;}
   else{$('validationSummary').textContent=`${state.pageIndex+1}쪽 · ${labels[el.type]||el.type} · ${el.text.length}자 원문`;$('validationProposedText').disabled=false;}
  }
 }
 function locateValidation(i){const issue=state.validationIssues[i];if(!issue)return;locateValidationTarget(issue.pageIndex,issue.elementId);}
 function locateValidationQuality(i){const issue=state.validationIssues[i];if(!issue)return;locateValidationTarget(issue.pageIndex,issue.id,issue.relatedId);}
 function locateValidationTarget(pageIndex,elementId,relatedId){if(!project.pages[pageIndex])return;state.pageIndex=pageIndex;state.selectedId=project.pages[pageIndex].elements.some(e=>e.id===elementId)?elementId:null;state.selectedIds=new Set(state.selectedId?[state.selectedId]:[]);if(relatedId&&project.pages[pageIndex].elements.some(e=>e.id===relatedId))state.selectedIds.add(relatedId);renderAll();}
 function applyValidationFix(index){const issue=state.validationIssues[index];if(!issue||state.validationMode!=='typo')return;
  try{const plan=VALID.planChange(project,issue,issue.originalText,issue.proposedText);if(!preMutationBackup('before spelling correction'))return;
   mutate(()=>VALID.applyPlan(project,plan));toast('한 항목만 적용했습니다. 원문·출처를 확인하세요. Ctrl+Z로 되돌릴 수 있습니다.');
  }catch(error){toast('교정 취소: '+error.message);renderValidation();}
 }
 function copyValidationPrompt(){const el=selected();if(!el||!VALID.eligible(el))return toast('일반 텍스트 요소 하나를 먼저 선택하세요.');
  try{copyText(VALID.aiPrompt(el,{title:project.title,pageTitle:page().tab}),'AI 개선 요청문');}
  catch(error){toast(error.message);}
 }
 function compareValidationProposal(){const el=selected(),value=$('validationProposedText').value;
  try{const plan=VALID.planChange(project,{pageId:page()?.id,elementId:el?.id},el?.text,value);state.validationProposal=plan;
   $('validationDiff').hidden=false;$('validationDiff').innerHTML=`<strong>수정 전·후 비교</strong><label>현재 원문<pre>${C.escapeHTML(plan.originalText)}</pre></label><label>사용자 승인 대기 제안<pre>${C.escapeHTML(plan.nextText)}</pre></label><p class="caption-small">숫자와 단위 배열이 같은지 검사했습니다. 의미·논리의 정확성은 직접 확인하세요.</p>`;
   $('validationApplyProposal').disabled=false;
  }catch(error){state.validationProposal=null;$('validationDiff').hidden=false;$('validationDiff').textContent='적용 전 검토 실패: '+error.message;$('validationApplyProposal').disabled=true;}
 }
 function applyValidationProposal(){const plan=state.validationProposal;if(!plan)return;
  if($('validationProposedText').value!==plan.nextText)return toast('비교한 뒤 문장이 변경됐습니다. 다시 비교하세요.');
  try{VALID.planChange(project,plan,plan.originalText,plan.nextText);
   if(!preMutationBackup('before selected AI text improvement'))return;
   resetValidationProposal();mutate(()=>VALID.applyPlan(project,plan));toast('선택한 문장만 반영했습니다. 수치·출처는 유지됩니다. Undo 가능.');
  }catch(error){state.validationProposal=null;$('validationApplyProposal').disabled=true;toast('개선문 적용 취소: '+error.message);}
 }

 function showQuality(){if(!QUALITY)return toast('품질 점검 모듈이 없습니다.');state.qualityReport=QUALITY.analyze(project);renderQuality();openDialog('qualityDialog');}
 function renderQuality(){const r=state.qualityReport;if(!r)return;
  const esc=C.escapeHTML;
  $('qualitySummary').textContent=`${r.pages.length}페이지 · 총 점검 ${r.total}건 (우선 ${r.counts.critical} / 검토 ${r.counts.review} / 제안 ${r.counts.suggestion})${r.truncated?' · 표시 한도 초과 '+r.truncated+'건':''}`;
  $('qualitySeverityFilter').value=state.qualitySeverity;
  $('qualityCategoryFilter').value=state.qualityCategory;
  $('qualityStoryMap').innerHTML=r.pages.map(pg=>`<button type="button" class="quality-story-row" data-issue-page="${pg.index}" aria-label="${pg.index+1}페이지 선택"><span class="quality-page-index">${String(pg.index+1).padStart(2,'0')}</span><span class="quality-story-text"><b>${esc(pg.title)}</b><small>권장 역할: ${esc(pg.suggested)}</small><small class="quality-story-question">${esc(pg.question)}</small></span><span class="quality-page-count">${pg.issueCount}건</span></button>`).join('');
  const found=QUALITY.filter(r,state.qualitySeverity,state.qualityCategory);
  $('qualityVisibleCount').textContent=`(${found.length}개 표시)`;
  $('qualityList').innerHTML=found.length?found.map(it=>`<button type="button" class="quality-hit quality-${it.severity}" data-issue-page="${it.pageIndex}" data-issue-id="${esc(it.id||'')}" data-issue-related-id="${esc(it.relatedId||'')}" title="${esc(it.hint)}"><span class="quality-item-head"><b>${it.pageIndex+1}쪽 · ${esc(QUALITY.CATEGORY_NAME[it.category])}</b><span class="quality-level">${esc(QUALITY.SEVERITY_NAME[it.severity])}</span></span><span>${esc(it.message)}</span><small>${esc(it.hint)}</small></button>`).join(''):'<p class="caption-small">이 조건에 해당하는 항목이 없습니다. 자동 점검 결과는 수동 사실 검증을 대신하지 않습니다.</p>';
 }
 function exportQualityTxt(){const report=QUALITY?.analyze(project);if(!report)return;state.qualityReport=report;X.downloadFile(X.filenameSafe(project.title)+'_QUALITY_REVIEW.txt',QUALITY.formatTxt(report),'text/plain;charset=utf-8');toast('점검 의견 TXT를 저장했습니다.');}
 function exportQualityCsv(){const report=QUALITY?.analyze(project);if(!report)return;state.qualityReport=report;X.downloadFile(X.filenameSafe(project.title)+'_QUALITY_REVIEW.csv',QUALITY.formatCsv(report),'text/csv;charset=utf-8');toast('점검 내역 CSV를 저장했습니다.');}
 function copyQualityPrompt(){const report=QUALITY?.analyze(project);if(!report)return;state.qualityReport=report;copyText(QUALITY.aiChecklist(report),'보고서 개선 요청');}

 function qualityToReviews(){if(!QUALITY||!REV)return;
  const analysis=QUALITY.analyze(project);const choices=analysis.issues.filter(it=>['critical','review'].includes(it.severity));
  const existing=new Set((project.reviews||[]).map(n=>[n.pageId,n.elementId,n.body].join('|')));
  const batch=[];for(const issue of choices){const pg=project.pages[issue.pageIndex];if(!pg)continue;
   const body=`[자동 점검 ${issue.rule}] ${issue.message}\n확인 권장: ${issue.hint}`;
   const key=[pg.id,issue.id||'',body].join('|');if(existing.has(key))continue;
   existing.add(key);batch.push(REV.newReview({pageId:pg.id,elementId:issue.id||'',body,priority:issue.severity==='critical'?'high':'normal',author:'DoCut 자동 점검'}));
   if(batch.length>=20)break;
  }
  if(!batch.length)return toast('등록 가능한 신규 우선 검토 항목이 없습니다. 이미 등록됐거나 해당 문제가 없습니다.');
  if((project.reviews||[]).length+batch.length>REV.MAX_NOTES)return toast('검토 메모 저장 한도를 초과합니다. 기존 의견을 먼저 별도 파일에 보존하세요.');
  if(!root.confirm(`자동 진단 ${batch.length}건을 내부 검토 메모로 등록하시겠습니까? 실제 수치·출처가 검증되거나 자동 수정되는 것은 아닙니다.`))return;
  try{const candidate=REV.normalize([...(project.reviews||[]),...batch]);mutate(()=>{project.reviews=candidate;});toast('확인이 필요한 자동 진단 항목을 내부 메모로 옮겼습니다.');closeDialog('qualityDialog');showReviews();}catch(error){toast('검토 메모 등록 취소: '+error.message);}
 }
 function showSearch(){openDialog('searchDialog');$('searchInput').focus();renderSearchResults();}
 function renderSearchResults(){const q=$('searchInput').value;const results=C.searchProject(project,q);$('searchSummary').textContent=q?results.length+' match(es)':'Enter search text';$('searchResults').innerHTML=results.map(r=>`<button class="search-hit" data-search-page="${r.pageIndex}" data-search-id="${r.id?C.escapeHTML(r.id):''}"><b>${r.pageIndex+1}. ${C.escapeHTML(project.pages[r.pageIndex].tab)}</b><span>${C.escapeHTML(r.preview)}</span></button>`).join('');}
 function showRecovery(){const record=P.inspectBackups(getStore()),list=record.items;
  $('backupIndexWarning').hidden=record.status==='ok';$('backupIndexControls').hidden=record.status!=='corrupt';
  if(record.status!=='ok')$('backupIndexWarning').textContent=record.status==='corrupt'?'기존 백업 목록이 손상됐습니다. 새 기록으로 덮지 않았으며 원본 TXT를 먼저 내려받을 수 있습니다.':'브라우저가 백업 저장소에 접근할 수 없습니다. JSON을 별도로 저장하세요.';
  $('recoveryList').innerHTML=list.length?list.map((b,i)=>`<button data-restore-index="${i}" class="recovery-item"><b>${C.escapeHTML(b.date||'Backup')}</b><small>${C.escapeHTML(b.label||'Saved project')} · ${Array.isArray(b.project.pages)?b.project.pages.length:'?'}페이지 · 검토 후 복원</small></button>`).join(''):'복원할 저장 기록이 없습니다.';openDialog('recoveryDialog');
 }
 function downloadDamagedBackups(){const result=P.inspectBackups(getStore());if(result.status!=='corrupt')return toast('손상된 백업 데이터가 없습니다.');X.downloadFile('DoCut_Damaged_Backup_Index.txt',result.raw,'text/plain;charset=utf-8');state.exportedBackups=P.checksum(result.raw);toast('손상된 백업 기록을 TXT로 보존했습니다.');}
 function resetDamagedBackups(){if(!state.exportedBackups)return toast('먼저 손상된 백업 원본 TXT를 내려받으세요.');if(!root.confirm('손상된 백업 목록을 별도 TXT로 보관했습니까? 복구 기록을 새로 시작하시겠습니까?'))return;
  const storage=getStore(),result=P.inspectBackups(storage);if(result.status!=='corrupt'||P.checksum(result.raw)!==state.exportedBackups)return toast('다운로드 이후 백업 원본이 변경됐습니다. 새 파일을 내려받으세요.');
  try{storage.removeItem(P.BACKUPS);}catch(e){return toast('백업 초기화 오류: '+e.message);}
  state.exportedBackups=false;const created=backup('after recovering backup index');showRecovery();if(created?.status==='saved')toast('손상 원본을 별도 저장한 뒤 백업 기록을 다시 시작했습니다.');
 }
 function inspectBackup(index){const record=readBackups()[index];if(!record)return toast('해당 백업을 찾을 수 없습니다.');
  let restored;try{restored=C.normalizeProject(record.project)}catch(e){return toast('백업 데이터가 손상되어 현재 문서를 유지했습니다.');}
  const diff=P.compareProjects(project,restored);state.backupCandidate={index,project:restored,label:record.label||'',date:record.date||''};state.backupBaseline=JSON.stringify(project);
  $('backupCompareTitle').textContent=String(record.date||'Local backup')+' · '+String(record.label||'Backup');
  $('backupCompareSummary').textContent=`현재 ${diff.pagesBefore}페이지 → 복원 ${diff.pagesAfter}페이지 · 페이지 추가 ${diff.pagesAdded} / 삭제 ${diff.pagesRemoved} / 수정 ${diff.pagesChanged} · 요소 추가 ${diff.elementsAdded} / 삭제 ${diff.elementsRemoved} / 수정 ${diff.elementsChanged} · 출처/검증 항목 변경 ${diff.sourcesChanged}`;
  $('backupCompareWarnings').textContent=(diff.verificationLost?`기존에 직접 확인한 ${diff.verificationLost}개 요소의 검증 상태가 복원 후 해제됩니다. `:'')+(diff.pagesRemoved?`${diff.pagesRemoved}페이지가 현재 보고서에서 빠집니다. `:'')+(diff.pagesReordered?'페이지 순서가 변경됩니다. ':'')+(diff.documentSettingsChanged?'보고서 제목·테마 또는 마스터 설정이 변경됩니다. ':'')+'자동 비교는 사실 여부나 모션 디자인 일치를 검증하지 않습니다.';
  openDialog('backupCompareDialog');
 }
 function downloadSelectedBackup(){if(!state.backupCandidate)return;const name=X.filenameSafe(state.backupCandidate.project.title)+'_RECOVERY.docut.json';X.downloadFile(name,JSON.stringify(state.backupCandidate.project,null,2),'application/json;charset=utf-8');toast('선택한 백업 문서를 JSON으로 내려받았습니다.');}
 function applySelectedBackup(){const choice=state.backupCandidate;if(!choice)return;
  if(state.backupBaseline!==JSON.stringify(project))return toast('백업 검토 후 문서가 변경되었습니다. 다시 비교해야 합니다.');
  const safety=backup('before restoring backup');if(!['saved','unchanged'].includes(safety?.status)&&!workingCopyIsBackedUp())return toast('현재 편집본을 보존하지 못했습니다. 먼저 JSON을 내려받으세요.');
  // Write the approved target BEFORE changing the active in-memory document.
  // A quota or concurrent-tab conflict must not be reported as a successful restore.
  const target=C.clone(choice.project);target.updatedAt=new Date().toISOString();
  const stored=P.write(getStore(),C.normalizeProject,target,state.saveToken,writerId);
  if(stored.status!=='saved'){
   reportStorageProblem(stored.status==='conflict'?'conflict':stored.status==='corrupt'?'corrupt':'failed',stored.error||'Could not store approved backup');
   return toast('백업 복원을 저장하지 못했습니다. 현재 문서는 그대로 유지되며 저장 경고를 확인하세요.');
  }
  checkpoint();project=target;state.saveToken=stored.token;state.saveProblem=null;state.exportedLocal=false;state.exportedLocalHash=null;
  state.pageIndex=0;state.selectedId=null;state.selectedIds.clear();state.backupCandidate=null;state.backupBaseline=null;
  closeDialog('backupCompareDialog');closeDialog('recoveryDialog');renderAll();updateSaveUI();toast('백업 문서를 복원했습니다. 현재 문서의 이전 버전도 보존했습니다.');
 }
 function auditText(){const issues=(QUALITY?QUALITY.analyze(project).issues:C.auditProject(project)).map(it=>`페이지 ${it.pageIndex+1} | ${it.type} | ${it.message} | ${it.id||'페이지'}`);
  const records=project.pages.flatMap((pg,i)=>pg.elements.filter(el=>!el.hidden).map(el=>{
   const tidy=v=>String(v||'').replace(/[\r\n|]+/g,' ').slice(0,700);
   return [`페이지 ${i+1}`,tidy(pg.tab),tidy(el.type),tidy(el.text),tidy(el.source),tidy(el.asOfDate),tidy(el.unit||el.data?.unit),tidy(el.evidence),el.verified?'직접 확인':'미검증'].join(' | ');
  }));
  return ['DoCut 근거 및 검증 기록',project.title,'주의: 자동 점검은 수치의 사실 여부를 검증하지 않습니다.','','[페이지 | 제목 | 요소 | 내용 | 출처 | 기준일 | 단위 | 근거 설명 | 검증 상태]',...records,'','[자동 품질 점검]',...issues].join('\n');}

 function findEmptyRect(w,h){const occupied=page().elements.filter(el=>!el.hidden);let best={x:70,y:210,score:Infinity};for(let y=65;y<=600-h;y+=42){for(let x=55;x<=1180-w;x+=40){const overlap=occupied.reduce((sum,e)=>sum+Math.max(0,Math.min(x+w,e.x+e.w)-Math.max(x,e.x))*Math.max(0,Math.min(y+h,e.y+e.h)-Math.max(y,e.y)),0);const score=overlap*10+y*.04+x*.01;if(score<best.score)best={x,y,score};}}return best;}
 function groupSelection(){const list=chosen();if(list.some(el=>el.locked))return toast('선택 중 잠긴 레이어가 있어 그룹 묶기를 취소했습니다. 먼저 잠금 해제하세요.');if(list.length<2){toast('잠금 해제된 요소 2개 이상을 선택하세요.');return;}const count=new Set(page().elements.map(e=>e.groupId).filter(Boolean)).size+1;mutate(()=>{const id=C.uid('group');list.forEach(el=>{el.groupId=id;el.groupLabel='그룹 '+count;});});}
 function ungroupSelection(){const groups=new Set(chosen().map(el=>el.groupId).filter(Boolean));if(!groups.size)return;if(page().elements.some(el=>groups.has(el.groupId)&&el.locked))return toast('잠긴 그룹 구성원 때문에 그룹 해제를 취소했습니다. 모두 잠금 해제하세요.');mutate(()=>page().elements.forEach(el=>{if(groups.has(el.groupId)){el.groupId=null;el.groupLabel='';}}));}
 function distribute(axis){const ids=chosen().filter(el=>!el.locked).map(el=>el.id);const probe=LAYERS.distribute(page().elements.map(C.clone),ids,axis);if(!probe.changed){toast(probe.reason==='Select at least three unlocked elements'?'잠금 해제된 요소를 3개 이상 선택하세요.':probe.reason==='Elements overlap; increase the group span before distributing'?'선택 요소의 전체 너비/높이가 부족해 겹칩니다. 간격 조정을 취소했습니다.':'간격을 조정할 위치 변경이 없습니다.');return;}mutate(()=>LAYERS.distribute(page().elements,ids,axis));}
 function setLock(id,value){mutate(()=>{const el=page().elements.find(e=>e.id===id);if(el)el.locked=value;});}
 function setHidden(id,value){mutate(()=>{const el=page().elements.find(e=>e.id===id);if(el)el.hidden=value;});}
 function moveSelectedToPage(targetIndex,remove=false){const i=Number(targetIndex);if(!Number.isInteger(i)||i<0||i>=project.pages.length||i===state.pageIndex)return toast('Choose another target page');const arr=chosen().filter(e=>!e.locked);if(!arr.length)return toast('잠금 해제된 요소를 선택하세요.');if(project.pages[i].elements.length+arr.length>120)return toast('대상 페이지가 120개 요소 제한을 초과합니다. 복사·이동을 취소했습니다.');
  mutate(()=>{const map=new Map();const copy=arr.map(e=>{const n=C.clone(e);n.id=C.uid();if(n.groupId){if(!map.has(n.groupId))map.set(n.groupId,C.uid('group'));n.groupId=map.get(n.groupId);}return n;});project.pages[i].elements.push(...copy);if(remove){const ids=new Set(arr.map(e=>e.id));page().elements=page().elements.filter(e=>!ids.has(e.id))}state.pageIndex=i;state.selectedId=copy[0].id;state.selectedIds=new Set(copy.map(e=>e.id));});}
 function applyMotionPreset(name){const presets={gentle:[C.makeEffect('fade',650,0),C.makeEffect('rise',700,0)],focus:[C.makeEffect('zoom',650,0),C.makeEffect('glow',450,100)],slide:[C.makeEffect('slide-left',700,0),C.makeEffect('fade',500,0)],emphasis:[C.makeEffect('rise',500,0),C.makeEffect('pulse',550,100),C.makeEffect('glow',450,0)],exit:[C.makeEffect('fade',500,0),C.makeEffect('exit',700,1700)]};if(!presets[name])return;mutate(()=>chosen().filter(e=>!e.locked).forEach(el=>el.effects=presets[name].map(e=>C.clone(e))));}
 const poseLimits={x:[-1000,1000,1],y:[-1000,1000,1],rotate:[-360,360,1],rotateX:[-85,85,1],rotateY:[-85,85,1],scale:[0.01,8,0.05],opacity:[0,1,0.05],blur:[0,60,0.5],brightness:[0,4,0.05]};
 const poseNames={x:'X 이동',y:'Y 이동',rotate:'Z 회전',rotateX:'X축 2.5D 회전',rotateY:'Y축 2.5D 회전',scale:'크기',opacity:'투명도',blur:'흐림',brightness:'밝기'};
 function poseInputs(effectIndex,side,pose,keyIndex=null){
  const id=side==='key'?`${effectIndex}:${keyIndex}`:String(effectIndex),attrs=side==='key'?`data-key-pose="${id}"`:`data-pose-effect="${id}" data-pose-side="${side}"`;
  return `<div class="motion-pose-grid">${Object.entries(poseLimits).map(([key,[lo,hi,step]])=>`<label class="pose-input">${poseNames[key]}<input class="inspect-input" type="number" ${attrs} data-pose-key="${key}" value="${Number(pose?.[key]??(key==='scale'||key==='opacity'||key==='brightness'?1:0)).toFixed(2)}" min="${lo}" max="${hi}" step="${step}"></label>`).join('')}</div>`;
 }
 function motionPoseEditor(fx,i){
  const fields=['start','end'].map(side=>`<details class="motion-pose-section" data-pose-section="${i}:${side}"><summary>${side==='start'?'시작':'종료'} 포즈 직접 편집 ${fx[side]?'· 사용자 지정':''}</summary>${poseInputs(i,side,fx[side]||E.defaultPose(fx.kind,side))}<div class="inspect-inline"><button type="button" class="inspect-action" data-pose-reset="${i}:${side}">기본 포즈 복원</button></div></details>`).join('');
  const keys=(fx.keyframes||[]).map((key,j)=>`<details class="motion-pose-section" data-pose-section="${i}:key:${j}"><summary>중간 키프레임 ${j+1} · ${Math.round(key.at*100)}%</summary>${poseInputs(i,'key',key,j)}</details>`).join('');
  return fields+keys;
 }
 function tableCurrentCell(el){const r=Math.max(0,Math.min((el?.data?.rows?.length||1)-1,state.tableCell.row)),c=Math.max(0,Math.min((el?.data?.rows?.[r]?.length||1)-1,state.tableCell.col));return {r,c};}
 function tableCellMarkup(el){
  const rows=el.data?.rows||[],cols=Math.max(1,...rows.map(row=>row.length)),cell=tableCurrentCell(el);
  const grid=`<div class="table-cell-editor" style="--table-cols:${cols}">${rows.map((row,r)=>Array.from({length:cols},(_,c)=>`<div class="table-cell-edit ${r===cell.r&&c===cell.c?'active':''}"><button data-table-select="${r}:${c}" title="${r+1}행 ${c+1}열 서식">${r+1}:${c+1}</button><input class="inspect-input" aria-label="${r+1}행 ${c+1}열 값" data-table-value="${r}:${c}" value="${C.escapeHTML(row[c]??'')}"></div>`).join('')).join('')}</div>`;
  const st=el.data?.cells?.[cell.r]?.[cell.c]||{},palette=v=>/^#[0-9a-f]{6}$/i.test(v||'')?v:'#ffffff';
  return grid+`<p class="caption-small">셀을 선택해 색상과 정렬을 지정하세요. Excel/스프레드시트의 여러 셀을 복사해 한 셀에 붙여넣을 수 있습니다.</p><div class="inspect-inline"><button class="inspect-action" data-table-op="add-row" ${rows.length>=24?'disabled':''}>+ 행</button><button class="inspect-action" data-table-op="remove-row" ${rows.length<=1?'disabled':''}>− 행</button><button class="inspect-action" data-table-op="add-col" ${cols>=10?'disabled':''}>+ 열</button><button class="inspect-action" data-table-op="remove-col" ${cols<=1?'disabled':''}>− 열</button></div><div class="inspect-row"><label class="inspect-field">셀 글자색<input class="inspect-input" type="color" data-table-style="color" value="${palette(st.color||'#263242')}"></label><label class="inspect-field">셀 배경<input class="inspect-input" type="color" data-table-style="background" value="${palette(st.background)}"></label></div><div class="inspect-row"><label class="inspect-field"><input type="checkbox" data-table-style="bold" ${st.bold?'checked':''}> 굵게</label><label class="inspect-field">정렬<select class="inspect-select" data-table-style="align">${['left','center','right'].map(v=>`<option value="${v}" ${st.align===v?'selected':''}>${({left:'왼쪽',center:'중앙',right:'오른쪽'})[v]}</option>`).join('')}</select></label></div>`;
 }
 function applyTableGrid(text,originRow,originCol){const el=selected();if(el?.type!=='table')return;
  let grid;try{grid=D.parseDelimited(text);}catch(e){toast('붙여넣기 취소: '+e.message);return;}if(!grid.length)return;
  if(grid.some(row=>row.some(value=>String(value).length>400))){toast('붙여넣기 취소: 표 셀은 최대 400글자입니다. 내용은 변경되지 않았습니다.');return;}
  if(originRow+grid.length>24||originCol+Math.max(...grid.map(r=>r.length))>10){toast('최대 24행 × 10열까지 붙여넣기 가능합니다.');return;}
  mutate(()=>{const e=selected();e.data.rows=e.data.rows||[];e.data.cells=e.data.cells||[];
   grid.forEach((row,r)=>row.forEach((value,c)=>{const rr=originRow+r,cc=originCol+c;while(e.data.rows.length<=rr)e.data.rows.push([]);while(e.data.rows[rr].length<=cc)e.data.rows[rr].push('');e.data.rows[rr][cc]=String(value);}));e.verified=false;
  });
 }
 function editTableStructure(op){const el=selected();if(el?.type!=='table')return;
  const rows=el.data.rows||[],cols=Math.max(1,...rows.map(r=>r.length));
  if(op==='add-row'&&rows.length>=24||op==='remove-row'&&rows.length<=1||op==='add-col'&&cols>=10||op==='remove-col'&&cols<=1)return;
  mutate(()=>{const e=selected();e.data.cells=e.data.cells||[];
   if(op==='add-row'){e.data.rows.push(Array(cols).fill(''));e.data.cells.push([]);}
   if(op==='remove-row'){e.data.rows.splice(-1);e.data.cells.splice(-1);}
   if(op==='add-col')e.data.rows.forEach(row=>row.push(''));
   if(op==='remove-col'){e.data.rows.forEach(row=>row.splice(-1));e.data.cells.forEach(row=>row.splice(-1));}
   e.verified=false;
  });
 }
 function renderAdvancedInspector(el){
  if(!el){const m=root.DocutBranding?.normalize(project.master)||project.master||{};const B=root.DocutBranding;const brandOptions=Object.entries(B?.POSITIONS||{}).map(([key,label])=>`<option value="${key}" ${key===m.logoPosition?'selected':''}>${label}</option>`).join('');const shapeOptions=Object.entries(B?.SHAPES||{}).map(([key,label])=>`<option value="${key}" ${key===m.logoShape?'selected':''}>${label}</option>`).join('');const fontOptions=(B?.FONTS||['Pretendard']).map(key=>`<option value="${C.escapeHTML(key)}" ${key===m.fontFamily?'selected':''}>${C.escapeHTML(key)}</option>`).join('');$('inspector').insertAdjacentHTML('beforeend',section('공통 로고·푸터',`<div class="inspect-field"><label>하단 부서 표기</label><input class="inspect-input" data-adv="master.footer" value="${C.escapeHTML(project.master?.footer||'')}"></div><div class="inspect-field"><label><input type="checkbox" data-adv="master.pageNumbers" ${project.master?.pageNumbers!==false?'checked':''}> 페이지 번호 표시</label></div><div class="inspect-inline"><button class="inspect-action" data-action="upload-logo">원형 로고 이미지 선택</button><button class="inspect-action" data-action="clear-logo">로고 삭제</button></div><div class="inspect-row"><div class="inspect-field"><label>로고 위치</label><select class="inspect-select" data-adv="master.logoPosition">${brandOptions}</select></div><div class="inspect-field"><label>로고 모양</label><select class="inspect-select" data-adv="master.logoShape">${shapeOptions}</select></div></div><div class="inspect-row">${numField("로고 크기 (px)","master.logoSize",m.logoSize,28,180)}${numField("여백 (px)","master.logoInset",m.logoInset,4,112)}</div><p class="caption-small">로고는 모든 페이지의 지정 위치에 적용됩니다. PNG·JPG 권장. 기본은 원형.</p>`));$('inspector').insertAdjacentHTML('beforeend',section('프로젝트 전체 글꼴',`<div class="inspect-field"><label>기본 글꼴</label><select class="inspect-select" data-adv="master.fontFamily">${fontOptions}</select></div><label class="inspect-field"><input type="checkbox" id="applyFontToLocked" ${state.includeLockedFont?'checked':''}> 잠긴 텍스트 레이어까지 포함 (명시적으로 선택)</label><button type="button" class="inspect-action premium-cta" data-action="apply-global-font">선택한 글꼴을 전체 텍스트 상자에 적용</button><p class="caption-small">기본은 잠긴 요소를 보호합니다. 잠금 포함 옵션을 선택하면 보호된 텍스트도 일괄 변경되며 Undo로 복원할 수 있습니다. 글꼴 미설치 시 폴백으로 표시됩니다.</p>`));return;}
  const n=chosen().length;const pageOptions=project.pages.map((p,i)=>`<option value="${i}" ${i===state.pageIndex?'disabled':''}>${i+1}. ${C.escapeHTML(p.tab)}</option>`).join('');
  const adv=`<div class="inspect-field"><label>자료 출처 · 문서명/URL</label><input data-adv="element.source" class="inspect-input" value="${C.escapeHTML(el.source||'')}" placeholder="기관·자료명·원본 주소"></div><div class="inspect-row"><div class="inspect-field"><label>근거 기준일</label><input type="date" data-adv="element.asOfDate" class="inspect-input" value="${C.escapeHTML(el.asOfDate||'')}"></div><div class="inspect-field"><label>표시 단위</label><input data-adv="element.unit" class="inspect-input" maxlength="40" placeholder="%, 원, 명, 건" value="${C.escapeHTML(el.unit||'')}"></div></div><div class="inspect-field"><label>근거 문구 · 산식 · 해석</label><textarea data-adv="element.evidence" class="inspect-textarea" rows="3" maxlength="1500" placeholder="수치의 의미, 분모, 기준 및 조건을 기록">${C.escapeHTML(el.evidence||'')}</textarea></div><div class="inspect-field"><label><input type="checkbox" data-adv="element.verified" ${el.verified?'checked':''}> 원문·수치·산식을 직접 검증함</label><small class="caption-small">내용·출처·기준일·단위 변경 시 검증 표시가 자동 해제됩니다.</small></div><div class="inspect-row"><label><input type="checkbox" data-adv="element.locked" ${el.locked?'checked':''}> 잠금</label><label><input type="checkbox" data-adv="element.hidden" ${el.hidden?'checked':''}> 숨김</label></div><div class="inspect-field"><label>선택 요소 이동·복사 (${n})</label><select class="inspect-select" id="transferTarget">${pageOptions}</select></div><div class="inspect-inline"><button class="inspect-action" data-action="copy-to-page">복사</button><button class="inspect-action" data-action="move-to-page">이동</button></div>`;
  $('inspector').insertAdjacentHTML('beforeend',section('자료·레이어',adv));
  const dataImport=['bar','line','donut','table','stat'].includes(el.type)?'<div class="inspect-inline"><button class="inspect-action" data-action="import-csv">CSV / TSV 셀 데이터 불러오기</button></div>':'';
  $('inspector').insertAdjacentHTML('beforeend',section('스프레드시트 데이터',dataImport));
  if(el.type==='table')$('inspector').insertAdjacentHTML('beforeend',section('표 셀 편집 · 24×10',tableCellMarkup(el)));
  const chart=['bar','line','donut'].includes(el.type)?`<div class="inspect-field"><label>차트 색상 테마</label><select class="inspect-select" data-adv="data.palette">${Object.keys(C.CHART_PALETTES||{}).map(x=>`<option value="${x}" ${el.data?.palette===x?'selected':''}>${x}</option>`).join('')}</select></div>`:'';
  const image=el.type==='image'?`<div class="inspect-row"><div class="inspect-field"><label>이미지 마스크</label><select class="inspect-select" data-adv="style.mask">${['none','rounded','circle','ellipse','diamond'].map(x=>`<option value="${x}" ${el.style.mask===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="inspect-field"><label>이미지 채움</label><select data-adv="style.imageFit" class="inspect-select">${['cover','contain','fill'].map(x=>`<option ${el.style.imageFit===x?'selected':''}>${x}</option>`).join('')}</select></div></div><div class="inspect-row">${numField('가로 초점 %','style.focusX',el.style.focusX??50,0,100,1)}${numField('세로 초점 %','style.focusY',el.style.focusY??50,0,100,1)}</div><div class="inspect-field">${numField('비파괴 확대 (Cover만)','style.cropZoom',el.style.cropZoom??1,1,4,.05)}</div><div class="inspect-inline"><button class="inspect-action" data-action="reset-image-crop">초점·확대 초기화</button></div><p class="caption-small">Contain은 원본 비율대로 프레임 안에 표시합니다. Fill은 비율이 변형될 수 있습니다. HTML 출력에 이미지 채움·초점 설정을 반영합니다.</p>`:'';
  const border=`<div class="inspect-row">${numField('테두리 굵기','style.borderWidth',el.style.borderWidth||0,0,16)}${colorField('테두리 색상','style.borderColor',el.style.borderColor||'#000000')}</div>`;
  $('inspector').insertAdjacentHTML('beforeend',section('고급 스타일',chart+image+border));
  const effects=(el.effects||[]).map((fx,i)=>`<div class="advanced-effect"><div class="inspect-field"><label>모션 ${i+1}: easing</label><input class="inspect-input" data-adv-effect="${i}" data-adv-fx="easing" value="${C.escapeHTML(fx.easing||'cubic-bezier(.22,1,.36,1)')}"></div><div class="inspect-inline"><button class="inspect-action" data-add-key="${i}" ${fx.keyframes?.length>=4?'disabled':''}>+ 중간 키프레임</button><button class="inspect-action" data-clear-keys="${i}">중간 포즈 초기화</button></div>${(fx.keyframes||[]).map((k,j)=>`<div class="inspect-row"><label>Key ${j+1}<input class="inspect-input" type="number" data-key-time="${i}:${j}" min="0" max="1" step="0.01" value="${k.at}"></label><button data-remove-key="${i}:${j}" class="inspect-action">Remove</button></div>`).join('')}${motionPoseEditor(fx,i)}${i===0?`<div class="bezier-wrap"><svg viewBox="0 0 240 150" class="bezier-graph" data-bezier-index="${i}" role="img" aria-label="Bezier curve"><path d="M20 130 L220 30" stroke="#39424e" fill="none"/><path id="bezierCurve" d="" stroke="#d9ab77" stroke-width="3" fill="none"/><line id="bezierGuide1" stroke="#8aa5bf"/><line id="bezierGuide2" stroke="#8aa5bf"/><circle class="bezier-handle" data-bezier-handle="0" cx="70" cy="40" r="8" tabindex="0" role="slider" aria-label="First control point"/><circle class="bezier-handle" data-bezier-handle="1" cx="170" cy="65" r="8" tabindex="0" role="slider" aria-label="Second control point"/></svg><label>Preview<input id="bezierPreview" type="range" min="0" max="1" step="0.01" value="0.5"></label><output id="bezierValue">0.5</output></div>`:''}</div>`).join('');
  $('inspector').insertAdjacentHTML('beforeend',section('모션 포즈·속도 곡선',`<div class="inspect-inline">${['gentle','focus','slide','emphasis','exit'].map(x=>`<button data-motion-preset="${x}" class="inspect-action">${x}</button>`).join('')}</div>${effects}`));
  if(CAT)$('inspector').insertAdjacentHTML('beforeend',section('효과 라이브러리 · 유형별',presetGallery(el.type)));
  refreshBezierGraph();
 }
 function refreshBezierGraph(){const svg=$('bezierCurve');const el=selected();if(!svg||!el?.effects?.length||!E)return;const arr=E.parseEasing(el.effects[0].easing),map=(x,y)=>[20+x*200,130-y*100];const p1=map(arr[0],arr[1]),p2=map(arr[2],arr[3]);svg.setAttribute('d',`M20 130 C${p1.join(' ')} ${p2.join(' ')} 220 30`);for(let i=0;i<2;i++){const p=i?p2:p1;const handle=qs(`[data-bezier-handle="${i}"]`,$('inspector'));if(handle){handle.setAttribute('cx',p[0]);handle.setAttribute('cy',p[1]);handle.setAttribute('aria-valuetext',arr[i*2].toFixed(2)+', '+arr[i*2+1].toFixed(2));}const line=$('bezierGuide'+(i+1));if(line){line.setAttribute('x1',i?220:20);line.setAttribute('y1',i?30:130);line.setAttribute('x2',p[0]);line.setAttribute('y2',p[1]);}}}
 function setAdvanced(path,value){const el=selected();const [scope,key]=path.split('.');if(scope==='master'){project.master=project.master||{};project.master[key]=value;return;}if(!el)return;const owner=scope==='element'?el:scope==='style'?el.style:scope==='data'?el.data:null;if(!owner)return;
  if(key==='verified'&&value===true){
   if(!el.source.trim()){toast('출처를 먼저 기록한 뒤 직접 검증하세요.');return;}
   if(el.type==='stat'){
    if(!el.data?.rows?.length){toast('통계차트의 원자료를 먼저 입력한 뒤 검증하세요.');return;}
    if(el.data.kind==='control'&&!['lower','center','upper'].every(name=>Number.isFinite(el.data?.limits?.[name]))){toast('관리도의 하한·중심선·상한을 모두 입력해야 검증할 수 있습니다.');return;}
   }
  }
  if(key==='asOfDate'&&value&&!C.validDate(value)){toast('올바른 기준일(YYYY-MM-DD)을 입력하세요.');return;}
  const next=typeof value==='string'?value.slice(0,key==='evidence'?1500:key==='source'?2000:key==='unit'?40:key==='alt'?300:6000):value;
  if(owner[key]===next)return;
  owner[key]=next;
  if((scope==='element'&&['source','asOfDate','unit','evidence'].includes(key))||(scope==='data'&&key==='unit'))el.verified=false;
 }
 function updateBezier(index,x,y){const el=selected();if(!el?.effects?.length)return;const arr=E.parseEasing(el.effects[0].easing);arr[index*2]=Math.round(Math.max(0,Math.min(1,x))*100)/100;arr[index*2+1]=Math.round(Math.max(-2,Math.min(2,y))*100)/100;el.effects[0].easing=`cubic-bezier(${arr.join(',')})`;const input=qs('[data-adv-effect="0"]',$('inspector'));if(input)input.value=el.effects[0].easing;refreshBezierGraph();persist();}
 function previewTime(ms){const time=Math.max(0,Math.min(timelineMax(),Number(ms)||0));stopAnimation();for(const el of page().elements){const dom=qsa('.element',$('slide')).find(n=>n.dataset.id===el.id);if(!dom||!E)continue;const pose=E.composeEffects(el.effects,time);const style=E.cssPose(pose);Object.assign(dom.style,style);M?.scrub(dom,el.effects,time);}if($('timelineTimeCurrent'))$('timelineTimeCurrent').textContent=(time/1000).toFixed(2)+'s';}
 function showImportStats(imported){const st=imported.stats||{},warnings=imported.warnings||[];if($('importSummary'))$('importSummary').textContent=`${imported.mode} / pages ${st.pages??imported.project.pages.length}, blocks ${st.blocks??'n/a'}, tables ${st.tables??'n/a'}, CSS rules ${st.cssRules??'n/a'}`;
 if($('importDetails'))$('importDetails').innerHTML=warnings.map(x=>`<p>${C.escapeHTML(x)}</p>`).join('')||'<p>DoCut native metadata restored.</p>';openDialog('importDialog');}
 function applyCSVPreview(){
  const reviewed=state.csvCandidate;
  if(!reviewed)return toast('CSV 미리보기 정보가 없습니다. 파일을 다시 선택하세요.');
  const current=page()?.elements.find(e=>e.id===reviewed.id);
  if(!current||page().id!==reviewed.pageId||JSON.stringify(current)!==reviewed.baseline){state.csvCandidate=null;closeDialog('csvReviewDialog');return toast('검토 중 원본 요소가 변경됐습니다. CSV를 다시 불러오세요.');}
  if(!preMutationBackup('before CSV/TSV import'))return;
  mutate(()=>{current.data=C.clone(reviewed.data);const originalSource=String(current.source||'').trim(),filename=String(reviewed.filename||'').trim();
   if(current.type!=='stat'||!originalSource)current.source=filename;
   else if(filename){const note='CSV/TSV 입력 파일: '+filename,prior=String(current.evidence||'');if(!prior.includes(note)&&prior.length+note.length+1<=1500)current.evidence=prior+(prior?'\n':'')+note;}
   current.verified=false;});
  state.csvCandidate=null;closeDialog('csvReviewDialog');toast('검토한 CSV/TSV 데이터를 반영했습니다. 수치·단위·기준일을 재확인하세요.');
 }
 function showCSVReview(file,rows,data,original){
  const visible=rows.slice(0,8).map((row,i)=>`<tr>${row.slice(0,10).map(v=>`<${i===0?'th':'td'}>${C.escapeHTML(v)}</${i===0?'th':'td'}>`).join('')}</tr>`).join('');
  $('csvReviewSummary').textContent=`${file.name} · ${original.type} · 원본 ${rows.length}행 × 최대 ${Math.max(...rows.map(r=>r.length))}열 · 적용 ${original.type==='table'||original.type==='stat'?data.rows.length+'행':data.values.length+'개 데이터'}`;
  $('csvReviewPreview').innerHTML=`<table aria-label="CSV 파일 상위 8행 미리보기"><tbody>${visible}</tbody></table>${rows.length>8?`<p>미리보기는 8행까지만 표시하며, 승인 시 위에 표시된 적용 데이터 전체를 반영합니다.</p>`:''}`;
  state.csvCandidate={id:original.id,pageId:page().id,baseline:JSON.stringify(original),filename:file.name.slice(0,200),data:C.clone(data)};
  openDialog('csvReviewDialog');
 }
 function applyImport(mode){const imported=state.importCandidate;if(!imported)return toast('가져오기 파일을 다시 선택하세요.');
  if(!state.importAnalysis||state.importAnalysis.requireAcknowledgement&&!$('importModeAcknowledge').checked)return toast('변환 손실·주의사항을 확인하고 직접 동의해야 합니다.');
  if(mode==='append'&&!state.importAnalysis.appendAllowed)return toast('현재 문서와 결합하면 50페이지를 초과합니다.');
  if(!state.importBaseline||state.importBaseline!==JSON.stringify(project)){state.importCandidate=null;state.importBaseline=null;closeDialog('importModeDialog');return toast('파일 검토 중 현재 문서가 변경되어 적용하지 않았습니다. 다시 검토하세요.');}
  let applied=false;
  try{const merged=mode==='append'?C.appendProject(project,imported.project):C.normalizeProject(imported.project);
   if(!preMutationBackup('before import'))return;
   mutate(()=>{project=merged;state.pageIndex=mode==='append'?Math.max(0,project.pages.length-imported.project.pages.length):0;state.selectedId=null;state.selectedIds.clear();});applied=true;
   closeDialog('importModeDialog');toast(`${imported.project.pages.length}페이지를 ${mode==='append'?'추가':'교체'}했습니다. 출처·수치와 변환 내용을 검토하세요.`);
  }catch(err){toast('가져오기 실패: '+err.message);}
  finally{if(applied)clearImportCandidate();}
 }
 function selectedAIRows(){return qsa('input[data-ai-page]:checked',$('aiDiffList')).map(el=>Number(el.dataset.aiPage));}
 function selectedAISettings(){return qsa('input[data-ai-setting]:checked',$('aiDiffList')).map(el=>el.dataset.aiSetting);}
 function selectedAIElements(){const selected={};qsa('input[data-ai-element]:checked',$('aiDiffList')).forEach(input=>{
  const i=Number(input.dataset.aiElementPage);if(!selected[i])selected[i]=[];selected[i].push(input.dataset.aiElement);
 });return selected;}
 function refreshAIApply(){
  const pages=new Set(selectedAIRows());
  qsa('input[data-ai-element]',$('aiDiffList')).forEach(input=>{const blocked=pages.has(Number(input.dataset.aiElementPage));if(blocked)input.checked=false;input.disabled=blocked;});
  // A risk acknowledgment applies to the exact set of changes reviewed. Changing
  // that set invalidates consent even if the newly selected change has the same risk.
  const signature=JSON.stringify({pages:[...pages].sort((a,b)=>a-b),elements:selectedAIElements(),settings:selectedAISettings().sort()});
  if(state.aiApprovalSignature!==signature){
   state.aiApprovalSignature=signature;$('aiRiskConfirm').checked=false;$('aiEvidenceApprove').checked=false;
  }
  const rows=[...pages].map(i=>state.aiCandidate?.rows[i]).filter(Boolean);
  const elements=selectedAIElements(),partial=Object.entries(elements).flatMap(([i,ids])=>state.aiCandidate?.rows[Number(i)]?.review.items.filter(item=>ids.includes(item.id))||[]);
  const settings=selectedAISettings(),hasSettings=settings.length;
  const settingsNeedNumbers=settings.some(key=>state.aiCandidate?.settingsReview?.find(s=>s.key===key)?.numericRisk);
  const needNumbers=rows.some(r=>r.review.numericRisks>0)||partial.some(e=>e.numericRisk)||settingsNeedNumbers,needEvidence=rows.some(r=>r.review.evidenceProposals>0)||partial.some(e=>e.provenanceFields.length>0);
  $('aiRiskControls').hidden=!needNumbers&&!needEvidence;
  $('aiNumericRisk').hidden=!needNumbers;
  $('aiEvidenceRisk').hidden=!needEvidence;
  const riskOK=!needNumbers||$('aiRiskConfirm').checked;
  const evidenceOK=!needEvidence||$('aiEvidenceApprove').checked;
  $('aiApply').disabled=!state.aiCandidate||(!rows.length&&!partial.length&&!hasSettings)||!riskOK||!evidenceOK;
  const issues=[];
  if(needNumbers&&!riskOK)issues.push('수치 변경을 직접 확인하고 승인하세요.');
  if(needEvidence&&!evidenceOK)issues.push('출처·근거 변경을 별도로 승인하세요.');
  $('aiRiskStatus').textContent=issues.join(' ')||((rows.length||partial.length||hasSettings)?`페이지 ${rows.length}개 · 개별 요소 ${partial.length}개 · 공통 설정 ${hasSettings?1:0}개만 적용합니다.`:'승인된 변경이 없습니다.');
 }
 function selectAI(checked){qsa('input[data-ai-page]:not(:disabled)',$('aiDiffList')).forEach(input=>input.checked=checked);if(!checked)qsa('input[data-ai-element]',$('aiDiffList')).forEach(input=>input.checked=false);refreshAIApply();}
 function invalidateAI(){state.aiCandidate=null;state.aiBaseline=null;state.aiApprovalSignature=null;$('aiApply').disabled=true;$('aiSelectionActions').hidden=true;$('aiRiskControls').hidden=true;$('aiRiskConfirm').checked=false;$('aiEvidenceApprove').checked=false;$('aiDiffSummary').textContent='입력 내용이 변경됐습니다. 다시 분석해 주세요.';$('aiDiffList').textContent='';}
 function aiDiffItemMarkup(row,item){
  const escape=C.escapeHTML,preview=text=>escape(String(text||'').slice(0,180));
  const notes=[...item.flags,...item.fields];
  const beforeAfter=item.before===item.after?`<span>${preview(item.after||item.before||'내용 없음')}</span>`:`<span class="ai-before-after"><del>${preview(item.before||'내용 없음')}</del><ins>${preview(item.after||'삭제')}</ins></span>`;
  const selectable=row.originIndex!=null&&row.proposalIndex!=null&&!row.idMismatch&&!item.locked&&(item.changed||item.provenanceFields.length);
  return `<li class="ai-detail-item"><div>${selectable?`<label class="ai-element-choice"><input type="checkbox" data-ai-element-page="${row.index}" data-ai-element="${escape(item.id)}"><strong>이 요소만 적용 · ${escape(item.kind)} · ${escape(item.type)}</strong></label>`:`<strong>${escape(item.kind)} · ${escape(item.type)} · ${escape(item.id)} (개별 승인 불가)</strong>`}${notes.length?`<small>${escape(notes.join(' · '))}</small>`:''}</div>${beforeAfter}${item.evidenceDiff.length?`<div class="ai-evidence-diff">${item.evidenceDiff.map(d=>`<small>${escape(d.field)}: <del>${escape(d.before||'없음')}</del> → <ins>${escape(d.after||'없음')}</ins></small>`).join('')}</div>`:''}${item.numericRisk?`<small class="ai-number-alert">수치: ${escape(item.numericBefore)} → ${escape(item.numericAfter)}</small>`:''}<button type="button" class="inspect-action ai-full-toggle" data-ai-full="${escape(item.id)}" data-ai-full-page="${row.index}" aria-expanded="false">전체 본문·원자료 확인</button><div class="ai-full-text" hidden></div></li>`;
 }
 function inspectAI(){try{
   if(!Q)throw Error('AI 변경 검토 모듈이 로드되지 않았습니다.');
   const raw=$('aiResponse').value;if(raw.length>8000000)throw Error('AI JSON은 최대 8MB까지 분석 가능합니다.');
   const payload=Q.parsePayload(raw),result=Q.analyze(project,payload.project);state.aiCandidate=result;state.aiBaseline=JSON.stringify(project);state.aiApprovalSignature=null;
   $('aiRiskConfirm').checked=false;$('aiEvidenceApprove').checked=false;
   const escape=C.escapeHTML;
   $('aiDiffSummary').textContent=`${payload.format}${payload.ignoredText?' · 코드 블록 밖 설명은 적용하지 않음':''} · 변경된 페이지 ${result.changedPages} / 검토 대상 ${result.rows.length} · 공통 설정 변경 ${result.settings.length}건${result.reorderWarnings?' · 제안된 순서 변경 '+result.reorderWarnings+'건은 자동 적용하지 않음':''}${result.ambiguousIds?' · 주의: 새 페이지 ID와 삭제된 페이지가 함께 발견됨 '+result.ambiguousIds+'건 (각각 별도 승인 필요)':''}. 기본 선택 0개. AI 검증 주장은 무시합니다.`;
   $('aiDiffList').innerHTML=`<p class="ai-safety-note">페이지 승인 전 각 요소의 변경 전·후를 펼쳐 확인하세요. 잠긴 요소는 변경/삭제되지 않으며, 잠긴 요소가 있는 페이지 삭제는 금지됩니다. 수치·출처 변경은 추가 동의가 필요합니다. 실제 출처의 진위는 사람이 확인해야 합니다.</p>`+
    (result.settingsReview.length?`<section class="ai-diff-page"><strong>프로젝트 설정별 승인</strong>${result.settingsReview.map(setting=>`<label class="ai-page-option ai-setting-option"><input type="checkbox" data-ai-setting="${escape(setting.key)}"><span><b>${escape(setting.key)} 변경</b><small class="ai-before-after"><del>${escape(setting.before||'없음')}</del><ins>${escape(setting.after||'없음')}</ins></small>${setting.numericRisk?'<small class="ai-number-alert">제목·공통 푸터 수치 변경은 별도 근거 확인이 필요합니다.</small>':''}</span></label>`).join('')}</section>`:'')+
    result.rows.map(row=>{
      const items=row.review.items,visible=items.slice(0,22).map(item=>aiDiffItemMarkup(row,item)).join('');
      const note=row.blockedDeletion?' · 잠긴 요소가 있는 페이지는 삭제 불가':'';
      return `<section class="ai-diff-page"><label class="ai-page-option ${row.changed?'':'ai-page-unchanged'}"><input type="checkbox" data-ai-page="${row.index}" ${row.changed&&!row.blockedDeletion&&items.length<=22?'':'disabled'}><span><b>${row.index+1}쪽 · ${escape(row.oldLabel)}${row.oldLabel!==row.newLabel?' → '+escape(row.newLabel):''}</b><small>${escape(row.details.join(' · ')||'변경 없음')}${escape(note)}</small>${items.length>22?'<small class="ai-number-alert">전체 페이지 승인은 숨겨진 변경 내역까지 모두 펼친 후 가능합니다.</small>':''}${row.review.metadataNumericRisk?'<small class="ai-number-alert">페이지 제목·요약 수치 변경도 별도 확인이 필요합니다.</small>':''}${row.stats.numericExamples.length?'<small class="ai-number-alert">수치 확인 · '+row.stats.numericExamples.map(escape).join(' / ')+'</small>':''}${row.idMismatch?'<small class="ai-id-alert">주의: 페이지 ID가 달라졌습니다. 변경 대상과 삭제 대상을 확인하세요.</small>':''}</span></label>`+(row.metadataDiff?.length?`<div class="ai-meta-diff"><strong>페이지 속성 변경 전·후</strong>${row.metadataDiff.map(d=>`<div><b>${escape(d.field)}</b><span class="ai-before-after"><del>${escape(d.before||'없음')}</del><ins>${escape(d.after||'없음')}</ins></span></div>`).join('')}</div>`:'')+(items.length?`<details class="ai-element-diff"><summary>요소 변경 내역 ${items.length}개 보기 (잠금 보호 ${row.review.lockedProtected} · 근거 제안 ${row.review.evidenceProposals})</summary><ul>${visible}</ul>${items.length>22?`<button type="button" class="inspect-action ai-more-button" data-ai-more="${row.index}">다음 22개 변경 보기 · ${items.length-22}개 남음</button>`:''}</details>`:'')+`</section>`;
    }).join('');
   $('aiSelectionActions').hidden=result.changedPages===0&&result.settings.length===0;refreshAIApply();
  }catch(e){state.aiCandidate=null;state.aiBaseline=null;$('aiApply').disabled=true;$('aiSelectionActions').hidden=true;$('aiRiskControls').hidden=true;$('aiDiffList').textContent='';$('aiDiffSummary').textContent='JSON 분석 실패: '+e.message;}}
 function handleAIDiffClick(event){
  const more=event.target.closest('button[data-ai-more]');
  if(more){
   const details=more.closest('details'),row=state.aiCandidate?.rows[Number(more.dataset.aiMore)];
   if(!details||!row)return;
   const start=Number(more.dataset.aiShown)||22;
   if(start<0||start>row.review.items.length)return;
   const next=row.review.items.slice(start,start+22);
   qs('ul',details).insertAdjacentHTML('beforeend',next.map(item=>aiDiffItemMarkup(row,item)).join(''));
   const remaining=Math.max(0,row.review.items.length-start-next.length);
   more.dataset.aiShown=String(start+next.length);
   if(remaining){more.textContent=`다음 22개 변경 보기 · ${remaining}개 남음`;}
   else{
    more.remove();
    const select=qs('input[data-ai-page]',details.closest('.ai-diff-page'));
    if(select&&row.changed&&!row.blockedDeletion)select.disabled=false;
   }
   return;
  }
  const button=event.target.closest('button[data-ai-full]');
  if(!button||!state.aiCandidate)return;
  const panel=button.nextElementSibling,row=state.aiCandidate.rows[Number(button.dataset.aiFullPage)];
  if(!panel||!row)return;
  if(!panel.hidden){panel.hidden=true;button.setAttribute('aria-expanded','false');return;}
  panel.replaceChildren();
  const oldPage=row.originIndex==null?null:JSON.parse(state.aiBaseline).pages[row.originIndex];
  const newPage=row.proposalIndex==null?null:state.aiCandidate.candidate.pages[row.proposalIndex];
  const id=button.dataset.aiFull;
  for(const [label,element] of [['현재 문서',oldPage?.elements.find(e=>e.id===id)],['AI 제안',newPage?.elements.find(e=>e.id===id)]]){
   const title=document.createElement('strong');title.textContent=label;panel.appendChild(title);
   const body=document.createElement('pre');
   if(!element){body.textContent='(요소 없음 / 삭제 제안)';}
   else{
    const evidence=['source','asOfDate','unit','evidence','notes'].map(k=>`${k}: ${String(element[k]??'')}`).join('\n');
    const data=element.type==='image'?`이미지 포함 여부: ${Boolean(element.data?.src)} (이미지 원본은 표시하지 않음)`:
     (element.data===undefined?'':JSON.stringify(element.data,null,2));
    body.textContent=`본문:\n${String(element.text??'')}\n\n출처·근거:\n${evidence}\n\n원자료:\n${data.length>20000?data.slice(0,20000)+'\n[원자료 미리보기 한도 초과 · 원본 JSON에서 추가 확인]':data}`;
   }
   panel.appendChild(body);
  }
  panel.hidden=false;button.setAttribute('aria-expanded','true');
 }
 function exportAIReview(){if(!state.aiCandidate||!Q)return toast('먼저 AI 제안을 분석해야 변경 기록을 저장할 수 있습니다.');
  X.downloadFile(X.filenameSafe(project.title)+'_AI_DIFF_REVIEW.txt',Q.formatReview(state.aiCandidate,selectedAIRows(),selectedAIElements(),selectedAISettings()),'text/plain;charset=utf-8');toast('AI 변경 검토 기록을 TXT로 저장했습니다.');
 }
 function applyAI(){if(!state.aiCandidate||!Q)return;
  if(state.aiBaseline!==JSON.stringify(project)){invalidateAI();toast('검토 중 원본 문서가 변경됐습니다. 다시 분석하세요.');return;}
  const approved=selectedAIRows(),elements=selectedAIElements(),settings=selectedAISettings(),includeSettings=settings.length>0;
  if(!approved.length&&!Object.values(elements).flat().length&&!includeSettings)return toast('적용할 페이지·요소나 공통 설정을 먼저 선택하세요.');
  const partial=Object.entries(elements).flatMap(([i,ids])=>state.aiCandidate.rows[+i].review.items.filter(item=>ids.includes(item.id)));
  const numericSelected=approved.some(i=>state.aiCandidate.rows[i]?.review.numericRisks>0)||partial.some(i=>i.numericRisk)||settings.some(key=>state.aiCandidate.settingsReview.some(s=>s.key===key&&s.numericRisk));
  const evidenceSelected=approved.some(i=>state.aiCandidate.rows[i]?.review.evidenceProposals>0)||partial.some(i=>i.provenanceFields.length>0);
  if(numericSelected&&!$('aiRiskConfirm').checked||evidenceSelected&&!$('aiEvidenceApprove').checked)return toast('수치·근거 변경의 별도 확인이 필요합니다.');
  try{const result=Q.apply(project,state.aiCandidate,approved,includeSettings,{approveNumeric:!numericSelected||$('aiRiskConfirm').checked,allowEvidenceChange:evidenceSelected&&$('aiEvidenceApprove').checked,elementSelection:elements,settingSelection:settings});
   if(!preMutationBackup('before approved AI proposal'))return;
   mutate(()=>{project=result.project;state.pageIndex=Math.min(state.pageIndex,project.pages.length-1);state.selectedId=null;state.selectedIds.clear();});
   state.aiCandidate=null;state.aiBaseline=null;state.aiApprovalSignature=null;closeDialog('aiDialog');toast(`${result.changedPages}개 페이지 변경을 반영했습니다. 숫자·원자료·출처를 직접 다시 검증하세요.`);
  }catch(err){toast('AI 변경 적용 실패: '+err.message);}
 }
 function shiftElementOrder(dragId,targetId){if(dragId===targetId)return;mutate(()=>{const a=page().elements,from=a.findIndex(x=>x.id===dragId),to=a.findIndex(x=>x.id===targetId);if(from<0||to<0)return;const [item]=a.splice(from,1);a.splice(to,0,item)});}
 function shiftPageOrder(from,to){if(from===to||from<0||to<0||from>=project.pages.length||to>=project.pages.length)return;mutate(()=>{const [item]=project.pages.splice(from,1);project.pages.splice(to,0,item);state.pageIndex=to;});}
 function contextPageInfo(id){
  const index=project.pages.findIndex(pg=>pg.id===id);if(index<0)return null;
  const pg=project.pages[index],group=project.groups?.find(g=>g.id===pg.groupId);
  return {id:pg.id,index,total:project.pages.length,title:pg.tab,elements:pg.elements.length,group:group?.title||'기본',transition:pg.transition||'fade',active:pg.id===page().id};
 }
 function contextPageAction(action,id,name){
  if(state.editingId)finishEditing();
  const index=project.pages.findIndex(pg=>pg.id===id);
  if(index<0)return toast('대상 페이지가 변경되었습니다. 메뉴를 다시 여세요.');
  const target=project.pages[index];
  if(state.preview){if(action==='select'){previewJump(index);return;}closePreview();}
  if(action==='select'){selectPage(index);return;}
  if(action==='properties'){selectPage(index);showElementPanel();qs('.rightbar').classList.add('show');return;}
  if(action==='layout'||action==='frame'){selectPage(index);onMainAction(action==='layout'?'box-layout':'frame-settings');return;}
  if(action==='rename'){
   const value=String(name||'').trim().slice(0,80);
   if(!value)return toast('페이지 이름을 입력하세요.');
   mutate(()=>{target.tab=value;target.customTab=true;});return;
  }
  if(action==='insert-after'||action==='duplicate'){
   if(project.pages.length>=50)return toast('최대 50페이지까지 지원합니다.');
   mutate(()=>{
    const pg=action==='duplicate'?LAYERS.duplicatePage(target,C.uid):C.createPage(index+1,project.pages.length+1);
    if(action==='insert-after'){
     pg.groupId=target.groupId||project.groups[0].id;
     const proposal=root.DocutSemanticLayout.plan(pg,'two',project.frame);
     if(proposal.ok)pg.elements=proposal.after.elements;
    }
    project.pages.splice(index+1,0,pg);state.pageIndex=index+1;state.selectedId=null;state.selectedIds.clear();
    if(action==='insert-after')C.relabelPages(project);
   });writePageHash();return;
  }
  if(action==='move-prev'||action==='move-next'){
   const next=index+(action==='move-prev'?-1:1);
   if(next<0||next>=project.pages.length)return;
   shiftPageOrder(index,next);writePageHash();return;
  }
  if(action==='delete'){
   if(project.pages.length<2)return toast('최소 한 페이지는 있어야 합니다.');
   if(!root.confirm('"'+target.tab+'" 페이지를 삭제하시겠습니까? 이 작업은 실행 취소할 수 있습니다.'))return;
   const activeId=page().id;
   mutate(()=>{project.pages.splice(index,1);const active=project.pages.findIndex(pg=>pg.id===activeId);state.pageIndex=active>=0?active:Math.min(index,project.pages.length-1);state.selectedId=null;state.selectedIds.clear();C.relabelPages(project);});
   writePageHash();
  }
 }

 function cancelEditing(){if(!state.editingId)return;
  if(state.editCheckpointed&&state.history.length){project=state.history.pop();persist();}
  state.editingId=null;state.editCheckpointed=false;state.editValidationError=null;state.richRange=null;$('richEditorToolbar').hidden=true;renderAll();
 }
 document.addEventListener('click',ev=>{
  const lock=ev.target.closest('[data-lock-id]');if(lock){ev.preventDefault();ev.stopPropagation();const el=page().elements.find(x=>x.id===lock.dataset.lockId);if(el){selectElement(el.id);setLock(el.id,!el.locked);}return;}
  const hide=ev.target.closest('[data-hide-id]');if(hide){const el=page().elements.find(x=>x.id===hide.dataset.hideId);if(el)setHidden(el.id,!el.hidden);return;}
  const templateChoice=ev.target.closest('[data-kit-choice]');if(templateChoice){state.kitSelection=templateChoice.dataset.kitChoice;state.kitPreviewIndex=0;renderKits();return;}
  const kitPage=ev.target.closest('[data-kit-page]');if(kitPage){state.kitPreviewIndex=Math.max(0,Math.min(5,Number(kitPage.dataset.kitPage)||0));renderKits();return;}
  const refGroup=ev.target.closest('[data-ref-group]');if(refGroup){const g=REF?.group(refGroup.dataset.refGroup);if(g)applyReference(g.operation,g.target);return;}
  const refImage=ev.target.closest('[data-ref-image]');if(refImage){const item=REF?.item(+refImage.dataset.refImage);if(item)applyReference(item.kind,item.target);return;}
  const layout=ev.target.closest('[data-layout]');if(layout){if($('preserveContent').checked)previewSemanticLayout(layout.dataset.layout);else mutate(()=>C.applyLayout(page(),layout.dataset.layout,false));return;}
  const visualPreset=ev.target.closest('[data-visual-preset]');if(visualPreset){const el=selected();if(!el||el.locked)return;try{const stack=CAT.createStack(visualPreset.dataset.visualPreset,el.type);mutate(()=>chosen().filter(e=>!e.locked).forEach(item=>{if(stack.every(fx=>CAT.supports(fx.kind,item.type)))item.effects=stack.map(C.clone);}));play($('slide'));toast('효과 적용: '+visualPreset.textContent.trim().slice(0,55));}catch(e){toast(e.message);}return;}
  const moveEffect=ev.target.closest('[data-move-effect]');if(moveEffect){const [i,dir]=moveEffect.dataset.moveEffect.split(':').map(Number);if(selected()?.effects?.[i]&&selected().effects[i+dir])mutate(()=>{const items=selected().effects;[items[i],items[i+dir]]=[items[i+dir],items[i]];});return;}
  const motionPreset=ev.target.closest('[data-motion-preset]');if(motionPreset){applyMotionPreset(motionPreset.dataset.motionPreset);return;}
  const addKey=ev.target.closest('[data-add-key]');if(addKey){const i=+addKey.dataset.addKey;if((selected()?.effects[i]?.keyframes||[]).length<4)mutate(()=>{const fx=selected().effects[i];fx.keyframes=fx.keyframes||[];fx.keyframes.push({at:0.5,...E.effectPose(fx,0.5)});});return;}
  const removeKey=ev.target.closest('[data-remove-key]');if(removeKey){const [i,j]=removeKey.dataset.removeKey.split(':').map(Number);if(selected())mutate(()=>selected().effects[i].keyframes.splice(j,1));return;}
  const clearKeys=ev.target.closest('[data-clear-keys]');if(clearKeys){const i=+clearKeys.dataset.clearKeys;if(selected())mutate(()=>selected().effects[i].keyframes=[]);return;}
  const resetPose=ev.target.closest('[data-pose-reset]');if(resetPose){const [i,side]=resetPose.dataset.poseReset.split(':');if(selected()?.effects[+i])mutate(()=>{selected().effects[+i][side]=null;});return;}
  const pickCell=ev.target.closest('[data-table-select]');if(pickCell){const [r,c]=pickCell.dataset.tableSelect.split(':').map(Number);state.tableCell={row:r,col:c};renderInspector();return;}
  const tableOp=ev.target.closest('[data-table-op]');if(tableOp){editTableStructure(tableOp.dataset.tableOp);return;}
  const restore=ev.target.closest('[data-restore-index]');if(restore){inspectBackup(+restore.dataset.restoreIndex);return;}
  const hit=ev.target.closest('[data-search-page],[data-issue-page]');if(hit){const pi=+(hit.dataset.searchPage??hit.dataset.issuePage);if(!Number.isInteger(pi)||pi<0||pi>=project.pages.length)return;const id=hit.dataset.searchId||hit.dataset.issueId||null,relatedId=hit.dataset.issueRelatedId||null;const validIds=new Set(project.pages[pi].elements.map(e=>e.id));state.pageIndex=pi;state.selectedId=validIds.has(id)?id:null;state.selectedIds=new Set([state.selectedId,relatedId].filter(value=>value&&validIds.has(value)));closeDialog('searchDialog');closeDialog('qualityDialog');renderAll();return;}
  const validationMode=ev.target.closest('[data-validation-mode]');if(validationMode){state.validationMode=validationMode.dataset.validationMode;state.validationVisible=80;state.validationProposal=null;renderValidation();return;}
  const validationFix=ev.target.closest('[data-validation-fix]');if(validationFix){applyValidationFix(+validationFix.dataset.validationFix);return;}
  const validationIgnore=ev.target.closest('[data-validation-ignore]');if(validationIgnore){const issue=state.validationIssues[+validationIgnore.dataset.validationIgnore];if(issue){state.validationIgnored.add(validationIgnoreKey(issue));renderValidation();}return;}
  const validationLocate=ev.target.closest('[data-validation-locate]');if(validationLocate){locateValidation(+validationLocate.dataset.validationLocate);return;}
  const validationQuality=ev.target.closest('[data-validation-quality]');if(validationQuality){locateValidationQuality(+validationQuality.dataset.validationQuality);return;}
  const reviewButton=ev.target.closest('[data-review-act]');if(reviewButton&&$('reviewDialog').contains(reviewButton)){ev.preventDefault();onReviewAction(reviewButton.dataset.reviewAct,reviewButton.dataset.reviewId);return;}
  const action=ev.target.closest('[data-action]');if(action){ev.preventDefault();onMainAction(action.dataset.action);return;}
  const groupTab=ev.target.closest('[data-primary-group]');if(groupTab){const index=project.pages.findIndex(p=>p.groupId===groupTab.dataset.primaryGroup);if(index>=0){if(state.preview)previewJump(index);else selectPage(index);}return;}
  const pageNode=ev.target.closest('[data-page-index]');if(pageNode){selectPage(+pageNode.dataset.pageIndex);return;}
  const collapse=ev.target.closest('[data-collapse-group]');if(collapse){const id=collapse.dataset.collapseGroup;if(state.collapsedGroups.has(id))state.collapsedGroups.delete(id);else state.collapsedGroups.add(id);renderLayerList();return;}
  const selectGroup=ev.target.closest('[data-select-group]');if(selectGroup){const parent=page().elements.find(el=>el.groupId===selectGroup.dataset.selectGroup);if(parent)selectElement(parent.id);return;}
  const layerNode=ev.target.closest('[data-layer-id]');if(layerNode){selectElement(layerNode.dataset.layerId,ev.shiftKey||ev.ctrlKey);return;}
  const track=ev.target.closest('[data-track-id]');if(track){selectElement(track.dataset.trackId);return;}
  const asset=ev.target.closest('[data-insert]');if(asset){addElement(asset.dataset.insert);return;}
  const theme=ev.target.closest('[data-theme]');if(theme){mutate(()=>project.theme=theme.dataset.theme);toast('디자인을 적용했습니다.');return;}
  const left=ev.target.closest('[data-left-tab]');if(left){toggleLeftTab(left.dataset.leftTab);return;}
  const pTab=ev.target.closest('[data-preview-index]');if(pTab){previewJump(+pTab.dataset.previewIndex);return;}
  const storyScene=ev.target.closest('[data-story-index]');if(storyScene){previewJump(+storyScene.dataset.storyIndex);return;}
  const remove=ev.target.closest('[data-remove-effect]');if(remove){const ix=+remove.dataset.removeEffect;if(selected())mutate(()=>selected().effects.splice(ix,1));return;}
  if(!ev.target.closest('.element,.rightbar')&&ev.target.closest('#slide')){selectElement(null);return;}
  if(!ev.target.closest('.dropdown-wrap')&&!$('exportMenu').hidden)hideExportMenu();
 });
 $('exportToggle').addEventListener('click',()=>{const menu=$('exportMenu');menu.hidden=!menu.hidden;$('exportToggle').setAttribute('aria-expanded',String(!menu.hidden));});
 $('inspector').addEventListener('change',ev=>{
  if(ev.target.hasAttribute('data-playback-seconds')){applyStoryDuration(ev.target.value);return;}
  if(ev.target.hasAttribute('data-caption-style')){const style=ev.target.value;if(!ST.STYLES.includes(style))return toast('지원하지 않는 캡션 스타일입니다.');if(page().captionStyle!==style)mutate(()=>{page().captionStyle=style;});return;}
  if(ev.target.matches('[data-stat-kind],[data-stat-rows],[data-stat-limit],[data-stat-reference],[data-stat-palette]')){
   const el=selected();if(el?.type!=='stat'||el.locked)return;
   try{const d=C.clone(el.data||{});if(ev.target.hasAttribute('data-stat-kind')){d.kind=ev.target.value;d.rows=[];d.limits={};d.referenceValue=null;}
    if(ev.target.hasAttribute('data-stat-rows'))d.rows=S.parseRows(d.kind,ev.target.value);
    if(ev.target.hasAttribute('data-stat-limit')){d.limits=d.limits||{};d.limits[ev.target.dataset.statLimit]=ev.target.value;}
    if(ev.target.hasAttribute('data-stat-reference'))d.referenceValue=ev.target.value;
    if(ev.target.hasAttribute('data-stat-palette'))d.palette=ev.target.value;
    const normalized=S.normalize(d);
    if(JSON.stringify(el.data)!==JSON.stringify(normalized))mutate(()=>{el.data=normalized;el.verified=false;if(el.text==='통계 차트 · 원자료 입력 필요'||S.KINDS.some(x=>x.name===el.text))el.text=S.lookup[normalized.kind].name;});
    else renderInspector();
   }catch(error){toast('원자료 적용 취소: '+error.message);renderInspector();}return;
  }
  if(ev.target.id==='applyFontToLocked'){state.includeLockedFont=ev.target.checked;return;}
  if(ev.target.dataset.adv){const path=ev.target.dataset.adv;if(selected()?.locked&&!['element.locked','element.hidden'].includes(path))return toast('잠긴 레이어를 먼저 잠금 해제하세요.');const value=ev.target.type==='checkbox'?ev.target.checked:ev.target.value;mutate(()=>setAdvanced(path,value));return;}
  if(ev.target.dataset.advEffect!=null){const i=+ev.target.dataset.advEffect;if(selected())mutate(()=>selected().effects[i].easing=ev.target.value);return;}
  if(ev.target.dataset.tableValue){const [r,c]=ev.target.dataset.tableValue.split(':').map(Number);if(ev.target.value.length>400){toast('셀 입력 취소: 400글자를 초과했습니다. 이전 값은 그대로입니다.');return;}if(selected()?.type==='table')mutate(()=>{const el=selected();el.data.rows[r][c]=ev.target.value;el.verified=false;});return;}
  if(ev.target.dataset.tableStyle){const key=ev.target.dataset.tableStyle,{r,c}=tableCurrentCell(selected()),value=ev.target.type==='checkbox'?ev.target.checked:ev.target.value;
   if(selected()?.type==='table')mutate(()=>{const e=selected();e.data.cells=e.data.cells||[];e.data.cells[r]=e.data.cells[r]||[];e.data.cells[r][c]={...e.data.cells[r][c],[key]:value};e.verified=false;});return;}
  const poseInput=ev.target;
  if(poseInput.dataset.poseKey){
   const key=poseInput.dataset.poseKey,limits=poseLimits[key];if(!limits)return;
   if(poseInput.dataset.poseEffect!=null){const i=+poseInput.dataset.poseEffect,side=poseInput.dataset.poseSide;const fx=selected()?.effects?.[i];if(!fx||!['start','end'].includes(side))return;
    mutate(()=>{fx[side]={...(fx[side]||E.defaultPose(fx.kind,side)),[key]:C.clamp(poseInput.value,limits[0],limits[1])};});return;}
   if(poseInput.dataset.keyPose){const [i,j]=poseInput.dataset.keyPose.split(':').map(Number),fx=selected()?.effects?.[i];if(!fx?.keyframes?.[j])return;
    mutate(()=>{fx.keyframes[j][key]=C.clamp(poseInput.value,limits[0],limits[1]);});return;}
  }
  if(ev.target.dataset.keyTime){const [i,j]=ev.target.dataset.keyTime.split(':').map(Number);if(selected())mutate(()=>{selected().effects[i].keyframes[j].at=C.clamp(ev.target.value,0,1);selected().effects[i].keyframes.sort((a,b)=>a.at-b.at)});return;}
  if(ev.target.id==='storyCaptionScript')return; // Keep Apply alive: textarea change fires before click.
  if(!ev.target.dataset.path&&!ev.target.hasAttribute('data-effect'))return;
  onInspectorField(ev,false);delete ev.target.dataset.modified;renderInspector();
 });
 $('inspector').addEventListener('paste',ev=>{const field=ev.target.closest('[data-table-value]');if(!field)return;const pasted=ev.clipboardData?.getData('text/plain')||'';if(!/[\t\r\n]/.test(pasted))return;ev.preventDefault();const [r,c]=field.dataset.tableValue.split(':').map(Number);applyTableGrid(pasted,r,c);});
 $('inspector').addEventListener('input',ev=>{if(ev.target.id==='bezierPreview'){const output=$('bezierValue');if(output&&selected()?.effects[0])output.textContent=E.easingY(+ev.target.value,selected().effects[0].easing).toFixed(3);return;}onInspectorField(ev,true);});
 $('searchInput').addEventListener('input',renderSearchResults);
 for(const [id,key,event] of [['reviewStatusFilter','reviewStatus','change'],['reviewPriorityFilter','reviewPriority','change'],['reviewQuery','reviewQuery','input']])$(id).addEventListener(event,e=>{state[key]=e.target.value;state.reviewVisible=35;renderReviews();});
 $('referenceSearch')?.addEventListener('input',ev=>filterReferences(ev.target.value));
 $('kitSearch').addEventListener('input',renderKits);$('kitCategory').addEventListener('change',renderKits);$('kitPalette').addEventListener('change',renderKits);
 $('kitImportApprove').addEventListener('change',ev=>{$('kitImportApply').disabled=!ev.target.checked||!state.kitImportCandidate;});
 $('kitFileInput').addEventListener('change',async ev=>{const file=ev.target.files?.[0];ev.target.value='';if(file)await previewKitImport(file);});
 $('reviewImportApprove').addEventListener('change',e=>{$('reviewImportApply').disabled=!e.target.checked||!state.reviewImportCandidate;});
 $('reviewImportInput').addEventListener('change',async ev=>{const f=ev.target.files?.[0];ev.target.value='';if(f)await onReviewImport(f);});
 $('reviewList').addEventListener('change',e=>{const id=e.target.dataset.reviewPriority;if(!id||!REV)return;try{mutate(()=>REV.setPriority(project,id,e.target.value));renderReviews();}catch(error){toast('우선순위 변경 취소: '+error.message);renderReviews();}});
 $('validationScope').addEventListener('change',e=>{state.validationScope=e.target.value;state.validationVisible=80;renderValidation();});
 $('validationLanguage').addEventListener('change',e=>{state.validationLanguage=e.target.value;state.validationVisible=80;renderValidation();});
 $('validationProposedText').addEventListener('input',()=>{state.validationProposal=null;$('validationDiff').hidden=true;$('validationApplyProposal').disabled=true;});
 $('qualitySeverityFilter').addEventListener('change',e=>{state.qualitySeverity=e.target.value;renderQuality();});
 $('qualityCategoryFilter').addEventListener('change',e=>{state.qualityCategory=e.target.value;renderQuality();});
 $('importPreviewPage').addEventListener('change',e=>{state.importPreviewIndex=+e.target.value;renderImportPreview();});
 $('importModeAcknowledge').addEventListener('change',refreshImportActions);
 for(const id of ['rewriteQuery','rewriteReplacement','rewriteScope','rewriteCase','rewriteFormatted'])$(id).addEventListener('input',invalidateRewrite);
 $('rewriteResults').addEventListener('change',refreshRewriteActions);
 $('aiResponse').addEventListener('input',invalidateAI);
 $('aiDiffList').addEventListener('change',ev=>{if(ev.target.matches('input[data-ai-page],input[data-ai-setting],input[data-ai-element]'))refreshAIApply();});
 $('aiDiffList').addEventListener('click',handleAIDiffClick);
 for(const id of ['aiRiskConfirm','aiEvidenceApprove'])$(id).addEventListener('change',refreshAIApply);
 $('storySeek').addEventListener('input',ev=>{if(!state.preview||!storyController)return;storyController.seek(Number(ev.target.value));});
 $('storyAllSeek').addEventListener('input',ev=>{if(!state.preview||!storyController)return;storyController.seekGlobal(Number(ev.target.value));});
 $('storySpeed').addEventListener('change',ev=>{if(!storyController)return;storyController.setSpeed(ev.target.value);const rate=Number(ev.target.value);state.animations.forEach(a=>{try{if(typeof a.playbackRate==='number')a.playbackRate=rate;else a.animations?.forEach(b=>b.playbackRate=rate);}catch(_){}});});
 $('storyLoop').addEventListener('change',ev=>storyController?.setLoop(ev.target.checked));
 $('storyCaptions').addEventListener('change',()=>refreshStoryState());
 $('timelineScrub').addEventListener('input',e=>{state.scrubTime=+e.target.value;previewTime(state.scrubTime);});

 let timelineDrag=null;
 $('timelineTracks').addEventListener('pointerdown',ev=>{const bar=ev.target.closest('[data-timeline-index]');if(!bar)return;const el=page().elements.find(e=>e.id===bar.dataset.timelineElement);if(!el||el.locked)return;const index=+bar.dataset.timelineIndex,fx=el.effects[index];if(!fx)return;const marker=ev.target.closest('[data-keyframe-timeline]');checkpoint();timelineDrag={id:el.id,index,pointerId:ev.pointerId,start:ev.clientX,mode:marker?'keyframe':ev.target.closest('.effect-duration-handle')?'duration':'delay',keyframe:marker?+marker.dataset.keyframeTimeline.split(':')[1]:null,originalDelay:fx.delay,originalDuration:fx.duration,originalAt:marker?fx.keyframes[+marker.dataset.keyframeTimeline.split(':')[1]].at:null,width:bar.parentElement.getBoundingClientRect().width,bar};bar.setPointerCapture(ev.pointerId);ev.preventDefault();});
 $('timelineTracks').addEventListener('pointermove',ev=>{if(!timelineDrag||ev.pointerId!==timelineDrag.pointerId)return;const t=timelineDrag,el=page().elements.find(e=>e.id===t.id);if(!el)return;const fx=el.effects[t.index],dt=(ev.clientX-t.start)/Math.max(1,t.width)*timelineMax();
  if(t.mode==='delay')fx.delay=Math.round(C.clamp(t.originalDelay+dt,0,8000)/25)*25;
  if(t.mode==='duration')fx.duration=Math.round(C.clamp(t.originalDuration+dt,100,4000)/25)*25;
  if(t.mode==='keyframe'&&fx.keyframes[t.keyframe])fx.keyframes[t.keyframe].at=Math.round(C.clamp(t.originalAt+dt/Math.max(100,fx.duration),0,1)*100)/100;
  if(t.mode==='duration')qs('.effect-duration-handle',t.bar)?.setAttribute('title',String(fx.duration));
  if(t.mode==='keyframe'){const mark=qs('[data-keyframe-timeline]',t.bar);if(mark)mark.style.left=fx.keyframes[t.keyframe].at*100+'%';}
  $('timelineTimeCurrent').textContent=(dt/1000).toFixed(2)+'s';
 });
 $('timelineTracks').addEventListener('pointerup',ev=>{if(!timelineDrag||timelineDrag.pointerId!==ev.pointerId)return;const t=timelineDrag;timelineDrag=null;const el=page().elements.find(e=>e.id===t.id);if(el?.effects[t.index]?.keyframes)el.effects[t.index].keyframes.sort((a,b)=>a.at-b.at);persist();renderTimeline();renderInspector();});
 $('timelineTracks').addEventListener('pointercancel',()=>{timelineDrag=null;renderTimeline();});

 function onImage(file){
  const active=selected(),pageId=page()?.id,blockId=active?.id,baseline=active?JSON.stringify(active):null;
  $('imageInput').value='';
  if(!active||active.type!=='image'||active.locked)return toast('잠금 해제된 이미지 요소를 먼저 선택하세요.');
  if(!file)return;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>1500000)return toast('PNG·JPG·WebP, 1.5MB 이하 파일만 선택하세요.');
  const reader=new FileReader();
  reader.onerror=()=>toast('로컬 이미지 읽기에 실패했습니다.');
  reader.onload=()=>{
   const data=String(reader.result||'');if(!/^data:image\/(png|jpeg|webp);base64,[\w+/=]+$/i.test(data))return toast('유효하지 않은 이미지 형식입니다.');
   const target=project.pages.find(p=>p.id===pageId)?.elements.find(e=>e.id===blockId);
   if(!target||page()?.id!==pageId||JSON.stringify(target)!==baseline)return toast('이미지 읽기 중 원본 요소나 페이지가 변경되어 덮어쓰지 않았습니다. 다시 선택하세요.');
   const dimensions=MEDIA.dimensions(data);
   if(!dimensions)return toast('이미지 크기 정보를 읽을 수 없습니다. 손상되었거나 지원하지 않는 파일입니다.');
   mutate(()=>{
    const originalSource=String(target.source||'').trim(),filename=file.name.slice(0,200);
    target.data={src:data,alt:filename,...dimensions};
    if(!originalSource)target.source=filename;
    else if(originalSource!==filename){
     const note='교체한 이미지 파일: '+filename;
     if(!String(target.notes||'').includes(note)&&String(target.notes||'').length+note.length+1<=1500)target.notes=(target.notes?target.notes+'\n':'')+note;
    }
    target.verified=false;
   });
   toast('로컬 이미지를 삽입했습니다. 기존 문서 출처는 보존하며 검증 표시는 해제했습니다.');
  };
  reader.readAsDataURL(file);
 }
 $('brandLogoInput').addEventListener('change',async ev=>{const f=ev.target.files?.[0];ev.target.value='';if(!f||!['image/png','image/jpeg','image/webp'].includes(f.type)||f.size>1500000)return;const previous=project.master?.logo||'';const reader=new FileReader();reader.onload=()=>{if((project.master?.logo||'')!==previous)return toast('로고 파일 읽기 중 기존 로고가 바뀌어 적용하지 않았습니다.');mutate(()=>{project.master.logo=String(reader.result)});};reader.onerror=()=>toast('로고 이미지를 읽지 못했습니다.');reader.readAsDataURL(f);});

 $('richEditorToolbar').addEventListener('pointerdown',e=>{if(e.target.closest('button'))e.preventDefault();});
 $('richEditorToolbar').addEventListener('click',e=>{const cmd=e.target.closest('[data-rich-command]');if(cmd&&state.editingId){const field=qsa('.element',$('slide')).find(n=>n.dataset.id===state.editingId)?.querySelector('.plain-text');field?.focus();R.format(cmd.dataset.richCommand);}});
 $('richComplete').addEventListener('click',()=>finishEditing());
 for(const [id,cmd] of [['richColor','foreColor'],['richHighlight','hiliteColor']])$(id).addEventListener('input',e=>{if(!state.editingId)return;const field=qsa('.element',$('slide')).find(n=>n.dataset.id===state.editingId)?.querySelector('.plain-text');if(!field)return;field.focus();if(state.richRange){const sel=root.getSelection();sel.removeAllRanges();sel.addRange(state.richRange);}R.format(cmd,e.target.value);const selection=root.getSelection();if(selection.rangeCount)state.richRange=selection.getRangeAt(0).cloneRange();});
 $('slide').addEventListener('pointerdown',beginPointer);
 $('inspector').addEventListener('pointerdown',ev=>{const handle=ev.target.closest('[data-bezier-handle]');if(!handle||!selected()?.effects.length)return;checkpoint();state.bezierDrag={index:+handle.dataset.bezierHandle,pointerId:ev.pointerId};handle.setPointerCapture(ev.pointerId);ev.preventDefault();});
 $('inspector').addEventListener('pointermove',ev=>{const drag=state.bezierDrag;if(!drag||drag.pointerId!==ev.pointerId)return;const svg=qs('.bezier-graph',$('inspector'));if(!svg)return;const rect=svg.getBoundingClientRect();const x=((ev.clientX-rect.left)*240/rect.width-20)/200,y=(130-(ev.clientY-rect.top)*150/rect.height)/100;updateBezier(drag.index,x,y);});
 $('inspector').addEventListener('pointerup',ev=>{if(state.bezierDrag?.pointerId===ev.pointerId){state.bezierDrag=null;persist();}});
 $('inspector').addEventListener('keydown',ev=>{const handle=ev.target.closest('[data-bezier-handle]');if(!handle||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(ev.key))return;ev.preventDefault();const i=+handle.dataset.bezierHandle,arr=E.parseEasing(selected().effects[0].easing),step=ev.shiftKey?.1:.01;checkpoint();updateBezier(i,arr[i*2]+(ev.key==='ArrowLeft'?-step:ev.key==='ArrowRight'?step:0),arr[i*2+1]+(ev.key==='ArrowDown'?-step:ev.key==='ArrowUp'?step:0));});
 $('pageList').addEventListener('dragstart',ev=>{const item=ev.target.closest('[data-page-index]');if(item)ev.dataTransfer.setData('text/plain','page:'+item.dataset.pageIndex);});
 $('pageList').addEventListener('dragover',ev=>{if(ev.target.closest('[data-page-index]'))ev.preventDefault();});
 $('pageList').addEventListener('drop',ev=>{const target=ev.target.closest('[data-page-index]');if(!target)return;ev.preventDefault();const payload=ev.dataTransfer.getData('text/plain');if(payload.startsWith('page:'))shiftPageOrder(+payload.slice(5),+target.dataset.pageIndex);});
 $('layerList').addEventListener('dragstart',ev=>{const item=ev.target.closest('[data-layer-id]');if(item)ev.dataTransfer.setData('text/plain','element:'+item.dataset.layerId);});
 $('layerList').addEventListener('dragover',ev=>{if(ev.target.closest('[data-layer-id]'))ev.preventDefault();});
 $('layerList').addEventListener('drop',ev=>{const target=ev.target.closest('[data-layer-id]');if(!target)return;ev.preventDefault();const payload=ev.dataTransfer.getData('text/plain');if(payload.startsWith('element:'))shiftElementOrder(payload.slice(8),target.dataset.layerId);});

 $('slide').addEventListener('pointermove',movePointer);
 $('slide').addEventListener('pointerup',endPointer);
 $('slide').addEventListener('pointercancel',endPointer);
 $('slide').addEventListener('dblclick',ev=>{const el=ev.target.closest('.element');if(el)startEdit(el.dataset.id);});
 $('slide').addEventListener('input',ev=>{if(!state.editingId||ev.isComposing)return;const field=ev.target.closest('[contenteditable=true]');if(field)captureLiveEditing(field);});
 $('slide').addEventListener('compositionend',ev=>{if(!state.editingId)return;const field=ev.target.closest('[contenteditable=true]');if(field)captureLiveEditing(field);});
 $('slide').addEventListener('paste',ev=>{const field=ev.target.closest('[contenteditable=true]');if(!field)return;ev.preventDefault();const text=(ev.clipboardData||root.clipboardData).getData('text/plain');if(text.length>12000){toast('붙여넣기 내용이 12000자를 넘어 원문 전체를 보호하기 위해 적용하지 않았습니다.');return;}document.execCommand('insertText',false,text);});
 $('zoomRange').addEventListener('input',e=>{state.zoom=+e.target.value;updateZoom();});
 $('projectName').addEventListener('change',e=>mutate(()=>project.title=String(e.target.value).slice(0,90),false));
 $('importInput').addEventListener('change',e=>onImport(e.target.files?.[0]));
 $('imageInput').addEventListener('change',e=>onImage(e.target.files?.[0]));
 $('csvInput').addEventListener('change',async e=>{const file=e.target.files?.[0];e.target.value='';state.csvCandidate=null;if(!file)return;if(file.size>1024*1024)return toast('CSV/TSV 파일은 1MB 이하만 지원합니다.');const original=selected(),id=original?.id,originalPageId=page()?.id,baseline=original?JSON.stringify(original):null;if(!id)return toast('표 또는 차트를 먼저 선택하세요.');try{const source=await file.text(),el=project.pages.find(p=>p.id===originalPageId)?.elements.find(x=>x.id===id);if(!el||JSON.stringify(el)!==baseline||page()?.id!==originalPageId)throw Error('파일 읽기 중 선택 요소가 변경되어 덮어쓰지 않았습니다.');const rows=D.parseDelimited(source),next=D.applyData(el,source);showCSVReview(file,rows,next,el);}catch(err){toast('데이터 가져오기 실패: '+err.message)}});
 document.addEventListener('keydown',handleKeys);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){storyController?.pause();stopAnimation();}});
 root.addEventListener('resize',()=>{if(root.innerWidth>640)closePages();updateZoom();if(state.preview)resizePreview();});
 if(root.ResizeObserver){new ResizeObserver(()=>{updateZoom();if(state.preview)resizePreview()}).observe($('stageArea'));}
 root.addEventListener('storage',ev=>{
  if(ev.key===KITS?.KEY){state.kitImportCandidate=null;if($('kitDialog')?.open){$('kitStorageStatus').textContent='다른 탭에서 템플릿이 변경됐습니다. [다시 읽기]를 눌러 새 상태를 확인하세요.';$('kitImportApply').disabled=true;}return;}
  if(ev.key!==P?.KEY&&ev.key!==P?.LEGACY)return;
  const newest=P.inspect(getStore(),C.normalizeProject);
  if(!P.sameToken(newest.token,state.saveToken))reportStorageProblem(newest.status.startsWith('corrupt')?'corrupt':'conflict','Other browser tab changed the saved checkpoint.');
 });
 let pageStrip=null;
 const boxLayoutPanel=root.DocutBoxLayoutPanel.mount({page:()=>C.clone(page()),project:()=>C.clone(project),frame:()=>F.normalize(project.frame),commit:proposal=>{if(proposal.mode==='new'&&project.pages.length>=50)throw Error('최대 50페이지입니다.');mutate(()=>{if(proposal.mode==='new'){const pg=C.clone(proposal.page);pg.groupId=page().groupId;project.pages.splice(state.pageIndex+1,0,pg);state.pageIndex++;}else{const id=page().id;project.pages[state.pageIndex]={...C.clone(proposal.page),id,groupId:page().groupId};}state.selectedId=null;state.selectedIds.clear();});writePageHash();toast('제목·소제목·본문·그림 계층 구조를 적용했습니다.');}});
 const contextTools=root.DocutContextTools.mount({
  activePageId:()=>page().id,isPreview:()=>state.preview,pageInfo:contextPageInfo,pageAction:contextPageAction,
  prepare:id=>{if(state.preview)closePreview();if(state.editingId&&state.editingId!==id)finishEditing();if(id)selectElement(id);else selectElement(null);const field=state.editingId?qsa('.element',$('slide')).find(e=>e.dataset.id===state.editingId)?.querySelector('.plain-text'):null,selection=root.getSelection(),range=field&&selection?.rangeCount&&field.contains(selection.getRangeAt(0).commonAncestorContainer)?selection.getRangeAt(0).cloneRange():null;return {element:selected()?C.clone(selected()):null,range,offsets:R.selectionOffsets(field,range),editingId:state.editingId,hasTextSelection:Boolean(range&&!range.collapsed)};},
  opened:()=>state.contextOpen=true,closed:()=>{state.contextOpen=false;},
  point:(x,y)=>{const r=$('slide').getBoundingClientRect();return {x:C.clamp((x-r.x)/state.scale,0,C.WIDTH-60),y:C.clamp((y-r.y)/state.scale,0,C.HEIGHT-40)};},
  style:(ctx,styles)=>{try{const el=page().elements.find(e=>e.id===ctx.element?.id);if(!el||el.locked)return toast('잠긴 요소를 먼저 해제하세요.');if(styles.font&&!root.DocutBranding.FONTS.includes(styles.font))throw Error('지원하지 않는 글꼴입니다.');if(styles.size!==undefined&&(!Number.isFinite(styles.size)||styles.size<10||styles.size>100))throw Error('글자 크기는 10–100px입니다.');if(styles.color&&!/^#[a-f0-9]{6}$/i.test(styles.color))throw Error('글자색을 확인하세요.');if(styles.align){if(!['left','center','right'].includes(styles.align))throw Error('정렬을 확인하세요.');if(state.editingId)finishEditing();mutate(()=>el.style.align=styles.align);return;}
   if(ctx.hasTextSelection&&ctx.editingId===state.editingId){const field=qsa('.element',$('slide')).find(e=>e.dataset.id===ctx.editingId)?.querySelector('.plain-text');if(field&&ctx.range){ctx.range=R.rangeFromOffsets(field,ctx.offsets)||ctx.range;field.focus();const selection=root.getSelection();selection.removeAllRanges();selection.addRange(ctx.range);if(styles.font||styles.size)R.applySelection(field,ctx.range,styles);if(styles.color)R.format('foreColor',styles.color);if(styles.align)el.style.align=styles.align;if(!captureLiveEditing(field))return;if(selection.rangeCount)ctx.range=selection.getRangeAt(0).cloneRange();renderInspector();return;}}
   if(state.editingId)finishEditing();mutate(()=>{for(const item of chosen().filter(e=>!e.locked))Object.assign(item.style,styles);});
  }catch(e){toast(e.message);}},
  format:(ctx,command)=>{if(ctx.hasTextSelection&&ctx.editingId===state.editingId){const field=qsa('.element',$('slide')).find(e=>e.dataset.id===ctx.editingId)?.querySelector('.plain-text');if(!field||!ctx.range)return;ctx.range=R.rangeFromOffsets(field,ctx.offsets)||ctx.range;field.focus();const selection=root.getSelection();selection.removeAllRanges();selection.addRange(ctx.range);R.format(command);captureLiveEditing(field);if(selection.rangeCount)ctx.range=selection.getRangeAt(0).cloneRange();}else{const el=selected();if(!el||el.locked)return;if(command==='bold')mutate(()=>el.style.weight=el.style.weight>=700?400:700);else toast('부분 기울임·밑줄은 글자를 더블클릭한 뒤 선택해 적용하세요.');}},
  action:action=>{if(state.editingId)finishEditing();onMainAction(action);},lock:(id,locked)=>mutate(()=>{for(const el of chosen())el.locked=locked;}),
  insert:(kind,point)=>{if(state.editingId)finishEditing();if(page().elements.length>=120)return toast('페이지당 요소 120개 제한입니다.');mutate(()=>{const b=C.makeBlock(kind,point.x,point.y);b.w=Math.min(b.w,C.WIDTH-point.x);b.h=Math.min(b.h,C.HEIGHT-point.y);page().elements.push(b);state.selectedId=b.id;state.selectedIds=new Set([b.id]);});if(kind==='image')$('imageInput').click();}
 });
 // Both page selectors use the same floating, page-aware menu as the blank canvas.
 $('pageList').addEventListener('contextmenu',ev=>{
  const item=ev.target.closest('[data-page-index]');if(!item)return;
  const pg=project.pages[Number(item.dataset.pageIndex)];if(pg)contextTools.openPage(ev,pg.id);
 });
 $('pageList').addEventListener('keydown',ev=>{
  if(ev.key!=='ContextMenu'&&!(ev.shiftKey&&ev.key==='F10'))return;
  const item=ev.target.closest('[data-page-index]'),pg=item&&project.pages[Number(item.dataset.pageIndex)];if(!pg)return;
  const rect=item.getBoundingClientRect();
  contextTools.openPage({clientX:rect.left+20,clientY:rect.top+20,shiftKey:false,preventDefault:()=>ev.preventDefault(),stopPropagation:()=>ev.stopPropagation()},pg.id);
 });
 $('previewTabs').addEventListener('contextmenu',ev=>{
  const item=ev.target.closest('[data-preview-index]'),pg=item&&project.pages[Number(item.dataset.previewIndex)];
  if(pg)contextTools.openPage(ev,pg.id);
 });
 const quickPanel=root.DocutStructuredInput.mount({getProject:()=>C.clone(project),commit:incoming=>{const combined=C.appendProject(project,incoming);if(combined.sourceDocuments.length>10)throw Error('원문 스냅샷은 10개까지 저장할 수 있습니다.');const next=C.normalizeProject(combined);mutate(()=>{const first=project.pages.length;project=next;state.pageIndex=first;state.selectedId=null;state.selectedIds.clear();});writePageHash();toast('원문을 보존하고 새 페이지를 추가했습니다.');}});
 const scenePanel=root.DocutScenePanel.mount({getPage:()=>C.clone(page()),selected:()=>selected()?C.clone(selected()):null,connector:(spec,id)=>{if(id&&page().elements.find(e=>e.id===id)?.locked)throw Error('잠긴 화살표입니다.');if(!id&&page().elements.length>=120)throw Error('페이지 요소 한도입니다.');mutate(()=>{if(id)page().elements.find(e=>e.id===id).connector=spec;else{const el=root.DocutScene.create(spec.sourceId,spec.targetId,spec);page().elements.push(el);state.selectedId=el.id;state.selectedIds=new Set([el.id]);}root.DocutScene.refresh(page());});toast('객체 ID에 화살표를 연결했습니다.');},pose:(id,pose)=>{const el=page().elements.find(e=>e.id===id);if(!el||el.locked)throw Error('선택 요소가 없거나 잠겨 있습니다.');mutate(()=>el.scene=pose);}});
 const dataPanel=root.DocutDataPanel.mount({getProject:()=>C.clone(project),getSelected:()=>selected()?C.clone(selected()):null,commit:proposal=>{const replacing=proposal.replaceId?page().elements.find(e=>e.id===proposal.replaceId):null;if(proposal.replaceId&&(!replacing||replacing.locked))throw Error('연결할 객체가 없거나 잠겨 있습니다.');if(!proposal.replaceId&&page().elements.length>=120)throw Error('페이지당 요소 120개 제한입니다.');mutate(()=>{project.datasets??=[];const index=project.datasets.findIndex(d=>d.id===proposal.dataset.id);if(index<0)project.datasets.push(C.clone(proposal.dataset));else project.datasets[index]=C.clone(proposal.dataset);if(proposal.replaceId){const index=page().elements.findIndex(e=>e.id===proposal.replaceId);page().elements[index]=C.clone(proposal.block);}else page().elements.push(C.clone(proposal.block));state.selectedId=proposal.block.id;state.selectedIds=new Set([proposal.block.id]);});toast('원자료 연결 시각화를 삽입했습니다.');}});
 const projectPanel=root.DocutProjectPanel.mount({getProject:()=>C.clone(project),pageIndex:()=>state.pageIndex,commit:next=>{mutate(()=>{project=next;state.selectedId=null;state.selectedIds.clear();});writePageHash();toast('프레임·탭 설정을 적용했습니다.');}});
 root.addEventListener('hashchange',()=>{const index=F.indexForHash(project,root.location.hash);if(index!==null&&index!==state.pageIndex){if(state.preview)previewJump(index);else selectPage(index);}});
 const initialPage=F.indexForHash(project,root.location.hash);if(initialPage!==null)state.pageIndex=initialPage;
 const workspaceDock=root.DocutWorkspaceDock.attach({storage:getStore(),changed:()=>{updateZoom();if(state.preview)resizePreview();}});
 pageStrip=root.DocutPageStrip.mount({pages:()=>project.pages,activeId:()=>page().id,frame:()=>F.normalize(project.frame),select:id=>{const i=project.pages.findIndex(p=>p.id===id);if(i>=0)selectPage(i);},reorder:shiftPageOrder,openContext:(ev,id)=>contextTools.openPage(ev,id),resetPanels:()=>workspaceDock.reset()});
 const paneLayout=root.DocutPaneLayout?.attach(qs('.workspace'),{storage:getStore(),changed:()=>updateZoom()});
 root.addEventListener('beforeunload',()=>{if(state.editingId)finishEditing();});
 root.DocutInteractionFX?.install(document);
 $('projectName').value=project.title;
 renderAll();updateSaveUI();
 // Only first-run documents and valid legacy documents need an initial checkpoint.
 // Do not increment a restored revision merely by opening a new browser tab.
 if(['empty','legacy'].includes(initialSaved.status))persist();
 if(['corrupt','corrupt-legacy'].includes(initialSaved.status))toast('기존 자동저장에 이상이 있어 원본을 보호했습니다.');
 if(root.DocutUBSVectorEdit)root.DocutUBSVectorEdit.instance=root.DocutUBSVectorEdit.mount({getPage:()=>page(),commit:mutate,render:renderSlide});
 root.DocutApp={paneLayout,workspaceDock,getProject:()=>C.clone(project),selectPage,addElement,loadProject(p){checkpoint();project=C.normalizeProject(p);state.pageIndex=0;state.selectedId=null;state.selectedIds.clear();persist();renderAll();},getState:()=>({...state,selectedIds:[...state.selectedIds],history:state.history.length,future:state.future.length,story:storyController?.getState()||null}),audit:()=>C.auditProject(project),quality:()=>QUALITY?.analyze(project),review:()=>REV?.summary(project),search:q=>C.searchProject(project,q)};
})(typeof globalThis!=='undefined'?globalThis:this);
