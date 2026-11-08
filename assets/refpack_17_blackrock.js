(function(root){'use strict';
const R=root.DocutRefArt;if(!R)throw Error('Reference art core required');
R.register('FIN-17',{
 bg:'#FFFFFF',fg:'#050505',accent:'#FF481B',soft:'#FFF1E9',paper:'#FFFFFF',dim:'#626262',font:'Arial',
 chartKey:'blackrock-strategy',chartName:'투자전략 / Black Orange',chartColors:['#FF481B','#FFC400','#EF8EA7','#161616','#9B9B9B'],
 tabs:['전략적 방향','핵심 지표','성장 엔진','목표 대비 격차','자본 배분','투자자 주석'],
 pages:[
 d=>{const c=d.c;d.box(0,0,1280,504,'#050505');d.title(67,115,1075,278,'새로운 성장의\n기준을 세웁니다',81,'#FFFFFF',{font:'Arial'});d.type(72,61,780,33,'INVESTOR / LONG-TERM AMBITION',16,'#D8D8D8',650);d.box(72,514,1098,5,c.accent);d.type(74,548,920,60,'전략 목표·가정·검증 일정 입력',24,c.fg,700);d.foot();},
 d=>{const c=d.c;d.head('INVESTOR METRICS / STRATEGY');d.title(68,119,1077,98,'전략 지표는 우선순위를 보여줍니다',45);const bands=[['수익 성장','#FF481B'],['서비스 확대','#FFC400'],['데이터 역량','#EF8EA7']];bands.forEach((v,i)=>{const x=67+i*384;d.box(x,270,344,260,v[1]);d.metric(x+15,314,314,130,v[0],'—',{background:v[1],color:'#111111'});d.type(x+23,482,300,34,'측정 단위 입력',17,'#181818',650);});d.foot();},
 d=>{const c=d.c;d.head('GROWTH DRIVERS / CAPITAL MARKETS');d.title(67,116,1100,90,'성장을 만드는 시장을 한눈에',45);d.oval(107,293,246,241,'#FF481B');d.oval(282,252,294,289,'#FFC400');d.oval(483,292,263,238,'#EF8EA7');d.type(124,555,630,34,'규모 · 고객 · 시장 / 실측값 입력',17,c.dim);d.line(805,257,364,8,'#050505');d.type(807,289,350,43,'성장 동인',25,c.fg,780);d.chart('bar',807,337,361,241,'성장 기여 / 실제 데이터 연결');d.foot();},
 d=>{const c=d.c;d.head('TARGETS / PERFORMANCE');d.title(68,116,1072,93,'현재와 목표 사이의 차이를 검증',45);d.metric(67,274,283,170,'현재','—',{background:c.soft});d.box(367,334,117,8,c.accent);d.metric(506,274,284,170,'목표','—',{background:'#FFDF9D'});d.box(805,334,100,8,'#050505');d.metric(930,274,282,170,'달성 차이','—',{background:'#FFD1DE'});d.type(68,509,1085,55,'목표 정의 / 소요 기간 / 데이터 기준 / 실행 책임',21,c.dim,550);d.foot();},
 d=>{const c=d.c;d.head('CAPITAL ALLOCATION / PORTFOLIO');d.title(67,115,1119,91,'투자 배분은 목적이 명확해야',45);d.chart('donut',66,253,607,331,'투자 비중 / 실제 금액 입력');d.line(702,269,2,295,'#050505');const a=[['성장 자산','#FF481B'],['안정 자산','#FFC400'],['전략 투자','#EF8EA7']];a.forEach((v,i)=>{const y=284+i*94;d.box(743,y+5,35,30,v[1]);d.type(807,y,370,53,v[0]+'  /  근거 입력',21,c.fg,660);});d.foot();},
 d=>{const c=d.c;d.head('DISCLOSURES / METRIC DEFINITIONS');d.title(66,112,1085,97,'지표 정의와 출처가 전략의 기반',44);d.box(65,238,1143,8,'#050505');d.table(69,270,1100,311,[['성과지표','기준기간','추가가정','출처'],['성장 목표','—','—','—'],['운용자산','—','—','—'],['수익성','—','—','—']],'측정 기준과 공식 출처');d.foot();}
 ]});
})(typeof globalThis!=='undefined'?globalThis:this);