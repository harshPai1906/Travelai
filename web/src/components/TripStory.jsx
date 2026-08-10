import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Sparkles,
  MapPin,
  Clock,
  Tag,
  Star,
  Heart,
  Share2,
  Download,
  ArrowRight,
  Compass,
  Camera,
  Utensils,
  Landmark,
  TreePine,
  Mountain,
  ShoppingBag,
  Coffee,
  Palette,
  Check,
  Plane,
  ChevronRight,
  BookOpen
} from 'lucide-react';

// ── Category Icon Resolver ──────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  Landmark: { icon: Landmark, emoji: '🏛️', color: '#7D9AF6' },
  Culture: { icon: Palette, emoji: '🎨', color: '#A78BFA' },
  Food: { icon: Utensils, emoji: '🍽️', color: '#F59E0B' },
  Nature: { icon: TreePine, emoji: '🌿', color: '#34D399' },
  Adventure: { icon: Mountain, emoji: '🏔️', color: '#F97316' },
  Shopping: { icon: ShoppingBag, emoji: '🛍️', color: '#EC4899' },
  Relaxation: { icon: Coffee, emoji: '☕', color: '#8B5CF6' },
  Photography: { icon: Camera, emoji: '📸', color: '#3B82F6' },
  Spiritual: { icon: Star, emoji: '🕉️', color: '#EF4444' },
};

function getCategoryConfig(category) {
  return CATEGORY_CONFIG[category] || { icon: MapPin, emoji: '📍', color: '#7D9AF6' };
}

// ── Format duration in human readable form ──────────────────────────────────
function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h} hour${h > 1 ? 's' : ''}`;
}

// ── Animated scroll-in wrapper ──────────────────────────────────────────────
function ScrollReveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Activity Card ───────────────────────────────────────────────────────────
function ActivityCard({ activity, index, isLeft }) {
  const cat = getCategoryConfig(activity.category);
  const CatIcon = cat.icon;

  return (
    <ScrollReveal delay={index * 0.08}>
      <div className={`flex ${isLeft ? 'justify-start' : 'justify-end'}`}>
        <div className="w-full max-w-[520px] group">
          {/* Category Tag Connector */}
          <div className={`flex items-center gap-2 mb-2 ${isLeft ? '' : 'justify-end'}`}>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
            >
              <CatIcon className="w-3 h-3" />
              {activity.category}
            </span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-[24px] border border-[#E7EAF6] p-5 shadow-sm hover:shadow-xl hover:shadow-[#7D9AF6]/10 hover:border-[#7D9AF6]/40 transition-all duration-500 space-y-3">
            {/* Header Row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-lg shadow-sm"
                  style={{ backgroundColor: `${cat.color}15` }}
                >
                  {cat.emoji}
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-[#1F2937] text-base leading-tight truncate">
                    {activity.name}
                  </h4>
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mt-0.5"
                    style={{ color: cat.color }}
                  >
                    <CatIcon className="w-3 h-3" />
                    {activity.category}
                  </span>
                </div>
              </div>

            </div>

            {/* Description */}
            <p className="text-sm text-[#475569] leading-relaxed">
              {activity.description}
            </p>

            {/* AI Reason */}
            {activity.ai_reason && (
              <div className="flex items-start gap-2 p-3 rounded-2xl bg-gradient-to-r from-[#7D9AF6]/5 to-[#A4BDF9]/5 border border-[#7D9AF6]/10">
                <Sparkles className="w-3.5 h-3.5 text-[#7D9AF6] shrink-0 mt-0.5" />
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  <span className="font-bold text-[#7D9AF6]">AI picked this — </span>
                  {activity.ai_reason}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

// ── Day Section ─────────────────────────────────────────────────────────────
function DaySection({ day, dayIndex, totalDays }) {
  const isEvenDay = dayIndex % 2 === 0;

  return (
    <div id={`trip-day-${day.day}`} className="space-y-6">
      {/* Day Header */}
      <ScrollReveal>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7D9AF6] to-[#A4BDF9] text-white flex items-center justify-center shadow-lg shadow-[#7D9AF6]/25">
            <span className="text-lg font-black">{String(day.day).padStart(2, '0')}</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#7D9AF6] uppercase tracking-widest">
              Day {day.day} of {totalDays}
            </p>
            <h3 className="text-2xl font-extrabold text-[#1F2937] tracking-tight leading-tight">
              {day.title || `Day ${day.day}`}
            </h3>
            {day.summary && (
              <p className="text-xs text-[#6B7280] mt-0.5">{day.summary}</p>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* AI Story Narrative */}
      {day.ai_story && (
        <ScrollReveal delay={0.1}>
          <div className="bg-gradient-to-r from-[#FFFDF7] to-white rounded-[24px] border border-[#E7EAF6] p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#7D9AF6] to-[#A4BDF9] rounded-full" />
            <div className="pl-4">
              <div className="flex items-center gap-1.5 mb-2">
                <BookOpen className="w-3.5 h-3.5 text-[#7D9AF6]" />
                <span className="text-[10px] font-bold text-[#7D9AF6] uppercase tracking-wider">Story</span>
              </div>
              <p className="text-sm text-[#475569] leading-[1.8] italic">
                "{day.ai_story}"
              </p>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Activities — alternating left/right */}
      <div className="space-y-5 pl-2">
        {(day.activities || []).map((activity, idx) => (
          <ActivityCard
            key={idx}
            activity={activity}
            index={idx}
            isLeft={isEvenDay ? idx % 2 === 0 : idx % 2 !== 0}
          />
        ))}
      </div>

      {/* Day divider */}
      {dayIndex < totalDays - 1 && (
        <div className="flex items-center gap-4 py-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E7EAF6] to-transparent" />
          <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E7EAF6] to-transparent" />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ── Main TripStory Component ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
function createFallbackStoryData(query = 'Destination') {
  const matchD = query.match(/(\d+)\s*(?:day|days)/i);
  const numDays = matchD ? Math.min(14, Math.max(1, parseInt(matchD[1], 10))) : 5;

  let dest = query
    .replace(/\d+/g, '')
    .replace(/\b(plan|trip|itinerary|itenary|flights|hotels|days|day|for|search|best|roam|here|tour|travel|guide|places|visit|recommended|hotel|where|to|stay|in|from)\b/gi, '')
    .trim();
  if (dest) {
    dest = dest.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  } else {
    dest = "Destination";
  }

  const generatedDays = [];
  const dayTemplates = [
    {
      title: `Historic ${dest} & Primary Landmarks`,
      summary: "Arrival, hotel check-in, and primary landmark orientation.",
      ai_story: `Welcome to ${dest}! Your journey starts with smooth check-in at your hotel, followed by an afternoon exploring iconic landmarks and an evening tasting regional dishes.`,
      activities: [
        { name: "Hotel Check-in & Orientation", description: `Arrive in ${dest}, check into your accommodation, and get settled.`, category: "Landmark", duration_minutes: 120, estimated_cost: 0, currency: "INR", ai_reason: `Essential first step to begin your ${dest} trip.` },
        { name: `Primary ${dest} Monument Sightseeing`, description: `Explore central landmarks, historic avenues, and iconic photography viewpoints in ${dest}.`, category: "Culture", duration_minutes: 180, estimated_cost: 500, currency: "INR", ai_reason: "Top highlight tailored to your destination prompt." },
        { name: "Regional Culinary Dinner", description: "Savor authentic regional cuisine and local specialties at a top-rated dining spot.", category: "Food", duration_minutes: 90, estimated_cost: 800, currency: "INR", ai_reason: "Immersion in regional culinary traditions." }
      ]
    },
    {
      title: `${dest} Heritage & Cultural Exploration`,
      summary: "Guided tour of key monuments and local markets.",
      ai_story: `Day 2 deep-dives into the rich culture and history of ${dest}, visiting ancient heritage sites and vibrant local markets.`,
      activities: [
        { name: "Heritage Site & Museum Visit", description: `Explore historic architectural sites, cultural museums, and art galleries in ${dest}.`, category: "Culture", duration_minutes: 150, estimated_cost: 400, currency: "INR", ai_reason: "Rich historical and architectural significance." },
        { name: "Scenic Sunset Viewpoint", description: `Relax at a popular scenic viewpoint overlooking ${dest} as the sun sets.`, category: "Nature", duration_minutes: 90, estimated_cost: 0, currency: "INR", ai_reason: "Great for photography and evening relaxation." },
        { name: "Evening Traditional Market Stroll", description: "Experience local night markets and sample regional street food delights.", category: "Shopping", duration_minutes: 120, estimated_cost: 500, currency: "INR", ai_reason: "Vibrant local market atmosphere." }
      ]
    },
    {
      title: `${dest} Nature & Hidden Wonders`,
      summary: "Scenic nature trails, parks, and panorama spots.",
      ai_story: `Day 3 takes you through the stunning natural landscapes and scenic panorama spots surrounding ${dest}.`,
      activities: [
        { name: "Morning Nature Walk & Lake Trail", description: `Immerse in lush botanical gardens, serene lakes, or nature trails around ${dest}.`, category: "Nature", duration_minutes: 150, estimated_cost: 200, currency: "INR", ai_reason: "Refreshed outdoor nature experience." },
        { name: "Local Artisan Craft Village", description: "Visit traditional handicraft workshops and observe local artisans at work.", category: "Culture", duration_minutes: 120, estimated_cost: 300, currency: "INR", ai_reason: "Direct interaction with regional craftsmen." },
        { name: "Gourmet Cafe & Coffee Tasting", description: "Relax at a premier local cafe known for specialty brews and dessert delicacies.", category: "Food", duration_minutes: 90, estimated_cost: 400, currency: "INR", ai_reason: "Popular leisure stop loved by travelers." }
      ]
    },
    {
      title: `${dest} Spiritual Sites & Architectural Landmarks`,
      summary: "Exploring historic temples, shrines, and sacred architecture.",
      ai_story: `Day 4 brings quiet reflection and architectural wonder as you explore sacred temples, shrines, and historic corridors of ${dest}.`,
      activities: [
        { name: "Sacred Temple & Spiritual Sanctuary", description: `Visit renowned spiritual sanctuaries and architectural corridors in ${dest}.`, category: "Spiritual", duration_minutes: 150, estimated_cost: 0, currency: "INR", ai_reason: "Iconic spiritual and cultural landmark." },
        { name: "Historic Boulevard Walk", description: `Stroll through historic colonial or heritage boulevards lined with boutique cafes.`, category: "Landmark", duration_minutes: 120, estimated_cost: 0, currency: "INR", ai_reason: "Scenic heritage walk." },
        { name: "Sunset Cruise or Panorama Overlook", description: "Enjoy a scenic evening boat ride or hilltop panorama view of the city.", category: "Adventure", duration_minutes: 120, estimated_cost: 600, currency: "INR", ai_reason: "Unmatched sunset photography spot." }
      ]
    },
    {
      title: `${dest} Artisan Bazaars & Cultural Highlights`,
      summary: "Souvenir shopping, local market exploration, and travel departure.",
      ai_story: `Your final day in ${dest} leaves ample time for shopping artisan bazaars and taking home souvenirs before your departure.`,
      activities: [
        { name: "Artisan Bazaar & Souvenir Shopping", description: `Explore traditional craft bazaars and local spice markets in ${dest}.`, category: "Shopping", duration_minutes: 150, estimated_cost: 1000, currency: "INR", ai_reason: "Perfect final day souvenir experience." },
        { name: "Farewell Lunch & Departure Transfer", description: "Enjoy a memorable farewell lunch before transferring to the station or airport.", category: "Food", duration_minutes: 120, estimated_cost: 900, currency: "INR", ai_reason: "Smooth concluding meal." }
      ]
    }
  ];

  for (let i = 0; i < numDays; i++) {
    const template = dayTemplates[i % dayTemplates.length];
    generatedDays.push({
      day: i + 1,
      title: i < 5 ? template.title : `Day ${i + 1}: ${dest} Exploration`,
      summary: template.summary,
      ai_story: template.ai_story,
      activities: template.activities
    });
  }

  return {
    trip: {
      destination: dest,
      country: "Travel Story",
      duration_days: numDays
    },
    days: generatedDays
  };
}

export default function TripStory({ tripStoryJson, query, onReset }) {
  const [activeDay, setActiveDay] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef(null);

  // Parse JSON trip story
  const storyData = useMemo(() => {
    if (tripStoryJson) {
      try {
        const parsed = typeof tripStoryJson === 'string' ? JSON.parse(tripStoryJson) : tripStoryJson;
        if (parsed && parsed.trip && Array.isArray(parsed.days) && parsed.days.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse trip story JSON, falling back:', e);
      }
    }
    return createFallbackStoryData(query);
  }, [tripStoryJson, query]);

  // Scroll progress tracking
  useEffect(() => {
    if (!storyData || !containerRef.current) return;

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const totalHeight = container.scrollHeight - window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      const progress = Math.min(1, Math.max(0, scrolled / totalHeight));
      setScrollProgress(progress);

      // Update active day based on scroll position
      const dayElements = container.querySelectorAll('[id^="trip-day-"]');
      dayElements.forEach((el) => {
        const elRect = el.getBoundingClientRect();
        if (elRect.top <= 200 && elRect.bottom > 0) {
          const dayNum = parseInt(el.id.replace('trip-day-', ''));
          if (!isNaN(dayNum)) setActiveDay(dayNum);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [storyData]);

  // If no valid trip story data, don't render
  if (!storyData) return null;

  const { trip, days } = storyData;
  const totalDays = days.length;

  const handleDayClick = (dayNum) => {
    setActiveDay(dayNum);
    const el = document.getElementById(`trip-day-${dayNum}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleShare = () => {
    const text = `Check out my AI Trip Story for ${trip.destination}!\n\n${days.map(d => `Day ${d.day}: ${d.title}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    let md = `# ✨ Trip Story: ${trip.destination}\n`;
    md += `**${totalDays}-Day Journey in ${trip.destination}**\n\n---\n\n`;
    days.forEach(d => {
      md += `## Day ${d.day}: ${d.title}\n\n`;
      if (d.ai_story) md += `> ${d.ai_story}\n\n`;
      (d.activities || []).forEach(a => {
        md += `### ${a.name}\n`;
        md += `${a.description}\n`;
        if (a.ai_reason) md += `> ✨ ${a.ai_reason}\n`;
        md += '\n';
      });
      md += '---\n\n';
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Trip_Story_${(trip.destination || 'trip').replace(/\s+/g, '_')}.md`;
    a.click();
  };

  return (
    <div ref={containerRef} className="space-y-8 pt-6">
      {/* ── Section Header ──────────────────────────────────────────────── */}
      <ScrollReveal>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7D9AF6] to-[#A4BDF9] text-white flex items-center justify-center shadow-lg shadow-[#7D9AF6]/25">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[#1F2937] tracking-tight">
                Your Trip Story
              </h2>
              <p className="text-xs text-[#6B7280]">
                Your journey, brought to life by AI.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#7D9AF6] to-[#A4BDF9] text-white text-xs font-bold shadow-md shadow-[#7D9AF6]/20">
            <Sparkles className="w-3.5 h-3.5" />
            AI Story
          </span>
        </div>
      </ScrollReveal>

      {/* ── Trip Cover Hero Card ────────────────────────────────────────── */}
      <ScrollReveal delay={0.1}>
        <div className="relative bg-gradient-to-br from-[#1F2937] to-[#374151] rounded-[28px] overflow-hidden shadow-2xl shadow-[#7D9AF6]/15 min-h-[220px]">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#7D9AF6]/20 to-transparent z-10" />

          {/* Content */}
          <div className="relative z-20 p-8 md:p-10 flex flex-col justify-end min-h-[220px]">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold text-white uppercase tracking-widest border border-white/20">
                <Compass className="w-3 h-3" />
                {trip.country || 'Travel Story'}
              </span>

              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
                {trip.destination}
              </h2>

              <p className="text-lg text-white/80 font-medium">
                {totalDays}-Day Journey
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md text-xs font-bold text-white border border-white/20">
                  📅 {totalDays} Days Journey
                </span>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── Day Navigation Pills + Progress ─────────────────────────────── */}
      <ScrollReveal delay={0.15}>
        <div className="bg-white rounded-[24px] border border-[#E7EAF6] p-4 shadow-sm space-y-3 sticky top-2 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              {days.map((d) => (
                <button
                  key={d.day}
                  onClick={() => handleDayClick(d.day)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer border ${activeDay === d.day
                      ? 'bg-gradient-to-r from-[#7D9AF6] to-[#A4BDF9] text-white border-transparent shadow-md shadow-[#7D9AF6]/30'
                      : 'bg-white border-[#E7EAF6] text-[#4B5563] hover:border-[#7D9AF6]/60 hover:text-[#7D9AF6]'
                    }`}
                >
                  Day {d.day}
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-[#9CA3AF] whitespace-nowrap pl-3">
              Day {activeDay} / {totalDays}
            </span>
          </div>

          {/* Thin Progress Bar */}
          <div className="h-1 bg-[#E7EAF6] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#7D9AF6] to-[#A4BDF9] rounded-full"
              animate={{ width: `${Math.max(scrollProgress * 100, (activeDay / totalDays) * 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </ScrollReveal>

      {/* ── Day-by-Day Story Sections ────────────────────────────────────── */}
      <div className="space-y-12">
        {days.map((day, idx) => (
          <DaySection
            key={day.day}
            day={day}
            dayIndex={idx}
            totalDays={totalDays}
          />
        ))}
      </div>

      {/* ── Trip Finale ──────────────────────────────────────────────────── */}
      <ScrollReveal>
        <div className="bg-gradient-to-br from-[#FFFDF7] to-white rounded-[28px] border border-[#E7EAF6] p-8 md:p-10 shadow-lg text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#34D399]/10 text-[#34D399] font-bold text-xs mx-auto">
            <Plane className="w-4 h-4" />
            Trip Completed
          </div>

          <h3 className="text-3xl font-black text-[#1F2937] tracking-tight">
            Until next time, {trip.destination}.
          </h3>

          <p className="text-sm text-[#6B7280] max-w-md mx-auto">
            Your {totalDays}-day journey is ready. Save it, share it, or start planning your next adventure.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#7D9AF6] to-[#A4BDF9] text-white font-bold text-xs shadow-lg shadow-[#7D9AF6]/30 hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Save Trip
            </button>

            <button
              onClick={handleShare}
              className="px-6 py-3 rounded-2xl bg-white border border-[#E7EAF6] text-[#1F2937] font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-[#34D399]" /> : <Share2 className="w-4 h-4 text-[#7D9AF6]" />}
              {copied ? 'Copied!' : 'Share Trip'}
            </button>

            <button
              onClick={onReset}
              className="px-6 py-3 rounded-2xl bg-[#FFFDF7] border border-[#E7EAF6] text-[#1F2937] font-semibold text-xs hover:bg-white shadow-sm transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#7D9AF6]" />
              Start New Trip
            </button>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
