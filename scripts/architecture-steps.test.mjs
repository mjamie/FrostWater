import assert from 'node:assert/strict';
import test from 'node:test';
import { StepSequence, WheelGesture, BUILD_STOPS, LAST_STEP, stepText } from '../public/assets/js/architecture-steps.js';
import { STAGES, componentProgress } from '../public/assets/js/architecture-timeline.js';

test('each reading stop has fully built its stage without starting the next', () => {
  assert.equal(BUILD_STOPS[0], 0);
  assert.equal(BUILD_STOPS[LAST_STEP], 1);
  STAGES.forEach((stage, index) => {
    for (let item = 0; item < 15; item++) {
      assert.equal(componentProgress(BUILD_STOPS[index + 1], stage.id, item, 15), 1);
      if (STAGES[index + 1]) assert.equal(componentProgress(BUILD_STOPS[index + 1], STAGES[index + 1].id, item, 15), 0);
    }
  });
});

test('one input plays one bounded animation and then waits indefinitely', () => {
  const sequence = new StepSequence();
  assert.equal(sequence.advance(1, 0), true);
  let previous = 0;
  for (let now = 0; now <= 1400; now += 20) {
    const state = sequence.sample(now);
    assert.ok(state.progress >= previous && state.progress <= BUILD_STOPS[1]);
    previous = state.progress;
  }
  const held = sequence.sample(1400);
  assert.equal(held.step, 1);
  assert.equal(held.moving, false);
  assert.deepEqual(sequence.sample(60000), held);
});

test('a long trackpad momentum tail cannot advance again after the animation ends', () => {
  const sequence = new StepSequence();
  const gesture = new WheelGesture();
  for (let now = 0; now < 2400; now += 16) {
    const state = sequence.sample(now);
    const direction = gesture.feed(now < 200 ? 24 : 2, now, state.moving);
    if (direction) sequence.advance(direction, now);
  }
  assert.equal(sequence.sample(2500).step, 1);
  const direction = gesture.feed(120, 2800);
  assert.equal(direction, 1);
  sequence.advance(direction, 2800);
  assert.equal(sequence.sample(5000).step, 2);
});

test('gestures during an animation are consumed without queuing a later step', () => {
  const gesture = new WheelGesture();
  assert.equal(gesture.feed(120, 0), 1);
  assert.equal(gesture.feed(120, 500, true), 0);
  assert.equal(gesture.feed(120, 650, true), 0);
  assert.equal(gesture.feed(12, 800), 0);
  assert.equal(gesture.feed(120, 1100), 1);
});

test('small wheel noise needs intent, and a new upward gesture can reverse', () => {
  const gesture = new WheelGesture();
  assert.equal(gesture.feed(4, 0), 0);
  assert.equal(gesture.feed(5, 16), 0);
  assert.equal(gesture.feed(10, 32), 1);
  assert.equal(gesture.feed(-120, 400), -1);
  // Arriving at the top of the page does not reuse the previous page-scroll burst.
  assert.equal(gesture.feed(-120, 800, true), 0);
  assert.equal(gesture.feed(-20, 850), 0);
});

test('reverse motion follows the same geometry and stops at the preceding stage', () => {
  for (let step = 1; step <= LAST_STEP; step++) {
    const forward = new StepSequence(step - 1);
    const backward = new StepSequence(step);
    forward.advance(1, 0);
    backward.advance(-1, 0);
    const duration = forward.animation.duration;
    assert.ok(Math.abs(forward.sample(duration * .25).progress - backward.sample(duration * .75).progress) < 1e-10);
    assert.equal(backward.sample(duration + 1).step, step - 1);
  }
  assert.equal(new StepSequence(0).advance(-1, 0), false);
  assert.equal(new StepSequence(LAST_STEP).advance(1, 0), false);
});

test('the correct caption arrives with its stage and remains fully readable at every stop', () => {
  for (let step = 1; step <= LAST_STEP; step++) {
    const sequence = new StepSequence(step - 1);
    sequence.advance(1, 0);
    const duration = sequence.animation.duration;
    assert.equal(stepText(sequence.sample(duration * .1)).step, step - 1);
    assert.equal(stepText(sequence.sample(duration * .23)).opacity, 0);
    const arriving = stepText(sequence.sample(duration * .4));
    assert.equal(arriving.step, step);
    assert.ok(arriving.opacity > 0 && arriving.opacity < 1 && arriving.offset < 0);
    assert.deepEqual(stepText(sequence.sample(duration + 1)), { step, opacity: 1, offset: 0 });
  }
});

test('hiding the page pauses its animation clock without losing the current pose', () => {
  const sequence = new StepSequence();
  sequence.advance(1, 100);
  const before = sequence.sample(500);
  sequence.pause(500);
  assert.deepEqual(sequence.sample(20000), before);
  sequence.resume(20000);
  assert.deepEqual(sequence.sample(20000), before);
  assert.equal(sequence.sample(21000).moving, false);
});

test('bypassing the introduction cancels animation and presents the completed view', () => {
  const sequence = new StepSequence();
  sequence.advance(1, 0);
  sequence.sample(200);
  sequence.snap(LAST_STEP);
  assert.equal(sequence.sample(201).progress, 1);
  assert.equal(sequence.sample(10000).moving, false);
});
