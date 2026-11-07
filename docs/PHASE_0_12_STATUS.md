# DoCut Studio V0.12.0 · 개발 체크포인트

**기준일:** 2026-11-02 (KST). 로컬 코드·자동테스트 기준. 사용자 실제 기기 수기검증은 아직 보류 중.

## 1. 이전 체크포인트 복원

- V0.11.0 로컬 `main` 단일 커밋 `16d8ddc`을 출발점으로 사용. `docs/PHASE_0_11_STATUS.md`는 이전 증거 문서로 보존.
- GitHub `neoflowcore/DoCut`의 저장소 및 브랜치 목록 조회 결과: 원격은 파일·브랜치가 없는 빈 저장소로 확인.
- 원격 코드 쓰기는 이전 `403 Resource not accessible by integration`, 직접 Push는 DNS/접속 오류. 업로드 성공 여부는 실제 결과로만 판단.

## 2. V0.12.0 새 구현

1. **시각적 이징 그래프:** cubic-bezier 제어점 2개를 드래그하거나 방향키로 편집, 6개 프리셋, 숫자 편집, 커브 경로 및 시각적 진행률 슬라이더. Undo 시 원래 제어점 복원.
2. **타임라인 중간 키프레임:** 마커를 끌어 시간축 좌표 변경, Arrow/Shift+Arrow 지원, 드래그마다 Undo 한 번과 최종 모델 정렬.
3. **일반 HTML 정적 CSS 가져오기:** 내장 `<style>` 내 안전한 정적 CSS만 추출. class/id/자손 선택자, 기본 specificity, inline override, 선언된 폭·높이·좌표·글꼴·색·모서리·불투명도, `:root` 변수와 상속 텍스트 스타일, 슬라이드 바탕색.
4. **서식이 포함된 HTML 콘텐츠:** 강한 강조·기울임·밑줄·색상 마크를 DoCut의 허용된 부분서식으로 변환. `<table>`은 편집 가능 셀과 셀별 스타일로 보존.
5. **변환 신뢰 경계:** 외부 CSS/JavaScript, SVG/Canvas, Grid/Flex, 원격 이미지, CSS gradient/filter/transform과 반투명 RGBA 등 오차 가능성을 사용자에게 안내. 가져온 HTML은 실행하지 않음.
6. **모바일 속성 닫기:** 390×844 환경에서 속성 오버레이에 닫기 버튼을 노출하고 Esc 키로 종료. 데스크톱 표시에는 영향 없음.

## 3. 실제 자동 검증 결과

- `npm test`: **73 tests / 73 passed** (Node 내장 테스트 러너).
- 브라우저 11개 테스트 스위트: 기본, 고급, 콘텐츠 품질, 모션/미디어, 가져오기, 페이지 병합, 레이아웃(80장), 워크플로, 프리셋, 마스터/로고, 베지어/CSS — 각각 PASS.
- 최종 V0.12.0 소스 기준 `npm run test:browser` 수동 실행에서 브라우저 11개 스위트 **동일 배치 11/11 PASS**. 스위트는 2개의 격리 워커에서 독립적으로 실행되며 Actions/CI를 사용하지 않음.
- 기기 수기검증: Windows Brave **미실시**, Android Brave **미실시**, 실제 PowerPoint 파일 열기 **미실시**.

## 4. 수용 기준·미완료

- `docs/ACCEPTANCE_MATRIX.md`의 기존 60개 기준: **53/60 = 88.3%**. P0 5/6, P1 12/13, P2 11/11, P3 8/9, P4 9/11, P5 8/10.
- 이 비율은 V1.0 전체 제품 완성도·UX 합격률·디자인 초안 일치율이 아님. 기준 시안이 없어 디자인 일치율 **미산정**.
- 남은 7개 기준에는 GitHub 원격 Push, 타사 HTML 원형 1:1 재편집, 픽셀 기준 디자인 검증, 실제 PPTX 열기, Windows/Android Brave 수기 검증이 포함됨.

## 5. 운영 원칙

- 사용자 검증 요청 전까지 EXE·APK·ZIP·설치파일·릴리스 빌드·자동 Actions 실행 금지.
- 소스·테스트·문서만 최소 Git 커밋으로 묶고, 원격 Push는 실제 확인 가능한 성공 이후에만 완료라고 보고.
- 수기 검증 절차는 `docs/MANUAL_QA.md`에만 사전 기록하며 지금 사용자에게 수행을 요구하지 않음.

## 6. 추가 마감 개선

- 외부 HTML의 인쇄 단위 `pt/mm/cm`, 테두리, 그림자 흐림 정도, `<div>` 단독 설명 문장을 편집 가능 콘텐츠로 매핑.
- 시각적 베지어 그래프에 진행률 슬라이더를 추가하고 속성 패널 내부 불필요한 문자 노출 버그를 제거.
- 접근성: 모바일 속성 패널 내부 닫기 버튼, `Esc`, ARIA expanded/slider 값, 터치 제어점 면적 확대.
- 최종 브라우저 일괄 검증은 `npm run test:browser`의 수동 로컬 2워커 러너로 전체 **11/11 PASS**, Node **73/73 PASS**. 설치/Actions/릴리스 아티팩트 생성 없음.

## 7. Final integration notes

- Static CSS `var(--name, fallback)` values are now resolved using the same non-executing allowlist as other static declarations; unsupported functions remain rejected.
- Final local Node runner: **73/73 passed**. Final manually invoked isolated Chromium runner: **11/11 suites passed**.
- Remote GitHub `neoflowcore/DoCut` still has no populated branch; both direct Push (DNS failure) and connector Git-data write (403) failed. See `GITHUB_SYNC_BLOCKER.md`.
- See `RESUME_CHECKPOINT.md` for source inventory, test commands and next safe development actions.
