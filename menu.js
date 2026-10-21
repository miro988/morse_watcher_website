const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const menuToggleLabel = document.querySelector(".menu-toggle__label");

function setMenuOpen(open) {
  siteHeader.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggleLabel.textContent = open ? "Close" : "Menu";
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
