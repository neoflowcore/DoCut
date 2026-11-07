(function(root){
'use strict';
// Evidence-first statistical charts. Geometry is shared by editable SVG and PPTX
// shape export. No inferred observations, statistical thresholds, or sample values.
const C=root.DocutCore;
const KINDS=[
 {id:'cohort',name:'코호트 잔존율',columns:['코호트','기간','잔존율(%)'],hint:'같은 코호트의 기간별 잔존율(0~100). 분모와 기간 정의를 근거란에 기록하세요.'},
 {id:'multiples',name:'스몰 멀티플',columns:['그룹','기간','값'],hint:'최대 4개 그룹을 동일한 눈금으로 비교. 기간 표기는 그룹마다 같아야 합니다.'},
 {id:'control',name:'관리도',columns:['시점','관측값'],hint:'관리중심선·상한·하한은 검증한 근거로 직접 입력하세요. 자동으로 추정하지 않습니다.'},
 {id:'forest',name:'포레스트 플롯',columns:['항목','추정치','하한','상한'],hint:'각 항목의 추정치와 신뢰구간. 기준값과 신뢰수준은 근거란에 기록하세요.'},
 {id:'fan',name:'팬 차트',columns:['기간','하한','중앙값','상한'],hint:'동일 구간 정의의 전망 하한·중앙·상한을 입력하세요.'},
 {id:'survival',name:'생존곡선 (KM)',columns:['시간','위험집단','사건 수'],hint:'시간순 at-risk와 사건 수. 검열은 다음 시점의 위험집단 변화에 반영됩니다.'},
 {id:'contribution',name:'기여도 분해',columns:['항목','기여값'],hint:'양수와 음수 기여값. 합계는 입력값의 단순 합으로만 계산합니다.'},
 {id:'lift',name:'누적 리프트',columns:['누적인구비율(%)','누적양성포착(%)'],hint:'정렬된 모집단 누적 비율과 실제 양성 누적 포착 비율. 전체 모집단 기준을 기록하세요.'},
 {id:'roc',name:'ROC 곡선',columns:['위양성률(0~1)','진양성률(0~1)'],hint:'이진분류의 각 기준점별 FPR·TPR. 레이블·분류 기준·표본을 근거란에 기록하세요.'}
];
const COLUMNS={cohort:['string','int','percent'],multiples:['string','string','number'],control:['string','number'],forest:['string','number','number','number'],fan:['string','number','number','number'],survival:['nonnegative','positiveint','count'],contribution:['string','number'],lift:['percent','percent'],roc:['fraction','fraction']};
const lookup=Object.fromEntries(KINDS.map(k=>[k.id,k]));
function fail(message){throw Error('통계 차트: '+message);}
function parseNumber(raw,type,row){if((typeof raw!=='string'&&typeof raw!=='number')||String(raw).trim()==='')fail((row+1)+'행 숫자가 비어 있습니다.');
 const n=Number(raw);if(!Number.isFinite(n)||Math.abs(n)>1e9)fail((row+1)+'행 숫자는 ±10억 이내의 유한한 값이어야 합니다.');
 if((type==='int'||type==='positiveint'||type==='count')&&!Number.isInteger(n))fail((row+1)+'행 정수 값이 필요합니다.');
 if(type==='int'&&(n<0||n>48))fail((row+1)+'행 기간은 0~48 정수입니다.');
 if(type==='positiveint'&&(n<1||n>1e7))fail((row+1)+'행 위험집단은 1~천만의 정수입니다.');
 if(type==='count'&&(n<0||n>1e7))fail((row+1)+'행 사건 수는 0~천만의 정수입니다.');
 if(type==='nonnegative'&&(n<0||n>1e9))fail((row+1)+'행 시간은 음수가 될 수 없습니다.');
 if(type==='percent'&&(n<0||n>100))fail((row+1)+'행 비율은 0~100이어야 합니다.');
 if(type==='fraction'&&(n<0||n>1))fail((row+1)+'행 비율은 0~1이어야 합니다.');
 return n;
}
function validate(kind,rows){
 const dup=new Set();let oldX=-Infinity,oldY=-Infinity,oldRisk=null,oldEvents=0;
 const groups=new Set();
 const commonPeriods=new Map();
 for(let i=0;i<rows.length;i++){
  const r=rows[i];if(kind==='cohort'){
   const key=r[0]+'\u0000'+r[1];if(dup.has(key))fail('코호트·기간이 중복됩니다.');dup.add(key);
  }
  if(kind==='multiples'){
   groups.add(r[0]);if(groups.size>4)fail('스몰 멀티플은 최대 4개 그룹을 지원합니다.');const key=r[0]+'\u0000'+r[1];if(dup.has(key))fail('그룹·기간이 중복됩니다.');dup.add(key);
   if(!commonPeriods.has(r[0]))commonPeriods.set(r[0],new Set());commonPeriods.get(r[0]).add(r[1]);
  }
  if((kind==='forest'||kind==='fan')&& (kind==='forest'?(r[2]>r[1]||r[1]>r[3]):(r[1]>r[2]||r[2]>r[3])))fail((i+1)+'행은 하한 ≤ 추정값/중앙값 ≤ 상한이어야 합니다.');
  if(kind==='survival'){
   if(r[0]<oldX)fail('생존곡선의 시간은 오름차순이어야 합니다.');
   if(r[2]>r[1])fail('사건 수가 위험집단보다 많습니다.');
   if(oldRisk!==null&&r[1]>oldRisk-oldEvents)fail('위험집단이 이전 사건 수를 반영하지 못했습니다.');
   oldX=r[0];oldRisk=r[1];oldEvents=r[2];
  }
  if(kind==='lift'||kind==='roc'){
   const x=r[0],y=r[1];
   if((kind==='lift'&&x<=oldX)||(kind==='roc'&&x<oldX))fail('가로축 비율은 오름차순이어야 합니다.');
   if(y<oldY)fail('누적 포착률·진양성률은 감소할 수 없습니다.');oldX=x;oldY=y;
  }
 }
 if(kind==='multiples'&&commonPeriods.size>1){
  const [first,...other]=[...commonPeriods.values()],times=[...first].sort();
  for(const periods of other)if(times.length!==periods.size||times.some(time=>!periods.has(time)))fail('그룹마다 동일한 기간 이름과 개수를 입력해야 합니다. 서로 다른 기간으로 비교하지 않습니다.');
 }
}
function normalize(raw){if(raw!=null&&(typeof raw!=='object'||Array.isArray(raw)))fail('차트 데이터는 객체여야 합니다.');
 const d=raw||{},kind=d.kind||'cohort',cols=Object.prototype.hasOwnProperty.call(COLUMNS,kind)?COLUMNS[kind]:null;if(!cols)fail('지원하지 않는 차트 종류: '+String(kind).slice(0,50));
 if(!Array.isArray(d.rows||[]))fail('행 데이터가 배열이 아닙니다.');
 if(d.rows.length>48)fail('최대 48행입니다. 초과한 행은 버리지 않고 가져오기를 취소합니다.');
 const rows=d.rows.map((row,i)=>{
  if(!Array.isArray(row)||row.length!==cols.length)fail((i+1)+'행의 열 수는 '+cols.length+'개여야 합니다.');
  return row.map((v,j)=>cols[j]==='string'?String(v??'').trim().slice(0,64):parseNumber(v,cols[j],i));
 });
 if(rows.some(r=>r.some((v,j)=>cols[j]==='string'&&!v)))fail('코호트·항목·기간 이름에 빈 칸이 있습니다.');
 if(rows.some((r,i)=>r.some((v,j)=>cols[j]==='string'&&String(d.rows[i][j]).trim().length>64)))fail('항목 이름은 64자 이하여야 합니다.');
 validate(kind,rows);
 const limits={},input=d.limits||{};if(typeof input!=='object'||Array.isArray(input))fail('관리도 한계값이 올바르지 않습니다.');
 for(const name of ['lower','center','upper']){
  if(input[name]==null||input[name]==='')continue;
  limits[name]=parseNumber(input[name],'number',0);
 }
 if(kind==='control'&&['lower','center','upper'].every(k=>limits[k]!=null)&&!(limits.lower<=limits.center&&limits.center<=limits.upper))fail('관리도: 하한 ≤ 중심선 ≤ 상한이어야 합니다.');
 const palette=Object.prototype.hasOwnProperty.call(C?.CHART_PALETTES||{},d.palette)?d.palette:'default';
 const referenceValue=d.referenceValue==null||d.referenceValue===''?null:parseNumber(d.referenceValue,'number',0);
 return {kind,rows,limits,palette,referenceValue:kind==='forest'?referenceValue:null};
}
function parseRows(kind,input){if(typeof input!=='string'||input.length>12000)fail('원자료 텍스트는 12,000자 이하여야 합니다.');
 const rows=input.trim()?input.trim().split(/\r?\n/).map((line,i)=>{const cells=line.split(line.includes('\t')?'\t':'|').map(s=>s.trim());if(!cells.some(Boolean))fail((i+1)+'행이 비었습니다.');return cells;}):[];
 return normalize({kind,rows}).rows;
}
function formatRows(data){return (data?.rows||[]).map(row=>row.join(' | ')).join('\n');}
function warnings(data){const d=normalize(data);let out=[];
 if(!d.rows.length)out.push('원자료 미입력 — 데모 숫자를 생성하지 않습니다.');
 if(d.kind==='control'&&!['lower','center','upper'].every(k=>d.limits[k]!=null))out.push('관리도 중심선·하한·상한을 모두 입력해야 합니다.');
 if(d.kind==='survival'&&d.rows.length)out.push('시간 0의 위험집단 및 사건/검열 정의를 확인하세요.');
 if(d.kind==='forest'&&d.rows.length&&d.referenceValue===null)out.push('포레스트 플롯 비교 기준선이 비어 있습니다. 기준이 0인지 1인지 임의로 가정하지 않습니다.');
 if(d.kind==='multiples'&&d.rows.length&&new Set(d.rows.map(r=>r[1])).size>8)out.push('기간이 8개를 넘습니다. 읽기 어려우면 보고서 페이지를 분할하세요.');
 if(d.kind==='cohort'&&d.rows.length&&new Set(d.rows.map(r=>r[1])).size>8)out.push('코호트 기간이 8개를 넘습니다. 데이터 분할 또는 범위 재선택을 권장합니다.');
 if(d.kind==='cohort'&&d.rows.length&&new Set(d.rows.map(r=>r[0])).size>6)out.push('코호트가 6개를 넘습니다. 한 장에 표시할 경우 항목 글자가 작아지므로 페이지 분할을 권장합니다.');
 if(['roc','lift'].includes(d.kind)&&d.rows.length)out.push('분모·양성 정의·기준점 및 표본의 대표성을 확인하세요.');
 if(d.kind==='roc'&&d.rows.length&&(d.rows.length<2||d.rows[0][0]!==0||d.rows[0][1]!==0||d.rows.at(-1)[0]!==1||d.rows.at(-1)[1]!==1))out.push('ROC가 (0,0)에서 시작해 (1,1)에서 끝나지 않아 AUC를 계산하지 않습니다.');
 if(d.kind==='lift'&&d.rows.length&&(d.rows.at(-1)[0]!==100||d.rows.at(-1)[1]!==100))out.push('누적 이득/리프트가 모집단 100% 종단점까지 입력되지 않았습니다.');
 if(d.kind==='cohort'){
  const cohorts=[...new Set(d.rows.map(r=>r[0]))];
  if(cohorts.some(name=>{const values=d.rows.filter(row=>row[0]===name).sort((a,b)=>a[1]-b[1]);return values.some((row,i)=>i&&row[2]>values[i-1][2]);}))out.push('일부 코호트 잔존율이 이전 기간보다 높습니다. 재활성 사용자 포함 등 잔존율 정의를 확인하세요.');
 }
 return out;
}
const esc=s=>C?.escapeHTML?C.escapeHTML(s):String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function geometry(raw,palette){const d=normalize(raw),colors=Array.isArray(palette)&&palette.length?palette:['#708DA1','#73968F','#B78E64','#A88462'];const rows=d.rows,pr=[];
 const P=(type,attrs)=>{if(pr.length<300)pr.push({type,...attrs});},R=(x,y,w,h,fill,opacity)=>P('rect',{x,y,w,h,fill,opacity}),L=(x1,y1,x2,y2,stroke=colors[0],width=2)=>P('line',{x1,y1,x2,y2,stroke,width}),T=(x,y,value,size=10,fill='#536174',anchor='start')=>P('text',{x,y,value:String(value).slice(0,30),size,fill,anchor}),O=(x,y,r=3,fill=colors[0])=>P('circle',{cx:x,cy:y,r,fill});
 const left=42,right=382,top=13,bottom=145,W=right-left,H=bottom-top;
 if(!rows.length){T(26,84,'원자료를 입력하세요',16);return pr;}
 if(d.kind==='control'&&!['lower','center','upper'].every(k=>d.limits[k]!=null)){T(26,84,'관리도 한계값 미입력',14);return pr;}
 const scale=(v,lo,hi,min,max)=>min+(v-lo)/(hi-lo||1)*(max-min);
 const bound=values=>{const min=Math.min(...values),max=Math.max(...values);return min===max?[min-1,max+1]:[min,max];};
 const drawAxis=()=>{L(left,top,left,bottom,'#8D99A6',1);L(left,bottom,right,bottom,'#8D99A6',1);};
 const number=n=>Number(n).toLocaleString('ko-KR',{maximumFractionDigits:2});
 if(d.kind==='cohort'){
  const cohorts=[...new Set(rows.map(r=>r[0]))],periods=[...new Set(rows.map(r=>r[1]))].sort((a,b)=>a-b),cw=W/Math.max(1,periods.length),ch=Math.min(75,118/Math.max(1,cohorts.length));
  cohorts.forEach((name,ci)=>{T(2,37+ci*ch,name,9);periods.forEach((p,pi)=>{const item=rows.find(r=>r[0]===name&&r[1]===p);if(!item)return;const x=left+pi*cw,y=24+ci*ch;R(x,y,cw-3,ch-3,colors[ci%colors.length],Math.max(.15,item[2]/100));T(x+3,y+ch/2+2,number(item[2])+'%',9,'#192a39');});});
  periods.forEach((p,pi)=>T(left+pi*cw+3,15,'T'+p,9));return pr;
 }
 if(d.kind==='multiples'){
  const groups=[...new Set(rows.map(r=>r[0]))],all=rows.map(r=>r[2]),[lo,hi]=bound(all);
  groups.forEach((name,k)=>{const ox=k%2?218:12,oy=k>=2?94:6,w=167,h=63,items=rows.filter(r=>r[0]===name);
   T(ox+3,oy+10,name,10,'#334155');L(ox+8,oy+h-4,ox+w,oy+h-4,'#8D99A6',1);
   const common=[...new Set(rows.map(r=>r[1]))].sort((a,b)=>a.localeCompare(b,'ko-KR',{numeric:true}));
   const ordered=[...items].sort((a,b)=>common.indexOf(a[1])-common.indexOf(b[1]));
   ordered.forEach((r,i)=>{const x=scale(common.indexOf(r[1]),0,Math.max(1,common.length-1),ox+10,ox+w-5),y=scale(r[2],lo,hi,oy+h-9,oy+17);O(x,y,2.7,colors[k%colors.length]);if(i){const prev=ordered[i-1],px=scale(common.indexOf(prev[1]),0,Math.max(1,common.length-1),ox+10,ox+w-5),py=scale(prev[2],lo,hi,oy+h-9,oy+17);L(px,py,x,y,colors[k%colors.length],2);}});
  });return pr;
 }
 if(d.kind==='control'){
  drawAxis();const nums=rows.map(r=>r[1]),[lo,hi]=bound([...nums,d.limits.lower,d.limits.center,d.limits.upper]);const y=v=>scale(v,lo,hi,bottom,top);
  [['lower','#e17e61'],['center','#708DA1'],['upper','#e17e61']].forEach(([key,c])=>{const v=d.limits[key];L(left,y(v),right,y(v),c,1.7);T(3,y(v)+3,key.slice(0,3).toUpperCase(),9,c);});
  rows.forEach((r,i)=>{const x=scale(i,0,Math.max(1,rows.length-1),left+8,right-8),yy=y(r[1]);O(x,yy,3,yy<y(d.limits.upper)&&yy>y(d.limits.lower)?colors[1]:'#cb634e');if(i){const prev=rows[i-1],px=scale(i-1,0,Math.max(1,rows.length-1),left+8,right-8);L(px,y(prev[1]),x,yy);}});
  return pr;
 }
 if(d.kind==='forest'){
  const [lo,hi]=bound([...rows.flatMap(r=>r.slice(1)),...(d.referenceValue==null?[]:[d.referenceValue])]),x=v=>scale(v,lo,hi,left,right),step=H/(rows.length+1);if(d.referenceValue!==null){L(x(d.referenceValue),top,x(d.referenceValue),bottom,'#9ea3ad',1);T(Math.max(left,x(d.referenceValue)-14),top+6,'기준 '+number(d.referenceValue),8);}rows.forEach((r,i)=>{const y=top+(i+1)*step;T(2,y+3,r[0],9);L(x(r[2]),y,x(r[3]),y,colors[1],3);L(x(r[2]),y-4,x(r[2]),y+4,colors[1],1);L(x(r[3]),y-4,x(r[3]),y+4,colors[1],1);O(x(r[1]),y,3.7,colors[0]);});return pr;
 }
 if(d.kind==='fan'){
  drawAxis();const [lo,hi]=bound(rows.flatMap(r=>r.slice(1))),y=v=>scale(v,lo,hi,bottom,top);
  rows.forEach((r,i)=>{const x=scale(i,0,Math.max(1,rows.length-1),left+10,right-10);L(x,y(r[1]),x,y(r[3]),colors[1],7);O(x,y(r[2]),3.6,colors[0]);T(x,bottom+17,r[0],9,'#536174','middle');if(i){const prev=rows[i-1],px=scale(i-1,0,Math.max(1,rows.length-1),left+10,right-10);L(px,y(prev[2]),x,y(r[2]),colors[0],2.5);}});return pr;
 }
 if(d.kind==='survival'){
  drawAxis();let survival=1,oldX=left,oldY=top,x0=rows[0][0],xmax=Math.max(1,...rows.map(r=>r[0]));T(2,top+4,'100%',8);T(8,bottom,'0%',8);
  rows.forEach(r=>{const x=scale(r[0],Math.min(0,x0),xmax,left,right);L(oldX,oldY,x,oldY,colors[0],2.3);survival*=1-r[2]/r[1];const y=scale(survival,0,1,bottom,top);L(x,oldY,x,y,colors[0],2.3);O(x,y,2.5);oldX=x;oldY=y;});L(oldX,oldY,right,oldY,colors[0],2.3);return pr;
 }
 if(d.kind==='contribution'){
  const partial=[0];rows.forEach(r=>partial.push(partial.at(-1)+r[1]));const [lo,hi]=bound(partial),y=v=>scale(v,lo,hi,bottom,top),gap=W/rows.length;drawAxis();
  rows.forEach((r,i)=>{const x=left+i*gap+gap*.17,w=gap*.62,a=partial[i],b=partial[i+1];R(x,Math.min(y(a),y(b)),w,Math.max(1,Math.abs(y(a)-y(b))),r[1]>=0?colors[1]:colors[2]);T(x,bottom+16,r[0],9,'#536174');if(i<rows.length-1)L(x+w,y(b),left+(i+1)*gap+gap*.17,y(b),'#9eacb8',1);});T(right-65,top+10,'Σ '+number(partial.at(-1)),10);return pr;
 }
 if(d.kind==='lift'||d.kind==='roc'){
  drawAxis();L(left,bottom,right,top,'#93a3b5',1.3);const fact=d.kind==='lift'?100:1;
  const points=rows.map(r=>[scale(r[0],0,fact,left,right),scale(r[1],0,fact,bottom,top)]);
  points.forEach(([x,y],i)=>{O(x,y,3);if(i)L(points[i-1][0],points[i-1][1],x,y,colors[0],2.5);});
  if(d.kind==='roc'&&rows[0]?.[0]===0&&rows[0]?.[1]===0&&rows.at(-1)?.[0]===1&&rows.at(-1)?.[1]===1){let auc=0;rows.slice(1).forEach((r,i)=>auc+=(r[0]-rows[i][0])*(r[1]+rows[i][1])/2);T(60,top+13,'AUC '+auc.toFixed(3),11);}
  return pr;
 }
 return pr;
}
function svg(data,title,palette){const g=geometry(data,palette),attributes=shape=>{
 const s=shape;switch(s.type){
 case'rect':return `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="${s.fill}"${s.opacity!=null?` opacity="${s.opacity}"`:''}/>`;
 case'line':return `<line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" stroke="${s.stroke}" stroke-width="${s.width}"/>`;
 case'circle':return `<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}" fill="${s.fill}"/>`;
 case'text':return `<text x="${s.x}" y="${s.y}" fill="${s.fill}" font-size="${s.size}" text-anchor="${s.anchor}" dominant-baseline="middle">${esc(s.value)}</text>`;
 default:return'';
 }};
 const kind=lookup[data?.kind]?.name||'통계 차트';const rows=data?.rows||[];
 const description=rows.length?rows.map(r=>r.join(', ')).join('; ').slice(0,1000):'원자료 미입력';
 return `<svg class="chart-svg stat-chart-svg" viewBox="0 0 400 176" preserveAspectRatio="none" role="img" aria-label="${esc(kind+': '+String(title||''))}"><title>${esc(kind)}</title><desc>${esc(description)}</desc>${g.map(attributes).join('')}</svg>`;
}
const api={KINDS,lookup,normalize,parseRows,formatRows,warnings,geometry,svg};
root.DocutStatCharts=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
