# DoCut V0.21 근거 중심 품질 점검 · 소스 완료 현황 (2026-11-04)

## 기준선과 현재 개발 범위

- 이전 기준선: `neoflowcore/DoCut` 의 **로컬 V0.20** `main` 커밋 `c25bc91`, 트리 `52b7fc58d5a3c7f1c6bf7afe90d8709d54d43647`, 추적 파일 83개.
- 새 범위: `assets/quality_review.js`, 스토리맵 질문, 근거·수치·차트, 16:9 레이아웃 충돌, 접근성·모션 검토, 위험도/유형 필터, 두 겹침 요소 동시 선택, TXT·CSV, AI 점검 프롬프트, HTML 가져오기 후보 독립 경고 수, Ctrl+Shift+Q.
- 검토는 **읽기 전용**. 원본 문서와 출처·근거·수치·검증 플래그를 자동 수정하지 않는다. 경고 0건이어도 사실 검증 완료가 아니다.
- 데이터 안전: 1,200건 화면 표시 상한과 초과 건수 표기; 표/차트 범주 검토, 0만 있는 도넛 표시 거부 안내, 동일 요소 ID가 다른 페이지·숨김 요소에 중복돼도 경고.
- CSV는 UTF-8 BOM+CRLF와 수식형 제목을 일반 텍스트로 보호하는 안전한 로컬 다운로드. 사용자가 클릭하지 않으면 저장하지 않는다.

## 실측 자동 테스트 기록

| 항목 | 결과 | 한계 |
| --- | --- | --- |
| JavaScript 전체 문법 | 통과 | 런타임 실기 아님 |
| Node 테스트 | **208/208 통과** | 신규 V0.21 전용 36/36 포함 |
| Chromium 10개 스위트 | **141/141 통과** | 독립 실행 합산; 연속 셸 1회 통과는 주장하지 않음 |
| PPTX 메모리 구조 | **2/2 통과** | 실제 파일 저장·Office 수기 실행 아님 |
| 화면 확인 | 1500px, 390px 레이아웃 | Linux headless Chromium, Android/Windows Brave 아님 |
| 원본 89장 레퍼런스 일치율 | **미산정** | 원본 89 JPEG 픽셀 기준본이 작업 공간에 없음 |
| V1.0 전체 완성률 | **미산정** | 지금의 인수 요구사항 전체 고정 분모/실기 결과 없음 |

### 고정 이전 인수 기준 (V1.0 신완성률과 구분)

P0 **4/6=66.7%**, P1 **9/10=90.0%**, P2 **9/10=90.0%**, P3 **7/8=87.5%**, P4 **9/11=81.8%**, P5 **4/8=50.0%**. 이전 V0.15 계열 53개 인수 항목 기준 **42/53=79.2%**만. 이번 V0.21 기능 테스트 통과율과 합산하지 않음.

## 잔여 작업·외부 상태

- GitHub: 대상 `neoflowcore/DoCut`; 원격 저장소는 빈 상태, `main` 브랜치 없음. GitHub App `create_blob` 응답 HTTP 403 `Resource not accessible by integration` (2026-11-04 재조회). 로컬 Git 커밋만 있고 Push 미완료.
- Vercel: `docut-studio.vercel.app` 정상 HTTP 200이지만 **STUDIO 0.15.0** 서빙, 새 V0.21 배포 없음.
- 실제 Windows Brave, Android Brave, PowerPoint에서 기능·저장·타이밍·스크롤 검증 **미실시**.
- 새 Actions 워크플로, `EXE/APK/ZIP` 설치 아티팩트, CI 빌드·배포 **0건**.
- Git 최종 로컬 커밋/트리/경로는 동일 프로젝트 회수용 `DoCut_V021_RESUME_RECEIPT_20261104.txt`에 적고, 전체 Git 패치를 `DoCut_V021_SOURCE_TRANSFER_20261104.txt`로 Library `/DoCut`에 보존.

상세 개발 범위는 `docs/QUALITY_REVIEW_V021.md`, 후속 실기 조건은 `docs/REMAINING_V1_GAPS_V021.md`·`docs/MANUAL_QA.md` 참조.
