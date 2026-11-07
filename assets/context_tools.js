(function(root){
'use strict';
const C=root.DocutCore;
const esc=C.escapeHTML;

// Page data is resolved by stable id, not the page index that can change after reordering.
function pageMarkup(info, allowInserts){
 const title=esc(info.title), label='페이지 '+(info.index+1)+' · '+title;
 const disabled=condition=>condition?' disabled aria-disabled="true"':'';
 const btn=(action,text,condition=false,extra='')=>'<button type="button" data-context-page-action="'+action+'"'+disabled(condition)+' '+extra+'>'+text+'</button>';
 return '<div class="context-drag-handle"><strong>▤ '+label+'</strong><button type="button" data-context-action="close" aria-label="우클릭 도구 닫기">✕</button></div>'+
  '<div class="context-body"><div class="context-page-summary" role="group" aria-label="페이지 정보"><strong>'+title+'</strong><span>'+(info.index+1)+' / '+info.total+' 페이지 · 객체 '+info.elements+'개</span><span>그룹: '+esc(info.group||'기본')+' · 전환: '+esc(info.transition||'fade')+'</span></div>'+
  '<div class="context-page-actions" role="group" aria-label="페이지 작업">'+
    btn('select','↗ 이 페이지로 이동',info.active)+btn('properties','⚙ 페이지 속성·배경')+
    btn('rename','✎ 페이지 이름 변경')+btn('duplicate','⧉ 페이지 복제',info.total>=50)+
    btn('insert-after','＋ 다음 위치에 페이지 추가',info.total>=50)+btn('move-prev','← 왼쪽으로 이동',info.index===0)+
    btn('move-next','오른쪽으로 이동 →',info.index>=info.total-1)+btn('layout','▦ 박스 구성·레퍼런스')+
    btn('frame','▣ 비율·페이지 탭')+btn('delete','⌫ 페이지 삭제',info.total<2,'class="context-page-delete"')+
  '</div><div class="context-page-rename" hidden><label for="contextPageTitle">페이지 이름 (최대 80자)</label><input id="contextPageTitle" type="text" maxlength="80" value="'+title+'" autocomplete="off" aria-label="변경할 페이지 이름"><div class="context-actions">'+btn('save-rename','저장')+btn('cancel-rename','취소')+'</div></div>'+
  (allowInserts?'<div class="context-inserts"><span>현재 페이지에 객체 삽입 · 클릭하거나 드래그</span>'+[['text','¶ 텍스트'],['card','▣ 카드'],['image','▧ 그림'],['table','▦ 표']].map(([kind,name])=>'<button type="button" draggable="true" data-context-insert="'+kind+'">'+name+'</button>').join('')+'</div>':'')+
  '<p class="context-help">상단 손잡이로 이동 · Esc 닫기 · Shift+우클릭은 브라우저 메뉴</p></div>';
}

function mount(api){
 const menu=document.createElement('div');
 menu.id='canvasContextTools';menu.className='canvas-context-tools';menu.hidden=true;
 menu.setAttribute('role','dialog');menu.setAttribute('aria-modal','false');
 document.body.append(menu);
 let context=null,pageContextId=null,drag=null,lastPoint={x:100,y:180};
 function close(){if(menu.hidden)return;menu.hidden=true;pageContextId=null;context=null;api.closed?.();}
 function place(x,y){menu.hidden=false;const r=menu.getBoundingClientRect();menu.style.left=Math.max(6,Math.min(root.innerWidth-r.width-6,x))+'px';menu.style.top=Math.max(6,Math.min(root.innerHeight-r.height-6,y))+'px';}
 function openPage(ev,id,options={}){
  // Leave the browser menu available intentionally with Shift+right-click.
  if(ev.shiftKey)return;
  const info=api.pageInfo?.(id);
  if(!info)return;
  ev.preventDefault();ev.stopPropagation();
  context=null;pageContextId=info.id;lastPoint=api.point(ev.clientX,ev.clientY);
  menu.setAttribute('aria-label','페이지 '+(info.index+1)+' 작업');
  menu.innerHTML=pageMarkup(info,Boolean(options.allowInserts));
  api.opened?.();place(ev.clientX,ev.clientY);
 }
 function open(ev){
  if(ev.shiftKey)return;
  const id=ev.target.closest('.element')?.dataset.id||null;
  if(!id){openPage(ev,api.activePageId(),{allowInserts:!api.isPreview?.()});return;}
  ev.preventDefault();ev.stopPropagation();pageContextId=null;
  context=api.prepare(id);lastPoint=api.point(ev.clientX,ev.clientY);
  const el=context.element,textual=el&&!['image','shape','divider','connector'].includes(el.type),selectedText=context.hasTextSelection;
  menu.setAttribute('aria-label',selectedText?'선택한 글자 서식':'선택 객체 도구');api.opened?.();
  menu.innerHTML='<div class="context-drag-handle"><strong>'+(selectedText?'선택한 글자 서식':'선택 객체 도구')+'</strong><button type="button" data-context-action="close" aria-label="우클릭 도구 닫기">✕</button></div><div class="context-body">'+(textual?'<div class="context-format"><label>글꼴<select data-context-style="font" aria-label="우클릭 글꼴">'+(root.DocutBranding?.FONTS||[]).map(f=>'<option '+(f===el.style.font?'selected':'')+'>'+esc(f)+'</option>').join('')+'</select></label><label>크기<input data-context-style="size" aria-label="우클릭 글자 크기" type="number" min="10" max="100" value="'+el.style.size+'"></label><label>글자색<input data-context-style="color" aria-label="우클릭 글자색" type="color" value="'+(/^#[a-f0-9]{6}$/i.test(el.style.color)?el.style.color:'#263242')+'"></label></div><div class="context-actions"><button type="button" data-context-format="bold"><b>B</b></button><button type="button" data-context-format="italic"><i>I</i></button><button type="button" data-context-format="underline"><u>U</u></button><button type="button" data-context-action="align-left">왼쪽</button><button type="button" data-context-action="align-center">가운데</button><button type="button" data-context-action="align-right">오른쪽</button></div>':'')+(el?'<div class="context-actions"><button type="button" data-context-action="effects-studio">✦ 애니메이션·효과</button>'+(['bar','line','donut','table','kpi'].includes(el.type)?'<button type="button" data-context-action="data-motion">▥ '+(el.dataBinding?'엑셀·시트 연결 수정':'엑셀·시트 연결')+'</button>':'')+'<button type="button" data-context-action="scene-settings">↗ 자세·화살표</button><button type="button" data-context-action="lock">'+(el.locked?'잠금 해제':'잠금')+'</button><button type="button" data-context-action="duplicate">복제</button><button type="button" data-context-action="move-front">앞으로</button><button type="button" data-context-action="move-back">뒤로</button><button type="button" data-context-action="delete-element">삭제</button></div>':'')+'<div class="context-inserts"><span>클릭하거나 캔버스로 드래그</span>'+[['text','¶ 텍스트'],['card','▣ 카드'],['image','▧ 그림'],['table','▦ 표']].map(([kind,name])=>'<button type="button" draggable="true" data-context-insert="'+kind+'">'+name+'</button>').join('')+'</div><div class="context-actions"><button type="button" data-context-action="box-layout">▦ 박스 구성·레퍼런스</button><button type="button" data-context-action="frame-settings">비율·페이지 탭</button></div><p class="context-help">상단 손잡이로 도구창 이동 · Shift+우클릭은 브라우저 메뉴</p></div>';
  place(ev.clientX,ev.clientY);
 }
 document.querySelector('#stageArea').addEventListener('contextmenu',open);
 document.querySelector('#previewSlide').addEventListener('contextmenu',open);
 menu.addEventListener('pointerdown',ev=>{if(ev.target.closest('.context-drag-handle')&&!ev.target.closest('button')){ev.preventDefault();const r=menu.getBoundingClientRect();drag={id:ev.pointerId,x:ev.clientX,y:ev.clientY,left:r.x,top:r.y};menu.setPointerCapture?.(ev.pointerId);}else if(ev.target.closest('button'))ev.preventDefault();});
 menu.addEventListener('pointermove',ev=>{if(!drag||drag.id!==ev.pointerId)return;menu.style.left=Math.max(4,Math.min(root.innerWidth-menu.offsetWidth-4,drag.left+ev.clientX-drag.x))+'px';menu.style.top=Math.max(4,Math.min(root.innerHeight-36,drag.top+ev.clientY-drag.y))+'px';});
 menu.addEventListener('pointerup',()=>drag=null);menu.addEventListener('pointercancel',()=>drag=null);
 menu.addEventListener('click',ev=>{
  const pageButton=ev.target.closest('[data-context-page-action]');
  if(pageButton&&pageContextId){
   const action=pageButton.dataset.contextPageAction;
   if(action==='rename'){const form=menu.querySelector('.context-page-rename');form.hidden=false;const field=form.querySelector('input');field.focus();field.select();return;}
   if(action==='cancel-rename'){menu.querySelector('.context-page-rename').hidden=true;return;}
   if(action==='save-rename'){
    const name=menu.querySelector('#contextPageTitle').value.trim();
    if(!name){menu.querySelector('#contextPageTitle').focus();return;}
    api.pageAction('rename',pageContextId,name);close();return;
   }
   api.pageAction(action,pageContextId);close();return;
  }
  const format=ev.target.closest('[data-context-format]');if(format&&context){api.format(context,format.dataset.contextFormat);return;}
  const insert=ev.target.closest('[data-context-insert]');if(insert){api.insert(insert.dataset.contextInsert,lastPoint);close();return;}
  const action=ev.target.closest('[data-context-action]');if(!action)return;
  if(action.dataset.contextAction==='close'){close();return;}
  if(!context)return;
  if(action.dataset.contextAction==='lock'){api.lock(context.element.id,!context.element.locked);close();return;}
  if(action.dataset.contextAction.startsWith('align-')){api.style(context,{align:action.dataset.contextAction.slice(6)});return;}
  api.action(action.dataset.contextAction);close();
 });
 menu.onchange=ev=>{const key=ev.target.dataset.contextStyle;if(!key||!context)return;api.style(context,{[key]:key==='size'?Number(ev.target.value):ev.target.value});};
 menu.oninput=ev=>{if(context&&ev.target.dataset.contextStyle==='size'){const value=Number(ev.target.value);if(Number.isFinite(value)&&value>=10&&value<=100)api.style(context,{size:value});}};
 menu.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&ev.target.matches('#contextPageTitle')){ev.preventDefault();menu.querySelector('[data-context-page-action="save-rename"]').click();}});
 menu.ondragstart=ev=>{const button=ev.target.closest('[data-context-insert]');if(!button)return;ev.dataTransfer.setData('application/x-docut-insert',button.dataset.contextInsert);ev.dataTransfer.effectAllowed='copy';};
 const canvas=document.querySelector('#stageArea');
 canvas.addEventListener('dragover',ev=>{if([...ev.dataTransfer.types].includes('application/x-docut-insert'))ev.preventDefault();});
 canvas.addEventListener('drop',ev=>{const kind=ev.dataTransfer.getData('application/x-docut-insert');if(!['text','card','image','table'].includes(kind))return;ev.preventDefault();api.insert(kind,api.point(ev.clientX,ev.clientY));close();});
 document.addEventListener('pointerdown',ev=>{if(!menu.hidden&&!menu.contains(ev.target))close();},true);
 document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!menu.hidden){ev.preventDefault();ev.stopPropagation();close();}},true);
 canvas.addEventListener('keydown',ev=>{if(ev.key==='ContextMenu'||ev.shiftKey&&ev.key==='F10'){const rect=ev.target.getBoundingClientRect();open({target:ev.target,clientX:rect.x+20,clientY:rect.y+20,shiftKey:false,preventDefault:()=>ev.preventDefault(),stopPropagation:()=>ev.stopPropagation()});}});
 return {close,isOpen:()=>!menu.hidden,openPage};
}
root.DocutContextTools={mount,pageMarkup};
})(typeof globalThis!=='undefined'?globalThis:this);
