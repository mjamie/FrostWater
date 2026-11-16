import * as THREE from './vendor/three.min.js';
import { partProgress } from './experience-timeline.js?v=2';

const blue = new THREE.Color('#00aee9');
const declarations = `
  varying vec3 vAssemblyPoint;
  uniform float uAssembly;
  uniform float uMinimum;
  uniform float uExtent;
  uniform vec3 uAxis;
`;
const mask = `
  float along = (dot(vAssemblyPoint, uAxis) - uMinimum) / uExtent;
  float grain = fract(sin(dot(floor(vAssemblyPoint / .22), vec3(12.9898, 78.233, 37.719))) * 43758.5453);
  float distanceToFront = uAssembly * 1.12 - .06 - along - (grain - .5) * .025;
  if (uAssembly < .9999 && distanceToFront < 0.0) discard;
  float assemblyLight = uAssembly < .9999 ? 1.0 - smoothstep(0.0, .018, distanceToFront) : 0.0;
`;
function patch(material, uniforms, surface) {
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nuniform mat4 uAssemblyInverse;\nvarying vec3 vAssemblyPoint;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvAssemblyPoint = (uAssemblyInverse * modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>\n${declarations}`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>\n${mask}`);
    if (surface) shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(0.0, .25, .44) * assemblyLight;');
  };
  material.customProgramCacheKey = () => `experience-assembly-${surface ? 'surface' : 'depth'}-1`;
}

export function createEffects({ scene, models, parts, keep }) {
  const gridMaterial = keep(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, toneMapped: false,
    uniforms: { uBlue: { value: blue }, uJourney: { value: 0 } },
    vertexShader: `varying vec2 vGrid;
      void main() { vec4 world = modelMatrix * vec4(position, 1.0); vGrid = world.xz; gl_Position = projectionMatrix * viewMatrix * world; }`,
    fragmentShader: `uniform vec3 uBlue; uniform float uJourney; varying vec2 vGrid;
      float line(vec2 point, float spacing, float width) {
        vec2 g = point / spacing;
        vec2 d = abs(fract(g - .5) - .5) / max(fwidth(g), vec2(.0001));
        return 1.0 - smoothstep(width, width + 1.0, min(d.x, d.y));
      }
      void main() {
        float fade = 1.0 - smoothstep(.2, 1.0, length(vGrid / vec2(12.0, 9.0)));
        float fine = line(vGrid, .5, .25);
        float major = line(vGrid, 2.0, .38);
        float scan = exp(-pow((length(vGrid) - fract(uJourney) * 10.0) / .35, 2.0));
        float alpha = (fine * .055 + major * .085 + fine * scan * .06) * fade;
        if (alpha < .002) discard;
        gl_FragColor = vec4(uBlue, alpha);
        #include <colorspace_fragment>
      }`,
  }));
  const grid = new THREE.Mesh(keep(new THREE.PlaneGeometry(100, 100)), gridMaterial);
  grid.rotation.x = -Math.PI / 2; grid.position.y = -.025; grid.renderOrder = -2;
  scene.add(grid);
  const shadow = new THREE.Mesh(keep(new THREE.PlaneGeometry(100, 100)), keep(new THREE.ShadowMaterial({ color: '#00040a', opacity: .32 })));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -.012; shadow.receiveShadow = true;
  scene.add(shadow);
  scene.updateMatrixWorld(true);
  let cells = 0;
  for (const item of parts) {
    const inverse = item.group.matrixWorld.clone().invert();
    const bounds = new THREE.Box3().setFromObject(item.group).applyMatrix4(inverse);
    const size = bounds.getSize(new THREE.Vector3());
    const axis = size.y > .35 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const extent = Math.max(.05, size.dot(axis));
    const uniforms = {
      uAssembly: { value: 1 }, uAssemblyInverse: { value: inverse }, uAxis: { value: axis },
      uMinimum: { value: bounds.min.dot(axis) }, uExtent: { value: extent },
    };
    const clones = new Map();
    const depth = keep(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }));
    patch(depth, uniforms, false);
    item.group.traverse(object => {
      if (!object.isMesh) return;
      const original = object.material;
      if (!clones.has(original)) {
        const copy = keep(original.clone()); patch(copy, uniforms, true); clones.set(original, copy);
      }
      object.material = clones.get(original);
      if (object.castShadow) object.customDepthMaterial = depth;
    });
    const cell = item.chapter === 0 ? .24 : .4;
    const counts = [size.x, size.y, size.z].map(dimension => Math.max(1, Math.min(22, Math.ceil(dimension / cell))));
    const centers = [], alongs = [];
    for (let x = 0; x < counts[0]; x++) for (let y = 0; y < counts[1]; y++) for (let z = 0; z < counts[2]; z++) {
      const point = new THREE.Vector3(bounds.min.x + size.x * (x + .5) / counts[0], bounds.min.y + size.y * (y + .5) / counts[1], bounds.min.z + size.z * (z + .5) / counts[2]);
      centers.push(...point.toArray()); alongs.push((point.dot(axis) - bounds.min.dot(axis)) / extent);
    }
    const base = new THREE.BoxGeometry(cell * .84, cell * .84, cell * .84);
    const geometry = keep(new THREE.InstancedBufferGeometry().copy(base)); base.dispose();
    geometry.instanceCount = alongs.length; cells += alongs.length;
    geometry.setAttribute('aCenter', new THREE.InstancedBufferAttribute(new Float32Array(centers), 3));
    geometry.setAttribute('aAlong', new THREE.InstancedBufferAttribute(new Float32Array(alongs), 1));
    const cubeMaterial = keep(new THREE.ShaderMaterial({
      uniforms: { uPhase: uniforms.uAssembly, uBlue: { value: blue } },
      transparent: true, depthWrite: false, toneMapped: false,
      vertexShader: `uniform float uPhase; attribute vec3 aCenter; attribute float aAlong; varying vec2 vFace; varying float vSignal;
        void main() {
          vFace = uv;
          float front = uPhase * 1.12 - .06;
          float ahead = aAlong - front;
          vSignal = smoothstep(-.09, -.015, ahead) * (1.0 - smoothstep(.12, .28, ahead));
          vSignal *= smoothstep(0.0, .08, uPhase) * (1.0 - smoothstep(.9, 1.0, uPhase));
          vec3 p = aCenter + position + vec3(0.0, .12 * (1.0 - uPhase), 0.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: `uniform vec3 uBlue; varying vec2 vFace; varying float vSignal;
        void main() {
          vec2 d = min(vFace, 1.0 - vFace) / max(fwidth(vFace), vec2(.0001));
          float edge = min(d.x, d.y);
          float outline = 1.0 - smoothstep(.3, 1.25, edge);
          float halo = 1.0 - smoothstep(.5, 2.4, edge);
          float alpha = (outline * .46 + halo * .014 + .002) * vSignal;
          if (alpha < .003) discard;
          gl_FragColor = vec4(uBlue, alpha);
          #include <colorspace_fragment>
        }`,
    }));
    const cubes = new THREE.Mesh(geometry, cubeMaterial);
    cubes.frustumCulled = false; cubes.renderOrder = 3;
    item.group.add(cubes);
    item.effect = { uniforms, cubes };
  }
  return {
    cells,
    pose(weights, reduced) {
      models.forEach((model, index) => { model.visible = weights[index] > .001; });
      for (const item of parts) {
        const progress = partProgress(weights[item.chapter], item.index, item.count);
        item.group.visible = progress > .001;
        item.group.position.copy(item.home).addScaledVector(item.travel, (1 - progress) ** 3);
        item.effect.uniforms.uAssembly.value = progress;
        item.effect.cubes.visible = !reduced && progress > .005 && progress < .998;
      }
    },
    update(journey) {
      scene.updateMatrixWorld(true);
      for (const item of parts) item.effect.uniforms.uAssemblyInverse.value.copy(item.group.matrixWorld).invert();
      gridMaterial.uniforms.uJourney.value = journey;
    },
  };
}
