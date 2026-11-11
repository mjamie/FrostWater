'use strict';
document.documentElement.classList.add('js');
const toggle = document.getElementById('menu-toggle');
const navigation = document.getElementById('mobile-navigation');
function setMenu(open) {
  navigation.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
}
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    toggle.focus();
  }
});
const desktop = window.matchMedia('(min-width: 1024px)');
desktop.addEventListener('change', event => { if (event.matches) setMenu(false); });

const contactForm = document.getElementById('contact-form');
if (contactForm) contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  const button = contactForm.querySelector('button[type="submit"]');
  const status = document.getElementById('contact-status');
  if (button.disabled) return;
  const originalLabel = button.innerHTML;
  button.disabled = true;
  button.textContent = 'Sending…';
  status.textContent = 'Sending your message…';
  try {
    const response = await fetch(contactForm.action, { method: 'POST', body: new FormData(contactForm), headers: { Accept: 'application/json' } });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.message || 'Unable to send right now. Please try again or email hello@frostwaterstudios.com.');
    status.textContent = result.message;
    contactForm.reset();
  } catch (error) {
    status.textContent = error instanceof SyntaxError || error instanceof TypeError ? 'Unable to confirm sending. Your details are still here. Please try again or email hello@frostwaterstudios.com.' : error.message;
  } finally {
    button.disabled = false;
    button.innerHTML = originalLabel;
  }
});
