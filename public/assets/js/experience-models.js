import * as THREE from './vendor/three.min.js';

// Original, proportioned mechanical studies. Dimensions describe the models,
// not engineering specifications or a training procedure.
export function createModels({ scene, keep }) {
  const parts = [];
  const models = [new THREE.Group(), new THREE.Group(), new THREE.Group()];
  models.forEach(model => scene.add(model));
  const boxGeometry = keep(new THREE.BoxGeometry(1, 1, 1));
  const material = options => keep(new THREE.MeshStandardMaterial(options));
  const m = {
    enamel: material({ color: '#35637c', metalness: .48, roughness: .32 }),
    blue: material({ color: '#0087b9', metalness: .45, roughness: .28 }),
    steel: material({ color: '#b1bbc0', metalness: .86, roughness: .27 }),
    bright: material({ color: '#d3d8d8', metalness: .8, roughness: .19 }),
    dark: material({ color: '#202c34', metalness: .5, roughness: .5 }),
    white: material({ color: '#e0dfd5', metalness: .35, roughness: .36 }),
    rubber: material({ color: '#11191e', metalness: .05, roughness: .75 }),
    copper: material({ color: '#a9693c', metalness: .87, roughness: .3 }),
    cardboard: material({ color: '#a28c6d', roughness: .91 }),
    timber: material({ color: '#9e8361', roughness: .83 }),
    stripe: material({ color: '#abb296', roughness: .7 }),
    glow: material({ color: '#43c6ec', emissive: '#00aee9', emissiveIntensity: .4, roughness: .3 }),
    screen: material({ color: '#102e3a', emissive: '#124e65', emissiveIntensity: .25, roughness: .22 }),
    glass: keep(new THREE.MeshPhysicalMaterial({ color: '#a4c4cf', transparent: true, opacity: .18, roughness: .12, metalness: .12, side: THREE.DoubleSide, depthWrite: false })),
  };
  // Fine, seeded cast-metal grain is visible only at product scale.
  const surface = document.createElement('canvas');
  surface.width = surface.height = 128;
  const ctx = surface.getContext('2d');
  const data = ctx.createImageData(128, 128);
  let seed = 19;
  for (let i = 0; i < data.data.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const value = 170 + (seed / 4294967296 - .5) * 34;
    data.data.set([value, value, value, 255], i);
  }
  ctx.putImageData(data, 0, 0);
  const grain = keep(new THREE.CanvasTexture(surface));
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
  grain.repeat.set(5, 3);
  for (const name of ['enamel', 'blue', 'dark']) { m[name].bumpMap = grain; m[name].bumpScale = .007; }

  const mesh = (parent, geometry, mat, position = [0, 0, 0]) => {
    const object = new THREE.Mesh(geometry, mat);
    object.position.set(...position);
    object.castShadow = mat !== m.glass && mat !== m.glow;
    object.receiveShadow = mat !== m.glass;
    parent.add(object);
    return object;
  };
  const box = (parent, size, position, mat = m.steel) => {
    const object = mesh(parent, boxGeometry, mat, position);
    object.scale.set(...size);
    return object;
  };
  const cylinder = (parent, radius, length, position, mat = m.steel, axis = 'y', radiusTop = radius, sides = 48) => {
    const object = mesh(parent, keep(new THREE.CylinderGeometry(radiusTop, radius, length, sides)), mat, position);
    if (axis === 'x') object.rotation.z = Math.PI / 2;
    if (axis === 'z') object.rotation.x = Math.PI / 2;
    return object;
  };
  const torus = (parent, radius, tube, position, mat, axis = 'x', arc = Math.PI * 2) => {
    const object = mesh(parent, keep(new THREE.TorusGeometry(radius, tube, 10, 64, arc)), mat, position);
    if (axis === 'x') object.rotation.y = Math.PI / 2;
    if (axis === 'y') object.rotation.x = Math.PI / 2;
    return object;
  };
  const link = (parent, from, to, radius, mat = m.steel) => {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const object = cylinder(parent, radius, a.distanceTo(b), a.clone().add(b).multiplyScalar(.5).toArray(), mat);
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize());
    return object;
  };
  const tube = (parent, points, radius, mat = m.steel) => mesh(parent,
    keep(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), 40, radius, 12, false)), mat);
  const part = (chapter, name, position, build, travel = [0, .45, 0], explode = [0, 0, 0]) => {
    const group = new THREE.Group();
    group.name = name;
    group.position.set(...position);
    models[chapter].add(group);
    build(group);
    parts.push({ chapter, name, group, home: new THREE.Vector3(...position), travel: new THREE.Vector3(...travel), explode: new THREE.Vector3(...explode) });
    return group;
  };
  const bolts = (parent, x, y, z, radius, count = 8, size = .045) => {
    for (let i = 0; i < count; i++) {
      const angle = i / count * Math.PI * 2;
      cylinder(parent, size, .055, [x, y + Math.sin(angle) * radius, z + Math.cos(angle) * radius], m.bright, 'x', size, 6);
    }
  };
  const label = (parent, text, position, width = .5, height = .16) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 128;
    const c = canvas.getContext('2d');
    c.fillStyle = '#c2cbce'; c.fillRect(0, 0, 512, 128);
    c.fillStyle = '#233540'; c.font = '600 38px sans-serif'; c.fillText(text, 22, 65);
    c.fillStyle = '#5b6d76'; c.fillRect(22, 88, 210, 5); c.fillRect(22, 101, 330, 3);
    const texture = keep(new THREE.CanvasTexture(canvas)); texture.colorSpace = THREE.SRGBColorSpace;
    const mat = keep(new THREE.MeshStandardMaterial({ map: texture, metalness: .4, roughness: .45 }));
    const plate = mesh(parent, keep(new THREE.PlaneGeometry(width, height)), mat, position);
    return plate;
  };

  // 1. A closed industrial drive that opens into an exploded view. The two
  // solid half-shells meet around the rotor before the upper casing lifts.
  const casingHalf = (g, start) => {
    const end = start + Math.PI;
    const profile = new THREE.Shape();
    profile.absarc(0, 0, .74, start, end, false);
    profile.lineTo(Math.cos(end) * .675, Math.sin(end) * .675);
    profile.absarc(0, 0, .675, end, start, true);
    profile.closePath();
    const geometry = keep(new THREE.ExtrudeGeometry(profile, { depth: 2.1, steps: 1, bevelEnabled: false, curveSegments: 32 }));
    geometry.translate(0, 0, -1.05);
    geometry.rotateY(Math.PI / 2);
    mesh(g, geometry, m.enamel);
    for (let i = 0; i < 12; i++) {
      const a = start + .1 + i / 11 * (Math.PI - .2);
      const fin = box(g, [1.97, .105, .035], [0, Math.sin(a) * .77, Math.cos(a) * .77], m.enamel);
      fin.rotation.x = Math.PI / 2 - a;
    }
  };
  part(0, 'Mounts', [0, 0, 0], g => {
    for (const x of [-.85, .85]) for (const z of [-.63, .63]) {
      box(g, [.5, .12, .46], [x, .09, z], m.enamel);
      box(g, [.22, .36, .16], [x, .29, z], m.enamel);
      cylinder(g, .055, .045, [x, .17, z + .1], m.bright, 'y', .055, 6);
    }
  }, [0, .12, 0]);
  part(0, 'Lower cast housing', [0, 1.03, 0], g => {
    casingHalf(g, Math.PI);
    label(g, 'FW / DRIVE', [.1, -.24, .755], .62, .18);
  }, [0, .3, 0]);
  part(0, 'Upper cast housing', [0, 1.03, 0], g => {
    casingHalf(g, 0);
  }, [0, .5, 0], [0, 1.25, 0]);
  const rotor = part(0, 'Rotor and copper windings', [0, 1.03, 0], g => {
    cylinder(g, .135, 3.25, [0, 0, 0], m.bright, 'x');
    cylinder(g, .43, 1.55, [0, 0, 0], m.steel, 'x');
    for (let i = 0; i < 34; i++) cylinder(g, .438, .014, [-.76 + i * .045, 0, 0], i % 4 === 0 ? m.dark : m.steel, 'x');
    for (const x of [-.85, .85]) {
      torus(g, .43, .11, [x, 0, 0], m.copper);
      for (let i = 0; i < 18; i++) {
        const a = i * Math.PI / 9;
        const wire = torus(g, .12, .018, [x, Math.sin(a) * .43, Math.cos(a) * .43], m.copper, 'y');
        wire.rotation.x = a;
      }
    }
    box(g, [.38, .06, .07], [1.48, .14, 0], m.steel);
  }, [0, .65, 0], [0, .28, 0]);
  for (const direction of [-1, 1]) {
    part(0, direction < 0 ? 'Rear bearing plate' : 'Drive end flange', [direction * 1.12, 1.03, 0], g => {
      cylinder(g, .75, .15, [0, 0, 0], m.enamel, 'x');
      cylinder(g, .44, .22, [direction * .1, 0, 0], m.steel, 'x');
      cylinder(g, .21, .25, [direction * .17, 0, 0], m.dark, 'x');
      torus(g, .24, .018, [direction * .305, 0, 0], m.bright);
      bolts(g, direction * .09, 0, 0, .63);
    }, [direction * .45, .15, 0], [direction * .58, 0, 0]);
  }
  part(0, 'Fan and protective grille', [-1.36, 1.03, 0], g => {
    cylinder(g, .14, .17, [0, 0, 0], m.rubber, 'x');
    for (let i = 0; i < 9; i++) {
      const a = i * Math.PI * 2 / 9;
      const blade = box(g, [.05, .4, .12], [0, Math.sin(a) * .31, Math.cos(a) * .31], m.dark);
      blade.rotation.x = -a;
    }
    for (const r of [.2, .34, .48, .6]) torus(g, r, .018, [-.13, 0, 0], m.dark);
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      link(g, [-.14, 0, 0], [-.14, Math.sin(a) * .63, Math.cos(a) * .63], .016, m.dark);
    }
  }, [-.65, .15, 0], [-1.03, 0, 0]);
  part(0, 'Terminal enclosure', [.12, 2, -.12], g => {
    box(g, [.45, .08, .4], [0, -.17, 0], m.enamel);
    box(g, [.67, .25, .57], [0, 0, 0], m.enamel);
    box(g, [.71, .045, .61], [0, .15, 0], m.steel);
    for (const x of [-.25, .25]) for (const z of [-.2, .2]) cylinder(g, .028, .025, [x, .18, z], m.bright, 'y', .028, 6);
    cylinder(g, .075, .2, [.4, -.02, 0], m.dark, 'x');
  }, [0, .6, 0], [0, 1.6, 0]);
  models[0].scale.setScalar(1.8);

  // 2. A complete, open production cell, with actual rollers, drives,
  // guarding and articulated equipment rather than blocks on a display base.
  const rollers = [];
  part(1, 'Conveyor chassis', [0, 0, 1.05], g => {
    for (const z of [-.57, .57]) {
      box(g, [7.4, .18, .08], [0, .93, z]);
      box(g, [7.4, .045, .05], [0, 1.12, z], m.bright);
      for (const x of [-3.25, -1.3, 1.3, 3.25]) {
        box(g, [.09, .9, .09], [x, .45, z]);
        cylinder(g, .11, .06, [x, .03, z], m.rubber);
        box(g, [.16, .06, .15], [x, .1, z]);
      }
    }
    for (const x of [-3.2, 0, 3.2]) box(g, [.06, .06, 1.1], [x, .35, 0]);
    for (let i = 0; i < 40; i++) rollers.push(cylinder(g, .064, 1.03, [-3.5 + i * .18, 1.02, 0], m.steel, 'z'));
    cylinder(g, .17, .4, [-2.8, .85, -.85], m.enamel, 'z');
    tube(g, [[-2.8, .85, -.85], [-2.8, .4, -.9], [-1, .25, -.9]], .025, m.rubber);
  }, [0, .3, 0]);
  let robotArm, robotForearm, robotHand;
  part(1, 'Robot and pedestal', [-1.5, 0, -.85], g => {
    box(g, [1.1, .12, 1.1], [0, .06, 0], m.steel);
    cylinder(g, .31, .6, [0, .42, 0], m.enamel);
    cylinder(g, .4, .13, [0, .77, 0], m.white);
    robotArm = new THREE.Group(); robotArm.position.y = .82; g.add(robotArm);
    cylinder(robotArm, .23, .42, [0, .1, 0], m.blue, 'z');
    link(robotArm, [0, .1, 0], [.35, 1.25, 0], .18, m.white);
    link(robotArm, [-.1, .22, -.18], [.25, 1.13, -.18], .048, m.dark);
    robotForearm = new THREE.Group(); robotForearm.position.set(.35, 1.25, 0); robotArm.add(robotForearm);
    cylinder(robotForearm, .22, .38, [0, 0, 0], m.blue, 'z');
    link(robotForearm, [0, 0, 0], [1.15, .15, 0], .145, m.white);
    robotHand = new THREE.Group(); robotHand.position.set(1.15, .15, 0); robotForearm.add(robotHand);
    cylinder(robotHand, .16, .25, [0, -.06, 0], m.dark);
    box(robotHand, [.48, .07, .32], [0, -.23, 0], m.steel);
    for (const x of [-.16, .16]) box(robotHand, [.055, .24, .2], [x, -.36, 0], m.dark);
    tube(robotArm, [[0, .1, -.25], [-.2, .8, -.25], [.4, 1.4, -.25], [1.1, 1.3, -.2]], .037, m.rubber);
  });
  let press;
  part(1, 'Inspection gantry', [2.1, 0, 1.05], g => {
    for (const z of [-.8, .8]) {
      box(g, [.15, 2.65, .15], [0, 1.325, z], m.white);
      box(g, [.5, .08, .4], [0, .04, z], m.steel);
    }
    box(g, [.62, .42, 1.75], [0, 2.45, 0], m.white);
    box(g, [.04, .14, 1.25], [-.33, 2.43, 0], m.enamel);
    press = new THREE.Group(); press.position.y = 1.9; g.add(press);
    cylinder(press, .06, .55, [0, 0, 0], m.bright);
    box(press, [.38, .1, .38], [0, -.28, 0], m.dark);
    cylinder(g, .048, .2, [.12, 2.78, .4], m.glow);
  });
  part(1, 'Rear safety screen', [0, 0, -2.15], g => {
    for (const x of [-3.2, -1.1, 1.1, 3.2]) box(g, [.055, 2.15, .055], [x, 1.075, 0], m.enamel);
    for (const y of [.15, 2.1]) box(g, [6.4, .045, .045], [0, y, 0], m.enamel);
    box(g, [6.3, 1.86, .015], [0, 1.15, 0], m.glass);
    for (let x = -3.1; x <= 3.1; x += .22) box(g, [.009, 1.9, .009], [x, 1.13, -.015], m.dark);
    for (let y = .25; y < 2.1; y += .23) box(g, [6.3, .009, .009], [0, y, -.015], m.dark);
  }, [0, .4, -.3]);
  part(1, 'Control station', [3.35, 0, -1.15], g => {
    box(g, [.65, 1.35, .48], [0, .7, 0], m.white);
    box(g, [.48, .31, .04], [0, 1.08, .26], m.screen);
    for (let row = 0; row < 3; row++) box(g, [.34 - row * .06, .012, .005], [0, 1.16 - row * .06, .286], m.glow);
    for (const x of [-.18, 0, .18]) cylinder(g, .03, .03, [x, .78, .265], x === 0 ? m.blue : m.dark, 'z');
    label(g, 'PROCESS', [0, .45, .245], .4, .13);
  });
  const cartons = [];
  for (let i = 0; i < 4; i++) {
    cartons.push(part(1, `Moving carton ${i + 1}`, [-3.05 + i * 1.55, 1.35, 1.05], g => {
      box(g, [.65, .49, .65], [0, 0, 0], m.cardboard);
      box(g, [.07, .005, .66], [0, .248, 0], m.timber);
      label(g, 'FW', [0, 0, .327], .24, .1);
    }, [0, .5, 0]));
  }
  part(1, 'Process route', [0, .009, 0], g => {
    for (const z of [-2.65, 2.02]) box(g, [8, .01, .032], [0, 0, z], m.blue);
    for (const x of [-4, 4]) box(g, [.032, .01, 4.67], [x, 0, -.3], m.blue);
  }, [0, .05, 0]);

  // 3. A closer equipment familiarisation scene, with a real hinged access
  // panel and visible internal assembly. The action is exploration, not advice.
  part(2, 'Workshop frame', [0, 0, -1.5], g => {
    for (const x of [-2.85, 2.85]) {
      box(g, [.13, 3.75, .13], [x, 1.875, 0], m.steel);
      box(g, [.38, .06, .38], [x, .03, 0], m.steel);
    }
    box(g, [5.85, .18, .16], [0, 3.7, 0], m.steel);
    box(g, [4, .07, .13], [0, 3.56, .1], m.white);
    box(g, [3.8, .012, .1], [0, 3.515, .1], m.glow);
  }, [0, .45, -.3]);
  part(2, 'Equipment cabinet', [0, 0, 0], g => {
    box(g, [2.1, .12, 1.2], [0, .16, 0], m.dark);
    for (const x of [-.97, .97]) box(g, [.09, 2.35, 1.05], [x, 1.4, 0], m.white);
    box(g, [2.03, .1, 1.05], [0, 2.61, 0], m.white);
    box(g, [2.03, .08, 1.05], [0, .28, 0], m.white);
    box(g, [2.03, 2.3, .07], [0, 1.43, -.52], m.enamel);
    for (const x of [-.8, .8]) for (const z of [-.4, .4]) cylinder(g, .085, .14, [x, .07, z], m.rubber);
  });
  const inside = part(2, 'Internal equipment', [0, 0, 0], g => {
    for (const x of [-.57, .3]) {
      cylinder(g, .19, .8, [x, 1.25, 0], m.steel);
      cylinder(g, .22, .08, [x, 1.68, 0], m.blue);
      cylinder(g, .22, .08, [x, .82, 0], m.dark);
      tube(g, [[x, 1.72, 0], [x, 2.04, 0], [x + .25, 2.1, -.25], [.65, 2.1, -.25]], .045, m.copper);
      tube(g, [[x, .77, 0], [x, .53, 0], [x + .23, .48, .12]], .037, m.steel);
    }
    box(g, [.48, .38, .18], [.55, .85, -.2], m.dark);
    box(g, [.6, .09, .09], [-.2, 2.2, -.24], m.steel);
    for (let i = 0; i < 6; i++) box(g, [.055, .16, .07], [-.42 + i * .09, 2.2, -.18], m.white);
    torus(g, .245, .012, [-.57, 1.25, .02], m.glow, 'y');
  }, [0, .35, 0]);
  let door;
  part(2, 'Hinged inspection panel', [-1.02, 1.43, .56], g => {
    door = new THREE.Group(); g.add(door);
    box(door, [1.98, 2.27, .065], [.99, 0, 0], m.white);
    box(door, [.88, .49, .03], [.99, .53, .05], m.dark);
    box(door, [.77, .38, .012], [.99, .53, .073], m.screen);
    for (let i = 0; i < 4; i++) box(door, [.53 - i * .08, .017, .007], [.99, .63 - i * .065, .083], m.glow);
    cylinder(door, .055, .04, [1.62, -.12, .065], m.dark, 'z');
    box(door, [.045, .27, .09], [1.62, -.23, .09], m.dark);
    for (const y of [-.75, .75]) cylinder(door, .035, .19, [0, y, 0], m.bright);
    for (let i = 0; i < 8; i++) box(door, [.62, .015, .008], [.99, -.56 - i * .044, .04], m.dark);
    label(door, 'EXPLORATION UNIT', [.8, .94, .04], .92, .13);
  }, [0, .2, .4]);
  part(2, 'Workbench', [2, 0, -.25], g => {
    box(g, [1.4, .08, 1.05], [0, 1.05, 0], m.timber);
    for (const x of [-.57, .57]) for (const z of [-.42, .42]) box(g, [.05, 1.02, .05], [x, .51, z], m.steel);
    box(g, [1.18, .05, .8], [0, .2, 0], m.steel);
    box(g, [.47, .05, .33], [-.2, 1.13, 0], m.dark);
    box(g, [.36, .012, .25], [-.2, 1.16, 0], m.screen);
    for (let i = 0; i < 3; i++) cylinder(g, .03, .3, [.25 + i * .1, 1.12, 0], m.bright, 'z');
  });
  part(2, 'Storage shelves', [-2.2, 0, -.4], g => {
    for (const x of [-.48, .48]) for (const z of [-.32, .32]) box(g, [.05, 2.5, .05], [x, 1.25, z], m.enamel);
    for (const y of [.15, .9, 1.65, 2.4]) box(g, [1.02, .055, .73], [0, y, 0], m.steel);
    for (const y of [.4, 1.18, 1.94]) {
      box(g, [.65, .43, .47], [0, y, 0], m.cardboard);
      box(g, [.07, .005, .47], [0, y + .218, 0], m.timber);
    }
  }, [-.2, .3, 0]);
  part(2, 'Inspection area', [0, .01, .2], g => {
    for (const z of [-2.1, 1.8]) box(g, [6.4, .012, .025], [0, 0, z], m.blue);
    for (const x of [-3.2, 3.2]) box(g, [.025, .012, 3.9], [x, 0, -.15], m.blue);
    // The ring identifies the access panel; it is not an invented safety zone.
    const ring = torus(g, .55, .012, [0, .02, 1.14], m.glow, 'y'); ring.scale.x = 1.3;
  }, [0, .05, 0]);

  // Merge the fixed surfaces inside each assembly. Hinges and robot joints
  // remain separate groups; repeated fins and fasteners cost one draw per material.
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
      const geometries = objects.map(object => {
        object.updateMatrix();
        return (object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone()).applyMatrix4(object.matrix);
      });
      const geometry = keep(new THREE.BufferGeometry());
      for (const attribute of ['position', 'normal', 'uv']) {
        const array = new Float32Array(geometries.reduce((sum, geo) => sum + geo.attributes[attribute].array.length, 0));
        let offset = 0;
        for (const geo of geometries) { array.set(geo.attributes[attribute].array, offset); offset += geo.attributes[attribute].array.length; }
        geometry.setAttribute(attribute, new THREE.BufferAttribute(array, geometries[0].attributes[attribute].itemSize));
      }
      objects.forEach(object => group.remove(object));
      geometries.forEach(geo => geo.dispose());
      mesh(group, geometry, mat);
    }
  }
  models.forEach(model => { mergeFixed(model); model.updateMatrixWorld(true); });
  parts.forEach((item, index) => {
    const siblings = parts.filter(candidate => candidate.chapter === item.chapter);
    item.index = siblings.indexOf(item); item.count = siblings.length;
    item.id = index;
  });
  return {
    models, parts,
    update(state) {
      const exploded = state.expansion;
      for (const item of parts) if (item.chapter === 0) item.group.position.addScaledVector(item.explode, exploded);
      rotor.rotation.x = exploded * .26;
      const cycle = state.operation;
      robotArm.rotation.y = -.4 + Math.sin(cycle * Math.PI) * .68;
      robotArm.rotation.z = -.12 + Math.sin(cycle * Math.PI * 2) * .16;
      robotForearm.rotation.z = -.3 + Math.sin(cycle * Math.PI * 2 + .3) * .32;
      robotHand.rotation.z = -robotForearm.rotation.z - robotArm.rotation.z;
      press.position.y = 1.9 - Math.sin(cycle * Math.PI) ** 2 * .24;
      cartons.forEach(carton => { carton.position.x += cycle; });
      rollers.forEach(roller => { roller.rotation.z = cycle * 5; });
      door.rotation.y = -state.inspection * Math.PI * .58;
      inside.visible = state.weights[2] > .01;
    },
  };
}
