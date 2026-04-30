// frontend/src/components/VedicKundali/VimshottariDashaTable.jsx
import React from 'react';
import { toDevanagariNum } from "../../lib/vedic/constants";

export const VimshottariDashaTable = ({ result, isDark = false }) => {
  const dashas = result.vimshottari.mahaDashas;
  
  const styles = isDark 
    ? {
        bg: "bg-black/40",
        border: "border-white/10",
        header: "bg-white/10 text-yellow-400",
        row: "border-white/5 text-gray-200",
        current: "bg-yellow-500/20 text-yellow-400 font-bold",
        title: "text-yellow-500"
      }
    : {
        bg: "bg-white",
        border: "border-orange-200",
        header: "bg-orange-100 text-orange-900",
        row: "border-orange-50 text-gray-800",
        current: "bg-orange-100/50 font-bold",
        title: "text-orange-900"
      };

  return (
    <div className={`${styles.bg} rounded-[2rem] shadow-2xl border ${styles.border} p-6 backdrop-blur-md h-full`}>
      <h3 className={`text-2xl font-bold ${styles.title} mb-6 flex items-center gap-3`}>
        <span className="text-3xl">⏳</span>
        विंशोत्तरी महादशा — Maha Dasha
      </h3>
      <div className="overflow-x-auto rounded-2xl overflow-hidden border border-white/5">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className={`${styles.header} font-bold`}>
              <th className="p-4">स्वामी (Lord)</th>
              <th className="p-4">सुरुवात (Starts)</th>
              <th className="p-4">अन्त्य (Ends)</th>
              <th className="p-4">अवस्था</th>
            </tr>
          </thead>
          <tbody>
            {dashas.map((d, i) => {
              const isCurrent = new Date() >= new Date(d.startDate) && new Date() < new Date(d.endDate);
              return (
                <tr key={i} className={`${styles.row} border-t ${isCurrent ? styles.current : ''}`}>
                  <td className="p-4">{d.lordNe} <span className="opacity-50 text-xs ml-1">({d.lord})</span></td>
                  <td className="p-4 font-mono text-xs">{new Date(d.startDate).toLocaleDateString()}</td>
                  <td className="p-4 font-mono text-xs">{new Date(d.endDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    {isCurrent ? (
                      <span className="flex items-center gap-1.5 text-xs">
                        <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></span>
                        सक्रिय (Active)
                      </span>
                    ) : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
