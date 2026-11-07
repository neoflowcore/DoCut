# DoCut V0.16 effect library and motion semantics

Status: a **local implementation and code-level catalog**, not a claim that 89 reference JPG files were pixel-matched or licensed/repackaged. The previously discussed `효과 이펙트 색상배치.zip` images were **not available as raw image assets** in this resumed filesystem; names are product-level abstractions reconstructed from same-project conversation. Do not claim exact image-by-image attribution.

## Motion timeline

- Each editable element holds **0–3 ordered effects**. A preset replaces the current stack after the user clicks; reorder, delete, add, Undo are local and do not touch text, sources or verification fields.
- Each effect has `kind`, `duration` in milliseconds, `delay`, cubic-bezier `easing`, zero-to-four midpoint keyframes and custom start/end pose (`x,y,rotate,rotateX,rotateY,scale,opacity,blur,brightness`). The new X/Y rotations use a bounded CSS perspective rather than a 3D model or physics simulation.
- The first delayed appearance holds its starting pose. Subsequent motions compose relative to the start pose of the new effect, avoiding a repeated fade-out before a later entrance.
- The frame sampler is bounded to **360 segments**. Continuous infinite loops are not shipped. The animation is cancelled when the editor tab becomes hidden or its preview closes; the exported HTML also cancels when hidden. Reduced-motion bypasses animation.
- Text effects are optional **visual-only** transforms on the existing content: `word-rise` separates at most 60 displayed words; `typewriter`, directional wipes, and ink-reveal use clipping without deleting underlying rich text. For very long text the effect gracefully degrades to a whole-block reveal. KPI counter-up preserves the original displayed number (including decimal precision, commas and surrounding unit text), and chart effects animate SVG shape geometry. These are visual overlays; they never change source data.
- Page-level transitions: `none`, `fade`, `slide`, `zoom`, `wipe`, stored as `page.transition` in the native JSON schema 3 and exported into per-page standalone HTML. Unrecognized transitions are normalized to `fade`.

## Named motion categories

- Entrance: `fade-up`, `fade-down`, `drop`, `pop`, `spring`, `sweep`.
- Typography: `word-rise`, `typewriter`, `wipe-left`, `wipe-right`, `ink-reveal`, `marker`.
- KPI: `counter-up` on numeric KPI blocks (not arbitrary text values).
- Charts: `chart-rise` for bars, `chart-draw` for lines, `chart-ring` for donut, shape-style only; not dynamic data recalculation.
- Depth/camera: `flip-x`, `flip-y`, `depth-in`, `parallax`, `tilt`, `pan-left`.
- Emphasis/exit: `shimmer`, `breathe`, `shake-soft`, `exit-up`, `exit-down`.

The original motion kinds (`fade`, `rise`, `slide-left`, `slide-right`, `zoom`, `blur`, `rotate`, `pulse`, `glow`, `float`, `exit`, `none`) remain available. The type-scoped preset gallery offers 28 reusable stacks. Incompatible specialized effects are not offered to unrelated block kinds. A fallback selection remains available for legacy imported content without silently changing its kind.

## Design systems

Nine report color families: `wood`, `consulting`, `quarterly`, `ambient`, `editorial`, `slate`, `mint`, `bronze`, `cobalt`. These are design-system interpretations, **not a claim that nine reference images match their RGB values**. Charts support nine independent palettes (`default`, `ocean`, `forest`, `ember`, `mono`, `indigo`, `bronze`, `ambient`, `cobalt`) and SVG/PPTX shape colors are mapped consistently where supported.

Twelve structural layouts: `hero`, `two`, `three`, `chart`, `comparison`, `timeline`, `blank`, `metrics`, `split`, `quadrant`, `portrait`, `spotlight`. Layouts reposition existing unlocked elements when the preserve-content checkbox is enabled. If the page has more elements than template slots, bounded adaptive reflow avoids co-locating all overflow content. **This does not replace manual readability review**, and will not precisely reconstruct arbitrary CSS Grid/Flex layouts.

## Reversibility and exports

- JSON + HTML: preserves native page layout, source provenance, motion timing, type-aware motion, palette and page transitions. `tools/sync_export_runtime.py` copies the exact local Easing and VisualMotion runtimes into the single-file offline HTML exporter. It introduces **no CDN, remote JavaScript or font dependency**.
- PPTX: static editable shapes/text/tables. Chart colors/backgrounds carry over when supported; animated typography, CSS perspective and HTML page transitions **do not become PowerPoint animation timelines**. Microsoft PowerPoint physical open/edit/save remains untested.
- Third-party HTML: only safe static, approximate import. Nested positioned nodes and `data:image` CSS background images are converted where possible; external images/scripts and dynamic layout are not executed.
- Accessibility: editors honor `prefers-reduced-motion`; actual real-device readability, 89-reference visual fidelity, GPU load and assistive screen readers must be checked on physical devices in a later sign-off.

## Source-only QA boundary

Syntax and Node/Chromium tests are executed manually after grouped development. No GitHub Action workflow is introduced; no installer or ZIP artifact should be built by this project.
