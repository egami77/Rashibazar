import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const features = [
  { title: "Kundali Generation", desc: "Create your personal birth chart based on Vedic astrology." },
  { title: "Zodiac Compatibility", desc: "Check compatibility with partners, friends, and family." },
  { title: "Daily/Weekly Horoscope", desc: "Receive personalized horoscope insights every day." },
  { title: "Book Astrology Sessions", desc: "Schedule sessions with our expert astrologers." },
  { title: "Ad/BS Calendar", desc: "Check Vedic lunar calendar and important dates." },
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-b from-black via-purple-950 to-black text-white px-6">
      <h1 className="text-5xl font-bold text-center text-yellow-400 mb-12">
        🌟 RashiBazar Features
      </h1>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="bg-black/30 border border-purple-700/30 rounded-xl p-6 text-center shadow-lg"
          >
            <h3 className="text-2xl font-semibold text-pink-400 mb-3">{f.title}</h3>
            <p className="text-gray-300">{f.desc}</p>
            <button
              onClick={() => navigate(`/${f.title.split(" ")[0].toLowerCase()}`)}
              className="mt-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black px-4 py-2 rounded-full font-semibold hover:scale-105 transition"
            >
              Explore
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
