# CURRENT DoCut RESUME POINT — V0.14.0-development

The current checkpoint is `docs/RESUME_CHECKPOINT_V014.md` and the latest local Git commit. The following section is an **older V0.12 historic checkpoint** and must not supersede the current source. Do not mark remote uploaded without verifying the remote branch.

---

# DoCut Studio V0.12 - source resume checkpoint

Date: 2026-11-02 (Asia/Seoul). Project identity: `neoflowcore/DoCut`. Local branch: `main` in `/mnt/data/docut-dev`.

## Restore authority and confidence

- Trust the current local Git index and checked-out working tree only after checking `git status`, `git log`, and `git diff`.
- First local baseline commit is `16d8ddc` for V0.11. The latest V0.12 local commit should be read with `git rev-parse HEAD`, not copied from documentation as the commit may be amended.
- If local files are not present in another session, find source snapshots within the DoCut project file surfaces; recover the exact folder structure and check the GitHub remote state before guessing a replacement repository.
- This is a source-only static HTML+JS app. `index.html` references `assets/` modules and must not be shipped as a standalone file alone.

## Main source files

- `index.html` - studio markup and entrypoint.
- `assets/core.js`, `assets/app.js` - project schema, editing, interactions and application state.
- `assets/easing.js` - cubic bezier graphs and easing math.
- `assets/css_import.js` - safe static stylesheet interpretation.
- `assets/export.js`, `assets/pptx.js`, `assets/styles.css` - import/export, native static PPTX model and styling.
- `docs/ACCEPTANCE_MATRIX.md` - 60 individually checked criteria (53 met; 88.3% of this checkpoint, not full product completion).
- `docs/PHASE_0_12_STATUS.md`, `docs/MANUAL_QA.md`, `docs/IMPORT_SPEC.md` - status and quality boundaries.

## Verified no-CI local test commands

```sh
npm test
npm run test:browser
```

Expected at this checkpoint: Node tests 73 PASS; 11 isolated Chromium browser suites PASS, including the 80-slide layout check. Running these commands is strictly manual and does not trigger Actions, installer builds or release packages.

## Remaining work

- GitHub remote source upload is blocked; see `docs/GITHUB_SYNC_BLOCKER.md`.
- Exact 1:1 reverse editing of complex third-party CSS/Grid/Flex/JS is not implemented; current HTML import is an explicit, safe approximation.
- Actual Windows Brave, Android Brave, and real PowerPoint edit/re-save manual tests are not performed. The user requested that manual testing be postponed until after further development.
- Design reference match cannot be computed without a definitive original reference file and a comparison pass.

Do not silently convert failed integrations, missing physical tests, or unimplemented one-to-one reverse imports into completed milestones. Do not create release/installer artifacts or GitHub workflow automation without an explicit physical-test release request.
