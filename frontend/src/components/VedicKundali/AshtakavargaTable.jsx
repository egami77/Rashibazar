// frontend/src/components/VedicKundali/AshtakavargaTable.jsx
import React from 'react';
import { RASHI_NE, toDevanagariNum } from "../../lib/vedic/constants";

export const AshtakavargaTable = ({ result, isDark = false }) => {
  const sav = result.ashtakavarga;
  
  const styles = isDark 
    ? {
        bg: "bg-black/40",
        border: "border-white/10",
        itemBg: "bg-white/5 border-white/5",
        textRashi: "text-gray-400",
        textPoints: "text-yellow-500",
        title: "text-yellow-500"
      }
    : {
        bg: "bg-white",
        border: "border-orange-200",
        itemBg: "bg-orange-50 border-orange-100",
        textRashi: "text-gray-500",
        textPoints: "text-orange-900",
        title: "text-orange-900"
      };

  return (
    <div className={`${styles.bg} rounded-[2rem] shadow-2xl border ${styles.border} p-6 backdrop-blur-md h-full`}>
      <h3 className={`text-2xl font-bold ${styles.title} mb-6 flex items-center gap-3`}>
        {/* <span className="text-3xl"></span> */}
        अष्टकवर्ग — Ashtakavarga (SAV)
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
        {sav.map((points, i) => (
          <div key={i} className={`flex flex-col items-center p-2 sm:p-3 ${styles.itemBg} border rounded-2xl transition-transform hover:scale-105`}>
            <span className={`text-[9px] sm:text-[10px] uppercase tracking-tighter ${styles.textRashi} mb-1`}>{RASHI_NE[i]}</span>
            <span className={`text-xl sm:text-2xl font-black ${styles.textPoints}`}>{toDevanagariNum(points)}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-[10px] text-gray-500 uppercase tracking-widest text-center opacity-60">
        Total Bindus per Sign (Samudaya Ashtakavarga)
      </p>
    </div>
  );
};
