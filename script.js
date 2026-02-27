const signalTime = document.querySelector("#signal-time");
const currentSymbol = document.querySelector("#current-symbol");
const pulseWidth = document.querySelector("#pulse-width");
const decodedMessage = document.querySelector("#decoded-message");
const calibrationState = document.querySelector("#calibration-state");
const targetLight = document.querySelector("#target-light");
const signalToggleDot = document.querySelector("#signal-toggle-dot");
const sceneStatus = document.querySelector("#scene-status");
const resetButton = document.querySelector("#reset-morse");
const onShortInput = document.querySelector("#on-short-ms");
const onLongInput = document.querySelector("#on-long-ms");
const offShortInput = document.querySelector("#off-short-ms");
const offMediumInput = document.querySelector("#off-medium-ms");
const offLongInput = document.querySelector("#off-long-ms");

const DESCRIPTION =
  "MORSE WATCHER HELPS YOU DETECT AND DECODE MORSE CODE FROM FLASHING LIGHTS USING YOUR IPHONE CAMERA.";
const CALIBRATION_MS = 1000;
let timing = {
  onShort: 200,
  onLong: 400,
  offShort: 200,
  offMedium: 500,
  offLong: 1500
};

const MORSE_MAP = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  ".": ".-.-.-",
  ",": "--..--"
};

let playbackTimeout = null;
let calibrationTimeout = null;

function updateMorseDisplay(value) {
  currentSymbol.textContent = value;
  window.requestAnimationFrame(() => {
    currentSymbol.scrollLeft = currentSymbol.scrollWidth;
  });
}

function formatUtcTime() {
  return (
    new Date().toLocaleTimeString("en-US", {
      hour12: false,
      timeZone: "UTC"
    }) + " UTC"
  );
}

function readTiming() {
  timing = {
    onShort: Math.max(1, Number.parseInt(onShortInput.value || "200", 10)),
    onLong: Math.max(1, Number.parseInt(onLongInput.value || "400", 10)),
    offShort: Math.max(1, Number.parseInt(offShortInput.value || "200", 10)),
    offMedium: Math.max(1, Number.parseInt(offMediumInput.value || "500", 10)),
    offLong: Math.max(1, Number.parseInt(offLongInput.value || "1500", 10))
  };
}

function buildSequence(message) {
  const sequence = [];
  const words = message.split(" ");

  words.forEach((word, wordIndex) => {
    const letters = word.split("");

    letters.forEach((letter, letterIndex) => {
      const code = MORSE_MAP[letter];
      if (!code) {
        return;
      }

      code.split("").forEach((symbol, symbolIndex) => {
        sequence.push({
          type: "pulse",
          duration: symbol === "." ? timing.onShort : timing.onLong,
          symbol,
          code,
          letter
        });

        if (symbolIndex < code.length - 1) {
          sequence.push({ type: "gap", duration: timing.offShort });
        }
      });

      sequence.push({
        type: "letter-complete",
        duration: 0,
        letter
      });

      if (letterIndex < letters.length - 1) {
        sequence.push({ type: "gap", duration: timing.offMedium });
      }
    });

    if (wordIndex < words.length - 1) {
      sequence.push({ type: "gap", duration: timing.offLong });
      sequence.push({ type: "word-break", duration: 0 });
    }
  });

  return sequence;
}

function buildFullMorseDisplay(message) {
  return message
    .split(" ")
    .map((word) =>
      word
        .split("")
        .map((letter) => MORSE_MAP[letter] || "")
        .filter(Boolean)
        .join(" ")
    )
    .join(" | ");
}

function clearTimers() {
  window.clearTimeout(playbackTimeout);
  window.clearTimeout(calibrationTimeout);
}

function setActiveState(active) {
  targetLight.style.opacity = active ? "1" : "0.28";
  targetLight.style.transform = active ? "scale(1)" : "scale(0.88)";
  targetLight.style.background = active ? "rgba(255, 255, 255, 1)" : "rgba(127, 217, 183, 0.5)";
  targetLight.style.boxShadow = active
    ? "0 0 18px rgba(255, 255, 255, 0.95), 0 0 42px rgba(255, 255, 255, 0.45)"
    : "0 0 8px rgba(127, 217, 183, 0.18), 0 0 18px rgba(127, 217, 183, 0.12)";
  signalToggleDot.style.opacity = active ? "1" : "0.18";
  signalToggleDot.style.boxShadow = active
    ? "0 0 20px rgba(255, 93, 79, 0.95)"
    : "0 0 4px rgba(239, 107, 94, 0.12)";
}

function enterCalibrationState() {
  sceneStatus.hidden = false;
  sceneStatus.textContent = "CALIBRATING...";
  updateMorseDisplay("CALIBRATING...");
  decodedMessage.textContent = "CALIBRATING...";
  calibrationState.textContent = "Calibrating";
  pulseWidth.textContent = `${timing.onShort} / ${timing.onLong} ms`;
  setActiveState(false);
}

function startPlayback() {
  sceneStatus.hidden = true;
  calibrationState.textContent = "Locked";
  const playbackSequence = buildSequence(DESCRIPTION);
  const fullMorseDisplay = buildFullMorseDisplay(DESCRIPTION);
  const loopPauseMs = timing.offLong;

  let sequenceIndex = 0;
  let decodedText = "";
  let currentLetterSymbols = "";
  let morseOutput = "";

  function advance() {
    signalTime.textContent = formatUtcTime();

    if (sequenceIndex >= playbackSequence.length) {
      updateMorseDisplay(fullMorseDisplay);
      decodedMessage.textContent = DESCRIPTION;
      setActiveState(false);
      calibrationState.textContent = "Complete";
      playbackTimeout = window.setTimeout(restartPlayback, loopPauseMs);
      return;
    }

    const step = playbackSequence[sequenceIndex];
    sequenceIndex += 1;

    if (step.type === "pulse") {
      currentLetterSymbols += step.symbol;
      updateMorseDisplay(`${morseOutput}${currentLetterSymbols}`.trim());
      decodedMessage.textContent = decodedText || "DECODING...";
      calibrationState.textContent = "Locked";
      pulseWidth.textContent = `${timing.onShort} / ${timing.onLong} ms`;
      setActiveState(true);
      playbackTimeout = window.setTimeout(advance, step.duration);
      return;
    }

    if (step.type === "gap") {
      setActiveState(false);
      updateMorseDisplay(`${morseOutput}${currentLetterSymbols}`.trim() || "DECODING...");
      playbackTimeout = window.setTimeout(advance, step.duration);
      return;
    }

    if (step.type === "letter-complete") {
      decodedText += step.letter;
      decodedMessage.textContent = decodedText;
      morseOutput += `${currentLetterSymbols} `;
      currentLetterSymbols = "";
      updateMorseDisplay(morseOutput.trim());
      advance();
      return;
    }

    if (step.type === "word-break") {
      decodedText += " ";
      decodedMessage.textContent = decodedText;
      morseOutput += "| ";
      updateMorseDisplay(morseOutput.trim());
      advance();
    }
  }

  advance();
}

function restartPlayback() {
  clearTimers();
  readTiming();
  signalTime.textContent = formatUtcTime();
  enterCalibrationState();
  calibrationTimeout = window.setTimeout(startPlayback, CALIBRATION_MS);
}

resetButton.addEventListener("click", restartPlayback);
[
  onShortInput,
  onLongInput,
  offShortInput,
  offMediumInput,
  offLongInput
].forEach((input) => {
  input.addEventListener("change", restartPlayback);
});
signalTime.textContent = formatUtcTime();
restartPlayback();
window.setInterval(() => {
  signalTime.textContent = formatUtcTime();
}, 1000);
