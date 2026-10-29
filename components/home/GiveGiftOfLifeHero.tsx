'use client';

import React from 'react';
import Image from 'next/image';
import { Droplet, Calendar } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface GiveGiftOfLifeHeroProps {
  onFindBloodDrive?: () => void;
  onRegisterDonor?: () => void;
  onRequestBlood?: () => void;
  isLoggedIn?: boolean;
}

export const GiveGiftOfLifeHero: React.FC<GiveGiftOfLifeHeroProps> = ({
  onFindBloodDrive,
  onRegisterDonor,
  onRequestBlood,
  isLoggedIn = false,
}) => {
  const { language, formatDigits } = useLanguage();

  return (
    <section className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-white via-[#FCF9F9] to-[#FDF4F5] border border-red-100 shadow-[0_10px_35px_-5px_rgba(158,0,39,0.07)]">
      {/* Background Decorative Concentric Ripple Rings (as seen in the reference image) */}
      <div className="absolute top-0 left-0 w-80 h-80 sm:w-96 sm:h-96 pointer-events-none opacity-45 overflow-hidden z-0">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full text-[#9E0027]"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
        >
          <circle cx="50" cy="50" r="45" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="85" />
          <circle cx="50" cy="50" r="125" />
          <circle cx="50" cy="50" r="170" strokeDasharray="4 4" />
          <circle cx="50" cy="50" r="220" />
          <circle cx="50" cy="50" r="275" />
          <circle cx="50" cy="50" r="335" />
          <circle cx="50" cy="50" r="400" />
        </svg>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 items-center">
        {/* ================= LEFT CONTENT COLUMN ================= */}
        <div className="md:col-span-7 p-6 sm:p-8 md:p-9 lg:p-11 flex flex-col justify-center space-y-3.5 sm:space-y-4">
          {/* Dual-Tone Headline */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-serif font-black tracking-tight leading-[1.08] text-[#1B1B1F]">
              <span className="text-[#9E0027]">Give </span>
              <span>the</span>
              <br />
              <span>Gift </span>
              <span className="text-[#1B1B1F]">of </span>
              <span className="text-[#9E0027]">Life</span>
            </h1>
            <p className="font-sans text-xs sm:text-sm font-bold text-[#9E0027] tracking-wide pt-1">
              {language === 'bn'
                ? 'রক্ত দিন, বাঁচান একটি অমূল্য মানবজীবন'
                : 'Donate Blood, Save a Precious Life'}
            </p>
          </div>

          {/* Subheading / Description */}
          <div className="space-y-1 max-w-md">
            <p className="text-sm sm:text-base md:text-[16px] text-[#2C2E35] font-medium leading-relaxed">
              {language === 'bn'
                ? 'আপনার সামান্য অবদান আজই কারো জীবন বাঁচাতে পারে।'
                : 'Your contribution can make a lifesaving difference today.'}
            </p>
            <p className="text-xs sm:text-sm text-[#5B5F6B] leading-relaxed">
              {language === 'bn'
                ? 'আপনার মাত্র ১ ব্যাগ রক্ত ৩ জন মুমূর্ষু রোগীর প্রাণ ফিরিয়ে দিতে পারে। আজই এগিয়ে আসুন।'
                : 'Single blood donation can save up to 3 emergency patients. Step forward today.'}
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            {/* Button 1: Solid Crimson Pill */}
            <button
              onClick={onFindBloodDrive || onRequestBlood}
              className="h-11 sm:h-12 px-6 sm:px-7 rounded-full bg-[#9E0027] hover:bg-[#80001F] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(158,0,39,0.3)] hover:shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>{language === 'bn' ? 'রক্তদান ক্যাম্প খুঁজুন' : 'Find a Blood Drive'}</span>
            </button>
          </div>
        </div>

        {/* ================= RIGHT IMAGE & GLASSMORPHISM BADGE COLUMN ================= */}
        <div className="md:col-span-5 relative w-full h-72 sm:h-80 md:h-[440px] lg:h-[480px] overflow-hidden flex items-end justify-center">
          {/* High Resolution Medical Blood Donation Photo */}
          <div className="relative w-full h-full">
            <Image
              src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=1200&auto=format&fit=crop"
              alt="Give the Gift of Life - Blood Donor"
              fill
              loading="eager"
              referrerPolicy="no-referrer"
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
            {/* Smooth Vignette / Gradient Mask Blending with Left Side */}
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-white/95 via-transparent to-transparent md:w-32 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent z-10" />
          </div>

          {/* Floating Glassmorphism Metric Badge (Exact Match: 1 Donation Saves 3 Lives) */}
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:left-4 lg:left-6 z-20 bg-white/85 backdrop-blur-md border border-white/70 shadow-[0_10px_25px_rgba(0,0,0,0.15)] rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center max-w-[170px] sm:max-w-[190px] animate-in fade-in zoom-in-95 duration-500">
            {/* Glossy Red Droplet */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-red-600 to-rose-400 flex items-center justify-center shadow-xs mb-1.5 ring-2 ring-red-100">
              <Droplet className="w-4 h-4 text-white fill-current" />
            </div>
            
            {/* Primary Text */}
            <span className="font-extrabold text-xs sm:text-sm text-[#1B1B1F] leading-tight block">
              {language === 'bn' ? '১টি রক্তদান' : '1 Donation'}
            </span>
            <span className="font-extrabold text-xs sm:text-sm text-[#9E0027] leading-tight block">
              {language === 'bn' ? 'বাঁচায় ৩টি প্রাণ' : 'Saves 3 Lives'}
            </span>
            <span className="text-xs text-[#5B5F6B] mt-0.5 font-medium leading-none">
              {language === 'bn' ? 'মানবিক অঙ্গীকার' : 'Every Drop Counts'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
