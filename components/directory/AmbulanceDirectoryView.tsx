'use client';

import React from 'react';
import { ArrowLeft, Phone, AlertCircle, ShieldCheck, MapPin } from 'lucide-react';
import { AmbulanceService } from '@/lib/types';
import { toBengaliDigits } from '@/lib/bengali-utils';

interface AmbulanceDirectoryViewProps {
  ambulances: AmbulanceService[];
  onBack: () => void;
}

export const AmbulanceDirectoryView: React.FC<AmbulanceDirectoryViewProps> = ({
  ambulances,
  onBack,
}) => {
  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 md:px-0 pb-24">
      {/* Header */}
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
            <h1 className="font-bold text-[18px] text-[#1B1B1F] leading-tight">জরুরি অ্যাম্বুলেন্স ডিরেক্টরি</h1>
            <span className="text-[11px] text-[#5B5F6B]">অফলাইনেও নম্বর সংরক্ষিত থাকে</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Offline Availability Banner */}
        <div className="p-3 bg-[#E8F5E9] rounded-2xl flex items-center gap-2 text-xs text-[#005938] border border-[#A5D6A7]">
          <ShieldCheck className="w-4 h-4 shrink-0 text-[#00744B]" />
          <span>এই নম্বরগুলো ইন্টারনেট সংযোগ ছাড়াও যেকোনো জরুরি মুহূর্তে কল করার জন্য উন্মুক্ত।</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {ambulances.map((amb) => (
            <div
              key={amb.id}
              className="bg-white rounded-2xl p-4 shadow-xs border border-[#E4E6EB]/60 flex items-center justify-between gap-3"
            >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#1B1B1F] truncate">{amb.providerName}</h3>
                <span className="px-2 py-0.2 bg-[#F0EDF2] text-[#1B1B1F] text-[10px] font-bold rounded">
                  {amb.type}
                </span>
              </div>
              <p className="text-xs text-[#5B5F6B] mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C41E3A]" />
                <span>{amb.location} {amb.distanceKm > 0 && `• প্রায় ${toBengaliDigits(amb.distanceKm)} কিমি`}</span>
              </p>
              <span className="text-[11px] text-[#00744B] font-semibold mt-1 block">
                {amb.isAvailable247 ? '✓ ২৪/৭ সার্বক্ষণিক সেবা' : 'দিনের বেলা'}
              </span>
            </div>

            <a
              href={`tel:${amb.phone}`}
              className="h-11 px-4 rounded-xl bg-[#C41E3A] hover:bg-[#9E0027] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
            >
              <Phone className="w-4 h-4" />
              <span>কল দিন</span>
            </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
