'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowLeft,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Droplet,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Heart,
  ChevronRight,
  Send,
  RefreshCw,
} from 'lucide-react';
import { BloodGroup, UserProfile } from '@/lib/types';
import { districtList } from '@/lib/data';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithOAuth,
  sendPasswordResetEmail,
  completeDonorContactInfo,
  normalizePhoneNumber,
  isValidBdPhoneNumber,
  isValidEmail,
  formatBdPhoneDisplay,
} from '@/lib/services/authService';
import { useLanguage } from '@/lib/i18n/LanguageContext';

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
  currentDistrict = 'বগুড়া সদর',
}) => {
  const { language, formatDigits } = useLanguage();

  // Mode: 'login' | 'register' | 'forgot' | 'complete_contact'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'complete_contact'>(initialMode);
  // Multi-step Registration Wizard: Step 1 (Personal & Contact), Step 2 (Blood & Location), Step 3 (Security & Confirm)
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('B+');
  const [selectedDistrict, setSelectedDistrict] = useState(currentDistrict);
  const [isDonor, setIsDonor] = useState(true);

  // Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset states on open/close
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRegisterStep(1);
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsLoading(false);
      setSocialLoading(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  // Handle Email Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isValidEmail(email)) {
      setErrorMessage(
        language === 'bn'
          ? 'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।'
          : 'Please enter a valid email address.'
      );
      return;
    }

    if (!password) {
      setErrorMessage(
        language === 'bn'
          ? 'অনুগ্রহ করে পাসওয়ার্ড লিখুন।'
          : 'Please enter your password.'
      );
      return;
    }

    setIsLoading(true);
    const res = await loginWithEmail(email, password);
    setIsLoading(false);

    if (res.success && res.user) {
      setSuccessMessage(res.message || (language === 'bn' ? 'লগইন সফল হয়েছে!' : 'Login successful!'));
      if (res.needsContactDetails) {
        setTimeout(() => {
          setMode('complete_contact');
        }, 600);
      } else {
        setTimeout(() => {
          onSuccessLogin(res.user!);
          onClose();
        }, 700);
      }
    } else {
      setErrorMessage(res.error || (language === 'bn' ? 'লগইন ব্যর্থ হয়েছে।' : 'Login failed.'));
    }
  };

  // Multi-step Registration Navigation & Validation
  const handleStep1Next = () => {
    setErrorMessage(null);
    if (!fullName || fullName.trim().length < 2) {
      setErrorMessage(
        language === 'bn'
          ? 'অনুগ্রহ করে আপনার আসল পূর্ণ নাম লিখুন।'
          : 'Please enter your full legal name.'
      );
      return;
    }

    const normPhone = normalizePhoneNumber(phone);
    if (!isValidBdPhoneNumber(normPhone)) {
      setErrorMessage(
        language === 'bn'
          ? 'জরুরি যোগাযোগের জন্য সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: ০১৭১২-৩৪৫৬৭৮)।'
          : 'Please provide a valid 11-digit Bangladesh mobile number (e.g., 01712-345678).'
      );
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage(
        language === 'bn'
          ? 'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা প্রদান করুন।'
          : 'Please enter a valid email address.'
      );
      return;
    }

    setRegisterStep(2);
  };

  const handleStep2Next = () => {
    setErrorMessage(null);
    if (!bloodGroup) {
      setErrorMessage(
        language === 'bn'
          ? 'অনুগ্রহ করে আপনার রক্তের গ্রুপ নির্বাচন করুন।'
          : 'Please select your blood group.'
      );
      return;
    }
    if (!selectedDistrict) {
      setErrorMessage(
        language === 'bn'
          ? 'অনুগ্রহ করে আপনার জেলা / এলাকা নির্বাচন করুন।'
          : 'Please select your district / area.'
      );
      return;
    }
    setRegisterStep(3);
  };

  // Handle Email Registration (Final Submission in Step 3)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate Step 1 fields
    if (!fullName || fullName.trim().length < 2) {
      setRegisterStep(1);
      setErrorMessage(
        language === 'bn'
          ? 'অনুগ্রহ করে আপনার আসল পূর্ণ নাম লিখুন।'
          : 'Please enter your full legal name.'
      );
      return;
    }

    const normPhone = normalizePhoneNumber(phone);
    if (!isValidBdPhoneNumber(normPhone)) {
      setRegisterStep(1);
      setErrorMessage(
        language === 'bn'
          ? 'জরুরি যোগাযোগের জন্য সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: ০১৭১২-৩৪৫৬৭৮)।'
          : 'Please provide a valid 11-digit Bangladesh mobile number (e.g., 01712-345678).'
      );
      return;
    }

    if (!isValidEmail(email)) {
      setRegisterStep(1);
      setErrorMessage(
        language === 'bn'
          ? 'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা প্রদান করুন।'
          : 'Please enter a valid email address.'
      );
      return;
    }

    // Validate Step 3 fields
    if (!password || password.length < 6) {
      setErrorMessage(
        language === 'bn'
          ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'
          : 'Password must be at least 6 characters long.'
      );
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      setErrorMessage(
        language === 'bn'
          ? 'পাসওয়ার্ড দুটি মেলেনি। অনুগ্রহ করে আবার পরীক্ষা করুন।'
          : 'Passwords do not match. Please verify.'
      );
      return;
    }

    setIsLoading(true);
    const res = await registerWithEmail({
      name: fullName.trim(),
      email: email.trim(),
      password,
      phone: normPhone,
      bloodGroup,
      district: selectedDistrict,
      role: isDonor ? 'donor' : 'recipient',
    });
    setIsLoading(false);

    if (res.success && res.user) {
      setSuccessMessage(
        res.message ||
          (language === 'bn'
            ? 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে এবং সুপারবেসে সংরক্ষিত হয়েছে!'
            : 'Account created successfully and synced to Supabase!')
      );
      setTimeout(() => {
        onSuccessLogin(res.user!);
        onClose();
      }, 900);
    } else {
      setErrorMessage(res.error || (language === 'bn' ? 'নিবন্ধন ব্যর্থ হয়েছে।' : 'Registration failed.'));
    }
  };

  // Handle Social Login (Google / Facebook)
  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setSocialLoading(provider);

    const res = await loginWithOAuth(provider);
    setSocialLoading(null);

    if (!res.success) {
      setErrorMessage(res.error || 'সোশ্যাল লগইন প্রক্রিয়াকরণে সমস্যা হয়েছে।');
    } else {
      setSuccessMessage(
        language === 'bn'
          ? `${provider === 'google' ? 'গুগল' : 'ফেসবুক'} এর সাথে সংযোগ করা হচ্ছে...`
          : `Connecting to ${provider === 'google' ? 'Google' : 'Facebook'}...`
      );
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isValidEmail(email)) {
      setErrorMessage(
        language === 'bn'
          ? 'অনুগ্রহ করে সঠিক ইমেইল ঠিকানা দিন।'
          : 'Please enter a valid email address.'
      );
      return;
    }

    setIsLoading(true);
    const res = await sendPasswordResetEmail(email);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage(
        res.message ||
          (language === 'bn'
            ? 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।'
            : 'Password reset link sent to your email.')
      );
    } else {
      setErrorMessage(res.error || 'রিসেট লিংক পাঠাতে সমস্যা হয়েছে।');
    }
  };

  // Handle Social Login Contact Completion
  const handleCompleteContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const normPhone = normalizePhoneNumber(phone);
    if (!isValidBdPhoneNumber(normPhone)) {
      setErrorMessage(
        language === 'bn'
          ? 'জরুরি রক্তদানের যোগাযোগের জন্য সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: ০১৭১২-৩৪৫৬৭৮)।'
          : 'Please enter a valid 11-digit Bangladesh mobile number.'
      );
      return;
    }

    setIsLoading(true);
    const res = await completeDonorContactInfo(normPhone, bloodGroup, selectedDistrict);
    setIsLoading(false);

    if (res.success && res.user) {
      setSuccessMessage(
        language === 'bn'
          ? 'মোবাইল নম্বর ও তথ্য সফলভাবে সংরক্ষিত হয়েছে!'
          : 'Contact information saved successfully!'
      );
      setTimeout(() => {
        onSuccessLogin(res.user!);
        onClose();
      }, 700);
    } else {
      setErrorMessage(res.error || 'তথ্য সংরক্ষণ করা সম্ভব হয়নি।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border border-[#E4E6EB]/80 animate-in zoom-in-95 duration-200">
        
        {/* ================= MODAL TOP GRADIENT HEADER ================= */}
        <div className="relative px-5 py-4 bg-gradient-to-r from-[#9E0027] via-[#C41E3A] to-[#BA1A1A] text-white overflow-hidden shrink-0">
          {/* Subtle Ambient Decorative Circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-black/10 blur-md pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {mode === 'forgot' || mode === 'complete_contact' || (mode === 'register' && registerStep > 1) ? (
                <button
                  type="button"
                  onClick={() => {
                    if (mode === 'register' && registerStep > 1) {
                      setRegisterStep((prev) => (prev - 1) as 1 | 2 | 3);
                      setErrorMessage(null);
                    } else {
                      setMode('login');
                    }
                  }}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center shadow-xs">
                  <Droplet className="w-5 h-5 fill-current text-white" />
                </div>
              )}

              <div>
                <h2 className="font-extrabold text-[16px] sm:text-[17px] leading-tight flex items-center gap-1.5">
                  <span>
                    {mode === 'login' && (language === 'bn' ? 'রক্তদাতা অ্যাকাউন্টে প্রবেশ' : 'Sign in to Roktodata')}
                    {mode === 'register' &&
                      (language === 'bn'
                        ? `নতুন অ্যাকাউন্ট (ধাপ ${formatDigits(registerStep)}/৩)`
                        : `Create Account (Step ${registerStep}/3)`)}
                    {mode === 'forgot' && (language === 'bn' ? 'পাসওয়ার্ড উদ্ধার' : 'Reset Password')}
                    {mode === 'complete_contact' && (language === 'bn' ? 'যোগাযোগের তথ্য নিশ্চিতকরণ' : 'Complete Contact Info')}
                  </span>
                </h2>
                <span className="text-[11px] text-white/85 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>
                    {language === 'bn' ? 'সুপারবেস ক্লাউড ডেটাবেস দ্বারা সুরক্ষিত' : 'Secured by Supabase Cloud'}
                  </span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="বন্ধ করুন"
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= MODE SWITCHER TABS (Login vs Register) ================= */}
        {(mode === 'login' || mode === 'register') && (
          <div className="p-2.5 bg-[#FAF9FB] border-b border-[#E4E6EB]/80">
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#EBE9EE] rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'login'
                    ? 'bg-white text-[#9E0027] shadow-xs'
                    : 'text-[#5B5F6B] hover:text-[#1B1B1F]'
                }`}
              >
                <span>{language === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setRegisterStep(1);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'register'
                    ? 'bg-white text-[#9E0027] shadow-xs'
                    : 'text-[#5B5F6B] hover:text-[#1B1B1F]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C41E3A]" />
                <span>{language === 'bn' ? 'নতুন অ্যাকাউন্ট' : 'Register'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= MODAL BODY CONTENT ================= */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] flex items-center gap-2 text-xs text-[#005938] animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#00744B] shrink-0" />
              <span className="font-semibold leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-[#FFDAD6]/60 border border-[#FFDAD6] flex items-center gap-2 text-xs text-[#BA1A1A] animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-[#BA1A1A] shrink-0" />
              <span className="font-semibold leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* ================= 1. SOCIAL LOGIN BUTTONS (Google & Facebook) ================= */}
          {(mode === 'login' || (mode === 'register' && registerStep === 1)) && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                {/* Google Button */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={Boolean(socialLoading) || isLoading}
                  className="w-full h-11 px-3 rounded-2xl bg-white hover:bg-[#F7F7F9] border border-[#E4E6EB] hover:border-[#D1D5DB] text-[#1B1B1F] text-xs font-bold flex items-center justify-center gap-2 shadow-2xs active:scale-97 transition-all cursor-pointer disabled:opacity-60"
                >
                  {socialLoading === 'google' ? (
                    <RefreshCw className="w-4 h-4 text-[#C41E3A] animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Google</span>
                </button>

                {/* Facebook Button */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  disabled={Boolean(socialLoading) || isLoading}
                  className="w-full h-11 px-3 rounded-2xl bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs active:scale-97 transition-all cursor-pointer disabled:opacity-60"
                >
                  {socialLoading === 'facebook' ? (
                    <RefreshCw className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )}
                  <span>Facebook</span>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-2 pt-1 pb-1">
                <div className="flex-1 h-px bg-[#E4E6EB]" />
                <span className="text-[11px] font-semibold text-[#5B5F6B] uppercase tracking-wider">
                  {mode === 'register'
                    ? (language === 'bn' ? 'অথবা ৩টি সহজ ধাপে ইমেইল দিয়ে' : 'Or step-by-step with Email')
                    : (language === 'bn' ? 'অথবা ইমেইল দিয়ে' : 'Or with Email')}
                </span>
                <div className="flex-1 h-px bg-[#E4E6EB]" />
              </div>
            </div>
          )}

          {/* ================= 2. EMAIL LOGIN VIEW ================= */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-[#1B1B1F] mb-1">
                  {language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'} *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full h-11 pl-10 pr-3 rounded-2xl bg-[#F7F7F9] border border-[#E4E6EB] text-xs text-[#1B1B1F] outline-none focus:border-[#C41E3A] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#1B1B1F]">
                    {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'} *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] text-[#C41E3A] hover:underline font-semibold cursor-pointer"
                  >
                    {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pl-10 pr-10 rounded-2xl bg-[#F7F7F9] border border-[#E4E6EB] text-xs text-[#1B1B1F] outline-none focus:border-[#C41E3A] focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#9E0027] to-[#C41E3A] hover:from-[#80001F] hover:to-[#B01A33] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all cursor-pointer disabled:opacity-50 mt-1"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{language === 'bn' ? 'লগইন হচ্ছে...' : 'Signing in...'}</span>
                  </>
                ) : (
                  <>
                    <span>{language === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= 3. REGISTRATION VIEW (3-STEP WIZARD) ================= */}
          {mode === 'register' && (
            <div className="space-y-4">
              {/* Step Progress Indicator Bar */}
              <div className="bg-[#FAF9FB] p-3 rounded-2xl border border-[#E4E6EB]/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#9E0027] bg-[#FDECEF] px-2.5 py-0.5 rounded-full">
                      {language === 'bn' ? `ধাপ ${formatDigits(registerStep)} / ৩` : `Step ${registerStep} of 3`}
                    </span>
                    <span className="text-xs font-bold text-[#1B1B1F]">
                      {registerStep === 1 && (language === 'bn' ? 'ব্যক্তিগত ও যোগাযোগ' : 'Identity & Contact')}
                      {registerStep === 2 && (language === 'bn' ? 'রক্তের গ্রুপ ও এলাকা' : 'Blood & Location')}
                      {registerStep === 3 && (language === 'bn' ? 'নিরাপত্তা ও নিশ্চিতকরণ' : 'Security & Confirm')}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#9E0027]">
                    {registerStep === 1 && (language === 'bn' ? '১/৩' : 'Step 1')}
                    {registerStep === 2 && (language === 'bn' ? '২/৩' : 'Step 2')}
                    {registerStep === 3 && (language === 'bn' ? '৩/৩' : 'Step 3')}
                  </span>
                </div>

                {/* Visual Step Progress Line */}
                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${registerStep >= 1 ? 'bg-[#C41E3A]' : 'bg-[#E4E6EB]'}`} />
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${registerStep >= 2 ? 'bg-[#C41E3A]' : 'bg-[#E4E6EB]'}`} />
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${registerStep >= 3 ? 'bg-[#C41E3A]' : 'bg-[#E4E6EB]'}`} />
                </div>
              </div>

              {/* ----------------- STEP 1: IDENTITY & CONTACT ----------------- */}
              {registerStep === 1 && (
                <div className="space-y-3.5 animate-in fade-in slide-in-from-right-3 duration-200">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#1B1B1F] mb-1">
                      {language === 'bn' ? 'আপনার পূর্ণ নাম' : 'Full Name'} *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={language === 'bn' ? 'যেমন: মো: আরিফুল ইসলাম' : 'e.g. John Doe'}
                        className="w-full h-11 pl-10 pr-3 rounded-2xl bg-[#F7F7F9] border border-[#E4E6EB] text-xs text-[#1B1B1F] outline-none focus:border-[#C41E3A] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Mandatory Mobile Number */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#1B1B1F] flex items-center gap-1">
                        <span>{language === 'bn' ? 'সচল মোবাইল নম্বর' : 'Mobile Number'}</span>
                        <span className="text-[#C41E3A]">*</span>
                      </label>
                      <span className="text-[10px] bg-[#FDECEF] text-[#C41E3A] px-2 py-0.5 rounded-full font-bold">
                        {language === 'bn' ? 'জরুরি যোগাযোগের জন্য' : 'Required for Contact'}
                      </span>
                    </div>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full h-11 pl-10 pr-3 rounded-2xl bg-[#F7F7F9] border border-[#E4E6EB] text-xs text-[#1B1B1F] outline-none focus:border-[#C41E3A] focus:bg-white transition-colors font-medium"
                      />
                    </div>
                    <p className="text-[10.5px] text-[#5B5F6B] mt-1 leading-normal">
                      {language === 'bn'
                        ? 'রক্তদানের জরুরি প্রয়োজনে যাতে রোগী বা হাসপাতালের স্বজন সরাসরি যোগাযোগ করতে পারে।'
                        : 'Needed for emergency communication between patient family and donor.'}
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-[#1B1B1F] mb-1">
                      {language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'} *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@mail.com"
                        className="w-full h-11 pl-10 pr-3 rounded-2xl bg-[#F7F7F9] border border-[#E4E6EB] text-xs text-[#1B1B1F] outline-none focus:border-[#C41E3A] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Step 1 Next Button */}
                  <button
                    type="button"
                    onClick={handleStep1Next}
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#9E0027] to-[#C41E3A] hover:from-[#80001F] hover:to-[#B01A33] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all cursor-pointer mt-2"
                  >
                    <span>{language === 'bn' ? 'পরবর্তী ধাপ (রক্তের গ্রুপ ও এলাকা)' : 'Next (Blood & Location)'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ----------------- STEP 2: BLOOD GROUP & LOCATION ----------------- */}
              {registerStep === 2 && (
                <div className="space-y-3.5 animate-in fade-in slide-in-from-right-3 duration-200">
                  {/* Blood Group Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#1B1B1F]">
                        {language === 'bn' ? 'রক্তের গ্রুপ নির্বাচন করুন' : 'Select Blood Group'} *
                      </label>
                      <span className="text-[11px] font-bold text-[#C41E3A] bg-[#FDECEF] px-2 py-0.5 rounded-md">
                        {bloodGroup}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {bloodGroups.map((bg) => (
                        <button
                          key={bg}
                          type="button"
                          onClick={() => setBloodGroup(bg)}
                          className={`h-10 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center ${
                            bloodGroup === bg
                              ? 'bg-[#C41E3A] text-white shadow-xs scale-102 ring-2 ring-[#C41E3A]/30'
                              : 'bg-[#F7F7F9] text-[#1B1B1F] hover:bg-[#EBE9EE] border border-[#E4E6EB]'
                          }`}
                        >
                          {bg}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* District Selection */}
                  <div>
                    <label className="block text-xs font-bold text-[#1B1B1F] mb-1">
                      {language === 'bn' ? 'আপনার জেলা / এলাকা' : 'District / Area'} *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#F7F7F9] border border-[#E4E6EB] text-xs text-[#1B1B1F] outline-none focus:border-[#C41E3A] focus:bg-white transition-colors cursor-pointer"
                      >
                        {districtList.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Role Checkbox */}
                  <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F7F7F9] border border-[#E4E6EB] cursor-pointer hover:bg-white transition-colors">
                    <input
                      type="checkbox"
                      checked={isDonor}
                      onChange={(e) => setIsDonor(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-[#C41E3A] accent-[#C41E3A] cursor-pointer shrink-0"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs text-[#1B1B1F] font-bold">
                        {language === 'bn'
                          ? 'স্বেচ্ছাসেবী রক্তদাতা হিসেবে যুক্ত হতে প্রস্তুত'
                          : 'List me as an active voluntary blood donor'}
                      </span>
                      <span className="text-[10.5px] text-[#5B5F6B] mt-0.5">
                        {language === 'bn'
                          ? 'আপনার জেলায় রক্তের জরুরি প্রয়োজনে রোগীরা আপনাকে খুঁজে পাবে।'
                          : 'Patients in your district can reach out when your blood type is needed.'}
                      </span>
                    </div>
                  </label>

                  {/* Navigation Buttons */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setRegisterStep(1);
                      }}
                      className="h-12 rounded-2xl bg-[#F7F7F9] hover:bg-[#EBE9EE] text-[#1B1B1F] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-[#E4E6EB] active:scale-98 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{language === 'bn' ? 'পূর্ববর্তী' : 'Back'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleStep2Next}
                      className="h-12 rounded-2xl bg-gradient-to-r from-[#9E0027] to-[#C41E3A] hover:from-[#80001F] hover:to-[#B01A33] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-all cursor-pointer"
                    >
                      <span>{language === 'bn' ? 'পরবর্তী (পাসওয়ার্ড)' : 'Next (Security)'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ----------------- STEP 3: SECURITY & CONFIRMATION ----------------- */}
              {registerStep === 3 && (
                <form onSubmit={handleRegister} className="space-y-3.5 animate-in fade-in slide-in-from-right-3 duration-200">
                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-[#1B1B1F] mb-1">
                      {language === 'bn' ? 'গোপন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'Password (min 6 chars)'} *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-11 pl-10 pr-10 rounded-2xl bg-[#F7F7F9] border border-[#E4E6EB] text-xs text-[#1B1B1F] outline-none focus:border-[#C41E3A] focus:bg-white transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-[#1B1B1F] mb-1">
                      {language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'} *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-11 pl-10 pr-10 rounded-2xl bg-[#F7F7F9] border border-[#E4E6EB] text-xs text-[#1B1B1F] outline-none focus:border-[#C41E3A] focus:bg-white transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Summary Review Card */}
                  <div className="p-3 bg-[#FCF9F9] rounded-2xl border border-red-100 space-y-1.5 text-xs">
                    <span className="font-extrabold text-[11px] text-[#9E0027] uppercase tracking-wider block mb-1">
                      {language === 'bn' ? '📋 আপনার তথ্যের সারসংক্ষেপ' : '📋 Profile Summary'}
                    </span>
                    <div className="flex justify-between items-center text-[#1B1B1F]">
                      <span className="text-[#5B5F6B]">{language === 'bn' ? 'নাম:' : 'Name:'}</span>
                      <span className="font-bold">{fullName}</span>
                    </div>
                    <div className="flex justify-between items-center text-[#1B1B1F]">
                      <span className="text-[#5B5F6B]">{language === 'bn' ? 'মোবাইল:' : 'Phone:'}</span>
                      <span className="font-bold font-mono">{formatBdPhoneDisplay(phone)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[#1B1B1F]">
                      <span className="text-[#5B5F6B]">{language === 'bn' ? 'রক্তের গ্রুপ:' : 'Blood Group:'}</span>
                      <span className="font-black bg-[#C41E3A] text-white px-2 py-0.5 rounded-md text-[11px]">
                        {bloodGroup}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[#1B1B1F]">
                      <span className="text-[#5B5F6B]">{language === 'bn' ? 'এলাকা:' : 'Area:'}</span>
                      <span className="font-bold">{selectedDistrict}</span>
                    </div>
                    <div className="flex justify-between items-center text-[#1B1B1F]">
                      <span className="text-[#5B5F6B]">{language === 'bn' ? 'ভূমিকা:' : 'Role:'}</span>
                      <span className="font-semibold text-emerald-700">
                        {isDonor
                          ? (language === 'bn' ? 'স্বেচ্ছাসেবী রক্তদাতা' : 'Voluntary Donor')
                          : (language === 'bn' ? 'সাধারণ সদস্য' : 'Standard Member')}
                      </span>
                    </div>
                  </div>

                  {/* Navigation & Submit Buttons */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setRegisterStep(2);
                      }}
                      className="h-12 rounded-2xl bg-[#F7F7F9] hover:bg-[#EBE9EE] text-[#1B1B1F] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-[#E4E6EB] active:scale-98 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{language === 'bn' ? 'পূর্ববর্তী' : 'Back'}</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="h-12 rounded-2xl bg-gradient-to-r from-[#9E0027] to-[#C41E3A] hover:from-[#80001F] hover:to-[#B01A33] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{language === 'bn' ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating...'}</span>
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4 fill-current text-white" />
                          <span>{language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ================= 4. FORGOT PASSWORD VIEW ================= */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-[#5B5F6B] leading-relaxed">
                {language === 'bn'
                  ? 'আপনার অ্যাকাউন্টের নিবন্ধিত ইমেইল ঠিকানাটি নিচে লিখুন। আমরা আপনাকে পাসওয়ার্ড পরিবর্তন করার জন্য একটি সুরক্ষিত লিংক পাঠাব।'
                  : 'Enter your registered email address below. We will send you a secure password reset link.'}
              </p>

              <div>
                <label className="block text-xs font-bold text-[#1B1B1F] mb-1">
                  {language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'} *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full h-11 pl-10 pr-3 rounded-2xl bg-[#F7F7F9] border border-[#E4E6EB] text-xs text-[#1B1B1F] outline-none focus:border-[#C41E3A] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-2xl bg-[#9E0027] hover:bg-[#80001F] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{language === 'bn' ? 'রিসেট লিংক পাঠান' : 'Send Reset Link'}</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full py-2 text-xs font-bold text-[#5B5F6B] hover:text-[#1B1B1F] text-center cursor-pointer"
              >
                {language === 'bn' ? '← লগইনে ফিরে যান' : '← Back to Sign In'}
              </button>
            </form>
          )}

          {/* ================= 5. COMPLETE SOCIAL LOGIN CONTACT INFO ================= */}
          {mode === 'complete_contact' && (
            <form onSubmit={handleCompleteContact} className="space-y-4">
              <div className="p-3 bg-[#FDECEF] rounded-2xl border border-[#FFDAD6] text-xs text-[#9E0027] leading-relaxed">
                {language === 'bn'
                  ? 'মানবিক রক্তদান কার্যক্রমে জরুরি প্রয়োজনে রোগী ও হাসপাতালের সাথে সরাসরি যোগাযোগের জন্য আপনার সচল মোবাইল নম্বর ও রক্তের গ্রুপ নিশ্চিত করুন।'
                  : 'Please provide your active mobile number and blood group for emergency hospital and patient coordination.'}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-[#1B1B1F] mb-1">
                  {language === 'bn' ? 'সচল মোবাইল নম্বর' : 'Mobile Number'} *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full h-11 pl-10 pr-3 rounded-2xl bg-[#F7F7F9] border border-[#E4E6EB] text-xs text-[#1B1B1F] outline-none focus:border-[#C41E3A] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-xs font-bold text-[#1B1B1F] mb-1.5">
                  {language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'} *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {bloodGroups.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setBloodGroup(bg)}
                      className={`h-10 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center ${
                        bloodGroup === bg
                          ? 'bg-[#C41E3A] text-white shadow-xs scale-102 ring-2 ring-[#C41E3A]/30'
                          : 'bg-[#F7F7F9] text-[#1B1B1F] hover:bg-[#EBE9EE] border border-[#E4E6EB]'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-bold text-[#1B1B1F] mb-1">
                  {language === 'bn' ? 'জেলা / এলাকা' : 'District'} *
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full h-11 px-3 rounded-2xl bg-[#F7F7F9] border border-[#E4E6EB] text-xs text-[#1B1B1F] outline-none focus:border-[#C41E3A] focus:bg-white transition-colors cursor-pointer"
                >
                  {districtList.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#9E0027] to-[#C41E3A] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{language === 'bn' ? 'তথ্য সংরক্ষণ ও সক্রিয় করুন' : 'Save & Activate Profile'}</span>
              </button>
            </form>
          )}

          {/* Ethical Disclaimer Footer */}
          <div className="pt-2 text-center text-[10.5px] text-[#5B5F6B] border-t border-[#E4E6EB]/60">
            {language === 'bn'
              ? '🔒 ১০০% সুরক্ষিত ও মানবিক উদ্যোগ। রক্ত কেনাবেচা আইনত দণ্ডনীয়।'
              : '🔒 100% Secure & Voluntary. Trading blood is strictly illegal.'}
          </div>

        </div>
      </div>
    </div>
  );
};
