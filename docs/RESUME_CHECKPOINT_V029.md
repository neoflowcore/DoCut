# DoCut v0.29 — integrated midterm plan development checkpoint

Date: 2026-11-07 (client date, Asia/Seoul).

## Restored baseline

- Source recovered from `DoCut_V028_Full_Source_Transfer.txt` (16 mail patches).
- Verified recovered Git tree: `576c02a185a8a9672c7df1d40624ac28aef37dbe`, identical to the v0.28 receipt. Replayed commit IDs differ; do not claim original commit identity.
- Governing plan: `docs/INTEGRATED_MIDTERM_PLAN_v1.1.md`.
- Original reference JPEGs and golden WAIP HTML were not materialized in this batch.

## Implemented batch

- `assets/semantic_layout.js`: preview-first semantic layout proposals for the 12 existing structures (blank preserves geometry).
- Titles prioritized by type; evidence/KPI/figure ordering varies with layout. Dense content retains layout-specific columns/weights instead of sharing the old fallback grid.
- Locked nodes are obstacles. A locked group member pins the entire group; movable groups preserve member offsets, sizes and styles.
- Estimated minimum readable areas and collision checks; insufficient space cancels the whole proposal, retaining content and coordinates. No automatic content removal or font shrinking.
- Before/after geometry previews, explicit Apply/Cancel, stale-page protection, and the existing single Undo transaction.
- Geometry survives normalized project JSON and independent HTML export.
- PPTX removed from active editor menu, script loading, action handler and UI explanations. Legacy exporter source/tests retained as historical code; no new PPTX work.
- Audit tool and JSON retain all 89 reference IDs; static registrations are explicitly distinguished from verified runtime parity.

## Evidence

- Full existing + initial new suite: 467/467 PASS; syntax check PASS.
- Final focused semantic suite after adding JSON/export case: 11/11 PASS (10 of these were in the 467 run).
- Cloud Chromium UI: opened editor; selected Three cards; observed before/after proposal containing all 5 nodes; applied; observed success; Undo executed. This is not Windows/Android Brave physical-device verification.
- Reference metadata: 52 preset references, 11 transition references, 11 palette references, 9 layout references, 6 guides, 89 unique indices.
- Registered implementations: 32 motion kinds, 33 preset stacks, 11 transitions, 9 palettes, 12 layout controls. Counts alone do not prove reference parity.

## Remaining work — do not claim completed

P0: original image/golden HTML retrieval and direct behavior classification.
P1: unified frame/schema, six ratios, primary/subpage tabs, hash restoration and frame-aware print.
P2: measured DOM overflow, explicit semantic roles beyond type inference, 9 reference structures/6 patterns, automatic page-split proposals and master-logo obstacles. Current planner uses conservative estimates and only the fixed 1280×720 frame.
P3/P4: unique reference effects instead of shared approximate targets, independent effect composition and per-reference demos/icons.
P5/P6: workbook source/range/column roles, data motion provenance and linked interactions; scene schema/smart connectors/2.5D.
P7/P8: 20 three-page template packages, quick creation flow and HTML import modes.
P9/P10: full output parity/security/accessibility/print and physical Windows/Android checks; verified upload/deployment.

No completion percentages or visual match percentages inferred. No CI jobs, installers or ZIPs generated. Prior production address is not evidence that this source has been deployed.

## Remote publication result

GitHub read reports the repository is still empty. A bundled source push was blocked by automatic approval review because this public payload/destination lacked explicit publication authorization according to that review. No workaround or repeat publication attempted. Current source is preserved as a local commit and a private restore file; production is unchanged by this batch.
