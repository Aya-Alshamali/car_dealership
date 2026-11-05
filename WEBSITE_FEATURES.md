# WEBSITE_FEATURES.md - Feature and Event Map

The plain-language guide to every feature of the REDLINE showroom. Update
both tables whenever a feature, button or event changes. Per-button detail
is in `BUTTON_GUIDE.md`; setup and testing in `ANALYTICS_GUIDE.md` and
`ANALYTICS_TEST_CASES.md`.

## 1. Features

| Feature / button | What it does | Where its code is located |
|---|---|---|
| Header navigation, logo, footer links | Open pages | HTML; `main.js` → `handleNavigationClick()` |
| Login | Demo notice (no sign-in) | `main.js` → `openPanel("login-panel")` |
| Account | Device-only counts + links | `main.js` → `openAccountPanel()` |
| Search | Live results, submit records a search | `filters.js` → `openSearchPanel()`, `handleSearchSubmit()` |
| Language selector | EN / DE / AR labels | `main.js` → `handleLanguageChange()` |
| Menu (hamburger) | Navigation panel | `main.js` → `openPanel("menu-panel")` |
| Hero 01-05 numbers, dots, arrows | Switch Roadster feature, photo, gauge | `main.js` → `selectHeroFeature()`, `stepHeroFeature()` |
| Explore the Roadster | Roadster vehicle page | HTML link |
| Explore Technology / Explore Interior | Explanation panels | `main.js` → `openContentPanel()` |
| Brands / Types tabs | Switch discovery tab | `filters.js` → `switchDiscoveryTab()` |
| Brand tile | Filter home grid by brand | `filters.js` → `filterVehiclesByBrand()` |
| Type chip | Add/remove a type (AND) | `filters.js` → `toggleVehicleType()` |
| Reset filters (home / inventory / empty state) | Clear filters | `filters.js` → `resetFilters()` |
| Inventory selects, name search | Filter, sort, search | `filters.js` → `handleInventoryControlChange()`, form submit |
| Explore Product / card image | Open vehicle page | `vehicles.js` → `handleVehicleSelect()` |
| Heart (Add to Favorites / Save) | Save / remove | `favorites.js` → `toggleFavorite()` |
| Compare button | Add / remove from comparison (max 3) | `comparison.js` → `toggleCompare()` |
| Compare tray, Compare (n) | Open comparison | `comparison.js` → `updateCompareUi()` |
| Remove (compare page / tray) | Remove one vehicle | `comparison.js` → `removeFromCompare()` |
| Gallery Exterior/Interior, thumbnails | Change photo | `vehicles.js` → `switchGalleryView()`, `selectGalleryImage()` |
| Enlarge / main photo | Enlarged viewer | `vehicles.js` → `openGalleryLightbox()` |
| Viewer arrows, Left/Right keys, Escape | Navigate / close | `vehicles.js` → `stepLightbox()`; `main.js` → `closePanel()` |
| Book Test Drive / Request Information | Open the form for this vehicle | HTML links set in `renderVehicleDetails()` |
| Inquiry form Send request | Validate + submit (demo/live) | `forms.js` → `submitInquiry()` |
| Inquiry type select | Show/hide test-drive date | `forms.js` → `handleInquiryTypeChange()` |
| Newsletter Subscribe | Validate + submit (demo/live) | `forms.js` → `submitNewsletter()` |
| Video thumbnail | Open player | `main.js` → `openVideoPlayer()`, `handleVideoPlay()` |
| Cookie Accept / Decline | Allow / refuse analytics | `analytics.js` → `handleConsentChoice()` |
| Hero 3D stage (mouse) | Stage turns toward the pointer, highlight follows | `motion.js` → `initHeroDepth()` |
| Hero feature transition | Light sweep, 3D panel swing, gauge count-up | `motion.js` → `playHeroFeatureMotion()` (called by `showHeroFeature()`) |
| Card 3D tilt + glare (mouse) | Tilt and light under the pointer | `motion.js` → `initCardTilt()` |
| Scroll reveal | Sections rise into place once | `motion.js` → `initScrollReveal()` + `[data-reveal]` in HTML |
| Gallery photo slides | Photos slide in from their side | `motion.js` → `playImageSwapAnimation()` (called by `selectGalleryImage()`) |
| Card → vehicle page photo morph | Cross-page View Transition | `motion.js` → `initPhotoMorph()` + `animations.css` section F |

## 2. Analytics events

All pushes go through `analytics.js`. GA4 receives them only after the GTM
setup. **No personal data** (names, emails, phones, messages, dates) is ever
included.

| Event | Trigger | Parameters | Sent from |
|---|---|---|---|
| `view_item_list` | Home, inventory or favorites page shows its list (once per load) | ecommerce: `item_list_id`, `item_list_name`, `items[]` | `vehicles.js` |
| `select_item` | Card image / Explore Product / search result clicked | ecommerce: `item_list_id`, `item_list_name`, `items[1]` | `vehicles.js` |
| `view_item` | Vehicle page opens | ecommerce: `items[1]` | `vehicles.js` |
| `brand_filter_selected` | Brand tile (home) or Brand select (inventory) | `brand_name`, `matching_vehicle_count`, `filter_location` | `filters.js` |
| `vehicle_type_selected` | Type chip (home); Body type / Powertrain / Category select (inventory) | `vehicle_type`, `filter_action`, `active_types` or `filter_name`, `matching_vehicle_count`, `filter_location` | `filters.js` |
| `filters_reset` | Reset with active filters | `filter_location`, `cleared_filter_count`, `matching_vehicle_count` | `filters.js` |
| `search` | Header search or inventory name search submitted | `search_term`, `result_count`, `search_location` | `filters.js` |
| `vehicle_favorited` / `vehicle_unfavorited` | Heart clicked | `vehicle_id`, `vehicle_name`, `vehicle_brand`, `favorite_location`, `favorites_count` | `favorites.js` |
| `vehicle_comparison_viewed` | compare.html shows 2+ vehicles (once per load) | `vehicle_ids`, `vehicle_count` | `comparison.js` |
| `test_drive_form_opened` | Form shown in test-drive mode (once per load) | `vehicle_id`, `entry_point` | `forms.js` |
| `inquiry_validation_failed` | Invalid inquiry submit | `inquiry_type`, `error_fields`, `error_count` | `forms.js` |
| `demo_lead_submitted` | Valid inquiry in demo mode (NOT a lead) | `inquiry_type`, `vehicle_id`, `lead_mode` | `forms.js` |
| `generate_lead` | Backend confirmed (2xx) only | `inquiry_type`, `vehicle_id`, `lead_source` | `forms.js` |
| `demo_newsletter_submitted` | Valid newsletter in demo mode (NOT a sign-up) | `newsletter_location` | `forms.js` |
| `sign_up` | Newsletter backend confirmed (2xx) only | `method` | `forms.js` |
| `vehicle_gallery_opened` | Enlarged viewer opened | `vehicle_id`, `image_view`, `image_index` | `vehicles.js` |
| `vehicle_image_selected` | A different photo shown | `vehicle_id`, `image_view`, `image_index`, `selection_method` | `vehicles.js` |
| `video_start` | Video frames start playing (once per opening) | `video_title`, `video_provider`, `video_url`, `video_current_time`, `video_duration`, `video_percent`, `visible` | `main.js` |
| `navigation_clicked` | Navigation links | `link_text`, `link_url`, `link_location` | `main.js` |
| `hero_feature_selected` | Different hero feature | `feature_number`, `feature_name`, `selection_method` | `main.js` |
| `content_panel_opened` | Explore Technology / Interior | `panel_name` | `main.js` |
| `language_selected` | Different language chosen | `language`, `previous_language` | `main.js` |

Deliberately **not tracked**: opening Login/Account/Menu/Search, switching
Brands/Types tabs, typing in search boxes, price range and sort changes,
adding/removing compare vehicles, closing panels, consent choice, and every
animation or 3D effect (hero tilt, card tilt, reveals, sweeps, count-ups,
gallery slides, page transitions).
`purchase` does not exist on this site.

## 3. Configuration locations

- IDs, consent, debug: `assets/js/config.js` → `SITE_CONFIG.analytics`
- GTM loader: `assets/js/analytics.js` → `loadGoogleTagManager()`
- GTM noscript: comment block right after `<body>` on every page
