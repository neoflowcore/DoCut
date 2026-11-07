# DoCut V0.19 same-project continuation

**Identity:** `https://github.com/neoflowcore/DoCut`, intended `main`, Vercel project `docut-studio`. Check these exact identities in the live GitHub/Vercel connectors before any upload. An empty remote, absent main or 403 write response is a block on *remote sync*, not a reason to discard local source.

**Preferred source:** in this DoCut project or Project Library, `DoCut_V019_SOURCE_TRANSFER_20261104.txt` as the complete Git format-patch, plus `DoCut_V019_INCREMENTAL_PATCH_20261104.txt` and `DoCut_V019_RESUME_RECEIPT_20261104.txt`. If newer patches exist, prefer their verified Git tree and checkpoint. Do not infer GitHub upload from a patch in Library. The original V0.12 objects were not restored.

**Restore if local source absent:** create an empty Git folder, `git init -b main`, `git am /path/to/DoCut_V019_SOURCE_TRANSFER_20261104.txt`, verify tree and `git status --short`, read `docs/PHASE_0_19_STATUS.md`, `docs/MEDIA_AND_LAYERS_V019.md`, `docs/MANUAL_QA.md`. Run `npm run check:syntax`, `npm test`, all `tests/browser_*.py` and two `tests/pptx_*memory*.py` after substantial grouped changes, not on every minor edit.

**Runtime sources:** `index.html` plus entire `assets/` directory, including `media_layout.js`, `layer_ops.js` and `persistence.js`. Source `index.html` alone is **not** an offline single-file app. The export HTML generated from the editor is the independent offline report.

**Safety:** No automatic Actions workflows, builds, installers, EXE/APK/ZIP, unnecessary CI artifacts, deploy or release before the user explicitly requests a hands-on check. Source changes may be pushed after write permission is verified and ordinary push is proven not to trigger a build. Re-read remote head before claiming sync.

**Known incompleteness:** media CSS mask/PPTX motion not native; WebP PPTX placeholder; exact 89-reference pixel fidelity, actual Brave touch/IME, user-file export and PowerPoint open/edit/resave not physically verified. Previously reported 42/53=79.2% is historical fixed acceptance, **not** product V1.0 completeness.

**V0.19 local QA receipt:** 151/151 Node test cases; 107/107 Chromium scenarios (14+11+12+15+14+13+16+12); both in-memory PPTX scripts PASS, no on-disk PPTX created. This is a source-level test fixture, not actual Brave/Office hardware verification.
