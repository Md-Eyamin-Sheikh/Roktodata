'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Clock,
  Activity,
  Droplet,
  Hospital,
  MapPin,
  Search,
  X,
  User,
  Phone,
  ShieldCheck,
  FileCheck,
  Camera,
  Check,
  AlertTriangle,
  Minus,
  Plus,
  Send,
  Share2,
  CheckCircle2,
  Edit3,
  HelpCircle,
  Sparkles,
  Navigation
} from 'lucide-react';
import { BloodGroup, ComponentType, EmergencyRequest, UrgencyLevel } from '@/lib/types';
import { toBengaliDigits } from '@/lib/bengali-utils';
import { hospitalSuggestions } from '@/lib/data';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface BloodRequestWizardProps {
  onBack?: () => void;
  onClose?: () => void;
  onSubmitRequest: (newReq: Partial<EmergencyRequest>) => void;
  onViewCreatedRequest?: () => void;
}

export const BloodRequestWizard: React.FC<BloodRequestWizardProps> = ({
  onBack,
  onClose,
  onSubmitRequest,
  onViewCreatedRequest,
}) => {
  const { language, t, formatDigits } = useLanguage();
  const handleExit = onBack || onClose || (() => {});
  // Steps: 1 (কী লাগবে), 2 (কোথায়), 3 (যোগাযোগ ও যাচাই), 4 (রিভিউ স্ক্রিন: সব ঠিক আছে?), 5 (পোস্ট-সেন্ড সাকসেস)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('B+');
  const [bagCount, setBagCount] = useState<number>(1);
  const [urgency, setUrgency] = useState<UrgencyLevel>('now');
  const [componentType, setComponentType] = useState<ComponentType>('whole');

  // Step 2 State
  const [hospitalName, setHospitalName] = useState<string>(
    'শহীদ জিয়াউর রহমান মেডিকেল কলেজ হাসপাতাল, বগুড়া'
  );
  const [wardNumber, setWardNumber] = useState<string>('৪ (সার্জারি)');
  const [bedNumber, setBedNumber] = useState<string>('১২');
  const [filteredHospitals, setFilteredHospitals] = useState<string[]>([]);
  const [isSearchingHospitals, setIsSearchingHospitals] = useState<boolean>(false);

  // Step 3 State
  const [patientName, setPatientName] = useState<string>('রাহেলা বেগম');
  const [patientRelation, setPatientRelation] = useState<string>('মা');
  const [reason, setReason] = useState<string>('জরুরি অপারেশন');
  const [contactNumber, setContactNumber] = useState<string>('০১৭৫২-০৪৬৫৭৮');
  const [prescriptionUploaded, setPrescriptionUploaded] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const bloodGroups: { group: BloodGroup; donorsAvailable: number }[] = [
    { group: 'A+', donorsAvailable: 18 },
    { group: 'A-', donorsAvailable: 4 },
    { group: 'B+', donorsAvailable: 24 },
    { group: 'B-', donorsAvailable: 6 },
    { group: 'O+', donorsAvailable: 31 },
    { group: 'O-', donorsAvailable: 5 },
    { group: 'AB+', donorsAvailable: 12 },
    { group: 'AB-', donorsAvailable: 2 },
  ];

  const handleHospitalChange = (val: string) => {
    setHospitalName(val);
    if (val.trim().length > 1) {
      const matched = hospitalSuggestions.filter((h) =>
        h.toLowerCase().includes(val.toLowerCase())
      );
      setFilteredHospitals(matched);
      setIsSearchingHospitals(true);
    } else {
      setIsSearchingHospitals(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 2) {
      if (!hospitalName.trim()) {
        alert('অনুগ্রহ করে হাসপাতালের নাম নির্বাচন করুন');
        return;
      }
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 3) {
      // Go to Review Screen (Section 10)
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 4) {
      // Submit & Go to Post-Send Success Screen
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        const newReq: Partial<EmergencyRequest> = {
          bloodGroup,
          hospitalName,
          location: 'বগুড়া সদর',
          distanceKm: 2.4,
          bagsNeeded: bagCount,
          urgency,
          urgencyLabel: urgency === 'now' ? 'এখনই' : 'আজ',
          timeTarget: urgency === 'now' ? 'আজ রাতের মধ্যে' : 'আগামীকাল',
          createdAt: 'এইমাত্র',
          componentType,
          patientName,
          patientRelation,
          reason,
          wardNumber,
          bedNumber,
          contactNumber,
          hasVerifiedHospital: true,
          hasPrescriptionSlip: prescriptionUploaded,
          status: 'active',
          respondingDonorsCount: 0,
          trackingStep: 2,
        };
        onSubmitRequest(newReq);
        setCurrentStep(5);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 900);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `জরুরি রক্ত দরকার: ${bloodGroup}`,
        text: `${hospitalName}-এ ${bloodGroup} রক্ত (${toBengaliDigits(bagCount)} ব্যাগ) জরুরি প্রয়োজন। যোগাযোগ: ${contactNumber}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      alert('রক্তের অনুরোধের বিবরণ ক্লিপবোর্ডে কপি করা হয়েছে!');
    }
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* ================= TOP NAVIGATION & PROGRESS HEADER (DOCKED AT TOP-0, NO FLOATING GAP) ================= */}
      {currentStep <= 4 && (
        <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xl border-b border-[#E4E6EB]/80 shadow-xs">
          <div className="max-w-5xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3.5">
            <div className="flex items-center justify-between gap-2.5 mb-2.5">
              <button
                onClick={() => (currentStep > 1 ? setCurrentStep((s) => (s - 1) as any) : handleExit())}
                aria-label={t.common.back}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#1B1B1F] hover:bg-[#F7F7F9] active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="text-center min-w-0 flex-1 px-1">
                <h1 className="font-extrabold text-[16px] sm:text-[18px] text-[#1B1B1F] leading-tight truncate">
                  {t.requests.emergencyTitle}
                </h1>
                <p className="text-[11px] sm:text-xs text-[#5B5F6B] mt-0.5 truncate">
                  {currentStep === 1 && (language === 'bn' ? 'ধাপ ১/৩ : কী লাগবে ও রক্তের বিবরণ' : 'Step 1/3: Blood Group & Details')}
                  {currentStep === 2 && (language === 'bn' ? 'ধাপ ২/৩ : হাসপাতাল ও অবস্থান' : 'Step 2/3: Hospital & Location')}
                  {currentStep === 3 && (language === 'bn' ? 'ধাপ ৩/৩ : রোগীর তথ্য ও যোগাযোগ' : 'Step 3/3: Patient & Contact Info')}
                  {currentStep === 4 && (language === 'bn' ? 'যাচাই ও রিভিউ : সব ঠিক আছে?' : 'Review: Confirm Details')}
                </p>
              </div>

              <button
                onClick={handleExit}
                className="text-xs sm:text-sm font-bold text-[#5B5F6B] hover:text-[#C41E3A] px-2.5 sm:px-3 py-1.5 rounded-xl hover:bg-[#FDECEF] transition-colors cursor-pointer shrink-0"
              >
                {t.common.cancel}
              </button>
            </div>

            {/* 3-Segment Animated Progress Bar */}
            <div className="grid grid-cols-3 gap-2">
              <div
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  currentStep >= 1 ? 'bg-gradient-to-r from-[#9E0027] to-[#C41E3A]' : 'bg-[#E4E6EB]'
                }`}
              />
              <div
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  currentStep >= 2 ? 'bg-gradient-to-r from-[#9E0027] to-[#C41E3A]' : 'bg-[#E4E6EB]'
                }`}
              />
              <div
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  currentStep >= 3 ? 'bg-gradient-to-r from-[#9E0027] to-[#C41E3A]' : 'bg-[#E4E6EB]'
                }`}
              />
            </div>
          </div>
        </header>
      )}

      {/* ================= RESPONSIVE LAYOUT (Step Content + Desktop Live Preview Side Panel) ================= */}
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6 pt-3 sm:pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
        
        {/* PRIMARY FORM COLUMN (7 cols on lg, full width on mobile/tablet) */}
        <div className={currentStep <= 4 ? 'lg:col-span-7 space-y-4' : 'lg:col-span-12'}>
          
          {/* ================= STEP 1: কী লাগবে ================= */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Blood Group Selection */}
              <section className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-[#E4E6EB]/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-[15px] sm:text-[16px] text-[#1B1B1F] flex items-center gap-2">
                    <Droplet className="w-4.5 h-4.5 text-[#C41E3A] fill-current" />
                    <span>{language === 'bn' ? 'ব্লাড গ্রুপ নির্বাচন করুন' : 'Select Blood Group'}</span>
                    <span className="text-[#C41E3A]">*</span>
                  </label>
                  <span className="text-[11px] sm:text-xs text-[#C41E3A] bg-[#FDECEF] px-2.5 py-0.5 rounded-full font-bold">
                    {language === 'bn' ? 'বাধ্যতামূলক' : 'Required'}
                  </span>
                </div>

                {/* 8 Group Tiles (4x2 on mobile, 4x2 on desktop) */}
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {bloodGroups.map((item) => {
                    const isSelected = bloodGroup === item.group;
                    return (
                      <button
                        key={item.group}
                        onClick={() => setBloodGroup(item.group)}
                        className={`h-20 sm:h-22 rounded-2xl flex flex-col items-center justify-center relative transition-all active:scale-95 cursor-pointer ${
                          isSelected
                            ? 'bg-[#FDECEF] text-[#C41E3A] ring-2 ring-[#C41E3A] shadow-xs'
                            : 'bg-[#F7F7F9] text-[#1B1B1F] hover:bg-[#F0EDF2] border border-[#E4E6EB]/50'
                        }`}
                      >
                        <span className="font-black text-2xl sm:text-3xl leading-none">{item.group}</span>
                        <span className="text-[10px] sm:text-[11px] font-semibold mt-1 opacity-80">
                          {formatDigits(item.donorsAvailable)} {language === 'bn' ? 'ডোনার' : 'Donors'}
                        </span>
                        {isSelected && (
                          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#C41E3A] text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Quantity Stepper */}
              <section className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-[#E4E6EB]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="font-extrabold text-[15px] sm:text-[16px] text-[#1B1B1F] flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#C41E3A]" />
                    <span>{language === 'bn' ? 'রক্তের পরিমাণ' : 'Blood Quantity'}</span>
                  </label>
                  <p className="text-xs text-[#5B5F6B] mt-0.5">
                    {language === 'bn' ? 'কত ব্যাগ রক্ত প্রয়োজন?' : 'How many bags needed?'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Preset quick buttons */}
                  <div className="hidden sm:flex items-center gap-1 mr-2">
                    {[1, 2, 4].map((cnt) => (
                      <button
                        key={cnt}
                        onClick={() => setBagCount(cnt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          bagCount === cnt
                            ? 'bg-[#FDECEF] text-[#C41E3A] border border-[#FFDAD6]'
                            : 'bg-[#F7F7F9] text-[#5B5F6B] hover:bg-[#F0EDF2]'
                        }`}
                      >
                        {formatDigits(cnt)} {language === 'bn' ? 'ব্যাগ' : 'bags'}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 bg-[#F7F7F9] p-1 rounded-2xl border border-[#E4E6EB]/60">
                    <button
                      onClick={() => setBagCount((b) => Math.max(1, b - 1))}
                      aria-label={language === 'bn' ? 'ব্যাগ কমান' : 'Decrease bags'}
                      className="w-10 h-10 rounded-xl bg-white text-[#1B1B1F] flex items-center justify-center shadow-xs active:scale-95 transition-transform cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-20 text-center font-black text-base text-[#1B1B1F] select-none">
                      {formatDigits(bagCount)} {language === 'bn' ? 'ব্যাগ' : 'bags'}
                    </span>
                    <button
                      onClick={() => setBagCount((b) => Math.min(10, b + 1))}
                      aria-label={language === 'bn' ? 'ব্যাগ বাড়ান' : 'Increase bags'}
                      className="w-10 h-10 rounded-xl bg-white text-[#1B1B1F] flex items-center justify-center shadow-xs active:scale-95 transition-transform cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </section>

              {/* Urgency Chips */}
              <section className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-[#E4E6EB]/80 space-y-3">
                <label className="font-extrabold text-[15px] sm:text-[16px] text-[#1B1B1F] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#C41E3A]" />
                  <span>{language === 'bn' ? 'কখন রক্ত লাগবে?' : 'When is Blood Needed?'}</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    {
                      id: 'now',
                      label: language === 'bn' ? 'এখনই লাগবে' : 'Immediate Need',
                      sub: language === 'bn' ? '৬০ মিনিটের মধ্যে' : '< 60 mins',
                      icon: AlertTriangle,
                    },
                    {
                      id: 'today',
                      label: language === 'bn' ? 'আজকের মধ্যে' : 'Needed Today',
                      sub: language === 'bn' ? 'রাত ১২:০০ টা' : 'By midnight',
                      icon: Clock,
                    },
                    {
                      id: '24-48',
                      label: language === 'bn' ? '২৪-৪৮ ঘণ্টা' : '24-48 Hours',
                      sub: language === 'bn' ? 'পরিকল্পিত' : 'Scheduled',
                      icon: Clock,
                    },
                    {
                      id: 'scheduled',
                      label: language === 'bn' ? 'নির্দিষ্ট তারিখ' : 'Specific Date',
                      sub: language === 'bn' ? 'ক্যালেন্ডার' : 'Calendar',
                      icon: Clock,
                    },
                  ].map((item) => {
                    const isSelected = urgency === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setUrgency(item.id as UrgencyLevel)}
                        className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all active:scale-95 cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-tr from-[#9E0027] to-[#C41E3A] text-white shadow-xs'
                            : 'bg-[#F7F7F9] text-[#1B1B1F] hover:bg-[#F0EDF2] border border-[#E4E6EB]/50'
                        }`}
                      >
                        <item.icon className="w-4 h-4 mb-1" />
                        <span className="text-xs sm:text-sm font-bold leading-tight">{item.label}</span>
                        <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#5B5F6B]'}`}>
                          {item.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Blood Component / Type */}
              <section className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-[#E4E6EB]/80 space-y-3">
                <label className="font-extrabold text-[15px] sm:text-[16px] text-[#1B1B1F] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#C41E3A]" />
                  <span>{language === 'bn' ? 'রক্তের উপাদান / ধরন' : 'Blood Component / Type'}</span>
                </label>

                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {[
                    {
                      id: 'whole',
                      label: language === 'bn' ? 'পুরো রক্ত (Whole)' : 'Whole Blood',
                      note: language === 'bn' ? 'সার্জারি ও ট্রমা' : 'Surgery & Trauma',
                    },
                    {
                      id: 'platelets',
                      label: language === 'bn' ? 'প্লাটিলেট (PRP)' : 'Platelets',
                      note: language === 'bn' ? 'ডেঙ্গু ও ক্যানসার' : 'Dengue & Cancer',
                    },
                    {
                      id: 'plasma',
                      label: language === 'bn' ? 'প্লাজমা (FFP)' : 'Plasma (FFP)',
                      note: language === 'bn' ? 'পোড়া ও রক্তক্ষরণ' : 'Burns & Bleeding',
                    },
                  ].map((comp) => {
                    const isSelected = componentType === comp.id;
                    return (
                      <button
                        key={comp.id}
                        onClick={() => setComponentType(comp.id as ComponentType)}
                        className={`p-2.5 sm:p-3 rounded-2xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FDECEF] text-[#C41E3A] ring-2 ring-[#C41E3A] shadow-xs'
                            : 'bg-[#F7F7F9] text-[#5B5F6B] hover:bg-[#F0EDF2] border border-[#E4E6EB]/50'
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-bold leading-tight">{comp.label}</span>
                        <span className="text-[10px] text-[#5B5F6B] mt-0.5">{comp.note}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {/* ================= STEP 2: কোথায় লাগবে ================= */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Hospital Search */}
              <section className="bg-white rounded-3xl p-5 shadow-xs border border-[#E4E6EB]/80 space-y-3">
                <div>
                  <label className="font-extrabold text-[16px] text-[#1B1B1F] flex items-center gap-2">
                    <Hospital className="w-4 h-4 text-[#C41E3A]" />
                    <span>হাসপাতাল বা ব্লাড ব্যাংক</span>
                    <span className="text-[#C41E3A]">*</span>
                  </label>
                  <p className="text-xs text-[#5B5F6B] mt-0.5">ডোনারদের কোন হাসপাতালে রক্ত দিতে আসতে হবে?</p>
                </div>

                <div className="relative">
                  <Search className="w-5 h-5 text-[#5B5F6B] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => handleHospitalChange(e.target.value)}
                    placeholder="হাসপাতালের নাম লিখুন বা খুঁজুন..."
                    className="w-full h-12 pl-11 pr-10 rounded-2xl bg-[#F7F7F9] text-[#1B1B1F] text-sm focus:bg-white focus:ring-2 focus:ring-[#C41E3A] outline-none transition-all border border-[#E4E6EB]/60"
                  />
                  {hospitalName && (
                    <button
                      onClick={() => setHospitalName('')}
                      className="absolute right-3.5 top-3.5 text-[#5B5F6B] hover:text-[#1B1B1F]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                {isSearchingHospitals && filteredHospitals.length > 0 && (
                  <div className="bg-white border border-[#E4E6EB] rounded-2xl shadow-lg p-1.5 space-y-1">
                    {filteredHospitals.map((hosp) => (
                      <button
                        key={hosp}
                        onClick={() => {
                          setHospitalName(hosp);
                          setIsSearchingHospitals(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-xs rounded-xl hover:bg-[#FDECEF] hover:text-[#C41E3A] text-[#1B1B1F] font-semibold transition-colors"
                      >
                        {hosp}
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick Location Button */}
                <button
                  type="button"
                  onClick={() =>
                    setHospitalName('শহীদ জিয়াউর রহমান মেডিকেল কলেজ হাসপাতাল (শজিমেক), বগুড়া')
                  }
                  className="w-full h-11 px-4 rounded-2xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all border border-[#BFDBFE] cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-[#1D4ED8]" />
                  <span>আমার বর্তমান এলাকা ব্যবহার করুন (বগুড়া সদর)</span>
                </button>
              </section>

              {/* Ward & Bed Number */}
              <section className="bg-white rounded-3xl p-5 shadow-xs border border-[#E4E6EB]/80 space-y-3">
                <div>
                  <label className="font-extrabold text-[16px] text-[#1B1B1F] flex items-center gap-2">
                    <span>ওয়ার্ড ও বেড নম্বর</span>
                    <span className="text-xs text-[#5B5F6B] font-normal">(ঐচ্ছিক কিন্তু সহায়ক)</span>
                  </label>
                  <p className="text-xs text-[#5B5F6B] mt-0.5">ডোনার যেন হাসপাতালে এসে রোগীকে সরাসরি খুঁজে পান</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#5B5F6B] mb-1 block font-semibold">ওয়ার্ড নম্বর / বিভাগ</label>
                    <input
                      type="text"
                      value={wardNumber}
                      onChange={(e) => setWardNumber(e.target.value)}
                      placeholder="উদা: ৪ বা সার্জারি"
                      className="w-full h-11 px-3.5 rounded-2xl bg-[#F7F7F9] text-sm text-[#1B1B1F] outline-none focus:bg-white focus:ring-1 focus:ring-[#C41E3A] border border-[#E4E6EB]/60"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#5B5F6B] mb-1 block font-semibold">বেড নম্বর</label>
                    <input
                      type="text"
                      value={bedNumber}
                      onChange={(e) => setBedNumber(e.target.value)}
                      placeholder="উদা: ১২"
                      className="w-full h-11 px-3.5 rounded-2xl bg-[#F7F7F9] text-sm text-[#1B1B1F] outline-none focus:bg-white focus:ring-1 focus:ring-[#C41E3A] border border-[#E4E6EB]/60"
                    />
                  </div>
                </div>

                {/* Quick department chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] text-[#5B5F6B] mr-1">দ্রুত বিভাগ:</span>
                  {['জরুরি বিভাগ', 'সার্জারি', 'আইসিইউ', 'সিসিইউ', 'গাইনি', 'মেডিসিন'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setWardNumber(d)}
                      className="text-[11px] px-2.5 py-1 rounded-xl bg-[#F7F7F9] hover:bg-[#F0EDF2] text-[#5B5F6B] font-semibold transition-colors cursor-pointer"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </section>

              {/* Interactive Mini-Map Preview Card */}
              <section className="bg-white rounded-3xl p-5 shadow-xs border border-[#E4E6EB]/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#16A34A]" />
                    <span className="text-xs font-bold text-[#1B1B1F]">ম্যাপে হাসপাতাল অবস্থান নিশ্চিতকরণ</span>
                  </div>
                  <span className="text-[11px] text-[#16A34A] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full font-bold">
                    যাচাইকৃত রুট
                  </span>
                </div>

                <div className="w-full h-40 bg-[#E8E8EE] rounded-2xl relative overflow-hidden flex items-end p-3 border border-[#E4E6EB]/80">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#E2E6EE] via-[#D8DEEB] to-[#CFD7E6] opacity-90" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative flex flex-col items-center">
                      <div className="w-10 h-10 rounded-2xl bg-[#C41E3A] text-white flex items-center justify-center shadow-lg animate-bounce">
                        <Hospital className="w-5 h-5" />
                      </div>
                      <span className="w-4 h-1.5 bg-black/20 rounded-full mt-1 blur-xs" />
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center gap-2 bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-xl max-w-[95%] shadow-xs">
                    <Navigation className="w-4 h-4 text-[#C41E3A] shrink-0" />
                    <span className="text-xs font-bold text-[#1B1B1F] truncate">
                      {hospitalName} • আনুমানিক ২.৪ কিমি
                    </span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ================= STEP 3: যোগাযোগ ও যাচাই ================= */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Patient Info */}
              <section className="bg-white rounded-3xl p-5 shadow-xs border border-[#E4E6EB]/80 space-y-3">
                <div>
                  <label className="font-extrabold text-[16px] text-[#1B1B1F] flex items-center gap-2">
                    <User className="w-4 h-4 text-[#C41E3A]" />
                    <span>রোগীর তথ্য ও আপনার সম্পর্ক</span>
                  </label>
                  <p className="text-xs text-[#5B5F6B] mt-0.5">সঠিক তথ্যে ডোনাররা আস্থার সাথে দ্রুত এগিয়ে আসেন</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#5B5F6B] mb-1 block font-semibold">রোগীর নাম (বা ডাকনাম)</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-2xl bg-[#F7F7F9] text-sm text-[#1B1B1F] outline-none focus:bg-white focus:ring-1 focus:ring-[#C41E3A] border border-[#E4E6EB]/60"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#5B5F6B] mb-1 block font-semibold">রোগীর সাথে আপনার সম্পর্ক</label>
                    <select
                      value={patientRelation}
                      onChange={(e) => setPatientRelation(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-2xl bg-[#F7F7F9] text-sm text-[#1B1B1F] outline-none focus:bg-white focus:ring-1 focus:ring-[#C41E3A] border border-[#E4E6EB]/60 cursor-pointer"
                    >
                      <option value="মা">মা</option>
                      <option value="বাবা">বাবা</option>
                      <option value="সন্তান">সন্তান</option>
                      <option value="স্ত্রী / স্বামী">স্ত্রী / স্বামী</option>
                      <option value="ভাই / বোন">ভাই / বোন</option>
                      <option value="আত্মীয়">আত্মীয়</option>
                      <option value="বন্ধু">বন্ধু</option>
                      <option value="স্বেচ্ছাসেবী">স্বেচ্ছাসেবী</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#5B5F6B] mb-1 block font-semibold">রক্তের প্রয়োজনের কারণ</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-2xl bg-[#F7F7F9] text-sm text-[#1B1B1F] outline-none focus:bg-white focus:ring-1 focus:ring-[#C41E3A] border border-[#E4E6EB]/60 cursor-pointer"
                  >
                    <option value="জরুরি অপারেশন">জরুরি অপারেশন</option>
                    <option value="প্রসবকালীন জটিলতা (সিজারিয়ান)">প্রসবকালীন জটিলতা (সিজারিয়ান)</option>
                    <option value="থ্যালাসেমিয়া নিয়মিত রক্তদান">থ্যালাসেমিয়া নিয়মিত রক্তদান</option>
                    <option value="সড়ক দুর্ঘটনা / ট্রমা">সড়ক দুর্ঘটনা / ট্রমা</option>
                    <option value="ডেঙ্গু / প্লাটিলেট সংকট">ডেঙ্গু / প্লাটিলেট সংকট</option>
                    <option value="অন্যান্য চিকিৎসা">অন্যান্য চিকিৎসা</option>
                  </select>
                </div>
              </section>

              {/* Verified Contact Mobile */}
              <section className="bg-white rounded-3xl p-5 shadow-xs border border-[#E4E6EB]/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-[16px] text-[#1B1B1F] flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#C41E3A]" />
                    <span>যোগাযোগের মোবাইল নম্বর</span>
                    <span className="text-[#C41E3A]">*</span>
                  </label>
                  <span className="inline-flex items-center gap-1 bg-[#DCFCE7] text-[#166534] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                    <Check className="w-3 h-3 stroke-[3]" /> ভেরিফায়েড
                  </span>
                </div>
                <p className="text-xs text-[#5B5F6B]">জরুরি মুহূর্তে রক্তদাতা সরাসরি এই নম্বরে কল করবেন</p>

                <div className="h-12 px-4 rounded-2xl bg-[#F7F7F9] flex items-center justify-between border border-[#E4E6EB]/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
                    <span className="font-extrabold text-[15px] text-[#1B1B1F] tracking-wider">
                      {contactNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const promptVal = prompt('নতুন মোবাইল নম্বর লিখুন:', contactNumber);
                      if (promptVal) setContactNumber(promptVal);
                    }}
                    className="text-xs text-[#0D58C9] font-bold hover:underline cursor-pointer"
                  >
                    পরিবর্তন করুন
                  </button>
                </div>

                {/* Privacy Shield note */}
                <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#1D4ED8] shrink-0 mt-0.5" />
                  <p className="text-[12px] text-[#1E3A8A] leading-relaxed">
                    আপনার নম্বর সুরক্ষিত। শুধুমাত্র যারা রক্তদানে সাড়া দেবেন তারাই এই নম্বর দেখতে পাবেন। কোনো স্প্যাম বা বিজ্ঞাপন পাঠানো হবে না।
                  </p>
                </div>
              </section>

              {/* Doctor Requisition Slip Upload */}
              <section className="bg-white rounded-3xl p-5 shadow-xs border border-[#E4E6EB]/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-[16px] text-[#1B1B1F] flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#C41E3A]" />
                    <span>ডাক্তারের রিকুইজিশন ফর্ম বা প্রেসক্রিপশন</span>
                  </label>
                  <span className="bg-[#FDECEF] text-[#C41E3A] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    +৮০% দ্রুত সাড়া
                  </span>
                </div>

                <div
                  onClick={() => setPrescriptionUploaded((p) => !p)}
                  className={`w-full rounded-2xl p-5 text-center cursor-pointer transition-all border-2 border-dashed ${
                    prescriptionUploaded
                      ? 'bg-[#FDECEF]/50 border-[#C41E3A]'
                      : 'bg-[#F7F7F9] border-[#E4E6EB] hover:bg-[#F0EDF2]'
                  }`}
                >
                  <div className="w-11 h-11 rounded-2xl bg-white shadow-xs mx-auto flex items-center justify-center text-[#C41E3A] mb-2.5">
                    <Camera className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-xs text-[#1B1B1F]">
                    {prescriptionUploaded
                      ? '✓ প্রেসক্রিপশন স্লিপ সংযুক্ত হয়েছে (ক্লিক করে পরিবর্তন)'
                      : 'প্রেসক্রিপশন বা রক্তের স্লিপের ছবি তুলুন'}
                  </p>
                  <p className="text-[11px] text-[#5B5F6B] mt-0.5">
                    ছবি দিলে অনুরোধে &quot;যাচাইকৃত রিকুইজিশন&quot; ব্যাজ যুক্ত হবে
                  </p>
                </div>
              </section>
            </div>
          )}

          {/* ================= STEP 4: REVIEW SCREEN (সব ঠিক আছে?) ================= */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="text-center pb-1">
                <h2 className="font-black text-2xl text-[#1B1B1F]">সব তথ্য কি সঠিক?</h2>
                <p className="text-xs text-[#5B5F6B] mt-1">
                  অনুরোধ প্রচারের আগে তথ্যগুলো ভালোভাবে মিলিয়ে নিন
                </p>
              </div>

              {/* Giant Review Summary Voucher Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-[#FFDAD9] flex flex-col items-center text-center relative overflow-hidden">
                <div className="w-22 h-22 rounded-3xl bg-gradient-to-tr from-[#9E0027] to-[#C41E3A] text-white flex flex-col items-center justify-center shadow-md mb-3">
                  <span className="text-4xl font-black leading-none">{bloodGroup}</span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold opacity-90 mt-1">রক্তগ্রুপ</span>
                </div>

                <h3 className="font-extrabold text-xl text-[#1B1B1F]">
                  {toBengaliDigits(bagCount)} ব্যাগ {componentType === 'whole' ? 'পুরো রক্ত' : componentType === 'platelets' ? 'প্লাটিলেট' : 'প্লাজমা'} প্রয়োজন
                </h3>

                <div className="w-full mt-5 space-y-2.5 text-left border-t border-[#E4E6EB]/80 pt-4 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-[#E4E6EB]/40">
                    <span className="text-[#5B5F6B]">হাসপাতাল:</span>
                    <span className="font-bold text-[#1B1B1F] text-right truncate max-w-[280px]">{hospitalName}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-[#E4E6EB]/40">
                    <span className="text-[#5B5F6B]">কখন লাগবে:</span>
                    <span className="font-bold text-[#C41E3A]">
                      {urgency === 'now' ? 'এখনই (জরুরি)' : urgency === 'today' ? 'আজকের মধ্যে' : '২৪-৪৮ ঘণ্টার মধ্যে'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-[#E4E6EB]/40">
                    <span className="text-[#5B5F6B]">ওয়ার্ড ও বেড:</span>
                    <span className="font-bold text-[#1B1B1F]">ওয়ার্ড {wardNumber}, বেড {bedNumber}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-[#E4E6EB]/40">
                    <span className="text-[#5B5F6B]">রোগীর নাম ও সম্পর্ক:</span>
                    <span className="font-bold text-[#1B1B1F]">{patientName} ({patientRelation})</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-[#E4E6EB]/40">
                    <span className="text-[#5B5F6B]">চিকিৎসার কারণ:</span>
                    <span className="font-bold text-[#1B1B1F]">{reason}</span>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <span className="text-[#5B5F6B]">যোগাযোগ নম্বর:</span>
                    <span className="font-bold text-[#16A34A]">{contactNumber} (যাচাইকৃত)</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="w-full h-11 rounded-2xl bg-[#F7F7F9] hover:bg-[#F0EDF2] text-[#1B1B1F] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#E4E6EB]/60"
                >
                  <Edit3 className="w-4 h-4 text-[#5B5F6B]" />
                  <span>তথ্য সংশোধন / সম্পাদনা করুন</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 5: POST-SEND SUCCESS SCREEN ================= */}
          {currentStep === 5 && (
            <div className="flex flex-col items-center text-center gap-5 py-6 max-w-xl mx-auto animate-in zoom-in-95 duration-300">
              {/* Radar Broadcast Graphic */}
              <div className="relative flex items-center justify-center my-2">
                <div className="w-24 h-24 rounded-full bg-[#DCFCE7] flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#16A34A] text-white flex items-center justify-center shadow-lg animate-pulse">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                </div>
                <span className="absolute w-28 h-28 rounded-full border-2 border-[#16A34A]/40 animate-ping opacity-60" />
              </div>

              <div>
                <h2 className="font-black text-2xl text-[#1B1B1F]">রক্তের অনুরোধ সফলভাবে প্রচারিত হয়েছে!</h2>
                <p className="text-xs sm:text-sm text-[#5B5F6B] mt-1.5 max-w-md mx-auto">
                  আপনার এলাকার <strong className="text-[#C41E3A] font-extrabold">২৪ জন উপযুক্ত রক্তদাতাকে</strong> জরুরি বার্তা ও নোটিফিকেশন পাঠানো হয়েছে।
                </p>
              </div>

              {/* 3-Step Live Timeline */}
              <div className="w-full bg-white rounded-3xl p-5 shadow-xs border border-[#E4E6EB]/80 text-left space-y-3">
                <span className="text-xs font-bold text-[#5B5F6B] uppercase tracking-wider block">পরবর্তী ধাপসমূহ</span>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2.5 text-[#16A34A] font-bold">
                    <div className="w-5 h-5 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>১. কাছের রক্তদাতাদের মোবাইল স্ক্রিনে জরুরি সংকেত পাঠানো হয়েছে</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#C41E3A] font-bold">
                    <div className="w-5 h-5 rounded-full bg-[#FDECEF] flex items-center justify-center shrink-0">
                      <span className="w-2 h-2 rounded-full bg-[#C41E3A] animate-ping" />
                    </div>
                    <span>২. ডোনাররা সাড়া দিচ্ছেন এবং হাসপাতালে পৌঁছানোর সময় জানাচ্ছেন</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#5B5F6B]">
                    <div className="w-5 h-5 rounded-full bg-[#F7F7F9] flex items-center justify-center shrink-0">
                      <span className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
                    </div>
                    <span>৩. হাসপাতালে উপস্থিত হয়ে রক্ত সংগ্রহ ও যাচাই সম্পন্ন হবে</span>
                  </div>
                </div>
              </div>

              {/* Social Share Card Preview */}
              <div className="w-full bg-[#FDECEF] border border-[#FFDADA] rounded-3xl p-4 flex items-center justify-between text-left">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-[#C41E3A] text-white font-black text-lg flex items-center justify-center shrink-0">
                    {bloodGroup}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1B1B1F] truncate">{hospitalName}</p>
                    <p className="text-[11px] text-[#5B5F6B] mt-0.5">
                      {toBengaliDigits(bagCount)} ব্যাগ রক্ত • {urgency === 'now' ? 'এখনই লাগবে' : 'আজকের মধ্যে'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleShare}
                  className="h-10 px-4 rounded-xl bg-white text-[#C41E3A] font-bold text-xs flex items-center gap-1.5 shadow-xs hover:bg-[#FFF5F5] active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>শেয়ার</span>
                </button>
              </div>

              <button
                onClick={onViewCreatedRequest || handleExit}
                className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#9E0027] to-[#C41E3A] text-white font-bold text-sm shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{language === 'bn' ? 'অনুরোধের অগ্রগতি ট্র্যাক করুন' : 'Track Request Progress'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Bottom Navigation CTA */}
          {currentStep <= 4 && (
            <div className="pt-2">
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#9E0027] to-[#C41E3A] hover:from-[#80001F] hover:to-[#B01A33] text-white font-bold text-base flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(196,30,58,0.28)] active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{language === 'bn' ? 'অনুরোধ প্রচার করা হচ্ছে...' : 'Broadcasting Request...'}</span>
                  </>
                ) : currentStep < 3 ? (
                  <>
                    <span>{language === 'bn' ? 'পরের ধাপে যান' : 'Next Step'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : currentStep === 3 ? (
                  <>
                    <span>{language === 'bn' ? 'রিভিউ ও নিশ্চিতকরণে যান' : 'Review & Confirm'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    <span>{language === 'bn' ? 'অনুরোধ নিশ্চিত ও প্রচার করুন' : 'Confirm & Broadcast Request'}</span>
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ================= DESKTOP & TABLET RIGHT SIDEBAR (Live Preview & Guide) ================= */}
        {currentStep <= 4 && (
          <div className="hidden lg:block lg:col-span-5 space-y-4 sticky top-16">
            {/* Live Feed Request Preview Card */}
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E4E6EB]/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5B5F6B] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C41E3A]" />
                  ডোনারদের স্ক্রিনে যেভাবে দেখা যাবে
                </span>
                <span className="text-[10px] bg-[#F7F7F9] text-[#5B5F6B] font-semibold px-2 py-0.5 rounded-full">
                  লাইভ প্রিভিউ
                </span>
              </div>

              {/* Feed Preview Simulation Card */}
              <div className="bg-[#FAF9FB] rounded-2xl p-4 border border-[#E4E6EB]/80 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#FDECEF] to-[#FFDAD6] text-[#C41E3A] font-black text-xl flex flex-col items-center justify-center shadow-xs">
                      {bloodGroup}
                      <span className="text-[9px] text-[#9E0027] font-bold">
                        {toBengaliDigits(bagCount)} ব্যাগ
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1B1B1F] line-clamp-1">
                        {hospitalName || 'হাসপাতালের নাম'}
                      </h4>
                      <p className="text-[11px] text-[#5B5F6B] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#C41E3A]" />
                        <span>বগুড়া সদর • প্রায় ২.৪ কিমি</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#FFDAD6] text-[#9E0027] font-bold px-2 py-0.5 rounded-full shrink-0">
                    {urgency === 'now' ? 'এখনই লাগবে' : 'আজকের মধ্যে'}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl text-xs text-[#5B5F6B] flex items-center justify-between border border-[#E4E6EB]/50">
                  <span className="truncate">{reason || 'জরুরি অপারেশন'}</span>
                  <span className="text-[#C41E3A] font-semibold shrink-0 ml-1">জরুরি সহায়তা</span>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-[#5B5F6B]">
                  <span>এইমাত্র পোস্ট করা হয়েছে</span>
                  <span className="text-[#16A34A] font-bold">সাড়া দিতে প্রস্তুত</span>
                </div>
              </div>

              {/* Estimated Donor Pool Gauge */}
              <div className="p-3.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#166534] block">
                    আনুমানিক {toBengaliDigits(24)} জন {bloodGroup} ডোনার
                  </span>
                  <span className="text-[10px] text-[#15803D]">আপনার নির্বাচিত এলাকার ৫ কিমিতে সক্রিয়</span>
                </div>
                <span className="text-xs font-extrabold text-[#166534] bg-white px-2.5 py-1 rounded-full border border-[#BBF7D0] shadow-xs">
                  উচ্চ সম্ভাবনা
                </span>
              </div>
            </div>

            {/* Safety & Humanitarian Guarantee Card */}
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E4E6EB]/80 space-y-3">
              <div className="flex items-center gap-2 text-[#0D58C9]">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <h4 className="font-extrabold text-sm text-[#001946]">মানবিক ও আইনি সুরক্ষা</h4>
              </div>
              <ul className="text-xs text-[#5B5F6B] space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mt-1.5 shrink-0" />
                  <span>রক্ত কেনাবেচা সম্পূর্ণ নিষিদ্ধ ও আইনত দণ্ডনীয় অপরাধ।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D58C9] mt-1.5 shrink-0" />
                  <span>আপনার ব্যক্তিগত মোবাইল নম্বর সুরক্ষিত এনক্রিপশনে রাখা হয়।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C41E3A] mt-1.5 shrink-0" />
                  <span>জরুরি স্বাস্থ্য প্রয়োজনে জাতীয় হেল্পলাইন <strong>১৬২৬৩</strong>-এ যোগাযোগ করুন।</span>
                </li>
              </ul>
            </div>
          </div>
        )}

      </div>
      </div>
    </div>
  );
};
