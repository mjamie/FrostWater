// The page owns scrolling. These values animate only the illustration.
export const clamp = value => Math.max(0, Math.min(1, value));
export const range = (value, start, end) => clamp((value - start) / (end - start));
export const ease = value => 1 - (1 - clamp(value)) ** 3;
export const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

export class MotionValue {
  constructor(value = 0) { this.from = this.to = value; this.started = 0; this.duration = 0; }
  sample(now) {
    const t = this.duration ? range(now, this.started, this.started + this.duration) : 1;
    return this.from + (this.to - this.from) * ease(t);
  }
  set(value, now, duration = 1100) {
    if (value === this.to && duration !== 0) return;
    this.from = this.sample(now);
    this.to = value;
    this.started = now;
    this.duration = duration;
  }
  moving(now) { return this.from !== this.to && now < this.started + this.duration; }
}

export class ExperienceJourney {
  constructor() {
    this.chapter = 0;
    this.started = false;
    this.weights = [new MotionValue(1), new MotionValue(0), new MotionValue(0)];
    this.expansion = new MotionValue(0);
    this.camera = new MotionValue(0);
    this.operation = new MotionValue(0);
    this.inspection = new MotionValue(0);
  }
  select(chapter, now, { reduced = false, engaged = true } = {}) {
    const chapterChanged = chapter !== this.chapter;
    const changed = chapterChanged || this.started !== engaged;
    if (!changed && !reduced) return;
    this.chapter = chapter;
    this.started = engaged;
    const duration = reduced ? 0 : 1150;
    // Visibility and the exploded pose are independent: the opening product
    // is solid, and scrolling opens its casing without reconstructing it.
    this.weights.forEach((weight, index) => weight.set(index === chapter ? 1 : 0, now, duration));
    this.expansion.set(engaged ? 1 : 0, now, reduced ? 0 : 1100);
    this.camera.set(chapter, now, reduced ? 0 : 1500);
    if (chapterChanged) {
      this.operation.set(0, now, 0);
      this.operation.set(1, reduced ? now : now + 800, reduced ? 0 : 2400);
    }
    if (reduced) this.operation.set(1, now, 0);
  }
  inspect(open, now, reduced = false) { this.inspection.set(open ? 1 : 0, now, reduced ? 0 : 800); }
  sample(now) {
    const values = [...this.weights, this.expansion, this.camera, this.operation, this.inspection];
    return {
      weights: this.weights.map(value => value.sample(now)),
      expansion: this.expansion.sample(now),
      camera: this.camera.sample(now), operation: this.operation.sample(now),
      inspection: this.inspection.sample(now), moving: values.some(value => value.moving(now)),
    };
  }
  // Do not let a background tab consume the visible part of an animation.
  shiftClock(duration) {
    for (const value of [...this.weights, this.expansion, this.camera, this.operation, this.inspection]) value.started += duration;
  }
}

export function chapterAt(scroll, thresholds) {
  let chapter = 0;
  for (let index = 1; index < thresholds.length; index++) if (scroll >= thresholds[index]) chapter = index;
  return chapter;
}

export function partProgress(progress, index, count) {
  const stagger = count > 1 ? index / (count - 1) * .27 : 0;
  return smooth(range(progress, stagger, stagger + .73));
}
