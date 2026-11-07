# DoCut V0.13 recovery — verified development checkpoint

## Baseline and provenance

- Project: `neoflowcore/DoCut`, intended branch `main`.
- Remote checked at start of this session: repository exists; GitHub content endpoint said the repository is empty and branch list was `[]`.
- Only an old v0.12 `index.html` + project reports persisted locally in the current execution session. Original v0.12 `assets/` and `.git` were unavailable; the previous local commit `ce39ff4` is a **historic checkpoint, not the parent of this reconstruction**.
- Through DoCut project Library, original v0.7 `core.js`, `app.js`, `export.js`, `styles.css` were recovered and used as the base; missing features were reimplemented. New local branch `main` contains source-only reconstruction. Historical documents retained as evidence, not as present acceptance results.

## Work performed

- Repaired editor initialization and 15-type schema, 7 themes, 5 report-story modes, Korean 1/2/3/4/5/6/7/8 page title arcs, seven layout presets, master footer/logo/page number reflection.
- Implemented page thumbnails, reorder, grouping, lock/hide, page move/copy, basic snap, persisted undo/redo; responsive mobile page drawer.
- Implemented 3-effect serial motion, easing graph math, start/end/keyframe structure and draggable timeline; standalone motion CSS/JS runtime.
- Implemented guarded static HTML/CSS import and diagnostics, native DoCut HTML/JSON roundtrip, local spreadsheet CSV/TSV parsing, source labels, signed chart values and note/AI validation boundaries.
- Implemented selection-based rich text editing with font/highlight color, including a repaired focus problem in native color inputs and normal-weight override for bold titles.
- Implemented single-file HTML report exporter and self-contained static-editable PPTX OOXML writer (native editable text/table cells and shapes; shapes-based charts; no PPTX animations).
- Added current-source automated unit and real Chromium input tests; fixed canvas and text-panel mobile layout after visual QA.

## Test record (latest run)

- `npm test`: **40/40 passed**.
- `python tests/browser_recovery.py`: **14/14 passed**.
- `python tests/browser_extended.py`: **11/11 passed**.
- `npm run check:syntax`: all JavaScript files passed parsing.
- Browser checks include actual pointer, keyboard, local file chooser, modal state, group movement, timeline delay drag, rich-text formatting/undo, editor/preview master and responsive 390×844 canvas.
- Memory-based PPTX OOXML serialization tested; a temporary PPTX was parsed by Python `python-pptx` and then deleted, not released or stored as installation artifact.
- Reversible HTML runtime (5 pages, next-page counter, Easing object, animation, no JS error) passed.
- Windows Brave: **not tested**. Android Brave physical touch: **not tested**. Desktop MS PowerPoint: **not tested**.

## Acceptance and unresolved blockers

- See `docs/ACCEPTANCE_RECOVERY_V013.md`: **41/53 = 77.4%** newly defined current-source criteria (not V1.0 overall score).
- Design-reference pixel match: **not measured**; no approved canonical reference and tolerance.
- Complex third-party HTML remains a safe approximate importer, not a 1:1 editor.
- Native PowerPoint/Excel-linked charts, HTML motion translation into PPTX, real MS PowerPoint compatibility, Windows/Android hardware manual testing remain incomplete.
- GitHub remote remains empty unless a remote write operation and subsequent independent read confirms an upload. Earlier GitHub connector create-file and create-blob writes returned 403; direct Push historically failed because of network/DNS.
- No GitHub Action workflow configured. No EXE, APK, ZIP or installer output. No automatic builds or artifact uploads.

## Next safe development checkpoint

- Improve non-destructive generic HTML import and media asset mapping before requesting a user hands-on check.
- Implement custom start/end pose editor per motion effect and strengthen partial rich-text/complex table UI.
- Keep a single source-only Git commit; when GitHub integration can write, push only the source and verify remote head without triggering CI.
- The future manual plan is in `docs/MANUAL_QA.md`. The user expressly chose development first and hardware testing later.
