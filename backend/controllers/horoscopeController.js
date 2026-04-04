// backend/controllers/horoscopeController.js
import Horoscope from "../models/Horoscope.js";

// Get horoscope for specific rashi and period
export const getHoroscope = async (req, res) => {
  try {
    const { rashi, period } = req.params;
    const { date } = req.query;

    console.log(`📅 Fetching ${period} horoscope for ${rashi}`);

    // Validate inputs
    const validRashis = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    
    const validPeriods = ['daily', 'weekly', 'monthly', 'yearly'];
    
    if (!validRashis.includes(rashi)) {
      return res.status(400).json({ 
        message: "Invalid rashi",
        validRashis 
      });
    }
    
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ 
        message: "Invalid period",
        validPeriods 
      });
    }

    // Calculate date for the prediction
    const predictionDate = date ? new Date(date) : new Date();
    
    // For weekly/monthly/yearly, we need to adjust the date range
    let startDate, endDate;
    
    if (period === 'weekly') {
      startDate = new Date(predictionDate);
      startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of week (Sunday)
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
    } else if (period === 'monthly') {
      startDate = new Date(predictionDate.getFullYear(), predictionDate.getMonth(), 1);
      endDate = new Date(predictionDate.getFullYear(), predictionDate.getMonth() + 1, 1);
    } else if (period === 'yearly') {
      startDate = new Date(predictionDate.getFullYear(), 0, 1);
      endDate = new Date(predictionDate.getFullYear() + 1, 0, 1);
    } else {
      // Daily
      startDate = new Date(predictionDate.getFullYear(), predictionDate.getMonth(), predictionDate.getDate());
      endDate = new Date(predictionDate.getFullYear(), predictionDate.getMonth(), predictionDate.getDate() + 1);
    }

    // Try to fetch from database first
    let horoscope = await Horoscope.findOne({
      rashi,
      period,
      date: {
        $gte: startDate,
        $lt: endDate
      }
    });

    // If not found in DB, generate new prediction
    if (!horoscope) {
      const generatedHoroscope = generateHoroscope(rashi, period, predictionDate);
      
      // Save to database for future requests
      const newHoroscope = new Horoscope({
        rashi,
        period,
        date: predictionDate,
        prediction: generatedHoroscope.prediction,
        luckyNumber: generatedHoroscope.luckyNumber,
        luckyColor: generatedHoroscope.luckyColor,
        compatibility: generatedHoroscope.compatibility,
        advice: generatedHoroscope.advice,
        additionalInfo: generatedHoroscope.additionalInfo,
        categoryPredictions: generatedHoroscope.categoryPredictions
      });
      
      await newHoroscope.save();
      horoscope = newHoroscope;
    }

    res.json({
      success: true,
      rashi,
      period,
      date: predictionDate.toISOString().split('T')[0],
      data: {
        prediction: horoscope.prediction,
        luckyNumber: horoscope.luckyNumber,
        luckyColor: horoscope.luckyColor,
        compatibility: horoscope.compatibility,
        advice: horoscope.advice,
        additionalInfo: horoscope.additionalInfo,
        categoryPredictions: horoscope.categoryPredictions
      }
    });
    
  } catch (err) {
    console.error("❌ getHoroscope error:", err);
    res.status(500).json({ 
      message: "Failed to fetch horoscope",
      error: err.message 
    });
  }
};

// Get all rashis with detailed information
export const getAllRashis = async (req, res) => {
  try {
    const rashis = [
      { 
        name: "Aries", 
        displayName: "Aries (Mesh)",
        symbol: "♈",
        sanskrit: "मेष",
        element: "Fire",
        lord: "Mars",
        quality: "Cardinal",
        color: "Red",
        bodyPart: "Head",
        strengths: ["Courageous", "Determined", "Confident", "Optimistic"],
        weaknesses: ["Impatient", "Moody", "Short-tempered", "Impulsive"]
      },
      { 
        name: "Taurus", 
        displayName: "Taurus (Vrishabh)",
        symbol: "♉",
        sanskrit: "वृषभ",
        element: "Earth",
        lord: "Venus",
        quality: "Fixed",
        color: "Green",
        bodyPart: "Throat",
        strengths: ["Reliable", "Patient", "Practical", "Devoted"],
        weaknesses: ["Stubborn", "Possessive", "Uncompromising", "Materialistic"]
      },
      { 
        name: "Gemini", 
        displayName: "Gemini (Mithun)",
        symbol: "♊",
        sanskrit: "मिथुन",
        element: "Air",
        lord: "Mercury",
        quality: "Mutable",
        color: "Yellow",
        bodyPart: "Arms",
        strengths: ["Gentle", "Affectionate", "Curious", "Adaptable"],
        weaknesses: ["Nervous", "Inconsistent", "Indecisive", "Gossipy"]
      },
      { 
        name: "Cancer", 
        displayName: "Cancer (Kark)",
        symbol: "♋",
        sanskrit: "कर्क",
        element: "Water",
        lord: "Moon",
        quality: "Cardinal",
        color: "Silver",
        bodyPart: "Chest",
        strengths: ["Tenacious", "Highly imaginative", "Loyal", "Emotional"],
        weaknesses: ["Pessimistic", "Suspicious", "Manipulative", "Insecure"]
      },
      { 
        name: "Leo", 
        displayName: "Leo (Simha)",
        symbol: "♌",
        sanskrit: "सिंह",
        element: "Fire",
        lord: "Sun",
        quality: "Fixed",
        color: "Gold",
        bodyPart: "Heart",
        strengths: ["Creative", "Passionate", "Generous", "Cheerful"],
        weaknesses: ["Arrogant", "Stubborn", "Lazy", "Inflexible"]
      },
      { 
        name: "Virgo", 
        displayName: "Virgo (Kanya)",
        symbol: "♍",
        sanskrit: "कन्या",
        element: "Earth",
        lord: "Mercury",
        quality: "Mutable",
        color: "Green",
        bodyPart: "Digestive System",
        strengths: ["Loyal", "Analytical", "Kind", "Hardworking"],
        weaknesses: ["Worrisome", "Shy", "Critical", "Perfectionist"]
      },
      { 
        name: "Libra", 
        displayName: "Libra (Tula)",
        symbol: "♎",
        sanskrit: "तुला",
        element: "Air",
        lord: "Venus",
        quality: "Cardinal",
        color: "Pink",
        bodyPart: "Kidneys",
        strengths: ["Cooperative", "Diplomatic", "Gracious", "Fair-minded"],
        weaknesses: ["Indecisive", "Avoids confrontations", "Self-pity", "Unreliable"]
      },
      { 
        name: "Scorpio", 
        displayName: "Scorpio (Vrishchik)",
        symbol: "♏",
        sanskrit: "वृश्चिक",
        element: "Water",
        lord: "Mars",
        quality: "Fixed",
        color: "Maroon",
        bodyPart: "Reproductive Organs",
        strengths: ["Brave", "Passionate", "Stubborn", "True friend"],
        weaknesses: ["Distrusting", "Jealous", "Secretive", "Violent"]
      },
      { 
        name: "Sagittarius", 
        displayName: "Sagittarius (Dhanu)",
        symbol: "♐",
        sanskrit: "धनु",
        element: "Fire",
        lord: "Jupiter",
        quality: "Mutable",
        color: "Purple",
        bodyPart: "Thighs",
        strengths: ["Generous", "Idealistic", "Great sense of humor"],
        weaknesses: ["Promises more than can deliver", "Very impatient", "Will say anything no matter how undiplomatic"]
      },
      { 
        name: "Capricorn", 
        displayName: "Capricorn (Makar)",
        symbol: "♑",
        sanskrit: "मकर",
        element: "Earth",
        lord: "Saturn",
        quality: "Cardinal",
        color: "Brown",
        bodyPart: "Knees",
        strengths: ["Responsible", "Disciplined", "Self-control", "Good managers"],
        weaknesses: ["Know-it-all", "Unforgiving", "Condescending", "Expects the worst"]
      },
      { 
        name: "Aquarius", 
        displayName: "Aquarius (Kumbh)",
        symbol: "♒",
        sanskrit: "कुम्भ",
        element: "Air",
        lord: "Saturn",
        quality: "Fixed",
        color: "Blue",
        bodyPart: "Ankles",
        strengths: ["Progressive", "Original", "Humanitarian", "Independent"],
        weaknesses: ["Runs from emotional expression", "Temperamental", "Uncompromising", "Aloof"]
      },
      { 
        name: "Pisces", 
        displayName: "Pisces (Meen)",
        symbol: "♓",
        sanskrit: "मीन",
        element: "Water",
        lord: "Jupiter",
        quality: "Mutable",
        color: "Sea Green",
        bodyPart: "Feet",
        strengths: ["Compassionate", "Artistic", "Intuitive", "Gentle", "Wise"],
        weaknesses: ["Fearful", "Overly trusting", "Sad", "Desire to escape reality"]
      }
    ];
    
    res.json({
      success: true,
      rashis
    });
  } catch (err) {
    console.error("❌ getAllRashis error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch rashis",
      error: err.message 
    });
  }
};

// Get today's horoscope for all rashis
export const getDailyHoroscopeForAll = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const horoscopes = [];
    const rashis = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

    for (const rashi of rashis) {
      let horoscope = await Horoscope.findOne({
        rashi,
        period: 'daily',
        date: {
          $gte: today,
          $lt: tomorrow
        }
      });

      if (!horoscope) {
        horoscope = generateHoroscope(rashi, 'daily', today);
        
        const newHoroscope = new Horoscope({
          rashi,
          period: 'daily',
          date: today,
          prediction: horoscope.prediction,
          luckyNumber: horoscope.luckyNumber,
          luckyColor: horoscope.luckyColor,
          compatibility: horoscope.compatibility,
          advice: horoscope.advice,
          additionalInfo: horoscope.additionalInfo,
          categoryPredictions: horoscope.categoryPredictions
        });
        
        await newHoroscope.save();
      }

      horoscopes.push({
        rashi,
        symbol: getSymbolForRashi(rashi),
        prediction: horoscope.prediction.substring(0, 100) + '...',
        luckyNumber: horoscope.luckyNumber,
        luckyColor: horoscope.luckyColor
      });
    }

    res.json({
      success: true,
      date: today.toISOString().split('T')[0],
      horoscopes
    });
    
  } catch (err) {
    console.error("❌ getDailyHoroscopeForAll error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch daily horoscopes",
      error: err.message 
    });
  }
};

// Generate horoscope prediction
function generateHoroscope(rashi, period, date) {
  const predictions = {
    Aries: {
      daily: "Mars energizes your day. Take initiative in professional matters and express your ideas boldly.",
      weekly: "This week brings new beginnings. Mars provides the courage to tackle challenges. Mid-week is excellent for financial decisions.",
      monthly: "Career advancements are possible this month. Your ruling planet Mars is favorably positioned, enhancing leadership skills.",
      yearly: "A transformative year with opportunities for growth. Major life changes bring positive outcomes in career and relationships."
    },
    Taurus: {
      daily: "Venus brings harmony. Focus on relationships and creative pursuits. Financial matters show improvement.",
      weekly: "Stability and comfort characterize this week. Good for investments and long-term planning. Enjoy social gatherings.",
      monthly: "Financial growth and relationship strengthening this month. Venus influences bring artistic inspiration.",
      yearly: "A year of steady progress. Career stability achieved, relationships deepen, and personal fulfillment increases."
    },
    Gemini: {
      daily: "Mercury enhances communication. Great day for networking, learning, and intellectual discussions.",
      weekly: "Social interactions and learning opportunities abound. Travel plans may materialize. Express yourself clearly.",
      monthly: "Intellectual growth and new connections this month. Career advancements through communication skills.",
      yearly: "A year of mental expansion. Educational pursuits succeed, new friendships form, and career evolves."
    },
    Cancer: {
      daily: "Moon influences emotions positively. Family matters require attention. Home brings comfort and happiness.",
      weekly: "Emotional balance achieved this week. Focus on family and home improvements. Financial stability grows.",
      monthly: "Home and family bring joy. Emotional maturity leads to better relationships. Career progresses steadily.",
      yearly: "Emotional growth and family bonding. Career success through diligence. Financial security established."
    },
    Leo: {
      daily: "Sun brings confidence. Leadership opportunities arise. Creative projects receive recognition.",
      weekly: "Recognition and appreciation this week. Social events bring happiness. Financial gains possible.",
      monthly: "Career advancements and public recognition. Creative endeavors succeed. Relationships flourish.",
      yearly: "A year of achievement and recognition. Major life goals accomplished. Personal growth accelerates."
    },
    Virgo: {
      daily: "Mercury sharpens analytical skills. Focus on health and organization. Attention to detail brings success.",
      weekly: "Service-oriented activities bring satisfaction. Health improvements noted. Professional recognition possible.",
      monthly: "Perfection in work brings rewards. Health and wellness focus pays off. Relationships deepen.",
      yearly: "Year of refinement and career advancement. Hard work brings substantial rewards. Personal growth achieved."
    },
    Libra: {
      daily: "Venus brings balance. Focus on partnerships and harmony. Social activities bring happiness.",
      weekly: "Relationships flourish this week. Balance achieved in work and personal life. Creative expressions succeed.",
      monthly: "Partnerships prosper. Artistic endeavors receive recognition. Financial stability through collaborations.",
      yearly: "Year of relationships and artistic success. Professional growth through partnerships. Personal harmony."
    },
    Scorpio: {
      daily: "Mars brings intensity. Research and investigation yield results. Transformative conversations occur.",
      weekly: "Deep insights gained this week. Financial improvements through investments. Emotional transformations.",
      monthly: "Personal growth through introspection. Financial gains. Career advancements through strategic planning.",
      yearly: "Year of profound change and spiritual growth. Career transformations. Financial security established."
    },
    Sagittarius: {
      daily: "Jupiter brings optimism. Travel plans or educational pursuits favored. Philosophical discussions enlighten.",
      weekly: "Adventure and learning this week. Foreign connections beneficial. Spiritual growth occurs.",
      monthly: "Expansion in all areas. Educational achievements. Travel opportunities enhance perspective.",
      yearly: "Year of adventure and higher learning. Career advancements through education. Personal philosophy evolves."
    },
    Capricorn: {
      daily: "Saturn brings discipline. Career focus yields results. Long-term planning recommended.",
      weekly: "Hard work recognized this week. Professional achievements. Financial planning succeeds.",
      monthly: "Career advancements through diligence. Financial stability achieved. Personal goals met.",
      yearly: "Year of achievement and recognition. Major career milestones. Financial security established."
    },
    Aquarius: {
      daily: "Saturn influences bring innovation. Social causes attract support. Unique ideas succeed.",
      weekly: "Community involvement brings satisfaction. Innovative projects advance. Group activities beneficial.",
      monthly: "Social recognition for unique contributions. Technological interests prosper. Friendships deepen.",
      yearly: "Year of innovation and social impact. Career evolves with technology. Personal fulfillment through service."
    },
    Pisces: {
      daily: "Jupiter enhances intuition. Creative and spiritual activities favored. Compassion brings rewards.",
      weekly: "Artistic expression flourishes this week. Spiritual insights gained. Emotional healing occurs.",
      monthly: "Creative projects succeed. Spiritual growth. Emotional connections deepen.",
      yearly: "Year of artistic achievement and spiritual growth. Career success through creativity. Compassion rewarded."
    }
  };

  // Generate lucky numbers
  const luckyNumbers = {
    Aries: [1, 9, 17, 21], Taurus: [2, 6, 14, 24], Gemini: [3, 5, 12, 23],
    Cancer: [4, 8, 13, 22], Leo: [1, 4, 10, 19], Virgo: [3, 7, 15, 20],
    Libra: [2, 6, 11, 25], Scorpio: [8, 9, 18, 27], Sagittarius: [3, 7, 12, 28],
    Capricorn: [4, 8, 10, 26], Aquarius: [2, 5, 11, 29], Pisces: [3, 9, 12, 30]
  };

  const luckyColors = {
    Aries: "Red", Taurus: "Green", Gemini: "Yellow",
    Cancer: "Silver", Leo: "Gold", Virgo: "Green",
    Libra: "Pink", Scorpio: "Maroon", Sagittarius: "Purple",
    Capricorn: "Brown", Aquarius: "Blue", Pisces: "Sea Green"
  };

  const compatibility = {
    Aries: "Gemini", Taurus: "Cancer", Gemini: "Aries",
    Cancer: "Taurus", Leo: "Sagittarius", Virgo: "Capricorn",
    Libra: "Aquarius", Scorpio: "Pisces", Sagittarius: "Leo",
    Capricorn: "Virgo", Aquarius: "Libra", Pisces: "Scorpio"
  };

  const advice = {
    daily: "Stay positive and trust your instincts throughout the day.",
    weekly: "Balance work and personal life this week. Focus on priorities.",
    monthly: "Plan strategically and be open to new opportunities this month.",
    yearly: "Embrace change and focus on long-term goals throughout the year."
  };

  const categoryPredictions = {
    career: generateCareerPrediction(rashi, period),
    love: generateLovePrediction(rashi, period),
    health: generateHealthPrediction(rashi, period),
    finance: generateFinancePrediction(rashi, period)
  };

  return {
    prediction: predictions[rashi][period] || "Positive energies surround you during this period.",
    luckyNumber: luckyNumbers[rashi][Math.floor(Math.random() * luckyNumbers[rashi].length)],
    luckyColor: luckyColors[rashi],
    compatibility: compatibility[rashi],
    advice: advice[period],
    additionalInfo: {
      element: getElement(rashi),
      rulingPlanet: getRulingPlanet(rashi),
      quality: getQuality(rashi),
      bestTime: getBestTime(rashi),
      favorableDirection: getFavorableDirection(rashi)
    },
    categoryPredictions
  };
}

function generateCareerPrediction(rashi, period) {
  const predictions = {
    Aries: "New projects and leadership opportunities arise.",
    Taurus: "Stability and gradual progress in career.",
    Gemini: "Communication skills lead to advancements.",
    Cancer: "Emotional intelligence benefits professional growth.",
    Leo: "Recognition and appreciation for your work.",
    Virgo: "Attention to detail brings success.",
    Libra: "Collaborations and partnerships flourish.",
    Scorpio: "Strategic planning yields results.",
    Sagittarius: "Educational pursuits enhance career.",
    Capricorn: "Hard work and discipline pay off.",
    Aquarius: "Innovation and unique ideas succeed.",
    Pisces: "Creative talents receive recognition."
  };
  return predictions[rashi] || "Career growth through dedication.";
}

function generateLovePrediction(rashi, period) {
  const predictions = {
    Aries: "Passionate connections form.",
    Taurus: "Stable relationships deepen.",
    Gemini: "Communication enhances romance.",
    Cancer: "Emotional bonds strengthen.",
    Leo: "Romance brings joy and happiness.",
    Virgo: "Practical approach to relationships.",
    Libra: "Harmony and balance in love.",
    Scorpio: "Intense emotional connections.",
    Sagittarius: "Adventurous romantic experiences.",
    Capricorn: "Commitment and loyalty emphasized.",
    Aquarius: "Unique connections form.",
    Pisces: "Deep emotional and spiritual bonds."
  };
  return predictions[rashi] || "Love brings happiness and fulfillment.";
}

function generateHealthPrediction(rashi, period) {
  const predictions = {
    Aries: "Energy levels high, focus on exercise.",
    Taurus: "Stable health, watch diet.",
    Gemini: "Mental health focus, reduce stress.",
    Cancer: "Emotional wellness important.",
    Leo: "Vitality strong, maintain routine.",
    Virgo: "Attention to digestive health.",
    Libra: "Balance work and rest.",
    Scorpio: "Transformative health improvements.",
    Sagittarius: "Active lifestyle beneficial.",
    Capricorn: "Discipline in health routines.",
    Aquarius: "Innovative wellness approaches.",
    Pisces: "Holistic health practices help."
  };
  return predictions[rashi] || "Maintain balanced lifestyle for good health.";
}

function generateFinancePrediction(rashi, period) {
  const predictions = {
    Aries: "New income opportunities arise.",
    Taurus: "Stable financial growth.",
    Gemini: "Communication skills bring financial gains.",
    Cancer: "Emotional decisions affect finances.",
    Leo: "Recognition leads to financial rewards.",
    Virgo: "Detailed planning improves finances.",
    Libra: "Partnerships benefit financially.",
    Scorpio: "Investments yield returns.",
    Sagittarius: "Educational investments pay off.",
    Capricorn: "Hard work brings financial stability.",
    Aquarius: "Innovative ideas generate income.",
    Pisces: "Creative talents bring financial rewards."
  };
  return predictions[rashi] || "Financial stability through careful planning.";
}

function getElement(rashi) {
  const elements = {
    Aries: "Fire", Taurus: "Earth", Gemini: "Air", Cancer: "Water",
    Leo: "Fire", Virgo: "Earth", Libra: "Air", Scorpio: "Water",
    Sagittarius: "Fire", Capricorn: "Earth", Aquarius: "Air", Pisces: "Water"
  };
  return elements[rashi];
}

function getRulingPlanet(rashi) {
  const planets = {
    Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
    Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars",
    Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter"
  };
  return planets[rashi];
}

function getQuality(rashi) {
  const qualities = {
    Aries: "Cardinal", Taurus: "Fixed", Gemini: "Mutable", Cancer: "Cardinal",
    Leo: "Fixed", Virgo: "Mutable", Libra: "Cardinal", Scorpio: "Fixed",
    Sagittarius: "Mutable", Capricorn: "Cardinal", Aquarius: "Fixed", Pisces: "Mutable"
  };
  return qualities[rashi];
}

function getBestTime(rashi) {
  const times = {
    Aries: "Morning", Taurus: "Late Morning", Gemini: "Afternoon",
    Cancer: "Evening", Leo: "Noon", Virgo: "Early Morning",
    Libra: "Sunset", Scorpio: "Night", Sagittarius: "Afternoon",
    Capricorn: "Evening", Aquarius: "Late Night", Pisces: "Early Morning"
  };
  return times[rashi];
}

function getFavorableDirection(rashi) {
  const directions = {
    Aries: "East", Taurus: "South", Gemini: "North", Cancer: "North",
    Leo: "East", Virgo: "West", Libra: "West", Scorpio: "North",
    Sagittarius: "North", Capricorn: "West", Aquarius: "South", Pisces: "North"
  };
  return directions[rashi];
}

function getSymbolForRashi(rashi) {
  const symbols = {
    Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
    Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
    Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓"
  };
  return symbols[rashi];
}

// Update or create horoscope prediction (Astrologer)
export const updateHoroscope = async (req, res) => {
  try {
    const { rashi, period, date } = req.params;
    const { prediction, advice, luckyNumber, luckyColor, compatibility, additionalInfo, categoryPredictions } = req.body;

    console.log(`📝 Updating horoscope for ${rashi} (${period})`);

    // Validate inputs
    const validRashis = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    
    const validPeriods = ['daily', 'weekly', 'monthly', 'yearly'];
    
    if (!validRashis.includes(rashi)) {
      return res.status(400).json({ 
        message: "Invalid rashi",
        validRashis 
      });
    }
    
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ 
        message: "Invalid period",
        validPeriods 
      });
    }

    if (!prediction || prediction.trim().length === 0) {
      return res.status(400).json({ 
        message: "Prediction text cannot be empty" 
      });
    }

    // Handle date parsing
    const predictionDate = new Date(date);
    if (isNaN(predictionDate.getTime())) {
      return res.status(400).json({ 
        message: "Invalid date format" 
      });
    }

    // Calculate date range based on period
    let startDate, endDate;
    
    if (period === 'weekly') {
      startDate = new Date(predictionDate);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
    } else if (period === 'monthly') {
      startDate = new Date(predictionDate.getFullYear(), predictionDate.getMonth(), 1);
      endDate = new Date(predictionDate.getFullYear(), predictionDate.getMonth() + 1, 1);
    } else if (period === 'yearly') {
      startDate = new Date(predictionDate.getFullYear(), 0, 1);
      endDate = new Date(predictionDate.getFullYear() + 1, 0, 1);
    } else {
      // Daily
      startDate = new Date(predictionDate.getFullYear(), predictionDate.getMonth(), predictionDate.getDate());
      endDate = new Date(predictionDate.getFullYear(), predictionDate.getMonth(), predictionDate.getDate() + 1);
    }

    // Find existing horoscope or create new one
    let horoscope = await Horoscope.findOne({
      rashi,
      period,
      date: {
        $gte: startDate,
        $lt: endDate
      }
    });

    if (horoscope) {
      // Update existing
      horoscope.prediction = prediction;
      horoscope.advice = advice || horoscope.advice;
      horoscope.luckyNumber = luckyNumber || horoscope.luckyNumber;
      horoscope.luckyColor = luckyColor || horoscope.luckyColor;
      horoscope.compatibility = compatibility || horoscope.compatibility;
      
      if (additionalInfo) {
        horoscope.additionalInfo = {
          ...horoscope.additionalInfo,
          ...additionalInfo
        };
      }
      
      if (categoryPredictions) {
        horoscope.categoryPredictions = {
          ...horoscope.categoryPredictions,
          ...categoryPredictions
        };
      }
      
      horoscope.updatedAt = new Date();
      await horoscope.save();
      
      console.log(`✅ Horoscope updated for ${rashi} (${period})`);
    } else {
      // Create new
      const newHoroscope = new Horoscope({
        rashi,
        period,
        date: predictionDate,
        prediction,
        advice,
        luckyNumber,
        luckyColor,
        compatibility,
        additionalInfo,
        categoryPredictions
      });
      
      await newHoroscope.save();
      horoscope = newHoroscope;
      
      console.log(`✅ New horoscope created for ${rashi} (${period})`);
    }

    res.json({
      success: true,
      message: "Horoscope updated successfully",
      data: horoscope
    });
  } catch (err) {
    console.error("❌ updateHoroscope error:", err);
    res.status(500).json({ 
      message: "Failed to update horoscope",
      error: err.message 
    });
  }
};

// Get horoscopes for astrologer management
export const getAstrologerHoroscopes = async (req, res) => {
  try {
    const period = req.query.period || null;
    
    const query = {};
    
    if (period) {
      query.period = period;
    }

    const horoscopes = await Horoscope.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: horoscopes
    });
  } catch (err) {
    console.error("❌ getAstrologerHoroscopes error:", err);
    res.status(500).json({ 
      message: "Failed to fetch horoscopes",
      error: err.message 
    });
  }
};

// Delete horoscope
export const deleteHoroscope = async (req, res) => {
  try {
    const { horoscopeId } = req.params;

    const horoscope = await Horoscope.findByIdAndDelete(horoscopeId);

    if (!horoscope) {
      return res.status(404).json({ 
        message: "Horoscope not found" 
      });
    }

    console.log(`✅ Horoscope deleted: ${horoscope.rashi} (${horoscope.period})`);

    res.json({
      success: true,
      message: "Horoscope deleted successfully"
    });
  } catch (err) {
    console.error("❌ deleteHoroscope error:", err);
    res.status(500).json({ 
      message: "Failed to delete horoscope",
      error: err.message 
    });
  }
}