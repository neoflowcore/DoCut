# Same-project DoCut 0.16 source recovery checkpoint

Identity: `neoflowcore/DoCut` intended `main` branch. Do not substitute other projects or source files from unrelated chat history.

1. If local workspace exists, inspect `git log -1 --oneline`, `git status --short`, `docs/PHASE_0_16_STATUS.md`, `docs/EFFECT_LIBRARY_V016.md`, `docs/ACCEPTANCE_RECOVERY_V015.md`, and both local runtime modules.
2. Otherwise search this project's Library for the complete **root Git format-patch source transfer** named `DoCut_V016_SOURCE_TRANSFER_20261104.txt` (only after its creation is verified). Recover it into an empty Git repository with `git am`. Avoid using the extracted-text partial 141 KB copy of the original V0.15 700 KB patch.
3. Check connected GitHub `get_repo`, `search_branches` and root contents; do **not** infer a push succeeded from a local commit. As of the 2026-11-04 check this remote is empty and GitHub App blob write returned HTTP 403. No speculative `origin/main` readbacks.
4. Compare Vercel's existing `docut-studio` READY production deployment with local V0.16 source. Readback on 2026-11-04 confirms HTTP 200 at `https://docut-studio.vercel.app`, with version string `0.15.0`, hence that URL does not currently serve this 0.16 source. Do not add an automatic Git-triggered deployment configuration or create binary/ZIP artifacts.
5. Manually execute the grouped test suite from `docs/PHASE_0_16_STATUS.md` only when finished with feature changes, not after every small edit. The PPTX parser uses memory only.
6. User manual validation of Windows/Android Brave, Microsoft Office and print behavior remains separate and is **not** a function of passing headless Chromium tests. See `docs/MANUAL_QA.md` for detailed procedures.
