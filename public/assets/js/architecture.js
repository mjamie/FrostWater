import * as THREE from './vendor/three.min.js';
import { HDRLoader } from './vendor/HDRLoader.js';
import { STAGES, smoothstep, range, componentPhase, easeOutCubic, currentStage } from './architecture-timeline.js?v=2';
import { createConstructionEffects } from './architecture-effects.js?v=1';
import { createArchitectureStepper, stepText, LAST_STEP } from './architecture-steps.js?v=1';

const intro = document.querySelector('.architecture-intro');
if (intro) {
  startArchitecture(intro).catch(error => {
    intro.classList.remove('is-preparing', 'is-enhanced');
    intro.dataset.renderState = 'fallback';
    intro.dispatchEvent(new Event('architecture:settled'));
    console.warn('The architectural introduction is using its still image.', error);
  });
}

async function startArchitecture(root) {
  const canvas = root.querySelector('canvas');
  const stage = root.querySelector('.architecture-stage');
  const copy = root.querySelector('.architecture-copy');
  const hint = root.querySelector('.architecture-scroll');
  const hintText = root.querySelector('.architecture-scroll-motion');
  const status = root.querySelector('#architecture-status');
  const caption = root.querySelector('.architecture-caption');
  const captionTitle = root.querySelector('.architecture-caption-title');
  const captionDetail = root.querySelector('.architecture-caption-detail');
  const reveal = root.querySelector('.architecture-reveal');
  const description = root.querySelector('#architecture-description');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const smallScreen = matchMedia('(max-width: 600px)');
  const touchScreen = matchMedia('(pointer: coarse)');
  const stackedLayout = matchMedia('(max-width: 1023px) and (max-aspect-ratio: 6/5)');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, smallScreen.matches ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 180);
  const building = new THREE.Group();
  scene.add(building);
  const resources = new Set();
  const components = [];
  const keep = resource => { resources.add(resource); return resource; };

  // A soft daylight environment is reflected in the glass, never drawn behind it.
  const environmentScene = new THREE.Scene();
  environmentScene.background = new THREE.Color('#6e8495');
  const panelGeometry = new THREE.PlaneGeometry(1, 1);
  const environmentMaterials = [];
  const lightPanel = (color, intensity, size, position) => {
    const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
    material.color.multiplyScalar(intensity);
    environmentMaterials.push(material);
    const panel = new THREE.Mesh(panelGeometry, material);
    panel.scale.set(...size, 1);
    panel.position.set(...position);
    panel.lookAt(0, 3, 0);
    environmentScene.add(panel);
  };
  lightPanel('#f2eee4', 3, [28, 16], [-18, 16, 10]);
  lightPanel('#d9e9f2', 1.6, [14, 24], [12, 10, -14]);
  lightPanel('#f0f0e8', 1.7, [30, 9], [0, 20, 4]);
  lightPanel('#142231', .4, [70, 30], [0, -14, 10]);
  lightPanel('#263b45', .55, [7, 20], [16, 0, 16]);
  lightPanel('#1c3038', .45, [5, 14], [-9, -2, 20]);
  lightPanel('#9faeae', 1.3, [2.5, 20], [3, 9, 22]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = keep(pmrem.fromScene(environmentScene, .055, .1, 100));
  scene.environment = environment.texture;
  scene.environmentIntensity = .6;
  pmrem.dispose();
  panelGeometry.dispose();
  environmentMaterials.forEach(material => material.dispose());

  scene.add(new THREE.HemisphereLight('#dce9f2', '#38414b', .8));
  const key = new THREE.DirectionalLight('#ffefda', 2.8);
  key.position.set(-12, 21, 14);
  key.castShadow = true;
  const shadowSize = smallScreen.matches ? 1024 : 2048;
  key.shadow.mapSize.set(shadowSize, shadowSize);
  Object.assign(key.shadow.camera, { left: -17, right: 17, top: 18, bottom: -14, near: 1, far: 65 });
  key.shadow.normalBias = .025;
  key.shadow.bias = -.00015;
  key.shadow.radius = 3;
  key.target.position.set(0, 3, 0);
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight('#b8d8ed', .65);
  fill.position.set(12, 9, -6);
  scene.add(fill);

  // Seeded, fine aggregate and formwork marks. No downloaded texture dependency.
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = textureCanvas.height = 512;
  const textureContext = textureCanvas.getContext('2d');
  const pixels = textureContext.createImageData(512, 512);
  let seed = 14761;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
    const i = (y * 512 + x) * 4;
    const grain = (random() - .5) * 20 + Math.sin(y * .045) * 1.8;
    const pore = random() > .995 ? -25 : 0;
    const value = 194 + grain + pore;
    pixels.data.set([value, value - 2, value - 6, 255], i);
  }
  textureContext.putImageData(pixels, 0, 0);
  const concreteMap = keep(new THREE.CanvasTexture(textureCanvas));
  concreteMap.wrapS = concreteMap.wrapT = THREE.RepeatWrapping;
  concreteMap.repeat.set(3, 2);
  concreteMap.colorSpace = THREE.SRGBColorSpace;
  concreteMap.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const concrete = keep(new THREE.MeshStandardMaterial({ color: '#d1d0c9', map: concreteMap, bumpMap: concreteMap, bumpScale: .018, roughness: .85 }));
  const paleConcrete = keep(new THREE.MeshStandardMaterial({ color: '#e4e0d5', map: concreteMap, bumpMap: concreteMap, bumpScale: .012, roughness: .78 }));
  const stone = keep(new THREE.MeshStandardMaterial({ color: '#a9a8a0', map: concreteMap, roughness: .94 }));
  const metal = keep(new THREE.MeshStandardMaterial({ color: '#4c5558', metalness: .72, roughness: .32 }));
  const bronze = keep(new THREE.MeshStandardMaterial({ color: '#827360', metalness: .6, roughness: .4 }));
  const timber = keep(new THREE.MeshStandardMaterial({ color: '#9b7c56', roughness: .7 }));
  const interior = keep(new THREE.MeshStandardMaterial({ color: '#b3a58f', roughness: .9 }));
  const dark = keep(new THREE.MeshStandardMaterial({ color: '#313e43', roughness: .8 }));
  const glass = keep(new THREE.MeshPhysicalMaterial({
    color: '#a2bcc6', metalness: .25, roughness: .065, transparent: true, opacity: .86,
    transmission: .22, thickness: .035, ior: 1.5,
    envMapIntensity: 1.5, clearcoat: 1, clearcoatRoughness: .06, depthWrite: false,
    side: THREE.DoubleSide, forceSinglePass: true,
  }));
  const glassWarm = keep(glass.clone());
  glassWarm.color.set('#c4cbbc');
  glassWarm.opacity = .82;
  const unitBox = keep(new THREE.BoxGeometry(1, 1, 1));
  const unitPane = keep(new THREE.PlaneGeometry(1, 1));
  const allMaterials = [concrete, paleConcrete, stone, metal, bronze, timber, interior, dark, glass, glassWarm];

  function box(parent, size, position, material = concrete, castsShadow = true) {
    const mesh = new THREE.Mesh(unitBox, material);
    mesh.scale.set(...size);
    mesh.position.set(...position);
    mesh.castShadow = castsShadow && material !== glass && material !== glassWarm;
    mesh.receiveShadow = material !== glass && material !== glassWarm;
    parent.add(mesh);
    return mesh;
  }

  // Repeated frame bars share one draw call per component.
  function joinedBoxes(parent, specs, material) {
    const geometries = specs.map(([size, position]) => {
      const geometry = new THREE.BoxGeometry(...size).toNonIndexed();
      geometry.translate(...position);
      return geometry;
    });
    const geometry = keep(new THREE.BufferGeometry());
    for (const name of ['position', 'normal', 'uv']) {
      const size = geometries[0].attributes[name].itemSize;
      const values = new Float32Array(geometries.reduce((sum, part) => sum + part.attributes[name].array.length, 0));
      let offset = 0;
      for (const part of geometries) { values.set(part.attributes[name].array, offset); offset += part.attributes[name].array.length; }
      geometry.setAttribute(name, new THREE.BufferAttribute(values, size));
    }
    geometries.forEach(part => part.dispose());
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function component(stageId, position, travel, build) {
    const group = new THREE.Group();
    group.position.set(...position);
    build(group);
    building.add(group);
    components.push({ group, stageId, home: new THREE.Vector3(...position), travel: new THREE.Vector3(...travel), materials: [] });
    return group;
  }

  // The blueprint becomes the building's actual foundation as assembly starts.
  const foundation = new THREE.Group();
  building.add(foundation);
  box(foundation, [17.2, .25, 10], [0, 0, 0], concrete);
  joinedBoxes(foundation, [
    [[17.12, .025, .035], [0, .14, 4.65]],
    [[17.12, .025, .035], [0, .14, -4.65]],
    ...[-7.6, -3.8, 0, 3.8, 7.6].map(x => [[.035, .025, 9.3], [x, .14, 0]]),
  ], stone);

  const levels = [
    { y: .14, h: 3.22, xs: [-7.5, -3.75, 0, 3.75, 7.5], zs: [-4.2, 4.2] },
    { y: 3.64, h: 3.02, xs: [-7.5, -3.75, 0, 3.75, 7.5], zs: [-4.2, 4.2] },
    { y: 6.94, h: 2.93, xs: [-7.05, -3.7, -.35, 3], zs: [-3.75, 2.9] },
  ];
  const columnGrid = [];
  // Continuous columns keep the structural frame grounded before slabs arrive.
  for (const z of [-3.75, 2.9]) for (const x of [-7.05, -3.7, -.35, 3]) columnGrid.push({ x, z, h: 9.73 });
  for (const x of [-7.05, -3.7, -.35, 3, 7.5]) columnGrid.push({ x, z: 4.2, h: 6.52 });
  for (const z of [-3.75, 2.9]) columnGrid.push({ x: 7.5, z, h: 6.52 });
  columnGrid.sort((a, b) => a.x - b.x || a.z - b.z);
  columnGrid.forEach(({ x, z, h }) => {
    component('columns', [x, .14 + h / 2, z], [0, 1.1, 0], group => {
      box(group, [.23, h, .23], [0, 0, 0], paleConcrete);
    });
  });

  [
    { y: 3.5, width: 17.2, depth: 10, x: 0, z: 0 },
    { y: 6.8, width: 17.2, depth: 10, x: 0, z: 0 },
  ].forEach(floor => {
    // Individual prefabricated bays arrive in a measured left-to-right rhythm.
    for (let bay = 0; bay < 4; bay++) {
      const width = floor.width / 4;
      component('floors', [-floor.width / 2 + width * (bay + .5), floor.y, floor.z], [0, .9, 0], group => {
        box(group, [width - .012, .28, floor.depth], [0, 0, 0], paleConcrete);
        box(group, [width - .012, .07, floor.depth - .55], [0, -.16, 0], concrete);
      });
    }
  });

  // Quiet service core and interior walls lend scale and depth behind the glass.
  levels.forEach((level, i) => {
    component('floors', [-5.9, level.y + level.h / 2, -1.55], [0, .75, 0], group => {
      joinedBoxes(group, [
        [[2.45, level.h, .18], [0, 0, -1.5]],
        [[.18, level.h, 3.2], [-1.15, 0, 0]],
        [[2.2, level.h, .18], [0, 0, 1.5]],
      ], interior);
      if (i < 2) {
        const steps = Array.from({ length: 17 }, (_, step) => [[1.1, .075, .25], [2.2, -level.h / 2 + .17 + step * .185, -1.8 + step * .22]]);
        joinedBoxes(group, steps, paleConcrete);
      }
    });
  });

  function windowPanel(position, width, height, rotation, index) {
    const outward = new THREE.Vector3(0, 0, .62).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation);
    component('glazing', position, outward.toArray(), group => {
      group.rotation.y = rotation;
      const pane = new THREE.Mesh(unitPane, index % 5 === 0 ? glassWarm : glass);
      pane.scale.set(width - .055, height - .055, 1);
      group.add(pane);
      joinedBoxes(group, [
        [[.045, height, .065], [-width / 2, 0, 0]],
        [[.045, height, .065], [width / 2, 0, 0]],
        [[width, .045, .065], [0, height / 2, 0]],
        [[width, .045, .065], [0, -height / 2, 0]],
      ], metal);
    });
  }
  levels.forEach((level, floor) => {
    const left = floor === 2 ? -7.12 : -7.65;
    const right = floor === 2 ? 3.08 : 7.65;
    const front = floor === 2 ? 3.02 : 4.32;
    const back = floor === 2 ? -3.86 : -4.32;
    const bays = floor === 2 ? 7 : 10;
    const width = (right - left) / bays;
    for (let i = 0; i < bays; i++) {
      windowPanel([left + width * (i + .5), level.y + level.h / 2, front], width, level.h, 0, i + floor);
      windowPanel([left + width * (i + .5), level.y + level.h / 2, back], width, level.h, Math.PI, i);
    }
    const sideWidth = (front - back) / 5;
    for (let i = 0; i < 5; i++) {
      windowPanel([right, level.y + level.h / 2, back + sideWidth * (i + .5)], sideWidth, level.h, Math.PI / 2, i);
      // The west elevation is mostly stone, with just two glazed bays.
      if (i > 2) windowPanel([left, level.y + level.h / 2, back + sideWidth * (i + .5)], sideWidth, level.h, -Math.PI / 2, i);
    }
  });

  levels.forEach((level, floor) => {
    component('facade', [floor === 2 ? -7.2 : -7.75, level.y + level.h / 2, -1.7], [-.5, 0, 0], group => {
      box(group, [.18, level.h, 4.8], [0, 0, 0], stone);
      joinedBoxes(group, Array.from({ length: 6 }, (_, i) => [[.19, .012, 4.8], [0, -level.h / 2 + .45 + i * .45, 0]]), concrete);
    });
    // Bronze sun screens remain slender enough to reveal the glazing behind them.
    for (let i = 0; i < 9; i++) {
      component('facade', [-7.25 + i * .32, level.y + level.h / 2, floor === 2 ? 3.22 : 4.52], [0, 0, .45], group => {
        box(group, [.055, level.h, .28], [0, 0, 0], bronze);
      });
    }
  });

  component('facade', [5.55, 6.965, .3], [0, .45, 0], group => {
    joinedBoxes(group, Array.from({ length: 28 }, (_, i) => [[4.7, .035, .25], [0, 0, -3.5 + i * .267]]), timber);
  });
  component('facade', [8.15, 7.49, 0], [.4, 0, 0], group => {
    box(group, [.02, 1.03, 9.2], [0, 0, 0], glass, false);
    joinedBoxes(group, [
      [[.035, .035, 9.25], [0, .53, 0]],
      ...[-4.6, -2.3, 0, 2.3, 4.6].map(z => [[.035, 1.08, .035], [0, 0, z]]),
    ], metal);
  });
  component('facade', [0, 7.49, 4.64], [0, 0, .4], group => {
    box(group, [16.3, 1.03, .02], [0, 0, 0], glass, false);
    joinedBoxes(group, [
      [[16.35, .035, .035], [0, .53, 0]],
      ...[-8.15, -5.43, -2.71, 0, 2.71, 5.43, 8.15].map(x => [[.035, 1.08, .035], [x, 0, 0]]),
    ], metal);
  });
  // Door handles, a recessed entry canopy and furniture make the scale legible.
  component('facade', [1.52, 1.45, 4.37], [0, 0, .35], group => {
    joinedBoxes(group, [[ [.025, .55, .055], [-.11, 0, .055] ], [ [.025, .55, .055], [.11, 0, .055] ]], bronze);
    box(group, [3.1, .08, .72], [0, 1.52, .18], metal);
  });
  [0, 1, 2].forEach(floor => {
    component('facade', [floor === 2 ? 0 : 3.8, levels[floor].y, .8], [0, .35, 0], group => {
      joinedBoxes(group, [
        [[2.5, .16, .95], [0, .43, 0]],
        [[2.5, .65, .18], [0, .73, -.43]],
        [[.18, .62, 1], [-1.2, .54, 0]],
        [[.18, .62, 1], [1.2, .54, 0]],
      ], interior);
      box(group, [1.4, .055, .7], [0, .43, 1.3], timber);
      joinedBoxes(group, [[ [.055, .42, .055], [-.55, .21, 1.3] ], [ [.055, .42, .055], [.55, .21, 1.3] ]], dark);
    });
  });

  // Roof bays land last, with a delicate perimeter coping and recessed roof finish.
  for (let i = 0; i < 3; i++) {
    component('roof', [-7.95 + (i + .5) * 4.05, 10.02, -.4], [0, 1, 0], group => {
      box(group, [4.04, .28, 8.65], [0, 0, 0], paleConcrete);
      box(group, [4.04, .04, 8.65], [0, .16, 0], metal);
      box(group, [4.02, .07, 8.1], [0, .2, 0], stone);
    });
  }

  // A shadow-only infinite ground disappears into the navy page background.
  const shadowMaterial = keep(new THREE.ShadowMaterial({ color: '#000000', opacity: .18, depthWrite: false }));
  const ground = new THREE.Mesh(keep(new THREE.PlaneGeometry(200, 200)), shadowMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -.14;
  ground.receiveShadow = true;
  scene.add(ground);

  // Clone only per component, so fading a panel never fades an already placed one.
  for (const stageInfo of STAGES) {
    const items = components.filter(item => item.stageId === stageInfo.id);
    items.forEach((item, index) => {
      item.index = index;
      item.count = items.length;
      const clones = new Map();
      item.group.traverse(object => {
        if (!object.isMesh) return;
        if (!clones.has(object.material)) {
          const original = object.material;
          const clone = keep(original.clone());
          clone.transparent = true;
          clones.set(original, clone);
          item.materials.push({ material: clone, opacity: original.opacity });
        }
        object.material = clones.get(object.material);
      });
    });
  }

  const construction = createConstructionEffects({ scene, components, foundation, keep });

  let frame = 0;
  let width = 0;
  let height = 0;
  let top = 0;
  let distance = 1;
  let disposed = false;
  let lost = false;
  let previousStage = '';
  let previousCaption = '';
  let announcedStep = 0;
  let previousProgress = -1;
  let needsRender = true;
  let daylightTexture = null;
  const target = new THREE.Vector3();

  function paint(now = performance.now()) {
    frame = 0;
    if (disposed || lost || document.hidden) return;
    const stepState = stepper.sample(now);
    const progress = motion.matches ? 1 : stepState.progress;
    // An intersection notification can lag a motion-preference layout change.
    // Cached bounds keep scrolling responsive without a per-frame layout read.
    const inView = scrollY + innerHeight >= top - 100 && scrollY <= top + distance + height + 100;
    if ((!inView && !needsRender) || (progress === previousProgress && !needsRender && !stepState.moving)) return;
    const journey = motion.matches ? 0 : smoothstep(progress);
    const assembly = progress;
    for (const item of components) {
      item.phase = componentPhase(assembly, item.stageId, item.index, item.count);
      const t = easeOutCubic(item.phase);
      item.group.visible = t > 0;
      item.group.position.copy(item.home).addScaledVector(item.travel, 1 - t);
      for (const { material, opacity } of item.materials) material.opacity = opacity * smoothstep(range(item.phase, 0, .1));
    }
    construction.update(progress, motion.matches);

    const aspect = width / height;
    const narrow = stackedLayout.matches;
    const phone = width <= 600;
    const angle = .76 - journey * .13;
    const elevation = .32 + journey * .045;
    // Fit the building to the viewport, not a cropped embedded viewer.
    const verticalSize = narrow
      ? Math.max(20, (phone && height < 740 ? 27 : 24) / aspect)
      : Math.max(24, (width < 1100 ? 40 : 38) / aspect);
    const radius = verticalSize / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    const centreX = narrow ? .50 : .70;
    const centreY = narrow ? (phone ? (height < 740 ? .72 : .70) : .69) - journey * .12 : .56;
    target.set(0, 3.6 + journey * .7, 0);
    camera.position.set(Math.sin(angle) * Math.cos(elevation) * radius, target.y + Math.sin(elevation) * radius, Math.cos(angle) * Math.cos(elevation) * radius);
    camera.lookAt(target);
    camera.setViewOffset(width, height, (.5 - centreX) * width, (.5 - centreY) * height, width, height);

    const text = stepText(stepState);
    const textX = text.offset * (phone ? 44 : 96);
    const copyOpacity = motion.matches ? 1 : text.step === 0 ? text.opacity : 0;
    copy.style.opacity = copyOpacity;
    copy.style.transform = `translate3d(${motion.matches ? 0 : textX}px, 0, 0)`;
    copy.inert = copyOpacity < .5;
    copy.style.visibility = copyOpacity === 0 ? 'hidden' : 'visible';
    hint.style.opacity = 1;
    const stageId = currentStage(progress);
    if (stageId !== previousStage) {
      previousStage = stageId;
      root.dataset.stage = stageId;
    }
    const activeCaption = motion.matches ? null : STAGES[text.step - 1];
    const captionOpacity = activeCaption ? text.opacity : 0;
    if (activeCaption) {
      if (activeCaption.id !== previousCaption) {
        captionTitle.textContent = activeCaption.label;
        captionDetail.textContent = activeCaption.detail;
        previousCaption = activeCaption.id;
      }
    }
    caption.style.opacity = captionOpacity;
    caption.style.transform = `translate3d(${textX}px, 0, 0)`;
    caption.style.visibility = captionOpacity > 0 ? 'visible' : 'hidden';
    const revealOpacity = !motion.matches && text.step === LAST_STEP ? text.opacity : 0;
    reveal.style.opacity = revealOpacity;
    reveal.style.transform = `translate3d(${textX}px, 0, 0)`;
    reveal.style.visibility = revealOpacity > 0 ? 'visible' : 'hidden';
    reveal.inert = revealOpacity < .5;
    root.dataset.progress = progress.toFixed(4);
    root.dataset.step = String(stepState.step);
    root.dataset.transition = stepState.moving ? 'running' : 'idle';
    if (!stepState.moving && stepState.step !== announcedStep) {
      announcedStep = stepState.step;
      const active = STAGES[announcedStep - 1];
      status.textContent = motion.matches || announcedStep === 0 ? '' : active
        ? `Stage ${announcedStep} of ${STAGES.length}. ${active.detail}`
        : 'Building complete. Scroll down to discover FrostWater Studios.';
    }
    const gesture = touchScreen.matches ? 'Swipe' : 'Scroll';
    const instruction = stepState.step === LAST_STEP ? `${gesture} to discover FrostWater`
      : stepState.step === LAST_STEP - 1 ? `${gesture} for the completed view`
      : stepState.step === 0 ? `${gesture} once to start building` : `${gesture} for the next stage`;
    if (hintText.textContent !== instruction) hintText.textContent = instruction;
    renderer.shadowMap.needsUpdate = previousProgress !== progress;
    previousProgress = progress;
    needsRender = false;
    renderer.render(scene, camera);
    root.dataset.renderState = 'ready';
    if (stepState.moving) requestPaint();
  }

  function requestPaint() {
    if (!frame && !disposed && !lost && !document.hidden) frame = requestAnimationFrame(paint);
  }
  function measure() {
    if (disposed) return;
    width = stage.clientWidth;
    height = stage.clientHeight;
    top = root.getBoundingClientRect().top + scrollY;
    distance = Math.max(1, root.offsetHeight - height);
    stepper.measure(top);
    camera.aspect = width / height;
    needsRender = true;
    renderer.setSize(width, height, false);
    camera.updateProjectionMatrix();
    requestPaint();
  }
  function resetMotion() {
    status.textContent = '';
    description.textContent = motion.matches
      ? 'A completed contemporary concrete and glass pavilion with slender bronze screens and a recessed upper terrace.'
      : 'A contemporary pavilion assembles one stage per scroll or swipe: columns, floor plates, glazing, facade details and roof. Each stage pauses for reading. Scroll upward to reverse, or use the up and down arrow keys. Skip intro goes directly to the studio film.';
    previousProgress = -1;
    measure();
  }
  function visibility() {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else requestPaint();
  }
  function contextLost(event) {
    event.preventDefault();
    lost = true;
    stepper.setAvailable(false);
    cancelAnimationFrame(frame);
    frame = 0;
    // Keep layout in place during a recoverable context loss.
    canvas.style.visibility = 'hidden';
    root.querySelector('.architecture-poster').style.visibility = 'visible';
    root.dataset.renderState = 'fallback';
  }
  function contextRestored() {
    lost = false;
    stepper.setAvailable(true);
    canvas.style.visibility = '';
    root.querySelector('.architecture-poster').style.visibility = '';
    previousProgress = -1;
    if (daylightTexture) applyDaylight(daylightTexture);
    measure();
  }
  // Warm every material and render pass while the still image remains visible.
  // Otherwise a new material's shader compilation can stall its first scroll frame.
  camera.aspect = stage.clientWidth / stage.clientHeight;
  camera.position.set(28, 17, 30);
  camera.lookAt(0, 4, 0);
  camera.updateProjectionMatrix();
  renderer.setSize(stage.clientWidth, stage.clientHeight, false);
  renderer.shadowMap.needsUpdate = true;
  await renderer.compileAsync(scene, camera);
  renderer.render(scene, camera);
  root.classList.remove('is-preparing');
  root.classList.add('is-enhanced');
  const stepper = createArchitectureStepper({ root, motion, onChange() { needsRender = true; requestPaint(); } });
  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(stage);
  resizeObserver.observe(root);
  const intersectionObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) requestPaint();
  }, { rootMargin: '100px' });
  intersectionObserver.observe(root);
  addEventListener('scroll', requestPaint, { passive: true });
  addEventListener('resize', measure, { passive: true });
  addEventListener('pageshow', measure);
  document.addEventListener('visibilitychange', visibility);
  motion.addEventListener('change', resetMotion);
  canvas.addEventListener('webglcontextlost', contextLost);
  canvas.addEventListener('webglcontextrestored', contextRestored);
  resetMotion();
  // Animate only a requested stage; completed stages have no render loop.
  cancelAnimationFrame(frame);
  paint();
  root.dispatchEvent(new Event('architecture:settled'));

  // A local CC0 daylight panorama adds real sky and landscape reflections.
  // The procedural environment above remains usable if this optional asset fails.
  function applyDaylight(texture) {
    const generator = new THREE.PMREMGenerator(renderer);
    const daylight = keep(generator.fromEquirectangular(texture));
    scene.environment = daylight.texture;
    scene.environmentIntensity = .65;
    scene.environmentRotation.y = 1.8;
    generator.dispose();
    needsRender = true;
    requestPaint();
  }
  new HDRLoader().load(new URL('../media/architecture-environment.hdr', import.meta.url).href, texture => {
    if (disposed) { texture.dispose(); return; }
    daylightTexture = keep(texture);
    if (!lost) applyDaylight(texture);
  }, undefined, () => { /* Keep the procedural daylight environment. */ });

  function dispose(event) {
    if (event.persisted) return; // A back/forward-cache entry must remain usable.
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    stepper.dispose();
    removeEventListener('scroll', requestPaint);
    removeEventListener('resize', measure);
    removeEventListener('pageshow', measure);
    document.removeEventListener('visibilitychange', visibility);
    motion.removeEventListener('change', resetMotion);
    canvas.removeEventListener('webglcontextlost', contextLost);
    canvas.removeEventListener('webglcontextrestored', contextRestored);
    resources.forEach(resource => resource.dispose());
    key.shadow.map?.dispose();
    allMaterials.length = 0;
    renderer.dispose();
  }
  addEventListener('pagehide', dispose);
}
