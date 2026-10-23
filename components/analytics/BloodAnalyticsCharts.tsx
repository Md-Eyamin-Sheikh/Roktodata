'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Droplets,
  Clock,
  Activity,
  AlertTriangle,
  Calendar,
  MapPin,
  CheckCircle2,
  Zap,
  Heart,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Info
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
      fullMonth: language === 'bn' ? 'জানুয়ারি ২০২৬' : 'January 2026',
      bags: 0,
      livesSaved: 0,
      hospital: language === 'bn' ? 'বিশ্রাম পর্ব (শরীরের পূর্ণ রিকভারি)' : 'Recovery Phase (Rest & Recovery)',
      hbLevel: 14.4,
      readyPercent: 65,
    },
    {
      month: language === 'bn' ? 'ফেব্রু' : 'Feb',
      fullMonth: language === 'bn' ? 'ফেব্রুয়ারি ২০২৬' : 'February 2026',
      bags: 1,
      livesSaved: 3,
      hospital: language === 'bn' ? 'সন্ধানী শীতকালীন ক্যাম্প, বগুড়া' : 'Sandhani Winter Camp, Bogura',
      hbLevel: 13.9,
      readyPercent: 100,
    },
    {
      month: language === 'bn' ? 'মার্চ' : 'Mar',
      fullMonth: language === 'bn' ? 'মার্চ ২০২৬' : 'March 2026',
      bags: 0,
      livesSaved: 0,
      hospital: language === 'bn' ? 'রিকভারি পর্ব (আয়রন ও পুষ্টি বৃদ্ধি)' : 'Recovery Phase (Iron Boost)',
      hbLevel: 14.1,
      readyPercent: 35,
    },
    {
      month: language === 'bn' ? 'এপ্রিল' : 'Apr',
      fullMonth: language === 'bn' ? 'এপ্রিল ২০২৬' : 'April 2026',
      bags: 0,
      livesSaved: 0,
      hospital: language === 'bn' ? 'প্রস্তুতি পর্ব (রক্তের কোষ সতেজ)' : 'Rest Phase (Body Preparation)',
      hbLevel: 14.5,
      readyPercent: 70,
    },
    {
      month: language === 'bn' ? 'মে' : 'May',
      fullMonth: language === 'bn' ? 'মে ২০২৬' : 'May 2026',
      bags: 1,
      livesSaved: 3,
      hospital: language === 'bn' ? 'মোহাম্মদ আলী হাসপাতাল, বগুড়া' : 'Mohammad Ali Hospital, Bogura',
      hbLevel: 14.0,
      readyPercent: 100,
    },
    {
      month: language === 'bn' ? 'জুন' : 'Jun',
      fullMonth: language === 'bn' ? 'জুন ২০২৬' : 'June 2026',
      bags: 0,
      livesSaved: 0,
      hospital: language === 'bn' ? 'রিকভারি পর্ব (প্লাজমা ব্যালেন্স)' : 'Recovery Phase (Plasma Balance)',
      hbLevel: 14.3,
      readyPercent: 40,
    },
    {
      month: language === 'bn' ? 'জুলাই' : 'Jul',
      fullMonth: language === 'bn' ? 'জুলাই ২০২৬' : 'July 2026',
      bags: 0,
      livesSaved: 0,
      hospital: language === 'bn' ? 'প্রস্তুতি পর্ব (শরীরের পূর্ণ প্রস্তুতি)' : 'Rest Phase (Preparation)',
      hbLevel: 14.6,
      readyPercent: 75,
    },
    {
      month: language === 'bn' ? 'আগস্ট' : 'Aug',
      fullMonth: language === 'bn' ? 'আগস্ট ২০২৬' : 'August 2026',
      bags: 1,
      livesSaved: 3,
      hospital: language === 'bn' ? 'শহীদ জিয়াউর রহমান মেডিকেল কলেজ' : 'SZMCH Medical College Hospital',
      hbLevel: 14.1,
      readyPercent: 100,
    },
    {
      month: language === 'bn' ? 'সেপ্টে' : 'Sep',
      fullMonth: language === 'bn' ? 'সেপ্টেম্বর ২০২৬' : 'September 2026',
      bags: 0,
      livesSaved: 0,
      hospital: language === 'bn' ? 'রিকভারি পর্ব (চলতি সাইকেল)' : 'Recovery Phase (Current Cycle)',
      hbLevel: 14.4,
      readyPercent: 45,
    },
    {
      month: language === 'bn' ? 'অক্টো' : 'Oct',
      fullMonth: language === 'bn' ? 'অক্টোবর ২০২৬' : 'October 2026',
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
  const avgResponseTime = '৭.৪';
  const overallFulfillmentRate = '৯৪.৮%';

  return (
    <div className="w-full bg-white rounded-3xl p-4 sm:p-6 md:p-7 shadow-xs border border-[#E4E6EB]/80 space-y-5 sm:space-y-6 transition-all">
      
      {/* ================= 1. HEADER & TIMEFRAME SELECTOR ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E4E6EB]/70">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#9E0027] via-[#C41E3A] to-[#E53935] text-white flex items-center justify-center shadow-xs shrink-0">
            <TrendingUp className="w-6 h-6 stroke-[2.3]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-extrabold text-[17px] sm:text-[20px] text-[#1B1B1F] tracking-tight">
                {language === 'bn' ? 'লাইভ রক্তদান ও স্বাস্থ্য এনালিটিক্স' : 'Live Blood Donation & Health Analytics'}
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#005938] text-[10.5px] font-bold border border-[#C8E6C9]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00744B] animate-pulse" />
                <span>{language === 'bn' ? 'লাইভ সিঙ্ক' : 'Live Sync'}</span>
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-[#5B5F6B] mt-0.5 leading-relaxed">
              {language === 'bn'
                ? 'রক্তদানের মানবিক প্রভাব, আঞ্চলিক চাহিদা ও জরুরি সাড়ার গতিশীল চিত্র'
                : 'Real-time impact metrics, regional blood deficit and emergency match velocity'}
            </p>
          </div>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="inline-flex items-center gap-1 p-1 bg-[#F5F4F7] rounded-2xl border border-[#E4E6EB]/60 self-start md:self-auto shrink-0 shadow-2xs">
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
              type="button"
              onClick={() => setTimeframe(item.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeframe === item.key
                  ? 'bg-white text-[#9E0027] shadow-xs scale-102 ring-1 ring-[#FFDAD6]'
                  : 'text-[#5B5F6B] hover:text-[#1B1B1F] hover:bg-white/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= 2. 4 CORE METRIC CARDS (BALANCED RESPONSIVE GRID) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Metric 1: Response Velocity */}
        <div className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-br from-[#FFF5F6] to-[#FFF9F9] border border-[#FFDAD6] flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[12px] font-bold text-[#9E0027]">
                {language === 'bn' ? 'জরুরি সাড়ার গতি' : 'Response Velocity'}
              </span>
              <div className="w-7 h-7 rounded-xl bg-[#FDECEF] flex items-center justify-center text-[#C41E3A] shrink-0">
                <Zap className="w-4 h-4 fill-current" />
              </div>
            </div>
            
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-[#1B1B1F] tracking-tight">
                {avgResponseTime}
              </span>
              <span className="text-xs font-bold text-[#5B5F6B]">
                {language === 'bn' ? 'মিনিট' : 'mins'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-[#5B5F6B] mt-1.5">
              <span className="inline-flex items-center text-[#005938] font-bold bg-[#E8F5E9] px-1.5 py-0.5 rounded-md">
                ↑ ২৮% দ্রুত
              </span>
              <span className="truncate">{language === 'bn' ? 'গত মাসের চেয়ে' : 'vs last month'}</span>
            </div>
          </div>

          {/* Mini Sparkline Bar Chart */}
          <div className="mt-3 pt-2.5 border-t border-[#FFDAD6]/60 flex items-end gap-1.5 h-6">
            {[45, 60, 50, 75, 92, 85, 100].map((val, i) => (
              <div
                key={i}
                style={{ height: `${val}%` }}
                className={`flex-1 rounded-sm transition-all ${
                  i === 6 ? 'bg-[#C41E3A]' : 'bg-[#FFCDD2]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Metric 2: Live Fulfillment Rate */}
        <div className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-br from-[#F2FBF7] to-[#F7FCF9] border border-[#C8E6C9] flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[12px] font-bold text-[#005938]">
                {language === 'bn' ? 'চাহিদা পূরণ হার' : 'Fulfillment Rate'}
              </span>
              <div className="w-7 h-7 rounded-xl bg-[#E8F5E9] flex items-center justify-center text-[#00744B] shrink-0">
                <CheckCircle2 className="w-4 h-4 stroke-[2.4]" />
              </div>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-[#1B1B1F] tracking-tight">
                {overallFulfillmentRate}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-[#5B5F6B] mt-1.5">
              <span className="text-[#005938] font-bold">৯১/৯৬টি</span>
              <span className="truncate">{language === 'bn' ? 'আবেদন সফলভাবে সম্পন্ন' : 'requests fulfilled'}</span>
            </div>
          </div>

          {/* Clean Progress Gauge */}
          <div className="mt-3 pt-2.5 border-t border-[#C8E6C9]/60">
            <div className="w-full h-2 rounded-full bg-[#DCEEE3] overflow-hidden">
              <div className="h-full bg-[#00744B] rounded-full" style={{ width: '94.8%' }} />
            </div>
          </div>
        </div>

        {/* Metric 3: Total Lives Touched */}
        <div className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-br from-[#F5F8FF] to-[#FAF9FF] border border-[#D9E2FF] flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[12px] font-bold text-[#001946]">
                {language === 'bn' ? 'জীবন স্পর্শিত' : 'Lives Saved'}
              </span>
              <div className="w-7 h-7 rounded-xl bg-[#D9E2FF] flex items-center justify-center text-[#0D58C9] shrink-0">
                <Heart className="w-4 h-4 fill-current" />
              </div>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-[#1B1B1F] tracking-tight">
                {formatDigits(totalLivesImpacted)}+
              </span>
              <span className="text-xs font-bold text-[#5B5F6B]">
                {language === 'bn' ? 'মুগ্ধ প্রাণ' : 'Souls'}
              </span>
            </div>

            <p className="text-[11px] text-[#5B5F6B] mt-1.5 leading-tight truncate">
              {language === 'bn' ? '১ ব্যাগ রক্ত = ৩ জন রোগীর জীবন' : '1 blood bag = 3 lives touched'}
            </p>
          </div>

          {/* Humanitarian Tag */}
          <div className="mt-3 pt-2.5 border-t border-[#D9E2FF]/60 flex items-center gap-1.5 text-[11px] font-bold text-[#0D58C9]">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{language === 'bn' ? 'মানবিক অংশীদারিত্ব' : 'Humanitarian impact'}</span>
          </div>
        </div>

        {/* Metric 4: Active Ready Donors Today */}
        <div className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-br from-[#FFF9ED] to-[#FFFCF5] border border-[#FFE8B5] flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[12px] font-bold text-[#805000]">
                {language === 'bn' ? 'আজ প্রস্তুত রক্তদাতা' : 'Ready Donors Today'}
              </span>
              <div className="w-7 h-7 rounded-xl bg-[#FFF0D0] flex items-center justify-center text-[#9A5B00] shrink-0">
                <Activity className="w-4 h-4 stroke-[2.4]" />
              </div>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-[#1B1B1F] tracking-tight">
                {formatDigits(62)}
              </span>
              <span className="text-xs font-bold text-[#005938] bg-[#E8F5E9] px-2 py-0.5 rounded-full">
                {language === 'bn' ? 'সক্রিয়' : 'Active'}
              </span>
            </div>

            <p className="text-[11px] text-[#5B5F6B] mt-1.5 leading-tight truncate">
              {language === 'bn' ? 'বগুড়া সদর এলাকায় প্রস্তুত' : 'Ready in Bogura Sadar'}
            </p>
          </div>

          {/* Active Level Gauge */}
          <div className="mt-3 pt-2.5 border-t border-[#FFE8B5]/60">
            <div className="w-full h-2 rounded-full bg-[#FAEDCE] overflow-hidden">
              <div className="h-full bg-[#B26E00] rounded-full" style={{ width: '78%' }} />
            </div>
          </div>
        </div>

      </div>

      {/* ================= 3. PRIMARY CHART TABS (MODERN SEGMENTED TABS) ================= */}
      <div className="flex items-center overflow-x-auto no-scrollbar gap-2 p-1.5 bg-[#F5F4F7] rounded-2xl border border-[#E4E6EB]/60">
        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-white text-[#9E0027] shadow-xs scale-102 ring-1 ring-[#FFDAD6]'
              : 'text-[#5B5F6B] hover:text-[#1B1B1F] hover:bg-white/50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{language === 'bn' ? 'রক্তদান টাইমলাইন ও হিমোগ্লোবিন' : 'Timeline & Hemoglobin Wave'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('demand')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'demand'
              ? 'bg-white text-[#9E0027] shadow-xs scale-102 ring-1 ring-[#FFDAD6]'
              : 'text-[#5B5F6B] hover:text-[#1B1B1F] hover:bg-white/50'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>{language === 'bn' ? 'গ্রুপভিত্তিক চাহিদা বনাম সরবরাহ' : 'Demand vs Supply by Group'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('velocity')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'velocity'
              ? 'bg-white text-[#9E0027] shadow-xs scale-102 ring-1 ring-[#FFDAD6]'
              : 'text-[#5B5F6B] hover:text-[#1B1B1F] hover:bg-white/50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{language === 'bn' ? '২৪ ঘণ্টা সাড়ার গতি ও পিক আওয়ার' : '24h Velocity & Peak Hours'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('regional')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'regional'
              ? 'bg-white text-[#9E0027] shadow-xs scale-102 ring-1 ring-[#FFDAD6]'
              : 'text-[#5B5F6B] hover:text-[#1B1B1F] hover:bg-white/50'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{language === 'bn' ? 'উপজেলা রক্তভাণ্ডার ডেনসিটি' : 'Regional Upazila Density'}</span>
        </button>
      </div>

      {/* ================= TAB 1: DONATION TIMELINE & HEMOGLOBIN TRACKER ================= */}
      {activeTab === 'timeline' && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-200">
          
          {/* Active Month Inspection Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FAF9FB] via-[#FFF5F6] to-[#FFF0F2] border border-[#FFDAD6] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-extrabold text-[#9E0027] uppercase tracking-wider bg-white px-2.5 py-0.5 rounded-lg border border-[#FFCDD2] shadow-2xs">
                  {selectedData.fullMonth}
                </span>
                <span className="text-sm font-extrabold text-[#1B1B1F]">
                  {selectedData.hospital}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#5B5F6B]">
                <span>
                  {language === 'bn' ? 'হিমোগ্লোবিন স্তর:' : 'Hemoglobin Level:'}{' '}
                  <strong className="text-[#1B1B1F] font-bold">{formatDigits(selectedData.hbLevel)} g/dL</strong>
                </span>
                <span className="text-[#D1D5DB]">•</span>
                <span>
                  {language === 'bn' ? 'শরীরে লোহিত কণিকা প্রস্তুতি:' : 'RBC Recovery Level:'}{' '}
                  <strong className="text-[#005938] font-bold">{formatDigits(selectedData.readyPercent)}%</strong>
                </span>
              </div>
            </div>

            <div className="shrink-0 self-start md:self-auto">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3.5 py-2 rounded-xl bg-white text-[#9E0027] border border-[#FFDAD6] shadow-xs">
                {selectedData.bags > 0 ? (
                  <>
                    <Droplets className="w-4 h-4 text-[#C41E3A] fill-current" />
                    <span>
                      {language === 'bn'
                        ? `${formatDigits(selectedData.bags)} ব্যাগ রক্তদান (+${formatDigits(selectedData.livesSaved)} জীবন বাঁচানো)`
                        : `${selectedData.bags} bag donated (+${selectedData.livesSaved} lives saved)`}
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#00744B]" />
                    <span>{language === 'bn' ? 'রিকভারি ও পুষ্টিপর্ব' : 'Recovery & Rest Period'}</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Interactive Bar Chart & Hemoglobin Curve */}
          <div className="w-full bg-[#FAF9FB] rounded-2xl p-4 sm:p-5 border border-[#E4E6EB]/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#5B5F6B] mb-3">
              <span className="font-bold text-[#1B1B1F] text-sm">
                {language === 'bn' ? 'মাসিক রক্তদান ও হিমোগ্লোবিন কার্ভ (Hb Wave)' : 'Monthly Donations & Hemoglobin Wave'}
              </span>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 rounded-sm bg-[#C41E3A]" />
                  <span>{language === 'bn' ? 'রক্তদান' : 'Donation'}</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 rounded-sm bg-[#DCD9DE]" />
                  <span>{language === 'bn' ? 'রিকভারি' : 'Recovery'}</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3.5 h-1 bg-[#00744B] rounded-full" />
                  <span>{language === 'bn' ? 'হিমোগ্লোবিন স্তর' : 'Hb Wave'}</span>
                </span>
              </div>
            </div>

            {/* Bars Area */}
            <div className="h-52 sm:h-60 relative flex items-end justify-between gap-1 sm:gap-3 px-1 sm:px-4 pt-6 pb-2">
              <div className="absolute inset-x-2 sm:inset-x-4 top-8 border-b border-dashed border-[#E4E6EB]" />
              <div className="absolute inset-x-2 sm:inset-x-4 top-1/2 border-b border-dashed border-[#E4E6EB]" />
              <div className="absolute inset-x-2 sm:inset-x-4 bottom-8 border-b border-[#E4E6EB]" />

              {monthlyData.map((item, idx) => {
                const isSelected = selectedMonthIndex === idx;
                const isDonationMonth = item.bags > 0;
                const barHeight = isDonationMonth ? 85 : 28;

                return (
                  <button
                    key={item.month}
                    type="button"
                    onClick={() => setSelectedMonthIndex(idx)}
                    className="flex-1 flex flex-col items-center h-full justify-end group z-10 focus:outline-none cursor-pointer"
                  >
                    <div className="w-full max-w-[36px] sm:max-w-[48px] flex flex-col items-center justify-end h-[150px] sm:h-[180px]">
                      {isDonationMonth ? (
                        <span className="text-[11px] font-black text-[#C41E3A] mb-1.5 group-hover:scale-110 transition-transform">
                          {formatDigits(item.bags)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#8C8F9A] mb-1.5 font-semibold">
                          {formatDigits(item.readyPercent)}%
                        </span>
                      )}

                      <div
                        style={{ height: `${barHeight}%` }}
                        className={`w-full rounded-t-xl transition-all duration-300 ${
                          isDonationMonth
                            ? isSelected
                              ? 'bg-gradient-to-t from-[#9E0027] to-[#C41E3A] shadow-md ring-2 ring-[#FFDAD9] scale-105'
                              : 'bg-gradient-to-t from-[#C41E3A] to-[#E53935] hover:opacity-95'
                            : isSelected
                            ? 'bg-[#8F8B94] ring-2 ring-[#E4E6EB]'
                            : 'bg-[#DCD9DE] hover:bg-[#CBC7CE]'
                        }`}
                      />
                    </div>

                    <span
                      className={`text-xs mt-2.5 transition-colors font-bold ${
                        isSelected ? 'text-[#9E0027]' : 'text-[#5B5F6B]'
                      }`}
                    >
                      {item.month}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Insight Note */}
            <div className="pt-3 border-t border-[#E4E6EB]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#5B5F6B] gap-1.5">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#0D58C9] shrink-0" />
                <span>
                  {language === 'bn'
                    ? 'প্রতি ৩ মাস পরপর যেকোনো প্রাপ্তবয়স্ক সুস্থ নারী-পুরুষ ১ ব্যাগ রক্ত নিরাপদে দান করতে পারেন।'
                    : 'Healthy adults can safely donate 1 blood bag every 3 months.'}
                </span>
              </span>
              <span className="text-[#0D58C9] font-bold">
                {language === 'bn' ? '👆 নির্দিষ্ট মাসের বারে ক্লিক করে তথ্য দেখুন' : '👆 Click any bar for details'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: DEMAND VS SUPPLY BY BLOOD GROUP ================= */}
      {activeTab === 'demand' && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#5B5F6B]">
            <span className="font-bold text-[#1B1B1F] text-sm">
              {language === 'bn'
                ? 'বগুড়া ও পার্শ্ববর্তী হাসপাতালসমূহে রক্তের ঘাটতি ও সরবরাহ চিত্র'
                : 'Hospital Blood Deficit vs Ready Donor Supply'}
            </span>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C41E3A]" />
                <span>{language === 'bn' ? 'জরুরি চাহিদা (ব্যাগ)' : 'Demand (Bags)'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00744B]" />
                <span>{language === 'bn' ? 'প্রস্তুত ডোনার' : 'Ready Donors'}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {bloodDemandSupply.map((item) => {
              const isSelected = selectedGroup === item.group;
              return (
                <div
                  key={item.group}
                  onClick={() => setSelectedGroup(isSelected ? null : item.group)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFF5F6] border-[#FFCDD2] shadow-xs ring-1 ring-[#FFCDD2]'
                      : 'bg-[#FAF9FB] border-[#E4E6EB]/80 hover:bg-white hover:border-[#D1D5DB]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-white border border-[#E4E6EB] text-[#C41E3A] font-black text-base flex items-center justify-center shadow-2xs">
                        {item.group}
                      </div>
                      <span
                        className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          item.isCritical
                            ? 'bg-[#FFDAD6] text-[#BA1A1A]'
                            : 'bg-[#E8F5E9] text-[#005938]'
                        }`}
                      >
                        {item.isCritical ? (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            <span>{language === 'bn' ? `ঘাটতি (${formatDigits(item.percent)}%)` : `Deficit (${item.percent}%)`}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{language === 'bn' ? `স্থিতিশীল (${formatDigits(item.percent)}%)` : `Stable (${item.percent}%)`}</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3.5 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-[#1B1B1F]">
                      <span className="text-[#C41E3A]">
                        {language === 'bn' ? `চাহিদা: ${formatDigits(item.demand)}` : `Demand: ${item.demand}`}
                      </span>
                      <span className="text-[#005938]">
                        {language === 'bn' ? `ডোনার: ${formatDigits(item.supply)}` : `Donors: ${item.supply}`}
                      </span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-[#EAE8ED] flex overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, (item.demand / 70) * 100)}%` }}
                        className="h-full bg-gradient-to-r from-[#9E0027] to-[#C41E3A]"
                      />
                      <div
                        style={{ width: `${Math.min(100, (item.supply / 70) * 100)}%` }}
                        className="h-full bg-gradient-to-r from-[#00744B] to-[#12A06C] ml-0.5"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#5B5F6B] pt-1">
                      <span>{language === 'bn' ? 'গড় সন্ধান সময়:' : 'Avg Match:'}</span>
                      <strong className="text-[#1B1B1F] font-bold">{item.waitTime}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notice on Rh-negative Blood */}
          <div className="p-3.5 bg-[#FFF8E1] rounded-2xl border border-[#FFE082] flex items-start gap-3 text-xs text-[#9A5B00]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>{language === 'bn' ? 'জরুরি বিজ্ঞপ্তি:' : 'Critical Notice:'}</strong>{' '}
              {language === 'bn'
                ? 'নেগেটিভ রক্তের গ্রুপসমূহে (O-, A-, B-, AB-) প্রায় ৩৮%–৪৪% ডোনার ঘাটতি রয়েছে। আপনি নেগেটিভ গ্রুপের রক্তদাতা হলে সবসময় সক্রিয় থাকুন।'
                : 'Rh-negative blood groups (O-, A-, B-, AB-) face an acute 38%–44% donor shortage. Please keep your availability active if you are Rh-negative.'}
            </p>
          </div>
        </div>
      )}

      {/* ================= TAB 3: 24-HOUR EMERGENCY VELOCITY ================= */}
      {activeTab === 'velocity' && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-gradient-to-r from-[#F0FDF4] to-[#F2FBF7] rounded-2xl border border-[#C8EAD9]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00744B] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#003922]">
                  {language === 'bn'
                    ? 'সর্বোচ্চ সাড়ার সময়: সকাল ১১টা ও বিকাল ৫টা'
                    : 'Peak Response Windows: 11:00 AM & 5:00 PM'}
                </h4>
                <p className="text-xs text-[#005938] mt-0.5">
                  {language === 'bn' ? (
                    <>এই সময়ে রক্তদাতারা মাত্র <strong>৬.৪ মিনিটে</strong> সাড়া দিয়ে নিশ্চিত করেন।</>
                  ) : (
                    <>Donors respond in as fast as <strong>6.4 minutes</strong> during these hours.</>
                  )}
                </p>
              </div>
            </div>

            <span className="text-xs font-black bg-white text-[#00744B] px-3.5 py-2 rounded-xl border border-[#C8EAD9] shadow-xs shrink-0 self-start md:self-auto">
              {language === 'bn' ? 'সারাদিনের গড় গতি: ৭.৪ মিনিট' : 'Overall Speed: 7.4 mins'}
            </span>
          </div>

          <div className="w-full bg-[#FAF9FB] rounded-2xl p-4 sm:p-5 border border-[#E4E6EB]/80">
            <span className="text-xs font-bold text-[#1B1B1F] block mb-3">
              {language === 'bn'
                ? 'সময়ভিত্তিক সাড়ার গতির গ্রাফ (মিনিট কম মানে দ্রুত সাড়া)'
                : '24-hour response velocity curve (lower minutes = faster match)'}
            </span>

            <div className="h-48 sm:h-56 flex items-end justify-between gap-2 px-1 sm:px-4 pt-6 pb-2 relative">
              <div className="absolute inset-x-2 sm:inset-x-4 top-8 border-b border-dashed border-[#E4E6EB]" />
              <div className="absolute inset-x-2 sm:inset-x-4 bottom-8 border-b border-[#E4E6EB]" />

              {hourlyResponseCurve.map((h) => {
                const heightPercent = Math.max(25, 110 - h.timeMins * 5.5);
                const isFast = h.timeMins < 8;

                return (
                  <div key={h.hour} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[10.5px] font-black text-[#1B1B1F] mb-1.5">
                      {formatDigits(h.timeMins)}{language === 'bn' ? 'মি.' : 'm'}
                    </span>

                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[38px] sm:max-w-[48px] rounded-t-xl transition-all duration-300 ${
                        isFast
                          ? 'bg-gradient-to-t from-[#00744B] to-[#12A06C] shadow-xs'
                          : 'bg-gradient-to-t from-[#5B5F6B] to-[#8C8F9A]'
                      }`}
                    />

                    <span className="text-[10px] sm:text-[11px] font-bold text-[#5B5F6B] mt-2 whitespace-nowrap">
                      {h.hour}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#E4E6EB]/70 flex items-center justify-between text-xs text-[#5B5F6B]">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00744B]" />
                <span>{language === 'bn' ? 'দ্রুততম সাড়া (<৮ মিনিট)' : 'Fastest Match (<8 mins)'}</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5B5F6B]" />
                <span>{language === 'bn' ? 'স্বাভাবিক সাড়া (১০-১৬ মিনিট)' : 'Standard Match (10-16 mins)'}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: REGIONAL UPAZILA DISTRIBUTION ================= */}
      {activeTab === 'regional' && (
        <div className="space-y-3.5 pt-1 animate-in fade-in duration-200">
          <div className="text-xs text-[#5B5F6B] px-1 flex items-center justify-between">
            <span className="font-bold text-[#1B1B1F] text-sm">
              {language === 'bn' ? 'বগুড়া জেলার উপজেলাভিত্তিক ডোনার কভারেজ' : 'Donor Density Across Bogura Upazilas'}
            </span>
            <span className="font-bold text-[#1B1B1F]">
              {language === 'bn' ? `মোট নিবন্ধিত: ${formatDigits(435)} জন` : `Total Donors: ${435}`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upazilaDistribution.map((item) => (
              <div
                key={item.name}
                className="p-4 bg-[#FAF9FB] rounded-2xl border border-[#E4E6EB]/80 flex flex-col justify-between gap-3 hover:bg-white hover:border-[#D1D5DB] transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h5 className="font-extrabold text-sm text-[#1B1B1F]">{item.name}</h5>
                    <span className="text-[11px] text-[#5B5F6B] mt-0.5 block">
                      {language === 'bn' ? `মোট রক্তদাতা: ${formatDigits(item.totalDonors)} জন` : `Total: ${item.totalDonors}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-[#005938] font-bold bg-[#E8F5E9] px-2.5 py-0.5 rounded-full border border-[#C8E6C9]">
                      {formatDigits(item.activeToday)} {language === 'bn' ? 'প্রস্তুত' : 'ready'}
                    </span>
                    <span className="text-[11px] font-bold text-[#C41E3A] bg-[#FDECEF] px-2 py-0.5 rounded-full border border-[#FFDAD6]">
                      {formatDigits(item.urgentRequests)}টি জরুরি
                    </span>
                  </div>
                </div>

                {/* Fulfillment Strength Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#5B5F6B] font-semibold">
                    <span>{language === 'bn' ? 'সফলতার হার' : 'Fulfillment Rate'}</span>
                    <strong className="text-[#1B1B1F] font-bold">{formatDigits(item.fillRate)}%</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#EAE8ED] overflow-hidden">
                    <div
                      style={{ width: `${item.fillRate}%` }}
                      className="h-full bg-gradient-to-r from-[#9E0027] to-[#C41E3A] rounded-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
