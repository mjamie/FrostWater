# FrostWater interactive introduction

Interactive introduction on `codex/interactive-experiences`, developed in the isolated `FrostWater-experiences` worktree. Preview with `powershell -NoProfile -File scripts/start-dev.ps1 -Port 8083`. This branch remains separate from `main`; it has not been deployed.

## Purpose and composition

The user-approved message is: **We bring complex ideas to life through interactive 3D experiences.** Three distinct examples demonstrate detail, operation, and exploration. This expands the introduction beyond architecture while retaining the navy background, FrostWater blue (`#00aee9`), controlled digital assembly, realistic proportions, reflective materials and soft lighting.

The existing `styles.css`, `site.css` and earlier `architecture.css` remain the visual references. This introduction inherits Geist, the navy page background, light display type and underlined actions. Its chapter layout, subjects and motion timings are local to this surface; they do not establish a replacement design system.

- A solid, closed electric drive opens on the first scroll, revealing its copper windings, laminated rotor, bearings, fan, terminal enclosure and mounts. The upper half-shell lifts clear of the rotor, with the terminal enclosure above it.
- A production cell assembles around an articulated robot, roller conveyor, inspection gantry, guarded area and control station. Cartons move and the equipment demonstrates one short operating cycle.
- An equipment familiarisation scene introduces a workshop cabinet. **Open access panel** operates its hinge and exposes the internal components; the same button closes it.

These are original illustrative models, not client case studies, engineering specifications, live operational data, or a validated training procedure. Existing service and project copy outside the introduction is preserved.

## Interaction

The three text articles remain in normal document flow. A shared sticky canvas travels with them and releases naturally into the studio film. The sequence takes approximately 2.7 viewport heights on desktop and 2.9 on a typical portrait phone; compact screens can be taller to keep the content readable.

The only scroll listener is passive. No wheel, touch-move or keyboard input is intercepted. There is no gesture gate, artificial scroll position, animation queue, or wait before reversing direction. Scroll thresholds retarget the illustration from its current pose, including during an unfinished transition. Scrolling quickly can bypass a scene. Skip intro and the existing site navigation remain native anchors.

Assembly lasts 1.15 seconds and the camera settles over 1.5 seconds after a chapter change. The production demonstration starts 0.8 seconds after its chapter is selected and runs for 2.4 seconds. Geometry and text use short paths with decelerating easing. Cube outlines only appear at the active assembly front; they have a very small shader halo and no bloom pass. Rendering stops when motion has settled and while the introduction is offscreen. Tab visibility pauses the animation clock.

Reduced motion presents the completed model for each chapter immediately and opens/closes the inspection panel without interpolation. All text remains fully visible. If JavaScript or WebGL is unavailable, the readable introduction uses a completed product still. Context loss hides the inspection action until rendering returns.

## Files and assets

- `public/assets/js/experience.js`: rendering, lighting, responsive camera, native-scroll chapter selection, lifecycle and interaction.
- `experience-timeline.js`: interruptible, independently testable motion values and chapter timing.
- `experience-models.js`: original procedural geometry, materials and articulated behaviour. Repeated fixed surfaces are merged by assembly/material to reduce draw calls.
- `experience-effects.js`: antialiased blueprint grid, instanced outlined cubes, and matching surface/shadow reveal shaders.
- `public/assets/css/experience.css`: typography, document-flow layout, responsive composition and reduced-motion styles.
- `experience-loader.js`: progressive enhancement and initial-anchor reconciliation.
- `public/assets/media/experience-product-{desktop,mobile,tablet}.png`: local browser renders of the completed original model at 1440×900, 390×844 and 768×1024. No external imagery or generation credits were used. These show the real scene, with the text and header hidden only for capture.

Existing local Three.js and HDR dependencies are reused. Their original attribution remains in `public/assets/js/vendor/README.md` and the architectural introduction documentation. The older architectural modules remain as the previous experiment and are not imported by this version.

## Verification

Run `node --test scripts/experience.test.mjs` and `node scripts/check.mjs`.

Timeline tests cover reversal during assembly, fast chapter skipping, reduced motion, the operating sequence, background-tab timing, interruptible inspection, and native-input preservation. Browser evidence is saved under `dist/experience-check/` and is not packaged with the site.

Desktop (1440×900), portrait phone (390×844), tablet (768×1024), compact phone (320×568) and short landscape (568×320) layouts were inspected. Native wheel reversal, normal text movement, completed reduced-motion scenes and pointer/Space-key inspection activation were checked in the in-app browser. A real WebGL context loss displayed the fallback and preserved scrolling; restoring the context restored the scene and control. JavaScript-disabled capture confirms the completed fallback. Skip intro reached the film with its intended header clearance.

Twelve timeline tests and all 94 local reference checks pass. Tests now include the closed initial frame, expansion without partial visibility, closing again at the top, and reduced-motion opening. The earlier three-scene version issued 53 GL draw calls on a product redraw and zero calls during 40 idle frames; that measurement predates the split casing and is not a fresh benchmark. The mechanical design detector found the same 58 pre-existing HTML findings as the prior page and no new findings in the introduction files. The studio-film section and everything after it match the original workspace byte-for-byte.

### Closed product refinement

The first frame uses complete geometry and a closed casing, with no construction cells. Visibility and expansion have separate motion values: the first scroll opens the product over 1.1 seconds, and returning to the top closes it. The upper half-shell rises 1.25 model units, the rotor rises 0.28, and the terminal enclosure rises 1.6. The camera makes room for the taller exploded view. The three fallback images were recaptured with the product closed, so loading and JavaScript-disabled views match the opening state. Cube assembly remains on transitions between scenes.

Refinement captures are under `dist/generator-check/`: closed and expanded views at 1440×900, 390×844 and the actual 688×834 browser viewport; tablet opening and closing with reduced motion at 768×1024; the following production scene; and the JavaScript-disabled fallback. Reduced-motion engagement changes explicitly request a redraw even when the animation is already idle. The preview was restored to normal motion at the top of the page.

Physical mobile hardware and touch gestures have not been tested; the implementation uses native scrolling without custom touch handlers. The original workspace remains on `main`; the interactive-experiences branch is unmerged. Local recordings and verification captures under `dist/` are excluded from the source commit.
