// src/pages/Compatibility.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { performGunaMilan } from "../services/astrology";
import { NEPAL_CITIES } from "../services/kundali";

const Compatibility = () => {
  const [partner1, setPartner1] = useState({
    fullName: "",
    dateOfBirth: "",
    timeOfBirth: "",
    placeOfBirth: ""
  });
  
  const [partner2, setPartner2] = useState({
    fullName: "",
    dateOfBirth: "",
    timeOfBirth: "",
    placeOfBirth: ""
  });
  
  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState("form"); // "form", "results", "remedies"

  const isValid = (data) => {
    return data.fullName && data.dateOfBirth && data.timeOfBirth && data.placeOfBirth;
  };

  const handleCalculate = () => {
    if (!isValid(partner1) || !isValid(partner2)) return;
    
    setIsCalculating(true);
    
    // Simulate calculation delay for better UX
    setTimeout(() => {
      try {
        const matchResult = performGunaMilan(partner1, partner2);
        setResult(matchResult);
        setActiveTab("results");
      } catch (error) {
        console.error("Error calculating compatibility:", error);
      } finally {
        setIsCalculating(false);
      }
    }, 1500);
  };

  const handleReset = () => {
    setResult(null);
    setActiveTab("form");
    setPartner1({
      fullName: "",
      dateOfBirth: "",
      timeOfBirth: "",
      placeOfBirth: ""
    });
    setPartner2({
      fullName: "",
      dateOfBirth: "",
      timeOfBirth: "",
      placeOfBirth: ""
    });
  };

  const BirthDetailsForm = ({ label, icon, value, onChange, color }) => {
    const updateField = (field, val) => {
      onChange({ ...value, [field]: val });
    };

    const bgGradient = color === "purple" 
      ? "bg-gradient-to-br from-purple-900/30 to-purple-900/10" 
      : "bg-gradient-to-br from-pink-900/30 to-pink-900/10";
    
    const borderColor = color === "purple" 
      ? "border-purple-500/40 hover:border-purple-400/60" 
      : "border-pink-500/40 hover:border-pink-400/60";
    
    const shadowColor = color === "purple" 
      ? "shadow-purple-500/10 hover:shadow-purple-500/30" 
      : "shadow-pink-500/10 hover:shadow-pink-500/30";
    
    const bgAccent = color === "purple"
      ? "bg-purple-500/20 group-hover:bg-purple-500/40"
      : "bg-pink-500/20 group-hover:bg-pink-500/40";
    
    const textGradient = color === "purple"
      ? "from-purple-300 to-purple-400"
      : "from-pink-300 to-pink-400";
    
    const inputBorder = color === "purple"
      ? "border-purple-500/30 hover:border-purple-500/50 focus:border-purple-400 focus:ring-purple-400"
      : "border-pink-500/30 hover:border-pink-500/50 focus:border-pink-400 focus:ring-pink-400";

    return (
      <div
        className={`${bgGradient} backdrop-blur-lg rounded-xl border-2 ${borderColor} p-6 transition-all shadow-lg ${shadowColor} group`}
      >
        <div className="mb-6 flex items-center gap-3">
          <div className={`p-3 ${bgAccent} rounded-lg transition-all`}>
            <span className="text-3xl">{icon}</span>
          </div>
          <h3 className={`font-heading text-xl font-bold bg-gradient-to-r ${textGradient} bg-clip-text text-transparent`}>{label}</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter full name"
              value={value.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              className={`w-full p-3 rounded-lg bg-black/30 border ${inputBorder} text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                Date of Birth
              </label>
              <input
                type="date"
                value={value.dateOfBirth}
                onChange={(e) => updateField("dateOfBirth", e.target.value)}
                className={`w-full p-3 rounded-lg bg-black/30 border ${inputBorder} text-white focus:outline-none focus:ring-1 transition-all`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                Time (NST)
              </label>
              <input
                type="time"
                value={value.timeOfBirth}
                onChange={(e) => updateField("timeOfBirth", e.target.value)}
                className={`w-full p-3 rounded-lg bg-black/30 border ${inputBorder} text-white focus:outline-none focus:ring-1 transition-all`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">
              Place of Birth (District)
            </label>
            <select
              value={value.placeOfBirth}
              onChange={(e) => updateField("placeOfBirth", e.target.value)}
              className={`w-full p-3 rounded-lg bg-black/30 border ${inputBorder} text-white focus:outline-none focus:ring-1 transition-all`}
            >
              <option value="" className="bg-gray-900">Select district</option>
              {NEPAL_CITIES.sort().map((city) => (
                <option key={city} value={city} className="bg-gray-900">
                  {city}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-2">✓ Nepal Standard Time (UTC+5:45)</p>
          </div>
        </div>
      </div>
    );
  };

  const ResultsDisplay = ({ result, partner1Name, partner2Name }) => {
    const getScoreColor = (obtained, max) => {
      const percentage = (obtained / max) * 100;
      if (percentage >= 80) return "text-green-400";
      if (percentage >= 60) return "text-yellow-400";
      if (percentage >= 40) return "text-orange-400";
      return "text-red-400";
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-12"
        >
          <motion.div 
            className="inline-block relative"
            whileHover={{ scale: 1.05 }}
          >
            <svg className="w-40 h-40 drop-shadow-2xl">
              <circle
                className="text-gray-700"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="72"
                cx="80"
                cy="80"
              />
              <motion.circle
                initial={{ strokeDashoffset: `${2 * Math.PI * 72}` }}
                animate={{ strokeDashoffset: `${2 * Math.PI * 72 * (1 - result.percentage / 100)}` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={result.verdictColor}
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="72"
                cx="80"
                cy="80"
                strokeDasharray={`${2 * Math.PI * 72}`}
                strokeLinecap="round"
                style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-5xl font-bold text-white">{result.totalObtained}</span>
                <span className="text-gray-400 text-sm">/36</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <h2 className={`text-4xl font-bold mb-3 ${result.verdictColor}`}>
              {result.verdict}
            </h2>
            <p className="text-gray-300 text-lg mb-2">{result.verdictDescription}</p>
            <p className="text-sm text-gray-400 inline-block px-4 py-2 bg-black/30 rounded-full border border-purple-500/30">
              📊 Score: {result.totalObtained}/36 ({result.percentage}%)
            </p>
          </motion.div>
        </motion.div>

        {/* Partner Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 backdrop-blur-lg p-6 rounded-xl border-2 border-blue-500/40 hover:border-blue-400/60 transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/30 group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/40 transition-all">
                <span className="text-2xl">🤵</span>
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-300 to-blue-400 bg-clip-text text-transparent">{partner1Name || "Partner 1"}</h3>
                <p className="text-xs text-gray-400">{result.partner1.rashi}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-black/20 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Rashi (Moon Sign)</p>
                <p className="text-lg font-semibold text-blue-300">{result.partner1.rashi}</p>
              </div>
              
              <div className="p-3 bg-black/20 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Nakshatra</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-lg font-semibold text-blue-300">{result.partner1.nakshatra}</span>
                  <span className="px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-300">Pada {result.partner1.nakshatraPada}</span>
                </div>
              </div>
              
              <div className="p-3 bg-black/20 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Nakshatra Lord</p>
                <p className="text-lg font-semibold text-blue-300">{result.partner1.nakshatraLord}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-gradient-to-br from-pink-900/30 to-pink-900/10 backdrop-blur-lg p-6 rounded-xl border-2 border-pink-500/40 hover:border-pink-400/60 transition-all shadow-lg shadow-pink-500/10 hover:shadow-pink-500/30 group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-pink-500/20 rounded-lg group-hover:bg-pink-500/40 transition-all">
                <span className="text-2xl">👰</span>
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-pink-300 to-pink-400 bg-clip-text text-transparent">{partner2Name || "Partner 2"}</h3>
                <p className="text-xs text-gray-400">{result.partner2.rashi}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-black/20 rounded-lg border border-pink-500/20 hover:border-pink-500/40 transition-all">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Rashi (Moon Sign)</p>
                <p className="text-lg font-semibold text-pink-300">{result.partner2.rashi}</p>
              </div>
              
              <div className="p-3 bg-black/20 rounded-lg border border-pink-500/20 hover:border-pink-500/40 transition-all">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Nakshatra</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-lg font-semibold text-pink-300">{result.partner2.nakshatra}</span>
                  <span className="px-2 py-1 bg-pink-500/20 rounded text-xs text-pink-300">Pada {result.partner2.nakshatraPada}</span>
                </div>
              </div>
              
              <div className="p-3 bg-black/20 rounded-lg border border-pink-500/20 hover:border-pink-500/40 transition-all">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Nakshatra Lord</p>
                <p className="text-lg font-semibold text-pink-300">{result.partner2.nakshatraLord}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Koot Details */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-b from-purple-900/30 to-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 overflow-hidden shadow-lg shadow-purple-500/10"
        >
          <h3 className="text-xl font-bold text-center py-4 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-purple-500/30 border-b border-purple-500/30 text-yellow-400">
            ⚖️ Ashtakoot Guna Milan (अष्टकूट गुण मिलान)
          </h3>
          <div className="divide-y divide-purple-500/20">
            {result.koots.map((koot, index) => (
              <motion.div 
                key={index} 
                whileHover={{ backgroundColor: "rgba(168, 85, 247, 0.05)" }}
                className="p-4 transition-colors group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white group-hover:text-yellow-300 transition-colors">
                      {koot.name} <span className="text-yellow-400 text-sm ml-2">{koot.nameSanskrit}</span>
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">{koot.explanation}</p>
                  </div>
                  <div className={`text-2xl font-bold ml-4 px-3 py-1 rounded-lg ${getScoreColor(koot.obtained, koot.maxPoints)} bg-black/20 border border-current/20`}>
                    {koot.obtained}/{koot.maxPoints}
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-black/30 border border-purple-500/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(koot.obtained / koot.maxPoints) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      (koot.obtained / koot.maxPoints) >= 0.8 ? "bg-gradient-to-r from-green-500 to-green-400" :
                      (koot.obtained / koot.maxPoints) >= 0.6 ? "bg-gradient-to-r from-yellow-500 to-yellow-400" :
                      (koot.obtained / koot.maxPoints) >= 0.4 ? "bg-gradient-to-r from-orange-500 to-orange-400" : "bg-gradient-to-r from-red-500 to-red-400"
                    }`}
                  ></motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Dosha Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className={`p-6 rounded-xl text-center backdrop-blur-lg transition-all shadow-lg border-2 ${
              result.mangalDosha1 
                ? "bg-gradient-to-br from-red-900/30 to-red-900/10 border-red-500/40 hover:border-red-400/60 hover:shadow-red-500/20" 
                : "bg-gradient-to-br from-green-900/30 to-green-900/10 border-green-500/40 hover:border-green-400/60 hover:shadow-green-500/20"
            }`}
          >
            <div className="mb-3 text-4xl">🔴</div>
            <h4 className="text-lg font-bold text-white mb-2">Mangal Dosha</h4>
            <p className="text-sm text-gray-300 mb-3">Partner 1</p>
            <p className={`text-lg font-bold px-3 py-1 rounded-full inline-block ${
              result.mangalDosha1 
                ? "bg-red-500/20 text-red-300" 
                : "bg-green-500/20 text-green-300"
            }`}>
              {result.mangalDosha1 ? "⚠️ Present" : "✓ Absent"}
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className={`p-6 rounded-xl text-center backdrop-blur-lg transition-all shadow-lg border-2 ${
              result.mangalDosha2 
                ? "bg-gradient-to-br from-red-900/30 to-red-900/10 border-red-500/40 hover:border-red-400/60 hover:shadow-red-500/20" 
                : "bg-gradient-to-br from-green-900/30 to-green-900/10 border-green-500/40 hover:border-green-400/60 hover:shadow-green-500/20"
            }`}
          >
            <div className="mb-3 text-4xl">🔴</div>
            <h4 className="text-lg font-bold text-white mb-2">Mangal Dosha</h4>
            <p className="text-sm text-gray-300 mb-3">Partner 2</p>
            <p className={`text-lg font-bold px-3 py-1 rounded-full inline-block ${
              result.mangalDosha2 
                ? "bg-red-500/20 text-red-300" 
                : "bg-green-500/20 text-green-300"
            }`}>
              {result.mangalDosha2 ? "⚠️ Present" : "✓ Absent"}
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className={`p-6 rounded-xl text-center backdrop-blur-lg transition-all shadow-lg border-2 ${
              result.nadiDosha 
                ? "bg-gradient-to-br from-red-900/30 to-red-900/10 border-red-500/40 hover:border-red-400/60 hover:shadow-red-500/20" 
                : "bg-gradient-to-br from-green-900/30 to-green-900/10 border-green-500/40 hover:border-green-400/60 hover:shadow-green-500/20"
            }`}
          >
            <div className="mb-3 text-4xl">⚕️</div>
            <h4 className="text-lg font-bold text-white mb-2">Nadi Dosha</h4>
            <p className="text-sm text-gray-300 mb-3">Compatibility Check</p>
            <p className={`text-lg font-bold px-3 py-1 rounded-full inline-block ${
              result.nadiDosha 
                ? "bg-red-500/20 text-red-300" 
                : "bg-green-500/20 text-green-300"
            }`}>
              {result.nadiDosha ? "⚠️ Present" : "✓ Absent"}
            </p>
          </motion.div>
        </div>

        {/* Remedies */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-b from-purple-900/30 to-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 p-8 shadow-lg shadow-purple-500/10"
        >
          <h3 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-yellow-300 to-pink-400 bg-clip-text text-transparent">
            🙏 Suggested Remedies (उपाय)
          </h3>
          <ul className="space-y-3">
            {result.remedies.map((remedy, index) => (
              <motion.li 
                key={index}
                whileHover={{ x: 5 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-black/20 border border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-900/10 transition-all group"
              >
                <span className="text-yellow-400 font-bold text-lg mt-0.5 group-hover:scale-125 transition-transform">✨</span>
                <span className="text-gray-200 group-hover:text-yellow-300 transition-colors">{remedy}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="pt-24 min-h-screen px-4 text-white bg-gradient-to-b from-black via-purple-950 to-black">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 bg-clip-text text-transparent">
            💫 Vedic Kundli Matching
          </h1>
          <p className="text-lg text-gray-300 italic mb-2">Ashtakoot Guna Milan — अष्टकूट गुण मिलान</p>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            ✨ Ancient Vedic wisdom for assessing marriage compatibility through the sacred eight-fold matching system
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "form" && (
            <div
              key="form"
              className="space-y-6"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <BirthDetailsForm
                  label="Partner 1 (Groom)"
                  icon="🤵"
                  value={partner1}
                  onChange={setPartner1}
                  color="purple"
                />
                <BirthDetailsForm
                  label="Partner 2 (Bride)"
                  icon="👰"
                  value={partner2}
                  onChange={setPartner2}
                  color="pink"
                />
              </div>

              <div className="flex justify-center pt-8">
                <motion.button
                  onClick={handleCalculate}
                  disabled={!isValid(partner1) || !isValid(partner2) || isCalculating}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(236, 72, 153, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 hover:from-yellow-300 hover:via-pink-600 hover:to-purple-700 text-black font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-pink-500/50 disabled:shadow-gray-500/20"
                >
                  {isCalculating ? (
                    <span className="flex items-center gap-3">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Calculating Gunas...
                    </span>
                  ) : (
                    "🔮 Calculate Guna Milan"
                  )}
                </motion.button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-4">
                ✓ Ensure all birth details are in Nepal Standard Time (NST)
              </p>
            </div>
          )}

          {activeTab === "results" && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ResultsDisplay
                result={result}
                partner1Name={partner1.fullName}
                partner2Name={partner2.fullName}
              />
              
              <div className="flex justify-center gap-4 mt-10">
                <motion.button
                  onClick={() => setActiveTab("remedies")}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-2 border-purple-400/30 rounded-full text-white font-semibold transition-all shadow-lg shadow-purple-500/30"
                >
                  🙏 View Remedies
                </motion.button>
                <motion.button
                  onClick={handleReset}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-pink-400 hover:from-yellow-300 hover:to-pink-300 text-black font-bold rounded-full transition-all shadow-lg shadow-yellow-500/30"
                >
                  ← Check Another Match
                </motion.button>
              </div>
            </motion.div>
          )}

          {activeTab === "remedies" && result && (
            <motion.div
              key="remedies"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-black/40 rounded-lg border border-purple-700/30 p-8"
            >
              <h2 className="text-2xl font-bold text-center text-yellow-400 mb-6">
                🙏 Detailed Remedies & Recommendations
              </h2>
              
              <div className="space-y-6">
                {result.remedies.map((remedy, index) => (
                  <motion.div 
                key={index} 
                whileHover={{ x: 5 }}
                className="flex items-start gap-4 p-5 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-all group"
              >
                <span className="text-3xl group-hover:scale-125 transition-transform">🕉️</span>
                <div className="flex-1">
                  <p className="text-gray-200 group-hover:text-purple-200 transition-colors font-medium">{remedy}</p>
                  <p className="text-xs text-gray-400 mt-2">Remedy {index + 1} of {result.remedies.length}</p>
                </div>
              </motion.div>
                ))}
              </div>

              <div className="flex justify-center mt-10">
                <motion.button
                  onClick={() => setActiveTab("results")}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-pink-400 hover:from-yellow-300 hover:to-pink-300 text-black font-bold rounded-full transition-all shadow-lg shadow-yellow-500/30"
                >
                  ← Back to Results
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-12 text-center text-xs text-gray-400 border-t border-purple-700/30 pt-6">
          <p>🙏 Based on traditional Vedic Jyotish principles practiced in Nepal & India</p>
          <p className="mt-1">Calculations use Lahiri Ayanamsa and precise astronomical algorithms</p>
        </footer>
      </div>
    </div>
  );
};

export default Compatibility;