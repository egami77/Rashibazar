import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AnnouncementPanel from "./AnnouncementPanel";
import { motion } from "framer-motion";

const Layout = ({ children, style }) => {
  return (
    <div
      className="flex flex-col min-h-screen bg-gradient-to-b from-black via-purple-950 to-black text-white"
      style={style}
    >
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 pt-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-6xl mx-auto mb-6">
          <AnnouncementPanel />
        </div>
        {children}
      </motion.main>
      <Footer />
    </div>
  );
};

export default Layout;
