import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Building2, MapPin, CalendarDays, CheckCircle2, Loader2 } from 'lucide-react';

const AGENTS = [
  { id: 'flight', name: 'Flights', icon: Plane },
  { id: 'hotel', name: 'Hotels', icon: Building2 },
  { id: 'places', name: 'Places', icon: MapPin },
  { id: 'itinerary', name: 'Itinerary', icon: CalendarDays },
];

export default function AgentPipeline({ agentStates = {}, query = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mt-8 mb-4"
    >
      <div className="bg-white rounded-[24px] border border-[#E7EAF6] p-6 sm:p-8 shadow-lg shadow-[#7D9AF6]/5">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="font-display text-xl text-[#1F2937]">
            Building your journey
          </h3>
          <p className="text-xs text-[#6B7280] mt-1">
            AI agents are crafting your personalized plan for: <span className="font-bold text-[#7D9AF6]">{query || 'Destination'}</span>
          </p>
        </div>

        {/* Agent Pipeline Row */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          {AGENTS.map((agent, idx) => {
            const status = agentStates[agent.id] || 'idle';
            const Icon = agent.icon;

            return (
              <React.Fragment key={agent.id}>
                {/* Agent Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className={`flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border transition-all duration-500 min-w-[90px] ${
                    status === 'running'
                      ? 'bg-[#7D9AF6]/10 border-[#7D9AF6]/40 shadow-md shadow-[#7D9AF6]/15'
                      : status === 'done'
                        ? 'bg-[#34D399]/5 border-[#34D399]/30'
                        : 'bg-[#F9FAFB] border-[#E7EAF6]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                    status === 'running'
                      ? 'bg-[#7D9AF6] text-white pulse-blue'
                      : status === 'done'
                        ? 'bg-[#34D399]/20 text-[#34D399]'
                        : 'bg-white border border-[#E7EAF6] text-[#9CA3AF]'
                  }`}>
                    {status === 'running' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : status === 'done' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>

                  <span className={`text-[11px] font-bold transition-colors ${
                    status === 'running'
                      ? 'text-[#7D9AF6]'
                      : status === 'done' || status === 'skipped'
                        ? 'text-[#34D399]'
                        : 'text-[#9CA3AF]'
                  }`}>
                    {agent.id === 'flight' && status === 'skipped' ? 'Flights (N/A)' : agent.name}
                  </span>
                </motion.div>

                {/* Connector Line */}
                {idx < AGENTS.length - 1 && (
                  <div className="hidden sm:flex items-center">
                    <div className={`w-8 h-0.5 rounded-full transition-all duration-700 ${
                      agentStates[AGENTS[idx + 1].id] !== 'idle'
                        ? 'bg-gradient-to-r from-[#34D399] to-[#7D9AF6]'
                        : status === 'done'
                          ? 'bg-[#34D399]/30'
                          : 'bg-[#E7EAF6]'
                    }`} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
