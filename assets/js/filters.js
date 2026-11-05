/**
 * ============================================================
 * FILE: assets/js/filters.js
 * ============================================================
 *
 * 1. PURPOSE
 *    Finding vehicles: the "SELECT YOUR CAR BY" Brands/Types tabs and
 *    collection grid on the home page, all inventory filters on
 *    inventory.html, and the header search panel.
 *
 * 2. IMPORTANT SECTIONS
 *    A. Matching ...... vehicleMatchesCriteria(), getMatchingVehicles()
 *    B. Home page ..... filterVehiclesByBrand(), toggleVehicleType(),
 *                       resetFilters(), renderHomeGrid()
 *    C. Inventory ..... readInventoryControls(), renderInventory(),
 *                       handleInventoryControlChange()
 *    D. Search ........ openSearchPanel(), searchVehicles(),
 *                       handleSearchSubmit()
 *
 * 3. FEATURES IT CONTROLS
 *    Brand tiles, type chips, home grid + count + empty state, inventory
 *    filters/sort/reset/count, header search.
 *
 * 4. DEPENDENCIES
 *    config.js (BRANDS, TYPES), analytics.js, main.js, vehicles.js
 *    (VEHICLES, renderVehicleCards, sendVehicleListView, ...).
 *
 * 5. HOW A BEGINNER CAN MODIFY IT
 *    Brands and types: config.js. Price steps: PRICE_STEPS below.
 *    Sort options: SORTERS below (and the <select> in inventory.html).
 *
 * 6. GA4 / GTM INTEGRATION LOCATION
 *    Events via analytics.js: brand_filter_selected,
 *    vehicle_type_selected, filters_reset, search, view_item_list.
 *    NOT tracked (documented choice): switching the Brands/Types tab,
 *    price-range and sort changes, typing (only submitted searches count).
 *    Filters never change the address bar, so GA4 cannot record extra
 *    "history change" page views.
 * ============================================================
 */

// ==========================================
// GA4 AND GTM EVENT TRACKING SECTION
// ==========================================
// One event per intentional filter change. Redrawing the grid never
// sends an event. Selecting a brand that is already active is IGNORED
// (no state change, no event) - see ANALYTICS_TEST_CASES.md Scenario 5.

var homeFilters = { brand: null, types: [] };
var PRICE_STEPS = [100000, 150000, 250000, 500000, 1000000];
var SORTERS = {
  "featured": null,
  "price-asc": function (a, b) { return a.price.amount - b.price.amount; },
  "price-desc": function (a, b) { return b.price.amount - a.price.amount; },
  "year-desc": function (a, b) { return (b.modelYear || 0) - (a.modelYear || 0); },
  "year-asc": function (a, b) { return (a.modelYear || 9999) - (b.modelYear || 9999); },
  "name": function (a, b) { return getVehicleName(a).localeCompare(getVehicleName(b)); }
};

/* ============================================================
 * A. MATCHING (EXPECTED ANALYTICS EFFECT: None)
 * ============================================================ */

/**
 * FUNCTION: vehicleMatchesCriteria(vehicle, criteria)
 * PURPOSE: true when the vehicle passes every filter that is set.
 * criteria: { brand, types[], bodyType, powertrain, maxPrice, text }
 *   types use AND: Electric + Sports Car = electric sports cars only.
 */
function vehicleMatchesCriteria(vehicle, criteria) {
  if (criteria.brand && vehicle.brand !== criteria.brand) { return false; }
  if (criteria.bodyType && vehicle.bodyType !== criteria.bodyType) { return false; }
  if (criteria.powertrain && vehicle.powertrain !== criteria.powertrain) { return false; }
  if (criteria.maxPrice && (!vehicle.price || vehicle.price.amount > criteria.maxPrice)) { return false; }
  var types = criteria.types || [];
  for (var i = 0; i < types.length; i++) {
    if (vehicle.types.indexOf(types[i]) === -1) { return false; }
  }
  if (criteria.text) {
    var haystack = getSearchText(vehicle);
    var words = criteria.text.toLowerCase().split(/\s+/).filter(Boolean);
    for (var w = 0; w < words.length; w++) {
      if (haystack.indexOf(words[w]) === -1) { return false; }
    }
  }
  return true;
}

/**
 * FUNCTION: getSearchText(vehicle) - searchable words of a vehicle, lower case.
 * Only structured fields are searched (brand, model, body type,
 * powertrain, types, year). The free-text summary is left out on purpose:
 * "electric" must not match a hybrid whose summary mentions electric motors.
 */
function getSearchText(vehicle) {
  return [vehicle.brand, vehicle.model, vehicle.bodyType, vehicle.powertrain, vehicle.types.join(" "), vehicle.modelYear || "announced"].join(" ").toLowerCase();
}

/** FUNCTION: getMatchingVehicles(criteria) - filtered list in catalogue order. */
function getMatchingVehicles(criteria) {
  return window.VEHICLES.filter(function (vehicle) { return vehicleMatchesCriteria(vehicle, criteria); });
}

/** FUNCTION: countActiveHomeFilters() - how many home filters are set. */
function countActiveHomeFilters() {
  return (homeFilters.brand ? 1 : 0) + homeFilters.types.length;
}

/* ============================================================
 * B. HOME PAGE: "SELECT YOUR CAR BY"
 * ============================================================ */

/**
 * FUNCTION: renderHomeGrid()
 * PURPOSE: Redraws the home collection grid, count, empty state, active
 *   tiles/chips and the "View full inventory" link for the current
 *   filters.
 * EXPECTED ANALYTICS EFFECT: None directly (redrawing never tracks).
 */
function renderHomeGrid() {
  var grid = document.getElementById("home-grid");
  if (!grid) {
    return [];
  }
  var vehicles = getMatchingVehicles(homeFilters);
  renderVehicleCards(grid, vehicles);
  document.getElementById("home-count").textContent = vehicles.length + (vehicles.length === 1 ? " vehicle matches" : " vehicles match");
  document.getElementById("home-empty").hidden = vehicles.length > 0;
  document.getElementById("home-reset-btn").hidden = countActiveHomeFilters() === 0;

  var tiles = document.querySelectorAll("[data-brand-tile]");
  for (var i = 0; i < tiles.length; i++) {
    var active = tiles[i].getAttribute("data-brand-tile") === homeFilters.brand;
    tiles[i].classList.toggle("is-active", active);
    tiles[i].setAttribute("aria-pressed", active);
  }
  var chips = document.querySelectorAll("[data-type-chip]");
  for (var c = 0; c < chips.length; c++) {
    var on = homeFilters.types.indexOf(chips[c].getAttribute("data-type-chip")) !== -1;
    chips[c].classList.toggle("is-active", on);
    chips[c].setAttribute("aria-pressed", on);
  }

  var params = [];
  if (homeFilters.brand) { params.push("brand=" + encodeURIComponent(homeFilters.brand)); }
  if (homeFilters.types.length) { params.push("type=" + encodeURIComponent(homeFilters.types.join(","))); }
  document.getElementById("view-inventory-link").setAttribute("href", "inventory.html" + (params.length ? "?" + params.join("&") : ""));
  return vehicles;
}

/**
 * FUNCTION: filterVehiclesByBrand(brand)
 *
 * PURPOSE:
 * Displays vehicles from the selected brand.
 *
 * TRIGGER:
 * User selects a brand in the brand grid (BRANDS tab).
 *
 * EXPECTED WEBSITE RESULT:
 * - Catalog updates to matching vehicles (any selected types still apply).
 * - Result count updates.
 * - Selected brand appears active.
 *
 * EXPECTED ANALYTICS RESULT:
 * Event: brand_filter_selected
 *
 * Parameters:
 * - brand_name               e.g. "BMW"
 * - matching_vehicle_count   vehicles shown after filtering
 * - filter_location          "home_brand_grid"
 *
 * EXPECTED GA4 EFFECT:
 * - One event should be sent per intentional brand selection.
 * - No new page_view should be generated (only the catalog content
 *   changes; the address bar is not changed).
 * - Engagement time may change as the user continues browsing.
 * - Engagement rate is not guaranteed to change.
 *
 * HOW TO VERIFY:
 * 1. Open GTM Preview.  2. Click the BMW brand.
 * 3. Check that one event was sent.  4. Verify it in GA4 DebugView.
 * 5. Confirm brand_name equals BMW.
 *
 * FAILURE BEHAVIOR:
 * Unknown brand, or the grid is missing -> no event.
 *
 * DUPLICATION RULE:
 * Clicking the brand that is already active is ignored (no state change,
 * no event). Rerendering never sends events.
 */
function filterVehiclesByBrand(brand) {
  if (window.BRANDS.indexOf(brand) === -1 || brand === homeFilters.brand || !document.getElementById("home-grid")) {
    return;
  }
  homeFilters.brand = brand;
  var vehicles = renderHomeGrid();
  trackAnalyticsEvent("brand_filter_selected", {
    brand_name: brand,
    matching_vehicle_count: vehicles.length,
    filter_location: "home_brand_grid"
  });
}

/**
 * FUNCTION: toggleVehicleType(type)
 *
 * PURPOSE: Adds or removes a vehicle type in the TYPES tab. Several types
 *   combine with AND (Electric + Sports Car = electric sports cars).
 * TRIGGER: clicking a type chip.
 * EXPECTED WEBSITE RESULT: chip toggles; grid, count and empty state update.
 * EXPECTED ANALYTICS EVENT: vehicle_type_selected
 * EVENT PARAMETERS: vehicle_type, filter_action ("added" | "removed"),
 *   active_types (comma list after the change), matching_vehicle_count,
 *   filter_location "home_type_chips".
 * EVENT COUNT: +1 per chip click (every click changes the state).
 * PAGE VIEWS: unchanged. ENGAGEMENT: may grow while browsing.
 * HOW TO VERIFY: click Electric then Sports Car: two events; the second
 *   has active_types "Electric,Sports Car" and matching_vehicle_count 2.
 * FAILURE BEHAVIOR: unknown type -> no event.
 * DUPLICATION RULE: one event per click; redraws never track.
 */
function toggleVehicleType(type) {
  if (window.TYPES.indexOf(type) === -1 || !document.getElementById("home-grid")) {
    return;
  }
  var position = homeFilters.types.indexOf(type);
  var action = position === -1 ? "added" : "removed";
  if (position === -1) {
    homeFilters.types.push(type);
  } else {
    homeFilters.types.splice(position, 1);
  }
  var vehicles = renderHomeGrid();
  trackAnalyticsEvent("vehicle_type_selected", {
    vehicle_type: type,
    filter_action: action,
    active_types: homeFilters.types.join(","),
    matching_vehicle_count: vehicles.length,
    filter_location: "home_type_chips"
  });
}

/**
 * FUNCTION: resetFilters(location)
 *
 * PURPOSE: Clears all filters (home page or inventory page).
 * TRIGGER: "Reset filters" button, including the one in the empty state.
 * EXPECTED WEBSITE RESULT: all vehicles shown again; controls cleared.
 * EXPECTED ANALYTICS EVENT: filters_reset
 * EVENT PARAMETERS: filter_location ("home" | "inventory"),
 *   cleared_filter_count, matching_vehicle_count.
 * EVENT COUNT: +1 per reset that actually cleared something.
 * PAGE VIEWS: unchanged.
 * HOW TO VERIFY: choose BMW, click Reset: one filters_reset with
 *   cleared_filter_count 1.
 * FAILURE BEHAVIOR / DUPLICATION RULE: nothing active -> nothing happens
 *   and no event.
 */
function resetFilters(location) {
  var cleared = 0;
  if (location === "home") {
    cleared = countActiveHomeFilters();
    if (cleared === 0) { return; }
    homeFilters = { brand: null, types: [] };
    var homeVehicles = renderHomeGrid();
    trackAnalyticsEvent("filters_reset", { filter_location: "home", cleared_filter_count: cleared, matching_vehicle_count: homeVehicles.length });
    return;
  }
  var form = document.getElementById("inventory-filters");
  var criteria = readInventoryControls();
  cleared = ["brand", "bodyType", "powertrain", "maxPrice", "text"].filter(function (key) { return Boolean(criteria[key]); }).length + criteria.types.length + (criteria.sort !== "featured" ? 1 : 0);
  if (cleared === 0) { return; }
  form.reset();
  var vehicles = renderInventory();
  trackAnalyticsEvent("filters_reset", { filter_location: "inventory", cleared_filter_count: cleared, matching_vehicle_count: vehicles.length });
}

/**
 * FUNCTION: switchDiscoveryTab(tabName)
 * PURPOSE: Shows the BRANDS or TYPES panel (accessible tabs, arrow keys).
 * EXPECTED ANALYTICS EFFECT: None directly (switching tabs is not a
 *   filter; the filter clicks that follow are tracked).
 */
function switchDiscoveryTab(tabName) {
  var tabs = document.querySelectorAll("[data-discovery-tab]");
  for (var i = 0; i < tabs.length; i++) {
    var active = tabs[i].getAttribute("data-discovery-tab") === tabName;
    tabs[i].setAttribute("aria-selected", active);
    tabs[i].tabIndex = active ? 0 : -1;
    document.getElementById(tabs[i].getAttribute("aria-controls")).hidden = !active;
  }
}

/** FUNCTION: initHomeDiscovery() - draws tiles, chips, grid; view_item_list once. */
function initHomeDiscovery() {
  var brandGrid = document.getElementById("brand-grid");
  if (!brandGrid) {
    return;
  }
  brandGrid.innerHTML = window.BRANDS.map(function (brand) {
    var count = window.VEHICLES.filter(function (v) { return v.brand === brand; }).length;
    /* BUTTON: Brand tile. Handler: filterVehiclesByBrand(). Analytics: brand_filter_selected. */
    return '<button type="button" class="brand-tile" data-brand-tile="' + escapeHtml(brand) + '" aria-pressed="false"><span class="brand-tile__name">' + escapeHtml(brand) + '</span><span class="brand-tile__count">' + count + (count === 1 ? " model" : " models") + "</span></button>";
  }).join("");
  document.getElementById("type-chips").innerHTML = window.TYPES.map(function (type) {
    /* BUTTON: Type chip. Handler: toggleVehicleType(). Analytics: vehicle_type_selected. */
    return '<button type="button" class="type-chip" data-type-chip="' + escapeHtml(type) + '" aria-pressed="false">' + escapeHtml(type) + "</button>";
  }).join("");

  brandGrid.addEventListener("click", function (event) {
    var tile = event.target.closest("[data-brand-tile]");
    if (tile) { filterVehiclesByBrand(tile.getAttribute("data-brand-tile")); }
  });
  document.getElementById("type-chips").addEventListener("click", function (event) {
    var chip = event.target.closest("[data-type-chip]");
    if (chip) { toggleVehicleType(chip.getAttribute("data-type-chip")); }
  });
  var tabs = document.querySelectorAll("[data-discovery-tab]");
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener("click", function () { switchDiscoveryTab(this.getAttribute("data-discovery-tab")); });
    tabs[i].addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        var next = this.getAttribute("data-discovery-tab") === "brands" ? "types" : "brands";
        switchDiscoveryTab(next);
        document.querySelector('[data-discovery-tab="' + next + '"]').focus();
      }
    });
  }
  document.getElementById("home-reset-btn").addEventListener("click", function () { resetFilters("home"); });
  document.getElementById("home-empty-reset").addEventListener("click", function () { resetFilters("home"); });

  var vehicles = renderHomeGrid();
  sendVehicleListView("showroom_collection", "Showroom Collection", vehicles);
}

/* ============================================================
 * C. INVENTORY PAGE (inventory.html)
 * ============================================================ */

/** FUNCTION: readInventoryControls() - current values of every inventory control. Analytics: None. */
function readInventoryControls() {
  var form = document.getElementById("inventory-filters");
  return {
    text: form.elements.text.value.trim(),
    brand: form.elements.brand.value,
    bodyType: form.elements.bodyType.value,
    powertrain: form.elements.powertrain.value,
    types: form.elements.category.value ? [form.elements.category.value] : [],
    maxPrice: Number(form.elements.maxPrice.value) || 0,
    sort: form.elements.sort.value
  };
}

/**
 * FUNCTION: renderInventory()
 * PURPOSE: Applies all inventory controls, sorts, draws the grid, count
 *   and empty state. RETURNS: the shown vehicles.
 * EXPECTED ANALYTICS EFFECT: None directly (called by tracked handlers
 *   and by the initial page draw).
 */
function renderInventory() {
  var criteria = readInventoryControls();
  var vehicles = getMatchingVehicles(criteria);
  if (SORTERS[criteria.sort]) {
    vehicles = vehicles.slice().sort(SORTERS[criteria.sort]);
  }
  renderVehicleCards(document.getElementById("inventory-grid"), vehicles);
  document.getElementById("inventory-count").textContent = vehicles.length + " of " + window.VEHICLES.length + " vehicles match";
  document.getElementById("inventory-empty").hidden = vehicles.length > 0;
  return vehicles;
}

/**
 * FUNCTION: handleInventoryControlChange(event)
 *
 * PURPOSE: Re-filters the inventory when a control changes and reports
 *   the filter types that matter for analysis.
 * TRIGGER: changing the Brand, Body type, Powertrain, Category, Price or
 *   Sort select; typing in the name box (live, untracked).
 * EXPECTED WEBSITE RESULT: grid, "N of 10 vehicles match", empty state.
 * EXPECTED ANALYTICS EVENT (depends on the control):
 *   Brand       -> brand_filter_selected { brand_name ("All" when cleared),
 *                  matching_vehicle_count, filter_location "inventory" }
 *   Body type   -> vehicle_type_selected { vehicle_type, filter_name
 *   Powertrain     "body_type" | "powertrain" | "category",
 *   Category       filter_action "added"|"removed", matching_vehicle_count,
 *                  filter_location "inventory" }
 *   Price, Sort, typing -> no event (documented choice).
 * EVENT COUNT: +1 per tracked change. PAGE VIEWS: unchanged.
 * HOW TO VERIFY: choose Brand = Audi: one brand_filter_selected.
 * FAILURE BEHAVIOR: a select cannot fire "change" without a real change,
 *   so no empty events.
 * DUPLICATION RULE: one listener on the form; redraw never tracks.
 */
function handleInventoryControlChange(event) {
  var field = event.target.name;
  var vehicles = renderInventory();
  if (event.type === "input") {
    return; // live typing: not tracked
  }
  var value = event.target.value;
  if (field === "brand") {
    trackAnalyticsEvent("brand_filter_selected", { brand_name: value || "All", matching_vehicle_count: vehicles.length, filter_location: "inventory" });
  } else if (field === "bodyType" || field === "powertrain" || field === "category") {
    trackAnalyticsEvent("vehicle_type_selected", {
      vehicle_type: value || "All",
      filter_name: field === "bodyType" ? "body_type" : field,
      filter_action: value ? "added" : "removed",
      matching_vehicle_count: vehicles.length,
      filter_location: "inventory"
    });
  }
}

/**
 * FUNCTION: initInventory()
 * PURPOSE: Fills the selects, applies filters from the link
 *   (?brand=BMW&type=Electric,Sports Car&q=audi) WITHOUT tracking them
 *   (the click that created the link was already tracked), draws the
 *   grid and sends view_item_list once.
 * EXPECTED ANALYTICS EFFECT: view_item_list ("inventory") once per load.
 */
function initInventory() {
  var form = document.getElementById("inventory-filters");
  if (!form) {
    return;
  }
  function fill(select, values) {
    select.innerHTML += values.map(function (v) { return '<option value="' + escapeHtml(v) + '">' + escapeHtml(v) + "</option>"; }).join("");
  }
  var brands = window.VEHICLES.map(function (v) { return v.brand; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort();
  fill(form.elements.brand, brands);
  fill(form.elements.bodyType, ["Coupe", "Sedan", "SUV", "Roadster"]);
  fill(form.elements.powertrain, ["Petrol", "Hybrid", "Electric"]);
  fill(form.elements.category, window.TYPES);
  form.elements.maxPrice.innerHTML += PRICE_STEPS.map(function (p) { return '<option value="' + p + '">Up to $' + p.toLocaleString("en-US") + "</option>"; }).join("");

  var brand = getQueryParameter("brand");
  var type = getQueryParameter("type");
  var text = getQueryParameter("q");
  if (brand && brands.indexOf(brand) !== -1) { form.elements.brand.value = brand; }
  if (text) { form.elements.text.value = text; }
  if (type) {
    var firstType = type.split(",")[0];
    if (window.TYPES.indexOf(firstType) !== -1) { form.elements.category.value = firstType; }
    if (type.split(",").indexOf("Electric") !== -1) { form.elements.powertrain.value = "Electric"; }
    if (type.split(",").indexOf("Hybrid") !== -1) { form.elements.powertrain.value = "Hybrid"; }
    if (firstType === "Electric" || firstType === "Hybrid") {
      var second = type.split(",")[1];
      form.elements.category.value = window.TYPES.indexOf(second) !== -1 ? second : "";
    }
  }

  form.addEventListener("change", handleInventoryControlChange);
  form.elements.text.addEventListener("input", handleInventoryControlChange);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var vehicles = renderInventory();
    var term = form.elements.text.value.trim();
    if (term) {
      trackAnalyticsEvent("search", { search_term: term.toLowerCase().slice(0, 100), result_count: vehicles.length, search_location: "inventory" });
    }
  });
  document.getElementById("inventory-reset-btn").addEventListener("click", function () { resetFilters("inventory"); });
  document.getElementById("inventory-empty-reset").addEventListener("click", function () { resetFilters("inventory"); });

  var vehicles = renderInventory();
  sendVehicleListView("inventory", "Inventory", vehicles);
}

/* ============================================================
 * D. HEADER SEARCH PANEL
 * ============================================================ */

/**
 * FUNCTION: searchVehicles(query)
 * PURPOSE: Vehicles whose brand, model, body type, powertrain, types or
 *   model year contain every typed word ("electric suv", "roadster").
 * EXPECTED ANALYTICS EFFECT: None (pure lookup).
 */
function searchVehicles(query) {
  if (!query.trim()) {
    return [];
  }
  return getMatchingVehicles({ text: query.trim() });
}

/** FUNCTION: renderSearchResults(results, query) - result links or hints. Analytics: None. */
function renderSearchResults(results, query) {
  var box = document.getElementById("search-results");
  if (!query.trim()) {
    box.innerHTML = '<p class="muted">Try: <button type="button" class="link-btn" data-search-suggestion="BMW">BMW</button>, <button type="button" class="link-btn" data-search-suggestion="Audi">Audi</button>, <button type="button" class="link-btn" data-search-suggestion="Electric">Electric</button>, <button type="button" class="link-btn" data-search-suggestion="SUV">SUV</button>, <button type="button" class="link-btn" data-search-suggestion="Roadster">Roadster</button></p>';
    return;
  }
  if (results.length === 0) {
    box.innerHTML = '<p class="muted">No vehicles match &ldquo;' + escapeHtml(query) + '&rdquo;. <a href="inventory.html">Browse the inventory</a>.</p>';
    return;
  }
  box.innerHTML = '<p class="muted">' + results.length + (results.length === 1 ? " result" : " results") + '</p><ul class="search-list" data-list-id="search_results" data-list-name="Search results">' +
    results.map(function (vehicle, index) {
      /* LINK: search result -> vehicle page. Handler: handleVehicleSelect()
         (select_item, list "search_results"). */
      return '<li><a href="vehicle.html?id=' + vehicle.id + '" data-select-vehicle="' + vehicle.id + '" data-index="' + index + '"><img src="' + getPhotoUrl(vehicle.photos[0], 330) + '" alt="" width="96" height="54"><span><strong>' + escapeHtml(getVehicleName(vehicle)) + "</strong><small>" + escapeHtml(getModelYearText(vehicle) + " · " + vehicle.bodyType + " · " + vehicle.powertrain) + "</small></span></a></li>";
    }).join("") + "</ul>";
}

/**
 * FUNCTION: openSearchPanel(openerButton)
 * PURPOSE: Opens the search panel with the cursor in the box.
 * EXPECTED ANALYTICS EFFECT: None directly. Only a submitted search sends
 *   "search"; a result click sends select_item.
 */
function openSearchPanel(openerButton) {
  document.getElementById("search-input").value = "";
  renderSearchResults([], "");
  openPanel("search-panel", openerButton);
}

/**
 * FUNCTION: handleSearchSubmit(event)
 *
 * PURPOSE: Runs the search and records it.
 * TRIGGER: Enter / Search button in the header search panel, or a
 *   suggestion button.
 * EXPECTED WEBSITE RESULT: matching vehicles listed (or "No vehicles").
 * EXPECTED ANALYTICS EVENT: search (GA4 recommended name)
 * EVENT PARAMETERS: search_term (trimmed, lower case, max 100 chars),
 *   result_count, search_location "header".
 * EVENT COUNT: +1 per submission; typing alone sends nothing.
 * PAGE VIEWS: unchanged (no results page is loaded).
 * HOW TO VERIFY: type "electric", Enter: one search, result_count 2.
 * FAILURE BEHAVIOR: empty box -> hint, no event.
 * DUPLICATION RULE: GA4 Enhanced Measurement site search only reads
 *   ?q= in the URL of a loaded page; this panel never loads one.
 */
function handleSearchSubmit(event) {
  if (event) {
    event.preventDefault();
  }
  var input = document.getElementById("search-input");
  var results = searchVehicles(input.value);
  renderSearchResults(results, input.value);
  if (!input.value.trim()) {
    return;
  }
  trackAnalyticsEvent("search", { search_term: input.value.trim().toLowerCase().slice(0, 100), result_count: results.length, search_location: "header" });
}

/** FUNCTION: initSearch() - connects the search button, live preview and submit. */
function initSearch() {
  document.addEventListener("click", function (event) {
    var opener = event.target.closest('[data-open="search"]');
    if (opener) {
      openSearchPanel(opener);
      return;
    }
    var suggestion = event.target.closest("[data-search-suggestion]");
    if (suggestion) {
      var input = document.getElementById("search-input");
      input.value = suggestion.getAttribute("data-search-suggestion");
      handleSearchSubmit();
      input.focus();
    }
  });
  var form = document.getElementById("search-form");
  if (form) {
    form.addEventListener("submit", handleSearchSubmit);
    document.getElementById("search-input").addEventListener("input", function () {
      renderSearchResults(searchVehicles(this.value), this.value); // live preview, not tracked
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initSearch();
  initHomeDiscovery();
  initInventory();
});
