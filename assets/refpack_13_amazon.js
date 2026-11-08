(function(root){'use strict';
const R=root.DocutRefArt;if(!R)throw Error('Reference art core required');
R.register('CORP-13',{
 bg:'#FFFFFF',fg:'#191B1C',accent:'#E68A00',soft:'#F4F5F5',paper:'#FFFFFF',dim:'#707778',font:'Arial',
 chartKey:'annual-operating-orange',chartName:'운영 연차 / Amber',chartColors:['#DF8300','#253845','#8AA6B7','#F3C67B','#8D9A9F'],
 tabs:['주주 메시지','운영 선순환','성장·운영 지표','사업별 성과','전략 우선순위','연차 주석'],
 pages:[
 d=>{const c=d.c;d.box(0,0,1280,720,'#FFFFFF');d.line(68,74,1140,3,'#161C23');d.type(70,96,1080,30,'ANNUAL LETTER / OPERATING RESULTS',15,c.dim,700);d.title(67,198,1051,151,'복잡한 사업을\n명료한 원칙으로',67);d.line(69,439,1096,4,c.accent);d.type(69,462,1090,106,'장기 관점 · 운영 효율 · 고객 가치를 연결해\n주주와 이해관계자가 판단할 근거를 작성합니다.',23,c.fg,400);d.foot();},
 d=>{const c=d.c;d.head('OPERATING FLYWHEEL');d.title(68,110,1090,88,'운영 선순환을 구조로 설명',44);d.oval(399,229,434,351,c.soft);d.oval(459,283,309,244,'#FDE0B2');d.oval(523,329,184,150,'#E7A643');d.type(537,384,155,50,'고객 가치',21,'#FFFFFF',700,{align:'center'});const nodes=[['선택','상품·서비스',86,280],['효율','단위 비용',923,279],['확장','운영 규모',83,478],['투자','재투자',921,479]];nodes.forEach(v=>{d.type(v[2],v[3],278,40,v[0],27,c.fg,710);d.type(v[2],v[3]+53,285,37,v[1]+' / 입력',17,c.dim);});d.foot();},
 d=>{const c=d.c;d.head('OPERATING METRICS');d.title(67,116,1090,90,'측정 가능한 운영 지표를 연결',44);d.chart('line',66,256,801,311,'연간 성장·투자 추이 / 엑셀 연결');d.line(890,266,2,302,c.accent);d.metric(918,295,265,105,'운영 지표','—');d.metric(917,451,270,100,'투자 지표','—');d.foot();},
 d=>{const c=d.c;d.head('BUSINESS SEGMENTS');d.title(67,117,1082,91,'서로 다른 사업을 동일 기준에서 비교',43);d.table(66,264,1126,307,[['사업','매출','영업이익','추이','기준'],['영역 A','—','—','—','—'],['영역 B','—','—','—','—'],['영역 C','—','—','—','—']],'부문별 재무 성과 / 원자료 검증');d.line(70,590,1120,4,c.accent);d.foot();},
 d=>{const c=d.c;d.head('LONG-TERM PRIORITIES');d.title(66,116,1083,89,'성장의 질을 결정하는 투자 우선순위',43);const arr=[['01','고객 경험','서비스 개선'],['02','운영 효율','비용·품질'],['03','기술 투자','확장 체계']];arr.forEach((v,i)=>{const x=67+i*386;d.box(x,261,348,288,i===0?c.soft:c.paper);d.line(x,263,348,8,c.accent);d.type(x+22,289,302,50,v[0],35,c.accent,800);d.type(x+22,367,297,50,v[1],28,c.fg,720);d.type(x+22,453,295,52,v[2]+' · 근거',18,c.dim);});d.foot();},
 d=>{const c=d.c;d.head('DISCLOSURES / ACCOUNTING NOTES');d.title(66,113,1047,98,'공시의 비교 가능성을 보존',45);d.table(69,270,1112,295,[['항목','원천','비교 기간','확인 상태'],['사업부문','미입력','—','미검토'],['투자 집행','미입력','—','미검토'],['가이던스','미입력','—','미검토']],'연차 주석 / 자료 출처');d.foot();}
 ]});
})(typeof globalThis!=='undefined'?globalThis:this);