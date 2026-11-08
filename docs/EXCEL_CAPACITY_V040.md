# DoCut v0.40 — 50MiB XLSX / 10,000 formulas capacity

## Change target
- Maximum compressed .xlsx file size: **50 MiB** (52,428,800 bytes), upgraded from 12 MiB (4.17×).
- Bounded uncompressed ZIP entries: 256 MiB total; 4,096 entries. Oversized/invalid/ZIP64, encrypted files remain rejected rather than partially imported.
- Up to 10,000 rows and 120 columns per worksheet; **600,000 parsed cells across the workbook**. No silent cropping.
- Up to **10,000 Excel formula cells across the workbook** (global cap). Workbook with 10,001 formulas is rejected explicitly.
- Source-linked bar/line charts: **360 points**, increased from 120 (3×). Donut remains 12 slices for readability.
- CRC-32 replaced by table-driven verification to limit CPU cost with large ZIP entries.

## Formula semantics / safety
- Excel cached cell values are **preserved** as the authority; no macro, external link, user script or arbitrary formula code is executed.
- When an XLSX formula has **no cached result**, DoCut evaluates a deterministic, bounded subset: numeric arithmetic, comparisons, percentages, cross-sheet cell/range references, SUM, AVERAGE, MIN, MAX, COUNT, COUNTA, COUNTIF, SUMIF, AVERAGEIF, IF, IFERROR, AND, OR, NOT, ROUND/ROUNDUP/ROUNDDOWN, ABS, INT, MOD, POWER, SQRT, LEN and CONCAT/CONCATENATE.
- If an uncached formula is unsupported, cyclic, or exceeds the per-formula/global reference budget, its value remains **missing** with an explicit warning, not fabricated as zero. Individual warning details are capped at 20, and totals are shown separately.
- Formula metadata includes count, cached, recalculated and unresolved. The original formula text is retained on each cell. Formula evaluation is **not** full Excel-compatible and does not update workbooks on disk.

## Capacity / compatibility / verification
- The 50MiB limit is on the XLSX file size, **not** a guarantee every 50MiB workbook will fit in the browser: the 256MiB decompression budget, 600k-cell cap, 10k-formula cap, available RAM and browser/device constraints still apply.
- Existing project-localStorage checkpoint limit (12MiB) is unchanged; a large imported snapshot may fail autosave. Use the native JSON export to retain large imported datasets until large-project persistence is upgraded. HTML exports retain only linked source ranges.
- Legacy CSV/TSV 1MiB upload limit is unchanged; this change targets XLSX.
- Unit verification covers formula lazy IF, cache precedence, selected functions, ten thousand formulas, 10,001 refusal, and 50MiB ingress validation. **Real 50MiB XLSX end-to-end browser and mobile memory QA remains a required acceptance gate.**
- Vercel production deployment/CI builds not automatically triggered by this change.
