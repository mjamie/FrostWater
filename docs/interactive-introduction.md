# FrostWater interactive introduction

The interactive introduction lives on `codex/interactive-experiences` in the separate `FrostWater-experiences` worktree. It is not merged into `main` or deployed. Preview with `powershell -NoProfile -File scripts/start-dev.ps1 -Port 8083`.

## Visual direction

**We bring complex ideas to life through interactive 3D experiences.**

The three models follow the [approved concept board](interactive-model-reference.png), generated with the built-in image tool on 2026-11-16. The board is an art reference; the website renders original Three.js geometry with separate moving components. It does not play a video or display the board as its interactive scene.

The existing navy background, Geist typography, FrostWater blue (`#00aee9`), flow of text and native scrolling remain. The scene spans the page without a card, display base or viewer controls. Studio reflections and soft directional lighting reveal edge bevels, metal, copper and painted surfaces. A faint blueprint grid and transparent outlined construction cubes retain the original assembly language.

- **Understand:** the generator starts fully solid and closed. Its finned upper casing, terminal enclosure and bearing plates separate on the first scroll, exposing layered copper windings and a machined rotor. Real geometry includes chamfers, mounting ribs, fasteners, gasket rings, shaft details and a rear fan grille. Returning to the top closes it.
- **See it work:** a production cell builds around an articulated robot, stainless roller conveyor, inspection sensor, three mesh guarding bays and an operator station. Cable runs follow the robot joints. Cartons and equipment demonstrate one short cycle.
- **Learn by doing:** a folded-metal service cabinet contains two detailed filter modules with brackets, flanges, fittings, valves and routed pipes. A stainless bench, tools, storage tray and task light complete the workstation. **Open access panel** operates the real door hinge. Subtle blue corner brackets identify one internal module; the same control closes the door.

These are illustrative studies, not engineering specifications, validated training procedures or client case studies. The models remain editable in their scene-builder modules.

## Interaction and accessibility

The three text articles remain in ordinary document flow. One sticky canvas releases naturally into the studio film. A continuous camera journey follows chapter changes and fits desktop, tablet, phone and compact landscape layouts.

The scroll listener is passive. No wheel, touch-move or keyboard input is intercepted. There is no gesture gate or animation queue. Scroll thresholds retarget the illustration from its current pose, even during an unfinished transition. A fast scroll can bypass an intermediate scene. Skip intro and site navigation use native anchors.

Assembly lasts 1.15 seconds and the camera settles over 1.5 seconds. The production demonstration begins 0.8 seconds after its chapter is selected and runs for 2.4 seconds. Cube outlines appear only along the assembly front, with a restrained shader halo and no bloom pass. The opening product has no construction cubes. Native scroll requests a redraw even for a settled pose so the canvas can expose fresh pixels while moving through its sticky boundary. Rendering otherwise stops when idle and offscreen; background tabs pause the animation clock.

Reduced motion presents completed scenes and inspection changes immediately. The generator still starts closed. All text remains visible. If JavaScript or WebGL is unavailable, a real browser render of the closed generator provides the fallback. Graphics context loss hides the inspection button and shows the still; recovery rebuilds the studio environment and restores the scene and button.

## Source and assets

- `public/assets/js/experience.js`: renderer, studio lighting, responsive camera, lifecycle, native-scroll chapter selection and inspection control.
- `experience-models.js`: model assembly, material batching and repeatable poses.
- `experience-geometry.js`: shared beveled shapes, lathed profiles, hardware, labels and procedural surface textures. Repeated shapes reuse geometry.
- `experience-generator.js`, `experience-production.js`, `experience-training.js`: the three independent model builders and their articulated parts.
- `experience-effects.js`: blueprint grid, instanced outlined cubes and matching surface/shadow reveal shaders.
- `experience-timeline.js`: interruptible motion values and chapter timing.
- `experience-loader.js`: progressive loading and initial anchor reconciliation.
- `public/assets/css/experience.css`: existing responsive typography and text composition.
- `public/assets/media/experience-product-{desktop,mobile,tablet}.png`: regenerated renders of the closed model at 1440x900, 390x844 and 768x1024. Text and navigation were hidden only for capture.

Three.js is the existing local vendored dependency. The introduction now uses a procedural studio reflection environment instead of loading the architectural HDR. The older architectural modules and their attribution remain for the previous version; they are not imported by this introduction. No new external runtime dependency, model service or Higgsfield job was used.

## Verification — 2026-11-16

Run:

```sh
node --test scripts/experience.test.mjs scripts/experience-models.test.mjs scripts/architecture.test.mjs scripts/architecture-steps.test.mjs
node scripts/check.mjs
```

All 33 tests and 101 local reference checks pass. The new geometry checks cover finite vertices and UVs, unit normals, scene budgets, exploded clearances, repeatable/reversed poses and independent cabinet hinges. Existing tests cover native input preservation, first-frame closure, interruptible transitions, reduced motion, timing and scene skipping.

The fixed geometry is batched by material inside each animated group:

| Model | Triangles | Material batches before effects |
|---|---:|---:|
| Generator | 75,378 | 32 |
| Production cell | 56,978 | 77 |
| Training workstation | 50,022 | 38 |

Desktop (1440x900), phone (390x844), tablet (768x1024), compact phone (320x568) and short landscape (568x320) were inspected in the in-app browser. Native wheel reversal immediately moved from the training chapter back toward production. Pointer and Space-key activation opened/closed the access panel. Reduced-motion scenes settled immediately. Context loss and restoration both worked, including restored studio reflections. The JavaScript-disabled fallback was inspected separately.

A local desktop transition probe recorded a 5.6 ms median animation-frame interval, 5.7 ms p95 and 236 maximum GL draw calls per frame during the two-scene overlap. The last 40 idle frames issued zero GL draws. This is a measurement of this local browser and hardware, not a mobile performance guarantee. Physical phones and touch gestures have not been tested.

**Visual QA: SHIP WITH NOTES.** The three-quarter views follow the approved palette, subjects, proportions and material direction; all models retain their intended movement. Compact framing was adjusted to clear the scroll hint and navigation. The result is a real-time interpretation of the concept rather than an offline render. Evidence is under `dist/model-refinement/` and is excluded from the source package.

Changes to the homepage markup are limited to introduction asset versions. The studio-film section and all following content remain unchanged. The feature branch stays separate from `main`.
