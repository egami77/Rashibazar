// backend/utils/vedicConstants.js

export const RASHI_NE = [
  "मेष", "वृष", "मिथुन", "कर्कट", "सिंह", "कन्या",
  "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन",
];

export const RASHI_EN = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

export const RASHI_LORD_NE = [
  "मंगल", "शुक्र", "बुध", "चन्द्र", "सूर्य", "बुध",
  "शुक्र", "मंगल", "बृहस्पति", "शनि", "शनि", "बृहस्पति",
];

export const RASHI_SHORT_NE = [
  "मे", "वृ", "मि", "क", "सि", "क",
  "तु", "वृ", "ध", "म", "कु", "मी",
];

export const PLANETS_NE = {
  Sun: "सूर्य",
  Moon: "चन्द्र",
  Mars: "मंगल",
  Mercury: "बुध",
  Jupiter: "बृहस्पति",
  Venus: "शुक्र",
  Saturn: "शनि",
  Rahu: "राहु",
  Ketu: "केतु",
  Lagna: "लग्न",
};

export const PLANET_SHORT_NE = {
  Sun: "सू",
  Moon: "च",
  Mars: "मं",
  Mercury: "बु",
  Jupiter: "गु",
  Venus: "शु",
  Saturn: "श",
  Rahu: "रा",
  Ketu: "के",
  Lagna: "ल",
};

export const NAKSHATRA_NE = [
  "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा",
  "पुनर्वसु", "पुष्य", "आश्लेषा", "मघा", "पूर्वा फाल्गुनी", "उत्तरा फाल्गुनी",
  "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा",
  "मूल", "पूर्वाषाढ़ा", "उत्तराषाढ़ा", "श्रवण", "धनिष्ठा", "शतभिषा",
  "पूर्वा भाद्रपद", "उत्तरा भाद्रपद", "रेवती",
];

export const DASHA_LORDS = [
  { lord: "Ketu", lordNe: "केतु", years: 7 },
  { lord: "Venus", lordNe: "शुक्र", years: 20 },
  { lord: "Sun", lordNe: "सूर्य", years: 6 },
  { lord: "Moon", lordNe: "चन्द्र", years: 10 },
  { lord: "Mars", lordNe: "मंगल", years: 7 },
  { lord: "Rahu", lordNe: "राहु", years: 18 },
  { lord: "Jupiter", lordNe: "बृहस्पति", years: 16 },
  { lord: "Saturn", lordNe: "शनि", years: 19 },
  { lord: "Mercury", lordNe: "बुध", years: 17 },
];

export const NAKSHATRA_LORD_INDEX = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, // Ashwini..Ashlesha
  0, 1, 2, 3, 4, 5, 6, 7, 8, // Magha..Jyeshtha
  0, 1, 2, 3, 4, 5, 6, 7, 8, // Mula..Revati
];

export const NE_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

export function toDevanagariNum(input) {
  return String(input).replace(/\d/g, (d) => NE_DIGITS[+d]);
}

export function degToDMS(deg) {
  const d = Math.floor(deg);
  const mFloat = (deg - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  return `${toDevanagariNum(d)}°${toDevanagariNum(m)}'${toDevanagariNum(s)}"`;
}

export const NEPAL_TZ_OFFSET_HOURS = 5.75;
