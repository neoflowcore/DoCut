(function(root){
'use strict';
// Offline-only presentation clock and safe caption transcript. There are no
// media encoders, microphone permissions, background workers or external assets.
const MIN_MS=3000,MAX_MS=60000,DEFAULT_MS=12000,MAX_CUES=16,MAX_CAPTION=220,STYLES=['cinema','glass','minimal'];
const finite=(n)=>typeof n==='number'&&Number.isFinite(n);
function duration(value){
 if(value==null)return DEFAULT_MS;
 const n=Number(value);
 if(value===''||!Number.isInteger(n)||n<MIN_MS||n>MAX_MS)throw Error('장면 재생 시간은 3~60초(정수 밀리초)여야 합니다.');
 return n;
}
function stamp(value){
 const raw=String(value||'').trim();
 if(!/^(?:\d{1,3}:)?\d{1,3}(?:\.\d{1,3})?$/.test(raw))throw Error('시간 형식은 초(3.5) 또는 분:초(01:03.5)입니다.');
 let seconds;if(raw.includes(':')){const [m,s]=raw.split(':').map(Number);if(s>=60)throw Error('분:초에서 초는 60 미만이어야 합니다.');seconds=m*60+s;}else seconds=Number(raw);
 if(!Number.isFinite(seconds)||seconds<0)return NaN;
 return Math.round(seconds*1000);
}
function printStamp(ms){const n=Math.max(0,Math.round(Number(ms)||0));return String(Math.floor(n/60000)).padStart(2,'0')+':'+String(Math.floor(n%60000/1000)).padStart(2,'0')+'.'+String(n%1000).padStart(3,'0');}
function validateCaptions(list,maxMs=DEFAULT_MS){
 const max=duration(maxMs);
 if(list==null)return [];
 if(!Array.isArray(list)||list.length>MAX_CUES)throw Error('캡션은 페이지당 최대 16개입니다.');
 const sorted=list.map((raw,i)=>{
  if(!raw||typeof raw!=='object')throw Error('캡션 '+(i+1)+'의 형식이 올바르지 않습니다.');
  const startMs=Number(raw.startMs),endMs=Number(raw.endMs),text=raw.text;
  if(!Number.isInteger(startMs)||!Number.isInteger(endMs)||startMs<0||endMs>max||endMs<=startMs)throw Error('캡션 '+(i+1)+' 시간은 페이지 구간 안에 있어야 합니다.');
  if(typeof text!=='string'||!text.trim()||text.length>MAX_CAPTION||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text))throw Error('캡션 '+(i+1)+' 본문은 1~220자여야 합니다.');
  return {startMs,endMs,text:text.trim()};
 }).sort((a,b)=>a.startMs-b.startMs);
 for(let i=1;i<sorted.length;i++)if(sorted[i].startMs<sorted[i-1].endMs)throw Error('동시에 표시되는 캡션이 겹칩니다. 시작·종료 시간을 조정하세요.');
 return sorted;
}
function parseScript(source,maxMs=DEFAULT_MS){
 const text=String(source??'');if(text.length>6000)throw Error('캡션 입력은 6,000자를 초과할 수 없습니다.');
 const lines=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(lines.length>MAX_CUES)throw Error('캡션은 페이지당 최대 16개입니다.');
 const cues=lines.map((line,i)=>{
  const m=line.match(/^((?:\d{1,3}:)?\d{1,3}(?:\.\d{1,3})?)\s*-\s*((?:\d{1,3}:)?\d{1,3}(?:\.\d{1,3})?)\s*\|\s*(.+)$/u);
  if(!m)throw Error((i+1)+'행 형식 오류: 0-4 | 화면에 보여줄 문장');
  return {startMs:stamp(m[1]),endMs:stamp(m[2]),text:m[3]};
 });
 return validateCaptions(cues,maxMs);
}
function toScript(cues){return validateCaptions(cues,MAX_MS).map(c=>`${printStamp(c.startMs)}-${printStamp(c.endMs)} | ${c.text}`).join('\n');}
function activeCaption(cues,elapsed){return (cues||[]).find(c=>elapsed>=c.startMs&&elapsed<c.endMs)?.text||'';}
function totalDuration(pages){return (pages||[]).reduce((n,p)=>n+duration(p.playbackMs),0);}
function makeController(options={}){
 const getPages=options.getPages||(()=>[]),onPage=options.onPage||(()=>{}),onTick=options.onTick||(()=>{});
 const clock=options.clock||(()=>root.performance?.now?.()??Date.now());
 const later=options.schedule||((fn,ms)=>root.setTimeout(fn,ms)),cancel=options.cancel||((token)=>root.clearTimeout(token));
 let index=0,elapsed=0,speed=1,loop=false,playing=false,lastAt=0,token=null,destroyed=false;
 const pages=()=>getPages()||[];
 const boundIndex=n=>Math.max(0,Math.min(Math.max(0,pages().length-1),Math.trunc(Number(n)||0)));
 const state=()=>{const items=pages(),durationMs=duration(items[index]?.playbackMs),totalMs=totalDuration(items),globalElapsedMs=items.slice(0,index).reduce((a,p)=>a+duration(p.playbackMs),0)+elapsed;
  return {index,elapsedMs:elapsed,durationMs,totalMs,globalElapsedMs,speed,loop,playing,progress:Math.min(1,elapsed/durationMs),globalProgress:totalMs?Math.min(1,globalElapsedMs/totalMs):0};};
 function notify(){onTick(state());}
 function unschedule(){if(token!==null){cancel(token);token=null;}}
 function advance(){if(!playing)return;
  const now=clock(),step=Math.max(0,Math.min(120000,now-lastAt))*speed;lastAt=now;elapsed+=step;
  let remainingSteps=pages().length+1;
  while(remainingSteps-->0&&playing&&elapsed>=duration(pages()[index]?.playbackMs)){
   elapsed-=duration(pages()[index]?.playbackMs);
   if(index+1<pages().length){index++;onPage(index);}
   else if(loop&&pages().length){index=0;onPage(index);}
   else{index=Math.max(0,pages().length-1);elapsed=duration(pages()[index]?.playbackMs);playing=false;unschedule();}
  }
  if(playing&&elapsed>=duration(pages()[index]?.playbackMs))elapsed=0; // clock stalls never create an infinite loop
 }
 function wake(){token=null;if(destroyed||!playing)return;advance();notify();arm();}
 function arm(){unschedule();if(!destroyed&&playing){const remain=(duration(pages()[index]?.playbackMs)-elapsed)/speed;token=later(wake,Math.max(10,Math.min(120,remain)));}}
 function play(){if(destroyed||playing||!pages().length)return state();if(elapsed>=duration(pages()[index]?.playbackMs)){index=0;elapsed=0;onPage(index);}playing=true;lastAt=clock();notify();arm();return state();}
 function pause(){if(destroyed)return state();advance();playing=false;unschedule();notify();return state();}
 function stop(){playing=false;unschedule();elapsed=0;notify();return state();}
 function jump(next){if(destroyed||!pages().length)return state();index=boundIndex(next);elapsed=0;lastAt=clock();onPage(index);notify();if(playing)arm();return state();}
 function seek(ms){if(destroyed)return state();const max=duration(pages()[index]?.playbackMs);elapsed=Math.max(0,Math.min(max,Number(ms)||0));lastAt=clock();notify();if(playing)arm();return state();}
 function seekGlobal(ms){if(destroyed||!pages().length)return state();const items=pages(),max=totalDuration(items),target=Math.max(0,Math.min(max,Number.isFinite(Number(ms))?Number(ms):0));let offset=target,next=items.length-1;
  for(let i=0;i<items.length;i++){const len=duration(items[i].playbackMs);if(offset<len||i===items.length-1){next=i;elapsed=Math.max(0,Math.min(len,offset));break;}offset-=len;}
  const changed=next!==index;index=next;lastAt=clock();if(changed)onPage(index);notify();if(playing)arm();return state();
 }
 function setSpeed(v){if(destroyed)return state();const next=Number(v);if(![.5,1,1.5,2].includes(next))throw Error('지원하는 재생 속도는 0.5·1·1.5·2배입니다.');advance();speed=next;lastAt=clock();notify();if(playing)arm();return state();}
 function setLoop(v){loop=!!v;notify();return state();}
 function destroy(){playing=false;destroyed=true;unschedule();}
 return {getState:state,play,pause,stop,jump,seek,seekGlobal,setSpeed,setLoop,destroy};
}
const api={MIN_MS,MAX_MS,DEFAULT_MS,MAX_CUES,MAX_CAPTION,STYLES,duration,stamp,printStamp,validateCaptions,parseScript,toScript,activeCaption,totalDuration,makeController};
root.DocutStoryPlayer=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
