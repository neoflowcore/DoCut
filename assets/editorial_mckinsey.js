(function(root){
'use strict';
/**
 * STR-01: independent answer-first editorial grammar.
 * Adapted to a 16:9 canvas from a public 2025 strategy-report design study.
 * No original logos, imagery, fonts or source figures are embedded.
 *
 * All content remains native editable DoCut elements.
 */
const C=root.DocutCore;
if(!C)throw Error('DoCut core is required for the editorial report pack');
const BLUE='#2C57FF',CYAN='#09A9ED',NAVY='#10213A',PALE='#DDEEFF',LIGHT='#EDF7FC',INK='#161D24',MUTED='#5C6773',RULE='#CBD5DF',WHITE='#FFFFFF';
const CHART_STYLE='editorial-blue';
C.CHART_PALETTES={...(C.CHART_PALETTES||{}),[CHART_STYLE]:['#0D2476','#13A9E9','#9EE7FC','#AEB5C2','#3154A7','#4E97D2']};
const TABS=['핵심 결론','근거·해석','설문 데이터','영역별 비교','대안 판단','실행 순서'];
const PLAYBOOK=[
 '기획 질문에 대한 결론을 한 문장으로',
 '관찰·근거·해석을 분리한 편집 지면',
 '설문 차트와 독립 출처 주석',
 '서로 다른 영역의 편차·공통점',
 '선택지와 판단 기준을 대비',
 '진단에서 실행·재점검까지 연결'
];
function buildPage(index,colors={},choice='original'){
 const n=Number(index);
 if(!Number.isInteger(n)||n<0||n>=6)throw Error('존재하지 않는 전략 보고서 페이지');
 const override=choice!=='original';
 const accent=override?colors.accent||BLUE:BLUE;
 const background=override?colors.bg||WHITE:n===0?PALE:WHITE;
 const textInk=override?colors.fg||INK:INK;
 const subdued=override?colors.muted||LIGHT:LIGHT;
 const quiet=override?'#66717A':MUTED;
 const lines=override?accent:RULE;
 const highlight=override?accent:CYAN;
 const blocks=[];
 function add(kind,x,y,w,h,text='',style={},data=null){
  const opts={
   w,h,text,locked:false,hidden:false,verified:false,source:'',evidence:'',unit:'',asOfDate:'',effects:[],
   style:{font:'Arial',size:20,weight:400,color:textInk,align:'left',
    background:'transparent',radius:0,shadow:0,opacity:1,lineHeight:1.22,
    letterSpacing:0,borderWidth:0,...style}
  };
  if(data)opts.data=data;
  const b=C.normalizeBlock(C.makeBlock(kind,x,y,opts));
  if(!(b.x>=0&&b.y>=0&&b.x+b.w<=1280&&b.y+b.h<=720))throw Error('Editorial box outside canvas');
  blocks.push(b);
  return b;
 }
 function line(x,y,w,h=2,color=lines,opacity=1){return add('shape',x,y,w,h,'',{background:color,opacity});}
 function circle(x,y,w,h,color=subdued,opacity=1){return add('shape',x,y,w,h,'',{background:color,mask:'ellipse',radius:80,opacity});}
 function text(x,y,w,h,t,size=21,color=textInk,weight=400,font='Arial',opts={}){
  return add('text',x,y,w,h,t,{size,color,weight,font,...opts});
 }
 function title(x,y,w,h,t,size=50,color=textInk,font='Arial',opts={}){
  return add('title',x,y,w,h,t,{size,color,font,weight:700,lineHeight:1.10,...opts});
 }
 function chart(x,y,w,h,kind='bar',caption='엑셀 연결 · 값을 입력하세요'){
  const element=add(kind,x,y,w,h,caption,{
   background:background,shadow:0,radius:0,color:textInk,size:15,
   borderWidth:1,borderColor:lines
  },{labels:['분석 A','분석 B','분석 C','분석 D'],
     values:[0,0,0,0],palette:CHART_STYLE,unit:''});
  return element;
 }
 function table(x,y,w,h,rows,caption){
  return add('table',x,y,w,h,caption,{font:'Arial',size:16,color:textInk,
   background:background,radius:0,shadow:0}, {rows,cells:[]});
 }
 function bar(x,y,w,ratio=.6,color=accent){line(x,y,w,9,subdued);line(x,y,Math.round(w*ratio),9,color);}
 function header(num,topic,category='STRATEGY NOTE'){
  text(72,34,280,30,category,13,accent,800,'Arial',{letterSpacing:2});
  text(800,36,395,25,'INSIGHT    /    '+String(num).padStart(2,'0')+'  —  06',13,quiet,600,'Arial',{align:'right'});
  line(72,75,1136,2,lines);
  text(72,88,1130,21,topic.toUpperCase(),13,quiet,700,'Arial',{letterSpacing:1});
 }
 function footer(pageNo,source='출처·기준일을 입력하세요 / 실제 수치는 엑셀 연결'){
  line(72,661,1135,1,lines);
  text(72,670,855,22,source,12,quiet,400,'Arial');
  text(1027,670,180,22,String(pageNo).padStart(2,'0')+'  /  06',12,quiet,700,'Arial',{align:'right'});
 }
 // Large numerals are section indexes, not survey statistics.
 switch(n){
  case 0:{
   // Portrait research-cover grammar reflowed to 16:9; background artwork is
   // independent vector geometry, not the publisher's original photograph.
   line(72,47,65,5,accent);
   text(72,66,610,28,'RESEARCH / EDITORIAL REPORT',15,accent,800,'Arial',{letterSpacing:2.2});
   text(72,119,440,38,'결론에서 출발하는 분석',25,textInk,500);
   title(67,176,800,222,'데이터가 바꾸는\n의사결정의 구조',77,textInk,'Georgia',{lineHeight:1.07});
   line(73,429,90,5,accent);
   text(72,459,635,78,'핵심 질문·근거·비교·대안을 연결해\n한눈에 읽히는 전략 보고서를 작성하세요.',23,textInk,400,'Arial',{lineHeight:1.43});
   text(72,606,460,31,'SOURCE   /   작성자·발행일 입력',14,quiet,600,'Arial');
   // Three editable vector bands create light-and-motion rhythm.
   circle(882,64,348,348,'#F3F9FE',1);
   circle(1023,160,182,182,'#C4DEFA',.9);
   circle(905,389,252,252,'#B7DDFC',.78);
   line(869,117,10,382,'#9AC9F5',.5);
   line(899,85,6,484,highlight,.65);
   line(927,111,5,447,accent,.45);
   line(957,159,4,394,accent,.55);
   footer(1,'편집 가능한 구조 템플릿 · 실측 수치 미입력');
   break;
  }
  case 1:{
   header(2,'evidence before interpretation','EVIDENCE / NARRATIVE');
   title(72,135,967,111,'핵심 근거가 바뀌면\n판단도 달라져야 합니다',47,textInk,'Georgia');
   text(72,279,550,108,'핵심 관찰을 먼저 제시하고, 자료에 없는 인과관계는\n추정하지 마세요. 숫자와 해석을 별도로 검증합니다.',20,textInk,400,'Arial',{lineHeight:1.47});
   line(655,278,2,287,lines);
   text(689,278,465,38,'01  근거의 품질',19,textInk,800);
   text(689,323,467,59,'표본·수집일·측정 정의·비교 기준을\n나란히 검토하세요.',18,quiet);
   line(691,397,459,2,lines);
   text(689,417,465,38,'02  해석의 범위',19,textInk,800);
   text(689,463,475,65,'관찰과 판단을 구분하고\n예외·결측 가능성을 표기하세요.',18,quiet);
   text(72,461,520,115,'변화의 방향을\n먼저 설명하세요.',38,accent,400,'Arial',{lineHeight:1.14});
   text(72,593,530,36,'검토 포인트  /  자료 입력 → 기준 통일 → 해석',15,quiet,600);
   footer(2);
   break;
  }
  case 2:{
   header(3,'exhibit / survey comparison','EVIDENCE / EXHIBIT');
   title(72,120,985,86,'어떤 변화가 가장 두드러지는가?',42,textInk,'Arial');
   text(72,219,1064,51,'EXHIBIT 01   |   선택한 엑셀 범위의 범주·숫자를 연결하세요.',19,textInk,700);
   line(72,274,1133,2,lines);
   chart(72,293,765,301,'bar','설문 응답 비교  ·  데이터 미입력');
   line(873,295,3,276,accent);
   text(905,304,255,39,'읽는 순서',19,accent,800);
   text(903,357,258,136,'① 가장 큰 범주\n\n② 상대적 차이\n\n③ 예외·추세',19,textInk,500,'Arial',{lineHeight:1.3});
   text(900,525,255,73,'비교 기준·단위·표본\n정보를 반드시 확인',16,quiet);
   footer(3,'차트 데이터 미입력 / 업로드한 엑셀을 연결해 값 교체');
   break;
  }
  case 3:{
   header(4,'segment split','ANALYSIS / COMPARISON');
   title(72,132,1000,101,'전체 평균이 숨기는\n영역별 편차',47,textInk,'Georgia');
   text(72,255,1070,31,'데이터가 다른 집단을 동일한 기준으로 비교할 때 차이를 발견할 수 있습니다.',17,quiet);
   line(72,300,1133,2,lines);
   // Two unlike panes: quantitative visualization and qualitative interpretation.
   text(72,314,450,29,'SEGMENT  A  /  직접 비교',17,textInk,800);
   chart(74,354,566,247,'line','영역별 변화 추이 · 엑셀 연결');
   line(676,316,2,286,lines);
   text(710,314,440,31,'SEGMENT  B  /  해석과 예외',17,textInk,800);
   text(709,369,458,66,'같은 시점·같은 분모로\n비교했는지 확인하세요.',22,accent,700);
   line(711,460,429,2,lines);
   text(710,477,433,55,'차이가 발생한 조건 / 조사 집단 /\n자료 수집 방법을 적으세요.',18,textInk,400);
   line(711,555,430,2,lines);
   text(711,571,415,31,'다음 분석  →  세분화·교차 검증',16,quiet,700);
   footer(4);
   break;
  }
  case 4:{
   header(5,'decision framework','DECISION / OPTIONS');
   title(72,127,1060,93,'좋은 대안은 명확한 기준으로 구분됩니다',41,textInk,'Arial');
   text(72,229,1070,32,'하나의 카드 반복 대신, 공통 평가축을 중심으로 두 선택지를 나란히 검토합니다.',17,quiet);
   line(72,284,1133,2,lines);
   text(73,299,307,36,'판단 기준',18,quiet,700);
   text(446,299,313,36,'ALTERNATIVE A',19,accent,800);
   text(852,299,304,36,'ALTERNATIVE B',19,accent,800);
   line(72,349,1133,2,lines);
   const rows=[['효과·가치','검증 필요','검증 필요'],['실행 가능성','제약 입력','제약 입력'],['비용·위험','정량 검토','정량 검토']];
   rows.forEach((v,k)=>{
    const y=368+k*76;
    text(73,y,340,44,v[0],21,textInk,700);
    text(445,y,350,45,v[1],20,quiet,400);
    text(854,y,324,45,v[2],20,quiet,400);
    line(72,y+54,1135,1,lines);
   });
   line(424,299,2,279,lines);
   line(830,299,2,279,lines);
   text(73,613,1100,25,'최종 선택에는 근거·보완조건·책임자를 함께 기록하세요.',17,accent,700);
   footer(5,'대안 비교 구조 / 템플릿 내 숫자·평가 결과는 미입력');
   break;
  }
  case 5:{
   header(6,'implementation roadmap','ACTION / FOLLOW-THROUGH');
   title(72,124,1050,88,'분석에서 실행까지 끊기지 않게',45,textInk,'Georgia');
   text(72,226,1040,35,'책임자·시기·판단지표를 연결해 다음 의사결정이 발생하는 지점을 명확히 합니다.',18,quiet);
   line(72,298,1135,3,accent);
   const actions=[
    ['01','진단','검증할 원자료·\n문제를 확정'],
    ['02','설계','선택지·실행 조건·\n리스크를 정리'],
    ['03','실행','우선순위와\n담당자·일정을 지정'],
    ['04','점검','지표의 변화를 보고\n다음 결정을 수정']
   ];
   actions.forEach((a,j)=>{
    const x=72+j*288;
    circle(x,291,17,17,accent);
    text(x,327,225,44,a[0],28,accent,800,'Georgia');
    text(x,384,232,46,a[1],29,textInk,800);
    text(x,452,235,90,a[2],19,quiet,400,'Arial',{lineHeight:1.4});
    if(j<3)line(x+250,334,1,245,lines);
   });
   line(72,589,1134,1,lines);
   text(72,608,1100,30,'결과 확인  /  실패 조건과 수정 시점을 기록하세요',17,textInk,700);
   footer(6,'로드맵 구조 / 담당·날짜·KPI는 사용자가 확정');
   break;
  }
 }
 if(blocks.length>120)throw Error('편집 요소 한도 초과: '+blocks.length);
 return {
  id:C.uid('page'),tab:TABS[n],customTab:true,headline:TABS[n],
  subtitle:'편집형 리서치·분석 구조 / 실측 수치·출처를 입력하세요',
  background,layout:'blank',transition:'none',elements:blocks
 };
}
const api={CHART_STYLE,TABS,PLAYBOOK,buildPage,buildPack:(colors={},choice='original')=>TABS.map((_,i)=>buildPage(i,colors,choice))};
root.DocutEditorialMcKinsey=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
