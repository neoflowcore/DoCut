(function(root){
'use strict';
// Small, offline, single-play visual animation runtime for editing previews and
// standalone HTML. Never animates off-screen or in reduced-motion mode.
const E=root.DocutEasing;
const TEXT_KINDS=new Set(['word-rise','typewriter','wipe-left','wipe-right','ink-reveal','marker']);
const CHART_KINDS=new Set(['chart-rise','chart-draw','connector-draw','chart-ring','stat-reveal']);
const SPECIAL=new Set([...TEXT_KINDS,...CHART_KINDS,'counter-up','shimmer']);
const clamp=(n,lo=0,hi=1)=>Math.min(hi,Math.max(lo,Number.isFinite(+n)?+n:lo));
function reduced(){return !!root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;}
function visible(){return !root.document?.hidden;}
function timePlan(effects){let offset=0;return (effects||[]).slice(0,3).map(fx=>{const delay=clamp(fx.delay,0,10000),duration=clamp(fx.duration,100,4000),start=offset+delay;offset=start+duration;return {kind:fx.kind,start,duration,easing:fx.easing||'cubic-bezier(.22,1,.36,1)'};});}
function parseNumber(text){const value=String(text||'');const match=value.match(/[-+]?\d[\d,]*(?:\.\d+)?/);if(!match)return null;const target=Number(match[0].replace(/,/g,''));if(!Number.isFinite(target)||Math.abs(target)>1e12)return null;return {target,decimals:(match[0].split('.')[1]||'').length,prefix:value.slice(0,match.index),suffix:value.slice(match.index+match[0].length),grouped:match[0].includes(',')};}
function formatNumber(spec,fraction){if(!spec)return '';const value=spec.target*clamp(fraction);const shown=value.toLocaleString('en-US',{useGrouping:spec.grouped,minimumFractionDigits:spec.decimals,maximumFractionDigits:spec.decimals});return spec.prefix+shown+spec.suffix;}
function wrapWords(textNode){if(!textNode||textNode.nodeType!==3)return[];const chunks=(textNode.nodeValue||'').split(/(\s+)/u);if(chunks.filter(c=>c.trim()).length>60)return[];const fragments=root.document.createDocumentFragment(),words=[];for(const chunk of chunks){if(!chunk)continue;if(/^\s+$/u.test(chunk)){fragments.appendChild(root.document.createTextNode(chunk));continue;}const word=root.document.createElement('span');word.className='docut-word';word.textContent=chunk;word.style.display='inline-block';word.style.whiteSpace='pre-wrap';fragments.appendChild(word);words.push(word);}textNode.replaceWith(fragments);return words;}
function collectWords(container){const doc=root.document;if(!doc||!container)return[];const walker=doc.createTreeWalker(container,root.NodeFilter?.SHOW_TEXT||4);let node;const nodes=[];while((node=walker.nextNode())&&nodes.length<65)if(node.nodeValue.trim()&&!node.parentElement?.closest('.docut-word'))nodes.push(node);let words=Array.from(container.querySelectorAll('.docut-word')).slice(0,60);for(const n of nodes)words=words.concat(wrapWords(n));return words.slice(0,60);}
function clipFrames(kind){return ({typewriter:[{clipPath:'inset(0 100% 0 0)',opacity:1},{clipPath:'inset(0 0 0 0)',opacity:1}], 'wipe-left':[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}], 'wipe-right':[{clipPath:'inset(0 0 0 100%)'},{clipPath:'inset(0 0 0 0)'}], 'ink-reveal':[{clipPath:'inset(0 100% 0 0)',filter:'blur(5px)'},{clipPath:'inset(0 0 0 0)',filter:'blur(0px)'}]})[kind]||[{opacity:1},{opacity:1}];}
function play(dom,effects){const started=[],cleanups=[];if(!dom||!visible()||reduced())return {animations:started,cancel(){}};
 const plan=timePlan(effects);
 function add(node,frames,start,duration,easing='ease-out'){if(!node?.animate)return;try{const a=node.animate(frames,{delay:start,duration,fill:'both',easing});started.push(a);}catch(_){/* ignored if older browser lacks a composite property */}}
 for(const fx of plan){if(!SPECIAL.has(fx.kind))continue;const target=dom.querySelector('.plain-text')||dom.querySelector('.kpi-value')||dom.querySelector('.element-inner')||dom;
  if(fx.kind==='word-rise'){
   const words=collectWords(target);
   if(words.length)words.forEach((w,i)=>add(w,[{opacity:0,transform:'translateY(17px)'},{opacity:1,transform:'translateY(0)'}],fx.start+i*Math.min(38,fx.duration/Math.max(1,words.length)),Math.max(180,fx.duration*.6),fx.easing));
   else add(target,[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],fx.start,fx.duration,fx.easing);
  }else if(['typewriter','wipe-left','wipe-right','ink-reveal'].includes(fx.kind))add(target,clipFrames(fx.kind),fx.start,fx.duration,fx.easing);
  else if(fx.kind==='marker'){target.style.backgroundImage='linear-gradient(transparent 55%,rgba(242,188,71,.52) 55%)';target.style.backgroundRepeat='no-repeat';target.style.backgroundPosition='left bottom';add(target,[{backgroundSize:'0% 100%'},{backgroundSize:'100% 100%'}],fx.start,fx.duration,fx.easing);cleanups.push(()=>{target.style.backgroundImage='';target.style.backgroundRepeat='';target.style.backgroundPosition='';target.style.backgroundSize='';});}
  else if(fx.kind==='shimmer')add(target,[{filter:'brightness(1)'},{filter:'brightness(1.16)'},{filter:'brightness(1)'}],fx.start,fx.duration,'ease-in-out');
  else if(fx.kind==='stat-reveal'){
   const primitives=Array.from(dom.querySelectorAll('.stat-chart-svg > rect,.stat-chart-svg > line,.stat-chart-svg > circle,.stat-chart-svg > text')).slice(0,180);
   primitives.forEach((item,i)=>add(item,[{opacity:0},{opacity:1}],fx.start+i*12,Math.max(160,Math.min(fx.duration,fx.duration-i*5)),fx.easing));
  }else if(fx.kind==='chart-rise'){
   dom.querySelectorAll('.chart-svg g rect').forEach((rect,i)=>{rect.style.transformBox='fill-box';rect.style.transformOrigin='50% 100%';add(rect,[{transform:'scaleY(0.001)',opacity:.35},{transform:'scaleY(1)',opacity:1}],fx.start+i*55,Math.max(150,fx.duration-i*25),fx.easing);});
  }else if(['chart-draw','connector-draw'].includes(fx.kind)){
   dom.querySelectorAll('.chart-svg path').forEach(path=>{let length=0;try{length=path.getTotalLength();}catch(_){return;}if(!Number.isFinite(length)||length<=0)return;add(path,[{strokeDasharray:String(length),strokeDashoffset:length},{strokeDasharray:String(length),strokeDashoffset:0}],fx.start,fx.duration,fx.easing);});
   dom.querySelectorAll('.chart-svg g circle').forEach((dot,i)=>add(dot,[{opacity:0},{opacity:1}],fx.start+fx.duration*.5+i*60,Math.max(100,fx.duration*.35),fx.easing));
  }else if(fx.kind==='chart-ring'){
   dom.querySelectorAll('.chart-svg circle[stroke]').forEach((ring,i)=>{ring.style.transformBox='fill-box';ring.style.transformOrigin='center';add(ring,[{opacity:0,transform:'scale(.74)'},{opacity:1,transform:'scale(1)'}],fx.start+i*70,Math.max(160,fx.duration-i*35),fx.easing);});
  }else if(fx.kind==='counter-up'){
   const value=dom.querySelector('.kpi-value');if(!value)continue;const original=value.textContent,spec=parseNumber(original);if(!spec)continue;let raf=0;const startAt=fx.start,seconds=fx.duration;const clock=root.performance?.now?.bind(root.performance)||Date.now;
   const origin=clock();function step(t){if(!visible()){value.textContent=original;return;}const progress=(t-origin-startAt)/seconds;if(progress<0){value.textContent=formatNumber(spec,0);raf=root.requestAnimationFrame(step);return;}const eased=E?.easingY?E.easingY(clamp(progress),fx.easing):clamp(progress);value.textContent=formatNumber(spec,eased);if(progress<1)raf=root.requestAnimationFrame(step);else{value.textContent=original;}}raf=root.requestAnimationFrame(step);
   cleanups.push(()=>{if(raf)root.cancelAnimationFrame(raf);value.textContent=original;});
  }
 }
 return {animations:started,cancel(){started.forEach(a=>{try{a.cancel();}catch(_){}});cleanups.forEach(f=>f());}};
}
function scrub(dom,effects,time){if(!dom)return;const plan=timePlan(effects);for(const fx of plan){if(!SPECIAL.has(fx.kind))continue;const t=clamp((time-fx.start)/fx.duration),target=dom.querySelector('.plain-text')||dom.querySelector('.kpi-value')||dom.querySelector('.element-inner')||dom;
  if(fx.kind==='counter-up'){const value=dom.querySelector('.kpi-value');if(!value)continue;const spec=parseNumber(value.dataset.docutOriginalValue||value.textContent);if(!spec)continue;if(!value.dataset.docutOriginalValue)value.dataset.docutOriginalValue=value.textContent;value.textContent=formatNumber(spec,E?.easingY?E.easingY(t,fx.easing):t);}
  else if(['typewriter','wipe-left','wipe-right','ink-reveal'].includes(fx.kind)){target.style.clipPath='inset(0 '+((fx.kind==='wipe-right')?0:(1-t)*100)+'% 0 '+((fx.kind==='wipe-right')?(1-t)*100:0)+'%)';}
  else if(fx.kind==='word-rise'){target.style.opacity=String(t);target.style.transform=`translateY(${(1-t)*16}px)`;}
  else if(fx.kind==='marker'){target.style.backgroundImage='linear-gradient(transparent 55%,rgba(242,188,71,.52) 55%)';target.style.backgroundRepeat='no-repeat';target.style.backgroundPosition='left bottom';target.style.backgroundSize=`${Math.round(t*100)}% 100%`;}
  else if(fx.kind==='stat-reveal'){const shapes=Array.from(dom.querySelectorAll('.stat-chart-svg > rect,.stat-chart-svg > line,.stat-chart-svg > circle,.stat-chart-svg > text')).slice(0,180);shapes.forEach((shape,i)=>{const start=i/Math.max(1,shapes.length)*.38;shape.style.opacity=String(clamp((t-start)/.62));});}
  else if(fx.kind==='chart-rise'){dom.querySelectorAll('.chart-svg g rect').forEach(rect=>{rect.style.transformBox='fill-box';rect.style.transformOrigin='50% 100%';rect.style.transform=`scaleY(${Math.max(.001,t)})`;});}
  else if(['chart-draw','connector-draw'].includes(fx.kind)){dom.querySelectorAll('.chart-svg path').forEach(path=>{try{const length=path.getTotalLength();path.style.strokeDasharray=String(length);path.style.strokeDashoffset=String(length*(1-t));}catch(_){}});}
  else if(fx.kind==='chart-ring'){dom.querySelectorAll('.chart-svg circle[stroke]').forEach(c=>{c.style.transformBox='fill-box';c.style.transformOrigin='center';c.style.opacity=String(t);c.style.transform=`scale(${.74+t*.26})`;});}
  else if(fx.kind==='shimmer'){target.style.filter=`brightness(${(1+.15*Math.sin(t*Math.PI)).toFixed(3)})`;}
 }
}
const api={SPECIAL,TEXT_KINDS,CHART_KINDS,parseNumber,formatNumber,timePlan,play,scrub};root.DocutVisualMotion=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
