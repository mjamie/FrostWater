// Normalized construction progress always produces the same building pose.
export const clamp = value => Math.max(0, Math.min(1, value));
export const smoothstep = value => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
export const range = (value, start, end) => clamp((value - start) / (end - start));
export const easeOutCubic = value => 1 - (1 - clamp(value)) ** 3;

export const STAGES = Object.freeze([
  { id: 'columns', start: .09, end: .255, label: 'A framework for possibility.', detail: 'Slender columns establish the structure.' },
  { id: 'floors', start: .27, end: .395, label: 'Space takes shape.', detail: 'Concrete floor plates define each level.' },
  { id: 'glazing', start: .415, end: .615, label: 'Open to a new perspective.', detail: 'Glass connects the spaces within.' },
  { id: 'facade', start: .635, end: .77, label: 'Every detail, considered.', detail: 'Screens, terraces and finishes bring depth.' },
  { id: 'roof', start: .79, end: .88, label: 'The vision comes together.', detail: 'The roof completes the silhouette.' },
]);

export function componentTiming(stageId, index, count) {
  const stage = STAGES.find(item => item.id === stageId);
  if (!stage) throw new Error(`Unknown assembly stage: ${stageId}`);
  const span = stage.end - stage.start;
  const start = stage.start + span * .48 * index / Math.max(1, count - 1);
  return { start, duration: span * .52 };
}

export function componentPhase(progress, stageId, index, count) {
  const { start, duration } = componentTiming(stageId, index, count);
  return range(progress, start, start + duration);
}

export function componentProgress(progress, stageId, index, count) {
  // Cubic ease-out: short travel, no overshoot or elastic settling.
  return easeOutCubic(componentPhase(progress, stageId, index, count));
}

export function constructionState(progress, reducedMotion = false) {
  if (reducedMotion) return { grid: 0, foundation: 1, cubes: false };
  return {
    grid: (.9 - .3 * smoothstep(range(progress, .08, .3))) * (1 - smoothstep(range(progress, .86, .96))),
    foundation: smoothstep(range(progress, .045, .14)),
    cubes: progress > STAGES[0].start && progress < STAGES[STAGES.length - 1].end,
  };
}

export function currentStage(progress) {
  if (progress < STAGES[0].start) return 'foundation';
  if (progress >= .90) return 'complete';
  return [...STAGES].reverse().find(stage => progress >= stage.start).id;
}
