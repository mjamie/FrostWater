# FrostWater Studios Website

The current website is plain HTML, CSS, JavaScript and PHP. The source was consolidated from the `LandingPage` project after matching its public pages and scripts against frostwaterstudios.com. This folder is now the working project for the website.

## Local preview

Run from this folder:

```powershell
powershell -NoProfile -File scripts/start-dev.ps1
```

Open http://127.0.0.1:8080. Use `-Port 8081` if needed. Requires PHP 8.1 or later; there is no Node server or npm installation step. The preview serves only `public/`, binds to the local computer, and disables email sending. A valid contact submission will report a sending failure during preview. Press Ctrl+C to stop the server.

## Files

- `public/index.html`: home page and contact form.
- `public/immersive-visualization.html` and `public/vr-training-simulations.html`: concept/demo pages.
- `public/assets/`: current styles, scripts, fonts, branding and example media.
- `public/contact.php`: existing contact endpoint for hello@frostwaterstudios.com.
- `public/includes/contact-email.php`: HTML/plain-text email formatting.
- `scripts/check.mjs`: local asset/reference validation; requires Node.
- `scripts/package.ps1`: creates a Namecheap upload ZIP after validation.
- `scripts/start-dev.ps1`: local PHP preview.
- `AUDIT-2026-10-02.md`: audit snapshot and outstanding work.

The homepage now introduces interactive 3D experiences through three connected, realistic studies: a closed electric drive that expands on scroll, an operating production cell, and equipment with an interactive inspection panel. FrostWater blue grid lines and outlined cubes connect the scenes. Native scrolling cues short, interruptible animations; all text remains in the page flow and the final scene scrolls into the existing studio film. Reduced motion displays completed scenes without animation. A rendered product still covers unavailable JavaScript or WebGL. See `docs/interactive-introduction.md` for implementation and verification.

This experiment lives in the isolated `FrostWater-experiences` worktree on `codex/interactive-experiences`. The original `FrostWater` folder remains unchanged. The local experiment preview uses port 8083: `powershell -NoProfile -File scripts/start-dev.ps1 -Port 8083`.

## Check and package

```powershell
node scripts/check.mjs
node --test scripts/experience.test.mjs
powershell -NoProfile -File scripts/package.ps1
```

The generated `dist/frostwater-namecheap.zip` contains the contents of `public/` directly at its root, including the PHP endpoint and template. Upload these contents into the domain's confirmed document root. Do not upload this repository root. Packaging does not deploy anything.

The missing contact handler was restored on Namecheap on 2 October 2026, and one approved live-form test was confirmed in the hello inbox. The FTP password change was confirmed by the user. See `docs/hosting-check-2026-10-02.md` for evidence and remaining audit tasks. The old FTP uploader is no longer part of this working project.

## Cleanup backup — 2 October 2026

The previous Next.js application, dependencies, generated exports, duplicate static folders, upload ZIP and deployment configuration were moved to:

`C:\Users\USER\Documents\Apps\FrostWater-cleanup-backup-20261002-191310\legacy-project`

Unused assets from the newer site are in the backup's `unused-live-assets` folder. Its `cleanup-manifest.json` records the moved legacy files. This backup contains sensitive local configuration: keep it private and outside the hosted website.

The existing Git history and audit were preserved in this project. The separate `LandingPage` directory was left intact as the source snapshot. No commit, push, deployment, credential rotation, or live email test was performed during cleanup. The exposed credential identified in the audit still requires rotation.
