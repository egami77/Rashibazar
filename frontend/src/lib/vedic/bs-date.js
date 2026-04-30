// frontend/src/lib/vedic/bs-date.js
import NepaliDate from "nepali-date-converter";

export function adToBs(date) {
  const n = new NepaliDate(date);
  return { year: n.getYear(), month: n.getMonth() + 1, day: n.getDate() };
}

export function bsToAd(year, month, day) {
  const n = new NepaliDate(year, month - 1, day);
  return n.toJsDate();
}

export const BS_MONTHS_NE = [
  "बैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज",
  "कार्तिक", "मंसिर", "पुष", "माघ", "फागुन", "चैत",
];
