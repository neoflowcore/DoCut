(function(root){
'use strict';
// Choose a real, unbound report chart slot rather than covering the reference
// layout with a newly inserted block. Never overwrite existing authored data.
const TYPES=new Set(['bar','line','donut']);
function isPlaceholder(e){
 if(!e||e.templateSlot!==true||!TYPES.has(e.type)||e.locked||e.hidden||e.verified||e.dataBinding||e.source||e.evidence)return false;
 const labels=e.data?.labels||[],values=e.data?.values||[];
 if(!Array.isArray(labels)||!Array.isArray(values)||values.length<1||values.length>360||labels.length!==values.length)return false;
 return values.every(n=>typeof n==='number'&&Number.isFinite(n)&&n===0);
}
function list(page,opts={}){
 if(!page||!Array.isArray(page.elements))return [];
 const explicitId=typeof opts.selectedId==='string'?opts.selectedId:null;
 const results=[];
 for(const el of page.elements){
  const explicit=Boolean(explicitId&&el.id===explicitId);
  if(el.locked||el.hidden||!TYPES.has(el.type))continue;
  if(!explicit&&!isPlaceholder(el))continue;
  if(explicit&&el.verified&&!el.dataBinding)continue; // Never clobber verified handmade data.
  results.push({id:el.id,type:el.type,selected:explicit,placeholder:isPlaceholder(el),
   text:String(el.text||el.type).slice(0,90),x:el.x,y:el.y,w:el.w,h:el.h});
 }
 return results;
}
function choose(page,kind,opts={}){
 const candidates=list(page,opts);
 if(!candidates.length)return null;
 const explicit=candidates.find(x=>x.selected);
 if(explicit)return explicit;
 const preferred=candidates.find(x=>x.placeholder&&x.type===kind);
 if(preferred)return preferred;
 // When there is exactly one empty chart area, prefer its authored type
 // instead of dropping a new bar on top of a line/donut template.
 const empties=candidates.filter(x=>x.placeholder);
 return empties.length===1?empties[0]:null;
}
function target(page,id,opts={}){
 const options=list(page,opts);
 const available=options.find(x=>x.id===id);
 if(!available)throw Error('차트 자리가 변경되었거나 이미 연결되었습니다. 다시 선택하세요.');
 const block=page.elements.find(x=>x.id===id);
 if(!block||block.locked||block.hidden)throw Error('선택된 차트를 편집할 수 없습니다.');
 return block;
}
function label(item){
 const kind={bar:'막대',line:'선',donut:'도넛'}[item.type]||item.type;
 const detail=item.text||kind;
 return kind+' · '+detail+(item.selected?' (현재 선택)':'');
}
// Find a low-overlap area when a new chart is needed. The solver uses an
// explicit non-background occupancy model and never places outside the frame.
function place(page,frame={width:1280,height:720},requested={w:600,h:320}){
 const width=Math.max(480,Number(frame.width)||1280),height=Math.max(360,Number(frame.height)||720);
 const all=(page?.elements||[]).filter(e=>!e.hidden&&e.type!=='shape'&&Number.isFinite(e.x)&&Number.isFinite(e.w));
 const weights={title:1.9,text:1.3,kpi:1.6,bar:2.8,line:2.8,donut:2.8,table:2.2,image:2.2,card:1.4,note:1.2};
 let best=null;
 for(const scale of [1,.85,.72]){
  const w=Math.min(width-48,Math.max(280,Math.round((requested.w||600)*scale)));
  const h=Math.min(height-64,Math.max(190,Math.round((requested.h||320)*scale)));
  const bottom=height-h-28;
  for(let y=100;y<=bottom;y+=28)for(let x=32;x<=width-w-24;x+=36){
   const overlap=all.reduce((n,e)=>{
    const area=Math.max(0,Math.min(x+w,e.x+e.w)-Math.max(x,e.x))*Math.max(0,Math.min(y+h,e.y+e.h)-Math.max(y,e.y));
    return n+area*(weights[e.type]||1);
   },0)/(w*h);
   const drift=Math.abs(x-(width-w)/2)/width+Math.abs(y-(height-h)/2)/height;
   const cost=overlap*100+drift*.07+(1-scale)*.3;
   if(!best||cost<best.cost)best={x,y,w,h,overlapRatio:Math.min(1,overlap),cost};
  }
 }
 if(!best)return {x:32,y:100,w:Math.max(280,width-64),h:Math.max(190,height-140),overlapRatio:1,clear:false};
 return {x:best.x,y:best.y,w:best.w,h:best.h,overlapRatio:Number(best.overlapRatio.toFixed(3)),clear:best.overlapRatio<.02};
}
const api=Object.freeze({isPlaceholder,list,choose,target,label,place});
root.DocutChartSlotMapper=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
