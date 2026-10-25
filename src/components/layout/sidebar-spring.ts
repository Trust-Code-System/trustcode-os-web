// Unit-mass damped oscillator, solved analytically so reversals retain velocity
// and the result does not depend on the display's refresh rate.
export function advanceSidebar(position: number, velocity: number, target: number, seconds: number) {
  const damping = 27 / 2;
  const frequency = Math.sqrt(230 - damping * damping);
  const offset = position - target;
  const sineCoefficient = (velocity + damping * offset) / frequency;
  const decay = Math.exp(-damping * seconds);
  const sine = Math.sin(frequency * seconds);
  const cosine = Math.cos(frequency * seconds);
  const displacement = offset * cosine + sineCoefficient * sine;
  return {
    position: target + decay * displacement,
    velocity: decay * (-damping * displacement - offset * frequency * sine + sineCoefficient * frequency * cosine),
  };
}

export function sidebarGeometry(progress: number) {
  const fold = Math.max(0, Math.min(1, progress));
  // The leaf lifts first, then the workspace takes the released space.
  const release = Math.max(0, Math.min(1, (fold - 0.35) / 0.65));
  const easedRelease = release * release * (3 - 2 * release);
  return { fold, space: 256 * (1 - easedRelease), angle: fold * 180, lift: Math.sin(Math.PI * fold) };
}
