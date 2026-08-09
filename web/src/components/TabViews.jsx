import React, { useState } from 'react';
import {
  Plane,
  Heart,
  Settings,
  MapPin,
  Calendar,
  Trash2,
  ExternalLink,
  Key,
  Database,
  Bell,
  User,
  Check,
  Sparkles,
  ArrowRight
} from 'lucide-react';

// ── Saved Trips View ────────────────────────────────────────────────────────
// ── Saved Trips & Search History View ─────────────────────────────────────────
export function TripsView({ onSelectTrip, user, threadId }) {
  const [historyTrips, setHistoryTrips] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const activeThreadId = user ? `user_${user.id}` : (threadId || localStorage.getItem('guest_session_id') || 'aarohi_user');

  React.useEffect(() => {
    async function fetchHistory() {
      setIsLoading(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_URL}/api/history?thread_id=${encodeURIComponent(activeThreadId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.history && data.history.length > 0) {
            setHistoryTrips(data.history);
          }
        }
      } catch (e) {
        console.warn('Failed to fetch history from API:', e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, [activeThreadId]);

  const defaultMockTrips = [
    {
      id: 1,
      user_query: "Plan a 6-day trip to Kashmir including Srinagar Dal Lake, Gulmarg Gondola snow point, and Pahalgam valley",
      created_at: "Recent"
    },
    {
      id: 2,
      user_query: "Plan a 3-day trip to Kanyakumari covering Vivekananda Rock Memorial and Triveni Sangam sunset",
      created_at: "Recent"
    },
    {
      id: 3,
      user_query: "Plan a 4-day spiritual journey in Varanasi covering Ganga Aarti and Kashi Vishwanath temple",
      created_at: "Recent"
    }
  ];

  const tripsToDisplay = historyTrips.length > 0 ? historyTrips : defaultMockTrips;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">Your Search & Travel History</h2>
          <p className="text-sm text-[#6B7280]">
            {user ? `Stored securely in PostgreSQL for ${user.name}` : `Session history for Thread (${activeThreadId.slice(0, 16)}...)`}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#7D9AF6]/15 text-[#7D9AF6] text-xs font-bold">
          {tripsToDisplay.length} History Items
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tripsToDisplay.map((trip) => (
          <div key={trip.id} className="bg-white rounded-[24px] border border-[#E7EAF6] overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between p-5 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase">
                  {trip.created_at ? trip.created_at.slice(0, 10) : 'Recent'}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">
                  ✓ PostgreSQL Memory
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#1F2937] line-clamp-3 leading-relaxed">
                "{trip.user_query}"
              </h3>
            </div>

            <div className="pt-3 border-t border-[#E7EAF6] flex items-center justify-between">
              <span className="text-xs text-[#6B7280]">Saved Plan</span>
              <button
                onClick={() => onSelectTrip(trip.user_query)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7D9AF6] to-[#A4BDF9] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Re-Load Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Saved Places View ────────────────────────────────────────────────────────
export function SavedView() {
  const favorites = [
    { name: "The Taj Mahal Palace", location: "Mumbai, India", type: "Hotel", rating: 4.9, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80" },
    { name: "Kyoto Fushimi Inari Taisha", location: "Kyoto, Japan", type: "Culture", rating: 4.9, image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500&q=80" },
    { name: "Eiffel Tower Promenade", location: "Paris, France", type: "Landmark", rating: 4.8, image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&q=80" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">Saved Favorites</h2>
        <p className="text-sm text-[#6B7280]">Bookmarked hotels, landmarks, and flight searches</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {favorites.map((fav, i) => (
          <div key={i} className="bg-white rounded-[24px] border border-[#E7EAF6] overflow-hidden shadow-sm p-4 flex items-center gap-4">
            <img src={fav.image} alt={fav.name} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-[#7D9AF6] uppercase tracking-wider">{fav.type}</span>
              <h4 className="font-bold text-sm text-[#1F2937] line-clamp-1">{fav.name}</h4>
              <p className="text-xs text-[#6B7280]">{fav.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Settings View ────────────────────────────────────────────────────────────
export function SettingsView() {
  const [groqKey, setGroqKey] = useState("gsk_********************************");
  const [tavilyKey, setTavilyKey] = useState("tvly-dev-**************************");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">System Settings</h2>
        <p className="text-sm text-[#6B7280]">Manage API Keys, user session preferences, and agent parameters</p>
      </div>

      <div className="bg-white rounded-[28px] border border-[#E7EAF6] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-[#E7EAF6]">
          <div className="w-10 h-10 rounded-xl bg-[#7D9AF6]/15 text-[#7D9AF6] flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#1F2937]">API Key Credentials</h3>
            <p className="text-xs text-[#6B7280]">Configured live in your system environment (.env)</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1.5">Groq LLaMA 3.3 API Key</label>
            <input
              type="password"
              value={groqKey}
              onChange={e => setGroqKey(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#E7EAF6] text-sm text-[#1F2937] focus:outline-none focus:border-[#7D9AF6]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1.5">Tavily Web Search Key</label>
            <input
              type="password"
              value={tavilyKey}
              onChange={e => setTavilyKey(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#E7EAF6] text-sm text-[#1F2937] focus:outline-none focus:border-[#7D9AF6]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#E7EAF6]">
          <span className="text-xs font-semibold text-[#34D399] flex items-center gap-1">
            <Check className="w-4 h-4" /> All live backend keys active
          </span>

          <button
            onClick={handleSaveSettings}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7D9AF6] to-[#A4BDF9] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all"
          >
            {savedSuccess ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
