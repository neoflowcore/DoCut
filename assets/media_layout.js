/* DoCut V0.19 media geometry. Pure, offline and safe for untrusted image metadata. */
(function(root){
'use strict';
const finite=(value,fallback,min,max)=>{const n=Number(value);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback;};
const dimensionCache=new WeakMap();
const acceptable=(w,h)=>Number.isInteger(w)&&Number.isInteger(h)&&w>0&&h>0&&w<=20000&&h<=20000&&w*h<=80000000;
function dimensions(src){
 try{
  if(typeof src!=='string'||src.length>8000000)return null;
  const match=src.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/i);
  if(!match)return null;
  const bytes=atob(match[2]);let w=0,h=0;
  const u16=(i)=>bytes.charCodeAt(i)*256+bytes.charCodeAt(i+1);
  const u32=(i)=>((bytes.charCodeAt(i)*16777216)+(bytes.charCodeAt(i+1)<<16)+(bytes.charCodeAt(i+2)<<8)+bytes.charCodeAt(i+3))>>>0;
  if(match[1].toLowerCase()==='png'){
   if(bytes.length<24||bytes.slice(0,8)!=='\x89PNG\r\n\x1a\n'||bytes.slice(12,16)!=='IHDR')return null;
   w=u32(16);h=u32(20);
  }else if(match[1].toLowerCase()==='jpeg'){
   if(bytes.length<11||bytes.charCodeAt(0)!==255||bytes.charCodeAt(1)!==216)return null;
   let i=2,orientation=1;
   // EXIF orientation affects display dimensions of common phone photographs.
   // Parse only the bounded APP1 metadata; never execute or fetch metadata content.
   const exifDirection=(start,end)=>{
    if(start+8>end||bytes.slice(start,start+6)!=='Exif\0\0')return 1;
    const t=start+6,endianness=bytes.slice(t,t+2);
    if(endianness!=='II'&&endianness!=='MM')return 1;
    const le=endianness==='II';
    const read16=(pos)=>pos+2<=end?(le?bytes.charCodeAt(pos)|(bytes.charCodeAt(pos+1)<<8):u16(pos)):0;
    const read32=(pos)=>pos+4<=end?(le?(bytes.charCodeAt(pos)+(bytes.charCodeAt(pos+1)<<8)+(bytes.charCodeAt(pos+2)<<16)+(bytes.charCodeAt(pos+3)*16777216))>>>0:u32(pos)):0;
    if(read16(t+2)!==42)return 1;
    const ifd=t+read32(t+4);if(ifd<t+8||ifd+2>end)return 1;
    const count=read16(ifd);if(count>256||ifd+2+12*count>end)return 1;
    for(let k=0;k<count;k++){
     const entry=ifd+2+k*12;
     if(read16(entry)===0x112&&read16(entry+2)===3&&read32(entry+4)===1){const v=read16(entry+8);return v>=1&&v<=8?v:1;}
    }
    return 1;
   };
   while(i+9<bytes.length){
    if(bytes.charCodeAt(i)!==255){i++;continue;}
    while(i<bytes.length&&bytes.charCodeAt(i)===255)i++;
    const marker=bytes.charCodeAt(i++);
    if(marker===217||marker===218)break;
    if(marker>=208&&marker<=215)continue;
    if(i+2>bytes.length)break;const length=u16(i);
    if(length<2||i+length>bytes.length)break;
    if(marker===225)orientation=exifDirection(i+2,i+length)||orientation;
    if((marker>=192&&marker<=207)&&![196,200,204].includes(marker)){
     if(length<7)break;h=u16(i+3);w=u16(i+5);
    }
    i+=length;
   }
   if(orientation>=5&&orientation<=8)[w,h]=[h,w];
  }else{
   if(bytes.length<30||bytes.slice(0,4)!=='RIFF'||bytes.slice(8,12)!=='WEBP')return null;
   const chunk=bytes.slice(12,16);
   if(chunk==='VP8X'){
    w=1+bytes.charCodeAt(24)+(bytes.charCodeAt(25)<<8)+(bytes.charCodeAt(26)<<16);
    h=1+bytes.charCodeAt(27)+(bytes.charCodeAt(28)<<8)+(bytes.charCodeAt(29)<<16);
   }else if(chunk==='VP8L'&&bytes.charCodeAt(20)===47){
    const a=bytes.charCodeAt(21),b=bytes.charCodeAt(22),c=bytes.charCodeAt(23),d=bytes.charCodeAt(24);
    w=1+(a|((b&63)<<8));h=1+((b>>>6)|(c<<2)|((d&15)<<10));
   }else if(chunk==='VP8 '&&bytes.charCodeAt(23)===0x9d&&bytes.charCodeAt(24)===1&&bytes.charCodeAt(25)===0x2a){
    w=(bytes.charCodeAt(26)|(bytes.charCodeAt(27)<<8))&0x3fff;
    h=(bytes.charCodeAt(28)|(bytes.charCodeAt(29)<<8))&0x3fff;
   }
  }
  return acceptable(w,h)?{width:w,height:h}:null;
 }catch(_){return null;}
}
function metadata(data){
 const w=Number(data?.width),h=Number(data?.height);
 if(acceptable(w,h))return {width:w,height:h};
 if(!data||typeof data!=='object')return null;
 if(dimensionCache.has(data))return dimensionCache.get(data);
 const size=dimensions(data.src);dimensionCache.set(data,size);return size;
}
function frame(image,box,options={}){
 const natural=Number(image?.width)>0&&Number(image?.height)>0?image:null;
 if(!natural||!acceptable(Number(natural.width),Number(natural.height)))return null;
 const iw=Number(natural.width),ih=Number(natural.height),w=finite(box?.w,1,1,50000),h=finite(box?.h,1,1,50000);
 const focusX=finite(options.focusX,50,0,100)/100,focusY=finite(options.focusY,50,0,100)/100;
 const fit=['cover','contain','fill'].includes(options.imageFit)?options.imageFit:'cover';
 if(fit==='fill')return {mode:'fill',x:0,y:0,w,h,source:{left:0,top:0,right:0,bottom:0}};
 const zoom=fit==='cover'?finite(options.cropZoom,1,1,4):1;
 const scale=(fit==='cover'?Math.max(w/iw,h/ih):Math.min(w/iw,h/ih))*zoom;
 const dw=iw*scale,dh=ih*scale;
 const x=(w-dw)*focusX,y=(h-dh)*focusY;
 const source=fit==='cover'?{
  left:Math.max(0,-x/dw),top:Math.max(0,-y/dh),
  right:Math.max(0,(x+dw-w)/dw),bottom:Math.max(0,(y+dh-h)/dh)
 }:{left:0,top:0,right:0,bottom:0};
 return {mode:fit,x,y,w:dw,h:dh,source};
}
function dragFocus(frame,box,focusX,focusY,dx,dy){
 if(!frame||frame.mode==='fill')return {focusX:finite(focusX,50,0,100),focusY:finite(focusY,50,0,100)};
 const move=(size,imageSize,current,delta)=>{
  const slack=size-imageSize;
  if(Math.abs(slack)<.0001)return finite(current,50,0,100);
  return Math.round(finite(Number(current)+100*delta/slack,50,0,100)*10)/10;
 };
 return {focusX:move(box.w,frame.w,focusX,dx),focusY:move(box.h,frame.h,focusY,dy)};
}
function resizeBox(box,desired,axis,bounds={width:1280,height:720},lock=false){
 const x=finite(box.x,0,0,bounds.width-1),y=finite(box.y,0,0,bounds.height-1);
 const maxW=Math.max(1,bounds.width-x),maxH=Math.max(1,bounds.height-y);
 const minW=Math.min(40,maxW),minH=Math.min(30,maxH);
 if(!lock)return {w:finite(desired.w,box.w,minW,maxW),h:finite(desired.h,box.h,minH,maxH)};
 const ratio=finite(box.w,1,1,50000)/finite(box.h,1,1,50000);
 const useHeight=axis==='h'||(axis==='both'&&Math.abs((Number(desired.h)||box.h)/box.h-1)>Math.abs((Number(desired.w)||box.w)/box.w-1));
 let height=useHeight?finite(desired.h,box.h,minH,maxH):finite(desired.w,box.w,minW,maxW)/ratio;
 const maxRatioH=Math.min(maxH,maxW/ratio);
 const minRatioH=Math.min(maxRatioH,Math.max(minH,minW/ratio));
 height=Math.max(minRatioH,Math.min(maxRatioH,height));
 const width=height*ratio;
 return {w:Math.round(width*100)/100,h:Math.round(height*100)/100};
}
const api={dimensions,metadata,frame,dragFocus,resizeBox};root.DocutMediaLayout=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
