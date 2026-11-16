import * as THREE from './vendor/three.min.js';

export function buildProduction({ part, kit }) {
  const { m, box, cylinder, profile, ring, torus, link, tube, bolt, bolts, label, display } = kit;
  part(1,'Roller conveyor',[0,0,.9],g => {
    for (const z of [-.57,.57]) {
      box(g,[7.1,.19,.085],[0,.95,z],m.steel,.016);
      box(g,[7.1,.035,.045],[0,1.08,z],m.bright,.008);
      for(const x of [-3.15,-1.1,1.1,3.15]) {
        box(g,[.085,.79,.085],[x,.5,z],m.steel,.008);
        cylinder(g,.026,.15,[x,.1,z],m.bright);
        cylinder(g,.09,.045,[x,.035,z],m.rubber);
        box(g,[.18,.13,.025],[x,.85,z+Math.sign(z)*.048],m.steel,.006);
        bolt(g,[x,.87,z+.065],'z',.017);
      }
      for(let x=-3.3;x<3.4;x+=.38) bolt(g,[x,.95,z+.048],'z',.014);
      link(g,[-3.1,.27,z],[-1.15,.8,z],.018,m.steel);
      link(g,[1.15,.8,z],[3.1,.27,z],.018,m.steel);
    }
    for (const x of [-3.15,-1.1,1.1,3.15]) box(g,[.06,.08,1.12],[x,.32,0],m.steel,.008);
    for(let i=0;i<43;i++) {
      const x=-3.36+i*.16;
      cylinder(g,.056,1.02,[x,1.025,0],m.bright,'z',.056,24);
      for(const z of [-.51,.51]) cylinder(g,.037,.07,[x,1.025,z],m.dark,'z',.037,16);
    }
    box(g,[5.8,.09,.22],[0,.62,-.45],m.dark,.01);
    for(let x=-2.7;x<2.8;x+=.25) box(g,[.025,.08,.23],[x,.62,-.45],m.steel,.004);
    cylinder(g,.15,.35,[-2.5,.73,-.77],m.enamel,'z');
    ring(g,.17,.055,.06,[-2.5,.73,-.55],m.steel,'z');
    tube(g,[[-2.5,.72,-.94],[-2.7,.59,-.8],[-2.4,.56,-.45],[-.5,.56,-.45]],.022,m.rubber);
  },[0,.28,0]);
  let robotArm, robotForearm, robotHand;
  function limb(parent, from, to, lower, upper) {
    const a=new THREE.Vector3(...from), delta=new THREE.Vector3(...to).sub(a), length=delta.length();
    const group=new THREE.Group(); group.position.copy(a); group.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()); parent.add(group);
    profile(group,[[0,0],[lower*.7,0],[lower,.05],[lower,.15],[upper,length-.12],[upper*.75,length],[0,length]],[0,0,0],m.white);
    torus(group,lower*.97,.007,[0,.16,0],m.dark,'y');
    return group;
  }
  function joint(parent, radius, position, depth=.32) {
    cylinder(parent,radius,depth,position,m.white,'z');
    const p=[position[0],position[1],position[2]+depth/2+.012];
    cylinder(parent,radius*.82,.035,p,m.blue,'z');
    torus(parent,radius*.84,.009,[p[0],p[1],p[2]+.02],m.steel,'z');
    for(let i=0;i<6;i++) {
      const a=i*Math.PI/3;
      bolt(parent,[p[0]+Math.cos(a)*radius*.62,p[1]+Math.sin(a)*radius*.62,p[2]+.022],'z',.014);
    }
  }
  part(1,'Articulated robot',[-1.5,0,-.85],g => {
    box(g,[1.08,.09,.94],[0,.06,0],m.steel,.018);
    for(const x of [-.42,.42]) for(const z of [-.34,.34]) bolt(g,[x,.12,z],'y',.027);
    profile(g,[[0,0],[.34,0],[.36,.05],[.3,.42],[.28,.54],[0,.54]],[0,.13,0],m.white);
    ring(g,.31,.08,.05,[0,.68,0],m.dark,'y');
    ring(g,.32,.08,.065,[0,.73,0],m.blue,'y');
    robotArm=new THREE.Group(); robotArm.name='Robot shoulder'; robotArm.position.y=.78; g.add(robotArm);
    joint(robotArm,.235,[0,.12,0],.44);
    limb(robotArm,[0,.12,0],[.32,1.35,0],.22,.16);
    box(robotArm,[.13,.37,.035],[.14,.63,.18],m.white,.035);
    for(const y of [.48,.77]) bolt(robotArm,[.14,y,.207],'z',.012);
    robotForearm=new THREE.Group(); robotForearm.name='Robot elbow'; robotForearm.position.set(.32,1.35,0); robotArm.add(robotForearm);
    joint(robotForearm,.22,[0,0,0],.36);
    limb(robotForearm,[0,0,0],[1.06,-.14,.48],.175,.12);
    robotHand=new THREE.Group(); robotHand.name='Robot wrist'; robotHand.position.set(1.06,-.14,.48); robotForearm.add(robotHand);
    joint(robotHand,.13,[0,-.03,0],.24);
    cylinder(robotHand,.09,.15,[0,-.16,0],m.dark);
    ring(robotHand,.115,.04,.035,[0,-.24,0],m.bright,'y');
    box(robotHand,[.34,.075,.22],[0,-.295,0],m.dark,.015);
    box(robotHand,[.27,.04,.24],[0,-.34,0],m.bright,.006);
    for(const x of [-.12,.12]) {
      box(robotHand,[.04,.18,.1],[x,-.43,0],m.dark,.004);
      box(robotHand,[.075,.028,.1],[x*.8,-.51,0],m.rubber,.004);
      bolt(robotHand,[x,-.38,.06],'z',.012);
    }
    // Each flexible cable belongs to its joint, so it follows the operation.
    tube(robotArm,[[0,.1,-.28],[-.19,.57,-.24],[-.08,1.25,-.23],[.23,1.49,-.2],[.38,1.34,-.19]],.032,m.rubber);
    tube(robotForearm,[[0,.1,-.22],[.25,.22,-.16],[.76,.05,.25],[1.05,-.06,.39]],.027,m.rubber);
    for(const y of [.43,.94]) box(robotArm,[.12,.06,.1],[y*.25,y,-.21],m.dark,.007);
    label(g,'FW / AUTOMATION',[0,.38,.307],.36,.09);
  });
  let sensor;
  part(1,'Inspection arch',[2.05,0,.9],g => {
    for(const z of [-.78,.78]) {
      box(g,[.15,2.4,.15],[0,1.25,z],m.steel,.012);
      box(g,[.43,.065,.38],[0,.045,z],m.steel,.008);
      for(const x of [-.14,.14]) bolt(g,[x,.085,z],'y',.022);
      box(g,[.028,2.16,.035],[-.08,1.3,z],m.dark,.003);
    }
    box(g,[.25,.23,1.74],[0,2.48,0],m.white,.025);
    box(g,[.015,.1,1.51],[-.135,2.48,0],m.dark,.004);
    sensor=new THREE.Group(); sensor.position.y=2.22; g.add(sensor);
    box(sensor,[.24,.18,.32],[0,0,0],m.dark,.015);
    cylinder(sensor,.052,.045,[0,-.111,0],m.bright);
    cylinder(sensor,.035,.008,[0,-.137,0],m.screen);
    box(sensor,[.008,.012,.045],[-.125,-.02,.08],m.amber,.003);
    tube(g,[[.09,2.23,-.1],[.13,2.35,-.45],[.12,2.3,-.74],[.12,.4,-.74]],.016,m.rubber);
    cylinder(g,.05,.06,[0,2.63,-.45],m.dark);
    cylinder(g,.039,.18,[0,2.75,-.45],m.glow);
    cylinder(g,.048,.025,[0,2.85,-.45],m.white);
  });
  // Separate bays assemble in order. Fine wire geometry replaces opaque glass.
  for(let bay=0;bay<3;bay++) part(1,`Safety mesh bay ${bay+1}`,[-2.15+bay*2.15,0,-1.95],g => {
    for(const x of [-1.075,1.075]) {
      box(g,[.065,2.26,.065],[x,1.16,0],m.enamel,.008);
      box(g,[.2,.045,.23],[x,.035,0],m.steel,.004);
      bolt(g,[x,.07,.07],'y',.018);
    }
    for(const y of [.2,2.2]) box(g,[2.12,.037,.035],[0,y,0],m.dark,.006);
    for(let i=0;i<25;i++) box(g,[.006,1.96,.006],[-1.02+i*.085,1.2,.006],m.steel,0);
    for(let i=0;i<23;i++) box(g,[2.08,.006,.006],[0,.25+i*.085,.01],m.steel,0);
    for(const x of [-1.045,1.045]) for(const y of [.27,2.12]) box(g,[.055,.06,.025],[x,y,.027],m.steel,.004);
  },[0,.32,-.12]);
  part(1,'Operator station',[3.25,0,-.7],g => {
    box(g,[.64,1.15,.48],[0,.62,0],m.white,.03);
    box(g,[.7,.065,.55],[0,.05,0],m.dark,.012);
    const head=new THREE.Group(); head.position.set(0,1.26,0); head.rotation.x=-.26; g.add(head);
    box(head,[.68,.42,.4],[0,0,0],m.white,.035);
    display(head,[0,.025,.211],.47,.25);
    cylinder(g,.055,.012,[.18,.92,.25],m.amber,'z');
    cylinder(g,.035,.04,[.18,.92,.27],m.red,'z');
    for(const x of [-.18,-.03]) cylinder(g,.025,.02,[x,.92,.255],x<-.1?m.blue:m.dark,'z');
    for(let i=0;i<7;i++) box(g,[.33,.013,.006],[0,.3+i*.038,.244],m.dark,.003);
    label(g,'PROCESS',[0,.65,.246],.38,.1);
    tube(g,[[0,.12,-.25],[0,.08,-.5],[-.5,.045,-.65],[-1,.045,-.65]],.022,m.rubber);
  });
  const cartons=[];
  for(let i=0;i<3;i++) cartons.push(part(1,`Moving carton ${i+1}`,[-2.7+i*1.9,1.365,.9],g => {
    box(g,[.67,.55,.65],[0,0,0],m.cardboard,.008);
    box(g,[.075,.003,.65],[0,.277,0],m.tape,.0005);
    box(g,[.075,.13,.004],[0,.21,.327],m.tape,.0005);
    box(g,[.001,.002,.62],[0,.28,0],m.dark,0);
    label(g,'FW / 03',[.12,-.04,.328],.21,.09);
  },[0,.34,0]));
  return {
    update(state) {
      const cycle=state.operation, wave=Math.sin(cycle*Math.PI);
      robotArm.rotation.y=.18+wave*.36;
      robotArm.rotation.z=-.08+Math.sin(cycle*Math.PI*2)*.1;
      robotForearm.rotation.z=-.08+Math.sin(cycle*Math.PI*2+.2)*.19;
      robotHand.rotation.z=-robotForearm.rotation.z-robotArm.rotation.z;
      sensor.position.y=2.22-wave*wave*.055;
      cartons.forEach((carton,i) => { carton.position.x=-2.7+i*1.9+cycle*.85; });
    },
  };
}
