'use strict';

(() => {
  const layer = document.querySelector('.ambient-cubes');
  const intro = document.querySelector('.experience-intro');
  if (!layer || !intro || !Element.prototype.animate) return;

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const film = document.querySelector('#studio-film-video');
  const frameMs = 160;
  const profiles = [
    { name: 'far', size: [4, 6], cell: 8, frames: 2, opacity: [.14, .2] },
    { name: 'middle', size: [7, 10], cell: 13, frames: 1, opacity: [.22, .28] },
    { name: 'near', size: [12, 16], cell: 20, frames: 1, opacity: [.3, .38] },
  ];
  const random = (min, max) => min + Math.random() * (max - min);
  const pick = range => random(...range);
  let trails = [];
  let introVisible = true;
  let active = false;
  let resizeTimer;
  let viewport = { width: innerWidth, height: innerHeight };

  const update = () => {
    const filmPlaying = film && !film.paused && !film.ended;
    active = !introVisible && !document.hidden && !motion.matches && !filmPlaying;
    layer.dataset.active = String(active);
    trails.forEach(({ animation }) => active ? animation.play() : animation.pause());
  };

  const launch = (trail, initial = false) => {
    const { element, index, count } = trail;
    // Keep a few closer streams in the open margins, where their tails can be seen.
    const depth = index === 0 || index === count - 1 ? 2 : [0, 1, 0, 1, 2][index % 5];
    const profile = profiles[depth];
    const mobile = innerWidth < 768;
    const headSize = Math.round(pick(profile.size) * (mobile ? .85 : 1));
    const cell = Math.round(profile.cell * (mobile ? .85 : 1));
    const cubeCount = Math.floor(random(5, 9));
    const taper = random(.83, .88);
    // Each stream occupies a grid column. There is no diagonal drift or rotation.
    const column = Math.round(((index + random(.2, .8)) / count) * innerWidth / cell);
    const startRow = -cubeCount - Math.floor(random(0, 4));
    const endRow = Math.floor(random(.62, .89) * innerHeight / cell);
    const rows = endRow - startRow;
    const peakOpacity = pick(profile.opacity);
    const duration = rows * frameMs * profile.frames;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < cubeCount; i++) {
      const cube = document.createElement('span');
      const size = headSize * taper ** i;
      cube.className = 'ambient-cube';
      Object.assign(cube.style, {
        width: `${size}px`,
        height: `${size}px`,
        // A square in each preceding grid cell makes the short snake-like tail.
        left: `${-size / 2}px`,
        top: `${-i * cell - size / 2}px`,
        opacity: String(.8 ** i),
      });
      fragment.append(cube);
    }

    element.replaceChildren(fragment);
    element.dataset.depth = profile.name;
    const at = progress => `translate3d(${column * cell}px, ${(startRow + rows * progress) * cell}px, 0)`;
    trail.animation?.cancel();
    // One grid-cell jump per tick, held between ticks like classic Snake / Matrix rain.
    // The browser animates transform and opacity; no JS game loop or scroll handler.
    const animation = element.animate([
      { transform: at(0), opacity: 0, offset: 0 },
      { transform: at(.16), opacity: peakOpacity, offset: .16 },
      { transform: at(.58), opacity: peakOpacity, offset: .58 },
      { transform: at(.82), opacity: peakOpacity * .35, offset: .82 },
      { transform: at(.94), opacity: 0, offset: .94 },
      { transform: at(1), opacity: 0, offset: 1 },
    ], { duration, easing: `steps(${rows}, end)`, fill: 'both' });
    trail.animation = animation;
    if (initial) animation.currentTime = Math.floor(rows * ((index / count + .25) % .85)) * frameMs * profile.frames;
    if (!active) animation.pause();
    // Reuse the stream; randomize its count, size, path and fade point each time.
    animation.onfinish = () => launch(trail);
  };

  const build = () => {
    viewport = { width: innerWidth, height: innerHeight };
    trails.forEach(({ animation }) => {
      animation.onfinish = null;
      animation.cancel();
    });
    trails = [];
    layer.replaceChildren();
    const count = innerWidth < 768 ? 6 : 14;
    for (let index = 0; index < count; index++) {
      const element = document.createElement('span');
      element.className = 'ambient-trail';
      layer.append(element);
      const trail = { element, index, count };
      trails.push(trail);
      launch(trail, true);
    }
    update();
  };

  // Keep the introduction and film as the visual focus; resume without jumping.
  const observer = new IntersectionObserver(entries => {
    introVisible = entries[0].isIntersecting;
    update();
  });
  observer.observe(intro);
  document.addEventListener('visibilitychange', update);
  motion.addEventListener('change', update);
  ['play', 'pause', 'ended', 'emptied'].forEach(event => film?.addEventListener(event, update));
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Mobile browser bars change height while scrolling; keep those trails continuous.
      if (innerWidth !== viewport.width || Math.abs(innerHeight - viewport.height) > 120) build();
    }, 180);
  });
  build();
})();
