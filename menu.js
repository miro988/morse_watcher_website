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

// Light/dark follows the system unless the visitor picks the other theme here.
// Each page's <head> applies a saved pick before first paint.
const themeToggle = document.querySelector(".theme-toggle");
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
// App Store badge <source>s and theme-color tags that choose by system scheme.
const schemeMediaElements = document.querySelectorAll(
  'source[media*="prefers-color-scheme"], meta[name="theme-color"][media]'
);

function getSystemTheme() {
  return systemDark.matches ? "dark" : "light";
}

function syncThemeUi() {
  const pickedTheme = document.documentElement.dataset.theme;

  schemeMediaElements.forEach((element) => {
    element.dataset.schemeMedia ??= element.getAttribute("media");
    const elementTheme = element.dataset.schemeMedia.includes("dark") ? "dark" : "light";
    let media = element.dataset.schemeMedia;

    if (pickedTheme) {
      media = pickedTheme === elementTheme ? "all" : "not all";
    }
    element.setAttribute("media", media);
  });

  themeToggle?.setAttribute("aria-pressed", String((pickedTheme || getSystemTheme()) === "dark"));
}

// Picking the system's own theme clears the override instead of saving it.
function setTheme(theme) {
  const followsSystem = theme === getSystemTheme();

  if (followsSystem) {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = theme;
  }

  try {
    if (followsSystem) {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", theme);
    }
  } catch {
    // Storage blocked (private mode): the pick lasts for this page only.
  }

  syncThemeUi();
}

if (themeToggle) {
  themeToggle.hidden = false;
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.dataset.theme || getSystemTheme();
    setTheme(currentTheme === "dark" ? "light" : "dark");
  });
}

systemDark.addEventListener("change", syncThemeUi);
syncThemeUi();

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
