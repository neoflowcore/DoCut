# V0.20 · Review-first import and text edits — source status

Date: 2026-11-04 KST. Project `neoflowcore/DoCut` (intended `main`).

## Verified starting state

- Source worktree `docut-v019` remained available, 7 local commits, 75 Git-tracked files and clean Git tree `4c23c39696ba0436fecc3f572f93e124c441fce0` (`baef79e`).
- Source backup: `DoCut_V019_SOURCE_TRANSFER_20261104.txt` / previous DoCut Library receipts. Original V0.12 Git objects not claimed.
- Connected GitHub `neoflowcore/DoCut` reported repository size 0, no branches, `main` not present. Existing Vercel `docut-studio` project reports prior production deployment READY. No V0.20 deployment is claimed.

## Development scope

- Import candidate loss/metadata assessment (`assets/import_review.js`), escape-safe no-execution 16:9 schematic comparison, page picker, warning acknowledgement, 50-page and empty-project guard, review receipt TXT, no silent import.
- Literal global find-and-replace (`assets/text_rewrite.js`), case-sensitive/all/current scope, opt-in formatting conversion, source and metric protection, explicit per-element selection, stale-baseline conflict guard, Undo and V0.18 save risk integration.
- Mobile/responsive compare panel, accessible labels and controlled warning display.

## Verification register

**Executed, source-only (2026-11-04):**

- `npm run check:syntax`: **PASS**; Node `npm test`: **172/172 PASS** (V0.19 baseline 151 plus 21 V0.20 tests).
- Chromium test counts confirmed across grouped and bounded restarts: baseline recovery 14/14, extended 11/11, V0.14 12/12, V0.15 15/15, V0.16 14/14, V0.17 13/13, V0.18 16/16 (11+5 separate executions after first run's browser transport was cut off), V0.19 12/12, V0.20 15/15 = **122/122 individually confirmed**. The all-suite script exceeded the execution timeout; **do not present this as a single uninterrupted command PASS**.
- Two in-memory PPTX tests **PASS**: editable shapes, metadata and nine statistical chart types. No PPTX download or release artifact produced.
- Browser test driver uses injected local JS and synthetic localStorage. Actual Windows/Android Brave, physical PowerPoint open/edit/resave, and original 89-image visual identity are **not verified**.
- Visual inspection: generated local Chromium screenshots at 1500x900 and 390x844 showed no horizontal document overflow and dialog scroll access. This is automated screenshot review, not user-device validation.

See `tools/check_source_v020.sh` and `tests/browser_v020.py` for reproducible manual-only test commands.

## Scope/percentage caveats

Historical 53 fixed checks from V0.15 remain P0 4/6 66.7%, P1 9/10 90.0%, P2 9/10 90.0%, P3 7/8 87.5%, P4 9/11 81.8%, P5 4/8 50.0%, total 42/53 79.2%. These are not up-to-date whole-project completion fractions. The 89 original screenshot design-reference percent is **not measured** (no original frame-by-frame benchmark), and no manual Windows/Android/PowerPoint verification has been performed.

## Deployment/CI policy

No `.github/workflows`, no automatic Actions, no ZIP/EXE/APK, no deployment until explicitly asked for hands-on verification. Push source only if the GitHub integration has write permission; otherwise preserve the complete Git format-patch `.txt` and report the blocker.
