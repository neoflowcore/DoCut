# DoCut v0.41 — 3 million cells and large-source analytical report workflow

## Decision and acceptance definition
Raise the previous hard 600,000 populated-cell cap to **3,000,000 populated cells per XLSX workbook (5x)** without pretending that every workbook/device can process the maximum. XLSX stays at **50 MiB compressed**, 256 MiB total uncompressed XML, 4,096 ZIP entries and at most 10,000 formula cells. Sheet geometry expands from 10,000 × 120 to **30,000 × 256**; the workbook-wide 3 million nonempty/materialized <c> elements remains authoritative.

## Implementation
- Added `assets/xlsx_sax.js`: a bounded, non-executing streaming XML token scanner for sheet cells and shared strings. The full multi-million-cell worksheet is **not** parsed into one DOM tree. Malformed XML, DTD/entities, nested/broken tags, invalid ZIP, duplicate/misordered cells, over-limit source and unrecognized content are rejected rather than silently cropped.
- Workbook importer consumes/relinquishes worksheet XML strings after parsing and limits detailed warnings. Original signed values, zero, formula and cached-result metadata remain.
- `W.select` uses a cached row-offset index instead of rebuilding a workbook-wide Map on each selection. It supports sparse requested columns and bounded UI preview rows/columns.
- Analytics recommends based on a sampled 256-row preview but calculates actual metrics using the entire selected row range; raw/group/histogram limits remain explicit.
- `assets/formula_engine.js` now avoids constructing a duplicate millions-of-cells lookup for zero-formula and all-cached workbooks. For uncached formulas it uses a bounded, sorted-reference binary search. Supported formula semantics remain the v0.40 documented subset.
- `assets/large_dataset.js` keeps native snapshots for workbooks of at most 5,000 populated cells. Above this threshold the original workbook is analysed **in memory only**, and the editable project/standalone HTML stores the selected chart/table/KPI result and the original filename/sheet/range provenance. The original raw workbook must be re-uploaded to analyse other columns/ranges; no truncated raw snapshot is misrepresented as complete.
- New CSV/XLSX chart outputs continue to render editable SVG with the UBS layout/color, when selected. CSV upload remains 1 MiB.

## Risks and limits
- **3 million is a source-reading ceiling, not a promise of a 3-million-point chart.** Dense bar/line output remains at 360 points; use grouping/histogram/aggregation for large tables.
- Excel cached formula values take precedence; unsupported formulas without cached results are missing and explicitly flagged.
- 50MiB ZIP and 256MiB inflated XML budgets may stop a file before it reaches the 3-million-cell ceiling. Browser RAM and device constraints also apply.
- Large original raw cells are not embedded in projects; the output is a derived, attributed snapshot, and existing separate original XLSX should be kept.
- Browser-local checkpoint limits remain; storing only the small derived report payload avoids repeating a multi-million-cell source in Undo and autosave.
- Standalone HTML retains the exact materialized chart result and the derived linked values; it does **not** reproduce all cells from the uploaded XLSX.

## Tests
1. `node --test tests/large_excel_v041.test.cjs tests/excel_limits_v040.test.cjs tests/analytics_engine_v039.test.cjs`
2. `npm test && npm run check:syntax`
3. Optional token-parser stress: `DOCUT_LARGE_QA=1 node --test tests/large_excel_v041.test.cjs`
4. Manual Chromium upload + export: `node tests/browser_large_excel_v041.cjs` (Playwright Chromium required). This creates a synthetic XLSX with **780,002 populated cells** and verifies a 50-group chart, reduced in-project source, self-contained HTML, and JS errors.
5. High-end manual trial: `python3 tools/create_large_excel_fixture.py --rows 29999 --columns 100 --output /tmp/docut_3m.xlsx`; then run `DOCUT_LARGE_WORKBOOK=/tmp/docut_3m.xlsx DOCUT_LARGE_ROWS=29999 DOCUT_LARGE_COLUMNS=100 node tests/browser_large_excel_v041.cjs` (adjustments are controlled by environment variables).
6. Exact 50MiB workbook, Android low-memory, malicious ZIP/XML, independently verified Excel formula precision and page-template fidelity remain separate acceptance gates.

The test scripts are **manual only**. No GitHub Actions, installer artifact or deployment is auto-triggered. Real browser/desktop/mobile acceptance should not be claimed until executed and recorded.
