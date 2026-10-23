'use client';

import React, { useState } from 'react';
import {
  X,
  Heart,
  Clock,
  Check,
  AlertCircle,
  Share2,
  Navigation,
  Droplet,
  ShieldAlert,
  Bike,
  Car,
  Footprints,
  Bus,
} from 'lucide-react';
import { EmergencyRequest, TransportMode } from '@/lib/types';
import { toBengaliDigits } from '@/lib/bengali-utils';
import { useToast } from '@/components/ui/ToastNotification';
import {
  CLINICAL_CROSSMATCH_DISCLAIMER,
  RECOVERY_PERIOD_DISCLAIMER,
  TRANSPORT_MODES,
  getTransportLabel,
} from '@/lib/services/bloodService';

interface DonorResponseModalProps {
  request: EmergencyRequest | null;
  onClose: () => void;
  onSuccessResponse: (etaMinutes: number, transportMode: TransportMode) => void;
}

export const DonorResponseModal: React.FC<DonorResponseModalProps> = ({
  request,
  onClose,
  onSuccessResponse,
}) => {
  const { showToast } = useToast();
  // Steps:
  // 1: Decision screen ("আমি আসতে পারব" vs "এখন পারব না")
  // 2: Guilt-free rejection screen ("ঠিক আছে, ধন্যবাদ...")
  // 3: ETA selection (১৫, ৩০, ৪৫, ৬০ মিনিট) & Transportation Mode Selection
  // 4: 5-Question Quick Eligibility Checklist + Medical Advisory
  // 5: Confirmation with route & preparation tips ("আমি রওনা হয়েছি")
  // 6: Post-donation care & date calculation
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [etaMins, setEtaMins] = useState<number>(30);
  const [transportMode, setTransportMode] = useState<TransportMode>(
    request?.userTransportMode || 'motorcycle'
  );

  // 5 Yes/No checklist answers
  const [checklist, setChecklist] = useState({
    weightOk: true, // ওজন ৪৫ কেজি বা তার বেশি?
    noIllness: true, // গত ১৪ দিনে জ্বর, কাশি বা অ্যান্টিবায়োটিক গ্রহণ করেননি?
    donationGap: true, // শেষ রক্তদান ৩ মাসের বেশি আগে হয়েছে?
    goodSleep: true, // গত রাতে পর্যাপ্ত ঘুম হয়েছে এবং খাওয়া-দাওয়া করেছেন?
    noMajorSurgery: true, // গত ৬ মাসে কোনো বড় সার্জারি বা ট্যাটু করাননি?
  });

  if (!request) return null;

  // Check if request is closed or fulfilled
  const isRequestClosed =
    request.status === 'fulfilled' ||
    request.status === 'cancelled' ||
    request.status === 'expired';

  const isEligible = Object.values(checklist).every(Boolean);

  const handleDecline = () => {
    setStep(2);
  };

  const handleAccept = () => {
    setStep(3);
  };

  const handleEtaNext = () => {
    setStep(4);
  };

  const handleChecklistSubmit = () => {
    if (!isEligible) {
      showToast(
        'এবার হয়তো সম্ভব নয়, তবে আপনার এই মানবিক ইচ্ছাটাই অনেক মূল্যবান। অন্য কাউকে অনুরোধটি জানাতে পারেন।',
        'info'
      );
      return;
    }
    setStep(5);
  };

  const handleConfirmEnRoute = () => {
    onSuccessResponse(etaMins, transportMode);
    setStep(6);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl overflow-y-auto max-h-[90vh] space-y-4 animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E6EB]">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#FDECEF] text-[#C41E3A] font-extrabold flex items-center justify-center text-lg">
              {request.bloodGroup}
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-[#1B1B1F]">জরুরি রক্তদানের ডাক</h3>
              <p className="text-xs text-[#5B5F6B] truncate max-w-[210px]">{request.hospitalName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5B5F6B] hover:bg-[#F7F7F9] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Closed or Cancelled Request Notice */}
        {isRequestClosed ? (
          <div className="space-y-4 py-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-[17px] text-[#1B1B1F]">
                {request.status === 'fulfilled'
                  ? 'এই অনুরোধের রক্ত পাওয়া সম্পন্ন হয়েছে'
                  : 'এই রক্তের অনুরোধটি সমাপ্ত বা বাতিল করা হয়েছে'}
              </h4>
              <p className="text-xs text-[#5B5F6B] mt-1 max-w-xs mx-auto leading-relaxed">
                {request.status === 'fulfilled'
                  ? 'রোগীর প্রয়োজনীয় রক্তের ব্যবস্থা হয়েছে। রক্তদানে আপনার সদা প্রস্তুত মনোভাবের জন্য ধন্যবাদ।'
                  : 'অনুরোধটি বর্তমানে সক্রিয় নেই। নতুন সাড়া গ্রহণ সম্ভব নয়।'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full h-11 rounded-2xl bg-[#F0EDF2] text-[#1B1B1F] font-bold text-xs cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        ) : (
          <>
            {/* Already Responded Warning / Update Banner */}
            {request.hasResponded && (
              <div className="bg-[#EBF3FF] border border-[#BFDBFE] rounded-2xl p-3 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#0D58C9] mt-0.5 shrink-0" />
                <div className="text-xs text-[#0D58C9]">
                  <p className="font-bold">আপনি ইতিমধ্যেই এই অনুরোধে সাড়া দিয়েছেন!</p>
                  <p className="mt-0.5 text-[#1E40AF]">
                    পূর্বে নির্বাচিত পৌঁছানোর আনুমানিক সময়:{' '}
                    <span className="font-extrabold">
                      {toBengaliDigits(request.userResponseEta || 30)} মিনিট
                    </span>
                    । প্রয়োজন হলে আপনি সময় ও যাতায়াতের মাধ্যম পরিবর্তন করতে পারেন।
                  </p>
                </div>
              </div>
            )}

            {/* ================= STEP 1: DECISION SCREEN ================= */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="bg-[#F6F2F8] rounded-2xl p-4 space-y-2 border border-[#E4E6EB]/60">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#1B1B1F]">স্থান: {request.hospitalName}</span>
                    <span className="bg-[#FFDAD6] text-[#BA1A1A] font-bold px-2 py-0.5 rounded-full">
                      {request.urgencyLabel}
                    </span>
                  </div>
                  <p className="text-xs text-[#5B5F6B]">
                    দূরত্ব: {toBengaliDigits(request.distanceKm)} কিমি • প্রয়োজন:{' '}
                    {toBengaliDigits(request.bagsNeeded)} ব্যাগ • {request.timeTarget}
                  </p>
                  <p className="text-xs text-[#1B1B1F] font-medium pt-1">
                    রোগী: {request.patientName || 'জরুরি অপারেশন রোগী'} • ওয়ার্ড{' '}
                    {request.wardNumber || '৪'}, বেড {request.bedNumber || '১২'}
                  </p>
                </div>

                {/* Medical Advisory Box */}
                <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-2xl p-3 flex items-start gap-2 text-xs text-[#7A4F01]">
                  <ShieldAlert className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <span className="font-bold">চিকিৎসাগত নির্দেশিকা:</span> রক্তদানের আগে হাসপাতালে
                    ক্রস-ম্যাচিং ও প্রাথমিক পরীক্ষা বাধ্যতামূলক।
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleAccept}
                    className="w-full h-13 rounded-2xl bg-[#C41E3A] hover:bg-[#9E0027] text-white font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                    <span>
                      {request.hasResponded ? 'সাড়া তথ্য আপডেট করুন' : 'আমি আসতে পারব'}
                    </span>
                  </button>

                  <button
                    onClick={handleDecline}
                    className="w-full h-12 rounded-2xl bg-[#F0EDF2] hover:bg-[#E4E6EB] text-[#5B5F6B] font-bold text-xs active:scale-98 transition-all cursor-pointer"
                  >
                    এখন পারব না
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 2: GUILT-FREE REJECTION ================= */}
            {step === 2 && (
              <div className="text-center space-y-4 py-2">
                <div className="w-14 h-14 rounded-full bg-[#F0EDF2] flex items-center justify-center text-[#5B5F6B] mx-auto">
                  <Heart className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="font-bold text-[18px] text-[#1B1B1F]">ঠিক আছে, ধন্যবাদ।</h3>
                  <p className="text-xs text-[#5B5F6B] mt-1 leading-relaxed max-w-xs mx-auto">
                    আপনার পরিস্থিতি আমরা বুঝতে পারছি। কোনো অপরাধবোধের কারণ নেই। আপনি চাইলে
                    অনুরোধটি আপনার পরিচিত অন্য কোনো রক্তদাতাকে জানাতে পারেন।
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator
                          .share({
                            title: `জরুরি রক্ত দরকার: ${request.bloodGroup}`,
                            text: `${request.hospitalName}-এ জরুরি ${request.bloodGroup} রক্ত প্রয়োজন।`,
                            url: window.location.href,
                          })
                          .catch(() => {});
                      } else {
                        showToast('অনুরোধের তথ্য কপি করা হয়েছে!', 'info');
                      }
                    }}
                    className="flex-1 h-11 rounded-2xl bg-[#FDECEF] text-[#C41E3A] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>অন্যকে জানান (শেয়ার)</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 h-11 rounded-2xl bg-[#F0EDF2] text-[#1B1B1F] font-bold text-xs cursor-pointer"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 3: ETA & TRANSPORT SELECTION ================= */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-[16px] text-[#1B1B1F]">
                    পৌঁছানোর আনুমানিক সময় (ETA)
                  </h3>
                  <p className="text-xs text-[#5B5F6B] mt-0.5">
                    রোগীর স্বজনদের আশ্বস্ত করতে সঠিক আনুমানিক সময় নির্বাচন করুন
                  </p>
                </div>

                {/* 15, 30, 45, 60 minutes ETA Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { mins: 15, label: '১৫ মিনিট' },
                    { mins: 30, label: '৩০ মিনিট' },
                    { mins: 45, label: '৪৫ মিনিট' },
                    { mins: 60, label: '৬০ মিনিট' },
                  ].map((item) => (
                    <button
                      key={item.mins}
                      type="button"
                      onClick={() => setEtaMins(item.mins)}
                      className={`h-14 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                        etaMins === item.mins
                          ? 'bg-[#C41E3A] text-white shadow-md font-bold'
                          : 'bg-[#F7F7F9] text-[#1B1B1F] hover:bg-[#F0EDF2] font-semibold border border-[#E4E6EB]/60'
                      }`}
                    >
                      <Clock className="w-4 h-4 mb-0.5" />
                      <span className="text-xs">{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* Transport Mode Selection */}
                <div>
                  <h4 className="font-bold text-[14px] text-[#1B1B1F]">যাতায়াতের মাধ্যম নির্বাচন</h4>
                  <p className="text-[11px] text-[#5B5F6B] mt-0.5">
                    আপনি কীভাবে হাসপাতালে যাচ্ছেন তা নির্বাচন করুন
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {TRANSPORT_MODES.map((mode: { id: TransportMode; label: string; icon: string }) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setTransportMode(mode.id)}
                      className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all text-xs cursor-pointer ${
                        transportMode === mode.id
                          ? 'bg-[#FDECEF] border-2 border-[#C41E3A] text-[#C41E3A] font-bold shadow-xs'
                          : 'bg-[#F7F7F9] text-[#5B5F6B] hover:bg-[#F0EDF2] border border-[#E4E6EB]/60 font-medium'
                      }`}
                    >
                      <span className="text-xl">{mode.icon}</span>
                      <span className="text-[11px] text-center leading-tight">{mode.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleEtaNext}
                  className="w-full h-12 rounded-2xl bg-[#C41E3A] hover:bg-[#9E0027] text-white font-bold text-xs shadow-md cursor-pointer transition-all active:scale-98"
                >
                  পরের ধাপে যান (স্বাস্থ্য ও সামঞ্জস্য যাচাই)
                </button>
              </div>
            )}

            {/* ================= STEP 4: 5-QUESTION QUICK ELIGIBILITY CHECKLIST ================= */}
            {step === 4 && (
              <div className="space-y-3.5">
                <div>
                  <h3 className="font-bold text-[16px] text-[#1B1B1F]">দ্রুত স্বাস্থ্য ও যোগ্যতা যাচাই</h3>
                  <p className="text-xs text-[#5B5F6B] mt-0.5">
                    আপনার ও রক্তগ্রহীতার সুরক্ষার্থে ৫টি সহজ প্রশ্নের উত্তর দিন
                  </p>
                </div>

                {/* Prominent Clinical Disclaimer Alert */}
                <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-2xl p-3 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#7A4F01] leading-relaxed">
                    <span className="font-bold">চিকিৎসাগত সতর্কতা:</span> এই প্রশ্নাবলী এবং রক্তের
                    সামঞ্জস্যতা কেবল প্রাথমিক নির্দেশনামূলক। হাসপাতালে রক্তদানের পূর্বে চিকিৎসকের
                    তত্ত্বাবধানে রক্তের ক্রস-ম্যাচিং (Cross-matching) ও স্বাস্থ্য পরীক্ষা বাধ্যতামূলক।
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    { key: 'weightOk', q: 'আপনার ওজন ৪৫ কেজি বা তার বেশি?' },
                    { key: 'noIllness', q: 'গত ১৪ দিনে জ্বর, ফ্লু বা কোনো অ্যান্টিবায়োটিক নেননি?' },
                    {
                      key: 'donationGap',
                      q: 'আপনার শেষ রক্তদান কমপক্ষে ৩ মাস (৯০ দিন) আগে হয়েছে?',
                    },
                    { key: 'goodSleep', q: 'গত রাতে পর্যাপ্ত ঘুম ও আজ খাবার খেয়েছেন?' },
                    { key: 'noMajorSurgery', q: 'গত ৬ মাসে কোনো বড় সার্জারি বা রক্ত সংক্রমণ হয়নি?' },
                  ].map((item) => {
                    const isChecked = checklist[item.key as keyof typeof checklist];
                    return (
                      <div
                        key={item.key}
                        onClick={() =>
                          setChecklist((prev) => ({
                            ...prev,
                            [item.key]: !prev[item.key as keyof typeof checklist],
                          }))
                        }
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-[#E8F5E9] border-[#A5D6A7] text-[#005938]'
                            : 'bg-[#FFDAD6]/40 border-[#FFDAD6] text-[#BA1A1A]'
                        }`}
                      >
                        <span className="font-semibold pr-2">{item.q}</span>
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            isChecked ? 'bg-[#00744B] text-white' : 'bg-[#BA1A1A] text-white'
                          }`}
                        >
                          {isChecked ? 'হ্যাঁ' : 'না'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {!isEligible && (
                  <p className="text-xs text-[#BA1A1A] bg-[#FFDAD6]/60 p-2.5 rounded-xl font-medium leading-relaxed">
                    এবার হয়তো সম্ভব নয়, তবে আপনার এই ইচ্ছাটাই মূল্যবান। আপনি চাইলে অন্য কাউকে জানাতে
                    পারেন।
                  </p>
                )}

                <button
                  onClick={handleChecklistSubmit}
                  disabled={!isEligible}
                  className="w-full h-12 rounded-2xl bg-[#C41E3A] hover:bg-[#9E0027] text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer active:scale-98 transition-all"
                >
                  নিশ্চিতকরণে এগিয়ে যান
                </button>
              </div>
            )}

            {/* ================= STEP 5: CONFIRMATION & EN ROUTE ================= */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="text-center">
                  <span className="w-10 h-10 rounded-full bg-[#E8F5E9] text-[#00744B] flex items-center justify-center mx-auto mb-2">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </span>
                  <h3 className="font-bold text-[17px] text-[#1B1B1F]">আপনি রক্তদানে প্রস্তুত</h3>
                  <p className="text-xs text-[#5B5F6B] mt-0.5">হাসপাতালে পৌঁছানোর জন্য প্রস্তুতি নিন</p>
                </div>

                {/* Selected Summary Card */}
                <div className="bg-[#F7F7F9] rounded-2xl p-3 border border-[#E4E6EB]/80 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[#5B5F6B]">পৌঁছানোর সময়:</span>
                    <span className="font-bold text-[#C41E3A]">
                      {toBengaliDigits(etaMins)} মিনিটের মধ্যে
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#5B5F6B]">যাতায়াতের মাধ্যম:</span>
                    <span className="font-bold text-[#1B1B1F]">
                      {getTransportLabel(transportMode)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#5B5F6B]">গন্তব্য:</span>
                    <span className="font-bold text-[#1B1B1F] truncate max-w-[200px]">
                      {request.hospitalName}
                    </span>
                  </div>
                </div>

                {/* Preparation Tips Box */}
                <div className="bg-[#F6F2F8] rounded-2xl p-3.5 text-xs text-[#1B1B1F] space-y-1.5 border border-[#E4E6EB]/60">
                  <span className="font-bold text-[#C41E3A] block">প্রস্তুতির জরুরি টিপস:</span>
                  <p>• প্রচুর পানি বা তরল খাবার পান করুন।</p>
                  <p>• হালকা পুষ্টিকর খাবার খেয়ে বের হন, খালি পেটে রক্ত দেবেন না।</p>
                  <p>• সাথে জাতীয় পরিচয়পত্র বা যেকোনো আইডি কার্ড রাখুন।</p>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(request.hospitalName)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 h-11 rounded-2xl bg-white border border-[#0D58C9] text-[#0D58C9] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>ম্যাপে রুট খুলুন</span>
                  </a>

                  <button
                    onClick={handleConfirmEnRoute}
                    className="flex-1 h-11 rounded-2xl bg-[#00744B] hover:bg-[#005938] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>আমি রওনা হয়েছি</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 6: POST-DONATION CARE ================= */}
            {step === 6 && (
              <div className="text-center space-y-4 py-2 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center mx-auto shadow-md">
                  <Droplet className="w-8 h-8 fill-current" />
                </div>

                <div>
                  <h3 className="font-extrabold text-[19px] text-[#1B1B1F]">
                    ধন্যবাদ। আপনার রক্তদান একটি পরিবারের পাশে দাঁড়িয়েছে।
                  </h3>
                  <p className="text-xs text-[#5B5F6B] mt-1 max-w-xs mx-auto leading-relaxed">
                    পরবর্তী রক্তদানের যোগ্যতা স্বয়ংক্রিয়ভাবে ক্যালেন্ডারে যুক্ত করা হয়েছে। এখন অন্তত
                    ২০ মিনিট বিশ্রাম নিন এবং তরল পানীয় পান করুন।
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="w-full h-12 rounded-2xl bg-[#C41E3A] hover:bg-[#9E0027] text-white font-bold text-xs cursor-pointer"
                >
                  সম্পন্ন করুন
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
