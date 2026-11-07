'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const C=require('../assets/core.js');require('../assets/core_enhanced.js');
const X=require('../assets/export.js');

test('standalone report embeds the SAME easing code as editor, not stale duplicated motion',()=>{
 const easing=fs.readFileSync(path.join(__dirname,'../assets/easing.js'),'utf8');
 const html=X.exportHTML(C.createProject(1));
 assert.ok(html.includes('<script>'+easing+'</script>'),'Run python tools/sync_export_runtime.py to update the standalone script');
 assert.match(html,/buildFrames\(item\.effects,1000\/60\)/);
 assert.match(html,/Math\.min\(360,Math\.ceil/);
});

test('standalone print layout keeps an exact 16:9 slide per printed page',()=>{
 const html=X.exportHTML(C.createProject(2));
 assert.match(html,/@page\{size:13\.333in 7\.5in;margin:0\}/);
 assert.match(html,/\.report-screen\{width:1280px;height:auto;transform:none!important\}/);
 assert.match(html,/\.report-screen \.slide\{width:1280px;height:720px;position:relative;display:block;break-after:page/);
});
