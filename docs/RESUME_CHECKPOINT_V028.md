# DoCut v0.28 재개 체크포인트

## 복원 및 원격 대비 (2026-11-06)

- 프로젝트: DoCut Studio / 로컬 `/mnt/data/docut_work` / 작업 브랜치 `main`.
- 로컬 복원된 전 버전: `aeec3b2` — `feat(docut): premium 20 layouts, branded masters and cursor lighting v0.27 [skip ci]`.
- 사용자 확인된 원격 저장소: `https://github.com/neoflowcore/DoCut`. 연결된 GitHub API의 저장소 메타데이터는 정상이나 Git 데이터/contents는 **빈 저장소 (409/404)**. GitHub 연결의 `create_blob` 쓰기 요청은 **403 Resource not accessible by integration**. 로컬 Git의 DNS 연결도 차단되었다.
- Vercel: 팀 `team_ZYsUePlYQB54MXTpqeR8PI7L`, 프로젝트 `docut-studio`, 마지막 READY production 배포 `dpl_Acqj1zifA4r1n2fnDskbXHKiaCYV`. 이는 구버전이며 v0.28 배포 성공 영수증이 아니다.
- Actions/CI: `.github/workflows` 추가 금지, `vercel.json`의 `{"git":{"deploymentEnabled":false}}` 유지. `git` 소스 커밋에 `[skip ci]` 사용.

## 이번 수정

- `assets/effect_studio.js` 미리보기/검색/선택적 적용, 추가 효과 UI.
- 효과 DOM 레이어 3종, 경계·오버레이 겹침, 레이어별 포인터 CSS 변수와 독립 HTML 런타임 동일화.
- 광원 색상·반경·강도·각도·속도 5개 박스 속성, JSON 정규화 및 CSS 출력.
- 배경의 알파 파서/실제 글자 불투명도 보존, 누락된 색상의 `undefined` CSS 방지.
- 잠긴 요소 전체 글꼴 포함의 명시적 체크와 Undo.
- 20 키트·89 메타데이터·로고 8위치 유지, 접근 가능한 편집 경로 개선.
- `tests/browser_v028.py`와 `tests/effect_studio_v028.test.cjs` 등 선택적 합성 자동 테스트.

## 다음 재개 절차

1. 이 저장소의 새 최종 로컬 Git 커밋, `git status --short`, `git rev-parse HEAD`, `git rev-parse HEAD^{tree}`, 새 v0.28 패치 TXT 영수증을 먼저 확인한다.
2. GitHub repo가 빈 상태를 벗어났는지 연결된 GitHub API로 읽어 재확인한다. **403 해결 전에는 업로드 성공이라고 보고하지 않는다.**
3. 기존 Vercel 배포의 프로젝트/환경/프로덕션 여부를 확인한다. **원격 업로드 또는 배포 사용자 요청이 있어도 자동 Actions를 가동하지 않는다.**
4. 실기: 사용자 Windows Brave에서 HTML 파일을 열고 실제 글꼴, 마우스 광원, 로고, 페이지·표·차트, HTML 재생 및 JSON 저장을 확인한다. Android Brave에서는 터치·16:9·오프라인을 별도 확인한다. 실제 방문/클릭 없이 PASS 처리하지 않는다.

상태의 `%`는 `docs/ACCEPTANCE_V028.md`에 **v0.28 정의된 검사 항목**을 분모로 실측. 역사적 V1.0 전체 완성률과 혼동 금지.
