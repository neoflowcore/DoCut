/* DoCut v0.43: recover only genuinely missing UBS text placeholders after async
 * vector/slot geometry loads. No changes to user-authored elements, edits or page IDs.
 */
(function(root){
'use strict';
function collect(project,vector){
 if(!project||!Array.isArray(project.pages)||vector?.status!=='ready'||!Array.isArray(vector.sourcePages)||typeof vector.make!=='function')return [];
 const proposals=[];
 for(const page of project.pages){
  if(page?.referenceFidelity?.mode!=='source-ratio'||page.referenceFidelity.sourceEdition!=='2025'||!Array.isArray(page.elements)||page.elements.length!==0)continue;
  const n=vector.sourcePages.indexOf(page.referenceFidelity.sourcePage);
  if(n<0)continue;
  const generated=vector.make(n);
  if(!Array.isArray(generated?.elements)||!generated.elements.length||generated.elements.length>120)continue;
  proposals.push({id:page.id,elements:generated.elements});
 }
 return proposals;
}
function apply(project,proposals){
 let count=0;
 for(const change of proposals){
  const page=project?.pages?.find(p=>p.id===change.id);
  if(page?.referenceFidelity?.mode!=='source-ratio'||page.referenceFidelity.sourceEdition!=='2025'||page.elements.length!==0)continue;
  page.elements=change.elements;count++;
 }
 return count;
}
const api={collect,apply};
root.DocutUBSSlotRecovery=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
