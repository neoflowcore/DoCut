(function(root){
'use strict';
/* V0.27: one safe, normalized brand master for the editor, HTML and PPTX. */
const C=root.DocutCore;
if(!C)throw Error('DoCut core is required before branding');
const POSITIONS={
 'top-left':'좌측 상단','top-center':'상단 중앙','top-right':'우측 상단',
 'bottom-left':'좌측 하단','bottom-center':'하단 중앙','bottom-right':'우측 하단',
 'center-left':'좌측 중앙','center-right':'우측 중앙'
};
const SHAPES={circle:'원형 (기본)',rounded:'둥근 사각형',square:'사각형'};
const FONTS=['Pretendard','SUIT','Noto Sans KR','Nanum Gothic','Nanum Myeongjo','Noto Serif KR','Gmarket Sans','Arial','Georgia','system-ui'];
const FONT_STACKS={Pretendard:'Pretendard,Arial,sans-serif',SUIT:'SUIT,Arial,sans-serif','Noto Sans KR':'"Noto Sans KR",Arial,sans-serif','Nanum Gothic':'"Nanum Gothic",Arial,sans-serif','Nanum Myeongjo':'"Nanum Myeongjo",Georgia,serif','Noto Serif KR':'"Noto Serif KR",Georgia,serif','Gmarket Sans':'"Gmarket Sans",Arial,sans-serif',Arial:'Arial,sans-serif',Georgia:'Georgia,serif','system-ui':'system-ui,sans-serif'};
const validNumber=(value,min,max,defaultValue)=>Number.isFinite(Number(value))?Math.min(max,Math.max(min,Number(value))):defaultValue;
function normalize(master){const m=master&&typeof master==='object'?master:{};
 return {...m,logoPosition:POSITIONS[m.logoPosition]?m.logoPosition:'top-left',logoShape:SHAPES[m.logoShape]?m.logoShape:'circle',logoSize:validNumber(m.logoSize,28,180,76),logoInset:validNumber(m.logoInset,4,112,24),fontFamily:FONTS.includes(m.fontFamily)?m.fontFamily:'Pretendard'};
}
function geometry(master,frame){const width=frame?.width||C.WIDTH,height=frame?.height||C.HEIGHT;const m=normalize(master),pos=m.logoPosition,s=m.logoSize,i=m.logoInset;
 const x=pos.endsWith('left')?i:pos.endsWith('right')?width-s-i:(width-s)/2;
 const y=pos.startsWith('top')?i:pos.startsWith('bottom')?height-s-i:(height-s)/2;
 return {x,y,w:s,h:s,shape:m.logoShape};
}
function logoCSS(master,frame){const m=normalize(master),b=geometry(m,frame),radius=m.logoShape==='circle'?'50%':m.logoShape==='rounded'?'24%':'0';
 return `left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px;max-width:none;max-height:none;border-radius:${radius};object-fit:cover;object-position:center;`;
}
function markup(master,index,total,frame){const m=normalize(master),safe=C.escapeHTML;
 const logo=m.logo&&/^data:image\/(?:png|jpeg|webp);base64,[\w+/=]+$/i.test(m.logo)?`<img class="master-logo master-logo-${m.logoShape}" src="${m.logo}" alt="보고서 로고" style="${logoCSS(m,frame)}">`:'';
 const footer=m.footer?`<div class="master-footer" style="${m.logo&&m.logoPosition==='bottom-left'?'left:'+Math.min(240,m.logoSize+m.logoInset+18)+'px;':''}">${safe(m.footer)}</div>`:'';
 const pagination=m.pageNumbers!==false?`<div class="master-page-number" style="${m.logo&&m.logoPosition==='bottom-right'?'right:'+Math.min(260,m.logoSize+m.logoInset+18)+'px;':''}">${index+1} / ${total}</div>`:'';
 return logo+footer+pagination;
}
// Element background opacity is NOT element opacity: the text, image contents,
// strokes and chart labels remain legible even when the fill is invisible.
// Accept only normalized CSS colors; transparent pixels compose multiplicatively.
function parseColor(color){const s=String(color||'transparent').trim();if(s==='transparent')return {r:0,g:0,b:0,a:0};
 const hex=s.match(/^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i);
 if(hex){const h=hex[1],parts=h.length<=4?h.split('').map(x=>parseInt(x+x,16)):Array.from({length:h.length/2},(_,i)=>parseInt(h.slice(i*2,i*2+2),16));return {r:parts[0],g:parts[1],b:parts[2],a:parts.length===4?parts[3]/255:1};}
 const rgb=s.match(/^rgba?\(\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*(?:,\s*([\d.]+%?)\s*)?\)$/i);
 if(!rgb)return null;
 const channel=v=>v.endsWith('%')?Number(v.slice(0,-1))*2.55:Number(v);
 const channels=[channel(rgb[1]),channel(rgb[2]),channel(rgb[3])];
 const a=rgb[4]===undefined?1:rgb[4].endsWith('%')?Number(rgb[4].slice(0,-1))/100:Number(rgb[4]);
 if(channels.some(v=>!Number.isFinite(v)||v<0||v>255)||!Number.isFinite(a)||a<0||a>1)return null;
 return {r:Math.round(channels[0]),g:Math.round(channels[1]),b:Math.round(channels[2]),a};
}
function backgroundAlpha(color,alpha){const opacity=validNumber(alpha,0,1,1),raw=String(color||'transparent').trim();
 const v=parseColor(raw);if(!v)return 'transparent';
 if(opacity===1&&v.a===1)return raw;
 const a=Number((v.a*opacity).toFixed(4));
 return `rgba(${v.r},${v.g},${v.b},${a})`;
}
// Overlay has no pointer events; hover/light remain isolated from text, charts and provenance.
const CSS='.master-logo{position:absolute;z-index:9;box-sizing:border-box;display:block;max-width:none;max-height:none;object-fit:cover;box-shadow:0 8px 20px #101e2a24;pointer-events:none}.master-footer,.master-page-number{z-index:8}';
const baseNormalize=C.normalizeProject,baseCreate=C.createProject;
C.normalizeProject=function(raw){const p=baseNormalize(raw);const extra=raw?.master||{};p.master=normalize({...p.master,logoPosition:extra.logoPosition,logoShape:extra.logoShape,logoSize:extra.logoSize,logoInset:extra.logoInset,fontFamily:extra.fontFamily});return p;};
C.createProject=function(...args){const p=baseCreate(...args);p.master=normalize(p.master);return p;};
const api={POSITIONS,SHAPES,FONTS,FONT_STACKS,CSS,normalize,geometry,markup,parseColor,backgroundAlpha};
root.DocutBranding=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
