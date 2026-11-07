const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../assets/core.js');
const X=require('../assets/export.js');

test('default 5-page storyboard, semantic titles and 16:9 data',()=>{
  const p=C.createProject(5);
  assert.equal(p.pages.length,5);
  assert.deepEqual(p.pages.map(s=>s.tab),C.STORY[5]);
  assert.equal(C.WIDTH/C.HEIGHT,16/9);
  assert.equal(p.pages[0].elements.length,5);
});

test('user-named tabs stay unchanged while automatic titles follow new count',()=>{
  const p=C.createProject(4);p.pages[1].tab='직접 지정';p.pages[1].customTab=true;
  p.pages.push(C.createPage(4,5));C.relabelPages(p);
  assert.equal(p.pages[1].tab,'직접 지정');
  assert.equal(p.pages[2].tab,C.STORY[5][2]);
});

test('normalize clamps coordinates and caps each block at three effects',()=>{
  const p=C.createProject(3),b=p.pages[0].elements[0];
  b.x=-999;b.y=2000;b.w=9999;b.effects=Array.from({length:9},()=>({kind:'glow',duration:9999,delay:-8}));
  p.theme='unknown';
  const safe=C.normalizeProject(p);
  assert.equal(safe.pages[0].elements[0].x,0);
  assert.equal(safe.pages[0].elements[0].y,696);
  assert.equal(safe.pages[0].elements[0].w,1280);
  assert.equal(safe.pages[0].elements[0].effects.length,3);
  assert.equal(safe.pages[0].elements[0].effects[0].duration,3000);
  assert.equal(safe.theme,'wood');
});

test('escape payload is inert in rendered captions and embedded project JSON',()=>{
  const p=C.createProject(3);
  p.title='</title><script>alert(1)</script>';
  p.pages[0].elements[0].text='</div><img src=x onerror=alert(1)>';
  const html=X.exportHTML(p);
  assert.ok(html.includes('&lt;/div&gt;&lt;img'));
  assert.ok(!html.includes('<title></title><script>'));
  assert.ok(!html.includes('"<script>alert(1)</script>"'));
  assert.match(html,/id="docut-project"/);
});

test('HTML report exports keyboard navigation, motion data, font-size cap 30 and notes',()=>{
  const p=C.createProject(5);
  p.pages[0].elements.push(C.makeBlock('note',300,300));
  const html=X.exportHTML(p);
  assert.match(html,/max="30"/);
  assert.match(html,/e.ctrlKey/);
  assert.match(html,/data-note-id=/);
  assert.match(html,/cubic-bezier/);
  assert.equal(X.exportText(p).includes('핵심 요약'),true);
});

test('chart and table transformations preserve user-editable content',()=>{
  const series=C.parseSeries('금융: 72\n공기업: 60\n기타: 35');
  assert.deepEqual(series.labels,['금융','공기업','기타']);
  assert.deepEqual(series.values,[72,60,35]);
  const rows=C.parseGrid('항목 | 회사\nA | B');
  assert.deepEqual(rows.rows,[['항목','회사'],['A','B']]);
  const card=C.makeBlock('table',50,30,{data:rows});
  assert.match(X.renderBlock(card),/회사/);
});
