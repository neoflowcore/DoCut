(function(root){
'use strict';
// Bounded token parser for spreadsheet XML. It never constructs a worksheet DOM.
// The parser rejects malformed nesting, DTD/entities, and truncated cells.
const MAX_DEPTH=80,MAX_TAG=8192;
const TAG_NAME=/^[A-Za-z_][A-Za-z0-9_.:-]*$/;
function decodeEntities(s){
 if(!s.includes('&'))return s;
 const out=s.replace(/&(#x[0-9a-fA-F]+|#\d+|amp|lt|gt|quot|apos);/g,(_,code)=>{
  if(code[0]==='#'){
   const n=code[1]==='x'?parseInt(code.slice(2),16):parseInt(code.slice(1),10);
   if(!Number.isInteger(n)||n<1||n>0x10ffff||(n>=0xd800&&n<=0xdfff)||n===0xfffe||n===0xffff)throw Error('Excel XML 엔터티 코드가 잘못되었습니다.');
   return String.fromCodePoint(n);
  }
  return ({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"})[code];
 });
 if(out.includes('&')&&/&(?:#|[A-Za-z])/.test(out)&&/&(?!(?:amp|lt|gt|quot|apos|#(?:x[0-9a-fA-F]+|\d+));)/.test(s))throw Error('Excel XML에서 지원하지 않는 엔터티입니다.');
 return out;
}
function attributes(raw){
 const out=Object.create(null);let i=0;
 while(i<raw.length){
  while(/\s/.test(raw[i]||''))i++;
  if(i>=raw.length)break;
  const m=/^[A-Za-z_][A-Za-z0-9_.:-]*/.exec(raw.slice(i));if(!m)throw Error('Excel XML 속성이 잘못되었습니다.');
  const name=m[0];i+=name.length;
  while(/\s/.test(raw[i]||''))i++;
  if(raw[i++]!=='=')throw Error('Excel XML 속성 값이 없습니다.');
  while(/\s/.test(raw[i]||''))i++;
  const quote=raw[i++];if(quote!=='"'&&quote!=="'")throw Error('Excel XML 속성 따옴표가 잘못되었습니다.');
  const end=raw.indexOf(quote,i);if(end<0)throw Error('Excel XML 속성이 종료되지 않았습니다.');
  if(Object.hasOwn(out,name))throw Error('중복 Excel XML 속성입니다.');
  out[name]=decodeEntities(raw.slice(i,end));i=end+1;
 }
 return out;
}
function local(name){return name.slice(name.lastIndexOf(':')+1);}
function scan(source,callbacks={}){
 const text=String(source||'');
 if(!text||/<!DOCTYPE|<!ENTITY/i.test(text))throw Error('허용하지 않는 Excel XML입니다.');
 const stack=[];let i=0,opened=0;
 const consume=t=>{if(t&&callbacks.text)callbacks.text(t,stack.length?local(stack[stack.length-1]):'',stack.length);};
 while(i<text.length){
  const start=text.indexOf('<',i);
  if(start<0){consume(text.slice(i));break;}
  if(start>i)consume(text.slice(i,start));
  if(text.startsWith('<!--',start)){const end=text.indexOf('-->',start+4);if(end<0)throw Error('Excel XML 주석이 닫히지 않았습니다.');i=end+3;continue;}
  if(text.startsWith('<![CDATA[',start)){const end=text.indexOf(']]>',start+9);if(end<0)throw Error('Excel XML CDATA가 닫히지 않았습니다.');consume(text.slice(start+9,end));i=end+3;continue;}
  if(text.startsWith('<?',start)){const end=text.indexOf('?>',start+2);if(end<0)throw Error('Excel XML 선언이 닫히지 않았습니다.');i=end+2;continue;}
  if(text.startsWith('<!',start))throw Error('허용하지 않는 Excel XML 선언입니다.');
  let end=start+1,quote='';
  for(;end<text.length;end++){
   const ch=text[end];
   if(quote){if(ch===quote)quote='';}
   else if(ch==='"'||ch==="'")quote=ch;
   else if(ch==='>')break;
   if(end-start>MAX_TAG)throw Error('Excel XML 태그가 너무 깁니다.');
  }
  if(end>=text.length)throw Error('Excel XML 태그가 종료되지 않았습니다.');
  let body=text.slice(start+1,end).trim(),closing=false,selfClosing=false;
  if(body.startsWith('/')){closing=true;body=body.slice(1).trim();}
  else if(body.endsWith('/')){selfClosing=true;body=body.slice(0,-1).trim();}
  const m=/^([^\s/>]+)([\s\S]*)$/.exec(body);
  if(!m||!TAG_NAME.test(m[1]))throw Error('Excel XML 태그 이름이 잘못되었습니다.');
  const name=m[1],lname=local(name);
  if(closing){
   if(m[2].trim()||selfClosing||stack.pop()!==name)throw Error('Excel XML 태그 중첩이 잘못되었습니다.');
   callbacks.end?.(lname,name);
  }else{
   if(stack.length>=MAX_DEPTH)throw Error('Excel XML 중첩이 너무 깊습니다.');
   stack.push(name);opened++;
   callbacks.start?.(lname,name,m[2]);
   if(selfClosing){callbacks.end?.(lname,name);stack.pop();}
  }
  i=end+1;
 }
 if(stack.length||!opened)throw Error('Excel XML이 완결되지 않았습니다.');
}
function parseSheet(source,onCell){
 if(typeof onCell!=='function')throw Error('시트 셀 처리 함수가 없습니다.');
 let inSheetData=false,hasSheetData=false,cell=null,insideInline=0,phonetic=0,count=0;
 scan(source,{
  start(tag,name,raw){
   if(tag==='sheetData'){if(inSheetData)throw Error('중첩된 시트 데이터입니다.');hasSheetData=true;inSheetData=true;}
   if(tag==='c'&&inSheetData){
    if(cell)throw Error('중첩된 Excel 셀입니다.');
    const a=attributes(raw);if(!a.r)throw Error('셀 주소가 없는 Excel 셀입니다.');
    cell={address:a.r,type:a.t||'n',style:a.s||'0',raw:'',inline:'',formula:null};
   }else if(cell&&tag==='f')cell.formula='';
   else if(cell&&tag==='is')insideInline++;
   else if(cell&&tag==='rPh')phonetic++;
  },
  text(value,tag){
   if(!cell)return;
   if(tag==='v')cell.raw+=decodeEntities(value);
   else if(tag==='f')cell.formula+=decodeEntities(value);
   else if(tag==='t'&&insideInline&&!phonetic)cell.inline+=decodeEntities(value);
  },
  end(tag){
   if(tag==='c'&&cell){onCell(cell);cell=null;count++;}
   else if(tag==='is'&&insideInline)insideInline--;
   else if(tag==='rPh'&&phonetic)phonetic--;
   if(tag==='sheetData')inSheetData=false;
  }
 });
 if(cell||!hasSheetData)throw Error('시트 데이터가 누락되거나 잘못되었습니다.');
 return count;
}
function parseSharedStrings(source,max=3000000){
 const shared=[];let si=null,phonetic=0;
 scan(source,{
  start(tag){if(tag==='si'){if(si!==null)throw Error('중첩된 공유 문자열입니다.');si='';}if(tag==='rPh'&&si!==null)phonetic++;},
  text(value,tag){if(si!==null&&tag==='t'&&!phonetic){si+=decodeEntities(value);if(si.length>2000)throw Error('공유 문자열 2000자 제한을 초과했습니다.');}},
  end(tag){if(tag==='rPh'&&phonetic)phonetic--;if(tag==='si'){shared.push(si??'');if(shared.length>max)throw Error('공유 문자열 용량을 초과했습니다.');si=null;}}
 });
 return shared;
}
const api={scan,attributes,decodeEntities,parseSheet,parseSharedStrings};
root.DocutXLSXSax=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
