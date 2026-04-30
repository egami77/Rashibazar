// frontend/src/components/VedicKundali/SankalpaProse.jsx
import React from 'react';
import { RASHI_NE, NAKSHATRA_NE, RASHI_LORD_NE, toDevanagariNum } from "../../lib/vedic/constants";
import { adToBs } from "../../lib/vedic/bs-date";

const SOLAR_MONTHS_NE = [
  "वैशाख", "ज्येष्ठ", "आषाढ़", "श्रावण", "भाद्रपद", "आश्विन",
  "कार्तिक", "मार्गशीर्ष", "पौष", "माघ", "फाल्गुन", "चैत्र",
];

const RITU_NE = [
  "ग्रीष्म", "ग्रीष्म", "वर्षा", "वर्षा",
  "शरद", "शरद", "हेमन्त", "हेमन्त",
  "शिशिर", "शिशिर", "वसन्त", "वसन्त",
];

const ayanaNe = (sunSign) => sunSign >= 9 || sunSign <= 2 ? "उत्तरायण" : "दक्षिणायण";

function tithiInfo(sunLon, moonLon) {
  const diff = ((moonLon - sunLon + 360) % 360);
  const tithiNum = Math.floor(diff / 12) + 1;
  const paksha = tithiNum <= 15 ? "शुक्ल" : "कृष्ण";
  const localT = tithiNum <= 15 ? tithiNum : tithiNum - 15;
  const names = [
    "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पञ्चमी",
    "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी",
    "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी",
    localT === 15 ? (paksha === "शुक्ल" ? "पूर्णिमा" : "अमावस्या") : "",
  ];
  return { paksha, tithiName: names[localT - 1] };
}

const VARA_NE = ["आइतवार", "सोमवार", "मंगलवार", "बुधवार", "बिहीवार", "शुक्रवार", "शनिवार"];

const YONI_NE = [
  "अश्व", "गज", "मेष", "सर्प", "सर्प", "श्वान",
  "मार्जार", "मेष", "मार्जार", "मूषक", "मूषक", "गौ",
  "महिष", "व्याघ्र", "महिष", "व्याघ्र", "मृग", "मृग",
  "श्वान", "वानर", "नकुल", "वानर", "सिंह", "अश्व",
  "सिंह", "गौ", "गज",
];

const GANA_NE = [
  "देव", "मनुष्य", "राक्षस", "मनुष्य", "देव", "मनुष्य",
  "देव", "देव", "राक्षस", "राक्षस", "मनुष्य", "मनुष्य",
  "देव", "राक्षस", "देव", "राक्षस", "देव", "राक्षस",
  "राक्षस", "मनुष्य", "मनुष्य", "देव", "राक्षस", "राक्षस",
  "मनुष्य", "मनुष्य", "देव",
];

const NADI_NE = [
  "आदि", "मध्य", "अन्त्य", "अन्त्य", "मध्य", "आदि",
  "आदि", "मध्य", "अन्त्य", "अन्त्य", "मध्य", "आदि",
  "आदि", "मध्य", "अन्त्य", "अन्त्य", "मध्य", "आदि",
  "आदि", "मध्य", "अन्त्य", "अन्त्य", "मध्य", "आदि",
  "आदि", "मध्य", "अन्त्य",
];

const VARNA_NE = [
  "क्षत्रिय", "वैश्य", "शूद्र", "ब्राह्मण",
  "क्षत्रिय", "वैश्य", "शूद्र", "ब्राह्मण",
  "क्षत्रिय", "वैश्य", "शूद्र", "ब्राह्मण",
];

const NAKSHATRA_AKSHARA = [
  ["चु", "चे", "चो", "ला"], ["ली", "लू", "ले", "लो"], ["अ", "इ", "उ", "ए"],
  ["ओ", "वा", "वी", "वू"], ["वे", "वो", "का", "की"], ["कू", "घ", "ङ", "छ"],
  ["के", "को", "हा", "ही"], ["हू", "हे", "हो", "डा"], ["डी", "डू", "डे", "डो"],
  ["मा", "मी", "मू", "मे"], ["मो", "टा", "टी", "टू"], ["टे", "टो", "पा", "पी"],
  ["पू", "ष", "ण", "ठ"], ["पे", "पो", "रा", "री"], ["रू", "रे", "रो", "ता"],
  ["ती", "तू", "ते", "तो"], ["ना", "नी", "नू", "ने"], ["नो", "या", "यी", "यू"],
  ["ये", "यो", "भा", "भी"], ["भू", "धा", "फा", "ढा"], ["भे", "भो", "जा", "जी"],
  ["जू", "जे", "जो", "खी"], ["खू", "खे", "खो", "गा"], ["गी", "गू", "गे", "गो"],
  ["से", "सो", "दा", "दी"], ["दू", "थ", "झ", "ञ"], ["दे", "दो", "च", "ची"],
];

const HL = ({ children, isDark }) => (
  <span className={`${isDark ? 'text-yellow-400' : 'text-red-700'} font-black px-1`}>{children}</span>
);

export const SankalpaProse = ({ birth, result, isDark = false }) => {
  const dt = new Date(result.birthUtc);
  const bs = adToBs(dt);
  
  const dispYear = dt.getFullYear();
  const dispMonth = dt.getMonth() + 1;
  const dispDay = dt.getDate();
  const hh = dt.getHours();
  const mm = dt.getMinutes();
  const ss = dt.getSeconds();

  const sun = result.planets.find((p) => p.key === "Sun");
  const moon = result.planets.find((p) => p.key === "Moon");
  const sunSign = sun.rashi;
  const solarMonth = SOLAR_MONTHS_NE[sunSign];
  const ritu = RITU_NE[sunSign];
  const ayana = ayanaNe(sunSign);
  const { paksha, tithiName } = tithiInfo(sun.longitude, moon.longitude);
  const vara = VARA_NE[dt.getDay()];

  const vikram = bs.year;
  const saka = dispYear - 78;

  const moonNak = moon.nakshatra;
  const nakName = NAKSHATRA_NE[moonNak];
  const aksharaList = NAKSHATRA_AKSHARA[moonNak];
  const akshara = aksharaList[(moon.pada - 1) % 4];
  const yoni = YONI_NE[moonNak];
  const gana = GANA_NE[moonNak];
  const nadi = NADI_NE[moonNak];
  const varna = VARNA_NE[moon.rashi];
  const moonRashiName = RASHI_NE[moon.rashi];
  const moonRashiLord = RASHI_LORD_NE[moon.rashi];
  const lagnaName = RASHI_NE[result.lagnaRashi];

  const D = (n) => toDevanagariNum(n);

  const containerStyles = isDark 
    ? "bg-white/5 border-white/10 text-gray-300 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
    : "bg-orange-50/50 border-orange-200 text-gray-800 shadow-inner";

  return (
    <div className={`border rounded-[2.5rem] p-8 md:p-10 mb-8 font-serif leading-relaxed text-[16px] ${containerStyles}`}>
      <p>
        श्रीशालिवाहनशके <HL isDark={isDark}>{D(saka)}</HL> श्रीवीरविक्रमादित्यसंवत् <HL isDark={isDark}>{D(vikram)}</HL>{" "}
        ईसवीयसन् <HL isDark={isDark}>{D(dispYear)}</HL> अत्रास्मिन् वर्षे प्रवर्तमाने श्री सूर्य{" "}
        <HL isDark={isDark}>{ayana}</HL> अयने <HL isDark={isDark}>{ritu}</HL> ऋतौ अथ चान्द्रमानेन{" "}
        <HL isDark={isDark}>{solarMonth}</HL> मासे <HL isDark={isDark}>{paksha}</HL> पक्षे आगते <HL isDark={isDark}>{vara}</HL>{" "}
        <HL isDark={isDark}>{tithiName}</HL> तिथौ
      </p>

      <p className="mt-6">
        तस्मिन् दिने <HL isDark={isDark}>{nakName}</HL> नक्षत्रे जन्मसमये भुक्ति घटिकादयः{" "}
        <HL isDark={isDark}>{D(moon.pada)}</HL> पाद, चन्द्रमानेन <HL isDark={isDark}>{moonRashiName}</HL> राशौ{" "}
        राशिपति <HL isDark={isDark}>{moonRashiLord}</HL>। पश्चात् सौरमानेन <HL isDark={isDark}>{solarMonth}</HL>{" "}
        मासे, तदनुसारं विक्रमसंवत् <HL isDark={isDark}>{D(vikram)}</HL> तथा ईसवीय सन्{" "}
        <HL isDark={isDark}>{D(dispYear)}/{D(dispMonth)}/{D(dispDay)}</HL> प्रामाणिक{" "}
        <HL isDark={isDark}>{D(hh)}:{D(String(mm).padStart(2, "0"))}:{D(String(ss).padStart(2, "0"))}</HL>{" "}
        समये स्थानीयसूर्योदयदृष्ट इष्टघटिकादि, तदा लग्ने{" "}
        <HL isDark={isDark}>{lagnaName}</HL>, नवमांशे <HL isDark={isDark}>{RASHI_NE[result.charts.D9["Lagna"]]}</HL>,{" "}
        चन्द्रराशौ <HL isDark={isDark}>{moonRashiName}</HL>।
      </p>

      <p className="mt-6">
        एवंविधे <HL isDark={isDark}>Nepal</HL> देशे <HL isDark={isDark}>{birth.districtNe || birth.birthPlace}</HL> निवसतः{" "}
        रत्नम् अजीजनत्। अस्य होराशास्त्रप्रमाणेन <HL isDark={isDark}>{nakName}</HL> नक्षत्रस्य{" "}
        <HL isDark={isDark}>{D(moon.pada)}</HL> चरणत्वेन '<HL isDark={isDark}>{akshara}</HL>' काराक्षरं{" "}
        <HL isDark={isDark}>{moonRashiName}</HL> राशि, <HL isDark={isDark}>{yoni}</HL> योनि, <HL isDark={isDark}>{nadi}</HL>{" "}
        नाडी, <HL isDark={isDark}>{gana}</HL> गण, <HL isDark={isDark}>{varna}</HL> वर्ण, <HL isDark={isDark}>{lagnaName}</HL>{" "}
        लग्न शुभ नाम <HL isDark={isDark}>{birth.name}</HL> पूर्वाह्ण प्रतिष्ठितम्।
      </p>
    </div>
  );
};
