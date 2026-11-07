/* Non-destructive native editor for the UBS source-ratio vector layer.
 * Keeps extracted SVG immutable; page.referenceFidelity.vectorEdits holds local changes.
 */
(function(root){
'use strict';
const SOURCE_PAGES=new Set([5,8,11,13,16,18]);
const COLORS=['fill','stroke'];
const NUMERIC={opacity:[0,1],strokeWidth:[0,10],dx:[-200,200],dy:[-200,200]};
function validPage(page){const f=page&&page.referenceFidelity;return Boolean(f&&f.mode==='source-ratio'&&f.sourceEdition==='2025'&&SOURCE_PAGES.has(f.sourcePage));}
function rgbHex(value){if(/^#[0-9a-f]{6}$/i.test(value||''))return value;const a=String(value||'').match(/rgba?\(\s*(\d+)[, ]+\s*(\d+)[, ]+\s*(\d+)/i);return a?'#'+[a[1],a[2],a[3]].map(n=>Math.max(0,Math.min(255,+n)).toString(16).padStart(2,'0')).join(''):'#777777';}
function panelMarkup(){return '<div class="ubs-edit-head"><strong>UBS SVG 도형 편집</strong><button type="button" data-ubs-close aria-label="벡터 편집 닫기">닫기</button></div>'+
 '<p class="ubs-edit-status" aria-live="polite">도형을 선택하세요.</p>'+
 '<div class="ubs-edit-grid">'+
 '<label>채움색<input type="color" data-ubs-prop="fill" value="#777777" disabled></label>'+
 '<label>선 색상<input type="color" data-ubs-prop="stroke" value="#777777" disabled></label>'+
 '<label>투명도<input type="range" min="0" max="1" step="0.05" data-ubs-prop="opacity" value="1" disabled></label>'+
 '<label>선 굵기<input type="number" min="0" max="10" step="0.25" data-ubs-prop="strokeWidth" value="0" disabled></label>'+
 '<label>가로 이동<input type="number" min="-200" max="200" step="0.5" data-ubs-prop="dx" value="0" disabled></label>'+
 '<label>세로 이동<input type="number" min="-200" max="200" step="0.5" data-ubs-prop="dy" value="0" disabled></label>'+
 '</div><label class="ubs-edit-hidden"><input type="checkbox" data-ubs-prop="hidden" disabled> 선택 도형 숨기기</label>'+
 '<div class="ubs-edit-actions"><button type="button" data-ubs-reset disabled>선택 도형 원복</button><button type="button" data-ubs-reset-all>이 페이지 전체 원복</button></div>'+
 '<p class="ubs-edit-note">PDF 유래 SVG의 원형은 유지되고 수정 값만 저장됩니다. 빈 텍스트 상자를 편집하려면 이 모드를 끄세요. PDF 원본 대비 99% 복원 검증과는 별개입니다.</p>';
}
function mount(options){
 if(typeof document==='undefined'||!options||typeof options.getPage!=='function'||typeof options.commit!=='function'||typeof options.render!=='function')return null;
 const slide=document.getElementById('slide'),bar=document.querySelector('.workflow-toolbar');
 if(!slide||!bar)return null;
 let mode=false,selected=null;
 const button=document.createElement('button');button.type='button';button.id='ubsVectorToggle';button.textContent='◇ UBS 도형 편집';button.setAttribute('aria-pressed','false');button.hidden=true;
 const panel=document.createElement('section');panel.id='ubsVectorPanel';panel.className='ubs-vector-panel';panel.setAttribute('aria-label','UBS 도형 편집 도구');panel.hidden=true;panel.innerHTML=panelMarkup();
 bar.appendChild(button);document.body.appendChild(panel);
 const controls=Array.from(panel.querySelectorAll('[data-ubs-prop]'));
 function shape(){return selected===null?null:slide.querySelector('[data-ubs-vector-index="'+selected+'"]');}
 function edits(){return options.getPage()?.referenceFidelity?.vectorEdits||{};}
 function selectedStyle(){return edits()[String(selected)]||{};}
 function updatePanel(){
  const pg=options.getPage(),active=validPage(pg),el=shape(),canEdit=active&&mode&&selected!==null&&!!el;
  button.hidden=!active;button.setAttribute('aria-pressed',String(mode&&active));button.classList.toggle('active',mode&&active);
  slide.classList.toggle('ubs-vector-edit-mode',active&&mode);
  panel.hidden=!(active&&mode);
  if(!active||!mode)return;
  slide.querySelectorAll('.ubs-vector-selected').forEach(node=>node.classList.remove('ubs-vector-selected'));
  if(canEdit)el.classList.add('ubs-vector-selected');
  panel.querySelector('.ubs-edit-status').textContent=canEdit?'SVG 도형 #'+selected+' · 원본 비율 좌표, 변경 내역 별도 저장':'벡터 도형을 클릭해 선택하세요.';
  panel.querySelector('[data-ubs-reset]').disabled=!canEdit;
  panel.querySelector('[data-ubs-reset-all]').disabled=!Object.keys(edits()).length;
  controls.forEach(input=>{input.disabled=!canEdit;});if(!canEdit)return;
  const style=selectedStyle(),computed=root.getComputedStyle(el);
  for(const input of controls){const prop=input.dataset.ubsProp;
   if(prop==='hidden')input.checked=style.hidden===true;
   else if(COLORS.includes(prop))input.value=style[prop]||rgbHex(computed[prop]);
   else if(prop==='opacity')input.value=style.opacity===undefined?Number(computed.opacity)||1:style.opacity;
   else if(prop==='strokeWidth')input.value=style.strokeWidth===undefined?parseFloat(computed.strokeWidth)||0:style.strokeWidth;
   else input.value=style[prop]===undefined?0:style[prop];
  }
 }
 function commitEdit(key,value){const pg=options.getPage();if(!validPage(pg)||selected===null)return;
  if(COLORS.includes(key)&&!/^#[0-9a-f]{6}$/i.test(String(value)))return;
  if(key==='hidden')value=Boolean(value);
  else if(key in NUMERIC){value=Number(value);if(!Number.isFinite(value)||value<NUMERIC[key][0]||value>NUMERIC[key][1])return;}
  else if(!COLORS.includes(key))return;
  if(selectedStyle()[key]===value)return;
  const index=String(selected);
  options.commit(()=>{const ref=options.getPage().referenceFidelity;const all=ref.vectorEdits||{};ref.vectorEdits={...all,[index]:{...(all[index]||{}),[key]:value}};},false);
  options.render();updatePanel();
 }
 button.addEventListener('click',()=>{mode=!mode;selected=null;updatePanel();});
 panel.querySelector('[data-ubs-close]').addEventListener('click',()=>{mode=false;selected=null;updatePanel();button.focus();});
 for(const control of controls)control.addEventListener('change',()=>commitEdit(control.dataset.ubsProp,control.type==='checkbox'?control.checked:control.value));
 panel.querySelector('[data-ubs-reset]').addEventListener('click',()=>{if(selected===null||!Object.prototype.hasOwnProperty.call(edits(),String(selected)))return;
  const key=String(selected);options.commit(()=>{const ref=options.getPage().referenceFidelity;const all={...ref.vectorEdits};delete all[key];if(Object.keys(all).length)ref.vectorEdits=all;else delete ref.vectorEdits;},false);options.render();updatePanel();});
 panel.querySelector('[data-ubs-reset-all]').addEventListener('click',()=>{if(!Object.keys(edits()).length)return;
  options.commit(()=>{delete options.getPage().referenceFidelity.vectorEdits;},false);options.render();updatePanel();});
 slide.addEventListener('pointerdown',ev=>{if(!mode||!validPage(options.getPage()))return;
  const layer=ev.target.closest('.ubs-source-layer');if(!layer)return;
  ev.preventDefault();ev.stopImmediatePropagation();
  const target=ev.target.closest('[data-ubs-vector-index]');selected=target?Number(target.getAttribute('data-ubs-vector-index')):null;updatePanel();
 },true);
 document.addEventListener('keydown',ev=>{if(mode&&ev.key==='Escape'&&!panel.hidden){mode=false;selected=null;updatePanel();}});
 function sync(){if(!validPage(options.getPage())){selected=null;mode=false;}updatePanel();}
 sync();return {sync,isEditing:()=>mode,select:n=>{selected=Number.isInteger(n)?n:null;updatePanel();}};
}
const api={mount,validPage,rgbHex};root.DocutUBSVectorEdit=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
