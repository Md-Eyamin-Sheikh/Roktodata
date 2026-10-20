'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Droplet,
  Heart,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  Lock,
  UserCheck,
  Check,
  Building,
  Phone,
  Compass,
  AlertCircle
} from 'lucide-react';
import { toBengaliDigits } from '@/lib/bengali-utils';

export type UserRoleChoice = 'donor' | 'recipient';

interface OnboardingSequenceProps {
  onComplete: (role: UserRoleChoice) => void;
  onSkip: () => void;
  onClose: () => void;
  onOpenPhoneAuth?: (role: UserRoleChoice) => void;
}

export const OnboardingSequence: React.FC<OnboardingSequenceProps> = ({
  onComplete,
  onSkip,
  onClose,
  onOpenPhoneAuth,
}) => {
  // Slides: 0: Hope & Blood, 1: Proximity & Nearby Donors, 2: Privacy & Control, 3: Role Preference Choice
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [selectedRole, setSelectedRole] = useState<UserRoleChoice>('donor');
  
  // Interactive micro-states for each illustration
  const [pulseLove, setPulseLove] = useState(false);
  const [selectedPinIndex, setSelectedPinIndex] = useState<number>(0);
  const [isPrivacyLocked, setIsPrivacyLocked] = useState(true);

  const totalIntroSlides = 3;

  // Slide Data
  const slides = [
    {
      step: 1,
      title: 'এক ফোঁটা রক্ত, একটি পরিবারের আশা',
      subtitle: 'জরুরি সময়ে আপনার সামান্য রক্তদান ফিরিয়ে দিতে পারে একটি মুমূর্ষু মানুষের জীবন এবং তার পুরো পরিবারের মুখের হাসি।',
      tag: 'মানবিক সংযোগ',
    },
    {
      step: 2,
      title: 'আপনার আশেপাশের ডোনার, কয়েক মিনিটে',
      subtitle: 'জরুরি মুহূর্তে সময় নষ্ট না করে চোখের পলকে নিকটস্থ যাচাইকৃত রক্তদাতাদের কাছে পৌঁছান। কোনো মধ্যস্বত্বভোগী নেই, সরাসরি মানবিক সাহায্য।',
      tag: 'দ্রুত সাড়া',
    },
    {
      step: 3,
      title: 'আপনার তথ্য, আপনার নিয়ন্ত্রণে',
      subtitle: 'আপনার ব্যক্তিগত ফোন নম্বর ও সঠিক ঠিকানা কাউকে দেখানো হয় না। আপনার স্পষ্ট সম্মতি ছাড়া কোনো তথ্য কারো কাছে প্রকাশ করা হয় না।',
      tag: '১০০% গোপনীয়তা',
    },
  ];

  const handleNext = () => {
    if (currentSlide < totalIntroSlides) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      if (onOpenPhoneAuth) {
        onOpenPhoneAuth(selectedRole);
      } else {
        onComplete(selectedRole);
      }
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  // Nearby donors simulation on Slide 2
  const mockNearbyPins = [
    { name: 'তানভীর আহমেদ', group: 'B+', dist: '১.২ কিমি', time: '১০ মি.', hospital: 'শহীদ জিয়া মেডিকেল', x: '24%', y: '32%' },
    { name: 'রাশেদুল হাসান', group: 'O+', dist: '৮০০ মিটার', time: '৫ মি.', hospital: 'মোহাম্মদ আলী হাসপাতাল', x: '72%', y: '26%' },
    { name: 'আরিফ মাহমুদ', group: 'A+', dist: '২.৪ কিমি', time: '১৫ মি.', hospital: 'টিএমএসএস মেডিকেল', x: '58%', y: '70%' },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between select-none">
      {/* Top Header Bar */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-[#E4E6EB]/70 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {currentSlide > 0 ? (
            <button
              onClick={handleBack}
              aria-label="আগের স্লাইড"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#1B1B1F] hover:bg-[#F7F7F9] active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#FDECEF] flex items-center justify-center text-[#C41E3A]">
              <Droplet className="w-4 h-4 fill-current" />
            </div>
          )}
          <div>
            <span className="text-xs font-bold text-[#1B1B1F]">
              {currentSlide < totalIntroSlides ? `পরিচিতি (${toBengaliDigits(currentSlide + 1)}/${toBengaliDigits(totalIntroSlides)})` : 'ভূমিকা পছন্দ'}
            </span>
            <span className="hidden sm:inline text-[10px] text-[#5B5F6B] ml-1.5 font-medium">
              • রক্তদাতা প্ল্যাটফর্ম
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentSlide < totalIntroSlides ? (
            <button
              onClick={() => setCurrentSlide(totalIntroSlides)}
              className="text-xs font-bold text-[#5B5F6B] hover:text-[#C41E3A] px-2.5 py-1 rounded-full hover:bg-[#FDECEF] transition-colors cursor-pointer"
            >
              স্কিপ করুন
            </button>
          ) : (
            <span className="text-[11px] font-bold text-[#0B7A50] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full">
              চূড়ান্ত ধাপ
            </span>
          )}

          <button
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5B5F6B] hover:text-[#1B1B1F] hover:bg-[#F7F7F9] active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Stage: Responsive 2-column on desktop/laptop, vertical stack on mobile */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {currentSlide < totalIntroSlides ? (
            /* ================= SLIDES 1, 2, 3 ================= */
            <motion.div
              key={`slide-${currentSlide}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center max-w-4xl mx-auto w-full"
            >
              {/* Interactive Illustration Card (Left Column on Desktop) */}
              <div className="md:col-span-6 w-full">
                <div className="w-full aspect-4/3 sm:aspect-16/11 rounded-3xl bg-gradient-to-br from-[#FFF5F6] via-[#FDECEF] to-[#F7F7F9] border border-[#FFDADA]/60 p-5 relative overflow-hidden shadow-xs flex items-center justify-center">
                  
                  {/* Subtle Background Radial Aura */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(196,30,58,0.08)_0,transparent_70%)] pointer-events-none" />

                  {/* ================= SLIDE 1 ILLUSTRATION: Heart & Droplet of Hope ================= */}
                  {currentSlide === 0 && (
                    <div
                      onClick={() => setPulseLove((p) => !p)}
                      className="relative flex flex-col items-center justify-center cursor-pointer group"
                    >
                      {/* Concentric Pulse Rings */}
                      <motion.div
                        animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.1, 0.35] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute w-44 h-44 rounded-full border-2 border-[#C41E3A]/30"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.05, 0.2] }}
                        transition={{ duration: 2.2, delay: 0.4, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute w-56 h-56 rounded-full border border-[#C41E3A]/20"
                      />

                      {/* Floating Gratitude Capsule */}
                      <motion.div
                        initial={{ y: 0 }}
                        animate={{ y: [-4, 4, -4] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white shadow-md border border-[#FFDADA] flex items-center justify-center relative z-10 group-hover:scale-105 transition-transform"
                      >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FDECEF] flex items-center justify-center">
                          <Droplet className="w-9 h-9 sm:w-11 sm:h-11 text-[#C41E3A] fill-current drop-shadow-xs" />
                        </div>

                        {/* Verified badge seal */}
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#0B7A50] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      </motion.div>

                      {/* Vitality Counter Pill */}
                      <div className="mt-4 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#FFDADA] shadow-xs flex items-center gap-1.5 z-10">
                        <Heart className="w-4 h-4 text-[#C41E3A] fill-current animate-pulse" />
                        <span className="text-xs font-extrabold text-[#1B1B1F]">
                          ১ ব্যাগ রক্ত = ৩টি জীবন
                        </span>
                      </div>

                      <p className="text-[10px] text-[#5B5F6B] mt-1.5 z-10 text-center">
                        {pulseLove ? '❤️ সহমর্মিতা ও ভালোবাসার উপহার!' : '👆 স্পর্শ করে অনুভূতির স্পন্দন দেখুন'}
                      </p>
                    </div>
                  )}

                  {/* ================= SLIDE 2 ILLUSTRATION: Proximity Radar Map ================= */}
                  {currentSlide === 1 && (
                    <div className="w-full h-full relative flex items-center justify-center">
                      {/* Radar Scanning Circles */}
                      <div className="absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-[#C41E3A]/25 flex items-center justify-center">
                        <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border border-dashed border-[#C41E3A]/30 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-[#C41E3A]/10 animate-ping opacity-30" />
                        </div>
                      </div>

                      {/* Center Point: Hospital / Request Location */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-[#C41E3A] text-white flex items-center justify-center shadow-md">
                          <Building className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full text-[#1B1B1F] shadow-xs mt-1 border border-[#E4E6EB]">
                          হাসপাতাল
                        </span>
                      </div>

                      {/* Nearby Donor Pins */}
                      {mockNearbyPins.map((pin, idx) => {
                        const isSelected = selectedPinIndex === idx;
                        return (
                          <div
                            key={pin.name}
                            onClick={() => setSelectedPinIndex(idx)}
                            style={{ left: pin.x, top: pin.y }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                          >
                            <div
                              className={`px-2 py-1 rounded-full flex items-center gap-1 shadow-md transition-all ${
                                isSelected
                                  ? 'bg-[#0B7A50] text-white ring-2 ring-white scale-110'
                                  : 'bg-white text-[#1B1B1F] hover:bg-[#FDECEF]'
                              }`}
                            >
                              <span className="font-extrabold text-[11px]">{pin.group}</span>
                              <span className="text-[9px] opacity-90">{pin.dist}</span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Selected Donor Preview Badge at Bottom */}
                      <div className="absolute bottom-2 inset-x-2 bg-white/95 backdrop-blur-xs p-2 rounded-xl border border-[#E4E6EB] shadow-xs flex items-center justify-between text-xs z-30">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#0B7A50] animate-pulse" />
                          <span className="font-bold text-[#1B1B1F]">
                            {mockNearbyPins[selectedPinIndex].name}
                          </span>
                          <span className="text-[10px] bg-[#FDECEF] text-[#C41E3A] font-bold px-1.5 py-0.2 rounded">
                            {mockNearbyPins[selectedPinIndex].group}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-[#0B7A50]">
                          পৌঁছাবেন: {mockNearbyPins[selectedPinIndex].time}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ================= SLIDE 3 ILLUSTRATION: Privacy & Security Vault ================= */}
                  {currentSlide === 2 && (
                    <div
                      onClick={() => setIsPrivacyLocked((l) => !l)}
                      className="w-full flex flex-col items-center justify-center cursor-pointer z-10 space-y-3"
                    >
                      {/* Shield Vault Emblem */}
                      <motion.div
                        animate={{ scale: [1, 1.04, 1] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white shadow-md border border-[#D9E2FF] flex items-center justify-center relative"
                      >
                        <ShieldCheck className="w-12 h-12 text-[#1D5FD0]" />
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0B7A50] text-white flex items-center justify-center shadow-xs">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      </motion.div>

                      {/* Masked Data Preview Card */}
                      <div className="bg-white rounded-2xl p-3 border border-[#E4E6EB] shadow-xs w-full max-w-[260px] space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#5B5F6B]">মোবাইল নম্বর</span>
                          <span className="font-bold text-[#0B7A50] flex items-center gap-1">
                            <Lock className="w-3 h-3" /> সুরক্ষিত
                          </span>
                        </div>
                        <div className="h-8 rounded-lg bg-[#F7F7F9] flex items-center px-2.5 justify-between font-mono text-xs font-bold text-[#1B1B1F]">
                          <span>+৮৮০ ১৭১২-***৬৭৮</span>
                          <span className="text-[9px] bg-[#E8F5E9] text-[#005938] px-1.5 py-0.5 rounded font-sans">
                            লুকানো
                          </span>
                        </div>
                        <p className="text-[10px] text-[#5B5F6B] leading-tight">
                          শুধুমাত্র সাড়া দেওয়া ভেরিফায়েড ডোনারের সাথে যোগাযোগ করা যাবে।
                        </p>
                      </div>

                      <span className="text-[10px] text-[#1D5FD0] font-semibold">
                        {isPrivacyLocked ? '🔒 সর্বোচ্চ এনক্রিপশন সক্রিয়' : '🛡️ গোপনীয়তা নিশ্চিত করা হয়েছে'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Text & Explanations (Right Column on Desktop) */}
              <div className="md:col-span-6 flex flex-col justify-center text-center md:text-left space-y-3.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDECEF] text-[#C41E3A] text-xs font-bold w-fit mx-auto md:mx-0">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{slides[currentSlide].tag}</span>
                </div>

                <h1 className="font-extrabold text-[22px] sm:text-[26px] md:text-[28px] text-[#1B1B1F] leading-tight tracking-tight">
                  {slides[currentSlide].title}
                </h1>

                <p className="text-sm md:text-base text-[#5B5F6B] leading-relaxed">
                  {slides[currentSlide].subtitle}
                </p>

                {/* Key feature pills */}
                <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start text-xs text-[#1B1B1F]">
                  {currentSlide === 0 && (
                    <>
                      <span className="bg-white border border-[#E4E6EB] px-3 py-1 rounded-full font-medium shadow-2xs">
                        🩸 ১০০% বিনামূল্যে সেবা
                      </span>
                      <span className="bg-white border border-[#E4E6EB] px-3 py-1 rounded-full font-medium shadow-2xs">
                        🤝 সরাসরি রোগীর স্বজনদের পাশে
                      </span>
                    </>
                  )}
                  {currentSlide === 1 && (
                    <>
                      <span className="bg-white border border-[#E4E6EB] px-3 py-1 rounded-full font-medium shadow-2xs">
                        ⏱️ ৬০ সেকেন্ডে অনুরোধ
                      </span>
                      <span className="bg-white border border-[#E4E6EB] px-3 py-1 rounded-full font-medium shadow-2xs">
                        📍 এলাকাভিত্তিক লাইভ রাউটিং
                      </span>
                    </>
                  )}
                  {currentSlide === 2 && (
                    <>
                      <span className="bg-white border border-[#E4E6EB] px-3 py-1 rounded-full font-medium shadow-2xs">
                        🛡️ নম্বর সম্পূর্ণ সুরক্ষিত
                      </span>
                      <span className="bg-white border border-[#E4E6EB] px-3 py-1 rounded-full font-medium shadow-2xs">
                        ✅ কোনো স্প্যাম কল নেই
                      </span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            /* ================= SLIDE 4: ROLE PREFERENCE SELECTION ================= */
            <motion.div
              key="role-selection"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl mx-auto w-full space-y-5 text-center"
            >
              <div>
                <span className="text-xs font-bold text-[#C41E3A] uppercase tracking-wider block mb-1">
                  শুরুর পছন্দ নির্বাচন
                </span>
                <h2 className="font-extrabold text-[22px] sm:text-[26px] text-[#1B1B1F] tracking-tight">
                  আপনি কীভাবে শুরু করতে চান?
                </h2>
                <p className="text-xs sm:text-sm text-[#5B5F6B] mt-1 max-w-md mx-auto">
                  আপনার প্রাথমিক উদ্দেশ্যটি বেছে নিন। নিচে উল্লিখিত হিসেবে কোনো স্থায়ী বাধা নেই।
                </p>
              </div>

              {/* Two Large Responsive Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 text-left">
                {/* Option 1: Seeker / রক্ত লাগবে */}
                <div
                  onClick={() => setSelectedRole('recipient')}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                    selectedRole === 'recipient'
                      ? 'bg-[#FDECEF] border-[#C41E3A] shadow-md'
                      : 'bg-white border-[#E4E6EB] hover:border-[#FFDADA]'
                  }`}
                >
                  {selectedRole === 'recipient' && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#C41E3A] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-[#FFDADA] text-[#C41E3A] flex items-center justify-center shrink-0">
                      <Droplet className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold bg-[#FFDAD6] text-[#BA1A1A] px-2 py-0.5 rounded-full inline-block mb-1">
                        জরুরি সহায়তা
                      </span>
                      <h3 className="font-extrabold text-[17px] text-[#1B1B1F] leading-tight">
                        আমার রক্ত লাগবে
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-[#5B5F6B] leading-relaxed">
                    রোগী বা স্বজনের জন্য রক্ত, প্লাজমা বা প্লেটলেট প্রয়োজন? কয়েক সেকেন্ডে কাছের ডোনারদের জানান।
                  </p>

                  <div className="pt-2 border-t border-[#FFDADA]/60 flex items-center justify-between text-[11px] font-bold text-[#C41E3A]">
                    <span>দ্রুত অনুরোধ তৈরি করুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Option 2: Donor / রক্ত দিতে চাই */}
                <div
                  onClick={() => setSelectedRole('donor')}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                    selectedRole === 'donor'
                      ? 'bg-[#E8F5E9]/70 border-[#0B7A50] shadow-md'
                      : 'bg-white border-[#E4E6EB] hover:border-[#C8E6C9]'
                  }`}
                >
                  {selectedRole === 'donor' && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#0B7A50] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-[#C8E6C9] text-[#0B7A50] flex items-center justify-center shrink-0">
                      <Heart className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold bg-[#E8F5E9] text-[#005938] px-2 py-0.5 rounded-full inline-block mb-1">
                        স্বেচ্ছাসেবী ডোনার
                      </span>
                      <h3 className="font-extrabold text-[17px] text-[#1B1B1F] leading-tight">
                        আমি রক্ত দিতে চাই
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-[#5B5F6B] leading-relaxed">
                    জরুরি রক্তের প্রয়োজনে মানুষের পাশে দাঁড়াতে চান? নিজের প্রোফাইল তৈরি করে প্রস্তুত থাকুন।
                  </p>

                  <div className="pt-2 border-t border-[#C8E6C9]/60 flex items-center justify-between text-[11px] font-bold text-[#0B7A50]">
                    <span>ডোনার হিসেবে নিবন্ধন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Crucial Reassurance Notice from Design Plan Section 2 & 8 */}
              <div className="p-3 bg-[#F7F7F9] rounded-2xl border border-[#E4E6EB] flex items-center justify-center gap-2 text-xs text-[#5B5F6B] max-w-md mx-auto">
                <AlertCircle className="w-4 h-4 text-[#1D5FD0] shrink-0" />
                <span>
                  <strong>একটি অ্যাকাউন্ট, দুই ভূমিকা:</strong> পরে যেকোনো সময় দুটোই করতে পারবেন।
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Sticky Action Area (Within thumb reach on mobile, balanced on desktop) */}
      <div className="px-4 sm:px-6 py-3.5 border-t border-[#E4E6EB]/70 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        {/* Progress Indicator Dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map((idx) => {
            const isActive = currentSlide === idx;
            return (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`স্লাইড ${toBengaliDigits(idx + 1)}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'w-7 bg-[#C41E3A]'
                    : 'w-2 bg-[#E4E6EB] hover:bg-[#C41E3A]/40'
                }`}
              />
            );
          })}
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleNext}
            className="flex-1 sm:flex-none h-12 px-6 rounded-xl bg-[#C41E3A] hover:bg-[#A3182F] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(196,30,58,0.25)] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            <span>
              {currentSlide < totalIntroSlides
                ? 'পরবর্তী ধাপ'
                : selectedRole === 'donor'
                ? 'ডোনার হিসেবে এগিয়ে যান'
                : 'অনুরোধকারী হিসেবে এগিয়ে যান'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
