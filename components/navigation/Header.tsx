'use client';

import React, { useState } from 'react';
import { MapPin, ChevronDown, Bell, User, Droplet, Plus, Building2 } from 'lucide-react';
import { NavTab } from './BottomNav';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { DistrictSelectorModal } from '@/components/location/DistrictSelectorModal';

interface HeaderProps {
  currentDistrict: string;
  onDistrictChange: (district: string) => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
  userAvatarUrl?: string;
  donorName?: string;
  activeTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
  onRequestBloodClick?: () => void;
  onOpenHospitalDirectory?: () => void;
  donorBloodGroup?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentDistrict,
  onDistrictChange,
  unreadCount,
  onOpenNotifications,
  onOpenProfile,
  onOpenAuth,
  isLoggedIn,
  userAvatarUrl,
  donorName = 'রক্তদাতা',
  activeTab = 'home',
  onTabChange,
  onRequestBloodClick,
  onOpenHospitalDirectory,
  donorBloodGroup = '',
}) => {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-b border-[#E4E6EB]/70 shadow-xs">
        {/* Responsive, strictly bounded container with zero horizontal overflow */}
        <div className="h-14 md:h-16 w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-2.5 sm:px-4 md:px-3 lg:px-6 2xl:px-8 flex items-center justify-between gap-1.5 sm:gap-2 md:gap-2.5">
          
          {/* ================= LEFT AREA: BRAND & DISTRICT ================= */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
            {/* Brand Logo & Name */}
            <div
              className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group shrink-0"
              onClick={() => {
                if (onTabChange) onTabChange('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <div className="w-8 h-8 md:w-8.5 md:h-8.5 rounded-full bg-gradient-to-tr from-[#9E0027] to-[#C41E3A] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <Droplet className="w-4 h-4 md:w-4.5 md:h-4.5 text-white fill-current" />
              </div>
              <span className="font-bold text-[16px] sm:text-[18px] md:text-[19px] text-[#C41E3A] tracking-tight leading-none block whitespace-nowrap">
                {t.common.appName}
              </span>
            </div>

            {/* Subtle Divider on Tablet & Desktop */}
            <div className="hidden sm:block h-4 md:h-5 w-px bg-[#E4E6EB] shrink-0" />

            {/* District / Location selector pill */}
            <button
              onClick={() => setIsLocationOpen(true)}
              aria-label={t.nav.switchLocation}
              className="h-8 sm:h-8.5 md:h-9 px-2 sm:px-2.5 flex items-center gap-1 sm:gap-1.5 rounded-full bg-[#F7F7F9] hover:bg-[#F0EDF2] border border-[#E4E6EB]/80 text-[#1B1B1F] active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#C41E3A] shrink-0" />
              <span className="font-semibold text-[11px] sm:text-[12px] text-[#1B1B1F] truncate max-w-[65px] xs:max-w-[75px] sm:max-w-[85px] md:max-w-[90px] lg:max-w-[110px]">
                {currentDistrict}
              </span>
              <ChevronDown className="w-3 h-3 text-[#5B5F6B] shrink-0" />
            </button>
          </div>

          {/* ================= CENTER NAVIGATION LINKS (Visible on Tablet & Desktop) ================= */}
          {onTabChange && (
            <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 xl:gap-2 shrink min-w-0 overflow-hidden justify-center px-1">
              {/* Home */}
              <button
                onClick={() => onTabChange('home')}
                className={`px-2 lg:px-2.5 py-1.5 rounded-full text-xs lg:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'home'
                    ? 'bg-[#FDECEF] text-[#C41E3A]'
                    : 'text-[#5B5F6B] hover:text-[#1B1B1F] hover:bg-[#F7F7F9]'
                }`}
              >
                {t.nav.home}
              </button>

              {/* Requests */}
              <button
                onClick={() => onTabChange('requests')}
                className={`px-2 lg:px-2.5 py-1.5 rounded-full text-xs lg:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'requests'
                    ? 'bg-[#FDECEF] text-[#C41E3A]'
                    : 'text-[#5B5F6B] hover:text-[#1B1B1F] hover:bg-[#F7F7F9]'
                }`}
              >
                <span className="xl:hidden">{t.nav.requests}</span>
                <span className="hidden xl:inline">{t.nav.requestsLong}</span>
              </button>

              {/* Donors Directory */}
              <button
                onClick={() => onTabChange('donors')}
                className={`px-2 lg:px-2.5 py-1.5 rounded-full text-xs lg:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'donors'
                    ? 'bg-[#FDECEF] text-[#C41E3A]'
                    : 'text-[#5B5F6B] hover:text-[#1B1B1F] hover:bg-[#F7F7F9]'
                }`}
              >
                <span className="xl:hidden">{t.nav.donors}</span>
                <span className="hidden xl:inline">{t.nav.donorsLong}</span>
              </button>

              {/* Hospital & Blood Bank (Visible on xl and up only to prevent crowding) */}
              {onOpenHospitalDirectory && (
                <button
                  onClick={onOpenHospitalDirectory}
                  className="hidden xl:flex px-2.5 py-1.5 rounded-full text-xs lg:text-sm font-semibold whitespace-nowrap text-[#5B5F6B] hover:text-[#1B1B1F] hover:bg-[#F7F7F9] transition-all items-center gap-1 cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#5B5F6B] shrink-0" />
                  <span className="2xl:hidden">{language === 'bn' ? 'হাসপাতাল' : 'Hospitals'}</span>
                  <span className="hidden 2xl:inline">{t.nav.hospitals}</span>
                </button>
              )}
            </nav>
          )}

          {/* ================= RIGHT ACTION BUTTONS (ALWAYS VISIBLE & GUARANTEED FIT) ================= */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
            {/* Quick Emergency Request CTA (Responsive size) */}
            {onRequestBloodClick && (
              <button
                onClick={onRequestBloodClick}
                className="hidden sm:flex items-center gap-1 px-2.5 lg:px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#9E0027] to-[#C41E3A] text-white text-xs lg:text-sm font-bold shadow-xs hover:shadow-md active:scale-95 transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span className="xl:hidden">{language === 'bn' ? 'রক্ত চাই' : 'Request'}</span>
                <span className="hidden xl:inline">{language === 'bn' ? 'জরুরি রক্ত চাই' : 'Request Blood'}</span>
              </button>
            )}

            {/* Language Switcher Pill - Universal on Mobile & Desktop */}
            <button
              onClick={toggleLanguage}
              aria-label={language === 'bn' ? 'Switch to English' : 'বাংলা ভাষায় পরিবর্তন করুন'}
              className="h-8 px-2.5 rounded-full bg-[#F0EDF2] hover:bg-[#E4E6EB] text-[11px] font-black text-[#1B1B1F] flex items-center justify-center transition-all cursor-pointer border border-[#E4E6EB]/80 active:scale-95 shrink-0 shadow-2xs"
              title={language === 'bn' ? 'Switch to English' : 'বাংলা ভাষায় পরিবর্তন করুন'}
            >
              <span className={language === 'bn' ? 'text-[#C41E3A]' : 'text-[#8E929E]'}>বাং</span>
              <span className="text-[#C4C7D0] mx-0.5 text-[10px]">/</span>
              <span className={language === 'en' ? 'text-[#C41E3A]' : 'text-[#8E929E]'}>EN</span>
            </button>


            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              aria-label={t.nav.notifications}
              className="w-8 h-8 sm:w-8.5 sm:h-8.5 md:w-9 md:h-9 flex items-center justify-center relative rounded-full text-[#5B5F6B] hover:text-[#C41E3A] hover:bg-[#F7F7F9] active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#C41E3A] ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* User Profile Chip / Login */}
            {isLoggedIn ? (
              <button
                onClick={onOpenProfile}
                aria-label={t.nav.profile}
                className="flex items-center gap-1.5 p-0.5 rounded-full border border-transparent hover:border-[#E4E6EB] hover:bg-[#F7F7F9] active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full overflow-hidden ring-2 ring-[#FDECEF] shrink-0">
                  {userAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={userAvatarUrl}
                      alt="Profile"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#FDECEF] text-[#C41E3A] font-bold text-xs flex items-center justify-center">
                      {donorName ? donorName.charAt(0) : 'র'}
                    </div>
                  )}
                </div>
                <div className="hidden 2xl:flex flex-col text-left leading-tight pr-1">
                  <span className="text-xs font-bold text-[#1B1B1F] truncate max-w-[70px]">
                    {donorName}
                  </span>
                  <span className="text-[10px] text-[#C41E3A] font-semibold">
                    {donorBloodGroup} {t.nav.donorSuffix}
                  </span>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                aria-label={t.nav.login}
                className="h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-full bg-[#9E0027] hover:bg-[#7D001D] text-white text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-transform shrink-0 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.nav.login}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 100% Executive, Mobile-First District & Area Selector Modal */}
      <DistrictSelectorModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        currentDistrict={currentDistrict}
        onSelectDistrict={(newDist) => {
          onDistrictChange(newDist);
          setIsLocationOpen(false);
        }}
      />
    </>
  );
};
