# DoCut v0.31 — page overview, movable workspace and reference box hierarchy

Date: 2026-11-07 Asia/Seoul. Baseline: v0.30 `2bd4477`.

## Requested behavior delivered

- Thin top page strip across all topics: page number/name, optional geometric thumbnails, current-page tracking, horizontal scrolling, click/arrow navigation, Alt+arrow reorder and drag reorder. The strip remains separate from movable panels.
- Left tools, right inspector and lower timeline have drag handles, free floating positions, resize handles and explicit left/right/bottom/free placement selectors. Positions persist in browser UI settings, clamp to the viewport, and reset from the page strip. Report JSON and final report HTML contain no editor panel positions.
- Recursive box-layout trees represent page title → content areas → subtitle/body/image/chart/table slots. Two/three/four areas, horizontal/vertical and 2×2 structures have different geometry, editable roles/relative weights and minimum-space checks. Review precedes append/reflow; existing text, numbers, source metadata and IDs remain intact. Locked obstacles or insufficient slots prevent partial application.
- Reference HTML is measured in a hidden sandbox with no scripts and a restrictive CSP. Semantic headings/text/images/tables are grouped into an editable tree. Embedded DoCut report JSON is read directly. Users can choose a reference page and optionally copy reference content and embedded images; structure-only mode uses generic placeholders and does not retain reference prose in slot labels.
- Raster reference images use border/contrast heuristics, not OCR or semantic AI vision. Detection is an estimate; users can add missing boxes by drawing and correct roles/weights. Do not claim arbitrary screenshots or borderless designs are perfectly understood.
- Canvas right-click opens a draggable contextual tool window with font/size/color, bold/italic/underline for selected text, object alignment, effects, data bindings, lock/duplicate/order/delete, structure tools and draggable insertion buttons. Shift+right-click retains the browser menu. No editing tool is added to final report HTML.
- Partial font family/size are stored as validated rich-text runs and exported to report HTML. Range offsets preserve the selection when menu fields take focus. Korean text editing uses the existing checkpoint/IME path.
- XLSX source UI makes file → worksheet → cell range explicit. Existing selected bindings reopen on their saved sheet/range/column roles. Switching the sheet and applying can replace the same chart ID instead of creating a duplicate; other sheets stay preserved in project JSON.

## Verification evidence

- Full suite after the batch: 505/505 Node tests PASS; all JS asset syntax PASS. New workspace suite: 15/15 PASS.
- Cloud Chromium: selected page 7 from the top strip; active page and strip remained in sync; Alt+Left reordered and retained focus; Alt+Right restored order.
- HTML fixture: real CSS Grid/Flex reference measured as 10 boxes (one title and three subtitle/body/image columns), reviewed and imported as 10 editable objects with three embedded images.
- Canvas right-click opened DoCut tools instead of the browser menu; effects button opened the real effect studio. Tool window itself was dragged to a new location.
- Selected only `첫 ` in a subtitle; Arial/32px affected that substring. Reload showed `font-family:Arial` and `font-size:32px` on that run while the remaining text kept its base style.
- Right inspector switched to free mode, dragged from x1051/y119 to x764/y215, and reopened at x764 after reload. Reset restored dock positions.
- Real two-sheet XLSX fixture: selected `직원 교육` (sheet ID 2) and A1:B4, inserted chart `기초:17 / 심화:23 / 대기:0`. Reopened its binding through right-click, selected `매출 현황` (sheet ID 1), applied and observed one chart with `가:1200 / 나:-300`.
- Raster unit fixtures distinguish nested/aligned boundary combinations. A colored 10-box PNG was uploaded in Chromium and produced 10 reviewed boxes; deleting slot 10 reduced the review to 9 independent slots. Image semantic roles and text recognition are not verified or claimed.

## Limits and remaining work

Physical Windows/Android touch/long-press, operating-system file launch and real printer checks are still unverified. Touch users can use explicit panel position selectors; the new canvas context tool currently opens via right-click or keyboard ContextMenu/Shift+F10. Reference images are heuristic and cannot automatically recover all typography, image objects or meaning. HTML dynamic scripts, remote fonts/assets and exact visual reproduction remain excluded from this extractor. Existing full midterm-plan gaps (all reference-specific effects, 20×3-page template packages, SVG editing, complete HTML import parity) remain open.

Source upload to GitHub was already blocked by automatic approval review in the preceding batch; this batch does not retry that blocked publication. Final application runtime can be released directly to the existing authorized Vercel project, excluding documentation/tests. Production deployment evidence is recorded separately after the release.
