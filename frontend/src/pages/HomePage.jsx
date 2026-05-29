// src/pages/HomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { motion } from "framer-motion";
import heroImage from "../assets/hero-cosmic.jpg";

const features = [
  { 
    title: "Kundali Generation", 
    desc: "Create your personal birth chart based on Vedic astrology.", 
    path: "/kundali",
    icon: ""
  },
  { 
    title: "Zodiac Compatibility", 
    desc: "Check compatibility with partners, friends, and family.", 
    path: "/compatibility",
    icon: ""
  },
  { 
    title: "Daily/Weekly Horoscope", 
    desc: "Receive personalized horoscope insights every day.", 
    path: "/horoscope",
    icon: ""
  },
  { 
    title: "Book Astrology Sessions", 
    desc: "Schedule sessions with our expert astrologers.", 
    path: "/booking",
    icon: ""
  },
  { 
    title: "BS Calendar", 
    desc: "Check Vedic lunar calendar and important dates.", 
    path: "/calendar",
    icon: ""
  },
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Layout style={{
      backgroundImage: `url(${heroImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    }}>
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{delay: 0.3, duration: 0.6 }}
        className="text-5xl font-bold text-center mb-4"
      >
        <span className="bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-500 text-transparent bg-clip-text">
          RashiBazar Features
        </span>
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-center text-gray-400 mb-12 max-w-2xl mx-auto"
      >
        Discover the cosmic wisdom through our comprehensive astrological tools and services
      </motion.p>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.4, duration: 0.5 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 25px -5px rgba(168, 85, 247, 0.3), 0 10px 10px -5px rgba(236, 72, 153, 0.2)"
            }}
            className="bg-black/40 backdrop-blur-sm border border-purple-600/30 rounded-xl p-8 text-center hover:border-purple-500 transition-all duration-300 cursor-pointer"
            onClick={() => navigate(feature.path)}
          >
            <div className="text-5xl mb-4">{feature.icon}</div>
            <h3 className="text-2xl font-semibold text-pink-400 mb-3">{feature.title}</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">{feature.desc}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(feature.path);
              }}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black font-semibold rounded-full hover:scale-105 transition-transform duration-200 shadow-lg"
            >
              Explore {feature.icon}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Decorative bottom gradient */}
      <div className="mt-16 h-1 w-24 mx-auto bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-full"></div>
    </Layout>
  );
};

export default HomePage;