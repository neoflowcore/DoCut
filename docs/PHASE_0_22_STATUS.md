# DoCut V0.22 · 선택형 AI 변경 검토 개발 상태

- 복원 기준: DoCut V0.21 `main` 커밋 `8e3ce398dbf556e6d776685224dce5ed3ac6f11b`, 트리 `6e695a524ec1ffab6513e80032f68f540cb57e4f` (91 추적 파일).
- 대상 저장소: https://github.com/neoflowcore/DoCut (원격 저장소 빈 상태; 원격 main 없음; GitHub App 쓰기 403 이력).
- 배포 기준: https://docut-studio.vercel.app 는 V0.15.0으로 확인되어 V0.22가 배포되지 않았다.
- 기능 범위: 페이지·요소·공통 설정별 AI 제안 diff, 변경 전후·수치·근거, 잠금 보호, 신규 수치/삭제 수치/신규 출처를 포함한 이중 승인, 미승인 요소 보존, 삭제/추가/수정, 스냅샷 불일치 차단, 검토 TXT 및 모바일 모달.
- 기존 53개 인수 기준 42/53=79.2%는 **V0.15의 과거 기록**이며 V1.0 전체 완성률을 나타내지 않는다.
- V1.0 전체 완성률: 미산정. 89장 시각 레퍼런스 일치율: 미산정.
- 실기검증: Windows Brave / Android Brave / PowerPoint 미실시. 소스 자동검사만 실시.

검사 결과 및 Git 해시는 최종 검사와 단일 커밋 이후 `RESUME_CHECKPOINT_V022.md` 및 `DoCut_V022_RESUME_RECEIPT_20261104.txt`에 기록한다.

## Final V0.22 grouped source-only QA (2026-11-04)

- JS syntax: PASS.
- Node: 261/261 PASS; V0.22 focused proposal 53/53 PASS.
- Chromium: **176/176** individual scenarios PASS in separated suites (14+11+12+15+14+13+16+12+15+19+35). The full V0.22 scenario suite was divided into groups of 15+7+13 after runner execution limits; no uninterrupted single-run pass is claimed.
- PPTX native editable-shape serialization memory scripts: 2/2 PASS; no actual PowerPoint file written.
- Additional protections: per-page and per-setting numeric claim detection, exact-scope consent reset, 22-element incremental review disclosure, inert full-text previews, rich-text string mismatch rejection, candidate tamper rejection, locked/hidden state protection, before-change backup or explicit downloaded JSON fallback.
- Older synthetic browser tests were updated to use the same rescue JSON export step when `localStorage` is unavailable; source behavior was not weakened to satisfy old test expectations.
- Real Windows/Android Brave device and MS PowerPoint testing remain unperformed; all 89 image-reference design-match percentages and overall V1.0 completion remain unmeasured.
- Remote GitHub sync is blocked (HTTP 403 Contents permission), remote `main` empty; old Vercel V0.15.0 remains production. All added tests are source-only and no CI/build/release artifact was generated.
