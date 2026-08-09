import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play, MapPin, Compass, ShieldCheck, Star, Plane } from 'lucide-react';

export default function SplitHero({ onStartPlanning, onWatchDemo }) {
  return (
    <section className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-6">
      {/* Left Column */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, cubicBezier: [0.16, 1, 0.3, 1] }}
        className="lg:col-span-7 space-y-6"
      >
        <h1 className="text-5xl lg:text-[60px] font-extrabold text-[#1F2937] leading-[1.1] tracking-tight">
          Plan Your Dream Trip <br />
          <span className="bg-gradient-to-r from-[#7D9AF6] via-[#A4BDF9] to-[#7D9AF6] bg-clip-text text-transparent">
            with TravelOS
          </span>
        </h1>

        <p className="text-lg text-[#6B7280] font-normal leading-relaxed max-w-xl">
          Four autonomous AI agents search flights, hotels, restaurants, and attractions in seconds. Delivering bespoke itineraries tailored to your budget and travel style.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={onStartPlanning}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#7D9AF6] to-[#A4BDF9] text-white font-bold text-base shadow-xl shadow-[#7D9AF6]/30 hover:shadow-2xl hover:shadow-[#7D9AF6]/40 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2.5 group"
          >
            <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
            <span>Start Planning</span>
          </button>
        </div>
      </motion.div>

      {/* Right Column - Hero Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="lg:col-span-5 relative"
      >
        <div className="relative w-full aspect-square max-w-[480px] mx-auto">
          {/* Main Hero Card Image Container */}
          <div className="w-full h-full rounded-[32px] overflow-hidden shadow-2xl shadow-[#7D9AF6]/15 border border-white/80 relative">
            <img
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900&q=85"
              alt="Travel background"
              className="w-full h-full object-cover filter brightness-[0.92] hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">Featured Experience</span>
              <h3 className="text-xl font-bold mt-2">Kyoto Autumn Pilgrimage</h3>
              <p className="text-xs text-white/80 mt-1">7 Days • Flight + Hotel + Culture Pass</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
