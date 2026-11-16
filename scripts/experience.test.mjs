import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MotionValue, ExperienceJourney, chapterAt, partProgress } from '../public/assets/js/experience-timeline.js';

test('the first frame is a complete closed product and remains idle before scrolling', () => {
  const journey = new ExperienceJourney();
  journey.select(0, 0, { engaged: false });
  const state = journey.sample(5000);
  assert.deepEqual(state.weights, [1, 0, 0]);
  assert.equal(state.expansion, 0);
  assert.equal(state.moving, false);
});
test('scrolling expands the solid product and returning to the top closes it', () => {
  const journey = new ExperienceJourney();
  journey.select(0, 0, { engaged: true });
  const opening = journey.sample(400);
  assert.deepEqual(opening.weights, [1, 0, 0]);
  assert.ok(opening.expansion > 0 && opening.expansion < 1);
  journey.select(0, 400, { engaged: false });
  assert.equal(journey.sample(400).expansion, opening.expansion);
  assert.deepEqual(journey.sample(2000).weights, [1, 0, 0]);
  assert.equal(journey.sample(2000).expansion, 0);
});
test('reduced motion starts closed and changes the exploded view without animation', () => {
  const journey = new ExperienceJourney();
  journey.select(0, 0, { reduced: true, engaged: false });
  assert.equal(journey.sample(0).expansion, 0);
  journey.select(0, 20, { reduced: true, engaged: true });
  assert.equal(journey.sample(20).expansion, 1);
  assert.equal(journey.sample(20).moving, false);
});

test('reversing during a scene transition starts from the currently visible pose', () => {
  const journey = new ExperienceJourney();
  journey.select(1, 0);
  const before = journey.sample(420);
  journey.select(0, 420);
  assert.deepEqual(journey.sample(420).weights, before.weights);
  assert.ok(journey.sample(650).weights[1] < before.weights[1]);
  assert.deepEqual(journey.sample(5000).weights, [1, 0, 0]);
});
test('a fast scroll directly to the last chapter never queues intermediate scenes', () => {
  const journey = new ExperienceJourney();
  journey.select(1, 0);
  journey.select(2, 90);
  assert.deepEqual(journey.sample(5000).weights, [0, 0, 1]);
  assert.equal(journey.chapter, 2);
  assert.equal(journey.sample(5000).moving, false);
});
test('reduced motion immediately presents completed models and inspection state', () => {
  const journey = new ExperienceJourney();
  journey.select(2, 20, { reduced: true });
  journey.inspect(true, 20, true);
  const state = journey.sample(20);
  assert.deepEqual(state.weights, [0, 0, 1]);
  assert.equal(state.inspection, 1);
  assert.equal(state.operation, 1);
  assert.equal(state.moving, false);
});
test('operation follows assembly and stops after one demonstration', () => {
  const journey = new ExperienceJourney();
  journey.select(1, 100);
  assert.equal(journey.sample(800).operation, 0);
  assert.ok(journey.sample(1600).operation > 0);
  assert.equal(journey.sample(3500).operation, 1);
  assert.equal(journey.sample(3500).moving, false);
});
test('inactive tabs preserve animation time', () => {
  const journey = new ExperienceJourney();
  journey.select(1, 100);
  const before = journey.sample(500);
  journey.shiftClock(8000);
  assert.deepEqual(journey.sample(8500), before);
});
test('inspection can close immediately during its opening animation', () => {
  const value = new MotionValue();
  value.set(1, 0, 800);
  const current = value.sample(200);
  value.set(0, 200, 800);
  assert.equal(value.sample(200), current);
  assert.ok(value.sample(300) < current);
  assert.equal(value.sample(1000), 0);
});
test('chapter boundaries work identically in both scroll directions', () => {
  const thresholds = [0, 620, 1280];
  assert.deepEqual([0, 619, 620, 1280, 900, 0].map(y => chapterAt(y, thresholds)), [0, 0, 1, 2, 1, 0]);
});
test('staggered components are absent at zero and complete at one', () => {
  for (let index = 0; index < 30; index++) {
    assert.equal(partProgress(0, index, 30), 0);
    assert.equal(partProgress(1, index, 30), 1);
  }
  assert.ok(partProgress(.3, 0, 30) > partProgress(.3, 29, 30));
});
test('the new controller cannot capture native scrolling or keyboard input', () => {
  const source = readFileSync(new URL('../public/assets/js/experience.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /(?:addEventListener\(['"](?:wheel|touchmove|keydown)|scrollTo\(|scrollIntoView\(|overflow\s*=)/);
  assert.match(source, /addEventListener\('scroll', requestPaint, \{ passive: true \}\)/);
});
