'use strict';

(() => {
  const section = document.querySelector('#contact');
  const build = section?.querySelector('.contact-build');
  const form = build?.querySelector('.contact-form');
  const copy = section?.querySelector('.contact-copy');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const contrast = matchMedia('(forced-colors: active)');
  if (!form || !copy || motion.matches || contrast.matches ||
      !Element.prototype.animate || !window.IntersectionObserver ||
      !CSS.supports('clip-path', 'inset(0)')) return;

  const narrow = matchMedia('(max-width: 760px)');
  const animations = new Set();
  const textGroups = [];
  let observer;
  let finished = false;
  let viewportWidth = innerWidth;
  const random = (min, max) => min + Math.random() * (max - min);

  function animate(element, frames, options) {
    const animation = element.animate(frames, { fill: 'both', ...options });
    animations.add(animation);
    // Finished animations are retained until their fill can be removed safely.
    animation.finished.catch(() => {});
    return animation;
  }

  function release(group) {
    group.forEach(animation => { animation.cancel(); animations.delete(animation); });
  }

  function restoreText() {
    textGroups.forEach(group => {
      if (group.visual.isConnected) group.element.replaceChildren(...group.original);
    });
  }

  function finish() {
    if (finished) return;
    finished = true;
    observer?.disconnect();
    build.dataset.buildState = 'complete';
    copy.dataset.copyState = 'complete';
    restoreText();
    animations.forEach(animation => animation.cancel());
    animations.clear();
    section.querySelectorAll('.contact-pixels, .contact-glitch').forEach(element => element.remove());
    section.removeEventListener('focusin', finish);
    section.removeEventListener('pointerdown', finish);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('beforeprint', finish);
    document.removeEventListener('visibilitychange', onVisibility);
    motion.removeEventListener('change', onPreference);
    contrast.removeEventListener('change', onPreference);
  }

  function settle() {
    if (build.dataset.buildState === 'complete' && copy.dataset.copyState === 'complete') finish();
  }

  function prepareText() {
    const targets = copy.querySelectorAll('h2, .contact-note, .contact-email > span, .company-email');
    targets.forEach(element => {
      const original = [...element.childNodes];
      const source = document.createElement('span');
      source.className = 'contact-type-source';
      const visual = document.createElement('span');
      visual.className = 'contact-type-visual';
      visual.setAttribute('aria-hidden', 'true');
      original.forEach(node => visual.append(node.cloneNode(true)));
      const walker = document.createTreeWalker(visual, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      const characters = [];
      nodes.forEach(node => {
        const fragment = document.createDocumentFragment();
        for (const value of node.textContent) {
          const character = document.createElement('span');
          character.className = 'contact-character';
          character.textContent = value;
          characters.push(character);
          fragment.append(character);
        }
        node.replaceWith(fragment);
      });
      source.append(...original);
      element.replaceChildren(source, visual);
      textGroups.push({ element, original, visual, characters });
    });
  }

  async function shock() {
    const bounds = copy.getBoundingClientRect();
    const heading = copy.querySelector('h2');
    const note = copy.querySelector('.contact-note');
    const headingStyle = getComputedStyle(heading);
    const lineHeight = parseFloat(headingStyle.lineHeight);
    const fontSize = parseFloat(headingStyle.fontSize);
    const headingTop = heading.getBoundingClientRect().top - bounds.top;
    const noteTop = note.getBoundingClientRect().top - bounds.top;
    const noteLineHeight = parseFloat(getComputedStyle(note).lineHeight);
    const padding = getComputedStyle(copy).padding;
    // Cut through the actual glyphs. The rest of the copy remains stationary.
    const slices = [
      { top: headingTop + lineHeight * .48, height: fontSize * .13, pull: 9 },
      { top: headingTop + lineHeight * 1.43, height: fontSize * .16, pull: -8 },
      { top: headingTop + lineHeight * 1.7, height: fontSize * .07, pull: 5 },
      { top: noteTop + noteLineHeight * .51, height: 2, pull: 3 },
    ];
    const layer = document.createElement('div');
    layer.className = 'contact-glitch';
    layer.setAttribute('aria-hidden', 'true');
    layer.inert = true;
    const template = document.createElement('div');
    template.className = 'contact-glitch-fragment';
    template.style.padding = padding;
    [...copy.children].forEach(element => template.append(element.cloneNode(true)));
    template.querySelectorAll('[id], a').forEach(element => {
      element.removeAttribute('id');
      element.removeAttribute('href');
    });
    // A fixed mask removes only the strips that will move. This is real letter
    // displacement rather than a second copy sliding across intact text.
    const stops = ['#000 0px'];
    slices.forEach(slice => {
      const bottom = slice.top + slice.height;
      stops.push(`#000 ${slice.top}px`, `transparent ${slice.top}px`, `transparent ${bottom}px`, `#000 ${bottom}px`);
    });
    stops.push('#000 100%');
    const base = template.cloneNode(true);
    base.style.maskImage = `linear-gradient(to bottom, ${stops.join(',')})`;
    layer.append(base);
    const fragments = slices.map(slice => {
      const fragment = template.cloneNode(true);
      fragment.classList.add('contact-glitch-slice');
      fragment.style.clipPath = `inset(${slice.top}px 0 ${bounds.height - slice.top - slice.height}px 0)`;
      layer.append(fragment);
      return fragment;
    });
    copy.append(layer);
    // A single sharp tug and short recoil; only transforms animate, not layout.
    const impulses = fragments.map((fragment, index) => {
      const pull = slices[index].pull * (narrow.matches ? .75 : 1);
      return animate(fragment, [
        { transform: 'translateX(0) scaleX(1)', offset: 0 },
        { transform: `translateX(${pull}px) scaleX(1.012)`, offset: .08 },
        { transform: `translateX(${pull}px) scaleX(1.012)`, offset: .3 },
        { transform: `translateX(${-pull * .35}px) scaleX(1)`, offset: .42 },
        { transform: `translateX(${pull * .15}px) scaleX(1)`, offset: .62 },
        { transform: 'translateX(0) scaleX(1)', offset: .8 },
        { transform: 'translateX(0) scaleX(1)', offset: 1 },
      ].map(frame => ({ ...frame, easing: 'steps(1, end)' })), { duration: 240, easing: 'linear' });
    });
    const startTime = document.timeline.currentTime;
    impulses.forEach(animation => { animation.startTime = startTime; });
    await Promise.all(impulses.map(animation => animation.finished));
    copy.dataset.copyState = 'complete';
    layer.remove();
    release(impulses);
  }

  async function typeCopy() {
    if (finished || copy.dataset.copyState !== 'waiting') return;
    copy.dataset.copyState = 'typing';
    const typing = [];
    let delay = 0;
    textGroups.forEach((group, index) => {
      const interval = index === 0 ? 30 : 10;
      group.characters.forEach(character => {
        typing.push(animate(character, [{ opacity: 0 }, { opacity: 1 }], {
          delay, duration: 65, easing: 'steps(1, start)',
        }));
        delay += interval;
      });
      delay += index === 0 ? 110 : 70;
    });
    try {
      await Promise.all(typing.map(animation => animation.finished));
      if (finished) return;
      restoreText();
      release(typing);
      copy.dataset.copyState = 'shocking';
      await shock();
      if (finished) return;
      copy.dataset.copyState = 'complete';
      settle();
    } catch { finish(); }
  }

  async function assemble() {
    if (finished || build.dataset.buildState !== 'waiting') return;
    build.dataset.buildState = 'building';
    const { width, height } = form.getBoundingClientRect();
    const fields = [...form.querySelectorAll('.contact-field, .email-draft-button, .email-hint:not(#contact-status)')];
    // All geometry is read once. The reveal does not resize the form or its fields.
    const top = form.getBoundingClientRect().top;
    const offsets = fields.map(element => element.getBoundingClientRect().top - top);
    const layer = document.createElement('div');
    layer.className = 'contact-pixels';
    layer.setAttribute('aria-hidden', 'true');
    const assembly = [];
    const columns = Math.ceil(width / 23);
    const rows = Math.ceil(height / 34);
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const pixel = document.createElement('i');
        pixel.className = `contact-pixel${Math.random() > .55 ? ' is-solid' : ''}`;
        const size = random(5, 17);
        const x = (column + random(.15, .85)) / columns * width;
        const y = (row + random(.2, .8)) / rows * height;
        Object.assign(pixel.style, {
          left: `${x}px`, top: `${y}px`, width: `${size}px`,
          height: `${Math.random() > .82 ? size * .5 : size}px`,
        });
        layer.append(pixel);
        const drift = random(-16, 16);
        const peak = random(.35, .76);
        const delay = Math.max(0, 100 + y / height * 1900 - 210);
        assembly.push(animate(pixel, [
          { opacity: 0, transform: `translate(${drift}px, -16px) scale(.55)`, easing: 'cubic-bezier(.22, 1, .36, 1)' },
          { opacity: peak, transform: 'translate(0, -3px) scale(1)', offset: .4 },
          { opacity: peak * .55, transform: 'translate(0, 0) scale(.9)', offset: .7 },
          { opacity: 0, transform: 'translate(0, 0) scale(.4)' },
        ], { delay, duration: Math.min(440, 2000 - delay), easing: 'linear' }));
      }
    }
    const scan = document.createElement('div');
    scan.className = 'contact-scan';
    layer.append(scan);
    build.append(layer);
    assembly.push(animate(scan, [
      { opacity: 0, transform: 'translateY(0)' },
      { opacity: .7, transform: `translateY(${height * .1}px)`, offset: .1 },
      { opacity: .5, transform: `translateY(${height * .9}px)`, offset: .9 },
      { opacity: 0, transform: `translateY(${height}px)` },
    ], { delay: 100, duration: 1900, easing: 'linear' }));
    // A shallow, stepped edge makes the pixels resolve into the surface. A clip
    // is used here because scaling the real form would distort type and controls.
    const edges = Array.from({ length: columns }, () => random(-2, 2));
    const clip = progress => {
      const points = ['0% 0%', '100% 0%'];
      for (let column = columns - 1; column >= 0; column--) {
        const y = Math.max(0, Math.min(100, progress * 100 + edges[column] * Math.sin(progress * Math.PI)));
        points.push(`${(column + 1) / columns * 100}% ${y}%`, `${column / columns * 100}% ${y}%`);
      }
      return `polygon(${points.join(',')})`;
    };
    assembly.push(animate(form, [0, .25, .5, .75, 1].map(progress => ({
      clipPath: clip(progress), offset: progress,
    })), { delay: 100, duration: 1900, easing: 'linear' }));
    fields.forEach((field, index) => assembly.push(animate(field, [
      { opacity: 0, transform: 'translateY(5px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], { delay: offsets[index] / height * 1650 + 100, duration: 240, easing: 'cubic-bezier(.22, 1, .36, 1)' })));
    // Share a start time so creating the fragments cannot make them run ahead
    // of the surface on slower devices.
    const startTime = document.timeline.currentTime;
    assembly.forEach(animation => { animation.startTime = startTime; });
    try {
      await Promise.all(assembly.map(animation => animation.finished));
      if (finished) return;
      build.dataset.buildState = 'complete';
      layer.remove();
      release(assembly);
      typeCopy();
      settle();
    } catch { finish(); }
  }

  function onPreference() { if (motion.matches || contrast.matches) finish(); }
  function onVisibility() {
    if (document.hidden && (build.dataset.buildState !== 'waiting' || copy.dataset.copyState !== 'waiting')) finish();
  }
  function onResize() {
    if (innerWidth === viewportWidth) return;
    viewportWidth = innerWidth;
    if (build.dataset.buildState === 'building' || copy.dataset.copyState !== 'waiting') finish();
    else if (narrow.matches && copy.getBoundingClientRect().top < innerHeight * .85) typeCopy();
  }

  try {
    prepareText();
    build.dataset.buildState = 'waiting';
    copy.dataset.copyState = 'waiting';
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (entry.target === build) assemble();
        // On a stacked phone layout, introduce the copy when it is visible rather
        // than leaving an empty space while the form is still below the fold.
        if (entry.target === copy && narrow.matches) typeCopy();
      }
    }, { rootMargin: '0px 0px -15% 0px', threshold: .05 });
    observer.observe(build);
    observer.observe(copy);
    section.addEventListener('focusin', finish);
    section.addEventListener('pointerdown', finish);
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('beforeprint', finish);
    document.addEventListener('visibilitychange', onVisibility);
    motion.addEventListener('change', onPreference);
    contrast.addEventListener('change', onPreference);
  } catch { finish(); }
})();
