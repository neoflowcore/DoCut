# DoCut Studio V0.17 grouped development — current checkpoint

Date: 2026-11-04 KST. Source-only local development; no installer, Actions or automatic deployment.

## Restored project and remote comparison

- Reconstructed **V0.16 local source**, 53 tracked files and four reconstructed history commits, from the same project's prior source transfer. Do not claim restoration of the original V0.12 Git object tree.
- Connected GitHub repository `neoflowcore/DoCut` currently empty and no `main` branch; prior create-blob write HTTP 403. `main` denotes intended target, not an uploaded branch. If remote permission changes, verify head SHA before declaring sync.
- Existing Vercel project `docut-studio` has a READY old production deployment; last authenticated HTML readback showed `STUDIO 0.15.0`. The new V0.17 source is **not** claimed deployed.

## Current feature package

- New editable `stat` element with **9 distinct statistics categories**, original data and meta-data round-trips, HTML/TXT, sortable timeline `stat-reveal` special effect, and PowerPoint-native shapes sharing the original geometry.
- Enforces valid numeric ranges, units and provenance warnings, no invented sample entries, no silently truncated data, exact-column CSV preview/cancel/approve and Undo. Includes user-controlled management limits and forest comparison reference. Rejects incomparable small-multiple times. Verified status resets after source data edits.
- Shared nine color palettes and existing V0.16 motion/render pipeline used without introducing external dependencies, GitHub workflow or runtime services.
- Detailed tests are `tests/stat_charts_v017.test.cjs`, `tests/browser_v017.py` and `tests/pptx_stats_memory_v017.py`.

## Distinguish completion metrics from verified results

**Fixed historic V0.15 acceptance score** (not newly rerun): P0 4/6 (66.7%), P1 9/10 (90.0%), P2 9/10 (90.0%), P3 7/8 (87.5%), P4 9/11 (81.8%), P5 4/8 (50.0%) => 42/53 (79.2%). This score does not measure new V0.17 code, user-device readiness, original screenshot similarity, or full V1.0 completion.

New V0.17 grouped source verification (2026-11-04, invoked locally after implementation): **JavaScript syntax PASS; Node tests 116/116 PASS; Chromium tests 14/14 + 11/11 + 12/12 + 15/15 + 14/14 + 13/13 = 79/79 PASS; legacy PPTX in-memory PASS (3 slides, 6 images, editable shapes); new statistical PPTX in-memory PASS (9 kinds, 9 slides, native editable shapes, source metadata); `git diff --check` PASS.** A legacy CSV expectation was found during regression, and chart/table old behavior was retained while V0.17 stat source preservation was scoped to its new type, then all suites passed. **GitHub source synchronization NOT DONE**; **production V0.17 deployment NOT DONE**.

## Deferred user-device verification

See `docs/MANUAL_QA.md`: Windows Brave at native resolution, Android Brave touch/IME/performance, contrast and font readability, PowerPoint edit/resave, source data semantics and actual publishing. The user instructed to continue development before initiating any installer builds or manual rollout. Design fidelity percentage remains **not measured** (89 JPG references classified but pixels unavailable); document integrity, accessibility and resource restraints are prioritized.
