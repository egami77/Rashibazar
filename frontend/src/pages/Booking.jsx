import React, { useState } from "react";
import { motion } from "framer-motion";

const sessions = [
  { type: "Personal Kundali Analysis", price: "₹500" },
  { type: "Relationship Compatibility", price: "₹700" },
  { type: "Career Guidance", price: "₹600" },
  { type: "Vedic Astrology Consultation", price: "₹1000" },
];

const Booking = () => {
  const [selected, setSelected] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const handleBook = () => {
    if (!selected) return;
    setConfirmation(`✅ You have booked "${selected}" session successfully!`);
  };

  return (
    <div className="pt-24 min-h-screen px-6 text-white bg-gradient-to-b from-black via-purple-950 to-black">
      <h1 className="text-4xl font-bold text-yellow-400 mb-8 text-center">
        📅 Book Astrology Session
      </h1>

      <div className="max-w-md mx-auto bg-black/30 p-6 rounded-xl border border-purple-700/30 backdrop-blur-md">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full mb-3 p-2 rounded border border-purple-400 bg-transparent"
        >
          <option value="">Select Session Type</option>
          {sessions.map((s) => (
            <option key={s.type} value={s.type}>
              {s.type} - {s.price}
            </option>
          ))}
        </select>

        <motion.button
          onClick={handleBook}
          whileHover={{ scale: 1.05 }}
          className="w-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black py-2 rounded-full font-semibold mt-2"
        >
          Book Session
        </motion.button>

        {confirmation && (
          <div className="mt-6 bg-black/50 p-4 rounded text-gray-300 text-center">
            {confirmation}
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
