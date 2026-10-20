'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowLeft,
  ShieldCheck,
  Send,
  Droplet,
  CheckCircle2,
  Lock,
  Smartphone,
  ChevronRight,
  Compass,
  Edit2,
  KeyRound,
  AlertCircle,
  Copy,
  Info,
  UserCheck
} from 'lucide-react';
import { toBengaliDigits } from '@/lib/bengali-utils';
import { BloodGroup, UserProfile } from '@/lib/types';
import { districtList } from '@/lib/data';
import {
  requestPhoneOtp,
  verifyPhoneOtp,
  registerRealUser,
  loginRealUser,
  isValidBdPhoneNumber,
  normalizePhoneNumber
} from '@/lib/services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: UserProfile) => void;
  initialMode?: 'login' | 'register';
  currentDistrict?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  initialMode = 'login',
  currentDistrict = 'বগুড়া',
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [step, setStep] = useState<'input' | 'otp'>('input');

  // Input states - strictly empty by default, no fake data!
  const [phoneInput, setPhoneInput] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('B+');
  const [selectedDistrict, setSelectedDistrict] = useState(currentDistrict);
  const [userRole, setUserRole] = useState<'donor' | 'recipient'>('donor');

  // OTP states
  const [otpInput, setOtpInput] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Timer countdown
  useEffect(() => {
    if (step === 'otp' && timerSeconds > 0) {
      const t = setInterval(() => setTimerSeconds((s) => s - 1), 1000);
      return () => clearInterval(t);
    }
  }, [step, timerSeconds]);

  if (!isOpen) return null;

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const normPhone = normalizePhoneNumber(phoneInput);
    if (!isValidBdPhoneNumber(normPhone)) {
      setErrorMessage('সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: ০১৭১২-৩৪৫৬৭৮)');
      return;
    }

    setIsSubmitting(true);
    const res = await loginRealUser(normPhone, password);
    setIsSubmitting(false);

    if (res.success && res.user) {
      setSuccessMessage(res.message || 'সফলভাবে লগইন হয়েছে!');
      setTimeout(() => {
        onSuccessLogin(res.user!);
        onClose();
      }, 700);
    } else {
      // If no account found, suggest registration or send OTP
      setErrorMessage(res.error || 'লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।');
    }
  };

  // Handle Registration Submit (sends OTP for verification)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName || fullName.trim().length < 2) {
      setErrorMessage('অনুগ্রহ করে আপনার আসল নাম লিখুন');
      return;
    }

    const normPhone = normalizePhoneNumber(phoneInput);
    if (!isValidBdPhoneNumber(normPhone)) {
      setErrorMessage('সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: ০১৭১২-৩৪৫৬৭৮)');
      return;
    }

    setIsSubmitting(true);
    const otpRes = await requestPhoneOtp(normPhone);
    setIsSubmitting(false);

    if (otpRes.success) {
      setGeneratedOtp(otpRes.otpCode || '123456');
      setStep('otp');
      setTimerSeconds(60);
      setSuccessMessage('সিকিউর ভেরিফিকেশন কোড প্রস্তুত করা হয়েছে।');
    } else {
      setErrorMessage(otpRes.error || 'ওটিপি পাঠাতে সমস্যা হয়েছে।');
    }
  };

  // Handle OTP Verification & Registration completion
  const handleVerifyAndComplete = async () => {
    setErrorMessage(null);
    if (!otpInput || otpInput.trim().length < 4) {
      setErrorMessage('অনুগ্রহ করে ৬ সংখ্যার সম্পূর্ণ ওটিপি কোডটি লিখুন');
      return;
    }

    setIsVerifying(true);
    const isValid = await verifyPhoneOtp(phoneInput, otpInput);

    if (!isValid) {
      setIsVerifying(false);
      setErrorMessage('ওটিপি কোডটি ভুল হয়েছে। আবার চেষ্টা করুন।');
      return;
    }

    // Complete real registration in Supabase
    const regRes = await registerRealUser({
      name: fullName,
      phone: phoneInput,
      bloodGroup,
      district: selectedDistrict,
      role: userRole,
      password: password || undefined,
    });

    setIsVerifying(false);

    if (regRes.success && regRes.user) {
      setSuccessMessage('আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে এবং ক্লাউড ডেটাবেসে সংরক্ষিত হয়েছে!');
      setTimeout(() => {
        onSuccessLogin(regRes.user!);
        onClose();
      }, 800);
    } else {
      setErrorMessage(regRes.error || 'নিবন্ধন সম্পন্ন করতে ব্যর্থ হয়েছে।');
    }
  };

  // 1-Click Paste OTP Code Helper
  const handlePasteOtp = () => {
    if (generatedOtp) {
      setOtpInput(generatedOtp);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white">
          <div className="flex items-center gap-2.5">
            {step === 'otp' ? (
              <button
                onClick={() => setStep('input')}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
            )}
            <div>
              <h2 className="font-bold text-sm leading-tight">
                {step === 'otp'
                  ? 'নিরাপত্তা ওটিপি যাচাই'
                  : authMode === 'login'
                  ? 'রক্তদাতা সিস্টেমে লগইন'
                  : 'নতুন রক্তদাতা নিবন্ধন'}
              </h2>
              <span className="text-[11px] text-white/80">
                সুপারবেস ক্লাউড ডেটাবেস দ্বারা সুরক্ষিত
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Mode Toggle Tabs (Login vs Register) */}
        {step === 'input' && (
          <div className="p-3 bg-gray-50 border-b border-gray-200/80">
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-200/70 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                লগইন করুন
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                নতুন অ্যাকাউন্ট তৈরি
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Success Message Alert */}
          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{successMessage}</p>
            </div>
          )}

          {/* ================= STEP 1: LOGIN FORM ================= */}
          {step === 'input' && authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="text-center py-1">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-2">
                  <Droplet className="w-7 h-7 fill-current" />
                </div>
                <h3 className="font-extrabold text-base text-gray-900">স্বাগতম রক্তদাতা প্ল্যাটফর্মে</h3>
                <p className="text-xs text-gray-500 mt-0.5">আপনার নিবন্ধিত মোবাইল নম্বর দিয়ে লগইন করুন</p>
              </div>

              {/* Mobile Phone Field */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-gray-700 block">মোবাইল নম্বর</label>
                <div className="h-12 bg-gray-50 rounded-2xl flex items-center px-3 gap-2.5 border border-gray-200 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 transition-all">
                  <span className="font-bold text-xs text-gray-600 shrink-0 flex items-center gap-1">
                    🇧🇩 +৮৮
                  </span>
                  <div className="w-px h-5 bg-gray-300" />
                  <input
                    type="tel"
                    placeholder="০১৭১২-৩৪৫৬৭৮"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    required
                    className="w-full bg-transparent font-bold text-sm text-gray-900 outline-none placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>
                <span className="text-[11px] text-gray-400">১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর লিখুন</span>
              </div>

              {/* Optional Password or PIN */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700">পাসওয়ার্ড বা পিন (ঐচ্ছিক)</label>
                  <span className="text-[10px] text-gray-400">নিরাপদ প্রবেশাধিকার</span>
                </div>
                <div className="h-12 bg-gray-50 rounded-2xl flex items-center px-3 gap-2.5 border border-gray-200 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 transition-all">
                  <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="password"
                    placeholder="পাসওয়ার্ড বা ৪-৬ ডিজিট পিন"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent font-medium text-sm text-gray-900 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Login CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>যাচাই করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <span>লগইন করুন</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Switch to Register link */}
              <div className="pt-2 text-center text-xs text-gray-500">
                <span>নতুন ব্যবহারকারী? </span>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="font-bold text-red-600 hover:underline cursor-pointer"
                >
                  নতুন অ্যাকাউন্ট খুলুন
                </button>
              </div>
            </form>
          )}

          {/* ================= STEP 1: REGISTRATION FORM ================= */}
          {step === 'input' && authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              
              {/* Full Name */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-gray-700">আপনার পূর্ণ নাম *</label>
                <input
                  type="text"
                  placeholder="যেমন: মো. শাকিল আহমেদ"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 placeholder:text-gray-400 placeholder:font-normal"
                />
              </div>

              {/* Mobile Phone */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-gray-700">মোবাইল নম্বর *</label>
                <div className="h-11 bg-gray-50 rounded-xl flex items-center px-3 gap-2 border border-gray-200 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100">
                  <span className="font-bold text-xs text-gray-600 shrink-0">🇧🇩 +৮৮</span>
                  <div className="w-px h-4 bg-gray-300" />
                  <input
                    type="tel"
                    placeholder="০১৭১২-৩৪৫৬৭৮"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    required
                    className="w-full bg-transparent font-bold text-sm text-gray-900 outline-none placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>
              </div>

              {/* Blood Group Grid */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-gray-700">রক্তের গ্রুপ *</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {bloodGroups.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setBloodGroup(bg)}
                      className={`h-9 rounded-xl font-black text-xs flex items-center justify-center transition-all cursor-pointer ${
                        bloodGroup === bg
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* District Selector */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-gray-700">আপনার জেলা *</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full h-11 px-3 bg-gray-50 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                >
                  {districtList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setUserRole('donor')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    userRole === 'donor'
                      ? 'border-red-600 bg-red-50/70 text-red-900 ring-1 ring-red-600'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <span className="font-bold text-xs block">🩸 রক্তদাতা</span>
                  <span className="text-[10px] text-gray-500">জরুরিতে রক্ত দিতে প্রস্তুত</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserRole('recipient')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    userRole === 'recipient'
                      ? 'border-red-600 bg-red-50/70 text-red-900 ring-1 ring-red-600'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <span className="font-bold text-xs block">🩺 গ্রহীতা</span>
                  <span className="text-[10px] text-gray-500">রক্তের প্রয়োজনে সাহায্যপ্রার্থী</span>
                </button>
              </div>

              {/* Registration CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50 mt-1"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>ওটিপি কোড তৈরি হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <span>পরবর্তী ধাপ: ওটিপি যাচাই</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= STEP 2: OTP VERIFICATION ================= */}
          {step === 'otp' && (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <Smartphone className="w-7 h-7" />
              </div>

              <div>
                <h3 className="font-extrabold text-base text-gray-900">৬ সংখ্যার ওটিপি কোড দিন</h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  নম্বর: <strong className="text-gray-900">{phoneInput}</strong>
                </p>
                <button
                  onClick={() => setStep('input')}
                  className="text-xs text-red-600 font-bold inline-flex items-center gap-1 hover:underline mt-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>নম্বর পরিবর্তন</span>
                </button>
              </div>

              {/* Educational Explanation Banner regarding Supabase SMS Gateway */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-left space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Info className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>ওটিপি এসএমএস তথ্য ও নোটিশ:</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  সুপারবেস ক্লাউডে সরাসরি ফোনে আসল এসএমএস পাঠানোর জন্য একটি পেইড এসএমএস গেটওয়ে (যেমন <strong>Twilio</strong>) প্রয়োজন হয় যা প্রতি এসএমএসে ফি কাটে। আপনার টেস্ট ও ইনস্ট্যান্ট ভেরিফিকেশনের সুবিধার্থে নিচে সরাসরি সিকিউরিটি ওটিপি কোডটি প্রদান করা হয়েছে:
                </p>
                
                {/* Instant Generated Security OTP Box */}
                {generatedOtp && (
                  <div className="mt-2 p-2.5 bg-white border border-amber-300 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 font-semibold block uppercase tracking-wider">
                        আপনার সিকিউর ওটিপি কোড:
                      </span>
                      <span className="font-mono text-base font-extrabold text-red-600 tracking-widest">
                        {generatedOtp}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handlePasteOtp}
                      className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center gap-1 hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>বসিয়ে দিন</span>
                    </button>
                  </div>
                )}
              </div>

              {/* OTP Input Field */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-gray-700 block">ওটিপি কোড লিখুন</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="৬ সংখ্যার কোড"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full h-12 text-center text-xl font-mono font-extrabold tracking-widest bg-gray-50 rounded-2xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                />
              </div>

              {/* Timer Countdown */}
              <div className="text-xs text-gray-500">
                {timerSeconds > 0 ? (
                  <p>
                    কোড মেয়াদ: <strong className="text-gray-900">{timerSeconds} সেকেন্ড</strong>
                  </p>
                ) : (
                  <button
                    onClick={() => {
                      setTimerSeconds(60);
                      requestPhoneOtp(phoneInput).then((r) => {
                        if (r.otpCode) setGeneratedOtp(r.otpCode);
                      });
                    }}
                    className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    পুনরায় নতুন ওটিপি পাঠান
                  </button>
                )}
              </div>

              {/* Verification Button */}
              <button
                type="button"
                onClick={handleVerifyAndComplete}
                disabled={isVerifying}
                className="w-full h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>যাচাই ও অ্যাকাউন্ট তৈরি হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <span>যাচাই সম্পন্ন করে প্রবেশ করুন</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Guest Mode option */}
          {step === 'input' && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-full p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-800 block leading-tight">
                      গেস্ট হিসেবে ব্রাউজ করুন
                    </span>
                    <span className="text-[10px] text-gray-500">
                      লগইন ছাড়াই রক্তের সন্ধান ও ডিরেক্টরি দেখুন
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          )}
        </div>

        {/* Security Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-[11px]">২৫৬-বিট SSL এনক্রিপশন ও সুপারবেস ডেটাবেস দ্বারা সুরক্ষিত</span>
        </div>
      </div>
    </div>
  );
};
