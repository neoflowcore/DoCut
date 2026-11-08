/* DoCut v0.43 - native-only drawing primitives; NOT a shared template layout.
 * Each organization contributes its own independent 6-page composition functions.
 * No externally loaded images, charts, brand logos, or third-party artwork. */
(function(root){
'use strict';
const C=root.DocutCore;
if(!C)throw Error('DocutCore required for reference identities');
const registry=new Map();
const supported=new Set(['title','text','card','kpi','shape','bar','line','donut','table']);
function register(id,config){
 if(!/^(STR|EARN|CORP|FIN|PUB)-\d{2}$/.test(id)||!config||!Array.isArray(config.pages)||config.pages.length!==6)throw Error('Invalid professional report identity');
 if(registry.has(id))throw Error('Duplicate report identity '+id);
 if(!Array.isArray(config.tabs)||config.tabs.length!==6||new Set(config.tabs).size!==6)throw Error('Six distinct page tabs required');
 if(!/^#[0-9a-f]{6}$/i.test(config.bg)||!/^#[0-9a-f]{6}$/i.test(config.fg)||!/^#[0-9a-f]{6}$/i.test(config.accent))throw Error('Invalid identity colors');
 if(!/^[a-z][a-z0-9-]{2,40}$/.test(config.chartKey)||!Array.isArray(config.chartColors)||config.chartColors.length<2||config.chartColors.some(c=>!/^#[0-9a-f]{6}$/i.test(c)))throw Error('Invalid chart palette');
 if(config.pages.some(fn=>typeof fn!=='function'))throw Error('Missing authored composition');
 C.CHART_PALETTES={...(C.CHART_PALETTES||{}),[config.chartKey]:config.chartColors.slice()};
 registry.set(id,Object.freeze({...config,tag:config.tag||id+' / '+config.chartName,tabs:config.tabs.slice(),chartColors:config.chartColors.slice(),pages:config.pages.slice()}));
}
function build(id,index,colors={},choice='original'){
 const p=registry.get(id),i=Number(index);
 if(!p||!Number.isInteger(i)||i<0||i>=6)throw Error('Unknown professional identity page');
 const custom=choice!=='original';
 const state={
  bg:custom?colors.bg||p.bg:p.bg,fg:custom?colors.fg||p.fg:p.fg,
  accent:custom?colors.accent||p.accent:p.accent,
  soft:custom?colors.muted||p.soft:p.soft,
  paper:custom?colors.card||p.paper:p.paper,
  dim:p.dim, ink:p.fg,brand:p.accent,
  font:p.font||'Arial',serif:p.serif||'Georgia',
  chartKey:p.chartKey,page:i,tag:p.tag||'PROFESSIONAL RESEARCH'
 };
 const elements=[];
 function put(type,x,y,w,h,label='',style={},data){
  if(!supported.has(type))throw Error('Unsupported brand page element type '+type);
  for(const [key,v] of Object.entries({x,y,w,h}))if(!Number.isFinite(v))throw Error('Nonfinite '+key+' in '+id);
  if(x<0||y<0||w<1||h<1||x+w>1280||y+h>720)throw Error('Out of canvas '+id+'/'+i+' '+type+' '+[x,y,w,h].join(','));
  if(elements.length>=120)throw Error('Page exceeds 120 elements');
  const options={
   w,h,text:String(label),effects:[],locked:false,hidden:false,verified:false,
   source:'',unit:'',evidence:'',asOfDate:'',
   style:{size:20,weight:400,color:state.fg,background:'transparent',
    align:'left',font:state.font,radius:0,opacity:1,shadow:0,
    lineHeight:1.18,letterSpacing:0,borderWidth:0,...style}
  };
  if(data)options.data=data;
  const block=C.normalizeBlock(C.makeBlock(type,x,y,options));
  if(block.x!==x||block.y!==y||block.w!==w||block.h!==h)throw Error('Block dimensions changed by normalization '+id+' '+type);
  elements.push(block);return block;
 }
 const api={
  get c(){return state;},
  box:(x,y,w,h,color=state.soft)=>put('shape',x,y,w,h,'',{background:color}),
  line:(x,y,w,h=2,color=state.accent)=>put('shape',x,y,w,h,'',{background:color}),
  oval:(x,y,w,h,color=state.soft,opacity=1)=>put('shape',x,y,w,h,'',{background:color,mask:'ellipse',radius:80,opacity}),
  type:(x,y,w,h,s,size=22,color=state.fg,weight=500,extra={})=>put('text',x,y,w,h,s,{size,color,weight,...extra}),
  title:(x,y,w,h,s,size=52,color=state.fg,extra={})=>put('title',x,y,w,h,s,{size,color,weight:700,lineHeight:1.1,...extra}),
  card:(x,y,w,h,s,size=20,color=state.fg,bg=state.paper)=>put('card',x,y,w,h,s,{size,color,background:bg,weight:600,radius:0,shadow:0}),
  metric:(x,y,w,h,caption,value='—',extra={})=>put('kpi',x,y,w,h,String(value)+'\n'+caption,{size:45,color:state.fg,background:state.paper,weight:800,shadow:0,radius:0,...extra}),
  chart:(kind,x,y,w,h,caption='엑셀 데이터 연결 · 기준일 미입력')=>{
   if(!['bar','line','donut'].includes(kind))throw Error('Chart kind unknown');
   return put(kind,x,y,w,h,caption,{size:17,weight:600,color:state.fg,background:state.paper,radius:0,shadow:0},{labels:['기간 A','기간 B','기간 C','기간 D'],values:[0,0,0,0],palette:state.chartKey,unit:''});
  },
  table:(x,y,w,h,rows,caption='실제 데이터 확인 후 입력')=>{
   if(!Array.isArray(rows)||rows.length>24||rows.some(row=>!Array.isArray(row)||row.length>10))throw Error('Table exceeds native editor limits');
   return put('table',x,y,w,h,caption,{size:16,weight:500,color:state.fg,background:state.paper,radius:0,shadow:0},{rows,cells:[]});
  },
  grid:(xs,ys,w,h,fn)=>xs.forEach((x,xi)=>ys.forEach((y,yi)=>fn(x,y,xi,yi,w,h))),
  head:(label='REPORT ANALYSIS',number=i+1)=>{
   api.type(64,38,870,28,label.toUpperCase(),14,state.accent,800,{letterSpacing:1.5});
   api.type(1035,40,179,26,String(number).padStart(2,'0')+'  /  06',13,state.dim,650,{align:'right'});
   api.line(64,79,1150,2,state.accent);
  },
  foot:(note='데이터·단위·기준일·출처 입력 전 / 검증 필요')=>{
   const rgb=(state.bg.match(/[0-9a-f]{2}/gi)||[]).slice(0,3).map(x=>parseInt(x,16));
   const dark=rgb.length===3&&(rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722)<117;
   const ink=dark?'#E1E7E8':state.dim,rule=dark?'#7D969B':state.dim;
   api.line(64,658,1150,1,rule);
   api.type(64,669,1014,20,note,12,ink,400);
   api.type(1122,669,91,20,String(i+1).padStart(2,'0'),12,ink,600,{align:'right'});
  },
  smallLabel:(x,y,w,s)=>api.type(x,y,w,26,s,14,state.accent,800,{letterSpacing:1.2})
 };
 p.pages[i](api);
 if(elements.length<5||!elements.some(e=>e.type==='title'))throw Error('Insufficient distinct editable template blocks '+id+'/'+i);
 const page={id:C.uid('page'),tab:p.tabs[i],customTab:true,
  headline:p.tabs[i],subtitle:'전문 정보 구조 기반 독립 레이아웃 · 원자료 미입력',
  background:state.bg,layout:'blank',transition:'none',elements};
 return page;
}
const api={register,build,has:id=>registry.has(id),get:id=>registry.get(id)||null,ids:()=>[...registry.keys()],palettes:()=>[...registry.values()].map(p=>({id:p.chartKey,name:p.chartName}))};
root.DocutRefArt=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
