'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const ST=require('../assets/story_player.js');
const C=require('../assets/core.js');require('../assets/core_enhanced.js');
const X=require('../assets/export.js');
const story=(durations=[3000,5000])=>durations.map(playbackMs=>({playbackMs}));
function rig(ds=[3000,5000],loop=false){
 let now=1000,id=0;const jobs=new Map(),pages=story(ds),visited=[],ticks=[];
 const player=ST.makeController({getPages:()=>pages,clock:()=>now,schedule(fn,delay){const k=++id;jobs.set(k,{fn,delay});return k;},cancel(k){jobs.delete(k);},onPage:i=>visited.push(i),onTick:x=>ticks.push(x)});
 if(loop)player.setLoop(true);
 function advance(ms){now+=ms;const [[id,v]]=[...jobs];assert.ok(v,'controller has scheduled no wake');jobs.delete(id);v.fn();return player.getState();}
 return {player,pages,visited,ticks,jobs,advance,clock:()=>now};
}
// Metadata and duration preservation
for(const [value,expected] of [[undefined,12000],[null,12000],[3000,3000],[60000,60000],[12345,12345]])test('V0.25 duration '+String(value),()=>assert.equal(ST.duration(value),expected));
for(const invalid of ['',0,2,2999,60001,'1.5','bad',-1,Infinity,NaN])test('V0.25 invalid duration '+String(invalid),()=>assert.throws(()=>ST.duration(invalid),/3~60/));
test('story total respects each page and legacy default',()=>assert.equal(ST.totalDuration([{playbackMs:3000},{}, {playbackMs:5000}]),20000));
test('timestamp parser preserves seconds and fractional milliseconds',()=>{for(const [input,output] of [['0',0],['0.5',500],['3.075',3075],['01:03.500',63500],['00:59.999',59999]])assert.equal(ST.stamp(input),output);});
test('timestamp rejects 60 second carry and executable expressions',()=>{for(const v of ['0:60','<script>','3 + 1','-2','NaN','2e5','1:02:03'])assert.throws(()=>ST.stamp(v));});
test('caption parse retains Unicode, punctuation and literal HTML source as text',()=>{const cues=ST.parseScript('0-4 | 확인: 국문·숫자 70%\n4.5-9.125 | <img src=x onerror=alert(1)>',12000);assert.deepEqual(cues.map(x=>x.startMs),[0,4500]);assert.equal(cues[1].endMs,9125);assert.equal(cues[1].text,'<img src=x onerror=alert(1)>');});
test('caption serialization round trip retains timing within 1 millisecond',()=>{const raw=[{startMs:375,endMs:1505,text:'테스트'},{startMs:2200,endMs:3999,text:'다음 장면'}];const text=ST.toScript(raw);assert.deepEqual(ST.parseScript(text,5000),raw);});
test('blank caption script explicitly clears all cues',()=>assert.deepEqual(ST.parseScript('  \n   ',12000),[]));
test('caption parser rejects overlaps and end before start',()=>{for(const raw of ['0-5 | A\n4-8 | B','5-4 | B','0-62 | test'])assert.throws(()=>ST.parseScript(raw,60000));});
test('caption parser rejects malformed lines as a whole without accepting a partial subset',()=>assert.throws(()=>ST.parseScript('0-2 | okay\nTRAILING PARTIAL',12000),/2행/));
test('caption parser rejects 17 cues and more than 220 characters',()=>{assert.throws(()=>ST.parseScript(Array.from({length:17},(_,i)=>`${i}-${i+1} | line ${i}`).join('\n'),60000),/16/);assert.throws(()=>ST.parseScript('0-2 | '+'x'.repeat(221),12000),/220/);});
test('caption parser rejects control characters',()=>assert.throws(()=>ST.parseScript('0-2 | bad\u0001value',12000),/220/));
test('caption validation refuses non-array or invalid numeric metadata',()=>{assert.throws(()=>ST.validateCaptions({},12000));assert.throws(()=>ST.validateCaptions([{startMs:0.5,endMs:2000,text:'a'}],12000));assert.throws(()=>ST.validateCaptions([{startMs:0,endMs:2000,text:55}],12000));});
test('adjacent captions are allowed, active edge respects half-open intervals',()=>{const cues=ST.parseScript('0-2 | first\n2-4 | second',4000);assert.equal(ST.activeCaption(cues,1999),'first');assert.equal(ST.activeCaption(cues,2000),'second');assert.equal(ST.activeCaption(cues,4000),'');});
test('normalizer retains playback, captions and project identity through JSON round trip',()=>{const p=C.createProject(3,'policy');p.pages[0].playbackMs=7500;p.pages[0].captions=ST.parseScript('0-3 | 소개\n3-7 | 결론',7500);const result=C.normalizeProject(JSON.parse(JSON.stringify(p)));assert.equal(result.pages[0].playbackMs,7500);assert.deepEqual(result.pages[0].captions,p.pages[0].captions);assert.equal(result.pages[0].id,p.pages[0].id);});
test('normalizer refuses malformed timed text rather than dropping it',()=>{const p=C.createProject();p.pages[0].captions=[{startMs:0,endMs:99999,text:'bad'}];assert.throws(()=>C.normalizeProject(p));});
test('standalone public HTML retains intended captions but does not include private review notes',()=>{require('../assets/review_board.js');const p=C.createProject();p.pages[0].captions=ST.parseScript('0-4 | 화면 공개 캡션',12000);p.reviews=[require('../assets/review_board.js').newReview({body:'PRIVATE_REVIEW_SAFETY_925',pageId:p.pages[0].id,author:'tester'})];const html=X.exportHTML(p);assert.ok(html.includes('화면 공개 캡션'));assert.ok(html.includes('DocutStoryPlayer'));assert.ok(html.includes('id="autoPlay"'));assert.ok(!html.includes('PRIVATE_REVIEW_SAFETY_925'));});
// Clock/state tests with injected fake timers (no waiting and no background jobs)
test('controller starts stopped, does not schedule before deliberate play',()=>{const r=rig();assert.equal(r.player.getState().playing,false);assert.equal(r.jobs.size,0);});
test('controller advances exactly one page on configured time boundary',()=>{const r=rig();r.player.play();const s=r.advance(3000);assert.equal(s.index,1);assert.equal(s.elapsedMs,0);assert.deepEqual(r.visited,[1]);});
test('controller crosses multiple short pages after a suspended timer',()=>{const r=rig([3000,3000,3000]);r.player.play();const s=r.advance(6800);assert.equal(s.index,2);assert.equal(s.elapsedMs,800);assert.deepEqual(r.visited,[1,2]);});
test('controller automatically holds on the last slide without unexpected wrap',()=>{const r=rig();r.player.play();const s=r.advance(12000);assert.equal(s.index,1);assert.equal(s.playing,false);assert.equal(s.elapsedMs,5000);assert.equal(r.jobs.size,0);});
test('controller loop wraps to the first page only when explicitly enabled',()=>{const r=rig([3000,5000],true);r.player.play();const s=r.advance(8500);assert.equal(s.index,0);assert.equal(s.elapsedMs,500);assert.equal(s.playing,true);});
test('manual page jump resets progress without destroying running state',()=>{const r=rig();r.player.play();r.advance(1000);const s=r.player.jump(1);assert.equal(s.index,1);assert.equal(s.elapsedMs,0);assert.equal(s.playing,true);assert.equal(r.jobs.size,1);});
test('controller pause leaves exactly no scheduled timers and does not resume automatically',()=>{const r=rig();r.player.play();r.advance(1300);r.player.pause();assert.equal(r.jobs.size,0);assert.equal(r.player.getState().playing,false);assert.equal(r.player.getState().elapsedMs,1300);});
test('controller resumes without losing elapsed time',()=>{const r=rig();r.player.play();r.advance(1400);r.player.pause();r.player.play();assert.equal(r.advance(800).elapsedMs,2200);});
test('controller stop resets elapsed progress and clears timer without clearing page',()=>{const r=rig();r.player.jump(1);r.player.play();r.advance(500);const s=r.player.stop();assert.equal(s.index,1);assert.equal(s.elapsedMs,0);assert.equal(s.playing,false);assert.equal(r.jobs.size,0);});
test('seek stays within segment and exposes exact progress without changing source project',()=>{const r=rig();const s=r.player.seek(2000);assert.equal(s.elapsedMs,2000);assert.ok(Math.abs(s.progress-2/3)<1e-9);assert.deepEqual(r.pages,story());});
test('speed controls scale dwelling time but preserve current playback position',()=>{const r=rig();r.player.play();r.advance(1000);r.player.setSpeed(2);assert.equal(r.player.getState().elapsedMs,1000);const s=r.advance(500);assert.equal(s.elapsedMs,2000);});
test('speed cannot exceed documented bounded presets',()=>{const r=rig();for(const v of [0,-1,3,Infinity,'bogus'])assert.throws(()=>r.player.setSpeed(v));});
test('destroy cancels clock and makes later play or wake harmless',()=>{const r=rig();r.player.play();r.player.destroy();assert.equal(r.jobs.size,0);assert.equal(r.player.play().playing,false);});
test('controller cannot start when no pages are present',()=>{const r=rig([]);assert.equal(r.player.play().playing,false);assert.equal(r.jobs.size,0);});
test('global seek maps exact frame boundaries to next page and displays aggregate progress',()=>{
 const r=rig([3000,4500,6000]);
 let s=r.player.seekGlobal(2999);assert.equal(s.index,0);assert.equal(s.elapsedMs,2999);
 s=r.player.seekGlobal(3000);assert.equal(s.index,1);assert.equal(s.elapsedMs,0);
 s=r.player.seekGlobal(7500);assert.equal(s.index,2);assert.equal(s.elapsedMs,0);
 s=r.player.seekGlobal(9500);assert.equal(s.globalElapsedMs,9500);assert.equal(s.elapsedMs,2000);
 assert.equal(s.totalMs,13500);assert.equal(s.globalProgress,9500/13500);assert.deepEqual(r.visited,[1,2]);
});
test('global seek is bounded at zero and exact end without wrap',()=>{const r=rig([3000,5000]);let s=r.player.seekGlobal(-70);assert.equal(s.globalElapsedMs,0);s=r.player.seekGlobal(999999);assert.equal(s.index,1);assert.equal(s.elapsedMs,5000);assert.equal(s.globalProgress,1);});
test('global seek from current playing state keeps a single timer and notifies page change',()=>{const r=rig([3000,5000]);r.player.play();const s=r.player.seekGlobal(3500);assert.equal(s.index,1);assert.equal(s.elapsedMs,500);assert.equal(s.playing,true);assert.equal(r.jobs.size,1);assert.deepEqual(r.visited,[1]);});
test('global seek makes no changes when destroyed or without any pages',()=>{const a=rig([]);assert.equal(a.player.seekGlobal(100).totalMs,0);const b=rig();b.player.destroy();assert.equal(b.player.seekGlobal(5500).globalElapsedMs,0);});
test('caption style presets use enumerated presentation tokens only',()=>{assert.deepEqual(ST.STYLES,['cinema','glass','minimal']);const p=C.createProject();assert.equal(p.pages[0].captionStyle,'cinema');for(const style of ST.STYLES){p.pages[0].captionStyle=style;assert.equal(C.normalizeProject(p).pages[0].captionStyle,style);}p.pages[0].captionStyle='<script>';assert.throws(()=>C.normalizeProject(p),/Unsupported caption/);});
test('public HTML retains caption presentation style without changing literal text',()=>{const p=C.createProject();p.pages[0].captionStyle='glass';p.pages[0].captions=ST.parseScript('0-2 | 진술',12000);const html=X.exportHTML(p);assert.match(html,/caption-style-glass/);assert.match(html,/진술/);});
