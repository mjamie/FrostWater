# FrostWater architectural introduction

Implemented in the canonical `public/` website on 11 November 2026. Updated on 12 November with the FrostWater blue blueprint, cube construction effects and one-gesture-per-stage interaction. This is a local implementation; it has not been published to Namecheap or the separate Sites copy.

## Composition

“Vision, made real.” introduces FrostWater's visualization work through an original three-storey pavilion, approximately 17.2 × 10 × 10.3 metres. Continuous slender columns, thin concrete slabs, recessed curtain walls, bronze sun screens, a timber terrace, glass balustrades, interior stairs and furniture establish an architectural scale. The upper storey is set back and capped with a shallow roof. This is an illustrative design, not a claimed built project or a construction-ready structural design.

The scene fills a transparent viewport on the existing navy background. Its only base is the building's own foundation. There is no viewer frame, display pedestal, orbit control, cursor parallax or separate camera cut. A shadow-only ground has no visible edge or horizon. The copy and model are framed separately on desktop and stacked on portrait screens.

The opening now shows a blue architectural plan instead of a solid slab. A procedural grid extends beyond the footprint and fades into the navy page. The concrete foundation fades in as assembly begins. Transparent outlined cells gather at the advancing edge of each component; a restrained blue highlight reveals its concrete, metal or glass. The cells disperse into the finished surface, and the ground grid clears by the completed reveal.

The effect uses the site's FrostWater blue, `#00aee9`. Cube edges use normal alpha blending to retain that blue over pale concrete. Their small halo is drawn in the same shader; there is no bloom postprocessing or additive white flare. The cells, material reveal and matching shadow mask all follow the same component phase, so scrolling backward reverses the construction exactly. There is no time-driven particle simulation.

Design direction: the existing navy and Geist identity, with restrained architectural composition. No direction draw or seed was needed for this single-section addition. The studio's practice of turning designs into explorable spaces becomes the scroll interaction. The visitor controls the construction by scrolling. No fabricated customer or project claims were added.

## Timing and scroll behavior

The introduction occupies one viewport. A scroll gesture, swipe, or down/Page Down/Space key press plays one construction stage, then holds indefinitely for reading. Up/Page Up/Shift-Space reverses one stage. The completed view takes one final gesture to reveal; the following downward gesture resumes ordinary page scrolling.

| Gesture | Destination | Animation duration |
| --- | --- | --- |
| Initial view | Blueprint ground and introductory copy | Holds |
| 1 | Foundation and continuous columns | 1.20 s |
| 2 | Floor bays and internal cores | 1.05 s |
| 3 | Glazing and mullions | 1.25 s |
| 4 | Screens, terrace, rails and details | 1.15 s |
| 5 | Roof bays | 1.00 s |
| 6 | Completed reveal and link into the studio film | 0.85 s |
| Next | Ordinary page scrolling | Native |

`architecture-timeline.js` maps normalized progress to deterministic component transforms. `architecture-steps.js` animates between the fully assembled stage endpoints, preserving the existing short staggered paths and camera arc. A stage has smooth acceleration and deceleration; component travel retains cubic ease-out without bounce. Reverse input traverses the same geometry.

Input is intercepted only while the interactive intro is at the top of the viewport. Trackpad/wheel events are grouped until 220 ms of quiet; momentum cannot advance again just because an animation finished. Events during a transition are consumed without queuing another stage. A touch gesture needs 42px of vertical travel, advances once, and releases at touch end. Pinch/zoom, horizontal gestures, editable fields, menu interactions, Home/End, links and scrollbar navigation retain their native behavior. Leaving via a link or scrollbar presents the completed view; returning to the top allows a new gesture to reverse it. No body overflow lock is used. The persistent Skip intro link leads directly to the studio film.

## Files and dependencies

- `public/index.html`: hero markup, static image and module inclusion.
- `public/assets/css/architecture.css`: viewport, typography, responsive compositions and reduced-motion behavior.
- `public/assets/js/architecture.js`: procedural model, materials, lighting, camera, lifecycle and render scheduling.
- `public/assets/js/architecture-effects.js`: blueprint grid, instanced outlined cells and material/shadow reveal shaders.
- `public/assets/js/architecture-loader.js`: progressive startup and module-download fallback.
- `public/assets/js/architecture-timeline.js`: stage boundaries and interpolation.
- `public/assets/js/architecture-steps.js`: bounded animation state, wheel grouping, touch and keyboard handling, native-scroll handoff.
- `public/assets/js/vendor/`: self-hosted Three.js 0.187.0, matching HDR loader and MIT license.
- `public/assets/media/architecture-building.webp`: transparent completed-building render, captured from this scene for the fallback.
- `public/assets/media/architecture-foundation.webp` and the `-tablet` / `-mobile` variants: full-viewport blueprint stills used while shaders prepare. A responsive picture selects the appropriate asset without a visible cropped frame.
- `public/assets/media/architecture-environment.hdr`: local 1K daylight environment.
- `scripts/architecture.test.mjs`: deterministic timeline checks.
- `scripts/architecture-steps.test.mjs`: stage holds, momentum tails, ignored input during transitions, reversal, captions, hidden-page pause and bypass checks.

The concrete texture is generated deterministically in code. The glass uses physical materials, environment reflections and modest transmission. Geometry is shared, frame bars are merged per window, device pixel ratio is capped, and shadow resolution is lower on phones. All materials and render passes are prepared behind the foundation still before the sequence starts, avoiding shader-compilation pauses during interaction. The scene renders during a requested animation, then stops for the reading pause. Hidden documents pause the animation clock. Ordinary offscreen scrolling does not render; viewport or motion-preference changes can request a one-off update. Geometry, textures and materials are disposed on a noncached page exit. WebGL context loss exposes the completed still, releases input immediately and restores the completed view when rendering recovers.

The daylight map is **Kloppenheim 06**, by **Greg Zaal**, from [Poly Haven](https://polyhaven.com/a/kloppenheim_06), distributed under [CC0](https://polyhaven.com/license). It is used only for lighting and reflections, never as a visible background. Credit is recorded here; CC0 does not require an on-page attribution. The fallback image and building geometry are original to this implementation. No stock building photograph is presented as FrostWater work.

All assets are served locally. The procedural lighting environment remains available if the HDR request fails. No external runtime request, build system or server change is required.

## Accessibility and fallback

Reduced motion presents the completed building with static introductory text and native scrolling. It disables gesture capture and timed camera/construction motion, and responds to preference changes without a reload. The canvas is decorative to assistive technology; a text description explains the interaction. A polite status region announces a stage only after it settles. Hidden copy and reveal links become inert so keyboard focus does not land on invisible controls. The existing skip-to-content link, navigation and contact form remain available, alongside Skip intro.

Without JavaScript or WebGL, the completed-building still and all ordinary links remain visible, without a long empty scroll section. The site's pre-existing no-JavaScript mobile navigation remains in document flow.

## Verification

Passed `node scripts/check.mjs` (85 local references), JavaScript syntax checks and all 17 tests in `node --test scripts/architecture.test.mjs scripts/architecture-steps.test.mjs`.

The gesture update was checked in the browser at 1440×900, 1024×1366, 390×844, 320×568, 900×560 and 568×320. Native wheel and keyboard input, a 90-event wheel burst spanning animation completion, reverse steps, completed-view scroll release, Skip intro, mobile navigation, direct services anchoring, held-key rejection, Home/End, dynamic reduced-motion changes, JavaScript-disabled fallback and WebGL context loss/recovery passed. The held scene issued zero draw calls while idle. Touch start/move/end and both swipe directions were checked with DOM touch-event simulation; native touch injection is unavailable in the in-app browser. Physical iOS/Android gesture feel and GPU performance remain unverified.

Earlier blueprint checks covered 1440×900, 768×1024, 390×844, 375×667 and 900×560 with normal motion, reduced motion, JavaScript disabled and WebGL unavailable, plus module-download failure. Direct URL anchors are reconciled after startup and font loading, provided the visitor has not begun interacting. These are baseline checks, not a claim that the former continuous-scroll interaction remains active.

The original reverse-scroll image comparison differed in only 34 antialiased pixels out of 1.296 million (mean channel difference below 0.001/255); the geometry and timeline remain deterministic. All 6,821 potential cells share one instanced mesh; only the current reveal band produces visible fragments. The earlier 60-frame desktop profile on an RTX 5070 Ti measured JavaScript frame callbacks at 3.9 ms median, 5.8 ms at the 95th percentile and 6.6 ms maximum. This is a shader/rendering baseline, not a fresh gesture-version or full GPU/display frame benchmark.

The HTML from the studio film through the footer was compared with the pre-edit snapshot and is byte-for-byte unchanged. `visuals.js` retains the existing card, industry and process interactions, with the old globe-related typing and full-page network loop removed.

Visual review: the initial screen gives the text and foundation distinct areas; assembly is legible; completed and reduced-motion views fit at the tested sizes. Two issues found during review—overly pale glazing and cramped short-screen framing—were corrected. The introductory section's source style lint passes. The full-site taste inspector still reports existing card styling, small labels and headings in untouched sections. Its canvas-overlap/empty-screen heuristics also misread the explicitly requested full-viewport sticky scene. Those results are not presented as a whole-site style pass.

Gesture-update evidence is in `dist/step-check/`, including browser state records, final caption compositions, phone layouts and the compact landscape refinement. Blueprint evidence is in `dist/blueprint-check/`; earlier baseline and inspector reports remain in `dist/architecture-check/`. `dist/` is excluded from source control and hosting packages.

### Final visual critique — introduction only

Seen in one second: a FrostWater blue blueprint, with light cells becoming a finished pavilion.

Idea: FrostWater's work turning designs into explorable spaces becomes a reversible construction sequence.

Live thing: one gesture assembles a stage, then waits for the visitor; reversing a gesture returns one stage.

Layout: introduction = text beside foundation; assembly = expanding building beside large stage headings; reveal = completed pavilion; handoff = existing studio film.

Scores: design 7.5 · usability 8 · creativity 7 · content 7.5 → overall 7.6. These are subjective scores for the requested introduction. The full-page inspector's existing style failures cap a whole-site score at 6; this task did not redesign those sections.

The original review corrected pale glazing, short-screen framing and shader compilation pauses. The blueprint update corrected overbright cube edges on concrete (normal alpha blending and a narrower active band), matched the shadow reveal to the visible geometry, and replaced the loading still with responsive blueprints that have no cropped boundary. The remaining limits are the deliberately simplified procedural interiors and untested physical mobile GPU performance.

## Caption layout and motion

Stage headings occupy a reserved middle-left column at 42–64px, with 17–20px supporting copy. The building retains its right-side framing throughout the final stages, leaving a clear gap beside the last captions. Portrait tablets and phones place the copy above the building; phone headings are 30–38px with 16px detail text. Very short landscape screens use a compact layout below the header. The final reveal uses the same hierarchy. Existing wording and the FrostWater palette are preserved.

The introductory copy remains fully visible until the first gesture. Each transition fades the outgoing text with a short drift, then slides in the destination text from the opposite side. Reverse input reverses the text direction. The destination heading reaches full opacity before the building settles, and remains there until another gesture. Text changes occur at fully faded boundaries. Transform and opacity are updated in the same requestAnimationFrame callback as the building; there is no autoplay or independent animation loop.

Render scheduling checks cached page bounds, avoiding the stale intersection notification that previously froze motion-preference recovery without adding a layout read to each frame. The camera and CSS use the same portrait-layout query, preventing a breakpoint mismatch.

Existing content from the studio film onward remains byte-for-byte unchanged. The superseded continuous-caption measurements are retained separately in `dist/caption-check/`.

The final design detector reported no findings in the changed stylesheet or JavaScript. Its 58 HTML findings match the existing page baseline exactly; this is not a whole-site style pass.

## Preview

Run `powershell -NoProfile -File scripts/start-dev.ps1` and open `http://127.0.0.1:8080/`. This preview disables PHP mail. Packaging remains the existing `scripts/package.ps1` workflow; deployment requires a separate instruction.
