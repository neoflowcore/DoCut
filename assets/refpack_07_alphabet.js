(function(root){'use strict';
const R=root.DocutRefArt;if(!R)throw Error('Reference art core required');
R.register('EARN-07',{
 bg:'#FFFFFF',fg:'#242A30',accent:'#4285F4',soft:'#F0F5FD',paper:'#FFFFFF',dim:'#697682',font:'Arial',
 chartKey:'alphabet-quarter-multi',chartName:'사업별 실적 / Multi',chartColors:['#4285F4','#EA4335','#FBBC05','#34A853','#8797AD'],
 tabs:['매출 성장 요약','6개 주요 지표','사업별 실적','비용·투자 변화','주요 가정','회계 기준·조정'],
 pages:[
 d=>{const c=d.c;[['#4285F4',64],['#EA4335',100],['#FBBC05',136],['#34A853',172]].forEach(([co,x])=>d.box(x,64,25,25,co));d.type(67,134,1070,25,'QUARTERLY RESULTS / GROWTH',17,c.dim,700);d.title(62,211,1031,139,'성장 수치를\n사업별로 분해합니다',61);d.line(67,420,1123,3,c.soft);d.metric(68,453,355,128,'매출 증가','—');d.metric(468,453,355,128,'영업 실적','—');d.metric(859,453,345,128,'현금흐름','—');d.foot();},
 d=>{const c=d.c;d.head('GAAP / KEY FIGURES');d.title(65,120,1025,83,'모든 KPI에 같은 단위를 적용',44);const metrics=['연결 매출','사업부문 1','사업부문 2','영업이익','CAPEX','현금흐름'];metrics.forEach((v,i)=>{const x=70+i%3*380,y=242+Math.floor(i/3)*165;d.line(x,y,333,6,['#4285F4','#EA4335','#FBBC05','#34A853','#4285F4','#EA4335'][i]);d.metric(x,y+18,333,112,v,'—');});d.foot();},
 d=>{const c=d.c;d.head('BUSINESS / SEGMENTS');d.title(65,119,1084,82,'사업별 비교는 동일 기준에서 수행',45);d.chart('bar',69,258,745,304,'사업별 매출·성장률 / 엑셀 연결');d.line(847,265,2,290,c.soft);['플랫폼·서비스','클라우드·기업','신규 사업'].forEach((v,i)=>{d.box(883,270+i*93,281,76,i===1?c.soft:c.paper);d.type(894,291+i*93,262,44,v,19,c.fg,700);});d.foot();},
 d=>{const c=d.c;d.head('COST BRIDGE / OPERATING EXPENSES');d.title(66,119,1082,87,'지출의 변화가 어디에서 발생했는가',43);d.box(64,246,128,328,c.soft);d.type(78,266,99,65,'COST\nDRIVERS',17,c.accent,800);d.chart('bar',226,249,952,321,'비용 항목 증감 / 단위 확인');d.foot();},
 d=>{const c=d.c;d.head('LOOKING AHEAD / ASSUMPTIONS');d.title(66,119,1083,92,'전망은 숫자가 아닌 가정부터',44);d.table(67,257,1117,297,[['범주','기준 시나리오','기회','제약'],['수요','—','—','—'],['가격','—','—','—'],['투자','—','—','—'],['정책','—','—','—']],'가정 변화 비교');d.type(70,581,1040,32,'추정치는 명확한 기간·범위·면책 설명이 필요합니다.',17,c.dim);d.foot();},
 d=>{const c=d.c;d.head('FINANCIAL APPENDIX');d.title(67,112,1030,99,'GAAP과 조정 지표를 명확히 표시',43);d.box(64,245,1148,8,'#4285F4');d.table(67,271,1106,293,[['항목','GAAP','조정 항목','비GAAP'],['영업이익','—','—','—'],['순이익','—','—','—'],['주당이익','—','—','—']],'조정 내역 및 출처 입력');d.foot('조정항목·각주 미입력 / 모든 재무 수치 검증 필요');}
 ]});
})(typeof globalThis!=='undefined'?globalThis:this);