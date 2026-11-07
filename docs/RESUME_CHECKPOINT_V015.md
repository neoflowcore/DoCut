# DoCut V0.15 resume checkpoint (same-project only)

**Identity:** `https://github.com/neoflowcore/DoCut`, intended `main`; do not substitute other repositories.

**Provenance:** V0.13 recovered developer source, local V0.14 implementation, and current V0.15 grouped work. Original V0.12 Git tree is not claimed restored.

**Source root if still present:** `/mnt/data/docut-dev`. Read `git log -1 --oneline`, `git status --short`, `docs/PHASE_0_15_STATUS.md` and `docs/ACCEPTANCE_RECOVERY_V015.md` first. Start by reading connected GitHub repository, main ref and contents. Empty remote is not a reason to restart from scratch.

**If environment is reset:** Search DoCut Project Library for `DoCut_V015_SOURCE_TRANSFER_20261103.txt` (complete root Git format-patch text), V0.15 checkpoint, and previously archived V0.14 recovery patch. Materialize an authorized Library copy and apply to an empty local Git repository, then inspect current source before development. NEVER interpret a Library patch as proof of remote upload.

**Source tree:** `index.html`, `assets/*.js` and `assets/styles.css` are all needed to open the editor locally. The offline exported HTML is standalone, but `index.html` alone is not. `tests/*.test.cjs`, `tests/browser_*.py`, `tests/pptx_memory_qa.py`, `docs/*.md`, `tools/sync_export_runtime.py` belong to source.

**Manual-only code regression:** `npm run check:syntax && npm test && python tests/browser_recovery.py && python tests/browser_extended.py && python tests/browser_v014.py && python tests/browser_v015.py && python tests/pptx_memory_qa.py`. Execute after grouped changes, not on every small edit. The PPTX parser runs only in memory.

**Current V0.15 features:** explicit per-page AI approval and shared settings gate, protected preexisting source metadata, changed-numeric examples, Markdown fenced JSON proposal read, guarded CSV/TSV apply preview/cancel, standalone per-page source drawer, report/easing engine parity, source date/unit/evidence Inspector and audit, PPTX source metadata, strict native chart/table/rich-text/keyframe import limits.

**Known limits:** Arbitrary external HTML not pixel-perfect; PowerPoint charts are editable shapes, not Excel chart series; WebP PPTX is a placeholder; no Windows/Android/PowerPoint physical verification. Visual-reference match not measured. Fixed accepted score 42/53=79.2%, *not total V1 completion*. GitHub 403 write blocker as of 2026-11-03.

**Action economy:** No `.github/workflows`, no automatic Actions runs or release installers; no EXE/APK/ZIP; minimum local commits after grouped feature work. Only mark GitHub synchronized on successful remote-head readback. Do not initiate user hands-on validation without explicit request; use `docs/MANUAL_QA.md` when that request comes.
