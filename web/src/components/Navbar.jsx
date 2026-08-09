import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles, User, LogOut, ChevronDown, Menu, X, ArrowUpRight } from 'lucide-react';

export default function Navbar({ activeNav, setActiveNav, user, onOpenAuth, onLogout, onStartPlanning }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Explore' },
    { id: 'destinations', label: 'Destinations' },
    { id: 'trips', label: 'My Trips' },
    { id: 'about', label: 'About' },
  ];

  const handleNavClick = (id) => {
    setIsMobileMenuOpen(false);
    if (id === 'destinations') {
      setActiveNav('dashboard');
      setTimeout(() => {
        const el = document.getElementById('popular-destinations');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (id === 'about') {
      setActiveNav('dashboard');
      setTimeout(() => {
        const el = document.getElementById('why-travelos');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setActiveNav(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-[#E7EAF6] shadow-sm py-3.5'
          : 'bg-transparent py-5'
        }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#7D9AF6] to-[#A4BDF9] flex items-center justify-center text-white shadow-md shadow-[#7D9AF6]/25 group-hover:scale-105 transition-transform duration-300">
            <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#1F2937] font-serif-display">
            TRAVEL<span className="text-[#7D9AF6]">OS</span>
          </span>
        </div>

        {/* Center Floating Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#E7EAF6]/80 shadow-sm">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${activeNav === item.id
                  ? 'bg-[#7D9AF6] text-white shadow-md shadow-[#7D9AF6]/30'
                  : 'text-[#4B5563] hover:text-[#1F2937] hover:bg-white/80'
                }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Actions: Auth + Plan CTA */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white border border-[#E7EAF6] text-xs font-bold text-[#1F2937] shadow-sm hover:border-[#7D9AF6] transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[#7D9AF6]/20 text-[#7D9AF6] flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span>{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-[#E7EAF6] shadow-xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-[#E7EAF6]">
                    <p className="text-xs font-bold text-[#1F2937]">{user.name}</p>
                    <p className="text-[10px] text-[#6B7280] truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 mt-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs font-bold text-[#4B5563] hover:text-[#7D9AF6] transition-colors cursor-pointer px-3 py-2"
            >
              Sign In
            </button>
          )}

          {/* Plan a Trip Pill Button */}
          <button
            onClick={onStartPlanning}
            className="btn-shimmer px-5 py-2.5 rounded-full text-white font-bold text-xs tracking-wide shadow-md shadow-[#7D9AF6]/25 hover:shadow-lg hover:shadow-[#7D9AF6]/35 flex items-center gap-1.5 group cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white/80" />
            <span>Plan a Trip</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2.5 rounded-2xl bg-white border border-[#E7EAF6] text-[#1F2937] shadow-sm cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Slide-down Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-[#E7EAF6] px-6 py-6 space-y-4 shadow-2xl">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeNav === item.id
                    ? 'bg-[#7D9AF6]/15 text-[#7D9AF6]'
                    : 'text-[#4B5563] hover:bg-[#F9FAFB]'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-[#E7EAF6] flex flex-col gap-3">
            {user ? (
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold text-[#1F2937]">{user.name}</span>
                <button
                  onClick={onLogout}
                  className="text-xs font-bold text-rose-600 flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-2.5 rounded-xl border border-[#E7EAF6] text-xs font-bold text-[#1F2937]"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onStartPlanning();
              }}
              className="w-full btn-shimmer py-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Plan a Trip</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
