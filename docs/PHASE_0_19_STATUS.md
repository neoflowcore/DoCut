# DoCut V0.19 grouped source development — image and layer editing

Date: 2026-11-04 KST. **Source-only**, not a published DoCut release.

## Provenance and verified baseline

- Same-project `DoCut_V018_SOURCE_TRANSFER_20261104.txt` restored using `git am` into an empty local `main` directory. Restored V0.18 tree hash `d15f235be686339ed5d0f569852f9e2387bdfce4` and 67 tracked paths matched previous receipt. New Git object/commit SHAs after replay may differ because committer times differ. **Original historical V0.12 Git objects are not guaranteed.**
- Connected GitHub `neoflowcore/DoCut` exists; its API reported size 0 and no branch. Vercel `docut-studio` had a READY older production deployment. Do not infer that a local patch is remotely synchronized.
- V0.18 prior test receipt: Node 136/136, Chromium 95/95, two in-memory PPTX routines. These historical test counts are not used to assert new V0.19 correctness.

## V0.19 work package

1. Image metadata and non-destructive crop/contain/cover, zoom and aspect lock, keyboard/pointer focus and reset.
2. Headless source parity for native project JSON, standalone embedded HTML and PNG/JPG OOXML picture crops; WebP native-PPTX limitation disclosed.
3. Media source evidence preservation and changed-media verification invalidation; safe async import and bounded metadata checks.
4. Layer folders, names and group selection, one-level collapse/expand, multi-select copy/drag/delete/lock/show, cross-page ID remap, group-aware page clone.
5. Selection-preserving canvas alignment and deterministic spacing, with locked-layer protection, overlap refusal and undo.
6. Retained all V0.18 checkpoint, backup recovery, statistical chart and AI approval controls.

Detailed contracts and testing cautions are in `docs/MEDIA_AND_LAYERS_V019.md`.

## V0.19 test receipt

**Executed source-only grouped QA (2026-11-04):** `sh tools/check_source_v019.sh` completed with exit status 0: `npm run check:syntax` PASS; Node `npm test` **151/151 PASS** (includes 15 V0.19 image/layer cases); Chromium original 14/14, extended 11/11, V0.14 12/12, V0.15 15/15, V0.16 14/14, V0.17 13/13, V0.18 16/16 and V0.19 12/12: **107/107 PASS**. Both PPTX in-memory scripts PASS: 3-slide 6-media structure and nine editable statistical charts. No physical Brave tests, no real PPTX file or deployment artifact. The complete grouped source suite was rerun after the final locked-group and editable-HTML group-label guards; exit 0 and the same 151/151 Node, 107/107 Chromium and two PPTX-memory passes were confirmed.

## Historic completion percentages (not a new V1.0 total score)

The previously fixed 53 acceptance items remain an unmodified historical accounting: P0 4/6 66.7%, P1 9/10 90.0%, P2 9/10 90.0%, P3 7/8 87.5%, P4 9/11 81.8%, P5 4/8 50.0%; combined **42/53=79.2%**. No new V1.0 whole-project completion percentage is assigned, because acceptance scope expanded. No pixel/visual similarity percentage is assigned without the original 89-image reference set and a measured comparison.

## Manual verification and action economy

**Physical Windows Brave, Android Brave and Microsoft PowerPoint remain NOT TESTED.** No EXE/APK/ZIP, no Vercel build/deployment, no GitHub Actions. Assemble one source-only commit after tests and preserve a full Git format-patch TXT in the Project Library. Use only repository `neoflowcore/DoCut` if write permission is available; do not swap to another repository.
