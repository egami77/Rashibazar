import { createRequire } from "module";
const require = createRequire(import.meta.url);
const A = require("astronomy-engine");
import {
  DASHA_LORDS,
  NAKSHATRA_LORD_INDEX,
} from "./vedicConstants.js";

export const PLANET_ORDER = [
  "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu",
];

// ---------- Lahiri Ayanamsa ----------
export function lahiriAyanamsa(date) {
  const JD = date.getTime() / 86400000 + 2440587.5;
  const T = (JD - 2451545.0) / 36525;
  // Lahiri value at J2000 is ~23.857
  let aya = 23.85709 + 0.0139688 * (JD - 2451545.0) / 365.25;
  return aya;
}

// ---------- Helpers ----------
const norm360 = (x) => ((x % 360) + 360) % 360;

function tropicalEclipticLongitude(body, time) {
  const vec = A.GeoVector(body, time, true);
  const ecl = A.Ecliptic(vec);
  const dt = 1 / 24;
  const t2 = time.AddDays(dt);
  const vec2 = A.GeoVector(body, t2, true);
  const ecl2 = A.Ecliptic(vec2);
  const delta = ((ecl2.elon - ecl.elon + 540) % 360) - 180;
  return { lon: ecl.elon, retro: delta < 0 };
}

function moonTropical(time) {
  const m = A.EclipticGeoMoon(time);
  return m.lon;
}

function trueNodeTropical(time) {
  const JD = time.tt + 2451545.0;
  const T = (JD - 2451545.0) / 36525;
  let omega =
    125.0445479 -
    1934.1362891 * T +
    0.0020754 * T * T +
    (T * T * T) / 467441 -
    (T * T * T * T) / 60616000;
  return norm360(omega);
}

function tropicalAscendant(time, lat, lon) {
  const gstHours = A.SiderealTime(time);
  const gstDeg = gstHours * 15;
  const lst = norm360(gstDeg + lon);

  const JD = time.ut + 2451545.0;
  const T = (JD - 2451545.0) / 36525;
  const eps = 23.4392911 - 0.0130041667 * T;

  const ramcR = (lst * Math.PI) / 180;
  const epsR = (eps * Math.PI) / 180;
  const latR = (lat * Math.PI) / 180;

  // Correct Ascendant formula to find the rising point (Eastern Horizon)
  const y = Math.cos(ramcR);
  const x = -(Math.sin(ramcR) * Math.cos(epsR) + Math.tan(latR) * Math.sin(epsR));

  let asc = (Math.atan2(y, x) * 180) / Math.PI;
  return norm360(asc);
}

function decomposeLongitude(siderealLon) {
  const lon = norm360(siderealLon);
  const rashi = Math.floor(lon / 30);
  const degInRashi = lon - rashi * 30;
  const nakshatraSize = 360 / 27;
  const nakshatra = Math.floor(lon / nakshatraSize);
  const padaSize = nakshatraSize / 4;
  const pada = Math.floor((lon - nakshatra * nakshatraSize) / padaSize) + 1;
  return { rashi, degInRashi, nakshatra, pada };
}

// ---------- Divisional charts ----------
function navamshaSign(siderealLon) {
  const sign = Math.floor(siderealLon / 30);
  const part = Math.floor((siderealLon - sign * 30) / (30 / 9));
  let start;
  const mod = sign % 3;
  if (mod === 0) start = sign;
  else if (mod === 1) start = (sign + 8) % 12;
  else start = (sign + 4) % 12;
  return (start + part) % 12;
}

function drekkanaSign(siderealLon) {
  const sign = Math.floor(siderealLon / 30);
  const part = Math.floor((siderealLon - sign * 30) / 10);
  const offsets = [0, 4, 8];
  return (sign + offsets[part]) % 12;
}

function dwadashamshaSign(siderealLon) {
  const sign = Math.floor(siderealLon / 30);
  const part = Math.floor((siderealLon - sign * 30) / 2.5);
  return (sign + part) % 12;
}

// ---------- Vimshottari Dasha ----------
const NAK_SIZE = 360 / 27;

function computeVimshottari(moonSidereal, birthUtc) {
  const nak = Math.floor(moonSidereal / NAK_SIZE);
  const positionInNak = moonSidereal - nak * NAK_SIZE;
  const fractionElapsed = positionInNak / NAK_SIZE;
  const lordIdx = NAKSHATRA_LORD_INDEX[nak];
  const lord = DASHA_LORDS[lordIdx];
  const balanceYears = lord.years * (1 - fractionElapsed);

  const periods = [];
  let cursor = new Date(birthUtc.getTime());
  const firstEnd = addYears(cursor, balanceYears);
  periods.push({ lord: lord.lord, lordNe: lord.lordNe, startDate: cursor, endDate: firstEnd });
  cursor = firstEnd;
  for (let i = 1; i < 10; i++) {
    const d = DASHA_LORDS[(lordIdx + i) % 9];
    const end = addYears(cursor, d.years);
    periods.push({ lord: d.lord, lordNe: d.lordNe, startDate: cursor, endDate: end });
    cursor = end;
  }

  const now = new Date();
  const currentMaha = periods.find((p) => p.startDate <= now && now < p.endDate);
  let currentAntar;
  let currentPratyantar;
  if (currentMaha) {
    const antarList = subDashas(currentMaha);
    currentAntar = antarList.find((p) => p.startDate <= now && now < p.endDate);
    if (currentAntar) {
      const pratList = subDashas(currentAntar);
      currentPratyantar = pratList.find((p) => p.startDate <= now && now < p.endDate);
    }
  }

  return {
    mahaDashas: periods,
    currentMaha,
    currentAntar,
    currentPratyantar,
    birthBalance: { lord: lord.lord, lordNe: lord.lordNe, years: balanceYears },
  };
}

function subDashas(parent) {
  const totalMs = parent.endDate.getTime() - parent.startDate.getTime();
  const parentLordIdx = DASHA_LORDS.findIndex((d) => d.lord === parent.lord);
  const parentYears = DASHA_LORDS[parentLordIdx].years;
  const out = [];
  let cursor = new Date(parent.startDate.getTime());
  for (let i = 0; i < 9; i++) {
    const d = DASHA_LORDS[(parentLordIdx + i) % 9];
    const fraction = d.years / 120;
    const subYears = parentYears * fraction;
    const ms = (subYears / parentYears) * totalMs;
    const end = new Date(cursor.getTime() + ms);
    out.push({ lord: d.lord, lordNe: d.lordNe, startDate: cursor, endDate: end });
    cursor = end;
  }
  return out;
}

function addYears(d, years) {
  const ms = years * 365.2425 * 86400 * 1000;
  return new Date(d.getTime() + ms);
}

// ---------- Ashtakavarga (Samudaya) ----------
const REFS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Lagna"];
const H = (...houses) => {
  const arr = new Array(12).fill(false);
  for (const h of houses) arr[(h - 1) % 12] = true;
  return arr;
};

const BINDU_TABLE = {
  Sun: {
    Sun: H(1, 2, 4, 7, 8, 9, 10, 11),
    Moon: H(3, 6, 10, 11),
    Mars: H(1, 2, 4, 7, 8, 9, 10, 11),
    Mercury: H(3, 5, 6, 9, 10, 11, 12),
    Jupiter: H(5, 6, 9, 11),
    Venus: H(6, 7, 12),
    Saturn: H(1, 2, 4, 7, 8, 9, 10, 11),
    Lagna: H(3, 4, 6, 10, 11, 12),
  },
  Moon: {
    Sun: H(3, 6, 7, 8, 10, 11),
    Moon: H(1, 3, 6, 7, 10, 11),
    Mars: H(2, 3, 5, 6, 9, 10, 11),
    Mercury: H(1, 3, 4, 5, 7, 8, 10, 11),
    Jupiter: H(1, 4, 7, 8, 10, 11, 12),
    Venus: H(3, 4, 5, 7, 9, 10, 11),
    Saturn: H(3, 5, 6, 11),
    Lagna: H(3, 6, 10, 11),
  },
  Mars: {
    Sun: H(3, 5, 6, 10, 11),
    Moon: H(3, 6, 11),
    Mars: H(1, 2, 4, 7, 8, 10, 11),
    Mercury: H(3, 5, 6, 11),
    Jupiter: H(6, 10, 11, 12),
    Venus: H(6, 8, 11, 12),
    Saturn: H(1, 4, 7, 8, 9, 10, 11),
    Lagna: H(1, 3, 6, 10, 11),
  },
  Mercury: {
    Sun: H(5, 6, 9, 11, 12),
    Moon: H(2, 4, 6, 8, 10, 11),
    Mars: H(1, 2, 4, 7, 8, 9, 10, 11),
    Mercury: H(1, 3, 5, 6, 9, 10, 11, 12),
    Jupiter: H(6, 8, 11, 12),
    Venus: H(1, 2, 3, 4, 5, 8, 9, 11),
    Saturn: H(1, 2, 4, 7, 8, 9, 10, 11),
    Lagna: H(1, 2, 4, 6, 8, 10, 11),
  },
  Jupiter: {
    Sun: H(1, 2, 3, 4, 7, 8, 9, 10, 11),
    Moon: H(2, 5, 7, 9, 11),
    Mars: H(1, 2, 4, 7, 8, 10, 11),
    Mercury: H(1, 2, 4, 5, 6, 9, 10, 11),
    Jupiter: H(1, 2, 3, 4, 7, 8, 10, 11),
    Venus: H(2, 5, 6, 9, 10, 11),
    Saturn: H(3, 5, 6, 12),
    Lagna: H(1, 2, 4, 5, 6, 7, 9, 10, 11),
  },
  Venus: {
    Sun: H(8, 11, 12),
    Moon: H(1, 2, 3, 4, 5, 8, 9, 11, 12),
    Mars: H(3, 5, 6, 9, 11, 12),
    Mercury: H(3, 5, 6, 9, 11),
    Jupiter: H(5, 8, 9, 10, 11),
    Venus: H(1, 2, 3, 4, 5, 8, 9, 10, 11),
    Saturn: H(3, 4, 5, 8, 9, 10, 11),
    Lagna: H(1, 2, 3, 4, 5, 8, 9, 11),
  },
  Saturn: {
    Sun: H(1, 2, 4, 7, 8, 10, 11),
    Moon: H(3, 6, 11),
    Mars: H(3, 5, 6, 10, 11, 12),
    Mercury: H(6, 8, 9, 10, 11, 12),
    Jupiter: H(5, 6, 11, 12),
    Venus: H(6, 11, 12),
    Saturn: H(3, 5, 6, 11),
    Lagna: H(1, 3, 4, 6, 10, 11),
  },
};

function computeSamudayaAshtakavarga(positions) {
  const sav = new Array(12).fill(0);
  for (const contributor of Object.keys(BINDU_TABLE)) {
    for (const ref of REFS) {
      const refSign = positions[ref];
      if (refSign === undefined) continue;
      const bools = BINDU_TABLE[contributor][ref];
      for (let h = 0; h < 12; h++) {
        if (bools[h]) {
          const sign = (refSign + h) % 12;
          sav[sign] += 1;
        }
      }
    }
  }
  return sav;
}

// ---------- Main entry ----------
export function generateKundaliEngine(input) {
  const birthUtc = new Date(input.birthUtc);
  const time = A.MakeTime(birthUtc);
  const aya = lahiriAyanamsa(birthUtc);

  const sunT = tropicalEclipticLongitude(A.Body.Sun, time);
  const moonTLon = moonTropical(time);
  const marsT = tropicalEclipticLongitude(A.Body.Mars, time);
  const merT = tropicalEclipticLongitude(A.Body.Mercury, time);
  const jupT = tropicalEclipticLongitude(A.Body.Jupiter, time);
  const venT = tropicalEclipticLongitude(A.Body.Venus, time);
  const satT = tropicalEclipticLongitude(A.Body.Saturn, time);
  const rahuTLon = trueNodeTropical(time);
  const ketuTLon = norm360(rahuTLon + 180);

  const tropToSid = (t) => norm360(t - aya);

  const sid = {
    Sun: { lon: tropToSid(sunT.lon), retro: false },
    Moon: { lon: tropToSid(moonTLon), retro: false },
    Mars: { lon: tropToSid(marsT.lon), retro: marsT.retro },
    Mercury: { lon: tropToSid(merT.lon), retro: merT.retro },
    Jupiter: { lon: tropToSid(jupT.lon), retro: jupT.retro },
    Venus: { lon: tropToSid(venT.lon), retro: venT.retro },
    Saturn: { lon: tropToSid(satT.lon), retro: satT.retro },
    Rahu: { lon: tropToSid(rahuTLon), retro: true },
    Ketu: { lon: tropToSid(ketuTLon), retro: true },
  };

  const ascTrop = tropicalAscendant(time, input.latitude, input.longitude);
  const ascSid = norm360(ascTrop - aya);
  const lagnaInfo = decomposeLongitude(ascSid);

  const planets = PLANET_ORDER.map((key) => {
    const { rashi, degInRashi, nakshatra, pada } = decomposeLongitude(sid[key].lon);
    const house = ((rashi - lagnaInfo.rashi + 12) % 12) + 1;
    return {
      key,
      longitude: sid[key].lon,
      rashi,
      degInRashi,
      nakshatra,
      pada,
      house,
      retrograde: sid[key].retro,
    };
  });

  const buildChart = (fn) => {
    const out = {};
    out["Lagna"] = fn(ascSid);
    PLANET_ORDER.forEach((k) => (out[k] = fn(sid[k].lon)));
    return out;
  };
  const D1 = buildChart((l) => Math.floor(l / 30));
  const D9 = buildChart(navamshaSign);
  const D3 = buildChart(drekkanaSign);
  const D12 = buildChart(dwadashamshaSign);

  const vimshottari = computeVimshottari(sid.Moon.lon, birthUtc);

  const refPositions = {
    Sun: D1["Sun"], Moon: D1["Moon"], Mars: D1["Mars"], Mercury: D1["Mercury"],
    Jupiter: D1["Jupiter"], Venus: D1["Venus"], Saturn: D1["Saturn"],
    Lagna: D1["Lagna"],
  };
  const ashtakavarga = computeSamudayaAshtakavarga(refPositions);

  return {
    birthUtc,
    ayanamsa: aya,
    lagnaLongitude: ascSid,
    lagnaRashi: lagnaInfo.rashi,
    lagnaDegInRashi: lagnaInfo.degInRashi,
    lagnaNakshatra: lagnaInfo.nakshatra,
    lagnaPada: lagnaInfo.pada,
    moonRashi: planets[1].rashi,
    moonNakshatra: planets[1].nakshatra,
    planets,
    charts: { D1, D9, D3, D12 },
    vimshottari,
    ashtakavarga,
  };
}

// ---------- Guna Milan (Matching) Logic ----------

const RASHI_VARNA = [2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3];
const RASHI_VASHYA = [0, 0, 1, 2, 3, 1, 1, 4, 0, 2, 1, 2];
const NAKSHATRA_GANA = [
  0, 1, 2, 1, 0, 1, 0, 0, 2,
  2, 1, 1, 0, 2, 0, 2, 0, 2,
  2, 1, 1, 0, 2, 2, 1, 1, 0
];
const NAKSHATRA_YONI = [
  0, 1, 2, 3, 3, 4, 5, 6, 5,
  7, 7, 8, 9, 10, 9, 10, 11, 11,
  4, 12, 12, 12, 13, 0, 13, 8, 1
];
const NAKSHATRA_YONI_GENDER = [
  0, 0, 1, 0, 1, 1, 1, 0, 0,
  0, 1, 1, 0, 1, 0, 1, 0, 1,
  0, 0, 1, 0, 1, 1, 0, 0, 1
];
const YONI_ENEMIES = [[0, 9], [1, 13], [3, 4], [5, 7], [6, 10], [2, 11], [8, 12]];
const NAKSHATRA_NADI = [
  0, 1, 2, 2, 1, 0, 0, 1, 2,
  2, 1, 0, 0, 1, 2, 2, 1, 0,
  0, 1, 2, 2, 1, 0, 0, 1, 2
];
const RASHI_LORD = [0, 1, 2, 3, 4, 2, 1, 0, 5, 6, 6, 5];
const PLANET_FRIENDS = {
  0: [4, 3, 5], 1: [2, 6], 2: [4, 1], 3: [4, 2], 4: [3, 0, 5], 5: [4, 3, 0], 6: [2, 1],
};
const PLANET_ENEMIES = {
  0: [2], 1: [4, 3], 2: [3], 3: [], 4: [1, 6], 5: [2, 1], 6: [4, 3, 0],
};

function getVashyaScore(v1, v2) {
  if (v1 === v2) return 2;
  const map = { "0-1": 1, "1-0": 1, "0-3": 1, "3-0": 1, "1-2": 1, "2-1": 1, "2-4": 1, "4-2": 1 };
  return map[`${v1}-${v2}`] || 0;
}

function getYoniScore(n1, n2) {
  const y1 = NAKSHATRA_YONI[n1];
  const y2 = NAKSHATRA_YONI[n2];
  if (y1 === y2) return NAKSHATRA_YONI_GENDER[n1] !== NAKSHATRA_YONI_GENDER[n2] ? 4 : 3;
  for (const [a, b] of YONI_ENEMIES) if ((y1 === a && y2 === b) || (y1 === b && y2 === a)) return 0;
  return 2;
}

export function calculateGunaMilan(astro1, astro2) {
  const r1 = astro1.moonRashi, r2 = astro2.moonRashi;
  const n1 = astro1.moonNakshatra, n2 = astro2.moonNakshatra;
  const koots = [];

  // Varna
  const vScore = RASHI_VARNA[r1] >= RASHI_VARNA[r2] ? 1 : 0;
  koots.push({ name: "Varna", nameSanskrit: "वर्ण", maxPoints: 1, obtained: vScore, explanation: vScore ? "Spiritual and mental alignment exists." : "Minor varna mismatch." });

  // Vashya
  const vsScore = getVashyaScore(RASHI_VASHYA[r1], RASHI_VASHYA[r2]);
  koots.push({ name: "Vashya", nameSanskrit: "वश्य", maxPoints: 2, obtained: vsScore, explanation: vsScore === 2 ? "Excellent mutual attraction." : "Moderate attraction." });

  // Tara
  const t1 = ((n2 - n1 + 27) % 27) % 9, t2 = ((n1 - n2 + 27) % 27) % 9;
  const ok = (t) => [0, 1, 2, 4, 6, 8].includes(t);
  const taraScore = ok(t1) && ok(t2) ? 3 : (ok(t1) || ok(t2) ? 1.5 : 0);
  koots.push({ name: "Tara", nameSanskrit: "तारा", maxPoints: 3, obtained: taraScore, explanation: taraScore === 3 ? "Auspicious for longevity." : "Partially favorable." });

  // Yoni
  const yScore = getYoniScore(n1, n2);
  koots.push({ name: "Yoni", nameSanskrit: "योनि", maxPoints: 4, obtained: yScore, explanation: yScore === 4 ? "Perfect physical compatibility." : "Average physical harmony." });

  // Graha Maitri
  const l1 = RASHI_LORD[r1], l2 = RASHI_LORD[r2];
  let gm = 0;
  if (l1 === l2) gm = 5;
  else {
    const f12 = PLANET_FRIENDS[l1]?.includes(l2), f21 = PLANET_FRIENDS[l2]?.includes(l1);
    const e12 = PLANET_ENEMIES[l1]?.includes(l2), e21 = PLANET_ENEMIES[l2]?.includes(l1);
    if (f12 && f21) gm = 5; else if ((f12 && !e21) || (!e12 && f21)) gm = 4; else if (!e12 && !e21) gm = 3; else gm = 1;
  }
  koots.push({ name: "Graha Maitri", nameSanskrit: "ग्रह मैत्री", maxPoints: 5, obtained: gm, explanation: gm >= 4 ? "Harmonious intellectual connection." : "Planetary enmity may cause friction." });

  // Gana
  const g1 = NAKSHATRA_GANA[n1], g2 = NAKSHATRA_GANA[n2];
  const gTable = [[6, 6, 1], [5, 6, 0], [1, 0, 6]];
  const gScore = gTable[g1][g2];
  koots.push({ name: "Gana", nameSanskrit: "गण", maxPoints: 6, obtained: gScore, explanation: gScore >= 5 ? "Harmonious temperaments." : "Different temperaments." });

  // Bhakoot
  const diff = (r2 - r1 + 12) % 12;
  const bad = [1, 11, 5, 7, 4, 8].includes(diff);
  let bScore = bad ? 0 : 7;
  if (bScore === 0) {
    const l1 = RASHI_LORD[r1], l2 = RASHI_LORD[r2];
    if (l1 === l2 || (PLANET_FRIENDS[l1]?.includes(l2) && PLANET_FRIENDS[l2]?.includes(l1))) bScore = 7;
  }
  koots.push({ name: "Bhakoot", nameSanskrit: "भकूट", maxPoints: 7, obtained: bScore, explanation: bScore ? "Emotional stability." : "Bhakoot Dosha present." });

  // Nadi
  const nScore = NAKSHATRA_NADI[n1] !== NAKSHATRA_NADI[n2] ? 8 : 0;
  koots.push({ name: "Nadi", nameSanskrit: "नाडी", maxPoints: 8, obtained: nScore, explanation: nScore ? "Different Nadis - favorable for progeny." : "Nadi Dosha detected." });

  return {
    koots,
    totalObtained: koots.reduce((s, k) => s + k.obtained, 0),
    percentage: Math.round((koots.reduce((s, k) => s + k.obtained, 0) / 36) * 1000) / 10,
    doshas: { nadi: nScore === 0, bhakoot: bScore === 0, gana: gScore === 0 }
  };
}
