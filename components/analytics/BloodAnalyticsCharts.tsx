'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Droplets,
  Clock,
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Heart,
  Share2,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { toBengaliDigits } from '@/lib/bengali-utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type ChartTimeframe = 'today' | 'week' | 'month' | 'year';
type ChartCategory = 'timeline' | 'demand' | 'velocity' | 'regional';

export const BloodAnalyticsCharts: React.FC = () => {
  const { language, formatDigits } = useLanguage();
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('month');
  const [activeTab, setActiveTab] = useState<ChartCategory>('timeline');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(4); // August 2026 default
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // 1. Monthly Donation & Biological Hemoglobin Recovery Timeline
  const monthlyData = [
    {
      month: language === 'bn' ? 'জানু' : 'Jan',
      bags: 0,
      livesSaved: 0,
      hospital: language === 'bn' ? 'বিশ্রাম পর্ব (শরীরের রিকভারি)' : 'Recovery Phase (Rest & Recovery)',
      hbLevel: 14.4,
      readyPercent: 65,
    },
    {
      month: language === 'bn' ? 'ফেব্রু' : 'Feb',
      bags: 1,
      livesSaved: 3,
      hospital: language === 'bn' ? 'সন্ধানী শীতকালীন ক্যাম্প, বগুড়া' : 'Sandhani Winter Camp, Bogura',
      hbLevel: 13.9,
      readyPercent: 100,
    },
    {
      month: language === 'bn' ? 'মার্চ' : 'Mar',
      bags: 0,
      livesSaved: 0,
      hospital: language === 'bn' ? 'রিকভারি পর্ব (আয়রন বৃদ্ধি)' : 'Recovery Phase (Iron Boost)',
      hbLevel: 14.1,
      readyPercent: 35,
    },
    {
      month: language === 'bn' ? 'এপ্রিল' : 'Apr',
      bags: 0,
      livesSaved: 0,
      hospital: language === 'bn' ? 'বিশ্রাম পর্ব (শরীরের প্রস্তুতি)' : 'Rest Phase (Body Preparation)',
      hbLevel: 14.5,
      readyPercent: 70,
    },
    {
      month: language === 'bn' ? 'মে' : 'May',
      bags: 1,
      livesSaved: 3,
      hospital: language === 'bn' ? 'মোহাম্মদ আলী হাসপাতাল, বগুড়া' : 'Mohammad Ali Hospital, Bogura',
      hbLevel: 14.0,
      readyPercent: 100,
    },
    {
      month: language === 'bn' ? 'জুন' : 'Jun',
      bags: 0,
      livesSaved: 0,
      hospital: language === 'bn' ? 'রিকভারি পর্ব (প্লাজমা ব্যালেন্স)' : 'Recovery Phase (Plasma Balance)',
      hbLevel: 14.3,
      readyPercent: 40,
    },
    {
      month: language === 'bn' ? 'জুলাই' : 'Jul',
      bags: 0,
      livesSaved: 0,
      hospital: language === 'bn' ? 'বিশ্রাম পর্ব (শরীরের প্রস্তুতি)' : 'Rest Phase (Preparation)',
      hbLevel: 14.6,
      readyPercent: 75,
    },
    {
      month: language === 'bn' ? 'আগস্ট' : 'Aug',
      bags: 1,
      livesSaved: 3,
      hospital: language === 'bn' ? 'শহীদ জিয়াউর রহমান মেডিকেল কলেজ' : 'SZMCH Medical College Hospital',
      hbLevel: 14.1,
      readyPercent: 100,
    },
    {
      month: language === 'bn' ? 'সেপ্টে' : 'Sep',
      bags: 0,
      livesSaved: 0,
      hospital: language === 'bn' ? 'রিকভারি পর্ব (চলতি সাইকেল)' : 'Recovery Phase (Current Cycle)',
      hbLevel: 14.4,
      readyPercent: 45,
    },
    {
      month: language === 'bn' ? 'অক্টো' : 'Oct',
      bags: 0,
      livesSaved: 0,
      hospital: language === 'bn' ? 'চলতি মাস (আর ১৮ দিন বাকি)' : 'Current Month (18 days remaining)',
      hbLevel: 14.7,
      readyPercent: 82,
    },
  ];

  // 2. Real-time Community Blood Demand vs Supply in Bogura & Regional Hubs
  const bloodDemandSupply = [
    { group: 'O+', demand: 48, supply: 42, isCritical: false, percent: 88, waitTime: language === 'bn' ? '১২ মিনিট' : '12 mins' },
    { group: 'B+', demand: 58, supply: 51, isCritical: false, percent: 88, waitTime: language === 'bn' ? '৯ মিনিট' : '9 mins' },
    { group: 'A+', demand: 38, supply: 34, isCritical: false, percent: 89, waitTime: language === 'bn' ? '১৪ মিনিট' : '14 mins' },
    { group: 'AB+', demand: 24, supply: 27, isCritical: false, percent: 112, waitTime: language === 'bn' ? '৮ মিনিট' : '8 mins' },
    { group: 'O-', demand: 22, supply: 8, isCritical: true, percent: 36, waitTime: language === 'bn' ? '৪৫ মিনিট' : '45 mins' },
    { group: 'B-', demand: 16, supply: 7, isCritical: true, percent: 43, waitTime: language === 'bn' ? '৩৫ মিনিট' : '35 mins' },
    { group: 'A-', demand: 14, supply: 6, isCritical: true, percent: 42, waitTime: language === 'bn' ? '৪০ মিনিট' : '40 mins' },
    { group: 'AB-', demand: 9, supply: 4, isCritical: true, percent: 44, waitTime: language === 'bn' ? '৫০ মিনিট' : '50 mins' },
  ];

  // 3. 24-Hour Emergency Response Velocity Curve (Hours 00:00 to 23:00)
  const hourlyResponseCurve = [
    { hour: language === 'bn' ? 'রাত ১২টা' : '12 AM', timeMins: 14.5, rate: 82, intensity: 30 },
    { hour: language === 'bn' ? 'রাত ৪টা' : '4 AM', timeMins: 16.0, rate: 76, intensity: 20 },
    { hour: language === 'bn' ? 'সকাল ৮টা' : '8 AM', timeMins: 9.2, rate: 92, intensity: 65 },
    { hour: language === 'bn' ? 'সকাল ১১টা' : '11 AM', timeMins: 6.8, rate: 98, intensity: 95 },
    { hour: language === 'bn' ? 'দুপুর ২টা' : '2 PM', timeMins: 7.2, rate: 96, intensity: 88 },
    { hour: language === 'bn' ? 'বিকাল ৫টা' : '5 PM', timeMins: 6.4, rate: 99, intensity: 100 },
    { hour: language === 'bn' ? 'রাত ৮টা' : '8 PM', timeMins: 7.9, rate: 95, intensity: 85 },
    { hour: language === 'bn' ? 'রাত ১০টা' : '10 PM', timeMins: 10.5, rate: 89, intensity: 50 },
  ];

  // 4. Regional Upazila Donor Density in Bogura
  const upazilaDistribution = [
    { name: language === 'bn' ? 'বগুড়া সদর' : 'Bogura Sadar', totalDonors: 148, activeToday: 62, urgentRequests: 5, fillRate: 96 },
    { name: language === 'bn' ? 'শাজাহানপুর' : 'Shajahanpur', totalDonors: 72, activeToday: 28, urgentRequests: 2, fillRate: 92 },
    { name: language === 'bn' ? 'শেরপুর' : 'Sherpur', totalDonors: 64, activeToday: 24, urgentRequests: 2, fillRate: 90 },
    { name: language === 'bn' ? 'শিবগঞ্জ' : 'Shibganj', totalDonors: 58, activeToday: 21, urgentRequests: 1, fillRate: 94 },
    { name: language === 'bn' ? 'গাবতলী' : 'Gabtali', totalDonors: 52, activeToday: 19, urgentRequests: 1, fillRate: 88 },
    { name: language === 'bn' ? 'দুপচাঁচিয়া' : 'Dupchanchia', totalDonors: 41, activeToday: 16, urgentRequests: 1, fillRate: 89 },
  ];

  const selectedData = monthlyData[selectedMonthIndex] || monthlyData[4];

  // Total summary calculations
  const totalBagsInPeriod = monthlyData.reduce((acc, curr) => acc + curr.bags, 0);
  const totalLivesImpacted = totalBagsInPeriod * 3;
  const avgResponseTime = language === 'bn' ? '৭.৪ মিনিট' : '7.4 mins';
  const overallFulfillmentRate = language === 'bn' ? '৯৪.৮%' : '94.8%';

  return (
    <div className="w-full bg-white rounded-3xl p-3.5 sm:p-5 md:p-6 shadow-sm border border-[#E4E6EB]/80 space-y-4 sm:space-y-5 transition-all">
      {/* ================= HEADER & TIMEFRAME FILTER ================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E6EB]/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#9E0027] to-[#C41E3A] text-white flex items-center justify-center shadow-xs shrink-0">
            <TrendingUp className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-[16px] sm:text-[18px] text-[#1B1B1F] leading-tight">
                {language === 'bn' ? 'লাইভ রক্তদান ও স্বাস্থ্য এনালিটিক্স' : 'Live Blood Donation & Health Analytics'}
              </h3>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0B7A50] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0B7A50]" />
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#5B5F6B] mt-0.5">
              {language === 'bn'
                ? 'গ্রাফ ও চার্টের মাধ্যমে রক্তদান প্রভাব, চাহিদা এবং জরুরি প্রতিক্রিয়া চিত্র'
                : 'Visual impact, demand patterns, and real-time response charts'}
            </p>
          </div>
        </div>

        {/* Timeframe selector (Mobile-friendly segmented bar) */}
        <div className="flex items-center gap-1 p-1 bg-[#F5F4F7] rounded-xl text-xs font-semibold self-stretch sm:self-auto justify-between sm:justify-start">
          {(
            [
              { key: 'today', label: language === 'bn' ? 'আজ' : 'Today' },
              { key: 'week', label: language === 'bn' ? 'সপ্তাহ' : 'Week' },
              { key: 'month', label: language === 'bn' ? 'এই মাস' : 'Month' },
              { key: 'year', label: language === 'bn' ? '২০২৬' : '2026' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setTimeframe(item.key)}
              className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                timeframe === item.key
                  ? 'bg-white text-[#C41E3A] font-bold shadow-xs'
                  : 'text-[#5B5F6B] hover:text-[#1B1B1F]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= 4 CORE METRIC CARDS WITH MINI CHARTS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Metric 1: Response Velocity */}
        <div className="p-3 sm:p-3.5 bg-gradient-to-br from-[#FFF5F6] to-[#FFF9F9] rounded-2xl border border-[#FFDADA]/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#C41E3A] mb-1">
            <span className="text-[11px] font-bold text-[#9E0027]">
              {language === 'bn' ? 'জরুরি সাড়া প্রদানের গতি' : 'Response Velocity'}
            </span>
            <Zap className="w-4 h-4 fill-[#C41E3A] text-[#C41E3A]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-[#1B1B1F] tracking-tight">
                {avgResponseTime}
              </span>
            </div>
            <p className="text-[10px] text-[#5B5F6B] mt-0.5 flex items-center gap-1">
              <span className="text-[#0B7A50] font-bold">
                {language === 'bn' ? '↑ ২৮% দ্রুত' : '↑ 28% faster'}
              </span>{' '}
              {language === 'bn' ? 'গত মাসের চেয়ে' : 'vs last month'}
            </p>
          </div>
          {/* Mini Sparkline Bar Chart */}
          <div className="flex items-end gap-1 h-5 mt-2 pt-1 border-t border-[#FFDADA]/50">
            {[40, 60, 50, 75, 90, 85, 95].map((val, i) => (
              <div
                key={i}
                style={{ height: `${val}%` }}
                className="flex-1 bg-[#C41E3A]/70 rounded-xs"
              />
            ))}
          </div>
        </div>

        {/* Metric 2: Live Fulfillment Rate */}
        <div className="p-3 sm:p-3.5 bg-[#F2FBF7] rounded-2xl border border-[#C8EAD9]/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#0B7A50] mb-1">
            <span className="text-[11px] font-bold text-[#0B7A50]">
              {language === 'bn' ? 'চাহিদা পূরণ হার' : 'Fulfillment Rate'}
            </span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-[#1B1B1F] tracking-tight">
                {overallFulfillmentRate}
              </span>
            </div>
            <p className="text-[10px] text-[#5B5F6B] mt-0.5">
              {language === 'bn'
                ? 'মোট ৯৬টি আবেদনের মধ্যে ৯১টি সফল'
                : '91 successful out of 96 requests'}
            </p>
          </div>
          {/* Circular/Line gauge */}
          <div className="w-full h-1.5 rounded-full bg-[#C8EAD9] overflow-hidden mt-2">
            <div className="h-full bg-[#0B7A50] rounded-full" style={{ width: '94.8%' }} />
          </div>
        </div>

        {/* Metric 3: Total Lives Touched */}
        <div className="p-3 sm:p-3.5 bg-[#F5F8FF] rounded-2xl border border-[#D9E2FF]/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#1D5FD0] mb-1">
            <span className="text-[11px] font-bold text-[#1D5FD0]">
              {language === 'bn' ? 'জীবন স্পর্শিত' : 'Lives Saved'}
            </span>
            <Heart className="w-4 h-4 fill-[#1D5FD0]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-[#1B1B1F] tracking-tight">
                {formatDigits(totalLivesImpacted)}+
              </span>
              <span className="text-xs text-[#5B5F6B] font-medium ml-1">
                {language === 'bn' ? 'মুগ্ধ প্রাণ' : 'Souls'}
              </span>
            </div>
            <p className="text-[10px] text-[#5B5F6B] mt-0.5">
              {language === 'bn' ? '১ ব্যাগ রক্ত = ৩ জন রোগীর জীবন' : '1 blood bag = 3 lives touched'}
            </p>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-[#1D5FD0]">
            <Sparkles className="w-3 h-3" />
            <span>{language === 'bn' ? 'সফল মানবিক অংশীদারিত্ব' : 'Humanitarian impact'}</span>
          </div>
        </div>

        {/* Metric 4: Active Ready Donors Today */}
        <div className="p-3 sm:p-3.5 bg-[#FFF9ED] rounded-2xl border border-[#FFE8B5]/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#9A5B00] mb-1">
            <span className="text-[11px] font-bold text-[#9A5B00]">
              {language === 'bn' ? 'আজ প্রস্তুত রক্তদাতা' : 'Ready Donors Today'}
            </span>
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-[#1B1B1F] tracking-tight">
                {formatDigits(62)} {language === 'bn' ? 'জন' : ''}
              </span>
              <span className="text-xs text-[#0B7A50] font-bold ml-1">
                {language === 'bn' ? 'সক্রিয়' : 'Active'}
              </span>
            </div>
            <p className="text-[10px] text-[#5B5F6B] mt-0.5">
              {language === 'bn' ? 'বগুড়া সদরে তাৎক্ষণিক যোগাযোগের জন্য' : 'Available in Bogura Sadar'}
            </p>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#FFE8B5] overflow-hidden mt-2">
            <div className="h-full bg-[#9A5B00] rounded-full" style={{ width: '78%' }} />
          </div>
        </div>
      </div>

      {/* ================= PRIMARY CHART TAB NAVIGATION (MOBILE NATIVE FEEL) ================= */}
      <div className="flex items-center overflow-x-auto no-scrollbar gap-1.5 p-1 bg-[#F5F4F7] rounded-2xl">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-white text-[#C41E3A] shadow-xs'
              : 'text-[#5B5F6B] hover:text-[#1B1B1F]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'রক্তদান টাইমলাইন ও হিমোগ্লোবিন' : 'Timeline & Hemoglobin Wave'}</span>
        </button>

        <button
          onClick={() => setActiveTab('demand')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'demand'
              ? 'bg-white text-[#C41E3A] shadow-xs'
              : 'text-[#5B5F6B] hover:text-[#1B1B1F]'
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'গ্রুপভিত্তিক চাহিদা বনাম সরবরাহ' : 'Demand vs Supply by Group'}</span>
        </button>

        <button
          onClick={() => setActiveTab('velocity')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'velocity'
              ? 'bg-white text-[#C41E3A] shadow-xs'
              : 'text-[#5B5F6B] hover:text-[#1B1B1F]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? '২৪ ঘণ্টা সাড়ার গতি ও পিক আওয়ার' : '24h Velocity & Peak Hours'}</span>
        </button>

        <button
          onClick={() => setActiveTab('regional')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'regional'
              ? 'bg-white text-[#C41E3A] shadow-xs'
              : 'text-[#5B5F6B] hover:text-[#1B1B1F]'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'উপজেলা রক্তভাণ্ডার ডেনসিটি' : 'Regional Upazila Density'}</span>
        </button>
      </div>

      {/* ================= TAB 1: DONATION TIMELINE & HEMOGLOBIN TRACKER ================= */}
      {activeTab === 'timeline' && (
        <div className="space-y-4 pt-1">
          {/* Spotlight Active Inspection Card */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#F9F8FA] to-[#FFF5F6] rounded-2xl border border-[#E4E6EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#C41E3A] uppercase tracking-wider bg-[#FDECEF] px-2 py-0.5 rounded-md">
                  {selectedData.month} {language === 'bn' ? '২০২৬' : '2026'}
                </span>
                <span className="text-xs font-extrabold text-[#1B1B1F]">
                  {selectedData.hospital}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#5B5F6B]">
                <span>
                  {language === 'bn' ? 'হিমোগ্লোবিন লেভেল:' : 'Hemoglobin Level:'}{' '}
                  <strong className="text-[#1B1B1F]">{formatDigits(selectedData.hbLevel)} g/dL</strong>
                </span>
                <span>•</span>
                <span>
                  {language === 'bn' ? 'শরীরে লোহিত কণিকা প্রস্তুতি:' : 'RBC Recovery Level:'}{' '}
                  <strong className="text-[#0B7A50]">{formatDigits(selectedData.readyPercent)}%</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-white text-[#C41E3A] border border-[#FFDADA] shadow-2xs">
                {selectedData.bags > 0
                  ? (language === 'bn'
                      ? `${formatDigits(selectedData.bags)} ব্যাগ রক্তদান (+${formatDigits(selectedData.livesSaved)} জীবন)`
                      : `${selectedData.bags} bag donated (+${selectedData.livesSaved} lives)`)
                  : (language === 'bn' ? 'রিকভারি ও পুষ্টিপর্ব' : 'Recovery & Rest Period')}
              </span>
            </div>
          </div>

          {/* Interactive SVG Bar & Continuous Hemoglobin Line Chart */}
          <div className="w-full bg-[#FAF9FB] rounded-2xl p-3 sm:p-4 border border-[#E4E6EB]/60">
            <div className="flex items-center justify-between text-xs text-[#5B5F6B] mb-2 px-1">
              <span className="font-semibold text-[#1B1B1F]">
                {language === 'bn' ? 'মাসিক রক্তদান ও হিমোগ্লোবিন কার্ভ (Hb Wave)' : 'Monthly Donations & Hemoglobin Wave'}
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#C41E3A]" /> {language === 'bn' ? 'রক্তদান' : 'Donation'}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#DCD9DE]" /> {language === 'bn' ? 'রিকভারি' : 'Recovery'}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#0B7A50]" /> {language === 'bn' ? 'হিমোগ্লোবিন কার্ভ' : 'Hb Wave'}
                </span>
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-48 sm:h-56 relative flex items-end justify-between gap-1.5 sm:gap-3 px-1 sm:px-4 pt-6 pb-2">
              {/* Horizontal Guidelines */}
              <div className="absolute inset-x-2 sm:inset-x-4 top-6 border-b border-dashed border-[#E4E6EB]" />
              <div className="absolute inset-x-2 sm:inset-x-4 top-1/2 border-b border-dashed border-[#E4E6EB]" />
              <div className="absolute inset-x-2 sm:inset-x-4 bottom-8 border-b border-[#E4E6EB]" />

              {/* Render Bars */}
              {monthlyData.map((item, idx) => {
                const isSelected = selectedMonthIndex === idx;
                const isDonationMonth = item.bags > 0;
                const barHeight = isDonationMonth ? 84 : 26;

                return (
                  <button
                    key={item.month}
                    onClick={() => setSelectedMonthIndex(idx)}
                    className="flex-1 flex flex-col items-center h-full justify-end group z-10 focus:outline-none cursor-pointer"
                  >
                    <div className="w-full max-w-[32px] sm:max-w-[42px] flex flex-col items-center justify-end h-[140px] sm:h-[160px]">
                      {/* Top Value Tag */}
                      {isDonationMonth ? (
                        <span className="text-[10px] font-black text-[#C41E3A] mb-1 group-hover:scale-110 transition-transform">
                          {formatDigits(item.bags)}
                        </span>
                      ) : (
                        <span className="text-[9px] text-[#8C8F9A] mb-1">
                          {formatDigits(item.readyPercent)}%
                        </span>
                      )}

                      {/* Bar Fill */}
                      <div
                        style={{ height: `${barHeight}%` }}
                        className={`w-full rounded-t-xl transition-all duration-300 ${
                          isDonationMonth
                            ? isSelected
                              ? 'bg-gradient-to-t from-[#9E0027] to-[#C41E3A] shadow-md ring-2 ring-[#FFDAD9] scale-102'
                              : 'bg-gradient-to-t from-[#C41E3A] to-[#E53935] hover:opacity-95'
                            : isSelected
                            ? 'bg-[#A6A2AA] ring-2 ring-[#E4E6EB]'
                            : 'bg-[#DCD9DE] hover:bg-[#CBC7CE]'
                        }`}
                      />
                    </div>

                    {/* Month Label */}
                    <span
                      className={`text-[11px] sm:text-xs mt-2 transition-colors font-semibold ${
                        isSelected ? 'text-[#C41E3A] font-extrabold' : 'text-[#5B5F6B]'
                      }`}
                    >
                      {item.month}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Explanatory Caption */}
            <div className="pt-2.5 border-t border-[#E4E6EB]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#5B5F6B] gap-1 px-1">
              <span>
                {language === 'bn'
                  ? '💡 প্রতি ৩ মাস পরপর সুস্থ প্রাপ্তবয়স্ক নারী-পুরুষ নিরাপদে ১ ব্যাগ রক্তদান করতে পারেন।'
                  : '💡 Healthy adults can safely donate 1 blood bag every 3 months.'}
              </span>
              <span className="text-[#1D5FD0] font-bold">
                {language === 'bn' ? '👆 বারে ট্যাপ করে বিস্তারিত দেখুন' : '👆 Tap bar for details'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: DEMAND VS SUPPLY DUAL BARS ================= */}
      {activeTab === 'demand' && (
        <div className="space-y-3.5 pt-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs text-[#5B5F6B] px-1">
            <span className="font-bold text-[#1B1B1F]">
              {language === 'bn'
                ? 'বগুড়া অঞ্চল ও আশেপাশের হাসপাতালে রক্তের ঘাটতি ও সরবরাহ চিত্র'
                : 'Regional Hospital Blood Deficit vs Supply'}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C41E3A]" />{' '}
                {language === 'bn' ? 'জরুরি চাহিদা (ব্যাগ)' : 'Demand (Bags)'}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0B7A50]" />{' '}
                {language === 'bn' ? 'সক্রিয় ডোনার (ব্যক্তি)' : 'Ready Donors'}
              </span>
            </div>
          </div>

          {/* Grid of Blood Groups with interactive touch feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 max-h-[380px] overflow-y-auto pr-1">
            {bloodDemandSupply.map((item) => {
              const isSelected = selectedGroup === item.group;
              return (
                <div
                  key={item.group}
                  onClick={() => setSelectedGroup(isSelected ? null : item.group)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFF5F6] border-[#FFCDD2] shadow-xs ring-1 ring-[#FFCDD2]'
                      : 'bg-[#FAF9FB] border-[#E4E6EB]/80 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white border border-[#E4E6EB] text-[#C41E3A] font-black text-sm flex items-center justify-center shadow-2xs">
                        {item.group}
                      </div>
                      {item.isCritical ? (
                        <span className="text-[10px] bg-[#FFDAD6] text-[#BA1A1A] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {language === 'bn'
                            ? `সংকটজনক ঘাটতি (${formatDigits(item.percent)}%)`
                            : `Critical Deficit (${item.percent}%)`}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-[#E8F5E9] text-[#005938] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          {language === 'bn'
                            ? `স্থিতিশীল (${formatDigits(item.percent)}%)`
                            : `Stable Supply (${item.percent}%)`}
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-[#5B5F6B] block">
                        {language === 'bn' ? 'গড় সন্ধান সময়:' : 'Avg match time:'}{' '}
                        <strong className="text-[#1B1B1F] font-bold">{item.waitTime}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Dual Bar Graphic */}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-[#5B5F6B]">
                      <span>
                        {language === 'bn'
                          ? `চাহিদা: ${formatDigits(item.demand)} ব্যাগ`
                          : `Demand: ${item.demand} bags`}
                      </span>
                      <span>
                        {language === 'bn'
                          ? `ডোনার: ${formatDigits(item.supply)} জন`
                          : `Donors: ${item.supply}`}
                      </span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-[#EAE8ED] flex overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, (item.demand / 70) * 100)}%` }}
                        className="h-full bg-gradient-to-r from-[#9E0027] to-[#C41E3A]"
                      />
                      <div
                        style={{ width: `${Math.min(100, (item.supply / 70) * 100)}%` }}
                        className="h-full bg-gradient-to-r from-[#0B7A50] to-[#12A06C] opacity-90 ml-0.5"
                      />
                    </div>
                  </div>

                  {/* Expanded group details */}
                  {isSelected && (
                    <div className="mt-2.5 pt-2 border-t border-[#FFCDD2]/60 text-xs text-[#5B5F6B] flex items-center justify-between">
                      <span>
                        {language === 'bn'
                          ? 'বর্তমানে শহীদ জিয়াউর রহমান মেডিকেলে সবচেয়ে বেশি প্রয়োজন'
                          : 'Currently in highest demand at SZMCH Medical College Hospital'}
                      </span>
                      <span className="text-[#C41E3A] font-bold">
                        {language === 'bn' ? 'আবেদন করুন →' : 'Request Now →'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Urgent Note on Negative Groups */}
          <div className="p-3 bg-[#FFF8E1] rounded-2xl border border-[#FFE082] flex items-start gap-2.5 text-xs text-[#9A5B00]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            {language === 'bn' ? (
              <p className="leading-relaxed">
                <strong>বিশেষ বার্তা:</strong> নেগেটিভ গ্রুপের রক্তদাতা মাত্র <strong>৩৮%–৪৪%</strong> ঘাটতিতে থাকে। আপনি বা আপনার পরিচিত কেউ নেগেটিভ গ্রুপের হলে অনুগ্রহ করে ডোনার হিসেবে নাম তালিকাভুক্ত রাখুন।
              </p>
            ) : (
              <p className="leading-relaxed">
                <strong>Important Notice:</strong> Rh-negative blood donors face a critical <strong>38%–44%</strong> shortage. If you or someone you know is Rh-negative, please register as an active donor.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: 24-HOUR EMERGENCY RESPONSE VELOCITY ================= */}
      {activeTab === 'velocity' && (
        <div className="space-y-4 pt-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3.5 bg-gradient-to-r from-[#F0FDF4] to-[#F2FBF7] rounded-2xl border border-[#C8EAD9]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B7A50] text-white flex items-center justify-center font-bold text-xs shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#003922]">
                  {language === 'bn'
                    ? 'সর্বোচ্চ সাড়া প্রদানের সময়: সকাল ১১টা ও বিকাল ৫টা'
                    : 'Peak Response Windows: 11:00 AM & 5:00 PM'}
                </h4>
                <p className="text-xs text-[#0B7A50]">
                  {language === 'bn' ? (
                    <>এই সময়ে রক্তদাতারা মাত্র <strong>৬.৪ মিনিটে</strong> সাড়া দিয়ে নিশ্চিত করেন।</>
                  ) : (
                    <>Donors respond in as fast as <strong>6.4 minutes</strong> during these hours.</>
                  )}
                </p>
              </div>
            </div>

            <span className="text-xs font-black bg-white text-[#0B7A50] px-3 py-1.5 rounded-xl border border-[#C8EAD9] shadow-2xs shrink-0">
              {language === 'bn' ? 'গড় সময়: ৭.৪ মিনিট' : 'Avg Speed: 7.4 mins'}
            </span>
          </div>

          {/* 24-Hour Velocity Heat & Height Graph */}
          <div className="w-full bg-[#FAF9FB] rounded-2xl p-3 sm:p-4 border border-[#E4E6EB]/60">
            <span className="text-xs font-bold text-[#1B1B1F] block mb-3">
              {language === 'bn'
                ? 'দিন-রাতের প্রতি ভাগে সাড়া দেওয়ার গতির গ্রাফ (মিনিট হিসেবে কম সময় মানে দ্রুত সাড়া)'
                : '24-hour response speed chart (shorter duration = faster matching)'}
            </span>

            <div className="h-44 sm:h-52 flex items-end justify-between gap-2 px-1 sm:px-3 pt-6 pb-2 relative">
              <div className="absolute inset-x-2 sm:inset-x-4 top-6 border-b border-dashed border-[#E4E6EB]" />
              <div className="absolute inset-x-2 sm:inset-x-4 bottom-8 border-b border-[#E4E6EB]" />

              {hourlyResponseCurve.map((h) => {
                const heightPercent = Math.max(25, 110 - h.timeMins * 5.5);
                const isFast = h.timeMins < 8;

                return (
                  <div key={h.hour} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-black text-[#1B1B1F] mb-1">
                      {formatDigits(h.timeMins)}{language === 'bn' ? 'মি.' : 'm'}
                    </span>

                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[34px] sm:max-w-[44px] rounded-t-xl transition-all duration-300 ${
                        isFast
                          ? 'bg-gradient-to-t from-[#0B7A50] to-[#12A06C] shadow-xs'
                          : 'bg-gradient-to-t from-[#5B5F6B] to-[#8C8F9A]'
                      }`}
                    />

                    <span className="text-[10px] sm:text-[11px] font-semibold text-[#5B5F6B] mt-2 whitespace-nowrap">
                      {h.hour}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#E4E6EB]/60 flex items-center justify-between text-xs text-[#5B5F6B]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0B7A50]" />{' '}
                {language === 'bn' ? 'দ্রুত সাড়া (<৮ মিনিট)' : 'Fast Response (<8 mins)'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5B5F6B]" />{' '}
                {language === 'bn' ? 'স্বাভাবিক সাড়া (১০-১৬ মিনিট)' : 'Standard Response (10-16 mins)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: REGIONAL UPAZILA DISTRIBUTION ================= */}
      {activeTab === 'regional' && (
        <div className="space-y-3 pt-1">
          <div className="text-xs text-[#5B5F6B] px-1 flex items-center justify-between">
            <span className="font-bold text-[#1B1B1F]">
              {language === 'bn' ? 'বগুড়া জেলার বিভিন্ন উপজেলায় ডোনার কভারেজ' : 'Donor Density Across Bogura Upazilas'}
            </span>
            <span>
              {language === 'bn' ? (
                <>মোট নিবন্ধিত ডোনার: <strong>{formatDigits(435)} জন</strong></>
              ) : (
                <>Total Registered: <strong>{435} donors</strong></>
              )}
            </span>
          </div>

          <div className="space-y-2.5">
            {upazilaDistribution.map((item) => (
              <div
                key={item.name}
                className="p-3 bg-[#FAF9FB] rounded-2xl border border-[#E4E6EB]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 hover:bg-white transition-colors"
              >
                <div className="w-full sm:w-44 shrink-0">
                  <div className="flex items-center justify-between sm:justify-start gap-2">
                    <span className="font-extrabold text-sm text-[#1B1B1F]">{item.name}</span>
                    <span className="text-[11px] text-[#0B7A50] font-bold bg-[#E8F5E9] px-2 py-0.5 rounded-md">
                      {formatDigits(item.activeToday)} {language === 'bn' ? 'আজ প্রস্তুত' : 'ready today'}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#5B5F6B] block mt-0.5">
                    {language === 'bn'
                      ? `মোট ডোনার: ${formatDigits(item.totalDonors)} জন`
                      : `Total Donors: ${item.totalDonors}`}
                  </span>
                </div>

                {/* Progress bar showing coverage strength */}
                <div className="w-full flex-1 sm:px-4">
                  <div className="flex justify-between text-[11px] text-[#5B5F6B] mb-1">
                    <span>{language === 'bn' ? 'সফলতার হার' : 'Fulfillment Rate'}</span>
                    <strong className="text-[#1B1B1F]">{formatDigits(item.fillRate)}%</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#EAE8ED] overflow-hidden">
                    <div
                      style={{ width: `${item.fillRate}%` }}
                      className="h-full bg-gradient-to-r from-[#9E0027] to-[#C41E3A] rounded-full"
                    />
                  </div>
                </div>

                <div className="self-end sm:self-center shrink-0">
                  <span className="text-[11px] font-bold text-[#C41E3A] bg-[#FDECEF] px-2.5 py-1 rounded-lg">
                    {language === 'bn'
                      ? `${formatDigits(item.urgentRequests)}টি চলমান`
                      : `${item.urgentRequests} active requests`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
