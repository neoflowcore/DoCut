import json
from pathlib import Path
source=Path('/mnt/data/docut_references/DoCut_Global_Professional_Reference20.json')
target=Path('/mnt/data/DoCut_recovery/source/assets/pro_reports.js')
items=json.loads(source.read_text(encoding='utf-8'))['packs']
looks=[
 ('#F6F8FA','#1F3141','#28658B','#E8F0F5','#FFFFFF','strategy','summary'),
 ('#F3F8F2','#1E3027','#267357','#E3F0E8','#FFFFFF','strategy','editorial'),
 ('#FFF9F6','#332C2B','#A34F48','#F5E7E3','#FFFFFF','strategy','compact'),
 ('#F8F9F5','#2B3330','#687C31','#ECF0DD','#FFFFFF','strategy','grid'),
 ('#191B2D','#F7F4FF','#AE85D6','#302B45','#26223B','strategy','dark'),
 ('#F6FAFC','#1B3444','#357D9E','#E4F1F6','#FFFFFF','earnings','metrics'),
 ('#FCFCFD','#202D3F','#4C6B9C','#E8EDF7','#FFFFFF','earnings','grid'),
 ('#F7FAFD','#19374B','#4D84B4','#E2EDF7','#FFFFFF','corporate','editorial'),
 ('#FAF8F4','#334036','#6C8D60','#E8EDE2','#FFFFFF','corporate','large'),
 ('#111922','#F4F7F9','#8BBE65','#27313A','#1E2A34','earnings','dark'),
 ('#F6F6F4','#252B32','#5B6E79','#E8ECEF','#FFFFFF','earnings','tables'),
 ('#FAFAFA','#252525','#9B292D','#F2E9E9','#FFFFFF','earnings','letter'),
 ('#F4F7F8','#172C34','#377789','#E2EFF2','#FFFFFF','corporate','letter'),
 ('#192532','#EFF3F7','#C2A16C','#2F3E4D','#253747','finance','dark'),
 ('#F7F9FB','#1D3348','#3B5F80','#E5EBF1','#FFFFFF','finance','tables'),
 ('#F7F6F2','#333A40','#777B69','#ECEDE6','#FFFFFF','finance','graphic'),
 ('#F6F8FB','#1D2E40','#4C77A6','#E5EDF7','#FFFFFF','finance','metrics'),
 ('#F6F8FA','#1F323C','#4C7B87','#E4EFF1','#FFFFFF','policy','risk'),
 ('#F8F7F3','#242D42','#4D6F98','#EBEEF2','#FFFFFF','policy','tables'),
 ('#F8FAFC','#263B47','#3A7C96','#E7F1F4','#FFFFFF','policy','analysis')]
# 20 differently sequenced editorial blueprints, not merely palette swaps.
sequences=[
 ['thesis','evidence','chart','segment','matrix','roadmap'],
 ['cover','map','chart','driver','risk','decision'],
 ['cover','kpi','growth','matrix','scenario','decision'],
 ['question','kpi','chart','matrix','decision','roadmap'],
 ['cover','driver','segment','scenario','matrix','roadmap'],
 ['thesis','kpi','growth','segment','investment','forecast'],
 ['thesis','kpi','segment','growth','forecast','table'],
 ['letter','driver','segment','kpi','investment','table'],
 ['cover','kpi','roadmap','chart','progress','method'],
 ['thesis','chart','segment','kpi','investment','forecast'],
 ['kpi','table','table','chart','investment','forecast'],
 ['letter','table','forecast','driver','risk','method'],
 ['letter','network','kpi','segment','driver','table'],
 ['letter','kpi','chart','segment','risk','method'],
 ['letter','kpi','chart','matrix','risk','method'],
 ['cover','map','pyramid','segment','driver','method'],
 ['thesis','kpi','growth','targets','investment','method'],
 ['thesis','matrix','heatmap','network','scenario','decision'],
 ['thesis','map','chart','scenario','decision','method'],
 ['thesis','map','table','evidence','matrix','method']]
meta=[]
for i,(p,look,seq) in enumerate(zip(items,looks,sequences)):
 bg,fg,accent,muted,card,family,graphic=look
 meta.append(dict(id=p['id'],company=p['company'],originalTitle=p['original_title'],family=p['family'],source=p['official_source'],evidence=p['review_evidence'],names=p['suggested_page_archetypes'],patterns=seq,colors=dict(bg=bg,fg=fg,accent=accent,muted=muted,card=card),graphic=graphic,seed=i))
module='''/* DoCut Studio 0.33 — independently drawn professional report layout packs.
   Official corporate reports are cited as design research, not reproduced. */
(function(root){
'use strict';
const C=root.DocutCore;
if(!C)throw Error('Docut core required');
const catalog=CATALOG_PLACEHOLDER;
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
 function metric(x,y,w,h,title){add('kpi',x,y,w,h,'—\\n'+title,numberStyle);}
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
   cardBox(69,397,756,196,'SUMMARY\\n결론·대상·기간을 명확히 정리','soft');
   cardBox(862,397,348,196,'FOCUS\\n핵심 분석 범위');
   break;
  case 'thesis':case 'question':case 'letter':
   add('text',69,258,1130,92,role==='question'?'우리가 답해야 할 질문':'한 문장의 명확한 결론을 여기에 입력',{size:31,weight:650,color:accent});
   cardBox(69,410,548,183,'FACT 01\\n확인된 핵심 사실');
   cardBox(648,410,562,183,'IMPLICATION 02\\n의사결정에 주는 의미','soft');
   break;
  case 'kpi':
   [69,455,841].forEach((x,j)=>metric(x,266,351,244,['매출·성과 지표','비용·효율 지표','성장·변화 지표'][j]));
   add('text',71,543,1100,52,'각 지표의 단위·비교 기간·출처를 반드시 확인하세요.',{size:20,color:muted});
   break;
  case 'growth':case 'chart':case 'forecast':
   chart(role==='growth'?'bar':'line',69,258,759,338);
   cardBox(864,258,346,338,(role==='forecast'?'FORECAST':'INSIGHT')+'\\n근거와 해석을 입력','soft');
   break;
  case 'map':case 'segment':case 'evidence':
   cardBox(69,257,735,337,(role==='map'?'REGION / MARKET':role==='evidence'?'DATA / EVIDENCE':'BUSINESS / SEGMENT')+'\\n구분별 데이터 또는 지도·그래픽 삽입','soft');
   cardBox(838,257,372,159,'01\\n비교 근거');
   cardBox(838,434,372,160,'02\\n시사점');
   break;
  case 'driver':case 'investment':
   [69,461,853].forEach((x,j)=>cardBox(x,274,347,294,`${String(j+1).padStart(2,'0')}  ${role==='driver'?'성장 동인':'투자 주제'}\\n자료·검증 항목 입력`,j===1?'soft':'plain'));
   break;
  case 'matrix':case 'risk':case 'scenario':case 'heatmap':
   [0,1,2,3].forEach(j=>cardBox(69+(j%2)*576,269+Math.floor(j/2)*171,541,147,
    `${['A','B','C','D'][j]}  ${role==='risk'?'위험 요인':role==='scenario'?'가정·시나리오':role==='heatmap'?'영향·가능성':'검토 대안'}\\n정량/정성 근거`,j===1||j===2?'soft':'plain'));
   break;
  case 'table':case 'method':
   table(69,261,1139,344,role==='method'?[['검토 항목','자료 출처','기준 시점','검증 상태'],['자료 A','미입력','미입력','확인 필요'],['자료 B','미입력','미입력','확인 필요']]:undefined);
   break;
  case 'roadmap':case 'progress':case 'decision':
   [69,454,839].forEach((x,j)=>cardBox(x,283,353,285,`${String(j+1).padStart(2,'0')}  ${role==='decision'?'의사결정':role==='progress'?'진행 단계':'실행 단계'}\\n책임자 · 기한 · 확인 기준`,j===1?'soft':'plain'));
   break;
  case 'targets':
   metric(69,261,350,235,'현재 수준');metric(455,261,350,235,'목표 수준');metric(841,261,350,235,'변화폭');
   cardBox(69,526,1122,86,'GOAL   /   전제 조건과 판단 근거');
   break;
  case 'pyramid':
   cardBox(69,260,372,333,'HIGH\\n상위 계층','soft');
   cardBox(466,300,348,293,'MID\\n중간 계층');
   cardBox(839,349,370,244,'BASE\\n기초 계층','soft');
   break;
  case 'network':
   cardBox(69,282,327,271,'INPUT\\n현황·과제');
   add('text',416,358,74,75,'→',{size:53,weight:700,color:accent,align:'center'});
   cardBox(503,282,327,271,'PROCESS\\n연계 구조','soft');
   add('text',848,358,73,75,'→',{size:53,weight:700,color:accent,align:'center'});
   cardBox(934,282,274,271,'OUTCOME\\n기대 효과');
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
'''
module=module.replace('CATALOG_PLACEHOLDER',json.dumps(meta,ensure_ascii=False,separators=(',',':')))
target.write_text(module,encoding='utf-8')
print('generated',target,target.stat().st_size)
