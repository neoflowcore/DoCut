'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const P=require('../assets/persistence.js');
const validate=p=>{if(!p||typeof p.title!=='string'||!Array.isArray(p.pages)||!p.pages.length)throw Error('Invalid project');return p;};
const make=(title='First')=>({schema:3,title,pages:[{id:'p1',elements:[{id:'e1',text:'Content',source:'Evidence'}]}]});
function store(options={}){const data=new Map();return {data,getItem(k){if(options.blockRead)throw Error('Access denied');return data.has(k)?data.get(k):null;},setItem(k,v){if(options.quota&&v.length>options.quota)throw Error('QuotaExceededError');data.set(k,String(v));},removeItem(k){data.delete(k);}};}
test('missing storage returns a safe unavailable status',()=>{
 const r=P.inspect(null,validate);assert.equal(r.status,'unavailable');
 assert.equal(P.write(null,validate,make(),r.token,'A').status,'unavailable');
});
test('single checkpoint is atomic, unicode-safe and checked for integrity',()=>{
 const mem=store(),initial=P.inspect(mem,validate);assert.equal(initial.status,'empty');
 const p=make('Korean \ud55c\uae00');const saved=P.write(mem,validate,p,initial.token,'tabA');assert.equal(saved.status,'saved');
 const loaded=P.inspect(mem,validate);assert.equal(loaded.status,'current');assert.equal(loaded.project.title,p.title);
 assert.equal(loaded.token.sequence,1);assert.equal(loaded.writerId,'tabA');
 assert.equal(JSON.parse(mem.getItem(P.KEY)).checksum,P.checksum(JSON.stringify(p)));
});
test('corrupt checkpoint is never overwritten by the new document',()=>{
 const mem=store();mem.setItem(P.KEY,'{garbage');mem.setItem(P.LEGACY,JSON.stringify(make('Legacy')));
 const before=mem.getItem(P.KEY),r=P.inspect(mem,validate);assert.equal(r.status,'corrupt');assert.equal(r.raw,before);
 assert.equal(P.write(mem,validate,make('Danger'),r.token,'tab').status,'corrupt');
 assert.equal(mem.getItem(P.KEY),before);
});
test('wrong integrity checksum is rejected without auto-recovery',()=>{
 const mem=store(),a=P.inspect(mem,validate);P.write(mem,validate,make('Source'),a.token,'a');
 const damaged=JSON.parse(mem.getItem(P.KEY));damaged.project.title='Tampered';mem.setItem(P.KEY,JSON.stringify(damaged));
 assert.equal(P.inspect(mem,validate).status,'corrupt');
});
test('legacy checkpoint loads and migrates without rewriting the old key',()=>{
 const mem=store(),old=JSON.stringify(make('Legacy'));mem.setItem(P.LEGACY,old);
 const r=P.inspect(mem,validate);assert.equal(r.status,'legacy');
 const saved=P.write(mem,validate,r.project,r.token,'tab');assert.equal(saved.status,'saved');
 assert.equal(mem.getItem(P.LEGACY),old);
 assert.equal(P.inspect(mem,validate).status,'current');
});
test('two independent browser sessions cannot silently replace the other tab',()=>{
 const mem=store(),empty=P.inspect(mem,validate),a=P.write(mem,validate,make('A'),empty.token,'first');
 const stale=P.inspect(mem,validate);const newer=P.write(mem,validate,make('Newer'),a.token,'second');
 assert.equal(newer.status,'saved');
 const rejected=P.write(mem,validate,make('Stale'),stale.token,'first');
 assert.equal(rejected.status,'conflict');assert.equal(rejected.actual.project.title,'Newer');
 assert.equal(P.inspect(mem,validate).project.title,'Newer');
});
test('same title with different content creates distinct history backups',()=>{
 const mem=store(),a=make('A');assert.equal(P.makeBackup(mem,a,'start').status,'saved');
 assert.equal(P.makeBackup(mem,a,'duplicate').status,'unchanged');
 for(let i=0;i<9;i++)assert.equal(P.makeBackup(mem,make('Version '+i),'edit').status,'saved');
 const list=P.readBackups(mem);assert.equal(list.length,6);
 assert.equal(list[0].project.title,'Version 8');assert.equal(list[5].project.title,'Version 3');
});
test('wrong legacy project is quarantined instead of dropped',()=>{
 const mem=store();mem.setItem(P.LEGACY,JSON.stringify({pages:[]}));const result=P.inspect(mem,validate);
 assert.equal(result.status,'corrupt-legacy');assert.equal(P.write(mem,validate,make(),result.token,'tab').status,'corrupt');
});
test('quota failure preserves previously committed checkpoint',()=>{
 let limit=Infinity;const data=new Map();const mem={getItem:k=>data.get(k)||null,setItem(k,v){if(v.length>limit)throw Error('Quota exceeded');data.set(k,String(v));},removeItem:k=>data.delete(k)};
 const first=P.write(mem,validate,make('A'),P.inspect(mem,validate).token,'a');assert.equal(first.status,'saved');
 const before=data.get(P.KEY);limit=before.length-1;
 assert.equal(P.write(mem,validate,make('Long update'),first.token,'a').status,'failed');
 assert.equal(data.get(P.KEY),before);
});
test('conflicting tab can explicitly take ownership only after preserving previous data',()=>{
 const mem=store(),first=P.write(mem,validate,make('Older'),P.inspect(mem,validate).token,'a');
 const second=P.write(mem,validate,make('Other tab'),first.token,'b');assert.equal(second.status,'saved');
 const forced=P.resolveExternal(mem,validate,make('Local editor'), 'a');assert.equal(forced.status,'saved');
 assert.equal(P.inspect(mem,validate).project.title,'Local editor');
 assert.equal(P.readBackups(mem)[0].project.title,'Other tab');
});
test('previous tab cannot migrate legacy if legacy document was modified before migration',()=>{
 const mem=store();mem.setItem(P.LEGACY,JSON.stringify(make('A')));const stale=P.inspect(mem,validate);
 mem.setItem(P.LEGACY,JSON.stringify(make('B')));
 assert.equal(P.write(mem,validate,make('A edited'),stale.token,'a').status,'conflict');
 assert.equal(P.inspect(mem,validate).project.title,'B');
});

test('backup comparison reports page, element and verification losses deterministically',()=>{
 const a=make('Report'),b=JSON.parse(JSON.stringify(a));
 a.pages[0].elements[0].verified=true;
 b.pages[0].elements[0].verified=false;b.pages[0].elements[0].source='Other';
 b.pages.push({id:'p2',tab:'Added',elements:[]});
 b.pages[0].elements.push({id:'e2',text:'New'});
 const stats=P.compareProjects(a,b);
 assert.equal(stats.pagesAdded,1);assert.equal(stats.pagesChanged,1);
 assert.equal(stats.elementsAdded,1);assert.equal(stats.elementsChanged,1);
 assert.equal(stats.sourcesChanged,1);assert.equal(stats.verificationLost,1);
});


test('corrupt backup index is quarantined rather than filtered and overwritten',()=>{
 const mem=store(),raw=JSON.stringify([{label:'good',project:make('Good')},{label:'broken',project:{pages:'not an array'}}]);
 mem.setItem(P.BACKUPS,raw);
 const result=P.inspectBackups(mem);assert.equal(result.status,'corrupt');assert.equal(result.raw,raw);
 assert.equal(P.makeBackup(mem,make('Fresh'),'manual').status,'corrupt');
 assert.equal(mem.getItem(P.BACKUPS),raw);
});

test('recovery comparison detects removed verified elements, page sequence and document metadata',()=>{
 const old={...make('Original'),theme:'wood',master:{footer:'One'}};
 old.pages[0].elements[0].verified=true;
 old.pages.push({id:'p2',tab:'More',elements:[{id:'e2',text:'verified',verified:true}]});
 const newer={...make('Changed'),theme:'slate',master:{footer:'Two'}};
 const delta=P.compareProjects(old,newer);
 assert.equal(delta.pagesRemoved,1);assert.equal(delta.elementsRemoved,1);assert.equal(delta.verificationLost,2);
 assert.equal(delta.pagesReordered,false);assert.equal(delta.documentSettingsChanged,true);
});


test('page additions or removals do not falsely imply reordering',()=>{
 const a=make('Reorder');a.pages.push({id:'p2',tab:'Two',elements:[]});
 const b=structuredClone(a);b.pages.reverse();
 assert.equal(P.compareProjects(a,b).pagesReordered,true);
 const c=structuredClone(a);c.pages.pop();
 assert.equal(P.compareProjects(a,c).pagesReordered,false);
});
