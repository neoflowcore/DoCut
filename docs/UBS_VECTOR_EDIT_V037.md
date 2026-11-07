# UBS source-ratio native path editing checkpoint v0.37

## Code delivered
- Source SVG path/rect/circle/ellipse/line/polygon/polyline receives a stable deterministic ordinal from the immutable 2025 source archive (no bitmaps added).
- A UBS-only editor toggle enables source shape selection and native fill/stroke/opacity/stroke-width/X/Y/visibility edits.
- Overrides are validated and stored on the relevant page as referenceFidelity.vectorEdits, preserving source path data, undo/redo, JSON persistence, and embedded SVG in offline HTML export.
- Reset per shape or whole page restores the exact source geometry. The default (unedited) SVG is visually unchanged; preview and export show applied overrides.
- Main DoCut text blocks remain separately editable; vector editing temporarily intercepts the overlay so normal box dragging cannot accidentally change the extracted paths.

## Verification and limitations
- These functions add **editability**, not 99% source fidelity. A user-modified path can intentionally diverge from original; the source audit scores never certify modified content.
- Independent Chrome capture tools already exist in tools/capture_ubs_vector_browser.cjs and tools/score_ubs_browser.py. The latest six-page browser record remains **2/6 provisional passes; 4/6 below threshold** (pages 11,13,16,18).
- Full design acceptance remains **0/6**: all text font parity, original photos, page copyright/trademark compliance, and 16:9 editorial transformation are distinct gates.
- Requires current browser support for SVG + CSS translate, and decompressing bundled source SVGs. Does not claim true editable individual PDF Bézier control points, group-wide mesh/path editing, or PDF-export roundtrip.
- No official UBS artwork, paragraphs, photos, wordmarks or original PDF bundled.

## QA checklist
1. Select professional packs > UBS FIN-16 > original design > insert six pages.
2. Click UBS 도형 편집, click a colored vector path, adjust color or X/Y and verify separate JSON value.
3. Undo/redo; save .docut.json and reload; compare result and reset single/all paths.
4. Export HTML/TXT; check same SVG CSS overrides render offline. Verify screenshots with actual independent original PDF for all six pages.
5. Run node --test tests/ubs_vector_edits.test.cjs and existing source-ratio tests; run browser QA only after source PDF obtained independently.
