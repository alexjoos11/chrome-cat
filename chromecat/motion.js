// motion.js

(function () {
  const state = {
    targetX: 200,
    targetY: 200,
    moveSpeed: 0.01,
    pickingNewTarget: false,
    active: false,
    circle: null,
    onSpeedChange: null,
  };

  function pickNewTarget() {
    state.targetX = Math.random() * (window.innerWidth - 150);
    state.targetY = Math.random() * (window.innerHeight - 150);
  }

  function loop() {
    requestAnimationFrame(loop);

    if (!state.active || !state.circle) return;

    const rect = state.circle.getBoundingClientRect();
    const currentX = rect.left;
    const currentY = rect.top;

    const nextX = currentX + (state.targetX - currentX) * state.moveSpeed;
    const nextY = currentY + (state.targetY - currentY) * state.moveSpeed;

    // <<< movement >>>
    state.circle.style.left = `${nextX}px`;
    state.circle.style.top = `${nextY}px`;

    // <<< compute speed (pixels per frame) >>>
    const dx = nextX - currentX;
    const dy = nextY - currentY;
    const speed = Math.hypot(dx, dy); // small when moving slowly

    // Call the callback if provided
    if (typeof state.onSpeedChange === "function") {
      state.onSpeedChange(speed);
    }

    const dist = Math.hypot(state.targetX - currentX, state.targetY - currentY);
    if (dist < 5 && !state.pickingNewTarget) {
      state.pickingNewTarget = true;
      setTimeout(() => {
        pickNewTarget();
        state.pickingNewTarget = false;
      }, 300);
    }
  }

  function start(circle, onSpeedChange) {
    state.circle = circle;
    state.active = true;
    state.onSpeedChange = onSpeedChange || null;
    pickNewTarget();
  }

  function stop() {
    state.active = false;
    state.circle = null;
    state.onSpeedChange = null;
  }

  window.SpriteMotion = { start, stop };
  requestAnimationFrame(loop);
})();
