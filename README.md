# REDLINE Auto Showroom - demonstration website

A premium, red-and-black automotive showroom built with plain **HTML5, CSS3
and vanilla JavaScript** (no frameworks, no build step). It combines a
futuristic Tesla Roadster hero with a working catalogue, filters, comparison,
favorites, detailed vehicle pages, an inquiry/test-drive form, a newsletter
and a video, all instrumented for **Google Tag Manager + GA4**.

> **Independent educational demo.** Not a dealer, not affiliated with Tesla,
> Mercedes-Benz, Bentley, Jaguar, Audi, Aston Martin, BMW, Lamborghini or
> Porsche. **No vehicle is for sale.** No reference screenshot was supplied
> with the brief, so the layout follows the written specification.

## 1. Run it locally

```bash
cd car_dealership
python3 -m http.server 8100
```

Open <http://localhost:8100>. After editing files, hard-refresh
(Cmd+Shift+R / Ctrl+F5): the simple Python server lets the browser cache files.

## 2. Project structure

```text
car_dealership/
├── index.html        Home: Roadster hero (01-05), performance panels, SELECT YOUR CAR BY, collection grid, STAY IN TOUCH + video
├── inventory.html    Catalogue with brand / body / powertrain / category / price filters, sort, name search, reset
├── vehicle.html      Vehicle details (?id=...): gallery + enlarged viewer, sourced specs, favorites, compare, inquiry links
├── compare.html      Side-by-side comparison of 2-3 vehicles (?ids=a,b,c also works)
├── favorites.html    Saved vehicles (IDs stored in this browser)
├── contact.html      Inquiry / test-drive form (?vehicle=...&type=test_drive|information)
├── privacy.html      Privacy policy + #terms
├── assets/
│   ├── css/  style.css (looks) · animations.css (motion, 3D, page transitions, reduced motion) · responsive.css (tablet/phone)
│   ├── js/   config.js · analytics.js · main.js · vehicles.js · favorites.js · comparison.js · filters.js · forms.js · motion.js
│   └── images/logo.svg
├── README.md                  this file
├── WEBSITE_FEATURES.md        feature map + event map (the website guide)
├── BUTTON_GUIDE.md            every control: function, response, event, verification
├── ANALYTICS_GUIDE.md         GTM/GA4 setup, event reference, page views, troubleshooting
└── ANALYTICS_TEST_CASES.md    19 end-to-end test scenarios + expected-vs-actual table
```

Load order on every page: `config.js`, `analytics.js` (in `<head>`), then
`main.js`, `vehicles.js`, `favorites.js`, `comparison.js`, `filters.js`,
`forms.js`, `motion.js`. Every file opens with a comment block: purpose, sections,
features, dependencies, how to modify it, and its GA4/GTM location.

## 3. Features

- **Header**: sticky; Home/Inventory/Compare/Favorites/Contact with live counts; Login (demo notice, no password fields), Account (device-only summary), Search panel, language selector (EN/DE/AR interface labels), Menu panel. Collapses to the Menu panel on small screens.
- **Hero**: oversized ROADSTER type, framed red Roadster photo, technical lines, numbered indicators (left) and dots (right), previous/next arrows, an SVG curved dashboard whose gauge follows the selected feature, and an info panel for 01 Performance, 02 Autonomy & Driver Assistance, 03 Acceleration, 04 Speed, 05 Battery & Range. Every figure is labelled **Announced target**; 02 shows **Specification not verified**.
- **Performance panels**: "Built for Performance" and "Smart. Intuitive. Futuristic." open side panels with general explanations and links into the filtered inventory.
- **SELECT YOUR CAR BY**: accessible Brands/Types tabs. Brands: 8 text-based marks (no logo licence held). Types: SUV, Sedan, Coupe, Sports Car, Electric, Hybrid, Luxury, combinable (Electric + Sports Car = electric sports cars). The grid, count and empty state update without reloading; "View full inventory" carries the filters over.
- **Inventory**: brand, body type, powertrain, category, price range, sort (price, model year, name), name search, reset, result count, empty state with reset.
- **Vehicle page**: status banner, gallery with Exterior/Interior views, thumbnails, enlarged viewer (arrows, Left/Right keys, Escape), specification table with a status per value, price label, Book Test Drive, Request Information, Save, Compare, specification sources and photo credits.
- **Compare**: up to 3 vehicles (4th refused with a message), floating tray, side-by-side table, "Not available" for missing values, Remove per column.
- **Favorites**: heart on every card and vehicle page, header count, favorites page with empty state; vehicle IDs only in localStorage.
- **Inquiry / test drive**: validation with accessible messages, test-drive date only for test drives (from tomorrow), phone required only when phone contact is chosen, announced vehicles cannot be test-driven, demo confirmation "Demo request recorded locally; not sent to a dealer".
- **Newsletter + video**: email validation, honest demo message; accessible HTML5 video dialog (CC BY 3.0 race-track video).
- **Motion and 3D** (`motion.js` + `animations.css`, see section 3a).
- **Accessibility**: skip link, labelled controls, `aria-pressed`/`aria-selected`/`aria-expanded`, live regions, focus management, Escape closes every panel, visible focus, alt text, reduced-motion support.

## 3a. Motion and 3D details

Built with CSS 3D transforms, the Web Animations API and View Transitions.
There are no libraries and no WebGL. Every effect has a stated purpose, and
effects people see often are kept subtle.

| Effect | Where | Purpose | How |
|---|---|---|---|
| 3D hero stage | Home hero | Depth / delight | Layers sit at different depths (ROADSTER word far back, car middle, frame corners and dashboard in front); the stage turns up to 7° toward the mouse with a weighted follow, and a soft highlight tracks it across the car |
| Hero entrance | Home load | First impression | Word rises, car drives in with a slight 3D turn, the dashboard folds down into place, info fades up |
| Feature change | Hero 01-05 | State change | Light sweep across the car, info panel swings in like a door, photo settles, gauge arc sweeps and its number rolls up |
| Dashboard | Hero | Realism | Gauge tilted back like a real dashboard, slow glow |
| Floor reflection, idle float, speed lines | Hero | Atmosphere | Car reflection on a polished floor, gentle hover, drifting diagonal lines |
| Card 3D tilt + glare | Vehicle cards | Feedback | Card tilts up to 5° toward the mouse with moving light glare, lifts with a deeper shadow, eases back on leave |
| Card entrance | Any grid redraw | Prevent jarring change | Cards fill in one after another (40 ms apart) after filtering |
| Brand tiles, buttons | Discovery, everywhere | Feedback | Tiles lift toward you in 3D on hover; everything pressable gives way slightly when pressed |
| Scroll reveal | Sections | Spatial | Sections rise and tilt up into place once, panels stagger |
| Photo morph between pages | Card → vehicle page | Spatial consistency | The clicked card photo grows into the vehicle page photo (Chrome/Edge 126+, Safari 18.2+; others load normally) |
| Gallery slides | Vehicle gallery and viewer | Spatial | New photo slides in from the side it came from; viewer zooms in from 94% |
| Panels, toasts | Everywhere | Spatial / feedback | Drawer curve for side panels; toasts use transitions so rapid messages never restart |

**Rules followed.**
- Only `transform` and `opacity` are animated, and nothing starts from `scale(0)`.
- Shared easing tokens (`--ease-out`, `--ease-in-out`, `--ease-drawer`) are used throughout.
- Hover effects run only for a real mouse or trackpad.
- With **reduced motion** turned on, all movement, 3D, idle loops and page morphs are removed, while colour and opacity changes stay.
- Below 920 px the hero's depth layers are flattened, because touch screens get no pointer tilt.
- **No animation sends analytics.** Event counts are identical with or without `motion.js`, and page transitions do not add page views.
- Settings live in `MOTION` at the top of `motion.js`. Set `MOTION.enabled = false` to switch every JavaScript effect off.

## 4. Data honesty: verified vs. demonstration content

Every specification carries a **status**, shown next to the value:

| Status | Meaning | Example |
|---|---|---|
| Manufacturer figure (`verified`) | Manufacturer's published figure, as reported by the cited source | BMW M8 Competition: 617 hp |
| Published third-party figure (`reported`) | Published by a reputable third-party source | Audi R8: 0-62 mph 3.1 s (evo) |
| Announced target (`announced`) | Company claim for a vehicle not in production | Tesla Roadster: 0-60 mph 1.9 s |
| *Specification not verified* | No source checked, so no value is shown | Taycan transmission, all colours |

- Sources are listed on every vehicle page (checked 2026-11-05). Re-check before publishing; manufacturers revise figures.
- **Prices**: "From $X (published MSRP)" = published US starting price for the stated model year; "(announced price)" = Tesla's 2017 announcement; "SAMPLE price" = invented for the price filter only. None is an offer.
- **Availability**: every listing is a demonstration, never dealer inventory. The Tesla Roadster is shown as an announced, unreleased car.
- **Photos**: model-labelled photos from Wikimedia Commons under Creative Commons licences. Author, licence and source appear under every photo. Notes mark a different trim or year (e.g. the S-Class interior is the same W223 generation, AMG S 63 shown). No licensed interior photo was found for the DB12, Continental GT Speed, Revuelto, Urus S or Roadster, so their Interior tab is disabled rather than showing another car. No licensed top-down Roadster photo exists, so the hero uses a three-quarter view.

### Credits
Vehicle photos (Wikimedia Commons): Charles from Port Chester, New York (CC BY 2.0); Tokumeigakarinoaoshima, Calreyn88, Alexander Migl, Alexander-93, MrWalkr, Kevauto, Damian B Oh, Vauxford, Ank kumar, Smnt (CC BY-SA 4.0); JaayJay (CC BY-SA 3.0); Alexandre Prevot (CC BY-SA 2.0); Steve Jurvetson, David Merrett (CC BY 2.0); Aos.1905 (CC BY 4.0); MoCars, Mustang Joe (CC0).
Panel photos (Unsplash License): Titi Iaru, Mateusz Wysocki. Video: anotherview, CC BY 3.0 (Wikimedia Commons).
CC BY-SA images must stay credited with their licence if you reuse them.

## 5. Customize

| Change | File | Where |
|---|---|---|
| Vehicles, specs, statuses, sources, prices, photos | `assets/js/vehicles.js` | `VEHICLES` |
| Hero texts, statistics, gauge values | `assets/js/config.js` | `HERO_FEATURES` |
| Brands and types in the discovery tabs | `assets/js/config.js` | `BRANDS`, `TYPES` |
| Translations | `assets/js/config.js` | `TRANSLATIONS` |
| GTM/GA4 IDs, consent, debug logging | `assets/js/config.js` | `SITE_CONFIG.analytics` |
| Form endpoints, compare limit, demo contact details | `assets/js/config.js` | `SITE_CONFIG` |
| Colours, fonts | `assets/css/style.css` | SECTION 1 |
| Performance panel texts | `assets/js/main.js` | `CONTENT_PANELS` |
| Header, footer, page texts | the HTML pages | see the SECTION comments |

Adding a vehicle: copy one `{ ... }` block in `VEHICLES`, give it a new `id`,
fill only values you can source, and add a licensed photo with `commonsPhoto(...)`.

## 6. Analytics in brief

GTM is the only integration; GA4 is configured inside GTM. All pushes go
through `analytics.js`. Analytics stays off until a real `GTM-` ID is set and
the visitor accepts the cookie banner. With `debugLogging: true` every event
prints in the console even without GTM. Full setup: `ANALYTICS_GUIDE.md`;
tests: `ANALYTICS_TEST_CASES.md`.

## 7. Deploy to GitHub Pages

1. Upload the **contents** of `car_dealership/` to a GitHub repository (so `index.html` is at the root).
2. Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.
3. Visit `https://<username>.github.io/<repository>/` after about a minute.

Any static host works the same way.

## 8. Features that need a backend or extra configuration

| Feature | Now | Production needs |
|---|---|---|
| Inquiry / test-drive delivery | Demo: nothing sent or stored; `demo_lead_submitted` | An HTTPS endpoint (CRM, form service or API) in `inquiryEndpoint`; it must answer 2xx only when the request is stored. Then `generate_lead` is sent. Add spam protection and a privacy review. |
| Real test-drive booking | Not possible (request only) | Dealer scheduling system with confirmation |
| Newsletter | Demo: `demo_newsletter_submitted` | Email service endpoint in `newsletterEndpoint` (double opt-in recommended); then `sign_up` |
| Accounts / login | Demo notice only | Authentication service; never collect passwords on a static site |
| Inventory, prices, availability | Static demo data | Dealer inventory API with real prices and stock |
| Analytics | Inactive placeholders | GTM container + GA4 property (see guide) |
| Brand logos | Text marks | Licensed logo files |

## 9. Troubleshooting

| Problem | Fix |
|---|---|
| Changes do not appear | Hard refresh; the Python server allows caching |
| Grid empty, console error | Syntax error in `vehicles.js` or `config.js` (missing comma/quote) |
| Photos missing | Offline, or a Commons URL was mistyped; open it in a tab |
| Video does not play | Offline, or the browser lacks WebM/VP9 (a QuickTime fallback is included) |
| No events in console | `debugLogging` is false |
| Favorites/compare forget | Private window or blocked site data |

## 10. Testing status

Tested on 2026-11-05 in Chromium at 1440×900, 768×1024 and 375×812 against a
local server:

- **Pages**: all seven pages load with no console errors in normal use. None overflow horizontally at 768 or 375 px. All 18 internal links resolve. All 57 photo/poster URLs load.
- **Journeys**: the journeys in `ANALYTICS_TEST_CASES.md` were run, and the **website's dataLayer pushes** matched the expectations, including no duplicates on repeated clicks.
- **Leads**: no `generate_lead` in demo mode or on a failed backend. A simulated 2xx backend response produced exactly one `generate_lead`.
- **Privacy**: no form data appeared in the dataLayer or localStorage.
- **Motion (2026-11-05)**:
  - The hero 3D tilt, feature change (sweep, panel swing, gauge count-up), card tilt with glare, scroll reveals, gallery slides and viewer zoom all ran in Chromium.
  - The cross-page photo morph ran: the `pageswap` event reported a view transition carrying the clicked card's photo.
  - With reduced motion simulated, the JavaScript effects were skipped and the analytics events still fired.
  - Event counts for the journeys were unchanged, and no page overflowed sideways at 375, 768 or 1440 px.

**Not verified:**
- Delivery to a real GTM container or GA4 property, so every "Actual GA4" cell is "Not tested".
- A real backend or real email delivery.
- Safari and Firefox, real touch devices, and screen readers.
- The reduced-motion setting toggled at OS level (it was only simulated in the browser).
- How the motion feels on a real device and on a 120 Hz screen.
- View Transitions in Safari.
- Core Web Vitals (not measured).
