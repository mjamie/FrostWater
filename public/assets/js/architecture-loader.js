// Keep the foundation visible while WebGL and its shaders prepare in the background.
(() => {
  const intro = document.querySelector('.architecture-intro');
  if (!intro) return;
  // Keep the single-screen foundation visible while the scene prepares.
  intro.classList.add('is-preparing');
  intro.dataset.renderState = 'loading';
  const initialHash = location.hash;
  const scrollStyle = document.documentElement.style;
  const previousScrollBehavior = scrollStyle.scrollBehavior;
  // An initial URL fragment should land directly, rather than race a compositor
  // smooth-scroll animation while the introduction is being prepared.
  if (initialHash) scrollStyle.scrollBehavior = 'auto';
  let interacted = false;
  const noteInteraction = () => { interacted = true; };
  const events = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
  for (const name of events) addEventListener(name, noteInteraction, { passive: true, once: true });
  async function settled() {
    if (initialHash) {
      await document.fonts.ready;
      if (document.readyState !== 'complete') await new Promise(resolve => addEventListener('load', resolve, { once: true }));
    }
    for (const name of events) removeEventListener(name, noteInteraction);
    try {
      if (!initialHash || location.hash !== initialHash || interacted) return;
      // Reconcile only the visitor's requested URL anchor, never normal scrolling.
      const target = document.getElementById(decodeURIComponent(initialHash.slice(1)));
      if (target && !intro.contains(target)) target.scrollIntoView({ behavior: 'instant', block: 'start' });
    } catch { /* An invalid URL fragment must not interrupt the page. */ }
    finally {
      if (initialHash) scrollStyle.scrollBehavior = previousScrollBehavior;
    }
  }
  intro.addEventListener('architecture:settled', settled, { once: true });
  import('./architecture.js?v=4').catch(error => {
    intro.classList.remove('is-preparing');
    intro.dataset.renderState = 'fallback';
    intro.dispatchEvent(new Event('architecture:settled'));
    console.warn('The architectural introduction is using its still image.', error);
  });
})();
