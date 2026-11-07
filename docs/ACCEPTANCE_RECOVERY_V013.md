# DoCut v0.13-recovery — current-source acceptance matrix

**Evaluation basis:** Only features directly inspected/tested in THIS reconstructed source tree, not the historic V0.12 60-item acceptance record. Each check has a concrete implementation or verification path. Product-wide V1.0 percentage is **not measurable** against a full product specification at present. Design draft pixel match is **unmeasured** (no canonical golden design + threshold).

## P0 Source recovery and versioning — 4/6 (66.7%)

- [x] Same-project source and last checkpoint documents inspected and sourced from the DoCut library.
- [x] GitHub `neoflowcore/DoCut` metadata, empty content, and empty branches inspected.
- [x] Source directory reconstructed, version recorded as `0.13.0-recovery`, and provenance noted.
- [x] One local Git source-only bundle commit after the final test pass; no workflow/installer artifacts.
- [ ] Original V0.12 `.git` and original assets fully recovered as identical bytes (not available).
- [ ] Actual remote main branch uploaded and verified (connector writes denied; push DNS blocked).

## P1 Editing and responsive design — 9/10 (90.0%)

- [x] 1280×720 fixed 16:9 report and desktop editing layout.
- [x] Fifteen insertable element types.
- [x] Pointer movement and resizing of editable boxes.
- [x] Group, layer lock and visibility with corresponding model changes.
- [x] Undo/redo including direct text edit.
- [x] Rich text selection, bold/normal, color and persistence into report HTML.
- [x] Live thumbnails, reorderable pages and layers.
- [x] Mobile page drawer and full-width artboard with no horizontal overflow in Chromium viewport.
- [x] Local CSV/TSV file picker and chart/table editable data.
- [ ] Actual Android pen/touch/IME usability confirmed on a physical device.

## P2 Motion and keyframes — 8/10 (80.0%)

- [x] No more than three effects per block enforced by model.
- [x] Per-effect duration and delay values.
- [x] Draggable effect bars changing timeline offset.
- [x] Midpoint keyframe data with maximum of four.
- [x] Cubic bezier handle editing and easing function evaluation.
- [x] Time scrub previews element poses.
- [x] Standalone HTML contains composed motion engine and replay works in Chromium.
- [x] Pause, stop and reduced-motion behavior implemented in code.
- [ ] Full UI for independent custom start/end poses per effect.
- [ ] Smoothness and GPU consumption verified on real user hardware.

## P3 Report narrative and design — 7/8 (87.5%)

- [x] Five Korean narrative modes, with specialized titles.
- [x] One-to-eight-page story arcs available in model and UI.
- [x] Seven design themes.
- [x] Seven page layout presets.
- [x] Page ordering by pointer drag.
- [x] Global footer, page numbers and optional logo reflected in editor and preview.
- [x] Content/source warning audit and source jump facility.
- [ ] Pixel-level comparison to a user-approved reference draft.

## P4 File exchange — 9/11 (81.8%)

- [x] DoCut standalone HTML embeds native JSON and round trips into editable data.
- [x] Safe HTML/CSS static importer with no arbitrary code execution.
- [x] CSV/TSV quoted row import and spreadsheet value mapping.
- [x] Independent HTML page navigation and combined motion.
- [x] JSON project export and restore routines.
- [x] HTML-code TXT and readable TXT plus source-audit TXT.
- [x] PPTX OOXML/ZIP serialized to memory and parseable by Python package.
- [x] AI project proposal parsed and diffed before explicit application.
- [x] Append imported pages with regenerated IDs and 50-page ceiling.
- [ ] Pixel-faithful reverse-import of arbitrary third-party Grid/Flex/JS and remote assets.
- [ ] Actual Microsoft PowerPoint open/edit/save verified on Windows.

## P5 Verification and release boundaries — 4/8 (50.0%)

- [x] Node unit tests pass on current source.
- [x] Chromium editor browser integration tests pass on current source.
- [x] JavaScript syntax checks pass.
- [x] Local Git source-only commit and Git whitespace check pass.
- [ ] Windows Brave manual end-to-end test.
- [ ] Android Brave manual touch/IME test.
- [ ] Microsoft PowerPoint manual edit-and-resave.
- [ ] GitHub remote source commit verified after upload.

## Summation

- Verified checked items = **41**; total written criteria = **53**.
- **Current recovery acceptance: 41/53 = 77.4%**.
- This is neither V1.0 completeness nor compatibility certification. It does **not** justify using the historical V0.12 figure of 53/60 = 88.3% for this reconstructed code.
- Action gate: no automatic Actions, no EXE/APK/ZIP, no physical-test release until the user explicitly asks.
