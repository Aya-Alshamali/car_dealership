/**
 * ============================================================
 * FILE: assets/js/config.js
 * ============================================================
 *
 * 1. PURPOSE
 *    Settings and fixed website content for the REDLINE demonstration
 *    showroom: analytics IDs, demo business details, the brand and type
 *    lists, the five hero features of the Tesla Roadster section, the
 *    video, and the translations used by the language selector.
 *    (The vehicles themselves live in assets/js/vehicles.js.)
 *
 * 2. IMPORTANT SECTIONS
 *    SITE_CONFIG ........ name, analytics, form endpoints, demo contact
 *    BRANDS / TYPES ..... the "SELECT YOUR CAR BY" tabs
 *    HERO_FEATURES ...... 01-05 in the hero (Roadster facts + status)
 *    SHOWROOM_VIDEO ..... the "STAY IN TOUCH" video
 *    TRANSLATIONS ....... EN / DE / AR texts for the language selector
 *
 * 3. FEATURES IT CONTROLS
 *    Header language selector, hero feature panel, discovery tabs,
 *    footer contact details, form demo mode, video player, analytics.
 *
 * 4. DEPENDENCIES
 *    None. Loaded FIRST on every page (first <script> in <head>).
 *
 * 5. HOW A BEGINNER CAN MODIFY IT
 *    Change only the values on the right of each colon. Keep quotes,
 *    commas and brackets. To activate real form delivery, put a URL in
 *    inquiryEndpoint / newsletterEndpoint (see README section 8).
 *
 * 6. GA4 / GTM INTEGRATION LOCATION
 *    SITE_CONFIG.analytics below. GA4 is configured INSIDE Google Tag
 *    Manager; this site never loads gtag.js itself.
 *
 * EXPECTED ANALYTICS EFFECT: None directly. This file only stores data.
 * ============================================================
 */

// ==========================================
// GA4 AND GTM EVENT TRACKING SECTION
// ==========================================
// This file sends no events. It holds the IDs read by analytics.js.
// While gtmContainerId contains "XXXXXXX", analytics stays OFF.

window.SITE_CONFIG = {
  siteName: "REDLINE",
  siteSubtitle: "Auto Showroom",
  disclaimer: "Independent demonstration showroom for education. Not a dealer and not affiliated with Tesla, Mercedes-Benz, Bentley, Jaguar, Audi, Aston Martin, BMW, Lamborghini or Porsche. No vehicle on this site is offered for sale.",

  analytics: {
    gtmContainerId: "GTM-XXXXXXX",   // your Google Tag Manager container
    ga4MeasurementId: "G-XXXXXXXXXX", // reference only: enter it inside GTM
    debugLogging: true,               // print every event in the console (F12)
    requireConsent: true              // show the cookie banner first
  },

  // Leave empty for DEMONSTRATION MODE (nothing is sent anywhere).
  // A real endpoint must accept a JSON POST and answer with HTTP 2xx.
  inquiryEndpoint: "",
  newsletterEndpoint: "",

  // How many vehicles can be compared at once.
  maxCompare: 3,

  // Demonstration business details (fictional placeholders).
  contact: {
    address: "100 Demo Boulevard, Sample City (fictional address)",
    phone: "+1 (555) 010-2040",
    email: "showroom@redline-demo.example",
    hours: "Mon-Sat 10:00-19:00 (demo)"
  },

  social: {
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/",
    x: "https://x.com/",
    facebook: "https://www.facebook.com/"
  }
};

/* ---------- "SELECT YOUR CAR BY" ---------- */
// Text-based brand marks are used instead of manufacturer logos
// (no logo licence is held for this demonstration).
window.BRANDS = ["Mercedes-Benz", "Bentley", "Jaguar", "Audi", "Aston Martin", "BMW", "Lamborghini", "Porsche"];

// Each type matches vehicle.types in vehicles.js.
window.TYPES = ["SUV", "Sedan", "Coupe", "Sports Car", "Electric", "Hybrid", "Luxury"];

/* ---------- HERO: TESLA ROADSTER FEATURES (01-05) ----------
 * The second-generation Tesla Roadster was ANNOUNCED in November 2017.
 * Every figure below is an announced target from Tesla, not a measured
 * production specification, and the car is not available to buy here.
 * status: "announced" | "not_verified"
 * gauge: the value drawn on the curved dashboard (0-100 = arc filled).
 */
window.HERO_FEATURES = [
  {
    number: "01",
    id: "performance",
    title: "Performance",
    text: "Tesla presented the second-generation Roadster in 2017 as an all-electric supercar. Its announced performance targets include 0-100 mph in 4.2 seconds and a quarter mile in 8.9 seconds. These are company claims for a vehicle that has not entered production.",
    stats: [
      { label: "0-100 mph", value: "4.2 s", status: "announced" },
      { label: "Quarter mile", value: "8.9 s", status: "announced" }
    ],
    gauge: { value: "8.9 s", label: "Quarter mile (announced)", fill: 82 },
    photoIndex: 0
  },
  {
    number: "02",
    id: "autonomy",
    title: "Autonomous & Driver Assistance",
    text: "Tesla has not published driver-assistance or autonomous-driving specifications for the second-generation Roadster. Features offered on other Tesla models are not assumed to apply to this car.",
    stats: [
      { label: "Driver assistance", value: "Specification not verified", status: "not_verified" }
    ],
    gauge: { value: "N/A", label: "No official data", fill: 0 },
    photoIndex: 1
  },
  {
    number: "03",
    id: "acceleration",
    title: "Acceleration",
    text: "At launch Tesla claimed 0-60 mph in 1.9 seconds. In 2019 Elon Musk described 2.1 seconds as the base-model figure, and in 2024 he stated a new design goal of under one second. Treat all of these as announced targets.",
    stats: [
      { label: "0-60 mph (2017 claim)", value: "1.9 s", status: "announced" },
      { label: "2024 stated goal", value: "< 1 s", status: "announced" }
    ],
    gauge: { value: "1.9 s", label: "0-60 mph (announced)", fill: 95 },
    photoIndex: 0
  },
  {
    number: "04",
    id: "speed",
    title: "Speed",
    text: "Tesla suggested a top speed of over 250 mph for the second-generation Roadster. No independently measured top speed exists because the car has not been delivered to customers.",
    stats: [
      { label: "Top speed", value: "250+ mph", status: "announced" }
    ],
    gauge: { value: "250+", label: "mph top speed (announced)", fill: 90 },
    photoIndex: 2
  },
  {
    number: "05",
    id: "battery",
    title: "Battery & Range",
    text: "Tesla announced a 200 kWh battery pack and a range of 620 miles per charge. Range at very high speed would be lower. Announced pricing was $200,000 (base) and $250,000 (Founders Series).",
    stats: [
      { label: "Battery", value: "200 kWh", status: "announced" },
      { label: "Range", value: "620 mi", status: "announced" }
    ],
    gauge: { value: "620", label: "miles range (announced)", fill: 88 },
    photoIndex: 1
  }
];

/* ---------- VIDEO (STAY IN TOUCH section) ----------
 * "Cars drifting around a race track at twilight and night as viewed
 * from FPV drone" by anotherview, CC BY 3.0, via Wikimedia Commons.
 * Two formats: WebM (most browsers) and QuickTime/MPEG-4 (Safari fallback).
 */
var COMMONS_VIDEO = "https://upload.wikimedia.org/wikipedia/commons/transcoded/9/9d/Cars_drifting_around_a_race_track_at_twilight_and_night_as_viewed_from_FPV_drone.webm/Cars_drifting_around_a_race_track_at_twilight_and_night_as_viewed_from_FPV_drone.webm";
window.SHOWROOM_VIDEO = {
  title: "Night drift session (race track)",
  provider: "wikimedia_commons",
  sources: [
    { src: COMMONS_VIDEO + ".480p.vp9.webm", type: "video/webm" },
    { src: COMMONS_VIDEO + ".360p.mpeg4.mov", type: "video/mp4" }
  ],
  poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Cars_drifting_around_a_race_track_at_twilight_and_night_as_viewed_from_FPV_drone.webm/1280px--Cars_drifting_around_a_race_track_at_twilight_and_night_as_viewed_from_FPV_drone.webm.jpg",
  pageUrl: "https://commons.wikimedia.org/wiki/File:Cars_drifting_around_a_race_track_at_twilight_and_night_as_viewed_from_FPV_drone.webm",
  credit: "anotherview",
  license: "CC BY 3.0",
  licenseUrl: "https://creativecommons.org/licenses/by/3.0"
};

/* ---------- LANGUAGE SELECTOR ----------
 * Elements with data-i18n="key" get the text for the chosen language.
 * Only interface labels are translated; vehicle data stays in English.
 * Add a language: add a new block with the same keys and an <option>.
 */
window.TRANSLATIONS = {
  en: {
    nav_home: "Home", nav_inventory: "Inventory", nav_compare: "Compare", nav_favorites: "Favorites", nav_contact: "Contact",
    login: "Login", account: "Account", menu: "Menu", search: "Search",
    hero_kicker: "The Future of Electric Supercars",
    hero_cta: "Explore the Roadster",
    panel1_title: "Built for Performance", panel1_btn: "Explore Technology",
    panel2_title: "Smart. Intuitive. Futuristic.", panel2_btn: "Explore Interior",
    select_title: "Select your car by", tab_brands: "Brands", tab_types: "Types",
    inventory_title: "Showroom Collection", view_inventory: "View full inventory",
    stay_title: "Stay in touch", subscribe: "Subscribe",
    explore: "Explore Product", book: "Book Test Drive"
  },
  de: {
    nav_home: "Start", nav_inventory: "Fahrzeuge", nav_compare: "Vergleichen", nav_favorites: "Favoriten", nav_contact: "Kontakt",
    login: "Anmelden", account: "Konto", menu: "Menü", search: "Suche",
    hero_kicker: "Die Zukunft elektrischer Supersportwagen",
    hero_cta: "Roadster entdecken",
    panel1_title: "Gebaut für Leistung", panel1_btn: "Technologie entdecken",
    panel2_title: "Smart. Intuitiv. Futuristisch.", panel2_btn: "Innenraum entdecken",
    select_title: "Wählen Sie Ihr Auto nach", tab_brands: "Marken", tab_types: "Typen",
    inventory_title: "Showroom-Kollektion", view_inventory: "Alle Fahrzeuge ansehen",
    stay_title: "Bleiben Sie in Kontakt", subscribe: "Abonnieren",
    explore: "Fahrzeug ansehen", book: "Probefahrt anfragen"
  },
  ar: {
    nav_home: "الرئيسية", nav_inventory: "السيارات", nav_compare: "مقارنة", nav_favorites: "المفضلة", nav_contact: "اتصل بنا",
    login: "تسجيل الدخول", account: "الحساب", menu: "القائمة", search: "بحث",
    hero_kicker: "مستقبل السيارات الخارقة الكهربائية",
    hero_cta: "اكتشف رودستر",
    panel1_title: "مصممة للأداء", panel1_btn: "اكتشف التقنية",
    panel2_title: "ذكية. سهلة. مستقبلية.", panel2_btn: "اكتشف المقصورة",
    select_title: "اختر سيارتك حسب", tab_brands: "العلامات", tab_types: "الأنواع",
    inventory_title: "مجموعة المعرض", view_inventory: "عرض كل السيارات",
    stay_title: "ابقَ على تواصل", subscribe: "اشترك",
    explore: "عرض السيارة", book: "احجز تجربة قيادة"
  }
};
