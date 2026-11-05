/**
 * ============================================================
 * FILE: assets/js/favorites.js
 * ============================================================
 *
 * 1. PURPOSE
 *    Saved vehicles ("Favorites"): save/remove with the heart buttons,
 *    the header count, and the favorites.html page. No registration.
 *
 * 2. IMPORTANT SECTIONS
 *    A. Storage ....... getFavoriteIds(), saveFavoriteIds(), isFavorite()
 *    B. Action ........ toggleFavorite()  (vehicle_favorited / _unfavorited)
 *    C. Display ....... updateFavoriteButtons(), renderFavoritesPage()
 *
 * 3. FEATURES IT CONTROLS
 *    Every [data-favorite-toggle] button, [data-favorites-count] badges,
 *    favorites.html.
 *
 * 4. DEPENDENCIES
 *    config.js, analytics.js, main.js (showToast, escapeHtml),
 *    vehicles.js (getVehicleById, renderVehicleCards, sendVehicleListView).
 *
 * 5. HOW A BEGINNER CAN MODIFY IT
 *    Messages in FAVORITE_MESSAGES. Only vehicle IDs are stored, in
 *    localStorage under FAVORITES_KEY - never personal data.
 *
 * 6. GA4 / GTM INTEGRATION LOCATION
 *    Events via analytics.js: vehicle_favorited, vehicle_unfavorited,
 *    and view_item_list on favorites.html (list "favorites").
 * ============================================================
 */

// ==========================================
// GA4 AND GTM EVENT TRACKING SECTION
// ==========================================
// Saving or removing a favorite is tracked once per click. Favorites are
// interest signals, NOT conversions: do not mark them as purchases.

var FAVORITES_KEY = "redline_favorites";
var FAVORITE_MESSAGES = {
  saved: "Saved to favorites",
  removed: "Removed from favorites",
  storageFailed: "Favorites could not be saved in this browser (storage blocked)."
};
var favoritesMemory = null; // used if localStorage is blocked

/* ============ A. STORAGE (EXPECTED ANALYTICS EFFECT: None) ============ */

/** FUNCTION: getFavoriteIds() - saved vehicle IDs that still exist in the catalogue. */
function getFavoriteIds() {
  var ids = favoritesMemory;
  if (ids === null) {
    try {
      ids = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || "[]");
    } catch (error) {
      ids = [];
    }
  }
  if (!Array.isArray(ids)) {
    ids = [];
  }
  return ids.filter(function (id) { return Boolean(getVehicleById(id)); });
}

/** FUNCTION: saveFavoriteIds(ids) - stores the list; tells the visitor if storage fails. */
function saveFavoriteIds(ids) {
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
    favoritesMemory = null;
  } catch (error) {
    favoritesMemory = ids;
    showToast(FAVORITE_MESSAGES.storageFailed, "error");
  }
}

/** FUNCTION: isFavorite(id) - true if saved. */
function isFavorite(vehicleId) {
  return getFavoriteIds().indexOf(vehicleId) !== -1;
}

/* ============ B. ACTION ============ */

/**
 * FUNCTION: toggleFavorite(vehicleId, location)
 *
 * PURPOSE: Saves the vehicle if it is not saved, removes it if it is.
 * USER ACTION: clicking a heart button (card, vehicle page, favorites
 *   page "Remove").
 * EXPECTED WEBSITE RESULT: every heart for this vehicle turns red (saved)
 *   or outline (removed); header count updates; toast message;
 *   favorites.html redraws.
 * EXPECTED ANALYTICS EVENT: vehicle_favorited OR vehicle_unfavorited
 * EVENT PARAMETERS: vehicle_id, vehicle_name, vehicle_brand,
 *   favorite_location ("vehicle_card", "vehicle_page", "favorites_page"),
 *   favorites_count (after the change).
 * EVENT COUNT: +1 per click. PAGE VIEWS: unchanged.
 * ENGAGEMENT TIME: none directly.
 * ENGAGEMENT RATE: changes only if you mark vehicle_favorited as a key
 *   event in GA4 (not recommended: saving is not a lead).
 * HOW TO VERIFY: click a heart: one vehicle_favorited; click again: one
 *   vehicle_unfavorited.
 * FAILURE CONDITIONS: unknown vehicle -> nothing, no event. Storage
 *   blocked -> works for this page only, message shown, event still sent
 *   (the visitor really saved it for this session).
 * DOUBLE COUNTING RISK: one delegated listener for all hearts.
 */
function toggleFavorite(vehicleId, location) {
  var vehicle = getVehicleById(vehicleId);
  if (!vehicle) {
    return;
  }
  var ids = getFavoriteIds();
  var position = ids.indexOf(vehicleId);
  var saving = position === -1;
  if (saving) {
    ids.push(vehicleId);
  } else {
    ids.splice(position, 1);
  }
  saveFavoriteIds(ids);
  updateFavoriteButtons();
  showToast(saving ? FAVORITE_MESSAGES.saved : FAVORITE_MESSAGES.removed);
  if (document.body.getAttribute("data-page") === "favorites") {
    renderFavoritesPage();
    // The removed card held keyboard focus: move focus to the count text.
    if (!document.activeElement || document.activeElement === document.body) {
      var countText = document.getElementById("favorites-count-text");
      countText.setAttribute("tabindex", "-1");
      countText.focus();
    }
  }
  trackAnalyticsEvent(saving ? "vehicle_favorited" : "vehicle_unfavorited", {
    vehicle_id: vehicle.id,
    vehicle_name: getVehicleName(vehicle),
    vehicle_brand: vehicle.brand,
    favorite_location: location,
    favorites_count: ids.length
  });
}

/* ============ C. DISPLAY (EXPECTED ANALYTICS EFFECT: None) ============ */

/** FUNCTION: updateFavoriteButtons() - heart states + header counts everywhere. */
function updateFavoriteButtons() {
  var ids = getFavoriteIds();
  var buttons = document.querySelectorAll("[data-favorite-toggle]");
  for (var i = 0; i < buttons.length; i++) {
    var saved = ids.indexOf(buttons[i].getAttribute("data-favorite-toggle")) !== -1;
    buttons[i].setAttribute("aria-pressed", saved);
    var label = buttons[i].querySelector("[data-favorite-label]");
    if (label) {
      label.textContent = saved ? "Saved" : "Save to Favorites";
    }
  }
  var badges = document.querySelectorAll("[data-favorites-count]");
  for (var b = 0; b < badges.length; b++) {
    badges[b].textContent = ids.length;
    badges[b].hidden = ids.length === 0;
  }
}

/**
 * FUNCTION: renderFavoritesPage()
 * PURPOSE: favorites.html: draws the saved vehicles or the empty state.
 * EXPECTED ANALYTICS EFFECT: view_item_list ("favorites") once per page
 *   load when at least one vehicle is saved (sendVehicleListView guards it).
 */
function renderFavoritesPage() {
  var grid = document.getElementById("favorites-grid");
  if (!grid) {
    return;
  }
  var vehicles = getFavoriteIds().map(getVehicleById);
  renderVehicleCards(grid, vehicles);
  document.getElementById("favorites-empty").hidden = vehicles.length > 0;
  document.getElementById("favorites-count-text").textContent = vehicles.length + (vehicles.length === 1 ? " saved vehicle" : " saved vehicles");
  sendVehicleListView("favorites", "Favorites", vehicles);
}

/** FUNCTION: initFavorites() - one listener for every heart; draws counts and the page. */
function initFavorites() {
  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-favorite-toggle]");
    if (button && button.getAttribute("data-favorite-toggle")) {
      var location = button.getAttribute("data-favorite-location") || (button.closest("[data-vehicle-card]") ? "vehicle_card" : "vehicle_page");
      if (document.body.getAttribute("data-page") === "favorites" && location === "vehicle_card") {
        location = "favorites_page";
      }
      toggleFavorite(button.getAttribute("data-favorite-toggle"), location);
    }
  });
  window.addEventListener("storage", function (event) {
    if (event.key === FAVORITES_KEY) {
      updateFavoriteButtons();
      renderFavoritesPage();
    }
  });
  updateFavoriteButtons();
  renderFavoritesPage();
}

document.addEventListener("DOMContentLoaded", initFavorites);
