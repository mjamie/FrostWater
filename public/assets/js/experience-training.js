import * as THREE from './vendor/three.min.js';

export function buildTraining({ part, models, kit }) {
  const { m, box, cylinder, profile, ring, torus, link, tube, bolt, label, display } = kit;
  part(2,'Task lighting frame',[.65,0,-.85],g => {
    for(const x of [-2,2]) {
      box(g,[.095,3.25,.095],[x,1.66,0],m.steel,.009);
      box(g,[.3,.055,.3],[x,.045,0],m.steel,.007);
      for(const dx of [-.1,.1]) bolt(g,[x+dx,.08,.08],'y',.018);
    }
    box(g,[4.1,.12,.12],[0,3.29,0],m.steel,.012);
    for(const x of [-1.3,1.3]) {
      box(g,[.06,.15,.22],[x,3.2,.08],m.dark,.006);
      bolt(g,[x,3.28,.07],'z',.018);
    }
    box(g,[2.9,.09,.2],[0,3.12,.15],m.white,.032);
    box(g,[2.75,.015,.145],[0,3.069,.15],m.light,.006);
    tube(g,[[1.43,3.12,.15],[1.8,3.13,.1],[1.95,2.94,0],[1.95,.35,0]],.012,m.rubber);
  },[0,.3,-.15]);
  part(2,'Folded steel cabinet',[0,0,0],g => {
    box(g,[1.98,.14,1.01],[0,.17,0],m.dark,.025);
    for(const x of [-.95,.95]) {
      box(g,[.075,2.5,1],[x,1.47,0],m.white,.017);
      box(g,[.09,2.42,.06],[x,1.47,.51],m.white,.008);
      box(g,[.025,2.33,.028],[x*.94,1.47,.485],m.rubber,.005);
    }
    for(const y of [.27,2.71]) box(g,[1.97,.09,1.03],[0,y,0],m.white,.018);
    box(g,[1.91,2.42,.055],[0,1.47,-.5],m.white,.012);
    box(g,[1.73,2.24,.035],[0,1.47,-.451],m.enamel,.012);
    for(const x of [-.81,.81]) for(const y of [.43,2.48]) bolt(g,[x,y,-.425],'z',.022);
    for(const x of [-.77,.77]) for(const z of [-.34,.34]) {
      cylinder(g,.055,.15,[x,.1,z],m.bright);
      cylinder(g,.075,.045,[x,.035,z],m.rubber);
    }
    for(const y of [.29,2.67]) box(g,[1.77,.028,.03],[0,y,.487],m.rubber,.005);
    for(const x of [-.81,.81]) box(g,[.04,.11,.07],[x,.33,.49],m.steel,.006);
  });
  let selection;
  part(2,'Serviceable filter assembly',[0,0,0],g => {
    for(const x of [-.43,.38]) {
      const y=1.43;
      profile(g,[[0,-.59],[.075,-.59],[.078,-.51],[.17,-.47],[.185,-.41],[.185,.4],[.17,.46],[.078,.51],[.075,.59],[0,.59]],[x,y,0],m.steel);
      for(const dy of [-.43,.43]) {
        ring(g,.219,.12,.06,[x,y+dy,0],m.bright,'y');
        torus(g,.19,.012,[x,y+dy-.035,0],m.rubber,'y');
        for(const dz of [-.145,.145]) for(const dx of [-.145,.145]) bolt(g,[x+dx,y+dy+.037,dz],'y',.015);
      }
      for(const dy of [-.23,.22]) {
        ring(g,.193,.182,.045,[x,y+dy,0],m.bright,'y');
        box(g,[.37,.065,.06],[x,y+dy,-.23],m.steel,.008);
        link(g,[x-.14,y+dy,-.2],[x-.14,y+dy,-.42],.017,m.steel);
        link(g,[x+.14,y+dy,-.2],[x+.14,y+dy,-.42],.017,m.steel);
        for(const dx of [-.16,.16]) bolt(g,[x+dx,y+dy,.12],'z',.013);
      }
      for(const dy of [-.65,.65]) {
        cylinder(g,.055,.15,[x,y+dy,0],m.steel);
        cylinder(g,.069,.055,[x,y+dy,0],m.bright,'y',.069,6);
        torus(g,.055,.008,[x,y+dy-.04,0],m.dark,'y');
      }
      tube(g,[[x,2.09,0],[x,2.3,0],[x,2.38,-.14],[x+(x<0?.18:-.18),2.38,-.21]],.028,m.copper);
      tube(g,[[x,.78,0],[x,.49,0],[x,.4,-.15],[x,.4,-.33]],.028,m.steel);
      cylinder(g,.057,.105,[x,.7,0],m.brass);
      cylinder(g,.032,.09,[x,.7,.075],m.steel,'z');
      box(g,[.21,.025,.04],[x+.06,.7,.127],m.blue,.008);
      bolt(g,[x,.7,.15],'z',.014);
      label(g,'FILTER',[x,y,.188],.19,.065);
    }
    box(g,[.65,.04,.06],[0,2.4,-.26],m.steel,.006);
    for(let i=0;i<4;i++) {
      box(g,[.12,.22,.11],[-.22+i*.145,2.36,-.22],m.white,.012);
      bolt(g,[-.22+i*.145,2.41,-.153],'z',.014);
      tube(g,[[-.22+i*.145,2.25,-.22],[-.22+i*.145,2.08,-.28],[.67,1.98-i*.045,-.32],[.7,.6,-.33]],.009,m.rubber,20);
    }
    for(const y of [.59,1.43,2.04]) box(g,[.075,.06,.045],[.7,y,-.31],m.steel,.004);
    cylinder(g,.082,.04,[-.43,2.14,.08],m.dark,'z');
    cylinder(g,.068,.006,[-.43,2.14,.105],m.white,'z');
    const needle=box(g,[.005,.051,.003],[-.42,2.15,.111],m.dark,0); needle.rotation.z=-.6;
    selection=new THREE.Group(); selection.name='Selected service module'; g.add(selection);
    // Sparse corner brackets suggest a selectable component without a neon box.
    for(const x of [.125,.635]) for(const y of [.82,2.04]) {
      const dx=x<.3?1:-1, dy=y<1?1:-1;
      box(selection,[.09,.007,.007],[x+dx*.045,y,.25],m.glow,.002);
      box(selection,[.007,.1,.007],[x,y+dy*.05,.25],m.glow,.002);
      box(selection,[.007,.007,.12],[x,y,.19],m.glow,.002);
    }
  },[0,.25,0]);
  let door;
  part(2,'Hinged access door',[-.99,1.47,.55],g => {
    door=new THREE.Group(); door.name='Access door hinge'; g.add(door);
    box(door,[1.96,2.43,.055],[.98,0,0],m.white,.02);
    for(const x of [.055,1.905]) {
      box(door,[.026,2.33,.026],[x,0,-.041],m.rubber,.006);
      box(door,[.055,2.36,.06],[x,0,-.056],m.white,.008);
    }
    for(const y of [-1.16,1.16]) {
      box(door,[1.85,.028,.027],[.98,y,-.041],m.rubber,.006);
      box(door,[1.85,.05,.06],[.98,y,-.057],m.white,.008);
    }
    for(const y of [-.83,.83]) {
      cylinder(door,.032,.17,[0,y,0],m.bright);
      box(door,[.13,.15,.025],[.05,y,-.02],m.steel,.008);
      bolt(door,[.08,y,.025],'z',.016);
    }
    for(const blockY of [-.82,.82]) for(let i=0;i<6;i++) {
      box(door,[.72,.016,.008],[.98,blockY+i*.04,.031],m.dark,.006);
      box(door,[.72,.013,.02],[.98,blockY+i*.04+.012,.036],m.white,.005);
      box(door,[.72,.015,.006],[.98,blockY+i*.04,-.031],m.dark,.004);
    }
    box(door,[.1,.31,.03],[1.73,-.15,.043],m.dark,.018);
    box(door,[.038,.23,.075],[1.73,-.14,.088],m.steel,.014);
    cylinder(door,.023,.014,[1.73,-.32,.07],m.dark,'z');
    display(door,[.94,.35,.047],.62,.32);
    label(door,'FW / SERVICE UNIT',[.94,-.18,.03],.62,.11);
    for(const y of [-.84,.84]) box(door,[.04,.12,.06],[1.86,y,-.1],m.steel,.005);
  },[0,.2,.25]);
  part(2,'Stainless service bench',[1.91,0,-.1],g => {
    box(g,[1.41,.075,.94],[0,1.02,0],m.steel,.018);
    box(g,[1.35,.12,.025],[0,.965,.453],m.steel,.009);
    for(const x of [-.6,.6]) for(const z of [-.36,.36]) {
      box(g,[.06,.93,.06],[x,.5,z],m.steel,.008);
      cylinder(g,.047,.055,[x,.045,z],m.rubber);
    }
    box(g,[1.25,.035,.77],[0,.23,0],m.steel,.008);
    box(g,[.43,.035,.3],[-.24,1.075,.03],m.rubber,.018);
    box(g,[.36,.005,.235],[-.24,1.096,.03],m.screen,.01);
    for(const x of [.16,.32]) {
      cylinder(g,.023,.24,[x,1.08,.02],m.bright,'z',.023,16);
      cylinder(g,.037,.12,[x,1.08,.17],x<.2?m.blue:m.dark,'z',.032,16);
      cylinder(g,.013,.06,[x,1.08,-.125],m.steel,'z',.007,12);
    }
    ring(g,.055,.03,.014,[.5,1.075,-.1],m.bright,'y');
    box(g,[.035,.014,.23],[.5,1.075,.035],m.bright,.005);
    for(const x of [-.57,.57]) box(g,[.045,.53,.045],[x,1.32,-.39],m.steel,.007);
    box(g,[1.4,.045,.45],[0,1.6,-.19],m.steel,.012);
    box(g,[.45,.18,.31],[-.25,1.71,-.18],m.enamel,.02);
    for(const x of [.25,.44]) {
      cylinder(g,.055,.24,[x,1.74,-.21],m.steel);
      cylinder(g,.035,.045,[x,1.88,-.21],m.dark);
    }
  });
  models[2].scale.setScalar(1.25);
  return { update(state) {
    door.rotation.y=-state.inspection*Math.PI*.58;
    selection.visible=state.inspection>.12;
  } };
}
