'use client';

import React, { useState } from 'react';
import { X, Calendar, MapPin, Building, Droplet, Clock, Check, AlertCircle, Sparkles } from 'lucide-react';
import { DonationCamp } from '@/lib/types';
import { divisionsList, allDistricts } from '@/lib/geo/bangladeshGeoData';
import { createDonationCamp } from '@/lib/services/bloodService';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface CreateCampModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCampCreated: (newCamp: DonationCamp) => void;
  currentDistrict?: string;
}

export const CreateCampModal: React.FC<CreateCampModalProps> = ({
  isOpen,
  onClose,
  onCampCreated,
  currentDistrict = 'বগুড়া',
}) => {
  const { language, t } = useLanguage();
  const [organizer, setOrganizer] = useState('');
  const [venue, setVenue] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('রাজশাহী');
  const [selectedDistrict, setSelectedDistrict] = useState(
    currentDistrict.replace(/সদর/g, '').trim() || 'বগুড়া'
  );
  const [campDate, setCampDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('সকাল ৯:০০ — বিকাল ৪:০০');
  const [targetUnits, setTargetUnits] = useState(100);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const availableDistricts = allDistricts.filter(
    (d) => !selectedDivision || d.divisionBn === selectedDivision || d.divisionId === selectedDivision
  );

  const handleDivisionChange = (divBn: string) => {
    setSelectedDivision(divBn);
    const first = allDistricts.find((d) => d.divisionBn === divBn);
    if (first) setSelectedDistrict(first.nameBn);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!organizer.trim()) {
      setErrorMessage('আয়োজক সংস্থা বা ক্লাবের নাম লিখুন');
      return;
    }
    if (!venue.trim()) {
      setErrorMessage('ক্যাম্পের ভেন্যু বা ঠিকানা উল্লেখ করুন');
      return;
    }
    if (!campDate) {
      setErrorMessage('ক্যাম্পের তারিখ নির্ধারণ করুন');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createDonationCamp({
        organizer: organizer.trim(),
        venue: venue.trim(),
        division: selectedDivision,
        district: selectedDistrict,
        campDate,
        timeSlot: timeSlot.trim() || 'সকাল ৯:০০ — বিকাল ৪:০০',
        targetUnits: Number(targetUnits) || 100,
        description: description.trim() || undefined,
      });

      onCampCreated(created);
      onClose();
    } catch {
      setErrorMessage('ক্যাম্পেইন সংরক্ষণে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3.5 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E6EB]/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-[16px] sm:text-[17px] text-[#1B1B1F]">
                নতুন রক্তদান ক্যাম্পেইন তৈরি করুন
              </h2>
              <span className="text-[11px] text-[#5B5F6B] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#C41E3A]" />
                কমিউনিটি রক্তদান কার্যক্রম
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5B5F6B] hover:bg-[#F7F7F9] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-3 space-y-3.5 text-xs">
          {errorMessage && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#991B1B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Organizer */}
          <div>
            <label className="text-xs text-[#5B5F6B] font-bold block mb-1">
              আয়োজক সংস্থা বা ক্লাবের নাম <span className="text-[#C41E3A]">*</span>
            </label>
            <input
              type="text"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              placeholder="উদা: সন্ধানী শজিমেক ইউনিট / বাংলাদেশ রেড ক্রিসেন্ট"
              className="w-full h-11 px-3.5 rounded-xl bg-[#F7F7F9] text-sm text-[#1B1B1F] font-semibold border border-[#E4E6EB] outline-none focus:bg-white focus:border-[#C41E3A]"
              required
            />
          </div>

          {/* Venue */}
          <div>
            <label className="text-xs text-[#5B5F6B] font-bold block mb-1">
              ক্যাম্পের ভেন্যু বা অবস্থান <span className="text-[#C41E3A]">*</span>
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-[#5B5F6B] absolute left-3 top-3.5" />
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="উদা: বগুড়া জিলা স্কুল প্রাঙ্গণ"
                className="w-full h-11 pl-9 pr-3.5 rounded-xl bg-[#F7F7F9] text-sm text-[#1B1B1F] font-semibold border border-[#E4E6EB] outline-none focus:bg-white focus:border-[#C41E3A]"
                required
              />
            </div>
          </div>

          {/* Division & District */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#5B5F6B] font-bold block mb-1">বিভাগ</label>
              <select
                value={selectedDivision}
                onChange={(e) => handleDivisionChange(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#F7F7F9] text-sm text-[#1B1B1F] font-semibold border border-[#E4E6EB] outline-none cursor-pointer"
              >
                {divisionsList.map((div) => (
                  <option key={div.id} value={div.nameBn}>
                    {div.nameBn} বিভাগ
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#5B5F6B] font-bold block mb-1">জেলা</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#F7F7F9] text-sm text-[#1B1B1F] font-semibold border border-[#E4E6EB] outline-none cursor-pointer"
              >
                {availableDistricts.map((d) => (
                  <option key={d.id} value={d.nameBn}>
                    {d.nameBn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time Slot */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#5B5F6B] font-bold block mb-1">
                ক্যাম্পের তারিখ <span className="text-[#C41E3A]">*</span>
              </label>
              <input
                type="date"
                value={campDate}
                onChange={(e) => setCampDate(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#F7F7F9] text-sm text-[#1B1B1F] font-semibold border border-[#E4E6EB] outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs text-[#5B5F6B] font-bold block mb-1">সময়সূচী</label>
              <input
                type="text"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="সকাল ৯:০০ — বিকাল ৪:০০"
                className="w-full h-11 px-3 rounded-xl bg-[#F7F7F9] text-sm text-[#1B1B1F] font-semibold border border-[#E4E6EB] outline-none"
              />
            </div>
          </div>

          {/* Target Units */}
          <div>
            <label className="text-xs text-[#5B5F6B] font-bold block mb-1">
              লক্ষ্যমাত্রা (কত ব্যাগ রক্ত সংগ্রহের লক্ষ্য?)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="10"
                max="1000"
                value={targetUnits}
                onChange={(e) => setTargetUnits(Number(e.target.value))}
                className="w-32 h-11 px-3 rounded-xl bg-[#F7F7F9] text-sm text-[#1B1B1F] font-bold border border-[#E4E6EB] outline-none"
              />
              <span className="text-xs text-[#5B5F6B] font-semibold">ব্যাগ রক্ত সংগ্রহের প্রত্যাশা</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-[#5B5F6B] font-bold block mb-1">
              ক্যাম্পেইনের বিস্তারিত বা নির্দেশনা (ঐচ্ছিক)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="স্বেচ্ছাসেবী ও রক্তদাতাদের জন্য কোনো বিশেষ নির্দেশনা থাকলে লিখুন..."
              className="w-full p-3 rounded-xl bg-[#F7F7F9] text-sm text-[#1B1B1F] border border-[#E4E6EB] outline-none focus:bg-white focus:border-[#C41E3A] resize-none"
            />
          </div>

          {/* Human Voluntary Disclaimer */}
          <div className="p-3 bg-[#EFF6FF] rounded-xl border border-[#BFDBFE] text-[11px] text-[#1E3A8A]">
            ক্যাম্পেইনের সকল তথ্য কমিউনিটি ফিডে প্রচারিত হবে এবং নিবন্ধিত রক্তদাতারা সরাসরি আরএসভিপি (RSVP) করতে পারবেন।
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#9E0027] to-[#C41E3A] hover:from-[#80001F] hover:to-[#B01A33] text-white font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>ক্যাম্পেইন তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>ক্যাম্পেইন প্রকাশ করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
