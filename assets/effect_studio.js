(function(root){
'use strict';
// Effect palette: one visual first, short names, real runnable previews.
const C=root.DocutCore,CAT=root.DocutEffectCatalog,E=root.DocutEasing,TRANS=root.DocutPageTransitions;
const X=root.DocutExporter,M=root.DocutVisualMotion,ICONS=root.DocutEffectIcons;
const TYPES=['card','title','text','kpi','bar','line','donut','stat','table'];
const esc=C.escapeHTML,byId=id=>root.document.getElementById(id);
const DEMOS={card:['전략의 핵심 결론','근거와 실행으로 연결하는 의사결정'],title:['변화의 방향을 제시합니다'],text:['검증 가능한 근거와 권고안을 제시합니다.'],kpi:['84%','성과 지표'],bar:['유형별 비교'],line:['변화 추세'],donut:['구성 비율'],stat:['데이터 검증'],table:['항목별 비교']};
let installed=false,handlers=null,mode='all',category='all',query='',choice=null,animations=[];
const candidates=()=>CAT.GALLERY.filter(x=>mode==='all'||x.mode===mode);
const selectedType=()=>handlers?.getSelected?.()?.type||null;
function fits(entry,type){return entry.mode==='transition'||(Array.isArray(entry.kinds)?entry.kinds:[entry.kind]).every(k=>CAT.supports(k,type));}
function compatibleType(entry,preferred){if(entry.mode==='transition')return 'page';return preferred&&fits(entry,preferred)?preferred:TYPES.find(type=>fits(entry,type))||'card';}
function group(entry){return CAT.CATEGORIES[entry.category]||entry.category;}
function options(){const needle=query.trim().toLocaleLowerCase();return candidates().filter(entry=>(category==='all'||category===entry.category)&&(!needle||[entry.name,entry.id,group(entry),...(entry.kinds||[])].join(' ').toLocaleLowerCase().includes(needle)));}
function buildEffect(entry,type){return Array.isArray(entry.kinds)?CAT.createStack(entry.id,type):[Object.assign(C.makeEffect(entry.kind,850,0),{easing:'cubic-bezier(.22,1,.36,1)'})];}
function sample(entry,type){const base=C.makeBlock(type,24,48,{w:488,h:210});base.id='effect-studio-demo';base.effects=buildEffect(entry,type);
 if(DEMOS[type])base.text=DEMOS[type].join('\n');
 // Only the gallery preview receives these explicit demonstration values.
 // Real pages and exported content keep their own original raw data.
 if(['bar','line','donut'].includes(type)){
  base.text='동작 예시 · 샘플';
  base.data={labels:['A','B','C','D'],values:type==='donut'?[42,28,18,12]:[32,58,43,76],palette:'default',unit:''};
 }
 if(type==='table'){base.text='동작 예시 · 샘플';base.data={rows:[['지표','1Q','2Q'],['A','32','58'],['B','43','76']],cells:[]};}
 if(type==='stat'){base.text='동작 예시 · 샘플';base.data={kind:'cohort',rows:[['A',0,85],['A',1,69],['B',0,95],['B',1,82]],limits:{},palette:'default',referenceValue:null};}

 if(type==='title'){base.y=103;base.w=490;base.h=142;base.style.size=44;base.style.color='#edf4ff';base.style.background='transparent';}
 else if(type==='text'){base.y=100;base.w=490;base.h=125;base.style.size=28;base.style.color='#e6f0ff';}
 else if(type==='kpi'){base.w=330;base.h=210;base.x=112;base.style.background='#e6f2ff';}
 else if(type==='stat'){base.style.background='#f6f8fc';base.text='원자료 기반 차트';}
 else{base.style.background='#eaf1ff';base.style.color='#203653';}
 return base;
}
function cleanup(){for(const a of animations){try{a.cancel?.();}catch(_){}}animations=[];}
function message(text){const node=byId('fxStudioMessage');if(node)node.textContent=text;}
function list(){const entries=options(),container=byId('fxStudioList');if(!container)return;
 container.innerHTML=entries.map(entry=>{const id=entry.id,supported=entry.mode==='transition'||fits(entry,selectedType()||'card'),name=entry.name.replace('다음 장면 · ','');
  return `<button type="button" class="fx-studio-choice ${choice===id?'active':''} ${supported?'':'fx-incompatible'}" data-fx-pick="${esc(id)}" aria-label="${esc(entry.name+' · '+group(entry))}" aria-pressed="${choice===id}" title="${esc(entry.name+' · '+group(entry))}">${ICONS.icon(entry)}<span class="fx-choice-label">${esc(name)}</span></button>`;
 }).join('')||'<p class="caption-small">검색 결과 없음</p>';
 byId('fxStudioFound').textContent=`${entries.length} / 89`;
 const categoryNodes=byId('fxStudioCategories');if(categoryNodes)categoryNodes.querySelectorAll('[data-fx-category]').forEach(node=>{const active=node.dataset.fxCategory===category;node.classList.toggle('active',active);node.setAttribute('aria-pressed',String(active));});
}
function scenePreview(entry,node){node.innerHTML='<div class="fx-scene-preview"><div class="fx-scene-back" aria-hidden="true"><span>01</span><i></i><i></i></div><div class="fx-scene-front" aria-label="장면 전환 미리보기"><span>02</span><i></i><i></i><i></i></div></div>';
 const front=node.querySelector('.fx-scene-front'),anim=TRANS?.play(front,entry.transitionId);if(anim)animations.push(anim);
}
function preview(){cleanup();const entry=CAT.GALLERY.find(x=>x.id===choice),node=byId('fxStudioStage');if(!entry||!node){if(node)node.innerHTML='';return;}
 const selected=handlers?.getSelected?.(),type=compatibleType(entry,selected?.type),scene=entry.mode==='transition';
 byId('fxStudioName').textContent=entry.name;
 byId('fxStudioMeta').textContent=scene?'현재 페이지 전환':entry.phase==='leave'?'다음 페이지로 이동할 때 퇴장':group(entry)+' · '+type.toUpperCase();
 byId('fxStudioHint').textContent=scene?'새 페이지가 나타나는 방식':entry.phase==='leave'?'장면이 바뀔 때 선택 박스가 빠져나갑니다.':'선택하면 실제 움직임을 재생합니다.';
 const apply=byId('fxStudioApply');apply.disabled=!scene&&(!selected||selected.locked||!fits(entry,selected.type));
 apply.textContent=scene?'현재 페이지에 전환 적용':entry.phase==='leave'?'선택 박스에 퇴장 설정':!selected?'박스 선택 후 적용':selected.locked?'잠금 해제 후 적용':!fits(entry,selected.type)?'이 박스에는 적용 불가':'선택 박스에 적용';
 if(scene)scenePreview(entry,node);else {const item=sample(entry,type);node.innerHTML=X.renderBlock(item,false);
  if(!root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches){const element=node.querySelector('.element'),built=E?.buildFrames(item.effects,1000/60);
   if(element&&built?.duration){const a=element.animate(built.frames,{duration:built.duration,fill:'both',easing:'linear'});animations.push(a);}
   const visual=M?.play(element,item.effects);if(visual)animations.push(visual);
  }
 }
 message(root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'동작 줄이기 사용 중':'');
}
function select(id){choice=id;list();preview();}
function render(){const entries=options();if(!entries.some(x=>x.id===choice))choice=entries[0]?.id||null;list();preview();}
function switchMode(next){mode=next;category='all';query='';byId('fxStudioSearch').value='';byId('fxStudioCategory').value='all';byId('fxStudioCategories')?.querySelectorAll('[data-fx-category]').forEach(node=>{node.classList.toggle('active',node.dataset.fxCategory==='all');node.setAttribute('aria-pressed',String(node.dataset.fxCategory==='all'));});
 byId('effectStudioDialog').querySelectorAll('[data-fx-mode]').forEach(node=>{const active=node.dataset.fxMode===mode;node.classList.toggle('active',active);node.setAttribute('aria-pressed',String(active));});render();}
function install(){if(installed)return;const dialog=byId('effectStudioDialog');if(!dialog)return;installed=true;
 dialog.addEventListener('close',cleanup);
 dialog.addEventListener('click',ev=>{const btn=ev.target.closest('[data-fx-action],[data-fx-pick],[data-fx-mode],[data-fx-category]');if(!btn)return;ev.preventDefault();
  if(btn.hasAttribute('data-fx-mode')){switchMode(btn.dataset.fxMode);return;}
  if(btn.hasAttribute('data-fx-category')){category=btn.dataset.fxCategory;byId('fxStudioCategory').value=category;render();return;}
  if(btn.hasAttribute('data-fx-pick')){select(btn.dataset.fxPick);return;}
  const action=btn.dataset.fxAction;
  if(action==='close'){dialog.close();return;}
  if(action==='replay'){preview();return;}
  if(action==='references'){dialog.close();handlers?.showReferences?.();return;}
  if(action==='apply'){
   const entry=CAT.GALLERY.find(x=>x.id===choice),selected=handlers?.getSelected?.();if(!entry)return;
   if(entry.mode!=='transition'&&(!selected||selected.locked||!fits(entry,selected.type))){message('박스를 선택하고 잠금을 해제하세요.');return;}
   try{
    if(entry.mode==='transition')handlers?.applyTransition?.(entry.transitionId,entry.name);
    else if(entry.phase==='leave')handlers?.applyExit?.(buildEffect(entry,selected.type),entry.name);
    else handlers?.apply?.(buildEffect(entry,selected.type),entry.name);
    message(entry.mode==='transition'?'페이지 전환 적용 완료':entry.phase==='leave'?'다음 페이지 이동 시 퇴장하도록 설정':'선택 박스 효과 적용 완료');
   }catch(error){message('적용 실패: '+error.message);}
  }
 });
 dialog.addEventListener('change',ev=>{if(ev.target.id==='fxStudioCategory'){category=ev.target.value;render();}});
 dialog.addEventListener('input',ev=>{if(ev.target.id==='fxStudioSearch'){query=ev.target.value;render();}});
}
function open(nextHandlers){handlers=nextHandlers;install();const dialog=byId('effectStudioDialog');if(!dialog)return false;mode='all';category='all';query='';choice='cursor-spotlight';byId('fxStudioCategory').value='all';byId('fxStudioSearch').value='';dialog.querySelectorAll('[data-fx-mode]').forEach(node=>{const active=node.dataset.fxMode==='all';node.classList.toggle('active',active);node.setAttribute('aria-pressed',String(active));});render();if(!dialog.open)dialog.showModal();return true;}
const api={open,compatibleType,buildEffect,sample,options};root.DocutEffectStudio=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
