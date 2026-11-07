(function(root){
'use strict';
const C=root.DocutCore;if(!C)throw Error('DoCut core missing');
const PRESETS={wide:{label:'16:9',width:1280,height:720},standard:{label:'4:3',width:1200,height:900},'a4-landscape':{label:'A4 가로',width:1188,height:840,printWidth:297,printHeight:210},'a4-portrait':{label:'A4 세로',width:840,height:1188,printWidth:210,printHeight:297},vertical:{label:'9:16',width:720,height:1280}};
const copy=o=>JSON.parse(JSON.stringify(o));
function normalize(raw){if(raw==null)return {...PRESETS.wide,preset:'wide'};if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('출력 프레임 형식이 잘못되었습니다.');
 const preset=raw.preset||'custom';if(PRESETS[preset])return {...PRESETS[preset],preset};
 if(preset!=='custom')throw Error('알 수 없는 프레임 프리셋입니다.');
 const width=Number(raw.width),height=Number(raw.height);if(!Number.isInteger(width)||!Number.isInteger(height)||width<320||height<320||width>2400||height>2400||width/height<.25||width/height>4)throw Error('사용자 비율은 가로·세로 320–2400px, 비율 1:4–4:1 범위여야 합니다.');
 return {preset:'custom',label:width+':'+height,width,height};
}
function activate(frame){const f=normalize(frame);C.WIDTH=f.width;C.HEIGHT=f.height;return f;}
function within(frame,fn){const old={width:C.WIDTH,height:C.HEIGHT};activate(frame);try{return fn();}finally{C.WIDTH=old.width;C.HEIGHT=old.height;}}
function groups(raw){if(raw==null)return [{id:'main',title:'보고서'}];if(!Array.isArray(raw)||!raw.length||raw.length>12)throw Error('상위 탭은 1–12개여야 합니다.');const ids=new Set();return raw.map(g=>{if(!g||typeof g.id!=='string'||!g.id||g.id.length>99||ids.has(g.id))throw Error('상위 탭 ID가 잘못되었거나 중복됩니다.');ids.add(g.id);if(typeof g.title!=='string'||!g.title.trim()||g.title.length>80)throw Error('상위 탭 제목은 1–80자여야 합니다.');return {id:g.id,title:g.title};});}
const baseNormalize=C.normalizeProject,baseCreate=C.createProject;
C.normalizeProject=function(raw){const frame=normalize(raw?.frame),tabs=groups(raw?.groups);const p=within(frame,()=>baseNormalize(raw));p.schema=4;p.frame=frame;p.groups=tabs;
 p.pages.forEach((pg,i)=>{const id=raw.pages[i].groupId??tabs[0].id;if(!tabs.some(g=>g.id===id))throw Error('페이지의 상위 탭을 찾을 수 없습니다: '+id);pg.groupId=id;});
 return p;
};
C.createProject=function(...args){const p=within(PRESETS.wide,()=>baseCreate(...args));p.schema=4;p.frame=normalize();p.groups=groups();p.pages.forEach(pg=>pg.groupId='main');return p;};
function hashFor(project,pageId){const pg=project.pages.find(p=>p.id===pageId);if(!pg)return '';return '#docut='+encodeURIComponent(pg.groupId||project.groups?.[0]?.id||'main')+'/'+encodeURIComponent(pg.id);}
function indexForHash(project,hash){if(!String(hash).startsWith('#docut='))return null;try{const parts=hash.slice(7).split('/').map(decodeURIComponent);if(parts.length!==2)return null;const n=project.pages.findIndex(p=>p.id===parts[1]&&(p.groupId||'main')===parts[0]);return n<0?null:n;}catch(_){return null;}}
function changePlan(project,frame){const f=normalize(frame),baseline=copy(project),candidate=copy(project),warnings=[];candidate.frame=f;
 for(const pg of candidate.pages){const proposal=root.DocutSemanticLayout.plan(pg,pg.layout||'hero',f);if(!proposal.ok)warnings.push({pageId:pg.id,title:pg.tab,issues:proposal.issues});else{pg.elements=proposal.after.elements;pg.layout=proposal.after.layout;}
  // Blank pages deliberately retain geometry. Reject any change that would clip them.
  for(const el of pg.elements.filter(e=>!e.hidden&&e.type!=='connector'))if(el.x<0||el.y<0||el.x+el.w>f.width||el.y+el.h>f.height)warnings.push({pageId:pg.id,title:pg.tab,issues:[{message:'잠금 또는 빈 레이아웃 요소가 새 프레임을 벗어납니다.'}]});
 }
 return {ok:!warnings.length,baseline,project:warnings.length?copy(project):candidate,warnings,frame:f};
}
function accept(project,proposal){if(!proposal?.ok)throw Error('배치할 공간이 부족하여 프레임을 유지했습니다.');if(JSON.stringify(project)!==JSON.stringify(proposal.baseline))throw Error('검토 이후 문서가 변경되었습니다. 프레임을 다시 분석하세요.');return C.normalizeProject(proposal.project);}
function printCSS(raw){const f=normalize(raw),w=f.printWidth?f.printWidth+'mm':f.width/96+'in',h=f.printHeight?f.printHeight+'mm':f.height/96+'in';return '@media print{@page{size:'+w+' '+h+';margin:0}html,body,.report-viewport,.report-screen{width:'+f.width+'px!important;height:auto!important}.report-screen .slide{width:'+f.width+'px!important;height:'+f.height+'px!important;break-inside:avoid;break-after:page}.report-screen .slide:last-child{break-after:auto}.report-primary-tabs{display:none!important}}';}
root.DocutFrame={PRESETS,normalize,activate,within,groups,hashFor,indexForHash,changePlan,accept,printCSS};
if(typeof module!=='undefined'&&module.exports)module.exports=root.DocutFrame;
})(typeof globalThis!=='undefined'?globalThis:this);
