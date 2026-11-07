# DoCut 개발 로드맵 · V1.0 목표 (2026-11-02 갱신)

> 사용자의 결정: **미완성 UI를 수기 테스트하지 않는다. 개발 기능을 충분히 완성하고 마지막에 실제 기기 검증을 한다.** 현재 수기 검증 요청 금지, 자동 Actions 및 설치 아티팩트 생성 금지. 통합 소스 커밋 원칙.

| 단계 | 구현 목표 | 현재 소스 상태 | 미완료 사항 |
| --- | --- | --- | --- |
| V0.7 코어 | 16:9·장면·레이어·기본 HTML 출력 | 완료 | GitHub 업로드 403 차단 |
| V0.8 시각/데이터 | 15 요소·다중 선택·그룹/잠금·CSV·타임라인 드래그 | 대부분 완료 | 이미지 마스크·작업 히스토리 고도화 |
| V0.9 논리/AI | 5종 보고서 전개·페이지별 질문·6 레이아웃·AI JSON 리뷰·감사 | 대부분 완료 | 정교한 AI 변경 diff 시각화·외부 보고서 원형 역변환 |
| V1.0 품질 | 사용성, 타입/검증 안전장치, 대화형 발표 및 브라우저 안정성 | 개발/자동 검증 중 | 실 사용자 기기 평가·저시력/터치 인터랙션 마무리 |
| V1.1+ 교환 확장 | PPTX 편집 개체 완성도·PDF/비디오 파이프라인, 다중 중간 키프레임 | 설계 단계 | 별도 구현 필요, 지금 자동 빌드 없음 |

## 결정된 우선순위

1. **레이어 편집 완성도:** 더 정교한 스타일 툴바, 이미지 크롭/비율 잠금, 레이어 폴더, 페이지 간 복사.
2. **정확한 HTML 재편집:** DoCut HTML 무손실 왕복을 유지하며 일반 HTML에서 절대좌표·문단·표 변환 제약을 보여주는 비교 미리보기.
3. **모션:** 최대 3개 효과 유지, 부드럽고 자원 효율적인 단일 타임라인, 스크럽/세부 키프레임.
4. **보고서 품질:** 수치 출처 누락·샘플·단위·기준일 점검, AI 제안 검토 후 적용 및 변경 내역 표시.
5. **출력:** 설치 없는 단독 HTML/TXT/JSON + 브라우저 인쇄 기반 PDF; 이후 네이티브 PPTX 정적 편집 내보내기 구현; 네이티브 동영상과 PPTX 모션 이식 확장.
6. **최종 실기:** 모든 개발이 충분히 완료된 뒤 Windows Brave/Android Brave에서 16:9 레이아웃·직접 편집·재생·HTML 왕복·오프라인 테스트.

## 검증 상태

단위 테스트 24 PASS, 브라우저 통합 테스트 3종 PASS, 자동 레이아웃 80장 PASS. 디자인 일치율은 확정 비교 시안이 없어 **미산정**. 사용자 수기 검증 **미실시**. 자세한 단계별 개발 추정률은 `PHASE_0_9_STATUS.md`에 기록.

## 저장소와 CI

GitHub: `neoflowcore/DoCut`. 원격 쓰기 `403 Resource not accessible by integration`으로 Push 미완료. 워크플로 파일 생성/Actions 자동 실행 없이 **소스 코드만 일괄 업로드**. Windows 설치 실행파일 및 ZIP은 실기 검증 요구 전까지 만들지 않는다.

## V0.10.0 결정 기록

- 페이지별 수동 키프레임 시작/끝 좌표·불투명도와 사용자 지정 Bezier 수치를 지원. 최대 3개 효과는 유지.
- PPTX는 오프라인 정적 편집 개체로 내보내며, PowerPoint 모션/웹 CSS 마스크의 픽셀 동일성은 향후 품질 개선 항목.
- 타사 HTML 불러오기는 변환 방식과 보존/손실 가능성을 공개하고, 사실·근거 검증은 사람이 수행.
- 사용자 수기 테스트는 명시적으로 유예: 소스 자동검증만 실시, 설치 아티팩트 및 GitHub Actions 생성 없음.


## V0.17 advanced statistics source implementation (2026-11-04)

- New **9 evidence-gated statistical charts** and CSV two-phase review, native editable PPTX geometry, standalone HTML, source provenance, explicit thresholds and additional motion preset. Source-level implementation is tracked in `STAT_CHARTS_V017.md` and `PHASE_0_17_STATUS.md`.
- Remaining product gates: scientific-data source verification, chart readability with actual data, physical Windows/Android/PowerPoint QA, original-reference fidelity, GitHub App write access and source-sync readback.
- No changes to automatic GitHub Actions, installation-artifact restriction or previously accepted V0.15 53-item denominator.


## V0.19 image / layer work (2026-11-04)

- Added picture focal crop, scale, source metadata, fitted PNG/JPEG PPTX picture transforms and keyboard editing; source bytes remain untouched.
- Added layer folders, batch group/align/distribute controls with locked-layer safeguards and cross-page group remapping.
- Source development details and limitations are in `MEDIA_AND_LAYERS_V019.md`. **Physical testing and remote sync still outstanding**. Historical percentages are not recalculated as V1.0 overall completion.

## V0.20 explicit import and text edit review (2026-11-04)

- Non-executing import assessment, current vs converted page schematic layout, explicit lossy-import acknowledgement and exportable TXT receipt.
- Literal find-and-replace by deliberately selected elements, with lock, rich-format and stale-review safeguards; block text changes invalidate its own verified mark, not provenance or chart numeric data.
- Detailed scope and test checklist: `IMPORT_REVIEW_AND_TEXT_V020.md`, `PHASE_0_20_STATUS.md`.
- Follow-on work: actual cross-browser native file import QA, pixel comparison only with original image set, richer side-by-side HTML DOM inspection if a safe sandbox can guarantee no external requests.

## V0.21 질의형 보고서 품질 점검 (2026-11-04)

- 점검: 기승전결·공공정책/실적/연구/비교 5종 스토리맵, 현재/권장 페이지 역할·핵심 질문, 경고 레벨/분류, 숫자·출처·시점·단위, 통계 원자료, 카드 충돌, 16:9 넘침, 직접 색 대비, 대체텍스트, 장시간 모션.
- 적용: 사용자가 요청할 때만 실행, 읽기 전용. 경고 위치 클릭 이동, TXT 증빙, JSON을 담지 않는 AI 검토 프롬프트, 일반 HTML 가져오기 시 후보 독립 경고 표시.
- 한계: 단순 자동 점검을 신뢰성 점수·V1 진행률·89장 시각 일치율로 재해석 금지. 레퍼런스 원본·실기 검증·GitHub 원격 동기화는 남은 작업.


## V0.22 AI 제안 선택 승인 · 배치 복구 보호 (2026-11-04)

- AI 제안 전후 비교 범위를 페이지/요소/공통 설정까지 세분화. 수치·근거 별도 동의, 변경 선택 시 재확인, 모든 요소 22개씩 추가 표시, 페이지 제목·푸터 수치와 원자료 위험 판별.
- 잠긴 원본과 감춘 레이어의 상태 보존, 서식과 실제 본문 불일치 차단, 분석 후 제안/원본 변조 감지. 공식 진위 검증을 자동 수행하지 않음.
- HTML/JSON 가져오기, CSV·TSV 변경, 일괄 본문 치환, AI 반영 전에 사전 백업 실패 시 적용 보류. JSON 직접 다운로드 후 원본이 변하지 않은 경우 명시적 재시도 가능.
- 남은 검증: 실제 브라우저의 저장 공간 제한, 장시간 편집·다중 탭·한국어 IME, Windows/Android Brave 및 Office 실제 열기, GitHub App 쓰기 권한.


## V0.23 내부 의견 관리 확장 (2026-11-04)

검토 보드에서 페이지·개체 의견, 우선순위, 해결 상태, 답글, 연결 해제 보존, 검토 후 원문 변경 표시를 관리한다. 자동 진단의 우선 확인을 사람 관리 메모로 직접 전환할 수 있다. 리뷰 공유용 JSON은 원문 없이 검토 기록만 전달하며 동일 보고서 식별자·중복·충돌·저장 백업을 확인한 뒤 병합한다. 공개 배포 HTML/TXT/PPTX와 내부 검토 기록은 분리한다. 자세한 내용은 `docs/REVIEW_BOARD_V023.md`에 기술한다. 이 구현이 V1.0 전체 완료나 법적·내용적 검증을 뜻하지는 않는다.


## V0.24 reusable page kits (2026-11-04)

- Ten original editable page structures and nine established DoCut color palettes; 16:9 interactive preview and gallery search/filter; insertion after current page with original data, IDs and Undo preserved.
- Personal page-layout capture strips actual content, statistics, sources, images and internal review names; reviewed kit-only JSON exchange with optimistic local conflict checks, corrupt raw export and consented reset.
- Next priorities: actual Windows/Android Brave font and touch evaluation, physical PPTX editability and image-crop QA after explicit user request, 89-reference design visual comparison where source images are available, GitHub App access to empty DoCut repo (Contents write 403), and eventual approved production update.
- The historical 42/53 acceptance denominator is not total V1.0 completion and did not change solely because this development batch was implemented.

## V0.25 delivered source-only (2026-11-04)

Video-style offline page-dwell and timed-captions runtime; weighted storyboard and global seek; three subtitle themes; reversible standalone HTML with no remote assets. Video/MP4/media encoding and true PowerPoint animation remain unsupported, pending explicit request. See `STORYBOARD_PLAYBACK_V025.md` and `PHASE_0_25_STATUS.md`.

## V0.26 source-only checkpoint (2026-11-05)

- **Implemented:** top-level `검증` action + right inspector 3 modes, individually reviewed bilingual conservative spelling in elements/page fields, read-only report issues, manual AI text proposal review, UI-only resizable glass panes, compact theme swatches, 11 shared slide transitions and searchable 89-item reference metadata catalog. See `docs/V026_BASELINE_VALIDATION_UX_PLAN.md` and `docs/VALIDATION_UI_V026.md`.
- **Remain explicitly open:** original 89 JPEG/animation frames and per-effect pixel matching, true advanced Korean semantic/morphological correction, opt-in external AI connector (not active), real Windows/Android Brave and MS Office QA, protected GitHub source synchronization, V1.0 full acceptance criteria.
- **No production release, GitHub Actions build, installer, ZIP, MP4 or actual released PPTX.** Historical 42/53 is fixed V0.15 acceptance, not current complete V1.0.
