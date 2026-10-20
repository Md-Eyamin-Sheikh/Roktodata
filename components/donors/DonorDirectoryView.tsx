'use client';

import React, { useState } from 'react';
import {
  Search,
  Mic,
  List,
  Map as MapIcon,
  SlidersHorizontal,
  Check,
  MapPin,
  Clock,
  Phone,
  Heart,
  ShieldCheck,
  Send,
  Droplet,
  UserCheck,
  X,
  RotateCcw
} from 'lucide-react';
import { BloodGroup, Donor } from '@/lib/types';
import { toBengaliDigits } from '@/lib/bengali-utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface DonorDirectoryViewProps {
  donors: Donor[];
  onRequestBloodClick: () => void;
  onSendDirectRequest: (donor: Donor) => void;
}

export const DonorDirectoryView: React.FC<DonorDirectoryViewProps> = ({
  donors: initialDonorsList,
  onRequestBloodClick,
  onSendDirectRequest,
}) => {
  const { language, t, formatDigits } = useLanguage();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | 'all'>('B+');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number>(25);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [selectedMapDonor, setSelectedMapDonor] = useState<Donor | null>(null);

  // Toggle favorite / "আমার ডোনার" (Section 11)
  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const donorsList = initialDonorsList.map((d) => ({
    ...d,
    isBookmarked: bookmarkedIds.includes(d.id) || d.isBookmarked,
  }));

  // Filtered donors
  const filteredDonors = donorsList.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGroup = selectedGroup === 'all' || d.bloodGroup === selectedGroup;
    const matchAvailable = !availableOnly || d.isAvailableToday;
    const matchVerified = !verifiedOnly || d.isVerified;
    const matchDist = d.distanceKm <= maxDistance;
    const matchTab = activeTab === 'all' || d.isBookmarked;
    return matchSearch && matchGroup && matchAvailable && matchVerified && matchDist && matchTab;
  });

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto pb-24">
      {/* Search & View Toggle Section */}
      <div className="px-4 pt-3 pb-2 flex flex-col gap-2.5 bg-white border-b border-[#E4E6EB]/50 sticky top-14 md:top-16 z-20">
        {/* Search Bar */}
        <div className="relative w-full flex items-center">
          <Search className="w-5 h-5 text-[#5B5F6B] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.donors.searchPlaceholder}
            className="w-full h-12 pl-11 pr-11 bg-[#F7F7F9] text-[#1B1B1F] placeholder:text-[#5B5F6B] rounded-2xl text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#C41E3A] transition-all"
          />
          <button
            onClick={() => {}}
            aria-label={language === 'bn' ? 'ভয়েস সার্চ' : 'Voice Search'}
            className="absolute right-2.5 w-8 h-8 flex items-center justify-center text-[#5B5F6B] hover:text-[#C41E3A] rounded-full active:scale-95"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {/* View Switcher, My Donors Tab & Filter Trigger */}
        <div className="flex items-center justify-between gap-2">
          {/* List vs Map Switcher */}
          <div className="flex items-center p-1 bg-[#F0EDF2] rounded-full h-10 w-36">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 h-8 rounded-full text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-[#C41E3A] shadow-xs'
                  : 'text-[#5B5F6B] hover:text-[#1B1B1F]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{t.donors.tabList}</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex-1 h-8 rounded-full text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-[#C41E3A] shadow-xs'
                  : 'text-[#5B5F6B] hover:text-[#1B1B1F]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{t.donors.tabMap}</span>
            </button>
          </div>

          {/* "আমার ডোনার" (Saved) tab toggle */}
          <button
            onClick={() => setActiveTab(activeTab === 'all' ? 'saved' : 'all')}
            className={`h-10 px-3 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
              activeTab === 'saved'
                ? 'bg-[#FDECEF] text-[#C41E3A] ring-1 ring-[#C41E3A]'
                : 'bg-[#F7F7F9] text-[#5B5F6B] hover:bg-[#F0EDF2]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${activeTab === 'saved' ? 'fill-current' : ''}`} />
            <span>{t.donors.tabMyDonors}</span>
          </button>

          {/* Filter Modal Trigger */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="h-10 px-3 bg-[#F7F7F9] hover:bg-[#F0EDF2] text-[#1B1B1F] rounded-full flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#C41E3A]" />
            <span className="text-xs font-bold">{t.donors.filterBtn}</span>
          </button>
        </div>
      </div>

      {/* Quick Filter Chips (Horizontal Scroll) */}
      <div className="w-full overflow-x-auto py-2.5 px-4 bg-white border-b border-[#E4E6EB]/50 flex items-center gap-2 no-scrollbar">
        {(['B+', 'A+', 'O+', 'AB+'] as BloodGroup[]).map((grp) => {
          const isSelected = selectedGroup === grp;
          return (
            <button
              key={grp}
              onClick={() => setSelectedGroup(isSelected ? 'all' : grp)}
              className={`shrink-0 h-8.5 px-3 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
                isSelected
                  ? 'bg-[#FDECEF] text-[#C41E3A] ring-1 ring-[#C41E3A] shadow-xs'
                  : 'bg-[#F7F7F9] text-[#1B1B1F] hover:bg-[#F0EDF2]'
              }`}
            >
              <span>{grp}</span>
              {isSelected && <Check className="w-3.5 h-3.5" />}
            </button>
          );
        })}

        <button
          onClick={() => setAvailableOnly((a) => !a)}
          className={`shrink-0 h-8.5 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
            availableOnly
              ? 'bg-[#E8F5E9] text-[#005938] ring-1 ring-[#00744B]'
              : 'bg-[#F7F7F9] text-[#5B5F6B] hover:bg-[#F0EDF2]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#00744B] animate-pulse" />
          <span>{t.donors.availableTodayOnly}</span>
        </button>

        <button
          onClick={() => setVerifiedOnly((v) => !v)}
          className={`shrink-0 h-8.5 px-3 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
            verifiedOnly
              ? 'bg-[#D9E2FF] text-[#001946] ring-1 ring-[#0D58C9]'
              : 'bg-[#F7F7F9] text-[#5B5F6B] hover:bg-[#F0EDF2]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-[#0D58C9]" />
          <span>{t.donors.verifiedOnly}</span>
        </button>
      </div>

      {/* ================= INTERACTIVE DONOR ANALYTICS & GROUP DISTRIBUTION CHART ================= */}
      <div className="mx-3 sm:mx-4 my-2.5 p-3.5 bg-white rounded-2xl border border-[#E4E6EB]/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center font-bold">
              <Droplet className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#1B1B1F] leading-tight">
                {t.donors.chartTitle}
              </h4>
              <p className="text-[10px] text-[#5B5F6B]">
                {t.donors.chartSub}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold">
            <span className="text-[#0B7A50] bg-[#E8F5E9] px-2 py-0.5 rounded-md">
              {formatDigits(donorsList.filter((d) => d.isAvailableToday).length)} {language === 'bn' ? 'জন প্রস্তুত' : 'Ready'}
            </span>
            <span className="text-[#5B5F6B] bg-[#F0EDF2] px-2 py-0.5 rounded-md">
              {formatDigits(donorsList.filter((d) => !d.isAvailableToday).length)} {language === 'bn' ? 'জন বিশ্রামে' : 'Resting'}
            </span>
          </div>
        </div>

        {/* Interactive Group Distribution Bar Chart */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-1">
          {(['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'] as BloodGroup[]).map((grp) => {
            const count = donorsList.filter((d) => d.bloodGroup === grp).length;
            const availableCount = donorsList.filter((d) => d.bloodGroup === grp && d.isAvailableToday).length;
            const isSelected = selectedGroup === grp;
            const heightPercent = Math.min(100, Math.max(25, count * 15));

            return (
              <button
                key={grp}
                onClick={() => setSelectedGroup(selectedGroup === grp ? 'all' : grp)}
                className={`flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FDECEF] border-[#C41E3A] ring-1 ring-[#C41E3A] shadow-xs scale-102'
                    : 'bg-[#FAF9FB] border-[#E4E6EB]/70 hover:bg-white'
                }`}
              >
                <div className="w-full flex flex-col items-center justify-end h-14 pb-1">
                  <span className="text-[10px] font-black text-[#1B1B1F] mb-0.5">
                    {toBengaliDigits(count)}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[18px] rounded-t-md transition-all ${
                      isSelected
                        ? 'bg-[#C41E3A]'
                        : count > 0
                        ? 'bg-gradient-to-t from-[#5B5F6B] to-[#8C8F9A]'
                        : 'bg-[#E4E6EB]'
                    }`}
                  />
                </div>
                <span className="text-[11px] font-extrabold text-[#1B1B1F] mt-1">{grp}</span>
                <span className="text-[9px] text-[#0B7A50] font-semibold">
                  {formatDigits(availableCount)} {language === 'bn' ? 'সক্রিয়' : 'active'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Summary Bar */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-[#5B5F6B]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C41E3A]" />
          <span>
            {language === 'bn' ? (
              <>
                বগুড়া সদরে{' '}
                <strong className="text-[#1B1B1F] font-bold">
                  {formatDigits(filteredDonors.length)} জন
                </strong>{' '}
                রক্তদাতা
              </>
            ) : (
              <>
                In Bogura Sadar,{' '}
                <strong className="text-[#1B1B1F] font-bold">
                  {filteredDonors.length} donors
                </strong>{' '}
                found
              </>
            )}
          </span>
        </div>
        {selectedGroup !== 'all' && (
          <button
            onClick={() => setSelectedGroup('all')}
            className="text-[11px] text-[#C41E3A] font-bold hover:underline cursor-pointer"
          >
            {t.donors.viewAllGroups}
          </button>
        )}
      </div>

      {/* ================= EMPTY STATE (Section 11 requirement) ================= */}
      {filteredDonors.length === 0 && (
        <div className="p-8 text-center space-y-3 bg-white rounded-2xl m-4 border border-[#E4E6EB]">
          <div className="w-16 h-16 rounded-full bg-[#F0EDF2] flex items-center justify-center text-[#5B5F6B] mx-auto">
            <Droplet className="w-8 h-8 text-[#C41E3A]" />
          </div>
          <h4 className="font-bold text-sm text-[#1B1B1F]">
            {t.donors.noDonorsFound}
          </h4>
          <p className="text-xs text-[#5B5F6B] max-w-xs mx-auto leading-relaxed">
            {t.donors.noDonorsSub}
          </p>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                setMaxDistance(25);
                setSelectedGroup('all');
                setAvailableOnly(false);
              }}
              className="flex-1 h-11 rounded-xl bg-[#F0EDF2] text-[#1B1B1F] text-xs font-bold cursor-pointer"
            >
              {language === 'bn' ? 'দূরত্ব বাড়ান (২৫ কিমি)' : 'Expand Radius (25 km)'}
            </button>
            <button
              onClick={onRequestBloodClick}
              className="flex-1 h-11 rounded-xl bg-[#C41E3A] text-white text-xs font-bold cursor-pointer"
            >
              {language === 'bn' ? 'অনুরোধ তৈরি করুন' : 'Create Request'}
            </button>
          </div>
        </div>
      )}

      {/* ================= VIEW MODE: MAP VIEW SIMULATION ================= */}
      {viewMode === 'map' && filteredDonors.length > 0 && (
        <div className="px-4 py-2">
          <div className="w-full h-80 rounded-2xl bg-[#E2E6EE] relative overflow-hidden shadow-xs border border-[#E4E6EB]">
            {/* Map Roads & Rivers Pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,60 Q120,40 240,110 T400,160" stroke="#FFFFFF" strokeWidth="8" fill="none" />
              <path d="M50,0 Q80,150 140,240 T220,340" stroke="#FFFFFF" strokeWidth="12" fill="none" />
              <path d="M180,0 Q190,120 300,200 T400,280" stroke="#60A5FA" strokeWidth="10" fill="none" />
              <circle cx="150" cy="140" r="45" fill="#FFFFFF" opacity="0.6" />
            </svg>

            {/* Hospital Landmarks */}
            <div className="absolute top-12 left-10 flex flex-col items-center">
              <div className="px-2 py-0.5 rounded-md bg-[#C41E3A] text-white text-[10px] font-bold shadow-xs">
                শজিমেক হাসপাতাল
              </div>
              <div className="w-2 h-2 bg-[#C41E3A] rotate-45 -mt-1" />
            </div>

            {/* Donor Pins */}
            {filteredDonors.map((donor, idx) => {
              const positions = [
                { top: '35%', left: '42%' },
                { top: '55%', left: '28%' },
                { top: '25%', left: '68%' },
                { top: '65%', left: '60%' },
                { top: '75%', left: '38%' },
                { top: '40%', left: '75%' },
              ];
              const pos = positions[idx % positions.length];
              const isSelected = selectedMapDonor?.id === donor.id;

              return (
                <button
                  key={donor.id}
                  onClick={() => setSelectedMapDonor(donor)}
                  style={{ top: pos.top, left: pos.left }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform active:scale-95 ${
                    isSelected ? 'scale-125 z-30' : 'z-10'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-8 px-2 rounded-full flex items-center gap-1 font-bold text-xs shadow-md border-2 ${
                        isSelected
                          ? 'bg-[#C41E3A] text-white border-white'
                          : 'bg-white text-[#C41E3A] border-[#C41E3A]'
                      }`}
                    >
                      <Droplet className="w-3 h-3 fill-current" />
                      <span>{donor.bloodGroup}</span>
                    </div>
                    <div className="w-2 h-2 bg-current rotate-45 -mt-1" />
                  </div>
                </button>
              );
            })}

            {/* Floating Donor Preview Popup */}
            {selectedMapDonor && (
              <div className="absolute bottom-3 inset-x-3 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-[#E4E6EB] animate-in slide-in-from-bottom duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#FDECEF] text-[#C41E3A] font-bold text-base flex items-center justify-center">
                      {selectedMapDonor.bloodGroup}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1B1B1F]">
                        {selectedMapDonor.name}
                      </h4>
                      <p className="text-xs text-[#5B5F6B]">
                        {selectedMapDonor.location} • {formatDigits(selectedMapDonor.distanceKm)} {language === 'bn' ? 'কিমি দূরে' : 'km away'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onSendDirectRequest(selectedMapDonor)}
                    className="h-9 px-3 bg-[#C41E3A] text-white rounded-xl text-xs font-bold"
                  >
                    {language === 'bn' ? 'অনুরোধ পাঠান' : 'Send Request'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= VIEW MODE: LIST FEED ================= */}
      {viewMode === 'list' && filteredDonors.length > 0 && (
        <div className="px-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredDonors.map((donor, idx) => (
            <React.Fragment key={donor.id}>
              {/* Insert Safe Harbor Privacy card after 2nd donor */}
              {idx === 2 && (
                <div className="md:col-span-2 p-4 rounded-2xl bg-[#D9E2FF]/30 border border-[#D9E2FF] text-[#1B1B1F] flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-[#0D58C9] shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-[#0D58C9]">
                      {language === 'bn' ? 'নিরাপদ ও নির্ভরযোগ্য প্ল্যাটফর্ম' : 'Safe & Trusted Platform'}
                    </span>
                    <p className="text-xs text-[#5B5F6B] leading-relaxed">
                      {language === 'bn'
                        ? 'ডোনারের গোপনীয়তা রক্ষার্থে নির্দিষ্ট বাসা/বাড়ির ঠিকানা কখনোই প্রকাশ করা হয় না। শুধুমাত্র রোগী ও স্বজনদের নিরাপদ যোগাযোগের জন্য এই তথ্য প্রদর্শিত হচ্ছে।'
                        : 'Exact street addresses are never publicly disclosed to protect donor privacy. This information is strictly for verified medical coordination.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Donor Card */}
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E4E6EB]/60 flex flex-col gap-3 transition-all hover:shadow-sm">
                {/* Top Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-13 h-13 rounded-2xl bg-[#FDECEF] flex items-center justify-center text-[#9E0027] text-lg font-bold shadow-xs">
                        {donor.avatarText}
                      </div>
                      {donor.isAvailableToday && (
                        <span
                          className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#00744B] ring-2 ring-white"
                          title={t.donors.availableTodayOnly}
                        />
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h2 className="font-bold text-[15px] text-[#1B1B1F] truncate">
                          {donor.name}
                        </h2>
                        {donor.isVerified && (
                          <span className="w-4 h-4 rounded-full bg-[#0D58C9] text-white flex items-center justify-center text-[10px]">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#5B5F6B] mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C41E3A]" />
                        <span className="truncate">
                          {language === 'bn' ? 'প্রায়' : 'Approx.'} {formatDigits(donor.distanceKm)} {language === 'bn' ? 'কিমি' : 'km'} • {donor.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Blood Group Badge */}
                  <div className="shrink-0 w-13 h-13 rounded-2xl bg-[#FDECEF] flex flex-col items-center justify-center shadow-xs">
                    <span className="text-[20px] text-[#C41E3A] font-extrabold leading-none">
                      {donor.bloodGroup}
                    </span>
                    <span className="text-[9px] text-[#9E0027] font-bold uppercase mt-0.5">
                      {language === 'bn' ? 'রক্তগ্রুপ' : 'GROUP'}
                    </span>
                  </div>
                </div>

                {/* Status Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {donor.isAvailableToday && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#005938] text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00744B]" />
                      <span>{t.donors.availableTodayOnly}</span>
                    </div>
                  )}
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F7F7F9] text-[#5B5F6B] text-xs font-medium">
                    <Clock className="w-3 h-3" />
                    <span>
                      {language === 'bn' ? 'শেষ রক্তদান:' : 'Last donation:'} {donor.lastDonationDate}
                    </span>
                  </div>
                  {donor.totalDonations > 0 && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F7F7F9] text-[#5B5F6B] text-xs font-semibold">
                      <Droplet className="w-3 h-3 text-[#C41E3A]" />
                      <span>
                        {formatDigits(donor.totalDonations)} {language === 'bn' ? 'বার রক্তদান' : 'donations'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Response Speed Highlight */}
                <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-xl bg-[#F7F7F9] text-[#5B5F6B] text-xs">
                  <span className="text-[#C9962B] font-bold">⚡</span>
                  <span className="text-[#1B1B1F] font-medium">{donor.responseTimeMinutes}</span>
                </div>

                {/* Action Bottom Bar */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onSendDirectRequest(donor)}
                    className="flex-1 h-11 bg-[#FDECEF] hover:bg-[#FFDAD9] text-[#C41E3A] active:bg-[#C41E3A] active:text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{t.donors.btnRequestDirect}</span>
                  </button>

                  <a
                    href={`tel:${donor.phone}`}
                    aria-label={language === 'bn' ? 'সরাসরি কল করুন' : 'Call directly'}
                    className="w-11 h-11 rounded-xl bg-[#F7F7F9] hover:bg-[#F0EDF2] text-[#00744B] flex items-center justify-center active:scale-95 transition-all shadow-xs cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => toggleBookmark(donor.id)}
                    aria-label={language === 'bn' ? 'সংরক্ষণ করুন' : 'Bookmark'}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-xs ${
                      donor.isBookmarked
                        ? 'bg-[#FDECEF] text-[#C41E3A]'
                        : 'bg-[#F7F7F9] hover:bg-[#F0EDF2] text-[#5B5F6B]'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${donor.isBookmarked ? 'fill-current text-[#C41E3A]' : ''}`}
                    />
                  </button>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Filter Bottom Sheet (Section 11 requirement) */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-300">
            {/* Sheet Handle */}
            <div className="w-10 h-1.5 bg-[#E4E6EB] rounded-full mx-auto -mt-2 mb-2" />

            <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EB]">
              <h3 className="font-bold text-base text-[#1B1B1F]">
                {language === 'bn' ? 'ডোনার ফিল্টার' : 'Donor Filter'}
              </h3>
              <button
                onClick={() => {
                  setSelectedGroup('all');
                  setAvailableOnly(false);
                  setVerifiedOnly(false);
                  setMaxDistance(25);
                }}
                className="text-xs font-bold text-[#C41E3A] flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'রিসেট' : 'Reset'}</span>
              </button>
            </div>

            {/* Distance Slider (1-25 km) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[#1B1B1F]">
                  {language === 'bn' ? 'দূরত্ব সীমা' : 'Distance Radius'}
                </span>
                <span className="font-extrabold text-[#C41E3A]">
                  {language === 'bn' ? `সর্বোচ্চ ${formatDigits(maxDistance)} কিমি` : `Max ${maxDistance} km`}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full accent-[#C41E3A]"
              />
              <div className="flex justify-between text-[10px] text-[#5B5F6B]">
                <span>{formatDigits(1)} {language === 'bn' ? 'কিমি' : 'km'}</span>
                <span>{formatDigits(10)} {language === 'bn' ? 'কিমি' : 'km'}</span>
                <span>{formatDigits(25)} {language === 'bn' ? 'কিমি' : 'km'}</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2 pt-2 border-t border-[#E4E6EB]/50 text-xs">
              <label className="flex items-center justify-between p-2 rounded-xl bg-[#F7F7F9] cursor-pointer">
                <span className="font-semibold text-[#1B1B1F]">
                  {language === 'bn' ? 'শুধু আজ উপলব্ধ ডোনার' : 'Available today only'}
                </span>
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#C41E3A]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-[#F7F7F9] cursor-pointer">
                <span className="font-semibold text-[#1B1B1F]">
                  {language === 'bn' ? 'শুধু ভেরিফায়েড রক্তদাতা' : 'Verified donors only'}
                </span>
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#C41E3A]"
                />
              </label>
            </div>

            <button
              onClick={() => setIsFilterOpen(false)}
              className="w-full h-12 rounded-2xl bg-[#C41E3A] text-white font-bold text-xs shadow-md cursor-pointer active:scale-[0.98] transition-all"
            >
              {language === 'bn'
                ? `ফলাফল দেখুন (${formatDigits(filteredDonors.length)})`
                : `View Results (${filteredDonors.length})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
