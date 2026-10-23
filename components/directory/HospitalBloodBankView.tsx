'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Building,
  Search,
  Phone,
  Navigation,
  Clock,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  MapPin
} from 'lucide-react';
import { HospitalBloodBank, BloodGroup } from '@/lib/types';
import { toBengaliDigits } from '@/lib/bengali-utils';

interface HospitalBloodBankViewProps {
  hospitals: HospitalBloodBank[];
  onBack: () => void;
  onRequestBlood: () => void;
  initialBloodGroup?: BloodGroup | null;
}

export const HospitalBloodBankView: React.FC<HospitalBloodBankViewProps> = ({
  hospitals,
  onBack,
  onRequestBlood,
  initialBloodGroup = null,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'hospital' | 'blood_bank'>('all');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<BloodGroup | 'all'>(
    initialBloodGroup || 'all'
  );

  const groups: BloodGroup[] = ['O+', 'B+', 'A+', 'AB+', 'O-', 'B-', 'A-', 'AB-'];

  const filtered = hospitals.filter((h) => {
    const matchSearch =
      (h.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === 'all' || h.type === typeFilter;
    const matchBloodGroup =
      selectedGroupFilter === 'all' ||
      (h.stocks?.[selectedGroupFilter]?.status && h.stocks[selectedGroupFilter].status !== 'empty');
    return matchSearch && matchType && matchBloodGroup;
  });

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
            <h1 className="font-bold text-[18px] text-[#1B1B1F] leading-tight">হাসপাতাল ও ব্লাড ব্যাংক ডিরেক্টরি</h1>
            <span className="text-[11px] text-[#5B5F6B]">লাইভ ব্লাড স্টক ও যোগাযোগ তথ্য</span>
          </div>
        </div>
      </div>

      {/* Search & Type filter */}
      <div className="p-3 bg-white rounded-2xl border border-[#E4E6EB]/50 shadow-xs space-y-2.5 mb-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#5B5F6B] absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="হাসপাতাল বা ব্লাড ব্যাংকের নাম খুঁজুন..."
            className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#F7F7F9] text-sm text-[#1B1B1F] outline-none focus:ring-1 focus:ring-[#C41E3A]"
          />
        </div>

        <div className="flex gap-2">
          {[
            { id: 'all', label: 'সকল প্রতিষ্ঠান' },
            { id: 'hospital', label: 'হাসপাতাল' },
            { id: 'blood_bank', label: 'ব্লাড ব্যাংক' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTypeFilter(item.id as any)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                typeFilter === item.id
                  ? 'bg-[#FDECEF] text-[#C41E3A] ring-1 ring-[#C41E3A]'
                  : 'bg-[#F7F7F9] text-[#5B5F6B] hover:bg-[#F0EDF2]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Blood Group Filter Chips */}
        <div className="pt-2 border-t border-[#E4E6EB]/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-[#5B5F6B] shrink-0 mr-1">রক্তের গ্রুপ:</span>
          <button
            onClick={() => setSelectedGroupFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedGroupFilter === 'all'
                ? 'bg-[#C41E3A] text-white'
                : 'bg-[#F7F7F9] text-[#5B5F6B] hover:bg-[#F0EDF2]'
            }`}
          >
            সব
          </button>
          {groups.map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroupFilter(grp)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedGroupFilter === grp
                  ? 'bg-[#C41E3A] text-white shadow-2xs'
                  : 'bg-[#F7F7F9] text-[#1B1B1F] hover:bg-[#FDECEF] hover:text-[#C41E3A]'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Cards (Responsive 2-column grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.map((item) => (
          <article
            key={item.id}
            className="bg-white rounded-2xl p-4 shadow-xs border border-[#E4E6EB]/60 space-y-3"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-[15px] text-[#1B1B1F] leading-snug">{item.name}</h3>
                <p className="text-xs text-[#5B5F6B] mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C41E3A]" />
                  <span>{item.location} • {toBengaliDigits(item.distanceKm)} কিমি</span>
                </p>
              </div>
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#005938] text-[10px] font-bold">
                {item.timing}
              </span>
            </div>

            {/* Live Stock Grid (8 Groups as specified in Section 15) */}
            <div className="space-y-1.5 pt-1 border-t border-[#E4E6EB]/50">
              <div className="flex justify-between items-center text-[11px] text-[#5B5F6B]">
                <span className="font-bold text-[#1B1B1F]">রক্তের মজুদ (ব্লাড স্টক)</span>
                <span className="text-[10px]">{item.lastUpdated}-এ হালনাগাদ</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {groups.map((grp) => {
                  const stock = item.stocks?.[grp] || { count: 0, status: 'empty' };
                  const isAdequate = stock.status === 'adequate';
                  const isLimited = stock.status === 'limited';
                  const isEmpty = stock.status === 'empty' || (!isAdequate && !isLimited);

                  return (
                    <div
                      key={grp}
                      className={`p-1.5 rounded-xl text-center border ${
                        isAdequate
                          ? 'bg-[#E8F5E9]/50 border-[#A5D6A7]'
                          : isLimited
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-[#FFDAD6]/30 border-[#FFDAD6]'
                      }`}
                    >
                      <span className="font-extrabold text-xs block text-[#1B1B1F]">{grp}</span>
                      <span
                        className={`text-[10px] font-bold block ${
                          isAdequate
                            ? 'text-[#00744B]'
                            : isLimited
                            ? 'text-[#9A5B00]'
                            : 'text-[#BA1A1A]'
                        }`}
                      >
                        {isAdequate
                          ? `${toBengaliDigits(stock.count || 0)} (পর্যাপ্ত)`
                          : isLimited
                          ? `${toBengaliDigits(stock.count || 0)} (সীমিত)`
                          : 'শেষ (নেই)'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#E4E6EB]/40">
              <a
                href={`tel:${item.phone}`}
                className="h-10 rounded-xl bg-[#F0EDF2] hover:bg-[#E4E6EB] text-[#1B1B1F] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-4 h-4 text-[#00744B]" />
                <span>সরাসরি কল ({item.phone})</span>
              </a>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(item.name)}`}
                target="_blank"
                rel="noreferrer"
                className="h-10 rounded-xl bg-[#FDECEF] hover:bg-[#FFDAD9] text-[#C41E3A] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                <span>ম্যাপে রুট দেখুন</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
