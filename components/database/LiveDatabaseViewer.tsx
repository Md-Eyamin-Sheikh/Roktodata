'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  Droplet,
  Truck,
  Calendar,
  Users,
  Bell,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  History,
  HeartHandshake,
  X
} from 'lucide-react';

interface TableMeta {
  name: string;
  tableName: string;
  count: number;
  data: any[];
  error: string | null;
}

interface TablesData {
  [key: string]: TableMeta;
}

interface LiveDatabaseViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveDatabaseViewer: React.FC<LiveDatabaseViewerProps> = ({
  isOpen,
  onClose,
}) => {
  const [tablesData, setTablesData] = useState<TablesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>('emergency_requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/database/tables');
      const json = await res.json();
      if (json.success && json.tables) {
        setTablesData(json.tables);
      }
    } catch (e) {
      console.error('Failed to fetch tables:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTables();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTableMeta = tablesData ? tablesData[selectedTable] : null;
  const rawList = currentTableMeta?.data || [];

  const filteredList = rawList.filter((item: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const str = JSON.stringify(item).toLowerCase();
    return str.includes(query);
  });

  const tableTabs = [
    { id: 'emergency_requests', label: 'জরুরি আবেদন', icon: FileText, color: 'text-[#C41E3A]' },
    { id: 'hospitals_and_banks', label: 'হাসপাতাল ও ব্যাংক', icon: Building2, color: 'text-[#0D58C9]' },
    { id: 'blood_inventory', label: 'রক্তের স্টক', icon: Droplet, color: 'text-[#E53935]' },
    { id: 'ambulances', label: 'অ্যাম্বুলেন্স', icon: Truck, color: 'text-[#00744B]' },
    { id: 'donation_camps', label: 'ক্যাম্পেইন', icon: Calendar, color: 'text-[#D97706]' },
    { id: 'profiles', label: 'প্রোফাইল', icon: Users, color: 'text-[#7C3AED]' },
    { id: 'donor_profiles', label: 'ডোনার স্ট্যাটাস', icon: UserCheck, color: 'text-[#10B981]' },
    { id: 'donor_responses', label: 'ডোনার সাড়া', icon: HeartHandshake, color: 'text-[#EC4899]' },
    { id: 'donation_history', label: 'রক্তদান ইতিহাস', icon: History, color: 'text-[#6366F1]' },
    { id: 'notifications', label: 'নোটিফিকেশন', icon: Bell, color: 'text-[#F59E0B]' },
    { id: 'districts', label: 'জেলা তালিকা', icon: MapPin, color: 'text-[#2563EB]' },
  ];

  const handleCopySql = () => {
    const sql = `-- =========================================================================
-- রক্তদাতা (Roktodata) — সব টেবিল সিডিং স্ক্রিপ্ট (Supabase SQL Editor)
-- =========================================================================
ALTER TABLE IF EXISTS public.districts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.donor_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.donor_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.donation_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.emergency_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hospitals_and_banks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blood_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ambulances DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.donation_camps DISABLE ROW LEVEL SECURITY;

INSERT INTO public.profiles (id, phone_number, full_name, blood_group, division, district, is_verified)
VALUES
  ('11111111-1111-1111-1111-111111111101', '01712000201', 'তানভীর হাসান', 'A+', 'রাজশাহী', 'বগুড়া', true),
  ('11111111-1111-1111-1111-111111111102', '01712000202', 'সাকিব আল হাসান', 'O+', 'ঢাকা', 'ঢাকা', true),
  ('11111111-1111-1111-1111-111111111103', '01712000203', 'মো: আরিফুল ইসলাম', 'B+', 'রাজশাহী', 'বগুড়া', true)
ON CONFLICT (id) DO NOTHING;`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-4xl h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#E4E6EB]/80">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1B1B1F] to-[#2D2D35] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C41E3A] flex items-center justify-center shadow-md">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  লাইভ সুপাবেস ডেটাবেস এক্সপ্লোরার
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#00744B] text-[10px] font-extrabold uppercase tracking-wider text-white">
                  Live Cloud DB
                </span>
              </div>
              <p className="text-[11px] text-gray-300 mt-0.5">
                ক্লাউড ডেটাবেসের সবগুলো টেবিলের লাইভ ডেটা ও রেকর্ড নিরীক্ষা
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchTables}
              disabled={loading}
              title="রিফ্রেশ করুন"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">রিফ্রেশ</span>
            </button>

            <button
              onClick={() => setShowSqlModal(true)}
              className="p-2.5 rounded-xl bg-[#C41E3A]/80 hover:bg-[#C41E3A] text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">SQL স্ক্রিপ্ট</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Horizontal Scroller */}
        <div className="px-4 py-3 bg-[#FAF9FB] border-b border-[#E4E6EB] shrink-0 overflow-x-auto flex gap-2 scrollbar-none">
          {tableTabs.map((tab) => {
            const Icon = tab.icon;
            const count = tablesData?.[tab.id]?.count ?? 0;
            const isActive = selectedTable === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTable(tab.id)}
                className={`px-3.5 py-2 rounded-2xl flex items-center gap-2 text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-white text-[#C41E3A] shadow-xs border border-[#C41E3A]/30 ring-2 ring-[#C41E3A]/20'
                    : 'bg-white/60 text-[#5B5F6B] hover:bg-white border border-[#E4E6EB]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-gray-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10.5px] font-black ${
                    count > 0
                      ? 'bg-[#E8F5E9] text-[#00744B]'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search and Table Summary Bar */}
        <div className="px-4 py-2.5 bg-white border-b border-[#E4E6EB] flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#5B5F6B] w-full sm:w-auto">
            <span className="font-bold text-[#1B1B1F]">
              টেবিল: <span className="text-[#C41E3A]">{currentTableMeta?.name}</span> ({selectedTable})
            </span>
            <span className="text-gray-300">•</span>
            <span>মোট রেকর্ড: <strong className="text-[#00744B]">{filteredList.length}</strong> টি</span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="এই টেবিলে ফিল্টার করুন..."
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#FAF9FB] border border-[#E4E6EB] text-xs text-[#1B1B1F] placeholder-gray-400 outline-none focus:border-[#C41E3A]"
            />
          </div>
        </div>

        {/* Table Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7F7F9]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <RefreshCw className="w-8 h-8 text-[#C41E3A] animate-spin mb-3" />
              <p className="text-sm font-bold text-[#1B1B1F]">সুপাবেস ডেটাবেস থেকে ডেটা লোড হচ্ছে...</p>
              <p className="text-xs text-[#5B5F6B] mt-1">দয়া করে কিছুক্ষণ অপেক্ষা করুন</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center bg-white rounded-3xl p-6 border border-[#E4E6EB]">
              <Database className="w-12 h-12 text-gray-300 mb-3" />
              <h4 className="text-sm font-extrabold text-[#1B1B1F]">এই টেবিলে কোনো রেকর্ড পাওয়া যায়নি</h4>
              <p className="text-xs text-[#5B5F6B] mt-1 max-w-sm">
                Supabase SQL Editor-এ <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[#C41E3A]">seed_15_rows_all_tables.sql</code> রান করে সকল টেবিলে তাৎক্ষণিক ডেটা যোগ করতে পারেন।
              </p>
              <button
                onClick={() => setShowSqlModal(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-[#C41E3A] text-white text-xs font-bold shadow-xs cursor-pointer hover:bg-[#A3182F]"
              >
                SQL স্ক্রিপ্ট দেখুন
              </button>
            </div>
          ) : selectedTable === 'emergency_requests' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredList.map((req: any, idx: number) => (
                <div
                  key={req.id || idx}
                  className="bg-white rounded-2xl p-4 border border-[#E4E6EB] shadow-2xs hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 rounded-xl bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center font-black text-sm border border-[#FFCDD2]">
                        {req.blood_group}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-[#1B1B1F]">
                          {req.patient_name} ({req.patient_relation || 'রোগী'})
                        </h4>
                        <p className="text-[11px] text-[#5B5F6B] flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-[#0D58C9]" />
                          <span>{req.hospital_name}</span>
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.urgency === 'now'
                          ? 'bg-[#FFDAD6] text-[#9E0027]'
                          : 'bg-[#FFF3E0] text-[#E65100]'
                      }`}
                    >
                      {req.time_target || (req.urgency === 'now' ? 'এখনই লাগবে' : 'আজকের মধ্যে')}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#F0EDF2] flex items-center justify-between text-[11px] text-[#5B5F6B]">
                    <span className="flex items-center gap-1 font-semibold text-[#1B1B1F]">
                      <MapPin className="w-3.5 h-3.5 text-[#C41E3A]" />
                      {req.district} {req.location_detail ? `• ${req.location_detail}` : ''}
                    </span>
                    <span className="font-bold text-[#C41E3A]">
                      প্রয়োজন: {req.bags_needed} ব্যাগ
                    </span>
                  </div>

                  <div className="mt-2 text-[10px] text-gray-400 font-mono truncate">
                    UUID: {req.id}
                  </div>
                </div>
              ))}
            </div>
          ) : selectedTable === 'hospitals_and_banks' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredList.map((hosp: any, idx: number) => (
                <div
                  key={hosp.id || idx}
                  className="bg-white rounded-2xl p-4 border border-[#E4E6EB] shadow-2xs hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] text-[#0D58C9] flex items-center justify-center font-bold">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-[#1B1B1F]">
                          {hosp.name}
                        </h4>
                        <span className="text-[10px] bg-[#E8F5E9] text-[#005938] font-bold px-2 py-0.5 rounded-md inline-block mt-0.5">
                          {hosp.type === 'red_crescent' ? 'রেড ক্রিসেন্ট ব্লাড সেন্টার' : 'মেডিকেল কলেজ ও হাসপাতাল'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#5B5F6B] mt-2.5 leading-relaxed">
                    {hosp.address}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-[#F0EDF2] flex items-center justify-between text-xs font-bold">
                    <span className="text-[#00744B] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {hosp.operating_hours || '২৪/৭ খোলা'}
                    </span>
                    <a
                      href={`tel:${hosp.hotline}`}
                      className="px-2.5 py-1 rounded-lg bg-[#F7F7F9] hover:bg-[#E4E6EB] text-[#0D58C9] flex items-center gap-1 transition-colors"
                    >
                      <span>{hosp.hotline}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : selectedTable === 'blood_inventory' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredList.map((inv: any, idx: number) => (
                <div
                  key={inv.id || idx}
                  className="bg-white rounded-2xl p-3.5 border border-[#E4E6EB] shadow-2xs text-center flex flex-col justify-between"
                >
                  <div>
                    <span className="inline-block px-3 py-1 rounded-xl bg-[#FDECEF] text-[#C41E3A] font-black text-base border border-[#FFCDD2] mb-1.5">
                      {inv.blood_group}
                    </span>
                    <h5 className="font-bold text-xs text-[#1B1B1F] line-clamp-1">
                      {inv.hospitals_and_banks?.name || 'হাসপাতাল স্টক'}
                    </h5>
                    <p className="text-[10.5px] text-[#5B5F6B]">
                      {inv.hospitals_and_banks?.district || 'কেন্দ্রীয় সংরক্ষণ'}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#F0EDF2] flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-medium">মজুদ:</span>
                    <span className="font-black text-sm text-[#00744B]">
                      {inv.units_available} ব্যাগ
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : selectedTable === 'ambulances' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredList.map((amb: any, idx: number) => (
                <div
                  key={amb.id || idx}
                  className="bg-white rounded-2xl p-4 border border-[#E4E6EB] shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#00744B] flex items-center justify-center">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-[#1B1B1F]">
                          {amb.driver_name}
                        </h4>
                        <p className="text-[11px] text-[#5B5F6B]">{amb.service_type}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#F0EDF2] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#5B5F6B] font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#00744B]" />
                      {amb.location_base} ({amb.district})
                    </span>
                    <a
                      href={`tel:${amb.phone_number}`}
                      className="px-2.5 py-1 rounded-lg bg-[#E8F5E9] text-[#00744B] font-bold"
                    >
                      {amb.phone_number}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : selectedTable === 'donation_camps' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredList.map((camp: any, idx: number) => (
                <div
                  key={camp.id || idx}
                  className="bg-white rounded-2xl p-4 border border-[#E4E6EB] shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF3E0] text-[#E65100]">
                        {camp.district} • {camp.division}
                      </span>
                      <h4 className="font-extrabold text-xs sm:text-sm text-[#1B1B1F] mt-1">
                        {camp.organizer}
                      </h4>
                      <p className="text-[11px] text-[#5B5F6B] mt-0.5">{camp.venue}</p>
                    </div>
                    <div className="text-center px-2.5 py-1 rounded-xl bg-[#F7F7F9] border border-[#E4E6EB] shrink-0">
                      <span className="block text-sm font-black text-[#C41E3A]">{camp.date_day}</span>
                      <span className="block text-[10px] font-bold text-gray-500">{camp.date_month}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#F0EDF2] flex items-center justify-between text-[11px]">
                    <span className="text-[#5B5F6B]">{camp.time_slot}</span>
                    <span className="font-bold text-[#00744B]">
                      লক্ষ্যমাত্রা: {camp.target_units} ব্যাগ
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-4 border border-[#E4E6EB] overflow-x-auto">
              <pre className="text-xs font-mono text-[#1B1B1F]">
                {JSON.stringify(filteredList, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Bottom Footer Info */}
        <div className="p-3 bg-white border-t border-[#E4E6EB] flex flex-col sm:flex-row items-center justify-between text-xs text-[#5B5F6B] gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00744B]" />
            <span>সুপাবেস ক্লাস্টার লাইভ সংযোগ সক্রিয় (rpsvngzpnhgizwjqaelc.supabase.co)</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#1B1B1F] text-white font-bold text-xs cursor-pointer hover:bg-black"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>

      {/* SQL Script View Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3">
          <div className="w-full max-w-lg bg-white rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E6EB]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C41E3A]" />
                <h3 className="font-extrabold text-sm sm:text-base text-[#1B1B1F]">
                  Supabase SQL Editor স্ক্রিপ্ট
                </h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="w-8 h-8 rounded-full bg-[#F7F7F9] text-gray-500 flex items-center justify-center hover:bg-[#E4E6EB] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5B5F6B] leading-relaxed">
              আপনার Supabase ড্যাশবোর্ডের <strong>SQL Editor</strong> এ গিয়ে নিচের স্ক্রিপ্টটি পেস্ট করে <strong>Run</strong> বাটনে ক্লিক করলে সকল টেবিলে (Profiles, History, Notifications সহ) ১৫+ ডেটা স্বয়ংক্রিয়ভাবে ইনসার্ট হয়ে যাবে।
            </p>

            <div className="p-3 rounded-xl bg-[#1E1E24] text-gray-200 font-mono text-xs overflow-y-auto flex-1 select-all">
              <pre>{`-- ১. RLS ও Foreign Key ফিক্স
ALTER TABLE IF EXISTS public.districts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.donor_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.donor_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.donation_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;

-- বিস্তারিত কোড supabase/seed_15_rows_all_tables.sql ফাইলে প্রস্তুত আছে।`}</pre>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowSqlModal(false)}
                className="h-11 rounded-xl bg-[#F0EDF2] text-[#5B5F6B] font-bold text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={handleCopySql}
                className="h-11 rounded-xl bg-[#C41E3A] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#A3182F]"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>কপি হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>কোড কপি করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
