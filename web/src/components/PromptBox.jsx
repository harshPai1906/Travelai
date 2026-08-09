import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mic, MicOff, Rocket, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

const SUGGESTIONS = [
  { label: '🏔️ Kashmir & Gulmarg 6 Days', query: 'Plan a 6-day trip to Kashmir including Srinagar Dal Lake houseboat stay, Gulmarg Gondola snow point, and Pahalgam valley' },
  { label: '🌊 Kanyakumari Southern Tip', query: 'Plan a 3-day trip to Kanyakumari covering Vivekananda Rock Memorial, Thiruvalluvar Statue, Triveni Sangam sunrise & sunset, and Padmanabhapuram Palace' },
  { label: '🕉️ Varanasi Kashi Ghats', query: 'Plan a 4-day spiritual journey in Varanasi covering Ganga Aarti, Kashi Vishwanath temple corridor, sunrise boat ride, and Sarnath' },
  { label: '🕌 Taj Mahal & Agra Fort', query: 'Plan a 3-day Golden Triangle segment to Agra featuring sunrise Taj Mahal visit, Agra Fort, and Fatehpur Sikri' },
  { label: '🏖️ Goa Beach & Water Sports', query: 'Plan a 5-day Goa vacation covering North Goa water sports, South Goa peaceful beaches, Old Goa churches, and Dudhsagar falls' },
  { label: '🚩 Kedarnath Himalayan Yatra', query: 'Plan a 6-day Himalayan yatra to Kedarnath and Badrinath including trek tips, stay booking, and Mana village tour' },
];

export default function PromptBox({ query, setQuery, onGenerate, isLoading, textareaRef }) {
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech Recognition API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError('');
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setQuery(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone access denied. Please enable mic permissions in your browser.');
        } else if (event.error === 'no-speech') {
          setSpeechError('No speech detected. Please speak into your mic.');
        } else {
          setSpeechError('Voice input error. You can type your request directly.');
        }
        setTimeout(() => setSpeechError(''), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [setQuery]);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      setTimeout(() => setSpeechError(''), 4000);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn(e);
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Speech start error:', err);
        setIsListening(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && query && query.trim()) {
        onGenerate();
      }
    }
  };

  const handleChipClick = (q) => {
    setQuery(q);
    if (textareaRef?.current) textareaRef.current.focus();
  };

  return (
    <section className="space-y-6 pt-4" id="prompt-section">
      {/* Container header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#7D9AF6] to-[#A4BDF9] flex items-center justify-center text-white shadow-md shadow-[#7D9AF6]/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-[#1F2937] tracking-tight">
              Design Your Itinerary
            </h3>
            <p className="text-xs text-[#6B7280]">
              Describe your destination, travel duration, budget or preferences
            </p>
          </div>
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-2.5">
        {SUGGESTIONS.map((chip) => (
          <button
            key={chip.label}
            onClick={() => handleChipClick(chip.query)}
            className="px-4 py-2 rounded-full bg-white border border-[#E7EAF6] text-xs font-semibold text-[#1F2937] shadow-sm hover:border-[#7D9AF6] hover:bg-[#7D9AF6]/10 hover:text-[#7D9AF6] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
          >
            <span>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* Glassmorphic Prompt Box Card */}
      <div className="relative bg-white/90 backdrop-blur-xl border border-[#E7EAF6] rounded-[28px] p-4 shadow-xl shadow-[#7D9AF6]/10 hover:border-[#7D9AF6]/40 transition-all duration-300">
        <div className="relative flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Magic Icon */}
          <div className="hidden md:flex items-center justify-center pl-3 text-[#7D9AF6]">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>

          {/* Input Text Area */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="I want to roam here Rome..."
              rows={2}
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-[#1F2937] placeholder-[#9CA3AF] text-base font-medium resize-none leading-relaxed"
            />
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 pt-2 md:pt-0 justify-end shrink-0">
            {/* Live Mic Voice Button */}
            <button
              type="button"
              onClick={handleMicClick}
              title={isListening ? "Listening... Click to stop" : "Click to speak"}
              className={`p-3 rounded-2xl border transition-all duration-300 relative ${isListening
                ? 'bg-rose-500 text-white border-rose-600 shadow-lg shadow-rose-500/30'
                : 'bg-[#FFFDF7] border-[#E7EAF6] text-[#6B7280] hover:text-[#7D9AF6] hover:border-[#7D9AF6]'
                }`}
            >
              {isListening ? (
                <>
                  <span className="absolute -inset-1 rounded-2xl bg-rose-500/30 animate-ping"></span>
                  <MicOff className="w-5 h-5 relative z-10 animate-bounce" />
                </>
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            {/* Large Gradient Generate Rocket Button */}
            <button
              onClick={onGenerate}
              disabled={isLoading || !query || !query.trim()}
              className={`btn-shimmer px-8 py-3.5 rounded-2xl text-white font-bold text-base shadow-lg shadow-[#7D9AF6]/30 flex items-center justify-center gap-2.5 transition-all duration-300 ${isLoading || !query || !query.trim()
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:shadow-xl hover:shadow-[#7D9AF6]/40 hover:-translate-y-1 active:translate-y-0'
                }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Agents Working...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  <span>Generate Plan</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Voice Input Toast Status / Error message */}
        {isListening && (
          <div className="mt-3 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Listening to your voice... Speak clearly into your microphone now.</span>
          </div>
        )}

        {speechError && (
          <div className="mt-3 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{speechError}</span>
          </div>
        )}
      </div>
    </section>
  );
}
