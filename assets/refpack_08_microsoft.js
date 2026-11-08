(function(root){'use strict';
const R=root.DocutRefArt;if(!R)throw Error('Reference art core required');
R.register('CORP-08',{
 bg:'#FAFAF9',fg:'#252525',accent:'#0078D4',soft:'#F0F5FA',paper:'#FFFFFF',dim:'#747777',font:'Arial',
 chartKey:'ms-divisional',chartName:'연차 사업부 / Azure',chartColors:['#0078D4','#A9CDDE','#69A546','#F8B23B','#8B6EAF'],
 tabs:['경영 메시지','전략적 우선순위','사업부문','재무 총괄','미래 투자','회계 주석'],
 pages:[
 d=>{const c=d.c;const tiles=[['#0078D4',72,65],['#F4B400',106,65],['#7DAA51',72,99],['#D55751',106,99]];tiles.forEach(s=>d.box(s[1],s[2],27,27,s[0]));d.type(160,83,600,29,'ANNUAL / BUSINESS REVIEW',16,c.dim,700);d.title(70,189,1111,124,'기술 투자와 사업 성과의\n지속 가능한 연결',54);d.line(70,368,1124,2,c.accent);d.type(72,396,1032,126,'이 문서는 한 해의 우선순위·운영 성과·다음 투자 판단을\n구조적으로 작성하는 편집형 보고서입니다.',24,c.fg,400);d.type(71,605,930,25,'REPORT YEAR   /   작성 기준일 입력',14,c.dim,600);d.foot();},
 d=>{const c=d.c;d.head('LONG-TERM PRIORITIES');d.title(67,112,1050,94,'전략을 네 가지 실행 축으로 정렬',46);const groups=[['고객 경험','#0078D4'],['클라우드 성장','#F4B400'],['조직 생산성','#7DAA51'],['신뢰·책임','#D55751']];groups.forEach((v,i)=>{const x=67+(i%2)*570,y=251+Math.floor(i/2)*165;d.box(x,y,526,133,c.paper);d.box(x,y,17,133,v[1]);d.type(x+40,y+15,453,50,v[0],30,c.fg,700);d.type(x+41,y+85,437,34,'주요 활동 / 지표 / 소유자 입력',17,c.dim);});d.foot();},
 d=>{const c=d.c;d.head('OPERATING SEGMENTS');d.title(66,115,1067,89,'부문별 성장과 투자 균형',46);d.chart('bar',66,257,727,312,'사업 부문별 실측 매출');d.line(820,258,2,306,c.soft);['서비스 A','서비스 B','서비스 C'].forEach((s,i)=>{d.box(853,262+i*98,333,85,c.paper);d.box(853,262+i*98,8,85,['#0078D4','#F4B400','#7DAA51'][i]);d.type(881,291+i*98,288,44,s+' · 실측값 확인',19,c.fg,620);});d.foot();},
 d=>{const c=d.c;d.head('FINANCIAL HIGHLIGHTS');d.title(66,116,1075,88,'재무 성과를 표와 차트로 검증',46);d.table(65,257,704,308,[['계정','당기','전기','변동'],['매출','—','—','—'],['영업이익','—','—','—'],['현금흐름','—','—','—']],'연간 비교 / 엑셀 값 입력');d.chart('line',795,264,398,297,'기간별 재무 추이');d.foot();},
 d=>{const c=d.c;d.head('INVESTMENT THEMES');d.title(68,113,1090,88,'다음 성장의 투자 우선순위',45);d.box(65,237,1141,8,c.accent);const sectors=[['01','인프라','확장 필요성'],['02','연구개발','제품 가치'],['03','보안·운영','책임성']];sectors.forEach((v,i)=>{const x=66+i*385;d.type(x,280,341,51,v[0],33,c.accent,800);d.type(x,358,342,53,v[1],31,c.fg,710);d.line(x,425,339,2,c.soft);d.type(x,458,337,90,v[2]+'\n예산·성과 확인',19,c.dim);});d.foot();},
 d=>{const c=d.c;d.head('NOTES / APPENDIX');d.title(67,117,1087,89,'공시 기준과 출처를 명확히',44);d.box(65,248,1131,6,c.accent);d.table(66,278,1112,287,[['항목','원천 자료','회계 기간','확인 상태'],['부문별 금액','미입력','미입력','미검토'],['재무지표','미입력','미입력','미검토'],['투자·지출','미입력','미입력','미검토']],'검증용 주석 목록');d.foot('본 문서는 회계감사 의견·회사 공식 공시를 대체하지 않음');}
 ]});
})(typeof globalThis!=='undefined'?globalThis:this);