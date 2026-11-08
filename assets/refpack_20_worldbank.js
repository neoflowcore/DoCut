(function(root){'use strict';
const R=root.DocutRefArt;if(!R)throw Error('Reference art core required');
R.register('PUB-20',{
 bg:'#FDFCF9',fg:'#302C2E',accent:'#92152F',soft:'#FBEDE5',paper:'#FFFFFF',dim:'#88746D',font:'Georgia',
 chartKey:'worldbank-research',chartName:'개발 전망 / Burgundy & Navy',chartColors:['#123253','#6B8093','#B31B39','#E4AD61','#7B8FA8'],
 tabs:['글로벌 전망','지역별 위험','성장률 표','분석 박스','정책 수단','데이터·방법'],
 pages:[
 d=>{const c=d.c;d.box(0,0,1280,720,'#8E132D');d.box(191,0,9,720,'#D7A757');d.type(64,62,1086,30,'GLOBAL ECONOMIC RESEARCH / FLAGSHIP SERIES',15,'#FBE7E8',700);d.title(263,154,913,252,'Global\nEconomic\nOutlook',84,'#FFFFFF',{font:'Georgia',weight:400,lineHeight:.94});d.type(267,533,841,31,'DEVELOPMENT / PROSPECTS  ·  기준 연도 입력',18,'#F0D7DA');d.line(267,585,500,3,'#E4AA5B');d.oval(41,515,397,196,'#73112B');d.oval(90,565,289,141,'#B94B58',.42);},
 d=>{const c=d.c;d.head('GLOBAL / REGIONAL OUTLOOK');d.title(68,110,1078,110,'지역별 성장을 비교하고\n정책 맥락을 검토',46,c.fg,{font:'Georgia'});d.box(68,269,432,297,c.soft);d.type(88,295,386,48,'지역·소득군별 변화',25,c.fg,700);d.type(92,367,360,145,'기준연도 / 성장 동인\n원자재·무역·제도 차이\n자료 입력',18,c.dim,400,{lineHeight:1.7});d.chart('bar',520,266,675,302,'지역별 성장 / 엑셀 연결');d.foot();},
 d=>{const c=d.c;d.head('TABLE / GROWTH PROSPECTS');d.title(67,119,1097,94,'성장 전망은 표부터 검증',44,c.fg,{font:'Georgia'});d.table(68,262,1113,311,[['지역','전기','당기','전망','주석'],['세계','—','—','—','—'],['선진 경제','—','—','—','—'],['신흥 경제','—','—','—','—'],['저소득권','—','—','—','—']],'성장률 데이터 / 자료 입력');d.line(67,585,1116,4,c.accent);d.foot();},
 d=>{const c=d.c;d.head('ANALYTICAL BOX / RESEARCH');d.title(67,118,1069,92,'핵심 가정을 별도 분석 박스로',43,c.fg,{font:'Georgia'});d.box(65,253,1137,337,c.soft);d.box(88,275,1089,291,c.paper);d.line(91,277,1075,5,c.accent);d.type(114,309,998,39,'BOX / 분석의 핵심 질문',18,c.accent,800);d.title(111,372,980,89,'어떤 충격이 전망을 바꾸는가?',35,c.fg);d.type(115,491,967,50,'검증할 가정 · 비교기간 · 데이터 출처를 입력합니다.',18,c.dim);d.foot();},
 d=>{const c=d.c;d.head('POLICY CHOICES / EVIDENCE');d.title(66,116,1101,95,'정책 대안의 근거와 한계를 분리',44,c.fg,{font:'Georgia'});const s=[['현황','우선 지표'],['대안','가능성·비용'],['집행','책임·시한']];s.forEach((v,i)=>{const x=68+i*380;d.box(x,274,343,259,i%2?c.soft:c.paper);d.line(x,274,343,6,c.accent);d.type(x+20,309,295,47,v[0],29,c.fg,720);d.type(x+21,401,296,95,v[1]+'\n검증 사항 입력',20,c.dim,430);});d.foot();},
 d=>{const c=d.c;d.head('METHODOLOGY / SOURCES');d.title(67,119,1091,91,'예측의 정의·출처·재현성을 기록',43,c.fg,{font:'Georgia'});d.table(69,263,1107,301,[['분석 항목','기준 시점','자료','검증'],['세계 성장','—','미입력','미검토'],['국별 전망','—','미입력','미검토'],['정책 가정','—','미입력','미검토']],'통계·방법론 / 출처 입력');d.foot();}
 ]});
})(typeof globalThis!=='undefined'?globalThis:this);