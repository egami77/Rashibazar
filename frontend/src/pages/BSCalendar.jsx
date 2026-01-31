import React, { useState } from 'react';

const BSCalendar = ({ selectedDate, onSelect }) => {
  const [currentYear, setCurrentYear] = useState(selectedDate.year);
  const [currentMonth, setCurrentMonth] = useState(selectedDate.month);
  
  const bsMonths = [
    'Baishakh', 'Jestha', 'Ashadh', 'Shrawan',
    'Bhadra', 'Ashwin', 'Kartik', 'Mangsir',
    'Poush', 'Magh', 'Falgun', 'Chaitra'
  ];
  
  // Get days in BS month (simplified)
  const getDaysInMonth = (year, month) => {
    const monthLengths = [31, 31, 31, 31, 31, 30, 30, 29, 29, 30, 30, 30];
    if (month === 12 && isBSLeapYear(year)) return 29; // Chaitra in leap year
    return monthLengths[month - 1];
  };
  
  const isBSLeapYear = (year) => {
    return (year * 292207 + 373) % 1200 < 692;
  };
  
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
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
  
  return (
    <div className="bg-black/80 border-2 border-yellow-400/30 rounded-lg p-4">
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
          className="px-3 py-1 bg-purple-900/50 rounded hover:bg-purple-900"
        >
          ←
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
          className="px-3 py-1 bg-purple-900/50 rounded hover:bg-purple-900"
        >
          →
        </button>
      </div>
      
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['आ', 'सो', 'म', 'बु', 'बि', 'शु', 'श'].map((day, i) => (
          <div key={i} className="text-center text-xs text-gray-400 p-1">
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
                    ? 'bg-yellow-500 text-black font-bold'
                    : 'bg-purple-900/30 hover:bg-purple-900/50 text-white'
                  }`}
              >
                {day}
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>
      
      {/* Year navigation */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentYear(currentYear - 1)}
          className="px-3 py-1 bg-black/50 rounded text-sm hover:bg-black/70"
        >
          Previous Year
        </button>
        <button
          onClick={() => setCurrentYear(currentYear + 1)}
          className="px-3 py-1 bg-black/50 rounded text-sm hover:bg-black/70"
        >
          Next Year
        </button>
      </div>
    </div>
  );
};

export default BSCalendar;