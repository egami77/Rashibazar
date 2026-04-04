// src/services/astrology.js
// Vedic Astrology calculation utilities for Kundli Matching

// Rashi (Zodiac Signs) in Sanskrit/English
export const RASHIS = [
  "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)",
  "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrishchika (Scorpio)",
  "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"
];

// Nakshatras (27 Lunar Mansions)
export const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Moola", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

// Nakshatra Lords
export const NAKSHATRA_LORDS = [
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
  "Jupiter", "Saturn", "Mercury", "Ketu", "Venus", "Sun",
  "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
  "Jupiter", "Saturn", "Mercury"
];

// ---- Astronomical Calculations ----

function toRadians(deg) { 
  return deg * Math.PI / 180; 
}

function toDegrees(rad) { 
  return rad * 180 / Math.PI; 
}

function normalize360(deg) { 
  return ((deg % 360) + 360) % 360; 
}

function getJulianDay(year, month, day, hour) {
  // Convert to Julian Day Number
  let y = year;
  let m = month;
  if (m <= 2) { 
    y -= 1; 
    m += 12; 
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + hour / 24 + B - 1524.5;
}

function calculateMoonLongitude(dateStr, timeStr) {
  // Parse date and time
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Convert NST (UTC+5:45) to UTC
  const totalMinutes = hours * 60 + minutes - 345; // 5h45m = 345 min
  const utcHours = totalMinutes / 60;
  let utcDay = day;
  let utcMonth = month;
  let utcYear = year;
  
  let adjustedHours = utcHours;
  if (adjustedHours < 0) {
    adjustedHours += 24;
    utcDay -= 1;
    if (utcDay < 1) {
      utcMonth -= 1;
      if (utcMonth < 1) { 
        utcMonth = 12; 
        utcYear -= 1; 
      }
      const daysInMonth = new Date(utcYear, utcMonth, 0).getDate();
      utcDay = daysInMonth;
    }
  } else if (adjustedHours >= 24) {
    adjustedHours -= 24;
    utcDay += 1;
    if (utcDay > new Date(utcYear, utcMonth, 0).getDate()) {
      utcDay = 1;
      utcMonth += 1;
      if (utcMonth > 12) { 
        utcMonth = 1; 
        utcYear += 1; 
      }
    }
  }

  const JD = getJulianDay(utcYear, utcMonth, utcDay, adjustedHours);
  const T = (JD - 2451545.0) / 36525; // Julian centuries from J2000.0

  // Moon's mean longitude (L')
  const Lp = normalize360(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841 - T * T * T * T / 65194000);

  // Moon's mean elongation (D)
  const D = normalize360(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868 - T * T * T * T / 113065000);

  // Sun's mean anomaly (M)
  const M = normalize360(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T * T * T / 24490000);

  // Moon's mean anomaly (M')
  const Mp = normalize360(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699 - T * T * T * T / 14712000);

  // Moon's argument of latitude (F)
  const F = normalize360(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T * T * T / 3526000 + T * T * T * T / 863310000);

  // Additional arguments
  const A1 = normalize360(119.75 + 131.849 * T);
  const A2 = normalize360(53.09 + 479264.290 * T);
  const A3 = normalize360(313.45 + 481266.484 * T);

  const E = 1 - 0.002516 * T - 0.0000074 * T * T;

  // Principal terms for longitude (from Meeus Table 47.A - most significant terms)
  const lonTerms = [
    [0, 0, 1, 0, 6288774],
    [2, 0, -1, 0, 1274027],
    [2, 0, 0, 0, 658314],
    [0, 0, 2, 0, 213618],
    [0, 1, 0, 0, -185116],
    [0, 0, 0, 2, -114332],
    [2, 0, -2, 0, 58793],
    [2, -1, -1, 0, 57066],
    [2, 0, 1, 0, 53322],
    [2, -1, 0, 0, 45758],
    [0, 1, -1, 0, -40923],
    [1, 0, 0, 0, -34720],
    [0, 1, 1, 0, -30383],
    [2, 0, 0, -2, 15327],
    [0, 0, 1, 2, -12528],
    [0, 0, 1, -2, 10980],
    [4, 0, -1, 0, 10675],
    [0, 0, 3, 0, 10034],
    [4, 0, -2, 0, 8548],
    [2, 1, -1, 0, -7888],
    [2, 1, 0, 0, -6766],
    [1, 0, -1, 0, -5163],
    [1, 1, 0, 0, 4987],
    [2, -1, 1, 0, 4036],
    [2, 0, 2, 0, 3994],
    [4, 0, 0, 0, 3861],
    [2, 0, -3, 0, 3665],
    [0, 1, -2, 0, -2689],
    [2, 0, -1, 2, -2602],
    [2, -1, -2, 0, 2390],
    [1, 0, 1, 0, -2348],
    [2, -2, 0, 0, 2236],
    [0, 1, 2, 0, -2120],
    [0, 2, 0, 0, -2069],
    [2, -2, -1, 0, 2048],
    [2, 0, 1, -2, -1773],
    [2, 0, 0, 2, -1595],
    [4, -1, -1, 0, 1215],
    [0, 0, 2, 2, -1110],
    [3, 0, -1, 0, -892],
    [2, 1, 1, 0, -810],
    [4, -1, -2, 0, 759],
    [0, 2, -1, 0, -713],
    [2, 2, -1, 0, -700],
    [2, 1, -2, 0, 691],
    [2, -1, 0, -2, 596],
    [4, 0, 1, 0, 549],
    [0, 0, 4, 0, 537],
    [4, -1, 0, 0, 520],
    [1, 0, -2, 0, -487],
    [2, 1, 0, -2, -399],
    [0, 0, 2, -2, -381],
    [1, 1, 1, 0, 351],
    [3, 0, -2, 0, -340],
    [4, 0, -3, 0, 330],
    [2, -1, 2, 0, 327],
    [0, 2, 1, 0, -323],
    [1, 1, -1, 0, 299],
    [2, 0, 3, 0, 294],
  ];

  let sumL = 0;
  for (const [cD, cM, cMp, cF, coeff] of lonTerms) {
    const arg = toRadians(cD * D + cM * M + cMp * Mp + cF * F);
    let eCorr = 1;
    if (Math.abs(cM) === 1) eCorr = E;
    else if (Math.abs(cM) === 2) eCorr = E * E;
    sumL += coeff * eCorr * Math.sin(arg);
  }

  // Additional corrections
  sumL += 3958 * Math.sin(toRadians(A1));
  sumL += 1962 * Math.sin(toRadians(Lp - F));
  sumL += 318 * Math.sin(toRadians(A2));

  // Moon's ecliptic longitude (tropical)
  const moonLongTropical = normalize360(Lp + sumL / 1000000);

  // Convert tropical to sidereal (Lahiri Ayanamsa)
  // Lahiri Ayanamsa approximation
  const ayanamsa = 23.85 + 0.0137 * (utcYear - 2000);
  const moonLongSidereal = normalize360(moonLongTropical - ayanamsa);

  return moonLongSidereal;
}

// Calculate astrological details from birth details
export function calculateAstroDetails(details) {
  const moonLong = calculateMoonLongitude(details.dateOfBirth, details.timeOfBirth);
  
  const rashiIndex = Math.floor(moonLong / 30) % 12;
  const nakshatraIndex = Math.floor(moonLong / (360 / 27)) % 27;
  const pada = (Math.floor(moonLong / (360 / 108)) % 4) + 1;

  return {
    rashi: RASHIS[rashiIndex],
    rashiIndex,
    nakshatra: NAKSHATRAS[nakshatraIndex],
    nakshatraIndex,
    nakshatraPada: pada,
    nakshatraLord: NAKSHATRA_LORDS[nakshatraIndex],
    moonLongitude: moonLong
  };
}

// ---- Koot Calculation Constants ----

// Varna: Brahmin=3, Kshatriya=2, Vaishya=1, Shudra=0
// Cancer/Scorpio/Pisces=Brahmin, Aries/Leo/Sagittarius=Kshatriya, 
// Taurus/Virgo/Capricorn=Vaishya, Gemini/Libra/Aquarius=Shudra
const RASHI_VARNA = [2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3];

// Vashya categories: Chatushpada(0), Manava(1), Jalachara(2), Vanachara(3), Keeta(4)
const RASHI_VASHYA = [0, 0, 1, 2, 3, 1, 1, 4, 0, 2, 1, 2];

// Gana: Deva(0), Manushya(1), Rakshasa(2)
const NAKSHATRA_GANA = [
  0, 1, 2, 1, 0, 1, 0, 0, 2, // Ashwini-Ashlesha
  2, 1, 1, 0, 2, 0, 2, 0, 2, // Magha-Jyeshtha
  2, 1, 1, 0, 2, 2, 1, 1, 0  // Moola-Revati
];

// Yoni animal pairs (0-13)
const NAKSHATRA_YONI = [
  0, 1, 2, 3, 3, 4, 5, 6, 5, // Ashwini(Horse)-Ashlesha(Cat)
  7, 7, 8, 9, 10, 9, 10, 11, 11, // Magha(Rat)-Jyeshtha(Deer)
  4, 12, 12, 12, 13, 0, 13, 8, 1  // Moola(Dog)-Revati(Elephant)
];

// Yoni gender: Male(0), Female(1)
const NAKSHATRA_YONI_GENDER = [
  0, 0, 1, 0, 1, 1, 1, 0, 0,
  0, 1, 1, 0, 1, 0, 1, 0, 1,
  0, 0, 1, 0, 1, 1, 0, 0, 1
];

// Yoni enemy pairs
const YONI_ENEMIES = [
  [0, 9],   // Horse-Buffalo
  [1, 13],  // Elephant-Lion
  [3, 4],   // Serpent-Dog
  [5, 7],   // Cat-Rat
  [6, 10],  // Sheep-Tiger
  [2, 11],  // Goat-Monkey
  [8, 12],  // Cow-Mongoose  
];

// Nadi: Adi(0), Madhya(1), Antya(2)
const NAKSHATRA_NADI = [
  0, 1, 2, 2, 1, 0, 0, 1, 2, // Ashwini-Ashlesha
  2, 1, 0, 0, 1, 2, 2, 1, 0, // Magha-Jyeshtha
  0, 1, 2, 2, 1, 0, 0, 1, 2  // Moola-Revati
];

// Rashi lords: Mars(0), Venus(1), Mercury(2), Moon(3), Sun(4), Jupiter(5), Saturn(6)
const RASHI_LORD = [0, 1, 2, 3, 4, 2, 1, 0, 5, 6, 6, 5];

// Planetary friendships
const PLANET_FRIENDS = {
  0: [4, 3, 5],       // Mars: Sun, Moon, Jupiter
  1: [2, 6],           // Venus: Mercury, Saturn
  2: [4, 1],           // Mercury: Sun, Venus
  3: [4, 2],           // Moon: Sun, Mercury
  4: [3, 0, 5],        // Sun: Moon, Mars, Jupiter
  5: [4, 3, 0],        // Jupiter: Sun, Moon, Mars
  6: [2, 1],           // Saturn: Mercury, Venus
};

const PLANET_ENEMIES = {
  0: [2],              // Mars enemies Mercury
  1: [4, 3],           // Venus enemies Sun, Moon
  2: [3],              // Mercury enemies Moon
  3: [],               // Moon - no enemies
  4: [1, 6],           // Sun enemies Venus, Saturn
  5: [2, 1],           // Jupiter enemies Mercury, Venus
  6: [4, 3, 0],        // Saturn enemies Sun, Moon, Mars
};

// ---- Koot Calculation Functions ----

function getVashyaScore(v1, v2) {
  if (v1 === v2) return 2;
  const vashyaCompat = {
    "0-1": 1, "1-0": 1,
    "0-2": 0, "2-0": 0,
    "0-3": 1, "3-0": 1,
    "0-4": 0, "4-0": 0,
    "1-2": 1, "2-1": 1,
    "1-3": 0, "3-1": 0,
    "1-4": 0, "4-1": 0,
    "2-3": 0, "3-2": 0,
    "2-4": 1, "4-2": 1,
    "3-4": 0, "4-3": 0,
  };
  return vashyaCompat[`${v1}-${v2}`] || 0;
}

function getYoniScore(n1, n2) {
  const y1 = NAKSHATRA_YONI[n1];
  const y2 = NAKSHATRA_YONI[n2];
  
  if (y1 === y2) {
    const g1 = NAKSHATRA_YONI_GENDER[n1];
    const g2 = NAKSHATRA_YONI_GENDER[n2];
    return (g1 !== g2) ? 4 : 3;
  }
  
  for (const [a, b] of YONI_ENEMIES) {
    if ((y1 === a && y2 === b) || (y1 === b && y2 === a)) return 0;
  }
  
  const diff = Math.abs(y1 - y2);
  if (diff <= 3) return 2;
  return 1;
}

function calcVarna(r1, r2) {
  const v1 = RASHI_VARNA[r1];
  const v2 = RASHI_VARNA[r2];
  const obtained = v1 >= v2 ? 1 : 0;
  return {
    name: "Varna",
    nameSanskrit: "वर्ण",
    maxPoints: 1,
    obtained,
    explanation: obtained === 1
      ? "Varna compatibility is favorable – mental and spiritual harmony exists."
      : "Varna mismatch – the groom's varna is lower than the bride's. Minor concern."
  };
}

function calcVashya(r1, r2) {
  const v1 = RASHI_VASHYA[r1];
  const v2 = RASHI_VASHYA[r2];
  const obtained = getVashyaScore(v1, v2);
  return {
    name: "Vashya",
    nameSanskrit: "वश्य",
    maxPoints: 2,
    obtained,
    explanation: obtained === 2
      ? "Excellent mutual attraction and influence between partners."
      : obtained === 1
      ? "Moderate mutual attraction – one partner may be more dominant."
      : "Low Vashya score – may require effort to maintain mutual respect."
  };
}

function calcTara(n1, n2) {
  const tara1 = ((n2 - n1 + 27) % 27) % 9;
  const tara2 = ((n1 - n2 + 27) % 27) % 9;
  
  const isAuspicious = (t) => [0, 1, 2, 4, 6, 8].includes(t);
  
  let obtained = 0;
  if (isAuspicious(tara1) && isAuspicious(tara2)) obtained = 3;
  else if (isAuspicious(tara1) || isAuspicious(tara2)) obtained = 1.5;
  else obtained = 0;
  
  return {
    name: "Tara",
    nameSanskrit: "तारा",
    maxPoints: 3,
    obtained,
    explanation: obtained === 3
      ? "Tara is highly auspicious – indicates long life and prosperity together."
      : obtained >= 1.5
      ? "Tara is partially favorable – mixed influences on health and fortune."
      : "Tara indicates challenges – remedies recommended for longevity."
  };
}

function calcYoni(n1, n2) {
  const obtained = getYoniScore(n1, n2);
  return {
    name: "Yoni",
    nameSanskrit: "योनि",
    maxPoints: 4,
    obtained,
    explanation: obtained === 4
      ? "Perfect Yoni match – excellent physical and intimate compatibility."
      : obtained >= 3
      ? "Good Yoni compatibility – satisfactory physical harmony."
      : obtained >= 2
      ? "Average Yoni compatibility – moderate physical understanding."
      : "Yoni mismatch – may face challenges in intimate compatibility."
  };
}

function calcGrahaMaitri(r1, r2) {
  const lord1 = RASHI_LORD[r1];
  const lord2 = RASHI_LORD[r2];
  
  if (lord1 === lord2) {
    return { 
      name: "Graha Maitri", 
      nameSanskrit: "ग्रह मैत्री",
      maxPoints: 5, 
      obtained: 5, 
      explanation: "Same Rashi lords – excellent mental and intellectual harmony." 
    };
  }
  
  const isFriend1to2 = PLANET_FRIENDS[lord1]?.includes(lord2);
  const isFriend2to1 = PLANET_FRIENDS[lord2]?.includes(lord1);
  const isEnemy1to2 = PLANET_ENEMIES[lord1]?.includes(lord2);
  const isEnemy2to1 = PLANET_ENEMIES[lord2]?.includes(lord1);
  
  let obtained;
  if (isFriend1to2 && isFriend2to1) obtained = 5;
  else if ((isFriend1to2 && !isEnemy2to1) || (!isEnemy1to2 && isFriend2to1)) obtained = 4;
  else if (!isEnemy1to2 && !isEnemy2to1 && !isFriend1to2 && !isFriend2to1) obtained = 3;
  else if ((isFriend1to2 && isEnemy2to1) || (isEnemy1to2 && isFriend2to1)) obtained = 1;
  else if (isEnemy1to2 || isEnemy2to1) obtained = 0.5;
  else obtained = 0;
  
  return {
    name: "Graha Maitri",
    nameSanskrit: "ग्रह मैत्री",
    maxPoints: 5,
    obtained,
    explanation: obtained >= 4
      ? "Strong planetary friendship – harmonious intellectual connection."
      : obtained >= 2
      ? "Neutral planetary relationship – adequate mental compatibility."
      : "Planetary enmity exists – may cause mental disagreements."
  };
}

function calcGana(n1, n2) {
  const g1 = NAKSHATRA_GANA[n1];
  const g2 = NAKSHATRA_GANA[n2];
  const GANA_NAMES = ["Deva", "Manushya", "Rakshasa"];
  
  const ganaTable = [
    [6, 6, 1],
    [5, 6, 0],
    [1, 0, 6],
  ];
  
  const obtained = ganaTable[g1][g2];
  
  return {
    name: "Gana",
    nameSanskrit: "गण",
    maxPoints: 6,
    obtained,
    explanation: `Partner 1 is ${GANA_NAMES[g1]}, Partner 2 is ${GANA_NAMES[g2]}. ${
      obtained >= 5 ? "Excellent temperament match – harmonious daily life." :
      obtained >= 3 ? "Moderate temperament compatibility – some adjustments needed." :
      "Gana mismatch – different temperaments may cause friction. Remedies advised."
    }`
  };
}

function calcBhakoot(r1, r2) {
  const diff = ((r2 - r1 + 12) % 12);
  
  const isBad = (
    (diff === 1 || diff === 11) || // 2/12
    (diff === 5 || diff === 7) ||  // 6/8
    (diff === 4 || diff === 8)     // 5/9
  );
  
  const lord1 = RASHI_LORD[r1];
  const lord2 = RASHI_LORD[r2];
  const areFriends = lord1 === lord2 || 
    (PLANET_FRIENDS[lord1]?.includes(lord2) && PLANET_FRIENDS[lord2]?.includes(lord1));
  
  let obtained;
  if (!isBad) {
    obtained = 7;
  } else if (areFriends) {
    obtained = 7;
  } else {
    obtained = 0;
  }
  
  return {
    name: "Bhakoot",
    nameSanskrit: "भकूट",
    maxPoints: 7,
    obtained,
    explanation: obtained === 7
      ? "Excellent Bhakoot – indicates prosperity, happiness and good fortune in marriage."
      : "Bhakoot Dosha present – may affect financial stability or health. Specific pujas recommended."
  };
}

function calcNadi(n1, n2) {
  const nad1 = NAKSHATRA_NADI[n1];
  const nad2 = NAKSHATRA_NADI[n2];
  const NADI_NAMES = ["Adi (Vata)", "Madhya (Pitta)", "Antya (Kapha)"];
  
  const obtained = nad1 !== nad2 ? 8 : 0;
  
  return {
    name: "Nadi",
    nameSanskrit: "नाडी",
    maxPoints: 8,
    obtained,
    explanation: `Partner 1: ${NADI_NAMES[nad1]}, Partner 2: ${NADI_NAMES[nad2]}. ${
      obtained === 8
      ? "Different Nadis – excellent health compatibility and healthy progeny indicated."
      : "⚠️ Nadi Dosha detected! Same Nadi can indicate health concerns for progeny. This is a serious dosha requiring remedies."
    }`
  };
}

function checkMangalDosha(rashiIndex, nakshatraIndex) {
  const marsHouse = (rashiIndex + nakshatraIndex) % 12;
  return [0, 1, 3, 6, 7, 11].includes(marsHouse);
}

function getRemedies(result) {
  const remedies = [];
  
  if (result.totalObtained < 18) {
    remedies.push("Perform Gauri-Shankar Puja together before marriage to strengthen the bond.");
    remedies.push("Recite Vishnu Sahasranama regularly for overall harmony.");
  }
  
  if (result.nadiDosha) {
    remedies.push("Nadi Dosha Remedy: Donate gold, grains, and cloth to a Brahmin. Perform Maha Mrityunjaya Jaap (11,000 times).");
    remedies.push("Visit Pashupatinath temple and perform Rudrabhishek together.");
  }
  
  if (result.mangalDosha1 || result.mangalDosha2) {
    remedies.push("Mangal Dosha Remedy: Perform Kumbh Vivah or Vishnu Vivah before the actual marriage.");
    remedies.push("Recite Hanuman Chalisa daily and fast on Tuesdays for Mangal Shanti.");
  }
  
  const bhakoot = result.koots.find(k => k.name === "Bhakoot");
  if (bhakoot && bhakoot.obtained === 0) {
    remedies.push("Bhakoot Dosha Remedy: Perform Laxmi-Narayan Puja for financial stability and marital bliss.");
  }
  
  const gana = result.koots.find(k => k.name === "Gana");
  if (gana && gana.obtained <= 1) {
    remedies.push("Gana Dosha Remedy: Worship Lord Ganesha together and recite Ganesha Atharvashirsha.");
  }
  
  if (remedies.length === 0) {
    remedies.push("No major doshas found. The match is favorable. Regular worship and mutual respect will ensure a happy marriage.");
  }
  
  return remedies;
}

// Main function to perform Guna Milan
export function performGunaMilan(partner1, partner2) {
  const astro1 = calculateAstroDetails(partner1);
  const astro2 = calculateAstroDetails(partner2);
  
  const koots = [
    calcVarna(astro1.rashiIndex, astro2.rashiIndex),
    calcVashya(astro1.rashiIndex, astro2.rashiIndex),
    calcTara(astro1.nakshatraIndex, astro2.nakshatraIndex),
    calcYoni(astro1.nakshatraIndex, astro2.nakshatraIndex),
    calcGrahaMaitri(astro1.rashiIndex, astro2.rashiIndex),
    calcGana(astro1.nakshatraIndex, astro2.nakshatraIndex),
    calcBhakoot(astro1.rashiIndex, astro2.rashiIndex),
    calcNadi(astro1.nakshatraIndex, astro2.nakshatraIndex),
  ];
  
  const totalObtained = koots.reduce((sum, k) => sum + k.obtained, 0);
  const percentage = (totalObtained / 36) * 100;
  
  let verdict = "";
  let verdictColor = "";
  let verdictDescription = "";
  
  if (totalObtained >= 33) { 
    verdict = "Excellent Match! 🎉"; 
    verdictColor = "text-green-400";
    verdictDescription = "उत्तम विवाह – The couple is highly compatible in all aspects of life.";
  }
  else if (totalObtained >= 28) { 
    verdict = "Very Good Match ✨"; 
    verdictColor = "text-green-300";
    verdictDescription = "अति शुभ – Excellent compatibility with minor adjustments needed.";
  }
  else if (totalObtained >= 22) { 
    verdict = "Good Match ✅"; 
    verdictColor = "text-yellow-300";
    verdictDescription = "शुभ विवाह – Good compatibility with some areas needing attention.";
  }
  else if (totalObtained >= 16) { 
    verdict = "Average Match ⚠️"; 
    verdictColor = "text-orange-300";
    verdictDescription = "सामान्य – Average compatibility. Remedies are recommended for better harmony.";
  }
  else { 
    verdict = "Challenging Match 🔴"; 
    verdictColor = "text-red-400";
    verdictDescription = "गम्भीर उपाय आवश्यक – Low compatibility. Serious remedies are necessary.";
  }
  
  const mangalDosha1 = checkMangalDosha(astro1.rashiIndex, astro1.nakshatraIndex);
  const mangalDosha2 = checkMangalDosha(astro2.rashiIndex, astro2.nakshatraIndex);
  const nadiDosha = koots[7].obtained === 0;
  
  const resultObj = {
    partner1: astro1,
    partner2: astro2,
    koots,
    totalObtained,
    totalMax: 36,
    percentage: Math.round(percentage * 10) / 10,
    verdict,
    verdictColor,
    verdictDescription,
    mangalDosha1,
    mangalDosha2,
    nadiDosha,
    remedies: [],
  };
  
  resultObj.remedies = getRemedies(resultObj);
  
  return resultObj;
}