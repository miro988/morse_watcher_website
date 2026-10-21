const introCarousel = document.querySelector("#intro-carousel");
const introCarouselDots = document.querySelector("#intro-carousel-dots");

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
  // "normal" (no gap set) parses to NaN.
  const gap = Number.parseFloat(styles.columnGap) || 0;
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

renderIntroCarouselDots();
startIntroCarouselAutoplay();
