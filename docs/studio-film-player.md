# Studio film player

The studio film has a centred play/replay button and FrostWater blue controls overlaid inside the video. The separate name-and-duration caption beneath the player has been removed. The approved poster and 90-second footage are unchanged.

`public/assets/js/film-player.js` enhances the existing native video element. Playback, seeking, mute, volume and full-screen controls follow the media element's actual state. Buttons and sliders use native keyboard behaviour, accessible labels, visible focus and 44-pixel interaction targets. The centre button hands keyboard focus to pause when playback begins. The volume slider is hidden on narrow screens; mute remains available.

The source retains `controls`, `playsinline` and `preload="none"`. Custom controls are hidden until the script initialises, so the browser's native player remains available without JavaScript. Playback does not start automatically. Errors produce a recoverable status message. No external player dependency or media service is added.

## Local verification — 2026-11-16

- Centre play, pause, complete playback and replay verified against the actual film.
- Space-key playback, focus handoff, seek-slider keyboard input, mute and volume verified.
- Desktop 1440x900, phone 390x844 and compact phone 320x568 checked. No horizontal overflow; compact controls remain inside the player. Centre button alignment is exact.
- JavaScript-disabled reload retains native controls and hides the custom controls.
- The in-app browser rejects full-screen requests; the error message was verified. Actual full-screen presentation and physical iOS/Safari remain unverified.
- JavaScript syntax, local asset references and whitespace checks pass.

The basic PHP development server does not support byte-range requests and reports an empty seekable interval for this MP4. Seeking was verified using a local range-capable PHP router, where the seekable interval is the full 0–90 seconds. The router and desktop/mobile screenshots are under ignored `dist/video-player/`, not part of the published source. A media-serving host must support byte ranges for normal seeking.

This change is on `codex/interactive-experiences`. It does not merge into `main` or deploy the website.
