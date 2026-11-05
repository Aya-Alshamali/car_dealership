# BUTTON_GUIDE.md - Every Interactive Control

For each control: **purpose**, **JavaScript function**, **user action**,
**website response**, **analytics event**, and **how to verify**. "Event" is
what the website pushes to `window.dataLayer`; GA4 only receives it after
the GTM setup in `ANALYTICS_GUIDE.md`.

**Verification for every row:** console (F12) with `debugLogging: true`
shows `[REDLINE analytics] ...` lines; or GTM Preview → event list → Data
Layer tab; then GA4 Admin → DebugView.

## Motion and 3D (not buttons, but interactive)

| Interaction | Function (motion.js) | Visitor sees | Analytics event |
|---|---|---|---|
| Moving the mouse over the hero | `initHeroDepth` | stage turns toward the pointer in 3D, highlight moves | none |
| Moving the mouse over a vehicle card | `initCardTilt` | card tilts up to 5°, glare follows, deeper shadow | none |
| Scrolling | `initScrollReveal` | sections rise into place once | none (GA4's own Enhanced Measurement `scroll` event at 90% is unrelated) |
| Clicking a card | `initPhotoMorph` | card photo grows into the vehicle page photo (supporting browsers) | none extra: `select_item` / `view_item` as before |

Verify: the event counts in GTM Preview must be identical with `MOTION.enabled = false`.

## Header (all pages)

| Button | Purpose | Function (file) | User action | Website response | Analytics event | Verify |
|---|---|---|---|---|---|---|
| Logo | Home | `handleNavigationClick` (main.js) | click | index.html | `navigation_clicked` {link_text "Logo", link_location "header"} | 1 event, then the new page's page_view |
| Home / Inventory / Compare / Favorites / Contact | Navigate | `handleNavigationClick` | click | page opens; counts show saved/compared vehicles | `navigation_clicked` | as above |
| Login | Explain sign-in | `openPanel("login-panel")` (main.js) | click | side panel: no sign-in in this demo; link to favorites | none | nothing new in Preview |
| Account | Device summary | `openAccountPanel` (main.js) | click | saved / compared counts + links | none (links send `navigation_clicked`, location "account_panel") | |
| Search | Find vehicles | `openSearchPanel` (filters.js) | click | top panel, cursor in box, suggestions BMW / Audi / Electric / SUV / Roadster | none on open | |
| Search box (typing) | Live preview | input listener (filters.js) | type | results update | **none** | typing adds no events |
| Search button / Enter / suggestion | Run search | `handleSearchSubmit` (filters.js) | submit | result links | `search` {search_term, result_count, search_location "header"} | "electric" → result_count 2 |
| Search result | Open vehicle | `handleVehicleSelect` (vehicles.js) | click | vehicle page | `select_item` (list "search_results"), then `view_item` | |
| Language (EN/DE/AR) | Interface language | `handleLanguageChange` (main.js) | choose | labels translate; saved for next visit | `language_selected` {language, previous_language}; same language → none | |
| Menu | Navigation panel | `openPanel("menu-panel")` | click | panel with all pages (and Login/Account on phones) | none; links send `navigation_clicked` (menu_panel) | |
| Close (X), dark backdrop, Escape | Close panel | `closePanel` (main.js) | click / key | panel closes, focus returns, video pauses | none | |

## Home - hero

| Button | Purpose | Function | User action | Website response | Analytics event | Verify |
|---|---|---|---|---|---|---|
| 01-05 numbers (left) | Choose feature | `selectHeroFeature(i, "number")` (main.js) | click | info text, stats, photo, gauge change | `hero_feature_selected` {feature_number, feature_name, selection_method "number"}; active one → none | click 03: feature_name "Acceleration" |
| Dots (right) | Choose feature | `selectHeroFeature(i, "dot")` | click | same | same, method "dot" | |
| ‹ / › arrows | Previous / next feature | `stepHeroFeature(±1)` | click | wraps 05 → 01 | same, method "arrow" | |
| Explore the Roadster | Roadster page | link | click | vehicle.html?id=tesla-roadster | `navigation_clicked` (hero), then `view_item` | |
| Photo credit links | Licence/source | links | click | new tab | none (GA4 outbound `click` if Enhanced Measurement on) | |

## Home - panels, discovery, collection, newsletter

| Button | Purpose | Function | User action | Website response | Analytics event | Verify |
|---|---|---|---|---|---|---|
| Explore Technology | Explanations | `openContentPanel("technology")` (main.js) | click | side panel, 4 sections, link "Browse sports cars" | `content_panel_opened` {panel_name "technology"} | |
| Explore Interior | Explanations | `openContentPanel("interior")` | click | side panel, link "Browse luxury models" | `content_panel_opened` {panel_name "interior"} | |
| Brands / Types tabs | Switch tab | `switchDiscoveryTab` (filters.js) | click / ←→ | panel switches | none | |
| Brand tile | Filter by brand | `filterVehiclesByBrand` (filters.js) | click | grid + count update, tile active | `brand_filter_selected` {brand_name, matching_vehicle_count, filter_location "home_brand_grid"}; same brand again → none | BMW → count 1 |
| Type chip | Add/remove type | `toggleVehicleType` (filters.js) | click | grid + count; chips combine with AND | `vehicle_type_selected` {vehicle_type, filter_action, active_types, matching_vehicle_count} | Electric + Sports Car → 2 vehicles |
| Reset filters / empty-state Reset | Clear | `resetFilters("home")` | click | all 10 vehicles | `filters_reset` {filter_location "home", cleared_filter_count}; nothing active → none | |
| View full inventory | Inventory with same filters | link | click | inventory.html?brand=...&type=... (applied silently) | `navigation_clicked` (home_collection); inventory sends `view_item_list` | |
| Card image / Explore Product | Vehicle page | `handleVehicleSelect` (vehicles.js) | click | vehicle page | `select_item` {list, item, index}, then `view_item` | |
| Heart | Save / remove | `toggleFavorite` (favorites.js) | click | heart fills, header count, toast | `vehicle_favorited` / `vehicle_unfavorited` {vehicle_id, vehicle_name, vehicle_brand, favorite_location, favorites_count} | click twice → one of each |
| Compare (⇅) | Add/remove comparison | `toggleCompare` (comparison.js) | click | button active, tray appears; 4th → "You can compare up to 3 vehicles. Remove one first." | none | tray shows max 3 |
| Email + Subscribe | Newsletter | `submitNewsletter` (forms.js) | submit | invalid → error; demo → "Demo only: you have NOT been subscribed..."; live 2xx → thank-you | demo: `demo_newsletter_submitted`; live success: `sign_up` {method "newsletter"}; invalid/failure: none | |
| Video thumbnail (▶) | Watch video | `openVideoPlayer` (main.js) | click | dialog plays video with native controls | `video_start` when frames start, once per opening | pause/resume → no new event |

## Inventory (inventory.html)

| Control | Function (filters.js) | Website response | Analytics event |
|---|---|---|---|
| Search by name (typing) | `handleInventoryControlChange` | grid filters live | none |
| Search button / Enter | form submit | same + count | `search` {search_term, result_count, search_location "inventory"} |
| Brand | `handleInventoryControlChange` | grid + count | `brand_filter_selected` {brand_name or "All", filter_location "inventory"} |
| Body type / Powertrain / Category | same | grid + count | `vehicle_type_selected` {vehicle_type, filter_name, filter_action, matching_vehicle_count} |
| Price range, Sort by | same | grid filtered / reordered | none (documented choice) |
| Reset filters / empty-state Reset | `resetFilters("inventory")` | all controls cleared | `filters_reset` (only if something was set) |
| Cards, hearts, compare | as on home | as on home | as on home (list "inventory") |

## Vehicle page (vehicle.html?id=...)

| Control | Function (file) | Website response | Analytics event |
|---|---|---|---|
| ‹ Back to inventory | link | inventory | `navigation_clicked` (vehicle_page) |
| Exterior / Interior tabs | `switchGalleryView` (vehicles.js) | first photo of that view; Interior disabled when no licensed photo | `vehicle_image_selected` {selection_method "view_tab"} |
| Thumbnail | `selectGalleryImage(i, "thumbnail")` | main photo + credit | `vehicle_image_selected` {vehicle_id, image_view, image_index}; current photo → none |
| Main photo / Enlarge | `openGalleryLightbox` | full-screen viewer | `vehicle_gallery_opened` {vehicle_id, image_view, image_index} |
| Viewer ‹ › and Left/Right keys | `stepLightbox` | previous/next photo | `vehicle_image_selected` (lightbox_prev / lightbox_next / keyboard) |
| Viewer X / Escape | `closePanel` | closes, focus returns | none |
| Book Test Drive | link | contact.html?vehicle=id&type=test_drive | contact page sends `test_drive_form_opened` |
| Request Information | link | contact.html?vehicle=id&type=information | none |
| Save to Favorites | `toggleFavorite` | label "Saved" | `vehicle_favorited` / `vehicle_unfavorited` (favorite_location "vehicle_page") |
| Compare | `toggleCompare` | label "In comparison", tray | none |
| Source / credit links | links | new tab | none |
Page load: one `view_item`. Unknown id: "Vehicle not found", no event.

## Compare (compare.html)

| Control | Function (comparison.js) | Website response | Analytics event |
|---|---|---|---|
| (page load with 2-3 vehicles) | `renderComparisonPage` | table | `vehicle_comparison_viewed` {vehicle_ids, vehicle_count} once |
| Remove (column) | `removeFromCompare` | column disappears; <2 → message | none |
| Vehicle name link | link | vehicle page | `view_item` there |
| Back to catalogue / Choose vehicles | link | inventory | `navigation_clicked` (compare_page) |
| Tray × / Compare (n) | `removeFromCompare` / link | tray updates / compare page; <2 → message | none / comparison event on the next page |

## Favorites (favorites.html)

| Control | Function | Website response | Analytics event |
|---|---|---|---|
| (page load with saved vehicles) | `renderFavoritesPage` (favorites.js) | grid | `view_item_list` {list "favorites"} once |
| Heart on a card | `toggleFavorite` | card removed; empty state when none | `vehicle_unfavorited` (favorite_location "favorites_page") |
| Browse inventory | link | inventory | `navigation_clicked` |

## Contact / test drive (contact.html)

| Control | Function (forms.js) | Website response | Analytics event |
|---|---|---|---|
| (page load with ?type=test_drive) | `initInquiryForm` | "Book a test drive", date field shown | `test_drive_form_opened` {vehicle_id, entry_point "book_test_drive_button"} once |
| Inquiry type → Test drive | `handleInquiryTypeChange` | date field shown + required | `test_drive_form_opened` (entry_point "inquiry_type_select"), max once per page |
| Preferred contact Email / Phone | radio | phone becomes required for Phone | none |
| Send request (invalid) | `submitInquiry` | messages under fields, focus first error | `inquiry_validation_failed` {error_fields, error_count} - no lead |
| Send request (valid, demo) | `submitInquiry` | "Demo request recorded locally; not sent to a dealer..." | `demo_lead_submitted` - NOT `generate_lead` |
| Send request (valid, live) | `submitInquiry` → `postJson` | "Sending..." → thank-you, or error message | `generate_lead` only on 2xx; nothing on failure |
| Phone / email links | `tel:` / `mailto:` | call / mail app | none |

## Cookie banner (only with a real GTM ID)

| Button | Function (analytics.js) | Response | Analytics |
|---|---|---|---|
| Accept | `handleConsentChoice("granted")` | banner closes, choice saved | GTM loads; GA4 tag sends page_view |
| Decline | `handleConsentChoice("denied")` | banner closes | nothing is ever sent |
