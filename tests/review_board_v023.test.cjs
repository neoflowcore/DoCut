'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../assets/core.js');require('../assets/core_enhanced.js');
const R=require('../assets/review_board.js');
const X=require('../assets/export.js');
const project=()=>C.createProject(3,'policy');
const first=(p)=>p.pages[0].elements[0];
const add=(p,body='검토가 필요합니다',opts={})=>R.insert(p,{pageId:p.pages[0].id,elementId:first(p).id,body,...opts});
test('V0.23 review schema is opt-in, private, and versioned',()=>{
 const p=project();assert.equal(C.VERSION,'0.34.0-development');assert.deepEqual(p.reviews,[]);assert.deepEqual(C.normalizeProject(p).reviews,[]);
 assert.equal(R.summary(p).total,0);assert.equal(R.summary(p).orphans,0);
});
test('new review linked to chosen element and accepted in native JSON',()=>{
 const p=project();const note=add(p,'자료 기준일 확인',{author:'인천분회',priority:'high'});
 assert.equal(R.anchor(note,p.pages).state,'element');assert.equal(R.summary(p).highOpen,1);
 const normalized=C.normalizeProject(JSON.parse(JSON.stringify(p)));
 assert.equal(normalized.reviews[0].body,'자료 기준일 확인');assert.equal(normalized.reviews[0].author,'인천분회');
});
test('non-English multiline content, quotes and markup kept inert in native data',()=>{
 const p=project(),body='"<img onerror=alert(1)>"\n직원 부담 우려';add(p,body);
 assert.equal(C.normalizeProject(p).reviews[0].body,body);assert.equal(R.exportText(p).includes(body),true);
});
test('public HTML and HTML TXT omit private identities and review contents',()=>{
 const p=project();add(p,'INTERNAL_REVIEW_SECRET_XY890',{author:'PRIVATE_EMPLOYEE_XY890'});
 const html=X.exportHTML(p),txt=X.exportText(p),ai=X.aiPrompt(p);
 assert.equal(html.includes('INTERNAL_REVIEW_SECRET_XY890'),false);
 assert.equal(html.includes('PRIVATE_EMPLOYEE_XY890'),false);
 assert.equal(txt.includes('INTERNAL_REVIEW_SECRET_XY890'),false);
 assert.equal(ai.includes('INTERNAL_REVIEW_SECRET_XY890'),false);
 assert.match(html,/<script id="docut-project"/);assert.equal(C.normalizeProject(p).reviews[0].body,'INTERNAL_REVIEW_SECRET_XY890');
});
test('resolved review is not a truth/verification flag and can be reopened',()=>{
 const p=project(),n=add(p);R.setStatus(p,n.id,'resolved','검토팀');
 assert.equal(R.summary(p).resolved,1);assert.equal(p.reviews[0].resolvedBy,'검토팀');
 assert.equal(p.pages[0].elements[0].verified,false);
 assert.throws(()=>R.reply(p,n.id,{body:'요청',author:'a'}),/Reopen/);
 R.setStatus(p,n.id,'open');assert.equal(p.reviews[0].resolvedAt,'');assert.equal(p.reviews[0].resolvedBy,'');
});
test('replies and edits preserve note identity and modification date',()=>{
 const p=project(),n=add(p);R.reply(p,n.id,{body:'정정 요청',author:'팀원'});R.edit(p,n.id,'재검토 요청');
 assert.equal(p.reviews[0].replies[0].body,'정정 요청');assert.equal(p.reviews[0].body,'재검토 요청');assert.equal(p.reviews[0].id,n.id);
});
test('priorities and filters compose with reply corpus and status',()=>{
 const p=project(),a=add(p,'첫 번째',{priority:'normal'}),b=add(p,'두 번째',{priority:'high'});
 R.reply(p,b.id,{author:'도움',body:'제도 비교 근거'});R.setStatus(p,a.id,'resolved');
 assert.deepEqual(R.filter(p,{status:'open',priority:'high'}).map(n=>n.id),[b.id]);
 assert.deepEqual(R.filter(p,{query:'제도 비교'}).map(n=>n.id),[b.id]);
 assert.deepEqual(R.filter(p,{query:'존재하지않음'}),[]);
 R.setPriority(p,b.id,'low');assert.equal(R.summary(p).highOpen,0);
});
test('deleting page or element never deletes its review; it becomes orphan',()=>{
 const p=project(),n=add(p);p.pages[0].elements.splice(0,1);
 assert.equal(R.anchor(p.reviews[0],p.pages).state,'orphan');assert.equal(R.summary(p).orphans,1);
 const p1=p.pages.splice(0,1)[0];assert.equal(R.anchor(p.reviews[0],p.pages).state,'orphan');
 assert.equal(p1.id,n.pageId);
 const after=R.retarget(p,n.id,p.pages[0].id,'');assert.equal(R.anchor(after,p.pages).state,'page');
});
test('document-scope feedback is not page-dependent',()=>{
 const p=project();const n=R.insert(p,{body:'전체 의견',author:'','pageId':'','elementId':''});assert.equal(R.anchor(n,p.pages).state,'document');
 p.pages.shift();assert.equal(R.summary(p).orphans,0);
});
test('page reorder preserves feedback location by identity rather than index',()=>{
 const p=project(),n=add(p);p.pages.reverse();assert.equal(R.anchor(n,p.pages).pageIndex,2);
});
test('appendProject remaps imported comments to fresh page and element identities',()=>{
 const a=project(),b=project(),bNote=add(b,'두 번째 프로젝트 리뷰',{author:'검토자'});add(a,'원본 리뷰');
 const combined=C.appendProject(a,b);assert.equal(combined.reviews.length,2);
 const imported=combined.reviews.find(r=>r.body===bNote.body);
 assert.notEqual(imported.id,bNote.id);assert.notEqual(imported.pageId,bNote.pageId);
 assert.notEqual(imported.elementId,bNote.elementId);assert.equal(R.anchor(imported,combined.pages).state,'element');
 assert.equal(combined.reviews[0].body,'원본 리뷰');assert.equal(a.reviews.length,1);assert.equal(b.reviews.length,1);
});
test('appendProject preserves disconnected review as a separate orphan',()=>{
 const a=project(),b=project();const note=R.insert(b,{body:'지워진 개체',pageId:'deleted-page',elementId:'deleted-element'});
 const combined=C.appendProject(a,b),imported=combined.reviews.find(r=>r.body===note.body);
 assert.match(imported.anchorHint,/deleted-page/);assert.equal(R.anchor(imported,combined.pages).state,'orphan');
});
test('invalid review shape rejected rather than silently removed',()=>{
 const p=project();p.reviews={bad:true};assert.throws(()=>C.normalizeProject(p),/Reviews must be an array/);
});
test('duplicate review IDs, IDs with HTML tags and broken timestamps rejected',()=>{
 const p=project(),n=add(p);p.reviews.push({...n});assert.throws(()=>C.normalizeProject(p),/duplicate review ID/);
 p.reviews.pop();p.reviews[0].id='<svg>';assert.throws(()=>C.normalizeProject(p),/Invalid or duplicate/);
 p.reviews[0].id=n.id;p.reviews[0].createdAt='broken';assert.throws(()=>C.normalizeProject(p),/timestamp/);
});
test('unsupported status and priority rejected without editing original project',()=>{
 const p=project(),n=add(p),before=JSON.stringify(p);
 assert.throws(()=>R.setStatus(p,n.id,'approved'),/Invalid review status/);
 assert.throws(()=>R.setPriority(p,n.id,'urgent'),/Invalid priority/);
 assert.equal(JSON.stringify(p),before);
});
test('overlong feedback is rejected completely, no clipped result',()=>{
 const p=project(),n=add(p),before=JSON.stringify(p);
 assert.throws(()=>R.insert(p,{body:'x'.repeat(R.MAX_BODY+1)}),/exceeds/);
 assert.throws(()=>R.edit(p,n.id,'y'.repeat(R.MAX_BODY+1)),/exceeds/);
 assert.equal(JSON.stringify(p),before);
});
test('reply limit is enforced without truncating existing replies',()=>{
 const p=project(),n=add(p);for(let i=0;i<R.MAX_REPLIES;i++)R.reply(p,n.id,{body:'답글 '+i});
 const before=JSON.stringify(p);assert.throws(()=>R.reply(p,n.id,{body:'추가 댓글'}),/already has/);assert.equal(JSON.stringify(p),before);
});
test('review total limit is enforced without replacing existing notes',()=>{
 const p=project();for(let i=0;i<R.MAX_NOTES;i++)R.insert(p,{body:'검토 '+i});
 const before=JSON.stringify(p);assert.throws(()=>R.insert(p,{body:'추가'}),/count exceeds/);assert.equal(JSON.stringify(p),before);
});
test('source append review-limit failure leaves original target untouched',()=>{
 const a=project(),b=project();for(let i=0;i<R.MAX_NOTES;i++)R.insert(a,{body:'a'+i});R.insert(b,{body:'extra'});
 const before=JSON.stringify(a);assert.throws(()=>C.appendProject(a,b),/exceeds/);assert.equal(JSON.stringify(a),before);
});
test('CSV quotes embedded commas/newlines and prefixes formula-like cells',()=>{
 const p=project();add(p,'=HYPERLINK("https://example.test","BAD")\n"quoted"',{author:'+cmd'});
 const csv=R.exportCSV(p);assert.match(csv,/"'=HYPERLINK/);assert.match(csv,/"'\+cmd"/);assert.match(csv,/""quoted""/);assert.ok(csv.includes('\r\n'));
});
test('HTML import of public export cannot leak private reviews back',()=>{
 const p=project();add(p,'INTERNAL_PRIVATE_NOTE');const html=X.exportHTML(p);
 const embedded=html.match(/<script id="docut-project"[^>]*>([\s\S]*?)<\/script>/);
 assert.ok(embedded);assert.equal(C.normalizeProject(JSON.parse(embedded[1])).reviews.length,0);
});
test('native JSON export via normalization retains original review replies',()=>{
 const p=project(),n=add(p);R.reply(p,n.id,{author:'담당자',body:'수정 예정'});
 const saved=JSON.stringify(C.normalizeProject(p));assert.equal(C.normalizeProject(JSON.parse(saved)).reviews[0].replies[0].body,'수정 예정');
});
test('resolved note warns when anchored text changes, without changing note status',()=>{
 const p=project(),n=add(p,'원문 변경 감지');R.setStatus(p,n.id,'resolved','검토자');
 assert.equal(R.summary(p).staleResolved,0);const before=p.reviews[0].resolvedFingerprint;assert.match(before,/^[a-f0-9]{8}$/);
 first(p).text='원문 변경됨';assert.equal(R.summary(p).staleResolved,1);
 assert.equal(p.reviews[0].status,'resolved');assert.equal(p.reviews[0].resolvedFingerprint,before);
 assert.match(R.exportText(p),/이후 원문 변경됨/);assert.match(R.exportCSV(p),/"예"/);
 R.setStatus(p,n.id,'open');assert.equal(R.summary(p).staleResolved,0);
 R.setStatus(p,n.id,'resolved','재확인');assert.equal(R.summary(p).staleResolved,0);
});
test('revising a resolved note reopens it and invalidates its prior resolution',()=>{
 const p=project(),n=add(p);R.setStatus(p,n.id,'resolved');R.edit(p,n.id,'새 내용으로 변경');
 assert.equal(p.reviews[0].status,'open');assert.equal(p.reviews[0].resolvedFingerprint,'');
});
test('reanchoring a resolved review reopens it instead of carrying prior signoff',()=>{
 const p=project(),n=add(p);R.setStatus(p,n.id,'resolved');R.retarget(p,n.id,p.pages[1].id);
 assert.equal(p.reviews[0].status,'open');assert.equal(R.anchor(p.reviews[0],p.pages).pageIndex,1);
});
test('unchanged page review fingerprint remains stable when different page changes',()=>{
 const p=project(),n=R.insert(p,{pageId:p.pages[0].id,body:'페이지 검토'});R.setStatus(p,n.id,'resolved');
 p.pages[1].tab='다른 장에서만 수정';assert.equal(R.summary(p).staleResolved,0);
 p.pages[0].headline='제목 변경';assert.equal(R.summary(p).staleResolved,1);
});
test('forged malformed resolution fingerprint is rejected rather than dropped',()=>{
 const p=project(),n=add(p);R.setStatus(p,n.id,'resolved');p.reviews[0].resolvedFingerprint='fake';
 assert.throws(()=>C.normalizeProject(p),/Invalid review resolution fingerprint/);
});
test('review-only exchange packet omits all page and element content by default',()=>{
 const p=project(),n=add(p,'의견 기록');p.pages[0].elements[0].text='SECRET_PAGE_TEXT_NOT_SHARED';
 const out=R.exportPacket(p),parsed=JSON.parse(out);
 assert.equal(parsed.kind,'docut-private-review-packet');assert.equal(parsed.reviews.length,1);
 assert.equal(out.includes('SECRET_PAGE_TEXT_NOT_SHARED'),false);assert.equal(out.includes('pages'),false);
 assert.equal(parsed.reviews[0].id,n.id);
});
test('review packet can be merged into unchanged sibling copy without rewriting pages',()=>{
 const original=project(),receiver=C.clone(original),source=C.clone(original);
 R.insert(source,{pageId:source.pages[0].id,body:'팀 회신',author:'동료'});
 const packet=R.exportPacket(source),before=JSON.stringify(receiver.pages);
 const plan=R.inspectPacket(receiver,packet);assert.equal(plan.added.length,1);assert.equal(plan.orphanCount,0);
 receiver.reviews=R.mergePacket(receiver,packet);
 assert.equal(receiver.reviews[0].body,'팀 회신');assert.equal(JSON.stringify(receiver.pages),before);
 const again=R.inspectPacket(receiver,packet);assert.equal(again.added.length,0);assert.equal(again.duplicateCount,1);
});
test('review-only exchange is rejected when from a different report',()=>{
 const p=project(),other=project();other.createdAt='2030-02-02T00:00:00.000Z';add(other);
 const before=JSON.stringify(p);assert.throws(()=>R.mergePacket(p,R.exportPacket(other)),/another original report/);assert.equal(JSON.stringify(p),before);
});
test('packet ID collision with diverged edits refuses rather than overwriting',()=>{
 const p=project(),other=C.clone(p),n=add(p,'original');other.reviews=R.normalize(p.reviews);
 R.edit(other,n.id,'different feedback');const before=JSON.stringify(p);
 assert.throws(()=>R.mergePacket(p,R.exportPacket(other)),/different content/);assert.equal(JSON.stringify(p),before);
});
test('invalid packet kind and missing identity rejected',()=>{
 const p=project(),before=JSON.stringify(p);
 assert.throws(()=>R.inspectPacket(p,{kind:'not-review',version:1,createdAt:p.createdAt,reviews:[]}),/supported/);
 assert.throws(()=>R.inspectPacket(p,{kind:'docut-private-review-packet',version:1,reviews:[]}),/another original report/);
 assert.equal(JSON.stringify(p),before);
});
test('packet containing an orphan review remains reviewable without losing its text',()=>{
 const p=project(),other=C.clone(p);R.insert(other,{pageId:'no-longer-here',body:'유실된 개체'});
 const plan=R.inspectPacket(p,R.exportPacket(other));assert.equal(plan.orphanCount,1);
 p.reviews=R.mergePacket(p,R.exportPacket(other));assert.equal(R.anchor(p.reviews[0],p.pages).state,'orphan');
});
test('packet exceeding the global review cap aborts merge atomically',()=>{
 const p=project(),other=C.clone(p);
 for(let i=0;i<R.MAX_NOTES;i++)R.insert(p,{body:'local '+i});R.insert(other,{body:'incoming'});
 const before=JSON.stringify(p);assert.throws(()=>R.mergePacket(p,R.exportPacket(other)),/exceed/);assert.equal(JSON.stringify(p),before);
});
