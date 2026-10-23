'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  Check,
  ShieldAlert,
  ShieldCheck,
  UploadCloud,
  FileText,
  Clock,
  CheckCircle,
  Eye,
  Filter,
  Lock,
} from 'lucide-react';
import { FraudReportPayload, FraudReportItem } from '@/lib/types';
import {
  submitFraudReport,
  fetchFraudReports,
  updateReportStatus,
} from '@/lib/services/bloodService';

interface ReportModalProps {
  isOpen: boolean;
  targetName: string;
  targetUserId?: string;
  requestId?: string;
  reporterId?: string;
  onClose: () => void;
  isAdmin?: boolean;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  targetName,
  targetUserId = 'user-reported',
  requestId = 'REQ-REPORT',
  reporterId = 'current-reporter',
  onClose,
  isAdmin = false,
}) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'admin'>('submit');

  // Submit Form States
  const [selectedReason, setSelectedReason] = useState<FraudReportPayload['reason']>('money_demanded');
  const [description, setDescription] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofFileName, setProofFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState('');

  // Admin Review States
  const [reportsList, setReportsList] = useState<FraudReportItem[]>([]);
  const [adminFilter, setAdminFilter] = useState<'all' | 'pending' | 'reviewing' | 'resolved' | 'dismissed'>('all');
  const [selectedReport, setSelectedReport] = useState<FraudReportItem | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Load reports for admin panel
  useEffect(() => {
    if (isOpen && activeTab === 'admin') {
      fetchFraudReports().then((data) => {
        setReportsList(data);
      });
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const reasons: { id: FraudReportPayload['reason']; label: string; desc: string }[] = [
    {
      id: 'money_demanded',
      label: 'রক্তের বিনিময়ে অর্থ দাবি',
      desc: 'ডোনার বা প্রতিনিধি রক্তের জন্য টাকা, উপহার বা অনৈতিক সুবিধা দাবি করেছেন',
    },
    {
      id: 'fake_request',
      label: 'ভুয়া রক্তের অনুরোধ',
      desc: 'হাসপাতালে কোনো রোগী নেই বা উদ্দেশ্যপ্রণোদিত মিথ্যা আবেদন',
    },
    {
      id: 'no_show',
      label: 'রক্তদানে অনুপস্থিতি (No-show)',
      desc: 'নিশ্চিত করার পরও কোনো যুক্তিসঙ্গত কারণ ছাড়া রক্তদান কেন্দ্রে অনুপস্থিত ছিলেন',
    },
    {
      id: 'incorrect_info',
      label: 'ভুল ও বিভ্রান্তিকর তথ্য',
      desc: 'রক্তের গ্রুপ, ওয়ার্ড, রোগীর অবস্থা বা ঠিকানা ইচ্ছাকৃত ভুল দিয়েছেন',
    },
    {
      id: 'harassment',
      label: 'অশালীন আচরণ বা হয়রানি',
      desc: 'চ্যাটে বা ফোনে আপত্তিকর ও অশালীন বার্তা বা হুমকি প্রদান',
    },
    {
      id: 'other',
      label: 'অন্যান্য নীতিবিরুদ্ধ কার্যকলাপ',
      desc: 'রক্তদাতা ও রোগী সুরক্ষার অন্য যেকোনো শর্ত লঙ্ঘন',
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('প্রমাণ ফাইলের সাইজ সর্বোচ্চ ৫ মেগাবাইট (5MB) হতে পারে।');
      return;
    }

    setProofFile(file);
    setProofFileName(file.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!description.trim() || description.trim().length < 10) {
      setSubmitError('অনুগ্রহ করে অন্তত ১০ অক্ষরে ঘটনার বিস্তারিত বিবরণ দিন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitFraudReport({
        targetUserId,
        targetName: targetName || 'অজ্ঞাত ব্যক্তি',
        requestId,
        reporterId,
        reason: selectedReason,
        description: description.trim(),
        proofFileName: proofFileName || undefined,
        proofFileUrl: proofFile ? URL.createObjectURL(proofFile) : undefined,
      });

      if (result.success) {
        setSubmittedReportId(result.reportId);
      } else {
        setSubmitError('অভিযোগ সংরক্ষণ করা যায়নি। পুনরায় চেষ্টা করুন।');
      }
    } catch {
      setSubmitError('সার্ভারে যোগাযোগ করা সম্ভব হয়নি।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminStatusUpdate = async (newStatus: FraudReportItem['status']) => {
    if (!selectedReport) return;
    setIsUpdatingStatus(true);
    try {
      const ok = await updateReportStatus(selectedReport.id, newStatus, adminNoteInput);
      if (ok) {
        setReportsList((prev) =>
          prev.map((r) =>
            r.id === selectedReport.id
              ? { ...r, status: newStatus, adminNotes: adminNoteInput || r.adminNotes }
              : r
          )
        );
        setSelectedReport((prev) =>
          prev ? { ...prev, status: newStatus, adminNotes: adminNoteInput || prev.adminNotes } : null
        );
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const filteredReports = reportsList.filter((r) => {
    if (adminFilter === 'all') return true;
    return r.status === adminFilter;
  });

  const getStatusBadge = (status: FraudReportItem['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-[#9A5B00]">বিচারাধীন (Pending)</span>;
      case 'reviewing':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D9E2FF] text-[#0D58C9]">পর্যালোচনা চলছে (Reviewing)</span>;
      case 'resolved':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#005938]">নিষ্পত্তিকৃত (Resolved)</span>;
      case 'dismissed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0EDF2] text-[#5B5F6B]">বাতিলকৃত (Dismissed)</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E6EB] shrink-0">
          <div className="flex items-center gap-2 text-[#BA1A1A]">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold text-base text-[#1B1B1F]">নিরাপত্তা ও অ্যান্টি-ফ্রড রিপোর্ট</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5B5F6B] hover:bg-[#F7F7F9] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher for Reporting vs Admin Review */}
        <div className="flex border-b border-[#E4E6EB] mt-3 shrink-0">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex-1 py-2 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
              activeTab === 'submit'
                ? 'border-[#C41E3A] text-[#C41E3A]'
                : 'border-transparent text-[#5B5F6B] hover:text-[#1B1B1F]'
            }`}
          >
            অভিযোগ জমা দিন
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-2 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'border-[#C41E3A] text-[#C41E3A]'
                : 'border-transparent text-[#5B5F6B] hover:text-[#1B1B1F]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>অ্যাডমিন রিভিউ প্যানেল</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 text-xs">
          {activeTab === 'submit' ? (
            submittedReportId ? (
              /* Success Screen */
              <div className="py-6 text-center space-y-3">
                <span className="w-14 h-14 rounded-full bg-[#E8F5E9] text-[#00744B] flex items-center justify-center mx-auto shadow-xs">
                  <Check className="w-7 h-7 stroke-[3]" />
                </span>
                <h4 className="font-bold text-base text-[#1B1B1F]">
                  অভিযোগ সফলভাবে গ্রহণ করা হয়েছে
                </h4>
                <div className="inline-block px-3 py-1 bg-[#F7F7F9] rounded-xl font-mono text-xs font-semibold text-[#001946]">
                  অভিযোগ আইডি: {submittedReportId}
                </div>
                <p className="text-xs text-[#5B5F6B] max-w-sm mx-auto leading-relaxed">
                  ধন্যবাদ। আমাদের সেফটি অ্যান্ড এথিক্স টিম উভয় পক্ষের ডিজিটাল লগ ও প্রমাণাদি পুঙ্খানুপুঙ্খভাবে পর্যালোচনা করবে। কাউকে নোটিশ ছাড়া বা পক্ষপাতদুষ্টভাবে শাস্তি দেওয়া হয় না।
                </p>
                <button
                  onClick={() => {
                    setSubmittedReportId(null);
                    onClose();
                  }}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-[#0D58C9] text-white font-bold text-xs shadow-xs hover:bg-[#094196] cursor-pointer"
                >
                  ঠিক আছে
                </button>
              </div>
            ) : (
              /* Report Submission Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-[#FFDAD6]/30 rounded-2xl border border-[#FFDAD6] text-[#93000A] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>অভিযোগ সংক্রান্ত সতর্কতা ও নিরপেক্ষতা নীতি</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#BA1A1A]">
                    অভিযোগের ভিত্তিতে কাউকে স্বয়ংক্রিয়ভাবে দোষী সাব্যস্ত বা একতরফা ব্যান করা হয় না। মানব নিরাপত্তা বিশ্লেষক নিরপেক্ষভাবে অডিট করবেন।
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[#5B5F6B] block">অভিযুক্ত ব্যক্তি / অনুরোধ:</span>
                  <div className="p-2.5 bg-[#F7F7F9] rounded-xl font-semibold text-[#1B1B1F] flex items-center justify-between">
                    <span>{targetName}</span>
                    {requestId && <span className="text-[10px] text-[#5B5F6B]">আইডি: {requestId}</span>}
                  </div>
                </div>

                {/* Reason Selection */}
                <div className="space-y-2">
                  <label className="font-bold text-[#1B1B1F] block">
                    অভিযোগের প্রধান ধরন নির্বাচন করুন:
                  </label>
                  <div className="space-y-2">
                    {reasons.map((r) => (
                      <label
                        key={r.id}
                        onClick={() => setSelectedReason(r.id)}
                        className={`p-3 rounded-2xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                          selectedReason === r.id
                            ? 'bg-[#FFDAD6]/40 border-[#BA1A1A] font-bold text-[#BA1A1A]'
                            : 'bg-[#F7F7F9] border-[#E4E6EB] text-[#1B1B1F] hover:bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="report_reason"
                          checked={selectedReason === r.id}
                          onChange={() => setSelectedReason(r.id)}
                          className="mt-0.5 accent-[#C41E3A]"
                        />
                        <div className="flex-1">
                          <span className="block leading-tight">{r.label}</span>
                          <span className="text-[10px] text-[#5B5F6B] font-normal block mt-0.5">
                            {r.desc}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Details Textarea */}
                <div className="space-y-1.5">
                  <label className="font-bold text-[#1B1B1F] block">
                    বিস্তারিত বিবরণ লিখুন: <span className="text-[#BA1A1A]">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="ঘটনার সুনির্দিষ্ট সময়, স্থান, দাবিকৃত টাকার পরিমাণ বা কী অনিয়ম হয়েছে লিখুন..."
                    className="w-full p-3 bg-[#F7F7F9] border border-[#E4E6EB] rounded-2xl text-xs text-[#1B1B1F] outline-none focus:ring-2 focus:ring-[#C41E3A]/40"
                  />
                </div>

                {/* Proof File Attachment */}
                <div className="space-y-1.5">
                  <label className="font-bold text-[#1B1B1F] flex items-center justify-between">
                    <span>স্ক্রিনশট বা প্রমাণের ছবি যুক্ত করুন (ঐচ্ছিক):</span>
                    <span className="text-[10px] text-[#5B5F6B] font-normal">সর্বোচ্চ ৫ MB</span>
                  </label>
                  <div className="relative border-2 border-dashed border-[#E4E6EB] rounded-2xl p-3 text-center bg-[#F7F7F9] hover:bg-white transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex items-center justify-center gap-2 text-[#5B5F6B]">
                      <UploadCloud className="w-4 h-4 text-[#C41E3A]" />
                      <span className="text-xs font-medium">
                        {proofFileName ? proofFileName : 'ছবি বা ফাইল নির্বাচন করুন'}
                      </span>
                    </div>
                  </div>
                  {proofFileName && (
                    <span className="text-[10px] text-[#00744B] font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> ফাইল আপলোড প্রস্তুত
                    </span>
                  )}
                </div>

                {submitError && (
                  <p className="text-xs text-[#BA1A1A] font-medium">{submitError}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-2xl bg-[#BA1A1A] hover:bg-[#93000A] text-white font-bold text-xs shadow-xs transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'অভিযোগ জমা হচ্ছে...' : 'নিরপেক্ষ পর্যালোচনার জন্য জমা দিন'}
                </button>
              </form>
            )
          ) : (
            /* Admin Review Sub-view */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#1B1B1F]">
                  দাখিলকৃত অভিযোগসমূহ ({filteredReports.length})
                </span>
                <div className="flex gap-1 overflow-x-auto text-[10px]">
                  {(['all', 'pending', 'reviewing', 'resolved'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setAdminFilter(st)}
                      className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer transition-colors ${
                        adminFilter === st
                          ? 'bg-[#1B1B1F] text-white'
                          : 'bg-[#F7F7F9] text-[#5B5F6B] hover:bg-[#E4E6EB]'
                      }`}
                    >
                      {st === 'all'
                        ? 'সব'
                        : st === 'pending'
                        ? 'বিচারাধীন'
                        : st === 'reviewing'
                        ? 'চলমান'
                        : 'নিষ্পত্তিকৃত'}
                    </button>
                  ))}
                </div>
              </div>

              {filteredReports.length === 0 ? (
                <div className="py-8 text-center text-[#5B5F6B]">
                  কোনো অভিযোগ পাওয়া যায়নি।
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredReports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => {
                        setSelectedReport(report);
                        setAdminNoteInput(report.adminNotes || '');
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        selectedReport?.id === report.id
                          ? 'bg-[#FDECEF]/40 border-[#C41E3A]'
                          : 'bg-[#F7F7F9] border-[#E4E6EB] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-[#1B1B1F] text-xs">
                            {report.targetName}
                          </div>
                          <div className="text-[10px] text-[#5B5F6B]">
                            আইডি: {report.id} • অনুরোধ: {report.requestId || 'N/A'}
                          </div>
                        </div>
                        {getStatusBadge(report.status)}
                      </div>
                      <p className="text-[11px] text-[#5B5F6B] line-clamp-1 mt-1">
                        {report.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Admin Action Box on Selected Report */}
              {selectedReport && (
                <div className="p-3 bg-white rounded-2xl border border-[#C41E3A]/40 space-y-2 mt-3 shadow-xs">
                  <div className="font-bold text-xs text-[#1B1B1F] flex items-center justify-between">
                    <span>পর্যালোচনা অ্যাকশন: {selectedReport.id}</span>
                    <span className="text-[10px] font-normal text-[#5B5F6B]">{selectedReport.createdAt}</span>
                  </div>
                  <p className="text-xs bg-[#F7F7F9] p-2.5 rounded-xl text-[#1B1B1F] leading-relaxed">
                    <strong>বিবরণ:</strong> {selectedReport.description}
                  </p>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#5B5F6B]">অ্যাডমিন মন্তব্য / নোট:</label>
                    <input
                      type="text"
                      value={adminNoteInput}
                      onChange={(e) => setAdminNoteInput(e.target.value)}
                      placeholder="তদন্তের সিদ্ধান্ত বা মন্তব্য লিখুন..."
                      className="w-full h-8 px-2.5 bg-[#F7F7F9] rounded-lg text-xs text-[#1B1B1F] border border-[#E4E6EB] outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => handleAdminStatusUpdate('reviewing')}
                      disabled={isUpdatingStatus}
                      className="flex-1 py-1.5 rounded-xl bg-[#D9E2FF] text-[#0D58C9] font-bold text-[11px] hover:bg-[#D9E2FF]/80 cursor-pointer"
                    >
                      তদন্তে নিন
                    </button>
                    <button
                      onClick={() => handleAdminStatusUpdate('resolved')}
                      disabled={isUpdatingStatus}
                      className="flex-1 py-1.5 rounded-xl bg-[#E8F5E9] text-[#005938] font-bold text-[11px] hover:bg-[#E8F5E9]/80 cursor-pointer"
                    >
                      সমাধান (Resolved)
                    </button>
                    <button
                      onClick={() => handleAdminStatusUpdate('dismissed')}
                      disabled={isUpdatingStatus}
                      className="flex-1 py-1.5 rounded-xl bg-[#F0EDF2] text-[#5B5F6B] font-bold text-[11px] hover:bg-[#E4E6EB] cursor-pointer"
                    >
                      বাতিল (Dismiss)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
