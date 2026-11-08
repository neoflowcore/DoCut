(function(root){
'use strict';
const LIMITS={bytes:50*1024*1024,expanded:256*1024*1024,entries:4096,rows:30000,columns:256,cells:3000000,formulas:10000};
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
function range(value){const p=String(value).split(':');if(p.length>2)throw Error('범위는 A1:B12 형식이어야 합니다.');const a=address(p[0]),b=address(p[1]||p[0]);if(a.row>b.row||a.col>b.col||b.row>=LIMITS.rows||b.col>=LIMITS.columns)throw Error('셀 범위가 잘못되었거나 30000행·256열 한도를 초과합니다.');return {start:a,end:b};}
const FORMAT={0:'General',1:'0',2:'0.00',3:'#,##0',4:'#,##0.00',9:'0%',10:'0.00%',14:'mm-dd-yy',22:'m/d/yy h:mm',49:'@'};
function formatValue(value,code){if(typeof value!=='number')return String(value??'');if(/%/.test(code))return (value*100).toLocaleString('en-US',{maximumFractionDigits:6})+'%';return String(value);}

function parseEntries(entries,meta={},settings={}){
 if(entries.has('xl/vbaProject.bin'))throw Error('매크로 통합문서는 지원하지 않습니다.');
 const SAX=root.DocutXLSXSax||(typeof module!=='undefined'&&module.exports?require('./xlsx_sax.js'):null);
 if(!SAX)throw Error('대용량 Excel XML 파서가 누락되었습니다.');
 const workbook=xml(entries.get('xl/workbook.xml')),rels=xml(entries.get('xl/_rels/workbook.xml.rels')),warnings=[],relationships=new Map();
 let warningCount=0,preciseCount=0,dateCount=0,errorCount=0,formulaCount=0,totalCells=0;
 function warn(value){warningCount++;if(warnings.length<40)warnings.push(value);}
 for(const rel of nodes(rels,'Relationship')){
  if(rel.getAttribute('TargetMode')==='External'){warn('외부 연결은 실행하지 않습니다.');continue;}
  let target=rel.getAttribute('Target')||'';
  target=target.startsWith('/')?target.slice(1):'xl/'+target;
  const parts=[];
  for(const p of target.split('/')){if(p==='..'){if(!parts.length)throw Error('잘못된 시트 연결입니다.');parts.pop();}else if(p!=='.')parts.push(p);}
  relationships.set(rel.getAttribute('Id'),parts.join('/'));
 }
 let shared=[];
 if(entries.has('xl/sharedStrings.xml')){
  shared=SAX.parseSharedStrings(entries.get('xl/sharedStrings.xml'),LIMITS.cells);
  if(settings.consumeEntries)entries.delete('xl/sharedStrings.xml');
 }
 const formats={...FORMAT},styles=[];
 if(entries.has('xl/styles.xml')){
  const doc=xml(entries.get('xl/styles.xml'));
  for(const f of nodes(doc,'numFmt'))formats[f.getAttribute('numFmtId')]=f.getAttribute('formatCode');
  const xfs=nodes(doc,'cellXfs')[0];
  if(xfs)for(const xf of nodes(xfs,'xf'))styles.push(formats[xf.getAttribute('numFmtId')]||'format:'+xf.getAttribute('numFmtId'));
 }
 const date1904=nodes(workbook,'workbookPr')[0]?.getAttribute('date1904')==='1';
 const sheetNodes=nodes(workbook,'sheet');
 if(!sheetNodes.length||sheetNodes.length>30)throw Error('시트는 1–30개만 지원합니다.');
 const sheets=[];
 for(const sheet of sheetNodes){
  const name=sheet.getAttribute('name');
  const rid=sheet.getAttribute('r:id')||sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id');
  const path=relationships.get(rid);
  if(!path||!entries.has(path))throw Error('시트 데이터를 찾지 못했습니다: '+name);
  const cells=[];let maxRow=0,maxCol=0,lastRow=-1,lastCol=-1;
  SAX.parseSheet(entries.get(path),c=>{
   const ref=c.address,pos=address(ref);
   if(pos.row>=LIMITS.rows||pos.col>=LIMITS.columns||++totalCells>LIMITS.cells)
    throw Error('시트가 30000행·256열 또는 통합문서 3000000셀 한도를 초과했습니다. 잘라내지 않고 가져오기를 중단했습니다.');
   if(pos.row<lastRow||(pos.row===lastRow&&pos.col<=lastCol))throw Error('중복·비정렬 셀 주소를 발견했습니다: '+ref);
   lastRow=pos.row;lastCol=pos.col;
   const type=c.type,formula=c.formula,v=c.raw,format=styles[Number(c.style)||0]||'General';let value;
   if(formula!==null&&++formulaCount>LIMITS.formulas)throw Error('엑셀 수식은 통합문서 전체 최대 10000개까지 처리합니다.');
   if(type==='s'){
    if(!/^\d+$/.test(v)||!Object.hasOwn(shared,Number(v)))throw Error('문자열 셀 인덱스가 잘못되었습니다: '+ref);
    value=shared[Number(v)];
   }else if(type==='inlineStr')value=c.inline;
   else if(type==='b')value=v==='1';
   else if(type==='e'||type==='str'||type==='d')value=v;
   else if(v==='')value=null;
   else{value=Number(v);if(!Number.isFinite(value))throw Error('유효하지 않은 숫자 셀: '+ref);
    if(v.replace(/[-+.eE]/g,'').length>15){preciseCount++;warn(ref+': 15자리 초과 숫자는 원본 문자열도 확인하세요.');}
   }
   if(type==='e'){errorCount++;warn(ref+': Excel 오류 '+v);}
   if(format!=='General'&&/[ymdhis]/i.test(format.replace(/\[[^\]]*\]|"[^"]*"/g,''))&&typeof value==='number'){
    dateCount++;warn(ref+': 날짜·시간 일련번호와 서식은 환산하지 않았습니다.');
   }
   if(typeof value==='string'&&value.length>2000)throw Error('셀 텍스트가 2000자 한도를 초과합니다: '+ref);
   cells.push({address:ref,row:pos.row,col:pos.col,type,value,raw:v,formatted:formatValue(value,format),format,formula,cached:formula!==null&&v!==''});
   maxRow=Math.max(maxRow,pos.row+1);maxCol=Math.max(maxCol,pos.col+1);
  });
  sheets.push({id:sheet.getAttribute('sheetId')||name,name,rows:maxRow,columns:maxCol,cells});
  if(settings.consumeEntries)entries.delete(path);
 }
 const engine=root.DocutFormulaEngine||(typeof module!=='undefined'&&module.exports?require('./formula_engine.js'):null);
 if(!engine)throw Error('엑셀 수식 모듈을 로드하지 못했습니다.');
 const formulaStats=engine.evaluateFormulas(sheets,{maxFormulas:LIMITS.formulas});
 if(formulaStats.total)warnings.unshift('수식 '+formulaStats.total+'개: 저장된 캐시 '+formulaStats.cached+'개, 안전 재계산 '+formulaStats.recalculated+'개, 검토 필요 '+formulaStats.unresolved+'개.');
 if(warningCount>40)warnings.push('추가 셀 경고 '+(warningCount-40)+'건은 요약 통계로 표시합니다.');
 if(preciseCount)warnings.push('15자리 초과 숫자 '+preciseCount+'건: 표시 반올림·정밀도 확인 필요.');
 if(dateCount)warnings.push('날짜·시간 숫자 셀 '+dateCount+'건: 원본 서식 확인 필요.');
 if(errorCount)warnings.push('Excel 오류 셀 '+errorCount+'건: 결측값을 0으로 변환하지 않았습니다.');
 warnings.push(...formulaStats.warnings);
 return {id:meta.id||'data-'+Date.now().toString(36),kind:'xlsx',fileName:String(meta.fileName||'통합문서.xlsx').slice(0,200),importedAt:new Date().toISOString(),lastModified:meta.lastModified||null,date1904,sheets,warnings:[...new Set(warnings)],formulaPolicy:'cached-first-safe-recalculation',formulaStats,sourceCellCount:totalCells};
}

async function importWorkbook(bytes,meta={},options={}){return parseEntries(await unzip(bytes,options),meta,{consumeEntries:true});}
function fromRows(rows,meta={}){if(!Array.isArray(rows)||!rows.length||rows.length>LIMITS.rows||rows.some(r=>!Array.isArray(r)||r.length>LIMITS.columns))throw Error('데이터 범위 한도를 초과했습니다.');const cells=[];if(rows.reduce((n,row)=>n+row.length,0)>LIMITS.cells)throw Error('통합문서는 최대 3000000개 셀을 지원합니다.');rows.forEach((row,r)=>row.forEach((value,c)=>{const original=String(value??'');if(original.length>2000)throw Error('셀 텍스트는 2000자 이하만 지원합니다.');const v=original.trim(),numeric=(typeof value==='number'&&Number.isFinite(value))||/^[-+]?(?:(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?)$/.test(v)&&Number.isFinite(Number(v))&&v.replace(/[-+.eE]/g,'').length<=15;cells.push({address:columnName(c)+(r+1),row:r,col:c,type:numeric?'n':'str',value:numeric?Number(v):original,raw:original,formatted:original,format:'General',formula:null,cached:false});}));return {id:meta.id||'data-'+Date.now().toString(36),kind:'csv',fileName:String(meta.fileName||'데이터.csv').slice(0,200),importedAt:new Date().toISOString(),lastModified:meta.lastModified||null,date1904:false,sheets:[{id:'1',name:'데이터',rows:rows.length,columns:Math.max(...rows.map(r=>r.length)),cells}],warnings:[],formulaPolicy:'text-only'};}

const rowIndexCache=new WeakMap();
function indexRows(sheet){
 const current=rowIndexCache.get(sheet);if(current&&current.length===sheet.cells.length)return current;
 let cells=sheet.cells,ordered=true,pr=-1,pc=-1;
 for(const c of cells){if(c.row<pr||(c.row===pr&&c.col<=pc)){ordered=false;break;}pr=c.row;pc=c.col;}
 if(!ordered)cells=cells.slice().sort((a,b)=>a.row-b.row||a.col-b.col);
 const starts=new Int32Array(sheet.rows+1);let i=0;
 for(let row=0;row<sheet.rows;row++){starts[row]=i;while(i<cells.length&&cells[i].row===row)i++;}
 starts[sheet.rows]=i;
 if(i!==cells.length)throw Error('시트 셀 좌표가 실제 사용 범위와 다릅니다.');
 const index={cells,starts,length:sheet.cells.length};rowIndexCache.set(sheet,index);return index;
}
function select(dataset,sheetId,cellRange,opts={}){
 const sheet=dataset.sheets.find(s=>s.id===sheetId);if(!sheet)throw Error('시트를 찾을 수 없습니다.');
 const area=range(cellRange);
 if(area.end.row>=sheet.rows||area.end.col>=sheet.columns)throw Error('선택 범위가 시트 사용 영역을 벗어납니다.');
 const width=area.end.col-area.start.col+1,requestedRows=area.end.row-area.start.row+1;
 const maxRows=opts.maxRows==null?requestedRows:Math.max(1,Math.min(requestedRows,Math.trunc(opts.maxRows)));
 const maxColumns=opts.maxColumns==null?width:Math.max(1,Math.min(width,Math.trunc(opts.maxColumns)));
 const columns=opts.columns==null?Array.from({length:maxColumns},(_,i)=>i):[...new Set(opts.columns)].filter(n=>Number.isInteger(n)&&n>=0&&n<maxColumns).sort((a,b)=>a-b);
 const columnSet=new Set(columns),{cells,starts}=indexRows(sheet),rows=[];
 for(let r=area.start.row;r<area.start.row+maxRows;r++){
  const row=new Array(width);const rowStart=starts[r],rowEnd=starts[r+1];
  for(let i=rowStart;i<rowEnd;i++){const c=cells[i],offset=c.col-area.start.col;
   if(columnSet.has(offset))row[offset]=c;
  }
  for(const c of columns)if(!row[c]){
   const col=area.start.col+c;
   row[c]={address:columnName(col)+(r+1),row:r,col,type:'blank',value:null,raw:'',formatted:'',format:'General',formula:null,cached:false};
  }
  rows.push(row);
 }
 return {sheet,area,rows,previewRows:maxRows,requestedRows,selectedColumns:columns};
}

const api={LIMITS,crc32,unzip,parseEntries,importWorkbook,fromRows,columnName,address,range,select};root.DocutWorkbook=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
