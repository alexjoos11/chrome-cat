console.log("sprite content script loaded on", location.href);

//---------------------------GLOBALS-------------------------------
// Sprite sheet settings
const FRAME_WIDTH = 150;      // width of one frame in px
const FRAME_HEIGHT = 150;     // height of one frame in px
const FRAME_COUNT = 34;        // how many frames across
const ANIM_DURATION = 0.6;    // seconds for one full walk loop

// circle stuff idk
let circle = null;
let dragging = false;
let offsetX = 0;
let offsetY = 0;

// click animation stuff
let wasDragging = false;


// 2. URL for the sprite sheet inside the extension
const spriteSheetUrl = chrome.runtime.getURL("resources/spritesheet34.png");
console.log("spritesheet URL:", spriteSheetUrl);

const meowSounds = [
  "resources/meow/meow1.mp3",
  "resources/meow/meow2.mp3",
  "resources/meow/meow3.mp3",
  "resources/meow/meow4.mp3",
  "resources/meow/meow5.mp3"
];
const meowAudioObjects = meowSounds.map(path => {
  const audio = new Audio(chrome.runtime.getURL(path));
  audio.volume = 1.0;
  return audio;
});
console.log("meow URLs", meowSounds);


function injectWalkKeyframes() {
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
  element.style.width = FRAME_WIDTH + "px";
  element.style.height = FRAME_HEIGHT + "px";
  element.style.backgroundImage = `url(${spriteSheetUrl})`;
  element.style.backgroundSize =
    FRAME_WIDTH * FRAME_COUNT + "px " + FRAME_HEIGHT + "px";
  element.style.backgroundRepeat = "no-repeat";
  element.style.backgroundPosition = "0 0";
  element.style.animation = `walk ${ANIM_DURATION}s steps(${FRAME_COUNT}) infinite`;
}

function updateWalkAnimationSpeed(element, speed) {
  const MIN_DURATION = 0.5;
  const MAX_DURATION = 1.9;
  const MAX_SPEED = 5;

  const clamped = Math.min(speed, MAX_SPEED);

  // Map speed → t in [0, 1]
  const t = clamped / MAX_SPEED;

  // Interpolate duration: slower speed → closer to MAX_DURATION
  const duration = MAX_DURATION - t * (MAX_DURATION - MIN_DURATION);

  element.style.animation = `walk ${duration.toFixed(2)}s steps(${FRAME_COUNT}) infinite`;
}

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
    window.SpriteMotion.start(circle, (speed) => {
      updateWalkAnimationSpeed(circle, speed)
    });
  }

  circle.addEventListener("mousedown", (e) => {
    dragging = true;
    wasDragging = false;
    const rect = circle.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    e.preventDefault();
  });

  window.addEventListener("mousemove", (e) => {
    if (!dragging || !circle) return;
    wasDragging = true;
    circle.style.left = `${e.clientX - offsetX}px`;
    circle.style.top = `${e.clientY - offsetY}px`;
  });

  window.addEventListener("mouseup", () => {
    dragging = false;
  });
  
  circle.addEventListener("click", (e) => {
    const audio = meowAudioObjects[Math.floor(Math.random() * meowAudioObjects.length)];
    audio.currentTime = 0;
    audio.play();

    if (!wasDragging) {
      chrome.runtime.sendMessage({
      type: "OPEN_TAB",
      url: "https://www.google.com"
      });
    }
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
