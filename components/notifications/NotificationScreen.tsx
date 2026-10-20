'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCheck,
  SlidersHorizontal,
  Zap,
  Phone,
  Check,
  Calendar,
  Volume2,
  Moon,
  ChevronRight,
  Clock,
  Heart,
  Trash2,
  Bell,
  BellRing,
  Send,
  Sparkles,
  ShieldCheck,
  Award
} from 'lucide-react';
import { AppNotification, BloodGroup } from '@/lib/types';
import { useToast } from '@/components/ui/ToastNotification';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification
} from '@/lib/services/bloodService';
import {
  playNotificationSound,
  playUrgentAlertSound,
  requestPushPermission,
  triggerNativeNotification
} from '@/lib/audioUtils';

interface NotificationScreenProps {
  notifications: AppNotification[];
  onBack: () => void;
  onMarkAllRead: () => void;
  onOpenSettings: () => void;
  onRespondToUrgent: (bloodGroup: string) => void;
}

export const NotificationScreen: React.FC<NotificationScreenProps> = ({
  notifications: initialList,
  onBack,
  onMarkAllRead,
  onOpenSettings,
  onRespondToUrgent,
}) => {
  const { language, t, formatDigits } = useLanguage();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<'all' | 'urgent' | 'my-req' | 'camps' | 'health'>('all');
  const [notifications, setNotifications] = useState<AppNotification[]>(initialList);
  const [pushStatus, setPushStatus] = useState<'granted' | 'denied' | 'default'>('default');
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    setNotifications(initialList);
  }, [initialList]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushStatus(Notification.permission);
    }
  }, []);

  const handleMarkAll = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
    onMarkAllRead();
    playNotificationSound();
    await markAllNotificationsAsRead();
    showToast(language === 'bn' ? 'সব নোটিফিকেশন পঠিত হয়েছে' : 'All notifications marked as read', 'success');
  };

  const handleMarkSingleRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n))
    );
    await markNotificationAsRead(id);
  };

  const handleDelete = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await deleteNotification(id);
    showToast(language === 'bn' ? 'নোটিফিকেশন মুছে ফেলা হয়েছে' : 'Notification removed', 'info');
  };

  const handleEnablePush = async () => {
    const perm = await requestPushPermission();
    setPushStatus(perm);
    if (perm === 'granted') {
      playNotificationSound();
      triggerNativeNotification('রক্তদাতা নোটিফিকেশন সক্রিয়', 'জরুরি রক্তের আবেদন সরাসরি আপনার ফোনে পাওয়া যাবে।');
      showToast(language === 'bn' ? 'পুশ নোটিফিকেশন সফলভাবে সক্রিয় হয়েছে!' : 'Push notifications enabled successfully!', 'success');
    } else {
      showToast(language === 'bn' ? 'পুশ নোটিফিকেশন পারমিশন মেলেনি' : 'Push permission denied', 'warning');
    }
  };

  const handleSendTestNotification = async () => {
    setIsSendingTest(true);
    playUrgentAlertSound();

    const sampleBgs: BloodGroup[] = ['A+', 'O+', 'B+', 'AB+'];
    const randomBg = sampleBgs[Math.floor(Math.random() * sampleBgs.length)];

    const testNotif: Partial<AppNotification> = {
      title: `🚨 জরুরি রক্তের ডাক: ${randomBg} প্রয়োজন`,
      description: `শহীদ জিয়াউর রহমান মেডিকেল কলেজ হাসপাতাল (শজিমেক), বগুড়ায় ১ ব্যাগ ${randomBg} রক্ত জরুরি।`,
      category: 'urgent',
      bloodGroup: randomBg,
      isUnread: true,
    };

    const saved = await createNotification(testNotif);
    setNotifications((prev) => [saved, ...prev]);

    triggerNativeNotification(saved.title, saved.description);
    showToast(language === 'bn' ? 'লাইভ টেস্ট নোটিফিকেশন পাঠানো হয়েছে!' : 'Test notification sent live!', 'success');
    setIsSendingTest(false);
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'health') return n.category === 'health' || (n as any).category === 'badge';
    return n.category === filter;
  });

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-4 md:px-0 pb-24 animate-in fade-in">
      {/* Context Top Bar */}
      <div className="px-4 pt-3 pb-2.5 flex items-center justify-between bg-white rounded-2xl border border-[#E4E6EB]/60 sticky top-2 z-20 shadow-xs mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            aria-label={t.common.back}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#1B1B1F] hover:bg-[#F7F7F9] cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-[18px] text-[#1B1B1F]">{t.nav.notifications}</h1>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold shadow-xs ${
                unreadCount > 0
                  ? 'bg-[#C41E3A] text-white animate-pulse'
                  : 'bg-[#F0EDF2] text-[#5B5F6B]'
              }`}
            >
              {formatDigits(unreadCount)} {language === 'bn' ? 'টি নতুন' : 'new'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleMarkAll}
            className="h-8.5 px-3 rounded-full flex items-center gap-1.5 text-[#5B5F6B] hover:text-[#C41E3A] hover:bg-[#FDECEF]/50 text-xs font-bold cursor-pointer transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-[#00744B]" />
            <span>{language === 'bn' ? 'সব পঠিত' : 'Mark all'}</span>
          </button>
          <button
            onClick={onOpenSettings}
            aria-label={language === 'bn' ? 'নোটিফিকেশন সেটিংস' : 'Notification settings'}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#5B5F6B] hover:text-[#1B1B1F] hover:bg-[#F7F7F9] cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Push Permission & Live Test Interactive Banner */}
      <div className="mb-3 p-3.5 bg-gradient-to-r from-[#1B1B1F] to-[#2D2D35] rounded-2xl text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#C41E3A] flex items-center justify-center shrink-0">
            <BellRing className="w-4.5 h-4.5 text-white animate-bounce" />
          </div>
          <div>
            <h3 className="text-xs font-bold flex items-center gap-1.5">
              <span>{language === 'bn' ? 'রিয়েল-টাইম পুশ ও সাউন্ড নোটিফিকেশন' : 'Real-time Push & Sound Alerts'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </h3>
            <p className="text-[11px] text-zinc-300">
              {pushStatus === 'granted'
                ? (language === 'bn' ? 'ডিভাইস পুশ নোটিফিকেশন ১০০% সক্রিয়' : 'Device push notifications active')
                : (language === 'bn' ? 'ব্রাউজার পারমিশন দিয়ে তাৎক্ষণিক অ্যালার্ট পান' : 'Enable browser push for instant alerts')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {pushStatus !== 'granted' && (
            <button
              onClick={handleEnablePush}
              className="flex-1 sm:flex-initial h-8 px-3 rounded-xl bg-white text-[#1B1B1F] text-xs font-bold flex items-center justify-center gap-1 hover:bg-zinc-100 cursor-pointer shadow-xs"
            >
              <Bell className="w-3.5 h-3.5 text-[#C41E3A]" />
              <span>{language === 'bn' ? 'পুশ অন করুন' : 'Enable Push'}</span>
            </button>
          )}

          <button
            onClick={handleSendTestNotification}
            disabled={isSendingTest}
            className="flex-1 sm:flex-initial h-8 px-3 rounded-xl bg-[#C41E3A] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#9E0027] cursor-pointer shadow-xs active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'টেস্ট অ্যালার্ট পাঠান' : 'Send Test Alert'}</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="px-3 py-2 bg-white rounded-2xl border border-[#E4E6EB]/50 overflow-x-auto no-scrollbar flex items-center gap-2 mb-3 shadow-xs">
        {[
          { id: 'all', label: language === 'bn' ? 'সব' : 'All' },
          { id: 'urgent', label: language === 'bn' ? 'জরুরি রক্তের ডাক' : 'Urgent Requests' },
          { id: 'my-req', label: language === 'bn' ? 'আমার আবেদন' : 'My Requests' },
          { id: 'camps', label: language === 'bn' ? 'ক্যাম্প ও আপডেট' : 'Camps & Updates' },
          { id: 'health', label: language === 'bn' ? 'ব্যাজ ও স্বাস্থ্য' : 'Badges & Health' },
        ].map((item) => {
          const isSelected = filter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#C41E3A] text-white shadow-xs'
                  : 'bg-[#F7F7F9] text-[#5B5F6B] hover:bg-[#F0EDF2]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Main Notification Feed */}
      <div className="flex flex-col gap-3">
        {filteredNotifs.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-[#E4E6EB]/60 flex flex-col items-center justify-center text-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-[#F7F7F9] flex items-center justify-center text-[#5B5F6B]">
              <Bell className="w-6 h-6 opacity-60" />
            </div>
            <h3 className="font-bold text-[#1B1B1F] text-sm">
              {language === 'bn' ? 'কোনো নোটিফিকেশন নেই' : 'No notifications found'}
            </h3>
            <p className="text-xs text-[#5B5F6B] max-w-xs">
              {language === 'bn'
                ? 'নতুন রক্তের আবেদন বা আপডেট এলে তা এখানে রিয়েল-টাইমে প্রদর্শিত হবে।'
                : 'New blood requests or campaign updates will appear here in real-time.'}
            </p>
          </div>
        ) : (
          filteredNotifs.map((notif) => {
            const isUrgent = notif.category === 'urgent';
            const isMyReq = notif.category === 'my-req';
            const isCamp = notif.category === 'camps' || (notif as any).category === 'camp';
            const isBadge = notif.category === 'health' || (notif as any).category === 'badge';

            return (
              <article
                key={notif.id}
                onClick={() => {
                  if (notif.isUnread) handleMarkSingleRead(notif.id);
                }}
                className={`rounded-2xl p-4 shadow-xs border transition-all ${
                  notif.isUnread
                    ? 'bg-gradient-to-r from-[#FFF5F6] to-white border-[#FFD0D6]'
                    : 'bg-white border-[#E4E6EB]/70 hover:border-[#D0D4DC]'
                } flex flex-col gap-3`}
              >
                <div className="flex items-start gap-3">
                  {/* Left Avatar / Icon */}
                  <div className="relative shrink-0 mt-0.5">
                    {isUrgent ? (
                      <div className="w-12 h-12 rounded-2xl bg-[#C41E3A] text-white flex flex-col items-center justify-center font-black shadow-sm">
                        <span className="text-[16px] leading-tight">{notif.bloodGroup || 'A+'}</span>
                        <span className="text-[8px] uppercase tracking-wider -mt-0.5 opacity-90">
                          {language === 'bn' ? 'রক্ত' : 'BLOOD'}
                        </span>
                      </div>
                    ) : isMyReq ? (
                      <div className="w-12 h-12 rounded-2xl bg-[#00744B] text-white flex items-center justify-center font-bold text-base shadow-sm">
                        <Check className="w-6 h-6 stroke-[3]" />
                      </div>
                    ) : isCamp ? (
                      <div className="w-12 h-12 rounded-2xl bg-[#D97706] text-white flex items-center justify-center shadow-sm">
                        <Calendar className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-[#7C3AED] text-white flex items-center justify-center shadow-sm">
                        <Award className="w-6 h-6" />
                      </div>
                    )}

                    {notif.isUnread && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#C41E3A] rounded-full ring-2 ring-white animate-ping" />
                    )}
                  </div>

                  {/* Body Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        isUrgent
                          ? 'text-[#C41E3A] bg-[#FDECEF] border-[#FFD0D6]'
                          : isMyReq
                          ? 'text-[#00744B] bg-[#E8F5E9] border-[#C8E6C9]'
                          : isCamp
                          ? 'text-[#D97706] bg-[#FEF3C7] border-[#FDE68A]'
                          : 'text-[#7C3AED] bg-[#F3E8FF] border-[#E9D5FF]'
                      }`}>
                        <Zap className="w-2.5 h-2.5 fill-current" />
                        {isUrgent
                          ? (language === 'bn' ? 'জরুরি রক্তের ডাক' : 'Urgent Call')
                          : isMyReq
                          ? (language === 'bn' ? 'ডোনার রেসপন্স' : 'Donor Response')
                          : isCamp
                          ? (language === 'bn' ? 'রক্তদান ক্যাম্প' : 'Blood Camp')
                          : (language === 'bn' ? 'স্বীকৃতি ও ব্যাজ' : 'Recognition')}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#5B5F6B] shrink-0 font-medium">{notif.timestamp}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notif.id);
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                          title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-[15px] text-[#1B1B1F] leading-snug">
                      {notif.title}
                    </h3>
                    <p className="text-xs text-[#5B5F6B] mt-1 leading-relaxed">
                      {notif.description}
                    </p>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#E4E6EB]/50">
                  {isUrgent && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playNotificationSound();
                          onRespondToUrgent(notif.bloodGroup || 'A+');
                        }}
                        className="flex-1 h-10 px-3 rounded-xl bg-[#C41E3A] hover:bg-[#9E0027] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                        <span>{language === 'bn' ? 'সাড়া দিন' : 'Respond'}</span>
                      </button>
                      <a
                        href="tel:01712345678"
                        onClick={(e) => e.stopPropagation()}
                        className="h-10 px-3.5 rounded-xl bg-white border border-[#E4E6EB] text-[#1B1B1F] text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#F7F7F9] cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#00744B]" />
                        <span>{language === 'bn' ? 'সরাসরি কল' : 'Call'}</span>
                      </a>
                    </>
                  )}

                  {isMyReq && (
                    <>
                      <a
                        href="tel:01712345678"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 h-10 px-3 rounded-xl bg-[#F0EDF2] hover:bg-[#E4E6EB] text-[#1B1B1F] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Phone className="w-4 h-4 text-[#00744B]" />
                        <span>{language === 'bn' ? 'ডোনারকে কল করুন' : 'Call Donor'}</span>
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playNotificationSound();
                          showToast(language === 'bn' ? 'ডোনার কনফার্মেশন সম্পন্ন হয়েছে!' : 'Donor confirmed!', 'success');
                          handleMarkSingleRead(notif.id);
                        }}
                        className="flex-1 h-10 px-3 rounded-xl bg-[#00744B] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>{language === 'bn' ? 'কনফার্ম করুন' : 'Confirm'}</span>
                      </button>
                    </>
                  )}

                  {isCamp && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playNotificationSound();
                        showToast(language === 'bn' ? 'ক্যাম্পেইনে আপনার উপস্থিতি ক্যালেন্ডারে সংরক্ষিত হয়েছে!' : 'Saved to calendar!', 'success');
                        handleMarkSingleRead(notif.id);
                      }}
                      className="w-full h-10 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>{language === 'bn' ? 'ক্যালেন্ডারে যোগ করুন ও অংশ নিন' : 'Add to Calendar & RSVP'}</span>
                    </button>
                  )}

                  {isBadge && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playNotificationSound();
                        showToast(language === 'bn' ? 'আপনার প্রোফাইলে ব্যাজটি প্রদর্শিত হচ্ছে!' : 'Badge displayed in profile!', 'success');
                        handleMarkSingleRead(notif.id);
                      }}
                      className="w-full h-10 px-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{language === 'bn' ? 'প্রোফাইলে ব্যাজ দেখুন' : 'View Badge in Profile'}</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}

        {/* Quiet Hours Notice */}
        <section className="bg-white rounded-2xl p-4 shadow-xs border border-[#E4E6EB]/60 flex items-start gap-3 mt-1">
          <div className="w-10 h-10 rounded-full bg-[#F0EDF2] flex items-center justify-center text-[#E89A00] shrink-0 mt-0.5">
            <Moon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xs text-[#1B1B1F]">
                {language === 'bn' ? 'নীরব সময় (Quiet Hours) মোড সক্রিয়' : 'Quiet Hours Active'}
              </h4>
              <span className="w-2 h-2 rounded-full bg-[#E89A00] animate-pulse" />
            </div>
            <p className="text-xs text-[#5B5F6B] mt-0.5 leading-relaxed">
              {language === 'bn'
                ? 'রাত ১১:০০টা থেকে সকাল ৬:০০টা পর্যন্ত শুধুমাত্র অতি-জরুরি রক্তের অনুরোধ ব্যতিরেকে সব পুশ সাউন্ড নিঃশব্দ থাকবে।'
                : 'Push notifications are silenced between 11:00 PM and 6:00 AM, except critical emergency blood calls.'}
            </p>
            <button
              onClick={onOpenSettings}
              className="mt-2 text-[#0D58C9] text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>{language === 'bn' ? 'নোটিফিকেশন পছন্দসমূহ পরিবর্তন' : 'Change notification preferences'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
