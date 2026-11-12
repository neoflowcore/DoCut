# DoCut v0.50 — UBS SVG drag and Excel chart collision safety

**Why:** UBS SVG vector edit previously required numeric movement fields; chart slot occupation guard could miss authored text and small KPIs.

## Implemented source changes
- Pointer capture and pointerdown/move/up/cancel for SVG path/rect/circle/line elements. Convert viewport coordinates using inverse SVG screen CTM.
- Inline movement feedback during a gesture, with 0.5-unit increments and existing ±200 translation bounds. Commit one undoable vectorEdits update at pointerup; Escape/cancel/mode exit rolls back transient preview. Original SVG bytes are unchanged.
- Reject manual Excel chart insertion into occupied source PDF 13/16 slots if visible user-authored text, image, KPI, shapes, notes, cards, tables or other charts overlap. Original blank source-text slots do not count as occupied.
- No new runtime dependencies or GitHub workflow files.

## Verification boundary
Actual Node/test runner, Playwright Chromium, Windows Brave, Android Brave and PDF-to-editor screenshot comparison are NOT_RUN. Modified source is not a verified device implementation. The archived 99.x extraction metrics must never be reinterpreted as report design fidelity.

## User manual verification (after a deliberate deployment)
1. Open DoCut and use professional templates → UBS FIN-16 → original SVG → insert six pages.
2. Select source page 5, 8, 11, 13, 16 or 18; click “◇ UBS 도형 편집”; drag a colored SVG element with mouse or pen; verify only that shape moves and scroll/canvas movement does not occur.
3. Check undo, redo, JSON save/reopen and exported standalone HTML retain the exact movement. Begin another drag and press Escape or cancel pointer; no persistent movement should remain.
4. On source PDF page 13, add user text or a KPI within the virtual Excel chart region. In Data Motion upload an XLSX, select sheet/range, run six-page review; the occupied region must not receive an inserted chart. Remove the overlapping object and retry.
5. Assign valid numeric columns, re-review/apply, verify gold bars, negative/zero values, other pack isolation and original SVG continuity on both source pages 13 and 16.
6. Perform independent screenshots and compare against the original report PDF, recording source, mask, result and pass/fail per page. Windows Brave and Android Brave/S Pen should be checked separately.

Developer manual tests (not Actions):
```sh
npm run check:syntax
node --test tests/ubs_vector_drag_v050.test.cjs tests/ubs_excel_recovery_v049.test.cjs
npm run test:browser:ubs:v049
```
