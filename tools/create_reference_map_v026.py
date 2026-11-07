import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
# The metadata (filename / categorization only) travels with the source; original JPEGs do not.
catalog=json.loads((root/'docs/REFERENCE_CATALOG_SOURCE_V026.json').read_text(encoding='utf-8'))
groups=catalog['referenceGroups']
assets=[{'index':x['index'],'filename':x['filename'],'group':x['group'],'description':x['description']} for x in catalog['screenshots']]
recommendations={
'charts':('preset','statistic','9종 통계차트·차트 표시','stat 요소에서만 추천 가능'),
'motion_pack_1':('preset','executive','차분한 설명형 등장','원본 다단계 형태 변환과는 다름'),
'ux_visual_styles':('palette','slate','UI 스타일의 대비·정보 위계','사진 RGB 일치 미검증'),
'ux_principles':('guide','', '사용성 원리','애니메이션 효과가 아닌 UX 참고'),
'menu_icons':('guide','', '메뉴·아이콘 체계','아이콘 라이선스 직접 사용 금지'),
'motion_basics':('preset','floating-card','기본 스케일·등장','모핑·글리치·파티클 일부 미구현'),
'motion_pack_2':('preset','camera-push','2.5D 장면 강조','유체·파티클·글로브 실제 시뮬레이션은 미구현'),
'landing_motions':('transition','reveal-center','랜딩 장면 전환','원본 키프레임/속도 미확보'),
'color_palettes':('palette','cobalt','9개 기존 색상군 적용','이미지별 정확한 색상 추출 자료 없음'),
'dashboard_reference':('layout','metrics','대시보드형 KPI 배치','원본 캡처 UI 복제 금지'),
'web_layouts':('layout','split','12개 기존 레이아웃 중 분할형','원본과 픽셀 동일한 배치 아님'),
'narrative_design':('preset','word-cascade','논리 중심 타이포그래피','원본 텍스트 이동 방식 미검증'),
'glass_dashboard':('palette','ambient','글라스형 앰비언트 배경','사진 RGB·블러 크기 일치 미검증'),
'feedback_patterns':('preset','soft-shine','편안한 시각 피드백','일부 UX 피드백은 개발 과제'),
'research_patterns':('guide','','정보 구조·연구 가이드','애니메이션 효과 아님'),
'video_tool_catalog':('guide','','영상·자산 분류 가이드','영상 인코더와 동영상 파일 출력은 범위 밖')
}
# Helpful per-image code mapping, but not visual fidelity claims.
per_index={
3:('preset','bars'),4:('preset','bars'),11:('preset','numbers'),16:('preset','share'),
23:('preset','floating-card'),24:('transition','wipe'),26:('preset','typing'),
30:('preset','tilt-depth'),32:('preset','trend'),36:('preset','numbers'),41:('preset','word-cascade'),
45:('transition','reveal-center'),46:('transition','reveal-center'),
50:('preset','numbers'),51:('preset','numbers'),52:('preset','numbers'),
53:('layout','quadrant'),55:('preset','trend'),56:('preset','trend'),
57:('layout','comparison'),59:('layout','comparison'),
71:('layout','metrics'),72:('layout','metrics'),73:('layout','metrics'),74:('layout','metrics'),
75:('layout','split'),78:('preset','share'),79:('preset','bars'),
80:('preset','word-cascade'),81:('preset','word-cascade'),82:('layout','portrait'),
83:('palette','ambient')
}
palettes=['wood','consulting','quarterly','ambient','editorial','slate','mint','bronze','cobalt']
for i in range(62,71):per_index[i]=('palette',palettes[i-62])
for a in assets:
 group_kind,group_target,desc,note=recommendations[a['group']]
 kind,target=per_index.get(a['index'],(group_kind,group_target))
 if a['description'].lower().find('duplicate')!=-1:
  status='duplicate-example'
 elif kind=='guide':status='reference-only'
 elif a['index'] in (3,4,11,16,23,24,26,30,32,36,41,45,46,50,51,52,53,55,56,57,59,71,72,73,74,75,78,79,80,81,82,83) or 62<=a['index']<=70:
  status='approximate-implemented-family'
 else:status='inspiration-not-frame-matched'
 a.update({'kind':kind,'target':target,'status':status})
for g in groups:
 kind,target,title,note=recommendations[g['id']]
 g.update({'operation':kind,'target':target,'note':note,'summary':title})
assert len(assets)==89 and sum(g['images'] for g in groups)==89
# No screenshots or copyrighted asset payloads are bundled; descriptions only.
data={'schema':'docut-reference-map-v026','source':'Previously analyzed 89 JPEG screenshot filenames/descriptions only. Original image bytes unavailable.','groups':groups,'items':assets}
js='''/* DoCut V0.26: metadata mapping for 89 reference screenshots; no image assets bundled. */\n(function(root){\n'use strict';\nconst DATA='''+json.dumps(data,ensure_ascii=False,separators=(',',':'))+''';\nfunction group(id){return DATA.groups.find(x=>x.id===id)||null;}\nfunction item(index){return DATA.items.find(x=>x.index===Number(index))||null;}\nconst api={DATA,group,item};root.DocutReferenceMap=api;\nif(typeof module!=='undefined'&&module.exports)module.exports=api;\n})(typeof globalThis!=='undefined'?globalThis:this);\n'''
(root/'assets/reference_map.js').write_text(js)
rows=['# DoCut 효과 레퍼런스 89장 → 현재 기능 매핑 (V0.26)','', '> 데이터 기준: 같은 프로젝트에서 작성한 `effect_reference_catalog(2).json`의 89개 JPEG **파일명·설명**. 실제 89장 JPEG 비트맵, 원본 영상, 전환 프레임·시간 정보는 이 개발본에 없음. 따라서 아래는 **카테고리/개념 매핑**이지 이미지 동일성 인증이 아니다.','', '## 그룹별 기능 적용', '', '| 그룹 | 자료 수 | 현재 연결 | 한계 |','|---|---:|---|---|']
for g in groups:
 rows.append(f"| {g['title']} (`{g['id']}`) | {g['images']} | {g['summary']} · `{g['operation']}:{g['target']}` | {g['note']} |")
rows +=['','## 이미지별 대응표','','상태 `approximate-implemented-family`는 **같은 개념의 동작/스타일이 구현됨**을 뜻하며 원본 화면과 프레임 동일성을 보증하지 않는다. `inspiration-not-frame-matched`는 전용 동작 미구현 또는 카테고리 수준 참고, `duplicate-example`는 유사/중복 컷, `reference-only`는 기능보다 가이드 성격이다.','', '| 인덱스 | 이미지 파일명 | 기존 분류·설명 | 코드 연결 | 상태 |','|---:|---|---|---|---|']
for x in assets:
 rows.append(f"| {x['index']:02d} | `{x['filename']}` | {x['group']} · {x['description'].replace('|','/')} | `{x['kind']}:{x['target']}` | {x['status']} |")
rows+=['','## 구현 경계','', '- 원본 촬영/스크린샷 89개를 번들하거나 복제하지 않는다. 파일명과 설명은 차트/모션/레이아웃/UX 분류에만 사용한다.', '- 원본 영상이 없으므로 출현 속도/전환 곡선/프레임 조합은 **독자 설계 값**이다. 실제 시각 비교 및 픽셀 일치율은 미측정.', '- `guide` 항목은 실행 버튼을 제공하지 않으며 콘텐츠/색상 데이터를 바꾸지 않는다.', '- `preset`은 최대 3중 효과·잠금 제한·Undo, `transition`은 페이지 필드·Undo, `palette`는 테마·Undo, `layout`은 콘텐츠 보존 조건의 레이아웃 적용으로 연결한다.', '- 모션 실재와 시각 참조 정합성은 별도 승인 기준이며 합성 Chromium 테스트만으로 실제 기기 PASS를 주장하지 않는다.', '']
(root/'docs/REFERENCE_89_MAPPING_V026.md').write_text('\n'.join(rows))
print('reference groups',len(groups),'individual screenshot mappings',len(assets))
