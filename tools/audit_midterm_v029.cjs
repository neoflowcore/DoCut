'use strict';
// Static evidence only. A registered target is not proof of runtime or reference parity.
const fs=require('node:fs');require('../assets/core.js');require('../assets/core_enhanced.js');
const cat=require('../assets/effect_catalog.js'),ref=require('../assets/reference_map.js');
const counts=ref.DATA.items.reduce((out,item)=>(out[item.kind]=(out[item.kind]||0)+1,out),{});
const bucket=new Map();for(const item of ref.DATA.items){const key=item.kind+':'+item.target;if(!bucket.has(key))bucket.set(key,[]);bucket.get(key).push(item.index);}
const items=ref.DATA.items.map(item=>({index:item.index,filename:item.filename,kind:item.kind,target:item.target,legacyStatus:item.status,
 status:item.kind==='guide'?'guide-metadata-only':'reference-parity-unverified',
 sharedTargetIndices:bucket.get(item.kind+':'+item.target),originalImageAvailable:false,
 targetRegistered:item.kind==='preset'?cat.PRESETS.some(p=>p.id===item.target):item.kind==='transition'?cat.TRANSITIONS.some(t=>t.id===item.target):item.kind==='palette'?!!cat.PALETTES[item.target]:item.kind==='layout'?!!globalThis.DocutCore.LAYOUTS[item.target]:null}));
const report={schema:'docut-midterm-audit-v029',baselineTree:'576c02a185a8a9672c7df1d40624ac28aef37dbe',referenceCount:items.length,
 uniqueReferenceIndices:new Set(items.map(i=>i.index)).size,counts,registered:{motionKinds:cat.KINDS.length,presets:cat.PRESETS.length,transitions:cat.TRANSITIONS.length,palettes:Object.keys(cat.PALETTES).length,layouts:Object.keys(globalThis.DocutCore.LAYOUTS).length},
 caveat:'52 preset references do not equal 52 verified implementations. Shared target mappings remain unverified; original images are unavailable. No completion percentage inferred.',items};
if(items.length!==89||report.uniqueReferenceIndices!==89||items.some((item,i)=>item.index!==i))throw Error('Reference identity loss');
fs.writeFileSync('docs/MIDTERM_REFERENCE_AUDIT_V029.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({referenceCount:report.referenceCount,counts,registered:report.registered,missingRegisteredTargets:items.filter(i=>i.targetRegistered===false).map(i=>i.index)}));
