import React, { useState, useEffect } from "react";
import { Megaphone, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { getAnnouncements } from "../services/announcement";
import { getCurrentRole } from "../services/auth";

const AnnouncementPanel = ({ className = "" }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("dismissedAnnouncements") || "[]");
    } catch {
      return [];
    }
  });

  const role = getCurrentRole();

  useEffect(() => {
    if (!role || role === "admin") {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const { data } = await getAnnouncements();
        setAnnouncements(data);
      } catch (error) {
        console.error("Failed to load announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [role]);

  const dismiss = (id) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    localStorage.setItem("dismissedAnnouncements", JSON.stringify(updated));
  };

  const visible = announcements.filter((a) => !dismissedIds.includes(a._id));

  if (loading || !visible.length || role === "admin") return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {visible.map((item) => (
        <div
          key={item._id}
          className="relative bg-gradient-to-r from-emerald-500/10 via-purple-500/10 to-pink-500/10 border border-emerald-500/30 rounded-xl p-5 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={() => dismiss(item._id)}
            className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-4 pr-6">
            <div className="h-10 w-10 shrink-0 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30">
              <Megaphone className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">
                Platform Broadcast
              </p>
              <h4 className="text-white font-bold text-sm mb-1">{item.title}</h4>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {item.message}
              </p>
              <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">
                {format(parseISO(item.createdAt), "MMM dd, yyyy · h:mm a")}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnnouncementPanel;
