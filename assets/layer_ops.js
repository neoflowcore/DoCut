/* DoCut V0.19 layer batch operations: stable selection, collision-free IDs, locked-layer safety. */
(function(root){
'use strict';
const deep=o=>JSON.parse(JSON.stringify(o));
const keySet=ids=>new Set((ids||[]).filter(x=>typeof x==='string'));
function pick(elements,ids,unlocked=true){const keys=keySet(ids);return (elements||[]).filter(e=>keys.has(e.id)&&(!unlocked||!e.locked));}
function duplicate(elements,ids,uid,bounds={width:1280,height:720},offset=26,limit=120,includeLocked=false){
 const chosen=pick(elements,ids,!includeLocked);if(!chosen.length)return {elements:[...elements],added:[],ids:[]};
 if(elements.length+chosen.length>limit)throw Error('이 페이지에서 120개 이상의 요소를 만들 수 없습니다. 복제 작업을 취소했습니다.');
 const groups=new Map();const added=chosen.map(el=>{
  const clone=deep(el);clone.id=uid('el');if(clone.templateSlot)clone.templateSlot=false;
  if(clone.groupId){if(!groups.has(clone.groupId))groups.set(clone.groupId,uid('group'));clone.groupId=groups.get(clone.groupId);}
  clone.x=Math.min(Math.max(0,bounds.width-clone.w),Math.max(0,clone.x+offset));
  clone.y=Math.min(Math.max(0,bounds.height-clone.h),Math.max(0,clone.y+offset));
  return clone;
 });
 return {elements:[...elements,...added],added,ids:added.map(x=>x.id)};
}
function remove(elements,ids){const selected=keySet(ids),removed=(elements||[]).filter(e=>selected.has(e.id)&&!e.locked);return {elements:elements.filter(e=>!selected.has(e.id)||e.locked),removed};}
function nudge(elements,ids,dx,dy,bounds={width:1280,height:720}){
 const list=pick(elements,ids);if(!list.length)return {changed:false,dx:0,dy:0};
 let x=Math.max(-Math.min(...list.map(e=>e.x)),Math.min(bounds.width-Math.max(...list.map(e=>e.x+e.w)),dx));
 let y=Math.max(-Math.min(...list.map(e=>e.y)),Math.min(bounds.height-Math.max(...list.map(e=>e.y+e.h)),dy));
 x=Math.round(x*100)/100||0;y=Math.round(y*100)/100||0;
 if(!x&&!y)return {changed:false,dx:0,dy:0};
 for(const item of list){item.x+=x;item.y+=y;}
 return {changed:true,dx:x,dy:y};
}
function alignGroup(elements,ids,action,bounds={width:1280,height:720},margin=48){
 const list=pick(elements,ids);if(!list.length)return {changed:false,dx:0,dy:0};
 const left=Math.min(...list.map(e=>e.x)),right=Math.max(...list.map(e=>e.x+e.w));
 const top=Math.min(...list.map(e=>e.y)),bottom=Math.max(...list.map(e=>e.y+e.h));
 const width=right-left,height=bottom-top;
 const horizontal={'align-left':0,'align-hcenter':1,'align-right':2};
 const vertical={'align-top':0,'align-vcenter':1,'align-bottom':2};
 let dx=0,dy=0;
 if(Object.prototype.hasOwnProperty.call(horizontal,action)){
  const target=horizontal[action]===0?Math.min(margin,bounds.width-width):horizontal[action]===1?(bounds.width-width)/2:Math.max(0,bounds.width-width-margin);
  dx=target-left;
 }else if(Object.prototype.hasOwnProperty.call(vertical,action)){
  const target=vertical[action]===0?Math.min(margin,bounds.height-height):vertical[action]===1?(bounds.height-height)/2:Math.max(0,bounds.height-height-margin);
  dy=target-top;
 }else return {changed:false,dx:0,dy:0};
 return nudge(elements,ids,dx,dy,bounds);
}
function distribute(elements,ids,axis){
 if(axis!=='x'&&axis!=='y')return {changed:false,reason:'unknown axis'};
 const sizeKey=axis==='x'?'w':'h';
 const list=pick(elements,ids).sort((a,b)=>a[axis]-b[axis]||a.id.localeCompare(b.id));
 if(list.length<3)return {changed:false,reason:'Select at least three unlocked elements'};
 const first=list[0][axis],lastEnd=list.at(-1)[axis]+list.at(-1)[sizeKey];
 const total=list.reduce((n,e)=>n+e[sizeKey],0),gap=(lastEnd-first-total)/(list.length-1);
 if(gap<0)return {changed:false,reason:'Elements overlap; increase the group span before distributing'};
 let cursor=first,changed=false;
 for(let i=0;i<list.length;i++){
  const next=i===0?list[i][axis]:i===list.length-1?list[i][axis]:Math.round(cursor*100)/100;
  if(Math.abs(next-list[i][axis])>.001)changed=true;
  list[i][axis]=next;cursor=next+list[i][sizeKey]+gap;
 }
 return {changed,gap};
}
function folders(elements){
 const done=new Set(),output=[];
 for(const item of elements){
  if(!item.groupId){output.push({kind:'item',el:item});continue;}
  if(done.has(item.groupId))continue;
  done.add(item.groupId);
  const members=elements.filter(el=>el.groupId===item.groupId);
  output.push({kind:'group',id:item.groupId,name:item.groupLabel||'그룹',elements:members});
 }
 return output;
}
function duplicatePage(page,uid){const next=deep(page),groups=new Map();next.id=uid('page');if(next.designPackId)next.designPackId=uid('design-pack');next.elements.forEach(el=>{el.id=uid('el');if(el.groupId){if(!groups.has(el.groupId))groups.set(el.groupId,uid('group'));el.groupId=groups.get(el.groupId);}});next.customTab=true;next.tab+=' (복사)';return next;}
const api={pick,duplicate,remove,nudge,alignGroup,distribute,folders,duplicatePage};root.DocutLayerOps=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
