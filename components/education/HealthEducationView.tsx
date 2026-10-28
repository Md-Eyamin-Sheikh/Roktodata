'use client';

import React, { useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { HealthEducationArticle } from '@/lib/types';

interface HealthEducationViewProps {
  articles: HealthEducationArticle[];
  onBack: () => void;
}

export const HealthEducationView: React.FC<HealthEducationViewProps> = ({
  articles,
  onBack,
}) => {
  const [selectedCat, setSelectedCat] = useState<'all' | 'eligibility' | 'before_after' | 'myths' | 'recovery'>('all');

  const filtered = articles.filter((a) => selectedCat === 'all' || a.category === selectedCat);

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
            <h1 className="font-bold text-[18px] text-[#1B1B1F] leading-tight">স্বাস্থ্য-শিক্ষা ও সচেতনতা</h1>
            <span className="text-[11px] text-[#5B5F6B]">নিরাপদ রক্তদানের সঠিক তথ্য ও নির্দেশিকা</span>
          </div>
        </div>
      </div>

      {/* Mandatory Medical Disclaimer Banner */}
      <div className="p-3.5 bg-[#FFF5F6] rounded-2xl border border-[#FFDAD6] text-xs text-[#9E0027] mb-3 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C41E3A]" />
        <div className="leading-relaxed">
          <strong className="block font-bold mb-0.5">জরুরি চিকিৎসা সংক্রান্ত সতর্কতা:</strong>
          রক্তদাতা প্ল্যাটফর্ম কোনো হাসপাতাল বা চিকিৎসক নয়। এখানে উল্লেখিত স্বাস্থ্য তথ্য প্রাথমিক নির্দেশিকা মাত্র এবং কোনো অবস্থাতেই পেশাদার চিকিৎসা পরামর্শের বিকল্প নয়। রক্তদানের পূর্বে অনুমোদিত স্বাস্থ্যকর্মী দ্বারা স্বাস্থ্য পরীক্ষা (ওজন, রক্তচাপ, হিমোগ্লোবিন) এবং রোগীর জন্য স্ক্রিনিং টেস্ট সম্পন্ন করা বাধ্যতামূলক।
        </div>
      </div>

      {/* Category Pills */}
      <div className="p-2.5 bg-white rounded-2xl border border-[#E4E6EB]/50 shadow-xs mb-3 flex gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'সব তথ্য' },
          { id: 'eligibility', label: 'কারা দিতে পারবেন' },
          { id: 'before_after', label: 'আগে ও পরে' },
          { id: 'myths', label: 'ভুল ধারণা বনাম সত্য' },
          { id: 'recovery', label: 'হিমোগ্লোবিন রিকভারি' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedCat(item.id as any)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedCat === item.id
                ? 'bg-[#FDECEF] text-[#C41E3A] ring-1 ring-[#C41E3A]'
                : 'bg-[#F7F7F9] text-[#5B5F6B] hover:bg-[#F0EDF2]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Articles (Responsive 2-column grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.map((art) => (
          <article
            key={art.id}
            className="bg-white rounded-2xl p-4 shadow-xs border border-[#E4E6EB]/60 space-y-3"
          >
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-[#1B1B1F]">{art.title}</h3>
                <p className="text-[11px] text-[#5B5F6B]">{art.summary}</p>
              </div>
            </div>

            <div className="space-y-2 pt-1 border-t border-[#E4E6EB]/40">
              {art.details.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-[#1B1B1F] leading-relaxed">
                  <CheckCircle className="w-4 h-4 text-[#00744B] shrink-0 mt-0.5" />
                  <p className="whitespace-pre-line">{point}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      {/* Official Guidelines & Authority Citation */}
      <div className="mt-6 p-4 rounded-2xl bg-white border border-[#E4E6EB] shadow-2xs space-y-2">
        <h4 className="text-xs font-bold text-[#1B1B1F]">তথ্যসূত্র ও সরকারি নির্দেশিকা:</h4>
        <p className="text-[11px] text-[#5B5F6B] leading-relaxed">
          ১. জাতীয় নিরাপদ রক্ত সঞ্চালন গাইডলাইন, <strong>স্বাস্থ্য অধিদপ্তর (DGHS)</strong>, স্বাস্থ্য ও পরিবার কল্যাণ মন্ত্রণালয়, বাংলাদেশ সরকার।<br />
          ২. নিরাপদ রক্তদান নির্দেশিকা ও যোগ্যতা মানদণ্ড, <strong>বাংলাদেশ রেড ক্রিসেন্ট সোসাইটি (BDRCS)</strong>।<br />
          ৩. বিশ্ব স্বাস্থ্য সংস্থা (WHO) রক্তদান যোগ্যতা ও হিমোগ্লোবিন পরিমাপ নির্দেশিকা।
        </p>
      </div>
    </div>
  );
};
