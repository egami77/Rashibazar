// src/pages/MaintenancePage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Shield, Clock, RefreshCw } from 'lucide-react';

const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black flex items-center justify-center p-6 text-center">
      <div className="max-w-xl space-y-12">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative inline-block"
        >
          <div className="h-40 w-40 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/30 relative z-10 shadow-lg shadow-purple-500/20">
            <RefreshCw className="h-20 w-20 text-purple-400 animate-spin-slow" />
          </div>
          <div className="absolute -top-4 -right-4 h-16 w-16 bg-pink-500/10 rounded-full flex items-center justify-center border border-pink-500/30 animate-bounce">
            <Shield className="h-8 w-8 text-pink-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent tracking-wide">System Offline</h1>
          <p className="text-purple-200 text-lg">Celestial alignment in progress...</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-black/40 backdrop-blur-sm border border-purple-600/30 rounded-xl p-10 space-y-6 shadow-2xl"
        >
          <div className="flex items-center justify-center gap-4 text-yellow-400">
            <Clock className="h-5 w-5" />
            <span className="font-semibold text-sm">Estimated downtime: 45 minutes</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            The RashiBazar core is currently undergoing a scheduled kernel optimization to improve calculation accuracy. 
            Public nodes are temporarily restricted. Please check back shortly.
          </p>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1 }}
          className="text-xs text-gray-500 tracking-widest uppercase"
        >
          Master Root Access Required for Entry
        </motion.p>
      </div>
    </div>
  );
};

export default MaintenancePage;
