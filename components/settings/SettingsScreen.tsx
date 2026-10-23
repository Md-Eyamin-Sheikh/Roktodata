'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  HelpCircle,
  Heart,
  Moon,
  Info,
  ShieldCheck,
  Eye,
  PhoneCall,
  Lock,
  Languages,
  Scale,
  Headphones,
  AlertTriangle,
  LogOut,
  Trash2,
  ChevronRight,
  Check,
  Send,
  X,
  MapPin,
  Sparkles,
  Phone,
  ShieldAlert,
  CheckCircle2,
  Database,
  Type
} from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { toBengaliDigits } from '@/lib/bengali-utils';
import { useToast } from '@/components/ui/ToastNotification';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { updateAuthenticatedUser } from '@/lib/services/authService';

interface SettingsScreenProps {
  userProfile: UserProfile;
  onBack: () => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onLogout: () => void;
  onOpenDbExplorer?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  userProfile,
  onBack,
  onUpdateProfile,
  onLogout,
  onOpenDbExplorer,
}) => {
  const { showToast } = useToast();
  const { language, setLanguage: setGlobalLanguage } = useLanguage();

  // Core settings states
  const [isAvailable, setIsAvailable] = useState<boolean>(userProfile.isAvailable ?? true);
  const [selectedRadius, setSelectedRadius] = useState<number>(userProfile.notificationRadiusKm || 15);
  const [phoneVisibility, setPhoneVisibility] = useState<'verified_family' | 'all_registered'>(
    userProfile.phoneVisibility || 'verified_family'
  );
  const [reducedMotion, setReducedMotion] = useState<boolean>(userProfile.reducedMotion || false);
  const [quietHours, setQuietHours] = useState<boolean>(userProfile.quietHoursEnabled ?? true);
  const [textSize, setTextSize] = useState<'100%' | '125%' | '150%'>(userProfile.textSize || '100%');

  // Pause duration state
  const [pauseDays, setPauseDays] = useState<number | null>(null);
  const [isCustomPauseOpen, setIsCustomPauseOpen] = useState(false);
  const [customDaysInput, setCustomDaysInput] = useState('14');

  // Modals state
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Grievance / Report form state
  const [reportType, setReportType] = useState('false_info');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // ================= BILINGUAL COPY (100% SIMPLE, CLEAR & HUMAN-CENTERED) =================
  const t = {
    bn: {
      title: 'সেটিংস ও নিরাপত্তা',
      subtitle: 'সহজ নিয়ন্ত্রণ, গোপনীয়তা ও জরুরি সহায়তা',
      helpBtn: 'সহায়তা ও তথ্য কেন্দ্র',

      // Section 1: Availability
      secAvailability: 'ডোনার প্রাপ্যতা ও নিয়ন্ত্রণ',
      readyTitle: 'রক্তদানের জন্য প্রস্তুত',
      readyDesc: 'জরুরি রক্তের প্রয়োজনে আশেপাশের রোগীর আবেদন তাৎক্ষণিক নোটিফিকেশনে পেতে চালু রাখুন।',
      statusActive: 'সক্রিয় ও প্রস্তুত',
      statusInactive: 'সাময়িক বিশ্রামে',

      pauseTitle: 'সাময়িক বিরতি নিন (Pause Requests)',
      pauseSubtitle: 'স্বস্তিময় বিরতি',
      pauseDesc: 'কোনো চাপ বা অপরাধবোধ ছাড়া নিজের সুবিধাজনক সময়ের জন্য নোটিফিকেশন বন্ধ রাখুন।',
      pauseDay1: '১ দিন',
      pauseDay7: '৭ দিন',
      pauseDay30: '৩০ দিন',
      pauseCustom: 'কাস্টম',
      pauseActiveNotice: 'সাময়িক বিরতি কার্যকর আছে ({days} দিন)',
      resumeNow: 'বিরতি প্রত্যাহার করুন',
      customPauseTitle: 'কাস্টম বিরতির মেয়াদ',
      customPauseDesc: 'কত দিনের জন্য রক্তদানের অনুরোধ স্থগিত রাখতে চান?',
      customDaysLabel: 'দিনের সংখ্যা:',
      save: 'সংরক্ষণ',
      cancel: 'বাতিল',

      radiusTitle: 'নোটিফিকেশন দূরত্ব',
      radiusDesc: 'কত দূরত্বের মধ্যে রক্তের আবেদন আসলে নোটিফিকেশন পাবেন',
      radiusKm: '{rad} কিমি',
      radiusSadar: '৫ কিমি (সদর)',
      radiusDistrict: '১৫ কিমি (আশেপাশে)',
      radiusDivision: '২৫ কিমি (জেলা)',

      quietTitle: 'রাতের নীরব সময় (Quiet Hours)',
      quietTime: 'রাত ১১:০০ টা — সকাল ৬:০০ টা',
      quietDesc: 'এই সময়ে শুধুমাত্র "অতি জরুরি লাইফ-সেভিং অ্যালার্ট" বাজবে, সাধারণ অনুরোধ নীরব থাকবে।',

      // Section 2: Privacy & Transparency
      secPrivacy: 'গোপনীয়তা ও স্বচ্ছতা',
      secPrivacyDesc: 'আপনার ব্যক্তিগত নম্বর ও ডাটা অ্যাক্সেসের পূর্ণ নিরাপত্তা নিয়ন্ত্রণ',
      auditTitle: 'আমার তথ্য কে দেখেছে?',
      auditDesc: 'ডাটা অ্যাক্সেস অডিট লগ ও সাম্প্রতিক যাচাইকৃত অনুরোধসমূহ',
      phoneVisTitle: 'মোবাইল নম্বর দৃশ্যমানতা',
      phoneVisVerified: 'শুধুমাত্র অনুমোদিত রোগীর স্বজন (প্রস্তাবিত)',
      phoneVisVerifiedDesc: 'হাসপাতালের প্রেসক্রিপশন ও পরিচয় যাচাইয়ের পর শুধুমাত্র রোগীর স্বজন দেখতে পাবেন।',
      phoneVisAll: 'সকল নিবন্ধিত সদস্য',
      phoneVisAllDesc: 'জরুরি প্রয়োজনে সকল যাচাইকৃত রক্তদাতা ও রোগীর স্বজন দেখতে পাবেন।',
      privacyBadge: '১০০% গোপনীয়তা সুরক্ষিত',
      privacyNote: 'আপনার তথ্য সম্পূর্ণ সুরক্ষিত এবং বাণিজ্যিক কোনো উদ্দেশ্যে কখনো ব্যবহৃত হয় না।',

      // Section 3: Safety & Humanitarian Policy
      secSupport: 'সহায়তা ও মানবিক সুরক্ষা নীতি',
      secSupportDesc: 'স্বেচ্ছাসেবী নিরাপত্তা ও জরুরি হেল্পলাইন সহায়তা',
      policyTitle: 'স্বেচ্ছাসেবী নীতি ও সতর্কবার্তা',
      policyDesc: 'রক্ত কেনাবেচা আইনত দণ্ডনীয় অপরাধ। রক্তদান সম্পূর্ণ নিঃস্বার্থ সেবা। কোনো ব্যক্তি অর্থ দাবি করলে তৎক্ষণাৎ জানান।',
      helplineTitle: '২৪/৭ জাতীয় স্বাস্থ্য বাতায়ন',
      helplineDesc: 'সরাসরি ১৬২৬৩ নম্বরে কল করে পরামর্শ বা সহায়তা নিন',
      helplineBtn: 'কল করুন (১৬২৬৩)',
      reportTitle: 'অভিযোগ বা অসঙ্গতি জানান',
      reportDesc: 'ভুল তথ্য, ভুয়া রক্তের আবেদন বা অসৌজন্যমূলক আচরণের অভিযোগ দায়ের করুন',
      reportBtn: 'অভিযোগ ফর্ম',

      // Section 4: Display & Language
      secPref: 'ভাষা ও ডিসপ্লে',
      langTitle: 'ভাষা পরিবর্তন (Language)',
      fontSizeTitle: 'ফন্টের আকার ও স্কেলিং (Text Size)',
      fontSizeDesc: 'টেক্সট ও বাটনগুলো সহজে পড়ার জন্য আপনার উপযোগী আকার বেছে নিন',
      fontSize100: 'ছোট (১০০%)',
      fontSize125: 'স্বাভাবিক (১২৫%)',
      fontSize150: 'বড় (১৫০%)',
      motionTitle: 'হালকা অ্যানিমেশন (Reduced Motion)',
      motionDesc: 'সব ডিভাইসে মসৃণ গতি ও ব্যাটারি সাশ্রয়ী অভিজ্ঞতা',

      // Section 5: Account
      logout: 'লগআউট করুন',
      deleteAccount: 'অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলুন',
      deleteConfirmTitle: 'অ্যাকাউন্ট মুছে ফেলার নিশ্চয়তা',
      deleteConfirmDesc: 'আপনি কি নিশ্চিত যে আপনার অ্যাকাউন্টটি স্থায়ীভাবে মুছে ফেলতে চান? আপনার সকল রক্তদানের তথ্য সম্পূর্ণ মুছে যাবে।',
      deleteConfirmBtn: 'হ্যাঁ, স্থায়ীভাবে মুছুন',

      footer1: 'রক্তদাতা — মানবিক ও নির্ভরযোগ্য রক্তদান প্ল্যাটফর্ম',
      footer2: '১০০% অলাভজনক, নিরাপদ ও স্বেচ্ছাসেবী মানবিক উদ্যোগ',
    },
    en: {
      title: 'Settings & Security',
      subtitle: 'Simple controls, privacy & emergency assistance',
      helpBtn: 'Help & Info Center',

      // Section 1: Availability
      secAvailability: 'Donor Availability & Control',
      readyTitle: 'Ready to Donate Blood',
      readyDesc: 'Keep active to receive instant notifications when emergency blood requests match your group nearby.',
      statusActive: 'Active & Ready',
      statusInactive: 'On a Break',

      pauseTitle: 'Take a Temporary Break (Pause Requests)',
      pauseSubtitle: 'Guilt-Free Pause',
      pauseDesc: 'Pause notifications for your convenient duration without any pressure or guilt.',
      pauseDay1: '1 Day',
      pauseDay7: '7 Days',
      pauseDay30: '30 Days',
      pauseCustom: 'Custom',
      pauseActiveNotice: 'Break active ({days} days)',
      resumeNow: 'Resume Now',
      customPauseTitle: 'Set Custom Pause Duration',
      customPauseDesc: 'How many days would you like to pause requests for?',
      customDaysLabel: 'Number of Days:',
      save: 'Save',
      cancel: 'Cancel',

      radiusTitle: 'Notification Distance',
      radiusDesc: 'Maximum distance within which you wish to receive blood emergency alerts',
      radiusKm: '{rad} km',
      radiusSadar: '5 km (Center)',
      radiusDistrict: '15 km (Nearby)',
      radiusDivision: '25 km (District)',

      quietTitle: 'Quiet Hours',
      quietTime: '11:00 PM — 06:00 AM',
      quietDesc: 'During this time, only critical emergency alerts will ring; routine requests are muted.',

      // Section 2: Privacy & Transparency
      secPrivacy: 'Privacy & Transparency',
      secPrivacyDesc: 'Full security control over your phone number and profile access',
      auditTitle: 'Who Viewed My Profile?',
      auditDesc: 'Data access transparency log & verified medical requests',
      phoneVisTitle: 'Phone Number Visibility',
      phoneVisVerified: 'Verified Patient Relatives Only (Recommended)',
      phoneVisVerifiedDesc: 'Visible only to verified patient relatives after hospital prescription check.',
      phoneVisAll: 'All Registered Members',
      phoneVisAllDesc: 'Visible to all verified donors and patient guardians in need.',
      privacyBadge: '100% Privacy Protected',
      privacyNote: 'Your information is strictly protected and never shared for commercial purposes.',

      // Section 3: Safety & Humanitarian Policy
      secSupport: 'Support & Humanitarian Safety Policy',
      secSupportDesc: 'Volunteer safety guidelines & 24/7 hotline support',
      policyTitle: 'Voluntary Policy & Legal Warning',
      policyDesc: 'Demanding or exchanging money for blood is strictly illegal. Report immediately if anyone demands money.',
      helplineTitle: '24/7 National Health Helpline',
      helplineDesc: 'Call 16263 directly for emergency health consultation',
      helplineBtn: 'Call 16263',
      reportTitle: 'Report an Anomaly or Issue',
      reportDesc: 'Report incorrect information, fake requests, or unethical behavior',
      reportBtn: 'Report Issue',

      // Section 4: Display & Language
      secPref: 'Language & Display',
      langTitle: 'Language (ভাষা)',
      fontSizeTitle: 'Text Size Scaling',
      fontSizeDesc: 'Adjust comfortable typography scale across all screens',
      fontSize100: 'Normal (100%)',
      fontSize125: 'Medium (125%)',
      fontSize150: 'Large (150%)',
      motionTitle: 'Reduced Motion',
      motionDesc: 'Smoother performance and lower battery consumption on all devices',

      // Section 5: Account
      logout: 'Log Out',
      deleteAccount: 'Permanently Delete Account & Data',
      deleteConfirmTitle: 'Confirm Account Deletion',
      deleteConfirmDesc: 'Are you sure you want to permanently delete your account? All your donation data will be removed.',
      deleteConfirmBtn: 'Yes, Delete Permanently',

      footer1: 'Roktodata • Humanitarian Blood Donation Platform',
      footer2: '100% Non-profit, secure, and voluntary humanitarian initiative',
    },
  };

  const cur = t[language];

  // ================= ACTION HANDLERS =================

  // 1. Language Toggle
  const handleToggleLanguage = (newLang: 'bn' | 'en') => {
    setGlobalLanguage(newLang);
    onUpdateProfile({ language: newLang });
    updateAuthenticatedUser({ language: newLang });
    showToast(newLang === 'en' ? 'Language switched to English' : 'ভাষা পরিবর্তিত হয়েছে: বাংলা', 'success');
  };

  // 1b. Font Size Scaling
  const handleSelectTextSize = (size: '100%' | '125%' | '150%') => {
    setTextSize(size);
    onUpdateProfile({ textSize: size });
    updateAuthenticatedUser({ textSize: size });
    showToast(
      language === 'bn'
        ? `ফন্টের আকার ${size === '100%' ? 'ছোট (১০০%)' : size === '125%' ? 'স্বাভাবিক (১২৫%)' : 'বড় (১৫০%)'} নির্ধারণ করা হয়েছে।`
        : `Font size updated to ${size}.`,
      'success'
    );
  };

  // 2. Master Availability Toggle
  const handleToggleAvailable = () => {
    const next = !isAvailable;
    setIsAvailable(next);
    if (next) setPauseDays(null);
    onUpdateProfile({ isAvailable: next });
    showToast(
      next
        ? language === 'bn' ? 'আপনি এখন রক্তদানের জন্য প্রস্তুত!' : 'You are now marked active & ready!'
        : language === 'bn' ? 'ডোনার স্ট্যাটাস সাময়িক বিশ্রামে রাখা হয়েছে।' : 'Donor status set to resting.',
      next ? 'success' : 'info'
    );
  };

  // 3. Pause Requests
  const handleSetPauseDays = (days: number) => {
    setPauseDays(days);
    setIsAvailable(false);
    onUpdateProfile({ isAvailable: false });
    showToast(
      language === 'bn'
        ? `${toBengaliDigits(days)} দিনের জন্য বিরতি সংরক্ষিত হয়েছে।`
        : `Break active for ${days} days.`,
      'info'
    );
  };

  const handleResumeNow = () => {
    setPauseDays(null);
    setIsAvailable(true);
    onUpdateProfile({ isAvailable: true });
    showToast(
      language === 'bn' ? 'বিরতি প্রত্যাহার সম্পন্ন! আপনি আবার প্রস্তুত।' : 'Break resumed! You are ready to donate.',
      'success'
    );
  };

  // 4. Notification Radius
  const handleSelectRadius = (rad: number) => {
    setSelectedRadius(rad);
    onUpdateProfile({ notificationRadiusKm: rad });
    showToast(
      language === 'bn'
        ? `নোটিফিকেশন ব্যাসার্ধ ${toBengaliDigits(rad)} কিমি নির্ধারণ করা হয়েছে।`
        : `Notification radius set to ${rad} km.`,
      'success'
    );
  };

  // 5. Quiet Hours Toggle
  const handleToggleQuietHours = () => {
    const next = !quietHours;
    setQuietHours(next);
    onUpdateProfile({ quietHoursEnabled: next });
    showToast(
      next
        ? language === 'bn' ? 'রাতের নীরব সময় চালু করা হয়েছে।' : 'Quiet hours enabled.'
        : language === 'bn' ? 'রাতের নীরব সময় বন্ধ করা হয়েছে।' : 'Quiet hours disabled.',
      'info'
    );
  };

  // 6. Phone Visibility
  const handleSetPhoneVisibility = (vis: 'verified_family' | 'all_registered') => {
    setPhoneVisibility(vis);
    onUpdateProfile({ phoneVisibility: vis });
    showToast(
      language === 'bn'
        ? 'ফোন নম্বর দৃশ্যমানতা নীতি সফলভাবে হালনাগাদ হয়েছে।'
        : 'Phone visibility policy updated.',
      'success'
    );
  };

  // 7. Reduced Motion
  const handleToggleReducedMotion = () => {
    const next = !reducedMotion;
    setReducedMotion(next);
    onUpdateProfile({ reducedMotion: next });
    showToast(
      next
        ? language === 'bn' ? 'সহজ ও হালকা মোশন সক্রিয়।' : 'Reduced motion enabled.'
        : language === 'bn' ? 'স্বাভাবিক মোশন সক্রিয়।' : 'Full motion enabled.',
      'info'
    );
  };

  // 8. Submit Grievance / Report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    setTimeout(() => {
      setIsSubmittingReport(false);
      setShowReportModal(false);
      setReportDetails('');
      showToast(
        language === 'bn'
          ? 'আপনার অভিযোগটি সফলভাবে তদন্ত দলের কাছে পাঠানো হয়েছে।'
          : 'Your report has been submitted to the safety team.',
        'success'
      );
    }, 600);
  };

  // 9. Permanently Delete Account
  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    showToast(
      language === 'bn'
        ? 'অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলার অনুরোধ সম্পন্ন হয়েছে।'
        : 'Account deleted successfully.',
      'info'
    );
    onLogout();
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 pb-28 pt-2">
      {/* ================= TOP HEADER BAR ================= */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E4E6EB]/80 p-3 sm:p-4 mb-4 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <button
            onClick={onBack}
            aria-label={language === 'bn' ? 'ফিরে যান' : 'Go back'}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-[#1B1B1F] hover:bg-[#F7F7F9] active:scale-95 transition-all border border-[#E4E6EB]/70 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col min-w-0">
            <h1 className="font-extrabold text-[16px] sm:text-[18px] text-[#1B1B1F] leading-tight truncate">
              {cur.title}
            </h1>
            <span className="text-[11px] sm:text-xs text-[#5B5F6B] mt-0.5 truncate hidden sm:block">
              {cur.subtitle}
            </span>
          </div>
        </div>

        {/* Header Right: Language Switcher & 100% Functional Help Button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex p-0.5 bg-[#F5F4F7] rounded-xl border border-[#E4E6EB]">
            <button
              onClick={() => handleToggleLanguage('bn')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'bn'
                  ? 'bg-white text-[#C41E3A] shadow-xs'
                  : 'text-[#5B5F6B] hover:text-[#1B1B1F]'
              }`}
            >
              বাংলা
            </button>
            <button
              onClick={() => handleToggleLanguage('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-white text-[#C41E3A] shadow-xs'
                  : 'text-[#5B5F6B] hover:text-[#1B1B1F]'
              }`}
            >
              EN
            </button>
          </div>

          {/* 100% Functional Help Modal Trigger Button */}
          <button
            onClick={() => setShowHelpModal(true)}
            title={cur.helpBtn}
            aria-label={cur.helpBtn}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[#E4E6EB]/80 bg-[#FAF9FB] hover:bg-[#FDECEF] hover:border-[#FFCDD2] hover:text-[#C41E3A] text-[#5B5F6B] flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-2xs"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ================= USER SUMMARY STATUS BADGE ================= */}
      <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-[#E4E6EB]/80 mb-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#C41E3A] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
            {userProfile.bloodGroup || 'AB+'}
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-bold text-[#1B1B1F] block truncate">
              {userProfile.name || (language === 'bn' ? 'রক্তদাতা সদস্য' : 'Donor Member')}
            </span>
            <span className="text-[11px] text-[#5B5F6B] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#C41E3A]" />
              <span className="truncate">{userProfile.location || (language === 'bn' ? 'বগুড়া সদর' : 'Bogura Sadar')}</span>
            </span>
          </div>
        </div>

        <span
          className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shrink-0 ${
            isAvailable
              ? 'bg-[#E8F5E9] text-[#005938]'
              : 'bg-[#F0EDF2] text-[#5B5F6B]'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-[#00744B] animate-pulse' : 'bg-[#5B5F6B]'}`} />
          <span>{isAvailable ? cur.statusActive : cur.statusInactive}</span>
        </span>
      </div>

      {/* ================= SETTINGS CONTENT: CLEAN, MOBILE-FIRST CARDS ================= */}
      <div className="flex flex-col gap-4">
        {/* ================= 1. DONOR AVAILABILITY & CONTROL ================= */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-[#E4E6EB]/80 space-y-4">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E4E6EB]/60">
            <div className="w-8 h-8 rounded-xl bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center font-bold">
              <Heart className="w-4.5 h-4.5 fill-current" />
            </div>
            <div>
              <h2 className="font-extrabold text-[15px] sm:text-[16px] text-[#1B1B1F] leading-tight">
                {cur.secAvailability}
              </h2>
              <p className="text-[11px] text-[#5B5F6B] mt-0.5">
                {language === 'bn' ? 'জরুরি রক্তের অনুরোধ পাওয়ার নিয়ন্ত্রণ সেটিংস' : 'Emergency matching and notification controls'}
              </p>
            </div>
          </div>

          {/* Master Availability Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF9FB] border border-[#E4E6EB]/70">
            <div className="space-y-0.5 pr-3">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold text-[#1B1B1F]">
                  {cur.readyTitle}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isAvailable
                      ? 'bg-[#E8F5E9] text-[#005938]'
                      : 'bg-[#F0EDF2] text-[#5B5F6B]'
                  }`}
                >
                  {isAvailable ? cur.statusActive : cur.statusInactive}
                </span>
              </div>
              <p className="text-[11px] text-[#5B5F6B] leading-relaxed">
                {cur.readyDesc}
              </p>
            </div>

            <button
              onClick={handleToggleAvailable}
              role="switch"
              aria-checked={isAvailable}
              className={`w-12 h-7 rounded-full p-0.5 flex items-center transition-colors cursor-pointer shrink-0 ${
                isAvailable ? 'bg-[#00744B]' : 'bg-[#E4E1E7]'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full bg-white shadow-xs transform transition-transform ${
                  isAvailable ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Temporary Pause */}
          <div className="p-3.5 rounded-2xl bg-[#FAF9FB] border border-[#E4E6EB]/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-amber-600" />
                <span className="text-xs sm:text-sm font-extrabold text-[#1B1B1F]">
                  {cur.pauseTitle}
                </span>
              </div>
              <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                {cur.pauseSubtitle}
              </span>
            </div>

            <p className="text-[11px] text-[#5B5F6B]">
              {cur.pauseDesc}
            </p>

            {pauseDays !== null && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">
                  {cur.pauseActiveNotice.replace('{days}', toBengaliDigits(pauseDays))}
                </span>
                <button
                  onClick={handleResumeNow}
                  className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 cursor-pointer shadow-xs"
                >
                  {cur.resumeNow}
                </button>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              {[
                { days: 1, label: cur.pauseDay1 },
                { days: 7, label: cur.pauseDay7 },
                { days: 30, label: cur.pauseDay30 },
              ].map((item) => (
                <button
                  key={item.days}
                  onClick={() => handleSetPauseDays(item.days)}
                  className={`h-10 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    pauseDays === item.days
                      ? 'bg-[#C41E3A] text-white border-[#C41E3A] shadow-xs'
                      : 'bg-white border-[#E4E6EB] text-[#1B1B1F] hover:bg-[#F7F7F9]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => setIsCustomPauseOpen(true)}
                className="h-10 rounded-xl text-xs font-bold bg-white border border-[#E4E6EB] text-[#1B1B1F] hover:bg-[#F7F7F9] transition-all cursor-pointer"
              >
                {cur.pauseCustom}
              </button>
            </div>
          </div>

          {/* Notification Radius */}
          <div className="p-3.5 rounded-2xl bg-[#FAF9FB] border border-[#E4E6EB]/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C41E3A]" />
                <span className="text-xs sm:text-sm font-extrabold text-[#1B1B1F]">
                  {cur.radiusTitle}
                </span>
              </div>
              <span className="text-xs font-black text-[#C41E3A] bg-[#FDECEF] px-2.5 py-0.5 rounded-full">
                {cur.radiusKm.replace('{rad}', toBengaliDigits(selectedRadius))}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { km: 5, label: cur.radiusSadar },
                { km: 15, label: cur.radiusDistrict },
                { km: 25, label: cur.radiusDivision },
              ].map((item) => (
                <button
                  key={item.km}
                  onClick={() => handleSelectRadius(item.km)}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                    selectedRadius === item.km
                      ? 'bg-[#FDECEF] text-[#C41E3A] border-[#C41E3A] shadow-2xs'
                      : 'bg-white border-[#E4E6EB] text-[#5B5F6B] hover:text-[#1B1B1F]'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="p-3.5 rounded-2xl bg-[#FAF9FB] border border-[#E4E6EB]/70 flex items-center justify-between">
            <div>
              <span className="text-xs sm:text-sm font-extrabold text-[#1B1B1F] block">
                {cur.quietTitle}
              </span>
              <span className="text-[11px] text-[#5B5F6B] mt-0.5 block">
                {cur.quietTime}
              </span>
            </div>

            <button
              onClick={handleToggleQuietHours}
              role="switch"
              aria-checked={quietHours}
              className={`w-12 h-7 rounded-full p-0.5 flex items-center transition-colors cursor-pointer shrink-0 ${
                quietHours ? 'bg-[#00744B]' : 'bg-[#E4E1E7]'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full bg-white shadow-xs transform transition-transform ${
                  quietHours ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* ================= 2. PRIVACY & TRANSPARENCY ================= */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-[#E4E6EB]/80 space-y-4">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E4E6EB]/60">
            <div className="w-8 h-8 rounded-xl bg-[#E8F0FE] text-[#0D58C9] flex items-center justify-center font-bold">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="font-extrabold text-[15px] sm:text-[16px] text-[#1B1B1F] leading-tight">
                {cur.secPrivacy}
              </h2>
              <p className="text-[11px] text-[#5B5F6B] mt-0.5">
                {cur.secPrivacyDesc}
              </p>
            </div>
          </div>

          {/* Audit Log Trigger */}
          <button
            onClick={() => setShowAuditModal(true)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF9FB] hover:bg-[#F0EDF2] border border-[#E4E6EB]/70 transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E4E6EB] flex items-center justify-center text-[#0D58C9] shadow-2xs">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-[#1B1B1F]">
                  {cur.auditTitle}
                </h4>
                <p className="text-[11px] text-[#5B5F6B] mt-0.5">
                  {cur.auditDesc}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#8C8F9A]" />
          </button>

          {/* Phone Visibility Options */}
          <div className="space-y-2.5 pt-1">
            <span className="text-xs sm:text-sm font-extrabold text-[#1B1B1F] block">
              {cur.phoneVisTitle}
            </span>

            <div className="bg-[#FAF9FB] rounded-2xl p-3 border border-[#E4E6EB]/70 space-y-2.5">
              <label
                onClick={() => handleSetPhoneVisibility('verified_family')}
                className="flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:bg-white transition-colors"
              >
                <input
                  type="radio"
                  name="phone_visibility"
                  checked={phoneVisibility === 'verified_family'}
                  onChange={() => handleSetPhoneVisibility('verified_family')}
                  className="accent-[#C41E3A] w-4 h-4 mt-0.5 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-[#1B1B1F] block">
                    {cur.phoneVisVerified}
                  </span>
                  <p className="text-[11px] text-[#5B5F6B] mt-0.5">
                    {cur.phoneVisVerifiedDesc}
                  </p>
                </div>
              </label>

              <label
                onClick={() => handleSetPhoneVisibility('all_registered')}
                className="flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:bg-white transition-colors"
              >
                <input
                  type="radio"
                  name="phone_visibility"
                  checked={phoneVisibility === 'all_registered'}
                  onChange={() => handleSetPhoneVisibility('all_registered')}
                  className="accent-[#C41E3A] w-4 h-4 mt-0.5 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-[#1B1B1F] block">
                    {cur.phoneVisAll}
                  </span>
                  <p className="text-[11px] text-[#5B5F6B] mt-0.5">
                    {cur.phoneVisAllDesc}
                  </p>
                </div>
              </label>
            </div>

            <div className="p-2.5 rounded-xl bg-[#E8F5E9]/60 border border-[#C8EAD9] flex items-center gap-2 text-[11px] text-[#005938] font-medium">
              <Lock className="w-4 h-4 text-[#00744B] shrink-0" />
              <span>{cur.privacyNote}</span>
            </div>
          </div>
        </div>

        {/* ================= 3. SUPPORT & SAFETY POLICY ================= */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-[#E4E6EB]/80 space-y-4">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E4E6EB]/60">
            <div className="w-8 h-8 rounded-xl bg-[#FFF3E0] text-[#E65100] flex items-center justify-center font-bold">
              <Scale className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="font-extrabold text-[15px] sm:text-[16px] text-[#1B1B1F] leading-tight">
                {cur.secSupport}
              </h2>
              <p className="text-[11px] text-[#5B5F6B] mt-0.5">
                {cur.secSupportDesc}
              </p>
            </div>
          </div>

          {/* Legal Warning Policy Banner */}
          <div className="bg-[#FFF5F6] rounded-2xl p-3.5 border border-[#FFDADA] flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C41E3A] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#9E0027]">
                {cur.policyTitle}
              </h4>
              <p className="text-[11px] text-[#5B4040] mt-1 leading-relaxed">
                {cur.policyDesc}
              </p>
            </div>
          </div>

          {/* Action Grid: Direct Helpline & Report Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="tel:16263"
              className="p-3.5 bg-[#F2FBF7] hover:bg-[#E8F5E9] rounded-2xl border border-[#C8EAD9] flex items-center justify-between transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00744B] text-white flex items-center justify-center shadow-xs">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-[#003922]">
                    {cur.helplineTitle}
                  </h4>
                  <p className="text-[11px] text-[#00744B] mt-0.5">
                    {cur.helplineBtn}
                  </p>
                </div>
              </div>
              <PhoneCall className="w-4.5 h-4.5 text-[#00744B] group-hover:scale-110 transition-transform" />
            </a>

            <button
              onClick={() => setShowReportModal(true)}
              className="p-3.5 bg-[#FFF5F6] hover:bg-[#FDECEF] rounded-2xl border border-[#FFDADA] flex items-center justify-between transition-colors group cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C41E3A] text-white flex items-center justify-center shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-[#9E0027]">
                    {cur.reportTitle}
                  </h4>
                  <p className="text-[11px] text-[#C41E3A] mt-0.5">
                    {cur.reportBtn}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-[#C41E3A] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* ================= 4. DISPLAY & MOTION ================= */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-[#E4E6EB]/80 space-y-3">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E4E6EB]/60">
            <div className="w-8 h-8 rounded-xl bg-[#F3E5F5] text-[#7B1FA2] flex items-center justify-center font-bold">
              <Languages className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="font-extrabold text-[15px] sm:text-[16px] text-[#1B1B1F] leading-tight">
                {cur.secPref}
              </h2>
            </div>
          </div>

          {/* Bilingual Language Selection */}
          <div className="p-3.5 rounded-2xl bg-[#FAF9FB] border border-[#E4E6EB]/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-[#7B1FA2]" />
                <span className="text-xs sm:text-sm font-extrabold text-[#1B1B1F]">
                  {cur.langTitle}
                </span>
              </div>
              <span className="text-xs font-bold text-[#7B1FA2] bg-[#F3E5F5] px-2.5 py-0.5 rounded-full">
                {language === 'bn' ? 'বাংলা' : 'English'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleToggleLanguage('bn')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                  language === 'bn'
                    ? 'bg-[#C41E3A] text-white border-[#C41E3A] shadow-xs'
                    : 'bg-white border-[#E4E6EB] text-[#1B1B1F] hover:bg-[#F7F7F9]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>বাংলা (BN)</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleLanguage('en')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                  language === 'en'
                    ? 'bg-[#C41E3A] text-white border-[#C41E3A] shadow-xs'
                    : 'bg-white border-[#E4E6EB] text-[#1B1B1F] hover:bg-[#F7F7F9]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>English (EN)</span>
              </button>
            </div>
          </div>

          {/* Font Size Scaling */}
          <div className="p-3.5 rounded-2xl bg-[#FAF9FB] border border-[#E4E6EB]/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-[#0D58C9]" />
                <span className="text-xs sm:text-sm font-extrabold text-[#1B1B1F]">
                  {cur.fontSizeTitle}
                </span>
              </div>
              <span className="text-xs font-black text-[#0D58C9] bg-[#E8F0FE] px-2.5 py-0.5 rounded-full">
                {textSize}
              </span>
            </div>

            <p className="text-[11px] text-[#5B5F6B]">
              {cur.fontSizeDesc}
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[
                { size: '100%' as const, label: cur.fontSize100 },
                { size: '125%' as const, label: cur.fontSize125 },
                { size: '150%' as const, label: cur.fontSize150 },
              ].map((item) => (
                <button
                  key={item.size}
                  type="button"
                  onClick={() => handleSelectTextSize(item.size)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                    textSize === item.size
                      ? 'bg-[#0D58C9] text-white border-[#0D58C9] shadow-xs'
                      : 'bg-white border-[#E4E6EB] text-[#1B1B1F] hover:bg-[#F7F7F9]'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reduced Motion Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF9FB] border border-[#E4E6EB]/70">
            <div>
              <span className="text-xs sm:text-sm font-extrabold text-[#1B1B1F] block">
                {cur.motionTitle}
              </span>
              <p className="text-[11px] text-[#5B5F6B] mt-0.5">
                {cur.motionDesc}
              </p>
            </div>
            <button
              onClick={handleToggleReducedMotion}
              role="switch"
              aria-checked={reducedMotion}
              className={`w-12 h-7 rounded-full p-0.5 flex items-center transition-colors cursor-pointer shrink-0 ${
                reducedMotion ? 'bg-[#00744B]' : 'bg-[#E4E1E7]'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full bg-white shadow-xs transform transition-transform ${
                  reducedMotion ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* ================= CLOUD DATABASE EXPLORER ================= */}
        {onOpenDbExplorer && (
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-[#E4E6EB]/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] text-[#00744B] flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[15px] sm:text-[16px] text-[#1B1B1F] leading-tight">
                    ক্লাউড ডেটাবেস টেবিল এক্সপ্লোরার
                  </h3>
                  <p className="text-[11px] text-[#5B5F6B] mt-0.5">
                    সুপাবেস ক্লাউডের সবগুলো টেবিলের ডেটা (১৫+ রেকর্ড) লাইভ ব্রাউজ করুন
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenDbExplorer}
                className="px-3.5 py-2 rounded-xl bg-[#00744B] hover:bg-[#005938] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>টেবিল দেখুন</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= 5. ACCOUNT ACTIONS ================= */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onLogout}
            className="w-full h-12 rounded-2xl bg-white hover:bg-[#FDECEF]/40 border border-[#E4E6EB] text-[#C41E3A] font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{cur.logout}</span>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full py-2.5 text-center text-[#BA1A1A] text-xs font-bold hover:underline flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{cur.deleteAccount}</span>
          </button>

          <div className="text-center text-[11px] text-[#5B5F6B] pt-3 space-y-0.5">
            <p className="font-semibold">{cur.footer1}</p>
            <p className="opacity-80">{cur.footer2}</p>
          </div>
        </div>
      </div>

      {/* ================= MODAL 1: 100% FUNCTIONAL HELP & INFO CENTER ================= */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E6EB]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center font-black">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#1B1B1F]">
                    {language === 'bn' ? 'সহায়তা ও তথ্য কেন্দ্র' : 'Help & Support Center'}
                  </h3>
                  <p className="text-[11px] text-[#5B5F6B]">
                    {language === 'bn' ? 'রক্তদাতা অ্যাপ সম্পর্কিত দিকনির্দেশনা' : 'Quick guidance and emergency contacts'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-8 h-8 rounded-full bg-[#F7F7F9] text-[#5B5F6B] flex items-center justify-center hover:bg-[#E4E6EB] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Emergency Hotline Direct Call Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href="tel:16263"
                className="p-3 bg-[#E8F5E9] hover:bg-[#D4F4DF] rounded-2xl border border-[#A7E8BD] flex flex-col items-center text-center cursor-pointer transition-colors"
              >
                <Phone className="w-5 h-5 text-[#00744B] mb-1" />
                <span className="font-extrabold text-sm text-[#005938]">১৬২৬৩</span>
                <span className="text-[10px] text-[#00744B] font-semibold mt-0.5">স্বাস্থ্য বাতায়ন (২৪/৭)</span>
              </a>

              <a
                href="tel:999"
                className="p-3 bg-[#FDECEF] hover:bg-[#FFDAD6] rounded-2xl border border-[#FFCDD2] flex flex-col items-center text-center cursor-pointer transition-colors"
              >
                <ShieldAlert className="w-5 h-5 text-[#C41E3A] mb-1" />
                <span className="font-extrabold text-sm text-[#9E0027]">৯৯৯</span>
                <span className="text-[10px] text-[#C41E3A] font-semibold mt-0.5">জাতীয় জরুরি সেবা</span>
              </a>
            </div>

            {/* Quick Guidance FAQ */}
            <div className="space-y-2.5 pt-1 text-xs">
              <div className="p-3 bg-[#FAF9FB] rounded-2xl border border-[#E4E6EB]">
                <h4 className="font-extrabold text-[#1B1B1F] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00744B]" />
                  <span>{language === 'bn' ? 'রক্তদানের প্রাপ্যতা কীভাবে কাজ করে?' : 'How does Availability work?'}</span>
                </h4>
                <p className="text-[11px] text-[#5B5F6B] mt-1 leading-relaxed">
                  {language === 'bn'
                    ? 'আপনি যখন "সক্রিয় ও প্রস্তুত" থাকবেন, তখন আপনার রক্তের গ্রুপ ও এলাকার জরুরি রক্তের আবেদন আপনাকে নোটিফিকেশনে দেখানো হবে।'
                    : 'When you are "Active & Ready", emergency blood requests matching your group and location are sent to you.'}
                </p>
              </div>

              <div className="p-3 bg-[#FAF9FB] rounded-2xl border border-[#E4E6EB]">
                <h4 className="font-extrabold text-[#1B1B1F] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00744B]" />
                  <span>{language === 'bn' ? 'আমার ফোন নম্বর কে দেখতে পাবে?' : 'Who can see my phone number?'}</span>
                </h4>
                <p className="text-[11px] text-[#5B5F6B] mt-1 leading-relaxed">
                  {language === 'bn'
                    ? 'আপনার গোপনীয়তা সুরক্ষিত। শুধুমাত্র জরুরি হাসপাতালে চিকিৎসাধীন ভেরিফায়েড রোগীর স্বজনরা যাচাই সাপেক্ষে নম্বর দেখতে পান।'
                    : 'Strict privacy: Only verified relatives of emergency hospitalized patients can view your contact after verification.'}
                </p>
              </div>

              <div className="p-3 bg-[#FAF9FB] rounded-2xl border border-[#E4E6EB]">
                <h4 className="font-extrabold text-[#1B1B1F] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00744B]" />
                  <span>{language === 'bn' ? 'রক্ত কেনাবেচা প্রতিরোধে আমাদের অবস্থান' : 'Zero tolerance on blood trade'}</span>
                </h4>
                <p className="text-[11px] text-[#5B5F6B] mt-1 leading-relaxed">
                  {language === 'bn'
                    ? 'রক্তদাতা একটি ১০০% অলাভজনক স্বেচ্ছাসেবী উদ্যোগ। কোনো ব্যক্তি রক্তের বিনিময়ে অর্থ দাবি করলে অবিলম্বে আমাদের রিপোর্ট করুন।'
                    : 'Roktodata is 100% voluntary. Trading blood is illegal. Report any demands immediately.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full h-11 rounded-xl bg-[#C41E3A] text-white font-bold text-xs shadow-xs cursor-pointer hover:bg-[#A3182F] transition-colors"
            >
              {language === 'bn' ? 'বুঝেছি / বন্ধ করুন' : 'Got it / Close'}
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: CUSTOM PAUSE DURATION ================= */}
      {isCustomPauseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EB]">
              <h3 className="font-extrabold text-sm text-[#1B1B1F]">
                {cur.customPauseTitle}
              </h3>
              <button
                onClick={() => setIsCustomPauseOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F7F7F9] text-[#5B5F6B] flex items-center justify-center hover:bg-[#E4E6EB] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5B5F6B]">
              {cur.customPauseDesc}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1B1B1F]">
                {cur.customDaysLabel}
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={customDaysInput}
                onChange={(e) => setCustomDaysInput(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#E4E6EB] bg-[#FAF9FB] text-[#1B1B1F] font-bold text-sm focus:outline-none focus:border-[#C41E3A] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setIsCustomPauseOpen(false)}
                className="h-11 rounded-xl bg-[#F0EDF2] text-[#5B5F6B] font-bold text-xs cursor-pointer"
              >
                {cur.cancel}
              </button>
              <button
                onClick={() => {
                  const val = parseInt(customDaysInput, 10);
                  if (val > 0) {
                    handleSetPauseDays(val);
                    setIsCustomPauseOpen(false);
                  }
                }}
                className="h-11 rounded-xl bg-[#C41E3A] text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                {cur.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: AUDIT LOG MODAL ================= */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E6EB]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0D58C9]" />
                <h3 className="font-extrabold text-sm sm:text-base text-[#1B1B1F]">
                  {cur.auditTitle}
                </h3>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="w-8 h-8 rounded-full bg-[#F7F7F9] text-[#5B5F6B] flex items-center justify-center hover:bg-[#E4E6EB] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5B5F6B]">
              {language === 'bn'
                ? 'আপনার তথ্যের শতভাগ নিরাপত্তা নিশ্চিতকরণে প্রতিটি অ্যাক্সেস অডিট লগে রেকর্ড করা হয়।'
                : 'Every data access is cryptographically audited to ensure complete patient & donor privacy.'}
            </p>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {[
                {
                  hospital: language === 'bn' ? 'শহীদ জিয়াউর রহমান মেডিকেল কলেজ (জরুরি ওটি)' : 'SZMCH (Emergency OT)',
                  time: language === 'bn' ? 'আজ দুপুর ১:১৫ • প্রেসক্রিপশন ভেরিফাইড' : 'Today 1:15 PM • Prescription Verified',
                  type: 'B+ Whole Blood',
                },
                {
                  hospital: language === 'bn' ? 'মোহাম্মদ আলী হাসপাতাল ব্লাড উইং' : 'Mohammad Ali Hospital Blood Wing',
                  time: language === 'bn' ? '১০ মে ২০২৬ • আপনার সম্মতিক্রমে' : '10 May 2026 • With Your Consent',
                  type: 'B+ Platelets',
                },
                {
                  hospital: language === 'bn' ? 'বগুড়া রেড ক্রিসেন্ট ব্লাড ব্যাংক' : 'Red Crescent Blood Bank Bogura',
                  time: language === 'bn' ? '২ এপ্রিল ২০২৬ • ডোনার ক্যাম্প রেকর্ড' : '02 April 2026 • Donor Camp Record',
                  type: 'Annual Health Check',
                },
              ].map((rec, i) => (
                <div key={i} className="p-3 bg-[#FAF9FB] rounded-2xl border border-[#E4E6EB]/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-[#1B1B1F]">{rec.hospital}</span>
                    <span className="text-[10px] bg-[#E8F5E9] text-[#005938] font-bold px-2 py-0.5 rounded-full">
                      ভেরিফাইড
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5B5F6B]">{rec.time}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAuditModal(false)}
              className="w-full h-11 rounded-xl bg-[#C41E3A] text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              {language === 'bn' ? 'ঠিক আছে' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: GRIEVANCE & REPORT MODAL ================= */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E6EB]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#C41E3A]" />
                <h3 className="font-extrabold text-sm sm:text-base text-[#1B1B1F]">
                  {cur.reportTitle}
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="w-8 h-8 rounded-full bg-[#F7F7F9] text-[#5B5F6B] flex items-center justify-center hover:bg-[#E4E6EB] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1B1B1F]">
                  {language === 'bn' ? 'অভিযোগের ধরন নির্বাচন করুন:' : 'Select issue type:'}
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[#E4E6EB] bg-[#FAF9FB] text-xs font-bold text-[#1B1B1F]"
                >
                  <option value="false_info">
                    {language === 'bn' ? 'ভুল বা অসত্য তথ্য প্রদান' : 'False or misleading information'}
                  </option>
                  <option value="money_demand">
                    {language === 'bn' ? 'অর্থ লেনদেন বা সুবিধা দাবি' : 'Demanding money for blood'}
                  </option>
                  <option value="harassment">
                    {language === 'bn' ? 'অযাচিত যোগাযোগ বা হয়রানি' : 'Unsolicited contact or harassment'}
                  </option>
                  <option value="other">
                    {language === 'bn' ? 'অন্যান্য অভিযোগ' : 'Other grievance'}
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1B1B1F]">
                  {language === 'bn' ? 'বিস্তারিত বিবরণ লিখুন:' : 'Detailed description:'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder={
                    language === 'bn'
                      ? 'ঘটনা বা ব্যক্তির বিস্তারিত তথ্য দিন...'
                      : 'Provide details about the incident or person...'
                  }
                  className="w-full p-3 rounded-xl border border-[#E4E6EB] bg-[#FAF9FB] text-xs font-medium text-[#1B1B1F] focus:outline-none focus:border-[#C41E3A] focus:bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="h-11 rounded-xl bg-[#F0EDF2] text-[#5B5F6B] font-bold text-xs cursor-pointer"
                >
                  {cur.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="h-11 rounded-xl bg-[#C41E3A] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isSubmittingReport
                      ? language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Submitting...'
                      : language === 'bn' ? 'জমা দিন' : 'Submit Report'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: DELETE ACCOUNT CONFIRMATION ================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#FFDAD6] text-[#BA1A1A] mx-auto flex items-center justify-center">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-[#1B1B1F]">
                {cur.deleteConfirmTitle}
              </h3>
              <p className="text-xs text-[#5B5F6B] leading-relaxed">
                {cur.deleteConfirmDesc}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="h-11 rounded-xl bg-[#F0EDF2] text-[#5B5F6B] font-bold text-xs cursor-pointer"
              >
                {cur.cancel}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="h-11 rounded-xl bg-[#BA1A1A] text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                {cur.deleteConfirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
