# DoCut Studio V0.19 — non-destructive image editing and layer folders

**Scope:** source-level development only. These features have not been deployed or physically checked on Windows/Android Brave or PowerPoint. There is no EXE/APK/ZIP/install archive, automatic Actions workflow, or CI invocation in this phase.

## 1. Image editing contract

- A PNG, JPEG or WebP is embedded as a `data:image/...;base64` document resource. File uploads are local only, with the existing 1.5MB file limit. Neither the editor nor standalone HTML fetches remote images to reconstruct the original file.
- V0.19 adds `data.width`, `data.height`, `data.alt`, `style.imageFit` (`cover`, `contain`, `fill`), `focusX`, `focusY`, `cropZoom` (1–4 for cover), and `aspectLock`. These are normalized as part of the existing editable native project schema. Image bytes remain intact when the frame changes. Existing documents without these fields inherit defaults; the old JSON/HTML decoding path is retained.
- Image frame geometry comes from one shared pure helper (`assets/media_layout.js`) to avoid editor, standalone HTML and PPTX crop disagreement. Cover computes the visible region and native PPTX `<a:srcRect>` percentages; contain centers an undistorted source within the allotted frame. Intentional fill stretches the image. PNG/JPG become editable picture elements in native PPTX. **WebP** is supported in HTML but remains a static placeholder in PPTX. Complex SVG/CSS masks and motion are not migrated to native PPTX.
- PNG IHDR, JPEG SOF and EXIF 5–8 orientation, and WebP VP8/VP8L/VP8X headers are bounded; unusable or oversize intrinsic dimensions are rejected. This checks metadata structure, not image authenticity, exact visual similarity or PowerPoint's interpretation of EXIF.
- In the Inspector: choose fit mode, set x/y focal percentages, crop zoom, alt text and frame aspect-lock; drag **inside** the photo in crop mode, adjust focal point using arrows (Shift = 10%), reset crop with Undo. Normal element drags move the whole frame; `Shift` temporarily locks ratio on resize. Mouse/pointer cancellation reverts the changes without saving a half-drag.
- Existing document source entries are preserved when the photograph is replaced; incoming filename is recorded in `data.alt` and, if space permits, in the element notes. New blank-source images take the filename as the source. Editing a photograph invalidates its previous manual verification status.
- The image src is not re-encoded or cropped destructively. Non-PNG/JPEG/WebP sources, malformed headers, unsupported/huge dimensions and stale async FileReader completions are rejected without replacing an existing image.

## 2. Layer operation contract

- New pure `assets/layer_ops.js` hosts selection, multi-duplicate, guarded delete, nudge, canvas alignment, non-overlapping distribution, folder enumeration and page cloning.
- **Group folders:** group IDs remain stored on individual elements. The layer panel can collapse/expand one-level groups, select group members, name groups (max 80 chars) and ungroup. The folder view is purely visual: source stacking order, element IDs, citations and geometries are not reordered. Group labels and membership round-trip through DoCut JSON/HTML and page clone. Group rename, regroup and ungroup are aborted atomically while any affected group member is locked; a locked child cannot be silently separated from its folder.
- Multi-drag, Ctrl+D, Ctrl+C/V, Delete, arrow keys (Shift=10), lock/unlock, hide/show, copy/move between pages preserve relative group offsets and do not silently mutate locked members. Clipboard copying may read locked elements; direct duplicate and delete do not alter locked originals. Copied group IDs are freshly generated and do not collide with originals.
- Canvas alignment moves the selection as a rigid whole while keeping relative positions, honoring slide boundaries. Equal spacing between 3+ selected unlocked elements leaves first and last anchored and refuses impossible negative spacing instead of overlapping or escaping the page. Group actions have one Undo checkpoint; group labels are bounded rather than truncated on import.
- Capacity guard: 120 elements per page. Multi-copy / cross-page transfers reject the operation before partial insertion when exceeding capacity.

## 3. Format and QA boundaries

- Native DoCut project JSON and DoCut-exported HTML retain group and image editing metadata. Independent HTML displays the calculated frame, with local embedded media. PPTX uses editable native picture frames, and stores crop percentages for PNG/JPG. PPTX does **not** gain editable image masks/animations or Excel-linked chart series.
- Unit tests: `tests/media_layers_v019.test.cjs` validate header parsing, EXIF, crop math, fit modes, preservation, grouping, align, spread, Undo-friendly pure changes and in-memory OOXML. Browser tests: `tests/browser_v019.py` validate Inspector controls, keyboard/pointer crop, Undo, group folders, batch moves and responsive 390px viewport.
- The headless Chromium test runner injects source code and uses a synthetic browser storage fixture due sandbox `file://`/loopback restrictions. **Not equivalent to physical Windows/Android Brave**, touch or EXIF correctness in Microsoft Office.
- The original 89 JPG references contain no runnable motion videos or exact pixel benchmark. **Design match percentage not determined.** Source integrity and accessibility behavior are more important than claiming reference duplication.

## 4. Follow-on work

- Full Windows/Android Brave manual verification of actual touch handling, IME, upload picker, memory use, background idle, and large source/photo behavior remains deferred until the user explicitly requests physical checks.
- PowerPoint desktop import/edit/resave and precise cropping/mask compatibility remain deferred. No test release artifact is created during source development.
- The connected GitHub App must grant **contents:write** to `neoflowcore/DoCut`; do not claim a remote branch or deployment without independent GitHub readback and actual Vercel HTML version confirmation.
