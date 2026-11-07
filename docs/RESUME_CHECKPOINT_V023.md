# V0.23 복원 체크포인트 (소스 커밋·검증 기준)

## 이 프로젝트 식별

- Repository: https://github.com/neoflowcore/DoCut
- Intended branch: main. GitHub 원격 연결 상태는 재개 시 실시간 조회한다.
- Existing deployment: https://docut-studio.vercel.app. 신규 배포 없이 이전 V0.15.0이 남아 있을 수 있으므로 실시간 페이지 표시 버전을 검사한다.
- Previous full source: `DoCut_V022_SOURCE_TRANSFER_20261104.txt` (~1.79 MB, format-patch).
- Working tree: `/mnt/data/docut-v022` V0.22에서 V0.23까지 연속 개발. 로컬 임시 디렉터리는 영속 보존을 보장하지 않는다.
- New work: `assets/review_board.js`, `assets/core_enhanced.js` 모델·ID 리매핑, `assets/app.js` 검토 UI, `assets/export.js` 비공개 필터링, `index.html`, `assets/styles.css`, Node/Chromium tests, docs.

## 복원 절차

Library `/DoCut` 또는 동일 프로젝트 대화에서 `DoCut_V023_SOURCE_TRANSFER_20261104.txt`를 내려받는다. 해당 TXT는 설치 파일이 아니라 `git format-patch --stdout` 형식이며, 깨끗한 빈 Git 디렉터리에서 `git init -b main` → `git am <file>` 적용 후 실제 Git 트리 해시·테스트를 확인한다. V0.22 소스가 있으면 V0.23 증분 TXT만 `git am`으로 적용할 수 있다.

## 최종 자동검사 기록

- 문법 검사 PASS · Node 295/295 PASS · Chromium 204/204 PASS(12개 스위트 각각 실행) · PPTX 메모리 2/2 PASS.
- 신규 V0.23 Node 34/34, Chromium 28/28 포함. 이전 파일 선택기의 비동기 검증 테스트 레이스를 수정했으며 V0.22 전체 35/35 재확인.
- 데스크톱 1480px/모바일 390px 합성 Chromium에서 모달 x/width와 가로 오버플로 없음 확인. 실제 Windows·Android 실기검증 미실시.
- 로컬 커밋 SHA와 트리 SHA는 `DoCut_V023_RESUME_RECEIPT_20261104.txt`에서 읽는다. 로컬 임시 Git 객체는 Library에 영속 보존되지 않으므로 전체 format-patch TXT가 기본 복원원이다.

## 검증·경계

- 코드 자동검사는 앱 사용자 화면에서 수동 테스트가 아니라 소스·합성 브라우저 테스트다.
- 검토자 이름·문자열은 본문·PDF/HTML 공개 내보내기에 섞지 않는 것이 기본 정책. 네이티브 JSON에는 포함된다.
- 자료 수치와 공식 근거는 사람의 원본 확인이 필요하다.
- GitHub 원격 쓰기가 거부되면 **업로드 성공으로 보고하지 말고** 전체 소스 TXT를 Library에 보존한다.
- 전체 V1.0 완성률·89장 디자인 일치율은 인수 체계를 별도로 측정하기 전까지 미산정. 과거 고정 42/53=79.2%로 대체하지 않는다.
