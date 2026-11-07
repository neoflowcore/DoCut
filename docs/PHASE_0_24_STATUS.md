# DoCut V0.24 - source development acceptance and remaining gates

Date: 2026-11-04 KST. Target project: https://github.com/neoflowcore/DoCut (main); legacy Vercel production remains separate.

## Scope actually implemented

- Ten independent original 16:9 report composition kits: executive summary, problem framing, evidence ledger, option comparison, decision memo, KPI performance, trend, roadmap, risk register and opinion collection. Built-in templates are editable; titles and all numbers are user input placeholders.
- Interactive kit gallery with category and text search, 16:9 color/geometry previews, aria-pressed selection, mobile responsive preview and nine established DoCut palettes. Filtered-out/no-match designs cannot be inserted accidentally.
- Insert pages after current without replacing existing report slides. Page/element/group identifiers are remapped, capacity checked at 50 pages, pre-mutation project backup required, Undo/Redo preserved.
- Capture private custom page layout after removing actual text, rich text, charts/table values, statistics, image data, source, author/reviewer comments, dates, verification, inherited locks and original IDs. Personal name is user-supplied and is not anonymized automatically.
- Separate browser-only personal library up to 20 kits. Data-preserving optimistic concurrent-write detection, capacity/error refusal, source-only export, reviewed/imported library JSON, duplicate and conflicting-ID handling, corruption-safe export before reset. The localStorage boundary is not transactional across two simultaneous writes.

## Source-only test record

- Syntax checking: source JavaScript and core style loads PASS.
- Node tests: 338/338 PASS, including V0.24 new 43/43 (measured in development test environment).
- Historical headless Chromium suites V0.13/extended/V0.14..V0.23: 204/204 PASS across 12 separate executions; no assertion of a single uninterrupted browser run.
- V0.24 Chromium source test: 29/29 PASS, four batches (8 + 8 + 8 + 5) re-run after final UI search/dropdown changes. Total synthetic Chromium checks across previous 12 suites and V0.24: 233/233, not a single uninterrupted browser run.
- PPTX **in-memory** structural tests 2/2 PASS. A real PPTX file was not created. Browser screenshots at 1480px and 390px were visual sanity checks in synthetic Chromium, not physical Android/Windows Brave testing.

## Progress denominator integrity

Historical V0.15 53-item acceptance matrix (NOT product V1.0 completion): P0 4/6=66.7%; P1 9/10=90%; P2 9/10=90%; P3 7/8=87.5%; P4 9/11=81.8%; P5 4/8=50%; total 42/53=79.2%. This number was not remeasured after page-kit development and must not be increased without evaluating the exact original acceptance items. Whole-product V1.0 completion remains unmeasured. Similarity to the 89 design-reference JPEG images remains unmeasured; 10 original designs do not mean 89 source effects faithfully matched.

## Outstanding blocker and manual gates

- GitHub repository may be empty, with API Contents-write 403. Inspect remote main and write permission before claiming upload. A successful local Git commit is NOT remote upload.
- Existing production domain is still an older V0.15 release; V0.24 has not been deployed and Actions/EXE/APK/ZIP generated count stays zero.
- Manual QA is not performed: Windows Brave and Android Brave actual touch, IME, offline storage, file import, multi-tab conflicts, GPU usage, long report editing; actual PowerPoint opening/editing/re-saving on Office; visual comparison against original 89 images. One PPTX file can only be created immediately before a specifically requested hands-on validation.
- Custom palette preview is a schematic; font fallback and exact layout width in real devices require independent verification.

## Reproduction policy

Full source preserved in a Git format-patch **TXT**, with a V0.23 -> V0.24 incremental TXT and a separate resume receipt, to be stored in user Library `/DoCut`. Clone from a clean empty Git repository using `git init -b main && git am <full-transfer-txt>`; verify Git tree and tracked paths. Neither TXT is a ZIP, installer or binary executable.
