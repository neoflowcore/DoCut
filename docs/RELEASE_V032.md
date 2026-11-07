# DoCut Studio v0.32.0 — Page context / automatic proportional layout / icon-first effects

Release scope: 2026-11-07 (KST). Baseline: v0.31 source restored from project Library. Source-only local release; no GitHub Actions, installer/ZIP, or production deployment requested or performed.

## What changed

1. **Page-aware right-click:** the top page strip, left page thumbnails, empty editor stage and preview page tabs open a draggable DoCut page menu. It shows stable page ID context through index/name, total, object count, group and page transition. Select, page settings, rename, duplicate, add, reorder, box layout, frame setup and delete are available (with boundary conditions). Existing element/text-selection right-click stays separate. Shift+right-click intentionally opens the browser's menu; native text inputs keep their native selection behavior. Editor context UI is not exported into reports.
2. **Automatic proportional layout:** selecting content count, horizontal/vertical/2×2 arrangement or media requirements immediately updates the preview tree. The primary **자동 맞춤 · 바로 적용** command first tries original proportions, then smaller padding/gaps, then row or 2×2 layouts. When changing existing pages it also derives editable column/row slots from existing objects, preserving object IDs, text, data and provenance. The transaction is applied only after a successful plan. Locked obstacles, invalid groups and genuinely impossible geometry are not silently deleted or overwritten. The previously failing case of a 4-column vertical title/subtitle/body/image page now fits by a two-row arrangement of four content groups.
3. **89 motion cards:** 32 existing atomic motions + 33 original combinations + 13 additional playable combinations + 11 page transitions. Each has a distinct, locally created SVG icon based on the actual motion's direction/shape/stack, with a functional playback sample and application control. Categories: entrance, typography, KPI, chart/table, depth, emphasis, interaction, exit, scene transition. Long explanatory copy and a duplicate footer have been removed. Gallery preview numbers are clearly sample-only, never written to the project.
4. **Leaving for the next scene:** exit cues are persisted in `exitOnNext` as a separate ≤3-effect stack; normal entrance effects and source text remain intact. They play on forward scene changes in editor preview and standalone exported HTML, including page transition/auto-play controls. Reverse navigation does not trigger an outgoing cue. Reduced-motion preferences bypass scene-leave animation.
5. **Offline standalone editor:** `tools/bundle_studio_v032.py` combines the 44 ordered local scripts and stylesheet into one UTF-8 HTML document. This is an editable DoCut Studio editor, **not** a PowerPoint file or the user report; final report export remains its own independent HTML.

## Verification

- `npm test`: **511 / 511 PASS** (505 baseline + six new v0.32 tests).
- `npm run check:syntax`: PASS.
- `python tests/browser_v032.py` with headless local Chromium: PASS page and element context; PASS four-group proportional layout and source preservation; PASS 89 unique SVG icons and category filtering; PASS scene transitions and next-page exit in standalone HTML.
- Inline bundled-editor HTML executed in Chromium: menu, original five-page editor, 89 gallery entries and chart-filter icons all loaded without page errors. This sandbox restricts direct `file://` navigation, so physical Windows/Android Brave opening of the downloaded file remains **not verified**.
- The `neoflowcore/DoCut` GitHub repository currently has no branch/commit; a GitHub blob API call returned 409 because the remote is empty. No remote source sync or production URL update is claimed. Separate patch/full-source transfer preserved for recovery.

## Product limitations

- The 89 selections are 32 primitives, 46 runnable composites and 11 transitions; **not** a claim of exact image-by-image reproduction of 89 historical reference graphics.
- The proportional layout engine does not shorten arbitrary text, rewrite facts or guarantee collision-free placement for physically impossible locked structures. It must expose such cases rather than destroy content.
- Browser-based verification is not a substitute for hardware testing of Windows/Android Brave input, touch, file open/save and fonts. The deployed site is not this v0.32 release until separately updated.

## Manual acceptance checklist

- Right-click page thumbnail, top strip, and blank canvas. Confirm DoCut page context; Shift+right-click still displays native browser menu.
- Choose 4 areas, vertical, subtitle+body+image. Without clicking “기본 구조 만들기,” click “자동 맞춤 · 바로 적용” and confirm it creates a valid 2×2 page.
- Repeat using “현재 내용 유지·재배치” and compare all text/source values before and after.
- Filter motions by chart, number, text, exit and transitions; click any icon, watch the real sample, then apply to a selected unlocked element.
- Set “다음 장면 · 왼쪽 퇴장,” preview and export the report. Advance one page and confirm outgoing card moves left before the new page appears.
