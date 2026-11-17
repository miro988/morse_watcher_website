/* Spring motion (inspired by getmatter.com): page slides between pages and
   scroll reveals within a page.
   Loaded in <head> without defer: the pagereveal listener must exist before the
   first frame, and the `motion` class must land before first paint. The CSS only
   hides elements while that class is present, so if this script never runs, the
   page simply shows everything with no animation. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Page slide direction (cross-document View Transitions) ----------
     Pages have a left-to-right order that mirrors the nav: Home, Guides, Translator.
     Going to a page further right slides the new page in from the right; going
     back left (by link or the Back button) slides it in from the left. The CSS
     in styles.css does the animation; this only picks the direction. */
  function pageRank(url) {
    var path = new URL(url, location.href).pathname.toLowerCase();
    if (/\/(privacy|terms)\.html$/.test(path)) return 4;
    if (/\/translator\.html$/.test(path)) return 3;
    if (/\/guides\/[^/]+\.html$/.test(path) && !/\/index\.html$/.test(path)) return 2.5; // an article
    if (/\/guides\//.test(path)) return 2;
    if (/\/how-to-use\.html$/.test(path)) return 1;
    return 0; // home, in any language
  }

  var LAST_PAGE_KEY = "mw:last-page";
  var STYLE_KEY = "mw:nav-style"; // preview override; unset in production
  var STYLES = ["auto", "push", "slide", "shift", "fade", "lift"];
  var IS_PREVIEW = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

  // Production: iOS-style push on phones, lift/scale on desktop.
  function navStyle() {
    var picked = null;
    if (IS_PREVIEW) {
      var fromUrl = new URLSearchParams(location.search).get("transition");
      if (STYLES.indexOf(fromUrl) > -1) {
        try { sessionStorage.setItem(STYLE_KEY, fromUrl); } catch (e) {}
      }
      try { picked = sessionStorage.getItem(STYLE_KEY); } catch (e) {}
    }
    if (picked && picked !== "auto") return picked;
    return window.matchMedia("(max-width: 899px)").matches ? "push" : "lift";
  }

  // Old page: remember where we're leaving from (fires for links and Back/Forward).
  window.addEventListener("pageswap", function (event) {
    try { sessionStorage.setItem(LAST_PAGE_KEY, location.href); } catch (e) {}
    // An open mobile menu should slide away with the page, not stay pinned on top.
    var header = document.querySelector(".site-header.is-open");
    if (header && event.viewTransition) header.style.viewTransitionName = "none";
  });

  // New page: compare ranks before the first frame is drawn and tag the direction.
  window.addEventListener("pagereveal", function (event) {
    if (!event.viewTransition) return;
    var from = null;
    try { from = sessionStorage.getItem(LAST_PAGE_KEY); } catch (e) {}
    if (!from) return;

    var delta = pageRank(location.href) - pageRank(from);
    var dir = delta > 0 ? "forward" : delta < 0 ? "back" : "";
    // Right-to-left languages read the other way, so the slide flips too.
    if (dir && root.getAttribute("dir") === "rtl") dir = dir === "forward" ? "back" : "forward";
    var style = navStyle();
    // Same level (e.g. switching language): the browser's default crossfade.
    if (!dir && style !== "fade") return;

    if (dir) root.setAttribute("data-nav-dir", dir);
    root.setAttribute("data-nav-style", style);
    event.viewTransition.finished.finally(function () {
      root.removeAttribute("data-nav-dir");
      root.removeAttribute("data-nav-style");
    });
  });

  // Preview only: a small picker to compare styles while clicking around.
  if (IS_PREVIEW) {
    var addPicker = function () {
      var current = "auto";
      try { current = sessionStorage.getItem(STYLE_KEY) || "auto"; } catch (e) {}
      var labels = {
        auto: "Auto (push on phone, lift on desktop)",
        push: "1. iOS push",
        slide: "2. Full slide",
        shift: "3. Short shift + fade",
        fade: "4. Crossfade",
        lift: "5. Lift / scale"
      };
      var box = document.createElement("label");
      box.className = "nav-style-picker";
      box.textContent = "Transition ";
      var select = document.createElement("select");
      STYLES.forEach(function (s) {
        var opt = document.createElement("option");
        opt.value = s;
        opt.textContent = labels[s];
        if (s === current) opt.selected = true;
        select.appendChild(opt);
      });
      select.addEventListener("change", function () {
        try { sessionStorage.setItem(STYLE_KEY, select.value); } catch (e) {}
      });
      box.appendChild(select);
      document.body.appendChild(box);
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", addPicker);
    } else {
      addPicker();
    }
  }

  /* ---------- Scroll reveals ---------- */
  if (reduce || !("IntersectionObserver" in window)) return;

  root.classList.add("motion");

  // Failsafe: never leave content hidden if something below goes wrong.
  var failsafe = setTimeout(function () {
    root.classList.remove("motion");
  }, 4000);

  var REVEAL = [
    ".home-hero__copy > *",
    ".home-hero__steps > li",
    ".shot-frame",
    ".section > h2",
    ".section > .kicker",
    ".section > p",
    ".section > .text-link",
    ".feature-card",
    ".use-item",
    ".card-link",
    ".policy-card"
  ].join(",");

  // Reading queue: text is revealed one piece at a time, in page order, so each
  // line can be read before the next arrives. Whatever scrolls into view joins
  // the end of the queue; if nothing is waiting, it shows right away.
  var STEP_MS = 280; // gap between one piece and the next
  var MAX_WAIT_MS = 2000; // never keep something on screen hidden longer than this
  var nextSlot = 0;

  function reveal(el) {
    var now = performance.now();
    var wait = Math.min(Math.max(0, nextSlot - now), MAX_WAIT_MS);
    el.style.setProperty("--reveal-delay", Math.round(wait) + "ms");
    el.classList.add("is-in");
    // Wrappers (like the steps list) just fade with their first child; they
    // don't take a turn of their own.
    if (!el.querySelector(REVEAL)) nextSlot = now + wait + STEP_MS;
  }

  function init() {
    clearTimeout(failsafe);

    // The phone mockup isn't text to read, so it rises alongside the headline.
    var shot = document.querySelector(".home-hero .shot-frame");
    if (shot) shot.style.setProperty("--reveal-delay", "420ms");

    var io = new IntersectionObserver(function (entries) {
      entries
        .filter(function (entry) { return entry.isIntersecting; })
        .map(function (entry) { return entry.target; })
        .sort(function (x, y) {
          return x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
        })
        .forEach(function (el) {
          io.unobserve(el);
          if (el === shot) el.classList.add("is-in");
          else reveal(el);
        });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

    document.querySelectorAll(REVEAL).forEach(function (el) {
      io.observe(el);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
