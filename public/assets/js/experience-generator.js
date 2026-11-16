import * as THREE from './vendor/three.min.js';

export function buildGenerator({ part, models, keep, kit }) {
  const { m, mesh, box, cylinder, profile, ring, torus, tube, link, bolt, bolts, label } = kit;
  function casing(g, start) {
    const end = start + Math.PI, shape = new THREE.Shape();
    shape.absarc(0, 0, .74, start, end, false);
    shape.lineTo(Math.cos(end)*.672, Math.sin(end)*.672);
    shape.absarc(0, 0, .672, end, start, true); shape.closePath();
    const geo = keep(new THREE.ExtrudeGeometry(shape, { depth: 2.04, steps: 1, bevelEnabled: true, bevelSize: .007, bevelThickness: .007, bevelSegments: 2, curveSegments: 32 }));
    geo.translate(0, 0, -1.02); geo.rotateY(Math.PI/2); mesh(g, geo, m.enamel);
    for (let i=0; i<13; i++) {
      const a = start + .12 + i/12*(Math.PI-.24);
      const fin = box(g, [1.92,.105,.026], [0,Math.sin(a)*.778,Math.cos(a)*.778], m.enamel,.007);
      fin.rotation.x = Math.PI/2-a;
    }
    // Narrow split flanges give the shell an intentional manufacturing seam.
    for (const z of [-.716,.716]) {
      box(g,[2.08,.027,.07],[0,start===0?.018:-.018,z],m.enamel,.006);
      for (const x of [-.83,-.28,.28,.83]) if (start===0) bolt(g,[x,.037,z],'y',.018);
    }
    for (const x of [-.995,.995]) {
      const edge = torus(g,.712,.013,[x,0,0],m.steel,'x',Math.PI);
      // A torus in XY becomes YZ: its upper half is positive Y.
      if (start > 0) edge.rotation.x = Math.PI;
    }
  }
  part(0,'Machined mounting feet',[0,0,0],g => {
    for (const x of [-.82,.82]) for (const z of [-.62,.62]) {
      box(g,[.52,.13,.45],[x,.095,z],m.enamel,.023);
      box(g,[.27,.3,.17],[x,.28,z],m.enamel,.022);
      const rib = box(g,[.13,.31,.08],[x,.29,z+Math.sign(z)*.1],m.enamel,.012); rib.rotation.x = Math.sign(z)*-.24;
      box(g,[.5,.025,.43],[x,.017,z],m.rubber,.005);
      for (const dx of [-.15,.15]) bolt(g,[x+dx,.167,z+Math.sign(z)*.1],'y',.031);
    }
  },[0,.12,0]);
  part(0,'Lower cast housing',[0,1.03,0],g => {
    casing(g,Math.PI);
    box(g,[.7,.2,.025],[0,-.25,.748],m.bright,.012);
    label(g,'FW / ELECTRIC DRIVE',[0,-.25,.763],.65,.155);
    for (const x of [-.31,.31]) bolt(g,[x,-.25,.77],'z',.012);
  },[0,.25,0]);
  part(0,'Upper cast housing',[0,1.03,0],g => casing(g,0),[0,.45,0],[0,1.28,0]);
  const rotor = part(0,'Rotor and copper windings',[0,1.03,0],g => {
    profile(g,[[0,-1.65],[.125,-1.65],[.14,-1.62],[.14,-.84],[.21,-.81],[.21,.81],[.14,.84],[.14,1.74],[.126,1.76],[0,1.76]], [0,0,0],m.bright,'x');
    cylinder(g,.446,1.5,[0,0,0],m.steel,'x',.446,64);
    for (let i=0;i<46;i++) cylinder(g,.453,.008,[-.735+i*.032,0,0],i%5===0?m.dark:m.bright,'x',.453,48);
    for (const x of [-.84,.84]) {
      cylinder(g,.37,.13,[x,0,0],m.dark,'x');
      torus(g,.452,.078,[x,0,0],m.copper);
      for (let i=0;i<9;i++) {
        const a=-Math.PI/2+i*Math.PI/8;
        torus(g,.452+Math.cos(a)*.079,.009,[x+Math.sin(a)*.079,0,0],m.copper);
      }
      for (let i=0;i<12;i++) {
        const a=i*Math.PI/6, sin=Math.sin(a), cos=Math.cos(a);
        tube(g,[[x-.082,sin*.42,cos*.42],[x-.09,sin*.51,cos*.51],[x+.08,sin*.53,cos*.53],[x+.1,sin*.42,cos*.42]],.012,m.copper,14);
      }
      ring(g,.215,.143,.065,[x+Math.sign(x)*.15,0,0],m.bright);
    }
    box(g,[.38,.045,.06],[1.48,.14,0],m.steel,.006);
    for (const x of [-1.18,1.2]) torus(g,.143,.008,[x,0,0],m.dark);
  },[0,.5,0],[0,.20,0]);
  for (const d of [-1,1]) {
    part(0,d<0?'Rear bearing plate':'Drive end flange',[d*1.115,1.03,0],g => {
      ring(g,.748,.152,.15,[0,0,0],m.enamel);
      ring(g,.73,.62,.015,[-d*.084,0,0],m.rubber);
      ring(g,.435,.154,.14,[d*.13,0,0],m.steel);
      ring(g,.28,.152,.11,[d*.23,0,0],m.bright);
      ring(g,.179,.143,.026,[d*.295,0,0],m.rubber);
      torus(g,.41,.009,[d*.205,0,0],m.bright);
      bolts(g,d*.095,.63,8,.036);
      for(let i=0;i<8;i++) {
        const a=i*Math.PI/4;
        const rib=box(g,[.052,.22,.045],[d*.09,Math.sin(a)*.5,Math.cos(a)*.5],m.enamel,.006);
        rib.rotation.x=Math.PI/2-a;
      }
    },[d*.4,.1,0],[d*.53,0,0]);
  }
  part(0,'Fan and protective grille',[-1.37,1.03,0],g => {
    cylinder(g,.14,.17,[0,0,0],m.rubber,'x');
    for(let i=0;i<9;i++) {
      const a=i*Math.PI*2/9;
      const blade=box(g,[.055,.36,.13],[0,Math.sin(a)*.31,Math.cos(a)*.31],m.dark,.02);
      blade.rotation.x=Math.PI/2-a; blade.rotation.y=.3;
    }
    for(const r of [.18,.3,.42,.54,.62]) torus(g,r,.012,[-.16,0,0],m.dark);
    for(let i=0;i<12;i++) {
      const a=i*Math.PI/6;
      link(g,[-.17,0,0],[-.17,Math.sin(a)*.62,Math.cos(a)*.62],.009,m.steel);
    }
    ring(g,.64,.61,.12,[-.12,0,0],m.enamel);
  },[-.5,.1,0],[-.97,0,0]);
  part(0,'Terminal enclosure',[.1,1.99,-.06],g => {
    box(g,[.44,.09,.36],[0,-.17,0],m.enamel,.014);
    box(g,[.68,.26,.55],[0,0,0],m.enamel,.018);
    box(g,[.69,.013,.56],[0,.138,0],m.rubber,.007);
    box(g,[.73,.04,.6],[0,.164,0],m.steel,.014);
    for(const x of [-.28,.28]) for(const z of [-.21,.21]) bolt(g,[x,.191,z],'y',.02);
    cylinder(g,.084,.08,[.37,-.015,0],m.dark,'x',.084,6);
    ring(g,.078,.049,.13,[.45,-.015,0],m.steel);
    ring(g,.062,.043,.025,[.523,-.015,0],m.rubber);
  },[0,.5,0],[0,1.62,0]);
  models[0].scale.setScalar(1.8);
  return { update(state) { rotor.rotation.x = state.expansion*.18; } };
}
