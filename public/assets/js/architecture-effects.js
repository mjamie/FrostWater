import * as THREE from './vendor/three.min.js';
import { componentTiming, constructionState } from './architecture-timeline.js?v=2';

// Match the site's FrostWater accent. All animation is a function of scroll.
const FROSTWATER_BLUE = '#00aee9';
const CELL = .48;

const gridVertex = /* glsl */`
  varying vec2 vPlan;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vPlan = world.xz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;
const gridFragment = /* glsl */`
  uniform vec3 uBlue;
  uniform float uStrength;
  uniform float uProgress;
  varying vec2 vPlan;

  float gridLine(vec2 point, float spacing, float width) {
    vec2 grid = point / spacing;
    vec2 distanceToLine = abs(fract(grid - .5) - .5) / max(fwidth(grid), vec2(.0001));
    return 1.0 - smoothstep(width, width + 1.0, min(distanceToLine.x, distanceToLine.y));
  }
  void main() {
    vec2 point = vPlan;
    float falloff = 1.0 - smoothstep(.5, 1.0, length(point / vec2(22.0, 15.0)));
    float fine = gridLine(point, 1.0, .32);
    float major = gridLine(point, 4.0, .48);
    float halo = gridLine(point, 4.0, 2.3);
    vec2 edgeDistance = abs(abs(point) - vec2(8.6, 5.0));
    float perimeter = min(
      edgeDistance.x + max(abs(point.y) - 5.0, 0.0),
      edgeDistance.y + max(abs(point.x) - 8.6, 0.0)
    );
    float pixel = max(length(fwidth(point)), .008);
    float footprint = 1.0 - smoothstep(pixel * .4, pixel * 1.4, perimeter);
    float footprintHalo = 1.0 - smoothstep(pixel, pixel * 4.0, perimeter);
    float withinPlan = (1.0 - smoothstep(8.55, 8.65, abs(point.x))) * (1.0 - smoothstep(4.95, 5.05, abs(point.y)));
    float bays = 1.0 - smoothstep(.3, 1.3, abs(fract(point.x / 3.8 - .5) - .5) / max(fwidth(point.x / 3.8), .0001));
    float scan = exp(-pow((length(point * vec2(.75, 1.0)) - uProgress * 28.0) / .6, 2.0));
    float alpha = fine * .105 + major * .15 + halo * .018;
    alpha += footprint * .57 + footprintHalo * .055 + withinPlan * (bays * .16 + .012);
    alpha += scan * fine * .11;
    alpha *= falloff * uStrength;
    if (alpha < .002) discard;
    gl_FragColor = vec4(uBlue, min(alpha, .7));
    #include <colorspace_fragment>
  }
`;

const cubeVertex = /* glsl */`
  uniform float uProgress;
  attribute vec3 aCenter;
  attribute vec3 aTravel;
  attribute vec2 aTiming;
  attribute float aAlong;
  attribute float aSize;
  attribute float aSeed;
  varying vec2 vFace;
  varying float vSignal;

  void main() {
    vFace = uv;
    float phase = clamp((uProgress - aTiming.x) / aTiming.y, 0.0, 1.0);
    float front = phase * 1.16 - .08;
    float ahead = aAlong - front;
    float gather = 1.0 - smoothstep(.015, .22, ahead);
    vSignal = smoothstep(-.075, -.015, ahead) * (1.0 - smoothstep(.10, .22, ahead));
    vSignal *= smoothstep(0.0, .07, phase) * (1.0 - smoothstep(.88, 1.0, phase));
    if (phase <= 0.0 || phase >= 1.0 || vSignal < .002) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      return;
    }
    float remainingTravel = pow(1.0 - phase, 3.0);
    vec3 drift = vec3(sin(aSeed * 43.1), .5 + fract(aSeed * 7.7), cos(aSeed * 29.7));
    vec3 center = aCenter + aTravel * remainingTravel + drift * .18 * (1.0 - gather);
    vec3 point = center + position * aSize * (.78 + gather * .22);
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(point, 1.0);
  }
`;
const cubeFragment = /* glsl */`
  uniform vec3 uBlue;
  varying vec2 vFace;
  varying float vSignal;
  void main() {
    vec2 distanceToEdge = min(vFace, 1.0 - vFace) / max(fwidth(vFace), vec2(.0001));
    float edge = min(distanceToEdge.x, distanceToEdge.y);
    float outline = 1.0 - smoothstep(.35, 1.25, edge);
    float halo = 1.0 - smoothstep(.6, 3.0, edge);
    float alpha = (outline * .48 + halo * .018 + .003) * vSignal;
    if (alpha < .003) discard;
    gl_FragColor = vec4(uBlue, alpha);
    #include <colorspace_fragment>
  }
`;

const revealDeclarations = /* glsl */`
  varying vec3 vConstructionWorld;
  uniform vec3 uBuildAxis;
  uniform vec3 uBuildBlue;
  uniform float uBuildMin;
  uniform float uBuildExtent;
  uniform float uBuildPhase;
`;
const revealMask = /* glsl */`
  float buildAlong = (dot(vConstructionWorld, uBuildAxis) - uBuildMin) / uBuildExtent;
  vec3 buildCell = floor(vConstructionWorld / .48);
  float buildGrain = fract(sin(dot(buildCell, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
  float buildFront = uBuildPhase * 1.16 - .08;
  float buildDistance = buildFront - buildAlong - (buildGrain - .5) * .035;
  if (uBuildPhase < .9999 && buildDistance < 0.0) discard;
  float buildLight = uBuildPhase < .9999 ? 1.0 - smoothstep(0.0, .025, buildDistance) : 0.0;
`;

function patchReveal(material, uniforms, surface) {
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vConstructionWorld;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvConstructionWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${revealDeclarations}`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>\n${revealMask}`);
    if (surface) shader.fragmentShader = shader.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      '#include <emissivemap_fragment>\ntotalEmissiveRadiance += uBuildBlue * buildLight * .2;'
    );
  };
  material.customProgramCacheKey = () => `frostwater-reveal-${surface ? 'surface' : 'depth'}-1`;
}

export function createConstructionEffects({ scene, components, foundation, keep }) {
  const blue = new THREE.Color(FROSTWATER_BLUE);
  const gridMaterial = keep(new THREE.ShaderMaterial({
    uniforms: { uBlue: { value: blue }, uStrength: { value: .9 }, uProgress: { value: 0 } },
    vertexShader: gridVertex, fragmentShader: gridFragment,
    transparent: true, depthWrite: false, toneMapped: false,
  }));
  const grid = new THREE.Mesh(keep(new THREE.PlaneGeometry(90, 90)), gridMaterial);
  grid.name = 'FrostWater blueprint ground';
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = -.125;
  grid.renderOrder = -2;
  scene.add(grid);

  scene.updateMatrixWorld(true);
  const centers = [], travels = [], timings = [], alongs = [], sizes = [], seeds = [];
  const reveals = [];
  const dimensions = new THREE.Vector3();
  const vector = new THREE.Vector3();
  components.forEach((item, componentIndex) => {
    if (!Number.isInteger(item.index) || !Number.isInteger(item.count) || item.count < 1) {
      throw new Error('Construction effects require initialized component timings.');
    }
    const bounds = new THREE.Box3().setFromObject(item.group);
    bounds.getSize(dimensions);
    const axisIndex = ['columns', 'glazing'].includes(item.stageId) ? 1
      : dimensions.x >= dimensions.y && dimensions.x >= dimensions.z ? 0
        : dimensions.y >= dimensions.z ? 1 : 2;
    const axis = new THREE.Vector3().setComponent(axisIndex, 1);
    const minimum = bounds.min.getComponent(axisIndex);
    const extent = Math.max(.05, dimensions.getComponent(axisIndex));
    const uniforms = {
      uBuildAxis: { value: axis }, uBuildBlue: { value: blue },
      uBuildMin: { value: minimum }, uBuildExtent: { value: extent }, uBuildPhase: { value: 1 },
    };
    for (const { material } of item.materials) patchReveal(material, uniforms, true);
    const depth = keep(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }));
    patchReveal(depth, uniforms, false);
    item.group.traverse(object => { if (object.isMesh && object.castShadow) object.customDepthMaterial = depth; });
    reveals.push({ item, uniforms, minimum, axis });

    // A single instanced mesh carries all cells; inactive cells produce no fragments.
    // Columns use smaller cells so their silhouettes remain slender and legible.
    const cellSize = item.stageId === 'columns' ? .34 : CELL;
    const steps = [dimensions.x, dimensions.y, dimensions.z].map(size => Math.max(1, Math.ceil(size / cellSize)));
    const { start, duration } = componentTiming(item.stageId, item.index, item.count);
    for (let x = 0; x < steps[0]; x++) for (let y = 0; y < steps[1]; y++) for (let z = 0; z < steps[2]; z++) {
      const fractions = [(x + .5) / steps[0], (y + .5) / steps[1], (z + .5) / steps[2]];
      vector.set(bounds.min.x + dimensions.x * fractions[0], bounds.min.y + dimensions.y * fractions[1], bounds.min.z + dimensions.z * fractions[2]);
      centers.push(vector.x, vector.y, vector.z);
      travels.push(item.travel.x, item.travel.y, item.travel.z);
      timings.push(start, duration);
      alongs.push(fractions[axisIndex]);
      sizes.push(cellSize * .9);
      seeds.push((componentIndex * 97 + x * 13 + y * 29 + z * 53) * .0137);
    }
  });
  const box = new THREE.BoxGeometry(1, 1, 1);
  const cubeGeometry = keep(new THREE.InstancedBufferGeometry().copy(box));
  box.dispose();
  cubeGeometry.instanceCount = sizes.length;
  for (const [name, data, itemSize] of [
    ['aCenter', centers, 3], ['aTravel', travels, 3], ['aTiming', timings, 2],
    ['aAlong', alongs, 1], ['aSize', sizes, 1], ['aSeed', seeds, 1],
  ]) cubeGeometry.setAttribute(name, new THREE.InstancedBufferAttribute(new Float32Array(data), itemSize));
  const cubeMaterial = keep(new THREE.ShaderMaterial({
    uniforms: { uBlue: { value: blue }, uProgress: { value: .15 } },
    vertexShader: cubeVertex, fragmentShader: cubeFragment,
    transparent: true, depthWrite: false, toneMapped: false,
    blending: THREE.NormalBlending,
  }));
  const cubes = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cubes.name = 'FrostWater construction cells';
  cubes.frustumCulled = false;
  cubes.renderOrder = 6;
  scene.add(cubes);

  const foundationMaterials = [];
  foundation.traverse(object => {
    if (!object.isMesh) return;
    const material = keep(object.material.clone());
    material.transparent = true;
    object.material = material;
    foundationMaterials.push(material);
  });

  return {
    cellCount: sizes.length,
    update(progress, reducedMotion) {
      const state = constructionState(progress, reducedMotion);
      grid.visible = state.grid > 0;
      gridMaterial.uniforms.uStrength.value = state.grid;
      gridMaterial.uniforms.uProgress.value = progress;
      cubes.visible = state.cubes;
      cubeMaterial.uniforms.uProgress.value = progress;
      foundation.visible = state.foundation > 0;
      for (const material of foundationMaterials) material.opacity = state.foundation;
      for (const { item, uniforms, minimum, axis } of reveals) {
        uniforms.uBuildPhase.value = reducedMotion ? 1 : item.phase;
        uniforms.uBuildMin.value = minimum + vector.copy(item.group.position).sub(item.home).dot(axis);
      }
    },
  };
}
