# DoCut Studio — v0.42 sequential report identity upgrade (01–02 / 20)

**STR-01 McKinsey** and **STR-02 Boston Consulting Group** now have standalone, **individually authored** native-editable 16:9 six-page designs, replacing the generic composition for their original-theme galleries. The McKinsey-informed pack uses blue editorial hierarchy, a serif research cover, evidence narrative, data exhibit, segment comparison, matrix and roadmap. The BCG-informed pack uses a separate dark-sea/white/green cover grammar, global region bars, chart+table exhibits, driver pillars, risk matrix and priorities. Both keep Excel-linked bar/line objects and preserve negative/zero input values.

Current result: **12/120 pages newly enhanced**, and the existing 20×6 page generator remains intact. Source-based structure and basic data/export-model checks were performed; **no Chromium/mobile practical verification or measured 99% pixel/design fidelity** is claimed. Other 18 packs, including the separate UBS vector pilot, remain different development/verification stages. Do not redistribute original logos, report photography or third-party chart artwork.

See [v0.42 development notes](docs/SEQUENTIAL_REFERENCE_REBUILD_V042.md), [per-pack 20-step status tracker](docs/REFERENCE_REBUILD_TRACKER_V042.json) and [new static test](tests/editorial_str01_str02_v042.test.cjs). Next sequence item: **STR-03 Bain**. CI and automatic production deployment remain disabled.

---

# DoCut Studio — v0.41 Large Excel source analysis

**XLSX 50 MiB, up to 3,000,000 populated workbook cells, 30,000 rows × 256 columns per sheet, and 10,000 formula cells.** The v0.41 streaming sheet XML parser removes full-worksheet DOM allocation; sparse indexed selection and bounded previews support large-table analysis. When a workbook has over 5,000 cells, only the selected derived chart/table result (plus original filename/sheet/range attribution) is saved in the editable project; the source workbook must be re-uploaded for unrelated raw ranges. Chart outputs are still limited to 360 points and XLSX uncompressed ZIP to 256 MiB.

[Large Excel design, security constraints and **manual** browser acceptance commands](docs/EXCEL_CAPACITY_V041.md). The feature code is committed; full 3-million-cell real-browser/device memory acceptance and production rollout are independent gates, not implied by the source-only commit. GitHub Actions auto-build remains disabled.

---

# DoCut Studio — v0.33 professional report gallery

**20 global public-report research references × 6 editable, self-contained 16:9 page layouts = 120 page structures.** Select `페이지 키트` to find McKinsey, BCG, Meta, BlackRock, IMF, and other reference families. Click a pack's six-page strip to inspect each page; insert one page or an entire six-page storyline. The official original is linked only as research provenance. Older 20 single-page layouts remain under `기존 일반 레이아웃`.

DoCut provides independently authored layouts without copied corporate logos or source pages, and all numeric data are empty placeholders awaiting verification. See [v0.33 reference pack details](docs/PROFESSIONAL_REFERENCE_PACKS_V033.md).

---

# DoCut Studio — v0.32.0 development

This source-only update adds page-aware right-click, proportional auto-fit and direct application for page compositions, a visual icon-first 89-choice motion gallery, and persistent next-scene exit motion. Six new unit tests and a dedicated Chromium acceptance script cover editor/export parity. Open `index.html` with `assets/` or the verified bundled offline editor HTML.

Read [v0.32 change log, evidence and limits](docs/RELEASE_V032.md). No installer, ZIP, auto CI, GitHub sync or production deployment is claimed.

---

## Previous releases

# DoCut Studio — v0.31

This release adds a thin all-page overview strip, draggable/floating/dockable panels, recursive title/subtitle/body/image layouts, sandboxed HTML and estimated image-reference extraction, contextual right-click tools with persistent partial fonts, and explicit multi-sheet Excel bindings.

See [v0.31 evidence and limits](docs/RELEASE_V031.md) and [device checks](docs/MANUAL_QA_V031.md). Open `index.html` next to `assets/`, or use the standalone editor HTML. `npm test` and `npm run check:syntax` validate the source. Git deployment and GitHub Actions remain disabled.

---

## Earlier release history

# DoCut Studio — v0.30 development

Buildless interactive HTML/JSON report and poster studio. The integrated plan is still in progress; PPTX is excluded from the active product.

This batch adds six output frame choices, topic/page navigation and URL restore, local XLSX/CSV data bindings with filters, smart connectors and 2.5D poses, Markdown quick creation and structured scene JSON. Open `index.html` with the `assets` directory, or the standalone editor HTML.

See [release evidence and limits](docs/RELEASE_V030.md), [measured gates](docs/PROGRESS_V030.json) and [physical-device checks](docs/MANUAL_QA_V030.md). Run `npm test` and `npm run check:syntax`. GitHub Actions are not configured; `vercel.json` disables automatic Git deployment. Production release is explicit.

---

# DoCut Studio — v0.29 development

Current development follows [the integrated midterm plan](docs/INTEGRATED_MIDTERM_PLAN_v1.1.md). The product target is interactive standalone HTML and editable JSON. PPTX is excluded from the active product.

This batch restores the exact v0.28 source tree, adds semantic layout proposals with visual comparison, preserves locked/grouped content, cancels overflow atomically and removes the active PPTX export path. See [the checkpoint](docs/RESUME_CHECKPOINT_V029.md) for verification and explicit remaining work. The full integrated plan is **not complete**.

Run `npm test`, `npm run check:syntax`, and `node tools/audit_midterm_v029.cjs`. Open `index.html` with its adjacent `assets` directory to use the editor. In Elements → Layouts, keep content preservation enabled to compare and apply a layout.

---

## Historical recovery notes (superseded product scope)

# DoCut Studio — v0.28.0-development


## 2026-11-06 · v0.28 실시간 효과 스튜디오·복합 라이트 보정

- 상단 `효과 미리보기`, 디자인 탭 및 선택 카드의 모션 패널에서 **실행 프리셋 33종**과 **개별 효과 32종**을 실제 샘플로 검색/분류/재생한다. 적용 버튼 전에는 원본 변경 없음.
- 기존 커서/앰비언트/엣지 효과가 단일 `::after`를 덮어쓰던 중첩 버그 해결: 독립적인 광원 DOM 레이어를 통해 하나의 카드에 **최대 3종 복합 효과**를 표시한다.
- 카드별 광원 색상·반경·강도·3D 기울기 각도·엣지 속도 선택, HTML 내보내기 시 동일 데이터/스타일 보존. 속도 애니메이션은 유한 2회, 동작 줄이기 설정 대응.
- `#RGB[A]`, `#RRGGBB[AA]`, `rgb(...)`, `rgba(...)`의 배경 알파만 분리해 글자·수치·차트를 불투명하게 보존. 광원 조절은 출처·기준일·검증 표시를 변경하지 않는다.
- 프로젝트 글꼴 전체 적용 시 **잠금 요소 포함은 명시적 체크박스**로만 수행. 기본은 잠금 보호, Undo 지원.
- v0.27 20개 페이지 키트·9개 팔레트·89장 참조 인덱스·8위치 원형 로고는 유지한다. 89장 스크린샷 = 89개 실행 모션이 아님.
- 문서: [`docs/DESIGN_V028.md`](docs/DESIGN_V028.md), [`docs/RESUME_CHECKPOINT_V028.md`](docs/RESUME_CHECKPOINT_V028.md)와 대상별 통합 검사.
- 독립 파일(오프라인 editor) 1회 작성: `python tools/build_standalone_editor_v028.py --output /mnt/data/DoCut_Studio_v028_Offline.html`.
- **원격 상태:** 로컬 개발 구현과 GitHub 업로드·Vercel 최신 배포·Windows/Android 실기 통과는 별개. 기존 GitHub 저장소가 빈 상태이며 GitHub 연결 쓰기가 403이라 원격 완료로 표시하지 않는다.


## 2026-11-06 · v0.27 디자인·모션 강화

- 전문 보고서 페이지 키트 20종(신규 10종 포함), 강화된 그리드 썸네일.
- 요소별 **배경 불투명도** 조절: 글자·내용을 흐리지 않고 카드의 배경만 투명화.
- 요소별 3효과 조합에 커서 추적 광원, 3D 틸트, 앰비언트 광원, 엣지 라이트 추가.
- 마스터 로고 8위치·원형 기본·크기/여백 조절, 전체 페이지 폰트 일괄 적용.
- 89개 참고 스크린샷의 **인덱스**를 디자인 탭에서 한 번에 열기(89개 전부 실행 효과는 아님).
- 개발 가이드: [`docs/DESIGN_V027.md`](docs/DESIGN_V027.md).
- 별도 설치가 필요 없는 단일 HTML 편집기 빌드:
  `python tools/build_standalone_editor_v027.py --output DoCut_Studio_v027_Offline.html`

---


## V0.26 — three-mode validation, resizable glass panels and reference discovery (source only)

- A top-level `검증` action immediately before `콘텐츠 점검` swaps the existing right inspector into **1 오탈자 / 2 보고서 문제 / 3 AI 문장 개선**. Spelling uses conservative Korean/English local rules, not a claim of complete Korean grammar checking. It reviews element text and page tab/headline/subtitle, supports page/selection scope, individual approval, Undo and one-session false-positive ignore. No automatic edits, no background remote calls.
- `보고서 문제` reuses the existing read-only factual/layout/evidence quality warnings; the AI mode explicitly copies only the selected plain text and waits for a pasted proposal, before/after review and approval. The edit planner blocks changed numbers, dates, units, citation lines (including parenthesized citations), URLs, email addresses, locked/hidden or rich-formatted blocks and stale edits. Existing per-element source/statistics remain unchanged.
- The left **pages/elements/design** and right **element/validation** panels use hairline glass separators. Drag or press arrows (Shift for bigger steps, Home/End, double-click reset). Width preferences live only in local UI storage; responsive mobile overlays remain intact and the report canvas stays 16:9.
- Simplified design entry shows three quick theme swatches with active state; all nine palettes and previous page kits remain under expandable tools. There are now **11 declarative page transitions**, shared by preview and standalone offline HTML. The expanded 89-reference **metadata** catalog has search/filtering by title, filename, and number (01–89). The source ships with the 89 filename/description index for deterministic regeneration, **not** the original JPEGs or animation frames. Mapping is not pixel fidelity or 89 unique effect implementations.
- Source-only checks: `sh tools/check_source_v026.sh` (manual opt-in; no CI, build, deploy, installer, ZIP or released PPTX). Details: `docs/V026_BASELINE_VALIDATION_UX_PLAN.md`, `docs/VALIDATION_UI_V026.md`, `docs/REFERENCE_89_MAPPING_V026.md` and `docs/PHASE_0_26_STATUS.md`.


## V0.25 — offline scene clock, cinematic report playback (source only)

- Each 16:9 page now has a 3–60 second scene duration; editor and self-contained offline HTML have deliberate-play, pause, stop, speed presets (0.5/1/1.5/2×), optional loop, page seek and *whole-report seek*.
- CapCut-like weighted scene strip shows page titles, proportional dwell time, elapsed progress; clicking seeks to that scene. The view remains contained, with no page-level scroll on small screens.
- Up to 16 nonoverlapping timed captions per page in exact milliseconds. Enter `0-4 | Caption`, press explicit Apply; caption styles Cinema/Glass/Minimal. Input is validated as an atomic change and supports Undo/Redo; public subtitle text never becomes executable HTML.
- The standalone HTML embeds its player runtime; no internet, external script, build step or video file. No generated MP4, narration or PowerPoint-native timed animation. Reviewer notes stay out of public exports.
- See `docs/STORYBOARD_PLAYBACK_V025.md`, `docs/PHASE_0_25_STATUS.md` and `docs/RESUME_CHECKPOINT_V025.md`. Browser tests are synthetic only. **No auto-CI/Actions, installer, APK/ZIP, released PPTX or production deploy.**

## V0.24 - editable original page kit gallery (source only)

- Ten original 16:9 page compositions for executive summary, problem, evidence, options, decision, KPI, trend, roadmap, risk and feedback. Combine a built-in layout with nine existing DoCut palette choices. The live schematic previews actual block positions, colors and fonts rather than a static screenshot.
- Insert new pages **after** the current one, never overwrite an existing page; preserve Undo, IDs, the 50-page cap and original report evidence. All quantitative and source slots are explicit unverified placeholders, not factual examples.
- Capture current-page geometry, styling and motion as a reusable personal kit. Remove private body text, numbers, sources, images, rich runs and reviewer notes. Store at most 20 kits separately in browser storage, with stale-write rejection, reviewed JSON import/export and corrupt-data export-before-reset protection. Custom kits retain their own color palette.
- Open **page kits** in the toolbar or Pages pane. Source details: `docs/PAGE_KITS_V024.md` and `docs/PHASE_0_24_STATUS.md`. Use manual `sh tools/check_source_v024.sh` only when needed; **no auto Actions, installers, ZIPs, production deploy or real PPTX created**.

## V0.23 — private editorial review board (source only)

- New offline review board: page/element/document comments, priority/status/replies, search/filter, page badges, location navigation and re-targeting orphaned reviews, full Undo. Resolve state is **not** proof that a claim was verified; if anchored content changes after resolution, the board shows an advisory that re-review is needed.
- Import up to 20 of the quality analyzer's high/review issues into human-managed feedback **only after confirmation**; repeated imports avoid identical notes and do not modify report source, statistics, or verified flags.
- Native DoCut JSON and local checkpoints preserve private feedback. Standalone HTML, public report text, default AI prompt and PPTX exclude author names and feedback. Review TXT/CSV and source-free private JSON packets are exported only on explicit click. Packet import requires same original report, an explicit checked approval, unchanged document state, and a safe backup; ID conflicts are rejected rather than overwritten.
- Open review board via `검토 메모` or `Ctrl+Shift+M`. See `docs/REVIEW_BOARD_V023.md` and `docs/PHASE_0_23_STATUS.md`. Source-only checks use `sh tools/check_source_v023.sh`. **No GitHub Actions workflow, installer, ZIP or production deployment is created.**

## V0.22 — selective, evidence-aware AI proposal approval (source only)

- AI JSON/Markdown proposal review is **read-only until approval**. It presents individual page metadata, changed elements and project settings with before/after text, source and numeric claim warnings. Approve only the exact selections, and separately acknowledge numerical and provenance changes. A change in the selection resets these acknowledgments.
- For pages with many changes, review elements in groups of 22, reveal all before approving an entire page, and expand inert full-text/source previews on demand. Reject stale/modified candidates and mismatched rich-text display strings; retain locked elements and do not allow AI to stealth-lock or conceal layers.
- Destructive batch actions (AI proposal, reviewed find/replace, CSV/TSV update, HTML/JSON append or replacement) require a successful local pre-change backup. If browser storage is full, they pause until the user separately downloads the **unchanged current project JSON** and retries.
- Run the source-only grouped QA with `sh tools/check_source_v022.sh`. No GitHub Actions workflow, installer, ZIP, production deploy, or real PowerPoint file is generated. See `docs/AI_REVIEW_V022.md`, `docs/PHASE_0_22_STATUS.md` and `docs/RESUME_CHECKPOINT_V022.md`.

## V0.19 — media crop, layer folders and batch layout (source only)

- Non-destructive PNG/JPEG/WebP focal cropping, fourfold cover zoom, contain/cover/fill, frame aspect lock and alt descriptions. Drag directly inside an image to adjust focus, use arrow/Shift+arrow for keyboard focus, and reset with Undo. Embedded HTML remains offline and PNG/JPEG PPTX images now use native image source-crop rectangles.
- Name/collapse/select multi-element layer folders, duplicate/copy/move between pages without group-ID collision, guarded lock-aware edits, Undo-safe canvas alignment and spacing. Existing numeric data, citations and media source evidence are preserved when editing elements.
- Smartphone JPEG EXIF orientation and WebP VP8-family intrinsic dimensions are parsed with bounds; original media bytes are not modified. WebP PPTX uses a placeholder, and PowerPoint desktop compatibility is unverified.
- See `docs/MEDIA_AND_LAYERS_V019.md`, `docs/PHASE_0_19_STATUS.md` and `docs/RESUME_CHECKPOINT_V019.md`. Run grouped manual source tests using `npm run check:syntax`, `npm test`, browser `v019` + previous suites, and both PPTX *in-memory* scripts. **No installer, ZIP, Actions or new deployment has been created.**

## V0.18 - local persistence and recovery safety (source only, not deployed)

New **atomic checksummed local checkpoints** with non-destructive legacy migration, cross-tab stale-write warning and JSON rescue export, corrupt backup-index export/reset guard, preview-before-restore differences, and live rich-text saving with no silent 12,000-character / 60-run clipping. The checkpoint checksum is not cryptographic; browser localStorage is not a multi-tab database or cloud backup. See `docs/PHASE_0_18_STATUS.md` and `docs/STORAGE_AND_RECOVERY_V018.md`.

Run the full source-only checks manually with `sh tools/check_source_v019.sh` (syntax, Node, all Chromium suites and both in-memory PPTX checks) or invoke an individual script after a focused fix. The command does not create installers/builds. Run checks **manually as one batch** using `npm run check:syntax`, `npm test`, `python tests/browser_v018.py` and the historical browser/PPTX structural suites. No install artifacts, automatic Actions or source-to-production deployment in this phase.

> **Important source provenance:** This is a reconstructed developer source tree, NOT an exact copy of the earlier v0.12 Git commit. The current conversation retained the v0.12 index and documents but not its asset directory or Git history. We recovered original v0.7 JavaScript/CSS modules from the same DoCut project's Library, integrated the v0.12 interface contract and reimplemented the verified advanced behavior. Historic v0.12 test counts and its 88.3% acceptance score MUST NOT be attributed to this code.

DoCut is an offline-first, browser-based, 16:9 report editor with video-like layered editing and motion. It runs from `index.html` with the `assets` directory in the same folder, without a build step, CDN, service account or installation. **Open `index.html` from this complete source tree, not the HTML file alone.**

## Implemented from V0.13 recovery through V0.17 source development

- 1280×720 report canvas, a desktop multi-panel studio, and mobile full-width canvas with an optional slide/assets drawer and an Inspector overlay.
- Five Korean report-story modes (strategy, policy, quarterly, research, alternatives), 1–8-page narrative presets, nine designs and twelve layout presets. User-edited page titles may be preserved.
- Seventeen editable block categories: headline, text, cards, KPIs, bar/line/donut and evidence-based statistical charts, tables, shapes, notes, images, bullets, quotations, dividers and sources. Page thumbnails, layer ordering, grouping, locking and hiding, drag/resize, snap-to-center, clipboard, undo/redo, page reordering and copy/move.
- Rich text formatting while editing: bold, italic, underline, individual foreground/highlight color, plus whole-block font, weight, size, borders and backgrounds. Text changes are undoable.
- CSV/TSV spreadsheet data import into charts and tables with quoted field handling, signed chart values, marked unverified imported data and provenance filename. Tables now have a native cell editor with add/remove row/column, per-cell formatting and multi-cell paste. Charts show a zero baseline for positive and negative values.
- Up to three motion effects per block with individual durations, delays, **nine-channel start/end poses and mid-keyframes**, cubic-bezier handles and temporal scrubbing. Motion runs in one composed animation, supports reduced-motion preference and produces replayable standalone reports.
- Safe static HTML conversion of local text/layout/style data, with diagnostics indicating unsupported CSS/external resources/JS. Importing DoCut's own exported HTML restores native editable project JSON. Append imported pages with new IDs; maximum 50 pages.
- Export editable project JSON, independent report HTML, TXT containing HTML, summary TXT, source-audit TXT, an AI-context prompt, and a statically editable PPTX. PowerPoint text, cards and table cells are native editable shapes; chart lines and bars are shape elements (not a native Excel-linked chart). Animations are *not* transferred into PPTX.
- Import/export and user notes work offline. User-provided numbers are not automatically asserted as factually verified. No direct cloud-AI service or background upload is included.

## V0.17 statistical chart development (source only)

- Nine specialist editable charts: cohort retention, small multiples, control, forest, fan intervals, Kaplan–Meier survival, signed contribution, cumulative lift and ROC.
- A source-first UI with empty default data, atomic numeric validation, explicit control/reference thresholds, CSV/TSV preview and cancel, data field header copy, selection undo, trust-flag invalidation, and nine shared PPTX-geometry modes. Existing citations are preserved for specialist statistical CSV updates; incoming filenames are attached as traceable evidence. No approval without actual rows and required control limits.
- One statistic-only two-step animation preset (fade + stat-reveal). HTML renders accessible SVG and its per-page provenance drawer can expose the **complete original data table and audit warnings**; PowerPoint preserves editable primitives rather than a raster picture or Excel chart series.
- **No invented source observations**: the user must supply the numeric data, population definitions and source. See `docs/STAT_CHARTS_V017.md` for exact semantics and known limitations.

## Source structure

```
index.html
assets/
  core.js               # recovered v0.7 base model
  core_enhanced.js      # v0.13 reconstruction and schema
  effect_catalog.js     # V0.16/V0.17: 9 palettes, 12 layouts, 29 presets
  page_kits.js          # V0.24: ten original layouts, safe custom kit library
  story_player.js       # V0.25: timed captions, global report clock and local scheduling
  stat_charts.js        # V0.17: source-based nine statistical diagrams
  easing.js             # deterministic 2.5D motion/keyframe composition
  visual_motion.js      # text, counter, chart motion WAAPI runtime
  css_import.js         # non-executing static HTML/CSS conversion
  data_io.js            # CSV/TSV parser and data adapters
  media_layout.js       # V0.19: image dimensions, crop geometry, focal and aspect operations
  layer_ops.js          # V0.19: group folders and safe batch transforms
  rich_text.js          # partial formatting serialization
  export.js             # report rendering and reversible HTML
  pptx.js               # offline static-editable PPTX OOXML writer
  proposal.js           # untrusted offline AI JSON diff + selective approval
  app.js                # studio state, UI and interactions
  styles.css            # visual studio and responsive views
package.json
tests/core.test.cjs
     advanced.test.cjs
     browser_recovery.py
     browser_extended.py
     browser_v014.py
     browser_v015.py
     browser_v016.py
     browser_v017.py
     pptx_stats_memory_v017.py
     stat_charts_v017.test.cjs
     effect_library_v016.test.cjs
     media_layers_v019.test.cjs
     browser_v019.py
     proposal_v015.test.cjs
     export_runtime_v015.test.cjs
     pptx_provenance_v015.test.cjs
tools/sync_export_runtime.py
docs/
  PHASE_0_13_RECOVERY_STATUS.md
  ACCEPTANCE_RECOVERY_V013.md
  MANUAL_QA.md
  ...previous v0.7-v0.12 checkpoints (historical only)
```

## Tests — manual invocation, not GitHub Actions

```bash
npm test
npm run check:syntax
python tests/browser_recovery.py
python tests/browser_extended.py
python tests/browser_v014.py
python tests/browser_v015.py
python tests/browser_v016.py
python tests/browser_v017.py
python tests/pptx_memory_qa.py
python tests/pptx_stats_memory_v017.py
# npm test includes 50-page / 800-element export and script-injection-safety checks
```

The V0.14 historical verification is recorded in `docs/PHASE_0_14_STATUS.md`. The prior V0.15 grouped local verification reached **90/90 Node checks and 52/52 headless Chromium checks**, plus an in-memory PPTX parse and JS syntax. Current V0.16 source verification reached **102/102 Node and 66/66 headless Chromium**, JavaScript syntax and an in-memory PPTX parse, without producing installer or package artifacts. The V0.15 source-only evidence is in `docs/PHASE_0_15_STATUS.md`. Browser tests use headless Chromium with the script contents supplied directly to the page, because the runner's local `file://` navigation is blocked. These checks do not substitute for real Windows Brave, Android Brave, or PowerPoint physical-use verification.

V0.17 grouped local source verification (2026-11-04): **116/116 Node tests; Chromium 79/79 across 6 suites; both memory-only PPTX suites PASS (including 9 editable chart variants and 9 slides); JavaScript syntax PASS; `git diff --check` PASS.** This does not measure real-device acceptance or the original 89 screenshots. The remote GitHub repository remains separate and was not source-synchronized.

## Limitations and safe operation

- The editor does not reverse engineer arbitrary third-party Grid/Flex/JavaScript/remote asset designs to pixel-perfect fidelity; it produces an editable approximate layout and flags unsupported features.
- Imported CSV values and AI-supplied changes require human verification of source, calculations and semantics before publication.
- PPTX is static and shape-based. Its masks, fonts, full editable chart data, timing and transitions are not equivalent to HTML and have not yet been checked in actual desktop PowerPoint.
- Browser storage can be evicted. Save a `.docut.json` copy periodically. A project backup is generated before potentially destructive import/AI operations.
- A fixed source design reference has not been supplied for pixel-diff similarity; design match percentage is **not measured**.
- For compatibility, the app runs locally without network/CSS imports; a browser may substitute a locally available sans-serif font when Pretendard is not installed.

## Operations

- No GitHub Actions workflow is shipped. Routine push should not trigger a build.
- No EXE/APK/ZIP installation bundle or release artifact is built or generated as part of development or automated tests.
- Source upload target: `https://github.com/neoflowcore/DoCut` (`main`). The remote was verified empty. If the connected GitHub integration still denies writes (HTTP 403), this local commit does **not** mean that remote deployment succeeded.
- The user deferred hands-on validation until more functionality is complete. See `docs/MANUAL_QA.md` for a future test plan; do not interpret these instructions as a request for manual testing today.

## V0.14 development changes and verification boundaries

- Direct motion pose editing for each of three effects, richer mid-keyframe channels, motion time sampling capped to control work.
- Nested HTML rich text and local embedded image conversion, with unsafe/external resources excluded; imported HTML is still an **approximate editable reconstruction**.
- Multi-select clipboard with preserved group identity, adaptive dense layouts, neighbor-edge snapping and bounded pointer movement.
- Local image chooser, editable spreadsheet cell grid and an in-panel mobile inspector close control.
- PPTX fixes for duplicate image names across pages, supported logo images, decreasing line segments, palette support and basic character-level styling. PPTX *still* requires Microsoft PowerPoint hands-on validation and is not a native Excel-chart exporter.
- Explicit source verification warnings and contrast checks. No AI changes or imported numbers are automatically verified.

Corrupted local backups are ignored safely, and blocked browser storage is identified separately from a full quota. A source-only 50-page/800-element stress test is included.

The V0.14 acceptance matrix and evidence are in `docs/ACCEPTANCE_RECOVERY_V014.md` and `docs/PHASE_0_14_STATUS.md`. The full V1.0 product completion rate and a design-reference similarity score are **not measurable from the available approved baseline**.

## V0.15 additions — reviewed, reversible, evidence-first

- Open **AI 제작 결과 검토** and paste a DoCut schema-3 JSON project or a single Markdown fenced JSON block. The tool displays page-by-page and numeric before/after changes, with **nothing approved by default**. Choose exact pages to apply; shared theme/title settings require a separate checkbox. Unselected pages and previously recorded provenance remain intact; modified elements' verification is revoked. AI results are never executed as code or claimed factual.
- Inspector can edit the source, as-of date, unit and evidence for a selected element. Output source-audit TXT to review those fields. Independently exported HTML includes an optional safe text-only source panel per page; chart value labels also expose units.
- Local CSV/TSV file import does **not** immediately overwrite: preview, Cancel, Apply and Undo are separate. Oversized or malformed native source input fails explicitly. Safe HTML imported from other tools remains an *approximate* editable conversion, with explicit warnings for omitted rows/text/pages and unsupported runtime/CSS.
- Native import now rejects rather than silently clipping extra rows/columns, chart numbers/labels, motion effects, keyframes, rich-text runs, invalid basis dates, duplicate IDs or oversized provenance. The editor's direct series/grid input uses the same data-preservation principle.
- PPTX source/date/unit/evidence is stored as supported shape metadata, but the PowerPoint output remains statically editable shapes without HTML animation, Excel-linked chart data or verified desktop Microsoft Office support.
- **Security/operations:** no cloud upload for AI proposals or local CSV; no GitHub Actions/workflows, installer/EXE/APK/ZIP artifacts, or CI builds. GitHub write access for this repository was checked and returned HTTP 403; local source-only Git history does not equal a remote push.

The fixed reconstructed-source acceptance is **42/53 (79.2%)**, with phase figures in `docs/ACCEPTANCE_RECOVERY_V015.md`. This is not overall V1.0 completion, visual-design similarity or real-hardware certification.

## V0.16 developer batch — latest code, not remotely released

- Inspect `docs/EFFECT_LIBRARY_V016.md` for the 27 extra motion kinds, 28 category-matched recipes, 9 color themes, 9 chart palettes, 12 layout templates, page transitions, and motion numeric/2.5D constraints. The former 89-JPG reference archive is **not** included; no exact visual similarity is claimed.
- Editor controls: choose a motion library recipe on any unlocked element, sort up to three effects, select the page-level recommended effects action, edit X/Y 2.5D start/end poses and scrub a dynamic timeline. Manual Undo preserves content and source metadata.
- Standalone report: both static motion runtimes embedded from exact source via `python tools/sync_export_runtime.py`. Do not rebuild/install; no remote asset fetch is required.
- Third-party HTML import: adds bounded nested-position conversion and local CSS `data:image` background conversion, while continuing to warn about arbitrary unsupported HTML/CSS/JS. Native DoCut HTML/JSON retains its editable metadata losslessly.
- Source state and test receipt: `docs/PHASE_0_16_STATUS.md`; remote and recovery: `docs/RESUME_CHECKPOINT_V016.md`. GitHub integration HTTP 403 remains a blocker. The existing READY Vercel deployment serves **0.15.0** (checked HTTP 200 on 2026-11-04), not V0.16. Overall V1 product completion and design match percentage remain **unmeasured**.

### V0.20 candidate import and text-edit approval

- Foreign HTML import now opens a **read-only comparison review** with current-vs-converted page schematic maps, explicit warnings, file-size/page limits, manual acknowledgement for lossy conversions, and TXT diagnostic export. No original browser CSS/JS is executed in this preview.
- Search dialog includes **literal find and replace** with per-element checkboxes (none selected by default), lock/provenance/verified-data safeguards, protected rich formatting, stale-baseline rejection, and Undo. Table cells, chart data and source fields are not rewritten.
- See `docs/IMPORT_REVIEW_AND_TEXT_V020.md`; do not claim screenshot pixel parity or real-device verification.

## V0.21 source-only work — structured report quality review

- **Content quality assistant** (read-only): chapter/story arc map with contextual writing questions, severity/category filters, per-element navigation, editable-source guidance, TXT audit and a reviewed AI prompt. It checks whether data sources, dates, units and verification flags were entered, **not whether those facts are true**.
- **Presentation diagnostics**: off-slide geometry, probable peer overlap, text density, direct-color contrast, image alt/media, excessive motion and source-bound statistical requirements. Max 1,200 displayed issues; totals include overflow. All checks run locally without changing original content, user verification flags or numeric data.
- **Import decision support**: shows the independent issue counts of current project and proposed converted HTML. This is **not** pixel-diff or evidence for 1:1 source fidelity. Import remains opt-in with V0.20 review and loss acknowledgement.
- Manual source validation: `sh tools/check_source_v021.sh`. See `docs/QUALITY_REVIEW_V021.md` and `docs/PHASE_0_21_STATUS.md`. Browser tests use an injected Chromium runner; real Brave/PowerPoint testing and GitHub sync remain separately gated. No release build, installer or Actions artifacts.

### V0.21 local source QA status (2026-11-04)

- JS syntax PASS, Node 208/208, Chromium 141/141 verified by ten independent source-only suites, two in-memory PPTX checks PASS. This does not imply the single shell runner completed as an uninterrupted session.
- Added a non-mutating `quality_review.js` advisory engine, five story-mode maps, source/date/unit and statistical diagnostics, media/geometry/contrast/performance hints, pair-navigation for collisions, TXT and spreadsheet-injection-safe UTF-8 CSV audit export, bounded AI improvement prompt and independent import candidate warning counts.
- No Windows/Android Brave or Microsoft Office physical verification, no design reference match percentage. Next gates: `docs/REMAINING_V1_GAPS_V021.md`, `docs/MANUAL_QA.md`, and project `/DoCut` source-only recovery patch.

### Git Push / Vercel 안전 모드

GitHub Actions 워크플로 파일은 만들지 않습니다. 루트 `vercel.json`에는 `git.deploymentEnabled: false`가 있어 해당 설정이 연동된 Vercel 프로젝트에 적용될 때 일반 Git Push 자동 배포를 차단합니다. 소스 커밋만으로 기존 Vercel 운영 프로젝트 설정이 실제 변경됐거나 배포됐다고 간주하지 않습니다.
