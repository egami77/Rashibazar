// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  getCurrentUser,
  getCurrentAstrologer,
  getCurrentRole,
  logout,
} from "../services/auth";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [astrologer, setAstrologer] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
    setAstrologer(getCurrentAstrologer());
    setRole(getCurrentRole());
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Hide navbar on auth pages
  const noNavbarRoutes = ["/", "/login", "/signup", "/reset-password"];
  if (noNavbarRoutes.includes(location.pathname)) return null;

  //
  // =========================
  // NAV LINKS
  // =========================
  const commonLinks = [
    { name: "Home", path: "/home" },
    { name: "Kundali", path: "/kundali" },
    { name: "Horoscope", path: "/horoscope" },
    { name: "Compatibility", path: "/compatibility" },
    { name: "Calendar", path: "/calendar" },
  ];

  const userLinks = [
    { name: "Book Session", path: "/booking" },
    { name: "My Bookings", path: "/my-bookings" },
  ];

  const astrologerLinks = [
    { name: "Dashboard", path: "/astrologer/dashboard" },
  ];

  const adminLinks = [
    { name: "Dashboard", path: "/admin/dashboard" },
  ];

  //
  // =========================
  // RENDER LINKS
  // =========================
  const renderLinks = () => {
    let links = [...commonLinks];

    if (role === "user") links = [...links, ...userLinks];
    if (role === "astrologer") links = [...links, ...astrologerLinks];
    if (role === "admin") links = [...links, ...adminLinks];

    // ✅ Add Profile for ALL logged-in roles
    if (role) {
      links.push({ name: "Profile", path: "/profile" });
    }

    return links.map((link) => (
      <Link
        key={link.path}
        to={link.path}
        onClick={() => setIsOpen(false)}
        className={`px-3 py-2 rounded-md text-sm font-medium transition ${
          location.pathname === link.path
            ? "text-yellow-400 bg-purple-900/50"
            : "text-gray-300 hover:text-yellow-400 hover:bg-purple-900/30"
        }`}
      >
        {link.name}
      </Link>
    ));
  };

  return (
    <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-lg z-50 border-b border-purple-500/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* LOGO */}
          <Link
            to={
              role === "admin"
                ? "/admin/dashboard"
                : role === "astrologer"
                ? "/astrologer/dashboard"
                : "/home"
            }
            className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 text-transparent bg-clip-text"
          >
            RashiBazar
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center space-x-4">
            {renderLinks()}

            {(user || astrologer) ? (
              <div className="flex items-center space-x-3 ml-4">
                {/* USER NAME */}
                <span className="text-sm text-gray-300">
                  {user?.name || astrologer?.name || "User"}
                  {role === "admin" && (
                    <span className="ml-1 text-xs text-yellow-400">(Admin)</span>
                  )}
                </span>

                {/* LOGOUT */}
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-2 bg-purple-600 text-white rounded"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-2 bg-yellow-400 text-black rounded"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* MOBILE BUTTON */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isOpen && (
          <div className="md:hidden flex flex-col space-y-2 pb-4">
            <div className="sm:hidden px-3 py-2">
               {/* Move the translate element here using JS or just let user rotate/resize. Wait, duplicate IDs are bad. I will just rely on the global one. */}
            </div>
          {renderLinks()}

            {(user || astrologer) ? (
              <button
                onClick={handleLogout}
                className="text-left text-red-400 px-3 py-2"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
                <Link to="/signup" onClick={() => setIsOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}