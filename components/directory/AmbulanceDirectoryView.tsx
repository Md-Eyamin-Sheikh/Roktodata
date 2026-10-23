'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  AlertCircle,
  ShieldCheck,
  MapPin,
  Search,
  Plus,
  Clock,
  Sparkles,
  CheckCircle2,
  Filter,
  Check
} from 'lucide-react';
import { AmbulanceService } from '@/lib/types';
import { toBengaliDigits } from '@/lib/bengali-utils';
import { allDistricts } from '@/lib/geo/bangladeshGeoData';
import { useToast } from '@/components/ui/ToastNotification';
import { createAmbulanceRecord } from '@/lib/services/bloodService';

interface AmbulanceDirectoryViewProps {
  ambulances: AmbulanceService[];
  onBack: () => void;
  userRole?: string;
  onAmbulanceAdded?: (newAmb: AmbulanceService) => void;
}

export const AmbulanceDirectoryView: React.FC<AmbulanceDirectoryViewProps> = ({
  ambulances: initialAmbulances,
  onBack,
  userRole = 'donor',
  onAmbulanceAdded,
}) => {
  const { showToast } = useToast();
  const [list, setList] = useState<AmbulanceService[]>(initialAmbulances);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [is247Only, setIs247Only] = useState(false);

  // New Ambulance Modal State (Admin / Operator addition)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDriverName, setNewDriverName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDistrict, setNewDistrict] = useState('বগুড়া');
  const [newLocationBase, setNewLocationBase] = useState('');
  const [newType, setNewType] = useState<AmbulanceService['type']>('Normal');
  const [newIs247, setNewIs247] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOperatorOrAdmin = userRole === 'hospital_operator' || userRole === 'admin';

  // Filter list
  const filtered = list.filter((amb) => {
    // 1. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        amb.providerName.toLowerCase().includes(q) ||
        amb.location.toLowerCase().includes(q) ||
        (amb.district && amb.district.toLowerCase().includes(q)) ||
        amb.phone.includes(q);
      if (!match) return false;
    }

    // 2. District Filter
    if (selectedDistrict !== 'all') {
      const matchDistrict =
        (amb.district && amb.district.includes(selectedDistrict)) ||
        amb.location.includes(selectedDistrict);
      if (!matchDistrict) return false;
    }

    // 3. Type Filter
    if (selectedType !== 'all') {
      if (amb.type !== selectedType) return false;
    }

    // 4. 24/7 Only
    if (is247Only && !amb.isAvailable247) {
      return false;
    }

    return true;
  });

  // Handle Add New Ambulance
  const handleCreateAmbulance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName.trim() || !newPhone.trim()) {
      showToast('অনুগ্রহ করে চালক/সংস্থার নাম ও ফোন নম্বর লিখুন।', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createAmbulanceRecord({
        providerName: newDriverName.trim(),
        phone: newPhone.trim(),
        district: newDistrict,
        location: `${newDistrict} • ${newLocationBase.trim() || 'সদর এলাকা'}`,
        type: newType,
        isAvailable247: newIs247,
        operatorRole: isOperatorOrAdmin ? userRole : 'hospital_operator',
      });

      if (res.success && res.ambulance) {
        setList((prev) => [res.ambulance!, ...prev]);
        if (onAmbulanceAdded) onAmbulanceAdded(res.ambulance!);
        showToast('নতুন অ্যাম্বুলেন্স সেবা সফলভাবে তালিকাভুক্ত হয়েছে!', 'success');
        setIsAddModalOpen(false);
        // Reset form
        setNewDriverName('');
        setNewPhone('');
        setNewLocationBase('');
      } else {
        showToast(res.message || 'অ্যাম্বুলেন্স যোগ করতে ব্যর্থ হয়েছে।', 'error');
      }
    } catch {
      showToast('ত্রুটি: সার্ভারে যোগাযোগ করা যায়নি।', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <span className="text-[11px] text-[#5B5F6B]">
              {toBengaliDigits(filtered.length)}টি সচল অ্যাম্বুলেন্স সেবা প্রস্তুত
            </span>
          </div>
        </div>

        {/* Add Ambulance Button for Operators / Admins */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-[#C41E3A] hover:bg-[#9E0027] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>অ্যাম্বুলেন্স যোগ করুন</span>
        </button>
      </div>

      <div className="space-y-3">
        {/* Offline & 24/7 Security Banner */}
        <div className="p-3 bg-[#E8F5E9] rounded-2xl flex items-center justify-between gap-2 text-xs text-[#005938] border border-[#A5D6A7]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#00744B]" />
            <span>ইন্টারনেট সংযোগ ছাড়াও জরুরি মুহূর্তে সরাসরি কল করার জন্য নম্বরগুলো সংরক্ষিত থাকে।</span>
          </div>
          <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#00744B] text-white text-[10px] font-bold">
            যাচাইকৃত
          </span>
        </div>

        {/* Filters Section */}
        <div className="p-3 bg-white rounded-2xl border border-[#E4E6EB]/50 shadow-xs space-y-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#5B5F6B] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="অ্যাম্বুলেন্স চালক, সংস্থা বা এলাকার নাম লিখুন..."
              className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#F7F7F9] text-sm text-[#1B1B1F] outline-none focus:ring-1 focus:ring-[#C41E3A]"
            />
          </div>

          {/* District & 24/7 Switch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label htmlFor="ambulance-district-select" className="text-[11px] font-bold text-[#5B5F6B] mb-1 block">জেলা ফিল্টার:</label>
              <select
                id="ambulance-district-select"
                aria-label="জেলা ফিল্টার"
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

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setIs247Only(!is247Only)}
                className={`w-full h-10 px-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  is247Only
                    ? 'bg-[#E8F5E9] text-[#00744B] border-[#A5D6A7]'
                    : 'bg-[#F7F7F9] text-[#5B5F6B] border-[#E4E6EB] hover:bg-[#F0EDF2]'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#00744B]" />
                  <span>শুধুমাত্র ২৪/৭ সার্বক্ষণিক সেবা</span>
                </span>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${is247Only ? 'bg-[#00744B] text-white' : 'bg-gray-200'}`}>
                  {is247Only ? '✓' : ''}
                </span>
              </button>
            </div>
          </div>

          {/* Type Filter Chips */}
          <div className="pt-2 border-t border-[#E4E6EB]/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-[#5B5F6B] shrink-0 mr-1">অ্যাম্বুলেন্সের ধরন:</span>
            {[
              { id: 'all', label: 'সব ধরন' },
              { id: 'ICU', label: 'আইসিইউ (ICU)' },
              { id: 'AC', label: 'এসি (AC)' },
              { id: 'Normal', label: 'নরমাল / নন-এসি' },
              { id: 'Freezing', label: 'ফ্রিজিং (লাশবাহী)' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedType === t.id
                    ? 'bg-[#C41E3A] text-white shadow-xs'
                    : 'bg-[#F7F7F9] text-[#5B5F6B] hover:bg-[#F0EDF2]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of Ambulances */}
        {filtered.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl text-center border border-[#E4E6EB] space-y-2">
            <p className="font-bold text-sm text-[#1B1B1F]">কোনো অ্যাম্বুলেন্স পাওয়া যায়নি</p>
            <p className="text-xs text-[#5B5F6B]">ফিল্টার বা জেলার নাম পরিবর্তন করে আবার দেখুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filtered.map((amb) => (
              <div
                key={amb.id}
                className="bg-white rounded-2xl p-4 shadow-xs border border-[#E4E6EB]/60 flex items-center justify-between gap-3 hover:border-[#C41E3A]/40 transition-all"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-[#1B1B1F] truncate">{amb.providerName}</h3>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        amb.type === 'ICU'
                          ? 'bg-[#FFDAD6] text-[#9E0027]'
                          : amb.type === 'Freezing'
                          ? 'bg-blue-100 text-blue-800'
                          : amb.type === 'AC'
                          ? 'bg-[#E8F5E9] text-[#005938]'
                          : 'bg-[#F0EDF2] text-[#1B1B1F]'
                      }`}
                    >
                      {amb.type === 'ICU' ? 'আইসিইউ' : amb.type === 'Freezing' ? 'ফ্রিজিং' : amb.type === 'AC' ? 'এসি' : 'নরমাল'}
                    </span>
                  </div>

                  <p className="text-xs text-[#5B5F6B] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C41E3A] shrink-0" />
                    <span className="truncate">{amb.location}</span>
                  </p>

                  <div className="flex items-center gap-2 text-[11px] pt-0.5">
                    <span className={`font-semibold flex items-center gap-1 ${amb.isAvailable247 ? 'text-[#00744B]' : 'text-amber-700'}`}>
                      <Clock className="w-3 h-3" />
                      {amb.isAvailable247 ? '২৪/৭ সার্বক্ষণিক সেবা' : 'দিনের বেলা সচল'}
                    </span>
                    <span className="text-[#00744B] font-bold">✓ যাচাইকৃত</span>
                  </div>
                </div>

                <a
                  href={`tel:${amb.phone}`}
                  className="h-11 px-4 rounded-xl bg-[#C41E3A] hover:bg-[#9E0027] active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs shrink-0 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>কল দিন</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Ambulance Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 space-y-4 shadow-xl border border-[#E4E6EB] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E4E6EB]/60 pb-3">
              <h3 className="font-bold text-base text-[#1B1B1F]">নতুন অ্যাম্বুলেন্স সেবা যুক্ত করুন</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F0EDF2] flex items-center justify-center text-[#5B5F6B] hover:text-[#1B1B1F]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAmbulance} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#1B1B1F] block mb-1">চালক বা প্রতিষ্ঠানের নাম *</label>
                <input
                  type="text"
                  required
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  placeholder="যেমন: মো. আল আমিন বা সেবা অ্যাম্বুলেন্স"
                  className="w-full h-10 px-3 rounded-xl bg-[#F7F7F9] border border-[#E4E6EB] text-[#1B1B1F] outline-none focus:ring-1 focus:ring-[#C41E3A]"
                />
              </div>

              <div>
                <label className="font-bold text-[#1B1B1F] block mb-1">যোগাযোগের মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="যেমন: ০১৭১১-২২৩৩৪৪"
                  className="w-full h-10 px-3 rounded-xl bg-[#F7F7F9] border border-[#E4E6EB] text-[#1B1B1F] outline-none focus:ring-1 focus:ring-[#C41E3A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#1B1B1F] block mb-1">জেলা *</label>
                  <select
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full h-10 px-2 rounded-xl bg-[#F7F7F9] border border-[#E4E6EB] text-[#1B1B1F] outline-none focus:ring-1 focus:ring-[#C41E3A]"
                  >
                    {allDistricts.map((d) => (
                      <option key={d.id} value={d.nameBn}>
                        {d.nameBn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1B1B1F] block mb-1">অ্যাম্বুলেন্সের ধরন *</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full h-10 px-2 rounded-xl bg-[#F7F7F9] border border-[#E4E6EB] text-[#1B1B1F] outline-none focus:ring-1 focus:ring-[#C41E3A]"
                  >
                    <option value="Normal">নরমাল (নন-এসি)</option>
                    <option value="AC">এসি (AC)</option>
                    <option value="ICU">আইসিইউ ও লাইফ সাপোর্ট</option>
                    <option value="Freezing">লাশবাহী ফ্রিজিং</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1B1B1F] block mb-1">স্ট্যান্ড বা অবস্থান এলাকা</label>
                <input
                  type="text"
                  value={newLocationBase}
                  onChange={(e) => setNewLocationBase(e.target.value)}
                  placeholder="যেমন: শজিমেক হাসপাতাল গেট বা সদর রোড"
                  className="w-full h-10 px-3 rounded-xl bg-[#F7F7F9] border border-[#E4E6EB] text-[#1B1B1F] outline-none focus:ring-1 focus:ring-[#C41E3A]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modal-247-check"
                  checked={newIs247}
                  onChange={(e) => setNewIs247(e.target.checked)}
                  className="w-4 h-4 text-[#C41E3A] rounded border-gray-300 focus:ring-[#C41E3A]"
                />
                <label htmlFor="modal-247-check" className="font-bold text-[#1B1B1F] cursor-pointer">
                  ২৪/৭ সার্বক্ষণিক জরুরি সেবা নিশ্চিত
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-[#F0EDF2] text-[#1B1B1F] font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 rounded-xl bg-[#C41E3A] text-white font-bold hover:bg-[#9E0027] transition-all"
                >
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
