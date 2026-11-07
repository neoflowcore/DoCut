/* V0.26 no-network declarative slide transitions shared by editor and offline HTML. */
(function(root){
 'use strict';
 const DEFINITIONS={
  none:{duration:0,name:'즉시 전환',frames:[]},
  fade:{duration:360,name:'페이드',frames:[{opacity:0},{opacity:1}]},
  slide:{duration:420,name:'가로 슬라이드',frames:[{opacity:0,transform:'translateX(48px)'},{opacity:1,transform:'translateX(0)'}]},
  zoom:{duration:480,name:'시네마틱 줌',frames:[{opacity:0,transform:'scale(.93)'},{opacity:1,transform:'scale(1)'}]},
  wipe:{duration:450,name:'좌→우 와이프',frames:[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}]},
  'slide-up':{duration:450,name:'아래→위 장면',frames:[{opacity:0,transform:'translateY(54px)'},{opacity:1,transform:'translateY(0)'}]},
  'slide-down':{duration:450,name:'위→아래 장면',frames:[{opacity:0,transform:'translateY(-54px)'},{opacity:1,transform:'translateY(0)'}]},
  'reveal-center':{duration:480,name:'중앙 확장 공개',frames:[{clipPath:'inset(0 50% 0 50%)',opacity:.8},{clipPath:'inset(0 0 0 0)',opacity:1}]},
  curtain:{duration:480,name:'커튼 공개',frames:[{clipPath:'inset(0 100% 0 0)',opacity:.8},{clipPath:'inset(0 0 0 0)',opacity:1}]},
  'soft-blur':{duration:500,name:'소프트 포커스',frames:[{opacity:0,filter:'blur(13px)',transform:'scale(1.018)'},{opacity:1,filter:'blur(0px)',transform:'scale(1)'}]},
  flip:{duration:540,name:'원근 플립',frames:[{opacity:0,transform:'perspective(1100px) rotateY(14deg) scale(.98)'},{opacity:1,transform:'perspective(1100px) rotateY(0deg) scale(1)'}]}
 };
 function normalize(name){return Object.hasOwn(DEFINITIONS,String(name))?name:'fade';}
 function plan(name){const key=normalize(name),def=DEFINITIONS[key];return {id:key,name:def.name,duration:def.duration,frames:def.frames.map(x=>({...x}))};}
 function play(el,name,{speed=1}={}){
  if(!el||typeof el.animate!=='function'||root.matchMedia?.('(prefers-reduced-motion: reduce)').matches||root.document?.hidden)return null;
  const p=plan(name);if(!p.duration)return null;
  try{const anim=el.animate(p.frames,{duration:p.duration,easing:'cubic-bezier(.22,1,.36,1)'});anim.playbackRate=Math.max(.5,Math.min(2,Number(speed)||1));return anim;}
  catch(_){return null;}
 }
 const api={DEFINITIONS,normalize,plan,play};root.DocutPageTransitions=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
