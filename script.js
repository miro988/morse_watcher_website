const signalTime = document.querySelector("#signal-time");
const currentSymbol = document.querySelector("#current-symbol");
const signalState = document.querySelector("#signal-state");
const pulseWidth = document.querySelector("#pulse-width");
const decodedMessage = document.querySelector("#decoded-message");
const calibrationState = document.querySelector("#calibration-state");
const targetLight = document.querySelector("#target-light");
const signalToggleDot = document.querySelector("#signal-toggle-dot");

const signalFrames = [
  {
    symbol: ".-.. / .. / --. / .... / -",
    state: "On",
    width: "133 ms",
    calibration: "Locked",
    message:
      "MORSE WATCHER HELPS YOU DETECT AND DECODE MORSE CODE FROM FLASHING LIGHTS USING YOUR IPHONE CAMERA.",
    active: true
  },
  {
    symbol: "-. / --- / .--",
    state: "Off",
    width: "216 ms",
    calibration: "Sampling",
    message:
      "MONITOR A BLINKING LIGHT SOURCE IN REAL TIME AND CONVERT PULSE TIMING INTO MORSE SYMBOLS.",
    active: false
  },
  {
    symbol: ".-. / --- / ..",
    state: "On",
    width: "133 ms",
    calibration: "Locked",
    message:
      "VIEW DECODED PLAIN TEXT OUTPUT INSTANTLY, SET ROI, AND LOCK EXPOSURE FOR STABLE RESULTS.",
    active: true
  }
];

let frameIndex = 0;

function formatUtcTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
    timeZone: "UTC"
  }) + " UTC";
}

function renderSignalFrame() {
  const frame = signalFrames[frameIndex];
  signalTime.textContent = formatUtcTime();
  currentSymbol.textContent = frame.symbol;
  signalState.textContent = frame.state;
  pulseWidth.textContent = frame.width;
  decodedMessage.textContent = frame.message;
  calibrationState.textContent = frame.calibration;
  targetLight.style.opacity = frame.active ? "1" : "0.28";
  targetLight.style.transform = frame.active ? "scale(1)" : "scale(0.88)";
  signalToggleDot.style.opacity = frame.active ? "1" : "0.35";
  frameIndex = (frameIndex + 1) % signalFrames.length;
}

renderSignalFrame();
setInterval(renderSignalFrame, 1600);
