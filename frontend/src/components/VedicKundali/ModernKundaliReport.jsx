// frontend/src/components/VedicKundali/ModernKundaliReport.jsx
import React from 'react';
import { KundaliChart } from "./KundaliChart";
import { GrahaSthitiTable } from "./GrahaSthitiTable";
import { VimshottariDashaTable } from "./VimshottariDashaTable";
import { AshtakavargaTable } from "./AshtakavargaTable";
import { SankalpaProse } from "./SankalpaProse";
import { RASHI_NE, NAKSHATRA_NE, toDevanagariNum, degToDMS } from "../../lib/vedic/constants";
// import { Download, Printer } from "lucide-react";

export const ModernKundaliReport = ({ kundaliData }) => {
  const result = kundaliData.chartData;
  const bd = kundaliData.birthDetails || {};
  
  // Robustly format the AD date without timezone shift
  const formatAdDate = (dateVal) => {
    if (!dateVal) return "N/A";
    const d = new Date(dateVal);
    // If it's an invalid date, return raw
    if (isNaN(d.getTime())) return String(dateVal);
    // Use local components to preserve the calendar date
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const birth = {
    name: kundaliData.name,
    birthPlace: bd.place || kundaliData.birthPlace,
    districtNe: bd.districtNe || bd.place || kundaliData.birthPlace,
    bsLabel: bd.bsDate || "N/A",
    adDate: formatAdDate(bd.date || kundaliData.birthDate),
    timeLabel: bd.time || kundaliData.birthTime,
    latitude: kundaliData.latitude || 27.7,
    longitude: kundaliData.longitude || 85.3,
  };

  const handlePrint = () => window.print();

  const handlePdf = async () => {
    const el = document.getElementById("kundali-report-print");
    if (!el) return;
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      html2pdf()
        .set({
          margin: 8,
          filename: `RashiBazar-Kundali-${birth.name.replace(/\s+/g, "_")}.pdf`,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#080517" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(el)
        .save();
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  if (!result) return <div className="text-white text-center py-10">No chart data available</div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center no-print p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
        <button 
          onClick={handlePrint} 
          className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-medium border border-white/10"
        >
          {/* <Printer className="h-4 w-4" />  */}
          Print Report
        </button>
        <button 
          onClick={handlePdf} 
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-400 hover:to-red-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20"
        >
          {/* <Download className="h-4 w-4" />  */}
          Download Premium PDF
        </button>
      </div>

      {/* Main Report Container */}
      <div 
        id="kundali-report-print" 
        className="bg-[#080517] p-8 md:p-12 rounded-[2.5rem] shadow-2xl border-4 border-yellow-500/30 relative overflow-hidden text-white"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* Background Starfield Pattern (Purely CSS) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none starfield"></div>
        
        {/* Decorative corner ornaments */}
        <div className="absolute top-6 left-6 text-yellow-500/40 text-4xl">✧</div>
        <div className="absolute top-6 right-6 text-yellow-500/40 text-4xl">✧</div>
        <div className="absolute bottom-6 left-6 text-yellow-500/40 text-4xl">✧</div>
        <div className="absolute bottom-6 right-6 text-yellow-500/40 text-4xl">✧</div>

        {/* Header */}
        <div className="relative z-10 text-center mb-12">
          <p className="text-yellow-400 font-bold text-lg mb-2 tracking-[0.2em] opacity-80">॥ ॐ श्री गणेशाय नमः ॥</p>
          <div className="flex items-center justify-center gap-6 my-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-yellow-500/50"></div>
            <div className="p-3 bg-yellow-500/10 rounded-full border border-yellow-500/30">
              <span className="text-4xl">🕉️</span>
            </div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-yellow-500/50"></div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-b from-yellow-200 via-yellow-500 to-amber-700 bg-clip-text text-transparent mt-4 mb-2">
            RashiBazar
          </h1>
          <h2 className="text-2xl font-bold text-gray-300">जन्म कुण्डली — Janma Kundali</h2>
          <div className="mt-2 text-sm text-yellow-500/60 uppercase tracking-[0.3em]">Direction Through Stars</div>
        </div>

        {/* Birth Summary Card */}
        <div className="relative z-10 grid md:grid-cols-2 gap-8 mb-12 bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl">
          <div className="space-y-4">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400 font-medium">नाम (Name)</span>
              <span className="font-bold text-yellow-400 text-xl">{birth.name}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400 font-medium">स्थान (Place)</span>
              <span className="font-bold text-white">{birth.birthPlace}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400 font-medium">मिति (BS)</span>
              <span className="font-bold text-white">{birth.bsLabel}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400 font-medium">मिति (AD)</span>
              <span className="font-bold text-white">{birth.adDate}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400 font-medium">समय (Time)</span>
              <span className="font-bold text-white">{birth.timeLabel}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400 font-medium">लग्न (Ascendant)</span>
              <span className="font-bold text-yellow-500">{RASHI_NE[result.lagnaRashi]}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400 font-medium">राशि (Moon)</span>
              <span className="font-bold text-yellow-500">{RASHI_NE[result.moonRashi]}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400 font-medium">नक्षत्र (Nakshatra)</span>
              <span className="font-bold text-white">{NAKSHATRA_NE[result.moonNakshatra]}</span>
            </div>
          </div>
        </div>

        {/* Traditional Prose */}
        <div className="relative z-10 mb-12">
          <SankalpaProse birth={birth} result={result} isDark={true} />
        </div>

        {/* Charts Section */}
        <div className="relative z-10 grid lg:grid-cols-2 gap-12 my-12">
          <KundaliChart
            title="लग्न कुण्डली"
            titleEn="Lagna (D1) — Birth Chart"
            positions={result.charts.D1}
            lagnaSign={result.lagnaRashi}
            size={400}
            isDark={true}
          />
          <KundaliChart
            title="नवांश कुण्डली"
            titleEn="Navamsha (D9) — Marriage"
            positions={result.charts.D9}
            lagnaSign={result.charts.D9["Lagna"]}
            size={400}
            isDark={true}
          />
        </div>

        {/* Tables Section */}
        <div className="relative z-10 space-y-12">
          <GrahaSthitiTable result={result} isDark={true} />
          <div className="grid lg:grid-cols-2 gap-12">
            <VimshottariDashaTable result={result} isDark={true} />
            <AshtakavargaTable result={result} isDark={true} />
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-16 pt-10 border-t border-white/10 text-center text-gray-400">
          <p className="text-sm italic opacity-60">This report is calculated using High-Precision Astronomy Engine and Lahiri Ayanamsa.</p>
          <div className="mt-6 flex flex-col items-center">
            <div className="h-12 w-px bg-gradient-to-b from-yellow-500/50 to-transparent"></div>
            <p className="mt-4 text-2xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">॥ शुभम् भवतु ॥</p>
            <div className="text-[10px] mt-8 uppercase tracking-[0.5em] opacity-30">RashiBazar © 2026</div>
          </div>
        </div>
      </div>
    </div>
  );
};
