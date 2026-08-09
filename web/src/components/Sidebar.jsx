import React from 'react';
import {
  Compass,
  Home,
  Plane,
  Heart,
  Settings,
  PlaneTakeoff,
  Building2,
  MapPin,
  CalendarDays,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function Sidebar({ activeNav, setActiveNav, agentStates, user, onOpenAuth, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'trips', label: 'Trips', icon: Plane },
    { id: 'saved', label: 'Saved', icon: Heart },
  ];

  const agents = [
    { id: 'flight', name: 'Flight Agent', icon: PlaneTakeoff, role: 'Flight Finder' },
    { id: 'hotel', name: 'Hotel Agent', icon: Building2, role: 'Hotel Scout' },
    { id: 'places', name: 'Places Agent', icon: MapPin, role: 'Spot Curator' },
    { id: 'itinerary', name: 'Itinerary Agent', icon: CalendarDays, role: 'Schedule Designer' },
  ];

  return (
    <aside className="w-[280px] h-screen sticky top-0 bg-white/90 backdrop-blur-xl border-r border-[#E7EAF6] flex flex-col justify-between p-6 z-40 shadow-sm shrink-0">
      <div className="space-y-8">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7D9AF6] to-[#A4BDF9] flex items-center justify-center shadow-md shadow-[#7D9AF6]/20">
            <Compass className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-[#1F2937] tracking-tight">
              TravelOS
            </h1>
            <p className="text-[11px] text-[#6B7280]">
              Multi-Agent System
            </p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1.5">
          <p className="px-3 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 ${isActive
                  ? 'bg-gradient-to-r from-[#7D9AF6] to-[#A4BDF9] text-white shadow-lg shadow-[#7D9AF6]/30 translate-x-1'
                  : 'text-[#6B7280] hover:bg-[#FFFDF7] hover:text-[#1F2937] hover:translate-x-1'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#6B7280]'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Live Agent Status Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-3">
            <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Agent Status</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] pulse-green" />
              Active Pipeline
            </span>
          </div>

          <div className="space-y-2">
            {agents.map((agent) => {
              const Icon = agent.icon;
              const status = agentStates[agent.id] || 'idle'; // 'idle' | 'running' | 'done'

              return (
                <div
                  key={agent.id}
                  className="group relative bg-white/70 hover:bg-white border border-[#E7EAF6] hover:border-[#7D9AF6]/40 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${status === 'running'
                        ? 'bg-[#7D9AF6] text-white animate-bounce'
                        : status === 'done'
                          ? 'bg-[#34D399]/20 text-[#34D399]'
                          : 'bg-[#FFFDF7] border border-[#E7EAF6] text-[#6B7280] group-hover:text-[#7D9AF6]'
                        }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1F2937] leading-tight">{agent.name}</p>
                        <p className="text-[10px] text-[#6B7280] font-medium">{agent.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {status === 'running' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#7D9AF6] pulse-green" />
                      )}
                      {status === 'done' && (
                        <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                      )}
                      {status === 'idle' && (
                        <span className="w-2 h-2 rounded-full bg-[#E7EAF6]" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </aside>
  );
}

