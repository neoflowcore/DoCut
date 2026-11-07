# DoCut v0.30 integrated development batch

Date: 2026-11-07, Asia/Seoul. Baseline: local v0.29 `83c698e`.

## Delivered code

1. Project schema 4 migrates legacy documents to an explicit output frame and primary-topic/page hierarchy; JSON, autosave and Undo share this model.
2. 16:9, 4:3, A4 landscape/portrait, 9:16 and validated custom dimensions; atomic page reflow, locked/group obstacles, source preservation and overflow refusal. Frame-aware logo anchors, editor fit, preview, report runtime and print CSS.
3. Primary topics, page assignment, keyboard topic shortcuts, encoded topic/page URL hashes, reload restoration and topic-filtered page navigation.
4. Offline XLSX ZIP/XML reading with CRC verification and bounded expansion; sheets, ranges, original cell strings, formatting codes, cached formulas, zero/negative values and warnings. No formulas, macros or external connections execute. CSV/TSV supported through the existing parser. Binary XLS remains unsupported; convert to XLSX/CSV.
5. Source snapshots and bindings for bar, line, donut, table and KPI; numeric validation, period filtering, rank sorting and table-row category linking. Missing numeric data is never changed to zero. Values are not automatically converted between percent/currency units.
6. Public HTML contains connected source ranges (including bindings on hidden objects), while native JSON retains complete imported snapshots. Raw Markdown snapshots and private reviews are excluded from public HTML. Imported original files are not overwritten.
7. Six connector routes, five head styles, eight fixed anchors plus automatic anchors, ID-based target tracking and obstacle-aware orthogonal candidate routing. Missing targets and impossible routes remain visible/inspectable; not a guarantee of perfect routing in every scene.
8. Independent 2.5D pose wrapper for rotation, pitch, yaw and depth; path-draw motion uses the shared editor/export runtime.
9. Three-step quick creation: Markdown/Marp-like input, semantic layout selection, review and append. Source snapshots retained, large content split or refused explicitly. Editable `docut-scene-1` JSON input supports text, shapes, embedded bitmap layers and connectors.
10. All functionality remains buildless; no GitHub workflow created, automatic Vercel Git deployment disabled, no EXE/APK/ZIP generated.

## Verification

- Final Node suite: 490/490 PASS; all asset JS syntax PASS.
- New integrated suite: 22/22 PASS, covering frame migration, data snapshots/ranges, ZIP integrity, source privacy, connectors, structured input and standalone script compilation.
- Cloud Chromium UI: A4 portrait (840×1188) with all 5 original nodes, Undo, Markdown 2-page/4-object append, arrow SVG insertion, primary-topic assignment and reload/hash restoration.
- Two real compressed XLSX fixtures parsed in Chromium: quarterly `0,-5,12,7` (7 is a cached formula), budget `3200,-1250,1950` (1950 cached formula). Both inserted into actual charts. Quarterly period UI changed displayed labels from `가:0 / 나:-5` to `가:12 / 나:7`; reload restored the saved default filter.
- Browser log inspection surfaced extension metadata errors; these are not DoCut application errors. No assertion of a globally empty browser console.
- One standalone editor HTML created: 37 modules, one stylesheet, no external script/CSS dependencies in source.
- Physical Windows Brave, Android Brave, actual printer output, offline OS double-click and source-reference visual matching: NOT VERIFIED.

## Explicit limits

- Full 52 reference-specific effects, 11 reference palettes and 20 independent three-page template packages are not complete. Existing 89 IDs remain preserved and their approximation status has not been upgraded to verified parity.
- Arbitrary SVG object import and exact raster object decomposition are not implemented. Scene JSON accepts embedded PNG/JPEG/WebP; remote image URLs and out-of-frame coordinates are refused.
- Data refresh diff is available as a pure model API; a complete user-facing replace-file/diff approval flow is not yet wired. The importer adds snapshots, rather than silently overwriting previous workbook files.
- XLSX number format codes and serial dates are retained; this is not Excel's complete display or calculation engine. Formatted dates/currency and precision edge cases need broader workbook coverage.
- Layout uses conservative text-area estimates, not full DOM typography measurement. The six reference HTML patterns/9 reference layouts and automatic split-page proposal UI remain incomplete.
- Filters/rank selections in the report are transient and reset to the saved binding defaults on reload. This is deliberate; original project data does not change during presentation.
- No visual match percentage is claimed without original reference images and a comparison measurement.

## Measured progress convention

`PROGRESS_V030.json` defines 44 explicit gates, four per integrated Phase. Percentages are **passed gate / defined gate**, not estimates of effort or an assertion of full product completion. Partial or untested gates receive zero. No previous v0.28 test counts are treated as completion of new requirements.

## Resume

Continue in order: reference-specific effects/parity; original golden HTML import review; richer layout/split proposals; workbook refresh review and number formatting; sanitized SVG layer editing; real 20×3-page template packages; physical device and printing checks. Keep ordinary pushes from triggering Actions or deployment, bundle changes into minimal commits.
