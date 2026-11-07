(function(root){
 'use strict';
 // One atomic localStorage value per checkpoint. Keep the V0.13 key untouched
 // for backward-compatible, non-destructive recovery of legacy documents.
 const KEY='docut-studio-v18-checkpoint';
 const LEGACY='docut-studio-v13';
 const BACKUPS='docut-studio-backups';
 const FORMAT='docut-checkpoint-v1';
 const MAX_BACKUPS=6;
 const checksum=input=>{
  let value=2166136261;
  const data=String(input);
  for(let i=0;i<data.length;i++){
   value^=data.charCodeAt(i);
   value=Math.imul(value,16777619);
  }
  // Error-detection only. Not a cryptographic signature.
  return (value>>>0).toString(16).padStart(8,'0');
 };
 const tokenOf=(status,raw,sequence=0,hash='')=>({status,sequence,hash:hash||checksum(raw||'')});
 const sameToken=(a,b)=>Boolean(a&&b&&a.status===b.status&&a.sequence===b.sequence&&a.hash===b.hash);
 const get=(storage,key)=>{if(!storage||typeof storage.getItem!=='function')throw Error('Browser storage is not available');return storage.getItem(key);};
 function inspect(storage,normalize){
  let raw=null;
  try{
   raw=get(storage,KEY);
   if(raw!==null){
    try{
     const value=JSON.parse(raw);
     if(!value||value.format!==FORMAT||!Number.isSafeInteger(value.sequence)||value.sequence<1||!value.project||typeof value.project!=='object')throw Error('Unsupported or incomplete checkpoint');
     const serialized=JSON.stringify(value.project);
     if(!/^[0-9a-f]{8}$/.test(value.checksum)||checksum(serialized)!==value.checksum)throw Error('Checkpoint integrity check failed');
     const project=normalize(value.project);
     return {status:'current',project,token:tokenOf('current','',value.sequence,value.checksum),savedAt:String(value.savedAt||''),writerId:String(value.writerId||'')};
    }catch(e){return {status:'corrupt',error:String(e.message||e),raw};}
   }
   const legacy=get(storage,LEGACY);
   if(legacy!==null){
    try{return {status:'legacy',project:normalize(JSON.parse(legacy)),token:tokenOf('legacy',legacy)};}
    catch(e){return {status:'corrupt-legacy',error:'Legacy document is invalid: '+String(e.message||e),raw:legacy};}
   }
   return {status:'empty',token:tokenOf('empty','')};
  }catch(e){return {status:'unavailable',error:String(e.message||e),raw};}
 }
 function encode(project,writerId,sequence,now){
  const content=JSON.stringify(project);
  if(content.length>12*1024*1024)throw Error('Document exceeds the 12MB checkpoint safety cap');
  return JSON.stringify({format:FORMAT,sequence,writerId:String(writerId||'unknown').slice(0,120),savedAt:now||new Date().toISOString(),checksum:checksum(content),project});
 }
 function write(storage,normalize,project,expected,writerId){
  const actual=inspect(storage,normalize);
  if(actual.status==='unavailable')return {status:'unavailable',error:actual.error};
  if(actual.status.startsWith('corrupt'))return {status:'corrupt',error:actual.error,actual};
  if(!sameToken(actual.token,expected))return {status:'conflict',actual};
  try{
   const sequence=actual.status==='current'?actual.token.sequence+1:1;
   const raw=encode(project,writerId,sequence);
   storage.setItem(KEY,raw);
   const latest=inspect(storage,normalize);
   if(latest.status!=='current'||latest.token.hash!==checksum(JSON.stringify(project))||latest.token.sequence!==sequence)return {status:'conflict',actual:latest,error:'Concurrent checkpoint replacement detected'};
   return {status:'saved',token:latest.token,savedAt:latest.savedAt};
  }catch(e){return {status:'failed',error:String(e.message||e)};}
 }
 function inspectBackups(storage){
  let raw=null;
  try{raw=get(storage,BACKUPS);if(raw===null)return {status:'ok',items:[]};
   const value=JSON.parse(raw);if(!Array.isArray(value))throw Error('Backup index must be an array');
   // Do not silently filter invalid records and overwrite the raw index on the next backup.
   if(value.some(row=>!row||typeof row!=='object'||!row.project||typeof row.project!=='object'||!Array.isArray(row.project.pages)))throw Error('Backup index contains invalid entries');
   return {status:'ok',items:value.slice(0,MAX_BACKUPS)};
  }catch(e){return {status:raw===null?'unavailable':'corrupt',error:String(e.message||e),raw,items:[]};}
 }
 function readBackups(storage){return inspectBackups(storage).items;}
 function makeBackup(storage,project,label){
  const existing=inspectBackups(storage);
  if(existing.status!=='ok')return {status:existing.status,error:existing.error};
  const snapshot={date:new Date().toISOString(),label:String(label||'automatic').slice(0,100),project:JSON.parse(JSON.stringify(project))};
  const list=existing.items;
  const signature=checksum(JSON.stringify(snapshot.project));
  if(list.some(row=>checksum(JSON.stringify(row.project))===signature))return {status:'unchanged',count:list.length};
  list.unshift(snapshot);
  let previousError='';
  for(const limit of [MAX_BACKUPS,4,2,1]){
   try{storage.setItem(BACKUPS,JSON.stringify(list.slice(0,limit)));return {status:'saved',count:Math.min(limit,list.length)};}
   catch(e){previousError=String(e.message||e);}
  }
  return {status:'failed',error:previousError};
 }
 function resolveExternal(storage,normalize,project,writerId){
  const latest=inspect(storage,normalize);
  if(!['current','legacy','empty'].includes(latest.status))return {status:latest.status,error:latest.error};
  if(latest.project&&!['saved','unchanged'].includes(makeBackup(storage,latest.project,'before explicitly replacing another tab').status))return {status:'failed',error:'Could not preserve the existing saved document'};
  return write(storage,normalize,project,latest.token,writerId);
 }
 // Recovery previews compare identifiers, evidence and verification, not guessed semantic truth.
 function compareProjects(current,target){
  const pageMap=project=>new Map((project?.pages||[]).map(pg=>[pg.id,pg]));
  const a=pageMap(current),b=pageMap(target),stats={pagesBefore:a.size,pagesAfter:b.size,pagesAdded:0,pagesRemoved:0,pagesChanged:0,pagesReordered:false,documentSettingsChanged:false,elementsAdded:0,elementsRemoved:0,elementsChanged:0,sourcesChanged:0,verificationLost:0,changedPageNames:[]};
  const beforeOrder=(current?.pages||[]).map(pg=>pg.id).filter(id=>b.has(id)).join('|');
  const afterOrder=(target?.pages||[]).map(pg=>pg.id).filter(id=>a.has(id)).join('|');
  stats.pagesReordered=beforeOrder!==afterOrder;
  stats.documentSettingsChanged=['title','theme','master','storyMode'].some(k=>JSON.stringify(current?.[k]??null)!==JSON.stringify(target?.[k]??null));
  for(const [id,pg] of b)if(!a.has(id)){stats.pagesAdded++;stats.changedPageNames.push(String(pg.tab||'New page').slice(0,80));}
  for(const [id,pg] of a)if(!b.has(id)){stats.pagesRemoved++;stats.changedPageNames.push(String(pg.tab||'Removed page').slice(0,80));}
  const metaKeys=['source','asOfDate','unit','evidence','verified'];
  const flatten=project=>new Map((project?.pages||[]).flatMap(pg=>(pg.elements||[]).map(e=>[e.id,e])));
  const before=flatten(current),after=flatten(target);
  for(const [id,block] of after)if(!before.has(id))stats.elementsAdded++;
  for(const [id,block] of before)if(!after.has(id)){stats.elementsRemoved++;if(block.verified===true)stats.verificationLost++;}
  for(const [id,block] of after){const prior=before.get(id);if(!prior)continue;
   if(JSON.stringify(prior)!==JSON.stringify(block))stats.elementsChanged++;
   if(metaKeys.some(key=>JSON.stringify(prior[key]??null)!==JSON.stringify(block[key]??null)))stats.sourcesChanged++;
   if(prior.verified===true&&block.verified!==true)stats.verificationLost++;
  }
  for(const [id,pg] of b){const old=a.get(id);if(!old)continue;if(JSON.stringify(old)!==JSON.stringify(pg)){stats.pagesChanged++;stats.changedPageNames.push(String(pg.tab||'Page').slice(0,80));}}
  return stats;
 }
 const api={KEY,LEGACY,BACKUPS,FORMAT,checksum,sameToken,inspect,write,encode,readBackups,inspectBackups,makeBackup,resolveExternal,compareProjects};
 root.DocutPersistence=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
