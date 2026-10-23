'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  MapPin,
  ShieldCheck,
  X,
  Droplet,
  Phone,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Building2,
  Lock,
  Moon,
  Heart
} from 'lucide-react';
import { BloodGroup, UserProfile } from '@/lib/types';
import { divisionsList, allDistricts } from '@/lib/geo/bangladeshGeoData';
import {
  completeDonorProfile,
  checkPhoneDuplicate,
  normalizePhoneNumber,
  isValidBdPhoneNumber,
  formatBdPhoneDisplay,
  getAuthenticatedUser
} from '@/lib/services/authService';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface DonorProfileSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: Partial<UserProfile>) => void;
  initialProfile?: Partial<UserProfile>;
}

export const DonorProfileSetupWizard: React.FC<DonorProfileSetupWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialProfile,
}) => {
  const { language, formatDigits } = useLanguage();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('B+');
  const [selectedDivision, setSelectedDivision] = useState('রাজশাহী');
  const [selectedDistrict, setSelectedDistrict] = useState('বগুড়া');
  const [selectedUpazila, setSelectedUpazila] = useState('বগুড়া সদর');
  const [isAvailable, setIsAvailable] = useState(true);
  const [neverDonated, setNeverDonated] = useState(true);
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [phoneVisibleToFamily, setPhoneVisibleToFamily] = useState(true);
  const [quietHours, setQuietHours] = useState(true);

  // Validation & Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingPhone, setIsValidatingPhone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize from current authenticated user or initialProfile on open
  useEffect(() => {
    if (isOpen) {
      const current = getAuthenticatedUser();
      const profile = initialProfile || current;

      if (profile) {
        if (profile.phone) setPhone(profile.phone);
        if (profile.bloodGroup) setBloodGroup(profile.bloodGroup);
        if (profile.division) setSelectedDivision(profile.division);
        if (profile.district) setSelectedDistrict(profile.district);
        if (profile.upazila) setSelectedUpazila(profile.upazila);
        if (profile.isAvailable !== undefined) setIsAvailable(profile.isAvailable);
        if (profile.lastDonationDate && profile.lastDonationDate !== 'কখনো দিইনি' && profile.lastDonationDate !== 'নতুন নিবন্ধিত') {
          setNeverDonated(false);
          setLastDonationDate(profile.lastDonationDate);
        } else {
          setNeverDonated(true);
        }
        if (profile.quietHoursEnabled !== undefined) setQuietHours(profile.quietHoursEnabled);
        if (profile.phoneVisibility) setPhoneVisibleToFamily(profile.phoneVisibility === 'verified_family');
      }

      setStep(1);
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsLoading(false);
    }
  }, [isOpen, initialProfile]);

  // Update district when division changes
  useEffect(() => {
    const districtsInDivision = allDistricts.filter(
      (d) => d.divisionBn === selectedDivision || d.divisionId === selectedDivision
    );
    if (districtsInDivision.length > 0) {
      const match = districtsInDivision.find((d) => d.nameBn === selectedDistrict);
      if (!match) {
        setSelectedDistrict(districtsInDivision[0].nameBn);
        setSelectedUpazila(districtsInDivision[0].upazilas[0] || districtsInDivision[0].nameBn);
      }
    }
  }, [selectedDivision]);

  // Update upazilas when district changes
  useEffect(() => {
    const currentDist = allDistricts.find((d) => d.nameBn === selectedDistrict);
    if (currentDist && currentDist.upazilas.length > 0) {
      if (!currentDist.upazilas.includes(selectedUpazila)) {
        setSelectedUpazila(currentDist.upazilas[0]);
      }
    }
  }, [selectedDistrict]);

  if (!isOpen) return null;

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  // Current districts for selected division
  const currentDivisionDistricts = allDistricts.filter(
    (d) => d.divisionBn === selectedDivision || d.divisionId === selectedDivision
  );

  // Current upazilas for selected district
  const currentDistrictInfo = allDistricts.find((d) => d.nameBn === selectedDistrict);
  const upazilas = currentDistrictInfo?.upazilas || [];

  // Step 1 validation: Mobile Number & Blood Group
  const handleStep1Next = async () => {
    setErrorMessage(null);
    const normPhone = normalizePhoneNumber(phone);

    if (!isValidBdPhoneNumber(normPhone)) {
      setErrorMessage(
        language === 'bn'
          ? 'জরুরি যোগাযোগের জন্য সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: ০১৭১২-৩৪৫৬৭৮)।'
          : 'Please enter a valid 11-digit Bangladesh mobile number (e.g. 01712-345678).'
      );
      return;
    }

    if (!bloodGroup) {
      setErrorMessage(
        language === 'bn'
          ? 'অনুগ্রহ করে আপনার রক্তের গ্রুপ নির্বাচন করুন।'
          : 'Please select your blood group.'
      );
      return;
    }

    // Check for duplicate phone in Supabase
    setIsValidatingPhone(true);
    const currentUser = getAuthenticatedUser();
    const dupCheck = await checkPhoneDuplicate(normPhone, currentUser?.userId);
    setIsValidatingPhone(false);

    if (dupCheck.isDuplicate) {
      setErrorMessage(dupCheck.message || 'এই মোবাইল নম্বরটি ইতিমধ্যে নিবন্ধিত আছে।');
      return;
    }

    setStep(2);
  };

  // Step 2 validation: Division & District
  const handleStep2Next = () => {
    setErrorMessage(null);
    if (!selectedDivision) {
      setErrorMessage(language === 'bn' ? 'অনুগ্রহ করে আপনার বিভাগ নির্বাচন করুন।' : 'Please select your division.');
      return;
    }
    if (!selectedDistrict) {
      setErrorMessage(language === 'bn' ? 'অনুগ্রহ করে আপনার জেলা নির্বাচন করুন।' : 'Please select your district.');
      return;
    }
    setStep(3);
  };

  // Step 3 validation: Donation history
  const handleStep3Next = () => {
    setErrorMessage(null);
    setStep(4);
  };

  // Step 4: Final Submission
  const handleFinish = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const normPhone = normalizePhoneNumber(phone);
    const result = await completeDonorProfile({
      phone: normPhone,
      bloodGroup,
      division: selectedDivision,
      district: selectedDistrict,
      upazila: selectedUpazila,
      isAvailable,
      lastDonationDate: neverDonated ? 'কখনো দিইনি' : lastDonationDate,
      phoneVisibility: phoneVisibleToFamily ? 'verified_family' : 'all_registered',
      quietHoursEnabled: quietHours,
    });

    setIsLoading(false);

    if (result.success && result.user) {
      setSuccessMessage(
        language === 'bn'
          ? 'রক্তদাতা প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!'
          : 'Donor profile saved successfully!'
      );
      if (onComplete) {
        onComplete(result.user);
      }
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setErrorMessage(result.error || 'প্রোফাইল সংরক্ষণ করা সম্ভব হয়নি।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border border-[#E4E6EB]/80 animate-in zoom-in-95 duration-200">
        
        {/* ================= MODAL HEADER ================= */}
        <div className="relative px-5 py-4 bg-gradient-to-r from-[#9E0027] via-[#C41E3A] to-[#BA1A1A] text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
                  }}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}

              <div>
                <h2 className="font-extrabold text-[16px] leading-tight flex items-center gap-1.5">
                  <span>
                    {language === 'bn' ? 'ডোনার প্রোফাইল সেটআপ' : 'Donor Profile Setup'}
                  </span>
                  <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                    {language === 'bn' ? `ধাপ ${formatDigits(step)}/৪` : `Step ${step}/4`}
                  </span>
                </h2>
                <p className="text-[11px] text-white/80 mt-0.5">
                  {step === 1 && (language === 'bn' ? 'মোবাইল নম্বর ও রক্তের গ্রুপ' : 'Mobile & Blood Group')}
                  {step === 2 && (language === 'bn' ? 'বিভাগ, জেলা ও এলাকা' : 'Division & District')}
                  {step === 3 && (language === 'bn' ? 'রক্তদানের ইতিহাস ও প্রাপ্যতা' : 'History & Availability')}
                  {step === 4 && (language === 'bn' ? 'গোপনীয়তা ও নিশ্চিতকরণ' : 'Privacy & Confirmation')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-white/80 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'পরে করব' : 'Later'}
            </button>
          </div>

          {/* Step Progress Line */}
          <div className="grid grid-cols-4 gap-1.5 pt-3">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ================= MODAL BODY ================= */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] flex items-center gap-2 text-xs text-[#005938] animate-in fade-in">
              <Check className="w-4 h-4 text-[#00744B] shrink-0" />
              <span className="font-semibold leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-[#FFDAD6]/60 border border-[#FFDAD6] flex items-center gap-2 text-xs text-[#BA1A1A] animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-[#BA1A1A] shrink-0" />
              <span className="font-semibold leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* ================= STEP 1: MOBILE & BLOOD GROUP ================= */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="p-3 bg-[#FCF9F9] rounded-2xl border border-red-100">
                <span className="text-xs font-bold text-[#9E0027] block">
                  {language === 'bn' ? '💡 জরুরী যোগাযোগের তথ্য' : '💡 Emergency Contact'}
                </span>
                <p className="text-[11px] text-[#5B5F6B] mt-0.5 leading-relaxed">
                  {language === 'bn'
                    ? 'আপনার মোবাইল নম্বর ও রক্তের গ্রুপ দিয়ে প্রোফাইল সম্পূর্ণ করলে জরুরি মুহূর্তে রোগীরা আপনাকে খুঁজে পাবে।'
                    : 'Providing your mobile number and blood group enables nearby patients to reach out in emergencies.'}
                </p>
              </div>

              {/* Mobile Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#1B1B1F] flex items-center gap-1">
                    <span>{language === 'bn' ? 'সচল মোবাইল নম্বর' : 'Mobile Number'}</span>
                    <span className="text-[#C41E3A]">*</span>
                  </label>
                  <span className="text-[10px] bg-[#FDECEF] text-[#C41E3A] px-2 py-0.5 rounded-full font-bold">
                    {language === 'bn' ? 'বাধ্যতামূলক' : 'Mandatory'}
                  </span>
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full h-11 pl-10 pr-3 rounded-2xl bg-[#F7F7F9] border border-[#E4E6EB] text-xs text-[#1B1B1F] outline-none focus:border-[#C41E3A] focus:bg-white transition-colors font-medium"
                  />
                </div>
                <p className="text-[10.5px] text-[#5B5F6B] mt-1">
                  {language === 'bn'
                    ? '১১ ডিজিটের বাংলাদেশি নম্বর (যেমন: ০১৭১২-৩৪৫৬৭৮)।'
                    : '11-digit Bangladeshi mobile number.'}
                </p>
              </div>

              {/* Blood Group Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#1B1B1F]">
                    {language === 'bn' ? 'আপনার রক্তের গ্রুপ' : 'Blood Group'} *
                  </label>
                  <span className="text-[11px] font-black text-[#C41E3A] bg-[#FDECEF] px-2.5 py-0.5 rounded-lg">
                    {bloodGroup}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {bloodGroups.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setBloodGroup(bg)}
                      className={`h-11 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center ${
                        bloodGroup === bg
                          ? 'bg-[#C41E3A] text-white shadow-xs scale-102 ring-2 ring-[#C41E3A]/30'
                          : 'bg-[#F7F7F9] text-[#1B1B1F] hover:bg-[#EBE9EE] border border-[#E4E6EB]'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: DIVISION, DISTRICT & UPAZILA ================= */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
              {/* Division Selection */}
              <div>
                <label className="block text-xs font-bold text-[#1B1B1F] mb-1">
                  {language === 'bn' ? '১. বিভাগ নির্বাচন করুন' : '1. Select Division'} *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <select
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#F7F7F9] border border-[#E4E6EB] text-xs text-[#1B1B1F] outline-none focus:border-[#C41E3A] focus:bg-white transition-colors cursor-pointer"
                  >
                    {divisionsList.map((div) => (
                      <option key={div.id} value={div.nameBn}>
                        {div.nameBn} বিভাগ ({language === 'bn' ? `${formatDigits(div.districtCount)}টি জেলা` : `${div.districtCount} Districts`})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* District Selection */}
              <div>
                <label className="block text-xs font-bold text-[#1B1B1F] mb-1">
                  {language === 'bn' ? '২. জেলা নির্বাচন করুন' : '2. Select District'} *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#F7F7F9] border border-[#E4E6EB] text-xs text-[#1B1B1F] outline-none focus:border-[#C41E3A] focus:bg-white transition-colors cursor-pointer"
                  >
                    {currentDivisionDistricts.map((dist) => (
                      <option key={dist.id} value={dist.nameBn}>
                        {dist.nameBn} ({dist.nameEn})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Upazila Selection */}
              {upazilas.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-[#1B1B1F] mb-1">
                    {language === 'bn' ? '৩. উপজেলা / এলাকা' : '3. Upazila / Area'}
                  </label>
                  <select
                    value={selectedUpazila}
                    onChange={(e) => setSelectedUpazila(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-2xl bg-[#F7F7F9] border border-[#E4E6EB] text-xs text-[#1B1B1F] outline-none focus:border-[#C41E3A] focus:bg-white transition-colors cursor-pointer"
                  >
                    {upazilas.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 3: DONATION HISTORY & AVAILABILITY ================= */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
              {/* Ready to Donate Toggle */}
              <div className="p-3.5 bg-[#F7F7F9] rounded-2xl border border-[#E4E6EB] flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-[#1B1B1F] block">
                    {language === 'bn' ? 'রক্তদানে সক্রিয় ও প্রস্তুত' : 'Ready & Active to Donate'}
                  </span>
                  <span className="text-[11px] text-[#5B5F6B] mt-0.5 block">
                    {language === 'bn'
                      ? 'জরুরি রক্তের প্রয়োজনে আশেপাশের রোগীরা আপনাকে দেখতে পাবেন'
                      : 'Nearby patients can find you in emergency situations'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-5 h-5 accent-[#C41E3A] rounded cursor-pointer shrink-0"
                />
              </div>

              {/* Last Donation Date */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1B1B1F]">
                  {language === 'bn' ? 'সর্বশেষ কবে রক্ত দিয়েছেন?' : 'Last Donation Date'}
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNeverDonated(true)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      neverDonated
                        ? 'bg-[#FDECEF] border-[#C41E3A] text-[#C41E3A]'
                        : 'bg-[#F7F7F9] border-[#E4E6EB] text-[#5B5F6B]'
                    }`}
                  >
                    {language === 'bn' ? '✓ কখনো দিইনি (নতুন)' : 'Never donated'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNeverDonated(false)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      !neverDonated
                        ? 'bg-[#FDECEF] border-[#C41E3A] text-[#C41E3A]'
                        : 'bg-[#F7F7F9] border-[#E4E6EB] text-[#5B5F6B]'
                    }`}
                  >
                    {language === 'bn' ? 'তারিখ জানি' : 'Specify Date'}
                  </button>
                </div>

                {!neverDonated && (
                  <div className="pt-1">
                    <input
                      type="date"
                      value={lastDonationDate}
                      onChange={(e) => setLastDonationDate(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-2xl bg-[#F7F7F9] border border-[#E4E6EB] text-xs text-[#1B1B1F] outline-none focus:border-[#C41E3A]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 4: PRIVACY & CONFIRMATION ================= */}
          {step === 4 && (
            <div className="space-y-3.5 animate-in fade-in slide-in-from-right-3 duration-200">
              {/* Privacy toggles */}
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-[#F7F7F9] rounded-2xl border border-[#E4E6EB] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#1B1B1F] block">
                      {language === 'bn' ? 'অনুমোদিত রোগীর স্বজনদের নম্বর দেখানো' : 'Visible to Verified Relatives'}
                    </span>
                    <span className="text-[11px] text-[#5B5F6B]">
                      {language === 'bn'
                        ? 'প্রেসক্রিপশন ভেরিফাইড হলে নম্বর উন্মুক্ত হবে'
                        : 'Visible after prescription verification'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={phoneVisibleToFamily}
                    onChange={(e) => setPhoneVisibleToFamily(e.target.checked)}
                    className="w-4 h-4 accent-[#C41E3A] cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-[#F7F7F9] rounded-2xl border border-[#E4E6EB] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#1B1B1F] block">
                      {language === 'bn' ? 'রাতের নীরব সময় (রাত ১১টা – সকাল ৬টা)' : 'Quiet Hours (11 PM - 6 AM)'}
                    </span>
                    <span className="text-[11px] text-[#5B5F6B]">
                      {language === 'bn'
                        ? 'শুধুমাত্র অতি জরুরি অনুরোধে সতর্কবার্তা বাজবে'
                        : 'Only critical life-saving alerts will sound'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={quietHours}
                    onChange={(e) => setQuietHours(e.target.checked)}
                    className="w-4 h-4 accent-[#C41E3A] cursor-pointer"
                  />
                </div>
              </div>

              {/* Profile Summary Card */}
              <div className="p-3 bg-[#FCF9F9] rounded-2xl border border-red-100 space-y-1.5 text-xs">
                <span className="font-extrabold text-[11px] text-[#9E0027] uppercase tracking-wider block mb-1">
                  {language === 'bn' ? '📋 আপনার ডোনার তথ্যের সারসংক্ষেপ' : '📋 Profile Summary'}
                </span>
                <div className="flex justify-between items-center text-[#1B1B1F]">
                  <span className="text-[#5B5F6B]">{language === 'bn' ? 'মোবাইল:' : 'Phone:'}</span>
                  <span className="font-bold font-mono">{formatBdPhoneDisplay(phone)}</span>
                </div>
                <div className="flex justify-between items-center text-[#1B1B1F]">
                  <span className="text-[#5B5F6B]">{language === 'bn' ? 'রক্তের গ্রুপ:' : 'Blood Group:'}</span>
                  <span className="font-black bg-[#C41E3A] text-white px-2 py-0.5 rounded-md text-[11px]">
                    {bloodGroup}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#1B1B1F]">
                  <span className="text-[#5B5F6B]">{language === 'bn' ? 'বিভাগ ও জেলা:' : 'Location:'}</span>
                  <span className="font-bold">{selectedDivision} • {selectedDistrict}{selectedUpazila ? `, ${selectedUpazila}` : ''}</span>
                </div>
                <div className="flex justify-between items-center text-[#1B1B1F]">
                  <span className="text-[#5B5F6B]">{language === 'bn' ? 'প্রাপ্যতা স্ট্যাটাস:' : 'Availability:'}</span>
                  <span className="font-bold text-emerald-700">
                    {isAvailable ? (language === 'bn' ? 'সক্রিয় ও প্রস্তুত' : 'Active & Ready') : (language === 'bn' ? 'সাময়িক বিশ্রামে' : 'Paused')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= MODAL FOOTER ================= */}
        <div className="p-4 border-t border-[#E4E6EB]/60 bg-[#FAF9FB] flex gap-2.5">
          {step > 1 && (
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setStep((s) => (s - 1) as any);
              }}
              className="flex-1 h-12 rounded-2xl bg-white border border-[#E4E6EB] hover:bg-[#F0EDF2] text-[#1B1B1F] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'bn' ? 'পূর্ববর্তী' : 'Back'}</span>
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              disabled={isValidatingPhone}
              onClick={() => {
                if (step === 1) handleStep1Next();
                else if (step === 2) handleStep2Next();
                else if (step === 3) handleStep3Next();
              }}
              className="flex-2 h-12 rounded-2xl bg-gradient-to-r from-[#9E0027] to-[#C41E3A] hover:from-[#80001F] hover:to-[#B01A33] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              {isValidatingPhone ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Validating...'}</span>
                </>
              ) : (
                <>
                  <span>{language === 'bn' ? 'পরবর্তী ধাপ' : 'Next Step'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleFinish}
              className="flex-2 h-12 rounded-2xl bg-gradient-to-r from-[#9E0027] to-[#C41E3A] hover:from-[#80001F] hover:to-[#B01A33] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-current text-white" />
                  <span>{language === 'bn' ? 'সেটআপ সম্পন্ন ও নিশ্চিত করুন' : 'Complete Setup'}</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
