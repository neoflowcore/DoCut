/* DoCut Studio 0.33 — independently drawn professional report layout packs.
   Official corporate reports are cited as design research, not reproduced. */
(function(root){
'use strict';
const C=root.DocutCore;
if(!C)throw Error('Docut core required');
const catalog=[{"id":"STR-01","company":"McKinsey","originalTitle":"The State of AI: How Organizations Are Rewiring to Capture Value","family":"Strategy","source":"https://www.mckinsey.com/~/media/mckinsey/business%20functions/quantumblack/our%20insights/the%20state%20of%20ai/2025/the-state-of-ai-how-organizations-are-rewiring-to-capture-value_final.pdf","evidence":"visual_pdf","names":["thesis","evidence","survey chart","segment split","option matrix","action roadmap"],"patterns":["thesis","evidence","chart","segment","matrix","roadmap"],"colors":{"bg":"#F6F8FA","fg":"#1F3141","accent":"#28658B","muted":"#E8F0F5","card":"#FFFFFF"},"graphic":"summary","seed":0},{"id":"STR-02","company":"Boston Consulting Group","originalTitle":"Global Wealth Report 2026: The Great Reordering","family":"Strategy","source":"https://web-assets.bcg.com/27/09/094ed67e49ffbd469d130d73842d/2026-gwr-may-2026-n.pdf","evidence":"visual_pdf","names":["executive thesis","geography comparison","chart+commentary","market drivers","risks","recommendations"],"patterns":["cover","map","chart","driver","risk","decision"],"colors":{"bg":"#F3F8F2","fg":"#1E3027","accent":"#267357","muted":"#E3F0E8","card":"#FFFFFF"},"graphic":"editorial","seed":1},{"id":"STR-03","company":"Bain & Company","originalTitle":"Global Private Equity Report 2026","family":"Strategy","source":"https://www.bain.com/insights/topics/global-private-equity-report/","evidence":"visual_pdf_prior","names":["cover","key findings","market trend","funds matrix","scenarios","actions"],"patterns":["cover","kpi","growth","matrix","scenario","decision"],"colors":{"bg":"#FFF9F6","fg":"#332C2B","accent":"#A34F48","muted":"#F5E7E3","card":"#FFFFFF"},"graphic":"compact","seed":2},{"id":"STR-04","company":"Deloitte","originalTitle":"2026 Global Human Capital Trends","family":"Strategy","source":"https://www.deloitte.com/content/dam/assets-zone2/ch/en/docs/services/consulting/2026/ch-deloitte-human-capital-2026-Global-Human-Capital-Trends.pdf","evidence":"visual_pdf","names":["opening question","survey takeaway","single-chart explainer","people-process matrix","decisions","roadmap"],"patterns":["question","kpi","chart","matrix","decision","roadmap"],"colors":{"bg":"#F8F9F5","fg":"#2B3330","accent":"#687C31","muted":"#ECF0DD","card":"#FFFFFF"},"graphic":"grid","seed":3},{"id":"STR-05","company":"Accenture","originalTitle":"Technology Vision 2025","family":"Strategy","source":"https://www.accenture.com/content/dam/accenture/final/accenture-com/document-3/Accenture-Tech-Vision-2025.pdf","evidence":"visual_pdf_prior","names":["vision cover","signals","3-card themes","technology scenario","opportunity matrix","execution plan"],"patterns":["cover","driver","segment","scenario","matrix","roadmap"],"colors":{"bg":"#191B2D","fg":"#F7F4FF","accent":"#AE85D6","muted":"#302B45","card":"#26223B"},"graphic":"dark","seed":4},{"id":"EARN-06","company":"Meta","originalTitle":"Q3 2026 Earnings Presentation","family":"Earnings","source":"https://investor.atmeta.com/investor-events/","evidence":"official_index_only","names":["quarter summary","KPI grid","yoy waterfall","segment breakdown","investments","outlook+source"],"patterns":["thesis","kpi","growth","segment","investment","forecast"],"colors":{"bg":"#F6FAFC","fg":"#1B3444","accent":"#357D9E","muted":"#E4F1F6","card":"#FFFFFF"},"graphic":"metrics","seed":5},{"id":"EARN-07","company":"Alphabet","originalTitle":"Q3 2026 Earnings Slides","family":"Earnings","source":"https://abc.xyz/investor/earnings/","evidence":"official_index_only","names":["growth headline","six KPIs","business unit comparison","cost waterfall","outlook","GAAP appendix"],"patterns":["thesis","kpi","segment","growth","forecast","table"],"colors":{"bg":"#FCFCFD","fg":"#202D3F","accent":"#4C6B9C","muted":"#E8EDF7","card":"#FFFFFF"},"graphic":"grid","seed":6},{"id":"CORP-08","company":"Microsoft","originalTitle":"FY2025 Annual Report","family":"Corporate","source":"https://www.microsoft.com/investor/reports/ar25/index.html","evidence":"official_html_reviewed","names":["letter","priorities","business lines","financial overview","investment themes","appendix"],"patterns":["letter","driver","segment","kpi","investment","table"],"colors":{"bg":"#F7FAFD","fg":"#19374B","accent":"#4D84B4","muted":"#E2EDF7","card":"#FFFFFF"},"graphic":"editorial","seed":7},{"id":"CORP-09","company":"Apple","originalTitle":"Environmental Progress Report 2026","family":"Corporate","source":"https://www.apple.com/environment/pdf/Apple_Environmental_Progress_Report_2026.pdf","evidence":"pdf_semantic_visual_reviewed","names":["hero cover","highlights","milestone cards","emissions bars","progress status","methodology"],"patterns":["cover","kpi","roadmap","chart","progress","method"],"colors":{"bg":"#FAF8F4","fg":"#334036","accent":"#6C8D60","muted":"#E8EDE2","card":"#FFFFFF"},"graphic":"large","seed":8},{"id":"EARN-10","company":"NVIDIA","originalTitle":"Q4 FY26 Investor Presentation","family":"Earnings","source":"https://s201.q4cdn.com/141608511/files/doc_financials/2026/Q426/NVDA-F4Q26-Quarterly-Presentation.pdf","evidence":"visual_pdf","names":["hero KPI","trend bars","product lines","margins","investment","outlook"],"patterns":["thesis","chart","segment","kpi","investment","forecast"],"colors":{"bg":"#111922","fg":"#F4F7F9","accent":"#8BBE65","muted":"#27313A","card":"#1E2A34"},"graphic":"dark","seed":9},{"id":"EARN-11","company":"Tesla","originalTitle":"Q3 2026 Quarterly Update","family":"Earnings","source":"https://assets-ir.tesla.com/tesla-contents/IR/TSLA-Q3-2026-Update.pdf","evidence":"visual_pdf_prior","names":["highlights","finance table","operations table","segment trends","investment","outlook"],"patterns":["kpi","table","table","chart","investment","forecast"],"colors":{"bg":"#F6F6F4","fg":"#252B32","accent":"#5B6E79","muted":"#E8ECEF","card":"#FFFFFF"},"graphic":"tables","seed":10},{"id":"EARN-12","company":"Netflix","originalTitle":"Q3 2026 Shareholder Letter","family":"Earnings","source":"https://ir.netflix.net/files/doc_financials/2026/q3/FINAL-Q3-26-Shareholder-Letter.pdf","evidence":"visual_pdf_prior","names":["quarter letter","period table","guidance","growth drivers","risks","footnotes"],"patterns":["letter","table","forecast","driver","risk","method"],"colors":{"bg":"#FAFAFA","fg":"#252525","accent":"#9B292D","muted":"#F2E9E9","card":"#FFFFFF"},"graphic":"letter","seed":11},{"id":"CORP-13","company":"Amazon","originalTitle":"Annual Reports and Shareholder Letters (2025)","family":"Corporate","source":"https://s2.q4cdn.com/299287126/files/doc_financials/2026/ar/Amazon-2025-Annual-Report.pdf","evidence":"visual_pdf","names":["shareholder thesis","flywheel","operating metrics","segment comparison","priorities","annual appendix"],"patterns":["letter","network","kpi","segment","driver","table"],"colors":{"bg":"#F4F7F8","fg":"#172C34","accent":"#377789","muted":"#E2EFF2","card":"#FFFFFF"},"graphic":"letter","seed":12},{"id":"FIN-14","company":"Goldman Sachs","originalTitle":"2025 Annual Report","family":"Finance","source":"https://www.goldmansachs.com/investor-relations/financials/current/annual-reports/2025-annual-report","evidence":"official_html_reviewed","names":["capital letter","ROE EPS grid","multi-year bars","business division","risks","disclosures"],"patterns":["letter","kpi","chart","segment","risk","method"],"colors":{"bg":"#192532","fg":"#EFF3F7","accent":"#C2A16C","muted":"#2F3E4D","card":"#253747"},"graphic":"dark","seed":13},{"id":"FIN-15","company":"JPMorganChase","originalTitle":"2025 Annual Report","family":"Finance","source":"https://www.jpmorganchase.com/content/dam/jpmc/jpmorgan-chase-and-co/investor-relations/documents/annualreport-2025.pdf","evidence":"visual_pdf","names":["letter","financial highlights","long-term combo chart","peer comparison","risks","notes"],"patterns":["letter","kpi","chart","matrix","risk","method"],"colors":{"bg":"#F7F9FB","fg":"#1D3348","accent":"#3B5F80","muted":"#E5EBF1","card":"#FFFFFF"},"graphic":"tables","seed":14},{"id":"FIN-16","company":"UBS","originalTitle":"Global Wealth Report 2026","family":"Finance","source":"https://www.ubs.com/global/en/wealthmanagement/insights/global-wealth-report.html","evidence":"official_html_reviewed","names":["global snapshot","regional maps","wealth pyramid","cohort comparison","drivers","methodology"],"patterns":["cover","map","pyramid","segment","driver","method"],"colors":{"bg":"#F7F6F2","fg":"#333A40","accent":"#777B69","muted":"#ECEDE6","card":"#FFFFFF"},"graphic":"graphic","seed":15},{"id":"FIN-17","company":"BlackRock","originalTitle":"2025 Investor Day Presentation","family":"Finance","source":"https://s24.q4cdn.com/856567660/files/doc_presentations/2025/BLK-Investor-Day-2025-WEB.pdf","evidence":"visual_pdf","names":["strategy pillars","metric matrix","growth bridge","targets","capital allocation","notes"],"patterns":["thesis","kpi","growth","targets","investment","method"],"colors":{"bg":"#F6F8FB","fg":"#1D2E40","accent":"#4C77A6","muted":"#E5EDF7","card":"#FFFFFF"},"graphic":"metrics","seed":16},{"id":"PUB-18","company":"World Economic Forum","originalTitle":"Global Risks Report 2026","family":"Public Policy","source":"https://www.weforum.org/publications/global-risks-report-2026/","evidence":"official_html_reviewed","names":["risk executive","2-year vs 10-year","heatmap","risk network","scenario","responses"],"patterns":["thesis","matrix","heatmap","network","scenario","decision"],"colors":{"bg":"#F6F8FA","fg":"#1F323C","accent":"#4C7B87","muted":"#E4EFF1","card":"#FFFFFF"},"graphic":"risk","seed":17},{"id":"PUB-19","company":"International Monetary Fund","originalTitle":"World Economic Outlook, October 2026","family":"Public Policy","source":"https://www.imf.org/en/Publications/WEO/Issues/2026/10/13/world-economic-outlook-october-2026","evidence":"official_html_pdf_partial","names":["forecast headline","regional comparison","time series","downside scenario","policy implications","data"],"patterns":["thesis","map","chart","scenario","decision","method"],"colors":{"bg":"#F8F7F3","fg":"#242D42","accent":"#4D6F98","muted":"#EBEEF2","card":"#FFFFFF"},"graphic":"tables","seed":18},{"id":"PUB-20","company":"World Bank","originalTitle":"Global Economic Prospects, June 2026","family":"Public Policy","source":"https://thedocs.worldbank.org/en/doc/2b672b3b0415d6b66c45b66579db4ef5-0050012026/original/GEP-Jun-2026.pdf","evidence":"visual_pdf","names":["summary","world region map","growth table","analytic box","policy comparison","data+source"],"patterns":["thesis","map","table","evidence","matrix","method"],"colors":{"bg":"#F8FAFC","fg":"#263B47","accent":"#3A7C96","muted":"#E7F1F4","card":"#FFFFFF"},"graphic":"analysis","seed":19}];
const copy=x=>JSON.parse(JSON.stringify(x));
const NAME_KO={
 'thesis':'핵심 결론','evidence':'근거와 해석','chart':'추이 분석','segment':'부문별 성과',
 'matrix':'대안과 판단','roadmap':'실행 로드맵','map':'지역·시장 비교','driver':'성장 동인',
 'risk':'위험 관리','decision':'권고와 실행','cover':'주제 및 핵심 메시지','kpi':'핵심 지표',
 'growth':'기간별 증감 분석','scenario':'시나리오 비교','question':'핵심 질문','investment':'투자·자본 배분',
 'forecast':'전망과 과제','table':'재무·자료 비교','letter':'경영진 메시지','progress':'목표 대비 진행',
 'method':'자료·방법·한계','network':'연계 구조','pyramid':'분포 구조','targets':'목표 대비 실적',
 'heatmap':'위험 영향도'};
const FAMILY_KO={Strategy:'전략·컨설팅',Earnings:'분기 실적',Corporate:'기업·연차',Finance:'금융·투자','Public Policy':'정책·경제'};
const PAGE_KINDS=['thesis','evidence','chart','segment','matrix','roadmap','map','driver','risk','decision','cover','kpi','growth','scenario','question','investment','forecast','table','letter','progress','method','network','pyramid','targets','heatmap'];
function find(id){return catalog.find(p=>p.id===id)||null;}
function paletteFor(p,choice){
 const colors={...p.colors};
 const custom=choice&&choice!=='original'?root.DocutEffectCatalog?.PALETTES?.[choice]:null;
 if(custom){colors.bg=custom.bg;colors.fg=custom.foreground;colors.accent=custom.accent;colors.card=/^#(?:[0-6][0-9a-f]){3}$/i.test(colors.bg)?'#293744':'#FFFFFF';colors.muted=colors.card==='#FFFFFF'?'#EDF0F4':'#3A4651';}
 return colors;
}
function buildPage(packId,pageIndex=0,choice='original'){
 const p=find(packId),i=Number(pageIndex);
 if(!p||!Number.isInteger(i)||i<0||i>5)throw Error('존재하지 않는 전문 레퍼런스 페이지');
 const theme=paletteFor(p,choice),dark=p.graphic==='dark'&&choice==='original';
 const fg=theme.fg,muted=dark?'#B9C7D5':'#687987',accent=theme.accent,bg=theme.bg,soft=theme.muted,card=theme.card;
 const role=p.patterns[i],head=NAME_KO[role]||'전문 보고';
 const elements=[],base={font:'Pretendard',align:'left',opacity:1,shadow:0,radius:0,weight:400,color:fg,background:'transparent'};
 function add(kind,x,y,w,h,label='',style={},data){
  const st={...base,...style};
  const raw=C.makeBlock(kind,x,y,{w,h,text:label,style:st,effects:[],locked:false,verified:false,source:'',asOfDate:'',unit:'',evidence:''});
  if(['line','bar','donut'].includes(kind))raw.data={labels:['항목 A','항목 B','항목 C','항목 D'],values:[0,0,0,0],unit:''};
  if(kind==='table')raw.data={rows:(data?.rows)||[['지표 / 항목','기준 기간','비교 기간','비고'],['항목 A','—','—','미입력'],['항목 B','—','—','미입력'],['항목 C','—','—','미입력']]};
  if(data&&kind!=='table')raw.data=data;
  elements.push(C.normalizeBlock(raw));
 }
 const labelStyle={size:14,weight:750,color:accent};
 const titleStyle={size:p.graphic==='large'?61:52,weight:800,color:fg};
 const cardStyle={size:22,weight:550,color:fg,background:card,radius:dark?9:6,shadow:dark?0:3};
 const softStyle={...cardStyle,background:soft,shadow:0};
 const numberStyle={...cardStyle,size:41,weight:800};
 function cardBox(x,y,w,h,t,variant='plain'){
  add('card',x,y,w,h,t,variant==='soft'?softStyle:cardStyle);
 }
 function metric(x,y,w,h,title){add('kpi',x,y,w,h,'—\n'+title,numberStyle);}
 function chart(kind,x,y,w,h){add(kind,x,y,w,h,'원자료 연결 후 표시',cardStyle);}
 function table(x,y,w,h,labels){add('table',x,y,w,h,'자료 입력 필요',cardStyle,{rows:labels||[['항목','현재','비교','변화'],['항목 A','—','—','—'],['항목 B','—','—','—'],['항목 C','—','—','—']]});}
 function evidence(){add('text',67,238,1110,40,'선택한 판단을 검증하는 자료를 배치하세요.',{size:20,color:muted});}
 // Original report pages use a stable 16:9 typographic scale; no copied brand mark.
 add('text',68,50,1110,36,`${FAMILY_KO[p.family]||'전문 보고'}  /  ${String(i+1).padStart(2,'0')} — 06`,labelStyle);
 add('title',66,p.graphic==='editorial'?112:115,1150,100,head,titleStyle);
 if(p.graphic==='compact'||p.graphic==='tables')add('text',70,218,1030,35,'의사결정에 필요한 핵심 근거만 배치',{size:17,color:muted});
 switch(role){
  case 'cover':
   add('text',68,256,1000,80,'핵심 메시지를 간결하게 입력하세요.',{size:32,weight:600,color:accent});
   cardBox(69,397,756,196,'SUMMARY\n결론·대상·기간을 명확히 정리','soft');
   cardBox(862,397,348,196,'FOCUS\n핵심 분석 범위');
   break;
  case 'thesis':case 'question':case 'letter':
   add('text',69,258,1130,92,role==='question'?'우리가 답해야 할 질문':'한 문장의 명확한 결론을 여기에 입력',{size:31,weight:650,color:accent});
   cardBox(69,410,548,183,'FACT 01\n확인된 핵심 사실');
   cardBox(648,410,562,183,'IMPLICATION 02\n의사결정에 주는 의미','soft');
   break;
  case 'kpi':
   [69,455,841].forEach((x,j)=>metric(x,266,351,244,['매출·성과 지표','비용·효율 지표','성장·변화 지표'][j]));
   add('text',71,543,1100,52,'각 지표의 단위·비교 기간·출처를 반드시 확인하세요.',{size:20,color:muted});
   break;
  case 'growth':case 'chart':case 'forecast':
   chart(role==='growth'?'bar':'line',69,258,759,338);
   cardBox(864,258,346,338,(role==='forecast'?'FORECAST':'INSIGHT')+'\n근거와 해석을 입력','soft');
   break;
  case 'map':case 'segment':case 'evidence':
   cardBox(69,257,735,337,(role==='map'?'REGION / MARKET':role==='evidence'?'DATA / EVIDENCE':'BUSINESS / SEGMENT')+'\n구분별 데이터 또는 지도·그래픽 삽입','soft');
   cardBox(838,257,372,159,'01\n비교 근거');
   cardBox(838,434,372,160,'02\n시사점');
   break;
  case 'driver':case 'investment':
   [69,461,853].forEach((x,j)=>cardBox(x,274,347,294,`${String(j+1).padStart(2,'0')}  ${role==='driver'?'성장 동인':'투자 주제'}\n자료·검증 항목 입력`,j===1?'soft':'plain'));
   break;
  case 'matrix':case 'risk':case 'scenario':case 'heatmap':
   [0,1,2,3].forEach(j=>cardBox(69+(j%2)*576,269+Math.floor(j/2)*171,541,147,
    `${['A','B','C','D'][j]}  ${role==='risk'?'위험 요인':role==='scenario'?'가정·시나리오':role==='heatmap'?'영향·가능성':'검토 대안'}\n정량/정성 근거`,j===1||j===2?'soft':'plain'));
   break;
  case 'table':case 'method':
   table(69,261,1139,344,role==='method'?[['검토 항목','자료 출처','기준 시점','검증 상태'],['자료 A','미입력','미입력','확인 필요'],['자료 B','미입력','미입력','확인 필요']]:undefined);
   break;
  case 'roadmap':case 'progress':case 'decision':
   [69,454,839].forEach((x,j)=>cardBox(x,283,353,285,`${String(j+1).padStart(2,'0')}  ${role==='decision'?'의사결정':role==='progress'?'진행 단계':'실행 단계'}\n책임자 · 기한 · 확인 기준`,j===1?'soft':'plain'));
   break;
  case 'targets':
   metric(69,261,350,235,'현재 수준');metric(455,261,350,235,'목표 수준');metric(841,261,350,235,'변화폭');
   cardBox(69,526,1122,86,'GOAL   /   전제 조건과 판단 근거');
   break;
  case 'pyramid':
   cardBox(69,260,372,333,'HIGH\n상위 계층','soft');
   cardBox(466,300,348,293,'MID\n중간 계층');
   cardBox(839,349,370,244,'BASE\n기초 계층','soft');
   break;
  case 'network':
   cardBox(69,282,327,271,'INPUT\n현황·과제');
   add('text',416,358,74,75,'→',{size:53,weight:700,color:accent,align:'center'});
   cardBox(503,282,327,271,'PROCESS\n연계 구조','soft');
   add('text',848,358,73,75,'→',{size:53,weight:700,color:accent,align:'center'});
   cardBox(934,282,274,271,'OUTCOME\n기대 효과');
   break;
 }
 add('text',70,645,1133,40,'SOURCE  /  발행처 · 기준일 · 자료 URL 입력   |   수치 미입력', {size:14,color:muted});
 // Preserve an unanimated professional reading experience by default.
 const page={id:C.uid('page'),tab:head,customTab:true,headline:head,subtitle:'자료·숫자·출처는 사용자가 검증하고 입력해야 합니다.',background:bg,layout:'blank',transition:'none',elements};
 return page;
}
function buildPack(packId,choice='original'){const p=find(packId);if(!p)throw Error('Unknown professional report reference');return p.patterns.map((_,i)=>buildPage(packId,i,choice));}
const PACKS=Object.freeze(catalog.map(({id,company,originalTitle,family,source,evidence,patterns,colors,graphic})=>Object.freeze({id,company,originalTitle,family,source,evidence,patterns:patterns.slice(),colors:{...colors},graphic})));
const api={PACKS,find,buildPage,buildPack,PAGE_KINDS,FAMILY_KO,NAME_KO};
root.DocutProReports=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
