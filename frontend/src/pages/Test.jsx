// src/pages/Test.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Test = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black text-white p-8 pt-24">
      <div className="max-w-2xl mx-auto bg-black/40 backdrop-blur-sm border border-purple-600/30 rounded-xl p-8 shadow-2xl">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 mb-4 tracking-wide">Test Page</h1>
        <p className="mb-8 text-purple-200">Current Path: <span className="font-mono text-yellow-300">{window.location.pathname}</span></p>
        <div className="space-y-3">
          <div><Link to="/" className="text-pink-400 hover:text-yellow-300 transition-colors">Go to Landing (/)</Link></div>
          <div><Link to="/home" className="text-pink-400 hover:text-yellow-300 transition-colors">Go to Home (/home)</Link></div>
          <div><Link to="/login" className="text-pink-400 hover:text-yellow-300 transition-colors">Go to Login (/login)</Link></div>
          <div><Link to="/signup" className="text-pink-400 hover:text-yellow-300 transition-colors">Go to Signup (/signup)</Link></div>
          <div><Link to="/kundali" className="text-pink-400 hover:text-yellow-300 transition-colors">Go to Kundali (/kundali)</Link></div>
        </div>
      </div>
    </div>
  );
};

export default Test;