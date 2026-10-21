const signalTime = document.querySelector("#signal-time");
const currentSymbol = document.querySelector("#current-symbol");
const pulseWidth = document.querySelector("#pulse-width");
const decodedMessage = document.querySelector("#decoded-message");
const decodedMessageTrigger = document.querySelector("#decoded-message-trigger");
const calibrationState = document.querySelector("#calibration-state");
const fullscreenLightTrigger = document.querySelector("#fullscreen-light-trigger");
const targetLight = document.querySelector("#target-light");
const signalToggleDot = document.querySelector("#signal-toggle-dot");
const sceneStatus = document.querySelector("#scene-status");
const resetButton = document.querySelector("#reset-morse");
const onShortInput = document.querySelector("#on-short-ms");
const onLongInput = document.querySelector("#on-long-ms");
const offShortInput = document.querySelector("#off-short-ms");
const offMediumInput = document.querySelector("#off-medium-ms");
const offLongInput = document.querySelector("#off-long-ms");
const messageEditor = document.querySelector("#message-editor");
const messageEditorClose = document.querySelector("#message-editor-close");
const messageEditorCancel = document.querySelector("#message-editor-cancel");
const messageEditorForm = document.querySelector("#message-editor-form");
const messageTextInput = document.querySelector("#message-text-input");
const messageMorseInput = document.querySelector("#message-morse-input");
const fullscreenLight = document.querySelector("#fullscreen-light");
const fullscreenLightClose = document.querySelector("#fullscreen-light-close");
const fullscreenLightFlash = document.querySelector("#fullscreen-light-flash");
const introCarousel = document.querySelector("#intro-carousel");
const introCarouselDots = document.querySelector("#intro-carousel-dots");
const subscribeForm = document.querySelector("#subscribe-form");
const subscribeEmailInput = document.querySelector("#subscribe-email");
const subscribeSubmitButton = document.querySelector("#subscribe-submit");
const subscribeFeedback = document.querySelector("#subscribe-feedback");

// Email subscribe configuration
// Replace with your Loops.so form endpoint from Forms -> Settings (e.g. "https://app.loops.so/api/newsletter-form/...")
const LOOPS_FORM_ENDPOINT = "YOUR_LOOPS_ENDPOINT_URL";

const DESCRIPTION =
  "MORSE WATCHER HELPS YOU DETECT AND DECODE MORSE CODE FROM FLASHING LIGHTS USING YOUR IPHONE CAMERA.";
const CALIBRATION_MS = 1000;
const UNKNOWN_SYMBOL = "□";
let timing = {
  onShort: 200,
  onLong: 600,
  offShort: 200,
  offMedium: 600,
  offLong: 1400
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
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  _: "..--.-",
  "\"": ".-..-.",
  "$": "...-..-",
  "@": ".--.-."
};

let playbackTimeout = null;
let calibrationTimeout = null;
let playbackMessage = DESCRIPTION;
let carouselDragStartX = 0;
let carouselDragStartScrollLeft = 0;
let isCarouselDragging = false;
let carouselSettleTimeout = null;

function getCarouselStep() {
  const slide = introCarousel?.querySelector(".intro-carousel__slide");

  if (!slide || !introCarousel) {
    return 0;
  }

  const styles = window.getComputedStyle(introCarousel);
  const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");
  return slide.getBoundingClientRect().width + gap;
}

const CAROUSEL_AUTOPLAY_MS = 4000;
const CAROUSEL_RESUME_DELAY_MS = 6000;
let carouselResumeAt = 0;
let isCarouselHovered = false;
let isCarouselVisible = false;

function getCarouselMaxScroll() {
  return Math.max(0, introCarousel.scrollWidth - introCarousel.clientWidth);
}

// Number of distinct snap positions: 4 on phones (one slide per view), fewer on
// wide screens where several slides are visible at once.
function getCarouselStopCount() {
  const step = getCarouselStep();
  const maxScrollLeft = getCarouselMaxScroll();
  return step > 0 && maxScrollLeft > 1 ? Math.round(maxScrollLeft / step) + 1 : 1;
}

function getCarouselIndex() {
  const maxScrollLeft = getCarouselMaxScroll();

  if (introCarousel.scrollLeft >= maxScrollLeft - 2) {
    return getCarouselStopCount() - 1;
  }

  return Math.round(introCarousel.scrollLeft / getCarouselStep());
}

function goToIntroCarouselSlide(index) {
  introCarousel.scrollTo({
    left: Math.min(getCarouselMaxScroll(), index * getCarouselStep()),
    behavior: "smooth"
  });
}

function renderIntroCarouselDots() {
  if (!introCarousel || !introCarouselDots) {
    return;
  }

  const count = getCarouselStopCount();

  if (introCarouselDots.childElementCount !== count) {
    introCarouselDots.replaceChildren(
      ...Array.from({ length: count }, (_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "intro-carousel-dot";
        dot.setAttribute("aria-label", `Show app screenshot ${index + 1}`);
        dot.addEventListener("click", () => {
          pauseIntroCarousel();
          goToIntroCarouselSlide(index);
        });
        return dot;
      })
    );
  }

  introCarouselDots.hidden = count < 2;
  updateIntroCarouselDots();
}

function updateIntroCarouselDots() {
  if (!introCarousel || !introCarouselDots) {
    return;
  }

  const activeIndex = getCarouselIndex();
  [...introCarouselDots.children].forEach((dot, index) => {
    dot.setAttribute("aria-current", index === activeIndex ? "true" : "false");
  });
}

function pauseIntroCarousel() {
  carouselResumeAt = Date.now() + CAROUSEL_RESUME_DELAY_MS;
}

function advanceIntroCarousel() {
  if (
    !introCarousel ||
    !isCarouselVisible ||
    isCarouselHovered ||
    isCarouselDragging ||
    document.hidden ||
    Date.now() < carouselResumeAt
  ) {
    return;
  }

  const count = getCarouselStopCount();

  if (count > 1) {
    // After the last screenshot, slide back to the first one.
    goToIntroCarouselSlide((getCarouselIndex() + 1) % count);
  }
}

function startIntroCarouselAutoplay() {
  if (!introCarousel || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  new IntersectionObserver(([entry]) => {
    isCarouselVisible = entry.isIntersecting;
  }, { threshold: 0.5 }).observe(introCarousel);

  window.setInterval(advanceIntroCarousel, CAROUSEL_AUTOPLAY_MS);
}

function startIntroCarouselDrag(event) {
  // Touch and pen use native swipe scrolling; only mouse needs JS drag.
  if (!introCarousel || event.pointerType !== "mouse" || event.button !== 0) {
    return;
  }

  window.clearTimeout(carouselSettleTimeout);
  isCarouselDragging = true;
  carouselDragStartX = event.clientX;
  carouselDragStartScrollLeft = introCarousel.scrollLeft;
  introCarousel.classList.add("is-dragging");
  introCarousel.classList.add("is-settling");
  introCarousel.setPointerCapture?.(event.pointerId);
}

function moveIntroCarouselDrag(event) {
  if (!introCarousel || !isCarouselDragging) {
    return;
  }

  event.preventDefault();
  const dragDistance = event.clientX - carouselDragStartX;
  introCarousel.scrollLeft = carouselDragStartScrollLeft - dragDistance;
  updateIntroCarouselDots();
}

function endIntroCarouselDrag(event) {
  if (!introCarousel || !isCarouselDragging) {
    return;
  }

  isCarouselDragging = false;
  introCarousel.classList.remove("is-dragging");
  introCarousel.releasePointerCapture?.(event.pointerId);
  settleIntroCarousel();
}

function settleIntroCarousel() {
  if (!introCarousel) {
    return;
  }

  const step = getCarouselStep();
  const maxScrollLeft = Math.max(0, introCarousel.scrollWidth - introCarousel.clientWidth);
  const targetScrollLeft = step > 0
    ? Math.min(maxScrollLeft, Math.max(0, Math.round(introCarousel.scrollLeft / step) * step))
    : introCarousel.scrollLeft;

  introCarousel.scrollTo({
    left: targetScrollLeft,
    behavior: "smooth"
  });

  window.clearTimeout(carouselSettleTimeout);
  carouselSettleTimeout = window.setTimeout(() => {
    introCarousel.classList.remove("is-settling");
    updateIntroCarouselDots();
  }, 320);

  updateIntroCarouselDots();
}

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
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC"
    }) + " UTC"
  );
}

function readTiming() {
  timing = {
    onShort: Math.max(1, Number.parseInt(onShortInput.value || "200", 10)),
    onLong: Math.max(1, Number.parseInt(onLongInput.value || "600", 10)),
    offShort: Math.max(1, Number.parseInt(offShortInput.value || "200", 10)),
    offMedium: Math.max(1, Number.parseInt(offMediumInput.value || "600", 10)),
    offLong: Math.max(1, Number.parseInt(offLongInput.value || "1400", 10))
  };
}

function encodeCharacterToMorse(character) {
  return MORSE_MAP[character.toUpperCase()] || UNKNOWN_SYMBOL;
}

function encodeMessageToMorse(message) {
  return message
    .split(" ")
    .map((word) => word.split("").map(encodeCharacterToMorse).join(" "))
    .join(" | ");
}

function buildSequence(message) {
  const sequence = [];
  const letters = Array.from(message);

  letters.forEach((letter, letterIndex) => {
    if (letter === " ") {
      if (letterIndex > 0 && letters[letterIndex - 1] !== " ") {
        sequence.push({ type: "gap", duration: timing.offLong });
        sequence.push({ type: "word-break", duration: 0 });
      }

      return;
    }

    const code = MORSE_MAP[letter.toUpperCase()];

    if (!code) {
      sequence.push({
        type: "unsupported",
        duration: 0,
        letter
      });
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
        sequence.push({
          type: "gap",
          duration: timing.offShort
        });
      }
    });

    sequence.push({
      type: "letter-complete",
      duration: 0,
      letter
    });

    if (letterIndex < letters.length - 1 && letters[letterIndex + 1] !== " ") {
      sequence.push({ type: "gap", duration: timing.offMedium });
    }
  });

  return sequence;
}

function buildFullMorseDisplay(message) {
  return encodeMessageToMorse(message);
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
  fullscreenLightFlash.style.opacity = active ? "1" : "0.16";
  fullscreenLightFlash.style.background = active ? "rgba(255, 255, 255, 1)" : "rgba(127, 217, 183, 0.1)";
  fullscreenLightFlash.style.boxShadow = active
    ? "inset 0 0 120px rgba(255, 255, 255, 0.95), 0 0 180px rgba(255, 255, 255, 0.4)"
    : "inset 0 0 80px rgba(127, 217, 183, 0.08)";
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
  const playbackSequence = buildSequence(playbackMessage);
  const fullMorseDisplay = buildFullMorseDisplay(playbackMessage);
  const loopPauseMs = timing.offLong;

  let sequenceIndex = 0;
  let decodedText = "";
  let currentLetterSymbols = "";
  let morseOutput = "";

  function advance() {
    signalTime.textContent = formatUtcTime();

    if (sequenceIndex >= playbackSequence.length) {
      updateMorseDisplay(fullMorseDisplay || " ");
      decodedMessage.textContent = playbackMessage;
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

    if (step.type === "unsupported") {
      decodedText += step.letter;
      decodedMessage.textContent = decodedText;
      morseOutput += `${UNKNOWN_SYMBOL} `;
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

function openMessageEditor() {
  messageTextInput.value = playbackMessage;
  messageMorseInput.value = encodeMessageToMorse(playbackMessage);
  messageEditor.showModal();
}

function closeMessageEditor() {
  if (messageEditor.open) {
    messageEditor.close();
  }
}

function saveEditedMessage() {
  playbackMessage = messageTextInput.value;
  restartPlayback();
  closeMessageEditor();
}

function openFullscreenLight() {
  if (!fullscreenLight.open) {
    fullscreenLight.showModal();
  }
}

function closeFullscreenLight() {
  if (fullscreenLight.open) {
    fullscreenLight.close();
  }
}

resetButton.addEventListener("click", restartPlayback);
decodedMessageTrigger.addEventListener("click", openMessageEditor);
fullscreenLightTrigger.addEventListener("click", openFullscreenLight);
fullscreenLightClose.addEventListener("click", closeFullscreenLight);
messageEditorClose.addEventListener("click", closeMessageEditor);
messageEditorCancel.addEventListener("click", closeMessageEditor);
messageTextInput.addEventListener("input", () => {
  messageMorseInput.value = encodeMessageToMorse(messageTextInput.value);
});
messageEditorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveEditedMessage();
});
messageEditor.addEventListener("click", (event) => {
  if (event.target === messageEditor) {
    closeMessageEditor();
  }
});
fullscreenLight.addEventListener("click", (event) => {
  if (event.target === fullscreenLight) {
    closeFullscreenLight();
  }
});
introCarousel?.addEventListener("scroll", updateIntroCarouselDots, { passive: true });
introCarousel?.addEventListener("pointerdown", pauseIntroCarousel);
introCarousel?.addEventListener("wheel", pauseIntroCarousel, { passive: true });
introCarousel?.addEventListener("mouseenter", () => { isCarouselHovered = true; });
introCarousel?.addEventListener("mouseleave", () => { isCarouselHovered = false; });
introCarousel?.addEventListener("pointerdown", startIntroCarouselDrag);
introCarousel?.addEventListener("pointermove", moveIntroCarouselDrag);
introCarousel?.addEventListener("pointerup", endIntroCarouselDrag);
introCarousel?.addEventListener("pointercancel", endIntroCarouselDrag);
introCarousel?.addEventListener("pointerleave", endIntroCarouselDrag);
window.addEventListener("resize", renderIntroCarouselDots);
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
renderIntroCarouselDots();
startIntroCarouselAutoplay();
restartPlayback();

async function handleSubscribeSubmit(event) {
  event.preventDefault();
  if (!subscribeEmailInput || !subscribeSubmitButton || !subscribeFeedback) {
    return;
  }

  const email = subscribeEmailInput.value.trim();
  if (!email) {
    return;
  }

  subscribeSubmitButton.disabled = true;
  const originalButtonText = subscribeSubmitButton.textContent;
  subscribeSubmitButton.textContent = "Transmitting...";
  subscribeFeedback.className = "subscribe-feedback";
  subscribeFeedback.textContent = "";

  const isPlaceholder =
    !LOOPS_FORM_ENDPOINT ||
    LOOPS_FORM_ENDPOINT === "YOUR_LOOPS_ENDPOINT_URL" ||
    LOOPS_FORM_ENDPOINT.includes("YOUR_LOOPS");

  if (isPlaceholder) {
    // Simulated demo mode for previewing before creating a Loops account
    setTimeout(() => {
      subscribeSubmitButton.disabled = false;
      subscribeSubmitButton.textContent = originalButtonText;
      subscribeFeedback.className = "subscribe-feedback subscribe-feedback--success";
      subscribeFeedback.textContent = "Signal received! [Demo mode] You're on the list for promo codes and updates.";
      subscribeEmailInput.value = "";
    }, 600);
    return;
  }

  try {
    const formData = new FormData(subscribeForm);
    const params = new URLSearchParams(formData);

    const response = await fetch(LOOPS_FORM_ENDPOINT, {
      method: "POST",
      body: params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    if (response.ok) {
      subscribeFeedback.className = "subscribe-feedback subscribe-feedback--success";
      subscribeFeedback.textContent = "Signal received! You're on the list for promo codes and updates.";
      subscribeEmailInput.value = "";
    } else {
      const data = await response.json().catch(() => null);
      subscribeFeedback.className = "subscribe-feedback subscribe-feedback--error";
      subscribeFeedback.textContent =
        data && data.message ? data.message : "Failed to transmit. Please try again.";
    }
  } catch (error) {
    subscribeFeedback.className = "subscribe-feedback subscribe-feedback--error";
    subscribeFeedback.textContent = "Connection issue. Please verify network and try again.";
  } finally {
    subscribeSubmitButton.disabled = false;
    subscribeSubmitButton.textContent = originalButtonText;
  }
}

subscribeForm?.addEventListener("submit", handleSubscribeSubmit);
