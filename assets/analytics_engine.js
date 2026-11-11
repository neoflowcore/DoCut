(function(root){
'use strict';
/* Client-side, deterministic spreadsheet statistics. Excel caches and supported
 * safely recalculated uncached formula results are analysed; no code is executed.
 */
const MAX_POINTS=360;
const METRICS=['sum','mean','count','min','max','median','last'];
const MODES=['raw','group','histogram','cumulative'];
function finiteNumber(value, address){
 if(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>1e9)throw Error('셀 '+(address||'?')+'의 값이 유효한 숫자가 아닙니다. 결측값이나 수식 오류를 자동으로 0 처리하지 않습니다.');
 return value;
}
function quantile(sorted,q){
 if(!sorted.length)return null;
 const p=(sorted.length-1)*q,lo=Math.floor(p),hi=Math.ceil(p);
 return sorted[lo]+(sorted[hi]-sorted[lo])*(p-lo);
}
function describe(values){
 if(!Array.isArray(values))throw Error('통계 원자료 배열이 없습니다.');
 const a=values.map((v,i)=>finiteNumber(v,'#'+(i+1)));
 if(!a.length)return {count:0,sum:0,mean:null,median:null,min:null,max:null,stddev:null,variance:null,p25:null,p75:null,first:null,last:null,change:null,changePercent:null};
 const sorted=a.slice().sort((x,y)=>x-y);
 // Welford: numerically stable mean and sample variance
 let mean=0,m2=0,sum=0;
 a.forEach((v,i)=>{const d=v-mean;mean+=d/(i+1);m2+=d*(v-mean);sum+=v;});
 const variance=a.length>1?m2/(a.length-1):0;
 const first=a[0],last=a[a.length-1],change=last-first;
 return {count:a.length,sum,mean,median:quantile(sorted,.5),min:sorted[0],max:sorted.at(-1),stddev:Math.sqrt(Math.max(0,variance)),variance,p25:quantile(sorted,.25),p75:quantile(sorted,.75),first,last,change,changePercent:first===0?null:change/Math.abs(first)*100};
}
function agg(values,method){
 if(!METRICS.includes(method))throw Error('지원하지 않는 통계 집계입니다.');
 if(!values.length)throw Error('집계 대상 숫자가 없습니다.');
 switch(method){
  case 'sum':return values.reduce((a,b)=>a+b,0);
  case 'mean':return describe(values).mean;
  case 'count':return values.length;
  case 'min':return Math.min(...values);
  case 'max':return Math.max(...values);
  case 'median':return describe(values).median;
  case 'last':return values.at(-1);
 }
}
function summarizeCellRows(rows,{labelColumn=0,valueColumn=1}={}){
 if(!Array.isArray(rows)||!rows.length)throw Error('차트로 변환할 데이터 행이 없습니다.');
 const raw=rows.map((row,i)=>{
  const label=row[labelColumn],value=row[valueColumn];
  if(!label||!value)throw Error('범주·숫자 열이 데이터 범위를 벗어났습니다.');
  return {label:String(label.value??''),value:finiteNumber(value.value,value.address||'행 '+(i+1)),address:value.address||'',row:i};
 });
 return raw;
}
function transform(rows,spec={}){
 const mode=MODES.includes(spec.analysisMode)?spec.analysisMode:'raw';
 const aggregate=METRICS.includes(spec.aggregate)?spec.aggregate:'sum';
 const raw=summarizeCellRows(rows,spec),summary=describe(raw.map(p=>p.value));
 let series=[];
 if(mode==='raw')series=raw.map(({label,value,address})=>({label,value,address}));
 if(mode==='group'){
  const group=new Map();
  for(const p of raw){if(!p.label.trim())throw Error('범주가 비어 있는 행이 있습니다. 원자료를 확인하거나 선택 범위를 좁히세요.');
   if(!group.has(p.label))group.set(p.label,[]);
   group.get(p.label).push(p.value);
  }
  series=[...group].map(([label,values])=>({label,value:agg(values,aggregate),count:values.length}));
 }
 if(mode==='cumulative'){
  let running=0;series=raw.map(p=>{running+=p.value;return {label:p.label,value:running,address:p.address};});
 }
 if(mode==='histogram'){
  const bins=Number(spec.bins??10);
  if(!Number.isInteger(bins)||bins<2||bins>30)throw Error('구간 수는 2~30이어야 합니다.');
  const lo=summary.min,hi=summary.max,range=hi-lo;
  const width=range>0?range/bins:1;
  const counts=new Array(bins).fill(0);
  for(const p of raw){const index=range===0?0:Math.min(bins-1,Math.floor((p.value-lo)/width));counts[index]++;}
  const fmt=n=>Number(n.toFixed(5)).toString();
  series=counts.map((n,i)=>({label:range===0?fmt(lo):fmt(lo+i*width)+'–'+fmt(lo+(i+1)*width),value:n}));
 }
 if(!series.length)throw Error('차트 데이터가 비어 있습니다.');
 if(series.length>MAX_POINTS)throw Error('차트가 '+series.length+'개 항목입니다. 최대 '+MAX_POINTS+'개 이내로 범위를 좁히거나 범주 집계·분포를 선택하세요.');
 for(const p of series)if(!Number.isFinite(p.value)||Math.abs(p.value)>1e9||p.label.length>50)throw Error('차트 값 또는 범주가 표시 한도를 초과합니다.');
 return {series,summary,mode,aggregate,inputRows:raw.length,outputPoints:series.length};
}
function dimensionHint(name){
 const raw=String(name??'').normalize('NFKC').toLowerCase().trim();
 const key=raw.replace(/[\s_./()[\]{}\-]+/g,'');
 const known=new Set(['year','yr','fy','fiscalyear','quarter','qtr','month','date','period','time','timestamp','id','index','code','item','category','group','segment','region','country','city','product','customer','division','department','market','name','label','연도','년도','년','월','분기','시점','기간','날짜','기준일','순번','번호','코드','분류','구분','범주','항목','지역','국가','도시','사업부','부서','시장','제품','상품','고객','이름']);
 return known.has(key);
}
function suggest(source,sheetId,cellRange){
 const W=root.DocutWorkbook;if(!W)throw Error('Excel 셀 선택 모듈이 없습니다.');
 const selected=W.select(source,sheetId,cellRange,{maxRows:256}),rows=selected.rows;
 if(!rows.length||!rows[0].length)throw Error('선택된 시트 범위가 비었습니다.');
 const width=rows[0].length,hasHeader=rows.length>1&&rows[0].some(c=>typeof c.value==='string')&&rows.slice(1,Math.min(rows.length,8)).some(row=>row.some(c=>typeof c.value==='number'));
 const samples=hasHeader?rows.slice(1):rows;
 const columns=Array.from({length:width},(_,i)=>{
  const data=samples.map(row=>row[i]?.value).filter(v=>v!==null&&v!==undefined&&v!=='');
  const numbers=data.filter(v=>typeof v==='number'&&Number.isFinite(v)).length;
  const named=hasHeader?String(rows[0][i]?.value??W.columnName(i)):W.columnName(i);
  return {index:i,name:named,numbers,filled:data.length,numeric:data.length>0&&numbers/data.length>=.75,
   dimension:hasHeader&&dimensionHint(named)};
 });
 const hinted=columns.find(c=>c.dimension);
 const textDimension=columns.find(c=>!c.numeric&&c.filled>0);
 const labelColumn=hinted?.index??textDimension?.index??0;
 const labelConfidence=hinted?'header-dimension':textDimension?'text-dimension':'unconfirmed-numeric-dimension';
 const values=columns.filter(c=>c.numeric&&c.index!==labelColumn);
 const valueColumn=values[0]?.index??columns.find(c=>c.index!==labelColumn)?.index??labelColumn;
 const categories=samples.map(r=>String(r[labelColumn]?.value??''));
 const unique=new Set(categories).size,fullRows=selected.requestedRows-(hasHeader?1:0),analysisMode=fullRows>MAX_POINTS?(unique<=MAX_POINTS?'group':'histogram'):'raw';
 const warnings=[];
 if(!values.length)warnings.push('숫자형 값 열을 찾지 못했습니다. 열을 직접 지정하세요.');
 if(labelConfidence==='unconfirmed-numeric-dimension')warnings.push('모든 표본 열이 숫자입니다. 범주 열을 확인하여 직접 지정하기 전에는 회사 템플릿의 자동 연결을 보류합니다.');
 if(fullRows>samples.length)warnings.push('열·범주 추천은 최초 '+samples.length+'행 표본입니다. 전체 통계는 실제 모든 선택 행을 사용합니다.');
 return {columns,labelColumn,valueColumn,labelConfidence,header:hasHeader,analysisMode,aggregate:'sum',sampleRows:samples.length,distinctLabels:unique,
  recommendedChart:values.length?'bar':'table',warning:warnings.join(' ')};
}
function summaryText(s){
 const fmt=n=>n===null?'해당 없음':Number(n).toLocaleString('ko-KR',{maximumFractionDigits:3});
 return '유효 '+s.count+'개 · 합계 '+fmt(s.sum)+' · 평균 '+fmt(s.mean)+' · 중앙값 '+fmt(s.median)+' · 표준편차 '+fmt(s.stddev)+' · 최소 '+fmt(s.min)+' · 최대 '+fmt(s.max);
}
function ubsSlot(page,frame={width:1280,height:720}){
 const id=page?.referenceFidelity?.sourcePage;
 // Native PDF-space slots. Only genuine UBS bar pages offer automatic placement.
 const regions={13:[108,225,640,299],16:[113,231,628,300]};
 const r=regions[id];if(page?.referenceFidelity?.mode!=='source-ratio'||!r)return null;
 const scale=Math.min(frame.width/841.89,frame.height/595.276),ox=(frame.width-841.89*scale)/2,oy=(frame.height-595.276*scale)/2;
 return {x:Math.round(ox+r[0]*scale),y:Math.round(oy+r[1]*scale),w:Math.round(r[2]*scale),h:Math.round(r[3]*scale),sourcePage:id};
}
const api={MAX_POINTS,METRICS,MODES,finiteNumber,quantile,describe,agg,transform,suggest,summaryText,ubsSlot};
root.DocutAnalytics=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);

