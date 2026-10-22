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
