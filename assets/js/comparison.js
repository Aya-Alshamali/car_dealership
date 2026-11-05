/**
 * ============================================================
 * FILE: assets/js/comparison.js
 * ============================================================
 *
 * 1. PURPOSE
 *    Side-by-side comparison of 2-3 vehicles: the Compare buttons, the
 *    floating comparison tray, and compare.html.
 *
 * 2. IMPORTANT SECTIONS
 *    A. Storage ....... getCompareIds(), saveCompareIds(), isInCompare()
 *    B. Actions ....... toggleCompare(), removeFromCompare()
 *    C. Tray .......... updateCompareUi()
 *    D. Page .......... renderComparisonPage()  (vehicle_comparison_viewed)
 *
 * 3. FEATURES IT CONTROLS
 *    [data-compare-toggle] buttons, the tray (#compare-tray),
 *    [data-compare-count] badges, compare.html.
 *
 * 4. DEPENDENCIES
 *    config.js (maxCompare), analytics.js, main.js, vehicles.js.
 *
 * 5. HOW A BEGINNER CAN MODIFY IT
 *    Change the limit in config.js (maxCompare). Change the compared rows
 *    in COMPARE_ROWS. Only vehicle IDs are stored (localStorage).
 *
 * 6. GA4 / GTM INTEGRATION LOCATION
 *    Event via analytics.js: vehicle_comparison_viewed.
 *    Adding/removing vehicles to the comparison is NOT tracked: the
 *    meaningful moment is opening the comparison (keeps test counts exact).
 * ============================================================
 */

// ==========================================
// GA4 AND GTM EVENT TRACKING SECTION
// ==========================================
// Only renderComparisonPage() sends an event, once per page load, when
// at least two vehicles are shown.

var COMPARE_KEY = "redline_compare";
var compareMemory = null;
var COMPARE_ROWS = [
  ["Manufacturer", function (v) { return v.brand; }],
  ["Model", function (v) { return v.model; }],
  ["Model year", function (v) { return getModelYearText(v); }],
  ["Body type", function (v) { return v.bodyType; }],
  ["Powertrain", function (v) { return v.powertrain; }],
  ["Engine", "engine"], ["Power", "horsepower"], ["Torque", "torque"],
  ["Acceleration", "acceleration"], ["Top speed", "topSpeed"],
  ["Transmission", "transmission"], ["Drivetrain", "drivetrain"],
  ["Seating capacity", "seating"], ["Battery", "battery"], ["Range", "range"],
  ["Price", function (v) { return formatVehiclePrice(v); }]
];

/* ============ A. STORAGE (EXPECTED ANALYTICS EFFECT: None) ============ */

/** FUNCTION: getCompareIds() - IDs chosen for comparison (max from config). */
function getCompareIds() {
  var ids = compareMemory;
  if (ids === null) {
    try {
      ids = JSON.parse(window.localStorage.getItem(COMPARE_KEY) || "[]");
    } catch (error) {
      ids = [];
    }
  }
  if (!Array.isArray(ids)) {
    ids = [];
  }
  return ids.filter(function (id) { return Boolean(getVehicleById(id)); }).slice(0, window.SITE_CONFIG.maxCompare);
}

/** FUNCTION: saveCompareIds(ids) */
function saveCompareIds(ids) {
  try {
    window.localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
    compareMemory = null;
  } catch (error) {
    compareMemory = ids;
  }
}

/** FUNCTION: isInCompare(id) */
function isInCompare(vehicleId) {
  return getCompareIds().indexOf(vehicleId) !== -1;
}

/* ============ B. ACTIONS ============ */

/**
 * FUNCTION: toggleCompare(vehicleId)
 *
 * PURPOSE: Adds a vehicle to the comparison, or removes it.
 * USER ACTION: Compare button on a card or on the vehicle page.
 * EXPECTED WEBSITE RESULT: button highlighted; tray shows names and a
 *   "Compare (n)" button. Adding a 4th vehicle is refused with the
 *   message "You can compare up to 3 vehicles. Remove one first."
 * EXPECTED ANALYTICS EFFECT: None directly (by design, see file header).
 *   Indirectly enables vehicle_comparison_viewed on compare.html.
 * FAILURE CONDITIONS: unknown vehicle -> nothing; limit reached -> error
 *   toast, list unchanged.
 */
function toggleCompare(vehicleId) {
  if (!getVehicleById(vehicleId)) {
    return;
  }
  var ids = getCompareIds();
  var position = ids.indexOf(vehicleId);
  if (position !== -1) {
    ids.splice(position, 1);
    showToast("Removed from comparison");
  } else if (ids.length >= window.SITE_CONFIG.maxCompare) {
    showToast("You can compare up to " + window.SITE_CONFIG.maxCompare + " vehicles. Remove one first.", "error");
    return;
  } else {
    ids.push(vehicleId);
    showToast(ids.length < 2 ? "Added. Choose at least one more vehicle to compare." : "Added to comparison");
  }
  saveCompareIds(ids);
  updateCompareUi();
}

/**
 * FUNCTION: removeFromCompare(vehicleId)
 * PURPOSE: "Remove" on compare.html or in the tray.
 * EXPECTED WEBSITE RESULT: column / tray entry disappears.
 * EXPECTED ANALYTICS EFFECT: None. Redrawing compare.html does NOT
 *   resend vehicle_comparison_viewed.
 */
function removeFromCompare(vehicleId) {
  var ids = getCompareIds().filter(function (id) { return id !== vehicleId; });
  saveCompareIds(ids);
  updateCompareUi();
  if (document.body.getAttribute("data-page") === "compare") {
    renderComparisonPage();
  }
}

/* ============ C. TRAY (EXPECTED ANALYTICS EFFECT: None) ============ */

/** FUNCTION: updateCompareUi() - buttons, badges and the floating tray. */
function updateCompareUi() {
  var ids = getCompareIds();
  var buttons = document.querySelectorAll("[data-compare-toggle]");
  for (var i = 0; i < buttons.length; i++) {
    var selected = ids.indexOf(buttons[i].getAttribute("data-compare-toggle")) !== -1;
    buttons[i].setAttribute("aria-pressed", selected);
    var label = buttons[i].querySelector("[data-compare-label]");
    if (label) {
      label.textContent = selected ? "In comparison" : "Compare";
    }
  }
  var badges = document.querySelectorAll("[data-compare-count]");
  for (var b = 0; b < badges.length; b++) {
    badges[b].textContent = ids.length;
    badges[b].hidden = ids.length === 0;
  }
  var tray = document.getElementById("compare-tray");
  if (!tray || document.body.getAttribute("data-page") === "compare") {
    return;
  }
  tray.hidden = ids.length === 0;
  document.getElementById("compare-tray-list").innerHTML = ids.map(function (id) {
    var vehicle = getVehicleById(id);
    /* BUTTON: remove from tray (x). Handler: removeFromCompare(). Analytics: none. */
    return '<li>' + escapeHtml(getVehicleName(vehicle)) + ' <button type="button" class="tray-remove" data-compare-remove="' + id + '" aria-label="Remove ' + escapeHtml(getVehicleName(vehicle)) + ' from comparison">' + getIconSvg("close") + "</button></li>";
  }).join("");
  var open = document.getElementById("compare-tray-open");
  open.textContent = "Compare (" + ids.length + ")";
  open.setAttribute("href", "compare.html?ids=" + ids.join(","));
  open.setAttribute("aria-disabled", ids.length < 2);
  open.classList.toggle("is-disabled", ids.length < 2);
}

/* ============ D. COMPARISON PAGE ============ */
var comparisonViewSent = false;

/**
 * FUNCTION: renderComparisonPage()
 *
 * PURPOSE: Draws the side-by-side table on compare.html using the values
 *   in vehicles.js. Missing values show "Not available".
 * USER ACTION: opening compare.html (from the tray's Compare button, the
 *   vehicle page or the header), or removing a column.
 * EXPECTED WEBSITE RESULT: 2-3 columns with photo, name, all rows and a
 *   Remove button; fewer than 2 -> a message and a link to the inventory.
 * EXPECTED ANALYTICS EVENT: vehicle_comparison_viewed
 * EVENT PARAMETERS: vehicle_ids (comma-separated, e.g.
 *   "audi-r8-v10-performance,bmw-m8-competition"), vehicle_count.
 * EVENT COUNT: +1 per page load when 2+ vehicles are shown. Removing a
 *   column afterwards does not send another one. Reloading the page is a
 *   new view and sends a new event.
 * PAGE VIEWS: compare.html's own page_view (GA4 tag). No virtual views.
 * ENGAGEMENT: reading the table adds engagement time naturally.
 * HOW TO VERIFY: compare Audi R8 + BMW M8, open compare.html: one event
 *   with both IDs.
 * FAILURE CONDITIONS: fewer than 2 valid vehicles -> no event.
 * DOUBLE COUNTING RISK: guarded by comparisonViewSent.
 */
function renderComparisonPage() {
  var table = document.getElementById("compare-table");
  if (!table) {
    return;
  }
  var ids = getCompareIds();
  var vehicles = ids.map(getVehicleById);
  var enough = vehicles.length >= 2;
  document.getElementById("compare-empty").hidden = enough;
  document.getElementById("compare-wrapper").hidden = !enough;
  if (!enough) {
    return;
  }

  var head = '<tr><th scope="col"><span class="visually-hidden">Specification</span></th>' + vehicles.map(function (v) {
    /* BUTTON: Remove (comparison column). Handler: removeFromCompare(). Analytics: none. */
    return '<th scope="col"><img src="' + getPhotoUrl(v.photos[0], 500) + '" alt="" width="240" height="135" loading="lazy">' +
      '<a href="vehicle.html?id=' + v.id + '">' + escapeHtml(getVehicleName(v)) + "</a>" +
      '<button type="button" class="btn btn--ghost btn--small" data-compare-remove="' + v.id + '">' + getIconSvg("trash") + " Remove</button></th>";
  }).join("") + "</tr>";

  var body = "";
  for (var r = 0; r < COMPARE_ROWS.length; r++) {
    var label = COMPARE_ROWS[r][0];
    var getter = COMPARE_ROWS[r][1];
    body += '<tr><th scope="row">' + label + "</th>";
    for (var c = 0; c < vehicles.length; c++) {
      var value;
      var status = "";
      if (typeof getter === "function") {
        value = getter(vehicles[c]);
      } else {
        var spec = vehicles[c].specs[getter];
        value = spec ? spec.value : "Not available";
        status = spec ? spec.status : "missing";
      }
      body += "<td" + (value === "Not available" ? ' class="not-verified"' : "") + ">" + escapeHtml(value) +
        (status && status !== "missing" ? ' <span class="badge badge--' + status + '">' + escapeHtml(SPEC_STATUS_LABELS[status]) + "</span>" : "") + "</td>";
    }
    body += "</tr>";
  }
  table.innerHTML = "<thead>" + head + "</thead><tbody>" + body + "</tbody>";

  if (!comparisonViewSent) {
    comparisonViewSent = true;
    trackAnalyticsEvent("vehicle_comparison_viewed", {
      vehicle_ids: ids.join(","),
      vehicle_count: ids.length
    });
  }
}

/**
 * FUNCTION: initComparison()
 * PURPOSE: Reads ?ids= on compare.html (so shared links work), connects
 *   the Compare/Remove buttons, draws the tray and the page.
 * EXPECTED ANALYTICS EFFECT: vehicle_comparison_viewed via
 *   renderComparisonPage() (once).
 */
function initComparison() {
  var fromUrl = getQueryParameter("ids");
  if (fromUrl && document.body.getAttribute("data-page") === "compare") {
    var valid = fromUrl.split(",").filter(function (id) { return Boolean(getVehicleById(id)); });
    if (valid.length > window.SITE_CONFIG.maxCompare) {
      showToast("Only the first " + window.SITE_CONFIG.maxCompare + " vehicles are compared.", "error");
    }
    saveCompareIds(valid.slice(0, window.SITE_CONFIG.maxCompare));
  }
  document.addEventListener("click", function (event) {
    var toggle = event.target.closest("[data-compare-toggle]");
    if (toggle && toggle.getAttribute("data-compare-toggle")) {
      toggleCompare(toggle.getAttribute("data-compare-toggle"));
      return;
    }
    var remove = event.target.closest("[data-compare-remove]");
    if (remove) {
      removeFromCompare(remove.getAttribute("data-compare-remove"));
      return;
    }
    var open = event.target.closest("#compare-tray-open");
    if (open && open.classList.contains("is-disabled")) {
      event.preventDefault();
      showToast("Choose at least two vehicles to compare.", "error");
    }
  });
  window.addEventListener("storage", function (event) {
    if (event.key === COMPARE_KEY) {
      updateCompareUi();
    }
  });
  updateCompareUi();
  renderComparisonPage();
}

document.addEventListener("DOMContentLoaded", initComparison);
