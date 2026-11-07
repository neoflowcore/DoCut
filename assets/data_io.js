(function(root){
'use strict';
const C=root.DocutCore;
function sniffDelimiter(input){
 const head=String(input||'').replace(/^\ufeff/,'').split(/\r?\n/,5);
 const options=['\t',',',';','|'];
 const count=(line,delimiter)=>{let quoted=false,n=0;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(quoted&&line[i+1]==='"')i++;else quoted=!quoted;}else if(c===delimiter&&!quoted)n++;}return n;};
 const scored=options.map((d,i)=>({d,score:head.reduce((v,line)=>v+count(line,d),0),priority:i})).sort((a,b)=>b.score-a.score||a.priority-b.priority);
 return scored[0].score?scored[0].d:',';
}
function parseDelimited(input,delimiter){
 const raw=String(input||'').replace(/^\ufeff/,'');
 if(raw.length>1000000)throw Error('CSV exceeds 1MB text limit; split into smaller datasets to avoid data loss');
 const delim=delimiter||sniffDelimiter(raw);
 if(!['\t',',',';','|'].includes(delim))throw Error('Unsupported delimiter');
 const rows=[];let row=[],value='',quoted=false;
 for(let i=0;i<raw.length;i++){
  const c=raw[i];
  if(c==='"'&&quoted&&raw[i+1]==='"'){value+='"';i++;continue;}
  if(c==='"'&&(!value||quoted)){quoted=!quoted;continue;}
  if(c===delim&&!quoted){row.push(value);value='';continue;}
  if((c==='\n'||c==='\r')&&!quoted){row.push(value);value='';if(row.some(x=>x.trim())){if(row.length>16)throw Error('CSV has over 16 columns; no columns were discarded');rows.push(row);}row=[];if(c==='\r'&&raw[i+1]==='\n')i++;if(rows.length>100)throw Error('CSV has over 100 rows; no rows were discarded');continue;}
  value+=c;
 }
 if(quoted)throw Error('CSV quote not closed');
 if(row.length||value){row.push(value);if(row.some(x=>x.trim())){if(row.length>16)throw Error('CSV has over 16 columns; no columns were discarded');rows.push(row);}}
 if(rows.length>100)throw Error('CSV has over 100 rows; no rows were discarded');
 if(rows.some(row=>row.some(cell=>cell.length>2000)))throw Error('CSV cell exceeds 2000 characters; no cell text was discarded');
 return rows;
}
function numeric(value){let clean=String(value??'').trim().replace(/[\s,%₩$€¥]/g,'');
 if(/^\(([-+]?\d+(?:\.\d+)?)\)$/.test(clean))clean='-'+RegExp.$1;
 if(!/^[-+]?(?:\d+\.?\d*|\.\d+)$/.test(clean))return null;
 const v=Number(clean);return Number.isFinite(v)&&Math.abs(v)<=1e9?v:null;
}
function chartFromRows(rows){
 const clean=rows.filter(row=>row.some(x=>String(x).trim()));
 if(!clean.length)throw Error('No CSV data');
 if(clean.some(row=>row.length>2))throw Error('Charts accept exactly two CSV columns: category and numeric value; no extra columns were discarded');
 let start=0;
 if(clean.length>1&&numeric(clean[0][1])===null&&numeric(clean[1][1])!==null)start=1;
 const labels=[],values=[];
 for(const row of clean.slice(start)){
  if(row.length<2)throw Error('Chart requires two columns per row');
  const v=numeric(row[1]);if(v===null)throw Error('Invalid numeric chart value at row '+(labels.length+start+1)+'; input was not silently skipped');
  if(String(row[0]).length>50)throw Error('Chart label exceeds 50 characters; shorten labels before importing');
  labels.push(String(row[0]));values.push(v);
  if(labels.length>12)throw Error('Chart exceeds 12 data points; split the series before importing');
 }
 if(!labels.length)throw Error('Use two columns: category and numeric value');
 return {labels,values};
}
function tableFromRows(rows){
 if(!rows.length)throw Error('No CSV data');
 if(rows.length>24)throw Error('Table exceeds 24 rows; split the table before importing');
 if(rows.some(row=>row.length>10))throw Error('Table exceeds 10 columns; split the table before importing');
 if(rows.some(row=>row.some(cell=>String(cell).length>400)))throw Error('Table cell exceeds 400 characters; shorten the cell before importing');
 return {rows:rows.map(row=>row.map(String))};
}
function statsFromRows(block,rows){
 const chart=root.DocutStatCharts,kind=chart.lookup[block.data?.kind];
 if(!kind)throw Error('Unknown statistical chart kind');
 let clean=rows;
 if(rows.length&&rows[0].map(v=>v.trim()).join('|')===kind.columns.join('|'))clean=rows.slice(1);
 if(!clean.length)throw Error('Statistical chart has no observations; no sample values were inserted');
 return chart.normalize({...block.data,rows:clean});
}
function applyData(block,source){if(!block||!['table','bar','line','donut','stat'].includes(block.type))throw Error('Select a chart or table first');
 const rows=parseDelimited(source);
 if(block.type==='table')return {...(block.data||{}),...tableFromRows(rows)};
 if(block.type==='stat')return statsFromRows(block,rows);
 const next=chartFromRows(rows);
 if(block.type==='donut'&&next.values.some(v=>v<0))throw Error('Donut charts cannot show negative values');
 return {...(block.data||{}),...next};
}
const api={sniffDelimiter,parseDelimited,numeric,chartFromRows,tableFromRows,statsFromRows,applyData};
root.DocutDataIO=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
