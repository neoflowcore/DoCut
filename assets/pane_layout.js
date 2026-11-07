/* V0.26: glass splitters. UI-only, no document schema or report export changes. */
(function(root){
 'use strict';
 const KEY='docut-ui-pane-widths-v026';
 const MIN_LEFT=178,MAX_LEFT=550,MIN_RIGHT=230,MAX_RIGHT=590,MIN_STAGE=300;
 function finite(x,fallback){const v=Number(x);return Number.isFinite(v)?v:fallback;}
 function clampWidths(viewport,left,right,side){
  const w=Math.max(0,finite(viewport,1200));
  let a=Math.max(MIN_LEFT,Math.min(MAX_LEFT,finite(left,258)));
  let b=Math.max(MIN_RIGHT,Math.min(MAX_RIGHT,finite(right,306)));
  const budget=Math.max(MIN_LEFT+MIN_RIGHT, w-MIN_STAGE);
  if(a+b>budget){
   if(side==='left')a=Math.max(MIN_LEFT,budget-b);
   else if(side==='right')b=Math.max(MIN_RIGHT,budget-a);
   else {a=Math.max(MIN_LEFT,Math.min(a,budget-MIN_RIGHT));b=Math.max(MIN_RIGHT,Math.min(b,budget-a));}
  }
  return {left:Math.round(a),right:Math.round(b),stage:Math.max(0,Math.round(w-a-b))};
 }
 function attach(host,{storage,changed}={}){
  if(!host)return {set:()=>{},get:()=>({left:258,right:306})};
  const bars=[...host.querySelectorAll('[data-pane-resize]')];
  const compact=()=>root.matchMedia?.('(max-width: 880px)').matches;
  let prefs={left:root.innerWidth<=1180?214:258,right:root.innerWidth<=1180?264:306};
  try{const found=JSON.parse(storage?.getItem(KEY)||'null');if(found&&Number.isFinite(found.left)&&Number.isFinite(found.right))prefs={left:found.left,right:found.right};}catch(_){/* Restore defaults without touching report data. */}
  function draw(side){if(compact())return;const width=host.getBoundingClientRect().width||root.innerWidth;
   const next=clampWidths(width,prefs.left,prefs.right,side);prefs.left=next.left;prefs.right=next.right;
   host.style.setProperty('--pane-left',next.left+'px');host.style.setProperty('--pane-right',next.right+'px');
   bars.forEach(bar=>{const isLeft=bar.dataset.paneResize==='left',min=isLeft?MIN_LEFT:MIN_RIGHT,max=isLeft?Math.min(MAX_LEFT,width-MIN_STAGE-next.right):Math.min(MAX_RIGHT,width-MIN_STAGE-next.left);bar.setAttribute('aria-valuenow',String(isLeft?next.left:next.right));bar.setAttribute('aria-valuemin',String(min));bar.setAttribute('aria-valuemax',String(Math.max(min,max)));bar.setAttribute('aria-valuetext',(isLeft?'왼쪽':'오른쪽')+' 패널 '+(isLeft?next.left:next.right)+'픽셀');});
   changed?.();
  }
  function save(){try{storage?.setItem(KEY,JSON.stringify(prefs));}catch(_){/* local UI fallback */}}
  bars.forEach(bar=>{
   const side=bar.dataset.paneResize;
   let drag=null;
   bar.addEventListener('pointerdown',e=>{if(compact()||e.button!==0)return;e.preventDefault();drag={id:e.pointerId,startX:e.clientX,startSize:prefs[side]};bar.setPointerCapture?.(e.pointerId);bar.classList.add('dragging');});
   bar.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const diff=e.clientX-drag.startX;prefs[side]=drag.startSize+(side==='left'?diff:-diff);draw(side);});
   function end(e){if(!drag||e.pointerId!==drag.id)return;drag=null;bar.classList.remove('dragging');save();}
   bar.addEventListener('pointerup',end);bar.addEventListener('pointercancel',end);
   bar.addEventListener('keydown',e=>{if(compact())return;const allowed=['ArrowLeft','ArrowRight','Home','End'];if(!allowed.includes(e.key))return;e.preventDefault();const value=prefs[side],delta=e.shiftKey?32:12;
    if(e.key==='Home')prefs[side]=side==='left'?MIN_LEFT:MIN_RIGHT;
    else if(e.key==='End')prefs[side]=side==='left'?MAX_LEFT:MAX_RIGHT;
    else prefs[side]=value+(side==='left'?(e.key==='ArrowRight'?delta:-delta):(e.key==='ArrowLeft'?delta:-delta));
    draw(side);save();});
   bar.addEventListener('dblclick',()=>{prefs[side]=side==='left'?258:306;draw(side);save();});
  });
  function onResize(){draw();}root.addEventListener?.('resize',onResize);draw();
  return {get:()=>({...prefs}),set:(side,width)=>{if(!['left','right'].includes(side))return;prefs[side]=finite(width,prefs[side]);draw(side);save();},destroy:()=>root.removeEventListener?.('resize',onResize)};
 }
 const api={KEY,clampWidths,attach,MIN_LEFT,MAX_LEFT,MIN_RIGHT,MAX_RIGHT,MIN_STAGE};root.DocutPaneLayout=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
