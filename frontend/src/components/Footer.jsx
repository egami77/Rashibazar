import React from "react";

const Footer = () => {
  return (
    <footer className="py-6 text-center text-sm text-gray-400 bg-gradient-to-r from-purple-900 to-indigo-900">
      © {new Date().getFullYear()} RashiBazar. All rights reserved.
    </footer>
  );
};

export default Footer;
