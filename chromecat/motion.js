// motion.js

(function () {
  const state = {
    targetX: 200,
    targetY: 200,
    moveSpeed: 0.01,
    pickingNewTarget: false,
    active: false,
    circle: null,
  };

  function pickNewTarget() {
    state.targetX = Math.random() * (window.innerWidth - 150);
    state.targetY = Math.random() * (window.innerHeight - 150);
  }

  function loop() {
    if (!state.active || !state.circle) {
      requestAnimationFrame(loop);
      return;
    }

    const rect = state.circle.getBoundingClientRect();
    const currentX = rect.left;
    const currentY = rect.top;

    const nextX = currentX + (state.targetX - currentX) * state.moveSpeed;
    const nextY = currentY + (state.targetY - currentY) * state.moveSpeed;

    state.circle.style.left = `${nextX}px`;
    state.circle.style.top = `${nextY}px`;

    const dist = Math.hypot(state.targetX - currentX, state.targetY - currentY);
    if (dist < 5 && !state.pickingNewTarget) {
      state.pickingNewTarget = true;
      setTimeout(() => {
        pickNewTarget();
        state.pickingNewTarget = false;
      }, 300);
    }

    requestAnimationFrame(loop);
  }

  function start(circle) {
    state.circle = circle;
    state.active = true;
    pickNewTarget();
  }

  function stop() {
    state.active = false;
    state.circle = null;
  }

  // Expose a tiny API for other files
  window.SpriteMotion = { start, stop };
  requestAnimationFrame(loop);
})();
