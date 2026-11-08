(function(root){'use strict';
const R=root.DocutRefArt;if(!R)throw Error('Reference art core required');
R.register('EARN-10',{
 bg:'#050607',fg:'#F5F7F3',accent:'#79BC00',soft:'#1D2319',paper:'#101410',dim:'#B9C2B6',font:'Arial',
 chartKey:'nvidia-chart-green',chartName:'컴퓨팅 성장 / Green-on-Black',chartColors:['#76B900','#B6E35D','#969B96','#3B5531','#7F9E74'],
 tabs:['실적 개요','분기 매출','제품·사업라인','매출총이익률','연구개발 투자','미래 전망'],
 pages:[
 d=>{const c=d.c;d.box(0,0,1280,720,'#050607');d.box(0,0,12,720,c.accent);d.type(67,62,1035,32,'COMPUTE / QUARTERLY RESULTS',17,c.accent,800);d.title(64,150,1109,164,'성장 실적은\n데이터가 증명합니다',64,'#FFFFFF');d.line(65,369,1130,2,'#384138');d.metric(67,399,470,163,'실제 실적 입력','—',{color:'#FFFFFF',background:c.paper});d.chart('bar',583,397,622,213,'분기 성장 / 엑셀 연결');d.foot();},
 d=>{const c=d.c;d.head('REVENUE / YEAR-ON-YEAR');d.title(69,118,920,82,'기간별 매출 비교',49,'#FFFFFF');d.chart('bar',689,235,516,341,'분기별 매출 / 단위 미입력');['총매출 변화','제품 믹스','공급 여건','비교 기준'].forEach((s,i)=>{const y=254+i*80;d.box(69,y,575,69,c.paper);d.line(69,y,575,1,'#394338');d.type(86,y+19,535,42,s+' · 확인',21,'#FFFFFF',580);});d.foot();},
 d=>{const c=d.c;d.head('PRODUCT LINES / BUSINESS MIX');d.title(70,116,1050,89,'제품별 실적을 나누어 보기',47,'#FFFFFF');const s=[['컴퓨팅','#76B900'],['네트워크','#4D7C00'],['기타 서비스','#283F17']];s.forEach((v,i)=>{const x=67+i*386;d.box(x,248,351,258,v[1]);d.type(x+28,282,293,48,v[0],31,'#FFFFFF',720);d.type(x+29,423,279,49,'지표 입력 / 비교 기간',18,'#E7F3DF');});d.type(68,548,995,36,'제품군 집계 방식은 실제 공시 분류와 대조하세요.',17,c.dim);d.foot();},
 d=>{const c=d.c;d.head('MARGINS / OPERATING LEVERAGE');d.title(69,118,1083,84,'성장률과 이익률은 별개입니다',47,'#FFFFFF');d.chart('line',67,270,734,306,'이익률 추이 / 입력값');d.box(846,273,345,301,c.paper);d.type(868,292,301,38,'비용 구조와 가정',21,c.accent,800);d.type(871,362,290,151,'규모의 경제\n제품별 믹스\n재료·운영비\n검증 필요',20,'#FFFFFF',500,{lineHeight:1.6});d.foot();},
 d=>{const c=d.c;d.head('R&D / CAPITAL INVESTMENT');d.title(67,117,1084,90,'현재 투자와 미래 역량의 연결',47,'#FFFFFF');d.box(67,257,399,299,'#182317');d.metric(94,309,341,170,'R&D·CAPEX','—',{color:'#FFFFFF',background:'#182317'});d.chart('bar',508,256,685,304,'투자 항목별 차이 / 엑셀 연결');d.foot();},
 d=>{const c=d.c;d.head('OUTLOOK / FORWARD-LOOKING');d.title(69,119,1073,95,'전망에는 반드시 가정을 첨부',48,'#FFFFFF');d.line(70,237,1119,5,c.accent);const labels=['실적 기준','시장 수요','공급 능력','회계·전망'];labels.forEach((s,i)=>{const y=276+i*78;d.type(76,y,313,45,'0'+(i+1)+'   '+s,23,c.accent,770);d.line(425,y+9,1,47,'#43503E');d.type(465,y,690,44,'자료·가정·책임 주체 입력',20,'#FFFFFF',400);});d.foot('전망 수치 미입력 / 공식 공시 및 면책 조건 확인 필요');}
 ]});
})(typeof globalThis!=='undefined'?globalThis:this);