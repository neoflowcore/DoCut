# Same-project DoCut V0.18 recovery checkpoint

Repository: https://github.com/neoflowcore/DoCut . Intended branch `main` remains absent until remote push and readback succeed. Do not query or upload a substitute project.

The previous source is in `DoCut_V017_SOURCE_TRANSFER_20261104.txt` (full Git format-patch). The V0.18 full source transfer file, when generated, should be named `DoCut_V018_SOURCE_TRANSFER_20261104.txt`. The combined patch contains source, tests and docs and can be replayed via `git init -b main` / `git am ...` into an empty repository. The original V0.12 Git object identity is not guaranteed; compare source tree, not reconstruction SHA. This is not a remote upload.

If the local path survives, inspect `/mnt/data/docut-v018`, `git log -1 --oneline`, `git status --short`, `docs/PHASE_0_18_STATUS.md`, `docs/STORAGE_AND_RECOVERY_V018.md`, `docs/MANUAL_QA.md` first. If missing, search the current DoCut project conversation and Project Library for the exact V0.18 whole-source transfer, receipt and V0.17 predecessor; materialize/restore without switching repos.

Startup requires `index.html`, `assets/*.js`, `assets/styles.css`. New `assets/persistence.js` loads before `assets/app.js`; `tests/browser_recovery.py` has the corresponding JS order. `index.html` alone is not the source application; standalone HTML exports are separately generated.

Run the grouped manual source regression in `docs/PHASE_0_18_STATUS.md` after a whole feature batch. Do not add `.github/workflows`, do not run Actions, no EXE/APK/ZIP install/build archives. One substantial local commit; remote-head readback before claiming GitHub synchronization. Do not deploy preview/production automatically; old `docut-studio.vercel.app` is not V0.18 until verified otherwise.

V0.18 regression receipt: Node 136/136, Chromium 95/95 distinct cases across previous regression suites and V0.18 split execution; PPTX two suites in memory. Do not mistake these counts for overall product completeness, physical Brave validation or design similarity. Old 42/53 acceptance accounting remains historical only.
