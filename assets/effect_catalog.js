(function(root){
'use strict';
const C=root.DocutCore;
if(!C)throw Error('DoCut core is required before the effect catalog');
// Data-driven, offline library. The former 89-image reference archive is not bundled:
// these are implemented, independently named visual behaviors, not image-by-image claims.
const CATEGORIES={entrance:'등장',type:'문자·폰트',numbers:'숫자·KPI',charts:'차트',camera:'2.5D·깊이',emphasis:'강조',interaction:'마우스·라이트',exit:'퇴장',transition:'페이지 전환'};
const KINDS=[
 ['fade-up','페이드 업','entrance'],['fade-down','페이드 다운','entrance'],['drop','상단 드롭','entrance'],
 ['pop','팝 인','entrance'],['spring','스프링','entrance'],['sweep','스윕','entrance'],
 ['flip-x','가로 플립','camera'],['flip-y','세로 플립','camera'],['depth-in','원근 줌','camera'],
 ['parallax','패럴랙스','camera'],['tilt','틸트','camera'],['pan-left','카메라 팬','camera'],
 ['word-rise','단어 순차 등장','type'],['typewriter','타이핑 공개','type'],['wipe-left','좌측 와이프','type'],
 ['wipe-right','우측 와이프','type'],['ink-reveal','잉크 공개','type'],['marker','형광 강조','type'],
 ['counter-up','숫자 카운트','numbers'],['stat-reveal','통계 도형 순차','charts'],['chart-rise','막대 성장','charts'],['chart-draw','선 그리기','charts'],
 ['chart-ring','도넛 등장','charts'],['shimmer','부드러운 광택','emphasis'],['breathe','호흡 강조','emphasis'],
 ['shake-soft','미세 진동','emphasis'],
 ['cursor-glow','커서 추적 광원','interaction'],['cursor-tilt','커서 3D 틸트','interaction'],['ambient-aura','앰비언트 광원','interaction'],['edge-light','스위핑 엣지 라이트','interaction'],['exit-up','위로 퇴장','exit'],['exit-down','아래로 퇴장','exit']
].map(([kind,name,category])=>({kind,name,category}));
const SPECIAL=new Set(['word-rise','typewriter','wipe-left','wipe-right','ink-reveal','marker','counter-up','stat-reveal','chart-rise','chart-draw','chart-ring','shimmer']);
const supported={
 'word-rise':['title','text','quote','bullet','source'],typewriter:['title','text','quote','bullet','source','kpi'],
 'wipe-left':null,'wipe-right':null,'ink-reveal':null,marker:['title','text','quote','bullet','source'],
 'counter-up':['kpi'], 'stat-reveal':['stat'], 'chart-rise':['bar'], 'chart-draw':['line'], 'chart-ring':['donut'],shimmer:null
};
const PRESETS=[
 ['executive','중후한 등장','entrance',['fade','fade-up']],['soft-report','공공 보고형','entrance',['rise','fade']],
 ['sharp-cut','명료한 컷','entrance',['sweep','fade']],['focus-build','핵심 확대','entrance',['depth-in','fade']],
 ['stage-left','왼쪽 장면','entrance',['slide-left','fade']],['stage-right','오른쪽 장면','entrance',['slide-right','fade']],
 ['floating-card','부드러운 카드','camera',['pop','float']],['ambient-light','앰비언트','emphasis',['fade','glow']],
 ['camera-push','카메라 푸시','camera',['depth-in','parallax']],['paper-turn','문서 플립','camera',['flip-y','fade']],
 ['tilt-depth','기울기·깊이','camera',['tilt','depth-in']],['infographic','인포그래픽','entrance',['rise','glow']],
 ['word-cascade','문장 단어 순차','type',['word-rise']],['typing','타이핑 캡션','type',['typewriter']],
 ['ink','잉크 공개','type',['ink-reveal']],['underline','형광선','type',['marker']],
 ['text-mask','좌측 텍스트 마스크','type',['wipe-left']],['subtitle','자막 포커스','type',['fade-up','word-rise']],
 ['numbers','KPI 수치 상승','numbers',['counter-up','glow']],['number-focus','KPI 집중','numbers',['pop','counter-up']],
 ['statistic','통계 차트 순차 강조','charts',['fade','stat-reveal']],['bars','막대차트 등장','charts',['fade','chart-rise']],['trend','추세선 그리기','charts',['fade','chart-draw']],
 ['share','구성비 도넛','charts',['chart-ring','glow']],['soft-shine','광택 강조','emphasis',['shimmer']],
 ['remark','판단 문구 강조','emphasis',['marker','glow']],['alert','주의 환기','emphasis',['shake-soft','glow']],
 ['cursor-spotlight','스포트라이트 카드','interaction',['fade-up','ambient-aura','cursor-glow']],
 ['kinetic-card','3D 커서 반응 카드','interaction',['zoom','cursor-tilt','edge-light']],
 ['cinematic-light','시네마 라이트','interaction',['rise','ambient-aura','edge-light']],
 ['light-follow','마우스 광원 + 틸트','interaction',['cursor-glow','cursor-tilt','ambient-aura']],
 ['leave','부드러운 종료','exit',['exit-up']],['closing','결론 퇴장','exit',['exit','exit-down']]
].map(([id,name,category,kinds])=>({id,name,category,kinds}));
// Thirteen additional playable compositions, distinct from the 89 visual
// reference images. Legacy 32 atomic kinds and 33 presets keep their IDs.
const RECIPES=[
 ['grid-appear','카드 순차 등장','entrance',['fade-up','pop']],
 ['clean-sweep','레이아웃 펼침','entrance',['sweep','glow']],
 ['hero-words','제목 원근 등장','type',['depth-in','word-rise']],
 ['quote-marker','문장 형광 강조','type',['word-rise','marker']],
 ['metric-cascade','숫자 상승 시작','numbers',['fade-up','counter-up']],
 ['metric-shine','숫자 광택','numbers',['counter-up','shimmer']],
 ['compare-bars','막대 비교','charts',['fade-up','chart-rise']],
 ['trend-focus','추세선 집중','charts',['chart-draw','breathe']],
 ['ring-light','도넛 광택','charts',['chart-ring','shimmer']],
 ['table-gloss','표 등장','charts',['fade','shimmer']],
 ['next-left','다음 장면 · 왼쪽 퇴장','exit',['exit']],
 ['next-right','다음 장면 · 오른쪽 퇴장','exit',['exit']],
 ['next-up','다음 장면 · 위쪽 퇴장','exit',['exit-up']]
].map(([id,name,category,kinds])=>({id,name,category,kinds,phase:id.startsWith('next-')?'leave':'enter',recipe:true}));
const PALETTES={
 wood:{name:'우드 브라운',bg:'#f2e7d6',foreground:'#4c3f35',accent:'#a37547',series:['#9a6d49','#bd9a71','#6e8d7e','#7a6f89']},
 consulting:{name:'컨설팅 화이트',bg:'#f7f9fd',foreground:'#203d65',accent:'#315e88',series:['#255b85','#6f97b6','#b0c8da','#66727e']},
 quarterly:{name:'분기 인디고',bg:'#dedff6',foreground:'#444b90',accent:'#626ee3',series:['#4f5ab4','#8e94d2','#bcc3ea','#625a89']},
 ambient:{name:'앰비언트 다크',bg:'#222639',foreground:'#e8d9d0',accent:'#bb9b78',series:['#c2a886','#7b8da8','#829f9e','#a88f99']},
 editorial:{name:'에디토리얼 샌드',bg:'#eae3d5',foreground:'#5b4d3d',accent:'#a98757',series:['#987c58','#b6a788','#7c8e81','#6c7b92']},
 slate:{name:'슬레이트 뉴트럴',bg:'#262b33',foreground:'#d1d7df',accent:'#9fbbce',series:['#9ab8cc','#7c99a7','#6b8584','#9f9a9a']},
 mint:{name:'민트 소프트',bg:'#e7f2ed',foreground:'#245d4c',accent:'#4c9378',series:['#409472','#84b9a4','#8ca9b0','#9ab27c']},
 bronze:{name:'브론즈 모노',bg:'#ede7de',foreground:'#3d3733',accent:'#8d7358',series:['#685746','#a68f70','#c7bca6','#85766a']},
 cobalt:{name:'코발트 프레젠트',bg:'#e8eff9',foreground:'#1c3554',accent:'#2c6eb2',series:['#245f9e','#588cc2','#90b5d8','#42617f']}
};
const CHART_PALETTES={default:PALETTES.wood.series,ocean:PALETTES.consulting.series,forest:PALETTES.mint.series,ember:['#b76a3b','#d7a477','#77586d','#e1bb93'],mono:['#374151','#6b7280','#9ca3af','#d1d5db'],indigo:PALETTES.quarterly.series,bronze:PALETTES.bronze.series,ambient:PALETTES.ambient.series,cobalt:PALETTES.cobalt.series};
const TRANSITIONS=[{id:'none',name:'즉시 전환'},{id:'fade',name:'페이드'},{id:'slide',name:'가로 슬라이드'},{id:'zoom',name:'시네마틱 줌'},{id:'wipe',name:'좌→우 와이프'},{id:'slide-up',name:'아래→위 장면'},{id:'slide-down',name:'위→아래 장면'},{id:'reveal-center',name:'중앙 확장 공개'},{id:'curtain',name:'커튼 공개'},{id:'soft-blur',name:'소프트 포커스'},{id:'flip',name:'원근 플립'}];
const VALID_TRANSITIONS=new Set(TRANSITIONS.map(t=>t.id));
const GALLERY=[...KINDS.map(p=>({...p,id:p.kind,mode:'kind',phase:p.category==='exit'?'leave':'enter'})),...PRESETS.map(p=>({...p,mode:'preset',phase:p.category==='exit'?'leave':'enter'})),...RECIPES.map(p=>({...p,mode:'preset'})),...TRANSITIONS.map(p=>({...p,id:'scene-'+p.id,transitionId:p.id,category:'transition',mode:'transition',phase:'scene'}))];
if(GALLERY.length!==89||new Set(GALLERY.map(x=>x.id)).size!==89)throw Error('Effect gallery item count or IDs are invalid');
function supports(kind,type){const allowed=supported[kind];return !allowed||allowed.includes(type);}
function normalizeTransition(kind){return VALID_TRANSITIONS.has(kind)?kind:'fade';}
function createStack(id,type){const preset=[...PRESETS,...RECIPES].find(p=>p.id===id);if(!preset)throw Error('Unknown motion preset');if(preset.kinds.some(kind=>!supports(kind,type)))throw Error('이 요소에는 적용할 수 없는 효과가 포함되어 있습니다');
 return preset.kinds.slice(0,3).map((kind,i)=>{const fx=C.makeEffect(kind,kind==='counter-up'?950:kind.startsWith('chart-')?950:kind==='word-rise'?900:620,i===0?70:30);fx.easing='cubic-bezier(.22,1,.36,1)';if(id==='next-left')fx.end={x:-150,opacity:0};if(id==='next-right')fx.end={x:150,opacity:0};return fx;});
}
function recommended(type){return {title:'subtitle',text:'word-cascade',quote:'remark',bullet:'word-cascade',source:'soft-report',kpi:'numbers',bar:'bars',line:'trend',donut:'share',stat:'statistic',table:'soft-report',image:'camera-push',card:'floating-card',shape:'soft-shine',note:'soft-report',divider:'soft-report'}[type]||'executive';}
for(const {kind,name} of KINDS)if(!C.EFFECTS.some(([id])=>id===kind))C.EFFECTS.push([kind,name]);
for(const id of ['bronze','cobalt'])if(!C.THEMES.some(t=>t.id===id))C.THEMES.push({id,name:PALETTES[id].name,hint:'시각 자료의 대비·간결함을 위한 색상',color:PALETTES[id].accent});
Object.assign(C.LAYOUTS,{metrics:'KPI summary',split:'Split narrative',quadrant:'Four-way comparison',portrait:'Editorial story',spotlight:'Single decision'});
C.CHART_PALETTES=CHART_PALETTES;
const api={CATEGORIES,KINDS,PRESETS,RECIPES,GALLERY,PALETTES,CHART_PALETTES,TRANSITIONS,SPECIAL,supports,createStack,recommended,normalizeTransition};
C.EFFECT_CATALOG=api;root.DocutEffectCatalog=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
