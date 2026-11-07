# DoCut V0.26 재개 체크포인트

## 복원 기준

- 저장소: `neoflowcore/DoCut` / 의도된 기본 브랜치 `main`, 기존 Vercel `docut-studio`.
- V0.25 원본 기준선 Git tree: `cc4089589ccf647782b1755670bcbc94913f314c`.
- 이번 묶음은 단일 소스 Git 커밋, 전체 포맷 패치 TXT, 증분 포맷 패치 TXT 및 복원 영수증 TXT로 보관한다.
- **현재 작업 커밋/트리**는 최종 커밋과 함께 외부 영수증 `DoCut_V026_RESUME_RECEIPT_20261105.txt`에 실제 Git 출력으로 기록한다. 문서 내부에 예상 SHA를 기입하지 않는다.
- 로컬 소스가 없으면 `/DoCut` Library의 최신 `DoCut_V026_SOURCE_TRANSFER_20261105.txt`를 먼저 찾아 가져오고 빈 `git init -b main` 저장소에서 `git am`으로 복원. `git rev-parse HEAD^{tree}`를 영수증 해시와 비교.
- 이전 이력이 필요한 경우 V0.25 전체 패치에 V0.26 증분 패치를 적용해 동일 트리를 재현해야 한다.

## 현재 구현 범위

- 새로운 `assets/validation_center.js`, `assets/pane_layout.js`, `assets/page_transitions.js`, `assets/reference_map.js`.
- `index.html`의 상단 `[검증]`과 오른쪽 3모드, 좌/우 유리 경계, 단순 디자인/전환/89장 분류.
- `assets/app.js`의 개별 오탈자 승인·품질 결과 탐색·수동 AI 제안 비교·패널 크기 및 참조 프리셋 연결.
- 단일 파일 공개 HTML은 `assets/export.js`의 내장 공유 전환 런타임 사용. `tools/sync_export_runtime.py`를 통해 임베디드 소스 갱신.
- 새 테스트 `validation_layout_v026.test.cjs`와 `browser_v026.py`; 이전 53개 인수 분모는 변경하지 않음.

## 다음 남은 우선순위

1. 실제 89개 JPG/동영상 원본 재확보 뒤 시각 비교·기준 캡처 검증과 *구현되지 않은* 원본 특수효과별 코드 개발. 사진 89장에 대해 89개 별도 효과가 필요하다는 해석은 금지.
2. 한국어 고급 문맥/띄어쓰기, 오탐 예외 사전, 사용자가 명시적으로 동의하는 AI 연결(연동 없이 자동 호출한 척하지 않음).
3. 패널 좁은 폭/터치와 한국어 IME, 디자인 프리셋의 실제 사용자 동선 검증. 실제 Windows/Android Brave 및 PowerPoint 편집성 검증은 명시적 사용자 실기검증 요청 시.
4. GitHub App에 `neoflowcore/DoCut` Contents 쓰기 권한을 복구하고 원격 `main`을 만든 후 로컬 트리와 다시 대조. 일반 Push에서 Actions/자동 빌드가 발생하지 않도록 확인, GitHub CI 없이 소스만 전송.
5. 현재 운영 사이트는 구버전 V0.15.0임. 사용자가 실기/배포를 요청하기 전에는 V0.26를 배포하지 않음.

## 기록의 한계

합성 Chromium과 Node 통과는 실제 기기 실기 PASS가 아니다. 이전 고정 42/53은 전체 V1.0 완성률이 아니다. 디자인 원본 89장 시각 일치율도 아직 검증할 사진 바이트가 없어 미산정.

## 연결 복구 이후 안전성·검색 보강

- 요소/페이지 제목 등으로 확장한 한·영 보수적 오탈자 검사 및 한 항목만 승인·Undo. 한 세션 오탐 무시가 300건 검사 상한을 소비하지 않게 보완.
- 본문 인용 줄·괄호 인용·URL·이메일을 별도 보호하고 AI 제안의 단일 입력을 비교/승인하기 전 저장.
- 89 레퍼런스의 실물 이미지가 없더라도 **설명 메타데이터 JSON 자체는 `docs/REFERENCE_CATALOG_SOURCE_V026.json`으로 동봉**해 재생성 가능. 사용자에게 89개 원본 이미지를 갖고 있다고 말하지 말 것.
- 원본 89장과 미구현 시각효과의 정확한 일치율을 임의 산정 금지. 위 합성 QA 통과는 실제 기기 PASS 아님.
- 소스 commit/tree SHA는 **최종 단일 커밋/전체 패치 복원 완료 이후** `DoCut_V026_RESUME_RECEIPT_20261105.txt`에 기록.

## 자동 Git 배포 방지

- 소스 루트 `vercel.json`: `{"git":{"deploymentEnabled":false}}`. 이 설정이 Vercel 프로젝트에 실제 반영되기 전에는 외부 대시보드 설정/연동이 우선할 수 있으므로 첫 원격 Push 전 Git 연동의 자동 배포 상태도 점검해야 한다. 소스-only 변경이며 신규 배포는 하지 않음.
