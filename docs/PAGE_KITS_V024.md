# DoCut V0.24 - original, reusable 16:9 page kit library

## What is shipped

This release adds a gallery of TEN original structural page compositions. They are not copies of specific commercial templates or a pixel reproduction of the project's 89 historical design screenshots.

| ID | Title | Narrative use |
|---|---|---|
| executive | Executive Brief | Lead with decision, followed by three grounds |
| problem | Problem Framing | State issue, reason and impact separately |
| evidence | Evidence Ledger | Three source slots and a reference/date field |
| comparison | Option Comparison | Table-shaped alternative analysis |
| decision | Decision Memo | Proposed action, conditions and approval ask |
| performance | KPI Performance | Three explicitly empty, unverified indicators |
| trend | Trend and Insight | Empty dataset and interpretation text |
| timeline | Implementation Roadmap | Three steps with owners and dates to fill in |
| risks | Risk Register | Risk, likelihood/impact and mitigation |
| feedback | Stakeholder Voices | Comment area plus follow-up measures |

The gallery has a 16:9 schematic preview, category filter, searchable labels, and a standard 9-palette selector from the DoCut effect catalog. The selected kit is added **after the current page** without replacing any old page. User edit, Undo and Redo stay available. The report retains a 50-page maximum. Each imported element/page receives a new unique identity. Each effect keeps at most three slots.

## No fabricated evidence and no copied private text

All built-in wording is explicitly placeholder copy. KPIs show a dash, charts start at unverified zero values and stat charts have no observed rows. Sources, as-of dates, verified flags, evidence and reviewer details are empty until the user supplies and verifies them. Original company branding is never injected by the gallery.

A personal layout can be captured from the current page by entering a name. Capture extracts geometry, element type, broad style, grouping and motion settings. It **does not extract the current report's text, numeric values, chart labels, table cells, images/base64, source citations, evidence, rich-text spans, verification status, private comments, employee names, group labels or original page/element IDs**. New pages use explicit placeholder content and fresh IDs. The personal template name is chosen by the user: avoid real employee names/confidential report titles when sharing its explicit JSON export.

## Personal library boundary and exchange

- Separate offline browser localStorage key `docut-page-kits-v1`; does not modify native project JSON or private review board data. Up to 20 templates, 60 elements each and 450,000 characters of serialized storage. This limit is not a guarantee of browser device storage availability.
- Save and delete detect a stale library snapshot before writing. A concurrent overwrite detected by the next write triggers refusal. This is optimistic protection, **not** an atomic cross-tab transaction; use single-tab manual tests and export important designs.
- Library export requires an explicit click, writes a JSON design-only packet (no report pages/reviews). Imports require a preview of new/identical templates and a checked approval. Duplicate IDs with different definitions are refused, and full report JSON is not an accepted kit packet.
- Changes to the selected kit, palette or category update the schematic before insertion. If filtering has no matching item, insertion is disabled; a custom kit preserves its own colors even when the standard palette selector changes.
- Malformed or oversize stored libraries are retained untouched. The interface offers export of original raw TXT before an explicit reset. A later revision must be exported again before that reset can be authorized.
- Project mutation backup must succeed before page insertion. If native project storage is unavailable or conflicting, insertion stops rather than risking the user's source pages.

## Features that this is NOT

This is a geometry/color template library, not a third-party commercial theme downloader, a pretrained neural style model, a pixel-identical reproduction, or a cloud sync service. It does not verify numbers, create source documents or convert Web animations to native PowerPoint animations. Custom kits saved in one browser profile are not automatically visible on another device. The 9 palettes are pre-existing DoCut palettes, not 90 individually drawn templates; the selection space is 10 compositions times 9 palette choices.

## Manual verification gate (NOT YET PERFORMED)

1. In Windows Brave, back up the original DoCut JSON, open complete source `index.html`, choose each of the 10 layouts, preview, insert, Undo/Redo, and inspect existing slides remain untouched.
2. Change palette across nine options; confirm chosen theme actually changes newly inserted template styling and not existing pages. Create a personal template with a sensitive test sentence and table value, export its JSON, and search the file for both test tokens: they MUST NOT appear.
3. Repeat a custom template, check all page/element/group IDs are unique; delete the custom template and confirm report slides remain intact. Close the tab and reopen to verify device-local template persistence.
4. Use two Brave tabs to trigger library changes while a stale save/import is open; confirm refusal, explicit reload and imported library merging. Simulate storage quota exhaustion **only in a disposable test profile**. Export damaged raw library TXT before any reset.
5. In Android Brave, verify 390px/rotated layout, search/category filter, scrollable dialog, safe Korean IME, touch selection, file picker and exported JSON. Check background tab motion/GPU separately.
6. If manual PPTX QA is later authorized, generate ONE file at that time, inspect in actual Microsoft PowerPoint and compare editable shapes and typography. No installer, APK, ZIP or new PPTX was produced by this source-development work.

## Test method

Automated Node/Chromium tests run on project source with synthetic browser storage and headless Chromium. They do not prove Windows Brave, Android Brave, font availability on user devices, or actual PowerPoint behavior. Design match percentage against the 89 user reference images is **NOT MEASURED**. Historical fixed 42/53 checks must not be presented as total DoCut V1.0 completion.
