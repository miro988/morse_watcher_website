const glowWord = document.querySelector(".glow-word");
const glowReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// The app's Slow send speed (CustomTiming.slow).
const GLOW_TIMING = { dot: 400, dash: 1200, intra: 400, inter: 1200, word: 2800 };
// Longer than the word gap so the restart doesn't read as a third word.
const GLOW_REPEAT_PAUSE_MS = 4000;
const GLOW_MESSAGE = "MORSE WATCHER";
const GLOW_MORSE = {
  A: ".-",
  C: "-.-.",
  E: ".",
  H: "....",
  M: "--",
  O: "---",
  R: ".-.",
  S: "...",
  T: "-",
  W: ".--"
};

// One pass of the message as [isLit, durationMs] steps, ending on a dark pause.
function buildGlowSteps(message) {
  const steps = [];

  message.split(" ").forEach((word, wordIndex) => {
    if (wordIndex > 0) {
      steps.push([false, GLOW_TIMING.word]);
    }

    [...word].forEach((letter, letterIndex) => {
      if (letterIndex > 0) {
        steps.push([false, GLOW_TIMING.inter]);
      }

      [...GLOW_MORSE[letter]].forEach((symbol, symbolIndex) => {
        if (symbolIndex > 0) {
          steps.push([false, GLOW_TIMING.intra]);
        }
        steps.push([true, symbol === "." ? GLOW_TIMING.dot : GLOW_TIMING.dash]);
      });
    });
  });

  steps.push([false, GLOW_REPEAT_PAUSE_MS]);
  return steps;
}

const glowSteps = buildGlowSteps(GLOW_MESSAGE);
let glowStepIndex = 0;
let glowTimeout = null;

function runGlowStep() {
  const [isLit, durationMs] = glowSteps[glowStepIndex];
  glowWord.classList.toggle("is-dark", !isLit);
  glowStepIndex = (glowStepIndex + 1) % glowSteps.length;
  glowTimeout = window.setTimeout(runGlowStep, durationMs);
}

// Leaves the word steadily lit (the CSS default).
function stopGlow() {
  window.clearTimeout(glowTimeout);
  glowWord.classList.remove("is-dark");
}

function startGlow() {
  stopGlow();
  glowStepIndex = 0;

  if (!glowReducedMotion.matches && !document.hidden) {
    runGlowStep();
  }
}

if (glowWord) {
  // Background tabs throttle timers, which would garble the code; restart instead.
  document.addEventListener("visibilitychange", startGlow);
  glowReducedMotion.addEventListener("change", startGlow);
  startGlow();
}
