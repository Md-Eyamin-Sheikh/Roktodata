'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Droplet, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { syncSupabaseAuthSession } from '@/lib/services/authService';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let isCancelled = false;

    const processAuth = async () => {
      try {
        const supabase = getSupabaseClient();
        if (!supabase) {
          throw new Error('Supabase ক্লায়েন্ট লোড করা যায়নি।');
        }

        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          throw new Error(errorDescription || error || 'অথেনটিকেশন ব্যর্থ হয়েছে।');
        }

        // 1. If code exists in query params, exchange it in the browser (where PKCE verifier is in localStorage)
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.warn('PKCE exchange error, checking session fallback:', exchangeError.message);
          }
        }

        // 2. Also check if session is already active or in hash
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          throw sessionError;
        }

        if (sessionData?.session?.user) {
          // 3. Sync profile into local storage and database
          await syncSupabaseAuthSession();
          if (!isCancelled) {
            setStatus('success');
            setTimeout(() => {
              window.location.href = '/';
            }, 600);
          }
        } else {
          // Retry briefly for slow mobile connections
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const { data: retryData } = await supabase.auth.getSession();
          if (retryData?.session?.user) {
            await syncSupabaseAuthSession();
            if (!isCancelled) {
              setStatus('success');
              setTimeout(() => {
                window.location.href = '/';
              }, 600);
            }
          } else {
            throw new Error('লগইন সেশন পাওয়া যায়নি। আবার চেষ্টা করুন।');
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('OAuth Callback Error:', err);
          setStatus('error');
          setErrorMessage(err?.message || 'লগইন প্রক্রিয়া সম্পন্ন করতে ব্যর্থ হয়েছে।');
        }
      }
    };

    processAuth();

    return () => {
      isCancelled = true;
    };
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#F7F7F9] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-[#E4E6EB] text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#9E0027] to-[#C41E3A] flex items-center justify-center text-white shadow-md">
          <Droplet className="w-7 h-7 fill-current" />
        </div>

        {status === 'loading' && (
          <div className="space-y-3">
            <h2 className="text-base font-extrabold text-[#1B1B1F]">
              অ্যাকাউন্টে প্রবেশ করা হচ্ছে...
            </h2>
            <p className="text-xs text-[#5B5F6B]">
              আপনার সোশ্যাল অ্যাকাউন্টের সাথে সংযোগ স্থাপন ও তথ্য যাচাই করা হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন।
            </p>
            <div className="pt-2 flex justify-center">
              <RefreshCw className="w-6 h-6 text-[#C41E3A] animate-spin" />
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-extrabold text-[#005938]">
              লগইন সফল হয়েছে!
            </h2>
            <p className="text-xs text-[#5B5F6B]">
              আপনাকে অ্যাপে নিয়ে যাওয়া হচ্ছে...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-red-100 flex items-center justify-center text-[#BA1A1A]">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-extrabold text-[#BA1A1A]">
              লগইন সম্পন্ন করা যায়নি
            </h2>
            <p className="text-xs text-[#5B5F6B] leading-relaxed">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/';
              }}
              className="w-full h-11 rounded-2xl bg-[#9E0027] hover:bg-[#80001F] text-white font-bold text-xs shadow-xs active:scale-98 transition-all cursor-pointer mt-2"
            >
              হোম পেজে ফিরে যান
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F7F9] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-[#E4E6EB] text-center space-y-4">
            <RefreshCw className="w-6 h-6 text-[#C41E3A] animate-spin mx-auto" />
            <p className="text-xs text-[#5B5F6B]">অপেক্ষা করুন...</p>
          </div>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
