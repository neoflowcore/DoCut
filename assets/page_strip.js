(function(root){
'use strict';
function mount(api){const C=root.DocutCore,host=document.createElement('nav');host.id='pageStrip';host.className='page-strip';host.setAttribute('aria-label','전체 페이지 빠른 탐색');document.querySelector('.workspace').before(host);let selected=null,dragged=null,thumbs=false;
 host.innerHTML='<span class="strip-label">페이지 <b id="stripCount"></b></span><div class="strip-track" role="toolbar" tabindex="0" aria-label="페이지 목록"></div><button type="button" class="strip-thumbs" aria-pressed="false" title="페이지 미리보기 전환">▦</button><button type="button" class="strip-reset" title="패널을 기본 위치로 복원">배치 초기화</button>';
 const track=host.querySelector('.strip-track');host.querySelector('.strip-reset').onclick=()=>api.resetPanels?.();host.querySelector('.strip-thumbs').onclick=ev=>{thumbs=!thumbs;host.classList.toggle('with-thumbs',thumbs);ev.currentTarget.setAttribute('aria-pressed',String(thumbs));};
 host.addEventListener('contextmenu',ev=>{
  const item=ev.target.closest('[data-strip-page]');
  if(!item&&!ev.target.closest('.strip-track'))return;
  api.openContext?.(ev,item?.dataset.stripPage||api.activeId());
 });
 track.onclick=ev=>{const b=ev.target.closest('[data-strip-page]');if(b)api.select(b.dataset.stripPage);};
 track.onkeydown=ev=>{const b=ev.target.closest('[data-strip-page]');if(!b)return;
  if(ev.key==='ContextMenu'||(ev.shiftKey&&ev.key==='F10')){
   const rect=b.getBoundingClientRect();
   api.openContext?.({clientX:rect.left+20,clientY:rect.top+20,shiftKey:false,preventDefault:()=>ev.preventDefault(),stopPropagation:()=>ev.stopPropagation()},b.dataset.stripPage);
   return;
  }
const pages=api.pages(),index=pages.findIndex(p=>p.id===b.dataset.stripPage);let next=index;if(ev.key==='ArrowRight')next=Math.min(pages.length-1,index+1);else if(ev.key==='ArrowLeft')next=Math.max(0,index-1);else if(ev.key==='Home')next=0;else if(ev.key==='End')next=pages.length-1;else return;ev.preventDefault();const focusId=ev.altKey?b.dataset.stripPage:pages[next].id;if(ev.altKey)api.reorder(index,next);else api.select(focusId);track.querySelector('[data-strip-page="'+CSS.escape(focusId)+'"]')?.focus();};
 track.ondragstart=ev=>{const b=ev.target.closest('[data-strip-page]');if(!b)return;dragged=b.dataset.stripPage;ev.dataTransfer.setData('application/x-docut-page',dragged);ev.dataTransfer.effectAllowed='move';};
 track.ondragover=ev=>{if(dragged&&ev.target.closest('[data-strip-page]')){ev.preventDefault();ev.dataTransfer.dropEffect='move';}};
 track.ondrop=ev=>{const b=ev.target.closest('[data-strip-page]');if(!b||!dragged)return;ev.preventDefault();const pages=api.pages(),from=pages.findIndex(p=>p.id===dragged),to=pages.findIndex(p=>p.id===b.dataset.stripPage);if(from>=0&&to>=0)api.reorder(from,to);dragged=null;};track.ondragend=()=>dragged=null;
 function render(){const pages=api.pages(),active=api.activeId(),scroll=track.scrollLeft,focus=document.activeElement?.dataset?.stripPage;host.querySelector('#stripCount').textContent=pages.length;
  const frame=api.frame();track.innerHTML=pages.map((p,i)=>'<button type="button" draggable="true" data-strip-page="'+C.escapeHTML(p.id)+'" aria-current="'+(p.id===active?'page':'false')+'" aria-label="페이지 '+(i+1)+' · '+C.escapeHTML(p.tab)+'" title="'+C.escapeHTML(p.tab)+'"><span class="strip-number">'+(i+1)+'</span><span class="strip-mini" style="aspect-ratio:'+frame.width+'/'+frame.height+'">'+p.elements.filter(e=>!e.hidden&&e.type!=='connector').slice(0,35).map(e=>'<i style="left:'+e.x/frame.width*100+'%;top:'+e.y/frame.height*100+'%;width:'+e.w/frame.width*100+'%;height:'+e.h/frame.height*100+'%"></i>').join('')+'</span><span class="strip-title">'+C.escapeHTML(p.tab)+'</span></button>').join('');track.scrollLeft=scroll;
  if(focus)track.querySelector('[data-strip-page="'+CSS.escape(focus)+'"]')?.focus({preventScroll:true});
  if(active!==selected){track.querySelector('[aria-current=page]')?.scrollIntoView({block:'nearest',inline:'nearest'});selected=active;}
 }
 return {render};
}
root.DocutPageStrip={mount};
})(typeof globalThis!=='undefined'?globalThis:this);
