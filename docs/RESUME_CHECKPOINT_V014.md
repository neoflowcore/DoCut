# DoCut V0.14 source resume checkpoint

**Project:** `neoflowcore/DoCut`; default intended `main`. This checkpoint is only for the DoCut project. Do not substitute ConceptKnot, NightNova or another repository.

**Source root:** `/mnt/data/docut-dev` when available. The local V0.13 reconstructed commit `3f10ddc` is the parent; inspect `git log -1 --oneline` to recover the newer V0.14 commit. A newly started environment may lack the container; first search same-project current conversation source files and the DoCut project Library for this checkpoint and the **source transfer TXT**, then recover. Do not claim the repo uploaded unless the remote branch is independently visible.

**Source files:** `index.html`, `assets/*.js`, `assets/styles.css`, `tests/*.test.cjs`, `tests/browser_*.py`, `tests/pptx_memory_qa.py`, `README.md`, `docs/` and `package.json`. No automatic GitHub workflows or package installation artifact.

**Manual-only regression:** `npm run check:syntax && npm test && python tests/browser_recovery.py && python tests/browser_extended.py && python tests/browser_v014.py && python tests/pptx_memory_qa.py`.

**Implemented V0.14:** start/end pose UI, 7-channel midpoint editing, 60fps-target motion sampling with cap, native table cell editor and spreadsheet paste, multi-object clipboard, group-preserving snapping, image-file import, safe HTML image/rich-text recovery, PPTX multi-slide image uniqueness/master logo/partial text and graph polarity, source audit, mobile inspector close, safe recovery from corrupt local backup data, 50-page stress tests.

**Known limits:** No exact arbitrary HTML/JS reverse-conversion. PPTX charts are shapes, not Excel-linked. WebP image PPTX remains placeholder. Windows/Android/PowerPoint physical verification not performed. Design reference alignment unmeasured. The remote GitHub repository was last seen empty; connector Git write returned HTTP 403 earlier.

**Acceptance accounting:** use *only* the fixed 53-item reconstruction checklist: 42/53=79.2%, see `ACCEPTANCE_RECOVERY_V014.md`. Do not present this as overall product completion or design matching. User deferred hands-on verification until more development is done.
