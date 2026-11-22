// Shared "flashing link" page. The Translator's share button packs the message
// into the URL hash, so nothing is sent to or stored on a server:
//   message.html#<base64url of {"t": text, "c": morse, "d": dot ms}>
// "c" is the Translator's own Morse ("..." letters split by spaces, words by " | "),
// so every language the Translator supports flashes correctly here.

const lamp = document.querySelector("#flash-lamp");
const tape = document.querySelector("#flash-tape");
const revealButton = document.querySelector("#flash-reveal");
const answer = document.querySelector("#flash-answer");

const DEFAULT_MESSAGE = { t: "HELLO", c: ".... . .-.. .-.. ---", d: 200 };

function decodeMessage(hash) {
  try {
    const b64 = hash.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof data.t !== "string" || typeof data.c !== "string" || !/^[.\- |□]+$/.test(data.c)) return null;
    return {
      t: data.t.slice(0, 200),
      c: data.c.slice(0, 2000),
      d: Math.min(600, Math.max(60, Number(data.d) || 200))
    };
  } catch {
    return null;
  }
}

const message = decodeMessage(location.hash.slice(1)) || DEFAULT_MESSAGE;

// Words are split by "|", letters by spaces; "□" marks a character without Morse.
const words = message.c
  .split("|")
  .map((word) => word.trim().split(/\s+/).filter((code) => code && code !== "□"))
  .filter((word) => word.length);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function newChip() {
  const chip = document.createElement("span");
  chip.className = "morse-char-chip";
  tape.appendChild(chip);
  return chip;
}

function addMark(chip, symbol) {
  const mark = document.createElement("span");
  mark.className = symbol === "." ? "morse-dot" : "morse-dash";
  chip.appendChild(mark);
}

async function play() {
  const dot = message.d;
  for (;;) {
    tape.textContent = "";
    for (const [wordIndex, word] of words.entries()) {
      if (wordIndex > 0) {
        const sep = document.createElement("span");
        sep.className = "morse-char-sep";
        sep.textContent = "|";
        tape.appendChild(sep);
      }
      for (const [letterIndex, code] of word.entries()) {
        const chip = newChip();
        for (const [symbolIndex, symbol] of [...code].entries()) {
          lamp.classList.add("is-on");
          addMark(chip, symbol);
          await wait(symbol === "." ? dot : dot * 3);
          lamp.classList.remove("is-on");
          // Gap after the mark: 1 unit inside a letter, 3 between letters, 7 between words.
          const lastInLetter = symbolIndex === code.length - 1;
          const lastInWord = lastInLetter && letterIndex === word.length - 1;
          await wait(lastInWord ? dot * 7 : lastInLetter ? dot * 3 : dot);
        }
      }
    }
    // Pause before repeating so the start of the message is easy to spot.
    await wait(dot * 10);
  }
}

revealButton.addEventListener("click", () => {
  answer.textContent = message.t;
  revealButton.hidden = true;
  if (typeof gtag === "function") gtag("event", "flash_link_reveal");
});

// Keep the screen awake so the camera can keep reading it.
async function keepAwake() {
  try {
    if ("wakeLock" in navigator && document.visibilityState === "visible") await navigator.wakeLock.request("screen");
  } catch {
    // Refused (e.g. Low Power Mode or before a first tap); the next tap tries again.
  }
}
document.addEventListener("click", keepAwake);
document.addEventListener("visibilitychange", keepAwake);
keepAwake();

if (words.length) play();
