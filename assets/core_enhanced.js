(function(root){
'use strict';
const C=root.DocutCore;
if(!root.DocutStoryPlayer&&typeof module!=='undefined'&&module.exports)require('./story_player.js');
if(!C)throw Error('Base project module missing');
const original={makeBlock:C.makeBlock,makeEffect:C.makeEffect,createPage:C.createPage,createProject:C.createProject,normalizeBlock:C.normalizeBlock};
C.VERSION='0.45.0-development';
C.THEMES.push({id:'slate',name:'Slate Neutral',hint:'Low-saturation dark reports',color:'#68798d'}, {id:'mint',name:'Mint Soft',hint:'Accessible green emphasis',color:'#6f9f88'});
C.STORY_MODES={
 strategy:['핵심 요약','추진 배경','현황 및 진단','근거와 사례','대안 비교','권고 및 실행','추진 일정','의사결정'],
 policy:['제도 검토 요약','도입 배경','현행 제도','직원 영향','유사 제도 비교','개선 제안','이행 계획','의견 수렴'],
 quarterly:['분기 주요 성과','목표 대비 실적','성과 원인','부문별 실적','증감·편차 분석','위험과 기회','다음 분기 우선과제','실행 계획'],
 research:['연구 요약','연구 배경','분석 방법','핵심 결과','해석과 한계','개선 시사점','실행 과제','추가 검토'],
 comparison:['결론 및 선택안','비교 기준','대안 A','대안 B','비용·편익 비교','위험 요인','권고 대안','실행 계획']
};
C.STORY_ARCS={
 strategy:{1:['핵심 결론'],2:['핵심 요약','실행 방안'],3:['핵심 요약','현황과 문제','개선 방안'],4:['핵심 요약','현황 진단','대안 비교','권고 및 실행'],5:['핵심 요약','현황 및 진단','원인 분석','대안 비교','실행 방안'],6:['핵심 요약','추진 배경','현황 진단','근거와 사례','대안 비교','결론 및 실행']},
 policy:{1:['제도 검토 결론'],2:['현행 제도 문제','개선 제안'],3:['회사안 요약','외부 사례 비교','개선 의견'],4:['핵심 요약','제도 현황','영향과 위험','개선안'],5:['검토 요약','회사안 요약','피해·영향 분석','외부 사례','개선·실행안'],6:['검토 요약','도입 배경','회사안 분석','직원 영향','사례 및 대안','개선·의견 수렴']},
 quarterly:{1:['분기 결론'],2:['분기 실적 요약','다음 분기 과제'],3:['주요 성과','실적 편차 분석','다음 분기 계획'],4:['주요 성과','목표 대비 실적','부문별 원인','다음 분기 과제'],5:['핵심 성과','목표 대비 실적','성과 원인','위험·기회','실행 계획'],6:['핵심 성과','재무 실적','사업별 성과','증감 분석','위험과 기회','향후 계획']},
 research:{1:['연구 결론'],2:['연구 문제','결과 및 시사점'],3:['연구 배경','핵심 분석','해석과 시사점'],4:['연구 요약','방법 및 자료','핵심 결과','의미와 한계'],5:['연구 요약','문제 정의','분석 설계','결과와 근거','시사점'],6:['연구 요약','현황·질문','자료·방법','핵심 결과','해석·한계','실행 시사점']},
 comparison:{1:['선택안 요약'],2:['비교 기준','권고 대안'],3:['비교 기준','대안별 장단점','권고안'],4:['핵심 결론','비교 기준','대안 비교','최종 권고'],5:['요약 및 판단','선정 기준','대안별 성과','위험·비용 비교','최적안 및 실행'],6:['선택안 요약','목표 및 기준','대안 A','대안 B','비용·위험 분석','권고 및 실행']}
};
C.storyLabels=(mode,count)=>{const base=C.STORY_MODES[mode]||C.STORY_MODES.strategy;return C.STORY_ARCS[mode]?.[count]||base.slice(0,count);};
C.LAYOUTS={
 hero:'Hero with conclusion',two:'Two columns',three:'Three cards',chart:'Chart and insight',comparison:'Comparison matrix',timeline:'Milestones',blank:'Blank page'
};
const TYPES=['title','text','card','kpi','bar','line','donut','table','shape','note','image','bullet','quote','divider','source','stat'];
const extras={
 bullet:{w:790,h:228,text:'01  Key finding\n02  Supporting observation\n03  Implication',style:{size:25,weight:550}},
 quote:{w:870,h:190,text:'A clear conclusion belongs here.',style:{size:31,weight:700,background:'#ffffff',radius:18,shadow:25}},
 divider:{w:740,h:5,text:'',style:{background:'#9f998c',radius:2}},
 source:{w:680,h:60,text:'Source: enter date, publisher, and URL',style:{size:15,weight:400,color:'#666666'}},
 stat:{w:590,h:330,text:'통계 차트 · 원자료 입력 필요',style:{size:18,weight:500,background:'#ffffff',color:'#263747',radius:18,shadow:22}}
};
const finite=(v,lo,hi,fallback)=>{const n=Number(v);return Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):fallback};
const text=(v,max=20000)=>String(v==null?'':v).slice(0,max);
const cleanColor=v=>typeof v==='string'&&(/^(#[0-9a-f]{3,8}|transparent)$/i.test(v)||/^rgba?\([\d.,\s%]+\)$/i.test(v))?v:null;
const validDate=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+'T00:00:00Z'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
C.validDate=validDate;
const validMedia=v=>typeof v==='string'&&/^data:image\/(png|jpeg|webp);base64,[\w+/=]+$/i.test(v)&&v.length<=8e6;
const fontNames=['Pretendard','Noto Sans KR','Nanum Gothic','Nanum Myeongjo','Noto Serif KR','SUIT','Gmarket Sans','Arial','Georgia','system-ui'];
C.makeEffect=(kind='fade',duration=700,delay=0)=>({...original.makeEffect(kind,duration,delay),easing:'cubic-bezier(.22,1,.36,1)',keyframes:[]});
C.makeBlock=(kind,x,y,overrides={})=>{const type=TYPES.includes(kind)?kind:'text';let result=original.makeBlock(extras[type]?'text':type,x,y);if(extras[type]){
 const base=extras[type];result={...result,type,w:base.w,h:base.h,text:base.text,style:{...result.style,...base.style}};
}
if(type==='stat')result.data={kind:'cohort',rows:[],limits:{},palette:'default'};
return {...result,locked:false,hidden:false,groupId:null,source:'',asOfDate:'',unit:'',evidence:'',verified:false,richText:[],...overrides};};
C.createPage=(index=0,total=5,mode='strategy')=>{
 const pg=original.createPage(index,total);const list=C.storyLabels(mode,total);
 const label=(list[index]||'Additional analysis');pg.tab=label;pg.headline=label;pg.layout='hero';pg.transition='fade';pg.playbackMs=12000;pg.captions=[];pg.captionStyle='cinema';
 const title=pg.elements.find(el=>el.type==='title');if(title)title.text=label;
 pg.elements=pg.elements.map(el=>C.makeBlock(el.type,el.x,el.y,{...el,effects:(el.effects||[]).map(C.normalizeEffect)}));return pg;
};
C.createProject=(total=5,mode='strategy')=>{
 const num=finite(total,1,8,5);return {schema:3,appVersion:C.VERSION,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),title:'New report',theme:'wood',storyType:mode in C.STORY_MODES?mode:'strategy',master:{footer:'',logo:'',pageNumbers:true},pages:Array.from({length:num},(_,i)=>C.createPage(i,num,mode)),reviews:[]};
};
C.normalizeEffect=raw=>{
 const e=raw&&typeof raw==='object'?raw:{};if(Array.isArray(e.keyframes)&&e.keyframes.length>4)throw Error('Motion has more than 4 keyframes; edit them before importing');const kind=C.EFFECTS.some(pair=>pair[0]===e.kind)?e.kind:'fade';
 const bezier=/^cubic-bezier\(\s*(?:-?\d*\.?\d+\s*,\s*){3}-?\d*\.?\d+\s*\)$/.test(e.easing||'')?e.easing:'cubic-bezier(.22,1,.36,1)';
 return {...C.makeEffect(kind,finite(e.duration,100,4000,700),finite(e.delay,0,10000,0)),easing:bezier,keyframes:(Array.isArray(e.keyframes)?e.keyframes:[]).slice(0,4).map(k=>({at:finite(k.at,0,1,0.5),x:finite(k.x,-1000,1000,0),y:finite(k.y,-1000,1000,0),scale:finite(k.scale,0.01,8,1),rotate:finite(k.rotate,-360,360,0),rotateX:finite(k.rotateX,-85,85,0),rotateY:finite(k.rotateY,-85,85,0),opacity:finite(k.opacity,0,1,1),blur:finite(k.blur,0,60,0),brightness:finite(k.brightness,0,4,1)})).sort((a,b)=>a.at-b.at),start:normalPose(e.start),end:normalPose(e.end)};
};
function normalPose(p){if(!p||typeof p!=='object')return null;return {x:finite(p.x,-1000,1000,0),y:finite(p.y,-1000,1000,0),scale:finite(p.scale,0.01,8,1),rotate:finite(p.rotate,-360,360,0),rotateX:finite(p.rotateX,-85,85,0),rotateY:finite(p.rotateY,-85,85,0),opacity:finite(p.opacity,0,1,1),blur:finite(p.blur,0,60,0),brightness:finite(p.brightness,0,4,1)};}
C.normalizeBlock=raw=>{
 if(!raw||typeof raw!=='object')throw Error('Malformed native element; no content was imported');if(raw.type&&!TYPES.includes(raw.type))throw Error('Unsupported native element type '+String(raw.type).slice(0,60)+'; no data was silently converted');const type=TYPES.includes(raw.type)?raw.type:'text';
 // Reject native data that cannot be represented faithfully; never silently truncate it.
 if(String(raw.text??'').length>12000)throw Error('Element text exceeds 12000 characters; split into separate blocks before importing');
 if(Array.isArray(raw.effects)&&raw.effects.length>3)throw Error('Element has more than 3 motion effects; import cancelled to prevent effect loss');
 if(raw.data&&['bar','line','donut'].includes(type)){
  const d=raw.data;const limit=raw.dataBinding&&['bar','line'].includes(type)?360:12;if((Array.isArray(d.labels)&&d.labels.length>limit)||(Array.isArray(d.values)&&d.values.length>limit))throw Error('Chart exceeds '+limit+' data points; import cancelled to prevent missing values');
  if(Array.isArray(d.labels)&&d.labels.some(v=>String(v).length>50))throw Error('Chart label exceeds 50 characters');
  if(Array.isArray(d.labels)&&Array.isArray(d.values)&&d.labels.length!==d.values.length)throw Error('Chart label and value counts differ; no data was silently skipped');
  if(Array.isArray(d.values)&&d.values.some(v=>(typeof v!=='number'&&typeof v!=='string')||String(v).trim()===''||!Number.isFinite(Number(v))))throw Error('Chart contains a non-numeric value; review the source');
  if(Array.isArray(d.values)&&d.values.some(v=>Math.abs(Number(v))>1e9))throw Error('Chart value exceeds the supported -1e9 to 1e9 range; it must not be clipped');
  if(type==='donut'&&Array.isArray(d.values)&&d.values.some(v=>Number(v)<0))throw Error('Donut chart cannot represent negative values');
  if(String(d.unit||'').length>20)throw Error('Chart unit exceeds 20 characters; edit it before importing');
 }
 if(type==='table'&&raw.data){const d=raw.data;
  if((Array.isArray(d.rows)&&d.rows.length>24)||(Array.isArray(d.cells)&&d.cells.length>24)||(d.rows||[]).some(row=>Array.isArray(row)&&row.length>10)||(d.cells||[]).some(row=>Array.isArray(row)&&row.length>10))throw Error('Table exceeds 24 rows or 10 columns; import cancelled to prevent missing cells');
  if((d.rows||[]).some(row=>Array.isArray(row)&&row.some(value=>String(value??'').length>400)))throw Error('Table cell exceeds 400 characters; import cancelled to prevent truncated text');
 }

 if(type==='stat'&&!root.DocutStatCharts)throw Error('Statistical chart module is missing');
 if(raw.asOfDate&&!validDate(raw.asOfDate))throw Error('Invalid basis date (YYYY-MM-DD); existing evidence must not be silently cleared');
 const seed=original.normalizeBlock({...raw,type:extras[type]?'text':type});if(!seed)return null;
 seed.type=type;
 seed.style={...seed.style,
  backgroundOpacity:finite(raw.style?.backgroundOpacity,0,1,1),
  fxLightColor:/^#[0-9a-f]{6}$/i.test(raw.style?.fxLightColor||'')?raw.style.fxLightColor:'#71aeff',
  fxGlowStrength:finite(raw.style?.fxGlowStrength,0,1,.7),
  fxGlowRadius:finite(raw.style?.fxGlowRadius,80,500,220),
  fxTiltStrength:finite(raw.style?.fxTiltStrength,0,18,6.5),
  fxEdgeSpeed:finite(raw.style?.fxEdgeSpeed,2,14,6),
  borderColor:cleanColor(raw.style?.borderColor)||'#000000',borderWidth:finite(raw.style?.borderWidth,0,16,0),
  letterSpacing:finite(raw.style?.letterSpacing,-4,18,0),lineHeight:finite(raw.style?.lineHeight,0.8,3,1.3),
  mask:['none','circle','ellipse','diamond','rounded'].includes(raw.style?.mask)?raw.style.mask:'none',
  imageFit:['cover','contain','fill'].includes(raw.style?.imageFit)?raw.style.imageFit:'cover',
  focusX:finite(raw.style?.focusX,0,100,50),focusY:finite(raw.style?.focusY,0,100,50),
  cropZoom:finite(raw.style?.cropZoom,1,4,1),aspectLock:raw.style?.aspectLock===true
 };
 if(extras[type]&&!raw.style)seed.style={...seed.style,...extras[type].style};
 seed.x=finite(raw.x,0,C.WIDTH-40,0);seed.y=finite(raw.y,0,C.HEIGHT-30,0);
 seed.w=finite(raw.w,type==='shape'?1:40,C.WIDTH-seed.x,Math.min(C.WIDTH-seed.x,extras[type]?.w||640));seed.h=finite(raw.h,type==='shape'?1:4,C.HEIGHT-seed.y,Math.min(C.HEIGHT-seed.y,extras[type]?.h||180));
 if(String(raw.groupLabel??'').length>80)throw Error('Layer group label exceeds 80 characters; no label was silently clipped');
 seed.locked=!!raw.locked;seed.hidden=!!raw.hidden;seed.groupId=typeof raw.groupId==='string'?text(raw.groupId,80):null;seed.groupLabel=seed.groupId?text(raw.groupLabel,80):'';
 seed.source=text(raw.source,2000);seed.asOfDate=validDate(raw.asOfDate)?raw.asOfDate:'';seed.unit=text(raw.unit,40);seed.evidence=text(raw.evidence,1500);seed.verified=raw.verified===true;seed.notes=text(raw.notes,1500);
 if(Array.isArray(raw.richText)&&raw.richText.length>60)throw Error('Rich text exceeds 60 formatting runs; split the block before importing');
 if(Array.isArray(raw.richText)&&raw.richText.some(r=>String(r?.text??'').length>1000))throw Error('Rich text run exceeds 1000 characters; no formatting content may be silently dropped');
 for(const [key,limit] of [['source',2000],['unit',40],['evidence',1500],['notes',1500]])if(String(raw[key]??'').length>limit)throw Error('Element '+key+' exceeds '+limit+' characters; edit it before importing');
 seed.richText=(Array.isArray(raw.richText)?raw.richText:[]).map(run=>({text:text(run.text,1000),bold:!!run.bold,normalWeight:!!run.normalWeight,italic:!!run.italic,underline:!!run.underline,color:cleanColor(run.color)||null,highlight:cleanColor(run.highlight)||null,...(run.font!==undefined?{font:root.DocutBranding?.FONTS?.includes(run.font)?run.font:(()=>{throw Error('Unsupported rich text font')})()}:{}),...(run.size!==undefined?{size:(Number.isFinite(run.size)&&run.size>=10&&run.size<=100)?run.size:(()=>{throw Error('Rich text font size out of range')})()}:{} )}));
 seed.effects=(Array.isArray(raw.effects)?raw.effects:[]).slice(0,3).map(C.normalizeEffect);
 // Separate leave cue: never play an exit during the incoming scene.
 if(raw.exitOnNext!=null&&!Array.isArray(raw.exitOnNext))throw Error('Exit cue must be an effect list');
 seed.exitOnNext=(Array.isArray(raw.exitOnNext)?raw.exitOnNext:[]).slice(0,3).map(C.normalizeEffect);
 if(type==='stat'){seed.data=root.DocutStatCharts.normalize(raw.data||{kind:'cohort',rows:[]});if(!seed.source.trim()||!seed.data.rows.length||(seed.data.kind==='control'&&!['lower','center','upper'].every(name=>Number.isFinite(seed.data.limits?.[name]))))seed.verified=false;}
 else if(['bar','line','donut'].includes(type)){
  const d=raw.data||{},limit=raw.dataBinding&&['bar','line'].includes(type)?360:12;const labels=(Array.isArray(d.labels)?d.labels:['A','B']).slice(0,limit).map(v=>text(v,50));const values=(Array.isArray(d.values)?d.values:[0,0]).slice(0,limit).map(v=>finite(v,type==='donut'?0:-1e9,1e9,0));
  seed.data={labels,values,palette:Object.prototype.hasOwnProperty.call(C.CHART_PALETTES||{},d.palette)?d.palette:'default',unit:text(d.unit,20)};
 }else if(type==='table'){
  const d=raw.data||{};seed.data={rows:(Array.isArray(d.rows)?d.rows:[]).slice(0,24).map(row=>(Array.isArray(row)?row:[]).slice(0,10).map(v=>text(v,400))),cells:(Array.isArray(d.cells)?d.cells:[]).slice(0,24).map(row=>(Array.isArray(row)?row:[]).slice(0,10).map(v=>({color:cleanColor(v?.color)||null,background:cleanColor(v?.background)||null,bold:!!v?.bold,align:['left','center','right'].includes(v?.align)?v.align:'left'})))};
  if(!seed.data.rows.length)seed.data.rows=[['Item','Value'],['A','']];
 }else if(type==='image'){
  seed.data={src:validMedia(raw.data?.src)?raw.data.src:'',alt:text(raw.data?.alt,300)};
  const width=Number(raw.data?.width),height=Number(raw.data?.height);
  if(Number.isInteger(width)&&Number.isInteger(height)&&width>0&&height>0&&width<=20000&&height<=20000&&width*height<=80000000){seed.data.width=width;seed.data.height=height;}
 }else if(type==='shape'||type==='note'||extras[type]){delete seed.data;}
 return seed;
};
C.normalizeProject=raw=>{
 if(!raw||typeof raw!=='object'||!Array.isArray(raw.pages))throw Error('Invalid DoCut project');
 if(raw.pages.length>50||raw.pages.length<1)throw Error('Page count must be 1-50');
 const seen=new Set();const pages=raw.pages.map((pg,i)=>{
  if(!pg||typeof pg!=='object')throw Error('Malformed page');
  if(!Array.isArray(pg.elements))throw Error('Page '+(i+1)+' is missing its elements array; refusing to clear content silently');
  if(typeof pg.id==='string'&&pg.id.length>=100)throw Error('Page ID exceeds 99 characters; no ID was silently replaced');
  const id=typeof pg.id==='string'&&pg.id?pg.id:C.uid('page');if(seen.has(id))throw Error('Duplicate page ID '+id+'; resolve identity before import');seen.add(id);
  if(Array.isArray(pg.elements)&&pg.elements.length>120)throw Error('Page '+(i+1)+' has over 120 elements; import cancelled to prevent silent data loss');
  const els=(Array.isArray(pg.elements)?pg.elements:[]).map(C.normalizeBlock).filter(Boolean);
  for(const el of els){if(seen.has(el.id))throw Error('Duplicate element ID '+el.id+'; resolve identity before import');seen.add(el.id);}
  const ST=root.DocutStoryPlayer;if(!ST)throw Error('Story playback module missing');
  const playbackMs=ST.duration(pg.playbackMs),captions=ST.validateCaptions(pg.captions,playbackMs);
  if(pg.captionStyle!==undefined&&pg.captionStyle!==null&&!ST.STYLES.includes(pg.captionStyle))throw Error('Unsupported caption presentation style; importing would alter original appearance');
  const f=pg.referenceFidelity,allowedUBSPages=[5,8,11,13,16,18];
  const verifiedGraphics={5:99.7851,8:99.8434,11:99.5997,13:99.5295,16:99.3850,18:99.4055};
  const isUBS=f&&f.mode==='source-ratio'&&f.sourceEdition==='2025'&&allowedUBSPages.includes(f.sourcePage);
  const vectorEdits={};
  if(isUBS&&f.vectorEdits!==undefined){
    if(!f.vectorEdits||typeof f.vectorEdits!=='object'||Array.isArray(f.vectorEdits))throw Error('UBS vector edits must be an object');
    const keys=Object.keys(f.vectorEdits);
    if(keys.length>600)throw Error('UBS vector edits exceed the supported 600 shapes per page');
    for(const index of keys){
      if(!/^(0|[1-9]\d{0,4})$/.test(index))throw Error('UBS vector shape index is invalid');
      const raw=f.vectorEdits[index],out={};
      if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('UBS vector shape edit is invalid');
      for(const [key,value] of Object.entries(raw)){
        if(key==='fill'||key==='stroke'){
          if(!/^#[0-9a-f]{6}$/i.test(value))throw Error('UBS vector color must be six-digit hex');
          out[key]=value;
        }else if(key==='hidden'){
          if(typeof value!=='boolean')throw Error('UBS vector visibility must be boolean');
          out[key]=value;
        }else if(Object.prototype.hasOwnProperty.call({opacity:1,strokeWidth:1,dx:1,dy:1},key)){
          const bounds=key==='opacity'?[0,1]:key==='strokeWidth'?[0,10]:[-200,200];
          if(typeof value!=='number'||!Number.isFinite(value)||value<bounds[0]||value>bounds[1])throw Error('UBS vector edit is outside valid range');
          out[key]=value;
        }else throw Error('Unsupported UBS vector edit property: '+key);
      }
      if(Object.keys(out).length)vectorEdits[index]=out;
    }
  }
  const referenceFidelity=isUBS?{mode:'source-ratio',sourceEdition:'2025',sourcePage:f.sourcePage,sourceUrl:'https://www.ubs.com/content/dam/assets/wm/static/noindex/gwr-2025-digital.pdf',measuredScore:null,graphicsAuditScore:verifiedGraphics[f.sourcePage],status:'editor_browser_unverified',vectorOnly:true,designVersion:'ubs-source-svg-2025-pilot-3',...(Object.keys(vectorEdits).length?{vectorEdits}:{})}:undefined;
  const designIdentity=typeof pg.designIdentity==='string'&&/^(STR|EARN|CORP|FIN|PUB)-\d{2}$/.test(pg.designIdentity)?pg.designIdentity:null;
  return {id,tab:text(pg.tab||'Page '+(i+1),80),customTab:!!pg.customTab,headline:text(pg.headline||pg.tab,150),subtitle:text(pg.subtitle,500),background:cleanColor(pg.background)||'',layout:C.LAYOUTS[pg.layout]?pg.layout:'hero',transition:C.EFFECT_CATALOG?.normalizeTransition(pg.transition)||'fade',playbackMs,captions,captionStyle:ST.STYLES.includes(pg.captionStyle)?pg.captionStyle:'cinema',elements:els,...(designIdentity?{designIdentity}:{}),...(referenceFidelity?{referenceFidelity}:{})};
 });
 if(raw.reviews!=null&&!root.DocutReviewBoard&&(!Array.isArray(raw.reviews)||raw.reviews.length))throw Error('Review board module missing; refusing to drop review comments');
 const reviews=root.DocutReviewBoard?root.DocutReviewBoard.normalize(raw.reviews):[];
 return {schema:3,appVersion:C.VERSION,createdAt:text(raw.createdAt||new Date().toISOString(),50),updatedAt:new Date().toISOString(),title:text(raw.title||'Imported report',100),theme:C.THEMES.some(t=>t.id===raw.theme)?raw.theme:'wood',storyType:raw.storyType in C.STORY_MODES?raw.storyType:'strategy',master:{footer:text(raw.master?.footer,180),logo:validMedia(raw.master?.logo)?raw.master.logo:'',pageNumbers:raw.master?.pageNumbers!==false},pages,reviews};
};
C.relabelPages=project=>{const story=C.storyLabels(project.storyType,project.pages.length);project.pages.forEach((pg,i)=>{if(!pg.customTab){pg.tab=story[i]||'Additional analysis';pg.headline=pg.tab;const title=pg.elements.find(el=>el.type==='title');if(title)title.text=pg.tab;}});};
C.parseSeries=input=>{
 const raw=String(input??'');if(raw.length>7000)throw Error('Series input exceeds 7000 characters; no values were applied');
 const items=raw.split(/\r?\n|,\s*(?=[^:：=]+[:：=])/).map(x=>x.trim()).filter(Boolean);
 if(items.length>12)throw Error('Chart series exceeds 12 values; edit before applying');
 const pairs=items.map((entry,i)=>{
  const match=entry.match(/^([^:：=]+)[:：=]\s*([-+]?(?:\d+(?:\.\d+)?|\.\d+))\s*$/);
  if(!match)throw Error('Series item '+(i+1)+' needs label: numeric value; no partial update');
  if(match[1].trim().length>50)throw Error('Series label exceeds 50 characters');
  const value=Number(match[2]);if(!Number.isFinite(value)||Math.abs(value)>1e9)throw Error('Series value out of -1e9 to 1e9 range');
  return {label:match[1].trim(),value};
 });
 return {labels:pairs.map(x=>x.label),values:pairs.map(x=>x.value),palette:'default'};
};
C.parseGrid=input=>{
 const raw=String(input??'');if(raw.length>12000)throw Error('Table input exceeds 12000 characters; no cells were applied');
 const lines=raw.split(/\r?\n/);if(lines.at(-1)==='')lines.pop();
 if(lines.length>24)throw Error('Table exceeds 24 rows; no rows were discarded');
 const rows=lines.map((line,i)=>{
  const cells=line.split(line.includes('\t')?'\t':'|');
  if(cells.length>10)throw Error('Table row '+(i+1)+' exceeds 10 columns');
  if(cells.some(value=>value.trim().length>400))throw Error('Table cell exceeds 400 characters; no content was omitted');
  return cells.map(value=>value.trim());
 });
 return {rows};
};
C.appendProject=(target,source)=>{
 const dst=C.normalizeProject(target),src=C.normalizeProject(source);if(dst.pages.length+src.pages.length>50)throw Error('Maximum 50 pages');
 const pageIds=new Map(),elementIds=new Map();
 src.pages.forEach(p=>{const originalPageId=p.id;p.id=C.uid('page');pageIds.set(originalPageId,p.id);const groups=new Map();p.elements.forEach(e=>{elementIds.set(e.id,e.id=C.uid());if(e.groupId){if(!groups.has(e.groupId))groups.set(e.groupId,C.uid('group'));e.groupId=groups.get(e.groupId);}});dst.pages.push(p);});
 if(root.DocutReviewBoard)dst.reviews=root.DocutReviewBoard.importWithRemap(dst.reviews,src.reviews,pageIds,elementIds,C.uid);
 return dst;
};
C.searchProject=(project,query)=>{const q=text(query,200).trim().toLocaleLowerCase();if(!q)return[];const matches=[];project.pages.forEach((pg,pi)=>{
 if((pg.tab+' '+pg.headline).toLocaleLowerCase().includes(q))matches.push({pageIndex:pi,id:null,preview:pg.tab});
 pg.elements.forEach(el=>{const corpus=[el.text,el.source,el.asOfDate,el.unit,el.evidence,...(el.data?.rows||[]).flat(),...(el.data?.labels||[]),...(el.type==='stat'?[root.DocutStatCharts?.lookup[el.data?.kind]?.name||'']:[])].join(' ');if(corpus.toLocaleLowerCase().includes(q))matches.push({pageIndex:pi,id:el.id,preview:text(corpus,130)})});
 });return matches.slice(0,150);
};
function luminance(hex){if(!/^#[0-9a-f]{6}$/i.test(hex||''))return null;const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=0.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));return 0.2126*rgb[0]+0.7152*rgb[1]+0.0722*rgb[2];}
C.contrastRatio=(foreground,background)=>{const a=luminance(foreground),b=luminance(background);return a==null||b==null?null:(Math.max(a,b)+.05)/(Math.min(a,b)+.05);};
C.auditProject=project=>{const issues=[];project.pages.forEach((pg,pageIndex)=>pg.elements.forEach(el=>{
 if(el.hidden)return;const s=el.text||'',style=el.style||{};
 if(/(sample|placeholder|enter|insert|\uc785\ub825|\uc0d8\ud50c|\uc608\uc2dc)/i.test(s))issues.push({pageIndex,id:el.id,type:'placeholder',message:'Template/placeholder text'});
 if(['bar','line','donut','kpi','table','stat'].includes(el.type)){
  if(!el.source)issues.push({pageIndex,id:el.id,type:'source',message:'No data source has been recorded'});
  else if(!el.verified)issues.push({pageIndex,id:el.id,type:'verification',message:'Source recorded; data still requires manual verification'});
  if(el.source&&!el.asOfDate)issues.push({pageIndex,id:el.id,type:'basis-date',message:'Source basis date has not been recorded'});
  if(['bar','line','kpi','stat'].includes(el.type)&&!el.unit&&!el.data?.unit)issues.push({pageIndex,id:el.id,type:'unit',message:'Numeric unit has not been recorded'});
 }
 if(el.type==='stat'){for(const message of root.DocutStatCharts.warnings(el.data||{}))issues.push({pageIndex,id:el.id,type:'stat-data',message});}
 if(el.x+el.w>C.WIDTH+1||el.y+el.h>C.HEIGHT+1)issues.push({pageIndex,id:el.id,type:'overflow',message:'Element outside slide'});
 if((el.type==='text'||el.type==='title'||el.type==='quote')&&el.text.length>Math.max(1,el.w/Math.max(style.size||20,12))*Math.max(1,el.h/Math.max(style.size||20,12))*2.1)issues.push({pageIndex,id:el.id,type:'density',message:'Text may be clipped'});
 if(['text','title','card','kpi','bullet','quote','source'].includes(el.type)){
  const ratio=C.contrastRatio(style.color,style.background);if(ratio!=null&&ratio<3)issues.push({pageIndex,id:el.id,type:'contrast',message:'Low text/background contrast; check readability'});
 }
 }));return issues;};
C.applyLayout=(page,layout,preserve=true)=>{
 if(!(layout in C.LAYOUTS))throw Error('Unknown layout');const target=preserve?page.elements:[];
 const positions={hero:[[72,98,1110,105],[72,236,1100,85],[72,355,530,245],[636,355,545,245]],two:[[60,80,1150,100],[60,212,565,420],[660,212,550,420]],three:[[60,75,1150,90],[55,215,350,360],[465,215,350,360],[875,215,350,360]],chart:[[60,75,1150,90],[60,195,740,405],[835,195,375,405]],comparison:[[60,72,1150,100],[60,205,1140,410]],timeline:[[60,80,1150,100],[60,225,355,330],[463,225,355,330],[867,225,355,330]],metrics:[[58,64,1164,100],[55,210,270,250],[355,210,270,250],[655,210,270,250],[955,210,270,250]],split:[[68,78,1150,98],[68,210,490,395],[588,210,618,395]],quadrant:[[68,52,1140,84],[68,169,544,205],[639,169,544,205],[68,397,544,205],[639,397,544,205]],portrait:[[72,65,800,88],[72,191,700,395],[817,191,369,395]],spotlight:[[78,95,1125,105],[180,245,923,270],[78,562,1120,60]],blank:[]}[layout];
 const slot=positions||[];
 // If the content exceeds the template slots, never pile every extra block onto one cell.
 // Use a bounded adaptive grid and retain the editable content and provenance of each block.
 const dense=target.filter(el=>!el.hidden).length>slot.length && layout!=='blank';
 let placements=slot;
 if(dense){const count=target.filter(el=>!el.hidden).length;
  const cols=count>9?4:count>6?3:2,rows=Math.ceil((count-1)/cols),gap=12;
  const h=Math.max(48,(472-gap*(rows-1))/Math.max(1,rows));
  const w=(1150-gap*(cols-1))/cols;
  placements=[[65,56,1150,106],...Array.from({length:count-1},(_,i)=>[65+(i%cols)*(w+gap),192+Math.floor(i/cols)*(h+gap),w,h])];
 }
 let placed=0;
 target.forEach(el=>{if(el.hidden||!placements.length)return;const rect=placements[Math.min(placed++,placements.length-1)];if(!el.locked){[el.x,el.y,el.w,el.h]=rect.map(Math.round);}});
 page.layout=layout;page.elements=target;return page;
};
root.DocutCore=C;
if(typeof module!=='undefined'&&module.exports)module.exports=C;
})(typeof globalThis!=='undefined'?globalThis:this);
