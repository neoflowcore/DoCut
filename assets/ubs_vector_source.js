/* UBS Global Wealth Report 2025: source-ratio, text-free SVG geometry.
 * Original PDF: https://www.ubs.com/content/dam/assets/wm/static/noindex/gwr-2025-digital.pdf
 * No text/image objects or official UBS logo vector paths are bundled.
 * 99% scores quantify the source-PDF vector extraction only, not browser/editor fidelity.
 */
(function(root){
'use strict';
const PDF_PAGES=[5,8,11,13,16,18];
const LABELS=['핵심 연구 개요','글로벌 부의 성장','지역별 비교','자산 분포 그래픽','자산 집계 분석','세부 통계 그래픽'];
const VERIFIED_GRAPHICS={5:99.7851,8:99.8434,11:99.5997,13:99.5295,16:99.3850,18:99.4055};
const PACK_B64='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';
const URL='https://www.ubs.com/content/dam/assets/wm/static/noindex/gwr-2025-digital.pdf';
const SLOT_B64='H4sIAAAAAAAC/41XSXLcMAz8i888EBuXfMXll6Ty9zSgGYmU4MRV8mFaFIBuNkD694d9/Pr81NmLcLE5itRCVLTWr/JJAz+445fir4ieuBZuXEgo1rcFl0qFBxeEQpx+4koTOBU8S3wtxljf+oZ7OY5FDrIrkL/QynjRStP9Ax3+QS3aL3xQfQXqW0GOyzAUJCDB+wcmAy/2QF5pw98kDsY18K/yMf4pn5eICmQWMtt14g49dBR8uuuHIOzBxoV7/AjUx6Z34IjB7UYj9JAGGuPF+8LNoIe1hQYSVxeVtHQQwatTjioBs0EWW3A6cGpzxydyGpXGW53DXADUiO3Z8I6aO4QR3fGJsAoPtQLGameVIqAFPvDjWF5MRr7w6R4GLlFUSli44W5HoZB0xSchBJjqXs2sEMWrR1bTK6uL2YhD/VVMI/9+hBkJ3bBtb2oiov+6yPfyvWeHh8X9Ca2J9/QEZcjNNeoT9/1JcPb9zHA9RX3DnpbhkSwtoyfTMINyfI4UF7IchzwprjldaTldGRldn1Eata741XuS9x5i3UcRi0QcQl17T/owM30EUpO8Vzs/EviIoii0vYfjMuzMK+VtmsawMzoq8inB67Crx5atmb/3qfzDp+xWr9gIPob8Y3ihcfUuYMNGN8r5dd35xdTE0FapWyNM79do892RXoh2F92fC0Y7B1ydxQn76NLe7qtH6wfM/ixdMA5Y/blg1gOuQfX0kPQ3LEtsHeOEl9VtXKvnBfeg0+51dz7qNvbnCuJj6plymmZ0ph1BWjzLsYBDOwludFQIU9kS3GY9c9reWQ1MrNGj43Kbtf+Mwzjqu9unrf3SjhdDtw8cP4502Y50x1u18Nl2Z4CHj7vEntjxiIMD694tPp/buNvSD+XElsgZ9tm3wGdhwIgii6N86r/gRVPtdsLrxnA9YD8nFxj8At7dau1IieFjy+qG0zrgm6Ogk8M3j3TuGZ0+JaMz7ILXLnvFvvXNbC+We08KfkSBu/3CGaD9c5/97PKm29gK3McWdmAdWzGdfPrCOndcRGO8P8aZ9hpGvl9+Y/5hdx6XYr8HIPr9nDgT+H12H6TtvKW/jTlwOyfsFe6Bq0xTX7DeroaaLvcrIHn5Q554tOET5zhsEtz/B8jwV9s+cLMcfx2XD3zMFJfacpwlxzXnK5bzlZ7zlZnz1ZrzVc7jqH4Tx76J03PddOa6Wc11M851M811s5brZj3TrWIsj8c97Jsu/vMX0rdK08IOAAA=';

/* Stable SVG geometry identity: metadata only on the immutable source. */
function renderVectorMarkup(svg,overrides){
 let i=0;
 let result=svg.replace(/<(path|rect|circle|ellipse|line|polyline|polygon)\b/g,(_,tag)=>'<'+tag+' data-ubs-vector-index="'+(i++)+'"');
 const styles=[];
 for(const [index,edit] of Object.entries(overrides||{})){
  if(!/^(0|[1-9]\d{0,4})$/.test(index)||!edit||typeof edit!=='object')continue;
  const rules=[];
  for(const key of ['fill','stroke'])if(/^#[0-9a-f]{6}$/i.test(edit[key]||''))rules.push(key+':'+edit[key]+' !important');
  for(const [key,css,min,max] of [['opacity','opacity',0,1],['strokeWidth','stroke-width',0,10]]){
   const v=edit[key];if(v!==undefined&&Number.isFinite(v)&&v>=min&&v<=max)rules.push(css+':'+v+' !important');
  }
  const dx=edit.dx,dy=edit.dy;
  if((Number.isFinite(dx)&&dx>=-200&&dx<=200)||(Number.isFinite(dy)&&dy>=-200&&dy<=200))
   rules.push('translate:'+(Number.isFinite(dx)?dx:0)+'px '+(Number.isFinite(dy)?dy:0)+'px !important');
  if(edit.hidden===true)rules.push('display:none !important');
  if(rules.length)styles.push('[data-ubs-vector-index="'+index+'"]{'+rules.join(';')+'}');
 }
 if(styles.length)result=result.replace(/(<svg\b[^>]*>)/,'$1<style data-ubs-overrides="true">'+styles.join('')+'</style>');
 return result;
}

const api={pages:{},regions:{},status:'loading',error:'',sourcePages:PDF_PAGES,scores:VERIFIED_GRAPHICS,sourceUrl:URL,
make(index){
 if(!Number.isInteger(index)||index<0||index>=6)throw Error('UBS 원본 비율 페이지 인덱스 범위 오류');
 const C=root.DocutCore;if(!C)throw Error('DoCut Core required');
 const no=PDF_PAGES[index];
 const ratio=Math.min(C.WIDTH/841.89,C.HEIGHT/595.276),offsetX=(C.WIDTH-841.89*ratio)/2,offsetY=(C.HEIGHT-595.276*ratio)/2;
 const slots=(this.regions[String(no)]||[]).map(([x,y,w,h,size,weight],i)=>{const el=C.makeBlock('text',offsetX+x*ratio,offsetY+y*ratio,{w:w*ratio,h:h*ratio,text:'',style:{size:size*ratio,weight,color:'#303030',background:'transparent',radius:0,opacity:1,shadow:0,font:'Arial'},effects:[],locked:false});el.id=C.uid('ubs-slot');el.effects=[];el.text='';return C.normalizeBlock(el);});
 return {id:C.uid('page'),tab:LABELS[index],customTab:true,headline:LABELS[index],
 subtitle:'UBS 2025 PDF 원본 비율 기반 벡터 뼈대 · 문자/사진/로고 제외 · 입력용 요소는 별도 추가',background:'#FFFFFF',layout:'blank',transition:'none',
 elements:slots,referenceFidelity:{sourceUrl:URL,sourceEdition:'2025',sourcePage:no,mode:'source-ratio',measuredScore:null,graphicsAuditScore:VERIFIED_GRAPHICS[no],status:'editor_browser_unverified',vectorOnly:true,designVersion:'ubs-source-svg-2025-pilot-2'}};
},
layer(page){
 const no=page?.referenceFidelity?.sourcePage;
 if(page?.referenceFidelity?.mode!=='source-ratio'||!PDF_PAGES.includes(no))return '';
 const svg=this.pages[String(no)];
 if(svg)return '<div class="ubs-source-layer" role="img" aria-label="UBS 2025 공개 PDF의 텍스트 제외 벡터 구조">'+renderVectorMarkup(svg,page?.referenceFidelity?.vectorEdits)+'</div>';
 const message=this.status==='unavailable'?'UBS 원본 SVG 로드 실패 · 템플릿 창에서 다시 불러오기':'UBS 원본 SVG 벡터 로딩 중';
 return '<div class="ubs-source-layer ubs-source-loading" role="status" aria-live="polite">'+message+'</div>';
},
preview(page){return this.layer(page);},
async load(){
 if(typeof root.DecompressionStream!=='function')throw Error('브라우저가 DecompressionStream(gzip)을 지원하지 않습니다.');
 const unpack=async b64=>{const bytes=Uint8Array.from(root.atob(b64),ch=>ch.charCodeAt(0));const ds=new Blob([bytes]).stream().pipeThrough(new root.DecompressionStream('gzip'));return JSON.parse(await new Response(ds).text());};
 const decoded=await unpack(PACK_B64);
 for(const no of PDF_PAGES){let svg=decoded[String(no)];if(typeof svg!=='string'||!/^<(?:ns0:)?svg\b/.test(svg)||/<(?:\w+:)?(?:text|image|script|foreignObject)\b/i.test(svg))throw Error('검증되지 않은 UBS SVG 자료');svg=svg.replace(/(<\/?)ns0:/g,'$1').replace('xmlns:ns0=','xmlns=');if(!/^<svg\b/.test(svg))throw Error('SVG 네임스페이스 복원 실패');decoded[String(no)]=svg;}
 const regions=await unpack(SLOT_B64);for(const no of PDF_PAGES){const rows=regions[String(no)];if(!Array.isArray(rows)||rows.length>120||rows.some(x=>!Array.isArray(x)||x.length!==6||x.some(n=>!Number.isFinite(n))))throw Error('UBS 원본 텍스트 박스 좌표 오류');}
 this.pages=decoded;this.regions=regions;this.status='ready';
 try{root.dispatchEvent?.(new root.Event('docut-ubs-vector-ready'));}catch(_){}return decoded;
}};
// A bad transient decompression state must not permanently lock the UBS gallery.
// Repeated requests share one decode; complete successful pages are not re-decoded.
const decode=api.load.bind(api);
let inflight=null;
api.load=function(){
 if(api.status==='ready')return Promise.resolve(api.pages);
 if(inflight)return inflight;
 api.status='loading';api.error='';
 inflight=decode().catch(error=>{
  api.status='unavailable';
  api.error=String(error?.message||error).slice(0,180);
  try{root.dispatchEvent?.(new root.Event('docut-ubs-vector-error'));}catch(_){}
  throw error;
 }).finally(()=>{inflight=null;});
 return inflight;
};
api.retry=function(){api.ready=api.load().catch(()=>null);return api.ready;};
root.DocutUBSVectorSource=api;
api.ready=api.load().catch(()=>null);
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
