(function(root){'use strict';
const R=root.DocutRefArt;if(!R)throw Error('Reference art core required');
R.register('EARN-12',{
 bg:'#FFFFFF',fg:'#181818',accent:'#C81624',soft:'#F7EDEE',paper:'#FFFFFF',dim:'#797979',font:'Arial',
 chartKey:'netflix-quarter-red',chartName:'분기 서한 / Red',chartColors:['#D41928','#202020','#A7A5A5','#E5A7AF','#747575'],
 tabs:['분기 경영 서한','분기별 수치','전망·가이던스','성장 동인','위험·제약','재무 주석'],
 pages:[
 d=>{const c=d.c;d.box(0,0,1280,9,c.accent);d.type(74,64,1062,32,'SHAREHOLDER COMMUNICATION',15,c.accent,800);d.line(72,110,1131,2,c.accent);d.title(73,153,1054,140,'분기 성과를\n짧고 명확하게 설명',59);d.type(75,365,1131,173,'이 서한 형식은 매출·이익·성장 동인을 설명하는 지면입니다.\n특정 분기 수치는 사용자가 공시 자료를 검증한 뒤 입력합니다.\n주석과 전망의 경계를 분명히 표시하세요.',21,c.fg,430,{lineHeight:1.5});d.foot();},
 d=>{const c=d.c;d.head('QUARTERLY FINANCIALS');d.title(71,124,1020,88,'기간 비교와 기준의 명시',47);d.table(73,252,1102,315,[['항목','전년 동기','직전 분기','당기','전망'],['매출','—','—','—','—'],['영업이익','—','—','—','—'],['영업이익률','—','—','—','—'],['현금흐름','—','—','—','—']],'분기 비교 표 / 금액·통화 입력');d.line(73,588,1100,5,c.accent);d.foot();},
 d=>{const c=d.c;d.head('GUIDANCE / ASSUMPTIONS');d.title(71,121,1074,88,'실적과 다음 기간 전망을 분리',45);d.box(72,261,509,307,c.paper);d.box(605,261,577,307,c.soft);d.type(97,292,473,35,'CURRENT PERIOD',18,c.accent,800);d.type(96,350,425,101,'확정된 수치와\n기간을 입력하세요.',27,c.fg,650);d.type(629,292,528,34,'FORWARD GUIDANCE',18,c.accent,800);d.type(630,350,520,113,'추정의 가정과\n위험 요인을 입력하세요.',27,c.fg,650);d.foot();},
 d=>{const c=d.c;d.head('REVENUE / GROWTH DRIVERS');d.title(72,117,1085,96,'성장 동인을 빠짐없이 설명',46);d.chart('line',72,264,765,302,'분기 추이 / 업로드 데이터');d.line(863,273,2,291,c.accent);['가격·제품 구조','유료 가입자','지역·환율'].forEach((v,i)=>{d.type(892,285+i*90,278,50,'0'+(i+1)+'   '+v,18,c.fg,620);d.line(891,345+i*90,281,1,c.soft);});d.foot();},
 d=>{const c=d.c;d.head('RISKS / LIMITATIONS');d.title(70,119,1068,98,'사업·시장 위험을 설명하는 순서',43);d.line(73,255,1095,3,c.accent);const s=[['경쟁','가격·제품·콘텐츠'],['운영','기술·유통·비용'],['시장','환율·지역·규제']];s.forEach((v,i)=>{const y=291+i*95;d.type(75,y,226,47,'0'+(i+1)+'   '+v[0],23,c.fg,700);d.type(324,y,802,50,v[1]+' / 근거와 대응 입력',20,c.dim);d.line(75,y+65,1106,1,c.soft);});d.foot();},
 d=>{const c=d.c;d.head('APPENDIX / SOURCES');d.title(72,120,1070,100,'공시 주석과 지표 정의',45);d.table(73,263,1087,299,[['지표','정의','기준 기간','출처'],['영업이익률','—','—','—'],['현금흐름','—','—','—'],['가입자 지표','—','—','—']],'회계 주석 및 방법');d.type(75,585,1090,35,'측정방법 및 비GAAP 조정은 원자료로 검증하세요.',17,c.dim);d.foot();}
 ]});
})(typeof globalThis!=='undefined'?globalThis:this);