/* DoCut vector-fidelity pilot: UBS Global Wealth Report 2025 layout grammar.
 * Independently authored shapes and editable content; no UBS logos, portraits,
 * photos, illustrations or source PDF embedded. NOT a measured 99% replica.
 * Source-ratio reference comparison is a future acceptance gate; these pages
 * are intentionally reflowed to the 1280x720 DoCut 16:9 editing frame.
 */
(function(root){
'use strict';
const C=root.DocutCore;if(!C)throw Error('DoCut core required');
const WHITE='#FFFFFF',PAPER='#FCFCFA',TEXT='#262B2D',MUTED='#666A6A',INK='#343637',RED='#BD2432',BEIGE='#F0EEE8',HAIR='#DADAD6',GREY='#B6B6B1',TINT='#E6DFD4';
const URL='https://www.ubs.com/content/dam/assets/wm/static/noindex/gwr-2025-digital.pdf';
const DESIGN_VERSION='ubs-gwr-2025-vector-16x9-pilot-1';
const LABELS=['Executive welcome','Global wealth levels','Wealth mix','Wealth distribution','Regional comparison','Methodology'];
function make(i){
 if(!Number.isInteger(i)||i<0||i>5)throw Error('UBS vector page index must be 0-5');
 const elements=[],settings={font:'Arial',align:'left',size:19,weight:400,color:TEXT,background:'transparent',radius:0,shadow:0,opacity:1};
 function add(type,x,y,w,h,value='',style={},extra={}){
   if(x<0||y<0||w<=0||h<=0||x+w>1280||y+h>720)throw Error('UBS vector geometry out of bounds: '+type);
   const raw=C.makeBlock(type,x,y,{w,h,text:value,style:{...settings,...style},effects:[],locked:false,verified:false,source:'',asOfDate:'',unit:'',evidence:'',...extra});
   const block=C.normalizeBlock(raw);elements.push(block);return block;
 }
 const rect=(x,y,w,h,fill,opts={})=>add('shape',x,y,w,h,'',{background:fill,...opts});
 const text=(x,y,w,h,v,size=18,color=TEXT,weight=400,opts={})=>add('text',x,y,w,h,v,{size,color,weight,...opts});
 const rule=(x,y,w,h=2,color=HAIR)=>rect(x,y,w,h,color);
 const disk=(x,y,size,fill,edge=undefined)=>rect(x,y,size,size,fill,{mask:'circle',borderWidth:edge?1:0,borderColor:edge||fill});
 const rows=(x,y,w,n,spacing=22,color=GREY,base=.96)=>{
  for(let q=0;q<n;q++){const f=q===n-1?.58:Math.max(.64,base-(q%4)*.05);rect(x,y+q*spacing,Math.round(w*f),Math.max(4,Math.floor(spacing*.28)),color,{opacity:.65});}
 };
 // The measured-original path is intentionally separate. These are 16:9
 // adaptation geometries, not annotations of exact PDF coordinates.
 function master(title,section){
   rect(0,0,1280,720,PAPER);disk(42,21,23,'#F8F8F7',HAIR);
   rule(71,32,12,2,RED);rule(47,27,2,12,RED);
   [['Welcome',260,122],['Global wealth levels',407,182],['Wealth distribution',617,190],['The outlook for wealth',832,205],['Wealth snapshots',1068,161]].forEach(([s,x,width],j)=>{
     if(j===section)rule(x,61,Math.min(width,s.length*7),3,RED);
     text(x,27,width,30,s,13,j===section?INK:MUTED,j===section?700:400);
   });
   rule(40,66,1200,1,HAIR);
   rule(40,678,1200,1,HAIR);
   text(44,686,400,25,'Wealth intelligence   /   vector research layout',12,MUTED,400);
   text(1189,686,54,24,String(i+1).padStart(2,'0'),13,MUTED,700,{align:'right'});
   return title;
 }
 function headline(t,x=62,y=110,w=1090,size=55){text(x,y,w,80,t,size,INK,400,{font:'Arial',letterSpacing:-1.0});}
 function caption(x,y,w,label){text(x,y,w,26,label,16,INK,700);}
 function smallbars(x,y,w,n=3,color=HAIR){rows(x,y,w,n,15,color,.85);}
 switch(i){
 case 0: {
   master('Welcome',0);
   // Pale portrait rail and true editorial two-column hierarchy from the
   // publicly visible 2025 report's welcome-page grammar.
   rect(0,67,325,611,BEIGE);
   disk(104,123,106,'#DEDCD5');disk(115,134,84,'#F8F7F3');
   caption(88,238,180,'DIRECTOR / 01');smallbars(88,270,191,3,'#C9C6BE');
   disk(104,362,106,'#DEDCD5');disk(115,373,84,'#F8F7F3');
   caption(88,477,192,'DIRECTOR / 02');smallbars(88,509,190,3,'#C9C6BE');
   headline('Welcome',378,115,845,56);
   rows(379,236,370,7,24,'#B9BAB6');rows(798,236,389,7,24,'#B9BAB6');
   rule(382,439,5,116,RED);rows(408,448,326,4,25,'#898A87',.87);
   rows(800,448,390,5,26,'#BCBCB8');
   rect(834,590,360,58,BEIGE);rule(849,603,4,30,RED);smallbars(870,604,286,2,'#B6B1AA');
   break;
 }
 case 1: {
   master('Global wealth levels',1);headline('Global wealth levels',62,105,1128,58);
   text(63,185,950,48,'A single view of regional wealth change',22,INK,400);
   rule(63,242,1130,2,HAIR);caption(65,264,445,'REGIONAL CHANGE');
   [['#B52C39',0],['#C76565',1],['#E2AD9F',2]].forEach(([c,k])=>{const d=[146,113,89][k];disk(147+k*180,329+Math.round((146-d)/2),d,c);});
   rows(65,516,604,4,22,'#B7B7B2');rule(741,278,1,337,HAIR);
   caption(786,273,400,'OUTLOOK');rows(785,326,391,10,26,'#B8BAB7');
   break;
 }
 case 2: {
   master('Wealth mix',1);headline('Wealth mix',62,104,1050,57);
   caption(63,205,477,'ASSET COMPOSITION');
   disk(108,280,344,RED);disk(143,315,274,'#D88F92');disk(185,357,190,'#F6EDE4');
   disk(232,404,96,WHITE);
   [['#B92F3A',0],['#CD7479',1],['#DD999A',2],['#E6E1D6',3]].forEach(([c,k])=>{rect(632,286+k*70,24,24,c);rows(678,292+k*70,350,2,16,'#A8A8A4');});
   rule(627,242,544,1,HAIR);rule(627,587,544,1,HAIR);
   break;
 }
 case 3: {
   master('Wealth distribution',2);headline('Wealth distribution',62,105,1122,59);
   caption(62,203,635,'WEALTH TIERS');caption(786,203,370,'GLOBAL DISTRIBUTION');
   const widths=[122,232,367,526];const fills=[RED,'#CB7376','#DDD1C8','#BFBDB5'];
   widths.forEach((w,k)=>{const x=350-w/2;rect(x,270+k*79,w,62,fills[k]);rule(x,270+k*79,w,2,WHITE);});
   rule(746,234,1,357,HAIR);rows(784,272,374,11,27,'#B5B6B3');
   break;
 }
 case 4: {
   master('Regional comparison',2);headline('Regional comparison',62,110,1120,58);
   caption(63,217,550,'MARKETS');caption(720,217,470,'COMPARATIVE POSITION');
   rect(62,262,590,350,BEIGE);disk(142,321,155,'#D9C7BC');disk(272,388,110,'#C67D7C');disk(398,316,115,'#E3D4CF');disk(474,470,76,RED);
   [0,1,2,3,4,5].forEach(q=>{const y=266+q*52;rect(719,y,412,5,HAIR);rect(719,y+13,90+q*32,20,q===4?RED:'#B3B4B0',{opacity:q===4?.86:.60});});
   break;
 }
 case 5: {
   master('Methodology',4);headline('Methodology',62,109,1120,59);
   rule(64,207,5,421,RED);caption(96,205,418,'RESEARCH BASIS');rows(96,250,460,15,24,'#AEB0AB');
   rule(614,208,1,412,HAIR);caption(660,205,460,'METHOD & LIMITATIONS');rows(660,250,515,12,27,'#AEB0AB');
   rect(660,583,515,47,BEIGE);rule(680,596,3,22,RED);smallbars(702,598,406,2,'#B1AFA9');
   break;
 }
 }
 return {id:C.uid('page'),tab:LABELS[i],customTab:true,headline:LABELS[i],subtitle:'Vector-constructed 16:9 pilot using UBS Global Wealth Report 2025 grammar. Quantitative visual matching NOT YET MEASURED.',background:PAPER,layout:'blank',transition:'none',elements,
   // Metadata is informational; importing older schemas may omit extra page fields.
   referenceFidelity:{sourceEdition:'2025',sourceUrl:URL,mode:'adapted-16:9',measuredScore:null,status:'unverified',vectorOnly:true,designVersion:DESIGN_VERSION}};
}
const api={make,DESIGN_VERSION,SOURCE_URL:URL,SOURCE_EDITION:'2025',pageLabels:LABELS};
root.DocutUBSFidelity=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
