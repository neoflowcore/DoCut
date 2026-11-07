# DoCut Studio V0.15.0 development receipt — 2026-11-03

> Source status: LOCAL DEVELOPMENT, not released or physically verified.
> Repository: `neoflowcore/DoCut`, intended default branch `main`.
> Lineage: reconstructed V0.13 and V0.14 local source, **not** original V0.12 Git history.

## Scope delivered in the V0.15 development batch

1. **AI review gate (offline).** Accepts a DoCut schema-3 JSON proposal, a single Markdown fenced JSON response, or a `project`/`docutProject`/`document` wrapper. Rejects mixed code or non-JSON; no service/API calls. Shows changed pages and changed numeric terms; defaults to zero checked changes and permits separate page and shared-setting approvals. Existing unchanged pages, IDs and metadata remain stable; newly supplied verified=true is not trusted. A page partially renamed by AI is flagged as ambiguous deletion plus insertion and must be selected separately. Approval is undoable.
2. **Source provenance.** Native elements have `source`, `asOfDate`, `unit`, `evidence` and `verified`. These are editable in Inspector and searchable/auditable. Changes to source, evidence, unit, date or contents revoke previous verification. An AI proposal omitting previously recorded provenance cannot silently clear it; it can propose source changes, which require user review.
3. **CSV/TSV review gate.** Local file preview displays filename, affected element, row/column counts and up to eight rows. Cancel does not mutate the report, apply requires explicit user click and creates Undo history. Invalid columns, oversized input and malformed numeric values fail before mutation.
4. **Silent-data-loss guards.** Native projects reject >50 pages, >120 elements/page, >3 effects/block, >4 keyframes/effect, >60 formatting runs/block, >1000 chars/rich run, >12000 chars/text block, >12 chart points, values outside -1e9..1e9, negative donut data, >24x10 table, oversized source/evidence/units, and malformed chart counts, duplicate native IDs or invalid basis dates and malformed page/element schemas rather than discarding or silently changing them. Manual chart/series/table Inspector input also rejects overflow or invalid entries without altering previous data. Third-party HTML *approximate static import* displays explicit warnings for known truncation/unsupported features, rather than promising exact restoration.
5. **Independent HTML evidence panel and motion parity.** Standalone HTML includes a per-page, inert text-only source/date/unit/evidence drawer when metadata is present, with a keyboard close path and no remote source fetching. The standalone easing runtime matches the editor's source file and uses a bounded frame budget. Print layout supplies 16:9 page size. HTML-to-HTML native metadata round-trip is preserved. Extra unit labels are visible on charts.
6. **PPTX descriptive metadata.** OOXML native editable shape descriptions preserve supported source/date/unit/evidence and verification status for Office accessibility inspection. This is not an Excel-linked native chart or an HTML animation transfer. An in-memory PowerPoint parser check cannot certify Microsoft Office behavior.
7. **Usability and security.** Review dialogs adapt to mobile widths; imported HTML scripts/remote passive assets remain non-executing. Source metadata is HTML-escaped, and source drawer strings are added with `textContent`. Browser storage failures remain non-destructive.

## Automation verification (code & headless only)

The final source checks are run in one grouped verification after feature edits:

- `npm run check:syntax` for local JS files.
- `npm test` for the complete Node model/export/security suite.
- `python tests/browser_recovery.py`, `python tests/browser_extended.py`, `python tests/browser_v014.py`, `python tests/browser_v015.py` for local Chromium interactions.
- `python tests/pptx_memory_qa.py` for OOXML in-memory parsing (does not save PPTX or ZIP).
- `git diff --check` and local Git provenance review.

**Final grouped local run, 2026-11-03 (UTC):** JavaScript syntax **PASS**; Node **90/90 PASS**; Chromium V0.13 basic **14/14**, extended **11/11**, V0.14 **12/12**, V0.15 **15/15** (**52/52 browser scenarios PASS**); in-memory PPTX **3-slide parse PASS**; `git diff --check` **PASS**. The local source commit is recorded by `git log -1 --oneline` and the source-transfer patch receipt; this does not certify GitHub upload. **Do not infer hardware compatibility from headless Chromium.**

## Fixed 53-point acceptance matrix (unchanged measurement scope)

| Phase | Verified checked criteria | Fixed-scope pass % |
| --- | --- | ---: |
| P0 — source recovery / remote state | 4 / 6 | 66.7% |
| P1 — editing / responsive view | 9 / 10 | 90.0% |
| P2 — motion / time controls | 9 / 10 | 90.0% |
| P3 — narrative / presentation | 7 / 8 | 87.5% |
| P4 — import / export | 9 / 11 | 81.8% |
| P5 — source QA / physical / remote | 4 / 8 | 50.0% |
| **Total (fixed-scope checks only)** | **42 / 53** | **79.2%** |

This is **not** overall product completion, release readiness, or a design-reference match percentage. The complete V1.0 requirement universe is not closed; a signed-off pixel reference and tolerance are not available, so those percentages are **not measured**. New V0.15 criteria are described separately, not added as ad hoc points to change this denominator.

## Remaining dependencies and limits

- GitHub App write access for `neoflowcore/DoCut`: connected GitHub shows an empty repository, and the V0.15 session's blob-write probe returned **HTTP 403 Resource not accessible by integration**. No remote branch or source upload has been confirmed. Keep the local patch/source transfer independently recoverable.
- Arbitrary HTML+Grid/Flex+dynamic JS cannot be transformed to pixel-perfect editable DoCut; source conversion shows approximation and known loss warnings.
- Microsoft PowerPoint desktop opening/editing/resaving, Windows Brave, Android Brave touch/IME, mobile GPU performance, real printer margins, font licensing/appearance and canonical design match **not physically checked**.
- No `.github/workflows` additions; no automatic builds; no EXE/APK/ZIP/installer/release artifacts; no GitHub Actions triggered.
- Until the user actually asks for hands-on verification, preserve the detailed checklist in `docs/MANUAL_QA.md` but do not request the user to perform it.
