// frontend/src/components/VedicKundali/BirthDetailsForm.jsx
import React, { useMemo, useState } from "react";
import { Sparkles, MapPin, Calendar, Clock } from "lucide-react";
import { DISTRICTS } from "../../lib/vedic/districts";
import { adToBs, bsToAd, BS_MONTHS_NE } from "../../lib/vedic/bs-date";
import { toDevanagariNum } from "../../lib/vedic/constants";

export const BirthDetailsForm = ({ onSubmit, loading }) => {
  const [name, setName] = useState("");
  const [mode, setMode] = useState("bs");

  // BS state
  const today = useMemo(() => adToBs(new Date()), []);
  const [bsYear, setBsYear] = useState(today.year - 25);
  const [bsMonth, setBsMonth] = useState(1);
  const [bsDay, setBsDay] = useState(1);

  // AD state
  const [adDate, setAdDate] = useState(new Date().toISOString().slice(0, 10));

  // Time
  const [hour, setHour] = useState("08");
  const [minute, setMinute] = useState("00");

  const [districtName, setDistrictName] = useState("Kathmandu");

  const bsYears = useMemo(() => {
    const list = [];
    for (let y = 1980; y <= today.year; y++) list.push(y);
    return list;
  }, [today.year]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalAdDate;
    if (mode === "bs") {
      try {
        const ad = bsToAd(bsYear, bsMonth, bsDay);
        // Robustly get YYYY-MM-DD from local date components to avoid timezone shift
        const y = ad.getFullYear();
        const m = String(ad.getMonth() + 1).padStart(2, '0');
        const d = String(ad.getDate()).padStart(2, '0');
        finalAdDate = `${y}-${m}-${d}`;
      } catch (err) {
        alert("Invalid Nepali Date");
        return;
      }
    } else {
      finalAdDate = adDate;
    }

    const district = DISTRICTS.find((x) => x.name === districtName) || DISTRICTS[0];

    onSubmit({
      name: name.trim(),
      birthDate: finalAdDate,
      birthTime: `${hour}:${minute}`,
      birthPlace: district.name,
      districtNe: district.nameNe,
      latitude: district.lat,
      longitude: district.lon,
    });
  };

  return (
    <div className="relative p-[2px] rounded-[2.5rem] bg-gradient-to-br from-yellow-500/50 via-transparent to-indigo-500/50 shadow-2xl">
      <form 
        onSubmit={handleSubmit} 
        className="relative bg-[#080517]/90 backdrop-blur-xl p-8 md:p-12 rounded-[2.4rem] space-y-10 overflow-hidden"
      >
        {/* Cosmic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-500/10 blur-[80px] rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 blur-[80px] rounded-full"></div>

        <div className="flex flex-col md:flex-row md:items-center gap-6 border-b border-white/10 pb-8">
          <div className="h-20 w-20 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] shrink-0">
            <Sparkles className="h-10 w-10 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200 uppercase tracking-tighter">
              जन्म विवरण
            </h2>
            <p className="text-gray-400 font-medium tracking-wide">Cosmic Birth Details for Precise Kundali</p>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Name Field */}
          <div className="space-y-3">
            <label className="text-yellow-500/80 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
              पूरा नाम / Full Name
            </label>
            <div className="relative group">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name..."
                className="w-full bg-white/5 border border-white/10 group-hover:border-yellow-500/50 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all outline-none text-lg"
                required
              />
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <label className="text-yellow-500/80 text-xs font-black uppercase tracking-[0.2em]">जन्म मिति / Date of Birth</label>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setMode("bs")}
                  className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${mode === 'bs' ? 'bg-yellow-500 text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  वि.सं. (BS)
                </button>
                <button
                  type="button"
                  onClick={() => setMode("ad")}
                  className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${mode === 'ad' ? 'bg-yellow-500 text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  ई.सं. (AD)
                </button>
              </div>
            </div>

            {mode === "bs" ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-500 font-bold uppercase ml-2">Year</span>
                  <select 
                    value={bsYear} 
                    onChange={(e) => setBsYear(parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white outline-none focus:border-yellow-500 appearance-none cursor-pointer"
                  >
                    {bsYears.map(y => <option key={y} value={y} className="bg-slate-900">{toDevanagariNum(y)}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-500 font-bold uppercase ml-2">Month</span>
                  <select 
                    value={bsMonth} 
                    onChange={(e) => setBsMonth(parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white outline-none focus:border-yellow-500 appearance-none cursor-pointer"
                  >
                    {BS_MONTHS_NE.map((m, i) => <option key={i} value={i+1} className="bg-slate-900">{m}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-500 font-bold uppercase ml-2">Day</span>
                  <select 
                    value={bsDay} 
                    onChange={(e) => setBsDay(parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white outline-none focus:border-yellow-500 appearance-none cursor-pointer"
                  >
                    {Array.from({length: 32}, (_, i) => i + 1).map(d => <option key={d} value={d} className="bg-slate-900">{toDevanagariNum(d)}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="date"
                  value={adDate}
                  onChange={(e) => setAdDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-yellow-500 text-lg [color-scheme:dark]"
                />
              </div>
            )}
          </div>

          {/* Time and Place */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-yellow-500/80 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Clock className="h-3 w-3" /> जन्म समय / Birth Time
              </label>
              <div className="grid grid-cols-2 gap-3">
                <select value={hour} onChange={(e) => setHour(e.target.value)} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white outline-none focus:border-yellow-500 appearance-none cursor-pointer">
                  {Array.from({length: 24}, (_, i) => String(i).padStart(2, '0')).map(h => <option key={h} value={h} className="bg-slate-900">{h} Hrs</option>)}
                </select>
                <select value={minute} onChange={(e) => setMinute(e.target.value)} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white outline-none focus:border-yellow-500 appearance-none cursor-pointer">
                  {Array.from({length: 60}, (_, i) => String(i).padStart(2, '0')).map(m => <option key={m} value={m} className="bg-slate-900">{m} Min</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-yellow-500/80 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <MapPin className="h-3 w-3" /> जन्म स्थान / Birth District
              </label>
              <select 
                value={districtName} 
                onChange={(e) => setDistrictName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-yellow-500 appearance-none cursor-pointer"
              >
                {DISTRICTS.map(d => <option key={d.name} value={d.name} className="bg-slate-900">{d.nameNe} ({d.name})</option>)}
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-[2rem] p-[2px] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-600 to-yellow-400 animate-gradient-x"></div>
          <div className="relative bg-[#080517] hover:bg-transparent transition-colors rounded-[1.9rem] py-6 flex items-center justify-center gap-4">
            {loading ? (
              <div className="h-8 w-8 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
            ) : (
              <>
                <Sparkles className="h-7 w-7 text-yellow-500 group-hover:text-white transition-colors" />
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 group-hover:from-white group-hover:to-white uppercase tracking-tighter">
                  Generate My Kundali
                </span>
              </>
            )}
          </div>
        </button>

        <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] opacity-40">
          Precision Astronomical Calculations • Lahiri Ayanamsa • Vedic Engine
        </p>
      </form>
    </div>
  );
};
