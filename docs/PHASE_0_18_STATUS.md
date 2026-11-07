# DoCut Studio V0.18 - guarded persistence and recovery

Baseline: V0.17 source transfer reconstructed on 2026-11-04. Source-only development; **not an online release**.

## Identity and remote truth

- Project: `neoflowcore/DoCut`, intended `main` branch, not a different repository.
- Verified on 2026-11-04: repository exists, but repository content and branches are empty; earlier source writes were HTTP 403. No claim of remote synchronization.
- Vercel project `docut-studio` has a READY old deployment; V0.18 is **not** claimed published.
- Original V0.12 Git object tree is not claimed restored, although subsequent DoCut format-patch history and sources can be reconstructed.

## V0.18 batch, source implementation

1. **Non-destructive checkpoints**: one revisioned and checksummed storage record; detect truncated/malformed payload; never wipe corrupt current/legacy source on startup. Preserve legacy `docut-studio-v13` while migrating new snapshots to `docut-studio-v18-checkpoint`. Checksum is accidental-error detection, *not* an authenticity or cryptographic guarantee.
2. **Concurrent editing**: per-tab revision token, blocking stale writes, a visible save-risk banner, local JSON export, explicit selection to load latest tab or replace it only after backup. `storage` events expose external updates; the in-browser storage approach is *not* a distributed transactional database. Native cross-tab race behavior requires actual Brave validation.
3. **Quota/save failures**: do not replace stored previous data; display persistent warning and allow unsaved `.docut.json` export.
4. **Corrupt backup indexes**: no silent filtering/discarding of invalid records; download damaged raw TXT before explicit reset. If the stored raw data changes after download, reset is rejected until that newer raw version is exported.
5. **Restore review**: display page count/order, additions/removals/edits, elements, changed evidence/verification, removed verified elements, document title/theme/master changes before explicit acceptance. Guard against edits while previewing; provide backup JSON export.
6. **Editing loss guards**: persist live rich text changes before blur (except while IME composing), keep one Undo boundary per edit session, Esc cancels edit, prevent 12,000+ character content and >60 formatted runs from silent truncation, split long rich spans without dividing surrogate pairs, reject overlength paste without clipping.
7. **Imports**: prevent stale asynchronous JSON/HTML/CSV/image selection from replacing a later edit; preserve pre-existing source evidence and current document until user applies a reviewed import.

## Testing gates and limits

Execute grouped checks only after source development:

```
npm run check:syntax
npm test
python tests/browser_recovery.py
python tests/browser_extended.py
python tests/browser_v014.py
python tests/browser_v015.py
python tests/browser_v016.py
python tests/browser_v017.py
python tests/browser_v018.py
python tests/pptx_memory_qa.py
python tests/pptx_stats_memory_v017.py
```

The new V0.18 browser suite tests checkpoints with a **test-controlled in-memory localStorage and synthetic storage events**, because this sandbox blocks `file://` and loopback navigation. It does not establish physical Windows/Android Brave native multi-tab persistence. Legacy regression and PPTX structural tests remain separate. Microsoft PowerPoint desktop use, real touch/IME and design match are **not measured**. Do not generate installer, ZIP, EXE/APK or real PPTX release artifacts until user requests hands-on inspection.

## Percentages: historical versus this phase

The original signed-off fixed 53 acceptance items remain at their **historical** values (not re-scored): P0 4/6 66.7%, P1 9/10 90%, P2 9/10 90%, P3 7/8 87.5%, P4 9/11 81.8%, P5 4/8 50%. 42/53=79.2% is NOT whole V1.0 completion; it excludes unmeasured user-device readiness and these new regression cases. Visual similarity to the 89 reference screenshots remains unmeasured. Give new V0.18 tests as separate executed counts.

## Executed local regression receipts (latest V0.18 pass)

- `npm run check:syntax`: PASS (all runtime JavaScript modules).
- `npm test`: **136/136 PASS** after final preservation guards, including 20 new V0.18 Node cases.
- Chromium browser scripts: baseline `14/14`, extended `11/11`, V0.14 `12/12`, V0.15 `15/15`, V0.16 `14/14`, V0.17 `13/13`, V0.18 `16/16` distinct cases; total **95/95 case results PASS**. V0.18 cases were exercised in smaller isolated batches after an execution-time sandbox timeout, not claimed as a final single uninterrupted browser command. Cross-tab tests use synthetic storage events only.
- `tests/pptx_memory_qa.py`: PASS (3 in-memory slides, 6 images, editable shapes); `tests/pptx_stats_memory_v017.py`: PASS (9 kinds, 9 slides, editable SVG-equivalent shapes and source metadata); no PPTX file saved.
- No GitHub Actions, release installers, EXE/APK, ZIP packages or deployment builds were performed.

The V0.18 implementation also records which **exact unsaved document revision** was exported; an old downloaded JSON can no longer authorize discarding later edits if backup storage is unavailable. Approved backup restoration now writes successfully to localStorage *before* switching the visible working project; storage quota or tab conflict leaves the original project in place and does not claim successful recovery. Page-order warnings distinguish genuine reordering from page creation/deletion.
