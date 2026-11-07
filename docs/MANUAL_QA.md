# FUTURE HANDS-ON TESTING IS DEFERRED

**Do not request the user to perform this checklist now.** The user explicitly wants feature development completed before human Windows/Android Brave and Microsoft PowerPoint testing. This checklist is for the later physical-test handoff only.

# DoCut V0.12.0 향후 실기검증 계획 — 현재 보류

> **지금 수기 실기 검증을 요청하지 않습니다.** 사용자는 개발을 먼저 끝내고 나중에 실기검증을 하기로 했습니다. 이 문서는 나중에 사용할 예정인 시험 항목을 정리한 것입니다. 지금 EXE/APK/ZIP 빌드와 설치파일 제작은 금지합니다.

## A. 검증 준비 조건

- [ ] 개발 범위와 잔여 기능이 합의된 기준선까지 완료.
- [ ] 소스 단위 테스트·브라우저 통합·레이아웃·오프라인 HTML QA 통과.
- [ ] GitHub 코드 쓰기 권한 복구 및 최소 커밋 일괄 반영, 일반 Push에서 자동 Actions/빌드가 발생하지 않음 확인.
- [ ] 사용자가 실제 기기 검증 시작을 요청한 시점에만 필요한 실행 파일/아티팩트를 1회 제작.

## B. Windows + Brave 인터랙션 (검증 착수 후)

- [ ] 5종 보고서 유형/3~8장 자동 탭·페이지별 질문·레이아웃이 적절한지.
- [ ] 요소 추가 시 빈 공간 우선 배치, 드래그·크기 변경·스냅·다중 선택·그룹·잠금·숨김·균등 배치.
- [ ] 직접 텍스트 입력과 Esc 취소, Ctrl+Z/Y, 부분 B/I/U·형광·색상.
- [ ] 차트 음수·영점, 도넛 비음수, CSV/TSV/Excel 셀 붙여넣기, 표 셀 편집.
- [ ] 요소당 모션 3개 순차 적용, 부드러운 전환, 타임라인 드래그, 일시정지·정지·재시작.
- [ ] 콘텐츠 점검의 미확인 항목·출처 미기입 알림과 해당 요소 바로 이동.
- [ ] AI JSON 제안 비교·취소·적용 및 수정된 숫자의 미검증 상태.
- [ ] 로컬 자동 저장과 복구본 복원, 여러 탭·큰 문서에서의 데이터 보존.
- [ ] 단일 HTML 재생, Ctrl+좌우/1~4, 의견수렴 메모 TXT, 인쇄/PDF 저장, TXT/JSON/HTML 왕복.
- [ ] 일반 HTML은 구조 변환 가능하지만 복잡한 원형 CSS/JS를 실행하지 않는지.

## C. Android + Brave, 접근성, 성능 (검증 착수 후)

- [ ] 모바일 화면 상단 편집 도구·16:9 캔버스·하단 도구 트레이/속성 오버레이가 화면을 가리지 않는지.
- [ ] 터치 드래그·핀치/스크롤 오작동·IME 입력·폰트 fallback·반응형 확대.
- [ ] 화면 이동 시 백그라운드 GPU 애니메이션 중단, `prefers-reduced-motion` 동작.
- [ ] 리소스가 부족한 Android에서 8MB 파일 입력 제한·대형 이미지 프로젝트 백업 경고 표시.

실기검증에서 실패한 사항은 기기·브라우저 버전·재현 단계·기대 결과·실제 결과를 기록합니다. **전 항목 PASS 전에는 출시 완료로 표기하지 않습니다.**


## V0.10 추후 수기 검증에 추가할 항목 (현재 요청하지 않음)

- 이미지 삽입 후 원형/다이아몬드 마스크와 초점 변경이 HTML 출력에서 동일한지 확인.
- 사용자 정의 2점 키프레임, cubic-bezier 값, 재생 위치 스크럽/일시정지 상태 확인.
- 저장된 PPTX의 PowerPoint/LibreOffice 열기 및 편집 개체가 원본 구조와 대응하는지 확인. HTML 모션의 PPTX 재현은 현재 지원하지 않음.
- 타사 HTML을 가져온 뒤 정확한 레이아웃 일치가 불가능할 수 있음을 설명하는 진단 확인.

## V0.11.0 개발 이후 수기검증 절차 (현재 시행하지 않음)

**주의 — 사용자 실기검증 보류.** 아래 절차는 개발 잔여 작업과 저장소 반영을 완료한 다음 한 번만 진행할 수 있도록 미리 작성한 수기 QA 계획입니다. 본 문서만으로 사용자의 실행·설치 승인이 발생하지 않습니다.

1. Windows + Brave에서 정적 `index.html`을 열어 인터넷을 차단하고 프로젝트 자동 저장·복구 확인. 16:9 캔버스와 7개 테마에서 폰트·글자 밀도·테두리 렌더링 확인.
2. 3장/5장/8장 스토리 5종의 제목·헤드라인 동기화 및 기존 콘텐츠 보존 레이아웃 변경 확인. 3개 요소를 다중 선택하고 그룹화·복사·타 페이지 이동 후 그룹 이름과 잠금 상태 확인.
3. 이미지 선택 후 크롭·4종 마스크, 공통 로고를 넣은 뒤 모든 페이지 표시와 페이지 번호·하단 부서명 확인. 외부 이미지 링크 요청이 발생하지 않는지 검사.
4. 차트 음수·0축·색상 팔레트 5종, 표 셀 색/글자색/굵기/정렬, Excel/CSV 복사 후 데이터 검증 표시 변경 확인.
5. 한 요소에서 모션 3개, 모션 프리셋 5종, 중간 키프레임 1~4개, 끌어서 시작·길이 변경, 연속 재생/일시정지/스크럽/숨김 탭 GPU 정지 확인.
6. `DoCut` HTML 내보내기→다시 가져오기. 페이지·그룹·좌표·표 스타일·차트 팔레트·공통 마스터 및 모션 데이터가 보존되는지 비교. 타사 HTML은 진단에 명시된 근사 변환만 기대.
7. PPTX 내보내기는 **요청된 실기검증 시점**에 한 번 생성한 뒤 Windows PowerPoint에서 직접 열어 텍스트·표·차트가 편집 가능한 개체인지 확인. CSS 그림자·마스크·모션의 픽셀 동일성은 보증하지 않음.
8. Android Brave 세로·가로 모드에서 페이지 패널, 요소 탭, 속성 패널 열기, 좁은 화면의 필름스트립 및 터치 드래그 확인. 30분 편집 중 브라우저 저장 복원/발열/배터리·애니메이션 GPU 부하 관찰.
9. 결함은 [입력 파일 유형, OS/Brave 버전, 발생 조작, 실제 결과, 기대 결과, 최소 재현 단계, 스크린샷]을 한 건에 정리하며 수정 후 1회 통합 수기 재검증.

**사전 조건:** GitHub Actions `push` 워크플로 없음, CI/설치 아티팩트 없음, 로컬/원격 소스와 버전 일치, 자동 유닛/E2E/레이아웃 검증 통과.

## V0.12.0 수기검증 추가 절차 — 지금 시행하지 않음

- Windows Brave에서 베지어 그래프를 마우스로 변경하고 미리보기 진행률을 0~100%로 이동해 가속·감속 결과와 그래프가 일치하는지 확인.
- 모션 중간 키프레임 마커를 드래그·Shift+방향키 이동 후 실행 취소 1회로 되돌아가는지 확인.
- 다른 앱의 HTML(내장 CSS, `:root` 변수, 좌표, 배경색, 표 셀 서식, 굵게·부분 색상)을 가져와 텍스트·표·스타일이 편집 가능한지 확인. CSS/스크립트/이미지의 손실 진단과 완전 복원 불가 안내도 점검.
- Android Brave에서 속성 패널을 열었다 닫고, 터치 베지어 제어점·프로젝트 내보내기·입력기를 확인. Esc 키 또는 닫기 버튼 외에 화면 이동 방해가 없는지 확인.
- 실제 PowerPoint에서 PPTX 열기·개체 편집·재저장은 **사용자 실기검증 요청 시** 실행. 테스트 전에는 릴리스 설치 산출물을 만들지 않음.

## V0.14 addendum — future hands-on verification, not requested now

- [ ] Select each effect slot and edit starting/ending pose (x/y/rotation/scale/opacity/blur/brightness) individually; reset one endpoint and confirm the other stays custom.
- [ ] Create four midpoint keyframes, modify each channel and move their timeline markers; check the composited output and reduced-motion setting.
- [ ] Paste a copied multi-cell Excel range into a table, adjust individual cells and formats, add/delete row and column, then save/reload; verify sourced values are marked unverified after edits.
- [ ] Drag a selected group against screen edges and other cards, verify members retain relative spacing and snap guides follow target elements; test undo and pointer cancellation.
- [ ] Import an HTML report containing embedded base64 PNG/JPEG/WebP, inline bold/color text and remote media links; verify local media is restored but remote content never auto-loads.
- [ ] In real PowerPoint, open a multi-slide PPTX with images/logo/chart/table, edit the shapes and character styles and resave; no assumption that prior `python-pptx` parsing implies compatibility.
- [ ] Test a 390px Android Brave viewport and real touch/IME, including the inspector's inside Close button and page drawer.

- [ ] Open the source as a file:// URL in the actual user browser; if the browser denies local storage, confirm the UI warns appropriately and a `.docut.json` export still preserves the entire project.
- [ ] Corrupt one *test-only* backup record; confirm the recovery dialog opens without breaking the app or overwriting the current project. Never modify a real user backup for this test.

## V0.15 future manual validation addendum — **NOT TO BE RUN UNTIL USER REQUESTS**

1. On Windows Brave, select an element and fill out source, basis date (YYYY-MM-DD), unit and evidence. Mark it verified, edit a value or unit, and check that verification resets. Undo once and check full provenance restoration.
2. Open AI proposal review and paste a valid native project containing one modified page, one untouched page, and changed document title. Confirm the default is 0 checkboxes, inspect numeric before/after examples, approve only one page, and verify the title and untouched page do not change. Undo once. Test Markdown ```json fenced proposals. Test an AI-proposed page ID change is shown as separate removal/insertion warning.
3. Choose CSV/TSV data for a chart or table. Confirm preview lists the source filename, table dimensions and first rows; **Cancel** must leave all data unchanged. Reimport, explicitly accept, verify source filename and verification reset, then Undo. Try >12 chart points and malformed numeric data; ensure the previous values and sources remain intact.
4. In Inspector, paste 25 table rows, 11 columns or 13 chart series; check an explicit error and zero silent data loss. Likewise verify imported native projects reject oversized rich-text runs and more than four keyframes instead of truncating.
5. Export native independent HTML offline. Use each page's **출처·근거** button: expect correct source/date/unit/evidence, no HTML/script execution, and correct per-page refresh after switching tabs. Check Ctrl+left/right, font slider and browser printing with a 16:9 page box.
6. Compare one page's CSS and animation playback between editor and independent HTML on Windows; test three effects, start/end poses, mid-keyframes, pause and reduced-motion, including GPU idling while tab is backgrounded.
7. On Android Brave, open the *full source tree* (or user-approved equivalent) and verify 390px portrait view, page drawer, AI selection dialog, CSV review, on-screen Korean keyboard/IME, long touch, no horizontal overflow and 30-minute stability. Record OS/Brave version and observed issues; do not infer these from headless Chromium.
8. When explicitly authorized to produce a PPTX for hands-on test, open in **Microsoft PowerPoint for Windows**, inspect shape alt text for source/date/unit/evidence, edit rich text/table cells/move chart shapes, resave/reopen and visually compare. ZIP/PPTX format memory tests before this point do not count as Office compatibility.
9. Reconcile GitHub current head with the recovered source patch, add the repository to GitHub App write-access selection if denied, upload in the smallest practical number of source commits, and independently read back remote SHA. Ensure ordinary push does not trigger Actions/workflow or store installation artifacts.

**Do not request manual tests now.** Do not mark V1.0 complete without the previously missing physical, design and remote checks.

## V0.16 future physical validation addendum — continue coding before requesting this

1. Open the full DoCut source tree on **Windows Brave**, verify **9 color themes** and **12 layouts**. From a five-page strategy report, choose `quadrant` and `portrait` with preserve-content ON: no data, source, tab or object ID should vanish. Check screens at 1920×1080 and a short 1366×768 monitor.
2. Select text, KPI, bar, line and donut elements and inspect the **28 type-filtered preset buttons**. Verify typing, word-rise, counter-up, bar-rise, line-draw and donut-ring are visually distinct and make no numeric data changes. Try an incompatible selection and ensure it is not offered. Set exactly three ordered effects, swap ↑/↓, pause/replay/Undo; vary duration and delay; scrub beyond eight seconds.
3. Configure `flip-x` and `tilt`, edit X/Y 2.5D start pose and a middle keyframe; verify the intended depth illusion with no continuous background GPU usage. Use browser performance monitor while switching away from the tab; all frames must cancel. Enable OS-level reduced motion: no forced animation should play.
4. Change a page transition to `wipe`, then to `zoom`, export a **single offline HTML** and reopen it with network disabled. Check transition on page navigation, word-by-word movement, correct chart colors, numeric formatting and maximum 30px slider. Reload exported HTML as a DoCut project and check `transition`, effect order, custom poses and provenance survived.
5. Import generic HTML containing nested positioned boxes and an inline `data:image/png` CSS background; check both become editable objects. A remote image must not load silently. A Grid/Flex/JavaScript report remains approximate with explicit conversion warnings, **not** a pixel-perfect reconstruction.
6. On **Android Brave**, test 390px portrait + landscape, the effects gallery scroll, tab drawer overlay, touch drag, font fallback, input-method editor and UI response while animating five pages. Record heat/battery and page background stop behavior. Do not infer mobile compatibility from desktop Chromium emulation.
7. Actual Microsoft PowerPoint inspection is **not requested yet**. At a later explicitly authorized physical test, confirm the 9 theme backgrounds, native chart shapes and readable font sizes. HTML-only text/number/SVG motion and page transitions are not PowerPoint animations.

## V0.16 QA report format (for the later physical test)

Document the OS / Brave version / exact viewport / steps / expected result / actual result / device GPU observations and an anonymized screenshot. A headless pass is **not** a physical pass. Do not authorize automatic GitHub Actions or produce EXE/APK/ZIP installers on behalf of these checklists.


## 🚨 V0.17 추가 실기검증 절차 — **지금은 미실행, 사용자가 요청할 때만**

- [ ] Windows Brave 오프라인에서 왼쪽 ‘통계 차트 9종’을 선택. 원자료가 없는 신규 차트가 샘플 숫자 대신 ‘원자료를 입력하세요’를 표시하는지 확인.
- [ ] 모든 9종에서 실제 검증된 자체 데이터만 입력, 단위·출처·기준일·근거를 작성. 코호트(0~100%), 관리도(직접 설정한 상·중·하한), 포레스트(직접 입력한 기준 0/1), ROC(0~1 좌표), 생존(위험집단·사건 수) 데이터 라벨을 검사.
- [ ] 서로 다른 기간별 small multiples 입력, 신뢰구간 하한이 추정값을 넘는 forest, 역전된 ROC 값 등은 이전 데이터가 유지되며 명시적 오류가 표시되는지 확인.
- [ ] ‘자료 열 제목 복사’와 CSV/TSV 파일 선택 버튼이 실제 작동하는지 확인. 미리보기에서 취소 후 무변경, 승인 후 데이터/출처 업데이트, 단일 Undo와 인증 상태 재설정 확인.
- [ ] 모션 ‘통계 차트 순차 강조’가 정적 원문 숫자·축을 고치지 않고 재생되는지 확인. 페이지 이동·숨김 탭·저사양·동작 줄이기 설정에서 GPU 낭비가 없는지 확인.
- [ ] 독립형 HTML 보고서를 네트워크 차단 상태에서 열고 통계차트 출처·텍스트와 그림이 정확한지 확인. JSON 재가져오기로 kind/rows/limits/referenceValue/palette/출처 상태가 동일한지 확인.
- [ ] Microsoft PowerPoint에서 9가지 PPTX를 실제로 열고 개별 선·원·텍스트·바를 이동/수정/저장/재열기. 사전 메모리 기반 구조 테스트 통과만으로 Office 실기 PASS라고 표기하지 말 것.
- [ ] Android Brave 390px 세로/가로에서 ‘속성’ 패널을 열고, 한글 IME·터치·차트 타입 선택·CSV 업로드·스크롤 충돌 및 발열을 확인.

검증 장비/앱 버전/화면 크기, 원본 데이터, 기대 결과, 실제 결과, 실패 재현 단계를 각각 기록하고, **모두 실제 확인 전에는 실기 완료 표시 금지**.

## V0.18 local checkpoint safety - future hands-on tests (NOT performed)

**Do not start hands-on verification until the user expressly requests the run.** The test must use the real Windows/Android Brave profile, not synthetic storage events.

1. **Windows Brave, two tabs on the same origin:** open the same full DoCut source application twice, edit tab A and tab B separately, trigger a `storage` event by saving A, confirm B shows a conspicuous red/amber save warning and cannot silently overwrite A; export B JSON, choose to load latest A, compare original A and B. Repeat by explicitly replacing A from B and check A appears in recovery.
2. **Abrupt closure/reload:** enter Korean text, exit IME composition, force close the window *before blur* and reload; verify last committed characters and formatting. Test Escape cancel and Ctrl+Z/Y with exactly one Undo boundary. Check 12,000+ char paste is rejected with a visible warning rather than truncated.
3. **Damaged state:** in a disposable Brave profile only, simulate a malformed primary checkpoint and malformed backup index, confirm no auto overwrite, export raw text first, then deliberately reset; change the raw data between export and reset and confirm the reset refuses it.
4. **Storage quota/pressure:** use a disposable profile, fill available localStorage and confirm unsaved report banner, JSON export, and preservation of previous valid snapshot. Explicitly verify original `docut-studio-v13` remains on successful migration.
5. **Backup preview:** choose old snapshot, inspect page/element additions/removals, page order, source/verification loss, master/theme warnings, export backup JSON, edit live report after preview, confirm stale apply is refused; re-review and approve restore.
6. **Android Brave portrait 390px / landscape:** one-finger positioning, auto-save banner reachability, file chooser/download, rotation, keyboard/IME composition, large project memory, transient background state and OS storage cleanup. A synthetic Playwright browser is not a substitute.
7. **Presentation comparison:** confirm the generated standalone HTML still shows the correct pages and effects; when expressly requested, generate one PPTX for actual Microsoft PowerPoint editing/resaving of source/data labels. HTML motion is not claimed to carry to PPTX.
8. Log actual OS and Brave versions, test data, exact steps, expected/observed behavior, recordings/screenshots, and pass/fail. Treat all these as **not tested** until hands-on testing occurs.


## V0.19 future hands-on QA — defer until user requests physical verification

1. **Windows Brave:** use a saved copy of the full source tree, not `index.html` alone. Insert a JPEG with EXIF rotation, PNG and WebP from the user's own files. Check `cover / contain / fill`, crop zoom, 0–100% focal X/Y, Shift+drag aspect lock, crop drag, arrow keys (Shift=10%), reset and Undo. Confirm the original image bytes are unchanged through JSON/HTML export and are not uploaded externally.
2. **Evidence preservation:** use an image with an existing official source/reference and verification mark; replace it and confirm original source is not overwritten, file name is still traceable, verification resets, and one Undo restores the prior image.
3. **Group folders:** group 2–4 layers, name the folder, collapse and expand, drag from child element, hold Ctrl/Shift to multi-select, lock one child, duplicate/align/delete group with Undo. Check locked members are not deleted or moved; page cloning and copying generate new group IDs. On a dense page test max 120 elements and rejection of negative spacing.
4. **Standalone report:** export editable JSON and independent HTML; reopen both while offline, confirm image crop, alt text, groups, order and media evidence, and check browser printing at 16:9.
5. **Android Brave:** examine portrait/landscape inspector, touch target size, crop drag and page scroll separation, alt text and file picker, screen reader access, save/restore, GPU idle while backgrounded and Korean IME on a real device. Headless 390px Chromium is not enough.
6. **Microsoft PowerPoint:** only when the user explicitly authorizes a hands-on artifact, create a single PPTX and test PNG/JPG crop editing, text/shape edits and resaving; WebP remains a placeholder; CSS/SVG clipping and video-like motion should not be claimed equivalent.

## V0.20 user-device validation gate — not yet performed

- In Windows Brave import a third-party HTML saved locally with a script tag and external image; check no code executes, no image URL is fetched, conversion-risk acknowledgement is unchecked initially, page previews are approximate rather than claimed screenshots, and file cancel retains all current pages.
- Import the editor's own exported standalone HTML and independently export/import JSON; verify source/evidence fields, page order and embedded logo remain identical. Confirm any warnings are truthful.
- Type Korean text and numbers, apply literal find-and-replace to only checked elements, verify that locked and partly-formatted blocks are skipped by default and verified flags reset only on changed blocks. Confirm Undo and redos.
- With an import/rewrite review open, edit another page in a second tab and confirm baseline conflicts prevent overwriting newer data; export the working copy before any manual conflict resolution.
- On Android Brave verify both 16:9 side-by-side schematic blocks collapse to one column; test scroll, controls, consent box, file picker and touch/IME without hidden GPU animation.
- No installed app or PPTX required for this phase; later requested manual PowerPoint opening must use a single explicitly approved export.

## V0.21 수기 점검 항목 (미실시 · 추후 Windows/Android Brave 요청 시)

1. 작업 중 JSON 백업 생성 후 **콘텐츠 점검** 열기 및 Ctrl+Shift+Q 동작. 이동된 페이지의 제목·레이어가 실제 화면에 표시되는지 확인.
2. 심각도+유형 필터를 조합하고 목록을 스크롤. 숫자/출처/검증 상태·사용자 지정 탭의 원본이 변경되지 않는지 저장·재열기로 확인.
3. 한 번에 5~8쪽 스토리맵, 정책 보고서의 비교 질문, 통계 차트 누락 원자료·검증 상태 경고를 사람이 직접 판독.
4. AI 요청 복사는 사용자 클릭으로만 이뤄져야 하며 프로젝트 원본 JSON, 실제 숫자, 검증 완료를 자의로 작성하지 않아야 함.
5. 외부 HTML 가져오기 모달에서 변환 후보의 **독립 경고**를 확인. 위험 동의하지 않은 상태에서 추가·교체가 막히는지 확인; 승인해도 기존 출처·검증 데이터가 임의 변경되지 않아야 함.
6. 브라우저 390px 터치, 세로/가로, 긴 경고/텍스트, 스크롤 가능한 모달 푸터, `prefers-reduced-motion`, 문서 종료 후 데이터 복구 확인.
7. 실제 Android Brave·Windows Brave·Microsoft PowerPoint에서 PASSED 판정하기 전에는 자동 Chromium 결과를 실기검증이라고 기록하지 않음.

## V0.21 추가 수기 검증 — 실제 요청 전에는 미실시

- 근거가 없는 정량 주장과 차트 수치를 자동 진단이 근거 누락으로 안내해도 **사실의 참거짓을 확정했다고 말하지 않는지** 확인한다.
- 겹친 두 본문 요소를 점검 목록에서 선택하면 두 객체가 강조되며, 사용자가 의도한 장식/겹침은 스스로 판정할 수 있는지 확인한다.
- TXT와 CSV 저장을 눌렀을 때만 파일을 생성하고, CSV를 Excel로 열어 `=1+1`, `-CMD` 등 수식형 문구가 실행되지 않는지 별도 시험 파일에서 확인한다.
- 저사양 모바일에서 최대 1,200개 표시 경고와 390px 긴 목록을 스크롤해도 버튼이 사라지지 않고, 모달을 닫은 후 키보드 포커스/페이지 상태가 정상인지 점검한다.


## V0.22 수기 실기검증 게이트 — 아직 미실시

1. **Windows Brave / 진본성:** 보고서 원본 JSON을 안전한 폴더에 따로 저장하고, AI 제안 텍스트·수치·출처가 서로 다른 요소로 바뀐 JSON을 불러온다. 전체 승인 없이 요소 하나만 선택하면 미선택 본문·차트·출처·통계 검증 상태가 그대로인지 확인한다.
2. **수치·출처 이중 승인:** 한 변경에서 수치와 출처 모두 변경한 제안을 선택해 두 확인란이 각각 필수인지 검증한다. 중간에 선택 항목을 바꾸면 이전 동의가 해제되는지 확인한다. 페이지 헤드라인 및 공통 제목·푸터에 숫자 70%→90%가 생기는 경우도 확인한다.
3. **많은 요소·표시 안전:** 같은 페이지의 변경 요소를 23개 이상 만든 뒤 마지막 항목까지 추가 표시할 수 있는지, 전체 목록을 펼치기 전 페이지 전체 승인 불가인지, 상세 설명에 넣은 `<svg onload=alert(1)>`가 실행되지 않는지 확인한다.
4. **원본 잠금·불일치:** AI가 원본 잠금을 해제하거나 새 요소를 잠그고 숨기게 시도했을 때 원래 잠금과 표시 상태가 임의로 바뀌지 않는지 확인한다. 본문과 부분 서식의 실제 표시 문자열이 다른 제안은 분석 단계에서 거부되는지 확인한다.
5. **저장 공간 부족 복구:** 시험용 브라우저 프로필의 저장용량을 인위적으로 포화시킨 뒤 AI 반영, 일괄 검색·치환, CSV·TSV, 외부 HTML/JSON 적용을 각각 시도한다. 기존 문서가 남는지, `원본 JSON 백업`을 실제 다운로드해 열어본 뒤 동일한 승인 작업을 다시 시도할 수 있는지 확인한다. 실 업무 원본으로 파괴 시험하지 않는다.
6. **Android Brave / 긴 모달:** 390px 세로·가로, 한글 IME, 긴 변경 내용 스크롤, 확인란·다운로드 버튼, 접근성 포커스, 멈춘 탭에서의 GPU 동작을 실제 기기에서 확인한다. Chromium 합성 뷰포트는 이 테스트를 대체하지 않는다.
7. **Microsoft PowerPoint:** 실기 직전에만 승인된 한 번의 `.pptx` 파일을 만들고 PowerPoint에서 열기·요소별 수정·다시 저장을 확인한다. 웹 애니메이션이 기본적으로 PowerPoint 애니메이션으로 변환되었다고 주장하지 않는다.


## V0.23 내부 검토 보드 · 수기 실기 추가 (미시행)

1. Windows Brave 실제 두 창에서 동일한 `.docut.json`을 열어 현재 페이지·요소·보고서 전체 의견을 작성한다. 답글·해결·재검토·우선순위 변경, Undo/Redo, 앱 재시작 후 로컬 복원을 확인한다.
2. 해결된 의견이 붙은 요소 원문을 바꿔 `해결 후 원문 변경` 경고가 뜨는지 확인한다. 이 경고는 승인·사실 검증을 자동 취소하지 않고 수기 재확인을 촉구하는 안내다.
3. 삭제된 개체·페이지의 메모는 삭제되지 않으며 `연결 해제`로 표시되는지 확인한다. 재연결 시 해결 상태가 다시 미해결로 변경되는지 점검한다.
4. 기존 품질 경고를 `검토 메모로 등록`할 때 확인 전 문서가 그대로인지, 중복 등록이 방지되고 원자료·verified가 그대로인지 확인한다.
5. 리뷰 TXT·CSV를 다운로드해 Excel에서 수식으로 시작하는 의견·작성자 입력이 실행되지 않는지 확인한다. 공유용 JSON은 원본 페이지 본문·표·이미지를 포함하지 않는지 직접 점검하고 작성자 개인정보 유출에 유의한다.
6. 리뷰 전용 JSON을 동일 원본 프로젝트로 가져오면 미리보기·수동 체크 후에만 추가되는지 확인한다. 서로 다른 문서·ID 충돌·편집 중 변경·저장 부족 시 병합이 거부되는지 시험용 프로필에서 점검한다.
7. 공개 HTML/TXT 및 PPTX로 내보냈을 때 내부 리뷰 메모·작성자가 **포함되지 않음**을 실제 수신 파일에서 확인한다. JSON 프로젝트에는 보존되어야 한다.
8. Android Brave 실기에서 390px 이하 모달, 한글 IME, 페이지 이동과 스크롤, 검토 패킷 파일 선택 및 다운로드, 백그라운드 CPU/GPU/발열을 검증한다.

자동 브라우저는 합성 localStorage·headless Chromium이다. 실제 Windows/Android Brave 또는 Microsoft Office를 통과했다고 주장하지 않는다.


## V0.24 page-kit manual gate - NOT PERFORMED

1. **Windows Brave:** Open complete source directory `index.html` (not the old deployed V0.15 site), back up native report JSON, open 10-kit gallery, check 9 palette variations, insert after current page, Undo/Redo, 50-page guard and no mutation of existing slides. Confirm search/category filter selects a visible kit, and no-match filter disables insertion.
2. **Private capture:** Put unique TEST_PRIVATE_SENTENCE and TEST_PRIVATE_TABLE_VALUE in a page. Capture template, export explicitly, inspect JSON for absence of both tokens, image bytes, source, verification and internal reviewer data. Test mobile custom design without losing original user page.
3. **Multiple tabs:** Save a personal template in a second real Brave tab after the first has opened the gallery. Stale tab must refuse overwrite, warn to reload, retain the user's existing library. Import an export with manual approval, test duplicate and conflicting template IDs in a disposable profile.
4. **Recovery:** Use a test-only browser profile to simulate quota/corrupt library. Confirm template library is retained; download raw TXT first, then explicit reset. Original DoCut project and comment board must not be deleted. Verify download and file names from actual Brave.
5. **Android Brave:** rotate mobile; verify gallery, long-name truncation, selection and 16:9 preview, touch scroll vs dialog buttons, safe Korean IME, file picker and data loss warning. Measure GPU/heat/background after navigating away.
6. **PowerPoint:** real Office manual check is deferred until user requests one PPTX creation; browser HTML motion, masks and WebP crops are not equivalent native PPTX effects.

Headless Chromium and Node source checks are NOT physical Brave or Office tests; 89-reference image fidelity and V1.0 total completion still unmeasured.

## V0.25 upcoming REAL manual validation (NOT PERFORMED)

1. Windows Brave open complete source folder `index.html`, configure page durations 8.5/6/12 s, enter Korean and HTML-looking captions, change Cinema/Glass/Minimal, Undo/Redo and save JSON. Confirm the Apply button actually works after textarea blur.
2. Preview and standalone one-file HTML: user-initiated autoplay, pause, stop (no continued GPU motion), speed, loop, local/global seek, weighted scene navigation and final slide behavior; confirm none of this makes a video file.
3. Android Brave with touch and on-screen keyboard: open Inspector manually, edit captions, close overlay, re-enter preview, rotate portrait/landscape, check controls and no horizontal page scroll, background/foreground pause and GPU.
4. Privacy: keep private names in review board and public caption as distinct fields; exported standalone HTML must exclude review metadata. Inspect external JSON review separately.
5. Actual Microsoft PowerPoint: after explicit hands-on request create a one-off PPTX; verify shapes, text, charts, and static slide behavior, not animation/timed caption parity.

## 🚨 V0.26 Windows/Android Brave/PowerPoint 수기 실기 (아직 미실시)

1. **복원 소스 열기:** 전체 패치 TXT를 Git으로 적용해 `index.html`과 `assets/`가 같은 폴더인지 확인. 온라인 도메인은 구버전 V0.15이며 V0.26 기능 확인용이 아님.
2. **① 오탈자:** `검토 하였습니다`, `됬어요`, `teh recieve`, 중복 공백을 포함한 보고서에서 `검증 → 오탈자`, 전체/현재 페이지/선택 요소와 한/영 언어 전환, 개별 적용·Undo, 한 세션 무시·복귀를 확인. 페이지 탭/헤드라인/설명 오타도 별도 검사. 숫자·단위·출처·URL·이메일, 잠금·숨김·부분서식은 무단 변경되지 않아야 함.
3. **② 보고서 문제:** 출처·기준일 없는 통계, 겹치는 두 요소, 텍스트 넘침을 시험하고 위치 이동/두 요소 선택. 보고서 내용 변경은 없어야 함. 자동 경고 없음은 법적·통계적 진위 PASS가 아님.
4. **③ AI 문장 개선:** 선택한 일반 텍스트 요소만 프롬프트로 복사되는지(원문 민감정보 주의), 수동으로 받은 제안 문장을 붙여 변경 전후 승인. `70%→90%`, 괄호 안 `(출처:...)`, 이메일/URL 바꾸기, 입력 중 제안 교체, 오래된 원문·백업 실패 시 적용 차단. AI API 자동 호출 없음.
5. **글라스 경계:** 1366px 및 1920px Windows Brave에서 좌/우 헤어라인을 1px처럼 보이게 하면서도 양쪽 10px 터치/마우스 영역으로 드래그. 방향키, Shift+키, Home/End, 더블클릭 폭 초기화, 리로드 후 복원, 가운데 16:9 캔버스 가둠 확인. 실제 Android Brave는 모바일 오버레이 동작, 키보드/스크롤/IME, 390px 세로·가로 및 과도한 GPU 활동이 없는지 수기 기록.
6. **디자인 및 89 레퍼런스:** 세 가지 빠른 프리셋 색상과 선택 상태, 9개 고급 팔레트, 11개 전환의 단일 페이지 Undo, 오프라인 HTML, reduced-motion 검증. 89개 설명 목록의 01~89 검색/분류를 검사하되 원본 JPEG/영상이 없어 픽셀·프레임·속도 일치율은 **미측정**으로 기록.
7. **오프라인/Office:** HTML 보고서만 로컬 완결형으로 열고 검토 개인정보가 노출되지 않는지 검사. 사용자가 별도 실제 PPTX 실기 요청하기 전까지는 파일 생성·실제 PowerPoint 편집 시험을 실행하지 않음. 실기일·OS/Brave 버전·화면 크기·기대/실제·스크린샷·개별 PASS/FAIL을 기록.
