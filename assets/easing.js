(function(root){
'use strict';
const C=root.DocutCore;
function bezier(t,p1,p2){const inv=1-t;return 3*inv*inv*t*p1+3*inv*t*t*p2+t*t*t;}
function bezierDerivative(t,p1,p2){return 3*(1-t)*(1-t)*p1+6*(1-t)*t*(p2-p1)+3*t*t*(1-p2);}
function parseEasing(source){
 const m=String(source||'').match(/^cubic-bezier\(\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*\)$/);
 if(!m)return [0.22,1,0.36,1];return [Math.max(0,Math.min(1,+m[1])),Math.max(-2,Math.min(2,+m[2])),Math.max(0,Math.min(1,+m[3])),Math.max(-2,Math.min(2,+m[4]))];
}
function easingY(progress,source){
 const [x1,y1,x2,y2]=parseEasing(source);const x=Math.max(0,Math.min(1,+progress||0));let t=x;
 for(let i=0;i<8;i++){const v=bezier(t,x1,x2)-x;if(Math.abs(v)<1e-7)break;const d=bezierDerivative(t,x1,x2);if(Math.abs(d)<1e-6)break;t=Math.max(0,Math.min(1,t-v/d));}
 if(Math.abs(bezier(t,x1,x2)-x)>1e-4){let lo=0,hi=1;for(let i=0;i<24;i++){const m=(lo+hi)/2;if(bezier(m,x1,x2)>x)hi=m;else lo=m;}t=(lo+hi)/2;}
 return bezier(t,y1,y2);
}
const poses={
 none:[{opacity:1},{opacity:1}],fade:[{opacity:0},{opacity:1}],rise:[{opacity:0,y:42},{opacity:1,y:0}],
 'slide-left':[{opacity:0,x:-65},{opacity:1,x:0}], 'slide-right':[{opacity:0,x:65},{opacity:1,x:0}],
 zoom:[{opacity:0,scale:0.88},{opacity:1,scale:1}],blur:[{opacity:0,blur:10},{opacity:1,blur:0}],
 rotate:[{opacity:0,rotate:-6,scale:0.91},{opacity:1,rotate:0,scale:1}],pulse:[{scale:1},{scale:1.06},{scale:1}],
 glow:[{brightness:1},{brightness:1.18},{brightness:1}],float:[{y:0},{y:-15},{y:0}],exit:[{opacity:1},{opacity:0}],
 'fade-up':[{opacity:0,y:24},{opacity:1,y:0}], 'fade-down':[{opacity:0,y:-24},{opacity:1,y:0}],
 drop:[{opacity:0,y:-100,scale:.96},{opacity:1,y:0,scale:1}],pop:[{opacity:0,scale:.76},{opacity:1,scale:1.04},{opacity:1,scale:1}],
 spring:[{opacity:0,scale:.68,y:45},{opacity:1,scale:1.07,y:-9},{opacity:1,scale:1,y:0}],
 sweep:[{opacity:0,x:-110},{opacity:1,x:0}], 'flip-x':[{opacity:0,rotateX:-74,scale:.86},{opacity:1,rotateX:0,scale:1}],
 'flip-y':[{opacity:0,rotateY:-74,scale:.88},{opacity:1,rotateY:0,scale:1}],
 'depth-in':[{opacity:0,scale:.76,blur:6},{opacity:1,scale:1,blur:0}],
 parallax:[{x:25,rotateY:12,scale:1.04},{x:0,rotateY:0,scale:1}],tilt:[{rotateX:8,rotateY:-12,y:16},{rotateX:0,rotateY:0,y:0}],
 'pan-left':[{x:35,scale:1.02},{x:0,scale:1}],breathe:[{scale:1},{scale:1.025},{scale:1}],
 'shake-soft':[{x:0},{x:-4},{x:3},{x:-2},{x:0}],
 'exit-up':[{opacity:1,y:0},{opacity:0,y:-36}], 'exit-down':[{opacity:1,y:0},{opacity:0,y:36}],
 // The following styles are performed on inner content by DocutVisualMotion.
 'word-rise':[{opacity:1},{opacity:1}],typewriter:[{opacity:1},{opacity:1}],
 'wipe-left':[{opacity:1},{opacity:1}], 'wipe-right':[{opacity:1},{opacity:1}],
 'ink-reveal':[{opacity:1},{opacity:1}],marker:[{opacity:1},{opacity:1}],
 'counter-up':[{opacity:1},{opacity:1}], 'chart-rise':[{opacity:1},{opacity:1}],
 'chart-draw':[{opacity:1},{opacity:1}],'connector-draw':[{opacity:1},{opacity:1}], 'chart-ring':[{opacity:1},{opacity:1}],
 shimmer:[{brightness:1},{brightness:1.06},{brightness:1}],
 'cursor-glow':[{opacity:1},{opacity:1}], 'cursor-tilt':[{opacity:1},{opacity:1}],
 'ambient-aura':[{opacity:1},{opacity:1}], 'edge-light':[{opacity:1},{opacity:1}]
};
const POSE_KEYS=['x','y','rotate','rotateX','rotateY','scale','opacity','blur','brightness'];
function asPose(value={}){return {x:Number.isFinite(+value.x)?+value.x:0,y:Number.isFinite(+value.y)?+value.y:0,rotate:Number.isFinite(+value.rotate)?+value.rotate:0,rotateX:Number.isFinite(+value.rotateX)?+value.rotateX:0,rotateY:Number.isFinite(+value.rotateY)?+value.rotateY:0,scale:Number.isFinite(+value.scale)?+value.scale:1,opacity:Number.isFinite(+value.opacity)?+value.opacity:1,blur:Number.isFinite(+value.blur)?+value.blur:0,brightness:Number.isFinite(+value.brightness)?+value.brightness:1};}
function defaultPose(kind,side='start'){
 const frames=poses[kind]||poses.fade;return asPose(frames[side==='end'?frames.length-1:0]);
}
function effectPose(effect,t){
 const fx=effect||{},kind=poses[fx.kind]?fx.kind:'fade';const base=poses[kind];
 const keyframes=base.map((p,i)=>({at:i/(base.length-1),...asPose(p)}));
 // An individually edited endpoint must not discard the unedited preset endpoint.
 if(fx.start)keyframes[0]={at:0,...defaultPose(kind,'start'),...asPose(fx.start)};
 if(fx.end)keyframes[keyframes.length-1]={at:1,...defaultPose(kind,'end'),...asPose(fx.end)};
 if(Array.isArray(fx.keyframes))fx.keyframes.forEach(k=>{
  if(!Number.isFinite(+k.at))return;
  const at=Math.max(0.001,Math.min(0.999,+k.at));
  keyframes.push({at,...asPose(k)});
 });
 keyframes.sort((a,b)=>a.at-b.at);
 const p=Math.max(0,Math.min(1,+t||0));
 if(p<=keyframes[0].at)return {...keyframes[0]};
 if(p>=keyframes[keyframes.length-1].at)return {...keyframes[keyframes.length-1]};
 let a=keyframes[0],b=keyframes[keyframes.length-1];
 for(let i=1;i<keyframes.length;i++)if(p<=keyframes[i].at){a=keyframes[i-1];b=keyframes[i];break;}
 const delta=Math.max(1e-8,b.at-a.at),f=easingY((p-a.at)/delta,fx.easing);
 const out={};for(const key of POSE_KEYS)out[key]=a[key]+(b[key]-a[key])*f;
 return out;
}
function composeEffects(effects,now){
 let elapsed=0,composed={x:0,y:0,rotate:0,rotateX:0,rotateY:0,scale:1,opacity:1,blur:0,brightness:1};
 for(const [index,fx] of (effects||[]).slice(0,3).entries()){
  const delay=Math.max(0,+fx.delay||0),duration=Math.max(100,+fx.duration||700);
  const position=(now-elapsed-delay)/duration;
  // Keep the first entrance hidden while waiting for its delay; do not flash a final pose.
  if(position<0){if(index===0){const p=effectPose(fx,0);composed={...composed,...p};}break;}
  const p=effectPose(fx,Math.min(1,position)),first=effectPose(fx,0),second=index>0;
  // Subsequent effects apply their movement relative to the initial pose, avoiding
  // the abrupt disappear/reappear caused by stacking two independent entrances.
  const ratio=second?(first.opacity<=.001?1:p.opacity/first.opacity):p.opacity;
  const scale=second?p.scale/Math.max(.01,first.scale):p.scale;
  const brightness=second?p.brightness/Math.max(.01,first.brightness):p.brightness;
  composed={
   x:composed.x+p.x-(second?first.x:0),y:composed.y+p.y-(second?first.y:0),
   rotate:composed.rotate+p.rotate-(second?first.rotate:0),
   rotateX:composed.rotateX+p.rotateX-(second?first.rotateX:0),
   rotateY:composed.rotateY+p.rotateY-(second?first.rotateY:0),
   scale:composed.scale*scale,opacity:composed.opacity*ratio,
   blur:Math.max(0,composed.blur+p.blur-(second?first.blur:0)),
   brightness:composed.brightness*brightness
  };
  elapsed+=delay+duration;
 }
 return composed;
}
function totalDuration(effects){return (effects||[]).slice(0,3).reduce((sum,fx)=>sum+Math.max(0,+fx.delay||0)+Math.max(100,+fx.duration||700),0);}
function cssPose(p){return {transform:`translate(${p.x.toFixed(3)}px,${p.y.toFixed(3)}px) rotate(${p.rotate.toFixed(3)}deg) perspective(1200px) rotateX(${p.rotateX.toFixed(3)}deg) rotateY(${p.rotateY.toFixed(3)}deg) scale(${p.scale.toFixed(4)})`,opacity:+Math.max(0,Math.min(1,p.opacity)).toFixed(4),filter:`blur(${Math.max(0,p.blur).toFixed(2)}px) brightness(${Math.max(0,p.brightness).toFixed(3)})`};}
function buildFrames(effects,step=50){const max=totalDuration(effects),count=Math.max(2,Math.min(360,Math.ceil(max/Math.max(10,step))));return {duration:max,frames:Array.from({length:count+1},(_,i)=>({offset:i/count,...cssPose(composeEffects(effects,max*i/count))}))};}
const api={bezier,bezierDerivative,parseEasing,easingY,asPose,defaultPose,effectPose,composeEffects,totalDuration,cssPose,buildFrames};root.DocutEasing=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
