# DoCut v0.49 - UBS FIN-16 SVG × Excel reviewed mapping

Date: 2026-11-12 | Repository: neoflowcore/DoCut | Base: 71ca07e01fd8

## Core implementation

1. UBS Global Wealth Report 2025 source-ratio six-page vector remains the original immutable geometry. Text, photos, and logos are not copied. UBS source-PDF chart pages 13 and 16 expose two virtual chart targets only during an Excel review.
2. A virtual slot does not draw a placeholder over the vector. Data is inserted only after the author explicitly selects a numeric Excel column, reviews the full range, and clicks Apply.
3. Automatic metric matching is disabled for FIN-16. If a category column contains numeric years but has an unrecognized heading, explicit category confirmation is also required.
4. The chart uses the original PDF slot coordinates, normalizes with the existing editor, keeps negative/zero data, and uses a preserved UBS-gold palette. The chart title includes the actual writer-selected Excel header, not a fabricated metric or unit.
5. The same source file, sheet, A1 range and chosen column are recorded as provenance. One workbook ID is never silently overwritten. Large XLSX inputs save only the reviewed derived chart results and keep the original workbook separate.
6. The transaction checks source page identity, pack instance, element snapshot, chart rectangle occupancy, data binding, page element limits, and source-SVG readiness. If the review becomes stale, it does not mutate the report.
7. The UBS source loader now reports failed/ready status, supports one in-flight decompression, exposes Retry, and the gallery disables unsafe FIN-16 original insertion before the SVG is ready. Errors are shown; silent fallback is forbidden.
8. Existing 19 native report identity families and their chart matching path were left intact; independent SVG/browser fidelity remains a separate goal.

## Actual verification and evidence boundaries

- 20 source-module integration assertions for FIN-16 manual mapping, signed values, duplicate protection, two pack instances, stale review and source readiness passed in the current JavaScript model execution.
- 7 mocked gzip-source status assertions for startup failure, Retry, ready event, repeated request de-duplication and SVG markup passed. The gzip/DOM parts were mocked; real browser execution is not claimed.
- Added Node tests: tests/ubs_excel_recovery_v049.test.cjs (10 cases) and tests/ubs_loader_retry_v049.test.cjs (3 cases), plus manual Playwright smoke at tests/browser_ubs_excel_pack_v049.cjs. The full Node runner and Playwright were NOT RUN in this turn.
- Phase D2 source mapping coverage: 20/20 families (19 native semantic matching plus FIN-16 manual verified mapping implementation). This is code-path completeness, not measured numerical or visual accuracy.
- UBS SVG PDF-extraction graphics percentages are not an editor screenshot design-fidelity score. Original-report pixel design match is UNMEASURED. Windows/Android Brave acceptance 0/120 until the user runs actual device tests.

## Manual acceptance protocol (no installation required)

1. Open the deployed DoCut production site in Windows Brave or Android Brave. Preserve existing local edits by saving the project JSON when necessary.
2. Click 20 premium report templates, choose FIN-16 UBS, and confirm six page thumbnails and one large vector preview. Original insertion must be disabled if gzip extraction is unavailable, with a visible Retry button.
3. Insert the entire six-page UBS pack and inspect the preserved SVG and 157 empty native text regions (13/24/28/26/26/40). No blank chart should obscure the original source graphics before any data is supplied.
4. On the fourth UBS page (source PDF page 13), open Data Motion, upload an XLSX/CSV, select sheet and range, click the UBS six-page manual mapping review. Initial automatic mapped charts must be zero.
5. Select a numeric column for each of the two chart targets. Verify that selecting values disables Apply until Review is clicked again. If the numeric category column is ambiguous, select the proper category index explicitly first.
6. Apply and check only UBS PDF pages 13 and 16 gained a gold bar chart, preserving source geometry, original SVG, zero/negative values, the chosen header and provenance. No other pages or pack instances may change.
7. Try re-running mapping and altering a page after Review; already occupied/stale slots must fail closed. Check Undo/Redo, JSON save/reopen, standalone HTML chart + SVG, source trail, keyboard/mobile controls, and page errors.
8. For reproducible browser QA with local Playwright: npm run test:browser:ubs:v049. This command is for manual developer execution only. It may write temporary screenshots under /tmp, not GitHub artifacts.

## Unfinished scope

- Actual original PDF vs DoCut screen pixel scoring, 16:9 adaptation, typography/shadows/geometry fidelity of 20 templates, 89 motion effects exhaustive QA, full linked-chart standalone parity, heavy 50 MiB / 3,000,000-cell mobile benchmark remain NOT_RUN or incomplete.
- XLSX maximum compressed file size 50 MiB and 10,000 safe formulas are feature limits, not an assertion that every device was tested at those limits.
- Vercel Git auto-deployment must stay disabled; GitHub Actions and EXE/APK/ZIP generation remain forbidden.
