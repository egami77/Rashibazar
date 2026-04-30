// src/pages/MaintenancePage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Shield, Clock, RefreshCw } from 'lucide-react';

const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
      <div className="max-w-xl space-y-12">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative inline-block"
        >
          <div className="h-40 w-40 bg-orange-500/10 rounded-[3rem] flex items-center justify-center border border-orange-500/20 relative z-10">
            <RefreshCw className="h-20 w-20 text-orange-500 animate-spin-slow" />
          </div>
          <div className="absolute -top-4 -right-4 h-16 w-16 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20 animate-bounce">
            <Shield className="h-8 w-8 text-rose-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="text-6xl font-black text-white uppercase italic tracking-tighter">System Offline</h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-sm italic">Celestial alignment in progress</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-6"
        >
          <div className="flex items-center justify-center gap-4 text-orange-400">
            <Clock className="h-5 w-5" />
            <span className="font-black uppercase tracking-widest text-xs">Estimated downtime: 45 minutes</span>
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
          className="text-[10px] text-gray-700 font-black uppercase tracking-[0.5em]"
        >
          Master Root Access Required for Entry
        </motion.p>
      </div>
    </div>
  );
};

export default MaintenancePage;
