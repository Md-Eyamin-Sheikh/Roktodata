'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Building2,
  Droplet,
  Phone,
  ArrowRight,
  X,
  Sparkles,
  Command,
  Heart,
  Truck
} from 'lucide-react';
import { allDistricts } from '@/lib/geo/bangladeshGeoData';
import { initialHospitalsAndBanks } from '@/lib/data';
import { BloodGroup } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDistrict: (district: string) => void;
  onSelectBloodGroup: (group: BloodGroup) => void;
  onOpenHospitalDirectory: () => void;
  onRequestBlood: () => void;
  onOpenAmbulance: () => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectDistrict,
  onSelectBloodGroup,
  onOpenHospitalDirectory,
  onRequestBlood,
  onOpenAmbulance,
}) => {
  const { language, formatDigits } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  // Filter districts
  const matchingDistricts = allDistricts
    .filter(
      (d) =>
        d.nameBn.includes(query) ||
        d.nameEn.toLowerCase().includes(query.toLowerCase()) ||
        d.divisionBn.includes(query) ||
        d.upazilas.some((u) => u.includes(query))
    )
    .slice(0, 5);

  // Filter hospitals
  const matchingHospitals = initialHospitalsAndBanks
    .filter(
      (h) =>
        h.name.toLowerCase().includes(query.toLowerCase()) ||
        h.location.includes(query) ||
        h.type.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 4);

  // Matching blood groups
  const matchingGroups = query.trim()
    ? bloodGroups.filter((g) => g.toLowerCase().includes(query.toLowerCase()))
    : bloodGroups.slice(0, 4);

  const totalResults =
    matchingDistricts.length + matchingHospitals.length + (query ? matchingGroups.length : 0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-14 sm:pt-20 px-3 sm:px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E4E6EB] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-[#E4E6EB]/80 bg-[#FCFBFD]">
          <Search className="w-5 h-5 text-[#C41E3A] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'জেলা, হাসপাতাল, রক্তের গ্রুপ বা জরুরি সেবা খুঁজুন...'
                : 'Search 64 districts, hospitals, blood groups, or services...'
            }
            className="w-full bg-transparent text-[#1B1B1F] placeholder:text-[#5B5F6B] text-sm sm:text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-[#5B5F6B] hover:text-[#1B1B1F] hover:bg-[#F0EDF2] mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-[#5B5F6B] bg-[#F0EDF2] border border-[#E4E6EB] rounded-md shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[65vh] overflow-y-auto p-3 sm:p-4 space-y-4 no-scrollbar">
          {/* Quick Action Shortcuts when query is empty */}
          {!query && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B5F6B] px-1">
                {language === 'bn' ? 'কুইক অ্যাকশন' : 'Quick Actions'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    onRequestBlood();
                    onClose();
                  }}
                  className="p-3 rounded-2xl bg-[#FDECEF] hover:bg-[#F9D5DB] border border-[#F9D5DB] flex items-center gap-2.5 text-left transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#C41E3A] text-white flex items-center justify-center shrink-0">
                    <Droplet className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#9E0027]">
                      {language === 'bn' ? 'জরুরি রক্ত চান' : 'Request Blood'}
                    </h5>
                    <p className="text-[10px] text-[#5B5F6B]">
                      {language === 'bn' ? '৫-ধাপের উইজার্ড' : '5-step wizard'}
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onOpenHospitalDirectory();
                    onClose();
                  }}
                  className="p-3 rounded-2xl bg-[#E8F5E9] hover:bg-[#C8E6C9] border border-[#C8E6C9] flex items-center gap-2.5 text-left transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#00744B] text-white flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#005938]">
                      {language === 'bn' ? 'ব্লাড ব্যাংক স্টক' : 'Blood Bank Stock'}
                    </h5>
                    <p className="text-[10px] text-[#5B5F6B]">
                      {language === 'bn' ? 'হাসপাতাল তালিকা' : 'Hospitals'}
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onOpenAmbulance();
                    onClose();
                  }}
                  className="p-3 rounded-2xl bg-[#FFF8E1] hover:bg-[#FFECB3] border border-[#FFECB3] flex items-center gap-2.5 text-left transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#E89A00] text-white flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#9A5B00]">
                      {language === 'bn' ? '২৪/৭ অ্যাম্বুলেন্স' : '24/7 Ambulance'}
                    </h5>
                    <p className="text-[10px] text-[#5B5F6B]">
                      {language === 'bn' ? 'হটলাইন ডিরেক্টরি' : 'Hotlines'}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Blood Group Quick Select */}
          {matchingGroups.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B5F6B] px-1">
                {language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Groups'}
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {matchingGroups.map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      onSelectBloodGroup(g);
                      onClose();
                    }}
                    className="h-11 rounded-2xl bg-white hover:bg-[#FDECEF] border border-[#E4E6EB] hover:border-[#C41E3A] flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-2xs group"
                  >
                    <span className="font-extrabold text-sm text-[#C41E3A] group-hover:scale-110 transition-transform">
                      {g}
                    </span>
                    <span className="text-[9px] text-[#5B5F6B]">
                      {language === 'bn' ? 'ফিল্টার' : 'Filter'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Districts Search Results */}
          {matchingDistricts.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B5F6B] px-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C41E3A]" />
                <span>{language === 'bn' ? 'জেলা সমূহ' : 'Districts'}</span>
              </span>
              <div className="space-y-1">
                {matchingDistricts.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      onSelectDistrict(`${d.nameBn} সদর`);
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-[#F7F7F9] flex items-center justify-between text-left transition-colors cursor-pointer border border-transparent hover:border-[#E4E6EB]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center text-xs font-bold shrink-0">
                        {d.nameBn.slice(0, 1)}
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-xs sm:text-sm text-[#1B1B1F]">
                          {d.nameBn} ({d.nameEn})
                        </span>
                        <span className="text-[11px] text-[#5B5F6B] block">
                          {d.divisionBn} বিভাগ • {formatDigits(d.upazilas.length)}{' '}
                          {language === 'bn' ? 'টি উপজেলা' : 'Upazilas'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-[#C41E3A] font-semibold shrink-0">
                      {language === 'bn' ? 'নির্বাচন করুন' : 'Select'} →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hospital Search Results */}
          {matchingHospitals.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B5F6B] px-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#0D58C9]" />
                <span>{language === 'bn' ? 'হাসপাতাল ও ব্লাড ব্যাংক' : 'Hospitals & Blood Banks'}</span>
              </span>
              <div className="space-y-1">
                {matchingHospitals.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      onOpenHospitalDirectory();
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-[#F7F7F9] flex items-center justify-between text-left transition-colors cursor-pointer border border-transparent hover:border-[#E4E6EB]"
                  >
                    <div className="truncate">
                      <span className="font-bold text-xs sm:text-sm text-[#1B1B1F] block truncate">
                        {h.name}
                      </span>
                      <span className="text-xs text-[#5B5F6B] block">
                        {h.location} • সময়: {h.timing} • হেল্পলাইন: {h.phone}
                      </span>
                    </div>
                    <span className="text-xs text-[#0D58C9] font-semibold shrink-0">
                      {language === 'bn' ? 'দেখুন' : 'View'} →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {query && totalResults === 0 && (
            <div className="text-center py-8 text-[#5B5F6B]">
              <p className="text-sm">
                {language === 'bn'
                  ? `"${query}" এর জন্য কোনো ফলাফল পাওয়া যায়নি।`
                  : `No results found for "${query}".`}
              </p>
              <p className="text-xs mt-1">
                {language === 'bn'
                  ? 'সঠিক বানান লিখুন অথবা ৬৪ জেলার যেকোনো একটির নাম খুঁজুন।'
                  : 'Try typing a district name or blood group like A+, B+.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2.5 bg-[#F7F7F9] border-t border-[#E4E6EB]/80 flex items-center justify-between text-[11px] text-[#5B5F6B]">
          <span>
            {language === 'bn'
              ? 'টিপ: কীবোর্ডে / বা Ctrl+K চাপলে যেকোনো সময় সার্চ খোলা যাবে'
              : 'Tip: Press / or Ctrl+K anytime to launch quick search'}
          </span>
          <span className="font-semibold text-[#1B1B1F]">
            {language === 'bn' ? '৬৪ জেলা ডাটাবেজ' : '64 Districts DB'}
          </span>
        </div>
      </div>
    </div>
  );
};
