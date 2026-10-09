const NASA_APOD_URL =
  "https://api.nasa.gov/planetary/apod";

const LAUNCHES_URL =
  "https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=10&format=json&ordering=net";

const PLANETS_URL =
  "https://solar-system-opendata-proxy.vercel.app/api/planets";



const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".app-section");
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");

function showSection(sectionId) {
  sections.forEach(function (section) {
    if (section.id === sectionId) {
      section.classList.remove("hidden");
    } else {
      section.classList.add("hidden");
    }
  });

  navLinks.forEach(function (link) {
    if (link.dataset.section === sectionId) {
      link.classList.add("bg-blue-500/10", "text-blue-400");
      link.classList.remove("text-slate-300");
    } else {
      link.classList.remove("bg-blue-500/10", "text-blue-400");
      link.classList.add("text-slate-300");
    }
  });

  if (window.innerWidth < 1024) {
    sidebar.classList.add("-translate-x-full");
  }
}

navLinks.forEach(function (link) {
  link.addEventListener("click", function (event) {
    event.preventDefault();

    const sectionId = link.dataset.section;

    showSection(sectionId);
  });
});

sidebarToggle.addEventListener("click", function () {
  sidebar.classList.toggle("-translate-x-full");
});


// Today in Space - NASA APOD

const apodDate = document.getElementById("apod-date");
const apodDateInput = document.getElementById("apod-date-input");
const loadDateBtn = document.getElementById("load-date-btn");
const todayApodBtn = document.getElementById("today-apod-btn");

const apodImage = document.getElementById("apod-image");
const apodLoading = document.getElementById("apod-loading");

const apodTitle = document.getElementById("apod-title");
const apodDateDetail = document.getElementById("apod-date-detail");
const apodExplanation = document.getElementById("apod-explanation");
const apodCopyright = document.getElementById("apod-copyright");

const apodDateInfo = document.getElementById("apod-date-info");
const apodMediaType = document.getElementById("apod-media-type");


function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function formatDate(date) {
  const dateObject = new Date(date + "T00:00:00");

  return dateObject.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}


async function loadApod(date) {
  try {
    apodLoading.classList.remove("hidden");
    apodImage.classList.add("hidden");

    const response = await fetch(
      `${NASA_APOD_URL}?api_key=DEMO_KEY&date=${date}`
    );

    if (!response.ok) {
      throw new Error("NASA API request failed");
    }

    const data = await response.json();

    displayApod(data);
  } catch (error) {
    console.log(error);

    apodTitle.textContent = "Unable to load NASA image";
    apodExplanation.textContent =
      "Something went wrong while loading the Astronomy Picture of the Day.";
  } finally {
    apodLoading.classList.add("hidden");
  }
}


function displayApod(data) {
  apodDate.textContent =
    `Astronomy Picture of the Day - ${formatDate(data.date)}`;

  apodTitle.textContent = data.title;

  apodDateDetail.innerHTML =
    `<i class="far fa-calendar mr-2"></i>${data.date}`;

  apodExplanation.textContent = data.explanation;

  if (data.copyright) {
    apodCopyright.textContent = `© ${data.copyright}`;
  } else {
    apodCopyright.textContent = "© NASA";
  }

  apodDateInfo.textContent = data.date;

  apodMediaType.textContent =
    data.media_type === "image" ? "Image" : "Video";

  if (data.media_type === "image") {
    apodImage.src = data.url;
    apodImage.alt = data.title;

    apodImage.classList.remove("hidden");
  } else {
    apodImage.src = "img/launch-placeholder.png";
    apodImage.alt = "NASA APOD video";

    apodImage.classList.remove("hidden");
  }
}


loadDateBtn.addEventListener("click", function () {
  const selectedDate = apodDateInput.value;

  if (selectedDate) {
    loadApod(selectedDate);
  }
});


todayApodBtn.addEventListener("click", function () {
  const today = getTodayDate();

  apodDateInput.value = today;

  loadApod(today);
});


apodDateInput.max = getTodayDate();


// Launches - SpaceDevs

const featuredLaunch = document.getElementById("featured-launch");
const launchesGrid = document.getElementById("launches-grid");

const launchesCount = document.getElementById("launches-count");
const launchesCountMobile =
  document.getElementById("launches-count-mobile");


function formatLaunchDate(date) {
  if (!date) {
    return "TBD";
  }

  const dateObject = new Date(date);

  return dateObject.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}


function formatLaunchTime(date) {
  if (!date) {
    return "TBD";
  }

  const dateObject = new Date(date);

  return dateObject.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC"
  }) + " UTC";
}


function getLaunchLocation(launch) {
  if (
    launch.pad &&
    launch.pad.location &&
    launch.pad.location.name
  ) {
    return launch.pad.location.name;
  }

  return "Unknown location";
}


function getLaunchCountry(launch) {
  if (
    launch.pad &&
    launch.pad.location &&
    launch.pad.location.country &&
    launch.pad.location.country.name
  ) {
    return launch.pad.location.country.name;
  }

  return "Unknown";
}


function getRocketName(launch) {
  if (
    launch.rocket &&
    launch.rocket.configuration
  ) {
    return (
      launch.rocket.configuration.full_name ||
      launch.rocket.configuration.name ||
      "Unknown rocket"
    );
  }

  return "Unknown rocket";
}


function getProviderName(launch) {
  if (launch.launch_service_provider) {
    return launch.launch_service_provider.name;
  }

  return "Unknown provider";
}


function getLaunchStatus(launch) {
  if (launch.status) {
    return launch.status.abbrev || launch.status.name;
  }

  return "TBD";
}


function getLaunchImage(launch) {
  if (launch.image) {
    return launch.image;
  }

  return "";
}


function createFeaturedLaunch(launch) {
  const date = formatLaunchDate(launch.net);
  const time = formatLaunchTime(launch.net);

  const provider = getProviderName(launch);
  const rocket = getRocketName(launch);
  const location = getLaunchLocation(launch);
  const country = getLaunchCountry(launch);
  const status = getLaunchStatus(launch);

  let description = "No mission description available.";

  if (launch.mission && launch.mission.description) {
    description = launch.mission.description;
  }

  let imageHTML = `
    <div class="flex items-center justify-center h-full min-h-[400px] bg-slate-800">
      <i class="fas fa-rocket text-9xl text-slate-700/50"></i>
    </div>
  `;

  if (getLaunchImage(launch)) {
    imageHTML = `
      <img
        src="${getLaunchImage(launch)}"
        alt="${launch.name}"
        class="w-full h-full object-cover"
      />
    `;
  }

  featuredLaunch.innerHTML = `
    <div
      class="relative bg-slate-800/30 border border-slate-700 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all"
    >
      <div
        class="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
      ></div>

      <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">

        <div class="flex flex-col justify-between">
          <div>

            <div class="flex items-center gap-3 mb-4">

              <span
                class="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold flex items-center gap-2"
              >
                <i class="fas fa-star"></i>
                Featured Launch
              </span>

              <span
                class="px-4 py-1.5 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold"
              >
                ${status}
              </span>

            </div>

            <h3 class="text-3xl font-bold mb-3 leading-tight">
              ${launch.name}
            </h3>

            <div
              class="flex flex-col xl:flex-row xl:items-center gap-4 mb-6 text-slate-400"
            >
              <div class="flex items-center gap-2">
                <i class="fas fa-building"></i>
                <span>${provider}</span>
              </div>

              <div class="flex items-center gap-2">
                <i class="fas fa-rocket"></i>
                <span>${rocket}</span>
              </div>
            </div>

            <div class="grid xl:grid-cols-2 gap-4 mb-6">

              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <i class="fas fa-calendar"></i>
                  Launch Date
                </p>
                <p class="font-semibold">${date}</p>
              </div>

              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <i class="fas fa-clock"></i>
                  Launch Time
                </p>
                <p class="font-semibold">${time}</p>
              </div>

              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <i class="fas fa-map-marker-alt"></i>
                  Location
                </p>
                <p class="font-semibold text-sm">${location}</p>
              </div>

              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <i class="fas fa-globe"></i>
                  Country
                </p>
                <p class="font-semibold">${country}</p>
              </div>

            </div>

            <p class="text-slate-300 leading-relaxed mb-6">
              ${description}
            </p>

          </div>

          <div class="flex flex-col md:flex-row gap-3">

            <button
              class="flex-1 self-start md:self-center px-6 py-3 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <i class="fas fa-info-circle"></i>
              View Full Details
            </button>

            <div class="icons self-end md:self-center">

              <button
                class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"
              >
                <i class="far fa-heart"></i>
              </button>

              <button
                class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"
              >
                <i class="fas fa-bell"></i>
              </button>

            </div>

          </div>
        </div>

        <div class="relative">

          <div
            class="relative h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-900/50"
          >

            ${imageHTML}

            <div
              class="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent"
            ></div>

          </div>

        </div>

      </div>
    </div>
  `;
}


function createLaunchCard(launch) {
  const date = formatLaunchDate(launch.net);
  const time = formatLaunchTime(launch.net);

  const provider = getProviderName(launch);
  const rocket = getRocketName(launch);
  const location = getLaunchLocation(launch);
  const status = getLaunchStatus(launch);

  let imageHTML = `
    <div
      class="relative h-48 bg-slate-900/50 flex items-center justify-center"
    >
      <i class="fas fa-rocket text-5xl text-slate-700"></i>

      <div class="absolute top-3 right-3">
        <span
          class="px-3 py-1 bg-blue-500/90 text-white backdrop-blur-sm rounded-full text-xs font-semibold"
        >
          ${status}
        </span>
      </div>
    </div>
  `;

  if (getLaunchImage(launch)) {
    imageHTML = `
      <div class="relative h-48 bg-slate-900/50">
        <img
          src="${getLaunchImage(launch)}"
          alt="${launch.name}"
          class="w-full h-full object-cover"
        />

        <div class="absolute top-3 right-3">
          <span
            class="px-3 py-1 bg-blue-500/90 text-white backdrop-blur-sm rounded-full text-xs font-semibold"
          >
            ${status}
          </span>
        </div>
      </div>
    `;
  }

  return `
    <div
      class="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group cursor-pointer"
    >

      ${imageHTML}

      <div class="p-5">

        <div class="mb-3">

          <h4
            class="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors"
          >
            ${launch.name}
          </h4>

          <p class="text-sm text-slate-400 flex items-center gap-2">
            <i class="fas fa-building text-xs"></i>
            ${provider}
          </p>

        </div>

        <div class="space-y-2 mb-4">

          <div class="flex items-center gap-2 text-sm">
            <i class="fas fa-calendar text-slate-500 w-4"></i>
            <span class="text-slate-300">${date}</span>
          </div>

          <div class="flex items-center gap-2 text-sm">
            <i class="fas fa-clock text-slate-500 w-4"></i>
            <span class="text-slate-300">${time}</span>
          </div>

          <div class="flex items-center gap-2 text-sm">
            <i class="fas fa-rocket text-slate-500 w-4"></i>
            <span class="text-slate-300">${rocket}</span>
          </div>

          <div class="flex items-center gap-2 text-sm">
            <i class="fas fa-map-marker-alt text-slate-500 w-4"></i>
            <span class="text-slate-300 line-clamp-1">${location}</span>
          </div>

        </div>

        <div
          class="flex items-center gap-2 pt-4 border-t border-slate-700"
        >

          <button
            class="flex-1 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-sm font-semibold"
          >
            Details
          </button>

          <button
            class="px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
          >
            <i class="far fa-heart"></i>
          </button>

        </div>

      </div>
    </div>
  `;
}


async function loadLaunches() {
  try {
    const response = await fetch(LAUNCHES_URL);

    if (!response.ok) {
      throw new Error("Launches API request failed");
    }

    const data = await response.json();

    const launches = data.results || [];

    launchesCount.textContent = `${launches.length} Launches`;
    launchesCountMobile.textContent = launches.length;

    if (launches.length === 0) {
      launchesGrid.innerHTML = `
        <p class="text-slate-400 col-span-full">
          No upcoming launches found.
        </p>
      `;

      return;
    }

    createFeaturedLaunch(launches[0]);

    launchesGrid.innerHTML = "";

    launches.forEach(function (launch) {
      launchesGrid.innerHTML += createLaunchCard(launch);
    });

  } catch (error) {
    console.log(error);

    launchesGrid.innerHTML = `
      <p class="text-red-400 col-span-full">
        Unable to load upcoming launches.
      </p>
    `;
  }
}


// Planets

const planetCards = document.querySelectorAll(".planet-card");

const planetDetailImage =
  document.getElementById("planet-detail-image");

const planetDetailName =
  document.getElementById("planet-detail-name");

const planetDetailDescription =
  document.getElementById("planet-detail-description");

const planetDistance =
  document.getElementById("planet-distance");

const planetRadius =
  document.getElementById("planet-radius");

const planetMass =
  document.getElementById("planet-mass");

const planetDensity =
  document.getElementById("planet-density");

const planetOrbitalPeriod =
  document.getElementById("planet-orbital-period");

const planetRotation =
  document.getElementById("planet-rotation");

const planetMoons =
  document.getElementById("planet-moons");

const planetGravity =
  document.getElementById("planet-gravity");

const planetDiscoverer =
  document.getElementById("planet-discoverer");

const planetDiscoveryDate =
  document.getElementById("planet-discovery-date");

const planetBodyType =
  document.getElementById("planet-body-type");

const planetVolume =
  document.getElementById("planet-volume");

const planetFacts =
  document.getElementById("planet-facts");

const planetPerihelion =
  document.getElementById("planet-perihelion");

const planetAphelion =
  document.getElementById("planet-aphelion");

const planetEccentricity =
  document.getElementById("planet-eccentricity");

const planetInclination =
  document.getElementById("planet-inclination");

const planetAxialTilt =
  document.getElementById("planet-axial-tilt");

const planetTemp =
  document.getElementById("planet-temp");

const planetEscape =
  document.getElementById("planet-escape");

const planetComparisonTbody =
  document.getElementById("planet-comparison-tbody");


let planets = [];


function formatNumber(number) {
  if (number === undefined || number === null) {
    return "N/A";
  }

  return Number(number).toLocaleString("en-US");
}


function getPlanetImage(planet) {
  const images = {
    Mercury: "img/mercury.png",
    Venus: "img/venus.png",
    Earth: "img/earth.png",
    Mars: "img/mars.png",
    Jupiter: "img/jupiter.png",
    Saturn: "img/saturn.png",
    Uranus: "img/uranus.png",
    Neptune: "img/neptune.png"
  };

  return images[planet.englishName];
}


function getMass(planet) {
  if (!planet.mass) {
    return "N/A";
  }

  return `${planet.mass.massValue} × 10${toSuperscript(planet.mass.massExponent)} kg`;
}


function toSuperscript(number) {
  const numbers = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
    "-": "⁻"
  };

  return String(number)
    .split("")
    .map(function (char) {
      return numbers[char] || char;
    })
    .join("");
}


function displayPlanet(planet) {
  const name = planet.englishName || planet.name;

  planetDetailName.textContent = name;

  planetDetailDescription.textContent =
    planet.description || "No description available.";

  planetDetailImage.src =
    getPlanetImage(planet) || "img/earth.png";

  planetDetailImage.alt = name;


  // Main information

  planetDistance.textContent =
    planet.semimajorAxis
      ? `${formatNumber(planet.semimajorAxis)} km`
      : "N/A";

  planetRadius.textContent =
    planet.meanRadius
      ? `${formatNumber(planet.meanRadius)} km`
      : "N/A";

  planetMass.textContent = getMass(planet);

  planetDensity.textContent =
    planet.density
      ? `${planet.density} g/cm³`
      : "N/A";

  planetOrbitalPeriod.textContent =
    planet.sideralOrbit
      ? `${formatNumber(planet.sideralOrbit)} days`
      : "N/A";

  planetRotation.textContent =
    planet.sideralRotation
      ? `${planet.sideralRotation} hours`
      : "N/A";

  planetMoons.textContent =
    planet.moons
      ? planet.moons.length
      : "0";

  planetGravity.textContent =
    planet.gravity
      ? `${planet.gravity} m/s²`
      : "N/A";


  // Discovery

  planetDiscoverer.textContent =
    planet.discoveredBy || "Known since antiquity";

  planetDiscoveryDate.textContent =
    planet.discoveryDate || "Ancient";

  planetBodyType.textContent =
    planet.bodyType || "Planet";

  if (planet.vol) {
    planetVolume.textContent =
      `${planet.vol.volValue} × 10${toSuperscript(planet.vol.volExponent)} km³`;
  } else {
    planetVolume.textContent = "N/A";
  }


  // Orbital characteristics

  planetPerihelion.textContent =
    planet.perihelion
      ? `${formatNumber(planet.perihelion)} km`
      : "N/A";

  planetAphelion.textContent =
    planet.aphelion
      ? `${formatNumber(planet.aphelion)} km`
      : "N/A";

  planetEccentricity.textContent =
    planet.eccentricity ?? "N/A";

  planetInclination.textContent =
    planet.inclination !== undefined
      ? `${planet.inclination}°`
      : "N/A";

  planetAxialTilt.textContent =
    planet.axialTilt !== undefined
      ? `${planet.axialTilt}°`
      : "N/A";

  planetTemp.textContent =
    planet.avgTemp !== undefined
      ? `${planet.avgTemp} K`
      : "N/A";

  planetEscape.textContent =
    planet.escape
      ? `${planet.escape / 1000} km/s`
      : "N/A";


  displayPlanetFacts(planet);
}


function displayPlanetFacts(planet) {
  const facts = [];

  if (planet.type) {
    facts.push(`Planet type: ${planet.type}`);
  }

  if (planet.moons) {
    facts.push(`Has ${planet.moons.length} known moons`);
  } else {
    facts.push("Has no known moons");
  }

  if (planet.gravity) {
    facts.push(`Surface gravity: ${planet.gravity} m/s²`);
  }

  if (planet.avgTemp !== undefined) {
    facts.push(`Average temperature: ${planet.avgTemp} K`);
  }

  planetFacts.innerHTML = "";

  facts.forEach(function (fact) {
    planetFacts.innerHTML += `
      <li class="flex items-start">
        <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
        <span class="text-slate-300">${fact}</span>
      </li>
    `;
  });
}


function updatePlanetComparison() {
  planetComparisonTbody.innerHTML = "";

  planets.forEach(function (planet) {
    const name = planet.englishName || planet.name;

    const distance =
      planet.semimajorAxis
        ? (planet.semimajorAxis / 149597870.7).toFixed(2)
        : "N/A";

    const diameter =
      planet.meanRadius
        ? Math.round(planet.meanRadius * 2).toLocaleString("en-US")
        : "N/A";

    let massEarth = "N/A";

    if (planet.mass) {
      const earthMass = 5.9722e24;
      const mass =
        planet.mass.massValue *
        Math.pow(10, planet.mass.massExponent);

      massEarth = (mass / earthMass).toFixed(3);
    }

    const orbitalPeriod =
      planet.sideralOrbit
        ? `${planet.sideralOrbit} days`
        : "N/A";

    const moons =
      planet.moons
        ? planet.moons.length
        : "0";

    const type =
      planet.type ||
      planet.bodyType ||
      "Planet";

    planetComparisonTbody.innerHTML += `
      <tr class="hover:bg-slate-800/30 transition-colors">

        <td
          class="px-4 md:px-6 py-3 md:py-4 sticky left-0 bg-slate-800 z-10"
        >
          <div class="flex items-center space-x-2 md:space-x-3">

            <img
              src="${getPlanetImage(planet)}"
              class="w-6 h-6 md:w-8 md:h-8 object-contain"
              alt="${name}"
            />

            <span
              class="font-semibold text-sm md:text-base whitespace-nowrap"
            >
              ${name}
            </span>

          </div>
        </td>

        <td
          class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap"
        >
          ${distance}
        </td>

        <td
          class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap"
        >
          ${diameter}
        </td>

        <td
          class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap"
        >
          ${massEarth}
        </td>

        <td
          class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap"
        >
          ${orbitalPeriod}
        </td>

        <td
          class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap"
        >
          ${moons}
        </td>

        <td
          class="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap"
        >
          <span
            class="px-2 py-1 rounded text-xs bg-blue-500/50 text-blue-200"
          >
            ${type}
          </span>
        </td>

      </tr>
    `;
  });
}


async function loadPlanets() {
  try {
    const response = await fetch(PLANETS_URL);

    if (!response.ok) {
      throw new Error("Planets API request failed");
    }

    const data = await response.json();

    planets = data.bodies.filter(function (body) {
      return body.isPlanet;
    });

    updatePlanetComparison();

    const earth = planets.find(function (planet) {
      return planet.englishName === "Earth";
    });

    if (earth) {
      displayPlanet(earth);
    }

  } catch (error) {
    console.log(error);
  }
}


planetCards.forEach(function (card) {
  card.addEventListener("click", function () {

    const planetId = card.dataset.planetId;

    const planet = planets.find(function (item) {

      if (planetId === "mercury") {
        return item.englishName === "Mercury";
      }

      return item.englishName.toLowerCase() === planetId;

    });

    if (planet) {
      displayPlanet(planet);
    }
  });
});


// Start Application

showSection("today-in-space");

loadApod(getTodayDate());

loadLaunches();

loadPlanets();