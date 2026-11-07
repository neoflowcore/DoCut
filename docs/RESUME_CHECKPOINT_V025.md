# DoCut V0.25 resume checkpoint

Only the same-project DoCut Studio repository: `https://github.com/neoflowcore/DoCut`, intended local `main`. Do not use other neoflowcore project records.

V0.24 preceding source was restored from the same-project V0.24 full patch: local source tree `0f2546018fae7c501a92914b24f8176b10c58111`, 111 tracked files. See `docs/PHASE_0_24_STATUS.md` and `/DoCut/DoCut_V024_SOURCE_TRANSFER_20261104.txt` in Library.

V0.25 new files `assets/story_player.js`, `tests/story_player_v025.test.cjs`, `tests/browser_v025.py`, docs and script `tools/check_source_v025.sh`. Modified core schema, editor/app, standalone export and browser loader. Feature details: `docs/STORYBOARD_PLAYBACK_V025.md`.

Prior GitHub connector `mcp__GitHub__create_blob` returned 403 `Resource not accessible by integration` and `search_branches` found no remote main; must retest before remote upload claims. Vercel live domain `docut-studio.vercel.app` was an older V0.15.0 production build before source change; do not present new code as deployed.

Full/resume Git format-patch TXT is generated after the *single* grouped source commit and is accompanied by a verified receipt. Restore into empty repo using `git init -b main` and `git am <full source TXT>`, then verify tree SHA and  file count; if V0.24 source exists use V0.25 incremental patch. No ZIP/installer, no Actions, no production deploy.

Verified source tests: syntax PASS, Node 388/388, Chromium 261/261 via individual suites/3-way sharding, in-memory PPTX 2/2. All synthetic, NOT real devices. Reproduce with `npm run check:syntax`, `npm test`, source-only Chromium suites (`browser_recovery.py`, `browser_extended.py`, `browser_v014.py` through `browser_v025.py`, split to avoid execution cap), and in-memory PPTX tests. Real Windows/Android Brave, PowerPoint and visual fidelity not yet checked. Historical fixed 42/53 (79.2%) is NOT total V1.0 completeness; 89-JPEG design similarity not measured.
