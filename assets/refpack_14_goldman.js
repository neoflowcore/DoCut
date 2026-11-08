(function(root){'use strict';
const R=root.DocutRefArt;if(!R)throw Error('Reference art core required');
R.register('FIN-14',{
 bg:'#F9FBFF',fg:'#162B46',accent:'#284F94',soft:'#EAF0FA',paper:'#FFFFFF',dim:'#64778C',font:'Georgia',
 chartKey:'gs-institutional-blue',chartName:'금융 연차 / Institutional Navy',chartColors:['#1E3F77','#416EB4','#A1BEDB','#6E8FAA','#B0BCCC'],
 tabs:['주주·자본 메시지','ROE·EPS 요약','장기 성과 추이','사업 부문 성과','위험과 자본','공시·주석'],
 pages:[
 d=>{const c=d.c;d.box(0,0,1280,720,'#193F70');d.box(0,0,1280,15,'#6A8DB4');d.type(75,83,925,34,'CAPITAL MARKETS / ANNUAL REPORT',17,'#D6E4F3',700);d.title(72,186,1011,167,'신뢰와 수익을\n함께 설계합니다',64,'#FFFFFF',{font:'Georgia'});d.line(73,425,1030,2,'#A9C0D8');d.type(74,469,860,111,'자본 효율 · 사업별 수익 · 위험 관리를\n하나의 판단 체계로 정리하세요.',23,'#D4E2ED');d.foot();},
 d=>{const c=d.c;d.head('RETURN / CAPITAL EFFICIENCY');d.title(68,117,1080,95,'성과 지표는 정의부터 명확히',45);['ROE','EPS','CET1','자본 환원'].forEach((v,i)=>{const x=68+i*285;d.box(x,273,258,260,i%2?c.soft:c.paper);d.line(x,273,258,6,c.accent);d.metric(x+18,330,218,152,v,'—',{background:i%2?c.soft:c.paper,color:c.fg});});d.foot();},
 d=>{const c=d.c;d.head('MULTI-YEAR FINANCIAL REVIEW');d.title(67,117,1089,90,'긴 시계열 속 성과의 일관성',45);d.chart('bar',68,267,820,305,'연도별 성과 / 엑셀 연결');d.box(919,266,268,306,c.soft);d.type(938,294,218,49,'기간 기준',23,c.fg,700);d.type(938,377,215,105,'연결·분할\n변경·조정\n사항 입력',19,c.dim,500);d.foot();},
 d=>{const c=d.c;d.head('DIVISIONS / FINANCIAL RESULTS');d.title(67,119,1080,93,'사업부의 수익과 비용을 분리',45);d.table(66,262,1119,300,[['사업부문','매출','세전이익','비용','비고'],['부문 A','—','—','—','—'],['부문 B','—','—','—','—'],['부문 C','—','—','—','—']],'금융 부문별 실적 / 원자료 대조');d.foot();},
 d=>{const c=d.c;d.head('RISK / CAPITAL STRENGTH');d.title(68,118,1058,91,'위험 선호와 자본건전성의 균형',43);d.chart('line',66,266,673,297,'자본·위험 지표 추이');d.box(764,265,431,297,c.soft);d.type(793,288,382,44,'리스크 점검',24,c.fg,740);['유동성','신용·시장 위험','규제 기준'].forEach((v,i)=>d.type(800,350+i*66,359,46,'0'+(i+1)+'   '+v,19,c.dim));d.foot();},
 d=>{const c=d.c;d.head('REGULATORY APPENDIX');d.title(68,117,1045,93,'금융 지표의 공시 출처를 고정',43);d.table(69,259,1114,305,[['지표','정의','발행·기준일','출처'],['자본','—','—','미입력'],['수익','—','—','미입력'],['위험','—','—','미입력']],'지표별 근거 출처');d.line(69,584,1116,4,c.accent);d.foot();}
 ]});
})(typeof globalThis!=='undefined'?globalThis:this);