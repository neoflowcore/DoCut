# DoCut V0.14.0 development checkpoint

## Identity and provenance

- Product: DoCut Studio, source project `neoflowcore/DoCut`, intended branch `main`.
- Recovery base: V0.13 reconstructed local Git source, parent commit `3f10ddc`. This is **not** the original V0.12 Git history.
- No changes to `.github/workflows`; no EXE, APK, ZIP, installer or automatic Actions build generated.
- This is a source development checkpoint, **not** a Windows/Android/MS PowerPoint release or hands-on verification request.

## Implemented in the V0.14 batch

1. Fully editable **start and end poses** in each motion slot (x, y, scale, rotation, opacity, blur, brightness), with preset restoration, undo, saved project and HTML round-trip.
2. Midpoint keyframe **pose controls** for all seven channels; midpoint insertion samples the current visual pose rather than resetting every property to identity.
3. A motion engine that preserves an unedited preset endpoint when only one endpoint is customized, handles missing fields, and caps 60fps-targeted sample generation at 360 frames on long animations.
4. A native multi-cell **table grid editor**, add/remove rows and columns, per-cell value/foreground/background/bold/alignment, clipboard TSV/CSV multi-cell paste; edits invalidate previous verification.
5. Group-aware multi-object clipboard, lazy pointer checkpoints, non-destructive pointer cancellation, group-boundary movement preserving spacing, and snapping to canvas or neighboring object edges/centers.
6. Dense layouts now distribute extra visible blocks in an adaptive grid rather than placing them all in the final template slot. Content, source labels and protected layers remain intact.
7. Static HTML importer now maps supported embedded local PNG/JPEG/WebP images and supported nested bold/italic/underline/color ranges into editable text, while rejecting remote image sources and active scripts. This is an approximate import, **not** exact CSS/JS restoration.
8. PPTX OOXML output has globally unique embedded media names across slides, includes a supported PNG/JPEG master logo, handles positive/negative line direction, respects chart palette selections, retains supported partial text formatting as native editable runs, and preserves report theme colors/gradients with legible dark-theme footers.
9. Local image file picker (PNG/JPG/WebP ≤ 1.5MB) restored and tested; complete image stored in project JSON/HTML. WebP in PPTX is still a placeholder because the writer currently supports PNG/JPEG only.
10. Local backup recovery now tolerates malformed stored JSON or invalid project snapshots without replacing the active document. Browser storage permission denial is differentiated from a full storage quota in the save indicator.
11. Quality audit distinguishes missing sources from sourced-but-unverified numbers and flags low explicit text contrast. Mobile inspector gets an in-panel close control; newly surfaced advanced editing labels are Korean.

## Verified in this source

- Run only after grouped feature development: `npm run check:syntax`, `npm test`, `python tests/browser_recovery.py`, `python tests/browser_extended.py`, `python tests/browser_v014.py`, `python tests/pptx_memory_qa.py`.
- Final grouped verification (this environment): Node 59/59 PASS, Chromium original 14/14 PASS, extended 11/11 PASS, new V0.14 12/12 PASS; JavaScript syntax and Git whitespace checks PASS.
- Node and Chromium checks verify concrete model edits and user interactions, not just function existence.
- In-memory PPTX QA parses the package through `zipfile` and `python-pptx` without creating a PPTX or ZIP file.
- Tests use local headless Chromium; no GitHub Actions runs or GitHub storage artifacts.

## Acceptance numbers

- Use the fixed 53-item **V0.13 reconstruction acceptance matrix** for cross-version comparison: P0 4/6, P1 9/10, P2 9/10, P3 7/8, P4 9/11, P5 4/8 = **42/53 (79.2%)**.
- P2 increases by one criterion because custom start/end pose editing now exists and is browser-tested. All physical hardware checks and remote upload checks remain unresolved.
- This is a **fixed-scope acceptance rate**, **not** overall V1.0 product completion or a 79.2% design match.
- Design draft/pixel match: **not measured**. A user-approved reference plus accepted tolerance is required to calculate it.

## Deferred / unresolved

- Arbitrary external HTML/CSS/JavaScript/remote assets cannot be converted into pixel-perfect native DoCut design; diagnostics must remain visible to the user.
- PowerPoint behavior on physical Microsoft Office, especially text flow, layout fonts, background and edited media, remains untested.
- PPTX charts are collections of editable shapes/lines, not native Excel-linked charts; HTML animations are not converted into PPTX animations.
- Windows Brave and Android Brave touch/IME/GPU usage require a future user-approved hands-on check.
- The GitHub repository is empty at the last API check; only a successful write plus independent remote-head read can count as synchronized.

## Future user manual validation — NOT REQUESTED NOW

1. Open the complete source tree in Brave on Windows; compare 16:9 slide and controls across window sizes.
2. Insert, group, move near neighbors and edges, resize, undo and redo; verify no unexpected data changes.
3. For each of three motion slots, edit x/y/scale/rotation/opacity/blur/brightness and four intermediate keyframes; compare replay and reduced-motion.
4. Paste a multi-cell table and data chart with negative values, edit one cell, verify source revalidation warning.
5. Import a known local HTML report, compare headings, colors, embedded images, tables and expected loss diagnostics; export and reimport native DoCut HTML.
6. Open exported PPTX in Microsoft PowerPoint, edit individual text runs and table cells, move chart shapes, resave and reopen.
7. Test Android Brave actual touch, Korean IME, drawer close, screen rotation and background GPU load.
8. Save a `.docut.json` backup; test round-trip after browser restart and large multi-page reports.
