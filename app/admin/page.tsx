'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  UserX,
  FileText,
  Lock,
  ArrowLeft,
  RefreshCw,
  Eye,
  Server,
  Database,
  ExternalLink,
} from 'lucide-react';
import { FraudReportItem, ReportStatus } from '@/lib/types';

export default function AdminModeratorPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [reports, setReports] = useState<FraudReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'reviewing' | 'resolved' | 'dismissed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected report for review modal
  const [selectedReport, setSelectedReport] = useState<FraudReportItem | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  // Quick check for existing local admin token
  useEffect(() => {
    const saved = sessionStorage.getItem('roktodata_admin_session');
    if (saved === 'active') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    // Simple admin passkey for the prototype/staging environment
    if (adminKeyInput.trim() === 'admin123' || adminKeyInput.trim() === 'roktodata2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('roktodata_admin_session', 'active');
    } else {
      setAuthError('ভুল পাসকি! সঠিক মডারেটর সিকিউরিটি কি প্রদান করুন।');
    }
  };

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?status=${activeFilter}`);
      const data = await res.json();
      if (data.success && data.reports) {
        setReports(data.reports);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadReports();
    }
  }, [isAuthenticated, activeFilter]);

  const handleUpdateStatus = async (
    newStatus: ReportStatus,
    shouldBan: boolean = false
  ) => {
    if (!selectedReport) return;
    setIsUpdating(true);
    setUpdateMessage('');

    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: selectedReport.id,
          status: newStatus,
          adminNotes: adminNote,
          shouldBanTarget: shouldBan,
          targetPhone: selectedReport.targetPhone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUpdateMessage('রিপোর্ট সফলভাবে আপডেট করা হয়েছে।');
        // Update local state
        setReports((prev) =>
          prev.map((r) =>
            r.id === selectedReport.id
              ? { ...r, status: newStatus, adminNotes: adminNote }
              : r
          )
        );
        setSelectedReport(null);
        loadReports();
      } else {
        setUpdateMessage(data.error || 'আপডেট করতে ব্যর্থ হয়েছে।');
      }
    } catch {
      setUpdateMessage('সার্ভার যোগাযোগে ত্রুটি ঘটেছে।');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F7F7F9] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E4E6EB]/80 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-[#1B1B1F] mb-1">মডারেটর ও সেফটি পোর্টাল</h1>
          <p className="text-xs text-[#5B5F6B] mb-6">
            ভুয়া রক্তের আবেদন, স্প্যাম ও অনিয়ম তদন্তের জন্য সিকিউরিটি কি দিন।
          </p>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-[#1B1B1F] block mb-1.5">
                অ্যাডমিন পাসকি (Admin Passkey)
              </label>
              <input
                type="password"
                value={adminKeyInput}
                onChange={(e) => setAdminKeyInput(e.target.value)}
                placeholder="পাসকি প্রবেশ করান (e.g. admin123)..."
                className="w-full h-11 px-3.5 bg-[#F7F7F9] rounded-xl text-sm border border-[#E4E6EB] outline-none focus:border-[#C41E3A] transition-colors"
                autoFocus
              />
            </div>

            {authError && (
              <p className="text-xs text-[#C41E3A] font-semibold bg-[#FDECEF] p-2.5 rounded-xl">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#C41E3A] hover:bg-[#A3182F] text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
            >
              লগইন করুন
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E4E6EB] text-center">
            <Link href="/" className="text-xs text-[#5B5F6B] hover:text-[#1B1B1F]">
              ← রক্তদাতা মূল অ্যাপে ফিরে যান
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filtered reports
  const filtered = reports.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.targetName || '').toLowerCase().includes(q) ||
      (r.targetPhone && r.targetPhone.includes(q)) ||
      (r.requestId && r.requestId.toLowerCase().includes(q)) ||
      (r.description || '').toLowerCase().includes(q)
    );
  });

  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const reviewingCount = reports.filter((r) => r.status === 'reviewing').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;

  return (
    <div className="min-h-screen bg-[#F7F7F9] pb-16">
      {/* Top Navbar */}
      <header className="bg-white border-b border-[#E4E6EB] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-full hover:bg-[#F7F7F9] text-[#5B5F6B] transition-colors"
              title="মূল অ্যাপে ফিরে যান"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-base font-extrabold text-[#1B1B1F] flex items-center gap-2">
                <span>🛡️ রক্তদাতা মডারেশন ও অ্যান্টি-ফ্রড প্যানেল</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#005938]">
                  সক্রিয় অ্যাডমিন
                </span>
              </h1>
              <p className="text-[11px] text-[#5B5F6B]">
                স্প্যাম অনুরোধ, ডোনার হয়রানি ও অর্থ দাবি প্রতিরোধ ড্যাশবোর্ড
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadReports}
              disabled={isLoading}
              className="h-8.5 px-3 rounded-full bg-[#F7F7F9] hover:bg-[#E4E6EB] text-xs font-bold text-[#1B1B1F] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>রিফ্রেশ</span>
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem('roktodata_admin_session');
                setIsAuthenticated(false);
              }}
              className="h-8.5 px-3 rounded-full bg-[#FDECEF] hover:bg-[#FCD7DC] text-xs font-bold text-[#C41E3A] transition-colors cursor-pointer"
            >
              লগআউট
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E4E6EB] shadow-2xs">
            <div className="flex items-center justify-between text-[#C41E3A] mb-1">
              <span className="text-xs font-bold">নতুন অভিযোগ</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-[#1B1B1F]">{pendingCount}</div>
            <div className="text-[11px] text-[#5B5F6B] mt-1">তদন্তের অপেক্ষায় আছে</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E4E6EB] shadow-2xs">
            <div className="flex items-center justify-between text-[#0D58C9] mb-1">
              <span className="text-xs font-bold">চলমান তদন্ত</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-[#1B1B1F]">{reviewingCount}</div>
            <div className="text-[11px] text-[#5B5F6B] mt-1">মডারেটর পর্যালোচনা করছেন</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E4E6EB] shadow-2xs">
            <div className="flex items-center justify-between text-[#00744B] mb-1">
              <span className="text-xs font-bold">নিষ্পত্তিকৃত</span>
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-[#1B1B1F]">{resolvedCount}</div>
            <div className="text-[11px] text-[#5B5F6B] mt-1">সমাধান বা ব্যবস্থা নেওয়া হয়েছে</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E4E6EB] shadow-2xs">
            <div className="flex items-center justify-between text-[#8E929E] mb-1">
              <span className="text-xs font-bold">সার্ভার স্বাস্থ্য</span>
              <Server className="w-4 h-4" />
            </div>
            <div className="text-base font-black text-[#00744B]">Supabase লাইভ</div>
            <div className="text-[11px] text-[#5B5F6B] mt-1">ফ্রি-টিয়ার পিন চালু আছে</div>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E4E6EB] shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'সবগুলো' },
              { id: 'pending', label: `অপেক্ষমাণ (${pendingCount})` },
              { id: 'reviewing', label: `তদন্তাধীন (${reviewingCount})` },
              { id: 'resolved', label: `নিষ্পত্তি (${resolvedCount})` },
              { id: 'dismissed', label: 'বাতিল' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === f.id
                    ? 'bg-[#C41E3A] text-white shadow-2xs'
                    : 'bg-[#F7F7F9] text-[#5B5F6B] hover:bg-[#E4E6EB]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#8E929E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম, ফোন বা অনুরোধ আইডি..."
              className="w-full h-9 pl-9 pr-3 bg-[#F7F7F9] rounded-xl text-xs border border-[#E4E6EB] outline-none focus:border-[#C41E3A]"
            />
          </div>
        </div>

        {/* Reports Queue List */}
        <div className="bg-white rounded-3xl border border-[#E4E6EB] shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E4E6EB] flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-[#1B1B1F]">
              অভিযোগ কিউ (Moderation Queue)
            </h2>
            <span className="text-xs text-[#5B5F6B]">
              মোট রিপোর্ট: {filtered.length}টি
            </span>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-xs text-[#5B5F6B]">
              রিপোর্ট তালিকা লোড হচ্ছে...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#5B5F6B]">
              কোনো অভিযোগ পাওয়া যায়নি।
            </div>
          ) : (
            <div className="divide-y divide-[#E4E6EB]">
              {filtered.map((report) => (
                <div
                  key={report.id}
                  className="p-4 sm:p-5 hover:bg-[#FAF9FB] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#8E929E]">
                        {report.id}
                      </span>
                      <span className="font-bold text-sm text-[#1B1B1F]">
                        {report.targetName}
                      </span>
                      {report.targetPhone && (
                        <span className="text-xs font-mono bg-[#F7F7F9] px-2 py-0.5 rounded-md text-[#5B5F6B]">
                          {report.targetPhone}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          report.status === 'pending'
                            ? 'bg-[#FDECEF] text-[#C41E3A]'
                            : report.status === 'reviewing'
                            ? 'bg-[#D9E2FF] text-[#0D58C9]'
                            : report.status === 'resolved'
                            ? 'bg-[#E8F5E9] text-[#005938]'
                            : 'bg-[#F0EDF2] text-[#5B5F6B]'
                        }`}
                      >
                        {report.status === 'pending'
                          ? 'অপেক্ষমাণ'
                          : report.status === 'reviewing'
                          ? 'তদন্তাধীন'
                          : report.status === 'resolved'
                          ? 'নিষ্পত্তিকৃত'
                          : 'বাতিল'}
                      </span>
                    </div>

                    <p className="text-xs text-[#5B5F6B] leading-relaxed line-clamp-2">
                      <strong>বিবরণ:</strong> {report.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-[#8E929E]">
                      <span>অনুরোধ: {report.requestId || 'সাধারণ অভিযোগ'}</span>
                      <span>•</span>
                      <span>সময়: {report.createdAt}</span>
                      {report.adminNotes && (
                        <>
                          <span>•</span>
                          <span className="text-[#0D58C9] font-medium truncate max-w-xs">
                            নোট: {report.adminNotes}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setAdminNote(report.adminNotes || '');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#F7F7F9] hover:bg-[#E4E6EB] text-xs font-bold text-[#1B1B1F] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#5B5F6B]" />
                      <span>পর্যালোচনা</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Review & Action Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-3">
              <div>
                <h3 className="font-extrabold text-base text-[#1B1B1F]">
                  অভিযোগ বিস্তারিত পর্যালোচনা
                </h3>
                <span className="text-xs text-[#5B5F6B]">
                  আইডি: {selectedReport.id} • তারিখ: {selectedReport.createdAt}
                </span>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 rounded-full bg-[#F7F7F9] hover:bg-[#E4E6EB] flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-[#F7F7F9] p-4 rounded-2xl text-xs text-[#1B1B1F]">
              <div>
                <span className="font-bold text-[#5B5F6B] block">অভিযোগকৃত ব্যক্তি/প্রতিষ্ঠান:</span>
                <span className="font-bold text-sm">{selectedReport.targetName}</span>
                {selectedReport.targetPhone && (
                  <span className="font-mono text-xs block text-[#C41E3A]">
                    ফোন: {selectedReport.targetPhone}
                  </span>
                )}
              </div>

              <div>
                <span className="font-bold text-[#5B5F6B] block">অভিযোগের কারণ:</span>
                <span className="font-bold text-xs">
                  {selectedReport.reason === 'money_demanded'
                    ? 'রক্তের বিনিময়ে টাকা বা উপহার দাবি'
                    : selectedReport.reason === 'fake_request'
                    ? 'ভুয়া রক্তের আবেদন'
                    : selectedReport.reason}
                </span>
              </div>

              <div>
                <span className="font-bold text-[#5B5F6B] block">অভিযোগকারীর বিস্তারিত বিবরণ:</span>
                <p className="mt-1 leading-relaxed bg-white p-3 rounded-xl border border-[#E4E6EB]">
                  {selectedReport.description}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1B1B1F]">
                অ্যাডমিন তদন্ত নোট (Internal Moderation Note):
              </label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="হাসপাতাল বা সংশ্লিষ্ট ব্যক্তির সাথে কথা বলে পাওয়া তথ্য বা সিদ্ধান্ত লিখুন..."
                className="w-full p-3 bg-[#F7F7F9] rounded-xl text-xs border border-[#E4E6EB] outline-none focus:border-[#C41E3A]"
              />
            </div>

            {updateMessage && (
              <p className="text-xs text-[#00744B] font-bold bg-[#E8F5E9] p-2 rounded-xl">
                {updateMessage}
              </p>
            )}

            <div className="space-y-2 pt-2 border-t border-[#E4E6EB]">
              <div className="text-xs font-bold text-[#5B5F6B]">পদক্ষেপ গ্রহণ করুন:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleUpdateStatus('reviewing')}
                  disabled={isUpdating}
                  className="py-2.5 rounded-xl bg-[#D9E2FF] hover:bg-[#C2D4FF] text-[#0D58C9] font-bold text-xs transition-colors cursor-pointer"
                >
                  🔍 তদন্তে নিন (Investigating)
                </button>

                <button
                  onClick={() => handleUpdateStatus('resolved')}
                  disabled={isUpdating}
                  className="py-2.5 rounded-xl bg-[#E8F5E9] hover:bg-[#D4EED7] text-[#005938] font-bold text-xs transition-colors cursor-pointer"
                >
                  ✅ সমাধান (Resolved)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleUpdateStatus('dismissed')}
                  disabled={isUpdating}
                  className="py-2.5 rounded-xl bg-[#F0EDF2] hover:bg-[#E4E6EB] text-[#5B5F6B] font-bold text-xs transition-colors cursor-pointer"
                >
                  ভিত্তিহীন (Dismiss)
                </button>

                {selectedReport.targetPhone && (
                  <button
                    onClick={() => {
                      if (confirm(`আপনি কি নিশ্চিত যে ${selectedReport.targetPhone} নম্বরটি স্থায়ীভাবে ব্লক/নিষিদ্ধ করতে চান?`)) {
                        handleUpdateStatus('resolved', true);
                      }
                    }}
                    disabled={isUpdating}
                    className="py-2.5 rounded-xl bg-[#FDECEF] hover:bg-[#FCD7DC] text-[#C41E3A] font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>নম্বর নিষিদ্ধ করুন (Ban)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
