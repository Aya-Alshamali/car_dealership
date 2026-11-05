/**
 * ============================================================
 * FILE: assets/js/main.js
 * ============================================================
 *
 * 1. PURPOSE
 *    Shared helpers and the parts of the page that are not about a
 *    specific vehicle list: header, language selector, panels (login,
 *    account, menu, search shell, info panels, video, lightbox), the
 *    interactive Tesla Roadster hero, toasts and the footer.
 *
 * 2. IMPORTANT SECTIONS
 *    A. Helpers .......... escapeHtml(), getQueryParameter(), getIconSvg()
 *    B. Panels ........... openPanel(), closePanel(), showToast()
 *    C. Language ......... t(), applyLanguage(), handleLanguageChange()
 *    D. Header ........... navigation tracking, login/account/menu panels
 *    E. Hero ............. selectHeroFeature(), stepHeroFeature()
 *    F. Feature panels ... openContentPanel()
 *    G. Video ............ openVideoPlayer(), handleVideoPlay()
 *    H. Start-up ......... initMain()
 *
 * 3. FEATURES IT CONTROLS
 *    Everything listed above on every page.
 *
 * 4. DEPENDENCIES
 *    config.js, analytics.js (loaded in <head>). Loaded BEFORE
 *    vehicles.js, favorites.js, comparison.js, filters.js, forms.js,
 *    which use these helpers.
 *
 * 5. HOW A BEGINNER CAN MODIFY IT
 *    Hero texts: config.js (HERO_FEATURES). Panel texts: CONTENT_PANELS
 *    below. Icons: getIconSvg(). Toast duration: TOAST_MS.
 *
 * 6. GA4 / GTM INTEGRATION LOCATION
 *    Events sent from here via analytics.js: navigation_clicked,
 *    language_selected, hero_feature_selected, content_panel_opened,
 *    video_start.
 * ============================================================
 */

// ==========================================
// GA4 AND GTM EVENT TRACKING SECTION
// ==========================================
// The shared openPanel()/closePanel() helpers NEVER track. Each feature
// that opens a panel decides whether that opening is an event, so one
// click cannot be counted twice.

var TOAST_MS = 3400;
var currentlyOpenPanel = null;
var panelOpener = null;
var heroFeatureIndex = 0;

/* ============================================================
 * A. HELPERS (EXPECTED ANALYTICS EFFECT: None directly)
 * ============================================================ */

/** FUNCTION: escapeHtml(text) - shows any text safely inside HTML. */
function escapeHtml(text) {
  var div = document.createElement("div");
  div.textContent = text === undefined || text === null ? "" : String(text);
  return div.innerHTML;
}

/** FUNCTION: getQueryParameter(name) - reads ?name=value from the address. */
function getQueryParameter(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/** FUNCTION: getIconSvg(name) - small line icons in the current text colour. */
function getIconSvg(name) {
  var open = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">';
  var paths = {
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    compare: '<path d="M8 4v16M16 4v16M4 8h8M12 16h8"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
    login: '<path d="M10 17l5-5-5-5M15 12H3M14 4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    left: '<path d="M15 5l-7 7 7 7"/>',
    right: '<path d="M9 5l7 7-7 7"/>',
    play: '<path d="M8 5v14l11-7z" fill="currentColor"/>',
    check: '<path d="M5 12l4 4L19 7"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'
  };
  return paths[name] ? open + paths[name] + "</svg>" : "";
}

/* ============================================================
 * B. PANELS AND TOASTS
 * A panel = any element with class "panel" and the hidden attribute.
 * ============================================================ */

/**
 * FUNCTION: openPanel(panelId, openerButton)
 * PURPOSE: Shows one panel (closing any other), dims the page, moves
 *   keyboard focus inside and marks the opener aria-expanded="true".
 * RETURNS: true if opened.
 * EXPECTED ANALYTICS EFFECT: None directly (callers decide).
 */
function openPanel(panelId, openerButton) {
  var panel = document.getElementById(panelId);
  if (!panel) {
    return false;
  }
  if (currentlyOpenPanel && currentlyOpenPanel !== panel) {
    closePanel(true);
  }
  panel.hidden = false;
  // Read a layout value first so the browser registers the closed state,
  // then add "is-open": the CSS transition then animates to the open state.
  // (No requestAnimationFrame: it can be paused in background tabs, which
  // would leave the panel invisible.)
  void panel.offsetWidth;
  panel.classList.add("is-open");
  currentlyOpenPanel = panel;
  panelOpener = openerButton || document.activeElement;
  if (openerButton && openerButton.hasAttribute("aria-expanded")) {
    openerButton.setAttribute("aria-expanded", "true");
  }
  document.getElementById("panel-backdrop").hidden = false;
  document.body.classList.add("panel-open");
  var focusTarget = panel.querySelector("[data-autofocus]") || panel.querySelector("button, a, input, select, textarea");
  if (focusTarget) {
    focusTarget.focus();
  }
  return true;
}

/**
 * FUNCTION: closePanel(keepFocus)
 * PURPOSE: Hides the open panel, pauses any video inside, and returns
 *   focus to the opener. Triggered by X, the backdrop or Escape.
 * EXPECTED ANALYTICS EFFECT: None (closing is never tracked).
 */
function closePanel(keepFocus) {
  if (!currentlyOpenPanel) {
    return;
  }
  var panel = currentlyOpenPanel;
  panel.classList.remove("is-open");
  panel.hidden = true;
  var video = panel.querySelector("video");
  if (video) {
    video.pause();
  }
  currentlyOpenPanel = null;
  document.getElementById("panel-backdrop").hidden = true;
  document.body.classList.remove("panel-open");
  if (panelOpener && panelOpener.hasAttribute && panelOpener.hasAttribute("aria-expanded")) {
    panelOpener.setAttribute("aria-expanded", "false");
  }
  if (!keepFocus && panelOpener && panelOpener.focus) {
    panelOpener.focus();
  }
  panelOpener = null;
}

/** FUNCTION: showToast(message, type) - short message; type "error" = red. Analytics: None. */
function showToast(message, type) {
  var box = document.getElementById("toast-container");
  if (!box) {
    return;
  }
  var toast = document.createElement("div");
  toast.className = "toast" + (type === "error" ? " toast--error" : "");
  toast.textContent = message;
  box.appendChild(toast);
  window.setTimeout(function () {
    toast.classList.add("is-leaving");
    window.setTimeout(function () { toast.remove(); }, 300);
  }, TOAST_MS);
}

/* ============================================================
 * C. LANGUAGE SELECTOR
 * ============================================================ */
var LANGUAGE_KEY = "redline_language";
var currentLanguage = "en";

/** FUNCTION: t(key) - interface text in the current language (English fallback). */
function t(key) {
  var table = window.TRANSLATIONS[currentLanguage] || window.TRANSLATIONS.en;
  return table[key] || window.TRANSLATIONS.en[key] || key;
}

/**
 * FUNCTION: applyLanguage(code)
 * PURPOSE: Writes the translated text into every [data-i18n] element and
 *   sets <html lang>. Arabic labels use dir="auto" so they read right to
 *   left without flipping the whole layout.
 * EXPECTED ANALYTICS EFFECT: None directly.
 */
function applyLanguage(code) {
  currentLanguage = window.TRANSLATIONS[code] ? code : "en";
  document.documentElement.lang = currentLanguage;
  var elements = document.querySelectorAll("[data-i18n]");
  for (var i = 0; i < elements.length; i++) {
    elements[i].textContent = t(elements[i].getAttribute("data-i18n"));
    elements[i].setAttribute("dir", "auto");
  }
  var select = document.getElementById("language-select");
  if (select) {
    select.value = currentLanguage;
  }
}

/**
 * FUNCTION: handleLanguageChange(event)
 *
 * PURPOSE: Switches the interface language and remembers it.
 * USER ACTION: choosing EN / DE / AR in the header selector.
 * EXPECTED WEBSITE RESULT: navigation, headings and main buttons change
 *   language immediately; vehicle data stays in English.
 * EXPECTED ANALYTICS EVENT: language_selected
 * EVENT PARAMETERS: language (en/de/ar), previous_language.
 * EVENT COUNT: +1 per real change. PAGE VIEWS: unchanged (no reload).
 * ENGAGEMENT: none directly.
 * HOW TO VERIFY: pick "DE": one language_selected with language "de".
 * FAILURE CONDITIONS: unknown code -> English, no event.
 * DOUBLE COUNTING RISK: re-selecting the same language sends nothing.
 *   The saved language applied on page load is NOT tracked.
 */
function handleLanguageChange(event) {
  var code = event.target.value;
  if (!window.TRANSLATIONS[code] || code === currentLanguage) {
    return;
  }
  var previous = currentLanguage;
  applyLanguage(code);
  try {
    window.localStorage.setItem(LANGUAGE_KEY, code);
  } catch (error) {
    // storage blocked: the choice lasts for this page only
  }
  trackAnalyticsEvent("language_selected", { language: code, previous_language: previous });
}

/* ============================================================
 * D. HEADER
 * ============================================================ */

/**
 * FUNCTION: handleNavigationClick(event)
 *
 * PURPOSE: Records clicks on site navigation links (header, menu panel,
 *   footer) and lets the browser follow the link.
 * USER ACTION: clicking any link with data-nav-location.
 * EXPECTED WEBSITE RESULT: the linked page opens.
 * EXPECTED ANALYTICS EVENT: navigation_clicked
 * EVENT PARAMETERS: link_text, link_url, link_location.
 * EVENT COUNT: +1. PAGE VIEWS: +1 on the next page (GA4 tag).
 * ENGAGEMENT RATE: a second page view makes the session engaged.
 * HOW TO VERIFY: click "Inventory": navigation_clicked, then the new
 *   page's page_view.
 * FAILURE CONDITIONS: tracking never blocks the link.
 * DOUBLE COUNTING RISK: avoid an extra GTM "All Links" trigger.
 */
function handleNavigationClick(event) {
  var link = event.target.closest("a[data-nav-location]");
  if (!link) {
    return;
  }
  trackAnalyticsEvent("navigation_clicked", {
    link_text: link.getAttribute("data-nav-label") || link.textContent.trim().slice(0, 60),
    link_url: link.getAttribute("href"),
    link_location: link.getAttribute("data-nav-location")
  });
}

/** FUNCTION: markActiveNavigation() - underlines the current page's link. Analytics: None. */
function markActiveNavigation() {
  var page = document.body.getAttribute("data-page");
  var links = document.querySelectorAll('.main-nav a[data-page-link="' + page + '"]');
  for (var i = 0; i < links.length; i++) {
    links[i].classList.add("is-active");
    links[i].setAttribute("aria-current", "page");
  }
}

/**
 * FUNCTION: openAccountPanel(openerButton)
 * PURPOSE: Demo account panel: no sign-in; shows how many favorites and
 *   comparison vehicles are saved on this device, with links.
 * USER ACTION: "Account" button.
 * EXPECTED ANALYTICS EFFECT: None directly. Links inside send
 *   navigation_clicked (link_location "account_panel").
 */
function openAccountPanel(openerButton) {
  document.getElementById("account-favorites-count").textContent = getFavoriteIds().length;
  document.getElementById("account-compare-count").textContent = getCompareIds().length;
  openPanel("account-panel", openerButton);
}

/* ============================================================
 * E. HERO: TESLA ROADSTER FEATURES 01-05 (index.html)
 * ============================================================ */

/**
 * FUNCTION: showHeroFeature(index)
 * PURPOSE: Draws feature number "index": info panel text, statistics
 *   with status labels, supporting photo, curved dashboard gauge, and the
 *   active number on both indicator columns.
 * INPUTS: index (0-4); isFirstDraw = true on page load (the CSS entrance
 *   animates then, so motion.js only rolls the gauge number).
 * EXPECTED ANALYTICS EFFECT: None directly (used by selectHeroFeature
 *   and by the first draw on page load, which is not a selection).
 */
function showHeroFeature(index, isFirstDraw) {
  var feature = window.HERO_FEATURES[index];
  var roadster = getVehicleById("tesla-roadster");
  heroFeatureIndex = index;

  document.getElementById("hero-feature-number").textContent = feature.number;
  document.getElementById("hero-feature-title").textContent = feature.title;
  document.getElementById("hero-feature-text").textContent = feature.text;
  document.getElementById("hero-feature-stats").innerHTML = feature.stats.map(function (stat) {
    var label = stat.status === "announced" ? "Announced target" : "Not verified";
    return '<li><span class="hero-stat__value">' + escapeHtml(stat.value) + '</span><span class="hero-stat__label">' + escapeHtml(stat.label) + '</span><span class="badge badge--' + stat.status + '">' + label + "</span></li>";
  }).join("");

  var photo = roadster.photos[feature.photoIndex];
  var image = document.getElementById("hero-feature-image");
  image.src = getPhotoUrl(photo, 960);
  image.alt = photo.alt;
  document.getElementById("hero-feature-credit").innerHTML = buildCreditHtml(photo);

  // Curved dashboard: the arc length shows "fill" percent.
  document.getElementById("gauge-value").textContent = feature.gauge.value;
  document.getElementById("gauge-label").textContent = feature.gauge.label;
  var arc = document.getElementById("gauge-arc");
  var length = arc.getTotalLength ? arc.getTotalLength() : 600;
  arc.style.strokeDasharray = length;
  arc.style.strokeDashoffset = length * (1 - feature.gauge.fill / 100);

  var buttons = document.querySelectorAll("[data-hero-feature]");
  for (var i = 0; i < buttons.length; i++) {
    var active = Number(buttons[i].getAttribute("data-hero-feature")) === index;
    buttons[i].classList.toggle("is-active", active);
    buttons[i].setAttribute("aria-pressed", active);
  }
  // Visual transition (motion.js): light sweep, 3D panel swap, gauge
  // count-up. Optional: the hero works without motion.js. No analytics.
  if (typeof playHeroFeatureMotion === "function") {
    playHeroFeatureMotion(Boolean(isFirstDraw));
  }
}

/**
 * FUNCTION: selectHeroFeature(index, selectionMethod)
 *
 * PURPOSE: Changes the hero to feature 01-05.
 * USER ACTION: clicking a number on the left column ("number"), a dot on
 *   the right column ("dot"), the previous/next arrows ("arrow").
 * EXPECTED WEBSITE RESULT: info panel, stats, photo and dashboard gauge
 *   update with a short fade (none with reduced motion).
 * EXPECTED ANALYTICS EVENT: hero_feature_selected
 * EVENT PARAMETERS: feature_number ("01"-"05"), feature_name,
 *   selection_method.
 * EVENT COUNT: +1 per real change. PAGE VIEWS: unchanged.
 * ENGAGEMENT TIME: may grow as the visitor reads.
 * ENGAGEMENT RATE: not guaranteed to change.
 * HOW TO VERIFY: click "03": one hero_feature_selected, feature_name
 *   "Acceleration".
 * FAILURE CONDITIONS: invalid index -> no change, no event.
 * DOUBLE COUNTING RISK: clicking the active feature sends nothing; the
 *   first feature drawn at page load is not tracked.
 */
function selectHeroFeature(index, selectionMethod) {
  if (index < 0 || index >= window.HERO_FEATURES.length || index === heroFeatureIndex) {
    return;
  }
  showHeroFeature(index);
  var feature = window.HERO_FEATURES[index];
  trackAnalyticsEvent("hero_feature_selected", {
    feature_number: feature.number,
    feature_name: feature.title,
    selection_method: selectionMethod
  });
}

/** FUNCTION: stepHeroFeature(direction) - previous/next feature, wrapping; tracked via selectHeroFeature ("arrow"). */
function stepHeroFeature(direction) {
  var count = window.HERO_FEATURES.length;
  selectHeroFeature((heroFeatureIndex + direction + count) % count, "arrow");
}

/** FUNCTION: initHero() - draws feature 01 (not tracked) and connects controls. */
function initHero() {
  if (!document.getElementById("hero-feature-panel")) {
    return;
  }
  showHeroFeature(0, true);
  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-hero-feature]");
    if (button) {
      selectHeroFeature(Number(button.getAttribute("data-hero-feature")), button.getAttribute("data-method") || "number");
    }
  });
  document.getElementById("hero-prev-btn").addEventListener("click", function () { stepHeroFeature(-1); });
  document.getElementById("hero-next-btn").addEventListener("click", function () { stepHeroFeature(1); });
}

/* ============================================================
 * F. PERFORMANCE PANELS ("Explore Technology", "Explore Interior")
 * General, model-independent explanations (no claims about a model).
 * ============================================================ */
var CONTENT_PANELS = {
  technology: {
    title: "Performance technology explained",
    sections: [
      ["Instant torque", "Electric motors produce their maximum torque from zero rpm, which is why electric performance cars accelerate so quickly from a standstill."],
      ["All-wheel drive and torque distribution", "Systems such as Audi quattro, BMW M xDrive and Mercedes-Benz 4MATIC send power to all four wheels to improve traction when accelerating."],
      ["Dual-clutch gearboxes", "A dual-clutch transmission pre-selects the next gear on a second clutch, so gear changes happen with almost no interruption in power."],
      ["Plug-in hybrid performance", "Plug-in hybrids such as the Bentley Continental GT Speed and Lamborghini Revuelto combine a combustion engine with electric motors for extra power and short electric-only driving."]
    ],
    link: { href: "inventory.html?type=Sports%20Car", label: "Browse sports cars" }
  },
  interior: {
    title: "Modern interiors explained",
    sections: [
      ["Digital driver displays", "Many current performance cars replace analogue dials with configurable screens that can show navigation, performance data or a classic gauge layout."],
      ["Central touchscreens and voice control", "Infotainment, climate and vehicle settings are increasingly controlled through a central touchscreen, physical shortcuts and voice commands."],
      ["Driver-assistance features", "Adaptive cruise control and lane-keeping support are common, but availability differs by model, market and package. Always check the manufacturer's specification for a specific car."],
      ["Comfort and materials", "Luxury models typically offer heated and ventilated seats, premium audio and hand-finished leather or wood. Exact equipment varies by trim."]
    ],
    link: { href: "inventory.html?type=Luxury", label: "Browse luxury models" }
  }
};

/**
 * FUNCTION: openContentPanel(panelKey, openerButton)
 *
 * PURPOSE: Opens the "Explore Technology" or "Explore Interior" panel
 *   with explanatory content and a link into the filtered inventory.
 * USER ACTION: clicking one of the two buttons under the hero.
 * EXPECTED WEBSITE RESULT: a side panel with 4 short explanations.
 * EXPECTED ANALYTICS EVENT: content_panel_opened
 * EVENT PARAMETERS: panel_name ("technology" | "interior").
 * EVENT COUNT: +1 per opening. PAGE VIEWS: unchanged.
 * ENGAGEMENT: reading time may increase engagement time.
 * HOW TO VERIFY: click Explore Technology: one content_panel_opened.
 * FAILURE CONDITIONS: unknown key or missing panel -> no event.
 * DOUBLE COUNTING RISK: one listener per button.
 */
function openContentPanel(panelKey, openerButton) {
  var content = CONTENT_PANELS[panelKey];
  var body = document.getElementById("content-panel-body");
  if (!content || !body) {
    return;
  }
  document.getElementById("content-panel-title").textContent = content.title;
  body.innerHTML = content.sections.map(function (section) {
    return "<h3>" + escapeHtml(section[0]) + "</h3><p>" + escapeHtml(section[1]) + "</p>";
  }).join("") +
    /* LINK inside the panel -> filtered inventory (navigation_clicked). */
    '<a class="btn btn--red" href="' + content.link.href + '" data-nav-location="content_panel">' + escapeHtml(content.link.label) + "</a>";
  if (openPanel("content-panel", openerButton)) {
    trackAnalyticsEvent("content_panel_opened", { panel_name: panelKey });
  }
}

/* ============================================================
 * G. VIDEO PLAYER (index.html, "STAY IN TOUCH")
 * ============================================================ */
var videoStartSentForThisOpening = false;

/**
 * FUNCTION: openVideoPlayer(openerButton)
 * PURPOSE: Opens the accessible video dialog (native controls, captions
 *   of the source credit) and starts playback.
 * USER ACTION: clicking the video thumbnail / play button.
 * EXPECTED WEBSITE RESULT: dialog with the video playing (or ready to
 *   play if the browser blocks autoplay with sound).
 * EXPECTED ANALYTICS EVENT: none on opening. video_start is sent by
 *   handleVideoPlay() only when playback REALLY starts.
 */
function openVideoPlayer(openerButton) {
  var video = document.getElementById("showroom-video");
  if (!video) {
    return;
  }
  if (!video.getAttribute("data-loaded")) {
    window.SHOWROOM_VIDEO.sources.forEach(function (source) {
      var element = document.createElement("source");
      element.src = source.src;
      element.type = source.type;
      video.appendChild(element);
    });
    video.setAttribute("data-loaded", "true");
    video.load();
  }
  videoStartSentForThisOpening = false;
  openPanel("video-panel", openerButton);
  var attempt = video.play();
  if (attempt && attempt.catch) {
    attempt.catch(function () { /* autoplay blocked: visitor presses play */ });
  }
}

/**
 * FUNCTION: handleVideoPlay()
 *
 * PURPOSE: Records the first time the video starts playing in each
 *   opening of the player.
 * USER ACTION: playback starts (automatically after opening, or by
 *   pressing play). Listens to the "playing" event, which fires when
 *   frames are actually moving (not just requested), so a video that
 *   fails to load never counts.
 * EXPECTED WEBSITE RESULT: none (reporting only).
 * EXPECTED ANALYTICS EVENT: video_start (GA4 recommended name)
 * EVENT PARAMETERS: video_title, video_provider, video_url,
 *   video_current_time, video_duration, video_percent, visible.
 * EVENT COUNT: +1 per opening in which the video starts. Pause + resume
 *   does NOT send another video_start.
 * PAGE VIEWS: unchanged.
 * ENGAGEMENT TIME: watching keeps the page active, so engagement time
 *   grows - because of the watching, not because of the event.
 * HOW TO VERIFY: open the player: one video_start. Pause/resume: none.
 * FAILURE CONDITIONS: video cannot load -> "play" never fires -> no event.
 * DOUBLE COUNTING RISK: GA4 Enhanced Measurement video tracking only
 *   covers embedded YouTube, not this HTML5 player, so no duplicate.
 */
function handleVideoPlay() {
  if (videoStartSentForThisOpening) {
    return;
  }
  videoStartSentForThisOpening = true;
  var video = document.getElementById("showroom-video");
  trackAnalyticsEvent("video_start", {
    video_title: window.SHOWROOM_VIDEO.title,
    video_provider: window.SHOWROOM_VIDEO.provider,
    video_url: window.SHOWROOM_VIDEO.pageUrl,
    video_current_time: Math.round(video.currentTime),
    video_duration: Math.round(video.duration) || 0,
    video_percent: 0,
    visible: true
  });
}

/* ============================================================
 * H. START-UP
 * ============================================================ */

/** FUNCTION: fillSiteDetails() - footer contact, social links, disclaimer, year. Analytics: None. */
function fillSiteDetails() {
  var contact = window.SITE_CONFIG.contact;
  var map = { address: contact.address, phone: contact.phone, email: contact.email, hours: contact.hours, disclaimer: window.SITE_CONFIG.disclaimer };
  var fields = document.querySelectorAll("[data-site]");
  for (var i = 0; i < fields.length; i++) {
    var key = fields[i].getAttribute("data-site");
    if (key === "phone-link") {
      fields[i].textContent = contact.phone;
      fields[i].href = "tel:" + contact.phone.replace(/[^+\d]/g, "");
    } else if (key === "email-link") {
      fields[i].textContent = contact.email;
      fields[i].href = "mailto:" + contact.email;
    } else if (map[key]) {
      fields[i].textContent = map[key];
    }
  }
  var social = document.querySelectorAll("[data-social]");
  for (var s = 0; s < social.length; s++) {
    social[s].href = window.SITE_CONFIG.social[social[s].getAttribute("data-social")] || "#";
  }
  var year = document.getElementById("current-year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }
  var videoCredit = document.getElementById("video-credit");
  if (videoCredit) {
    var v = window.SHOWROOM_VIDEO;
    videoCredit.innerHTML = 'Video: &ldquo;' + escapeHtml(v.title) + '&rdquo; by ' + escapeHtml(v.credit) + ', <a href="' + v.licenseUrl + '" target="_blank" rel="noopener">' + v.license + '</a>, via <a href="' + v.pageUrl + '" target="_blank" rel="noopener">Wikimedia Commons</a>. Not footage of any vehicle listed here.';
  }
  var poster = document.getElementById("video-poster");
  if (poster) {
    poster.src = window.SHOWROOM_VIDEO.poster;
  }
}

/**
 * FUNCTION: initMain()
 * PURPOSE: Runs once per page: language, panels, header buttons, hero,
 *   feature panels, video, footer.
 * EXPECTED ANALYTICS EFFECT: None directly.
 */
function initMain() {
  var saved = null;
  try {
    saved = window.localStorage.getItem(LANGUAGE_KEY);
  } catch (error) {
    saved = null;
  }
  applyLanguage(saved || "en");
  fillSiteDetails();
  markActiveNavigation();
  initHero();

  document.addEventListener("click", function (event) {
    handleNavigationClick(event);
    if (event.target.closest("[data-close-panel]") || event.target.id === "panel-backdrop") {
      closePanel();
      return;
    }
    var opener = event.target.closest("[data-open]");
    if (!opener) {
      return;
    }
    var which = opener.getAttribute("data-open");
    if (which === "login") { openPanel("login-panel", opener); }
    if (which === "account") { openAccountPanel(opener); }
    if (which === "menu") { openPanel("menu-panel", opener); }
    if (which === "technology" || which === "interior") { openContentPanel(which, opener); }
    if (which === "video") { openVideoPlayer(opener); }
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closePanel();
    }
  });
  var languageSelect = document.getElementById("language-select");
  if (languageSelect) {
    languageSelect.addEventListener("change", handleLanguageChange);
  }
  var video = document.getElementById("showroom-video");
  if (video) {
    video.addEventListener("playing", handleVideoPlay); // "playing" = frames are really moving (duration known)
  }
}

document.addEventListener("DOMContentLoaded", initMain);
