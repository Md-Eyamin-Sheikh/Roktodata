'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  MapPin,
  ShieldCheck,
  X,
  Droplet
} from 'lucide-react';
import { BloodGroup, UserProfile } from '@/lib/types';
import { districtList } from '@/lib/data';

interface DonorProfileSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: Partial<UserProfile>) => void;
}

export const DonorProfileSetupWizard: React.FC<DonorProfileSetupWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | 'unknown'>('B+');
  const [neverDonated, setNeverDonated] = useState(true);
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('বগুড়া');
  const [phoneVisibleToFamily, setPhoneVisibleToFamily] = useState(true);
  const [quietHours, setQuietHours] = useState(true);

  if (!isOpen) return null;

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const handleFinish = () => {
    onComplete({
      bloodGroup: bloodGroup === 'unknown' ? 'B+' : bloodGroup,
      location: selectedDistrict,
      lastDonationDate: neverDonated ? 'কখনো দিইনি' : lastDonationDate,
      phoneVisibility: phoneVisibleToFamily ? 'verified_family' : 'all_registered',
      quietHoursEnabled: quietHours,
      isProfileComplete: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#E4E6EB]/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#C41E3A]">ধাপ {step}/৪</span>
            <span className="text-xs font-bold text-[#1B1B1F]">ডোনার প্রোফাইল সেটআপ</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-[#5B5F6B] hover:text-[#BA1A1A]"
          >
            পরে করব
          </button>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-4 gap-1 px-4 pt-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s <= step ? 'bg-[#C41E3A]' : 'bg-[#E4E6EB]'
              }`}
            />
          ))}
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* ================= STEP 1: BLOOD GROUP ================= */}
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-[17px] text-[#1B1B1F]">আপনার রক্তের গ্রুপ কী?</h3>
                <p className="text-xs text-[#5B5F6B] mt-0.5">সঠিক গ্রুপ জানা থাকলে জরুরি মুহূর্তে দ্রুত সাড়া দিতে পারবেন</p>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {bloodGroups.map((g) => (
                  <button
                    key={g}
                    onClick={() => setBloodGroup(g)}
                    className={`h-14 rounded-2xl font-extrabold text-lg flex items-center justify-center transition-all ${
                      bloodGroup === g
                        ? 'bg-[#FDECEF] text-[#C41E3A] ring-2 ring-[#C41E3A]'
                        : 'bg-[#F7F7F9] text-[#1B1B1F] hover:bg-[#F0EDF2]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setBloodGroup('unknown')}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  bloodGroup === 'unknown'
                    ? 'bg-[#FDECEF] border-[#C41E3A] text-[#C41E3A]'
                    : 'bg-[#F7F7F9] border-[#E4E6EB] text-[#5B5F6B]'
                }`}
              >
                এখনো রক্তের গ্রুপ জানি না (পরবর্তীতে টেস্ট করব)
              </button>
            </div>
          )}

          {/* ================= STEP 2: LAST DONATION DATE ================= */}
          {step === 2 && (
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-[17px] text-[#1B1B1F]">সর্বশেষ কবে রক্ত দিয়েছেন?</h3>
                <p className="text-xs text-[#5B5F6B] mt-0.5">আপনার শরীর সতেজ ও সুস্থ রাখতে সঠিক বিরতি গণনা করা হবে</p>
              </div>

              {!neverDonated ? (
                <div className="space-y-2">
                  <label className="text-xs text-[#5B5F6B] block">তারিখ নির্বাচন করুন</label>
                  <input
                    type="date"
                    value={lastDonationDate}
                    onChange={(e) => setLastDonationDate(e.target.value)}
                    className="w-full h-12 px-3 rounded-xl bg-[#F7F7F9] border border-[#E4E6EB] text-sm text-[#1B1B1F] outline-none"
                  />
                </div>
              ) : null}

              <button
                onClick={() => setNeverDonated((v) => !v)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  neverDonated
                    ? 'bg-[#FDECEF] border-[#C41E3A] text-[#C41E3A]'
                    : 'bg-[#F7F7F9] border-[#E4E6EB] text-[#5B5F6B]'
                }`}
              >
                {neverDonated ? '✓ কখনো রক্ত দিইনি (নতুন রক্তদাতা)' : 'কখনো রক্ত দিইনি'}
              </button>
            </div>
          )}

          {/* ================= STEP 3: LOCATION ================= */}
          {step === 3 && (
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-[17px] text-[#1B1B1F]">আপনার বর্তমান এলাকা</h3>
                <p className="text-xs text-[#5B5F6B] mt-0.5">শুধুমাত্র এলাকা/উপজেলা দেখানো হবে, বাসার ঠিকানা গোপন থাকবে</p>
              </div>

              <button
                onClick={() => setSelectedDistrict('বগুড়া সদর')}
                className="w-full h-11 rounded-xl bg-[#D9E2FF] text-[#001946] text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-[#0D58C9]" />
                <span>আমার বর্তমান অবস্থান ব্যবহার করুন (বগুড়া সদর)</span>
              </button>

              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {districtList.map((dist) => (
                  <button
                    key={dist}
                    onClick={() => setSelectedDistrict(dist)}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between ${
                      selectedDistrict === dist
                        ? 'bg-[#FDECEF] text-[#C41E3A]'
                        : 'hover:bg-[#F7F7F9] text-[#1B1B1F]'
                    }`}
                  >
                    <span>{dist}</span>
                    {selectedDistrict === dist && <Check className="w-4 h-4 text-[#C41E3A]" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================= STEP 4: PRIVACY ================= */}
          {step === 4 && (
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-[17px] text-[#1B1B1F]">গোপনীয়তা ও যোগাযোগের পছন্দ</h3>
                <p className="text-xs text-[#5B5F6B] mt-0.5">আপনার নিয়ন্ত্রণেই থাকবে প্রতিটি নোটিফিকেশন ও কল</p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-[#F7F7F9] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#1B1B1F] block">অনুমোদিত রোগীর স্বজনদের নম্বর দেখানো</span>
                    <span className="text-[11px] text-[#5B5F6B]">প্রেসক্রিপশন ভেরিফাইড হলে নম্বর উন্মুক্ত হবে</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={phoneVisibleToFamily}
                    onChange={(e) => setPhoneVisibleToFamily(e.target.checked)}
                    className="w-4 h-4 accent-[#C41E3A]"
                  />
                </div>

                <div className="p-3 bg-[#F7F7F9] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#1B1B1F] block">রাতের নীরব সময় (রাত ১১টা - সকাল ৬টা)</span>
                    <span className="text-[11px] text-[#5B5F6B]">শুধুমাত্র অতি জরুরি অনুরোধে কল বেজে উঠবে</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={quietHours}
                    onChange={(e) => setQuietHours(e.target.checked)}
                    className="w-4 h-4 accent-[#C41E3A]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="p-4 border-t border-[#E4E6EB]/50 bg-[#F7F7F9] flex gap-2">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => (s - 1) as any)}
              className="flex-1 h-11 rounded-xl bg-white border border-[#E4E6EB] text-[#1B1B1F] font-bold text-xs"
            >
              পিছনে
            </button>
          )}
          <button
            onClick={() => (step < 4 ? setStep((s) => (s + 1) as any) : handleFinish())}
            className="flex-2 h-11 rounded-xl bg-[#C41E3A] hover:bg-[#9E0027] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>{step === 4 ? 'সেটআপ সম্পন্ন করুন' : 'পরের ধাপ'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
