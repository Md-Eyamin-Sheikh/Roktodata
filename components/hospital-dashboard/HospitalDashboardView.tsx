'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Building,
  Activity,
  Clock,
  TrendingUp,
  AlertTriangle,
  Plus,
  Minus,
  Printer,
  FileText,
  CheckCircle,
  RotateCcw
} from 'lucide-react';
import { BloodGroup, StockLevel } from '@/lib/types';
import { toBengaliDigits } from '@/lib/bengali-utils';
import { useToast } from '@/components/ui/ToastNotification';

interface HospitalDashboardViewProps {
  onBack: () => void;
}

export const HospitalDashboardView: React.FC<HospitalDashboardViewProps> = ({
  onBack,
}) => {
  const { showToast } = useToast();
  // Stock state for 8 blood groups (Section 21)
  const [stocks, setStocks] = useState<{ [key in BloodGroup]: number }>({
    'O+': 8,
    'B+': 12,
    'A+': 5,
    'AB+': 3,
    'O-': 1,
    'B-': 1,
    'A-': 0,
    'AB-': 0,
  });

  const [lastAction, setLastAction] = useState<string | null>(null);

  const updateStock = (group: BloodGroup, delta: number) => {
    setStocks((prev) => {
      const current = prev[group];
      const next = Math.max(0, current + delta);
      setLastAction(`${group} স্টক ${delta > 0 ? '+১ বৃদ্ধি' : '-১ হ্রাস'} করা হয়েছে`);
      return { ...prev, [group]: next };
    });
  };

  const groups: BloodGroup[] = ['O+', 'B+', 'A+', 'AB+', 'O-', 'B-', 'A-', 'AB-'];

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 md:px-0 pb-24">
      {/* Top Header */}
      <div className="px-4 pt-3 pb-3 bg-white rounded-2xl border border-[#E4E6EB]/50 sticky top-2 z-20 shadow-xs mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            aria-label="ফিরে যান"
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#1B1B1F] hover:bg-[#F7F7F9]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h1 className="font-bold text-[18px] text-[#1B1B1F] leading-tight">হাসপাতাল ও সংস্থা ড্যাশবোর্ড</h1>
            <span className="text-[11px] text-[#5B5F6B]">শহীদ জিয়াউর রহমান মেডিকেল কলেজ হাসপাতাল</span>
          </div>
        </div>

        <button
          onClick={() => showToast('মাসিক সারাংশ প্রিন্ট ও পিডিএফ রিপোর্ট প্রস্তুত হচ্ছে...', 'info')}
          className="p-2 rounded-xl bg-[#F0EDF2] hover:bg-[#E4E6EB] text-[#1B1B1F] flex items-center gap-1 text-xs font-bold"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">রিপোর্ট</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* 4 Overview Number Cards (Responsive 4 columns on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-[#E4E6EB]/60">
            <span className="text-xs text-[#5B5F6B] font-medium block">সক্রিয় অনুরোধ</span>
            <span className="text-[24px] font-extrabold text-[#C41E3A] mt-1 block">
              {toBengaliDigits(3)}টি
            </span>
            <span className="text-[10px] text-[#00744B] font-bold">২ জন ডোনার পথে আছেন</span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-[#E4E6EB]/60">
            <span className="text-xs text-[#5B5F6B] font-medium block">গড় সাড়ার সময়</span>
            <span className="text-[24px] font-extrabold text-[#0D58C9] mt-1 block">
              {toBengaliDigits(8)} মি.
            </span>
            <span className="text-[10px] text-[#5B5F6B]">বগুড়া সদর এলাকা</span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-[#E4E6EB]/60">
            <span className="text-xs text-[#5B5F6B] font-medium block">এ মাসের রক্তদান</span>
            <span className="text-[24px] font-extrabold text-[#00744B] mt-1 block">
              {toBengaliDigits(46)} ব্যাগ
            </span>
            <span className="text-[10px] text-[#00744B] font-bold">+১৪% গত মাসের চেয়ে</span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-[#E4E6EB]/60">
            <span className="text-xs text-[#5B5F6B] font-medium block">স্টক সতর্কতা</span>
            <span className="text-[24px] font-extrabold text-[#BA1A1A] mt-1 block">
              {toBengaliDigits(2)} গ্রুপ
            </span>
            <span className="text-[10px] text-[#BA1A1A] font-bold">A- ও AB- ঘাটতি</span>
          </div>
        </div>

        {/* Live Blood Stock Management Grid with 1-Click +/- (Section 21) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-[#E4E6EB]/80 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E4E6EB]/60 pb-3">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#1B1B1F]">
                ব্লাড ব্যাংক ইনভেন্টরি ও স্টক সমন্বয় গ্রাফ
              </h3>
              <p className="text-[11px] text-[#5B5F6B]">
                নিরাপদ রিজার্ভ মাত্রা (কমপক্ষে ৫ ব্যাগ) বনাম বর্তমান উপস্থিতি
              </p>
            </div>
            {lastAction && (
              <span className="text-[10px] bg-[#E8F5E9] text-[#005938] px-2.5 py-1 rounded-full font-bold animate-in fade-in">
                {lastAction}
              </span>
            )}
          </div>

          {/* Interactive Stock Level Visual Bar Chart */}
          <div className="bg-[#FAF9FB] rounded-2xl p-3 border border-[#E4E6EB]/70">
            <div className="flex items-center justify-between text-xs text-[#5B5F6B] mb-2 px-1">
              <span className="font-semibold text-[#1B1B1F]">রক্তের মজুদ মাত্রা (ব্যাগ সংখ্যা)</span>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0B7A50]" /> নিরাপদ (≥৫)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E65100]" /> সতর্ক (২-৪)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#C41E3A]" /> সংকটজনক (&lt;২)</span>
              </div>
            </div>

            <div className="h-32 flex items-end justify-between gap-1.5 sm:gap-3 px-1 pt-4 pb-1 relative">
              {/* Threshold line at 5 bags (approx 42% height based on max 12) */}
              <div className="absolute inset-x-2 top-14 border-b border-dashed border-[#0B7A50]/40 flex justify-end">
                <span className="text-[9px] text-[#0B7A50] font-bold bg-white px-1 rounded-xs -mt-2">নিরাপদ সীমা (৫)</span>
              </div>
              <div className="absolute inset-x-2 bottom-6 border-b border-[#E4E6EB]" />

              {groups.map((grp) => {
                const count = stocks[grp];
                const heightPercent = Math.min(100, Math.max(12, (count / 14) * 100));
                const barColor =
                  count >= 5
                    ? 'bg-gradient-to-t from-[#0B7A50] to-[#12A06C]'
                    : count >= 2
                    ? 'bg-gradient-to-t from-[#E65100] to-[#FF9800]'
                    : 'bg-gradient-to-t from-[#9E0027] to-[#C41E3A]';

                return (
                  <div key={grp} className="flex-1 flex flex-col items-center h-full justify-end z-10">
                    <span className="text-[10px] font-black text-[#1B1B1F] mb-1">
                      {toBengaliDigits(count)}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${barColor}`}
                    />
                    <span className="text-[11px] font-extrabold text-[#1B1B1F] mt-1.5">
                      {grp}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {groups.map((grp) => {
              const count = stocks[grp];
              const isLow = count <= 1;
              return (
                <div
                  key={grp}
                  className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    isLow ? 'bg-[#FFDAD6]/30 border-[#FFDAD6]' : 'bg-[#F7F7F9] border-[#E4E6EB]'
                  }`}
                >
                  <div>
                    <span className="font-extrabold text-sm block text-[#1B1B1F]">{grp}</span>
                    <span
                      className={`text-xs font-bold ${
                        isLow ? 'text-[#BA1A1A]' : 'text-[#00744B]'
                      }`}
                    >
                      {toBengaliDigits(count)} ব্যাগ {isLow && '(ঘাটতি)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateStock(grp, -1)}
                      className="w-8 h-8 rounded-lg bg-white border border-[#E4E6EB] flex items-center justify-center active:scale-95 shadow-xs"
                    >
                      <Minus className="w-3.5 h-3.5 text-[#5B5F6B]" />
                    </button>
                    <button
                      onClick={() => updateStock(grp, 1)}
                      className="w-8 h-8 rounded-lg bg-[#C41E3A] text-white flex items-center justify-center active:scale-95 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-[#5B5F6B] pt-1 border-t border-[#E4E6EB]/50">
            সর্বশেষ হালনাগাদ: আজ দুপুর ১২:৪০ • অনুমোদিত ডাটা এন্ট্রি অপারেটর: মো. কামরুল
          </p>
        </div>

        {/* Recent Urgent Requests in Hospital */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E4E6EB]/60 space-y-2.5">
          <h3 className="font-bold text-sm text-[#1B1B1F]">হাসপাতালের চলমান জরুরি চাহিদা</h3>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-[#F7F7F9] rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-[#1B1B1F]">B+ পুরো রক্ত (২ ব্যাগ)</span>
                <p className="text-[11px] text-[#5B5F6B]">ওয়ার্ড ৪, বেড ১২ • থ্যালাসেমিয়া</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#005938] font-bold text-[10px]">
                ডোনার আসছেন
              </span>
            </div>

            <div className="p-2.5 bg-[#F7F7F9] rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-[#1B1B1F]">O- রক্ত (১ ব্যাগ)</span>
                <p className="text-[11px] text-[#5B5F6B]">জরুরি ওটি • রোড এক্সিডেন্ট</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#FFDAD6] text-[#BA1A1A] font-bold text-[10px]">
                জরুরি সন্ধান
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
