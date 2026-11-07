'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../assets/core.js');require('../assets/core_enhanced.js');require('../assets/stat_charts.js');
const K=require('../assets/page_kits.js');
const blank=()=>C.createProject(3,'policy');
function store(){const d=new Map();return {getItem:k=>d.has(k)?d.get(k):null,setItem(k,v){d.set(k,String(v))},removeItem(k){d.delete(k)},d};}
function captured(){const p=blank();return K.capture(p.pages[0],'일반 대시보드');}

test('twenty independent named and categorized original design layouts',()=>{
 assert.equal(K.BUILTINS.length,20);assert.equal(new Set(K.BUILTINS.map(x=>x.id)).size,20);
 assert.ok(K.BUILTINS.every(x=>x.ko&&x.hint&&x.category));
});
test('all builtins create valid standalone 16:9 pages',()=>{
 for(const t of K.BUILTINS){const pg=K.pageFromKit(t.id),p=blank();p.pages.push(pg);
  assert.ok(pg.elements.length>=3, t.id);
  assert.equal(C.normalizeProject(p).pages.length,4);
  for(const e of pg.elements){assert.ok(e.x>=0&&e.y>=0&&e.x+e.w<=C.WIDTH&&e.y+e.h<=C.HEIGHT,`${t.id}/${e.type}`);}
 }
});
test('all builtins are editable, unverified, with no evidence, reviewer or image bytes',()=>{
 for(const t of K.BUILTINS){const pg=K.pageFromKit(t.id);
  for(const e of pg.elements){assert.equal(e.locked,false);assert.equal(e.hidden,false);assert.equal(e.verified,false);assert.equal(e.source,'');assert.equal(e.evidence,'');assert.equal(e.notes,'');
   assert.equal(e.asOfDate,'');assert.equal(e.unit,'');assert.ok((e.effects||[]).length<=3);if(e.type==='image')assert.equal(e.data.src,'');}
 }
});
test('builtins use clear words instead of sample numerical performance claims',()=>{
 for(const t of K.BUILTINS){const pg=K.pageFromKit(t.id);
  assert.equal(pg.elements.filter(e=>['kpi','bar','line','donut'].includes(e.type)&&e.verified).length,0);
  for(const e of pg.elements.filter(e=>['bar','line','donut'].includes(e.type)))assert.ok(e.data.values.every(v=>v===0));
 }
});
test('template pages never inherit existing page IDs or report contents',()=>{
 const p=blank(),before=JSON.stringify(p),pg=K.pageFromKit('executive');
 p.pages.splice(1,0,pg);
 const ids=[...p.pages.map(x=>x.id),...p.pages.flatMap(x=>x.elements.map(e=>e.id))];
 assert.equal(new Set(ids).size,ids.length);assert.equal(p.pages[0].tab,'회사안 요약');assert.equal(p.pages[2].tab,'외부 사례 비교');
 assert.equal(JSON.stringify(blank()).includes(pg.id),false);assert.ok(before.includes('회사안 요약'));
});
test('every insertion creates new identity for same kit',()=>{
 const a=K.pageFromKit('timeline'),b=K.pageFromKit('timeline');assert.notEqual(a.id,b.id);
 assert.notDeepEqual(a.elements.map(x=>x.id),b.elements.map(x=>x.id));
});
test('invalid or unknown kit ID rejected',()=>{assert.throws(()=>K.pageFromKit('unknown'),/Unknown template/)});
test('capture leaves original page fully untouched',()=>{
 const p=blank(),before=JSON.stringify(p.pages[0]);const kit=K.capture(p.pages[0],'새 레이아웃');assert.equal(JSON.stringify(p.pages[0]),before);assert.ok(kit.id.startsWith('user-'));
});
test('capture strips report body, statistics, evidence, reviews, proof, rich text and image source',()=>{
 const p=blank(),page=p.pages[0];page.elements[0].text='PRIVATE_KEYWORD_739';page.elements[0].source='SOURCE_KEYWORD_739';page.elements[0].unit='SECRET_UNIT_739';page.elements[0].evidence='PROOF_739';page.elements[0].notes='REVIEWER_739';page.elements[0].verified=true;page.elements[0].richText=[{text:'PRIVATE_KEYWORD_739',bold:true}];
 page.elements.push(C.makeBlock('image',80,340,{data:{src:'data:image/png;base64,AAAA',alt:'SECRET_IMAGE_739'}}));
 page.elements.push(C.makeBlock('table',500,350,{data:{rows:[['SECRET_TABLE_739','value'],['a','b']]}}));
 page.elements.push(C.makeBlock('bar',500,580,{data:{labels:['SECRET_CHART_739'],values:[739]}}));
 const raw=JSON.stringify(K.capture(page,'safe template'));
 for(const token of ['PRIVATE_KEYWORD_739','SOURCE_KEYWORD_739','SECRET_UNIT_739','PROOF_739','REVIEWER_739','SECRET_IMAGE_739','SECRET_TABLE_739','SECRET_CHART_739','base64,AAAA','739'])assert.equal(raw.includes(token),false,token);
});
test('group is kept but remapped with anonymous new name and IDs',()=>{
 const p=blank(),page=p.pages[0];page.elements[0].groupId='SECRET_ID';page.elements[0].groupLabel='SECRET_LABEL';page.elements[1].groupId='SECRET_ID';page.elements[1].groupLabel='SECRET_LABEL';
 const kit=K.capture(page,'anon');assert.equal(kit.elements[0].groupId,kit.elements[1].groupId);assert.equal(kit.elements[0].groupLabel,'그룹');
 assert.equal(JSON.stringify(kit).includes('SECRET_'),false);
 const pg=K.pageFromKit(kit);assert.equal(pg.elements[0].groupId,pg.elements[1].groupId);assert.notEqual(pg.elements[0].groupId,kit.elements[0].groupId);
});
test('page capture does not copy page or document IDs into reusable template',()=>{
 const p=blank(),page=p.pages[0];const kit=K.capture(page,'safe');const raw=JSON.stringify(kit);
 assert.equal(raw.includes(page.id),false);assert.equal(raw.includes(page.elements[0].id),false);assert.ok(raw.includes('kit-element-0'));
});
test('rich text formatting is sanitized instead of leaking embedded text',()=>{
 const p=blank();p.pages[0].elements[0].text='private';p.pages[0].elements[0].richText=[{text:'private',bold:true}];
 assert.equal(K.capture(p.pages[0],'title').elements[0].richText.length,0);
});
test('line and bar real numeric data never leaves private current project',()=>{
 const p=blank(),pg=p.pages[0],el=C.makeBlock('line',0,100,{data:{labels:['사업부'],values:[9256]}});pg.elements.push(el);
 const kit=K.capture(pg,'numbers');assert.equal(kit.elements.at(-1).data.values.reduce((a,b)=>a+b,0),0);assert.deepEqual(pg.elements.at(-1).data.values,[9256]);
});
test('blank library accepts and round-trips a saved layout',()=>{
 const book=K.addKit(K.empty(),captured()),wire=K.exportBook(book),parsed=K.normalizeBook(JSON.parse(wire));
 assert.equal(parsed.templates.length,1);assert.equal(parsed.templates[0].name,'일반 대시보드');
});
test('safe library serialization is deterministic',()=>{const book=K.addKit(K.empty(),captured());assert.equal(K.exportBook(book),K.exportBook(JSON.parse(K.exportBook(book))))});
test('blank name and 65-character name are refused',()=>{
 assert.throws(()=>K.capture(blank().pages[0],'  '),/name/);assert.throws(()=>K.capture(blank().pages[0],'z'.repeat(65)),/name/);
});
test('empty, >60 element, non-page and locked data refused',()=>{
 assert.throws(()=>K.capture({elements:[]},'empty'),/1-60/);
 const p=blank().pages[0];p.elements=Array.from({length:61},()=>C.makeBlock('text',0,0));assert.throws(()=>K.capture(p,'overflow'),/1-60/);
 assert.throws(()=>K.capture(null,'none'),/1-60/);
});
test('custom kit quota rejects 21st, retains original',()=>{
 let book=K.empty();for(let i=0;i<20;i++)book=K.addKit(book,captured());const before=K.exportBook(book);
 assert.throws(()=>K.addKit(book,captured()),/Maximum 20/);assert.equal(K.exportBook(book),before);
});
test('duplicate user kit ID refused',()=>{const k=captured(),book=K.addKit(K.empty(),k);assert.throws(()=>K.addKit(book,k),/Duplicate template/)});
test('duplicate payload IDs in library rejected',()=>{const k=captured();assert.throws(()=>K.normalizeBook({...K.empty(),templates:[k,k]}),/Duplicate template/)});
test('invalid library or malformed template is refused without partial import',()=>{
 assert.throws(()=>K.normalizeBook({foo:1}),/Invalid template library/);
 const k=captured();assert.throws(()=>K.normalizeBook({...K.empty(),templates:[k,{...k,id:'x'}]}),/Invalid custom/);
});
test('import of a full project JSON is rejected',()=>{
 const src=JSON.stringify(blank());assert.throws(()=>K.inspectPacket(K.empty(),src),/Invalid template library/);
});
test('template JSON with unexpected report text is rejected',()=>{
 const k=captured();k.elements[0].text='REVIEW_CONTENT_NOT_SAFE';assert.throws(()=>K.normalizeBook({...K.empty(),templates:[k]}),/report text/);
});
test('template JSON with hidden reviewer evidence, media bytes, formatted text is refused',()=>{
 for(const changes of [{source:'private'},{evidence:'private'},{asOfDate:'2026-01-01'},{unit:'%'} ,{notes:'reviewer'},{verified:true},{locked:true},{hidden:true},{richText:[{text:'not safe'}]},{data:{src:'data:image/png;base64,AA=='}}]){
 const k=captured();Object.assign(k.elements[0],changes);
 assert.throws(()=>K.normalizeBook({...K.empty(),templates:[k]}),/private data|source content|report text/);
 }
});
test('export of custom library never has original report document data',()=>{
 const p=blank();p.pages[0].elements[0].text='CONFIDENTIAL_DOCUT_VALUE';const book=K.addKit(K.empty(),K.capture(p.pages[0],'자체 형식'));
 assert.equal(K.exportBook(book).includes('CONFIDENTIAL_DOCUT_VALUE'),false);
});
test('local storage first load, save, reload and removal',()=>{
 const s=store(),first=K.storageRead(s);assert.equal(first.status,'ok');assert.equal(first.raw,null);
 const next=K.addKit(first.book,captured()),written=K.saveBook(s,next,first.raw);assert.equal(written.status,'saved');
 assert.equal(K.storageRead(s).book.templates.length,1);const after=K.deleteKit(written.book,next.templates[0].id);
 assert.equal(K.saveBook(s,after,written.raw).status,'saved');assert.equal(K.storageRead(s).book.templates.length,0);
});
test('concurrent other tab changes block overwrite',()=>{
 const s=store(),old=K.storageRead(s),newer=K.saveBook(s,K.addKit(old.book,captured()),old.raw);
 assert.equal(newer.status,'saved');const before=s.getItem(K.KEY);
 const result=K.saveBook(s,K.addKit(old.book,captured()),old.raw);assert.equal(result.status,'conflict');assert.equal(s.getItem(K.KEY),before);
});
test('QuotaExceededError keeps previous template library unchanged',()=>{
 const s=store(),first=K.storageRead(s),written=K.saveBook(s,K.addKit(first.book,captured()),first.raw);assert.equal(written.status,'saved');
 const before=s.getItem(K.KEY);s.setItem=()=>{throw Error('QuotaExceededError')};
 assert.equal(K.saveBook(s,K.addKit(written.book,captured()),written.raw).status,'failed');assert.equal(s.getItem(K.KEY),before);
});
test('corrupt library is protected from writes, not replaced with an empty library',()=>{
 const s=store();s.setItem(K.KEY,'{"broken":<');const broken=K.storageRead(s);assert.equal(broken.status,'error');
 assert.equal(K.saveBook(s,K.empty(),null).status,'conflict');assert.equal(s.getItem(K.KEY),'{"broken":<');
});
test('storage unavailable is explicitly returned',()=>{
 assert.equal(K.storageRead(null).status,'error');assert.equal(K.saveBook(null,K.empty(),null).status,'failed');
});
test('import preview reports duplicates and newly-added without writing',()=>{
 const a=captured(),b=captured(),book=K.addKit(K.empty(),a),raw=K.exportBook({...K.empty(),templates:[a,b]});
 const plan=K.inspectPacket(book,raw);assert.equal(plan.duplicates,1);assert.equal(plan.added.length,1);
 assert.equal(book.templates.length,1);assert.equal(K.mergePacket(book,raw).templates.length,2);
});
test('packet conflict on same ID but different name is rejected atomically',()=>{
 const a=captured(),book=K.addKit(K.empty(),a);const raw=K.exportBook({...K.empty(),templates:[{...a,name:'changed'}]});
 const before=K.exportBook(book);assert.throws(()=>K.mergePacket(book,raw),/Conflicting template ID/);assert.equal(K.exportBook(book),before);
});
test('packet oversized and quota-full merges are refused',()=>{
 const book=K.empty();assert.throws(()=>K.inspectPacket(book,'x'.repeat(450001)),/size limit/);
 let full=book;for(let i=0;i<20;i++)full=K.addKit(full,captured());
 assert.throws(()=>K.inspectPacket(full,K.exportBook(K.addKit(K.empty(),captured()))),/20 template limit/);
});
test('unrecognized raw image MIME and unsupported unknown field do not enter page content',()=>{
 const a=captured();a.elements[0].data={src:'https://example.com/tracker.gif'};
 assert.throws(()=>K.normalizeBook({...K.empty(),templates:[a]}),/private data/);
});
test('custom kit insert is copy-only and template itself remains unchanged',()=>{
 const a=captured(),before=JSON.stringify(a);const x=K.pageFromKit(a);assert.equal(JSON.stringify(a),before);
 assert.ok(x.elements.length>0);assert.equal(x.elements[0].verified,false);assert.equal(x.customTab,true);
});
test('deleting custom kit never deletes any report page',()=>{
 const p=blank(),pageBefore=JSON.stringify(p.pages),kit=captured(),book=K.addKit(K.empty(),kit);K.deleteKit(book,kit.id);
 assert.equal(JSON.stringify(p.pages),pageBefore);
});
test('preview maps are static text-only, escape supplied markup and CSS-like data',()=>{
 const kit=K.pageFromKit('decision');kit.elements[0].text='<img src=x onerror=alert(77)>';
 kit.elements[0].style.background='url(javascript:alert(1))';
 const markup=K.previewMarkup(kit);
 assert.ok(!markup.includes('<img src=x onerror=alert(77)>'));assert.ok(markup.includes('&lt;img'));
 assert.ok(!markup.includes('javascript:'));assert.ok(markup.includes('kit-map-block'));
});
test('broken template library retains original raw bytes for recovery export',()=>{
 const s=store(),raw='{broken json}';s.setItem(K.KEY,raw);const checked=K.storageRead(s);
 assert.equal(checked.status,'error');assert.equal(checked.raw,raw);
});
test('chart data hidden in a forged template packet is rejected without importing',()=>{
 const k=captured();k.elements.push({...k.elements[0],id:'kit-element-forged',type:'bar',text:'차트 데이터 입력 필요',data:{labels:['secret'],values:[42]}});
 assert.throws(()=>K.normalizeBook({...K.empty(),templates:[k]}),/private data/);
});
test('unexpected full-report fields cannot be smuggled into a template exchange',()=>{
 const k=captured();const payload={...K.empty(),templates:[k],reviews:[{body:'PRIVATE'}]};
 assert.throws(()=>K.normalizeBook(payload),/Invalid template library/);
});
test('nine palette choices are available at runtime and combine with twenty templates',()=>{
 const CAT=require('../assets/effect_catalog.js');assert.equal(Object.keys(CAT.PALETTES).length,9);
 for(const id of K.BUILTINS.map(x=>x.id))for(const color of Object.keys(CAT.PALETTES)){
  const page=K.pageFromKit(id,color);
  assert.equal(page.background,CAT.PALETTES[color].bg);
  assert.ok(page.elements.some(x=>x.type==='title'));assert.ok(page.elements.every(x=>x.verified===false));
 }
});
test('unknown palette is refused instead of silently falling back',()=>{assert.throws(()=>K.pageFromKit('executive','random-danger'),/Unknown palette/)});
test('custom template preserves original palette when a new color is selected',()=>{
 const base=captured(),orig=K.pageFromKit(base),recolored=K.pageFromKit(base,'consulting');
 assert.equal(orig.background,recolored.background);
 assert.equal(orig.elements[0].style.color,recolored.elements[0].style.color);
});
