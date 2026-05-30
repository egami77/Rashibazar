// src/services/horoscope.js
import API from "./api";

// Get horoscope for specific rashi and period
export const getHoroscope = async (rashi, period, date = null) => {
  console.log(` Fetching ${period} horoscope for ${rashi}`);
  
  try {
    const params = date ? { date } : {};
    const response = await API.get(`/horoscope/${rashi}/${period}`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching horoscope:", error);
    throw error;
  }
};

// Get all rashis with detailed information
export const getAllRashis = async () => {
  try {
    const response = await API.get('/horoscope/rashis');
    return response.data;
  } catch (error) {
    console.error("Error fetching rashis:", error);
    throw error;
  }
};

// Get today's horoscope for all rashis
export const getDailyHoroscopeForAll = async () => {
  try {
    const response = await API.get('/horoscope/daily/all');
    return response.data;
  } catch (error) {
    console.error("Error fetching daily horoscopes:", error);
    throw error;
  }
};

// Update horoscope (for astrologers)
export const updateHoroscope = async (rashi, period, date, horoscopeData) => {
  console.log(` Updating horoscope for ${rashi} (${period})`);
  
  try {
    const response = await API.put(`/horoscope/${rashi}/${period}/${date}`, horoscopeData);
    return response.data;
  } catch (error) {
    console.error("Error updating horoscope:", error);
    throw error;
  }
};

// Get horoscopes for astrologer management
export const getAstrologerHoroscopes = async (period = null) => {
  console.log(` Fetching astrologer horoscopes${period ? ` (${period})` : ''}`);
  
  try {
    const params = period ? { period } : {};
    const response = await API.get('/horoscope/astrologer/all', { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching astrologer horoscopes:", error);
    throw error;
  }
};

// Delete horoscope (for astrologers)
export const deleteHoroscope = async (horoscopeId) => {
  console.log(` Deleting horoscope: ${horoscopeId}`);
  
  try {
    const response = await API.delete(`/horoscope/${horoscopeId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting horoscope:", error);
    throw error;
  }
};

// Get today's date in readable format - ALWAYS RETURNS STRING
export const getFormattedDate = (period, date = null) => {
  const now = date ? new Date(date) : new Date();
  
  switch(period) {
    case 'weekly':
      const startOfWeek = new Date(now);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      
      // Return string, not object
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      
    case 'monthly':
      return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
    case 'yearly':
      return now.getFullYear().toString();
      
    default: // daily
      return now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
  }
};

// Get period label
export const getPeriodLabel = (period) => {
  const labels = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly'
  };
  return labels[period] || period;
};