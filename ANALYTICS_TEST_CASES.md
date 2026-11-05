# ANALYTICS_TEST_CASES.md - End-to-End Analytics Scenarios

How to run any scenario:
1. Open the site (local server or GitHub Pages).
2. To verify GA4, configure GTM + GA4 (`ANALYTICS_GUIDE.md`), open **GTM Preview**, and accept the cookie banner.
3. Clear earlier state when the scenario says "fresh": DevTools → Application → Local Storage → Clear.
4. Perform the actions and compare against the expectations.
5. Confirm in **GA4 DebugView**.

**GTM events** are the dataLayer pushes shown in Tag Assistant.
**GA4 events** are the same names once tags forward them.
`page_view` comes from the GA4 Google tag on every page load. `view_item_list` on page load is listed where the starting page shows a list.

---

### Scenario 1: Customer finds a BMW
- **Goal:** find a BMW sports vehicle. **Start:** `index.html` (fresh).
- **Actions:** scroll to SELECT YOUR CAR BY → click **BMW** → review the grid → click **Explore Product** on BMW M8 Competition Coupe.
- **Website:** grid shows 1 vehicle, "1 vehicle matches", BMW tile active; then the BMW vehicle page.
- **GTM / GA4 events:** `brand_filter_selected` ×1 {brand_name "BMW", matching_vehicle_count 1, filter_location "home_brand_grid"}; `select_item` ×1 {item_list_id "showroom_collection", items[0].item_id "bmw-m8-competition"}; `view_item` ×1 {items[0].item_id "bmw-m8-competition"}. (Plus `view_item_list` ×1 on homepage load.)
- **page_view:** homepage 1; vehicle page +1; brand filtering 0.
- **Failure conditions:** two `brand_filter_selected` for one click; a page_view on filtering.
- **Verify:** Preview event list + Data Layer tab; DebugView parameters.

### Scenario 2: Customer compares two vehicles
- **Goal:** compare an Audi and a BMW. **Start:** `inventory.html` (fresh).
- **Actions:** click **Compare** on Audi R8 V10 performance quattro → click **Compare** on BMW M8 Competition Coupe → click **Compare (2)** in the tray.
- **Website:** tray lists both; compare.html shows 2 columns with all rows; missing values "Not available".
- **Events:** `vehicle_comparison_viewed` ×1 {vehicle_ids "audi-r8-v10-performance,bmw-m8-competition", vehicle_count 2}. Adding to comparison sends nothing (by design). (Plus `view_item_list` ×1 on inventory load.)
- **page_view:** inventory 1, compare 1.
- **Failure conditions:** comparison event without both IDs; extra event after removing a column.
- **Verify:** Data Layer tab shows both IDs.

### Scenario 3: Customer requests a test drive
- **Goal:** test drive a Mercedes-Benz. **Start:** `vehicle.html?id=mercedes-benz-s-580`.
- **Actions:** **Book Test Drive** → fill name, email `test@`, date ≥ tomorrow, tick consent → **Send request** → fix email to `test@example.com` → **Send request**.
- **Website:** title "Book a test drive", date field shown; first submit shows "Please enter a valid email address..." with focus on Email; second shows the demo confirmation and clears the form.
- **Events:** `view_item` ×1 (vehicle page); `test_drive_form_opened` ×1 {vehicle_id "mercedes-benz-s-580", entry_point "book_test_drive_button"}; `inquiry_validation_failed` ×1 {error_fields "email", error_count 1}; **demo mode:** `demo_lead_submitted` ×1 {inquiry_type "test_drive", lead_mode "demo"} and **`generate_lead` ×0**; **live backend (2xx):** `generate_lead` ×1 instead of the demo event.
- **page_view:** vehicle 1, contact 1.
- **Failure conditions:** any `generate_lead` in demo mode or after the invalid submit; name/email visible in any event.
- **Verify:** Preview Data Layer for absence of personal data.

### Scenario 4: Customer changes their mind
- **Goal:** explore without inquiring. **Start:** `index.html` (fresh).
- **Actions:** Types tab → **Electric** → open Porsche Taycan Turbo S → browser Back → Types tab → **Sports Car** → heart on a vehicle → close the tab.
- **Website:** filters work; the saved vehicle stays in favorites (visible on the next visit).
- **Events:** `vehicle_type_selected` {Electric, added}; `select_item` + `view_item` (Taycan); after Back the page reloads (new `view_item_list`, filters reset). `vehicle_type_selected` {Sports Car, added}; `vehicle_favorited` ×1.
- **page_view:** home, vehicle, home again = 3.
- **Failure conditions:** any `generate_lead`, `sign_up`, `demo_lead_submitted` or purchase-like event.
- **Verify:** event list contains no conversion events.

### Scenario 5: User repeats the same action
- **Goal:** check for double counting. **Start:** `index.html`.
- **Actions:** click **Audi** → wait → click **Audi** again.
- **Website:** second click changes nothing.
- **Events:** `brand_filter_selected` ×1. **Decision:** a repeat selection with no state change is ignored (no event). Re-rendering never sends events.
- **page_view:** 0 additional.
- **Failure conditions:** a second `brand_filter_selected`.

### Scenario 6: Electric sports car journey (the brief's example)
- **Start:** `index.html`. **Actions:** Types → **Electric** → **Sports Car** → open Tesla Roadster → **Compare** → back to inventory → **Compare** on Porsche Taycan Turbo S → **Compare (2)** → heart on the Taycan.
- **Website:** 2 matches (Taycan, Roadster); Roadster page says "Announced vehicle"; comparison shows announced vs reported values with status badges.
- **Events:** `vehicle_type_selected` ×2 (second has active_types "Electric,Sports Car", matching_vehicle_count 2); `select_item`, `view_item` (Roadster); `vehicle_comparison_viewed` ×1 (2 IDs); `vehicle_favorited` ×1.
- **page_view:** home, vehicle, inventory, compare = 4.
- **Failure conditions:** sports cars that are not electric in the grid.

### Scenario 7: Comparison limit
- **Start:** `inventory.html`. **Actions:** click Compare on 4 different vehicles.
- **Website:** after 3, the 4th shows "You can compare up to 3 vehicles. Remove one first." and is not added.
- **Events:** none. **page_view:** 0 additional. **Failure:** 4 IDs stored or shown.

### Scenario 8: Gallery exploration
- **Start:** `vehicle.html?id=bmw-m8-competition`. **Actions:** 2nd thumbnail → 2nd thumbnail again → Interior tab → Enlarge → Exterior tab → Right arrow key → viewer › → Escape.
- **Events:** `view_item` ×1; `vehicle_image_selected` ×5 (thumbnail; view_tab interior; view_tab exterior; keyboard; lightbox_next); `vehicle_gallery_opened` ×1. Repeat thumbnail → 0.
- **page_view:** 0 additional. **Failure:** a page_view or second `view_item`.

### Scenario 9: Header search
- **Start:** any page. **Actions:** Search → type "electric" (pause) → Enter → replace the text with "Roadster" → Enter → click the result.
- **Events:** typing ×0; `search` {search_term "electric", result_count 2, search_location "header"}; `search` {search_term "roadster", result_count 1}; `select_item` (list "search_results"); `view_item`.
- **page_view:** +1 for the vehicle page only.
- **Failure:** events while typing.

### Scenario 10: Inventory filters and reset
- **Start:** `inventory.html`. **Actions:** Brand = Lamborghini → Body type = SUV → Sort = price high-low → Price ≤ $250,000 → Reset filters.
- **Events:** `view_item_list` ×1 (load); `brand_filter_selected` {Lamborghini, 2}; `vehicle_type_selected` {SUV, body_type, 1}; sort & price ×0; `filters_reset` {cleared_filter_count 4}.
- **page_view:** 0 additional. **Failure:** `view_item_list` resent on filtering.

### Scenario 11: Empty results
- **Start:** `index.html`. **Actions:** Types → Electric → SUV → empty-state **Reset filters**.
- **Website:** "No vehicle in the demo catalogue matches all selected filters" + Reset; then all 10.
- **Events:** `vehicle_type_selected` ×2 (second matching_vehicle_count 0); `filters_reset` {cleared_filter_count 2}.

### Scenario 12: Newsletter
- **Start:** `index.html#newsletter`. **Actions:** submit "bad" → submit "a@b.co".
- **Website:** error message; then "Demo only: you have NOT been subscribed...".
- **Events:** invalid ×0; `demo_newsletter_submitted` ×1; **`sign_up` ×0 in demo**. With a live endpoint answering 2xx: `sign_up` {method "newsletter"} ×1 instead.
- **Failure:** `sign_up` in demo mode, or the email in any event.

### Scenario 13: Automotive video
- **Start:** `index.html`. **Actions:** click the video thumbnail → let it play → pause → play → Escape → reopen.
- **Events:** `video_start` ×1 for the first opening (pause/resume ×0) and ×1 for the reopening = 2.
- **Website:** dialog with native controls; closing pauses the video.
- **Failure:** `video_start` on pause/resume, or when the video failed to load.

### Scenario 14: Hero feature exploration
- **Start:** `index.html`. **Actions:** click 03 → 03 again → › arrow → dot 02.
- **Events:** `hero_feature_selected` ×3 (Acceleration/number, Speed/arrow, Autonomous & Driver Assistance/dot).
- **Website:** 02 shows "Specification not verified".
- **Failure:** event on the repeated 03; any page_view.

### Scenario 15: Language switch
- **Start:** any page. **Actions:** choose DE → reload → choose DE again → choose EN.
- **Events:** `language_selected` {de, previous en} ×1; reload restore ×0; DE again ×0; `language_selected` {en, previous de} ×1.

### Scenario 16: Favorites management
- **Start:** `favorites.html` with 2 saved vehicles. **Actions:** remove both with the hearts.
- **Events:** `view_item_list` {list "favorites", 2 items} ×1; `vehicle_unfavorited` ×2 (favorite_location "favorites_page").
- **Website:** empty state "You have not saved any vehicles yet."

### Scenario 17: Test drive for an announced vehicle
- **Start:** `vehicle.html?id=tesla-roadster`. **Actions:** Book Test Drive → fill valid details → Send request.
- **Website:** "This vehicle is announced only and not in production, so a test drive cannot be requested."
- **Events:** `test_drive_form_opened` ×1; `inquiry_validation_failed` {error_fields "vehicle"}; leads ×0.

### Scenario 18: Analytics not configured / consent declined
- **Start:** site with placeholder ID, then with a real ID and **Decline**.
- **Website:** everything works in both cases.
- **Events:** placeholder: pushes appear in the console only, no `gtm.js` request. Declined: no `gtm.js` request, nothing reaches GA4.
- **Failure:** any request to googletagmanager.com after Decline.

### Scenario 19: Live backend failure
- **Start:** `contact.html` with `inquiryEndpoint` set to an address that returns an error.
- **Actions:** submit a valid information request.
- **Website:** "Sorry, your request could not be sent..." and the form stays filled.
- **Events:** `generate_lead` ×0, `demo_lead_submitted` ×0.

---

## Expected vs. actual results

"Website dataLayer (local)" = what the site pushed in a local Chromium test on
2026-11-05 (no GTM container connected). "Actual GA4" is what GA4 received:
**not tested**, because no GA4 property is connected. Do not fill it in
without a real DebugView check.

| Test | Expected | Website dataLayer (local, 2026-11-05) | Actual GA4 | Result |
|---|---|---|---|---|
| BMW brand filter | 1 filter event | 1 `brand_filter_selected`, brand_name BMW, count 1 | Not tested | Pending GA4 |
| Same brand again | 0 additional | 0 | Not tested | Pending GA4 |
| Vehicle details | 1 item view | 1 `view_item` | Not tested | Pending GA4 |
| Card selected | 1 select_item | 1 `select_item` with list + index | Not tested | Pending GA4 |
| Comparison opened | 1 comparison event | 1 `vehicle_comparison_viewed` with both IDs; 0 after removing a column | Not tested | Pending GA4 |
| Compare limit | 4th refused | 3 IDs stored, message shown | n/a | Website passed |
| Electric + Sports Car | 2 type events, 2 matches | 2 events; Taycan + Roadster | Not tested | Pending GA4 |
| Invalid inquiry | 0 successful leads | 1 `inquiry_validation_failed`, 0 leads | Not tested | Pending GA4 |
| Demo inquiry | 0 `generate_lead` | 1 `demo_lead_submitted`, 0 `generate_lead` | Not tested | Pending GA4 |
| Successful real inquiry | 1 lead event | 1 `generate_lead` with a simulated 2xx response (no real backend) | Not tested | Pending real backend + GA4 |
| Backend failure | 0 leads | 0 leads, error message | Not tested | Pending GA4 |
| Newsletter demo | 0 `sign_up` | 1 `demo_newsletter_submitted`, 0 `sign_up` | Not tested | Pending GA4 |
| Video | 1 start per opening | 1 `video_start`; pause/resume 0 | Not tested | Pending GA4 |
| Gallery | events per real change | thumbnail/view_tab/keyboard/lightbox events; repeat 0 | Not tested | Pending GA4 |
| Search | typing 0, submit 1 | typing 0; `search` result_count 2 for "electric" | Not tested | Pending GA4 |
| Personal data | none in events | none found in dataLayer | Not tested | Website passed |
