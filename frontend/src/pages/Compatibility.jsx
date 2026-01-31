import React, { useState } from "react";
import { motion } from "framer-motion";

const zodiacSigns = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const Compatibility = () => {
  const [sign1, setSign1] = useState("");
  const [sign2, setSign2] = useState("");
  const [result, setResult] = useState("");

  const handleCheck = () => {
    // Placeholder compatibility logic
    if (!sign1 || !sign2) return;
    if (sign1 === sign2) setResult("Perfect harmony! ❤️");
    else setResult("Mixed compatibility ⚡");
  };

  return (
    <div className="pt-24 min-h-screen px-6 text-white bg-gradient-to-b from-black via-purple-950 to-black">
      <h1 className="text-4xl font-bold text-yellow-400 mb-8 text-center">
        💫 Zodiac Compatibility
      </h1>

      <div className="max-w-md mx-auto bg-black/30 p-6 rounded-xl border border-purple-700/30 backdrop-blur-md">
        <select
          value={sign1}
          onChange={(e) => setSign1(e.target.value)}
          className="w-full mb-3 p-2 rounded border border-purple-400 bg-transparent"
        >
          <option value="">Select First Sign</option>
          {zodiacSigns.map((z) => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>

        <select
          value={sign2}
          onChange={(e) => setSign2(e.target.value)}
          className="w-full mb-3 p-2 rounded border border-purple-400 bg-transparent"
        >
          <option value="">Select Second Sign</option>
          {zodiacSigns.map((z) => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>

        <motion.button
          onClick={handleCheck}
          whileHover={{ scale: 1.05 }}
          className="w-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black py-2 rounded-full font-semibold mt-2"
        >
          Check Compatibility
        </motion.button>

        {result && (
          <div className="mt-6 bg-black/50 p-4 rounded text-gray-300 text-center">
            {result}
          </div>
        )}
      </div>
    </div>
  );
};

export default Compatibility;
