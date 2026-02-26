const signalTime = document.querySelector("#signal-time");
const currentSymbol = document.querySelector("#current-symbol");
const signalState = document.querySelector("#signal-state");
const pulseWidth = document.querySelector("#pulse-width");
const decodedMessage = document.querySelector("#decoded-message");

const signalFrames = [
  { symbol: ".-", state: "Active", width: "180 ms", message: "MW" },
  { symbol: "-", state: "Tracking", width: "260 ms", message: "M" },
  { symbol: ". .", state: "Stable", width: "120 ms", message: "E E" },
  { symbol: "--.", state: "Locked", width: "310 ms", message: "G" }
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
  frameIndex = (frameIndex + 1) % signalFrames.length;
}

renderSignalFrame();
setInterval(renderSignalFrame, 1600);
