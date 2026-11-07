# DoCut V0.20 same-project source continuation

Identity only: `https://github.com/neoflowcore/DoCut`, branch intended `main`; existing Vercel project `docut-studio` and not any other project's repository.

Preferred recovery: current project Library `/DoCut/DoCut_V020_SOURCE_TRANSFER_20261104.txt` (when successfully published there), plus incremental V0.19→V0.20 patch and test receipt. If absent, use the proven V0.19 full source patch and this session's V0.20 incremental patch. This is not proof of GitHub upload.

Restore: empty folder, `git init -b main`, `git am /path/DoCut_V020_SOURCE_TRANSFER_20261104.txt`, verify recorded tree hash and clean Git status; read `docs/PHASE_0_20_STATUS.md` and `docs/IMPORT_REVIEW_AND_TEXT_V020.md`.

Open editor with `index.html` AND complete `assets/` including `import_review.js` and `text_rewrite.js`; standalone HTML *report* produced by exporter is separate. The app source index alone is not a standalone executable.

After grouped changes, once per batch run `sh tools/check_source_v020.sh` (Node syntax/unit tests, browser regression, PPTX memory tests, no build). Physical Windows Brave/Android Brave and Microsoft PowerPoint remain unverified.

Safety: no automatic GitHub Actions workflows, no installers/ZIP, no build or release output until asked. A 403 GitHub write failure blocks remote sync only; never overwrite another repository. Record the actual new commit SHA/tree/test results after execution. The old 42/53=79.2% is fixed historical acceptance, not new V1.0 completion. Design-reference 89-image equality is not calculated.

Verification checkpoint: source-level syntax PASS, Node 172/172 PASS; Chromium 122/122 confirmed across segmented suites (V0.18 last 5 separately after tool timeout); PPTX memory 2/2 PASS. The full shell runner timed out, not a single uninterrupted pass. No physical end-to-end results.
