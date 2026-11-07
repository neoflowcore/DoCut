'use strict';
const test=require('node:test'), assert=require('node:assert/strict');
const C=require('../assets/core.js');require('../assets/core_enhanced.js');
const Stat=require('../assets/stat_charts.js'),Q=require('../assets/quality_review.js');
const project=()=>C.createProject(3,'policy');
const first=(p,type)=>p.pages[0].elements.find(e=>e.type===type);
const by=(r,rule)=>r.issues.filter(i=>i.rule===rule);

test('V0.21 analyzer and schema are explicit without editing the document',()=>{
 const p=project(),before=JSON.stringify(p),r=Q.analyze(p);
 assert.equal(C.VERSION,'0.33.0-development');assert.equal(r.version,'quality-v021');
 assert.equal(JSON.stringify(p),before);assert.equal(r.pages.length,3);assert.ok(r.total>0);
});
test('high severity data source and basis-date review has stable location keys',()=>{
 const p=project(),b=first(p,'kpi');b.source='Original report';b.asOfDate='';b.unit='';b.verified=false;
 const a=Q.analyze(p);assert.ok(by(a,'MISSING_DATE').some(x=>x.id===b.id));
 assert.ok(by(a,'NOT_VERIFIED').some(x=>x.id===b.id));assert.ok(by(a,'MISSING_UNIT').some(x=>x.id===b.id));
});
test('verified metric without source is not falsely accepted',()=>{
 const p=project(),b=first(p,'kpi');b.verified=true;b.source='';
 assert.ok(by(Q.analyze(p),'UNSUPPORTED_VERIFICATION').some(x=>x.id===b.id));
});
test('visible nonmetric percentage needs human source review not fake fact claim',()=>{
 const p=project(),b=first(p,'text');b.text='매출 72.5% 증가';b.source='';
 const a=Q.analyze(p);assert.ok(by(a,'TEXT_NUMBER_SOURCE').some(x=>x.id===b.id));
 assert.equal(a.scope.includes('자동으로 증명하지 않습니다'),true);
});
test('numbers with source are not flagged as missing percentage evidence',()=>{
 const p=project(),b=first(p,'text');b.text='매출 72.5% 증가';b.source='공식 자료';
 assert.equal(by(Q.analyze(p),'TEXT_NUMBER_SOURCE').some(x=>x.id===b.id),false);
});
test('statistical data diagnostics delegated to statistical source module',()=>{
 const p=project();p.pages[0].elements.push(C.makeBlock('stat',240,220));
 assert.ok(Q.analyze(p).issues.some(x=>x.rule.startsWith('STAT_')));
});
test('chart data length mismatch is a critical advisory, not changed in place',()=>{
 const p=project(),b=C.makeBlock('bar',60,150);p.pages[0].elements.push(b);b.data={labels:['a','b'],values:[10]};const old=JSON.stringify(b.data);
 assert.ok(by(Q.analyze(p),'CHART_DATA').some(i=>i.severity==='critical'));
 assert.equal(JSON.stringify(b.data),old);
});
test('percentage donut sum is advisory only when explicitly percent',()=>{
 const p=project(),d=C.makeBlock('donut',20,50,{unit:'%',data:{labels:['a','b'],values:[10,20]}});p.pages[0].elements.push(d);
 assert.ok(by(Q.analyze(p),'DONUT_PERCENT').some(i=>i.id===d.id));
 d.unit='persons';assert.equal(by(Q.analyze(p),'DONUT_PERCENT').some(i=>i.id===d.id),false);
});
test('table ragged rows and empty headers are detected without crash',()=>{
 const p=project(),el=C.makeBlock('table',20,10,{data:{rows:[['A',''],['Only']]}});p.pages[0].elements.push(el);
 assert.ok(by(Q.analyze(p),'TABLE_COLUMNS').some(i=>i.id===el.id));
 assert.ok(by(Q.analyze(p),'TABLE_HEADER').some(i=>i.id===el.id));
});
test('missing and decorative image alt are handled separately',()=>{
 const p=project(),el=C.makeBlock('image',100,90,{data:{src:'data:image/png;base64,AAAA',alt:''}});p.pages[0].elements.push(el);
 assert.ok(by(Q.analyze(p),'IMAGE_ALT').some(i=>i.id===el.id));
 el.data.decorative=true;assert.equal(by(Q.analyze(p),'IMAGE_ALT').some(i=>i.id===el.id),false);
});
test('missing image asset is distinct from alt text',()=>{
 const p=project(),el=C.makeBlock('image',30,100,{data:{src:'',alt:'차트 이미지'}});p.pages[0].elements.push(el);
 const r=Q.analyze(p);assert.ok(by(r,'IMAGE_EMPTY').some(i=>i.id===el.id));
 assert.equal(by(r,'IMAGE_ALT').some(i=>i.id===el.id),false);
});
test('offscreen elements flagged with correct page and source id',()=>{
 const p=project(),el=first(p,'title');el.x=1200;el.w=300;const i=by(Q.analyze(p),'OUTSIDE_SLIDE')[0];assert.equal(i.id,el.id);assert.equal(i.pageIndex,0);
});
test('fully-contained intentional text over a card is not labelled as collision',()=>{
 const p=project();p.pages[0].elements=[C.makeBlock('card',100,100,{w:400,h:250}),C.makeBlock('text',150,130,{w:200,h:100})];
 assert.equal(by(Q.analyze(p),'BLOCK_OVERLAP').length,0);
});
test('large peer text collision receives an advisory',()=>{
 const p=project();p.pages[0].elements=[C.makeBlock('text',100,100,{w:350,h:140}),C.makeBlock('text',160,120,{w:350,h:140})];
 assert.ok(by(Q.analyze(p),'BLOCK_OVERLAP').length>=1);
});
test('grouped content is not auto-interpreted as collision',()=>{
 const p=project(),a=C.makeBlock('card',100,100,{w:350,h:180,groupId:'g1'}),b=C.makeBlock('card',180,120,{w:350,h:180,groupId:'g1'});p.pages[0].elements=[a,b];
 assert.equal(by(Q.analyze(p),'BLOCK_OVERLAP').length,0);
});
test('hidden blocks are excluded while empty visible page is flagged',()=>{
 const p=project();p.pages[0].elements.forEach(el=>el.hidden=true);
 assert.ok(by(Q.analyze(p),'EMPTY_PAGE').some(i=>i.pageIndex===0));
 assert.ok(!Q.analyze(p).issues.some(i=>i.pageIndex===0&&i.rule==='PLACEHOLDER'));
});
test('duplicate page titles flagged without overriding a custom title',()=>{
 const p=project(),original=p.pages[1].tab;p.pages[1].tab=p.pages[0].tab;p.pages[1].customTab=true;
 assert.ok(by(Q.analyze(p),'DUPLICATE_TAB').length>=1);assert.equal(original===p.pages[1].tab,false);
});
test('color contrast calculation only uses defined direct colors',()=>{
 const p=project(),e=first(p,'text');e.style.color='#333333';e.style.background='#333333';
 assert.ok(by(Q.analyze(p),'LOW_CONTRAST').some(i=>i.id===e.id));
 e.style.background='transparent';assert.equal(by(Q.analyze(p),'LOW_CONTRAST').some(i=>i.id===e.id),false);
});
test('motion exceeding 15 seconds is a performance suggestion',()=>{
 const p=project(),e=first(p,'title');e.effects=[{kind:'fade',duration:9000,delay:9000}];
 assert.ok(by(Q.analyze(p),'LONG_MOTION').some(i=>i.id===e.id));
});
test('filters work by severity, by category and both together',()=>{
 const r=Q.analyze(project());const a=Q.filter(r,'critical'),b=Q.filter(r,'review','evidence');
 assert.ok(a.every(i=>i.severity==='critical'));
 assert.ok(b.every(i=>i.severity==='review'&&i.category==='evidence'));
 assert.equal(Q.filter(r,'all','all').length,r.issues.length);
});
test('story-map recommends policy roles without changing custom page titles',()=>{
 const p=project();p.pages[1].tab='Custom policy title';p.pages[1].customTab=true;
 const r=Q.analyze(p);assert.equal(r.pages[1].title,'Custom policy title');assert.equal(r.pages[1].suggested,C.storyLabels('policy',3)[1]);
});
test('format report is printable TXT and explicitly denies fact verification',()=>{
 const r=Q.analyze(project()),out=Q.formatTxt(r);
 assert.ok(out.includes('[스토리보드 · 현재 / 권장]'));
 assert.ok(out.includes('자동 진단'));
 assert.ok(out.includes('진위'));
 assert.ok(out.includes('근거'));
});
test('AI checklist never embeds project JSON or silently changes evidence',()=>{
 const p=project(),r=Q.analyze(p),out=Q.aiChecklist(r);
 assert.ok(out.includes('schema=3 JSON'));
 assert.ok(out.includes('수치·통계 원자료를 창작하지 말고'));
 assert.ok(!out.includes(JSON.stringify(p)));
});
test('issue count is limited but statistics preserve omitted count',()=>{
 const p=project();p.pages=Array.from({length:50},(_,pi)=>({id:'p'+pi,tab:'자료',elements:Array.from({length:90},(_,i)=>({id:'item-'+pi+'-'+i,type:'bar',text:'sample',x:5,y:0,w:90,h:80,style:{},data:{labels:[],values:[]},effects:[]}))}));
 const r=Q.analyze(p);assert.ok(r.issues.length<=Q.MAX_ISSUES);
 assert.ok(r.truncated>0);assert.equal(r.total,r.issues.length+r.truncated);
});
test('malformed input rejected without converting to a grade or score',()=>{
 assert.throws(()=>Q.analyze({}),/needs pages/);
 const r=Q.analyze(project());assert.equal(r.score,undefined);assert.equal(r.percent,undefined);
});
test('side-by-side quality compare counts candidate independently without mutating either',()=>{
 const old=project(),incoming=project(),before=JSON.stringify(old),after=JSON.stringify(incoming);
 incoming.pages[0].elements.push(C.makeBlock('image',20,100,{data:{src:'',alt:''}}));
 const diff=Q.compare(old,incoming);
 assert.equal(diff.comparable,'independent-candidate-only');
 assert.ok(diff.candidate.counts.review>=diff.current.counts.review);
 assert.ok(diff.candidate.counts.suggestion>=diff.current.counts.suggestion);
 assert.equal(diff.changes.review,diff.candidate.counts.review-diff.current.counts.review);
 assert.equal(JSON.stringify(old),before);
 assert.ok(JSON.stringify(incoming).length>after.length);
});
test('policy story question prompts cover comparison, decision, execution roles',()=>{
 const p=C.createProject(5,'policy'),r=Q.analyze(p);
 assert.ok(r.pages.some(pg=>pg.question.includes('비교')));
 assert.ok(r.pages.some(pg=>pg.question.includes('결정')));
 assert.ok(r.pages.some(pg=>pg.question.includes('언제까지')));
});
test('AI report prompt adopts quality suggestions but does not invent measurements',()=>{
 const p=project(),X=require('../assets/export.js');
 const prompt=X.aiPrompt(p);
 assert.ok(prompt.includes('[자동 품질 점검 · 사실 검증 아님]'));
 assert.ok(prompt.includes('권장 역할'));
 assert.ok(prompt.includes('근거'));
 assert.ok(!prompt.includes('자료가 검증되었음'));
});
test('duplicate cross-page IDs trigger a critical advisory without rewriting IDs',()=>{
 const p=project(),id=p.pages[0].elements[0].id;
 p.pages[1].elements[0].id=id;
 const a=Q.analyze(p);
 assert.ok(by(a,'DUPLICATE_GLOBAL_ID').some(i=>i.id===id&&i.pageIndex===1));
 assert.equal(p.pages[0].elements[0].id,p.pages[1].elements[0].id);
});
test('collision export TXT retains both referenced IDs so issue can be found',()=>{
 const p=project(),a=C.makeBlock('text',100,100,{w:350,h:140}),b=C.makeBlock('text',160,120,{w:350,h:140});
 p.pages[0].elements=[a,b];const result=Q.analyze(p),issue=by(result,'BLOCK_OVERLAP')[0];
 assert.equal(issue.relatedId,b.id);
 assert.ok(Q.formatTxt(result).includes(`${a.id} ↔ ${b.id}`));
});
test('duplicate chart categories and all-zero donut are flagged without inventing a value',()=>{
 const p=project(),a=C.makeBlock('bar',60,120,{data:{labels:['South','south','West'],values:[20,30,50]}}),b=C.makeBlock('donut',60,120,{data:{labels:['A','B'],values:[0,0]}});
 p.pages[0].elements.push(a,b);const initial=JSON.stringify(p);
 const r=Q.analyze(p);assert.ok(by(r,'CHART_DUPLICATE_LABEL').some(x=>x.id===a.id));
 assert.ok(by(r,'DONUT_ZERO_TOTAL').some(x=>x.id===b.id));
 assert.equal(JSON.stringify(p),initial);
});
test('costly motion advisory is per-page and not a fabricated FPS measurement',()=>{
 const p=project();p.pages[0].elements=Array.from({length:6},(_,i)=>C.makeBlock('card',i*20,140,{effects:[{kind:'tilt',duration:1400}]}));
 const r=Q.analyze(p);const issue=by(r,'MOTION_BUDGET')[0];assert.equal(issue.pageIndex,0);
 assert.equal(issue.severity,'suggestion');assert.ok(issue.hint.includes('실제 프레임률은 측정되지 않았습니다'));
});
test('hidden layers are still checked for identity corruption, not placeholder copy',()=>{
 const p=project(),duplicate=JSON.parse(JSON.stringify(p.pages[0].elements[0]));
 duplicate.hidden=true;duplicate.text='placeholder';p.pages[0].elements.push(duplicate);
 const r=Q.analyze(p);assert.ok(by(r,'DUPLICATE_ID').some(x=>x.id===duplicate.id));
 assert.equal(by(r,'PLACEHOLDER').some(x=>x.id===duplicate.id),false);
});
test('all five story modes render story maps for three, five and eight pages',()=>{
 for(const mode of ['strategy','policy','quarterly','research','comparison'])for(const n of [3,5,8]){
  const p=C.createProject(n,mode),r=Q.analyze(p);
  assert.equal(r.pages.length,n);assert.ok(r.pages.every(x=>x.suggested&&x.question));
  assert.equal(typeof r.total,'number');
 }
});
test('quality CSV is BOM+CRLF UTF-8, quotes values and guards against spreadsheet formulas',()=>{
 const p=project();p.pages[0].tab=' =1+1';
 const r=Q.analyze(p),out=Q.formatCsv(r);
 assert.ok(out.startsWith('\ufeff"페이지"'));
 assert.ok(out.includes('"\'=1+1"'));
 assert.ok(out.includes('\r\n'));
 assert.ok(out.includes('"진단 의견"'));
 assert.equal(out.trim().split('\r\n').length,r.issues.length+1);
});
test('CSV output includes both overlapping element IDs',()=>{
 const p=project(),a=C.makeBlock('text',100,100,{w:330,h:160}),b=C.makeBlock('text',120,130,{w:330,h:160});
 p.pages[0].elements=[a,b];const r=Q.analyze(p);
 assert.ok(Q.formatCsv(r).includes('"'+a.id+'","'+b.id+'"'));
});
