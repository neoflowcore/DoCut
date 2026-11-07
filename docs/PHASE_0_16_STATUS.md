# DoCut Studio v0.16.0 development — recovered source, grouped effect integration

> Recorded 2026-11-04 KST. **LOCAL SOURCE-ONLY**, not yet GitHub synchronized. Latest full grouped test receipts and Git hash must be filled after tests, not guessed. See `ACCEPTANCE_RECOVERY_V015.md` for the latest fixed acceptance denominator.

## Same-project source lineage and remote readback

- Identity: `https://github.com/neoflowcore/DoCut`, intended `main`. Connected GitHub repository is empty and returns no branch; a direct create-blob write test on 2026-11-04 yielded HTTP **403 `Resource not accessible by integration`**. Apparent repository `push` permission does not override GitHub App integration authorization. No successful remote push or readback can be claimed.
- Recovered from the same DoCut Project Library's full `DoCut_V015_SOURCE_TRANSFER_20261103.txt` root Git patch. Historical recovered source is V0.13 + V0.14 + V0.15, not the original V0.12 Git object tree.
- Verified pre-existing Vercel project `docut-studio` (project ID `prj_Z6SXKmLuIznWoVVtWiGFx6bJr6Zi`) has a READY production deployment from 2026-11-03. An authenticated read of `https://docut-studio.vercel.app` returned HTTP 200 and the document itself says **STUDIO 0.15.0**, not 0.16. This **proves that the V0.16 local code is not the version currently served at that URL**. User prohibits automatic builds and installing release artifacts; production code should not be claimed updated absent a fresh readback.

## Scope of the grouped local V0.16 code batch

1. **Data-driven motions:** twenty-seven named motion kinds in eight topical categories, a type-filtered preset gallery with 28 recipes, per-object maximum three ordered effects, reorder controls and undoable element-level/page-level auto-selection. Dedicated text, number, chart and depth/camera behaviors use bounded WAAPI or short, cancellable number-frame loops.
2. **Timeline correctness:** reduced entrance flashing, sequential relative motion blending; new X/Y-axis 2.5D pose attributes, keyframe control and adjustable timeline scale. No infinite repeating GPU loops; hidden-page cancel and reduced-motion opt-out retained.
3. **Unified visual systems:** 9 backgrounds, 9 chart palettes (SVG and PPTX shapes), 12 spatial layout recipes with preserve-data and overflow safeguards, plus 5 reversible page transitions in schema-3 JSON and independent HTML.
4. **Import interop:** approximate conversion of nested CSS-positioned static HTML, and local raster `data:image` background images as editable image blocks. Remote linked images and scripts are not imported; generic CSS Grid/Flex/JS is not claimed pixel-identical.
5. **Standalone parity:** standalone exported HTML embeds both `assets/easing.js` and `assets/visual_motion.js` source-identical runtimes. These are local static JavaScript only, and are not bundled as installers/ZIPs. A small diff should never change one runtime without running `python tools/sync_export_runtime.py`.
6. **Docs and focused tests:** versioned effect dictionary, source/recovery checkpoint and Node/Chromium V0.16 scenario suites. Legacy test cases remain as regression guards, with updated product-version expectation only.

## QA and release measurement rule

DO NOT add invented fractions for newly proposed criteria to the historical acceptance denominator. The historical V0.15 fixed 53-scope checks stood at **P0 4/6 (66.7%), P1 9/10 (90%), P2 9/10 (90%), P3 7/8 (87.5%), P4 9/11 (81.8%), P5 4/8 (50%); 42/53 (79.2%) total**. Until old accepted criteria are explicitly rechecked, these remain a **historical baseline** rather than a new acceptance claim. Overall V1 completion and design reference match **not measured**.

Final grouped manual-only verification command:

```sh
npm run check:syntax
npm test
python tests/browser_recovery.py
python tests/browser_extended.py
python tests/browser_v014.py
python tests/browser_v015.py
python tests/browser_v016.py
python tests/pptx_memory_qa.py
git diff --check
```

Final grouped source-level checks (2026-11-04 KST, manually invoked): **JavaScript syntax PASS; Node 102/102 PASS; legacy Chromium 14/14 + 11/11 + 12/12 + 15/15, V0.16 Chromium 14/14 = 66/66 PASS; PPTX in-memory parse PASS (3 slides, 6 embedded images); `git diff --check` PASS.** A harness-only navigation fixture was corrected and rerun. These are automated verification receipts, NOT hands-on Windows/Android/Office certification, PDF printing certification, 89-image design reference match, or full V1 feature completion.

## Release / budget controls

No `.github/workflows` added, no automated Actions or post-push builds initiated, no EXE/APK/ZIP/install release artifact produced. Source changes should be committed once as a meaningful batch; no `.github/workflows` directory should be present. A complete source-text transfer patch can be retained under `/mnt/data` for resumption when GitHub App write access remains 403. Only report GitHub synchronization after a successful remote-head readback.
