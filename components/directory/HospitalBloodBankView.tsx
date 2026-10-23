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
  MapPin,
  ShieldCheck,
  SlidersHorizontal,
  ChevronRight,
  Settings
} from 'lucide-react';
import { HospitalBloodBank, BloodGroup } from '@/lib/types';
import { toBengaliDigits } from '@/lib/bengali-utils';
import { allDistricts } from '@/lib/geo/bangladeshGeoData';

interface HospitalBloodBankViewProps {
  hospitals: HospitalBloodBank[];
  onBack: () => void;
  onRequestBlood: () => void;
  initialBloodGroup?: BloodGroup | null;
  onOpenHospitalDashboard?: () => void;
  userRole?: string;
  currentDistrict?: string;
}

export const HospitalBloodBankView: React.FC<HospitalBloodBankViewProps> = ({
  hospitals,
  onBack,
  onRequestBlood,
  initialBloodGroup = null,
  onOpenHospitalDashboard,
  userRole = 'donor',
  currentDistrict = 'all',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'hospital' | 'blood_bank' | 'medical_college' | 'district_hospital' | 'upazila_health_complex' | 'red_crescent'>('all');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<BloodGroup | 'all'>(
    initialBloodGroup || 'all'
  );

  const isOperatorOrAdmin = userRole === 'hospital_operator' || userRole === 'admin';
  const groups: BloodGroup[] = ['O+', 'B+', 'A+', 'AB+', 'O-', 'B-', 'A-', 'AB-'];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'medical_college':
        return 'মেডিকেল কলেজ হাসপাতাল';
      case 'district_hospital':
        return 'জেলা সদর হাসপাতাল';
      case 'upazila_health_complex':
        return 'উপজেলা স্বাস্থ্য কমপ্লেক্স';
      case 'red_crescent':
      case 'blood_bank':
        return 'রেড ক্রিসেন্ট / ব্লাড ব্যাংক';
      case 'private_clinic':
        return 'বেসরকারি হাসপাতাল ও ব্লাড ব্যাংক';
      default:
        return 'হাসপাতাল';
    }
  };

  const filtered = hospitals.filter((h) => {
    // 1. Search Query
    const matchSearch =
      !searchQuery ||
      (h.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.district || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.phone || '').includes(searchQuery);

    // 2. District Filter
    const matchDistrict =
      selectedDistrict === 'all' ||
      (h.district && h.district.includes(selectedDistrict)) ||
      (h.location && h.location.includes(selectedDistrict));

    // 3. Type Filter
    let matchType = true;
    if (typeFilter === 'hospital') {
      matchType = h.type !== 'blood_bank' && h.type !== 'red_crescent';
    } else if (typeFilter === 'blood_bank') {
      matchType = h.type === 'blood_bank' || h.type === 'red_crescent';
    } else if (typeFilter !== 'all') {
      matchType = h.type === typeFilter;
    }

    // 4. Blood Group Filter
    const matchBloodGroup =
      selectedGroupFilter === 'all' ||
      (h.stocks?.[selectedGroupFilter]?.status && h.stocks[selectedGroupFilter].status !== 'empty');

    return matchSearch && matchDistrict && matchType && matchBloodGroup;
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
            <span className="text-[11px] text-[#5B5F6B]">
              {toBengaliDigits(filtered.length)}টি প্রতিষ্ঠান পাওয়া গেছে
            </span>
          </div>
        </div>

        {/* Operator Dashboard Button (If user is authorized or wants to manage stock) */}
        {onOpenHospitalDashboard && (
          <button
            onClick={onOpenHospitalDashboard}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isOperatorOrAdmin
                ? 'bg-[#C41E3A] hover:bg-[#9E0027] text-white shadow-xs'
                : 'bg-[#F0EDF2] hover:bg-[#E4E6EB] text-[#1B1B1F]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{isOperatorOrAdmin ? 'স্টক ম্যানেজমেন্ট' : 'অপারেটর কনসোল'}</span>
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="p-3 bg-white rounded-2xl border border-[#E4E6EB]/50 shadow-xs space-y-2.5 mb-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#5B5F6B] absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="হাসপাতাল, ব্লাড ব্যাংক বা জেলার নাম লিখুন..."
            className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#F7F7F9] text-sm text-[#1B1B1F] outline-none focus:ring-1 focus:ring-[#C41E3A]"
          />
        </div>

        {/* District and Facility Type Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label htmlFor="district-select" className="text-[11px] font-bold text-[#5B5F6B] mb-1 block">জেলা অনুযায়ী ফিল্টার:</label>
            <select
              id="district-select"
              aria-label="জেলা অনুযায়ী ফিল্টার"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[#F7F7F9] text-xs font-bold text-[#1B1B1F] border border-[#E4E6EB] outline-none focus:ring-1 focus:ring-[#C41E3A]"
            >
              <option value="all">সমগ্র বাংলাদেশ (সকল জেলা)</option>
              {allDistricts.map((d) => (
                <option key={d.id} value={d.nameBn}>
                  {d.nameBn} ({d.divisionBn})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="type-select" className="text-[11px] font-bold text-[#5B5F6B] mb-1 block">প্রতিষ্ঠানের ধরন:</label>
            <select
              id="type-select"
              aria-label="প্রতিষ্ঠানের ধরন"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl bg-[#F7F7F9] text-xs font-bold text-[#1B1B1F] border border-[#E4E6EB] outline-none focus:ring-1 focus:ring-[#C41E3A]"
            >
              <option value="all">সকল স্বাস্থ্য প্রতিষ্ঠান</option>
              <option value="medical_college">সরকারি মেডিকেল কলেজ হাসপাতাল</option>
              <option value="district_hospital">২৫০ শয্যা জেলা সদর হাসপাতাল</option>
              <option value="upazila_health_complex">উপজেলা স্বাস্থ্য কমপ্লেক্স</option>
              <option value="red_crescent">রেড ক্রিসেন্ট ও অনুমোদিত ব্লাড ব্যাংক</option>
              <option value="private_clinic">বেসরকারি হাসপাতাল ও ক্লিনিক</option>
            </select>
          </div>
        </div>

        {/* Blood Group Filter Chips */}
        <div className="pt-2 border-t border-[#E4E6EB]/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-[#5B5F6B] shrink-0 mr-1">মজুদ গ্রুপ:</span>
          <button
            onClick={() => setSelectedGroupFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedGroupFilter === 'all'
                ? 'bg-[#C41E3A] text-white shadow-xs'
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
      {filtered.length === 0 ? (
        <div className="p-8 bg-white rounded-3xl text-center border border-[#E4E6EB] space-y-3">
          <Building className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-bold text-base text-[#1B1B1F]">কোনো হাসপাতাল বা ব্লাড ব্যাংক পাওয়া যায়নি</h3>
          <p className="text-xs text-[#5B5F6B]">
            অনুসন্ধানের ফিল্টার বা জেলা পরিবর্তন করে আবার চেষ্টা করুন।
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDistrict('all');
              setTypeFilter('all');
              setSelectedGroupFilter('all');
            }}
            className="px-4 py-2 bg-[#F0EDF2] hover:bg-[#E4E6EB] rounded-xl text-xs font-bold text-[#1B1B1F]"
          >
            ফিল্টার রিসেট করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-2xl p-4 shadow-xs border border-[#E4E6EB]/60 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="px-2 py-0.5 rounded bg-[#F0EDF2] text-[#5B5F6B] text-[10px] font-bold">
                      {getTypeLabel(item.type)}
                    </span>
                    <h3 className="font-bold text-[15px] text-[#1B1B1F] leading-snug">{item.name}</h3>
                    <p className="text-xs text-[#5B5F6B] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C41E3A] shrink-0" />
                      <span>{item.location}</span>
                    </p>
                  </div>

                  <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#005938] text-[10px] font-bold">
                    {item.timing || '২৪/৭ খোলা'}
                  </span>
                </div>

                {/* Live Stock Grid (8 Groups as specified in Section 15) */}
                <div className="space-y-1.5 pt-2 border-t border-[#E4E6EB]/50">
                  <div className="flex justify-between items-center text-[11px] text-[#5B5F6B]">
                    <span className="font-bold text-[#1B1B1F]">রক্তের মজুদ (ব্লাড স্টক)</span>
                    <span className="text-[10px]">{item.lastUpdated || 'হালনাগাদ'}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {groups.map((grp) => {
                      const stock = item.stocks?.[grp] || { count: 0, status: 'empty' };
                      const count = stock.count || 0;
                      const isAdequate = count >= 5;
                      const isLimited = count >= 2 && count < 5;
                      const isEmpty = count < 2;

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
                              ? `${toBengaliDigits(count)} ব্যাগ`
                              : isLimited
                              ? `${toBengaliDigits(count)} ব্যাগ`
                              : count > 0
                              ? `${toBengaliDigits(count)} ব্যাগ (স্বল্প)`
                              : 'শূন্য (নেই)'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Phone Call & Google Maps Navigation */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E4E6EB]/50 mt-auto">
                <a
                  href={`tel:${item.phone}`}
                  className="h-10 rounded-xl bg-[#F0EDF2] hover:bg-[#E4E6EB] active:scale-95 text-[#1B1B1F] text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Phone className="w-4 h-4 text-[#00744B]" />
                  <span>কল দিন ({item.phone})</span>
                </a>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(item.name + ' ' + (item.district || ''))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="h-10 rounded-xl bg-[#FDECEF] hover:bg-[#FFDAD9] active:scale-95 text-[#C41E3A] text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Navigation className="w-4 h-4" />
                  <span>ম্যাপে রুট দেখুন</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
