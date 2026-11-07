# DoCut Studio 0.33 — 20 public-report reference packs

## Why

Previous default gallery comprised 20 unrelated single-page general layouts and did not reliably feel like a professional report. Release 0.33 promotes 20 *independently authored* six-page report families informed by official published materials. The preexisting 20 page kits remain available in a legacy selector, and private user kits are unchanged.

## Functional scope

- 20 curated public-report research references (5 strategy/consulting, 5 quarterly earnings, 3 annual/corporate, 4 finance/investor, 3 public-policy) with official external original-source links, publication identities and disclosed review confidence.
- Six distinct, editable 1280 × 720 page compositions per reference = 120 structures. Titles, analysis, charts, tables, KPI cards, notes, decision matrices, targets, risks and roadmap pages vary by report purpose. No image, corporate logo, original chart, brand font or protected source page is redistributed.
- Dedicated gallery: visual thumbnails, company/original title and family, search and category filter, six page selectors, enlarged active preview, separate single-page and whole-pack add, traceable official-source link.
- No factual financial figures or external data included. Native chart values initialized to zero and marked as not sourced; numeric/KPI content explicitly requires user input.
- Professional reading default: no effects on generated elements and `none` page transition. The optional 89-effect feature remains available unchanged.
- New pages append after the current page in one undoable mutation, retaining all existing pages and source data, preserving current group and page identities, observing the 50-page limit with preflight rejection and the app's existing backup gate.
- Parent project and private custom kit export remain separate from third-party reference data. A user's report export embeds only their page content, not the third-party originals.

## Provenance and reuse rules

The public-report names and links are citations of research, *not* endorsement by the cited organizations. Some sources are official index pages instead of directly reviewed PDF design; that confidence distinction is surfaced in the gallery. Templates are original layout compositions and do not claim exact reproduction of any corporate report.

## Status

Code + browser QA included. Check actual hosted production HTML version before calling 0.33 deployed. Windows/Android Brave manual UX verification is still separate.

## Source research

- `docs/references/DoCut_Global_Professional_Reference20.json` — structured official sources, verification evidence, six-page archetypes per family
- `docs/references/DoCut_Professional_Report_Reference20_Analysis.md` — qualitative analysis of all 20 references
