import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function DemoModal({ isOpen, onClose, onTryDemo }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[32px] border border-[#E7EAF6] shadow-2xl p-6 md:p-8 overflow-hidden space-y-6"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-[#FFFDF7] border border-[#E7EAF6] text-[#6B7280] hover:text-[#1F2937] hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-[#7D9AF6] uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Demo Preview</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1F2937]">
            How Multi-Agent Travel AI Works
          </h2>

          {/* Video Placeholder Container */}
          <div className="relative aspect-video rounded-2xl bg-slate-900 overflow-hidden shadow-inner flex items-center justify-center group">
            <img 
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1000&q=80" 
              alt="Demo video thumbnail" 
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-3 p-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#7D9AF6] to-[#A4BDF9] text-white flex items-center justify-center shadow-xl shadow-[#7D9AF6]/40 cursor-pointer hover:scale-110 transition-transform">
                <Play className="w-7 h-7 fill-current ml-1" />
              </div>
              <p className="text-white font-bold text-sm">Watch 60-Second Multi-Agent Demo</p>
              <p className="text-white/70 text-xs max-w-md">See Flight Agent, Hotel Scout, and LLaMA 3.3 70B build a full trip live in 4 seconds.</p>
            </div>
          </div>

          {/* Features List */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#FFFDF7] border border-[#E7EAF6] p-3 rounded-xl text-center space-y-1">
              <CheckCircle2 className="w-4 h-4 text-[#34D399] mx-auto" />
              <p className="text-xs font-bold text-[#1F2937]">Live Flights</p>
              <p className="text-[10px] text-[#6B7280]">AviationStack API</p>
            </div>
            <div className="bg-[#FFFDF7] border border-[#E7EAF6] p-3 rounded-xl text-center space-y-1">
              <CheckCircle2 className="w-4 h-4 text-[#34D399] mx-auto" />
              <p className="text-xs font-bold text-[#1F2937]">Hotel Web Search</p>
              <p className="text-[10px] text-[#6B7280]">Tavily Web Agent</p>
            </div>
            <div className="bg-[#FFFDF7] border border-[#E7EAF6] p-3 rounded-xl text-center space-y-1">
              <CheckCircle2 className="w-4 h-4 text-[#34D399] mx-auto" />
              <p className="text-xs font-bold text-[#1F2937]">Groq LLaMA 3.3</p>
              <p className="text-[10px] text-[#6B7280]">Real-time Itinerary</p>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#E7EAF6] text-[#6B7280] font-semibold text-xs hover:bg-slate-50 transition-all"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onTryDemo("Plan a 5-day trip to Kyoto including flights, traditional ryokan hotels, and temple tours");
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7D9AF6] to-[#A4BDF9] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <span>Try Kyoto Demo Trip</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
