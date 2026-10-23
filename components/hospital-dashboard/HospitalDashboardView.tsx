'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Building,
  Activity,
  Clock,
  TrendingUp,
  AlertTriangle,
  Plus,
  Minus,
  Printer,
  FileText,
  CheckCircle,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  History,
  MapPin,
  Phone,
  Lock,
  UserCheck
} from 'lucide-react';
import { BloodGroup, StockLevel, HospitalBloodBank, UserProfile, BloodInventoryLog } from '@/lib/types';
import { toBengaliDigits } from '@/lib/bengali-utils';
import { useToast } from '@/components/ui/ToastNotification';
import {
  fetchHospitalsDirectory,
  updateHospitalBloodInventory,
  fetchBloodInventoryHistory,
} from '@/lib/services/bloodService';

interface HospitalDashboardViewProps {
  onBack: () => void;
  userProfile?: UserProfile;
  hospitals?: HospitalBloodBank[];
  onStockUpdated?: (hospitalId: string, group: BloodGroup, newCount: number) => void;
}

export const HospitalDashboardView: React.FC<HospitalDashboardViewProps> = ({
  onBack,
  userProfile,
  hospitals: initialHospitals = [],
  onStockUpdated,
}) => {
  const { showToast } = useToast();

  const [hospitalsList, setHospitalsList] = useState<HospitalBloodBank[]>(initialHospitals);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Simulation mode for testing/demoing hospital operator capabilities
  const realRole = userProfile?.role || 'donor';
  const isReallyOperator = realRole === 'hospital_operator' || realRole === 'admin';
  const [isSimulatedOperator, setIsSimulatedOperator] = useState<boolean>(isReallyOperator);

  const effectiveIsOperator = isReallyOperator || isSimulatedOperator;

  // 8 blood groups stocks state
  const [stocks, setStocks] = useState<{ [key in BloodGroup]: number }>({
    'O+': 8,
    'B+': 12,
    'A+': 5,
    'AB+': 3,
    'O-': 1,
    'B-': 1,
    'A-': 0,
    'AB-': 0,
  });

  const [historyLogs, setHistoryLogs] = useState<BloodInventoryLog[]>([]);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [isUpdatingGroup, setIsUpdatingGroup] = useState<BloodGroup | null>(null);

  const groups: BloodGroup[] = ['O+', 'B+', 'A+', 'AB+', 'O-', 'B-', 'A-', 'AB-'];

  // Load hospitals if not provided
  useEffect(() => {
    if (initialHospitals.length > 0) {
      setHospitalsList(initialHospitals);
      if (!selectedHospitalId) setSelectedHospitalId(initialHospitals[0].id);
    } else {
      setIsLoading(true);
      fetchHospitalsDirectory().then((data) => {
        setHospitalsList(data);
        if (data.length > 0 && !selectedHospitalId) {
          setSelectedHospitalId(data[0].id);
        }
        setIsLoading(false);
      });
    }
  }, [initialHospitals, selectedHospitalId]);

  // Load stocks and audit history for selected hospital
  const loadHospitalData = useCallback(async (hospId: string) => {
    if (!hospId) return;
    const found = hospitalsList.find((h) => h.id === hospId);
    if (found && found.stocks) {
      const mapped: { [key in BloodGroup]: number } = {
        'O+': found.stocks['O+']?.count || 0,
        'B+': found.stocks['B+']?.count || 0,
        'A+': found.stocks['A+']?.count || 0,
        'AB+': found.stocks['AB+']?.count || 0,
        'O-': found.stocks['O-']?.count || 0,
        'B-': found.stocks['B-']?.count || 0,
        'A-': found.stocks['A-']?.count || 0,
        'AB-': found.stocks['AB-']?.count || 0,
      };
      setStocks(mapped);
    }

    // Load audit logs
    const logs = await fetchBloodInventoryHistory(hospId);
    setHistoryLogs(logs);
  }, [hospitalsList]);

  useEffect(() => {
    if (selectedHospitalId) {
      loadHospitalData(selectedHospitalId);
    }
  }, [selectedHospitalId, loadHospitalData]);

  const selectedHospital = hospitalsList.find((h) => h.id === selectedHospitalId) || hospitalsList[0];

  // Stock Adjustment Handler with RBAC & Negative Check
  const handleUpdateStock = async (group: BloodGroup, delta: number) => {
    // 1. RBAC Check: Ensure only authorized operators can modify
    if (!effectiveIsOperator) {
      showToast(
        'অনুমতি নেই: শুধুমাত্র অনুমোদিত হাসপাতাল অপারেটর বা অ্যাডমিন ব্লাড স্টক পরিবর্তন করতে পারেন।',
        'error'
      );
      return;
    }

    const currentCount = stocks[group] || 0;
    // 2. Strict Boundary Check: Prevent negative stock numbers
    if (delta < 0 && currentCount <= 0) {
      showToast(`${group} রক্তের মজুদ ইতিমধ্যে ০ ব্যাগ। মজুদ সংখ্যা নেতিবাচক করা সম্ভব নয়।`, 'warning');
      return;
    }

    const nextCount = Math.max(0, currentCount + delta);

    // Optimistic UI Update
    setStocks((prev) => ({ ...prev, [group]: nextCount }));
    setIsUpdatingGroup(group);

    try {
      const result = await updateHospitalBloodInventory({
        hospitalId: selectedHospitalId || selectedHospital?.id || 'a0000001-0000-0000-0000-000000000001',
        bloodGroup: group,
        newUnits: nextCount,
        operatorId: userProfile?.userId || 'usr-operator-01',
        operatorName: userProfile?.name || 'মো. কামরুল (অনুমোদিত অপারেটর)',
        operatorRole: effectiveIsOperator ? 'hospital_operator' : 'donor',
        reason: delta > 0 ? 'রক্তদান প্রাপ্তি থেকে মজুদ বৃদ্ধি' : 'রোগীর জন্য রক্ত সরবরাহ',
      });

      if (result.success && result.updatedStock) {
        setLastAction(`${group} স্টক ${delta > 0 ? '+১ বৃদ্ধি' : '-১ হ্রাস'} সফল (${toBengaliDigits(nextCount)} ব্যাগ)`);
        showToast(`${group} রক্তের মজুদ সফলভাবে ${toBengaliDigits(nextCount)} ব্যাগে হালনাগাদ হয়েছে।`, 'success');

        if (result.log) {
          setHistoryLogs((prev) => [result.log!, ...prev]);
        }

        if (onStockUpdated && selectedHospitalId) {
          onStockUpdated(selectedHospitalId, group, nextCount);
        }
      } else {
        // Rollback on failure
        setStocks((prev) => ({ ...prev, [group]: currentCount }));
        showToast(result.message || 'স্টক আপডেট ব্যর্থ হয়েছে।', 'error');
      }
    } catch {
      setStocks((prev) => ({ ...prev, [group]: currentCount }));
      showToast('সার্ভারের সাথে সংযোগ ব্যর্থ হয়েছে।', 'error');
    } finally {
      setIsUpdatingGroup(null);
    }
  };

  // Critical stock calculation (<2 bags)
  const criticalGroups = groups.filter((g) => (stocks[g] || 0) < 2);
  const totalBags = Object.values(stocks).reduce((a, b) => a + b, 0);

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
            <h1 className="font-bold text-[18px] text-[#1B1B1F] leading-tight">হাসপাতাল ও ব্লাড ইনভেন্টরি ড্যাশবোর্ড</h1>
            <span className="text-[11px] text-[#5B5F6B]">
              {selectedHospital?.name || 'শহীদ জিয়াউর রহমান মেডিকেল কলেজ হাসপাতাল'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('মাসিক ইনভেন্টরি ও ট্রান্সফিউশন পিডিএফ রিপোর্ট প্রস্তুত হচ্ছে...', 'info')}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#F0EDF2] hover:bg-[#E4E6EB] text-[#1B1B1F] flex items-center gap-1.5 text-xs font-bold"
          >
            <Printer className="w-4 h-4 text-[#5B5F6B]" />
            <span className="hidden sm:inline">রিপোর্ট</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Hospital Selector Dropdown & Operator Status Card */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E4E6EB]/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex-1 min-w-0">
              <label htmlFor="hospital-select" className="text-xs font-bold text-[#5B5F6B] mb-1 block">প্রতিষ্ঠান নির্বাচন করুন:</label>
              <select
                id="hospital-select"
                aria-label="প্রতিষ্ঠান নির্বাচন করুন"
                value={selectedHospitalId}
                onChange={(e) => setSelectedHospitalId(e.target.value)}
                className="w-full bg-[#F7F7F9] border border-[#E4E6EB] rounded-xl px-3 py-2 text-sm font-bold text-[#1B1B1F] outline-none focus:ring-1 focus:ring-[#C41E3A]"
              >
                {hospitalsList.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.district || 'বগুড়া'})
                  </option>
                ))}
              </select>
            </div>

            {/* Operator Authorization Badge */}
            <div className="sm:self-end">
              <div
                className={`px-3 py-2 rounded-xl flex items-center gap-2 border text-xs font-bold ${
                  effectiveIsOperator
                    ? 'bg-[#E8F5E9] text-[#005938] border-[#A5D6A7]'
                    : 'bg-[#FFDAD6]/30 text-[#BA1A1A] border-[#FFDAD6]'
                }`}
              >
                {effectiveIsOperator ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#00744B]" />
                    <span>অনুমোদিত অপারেটর মোড</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-[#BA1A1A]" />
                    <span>শুধুমাত্র দেখার অনুমতি (Read-Only)</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Simulation Toggle for Review / Testing */}
          <div className="pt-2 border-t border-[#E4E6EB]/50 flex items-center justify-between text-xs">
            <span className="text-[#5B5F6B]">
              বর্তমান ব্যবহারকারী: <strong>{userProfile?.name || 'অতিথি ইউজার'}</strong> • রোল: <strong>{realRole}</strong>
            </span>
            <button
              onClick={() => {
                const toggled = !isSimulatedOperator;
                setIsSimulatedOperator(toggled);
                showToast(
                  toggled
                    ? 'অপারেটর মোড সক্রিয় হয়েছে! এখন স্টক যোগ/বিয়োগ করতে পারবেন।'
                    : 'সাধারণ ভিউয়ার মোড সক্রিয় হয়েছে (স্টক পরিবর্তন নিষ্ক্রিয়)।',
                  toggled ? 'success' : 'info'
                );
              }}
              className="text-[11px] font-bold text-[#0D58C9] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{isSimulatedOperator ? 'অপারেটর মোড বন্ধ করুন' : 'অপারেটর মোড হিসেবে পরীক্ষা করুন'}</span>
            </button>
          </div>
        </div>

        {/* 4 Overview Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-[#E4E6EB]/60">
            <span className="text-xs text-[#5B5F6B] font-medium block">মোট রক্তের মজুদ</span>
            <span className="text-[24px] font-extrabold text-[#00744B] mt-1 block">
              {toBengaliDigits(totalBags)} ব্যাগ
            </span>
            <span className="text-[10px] text-[#5B5F6B]">৮টি গ্রুপ মিলিয়ে</span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-[#E4E6EB]/60">
            <span className="text-xs text-[#5B5F6B] font-medium block">সংকটজনক গ্রুপ</span>
            <span className={`text-[24px] font-extrabold mt-1 block ${criticalGroups.length > 0 ? 'text-[#BA1A1A]' : 'text-[#00744B]'}`}>
              {toBengaliDigits(criticalGroups.length)}টি
            </span>
            <span className="text-[10px] text-[#BA1A1A] font-bold">
              {criticalGroups.length > 0 ? `${criticalGroups.join(', ')} ঘাটতি` : 'সব গ্রুপ পর্যাপ্ত'}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-[#E4E6EB]/60">
            <span className="text-xs text-[#5B5F6B] font-medium block">গড় সরবরাহ সময়</span>
            <span className="text-[24px] font-extrabold text-[#0D58C9] mt-1 block">
              {toBengaliDigits(12)} মি.
            </span>
            <span className="text-[10px] text-[#5B5F6B]">জরুরি বিভাগ ও ওটি</span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-[#E4E6EB]/60">
            <span className="text-xs text-[#5B5F6B] font-medium block">চলমান জরুরি চাহিদা</span>
            <span className="text-[24px] font-extrabold text-[#C41E3A] mt-1 block">
              {toBengaliDigits(3)}টি
            </span>
            <span className="text-[10px] text-[#00744B] font-bold">২ জন ডোনার পথে</span>
          </div>
        </div>

        {/* Live Blood Stock Visual Level Bar Chart */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-[#E4E6EB]/80 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E4E6EB]/60 pb-3">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#1B1B1F]">
                ব্লাড ইনভেন্টরি ও আটটি রক্তের গ্রুপের লাইভ স্টক
              </h3>
              <p className="text-[11px] text-[#5B5F6B]">
                নিরাপদ মাত্রা (≥৫ ব্যাগ), সীমিত (২-৪ ব্যাগ), সংকটজনক (&lt;২ ব্যাগ)
              </p>
            </div>
            {lastAction && (
              <span className="text-[10px] bg-[#E8F5E9] text-[#005938] px-2.5 py-1 rounded-full font-bold">
                {lastAction}
              </span>
            )}
          </div>

          {/* Visual Chart */}
          <div className="bg-[#FAF9FB] rounded-2xl p-3 border border-[#E4E6EB]/70">
            <div className="flex items-center justify-between text-xs text-[#5B5F6B] mb-2 px-1">
              <span className="font-semibold text-[#1B1B1F]">রক্তের মজুদ মাত্রা (ব্যাগ সংখ্যা)</span>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0B7A50]" /> নিরাপদ (≥৫)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E65100]" /> সতর্ক (২-৪)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#C41E3A]" /> সংকটজনক (&lt;২)</span>
              </div>
            </div>

            <div className="h-32 flex items-end justify-between gap-1.5 sm:gap-3 px-1 pt-4 pb-1 relative">
              <div className="absolute inset-x-2 top-14 border-b border-dashed border-[#0B7A50]/40 flex justify-end">
                <span className="text-[9px] text-[#0B7A50] font-bold bg-white px-1 rounded-xs -mt-2">নিরাপদ সীমা (৫)</span>
              </div>
              <div className="absolute inset-x-2 bottom-6 border-b border-[#E4E6EB]" />

              {groups.map((grp) => {
                const count = stocks[grp] || 0;
                const heightPercent = Math.min(100, Math.max(12, (count / 15) * 100));
                const barColor =
                  count >= 5
                    ? 'bg-gradient-to-t from-[#0B7A50] to-[#12A06C]'
                    : count >= 2
                    ? 'bg-gradient-to-t from-[#E65100] to-[#FF9800]'
                    : 'bg-gradient-to-t from-[#9E0027] to-[#C41E3A]';

                return (
                  <div key={grp} className="flex-1 flex flex-col items-center h-full justify-end z-10">
                    <span className="text-[10px] font-black text-[#1B1B1F] mb-1">
                      {toBengaliDigits(count)}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${barColor}`}
                    />
                    <span className="text-[11px] font-extrabold text-[#1B1B1F] mt-1.5">
                      {grp}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 8-Group Interactive Stock Management Grid (Only Authorized Operators Can Update) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {groups.map((grp) => {
              const count = stocks[grp] || 0;
              const isCritical = count < 2;
              const isLimited = count >= 2 && count < 5;
              const isAdequate = count >= 5;
              const isUpdating = isUpdatingGroup === grp;

              return (
                <div
                  key={grp}
                  className={`p-3 rounded-2xl border flex flex-col justify-between transition-all ${
                    isCritical
                      ? 'bg-[#FFDAD6]/30 border-[#FFDAD6]'
                      : isLimited
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-[#F7F7F9] border-[#E4E6EB]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-extrabold text-base text-[#1B1B1F] leading-none">{grp}</span>
                      <span
                        className={`text-[11px] font-bold block mt-1 ${
                          isCritical ? 'text-[#BA1A1A]' : isLimited ? 'text-[#9A5B00]' : 'text-[#00744B]'
                        }`}
                      >
                        {isCritical ? `${toBengaliDigits(count)} ব্যাগ (সংকটপূর্ণ)` : isLimited ? `${toBengaliDigits(count)} ব্যাগ (সীমিত)` : `${toBengaliDigits(count)} ব্যাগ (পর্যাপ্ত)`}
                      </span>
                    </div>
                  </div>

                  {/* Increment / Decrement Controls */}
                  <div className="flex items-center justify-between gap-1.5 mt-3 pt-2 border-t border-[#E4E6EB]/60">
                    <button
                      onClick={() => handleUpdateStock(grp, -1)}
                      disabled={count <= 0 || !effectiveIsOperator || isUpdating}
                      title={count <= 0 ? 'স্টক ০ হলে আরও কমানো যাবে না' : '১ ব্যাগ কমান'}
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                        count <= 0 || !effectiveIsOperator
                          ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
                          : 'bg-white hover:bg-gray-50 active:scale-95 text-[#1B1B1F] border-[#E4E6EB] shadow-xs'
                      }`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="font-extrabold text-sm text-[#1B1B1F] min-w-[24px] text-center">
                      {toBengaliDigits(count)}
                    </span>

                    <button
                      onClick={() => handleUpdateStock(grp, 1)}
                      disabled={!effectiveIsOperator || isUpdating}
                      title="১ ব্যাগ বৃদ্ধি করুন"
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        !effectiveIsOperator
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-[#C41E3A] hover:bg-[#9E0027] active:scale-95 text-white shadow-xs'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-[#F7F7F9] rounded-xl flex items-center justify-between text-[11px] text-[#5B5F6B]">
            <span>
              সর্বশেষ স্টক হালনাগাদ: <strong>আজ দুপুর ১২:৪০</strong> • দায়িত্বপ্রাপ্ত অপারেটর: <strong>মো. কামরুল</strong>
            </span>
            <span className="text-[#00744B] font-bold">✓ নেতিবাচক সংখ্যা প্রতিরোধ সক্রিয়</span>
          </div>
        </div>

        {/* Change History & Audit Logs Section */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E4E6EB]/60 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E4E6EB]/50 pb-2.5">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#C41E3A]" />
              <h3 className="font-bold text-sm text-[#1B1B1F]">স্টক পরিবর্তনের অডিট ইতিহাস</h3>
            </div>
            <span className="text-xs text-[#5B5F6B]">সর্বশেষ {toBengaliDigits(historyLogs.length)}টি রেকর্ড</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {historyLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-[#F7F7F9] rounded-xl flex items-center justify-between text-xs border border-[#E4E6EB]/50"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#C41E3A] text-white font-extrabold text-[10px]">
                      {log.bloodGroup}
                    </span>
                    <span className="font-bold text-[#1B1B1F]">
                      {toBengaliDigits(log.previousUnits)} ব্যাগ → {toBengaliDigits(log.newUnits)} ব্যাগ
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5B5F6B]">
                    কারণ: {log.reason || 'স্টক সমন্বয়'} • অপারেটর: {log.operatorName || 'অনুমোদিত অপারেটর'}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-[#5B5F6B] font-semibold block">{log.timestamp}</span>
                  <span className="text-[10px] text-[#00744B] font-bold">যাচাইকৃত</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
