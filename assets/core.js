(function(root){
  'use strict';
  const VERSION = '0.7.0';
  const WIDTH = 1280, HEIGHT = 720;
  const THEMES = [
    {id:'wood',name:'Wood Brown',hint:'차분한 우드 브라운',color:'#b88c61'},
    {id:'consulting',name:'Consulting White',hint:'임원 보고 · 근거 중심',color:'#f2f5fa'},
    {id:'quarterly',name:'Quarterly Indigo',hint:'사업 리뷰 · 분기 실적',color:'#626ee3'},
    {id:'ambient',name:'Ambient Dark',hint:'앰비언트 라이트',color:'#222535'},
    {id:'editorial',name:'Editorial Sand',hint:'절제된 편집형 문서',color:'#d5ccbb'}
  ];
  const EFFECTS = [
    ['none','없음'],['fade','페이드 인'],['rise','아래에서 등장'],['slide-left','왼쪽 등장'],['slide-right','오른쪽 등장'],['zoom','부드러운 확대'],['blur','블러 해제'],['rotate','회전 등장'],['pulse','펄스 강조'],['glow','빛 강조'],['float','플로트 강조'],['exit','페이드 아웃']
  ];
  const STORY = {
    3:['배경 및 목적','핵심 분석','결론 및 제언'],
    4:['현황 진단','핵심 문제','대안 비교','개선 방안'],
    5:['핵심 요약','현황과 배경','문제 및 근거','대안 비교','권고 및 실행'],
    6:['핵심 요약','문제 정의','데이터 분석','외부 사례','대안 및 권고','실행 계획'],
    7:['핵심 요약','배경과 목표','현황 진단','핵심 문제','벤치마크','권고안','실행 및 관리'],
    8:['핵심 요약','문제 정의','현황 분석','원인 검토','외부 사례','대안 비교','실행 계획','기대 효과']
  };
  let _idCount=0;
  function uid(prefix='el'){return prefix+'-'+Date.now().toString(36)+'-'+(++_idCount).toString(36);}
  function clamp(value,min,max){return Math.min(max,Math.max(min,Number(value)||0));}
  function safeText(v,max=20000){return String(v==null?'':v).slice(0,max);}
  function makeEffect(kind='fade',duration=700,delay=0){return {kind,duration,delay};}
  function makeBlock(type,x,y,overrides={}){
    const bases={
      title:{w:900,h:112,text:'제목을 입력하세요',style:{size:55,weight:700,color:'#232930',align:'left'}},
      text:{w:680,h:130,text:'핵심 메시지를 입력하세요. 더블클릭하면 수정할 수 있습니다.',style:{size:23,weight:400,color:'#49515c',align:'left'}},
      card:{w:475,h:240,text:'핵심 관찰\n근거와 시사점을 입력하세요.',style:{size:26,weight:600,color:'#242932',background:'#ffffff',radius:24,shadow:35}},
      kpi:{w:285,h:205,text:'78%\n성과 지표',style:{size:57,weight:700,color:'#28384a',background:'#ffffff',radius:24,shadow:30}},
      bar:{w:455,h:250,text:'지표별 비교 · 샘플 데이터',data:{labels:['A','B','C','D'],values:[42,66,53,82]},style:{size:21,color:'#263747',background:'#ffffff',radius:22,shadow:20}},
      line:{w:455,h:250,text:'추세 분석 · 샘플 데이터',data:{labels:['1월','2월','3월','4월'],values:[24,48,40,83]},style:{size:21,color:'#263747',background:'#ffffff',radius:22,shadow:20}},
      donut:{w:370,h:280,text:'구성 비율 · 샘플 데이터',data:{labels:['A','B','C'],values:[55,30,15]},style:{size:21,color:'#263747',background:'#ffffff',radius:22,shadow:20}},
      table:{w:640,h:270,text:'비교 분석',data:{rows:[['항목','대안 A','대안 B'],['실행 용이성','높음','보통'],['비용 영향','낮음','보통'],['기대 효과','단기','중장기']]},style:{size:20,color:'#243140',background:'#ffffff',radius:18,shadow:20}},
      shape:{w:280,h:110,text:'',style:{background:'#d8aa76',radius:22,opacity:0.8,shadow:10}},
      note:{w:470,h:230,text:'의견을 작성해주세요',style:{size:20,color:'#344152',background:'#fffdfa',radius:18,shadow:20}},
      image:{w:420,h:240,text:'이미지를 추가하세요',data:{src:''},style:{background:'#d9e0e8',radius:18,shadow:10}}
    };
    const def=bases[type]||bases.text;
    return {
      id:uid(),type,x:clamp(x??200,0,WIDTH-50),y:clamp(y??180,0,HEIGHT-30),w:def.w,h:def.h,
      text:def.text,style:{size:22,weight:400,color:'#273444',align:'left',background:'transparent',radius:0,opacity:1,shadow:0,font:'Pretendard',...def.style},
      data:def.data?JSON.parse(JSON.stringify(def.data)):undefined,effects:[makeEffect('rise',650,0)],...overrides
    };
  }
  function createPage(index=0,total=5){
    const labels=STORY[total]||STORY[5]; const tab=labels[Math.min(index,labels.length-1)]||'추가 분석';
    const p={id:uid('page'),tab,customTab:false,headline:tab,subtitle:'핵심 메시지를 한 문장으로 전달합니다.',background:'',elements:[]};
    p.elements.push(makeBlock('title',72,105,{w:1040,h:94,text:tab,effects:[makeEffect('fade',650,80)]}));
    p.elements.push(makeBlock('text',74,216,{w:1070,h:70,text:'근거와 핵심 메시지를 명확하게 정리하세요.',style:{size:27,weight:400,color:'#68717c',align:'left',background:'transparent',radius:0,opacity:1,shadow:0,font:'Pretendard'},effects:[makeEffect('rise',650,220)]}));
    if(index===0){
      p.elements.push(makeBlock('card',74,355,{w:524,h:220,text:'핵심 인사이트\n보고서의 결론을 이곳에 배치하세요.',effects:[makeEffect('fade',620,360),makeEffect('glow',500,150)]}));
      p.elements.push(makeBlock('kpi',635,355,{w:255,h:220,text:'01\n핵심 판단',effects:[makeEffect('zoom',650,430)]}));
      p.elements.push(makeBlock('kpi',925,355,{w:255,h:220,text:'02\n실행 과제',effects:[makeEffect('zoom',650,550)]}));
    }else if(index===1||index===2){
      p.elements.push(makeBlock(index===1?'bar':'line',75,335,{w:530,h:264,effects:[makeEffect('rise',650,330)]}));
      p.elements.push(makeBlock('card',652,335,{w:520,h:264,text:'해석 및 시사점\n수치가 의미하는 바를 간결하게 설명하세요.',effects:[makeEffect('fade',650,500)]}));
    }else if(index===3){
      p.elements.push(makeBlock('table',75,325,{w:790,h:290,effects:[makeEffect('fade',650,280)]}));
      p.elements.push(makeBlock('card',890,325,{w:280,h:290,text:'비교 결론\n대안별 장단점을 판단합니다.',effects:[makeEffect('rise',650,510)]}));
    }else{
      p.elements.push(makeBlock('card',74,337,{w:540,h:245,text:'실행 과제 01\n담당자, 일정, 예상 효과를 기입하세요.'}));
      p.elements.push(makeBlock('card',645,337,{w:540,h:245,text:'실행 과제 02\n의사결정에 필요한 다음 단계를 정리하세요.',effects:[makeEffect('rise',650,280)]}));
    }
    return p;
  }
  function createProject(total=5){
    const count=clamp(total,3,8);
    return {schema:1,appVersion:VERSION,title:'새 보고서',theme:'wood',pages:Array.from({length:count},(_,i)=>createPage(i,count)),updatedAt:new Date().toISOString()};
  }
  function normalizeBlock(raw){
    if(!raw||typeof raw!=='object')return null;
    const allowed=['title','text','card','kpi','bar','line','donut','table','shape','note','image'];
    const type=allowed.includes(raw.type)?raw.type:'text'; const b=makeBlock(type,0,0);
    b.id=typeof raw.id==='string'&&raw.id.length<100?raw.id:uid();
    b.x=clamp(raw.x,0,WIDTH-24);b.y=clamp(raw.y,0,HEIGHT-24);
    b.w=clamp(raw.w,40,WIDTH);b.h=clamp(raw.h,30,HEIGHT);
    b.x=Math.min(b.x,WIDTH-24);b.y=Math.min(b.y,HEIGHT-24);
    b.text=safeText(raw.text,12000);
    const style=raw.style&&typeof raw.style==='object'?raw.style:{};
    b.style={...b.style,size:clamp(style.size??b.style.size,10,100),weight:[300,400,500,600,700,800,900].includes(+style.weight)?+style.weight:600,color:isColor(style.color)?style.color:b.style.color,align:['left','center','right'].includes(style.align)?style.align:'left',background:isColor(style.background)?style.background:b.style.background,radius:clamp(style.radius??b.style.radius,0,80),opacity:clamp(style.opacity??1,0.1,1),shadow:clamp(style.shadow??b.style.shadow,0,80),font:['Pretendard','Noto Sans KR','Nanum Gothic','Nanum Myeongjo','Noto Serif KR','SUIT','Gmarket Sans','Arial','Georgia','system-ui'].includes(style.font)?style.font:'Pretendard'};
    if(type==='bar'||type==='line'||type==='donut'){
      const data=raw.data&&typeof raw.data==='object'?raw.data:{};
      b.data={labels:(Array.isArray(data.labels)?data.labels:[]).slice(0,12).map(v=>safeText(v,36)),values:(Array.isArray(data.values)?data.values:[]).slice(0,12).map(n=>clamp(n,0,1000000))};
      if(!b.data.labels.length||!b.data.values.length)b.data={labels:['A','B','C'],values:[45,65,80]};
    }else if(type==='table'){
      const rows=raw.data&&Array.isArray(raw.data.rows)?raw.data.rows:[];
      b.data={rows:rows.slice(0,20).map(row=>(Array.isArray(row)?row:[]).slice(0,8).map(t=>safeText(t,200)))};
      if(!b.data.rows.length)b.data={rows:[['항목','내용'],['A','설명']]};
    }else if(type==='image'){
      const src=raw.data&&typeof raw.data.src==='string'?raw.data.src:'';
      b.data={src:/^data:image\/(png|jpeg|webp);base64,[\w+/=]+$/i.test(src)&&src.length<3500000?src:''};
    }else{delete b.data;}
    b.effects=(Array.isArray(raw.effects)?raw.effects:[]).slice(0,3).map(e=>({kind:EFFECTS.some(v=>v[0]===e.kind)?e.kind:'fade',duration:clamp(e.duration,100,3000),delay:clamp(e.delay,0,8000)}));
    return b;
  }
  function isColor(v){return typeof v==='string'&&(/^(#[0-9a-fA-F]{3,8}|transparent)$/.test(v)||/^rgba?\([\d.,\s%]+\)$/.test(v));}
  function normalizeProject(raw){
    if(!raw||typeof raw!=='object'||!Array.isArray(raw.pages))throw Error('유효한 DoCut 프로젝트가 아닙니다.');
    if(raw.pages.length>50)throw Error('페이지가 너무 많습니다 (최대 50).');
    const p={schema:1,appVersion:VERSION,title:safeText(raw.title||'불러온 보고서',90),theme:THEMES.some(t=>t.id===raw.theme)?raw.theme:'wood',updatedAt:new Date().toISOString(),pages:raw.pages.map((pg,i)=>({id:typeof pg.id==='string'?pg.id:uid('page'),tab:safeText(pg.tab||'페이지 '+(i+1),80),customTab:!!pg.customTab,headline:safeText(pg.headline,150),subtitle:safeText(pg.subtitle,400),background:isColor(pg.background)?pg.background:'',elements:(Array.isArray(pg.elements)?pg.elements:[]).slice(0,100).map(normalizeBlock).filter(Boolean)}))};
    if(!p.pages.length)p.pages=[createPage(0,3)];
    return p;
  }
  function relabelPages(project){
    const count=project.pages.length; const names=STORY[count]||null;
    project.pages.forEach((page,index)=>{if(!page.customTab){page.tab=names?.[index]||(['핵심 요약','현황 분석','문제 진단','대안 비교','실행 계획'][index]||'추가 분석 '+(index+1));}});
  }
  function clone(obj){return JSON.parse(JSON.stringify(obj));}
  function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function parseSeries(text){
    const pairs=safeText(text,2500).split(/[\n,]/).map(x=>x.trim()).filter(Boolean).slice(0,12).map(x=>{const parts=x.split(/[:：=]/);return {label:safeText(parts[0],36),value:clamp(parts.slice(1).join(':').trim(),0,1000000)};});
    return {labels:pairs.map(p=>p.label),values:pairs.map(p=>p.value)};
  }
  function parseGrid(text){return {rows:safeText(text,4000).split('\n').slice(0,20).map(line=>line.split(/[|\t]/).slice(0,8).map(s=>safeText(s.trim(),200)))};}
  function formatTime(n){return (Math.round(n/100)/10).toFixed(1)+'s';}
  const api={VERSION,WIDTH,HEIGHT,THEMES,EFFECTS,STORY,uid,clamp,safeText,makeEffect,makeBlock,createPage,createProject,normalizeBlock,normalizeProject,relabelPages,clone,escapeHTML,parseSeries,parseGrid,formatTime};
  root.DocutCore=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
