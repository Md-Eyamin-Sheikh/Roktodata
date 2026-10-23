'use client';

import React, { useState } from 'react';
import {
  X,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  Send,
  Droplet,
  MapPin,
  Lock,
  Unlock,
  MessageCircle,
} from 'lucide-react';
import { Donor } from '@/lib/types';
import { formatBengaliPhone, toBengaliDigits } from '@/lib/bengali-utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface AuthorizedContactModalProps {
  donor: Donor | null;
  isOpen: boolean;
  onClose: () => void;
  onSendDirectRequest: (donor: Donor) => void;
}

export const AuthorizedContactModal: React.FC<AuthorizedContactModalProps> = ({
  donor,
  isOpen,
  onClose,
  onSendDirectRequest,
}) => {
  const { language, formatDigits } = useLanguage();
  const [hasConsented, setHasConsented] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset state when modal closes
  const handleClose = () => {
    setHasConsented(false);
    setIsUnlocked(false);
    setCopied(false);
    onClose();
  };

  if (!isOpen || !donor) return null;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(donor.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanPhone = donor.phone.replace(/\D/g, '');
  const isHiddenByDonor = Boolean(donor.privacyHidePhone);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="authorized-contact-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="absolute inset-0" onClick={handleClose} />

      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-[#E4E6EB]/80 z-10 animate-in slide-in-from-bottom duration-300 max-h-[92vh] flex flex-col">
        {/* Mobile handle indicator */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-[#E4E6EB]" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#E4E6EB]/80 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] text-[#00744B] flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 id="authorized-contact-title" className="font-extrabold text-base text-[#1B1B1F]">
                {language === 'bn' ? 'অনুমোদিত যোগাযোগ ও নিরাপত্তা' : 'Authorized Contact & Privacy'}
              </h3>
              <p className="text-[11px] text-[#5B5F6B]">
                {language === 'bn'
                  ? 'রোগীর প্রকৃত চিকিৎসার উদ্দেশ্যে নিরাপদ যোগাযোগ'
                  : 'Safe coordination for medical emergencies'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            className="w-8.5 h-8.5 rounded-full bg-[#F7F7F9] hover:bg-[#F0EDF2] text-[#5B5F6B] flex items-center justify-center transition-all cursor-pointer active:scale-90"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Donor Summary Card */}
          <div className="p-3.5 rounded-2xl bg-[#F7F7F9] border border-[#E4E6EB]/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center font-black text-lg shrink-0 shadow-2xs">
                {donor.avatarText || donor.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-bold text-sm text-[#1B1B1F] truncate">{donor.name}</h4>
                  {donor.isVerified && (
                    <span className="w-4 h-4 rounded-full bg-[#0D58C9] text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#5B5F6B] flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#C41E3A] shrink-0" />
                  <span className="truncate">{donor.location}</span>
                </p>
              </div>
            </div>

            {/* Blood group pill */}
            <div className="shrink-0 text-center px-3 py-1.5 rounded-xl bg-white border border-[#FFCDD2] shadow-2xs">
              <span className="text-base font-black text-[#C41E3A] block leading-none">
                {donor.bloodGroup}
              </span>
              <span className="text-[9px] font-extrabold text-[#9E0027] uppercase mt-0.5 block">
                {language === 'bn' ? 'গ্রুপ' : 'GROUP'}
              </span>
            </div>
          </div>

          {/* Privacy & Anti-Harassment Notice */}
          <div className="p-3.5 rounded-2xl bg-[#FFF9FA] border border-[#FFCDD2]/80 space-y-2">
            <div className="flex items-center gap-2 text-[#9E0027] font-bold text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#C41E3A]" />
              <span>{language === 'bn' ? 'রক্তদাতা সুরক্ষা নীতিমালা' : 'Donor Protection Guidelines'}</span>
            </div>
            <ul className="text-xs text-[#5B5F6B] space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>
                {language === 'bn'
                  ? 'রক্ত কেনাবেচা দণ্ডনীয় অপরাধ। রক্ত সম্পূর্ণ বিনামূল্যে ও মানবিক উদ্দেশ্যে দান করতে হবে।'
                  : 'Selling blood is strictly illegal. Donation is 100% voluntary and humanitarian.'}
              </li>
              <li>
                {language === 'bn'
                  ? 'অনাকাঙ্ক্ষিত বা অপ্রাসঙ্গিক যোগাযোগ করা হলে আপনার অ্যাকাউন্ট স্থগিত হতে পারে।'
                  : 'Unsolicited harassment or spam will result in instant account suspension.'}
              </li>
            </ul>
          </div>

          {/* If Donor strictly hid phone for privacy */}
          {isHiddenByDonor ? (
            <div className="p-4 rounded-2xl bg-[#E8F0FE] border border-[#D2E3FC] text-center space-y-3">
              <div className="w-11 h-11 rounded-full bg-[#1A73E8]/10 text-[#1A73E8] flex items-center justify-center mx-auto">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-[#1B1B1F]">
                  {language === 'bn'
                    ? 'ডোনার সরাসরি কল বন্ধ রেখেছেন'
                    : 'Direct Calling is Restricted by Donor'}
                </h5>
                <p className="text-xs text-[#5B5F6B] mt-1 leading-relaxed">
                  {language === 'bn'
                    ? 'এই রক্তদাতা প্ল্যাটফর্মের মাধ্যমে সরাসরি অনুরোধ পেতে পছন্দ করেন। আপনি নিচে ক্লিক করে সরাসরি জরুরি রক্তের আবেদন পাঠাতে পারেন।'
                    : 'This donor prefers in-app blood requests over direct phone calls. Send an instant blood request below.'}
                </p>
              </div>

              <button
                onClick={() => {
                  onSendDirectRequest(donor);
                  handleClose();
                }}
                className="w-full h-11 rounded-xl bg-[#C41E3A] hover:bg-[#A3182F] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{language === 'bn' ? 'সরাসরি রক্তের অনুরোধ পাঠান' : 'Send Emergency Request'}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Consent Checkbox */}
              {!isUnlocked ? (
                <div className="space-y-3 pt-1">
                  <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F7F7F9] border border-[#E4E6EB] cursor-pointer hover:bg-white transition-all select-none">
                    <input
                      type="checkbox"
                      checked={hasConsented}
                      onChange={(e) => setHasConsented(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#C41E3A] cursor-pointer"
                    />
                    <span className="text-xs text-[#1B1B1F] leading-relaxed font-medium">
                      {language === 'bn'
                        ? 'আমি অঙ্গীকার করছি এটি রোগীর জরুরি চিকিৎসার উদ্দেশ্যে এবং আমি রক্তদাতার সাথে শালীনভাবে কথা বলব।'
                        : 'I certify that this call is exclusively for genuine patient blood needs.'}
                    </span>
                  </label>

                  <button
                    onClick={() => setIsUnlocked(true)}
                    disabled={!hasConsented}
                    className="w-full h-12 rounded-2xl bg-[#00744B] hover:bg-[#005938] disabled:bg-[#D5D8E0] disabled:text-[#8E929E] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>
                      {language === 'bn' ? 'ফোন নম্বর আনলক করুন' : 'Unlock Contact Information'}
                    </span>
                  </button>
                </div>
              ) : (
                /* Unlocked Contact Details Panel */
                <div className="p-4 rounded-2xl bg-[#E8F5E9]/60 border border-[#A5D6A7] space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#005938] flex items-center gap-1.5">
                      <Unlock className="w-4 h-4" />
                      <span>{language === 'bn' ? 'অনুমোদিত যোগাযোগের নম্বর:' : 'Authorized Phone Number:'}</span>
                    </span>
                    <span className="text-[10px] bg-[#00744B] text-white px-2 py-0.5 rounded-full font-bold">
                      {language === 'bn' ? 'যাচাইকৃত' : 'Verified'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#C8E6C9] flex items-center justify-between gap-2 shadow-2xs">
                    <span className="font-mono font-black text-lg text-[#1B1B1F] tracking-wide">
                      {formatBengaliPhone(donor.phone)}
                    </span>
                    <button
                      onClick={handleCopyPhone}
                      className="px-3 py-1.5 rounded-lg bg-[#F7F7F9] hover:bg-[#E4E6EB] text-[#5B5F6B] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#00744B]" />
                          <span className="text-[#00744B]">{language === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'কপি' : 'Copy'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Action Buttons Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`tel:${donor.phone}`}
                      className="h-11 rounded-xl bg-[#00744B] hover:bg-[#005938] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98 transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{language === 'bn' ? 'সরাসরি কল' : 'Call Now'}</span>
                    </a>

                    <button
                      onClick={() => {
                        onSendDirectRequest(donor);
                        handleClose();
                      }}
                      className="h-11 rounded-xl bg-[#C41E3A] hover:bg-[#A3182F] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>{language === 'bn' ? 'অনুরোধ পাঠান' : 'Direct Request'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-[#FAF9FB] border-t border-[#E4E6EB] flex items-center justify-between text-[11px] text-[#5B5F6B] shrink-0">
          <span>
            {language === 'bn'
              ? 'জরুরি হটলাইন: ১৬২৬৩ (স্বাস্থ্য বাতায়ন) • ৯৯৯'
              : 'Emergency: 16263 (Health Line) • 999'}
          </span>
          <button
            onClick={handleClose}
            className="text-xs font-bold text-[#5B5F6B] hover:text-[#1B1B1F] cursor-pointer"
          >
            {language === 'bn' ? 'বাতিল' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
};
