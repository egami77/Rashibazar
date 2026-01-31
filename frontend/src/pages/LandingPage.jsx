// src/pages/LandingPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon, Star, Sparkles, Orbit, Circle } from "lucide-react";
import heroImage from "../assets/hero-cosmic.jpg";

const LandingPage = () => {
  const navigate = useNavigate();

  // Full Navagraha (9 planets)
  const planets = [
    { name: "Sun (Surya)", description: "Represents soul, willpower, and vitality. Governs Leo." },
    { name: "Moon (Chandra)", description: "Symbolizes mind, emotions, and mother. Governs Cancer." },
    { name: "Mars (Mangal)", description: "Represents energy, courage, and siblings. Governs Aries." },
    { name: "Mercury (Budha)", description: "Communication, intellect, and learning. Governs Gemini." },
    { name: "Jupiter (Guru)", description: "Wisdom, knowledge, and prosperity. Governs Sagittarius." },
    { name: "Venus (Shukra)", description: "Love, beauty, and luxury. Governs Taurus." },
    { name: "Saturn (Shani)", description: "Discipline, karma, and longevity. Governs Capricorn." },
    { name: "Rahu", description: "Shadow planet of illusion and desire. North lunar node." },
    { name: "Ketu", description: "Spiritual liberation and detachment. South lunar node." },
  ];

  // 12 Rashis
  const rashis = [
    { name: "Aries (Mesh)", symbol: "♈" },
    { name: "Taurus (Vrishabh)", symbol: "♉" },
    { name: "Gemini (Mithun)", symbol: "♊" },
    { name: "Cancer (Kark)", symbol: "♋" },
    { name: "Leo (Simha)", symbol: "♌" },
    { name: "Virgo (Kanya)", symbol: "♍" },
    { name: "Libra (Tula)", symbol: "♎" },
    { name: "Scorpio (Vrishchik)", symbol: "♏" },
    { name: "Sagittarius (Dhanu)", symbol: "♐" },
    { name: "Capricorn (Makar)", symbol: "♑" },
    { name: "Aquarius (Kumbh)", symbol: "♒" },
    { name: "Pisces (Meen)", symbol: "♓" },
  ];

  // helper to pick an icon for a planet
  const planetIcon = (index) => {
    const icons = [Sun, Moon, Circle, Orbit, Star, Sparkles, Circle, Star, Orbit];
    const Icon = icons[index % icons.length];
    return <Icon size={56} className="drop-shadow-md" />;
  };

  return (
    <div className="min-h-screen w-full flex flex-col overflow-y-auto bg-gradient-to-b from-black via-indigo-950 to-black text-white">
      {/* Hero Section */}
      <section
        className="relative flex flex-col items-center justify-center min-h-screen text-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/65"></div>

        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 px-6"
        >
          <Sparkles className="text-yellow-400 w-12 h-12 mx-auto mb-4" />
          <h1 className="text-5xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 tracking-wide">
            RashiBazar: Direction Through Stars
          </h1>
          <p className="mt-6 text-lg md:text-xl text-purple-200 max-w-2xl mx-auto">
            Unveil the mysteries of the cosmos through ancient Vedic wisdom.
            Discover your destiny written in the stars.
          </p>

          <div className="flex justify-center gap-6 mt-10">
            <motion.button
              whileHover={{ scale: 1.04 }}
              className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black font-semibold px-8 py-3 rounded-full shadow-2xl hover:shadow-yellow-500/40 transition-all"
              onClick={() => navigate("/signup")}
            >
              Begin Your Journey
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              className="bg-transparent border border-purple-600 text-purple-200 px-8 py-3 rounded-full hover:text-yellow-400 hover:border-yellow-400 transition-all"
              onClick={() => navigate("/login")}
            >
              Sign In
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Planets Section */}
      <section className="py-20 px-6 bg-black/60 backdrop-blur-md text-center">
        <h2 className="text-4xl font-bold mb-8 text-yellow-400">☀️ The Nine Planets (Navagraha)</h2>

        <div className="max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {planets.map((p, i) => (
            <motion.article
              key={p.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              className="relative rounded-2xl p-6 bg-gradient-to-br from-purple-900/25 to-indigo-900/20 border border-purple-700/20 hover:border-yellow-400/40 transition-shadow duration-300 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 flex items-center justify-center rounded-full bg-black/30">
                  <div className="text-yellow-200">{planetIcon(i)}</div>
                </div>

                <div className="text-left flex-1">
                  <h3 className="text-xl font-semibold text-white mb-1">{p.name}</h3>
                  <p className="text-sm text-gray-300">{p.description}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Rashis Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-900 to-black text-center">
        <h2 className="text-4xl font-bold mb-8 text-indigo-400">♈ 12 Zodiac Signs (Rashis)</h2>

        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {rashis.map((r, i) => (
            <motion.div
              key={r.name}
              whileHover={{ scale: 1.04 }}
              onClick={() => navigate("/signup")}
              className="p-6 rounded-xl bg-black/30 border border-indigo-700/30 hover:border-yellow-400 transition-shadow duration-300"
            >
              <div className="text-4xl mb-3">{r.symbol}</div>
              <h3 className="text-lg font-medium text-gray-100">{r.name}</h3>
              
            </motion.div>
            
          ))}
        </div>
      </section>

      {/* 🧙 Book Your Session Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black via-purple-950/20 to-black text-center border-t border-purple-800/30">
        <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 bg-clip-text text-transparent">
          🔮 Book Your Personal Astrology Session
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-10">
          Connect directly with our expert astrologers and uncover insights about your past, present, and future.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-8">
          <motion.div
            whileHover={{ scale: 1.04 }}
            className="bg-white/10 border border-purple-400/30 rounded-xl p-8 backdrop-blur-md max-w-xs mx-auto hover:shadow-purple-400/40 transition"
          >
            <h3 className="text-xl font-semibold text-yellow-300 mb-2">🪄 Basic Consultation</h3>
            <p className="text-sm text-gray-300 mb-4">
              15-minute session to discuss your core planetary influences and daily insights.
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 px-4 py-2 rounded-lg font-semibold text-white hover:scale-105 transition"
            >
              Book Now
            </button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.04 }}
            className="bg-white/10 border border-purple-400/30 rounded-xl p-8 backdrop-blur-md max-w-xs mx-auto hover:shadow-yellow-300/40 transition"
          >
            <h3 className="text-xl font-semibold text-yellow-300 mb-2">🌕 Deep Kundali Reading</h3>
            <p className="text-sm text-gray-300 mb-4">
              45-minute in-depth reading with our top astrologers exploring your Dasha, Nakshatra, and future predictions.
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 px-4 py-2 rounded-lg font-semibold text-white hover:scale-105 transition"
            >
              Book Now
            </button>
          </motion.div>
        </div>

        <p className="mt-8 text-gray-400 text-sm italic">
          *All sessions are conducted personally.
        </p>
      </section>

      {/* CTA Footer */}
      <section className="py-20 text-center bg-black/75 border-t border-purple-800/30">
        <div className="max-w-3xl mx-auto rounded-2xl p-12 bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border border-purple-700/20">
          <h2 className="text-4xl font-bold mb-4 text-purple-200">Ready to Discover Your Destiny?</h2>
          <p className="text-gray-300 mb-8">
            Create your personalized Kundali and uncover the secrets of your cosmic blueprint.
          </p>

          <motion.div whileHover={{ scale: 1.03 }}>
            <button
              onClick={() => navigate("/signup")}
              className="px-10 py-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black font-semibold rounded-full shadow-2xl hover:shadow-yellow-500/40 transition-all"
            >
              🔭 Create Your Kundali
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;