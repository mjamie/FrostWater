import * as THREE from './vendor/three.min.js';
import { createWorkshop } from './experience-geometry.js?v=3';
import { buildGenerator } from './experience-generator.js?v=3';
import { buildProduction } from './experience-production.js?v=3';
import { buildTraining } from './experience-training.js?v=3';
import { partProgress } from './experience-timeline.js?v=2';

// Original illustrative models, built from the approved FrostWater concept.
// Dimensions describe the artwork, not engineering or training specifications.
export function createModels({ scene, keep }) {
  const parts = [];
  const models = ['Electric drive', 'Production cell', 'Equipment training'].map(name => {
    const group = new THREE.Group(); group.name = name; scene.add(group); return group;
  });
  const kit = createWorkshop(keep);
  function part(chapter, name, position, build, travel = [0,.4,0], explode = [0,0,0]) {
    const group = new THREE.Group(); group.name = name; group.position.set(...position);
    models[chapter].add(group); build(group);
    parts.push({ chapter, name, group, home: new THREE.Vector3(...position), travel: new THREE.Vector3(...travel), explode: new THREE.Vector3(...explode) });
    return group;
  }
  const context = { part, models, keep, kit };
  const builders = [buildGenerator(context), buildProduction(context), buildTraining(context)];

  // Preserve joints as local groups; batch all fixed geometry by material.
  // This keeps the detailing inexpensive without baking moving parts together.
  function mergeFixed(group) {
    for (const child of [...group.children]) if (child.isGroup) mergeFixed(child);
    const batches = new Map();
    for (const child of group.children) {
      if (!child.isMesh) continue;
      if (!batches.has(child.material)) batches.set(child.material, []);
      batches.get(child.material).push(child);
    }
    for (const [mat, objects] of batches) {
      if (objects.length < 2) continue;
      const sources = objects.map(object => {
        object.updateMatrix();
        return (object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone()).applyMatrix4(object.matrix);
      });
      const geometry = keep(new THREE.BufferGeometry());
      for (const name of ['position','normal','uv']) {
        const array = new Float32Array(sources.reduce((n,g) => n+g.attributes[name].array.length,0));
        let offset=0;
        for (const g of sources) { array.set(g.attributes[name].array,offset); offset+=g.attributes[name].array.length; }
        geometry.setAttribute(name,new THREE.BufferAttribute(array,sources[0].attributes[name].itemSize));
      }
      objects.forEach(object => group.remove(object)); sources.forEach(g => g.dispose());
      kit.mesh(group,geometry,mat);
    }
  }
  models.forEach(model => { mergeFixed(model); model.updateMatrixWorld(true); });
  parts.forEach((item,id) => {
    const siblings=parts.filter(p => p.chapter===item.chapter);
    item.index=siblings.indexOf(item); item.count=siblings.length; item.id=id;
  });
  return {
    models, parts,
    update(state) {
      for(const item of parts) {
        const progress=partProgress(state.weights[item.chapter],item.index,item.count);
        item.group.position.copy(item.home).addScaledVector(item.travel,(1-progress)**3);
        if(item.chapter===0) item.group.position.addScaledVector(item.explode,state.expansion);
      }
      builders.forEach(builder => builder.update(state));
    },
  };
}
