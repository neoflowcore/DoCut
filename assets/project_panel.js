(function(root){
'use strict';
const C=root.DocutCore,F=root.DocutFrame;
function mount(api){
 const esc=C.escapeHTML;let proposal=null,baseline=null;const get=id=>document.getElementById(id);
 let dialog=document.createElement('dialog');dialog.id='projectFrameDialog';dialog.className='recovery-dialog frame-dialog';document.body.append(dialog);
 function open(){const p=api.getProject(),f=F.normalize(p.frame);baseline=JSON.stringify(p);proposal=null;
  dialog.innerHTML='<div class="recovery-title"><strong>출력 비율·상위 탭</strong><button type="button" id="frameClose" aria-label="프레임 설정 닫기">✕</button></div><p>내용과 원자료를 보존합니다. 비율 변경은 모든 페이지를 분석한 뒤 한 번에 적용합니다.</p><label class="field-label" for="framePreset">프레임</label><select id="framePreset" class="inspect-select">'+Object.entries(F.PRESETS).map(([id,v])=>'<option value="'+id+'" '+(f.preset===id?'selected':'')+'>'+v.label+'</option>').join('')+'<option value="custom" '+(f.preset==='custom'?'selected':'')+'>사용자 지정</option></select><div class="inspect-row"><label>가로 px<input id="frameWidth" class="inspect-input" type="number" min="320" max="2400" value="'+f.width+'"></label><label>세로 px<input id="frameHeight" class="inspect-input" type="number" min="320" max="2400" value="'+f.height+'"></label></div><h3>상위 탭</h3><div id="frameGroups">'+p.groups.map(g=>groupRow(g,p)).join('')+'</div><button id="groupAdd" type="button" class="inspect-action">+ 상위 탭 추가</button><label class="field-label" for="pageGroupMove">현재 페이지 소속</label><select id="pageGroupMove" class="inspect-select"></select><p id="frameReview" class="frame-review" role="status">검토를 누르면 변경·유지 항목을 확인할 수 있습니다.</p><div class="inspect-inline"><button id="frameReviewButton" type="button" class="inspect-action">변경 검토</button><button id="frameApply" type="button" class="primary-btn" disabled>검토한 설정 적용</button></div>';
  function invalidate(){proposal=null;get('frameApply').disabled=true;get('frameReview').textContent='입력이 바뀌었습니다. 변경 검토를 다시 실행하세요.';}
  get('framePreset').onchange=()=>{const preset=F.PRESETS[get('framePreset').value];if(preset){get('frameWidth').value=preset.width;get('frameHeight').value=preset.height;}invalidate();};
  ['frameWidth','frameHeight'].forEach(id=>get(id).oninput=()=>{get('framePreset').value='custom';invalidate();});
  get('frameGroups').oninput=()=>{refreshGroupChoices(p.pages[api.pageIndex()].groupId);invalidate();};
  get('frameGroups').onclick=ev=>{const button=ev.target.closest('[data-group-remove]');if(!button)return;const id=button.dataset.groupRemove;if(p.pages.some(pg=>pg.groupId===id)){get('frameReview').textContent='페이지가 속한 탭은 삭제할 수 없습니다. 먼저 페이지 소속을 옮기세요.';return;}button.closest('.frame-group-row').remove();invalidate();refreshGroupChoices(p.pages[api.pageIndex()].groupId);};
  get('groupAdd').onclick=()=>{if(get('frameGroups').children.length>=12)return;get('frameGroups').insertAdjacentHTML('beforeend',groupRow({id:C.uid('section'),title:'새 주제'},p));invalidate();refreshGroupChoices(p.pages[api.pageIndex()].groupId);};
  get('pageGroupMove').onchange=invalidate;
  get('frameClose').onclick=()=>dialog.close();
  get('frameReviewButton').onclick=()=>{try{if(JSON.stringify(api.getProject())!==baseline)throw Error('문서가 변경되었습니다. 설정창을 다시 여세요.');
   const frame=F.normalize({preset:get('framePreset').value,width:Number(get('frameWidth').value),height:Number(get('frameHeight').value)});
   const selectedGroups=F.groups([...get('frameGroups').children].map(row=>({id:row.dataset.groupId,title:row.querySelector('input').value})));
   const original=api.getProject(),changed=frame.width!==original.frame.width||frame.height!==original.frame.height;
   proposal=changed?F.changePlan(original,frame):{ok:true,baseline:original,project:C.clone(original),warnings:[],frame};proposal.project.frame=frame;
   if(proposal.ok){proposal.project.groups=selectedGroups;proposal.project.pages[api.pageIndex()].groupId=get('pageGroupMove').value;C.normalizeProject(proposal.project);}
   get('frameReview').textContent=proposal.ok?frame.label+' / '+frame.width+' × '+frame.height+'px · '+original.pages.length+'페이지 · '+selectedGroups.length+'개 상위 탭. '+(changed?'페이지별 배치 검토 통과.':'위치·크기 유지.')+' 원문·수치·출처 유지.':proposal.warnings.map(w=>w.title+': '+w.issues[0].message).join('\n');get('frameApply').disabled=!proposal.ok;
  }catch(e){proposal=null;get('frameApply').disabled=true;get('frameReview').textContent=e.message;}};
  get('frameApply').onclick=()=>{try{const next=F.accept(api.getProject(),proposal);api.commit(next);dialog.close();}catch(e){get('frameReview').textContent=e.message;get('frameApply').disabled=true;}};
  refreshGroupChoices(p.pages[api.pageIndex()].groupId);dialog.showModal();
 }
 function groupRow(g,p){return '<div class="frame-group-row" data-group-id="'+esc(g.id)+'"><input class="inspect-input" maxlength="80" aria-label="상위 탭 제목" value="'+esc(g.title)+'"><button type="button" class="inspect-action" data-group-remove="'+esc(g.id)+'" '+(p.pages.some(pg=>pg.groupId===g.id)?'disabled':'')+'>삭제</button></div>';}
 function refreshGroupChoices(selected){const current=get('pageGroupMove').value||selected;get('pageGroupMove').innerHTML=[...get('frameGroups').children].map(row=>'<option value="'+esc(row.dataset.groupId)+'">'+esc(row.querySelector('input').value)+'</option>').join('');get('pageGroupMove').value=current;}
 return {open};
}
root.DocutProjectPanel={mount};
})(typeof globalThis!=='undefined'?globalThis:this);
