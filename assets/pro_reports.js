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
// Every pack owns its visual grammar and six composition choices. This deliberately
// does not route every organization through a common colored card layout.
const ART_DIRECTIONS=[
 {name:'Editorial thesis',font:'Georgia',headline:'왼쪽 결론 · 오른쪽 근거',scheme:'editorial',recipes:['argument','lattice','slope','compare','decision','steps']},
 {name:'Emerald geography',font:'Arial',headline:'지역·자산 흐름',scheme:'green-split',recipes:['region','rings','steps','heat','bars','columns']},
 {name:'Red-line private equity',font:'Arial',headline:'투자 논점과 회수 구조',scheme:'red-line',recipes:['deals','cascade','bars','table','decision','threshold']},
 {name:'Human dynamics',font:'Pretendard',headline:'조직·사람·변화',scheme:'lime-grid',recipes:['people','pulse','lattice','columns','heat','steps']},
 {name:'Technology vision',font:'Gmarket Sans',headline:'기술·시나리오·실행',scheme:'purple-stage',recipes:['vision','orbits','hex','scenario','clusters','steps']},
 {name:'Product performance',font:'Arial',headline:'제품·실적·투자',scheme:'blue-product',recipes:['metrics','spark','segments','waterfall','clusters','forecast']},
 {name:'Business ecosystem',font:'Arial',headline:'서비스별 매출·비용',scheme:'four-dots',recipes:['tiles','metrics','columns','waterfall','forecast','table']},
 {name:'Four-division enterprise',font:'system-ui',headline:'제품·서비스별 경영',scheme:'windows',recipes:['windows','letter','segments','metrics','clusters','table']},
 {name:'Human-centered progress',font:'Arial',headline:'환경·진척·책임',scheme:'minimal',recipes:['impact','orbits','steps','slope','pulse','notes']},
 {name:'Accelerated computing',font:'Arial',headline:'매출·기술 성장',scheme:'compute',recipes:['compute','bars','segments','pulse','waterfall','forecast']},
 {name:'Operations first',font:'Arial',headline:'생산·운영·실적',scheme:'industrial',recipes:['industrial','table','metrics','bars','clusters','forecast']},
 {name:'Shareholder letter',font:'Georgia',headline:'분기별 비교와 경영 설명',scheme:'letter-red',recipes:['shareholder','table','forecast','cascade','decision','notes']},
 {name:'Operating flywheel',font:'Georgia',headline:'고객·서비스·투자',scheme:'flywheel',recipes:['flywheel','orbits','metrics','segments','clusters','table']},
 {name:'Capital allocation',font:'Georgia',headline:'자본·수익·리스크',scheme:'midnight-gold',recipes:['capital','metrics','slope','segments','heat','notes']},
 {name:'Long-term value',font:'Arial',headline:'성과·주주가치·근거',scheme:'bank-blue',recipes:['longterm','metrics','slope','compare','heat','table']},
 {name:'Wealth distribution',font:'Georgia',headline:'지역·자산 분포',scheme:'cream-pyramid',recipes:['wealth','region','pyramid','segments','cascade','notes']},
 {name:'Investor day targets',font:'Arial',headline:'현재·목표·차이',scheme:'target-blue',recipes:['targets','metrics','waterfall','threshold','clusters','table']},
 {name:'Global risks network',font:'Arial',headline:'위험의 우선순위·연관',scheme:'teal-risk',recipes:['risks','heat','network','clusters','scenario','decision']},
 {name:'Economic forecast',font:'Georgia',headline:'성장전망·시나리오',scheme:'policy-blue',recipes:['macro','region','slope','scenario','decision','notes']},
 {name:'Development outlook',font:'Georgia',headline:'국가·지역별 분석',scheme:'development',recipes:['development','region','table','lattice','compare','notes']}
];
function buildPage(packId,pageIndex=0,choice='original'){
 const p=find(packId),i=Number(pageIndex);
 if(!p||!Number.isInteger(i)||i<0||i>5)throw Error('존재하지 않는 전문 레퍼런스 페이지');
 if(p.id==='FIN-16'&&choice==='original'&&root.DocutUBSFidelity?.make)return root.DocutUBSFidelity.make(i);
 const d=ART_DIRECTIONS[p.seed],colors=paletteFor(p,choice),{bg,fg,accent}=colors;
 const dark=['purple-stage','compute','midnight-gold'].includes(d.scheme)&&choice==='original';
 const aux=dark?'#B7C5D0':'#5C6B75',pale=colors.muted,card=colors.card;
 const role=p.patterns[i],head=NAME_KO[role]||'전문 보고',elements=[];
 const BASE={font:d.font,align:'left',size:20,weight:400,color:fg,background:'transparent',radius:0,shadow:0,opacity:1};
 function B(type,x,y,w,h,text='',style={},data){
  x=Math.max(0,Math.min(1240,Math.round(x)));y=Math.max(0,Math.min(688,Math.round(y)));
  w=Math.max(40,Math.min(1280-x,Math.round(w)));h=Math.max(8,Math.min(720-y,Math.round(h)));
  const block=C.makeBlock(type,x,y,{w,h,text,style:{...BASE,...style},effects:[],locked:false,verified:false,source:'',asOfDate:'',unit:'',evidence:''});
  if(['bar','line','donut'].includes(type))block.data={labels:['기간 A','기간 B','기간 C','기간 D'],values:[0,0,0,0],palette:'default',unit:''};
  if(type==='table')block.data={rows:data?.rows||[['구분','기준','비교','설명'],['항목 A','—','—','미입력'],['항목 B','—','—','미입력'],['항목 C','—','—','미입력']],cells:[]};
  elements.push(C.normalizeBlock(block));return elements.at(-1);
 }
 function shape(x,y,w,h,c=accent,r=0,mask='none'){return B('shape',x,y,w,h,'',{background:c,radius:r,mask});}
 function type(x,y,w,h,text,size=24,c=fg,weight=650,opts={}){return B('text',x,y,w,h,text,{size,color:c,weight,...opts});}
 function box(x,y,w,h,label='',kind='card',tone=card){return B(kind,x,y,w,h,label,{size:Math.max(14,Math.min(23,h/7)),color:fg,background:tone,weight:560,radius:['minimal','red-line','industrial','letter-red','bank-blue','policy-blue','development'].includes(d.scheme)?0:14,shadow:dark?0:2});}
 function metric(x,y,w,h,label){return B('kpi',x,y,w,h,'—\n'+label,{size:Math.min(56,h*.23),weight:800,color:fg,background:card,radius:d.scheme==='minimal'?24:8,shadow:0});}
 function chart(type,x,y,w,h,label='실제 데이터 연결'){return B(type,x,y,w,h,label,{size:19,color:fg,background:card,radius:9});}
 function tbl(x,y,w,h,rows){return B('table',x,y,w,h,'자료를 입력하세요',{size:17,color:fg,background:card,radius:6}, {rows});}
 const ink=dark?'#F7F9FD':fg;
 const top=(n)=>String(n+1).padStart(2,'0');
 let Z={x:76,y:238,w:1130,h:365};
 // Bespoke page masters: different spatial information architectures, not recolored panels.
 switch(d.scheme){
  case 'editorial':
   shape(0,0,15,720,accent);shape(73,104,1133,3,accent);type(76,43,680,33,'PERSPECTIVE     /     '+top(i),14,accent,800);
   B('title',76,123,750,98,head,{size:55,font:'Georgia',weight:750,color:fg});
   shape(887,113,2,92,accent);type(918,123,269,86,'KEY MESSAGE\n근거로 뒷받침하는 결론',16,aux,620);Z={x:76,y:246,w:1130,h:367};break;
  case 'green-split':
   shape(0,0,365,720,accent);shape(365,0,9,720,'#A6C5AA');
   type(43,55,275,30,'MARKET INTELLIGENCE',16,'#FFFFFF',700);B('title',43,150,295,190,head,{size:65,weight:800,color:'#FFFFFF'});
   type(44,590,268,40,'INSIGHT   '+top(i)+' / 06',15,'#EDF9F0',700);
   Z={x:420,y:112,w:780,h:500};break;
  case 'red-line':
   shape(0,0,22,720,accent);shape(66,67,1144,5,accent);type(65,31,650,27,'INVESTMENT / THESIS   '+top(i),13,accent,750);
   B('title',66,112,1080,106,head,{size:61,font:'Arial',weight:780,color:fg});Z={x:67,y:267,w:1142,h:335};break;
  case 'lime-grid':
   shape(0,0,680,720,'#24322C');shape(636,0,22,720,accent);
   type(70,55,490,26,'HUMAN CAPITAL / '+top(i),14,'#CFDEA6',700);B('title',69,138,540,155,head,{size:66,weight:820,color:'#FFFFFF'});
   shape(80,360,230,9,accent);type(75,394,500,98,'일하는 방식과\n조직의 선택',27,'#D5E3D0',650);
   Z={x:716,y:100,w:493,h:502};break;
  case 'purple-stage':
   shape(0,0,1280,720,bg);shape(852,-20,470,540,pale,70,'ellipse');shape(1050,98,260,360,accent,75,'diamond');
   type(70,65,800,28,'TECH VISION    /    '+top(i),17,accent,750);B('title',70,122,825,116,head,{size:68,weight:860,color:ink});
   Z={x:71,y:270,w:1138,h:341};break;
  case 'blue-product':
   shape(0,0,1280,18,accent);type(68,61,920,28,'PRODUCT PERFORMANCE     '+top(i),16,accent,750);
   B('title',68,112,1040,92,head,{size:58,weight:770,color:fg});shape(69,215,1132,2,'#BDDBE9');
   Z={x:69,y:244,w:1131,h:375};break;
  case 'four-dots':
   ['#4285F4','#EA4335','#FBBC05','#34A853'].forEach((c,j)=>shape(66+j*45,48,23,23,c,12,'circle'));
   type(285,49,720,27,'BUSINESS & PLATFORM     /    '+top(i),14,aux,700);
   B('title',67,108,1120,104,head,{size:59,weight:780,color:fg});
   Z={x:70,y:239,w:1130,h:385};break;
  case 'windows':
   [['#287FB6',67,65],['#E1B25B',95,65],['#91B575',67,93],['#B16864',95,93]].forEach(([c,x,y])=>shape(x,y,24,24,c,0));
   type(142,77,440,29,'BUSINESS OVERVIEW',15,accent,700);B('title',72,144,1130,81,head,{size:52,weight:710,color:fg});
   Z={x:74,y:259,w:1123,h:350};break;
  case 'minimal':
   type(90,59,900,26,'PROGRESS     '+top(i),13,aux,630);B('title',85,128,1090,116,head,{size:70,weight:780,color:fg});
   shape(75,640,1130,2,'#CED2CF');Z={x:86,y:294,w:1090,h:305};break;
  case 'compute':
   shape(0,0,1280,720,bg);shape(0,0,16,720,accent);shape(68,61,230,7,accent);
   type(68,93,1070,28,'COMPUTE / GROWTH   '+top(i),15,accent,800);
   B('title',67,158,1135,96,head,{size:68,weight:820,color:ink});Z={x:69,y:291,w:1134,h:340};break;
  case 'industrial':
   shape(64,42,1153,3,fg);type(65,57,1040,25,'OPERATIONAL UPDATE   /   '+top(i),13,fg,750);
   B('title',65,130,1100,93,head,{size:62,weight:750,color:fg});shape(64,229,1153,2,fg);
   Z={x:65,y:265,w:1145,h:351};break;
  case 'letter-red':
   shape(0,0,10,720,accent);type(76,61,800,28,'SHAREHOLDER LETTER   /   '+top(i),15,accent,800);
   B('title',76,123,1050,104,head,{size:62,font:'Georgia',weight:730,color:fg});shape(75,234,1131,3,accent);
   Z={x:76,y:272,w:1130,h:344};break;
  case 'flywheel':
   shape(0,0,1280,18,'#314752');shape(0,18,1280,8,accent);
   type(75,62,990,33,'CUSTOMER / BUSINESS SYSTEM   '+top(i),15,accent,800);
   B('title',75,113,1090,95,head,{size:59,font:'Georgia',weight:750,color:fg});
   Z={x:78,y:249,w:1130,h:362};break;
  case 'midnight-gold':
   shape(0,0,1280,720,bg);shape(0,0,1280,11,accent);type(73,52,970,25,'CAPITAL MARKETS / '+top(i),15,accent,740);
   B('title',73,125,1070,109,head,{size:60,font:'Georgia',weight:760,color:ink});shape(73,254,1137,2,accent);
   Z={x:73,y:290,w:1136,h:329};break;
  case 'bank-blue':
   shape(0,0,28,720,accent);type(69,51,900,28,'LONG-TERM VALUE   /   '+top(i),14,accent,800);
   B('title',68,110,1110,100,head,{size:58,weight:760,color:fg});shape(68,231,1144,2,accent);
   Z={x:68,y:260,w:1140,h:356};break;
  case 'cream-pyramid':
   shape(0,0,1280,24,'#A4A495');type(76,64,700,28,'WEALTH RESEARCH / '+top(i),14,accent,680);
   B('title',76,118,1090,113,head,{size:60,font:'Georgia',weight:690,color:fg});
   Z={x:76,y:263,w:1126,h:339};break;
  case 'target-blue':
   shape(0,0,1280,85,accent);shape(69,238,1130,3,accent);type(67,34,1100,29,'INVESTOR STRATEGY       '+top(i)+' / 06',16,'#FFFFFF',800);
   B('title',69,122,1070,108,head,{size:61,weight:825,color:fg});
   Z={x:69,y:257,w:1131,h:359};break;
  case 'teal-risk':
   shape(0,0,285,720,'#213F45');type(38,54,220,26,'GLOBAL RISKS',15,'#C5E6DF',770);
   B('title',36,134,211,205,head,{size:49,weight:800,color:'#F8FFFF'});
   shape(44,590,200,4,'#8FCFC3');Z={x:322,y:98,w:888,h:512};break;
  case 'policy-blue':
   shape(0,0,1280,91,'#283E60');type(71,39,1110,29,'GLOBAL ECONOMY / FORECAST / '+top(i),15,'#EDF4FC',720);
   B('title',74,141,1100,102,head,{size:57,font:'Georgia',weight:680,color:fg});shape(74,250,1122,2,accent);
   Z={x:75,y:279,w:1120,h:339};break;
  case 'development':
   shape(0,0,88,720,accent);type(112,45,1020,28,'DEVELOPMENT RESEARCH   /   '+top(i),14,accent,800);
   B('title',115,119,1045,112,head,{size:58,font:'Georgia',weight:720,color:fg});shape(115,244,1054,3,'#A0BAC5');
   Z={x:115,y:269,w:1051,h:349};break;
 }
 const R=(x,y,w,h)=>[Z.x+x*Z.w,Z.y+y*Z.h,w*Z.w,h*Z.h];
 const P=(x,y,w,h,t,tone=card)=>box(...R(x,y,w,h),t,'card',tone);
 const M=(x,y,w,h,t)=>metric(...R(x,y,w,h),t);
 const T=(x,y,w,h,t,size=21,color=fg,weight=630)=>type(...R(x,y,w,h),t,size,color,weight);
 const S=(x,y,w,h,c=accent,r=0,mask='none')=>shape(...R(x,y,w,h),c,r,mask);
 const G=(kind,x,y,w,h,t)=>chart(kind,...R(x,y,w,h),t);
 const D=(x,y,w,h,rows)=>tbl(...R(x,y,w,h),rows);
 const list=(words)=>words.map(x=>x+' · 자료 입력');
 const metricLabels=['핵심 성과','전년 동기 대비','비용·투자','중장기 목표'];
 // Distinct content page bodies. Each pack deliberately selects six separate
 // recipes, and the distinctive page master is also applied on every page.
 switch(d.recipes[i]){
  case 'argument': T(.02,.06,.60,.24,'결론을 먼저 제시하고\n근거로 판단을 뒷받침',34,fg,800);S(.63,.05,.006,.91,accent);P(.67,.06,.29,.37,'01 핵심 근거');P(.67,.51,.29,.35,'02 경영 시사점',pale);break;
  case 'lattice': G('bar',.01,.03,.57,.85,'판단을 뒷받침하는 데이터');P(.62,.03,.36,.36,'관찰된 변화');P(.62,.43,.36,.45,'해석 및 한계',pale);break;
  case 'slope': G('line',.01,.08,.68,.81,'기간별 추이');P(.72,.08,.26,.81,'해석과 다음 결정',pale);break;
  case 'compare': P(.01,.03,.46,.86,'대안 A\n장점·제약');P(.53,.03,.46,.86,'대안 B\n장점·제약',pale);break;
  case 'decision': S(.02,.08,.075,.75,accent);P(.13,.05,.83,.27,'검토 기준');P(.13,.37,.83,.24,'우선 실행');P(.13,.66,.83,.26,'담당자 · 일정',pale);break;
  case 'steps': [0,1,2,3].forEach((n)=>{S(.04+n*.235,.11,.17,.035,accent);P(.04+n*.235,.18,.19,.68,top(n)+'\n'+['진단','설계','실행','점검'][n],n%2?pale:card);});break;
  case 'region': S(.02,.03,.54,.86,pale,150,'ellipse');T(.08,.23,.43,.22,'지역별\n분포 비교',27,fg,760);P(.59,.04,.39,.25,'GLOBAL / 시장');P(.59,.34,.39,.25,'REGION / 권역',pale);P(.59,.64,.39,.25,'OUTLOOK / 향후');break;
  case 'rings': G('donut',.02,.01,.54,.9,'구성 비중');M(.61,.02,.36,.38,'점유·비율');P(.61,.49,.36,.4,'주요 동인',pale);break;
  case 'bars': G('bar',.01,.04,.78,.85,'시장·기간별 비교');S(.84,.02,.008,.89,accent);P(.88,.07,.11,.77,'변화\n요인',pale);break;
  case 'columns': [0,1,2].forEach(n=>P(.02+n*.33,.08,.30,.76,['현황\n직접 데이터','원인\n변화 요인','대응\n판단 기준'][n],n===1?pale:card));break;
  case 'deals': T(.01,.04,.74,.21,'시장 동향을\n핵심 판단으로',32,fg,780);S(.01,.42,.98,.018,accent);M(.01,.49,.30,.42,'집행 규모');M(.35,.49,.30,.42,'회수 흐름');M(.69,.49,.30,.42,'수익성');break;
  case 'cascade': P(.01,.04,.54,.83,'시장 흐름\n상향·하향 요인');P(.59,.04,.4,.37,'동인 01',pale);P(.59,.49,.4,.38,'동인 02');break;
  case 'table': D(.01,.02,.97,.86,[['항목','이번 기간','이전 기간','변화'],['항목 A','—','—','—'],['항목 B','—','—','—'],['항목 C','—','—','—']]);break;
  case 'threshold': M(.02,.01,.45,.35,'목표 대비 차이');G('bar',.52,.01,.45,.82,'구간별 차이');P(.02,.44,.45,.36,'의사결정 기준',pale);break;
  case 'people': S(.05,.13,.30,.54,accent,120,'circle');T(.37,.13,.6,.28,'구성원 경험과\n업무 전환',34,fg,820);P(.40,.51,.54,.34,'핵심 응답과 개선 과제');break;
  case 'pulse': M(.01,.01,.44,.4,'경영·성과 지표');G('line',.49,.01,.50,.85,'조직 및 성과 변화');P(.01,.5,.44,.36,'변화를 만든 요인',pale);break;
  case 'heat': [0,1,2,3].forEach(n=>P(.02+n%2*.49,.03+Math.floor(n/2)*.46,.46,.41,['사람','기술','조직','환경'][n]+' / 영향',n===1||n===2?pale:card));break;
  case 'vision': S(.02,.08,.28,.79,accent,95,'diamond');T(.38,.08,.56,.3,'새로운 상호작용\n기술의 전환',35,ink,800);P(.38,.51,.6,.32,'미래 시나리오',pale);break;
  case 'orbits': S(.04,.05,.56,.83,pale,160,'ellipse');S(.12,.18,.30,.51,accent,160,'circle');P(.66,.06,.32,.37,'중심 지표');P(.66,.48,.32,.4,'확장 영역',pale);break;
  case 'hex': [0,1,2].forEach(n=>{S(.03+n*.31,.13,.26,.66,n===1?accent:pale,0,'diamond');T(.06+n*.31,.38,.20,.16,['기술','운영','확장'][n],19,fg,800);});break;
  case 'scenario': P(.01,.03,.63,.84,'기준 시나리오\n가정과 기대 효과',pale);P(.68,.03,.31,.39,'상향 전망');P(.68,.48,.31,.39,'하향 위험');break;
  case 'clusters': [0,1,2,3,4].forEach(n=>{S(.035+n*.19,.12,.13,.30,n%2?accent:pale,38,'circle');T(.026+n*.19,.54,.16,.30,top(n)+'\n세부 항목',14,fg,660);});break;
  case 'metrics': [0,1,2,3].forEach(n=>M(.01+n*.247,.04,.234,.74,metricLabels[n]));break;
  case 'spark': G('line',.01,.02,.97,.59,'기간별 주요 지표');[0,1,2].forEach(n=>M(.01+n*.326,.69,.31,.26,['성장','효율','투자'][n]));break;
  case 'segments': G('donut',.01,.03,.55,.83,'사업부별 비중');P(.60,.03,.38,.23,'사업 A');P(.60,.31,.38,.23,'사업 B',pale);P(.60,.59,.38,.23,'사업 C');break;
  case 'waterfall': G('bar',.02,.01,.65,.87,'증감 기여 구조');P(.71,.03,.27,.36,'증가 요인');P(.71,.48,.27,.36,'감소 요인',pale);break;
  case 'forecast': P(.01,.02,.44,.38,'현재 기간');P(.51,.02,.47,.38,'다음 기간',pale);G('line',.01,.49,.97,.39,'전망 추이');break;
  case 'tiles': [0,1,2,3].forEach(n=>P(.01+n%2*.51,.01+Math.floor(n/2)*.45,.48,.41,['사업 A','사업 B','사업 C','사업 D'][n],n%2?pale:card));break;
  case 'windows': [0,1,2,3].forEach(n=>{S(.01+n%2*.50,.02+Math.floor(n/2)*.45,.045,.065,['#287FB6','#E1B25B','#91B575','#B16864'][n]);P(.074+n%2*.50,.01+Math.floor(n/2)*.45,.415,.41,['Cloud','Productivity','Devices','Services'][n]);});break;
  case 'letter': T(.01,.01,.86,.27,'경영진의 핵심 메시지와\n그에 따른 판단 기준',30,fg,730);S(.02,.35,.95,.005,accent);P(.01,.44,.46,.40,'가장 중요한 변화');P(.52,.44,.46,.40,'향후 과제',pale);break;
  case 'impact': S(.70,-.08,.29,.89,pale,150,'circle');T(.01,.05,.69,.3,'작은 변화가\n만드는 큰 영향',34,fg,720);M(.02,.47,.29,.39,'감축·개선');M(.36,.47,.28,.39,'목표 도달');break;
  case 'notes': T(.01,.01,.96,.15,'자료 출처 · 기준일 · 측정 방법',24,fg,700);D(.01,.21,.96,.66,[['검증 항목','자료','기준일','검토 상태'],['자료 A','—','—','미확인'],['자료 B','—','—','미확인'],['자료 C','—','—','미확인']]);break;
  case 'compute': M(.01,.03,.48,.79,'핵심 기술 지표');G('bar',.54,.03,.44,.79,'분기 성장 비교');break;
  case 'industrial': M(.01,.01,.28,.40,'실적');M(.36,.01,.28,.40,'생산');M(.71,.01,.28,.40,'효율');D(.01,.51,.98,.36,[['지표','이번 분기','이전 분기','증감'],['지표 A','—','—','—'],['지표 B','—','—','—']]);break;
  case 'shareholder': T(.03,.02,.89,.2,'실적에 대한 경영진의 설명',31,fg,730);D(.02,.29,.95,.58,[['기간','매출','영업 성과','전년 비교'],['최근 분기','—','—','—'],['이전 분기','—','—','—'],['전년 분기','—','—','—']]);break;
  case 'flywheel': S(.33,.03,.34,.84,pale,160,'ellipse');S(.41,.21,.18,.47,accent,80,'circle');P(.03,.14,.24,.28,'고객');P(.73,.14,.24,.28,'경험',pale);P(.03,.56,.24,.28,'투자',pale);P(.73,.56,.24,.28,'효율');break;
  case 'capital': T(.02,.03,.57,.20,'장기 수익과 자본 배분',31,ink,710);M(.01,.35,.29,.52,'ROE');M(.35,.35,.29,.52,'EPS');M(.69,.35,.29,.52,'자본 효율');break;
  case 'longterm': G('line',.01,.01,.97,.65,'장기 성과 비교');T(.02,.71,.95,.13,'주석 / 기간 · 측정 기준 · 자료 출처',17,aux);break;
  case 'wealth': S(.33,.03,.34,.28,accent,0,'diamond');S(.21,.29,.58,.28,pale,0,'diamond');S(.07,.56,.86,.28,'#B4B7A5',0,'diamond');T(.04,.12,.21,.26,'자산 상위',17,fg,700);T(.70,.47,.28,.29,'자산 분포',18,fg,700);break;
  case 'pyramid': [0,1,2].forEach(n=>{S(.26-n*.09,.08+n*.26,.47+n*.18,.20,n===1?accent:pale,0,'diamond');T(.38,.11+n*.26,.29,.15,['상위','중위','기초'][n],17,fg,800);});break;
  case 'targets': M(.01,.01,.28,.46,'현재 수준');S(.34,.20,.08,.12,accent);M(.47,.01,.28,.46,'목표 수준');M(.78,.01,.21,.46,'차이');P(.01,.55,.97,.30,'목표 가정과 실행 책임',pale);break;
  case 'risks': [0,1,2,3,4,5,6,7,8,9,10,11].forEach(n=>{S(.01+n%4*.242,.015+Math.floor(n/4)*.29,.225,.27,(n%4===0||n===6)?accent:(n%3===0?pale:card));T(.02+n%4*.242,.03+Math.floor(n/4)*.29,.19,.19,['환경','경제','기술','사회'][n%4],14,n%4===0?'#FFFFFF':fg,660);});break;
  case 'network': S(.40,.30,.22,.36,accent,80,'circle');[0,1,2,3].forEach(n=>{const q=[[.01,.06],[.71,.06],[.01,.61],[.71,.61]][n];P(...q,.25,.29,['위험 A','위험 B','위험 C','위험 D'][n]);});break;
  case 'macro': G('line',.02,.06,.64,.80,'성장률 전망 · 실측 데이터 필요');P(.70,.06,.29,.37,'기준 전망');P(.70,.50,.29,.36,'리스크 요인',pale);break;
  case 'development': D(.01,.03,.64,.80,[['지역','기준 전망','다음 기간'],['지역 A','—','—'],['지역 B','—','—'],['지역 C','—','—']]);P(.68,.03,.31,.37,'구조적 요인');P(.68,.47,.31,.36,'정책적 시사점',pale);break;
 }
 // One consistent editorial provenance treatment, differing from page content.
 type(d.scheme==='green-split'?423:76,663,d.scheme==='green-split'?754:1110,23,'SOURCE  ·  발행처 / 기준일 / 실제 수치 미입력     '+(i+1)+' / 6',13,dark?'#9EADBC':aux,480);
 return {id:C.uid('page'),tab:head,customTab:true,headline:head,subtitle:'레이아웃 시안 · 실제 자료와 출처 입력 전',background:bg,layout:'blank',transition:'none',elements};
}
function buildPack(packId,choice='original'){const p=find(packId);if(!p)throw Error('Unknown professional report reference');return p.patterns.map((_,i)=>buildPage(packId,i,choice));}
const PACKS=Object.freeze(catalog.map(({id,company,originalTitle,family,source,evidence,patterns,colors,graphic,seed})=>Object.freeze({id,company,originalTitle,family,source,evidence,patterns:patterns.slice(),colors:{...colors},graphic,design:ART_DIRECTIONS[seed].name,designSystem:ART_DIRECTIONS[seed].scheme})));
const api={PACKS,find,buildPage,buildPack,PAGE_KINDS,FAMILY_KO,NAME_KO};
root.DocutProReports=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
