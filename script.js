const signalTime = document.querySelector("#signal-time");
const currentSymbol = document.querySelector("#current-symbol");
const signalState = document.querySelector("#signal-state");
const pulseWidth = document.querySelector("#pulse-width");
const decodedMessage = document.querySelector("#decoded-message");
const calibrationState = document.querySelector("#calibration-state");
const targetLight = document.querySelector("#target-light");
const signalToggleDot = document.querySelector("#signal-toggle-dot");
const sceneStatus = document.querySelector("#scene-status");
const resetButton = document.querySelector("#reset-morse");

const DESCRIPTION =
  "MORSE WATCHER HELPS YOU DETECT AND DECODE MORSE CODE FROM FLASHING LIGHTS USING YOUR IPHONE CAMERA.";
const UNIT_MS = 133;
const CALIBRATION_MS = 1000;

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

function formatUtcTime() {
  return (
    new Date().toLocaleTimeString("en-US", {
      hour12: false,
      timeZone: "UTC"
    }) + " UTC"
  );
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
          duration: symbol === "." ? UNIT_MS : UNIT_MS * 3,
          symbol,
          code,
          letter
        });

        if (symbolIndex < code.length - 1) {
          sequence.push({ type: "gap", duration: UNIT_MS });
        }
      });

      sequence.push({
        type: "letter-complete",
        duration: 0,
        letter
      });

      if (letterIndex < letters.length - 1) {
        sequence.push({ type: "gap", duration: UNIT_MS * 3 });
      }
    });

    if (wordIndex < words.length - 1) {
      sequence.push({ type: "gap", duration: UNIT_MS * 7 });
      sequence.push({ type: "word-break", duration: 0 });
    }
  });

  return sequence;
}

const playbackSequence = buildSequence(DESCRIPTION);
const fullMorseDisplay = DESCRIPTION.split(" ")
  .map((word) =>
    word
      .split("")
      .map((letter) => MORSE_MAP[letter] || "")
      .filter(Boolean)
      .join(" ")
  )
  .join(" / ");

function clearTimers() {
  window.clearTimeout(playbackTimeout);
  window.clearTimeout(calibrationTimeout);
}

function setActiveState(active) {
  signalState.textContent = active ? "On" : "Off";
  targetLight.style.opacity = active ? "1" : "0.28";
  targetLight.style.transform = active ? "scale(1)" : "scale(0.88)";
  targetLight.style.boxShadow = active
    ? "0 0 18px rgba(201, 255, 122, 0.95), 0 0 42px rgba(127, 217, 183, 0.55)"
    : "0 0 8px rgba(201, 255, 122, 0.18), 0 0 18px rgba(127, 217, 183, 0.12)";
  signalToggleDot.style.opacity = active ? "1" : "0.35";
  signalToggleDot.style.boxShadow = active
    ? "0 0 16px rgba(239, 107, 94, 0.7)"
    : "0 0 6px rgba(239, 107, 94, 0.2)";
}

function enterCalibrationState() {
  sceneStatus.hidden = false;
  sceneStatus.textContent = "CALIBRATING...";
  currentSymbol.textContent = "CALIBRATING...";
  decodedMessage.textContent = "CALIBRATING...";
  calibrationState.textContent = "Calibrating";
  pulseWidth.textContent = `${UNIT_MS} ms`;
  setActiveState(false);
}

function startPlayback() {
  sceneStatus.hidden = true;
  calibrationState.textContent = "Locked";

  let sequenceIndex = 0;
  let decodedText = "";
  let currentLetterSymbols = "";

  function advance() {
    signalTime.textContent = formatUtcTime();

    if (sequenceIndex >= playbackSequence.length) {
      currentSymbol.textContent = fullMorseDisplay;
      decodedMessage.textContent = DESCRIPTION;
      setActiveState(false);
      calibrationState.textContent = "Complete";
      return;
    }

    const step = playbackSequence[sequenceIndex];
    sequenceIndex += 1;

    if (step.type === "pulse") {
      currentLetterSymbols += step.symbol;
      currentSymbol.textContent = currentLetterSymbols;
      decodedMessage.textContent = decodedText || "DECODING...";
      calibrationState.textContent = "Locked";
      pulseWidth.textContent = `${UNIT_MS} ms`;
      setActiveState(true);
      playbackTimeout = window.setTimeout(advance, step.duration);
      return;
    }

    if (step.type === "gap") {
      setActiveState(false);
      currentSymbol.textContent = currentLetterSymbols || fullMorseDisplay;
      playbackTimeout = window.setTimeout(advance, step.duration);
      return;
    }

    if (step.type === "letter-complete") {
      decodedText += step.letter;
      decodedMessage.textContent = decodedText;
      currentLetterSymbols = "";
      currentSymbol.textContent = fullMorseDisplay;
      advance();
      return;
    }

    if (step.type === "word-break") {
      decodedText += " ";
      decodedMessage.textContent = decodedText;
      advance();
    }
  }

  advance();
}

function restartPlayback() {
  clearTimers();
  signalTime.textContent = formatUtcTime();
  enterCalibrationState();
  calibrationTimeout = window.setTimeout(startPlayback, CALIBRATION_MS);
}

resetButton.addEventListener("click", restartPlayback);
signalTime.textContent = formatUtcTime();
restartPlayback();
window.setInterval(() => {
  signalTime.textContent = formatUtcTime();
}, 1000);
