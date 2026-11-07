(function(root){
'use strict';
const safeHex=value=>{if(!value)return null;const s=String(value).trim();if(/^#[0-9a-f]{3,8}$/i.test(s))return s;
 const m=s.match(/^rgba?\(\s*(\d{1,3})[,\s]+(\d{1,3})[,\s]+(\d{1,3})/i);
 if(!m)return null;const components=m.slice(1,4).map(Number);return components.some(x=>x>255)?null:'#'+components.map(v=>v.toString(16).padStart(2,'0')).join('');};
function collect(element){
 if(!element)return {text:'',richText:[]};
 const runs=[];
 const push=(content,style)=>{if(!content)return;const last=runs[runs.length-1],sample={...style};if(last&&['bold','normalWeight','italic','underline','color','highlight','font','size'].every(k=>last[k]===sample[k]))last.text+=content;else runs.push({text:content,...sample});};
 const read=(node,base)=>{
  if(node.nodeType===3){push(node.nodeValue,base);return;}
  if(node.nodeType!==1)return;
  const tag=node.tagName.toLowerCase();if(['script','style','noscript','svg'].includes(tag))return;
  if(tag==='br'){push('\n',base);return;}
  const next={...base};const st=node.style||{};
  if(['b','strong'].includes(tag)||(/^(bold|[6-9]00)$/.test(st.fontWeight||'')))next.bold=true;
  if(/^normal$|^400$/.test(st.fontWeight||'')){next.bold=false;next.normalWeight=true;}
  if(['em','i'].includes(tag)||st.fontStyle==='italic')next.italic=true;
  if(tag==='u'||(st.textDecoration||'').includes('underline')||(st.textDecorationLine||'').includes('underline'))next.underline=true;
  const color=safeHex(st.color)||safeHex(node.getAttribute('color'));if(color)next.color=color;
  const families=root.DocutBranding?.FONTS||['Pretendard','SUIT','Arial','Georgia','system-ui'];const font=families.find(f=>String(st.fontFamily||node.getAttribute('face')||'').split(',').map(s=>s.trim().replace(/[\"']/g,'')).includes(f));if(font)next.font=font;const size=parseFloat(st.fontSize);if(Number.isFinite(size)&&size>=10&&size<=100)next.size=size;
  const highlight=safeHex(st.backgroundColor)||safeHex(node.getAttribute('bgcolor'));if(highlight)next.highlight=highlight;
  if(['div','p'].includes(tag)&&runs.length&&!(runs[runs.length-1].text||'').endsWith('\n'))push('\n',base);
  for(const child of node.childNodes)read(child,next);
 };
 const empty={bold:false,normalWeight:false,italic:false,underline:false,color:null,highlight:null};
 for(const child of element.childNodes)read(child,empty);
 const text=runs.map(x=>x.text).join('');
 if(text.length>12000)throw Error('Text exceeds 12000 characters; split it into separate editable elements before saving');
 const styled=runs.some(x=>x.bold||x.normalWeight||x.italic||x.underline||x.color||x.highlight||x.font||x.size);
 if(!styled)return {text,richText:[]};
 const clean=[];
 for(const run of runs){
  let start=0;
  while(start<run.text.length){
   let end=Math.min(run.text.length,start+1000);
   // Do not split a supplementary Unicode character between two style runs.
   if(end<run.text.length&&end>start){const last=run.text.charCodeAt(end-1),next=run.text.charCodeAt(end);if(last>=0xd800&&last<=0xdbff&&next>=0xdc00&&next<=0xdfff)end--;}
   clean.push({...run,text:run.text.slice(start,end)});
   if(clean.length>60)throw Error('Rich text needs over 60 format runs; simplify formatting or split the element');
   start=end;
  }
 }
 return {text,richText:clean};
}
function format(command,value){const field=document.activeElement?.closest('[contenteditable="true"]');if(!field)return false;
 const allowed=['bold','italic','underline','foreColor','hiliteColor'];if(!allowed.includes(command))return false;
 if(['foreColor','hiliteColor'].includes(command)&&!safeHex(value))return false;
 return document.execCommand(command,false,value||undefined);
}
function applySelection(field,range,styles){if(!field||!range||range.collapsed||!field.contains(range.commonAncestorContainer))return false;const allowed=root.DocutBranding?.FONTS||['Pretendard','SUIT','Arial','Georgia','system-ui'];const span=document.createElement('span');
 if(styles.font!==undefined){if(!allowed.includes(styles.font))throw Error('지원하지 않는 글꼴입니다.');span.style.fontFamily=styles.font;}
 if(styles.size!==undefined){const size=Number(styles.size);if(!Number.isFinite(size)||size<10||size>100)throw Error('글자 크기는 10–100px입니다.');span.style.fontSize=size+'px';}
 const fragment=range.extractContents();span.append(fragment);range.insertNode(span);const selection=root.getSelection(),next=document.createRange();next.selectNodeContents(span);selection.removeAllRanges();selection.addRange(next);return true;}
function selectionOffsets(field,range){if(!field||!range||range.collapsed||!field.contains(range.commonAncestorContainer))return null;const prefix=range.cloneRange();prefix.selectNodeContents(field);prefix.setEnd(range.startContainer,range.startOffset);const start=prefix.toString().length;return {start,end:start+range.toString().length};}
function rangeFromOffsets(field,offsets){if(!field||!offsets||offsets.end<=offsets.start)return null;const walker=document.createTreeWalker(field,NodeFilter.SHOW_TEXT),range=document.createRange();let count=0,node,startSet=false;while((node=walker.nextNode())){const length=node.nodeValue.length;if(!startSet&&offsets.start<=count+length){range.setStart(node,Math.max(0,offsets.start-count));startSet=true;}if(startSet&&offsets.end<=count+length){range.setEnd(node,Math.max(0,offsets.end-count));return range;}count+=length;}return null;}
const api={collect,safeHex,format,applySelection,selectionOffsets,rangeFromOffsets};root.DocutRichText=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
