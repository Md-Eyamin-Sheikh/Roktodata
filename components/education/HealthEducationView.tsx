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
  const [selectedCat, setSelectedCat] = useState<'all' | 'eligibility' | 'before_after' | 'myths'>('all');

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

      {/* Category Pills */}
      <div className="p-2.5 bg-white rounded-2xl border border-[#E4E6EB]/50 shadow-xs mb-3 flex gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'সব তথ্য' },
          { id: 'eligibility', label: 'কারা দিতে পারবেন' },
          { id: 'before_after', label: 'আগে ও পরে' },
          { id: 'myths', label: 'ভুল ধারণা বনাম সত্য' },
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
    </div>
  );
};
