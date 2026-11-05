/**
 * ============================================================
 * FILE: assets/js/forms.js
 * ============================================================
 *
 * 1. PURPOSE
 *    The vehicle inquiry / test-drive request form (contact.html) and
 *    the "STAY IN TOUCH" newsletter form (index.html).
 *
 * 2. IMPORTANT SECTIONS
 *    A. Shared ........ showFieldErrors(), clearFieldErrors(), postJson()
 *    B. Inquiry ....... initInquiryForm(), validateInquiry(),
 *                       submitInquiry(), handleInquiryTypeChange()
 *    C. Newsletter .... submitNewsletter()
 *
 * 3. FEATURES IT CONTROLS
 *    Validation with accessible error messages, demo-mode confirmations,
 *    optional real delivery to a configured endpoint.
 *
 * 4. DEPENDENCIES
 *    config.js (inquiryEndpoint, newsletterEndpoint), analytics.js,
 *    main.js, vehicles.js (VEHICLES for the vehicle list).
 *
 * 5. HOW A BEGINNER CAN MODIFY IT
 *    Messages: FORM_MESSAGES. Inquiry types: the <select> in contact.html.
 *    To send real requests: set the endpoints in config.js.
 *
 * 6. GA4 / GTM INTEGRATION LOCATION
 *    Events via analytics.js:
 *      test_drive_form_opened   (form shown in test-drive mode)
 *      inquiry_validation_failed (field NAMES only, never values)
 *      demo_lead_submitted      (demo mode - NOT a real lead)
 *      generate_lead            (ONLY after the endpoint confirms)
 *      demo_newsletter_submitted (demo mode - NOT a subscription)
 *      sign_up                  (ONLY after the endpoint confirms)
 *
 * PRIVACY
 *    Submissions are never written to localStorage or cookies and never
 *    sent to analytics. In demo mode they go nowhere at all.
 * ============================================================
 */

// ==========================================
// GA4 AND GTM EVENT TRACKING SECTION
// ==========================================
// Rule: a conversion event (generate_lead, sign_up) is sent only after a
// configured system confirms acceptance (HTTP 2xx). Demo submissions use
// clearly named demo_* events so GA4 never shows fake conversions.

var FORM_MESSAGES = {
  name: "Please enter your full name (at least 2 characters).",
  email: "Please enter a valid email address, for example name@example.com.",
  phone: "Please enter a phone number with at least 7 digits (required when you prefer a phone call).",
  phoneFormat: "This phone number looks incomplete (at least 7 digits).",
  vehicle: "Please choose a vehicle.",
  inquiryType: "Please choose an inquiry type.",
  date: "Please choose a test-drive date from tomorrow onwards.",
  announced: "This vehicle is announced only and not in production, so a test drive cannot be requested.",
  message: "Please write a short message (at least 10 characters).",
  consent: "Please confirm that you have read the privacy notice.",
  demoLead: "Demo request recorded locally; not sent to a dealer. No test drive or appointment has been booked, and your details were not stored.",
  liveLead: "Thank you. Your request was received by the showroom system. A team member will contact you to confirm.",
  sendFailed: "Sorry, your request could not be sent. Please try again later or contact us by phone.",
  newsletterInvalid: "Please enter a valid email address.",
  newsletterDemo: "Demo only: you have NOT been subscribed. No email address was sent or stored.",
  newsletterLive: "Thank you. Please check your inbox to confirm your subscription.",
  newsletterFailed: "Sorry, the subscription service did not respond. Please try again later."
};

/* ============================================================
 * A. SHARED (EXPECTED ANALYTICS EFFECT: None)
 * ============================================================ */

/** FUNCTION: isValidEmail(text) - simple "something@something.something" check. */
function isValidEmail(text) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
}

/** FUNCTION: getTomorrowIso() - tomorrow as YYYY-MM-DD (date input format). */
function getTomorrowIso() {
  var date = new Date();
  date.setDate(date.getDate() + 1);
  return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
}

/**
 * FUNCTION: showFieldErrors(form, errors)
 * PURPOSE: Writes each message under its field, sets aria-invalid and
 *   aria-describedby (screen readers read the message), focuses the first.
 */
function showFieldErrors(form, errors) {
  for (var i = 0; i < errors.length; i++) {
    var field = form.querySelector('[name="' + errors[i].field + '"]');
    var message = document.getElementById(errors[i].field + "-error");
    if (field) {
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", errors[i].field + "-error");
    }
    if (message) {
      message.textContent = errors[i].message;
    }
  }
  if (errors.length) {
    var first = form.querySelector('[name="' + errors[0].field + '"]');
    if (first) {
      first.focus();
    }
  }
}

/** FUNCTION: clearFieldErrors(form) - removes all error messages and marks. */
function clearFieldErrors(form) {
  var invalid = form.querySelectorAll("[aria-invalid]");
  for (var i = 0; i < invalid.length; i++) {
    invalid[i].removeAttribute("aria-invalid");
    invalid[i].removeAttribute("aria-describedby");
  }
  var messages = form.querySelectorAll(".field-error");
  for (var m = 0; m < messages.length; m++) {
    messages[m].textContent = "";
  }
}

/**
 * FUNCTION: postJson(url, data)
 * PURPOSE: Sends data as JSON. Resolves only on HTTP 2xx; otherwise
 *   rejects, so callers can never mistake a failure for success.
 */
function postJson(url, data) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(data)
  }).then(function (response) {
    if (!response.ok) {
      throw new Error("Server answered " + response.status);
    }
    return response;
  });
}

/* ============================================================
 * B. INQUIRY / TEST-DRIVE FORM (contact.html)
 * ============================================================ */

/**
 * FUNCTION: trackTestDriveFormOpened(entryPoint)
 *
 * PURPOSE: Records that the form is being used for a test-drive request.
 * TRIGGER: contact.html opens with ?type=test_drive (Book Test Drive
 *   button) -> entry_point "book_test_drive_button"; or the visitor
 *   switches Inquiry type to "Test drive" -> "inquiry_type_select".
 * EXPECTED WEBSITE RESULT: the date field is shown and required.
 * EXPECTED ANALYTICS EVENT: test_drive_form_opened
 * EVENT PARAMETERS: vehicle_id (or "none"), entry_point.
 * EVENT COUNT: at most ONCE per page load (switching back and forth does
 *   not resend it). PAGE VIEWS: unchanged by this event.
 * ENGAGEMENT: none directly. It is NOT a lead.
 * HOW TO VERIFY: click Book Test Drive on a vehicle page: one event.
 * FAILURE CONDITIONS: form missing -> no event.
 * DOUBLE COUNTING RISK: guarded by trackEventOncePerPage().
 */
function trackTestDriveFormOpened(entryPoint) {
  var form = document.getElementById("inquiry-form");
  if (!form) {
    return;
  }
  trackEventOncePerPage("test_drive_form_opened", "test_drive_form_opened", {
    vehicle_id: form.elements.vehicle.value || "none",
    entry_point: entryPoint
  });
}

/**
 * FUNCTION: handleInquiryTypeChange()
 * PURPOSE: Shows the test-drive date field only for "Test drive" and
 *   updates the heading. EXPECTED ANALYTICS EFFECT: test_drive_form_opened
 *   (once per page) when "Test drive" is chosen; otherwise none.
 */
function handleInquiryTypeChange() {
  var form = document.getElementById("inquiry-form");
  var isTestDrive = form.elements.inquiryType.value === "test_drive";
  document.getElementById("date-field").hidden = !isTestDrive;
  form.elements.testDriveDate.required = isTestDrive;
  document.getElementById("inquiry-title").textContent = isTestDrive ? "Book a test drive" : "Request information";
  if (isTestDrive) {
    trackTestDriveFormOpened("inquiry_type_select");
  }
}

/**
 * FUNCTION: validateInquiry(form)
 * PURPOSE: Checks every field. RETURNS: [{ field, message }] (empty = OK).
 * EXPECTED ANALYTICS EFFECT: None directly.
 */
function validateInquiry(form) {
  var errors = [];
  var digits = form.elements.phone.value.replace(/\D/g, "");
  var contactMethod = form.querySelector('[name="contactMethod"]:checked').value;
  var type = form.elements.inquiryType.value;
  var vehicle = getVehicleById(form.elements.vehicle.value);

  if (form.elements.fullName.value.trim().length < 2) { errors.push({ field: "fullName", message: FORM_MESSAGES.name }); }
  if (!isValidEmail(form.elements.email.value.trim())) { errors.push({ field: "email", message: FORM_MESSAGES.email }); }
  if (contactMethod === "phone" && digits.length < 7) {
    errors.push({ field: "phone", message: FORM_MESSAGES.phone });
  } else if (digits.length > 0 && digits.length < 7) {
    errors.push({ field: "phone", message: FORM_MESSAGES.phoneFormat });
  }
  if (!vehicle) { errors.push({ field: "vehicle", message: FORM_MESSAGES.vehicle }); }
  if (!type) { errors.push({ field: "inquiryType", message: FORM_MESSAGES.inquiryType }); }
  if (type === "test_drive") {
    if (vehicle && vehicle.announcedOnly) {
      errors.push({ field: "vehicle", message: FORM_MESSAGES.announced });
    }
    var date = form.elements.testDriveDate.value;
    if (!date || date < getTomorrowIso()) { errors.push({ field: "testDriveDate", message: FORM_MESSAGES.date }); }
  }
  if (type !== "test_drive" && form.elements.message.value.trim().length < 10) {
    errors.push({ field: "message", message: FORM_MESSAGES.message });
  }
  if (!form.elements.consent.checked) { errors.push({ field: "consent", message: FORM_MESSAGES.consent }); }
  return errors;
}

/**
 * FUNCTION: submitInquiry(event)
 *
 * PURPOSE: Validates and submits an information or test-drive request.
 * TRIGGER: "Send request" button (or Enter in a field).
 *
 * EXPECTED WEBSITE RESULT:
 * - Invalid: red messages under the wrong fields; focus on the first;
 *   nothing is sent.
 * - Valid, DEMO MODE (no endpoint): confirmation "Demo request recorded
 *   locally; not sent to a dealer..." and the form is cleared. Nothing is
 *   sent or stored.
 * - Valid, LIVE MODE: button shows "Sending...", JSON POST; 2xx ->
 *   confirmation; error -> message, form kept.
 *
 * EXPECTED ANALYTICS EVENT:
 * - Invalid: inquiry_validation_failed { inquiry_type, error_fields
 *   (field names, e.g. "email"), error_count }. NO lead event.
 * - Demo:    demo_lead_submitted { inquiry_type, vehicle_id,
 *   lead_mode "demo" }. NOT generate_lead.
 * - Live OK: generate_lead { inquiry_type, vehicle_id, lead_source
 *   "website_form" }.
 * - Live failure: no lead event.
 * Personal data (name, email, phone, message, date) is NEVER sent.
 *
 * EVENT COUNT: +1 of the matching event per submit attempt.
 * PAGE VIEWS: unchanged (no new page).
 * ENGAGEMENT RATE: if generate_lead is a key event (recommended), a real
 *   lead makes the session engaged. Demo events should NOT be key events.
 * HOW TO VERIFY: ANALYTICS_TEST_CASES.md Scenario 3.
 * FAILURE CONDITIONS: see above; the network error is logged to the
 *   console for developers, visitors see a plain message.
 * DOUBLE COUNTING RISK: the button is disabled while sending. Do not add
 *   a GTM "Form Submission" trigger for this form.
 */
function submitInquiry(event) {
  event.preventDefault();
  var form = event.target;
  var status = document.getElementById("inquiry-status");
  status.textContent = "";
  status.className = "form-status";
  clearFieldErrors(form);

  var type = form.elements.inquiryType.value || "none";
  var errors = validateInquiry(form);
  if (errors.length) {
    showFieldErrors(form, errors);
    trackAnalyticsEvent("inquiry_validation_failed", {
      inquiry_type: type,
      error_fields: errors.map(function (e) { return e.field; }).filter(function (f, i, a) { return a.indexOf(f) === i; }).join(","),
      error_count: errors.length
    });
    return;
  }

  var vehicleId = form.elements.vehicle.value;
  var endpoint = window.SITE_CONFIG.inquiryEndpoint;
  if (!endpoint) {
    status.textContent = FORM_MESSAGES.demoLead;
    status.className = "form-status form-status--demo";
    form.reset();
    form.elements.vehicle.value = vehicleId;
    handleInquiryTypeChange();
    status.focus();
    trackAnalyticsEvent("demo_lead_submitted", { inquiry_type: type, vehicle_id: vehicleId, lead_mode: "demo" });
    return;
  }

  var button = document.getElementById("inquiry-submit");
  button.disabled = true;
  button.textContent = "Sending...";
  postJson(endpoint, {
    fullName: form.elements.fullName.value.trim(),
    email: form.elements.email.value.trim(),
    phone: form.elements.phone.value.trim(),
    vehicleId: vehicleId,
    contactMethod: form.querySelector('[name="contactMethod"]:checked').value,
    inquiryType: type,
    testDriveDate: form.elements.testDriveDate.value || null,
    message: form.elements.message.value.trim()
  }).then(function () {
    status.textContent = FORM_MESSAGES.liveLead;
    status.className = "form-status form-status--ok";
    form.reset();
    handleInquiryTypeChange();
    trackAnalyticsEvent("generate_lead", { inquiry_type: type, vehicle_id: vehicleId, lead_source: "website_form" });
  }).catch(function (error) {
    console.error("[REDLINE forms] Inquiry failed:", error);
    status.textContent = FORM_MESSAGES.sendFailed;
    status.className = "form-status form-status--error";
  }).finally(function () {
    button.disabled = false;
    button.textContent = "Send request";
    status.focus();
  });
}

/**
 * FUNCTION: initInquiryForm()
 * PURPOSE: Fills the vehicle list, applies ?vehicle= and ?type=, sets the
 *   earliest date, connects the form.
 * EXPECTED ANALYTICS EFFECT: test_drive_form_opened once if the page was
 *   opened in test-drive mode.
 */
function initInquiryForm() {
  var form = document.getElementById("inquiry-form");
  if (!form) {
    return;
  }
  form.elements.vehicle.innerHTML = '<option value="">Choose a vehicle</option>' + window.VEHICLES.map(function (v) {
    return '<option value="' + v.id + '">' + escapeHtml(getVehicleName(v)) + (v.announcedOnly ? " (announced only)" : "") + "</option>";
  }).join("");
  form.elements.testDriveDate.min = getTomorrowIso();

  var vehicleId = getQueryParameter("vehicle");
  var type = getQueryParameter("type");
  if (getVehicleById(vehicleId)) {
    form.elements.vehicle.value = vehicleId;
  }
  if (type === "test_drive" || type === "information") {
    form.elements.inquiryType.value = type;
  }
  var isTestDrive = form.elements.inquiryType.value === "test_drive";
  document.getElementById("date-field").hidden = !isTestDrive;
  form.elements.testDriveDate.required = isTestDrive;
  document.getElementById("inquiry-title").textContent = isTestDrive ? "Book a test drive" : "Request information";
  if (isTestDrive) {
    trackTestDriveFormOpened("book_test_drive_button");
  }
  document.getElementById("demo-mode-note").hidden = Boolean(window.SITE_CONFIG.inquiryEndpoint);

  form.elements.inquiryType.addEventListener("change", handleInquiryTypeChange);
  form.addEventListener("submit", submitInquiry);
}

/* ============================================================
 * C. NEWSLETTER (index.html, "STAY IN TOUCH")
 * ============================================================ */

/**
 * FUNCTION: submitNewsletter(event)
 *
 * PURPOSE: Validates the email and subscribes (live) or explains that
 *   this is a demo.
 * TRIGGER: the red Subscribe button.
 * EXPECTED WEBSITE RESULT: invalid -> error under the field; demo ->
 *   "Demo only: you have NOT been subscribed..."; live 2xx -> thank-you.
 * EXPECTED ANALYTICS EVENT:
 *   - invalid: none
 *   - demo: demo_newsletter_submitted { newsletter_location "home_banner" }
 *   - live success: sign_up { method "newsletter" }
 *   - live failure: none
 *   The email address is never sent to analytics.
 * EVENT COUNT: +1 per valid submission. PAGE VIEWS: unchanged.
 * HOW TO VERIFY: Scenario 12 in ANALYTICS_TEST_CASES.md.
 * DOUBLE COUNTING RISK: button disabled while sending.
 */
function submitNewsletter(event) {
  event.preventDefault();
  var form = event.target;
  var status = document.getElementById("newsletter-status");
  clearFieldErrors(form);
  status.textContent = "";
  status.className = "form-status";
  var email = form.elements.newsletterEmail.value.trim();
  if (!isValidEmail(email)) {
    showFieldErrors(form, [{ field: "newsletterEmail", message: FORM_MESSAGES.newsletterInvalid }]);
    return;
  }
  var endpoint = window.SITE_CONFIG.newsletterEndpoint;
  if (!endpoint) {
    status.textContent = FORM_MESSAGES.newsletterDemo;
    status.className = "form-status form-status--demo";
    form.reset();
    trackAnalyticsEvent("demo_newsletter_submitted", { newsletter_location: "home_banner" });
    return;
  }
  var button = form.querySelector("button[type=submit]");
  button.disabled = true;
  postJson(endpoint, { email: email }).then(function () {
    status.textContent = FORM_MESSAGES.newsletterLive;
    status.className = "form-status form-status--ok";
    form.reset();
    trackAnalyticsEvent("sign_up", { method: "newsletter" });
  }).catch(function (error) {
    console.error("[REDLINE forms] Newsletter failed:", error);
    status.textContent = FORM_MESSAGES.newsletterFailed;
    status.className = "form-status form-status--error";
  }).finally(function () {
    button.disabled = false;
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initInquiryForm();
  var newsletter = document.getElementById("newsletter-form");
  if (newsletter) {
    newsletter.addEventListener("submit", submitNewsletter);
  }
});
