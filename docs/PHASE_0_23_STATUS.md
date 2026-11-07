# DoCut V0.23 개발 상태 — 내부 검토 의견 관리

- 기준: 로컬 V0.22 커밋 `ab355c918e70cbe40c8b6a903ca39f5f642fd5c6`, 트리 `f2e1d330d841f6c46d520f839d0f99c071b74b23`.
- 대상: neoflowcore/DoCut 원격 main에 코드를 가져오지 못한 상태에서, 동일 프로젝트 전체 소스 패치와 작업 트리를 대조하여 계속 개발.
- 구현: 검토 코멘트 스키마/안전 입력, 페이지·개체 연결, 선택별 검색·필터·상태·답글·편집·리타깃, 해결 후 원본 변경 감지(참고 지문), 품질 경고 → 검토 의견 수기 등록, 35건 페이지네이션, Excel CSV 수식 실행 예방, 검토 전용 JSON 패킷 왕복(상충 ID 거절), 명시적 수동 승인·백업 필수, 공개 HTML 개인 검토 의견 제외.
- 배포/CI: 사용자 실기 이전에는 Vercel 신규 배포·GitHub Actions·EXE·APK·ZIP 설치 아티팩트를 생성하지 않는다.
- 최종 소스 검증(2026-11-04 UTC): `npm run check:syntax` PASS, `npm test` **295/295 PASS**(V0.23 신규 검토 모델 34/34), Chromium 합성 브라우저 12개 스위트 **204/204 PASS**(V0.23 신규 28/28), 메모리 내 PPTX 구조 검사 2종 PASS.
- Chromium은 스위트별로 분리하여 검사했으며, 단일 연속 실행 PASS가 아니다. V0.22의 파일 가져오기 대기 시점에서 비동기 경합 테스트 2건이 일시 실패하여 실제 모달 준비를 기다리도록 테스트를 보강했다. 수정 후 V0.22 전체 35/35 PASS.
- 실제 UI 데스크톱 1480px·모바일 390px 화면 캡처는 합성 Chromium으로 수행했다. 두 화면 모두 가로 넘침 없음(`scrollWidth == viewportWidth`)과 다이얼로그 화면 내 위치 확인. 이는 사용자 Brave 기기 검증이 아니다.
- Release/production status: GitHub App Contents write 403 FORBIDDEN 재확인, remote branch 0, production site V0.15.0; V0.23 미업로드·미배포. GitHub Actions/설치파일/PPTX 실제 저장 없음.
- 사용자 Windows/Android Brave·Office 실기 및 89장 디자인 시안 일치율은 미검증. V1.0 전체 완성률 또한 신규로 산정하지 않는다.
