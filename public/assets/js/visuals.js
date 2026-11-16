/* Visual effects are independent from navigation and the contact form. */
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  // The architectural introduction owns its scroll-driven scene.
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
