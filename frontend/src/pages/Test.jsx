// src/pages/Test.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Test = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Test Page</h1>
      <p className="mb-4">Current Path: {window.location.pathname}</p>
      <div className="space-y-2">
        <div><Link to="/" className="text-blue-400 hover:underline">Go to Landing (/)</Link></div>
        <div><Link to="/home" className="text-blue-400 hover:underline">Go to Home (/home)</Link></div>
        <div><Link to="/login" className="text-blue-400 hover:underline">Go to Login (/login)</Link></div>
        <div><Link to="/signup" className="text-blue-400 hover:underline">Go to Signup (/signup)</Link></div>
        <div><Link to="/kundali" className="text-blue-400 hover:underline">Go to Kundali (/kundali)</Link></div>
      </div>
    </div>
  );
};

export default Test;