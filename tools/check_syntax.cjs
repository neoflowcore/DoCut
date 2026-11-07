'use strict';
const fs=require('node:fs'),{spawnSync}=require('node:child_process');
for(const f of fs.readdirSync('assets').filter(f=>f.endsWith('.js'))){const r=spawnSync(process.execPath,['--check','assets/'+f],{encoding:'utf8'});if(r.status!==0){process.stderr.write(r.stderr);process.exit(r.status||1);}}
console.log('All asset JavaScript syntax checks passed.');
