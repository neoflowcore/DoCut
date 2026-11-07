(function(root){
'use strict';
/* V0.28: report-safe independent pointer + ambient lighting. Never changes source text/data. */
const CLASS_BY_KIND={'cursor-glow':'docut-fx-cursor-glow','cursor-tilt':'docut-fx-cursor-tilt','ambient-aura':'docut-fx-ambient-aura','edge-light':'docut-fx-edge-light'};
const CSS=`
/* Separate real DOM layers: a shared ::after used to make cursor + ambient +
   edge effects override each other, so combining effects appeared to do nothing. */
.element.docut-fx-cursor-glow,.element.docut-fx-ambient-aura,.element.docut-fx-edge-light,.element.docut-fx-cursor-tilt{--docut-pointer-x:50%;--docut-pointer-y:50%;--docut-tilt-x:0deg;--docut-tilt-y:0deg;}
.element .docut-fx-layer{position:absolute;inset:0;pointer-events:none;z-index:1;border-radius:inherit;overflow:hidden;}
.element .docut-fx-layer-ambient{opacity:.72;background:radial-gradient(ellipse at 15% 18%,rgba(var(--docut-light-rgb,113,174,255),.27),transparent 52%),radial-gradient(ellipse at 92% 88%,rgba(238,169,109,.23),transparent 53%);transition:opacity .3s ease;}
.element.docut-fx-ambient-aura:hover .docut-fx-layer-ambient{opacity:1;}
.element.docut-fx-ambient-aura{box-shadow:0 15px 45px rgba(73,119,170,.2),0 0 36px rgba(191,149,97,.2)!important;}
.element .docut-fx-layer-cursor{opacity:0;background:radial-gradient(var(--docut-light-radius,220px) circle at var(--docut-pointer-x,50%) var(--docut-pointer-y,50%),rgba(var(--docut-light-rgb,113,174,255),var(--docut-light-alpha,.52)),rgba(235,192,132,var(--docut-light-warm-alpha,.18)) 35%,transparent 75%);transition:opacity .24s ease;mix-blend-mode:screen;}
.element.docut-fx-cursor-glow:hover .docut-fx-layer-cursor,.element.docut-fx-cursor-glow.docut-fx-active .docut-fx-layer-cursor{opacity:1;}
.element.docut-fx-edge-light{outline:1px solid rgba(150,182,220,.55);outline-offset:-1px;}
.element.selected.docut-fx-edge-light{outline:2px solid #d5ad7d;}
.element .docut-fx-layer-edge{opacity:.8;background:linear-gradient(110deg,transparent 25%,rgba(var(--docut-light-rgb,113,174,255),.24) 48%,transparent 70%);background-size:240% 100%;animation:docut-edge-sweep var(--docut-edge-duration,6s) ease-in-out 2;}
.element.docut-fx-cursor-tilt>.element-inner{position:relative;z-index:2;transform:perspective(900px) rotateX(var(--docut-tilt-x,0deg)) rotateY(var(--docut-tilt-y,0deg));transition:transform .16s ease-out;will-change:transform;}
.element.docut-fx-cursor-glow>.element-inner,.element.docut-fx-ambient-aura>.element-inner,.element.docut-fx-edge-light>.element-inner{position:relative;z-index:2;}
.element[data-type=image]>.docut-fx-layer{z-index:3;}
@keyframes docut-edge-sweep{0%,18%{background-position:130% 0}65%,100%{background-position:-130% 0}}
@media(prefers-reduced-motion:reduce){.element .docut-fx-layer-edge{animation:none}.element.docut-fx-cursor-tilt>.element-inner{transform:none;transition:none}.element .docut-fx-layer{transition:none;}}
`;
function classes(effects){const active=new Set((effects||[]).map(fx=>fx?.kind));return Object.entries(CLASS_BY_KIND).filter(([kind])=>active.has(kind)).map(([,className])=>className).join(' ');}
function markup(effects){const active=new Set((effects||[]).map(fx=>fx?.kind));
 return [['ambient-aura','ambient'],['edge-light','edge'],['cursor-glow','cursor']]
  .filter(([kind])=>active.has(kind)).map(([,layer])=>`<span class="docut-fx-layer docut-fx-layer-${layer}" aria-hidden="true"></span>`).join('');
}
const singleton=new WeakSet();
function install(doc){if(!doc||singleton.has(doc))return false;singleton.add(doc);
 const active='.docut-fx-cursor-glow,.docut-fx-cursor-tilt,.docut-fx-edge-light';
 const reset=node=>{node?.style?.setProperty('--docut-tilt-x','0deg');node?.style?.setProperty('--docut-tilt-y','0deg');node?.classList?.remove('docut-fx-active');};
 let last=null;
 doc.addEventListener('pointermove',event=>{
  if(event.pointerType==='touch'||root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)return;
  const raw=event.target,el=raw?.closest?.('.element');if(last&&last!==el)reset(last);last=el;
  if(!el||!el.matches(active))return;
  const b=el.getBoundingClientRect();if(!b.width||!b.height)return;
  const x=Math.min(100,Math.max(0,(event.clientX-b.left)/b.width*100)),y=Math.min(100,Math.max(0,(event.clientY-b.top)/b.height*100));
  el.style.setProperty('--docut-pointer-x',x.toFixed(2)+'%');el.style.setProperty('--docut-pointer-y',y.toFixed(2)+'%');
  el.classList.add('docut-fx-active');
  if(el.classList.contains('docut-fx-cursor-tilt')){
   const max=Math.min(18,Math.max(0,Number(el.style.getPropertyValue('--docut-tilt-max'))||0));
   el.style.setProperty('--docut-tilt-x',((50-y)/50*max).toFixed(2)+'deg');el.style.setProperty('--docut-tilt-y',((x-50)/50*max).toFixed(2)+'deg');
  }
 },{passive:true});
 doc.addEventListener('pointerout',event=>{const el=event.target?.closest?.('.element');if(el&&!el.contains(event.relatedTarget)){reset(el);if(last===el)last=null;}},{passive:true});
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden&&last){reset(last);last=null;}});
 return true;
}
const api={CLASS_BY_KIND,CSS,classes,markup,install};root.DocutInteractionFX=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
