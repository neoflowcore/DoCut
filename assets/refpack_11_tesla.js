(function(root){'use strict';
const R=root.DocutRefArt;if(!R)throw Error('Reference art core required');
R.register('EARN-11',{
 bg:'#F7F8F8',fg:'#272C30',accent:'#B71D2E',soft:'#EEF0F2',paper:'#FFFFFF',dim:'#707B81',font:'Arial',
 chartKey:'tesla-industrial',chartName:'운영·생산 / Industrial',chartColors:['#BB182D','#545F65','#A4ACB1','#D9DCDF','#28333A'],
 tabs:['주요 실적','재무 비교표','운영·생산 지표','기간별 추이','설비·개발 투자','성과 전망'],
 pages:[
 d=>{const c=d.c;d.box(0,0,1280,169,'#191E24');d.line(66,47,1144,4,'#FFFFFF');d.type(68,70,996,29,'QUARTERLY UPDATE / OPERATIONS',15,'#D2D5D7',750);d.title(66,206,1081,151,'운영 실적과\n재무 성과를 함께',63);d.line(70,394,1131,2,c.accent);const s=['매출','현금흐름','운영 지표'];s.forEach((v,i)=>d.metric(70+i*382,421,346,159,v,'—',{background:c.paper}));d.foot();},
 d=>{const c=d.c;d.head('FINANCIAL SUMMARY');d.title(65,119,1000,86,'손익과 현금흐름의 비교',45);d.table(67,258,1114,313,[['회계 항목','당기','전기','전년 대비','주석'],['매출액','—','—','—','—'],['매출총이익','—','—','—','—'],['영업현금흐름','—','—','—','—'],['현금 및 현금성','—','—','—','—']],'분기 재무 수치 / 공시값 확인');d.line(70,590,1112,4,c.accent);d.foot();},
 d=>{const c=d.c;d.head('OPERATIONS / DELIVERIES');d.title(68,119,1082,85,'물량과 생산능력은 다른 지표입니다',43);d.table(64,269,765,304,[['운영 항목','당기','전기','정의'],['생산','—','—','—'],['인도','—','—','—'],['가동률','—','—','—']],'운영 정의·단위 입력');d.box(855,265,323,302,c.soft);d.metric(872,309,290,142,'가동·생산','—',{background:c.soft});d.foot();},
 d=>{const c=d.c;d.head('QUARTERLY TRENDS');d.title(65,119,1077,86,'비교 대상 기간을 일관되게',45);d.chart('line',67,258,801,310,'운영·매출 추이 / 엑셀 업로드');d.line(890,261,2,311,c.accent);d.type(923,288,248,127,'기준연도\n측정단위\n보정 여부',20,c.dim,500,{lineHeight:1.7});d.foot();},
 d=>{const c=d.c;d.head('FUTURE CAPACITY / INVESTMENT');d.title(69,115,1049,94,'투자와 설비 확대의 단계',45);const a=[['개발','기술·제품'],['공급','생산 체계'],['서비스','판매·지원']];a.forEach((v,i)=>{const x=68+i*387;d.line(x,256,353,8,i===0?c.accent:c.soft);d.type(x,301,335,45,'0'+(i+1),30,c.accent,800);d.type(x,382,342,55,v[0],32,c.fg,750);d.type(x,462,340,93,v[1]+'\n투입·성과 시점 확인',18,c.dim);});d.foot();},
 d=>{const c=d.c;d.head('OUTLOOK / PRIORITIES');d.title(66,115,1105,96,'실적·계획·전망을 한 화면에',43);d.box(65,255,545,297,c.paper);d.box(638,255,544,297,c.soft);d.type(88,277,503,43,'실적 확정',23,c.accent,750);d.type(91,349,497,122,'기준 시점과 수치 입력\n공시 자료 링크 확인',24,c.fg,500);d.type(663,277,491,43,'조건부 전망',23,c.accent,750);d.type(667,349,490,122,'목표 일정과 리스크 입력\n예측 정보 구분',24,c.fg,500);d.foot();}
 ]});
})(typeof globalThis!=='undefined'?globalThis:this);