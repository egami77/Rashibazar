import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Sparkles } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* 🌟 Logo */}
        <Link
          to="/home"
          className="flex items-center gap-2 text-2xl font-bold tracking-wide text-purple-700 hover:text-purple-900 transition"
        >
          <Sparkles className="text-yellow-500" />
          RashiBazar
        </Link>

        {/* 🔗 Navigation Links */}
        <div className="hidden md:flex gap-8 text-[16px] font-medium text-gray-700">
          <Link to="/home" className="hover:text-purple-600 transition">Home</Link>
          <Link to="/kundali" className="hover:text-purple-600 transition">Kundali</Link>
          <Link to="/compatibility" className="hover:text-purple-600 transition">Compatibility</Link>
          <Link to="/horoscope" className="hover:text-purple-600 transition">Horoscope</Link>
          <Link to="/calendar" className="hover:text-purple-600 transition">Calendar</Link>
          <Link to="/booking" className="hover:text-purple-600 transition">Booking</Link>
        </div>

        {/* 👤 Profile + Logout */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-purple-300 text-purple-700 hover:bg-purple-50 transition"
          >
            <User size={18} />
            Profile
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:scale-105 transition-transform"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
