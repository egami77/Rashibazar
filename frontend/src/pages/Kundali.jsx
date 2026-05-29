// src/pages/Kundali.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, Trash2, Home, RefreshCw,
  Sparkles, Star, Target, Info, Shield, Zap, MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateKundali, getKundaliHistory, deleteKundali } from '../services/kundali.js';
import { getCurrentUser } from '../services/auth.js';
import { BirthDetailsForm } from '../components/VedicKundali/BirthDetailsForm.jsx';
import { ModernKundaliReport } from '../components/VedicKundali/ModernKundaliReport.jsx';
import Layout from "../components/Layout";

const Kundali = () => {
  const [activeTab, setActiveTab] = useState('form');
  const [kundaliHistory, setKundaliHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kundaliData, setKundaliData] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, kundaliId: null });

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
      if (response.data) {
        setKundaliHistory(response.data);
      }
    } catch (error) {
      console.error("Error loading kundali history:", error);
    }
  };

  const handleFormSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      console.log("Sending request data:", data);
      const response = await generateKundali(data);
      
      if (response.data.success) {
        setKundaliData(response.data.data);
        setActiveTab('results');
        
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

  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, kundaliId: id });
  };

  const handleConfirmDelete = async () => {
    const { kundaliId } = deleteModal;
    try {
      await deleteKundali(kundaliId);
      setKundaliHistory(prev => prev.filter(k => k._id !== kundaliId));
      setDeleteModal({ isOpen: false, kundaliId: null });
    } catch (error) {
      console.error("Error deleting kundali:", error);
    }
  };

  const handleSelectHistory = (historyItem) => {
    setKundaliData(historyItem);
    setActiveTab('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout>
      <div className="w-full py-8 px-4 relative overflow-hidden">
      {/* Mystical Background elements */}
      {/* <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]"></div>
      </div> */}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-pink-400 text-sm font-semibold mb-4"
          >
            {/* <Sparkles className="h-4 w-4" /> */}
             Accurate Vedic Calculations
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent mb-4 tracking-wide"
          >
            Vedic Janma Kundali
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-purple-200 text-lg md:text-xl max-w-2xl mx-auto"
          >
            Discover your destiny through the precise alignment of stars and planets at the moment of your birth.
          </motion.p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-10">
          <div className="bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 flex gap-2">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${activeTab === 'form' ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black shadow-lg hover:scale-105' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
            >
              {/* <RefreshCw className="h-4 w-4" />  */}
              New Kundali
            </button>
            <button
              onClick={() => setActiveTab('results')}
              disabled={!kundaliData}
              className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${activeTab === 'results' ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black shadow-lg hover:scale-105' : 'text-gray-300 hover:text-white hover:bg-white/10'} ${!kundaliData ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {/* <Star className="h-4 w-4" /> */}
               View Result
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black shadow-lg hover:scale-105' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
            >
              {/* <History className="h-4 w-4" /> */}
               History
            </button>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-3xl mx-auto mb-8"
            >
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-400 flex items-center gap-3">
                <Info className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Tabs */}
        <div className="min-h-[600px]">
          {activeTab === 'form' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <BirthDetailsForm onSubmit={handleFormSubmit} loading={loading} />
            </motion.div>
          )}

          {activeTab === 'results' && kundaliData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <ModernKundaliReport kundaliData={kundaliData} />
              
              <div className="flex flex-col items-center py-12 border-t border-white/5 mt-12">
                <div className="bg-white/10 p-8 rounded-xl border border-purple-400/30 max-w-2xl text-center backdrop-blur-md">
                  {/* <div className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30"> */}
                    {/* <MessageSquare className="h-8 w-8 text-black" /> */}
                  {/* </div> */}
                  <h3 className="text-3xl font-bold text-yellow-300 mb-4">Need Deeper Insights?</h3>
                  <p className="text-gray-400 mb-8 leading-relaxed">
                    While our automated reports are highly accurate, a personal consultation with a master astrologer can provide specific remedies and guidance tailored for your life path.
                  </p>
                  <Link 
                    to="/booking"
                    className="inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-full font-semibold text-black hover:scale-105 transition-all shadow-lg group"
                  >
                    Consult with Astrologer
                    {/* <Star className="h-5 w-5 group-hover:rotate-90 transition-transform duration-500" /> */}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto"
            >
              {kundaliHistory.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {kundaliHistory.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => handleSelectHistory(item)}
                      className="group bg-black/40 backdrop-blur-sm border border-purple-600/30 p-6 rounded-xl hover:border-purple-500 transition-all duration-300 cursor-pointer relative hover:shadow-[0_20px_25px_-5px_rgba(168,85,247,0.3)]"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-500/20 p-2 rounded-lg">
                          <Star className="h-5 w-5 text-yellow-400" />
                        </div>
                        <button
                          onClick={(e) => handleDeleteHistory(item._id, e)}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <h3 className="text-xl font-semibold text-pink-400 mb-2">{item.name}</h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-400">
                        <p>Born: {new Date(item.birthDate).toLocaleDateString()}</p>
                        <p>Place: {item.birthPlace}</p>
                        <p className="text-xs text-gray-600 mt-4">Created: {new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-black/40 backdrop-blur-sm rounded-xl border border-purple-600/30">
                  <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <History className="h-10 w-10 text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-400 mb-2">No History Yet</h3>
                  <p className="text-gray-500">Your generated kundalis will appear here.</p>
                  <button
                    onClick={() => setActiveTab('form')}
                    className="mt-8 px-8 py-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black font-semibold rounded-full hover:scale-105 transition-all shadow-lg"
                  >
                    Generate Your First Kundali
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Informational Sections */}
        {activeTab === 'form' && (
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            <div className="bg-black/40 backdrop-blur-sm border border-purple-600/30 rounded-xl p-8 hover:border-purple-500 transition-all duration-300">
              <div className="text-4xl mb-4"></div>
              <h3 className="text-xl font-semibold text-pink-400 mb-3">High Accuracy</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                We use advanced astronomical engines to calculate precise planetary positions based on Lahiri Ayanamsa.
              </p>
            </div>
            <div className="bg-black/40 backdrop-blur-sm border border-purple-600/30 rounded-xl p-8 hover:border-purple-500 transition-all duration-300">
              <div className="text-4xl mb-4"></div>
              <h3 className="text-xl font-semibold text-pink-400 mb-3">Traditional Logic</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Our system incorporates authentic Vedic principles, including divisional charts and Vimshottari dasha.
              </p>
            </div>
            <div className="bg-black/40 backdrop-blur-sm border border-purple-600/30 rounded-xl p-8 hover:border-purple-500 transition-all duration-300">
              <div className="text-4xl mb-4"></div>
              <h3 className="text-xl font-semibold text-pink-400 mb-3">Traditional Report</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Generate a complete birth report with traditional Nepali Sankalpa prose and professional charts.
              </p>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black border-2 border-red-500/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Delete Kundali?</h2>
              <p className="text-gray-400">This action cannot be undone. Are you sure you want to permanently delete this kundali?</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, kundaliId: null })}
                className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-gray-300 hover:bg-gray-700 transition-all font-semibold"
              >
                Keep Kundali
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Kundali;