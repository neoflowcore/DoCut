(function(root){
'use strict';
const C=root.DocutCore;
const SAFE_PROPERTIES=new Set(['position','left','top','right','bottom','width','height','min-width','max-width','font-size','font-weight','font-family','font-style','text-decoration','text-align','line-height','letter-spacing','display','visibility','color','background','background-color','border-radius','border','border-color','border-width','opacity','box-shadow','background-image','background-size','background-position']);
const INHERIT=new Set(['font-size','font-weight','font-family','font-style','text-decoration','text-align','line-height','letter-spacing','color']);
const WARNINGS={external:'External CSS and linked resources are not executed',scripts:'Scripts, iframes and interactive widgets are not imported',layout:'Grid/Flex, filters and transforms are not perfectly reconstructed',media:'Remote media and SVG/Canvas cannot be embedded automatically'};
function lengthToPx(v,reference=1280,fontSize=16){
 if(typeof v!=='string'&&typeof v!=='number')return null;const match=String(v).trim().match(/^(-?\d*\.?\d+)\s*(px|pt|mm|cm|in|rem|em|%)?$/i);if(!match)return null;
 const n=Number(match[1]),unit=(match[2]||'px').toLowerCase();return n*({px:1,pt:96/72,mm:96/25.4,cm:96/2.54,in:96,rem:16,em:fontSize,'%':reference/100}[unit]);
}
function parseDeclarations(text){const result={};String(text||'').split(/;(?![^()]*\))/).forEach(rule=>{const idx=rule.indexOf(':');if(idx<1)return;const key=rule.slice(0,idx).trim().toLowerCase();const value=rule.slice(idx+1).trim().replace(/\s*!important\s*$/i,'');if((SAFE_PROPERTIES.has(key)||key.startsWith('--'))&&value.length<500&&!/[{}<>]/.test(value))result[key]=value;});return result;}
function stripCSSComments(input){return String(input||'').replace(/\/\*[\s\S]*?\*\//g,'');}
function parseStylesheets(doc){const rules=[],variables={},warnings=[];
 for(const node of [...doc.querySelectorAll('style')].slice(0,60)){
  let style=stripCSSComments(node.textContent||'');if(style.length>300000){warnings.push('Oversize style block ignored');continue;}
  style=style.replace(/@(?:media|supports|keyframes|font-face)\b[^{}]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/gi,()=>{warnings.push('At-rules ignored');return '';});
  const regex=/([^{}]+)\{([^{}]*)\}/g;let m;while((m=regex.exec(style))&&rules.length<400){
   const declarations=parseDeclarations(m[2]);for(const selector of m[1].split(',').slice(0,12).map(x=>x.trim())){
    if(selector===':root'){Object.entries(declarations).forEach(([k,v])=>{if(k.startsWith('--'))variables[k]=v});continue;}
    if(!selector||/[+~>]|::|:has\(|:not\(|:nth-|\[|\]|\*/.test(selector)){warnings.push('Unsupported selector '+selector.slice(0,60));continue;}
    if(!/^[a-z\d\s.#_:-]+$/i.test(selector))continue;
    const specificity=(selector.match(/#/g)||[]).length*100+(selector.match(/\./g)||[]).length*10+(selector.match(/(?:^|\s)[a-z][\w-]*/gi)||[]).length;
    rules.push({selector:selector.replace(/:(hover|focus|active|first-child|last-child)\b/g,''),declarations,specificity,order:rules.length});
   }
  }
 }
 return {rules,variables,warnings:[...new Set(warnings)]};
}
function resolveVars(value,vars,depth=0){if(depth>5)return '';return String(value||'').replace(/var\(\s*(--[a-z\d_-]+)\s*(?:,\s*([^()]+))?\)/gi,(_,name,fallback)=>{
  const result=Object.hasOwn(vars,name)?vars[name]:fallback||'';return resolveVars(result,vars,depth+1);
 });}
function cssFor(node,parsed,cache=new WeakMap()){
 if(cache.has(node))return cache.get(node);const parent=node.parentElement,prior=parent?cssFor(parent,parsed,cache):{};const out={};for(const key of INHERIT){if(prior[key]!=null)out[key]=prior[key];}
 const selectors=parsed.rules.filter(rule=>{try{return node.matches(rule.selector)}catch{return false}}).sort((a,b)=>a.specificity-b.specificity||a.order-b.order);
 selectors.forEach(rule=>Object.assign(out,rule.declarations));Object.assign(out,parseDeclarations(node.getAttribute('style')||''));
 for(const [key,value] of Object.entries(out))out[key]=resolveVars(value,parsed.variables);
 cache.set(node,out);return out;
}
function rgbaColor(value){if(!value||/^(none|inherit|initial|unset)$/i.test(value))return null;
 const v=String(value).trim();if(/^#[0-9a-f]{3,8}$/i.test(v)||/^rgba?\([\d.,\s%]+\)$/i.test(v))return v;
 const named={black:'#000000',white:'#ffffff',red:'#ff0000',blue:'#0000ff',green:'#008000',grey:'#808080',gray:'#808080',navy:'#000080',transparent:'transparent',orange:'#ffa500',yellow:'#ffff00'};return named[v.toLowerCase()]||null;
}
function pxOf(css,key,ref,base=16){return lengthToPx(css[key],ref,base);}
function styleFrom(css,parentFont=16){
 const size=pxOf(css,'font-size',parentFont,parentFont)||parentFont;
 const weight=Number(css['font-weight']);const result={size:Math.max(10,Math.min(100,size)),weight:Number.isFinite(weight)&&weight>=100&&weight<=900?weight:(/bold/i.test(css['font-weight']||'')?700:400),color:rgbaColor(css.color)||'#263242',align:['left','center','right'].includes(css['text-align'])?css['text-align']:'left',background:rgbaColor(css['background-color']||css.background)||'transparent',radius:Math.max(0,Math.min(80,pxOf(css,'border-radius',1280)||0)),opacity:css.opacity!=null?Math.max(.1,Math.min(1,+css.opacity||1)):1,shadow:css['box-shadow']?20:0,font:'Pretendard'};
 const fonts=['Pretendard','Noto Sans KR','Nanum Gothic','Nanum Myeongjo','Noto Serif KR','SUIT','Gmarket Sans','Arial','Georgia'];const font=fonts.find(f=>String(css['font-family']||'').toLowerCase().includes(f.toLowerCase()));if(font)result.font=font;
 const border=css.border||'',width=pxOf(css,'border-width',1280)||lengthToPx(border.match(/\d+(?:\.\d+)?(?:px|pt|mm)/)?.[0])||0;
 result.borderWidth=Math.max(0,Math.min(16,width));result.borderColor=rgbaColor(css['border-color'])||rgbaColor(border.match(/#[a-f\d]{3,8}/i)?.[0])||'#000000';return result;
}
function rectOf(node,css,canvas={width:1280,height:720}){
 const w=pxOf(css,'width',canvas.width)||null,h=pxOf(css,'height',canvas.height)||null;
 let x=pxOf(css,'left',canvas.width),y=pxOf(css,'top',canvas.height);
 if(x==null&&css.right!=null&&w!=null)x=canvas.width-(pxOf(css,'right',canvas.width)||0)-w;
 if(y==null&&css.bottom!=null&&h!=null)y=canvas.height-(pxOf(css,'bottom',canvas.height)||0)-h;
 return {x,y,w,h,positioned:(x!=null||y!=null||w!=null||h!=null)};
}
function embeddedImage(node){
 const source=String(node?.getAttribute?.('src')||'').trim();
 return /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(source)&&source.length<=8000000?source:'';
}
function embeddedBackground(css){
 const raw=String(css?.['background-image']||css?.background||'').trim();
 // Only a self-contained image data URL can be safely copied into an offline project.
 const match=raw.match(/url\(\s*['"]?(data:image\/(?:png|jpeg|webp);base64,[a-z\d+/=]+)['"]?\s*\)/i);
 return match&&match[1].length<=8000000?match[1]:'';
}
function rectInPage(node,container,parsed){
 // Approximate nested CSS-positioned blocks without executing the imported page's JS.
 const chain=[];let cursor=node;while(cursor&&cursor!==container){chain.unshift(cursor);cursor=cursor.parentElement;}
 if(cursor!==container)return rectOf(node,cssFor(node,parsed));
 let offsetX=0,offsetY=0,parentW=1280,parentH=720,result={x:null,y:null,w:null,h:null,positioned:false},positioned=false;
 for(const el of chain){const css=cssFor(el,parsed),box=rectOf(el,css,{width:parentW,height:parentH});
  const movable=css.position==='absolute'||css.position==='relative'||css.position==='fixed'||css.position==='sticky';
  if(movable||css.left!=null||css.top!=null||css.right!=null||css.bottom!=null){offsetX+=box.x||0;offsetY+=box.y||0;positioned=positioned||box.x!=null||box.y!=null;}
  parentW=box.w||parentW;parentH=box.h||parentH;result=box;
 }
 return {...result,x:positioned?offsetX:result.x,y:positioned?offsetY:result.y,positioned:positioned||result.positioned};
}
function extractRichText(node,parsed,limit=60){
 const runs=[];const white=node.ownerDocument?.createTreeWalker?.(node,4|1);
 if(!white)return [];
 function push(t,ancestor){if(!t)return;const root=node,tagged=[];let current=ancestor;
  while(current&&current!==root){tagged.push(current);current=current.parentElement;}
  const css=cssFor(ancestor?.nodeType===1?ancestor:root,parsed);
  const flags={bold:tagged.some(e=>e.matches?.('strong,b'))||Number(css['font-weight'])>=600||css['font-weight']==='bold',italic:tagged.some(e=>e.matches?.('em,i'))||css['font-style']==='italic',underline:tagged.some(e=>e.matches?.('u'))||css['text-decoration']?.includes('underline'),color:rgbaColor(css.color)||null};
  const run={text:t.slice(0,1000),...flags};const previous=runs[runs.length-1];if(previous&&previous.bold===run.bold&&previous.italic===run.italic&&previous.underline===run.underline&&previous.color===run.color&&previous.text.length+run.text.length<=1000)previous.text+=run.text;else if(runs.length<limit)runs.push(run);
 }
 let nodeWalker=white.nextNode(),total=0;while(nodeWalker&&total<12000&&runs.length<limit){
  if(nodeWalker.nodeType===3){const parent=nodeWalker.parentElement;if(parent&&!parent.closest('script,style,noscript,svg,canvas')){const t=String(nodeWalker.nodeValue||'').replace(/[\u00a0\u200b]/g,' ');push(t,parent);total+=t.length;}}
  nodeWalker=white.nextNode();
 }
 return runs;
}
function normalizeRichRuns(runs,content){
 if(!runs?.length)return [];
 // The text model and formatted text must match to avoid losing characters on HTML round-trips.
 const raw=runs.map(r=>r.text).join('').replace(/[ \t]+/g,' ').trim();
 if(raw!==content)return [];
 return runs.some(r=>r.bold||r.italic||r.underline||r.color)?runs:[];
}
function safePlainText(node,limit=12001){
 if(!node)return '';
 // Do not transfer nested script/style/template source as visible report content.
 // TreeWalker does not fetch, compile or execute these nodes.
 const doc=node.ownerDocument;
 if(!doc||typeof doc.createTreeWalker!=='function')return '';
 const forbidden='script,style,noscript,template,svg,canvas,iframe,object,embed,video,audio';
 const walker=doc.createTreeWalker(node,4),parts=[];let size=0,current=walker.nextNode();
 while(current&&size<limit){
  const parent=current.parentElement;
  if(parent&&!parent.closest(forbidden)){
   const value=String(current.nodeValue||'').slice(0,limit-size);
   parts.push(value);size+=value.length;
  }
  current=walker.nextNode();
 }
 return parts.join('').replace(/[\u00a0\u200b]/g,' ').replace(/[ \t]+/g,' ').replace(/\n\s*\n+/g,'\n').trim();
}
function stripText(node){return safePlainText(node,12001).slice(0,12000);}
function neutralizeRemoteMedia(markup){
 // Protect offline import against passive image/media requests on detached parsed documents.
 // Remote URLs remain absent from the editable project. Only explicit local raster data can pass.
 return String(markup||'').replace(/(\s(?:src|srcset|poster)\s*=\s*)("[^"]*"|'[^']*'|[^\s>]+)/gi,(full,prefix,attr)=>{
  const value=attr.replace(/^["']|["']$/g,'').trim();
  if(/^data:image\/(png|jpeg|webp);base64,[a-z\d+/=]+$/i.test(value)&&value.length<=8000000)return full;
  return prefix+'""';
 });
}
function isHiddenInTree(node,stop,parsed){
 let current=node,depth=0;
 while(current&&current.nodeType===1&&depth++<64){
  const css=cssFor(current,parsed);
  if(current.hidden||current.getAttribute('aria-hidden')==='true'||css.display==='none'||css.visibility==='hidden')return true;
  if(current===stop)break;
  current=current.parentElement;
 }
 return false;
}
function importHTML(html,options={}){
 if(typeof DOMParser==='undefined')throw Error('HTML import requires a browser DOMParser');
 const markup=String(html||''),doc=new DOMParser().parseFromString(neutralizeRemoteMedia(markup.slice(0,2500000)),'text/html');const parsed=parseStylesheets(doc);
 const external=!!doc.querySelector('link[rel="stylesheet"],link[rel="preload"]');
 const active=!!doc.querySelector('script,iframe,object,embed,form');
 const dynamic=!!doc.querySelector('svg,canvas,video,audio');
 const rootStyle=cssFor(doc.body,parsed),project=C.createProject(3);project.pages=[];project.title=(doc.title||'Imported HTML').slice(0,90);project.theme='consulting';
 const allContainers=[...doc.querySelectorAll('[data-docut-page],.slide,.page,section,article')].filter(n=>n.closest('[data-docut-page],.slide,.page,section,article')===n&&(n.textContent.trim()||n.querySelector('img')));
 const containers=allContainers.slice(0,50);
 const chunks=containers.length?containers:[doc.body];const warnings=[...parsed.warnings];if(markup.length>2500000)warnings.push('Input HTML exceeded 2.5MB parser limit: some trailing content was not imported');if(allContainers.length>50)warnings.push('Only first 50 page containers imported; '+(allContainers.length-50)+' page(s) omitted');if(external)warnings.push(WARNINGS.external);if(active)warnings.push(WARNINGS.scripts);if(dynamic)warnings.push(WARNINGS.media);
 let importedCount=0,styled=0,tables=0;
 for(const [index,container] of chunks.entries()){
  const h=container.querySelector('h1,h2,h3'),title=(container.getAttribute('data-tab')||h?.textContent?.trim()||'Imported page '+(index+1)).slice(0,100);
  const page={id:C.uid('page'),tab:title,customTab:true,headline:title,subtitle:'Imported static HTML',background:'',layout:'blank',elements:[]};const pageCss=cssFor(container,parsed);page.background=rgbaColor(pageCss['background-color']||pageCss.background)||'';
  let hiddenSkipped=0,externalBackgrounds=0;
  const elementsAll=[...container.querySelectorAll('h1,h2,h3,h4,p,blockquote,li,table,img,[style],[class],[data-source],[data-as-of-date],[data-unit],[data-evidence]')].filter(n=>{
   if(n.closest('script,style,svg,canvas,template,noscript,table')&&!n.matches('table'))return false;
   const css=cssFor(n,parsed);
   if(isHiddenInTree(n,container,parsed)){hiddenSkipped++;return false;}
   if(/url\(\s*['"]?https?:/i.test(String(css['background-image']||css.background||'')))externalBackgrounds++;
   if(n!==container&&n.closest('h1,h2,h3,h4,p,blockquote,li,table')!==n&&n.closest('h1,h2,h3,h4,p,blockquote,li,table'))return false;
   if(n.querySelector('h1,h2,h3,h4,p,li,table,blockquote'))return false;
   return (n.tagName==='IMG'||!!stripText(n)||!!embeddedBackground(cssFor(n,parsed)))&&!['SCRIPT','STYLE','TEMPLATE','NOSCRIPT','HEAD'].includes(n.tagName);
  });
  const elements=elementsAll.slice(0,100);
  if(hiddenSkipped)warnings.push('Page '+(index+1)+': '+hiddenSkipped+' hidden/aria-hidden elements excluded from import');
  if(externalBackgrounds)warnings.push('Page '+(index+1)+': '+externalBackgrounds+' remote CSS background images not embedded');
  if(elementsAll.length>100)warnings.push('Page '+(index+1)+': only first 100 content nodes imported; '+(elementsAll.length-100)+' omitted');
  let cursor=86;for(const node of elements){const css=cssFor(node,parsed),rect=rectInPage(node,container,parsed),backgroundImage=embeddedBackground(css),type=node.tagName==='TABLE'?'table':(node.tagName==='IMG'||backgroundImage)?'image':/^H[1-4]$/.test(node.tagName)?'title':node.tagName==='BLOCKQUOTE'?'quote':node.tagName==='LI'?'bullet':(css['background-color']||css.background)?'card':'text';
    const rawText=safePlainText(node,12001);
    if(type!=='image'&&rawText.length>12000)warnings.push('Page '+(index+1)+': block text exceeded 12000 characters and was shortened; split it in the original HTML');
    const content=type==='image'?(node.getAttribute('alt')||node.getAttribute('aria-label')||node.getAttribute('title')||'Imported image').slice(0,300):stripText(node);if(!content&&type!=='image')continue;const style=styleFrom(css,parseFloat(rootStyle['font-size'])||18);
    const defaultW=type==='image'?550:type==='table'?1000:type==='title'?1000:950,defaultH=type==='image'?340:type==='title'?105:type==='table'?260:Math.max(85,Math.min(285,60+content.length/12));
    const x=Math.max(0,Math.min(1180,Math.round(rect.x??72))),y=Math.max(0,Math.min(655,Math.round(rect.y??cursor)));
    const block=C.makeBlock(type,x,y,{w:Math.max(40,Math.min(1280-x,Math.round(rect.w??defaultW))),h:Math.max(30,Math.min(720-y,Math.round(rect.h??defaultH))),text:content,style:{...C.makeBlock(type,0,0).style,...style},effects:[],source:(node.getAttribute('data-source')||'').slice(0,2000),asOfDate:node.getAttribute('data-as-of-date')||'',unit:(node.getAttribute('data-unit')||'').slice(0,40),evidence:(node.getAttribute('data-evidence')||'').slice(0,1500),verified:false});
    if(type==='image'){
     const embedded=embeddedImage(node)||backgroundImage;block.data={src:embedded,alt:content};
     if(!embedded)warnings.push('Non-embedded image omitted for privacy; insert a local image in DoCut');
    }
    if(['title','text','quote','bullet','source'].includes(type)){
     const formatted=extractRichText(node,parsed),normalized=normalizeRichRuns(formatted,content);
     if(formatted.length>=50||formatted.length&&formatted.map(r=>r.text).join('').replace(/[ \t]+/g,' ').trim()!==content)warnings.push('Page '+(index+1)+': one or more inline formatting runs were simplified');
     block.richText=normalized;
    }
    if(rect.positioned)styled++;
    if(type==='table'){const trs=[...node.querySelectorAll('tr')];if(node.querySelector('td[rowspan],td[colspan],th[rowspan],th[colspan]'))warnings.push('Page '+(index+1)+': merged table rowspan/colspan semantics are flattened; inspect cell alignment manually');if(trs.length>24)warnings.push('Page '+(index+1)+': table rows after row 24 omitted');if(trs.some(tr=>tr.querySelectorAll('td,th').length>10))warnings.push('Page '+(index+1)+': table columns after column 10 omitted');if(trs.some(tr=>[...tr.querySelectorAll('td,th')].some(td=>stripText(td).length>400)))warnings.push('Page '+(index+1)+': table cell text after 400 characters was omitted');const rows=trs.slice(0,24).map(tr=>[...tr.querySelectorAll('th,td')].slice(0,10).map(td=>stripText(td).slice(0,400)));block.data={rows,cells:[...node.querySelectorAll('tr')].slice(0,24).map(tr=>[...tr.querySelectorAll('th,td')].slice(0,10).map(td=>{const s=styleFrom(cssFor(td,parsed));return {color:s.color,background:s.background,bold:s.weight>=600,align:s.align};}))};tables++;}
    page.elements.push(block);cursor=Math.min(620,y+block.h+16);importedCount++;
  }
  if(!page.elements.length){page.elements.push(C.makeBlock('text',72,180,{w:1070,h:240,text:stripText(container).slice(0,1200),effects:[]}));}
  project.pages.push(page);
 }
 if(!project.pages.length)throw Error('No importable content');
 return {mode:'css-approximation',project:C.normalizeProject(project),stats:{pages:project.pages.length,blocks:importedCount,tables,positioned:styled,cssRules:parsed.rules.length,embeddedImages:project.pages.flatMap(pg=>pg.elements).filter(el=>el.type==='image'&&el.data?.src).length},warnings:[...new Set(warnings)],losses:['External assets, dynamic layout, and browser-generated design cannot be restored 1:1']};
}
const api={lengthToPx,parseDeclarations,parseStylesheets,resolveVars,cssFor,styleFrom,rectOf,rectInPage,embeddedImage,embeddedBackground,safePlainText,isHiddenInTree,extractRichText,neutralizeRemoteMedia,importHTML};root.DocutCSSImport=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
