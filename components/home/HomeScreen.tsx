'use client';

import React, { useState } from 'react';
import {
  Droplet,
  ArrowRight,
  Clock,
  Check,
  Building,
  Heart,
  ChevronRight,
  X,
  Phone,
  Send,
  AlertCircle,
  Truck,
  BookOpen,
  LayoutDashboard,
  ShieldCheck,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Zap,
  MapPin,
  Plus,
} from 'lucide-react';
import { EmergencyRequest, DonationCamp } from '@/lib/types';
import { toBengaliDigits } from '@/lib/bengali-utils';
import { BloodAnalyticsCharts } from '@/components/analytics/BloodAnalyticsCharts';
import { GiveGiftOfLifeHero } from './GiveGiftOfLifeHero';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface HomeScreenProps {
  nearbyRequests: EmergencyRequest[];
  camps: DonationCamp[];
  onRequestBloodClick: () => void;
  onViewMyRequestsClick: () => void;
  onViewAllRequestsClick: () => void;
  onViewAllCampsClick: () => void;
  isDonorAvailable: boolean;
  onToggleDonorAvailable: () => void;
  onOpenDonorResponse: (req: EmergencyRequest) => void;
  activeRequestCount: number;
  onRsvpCamp: (campId: string) => void;
  onOpenCreateCamp?: () => void;
  onOpenHospitalDirectory: () => void;
  onOpenAmbulanceDirectory: () => void;
  onOpenHealthEducation: () => void;
  onOpenHospitalDashboard: () => void;
  onOpenDonorSetup: () => void;
  isProfileComplete?: boolean;
  onOpenVerificationExplainer: () => void;
  userName?: string;
  userRole?: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  nearbyRequests,
  camps,
  onRequestBloodClick,
  onViewMyRequestsClick,
  onViewAllRequestsClick,
  onViewAllCampsClick,
  isDonorAvailable,
  onToggleDonorAvailable,
  onOpenDonorResponse,
  activeRequestCount,
  onRsvpCamp,
  onOpenCreateCamp,
  onOpenHospitalDirectory,
  onOpenAmbulanceDirectory,
  onOpenHealthEducation,
  onOpenHospitalDashboard,
  onOpenDonorSetup,
  isProfileComplete = true,
  onOpenVerificationExplainer,
  userName,
  userRole = 'donor',
}) => {
  const { language, t, formatDigits } = useLanguage();
  const [showActiveBanner, setShowActiveBanner] = useState(true);
  const [showHealthTip, setShowHealthTip] = useState(true);
  const [showIncompleteNotice, setShowIncompleteNotice] = useState(!isProfileComplete);

  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(true);

  // Desktop Live Demand vs Supply Strip data
  const desktopDemandSupply = [
    { group: 'O+', demand: 48, supply: 42, isCritical: false, percent: 88, waitTime: language === 'bn' ? '১২ মি.' : '12m' },
    { group: 'B+', demand: 58, supply: 51, isCritical: false, percent: 88, waitTime: language === 'bn' ? '৯ মি.' : '9m' },
    { group: 'A+', demand: 38, supply: 34, isCritical: false, percent: 89, waitTime: language === 'bn' ? '১৪ মি.' : '14m' },
    { group: 'AB+', demand: 24, supply: 27, isCritical: false, percent: 112, waitTime: language === 'bn' ? '৮ মি.' : '8m' },
    { group: 'O-', demand: 22, supply: 8, isCritical: true, percent: 36, waitTime: language === 'bn' ? '৪৫ মি.' : '45m' },
    { group: 'B-', demand: 16, supply: 7, isCritical: true, percent: 43, waitTime: language === 'bn' ? '৩৫ মি.' : '35m' },
    { group: 'A-', demand: 14, supply: 6, isCritical: true, percent: 42, waitTime: language === 'bn' ? '৪০ মি.' : '40m' },
    { group: 'AB-', demand: 9, supply: 4, isCritical: true, percent: 44, waitTime: language === 'bn' ? '৫০ মি.' : '50m' },
  ];

  const isOperator = userRole === 'hospital_operator' || userRole === 'admin';

  return (
    <div className="flex flex-col w-full max-w-lg md:max-w-none mx-auto px-3 sm:px-4 md:px-0 space-y-4 md:space-y-6 pb-24 pt-2">
      {/* Profile Incomplete Reminder Card: Compact & Dismissible */}
      {showIncompleteNotice && (
        <div className="w-full bg-[#D9E2FF]/30 border border-[#D9E2FF] rounded-2xl px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2 shadow-xs transition-all">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0D58C9] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {formatDigits('2/4')}
            </div>
            <div className="truncate">
              <span className="font-bold text-xs text-[#001946] inline-block mr-1 sm:mr-2">
                {language === 'bn' ? 'প্রোফাইল সম্পূর্ণ করুন (২/৪)' : 'Complete Profile (2/4)'}
              </span>
              <span className="text-xs text-[#5B5F6B] hidden sm:inline">
                {language === 'bn' ? '— ব্লাড গ্রুপ ও এলাকা নিশ্চিত করে ভেরিফাইড হন' : '— verify blood group and area'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenDonorSetup}
              className="px-2.5 py-1 rounded-lg bg-[#0D58C9] hover:bg-[#094196] text-white text-xs font-bold shadow-2xs cursor-pointer transition-colors"
            >
              {language === 'bn' ? 'সম্পূর্ণ করুন' : 'Complete'}
            </button>
            <button
              onClick={() => setShowIncompleteNotice(false)}
              aria-label={t.common.close}
              className="p-1 rounded-lg text-[#5B5F6B] hover:text-[#001946] hover:bg-black/5 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Primary "Give the Gift of Life" Hero Banner (User Reference Style) */}
      <GiveGiftOfLifeHero
        onFindBloodDrive={() => {
          const el = document.getElementById('donation-camps-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          } else {
            onViewAllCampsClick();
          }
        }}
        onRegisterDonor={onOpenDonorSetup}
        onRequestBlood={onRequestBloodClick}
        isLoggedIn={Boolean(userName)}
      />

      {/* Live Regional Blood Pulse & Speedometer Glanceable Bar */}
      <div className="w-full bg-white rounded-3xl p-3.5 sm:p-4 shadow-xs border border-[#E4E6EB]/80 grid grid-cols-3 gap-2 divide-x divide-[#E4E6EB]/60">
        <div className="flex flex-col items-center text-center px-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#0B7A50] mb-0.5">
            <span className="w-2 h-2 rounded-full bg-[#0B7A50] animate-pulse" />
            <span>{t.home.pulseFulfillment}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[17px] sm:text-xl font-black text-[#1B1B1F] tracking-tight">
              {formatDigits('94.8%')}
            </span>
            <span className="text-[9px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-200">
              {language === 'bn' ? 'ডেমো' : 'Demo'}
            </span>
          </div>
          <span className="text-[9.5px] sm:text-[10px] text-[#5B5F6B] mt-0.5">
            {t.home.pulseFulfillmentSub}
          </span>
        </div>

        <div className="flex flex-col items-center text-center px-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#C41E3A] mb-0.5">
            <Zap className="w-3 h-3 fill-[#C41E3A]" />
            <span>{t.home.pulseAvgSpeed}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[17px] sm:text-xl font-black text-[#1B1B1F] tracking-tight">
              {formatDigits('7.4')} {language === 'bn' ? 'মিনিট' : 'mins'}
            </span>
            <span className="text-[9px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-200">
              {language === 'bn' ? 'প্রাক্কলিত' : 'Est.'}
            </span>
          </div>
          <span className="text-[9.5px] sm:text-[10px] text-[#5B5F6B] mt-0.5">
            {t.home.pulseAvgSpeedSub}
          </span>
        </div>

        <div className="flex flex-col items-center text-center px-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#1D5FD0] mb-0.5">
            <Heart className="w-3 h-3 fill-[#1D5FD0]" />
            <span>{t.home.pulseReadyDonors}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[17px] sm:text-xl font-black text-[#1B1B1F] tracking-tight">
              {formatDigits(62)} {language === 'bn' ? 'জন' : 'Donors'}
            </span>
            <span className="text-[9px] bg-[#E8F5E9] text-[#005938] font-bold px-1.5 py-0.5 rounded border border-[#C8E6C9]">
              {language === 'bn' ? 'লাইভ' : 'Live'}
            </span>
          </div>
          <span className="text-[9.5px] sm:text-[10px] text-[#0B7A50] font-bold mt-0.5">
            {t.home.pulseReadyDonorsSub}
          </span>
        </div>
      </div>

      {/* Hero Section: Welcome & Donor Status (Left) + Primary Action (Right on Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 md:gap-4 items-stretch">
        {/* 1. Welcome & Donor Status Card */}
        <div className="md:col-span-7 bg-white rounded-2xl p-4 md:p-5 shadow-xs border border-[#E4E6EB]/60 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="text-[13px] text-[#5B5F6B] font-medium block">
                {userName
                  ? (language === 'bn' ? `স্বাগতম, ${userName}` : `Welcome, ${userName}`)
                  : t.home.welcomeGuest}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    isDonorAvailable ? 'bg-[#0B7A50]' : 'bg-[#5B5F6B]'
                  }`}
                />
                <span className="font-bold text-[17px] md:text-[18px] text-[#1B1B1F] leading-tight">
                  {isDonorAvailable ? t.home.statusReady : t.home.statusResting}
                </span>
              </div>
            </div>

            {/* Interactive Toggle Switch */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <button
                onClick={onToggleDonorAvailable}
                aria-checked={isDonorAvailable}
                aria-label={t.home.toggleStatus}
                role="switch"
                className={`w-12 h-7 rounded-full p-0.5 flex items-center transition-colors duration-200 cursor-pointer shadow-inner ${
                  isDonorAvailable ? 'bg-[#0B7A50]' : 'bg-[#E4E1E7]'
                }`}
              >
                <span
                  className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 flex items-center justify-center ${
                    isDonorAvailable ? 'translate-x-5' : 'translate-x-0'
                  }`}
                >
                  {isDonorAvailable ? (
                    <Check className="w-3.5 h-3.5 text-[#0B7A50] stroke-[3]" />
                  ) : (
                    <span className="w-2 h-0.5 bg-[#5B5F6B] rounded-full" />
                  )}
                </span>
              </button>
              <span
                className={`text-[11px] font-semibold tracking-wide ${
                  isDonorAvailable ? 'text-[#0B7A50]' : 'text-[#5B5F6B]'
                }`}
              >
                {isDonorAvailable ? t.home.available : t.home.restingState}
              </span>
            </div>
          </div>

          {/* Small Notice / Caption */}
          <div className="mt-4 pt-3 border-t border-[#E4E6EB]/50 flex items-center justify-between text-[#5B5F6B] text-[12px]">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-[#0B7A50] shrink-0" />
              <span>
                {language === 'bn'
                  ? 'পরবর্তী রক্তদানের যোগ্যতা অর্জন করেছেন ১৫ দিন আগে।'
                  : 'Achieved donation eligibility 15 days ago.'}
              </span>
            </span>
            <span className="hidden sm:inline text-[#1D5FD0] font-semibold cursor-pointer" onClick={onOpenDonorSetup}>
              {t.home.viewDetails}
            </span>
          </div>
        </div>

        {/* 2. Hero Primary Action Button */}
        <div className="md:col-span-5 bg-white rounded-2xl p-4 md:p-5 shadow-xs border border-[#E4E6EB]/60 flex flex-col justify-between gap-3">
          <div>
            <span className="text-[12px] font-bold text-[#C41E3A] uppercase tracking-wider block">
              {t.home.emergencyHeadline}
            </span>
            <p className="text-[13px] text-[#5B5F6B] mt-0.5 leading-snug">
              {t.home.emergencySubtitle}
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={onRequestBloodClick}
              className="w-full h-[52px] bg-[#C41E3A] hover:bg-[#A3182F] text-white rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(196,30,58,0.25)] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Droplet className="w-5 h-5 fill-current" />
              <span>{t.home.btnRequestBlood}</span>
            </button>

            <button
              onClick={onViewMyRequestsClick}
              className="w-full inline-flex items-center justify-center gap-1 text-[13px] text-[#C41E3A] font-semibold hover:underline cursor-pointer py-1"
            >
              <span>{t.home.btnMyRequests}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Live Alert / Ongoing Request Strip */}
      {showActiveBanner && activeRequestCount > 0 && (
        <div className="w-full bg-[#FDECEF] border border-[#FFDADA] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0 cursor-pointer flex-1" onClick={onViewMyRequestsClick}>
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C41E3A] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C41E3A]" />
            </span>
            <p className="text-[13px] md:text-sm text-[#9E0027] font-medium leading-relaxed truncate sm:whitespace-normal">
              {language === 'bn' ? 'আপনার একটি চলমান অনুরোধ সক্রিয় আছে:' : 'Active emergency request in progress:'}{' '}
              <strong className="font-extrabold text-[14px]">B+</strong>{' '}
              ({language === 'bn' ? 'শহীদ জিয়াউর রহমান মেডিকেল কলেজ' : 'SZMCH Hospital'}) •{' '}
              <span className="underline font-bold text-[#C41E3A]">
                {language === 'bn' ? '২ জন ডোনার' : '2 donors'}
              </span>{' '}
              {language === 'bn' ? 'সাড়া দিয়েছেন।' : 'have responded.'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onViewMyRequestsClick}
              className="text-xs font-bold text-[#C41E3A] hover:underline hidden sm:inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <span>{t.home.trackRequest}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowActiveBanner(false)}
              aria-label={t.common.close}
              className="text-[#5B5F6B] hover:text-[#9E0027] transition-colors p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Role-based Quick Access Utility Bar */}
      <div className={`grid ${isOperator ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'} gap-2 md:gap-3`}>
        <button
          onClick={onOpenHospitalDirectory}
          className="bg-white hover:bg-[#FDECEF] p-3 rounded-2xl border border-[#E4E6EB]/70 flex flex-col items-center text-center transition-all shadow-xs active:scale-95 cursor-pointer interactive-card group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <Building className="w-4.5 h-4.5" />
          </div>
          <span className="text-xs font-bold text-[#1B1B1F] leading-tight">{t.home.quickStock}</span>
          <span className="hidden sm:inline text-xs text-[#5B5F6B] mt-0.5">{t.home.quickStockSub}</span>
        </button>

        <button
          onClick={onOpenAmbulanceDirectory}
          className="bg-white hover:bg-[#FDECEF] p-3 rounded-2xl border border-[#E4E6EB]/70 flex flex-col items-center text-center transition-all shadow-xs active:scale-95 cursor-pointer interactive-card group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] text-[#0B7A50] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <Truck className="w-4.5 h-4.5" />
          </div>
          <span className="text-xs font-bold text-[#1B1B1F] leading-tight">{t.home.quickAmbulance}</span>
          <span className="hidden sm:inline text-xs text-[#5B5F6B] mt-0.5">{t.home.quickAmbulanceSub}</span>
        </button>

        <button
          onClick={onOpenHealthEducation}
          className="bg-white hover:bg-[#FDECEF] p-3 rounded-2xl border border-[#E4E6EB]/70 flex flex-col items-center text-center transition-all shadow-xs active:scale-95 cursor-pointer interactive-card group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#E3F2FD] text-[#1D5FD0] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <BookOpen className="w-4.5 h-4.5" />
          </div>
          <span className="text-xs font-bold text-[#1B1B1F] leading-tight">{t.home.quickHealthEd}</span>
          <span className="hidden sm:inline text-xs text-[#5B5F6B] mt-0.5">{t.home.quickHealthEdSub}</span>
        </button>

        {/* Hospital Dashboard is role-based: only visible to hospital operators / admins */}
        {isOperator && (
          <button
            onClick={onOpenHospitalDashboard}
            className="bg-white hover:bg-[#FFF8E1] p-3 rounded-2xl border border-amber-200 flex flex-col items-center text-center transition-all shadow-xs active:scale-95 cursor-pointer interactive-card group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FFF8E1] text-[#9A5B00] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <LayoutDashboard className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-bold text-[#1B1B1F] leading-tight">{t.home.quickDashboard}</span>
            <span className="hidden sm:inline text-xs text-[#5B5F6B] mt-0.5">{t.home.quickDashboardSub}</span>
          </button>
        )}
      </div>

      {/* Desktop-Native Regional Demand vs Supply Live Data Strip (Visible on Desktop lg+) */}
      <div className="hidden lg:block w-full bg-white rounded-3xl p-5 shadow-xs border border-[#E4E6EB]/80 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1B1B1F] leading-tight">
                {language === 'bn' ? 'আজকের রক্তের চাহিদা বনাম সরবরাহ (লাইভ সিন্ডিকেট)' : "Today's Demand vs Supply (Live Syndicate)"}
              </h3>
              <p className="text-xs text-[#5B5F6B]">
                {language === 'bn' ? 'আঞ্চলিক হাসপাতাল ও ব্লাড ব্যাংকের রিয়েল-টাইম মেট্রিক্স' : 'Real-time hospital & blood bank syndicate metrics'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#005938]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00744B] animate-pulse" />
              {language === 'bn' ? 'সক্রিয় মনিটরিং' : 'Active Monitoring'}
            </span>
          </div>
        </div>

        {/* 8 Blood Groups Horizontal Strip */}
        <div className="grid grid-cols-4 xl:grid-cols-8 gap-2.5">
          {desktopDemandSupply.map((item) => (
            <div
              key={item.group}
              className={`p-3 rounded-2xl border transition-all text-center interactive-card ${
                item.isCritical
                  ? 'bg-[#FFDAD6]/30 border-[#FFDAD6] text-[#BA1A1A]'
                  : 'bg-[#F7F7F9] border-[#E4E6EB] text-[#1B1B1F]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-extrabold text-sm">{item.group}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  item.isCritical ? 'bg-[#FFDAD6] text-[#BA1A1A]' : 'bg-[#E8F5E9] text-[#005938]'
                }`}>
                  {item.isCritical ? (language === 'bn' ? 'সংকট' : 'Crit') : (language === 'bn' ? 'স্বাভাবিক' : 'Good')}
                </span>
              </div>
              <div className="space-y-1 text-left">
                <div className="flex justify-between text-[11px] text-[#5B5F6B]">
                  <span>{language === 'bn' ? 'চাহিদা' : 'Req'}: <strong className="text-[#1B1B1F]">{formatDigits(item.demand)}</strong></span>
                  <span>{language === 'bn' ? 'মজুদ' : 'Stock'}: <strong className="text-[#1B1B1F]">{formatDigits(item.supply)}</strong></span>
                </div>
                {/* Mini progress bar */}
                <div className="w-full h-1.5 bg-[#E4E6EB] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.isCritical ? 'bg-[#BA1A1A]' : 'bg-[#00744B]'
                    }`}
                    style={{ width: `${Math.min(item.percent, 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-[#5B5F6B] text-center pt-0.5">
                  {language === 'bn' ? `অপেক্ষা: ${item.waitTime}` : `Wait: ${item.waitTime}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Embedded Live Blood Analytics & Demand Charts Section (User explicitly requested rich data presentation) */}
      <section className="w-full">
        <BloodAnalyticsCharts />
      </section>

      {/* 4. Emergency Requests Nearby (Section 9) */}
      <section className="w-full space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-[18px] text-[#1B1B1F]">{t.home.nearbyRequestsTitle}</h2>
            <span className="w-2 h-2 rounded-full bg-[#C41E3A]" />
          </div>
          <button
            onClick={onViewAllRequestsClick}
            className="text-xs sm:text-[13px] text-[#C41E3A] font-semibold hover:underline cursor-pointer"
          >
            {language === 'bn'
              ? `সব দেখুন (${toBengaliDigits(nearbyRequests.length + 1)})`
              : `View All (${nearbyRequests.length + 1})`}
          </button>
        </div>

        {/* Desktop xl:grid-cols-2 layout as requested */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3.5 md:gap-4">
          {nearbyRequests.slice(0, 4).map((req) => {
            const isUrgentNow = req.urgency === 'now';
            return (
              <article
                key={req.id}
                className="w-full bg-white rounded-2xl p-4 shadow-xs border border-[#E4E6EB]/70 flex flex-col justify-between gap-3 interactive-card group"
              >
                <div className="flex items-start gap-3">
                  {/* 1. Blood Group Badge */}
                  <div
                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-xs font-extrabold text-[22px] leading-none ${
                      isUrgentNow
                        ? 'bg-[#C41E3A] text-white'
                        : 'bg-[#FDECEF] text-[#C41E3A]'
                    }`}
                  >
                    <span>{req.bloodGroup}</span>
                  </div>

                  {/* 2. Hospital & Urgency Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-bold text-[15px] text-[#1B1B1F] leading-tight line-clamp-1 group-hover:text-[#C41E3A] transition-colors">
                        {req.hospitalName}
                      </h3>
                      {/* Urgency Badge */}
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold ${
                          isUrgentNow
                            ? 'bg-[#FFDAD6] text-[#BA1A1A]'
                            : 'bg-amber-100 text-[#9A5B00]'
                        }`}
                      >
                        {isUrgentNow ? t.home.urgencyNow : (req.urgency === 'today' ? t.home.urgencyToday : t.home.urgencyScheduled)}
                      </span>
                    </div>

                    <div
                      onClick={onOpenVerificationExplainer}
                      className="flex items-center gap-1 mt-1 text-[#1D5FD0] cursor-pointer hover:underline"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span className="text-xs font-semibold">
                        {req.hasVerifiedHospital
                          ? (language === 'bn' ? 'যাচাইকৃত হাসপাতাল' : 'Verified Hospital')
                          : (language === 'bn' ? 'যাচাইকৃত কেস' : 'Verified Case')}
                      </span>
                    </div>

                    {/* 3. Distance & 4. Bags Needed */}
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#5B5F6B]">
                      <span className="inline-flex items-center gap-1 font-semibold text-[#1B1B1F]">
                        <MapPin className="w-3 h-3 text-[#C41E3A]" />
                        {formatDigits(req.distanceKm)} {language === 'bn' ? 'কিমি দূরে' : 'km away'}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 font-bold text-[#C41E3A]">
                        <Droplet className="w-3 h-3 fill-current" />
                        {formatDigits(req.bagsNeeded)} {language === 'bn' ? 'ব্যাগ প্রয়োজন' : 'bags needed'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Row: 5. Countdown & 6. Respond Button */}
                <div className="pt-2.5 border-t border-[#E4E6EB]/50 flex items-center justify-between gap-2">
                  <span className="text-xs text-[#5B5F6B] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#E89A00]" />
                    <span className="font-semibold text-[#9A5B00]">{req.timeTarget}</span>
                    <span className="opacity-70">({req.createdAt})</span>
                  </span>
                  <button
                    onClick={() => onOpenDonorResponse(req)}
                    className="h-9 px-4 bg-[#C41E3A] hover:bg-[#A3182F] text-white rounded-xl font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer focus-ring"
                  >
                    {language === 'bn' ? 'সাড়া দিন' : 'Respond'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 5. Upcoming Blood Donation Camps (Desktop xl:grid-cols-3) */}
      <section id="donation-camps-section" className="w-full space-y-3 pt-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="font-bold text-[18px] text-[#1B1B1F]">{t.home.donationCampsTitle}</h2>
          <div className="flex items-center gap-2">
            {onOpenCreateCamp && (
              <button
                onClick={onOpenCreateCamp}
                className="px-2.5 py-1 rounded-xl bg-[#FDECEF] hover:bg-[#FCD8DF] text-[#C41E3A] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ক্যাম্পেইন যোগ করুন' : 'Add Camp'}</span>
              </button>
            )}
            <button
              onClick={onViewAllCampsClick}
              className="text-xs sm:text-[13px] text-[#C41E3A] font-semibold hover:underline cursor-pointer"
            >
              {language === 'bn' ? 'সব দেখুন' : 'View All'}
            </button>
          </div>
        </div>

        {/* Responsive Camps: Scrollable on mobile, xl:grid-cols-3 on desktop */}
        <div className="flex md:grid md:grid-cols-2 xl:grid-cols-3 gap-3.5 md:gap-4 overflow-x-auto md:overflow-visible pb-2 -mx-3 px-3 md:mx-0 md:px-0 no-scrollbar snap-x snap-mandatory">
          {camps.map((camp) => (
            <div
              key={camp.id}
              className="min-w-[270px] max-w-[280px] md:min-w-0 md:max-w-none bg-white rounded-2xl p-4 shadow-xs border border-[#E4E6EB]/60 snap-start flex flex-col justify-between shrink-0 interactive-card"
            >
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="px-2.5 py-1.5 bg-[#FDECEF] rounded-xl text-center shrink-0">
                    <span className="block text-[16px] font-extrabold text-[#C41E3A] leading-none">
                      {formatDigits(camp.dateDay)}
                    </span>
                    <span className="block text-xs text-[#9E0027] font-semibold mt-0.5">
                      {camp.dateMonth}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs text-[#5B5F6B] block truncate">
                      {camp.time}
                    </span>
                    <span className="text-[15px] text-[#1B1B1F] font-bold leading-snug line-clamp-1">
                      {camp.organizer}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[#5B5F6B]">
                  <Building className="w-4 h-4 shrink-0 text-[#5B5F6B]" />
                  <span className="text-xs truncate">{camp.venue}</span>
                </div>
              </div>

              <button
                onClick={() => onRsvpCamp(camp.id)}
                className={`mt-3 w-full h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-98 cursor-pointer focus-ring ${
                  camp.isRsvp
                    ? 'bg-[#0B7A50] text-white shadow-xs'
                    : 'bg-[#F0EDF2] text-[#1B1B1F] hover:bg-[#FDECEF] hover:text-[#C41E3A]'
                }`}
              >
                {camp.isRsvp ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{language === 'bn' ? 'অংশগ্রহণ নিশ্চিত' : 'Registered ✓'}</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    <span>
                      {language === 'bn' ? 'অংশ নেব' : 'Will Attend'} ({formatDigits(camp.registeredCount)})
                    </span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Community Impact Strip & Health Tip: Stack on mobile, 2 columns on tablet/desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-stretch">
        {/* Community Impact Strip */}
        <div className="w-full bg-[#F6F2F8] border border-[#E4E6EB]/50 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center shrink-0 shadow-xs">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] text-[#1B1B1F] font-bold leading-tight">
              {language === 'bn' ? (
                <>
                  এই মাসে আপনার এলাকায়{' '}
                  <span className="text-[#C41E3A] font-extrabold text-[16px]">১৪টি</span> পরিবার রক্ত পেয়েছে
                </>
              ) : (
                <>
                  In your area,{' '}
                  <span className="text-[#C41E3A] font-extrabold text-[16px]">14</span> families received blood this month
                </>
              )}
            </p>
            <p className="text-[12px] text-[#5B5F6B] mt-0.5">
              {language === 'bn'
                ? 'প্রতিটি ফোঁটা রক্তে নতুন জীবনের শুরু • যাচাইকৃত ডেটা'
                : 'Every drop is a new beginning • Verified humanitarian data'}
            </p>
          </div>
        </div>

        {/* 7. Health Tip Card */}
        {showHealthTip && (
          <div className="w-full bg-white rounded-2xl p-4 shadow-xs border border-[#E4E6EB]/60 relative transition-all">
            <button
              onClick={() => setShowHealthTip(false)}
              aria-label={t.common.close}
              className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center rounded-full text-[#5B5F6B] hover:bg-[#F7F7F9] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3 pr-6">
              <div className="w-9 h-9 rounded-full bg-[#D9E2FF] text-[#1D5FD0] flex items-center justify-center shrink-0">
                <Droplet className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-[#1D5FD0] uppercase tracking-wider block">
                  {language === 'bn' ? 'স্বাস্থ্য বার্তা' : 'Health Tip'}
                </span>
                <p className="text-[13px] text-[#1B1B1F] mt-0.5 leading-snug">
                  {language === 'bn'
                    ? 'রক্তদানের আগে প্রচুর পানি পান করুন এবং হালকা পুষ্টিকর খাবার খেয়ে আসুন।'
                    : 'Drink plenty of water and have a healthy light meal before donating blood.'}
                </p>
                <button
                  onClick={onOpenHealthEducation}
                  className="inline-flex items-center gap-0.5 text-[12px] text-[#1D5FD0] font-bold mt-1.5 hover:underline cursor-pointer"
                >
                  <span>{language === 'bn' ? 'আরও টিপস পড়ুন' : 'Read more tips'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 8. App Overview & Humanitarian Mission Card (Target for 'অ্যাপ পরিচয়') */}
      <section
        id="app-info-section"
        className="w-full bg-white rounded-3xl p-5 md:p-6 shadow-xs border border-[#E4E6EB]/80 space-y-4"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E6EB]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#9E0027] to-[#C41E3A] flex items-center justify-center text-white shadow-xs shrink-0">
              <Droplet className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-extrabold text-[17px] text-[#1B1B1F]">
                {language === 'bn'
                  ? 'রক্তদাতা — মানবিক ও নির্ভরযোগ্য রক্তদান প্ল্যাটফর্ম'
                  : 'Roktodata — Humanitarian & Trusted Blood Platform'}
              </h3>
              <p className="text-xs text-[#5B5F6B]">
                {language === 'bn'
                  ? '১০০% অলাভজনক, নিরাপদ ও স্বেচ্ছাসেবী উদ্যোগ'
                  : '100% Non-profit, Secure & Voluntary Humanitarian Initiative'}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#E8F5E9] text-[#166534] text-xs font-bold border border-[#BBF7D0]">
            {language === 'bn' ? 'সংস্করণ ১.০ • মোবাইল অপ্টিমাইজড' : 'Version 1.0 • Mobile Optimized'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 bg-[#F7F7F9] rounded-2xl border border-[#E4E6EB]/50 space-y-1">
            <span className="font-bold text-[#C41E3A] block">
              {language === 'bn' ? '১. গতিই সেবা' : '1. Speed Saves Lives'}
            </span>
            <p className="text-[#5B5F6B] leading-relaxed">
              {language === 'bn'
                ? 'জরুরি মুহূর্তে সর্বোচ্চ ৩ ধাপে ৬০ সেকেন্ডের মধ্যে রক্তের আবেদন তৈরি ও ডোনারদের কাছে পৌঁছে দেওয়া।'
                : 'Publish emergency blood requests in 3 quick steps within 60 seconds to nearby donors.'}
            </p>
          </div>

          <div className="p-3 bg-[#F7F7F9] rounded-2xl border border-[#E4E6EB]/50 space-y-1">
            <span className="font-bold text-[#0D58C9] block">
              {language === 'bn' ? '২. আগে আস্থা ও নিরাপত্তা' : '2. Trust & Privacy First'}
            </span>
            <p className="text-[#5B5F6B] leading-relaxed">
              {language === 'bn'
                ? 'ভেরিফায়েড রক্তদাতা, গোপনীয় ফোন নম্বর ও হাসপাতাল ভিত্তিক ভৌগোলিক অবস্থান সমন্বয়।'
                : 'Verified donors, protected phone numbers, and geo-fenced hospital matches.'}
            </p>
          </div>

          <div className="p-3 bg-[#F7F7F9] rounded-2xl border border-[#E4E6EB]/50 space-y-1">
            <span className="font-bold text-[#166534] block">
              {language === 'bn' ? '৩. সম্পূর্ণ বিনামূল্যে' : '3. 100% Free & Voluntary'}
            </span>
            <p className="text-[#5B5F6B] leading-relaxed">
              {language === 'bn'
                ? 'রক্ত কেনাবেচা আইনত দণ্ডনীয় অপরাধ। পারস্পরিক সহানুভূতি ও স্বেচ্ছাশ্রমে জীবন রক্ষা করাই আমাদের ব্রত।'
                : 'Trading blood for money is illegal. Selfless humanity and compassion is our core mission.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
