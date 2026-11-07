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
## Chromium independent render and practical editor QA
- Official page 13 native PDF render vs DoCut bundled SVG rendered in headless Chromium 158, same 1263×893 pixels and text/logo masks: **97.4860% composite; 98.6070% structure; 92.8276% edges; 99.2532% color; 99.6891% lighting; FAIL 99% browser threshold**.
- Optical subpixel y shift -0.2px obtained 97.9018% but did not meet 99%; contrast and stroke changes tested and rejected. The product does not assert browser-level 99%.
- 6 true PDF source graphic pages passed PDF-native vector scoring, distinct from browser performance.
- PDF text bounds extracted geometrically, not paragraphs or numbers: 157 blank editable native DoCut text slots across six pages [13,24,28,26,26,40]. No UBS wordmarks, photographs or official body content bundled.
- Chromium verified six-page gallery insertion, source SVG visible, and report HTML export containing real SVG paths. The editor retains a separate drawing and text layer. Individual PDF-origin paths are not yet independently draggable.

## Official 6-page Chromium benchmark (actual, 2026-11-08)

| PDF 원본 페이지 | Chromium 종합 | 구조 | 경계 | 색상 | 음영 | 99% 게이트 |
|---|---:|---:|---:|---:|---:|---|
| 5 | 99.7642% | 99.6048% | 100% | 99.7622% | 99.7467% | 예비 통과 |
| 8 | 99.6741% | 99.3587% | 100% | 99.739% | 99.7584% | 예비 통과 |
| 11 | 93.3279% | 98.7009% | 75.5995% | 99.808% | 99.5379% | 미달 |
| 13 | 97.4860% | 98.607% | 92.8276% | 99.2532% | 99.6891% | 미달 |
| 16 | 98.5516% | 98.717% | 96.9371% | 99.2999% | 99.6089% | 미달 |
| 18 | 92.7984% | 97.9763% | 74.7708% | 99.6343% | 99.3699% | 미달 |

Actual output from the source SVG rendered in Chromium 158, pixel-matched to the independently downloaded original 2025 UBS PDF page. Graphic-only, text glyph/logo masks below 35%. **2/6 browser preliminary PASS, 4/6 FAIL.** Each failing page remains unfinished, even though all six extracted PDF vector master files cleared the PDF-native 99% score. The zero final-approved page count is intentional: no UBS design has full visual, editing and rights signoff.

Independent original-vs-Chromium screenshot page13: https://docut-studio-mnrdsn4e4-neoflowcores-projects.vercel.app/ ; editable development preview: https://docut-studio-lchbkcmic-neoflowcores-projects.vercel.app/ ; no production promotion performed. Tiny gray table strokes rendered with 1–7 RGB levels of discrepancy but caused large discontinuities in Canny edge F1; brute-force contrast and stroke saturation worsen results. Recalibration should be based on original source vector geometry, not synthetic overpainting or score-masking.
