(function(root){
'use strict';
const LIMITS={bytes:50*1024*1024,expanded:256*1024*1024,entries:4096,rows:10000,columns:120,cells:600000,formulas:10000};
const decoder=new TextDecoder('utf-8',{fatal:true});
const CRC_TABLE=Uint32Array.from({length:256},(_,i)=>{let c=i;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);return c>>>0;});
function crc32(bytes){let c=0xffffffff;for(let i=0;i<bytes.length;i++)c=CRC_TABLE[(c^bytes[i])&255]^(c>>>8);return (c^0xffffffff)>>>0;}
async function inflateRaw(bytes,max){if(typeof DecompressionStream==='undefined')throw Error('이 브라우저는 XLSX 압축 해제를 지원하지 않습니다. CSV 파일로 저장해 가져오세요.');
 const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw')),reader=stream.getReader(),parts=[];let length=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>max)throw Error('XLSX 압축 해제 크기 한도를 초과했습니다.');parts.push(value);}}finally{await reader.cancel().catch(()=>{});}
 const result=new Uint8Array(length);let i=0;for(const p of parts){result.set(p,i);i+=p.length;}return result;
}
async function unzip(input,options={}){const bytes=input instanceof Uint8Array?input:new Uint8Array(input);if(bytes.length>LIMITS.bytes)throw Error('XLSX 파일은 50MB 이하만 지원합니다.');const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let end=-1;
 for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(view.getUint32(i,true)===0x06054b50&&i+22+view.getUint16(i+20,true)===bytes.length){end=i;break;}
 if(end<0)throw Error('유효한 XLSX ZIP 구조가 아닙니다.');if(view.getUint16(end+4,true)||view.getUint16(end+6,true))throw Error('분할 ZIP은 지원하지 않습니다.');
 const count=view.getUint16(end+10,true),centralSize=view.getUint32(end+12,true),offset=view.getUint32(end+16,true);if(count>LIMITS.entries||count===65535||offset+centralSize>end)throw Error('XLSX ZIP 크기·항목 한도를 초과했습니다.');
 const entries=new Map();let cursor=offset,total=0;
 for(let n=0;n<count;n++){if(cursor+46>offset+centralSize||view.getUint32(cursor,true)!==0x02014b50)throw Error('손상된 XLSX 디렉터리입니다.');const flags=view.getUint16(cursor+8,true),method=view.getUint16(cursor+10,true),crc=view.getUint32(cursor+16,true),compressed=view.getUint32(cursor+20,true),size=view.getUint32(cursor+24,true),nameLen=view.getUint16(cursor+28,true),extra=view.getUint16(cursor+30,true),comment=view.getUint16(cursor+32,true),local=view.getUint32(cursor+42,true);
  if(cursor+46+nameLen+extra+comment>offset+centralSize)throw Error('손상된 XLSX 항목입니다.');const name=decoder.decode(bytes.subarray(cursor+46,cursor+46+nameLen));cursor+=46+nameLen+extra+comment;
  if(flags&1||![0,8].includes(method))throw Error('암호화 또는 지원하지 않는 XLSX 압축 방식입니다.');if(name.startsWith('/')||name.includes('\\')||name.split('/').includes('..')||entries.has(name))throw Error('중복되거나 잘못된 XLSX 파일 경로입니다.');total+=size;if(total>LIMITS.expanded||size>LIMITS.expanded)throw Error('XLSX 압축 해제 한도 256MB를 초과했습니다.');
  if(local+30>offset||view.getUint32(local,true)!==0x04034b50)throw Error('손상된 XLSX 로컬 항목입니다.');const dataStart=local+30+view.getUint16(local+26,true)+view.getUint16(local+28,true);if(dataStart+compressed>offset)throw Error('XLSX 압축 데이터 범위가 잘못되었습니다.');
  if(/vbaProject\.bin$/i.test(name))throw Error('매크로 통합문서는 지원하지 않습니다.');
  const localName=decoder.decode(bytes.subarray(local+30,local+30+view.getUint16(local+26,true)));if(localName!==name||view.getUint16(local+8,true)!==method)throw Error('XLSX 디렉터리와 데이터가 일치하지 않습니다.');entries.set(name,{data:bytes.subarray(dataStart,dataStart+compressed),size,method,crc});
 }
 const out=new Map();for(const [name,e] of entries){if(!/\.xml$|\.rels$|\[Content_Types\]\.xml$/i.test(name))continue;const data=e.method===0?e.data:await (options.inflate||inflateRaw)(e.data,e.size);if(data.length!==e.size||crc32(data)!==e.crc)throw Error('XLSX 항목 무결성 검증 실패: '+name);out.set(name,decoder.decode(data));}return out;
}
function xml(text){if(!text||/<!DOCTYPE|<!ENTITY/i.test(text))throw Error('허용하지 않는 Excel XML입니다.');const doc=new DOMParser().parseFromString(text,'application/xml');if(doc.getElementsByTagName('parsererror').length)throw Error('Excel XML을 읽을 수 없습니다.');return doc;}
function nodes(parent,name){return [...parent.getElementsByTagNameNS('*',name)];}
function columnName(n){let s='';for(n++;n>0;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;}
function address(value){const m=String(value).match(/^\$?([A-Z]{1,3})\$?([1-9]\d{0,6})$/i);if(!m)throw Error('셀 주소 형식이 잘못되었습니다: '+value);const col=[...m[1].toUpperCase()].reduce((n,c)=>n*26+c.charCodeAt(0)-64,0)-1,row=Number(m[2])-1;return {row,col};}
function range(value){const p=String(value).split(':');if(p.length>2)throw Error('범위는 A1:B12 형식이어야 합니다.');const a=address(p[0]),b=address(p[1]||p[0]);if(a.row>b.row||a.col>b.col||b.row>=LIMITS.rows||b.col>=LIMITS.columns)throw Error('셀 범위가 잘못되었거나 10000행·120열 한도를 초과합니다.');return {start:a,end:b};}
const FORMAT={0:'General',1:'0',2:'0.00',3:'#,##0',4:'#,##0.00',9:'0%',10:'0.00%',14:'mm-dd-yy',22:'m/d/yy h:mm',49:'@'};
function formatValue(value,code){if(typeof value!=='number')return String(value??'');if(/%/.test(code))return (value*100).toLocaleString('en-US',{maximumFractionDigits:6})+'%';return String(value);}
function parseEntries(entries,meta={}){if(entries.has('xl/vbaProject.bin'))throw Error('매크로 통합문서는 지원하지 않습니다.');
 const workbook=xml(entries.get('xl/workbook.xml')),rels=xml(entries.get('xl/_rels/workbook.xml.rels')),warnings=[],relationships=new Map();
 for(const rel of nodes(rels,'Relationship')){if(rel.getAttribute('TargetMode')==='External'){warnings.push('외부 연결을 실행하지 않았습니다.');continue;}let target=rel.getAttribute('Target')||'';target=target.startsWith('/')?target.slice(1):'xl/'+target;const parts=[];for(const p of target.split('/')){if(p==='..'){if(!parts.length)throw Error('잘못된 시트 연결입니다.');parts.pop();}else if(p!=='.')parts.push(p);}relationships.set(rel.getAttribute('Id'),parts.join('/'));}
 let shared=[];if(entries.has('xl/sharedStrings.xml'))shared=nodes(xml(entries.get('xl/sharedStrings.xml')),'si').map(si=>nodes(si,'t').map(t=>t.textContent).join(''));
 const formats={...FORMAT},styles=[];if(entries.has('xl/styles.xml')){const doc=xml(entries.get('xl/styles.xml'));for(const f of nodes(doc,'numFmt'))formats[f.getAttribute('numFmtId')]=f.getAttribute('formatCode');const xfs=nodes(doc,'cellXfs')[0];if(xfs)for(const xf of nodes(xfs,'xf'))styles.push(formats[xf.getAttribute('numFmtId')]||'format:'+xf.getAttribute('numFmtId'));}
 const date1904=nodes(workbook,'workbookPr')[0]?.getAttribute('date1904')==='1';
 let totalCells=0;
 const sheets=nodes(workbook,'sheet').map(sheet=>{const name=sheet.getAttribute('name'),rid=sheet.getAttribute('r:id')||sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id'),path=relationships.get(rid);if(!path||!entries.has(path))throw Error('시트 데이터를 찾지 못했습니다: '+name);const doc=xml(entries.get(path)),cells=[];let maxRow=0,maxCol=0;
  for(const c of nodes(doc,'c')){const ref=c.getAttribute('r'),pos=address(ref);if(pos.row>=LIMITS.rows||pos.col>=LIMITS.columns||++totalCells>LIMITS.cells)throw Error('10000행·120열·통합문서 600000셀 한도를 초과했습니다. 내용을 잘라내지 않고 취소했습니다.');const type=c.getAttribute('t')||'n',formula=nodes(c,'f')[0]?.textContent??null,v=nodes(c,'v')[0]?.textContent??'',format=styles[Number(c.getAttribute('s')||0)]||'General';let value;
   if(type==='s'){if(!/^\d+$/.test(v)||!Object.hasOwn(shared,Number(v)))throw Error('문자열 셀 인덱스가 잘못되었습니다.');value=shared[Number(v)];}
   else if(type==='inlineStr')value=nodes(c,'t').map(t=>t.textContent).join('');else if(type==='b')value=v==='1';else if(type==='e'||type==='str'||type==='d')value=v;else if(v==='')value=null;else{value=Number(v);if(!Number.isFinite(value))throw Error('유효하지 않은 숫자 셀: '+ref);if(v.replace(/[-+.eE]/g,'').length>15)warnings.push(ref+': 원본 숫자 문자열을 보존했습니다. Excel/JS 정밀도를 확인하세요.');}
   // Cached Excel results remain authoritative; uncached supported formulas are safely calculated below.if(type==='e')warnings.push(ref+': Excel 오류 '+v);if(format!=='General'&&/[ymdhis]/i.test(format.replace(/\[[^\]]*\]|"[^"]*"/g,''))&&typeof value==='number')warnings.push(ref+': 날짜/시간 일련번호·서식을 원본대로 보존했습니다.');
   if(typeof value==='string'&&value.length>2000)throw Error('셀 텍스트가 2000자 한도를 초과합니다: '+ref);
   cells.push({address:ref,row:pos.row,col:pos.col,type,value,raw:v,formatted:formatValue(value,format),format,formula,cached:formula!==null&&v!==''});maxRow=Math.max(maxRow,pos.row+1);maxCol=Math.max(maxCol,pos.col+1);
  }
  return {id:sheet.getAttribute('sheetId')||name,name,rows:maxRow,columns:maxCol,cells};
 });if(!sheets.length||sheets.length>30)throw Error('시트는 1–30개만 지원합니다.');
 const engine=root.DocutFormulaEngine||(typeof module!=='undefined'&&module.exports?require('./formula_engine.js'):null);
 if(!engine)throw Error('엑셀 수식 모듈을 로드하지 못했습니다.');
 const formulaStats=engine.evaluateFormulas(sheets,{maxFormulas:LIMITS.formulas});
 if(formulaStats.total)warnings.unshift('수식 '+formulaStats.total+'개 중 Excel 캐시 '+formulaStats.cached+'개 유지, 캐시 없는 수식 안전 재계산 '+formulaStats.recalculated+'개, 미지원·오류 '+formulaStats.unresolved+'개.');
 warnings.push(...formulaStats.warnings);
 return {id:meta.id||'data-'+Date.now().toString(36),kind:'xlsx',fileName:String(meta.fileName||'통합문서.xlsx').slice(0,200),importedAt:new Date().toISOString(),lastModified:meta.lastModified||null,date1904,sheets,warnings:[...new Set(warnings)],formulaPolicy:'cached-first-safe-recalculation',formulaStats};
}
async function importWorkbook(bytes,meta={},options={}){return parseEntries(await unzip(bytes,options),meta);}
function fromRows(rows,meta={}){if(!Array.isArray(rows)||!rows.length||rows.length>LIMITS.rows||rows.some(r=>!Array.isArray(r)||r.length>LIMITS.columns))throw Error('데이터 범위 한도를 초과했습니다.');const cells=[];if(rows.reduce((n,row)=>n+row.length,0)>LIMITS.cells)throw Error('통합문서는 최대 600000개 셀을 지원합니다.');rows.forEach((row,r)=>row.forEach((value,c)=>{const original=String(value??'');if(original.length>2000)throw Error('셀 텍스트는 2000자 이하만 지원합니다.');const v=original.trim(),numeric=/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(v)&&Number.isFinite(Number(v))&&v.replace(/[-+.]/g,'').length<=15;cells.push({address:columnName(c)+(r+1),row:r,col:c,type:numeric?'n':'str',value:numeric?Number(v):original,raw:original,formatted:original,format:'General',formula:null,cached:false});}));return {id:meta.id||'data-'+Date.now().toString(36),kind:'csv',fileName:String(meta.fileName||'데이터.csv').slice(0,200),importedAt:new Date().toISOString(),lastModified:meta.lastModified||null,date1904:false,sheets:[{id:'1',name:'데이터',rows:rows.length,columns:Math.max(...rows.map(r=>r.length)),cells}],warnings:[],formulaPolicy:'text-only'};}
function select(dataset,sheetId,cellRange){const sheet=dataset.sheets.find(s=>s.id===sheetId);if(!sheet)throw Error('시트를 찾을 수 없습니다.');const area=range(cellRange),map=new Map(sheet.cells.map(c=>[c.row+':'+c.col,c])),rows=[];if(area.end.row>=sheet.rows||area.end.col>=sheet.columns)throw Error('선택 범위가 시트 사용 영역을 벗어납니다.');for(let r=area.start.row;r<=area.end.row;r++){const row=[];for(let c=area.start.col;c<=area.end.col;c++)row.push(map.get(r+':'+c)||{address:columnName(c)+(r+1),row:r,col:c,type:'blank',value:null,raw:'',formatted:'',format:'General',formula:null,cached:false});rows.push(row);}return {sheet,area,rows};}
const api={LIMITS,crc32,unzip,parseEntries,importWorkbook,fromRows,columnName,address,range,select};root.DocutWorkbook=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
