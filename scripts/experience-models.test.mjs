import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../public/assets/js/vendor/three.min.js';
import { createModels } from '../public/assets/js/experience-models.js';

function fixture(run) {
  const resources=new Set();
  const scene=new THREE.Scene();
  const model=createModels({scene,keep:r=>(resources.add(r),r)});
  try { run(model,scene); } finally { resources.forEach(r=>r.dispose()); }
}
const pose = (overrides={}) => ({weights:[1,0,0],expansion:0,operation:0,inspection:0,...overrides});

test('model geometry stays finite with unit normals and a bounded render budget',()=>fixture(model=>{
  for(const root of model.models) {
    let triangles=0,draws=0;
    root.traverse(object=>{
      if(!object.isMesh) return;
      draws++;
      const {position,normal,uv}=object.geometry.attributes;
      triangles+=(object.geometry.index?.count??position.count)/3;
      for(const attribute of [position,normal,uv]) for(const value of attribute.array) assert.ok(Number.isFinite(value));
      for(let i=0;i<normal.count;i++) assert.ok(Math.abs(Math.hypot(normal.getX(i),normal.getY(i),normal.getZ(i))-1)<.002);
    });
    assert.ok(triangles<85000,`${root.name}: ${triangles} triangles`);
    assert.ok(draws<90,`${root.name}: ${draws} fixed material batches`);
  }
}));

test('the exploded casing and terminal stay clear of the mechanical assembly',()=>fixture(model=>{
  model.update(pose({expansion:1}));
  const bounds=name=>new THREE.Box3().setFromObject(model.parts.find(p=>p.name===name).group);
  assert.ok(bounds('Upper cast housing').min.y-bounds('Rotor and copper windings').max.y>.5);
  assert.ok(bounds('Terminal enclosure').min.y-bounds('Upper cast housing').max.y>.3);
  model.update(pose());
  assert.ok(bounds('Terminal enclosure').max.y<4.1);
}));

test('replaying or reversing a model pose never accumulates movement',()=>fixture((model,scene)=>{
  const sample=state=>{
    model.update(state); scene.updateMatrixWorld(true);
    const result=[];
    scene.traverse(o=>{if(o.isGroup) result.push(...o.matrixWorld.elements);});
    return result;
  };
  const start=sample(pose());
  const open=pose({weights:[0,0,1],expansion:1,operation:.63,inspection:1});
  const target=sample(open);
  assert.deepEqual(sample(open),target);
  sample(pose({weights:[0,1,0],operation:1,expansion:1}));
  assert.deepEqual(sample(pose()),start);
}));

test('the inspection door rotates on its hinge without moving the cabinet',()=>fixture(model=>{
  const cabinet=model.parts.find(p=>p.name==='Folded steel cabinet').group;
  const door=model.models[2].getObjectByName('Access door hinge');
  const closed=pose({weights:[0,0,1]});
  model.update(closed); const home=cabinet.position.clone(), hinge=door.position.clone();
  model.update({...closed,inspection:1});
  assert.deepEqual(cabinet.position,home); assert.deepEqual(door.position,hinge);
  assert.ok(door.rotation.y<-Math.PI/2);
  assert.equal(model.models[2].getObjectByName('Selected service module').visible,true);
  model.update(closed);
  assert.equal(Math.abs(door.rotation.y),0);
  assert.equal(model.models[2].getObjectByName('Selected service module').visible,false);
}));
