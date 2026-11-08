(function(root){
'use strict';
/**
 * STR-02: Greenline global-markets editorial grammar.
 * 16:9 independently drawn structures informed by a public 2026 wealth report.
 * No publisher logos, source photography, original maps or numerical exhibits.
 */
const C=root.DocutCore;
if(!C)throw Error('DoCut core is required for market report pack');
const GREEN='#177D59',BRIGHT='#1EBF68',LIME='#82ED7D',INK='#26342E',NAVY='#16324D',WHITE='#FFFFFF',SMOKE='#F5F7F5',TINT='#E9F4ED',GREY='#607067',LINE='#D4DDD6',SEA='#173B65';
const CHART_STYLE='emerald-market';
C.CHART_PALETTES={...(C.CHART_PALETTES||{}),[CHART_STYLE]:[GREEN,BRIGHT,LIME,'#8BAA9A','#247951','#B1D9BC']};
const TABS=['시장 재편','지역별 비교','자산·성장 지표','시장 성장동인','위험·불확실성','우선 실행'];
function buildPage(index,colors={},choice='original'){
 const n=Number(index);
 if(!Number.isInteger(n)||n<0||n>=6)throw Error('존재하지 않는 글로벌 시장 분석 페이지');
 const alternative=choice!=='original';
 const accent=alternative?colors.accent||GREEN:GREEN;
 const vivid=alternative?colors.accent||BRIGHT:BRIGHT;
 const fg=alternative?colors.fg||INK:INK;
 const soft=alternative?colors.muted||TINT:TINT;
 const bg=alternative?colors.bg||WHITE:n===0?SEA:WHITE;
 const pale=alternative?colors.card||SMOKE:SMOKE;
 const quiet=alternative?'#68717A':GREY;
 const stroke=alternative?accent:LINE;
 const blocks=[];
 function add(type,x,y,w,h,value='',style={},data=null){
  const overrides={w,h,text:value,effects:[],locked:false,hidden:false,verified:false,source:'',evidence:'',unit:'',asOfDate:'',style:{
   font:'Arial',size:20,weight:400,color:fg,background:'transparent',
   radius:0,shadow:0,align:'left',opacity:1,lineHeight:1.24,letterSpacing:0,borderWidth:0,...style}};
  if(data)overrides.data=data;
  const block=C.normalizeBlock(C.makeBlock(type,x,y,overrides));
  blocks.push(block);return block;
 }
 const rect=(x,y,w,h,color=accent,opacity=1)=>add('shape',x,y,w,h,'',{background:color,opacity});
 const circle=(x,y,w,h,color=soft,opacity=1)=>add('shape',x,y,w,h,'',{background:color,mask:'ellipse',opacity,radius:70});
 const t=(x,y,w,h,v,size=21,color=fg,weight=400,opts={})=>add('text',x,y,w,h,v,{size,color,weight,...opts});
 const title=(x,y,w,h,v,size=50,color=fg,opts={})=>add('title',x,y,w,h,v,{size,color,weight:400,lineHeight:1.1,...opts});
 const chart=(x,y,w,h,k='bar',caption='엑셀 시트 연결 · 값 미입력')=>add(k,x,y,w,h,caption,
  {size:17,color:fg,background:bg,shadow:0,radius:0,borderWidth:1,borderColor:stroke},
  {labels:['권역 A','권역 B','권역 C','권역 D'],values:[0,0,0,0],palette:CHART_STYLE,unit:''});
 const table=(x,y,w,h,rows,caption='자료를 입력하세요')=>add('table',x,y,w,h,caption,
  {size:15,color:fg,background:bg,shadow:0,radius:0},{rows,cells:[]});
 function header(n,label){
  rect(65,40,1150,5,LIME);
  t(65,60,930,25,label,14,accent,800,{letterSpacing:1.5});
  t(1050,60,163,23,'INSIGHT '+String(n).padStart(2,'0'),13,quiet,600,{align:'right'});
 }
 function footer(n,msg='출처·통계 정의·기준 연도를 확인하세요 / 수치 미입력'){
  rect(64,662,1150,1,stroke);
  t(65,674,980,19,msg,12,quiet,400);
  t(1071,674,145,20,String(n).padStart(2,'0')+'  /  06',12,quiet,700,{align:'right'});
 }
 switch(n){
  case 0:{
   // Coastal report energy, but independent flat-vector seascape.
   rect(0,453,1280,267,'#16375F');
   rect(0,529,1280,191,'#245680');
   rect(0,614,1280,106,'#327B9E');
   rect(0,678,1280,42,'#63A2B3');
   rect(0,452,1280,3,'#7BB7C5',.55);
   circle(949,161,248,248,'#6997BF',.48);
   circle(1048,93,118,118,'#9CC2D7',.64);
   rect(882,404,2,210,'#8CC4CD');
   rect(928,426,2,190,'#9DCBD0');
   rect(973,385,2,235,'#75AEBE');
   // Independent title panel, characteristic thin fluorescent top rule.
   rect(66,68,780,430,WHITE);
   rect(66,68,780,8,LIME);
   t(102,106,645,30,'GLOBAL MARKET INTELLIGENCE',17,accent,800,{letterSpacing:1.8});
   t(102,143,650,26,'시장·자산·성장 연구 보고서',16,quiet,500);
   title(95,217,698,197,'변화의 지도를\n다시 읽다',76,INK,{font:'Arial',weight:400});
   rect(104,424,72,4,accent);
   t(105,448,625,28,'데이터 기준일·작성자 입력',16,quiet,500);
   t(69,562,820,42,'FORECASTS  /  MARKET DRIVERS  /  DECISIONS',16,WHITE,700,{letterSpacing:1.7});
   t(69,652,740,35,'독립 벡터 커버 · 사진·로고 사용 없음',14,'#CFEBF2',500);
   break;
  }
  case 1:{
   header(2,'GEOGRAPHIC REALLOCATION');
   title(65,113,1080,114,'지역별 자산 흐름은\n같은 방향으로 움직이지 않습니다',45);
   t(65,253,1080,43,'권역별 비교에서는 성장률·기준통화·집계 범위를 분리하세요.',20,quiet);
   rect(65,324,7,258,accent);
   t(95,339,450,95,'어디에서\n변화가 시작되는가',37,vivid,400,{lineHeight:1.2});
   t(95,465,429,93,'비교 권역·통화·시점을 입력하고\n성장 구간을 검토하세요.',19,quiet);
   chart(574,322,617,282,'bar','권역별 비교 · 업로드 데이터');
   t(575,617,595,31,'데이터 선택 → 기준통화 통일 → 권역별 집계',15,accent,700);
   footer(2);
   break;
  }
  case 2:{
   header(3,'EXHIBIT / FINANCIAL GROWTH');
   t(65,111,200,30,'EXHIBIT 02',18,accent,800);
   title(65,151,1066,100,'동일 기준으로 비교한 데이터가\n시장 재편의 방향을 보여줍니다',39);
   chart(65,273,606,315,'bar','시장별 증감 · 엑셀 표 연동');
   rect(708,276,2,306,stroke);
   table(744,281,445,292,[
    ['항목','기준','비교','증감'],
    ['영역 A','—','—','—'],
    ['영역 B','—','—','—'],
    ['영역 C','—','—','—']
   ],'원자료와 증감');
   t(745,595,449,30,'출처 / 기간 / 통화 단위는 표와 차트에서 동일해야 합니다.',13,quiet);
   footer(3);
   break;
  }
  case 3:{
   header(4,'STRUCTURAL DRIVERS');
   title(65,113,1090,105,'시장을 바꾸는 네 가지 흐름',53);
   t(65,233,1114,40,'산발적인 숫자 대신 성장 동인의 인과 경로와 대응 선택을 분리합니다.',19,quiet);
   const factors=[
    ['01','지리적 이동','성장 지역·거점 변화'],
    ['02','고객군의 확대','서비스 접근성·세분화'],
    ['03','세대 간 이전','소유·의사결정 변화'],
    ['04','운영 기술','자동화·생산성 전환']
   ];
   factors.forEach((f,j)=>{
    const x=65+j*288;
    rect(x,311,264,5,j%2?vivid:accent);
    t(x,344,234,34,f[0],20,accent,800);
    t(x,394,251,44,f[1],29,fg,700);
    rect(x,460,251,2,stroke);
    t(x,479,245,105,f[2]+'\n\n자료·가정 입력',17,quiet,400,{lineHeight:1.3});
    if(j<3)rect(x+273,348,1,245,stroke);
   });
   footer(4);
   break;
  }
  case 4:{
   header(5,'RISK / EXPOSURE MATRIX');
   title(65,111,1080,86,'성장 기회만큼 중요한 노출 위험',47);
   t(66,211,1100,38,'위험도·확률을 임의로 채우지 않고, 대응 조건을 명시하는 구조입니다.',19,quiet);
   // Geometric risk matrix with explicit qualitative blanks, no fabricated percentages.
   const names=['시장 변동성','유동성','규제 변화','고객 집중','기술 이행','공급망'];
   names.forEach((name,j)=>{
    const x=65+(j%3)*387,y=287+Math.floor(j/3)*151;
    rect(x,y,364,132,j%2===0?soft:pale);
    rect(x,y,8,132,j<3?accent:vivid);
    t(x+29,y+21,316,33,name,24,fg,700);
    t(x+29,y+73,304,39,'영향도 / 대응계획 입력',17,quiet,400);
   });
   footer(5);
   break;
  }
  case 5:{
   header(6,'ACTIONS / PRIORITIES');
   title(65,114,1083,88,'우선순위를 결정하고 실행으로 옮기다',46);
   t(65,214,1093,41,'다음 검토에서 무엇이 바뀌어야 하는지 관찰 가능한 지표로 연결합니다.',19,quiet);
   const outcomes=[
    ['FOCUS 01','핵심 시장 선택','근거와 제외 기준 입력'],
    ['FOCUS 02','상품·서비스 재설계','고객군과 경제성 검토'],
    ['FOCUS 03','조직·운영 정렬','담당자와 시간표 확정']
   ];
   outcomes.forEach((r,j)=>{
    const y=302+j*103;
    rect(65,y,1148,1,stroke);
    rect(65,y+17,9,64,j===0?LIME:accent);
    t(96,y+18,165,34,r[0],16,accent,800,{letterSpacing:1});
    t(276,y+14,460,44,r[1],26,fg,700);
    t(774,y+18,409,42,r[2],19,quiet,400);
   });
   rect(66,620,1147,4,LIME);
   t(65,636,1050,25,'출처 · 실행 책임 · 기준일 입력 후 확정하세요.',14,quiet,600);
   footer(6,'전략 실행 프레임 / 계획 수치·일정은 확정 전');
   break;
  }
 }
 if(blocks.length>120)throw Error('편집 요소 한도 초과');
 return {id:C.uid('page'),tab:TABS[n],customTab:true,headline:TABS[n],subtitle:'자체 편집 가능한 시장 분석 구조 / 수치·출처 미입력',background:bg,layout:'blank',transition:'none',elements:blocks};
}
const api={CHART_STYLE,TABS,buildPage,buildPack:(colors={},choice='original')=>TABS.map((_,i)=>buildPage(i,colors,choice))};
root.DocutEditorialBCG=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
