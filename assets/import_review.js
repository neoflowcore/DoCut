(function(root){
'use strict';
// Offline, read-only import planning. Every proposed preview is built from normalized
// DoCut shapes and escaped text; never render untrusted HTML from the source file.
const C=root.DocutCore;
if(!C)throw Error('DocutCore must load before import_review');
const escape=C.escapeHTML;
const isKnownMode=mode=>['native','native-json','css-approximation','txt'].includes(mode);
const number=n=>Number.isFinite(n)?n:0;
function counts(project){
 const pages=Array.isArray(project?.pages)?project.pages:[];
 const all=pages.flatMap(p=>Array.isArray(p.elements)?p.elements:[]);
 const types={};for(const item of all)types[item.type]=(types[item.type]||0)+1;
 return {pages:pages.length,blocks:all.length,types,evidence:all.filter(e=>Boolean(e.source||e.asOfDate||e.evidence||e.unit)).length,
  verified:all.filter(e=>e.verified===true).length,images:all.filter(e=>e.type==='image').length,
  missingImages:all.filter(e=>e.type==='image'&&!/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(String(e.data?.src||''))).length,
  rich:all.filter(e=>e.richText?.length).length,
  tables:all.filter(e=>e.type==='table').length,stats:all.filter(e=>e.type==='stat').length,
  offcanvas:all.filter(e=>!e.hidden&&(number(e.x)<0||number(e.y)<0||number(e.x)+number(e.w)>1280||number(e.y)+number(e.h)>720)).length};
}
function classifyWarning(input){
 const warning=String(input||'');
 const destructive=/(omitted|shortened|truncat|lost|exceed|only first|after row|after column|overflow|ignored|not imported|unavailable|cannot|비포함|손실|누락)/i.test(warning);
 const moderate=/(script|iframe|external|remote|dynamic|svg|canvas|transform|grid|flex|unsupported|simplif|1:1|similar|formatting|approximate|font)/i.test(warning);
 return destructive?'loss':moderate?'approximation':'info';
}
function analyze(current,imported){
 if(!imported||!imported.project||!Array.isArray(imported.project.pages))throw Error('No import candidate');
 const before=counts(current),after=counts(imported.project),mode=isKnownMode(imported.mode)?imported.mode:'unknown';
 const findings=[];const seen=new Set();const record=(message,kind,origin)=>{const m=String(message||'').trim();if(!m||seen.has(m))return;seen.add(m);findings.push({message:m,kind:kind||classifyWarning(m),origin});};
 (imported.warnings||[]).forEach(w=>record(w,null,'parser'));
 (imported.losses||[]).forEach(w=>record(w,'approximation','limitations'));
 if(mode==='css-approximation')record('외부 HTML은 비실행 정적 변환이며 Grid/Flex, 폰트, 스크립트·모션의 픽셀 동일성을 보장하지 않습니다.','approximation','policy');
 if(after.missingImages)record('편집 가능한 요소 '+after.missingImages+'개에서 내장 이미지가 없어 빈 이미지가 표시됩니다.','loss','media');
 if(after.offcanvas)record(after.offcanvas+'개 요소가 16:9 캔버스 밖까지 배치됩니다.','loss','geometry');
 if(!after.blocks)record('가져온 요소가 없습니다. 문서 교체에 앞서 원본을 재검토하세요.','loss','empty');
 if(after.verified)record('원본의 사용자 검증 표시 '+after.verified+'개를 그대로 복원했습니다. 출처의 실제 진위를 재검증한 것은 아닙니다.','info','trust');
 if(mode==='native'||mode==='native-json')record('DoCut 전용 구조를 읽었습니다. 표시·폰트·실행 환경은 별도 검증해야 합니다.','info','compatibility');
 const pageRows=imported.project.pages.map((p,i)=>({index:i,title:String(p.tab||'페이지 '+(i+1)).slice(0,100),blocks:p.elements.length,types:p.elements.reduce((a,e)=>(a[e.type]=(a[e.type]||0)+1,a),{}),evidence:p.elements.filter(e=>e.source||e.unit||e.asOfDate||e.evidence).length,verified:p.elements.filter(e=>e.verified).length}));
 return {mode,before,after,findings,pageRows,severe:findings.filter(f=>f.kind==='loss').length,
  cautions:findings.filter(f=>f.kind==='approximation').length,
  requireAcknowledgement:mode==='css-approximation'||findings.some(f=>f.kind==='loss'),
  appendAllowed:before.pages+after.pages<=50,previewIsOriginal:false};
}
function pagePreview(page,limit=35){
 if(!page||!Array.isArray(page.elements))return '<p>미리볼 페이지가 없습니다.</p>';
 const rects=page.elements.filter(e=>!e.hidden).slice(0,limit).map(el=>{
  const width=Math.min(1280,Math.max(30,number(el.w))),height=Math.min(720,Math.max(26,number(el.h)));
  const x=Math.min(1240,Math.max(0,number(el.x))),y=Math.min(690,Math.max(0,number(el.y)));
  const label=String(el.text||el.data?.alt||el.type||'').replace(/\s+/g,' ').slice(0,90);
  const title=escape(label);
  // Percent values are finite, positive and independent of imported CSS. No HTML attributes
  // or event handlers from the source document reach this visual representation.
  return `<div class="import-map-block" data-kind="${escape(el.type||'text')}" style="left:${(x/12.8).toFixed(3)}%;top:${(y/7.2).toFixed(3)}%;width:${(width/12.8).toFixed(3)}%;height:${(height/7.2).toFixed(3)}%" title="${title}"><span>${title}</span></div>`;
 }).join('');
 const overflow=page.elements.filter(e=>!e.hidden).length>limit?`<p>미리보기는 앞 ${limit}개 요소만 표시합니다. 모든 데이터는 아래 요약에서 확인하세요.</p>`:'';
 return `<div class="import-map" role="img" aria-label="변환 후 DoCut 16대9 레이아웃 개략도">${rects}</div>${overflow}`;
}
const api={counts,classifyWarning,analyze,pagePreview};
root.DocutImportReview=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
