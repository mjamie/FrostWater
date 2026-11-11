/* Visual effects are independent from navigation and the contact form. */
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.className='network-background';canvas.setAttribute('aria-hidden','true');
  document.querySelector('main').prepend(canvas);
  const ctx=canvas.getContext('2d');
  if(ctx) {
    let width=0,height=0,frame=0,last=0,time=0;
    const nodes=Array.from({length:50},()=>({x:Math.random(),y:Math.random(),vx:(Math.random()-.5)*30,vy:(Math.random()-.5)*30}));
    function resize(){width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);restart();}
    function draw(stamp=0){
      frame=0;const dt=motion.matches?0:Math.min((stamp-last)/1000||0,.05);last=stamp;time+=dt;
      ctx.clearRect(0,0,width,height);
      nodes.forEach((node,i)=>{
        node.x+=node.vx*dt/width;node.y+=node.vy*dt/height;
        if(node.x<0||node.x>1){node.vx*=-1;node.x=Math.max(0,Math.min(1,node.x));}
        if(node.y<0||node.y>1){node.vy*=-1;node.y=Math.max(0,Math.min(1,node.y));}
        const x=node.x*width,y=node.y*height;
        ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fillStyle=`rgba(96,165,250,${.3+Math.sin(time+i)*.2})`;ctx.fill();
        nodes.slice(i+1).forEach(other=>{const ox=other.x*width,oy=other.y*height,distance=Math.hypot(x-ox,y-oy);if(distance<150){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(ox,oy);ctx.strokeStyle=`rgba(96,165,250,${(1-distance/150)*.2})`;ctx.stroke();}});
      });
      if(!motion.matches&&!document.hidden)frame=requestAnimationFrame(draw);
    }
    function restart(){cancelAnimationFrame(frame);last=performance.now();if(!document.hidden)draw(last);}
    addEventListener('resize',resize);document.addEventListener('visibilitychange',restart);motion.addEventListener('change',restart);resize();
  }
  const headline=document.querySelector('h1 .text-primary');
  const phrases=['THE REAL WORLD.','DESIGN REVIEWS.','HANDS-ON TRAINING.'];
  headline.setAttribute('aria-label',phrases[0]);
  headline.innerHTML='<span aria-hidden="true" class="typed-text"></span><span aria-hidden="true" class="typing-cursor">|</span>';
  const typed=headline.querySelector('.typed-text');let phrase=0,length=phrases[0].length,deleting=false,timer;
  function type(){
    if(motion.matches||document.hidden)return;
    if(deleting){length--;if(length===0){deleting=false;phrase=(phrase+1)%phrases.length;}}
    else length++;
    typed.textContent=phrases[phrase].slice(0,length);
    let delay=deleting?30:80;
    if(!deleting&&length>=phrases[phrase].length){deleting=true;delay=2000;}
    timer=setTimeout(type,delay);
  }
  function resetTyping(){clearTimeout(timer);typed.textContent=phrases[0];phrase=0;length=phrases[0].length;deleting=true;if(!motion.matches&&!document.hidden)timer=setTimeout(type,2000);}
  resetTyping();motion.addEventListener('change',resetTyping);document.addEventListener('visibilitychange',resetTyping);
  const cards=document.querySelectorAll('#services .group.relative.overflow-hidden.rounded-xl,#industries .group.relative.overflow-hidden.rounded-xl,#work .group.relative.overflow-hidden.rounded-xl');
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}}),{threshold:.1});
  cards.forEach((card,i)=>{card.classList.add('effect-card');card.style.setProperty('--reveal-delay',`${i%6*80}ms`);if(!motion.matches){card.classList.add('reveal');observer.observe(card);}card.addEventListener('pointermove',event=>{const rect=card.getBoundingClientRect();card.style.setProperty('--mouse-x',`${event.clientX-rect.left}px`);card.style.setProperty('--mouse-y',`${event.clientY-rect.top}px`);});});
  const header=document.querySelector('header');
  function scroll(){header.classList.toggle('scrolled',scrollY>50);}scroll();addEventListener('scroll',scroll,{passive:true});
  // Preserve the rotating industry highlights and six-step process animation.
  function asButton(el){const button=document.createElement('button');button.type='button';button.className=el.className;button.innerHTML=el.innerHTML;el.replaceWith(button);return button;}
  const pills=[...document.querySelectorAll('#industries span')].filter(el=>el.classList.contains('rounded-full')&&el.querySelector('svg')&&el.querySelector('span')).map(asButton);
  const stepCards=[...document.querySelectorAll('#about .group.relative.rounded-xl')];
  const indicators=[...document.querySelectorAll('#about span')].filter(el=>el.querySelector('.font-bold')).map(asButton);
  const progress=document.querySelector('#about .h-1.rounded-full.overflow-hidden > div');
  pills.forEach(el=>{el.classList.add('industry-highlight');el.addEventListener('click',()=>{industry=pills.indexOf(el);paint();});});
  stepCards.forEach(el=>el.classList.add('process-card'));
  let industry=0,step=0;
  function paint(){pills.forEach((el,i)=>{el.classList.toggle('active-highlight',i===industry);el.setAttribute('aria-pressed',String(i===industry));});stepCards.forEach((el,i)=>{el.classList.toggle('active-step',i===step);el.classList.toggle('past-step',i<step);});indicators.forEach((el,i)=>{el.classList.toggle('active-highlight',i<=step);el.setAttribute('aria-pressed',String(i===step));});if(progress)progress.style.width=`${(step+1)/6*100}%`;}
  indicators.forEach((el,i)=>el.addEventListener('click',()=>{step=i;paint();}));
  paint();setInterval(()=>{if(motion.matches||document.hidden)return;industry=(industry+1)%Math.max(pills.length,1);const rect=document.querySelector('#about').getBoundingClientRect();if(rect.top<innerHeight&&rect.bottom>0)step=(step+1)%6;paint();},3000);
})();
