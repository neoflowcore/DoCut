(function(root){'use strict';
const R=root.DocutRefArt;if(!R)throw Error('Reference art core required');
R.register('CORP-09',{
 bg:'#F9F9F7',fg:'#111514',accent:'#557C52',soft:'#E6F0E5',paper:'#FFFFFF',dim:'#767C75',font:'Arial',
 chartKey:'apple-environment',chartName:'환경·지속가능성 / Sage',chartColors:['#274D3A','#7AA27B','#B8D3B7','#8AA7AF','#526D5C'],
 tabs:['환경 전략','성과 하이라이트','주요 목표 이정표','배출·자원 차트','진척·책임','측정 방법'],
 pages:[
 d=>{const c=d.c;d.box(0,0,1280,720,'#E2EBDF');d.oval(696,97,480,487,'#BDD8B9');d.oval(768,149,410,416,'#89BDA2',.83);d.oval(836,214,271,290,'#5E896E',.85);d.title(81,139,760,183,'환경을 위한\n더 나은 선택',74,'#15231C');d.type(84,416,620,105,'목표와 실제 진행을 분리해\n측정 가능한 지속가능성 보고서를 작성하세요.',22,c.fg);d.line(85,568,170,4,c.accent);d.type(85,601,626,31,'ENVIRONMENTAL PROGRESS / 기준 연도 입력',14,c.dim,600);},
 d=>{const c=d.c;d.head('ENVIRONMENT / KEY HIGHLIGHTS');d.title(68,116,1090,112,'핵심 성과는 과장 없이\n분명하게 표현',48);const v=[['배출','환경 영향'],['자원','재생·순환'],['제품','전 주기 관리']];v.forEach((s,i)=>{const x=68+i*383;d.box(x,295,345,248,i===1?c.soft:c.paper);d.type(x+25,318,290,50,s[0],29,c.fg,700);d.metric(x+22,388,294,94,s[1],'—',{background:i===1?c.soft:c.paper});d.line(x+23,517,290,3,c.accent);});d.foot();},
 d=>{const c=d.c;d.head('PROGRESS / MILESTONES');d.title(67,113,1098,110,'시간을 따라 축적되는 개선',46);d.line(67,285,1125,3,c.accent);const states=[['기준선','자료 수집'],['초기 이행','실행 현황'],['검증 단계','외부 확인'],['목표 점검','추가 대안']];states.forEach((s,i)=>{const x=69+i*281;d.oval(x,277,20,20,c.accent);d.type(x,327,251,47,s[0],27,c.fg,700);d.type(x,400,246,76,s[1]+'\n시기·단위 입력',18,c.dim);});d.foot();},
 d=>{const c=d.c;d.head('EMISSIONS / RESOURCE DATA');d.title(67,116,1049,89,'환경 성과는 동일한 경계에서 비교',44);d.chart('bar',67,248,726,328,'배출량·자원 사용 / 엑셀 연결');d.box(825,251,364,316,c.soft);d.type(850,276,312,42,'검증 필수 조건',22,c.fg,750);d.type(849,353,314,129,'기준연도\nScope 경계\n단위·환산계수',21,c.dim,500,{lineHeight:1.5});d.foot();},
 d=>{const c=d.c;d.head('TARGETS / VERIFICATION');d.title(67,117,1084,85,'계획과 실제 수치를 정확히 구분',45);d.table(67,256,1112,309,[['목표','기준선','현재','목표 시점','검증'],['탄소','—','—','—','미완'],['에너지','—','—','—','미완'],['자원','—','—','—','미완']],'환경 지표 진척 / 미확인');d.line(69,588,1105,2,c.accent);d.foot();},
 d=>{const c=d.c;d.head('METHODOLOGY / DATA');d.title(66,116,1090,97,'좋은 환경 보고서는 측정 방법이 보인다',43);d.line(69,239,1110,3,c.accent);const a=[['데이터 경계','조직·사업장·제품별 범위'],['집계 기준','측정 기간·단위·환산'],['외부 검증','인증·보증 범위'],['제약 사항','미측정·추정치·불확실성']];a.forEach((v,i)=>{const y=271+i*87;d.type(69,y,285,42,'0'+(i+1)+'    '+v[0],23,c.fg,700);d.type(401,y,713,44,v[1]+' 입력',19,c.dim);d.line(70,y+57,1107,1,c.soft);});d.foot();}
 ]});
})(typeof globalThis!=='undefined'?globalThis:this);