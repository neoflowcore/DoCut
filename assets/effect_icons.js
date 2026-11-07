/* DoCut v0.32 - 89 vector glyphs, generated offline from the actual motion semantics. */
(function(root){
'use strict';
const C=root.DocutCore;
const esc=C.escapeHTML;
const BASE='<rect x="10" y="9" width="60" height="39" rx="6" fill="none" stroke="currentColor" stroke-width="2" opacity=".30"/>';
const arrow=(x1,y1,x2,y2)=>`<path d="M${x1} ${y1} L${x2} ${y2} m-5 -5 l5 5 l-5 5" transform="rotate(${Math.atan2(y2-y1,x2-x1)*180/Math.PI} ${x2} ${y2})" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const bar=(heights)=>heights.map((h,i)=>`<rect x="${23+i*11}" y="${47-h}" width="8" height="${h}" rx="2" fill="currentColor" opacity="${.55+i*.12}"/>`).join('');
function drawing(entry){const id=entry.transitionId||entry.kind||entry.id||entry.kinds?.find(k=>k.includes('chart')||k==='counter-up')||entry.kinds?.[0]||'fade',category=entry.category;
 if(entry.mode==='transition'){
  let path='<rect x="15" y="15" width="39" height="27" rx="4" fill="currentColor" fill-opacity=".22" stroke="currentColor" stroke-width="2"/><path d="M56 16h8m-3-3 4 3-4 3" stroke="currentColor" stroke-width="2" fill="none"/>';
  if(id==='fade')path='<rect x="11" y="18" width="36" height="25" rx="4" fill="none" stroke="currentColor" stroke-dasharray="4 4"/><rect x="32" y="11" width="36" height="25" rx="4" fill="currentColor" fill-opacity=".42" stroke="currentColor"/>';
  if(id==='slide'||id.startsWith('slide'))path='<rect x="9" y="18" width="26" height="23" rx="3" stroke="currentColor" fill="none"/><rect x="48" y="14" width="26" height="23" rx="3" stroke="currentColor" fill="currentColor" fill-opacity=".23"/><path d="M28 30h27m-6-5 6 5-6 5" stroke="currentColor" stroke-width="2.5" fill="none"/>';
  if(id==='zoom')path='<rect x="25" y="17" width="29" height="22" rx="3" fill="none" stroke="currentColor"/><path d="M20 14L12 6m0 0v8m0-8h8M60 44l9 8m0 0v-8m0 8h-8" stroke="currentColor" stroke-width="2" fill="none"/>';
  if(id==='wipe'||id==='curtain'||id==='reveal-center')path='<rect x="14" y="12" width="53" height="36" rx="4" stroke="currentColor" fill="none"/><path d="M40 13v34" stroke="currentColor" stroke-width="3" stroke-dasharray="5 3"/><path d="M28 31h24m-4-4 4 4-4 4" stroke="currentColor" stroke-width="2" fill="none"/>';
  if(id==='slide-up')path='<rect x="25" y="10" width="35" height="22" rx="3" fill="none" stroke="currentColor"/><rect x="21" y="34" width="41" height="19" rx="3" fill="currentColor" fill-opacity=".23" stroke="currentColor"/><path d="M42 44V18m-6 6 6-6 6 6" fill="none" stroke="currentColor" stroke-width="3"/>';
  if(id==='slide-down')path='<rect x="24" y="27" width="35" height="23" rx="3" fill="none" stroke="currentColor"/><rect x="20" y="7" width="41" height="19" rx="3" fill="currentColor" fill-opacity=".23" stroke="currentColor"/><path d="M42 12v29m-6-6 6 6 6-6" fill="none" stroke="currentColor" stroke-width="3"/>';
  if(id==='reveal-center')path='<rect x="15" y="12" width="50" height="37" rx="4" stroke="currentColor" fill="none"/><rect x="32" y="22" width="16" height="17" rx="2" fill="currentColor" opacity=".5"/><path d="M25 29h-12m2-3-2 3 2 3m40-3h12m-2-3 2 3-2 3" stroke="currentColor" fill="none" stroke-width="2"/>';
  if(id==='curtain')path='<rect x="13" y="11" width="54" height="39" rx="3" stroke="currentColor" fill="none"/><path d="M19 13h20v34H19zM41 13h20v34H41z" fill="currentColor" fill-opacity=".15"/><path d="M35 29H23m4-4-4 4 4 4M45 29h12m-4-4 4 4-4 4" stroke="currentColor" stroke-width="2.5" fill="none"/>';
  if(id==='flip')path='<path d="M28 12l26 6v28l-26-6z" fill="currentColor" fill-opacity=".24" stroke="currentColor" stroke-width="2"/><path d="M28 12v28" stroke="currentColor" stroke-width="2"/>';
  if(id==='soft-blur')path='<rect x="16" y="14" width="48" height="32" rx="5" fill="currentColor" fill-opacity=".22"/><rect x="22" y="19" width="36" height="22" rx="4" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="62" cy="13" r="6" fill="currentColor" opacity=".45"/>';
  if(id==='none')path='<rect x="17" y="14" width="46" height="32" rx="4" stroke="currentColor" fill="none"/><path d="M27 30h26" stroke="currentColor" stroke-width="3"/>';
  return path;
 }
 if(category==='charts'){
  if(id.includes('ring')||id==='share'||id==='donut'||id==='chart-ring')return '<circle cx="40" cy="29" r="17" stroke="currentColor" stroke-width="9" fill="none" opacity=".23"/><path d="M40 12a17 17 0 0 1 16 22" stroke="currentColor" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="40" cy="29" r="4" fill="currentColor"/>';
  if(id.includes('draw')||id==='trend-focus'||id==='trend'||id==='chart-draw')return '<path d="M14 46h58" stroke="currentColor" stroke-width="2" opacity=".45"/><path d="M19 41L32 31 44 36 55 18 68 13" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><circle cx="55" cy="18" r="3.5" fill="currentColor"/>';
  if(id.includes('stat'))return '<path d="M15 17h40m-40 13h52m-52 13h30" stroke="currentColor" stroke-width="3" opacity=".6"/><circle cx="61" cy="16" r="6" fill="currentColor"/><circle cx="45" cy="43" r="4" fill="currentColor"/>';
  if(id.includes('table'))return '<rect x="12" y="12" width="57" height="36" rx="3" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M12 24h57M12 36h57M32 12v36M50 12v36" stroke="currentColor" stroke-width="1.5"/><rect x="33" y="25" width="16" height="10" fill="currentColor" opacity=".36"/>';
  return '<path d="M13 48h57" stroke="currentColor" stroke-width="2" opacity=".45"/>'+bar([14,25,34,42]);
 }
 if(category==='numbers')return `<text x="10" y="34" font-size="24" font-weight="800" fill="currentColor" letter-spacing="-2">${id.includes('focus')?'99':id.includes('shine')?'88':'24'}</text><path d="M52 41V15m-7 7 7-7 7 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="17" y="44" width="49" height="3" rx="2" fill="currentColor" opacity=".5"/>`;
 if(category==='type'){
  const cursor=id.includes('typing')||id.includes('typewriter')?'<rect x="59" y="16" width="3" height="29" fill="currentColor"/>':'';
  const marker=id.includes('marker')||id.includes('underline')||id.includes('quote')?'<rect x="16" y="28" width="45" height="8" fill="currentColor" opacity=".3"/>':'';
  return `<path d="M16 20h48m-48 10h42m-42 10h32" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity=".9"/>${cursor}${marker}`;
 }
 if(category==='interaction')return '<rect x="14" y="12" width="53" height="35" rx="5" stroke="currentColor" fill="currentColor" fill-opacity=".15"/><circle cx="43" cy="28" r="19" fill="currentColor" opacity=".14"/><circle cx="43" cy="28" r="8" fill="currentColor" opacity=".6"/><path d="M55 35l-4-9v16l5-4 4 7 4-2-4-7z" stroke="currentColor" stroke-width="1.5" fill="none"/>';
 if(category==='camera')return '<path d="M19 20l36-8 10 8-36 9z" stroke="currentColor" stroke-width="2.5" fill="currentColor" fill-opacity=".34"/><path d="M19 20v22l10 7V29m36-9v22l-36 7" stroke="currentColor" stroke-width="2.5" fill="none"/><path d="M33 25l15-3" stroke="currentColor" stroke-width="2"/>';
 if(category==='emphasis')return '<path d="M39 9l5 16 16 5-16 5-5 16-5-16-16-5 16-5z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".22"/><path d="M61 11v13m-6-6h13" stroke="currentColor" stroke-width="2"/>';
 if(category==='exit'){
  const left=id.includes('left')||id==='next-left',right=id.includes('right')||id==='next-right';
  return `<rect x="17" y="13" width="41" height="32" rx="5" stroke="currentColor" fill="currentColor" fill-opacity=".15" stroke-dasharray="4 2"/><path d="M${left?39:right?39:39} 30 ${left?'h-26m6-5-6 5 6 5':right?'h30m-6-5 6 5-6 5':'v-20m-5 6 5-6 5 6'}" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
 }
 const down=id==='drop'||id==='fade-down';const up=id==='fade-up'||id==='rise'||id==='soft-report';const sideways=id.includes('slide')||id.includes('sweep')||id.includes('stage');
 return `<rect x="17" y="18" width="42" height="30" rx="5" fill="currentColor" fill-opacity=".25" stroke="currentColor" stroke-width="2.5"/><path d="${sideways?'M48 31H70m-6-6 6 6-6 6':down?'M40 8v21m-6-6 6 6 6-6':up?'M40 49V29m-6 6 6-6 6 6':'M34 27l6-8 6 8m-6-8v22'}" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
}
// A different, meaning-based pictogram for every primitive motion. Preset
// thumbnails additionally display their ordered 1–3 miniature pictograms.
const primitiveArt={
 'fade-up':'<path d="M40 47V16m-9 9 9-9 9 9" stroke="currentColor" stroke-width="3" fill="none"/><rect x="20" y="30" width="40" height="16" rx="3" fill="currentColor" opacity=".16"/><path d="M22 49h36" stroke="currentColor" opacity=".25"/>',
 'fade-down':'<path d="M40 10v32m-9-9 9 9 9-9" stroke="currentColor" stroke-width="3" fill="none"/><rect x="21" y="9" width="38" height="16" rx="3" fill="currentColor" opacity=".14"/>',
 drop:'<path d="M40 9v29m-7-6 7 6 7-6" stroke="currentColor" stroke-width="3" fill="none"/><path d="M17 44h46m-36-6-7 6m33-6 7 6" stroke="currentColor" stroke-width="2"/><circle cx="40" cy="45" r="4" fill="currentColor"/>',
 pop:'<rect x="22" y="17" width="36" height="27" rx="6" fill="currentColor" opacity=".3" stroke="currentColor" stroke-width="3"/><path d="M40 5v8M40 48v6M12 30h7m42 0h7M20 10l6 7m28-7-6 7" stroke="currentColor" stroke-width="2" fill="none"/>',
 spring:'<rect x="19" y="13" width="42" height="23" rx="5" fill="currentColor" opacity=".25" stroke="currentColor" stroke-width="2"/><path d="M40 36l-10 5 20 3-20 4 20 3-10 5" stroke="currentColor" stroke-width="2" fill="none"/>',
 sweep:'<path d="M10 18h47m-7-5 7 5-7 5M20 30h44M11 42h30" stroke="currentColor" stroke-width="3" fill="none"/><rect x="18" y="11" width="9" height="37" fill="currentColor" opacity=".23"/>',
 'flip-x':'<path d="M12 13l25 8v26l-25-8zM68 13l-25 8v26l25-8z" fill="currentColor" fill-opacity=".12" stroke="currentColor" stroke-width="2"/><path d="M40 7v44" stroke="currentColor" stroke-dasharray="4 3"/>',
 'flip-y':'<path d="M17 11h46l-9 18H26zM17 46h46l-9-17H26z" fill="currentColor" fill-opacity=".12" stroke="currentColor" stroke-width="2"/><path d="M11 29h58" stroke="currentColor" stroke-dasharray="4 3"/>',
 'depth-in':'<rect x="29" y="19" width="22" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="16" y="9" width="48" height="40" rx="4" stroke="currentColor" stroke-width="2.5" fill="currentColor" fill-opacity=".11"/><path d="M29 19L16 9m35 10L64 9M29 39L16 49m35-10 13 10" stroke="currentColor" opacity=".6"/>',
 parallax:'<rect x="9" y="16" width="41" height="25" rx="3" fill="currentColor" opacity=".2"/><rect x="27" y="9" width="44" height="32" rx="4" stroke="currentColor" fill="none" stroke-width="2.5"/><path d="M15 47h37m-6-5 6 5-6 5" stroke="currentColor" stroke-width="2.5" fill="none"/>',
 tilt:'<path d="M13 18l47-9 11 32-47 9z" stroke="currentColor" stroke-width="2.5" fill="currentColor" fill-opacity=".2"/><path d="M39 26l8 4" stroke="currentColor" stroke-width="2.5"/><path d="M63 11l9-3M14 44l-7 2" stroke="currentColor"/>',
 'pan-left':'<rect x="15" y="12" width="50" height="35" rx="3" stroke="currentColor" fill="none" stroke-width="2"/><path d="M46 17v25" stroke="currentColor" stroke-dasharray="3 3"/><path d="M56 30H25m7-7-7 7 7 7" stroke="currentColor" stroke-width="3" fill="none"/>',
 'word-rise':'<path d="M17 45h28m-28-10h44m-44-10h35" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M65 45V20m-6 6 6-6 6 6" stroke="currentColor" stroke-width="2" fill="none"/>',
 typewriter:'<path d="M19 18h35M36 18v27m-9 0h18" stroke="currentColor" stroke-width="4"/><path d="M59 20v25" stroke="currentColor" stroke-width="3"/><path d="M19 50h40" stroke="currentColor" stroke-width="1" opacity=".3"/>',
 'wipe-left':'<rect x="17" y="13" width="46" height="34" rx="3" stroke="currentColor" fill="none"/><rect x="17" y="13" width="22" height="34" fill="currentColor" opacity=".26"/><path d="M53 30H23m8-7-8 7 8 7" stroke="currentColor" stroke-width="2.5" fill="none"/>',
 'wipe-right':'<rect x="17" y="13" width="46" height="34" rx="3" stroke="currentColor" fill="none"/><rect x="41" y="13" width="22" height="34" fill="currentColor" opacity=".26"/><path d="M27 30h30m-8-7 8 7-8 7" stroke="currentColor" stroke-width="2.5" fill="none"/>',
 'ink-reveal':'<path d="M37 9c-4 9-12 18-12 24a12 12 0 0 0 24 0c0-6-8-15-12-24z" fill="currentColor" fill-opacity=".25" stroke="currentColor" stroke-width="2"/><path d="M16 48h51M24 54h38" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
 marker:'<path d="M13 20h52m-52 11h42m-42 11h30" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M11 35h46" stroke="currentColor" stroke-width="9" opacity=".32"/>',
 'counter-up':'<text x="12" y="39" font-size="31" font-weight="800" fill="currentColor">24</text><path d="M61 45V14m-7 8 7-8 7 8" stroke="currentColor" stroke-width="3" fill="none"/>',
 'stat-reveal':'<rect x="15" y="16" width="47" height="8" rx="2" fill="currentColor" opacity=".25"/><rect x="15" y="28" width="37" height="8" rx="2" fill="currentColor" opacity=".55"/><rect x="15" y="40" width="57" height="8" rx="2" fill="currentColor"/><path d="M66 11v24" stroke="currentColor" stroke-width="2" stroke-dasharray="3 3"/>',
 'chart-rise':'<path d="M12 48h58" stroke="currentColor" stroke-width="2"/>'+bar([10,19,31,39]),
 'chart-draw':'<path d="M11 46h59" stroke="currentColor" stroke-width="2" opacity=".5"/><path d="M14 39L28 32 40 36 53 16 65 12" stroke="currentColor" stroke-width="3" fill="none" stroke-linejoin="round"/><circle cx="65" cy="12" r="4" fill="currentColor"/>',
 'chart-ring':'<circle cx="40" cy="29" r="19" fill="none" stroke="currentColor" stroke-width="9" opacity=".25"/><path d="M40 10a19 19 0 0 1 18 26" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/>',
 shimmer:'<path d="M15 43h51M15 19h36" stroke="currentColor" stroke-width="4"/><path d="M52 10l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" stroke="currentColor" fill="currentColor" fill-opacity=".25" stroke-width="2"/>',
 breathe:'<circle cx="40" cy="29" r="13" fill="currentColor" opacity=".32"/><circle cx="40" cy="29" r="22" stroke="currentColor" stroke-width="2" opacity=".8" fill="none"/><circle cx="40" cy="29" r="7" stroke="currentColor" fill="none"/>',
 'shake-soft':'<rect x="25" y="15" width="30" height="30" rx="4" fill="currentColor" opacity=".25"/><path d="M21 19l-8 6 9 6-8 6m44-18 8 6-9 6 8 6" stroke="currentColor" stroke-width="2.5" fill="none"/>',
 'cursor-glow':'<circle cx="39" cy="29" r="22" stroke="currentColor" fill="none" opacity=".2" stroke-width="6"/><circle cx="39" cy="29" r="10" fill="currentColor" opacity=".25"/><path d="M40 18l6 22 5-9 9-4z" stroke="currentColor" stroke-width="2" fill="none"/>',
 'cursor-tilt':'<path d="M18 18l37-8 10 31-37 7z" fill="currentColor" fill-opacity=".2" stroke="currentColor" stroke-width="2.5"/><path d="M53 24l9 22 5-11 6-3z" fill="none" stroke="currentColor" stroke-width="2"/>',
 'ambient-aura':'<rect x="19" y="16" width="43" height="28" rx="5" stroke="currentColor" fill="currentColor" fill-opacity=".16" stroke-width="2"/><circle cx="40" cy="30" r="25" stroke="currentColor" opacity=".28" stroke-width="5" fill="none"/>',
 'edge-light':'<rect x="18" y="15" width="44" height="29" rx="5" fill="none" stroke="currentColor" opacity=".3"/><path d="M20 15h24a17 17 0 0 1 17 17" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="62" cy="31" r="4" fill="currentColor"/>',
 'exit-up':'<rect x="15" y="18" width="50" height="32" rx="4" stroke="currentColor" stroke-dasharray="4 3" fill="none"/><path d="M40 38V7m-8 9 8-9 8 9" stroke="currentColor" stroke-width="3" fill="none"/>',
 'exit-down':'<rect x="15" y="8" width="50" height="32" rx="4" stroke="currentColor" stroke-dasharray="4 3" fill="none"/><path d="M40 18v31m-8-9 8 9 8-9" stroke="currentColor" stroke-width="3" fill="none"/>'
};
function motionGlyph(kind){
 if(primitiveArt[kind])return primitiveArt[kind];
 if(['fade','rise','zoom','slide-left','slide-right','float','glow','exit'].includes(kind)){
  const variants={
   fade:'<rect x="20" y="16" width="40" height="27" rx="5" fill="currentColor" opacity=".3" stroke="currentColor"/>',
   rise:'<path d="M40 46V12m-8 8 8-8 8 8" stroke="currentColor" stroke-width="3" fill="none"/>',
   zoom:'<rect x="29" y="21" width="22" height="17" stroke="currentColor" fill="none"/><rect x="17" y="11" width="46" height="37" stroke="currentColor" fill="none" stroke-width="2"/>',
   'slide-left':'<path d="M60 28H20m9-9-9 9 9 9" stroke="currentColor" stroke-width="3" fill="none"/>',
   'slide-right':'<path d="M20 28h40m-9-9 9 9-9 9" stroke="currentColor" stroke-width="3" fill="none"/>',
   float:'<path d="M14 37q13-22 26 0t26 0" stroke="currentColor" stroke-width="4" fill="none"/>',
   glow:'<circle cx="40" cy="29" r="12" fill="currentColor" opacity=".6"/><circle cx="40" cy="29" r="22" stroke="currentColor" opacity=".4" stroke-width="4" fill="none"/>',
   exit:'<rect x="14" y="14" width="38" height="30" rx="3" stroke="currentColor" stroke-dasharray="3 3" fill="none"/><path d="M40 29h29m-7-7 7 7-7 7" stroke="currentColor" stroke-width="3" fill="none"/>'
  };return variants[kind];
 }
 return '<path d="M18 16h44m-44 13h33m-33 13h24" stroke="currentColor" stroke-width="4"/>';
}
function stackGlyphs(entry){
 if(!Array.isArray(entry.kinds)||!entry.kinds.length)return '';
 // The lower glyphs describe the ordered effects, not arbitrary numbers.
 const items=entry.kinds.map((kind,i)=>{
  const xx=(entry.kinds.length===1?32:entry.kinds.length===2?20+i*24:10+i*24);
  return `<g transform="translate(${xx} 43) scale(.16)">${motionGlyph(kind)}</g>`;
 });
 return '<path d="M10 41h60" stroke="currentColor" stroke-width=".8" opacity=".25"/>'+items.join('');
}
function icon(entry){
 const type=entry.category||'entrance';
 const atomic=entry.mode==='kind';
 const base=atomic?motionGlyph(entry.kind):drawing(entry);
 const stacked=entry.mode==='preset'?stackGlyphs(entry):'';
 const nextPage=entry.id?.startsWith('next-')?'<rect x="66" y="5" width="9" height="10" rx="1.5" stroke="currentColor" fill="none"/><path d="M64 3h8" stroke="currentColor" stroke-width="1.5"/>':'';
 const art=stacked?`<g transform="translate(0,-3) scale(1,.86)">${base}</g>${stacked}`:base;
 return `<span class="fx-glyph fx-glyph-${esc(type)}" aria-hidden="true"><svg class="fx-glyph-svg" viewBox="0 0 80 58" xmlns="http://www.w3.org/2000/svg" focusable="false">${art}${nextPage}</svg></span>`;
}
const api={icon,drawing};root.DocutEffectIcons=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
