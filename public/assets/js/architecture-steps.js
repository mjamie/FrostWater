import { STAGES, clamp, smoothstep, range, easeOutCubic } from './architecture-timeline.js?v=2';

export const BUILD_STOPS = Object.freeze([0, ...STAGES.map(stage => stage.end), 1]);
const DURATIONS = [0, 1200, 1050, 1250, 1150, 1000, 850];
export const LAST_STEP = BUILD_STOPS.length - 1;

// One bounded animation, then an indefinite reading pause. No queued gestures.
export class StepSequence {
  constructor(index = 0) {
    this.index = index;
    this.animation = null;
    this.pausedAt = null;
  }
  advance(direction, now) {
    if (this.animation) return false;
    const next = Math.max(0, Math.min(LAST_STEP, this.index + Math.sign(direction)));
    if (next === this.index) return false;
    this.animation = { from: this.index, to: next, start: now, duration: DURATIONS[Math.max(next, this.index)] };
    return true;
  }
  snap(index) {
    this.index = Math.max(0, Math.min(LAST_STEP, index));
    this.animation = null;
    this.pausedAt = null;
  }
  pause(now) { if (this.animation && this.pausedAt === null) this.pausedAt = now; }
  resume(now) {
    if (this.animation && this.pausedAt !== null) this.animation.start += now - this.pausedAt;
    this.pausedAt = null;
  }
  sample(now) {
    const a = this.animation;
    if (a) {
      const phase = clamp(((this.pausedAt ?? now) - a.start) / a.duration);
      if (phase < 1) return {
        progress: BUILD_STOPS[a.from] + (BUILD_STOPS[a.to] - BUILD_STOPS[a.from]) * smoothstep(phase),
        from: a.from, step: a.to, phase, moving: true,
      };
      this.index = a.to;
      this.animation = null;
    }
    return { progress: BUILD_STOPS[this.index], from: this.index, step: this.index, phase: 1, moving: false };
  }
}

export function stepText(state) {
  if (!state.moving) return { step: state.step, opacity: 1, offset: 0 };
  const direction = Math.sign(state.step - state.from);
  if (state.phase < .22) {
    const exit = smoothstep(range(state.phase, 0, .22));
    return { step: state.from, opacity: 1 - exit, offset: direction * .375 * exit };
  }
  const enter = easeOutCubic(range(state.phase, .25, .65));
  return { step: state.step, opacity: enter, offset: -direction * (1 - enter) };
}

// A wheel/trackpad burst remains consumed until the input has gone quiet.
// Animation duration alone must never turn a long momentum tail into a new step.
export class WheelGesture {
  constructor() { this.reset(); }
  reset() { this.last = -Infinity; this.used = false; this.total = 0; this.direction = 0; }
  feed(delta, now, blocked = false) {
    if (now - this.last > 220) { this.used = false; this.total = 0; this.direction = 0; }
    this.last = now;
    if (blocked) this.used = true;
    if (this.used || !delta) return 0;
    const direction = Math.sign(delta);
    if (direction !== this.direction) { this.total = 0; this.direction = direction; }
    this.total += Math.abs(delta);
    if (this.total < 18) return 0;
    this.used = true;
    return direction;
  }
}

export function createArchitectureStepper({ root, motion, onChange }) {
  const sequence = new StepSequence(motion.matches || scrollY > 2 ? LAST_STEP : 0);
  const wheel = new WheelGesture();
  let top = root.getBoundingClientRect().top + scrollY;
  let available = true;
  let released = false;
  let away = scrollY > top + 2;
  let touch = null;

  const atTop = () => Math.abs(scrollY - top) <= 2;
  const interactive = (target, keyboard) => target instanceof Element && !!target.closest(
    `${keyboard ? 'a, button, [role="button"], ' : ''}input, select, textarea, [contenteditable]:not([contenteditable="false"]), [role="dialog"], #mobile-navigation`,
  );
  const enabled = () => available && !motion.matches && !document.hidden && root.dataset.renderState === 'ready';
  const capture = (target, keyboard = false) => enabled() && atTop() && !released && !interactive(target, keyboard)
    && document.querySelector('#menu-toggle')?.getAttribute('aria-expanded') !== 'true';
  const state = () => sequence.sample(performance.now());
  const boundary = direction => !sequence.animation && (direction < 0 ? sequence.index === 0 : sequence.index === LAST_STEP);

  function release() {
    released = true;
    sequence.snap(LAST_STEP);
    onChange();
  }
  function advance(direction) {
    if (sequence.advance(direction, performance.now())) onChange();
  }
  function onWheel(event) {
    if (event.ctrlKey || event.metaKey || event.altKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
    const amount = event.deltaY * (event.deltaMode === 1 ? 24 : event.deltaMode === 2 ? innerHeight : 1);
    const active = capture(event.target);
    const current = state();
    const direction = wheel.feed(amount, performance.now(), !active || current.moving);
    if (!active) return;
    if (direction && boundary(direction)) {
      if (direction > 0) release();
      return;
    }
    if (!event.cancelable) return;
    event.preventDefault();
    if (direction) advance(direction);
  }
  function onKey(event) {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || !capture(event.target, true)) return;
    const direction = ['ArrowDown', 'PageDown'].includes(event.key) || (event.key === ' ' && !event.shiftKey) ? 1
      : ['ArrowUp', 'PageUp'].includes(event.key) || (event.key === ' ' && event.shiftKey) ? -1 : 0;
    if (!direction) return;
    state();
    if (!event.repeat && boundary(direction)) {
      if (direction > 0) release();
      return;
    }
    event.preventDefault();
    if (!event.repeat) advance(direction);
  }
  function onTouchStart(event) {
    touch = event.touches.length === 1 && capture(event.target)
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY, used: state().moving }
      : null;
  }
  function onTouchMove(event) {
    if (!touch || event.touches.length !== 1 || !enabled()) { touch = null; return; }
    const dx = event.touches[0].clientX - touch.x;
    const dy = touch.y - event.touches[0].clientY;
    if (Math.abs(dy) < 4 || Math.abs(dx) > Math.abs(dy)) return;
    state();
    const direction = Math.sign(dy);
    if (!touch.used && boundary(direction)) {
      if (direction > 0) release();
      touch = null;
      return;
    }
    if (!event.cancelable) return;
    event.preventDefault();
    if (!touch.used && Math.abs(dy) >= 42) { touch.used = true; advance(direction); }
  }
  function onTouchEnd() { touch = null; }
  function onScroll() {
    // Scrollbars, links, browser navigation and assistive technology may bypass
    // the sequence. They always retain native access to the rest of the page.
    if (!atTop()) {
      away = true;
      if (sequence.animation || sequence.index !== LAST_STEP) { sequence.snap(LAST_STEP); onChange(); }
    } else if (away) {
      away = false;
      released = false;
    }
  }
  function onClick(event) {
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
    let target;
    try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { return; }
    if (target && !root.contains(target)) release();
  }
  function onMotion() {
    touch = null;
    released = false;
    wheel.reset();
    sequence.snap(motion.matches || !atTop() ? LAST_STEP : 0);
    onChange();
  }
  function onVisibility() {
    if (document.hidden) sequence.pause(performance.now());
    else { sequence.resume(performance.now()); onChange(); }
  }
  addEventListener('wheel', onWheel, { passive: false });
  addEventListener('keydown', onKey);
  addEventListener('touchstart', onTouchStart, { passive: true });
  addEventListener('touchmove', onTouchMove, { passive: false });
  addEventListener('touchend', onTouchEnd, { passive: true });
  addEventListener('touchcancel', onTouchEnd, { passive: true });
  addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('click', onClick);
  document.addEventListener('visibilitychange', onVisibility);
  motion.addEventListener('change', onMotion);
  return {
    sample: now => sequence.sample(now),
    measure: position => { top = position; },
    setAvailable(value) { available = value; if (!value) { sequence.snap(LAST_STEP); touch = null; } onChange(); },
    dispose() {
      removeEventListener('wheel', onWheel);
      removeEventListener('keydown', onKey);
      removeEventListener('touchstart', onTouchStart);
      removeEventListener('touchmove', onTouchMove);
      removeEventListener('touchend', onTouchEnd);
      removeEventListener('touchcancel', onTouchEnd);
      removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick);
      document.removeEventListener('visibilitychange', onVisibility);
      motion.removeEventListener('change', onMotion);
    },
  };
}
