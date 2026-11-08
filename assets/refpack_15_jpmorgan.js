(function(root){'use strict';
const R=root.DocutRefArt;if(!R)throw Error('Reference art core required');
R.register('FIN-15',{
 bg:'#FAFAFA',fg:'#1B2D3E',accent:'#174E88',soft:'#E8F0F5',paper:'#FFFFFF',dim:'#697984',font:'Arial',
 chartKey:'jpm-longterm',chartName:'장기 금융 / Blue Slate',chartColors:['#174E88','#416D8F','#94B7C9','#B8C7D0','#557D93'],
 tabs:['연차 경영 메시지','재무 하이라이트','장기 성장 추이','비교 우위','위험·준비금','회계·출처'],
 pages:[
 d=>{const c=d.c;d.box(0,0,1280,720,'#253C4F');d.box(0,430,1280,290,'#627E8D');d.oval(738,91,460,388,'#637C85');d.oval(832,200,312,267,'#2B4E67');d.box(65,101,775,431,'#FFFFFF');d.type(95,136,672,38,'ANNUAL SHAREHOLDER LETTER',16,c.accent,760);d.title(93,225,677,195,'원칙과 성과를\n함께 설명합니다',60,c.fg);d.line(97,465,592,4,c.accent);d.type(94,492,638,28,'기준 연도·자료 입력',16,c.dim);},
 d=>{const c=d.c;d.head('FINANCIAL HIGHLIGHTS');d.title(66,117,1068,87,'핵심 재무 지표와 기간 비교',45);d.table(68,247,763,318,[['지표','당기','전기','증감'],['순이익','—','—','—'],['주당순이익','—','—','—'],['ROE','—','—','—'],['자본','—','—','—']],'재무 요약 / 공시 확인');d.metric(858,277,335,115,'핵심 성과','—',{background:c.soft});d.metric(858,421,334,118,'건전성 지표','—',{background:c.soft});d.foot();},
 d=>{const c=d.c;d.head('LONG-TERM OPERATING TREND');d.title(68,114,1058,93,'단기 변화는 장기 추세와 함께 읽어야',43);d.chart('line',67,255,812,321,'장기 성과 / 엑셀 연결');d.line(899,265,2,295,c.accent);d.type(927,283,242,155,'분기·연도\n비교 기준\n자료 범위',21,c.dim,550,{lineHeight:1.7});d.foot();},
 d=>{const c=d.c;d.head('PEER AND SEGMENT COMPARISON');d.title(68,115,1081,91,'사업부·경쟁군 비교의 가정',43);d.chart('bar',65,255,676,315,'사업별 지표 / 자료 연결');d.box(771,255,424,315,c.soft);d.type(796,281,367,46,'비교의 유효성',25,c.fg,740);d.type(795,368,352,150,'회계 기준 일치\n규모·시장 차이\n표본·출처 검증',20,c.dim,500,{lineHeight:1.7});d.foot();},
 d=>{const c=d.c;d.head('BALANCE SHEET / RISK');d.title(68,118,1042,88,'위험을 충분히 설명하는 자료',43);d.box(65,257,539,303,c.soft);d.box(631,257,547,303,c.paper);d.type(90,280,486,43,'RISK EXPOSURE',19,c.accent,760);d.type(93,348,470,135,'신용·시장·유동성\n위험별 노출과 규제 기준',24,c.fg,600);d.type(662,280,484,43,'RESERVES / POLICY',19,c.accent,760);d.type(666,348,462,135,'준비금·자본·회복 계획\n기준일과 담당자 확인',24,c.fg,600);d.foot();},
 d=>{const c=d.c;d.head('RECONCILIATIONS / NOTES');d.title(69,117,1060,95,'연간 수치와 회계 주석의 추적성',43);d.table(69,260,1115,300,[['보고 지표','출처','집계 방법','확인'],['자본·대출','—','—','—'],['수익·비용','—','—','—'],['위험·충당','—','—','—']],'재무 공시 부속 표');d.foot();}
 ]});
})(typeof globalThis!=='undefined'?globalThis:this);