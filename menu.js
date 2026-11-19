const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const menuToggleLabel = document.querySelector(".menu-toggle__label");
// Translated pages put their own words on the button.
const menuOpenLabel = menuToggleLabel?.textContent || "Menu";
const menuCloseLabel = menuToggle?.dataset.closeLabel || "Close";

function setMenuOpen(open) {
  siteHeader.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggleLabel.textContent = open ? menuCloseLabel : menuOpenLabel;
}

if (siteHeader && menuToggle) {
  menuToggle.addEventListener("click", () => {
    setMenuOpen(!siteHeader.classList.contains("is-open"));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteHeader.classList.contains("is-open")) {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  // Close the phone menu if the window grows into the desktop layout.
  window.matchMedia("(min-width: 900px)").addEventListener("change", (event) => {
    if (event.matches) {
      setMenuOpen(false);
    }
  });
}

const langDropdown = document.querySelector(".lang-dropdown");
const langBtn = document.querySelector(".lang-btn");

if (langDropdown && langBtn) {
  langBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = langDropdown.classList.toggle("is-open");
    langBtn.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!langDropdown.contains(event.target)) {
      langDropdown.classList.remove("is-open");
      langBtn.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && langDropdown.classList.contains("is-open")) {
      langDropdown.classList.remove("is-open");
      langBtn.setAttribute("aria-expanded", "false");
      langBtn.focus();
    }
  });
}

// English pages that have translations offer one to visitors whose browser prefers that language.
// It never redirects, and stays away once the visitor closes it or picks a language from the menu.
const LANG_PROMPTS = {
  de: ["Auf Deutsch ansehen", "Schließen"],
  es: ["Ver en español", "Cerrar"],
  fr: ["Voir en français", "Fermer"],
  it: ["Visualizza in italiano", "Chiudi"],
  pt: ["Ver em português", "Fechar"],
  ru: ["Смотреть на русском", "Закрыть"],
  uk: ["Переглянути українською", "Закрити"],
  hy: ["Դիտել հայերեն", "Փակել"],
  fa: ["مشاهده به فارسی", "بستن"],
  ja: ["日本語で表示", "閉じる"]
};
const LANG_PROMPT_KEY = "langPrompt";

function rememberLanguageChoice() {
  try {
    localStorage.setItem(LANG_PROMPT_KEY, "dismissed");
  } catch {
    // Storage blocked: the offer may show again on the next page.
  }
}

// The first supported language the browser ranks above English, with that page's path from its hreflang link.
function findPreferredTranslation() {
  if (document.documentElement.lang !== "en") return null;
  try {
    if (localStorage.getItem(LANG_PROMPT_KEY)) return null;
  } catch {}

  for (const language of navigator.languages || [navigator.language]) {
    const code = language.toLowerCase().split("-")[0];
    if (code === "en") return null;
    const alternate = document.querySelector(`link[rel="alternate"][hreflang="${code}"]`);
    if (alternate && LANG_PROMPTS[code]) {
      return { code, path: new URL(alternate.href).pathname };
    }
  }
  return null;
}

function showLanguagePrompt() {
  const target = findPreferredTranslation();
  if (!target) return;
  const [label, closeLabel] = LANG_PROMPTS[target.code];

  const bar = document.createElement("div");
  bar.className = "lang-prompt";
  bar.lang = target.code;
  bar.dir = target.code === "fa" ? "rtl" : "ltr";

  const link = document.createElement("a");
  link.className = "lang-prompt__link";
  link.href = target.path;
  link.textContent = label;

  const close = document.createElement("button");
  close.className = "lang-prompt__close";
  close.type = "button";
  close.textContent = "✕";
  close.setAttribute("aria-label", closeLabel);
  close.addEventListener("click", () => {
    rememberLanguageChoice();
    bar.remove();
  });

  bar.append(link, close);
  document.body.prepend(bar);
}

document.querySelectorAll(".lang-menu__item").forEach((item) => {
  item.addEventListener("click", rememberLanguageChoice);
});
showLanguagePrompt();
