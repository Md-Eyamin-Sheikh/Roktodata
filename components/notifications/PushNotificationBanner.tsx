'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, ShieldCheck } from 'lucide-react';
import { subscribeToWebPush, getPushPermissionState } from '@/lib/services/pushNotificationService';
import { useToast } from '@/components/ui/ToastNotification';

interface PushNotificationBannerProps {
  district?: string;
  bloodGroup?: string;
  userId?: string;
}

export const PushNotificationBanner: React.FC<PushNotificationBannerProps> = ({
  district = 'বগুড়া',
  bloodGroup,
  userId,
}) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isDismissed = sessionStorage.getItem('roktodata_push_banner_dismissed');
    if (!isDismissed && getPushPermissionState() === 'default') {
      // Delay display slightly for smooth page load
      const timer = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  const handleEnable = async () => {
    setLoading(true);
    const res = await subscribeToWebPush({ district, bloodGroup, userId });
    setLoading(false);
    if (res.success) {
      showToast('পুশ নোটিফিকেশন সফলভাবে সক্রিয় হয়েছে!', 'success');
      setVisible(false);
      sessionStorage.setItem('roktodata_push_banner_dismissed', 'true');
    } else {
      if (Notification.permission === 'denied') {
        showToast('ব্রাউজারে নোটিফিকেশন ব্লক করা আছে।', 'warning');
      }
      setVisible(false);
      sessionStorage.setItem('roktodata_push_banner_dismissed', 'true');
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem('roktodata_push_banner_dismissed', 'true');
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-40 bg-[#1B1B1F] text-white p-3.5 rounded-2xl shadow-2xl border border-white/10 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#C41E3A] flex items-center justify-center shrink-0 shadow-xs">
          <Bell className="w-4 h-4 text-white animate-bounce" />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 text-[#FFDAD6] text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4BB543]" />
            <span>লাইভ নোটিফিকেশন</span>
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-white mt-0.5 leading-tight">
            জরুরি রক্তের ডাক সরাসরি ফোনে পেতে চান?
          </h4>
          <p className="text-[11px] text-gray-300 mt-0.5 leading-snug">
            {district}-এ নতুন রক্তের আবেদন এলে ব্রাউজার বন্ধ থাকলেও আপনি সংকেত পাবেন।
          </p>

          <div className="flex items-center gap-2 mt-2.5">
            <button
              onClick={handleEnable}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-xl bg-[#C41E3A] hover:bg-[#A3142C] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <span>{loading ? 'অনুমোদন নেওয়া হচ্ছে...' : 'চালু করুন'}</span>
            </button>
            <button
              onClick={handleDismiss}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 text-xs font-medium transition-all cursor-pointer"
            >
              পরে
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
