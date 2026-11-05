/**
 * ============================================================
 * FILE: assets/js/motion.js
 * ============================================================
 *
 * 1. PURPOSE
 *    The "real-life" motion layer: 3D depth and movement that make the
 *    showroom feel physical. It never changes content or data; it only
 *    animates what other files already drew.
 *
 * 2. IMPORTANT SECTIONS
 *    A. Settings + helpers ... MOTION settings, canUseRichMotion()
 *    B. Hero 3D stage ........ initHeroDepth() - layers follow the pointer
 *    C. Hero feature change .. playHeroFeatureMotion() - light sweep,
 *                              3D panel swap, gauge count-up
 *    D. Card 3D tilt ......... initCardTilt() - tilt + glare under the pointer
 *    E. Scroll reveal ........ initScrollReveal() - sections rise into view
 *    F. Photo swaps .......... playImageSwapAnimation() - gallery slides
 *    G. Page transitions ..... initPhotoMorph() - card photo morphs into
 *                              the vehicle page photo (View Transitions)
 *
 * 3. FEATURES IT CONTROLS
 *    Movement only. Everything still works if this file is removed.
 *
 * 4. DEPENDENCIES
 *    Loaded LAST on every page. main.js and vehicles.js call
 *    playHeroFeatureMotion() and playImageSwapAnimation() only if they
 *    exist ("typeof ... === 'function'"), so there is no hard dependency.
 *    Styles live in assets/css/animations.css.
 *
 * 5. HOW A BEGINNER CAN MODIFY IT
 *    Change the numbers in MOTION (tilt angles, speeds). Setting
 *    MOTION.enabled to false turns every effect in this file off.
 *
 * 6. GA4 / GTM INTEGRATION LOCATION
 *    None. See the section below.
 *
 * ACCESSIBILITY
 *    If the visitor's device asks for reduced motion, every movement in
 *    this file is skipped (only instant changes remain). Pointer effects
 *    (hero depth, card tilt) run only with a real mouse/trackpad
 *    ("hover: hover" and "pointer: fine"), never on touch screens.
 * ============================================================
 */

// ==========================================
// GA4 AND GTM EVENT TRACKING SECTION
// ==========================================
// EXPECTED ANALYTICS EFFECT: None directly. No function in this file
// sends, triggers or repeats an analytics event. Animations, tilts,
// reveals and page transitions are visual only, so they cannot change
// event counts. Page transitions do not create page views either: the
// page_view comes from the normal page load, with or without the effect.
// Indirect effect: richer motion may keep visitors on the page longer
// (engagement time), which GA4 measures by itself.

/* ============================================================
 * A. SETTINGS AND HELPERS
 * ============================================================ */
var MOTION = {
  enabled: true,
  heroMaxTiltDeg: 7,        // how far the hero stage turns toward the pointer
  heroFollow: 0.08,         // 0-1: how quickly it catches up (lower = heavier, smoother)
  cardMaxTiltDeg: 5,        // vehicle card tilt (kept subtle: cards are hovered often)
  countUpMs: 700,           // gauge number count-up
  easeOut: "cubic-bezier(0.23, 1, 0.32, 1)",
  easeInOut: "cubic-bezier(0.77, 0, 0.175, 1)"
};

/** FUNCTION: prefersReducedMotionSetting() - true when the OS asks for less motion. Analytics: None. */
function prefersReducedMotionSetting() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** FUNCTION: canUseRichMotion() - motion allowed at all. Analytics: None. */
function canUseRichMotion() {
  return MOTION.enabled && !prefersReducedMotionSetting();
}

/** FUNCTION: hasFinePointer() - a mouse or trackpad (not a touch screen). Analytics: None. */
function hasFinePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/* ============================================================
 * B. HERO 3D STAGE
 * The hero is built as depth layers: the ROADSTER word sits far back,
 * the car in the middle, the frame corners and dashboard in front.
 * When the pointer moves, the whole stage turns slightly toward it, so
 * near layers move more than far ones (real parallax).
 * ============================================================ */

/**
 * FUNCTION: initHeroDepth()
 * PURPOSE: Smoothly turns the hero stage toward the pointer and lets a
 *   soft highlight follow it across the car. Uses requestAnimationFrame
 *   with easing ("lerp") so the motion feels weighted, and stops the
 *   loop when the stage is at rest (no wasted battery).
 * USER ACTION: moving the mouse over the hero (desktop only).
 * EXPECTED ANALYTICS EFFECT: None directly.
 */
function initHeroDepth() {
  var hero = document.querySelector(".hero");
  var stage = document.querySelector(".hero__stage");
  var shine = document.querySelector(".hero__shine");
  if (!hero || !stage || !canUseRichMotion() || !hasFinePointer()) {
    return;
  }
  var target = { x: 0, y: 0 };
  var current = { x: 0, y: 0 };
  var running = false;

  function step() {
    current.x += (target.x - current.x) * MOTION.heroFollow;
    current.y += (target.y - current.y) * MOTION.heroFollow;
    stage.style.transform = "rotateX(" + (-current.y * MOTION.heroMaxTiltDeg).toFixed(2) + "deg) rotateY(" + (current.x * MOTION.heroMaxTiltDeg).toFixed(2) + "deg)";
    if (shine) {
      shine.style.transform = "translate3d(" + (current.x * 30).toFixed(1) + "%, " + (current.y * 20).toFixed(1) + "%, 0)";
    }
    var resting = Math.abs(target.x - current.x) < 0.001 && Math.abs(target.y - current.y) < 0.001;
    if (resting) {
      running = false;
      return;
    }
    window.requestAnimationFrame(step);
  }
  function start() {
    if (!running) {
      running = true;
      window.requestAnimationFrame(step);
    }
  }
  hero.addEventListener("pointermove", function (event) {
    var box = hero.getBoundingClientRect();
    target.x = ((event.clientX - box.left) / box.width - 0.5) * 2;   // -1 .. 1
    target.y = ((event.clientY - box.top) / box.height - 0.5) * 2;
    start();
  });
  hero.addEventListener("pointerleave", function () {
    target.x = 0;
    target.y = 0;
    start();
  });
}

/* ============================================================
 * C. HERO FEATURE CHANGE (01-05)
 * ============================================================ */

/**
 * FUNCTION: countUpGaugeValue(element, finalText)
 * PURPOSE: Rolls the dashboard number up from 0 to its value, like a real
 *   gauge ("8.9 s", "250+", "620", "1.9 s"). Text without a number
 *   ("N/A") is shown immediately. Keeps decimals and the suffix.
 * EXPECTED ANALYTICS EFFECT: None.
 */
var countUpFrame = null;
function countUpGaugeValue(element, finalText) {
  window.cancelAnimationFrame(countUpFrame);
  var match = /^([^\d]*)(\d+(?:\.\d+)?)(.*)$/.exec(finalText);
  if (!match || !canUseRichMotion()) {
    element.textContent = finalText;
    return;
  }
  var prefix = match[1];
  var target = parseFloat(match[2]);
  var decimals = (match[2].split(".")[1] || "").length;
  var suffix = match[3];
  var started = performance.now();
  function frame(now) {
    var progress = Math.min(1, (now - started) / MOTION.countUpMs);
    var eased = 1 - Math.pow(1 - progress, 4);            // strong ease-out
    element.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
    if (progress < 1) {
      countUpFrame = window.requestAnimationFrame(frame);
    }
  }
  countUpFrame = window.requestAnimationFrame(frame);
}

/**
 * FUNCTION: playHeroFeatureMotion(isFirstDraw)
 * PURPOSE: Called by showHeroFeature() in main.js after a feature is
 *   drawn. Plays: a light sweep across the car, a short 3D turn of the
 *   info panel (it swings in like a door from the right), a slide of the
 *   car photo, and the gauge count-up. On the very first draw (page load)
 *   the stage entrance in CSS handles the motion instead.
 *   Uses the Web Animations API (element.animate), which can be
 *   interrupted cleanly when the visitor clicks quickly.
 * EXPECTED ANALYTICS EFFECT: None. hero_feature_selected is sent by
 *   selectHeroFeature() in main.js, never by this animation.
 */
function playHeroFeatureMotion(isFirstDraw) {
  var gauge = document.getElementById("gauge-value");
  if (gauge) {
    countUpGaugeValue(gauge, gauge.textContent);
  }
  if (isFirstDraw || !canUseRichMotion()) {
    return;
  }
  var panel = document.getElementById("hero-feature-panel");
  var car = document.getElementById("hero-feature-image");
  var sweep = document.querySelector(".hero__sweep");
  var timing = { duration: 420, easing: MOTION.easeOut };
  if (panel) {
    panel.getAnimations().forEach(function (a) { a.cancel(); });
    panel.animate([
      { opacity: 0, transform: "perspective(900px) rotateY(-14deg) translateX(24px)" },
      { opacity: 1, transform: "perspective(900px) rotateY(0deg) translateX(0)" }
    ], timing);
  }
  if (car) {
    car.animate([
      { opacity: 0.35, transform: "translateX(4%) scale(0.97)" },
      { opacity: 1, transform: "translateX(0) scale(1)" }
    ], { duration: 520, easing: MOTION.easeOut });
  }
  if (sweep) {
    sweep.getAnimations().forEach(function (a) { a.cancel(); });
    sweep.animate([
      { transform: "translateX(-120%) skewX(-18deg)", opacity: 0 },
      { opacity: 1, offset: 0.2 },
      { transform: "translateX(220%) skewX(-18deg)", opacity: 0 }
    ], { duration: 900, easing: MOTION.easeInOut });
  }
}

/* ============================================================
 * D. VEHICLE CARD 3D TILT
 * ============================================================ */

/**
 * FUNCTION: initCardTilt()
 * PURPOSE: A vehicle card tilts a few degrees toward the pointer and a
 *   soft glare follows it, like light on glass. One delegated listener
 *   covers every card, including cards redrawn by filters. The transform
 *   is written on the card itself (not through a parent CSS variable),
 *   so only that card is recalculated. Leaving the card eases it back.
 * USER ACTION: hovering a card with a mouse (desktop only).
 * EXPECTED ANALYTICS EFFECT: None.
 */
function initCardTilt() {
  if (!canUseRichMotion() || !hasFinePointer()) {
    return;
  }
  var activeCard = null;
  function reset(card) {
    card.classList.remove("is-tilting");
    card.style.transform = "";
    var glare = card.querySelector(".card-glare");
    if (glare) {
      glare.style.opacity = "0";
    }
  }
  document.addEventListener("pointermove", function (event) {
    var card = event.target.closest && event.target.closest(".vehicle-card");
    if (activeCard && activeCard !== card) {
      reset(activeCard);
      activeCard = null;
    }
    if (!card) {
      return;
    }
    activeCard = card;
    card.classList.add("is-tilting");
    var box = card.getBoundingClientRect();
    var x = (event.clientX - box.left) / box.width - 0.5;   // -0.5 .. 0.5
    var y = (event.clientY - box.top) / box.height - 0.5;
    card.style.transform = "perspective(900px) rotateX(" + (-y * MOTION.cardMaxTiltDeg * 2).toFixed(2) + "deg) rotateY(" + (x * MOTION.cardMaxTiltDeg * 2).toFixed(2) + "deg) translateY(-4px)";
    var glare = card.querySelector(".card-glare");
    if (glare) {
      glare.style.opacity = "1";
      glare.style.transform = "translate3d(" + (x * 60).toFixed(1) + "%, " + (y * 60).toFixed(1) + "%, 0)";
    }
  });
  document.documentElement.addEventListener("pointerleave", function () {
    if (activeCard) {
      reset(activeCard);
      activeCard = null;
    }
  });
}

/* ============================================================
 * E. SCROLL REVEAL
 * ============================================================ */

/**
 * FUNCTION: initScrollReveal()
 * PURPOSE: Sections marked data-reveal rise and tilt up into place the
 *   first time they scroll into view (once only, never on scroll back).
 *   Children marked data-reveal-item enter one after another (60 ms
 *   apart) instead of all at once.
 * EXPECTED ANALYTICS EFFECT: None. (Do not confuse with GA4's own
 *   "scroll" event, which Enhanced Measurement sends at 90% depth.)
 */
function initScrollReveal() {
  var targets = document.querySelectorAll("[data-reveal]");
  if (!targets.length) {
    return;
  }
  if (!canUseRichMotion() || !("IntersectionObserver" in window)) {
    for (var i = 0; i < targets.length; i++) {
      targets[i].classList.add("is-revealed");
    }
    return;
  }
  document.documentElement.classList.add("reveal-ready");
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) {
        return;
      }
      var items = entry.target.querySelectorAll("[data-reveal-item]");
      for (var n = 0; n < items.length; n++) {
        items[n].style.transitionDelay = Math.min(n, 8) * 60 + "ms";
      }
      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  for (var t = 0; t < targets.length; t++) {
    observer.observe(targets[t]);
  }
}

/* ============================================================
 * F. PHOTO SWAPS (gallery)
 * ============================================================ */

/**
 * FUNCTION: playImageSwapAnimation(image, direction)
 * PURPOSE: When the gallery or viewer shows another photo, the new photo
 *   slides in a little from the side it came from (direction +1 = next,
 *   -1 = previous, 0 = no direction: fade and settle).
 * EXPECTED ANALYTICS EFFECT: None. vehicle_image_selected is sent by
 *   selectGalleryImage() in vehicles.js, not by this animation.
 */
function playImageSwapAnimation(image, direction) {
  if (!image || !canUseRichMotion()) {
    return;
  }
  var offset = (direction || 0) * 6;
  image.getAnimations().forEach(function (a) { a.cancel(); });
  image.animate([
    { opacity: 0.25, transform: "translateX(" + offset + "%) scale(0.98)" },
    { opacity: 1, transform: "translateX(0) scale(1)" }
  ], { duration: 300, easing: MOTION.easeOut });
}

/* ============================================================
 * G. PAGE TRANSITION: CARD PHOTO -> VEHICLE PAGE PHOTO
 * ============================================================ */

/**
 * FUNCTION: initPhotoMorph()
 * PURPOSE: In browsers that support cross-page View Transitions (Chrome
 *   and Edge 126+, Safari 18.2+), the photo of the card you click grows
 *   into the large photo on the vehicle page, so you can see where you
 *   came from. Other browsers simply load the page normally.
 *   How: the clicked card's photo gets the name "vehicle-photo"; the
 *   vehicle page's main photo has the same name in animations.css; the
 *   browser animates between the two.
 * EXPECTED ANALYTICS EFFECT: None. The page_view and view_item of the
 *   vehicle page are sent exactly as without the transition, and
 *   select_item is still sent by handleVehicleSelect() in vehicles.js.
 */
function initPhotoMorph() {
  if (!canUseRichMotion()) {
    return;
  }
  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("[data-select-vehicle]");
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) {
      return;
    }
    var card = link.closest(".vehicle-card");
    var photo = card ? card.querySelector(".vehicle-card__media img") : null;
    var previous = document.querySelectorAll('[style*="view-transition-name"]');
    for (var i = 0; i < previous.length; i++) {
      previous[i].style.viewTransitionName = "";
    }
    if (photo) {
      photo.style.viewTransitionName = "vehicle-photo";
    }
  });
  // Coming back with the browser's Back button: clear the name so it
  // cannot clash with another photo on the next click.
  window.addEventListener("pageshow", function () {
    var named = document.querySelectorAll('[style*="view-transition-name"]');
    for (var i = 0; i < named.length; i++) {
      named[i].style.viewTransitionName = "";
    }
  });
}

/* ============================================================
 * START
 * ============================================================ */
document.addEventListener("DOMContentLoaded", function () {
  initHeroDepth();
  initCardTilt();
  initScrollReveal();
  initPhotoMorph();
});
