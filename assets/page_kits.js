(function(root){
'use strict';
/* V0.24: Offline reusable page kits. A kit describes geometry and placeholder styles,
   never the source document, evidence, review notes, embedded image bytes or chart data. */
const C=root.DocutCore;
if(!C)throw Error('DocutCore must load before page_kits');
const KEY='docut-page-kits-v1',MAX_KITS=20,MAX_BLOCKS=60,MAX_BOOK_BYTES=450000;
const copy=x=>JSON.parse(JSON.stringify(x));
const palette={
 paper:{bg:'#F7F7F4',fg:'#243040',soft:'#65717E',surface:'#FFFFFF',accent:'#355D87',line:'#D4DBE1'},
 cream:{bg:'#F6F0E7',fg:'#302C29',soft:'#655E57',surface:'#FFFDF8',accent:'#A06638',line:'#DED4C7'},
 midnight:{bg:'#171F2C',fg:'#F0F3F7',soft:'#BAC6D6',surface:'#253043',accent:'#77B3E9',line:'#3E536B'},
 mint:{bg:'#EEF5F2',fg:'#203B37',soft:'#51706B',surface:'#FFFFFF',accent:'#2F877B',line:'#C2DAD3'},
 indigo:{bg:'#F1F1FA',fg:'#282A57',soft:'#646787',surface:'#FFFFFF',accent:'#575DD6',line:'#D1D3EC'},
 sand:{bg:'#F4F0E8',fg:'#2B3335',soft:'#687174',surface:'#FFFDF9',accent:'#84766A',line:'#D8D3CB'},
 noir:{bg:'#121923',fg:'#F0F4FA',soft:'#A5B5CA',surface:'#202F43',accent:'#D7B37C',line:'#496078'},
 ocean:{bg:'#EBF3FA',fg:'#173252',soft:'#56728E',surface:'#FFFFFF',accent:'#176CBA',line:'#C9DCEA'},
 forest:{bg:'#EAF1EB',fg:'#133F33',soft:'#59756A',surface:'#FFFFFF',accent:'#227A63',line:'#C8DDD0'},
 blush:{bg:'#FFF4F0',fg:'#53322E',soft:'#95766C',surface:'#FFFAF8',accent:'#C36A57',line:'#EAD0C8'},
 graphite:{bg:'#20252D',fg:'#F1F2F3',soft:'#AFB8C4',surface:'#313944',accent:'#BBD1DD',line:'#596673'},
 violet:{bg:'#F2F0FA',fg:'#2B2356',soft:'#7A70A0',surface:'#FFFFFF',accent:'#7955D1',line:'#DCD7EB'}
};
const baseStyles=(p,type)=>{
 const card=['card','kpi','note','bar','line','donut','table','stat','quote'].includes(type);
 return {color:p.fg,background:card?p.surface:'transparent',font:'Pretendard',size:type==='title'?49:type==='quote'?33:type==='kpi'?44:type==='source'?15:23,weight:type==='title'?800:card?650:450,align:'left',radius:card?18:0,shadow:card?18:0,opacity:1,borderColor:p.line,borderWidth:0,lineHeight:1.22};
};
// Original, editable compositions rather than a reproduction of any third-party
// consulting/company report. Explicit placeholders make unsupported facts visible.
const BUILTINS=[
 {id:'executive',name:'Executive Brief',ko:'결론 선제시',category:'기승전결',tone:'paper',layout:'hero',hint:'한 문장 결론과 근거 3개',blocks:[
  ['title',64,90,1120,108,'핵심 결론'],['quote',64,234,1150,140,'주요 판단을 한 문장으로 입력하세요'],['card',64,420,360,186,'근거 01\n확인된 사실 입력'],['card',458,420,360,186,'근거 02\n확인된 사실 입력'],['card',852,420,360,186,'근거 03\n확인된 사실 입력']]},
 {id:'problem',name:'Problem Framing',ko:'문제·영향 분석',category:'기승전결',tone:'cream',layout:'two',hint:'문제·원인·영향 분리',blocks:[
  ['title',70,85,1090,95,'현재 문제 정의'],['text',70,205,1090,70,'해결해야 할 질문을 명확히 적으세요'],['card',70,325,548,260,'현상과 근거\n실제 자료를 입력하세요'],['card',656,325,548,260,'영향과 위험\n근거를 입력하세요']]},
 {id:'evidence',name:'Evidence Ledger',ko:'근거·출처 정리',category:'근거·분석',tone:'paper',layout:'three',hint:'세 가지 증빙과 출처',blocks:[
  ['title',60,85,1150,98,'근거와 검증 수준'],['card',60,238,355,282,'근거 A\n확인된 내용을 입력'],['card',461,238,355,282,'근거 B\n확인된 내용을 입력'],['card',862,238,355,282,'근거 C\n확인된 내용을 입력'],['source',62,568,1080,52,'출처·발행일·기준일을 직접 입력하세요']]},
 {id:'comparison',name:'Option Comparison',ko:'대안 비교표',category:'대안·실행',tone:'mint',layout:'comparison',hint:'평가기준과 선택 근거',blocks:[
  ['title',66,82,1130,96,'대안 비교와 판단'],['table',66,218,775,350,'대안 비교'],['card',866,218,345,350,'선택 기준\n왜 이 대안인지 입력']]},
 {id:'decision',name:'Decision Memo',ko:'최종 의사결정',category:'대안·실행',tone:'midnight',layout:'hero',hint:'권고·조건·결정 요청',blocks:[
  ['title',66,84,1090,95,'의사결정 요청'],['quote',66,226,1145,155,'권고안과 선택 사유를 입력하세요'],['card',66,432,530,165,'승인 조건\n확인 필요'],['card',634,432,577,165,'결정 필요 사항\n담당자 지정']]},
 {id:'performance',name:'KPI Performance',ko:'핵심 성과지표',category:'근거·분석',tone:'indigo',layout:'chart',hint:'지표 3개와 근거 메모',blocks:[
  ['title',65,84,1120,95,'핵심 성과 지표'],['kpi',65,240,345,237,'—\n지표 A (값 입력)'],['kpi',464,240,345,237,'—\n지표 B (값 입력)'],['kpi',863,240,345,237,'—\n지표 C (값 입력)'],['source',65,540,1090,56,'각 지표의 출처·단위·기준일을 입력하세요']]},
 {id:'trend',name:'Trend and Insight',ko:'추세와 시사점',category:'근거·분석',tone:'paper',layout:'chart',hint:'차트 1개와 해석',blocks:[
  ['title',66,83,1120,96,'추세 분석'],['line',66,232,748,351,'실제 지표를 입력하세요'],['card',847,232,365,351,'해석과 한계\n통계 근거 입력']]},
 {id:'timeline',name:'Implementation Roadmap',ko:'실행 일정',category:'대안·실행',tone:'cream',layout:'timeline',hint:'3단계 실행 계획',blocks:[
  ['title',67,87,1120,100,'실행 로드맵'],['card',68,280,344,274,'01 · 준비\n담당/기한 입력'],['card',468,280,344,274,'02 · 실행\n담당/기한 입력'],['card',867,280,344,274,'03 · 평가\n담당/기한 입력']]},
 {id:'risks',name:'Risk Register',ko:'위험·대응',category:'대안·실행',tone:'sand',layout:'comparison',hint:'위험·가능성·대응책',blocks:[
  ['title',68,84,1100,92,'주요 위험과 대응'],['card',68,237,350,330,'위험 요인\n발생 조건 입력'],['card',464,237,350,330,'영향 및 가능성\n근거 입력'],['card',860,237,350,330,'예방·완화 방안\n담당 입력']]},
 {id:'feedback',name:'Stakeholder Voices',ko:'의견 수렴',category:'기승전결',tone:'mint',layout:'two',hint:'의견 수렴과 제안',blocks:[
  ['title',68,82,1120,100,'이해관계자 의견 수렴'],['note',68,241,770,339,'수렴할 의견·질문을 입력하세요'],['card',864,241,346,339,'결정 후속조치\n검토·답변 일정 입력']]}
];

/* Professional editorial / strategy compositions. 20 total starter layouts. */
BUILTINS.push(
 {id:'boardroom-noir',name:'Boardroom Noir',ko:'이사회 전략 브리프',category:'기승전결',tone:'noir',layout:'spotlight',hint:'강한 메시지와 2가지 결정 근거',blocks:[
  ['shape',56,75,11,566,'',{background:'#D7B37C',radius:0,shadow:0}],['text',94,95,1058,50,'BOARDROOM / STRATEGIC DECISION',{size:18,weight:800,color:'#D7B37C',letterSpacing:3}],
  ['title',94,190,1052,151,'먼저 결론을 제시하세요',{size:64,weight:800,lineHeight:1.13}],['text',94,377,1015,72,'결정해야 할 사안과 핵심 조건',{size:25,color:'#C0CDDA'}],
  ['card',94,505,489,124,'01  선택의 근거',{background:'#26364A',borderWidth:1,borderColor:'#496078',size:25,shadow:10}],['card',606,505,493,124,'02  예상되는 영향',{background:'#26364A',borderWidth:1,borderColor:'#496078',size:25,shadow:10}]]},
 {id:'editorial-ledger',name:'Editorial Ledger',ko:'매거진형 심층 보고',category:'기승전결',tone:'cream',layout:'portrait',hint:'전문 매거진처럼 타이포그래피·여백 중심',blocks:[
  ['text',72,75,550,44,'RESEARCH / INSIGHTS',{size:17,weight:900,color:'#A06638',letterSpacing:3}],['shape',70,128,1135,2,'',{background:'#D2C5B5'}],
  ['title',70,189,615,212,'핵심 인사이트를\n두 줄로 정리',{size:61,weight:700,lineHeight:1.14}],['text',75,453,570,151,'상세한 맥락과 근거를 이곳에 입력하세요.',{size:24,color:'#655E57'}],
  ['card',739,180,462,414,'ANALYSIS / 01\n핵심 증거 또는 사례',{background:'#E9DDCB',color:'#3C342F',size:31,shadow:0,radius:3}],['source',74,647,1060,33,'참고자료 · 발행일 · 확인된 근거',{size:15,color:'#7D7166'}]]},
 {id:'signal-intelligence',name:'Signal Intelligence',ko:'시장·산업 시그널',category:'근거·분석',tone:'ocean',layout:'chart',hint:'리서치 인사이트 + 가로형 차트',blocks:[
  ['text',65,65,1115,39,'MARKET INTELLIGENCE  /  INSIGHT NOTE',{size:17,weight:800,color:'#176CBA',letterSpacing:1}],['title',65,139,1100,100,'변화의 방향을 읽다',{size:54}],
  ['line',65,278,781,324,'시계열 자료를 직접 입력',{background:'#FFFFFF',radius:9,shadow:10}],['card',871,278,339,324,'WHAT MATTERS\n시사점·대응 방향',{background:'#173E64',color:'#FFFFFF',size:27,radius:9,shadow:14}],
  ['source',65,633,1100,43,'수치 출처 · 기준일 · 조사 방법',{size:15,color:'#56728E'}]]},
 {id:'capital-blueprint',name:'Capital Blueprint',ko:'재무·투자 심사',category:'근거·분석',tone:'graphite',layout:'metrics',hint:'재무 근거·핵심 지표 중심의 금융사 보고',blocks:[
  ['text',71,69,1070,41,'FINANCIAL REVIEW   /   ANALYSIS',{size:17,color:'#BBD1DD',weight:750}],['title',71,130,1070,111,'투자 검토와 핵심 숫자',{size:52}],
  ['kpi',70,289,357,225,'—\n수익성 (직접 입력)',{background:'#303B49',color:'#F1F2F3',shadow:8}],['kpi',462,289,355,225,'—\n비용 (직접 입력)',{background:'#303B49',color:'#F1F2F3',shadow:8}],['kpi',853,289,355,225,'—\n위험 수준 (직접 입력)',{background:'#303B49',color:'#F1F2F3',shadow:8}],
  ['shape',70,560,1140,2,'',{background:'#697A88'}],['source',75,583,1120,43,'근거 자료·적용 가정·기준일',{color:'#ADBCCA',size:16}]]},
 {id:'public-decision',name:'Public Decision',ko:'공공정책 의사결정',category:'대안·실행',tone:'paper',layout:'comparison',hint:'쟁점·정책 근거·권고를 명확히 분리',blocks:[
  ['text',60,59,1088,45,'POLICY / DECISION MEMORANDUM',{size:17,color:'#355D87',weight:800,letterSpacing:2}],['shape',60,115,1150,4,'',{background:'#355D87'}],
  ['title',61,151,1060,110,'정책 선택의 기준',{size:58}],['card',60,297,552,291,'문제의 정의\n제도 현황과 근거',{background:'#EAF0F5',radius:4,shadow:0}],['card',645,297,566,291,'권고 방향\n예상 효과와 실행 조건',{background:'#F9FAFB',borderWidth:1,borderColor:'#C3D0DB',radius:4,shadow:0}]]},
 {id:'product-initiative',name:'Product Initiative',ko:'제품·사업 제안서',category:'기승전결',tone:'violet',layout:'spotlight',hint:'새로운 전략의 목적·고객·가치를 연결',blocks:[
  ['text',77,67,1060,36,'PRODUCT VISION     /     2026',{size:17,weight:800,color:'#7955D1',letterSpacing:2}],['title',77,142,1065,132,'우리가 해결할 고객 문제',{size:61,color:'#2B2356'}],
  ['quote',77,316,1061,129,'차별화된 가치 제안 한 문장',{background:'#E4DEFA',color:'#2B2356',size:39,shadow:0,radius:3}],
  ['card',77,510,326,125,'고객 인사이트',{background:'#FFFFFF',color:'#2B2356',shadow:8}],['card',437,510,331,125,'핵심 해결 방식',{background:'#FFFFFF',color:'#2B2356',shadow:8}],['card',800,510,338,125,'검증 계획',{background:'#FFFFFF',color:'#2B2356',shadow:8}]]},
 {id:'human-impact',name:'Human Impact',ko:'조직·사회 영향 보고',category:'기승전결',tone:'blush',layout:'two',hint:'사람 중심의 문제와 대응을 명확하게 표현',blocks:[
  ['shape',66,93,99,7,'',{background:'#C36A57'}],['text',66,120,1100,45,'PEOPLE FIRST   /   SOCIAL IMPACT',{size:17,weight:800,color:'#C36A57',letterSpacing:2}],
  ['title',66,205,1084,167,'우리는 무엇을\n바꿀 것인가',{size:61,weight:700}],['card',67,430,546,189,'현장의 목소리\n확인된 사례와 의견',{background:'#F9E2DA',shadow:3,radius:8}],
  ['card',640,430,557,189,'조직이 해야 할 일\n책임과 실행 계획',{background:'#FFFFFF',shadow:6,radius:8}]]},
 {id:'landscape-matrix',name:'Landscape Matrix',ko:'시장·경쟁 구도 비교',category:'근거·분석',tone:'sand',layout:'quadrant',hint:'비교 기준 4분면의 전략적 구조화',blocks:[
  ['text',61,59,1100,36,'COMPETITIVE LANDSCAPE',{color:'#84766A',size:17,weight:850}],['title',61,122,1100,94,'선택지를 구조화하다',{size:51}],
  ['card',64,272,540,145,'OPTION A / 강점',{radius:2,shadow:0,background:'#E9E2D5'}],['card',635,272,543,145,'OPTION B / 강점',{radius:2,shadow:0,background:'#E9E2D5'}],
  ['card',64,442,540,145,'OPTION A / 한계',{radius:2,shadow:0,background:'#F8F6F1'}],['card',635,442,543,145,'OPTION B / 한계',{radius:2,shadow:0,background:'#F8F6F1'}],['source',63,627,1104,30,'비교 범위, 기준일, 출처를 입력',{size:14}]]},
 {id:'operating-rhythm',name:'Operating Rhythm',ko:'운영 실적·관리',category:'대안·실행',tone:'forest',layout:'metrics',hint:'중요 지표와 개선 조치를 한 장에서',blocks:[
  ['text',64,66,1090,35,'OPERATING REVIEW  /  MONTHLY',{size:17,weight:800,color:'#227A63'}],['title',64,131,1079,99,'운영 성과와 개선 초점',{size:52}],
  ['kpi',64,287,355,195,'—\n상태 지표',{background:'#FFFFFF',shadow:7,radius:9}],['kpi',461,287,355,195,'—\n품질 지표',{background:'#FFFFFF',shadow:7,radius:9}],['kpi',857,287,355,195,'—\n완료율',{background:'#FFFFFF',shadow:7,radius:9}],
  ['card',65,531,1147,112,'NEXT STEPS   |   담당자 · 결정 사항 · 완료 시점',{background:'#DCEAE0',color:'#1E5B4A',radius:8,shadow:0}]]},
 {id:'resolution-finale',name:'Resolution Finale',ko:'최종 결론·행동 요청',category:'대안·실행',tone:'noir',layout:'spotlight',hint:'관객의 기억에 남는 결론형 마지막 장',blocks:[
  ['text',69,85,1090,41,'THE DECISION  /  WHAT COMES NEXT',{size:18,color:'#D7B37C',letterSpacing:2,weight:800}],
  ['title',69,205,1100,190,'그래서, 지금\n무엇을 해야 하는가',{size:69,weight:900,lineHeight:1.12}],
  ['shape',69,446,1122,3,'',{background:'#D7B37C'}],['quote',71,504,1092,109,'요청할 결정과 후속 일정을 입력',{background:'#26364A',color:'#F6F2E8',size:30,radius:7,shadow:9}]]}
);
const PLACEHOLDER={title:'제목을 입력하세요',text:'주요 메시지를 입력하세요',card:'핵심 내용\n직접 입력하세요',kpi:'—\n지표 입력',bar:'차트 데이터 입력 필요',line:'차트 데이터 입력 필요',donut:'차트 데이터 입력 필요',table:'비교표 데이터 입력 필요',stat:'통계 원자료 입력 필요',shape:'',note:'의견이나 메모를 입력하세요',image:'이미지 파일을 선택하세요',bullet:'핵심 항목을 입력하세요',quote:'강조 문장을 입력하세요',divider:'',source:'출처와 기준일을 직접 입력하세요'};
function sanitizeElement(raw,index,stripContent=true){
 if(!raw||typeof raw!=='object')throw Error('Malformed kit element');
 const b=C.normalizeBlock(raw);
 b.id='kit-element-'+index;
 // Remove all content/evidence that could contain employee details or proprietary data.
 if(stripContent)b.text=PLACEHOLDER[b.type]??'내용 입력';
 b.source='';b.asOfDate='';b.unit='';b.evidence='';b.notes='';b.verified=false;b.richText=[];b.locked=false;b.hidden=false;
 b.effects=(b.effects||[]).slice(0,3);
 if(b.type==='image')b.data={src:'',alt:''};
 else if(['bar','line','donut'].includes(b.type))b.data={labels:['항목 A','항목 B','항목 C'],values:[0,0,0],unit:'',palette:'default'};
 else if(b.type==='stat')b.data={kind:'cohort',rows:[],limits:{},palette:'default'};
 else if(b.type==='table')b.data={rows:[['항목','대안 A','대안 B'],['평가 항목','','']],cells:[]};
 else if(b.data)delete b.data;
 // Preserve grouping semantics but never preserve original IDs.
 b.groupId=b.groupId?'kit-group-'+String(b.groupId).replace(/[^\w-]/g,'').slice(0,24):null;
 b.groupLabel=b.groupId?'그룹':'';
 return b;
}
function safeName(name){const v=String(name||'').trim();if(!v||v.length>64)throw Error('Template name must be 1-64 characters');return v;}
function sanitizedPage(page,name){if(!page||!Array.isArray(page.elements)||!page.elements.length||page.elements.length>MAX_BLOCKS)throw Error('Template pages must contain 1-60 elements');
 const used=new Map(),elements=page.elements.map((el,i)=>{const b=sanitizeElement(el,i);if(b.groupId){if(!used.has(el.groupId))used.set(el.groupId,'kit-group-'+used.size);b.groupId=used.get(el.groupId);}return b;});
 const result={name:safeName(name),background:typeof page.background==='string'&&/^#[a-f0-9]{6}$/i.test(page.background)?page.background:'',layout:C.LAYOUTS[page.layout]?page.layout:'hero',transition:C.EFFECT_CATALOG?.normalizeTransition(page.transition)||'fade',elements};
 return result;
}
function capture(page,name){const saved=sanitizedPage(page,name);return {...saved,id:'user-'+C.uid('kit'),category:'내 템플릿',createdAt:new Date().toISOString()};}
function fromNamedPalette(name){
 if(!name||name==='original')return null;
 const preset=root.DocutEffectCatalog?.PALETTES?.[name];if(!preset)throw Error('Unknown palette');
 const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)),hex=a=>'#'+a.map(n=>Math.round(n).toString(16).padStart(2,'0')).join(''),c=rgb(preset.bg),dark=(.2126*c[0]+.7152*c[1]+.0722*c[2])<130;
 const mix=(target,rate)=>hex(c.map((v,i)=>v*(1-rate)+target[i]*rate));
 return {bg:preset.bg,fg:preset.foreground,soft:dark?mix([255,255,255],.75):preset.foreground,surface:dark?mix([255,255,255],.095):'#FFFFFF',accent:preset.accent,line:dark?mix([255,255,255],.25):mix([0,0,0],.15)};
}
function builtPage(id,paletteName='original'){const b=BUILTINS.find(t=>t.id===id);if(!b)throw Error('Unknown template');const p=fromNamedPalette(paletteName)||palette[b.tone];const elements=b.blocks.map(([kind,x,y,w,h,content,styleOverrides],i)=>{
  const raw=C.makeBlock(kind,x,y,{w,h,text:content,style:{...baseStyles(p,kind),...(styleOverrides||{})},effects:[C.makeEffect(i?'rise':'fade',600,70+i*80)]});
  if(kind==='source'){raw.style.color=p.soft;raw.style.size=15;raw.style.background='transparent';raw.style.shadow=0;}
  if(kind==='card'&&b.tone==='midnight')raw.style.background=p.surface;
  if(kind==='table')raw.data={rows:[['비교 항목','대안 A','대안 B'],['근거','',''],['비용·영향','',''],['실행 가능성','','']],cells:[]};
  if(kind==='line')raw.data={labels:['1단계','2단계','3단계'],values:[0,0,0],unit:'',palette:'default'};
  if(kind==='kpi')raw.text='—\n'+content.split('\n')[1];
  return C.normalizeBlock({...raw,id:'kit-element-'+i,source:'',verified:false});
 });
 return {name:b.ko,background:p.bg,layout:b.layout,transition:'fade',elements};
}
function pageFromKit(kit,paletteName='original'){const source=typeof kit==='string'?builtPage(kit,paletteName):sanitizedPage(kit,kit?.name||'내 템플릿');
 const groupMap=new Map(),elements=source.elements.map((original,i)=>{
  const el=C.normalizeBlock(copy(original));el.id=C.uid();el.verified=false;el.source='';el.evidence='';el.asOfDate='';el.unit='';el.notes='';el.richText=[];el.locked=false;el.hidden=false;
  if(el.groupId){if(!groupMap.has(el.groupId))groupMap.set(el.groupId,C.uid('group'));el.groupId=groupMap.get(el.groupId);}
  return el;
 });
 const title=String(source.name||'새 템플릿 페이지');
 return {id:C.uid('page'),tab:title,headline:title,subtitle:'직접 입력할 초안 · 수치와 출처 검증 전',customTab:true,background:source.background,layout:source.layout||'hero',transition:source.transition||'fade',elements};
}
function validateUserKit(raw){if(!raw||typeof raw!=='object'||!/^user-[\w-]{4,90}$/.test(raw.id||''))throw Error('Invalid custom template identity');
 if(raw.category!=='내 템플릿')throw Error('Invalid custom template category');
 if(!Array.isArray(raw.elements)||raw.elements.length<1||raw.elements.length>MAX_BLOCKS)throw Error('Template element limit is 1-60');
 // Import is deliberately strict: never accept hidden source or content that would
 // be lost silently by making the template layout-only.
 for(const el of raw.elements){
  if(el.source||el.evidence||el.notes||el.asOfDate||el.unit||el.verified||el.hidden||el.locked||el.richText?.length||el.data?.src||el.data?.alt||el.data?.width||el.data?.height||el.data?.rows?.some(r=>r.some(x=>!['항목','대안 A','대안 B','평가 항목',''].includes(x)))||el.data?.values?.some(v=>Number(v)!==0)||el.data?.labels?.some(v=>!['항목 A','항목 B','항목 C'].includes(v))||el.data?.kind&&el.data.kind!=='cohort'||el.data?.referenceValue||el.data?.limits&&Object.keys(el.data.limits).length)throw Error('Template contains source content or private data; import rejected');
  if(String(el.text??'')!==(PLACEHOLDER[el.type]??'내용 입력'))throw Error('Template contains report text; import rejected');
 }
 const normalized=sanitizedPage(raw,raw.name);
 if(raw.background!==normalized.background||raw.layout!==normalized.layout)throw Error('Invalid page template geometry metadata');
 return {...normalized,id:raw.id,category:'내 템플릿',createdAt:typeof raw.createdAt==='string'&&raw.createdAt.length<=30&&/^\d{4}-\d\d-\d\dT/.test(raw.createdAt)?raw.createdAt:''};
}
function normalizeBook(raw){if(!raw||raw.kind!=='docut-page-kit-library'||raw.version!==1||!Array.isArray(raw.templates)||raw.templates.length>MAX_KITS||'pages' in raw||'reviews' in raw||'project' in raw)throw Error('Invalid template library');
 const ids=new Set(),templates=raw.templates.map(t=>{const v=validateUserKit(t);if(ids.has(v.id))throw Error('Duplicate template identity');ids.add(v.id);return v;});return {kind:'docut-page-kit-library',version:1,templates};}
const empty=()=>({kind:'docut-page-kit-library',version:1,templates:[]});
function storageRead(store){let raw=null;try{if(!store)throw Error('Local storage unavailable');raw=store.getItem(KEY);if(raw==null)return {status:'ok',book:empty(),raw:null};if(raw.length>MAX_BOOK_BYTES)throw Error('Template library exceeds size limit');return {status:'ok',book:normalizeBook(JSON.parse(raw)),raw};}catch(e){return {status:'error',error:String(e.message||e),raw};}}
function saveBook(store,book,expectedRaw){try{if(!store)throw Error('Local storage unavailable');if(store.getItem(KEY)!==expectedRaw)return {status:'conflict',error:'Template library was changed in another tab'};const payload=JSON.stringify(normalizeBook(book));if(payload.length>MAX_BOOK_BYTES)throw Error('Template library exceeds size limit');store.setItem(KEY,payload);if(store.getItem(KEY)!==payload)throw Error('Template library write was not retained');return {status:'saved',book:normalizeBook(JSON.parse(payload)),raw:payload};}catch(e){return {status:'failed',error:String(e.message||e)};}}
function addKit(book,kit){const original=normalizeBook(book),next=validateUserKit(kit);if(original.templates.length>=MAX_KITS)throw Error('Maximum 20 custom templates');if(original.templates.some(x=>x.id===next.id))throw Error('Duplicate template ID');return {...original,templates:[...original.templates,next]};}
function deleteKit(book,id){const original=normalizeBook(book);if(!original.templates.some(x=>x.id===id))throw Error('Unknown custom template');return {...original,templates:original.templates.filter(x=>x.id!==id)};}
function inspectPacket(book,raw){if(typeof raw!=='string'||raw.length>MAX_BOOK_BYTES)throw Error('Template import file exceeds the safe size limit');const target=normalizeBook(book),incoming=normalizeBook(JSON.parse(raw)),known=new Map(target.templates.map(x=>[x.id,x]));const added=[];let duplicates=0;
 for(const kit of incoming.templates){if(known.has(kit.id)){if(JSON.stringify(known.get(kit.id))!==JSON.stringify(kit))throw Error('Conflicting template ID '+kit.id);duplicates++;}else {added.push(kit);known.set(kit.id,kit);}}
 if(target.templates.length+added.length>MAX_KITS)throw Error('Import exceeds 20 template limit');return {added,duplicates,incoming:incoming.templates.length};}
function mergePacket(book,raw){const plan=inspectPacket(book,raw);return {...normalizeBook(book),templates:[...normalizeBook(book).templates,...plan.added]};}
function previewMarkup(page,options={}){
 if(!page||!Array.isArray(page.elements))throw Error('No template preview');
 const safe=C.escapeHTML,color=(v,other)=>/^#[a-f0-9]{6}$/i.test(String(v||''))?v:other;
 const max=options.compact===true?22:page.designIdentity?120:MAX_BLOCKS;
 const els=page.elements.slice(0,max).map(el=>{
  const left=(Math.max(0,Math.min(1250,Number(el.x)||0))/12.8).toFixed(3),top=(Math.max(0,Math.min(700,Number(el.y)||0))/7.2).toFixed(3),w=(Math.max(30,Math.min(1280,Number(el.w)||30))/12.8).toFixed(3),h=(Math.max(18,Math.min(720,Number(el.h)||20))/7.2).toFixed(3);
  const text=String(el.type==='image'?'이미지 배치':el.text||el.data?.alt||'').replace(/\s+/g,' ').slice(0,120);
  const style=el.style||{};const foreground=color(style.color,'#293241'),background=color(style.background,'transparent');const radius=Math.max(0,Math.min(80,Number(style.radius)||0));
  const align=['center','right'].includes(style.align)?style.align:'left';const weight=[300,400,500,600,700,800,900].includes(+style.weight)?+style.weight:500;
  const fontSize=Math.max(8,Math.min(105,Number(style.size)||20)),lineHeight=Math.max(.8,Math.min(2.3,Number(style.lineHeight)||1.2));
  const typ=String(el.type||'text');const clip=({circle:'circle(49% at 50% 50%)',ellipse:'ellipse(49% 40% at 50% 50%)',diamond:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)'})[style.mask]||'none';
  return `<div class="kit-map-block" data-kind="${safe(typ)}" style="left:${left}%;top:${top}%;width:${w}%;height:${h}%;border-radius:${radius/10}px;clip-path:${clip};background:${background};color:${foreground};font-size:clamp(4px,${(fontSize/12.8).toFixed(3)}cqw,60px);line-height:${lineHeight};font-weight:${weight};text-align:${align}" title="${safe(text)}"><span>${safe(text)}</span></div>`;
 }).join('');
 return `<div class="kit-map" role="img" aria-label="레이아웃과 컬러를 표시한 템플릿 구조 개략도">${els}</div>`;
}
function exportBook(book){return JSON.stringify(normalizeBook(book),null,2);}
root.DocutPageKits={KEY,BUILTINS:BUILTINS.map(({id,name,ko,category,tone,hint})=>({id,name,ko,category,tone,hint})),palette,PLACEHOLDER,MAX_KITS,empty,capture,builtPage,pageFromKit,previewMarkup,normalizeBook,storageRead,saveBook,addKit,deleteKit,inspectPacket,mergePacket,exportBook};
if(typeof module!=='undefined'&&module.exports)module.exports=root.DocutPageKits;
})(typeof globalThis!=='undefined'?globalThis:this);
