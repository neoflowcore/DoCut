from pathlib import Path
root=Path('/mnt/data/DoCut_recovery/source')
p=root/'index.html';s=p.read_text(encoding='utf-8')
s=s.replace('STUDIO <em>0.32.0</em>','STUDIO <em>0.33.0</em>')
s=s.replace('프리미엄 페이지 디자인 · 20종','글로벌 전문 보고서 레퍼런스 · 20종')
s=s.replace('브랜드와 저작권에 종속되지 않는 독자적인 프리미엄 16:9 보고서 구성 20종입니다.','글로벌 공개 보고서의 정보 구조를 참고해 독립 제작한 20종 × 각 6페이지입니다. 공식 원본은 참조용 링크만 제공하며 로고·사진·원본 차트는 포함하지 않습니다.')
s=s.replace('디자인 검색</label>','회사·유형·보고서 검색</label>')
start=s.index('<label for="kitCategory"');end=s.index('</select>',start)+len('</select>')
s=s[:start]+'''<label for="kitCategory" class="field-label">레퍼런스 분류</label><select id="kitCategory" class="inspect-input">
<option value="pro" selected>전문 보고서 20종 · 전체</option>
<option value="pro-Strategy">전략·컨설팅 · 5종</option><option value="pro-Earnings">분기 실적 · 5종</option>
<option value="pro-Corporate">기업·연차 · 3종</option><option value="pro-Finance">금융·투자 · 4종</option>
<option value="pro-Public Policy">정책·경제 · 3종</option>
<option value="legacy">기존 일반 레이아웃 · 20종</option><option value="기승전결">기존 · 기승전결</option><option value="근거·분석">기존 · 근거 분석</option><option value="대안·실행">기존 · 대안 실행</option><option value="내 템플릿">내 개인 템플릿</option>
</select>'''+s[end:]
needle='<div id="kitPreviewStage" class="kit-preview-stage">'
s=s.replace(needle,'''<div id="kitPackPageStrip" class="kit-pack-pages" aria-label="전문 보고서 6페이지 선택" hidden></div>'''+needle)
needle='<div class="inspect-inline"><button class="primary-btn" type="button" data-action="kit-insert">현재 페이지 뒤에 추가</button>'
s=s.replace(needle,'''<div class="kit-ref-note" id="kitReferenceNote" hidden><span id="kitReferenceEvidence"></span><a id="kitReferenceSource" href="#" target="_blank" rel="noopener noreferrer">원본 보고서 보기 ↗</a></div>
<div class="inspect-inline"><button class="primary-btn" type="button" data-action="kit-insert-pack" id="kitPackAdd" hidden>6페이지 전체 추가</button><button class="inspect-action" type="button" data-action="kit-insert">선택 페이지 추가</button>''')
s=s.replace('<script src="./assets/page_kits.js" defer></script>','<script src="./assets/page_kits.js" defer></script>\n  <script src="./assets/pro_reports.js" defer></script>')
p.write_text(s,encoding='utf-8')
p=root/'assets/app.js';s=p.read_text(encoding='utf-8')
s=s.replace('KITS=root.DocutPageKits, P=', 'KITS=root.DocutPageKits, PRO=root.DocutProReports, P=')
s=s.replace('kitSelection:"executive",kitSnapshot:', 'kitSelection:"STR-01",kitPreviewIndex:0,kitSnapshot:')
s=s.replace("case 'kit-insert':insertKit();break;", "case 'kit-insert':insertKit();break;case 'kit-insert-pack':insertProfessionalPack();break;")
s=s.replace("function renderKits(){if(!KITS)return;", "function renderKits(){if(!KITS)return;")
start=s.index(' function renderKits(){');end=s.index(' function insertKit(){',start)
repl=''' function kitMiniPreview(pg){
  const safe=C.escapeHTML;
  return pg.elements.filter(b=>b.type!=='source').slice(0,13).map(b=>{const foreground=b.style?.color||'#304555';const kind=['bar','line','donut','table'].includes(b.type)?'chart':b.type;return `<i class="kit-preview-block kit-pro-${kind}" style="left:${(b.x/1280*100).toFixed(2)}%;top:${(b.y/720*100).toFixed(2)}%;width:${(b.w/1280*100).toFixed(2)}%;height:${(b.h/720*100).toFixed(2)}%;background:${['title','text'].includes(b.type)?safe(foreground):safe(b.style?.background||'#C3D4DE')}"></i>`;}).join('');
 }
 function renderKits(){if(!KITS)return;
  const snap=state.kitSnapshot||readKits(),book=snap.status==='ok'?snap.book:KITS.empty(),builtin=KITS.BUILTINS.map(v=>({...v,isLocal:false})),personal=book.templates.map(v=>({...v,ko:v.name,hint:'이 페이지의 구조·스타일만 보관됨',tone:'paper',isLocal:true}));
  const category=$('kitCategory').value,proMode=category.startsWith('pro'),personalOnly=category==='내 템플릿',q=String($('kitSearch').value||'').trim().toLocaleLowerCase(),colorChoice=$('kitPalette').value,safe=C.escapeHTML;
  const list=proMode?(PRO?.PACKS||[]).filter(p=>(category==='pro'||p.family===category.slice(4))):personalOnly?personal:builtin.filter(k=>category==='legacy'||k.category===category);
  const visible=list.filter(k=>!q||[k.name||'',k.ko||'',k.company||'',k.originalTitle||'',k.family||'',k.category||'',k.hint||''].join(' ').toLocaleLowerCase().includes(q));
  if(!visible.some(k=>k.id===state.kitSelection)){state.kitSelection=visible[0]?.id||'';state.kitPreviewIndex=0;}
  $('kitGallery').innerHTML=visible.length?visible.map(k=>{
   const pro=proMode,pg=pro?PRO.buildPage(k.id,0,colorChoice):k.isLocal?k:KITS.builtPage(k.id,colorChoice);
   const title=pro?k.company:k.ko,subtitle=pro?`${PRO.FAMILY_KO[k.family]} · 6페이지`:k.name+' · '+k.category;
   return `<button type="button" class="kit-choice ${pro?'pro-pack-choice':''} ${k.id===state.kitSelection?'selected':''}" data-kit-choice="${safe(k.id)}" aria-pressed="${k.id===state.kitSelection?'true':'false'}"><span class="kit-choice-swatch kit-choice-preview" style="background:${safe(pg.background||'#F7F7F4')}">${kitMiniPreview(pg)}</span><span><b>${safe(title)}</b><small>${safe(subtitle)}</small></span></button>`;
  }).join(''):'<p class="caption-small">검색에 맞는 레퍼런스가 없습니다.</p>';
  $('kitStorageStatus').textContent=snap.status==='ok'?`개인 템플릿 ${book.templates.length}/${KITS.MAX_KITS}개 · 이 기기에만 저장됩니다.`:'개인 템플릿 저장소 오류: '+snap.error;
  $('kitDamagedExport').hidden=snap.status!=='error'||!snap.raw;$('kitDamagedReset').hidden=snap.status!=='error'||!snap.raw;
  const chosen=visible.find(k=>k.id===state.kitSelection);const isPro=Boolean(chosen&&proMode);
  $('kitPackAdd').hidden=!isPro;$('kitPackPageStrip').hidden=!isPro;$('kitReferenceNote').hidden=!isPro;
  $('kitDialog').querySelector('[data-action=kit-insert]').disabled=!chosen;
  if(!chosen){$('kitPreviewCanvas').innerHTML='';$('kitPreviewTitle').textContent='레퍼런스를 선택하세요';$('kitDelete').hidden=true;return;}
  let pg;
  if(isPro){
   pg=PRO.buildPage(chosen.id,state.kitPreviewIndex,colorChoice);
   $('kitPackPageStrip').innerHTML=chosen.patterns.map((name,i)=>{const item=PRO.buildPage(chosen.id,i,colorChoice);return `<button type="button" class="kit-pack-page ${i===state.kitPreviewIndex?'active':''}" data-kit-page="${i}" aria-label="${i+1}페이지 ${safe(item.tab)}" aria-pressed="${i===state.kitPreviewIndex}"><span class="kit-pack-mini" style="background:${safe(item.background)}">${kitMiniPreview(item)}</span><b>${String(i+1).padStart(2,'0')}</b><span>${safe(item.tab)}</span></button>`;}).join('');
   $('kitReferenceEvidence').textContent=chosen.evidence==='official_index_only'?'공식 IR 자료 색인 확인 · 상세 페이지 검증 필요':'공개 원문을 참고한 독립 구성';
   const link=$('kitReferenceSource');link.href=/^https:\/\/[^\s"'<>]+$/i.test(chosen.source)?chosen.source:'#';link.textContent='공식 원본 보기 ↗';
   $('kitPreviewTitle').textContent=chosen.company+' · '+pg.tab;
   $('kitPreviewDescription').textContent=chosen.originalTitle+' · 원본 디자인 복제 아님';
   $('kitPreviewDetails').textContent=`전문 레이아웃 ${state.kitPreviewIndex+1}/6 · 편집 요소 ${pg.elements.length}개 · 수치/출처 미입력 · 기존 페이지 유지`;
  }else{
   pg=KITS.pageFromKit(chosen.isLocal?chosen:chosen.id,chosen.isLocal?'original':colorChoice);
   $('kitPreviewTitle').textContent=chosen.ko+' · '+chosen.name;
   $('kitPreviewDescription').textContent=chosen.hint+(chosen.isLocal?' · 개인 템플릿 색상 유지':colorChoice!=='original'?' · 컬러 팔레트 변경':'');
   $('kitPreviewDetails').textContent=`편집 요소 ${pg.elements.length}개 · 독립 신규 페이지 추가 · 기존 페이지 ${project.pages.length}장 유지`;
  }
  $('kitPreviewStage').style.background=pg.background||'#F7F7F4';$('kitPreviewCanvas').innerHTML=KITS.previewMarkup(pg);
  $('kitDelete').hidden=!chosen.isLocal;
 }
'''
s=s[:start]+repl+s[end:]
old=''' function insertKit(){if(!KITS)return;const key=state.kitSelection,snap=state.kitSnapshot||readKits();if(project.pages.length>=50)return toast('50페이지 한도를 초과해 키트 추가를 취소했습니다.');
  const template=KITS.BUILTINS.find(k=>k.id===key)||((snap.status==='ok'&&snap.book.templates.find(k=>k.id===key))||null);
  if(!template)return toast('선택한 템플릿을 다시 확인하세요.');
  let next;try{next=KITS.pageFromKit(template.id.startsWith('user-')?template:template.id,template.id.startsWith('user-')?'original':$('kitPalette').value);if(project.pages.some(p=>p.id===next.id))throw Error('Page identity collision');}catch(e){return toast('페이지 생성 취소: '+e.message);}
  if(!preMutationBackup('before inserting reusable page kit'))return;
  mutate(()=>{project.pages.splice(state.pageIndex+1,0,next);state.pageIndex++;state.selectedId=null;state.selectedIds.clear();});
  closeDialog('kitDialog');toast('기존 페이지를 유지하고 '+next.tab+' 템플릿을 새 페이지로 추가했습니다. 실제 수치·근거를 입력하세요.');
 }'''
new=''' function insertKit(){if(!KITS)return;const key=state.kitSelection,snap=state.kitSnapshot||readKits();if(project.pages.length>=50)return toast('50페이지 한도를 초과해 추가를 취소했습니다.');
  const pro=$('kitCategory').value.startsWith('pro')&&PRO?.find(key);
  const template=pro||KITS.BUILTINS.find(k=>k.id===key)||((snap.status==='ok'&&snap.book.templates.find(k=>k.id===key))||null);
  if(!template)return toast('선택한 레퍼런스를 확인하세요.');
  let next;try{next=pro?PRO.buildPage(key,state.kitPreviewIndex,$('kitPalette').value):KITS.pageFromKit(template.id.startsWith('user-')?template:template.id,template.id.startsWith('user-')?'original':$('kitPalette').value);if(project.pages.some(p=>p.id===next.id))throw Error('Page identity collision');}catch(e){return toast('페이지 생성 취소: '+e.message);}
  if(!preMutationBackup('before inserting report reference page'))return;
  mutate(()=>{next.groupId=page().groupId;project.pages.splice(state.pageIndex+1,0,next);state.pageIndex++;state.selectedId=null;state.selectedIds.clear();});writePageHash();
  closeDialog('kitDialog');toast('기존 페이지를 유지하고 '+next.tab+' 레이아웃을 추가했습니다. 실제 수치·근거를 입력하세요.');
 }
 function insertProfessionalPack(){const id=state.kitSelection,p=PRO?.find(id);
  if(!p||!$('kitCategory').value.startsWith('pro'))return toast('전문 보고서 팩을 먼저 선택하세요.');
  if(project.pages.length+6>50)return toast('6페이지 추가 시 최대 50페이지를 초과합니다. 기존 페이지를 정리하거나 낱장으로 추가하세요.');
  let pages;try{pages=PRO.buildPack(id,$('kitPalette').value);if(pages.length!==6||new Set(pages.map(x=>x.id)).size!==6)throw Error('페이지 구성 검증 실패');}catch(e){return toast('보고서 생성 취소: '+e.message);}
  if(!preMutationBackup('before inserting six-page professional report'))return;
  mutate(()=>{const groupId=page().groupId;pages.forEach(p=>p.groupId=groupId);project.pages.splice(state.pageIndex+1,0,...pages);state.pageIndex+=1;state.selectedId=null;state.selectedIds.clear();});writePageHash();
  closeDialog('kitDialog');toast(p.company+' 레퍼런스 기반 6페이지를 추가했습니다. 모든 차트·표 수치 및 근거를 입력하세요.');
 }'''
if old not in s:raise SystemExit('original insertKit text not found')
s=s.replace(old,new)
s=s.replace("const templateChoice=ev.target.closest('[data-kit-choice]');if(templateChoice){state.kitSelection=templateChoice.dataset.kitChoice;renderKits();return;}","const templateChoice=ev.target.closest('[data-kit-choice]');if(templateChoice){state.kitSelection=templateChoice.dataset.kitChoice;state.kitPreviewIndex=0;renderKits();return;}\n  const kitPage=ev.target.closest('[data-kit-page]');if(kitPage){state.kitPreviewIndex=Math.max(0,Math.min(5,Number(kitPage.dataset.kitPage)||0));renderKits();return;}")
p.write_text(s,encoding='utf-8')
p=root/'assets/styles.css';s=p.read_text(encoding='utf-8');s+='''
/* 0.33 · Professional report reference gallery (separate from legacy kits) */
.kit-ref-note{display:flex;gap:12px;align-items:center;justify-content:space-between;padding:9px 11px;border-top:1px solid #526271;margin:4px 0 12px;color:#b8c6d5;font-size:11px}
.kit-ref-note a{color:#bfdaf1;font-weight:700;text-decoration:underline;text-underline-offset:3px}
.kit-pack-pages{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;margin:8px 0 12px}
.kit-pack-page{min-width:0;border:1px solid #445467;background:#202a35;color:#c1cfda;border-radius:8px;cursor:pointer;padding:6px 5px 7px;text-align:left;display:flex;flex-direction:column;gap:3px}
.kit-pack-page:hover{border-color:#7a9bad}.kit-pack-page.active{border-color:#c6dfec;background:#31475a;box-shadow:0 0 0 1px #8cafc566}
.kit-pack-page b{font-size:11px;color:#dceaf6}.kit-pack-page>span:last-child{display:block;font-size:9px;line-height:1.3;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;width:100%}
.kit-pack-mini{display:block;position:relative;width:100%;aspect-ratio:16/9;border-radius:3px;overflow:hidden}
.kit-choice.pro-pack-choice b{font-size:13px}.kit-choice.pro-pack-choice.selected{outline-color:#98b6cc}
.kit-pro-title{opacity:.88!important;height:8%!important}.kit-pro-text{opacity:.4!important;height:4%!important}.kit-pro-chart{opacity:.5!important}
#kitPackAdd{min-width:158px}#kitPreviewDescription{overflow-wrap:anywhere}
@media(max-width:640px){.kit-pack-pages{display:flex;overflow:auto;gap:7px}.kit-pack-page{flex:0 0 102px}.kit-ref-note{flex-wrap:wrap}.kit-dialog .kit-preview-stage{padding:9px}}
'''
p.write_text(s,encoding='utf-8')
p=root/'assets/core_enhanced.js';s=p.read_text(encoding='utf-8').replace("C.VERSION='0.32.0-development'", "C.VERSION='0.33.0-development'");p.write_text(s,encoding='utf-8')
p=root/'package.json';s=p.read_text(encoding='utf-8').replace('0.32.0-development','0.33.0-development');p.write_text(s,encoding='utf-8')
print('updated')
