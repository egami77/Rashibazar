// // backend/utils/bsConverter.js

// // Conversion between AD and Bikram Sambat
// export function toBS(adDate) {
//   const bsStart = new Date(1918, 3, 13); // Bikram Sambat 1975 starts
//   const bsYearStart = 1975;
  
//   const diffTime = adDate.getTime() - bsStart.getTime();
//   const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
//   let bsYear = bsYearStart;
//   let daysInYear = isBSLeapYear(bsYear) ? 366 : 365;
//   let remainingDays = diffDays;
  
//   while (remainingDays >= daysInYear) {
//     remainingDays -= daysInYear;
//     bsYear++;
//     daysInYear = isBSLeapYear(bsYear) ? 366 : 365;
//   }
  
//   const bsMonth = getBSMonthFromDay(bsYear, remainingDays);
//   const bsDay = remainingDays - getDaysBeforeMonth(bsYear, bsMonth) + 1;
  
//   return {
//     year: bsYear,
//     month: bsMonth,
//     day: bsDay
//   };
// }

// export function toAD(bsYear, bsMonth, bsDay) {
//   const bsStart = new Date(1918, 3, 13); // Bikram Sambat 1975 starts
//   let totalDays = 0;
  
//   // Add days from previous years
//   for (let year = 1975; year < bsYear; year++) {
//     totalDays += isBSLeapYear(year) ? 366 : 365;
//   }
  
//   // Add days from previous months in current year
//   totalDays += getDaysBeforeMonth(bsYear, bsMonth);
  
//   // Add days in current month
//   totalDays += bsDay - 1;
  
//   const adDate = new Date(bsStart.getTime() + totalDays * 24 * 60 * 60 * 1000);
//   return adDate;
// }

// function isBSLeapYear(year) {
//   // BS leap year calculation
//   return (year * 292207 + 373) % 1200 < 692;
// }

// function getDaysBeforeMonth(year, month) {
//   const monthLengths = getBSMonthLengths(year);
//   let days = 0;
//   for (let i = 1; i < month; i++) {
//     days += monthLengths[i - 1];
//   }
//   return days;
// }

// function getBSMonthLengths(year) {
//   // BS month lengths (approximate)
//   return [
//     31, // Baishakh
//     31, // Jestha
//     31, // Ashadh
//     31, // Shrawan
//     31, // Bhadra
//     30, // Ashwin
//     30, // Kartik
//     29, // Mangsir
//     29, // Poush
//     30, // Magh
//     30, // Falgun
//     30  // Chaitra (29 in leap year)
//   ].map((days, index) => 
//     index === 11 && isBSLeapYear(year) ? 29 : days
//   );
// }

// function getBSMonthFromDay(year, dayOfYear) {
//   const monthLengths = getBSMonthLengths(year);
//   let month = 1;
//   let remainingDays = dayOfYear;
  
//   for (let i = 0; i < monthLengths.length; i++) {
//     if (remainingDays < monthLengths[i]) {
//       month = i + 1;
//       break;
//     }
//     remainingDays -= monthLengths[i];
//   }
  
//   return month;
// }

// export function getBSMonthName(month) {
//   const months = [
//     'Baishakh', 'Jestha', 'Ashadh', 'Shrawan',
//     'Bhadra', 'Ashwin', 'Kartik', 'Mangsir',
//     'Poush', 'Magh', 'Falgun', 'Chaitra'
//   ];
//   return months[month - 1] || months[0];
// }