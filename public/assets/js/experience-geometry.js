import * as THREE from './vendor/three.min.js';

// Shared manufactured shapes. Repeated fasteners and profiles reuse geometry;
// the model assembler batches fixed surfaces without losing joint pivots.
export function createWorkshop(keep) {
  const cache = new Map();
  const cached = (key, build) => {
    if (!cache.has(key)) cache.set(key, keep(build()));
    return cache.get(key);
  };
  const texture = (paint, w = 256, h = 256) => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
    paint(canvas.getContext('2d'), w, h);
    const map = keep(new THREE.CanvasTexture(canvas));
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    return map;
  };
  const grain = texture((c, w, h) => {
    const pixels = c.createImageData(w, h); let seed = 29;
    for (let i = 0; i < pixels.data.length; i += 4) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const v = 120 + (seed / 4294967296 - .5) * 65;
      pixels.data.set([v, v, v, 255], i);
    }
    c.putImageData(pixels, 0, 0);
  });
  grain?.repeat.set(5, 5);
  const brushed = texture((c, w, h) => {
    c.fillStyle = '#a1a1a1'; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y++) {
      const v = 145 + Math.sin(y * 12.7) * 17;
      c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(0, y, w, 1);
    }
  });
  const material = options => keep(new THREE.MeshStandardMaterial(options));
  const m = {
    enamel: material({ color: '#195675', metalness: .58, roughness: .29, bumpMap: grain, bumpScale: .002 }),
    blue: material({ color: '#008ec2', metalness: .48, roughness: .29, bumpMap: grain, bumpScale: .0015 }),
    steel: material({ color: '#a6b2ba', metalness: .9, roughness: .3, bumpMap: brushed, bumpScale: .0006 }),
    bright: material({ color: '#d2d9dc', metalness: .94, roughness: .19 }),
    dark: material({ color: '#25313a', metalness: .66, roughness: .35 }),
    white: material({ color: '#d6dadd', metalness: .28, roughness: .3, bumpMap: grain, bumpScale: .0007 }),
    rubber: material({ color: '#121c24', metalness: .04, roughness: .72 }),
    copper: material({ color: '#bb713d', metalness: .88, roughness: .25 }),
    brass: material({ color: '#ac8650', metalness: .82, roughness: .3 }),
    cardboard: material({ color: '#a18a65', roughness: .9, bumpMap: grain, bumpScale: .0015 }),
    tape: material({ color: '#b29e7c', roughness: .5 }),
    glow: material({ color: '#66c9e5', emissive: '#00aee9', emissiveIntensity: .35, roughness: .3 }),
    light: material({ color: '#edf2f3', emissive: '#e1eeff', emissiveIntensity: 1.2, roughness: .4 }),
    amber: material({ color: '#b18a33', roughness: .42 }),
    red: material({ color: '#9d382d', roughness: .4 }),
    screen: material({ color: '#183542', emissive: '#0b3348', emissiveIntensity: .2, roughness: .24, metalness: .18 }),
  };
  function mesh(parent, geo, mat, position = [0, 0, 0]) {
    const object = new THREE.Mesh(geo, mat); object.position.set(...position);
    object.castShadow = mat !== m.glow && mat !== m.light;
    object.receiveShadow = true; parent.add(object); return object;
  }
  function box(parent, size, position, mat = m.steel, bevel = .012) {
    const radius = Math.min(bevel, ...size.map(v => v * .2));
    const geo = cached(`box:${size}:${radius}`, () => {
      if (!radius) return new THREE.BoxGeometry(...size);
      const g = new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
      const p = g.attributes.position, n = g.attributes.normal, v = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) {
        const a = [p.getX(i), p.getY(i), p.getZ(i)];
        v.set(...a.map(x => Math.sign(x) * Math.max(0, Math.abs(x) - .25))).normalize();
        p.setXYZ(i, ...a.map((x, axis) => THREE.MathUtils.clamp(x * 2, -.5, .5) * (size[axis] - 2 * radius) + v.getComponent(axis) * radius));
        n.setXYZ(i, v.x, v.y, v.z);
      }
      return g;
    });
    return mesh(parent, geo, mat, position);
  }
  function cylinder(parent, radius, length, position, mat = m.steel, axis = 'y', top = radius, sides = 32) {
    const geo = cached(`cylinder:${radius}:${length}:${top}:${sides}`, () => new THREE.CylinderGeometry(top, radius, length, sides));
    const obj = mesh(parent, geo, mat, position);
    if (axis === 'x') obj.rotation.z = -Math.PI / 2;
    if (axis === 'z') obj.rotation.x = Math.PI / 2;
    return obj;
  }
  function profile(parent, points, position, mat = m.steel, axis = 'y', sides = 48) {
    const geo = cached(`lathe:${points}:${sides}`, () => new THREE.LatheGeometry(points.map(p => new THREE.Vector2(...p)), sides));
    const obj = mesh(parent, geo, mat, position);
    if (axis === 'x') obj.rotation.z = -Math.PI / 2;
    if (axis === 'z') obj.rotation.x = Math.PI / 2;
    return obj;
  }
  function ring(parent, outer, inner, depth, position, mat = m.steel, axis = 'x') {
    const b = Math.min(.008, depth / 5, (outer - inner) / 5), d = depth / 2;
    return profile(parent, [[inner, -d+b],[inner+b,-d],[outer-b,-d],[outer,-d+b],[outer,d-b],[outer-b,d],[inner+b,d],[inner,d-b],[inner,-d+b]], position, mat, axis);
  }
  function torus(parent, radius, tubeRadius, position, mat = m.steel, axis = 'x', arc = Math.PI * 2) {
    const geo = cached(`torus:${radius}:${tubeRadius}:${arc}`, () => new THREE.TorusGeometry(radius, tubeRadius, 8, 48, arc));
    const obj = mesh(parent, geo, mat, position);
    if (axis === 'x') obj.rotation.y = Math.PI / 2;
    if (axis === 'y') obj.rotation.x = Math.PI / 2;
    return obj;
  }
  function link(parent, from, to, radius, mat = m.steel, endRadius = radius) {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const obj = cylinder(parent, radius, a.distanceTo(b), a.clone().add(b).multiplyScalar(.5).toArray(), mat, 'y', endRadius);
    obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize()); return obj;
  }
  function tube(parent, points, radius, mat = m.steel, segments = 32) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), false, 'centripetal');
    return mesh(parent, keep(new THREE.TubeGeometry(curve, segments, radius, 8, false)), mat);
  }
  function bolt(parent, position, axis = 'y', size = .03, mat = m.bright) {
    cylinder(parent, size * 1.5, .012, position, m.steel, axis, size * 1.5, 16);
    const p = [...position]; p[{x:0,y:1,z:2}[axis]] += .014;
    cylinder(parent, size, .025, p, mat, axis, size, 6);
  }
  function bolts(parent, x, radius, count = 8, size = .035) {
    for (let i = 0; i < count; i++) {
      const a = i / count * Math.PI * 2;
      bolt(parent, [x, Math.sin(a) * radius, Math.cos(a) * radius], 'x', size);
    }
  }
  function label(parent, title, position, width = .5, height = .14) {
    const map = texture((c, w, h) => {
      c.fillStyle = '#bac5cc'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#263d4b'; c.font = '600 28px sans-serif'; c.fillText(title, 18, 42);
      c.fillRect(18, 58, w-36, 2); c.font = '15px monospace'; c.fillText('FROSTWATER  /  STUDIO STUDY', 18, 85);
      for (let i=0; i<32; i++) c.fillRect(18+i*3, 98, 1+(i%2), 13);
    }, 512, 128);
    if (map) map.colorSpace = THREE.SRGBColorSpace;
    const mat = keep(new THREE.MeshStandardMaterial({ color: '#c1cbd0', map, metalness: .65, roughness: .4 }));
    return mesh(parent, cached(`plane:${width}:${height}`, () => new THREE.PlaneGeometry(width,height)), mat, position);
  }
  function display(parent, position, width = .45, height = .28) {
    box(parent, [width+.07,height+.07,.035], position, m.rubber, .015);
    const p = [...position]; p[2] += .022;
    box(parent, [width,height,.008], p, m.screen, .005);
    for (let i = 0; i < 3; i++) box(parent, [width*(.62-i*.13),.008,.003], [p[0]-width*.08,p[1]+height*.2-i*height*.19,p[2]+.006], m.glow, 0);
  }
  return { m, mesh, box, cylinder, profile, ring, torus, link, tube, bolt, bolts, label, display };
}
