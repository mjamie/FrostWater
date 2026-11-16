import * as THREE from './vendor/three.min.js';
import { HDRLoader } from './vendor/HDRLoader.js';
import { createModels } from './experience-models.js?v=2';
import { createEffects } from './experience-effects.js?v=2';
import { ExperienceJourney, chapterAt, range, ease, smooth } from './experience-timeline.js?v=2';

const root = document.querySelector('.experience-intro');
if (root) start(root).catch(error => {
  root.classList.remove('is-enhanced');
  root.dataset.renderState = 'fallback';
  root.dispatchEvent(new Event('experience:settled'));
  console.warn('The introduction is using its still image.', error);
});

async function start(root) {
  const stage = root.querySelector('.experience-stage');
  const canvas = root.querySelector('canvas');
  const chapters = [...root.querySelectorAll('.experience-chapter')];
  const copies = chapters.map(chapter => chapter.querySelector('.experience-copy'));
  const inspect = root.querySelector('.experience-inspect');
  const feedback = root.querySelector('.experience-feedback');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const stacked = matchMedia('(max-width: 1023px) and (max-aspect-ratio: 6/5)');
  const keep = resource => { resources.add(resource); return resource; };
  const resources = new Set();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 150);
  scene.add(new THREE.HemisphereLight('#d7e6f0', '#26323b', .75));
  const key = new THREE.DirectionalLight('#ffefdc', 2.6);
  key.position.set(-6, 12, 9); key.target.position.set(0, 1, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(1536, 1536);
  Object.assign(key.shadow.camera, { left: -8, right: 8, top: 7, bottom: -6, near: .5, far: 35 });
  key.shadow.normalBias = .018; key.shadow.bias = -.0001;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight('#afd7f4', .7); fill.position.set(6, 7, -5); scene.add(fill);
  const rim = new THREE.DirectionalLight('#b8c8dc', .6); rim.position.set(-4, 3, -6); scene.add(rim);

  // Broad photographic reflections, without a visible backdrop or frame.
  const studio = new THREE.Scene(); studio.background = new THREE.Color('#718494');
  const panelGeometry = new THREE.PlaneGeometry(1, 1);
  const panelMaterials = [];
  for (const [position, size, color, power] of [
    [[-8, 8, 7], [8, 10], '#f6efe2', 3], [[7, 6, -6], [5, 10], '#bed9ee', 1.8],
    [[0, 12, 0], [14, 9], '#f3f0e8', 2], [[0, -7, 5], [24, 18], '#101f2d', .4],
    [[8, 1, 12], [2, 12], '#cddce3', 1.6],
  ]) {
    const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }); material.color.multiplyScalar(power); panelMaterials.push(material);
    const panel = new THREE.Mesh(panelGeometry, material); panel.position.set(...position); panel.scale.set(...size, 1); panel.lookAt(0, 1, 0); studio.add(panel);
  }
  const generator = new THREE.PMREMGenerator(renderer);
  const studioMap = keep(generator.fromScene(studio, .04));
  scene.environment = studioMap.texture; scene.environmentIntensity = .8;
  generator.dispose(); panelGeometry.dispose(); panelMaterials.forEach(material => material.dispose());
  const models = createModels({ scene, keep });
  const effects = createEffects({ scene, ...models, keep });
  const journey = new ExperienceJourney();
  let frame = 0, width = 1, height = 1, top = 0, bottom = 1;
  let disposed = false, lost = false, dirty = true, hiddenAt = 0, wasMoving = false;
  let thresholds = [0, 1, 2], copyBounds = [], lastChapter = -1;
  let daylight = null;
  const target = new THREE.Vector3();

  function requestPaint() {
    if (!frame && !disposed && !lost && !document.hidden) frame = requestAnimationFrame(paint);
  }
  function paint(now = performance.now()) {
    frame = 0;
    if (disposed || lost || document.hidden) return;
    if (scrollY > bottom + 100 || scrollY + innerHeight < top - 100) return;
    const chapter = chapterAt(scrollY, thresholds);
    const engaged = scrollY > top + 18;
    // Reduced motion changes the pose instantly, so it still needs one redraw.
    if (journey.started !== engaged) dirty = true;
    journey.select(chapter, now, { reduced: motion.matches, engaged });
    const state = journey.sample(now);
    if (chapter !== lastChapter) {
      lastChapter = chapter;
      dirty = true;
      root.dataset.chapter = ['idea', 'system', 'experience'][chapter];
    }
    // Cache all geometry reads in measure(); frames only write transforms.
    copies.forEach((copy, index) => {
      const rect = copyBounds[index];
      const y = rect.top - scrollY;
      const incoming = index === 0 ? 1 : ease(range(height - y, height * .22, height * .65));
      const outgoing = smooth(range(y + rect.height, height * .06, height * .2));
      const focused = copy.contains(document.activeElement);
      const opacity = motion.matches || focused ? 1 : incoming * outgoing;
      const shift = motion.matches || focused ? 0 : (1 - incoming) * (index === 1 ? 50 : -50) - (1 - outgoing) * 26;
      copy.style.opacity = String(opacity);
      copy.style.transform = `translate3d(${shift}px, 0, 0)`;
    });
    effects.pose(state.weights, motion.matches);
    models.update(state);
    effects.update(state.camera + state.weights[chapter] * .3);
    const aspect = width / height;
    const narrow = stacked.matches;
    const opening = state.expansion * state.weights[0];
    const vertical = (narrow ? Math.max(12, 10.8 / aspect) : Math.max(10, 16.8 / aspect)) + opening * 1.75;
    const radius = vertical / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    const angle = .63 + Math.sin(state.camera * 1.7) * .1 - state.camera * .035;
    const elevation = .30 + state.camera * .025;
    const centerX = narrow ? .5 : .715;
    const centerY = narrow ? (height < 700 ? .78 : .68) : .56;
    target.set(0, 1.5 + state.camera * .05 + opening * .5, 0);
    camera.position.set(Math.sin(angle) * Math.cos(elevation) * radius, target.y + Math.sin(elevation) * radius, Math.cos(angle) * Math.cos(elevation) * radius);
    camera.lookAt(target);
    camera.setViewOffset(width, height, (.5 - centerX) * width, (.5 - centerY) * height, width, height);
    if (state.moving || wasMoving || dirty) {
      renderer.shadowMap.needsUpdate = true;
      renderer.render(scene, camera);
      dirty = false;
    }
    wasMoving = state.moving;
    root.dataset.renderState = 'ready';
    root.dataset.transition = state.moving ? 'running' : 'idle';
    root.dataset.weights = state.weights.map(value => value.toFixed(3)).join(',');
    root.dataset.expansion = state.expansion.toFixed(3);
    if (state.moving) requestPaint();
  }
  function measure() {
    if (disposed) return;
    width = stage.clientWidth; height = stage.clientHeight;
    top = root.getBoundingClientRect().top + scrollY; bottom = top + root.offsetHeight;
    copyBounds = copies.map(copy => { const rect = copy.getBoundingClientRect(); return { top: rect.top + scrollY, height: rect.height }; });
    thresholds = copyBounds.map((rect, index) => index === 0 ? top : rect.top - height * (stacked.matches ? .42 : .62));
    camera.aspect = width / height; camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, width < 600 ? 1.5 : 1.75));
    renderer.setSize(width, height, false);
    dirty = true; requestPaint();
  }
  function resetMotion() {
    const now = performance.now();
    journey.select(chapterAt(scrollY, thresholds), now, { reduced: motion.matches, engaged: scrollY > top + 18 });
    journey.inspect(inspect.getAttribute('aria-pressed') === 'true', now, motion.matches);
    dirty = true; measure();
  }
  function visibility() {
    if (document.hidden) { hiddenAt = performance.now(); cancelAnimationFrame(frame); frame = 0; }
    else { if (hiddenAt) journey.shiftClock(performance.now() - hiddenAt); hiddenAt = 0; dirty = true; requestPaint(); }
  }
  function inspectEquipment() {
    const open = inspect.getAttribute('aria-pressed') !== 'true';
    inspect.setAttribute('aria-pressed', String(open));
    inspect.querySelector('span').textContent = open ? 'Close access panel' : 'Open access panel';
    feedback.textContent = open ? 'Inside the equipment. A different way to understand it.' : '';
    journey.inspect(open, performance.now(), motion.matches);
    dirty = true; requestPaint();
  }
  function contextLost(event) {
    event.preventDefault(); lost = true; cancelAnimationFrame(frame); frame = 0;
    root.dataset.renderState = 'fallback'; inspect.hidden = true;
    copies.forEach(copy => { copy.style.opacity = '1'; copy.style.transform = ''; });
  }
  function contextRestored() {
    lost = false; dirty = true;
    if (daylight) applyDaylight(daylight);
    inspect.hidden = false; measure();
  }
  function applyDaylight(texture) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = keep(pmrem.fromEquirectangular(texture));
    scene.environment = environment.texture; scene.environmentIntensity = .7;
    scene.environmentRotation.y = 1.8; pmrem.dispose(); dirty = true; requestPaint();
  }

  camera.position.set(10, 7, 14); camera.lookAt(0, 1, 0);
  camera.aspect = stage.clientWidth / stage.clientHeight; camera.updateProjectionMatrix();
  renderer.setSize(stage.clientWidth, stage.clientHeight, false);
  await renderer.compileAsync(scene, camera);
  root.classList.add('is-enhanced'); inspect.hidden = false;
  const resize = new ResizeObserver(measure); resize.observe(stage); copies.forEach(copy => resize.observe(copy));
  const intersection = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { dirty = true; requestPaint(); } }, { rootMargin: '100px' });
  intersection.observe(root);
  addEventListener('scroll', requestPaint, { passive: true });
  addEventListener('resize', measure, { passive: true });
  addEventListener('pageshow', measure);
  root.addEventListener('focusin', requestPaint);
  document.addEventListener('visibilitychange', visibility);
  motion.addEventListener('change', resetMotion);
  inspect.addEventListener('click', inspectEquipment);
  canvas.addEventListener('webglcontextlost', contextLost);
  canvas.addEventListener('webglcontextrestored', contextRestored);
  measure();
  if (motion.matches) journey.select(chapterAt(scrollY, thresholds), performance.now(), { reduced: true, engaged: scrollY > top + 18 });
  cancelAnimationFrame(frame); paint();
  root.dispatchEvent(new Event('experience:settled'));
  document.fonts.ready.then(measure);
  new HDRLoader().load(new URL('../media/architecture-environment.hdr', import.meta.url).href, texture => {
    if (disposed) { texture.dispose(); return; }
    daylight = keep(texture); if (!lost) applyDaylight(texture);
  }, undefined, () => { /* The local studio environment remains available. */ });
  addEventListener('pagehide', event => {
    if (event.persisted) return;
    disposed = true; cancelAnimationFrame(frame); resize.disconnect(); intersection.disconnect();
    removeEventListener('scroll', requestPaint); removeEventListener('resize', measure); removeEventListener('pageshow', measure);
    root.removeEventListener('focusin', requestPaint); document.removeEventListener('visibilitychange', visibility);
    motion.removeEventListener('change', resetMotion); inspect.removeEventListener('click', inspectEquipment);
    canvas.removeEventListener('webglcontextlost', contextLost); canvas.removeEventListener('webglcontextrestored', contextRestored);
    resources.forEach(resource => resource.dispose()); key.shadow.map?.dispose(); renderer.dispose();
  });
}
