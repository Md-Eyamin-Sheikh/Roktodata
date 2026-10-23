'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw, Droplet, ArrowLeft } from 'lucide-react';
import { updateUserPassword } from '@/lib/services/authService';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!password || password.length < 6) {
      setErrorMessage('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('পাসওয়ার্ড দুটি মেলেনি। অনুগ্রহ করে আবার পরীক্ষা করুন।');
      return;
    }

    setIsLoading(true);
    const res = await updateUserPassword(password);
    setIsLoading(false);

    if (res.success) {
      setIsSuccess(true);
    } else {
      setErrorMessage(res.error || 'পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ হয়েছে। লিংকটি হয়তো মেয়াদোত্তীর্ণ হয়েছে।');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F9] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-[#E4E6EB]">
        
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-[#9E0027] via-[#C41E3A] to-[#BA1A1A] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Droplet className="w-5 h-5 fill-current text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight">নতুন পাসওয়ার্ড নির্ধারণ</h1>
              <p className="text-xs text-white/80 mt-0.5">রক্তদাতা সুরক্ষিত অ্যাকাউন্ট রিকভারি</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-extrabold text-[#1B1B1F]">
                  পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!
                </h2>
                <p className="text-xs text-[#5B5F6B]">
                  আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করা হয়েছে। এখন নতুন পাসওয়ার্ড দিয়ে প্রবেশ করুন।
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full h-12 rounded-2xl bg-[#9E0027] hover:bg-[#80001F] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer mt-4"
              >
                <span>হোম পেজে প্রবেশ করুন</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-[#5B5F6B] leading-relaxed">
                আপনার অ্যাকাউন্টের জন্য একটি শক্তিশালী নতুন গোপন পাসওয়ার্ড লিখুন এবং নিশ্চিত করুন।
              </p>

              {errorMessage && (
                <div className="p-3 rounded-2xl bg-[#FFDAD6]/60 border border-[#FFDAD6] flex items-center gap-2 text-xs text-[#BA1A1A]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">{errorMessage}</span>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-[#1B1B1F] mb-1">
                  নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
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
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-[#1B1B1F] mb-1">
                  নতুন পাসওয়ার্ডটি নিশ্চিত করুন *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
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
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#9E0027] to-[#C41E3A] hover:from-[#80001F] hover:to-[#B01A33] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>সংরক্ষণ হচ্ছে...</span>
                  </>
                ) : (
                  <span>পাসওয়ার্ড সংরক্ষণ করুন</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full py-2 text-xs font-bold text-[#5B5F6B] hover:text-[#1B1B1F] text-center flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>হোম পেজে ফিরে যান</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
