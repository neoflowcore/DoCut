(function(root){'use strict';
const R=root.DocutRefArt;if(!R)throw Error('Reference art core required');
R.register('PUB-19',{
 bg:'#FFFFFF',fg:'#233856',accent:'#1A5E91',soft:'#EAF2FA',paper:'#FFFFFF',dim:'#687A8D',font:'Georgia',
 chartKey:'macro-forecast-blue',chartName:'경제 전망 / Formal Blue',chartColors:['#1A5E91','#6A9EC9','#AEC5D8','#DA9D4E','#677CA3'],
 tabs:['세계 경제 전망','권역별 성장 비교','물가·성장 추이','하방 위험 분석','정책 시사점','통계 부록'],
 pages:[
 d=>{const c=d.c;d.box(0,0,1280,112,'#17375B');d.type(73,42,1010,27,'MACROECONOMIC RESEARCH / WORLD OUTLOOK',16,'#D5E8F7',700);d.title(72,188,1111,179,'세계 경제 전망의\n불확실성을 읽다',62,c.fg,{font:'Georgia'});d.line(76,416,1085,4,c.accent);d.type(75,455,1010,125,'기준·전망·하방 위험을 분리하는\n정량적 정책 분석 보고서입니다.',23,c.dim,450);d.type(78,617,860,28,'기준월·데이터 출처·작성자 입력',15,c.dim);},
 d=>{const c=d.c;d.head('REGIONAL GROWTH COMPARISON');d.title(66,118,1092,94,'권역별 전망을 같은 지표로 비교',43);d.chart('bar',66,258,812,315,'지역 성장 전망 / 엑셀 연결');d.box(915,258,288,315,c.soft);d.type(935,281,246,40,'주의',23,c.fg,700);d.type(935,348,244,160,'실적·전망의 차이\n가격·환율 기준\n권역 범위 검증',18,c.dim,500,{lineHeight:1.65});d.foot();},
 d=>{const c=d.c;d.head('GROWTH / INFLATION TIME SERIES');d.title(69,117,1079,89,'성장률과 물가의 기간별 궤적',43);d.chart('line',67,261,1097,310,'실측 및 전망 시계열 / 단위 입력');d.type(70,597,1081,31,'시계열에 실제값·예측값이 혼합된 경우 반드시 구분하세요.',16,c.dim);d.foot();},
 d=>{const c=d.c;d.head('DOWNSIDE SCENARIOS / RISK');d.title(67,115,1070,94,'하방 위험을 기준 시나리오와 비교',43);d.box(67,255,513,300,c.soft);d.box(604,255,578,300,c.paper);d.type(88,280,470,42,'BASELINE / 기준',19,c.accent,800);d.type(88,349,462,128,'자료에 근거한 전망\n가정·불확실성 입력',24,c.fg,600);d.type(629,280,509,42,'DOWNSIDE / 하방',19,c.accent,800);d.type(629,349,494,128,'위험 발생 시 편차\n충격 경로·대응 입력',24,c.fg,600);d.foot();},
 d=>{const c=d.c;d.head('MACROECONOMIC POLICY OPTIONS');d.title(67,117,1105,94,'정책 대안에는 제약 조건을 함께',43);d.table(68,259,1123,303,[['정책 영역','목표','기회','비용·위험'],['재정','—','—','—'],['통화','—','—','—'],['구조개혁','—','—','—']],'정책 대안 비교 / 근거 입력');d.line(69,584,1121,5,c.accent);d.foot();},
 d=>{const c=d.c;d.head('DATA / DEFINITIONS');d.title(68,117,1100,93,'데이터 정의와 개정 이력을 기록',43);d.table(67,257,1127,306,[['지표','단위','기준연도','자료','개정'],['성장률','%','—','미입력','—'],['물가','%','—','미입력','—'],['투자','—','—','미입력','—']],'전망 데이터 정의·개정표');d.foot('실측값·전망값·수정치의 출처를 별도로 확인');}
 ]});
})(typeof globalThis!=='undefined'?globalThis:this);