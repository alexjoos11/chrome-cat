console.log("circle overlay content script loaded on", location.href);

const spriteUrl = chrome.runtime.getURL("sprite.png");
console.log("sprite URL:", spriteUrl);

let circle = null;
let dragging = false;
let offsetX = 0;
let offsetY = 0;

let targetX = 200;
let targetY = 200;
let moveSpeed = 0.01; // lower = slower, smoother
let pickingNewTarget = false;

function pickNewTarget() {
  targetX = Math.random() * (window.innerWidth - 150);
  targetY = Math.random() * (window.innerHeight - 150);
}

function smoothMove() {
  if (!circle) return;

  const rect = circle.getBoundingClientRect();
  const currentX = rect.left;
  const currentY = rect.top;

  // Move a fraction of the distance toward the target
  const nextX = currentX + (targetX - currentX) * moveSpeed;
  const nextY = currentY + (targetY - currentY) * moveSpeed;

  circle.style.left = `${nextX}px`;
  circle.style.top = `${nextY}px`;

  // If very close to target → pick a new one
  const dist = Math.hypot(targetX - currentX, targetY - currentY);
  if (dist < 5 && !pickingNewTarget) {
    pickingNewTarget = true;
    setTimeout(() => {
      pickNewTarget();
      pickingNewTarget = false;
    }, 300); // pause before drifting to new spot
  }

  requestAnimationFrame(smoothMove);
}

function createCircle() {
  if (circle) return;

  circle = document.createElement("div");
  circle.id = "circle-cover-overlay";

  Object.assign(circle.style, {
    position: "fixed",
    width: "150px",
    height: "150px",
    backgroundImage: `url(${spriteUrl})`,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    top: "100px",
    left: "100px",
    zIndex: "999999",
    cursor: "move",
    // borderRadius: "50%", // uncomment if you want a circular mask again
    // border: "2px solid red", // debug: see bounds
  });

  document.body.appendChild(circle);

  pickNewTarget();
  requestAnimationFrame(smoothMove);

  circle.addEventListener("mousedown", (e) => {
    dragging = true;
    const rect = circle.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    e.preventDefault();
  });

  window.addEventListener("mousemove", (e) => {
    if (!dragging || !circle) return;
    circle.style.left = `${e.clientX - offsetX}px`;
    circle.style.top = `${e.clientY - offsetY}px`;
  });

  window.addEventListener("mouseup", () => {
    dragging = false;
  });
}

function removeCircle() {
  if (circle && circle.parentNode) {
    circle.parentNode.removeChild(circle);
  }
  circle = null;
}

function toggleCircle() {
  if (circle) {
    removeCircle();
  } else {
    createCircle();
  }
}

// Toggle with Alt + Shift + X
window.addEventListener("keydown", (e) => {
  if (e.altKey && e.shiftKey && e.code === "KeyX") {
    toggleCircle();
  }
});
