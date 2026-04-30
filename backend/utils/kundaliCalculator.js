// backend/utils/kundaliCalculator.js
import { generateKundaliEngine } from "./vedicEngine.js";
import { RASHI_EN, NAKSHATRA_NE, RASHI_NE } from "./vedicConstants.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const NepaliDatePkg = require("nepali-date-converter");
const NepaliDate = NepaliDatePkg.NepaliDate || NepaliDatePkg.default || NepaliDatePkg;

export const calculateKundali = (data) => {
  console.log("🪐 Accurate calculateKundali called with data:", data);
  
  const { name, birthDate, birthTime, birthPlace, gender, latitude, longitude } = data;
  
  // Parse birth date and time robustly
  let year, month, day;
  if (typeof birthDate === 'string') {
    [year, month, day] = birthDate.split('-').map(Number);
  } else if (birthDate instanceof Date) {
    // Note: YYYY-MM-DD strings are often parsed as UTC by new Date()
    // To preserve the calendar date, we use UTC methods.
    year = birthDate.getUTCFullYear();
    month = birthDate.getUTCMonth() + 1;
    day = birthDate.getUTCDate();
  } else {
    const d = new Date(birthDate);
    year = d.getUTCFullYear();
    month = d.getUTCMonth() + 1;
    day = d.getUTCDate();
  }
  
  let hours = 0, minutes = 0;
  if (birthTime.includes(':')) {
    [hours, minutes] = birthTime.split(':').map(Number);
  } else {
    hours = parseInt(birthTime) || 0;
  }

  // Interpretation: birthDate and birthTime are in Nepal Time (NPT, UTC+5:45)
  // We convert to UTC by creating a Date at that "wall time" and subtracting 5.75 hours
  // Using Date.UTC gives us the epoch ms for that time as if it were UTC
  const nptEpochMs = Date.UTC(year, month - 1, day, hours, minutes, 0, 0);
  const utcMs = nptEpochMs - (5.75 * 3600 * 1000);
  const birthUtc = new Date(utcMs);

  const result = generateKundaliEngine({
    birthUtc,
    latitude: latitude || 27.7172,
    longitude: longitude || 85.3240
  });

  // Convert to BS for birth details (using the wall time date)
  const wallTimeDate = new Date(year, month - 1, day, hours, minutes);
  const nDate = new NepaliDate(wallTimeDate);
  const bsDateStr = `${nDate.getYear()}-${String(nDate.getMonth() + 1).padStart(2, '0')}-${String(nDate.getDate()).padStart(2, '0')}`;

  // Map to the format expected by the current frontend/model
  const formattedPlanets = result.planets.map(p => ({
    name: p.key,
    symbol: getPlanetSymbol(p.key),
    color: getPlanetColor(p.key),
    longitude: p.longitude,
    rashi: RASHI_NE[p.rashi],
    english: RASHI_EN[p.rashi],
    degree: formatDegree(p.degInRashi),
    nakshatra: NAKSHATRA_NE[p.nakshatra],
    pada: p.pada,
    house: p.house,
    retrograde: p.retrograde,
    navamsaRashi: RASHI_NE[result.charts.D9[p.key]],
    strength: 50 // Simplified strength for now
  }));

  const formattedDashas = result.vimshottari.mahaDashas.map(d => ({
    planet: d.lord,
    period: `${d.startDate.getFullYear()}-${d.endDate.getFullYear()}`,
    isCurrent: new Date() >= d.startDate && new Date() < d.endDate,
    years: (d.endDate - d.startDate) / (365.2425 * 86400 * 1000)
  }));

  return {
    name,
    birthDetails: {
      date: birthDate,
      time: birthTime,
      bsDate: bsDateStr,
      bsMonth: nDate.getMonth() + 1,
      bsYear: nDate.getYear(),
      place: birthPlace,
      coordinates: {
        lat: latitude,
        lng: longitude
      }
    },
    gender,
    ascendant: {
      name: RASHI_NE[result.lagnaRashi],
      english: RASHI_EN[result.lagnaRashi],
      longitude: result.lagnaLongitude,
    },
    moonSign: {
      name: RASHI_NE[result.moonRashi],
      english: RASHI_EN[result.moonRashi],
      longitude: result.planets.find(p => p.key === "Moon").longitude
    },
    planets: formattedPlanets,
    dashas: formattedDashas,
    nameInitials: getRashiNameInitials(RASHI_EN[result.moonRashi]),
    chartData: {
      ...result,
      // Include any extra fields needed by the UI
    }
  };
};

function formatDegree(deg) {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}°${m}'`;
}

function getPlanetSymbol(key) {
  const symbols = {
    Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
    Jupiter: '♃', Venus: '♀', Saturn: '♄',
    Rahu: '☊', Ketu: '☋'
  };
  return symbols[key] || '★';
}

function getPlanetColor(key) {
  const colors = {
    Sun: 'text-yellow-500', Moon: 'text-gray-300', Mars: 'text-red-500',
    Mercury: 'text-green-500', Jupiter: 'text-orange-400', Venus: 'text-pink-400',
    Saturn: 'text-blue-400', Rahu: 'text-purple-400', Ketu: 'text-indigo-400'
  };
  return colors[key] || 'text-white';
}

function getRashiNameInitials(rashiEn) {
  const initialsMap = {
    'Aries': ['A', 'L', 'E', 'Chu', 'Che', 'Cho'],
    'Taurus': ['I', 'U', 'E', 'O', 'Va', 'Vi'],
    'Gemini': ['Ka', 'Ki', 'Ku', 'Gha', 'Ng', 'Chha'],
    'Cancer': ['Hi', 'Hu', 'He', 'Ho', 'Da', 'Di'],
    'Leo': ['Ma', 'Mi', 'Mu', 'Me', 'Mo', 'Ta'],
    'Virgo': ['To', 'Pa', 'Pi', 'Pu', 'Sha', 'Na'],
    'Libra': ['Ra', 'Ri', 'Ru', 'Re', 'Ro', 'Ta'],
    'Scorpio': ['To', 'Na', 'Ni', 'Nu', 'Ne', 'No'],
    'Sagittarius': ['Ye', 'Yo', 'Bha', 'Bhi', 'Bhu', 'Dha'],
    'Capricorn': ['Bho', 'Ja', 'Ji', 'Ju', 'Je', 'Jo'],
    'Aquarius': ['Gu', 'Ge', 'Go', 'Sa', 'Si', 'Su'],
    'Pisces': ['Di', 'Du', 'Tha', 'Jha', 'Tra', 'De']
  };
  return initialsMap[rashiEn] || ['A', 'B', 'C'];
}

