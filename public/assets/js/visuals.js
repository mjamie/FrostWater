/* Visual effects are independent from navigation and the contact form. */
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  // The architectural introduction owns its scroll-driven scene.
  const cards=document.querySelectorAll('#services .group.relative.overflow-hidden.rounded-xl,#industries .group.relative.overflow-hidden.rounded-xl,#work .group.relative.overflow-hidden.rounded-xl');
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}}),{threshold:.1});
  cards.forEach((card,i)=>{
    card.classList.add('effect-card');
    card.style.setProperty('--reveal-delay',`${i%6*80}ms`);
    if(!motion.matches){card.classList.add('reveal');observer.observe(card);}
    // Service and industry cards share a small CSS hover; only portfolio cards follow the pointer.
    if(card.closest('#work')) card.addEventListener('pointermove',event=>{
      const rect=card.getBoundingClientRect();
      card.style.setProperty('--mouse-x',`${event.clientX-rect.left}px`);
      card.style.setProperty('--mouse-y',`${event.clientY-rect.top}px`);
    });
  });
  const header=document.querySelector('header');
  function scroll(){header.classList.toggle('scrolled',scrollY>50);}scroll();addEventListener('scroll',scroll,{passive:true});
})();
