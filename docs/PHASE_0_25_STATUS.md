# DoCut V0.25 — source development status and measured gates

Date 2026-11-04 KST. Same project neoflowcore/DoCut; intended branch main. V0.24 full source was verified before development (tree `0f2546018fae7c501a92914b24f8176b10c58111`, 12 reconstructed commits, 111 tracked paths). Github remote content and Vercel production are independent from local code.

## Delivered in this source batch

- Offline storyboard clock with configurable page dwell time (3–60 seconds), pausing, deliberate start, speed, repeat, scene/local and entire-project seek, weighted scene strip.
- Up to 16 safe nonoverlapping public captions per page, precise millisecond timestamps, explicit atomic Apply, duration truncation protection, Undo/Redo and three caption styles.
- Same storyboard runtime directly embedded in reversible standalone public HTML/TXT. No video file/media capture; PowerPoint remains static. Existing confidential review notes stay out of public HTML.
- Mobile/right inspector interception fix; textarea blur no longer replaces the Apply button before its click. Stop and hidden-document action cancel ongoing animations and timer instead of restarting them.

## Source-only QA

- `npm run check:syntax` PASS; `npm test` **388/388 PASS**: previous V0.24 baseline 338 plus **V0.25 new 50/50**.
- Existing synthetic Chromium suites V0.13/extended/V0.14 through V0.24: **233/233 PASS** over individual suites and 3-way shards. V0.25 new Chromium **28/28 PASS** across 3 shards (10+9+9). Total **261/261 PASS**, NOT a single uninterrupted browser execution.
- PPTX *in-memory* structural suites **2/2 PASS**, native Office opening NOT tested, no real PPTX saved.
- The browser suites inject source scripts with emulated in-memory storage; no real multi-tab Brave, Android touchscreen/IME or hardware GPU measured. Scene strip no outer horizontal scrolling was checked at 390px under headless Chromium.
- Source `git diff --check` and patch replay documented in resume receipt; full source and incremental TXT are not installation artifacts.

## Still pending

- GitHub App repository write permission and remote main creation/sync: inspect and test before claiming upload. No Actions workflow is added.
- Manual Windows Brave, Android Brave with real touch/IME/rotation/long usage/GPU, actual Microsoft PowerPoint editor and export test, 89-JPEG visual similarity audit. Do not report these as verified based on headless Chromium or in-memory PowerPoint structures.
- No EXE/APK/ZIP, real PPTX, video, deployment build, or Vercel release in routine source development.

Historical fixed acceptance denominator (NOT V1.0 product completeness): P0 4/6 66.7%; P1 9/10 90%; P2 9/10 90%; P3 7/8 87.5%; P4 9/11 81.8%; P5 4/8 50%; total 42/53 79.2%. Current V1.0 overall completion and fidelity to 89 design references are NOT MEASURED.
