# DoCut Studio V0.21 · 다음 대화용 재개 체크포인트

## 프로젝트 식별 (타 프로젝트 혼용 금지)

- GitHub 대상 저장소: `https://github.com/neoflowcore/DoCut`
- 의도된 로컬 브랜치: `main`; 원격 저장소는 2026-11-04 재조회 시 빈 상태, GitHub App 쓰기 403이므로 **원격 동기화 완료로 간주 금지**.
- Vercel 현 서비스: `https://docut-studio.vercel.app` — 2026-11-04 조회에서 **0.15.0** (V0.21 배포 안 됨).
- 이전 복원 기준 V0.20: 트리 `52b7fc58d5a3c7f1c6bf7afe90d8709d54d43647`, 83 파일.

## 파일이 없을 때 복구 순서

1. 동일 프로젝트 개인 Library `/DoCut`의 `DoCut_V021_SOURCE_TRANSFER_20261104.txt` **전체 Git 패치**를 먼저 찾고, 보조 파일 `DoCut_V021_RESUME_RECEIPT_20261104.txt`, `DoCut_V021_INCREMENTAL_PATCH_20261104.txt`를 확인한다.
2. 빈 소스 폴더에서 `git init -b main` 실행 후 `git am <다운로드한-전체-소스-TXT-경로>`를 적용한다. `git status`, `git rev-parse HEAD^{tree}`, `git ls-files | wc -l`을 기록된 값과 비교한다.
3. 개발 범위/한계를 `docs/QUALITY_REVIEW_V021.md`, `docs/PHASE_0_21_STATUS.md`, `docs/REMAINING_V1_GAPS_V021.md`에서 읽는다.
4. GitHub 저장소·브랜치·쓰기 권한을 별도로 재조회한다. API 403 또는 빈 `main`이면 Push 성공 주장 금지.
5. 기존 사용자 승인 범위 내 소스 기능 개발과 수동 source QA를 수행한다. Actions 워크플로·설치 아티팩트·자동 빌드는 생성하지 않는다.

> Git format-patch replay 시 커미터 날짜가 달라질 수 있으므로 원래 Git 커밋 **객체 SHA**가 다르더라도 파일 추적 수와 **트리 해시** 일치를 복원 검증에 사용한다.

## 구현·검증 경계

- V0.21: 읽기 전용 한국어 보고서 논리/근거/레이아웃/접근성/모션 리뷰, 스토리맵·권고 질문, TXT/CSV 출력, 필터·이동·AI 검토 프롬프트, 독립 HTML 후보 경고 수.
- Node **208/208**, Chromium 독립 스위트 **141/141**, PPTX 메모리 2종 **통과**. `tools/check_source_v021.sh`는 사용자가 수동으로 실행할 수 있는 소스 전용 스크립트(실행 시 빌드/배포 없음)이며, 이번 결과는 각 스위트를 분리해서 수행했다.
- 화면은 Chromium 데스크톱/390px 합성 환경에서 확인. **실제 Windows/Android Brave, Office PPTX 편집/재저장, 89장 레퍼런스 디자인 정합률은 미검증**.
- 이전 고정 42/53=79.2%는 V1.0 완성률이 아니며, 최신 전체 완성률/디자인 일치율 미산정.
- 원격 업로드 오류가 지속되면 로컬 커밋·전체 TXT 패치를 보존하고 다음 작업 시 복원한다. 마지막 배포 URL은 구버전일 수 있으므로 매번 확인할 것.
