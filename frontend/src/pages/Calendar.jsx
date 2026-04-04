import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarDays, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  Info,
  Shield
} from "lucide-react";

const NepaliCalendar = () => {
  const [activeTab, setActiveTab] = useState("calendar");
  const [isLoading, setIsLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  // Refs for iframes
  const calendarIframeRef = useRef(null);
  const clockIframeRef = useRef(null);
  const converterIframeRef = useRef(null);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Prevent iframe navigation and add security measures
  useEffect(() => {
    const preventNavigation = (event) => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    };

    const iframes = [calendarIframeRef, clockIframeRef, converterIframeRef];
    
    const handleIframeLoad = (iframeRef) => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          // Prevent all interactions
          iframeRef.current.contentWindow.document.addEventListener('click', preventNavigation, true);
          iframeRef.current.contentWindow.document.addEventListener('contextmenu', preventNavigation, true);
          iframeRef.current.contentWindow.document.addEventListener('keydown', preventNavigation, true);
          
          // Disable links
          const links = iframeRef.current.contentWindow.document.querySelectorAll('a');
          links.forEach(link => {
            link.addEventListener('click', preventNavigation);
            link.style.cursor = 'default';
            link.style.pointerEvents = 'none';
          });
        } catch (error) {
          // Cross-origin restrictions might prevent some operations
          console.log("Security measures applied to iframe");
        }
      }
    };

    // Add load event listeners
    iframes.forEach(ref => {
      if (ref.current) {
        ref.current.addEventListener('load', () => {
          handleIframeLoad(ref);
          setIsLoading(false);
        });
      }
    });

    return () => {
      iframes.forEach(ref => {
        if (ref.current) {
          ref.current.removeEventListener('load', () => handleIframeLoad(ref));
        }
      });
    };
  }, []);

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Reload iframes safely
  const reloadIframe = (iframeRef) => {
    if (iframeRef.current) {
      setIsLoading(true);
      const src = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        iframeRef.current.src = src;
      }, 100);
    }
  };

  // Tab content
  const renderTabContent = () => {
    switch(activeTab) {
      case "calendar":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                <CalendarDays className="inline-block mr-2 w-6 h-6" />
                Monthly Calendar
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => reloadIframe(calendarIframeRef)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg flex items-center gap-2 text-white font-semibold"
              >
                <RefreshCw className="w-4 h-4" />
                Reload
              </motion.button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Calendar - Takes 3 columns */}
              <div className="lg:col-span-3 bg-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 p-1 transform hover:scale-105 transition-transform duration-300">
                <div className="w-full h-[700px] rounded-lg overflow-hidden shadow-2xl shadow-yellow-500/20">
                  <iframe
                    ref={calendarIframeRef}
                    src="https://nepalicalendar.rat32.com/embed.php"
                    className="w-full h-full"
                    title="Nepali Monthly Calendar"
                    sandbox="allow-same-origin allow-scripts allow-popups"
                    loading="lazy"
                    style={{ 
                      pointerEvents: 'auto',
                      opacity: isLoading ? 0.5 : 1,
                      transition: 'opacity 0.3s ease',
                      filter: 'invert(0.85) hue-rotate(280deg) saturate(1.3) brightness(1.1) contrast(1.2)',
                      mixBlendMode: 'lighten',
                      overflow: 'hidden'
                    }}
                  />
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Side Panel with Clock and Date/Time */}
              <div className="lg:col-span-1 flex flex-col gap-3">
                {/* Nepali Clock */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-green-500/30 p-3 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
                >
                  <h3 className="text-sm font-bold mb-2 text-green-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Nepali Clock
                  </h3>
                  <div className="w-full h-[150px] rounded-lg overflow-hidden">
                    <iframe
                      ref={clockIframeRef}
                      src="https://nepalicalendar.rat32.com/clockwidget/nepali-clock-widget-horizontal-blue.php"
                      className="w-full h-full"
                      title="Nepali Clock"
                      sandbox="allow-same-origin allow-scripts"
                      loading="lazy"
                      style={{
                        filter: 'invert(1) hue-rotate(120deg) saturate(1.4) brightness(0.95)',
                        mixBlendMode: 'screen'
                      }}
                    />
                  </div>
                </motion.div>

                {/* Current Date & Time */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-blue-500/30 p-3 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/20 flex-1"
                >
                  <h3 className="text-sm font-bold mb-2 text-blue-400">Date & Time</h3>
                  <div className="space-y-2">
                    <div className="p-2 bg-gradient-to-br from-blue-900/20 to-blue-900/10 rounded-lg border border-blue-500/30">
                      <div className="text-xs text-gray-400">Gregorian</div>
                      <div className="text-xs font-bold text-white truncate">{formatDate(currentDateTime)}</div>
                    </div>
                    <div className="p-2 bg-gradient-to-br from-green-900/20 to-green-900/10 rounded-lg border border-green-500/30">
                      <div className="text-xs text-gray-400">Time (NPT)</div>
                      <div className="text-sm font-bold text-green-400">{formatTime(currentDateTime)}</div>
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
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                <RefreshCw className="inline-block mr-2 w-6 h-6" />
                Date Converter
              </h2>
              <motion.button
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => reloadIframe(converterIframeRef)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg flex items-center gap-2 text-white font-semibold shadow-lg shadow-pink-500/50"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Converter
              </motion.button>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 p-1 transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-pink-500/30 hover:shadow-3xl hover:shadow-pink-500/50 relative group"
            >
              {/* Animated Border Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-purple-500/50 rounded-xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300 pointer-events-none"></div>
              
              <div className="w-full h-[400px] rounded-lg overflow-hidden relative">
                <iframe
                  ref={converterIframeRef}
                  src="https://nepalicalendar.rat32.com/addons/nepali-date-converter.php"
                  className="w-full h-full"
                  title="Nepali Date Converter"
                  sandbox="allow-same-origin allow-scripts"
                  loading="lazy"
                  style={{
                    filter: 'invert(0.9) hue-rotate(340deg) saturate(1.2) brightness(1.15) contrast(1.1) drop-shadow(0 0 20px rgba(236, 72, 153, 0.3))',
                    mixBlendMode: 'overlay'
                  }}
                />
              </div>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-6 bg-gradient-to-br from-blue-900/30 to-blue-900/10 rounded-xl border-2 border-blue-500/40 hover:border-blue-400/60 transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/30 cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/40 transition-all">
                    <CalendarDays className="w-5 h-5 text-blue-400" />
                  </div>
                  <h4 className="font-bold text-blue-300 text-lg">BS to AD</h4>
                </div>
                <p className="text-sm text-gray-300">Convert Nepali Bikram Sambat dates to Gregorian Calendar dates seamlessly</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-6 bg-gradient-to-br from-purple-900/30 to-purple-900/10 rounded-xl border-2 border-purple-500/40 hover:border-purple-400/60 transition-all shadow-lg shadow-purple-500/10 hover:shadow-purple-500/30 cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/40 transition-all">
                    <RefreshCw className="w-5 h-5 text-purple-400" />
                  </div>
                  <h4 className="font-bold text-purple-300 text-lg">AD to BS</h4>
                </div>
                <p className="text-sm text-gray-300">Convert Gregorian Calendar dates to Nepali Bikram Sambat with precision</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-6 bg-gradient-to-br from-pink-900/30 to-pink-900/10 rounded-xl border-2 border-pink-500/40 hover:border-pink-400/60 transition-all shadow-lg shadow-pink-500/10 hover:shadow-pink-500/30 cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-pink-500/20 rounded-lg group-hover:bg-pink-500/40 transition-all">
                    <Clock className="w-5 h-5 text-pink-400" />
                  </div>
                  <h4 className="font-bold text-pink-300 text-lg">Today's Date</h4>
                </div>
                <p className="text-sm text-gray-300">See today's date in both Nepali and Gregorian calendar systems instantly</p>
              </motion.div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-900 to-black text-white pt-24 px-4 md:px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 bg-clip-text text-transparent">
            Nepali Calendar & Date Tools
          </h1>
          <p className="text-gray-300">Complete Nepali calendar system with real-time updates and date conversion</p>
        </div>

        {/* Live Date Display */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-blue-500/30 p-4">
            <div className="text-sm text-gray-400 mb-2">Current Date</div>
            <div className="text-lg font-bold text-white">{formatDate(currentDateTime)}</div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-green-500/30 p-4">
            <div className="text-sm text-gray-400 mb-2">Nepal Time</div>
            <div className="text-lg font-bold text-green-400">{formatTime(currentDateTime)} NPT</div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 p-4">
            <div className="text-sm text-gray-400 mb-2">Timezone</div>
            <div className="text-lg font-bold text-purple-300">UTC+5:45</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-purple-500/30 pb-4">
          {[
            { id: "calendar", label: "Monthly Calendar", icon: CalendarDays },
            { id: "converter", label: "Date Converter", icon: RefreshCw }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-black'
                    : 'bg-black/30 border border-purple-500/30 text-gray-300 hover:bg-purple-900/30'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
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

        {/* Decorative Elements */}
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full filter blur-3xl pointer-events-none opacity-50"></div>
        <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-br from-yellow-500/5 to-purple-500/5 rounded-full filter blur-3xl pointer-events-none opacity-40"></div>
      </div>
    </div>
  );
};

export default NepaliCalendar;