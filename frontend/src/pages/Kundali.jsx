// src/pages/Kundali.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, User, Download, Star, 
  Sparkles, History, Trash2, Home, RefreshCw,
  Globe, Map, Sun, Moon, Target, ChevronLeft, ChevronRight,
  ArrowLeft, ArrowRight, Info, Heart, Shield, Zap,
  TrendingUp, Users, BookOpen, Home as HomeIcon,
  Briefcase, DollarSign, Heart as HeartIcon,
  Eye, Lock, Globe as GlobeIcon
} from 'lucide-react';
import { generateKundali, getKundaliHistory, deleteKundali } from '../services/kundali.js';
import { getCurrentUser } from '../services/auth.js';

// Bikram Sambat Calendar Component
const BSCalendar = ({ selectedDate, onSelect }) => {
  const [currentYear, setCurrentYear] = useState(selectedDate.year);
  const [currentMonth, setCurrentMonth] = useState(selectedDate.month);
  
  const bsMonths = [
    'Baishakh', 'Jestha', 'Ashadh', 'Shrawan',
    'Bhadra', 'Ashwin', 'Kartik', 'Mangsir',
    'Poush', 'Magh', 'Falgun', 'Chaitra'
  ];
  
  // Simplified BS month lengths
  const getDaysInMonth = (year, month) => {
    const monthLengths = [31, 31, 31, 31, 31, 30, 30, 29, 29, 30, 30, 30];
    // Adjust for leap year (Chaitra has 30 days in leap year, 29 otherwise)
    if (month === 12) {
      // Simple leap year calculation for BS
      const isLeapYear = (year - 2000) % 4 === 0;
      return isLeapYear ? 30 : 29;
    }
    return monthLengths[month - 1];
  };
  
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Group days into weeks
  const weeks = [];
  let week = [];
  
  days.forEach(day => {
    week.push(day);
    if (week.length === 7) {
      weeks.push([...week]);
      week = [];
    }
  });
  if (week.length > 0) weeks.push(week);
  
  // Nepali day names (abbreviated)
  const nepaliDays = ['आ', 'सो', 'म', 'बु', 'बि', 'शु', 'श'];
  
  return (
    <div className="bg-black/90 border-2 border-yellow-400/30 rounded-lg p-4 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => {
            if (currentMonth > 1) {
              setCurrentMonth(currentMonth - 1);
            } else {
              setCurrentYear(currentYear - 1);
              setCurrentMonth(12);
            }
          }}
          className="px-3 py-1 bg-purple-900/50 rounded hover:bg-purple-900 transition-colors flex items-center"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <div className="text-center">
          <div className="text-xl font-bold text-yellow-300">
            {bsMonths[currentMonth - 1]} {currentYear}
          </div>
          <div className="text-sm text-gray-400">
            Bikram Sambat
          </div>
        </div>
        
        <button
          onClick={() => {
            if (currentMonth < 12) {
              setCurrentMonth(currentMonth + 1);
            } else {
              setCurrentYear(currentYear + 1);
              setCurrentMonth(1);
            }
          }}
          className="px-3 py-1 bg-purple-900/50 rounded hover:bg-purple-900 transition-colors flex items-center"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {nepaliDays.map((day, i) => (
          <div key={i} className="text-center text-xs text-yellow-300 p-1 font-semibold">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((day, dayIndex) => (
              <button
                key={dayIndex}
                onClick={() => onSelect({
                  year: currentYear,
                  month: currentMonth,
                  day: day
                })}
                className={`h-8 rounded flex items-center justify-center text-sm transition-all
                  ${selectedDate.year === currentYear && 
                    selectedDate.month === currentMonth && 
                    selectedDate.day === day
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-black font-bold shadow-lg'
                    : 'bg-purple-900/30 hover:bg-purple-900/50 text-white hover:scale-105'
                  }`}
              >
                {day}
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>
      
      {/* Year navigation */}
      <div className="flex justify-between mt-4 gap-2">
        <button
          onClick={() => setCurrentYear(currentYear - 1)}
          className="px-3 py-1 bg-black/50 rounded text-sm hover:bg-black/70 transition-colors flex-1"
        >
          Prev Year
        </button>
        <button
          onClick={() => {
            setCurrentYear(selectedDate.year);
            setCurrentMonth(selectedDate.month);
          }}
          className="px-3 py-1 bg-yellow-500/20 rounded text-sm hover:bg-yellow-500/30 transition-colors flex-1"
        >
          Today
        </button>
        <button
          onClick={() => setCurrentYear(currentYear + 1)}
          className="px-3 py-1 bg-black/50 rounded text-sm hover:bg-black/70 transition-colors flex-1"
        >
          Next Year
        </button>
      </div>
      
      {/* Current selection info */}
      <div className="mt-4 p-2 bg-black/50 rounded text-center">
        <div className="text-xs text-gray-400">Selected Date</div>
        <div className="text-yellow-300 font-semibold">
          {bsMonths[selectedDate.month - 1]} {selectedDate.day}, {selectedDate.year} BS
        </div>
      </div>
    </div>
  );
};

// Traditional Square Rashi Chart Component - Perfect Diamond Layout
const RashiChart = ({ planets, ascendant }) => {
  const getPlanetsInHouse = (houseNum) => {
    return planets?.filter(p => p.house === houseNum) || [];
  };

  const HouseSection = ({ houseNum }) => {
    const housePlanets = getPlanetsInHouse(houseNum);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: (houseNum - 1) * 0.05 }}
        className="flex flex-col items-center justify-center w-full h-full p-1 text-xs"
      >
        {/* House Number */}
        <div className="font-bold text-yellow-300 text-sm bg-red-900/60 px-2 py-0.5 rounded border border-yellow-500/50">
          H{houseNum}
        </div>

        {/* Planets */}
        <div className="flex flex-wrap gap-0.5 justify-center mt-1">
          {housePlanets.map((planet, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: (houseNum - 1) * 0.05 + idx * 0.02 }}
              className="w-4 h-4 rounded-full bg-black border border-yellow-500/60 flex items-center justify-center text-xs font-bold"
              title={`${planet.name} - ${planet.degree}`}
            >
              <span className={planet.color}>{planet.symbol}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Decorative Title */}
      <div className="mb-8 text-center">
        <div className="inline-block">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Rashi Chart
            </h3>
            <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
          </div>
          <div className="text-sm text-gray-400">Traditional South Indian Square Division</div>
        </div>
      </div>

      {/* Main Chart Container - Diamond Layout */}
      <div className="relative flex justify-center bg-gradient-to-br from-black/80 via-purple-900/40 to-black/80 border-4 border-red-700/60 rounded-2xl p-8 shadow-2xl"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99,102,241,0.1) 0%, transparent 50%)'
        }}
      >
        <svg width="480" height="480" viewBox="0 0 480 480" className="absolute inset-0 z-0">
          {/* Outer square rotated (diamond shape) */}
          <rect x="80" y="80" width="320" height="320" fill="none" stroke="#b93333" strokeWidth="3" transform="rotate(45 240 240)"/>
          
          {/* Main diagonals */}
          <line x1="80" y1="240" x2="400" y2="240" stroke="#b93333" strokeWidth="2"/>
          <line x1="240" y1="80" x2="240" y2="400" stroke="#b93333" strokeWidth="2"/>
          
          {/* Diagonal lines from corners */}
          <line x1="80" y1="80" x2="400" y2="400" stroke="#b93333" strokeWidth="2"/>
          <line x1="400" y1="80" x2="80" y2="400" stroke="#b93333" strokeWidth="2"/>
          
          {/* Center circle for Lagna */}
          <circle cx="240" cy="240" r="45" fill="rgba(251, 146, 60, 0.15)" stroke="#fb923c" strokeWidth="2"/>
          <circle cx="240" cy="240" r="35" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6"/>
        </svg>

        {/* House Positions - Absolute layout matching the image */}
        <div className="relative w-96 h-96">
          {/* H12 - Top */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-16 h-16 flex items-center justify-center">
            <HouseSection houseNum={12} />
          </div>

          {/* H2 - Top Left */}
          <div className="absolute top-6 left-6 w-16 h-16 flex items-center justify-center">
            <HouseSection houseNum={2} />
          </div>

          {/* H3 - Left */}
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-2 w-16 h-16 flex items-center justify-center">
            <HouseSection houseNum={3} />
          </div>

          {/* H4 - Left Lower */}
          <div className="absolute top-1/3 left-6 transform translate-y-8 w-16 h-16 flex items-center justify-center">
            <HouseSection houseNum={4} />
          </div>

          {/* H5 - Bottom Left Upper */}
          <div className="absolute bottom-1/3 left-6 transform -translate-y-8 w-16 h-16 flex items-center justify-center">
            <HouseSection houseNum={5} />
          </div>

          {/* H6 - Bottom Left */}
          <div className="absolute bottom-6 left-6 w-16 h-16 flex items-center justify-center">
            <HouseSection houseNum={6} />
          </div>

          {/* H7 - Bottom */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-16 h-16 flex items-center justify-center">
            <HouseSection houseNum={7} />
          </div>

          {/* H8 - Bottom Right */}
          <div className="absolute bottom-6 right-6 w-16 h-16 flex items-center justify-center">
            <HouseSection houseNum={8} />
          </div>

          {/* H9 - Bottom Right Upper */}
          <div className="absolute bottom-1/3 right-6 transform -translate-y-8 w-16 h-16 flex items-center justify-center">
            <HouseSection houseNum={9} />
          </div>

          {/* H10 - Right */}
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-2 w-16 h-16 flex items-center justify-center">
            <HouseSection houseNum={10} />
          </div>

          {/* H11 - Right Upper */}
          <div className="absolute top-1/3 right-6 transform translate-y-8 w-16 h-16 flex items-center justify-center">
            <HouseSection houseNum={11} />
          </div>

          {/* H1 - Center (Lagna) */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20"
          >
            <div className="text-4xl font-bold text-orange-400 drop-shadow-lg">ॐ</div>
            <div className="text-xs font-bold text-yellow-300 mt-1 tracking-widest">Rising Lagna</div>
            <div className="text-xs font-bold text-yellow-400">Ascendant</div>
            <div className="text-sm font-bold text-yellow-300 mt-0.5">H1</div>
          </motion.div>
        </div>
      </div>

      {/* Planet Information */}
      <div className="mt-8 bg-black/50 border border-purple-500/30 rounded-xl p-6">
        <h4 className="text-lg font-bold text-yellow-300 mb-4">Planetary Details</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {planets?.map((planet, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="p-3 bg-gradient-to-br from-purple-900/40 to-black/60 border border-purple-500/30 rounded-lg text-center hover:border-yellow-400/50 transition-all"
            >
              <div className={`text-2xl mb-2 ${planet.color}`}>{planet.symbol}</div>
              <div className="text-xs font-bold text-white mb-1">{planet.name}</div>
              <div className="text-xs text-gray-400">H{planet.house}</div>
              <div className="text-xs text-yellow-400 font-mono mt-1">{planet.degree}</div>
              {planet.retrograde && (
                <div className="text-xs bg-red-500/30 text-red-300 px-1 py-0.5 rounded mt-1 font-bold">Retrograde</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>🔯 Vedic Astrology • South Indian Style Chart</p>
      </div>
    </div>
  );
};

// Enhanced Planetary Table
const PlanetaryTable = ({ planets }) => {
  return (
    <div className="overflow-x-auto rounded-xl border-2 border-purple-700/30 bg-black/20 shadow-xl">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-purple-900/60 via-pink-900/60 to-purple-900/60">
            <th className="p-4 text-left text-yellow-300 font-bold text-lg">Planet</th>
            <th className="p-4 text-left text-yellow-300 font-bold text-lg">Rashi</th>
            <th className="p-4 text-left text-yellow-300 font-bold text-lg">Degree</th>
            <th className="p-4 text-left text-yellow-300 font-bold text-lg">House</th>
            <th className="p-4 text-left text-yellow-300 font-bold text-lg">Nakshatra</th>
            <th className="p-4 text-left text-yellow-300 font-bold text-lg">Lord</th>
            <th className="p-4 text-left text-yellow-300 font-bold text-lg">Strength</th>
          </tr>
        </thead>
        <tbody>
          {planets?.map((planet, idx) => (
            <tr 
              key={idx} 
              className="border-b border-purple-700/30 hover:bg-purple-900/30 transition-all duration-300"
            >
              <td className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${planet.color} bg-black/50 flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl">{planet.symbol}</span>
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">{planet.name}</div>
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                      {planet.retrograde && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded text-xs font-bold">Retrograde</span>
                      )}
                    </div>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div>
                  <div className="font-semibold text-white text-lg">{planet.rashi}</div>
                  <div className="text-sm text-gray-400">{planet.english}</div>
                </div>
              </td>
              <td className="p-4">
                <div className="font-mono text-xl text-yellow-300">{planet.degree}</div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-900 to-black border-2 border-purple-500 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">{planet.house}</span>
                    </div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap">
                      House
                    </div>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div>
                  <div className="font-semibold text-white text-lg">{planet.nakshatra}</div>
                  <div className="text-sm text-gray-400">
                    Pada {planet.pada}
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="text-yellow-300 font-bold text-lg">{planet.nakshatraLord}</div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"
                      style={{ width: `${Math.min(planet.strength || 50, 100)}%` }}
                    />
                  </div>
                  <span className="text-white font-mono font-bold">{Math.round(planet.strength || 0)}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Dasha Display Component
const DashaDisplay = ({ dashas }) => {
  const currentDasha = dashas?.find(d => d.isCurrent);
  
  return (
    <div className="space-y-6">
      {/* Current Dasha */}
      {currentDasha && (
        <div className="p-6 bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-xl border-2 border-yellow-400/30">
          <div className="flex items-center gap-3 mb-4">
            <Star className="h-6 w-6 text-yellow-400" />
            <h4 className="text-xl font-bold text-yellow-300">Current Mahadasha</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-yellow-400 animate-pulse"></div>
              <span className="text-3xl font-bold text-white">{currentDasha.planet}</span>
              <span className="px-4 py-1 bg-yellow-400/30 text-yellow-300 rounded-full font-semibold">
                Active Now
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-black/30 p-4 rounded">
                <div className="text-gray-400">Period</div>
                <div className="text-white text-xl font-bold">{currentDasha.period}</div>
              </div>
              <div className="bg-black/30 p-4 rounded">
                <div className="text-gray-400">Duration</div>
                <div className="text-white text-xl font-bold">{currentDasha.years} years</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Dasha Timeline */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-yellow-300">Vimshottari Dasha Timeline</h4>
        {dashas?.map((dasha, idx) => (
          <div 
            key={idx} 
            className={`rounded-lg p-4 border-2 ${
              dasha.isCurrent 
                ? 'border-yellow-400/50 bg-yellow-400/10' 
                : 'border-purple-700/30 bg-black/30'
            } hover:scale-[1.02] transition-transform`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full ${
                  dasha.isCurrent ? 'bg-yellow-400 animate-pulse' : 'bg-purple-500'
                }`}></div>
                <div>
                  <span className={`font-bold text-lg ${
                    dasha.isCurrent ? 'text-yellow-300' : 'text-white'
                  }`}>
                    {dasha.planet}
                  </span>
                  {dasha.isCurrent && (
                    <span className="ml-3 px-2 py-1 bg-yellow-400/20 text-yellow-300 text-xs rounded-full">
                      Current
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">{dasha.period}</div>
                <div className="text-sm text-gray-400">{dasha.years} years</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Name Suggestions Component
const NameSuggestions = ({ initials, moonSign, gender }) => {
  const getSampleNames = (gender, moonSign) => {
    const names = {
      Mesha: {
        male: ['Arjun', 'Amit', 'Lalit', 'Eshan', 'Charan', 'Laksh', 'Ekach'],
        female: ['Anjali', 'Lavanya', 'Esha', 'Chhaya', 'Leela', 'Lipika', 'Eva']
      },
      Vrishabha: {
        male: ['Ishan', 'Udit', 'Eknath', 'Omkar', 'Vikas', 'Vinay', 'Om'],
        female: ['Ishita', 'Urvashi', 'Ekta', 'Ojal', 'Vidya', 'Uma', 'Esha']
      },
      Mithuna: {
        male: ['Karan', 'Kiran', 'Gaurav', 'Chirag', 'Harsh', 'Kunal', 'Gopal'],
        female: ['Kajal', 'Kirti', 'Gayatri', 'Chandni', 'Hina', 'Kavita', 'Geeta']
      },
      Karka: {
        male: ['Hitesh', 'Harshit', 'Deepak', 'Dinesh', 'Dharmendra', 'Hari', 'Dipak'],
        female: ['Hema', 'Heena', 'Deepa', 'Divya', 'Dipti', 'Hina', 'Diya']
      },
      Simha: {
        male: ['Manish', 'Mohan', 'Tarun', 'Tushar', 'Tejas', 'Mahesh', 'Tara'],
        female: ['Meena', 'Mona', 'Tanvi', 'Tara', 'Tejal', 'Maya', 'Tina']
      },
      Kanya: {
        male: ['Tosh', 'Pankaj', 'Piyush', 'Shashi', 'Naresh', 'Pawan', 'Shyam'],
        female: ['Tanu', 'Pooja', 'Priya', 'Shanti', 'Neha', 'Priti', 'Shweta']
      },
      Tula: {
        male: ['Rahul', 'Rohan', 'Ramesh', 'Tarak', 'Tushar', 'Raj', 'Tushar'],
        female: ['Radha', 'Roshni', 'Rekha', 'Tina', 'Twinkle', 'Rani', 'Tara']
      },
      Vrishchika: {
        male: ['Nakul', 'Nitin', 'Naveen', 'Yash', 'Yogesh', 'Niraj', 'Yashwant'],
        female: ['Naina', 'Neelam', 'Nisha', 'Yamini', 'Yasmin', 'Neha', 'Yami']
      },
      Dhanu: {
        male: ['Yogesh', 'Bharat', 'Bhupendra', 'Dhruv', 'Pankaj', 'Yash', 'Bhuvan'],
        female: ['Yamuna', 'Bhavna', 'Bhumi', 'Dhwani', 'Pallavi', 'Yashoda', 'Bhoomi']
      },
      Makara: {
        male: ['Bhola', 'Jay', 'Jitendra', 'Kshitij', 'Gaurav', 'Jai', 'Karan'],
        female: ['Bhavya', 'Jaya', 'Jyoti', 'Kirti', 'Gauri', 'Bhavna', 'Juhi']
      },
      Kumbha: {
        male: ['Gopal', 'Sachin', 'Suresh', 'Satyam', 'Darshan', 'Gagan', 'Sahil'],
        female: ['Ganga', 'Sakshi', 'Sunita', 'Sadhna', 'Daksha', 'Gargi', 'Sonia']
      },
      Meena: {
        male: ['Dinesh', 'Dhruv', 'Thakur', 'Jagdish', 'Chandan', 'Dipak', 'Jatin'],
        female: ['Divya', 'Disha', 'Tara', 'Jaya', 'Chandni', 'Dipti', 'Jhanvi']
      }
    };
    
    return names[moonSign]?.[gender] || ['Traditional', 'Auspicious', 'Names'];
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-6 w-6 text-yellow-400" />
          <h4 className="text-xl font-bold text-yellow-300">Based on Moon Sign: {moonSign}</h4>
        </div>
        <p className="text-gray-300 mb-6">
          According to Vedic astrology, names starting with these letters are considered auspicious for your Janma Rashi (Moon Sign).
        </p>
      </div>

      {/* Name Initials */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-yellow-300 mb-4">Recommended Initials</h4>
        <div className="flex flex-wrap gap-3">
          {initials?.map((initial, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.1, y: -5 }}
              className="px-6 py-3 bg-black/50 border-2 border-purple-400/30 rounded-lg text-white font-bold text-lg hover:bg-purple-900/40 hover:border-purple-400/60 transition-all cursor-pointer"
            >
              {initial}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sample Names */}
      <div>
        <h4 className="text-lg font-semibold text-yellow-300 mb-4">Sample Names (Traditional)</h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-black/50 p-6 rounded-xl border border-purple-500/30">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-blue-400" />
              <div className="text-blue-300 font-bold text-lg">For Boys</div>
            </div>
            <ul className="space-y-2">
              {getSampleNames('male', moonSign).map((name, idx) => (
                <li key={idx} className="flex items-center gap-3 p-2 hover:bg-purple-900/30 rounded">
                  <span className="text-purple-400 text-lg">•</span> 
                  <span className="text-gray-300">{name}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-black/50 p-6 rounded-xl border border-pink-500/30">
            <div className="flex items-center gap-2 mb-4">
              <HeartIcon className="h-5 w-5 text-pink-400" />
              <div className="text-pink-300 font-bold text-lg">For Girls</div>
            </div>
            <ul className="space-y-2">
              {getSampleNames('female', moonSign).map((name, idx) => (
                <li key={idx} className="flex items-center gap-3 p-2 hover:bg-pink-900/30 rounded">
                  <span className="text-pink-400 text-lg">•</span> 
                  <span className="text-gray-300">{name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-black/50 rounded text-sm text-gray-400">
        <p className="italic">
          * These name suggestions are based on traditional Vedic naming conventions. 
          The initials correspond to the first letter of names considered auspicious for your Moon Sign.
        </p>
      </div>
    </div>
  );
};

// Yogas Display Component
const YogasDisplay = ({ planets, ascendant }) => {
  const calculateYogas = () => {
    const yogas = [];
    
    if (!planets) return yogas;
    
    const sun = planets.find(p => p.name === 'Sun');
    const moon = planets.find(p => p.name === 'Moon');
    const jupiter = planets.find(p => p.name === 'Jupiter');
    const venus = planets.find(p => p.name === 'Venus');
    const mercury = planets.find(p => p.name === 'Mercury');
    const mars = planets.find(p => p.name === 'Mars');
    const saturn = planets.find(p => p.name === 'Saturn');
    
    // Check for Gaja Kesari Yoga (Moon-Jupiter conjunction)
    if (moon && jupiter && moon.rashi === jupiter.rashi) {
      yogas.push({
        name: 'Gaja Kesari Yoga',
        type: 'Auspicious',
        description: 'Moon and Jupiter in same sign',
        effect: 'Wealth, wisdom, success, and royal honors',
        planets: ['Moon', 'Jupiter'],
        significance: 'High'
      });
    }
    
    // Check for Budha-Aditya Yoga (Sun-Mercury conjunction)
    if (sun && mercury && sun.rashi === mercury.rashi) {
      yogas.push({
        name: 'Budha-Aditya Yoga',
        type: 'Auspicious',
        description: 'Sun and Mercury in same sign',
        effect: 'Intelligence, communication skills, success in education',
        planets: ['Sun', 'Mercury'],
        significance: 'Medium'
      });
    }
    
    // Check for Shasha Yoga (Moon-Venus conjunction)
    if (moon && venus && moon.rashi === venus.rashi) {
      yogas.push({
        name: 'Shasha Yoga',
        type: 'Auspicious',
        description: 'Moon and Venus in same sign',
        effect: 'Artistic talents, luxury, good relationships',
        planets: ['Moon', 'Venus'],
        significance: 'Medium'
      });
    }
    
    // Check for Kemadruma Yoga (Moon alone without benefics)
    if (moon) {
      const moonHouse = moon.house;
      const hasPlanetIn2nd = planets.some(p => {
        const houseDiff = (p.house - moonHouse + 12) % 12;
        return houseDiff === 2 && p.name !== 'Moon';
      });
      const hasPlanetIn12th = planets.some(p => {
        const houseDiff = (p.house - moonHouse + 12) % 12;
        return houseDiff === 12 && p.name !== 'Moon';
      });
      
      if (!hasPlanetIn2nd && !hasPlanetIn12th) {
        yogas.push({
          name: 'Kemadruma Yoga',
          type: 'Challenging',
          description: 'Moon without planets in 2nd or 12th houses',
          effect: 'Poverty, lack of support, struggles in life',
          planets: ['Moon'],
          significance: 'High'
        });
      }
    }
    
    // Check for Mangal Dosha (Mars in certain houses)
    if (mars) {
      if ([1, 4, 7, 8, 12].includes(mars.house)) {
        yogas.push({
          name: 'Mangal Dosha',
          type: 'Challenging',
          description: 'Mars in 1st, 4th, 7th, 8th or 12th house',
          effect: 'Marital problems, accidents, aggression',
          planets: ['Mars'],
          significance: 'Medium'
        });
      }
    }
    
    return yogas;
  };

  const yogas = calculateYogas();

  return (
    <div className="space-y-8">
      <div className="bg-black/30 p-6 rounded-2xl border-2 border-purple-700/30">
        <h3 className="text-2xl font-bold text-yellow-300 mb-6">Planetary Yogas (Combinations)</h3>
        
        {yogas.length > 0 ? (
          <div className="space-y-6">
            {yogas.map((yoga, idx) => (
              <div key={idx} className="bg-black/50 p-6 rounded-xl border border-purple-500/30">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      yoga.type === 'Auspicious' 
                        ? 'bg-green-500/20' 
                        : 'bg-red-500/20'
                    }`}>
                      <Star className={`h-6 w-6 ${
                        yoga.type === 'Auspicious' 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{yoga.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          yoga.type === 'Auspicious' 
                            ? 'bg-green-500/30 text-green-300' 
                            : 'bg-red-500/30 text-red-300'
                        }`}>
                          {yoga.type}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          yoga.significance === 'High' 
                            ? 'bg-yellow-500/30 text-yellow-300' 
                            : 'bg-blue-500/30 text-blue-300'
                        }`}>
                          {yoga.significance} Significance
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4">{yoga.description}</p>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-1">Effect:</div>
                  <div className="text-white font-medium">{yoga.effect}</div>
                </div>
                
                {yoga.planets && (
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Planets involved:</div>
                    <div className="flex gap-2">
                      {yoga.planets.map((planet, i) => {
                        const planetData = planets.find(p => p.name === planet);
                        return (
                          <div 
                            key={i}
                            className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
                              yoga.type === 'Auspicious' 
                                ? 'bg-green-900/30 border border-green-500/30' 
                                : 'bg-red-900/30 border border-red-500/30'
                            }`}
                          >
                            {planetData && (
                              <span className={`text-lg ${planetData.color}`}>{planetData.symbol}</span>
                            )}
                            <span className="text-white">{planet}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-900/30 mb-4">
              <Info className="h-10 w-10 text-purple-400" />
            </div>
            <p className="text-gray-400 text-lg mb-2">No significant yogas detected in this chart.</p>
            <p className="text-gray-500">Yogas are special planetary combinations that indicate specific results.</p>
          </div>
        )}
      </div>

      {/* Yoga Information */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-black/30 p-6 rounded-2xl border-2 border-green-700/30">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-6 w-6 text-green-400" />
            <h3 className="text-xl font-bold text-green-300">Shubha Yogas (Auspicious)</h3>
          </div>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Bring positive results and opportunities</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Enhance natural talents and strengths</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Provide protection during difficult times</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Indicate success in specific areas of life</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-black/30 p-6 rounded-2xl border-2 border-red-700/30">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-red-400" />
            <h3 className="text-xl font-bold text-red-300">Ashubha Yogas (Challenging)</h3>
          </div>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">⚠</span>
              <span>Indicate challenges and obstacles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">⚠</span>
              <span>Require extra effort and remedies</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">⚠</span>
              <span>Can be mitigated by other positive factors</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">⚠</span>
              <span>Provide opportunities for growth through challenges</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Bhava Chalit Component
const BhavaChalitDisplay = ({ planets, houses }) => {
  if (!houses || !planets) return null;

  // Group planets by house
  const planetsByHouse = {};
  planets.forEach(planet => {
    const house = planet.house;
    if (!planetsByHouse[house]) {
      planetsByHouse[house] = [];
    }
    planetsByHouse[house].push(planet);
  });

  // House meanings
  const houseMeanings = [
    { number: 1, meaning: 'Self, personality, appearance, health' },
    { number: 2, meaning: 'Wealth, family, speech, food' },
    { number: 3, meaning: 'Siblings, courage, communication, short travels' },
    { number: 4, meaning: 'Mother, home, vehicles, happiness' },
    { number: 5, meaning: 'Children, education, intelligence, creativity' },
    { number: 6, meaning: 'Health, debts, enemies, service' },
    { number: 7, meaning: 'Marriage, partnerships, business' },
    { number: 8, meaning: 'Longevity, inheritance, secrets, transformation' },
    { number: 9, meaning: 'Luck, father, spirituality, higher education' },
    { number: 10, meaning: 'Career, fame, status, reputation' },
    { number: 11, meaning: 'Gains, income, friends, elder siblings' },
    { number: 12, meaning: 'Losses, foreign lands, spirituality, liberation' }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-black/30 p-6 rounded-2xl border-2 border-purple-700/30">
        <h3 className="text-2xl font-bold text-yellow-300 mb-6">Bhava Chalit Chart (House Positions)</h3>
        
        <div className="mb-6 p-4 bg-black/50 rounded-lg">
          <p className="text-gray-300">
            Bhava Chalit chart shows the actual house placement of planets based on their exact longitude, 
            which may differ from the standard Rashi chart (D1). This chart is important for accurate house-based predictions.
          </p>
        </div>

        {/* Houses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {houses?.map((house, idx) => {
            const houseNumber = idx + 1;
            const planetsInHouse = planetsByHouse[houseNumber] || [];
            const houseMeaning = houseMeanings[idx];
            
            return (
              <div key={idx} className="bg-black/50 p-4 rounded-xl border border-purple-500/30 hover:border-yellow-400/50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-900 to-black border-2 border-purple-500 flex items-center justify-center">
                      <span className="text-white text-lg font-bold">{houseNumber}</span>
                    </div>
                    <div>
                      <div className="font-bold text-white">House {houseNumber}</div>
                      <div className="text-sm text-gray-400">{house.rashi}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Cusp</div>
                    <div className="font-mono text-yellow-300">{house.longitude.toFixed(1)}°</div>
                  </div>
                </div>
                
                {/* Planets in House */}
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">Planets:</div>
                  <div className="flex flex-wrap gap-2">
                    {planetsInHouse.length > 0 ? (
                      planetsInHouse.map((planet, pIdx) => (
                        <div 
                          key={pIdx}
                          className={`px-3 py-1.5 rounded-full flex items-center gap-2 ${planet.color.replace('text-', 'bg-')}/20 border ${planet.color.replace('text-', 'border-')}`}
                          title={`${planet.name} in ${planet.rashi}`}
                        >
                          <span className={`text-sm ${planet.color}`}>{planet.symbol}</span>
                          <span className="text-white text-sm">{planet.name}</span>
                          {planet.retrograde && (
                            <span className="text-xs text-red-400">R</span>
                          )}
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No planets</span>
                    )}
                  </div>
                </div>
                
                {/* House Meaning */}
                <div>
                  <div className="text-sm text-gray-400 mb-1">Significance:</div>
                  <div className="text-gray-300 text-sm">{houseMeaning?.meaning}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* House Summary */}
      <div className="bg-black/30 p-6 rounded-2xl border-2 border-blue-700/30">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="h-6 w-6 text-blue-400" />
          <h3 className="text-xl font-bold text-blue-300">House Classifications</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-yellow-300">Kendra Houses (1, 4, 7, 10)</h4>
            <p className="text-gray-300 text-sm">
              These are angular houses representing self, home, partnerships, and career. They are powerful and show key areas of life.
            </p>
            <div className="flex gap-2">
              {[1, 4, 7, 10].map(num => (
                <div key={num} className="w-8 h-8 rounded-full bg-purple-900 flex items-center justify-center text-white">
                  {num}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-yellow-300">Trikona Houses (5, 9)</h4>
            <p className="text-gray-300 text-sm">
              These are trine houses representing creativity, luck, and spirituality. They are very auspicious houses.
            </p>
            <div className="flex gap-2">
              {[5, 9].map(num => (
                <div key={num} className="w-8 h-8 rounded-full bg-green-900 flex items-center justify-center text-white">
                  {num}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-yellow-300">Dusthana Houses (6, 8, 12)</h4>
            <p className="text-gray-300 text-sm">
              These are challenging houses representing obstacles, transformation, and losses. They indicate areas of life requiring attention.
            </p>
            <div className="flex gap-2">
              {[6, 8, 12].map(num => (
                <div key={num} className="w-8 h-8 rounded-full bg-red-900 flex items-center justify-center text-white">
                  {num}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Kundali Component
const Kundali = () => {
  const [activeTab, setActiveTab] = useState('form');
  const [activeResultTab, setActiveResultTab] = useState('charts');
  const [kundaliHistory, setKundaliHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Gautam',
    dateOfBirth: '2003-06-20',
    timeOfBirth: '17:06',
    placeOfBirth: 'Pokhara',
    gender: 'male',
    latitude: '28.2096',
    longitude: '83.9856'
  });
  const [kundaliData, setKundaliData] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [showBSCalendar, setShowBSCalendar] = useState(false);
  const [bsDate, setBsDate] = useState({ year: 2060, month: 3, day: 6 });

  // All 77 districts of Nepal
  const ALL_NEPAL_DISTRICTS = [
    'Achham', 'Arghakhanchi', 'Baglung', 'Baitadi', 'Bajhang', 'Bajura',
    'Banke', 'Bara', 'Bardiya', 'Bhaktapur', 'Bhojpur', 'Chitwan',
    'Dadeldhura', 'Dailekh', 'Dang', 'Darchula', 'Dhading', 'Dhankuta',
    'Dhanusa', 'Dolakha', 'Dolpa', 'Doti', 'Gorkha', 'Gulmi', 'Humla',
    'Ilam', 'Jajarkot', 'Jhapa', 'Jumla', 'Kailali', 'Kalikot', 'Kanchanpur',
    'Kapilvastu', 'Kaski', 'Kathmandu', 'Kavrepalanchok', 'Khotang', 'Lalitpur',
    'Lamjung', 'Mahottari', 'Makwanpur', 'Manang', 'Morang', 'Mugu', 'Mustang',
    'Myagdi', 'Nawalparasi East', 'Nawalparasi West', 'Nuwakot', 'Okhaldhunga',
    'Palpa', 'Panchthar', 'Parbat', 'Parsa', 'Pyuthan', 'Ramechhap', 'Rasuwa',
    'Rautahat', 'Rolpa', 'Rukum East', 'Rukum West', 'Rupandehi', 'Salyan',
    'Sankhuwasabha', 'Saptari', 'Sarlahi', 'Sindhuli', 'Sindhupalchok', 'Siraha',
    'Solukhumbu', 'Sunsari', 'Surkhet', 'Syangja', 'Tanahun', 'Taplejung',
    'Terhathum', 'Udayapur', 'Pokhara'
  ];

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      loadKundaliHistory();
    }
  }, []);

  const loadKundaliHistory = async () => {
    try {
      const response = await getKundaliHistory();
      setKundaliHistory(response.data);
    } catch (error) {
      console.error("Error loading kundali history:", error);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.dateOfBirth) {
      setError("Date of birth is required");
      return false;
    }
    if (!formData.timeOfBirth) {
      setError("Time of birth is required");
      return false;
    }
    
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.timeOfBirth)) {
      setError("Please enter time in 24-hour format (HH:MM)");
      return false;
    }
    
    setError('');
    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const requestData = {
        name: formData.name.trim(),
        birthDate: formData.dateOfBirth,
        birthTime: formData.timeOfBirth,
        birthPlace: formData.placeOfBirth,
        ...(formData.gender && { gender: formData.gender }),
        ...(formData.latitude && { latitude: parseFloat(formData.latitude) }),
        ...(formData.longitude && { longitude: parseFloat(formData.longitude) })
      };
      
      console.log("Sending request data:", requestData);
      const response = await generateKundali(requestData);
      
      if (response.data.success) {
        setKundaliData(response.data.data);
        setActiveTab('results');
        setActiveResultTab('charts');
        
        if (user) await loadKundaliHistory();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error("Kundali generation error:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Failed to generate kundali. Please check your input.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleDeleteKundali = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this kundali?")) return;
    
    try {
      await deleteKundali(id);
      setKundaliHistory(prev => prev.filter(k => k._id !== id));
    } catch (error) {
      console.error("Error deleting kundali:", error);
    }
  };

  const handleDownload = () => {
    if (!kundaliData) return;
    
    const summary = `
╔════════════════════════════════════════════════════════════╗
║                  VEDIC KUNDALI REPORT                      ║
╚════════════════════════════════════════════════════════════╝

PERSONAL DETAILS
────────────────
Name: ${kundaliData.name}
Date of Birth: ${kundaliData.birthDetails.date}
Bikram Sambat: ${kundaliData.birthDetails.bsDate}
Time of Birth: ${kundaliData.birthDetails.time}
Place of Birth: ${kundaliData.birthDetails.place}
${kundaliData.gender ? `Gender: ${kundaliData.gender}` : ''}

ASTRONOMICAL DETAILS
────────────────────
Coordinates: ${kundaliData.birthDetails.coordinates?.lat}°N, ${kundaliData.birthDetails.coordinates?.lng}°E
Ayanamsa: ${kundaliData.chartData?.ayanamsa?.toFixed(2)}°
Sidereal Time: ${kundaliData.chartData?.siderealTime?.toFixed(2)}°

ASCENDANT (LAGNA)
─────────────────
${kundaliData.ascendant.name} (${kundaliData.ascendant.english}) ${kundaliData.ascendant.symbol}
Lord: ${kundaliData.ascendant.lord}

MOON SIGN (JANMA RASHI)
───────────────────────
${kundaliData.moonSign.name} (${kundaliData.moonSign.english})
Longitude: ${kundaliData.moonSign.longitude?.toFixed(2)}°

PLANETARY POSITIONS
───────────────────
${kundaliData.planets?.map(p => 
  `${p.symbol} ${p.name.padEnd(8)} : ${p.rashi.padEnd(12)} ${p.degree.padEnd(8)} House ${p.house.toString().padStart(2)} ${p.nakshatra.padEnd(16)} Pada ${p.pada} ${p.retrograde ? '(R)' : ''}`
).join('\n')}

HOUSE POSITIONS
───────────────
${kundaliData.houses?.map((h, i) => 
  `House ${(i + 1).toString().padStart(2)} : ${h.rashi.padEnd(12)} ${h.longitude.toFixed(2)}°`
).join('\n')}

DASHA TIMELINE (VIMSHOTTARI)
─────────────────────────────
${kundaliData.dashas?.map(d => 
  `• ${d.planet.padEnd(8)} : ${d.period.padEnd(11)} ${d.isCurrent ? '← CURRENT' : ''}`
).join('\n')}

AUSPICIOUS NAME INITIALS
─────────────────────────
${kundaliData.nameInitials?.join(', ')}

═══════════════════════════════════════════════════════════════
Generated by RashiBazar • ${new Date().toLocaleDateString()}
═══════════════════════════════════════════════════════════════
    `;

    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kundali-${kundaliData.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setKundaliData(null);
    setActiveTab('form');
    setActiveResultTab('charts');
    setError('');
    setFormData({
      name: '',
      dateOfBirth: '',
      timeOfBirth: '12:00',
      placeOfBirth: 'Kathmandu',
      gender: '',
      latitude: '',
      longitude: ''
    });
    setBsDate({ year: 2080, month: 1, day: 1 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSampleLoad = () => {
    setFormData({
      name: 'Gautam',
      dateOfBirth: '2003-06-20',
      timeOfBirth: '17:06',
      placeOfBirth: 'Pokhara',
      gender: 'male',
      latitude: '28.2096',
      longitude: '83.9856'
    });
    setBsDate({ year: 2060, month: 3, day: 6 });
  };

  // Convert AD to BS (simplified)
  const convertADToBS = (adDate) => {
    const date = new Date(adDate);
    // Simplified conversion for demonstration
    const year = date.getFullYear() + 57;
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return { year, month, day };
  };

  // Convert BS to AD (simplified)
  const convertBSToAD = (bsYear, bsMonth, bsDay) => {
    // Simplified conversion
    const adYear = bsYear - 57;
    const date = new Date(adYear, bsMonth - 1, bsDay);
    return date.toISOString().split('T')[0];
  };

  const CalendarInput = () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-yellow-300 mb-2">
            <Calendar className="inline w-4 h-4 mr-2" />
            AD Date of Birth *
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => {
              handleInputChange('dateOfBirth', e.target.value);
              const bsDate = convertADToBS(e.target.value);
              setBsDate(bsDate);
            }}
            className="w-full px-4 py-3 bg-black/50 border-2 border-purple-400/30 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none transition-all"
            required
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-semibold text-yellow-300 mb-2">
            <Calendar className="inline w-4 h-4 mr-2" />
            BS Date of Birth
          </label>
          <div className="relative">
            <input
              type="text"
              value={`${bsDate.year}-${String(bsDate.month).padStart(2, '0')}-${String(bsDate.day).padStart(2, '0')}`}
              readOnly
              className="w-full px-4 py-3 bg-black/50 border-2 border-purple-400/30 rounded-lg text-white cursor-pointer"
              onClick={() => setShowBSCalendar(!showBSCalendar)}
            />
            <button
              type="button"
              onClick={() => setShowBSCalendar(!showBSCalendar)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-400 hover:text-yellow-300"
            >
              📅
            </button>
          </div>
        </div>
      </div>
      
      {showBSCalendar && (
        <div className="mt-2">
          <BSCalendar 
            selectedDate={bsDate}
            onSelect={(date) => {
              setBsDate(date);
              const adDate = convertBSToAD(date.year, date.month, date.day);
              handleInputChange('dateOfBirth', adDate);
              setShowBSCalendar(false);
            }}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-b from-black via-purple-950 to-black text-white px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            वैदिक ज्योतिष कुण्डली
          </h1>
          <p className="text-gray-300 text-xl">
            Generate accurate North Indian style Vedic birth chart
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 bg-black/50 p-2 rounded-xl mb-8">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-4 px-4 rounded-lg font-medium transition-all ${activeTab === 'form' 
              ? 'bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-purple-600/20 text-yellow-300 shadow-lg' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="h-5 w-5" />
              <span className="text-lg">Generate New</span>
            </div>
          </button>
          
          <button
            onClick={() => {
              if (!user) {
                alert("Please sign in to view your kundali history");
                return;
              }
              setActiveTab('history');
            }}
            className={`flex-1 py-4 px-4 rounded-lg font-medium transition-all ${activeTab === 'history' 
              ? 'bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-purple-600/20 text-yellow-300 shadow-lg' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <div className="flex items-center justify-center gap-3">
              <History className="h-5 w-5" />
              <span className="text-lg">My History</span>
            </div>
          </button>
          
          {kundaliData && (
            <button
              onClick={() => setActiveTab('results')}
              className={`flex-1 py-4 px-4 rounded-lg font-medium transition-all ${activeTab === 'results' 
                ? 'bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-purple-600/20 text-yellow-300 shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center justify-center gap-3">
                <Star className="h-5 w-5" />
                <span className="text-lg">Results</span>
              </div>
            </button>
          )}
        </div>

        {/* Results Display */}
        {activeTab === 'results' && kundaliData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Header Card */}
            <div className="rounded-2xl overflow-hidden border-4 border-yellow-500/30 bg-gradient-to-br from-black via-purple-900/30 to-black">
              <div className="p-8">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-yellow-300 mb-2">{kundaliData.name}</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="h-5 w-5" />
                        <span className="font-semibold">{kundaliData.birthDetails.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300 ml-7">
                        <span className="text-sm">(BS: {kundaliData.birthDetails.bsDate})</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="h-5 w-5" />
                      <span className="font-mono text-lg">{kundaliData.birthDetails.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin className="h-5 w-5" />
                      <span className="font-semibold">{kundaliData.birthDetails.place}, Nepal</span>
                    </div>
                    {kundaliData.birthDetails.coordinates && (
                      <div className="ml-7 text-sm text-gray-400">
                        {kundaliData.birthDetails.coordinates.lat}°N, {kundaliData.birthDetails.coordinates.lng}°E
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-300">
                      <User className="h-5 w-5" />
                      <span className="font-semibold">{kundaliData.gender || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent my-6"></div>
                
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-black/30 rounded-xl border-2 border-red-500/30">
                    <div className="text-sm text-gray-400 mb-1">LAGNA</div>
                    <div className="text-3xl font-bold text-red-400 mb-1">{kundaliData.ascendant.name}</div>
                    <div className="text-lg text-gray-300">{kundaliData.ascendant.english}</div>
                    <div className="text-2xl mt-2">{kundaliData.ascendant.symbol}</div>
                  </div>
                  
                  <div className="text-center p-4 bg-black/30 rounded-xl border-2 border-blue-500/30">
                    <div className="text-sm text-gray-400 mb-1">MOON SIGN</div>
                    <div className="text-3xl font-bold text-blue-400 mb-1">{kundaliData.moonSign.name}</div>
                    <div className="text-lg text-gray-300">{kundaliData.moonSign.english}</div>
                  </div>
                  
                  <div className="text-center p-4 bg-black/30 rounded-xl border-2 border-purple-500/30">
                    <div className="text-sm text-gray-400 mb-1">NAKSHATRA</div>
                    <div className="text-3xl font-bold text-purple-400 mb-1">
                      {kundaliData.planets?.find(p => p.name === 'Moon')?.nakshatra || 'Unknown'}
                    </div>
                    <div className="text-lg text-gray-300">
                      Pada {kundaliData.planets?.find(p => p.name === 'Moon')?.pada || '1'}
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-black/30 rounded-xl border-2 border-green-500/30">
                    <div className="text-sm text-gray-400 mb-1">COORDINATES</div>
                    {kundaliData.birthDetails.coordinates && (
                      <>
                        <div className="font-mono text-lg text-green-400">
                          {kundaliData.birthDetails.coordinates.lat}°N
                        </div>
                        <div className="font-mono text-lg text-green-400">
                          {kundaliData.birthDetails.coordinates.lng}°E
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Chart Navigation */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {[
                { id: 'charts', label: 'Charts', icon: '📊' },
                { id: 'planets', label: 'Planets', icon: '🪐' },
                { id: 'dasha', label: 'Dasha', icon: '⏳' },
                { id: 'names', label: 'Names', icon: '📛' },
                { id: 'yogas', label: 'Yogas', icon: '🧘' },
                { id: 'bhava', label: 'Bhava Chalit', icon: '🏠' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveResultTab(item.id)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    activeResultTab === item.id
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg'
                      : 'bg-gradient-to-r from-purple-900/30 to-black/30 border-2 border-yellow-400/30 text-yellow-300 hover:bg-yellow-400/10'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
            
            {/* Conditional Content based on activeResultTab */}
            <div className="mt-8">
              {/* Charts Tab */}
              {activeResultTab === 'charts' && (
                <div className="space-y-8">
                  {/* Main Chart Section */}
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <div className="bg-black/30 p-6 rounded-2xl border-2 border-purple-700/30">
                        <div className="flex items-center gap-3 mb-6">
                          <Target className="h-6 w-6 text-yellow-400" />
                          <h3 className="text-2xl font-bold text-yellow-300">Rashi Chart (Square Division)</h3>
                        </div>
                        <RashiChart
                          planets={kundaliData.planets}
                          ascendant={kundaliData.ascendant.english}
                        />
                        <div className="mt-8 grid grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-black/50 rounded">
                            <div className="text-sm text-gray-400">Ayanamsa</div>
                            <div className="text-yellow-300 font-mono">
                              {kundaliData.chartData?.ayanamsa?.toFixed(2) || '23.85'}°
                            </div>
                          </div>
                          <div className="text-center p-3 bg-black/50 rounded">
                            <div className="text-sm text-gray-400">Sidereal Time</div>
                            <div className="text-yellow-300 font-mono">
                              {kundaliData.chartData?.siderealTime?.toFixed(2) || '0.00'}°
                            </div>
                          </div>
                          <div className="text-center p-3 bg-black/50 rounded">
                            <div className="text-sm text-gray-400">Planets</div>
                            <div className="text-yellow-300 text-2xl font-bold">9</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-black/30 p-6 rounded-2xl border-2 border-blue-700/30">
                        <div className="flex items-center gap-3 mb-6">
                          <Globe className="h-6 w-6 text-blue-400" />
                          <h3 className="text-xl font-bold text-blue-300">Chart Information</h3>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="p-3 bg-black/50 rounded">
                            <div className="text-sm text-gray-400">Chart Type</div>
                            <div className="text-yellow-300 font-semibold">North Indian (D1)</div>
                          </div>
                          <div className="p-3 bg-black/50 rounded">
                            <div className="text-sm text-gray-400">House System</div>
                            <div className="text-yellow-300 font-semibold">Equal House</div>
                          </div>
                          <div className="p-3 bg-black/50 rounded">
                            <div className="text-sm text-gray-400">Ayanamsa</div>
                            <div className="text-yellow-300 font-semibold">Lahiri</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-black/30 p-6 rounded-2xl border-2 border-green-700/30">
                        <div className="space-y-3">
                          <button
                            onClick={handleDownload}
                            className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                          >
                            <Download className="h-5 w-5" />
                            Download Report
                          </button>
                          <button
                            onClick={handleReset}
                            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                          >
                            <RefreshCw className="h-5 w-5" />
                            New Chart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Planets Tab */}
              {activeResultTab === 'planets' && (
                <div className="space-y-8">
                  {/* Planetary Details */}
                  <div className="bg-black/30 p-6 rounded-2xl border-2 border-purple-700/30">
                    <div className="flex items-center gap-3 mb-6">
                      <Sun className="h-6 w-6 text-yellow-400" />
                      <Moon className="h-6 w-6 text-blue-400" />
                      <h3 className="text-2xl font-bold text-yellow-300">Detailed Planetary Positions</h3>
                    </div>
                    <PlanetaryTable planets={kundaliData.planets} />
                  </div>

                  {/* Planet Strength Analysis */}
                  <div className="bg-black/30 p-6 rounded-2xl border-2 border-blue-700/30">
                    <h3 className="text-2xl font-bold text-blue-300 mb-6">Planet Strength Analysis</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      {kundaliData.planets?.map((planet, idx) => (
                        <div key={idx} className="bg-black/50 p-4 rounded-lg border border-purple-500/30">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className={`text-2xl ${planet.color}`}>{planet.symbol}</span>
                              <div>
                                <div className="font-bold text-white">{planet.name}</div>
                                <div className="text-sm text-gray-400">in {planet.rashi}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-400">Strength</div>
                              <div className="text-yellow-300 font-bold">{planet.strength || 50}%</div>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                planet.strength > 70 ? 'bg-green-500' :
                                planet.strength > 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${planet.strength || 50}%` }}
                            />
                          </div>
                          <div className="mt-3 text-sm text-gray-400">
                            House: {planet.house} • {planet.retrograde ? 'Retrograde' : 'Direct'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Dasha Tab */}
              {activeResultTab === 'dasha' && (
                <div className="space-y-8">
                  <div className="bg-black/30 p-6 rounded-2xl border-2 border-purple-700/30">
                    <DashaDisplay dashas={kundaliData.dashas} />
                  </div>
                </div>
              )}

              {/* Names Tab */}
              {activeResultTab === 'names' && (
                <div className="space-y-8">
                  <div className="bg-black/30 p-6 rounded-2xl border-2 border-purple-700/30">
                    <NameSuggestions 
                      initials={kundaliData.nameInitials} 
                      moonSign={kundaliData.moonSign.name}
                      gender={kundaliData.gender}
                    />
                  </div>
                </div>
              )}

              {/* Yogas Tab */}
              {activeResultTab === 'yogas' && (
                <div className="space-y-8">
                  <YogasDisplay 
                    planets={kundaliData.planets}
                    ascendant={kundaliData.ascendant}
                  />
                </div>
              )}

              {/* Bhava Chalit Tab */}
              {activeResultTab === 'bhava' && (
                <div className="space-y-8">
                  <BhavaChalitDisplay 
                    planets={kundaliData.planets}
                    houses={kundaliData.houses}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Generate Form */}
        {activeTab === 'form' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/30 backdrop-blur-md rounded-2xl border-2 border-purple-700/30 p-6 md:p-8"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400/10 via-orange-500/10 to-red-500/10 mb-4 border-4 border-yellow-400/30">
                <Sparkles className="h-12 w-12 text-yellow-400" />
              </div>
              <h3 className="text-3xl md:text-4xl text-yellow-300 mb-2">
                Enter Birth Details
              </h3>
              <p className="text-gray-400 text-lg">
                Fill accurate details for precise kundali calculation
              </p>
              {!user && (
                <p className="text-sm text-yellow-400 mt-2">
                  💡 Sign in to save your kundali history
                </p>
              )}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-8">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-yellow-300 mb-2">
                  <User className="inline w-5 h-5 mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border-2 border-purple-400/30 rounded-lg text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none transition-all text-lg"
                  required
                />
              </div>

              {/* Calendar Input */}
              <CalendarInput />

              {/* Time */}
              <div>
                <label className="block text-sm font-semibold text-yellow-300 mb-2">
                  <Clock className="inline w-5 h-5 mr-2" />
                  Time of Birth (24-hour) *
                </label>
                <input
                  type="time"
                  value={formData.timeOfBirth}
                  onChange={(e) => handleInputChange('timeOfBirth', e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border-2 border-purple-400/30 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none transition-all text-lg"
                  required
                />
                <p className="text-sm text-gray-400 mt-2">Use 24-hour format (e.g., 17:06 for 5:06 PM)</p>
              </div>

              {/* Location and Gender */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-yellow-300 mb-2">
                    <MapPin className="inline w-5 h-5 mr-2" />
                    District (Nepal) *
                  </label>
                  <select
                    value={formData.placeOfBirth}
                    onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border-2 border-purple-400/30 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none transition-all"
                    required
                  >
                    <option value="">Select District</option>
                    {ALL_NEPAL_DISTRICTS.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-2">All 77 districts of Nepal available</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-yellow-300 mb-2">
                    <User className="inline w-5 h-5 mr-2" />
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border-2 border-purple-400/30 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none transition-all"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-yellow-300 mb-2">
                    <Globe className="inline w-5 h-5 mr-2" />
                    Latitude (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="e.g., 28.2096 for Pokhara"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border-2 border-purple-400/30 rounded-lg text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-2">Leave blank to use district coordinates</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-yellow-300 mb-2">
                    <Globe className="inline w-5 h-5 mr-2" />
                    Longitude (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="e.g., 83.9856 for Pokhara"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border-2 border-purple-400/30 rounded-lg text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-black py-4 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-xl shadow-xl"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      Calculating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      <Sparkles className="h-6 w-6" />
                      Generate Kundali
                    </span>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={handleSampleLoad}
                  className="px-8 py-4 bg-blue-900/30 border-2 border-blue-500/30 rounded-xl text-blue-300 hover:bg-blue-900/50 hover:border-blue-500/50 transition-all text-lg"
                >
                  Load Sample (Gautam)
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/30 backdrop-blur-md rounded-2xl border-2 border-purple-700/30 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-900/30 rounded-lg">
                  <History className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-2xl text-yellow-300">Your Kundali History</h3>
                  <p className="text-gray-400 text-sm">Previously generated kundalis</p>
                </div>
              </div>
              <button
                onClick={loadKundaliHistory}
                className="p-2 bg-purple-900/30 rounded-lg hover:bg-purple-900/50 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5 text-purple-300" />
              </button>
            </div>

            {!user ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-900/30 mb-4">
                  <User className="h-10 w-10 text-purple-400" />
                </div>
                <p className="text-gray-400 mb-4">Please sign in to view your kundali history</p>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-pink-500 text-black rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Sign In
                </button>
              </div>
            ) : kundaliHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-900/30 mb-4">
                  <History className="h-10 w-10 text-purple-400" />
                </div>
                <p className="text-gray-400 mb-2">No kundali history found</p>
                <p className="text-gray-500 text-sm mb-6">Generate your first kundali to get started!</p>
                <button
                  onClick={() => setActiveTab('form')}
                  className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-purple-500 text-black rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Generate Kundali
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {kundaliHistory.map((kundali) => (
                  <div
                    key={kundali._id}
                    className="bg-black/50 border-2 border-purple-700/30 rounded-xl p-4 hover:bg-purple-900/20 transition-all cursor-pointer"
                    onClick={() => {
                      // Load this kundali
                      setKundaliData(kundali);
                      setActiveTab('results');
                      setActiveResultTab('charts');
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400/20 to-purple-500/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white mb-1">{kundali.name}</h4>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(kundali.birthDate).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {kundali.birthPlace}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="bg-black/30 p-3 rounded">
                            <div className="text-xs text-gray-400">Lagna</div>
                            <div className="text-yellow-300 font-semibold">{kundali.ascendantRashi}</div>
                          </div>
                          <div className="bg-black/30 p-3 rounded">
                            <div className="text-xs text-gray-400">Moon Sign</div>
                            <div className="text-blue-300 font-semibold">{kundali.moonRashi}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={(e) => handleDeleteKundali(kundali._id, e)}
                          className="p-2 bg-red-900/30 border border-red-500/30 rounded hover:bg-red-900/50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                        <div className="text-xs text-gray-500 text-right">
                          {new Date(kundali.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
        
        {/* Footer Note */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Note: Calculations based on Surya Siddhanta with Lahiri Ayanamsa</p>
          <p className="mt-1">North Indian Style Chart • Equal House System • Placidus Houses</p>
          <p className="mt-1">Supports both AD and Bikram Sambat calendars</p>
        </div>
      </div>
    </div>
  );
};

export default Kundali;