'use strict';

(() => {
  const section = document.querySelector('.process-section');
  const list = section?.querySelector('.process-steps');
  if (!list) return;

  const steps = [...list.querySelectorAll('.process-step')];
  const nodes = steps.map(step => step.querySelector('.process-node'));
  const fills = steps.map(step => step.querySelector('.process-connector-fill'));
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let offsets = [];
  const progressValues = fills.map(() => -1);
  let readingLine = innerHeight * .5;
  let frame = 0;
  let current = -1;
  const clamp = value => Math.max(0, Math.min(1, value));

  function render() {
    frame = 0;
    if (motion.matches || !offsets.length) return;
    // Read once, then write only transforms and state. No timer or scroll interception.
    const position = readingLine - list.getBoundingClientRect().top;
    let next = 0;
    offsets.forEach((offset, index) => { if (position >= offset) next = index; });
    fills.forEach((fill, index) => {
      if (!fill) return;
      const progress = clamp((position - offsets[index]) / (offsets[index + 1] - offsets[index]));
      if (progress !== progressValues[index]) {
        fill.style.transform = `scaleY(${progress})`;
        progressValues[index] = progress;
      }
    });
    if (next === current) return;
    current = next;
    steps.forEach((step, index) => {
      step.classList.toggle('is-current', index === current);
      step.classList.toggle('is-past', index < current);
      if (index === current) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
  }

  function schedule() {
    if (!motion.matches && !frame) frame = requestAnimationFrame(render);
  }

  function measure() {
    const top = list.getBoundingClientRect().top;
    offsets = nodes.map(node => {
      const rect = node.getBoundingClientRect();
      return rect.top + rect.height / 2 - top;
    });
    // Complete each stage while its heading is still at the middle of the screen.
    readingLine = innerHeight * .5;
    render();
  }

  function syncMotion() {
    section.classList.toggle('is-enhanced', !motion.matches);
    if (!motion.matches) { measure(); return; }
    cancelAnimationFrame(frame);
    frame = 0;
    current = -1;
    steps.forEach(step => {
      step.classList.remove('is-current', 'is-past');
      step.removeAttribute('aria-current');
    });
    fills.forEach((fill, index) => {
      if (fill) fill.style.transform = 'scaleY(1)';
      progressValues[index] = 1;
    });
  }

  // Reading progress follows the same path forward and backward, at the visitor's pace.
  // A single scroll measurement also handles quick jumps and viewport reflow;
  // it never depends on a potentially stale intersection notification.
  const resize = new ResizeObserver(measure);
  resize.observe(list);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('pageshow', measure);
  window.addEventListener('hashchange', schedule);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) schedule(); });
  motion.addEventListener('change', syncMotion);
  document.fonts?.ready.then(measure);
  syncMotion();
})();
