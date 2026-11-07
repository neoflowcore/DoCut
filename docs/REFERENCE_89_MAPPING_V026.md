# DoCut 효과 레퍼런스 89장 → 현재 기능 매핑 (V0.26)

> 데이터 기준: 같은 프로젝트에서 작성한 `effect_reference_catalog(2).json`의 89개 JPEG **파일명·설명**. 실제 89장 JPEG 비트맵, 원본 영상, 전환 프레임·시간 정보는 이 개발본에 없음. 따라서 아래는 **카테고리/개념 매핑**이지 이미지 동일성 인증이 아니다.

## 그룹별 기능 적용

| 그룹 | 자료 수 | 현재 연결 | 한계 |
|---|---:|---|---|
| 통계 차트 비교 (`charts`) | 2 | 9종 통계차트·차트 표시 · `preset:statistic` | stat 요소에서만 추천 가능 |
| 인터랙션 사례 모음 A (`motion_pack_1`) | 18 | 차분한 설명형 등장 · `preset:executive` | 원본 다단계 형태 변환과는 다름 |
| UI 시각 스타일 (`ux_visual_styles`) | 1 | UI 스타일의 대비·정보 위계 · `palette:slate` | 사진 RGB 일치 미검증 |
| UX 선택/인지 원리 (`ux_principles`) | 1 | 사용성 원리 · `guide:` | 애니메이션 효과가 아닌 UX 참고 |
| UI 메뉴 아이콘 분류 (`menu_icons`) | 1 | 메뉴·아이콘 체계 · `guide:` | 아이콘 라이선스 직접 사용 금지 |
| 14가지 모션 그래픽 기초 (`motion_basics`) | 4 | 기본 스케일·등장 · `preset:floating-card` | 모핑·글리치·파티클 일부 미구현 |
| 모션 그래픽 사례 모음 B (`motion_pack_2`) | 17 | 2.5D 장면 강조 · `preset:camera-push` | 유체·파티클·글로브 실제 시뮬레이션은 미구현 |
| 랜딩페이지 모션 프리셋 (`landing_motions`) | 18 | 랜딩 장면 전환 · `transition:reveal-center` | 원본 키프레임/속도 미확보 |
| 9종 컬러 팔레트 (`color_palettes`) | 9 | 9개 기존 색상군 적용 · `palette:cobalt` | 이미지별 정확한 색상 추출 자료 없음 |
| 대시보드 레이아웃 (`dashboard_reference`) | 4 | 대시보드형 KPI 배치 · `layout:metrics` | 원본 캡처 UI 복제 금지 |
| 12개 웹 레이아웃 패턴 (`web_layouts`) | 1 | 12개 기존 레이아웃 중 분할형 · `layout:split` | 원본과 픽셀 동일한 배치 아님 |
| 한국어 정보디자인·타이포그래피 (`narrative_design`) | 7 | 논리 중심 타이포그래피 · `preset:word-cascade` | 원본 텍스트 이동 방식 미검증 |
| 글래스 대시보드 (`glass_dashboard`) | 1 | 글라스형 앰비언트 배경 · `palette:ambient` | 사진 RGB·블러 크기 일치 미검증 |
| 9종 사용자 피드백 패턴 (`feedback_patterns`) | 1 | 편안한 시각 피드백 · `preset:soft-shine` | 일부 UX 피드백은 개발 과제 |
| 9종 UX 리서치 방법 (`research_patterns`) | 1 | 정보 구조·연구 가이드 · `guide:` | 애니메이션 효과 아님 |
| 영상 도구 목록 (`video_tool_catalog`) | 3 | 영상·자산 분류 가이드 · `guide:` | 영상 인코더와 동영상 파일 출력은 범위 밖 |

## 이미지별 대응표

상태 `approximate-implemented-family`는 **같은 개념의 동작/스타일이 구현됨**을 뜻하며 원본 화면과 프레임 동일성을 보증하지 않는다. `inspiration-not-frame-matched`는 전용 동작 미구현 또는 카테고리 수준 참고, `duplicate-example`는 유사/중복 컷, `reference-only`는 기능보다 가이드 성격이다.

| 인덱스 | 이미지 파일명 | 기존 분류·설명 | 코드 연결 | 상태 |
|---:|---|---|---|---|
| 00 | `Screenshot_20261104_041114_Gallery.jpg` | charts · 9 statistical charts infographic | `preset:statistic` | inspiration-not-frame-matched |
| 01 | `Screenshot_20261104_041119_Gallery.jpg` | charts · 9 statistical charts infographic (alternate screenshot) | `preset:statistic` | inspiration-not-frame-matched |
| 02 | `Screenshot_20261104_041225_Gallery.jpg` | motion_pack_1 · motion pack A cover | `preset:executive` | inspiration-not-frame-matched |
| 03 | `Screenshot_20261104_041230_Gallery.jpg` | motion_pack_1 · Bars to trend | `preset:bars` | approximate-implemented-family |
| 04 | `Screenshot_20261104_041232_Gallery.jpg` | motion_pack_1 · Bars to trend (duplicate) | `preset:bars` | duplicate-example |
| 05 | `Screenshot_20261104_041235_Gallery.jpg` | motion_pack_1 · Monthly to yearly | `preset:executive` | inspiration-not-frame-matched |
| 06 | `Screenshot_20261104_041237_Gallery.jpg` | motion_pack_1 · Dots to logo | `preset:executive` | inspiration-not-frame-matched |
| 07 | `Screenshot_20261104_041240_Gallery.jpg` | motion_pack_1 · Island to live | `preset:executive` | inspiration-not-frame-matched |
| 08 | `Screenshot_20261104_041242_Gallery.jpg` | motion_pack_1 · Visits to sales | `preset:executive` | inspiration-not-frame-matched |
| 09 | `Screenshot_20261104_041245_Gallery.jpg` | motion_pack_1 · Click to done | `preset:executive` | inspiration-not-frame-matched |
| 10 | `Screenshot_20261104_041247_Gallery.jpg` | motion_pack_1 · Card to paid | `preset:executive` | inspiration-not-frame-matched |
| 11 | `Screenshot_20261104_041249_Gallery.jpg` | motion_pack_1 · Number count 0 to 12,480 | `preset:numbers` | approximate-implemented-family |
| 12 | `Screenshot_20261104_041252_Gallery.jpg` | motion_pack_1 · Weight to bold | `preset:executive` | inspiration-not-frame-matched |
| 13 | `Screenshot_20261104_041254_Gallery.jpg` | motion_pack_1 · Sketch to app | `preset:executive` | inspiration-not-frame-matched |
| 14 | `Screenshot_20261104_041257_Gallery.jpg` | motion_pack_1 · Drag to booked | `preset:executive` | inspiration-not-frame-matched |
| 15 | `Screenshot_20261104_041259_Gallery.jpg` | motion_pack_1 · Alerts to stack | `preset:executive` | inspiration-not-frame-matched |
| 16 | `Screenshot_20261104_041303_Gallery.jpg` | motion_pack_1 · Rings to closed | `preset:share` | approximate-implemented-family |
| 17 | `Screenshot_20261104_041305_Gallery.jpg` | motion_pack_1 · Dock to open | `preset:executive` | inspiration-not-frame-matched |
| 18 | `Screenshot_20261104_041307_Gallery.jpg` | motion_pack_1 · Card to 360 degrees | `preset:executive` | inspiration-not-frame-matched |
| 19 | `Screenshot_20261104_041309_Gallery.jpg` | motion_pack_1 · Map to route | `preset:executive` | inspiration-not-frame-matched |
| 20 | `Screenshot_20261104_041314_Gallery.jpg` | ux_visual_styles · 9 UI styles | `palette:slate` | inspiration-not-frame-matched |
| 21 | `Screenshot_20261104_041320_Gallery.jpg` | ux_principles · 9 decision principles | `guide:` | reference-only |
| 22 | `Screenshot_20261104_041326_Gallery.jpg` | menu_icons · 9 menu icon patterns | `guide:` | reference-only |
| 23 | `Screenshot_20261104_041330_Gallery.jpg` | motion_basics · Squash and stretch; Bounce; Text scramble; Morphing | `preset:floating-card` | approximate-implemented-family |
| 24 | `Screenshot_20261104_041332_Gallery.jpg` | motion_basics · Scale; Slide; In/Out; Wipe | `transition:wipe` | approximate-implemented-family |
| 25 | `Screenshot_20261104_041334_Gallery.jpg` | motion_basics · Linear; Ease in-out | `preset:floating-card` | inspiration-not-frame-matched |
| 26 | `Screenshot_20261104_041337_Gallery.jpg` | motion_basics · Typewriter; Glitch; Particles; Dissolve | `preset:typing` | approximate-implemented-family |
| 27 | `Screenshot_20261104_041341_Gallery.jpg` | motion_pack_2 · motion pack B cover | `preset:camera-push` | inspiration-not-frame-matched |
| 28 | `Screenshot_20261104_041344_Gallery.jpg` | motion_pack_2 · Particles to logo | `preset:camera-push` | inspiration-not-frame-matched |
| 29 | `Screenshot_20261104_041346_Gallery.jpg` | motion_pack_2 · Gradient to flow | `preset:camera-push` | inspiration-not-frame-matched |
| 30 | `Screenshot_20261104_041348_Gallery.jpg` | motion_pack_2 · Glass to tilt | `preset:tilt-depth` | approximate-implemented-family |
| 31 | `Screenshot_20261104_041350_Gallery.jpg` | motion_pack_2 · Globe to arcs | `preset:camera-push` | inspiration-not-frame-matched |
| 32 | `Screenshot_20261104_041352_Gallery.jpg` | motion_pack_2 · Line to draw | `preset:trend` | approximate-implemented-family |
| 33 | `Screenshot_20261104_041355_Gallery.jpg` | motion_pack_2 · Shape to morph | `preset:camera-push` | inspiration-not-frame-matched |
| 34 | `Screenshot_20261104_041357_Gallery.jpg` | motion_pack_2 · Grid to wave | `preset:camera-push` | inspiration-not-frame-matched |
| 35 | `Screenshot_20261104_041359_Gallery.jpg` | motion_pack_2 · Cards to shuffle | `preset:camera-push` | inspiration-not-frame-matched |
| 36 | `Screenshot_20261104_041401_Gallery.jpg` | motion_pack_2 · Number to roll | `preset:numbers` | approximate-implemented-family |
| 37 | `Screenshot_20261104_041403_Gallery.jpg` | motion_pack_2 · Ribbon to twist | `preset:camera-push` | inspiration-not-frame-matched |
| 38 | `Screenshot_20261104_041406_Gallery.jpg` | motion_pack_2 · Liquid to merge | `preset:camera-push` | inspiration-not-frame-matched |
| 39 | `Screenshot_20261104_041409_Gallery.jpg` | motion_pack_2 · Phone to explode | `preset:camera-push` | inspiration-not-frame-matched |
| 40 | `Screenshot_20261104_041411_Gallery.jpg` | motion_pack_2 · Rings to orbit | `preset:camera-push` | inspiration-not-frame-matched |
| 41 | `Screenshot_20261104_041415_Gallery.jpg` | motion_pack_2 · Words to kinetic | `preset:word-cascade` | approximate-implemented-family |
| 42 | `Screenshot_20261104_041419_Gallery.jpg` | motion_pack_2 · Button to pay | `preset:camera-push` | inspiration-not-frame-matched |
| 43 | `Screenshot_20261104_041421_Gallery.jpg` | motion_pack_2 · Confetti to burst | `preset:camera-push` | inspiration-not-frame-matched |
| 44 | `Screenshot_20261104_041426_Gallery.jpg` | landing_motions · Landing Page Motion Pack cover | `transition:reveal-center` | inspiration-not-frame-matched |
| 45 | `Screenshot_20261104_041428_Gallery.jpg` | landing_motions · Hero reveal (before) | `transition:reveal-center` | approximate-implemented-family |
| 46 | `Screenshot_20261104_041431_Gallery.jpg` | landing_motions · Hero reveal (after) | `transition:reveal-center` | approximate-implemented-family |
| 47 | `Screenshot_20261104_041433_Gallery.jpg` | landing_motions · Word rotator | `transition:reveal-center` | inspiration-not-frame-matched |
| 48 | `Screenshot_20261104_041435_Gallery.jpg` | landing_motions · Sale pings | `transition:reveal-center` | inspiration-not-frame-matched |
| 49 | `Screenshot_20261104_041438_Gallery.jpg` | landing_motions · Review shuffle | `transition:reveal-center` | inspiration-not-frame-matched |
| 50 | `Screenshot_20261104_041440_Gallery.jpg` | landing_motions · Count-up stats (start) | `preset:numbers` | approximate-implemented-family |
| 51 | `Screenshot_20261104_041443_Gallery.jpg` | landing_motions · Count-up stats (start duplicate) | `preset:numbers` | duplicate-example |
| 52 | `Screenshot_20261104_041445_Gallery.jpg` | landing_motions · Count-up stats (finish) | `preset:numbers` | approximate-implemented-family |
| 53 | `Screenshot_20261104_041447_Gallery.jpg` | landing_motions · Bento build | `layout:quadrant` | approximate-implemented-family |
| 54 | `Screenshot_20261104_041450_Gallery.jpg` | landing_motions · Cursor tour | `transition:reveal-center` | inspiration-not-frame-matched |
| 55 | `Screenshot_20261104_041452_Gallery.jpg` | landing_motions · Process draw (before) | `preset:trend` | approximate-implemented-family |
| 56 | `Screenshot_20261104_041455_Gallery.jpg` | landing_motions · Process draw (after) | `preset:trend` | approximate-implemented-family |
| 57 | `Screenshot_20261104_041457_Gallery.jpg` | landing_motions · Before/after compare | `layout:comparison` | approximate-implemented-family |
| 58 | `Screenshot_20261104_041459_Gallery.jpg` | landing_motions · Price roll | `transition:reveal-center` | inspiration-not-frame-matched |
| 59 | `Screenshot_20261104_041502_Gallery.jpg` | landing_motions · Us vs them comparison | `layout:comparison` | approximate-implemented-family |
| 60 | `Screenshot_20261104_041504_Gallery.jpg` | landing_motions · Click to success | `transition:reveal-center` | inspiration-not-frame-matched |
| 61 | `Screenshot_20261104_041507_Gallery.jpg` | landing_motions · Motion pack outro / call to action | `transition:reveal-center` | inspiration-not-frame-matched |
| 62 | `Screenshot_20261104_041510_Gallery.jpg` | color_palettes · Color palette 1 of 9 | `palette:wood` | approximate-implemented-family |
| 63 | `Screenshot_20261104_041512_Gallery.jpg` | color_palettes · Color palette 2 of 9 | `palette:consulting` | approximate-implemented-family |
| 64 | `Screenshot_20261104_041514_Gallery.jpg` | color_palettes · Color palette 3 of 9 | `palette:quarterly` | approximate-implemented-family |
| 65 | `Screenshot_20261104_041516_Gallery.jpg` | color_palettes · Color palette 4 of 9 | `palette:ambient` | approximate-implemented-family |
| 66 | `Screenshot_20261104_041518_Gallery.jpg` | color_palettes · Color palette 5 of 9 | `palette:editorial` | approximate-implemented-family |
| 67 | `Screenshot_20261104_041520_Gallery.jpg` | color_palettes · Color palette 6 of 9 | `palette:slate` | approximate-implemented-family |
| 68 | `Screenshot_20261104_041522_Gallery.jpg` | color_palettes · Color palette 7 of 9 | `palette:mint` | approximate-implemented-family |
| 69 | `Screenshot_20261104_041524_Gallery.jpg` | color_palettes · Color palette 8 of 9 | `palette:bronze` | approximate-implemented-family |
| 70 | `Screenshot_20261104_041526_Gallery.jpg` | color_palettes · Color palette 9 of 9 | `palette:cobalt` | approximate-implemented-family |
| 71 | `Screenshot_20261104_041529_Gallery.jpg` | dashboard_reference · Wallet dashboard reference | `layout:metrics` | approximate-implemented-family |
| 72 | `Screenshot_20261104_041531_Gallery.jpg` | dashboard_reference · Wallet dashboard detail | `layout:metrics` | approximate-implemented-family |
| 73 | `Screenshot_20261104_041533_Gallery.jpg` | dashboard_reference · Wallet dashboard alternate | `layout:metrics` | approximate-implemented-family |
| 74 | `Screenshot_20261104_041536_Gallery.jpg` | dashboard_reference · Wallet dashboard perspective | `layout:metrics` | approximate-implemented-family |
| 75 | `Screenshot_20261104_041540_Gallery.jpg` | web_layouts · 12 layout patterns | `layout:split` | approximate-implemented-family |
| 76 | `Screenshot_20261104_041544_Gallery.jpg` | narrative_design · Builder note case study | `preset:word-cascade` | inspiration-not-frame-matched |
| 77 | `Screenshot_20261104_041546_Gallery.jpg` | narrative_design · Preference sorting case study | `preset:word-cascade` | inspiration-not-frame-matched |
| 78 | `Screenshot_20261104_041548_Gallery.jpg` | narrative_design · Progress ring case study | `preset:share` | approximate-implemented-family |
| 79 | `Screenshot_20261104_041551_Gallery.jpg` | narrative_design · Rank changing chart case study | `preset:bars` | approximate-implemented-family |
| 80 | `Screenshot_20261104_041553_Gallery.jpg` | narrative_design · Bold slogan typography | `preset:word-cascade` | approximate-implemented-family |
| 81 | `Screenshot_20261104_041556_Gallery.jpg` | narrative_design · Kinetic headline typography | `preset:word-cascade` | approximate-implemented-family |
| 82 | `Screenshot_20261104_041559_Gallery.jpg` | narrative_design · Annotated editorial case study | `layout:portrait` | approximate-implemented-family |
| 83 | `Screenshot_20261104_041603_Gallery.jpg` | glass_dashboard · Glassy Dashboard | `palette:ambient` | approximate-implemented-family |
| 84 | `Screenshot_20261104_041606_Gallery.jpg` | feedback_patterns · 9 feedback patterns | `preset:soft-shine` | inspiration-not-frame-matched |
| 85 | `Screenshot_20261104_041609_Gallery.jpg` | research_patterns · 9 research methods | `guide:` | reference-only |
| 86 | `Screenshot_20261104_041615_Gallery.jpg` | video_tool_catalog · video editing types | `guide:` | reference-only |
| 87 | `Screenshot_20261104_041617_Gallery.jpg` | video_tool_catalog · animation & motion graphics types | `guide:` | reference-only |
| 88 | `Screenshot_20261104_041619_Gallery.jpg` | video_tool_catalog · visual effects and asset types | `guide:` | reference-only |

## 구현 경계

- 원본 촬영/스크린샷 89개를 번들하거나 복제하지 않는다. 파일명과 설명은 차트/모션/레이아웃/UX 분류에만 사용한다.
- 원본 영상이 없으므로 출현 속도/전환 곡선/프레임 조합은 **독자 설계 값**이다. 실제 시각 비교 및 픽셀 일치율은 미측정.
- `guide` 항목은 실행 버튼을 제공하지 않으며 콘텐츠/색상 데이터를 바꾸지 않는다.
- `preset`은 최대 3중 효과·잠금 제한·Undo, `transition`은 페이지 필드·Undo, `palette`는 테마·Undo, `layout`은 콘텐츠 보존 조건의 레이아웃 적용으로 연결한다.
- 모션 실재와 시각 참조 정합성은 별도 승인 기준이며 합성 Chromium 테스트만으로 실제 기기 PASS를 주장하지 않는다.
