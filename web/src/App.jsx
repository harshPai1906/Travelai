import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import SplitHero from './components/SplitHero';
import DestinationSection from './components/DestinationSection';
import PromptBox from './components/PromptBox';
import ResultsView from './components/ResultsView';
import DemoModal from './components/DemoModal';
import AuthModal from './components/AuthModal';
import AgentPipeline from './components/AgentPipeline';
import { TripsView, SavedView } from './components/TabViews';

export default function App() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Load persistent user session from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.warn('Failed to load stored user session:', e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  const textareaRef = useRef(null);

  // Live agent states: 'idle' | 'running' | 'done'
  const [agentStates, setAgentStates] = useState({
    flight: 'idle',
    hotel: 'idle',
    places: 'idle',
    itinerary: 'idle',
  });

  // Get or create unique guest session ID for non-signed-up visitors
  const getGuestSessionId = () => {
    let guestId = localStorage.getItem('guest_session_id');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      localStorage.setItem('guest_session_id', guestId);
    }
    return guestId;
  };

  const handleGenerate = async () => {
    if (!query || !query.trim()) return;
    setIsLoading(true);
    setErrorMsg('');
    setResults(null);

    const timerIds = [];

    // Animate agent pipeline states sequentially
    setAgentStates({ flight: 'running', hotel: 'idle', places: 'idle', itinerary: 'idle' });

    timerIds.push(setTimeout(() => {
      setAgentStates({ flight: 'done', hotel: 'running', places: 'idle', itinerary: 'idle' });
    }, 1000));

    timerIds.push(setTimeout(() => {
      setAgentStates({ flight: 'done', hotel: 'done', places: 'running', itinerary: 'idle' });
    }, 2000));

    timerIds.push(setTimeout(() => {
      setAgentStates({ flight: 'done', hotel: 'done', places: 'done', itinerary: 'running' });
    }, 3000));

    try {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
      const threadId = user ? `user_${user.id}` : getGuestSessionId();
      const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_query: query, thread_id: threadId }),
      });

      // Clear all timers so none can overwrite state after response arrives
      timerIds.forEach(id => clearTimeout(id));

      if (!response.ok) throw new Error('API server returned error');
      const data = await response.json();

      if (data.status === 'error') {
        setErrorMsg(data.message || data.detail || 'Unable to retrieve travel information right now. Please try again.');
        setResults(data);
      } else {
        setResults(data);
      }
      const isFlightReq = data?.flight_required ?? false;
      setAgentStates({ 
        flight: isFlightReq ? 'done' : 'skipped', 
        hotel: 'done', 
        places: 'done', 
        itinerary: 'done' 
      });
    } catch (err) {
      timerIds.forEach(id => clearTimeout(id));
      console.warn('Backend generation notice:', err);
      setErrorMsg('Unable to retrieve travel information right now. Please try again.');
      setResults(null);
      setAgentStates({ flight: 'idle', hotel: 'idle', places: 'idle', itinerary: 'idle' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPlanning = () => {
    setActiveNav('dashboard');
    setResults(null);
    setTimeout(() => {
      const el = document.getElementById('prompt-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      if (textareaRef.current) textareaRef.current.focus();
    }, 100);
  };

  const handleSelectDestination = (destQuery) => {
    setActiveNav('dashboard');
    setResults(null);
    setQuery(destQuery);
    setTimeout(() => {
      const el = document.getElementById('prompt-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      if (textareaRef.current) textareaRef.current.focus();
    }, 100);
  };

  const handleReset = () => {
    setResults(null);
    setQuery('');
    setAgentStates({ flight: 'idle', hotel: 'idle', places: 'idle', itinerary: 'idle' });
  };

  const handleTryDemo = (demoQuery) => {
    setQuery(demoQuery);
    handleStartPlanning();
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1F2937] flex relative">
      {/* Subtle Ambient Gradient Blobs */}
      <div className="ambient-blob-1" />
      <div className="ambient-blob-2" />

      {/* Demo Video Modal */}
      <DemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onTryDemo={handleTryDemo}
      />

      {/* User Signup & Login Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(usr) => setUser(usr)}
      />

      {/* Sticky Left Sidebar (280px) */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={(nav) => {
          setActiveNav(nav);
          if (nav === 'dashboard') setResults(null);
        }}
        agentStates={agentStates}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area (Max width 1500px, 64px padding, centered) */}
      <main className="flex-1 min-w-0 px-8 py-10 lg:px-[64px] max-w-[1500px] mx-auto space-y-16 relative z-10">
        {activeNav === 'trips' && (
          <TripsView
            onSelectTrip={(q) => handleSelectDestination(q)}
            user={user}
            threadId={user ? `user_${user.id}` : getGuestSessionId()}
          />
        )}

        {activeNav === 'saved' && (
          <SavedView />
        )}

        {activeNav === 'dashboard' && (
          <>
            {!results ? (
              <>
                {/* Split Hero Section */}
                <SplitHero
                  onStartPlanning={handleStartPlanning}
                  onWatchDemo={() => setIsDemoOpen(true)}
                />

                {/* Prompt Box Container */}
                <PromptBox
                  ref={textareaRef}
                  textareaRef={textareaRef}
                  query={query}
                  setQuery={setQuery}
                  onGenerate={handleGenerate}
                  isLoading={isLoading}
                />

                {/* Live Multi-Agent Pipeline Status Indicator */}
                {isLoading && (
                  <AgentPipeline agentStates={agentStates} query={query} />
                )}

                {/* Destination Cards Section */}
                {!isLoading && (
                  <DestinationSection onSelectDestination={handleSelectDestination} />
                )}
              </>
            ) : (
              <ResultsView
                results={results}
                query={query}
                onReset={handleReset}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
