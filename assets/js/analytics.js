/**
 * ============================================================
 * FILE: assets/js/analytics.js
 * ============================================================
 *
 * 1. PURPOSE
 *    The ONLY file that writes to window.dataLayer (the list Google Tag
 *    Manager reads). Every other file reports user actions by calling:
 *      trackAnalyticsEvent(name, parameters)     normal events
 *      trackEcommerceEvent(name, ecommerce)      GA4 item events
 *      trackEventOncePerPage(key, name, params)  events allowed once
 *
 * 2. IMPORTANT SECTIONS
 *    A. Consent banner (Accept / Decline)
 *    B. loadGoogleTagManager(): the official GTM snippet
 *    C. Tracking functions
 *    D. buildVehicleAnalyticsItem(): vehicle -> GA4 "item"
 *
 * 3. FEATURES IT CONTROLS
 *    Cookie banner, GTM loading, every analytics event on the site.
 *
 * 4. DEPENDENCIES
 *    config.js (SITE_CONFIG.analytics). Each page contains the consent
 *    banner markup (#consent-banner).
 *
 * 5. HOW A BEGINNER CAN MODIFY IT
 *    Usually not needed: change IDs in config.js. To add an event, call
 *    trackAnalyticsEvent() in the function where the action happens and
 *    document it in ANALYTICS_GUIDE.md and BUTTON_GUIDE.md.
 *
 * 6. GA4 / GTM INTEGRATION LOCATION
 *    This file. GA4 is configured inside GTM (Google tag + GA4 Event
 *    tags); no gtag.js is loaded here, so GA4 cannot be installed twice.
 *
 * HOW TO TEST
 *    With debugLogging true, every push prints "[REDLINE analytics] ..."
 *    in the console (F12). Type window.dataLayer to list all pushes.
 *    With real IDs: GTM Preview + GA4 DebugView (ANALYTICS_GUIDE.md).
 *
 * PAGE VIEWS
 *    This is a multi-page website. Every page load produces ONE page_view
 *    (sent by the GA4 Google tag in GTM, not by this file). The site
 *    never sends virtual page views and never changes the address bar
 *    with history.pushState/replaceState, so GA4's "history change"
 *    page views cannot be triggered by filters, tabs or panels.
 * ============================================================
 */

// ==========================================
// GA4 AND GTM EVENT TRACKING SECTION
// ==========================================
// Everything in this file. dataLayer is created immediately so events
// pushed before GTM finishes loading are not lost.

window.dataLayer = window.dataLayer || [];

var CONSENT_STORAGE_KEY = "redline_analytics_consent";
var eventsSentThisPage = {}; // keys used by trackEventOncePerPage()

/* ============================================================
 * A. CONSENT
 * ============================================================ */

/**
 * FUNCTION: isAnalyticsConfigured()
 * PURPOSE: true when config.js holds a real GTM ID (not the placeholder).
 * EXPECTED ANALYTICS EFFECT: None directly.
 */
function isAnalyticsConfigured() {
  var id = window.SITE_CONFIG.analytics.gtmContainerId || "";
  return id.indexOf("GTM-") === 0 && id.indexOf("XXXX") === -1;
}

/**
 * FUNCTION: getConsentStatus()
 * PURPOSE: Returns "granted", "denied" or null (no choice yet).
 * EXPECTED ANALYTICS EFFECT: None directly; decides whether GTM may load.
 */
function getConsentStatus() {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

/**
 * FUNCTION: handleConsentChoice(choice)
 *
 * PURPOSE: Saves the visitor's cookie choice; loads GTM after "Accept".
 * USER ACTION: Clicking Accept or Decline in the cookie banner.
 * EXPECTED WEBSITE RESULT: The banner closes.
 * EXPECTED ANALYTICS EVENT: none of our own. After Accept, GTM starts
 *   ("gtm.js") and the GA4 Google tag sends page_view.
 * EVENT PARAMETERS: none.
 * EVENT COUNT: unchanged by our code.
 * PAGE VIEWS: +1 right after Accept (if GTM + GA4 are configured).
 * ENGAGEMENT TIME: starts being measured from Accept.
 * ENGAGEMENT RATE: visitors who decline are absent from all GA4 numbers.
 * HOW TO VERIFY: Network tab shows googletagmanager.com/gtm.js.
 * FAILURE CONDITIONS: storage blocked -> choice not remembered, banner
 *   returns on the next page (GTM still loads now if accepted).
 * DOUBLE COUNTING RISK: none; loadGoogleTagManager() never loads twice.
 */
function handleConsentChoice(choice) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch (error) {
    logAnalyticsDebug("Consent choice could not be saved (storage blocked).");
  }
  var banner = document.getElementById("consent-banner");
  if (banner) {
    banner.hidden = true;
  }
  if (choice === "granted") {
    loadGoogleTagManager();
  }
}

/* ============================================================
 * B. GOOGLE TAG MANAGER
 * ============================================================ */

/**
 * FUNCTION: loadGoogleTagManager()
 *
 * PURPOSE: Inserts the official GTM container snippet.
 * USER ACTION: none (page load with consent, or Accept).
 * EXPECTED WEBSITE RESULT: nothing visible.
 * EXPECTED ANALYTICS EVENT: GTM's own "gtm.js"; then the GA4 Google tag
 *   sends page_view (and Enhanced Measurement events you enabled).
 * PAGE VIEWS: +1 per page load after consent.
 * HOW TO VERIFY: GTM Preview connects; gtm.js appears in Network tab.
 * FAILURE CONDITIONS: placeholder ID or no consent -> nothing loads (a
 *   console note explains). Ad blockers may block gtm.js; the website
 *   keeps working without analytics.
 * DOUBLE COUNTING RISK: a flag prevents inserting the container twice.
 */
function loadGoogleTagManager() {
  if (window.redlineGtmLoaded) {
    return;
  }
  if (!isAnalyticsConfigured()) {
    logAnalyticsDebug("GTM not loaded: replace GTM-XXXXXXX in config.js to activate analytics.");
    return;
  }
  if (window.SITE_CONFIG.analytics.requireConsent && getConsentStatus() !== "granted") {
    logAnalyticsDebug("GTM not loaded: waiting for consent.");
    return;
  }
  var containerId = window.SITE_CONFIG.analytics.gtmContainerId;

  // --- Official GTM snippet (ID read from config.js) ---
  window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  var script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtm.js?id=" + containerId;
  var firstScript = document.getElementsByTagName("script")[0];
  firstScript.parentNode.insertBefore(script, firstScript);
  // --- End of official snippet ---

  window.redlineGtmLoaded = true;
  logAnalyticsDebug("GTM container " + containerId + " loaded.");
}

/* ============================================================
 * C. TRACKING FUNCTIONS
 * ============================================================ */

/**
 * FUNCTION: trackAnalyticsEvent(eventName, parameters)
 *
 * PURPOSE: Records one non-item event (brand_filter_selected, search,
 *   vehicle_favorited, ...) as { event: name, ...parameters }.
 * INPUTS: eventName (lowercase_with_underscores, from ANALYTICS_GUIDE.md);
 *   parameters (plain object - NEVER names, emails, phone numbers,
 *   messages or any other personal data).
 * EXPECTED WEBSITE RESULT: nothing visible (console line in debug mode).
 * EXPECTED ANALYTICS EVENT: the website SENDS the push even without GTM;
 *   GA4 RECEIVES it only when GTM has a matching Custom Event trigger and
 *   a GA4 Event tag.
 * EVENT COUNT: +1 per call. PAGE VIEWS: unchanged.
 * ENGAGEMENT: an event alone does not add engagement time; it makes the
 *   session "engaged" only if marked as a key event in GA4.
 * HOW TO VERIFY: console line; GTM Preview event list; GA4 DebugView.
 * FAILURE CONDITIONS: empty name -> ignored with a console note. Never
 *   throws, so tracking can never break a button.
 * DOUBLE COUNTING RISK: only if a caller calls it twice for one action,
 *   or if GTM also has a generic click trigger for the same element.
 */
function trackAnalyticsEvent(eventName, parameters) {
  if (!eventName) {
    logAnalyticsDebug("trackAnalyticsEvent called without a name. Ignored.");
    return;
  }
  var data = { event: eventName };
  var extra = parameters || {};
  for (var key in extra) {
    if (Object.prototype.hasOwnProperty.call(extra, key)) {
      data[key] = extra[key];
    }
  }
  window.dataLayer.push(data);
  logAnalyticsDebug("event sent to dataLayer:", data);
}

/**
 * FUNCTION: trackEcommerceEvent(eventName, ecommerceData, extraParameters)
 *
 * PURPOSE: Records a GA4 item event (view_item_list, select_item,
 *   view_item) in GA4's format { event, ecommerce: { items: [...] } }.
 *   First pushes { ecommerce: null } (Google's recommendation) so data
 *   from the previous item event cannot leak into this one. That clearing
 *   push has no "event" key and is NOT counted as an event.
 * INPUTS: eventName; ecommerceData { item_list_id?, item_list_name?,
 *   items: [...] }; extraParameters (optional custom values placed next
 *   to "ecommerce").
 * NOTE ON PRICES: vehicle prices on this site are published MSRPs,
 *   announcements or SAMPLE values, so no price/value is sent. Browsing
 *   is never reported as revenue.
 * EVENT COUNT: +1 per call. PAGE VIEWS: unchanged.
 * HOW TO VERIFY: GTM Preview -> event -> Data Layer tab; DebugView -> items.
 *   In GTM the GA4 Event tag needs "Send Ecommerce data" ticked.
 * FAILURE CONDITIONS: no items -> ignored with a console note.
 * DOUBLE COUNTING RISK: as trackAnalyticsEvent().
 */
function trackEcommerceEvent(eventName, ecommerceData, extraParameters) {
  if (!eventName || !ecommerceData || !ecommerceData.items || ecommerceData.items.length === 0) {
    logAnalyticsDebug("trackEcommerceEvent called without a name or items. Ignored.");
    return;
  }
  window.dataLayer.push({ ecommerce: null });
  var data = { event: eventName };
  var extra = extraParameters || {};
  for (var key in extra) {
    if (Object.prototype.hasOwnProperty.call(extra, key)) {
      data[key] = extra[key];
    }
  }
  data.ecommerce = ecommerceData;
  window.dataLayer.push(data);
  logAnalyticsDebug("item event sent to dataLayer:", data);
}

/**
 * FUNCTION: trackEventOncePerPage(onceKey, eventName, parameters)
 *
 * PURPOSE: Sends an event only the FIRST time onceKey is used on this
 *   page load (e.g. test_drive_form_opened). Later calls are ignored.
 *   The memory resets when a new page loads.
 * RETURNS: true if the event was sent, false if it was already sent.
 * EVENT COUNT: at most +1 per page load per key.
 * DOUBLE COUNTING RISK: this function exists to prevent it.
 */
function trackEventOncePerPage(onceKey, eventName, parameters) {
  if (eventsSentThisPage[onceKey]) {
    return false;
  }
  eventsSentThisPage[onceKey] = true;
  trackAnalyticsEvent(eventName, parameters);
  return true;
}

/* ============================================================
 * D. VEHICLE -> GA4 ITEM
 * ============================================================ */

/**
 * FUNCTION: buildVehicleAnalyticsItem(vehicle, options)
 * PURPOSE: Converts a vehicle from vehicles.js into a GA4 item:
 *   { item_id, item_name, item_brand, item_category (body type),
 *     item_category2 (powertrain), item_variant (model year), index?,
 *     item_list_id?, item_list_name? }
 *   No price is included (see the note in trackEcommerceEvent).
 * EXPECTED ANALYTICS EFFECT: None directly; prepares data only.
 */
function buildVehicleAnalyticsItem(vehicle, options) {
  options = options || {};
  var item = {
    item_id: vehicle.id,
    item_name: vehicle.brand + " " + vehicle.model,
    item_brand: vehicle.brand,
    item_category: vehicle.bodyType,
    item_category2: vehicle.powertrain,
    item_variant: vehicle.modelYear ? String(vehicle.modelYear) : "announced",
    quantity: 1
  };
  if (typeof options.index === "number") {
    item.index = options.index;
  }
  if (options.listId) {
    item.item_list_id = options.listId;
    item.item_list_name = options.listName;
  }
  return item;
}

/**
 * FUNCTION: logAnalyticsDebug(message, data)
 * PURPOSE: Developer-only console output when debugLogging is true.
 * EXPECTED ANALYTICS EFFECT: None.
 */
function logAnalyticsDebug(message, data) {
  if (!window.SITE_CONFIG.analytics.debugLogging) {
    return;
  }
  if (data !== undefined) {
    console.log("[REDLINE analytics] " + message, data);
  } else {
    console.log("[REDLINE analytics] " + message);
  }
}

/**
 * FUNCTION: initAnalytics()
 * PURPOSE: Once per page: connect the consent buttons, then load GTM
 *   (consent given) or show the banner (no choice yet).
 * EXPECTED ANALYTICS EFFECT: see loadGoogleTagManager(). No custom event.
 */
function initAnalytics() {
  var accept = document.getElementById("consent-accept-btn");
  var decline = document.getElementById("consent-decline-btn");
  if (accept) {
    accept.addEventListener("click", function () { handleConsentChoice("granted"); });
  }
  if (decline) {
    decline.addEventListener("click", function () { handleConsentChoice("denied"); });
  }
  if (!isAnalyticsConfigured()) {
    logAnalyticsDebug("Analytics inactive (placeholder ID). Events are still printed here for learning.");
    return;
  }
  var settings = window.SITE_CONFIG.analytics;
  if (!settings.requireConsent || getConsentStatus() === "granted") {
    loadGoogleTagManager();
  } else if (getConsentStatus() === null) {
    var banner = document.getElementById("consent-banner");
    if (banner) {
      banner.hidden = false;
    }
  }
}

document.addEventListener("DOMContentLoaded", initAnalytics);
