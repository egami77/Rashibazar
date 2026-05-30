// src/pages/Compatibility.jsx
import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MapPin, Calendar, Clock, Heart, RotateCcw, ShieldCheck, AlertCircle, ChevronRight, User, Save, Trash2, History, RefreshCw } from "lucide-react";
import { checkCompatibility, saveCompatibility, getCompatibilityHistory, deleteCompatibility } from "../services/kundali";
import { DISTRICTS } from "../lib/vedic/districts";
import { RASHI_NE, RASHI_EN, NAKSHATRA_NE, toDevanagariNum } from "../lib/vedic/constants";
import { adToBs, bsToAd, BS_MONTHS_NE } from "../lib/vedic/bs-date";
import Layout from "../components/Layout";
import toast from "react-hot-toast";

const PartnerInput = ({ label, icon, value, onChange, colorTheme }) => {
  const [mode, setMode] = useState("bs"); // AD/BS toggle
  
  // Local BS state for the picker
  const today = useMemo(() => adToBs(new Date()), []);
  const [bsYear, setBsYear] = useState(today.year - 25);
  const [bsMonth, setBsMonth] = useState(6);
  const [bsDay, setBsDay] = useState(15);
  
  const bsYears = useMemo(() => {
    const list = [];
    for (let y = 1980; y <= 2100; y++) list.push(y);
    return list;
  }, []);

  // Use props directly for the main inputs
  const currentAdDate = value.birthDate || "2000-01-01";
  const [currentHour, currentMinute] = (value.birthTime || "10:00").split(":");

  const handleUpdate = (updates) => {
    const newState = { ...value, ...updates };
    
    let finalDate = newState.birthDate;
    if (updates.bsYear || updates.bsMonth || updates.bsDay || updates.mode) {
      const targetMode = updates.mode || mode;
      if (targetMode === "bs") {
        try {
          const ad = bsToAd(updates.bsYear || bsYear, updates.bsMonth || bsMonth, updates.bsDay || bsDay);
          const y = ad.getFullYear();
          const m = String(ad.getMonth() + 1).padStart(2, '0');
          const d = String(ad.getDate()).padStart(2, '0');
          finalDate = `${y}-${m}-${d}`;
        } catch(e) {}
      } else if (updates.adDate) {
        finalDate = updates.adDate;
      }
    } else if (updates.adDate) {
      finalDate = updates.adDate;
    }

    const h = updates.hour || currentHour;
    const m = updates.minute || currentMinute;
    const d = updates.district || value.district;

    onChange({
      ...newState,
      birthDate: finalDate,
      birthTime: `${h}:${m}`,
      district: d,
    });
  };

  const themeClasses = colorTheme === "blue" 
    ? "from-blue-500/50 via-transparent to-indigo-500/50" 
    : "from-pink-500/50 via-transparent to-rose-500/50";
  
  const iconBg = colorTheme === "blue" ? "from-blue-400 to-indigo-600" : "from-pink-400 to-rose-600";

  return (
    <div className={`relative p-[2px] rounded-[2.5rem] bg-gradient-to-br ${themeClasses} shadow-2xl h-full`}>
      <div className="relative bg-black/40 backdrop-blur-sm p-6 md:p-8 rounded-[2.4rem] space-y-6 overflow-hidden h-full border border-purple-600/30">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <div className={`h-12 w-12 bg-gradient-to-br ${iconBg} rounded-full flex items-center justify-center shadow-lg shadow-black/20`}>
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white tracking-tight">{label}</h3>
            <p className="text-sm text-gray-400">Enter details</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-semibold uppercase tracking-widest ml-1">Full Name / नाम</label>
            <input
              type="text"
              placeholder="Enter name..."
              value={value.name}
              onChange={(e) => onChange({ ...value, name: e.target.value })}
              className="w-full bg-black/40 border border-purple-600/30 rounded-full px-5 py-3 text-white outline-none focus:border-purple-500 transition-all"
            />
          </div>

          {/* Date Toggle & Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-gray-300 text-sm font-semibold uppercase tracking-widest ml-1">Birth Date</label>
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                <button 
                  type="button"
                  onClick={() => { setMode("bs"); handleUpdate({ mode: "bs" }); }}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${mode === 'bs' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                >BS</button>
                <button 
                  type="button"
                  onClick={() => { setMode("ad"); handleUpdate({ mode: "ad" }); }}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${mode === 'ad' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                >AD</button>
              </div>
            </div>

            {mode === "bs" ? (
              <div className="grid grid-cols-3 gap-2">
                <select 
                  value={bsYear} 
                  onChange={(e) => { const v = parseInt(e.target.value); setBsYear(v); handleUpdate({ bsYear: v }); }}
                  className="bg-black/40 border border-purple-600/30 rounded-xl px-2 py-3 text-white text-xs outline-none focus:border-purple-500 appearance-none cursor-pointer text-center"
                >
                  {bsYears.map(y => <option key={y} value={y} className="bg-slate-900">{toDevanagariNum(y)}</option>)}
                </select>
                <select 
                  value={bsMonth} 
                  onChange={(e) => { const v = parseInt(e.target.value); setBsMonth(v); handleUpdate({ bsMonth: v }); }}
                  className="bg-black/40 border border-purple-600/30 rounded-xl px-2 py-3 text-white text-xs outline-none focus:border-purple-500 appearance-none cursor-pointer text-center"
                >
                  {BS_MONTHS_NE.map((m, i) => <option key={i+1} value={i+1} className="bg-slate-900">{m}</option>)}
                </select>
                <select 
                  value={bsDay} 
                  onChange={(e) => { const v = parseInt(e.target.value); setBsDay(v); handleUpdate({ bsDay: v }); }}
                  className="bg-black/40 border border-purple-600/30 rounded-xl px-2 py-3 text-white text-xs outline-none focus:border-purple-500 appearance-none cursor-pointer text-center"
                >
                  {Array.from({length: 32}, (_, i) => i+1).map(d => <option key={d} value={d} className="bg-slate-900">{toDevanagariNum(d)}</option>)}
                </select>
              </div>
            ) : (
              <input
                type="date"
                value={currentAdDate}
                onChange={(e) => handleUpdate({ adDate: e.target.value })}
                className="w-full bg-black/40 border border-purple-600/30 rounded-full px-5 py-3 text-white text-sm outline-none focus:border-purple-500 [color-scheme:dark]"
              />
            )}
          </div>

          {/* Time & Place */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-gray-300 text-sm font-semibold uppercase tracking-widest ml-1">Time</label>
              <div className="grid grid-cols-2 gap-1">
                <select value={currentHour} onChange={(e) => handleUpdate({ hour: e.target.value })} className="bg-black/40 border border-purple-600/30 rounded-xl px-1 py-3 text-white text-xs outline-none appearance-none text-center focus:border-purple-500">
                  {Array.from({length: 24}, (_, i) => String(i).padStart(2, '0')).map(h => <option key={h} value={h} className="bg-slate-900">{h}</option>)}
                </select>
                <select value={currentMinute} onChange={(e) => handleUpdate({ minute: e.target.value })} className="bg-black/40 border border-purple-600/30 rounded-xl px-1 py-3 text-white text-xs outline-none appearance-none text-center focus:border-purple-500">
                  {Array.from({length: 60}, (_, i) => String(i).padStart(2, '0')).map(m => <option key={m} value={m} className="bg-slate-900">{m}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-gray-300 text-sm font-semibold uppercase tracking-widest ml-1">District</label>
              <select 
                value={value.district} 
                onChange={(e) => { 
                  const d = DISTRICTS.find(x => x.name === e.target.value);
                  handleUpdate({ district: e.target.value, latitude: d.lat, longitude: d.lon });
                }}
                className="w-full bg-black/40 border border-purple-600/30 rounded-full px-2 py-3 text-white text-sm outline-none appearance-none cursor-pointer focus:border-purple-500"
              >
                {DISTRICTS.map(d => <option key={d.name} value={d.name} className="bg-slate-900">{d.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Compatibility = () => {
  const [partner1, setPartner1] = useState({ name: "", birthDate: "2000-01-01", birthTime: "10:00", district: "Kathmandu", latitude: 27.7, longitude: 85.3 });
  const [partner2, setPartner2] = useState({ name: "", birthDate: "2000-01-01", birthTime: "10:00", district: "Kathmandu", latitude: 27.7, longitude: 85.3 });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("results"); // results, remedies
  const [activeMainTab, setActiveMainTab] = useState("form"); // form, results, history
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [savingCompatibility, setSavingCompatibility] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, recordId: null });

  // Fetch compatibility history on mount
  useEffect(() => {
    fetchCompatibilityHistory();
  }, []);

  const fetchCompatibilityHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await getCompatibilityHistory();
      setHistory(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (!partner1.name || !partner2.name) return;
    setLoading(true);
    try {
      const response = await checkCompatibility({ partner1, partner2, save: true });
      setResult(response.data);
      setActiveTab("results");
      setActiveMainTab("results");
      fetchCompatibilityHistory();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate compatibility");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompatibility = async () => {
    if (!result) return;
    setSavingCompatibility(true);
    try {
      await saveCompatibility({ partner1, partner2 });
      await fetchCompatibilityHistory();
      toast.success("Compatibility saved successfully!");
    } catch (error) {
      console.error("Error saving compatibility:", error);
      toast.error("Failed to save compatibility");
    } finally {
      setSavingCompatibility(false);
    }
  };

  const handleConfirmDelete = async () => {
    const { recordId } = deleteModal;
    try {
      await deleteCompatibility(recordId);
      setHistory(prev => prev.filter(item => item._id !== recordId));
      setDeleteModal({ isOpen: false, recordId: null });
      toast.success("Compatibility record deleted!");
    } catch (error) {
      console.error("Error deleting compatibility:", error);
      toast.error("Failed to delete compatibility record");
    }
  };

  const loadFromHistory = (item) => {
    setPartner1({
      name: item.partner1.name,
      birthDate: item.partner1.birthDate,
      birthTime: item.partner1.birthTime,
      district: item.partner1.district,
      latitude: item.partner1.latitude,
      longitude: item.partner1.longitude
    });
    setPartner2({
      name: item.partner2.name,
      birthDate: item.partner2.birthDate,
      birthTime: item.partner2.birthTime,
      district: item.partner2.district,
      latitude: item.partner2.latitude,
      longitude: item.partner2.longitude
    });
    setResult({
      score: item.score,
      maxScore: item.maxScore,
      percentage: item.percentage,
      verdict: item.verdict,
      verdictColor: item.verdictColor,
      koots: item.koots,
      partner1: item.partner1,
      partner2: item.partner2,
      doshas: item.doshas
    });
    setActiveTab("results");
    setActiveMainTab("results");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getScoreColor = (obtained, max) => {
    const p = (obtained / max) * 100;
    if (p >= 80) return "text-emerald-400";
    if (p >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <Layout>
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-purple-900 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-indigo-900 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 w-full py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-pink-400 text-sm font-semibold tracking-widest uppercase">
            <Sparkles className="w-4 h-4" />
            Ashtakoot Milan
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-wide text-white mb-4">
            Divine <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">Union</span>
          </h1>
          <p className="text-purple-200 text-lg max-w-xl mx-auto">Matching the cosmic frequencies of two souls through ancient Vedic wisdom.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-10">
          <div className="bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 flex gap-2">
            <button
              onClick={() => setActiveMainTab('form')}
              className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${activeMainTab === 'form' ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black shadow-lg hover:scale-105' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
            >
              <RefreshCw className="h-4 w-4" />
              New Compatibility
            </button>
            <button
              onClick={() => setActiveMainTab('results')}
              disabled={!result}
              className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${activeMainTab === 'results' ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black shadow-lg hover:scale-105' : 'text-gray-300 hover:text-white hover:bg-white/10'} ${!result ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart className="h-4 w-4" />
              View Result
            </button>
            <button
              onClick={() => setActiveMainTab('history')}
              className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${activeMainTab === 'history' ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black shadow-lg hover:scale-105' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
            >
              <History className="h-4 w-4" />
              History
            </button>
          </div>
        </div>

        {/* Main Contents based on Tab */}
        <div className="min-h-[500px]">
          {activeMainTab === "form" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
              <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                <PartnerInput label="Partner 1 (Groom)" value={partner1} onChange={setPartner1} colorTheme="blue" />
                <PartnerInput label="Partner 2 (Bride)" value={partner2} onChange={setPartner2} colorTheme="pink" />
              </div>

              <div className="flex justify-center">
                <button 
                  onClick={handleCalculate}
                  disabled={loading || !partner1.name || !partner2.name}
                  className="group relative px-16 py-4 rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
                >
                  <div className="flex items-center gap-4 text-black font-semibold text-xl tracking-wide">
                    {loading ? (
                      <div className="h-6 w-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <Heart className="w-6 h-6 fill-black text-black" />
                        Check Compatibility
                      </>
                    )}
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {activeMainTab === "results" && result && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setActiveMainTab("form")} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors py-2 px-4 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest">
                  <RotateCcw className="w-4 h-4" />
                  Reset Form
                </button>
                <div className="flex bg-black/40 p-1 rounded-full border border-purple-600/30">
                  <button onClick={() => setActiveTab("results")} className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'results' ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-black' : 'text-gray-400'}`}>Score</button>
                  <button onClick={() => setActiveTab("remedies")} className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'remedies' ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-black' : 'text-gray-400'}`}>Remedies</button>
                </div>
              </div>

              {activeTab === "results" ? (
                <div className="space-y-8">
                  {/* Partner Details at the Top */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {[result.partner1, result.partner2].map((p, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-8 rounded-xl bg-black/40 border border-purple-600/30 backdrop-blur-sm relative overflow-hidden group shadow-xl"
                      >
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${idx === 0 ? 'from-blue-500/10 to-indigo-500/10' : 'from-pink-500/10 to-rose-500/10'} blur-3xl`} />
                        
                        <div className="flex items-center gap-5 relative z-10">
                          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${idx === 0 ? 'from-blue-400 to-indigo-600' : 'from-pink-400 to-rose-600'} flex items-center justify-center text-3xl shadow-lg`}>
                            {idx === 0 ? 'G' : 'B'}
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mb-1">
                              {idx === 0 ? 'Groom / बेहुला' : 'Bride / बेहुली'}
                            </p>
                            <h4 className="text-2xl font-bold text-yellow-300 tracking-tight">{p.name}</h4>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5 relative z-10">
                          <div>
                            <p className="text-xs text-purple-300 font-semibold uppercase tracking-widest mb-1">Rashi / राशि</p>
                            <p className="text-lg font-bold text-white tracking-tight">{RASHI_EN[p.rashi] || p.rashi}</p>
                            <p className="text-[10px] text-yellow-500/50 font-bold uppercase">{RASHI_NE[p.rashi] || p.rashi}</p>
                          </div>
                          <div>
                            <p className="text-xs text-purple-300 font-semibold uppercase tracking-widest mb-1">Nakshatra / नक्षत्र</p>
                            <p className="text-lg font-bold text-white tracking-tight">{NAKSHATRA_NE[p.nakshatra] || p.nakshatra}</p>
                            <p className="text-[10px] text-yellow-500/50 font-bold uppercase">Pada {toDevanagariNum(p.pada)}</p>
                          </div>
                          <div className="col-span-2 mt-2">
                             <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${p.mangalDosha ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'} text-xs font-black uppercase tracking-widest`}>
                                {p.mangalDosha ? '❌' : '✅'}
                                Mangal Dosha: {p.mangalDosha ? 'Present' : 'Absent'}
                             </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Result Header - Certificate Style */}
                  <div className="relative p-12 rounded-xl bg-black/40 border border-purple-600/30 backdrop-blur-sm overflow-hidden shadow-2xl text-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
                    
                    <div className="relative z-10 flex flex-col items-center gap-8">
                      <div className="relative w-48 h-48 flex items-center justify-center">
                         <svg className="w-full h-full -rotate-90">
                          <circle cx="96" cy="96" r="88" className="stroke-white/5 fill-none" strokeWidth="12" />
                          <motion.circle cx="96" cy="96" r="88" className={`fill-none ${result.score >= 28 ? 'stroke-emerald-500' : result.score >= 18 ? 'stroke-amber-500' : 'stroke-rose-500'}`} strokeWidth="12" strokeLinecap="round" initial={{ strokeDashoffset: 552 }} animate={{ strokeDashoffset: 552 - (552 * (result.score / 36)) }} transition={{ duration: 1.5 }} strokeDasharray="552" />
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-6xl font-black text-white tracking-tighter">{result.score}</span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Score</span>
                         </div>
                      </div>

                      <div className="space-y-3">
                        <h2 className={`text-5xl font-bold ${result.verdictColor} tracking-tight`}>{result.verdict}</h2>
                        <p className="text-lg text-purple-200 max-w-2xl mx-auto">{result.verdictDescription}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full pt-8 border-t border-white/5">
                        {[
                          { l: "Match Percentage", v: `${result.percentage}%`, sub: "Cosmic Score" },
                          { l: "Nadi Dosha", v: result.doshas?.nadi ? "Present" : "Absent", sub: "Check" },
                          { l: "Bhakoot Dosha", v: result.doshas?.bhakoot ? "Present" : "Absent", sub: "Check" }
                        ].map((item, i) => (
                          <div key={i} className="space-y-1">
                            <p className="text-xs text-purple-300 font-semibold uppercase tracking-widest">{item.l}</p>
                            <p className="text-lg font-bold text-white tracking-tight">{item.v}</p>
                            <p className="text-[10px] text-yellow-500/50 font-bold uppercase">{item.sub}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Ashtakoot Detail Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {result.koots && result.koots.map((k, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-6 rounded-xl bg-black/40 border border-purple-600/30 hover:border-purple-500 transition-all shadow-md group">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] font-black text-gray-500 group-hover:text-yellow-500/80 transition-colors uppercase tracking-[0.2em]">{k.nameSanskrit || k.name}</span>
                          <span className={`text-xl font-black ${getScoreColor(k.obtained, k.maxPoints || k.maximum)}`}>{k.obtained}/{k.maxPoints || k.maximum}</span>
                        </div>
                        <h4 className="text-sm font-bold text-pink-400 uppercase tracking-tight mb-2">{k.name}</h4>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-medium">{k.explanation || k.detail}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-8 md:p-12 rounded-xl bg-black/40 border border-purple-600/30 backdrop-blur-sm space-y-8">
                  <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                    <ShieldCheck className="w-8 h-8 text-yellow-400" />
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-300 tracking-tight">Divine Remedies</h2>
                      <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Spiritual corrections for harmony</p>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    {result.doshas?.nadi && (
                      <div className="flex gap-6 p-6 rounded-xl bg-rose-500/10 border border-rose-500/30">
                         <AlertCircle className="w-8 h-8 text-rose-500 shrink-0" />
                         <div className="space-y-2">
                           <h4 className="text-xl font-bold text-rose-400 tracking-tight">Nadi Dosha Remedy</h4>
                           <p className="text-gray-400 font-medium leading-relaxed">Perform Mahamrityunjaya Mantra Jaap (11,000 times) and donate gold, cloth, and grains to a qualified Brahmin to mitigate health risks for future progeny.</p>
                         </div>
                      </div>
                    )}
                    {result.doshas?.bhakoot && (
                      <div className="flex gap-6 p-6 rounded-xl bg-amber-500/10 border border-amber-500/30">
                         <Sparkles className="w-8 h-8 text-amber-500 shrink-0" />
                         <div className="space-y-2">
                           <h4 className="text-xl font-bold text-amber-400 tracking-tight">Bhakoot Dosha Remedy</h4>
                           <p className="text-gray-400 font-medium leading-relaxed">Perform Vishnu Puja or Santan Gopal Puja. Worshiping Lord Krishna and performing charity on Thursdays will bring financial and emotional stability.</p>
                         </div>
                      </div>
                    )}
                    <div className="flex gap-6 p-6 rounded-xl bg-blue-500/10 border border-blue-500/30">
                       <Heart className="w-8 h-8 text-blue-500 shrink-0 fill-blue-500" />
                       <div className="space-y-2">
                         <h4 className="text-xl font-bold text-blue-400 tracking-tight">General Marital Harmony</h4>
                         <p className="text-gray-400 font-medium leading-relaxed">Regularly recite the Vishnu Sahasranama and perform Gauri-Shankar Puja together to strengthen the bond and ensure a long, happy life together.</p>
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeMainTab === "history" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
              {historyLoading ? (
                <div className="text-center py-20">
                  <div className="h-10 w-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">Loading history...</p>
                </div>
              ) : history.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-6">
                  {history.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => loadFromHistory(item)}
                      className="group bg-black/40 backdrop-blur-sm border border-purple-600/30 p-6 rounded-xl hover:border-purple-500 transition-all duration-300 cursor-pointer relative hover:shadow-[0_20px_25px_-5px_rgba(168,85,247,0.3)]"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-500/20 p-2 rounded-lg">
                          <Heart className="h-5 w-5 text-pink-400 fill-pink-400" />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteModal({ isOpen: true, recordId: item._id });
                          }}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-semibold text-white tracking-tight">
                            <span className="text-blue-400">{item.partner1.name}</span>
                            <span className="text-purple-400 mx-2">&</span>
                            <span className="text-pink-400">{item.partner2.name}</span>
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm mt-2">
                          <div>
                            <span className="text-gray-400">Score:</span>{" "}
                            <span className={`font-black ${getScoreColor(item.score, item.maxScore)}`}>
                              {item.score}/{item.maxScore}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Match:</span>{" "}
                            <span className="text-white font-bold">{item.percentage}%</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                          <span className={`font-bold ${item.verdictColor}`}>{item.verdict}</span>
                          <span className="text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-black/40 backdrop-blur-sm rounded-xl border border-purple-600/30">
                  <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <History className="h-10 w-10 text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-400 mb-2">No History Yet</h3>
                  <p className="text-gray-500">Your checked compatibility results will appear here.</p>
                  <button
                    onClick={() => setActiveMainTab('form')}
                    className="mt-8 px-8 py-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black font-semibold rounded-full hover:scale-105 transition-all shadow-lg"
                  >
                    Check Your First Compatibility
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black border-2 border-red-500/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Delete Record?</h2>
              <p className="text-gray-400">This action cannot be undone. Are you sure you want to permanently delete this record from history?</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, recordId: null })}
                className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-gray-300 hover:bg-gray-700 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Compatibility;
