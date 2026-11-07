# UBS gallery repair v0.38 | 2026-11-08

## Root cause reproduced
Selecting FIN-16 source-ratio preview made the large preview container 579x0 pixels. Its absolutely positioned SVG expanded to the entire 1258x874 dialog, concealing list and navigation controls. The source SVG data itself had loaded successfully.

## Fix
- Local relative layout and overflow clipping for the gallery thumbnail, pack strip, large source-ratio preview.
- Explicit UBS original page aspect ratio 841.89:595.276 and nonzero preview height.
- Source geometry to editing frame consistent centered scale conversion for all 157 blank text areas.
- Fail-closed insertion if source vector data is not ready; user-visible loading text.
- Preserve separate editable vectors, original source geometry, original page IDs and HTML export.

## Real Chromium acceptance
Chromium headless viewport 1452x952 and 390x844: FIN-16 select, six mini pages, six SVG previews, six-page insertion, visible source SVG in editor, native 157 editable text regions (13/24/28/26/26/40), color edit/reset, JSON roundtrip, embedded SVG/CSS overrides in HTML export, 11 exported slides, no page errors all PASS.

Node unit tests: npm test PASS.
Command: node tests/browser_ubs_gallery_v038.cjs (Playwright installation needed).
Independent 99% native-image comparison remains a separate, incomplete benchmark (2/6 preliminary browser passes previously). This release fixes usability rather than changing original pixel parity. 
