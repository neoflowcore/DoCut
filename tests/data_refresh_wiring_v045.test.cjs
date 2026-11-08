'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const load=p=>fs.readFileSync(path.join(root,p),'utf8');
test('dataset refresh script initializes after data motion and before modal and app',()=>{
 const html=load('index.html');
 const scripts=[...html.matchAll(/<script src="\.\/assets\/([^"]+)" defer><\/script>/g)].map(m=>m[1]);
 const at=f=>scripts.indexOf(f);
 assert.ok(at('data_motion.js')>=0);
 assert.ok(at('large_dataset.js')>at('data_motion.js'));
 assert.ok(at('dataset_refresh.js')>at('large_dataset.js'));
 assert.ok(at('data_panel.js')>at('dataset_refresh.js'));
 assert.ok(at('app.js')>at('data_panel.js'));
 assert.equal(scripts.filter(f=>f==='dataset_refresh.js').length,1);
});
test('UI exposes an explicit, opt-in mass-refresh workflow with preflight and commit callback',()=>{
 const panel=load('assets/data_panel.js'),app=load('assets/app.js');
 assert.match(panel,/id="dataRefreshTarget"/);
 assert.match(panel,/value="refresh"/);
 assert.match(panel,/REF\.plan\(p,candidate,target\)/);
 assert.match(panel,/uploadedCandidate/);
 assert.match(panel,/api\.commitRefresh\(proposal\.bulkRefresh\)/);
 assert.match(app,/commitRefresh:prepared/);
 assert.match(app,/preMutationBackup\('before refreshing linked Excel source'\)/);
 assert.match(app,/refresh\.apply\(project,prepared\)/);
});
test('fast dialog preview samples rows but full review computes the unbounded selected range',()=>{
 const panel=load('assets/data_panel.js'),dm=load('assets/data_motion.js');
 assert.match(panel,/DM\.values\(candidate,spec,\{maxRows:sampleSize\}\)/);
 assert.match(panel,/bound=DM\.materialize\(block,candidate,spec\)/);
 assert.match(dm,/Number\.isInteger\(options\.maxRows\)/);
});

test('visible core version matches package version and the build remains no-CI',()=>{
 const manifest=JSON.parse(load('package.json'));
 const core=load('assets/core_enhanced.js');
 const visible=core.split("C.VERSION='")[1]?.split("'")[0];
 assert.ok(visible);
 assert.equal(visible,manifest.version);
 const deploy=JSON.parse(load('vercel.json'));
 assert.equal(deploy.git.deploymentEnabled,false);
});
