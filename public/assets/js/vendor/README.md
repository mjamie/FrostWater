# Three.js runtime

- Three.js **0.187.0**, MIT; see `THREE-LICENSE.txt`.
- `three.min.js` bundles the published `build/three.module.js` and `build/three.core.js` as a local ES module.
- Built with `esbuild@0.25.12`, using `--bundle --format=esm --minify --target=es2022`.
- `HDRLoader.js` is the matching official addon. Its sole import has been changed from `three` to `./three.min.js` for the buildless site.
- Source package: https://registry.npmjs.org/three/-/three-0.187.0.tgz
- Upstream: https://github.com/mrdoob/three.js

No runtime CDN or package installation is required. Keep the version, addon and license together when updating.
