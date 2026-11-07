(function(root){
'use strict';
const C=root.DocutCore;
const EMU=9525,SLIDE_W=1280*EMU,SLIDE_H=720*EMU;
const utf=s=>new TextEncoder().encode(String(s));
const SLIDE_THEMES={wood:['F6F1E8','EBDFCD',128],consulting:['F6F8FC','F6F8FC',0],quarterly:['F0F1FF','DCE0F6',135],ambient:['1E2536','141822',130],editorial:['F4F1EB','E6DDCA',135],slate:['25313B','19232D',135],mint:['EFF5ED','D9E9DF',135],bronze:['F3EEE5','DFD5CA',137],cobalt:['F4F8FE','DBE8F7',135]};
function slideBackground(page,theme){
 if(/^#[a-f\d]{6}$/i.test(page.background||''))return `<a:solidFill>${color(page.background)}</a:solidFill>`;
 const [first,last,angle]=SLIDE_THEMES[theme]||SLIDE_THEMES.wood;
 if(first===last)return `<a:solidFill><a:srgbClr val="${first}"/></a:solidFill>`;
 return `<a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:srgbClr val="${first}"/></a:gs><a:gs pos="100000"><a:srgbClr val="${last}"/></a:gs></a:gsLst><a:lin ang="${Math.round(angle*60000)}" scaled="1"/></a:gradFill>`;
}

function xml(s){return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'');}
function rgb(hex,fallback='FFFFFF'){if(typeof hex!=='string')return fallback;const m=hex.match(/^#([\da-f]{6})$/i);if(m)return m[1].toUpperCase();const s=hex.match(/^#([\da-f]{3})$/i);if(s)return s[1].split('').map(x=>x+x).join('').toUpperCase();return fallback;}
function color(hex,fallback='FFFFFF'){return `<a:srgbClr val="${rgb(hex,fallback)}"/>`;}
function uint16(n){return [n&255,(n>>>8)&255];}function uint32(n){return[n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255];}
function crc32(bytes){let crc=0xFFFFFFFF;for(const byte of bytes){crc^=byte;for(let j=0;j<8;j++)crc=crc&1?(crc>>>1)^0xEDB88320:crc>>>1;}return(crc^0xFFFFFFFF)>>>0;}
function zipStore(entries){const local=[],central=[];let offset=0;
 for(const [name,data] of entries){const nm=utf(name),body=typeof data==='string'?utf(data):data,crc=crc32(body),size=body.length;
  const lh=new Uint8Array([...uint32(0x04034b50),...uint16(20),...uint16(0x0800),...uint16(0),...uint16(0),...uint16(0),...uint32(crc),...uint32(size),...uint32(size),...uint16(nm.length),...uint16(0),...nm]);
  local.push(lh,body);
  const ch=new Uint8Array([...uint32(0x02014b50),...uint16(20),...uint16(20),...uint16(0x0800),...uint16(0),...uint16(0),...uint16(0),...uint32(crc),...uint32(size),...uint32(size),...uint16(nm.length),...uint16(0),...uint16(0),...uint16(0),...uint16(0),...uint32(0),...uint32(offset),...nm]);central.push(ch);offset+=lh.length+size;
 }
 const cdSize=central.reduce((n,x)=>n+x.length,0);const end=new Uint8Array([...uint32(0x06054b50),...uint16(0),...uint16(0),...uint16(entries.length),...uint16(entries.length),...uint32(cdSize),...uint32(offset),...uint16(0)]);
 const output=new Uint8Array(offset+cdSize+end.length);let cursor=0;for(const piece of [...local,...central,end]){output.set(piece,cursor);cursor+=piece.length;}return output;
}
const start='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
function sourceDescription(element){
 const e=element||{},fields=[
  ['출처',e.source],['기준일',e.asOfDate],['단위',e.unit||e.data?.unit],['근거·산식',e.evidence]
 ].filter(pair=>String(pair[1]||'').trim());
 if(!fields.length)return '';
 fields.push(['검증 상태',e.verified?'작성자 확인':'미확인']);
 return fields.map(pair=>pair[0]+': '+String(pair[1])).join(' | ').slice(0,1900);
}
function textRuns(t,style={},richText=[]){
 const font=Math.max(9,Math.min(100,+style.size||20)),size=Math.round(font*75);
 const align={center:'ctr',right:'r'}[style.align]||'l';
 const source=Array.isArray(richText)&&richText.length&&richText.map(r=>r.text).join('')===String(t||'')?richText:[{text:String(t||'')}];
 let paragraphs=[],parts=[];
 function push(){paragraphs.push(`<a:p><a:pPr algn="${align}"/>${parts.join('')}<a:endParaRPr lang="ko-KR"/></a:p>`);parts=[];}
 for(const run of source){const raw=String(run.text||''),bold=run.normalWeight?'':run.bold||style.weight>=600?' b="1"':'',italic=run.italic?' i="1"':'',underline=run.underline?' u="sng"':'';
  for(const [idx,line] of raw.split(/\r?\n/).entries()){
   if(idx)push();if(!line)continue;
   parts.push(`<a:r><a:rPr lang="ko-KR" sz="${size}"${bold}${italic}${underline}><a:solidFill>${color(run.color||style.color,'263747')}</a:solidFill><a:latin typeface="${xml(style.font||'Arial')}"/></a:rPr><a:t xml:space="preserve">${xml(line)}</a:t></a:r>`);
  }
 }
 push();return paragraphs.join('');
}
function shapeMarkup(id,x,y,w,h,t,style={},shape='rect',richText=[],provenance=''){
 const s=style||{},xPos=Math.round(Math.max(0,x)*EMU),yPos=Math.round(Math.max(0,y)*EMU),width=Math.round(Math.max(1,w)*EMU),height=Math.round(Math.max(1,h)*EMU),fill=rgb(s.background,null);
 const alpha=Math.max(0,Math.min(1,Number(s.backgroundOpacity??1)));const background=fill?`<a:solidFill><a:srgbClr val="${fill}">${alpha<1?`<a:alpha val="${Math.round(alpha*100000)}"/>`:""}</a:srgbClr></a:solidFill>`:'<a:noFill/>';
 const border=s.borderWidth?`<a:ln w="${Math.round(s.borderWidth*EMU)}"><a:solidFill>${color(s.borderColor,'808080')}</a:solidFill></a:ln>`:'<a:ln><a:noFill/></a:ln>';
 const geometry=shape==='ellipse'?'ellipse':shape==='roundRect'?'roundRect':'rect';
 return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="DoCut Shape ${id}"${provenance?' descr="'+xml(provenance)+'"':''}/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${xPos}" y="${yPos}"/><a:ext cx="${width}" cy="${height}"/></a:xfrm><a:prstGeom prst="${geometry}"><a:avLst/></a:prstGeom>${background}${border}</p:spPr><p:txBody><a:bodyPr wrap="square" lIns="${6*EMU}" tIns="${4*EMU}" rIns="${6*EMU}" bIns="${4*EMU}"/><a:lstStyle/>${textRuns(t,s,richText)}</p:txBody></p:sp>`;
}
function lineMarkup(id,x1,y1,x2,y2,stroke='#a0a0a0'){
 const left=Math.min(x1,x2),top=Math.min(y1,y2),w=Math.max(1,Math.abs(x2-x1)),h=Math.max(1,Math.abs(y2-y1));
 const flip=(x2-x1)*(y2-y1)<0?' flipV="1"':'';
 return `<p:cxnSp><p:nvCxnSpPr><p:cNvPr id="${id}" name="DoCut line ${id}"/><p:cNvCxnSpPr/><p:nvPr/></p:nvCxnSpPr><p:spPr><a:xfrm${flip}><a:off x="${Math.round(left*EMU)}" y="${Math.round(top*EMU)}"/><a:ext cx="${Math.round(w*EMU)}" cy="${Math.round(h*EMU)}"/></a:xfrm><a:prstGeom prst="line"><a:avLst/></a:prstGeom><a:ln w="19050"><a:solidFill>${color(stroke,'a0a0a0')}</a:solidFill></a:ln></p:spPr><p:style/></p:cxnSp>`;
}
function chartObjects(element,id){const e=element,labels=e.data?.labels||[],values=e.data?.values||[],n=Math.min(labels.length,values.length,12),out=[];
 out.push(shapeMarkup(id++,e.x,e.y,e.w,e.h,'',{...e.style,background:e.style.background||'#ffffff'},'rect',[],sourceDescription(e)));out.push(shapeMarkup(id++,e.x+12,e.y+8,e.w-24,34,e.text,{size:17,weight:700,color:e.style.color||'#243040'}));
 if(!n)return {xml:out.join(''),id};const min=Math.min(0,...values),max=Math.max(1,...values),span=Math.max(1,max-min),base=e.y+e.h-42,scale=Math.max(40,e.h-110),colors=(C.CHART_PALETTES?.[e.data?.palette]||{default:['#B78E64','#708DA1','#73968F','#B7A29A'],ocean:['#1f668b','#63a7b7','#8dc7d8','#315a79'],forest:['#31745c','#84a88a','#b0b979','#4e8e8b'],ember:['#b76a3b','#d7a477','#77586d','#e1bb93'],mono:['#374151','#6b7280','#9ca3af','#d1d5db']}[e.data?.palette]||['#B78E64','#708DA1','#73968F','#B7A29A']);
 const yOf=v=>e.y+55+(max-v)/span*scale;const zero=yOf(0);
 if(e.type==='bar'){for(let i=0;i<n;i++){const x=e.x+20+i*(e.w-40)/n,w=Math.max(4,(e.w-40)/n*.55),y=yOf(values[i]),top=Math.min(y,zero),h=Math.max(2,Math.abs(y-zero));out.push(shapeMarkup(id++,x,top,w,h,'',{background:colors[i%colors.length],radius:0}));out.push(shapeMarkup(id++,x-5,base+2,w+22,20,labels[i],{size:11,color:'#475569',align:'center'}));}}
 else if(e.type==='line'){for(let i=0;i<n;i++){const x=e.x+25+i*(e.w-50)/Math.max(1,n-1),y=yOf(values[i]);out.push(shapeMarkup(id++,x-4,y-4,8,8,'',{background:colors[0]},'ellipse'));out.push(shapeMarkup(id++,x-16,base+2,44,20,labels[i],{size:11,color:'#475569',align:'center'}));if(i){const prevX=e.x+25+(i-1)*(e.w-50)/Math.max(1,n-1),prevY=yOf(values[i-1]);out.push(lineMarkup(id++,prevX,prevY,x,y,colors[0]));}}}
 else if(e.type==='donut'){for(let i=0;i<n;i++){out.push(shapeMarkup(id++,e.x+26,e.y+54+i*25,18,18,'',{background:colors[i%colors.length]}));out.push(shapeMarkup(id++,e.x+52,e.y+52+i*25,e.w-70,25,labels[i]+'  '+values[i],{size:12,color:'#475569'}));}}
 return {xml:out.join(''),id};
}
function statisticalChartObjects(element,id){
 const e=element,out=[],S=root.DocutStatCharts;
 const dark=['#263747','#475569'];
 out.push(shapeMarkup(id++,e.x,e.y,e.w,e.h,'',{...e.style,background:e.style.background||'#ffffff'},'rect',[],sourceDescription(e)));
 out.push(shapeMarkup(id++,e.x+12,e.y+7,e.w-24,31,e.text,{size:15,weight:700,color:e.style.color||dark[0]}));
 // Render with the same chart data and bounded geometry as the offline SVG.
 const rows=S.geometry(e.data,C.CHART_PALETTES?.[e.data?.palette]||C.CHART_PALETTES?.default);
 const sx=(e.w-26)/400,sy=(e.h-55)/176,ox=e.x+13,oy=e.y+44;
 for(const g of rows){
  if(g.type==='rect')out.push(shapeMarkup(id++,ox+g.x*sx,oy+g.y*sy,Math.max(1,g.w*sx),Math.max(1,g.h*sy),'',{background:g.fill}));
  if(g.type==='line')out.push(lineMarkup(id++,ox+g.x1*sx,oy+g.y1*sy,ox+g.x2*sx,oy+g.y2*sy,g.stroke));
  if(g.type==='circle')out.push(shapeMarkup(id++,ox+(g.cx-g.r)*sx,oy+(g.cy-g.r)*sy,Math.max(2,2*g.r*sx),Math.max(2,2*g.r*sy),'',{background:g.fill},'ellipse'));
  if(g.type==='text')out.push(shapeMarkup(id++,ox+Math.max(0,g.x-7)*sx,oy+Math.max(0,g.y-6)*sy,Math.min(155,e.w/2),Math.max(10,g.size*sy*1.8),g.value,{size:Math.max(7,g.size*.75),color:g.fill,align:g.anchor==='middle'?'center':'left'}));
 }
 return {xml:out.join(''),id};
}
function tableObjects(element,id){const e=element,rows=e.data?.rows||[],cols=Math.max(1,...rows.map(row=>row.length)),h=Math.min(36,Math.max(20,(e.h-20)/Math.max(1,rows.length))),w=e.w/cols;const out=[];out.push(shapeMarkup(id++,e.x,e.y,e.w,30,e.text,{...e.style,size:17,weight:700,background:'transparent'},'rect',[],sourceDescription(e)));
 rows.forEach((row,ri)=>row.forEach((cell,ci)=>{const style=e.data?.cells?.[ri]?.[ci]||{};out.push(shapeMarkup(id++,e.x+ci*w,e.y+35+ri*h,w,h,cell,{size:Math.min(14,e.style.size||14),weight:ri===0||style.bold?700:400,color:style.color||e.style.color,background:style.background||(ri===0?'#E5E8EC':'#FFFFFF'),align:style.align||'left',borderWidth:.3,borderColor:'#D0D5DB'}));}));return {xml:out.join(''),id};
}
function imageObject(e,id,images,mediaStart=0){
 const match=String(e.data?.src||'').match(/^data:image\/(png|jpeg);base64,([A-Za-z\d+/=]+)$/);
 if(!match)return {xml:shapeMarkup(id,e.x,e.y,e.w,e.h,'Image placeholder',e.style,'rect',[],sourceDescription(e)),id:id+1};
 const ext=match[1]==='jpeg'?'jpg':'png';
 const data=Uint8Array.from(atob(match[2]),c=>c.charCodeAt(0)),name=`ppt/media/image${mediaStart+images.length+1}.${ext}`;
 images.push({name,data,id});
 const M=root.DocutMediaLayout;
 const info=M?.metadata(e.data),g=info?M.frame(info,{w:e.w,h:e.h},e.style||{}):null;
 const box=g&&g.mode==='contain'?{x:e.x+g.x,y:e.y+g.y,w:g.w,h:g.h}:{x:e.x,y:e.y,w:e.w,h:e.h};
 const crop=g&&g.mode==='cover'?g.source:null;
 const sourceRect=crop?`<a:srcRect l="${Math.round(crop.left*100000)}" t="${Math.round(crop.top*100000)}" r="${Math.round(crop.right*100000)}" b="${Math.round(crop.bottom*100000)}"/>`:'';
 const rel=`rId${id+20}`;
 const xmlMarkup=`<p:pic><p:nvPicPr><p:cNvPr id="${id}" name="DoCut Image ${id}"${sourceDescription(e)?' descr="'+xml(sourceDescription(e))+'"':''}/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="${rel}"/>${sourceRect}<a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="${Math.round(box.x*EMU)}" y="${Math.round(box.y*EMU)}"/><a:ext cx="${Math.round(box.w*EMU)}" cy="${Math.round(box.h*EMU)}"/></a:xfrm><a:prstGeom prst="${e.style?.mask==='circle'?'ellipse':'rect'}"><a:avLst/></a:prstGeom></p:spPr></p:pic>`;
 images[images.length-1].rel=rel;return {xml:xmlMarkup,id:id+1};
}
function slideXML(page,project,index,images,mediaStart=0){let id=2,shapes='';
 for(const e of page.elements){if(e.hidden)continue;
  if(e.type==='stat'){const r=statisticalChartObjects(e,id);id=r.id;shapes+=r.xml;continue;}
  if(['bar','line','donut'].includes(e.type)){const r=chartObjects(e,id);id=r.id;shapes+=r.xml;continue;}
  if(e.type==='table'){const r=tableObjects(e,id);id=r.id;shapes+=r.xml;continue;}
  if(e.type==='image'){const r=imageObject(e,id,images,mediaStart);id=r.id;shapes+=r.xml;continue;}
  const geometry=e.type==='shape'&&e.style.mask==='circle'?'ellipse':e.style.radius>16?'roundRect':'rect';
  const style={...e.style};if(['ambient','slate'].includes(project.theme)&&['title','text','bullet','quote','source'].includes(e.type)&&['#232930','#49515c','#273444'].includes(style.color))style.color='#F1EEF4';
  shapes+=shapeMarkup(id++,e.x,e.y,e.w,e.h,e.text,style,geometry,e.richText||[],sourceDescription(e));
 }
 if(project.master?.logo){const geom=root.DocutBranding?.geometry(project.master)||{x:28,y:15,w:56,h:56,shape:'circle'};const logo=imageObject({...geom,data:{src:project.master.logo},style:{mask:geom.shape==='circle'?'circle':'none'}},id,images,mediaStart);id=logo.id;shapes+=logo.xml;}
 if(project.master?.footer)shapes+=shapeMarkup(id++,40,687,980,26,project.master.footer,{size:12,color:['ambient','slate'].includes(project.theme)?'#C4CBD4':'#64748B'});
 if(project.master?.pageNumbers!==false)shapes+=shapeMarkup(id++,1110,687,120,26,`${index+1} / ${project.pages.length}`,{size:12,color:['ambient','slate'].includes(project.theme)?'#C4CBD4':'#64748B',align:'right'});
 const background=slideBackground(page,project.theme);return `${start}<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:bg><p:bgPr>${background}<a:effectLst/></p:bgPr></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>${shapes}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`;
}
function presentationXML(n){return `${start}<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>${Array.from({length:n},(_,i)=>`<p:sldId id="${256+i}" r:id="rId${i+2}"/>`).join('')}</p:sldIdLst><p:sldSz cx="${SLIDE_W}" cy="${SLIDE_H}" type="screen16x9"/><p:notesSz cx="6858000" cy="9144000"/><p:defaultTextStyle/></p:presentation>`;}
function createPPTX(project){const p=C.normalizeProject(project),entries=[];const media=[];
 entries.push(['ppt/presentation.xml',presentationXML(p.pages.length)]);
 entries.push(['ppt/_rels/presentation.xml.rels',`${start}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>${p.pages.map((_,i)=>`<Relationship Id="rId${i+2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i+1}.xml"/>`).join('')}</Relationships>`]);
 p.pages.forEach((pg,i)=>{const pictures=[],page=slideXML(pg,p,i,pictures,media.length);entries.push([`ppt/slides/slide${i+1}.xml`,page]);const rels=[`<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>`];pictures.forEach(im=>{media.push([im.name,im.data]);rels.push(`<Relationship Id="${im.rel}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${im.name.split('/').pop()}"/>`)});entries.push([`ppt/slides/_rels/slide${i+1}.xml.rels`,start+`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels.join('')}</Relationships>`]);});
 entries.push(...media);
 entries.push(['ppt/slideMasters/slideMaster1.xml',`${start}<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld name="DoCut master"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMap accent1="A68A67" accent2="698A9F" accent3="83A09A" accent4="B1A18A" accent5="7C889B" accent6="A37E6A" bg1="lt1" bg2="lt2" folHlink="hlink" hlink="hlink" tx1="dk1" tx2="dk2"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles></p:sldMaster>`]);
 entries.push(['ppt/slideMasters/_rels/slideMaster1.xml.rels',`${start}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>`]);
 entries.push(['ppt/slideLayouts/slideLayout1.xml',`${start}<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1"><p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`]);
 entries.push(['ppt/slideLayouts/_rels/slideLayout1.xml.rels',`${start}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>`]);
 entries.push(['ppt/theme/theme1.xml',`${start}<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="DoCut"><a:themeElements><a:clrScheme name="DoCut"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2>${color('#263747')}</a:dk2><a:lt2>${color('#f5f5f5')}</a:lt2>${['#a68a67','#708da1','#73968f','#b7a29a','#816f92','#d6bb9b'].map((c,i)=>`<a:accent${i+1}>${color(c)}</a:accent${i+1}>`).join('')}<a:hlink>${color('#0000ff')}</a:hlink><a:folHlink>${color('#800080')}</a:folHlink></a:clrScheme><a:fontScheme name="DoCut"><a:majorFont><a:latin typeface="Arial"/></a:majorFont><a:minorFont><a:latin typeface="Arial"/></a:minorFont></a:fontScheme><a:fmtScheme name="DoCut"><a:fillStyleLst><a:solidFill>${color('#FFFFFF')}</a:solidFill><a:solidFill>${color('#E5E8EC')}</a:solidFill><a:solidFill>${color('#a68a67')}</a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525"><a:solidFill>${color('#9ca3af')}</a:solidFill></a:ln><a:ln w="19050"><a:solidFill>${color('#9ca3af')}</a:solidFill></a:ln><a:ln w="28575"><a:solidFill>${color('#9ca3af')}</a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill>${color('#FFFFFF')}</a:solidFill><a:solidFill>${color('#F5F5F5')}</a:solidFill><a:solidFill>${color('#E5E8EC')}</a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>`]);
 entries.push(['_rels/.rels',`${start}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`]);
 entries.push(['docProps/core.xml',`${start}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>${xml(p.title)}</dc:title><dc:creator>DoCut Studio</dc:creator></cp:coreProperties>`]);
 entries.push(['docProps/app.xml',`${start}<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>DoCut Studio</Application><Slides>${p.pages.length}</Slides></Properties>`]);
 entries.push(['[Content_Types].xml',`${start}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="jpg" ContentType="image/jpeg"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>${p.pages.map((_,i)=>`<Override PartName="/ppt/slides/slide${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join('')}<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`]);
 return zipStore(entries);
}
function download(project){const bytes=createPPTX(project),blob=new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.presentationml.presentation'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=(project.title||'DoCut_Report').replace(/[\\/:*?"<>|]/g,'_').slice(0,75)+'.pptx';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);return bytes.length;}
const api={createPPTX,download,zipStore,crc32,xml,shapeMarkup};root.DocutPPTX=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
