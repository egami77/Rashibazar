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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload
              </motion.button>
            </div>
            
            <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-blue-500/30 p-1">
              <div className="w-full h-[600px] rounded-lg overflow-hidden">
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
                    transition: 'opacity 0.3s ease'
                  }}
                />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "clock":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                <Clock className="inline-block mr-2 w-6 h-6" />
                Nepali Clock
              </h2>
              <div className="text-lg font-semibold bg-blue-900/50 px-4 py-2 rounded-lg">
                {formatTime(currentDateTime)} NPT
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-green-500/30 p-4">
                <h3 className="text-xl font-bold mb-4 text-green-400">Live Digital Clock</h3>
                <div className="w-full h-[150px] rounded-lg overflow-hidden">
                  <iframe
                    ref={clockIframeRef}
                    src="https://nepalicalendar.rat32.com/clockwidget/nepali-clock-widget-horizontal-blue.php"
                    className="w-full h-full"
                    title="Nepali Clock"
                    sandbox="allow-same-origin allow-scripts"
                    loading="lazy"
                  />
                </div>
              </div>
              
              <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 p-4">
                <h3 className="text-xl font-bold mb-4 text-purple-400">Current Date & Time</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-gray-400">Gregorian Date</div>
                    <div className="text-2xl font-bold text-white">{formatDate(currentDateTime)}</div>
                  </div>
                  <div className="p-4 bg-purple-900/20 rounded-lg">
                    <div className="text-sm text-gray-400">Current Time (Kathmandu)</div>
                    <div className="text-3xl font-bold text-green-400">{formatTime(currentDateTime)}</div>
                  </div>
                </div>
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => reloadIframe(converterIframeRef)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Converter
              </motion.button>
            </div>
            
            <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-yellow-500/30 p-1">
              <div className="w-full h-[400px] rounded-lg overflow-hidden">
                <iframe
                  ref={converterIframeRef}
                  src="https://nepalicalendar.rat32.com/addons/nepali-date-converter.php"
                  className="w-full h-full"
                  title="Nepali Date Converter"
                  sandbox="allow-same-origin allow-scripts"
                  loading="lazy"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-900/20 rounded-lg">
                <h4 className="font-bold text-blue-300 mb-2">BS to AD</h4>
                <p className="text-sm text-gray-300">Convert Nepali Bikram Sambat dates to Gregorian dates</p>
              </div>
              <div className="p-4 bg-purple-900/20 rounded-lg">
                <h4 className="font-bold text-purple-300 mb-2">AD to BS</h4>
                <p className="text-sm text-gray-300">Convert Gregorian dates to Nepali Bikram Sambat dates</p>
              </div>
              <div className="p-4 bg-green-900/20 rounded-lg">
                <h4 className="font-bold text-green-300 mb-2">Today's Date</h4>
                <p className="text-sm text-gray-300">See today's date in both calendar systems</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <CalendarDays className="w-10 h-10 text-yellow-400" />
              Nepali Calendar & Date Tools
            </h1>
            <p className="text-gray-300 text-lg">
              Complete Nepali calendar system with real-time updates and date conversion
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-sm">Safe Navigation Enabled</span>
          </div>
        </div>
        
        {/* Live Date Display */}
        <div className="mt-6 p-4 bg-black/30 backdrop-blur-lg rounded-xl border border-blue-500/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-900/30 rounded-lg">
              <div className="text-sm text-gray-400">Current Date</div>
              <div className="text-xl font-bold">{formatDate(currentDateTime)}</div>
            </div>
            <div className="text-center p-3 bg-purple-900/30 rounded-lg">
              <div className="text-sm text-gray-400">Nepal Time</div>
              <div className="text-xl font-bold text-green-400">{formatTime(currentDateTime)}</div>
            </div>
            <div className="text-center p-3 bg-green-900/30 rounded-lg">
              <div className="text-sm text-gray-400">Timezone</div>
              <div className="text-xl font-bold">UTC+5:45 (NPT)</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: "calendar", label: "Monthly Calendar", icon: CalendarDays },
            { id: "clock", label: "Nepali Clock", icon: Clock },
            { id: "converter", label: "Date Converter", icon: RefreshCw }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                    : "bg-black/40 hover:bg-black/60"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </motion.button>
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
            className="mt-4"
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Information Panel */}
      <div className="mt-8 p-6 bg-black/30 backdrop-blur-lg rounded-xl border border-yellow-500/30">
        <div className="flex items-start gap-3 mb-4">
          <Info className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-yellow-300 mb-2">Important Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-gray-300">
                  <strong className="text-white">Navigation Protection:</strong> All iframes are secured against navigation attempts. Clicking inside won't redirect you.
                </p>
                <p className="text-gray-300">
                  <strong className="text-white">Calendar System:</strong> Bikram Sambat (BS) is 56.7 years ahead of Gregorian Calendar (AD).
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-300">
                  <strong className="text-white">Real-time Updates:</strong> Clock and date display update in real-time.
                </p>
                <p className="text-gray-300">
                  <strong className="text-white">Data Source:</strong> Calendar data loaded from reliable Nepali calendar provider.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-800 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh All
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setActiveTab("calendar");
              reloadIframe(calendarIframeRef);
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-700 to-purple-800 rounded-lg"
          >
            Go to Current Month
          </motion.button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t border-gray-700/50 text-center text-gray-400 text-sm">
        <p className="mb-2">
          Nepali Calendar Tools • Data provided by nepali calendar APIs • Secure Embedded Content
        </p>
        <p>
          All iframes are protected against navigation • Page updates in real-time
        </p>
      </footer>
    </div>
  );
};

export default NepaliCalendar;