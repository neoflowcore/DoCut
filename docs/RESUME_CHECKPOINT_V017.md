# DoCut V0.17 resume-only checkpoint (same-project)

**Repository identity:** `https://github.com/neoflowcore/DoCut`, intended `main`; do not switch to unrelated repos. Connected GitHub was EMPTY/no branch on 2026-11-04 and GitHub App create-blob previously returned HTTP 403; recheck, never report pushed without remote-head readback.

**Source provenance:** V0.13 reconstructed source + V0.14 + V0.15 + V0.16 grouped patch recovered from `DoCut_V016_SOURCE_TRANSFER_20261104.txt`. The original V0.12 Git tree is not claimed restored. V0.17 adds evidence-first 9 statistical chart types (details `STAT_CHARTS_V017.md`).

**Current root:** `/mnt/data/docut-dev` if still mounted. Inspect `git log -1 --oneline`, `git status --short`, `docs/PHASE_0_17_STATUS.md` and `docs/STAT_CHARTS_V017.md`. If environment reset: search same-project Library/previous conversation for `DoCut_V017_SOURCE_TRANSFER_20261104.txt` complete root Git format-patch, or apply the incremental patch to the V0.16 recovered tree.

**Runtime:** `index.html` must be kept adjacent to **all** `assets/*.js` and `assets/styles.css`; standalone exported HTML is a different, separately generated file. `stat_charts.js` must load after `effect_catalog.js` and before `core_enhanced.js` calls during app startup (index loads enhanced core first, but the enhanced module invokes stat methods only on project normalization after all scripts loaded). Browser test loader must list stat module. Do not assume server HTML or installed app is V0.17 until independent HTTP readback.

**Manual one-time grouped tests:** `npm run check:syntax && npm test && python tests/browser_recovery.py && python tests/browser_extended.py && python tests/browser_v014.py && python tests/browser_v015.py && python tests/browser_v016.py && python tests/browser_v017.py && python tests/pptx_memory_qa.py && python tests/pptx_stats_memory_v017.py`. PPTX QA uses only RAM. Keep `.github/workflows` absent, no automatic Actions, installers or release packages. Source-only commit once after significant work; avoid serial small commits.

**Measurement:** Historical fixed 53 acceptance items = P0 4/6, P1 9/10, P2 9/10, P3 7/8, P4 9/11, P5 4/8, total 42/53=79.2% **historical**, NOT V0.17 or V1 completion. Design-image fidelity not measured. Microsoft PowerPoint, Windows Brave, Android Brave manual testing not performed.
