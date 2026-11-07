(function(root){
'use strict';
const C=root.DocutCore;if(!C)throw Error('Project core missing');
const GAP=16;
const STRATEGIES={
 hero:{columns:2,weights:[1.3,1]},two:{columns:2,weights:[1,1]},three:{columns:3,weights:[1,1,1]},
 chart:{columns:2,weights:[2,1]},comparison:{columns:1,weights:[1]},timeline:{columns:3,weights:[1,1,1],short:true},
 metrics:{columns:4,weights:[1,1,1,1],short:true},split:{columns:2,weights:[.8,1.2]},quadrant:{columns:2,weights:[1,1],rows:2},
 portrait:{columns:2,weights:[1.8,1]},spotlight:{columns:1,weights:[1],inset:120},blank:{columns:0,weights:[]}
};
function intersects(a,b,gap=0){return a.x<b.x+b.w+gap&&a.x+a.w+gap>b.x&&a.y<b.y+b.h+gap&&a.y+a.h+gap>b.y;}
function role(el){if(el.type==='title')return 'title';if(el.type==='source')return 'source';if(['bar','line','donut','stat','table'].includes(el.type))return 'evidence';if(el.type==='kpi')return 'metric';if(el.type==='image')return 'figure';return 'claim';}
function geometry(el){return {x:el.x,y:el.y,w:el.w,h:el.h};}
function bounds(elements){const x=Math.min(...elements.map(e=>e.x)),y=Math.min(...elements.map(e=>e.y));return {x,y,w:Math.max(...elements.map(e=>e.x+e.w))-x,h:Math.max(...elements.map(e=>e.y+e.h))-y};}
function minimum(el,width){const size=Number(el.style?.size)||22;
 let w=['table','stat','bar','line'].includes(el.type)?280:el.type==='donut'?220:el.type==='title'?240:150;
 const padding=['card','kpi','table','stat','bar','line','donut','note'].includes(el.type)?48:8;
 let h=Math.max(48,Math.ceil(String(el.text||'').split('\n').reduce((sum,line)=>sum+Math.max(1,Math.ceil(line.length/Math.max(1,(width-padding)/(size*.65)))),0))*size*1.4+padding);
 if(['table','stat','bar','line','donut','image'].includes(el.type))h=Math.max(h,180);
 if(el.type==='table')h=Math.max(h,(el.data?.rows?.length||1)*Math.max(25,size*1.4)+60);
 if(el.type==='kpi')h=Math.max(h,145);
 return {w,h};
}
function unitsFor(page){const grouped=new Map(),units=[];
 for(const e of page.elements){if(e.hidden||e.type==='connector')continue;const key=e.groupId?'g:'+e.groupId:'e:'+e.id;if(!grouped.has(key)){const unit={id:key,elements:[]};grouped.set(key,unit);units.push(unit);}grouped.get(key).elements.push(e);}
 return units.map(u=>({...u,...bounds(u.elements),locked:u.elements.some(e=>e.locked),role:u.elements.length===1?role(u.elements[0]):'group'}));
}
function minUnit(u,width){if(u.elements.length>1)return {w:u.w,h:u.h};return minimum(u.elements[0],width);}
function plan(page,layout,frame){
 const WIDTH=frame?.width||C.WIDTH,HEIGHT=frame?.height||C.HEIGHT;
 if(!STRATEGIES[layout])throw Error('지원하지 않는 레이아웃입니다.');
 const before=C.clone(page),after=C.clone(page),issues=[],moves=[];
 const result={layout,before,after,issues,moves,ok:true,summary:{retained:page.elements.length,locked:0,groups:0}};
 if(layout==='blank')return result;
 const units=unitsFor(page),fixed=units.filter(u=>u.locked),movable=units.filter(u=>!u.locked),placed=fixed.map(u=>geometry(u));
 result.summary.locked=fixed.reduce((n,u)=>n+u.elements.length,0);result.summary.groups=units.filter(u=>u.elements.length>1).length;
 const strategy=STRATEGIES[layout];
 // Only geometry changes. Every original node and its complete data remain in place.
 const priority={title:0,evidence:layout==='chart'||layout==='comparison'?1:3,metric:layout==='metrics'?1:3,figure:layout==='portrait'?1:3,claim:2,group:2,source:4};
 movable.sort((a,b)=>(priority[a.role]-priority[b.role])||page.elements.indexOf(a.elements[0])-page.elements.indexOf(b.elements[0]));
 function locate(u,preferred){
  const need=minUnit(u,preferred.w),w=u.elements.length>1?u.w:preferred.w,h=Math.max(preferred.h,need.h);
  if(w<need.w||w>WIDTH-96||h>HEIGHT-96)return null;
  const xs=[preferred.x,48,...placed.flatMap(p=>[p.x+p.w+GAP,p.x-w-GAP])];
  const ys=[preferred.y,48,...placed.map(p=>p.y+p.h+GAP)];
  const candidates=[];for(const y of ys)for(const x of xs){const rect={x:Math.round(x),y:Math.round(y),w:Math.round(w),h:Math.ceil(h)};if(rect.x<48||rect.y<40||rect.x+rect.w>WIDTH-48||rect.y+rect.h>HEIGHT-40)continue;if(placed.some(p=>intersects(rect,p,GAP)))continue;candidates.push(rect);}
  candidates.sort((a,b)=>(Math.abs(a.y-preferred.y)*3+Math.abs(a.x-preferred.x))-(Math.abs(b.y-preferred.y)*3+Math.abs(b.x-preferred.x)));
  return candidates[0]||null;
 }
 let bodyIndex=0,headerBottom=48;
 const bodyCount=movable.filter(u=>!['title','source'].includes(u.role)).length;
 const titleUnit=movable.find(u=>u.role==='title');
 const titleHeight=titleUnit?Math.max(85,minUnit(titleUnit,WIDTH-96).h):0;
 if(titleUnit)headerBottom=48+titleHeight+GAP;
 for(const u of movable){
  let preferred;
  if(u.role==='title'){preferred={x:48,y:48,w:WIDTH-96,h:titleHeight};}
  else if(u.role==='source'){preferred={x:48,y:HEIGHT-85,w:WIDTH-96,h:40};}
  else{
   const cols=strategy.columns,rows=strategy.rows||Math.max(1,Math.ceil(bodyCount/cols)),inset=Math.min(strategy.inset||0,Math.max(0,(WIDTH-400)/2));
   const available=WIDTH-96-inset*2-GAP*(cols-1),sum=strategy.weights.reduce((a,b)=>a+b,0),col=bodyIndex%cols,row=Math.floor(bodyIndex/cols);
   const w=available*strategy.weights[col]/sum,x=48+inset+strategy.weights.slice(0,col).reduce((a,b)=>a+b,0)*available/sum+GAP*col;
   const bottom=movable.some(v=>v.role==='source')?HEIGHT-110:HEIGHT-48;
   const h=Math.max(48,(bottom-headerBottom-GAP*(rows-1))/rows);
   preferred={x,y:headerBottom+row*(h+GAP),w,h:strategy.short?Math.min(h,240):h};bodyIndex++;
  }
  const rect=locate(u,preferred);
  if(!rect){issues.push({id:u.elements[0].id,type:'space',message:'가독 크기와 잠금·그룹을 유지할 공간이 부족합니다. 요소를 다른 페이지로 옮기거나 잠금 위치를 조정하세요.'});continue;}
  placed.push(rect);
  for(const el of u.elements){const next=after.elements.find(e=>e.id===el.id);const from=geometry(el);next.x=rect.x+(el.x-u.x);next.y=rect.y+(el.y-u.y);if(u.elements.length===1){next.w=rect.w;next.h=rect.h;}moves.push({id:el.id,role:role(el),from,to:geometry(next)});}
 }
 if(issues.length){result.ok=false;result.after=C.clone(before);result.moves=[];}
 else after.layout=layout;
 return result;
}
function apply(page,proposal){
 if(!proposal?.ok)throw Error('배치 공간이 부족하여 원본을 유지했습니다.');
 if(JSON.stringify(page)!==JSON.stringify(proposal.before))throw Error('미리보기 이후 페이지가 변경되었습니다. 배치를 다시 분석하세요.');
 page.elements=C.clone(proposal.after.elements);page.layout=proposal.after.layout;return page;
}
const oldApply=C.applyLayout;
C.applyLayout=(page,layout,preserve=true)=>preserve?apply(page,plan(page,layout)):oldApply(page,layout,false);
root.DocutSemanticLayout={plan,apply,role,intersects,STRATEGIES};
if(typeof module!=='undefined'&&module.exports)module.exports=root.DocutSemanticLayout;
})(typeof globalThis!=='undefined'?globalThis:this);
