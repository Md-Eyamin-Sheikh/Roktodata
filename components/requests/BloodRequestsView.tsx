'use client';

import React, { useState } from 'react';
import {
  Clock,
  Check,
  Phone,
  MessageSquare,
  Share2,
  Radio,
  XCircle,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Building,
  UserCheck,
  AlertCircle,
  Sparkles,
  Filter,
  Calendar,
  Heart,
  ChevronRight,
  Navigation,
  Activity,
  ShieldAlert,
  X,
} from 'lucide-react';
import { EmergencyRequest, RespondingDonor, BloodGroup } from '@/lib/types';
import { toBengaliDigits } from '@/lib/bengali-utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getTransportLabel } from '@/lib/services/bloodService';

interface BloodRequestsViewProps {
  myRequest: EmergencyRequest | null;
  nearbyRequests: EmergencyRequest[];
  respondingDonors: RespondingDonor[];
  onConfirmDonor: (donorId: string) => void;
  onDeclineDonor?: (donorId: string) => void;
  onOpenDonorResponse: (req: EmergencyRequest) => void;
  onCloseRequest: () => void;
  onShareRequest: () => void;
  onFindMoreDonors: () => void;
  onTabSelectRequestForm: () => void;
  onOpenChat: (donor: RespondingDonor) => void;
  onOpenReport: (targetName: string, targetUserId?: string, requestId?: string) => void;
  onOpenVerificationExplainer?: () => void;
}

export const BloodRequestsView: React.FC<BloodRequestsViewProps> = ({
  myRequest,
  nearbyRequests,
  respondingDonors,
  onConfirmDonor,
  onDeclineDonor,
  onOpenDonorResponse,
  onCloseRequest,
  onShareRequest,
  onFindMoreDonors,
  onTabSelectRequestForm,
  onOpenChat,
  onOpenReport,
  onOpenVerificationExplainer,
}) => {
  const { language, t, formatDigits } = useLanguage();
  const [activeSegment, setActiveSegment] = useState<'my' | 'nearby' | 'regular'>(myRequest ? 'my' : 'nearby');
  const [prevRequestId, setPrevRequestId] = useState<string | undefined>(myRequest?.id);
  const [confirmedDonorId, setConfirmedDonorId] = useState<string | null>(null);
  const [showDonationCelebration, setShowDonationCelebration] = useState(false);

  // Automatically adjust to 'my' segment when user creates an emergency request
  if (myRequest?.id !== prevRequestId) {
    setPrevRequestId(myRequest?.id);
    if (myRequest) {
      setActiveSegment('my');
    }
  }
  const allBloodLabel = language === 'bn' ? 'সব' : 'All';
  const [selectedBloodFilter, setSelectedBloodFilter] = useState<string>('ALL');
  const [selectedDistanceFilter, setSelectedDistanceFilter] = useState<'all' | '5km' | '10km'>('all');

  const bloodGroupOptions = [allBloodLabel, 'A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'];

  const filteredNearby = nearbyRequests.filter((req) => {
    const matchesGroup = selectedBloodFilter === 'ALL' || selectedBloodFilter === allBloodLabel || req.bloodGroup === selectedBloodFilter;
    const matchesDistance =
      selectedDistanceFilter === 'all'
        ? true
        : selectedDistanceFilter === '5km'
        ? req.distanceKm <= 5
        : req.distanceKm <= 10;
    return matchesGroup && matchesDistance;
  });

  const handleConfirm = (id: string, name: string) => {
    setConfirmedDonorId(id);
    onConfirmDonor(id);
    setShowDonationCelebration(true);
    setTimeout(() => {
      setShowDonationCelebration(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-0 md:px-6 2xl:px-8 pb-24 pt-0 md:pt-1">
      {/* ================= PAGE TITLE & BREADCRUMB (Visible on Tablet/Desktop) ================= */}
      <div className="hidden md:flex items-center justify-between pb-3 mb-2 border-b border-[#E4E6EB]/60">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-[#1B1B1F] tracking-tight">
            {t.requests.title}
          </h1>
          <p className="text-xs text-[#5B5F6B] mt-0.5">
            {t.requests.subtitle}
          </p>
        </div>
        <button
          onClick={onTabSelectRequestForm}
          className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#9E0027] to-[#C41E3A] hover:from-[#80001F] hover:to-[#B01A33] text-white text-xs lg:text-sm font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>{t.requests.btnNewRequest}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ================= SEGMENTED NAVIGATION TABS ================= */}
      <div className="sticky top-14 md:top-16 z-20 py-2 bg-[#F7F7F9] border-b border-[#E4E6EB] md:border-b-0">
        <div className="flex items-center gap-1.5 p-1 bg-white md:rounded-2xl border-y md:border border-[#E4E6EB] md:border-[#E4E6EB]/80 max-w-xl md:mx-auto">
          <button
            onClick={() => setActiveSegment('my')}
            className={`flex-1 min-h-[44px] py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeSegment === 'my'
                ? 'bg-[#FDECEF] text-[#C41E3A] shadow-xs'
                : 'text-[#5B5F6B] hover:text-[#1B1B1F] active:bg-[#F7F7F9]'
            }`}
          >
            <span>{t.requests.tabMy}</span>
            {myRequest && (
              <span className="w-5 h-5 rounded-full bg-[#C41E3A] text-white text-[11px] font-bold flex items-center justify-center">
                {formatDigits(1)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSegment('nearby')}
            className={`flex-1 min-h-[44px] py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeSegment === 'nearby'
                ? 'bg-[#FDECEF] text-[#C41E3A] shadow-xs'
                : 'text-[#5B5F6B] hover:text-[#1B1B1F] active:bg-[#F7F7F9]'
            }`}
          >
            <span>{t.requests.tabNearby}</span>
            <span className="w-5 h-5 rounded-full bg-[#F0EDF2] text-[#5B5F6B] text-[11px] font-bold flex items-center justify-center">
              {formatDigits(nearbyRequests.length)}
            </span>
          </button>

          <button
            onClick={() => setActiveSegment('regular')}
            className={`flex-1 min-h-[44px] py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeSegment === 'regular'
                ? 'bg-[#FDECEF] text-[#C41E3A] shadow-xs'
                : 'text-[#5B5F6B] hover:text-[#1B1B1F] active:bg-[#F7F7F9]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t.requests.tabRegular}</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: MY ACTIVE REQUEST ================= */}
      {activeSegment === 'my' && (
        <div className="mt-1 md:mt-2 space-y-3.5 md:space-y-6">
          {myRequest ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 items-start divide-y lg:divide-y-0 divide-[#E4E6EB]">
              
              {/* LEFT COLUMN: Request Card & Real-time Progress Tracking (5 cols on desktop) */}
              <div className="lg:col-span-5 space-y-0 lg:space-y-4">
                {/* Active Request Overview Card */}
                <div className="bg-white border-y lg:border border-[#E4E6EB] lg:border-[#E4E6EB]/80 lg:rounded-3xl p-4 sm:p-5 lg:shadow-xs relative overflow-hidden space-y-4">
                  {/* Top Status Gradient Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C41E3A] via-[#E53935] to-[#FF8A80]" />

                  {/* Request ID & Status Badge Banner */}
                  <div className="flex items-center justify-between bg-[#FAF9FB] px-3 py-1.5 rounded-xl border border-[#E4E6EB]/60 text-xs mt-1">
                    <span className="font-mono text-[#5B5F6B] text-[11px]">
                      আইডি: <strong className="text-[#1B1B1F]">{myRequest.id}</strong>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider ${
                      myRequest.status === 'open' || myRequest.status === 'active'
                        ? 'bg-[#DCFCE7] text-[#166534]'
                        : myRequest.status === 'partially_fulfilled'
                        ? 'bg-[#FEF3C7] text-[#92400E]'
                        : myRequest.status === 'fulfilled'
                        ? 'bg-[#DBEAFE] text-[#1E40AF]'
                        : 'bg-[#F3F4F6] text-[#4B5563]'
                    }`}>
                      {myRequest.status === 'open' || myRequest.status === 'active'
                        ? '● উন্মুক্ত (Open)'
                        : myRequest.status === 'partially_fulfilled'
                        ? `● আংশিক পূরণ (${toBengaliDigits(myRequest.bagsFulfilled || 1)}/${toBengaliDigits(myRequest.bagsNeeded)} ব্যাগ)`
                        : myRequest.status === 'fulfilled'
                        ? '✓ সম্পন্ন (Fulfilled)'
                        : myRequest.status === 'cancelled'
                        ? 'বাতিল (Cancelled)'
                        : 'সক্রিয় (Active)'}
                    </span>
                  </div>

                  {/* Header: Blood Group, Hospital, Urgency */}
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FDECEF] to-[#FFDAD6] border border-[#FFB4AB]/40 flex flex-col items-center justify-center shrink-0 shadow-xs">
                        <span className="font-black text-2xl text-[#C41E3A] leading-none">
                          {myRequest.bloodGroup}
                        </span>
                        <span className="text-[11px] text-[#9E0027] font-bold mt-0.5">
                          {toBengaliDigits(myRequest.bagsNeeded)} ব্যাগ
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h2 className="font-bold text-[16px] md:text-[17px] text-[#1B1B1F] leading-snug">
                            {myRequest.hospitalName}
                          </h2>
                        </div>
                        <p className="text-xs text-[#5B5F6B] mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#C41E3A] shrink-0" />
                          <span>{myRequest.location}</span>
                          <span className="mx-1">•</span>
                          <Clock className="w-3.5 h-3.5 text-[#5B5F6B] shrink-0" />
                          <span className="font-semibold text-[#C41E3A]">{myRequest.timeTarget}</span>
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-[#FFDAD6] text-[#9E0027] text-xs font-bold shrink-0">
                      {myRequest.urgencyLabel}
                    </span>
                  </div>

                  {/* Patient & Hospital Details Tags */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 bg-[#F7F7F9] rounded-xl border border-[#E4E6EB]/50">
                      <span className="text-xs text-[#5B5F6B] font-medium block">রোগীর ধরণ / অবস্থা</span>
                      <span className="text-xs font-bold text-[#1B1B1F] mt-0.5 block truncate">
                        {myRequest.patientType || 'জরুরি অপারেশন'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-[#F7F7F9] rounded-xl border border-[#E4E6EB]/50">
                      <span className="text-xs text-[#5B5F6B] font-medium block">ওয়ার্ড ও বেড নম্বর</span>
                      <span className="text-xs font-bold text-[#1B1B1F] mt-0.5 block truncate">
                        {myRequest.wardBed || 'ওয়ার্ড ৪, বেড ১২'}
                      </span>
                    </div>
                  </div>

                  {/* Prescription Attachment Preview Badge if available */}
                  {(myRequest.prescriptionImageUrl || myRequest.prescriptionSignedUrl) && (
                    <div className="p-2.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-[#166534] font-bold">
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                        <span>ডাক্তারের প্রেসক্রিপশন স্লিপ সংযুক্ত আছে</span>
                      </div>
                      <a
                        href={myRequest.prescriptionSignedUrl || myRequest.prescriptionImageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-[#0D58C9] hover:underline"
                      >
                        ছবি দেখুন
                      </a>
                    </div>
                  )}

                  {/* Live Search Radar Banner */}
                  <div className="flex items-center justify-between bg-gradient-to-r from-[#F0FDF4] to-[#DCFCE7] border border-[#BBF7D0] rounded-2xl p-3">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#16A34A]" />
                      </span>
                      <div>
                        <span className="text-xs font-bold text-[#166534] block leading-tight">
                          নিকটস্থ ডোনারদের সাথে লাইভ কানেক্টেড
                        </span>
                        <span className="text-xs text-[#15803D]">বগুড়া সদর ও ৫ কিমি ব্যাসার্ধ</span>
                      </div>
                    </div>
                    <span className="text-xs bg-white text-[#166534] font-extrabold px-2.5 py-1 rounded-full shadow-xs border border-[#BBF7D0]">
                      {toBengaliDigits(respondingDonors.length)} জন সাড়া
                    </span>
                  </div>

                  {/* 5-Step Vertical Timeline */}
                  <div className="pt-2 border-t border-[#E4E6EB]/60">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#5B5F6B] uppercase tracking-wider">
                        রক্তদান ট্র্যাকিং অগ্রগতি
                      </span>
                      <span className="text-xs font-extrabold text-[#C41E3A] bg-[#FDECEF] px-2.5 py-0.5 rounded-full">
                        ধাপ {toBengaliDigits(myRequest.trackingStep || 3)} / {toBengaliDigits(5)}
                      </span>
                    </div>

                    <div className="relative pl-7 space-y-3.5">
                      {/* Step 1 */}
                      <div className="relative flex items-center justify-between">
                        <div className="absolute -left-7 w-5 h-5 rounded-full bg-[#16A34A] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <div className="absolute -left-[19px] top-5 w-0.5 h-4 bg-[#86EFAC]" />
                        <span className="text-xs font-bold text-[#1B1B1F]">অনুরোধ তৈরি ও যাচাই সম্পন্ন</span>
                        <span className="text-xs text-[#5B5F6B]">১২:৪০ PM</span>
                      </div>

                      {/* Step 2 */}
                      <div className="relative flex items-center justify-between">
                        <div className="absolute -left-7 w-5 h-5 rounded-full bg-[#16A34A] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <div className="absolute -left-[19px] top-5 w-0.5 h-4 bg-[#86EFAC]" />
                        <div>
                          <p className="text-xs font-bold text-[#1B1B1F]">১২ জন উপযুক্ত ডোনারকে বার্তা পাঠানো হয়েছে</p>
                          <p className="text-xs text-[#5B5F6B]">৫ কিমি ব্যাসার্ধের মধ্যে ম্যাচিং</p>
                        </div>
                        <span className="text-[11px] text-[#5B5F6B]">১২:৪২ PM</span>
                      </div>

                      {/* Step 3 (Active) */}
                      <div className="relative bg-[#FDECEF] p-3 rounded-2xl border border-[#FFDADA] -ml-2">
                        <div className="absolute -left-5 top-3.5 w-5 h-5 rounded-full bg-[#C41E3A] text-white flex items-center justify-center shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        </div>
                        <div className="absolute -left-[11px] top-9 w-0.5 h-5 bg-[#E4E6EB]" />
                        <div className="pl-2">
                          <p className="text-xs font-bold text-[#C41E3A]">
                            {toBengaliDigits(respondingDonors.length)} জন ডোনার রক্তদানে প্রস্তুত!
                          </p>
                          <p className="text-[11px] text-[#7A2735] mt-0.5">
                            ডানপাশের তালিকা থেকে ডোনারের সাথে কল বা মেসেজে কথা বলে নিশ্চিত করুন।
                          </p>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className={`relative flex items-center gap-2.5 ${myRequest.trackingStep && myRequest.trackingStep >= 4 ? 'opacity-100 font-bold text-[#16A34A]' : 'opacity-50'}`}>
                        <div className={`absolute -left-7 w-5 h-5 rounded-full flex items-center justify-center ${myRequest.trackingStep && myRequest.trackingStep >= 4 ? 'bg-[#16A34A] text-white' : 'bg-[#E4E6EB] text-[#5B5F6B]'}`}>
                          {myRequest.trackingStep && myRequest.trackingStep >= 4 ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-[#5B5F6B]" />}
                        </div>
                        <div className="absolute -left-[19px] top-5 w-0.5 h-4 bg-[#E4E6EB]" />
                        <span className="text-xs">ডোনার হাসপাতালের পথে রওনা</span>
                      </div>

                      {/* Step 5 */}
                      <div className="relative flex items-center gap-2.5 opacity-50">
                        <div className="absolute -left-7 w-5 h-5 rounded-full bg-[#E4E6EB] text-[#5B5F6B] flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5B5F6B]" />
                        </div>
                        <span className="text-xs text-[#5B5F6B]">রক্তদান সম্পন্ন ও নিরাপদ ব্যাগ গ্রহণ</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-[#E4E6EB]/60 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={onFindMoreDonors}
                        className="h-10 rounded-xl bg-[#F7F7F9] hover:bg-[#F0EDF2] text-[#1B1B1F] flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Radio className="w-3.5 h-3.5 text-[#C41E3A]" />
                        <span>আরও ডোনার খুঁজুন</span>
                      </button>

                      <button
                        onClick={onShareRequest}
                        className="h-10 rounded-xl bg-[#F7F7F9] hover:bg-[#F0EDF2] text-[#1B1B1F] flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5 text-[#0D58C9]" />
                        <span>অনুরোধ শেয়ার</span>
                      </button>
                    </div>

                    <button
                      onClick={onCloseRequest}
                      className="w-full py-2 text-center text-[#5B5F6B] hover:text-[#C41E3A] text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>অনুরোধ বন্ধ করুন (রক্ত পেয়েছি)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Responding Donors Feed (7 cols on desktop) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-[17px] text-[#1B1B1F]">
                      সাড়া দেওয়া ডোনারবৃন্দ
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#C41E3A] text-white text-xs font-bold">
                      {toBengaliDigits(respondingDonors.length)} জন
                    </span>
                  </div>
                  <span className="text-xs text-[#16A34A] font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                    সরাসরি যোগাযোগযোগ্য
                  </span>
                </div>

                {/* Medical Advisory Banner for Blood Matching & Hospital Cross-matching */}
                <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-2xl p-3 flex items-start gap-2.5 text-xs text-[#7A4F01]">
                  <ShieldAlert className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <span className="font-bold">চিকিৎসাগত সতর্কতা ও নির্দেশনা:</span> রক্তের সামঞ্জস্যতা ও সাড়া কেবল প্রাথমিক নির্দেশনামূলক। হাসপাতালে রক্ত সঞ্চালনের পূর্বে সংশ্লিষ্ট ল্যাবরেটরি ও চিকিৎসকের উপস্থিতিতে রক্তের ক্রস-ম্যাচিং (Major & Minor Cross-match) এবং স্বাস্থ্য স্ক্রিনিং পরীক্ষা বাধ্যতামূলক।
                  </p>
                </div>

                {respondingDonors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3.5">
                    {respondingDonors.map((donor) => {
                      const isConfirmed = confirmedDonorId === donor.id || donor.status === 'confirmed';
                      const isDeclined = donor.status === 'declined' || donor.status === 'cancelled';
                      return (
                        <div
                          key={donor.id}
                          className={`bg-white rounded-3xl p-4 sm:p-5 shadow-xs border transition-all flex flex-col justify-between ${
                            isConfirmed
                              ? 'border-[#16A34A] ring-2 ring-[#DCFCE7]'
                              : isDeclined
                              ? 'border-[#E4E6EB] opacity-60 bg-[#FAFAFA]'
                              : 'border-[#E4E6EB]/80 hover:border-[#C41E3A]/40'
                          }`}
                        >
                          <div>
                            {/* Donor Header */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#FDECEF] to-[#FFDADA] text-[#C41E3A] font-extrabold text-lg flex items-center justify-center shadow-xs">
                                    {donor.bloodGroup}
                                  </div>
                                  {donor.isVerified && (
                                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0D58C9] text-white flex items-center justify-center text-[10px] shadow-xs">
                                      ✓
                                    </span>
                                  )}
                                </div>

                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h4 className="font-bold text-[15px] sm:text-[16px] text-[#1B1B1F]">
                                      {donor.name}
                                    </h4>
                                    {donor.isVerified && (
                                      <span className="text-[10px] bg-[#D9E2FF] text-[#001946] font-bold px-1.5 py-0.5 rounded-full">
                                        যাচাইকৃত
                                      </span>
                                    )}
                                    <button
                                      onClick={() => onOpenReport(donor.name, donor.id, myRequest?.id)}
                                      className="text-[#BA1A1A] hover:bg-[#FFDAD6]/40 p-1 rounded-lg text-[10px] font-semibold flex items-center gap-0.5 cursor-pointer ml-1"
                                      title="রিপোর্ট বা অভিযোগ জানান"
                                    >
                                      <AlertCircle className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <p className="text-xs text-[#5B5F6B] mt-0.5 flex items-center gap-1">
                                    <Navigation className="w-3 h-3 text-[#16A34A]" />
                                    <span>
                                      দূরত্ব: {toBengaliDigits(donor.distanceKm)} কিমি •{' '}
                                      <span className="font-bold text-[#1B1B1F]">
                                        {toBengaliDigits(donor.etaMinutes)} মিনিটে
                                      </span>{' '}
                                      পৌঁছাবেন
                                    </span>
                                  </p>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                                  isConfirmed
                                    ? 'bg-[#DCFCE7] text-[#166534]'
                                    : donor.status === 'on_the_way'
                                    ? 'bg-[#FEF3C7] text-[#92400E]'
                                    : isDeclined
                                    ? 'bg-[#FEE2E2] text-[#991B1B]'
                                    : 'bg-[#EFF6FF] text-[#1D4ED8]'
                                }`}
                              >
                                {isConfirmed
                                  ? '✓ নিশ্চিত'
                                  : donor.status === 'on_the_way'
                                  ? 'হাসপাতালের পথে'
                                  : isDeclined
                                  ? 'বাতিল'
                                  : 'অনুরোধ গৃহীত'}
                              </span>
                            </div>

                            {/* Tags & Highlights */}
                            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                              {/* Transport Mode Tag */}
                              <span className="text-[11px] bg-[#F7F7F9] text-[#1B1B1F] px-2.5 py-1 rounded-full font-semibold border border-[#E4E6EB]/60 flex items-center gap-1">
                                <span>{donor.transportLabel || getTransportLabel(donor.transportMode)}</span>
                              </span>

                              <span className="text-[11px] bg-[#F7F7F9] text-[#5B5F6B] px-2 py-1 rounded-full font-semibold border border-[#E4E6EB]/50">
                                {toBengaliDigits(donor.totalDonations ?? 4)} বার রক্তদান
                              </span>

                              {donor.lastDonationMonths && (
                                <span className="text-[11px] bg-[#F7F7F9] text-[#5B5F6B] px-2 py-1 rounded-full font-semibold border border-[#E4E6EB]/50">
                                  শেষ দান: {toBengaliDigits(donor.lastDonationMonths)} মাস আগে
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Interactive Actions */}
                          <div className="grid grid-cols-12 gap-2 mt-4 pt-3 border-t border-[#E4E6EB]/60">
                            <a
                              href={`tel:${donor.phone}`}
                              className="col-span-3 h-10 rounded-xl bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] flex items-center justify-center gap-1 text-xs font-bold transition-all active:scale-95"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>কল</span>
                            </a>

                            <button
                              onClick={() => onOpenChat(donor)}
                              className="col-span-3 h-10 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] flex items-center justify-center gap-1 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>চ্যাট</span>
                            </button>

                            <button
                              onClick={() => handleConfirm(donor.id, donor.name)}
                              disabled={isConfirmed || isDeclined}
                              className={`col-span-5 h-10 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer ${
                                isConfirmed
                                  ? 'bg-[#16A34A] text-white shadow-xs opacity-90'
                                  : isDeclined
                                  ? 'bg-[#E4E6EB] text-[#5B5F6B] cursor-not-allowed'
                                  : 'bg-gradient-to-r from-[#9E0027] to-[#C41E3A] hover:from-[#80001F] hover:to-[#B01A33] text-white'
                              }`}
                            >
                              <UserCheck className="w-4 h-4" />
                              <span className="truncate">{isConfirmed ? 'রক্তদান নিশ্চিত' : 'ডোনার নিশ্চিত'}</span>
                            </button>

                            {onDeclineDonor && !isConfirmed && !isDeclined && (
                              <button
                                onClick={() => onDeclineDonor(donor.id)}
                                title="প্রত্যাখ্যান করুন"
                                className="col-span-1 h-10 rounded-xl bg-[#F7F7F9] hover:bg-[#FEE2E2] text-[#5B5F6B] hover:text-[#BA1A1A] border border-[#E4E6EB]/60 flex items-center justify-center transition-all cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-8 text-center border border-[#E4E6EB]/80 space-y-3">
                    <Clock className="w-10 h-10 text-[#C41E3A] mx-auto animate-pulse" />
                    <h4 className="font-bold text-base text-[#1B1B1F]">ডোনারদের উত্তরের অপেক্ষা করা হচ্ছে</h4>
                    <p className="text-xs text-[#5B5F6B] max-w-sm mx-auto">
                      নিকটবর্তী ম্যাচিং রক্তদাতাদের ফোনে নোটিফিকেশন পৌঁছেছে। খুব শীঘ্রই ডোনাররা এখানে সাড়া প্রদান করবেন।
                    </p>
                  </div>
                )}

                {/* Safety banner */}
                <div className="bg-[#D9E2FF]/30 border border-[#D9E2FF] rounded-2xl p-4 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#0D58C9] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#001946] leading-relaxed">
                    <span className="font-bold block mb-0.5">নিরাপত্তা ও গোপনীয়তা নির্দেশিকা:</span>
                    রক্তদানের উদ্দেশ্যে রক্তদাতা ও রোগীর স্বজনদের মধ্যে কোনো আর্থিক লেনদেন সম্পূর্ণ নিষিদ্ধ। হাসপাতালে দেখা করে সরাসরি রক্ত সংগ্রহের পর অনুগ্রহ করে অ্যাপে সম্পন্ন করুন।
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Empty State for My Request */
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center max-w-md mx-auto space-y-4 shadow-xs border border-[#E4E6EB]/80">
              <div className="w-16 h-16 rounded-full bg-[#FDECEF] text-[#C41E3A] mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[#1B1B1F]">
                  {t.requests.noActiveReqTitle}
                </h3>
                <p className="text-xs text-[#5B5F6B] mt-1 leading-relaxed">
                  {t.requests.noActiveReqDesc}
                </p>
              </div>
              <button
                onClick={onTabSelectRequestForm}
                className="h-11 px-6 rounded-2xl bg-gradient-to-r from-[#9E0027] to-[#C41E3A] text-white font-bold text-sm shadow-md active:scale-95 transition-all cursor-pointer"
              >
                {t.requests.btnCreateRequest}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: NEARBY REQUESTS ================= */}
      {activeSegment === 'nearby' && (
        <div className="mt-1 md:mt-2 space-y-3 md:space-y-4">
          {/* Live Request Flow & Urgency Analytics Bar */}
          <div className="bg-white border-y md:border border-[#E4E6EB] md:border-[#E4E6EB]/80 md:rounded-3xl px-4 max-[360px]:px-3 py-3.5 sm:p-5 md:shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#E4E6EB]/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center font-bold">
                  <Activity className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-[15px] text-[#1B1B1F]">
                    {t.requests.flowTitle}
                  </h3>
                  <p className="text-[11px] text-[#5B5F6B]">
                    {language === 'bn'
                      ? `বগুড়া সদর ও নিকটবর্তী হাসপাতালে মোট ${formatDigits(nearbyRequests.length)}টি অনুরোধ সক্রিয়`
                      : `Total ${nearbyRequests.length} active emergency requests in Bogura region`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-[#FDECEF] text-[#C41E3A] font-bold">
                  {language === 'bn'
                    ? `তাৎক্ষণিক জরুরি: ${formatDigits(nearbyRequests.filter(r => r.urgency === 'now').length)}টি`
                    : `Immediate: ${nearbyRequests.filter(r => r.urgency === 'now').length}`}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#E8F5E9] text-[#0B7A50] font-bold">
                  {t.requests.successRate}
                </span>
              </div>
            </div>

            {/* Visual Urgency Spectrum Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#5B5F6B]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C41E3A]" />{' '}
                  {language === 'bn' ? 'তাৎক্ষণিক (২ ঘণ্টার মধ্যে)' : 'Immediate (< 2 hrs)'}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E65100]" />{' '}
                  {language === 'bn' ? 'আজ প্রয়োজন' : 'Needed Today'}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1D5FD0]" />{' '}
                  {language === 'bn' ? 'নির্ধারিত অপারেশন' : 'Scheduled'}
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-[#F0EDF2] flex overflow-hidden">
                <div style={{ width: '50%' }} className="h-full bg-[#C41E3A]" />
                <div style={{ width: '35%' }} className="h-full bg-[#E65100]" />
                <div style={{ width: '15%' }} className="h-full bg-[#1D5FD0]" />
              </div>
            </div>
          </div>

          {/* Filter Bar: Blood Group Pills & Distance Filter */}
          <div className="bg-white border-y md:border border-[#E4E6EB] md:border-[#E4E6EB]/80 md:rounded-2xl px-4 max-[360px]:px-3 py-3 md:shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            {/* Blood Group Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
              <Filter className="w-3.5 h-3.5 text-[#5B5F6B] shrink-0 ml-0.5 mr-0.5" />
              {bloodGroupOptions.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setSelectedBloodFilter(bg)}
                  className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center ${
                    selectedBloodFilter === bg || (selectedBloodFilter === 'ALL' && bg === allBloodLabel)
                      ? 'bg-[#C41E3A] text-white shadow-xs'
                      : 'bg-[#F7F7F9] text-[#5B5F6B] hover:bg-[#F0EDF2]'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>

            {/* Distance Chips */}
            <div className="flex items-center gap-1 shrink-0 self-end md:self-auto text-xs">
              <span className="text-[#5B5F6B] font-medium mr-1 hidden sm:inline">
                {language === 'bn' ? 'দূরত্ব:' : 'Distance:'}
              </span>
              <button
                onClick={() => setSelectedDistanceFilter('all')}
                className={`min-h-[36px] px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center ${
                  selectedDistanceFilter === 'all'
                    ? 'bg-[#1B1B1F] text-white'
                    : 'bg-[#F7F7F9] text-[#5B5F6B] hover:bg-[#F0EDF2]'
                }`}
              >
                {t.requests.distAll}
              </button>
              <button
                onClick={() => setSelectedDistanceFilter('5km')}
                className={`min-h-[36px] px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center ${
                  selectedDistanceFilter === '5km'
                    ? 'bg-[#1B1B1F] text-white'
                    : 'bg-[#F7F7F9] text-[#5B5F6B] hover:bg-[#F0EDF2]'
                }`}
              >
                {t.requests.dist5km}
              </button>
              <button
                onClick={() => setSelectedDistanceFilter('10km')}
                className={`min-h-[36px] px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center ${
                  selectedDistanceFilter === '10km'
                    ? 'bg-[#1B1B1F] text-white'
                    : 'bg-[#F7F7F9] text-[#5B5F6B] hover:bg-[#F0EDF2]'
                }`}
              >
                {t.requests.dist10km}
              </button>
            </div>
          </div>

          {/* Request Count Announcement */}
          <div className="flex items-center justify-between px-4 max-[360px]:px-3 md:px-1">
            <span className="text-xs font-bold text-[#5B5F6B]">
              {language === 'bn'
                ? `আপনার এলাকায় ${formatDigits(filteredNearby.length)}টি জরুরি রক্তের প্রয়োজন চলমান`
                : `${filteredNearby.length} emergency blood requests active in your area`}
            </span>
            <span className="text-xs text-[#C41E3A] font-semibold">
              {language === 'bn' ? 'লাইভ আপডেট' : 'Live Updates'}
            </span>
          </div>

          {/* Clinical Cross-matching Advisory */}
          <div className="bg-[#FFF8E1] border-y md:border border-[#FFE082] md:rounded-2xl px-4 max-[360px]:px-3 py-3 flex items-start gap-2.5 text-xs text-[#7A4F01]">
            <ShieldAlert className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <span className="font-bold">চিকিৎসাগত নির্দেশিকা:</span> রক্তদানের পূর্বে সংশ্লিষ্ট হাসপাতালে চিকিৎসক ও ল্যাবরেটরি কর্তৃক রক্তের ক্রস-ম্যাচিং (Major & Minor Cross-match) সম্পন্ন করা বাধ্যতামূলক। পূর্ববর্তী রক্তদানের পর পুরুষের ক্ষেত্রে ৯০ দিন ও নারীদের ক্ষেত্রে ১২০ দিন অতিবাহিত হতে হবে।
            </p>
          </div>

          {/* Grid of Nearby Requests (Flat list on mobile with hairlines, cards on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-4 divide-y md:divide-y-0 divide-[#E4E6EB] border-y md:border-0 border-[#E4E6EB]">
            {filteredNearby.map((req) => (
              <article
                key={req.id}
                className="bg-white md:rounded-3xl px-4 max-[360px]:px-3 py-4 md:p-5 md:shadow-xs md:border border-[#E4E6EB]/80 md:hover:border-[#C41E3A]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Group & Urgency */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-13 h-13 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-[#FDECEF] to-[#FFDAD6] text-[#C41E3A] flex flex-col items-center justify-center shrink-0 font-black text-xl shadow-xs">
                        {req.bloodGroup}
                        <span className="text-[10px] text-[#9E0027] font-bold leading-none mt-0.5">
                          {formatDigits(req.bagsNeeded)} {language === 'bn' ? 'ব্যাগ' : 'bags'}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-[15px] sm:text-[16px] text-[#1B1B1F] leading-snug line-clamp-1">
                          {req.hospitalName}
                        </h3>
                        <p className="text-xs text-[#5B5F6B] mt-0.5 flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#5B5F6B] shrink-0" />
                          <span>
                            {formatDigits(req.distanceKm)} {language === 'bn' ? 'কিমি দূরে' : 'km away'}
                          </span>
                          <span className="mx-1">•</span>
                          <span>{req.location}</span>
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-[#FFDAD6] text-[#9E0027] text-[11px] font-bold shrink-0">
                      {req.urgencyLabel}
                    </span>
                  </div>

                  {/* Context note */}
                  <div className="mt-3 p-2.5 bg-[#F7F7F9] rounded-xl text-xs text-[#5B5F6B] flex items-center justify-between">
                    <span className="truncate">
                      {req.patientType || (language === 'bn' ? 'জরুরি সার্জারি রোগী' : 'Emergency Surgery Patient')}
                    </span>
                    <span className="text-[#C41E3A] font-semibold shrink-0 ml-1">
                      {req.timeTarget}
                    </span>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E4E6EB]/60">
                  <span className="text-xs text-[#5B5F6B]">{req.createdAt}</span>
                  {req.status === 'fulfilled' ? (
                    <span className="px-3 py-1.5 bg-[#DCFCE7] text-[#166534] rounded-xl text-xs font-bold">
                      {language === 'bn' ? '✓ রক্ত পাওয়া সম্পন্ন' : 'Fulfilled'}
                    </span>
                  ) : req.status === 'cancelled' ? (
                    <span className="px-3 py-1.5 bg-[#F0EDF2] text-[#5B5F6B] rounded-xl text-xs font-bold">
                      {language === 'bn' ? 'অনুরোধটি বাতিল' : 'Cancelled'}
                    </span>
                  ) : req.hasResponded ? (
                    <button
                      onClick={() => onOpenDonorResponse(req)}
                      className="min-h-[44px] md:h-9 px-3.5 bg-[#EBF3FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-[#0D58C9] rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>
                        {language === 'bn'
                          ? `সাড়া দিয়েছেন (${toBengaliDigits(req.userResponseEta || 30)}মি)`
                          : `Responded (${req.userResponseEta || 30}m)`}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenDonorResponse(req)}
                      className="min-h-[44px] md:h-9 px-4 bg-gradient-to-r from-[#9E0027] to-[#C41E3A] hover:from-[#80001F] hover:to-[#B01A33] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>{language === 'bn' ? 'সাড়া দিন' : 'Respond'}</span>
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>

          {filteredNearby.length === 0 && (
            <div className="bg-white border-y md:border border-[#E4E6EB] md:border-[#E4E6EB]/80 md:rounded-3xl p-8 text-center space-y-2">
              <p className="text-sm font-bold text-[#1B1B1F]">
                {language === 'bn' ? 'কোনো অনুরোধ পাওয়া যায়নি' : 'No requests found'}
              </p>
              <p className="text-xs text-[#5B5F6B]">
                {language === 'bn'
                  ? 'নির্বাচিত ফিল্টারে এই মুহূর্তে কোনো রক্তের অনুরোধ নেই।'
                  : 'No matching emergency requests under current filters.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: REGULAR / SCHEDULED DONATION ================= */}
      {activeSegment === 'regular' && (
        <div className="mt-2 space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-[#E4E6EB]/80 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] text-[#166534] flex items-center justify-center">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="font-extrabold text-[16px] text-[#1B1B1F]">
                  {language === 'bn'
                    ? 'নিয়মিত রক্তদান কর্মসূচি (থ্যালাসেমিয়া ও দীর্ঘমেয়াদী রোগী)'
                    : 'Scheduled Donation Programs (Thalassemia & Chronic Patients)'}
                </h3>
                <p className="text-xs text-[#5B5F6B]">
                  {language === 'bn'
                    ? 'থ্যালাসেমিয়া রোগীদের প্রতি ২১ বা ৩০ দিনে নিয়মিত রক্তের প্রয়োজন হয়। আপনার পূর্বপরিকল্পিত রক্তদান তাদের জীবন বাঁচাতে পারে।'
                    : 'Thalassemia patients need regular transfusions every 21–30 days. Your scheduled donation saves lives.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 bg-[#F6F2F8] rounded-2xl border border-[#E4E6EB]/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#C41E3A] bg-[#FDECEF] px-2 py-0.5 rounded-full">
                      {language === 'bn' ? 'B+ রক্ত প্রয়োজন' : 'B+ Needed'}
                    </span>
                    <span className="text-[11px] text-[#5B5F6B]">
                      {language === 'bn' ? 'প্রতি ২১ দিন পর পর' : 'Every 21 days'}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#1B1B1F] mt-2">
                    {language === 'bn' ? 'শিশু রাহাত (বয়স ৭ বছর)' : 'Child Rahat (Age 7)'}
                  </h4>
                  <p className="text-xs text-[#5B5F6B] mt-0.5">
                    {language === 'bn' ? 'শহীদ জিয়াউর রহমান মেডিকেল কলেজ, বগুড়া' : 'SZMCH Hospital, Bogura'}
                  </p>
                  <p className="text-xs font-semibold text-[#166534] mt-2">
                    {language === 'bn' ? 'পরবর্তী নির্ধারিত তারিখ: ৫ নভেম্বর ২০২৬' : 'Next schedule: Nov 5, 2026'}
                  </p>
                </div>
                <button
                  onClick={() =>
                    alert(
                      language === 'bn'
                        ? 'নিয়মিত রক্তদাতা হিসেবে আপনি যুক্ত হলেন! নির্ধারিত তারিখের ৩ দিন আগে স্মরণ করিয়ে দেওয়া হবে।'
                        : 'Enrolled as a scheduled donor! You will receive a reminder 3 days in advance.'
                    )
                  }
                  className="mt-3 w-full h-9 rounded-xl bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold transition-all cursor-pointer"
                >
                  {language === 'bn' ? 'নিয়মিত রক্তদাতা হিসেবে যুক্ত হন' : 'Join as Scheduled Donor'}
                </button>
              </div>

              <div className="p-4 bg-[#F6F2F8] rounded-2xl border border-[#E4E6EB]/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#0D58C9] bg-[#D9E2FF] px-2 py-0.5 rounded-full">
                      O+ রক্ত প্রয়োজন
                    </span>
                    <span className="text-[11px] text-[#5B5F6B]">প্রতি ৩০ দিন পর পর</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#1B1B1F] mt-2">আয়েশা সিদ্দিকা (বয়স ১২ বছর)</h4>
                  <p className="text-xs text-[#5B5F6B] mt-0.5">বগুড়া ডায়াবেটিক ও জেনারেল হাসপাতাল</p>
                  <p className="text-xs font-semibold text-[#166534] mt-2">পরবর্তী নির্ধারিত তারিখ: ১২ নভেম্বর ২০২৬</p>
                </div>
                <button
                  onClick={() => alert('নিয়মিত রক্তদাতা হিসেবে আপনি যুক্ত হলেন! নির্ধারিত তারিখের ৩ দিন আগে স্মরণ করিয়ে দেওয়া হবে।')}
                  className="mt-3 w-full h-9 rounded-xl bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold transition-all cursor-pointer"
                >
                  নিয়মিত রক্তদাতা হিসেবে যুক্ত হন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1.5s Quiet Donation Confirmation Moment (Section 12 requirement) */}
      {showDonationCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 text-center space-y-3 shadow-2xl max-w-xs animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#166534] flex items-center justify-center mx-auto shadow-md">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1B1B1F]">ডোনার নিশ্চিত করা হয়েছে!</h3>
              <p className="text-xs text-[#5B5F6B] mt-1">ধন্যবাদ। রোগীর স্বজনদের কাছে তথ্য ও আপডেট পৌঁছে গেছে।</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
