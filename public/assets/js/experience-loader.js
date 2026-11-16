(() => {
  const root = document.querySelector('.experience-intro');
  if (!root) return;
  root.dataset.renderState = 'loading';
  const initialHash = location.hash;
  let interacted = false;
  const noteInteraction = () => { interacted = true; };
  const events = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
  events.forEach(name => addEventListener(name, noteInteraction, { passive: true, once: true }));
  root.addEventListener('experience:settled', async () => {
    if (initialHash) {
      await document.fonts.ready;
      if (document.readyState !== 'complete') await new Promise(resolve => addEventListener('load', resolve, { once: true }));
    }
    events.forEach(name => removeEventListener(name, noteInteraction));
    if (interacted || !initialHash || location.hash !== initialHash) return;
    try { document.getElementById(decodeURIComponent(initialHash.slice(1)))?.scrollIntoView({ behavior: 'instant' }); }
    catch { /* A malformed fragment must not affect the page. */ }
  }, { once: true });
  import('./experience.js?v=2').catch(error => {
    root.dataset.renderState = 'fallback';
    root.dispatchEvent(new Event('experience:settled'));
    console.warn('The introduction is using its still image.', error);
  });
})();
