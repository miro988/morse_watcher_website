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

const DESCRIPTION = "HELLO WORLD";
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
  "@": ".--.-.",
  // Armenian Alphabet (Հայերեն Մորզե)
  "Ա": ".-",
  "ա": ".-",
  "Բ": "-...",
  "բ": "-...",
  "Գ": "--.",
  "գ": "--.",
  "Դ": "-..",
  "դ": "-..",
  "Ե": ".",
  "ե": ".",
  "Զ": "--..",
  "զ": "--..",
  "Է": "..-..",
  "է": "..-..",
  "Ը": "..",
  "ը": "..",
  "Թ": "-.-.",
  "թ": "-.-.",
  "Ժ": ".---",
  "ժ": ".---",
  "Ի": "..",
  "ի": "..",
  "Լ": ".-..",
  "լ": ".-..",
  "Խ": "----",
  "խ": "----",
  "Ծ": ".-.-",
  "ծ": ".-.-",
  "Կ": "-.-",
  "կ": "-.-",
  "Հ": "....",
  "հ": "....",
  "Ձ": "..-.",
  "ձ": "..-.",
  "Ղ": ".--.",
  "ղ": ".--.",
  "Ճ": "...-",
  "ճ": "...-",
  "Մ": "--",
  "մ": "--",
  "Յ": ".-.",
  "յ": ".-.",
  "Ն": "-.",
  "ն": "-.",
  "Շ": "---.",
  "շ": "---.",
  "Ո": "---",
  "ո": "---",
  "Չ": "---.",
  "չ": "---.",
  "Պ": ".--.",
  "պ": ".--.",
  "Ջ": "..---",
  "ջ": "..---",
  "Ռ": ".-.",
  "ռ": ".-.",
  "Ս": "...",
  "ս": "...",
  "Վ": "...-",
  "վ": "...-",
  "Տ": "-",
  "տ": "-",
  "Ր": ".-.",
  "ր": ".-.",
  "Ց": "-.-.",
  "ց": "-.-.",
  "Փ": "..-..",
  "փ": "..-..",
  "Ք": "-.-.",
  "ք": "-.-.",
  "և": ".-..-",
  "եւ": ".-..-",
  "ԵՒ": ".-..-",
  "Ւ": "..--",
  "ւ": "..--",
  "ՈՒ": "..--",
  "ու": "..--",
  "Օ": "---",
  "օ": "---",
  "Ֆ": "..-..",
  "ֆ": "..-..",
  "։": "---...",
  "՝": "--..--",
  "՜": "-.-.--",
  "՞": "..--..",
  "«": ".-..-.",
  "»": ".-..-.",
  // International Accents
  "Ñ": "--.--", "ñ": "--.--",
  "Á": ".-.-", "á": ".-.-",
  "É": "..-..", "é": "..-..",
  "Í": "..", "í": "..",
  "Ó": "---.", "ó": "---.",
  "Ú": "..--", "ú": "..--",
  "Ä": ".-.-", "ä": ".-.-",
  "Ö": "---.", "ö": "---.",
  "Ü": "..--", "ü": "..--",
  "ß": "...--..",
  "À": ".--.-", "à": ".--.-",
  "È": ".-..-", "è": ".-..-",
  "Ç": "-.-..", "ç": "-.-..",
  "¿": "..-.-", "¡": "--...-",

  // Russian Cyrillic Alphabet (Русский Морзе)
  "А": ".-", "а": ".-",
  "Б": "-...", "б": "-...",
  "В": ".--", "в": ".--",
  "Г": "--.", "г": "--.",
  "Д": "-..", "д": "-..",
  "Е": ".", "е": ".",
  "Ё": ".", "ё": ".",
  "Ж": "...-", "ж": "...-",
  "З": "--..", "з": "--..",
  "И": "..", "и": "..",
  "Й": ".---", "й": ".---",
  "К": "-.-", "к": "-.-",
  "Л": ".-..", "л": ".-..",
  "М": "--", "м": "--",
  "Н": "-.", "н": "-.",
  "О": "---", "о": "---",
  "П": ".--.", "п": ".--.",
  "Р": ".-.", "р": ".-.",
  "С": "...", "с": "...",
  "Т": "-", "т": "-",
  "У": "..-", "у": "..-",
  "Ф": "..-.", "ф": "..-.",
  "Х": "....", "х": "....",
  "Ц": "-.-.", "ц": "-.-.",
  "Ч": "---.", "ч": "---.",
  "Ш": "----", "ш": "----",
  "Щ": "--.-", "щ": "--.-",
  "Ъ": "--.--", "ъ": "--.--",
  "Ы": "-.--", "ы": "-.--",
  "Ь": "-..-", "ь": "-..-",
  "Э": "..-..", "э": "..-..",
  "Ю": "..--", "ю": "..--",
  "Я": ".-.-", "я": ".-.-",

  // Persian Alphabet (کد مورس فارسی)
  "ا": ".-", "آ": ".-",
  "ب": "-...", "پ": ".--.",
  "ت": "-", "ث": "-.-.",
  "ج": ".---", "چ": "---.",
  "ح": "....", "خ": "----",
  "د": "-..", "ذ": "--..",
  "ر": ".-.", "ز": "--..",
  "ژ": "--.", "س": "...",
  "ش": "----", "ص": "-.-.",
  "ض": "-..", "ط": "--.",
  "ظ": "-.--", "ع": ".-.-",
  "غ": "--.", "ف": "..-.",
  "ق": "--.-", "ک": "-.-",
  "گ": "--.", "ل": ".-..",
  "م": "--", "ن": "-.",
  "و": ".--", "ه": ".",
  "ی": "..", "ي": "..",

  // Japanese Wabun Code (和文モールス符号)
  "ア": "--.--", "あ": "--.--",
  "イ": ".-", "い": ".-",
  "ウ": "..-", "う": "..-",
  "エ": "-.---", "え": "-.---",
  "オ": ".-...", "お": ".-...",
  "カ": ".-..", "か": ".-..",
  "キ": "-.-..", "き": "-.-..",
  "ク": "...-", "く": "...-",
  "ケ": "-.--", "け": "-.--",
  "コ": "----", "こ": "----",
  "サ": "-.-.-", "さ": "-.-.-",
  "シ": "--.-.", "し": "--.-.",
  "ス": "---.-", "す": "---.-",
  "セ": ".---.", "せ": ".---.",
  "ソ": "---.", "そ": "---.",
  "タ": "-.", "た": "-.",
  "チ": "..-.", "ち": "..-.",
  "ツ": ".--.", "つ": ".--.",
  "テ": ".-.--", "て": ".-.--",
  "ト": "..-..", "と": "..-..",
  "ナ": ".-.", "な": ".-.",
  "ニ": "-.-.", "に": "-.-.",
  "ヌ": "....", "ぬ": "....",
  "ネ": "--.-", "ね": "--.-",
  "ノ": "..--", "の": "..--",
  "ハ": "-...", "は": "-...",
  "ヒ": "--..-", "ひ": "--..-",
  "フ": "--..", "ふ": "--..",
  "ヘ": ".", "へ": ".",
  "ホ": "-..", "ほ": "-..",
  "マ": "-..-", "ま": "-..-",
  "ミ": "..-.-", "み": "..-.-",
  "ム": "-", "む": "-",
  "メ": "-...-", "め": "-...-",
  "モ": "-..-.", "も": "-..-.",
  "ヤ": ".--", "や": ".--",
  "ユ": "-..--", "ゆ": "-..--",
  "ヨ": "--", "よ": "--",
  "ラ": "...", "ら": "...",
  "リ": "--.", "り": "--.",
  "ル": "-.--.", "る": "-.--.",
  "レ": "---", "れ": "---",
  "ロ": ".-.-", "ろ": ".-.-",
  "ワ": "-.-", "わ": "-.-",
  "ヰ": ".-..-", "ゐ": ".-..-",
  "ヱ": ".--..", "ゑ": ".--..",
  "ヲ": ".--.-", "を": ".--.-",
  "ン": ".-.-.", "ん": ".-.-.",
  "ー": ".--.-",
  "、": ".-.-.-",
  "。": ".-.-..",
  "゛": "..",
  "゜": "..--."

};

const LATIN_REVERSE_MAP = {
  ".": "E",
  "-": "T",
  "..": "I",
  ".-": "A",
  "-.": "N",
  "--": "M",
  "...": "S",
  "..-": "U",
  ".-.": "R",
  ".--": "W",
  "-..": "D",
  "-.-": "K",
  "--.": "G",
  "---": "O",
  "....": "H",
  "...-": "V",
  "..-.": "F",
  ".-..": "L",
  ".--.": "P",
  ".---": "J",
  "-...": "B",
  "-..-": "X",
  "-.-.": "C",
  "-.--": "Y",
  "--..": "Z",
  "--.-": "Q",
  "-----": "0",
  ".----": "1",
  "..---": "2",
  "...--": "3",
  "....-": "4",
  ".....": "5",
  "-....": "6",
  "--...": "7",
  "---..": "8",
  "----.": "9"
};


const RUSSIAN_REVERSE_MAP = {
  ".": "Е", "-": "Т", "..": "И", ".-": "А", "-.": "Н", "--": "М",
  "...": "С", "..-": "У", ".-.": "Р", ".--": "В", "-..": "Д", "-.-": "К",
  "--.": "Г", "---": "О", "....": "Х", "...-": "Ж", "..-.": "Ф", ".-..": "Л",
  ".--.": "П", ".---": "Й", "-...": "Б", "-..-": "Ь", "-.-.": "Ц", "-.--": "Ы",
  "--..": "З", "--.-": "Щ", "----": "Ш", "--.--": "Ъ", "..-..": "Э", "..--": "Ю",
  ".-.-": "Я"
};

const PERSIAN_REVERSE_MAP = {
  ".": "ه", "-": "ت", "..": "ی", ".-": "ا", "-.": "ن", "--": "م",
  "...": "س", "..-": "ف", ".-.": "ر", ".--": "و", "-..": "د", "-.-": "ک",
  "--.": "گ", "---": "چ", "....": "ح", "...-": "Ж", ".--.": "پ", ".---": "ج",
  "-...": "ب", "-..-": "Ь", "-.-.": "ث", "-.--": "ظ", "--..": "ز", "--.-": "ق",
  "----": "خ", ".-.-": "ع"
};

const ARMENIAN_REVERSE_MAP = {
  ".": "Ե",
  "-": "Տ",
  "..": "Ի",
  ".-": "Ա",
  "-.": "Ն",
  "--": "Մ",
  "...": "Ս",
  "..-": "Ւ",
  ".-.": "Ր",
  ".--": "Վ",
  "-..": "Դ",
  "-.-": "Կ",
  "--.": "Գ",
  "---": "Ո",
  "....": "Հ",
  "...-": "Ճ",
  "..-.": "Ձ",
  ".-..": "Լ",
  ".--.": "Պ",
  ".---": "Ժ",
  "-...": "Բ",
  "-..-": "Խ",
  "-.-.": "Թ",
  "-.--": "Յ",
  "--..": "Զ",
  "--.-": "Ք",
  "----": "Խ",
  "..--": "ՈՒ",
  "---.": "Շ"
};

const JAPANESE_REVERSE_MAP = {
  ".": "ヘ", "-": "ム", "..": "゛", ".-": "イ", "-.": "タ", "--": "ヨ",
  "...": "ラ", "..-": "ウ", ".-.": "ナ", ".--": "ヤ", "-..": "ホ", "-.-": "ワ",
  "--.": "リ", "---": "レ", "....": "ヌ", "...-": "ク", "..-.": "チ", ".-..": "カ",
  ".--.": "ツ", "-...": "ハ", "-..-": "マ", "-.-.": "ニ", "-.--": "ケ",
  "--..": "フ", "--.-": "ネ", "----": "コ", "..--": "ノ", ".-.-": "ロ", "---.": "ソ",
  "--.--": "ア", "-.---": "エ", ".-...": "オ", "-.-.-": "サ", "--.-.": "シ",
  "---.-": "ス", ".---.": "セ", ".-.--": "テ", "..-..": "ト", "--..-": "ヒ",
  "..-.-": "ミ", "-...-": "メ", "-..-.": "モ", "-..--": "ユ", "-.--.": "ル",
  ".--.-": "ー", ".-.-.": "ン", "..--.": "゜", ".-.-.-": "、", ".-.-..": "。"
};

function getIntermediateCharacter(code, fallbackLetter = "") {
  const lang = (typeof document !== "undefined" && document.documentElement?.lang) || "en";
  if (lang === "ja" || /[\u3040-\u309F\u30A0-\u30FF]/.test(playbackMessage)) {
    return JAPANESE_REVERSE_MAP[code] || LATIN_REVERSE_MAP[code] || fallbackLetter;
  }
  if (lang === "ru" || /[\u0400-\u04FF]/.test(playbackMessage)) {
    return RUSSIAN_REVERSE_MAP[code] || LATIN_REVERSE_MAP[code] || fallbackLetter;
  }
  if (lang === "fa" || /[\u0600-\u06FF]/.test(playbackMessage)) {
    return PERSIAN_REVERSE_MAP[code] || LATIN_REVERSE_MAP[code] || fallbackLetter;
  }
  if (lang === "hy" || /[\u0530-\u058F]/.test(playbackMessage)) {
    return ARMENIAN_REVERSE_MAP[code] || LATIN_REVERSE_MAP[code] || fallbackLetter;
  }
  return LATIN_REVERSE_MAP[code] || fallbackLetter;
}

let playbackTimeout = null;
let calibrationTimeout = null;
let playbackMessage =
  (decodedMessage && decodedMessage.textContent.trim().replace(/\s+/g, " ")) || DESCRIPTION;

function decomposeMessageToUnits(text) {
  if (!text) return [];
  const clean = text.replace(/\u3000/g, " ");
  const smallKanaMap = {
    "ぁ": "あ", "ぃ": "い", "ぅ": "う", "ぇ": "え", "ぉ": "お",
    "ァ": "ア", "ィ": "イ", "ゥ": "ウ", "ェ": "エ", "ォ": "オ",
    "っ": "つ", "ッ": "ツ",
    "ゃ": "や", "ゅ": "ゆ", "ょ": "よ",
    "ャ": "ヤ", "ュ": "ユ", "ョ": "ヨ",
    "ゎ": "わ", "ヮ": "ワ"
  };
  const replaced = clean.replace(/[ぁ-ぉァ-ォっッゃ-ょャ-ョゎヮ]/g, (m) => smallKanaMap[m] || m);
  const nfd = replaced.normalize("NFD");
  const units = [];
  for (const char of nfd) {
    if (char === "\u3099") {
      units.push("゛");
    } else if (char === "\u309a") {
      units.push("゜");
    } else {
      units.push(char);
    }
  }
  return units;
}

function createMorseChip(code) {
  const chip = document.createElement("span");
  chip.className = "morse-char-chip";
  if (!code || code === "□") {
    chip.textContent = code || "□";
    return chip;
  }
  for (const sym of code) {
    if (sym === ".") {
      const dot = document.createElement("span");
      dot.className = "morse-dot";
      chip.appendChild(dot);
    } else if (sym === "-") {
      const dash = document.createElement("span");
      dash.className = "morse-dash";
      chip.appendChild(dash);
    } else {
      chip.appendChild(document.createTextNode(sym));
    }
  }
  return chip;
}

function renderMorsePreview(message) {
  if (!messageMorseInput) return;
  messageMorseInput.innerHTML = "";
  if (!message) return;

  const words = message.replace(/\u3000/g, " ").split(" ");
  words.forEach((word, wordIndex) => {
    if (wordIndex > 0) {
      const sep = document.createElement("span");
      sep.className = "morse-char-sep";
      sep.textContent = "|";
      messageMorseInput.appendChild(sep);
    }

    const chars = decomposeMessageToUnits(word);
    chars.forEach((char) => {
      const code = encodeCharacterToMorse(char);

      const unit = document.createElement("div");
      unit.className = "morse-char-unit";

      const label = document.createElement("span");
      label.className = "morse-char-label";
      label.textContent = char.toUpperCase();

      const chip = createMorseChip(code);

      unit.appendChild(label);
      unit.appendChild(chip);
      messageMorseInput.appendChild(unit);
    });
  });
}

function renderToolbarUnits(completedUnits, activeUnit = null) {
  if (!currentSymbol) return;
  currentSymbol.innerHTML = "";

  completedUnits.forEach((item) => {
    if (item.sep) {
      const sep = document.createElement("span");
      sep.className = "morse-char-sep";
      sep.textContent = "|";
      currentSymbol.appendChild(sep);
    } else {
      const unit = document.createElement("div");
      unit.className = "morse-char-unit";

      const label = document.createElement("span");
      label.className = "morse-char-label";
      label.textContent = (item.letter || "").toUpperCase();

      const chip = createMorseChip(item.code);

      unit.appendChild(label);
      unit.appendChild(chip);
      currentSymbol.appendChild(unit);
    }
  });

  if (activeUnit && activeUnit.code) {
    const unit = document.createElement("div");
    unit.className = "morse-char-unit is-active";

    const label = document.createElement("span");
    label.className = "morse-char-label";
    label.textContent = (activeUnit.letter || "").toUpperCase();

    const chip = createMorseChip(activeUnit.code);

    unit.appendChild(label);
    unit.appendChild(chip);
    currentSymbol.appendChild(unit);
  }

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
    onShort: Math.max(50, Number.parseInt(onShortInput?.value || "200", 10)),
    onLong: Math.max(50, Number.parseInt(onLongInput?.value || "600", 10)),
    offShort: Math.max(50, Number.parseInt(offShortInput?.value || "200", 10)),
    offMedium: Math.max(50, Number.parseInt(offMediumInput?.value || "600", 10)),
    offLong: Math.max(50, Number.parseInt(offLongInput?.value || "1400", 10))
  };
}

function encodeCharacterToMorse(character) {
  return MORSE_MAP[character] || MORSE_MAP[character.toUpperCase()] || UNKNOWN_SYMBOL;
}

function encodeMessageToMorse(message) {
  return message
    .replace(/\u3000/g, " ")
    .split(" ")
    .map((word) => decomposeMessageToUnits(word).map(encodeCharacterToMorse).join(" "))
    .join(" | ");
}

function buildSequence(message) {
  const sequence = [];
  const letters = decomposeMessageToUnits(message);

  letters.forEach((letter, letterIndex) => {
    if (letter === " ") {
      if (letterIndex > 0 && letters[letterIndex - 1] !== " ") {
        sequence.push({ type: "gap", duration: timing.offLong });
        sequence.push({ type: "word-break", duration: 0 });
      }

      return;
    }

    const code = MORSE_MAP[letter] || MORSE_MAP[letter.toUpperCase()];

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
  if (sceneStatus) {
    sceneStatus.hidden = true;
  }
  if (currentSymbol) {
    currentSymbol.innerHTML = "";
    const unit = document.createElement("div");
    unit.className = "morse-char-unit";
    const label = document.createElement("span");
    label.className = "morse-char-label";
    label.textContent = "CAL";
    const chip = document.createElement("span");
    chip.className = "morse-char-chip";
    chip.textContent = "...";
    unit.appendChild(label);
    unit.appendChild(chip);
    currentSymbol.appendChild(unit);
  }
  decodedMessage.textContent = "CALIBRATING...";
  calibrationState.textContent = "Calibrating";
  pulseWidth.textContent = `${timing.onShort} / ${timing.onLong} ms`;
  setActiveState(false);
}

function startPlayback() {
  if (sceneStatus) {
    sceneStatus.hidden = true;
  }
  calibrationState.textContent = "Locked";
  const playbackSequence = buildSequence(playbackMessage);
  const loopPauseMs = timing.offLong;

  let sequenceIndex = 0;
  let decodedText = "";
  let currentLetterSymbols = "";
  const completedUnits = [];

  function advance() {
    signalTime.textContent = formatUtcTime();

    if (sequenceIndex >= playbackSequence.length) {
      renderToolbarUnits(completedUnits);
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
      const intermediateLetter = getIntermediateCharacter(currentLetterSymbols, step.letter);
      renderToolbarUnits(completedUnits, { letter: intermediateLetter, code: currentLetterSymbols });
      decodedMessage.textContent = decodedText ? (decodedText + intermediateLetter) : intermediateLetter;
      calibrationState.textContent = "Locked";
      pulseWidth.textContent = `${timing.onShort} / ${timing.onLong} ms`;
      setActiveState(true);
      playbackTimeout = window.setTimeout(advance, step.duration);
      return;
    }

    if (step.type === "gap") {
      setActiveState(false);
      const intermediateLetter = getIntermediateCharacter(currentLetterSymbols, step.letter);
      renderToolbarUnits(completedUnits, { letter: intermediateLetter, code: currentLetterSymbols });
      playbackTimeout = window.setTimeout(advance, step.duration);
      return;
    }

    if (step.type === "letter-complete") {
      decodedText += step.letter;
      decodedMessage.textContent = decodedText;
      completedUnits.push({ letter: step.letter, code: currentLetterSymbols });
      currentLetterSymbols = "";
      renderToolbarUnits(completedUnits);
      advance();
      return;
    }

    if (step.type === "unsupported") {
      decodedText += step.letter;
      decodedMessage.textContent = decodedText;
      completedUnits.push({ letter: step.letter, code: UNKNOWN_SYMBOL });
      renderToolbarUnits(completedUnits);
      advance();
      return;
    }

    if (step.type === "word-break") {
      decodedText += " ";
      decodedMessage.textContent = decodedText;
      completedUnits.push({ sep: true });
      renderToolbarUnits(completedUnits);
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
  renderMorsePreview(playbackMessage);
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
  renderMorsePreview(messageTextInput.value);
});
messageEditorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveEditedMessage();
});

let isEditorBackdropMouseDown = false;
messageEditor.addEventListener("mousedown", (event) => {
  const rect = messageEditor.getBoundingClientRect();
  isEditorBackdropMouseDown =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;
});
messageEditor.addEventListener("mouseup", (event) => {
  if (!isEditorBackdropMouseDown) return;
  const rect = messageEditor.getBoundingClientRect();
  const isBackdropMouseUp =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;

  if (isBackdropMouseUp) {
    closeMessageEditor();
  }
  isEditorBackdropMouseDown = false;
});

fullscreenLight.addEventListener("click", (event) => {
  if (event.target === fullscreenLight) {
    closeFullscreenLight();
  }
});
const timingInputs = [
  onShortInput,
  onLongInput,
  offShortInput,
  offMediumInput,
  offLongInput
].filter(Boolean);

timingInputs.forEach((input) => {
  input.min = "50";
  input.step = "50";

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const current = Math.max(50, Number.parseInt(input.value || "0", 10) || 50);
      const next = Math.floor(current / 50) * 50 + 50;
      input.value = next;
      input.dispatchEvent(new Event("change"));
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      const current = Math.max(50, Number.parseInt(input.value || "0", 10) || 50);
      const remainder = current % 50;
      const next = remainder > 0 ? Math.floor(current / 50) * 50 : Math.max(50, current - 50);
      input.value = next;
      input.dispatchEvent(new Event("change"));
    }
  });

  input.addEventListener("change", restartPlayback);
});
signalTime.textContent = formatUtcTime();
restartPlayback();
