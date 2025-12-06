// sprite.js

console.log("sprite content script loaded on", location.href);

// 1. Sprite sheet settings – CHANGE these to match your image
const FRAME_WIDTH = 150;      // width of one frame in px
const FRAME_HEIGHT = 150;     // height of one frame in px
const FRAME_COUNT = 38;        // how many frames across
const ANIM_DURATION = 0.6;    // seconds for one full walk loop

// 2. URL for the sprite sheet inside the extension
const spriteSheetUrl = chrome.runtime.getURL("spritesheet.png");
console.log("spritesheet URL:", spriteSheetUrl);

function injectWalkKeyframes() {
  // TODO: create a <style> element
  // TODO: set its textContent to a @keyframes block
  // TODO: append it to document.head

  const fullWidth = FRAME_WIDTH * FRAME_COUNT;
  const css = `
    @keyframes walk {
      from { background-position: 0 0; }
      to   { background-position: -${fullWidth}px 0; }
    }
  `;
  const styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);
}

injectWalkKeyframes();

function applyWalkingAnimation(element) {
  // TODO: set element.style.width / height
  element.style.width = FRAME_WIDTH + "px";
  element.style.height = FRAME_HEIGHT + "px";
  // TODO: set the background-image to spriteSheetUrl
  element.style.backgroundImage = `url(${spriteSheetUrl})`;
  // TODO: set background-size so the whole sheet fits
  element.style.backgroundSize = 
  (FRAME_WIDTH * FRAME_COUNT) + "px " + FRAME_HEIGHT + "px";
  // TODO: set background-repeat, background-position
  element.style.backgroundRepeat = "no-repeat";
  element.style.backgroundPosition = "0 0";
  // TODO: set the CSS animation property to use "walk"
  element.style.animation = `walk ${ANIM_DURATION}s steps(${FRAME_COUNT}) infinite`;
}


let circle = null;
let dragging = false;
let offsetX = 0;
let offsetY = 0;

function createCircle() {
  if (circle) return;

  circle = document.createElement("div");
  circle.id = "circle-cover-overlay";

  Object.assign(circle.style, {
    position: "fixed",
    top: "100px",
    left: "100px",
    zIndex: "999999",
    cursor: "move"
  });

  applyWalkingAnimation(circle)

  document.body.appendChild(circle);

  // start drifting using the lib
  if (window.SpriteMotion) {
    window.SpriteMotion.start(circle);
  }

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
  if (window.SpriteMotion) {
    window.SpriteMotion.stop();
  }
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
