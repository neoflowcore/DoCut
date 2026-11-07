# DoCut Studio V0.22 - same-project continuation checkpoint

> Scope: source-only local edit and synthetic Chromium tests, 2026-11-04 KST. Not a deployment, native Brave trial, release artifact or externally verified V1.0 completion percentage.

## Recover the exact project before resuming

- Repository identity: `https://github.com/neoflowcore/DoCut`, intended branch `main`.
- Vercel project: `docut-studio`; pre-existing production `https://docut-studio.vercel.app` served V0.15.0 at last remote check. V0.22 has NOT been deployed.
- Baseline V0.21: commit `8e3ce398dbf556e6d776685224dce5ed3ac6f11b`, Git tree `6e695a524ec1ffab6513e80032f68f540cb57e4f`, 91 tracked files, 9 reconstructed commits. Original V0.12 objects are not asserted to exist.
- First search **same-project** Library `/DoCut` for `DoCut_V022_SOURCE_TRANSFER_20261104.txt` and `DoCut_V022_RESUME_RECEIPT_20261104.txt`; use this full Git format patch in a fresh empty directory with `git init -b main && git am <full-patch-path>`. Compare HEAD **tree hash** and tracked-file count below before editing. Commit object hashes can change with replay committer timestamps.
- Secondary path: restore V0.21 full patch and apply `DoCut_V022_INCREMENTAL_PATCH_20261104.txt`.

## Implemented at source level

- Untrusted AI JSON element-by-element/page-setting review, before/after text and numeric/provenance previews, separate numeric and evidence checks, none pre-selected; approver scope changes invalidate prior checks.
- Page-level headline/summary/transition and document-level title/master footer numeric risk detection and approval gates. Master logo not exposed in raw HTML preview.
- Long candidate diff pages render in chunks of 22; cannot approve whole page until all revealed; full text and source displayed inertly, no executable user-provided HTML.
- Locked original elements are preserved; AI cannot silently lock/hide existing or new elements, submit mismatched rich text or rewrite candidate data after analysis; existing citations not erased by blank AI fields.
- Destructive multi-item AI approval, selected find/replace, CSV/TSV, native or static HTML append/replacement are deferred if the local storage backup fails, unless the *unchanged* current JSON was separately downloaded from the same review dialog.
- `docs/AI_REVIEW_V022.md` records limitations and detailed safety model.

## Evidence and exclusions

- `npm run check:syntax`: PASS.
- `npm test`: Node **261/261 PASS** (V0.22 proposal-specific **53/53**).
- Synthetic Chromium **176/176** PASS, 11 test suites in separated executions: 14+11+12+15+14+13+16+12+15+19+35. V0.22 suite divided into 15+7+13; individual suites have separate logs; do NOT call this an uninterrupted monolithic pass.
- PPTX **2 in-memory structural** scripts PASS, no physical `.pptx` created.
- Headless Chromium injection and synthetic browser persistence are not user Windows/Android Brave. 390px viewport is not a physical Android test.
- Native Windows/Android GPU, Korean IME/touch/large files, Microsoft PowerPoint actual editing/resave, 89-reference screenshot design match: NOT VERIFIED. Physical manual QA is detailed in `docs/MANUAL_QA.md`.
- Historical fixed 53 acceptance items: P0 4/6=66.7%, P1 9/10=90%, P2 9/10=90%, P3 7/8=87.5%, P4 9/11=81.8%, P5 4/8=50%, sum 42/53=79.2%. **This is a previous V0.15-era test denominator, NOT the new V1.0 complete percentage.** V1.0 overall completion: unmeasured; visual draft match: unmeasured.
- No GitHub Actions auto-run, installer, ZIP, EXE, APK, release media, build or deployment.

## Remote code sync blocker

`neoflowcore/DoCut` is publicly visible yet empty, `main` branch absent. GitHub App write operation `create_blob` returned HTTP **403 Resource not accessible by integration** during current continuation; old source commits cannot be declared uploaded. User must allow the connected GitHub App `Contents: write` access to **this exact repository** for remote upload. Once permissions change, perform one source-only batch push with `[skip ci]` and readback; do not add Actions push workflows or auto-deploy.

## Final V0.22 manifest

The exact commit SHA, file count, tree SHA and latest remote check appear in `DoCut_V022_RESUME_RECEIPT_20261104.txt`, generated after the single source commit. If local source is unavailable, do not substitute another project or guess percentages.
