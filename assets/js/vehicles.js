/**
 * ============================================================
 * FILE: assets/js/vehicles.js
 * ============================================================
 *
 * 1. PURPOSE
 *    The vehicle catalogue (VEHICLES) and everything that DISPLAYS a
 *    vehicle: the shared vehicle card, the vehicle details page
 *    (vehicle.html?id=...), and its image gallery + enlarged viewer.
 *
 * 2. IMPORTANT SECTIONS
 *    A. DATA ......... VEHICLES with specification status + sources
 *    B. HELPERS ...... getVehicleById(), formatVehiclePrice(), getSpec()
 *    C. CARDS ........ buildVehicleCardHtml(), sendVehicleListView(),
 *                      handleVehicleSelect() (select_item)
 *    D. DETAILS PAGE . renderVehicleDetails() (view_item)
 *    E. GALLERY ...... switchGalleryView(), selectGalleryImage(),
 *                      openGalleryLightbox(), showLightboxImage()
 *
 * 3. FEATURES IT CONTROLS
 *    Vehicle cards on every page, vehicle details, gallery, lightbox.
 *
 * 4. DEPENDENCIES
 *    config.js, analytics.js, main.js (escapeHtml, openPanel, ...).
 *    favorites.js / comparison.js provide isFavorite() / isInCompare()
 *    used when cards are drawn (they load right after this file).
 *
 * 5. HOW A BEGINNER CAN MODIFY IT
 *    Edit the VEHICLES list. Each specification is
 *      { value: "617 hp", status: "verified" }
 *    status: "verified"  = manufacturer figure reported by the cited source
 *            "reported"  = published by a third-party source
 *            "announced" = company claim for a vehicle not in production
 *    Leave a specification OUT if you cannot source it: the page then
 *    shows "Specification not verified". Never guess a value.
 *
 * 6. GA4 / GTM INTEGRATION LOCATION
 *    Events go through analytics.js: view_item_list, select_item,
 *    view_item, vehicle_gallery_opened, vehicle_image_selected.
 *
 * DATA NOTES
 *    - Figures were checked against the sources listed in each vehicle's
 *      "sources" on 2026-11-05. Manufacturer data can change; re-check
 *      before publishing.
 *    - No vehicle is available for sale. Prices are either published
 *      starting MSRPs (status "published"), announcements ("announced")
 *      or clearly labelled SAMPLE values ("sample") for the price filter.
 *    - Photos: Wikimedia Commons, each with author + licence. CC BY-SA
 *      photos must stay credited with their licence when reused.
 * ============================================================
 */

// ==========================================
// GA4 AND GTM EVENT TRACKING SECTION
// ==========================================
// This file sends events through analytics.js (see each function's
// "EXPECTED ANALYTICS" block): view_item_list, select_item, view_item,
// vehicle_gallery_opened, vehicle_image_selected.

/* ============================================================
 * A. DATA
 * ============================================================ */
var COMMONS = "https://upload.wikimedia.org/wikipedia/commons/thumb/";

/**
 * FUNCTION: commonsPhoto(path, file, view, alt, credit, license, licenseUrl)
 * PURPOSE: Builds one photo object from a Wikimedia Commons file.
 *   path = the two folders in the file's URL, e.g. "3/37".
 * EXPECTED ANALYTICS EFFECT: None directly.
 */
function commonsPhoto(path, file, view, alt, credit, license, licenseUrl, note) {
  return {
    url: COMMONS + path + "/" + file + "/1920px-" + file,
    view: view,               // "exterior" or "interior"
    alt: alt,
    credit: credit,
    license: license,
    licenseUrl: licenseUrl,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:" + decodeURIComponent(file),
    note: note || ""
  };
}
var CC_BY_SA_4 = "https://creativecommons.org/licenses/by-sa/4.0";
var CC_BY_SA_3 = "https://creativecommons.org/licenses/by-sa/3.0";
var CC_BY_SA_2 = "https://creativecommons.org/licenses/by-sa/2.0";
var CC_BY_2 = "https://creativecommons.org/licenses/by/2.0";
var CC_BY_4 = "https://creativecommons.org/licenses/by/4.0";
var CC0 = "https://creativecommons.org/publicdomain/zero/1.0/";

window.VEHICLES = [
  {
    id: "mercedes-benz-s-580",
    brand: "Mercedes-Benz",
    model: "S-Class S 580 4MATIC",
    modelYear: 2024,
    bodyType: "Sedan",
    powertrain: "Petrol",
    types: ["Sedan", "Luxury"],
    summary: "Flagship luxury sedan with a V8 and all-wheel drive.",
    price: { amount: 128150, currency: "USD", status: "published", note: "Published US starting MSRP, 2024 model year" },
    specs: {
      horsepower: { value: "496 hp", status: "verified" },
      torque: { value: "516 lb-ft", status: "verified" },
      acceleration: { value: "4.3 s (0-60 mph)", status: "verified" },
      transmission: { value: "9-speed 9G-TRONIC automatic", status: "verified" },
      drivetrain: { value: "All-wheel drive (4MATIC)", status: "verified" },
      seating: { value: "5", status: "reported" }
    },
    sources: [
      { label: "Mercedes-Benz USA - S 580 4MATIC Sedan", url: "https://mbusa.com/en/vehicles/model/s-class/sedan/s580v4" },
      { label: "Cars.com - 2024 S-Class specs", url: "https://www.cars.com/research/mercedes_benz-s_class-2024/specs/448080/" }
    ],
    availableForSale: false,
    photos: [
      commonsPhoto("a/a3", "Mercedes-Benz_S-Klasse_%28W223%29_S_580_4MATIC_%282024%29_%2854206757976%29.jpg", "exterior", "Dark Mercedes-Benz S 580 4MATIC sedan, rear three-quarter view", "Charles from Port Chester, New York", "CC BY 2.0", CC_BY_2),
      commonsPhoto("3/38", "Mercedes-Benz_S-Klasse_%28W223%29_S_580_4MATIC_%282023%29_%2853492230278%29.jpg", "exterior", "Black Mercedes-Benz S 580 4MATIC sedan parked on a street", "Charles from Port Chester, New York", "CC BY 2.0", CC_BY_2, "2023 model year shown"),
      commonsPhoto("e/ef", "Mercedes-AMG_S_63_E_Performance_%28W223%29_interior.jpg", "interior", "Dashboard and front seats of a W223-generation S-Class", "Tokumeigakarinoaoshima", "CC BY-SA 4.0", CC_BY_SA_4, "Same W223 generation; Mercedes-AMG S 63 E Performance interior shown")
    ]
  },
  {
    id: "bentley-continental-gt-speed",
    brand: "Bentley",
    model: "Continental GT Speed",
    modelYear: 2025,
    bodyType: "Coupe",
    powertrain: "Hybrid",
    types: ["Coupe", "Sports Car", "Hybrid", "Luxury"],
    summary: "Fourth-generation grand tourer with a plug-in hybrid V8.",
    price: { amount: 320000, currency: "USD", status: "sample", note: "SAMPLE price for demonstration only" },
    specs: {
      engine: { value: "4.0-litre twin-turbo V8 plug-in hybrid", status: "verified" },
      horsepower: { value: "771 bhp (782 PS)", status: "verified" },
      torque: { value: "1,000 Nm (738 lb-ft)", status: "verified" },
      acceleration: { value: "3.1 s (0-60 mph, coupe)", status: "verified" },
      topSpeed: { value: "208 mph", status: "verified" },
      transmission: { value: "8-speed dual-clutch", status: "verified" },
      drivetrain: { value: "All-wheel drive", status: "verified" },
      seating: { value: "4", status: "reported" }
    },
    sources: [
      { label: "SlashGear - 2025 Continental GT Speed first drive", url: "https://www.slashgear.com/1676617/2025-bentley-continental-gt-speed-first-drive-price-specs-performance" },
      { label: "duPont Registry - 2025 Continental Speed specs", url: "https://news.dupontregistry.com/specs/2025-bentley-continental-speed-price-specs/" }
    ],
    availableForSale: false,
    photos: [
      commonsPhoto("3/35", "2024_Bentley_Continental_GT_Speed.jpg", "exterior", "Green Bentley Continental GT Speed, front three-quarter view", "Calreyn88", "CC BY-SA 4.0", CC_BY_SA_4),
      commonsPhoto("6/66", "Bentley_Continental_GT_%284th_gen.%29_DSC_6978.jpg", "exterior", "Blue fourth-generation Bentley Continental GT at a motor show", "Alexander Migl", "CC BY-SA 4.0", CC_BY_SA_4, "Fourth-generation Continental GT shown")
    ]
  },
  {
    id: "jaguar-f-type-r-75",
    brand: "Jaguar",
    model: "F-TYPE R 75 Coupe",
    modelYear: 2024,
    bodyType: "Coupe",
    powertrain: "Petrol",
    types: ["Coupe", "Sports Car"],
    summary: "Final model year of the supercharged V8 F-TYPE.",
    price: { amount: 113000, currency: "USD", status: "published", note: "Published US starting price, 2024 R 75 coupe" },
    specs: {
      engine: { value: "Supercharged 5.0-litre V8", status: "verified" },
      horsepower: { value: "575 hp", status: "verified" },
      torque: { value: "516 lb-ft", status: "reported" },
      acceleration: { value: "3.5 s (0-60 mph)", status: "verified" },
      topSpeed: { value: "186 mph (governed)", status: "verified" },
      transmission: { value: "8-speed automatic", status: "verified" },
      drivetrain: { value: "All-wheel drive", status: "verified" },
      seating: { value: "2", status: "reported" }
    },
    sources: [
      { label: "Jaguar USA - F-TYPE", url: "https://www.jaguarusa.com/all-models/f-type.html" },
      { label: "ClassicCars Journal - 2024 F-TYPE final year", url: "https://journal.classiccars.com/2023/01/12/2024-jaguar-f-type-marks-end-of-the-road-for-svelte-sports-car/" }
    ],
    availableForSale: false,
    photos: [
      commonsPhoto("3/37", "2024_Jaguar_F-Type_R_75.jpg", "exterior", "Dark green Jaguar F-TYPE R 75 coupe on grass", "MrWalkr", "CC BY-SA 4.0", CC_BY_SA_4),
      commonsPhoto("e/eb", "2024_Jaguar_F_Type_R_75_Black_Design_Pack.jpg", "exterior", "Jaguar F-TYPE R 75 with Black Design Pack", "Calreyn88", "CC BY-SA 4.0", CC_BY_SA_4),
      commonsPhoto("3/32", "Jaguar_F-Type_interior.jpg", "interior", "Jaguar F-TYPE cabin with steering wheel and centre console", "JaayJay", "CC BY-SA 3.0", CC_BY_SA_3, "Earlier F-TYPE model year shown")
    ]
  },
  {
    id: "audi-r8-v10-performance",
    brand: "Audi",
    model: "R8 V10 performance quattro",
    modelYear: 2023,
    bodyType: "Coupe",
    powertrain: "Petrol",
    types: ["Coupe", "Sports Car"],
    summary: "Mid-engine V10 supercar in its final model years.",
    price: { amount: 209700, currency: "USD", status: "published", note: "Published US starting MSRP, 2023 quattro coupe" },
    specs: {
      engine: { value: "5.2-litre naturally aspirated V10", status: "reported" },
      horsepower: { value: "602 hp", status: "reported" },
      acceleration: { value: "3.1 s (0-62 mph, published test)", status: "reported" },
      transmission: { value: "7-speed S tronic dual-clutch", status: "reported" },
      drivetrain: { value: "All-wheel drive (quattro)", status: "reported" },
      seating: { value: "2", status: "reported" }
    },
    sources: [
      { label: "Cars.com - 2023 R8 V10 performance specs", url: "https://www.cars.com/research/audi-r8-2023/specs/430724/" },
      { label: "evo - Audi R8 performance and 0-60", url: "https://cdn1.evo.co.uk/audi/r8/performance" }
    ],
    availableForSale: false,
    photos: [
      commonsPhoto("7/7a", "2019_Audi_R8_V10_performance_quattro_front_NYIAS_2019.jpg", "exterior", "Blue Audi R8 V10 performance quattro, front view at a motor show", "Kevauto", "CC BY-SA 4.0", CC_BY_SA_4, "2019 model year shown"),
      commonsPhoto("d/d5", "2019_Audi_R8_V10_performance_quattro_rear_NYIAS_2019.jpg", "exterior", "Blue Audi R8 V10 performance quattro, rear view", "Kevauto", "CC BY-SA 4.0", CC_BY_SA_4, "2019 model year shown"),
      commonsPhoto("f/fd", "2023_Audi_R8_Coupe_V10_Performance_RWD_at_Audi_Manchester_03.jpg", "interior", "Audi R8 cockpit with steering wheel and virtual cockpit display", "MoCars", "CC0", CC0, "2023 R8 V10 performance RWD shown")
    ]
  },
  {
    id: "aston-martin-db12",
    brand: "Aston Martin",
    model: "DB12",
    modelYear: 2024,
    bodyType: "Coupe",
    powertrain: "Petrol",
    types: ["Coupe", "Sports Car", "Luxury"],
    summary: "Grand tourer Aston Martin calls a 'super tourer'.",
    price: { amount: 245000, currency: "USD", status: "sample", note: "SAMPLE price for demonstration only" },
    specs: {
      engine: { value: "4.0-litre twin-turbo V8", status: "verified" },
      horsepower: { value: "671 hp", status: "verified" },
      torque: { value: "590 lb-ft", status: "verified" },
      acceleration: { value: "3.5 s (0-60 mph, launch claim)", status: "verified" },
      topSpeed: { value: "202 mph", status: "verified" },
      transmission: { value: "8-speed automatic", status: "verified" },
      drivetrain: { value: "Rear-wheel drive", status: "reported" },
      seating: { value: "2+2", status: "reported" }
    },
    sources: [
      { label: "Motor1 - DB12 revealed with 671 hp", url: "https://www.motor1.com/news/668801/aston-martin-db12-debuts-horsepower-v8-engine/" },
      { label: "Gear Patrol - DB12 everything you need to know", url: "https://gearpatrol.com/cars/a43989526/aston-martin-db12-2024/" }
    ],
    availableForSale: false,
    photos: [
      commonsPhoto("c/ca", "Aston_Martin_DB12_1X7A1921.jpg", "exterior", "Silver Aston Martin DB12, front three-quarter view", "Alexander-93", "CC BY-SA 4.0", CC_BY_SA_4),
      commonsPhoto("0/03", "Aston_Martin_DB12_1X7A1934.jpg", "exterior", "Silver Aston Martin DB12, rear three-quarter view", "Alexander-93", "CC BY-SA 4.0", CC_BY_SA_4)
    ]
  },
  {
    id: "bmw-m8-competition",
    brand: "BMW",
    model: "M8 Competition Coupe",
    modelYear: 2024,
    bodyType: "Coupe",
    powertrain: "Petrol",
    types: ["Coupe", "Sports Car", "Luxury"],
    summary: "Twin-turbo V8 grand tourer with M xDrive.",
    price: { amount: 138800, currency: "USD", status: "published", note: "Published US starting MSRP, 2024 coupe" },
    specs: {
      engine: { value: "4.4-litre twin-turbo V8", status: "verified" },
      horsepower: { value: "617 hp", status: "verified" },
      torque: { value: "553 lb-ft", status: "verified" },
      acceleration: { value: "3.0 s (0-60 mph, US figure)", status: "verified" },
      topSpeed: { value: "155 mph limited; 190 mph in US spec", status: "reported" },
      transmission: { value: "8-speed automatic", status: "verified" },
      drivetrain: { value: "All-wheel drive (M xDrive)", status: "verified" },
      seating: { value: "4", status: "reported" }
    },
    sources: [
      { label: "Cars.com - 2024 BMW M8 specs", url: "https://www.cars.com/research/bmw-m8-2024/specs" },
      { label: "CarBuzz - 2024 M8 Competition Coupe", url: "https://carbuzz.com/cars/bmw/m8-coupe/2024/specs-and-trims" },
      { label: "BMWBLOG - M8 Competition", url: "https://bmwblog.com/?p=469175" }
    ],
    availableForSale: false,
    photos: [
      commonsPhoto("5/52", "BMW_M8_Competition_Coup%C3%A9_F92_%2853598077098%29.jpg", "exterior", "Grey BMW M8 Competition Coupe (F92), front three-quarter view", "Alexandre Prevot", "CC BY-SA 2.0", CC_BY_SA_2),
      commonsPhoto("e/ec", "BMW_F92_M8_Competition_xDrive_Barcelona_Blue_Metallic.jpg", "exterior", "Barcelona Blue BMW M8 Competition xDrive coupe", "Damian B Oh", "CC BY-SA 4.0", CC_BY_SA_4),
      commonsPhoto("5/5b", "2019_BMW_M8_Competition_Interior.jpg", "interior", "BMW M8 Competition interior with red leather seats", "Vauxford", "CC BY-SA 4.0", CC_BY_SA_4, "2019 model year shown")
    ]
  },
  {
    id: "lamborghini-revuelto",
    brand: "Lamborghini",
    model: "Revuelto",
    modelYear: 2024,
    bodyType: "Coupe",
    powertrain: "Hybrid",
    types: ["Coupe", "Sports Car", "Hybrid", "Luxury"],
    summary: "V12 plug-in hybrid flagship with three electric motors.",
    price: { amount: 608000, currency: "USD", status: "sample", note: "SAMPLE price for demonstration only" },
    specs: {
      engine: { value: "6.5-litre V12 + three electric motors", status: "reported" },
      horsepower: { value: "1,015 CV (about 1,001 hp) combined", status: "reported" },
      torque: { value: "807 Nm (V12)", status: "reported" },
      acceleration: { value: "2.5 s (0-100 km/h)", status: "reported" },
      topSpeed: { value: "Over 350 km/h", status: "reported" },
      transmission: { value: "8-speed dual-clutch", status: "reported" },
      drivetrain: { value: "All-wheel drive", status: "reported" },
      seating: { value: "2", status: "reported" }
    },
    sources: [
      { label: "Autobuzz - Revuelto unveiled", url: "https://autobuzz.my/2023/03/30/lamborghini-revuelto-unveiled-hybrid-v12-aventador-successor-0-100kmh-in-2-5secs/" },
      { label: "Ultimatecarpage - Revuelto specifications", url: "https://www.ultimatecarpage.com/spec/8455/Lamborghini-Revuelto.html" }
    ],
    availableForSale: false,
    photos: [
      commonsPhoto("1/13", "Lamborghini_Revuelto_DSC_6985_%28cropped%29.jpg", "exterior", "White Lamborghini Revuelto, front three-quarter view", "Alexander Migl", "CC BY-SA 4.0", CC_BY_SA_4),
      commonsPhoto("9/96", "Lamborghini_Revuelto_IMG_0562.jpg", "exterior", "White Lamborghini Revuelto, side view", "Alexander-93", "CC BY-SA 4.0", CC_BY_SA_4),
      commonsPhoto("2/28", "Lamborghini_Revuelto_%2853877996613%29.jpg", "exterior", "Grey Lamborghini Revuelto with red stripe, front view", "David Merrett", "CC BY 2.0", CC_BY_2)
    ]
  },
  {
    id: "lamborghini-urus-s",
    brand: "Lamborghini",
    model: "Urus S",
    modelYear: 2023,
    bodyType: "SUV",
    powertrain: "Petrol",
    types: ["SUV", "Luxury"],
    summary: "Twin-turbo V8 super SUV.",
    price: { amount: 230000, currency: "USD", status: "sample", note: "SAMPLE price for demonstration only" },
    specs: {
      engine: { value: "4.0-litre twin-turbo V8", status: "reported" },
      horsepower: { value: "666 CV", status: "reported" },
      torque: { value: "850 Nm", status: "reported" },
      acceleration: { value: "3.5 s (0-100 km/h)", status: "reported" },
      topSpeed: { value: "305 km/h", status: "reported" },
      transmission: { value: "8-speed automatic", status: "reported" },
      drivetrain: { value: "All-wheel drive", status: "reported" }
    },
    sources: [
      { label: "Autobuzz - Urus S unveiled", url: "https://autobuzz.my/2022/10/04/lamborghini-unveils-new-base-spec-urus-s-same-666-hp-as-the-performante/" },
      { label: "Autotijd - Urus S 666 hp performance", url: "https://autotijd.be/en/performance/lamborghini/urus/s-666-hp-awd" }
    ],
    availableForSale: false,
    photos: [
      commonsPhoto("1/10", "Lamborghini_Urus_S_1X7A6798.jpg", "exterior", "Grey Lamborghini Urus S, front three-quarter view", "Alexander-93", "CC BY-SA 4.0", CC_BY_SA_4),
      commonsPhoto("9/9e", "Lamborghini_Urus_S_Monaco.jpg", "exterior", "White Lamborghini Urus S in Monaco", "Calreyn88", "CC BY-SA 4.0", CC_BY_SA_4)
    ]
  },
  {
    id: "porsche-taycan-turbo-s",
    brand: "Porsche",
    model: "Taycan Turbo S",
    modelYear: 2025,
    bodyType: "Sedan",
    powertrain: "Electric",
    types: ["Sedan", "Sports Car", "Electric", "Luxury"],
    summary: "All-electric performance sedan, updated for 2025.",
    price: { amount: 210000, currency: "USD", status: "sample", note: "SAMPLE price for demonstration only" },
    specs: {
      horsepower: { value: "938 hp (with launch control)", status: "reported" },
      acceleration: { value: "2.3 s (0-60 mph)", status: "reported" },
      torque: { value: "819 lb-ft", status: "reported" }
    },
    sources: [
      { label: "Motor1 - Taycan Turbo S 938 hp, 2.3 s", url: "https://www.motor1.com/news/707649/2025-porsche-taycan/" },
      { label: "The Drive - 2025 Taycan", url: "https://www.thedrive.com/news/2025-porsche-taycan-gets-big-range-boost-and-938-hp-dont-hurt-either" }
    ],
    availableForSale: false,
    photos: [
      commonsPhoto("b/b3", "Porsche_Taycan_Turbo_S_%282024%29_%2853624088689%29.jpg", "exterior", "Silver Porsche Taycan Turbo S at a motor show", "Charles from Port Chester, New York", "CC BY 2.0", CC_BY_2),
      commonsPhoto("4/4b", "2024_Porsche_Taycan_Turbo_S_%2853538640412%29.jpg", "exterior", "White Porsche Taycan Turbo S on display", "Mustang Joe", "CC0", CC0),
      commonsPhoto("1/16", "Porsche_Taycan_GTS_%28interior%29_%28taken_in_2022%29_%28Kyoto%2C_Japan%29.jpg", "interior", "Porsche Taycan cockpit with curved driver display", "Aos.1905", "CC BY 4.0", CC_BY_4, "Taycan GTS interior shown (same model line)")
    ]
  },
  {
    id: "tesla-roadster",
    brand: "Tesla",
    model: "Roadster (second generation)",
    modelYear: null,
    bodyType: "Roadster",
    powertrain: "Electric",
    types: ["Sports Car", "Electric"],
    summary: "Announced in 2017. Not in production; figures are targets.",
    announcedOnly: true,
    price: { amount: 200000, currency: "USD", status: "announced", note: "Announced base price (2017); Founders Series announced at $250,000" },
    specs: {
      acceleration: { value: "1.9 s (0-60 mph)", status: "announced" },
      topSpeed: { value: "Over 250 mph", status: "announced" },
      battery: { value: "200 kWh", status: "announced" },
      range: { value: "620 miles", status: "announced" }
    },
    sources: [
      { label: "evo - New Tesla Roadster revealed", url: "https://www.evo.co.uk/tesla/roadster/20362/new-tesla-roadster-revealed-250mph-and-0-60-in-19-seconds" },
      { label: "Carscoops - Tesla shocks us with new Roadster (2017)", url: "https://www.carscoops.com/2017/11/tesla-shocks-us-with-new-2020-roadster.html" },
      { label: "CarExpert - 2024 claim of under 1 s 0-60", url: "https://www.carexpert.com.au/car-news/elon-musk-claims-tesla-roadster-will-have-0-60mph-time-under-1s" }
    ],
    availableForSale: false,
    photos: [
      commonsPhoto("c/c4", "Tesla_Roadster_2.0_%2847619421652%29.jpg", "exterior", "Red second-generation Tesla Roadster prototype at an event", "Steve Jurvetson", "CC BY 2.0", CC_BY_2, "Prototype shown"),
      commonsPhoto("3/3f", "Tesla_roadster_2020_prototype.jpg", "exterior", "Grey second-generation Tesla Roadster prototype at its unveiling", "Smnt", "CC BY-SA 4.0", CC_BY_SA_4, "Prototype shown"),
      commonsPhoto("e/ec", "Tesla_Roadster%2C_Grand_Basel_2018_01.jpg", "exterior", "White second-generation Tesla Roadster prototype at Grand Basel 2018", "Ank kumar", "CC BY-SA 4.0", CC_BY_SA_4, "Prototype shown")
    ]
  }
];

// Order and labels of the specification table.
var SPEC_FIELDS = [
  ["engine", "Engine"], ["horsepower", "Power"], ["torque", "Torque"],
  ["acceleration", "Acceleration"], ["topSpeed", "Top speed"],
  ["transmission", "Transmission"], ["drivetrain", "Drivetrain"],
  ["seating", "Seating capacity"], ["battery", "Battery"], ["range", "Range"]
];
var SPEC_STATUS_LABELS = {
  verified: "Manufacturer figure",
  reported: "Published third-party figure",
  announced: "Announced target, not production"
};
var NOT_VERIFIED_TEXT = "Specification not verified";

/* ============================================================
 * B. HELPERS (EXPECTED ANALYTICS EFFECT: None directly)
 * ============================================================ */

/** FUNCTION: getVehicleById(id) - one vehicle, or null. */
function getVehicleById(vehicleId) {
  for (var i = 0; i < window.VEHICLES.length; i++) {
    if (window.VEHICLES[i].id === vehicleId) {
      return window.VEHICLES[i];
    }
  }
  return null;
}

/** FUNCTION: getVehicleName(vehicle) - "BMW M8 Competition Coupe". */
function getVehicleName(vehicle) {
  return vehicle.brand + " " + vehicle.model;
}

/** FUNCTION: getModelYearText(vehicle) - "2024" or "Announced (2017)". */
function getModelYearText(vehicle) {
  return vehicle.modelYear ? String(vehicle.modelYear) : "Announced 2017, not in production";
}

/**
 * FUNCTION: formatVehiclePrice(vehicle)
 * PURPOSE: Price text that always says what kind of price it is:
 *   published -> "From $138,800 (published MSRP)"
 *   announced -> "$200,000 (announced price)"
 *   sample    -> "$245,000 SAMPLE price"
 */
function formatVehiclePrice(vehicle) {
  var price = vehicle.price;
  if (!price || !price.amount) {
    return "Price not available";
  }
  var amount = new Intl.NumberFormat("en-US", { style: "currency", currency: price.currency, maximumFractionDigits: 0 }).format(price.amount);
  if (price.status === "published") {
    return "From " + amount + " (published MSRP)";
  }
  if (price.status === "announced") {
    return amount + " (announced price)";
  }
  return amount + " SAMPLE price";
}

/**
 * FUNCTION: getSpec(vehicle, key)
 * PURPOSE: { value, status } for one specification, or the
 *   "Specification not verified" placeholder when it is missing.
 */
function getSpec(vehicle, key) {
  var spec = vehicle.specs[key];
  if (!spec) {
    return { value: NOT_VERIFIED_TEXT, status: "missing" };
  }
  return spec;
}

/**
 * FUNCTION: getPhotoUrl(photo, width)
 * PURPOSE: Asks Wikimedia for a smaller copy (960 px for cards).
 */
function getPhotoUrl(photo, width) {
  return photo.url.replace("/1920px-", "/" + (width || 1920) + "px-");
}

/** FUNCTION: getPhotosByView(vehicle, view) - exterior or interior photos. */
function getPhotosByView(vehicle, view) {
  return vehicle.photos.filter(function (photo) { return photo.view === view; });
}

/** FUNCTION: buildCreditHtml(photo) - "Photo: author, licence, source". */
function buildCreditHtml(photo) {
  return 'Photo: ' + escapeHtml(photo.credit) + ', <a href="' + photo.licenseUrl + '" target="_blank" rel="noopener">' + escapeHtml(photo.license) + '</a>, via <a href="' + photo.sourceUrl + '" target="_blank" rel="noopener">Wikimedia Commons</a>' + (photo.note ? ". " + escapeHtml(photo.note) + "." : "");
}

/* ============================================================
 * C. VEHICLE CARDS
 * ============================================================ */

/**
 * FUNCTION: buildVehicleCardHtml(vehicle, index)
 * PURPOSE: HTML for one dark vehicle card (image, brand, model, year,
 *   body type, powertrain, price label, Explore Product, Favorite,
 *   Compare). Used on the home page, inventory, favorites and search.
 * EXPECTED ANALYTICS EFFECT: None directly. Its buttons trigger
 *   select_item, vehicle_favorited/unfavorited (see their functions).
 */
function buildVehicleCardHtml(vehicle, index) {
  var photo = vehicle.photos[0];
  var name = getVehicleName(vehicle);
  var favorite = isFavorite(vehicle.id);
  var compared = isInCompare(vehicle.id);
  var engine = vehicle.specs.engine ? vehicle.specs.engine.value : vehicle.powertrain;
  return (
    '<article class="vehicle-card" data-vehicle-card="' + vehicle.id + '" style="--i:' + index + '">' +
    /* LINK: vehicle image -> vehicle.html?id=...
       Handler: handleVehicleSelect() (select_item) then the page opens. */
    '<a class="vehicle-card__media" href="vehicle.html?id=' + vehicle.id + '" data-select-vehicle="' + vehicle.id + '" data-index="' + index + '" tabindex="-1" aria-hidden="true">' +
    '<img src="' + getPhotoUrl(photo, 960) + '" alt="" width="960" height="540" loading="lazy"><span class="card-glare" aria-hidden="true"></span></a>' +
    (vehicle.announcedOnly ? '<span class="tag tag--red">Announced only</span>' : '<span class="tag">Demo listing</span>') +
    '<div class="vehicle-card__body">' +
    '<p class="vehicle-card__brand">' + escapeHtml(vehicle.brand) + "</p>" +
    '<h3 class="vehicle-card__model">' + escapeHtml(vehicle.model) + "</h3>" +
    '<p class="vehicle-card__meta"><span>' + escapeHtml(getModelYearText(vehicle)) + "</span><span>" + escapeHtml(vehicle.bodyType) + "</span><span>" + escapeHtml(vehicle.powertrain) + "</span></p>" +
    '<p class="vehicle-card__engine">' + escapeHtml(engine) + "</p>" +
    '<p class="vehicle-card__price">' + escapeHtml(formatVehiclePrice(vehicle)) + "</p>" +
    '<div class="vehicle-card__actions">' +
    /* BUTTON (link): Explore Product
       Handler: handleVehicleSelect() -> select_item, then vehicle page
       (which sends view_item). */
    '<a class="btn btn--red btn--small" href="vehicle.html?id=' + vehicle.id + '" data-select-vehicle="' + vehicle.id + '" data-index="' + index + '" data-i18n="explore">' + escapeHtml(t("explore")) + "</a>" +
    /* BUTTON: Add to Favorites (heart)
       Handler: toggleFavorite() in favorites.js.
       Analytics: vehicle_favorited / vehicle_unfavorited. */
    '<button type="button" class="icon-btn icon-btn--card" data-favorite-toggle="' + vehicle.id + '" aria-pressed="' + favorite + '" aria-label="Save ' + escapeHtml(name) + ' to favorites">' + getIconSvg("heart") + "</button>" +
    /* BUTTON: Compare
       Handler: toggleCompare() in comparison.js. Max 3 vehicles.
       Analytics: none (see comparison.js). */
    '<button type="button" class="icon-btn icon-btn--card" data-compare-toggle="' + vehicle.id + '" aria-pressed="' + compared + '" aria-label="Add ' + escapeHtml(name) + ' to comparison">' + getIconSvg("compare") + "</button>" +
    "</div></div></article>"
  );
}

/**
 * FUNCTION: renderVehicleCards(container, vehicles)
 * PURPOSE: Fills a grid element with cards.
 * EXPECTED ANALYTICS EFFECT: None directly (redrawing never tracks).
 */
function renderVehicleCards(container, vehicles) {
  var html = "";
  for (var i = 0; i < vehicles.length; i++) {
    html += buildVehicleCardHtml(vehicles[i], i);
  }
  container.innerHTML = html;
}

/**
 * FUNCTION: sendVehicleListView(listId, listName, vehicles)
 *
 * PURPOSE: Reports that a list of vehicles was displayed.
 * USER ACTION: Opening a page that shows a vehicle list (home, inventory,
 *   favorites).
 * EXPECTED WEBSITE RESULT: none (reporting only).
 * EXPECTED ANALYTICS EVENT: view_item_list
 * EVENT PARAMETERS: ecommerce.item_list_id, item_list_name, items[] with
 *   index (no prices).
 * EVENT COUNT: ONCE per page load per list. Filtering, sorting or
 *   redrawing the list does NOT resend it; filter changes have their own
 *   events (brand_filter_selected, vehicle_type_selected, filters_reset).
 * PAGE VIEWS: unchanged (the page_view comes from the GA4 tag).
 * ENGAGEMENT: none directly.
 * HOW TO VERIFY: load inventory.html: one view_item_list with 10 items.
 * FAILURE CONDITIONS: empty list -> no event (GA4 needs items).
 * DOUBLE COUNTING RISK: guarded by a per-page flag.
 */
var listViewsSent = {};
function sendVehicleListView(listId, listName, vehicles) {
  if (listViewsSent[listId] || vehicles.length === 0) {
    return;
  }
  listViewsSent[listId] = true;
  var items = vehicles.map(function (vehicle, index) {
    return buildVehicleAnalyticsItem(vehicle, { index: index, listId: listId, listName: listName });
  });
  trackEcommerceEvent("view_item_list", { item_list_id: listId, item_list_name: listName, items: items });
}

/**
 * FUNCTION: handleVehicleSelect(event)
 *
 * PURPOSE: Records which vehicle card was chosen, then lets the link open
 *   the vehicle page.
 * USER ACTION: Clicking a card image or "Explore Product".
 * EXPECTED WEBSITE RESULT: vehicle.html?id=<id> opens.
 * EXPECTED ANALYTICS EVENT: select_item
 * EVENT PARAMETERS: ecommerce.item_list_id / item_list_name (from the
 *   grid's data-list-id / data-list-name), items[selected vehicle, index].
 * EVENT COUNT: +1 per click. PAGE VIEWS: +1 on the vehicle page (GA4 tag),
 *   followed by view_item there.
 * ENGAGEMENT TIME: may grow as the visitor reads the vehicle page.
 * ENGAGEMENT RATE: the second page view makes the session engaged.
 * HOW TO VERIFY: GTM Preview: select_item appears before the new page's
 *   page_view; check item_id.
 * FAILURE CONDITIONS: unknown id -> no event (link still works).
 * DOUBLE COUNTING RISK: image and button are separate links; one click
 *   triggers one of them only. Do not add a GTM link-click trigger too.
 */
function handleVehicleSelect(event) {
  var link = event.target.closest("[data-select-vehicle]");
  if (!link) {
    return;
  }
  var vehicle = getVehicleById(link.getAttribute("data-select-vehicle"));
  if (!vehicle) {
    return;
  }
  var list = link.closest("[data-list-id]");
  var listId = list ? list.getAttribute("data-list-id") : "unknown_list";
  var listName = list ? list.getAttribute("data-list-name") : "Unknown list";
  trackEcommerceEvent("select_item", {
    item_list_id: listId,
    item_list_name: listName,
    items: [buildVehicleAnalyticsItem(vehicle, { index: Number(link.getAttribute("data-index")) || 0, listId: listId, listName: listName })]
  });
}

/* ============================================================
 * D. VEHICLE DETAILS PAGE (vehicle.html?id=...)
 * ============================================================ */
var currentVehicle = null;
var galleryView = "exterior";
var galleryIndex = 0;
var gallerySlideDirection = null; // set by stepLightbox() for the slide animation

/**
 * FUNCTION: renderVehicleDetails(vehicle)
 *
 * PURPOSE: Fills vehicle.html: name, year, status banner, gallery,
 *   specification table (with status labels), price, buttons, photo
 *   credits and specification sources.
 * USER ACTION: Opening vehicle.html?id=... (from a card, search,
 *   favorites, comparison).
 * EXPECTED WEBSITE RESULT: the details view; unknown id -> "not found".
 * EXPECTED ANALYTICS EVENT: view_item (once per page load)
 * EVENT PARAMETERS: ecommerce.items[vehicle] (id, name, brand, body type,
 *   powertrain, model year).
 * EVENT COUNT: +1 per load. PAGE VIEWS: this page's own page_view (GA4
 *   tag); view_item is an additional event, not a page view.
 * ENGAGEMENT: reading specs / gallery naturally adds engagement time.
 * HOW TO VERIFY: open vehicle.html?id=bmw-m8-competition: one view_item.
 * FAILURE CONDITIONS: unknown id -> no view_item.
 * DOUBLE COUNTING RISK: gallery, favorite and compare clicks never
 *   resend view_item.
 */
function renderVehicleDetails(vehicle) {
  currentVehicle = vehicle;
  var name = getVehicleName(vehicle);
  document.title = name + " | REDLINE Auto Showroom (demo)";
  document.getElementById("vehicle-brand").textContent = vehicle.brand;
  document.getElementById("vehicle-name").textContent = vehicle.model;
  document.getElementById("vehicle-year").textContent = getModelYearText(vehicle);
  document.getElementById("vehicle-summary").textContent = vehicle.summary;
  document.getElementById("vehicle-price").textContent = formatVehiclePrice(vehicle);
  document.getElementById("vehicle-price-note").textContent = vehicle.price ? vehicle.price.note : "";
  document.getElementById("vehicle-status").textContent = vehicle.announcedOnly
    ? "Announced vehicle: not in production and not available to order here. All figures are announced targets."
    : "Demonstration listing: not dealer inventory and not available for sale.";

  // Specification table
  var rows = '<tr><th scope="row">Category</th><td>' + escapeHtml(vehicle.types.join(", ")) + '</td><td></td></tr>' +
    '<tr><th scope="row">Body type</th><td>' + escapeHtml(vehicle.bodyType) + '</td><td></td></tr>' +
    '<tr><th scope="row">Powertrain</th><td>' + escapeHtml(vehicle.powertrain) + '</td><td></td></tr>';
  for (var i = 0; i < SPEC_FIELDS.length; i++) {
    var spec = getSpec(vehicle, SPEC_FIELDS[i][0]);
    rows += '<tr><th scope="row">' + SPEC_FIELDS[i][1] + "</th><td" + (spec.status === "missing" ? ' class="not-verified"' : "") + ">" + escapeHtml(spec.value) + "</td>" +
      '<td class="spec-status spec-status--' + spec.status + '">' + escapeHtml(SPEC_STATUS_LABELS[spec.status] || "") + "</td></tr>";
  }
  rows += '<tr><th scope="row">Available colours</th><td class="not-verified">' + NOT_VERIFIED_TEXT + "</td><td></td></tr>";
  document.getElementById("spec-table-body").innerHTML = rows;

  // Sources and credits
  document.getElementById("vehicle-sources").innerHTML = vehicle.sources.map(function (source) {
    return '<li><a href="' + source.url + '" target="_blank" rel="noopener">' + escapeHtml(source.label) + "</a></li>";
  }).join("");
  document.getElementById("vehicle-credits").innerHTML = vehicle.photos.map(function (photo) {
    return "<li>" + buildCreditHtml(photo) + "</li>";
  }).join("");

  // Buttons that need the vehicle id
  document.getElementById("vehicle-favorite-btn").setAttribute("data-favorite-toggle", vehicle.id);
  document.getElementById("vehicle-favorite-btn").setAttribute("aria-pressed", isFavorite(vehicle.id));
  document.getElementById("vehicle-compare-btn").setAttribute("data-compare-toggle", vehicle.id);
  document.getElementById("vehicle-compare-btn").setAttribute("aria-pressed", isInCompare(vehicle.id));
  document.getElementById("vehicle-info-btn").setAttribute("href", "contact.html?vehicle=" + vehicle.id + "&type=information");
  document.getElementById("vehicle-test-drive-btn").setAttribute("href", "contact.html?vehicle=" + vehicle.id + "&type=test_drive");

  galleryView = "exterior";
  galleryIndex = 0;
  renderGallery();
  document.getElementById("vehicle-view").hidden = false;

  trackEcommerceEvent("view_item", { items: [buildVehicleAnalyticsItem(vehicle)] });
}

/* ============================================================
 * E. GALLERY AND ENLARGED VIEWER
 * ============================================================ */

/**
 * FUNCTION: renderGallery()
 * PURPOSE: Draws the main photo, the Exterior/Interior tabs and the
 *   thumbnails for the current view. Interior is disabled (with a note)
 *   when no licensed interior photo of this model exists.
 * EXPECTED ANALYTICS EFFECT: None directly (drawing never tracks).
 */
function renderGallery() {
  var photos = getPhotosByView(currentVehicle, galleryView);
  var photo = photos[galleryIndex];
  var main = document.getElementById("gallery-main-image");
  main.src = getPhotoUrl(photo, 1920);
  main.alt = photo.alt;
  document.getElementById("gallery-credit").innerHTML = buildCreditHtml(photo);
  document.getElementById("gallery-counter").textContent = (galleryIndex + 1) + " / " + photos.length + " " + galleryView;

  var interiorCount = getPhotosByView(currentVehicle, "interior").length;
  var interiorTab = document.getElementById("gallery-tab-interior");
  interiorTab.disabled = interiorCount === 0;
  interiorTab.textContent = interiorCount === 0 ? "Interior (no licensed photo)" : "Interior";
  document.getElementById("gallery-tab-exterior").setAttribute("aria-selected", galleryView === "exterior");
  interiorTab.setAttribute("aria-selected", galleryView === "interior");

  var thumbs = "";
  for (var i = 0; i < photos.length; i++) {
    /* BUTTON: Gallery thumbnail
       Handler: selectGalleryImage(i, "thumbnail").
       Analytics: vehicle_image_selected (not when already shown). */
    thumbs += '<button type="button" class="thumb' + (i === galleryIndex ? " is-active" : "") + '" data-gallery-index="' + i + '" aria-label="Show ' + galleryView + " photo " + (i + 1) + '"' + (i === galleryIndex ? ' aria-current="true"' : "") + '><img src="' + getPhotoUrl(photos[i], 330) + '" alt="" width="120" height="68"></button>';
  }
  document.getElementById("gallery-thumbs").innerHTML = thumbs;
}

/**
 * FUNCTION: selectGalleryImage(index, selectionMethod)
 *
 * PURPOSE: Shows another photo of the current vehicle.
 * USER ACTION: thumbnail click ("thumbnail"), Exterior/Interior tab
 *   ("view_tab"), viewer arrows ("lightbox_next"/"lightbox_prev") or the
 *   Left/Right keys in the viewer ("keyboard").
 * EXPECTED WEBSITE RESULT: the main photo (and the viewer, if open),
 *   counter and credit change.
 * EXPECTED ANALYTICS EVENT: vehicle_image_selected
 * EVENT PARAMETERS: vehicle_id, image_view (exterior/interior),
 *   image_index (0-based), selection_method.
 * EVENT COUNT: +1 per real image change. PAGE VIEWS: unchanged.
 * ENGAGEMENT TIME: may grow while browsing photos.
 * ENGAGEMENT RATE: not guaranteed to change.
 * HOW TO VERIFY: click the 2nd thumbnail: one vehicle_image_selected with
 *   image_index 1, selection_method "thumbnail".
 * FAILURE CONDITIONS: index out of range -> ignored, no event.
 * DOUBLE COUNTING RISK: clicking the photo already shown sends nothing.
 */
function selectGalleryImage(index, selectionMethod) {
  var photos = getPhotosByView(currentVehicle, galleryView);
  if (index < 0 || index >= photos.length || index === galleryIndex) {
    return;
  }
  // Direction for the slide animation: arrows say it, thumbnails compare positions.
  var direction = gallerySlideDirection !== null ? gallerySlideDirection : (selectionMethod === "view_tab" ? 0 : (index > galleryIndex ? 1 : -1));
  gallerySlideDirection = null;
  galleryIndex = index;
  renderGallery();
  if (isLightboxOpen()) {
    showLightboxImage();
  }
  // Visual only (motion.js); never sends analytics.
  if (typeof playImageSwapAnimation === "function") {
    playImageSwapAnimation(document.getElementById(isLightboxOpen() ? "lightbox-image" : "gallery-main-image"), direction);
  }
  trackAnalyticsEvent("vehicle_image_selected", {
    vehicle_id: currentVehicle.id,
    image_view: galleryView,
    image_index: galleryIndex,
    selection_method: selectionMethod
  });
}

/**
 * FUNCTION: switchGalleryView(view)
 * PURPOSE: Switches between Exterior and Interior photos (first photo).
 * USER ACTION: Exterior / Interior tab.
 * EXPECTED ANALYTICS EVENT: vehicle_image_selected with
 *   selection_method "view_tab" (a different photo is now shown).
 *   Same view clicked again or interior unavailable -> nothing.
 */
function switchGalleryView(view) {
  if (view === galleryView || getPhotosByView(currentVehicle, view).length === 0) {
    return;
  }
  galleryView = view;
  galleryIndex = -1; // forces selectGalleryImage(0) to count as a change
  selectGalleryImage(0, "view_tab");
}

/** FUNCTION: isLightboxOpen() - true while the enlarged viewer is open. */
function isLightboxOpen() {
  var lightbox = document.getElementById("gallery-lightbox");
  return Boolean(lightbox && !lightbox.hidden);
}

/**
 * FUNCTION: openGalleryLightbox(openerButton)
 *
 * PURPOSE: Opens the enlarged image viewer on the current photo.
 * USER ACTION: "Enlarge" button or clicking the main photo.
 * EXPECTED WEBSITE RESULT: full-screen dark viewer with previous/next
 *   arrows, counter and close button. Escape closes it; Left/Right keys
 *   change the photo.
 * EXPECTED ANALYTICS EVENT: vehicle_gallery_opened
 * EVENT PARAMETERS: vehicle_id, image_view, image_index.
 * EVENT COUNT: +1 per opening. PAGE VIEWS: unchanged (no virtual page).
 * ENGAGEMENT: none directly.
 * HOW TO VERIFY: click Enlarge: one vehicle_gallery_opened.
 * FAILURE CONDITIONS: viewer markup missing -> nothing opens, no event.
 * DOUBLE COUNTING RISK: opening is one listener per button; arrow clicks
 *   inside send vehicle_image_selected, never another "opened".
 */
function openGalleryLightbox(openerButton) {
  showLightboxImage();
  if (!openPanel("gallery-lightbox", openerButton)) {
    return;
  }
  trackAnalyticsEvent("vehicle_gallery_opened", {
    vehicle_id: currentVehicle.id,
    image_view: galleryView,
    image_index: galleryIndex
  });
}

/** FUNCTION: showLightboxImage() - draws the current photo in the viewer. Analytics: None. */
function showLightboxImage() {
  var photos = getPhotosByView(currentVehicle, galleryView);
  var photo = photos[galleryIndex];
  var image = document.getElementById("lightbox-image");
  image.src = getPhotoUrl(photo, 1920);
  image.alt = photo.alt;
  document.getElementById("lightbox-caption").innerHTML = (galleryIndex + 1) + " / " + photos.length + " &middot; " + buildCreditHtml(photo);
}

/**
 * FUNCTION: stepLightbox(direction, method)
 * PURPOSE: Previous (-1) / next (+1) photo in the viewer, wrapping.
 * EXPECTED ANALYTICS EVENT: vehicle_image_selected via
 *   selectGalleryImage (selection_method "lightbox_next", "lightbox_prev"
 *   or "keyboard"). Only one photo in the view -> no change, no event.
 */
function stepLightbox(direction, method) {
  var count = getPhotosByView(currentVehicle, galleryView).length;
  if (count < 2) {
    return;
  }
  gallerySlideDirection = direction;
  selectGalleryImage((galleryIndex + direction + count) % count, method);
}

/**
 * FUNCTION: initVehiclePage()
 * PURPOSE: On vehicle.html, reads ?id=, draws the page and connects the
 *   gallery controls. EXPECTED ANALYTICS EFFECT: view_item once.
 */
function initVehiclePage() {
  if (document.body.getAttribute("data-page") !== "vehicle") {
    return;
  }
  var vehicle = getVehicleById(getQueryParameter("id"));
  if (!vehicle) {
    document.getElementById("vehicle-not-found").hidden = false;
    return;
  }
  renderVehicleDetails(vehicle);

  document.getElementById("gallery-tab-exterior").addEventListener("click", function () { switchGalleryView("exterior"); });
  document.getElementById("gallery-tab-interior").addEventListener("click", function () { switchGalleryView("interior"); });
  document.getElementById("gallery-thumbs").addEventListener("click", function (event) {
    var thumb = event.target.closest("[data-gallery-index]");
    if (thumb) {
      selectGalleryImage(Number(thumb.getAttribute("data-gallery-index")), "thumbnail");
    }
  });
  document.getElementById("gallery-enlarge-btn").addEventListener("click", function () { openGalleryLightbox(this); });
  document.getElementById("gallery-main-button").addEventListener("click", function () { openGalleryLightbox(this); });
  document.getElementById("lightbox-prev").addEventListener("click", function () { stepLightbox(-1, "lightbox_prev"); });
  document.getElementById("lightbox-next").addEventListener("click", function () { stepLightbox(1, "lightbox_next"); });
  document.addEventListener("keydown", function (event) {
    if (!isLightboxOpen()) {
      return;
    }
    if (event.key === "ArrowRight") { stepLightbox(1, "keyboard"); }
    if (event.key === "ArrowLeft") { stepLightbox(-1, "keyboard"); }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.addEventListener("click", handleVehicleSelect);
  initVehiclePage();
});
