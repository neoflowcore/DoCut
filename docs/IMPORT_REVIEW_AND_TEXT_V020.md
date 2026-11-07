# DoCut V0.20 · External HTML import review and opt-in text rewrite

**Scope:** Local code source only, not a remote release. Original source HTML and any user-selected documents are not uploaded to a server.

## 1. Safe import review

1. Read a user-chosen HTML, TXT or DoCut JSON file entirely before applying any edits. Enforce a 12 MB file limit and the existing 50-page project cap.
2. For generic HTML, parse markup without executing scripts. Existing importer neutralizes passive remote image requests before constructing a DOM. External CSS/scripts/iframes, complex Grid/Flex/JS rendering are not faithfully reconstructed.
3. Build a structured review including source counts, imported counts, the existence of evidence, embedded/omitted raster images, formatted elements, tables and statistical charts; expose parser truncation and limitation warnings.
4. Present separate **current DoCut page** and **inert converted DoCut candidate page** schematic maps. The map is an approximate 16:9 rectangle and escaped-label layout, **not a screenshot of the original HTML**. It does not run any imported style, script, frame, media or link.
5. Generic HTML (and any import with detected destructive loss) requires a deliberate acknowledgement before Append/Replace become enabled. DoCut native JSON is still reviewed, but valid native data without detected loss can be applied without a loss acknowledgement.
6. Append becomes disabled if it would exceed 50 pages; Replace is disabled for an empty candidate. Cancel never modifies the active document. Changes to the current project between upload and approval invalidate import, and source originals remain in the user's files.
7. Provide TXT export of the independent import diagnostics. The diagnostic includes counts and warning types, not the original untrusted HTML content.
8. Use existing backup and Undo on explicitly approved import; preservation failures continue to be surfaced by V0.18 storage risk banner.

## 2. Content find/replace

1. Search literal text, never execute user-supplied regex or markup. User chooses all pages or current page, and optional case sensitivity.
2. Analyze and show each affected element, first-match context, before/after snippets, occurrence count and formatting-loss warning. **Zero elements are checked by default.**
3. A user explicitly checks elements to apply; UI detects changes to project data during review by full serialized baseline comparison.
4. Locked elements are never changed. Existing rich-text blocks are skipped unless the user deliberately opts in to their plain-text replacement and agrees to reset their inline formatting.
5. Existing source, evidence, date, unit, chart/tabular data and master settings are never searched or replaced. If block text changes, only that block's verified flag becomes `false`.
6. Enforce 12,000-character per-block limit, 2,000 occurrence guard and bounded 120/300-character query/replacement fields. Oversized changes are skipped, excessive matching is rejected. An approved group of edits is validated completely before any changes are made, then committed as one Undo/redo operation.
7. Unicode case-insensitive literal matching is index-safe even for case folds that change UTF-16 length; no runtime HTML injection.

## 3. Known boundaries

- The two schematic maps compare a current DoCut page and a DoCut-converted page at the same index, not the real browser rendering of the user's original HTML.
- Text replacement operates on `element.text` only. Table rows, chart/ROC original data, internal notes and provenance metadata are deliberately out of scope.
- A confirmed replacement clears an affected block's verification flag. Users still need to check accuracy, typography and financial/statistical meaning.
- In-browser automated tests use synthetic storage and local DOM/script injection; Windows Brave, Android Brave, actual physical hardware and Microsoft PowerPoint have **not** been checked.
- No installers, automatic GitHub workflows, CI release artifacts, PPTX or video outputs are produced for this phase.

## 4. Human acceptance (do not claim until performed)

- Import original DoCut HTML with embedded project JSON; ensure no content or source loss by verifying project JSON round-trip and saved reports.
- Import foreign HTML containing nested positioned blocks, tables, large text, external scripts, remote images and complex layouts; verify explicit warnings and self-contained schematic labels.
- Inspect loss acknowledgement gate; test cancellation and an edit to the active document while import is open; ensure no overwrite.
- Test replace among locked/unlocked layers, formatted and ordinary text, Korean IME, numbers embedded in text, and open two browser tabs with conflict warnings.
- Inspect 390px mobile window in Brave and manually verify `prefers-reduced-motion` and touch controls; test saved HTML via local file and PowerPoint editing separately.

## 5. Import parser hardening

- Visible user text is collected from inert text nodes and excludes embedded `<script>`, `<style>`, `<template>`, SVG, iframe, audio/video, and other non-prose nodes.
- Inline and stylesheet `display:none`, `visibility:hidden`, HTML `hidden`, and `aria-hidden=true` elements are omitted with an explicit count warning.
- Remote CSS background images are never fetched or embedded; missing ones are logged.
- Foreign tables with rowspan/colspan emit a warning that merged-cell semantics are flattened, not silently considered lossless.
