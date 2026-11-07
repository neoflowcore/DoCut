# DoCut UBS Global Wealth Report 2025 — independent vector evidence v0.36

## Independent source and scope
Source: https://www.ubs.com/content/dam/assets/wm/static/noindex/gwr-2025-digital.pdf
Source document: 51 pages, 841.89 × 595.276 PDF pt. Six pages tested: actual PDF pages **5, 8, 11, 13, 16, 18**. No invented source page identity. Original source PDF is not bundled or committed.

## Two genuinely different image renderings
A. Reference: independently downloaded UBS PDF rendered directly with PyMuPDF at 1.5x.
B. Candidate: text/image/brand-logo-free vector SVG made from PDF path geometry, independently rendered with SVG renderer at 1.5x.
Text glyph bounding boxes (not whole chart panels) and a small branded icon box excluded from scoring. Masks remained <35% of canvas. Both frames are 1263×893.

## Scores, with source content removed
| PDF page | Composite | SSIM | Edge F1 | RGB color | Light / shadow | Mask | PDF graphics PASS |
|---|---:|---:|---:|---:|---:|---:|---|
| 5 | 99.7851% | (see audit JSON) | 100.0% | (see audit) | (see audit) | 28.97% | PASS |
| 8 | 99.8434% | (see audit) | 100.0% | (see audit) | (see audit) | 32.11% | PASS |
| 11 | 99.5997% | (see audit) | 100.0% | (see audit) | (see audit) | 34.23% | PASS |
| 13 | 99.5295% | (see audit) | 98.5952% | (see audit) | (see audit) | 16.36% | PASS |
| 16 | 99.3850% | (see audit) | 98.2312% | (see audit) | (see audit) | 21.60% | PASS |
| 18 | 99.4055% | (see audit) | 100.0% | (see audit) | (see audit) | 33.86% | PASS |

For page 8, an SVG-only bottom edge was fixed by extending an existing color rect 3 PDF pt beyond clipping boundary, not by masking legitimate graphics. No blanks, synthetic references, or candidate-as-reference were used.

### What **has not** been proven
- This proves **only SVG extraction of PDF graphics** (source-ratio, no text/photo/brand-logo). Does not prove DoCut Chromium/Brave browser reproduction, individual editability of all PDF paths, 16:9 transformation or real-world all-content similarity of 99%.
- The SVG path structure is rendered as an **atomic vector layer** in the editor and independent HTML export; regular DoCut text/chart overlays are editable above it. Individual PDF-origin SVG path editing remains a separate development gate.
- The metrics do not include original fonts, glyphs, photos, or complex bitmap effects. PDF pages with photos were intentionally not in this six-page set.
- Third-party copyrights and UBS trademarks remain theirs. No raw PDF, photos, paragraphs, brand logos or source images in distributed code.
- All 19 other companies remain UNVERIFIED.

### User-visible evidence
An isolated two-image screenshot comparison was deployed to a **non-production Vercel preview** for UBS 2025 PDF page 13. The live DoCut production project remains v0.34 unless a later verified release is explicitly promoted.

### Next gates
Chromium DOM/screenshot comparison with same geometry and mask, Safari/Brave parity, editable SVG path/group tooling, SVG in offline export and 16:9 adaptation tested separately.