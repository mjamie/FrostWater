import assert from 'node:assert/strict';
import test from 'node:test';
import { STAGES, componentProgress, componentPhase, componentTiming, constructionState, currentStage, smoothstep } from '../public/assets/js/architecture-timeline.js';

test('assembly stages follow the architectural order, with a settled pause between each', () => {
  assert.deepEqual(STAGES.map(stage => stage.id), ['columns', 'floors', 'glazing', 'facade', 'roof']);
  for (let i = 1; i < STAGES.length; i++) assert.ok(STAGES[i].start > STAGES[i - 1].end);
  assert.equal(currentStage(0), 'foundation');
  assert.equal(currentStage(1), 'complete');
  assert.equal(currentStage(.3), 'floors');
});

test('every component starts hidden and fully lands before the next stage', () => {
  for (const stage of STAGES) {
    for (const count of [1, 8, 75]) for (let index = 0; index < count; index++) {
      assert.equal(componentProgress(0, stage.id, index, count), 0);
      assert.equal(componentProgress(stage.start, stage.id, index, count), 0);
      assert.equal(componentProgress(stage.end, stage.id, index, count), 1);
      assert.equal(componentProgress(1, stage.id, index, count), 1);
    }
  }
});

test('short staggered paths never overshoot and decelerate as they land', () => {
  for (const stage of STAGES) {
    const duration = (stage.end - stage.start) * .52;
    const samples = Array.from({ length: 11 }, (_, index) => componentProgress(stage.start + duration * index / 10, stage.id, 0, 10));
    for (let i = 1; i < samples.length; i++) {
      assert.ok(samples[i] >= samples[i - 1] && samples[i] <= 1);
      if (i > 1) assert.ok(samples[i] - samples[i - 1] < samples[i - 1] - samples[i - 2]);
    }
    assert.ok(componentProgress(stage.start + duration / 2, stage.id, 0, 10) > componentProgress(stage.start + duration / 2, stage.id, 9, 10));
  }
});

test('reversing, seeking and reloading produce identical component transforms', () => {
  const poses = progress => STAGES.flatMap(stage => Array.from({ length: 12 }, (_, index) => componentProgress(progress, stage.id, index, 12)));
  const stops = [0, .05, .12, .255, .3, .41, .52, .69, .84, .95, 1];
  const forward = stops.map(progress => poses(progress));
  const backward = [...stops].reverse().map(progress => poses(progress)).reverse();
  assert.deepEqual(forward, backward);
  assert.deepEqual(poses(.52), forward[6]);
});

test('camera and text easing clamps endpoints without a discontinuity', () => {
  assert.equal(smoothstep(-1), 0);
  assert.equal(smoothstep(2), 1);
  assert.equal(smoothstep(.5), .5);
  assert.ok(smoothstep(.0001) < .000001);
  assert.ok(1 - smoothstep(.9999) < .000001);
});

test('blueprint opens the scene and all construction effects clear for the final reveal', () => {
  assert.deepEqual(constructionState(0), { grid: .9, foundation: 0, cubes: false });
  assert.ok(constructionState(.16).grid > 0);
  assert.equal(constructionState(.16).cubes, true);
  assert.equal(constructionState(.16).foundation, 1);
  assert.deepEqual(constructionState(.96), { grid: 0, foundation: 1, cubes: false });
  assert.deepEqual(constructionState(1), { grid: 0, foundation: 1, cubes: false });
});

test('reduced motion always presents the completed foundation without construction effects', () => {
  for (const progress of [0, .05, .16, .33, .51, .7, .83, .97, 1]) {
    assert.deepEqual(constructionState(progress, true), { grid: 0, foundation: 1, cubes: false });
  }
});

test('shader phase and cell spawn timings match the same deterministic component interval', () => {
  for (const stage of STAGES) for (let index = 0; index < 15; index++) {
    const { start, duration } = componentTiming(stage.id, index, 15);
    assert.ok(Number.isFinite(start) && duration > 0);
    assert.ok(Math.abs(componentPhase(start + duration / 2, stage.id, index, 15) - .5) < 1e-10);
    assert.equal(componentPhase(start - .01, stage.id, index, 15), 0);
    assert.equal(componentPhase(start + duration + .01, stage.id, index, 15), 1);
  }
  const stops = [0, .12, .3, .5, .72, .9, 1];
  assert.deepEqual(stops.map(p => constructionState(p)), [...stops].reverse().map(p => constructionState(p)).reverse());
});
