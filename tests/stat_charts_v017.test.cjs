'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../assets/core.js');require('../assets/core_enhanced.js');require('../assets/effect_catalog.js');
const S=require('../assets/stat_charts.js');require('../assets/easing.js');const M=require('../assets/visual_motion.js');
const D=require('../assets/data_io.js');const X=require('../assets/export.js');const P=require('../assets/pptx.js');
const values={
 cohort:[['2025-01',0,100],['2025-01',1,78],['2025-02',0,100]],
 multiples:[['서울','1월',20],['서울','2월',30],['부산','1월',18],['부산','2월',35]],
 control:[['1월',7],['2월',8],['3월',10]],
 forest:[['사업 A',.83,.72,.99],['사업 B',1.21,1.03,1.42]],
 fan:[['2027',4,6,10],['2028',3,7,12]],
 survival:[[0,100,0],[1,90,10],[2,75,20]],
 contribution:[['영업',200],['원가',-55],['간접비',-21]],
 lift:[[10,32],[50,78],[100,100]],
 roc:[[0,0],[.2,.8],[1,1]]
};
const demo=(kind)=>S.normalize({kind,rows:values[kind],limits:kind==='control'?{lower:5,center:8,upper:12}:{},palette:'ocean'});

test('nine meaningful statistical visuals have deterministic shape geometry and no fabricated dataset',()=>{
 assert.equal(S.KINDS.length,9);assert.equal(Object.keys(values).length,9);
 for(const spec of S.KINDS){
  const empty=S.normalize({kind:spec.id,rows:[]});assert.deepEqual(empty.rows,[]);assert.match(S.svg(empty,spec.name),/원자료를 입력하세요/);
  const data=demo(spec.id),geo=S.geometry(data,C.CHART_PALETTES.ocean);
  if(spec.id==='cohort')assert.ok(geo.filter(x=>x.type==='rect').every(x=>x.w>=100),'sparse cohort cells should use available chart width');
  assert.ok(geo.length>2, spec.id);assert.ok(geo.length<=300,spec.id);
  assert.ok(!/NaN|Infinity|undefined/.test(JSON.stringify(geo)),spec.id);
  assert.ok(S.svg(data,spec.name).includes('role="img"'),spec.id);
 }
});
test('statistics normalized without precision loss and source metadata preserved by native project round-trip',()=>{
 const p=C.createProject(1),el=C.makeBlock('stat',100,220,{source:'공식 통계 2026',asOfDate:'2026-11-01',unit:'%',evidence:'정의된 표본과 데이터',verified:true,data:demo('roc')});p.pages[0].elements.push(el);
 const safe=C.normalizeProject(p),chart=safe.pages[0].elements.at(-1);
 assert.equal(chart.type,'stat');assert.deepEqual(chart.data.rows,values.roc);assert.equal(chart.source,'공식 통계 2026');assert.equal(chart.asOfDate,'2026-11-01');
 assert.equal(chart.verified,true);assert.equal(chart.data.palette,'ocean');
 const html=X.exportHTML(safe);assert.match(html,/통계 차트/);assert.match(html,/"kind":"roc"/);assert.match(html,/AUC 0.800/);
 assert.match(X.exportText(safe),/위양성률\(0~1\)/);assert.match(X.exportText(safe),/공식 통계 2026/);assert.match(X.exportText(safe),/팔레트: ocean/);
 assert.match(X.aiPrompt(safe),/통계:roc/);assert.match(X.aiPrompt(safe),/원자료 앞 12행/);
});
test('empty statistical plot cannot be marked verified by silent dataset substitution',()=>{
 const block=C.normalizeBlock(C.makeBlock('stat',50,60));assert.equal(block.data.rows.length,0);assert.deepEqual(S.warnings(block.data),['원자료 미입력 — 데모 숫자를 생성하지 않습니다.']);
 const audit=C.auditProject({pages:[{elements:[block]}]});assert.ok(audit.some(x=>x.type==='stat-data'));assert.ok(audit.some(x=>x.type==='source'));
});
test('all source rows parsed atomically, no truncated records or invented headers',()=>{
 for(const k of S.KINDS){const source=S.formatRows(demo(k.id));assert.deepEqual(S.parseRows(k.id,source),values[k.id],k.id);}
 assert.throws(()=>S.parseRows('cohort','A | 0 | 100\nB | x | 80'),/숫자/);
 assert.throws(()=>S.parseRows('cohort','A | 0 | 101'),/0~100/);
 assert.throws(()=>S.parseRows('cohort','A | 0 | 100 | extra'),/열 수/);
 assert.throws(()=>S.parseRows('cohort',Array(49).fill('A | 0 | 100').join('\n')),/최대 48행/);
});
test('native project restore never elevates verified flag for empty or incomplete statistical evidence',()=>{
 const unsourced=C.normalizeBlock(C.makeBlock('stat',10,10,{verified:true,data:demo('roc')}));
 assert.equal(unsourced.verified,false);
 const empty=C.normalizeBlock(C.makeBlock('stat',10,10,{verified:true,source:'공인자료'}));
 assert.equal(empty.verified,false);
 const control=C.normalizeBlock(C.makeBlock('stat',10,10,{verified:true,source:'공인자료',data:{kind:'control',rows:[['Jan',8]],limits:{lower:3,upper:12}}}));
 assert.equal(control.verified,false);
 const valid=C.normalizeBlock(C.makeBlock('stat',10,10,{verified:true,source:'공인자료',data:demo('control')}));
 assert.equal(valid.verified,true);
});
test('strict semantic checks reject invalid confidence intervals, group duplicates, ROC and risk sets',()=>{
 assert.throws(()=>S.normalize({kind:'forest',rows:[['group',1.1,1.8,2.2]]}),/하한/);
 assert.throws(()=>S.normalize({kind:'fan',rows:[['2027',10,3,8]]}),/하한/);
 assert.throws(()=>S.normalize({kind:'cohort',rows:[['A',0,100],['A',0,98]]}),/중복/);
 assert.throws(()=>S.normalize({kind:'multiples',rows:[['A','1',1],['B','1',2],['C','1',3],['D','1',4],['E','1',5]]}),/4개 그룹/);
 assert.throws(()=>S.normalize({kind:'roc',rows:[[0,0],[.7,.8],[.6,.9]]}),/오름차순/);
 assert.throws(()=>S.normalize({kind:'lift',rows:[[20,50],[30,40]]}),/감소/);
 assert.throws(()=>S.normalize({kind:'survival',rows:[[0,100,35],[1,80,12]]}),/위험집단/);
 assert.throws(()=>S.normalize({kind:'survival',rows:[[0,8,9]]}),/사건 수/);
 assert.throws(()=>S.normalize({kind:'control',rows:[['1',8]],limits:{lower:12,center:6,upper:18}}),/하한/);
 assert.throws(()=>S.normalize({kind:'bogus',rows:[]}),/지원하지 않는/);
 assert.throws(()=>S.normalize({kind:'__proto__',rows:[]}),/지원하지 않는/);
 assert.throws(()=>S.normalize({kind:'multiples',rows:[['A','Jan',1],['B','Feb',2]]}),/동일한 기간/);
 assert.throws(()=>S.normalize({kind:'forest',rows:[['A',1,.9,1.1]],referenceValue:'bogus'}),/숫자/);
});
test('incomplete ROC, lift endpoint and cohort rebound cause evidence warnings, not invented values',()=>{
 const missing=S.normalize({kind:'roc',rows:[[.1,.5],[.8,.9]]});
 assert.match(S.warnings(missing).join(' '),/AUC를 계산하지 않습니다/);
 assert.ok(!S.svg(missing,'ROC').includes('AUC'));
 assert.match(S.warnings({kind:'lift',rows:[[10,20],[60,80]]}).join(' '),/100% 종단점/);
 assert.match(S.warnings({kind:'cohort',rows:[['A',0,100],['A',1,70],['A',2,82]]}).join(' '),/잔존율이 이전 기간보다 높/);
 assert.ok(!S.warnings({kind:'cohort',rows:[['A',0,100],['A',1,70]]}).some(x=>x.includes('이전 기간보다 높')));
});
test('manageable management-limit warnings do not fabricate control limits',()=>{
 const raw={kind:'control',rows:[['Jan',12],['Feb',14]]};
 assert.match(S.warnings(raw).join(' '),/중심선/);
 assert.match(S.svg(raw,'미설정'),/관리도 한계값 미입력/);
 assert.deepEqual(S.normalize(raw).limits,{});
 assert.deepEqual(S.normalize(raw).limits,{});
 const r=S.normalize({kind:'forest',rows:[['A',1,.9,1.1]]});
 assert.equal(r.referenceValue,null);assert.match(S.warnings(r).join(' '),/비교 기준선/);
 const withReference=S.normalize({...r,referenceValue:1});
 assert.equal(withReference.referenceValue,1);
 assert.match(S.svg(withReference,'숫자와 기준'),/기준 1/);
 assert.ok(!S.svg(r,'기준 없는 차트').includes('기준 1'));
});
test('TSV/CSV preview adapter skips only exact known heading and refuses unknown header',()=>{
 const el=C.makeBlock('stat',20,20,{data:S.normalize({kind:'forest',rows:[]})});
 const rows='항목,추정치,하한,상한\n사업 A,1.10,0.95,1.29\n사업 B,0.75,0.61,0.89';
 const next=D.applyData(el,rows);assert.deepEqual(next.rows,[['사업 A',1.1,.95,1.29],['사업 B',.75,.61,.89]]);
 assert.equal(D.applyData(el,'사업 C,1.2,1.0,1.6').rows.length,1);
 assert.throws(()=>D.applyData(el,'Unknown,Estimate,Lower,Upper\n사업 A,1.1,0.9,1.4'),/숫자/);
 assert.throws(()=>D.applyData(el,'사업 A,1,2'),/열 수/);
});
test('custom name cannot insert executable markup in semantic accessible SVG',()=>{
 const x=S.normalize({kind:'cohort',rows:[['<svg onload=alert(1)>',0,100]]});const svg=S.svg(x,'"<script>');
 assert.ok(!svg.includes('<script>'));assert.ok(!svg.includes('<svg onload'));
 assert.match(svg,/&lt;svg/);assert.match(svg,/&lt;script&gt;/);
});
test('standalone export includes static statistical geometry, embedded source data and offline motion runtime',()=>{
 const p=C.createProject(1),data=demo('survival');p.pages[0].elements.push(C.makeBlock('stat',50,260,{text:'생존 분석',data,effects:[C.makeEffect('stat-reveal',900)]}));
 const html=X.exportHTML(p);assert.match(html,/<svg class="chart-svg stat-chart-svg"/);assert.match(html,/'stat-reveal'/);assert.match(html,/docut-project/);
 assert.match(html,/DocutVisualMotion/);assert.match(html,/timePlan/);
});
test('statistical chart is native editable PowerPoint shapes, with source description, without a saved ZIP artifact',()=>{
 const p=C.createProject(1),s=C.makeBlock('stat',80,260,{text:'ROC 결과',data:demo('roc'),source:'근거자료',verified:false});p.pages[0].elements.push(s);
 const bytes=P.createPPTX(p);assert.ok(bytes instanceof Uint8Array);assert.ok(bytes.length>2000);
 const raw=Buffer.from(bytes).toString('utf8');assert.match(raw,/ROC 결과/);assert.match(raw,/근거자료/);assert.match(raw,/AUC 0.800/);
 assert.ok((raw.match(/<p:sp>/g)||[]).length>=8);
});
test('statistic animation special effect only applies to the statistical chart',()=>{
 const CAT=require('../assets/effect_catalog.js');assert.equal(CAT.supports('stat-reveal','stat'),true);assert.equal(CAT.supports('stat-reveal','title'),false);
 const stack=CAT.createStack('statistic','stat');assert.deepEqual(stack.map(s=>s.kind),['fade','stat-reveal']);assert.ok(M.CHART_KINDS.has('stat-reveal'));
});

test('AI proposals make changed statistical evidence/numeric thresholds explicit and cannot claim verification',()=>{
 const Q=require('../assets/proposal.js'),before=C.createProject(1),block=C.makeBlock('stat',100,200,{text:'효과 지표',data:demo('forest'),source:'공식자료',evidence:'표본 100',verified:true});
 block.data.referenceValue=1;before.pages[0].elements.push(block);
 const suggested=C.clone(before),edit=suggested.pages[0].elements.at(-1);edit.data.rows[0][1]=0.88;edit.data.referenceValue=0;edit.source='';edit.evidence='';edit.verified=true;
 const d=Q.analyze(before,suggested);
 assert.equal(d.changedPages,1);assert.equal(d.rows[0].stats.numericChanged,1);assert.ok(d.rows[0].stats.numericExamples[0].includes('→'));
 assert.throws(()=>Q.apply(before,d,[0]),/Numerical changes need explicit/);
 const output=Q.apply(before,d,[0],false,{approveNumeric:true}).project.pages[0].elements.at(-1);
 assert.equal(output.verified,false);assert.equal(output.source,'공식자료');assert.equal(output.evidence,'표본 100');
 assert.equal(output.data.rows[0][1],0.88);assert.equal(output.data.referenceValue,0);
});
