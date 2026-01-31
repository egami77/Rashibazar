// backend/utils/kundaliCalculator.js
import { NEPAL_CITIES, RASHIS, PLANETS } from "./astrologyConstants.js";

const NEPAL_TIMEZONE_OFFSET = 5.75;

export const calculateKundali = (data) => {
  console.log("🪐 calculateKundali called with data:", data);
  
  const { name, birthDate, birthTime, birthPlace, gender, latitude, longitude } = data;
  
  // Parse birth details - Handle both Date object and string
  let year, month, day;
  
  if (birthDate instanceof Date) {
    year = birthDate.getFullYear();
    month = birthDate.getMonth() + 1;
    day = birthDate.getDate();
  } else if (typeof birthDate === 'string') {
    // Handle string format (YYYY-MM-DD)
    const dateParts = birthDate.split('-');
    if (dateParts.length === 3) {
      year = parseInt(dateParts[0]);
      month = parseInt(dateParts[1]);
      day = parseInt(dateParts[2]);
    } else {
      throw new Error("Invalid date format. Use YYYY-MM-DD");
    }
  } else {
    throw new Error("Invalid birthDate. Expected Date object or string (YYYY-MM-DD)");
  }
  
  console.log("📅 Parsed date:", { year, month, day });
  
  // Parse time
  let hours, minutes;
  if (birthTime.includes(':')) {
    const timeParts = birthTime.split(':');
    hours = parseInt(timeParts[0]);
    minutes = parseInt(timeParts[1]) || 0;
  } else {
    hours = parseInt(birthTime);
    minutes = 0;
  }
  
  if (isNaN(hours) || isNaN(minutes)) {
    throw new Error(`Invalid time format: ${birthTime}. Use HH:MM format`);
  }
  
  // Format time for display
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  const formattedTime = `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  
  // Convert to Bikram Sambat (simplified)
  const bsDate = {
    year: year + 57,
    month: month,
    day: day
  };
  
  const bsMonthName = getBSMonthName(bsDate.month);
  
  // Find coordinates
  let finalLat = latitude;
  let finalLng = longitude;
  
  if (!latitude || !longitude) {
    const city = NEPAL_CITIES.find(c => c.name === birthPlace);
    if (city) {
      finalLat = city.lat;
      finalLng = city.lng;
    } else {
      finalLat = 27.7172;
      finalLng = 85.3240;
    }
  }
  
  // Calculate Julian Day
  const decimalHours = hours + minutes / 60;
  const jd = calculateJulianDay(year, month, day, decimalHours);
  
  // Calculate Ayanamsa
  const ayanamsa = calculateLahiriAyanamsa(jd);
  
  // Calculate Sidereal Time
  const siderealTime = calculateSiderealTime(jd, finalLng);
  
  // Calculate Ascendant
  const ascendantLongitude = calculateAscendant(siderealTime, finalLat, ayanamsa);
  const ascendantRashi = getRashiFromLongitude(ascendantLongitude);
  
  // Calculate planetary positions
  const planetaryPositions = calculatePlanetaryPositions(jd, ayanamsa);
  
  // Calculate houses
  const houses = calculateHouses(ascendantLongitude);
  
  // Process planets
  const planets = planetaryPositions.map(pos => {
    const rashi = getRashiFromLongitude(pos.longitude);
    const { nakshatra, pada, nakshatraLord } = getNakshatraFromLongitude(pos.longitude);
    const degree = getDegreeInRashi(pos.longitude);
    const house = getHouseForPlanet(pos.longitude, houses);
    const navamsaLong = calculateNavamsa(pos.longitude);
    const navamsaRashi = getRashiFromLongitude(navamsaLong);
    
    const strength = calculatePlanetStrength(pos, house);
    
    return {
      name: pos.name,
      symbol: getPlanetSymbol(pos.name),
      color: getPlanetColor(pos.name),
      longitude: pos.longitude,
      rashi: rashi.name,
      english: rashi.english,
      degree: `${degree.degrees}°${degree.minutes}'`,
      nakshatra: nakshatra.name,
      pada,
      nakshatraLord,
      house,
      retrograde: pos.retrograde,
      navamsaRashi: navamsaRashi.name,
      strength: Math.round(strength)
    };
  });
  
  // Get Moon Rashi
  const moonPlanet = planets.find(p => p.name === 'Moon');
  const moonRashi = moonPlanet ? moonPlanet.rashi : 'Mesha';
  
  // Calculate Dashas
  const dashas = calculateVimshottariDasha(
    moonPlanet ? moonPlanet.longitude : 0,
    new Date(year, month - 1, day)
  );
  
  // Name initials
  const nameInitials = getRashiNameInitials(moonRashi);
  
  console.log("✅ Kundali calculation completed");
  
  return {
    name,
    birthDetails: {
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      time: formattedTime,
      bsDate: `${bsDate.year}-${String(bsDate.month).padStart(2, '0')}-${String(bsDate.day).padStart(2, '0')}`,
      bsMonth: bsMonthName,
      bsYear: bsDate.year,
      place: birthPlace,
      coordinates: {
        lat: finalLat,
        lng: finalLng
      }
    },
    gender,
    ascendant: {
      name: ascendantRashi.name,
      english: ascendantRashi.english,
      symbol: ascendantRashi.symbol,
      longitude: ascendantLongitude,
      lord: ascendantRashi.lord
    },
    moonSign: {
      name: moonRashi,
      english: RASHIS.find(r => r.name === moonRashi)?.english || 'Aries',
      longitude: moonPlanet?.longitude || 0
    },
    planets,
    houses: houses.map((h, i) => ({
      number: i + 1,
      rashi: getRashiFromLongitude(h).name,
      longitude: h,
      cusp: h
    })),
    dashas: dashas.slice(0, 5),
    nameInitials,
    chartData: {
      ascendantLongitude,
      houses,
      planetaryPositions: planetaryPositions.length,
      ayanamsa,
      siderealTime
    }
  };
};

// Helper functions (add these at the bottom of the file)
function calculateJulianDay(year, month, day, decimalHours) {
  const UT = decimalHours - NEPAL_TIMEZONE_OFFSET;
  
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  
  const JD = Math.floor(365.25 * (year + 4716)) + 
            Math.floor(30.6001 * (month + 1)) + 
            day + B - 1524.5 + UT/24;
  
  return JD;
}

function calculateLahiriAyanamsa(JD) {
  const T = (JD - 2451545.0) / 36525;
  return 23.85 + 0.013972222 * (JD - 2451545.0) / 365.25;
}

function calculateSiderealTime(JD, longitude) {
  const T = (JD - 2451545.0) / 36525;
  let GMST = 280.46061837 + 360.98564736629 * (JD - 2451545.0);
  GMST = ((GMST % 360) + 360) % 360;
  const LST = GMST + longitude;
  return ((LST % 360) + 360) % 360;
}

function calculateAscendant(LST, latitude, ayanamsa) {
  const LST_rad = LST * Math.PI / 180;
  const lat_rad = latitude * Math.PI / 180;
  const eps = 23.4397 * Math.PI / 180;
  
  const tanAsc = -Math.cos(LST_rad) / 
                 (Math.sin(eps) * Math.tan(lat_rad) + Math.cos(eps) * Math.sin(LST_rad));
  
  let ascRad = Math.atan(tanAsc);
  if (Math.cos(LST_rad) < 0) ascRad += Math.PI;
  
  let ascDeg = ascRad * 180 / Math.PI;
  ascDeg = ((ascDeg - ayanamsa) % 360 + 360) % 360;
  return ascDeg;
}

function calculatePlanetaryPositions(JD, ayanamsa) {
  const T = (JD - 2451545.0) / 36525;
  const positions = [];
  
  PLANETS.forEach(planet => {
    let longitude;
    let retrograde = false;
    
    switch(planet.id) {
      case 'Su':
        longitude = 280.46646 + 36000.76983 * T;
        break;
      case 'Mo':
        longitude = 218.3165 + 481267.8813 * T;
        break;
      case 'Ma':
        longitude = 355.433 + 19141.696 * T;
        break;
      case 'Me':
        longitude = 252.251 + 149472.515 * T;
        retrograde = Math.random() > 0.7;
        break;
      case 'Ju':
        longitude = 34.351 + 3036.302 * T;
        retrograde = Math.random() > 0.8;
        break;
      case 'Ve':
        longitude = 181.979 + 58519.214 * T;
        retrograde = Math.random() > 0.6;
        break;
      case 'Sa':
        longitude = 50.077 + 1223.511 * T;
        retrograde = Math.random() > 0.9;
        break;
      case 'Ra':
        longitude = 125.044 - 1934.136 * T;
        retrograde = true;
        break;
      case 'Ke':
        longitude = (125.044 - 1934.136 * T + 180) % 360;
        retrograde = true;
        break;
    }
    
    longitude = normalizeAngle(longitude - ayanamsa);
    
    positions.push({
      name: planet.name,
      symbol: planet.symbol,
      longitude,
      retrograde
    });
  });
  
  return positions;
}

function calculateHouses(ascendant) {
  const houses = [];
  for (let i = 0; i < 12; i++) {
    houses.push((ascendant + i * 30) % 360);
  }
  return houses;
}

function getRashiFromLongitude(longitude) {
  const normalizedLong = ((longitude % 360) + 360) % 360;
  const rashiIndex = Math.floor(normalizedLong / 30);
  return RASHIS[rashiIndex] || RASHIS[0];
}

function getNakshatraFromLongitude(longitude) {
  const nakshatras = [
    { name: 'Ashwini', lord: 'Ketu' },
    { name: 'Bharani', lord: 'Venus' },
    { name: 'Krittika', lord: 'Sun' },
    { name: 'Rohini', lord: 'Moon' },
    { name: 'Mrigashira', lord: 'Mars' },
    { name: 'Ardra', lord: 'Rahu' },
    { name: 'Punarvasu', lord: 'Jupiter' },
    { name: 'Pushya', lord: 'Saturn' },
    { name: 'Ashlesha', lord: 'Mercury' },
    { name: 'Magha', lord: 'Ketu' },
    { name: 'Purva Phalguni', lord: 'Venus' },
    { name: 'Uttara Phalguni', lord: 'Sun' },
    { name: 'Hasta', lord: 'Moon' },
    { name: 'Chitra', lord: 'Mars' },
    { name: 'Swati', lord: 'Rahu' },
    { name: 'Vishakha', lord: 'Jupiter' },
    { name: 'Anuradha', lord: 'Saturn' },
    { name: 'Jyeshtha', lord: 'Mercury' },
    { name: 'Mula', lord: 'Ketu' },
    { name: 'Purva Ashadha', lord: 'Venus' },
    { name: 'Uttara Ashadha', lord: 'Sun' },
    { name: 'Shravana', lord: 'Moon' },
    { name: 'Dhanishta', lord: 'Mars' },
    { name: 'Shatabhisha', lord: 'Rahu' },
    { name: 'Purva Bhadrapada', lord: 'Jupiter' },
    { name: 'Uttara Bhadrapada', lord: 'Saturn' },
    { name: 'Revati', lord: 'Mercury' }
  ];
  
  const normalizedLong = ((longitude % 360) + 360) % 360;
  const nakshatraIndex = Math.floor(normalizedLong / (360/27));
  
  return {
    nakshatra: { 
      name: nakshatras[nakshatraIndex]?.name || 'Ashwini', 
      lord: nakshatras[nakshatraIndex]?.lord || 'Ketu' 
    },
    pada: (Math.floor((normalizedLong % (360/27)) / (360/27/4)) + 1),
    nakshatraLord: nakshatras[nakshatraIndex]?.lord || 'Ketu'
  };
}

function getDegreeInRashi(longitude) {
  const degreeInRashi = ((longitude % 360) + 360) % 360 % 30;
  const degrees = Math.floor(degreeInRashi);
  const minutes = Math.floor((degreeInRashi - degrees) * 60);
  return { degrees, minutes };
}

function getHouseForPlanet(planetLong, houses) {
  const normalizedLong = ((planetLong % 360) + 360) % 360;
  
  for (let i = 0; i < houses.length; i++) {
    const startAngle = houses[i];
    const endAngle = houses[(i + 1) % 12];
    
    let start = startAngle;
    let end = endAngle;
    if (end < start) end += 360;
    
    let planetAngle = normalizedLong;
    if (planetAngle < start) planetAngle += 360;
    
    if (planetAngle >= start && planetAngle < end) {
      return i + 1;
    }
  }
  return 1;
}

function calculateNavamsa(longitude) {
  const normalizedLong = ((longitude % 360) + 360) % 360;
  const rashiIndex = Math.floor(normalizedLong / 30);
  const positionInRashi = normalizedLong % 30;
  const navamsaIndex = Math.floor(positionInRashi / (30/9));
  return ((rashiIndex * 9 + navamsaIndex) % 12) * 30;
}

function calculatePlanetStrength(planet, house) {
  let strength = 50;
  
  // House strength
  if ([1, 4, 7, 10].includes(house)) strength += 20;
  if ([5, 9].includes(house)) strength += 15;
  if ([3, 6, 11].includes(house)) strength += 10;
  
  // Retrograde
  if (planet.retrograde) strength -= 10;
  
  // Planet specific
  const planetModifiers = {
    'Sun': 10, 'Moon': 8, 'Mars': -5, 'Mercury': 5,
    'Jupiter': 15, 'Venus': 12, 'Saturn': -10, 'Rahu': -15, 'Ketu': -15
  };
  strength += planetModifiers[planet.name] || 0;
  
  return Math.min(Math.max(strength, 0), 100);
}

function calculateVimshottariDasha(moonLongitude, birthDate) {
  const dashaYears = {
    'Ketu': 7, 'Venus': 20, 'Sun': 6, 'Moon': 10,
    'Mars': 7, 'Rahu': 18, 'Jupiter': 16,
    'Saturn': 19, 'Mercury': 17
  };
  
  const sequence = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  
  // Calculate starting planet
  const nakshatraLength = 360 / 27;
  const moonNakshatra = Math.floor(moonLongitude / nakshatraLength);
  const startPlanetIndex = moonNakshatra % 9;
  
  const dashas = [];
  const now = new Date();
  const birthYear = birthDate.getFullYear();
  
  // Calculate 5 dashas
  for (let i = 0; i < 5; i++) {
    const planetIndex = (startPlanetIndex + i) % 9;
    const planet = sequence[planetIndex];
    const years = dashaYears[planet];
    
    const startYear = birthYear + i * years;
    const endYear = startYear + years;
    
    const isCurrent = now.getFullYear() >= startYear && now.getFullYear() < endYear;
    
    dashas.push({
      planet,
      period: `${startYear}-${endYear}`,
      years,
      isCurrent
    });
  }
  
  return dashas;
}

function getBSMonthName(month) {
  const months = [
    'Baishakh', 'Jestha', 'Ashadh', 'Shrawan',
    'Bhadra', 'Ashwin', 'Kartik', 'Mangsir',
    'Poush', 'Magh', 'Falgun', 'Chaitra'
  ];
  return months[month - 1] || months[0];
}

function getPlanetSymbol(planetName) {
  const symbols = {
    'Sun': '☉', 'Moon': '☽', 'Mars': '♂', 'Mercury': '☿',
    'Jupiter': '♃', 'Venus': '♀', 'Saturn': '♄',
    'Rahu': '☊', 'Ketu': '☋'
  };
  return symbols[planetName] || '★';
}

function getPlanetColor(planetName) {
  const colors = {
    'Sun': 'text-yellow-500',
    'Moon': 'text-gray-300',
    'Mars': 'text-red-500',
    'Mercury': 'text-green-500',
    'Jupiter': 'text-orange-400',
    'Venus': 'text-pink-400',
    'Saturn': 'text-blue-400',
    'Rahu': 'text-purple-400',
    'Ketu': 'text-indigo-400'
  };
  return colors[planetName] || 'text-white';
}

function getRashiNameInitials(rashiName) {
  const initialsMap = {
    'Mesha': ['A', 'L', 'E', 'Chu', 'Che', 'Cho'],
    'Vrishabha': ['I', 'U', 'E', 'O', 'Va', 'Vi'],
    'Mithuna': ['Ka', 'Ki', 'Ku', 'Gha', 'Ng', 'Chha'],
    'Karka': ['Hi', 'Hu', 'He', 'Ho', 'Da', 'Di'],
    'Simha': ['Ma', 'Mi', 'Mu', 'Me', 'Mo', 'Ta'],
    'Kanya': ['To', 'Pa', 'Pi', 'Pu', 'Sha', 'Na'],
    'Tula': ['Ra', 'Ri', 'Ru', 'Re', 'Ro', 'Ta'],
    'Vrishchika': ['To', 'Na', 'Ni', 'Nu', 'Ne', 'No'],
    'Dhanu': ['Ye', 'Yo', 'Bha', 'Bhi', 'Bhu', 'Dha'],
    'Makara': ['Bho', 'Ja', 'Ji', 'Ju', 'Je', 'Jo'],
    'Kumbha': ['Gu', 'Ge', 'Go', 'Sa', 'Si', 'Su'],
    'Meena': ['Di', 'Du', 'Tha', 'Jha', 'Tra', 'De']
  };
  
  return initialsMap[rashiName] || ['A', 'B', 'C', 'D', 'E', 'F'];
}

function normalizeAngle(angle) {
  angle = angle % 360;
  return angle < 0 ? angle + 360 : angle;
}