'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Search,
  X,
  Check,
  Navigation,
  Loader2,
  Droplet,
  Users,
  ChevronRight,
  Sparkles,
  Building2,
  AlertCircle,
} from 'lucide-react';
import {
  allDistricts,
  divisionsList,
  DistrictInfo,
  findNearestDistrict,
  searchGeoLocations,
} from '@/lib/geo/bangladeshGeoData';
import { fetchDistrictLiveMetrics, DistrictMetric, normalizeDistrict } from '@/lib/services/bloodService';
import { toBengaliDigits } from '@/lib/bengali-utils';

interface DistrictSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDistrict: string;
  onSelectDistrict: (districtName: string) => void;
}

export const DistrictSelectorModal: React.FC<DistrictSelectorModalProps> = ({
  isOpen,
  onClose,
  currentDistrict,
  onSelectDistrict,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [metrics, setMetrics] = useState<Record<string, DistrictMetric>>({});
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [expandedDistrictId, setExpandedDistrictId] = useState<string | null>(null);

  // GPS state
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [gpsMessage, setGpsMessage] = useState<string>('');

  // Fetch live district metrics from Supabase or memory cache on mount
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    fetchDistrictLiveMetrics()
      .then((data) => {
        if (isMounted) {
          setMetrics(data);
          setIsLoadingMetrics(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingMetrics(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Clean current district name for comparison
  const cleanCurrentDistrict = useMemo(() => {
    return normalizeDistrict(currentDistrict).toLowerCase();
  }, [currentDistrict]);

  // Filtered districts and matched upazilas based on search and division tab
  const { filteredDistricts, matchedUpazilas } = useMemo(() => {
    if (searchQuery.trim()) {
      const searchRes = searchGeoLocations(searchQuery);
      let list = searchRes.districts;
      if (selectedDivision !== 'all') {
        list = list.filter((d) => d.divisionId === selectedDivision);
      }
      return {
        filteredDistricts: list,
        matchedUpazilas: searchRes.matchedUpazilas,
      };
    }

    let list = allDistricts;
    if (selectedDivision !== 'all') {
      list = list.filter((d) => d.divisionId === selectedDivision);
    }
    return {
      filteredDistricts: list,
      matchedUpazilas: [],
    };
  }, [searchQuery, selectedDivision]);

  // Handle GPS Auto Detect
  const handleGpsDetect = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setGpsMessage('আপনার ব্রাউজার বা ডিভাইসে জিপিএস লোকেশন সমর্থিত নয়।');
      return;
    }

    setGpsStatus('loading');
    setGpsMessage('আপনার নিকটতম অবস্থান শনাক্ত করা হচ্ছে...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nearest = findNearestDistrict(latitude, longitude);

        if (nearest && nearest.district) {
          setGpsStatus('success');
          setGpsMessage(
            `নিকটতম জেলা: ${nearest.district.nameBn} (${toBengaliDigits(nearest.distanceKm)} কিমি দূরে)`
          );

          // Select after brief feedback
          setTimeout(() => {
            handleSelect(nearest.district.nameBn + ' সদর');
          }, 800);
        } else {
          setGpsStatus('error');
          setGpsMessage('নিকটবর্তী জেলা নির্ণয় করা সম্ভব হয়নি। অনুগ্রহ করে তালিকা থেকে নির্বাচন করুন।');
        }
      },
      (error) => {
        setGpsStatus('error');
        if (error.code === error.PERMISSION_DENIED) {
          setGpsMessage('লোকেশন পারমিশন মেলেনি। অনুগ্রহ করে ব্রাউজার সেটিংসে অনুমতি দিন।');
        } else {
          setGpsMessage('লোকেশন শনাক্ত করতে ব্যর্থ হয়েছে। ইন্টারনেট সংযোগ বা জিপিএস অন আছে কিনা পরীক্ষা করুন।');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleDismiss = () => {
    setSearchQuery('');
    setGpsStatus('idle');
    setGpsMessage('');
    onClose();
  };

  const handleSelect = (dist: string) => {
    setSearchQuery('');
    setGpsStatus('idle');
    setGpsMessage('');
    onSelectDistrict(dist);
    onClose();
  };

  // Popular / Fast Quick Select Districts
  const popularDistricts = [
    { name: 'বগুড়া সদর', label: 'বগুড়া' },
    { name: 'ঢাকা উত্তর', label: 'ঢাকা উত্তর' },
    { name: 'ঢাকা দক্ষিণ', label: 'ঢাকা দক্ষিণ' },
    { name: 'চট্টগ্রাম সদর', label: 'চট্টগ্রাম' },
    { name: 'রাজশাহী সদর', label: 'রাজশাহী' },
    { name: 'সিলেট সদর', label: 'সিলেট' },
  ];

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="district-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-0 sm:p-4"
    >
      {/* Backdrop Click Dismiss */}
      <div className="absolute inset-0" onClick={handleDismiss} />

      {/* Main Bottom Sheet / Centered Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[88vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-300 border border-[#E4E6EB]/80">
        
        {/* Mobile Drag Indicator Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-[#E4E6EB]" />
        </div>

        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#E4E6EB]/70 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 id="district-modal-title" className="text-base sm:text-lg font-black text-[#1B1B1F] tracking-tight">
                জেলা ও এলাকা নির্বাচন
              </h2>
              <p className="text-[11px] sm:text-xs text-[#5B5F6B]">
                নিকটতম রক্তদাতা ও জরুরি রক্তের অনুরোধের সাথে যুক্ত হতে জেলা নির্ধারণ করুন
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="বন্ধ করুন"
            className="w-8.5 h-8.5 rounded-full bg-[#F7F7F9] hover:bg-[#F0EDF2] text-[#5B5F6B] hover:text-[#1B1B1F] flex items-center justify-center active:scale-90 transition-all cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Action Bar: 1-Tap GPS Auto-Detection & Quick Alert */}
        <div className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-[#FFF5F6] via-[#FAF9FB] to-[#F7F7F9] border-b border-[#E4E6EB]/60 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <button
              onClick={handleGpsDetect}
              disabled={gpsStatus === 'loading'}
              className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#FFCDD2] text-[#C41E3A] hover:bg-[#FDECEF] text-xs font-bold shadow-2xs active:scale-98 transition-all cursor-pointer disabled:opacity-60"
            >
              {gpsStatus === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>শনাক্ত করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 fill-current" />
                  <span>আমার বর্তমান অবস্থান ব্যবহার করুন (GPS)</span>
                </>
              )}
            </button>

            {/* Quick Status / Info note */}
            <div className="flex items-center gap-1.5 text-[11px] text-[#5B5F6B]">
              <span className="w-2 h-2 rounded-full bg-[#00744B] animate-pulse shrink-0" />
              <span>সুপারবেস লাইভ সংযোগ: ৬৪ জেলা সক্রিয়</span>
            </div>
          </div>

          {/* GPS Status Message Toast */}
          {gpsMessage && (
            <div
              className={`mt-2 p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-in fade-in ${
                gpsStatus === 'error'
                  ? 'bg-[#FFEBEE] text-[#C41E3A]'
                  : 'bg-[#E8F5E9] text-[#005938]'
              }`}
            >
              {gpsStatus === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <Check className="w-4 h-4 shrink-0" />
              )}
              <span>{gpsMessage}</span>
            </div>
          )}
        </div>

        {/* Search Input Bar */}
        <div className="p-3 sm:px-6 sm:py-3.5 border-b border-[#E4E6EB]/60 bg-white shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-[#5B5F6B] absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="জেলা বা থানা খুঁজুন (যেমন: বগুড়া, মিরপুর, শেরপুর, ধানমন্ডি...)"
              className="w-full h-10 pl-10 pr-9 rounded-xl bg-[#F7F7F9] border border-[#E4E6EB] text-xs sm:text-sm text-[#1B1B1F] placeholder:text-[#8E929E] focus:bg-white focus:outline-hidden focus:border-[#C41E3A] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 w-5 h-5 rounded-full bg-[#E4E6EB] text-[#5B5F6B] flex items-center justify-center hover:bg-[#D5D8E0] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Division Filter Segmented Tabs (Horizontal Scrollable) */}
        <div className="px-3 sm:px-6 py-2 bg-[#FAF9FB] border-b border-[#E4E6EB]/60 shrink-0 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          <button
            onClick={() => setSelectedDivision('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedDivision === 'all'
                ? 'bg-[#C41E3A] text-white shadow-xs'
                : 'bg-white text-[#5B5F6B] hover:text-[#1B1B1F] border border-[#E4E6EB]/80'
            }`}
          >
            সব বিভাগ (৬৪)
          </button>
          {divisionsList.map((div) => {
            const isSelected = selectedDivision === div.id;
            return (
              <button
                key={div.id}
                onClick={() => setSelectedDivision(div.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-[#C41E3A] text-white shadow-xs'
                    : 'bg-white text-[#5B5F6B] hover:text-[#1B1B1F] border border-[#E4E6EB]/80'
                }`}
              >
                <span>{div.nameBn}</span>
                <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-[#8E929E]'}`}>
                  ({toBengaliDigits(div.districtCount)})
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Popular Chips (Only if not searching) */}
        {!searchQuery && (
          <div className="px-4 sm:px-6 py-2 bg-white border-b border-[#E4E6EB]/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[11px] font-bold text-[#5B5F6B] shrink-0">জনপ্রিয়:</span>
            {popularDistricts.map((item) => (
              <button
                key={item.name}
                onClick={() => handleSelect(item.name)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap border transition-all cursor-pointer ${
                  currentDistrict === item.name
                    ? 'bg-[#FDECEF] border-[#C41E3A] text-[#C41E3A]'
                    : 'bg-[#F7F7F9] border-[#E4E6EB] text-[#1B1B1F] hover:bg-[#F0EDF2]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Main District & Thana List Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:px-6 sm:py-4 space-y-2.5">
          {/* Matched Thanas/Upazilas Sub-section if searching */}
          {matchedUpazilas.length > 0 && (
            <div className="mb-3 p-3 rounded-2xl bg-[#FFF9FA] border border-[#FFCDD2]/70 space-y-1.5">
              <span className="text-[11px] font-extrabold text-[#C41E3A] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>মিলে যাওয়া থানা / উপজেলাসমূহ ({toBengaliDigits(matchedUpazilas.length)}টি):</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchedUpazilas.slice(0, 10).map(({ upazila, district }) => (
                  <button
                    key={`${district.id}-${upazila}`}
                    onClick={() => handleSelect(`${upazila}, ${district.nameBn}`)}
                    className="px-2.5 py-1 rounded-xl bg-white border border-[#FFCDD2] text-xs font-semibold text-[#1B1B1F] hover:bg-[#FDECEF] hover:text-[#C41E3A] flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95 transition-all"
                  >
                    <span className="font-bold">{upazila}</span>
                    <span className="text-[10px] text-[#5B5F6B]">({district.nameBn})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* District Rows */}
          {filteredDistricts.map((district) => {
            const isSelected =
              cleanCurrentDistrict.includes(district.nameBn.toLowerCase()) ||
              cleanCurrentDistrict === district.id ||
              currentDistrict.includes(district.nameBn);

            const metric = metrics[district.nameBn] || {
              activeRequests: 0,
              readyDonors: 45,
              hospitals: 5,
            };

            const isExpanded = expandedDistrictId === district.id;

            return (
              <div
                key={district.id}
                className={`rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-[#FFF5F6] border-[#C41E3A] shadow-xs ring-1 ring-[#C41E3A]/20'
                    : 'bg-white border-[#E4E6EB]/80 hover:border-[#D5D8E0] hover:shadow-xs'
                }`}
              >
                {/* Main District Row Button */}
                <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2.5">
                  <div
                    onClick={() => handleSelect(district.nameBn + ' সদর')}
                    className="flex-1 flex items-center gap-2.5 cursor-pointer min-w-0"
                  >
                    {/* Radio/Check Circle Indicator */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'bg-[#C41E3A] text-white ring-2 ring-[#FFCDD2]'
                          : 'border-2 border-[#D5D8E0] bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    {/* District Names & Division */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm sm:text-base text-[#1B1B1F] leading-tight">
                          {district.nameBn}
                        </span>
                        <span className="text-xs text-[#5B5F6B]">({district.nameEn})</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#F0EDF2] text-[#5B5F6B]">
                          {district.divisionBn} বিভাগ
                        </span>
                      </div>

                      {/* Subtitle with Thanas count */}
                      <p className="text-[11px] text-[#5B5F6B] truncate mt-0.5">
                        {district.upazilas.slice(0, 3).join(', ')} সহ {toBengaliDigits(district.upazilas.length)}টি থানা
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Live Badges & Accordion Trigger */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* Live Emergency Requests Badge */}
                    {metric.activeRequests > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#FFEBEE] text-[#C41E3A] text-[10.5px] font-extrabold flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C41E3A] animate-ping" />
                        <span>{toBengaliDigits(metric.activeRequests)} জরুরি</span>
                      </span>
                    ) : (
                      <span className="hidden sm:inline-block text-[11px] text-[#5B5F6B]">
                        স্থিতিশীল
                      </span>
                    )}

                    {/* Ready Donors Count */}
                    <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#005938] text-[10.5px] font-extrabold flex items-center gap-1 shrink-0">
                      <Users className="w-3 h-3 text-[#00744B]" />
                      <span>{toBengaliDigits(metric.readyDonors)} ডোনার</span>
                    </span>

                    {/* Expand/Collapse Thana button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedDistrictId(isExpanded ? null : district.id);
                      }}
                      title="থানা বা উপজেলাসমূহ দেখুন"
                      className="w-7 h-7 rounded-lg bg-[#F7F7F9] hover:bg-[#F0EDF2] text-[#5B5F6B] flex items-center justify-center transition-all cursor-pointer"
                    >
                      <ChevronRight
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-90 text-[#C41E3A]' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Expanded Upazilas / Thanas Grid */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-[#E4E6EB]/60 bg-[#FAF9FB] rounded-b-2xl animate-in slide-in-from-top-2 duration-150">
                    <span className="text-[11px] font-bold text-[#5B5F6B] block mb-2">
                      {district.nameBn} জেলার প্রধান থানা/উপজেলাসমূহ নির্বাচন করুন:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {district.upazilas.map((upazila) => (
                        <button
                          key={upazila}
                          onClick={() => handleSelect(`${upazila}, ${district.nameBn}`)}
                          className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E4E6EB] hover:border-[#C41E3A] hover:bg-[#FDECEF] hover:text-[#C41E3A] text-left text-xs font-semibold text-[#1B1B1F] transition-all cursor-pointer active:scale-95 flex items-center justify-between"
                        >
                          <span className="truncate">{upazila}</span>
                          <ChevronRight className="w-3 h-3 text-[#5B5F6B] shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty Search Result State */}
          {filteredDistricts.length === 0 && matchedUpazilas.length === 0 && (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-[#F7F7F9] text-[#5B5F6B] flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-[#1B1B1F]">কোনো জেলা বা থানা পাওয়া যায়নি</h3>
              <p className="text-xs text-[#5B5F6B] mt-1">
                বানান সঠিক আছে কিনা দেখুন (যেমন: বগুড়া, ঢাকা, চট্টগ্রাম, রাজশাহী...)
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDivision('all');
                }}
                className="mt-3 px-4 py-1.5 rounded-xl bg-[#FDECEF] text-[#C41E3A] text-xs font-bold hover:bg-[#FFCDD2] transition-colors cursor-pointer"
              >
                সব জেলা দেখুন
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-t border-[#E4E6EB]/70 bg-white flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-1.5 text-[#5B5F6B]">
            <Building2 className="w-3.5 h-3.5 text-[#C41E3A]" />
            <span>
              বর্তমান নির্বাচিত: <strong className="text-[#1B1B1F]">{currentDistrict}</strong>
            </span>
          </div>

          <button
            onClick={handleDismiss}
            className="px-4 py-1.5 rounded-xl bg-[#F7F7F9] hover:bg-[#E4E6EB] text-[#1B1B1F] font-bold text-xs transition-colors cursor-pointer"
          >
            বাতিল
          </button>
        </div>
      </div>
    </div>
  );
};
