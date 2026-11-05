# ANALYTICS_GUIDE.md - GTM and GA4 for the REDLINE Showroom

Everything here describes **expected** behaviour. Nothing in this file is a
measured GA4 result.

## 1. How tracking works

```
Visitor clicks the BMW brand tile
 → filterVehiclesByBrand("BMW")                      filters.js
 → trackAnalyticsEvent("brand_filter_selected", {...})   analytics.js
 → window.dataLayer.push({ event: "brand_filter_selected", brand_name: "BMW", ... })
 → GTM Custom Event trigger "brand_filter_selected" fires a GA4 Event tag
 → GA4 receives brand_filter_selected
```

- **GTM is the only integration.** GA4 lives inside GTM; the site never loads `gtag.js`, so GA4 cannot be installed twice.
- **Off by default.** With `GTM-XXXXXXX` in `config.js` nothing loads from Google. Pushes still happen and print in the console for learning.
- **Consent first.** With a real ID a cookie banner appears; GTM loads only after Accept.
- **No personal data.** No names, emails, phone numbers, messages or dates in any event. Item events carry vehicle data only and **no prices** (published, announced and sample prices would distort revenue-style metrics).
- **No purchases.** Browsing, saving, comparing and demo submissions are never reported as conversions. `generate_lead` and `sign_up` only after a configured backend answers HTTP 2xx.

## 2. Page views (no virtual page views)

The site is multi-page. **Each page load = one `page_view`**, sent by the GA4
Google tag in GTM (not by the site's code).

| Action | page_view? |
|---|---|
| Open index / inventory / vehicle / compare / favorites / contact / privacy | Yes, one per load |
| Brand tile, type chip, inventory filter, sort, reset | No (content changes in place) |
| Panels (search, login, account, menu, info), video, gallery viewer | No |
| Hero features, language switch | No |
| Clicking a card / link that opens another page | Yes, on the new page |

The site never calls `history.pushState`/`replaceState`, so GA4 Enhanced
Measurement "page changes based on browser history events" cannot add extra
page views.

## 3. Install GTM

1. <https://tagmanager.google.com> → create a **Web** container → copy `GTM-…`.
2. `assets/js/config.js` → `gtmContainerId: "GTM-AB12CD3"`.
3. On each page, in the **GTM NOSCRIPT SECTION** after `<body>`, replace the ID and remove the comment markers.
4. Do not paste Google's `<script>` snippet: `analytics.js` → `loadGoogleTagManager()` already contains it, gated by consent.

## 4. Configure GA4 inside GTM

1. GA4 property → Web data stream → copy the Measurement ID (`G-…`).
2. GTM → Tags → **Google tag**, Tag ID `G-…`, trigger **Initialization - All Pages** (sends `page_view`).
3. **Data Layer Variables** for custom parameters: `brand_name`, `matching_vehicle_count`, `filter_location`, `vehicle_type`, `filter_action`, `active_types`, `filter_name`, `cleared_filter_count`, `search_term`, `result_count`, `search_location`, `vehicle_id`, `vehicle_name`, `vehicle_brand`, `favorite_location`, `favorites_count`, `vehicle_ids`, `vehicle_count`, `entry_point`, `inquiry_type`, `error_fields`, `error_count`, `lead_mode`, `lead_source`, `newsletter_location`, `method`, `image_view`, `image_index`, `selection_method`, `video_title`, `video_provider`, `video_url`, `video_current_time`, `video_duration`, `video_percent`, `visible`, `link_text`, `link_url`, `link_location`, `feature_number`, `feature_name`, `panel_name`, `language`, `previous_language`.
4. **Item events** (`view_item_list`, `select_item`, `view_item`): one Custom Event trigger with regex `view_item_list|select_item|view_item`; a GA4 Event tag, Event Name `{{Event}}`, **More Settings → Ecommerce → Send Ecommerce data (Data Layer)**.
5. **Other events**: one Custom Event trigger + one GA4 Event tag per event name in section 5, mapping the parameters to the variables above.
6. **Submit → Publish.**
7. GA4 → Admin → Events: mark **`generate_lead`** (and `sign_up` if wanted) as **key events**. Do **not** mark `demo_lead_submitted`, `demo_newsletter_submitted`, favorites or comparisons as key events.
8. GA4 → Admin → Custom definitions: register parameters you want in reports (e.g. `brand_name`, `vehicle_type`, `vehicle_id`, `inquiry_type`).

## 5. Event reference

| Event | Fires when | Parameters | Count rule |
|---|---|---|---|
| `view_item_list` | home / inventory / favorites list first shown | `item_list_id`, `item_list_name`, `items[]` (id, name, brand, category = body type, category2 = powertrain, variant = model year, index) | once per page load per list; filtering never resends |
| `select_item` | card image, Explore Product, search result | list id/name, `items[1]` with index | one per click |
| `view_item` | vehicle.html loads | `items[1]` | once per load |
| `brand_filter_selected` | brand tile; inventory Brand select | `brand_name`, `matching_vehicle_count`, `filter_location` | one per real change; same brand → none |
| `vehicle_type_selected` | type chip; Body/Powertrain/Category select | `vehicle_type`, `filter_action` (added/removed), `active_types` or `filter_name`, `matching_vehicle_count`, `filter_location` | one per click/change |
| `filters_reset` | Reset with active filters | `filter_location`, `cleared_filter_count`, `matching_vehicle_count` | none if nothing active |
| `search` | search submitted (header or inventory) | `search_term`, `result_count`, `search_location` | per submit; typing → none |
| `vehicle_favorited` / `vehicle_unfavorited` | heart | `vehicle_id`, `vehicle_name`, `vehicle_brand`, `favorite_location`, `favorites_count` | one per click |
| `vehicle_comparison_viewed` | compare.html with 2-3 vehicles | `vehicle_ids` (comma list), `vehicle_count` | once per load; removing columns → none |
| `test_drive_form_opened` | form shown in test-drive mode | `vehicle_id`, `entry_point` | max once per page load |
| `inquiry_validation_failed` | invalid inquiry submit | `inquiry_type`, `error_fields` (field names), `error_count` | per failed attempt |
| `demo_lead_submitted` | valid inquiry, demo mode | `inquiry_type`, `vehicle_id`, `lead_mode` "demo" | per submit; **not a lead** |
| `generate_lead` | backend answered 2xx | `inquiry_type`, `vehicle_id`, `lead_source` | only confirmed acceptance |
| `demo_newsletter_submitted` | valid newsletter, demo mode | `newsletter_location` | **not a sign-up** |
| `sign_up` | newsletter backend answered 2xx | `method` "newsletter" | only confirmed subscription |
| `vehicle_gallery_opened` | Enlarge / main photo | `vehicle_id`, `image_view`, `image_index` | per opening |
| `vehicle_image_selected` | different photo shown | `vehicle_id`, `image_view`, `image_index`, `selection_method` (thumbnail, view_tab, lightbox_next, lightbox_prev, keyboard) | same photo → none |
| `video_start` | video frames start playing | `video_title`, `video_provider`, `video_url`, `video_current_time`, `video_duration`, `video_percent`, `visible` | once per opening; pause/resume → none |
| `navigation_clicked` | nav/footer/menu links | `link_text`, `link_url`, `link_location` | per click |
| `hero_feature_selected` | different hero feature | `feature_number`, `feature_name`, `selection_method` (number/dot/arrow) | active feature → none |
| `content_panel_opened` | Explore Technology / Interior | `panel_name` | per opening |
| `language_selected` | different language | `language`, `previous_language` | same language / page-load restore → none |

## 6. Expected results and metrics

| Action | Event count | page_view | Engagement time | Engagement rate |
|---|---|---|---|---|
| Brand tile | +1 `brand_filter_selected` | none | may grow as browsing continues | not guaranteed to change |
| Card → vehicle page | +1 `select_item`, +1 `view_item` | +1 | reading adds time | 2nd page view → session engaged |
| Compare page | +1 `vehicle_comparison_viewed` | +1 | likely grows | engaged (2+ pages) |
| Valid inquiry, demo | +1 `demo_lead_submitted` | none | — | unchanged unless wrongly marked as key event |
| Valid inquiry, live 2xx | +1 `generate_lead` | none | — | engaged if `generate_lead` is a key event |
| Video plays 30 s | +1 `video_start` | none | grows because of watching, not because of the event | 10 s+ session → engaged |

**What each metric measures.**
- **Event count**: how many times an event arrived.
- **Page views**: page loads.
- **Engagement time**: foreground time on the page, measured by GA4 itself.
- **Engagement rate**: engaged sessions ÷ sessions. A session counts as engaged after 10+ s, 2+ page views, or a key event.

A visitor can spend a long time exploring without converting. Many clicks do not by themselves show purchase intent.

## 7. GTM Preview

1. GTM → **Preview** → enter the site URL → Connect.
2. Accept the cookie banner in the site tab.
3. Act (e.g. click BMW). In Tag Assistant: event list on the left → click `brand_filter_selected` → **Tags fired** (your GA4 tag) and **Data Layer** (parameters).
4. Event present but no tag fired → trigger name mismatch. Event missing → check the console line; Preview may not be connected to that tab.

## 8. GA4 DebugView

GA4 → Admin → **DebugView**. With Preview active, events arrive within
seconds. Click one to see parameters and items. Standard reports update after
24-48 h; Realtime within a minute.

## 9. Common errors

| Symptom | Cause | Fix |
|---|---|---|
| "GTM not loaded: replace GTM-XXXXXXX" | placeholder ID | set the real ID |
| "waiting for consent" | banner not accepted | Accept, or `localStorage.removeItem("redline_analytics_consent")` |
| Event in Preview, not in GA4 | not published / wrong `G-` ID | publish; check the Google tag |
| `items` missing | "Send Ecommerce data" off | enable it on the item-event tag |
| `page_view` doubled | extra gtag.js added | keep GA4 only in GTM |
| Leads without real requests | someone mapped `demo_lead_submitted` to `generate_lead` | keep them separate |

## 10. Duplicate prevention

- Each event is pushed from exactly one function; search the JS for `trackAnalyticsEvent(`, `trackEcommerceEvent(`, `trackEventOncePerPage(`.
- Single delegated listeners; redraws never track.
- Guards: same brand / feature / photo / language → no event. `view_item_list`, `vehicle_comparison_viewed` and `test_drive_form_opened` are once per page load. `video_start` is once per opening.
- Typing never tracks; only submits do.
- **Animations never track.** `motion.js` sends no events. Hero tilt, card tilt, scroll reveals, gauge count-ups, gallery slides and page transitions are visual only. Cross-page View Transitions do not create extra page views: each page still loads once and sends one `page_view`.
- Do not add generic GTM **All Clicks / All Links / Form Submission** triggers that also send GA4 events for these controls.
- GA4 Enhanced Measurement **video** tracking covers YouTube only (no overlap). **Outbound clicks** (credit/social links) use the different event name `click`. **Site search** reads `?q=` URLs, which this site never uses.
