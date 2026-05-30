// frontend/src/components/VedicKundali/GrahaSthitiTable.jsx
import React from 'react';
import {
  PLANETS_NE,
  RASHI_NE,
  RASHI_LORD_NE,
  NAKSHATRA_NE,
  toDevanagariNum,
  degToDMS,
} from "../../lib/vedic/constants";

export const GrahaSthitiTable = ({ result, isDark = false }) => {
  const styles = isDark 
    ? {
        bg: "bg-black/40",
        border: "border-white/10",
        header: "bg-white/10 text-yellow-400",
        row: "border-white/5 text-gray-200 hover:bg-white/5",
        accent: "text-yellow-500",
        title: "text-yellow-500"
      }
    : {
        bg: "bg-white",
        border: "border-orange-200",
        header: "bg-orange-100 text-orange-900",
        row: "border-orange-50 hover:bg-orange-50/30 text-gray-800",
        accent: "text-orange-900",
        title: "text-orange-900"
      };

  return (
    <div className={`${styles.bg} rounded-[2rem] shadow-2xl border ${styles.border} p-6 backdrop-blur-md`}>
      <h3 className={`text-2xl font-bold ${styles.title} mb-6 flex items-center gap-3`}>
        {/* <span className="text-3xl">🔭</span> */}
        ग्रह स्थिति तालिका — Planetary Positions
      </h3>
      <div className="overflow-hidden rounded-2xl border border-white/5">
        <table className="w-full text-[10px] md:text-sm text-left border-collapse">
          <thead>
            <tr className={`${styles.header} font-bold`}>
              <th className="p-2 md:p-4">ग्रह</th>
              <th className="p-2 md:p-4">राशि</th>
              <th className="p-2 md:p-4">अंश</th>
              <th className="p-2 md:p-4">नक्षत्र</th>
              <th className="p-2 md:p-4 hidden sm:table-cell">पाद</th>
              <th className="p-2 md:p-4">भाव</th>
              <th className="p-2 md:p-4 hidden md:table-cell">राशिपति</th>
            </tr>
          </thead>
          <tbody>
            <tr className={`${styles.row} font-medium bg-white/5`}>
              <td className="p-2 md:p-4 font-bold text-yellow-500">{PLANETS_NE.Lagna}</td>
              <td className="p-2 md:p-4">{RASHI_NE[result.lagnaRashi]}</td>
              <td className="p-2 md:p-4 font-mono text-[9px] md:text-xs tracking-tighter">{degToDMS(result.lagnaDegInRashi)}</td>
              <td className="p-2 md:p-4">{NAKSHATRA_NE[result.lagnaNakshatra]}</td>
              <td className="p-2 md:p-4 hidden sm:table-cell">{toDevanagariNum(result.lagnaPada)}</td>
              <td className="p-2 md:p-4">{toDevanagariNum(1)}</td>
              <td className="p-2 md:p-4 hidden md:table-cell">{RASHI_LORD_NE[result.lagnaRashi]}</td>
            </tr>
            {result.planets.map((p) => (
              <tr key={p.key} className={`${styles.row} border-t`}>
                <td className="p-2 md:p-4 font-bold">
                  {PLANETS_NE[p.key]}
                  {p.retrograde && p.key !== "Rahu" && p.key !== "Ketu" && (
                    <span className="text-red-400 ml-1 md:ml-2 text-[9px] md:text-xs font-black">(व)</span>
                  )}
                </td>
                <td className="p-2 md:p-4">{RASHI_NE[p.rashi]}</td>
                <td className="p-2 md:p-4 font-mono text-[9px] md:text-xs tracking-tighter">{degToDMS(p.degInRashi)}</td>
                <td className="p-2 md:p-4">{NAKSHATRA_NE[p.nakshatra]}</td>
                <td className="p-2 md:p-4 hidden sm:table-cell">{toDevanagariNum(p.pada)}</td>
                <td className="p-2 md:p-4">{toDevanagariNum(p.house)}</td>
                <td className="p-2 md:p-4 hidden md:table-cell">{RASHI_LORD_NE[p.rashi]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
