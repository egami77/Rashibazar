import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, RefreshCw } from "lucide-react";
import Layout from "../components/Layout";

const NepaliCalendar = () => {
  const [activeTab, setActiveTab] = useState("calendar");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const renderTabContent = () => {
    switch (activeTab) {
      case "calendar":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {/* <CalendarDays className="w-6 h-6" /> */}
              Monthly Calendar
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

              {/* ── Month widget — 3 columns ── */}
              <div className="lg:col-span-3 bg-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 overflow-hidden">
                <iframe
                  src="/nepali-month-widget.html"
                  title="Nepali Monthly Calendar"
                  style={{
                    width: "100%",
                    height: "950px",
                    border: "none",
                    display: "block",
                  }}
                  // scrolling="auto"
                />
              </div>

              {/* ── Side panel — 1 column ── */}
              <div className="lg:col-span-1 flex flex-col gap-3">

                {/* Day widget */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-600/30 hover:border-purple-500 transition-all duration-300 shadow-lg shadow-purple-500/10 overflow-hidden"
                >
                  <div className="px-3 pt-3 pb-1">
                    <h3 className="text-sm font-bold text-pink-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Today (Nepali)
                    </h3>
                  </div>
                  <iframe
                    src="/nepali-day-widget.html"
                    title="Today Nepali Date"
                    style={{
                      width: "100%",
                      height: "350px",
                      border: "none",
                      display: "block",
                    }}
                    scrolling="no"
                  />
                </motion.div>

                {/* Live date & time */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-600/30 p-3 hover:border-purple-500 transition-all duration-300 shadow-lg flex-1"
                >
                  <h3 className="text-sm font-bold mb-2 text-purple-300">
                    Date & Time
                  </h3>
                  <div className="space-y-2">
                    <div className="p-2 bg-black/40 border border-purple-600/20 rounded-lg">
                      <div className="text-xs text-gray-400">Gregorian</div>
                      <div className="text-xs font-bold text-white truncate">
                        {formatDate(currentDateTime)}
                      </div>
                    </div>
                    <div className="p-2 bg-black/40 border border-pink-500/20 rounded-lg">
                      <div className="text-xs text-gray-400">Time (NPT)</div>
                      <div className="text-sm font-bold text-pink-400">
                        {formatTime(currentDateTime)}
                      </div>
                    </div>
                  </div>
                </motion.div>

              </div>
            </div>
          </div>
        );

      case "converter":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {/* <RefreshCw className="w-6 h-6" /> */}
              Date Converter
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: CalendarDays,
                  title: "BS to AD",
                  desc: "Convert Nepali Bikram Sambat dates to Gregorian Calendar dates seamlessly",
                  color: "blue",
                },
                {
                  icon: RefreshCw,
                  title: "AD to BS",
                  desc: "Convert Gregorian Calendar dates to Nepali Bikram Sambat with precision",
                  color: "purple",
                },
                {
                  icon: Clock,
                  title: "Today's Date",
                  desc: "See today's date in both Nepali and Gregorian calendar systems instantly",
                  color: "pink",
                },
              ].map(({ icon: Icon, title, desc, color }) => (
                <motion.div
                  key={title}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`p-6 bg-gradient-to-br from-${color}-900/30 to-${color}-900/10 rounded-xl border-2 border-${color}-500/40 hover:border-${color}-400/60 transition-all shadow-lg cursor-pointer group`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 bg-${color}-500/20 rounded-lg group-hover:bg-${color}-500/40 transition-all`}>
                      <Icon className={`w-5 h-5 text-${color}-400`} />
                    </div>
                    <h4 className={`font-bold text-${color}-300 text-lg`}>{title}</h4>
                  </div>
                  <p className="text-sm text-gray-300">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto w-full py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent tracking-wide">
            Nepali Calendar & Date Tools
          </h1>
          <p className="text-gray-300">
            Complete Nepali calendar system with real-time updates and date conversion
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Current Date", value: formatDate(currentDateTime), color: "text-white" },
            { label: "Nepal Time",   value: `${formatTime(currentDateTime)} NPT`, color: "text-pink-400" },
            { label: "Timezone",     value: "UTC+5:45", color: "text-purple-300" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-600/30 p-4 hover:border-purple-500 transition-all"
            >
              <div className="text-sm text-gray-400 mb-2">{label}</div>
              <div className={`text-lg font-bold ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-purple-500/30 pb-4">
          {[
            { id: "calendar",  label: "Monthly Calendar", icon: CalendarDays },
            { id: "converter", label: "Date Converter",   icon: RefreshCw },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${
                activeTab === id
                  ? "bg-gradient-to-r from-yellow-400 to-pink-500 text-black shadow-lg"
                  : "bg-black/40 border border-purple-600/30 text-gray-300 hover:bg-purple-900/30 hover:border-purple-500"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>

        {/* Decorative blobs */}
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full filter blur-3xl pointer-events-none opacity-50" />
        <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-br from-yellow-500/5 to-purple-500/5 rounded-full filter blur-3xl pointer-events-none opacity-40" />
      </div>
    </Layout>
  );
};

export default NepaliCalendar;