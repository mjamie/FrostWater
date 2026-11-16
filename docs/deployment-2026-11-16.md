# Interactive experiences release — 16 November 2026

Approved runtime commit: `da724acdf5387249e6ff408ff13b7dc0e87d9a99`.

The owner authorized merging the interactive experiences and branded video controls into `main` and publishing the website. `main` was fast-forwarded from `1df0a0a` to the reviewed release. The feature branch was retained; the original checkout's uncommitted files were preserved. Subsequent release-documentation changes do not alter deployed runtime files.

## Review and deployment

- All 33 automated tests, 102 asset-reference checks, PHP syntax checks and whitespace checks passed. An independent read-only review found no merge blockers. No repository CI workflows or pending PR reviews were present. OSV returned no advisories for the vendored Three.js 0.187.0 version at release time.
- The signed-in Namecheap cPanel domain listing confirmed `/home/frospgdx/public_html` as the document root for frostwaterstudios.com.
- The three live files being replaced matched the static baseline after line-ending normalization and were backed up locally before replacement.
- Uploaded and extracted 20 assets, verified their public HTTP responses, then uploaded `index.html`. All 21 deployed files returned HTTP 200, matched the release manifest's SHA-256 hashes and had the expected MIME types.
- The previous architectural prototype assets were not needed for the published introduction. Existing media, contact endpoint, email, calendar, DNS and hosting configuration were not part of this upload.

## Live browser verification

The introduction renders with the electric drive closed on first load. Native scrolling advances through production and training, and scrolling upward returns to production. Space-key activation opens the training cabinet. The live video plays, pauses and seeks; its seekable interval is 0–90 seconds. The centre play button, FrostWater controls and removal of the caption strip are present. Desktop and 390x844 layouts were inspected with no horizontal overflow or observed console errors. Full-screen entry/exit was verified in local desktop Chrome using identical player files. Physical phone and Safari testing remains outstanding.

## Evidence and rollback

Local evidence is in ignored `dist/release-2026-11-16/`: the file manifest, before-release backups, live hash/MIME verification, advisory result, screenshots and the prepared upload archive. Automated-test output is in `dist/video-player/release-tests.log`.

`frostwater-rollback-before-da724ac.zip` contains only the previous `index.html`, `assets/css/site.css` and `assets/js/visuals.js`. Restoring these files restores the preceding homepage; the added assets can remain unused. The asset upload archive is retained outside the web root at `/home/frospgdx/frostwater-assets-da724ac.zip`. No rollback was needed.
