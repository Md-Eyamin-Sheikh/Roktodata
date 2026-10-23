'use client';

import React from 'react';
import { Home, FileText, Droplet, UserSearch, User } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export type NavTab = 'home' | 'requests' | 'request_form' | 'donors' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  activeRequestsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  activeRequestsCount = 1,
}) => {
  const { t } = useLanguage();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-white/92 backdrop-blur-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-[#E4E6EB]/70 md:hidden transition-all">
      <div className="flex justify-around items-center h-16 px-1.5 max-w-md mx-auto relative">
        {/* Tab 1: Home */}
        <button
          onClick={() => onTabChange('home')}
          aria-label={t.nav.home}
          className={`flex flex-col items-center justify-center h-12 w-14 rounded-2xl transition-all active:scale-90 cursor-pointer ${
            activeTab === 'home'
              ? 'text-[#C41E3A]'
              : 'text-[#6B7280] hover:text-[#1B1B1F]'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 transition-transform ${activeTab === 'home' ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
          </div>
          <span className={`text-xs mt-1 transition-all ${activeTab === 'home' ? 'font-extrabold text-[#C41E3A]' : 'font-medium'}`}>
            {t.nav.home}
          </span>
          {activeTab === 'home' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#C41E3A] mt-0.5 animate-in fade-in zoom-in" />
          )}
        </button>

        {/* Tab 2: Requests */}
        <button
          onClick={() => onTabChange('requests')}
          aria-label={t.nav.requestsLong}
          className={`flex flex-col items-center justify-center h-12 w-14 rounded-2xl transition-all active:scale-90 cursor-pointer ${
            activeTab === 'requests'
              ? 'text-[#C41E3A]'
              : 'text-[#6B7280] hover:text-[#1B1B1F]'
          }`}
        >
          <div className="relative">
            <FileText className={`w-5 h-5 transition-transform ${activeTab === 'requests' ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
            {activeRequestsCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-[#C41E3A] ring-2 ring-white animate-pulse" />
            )}
          </div>
          <span className={`text-xs mt-1 transition-all ${activeTab === 'requests' ? 'font-extrabold text-[#C41E3A]' : 'font-medium'}`}>
            {t.nav.requests}
          </span>
          {activeTab === 'requests' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#C41E3A] mt-0.5 animate-in fade-in zoom-in" />
          )}
        </button>

        {/* Tab 3: Request Blood (Elevated Floating Center Action with Ambient Glow) */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            onClick={() => onTabChange('request_form')}
            aria-label={t.nav.emergencyAction}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#9E0027] via-[#C41E3A] to-[#E53935] text-white flex items-center justify-center shadow-[0_6px_20px_rgba(196,30,58,0.45)] active:scale-90 transition-all cursor-pointer ring-4 ring-white"
          >
            <Droplet className="w-6 h-6 fill-white text-white drop-shadow-xs" />
          </button>
          <span className="text-xs font-extrabold text-[#C41E3A] mt-1 select-none tracking-tight">
            {t.nav.requestBlood}
          </span>
        </div>

        {/* Tab 4: Donors */}
        <button
          onClick={() => onTabChange('donors')}
          aria-label={t.nav.donorsLong}
          className={`flex flex-col items-center justify-center h-12 w-14 rounded-2xl transition-all active:scale-90 cursor-pointer ${
            activeTab === 'donors'
              ? 'text-[#C41E3A]'
              : 'text-[#6B7280] hover:text-[#1B1B1F]'
          }`}
        >
          <div className="relative">
            <UserSearch className={`w-5 h-5 transition-transform ${activeTab === 'donors' ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
          </div>
          <span className={`text-xs mt-1 transition-all ${activeTab === 'donors' ? 'font-extrabold text-[#C41E3A]' : 'font-medium'}`}>
            {t.nav.donors}
          </span>
          {activeTab === 'donors' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#C41E3A] mt-0.5 animate-in fade-in zoom-in" />
          )}
        </button>

        {/* Tab 5: Profile */}
        <button
          onClick={() => onTabChange('profile')}
          aria-label={t.nav.profile}
          className={`flex flex-col items-center justify-center h-12 w-14 rounded-2xl transition-all active:scale-90 cursor-pointer ${
            activeTab === 'profile'
              ? 'text-[#C41E3A]'
              : 'text-[#6B7280] hover:text-[#1B1B1F]'
          }`}
        >
          <div className="relative">
            <User className={`w-5 h-5 transition-transform ${activeTab === 'profile' ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
          </div>
          <span className={`text-xs mt-1 transition-all ${activeTab === 'profile' ? 'font-extrabold text-[#C41E3A]' : 'font-medium'}`}>
            {t.nav.profile}
          </span>
          {activeTab === 'profile' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#C41E3A] mt-0.5 animate-in fade-in zoom-in" />
          )}
        </button>
      </div>
    </nav>
  );
};
