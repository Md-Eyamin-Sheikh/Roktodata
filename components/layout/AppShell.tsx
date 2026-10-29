'use client';

import React, { useState } from 'react';
import { Header } from '@/components/navigation/Header';
import { BottomNav, NavTab } from '@/components/navigation/BottomNav';
import { Footer } from '@/components/navigation/Footer';
import { HomeScreen } from '@/components/home/HomeScreen';
import { BloodRequestsView } from '@/components/requests/BloodRequestsView';
import { BloodRequestWizard } from '@/components/request/BloodRequestWizard';
import { DonorDirectoryView } from '@/components/donors/DonorDirectoryView';
import { UserProfileView } from '@/components/profile/UserProfileView';
import { NotificationScreen } from '@/components/notifications/NotificationScreen';
import { SettingsScreen } from '@/components/settings/SettingsScreen';
import { HospitalBloodBankView } from '@/components/directory/HospitalBloodBankView';
import { AmbulanceDirectoryView } from '@/components/directory/AmbulanceDirectoryView';
import { HealthEducationView } from '@/components/education/HealthEducationView';
import { HospitalDashboardView } from '@/components/hospital-dashboard/HospitalDashboardView';
import { AuthModal } from '@/components/auth/AuthModal';
import { DonorResponseModal } from '@/components/donor-response/DonorResponseModal';
import { DonorProfileSetupWizard } from '@/components/auth/DonorProfileSetupWizard';
import { SafeChatModal } from '@/components/chat/SafeChatModal';
import { ReportModal } from '@/components/report/ReportModal';
import { PushNotificationBanner } from '@/components/notifications/PushNotificationBanner';
import { CreateCampModal } from '@/components/camps/CreateCampModal';
import { VerificationExplainerSheet } from '@/components/verification/VerificationExplainerSheet';
import { QuickSearchModal } from '@/components/search/QuickSearchModal';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { isDemoModePermitted } from '@/lib/services/offlineCache';

import {
  initialEmergencyRequests,
  initialDonationCamps,
  initialNotifications,
  initialUserProfile,
  initialDonors,
  initialHospitalsAndBanks,
  initialAmbulances,
  initialHealthArticles,
} from '@/lib/data';
import {
  EmergencyRequest,
  RespondingDonor,
  Donor,
  UserProfile as UserProfileType,
  BloodGroup,
  DonationCamp,
  HospitalBloodBank,
  AmbulanceService,
  TransportMode,
} from '@/lib/types';
import { Phone, ShieldCheck, Heart, Building2, Truck, Plus, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { toBengaliDigits } from '@/lib/bengali-utils';
import {
  registerServiceWorker,
  subscribeToWebPush,
  getPushPermissionState,
} from '@/lib/services/pushNotificationService';
import {
  fetchRequestsByDistrict,
  fetchCampsByDistrict,
  fetchDonorsByDistrict,
  fetchHospitalsByDistrict,
  fetchAmbulancesByDistrict,
  setDonorAvailability,
  subscribeToDistrictEvents,
  createEmergencyRequest,
  submitDonorResponse,
  fetchDonorResponsesForRequest,
  updateDonorResponseStatus,
  fulfillEmergencyRequest,
  getTransportLabel,
  fetchNotifications,
  markAllNotificationsAsRead,
  subscribeToNotifications,
  fetchRequestById,
  updateEmergencyRequestStatus,
  isValidStatusTransition,
  toggleCampRsvp,
} from '@/lib/services/bloodService';
import {
  playNotificationSound,
  playUrgentAlertSound,
  triggerNativeNotification,
} from '@/lib/audioUtils';
import {
  getAuthenticatedUser,
  logoutRealUser,
  updateAuthenticatedUser,
  subscribeAuth,
  syncSupabaseAuthSession,
} from '@/lib/services/authService';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface AppShellProps {
  initialTab?: NavTab;
  initialOpenHospitals?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  initialTab = 'home',
  initialOpenHospitals = false,
}) => {
  const { language, t, formatDigits } = useLanguage();

  // Navigation State with URL parameter synchronization & back-button support
  const [activeTab, setActiveTabState] = useState<NavTab>(initialTab);

  // Synchronize state when initialTab prop updates (e.g., from server router)
  React.useEffect(() => {
    setActiveTabState(initialTab);
  }, [initialTab]);

  const setActiveTab = (tab: NavTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      const url = tab === 'home' ? '/' : `/?tab=${tab}`;
      window.history.pushState({ tab }, '', url);
    }
  };

  // Popstate listener for browser forward/back buttons
  React.useEffect(() => {
    const handlePop = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as NavTab;
      if (tabParam && ['home', 'requests', 'donors', 'profile'].includes(tabParam)) {
        setActiveTabState(tabParam);
      } else {
        setActiveTabState('home');
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const [currentDistrict, setCurrentDistrict] = useState('বগুড়া সদর');

  // Sub-screens & Modals
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHospitalDirectoryOpen, setIsHospitalDirectoryOpen] = useState(initialOpenHospitals);
  const [isAmbulanceDirectoryOpen, setIsAmbulanceDirectoryOpen] = useState(false);
  const [isHealthEducationOpen, setIsHealthEducationOpen] = useState(false);
  const [isHospitalDashboardOpen, setIsHospitalDashboardOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register' | 'forgot' | 'complete_contact'>('login');

  const handleOpenAuth = (mode: 'login' | 'register' | 'forgot' | 'complete_contact' = 'login') => {
    setAuthInitialMode(mode);
    setIsAuthOpen(true);
  };
  const [isDonorSetupOpen, setIsDonorSetupOpen] = useState(false);
  const [isVerificationExplainerOpen, setIsVerificationExplainerOpen] = useState(false);

  // Active chat & reports
  const [activeChatDonor, setActiveChatDonor] = useState<RespondingDonor | null>(null);
  const [reportTargetName, setReportTargetName] = useState<string | null>(null);
  const [reportTargetUserId, setReportTargetUserId] = useState<string | null>(null);
  const [reportRequestId, setReportRequestId] = useState<string | null>(null);
  const [isCreateCampOpen, setIsCreateCampOpen] = useState(false);
  const [selectedBloodGroupFilter, setSelectedBloodGroupFilter] = useState<BloodGroup | null>(null);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);

  // Keyboard shortcut: / or Ctrl+K / Cmd+K opens Quick Search
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen((prev) => !prev);
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsQuickSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Data States - SSR-safe external store subscription (eliminates hydration mismatch and cascading renders)
  const cachedUser = React.useSyncExternalStore(
    subscribeAuth,
    getAuthenticatedUser,
    () => null
  );

  const userProfile: UserProfileType = cachedUser || initialUserProfile;
  const isLoggedIn = Boolean(cachedUser && cachedUser.name && cachedUser.phone);
  const isDemo = isDemoModePermitted();

  const [nearbyRequests, setNearbyRequests] = useState<EmergencyRequest[]>(isDemo ? initialEmergencyRequests : []);
  const [myRequest, setMyRequest] = useState<EmergencyRequest | null>(null);
  const [respondingDonors, setRespondingDonors] = useState<RespondingDonor[]>([]);
  const [camps, setCamps] = useState<DonationCamp[]>(isDemo ? initialDonationCamps : []);
  const [donors, setDonors] = useState<Donor[]>(isDemo ? initialDonors : []);
  const [hospitals, setHospitals] = useState<HospitalBloodBank[]>(isDemo ? initialHospitalsAndBanks : []);
  const [ambulances, setAmbulances] = useState<AmbulanceService[]>(isDemo ? initialAmbulances : []);
  const [notifications, setNotifications] = useState(isDemo ? initialNotifications : []);
  const [isOffline, setIsOffline] = useState(false);

  // Monitor network online/offline status
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Sync live Supabase Auth session on app launch & register Service Worker
  React.useEffect(() => {
    registerServiceWorker();
    syncSupabaseAuthSession().then((synced) => {
      if (synced && !synced.isProfileComplete) {
        setIsDonorSetupOpen(true);
      }
    });
  }, []);

  // District-based Real-time and Data Synchronization
  React.useEffect(() => {
    let isMounted = true;

    // 1. Fetch district-specific requests, camps, donors, hospitals, ambulances, and live notifications
    const loadDistrictData = async () => {
      try {
        const [loadedReqs, loadedCamps, loadedDonors, loadedHospitals, loadedAmbulances, loadedNotifs] = await Promise.all([
          fetchRequestsByDistrict(currentDistrict),
          fetchCampsByDistrict(currentDistrict),
          fetchDonorsByDistrict(currentDistrict),
          fetchHospitalsByDistrict(currentDistrict),
          fetchAmbulancesByDistrict(currentDistrict),
          fetchNotifications(),
        ]);
        if (isMounted) {
          setNearbyRequests(loadedReqs || []);
          setCamps(loadedCamps || []);
          setDonors(loadedDonors || []);
          setHospitals(loadedHospitals || []);
          setAmbulances(loadedAmbulances || []);
          setNotifications(loadedNotifs || []);
        }
      } catch (err) {
        console.error('Error syncing district data:', err);
      }
    };

    loadDistrictData();

    // 2. Setup Supabase Realtime channel for live district broadcast & postgres changes
    const unsubscribeDistrict = subscribeToDistrictEvents(
      currentDistrict,
      (newReq) => {
        if (!isMounted) return;
        playUrgentAlertSound();
        const title = `🚨 নতুন রক্তের আবেদন: ${newReq.blood_group || 'রক্ত'} প্রয়োজন`;
        const desc = `${newReq.hospital_name || 'হাসপাতাল'} থেকে রক্তের আবেদন এসেছে।`;
        triggerNativeNotification(title, desc);

        // Instantly update nearbyRequests list without page refresh
        setNearbyRequests((prev) => {
          if (prev.some((r) => r.id === newReq.id)) return prev;
          return [newReq, ...prev];
        });

        setNotifications((prev) => [
          {
            id: `NOTIF-REALTIME-${Date.now()}`,
            category: 'urgent',
            title,
            description: desc,
            timestamp: 'এইমাত্র',
            bloodGroup: newReq.blood_group,
            isUnread: true,
            actionType: 'respond',
          },
          ...prev,
        ]);
      },
      (newResponse) => {
        if (!isMounted) return;
        playNotificationSound();
        const title = '✅ একজন রক্তদাতা সাড়া দিয়েছেন!';
        const desc = `আনুমানিক ${newResponse.donor?.etaMinutes || newResponse.eta_minutes || 30} মিনিটে পৌঁছাবেন।`;
        triggerNativeNotification(title, desc);

        // If donor object is present, immediately show under active request
        if (newResponse.donor) {
          setRespondingDonors((prev) => {
            if (prev.some((d) => d.id === newResponse.donor.id)) return prev;
            return [newResponse.donor, ...prev];
          });
        }

        // Update responding count on request in nearbyRequests
        setNearbyRequests((prev) =>
          prev.map((r) =>
            r.id === newResponse.requestId
              ? { ...r, respondingDonorsCount: (r.respondingDonorsCount || 0) + 1 }
              : r
          )
        );

        setNotifications((prev) => [
          {
            id: `NOTIF-RESP-${Date.now()}`,
            category: 'my-req',
            title,
            description: desc,
            timestamp: 'এইমাত্র',
            isUnread: true,
            actionType: 'call',
            actionUrl: newResponse.donor?.phone ? `tel:${newResponse.donor.phone}` : undefined,
          },
          ...prev,
        ]);
      },
      (updatedReq) => {
        if (!isMounted) return;
        // Instantly update request in nearby list without page refresh
        setNearbyRequests((prev) =>
          prev.map((r) =>
            r.id === updatedReq.requestId
              ? {
                  ...r,
                  status: updatedReq.status,
                  trackingStep: (updatedReq.trackingStep as any) || r.trackingStep,
                  bagsFulfilled: typeof updatedReq.bagsFulfilled === 'number' ? updatedReq.bagsFulfilled : r.bagsFulfilled,
                }
              : r
          )
        );

        if (myRequest && myRequest.id === updatedReq.requestId) {
          setMyRequest((prev) =>
            prev
              ? {
                  ...prev,
                  status: updatedReq.status,
                  trackingStep: (updatedReq.trackingStep as any) || prev.trackingStep,
                  bagsFulfilled: typeof updatedReq.bagsFulfilled === 'number' ? updatedReq.bagsFulfilled : prev.bagsFulfilled,
                }
              : null
          );
        }
      }
    );

    // 3. Setup global realtime channel for all incoming notifications
    const unsubscribeNotifs = subscribeToNotifications((newNotif) => {
      if (!isMounted) return;
      playNotificationSound();
      triggerNativeNotification(newNotif.title, newNotif.description);
      setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
    });

    return () => {
      isMounted = false;
      unsubscribeDistrict();
      unsubscribeNotifs();
    };
  }, [currentDistrict]);

  // Restore active emergency request from localStorage on page load / refresh
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const activeId = localStorage.getItem('roktodata_my_active_request_id');
      if (activeId) {
        fetchRequestById(activeId).then((req: EmergencyRequest | null) => {
          if (
            req &&
            ['open', 'active', 'partially_fulfilled', 'in_progress'].includes(req.status || 'open')
          ) {
            setMyRequest(req);
          }
        });
      }
    }
  }, []);

  // Fetch real-time donor responses when user has an active emergency request
  React.useEffect(() => {
    if (myRequest?.id) {
      fetchDonorResponsesForRequest(myRequest.id).then((responses: RespondingDonor[]) => {
        if (responses && responses.length > 0) {
          setRespondingDonors(responses);
        }
      });
    }
  }, [myRequest?.id]);

  // Selected Request for Donor Response Modal
  const [selectedResponseReq, setSelectedResponseReq] = useState<EmergencyRequest | null>(null);

  // Unread notifications count
  const unreadCount = notifications.filter((n) => n.isUnread).length;

  // Toggle Donor Availability
  const handleToggleDonorAvailable = () => {
    if (!isLoggedIn) {
      handleOpenAuth('login');
      return;
    }
    if (!userProfile.isProfileComplete) {
      setIsDonorSetupOpen(true);
      return;
    }
    const nextVal = !userProfile.isAvailable;
    setDonorAvailability(userProfile.donorId, nextVal);
    updateAuthenticatedUser({ isAvailable: nextVal });
  };

  // Real login success handler
  const handleSuccessLogin = (user: UserProfileType) => {
    setIsAuthOpen(false);
    if (!user.isProfileComplete) {
      setTimeout(() => {
        setIsDonorSetupOpen(true);
      }, 400);
    }
    setNotifications((prev) => [
      {
        id: `NOTIF-AUTH-${Date.now()}`,
        category: 'my-req',
        title: 'লগইন সফল হয়েছে',
        description: `স্বাগতম ${user.name}! আপনার প্রোফাইল ও রক্তদাতা ড্যাশবোর্ড এখন সক্রিয়।`,
        timestamp: 'এইমাত্র',
        isUnread: true,
      },
      ...prev,
    ]);
  };

  // Real logout handler
  const handleLogout = async () => {
    await logoutRealUser();
    // Strict Data Clearance on Logout: eliminate all private patient, response & chat data
    setMyRequest(null);
    setRespondingDonors([]);
    setSelectedResponseReq(null);
    setActiveChatDonor(null);
    setReportTargetName(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('roktodata_admin_key');
    }
    setNotifications([
      {
        id: `NOTIF-LOGOUT-${Date.now()}`,
        category: 'my-req',
        title: 'লগআউট সম্পন্ন হয়েছে',
        description: 'আপনি সফলভাবে অ্যাকাউন্ট থেকে প্রস্থান করেছেন। পূর্ববর্তী সেশনের ব্যক্তিগত ডেটা মুছে ফেলা হয়েছে।',
        timestamp: 'এইমাত্র',
        isUnread: true,
      },
    ]);
  };

  // Submit Blood Request from Wizard with real ID return
  const handleCreateRequest = async (newReq: Partial<EmergencyRequest>): Promise<EmergencyRequest> => {
    const created = await createEmergencyRequest({
      ...newReq,
      location: currentDistrict,
    });

    setMyRequest(created);
    setNearbyRequests((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);

    // Add alert notification
    setNotifications((prev) => [
      {
        id: `NOTIF-${Date.now()}`,
        category: 'my-req',
        title: 'আপনার জরুরি রক্তের অনুরোধ প্রকাশিত হয়েছে',
        description: `${created.bloodGroup} রক্তের জন্য (${created.hospitalName}) নিকটস্থ রক্তদাতাদের নোটিফিকেশন পাঠানো হয়েছে। আইডি: ${created.id}`,
        timestamp: 'এইমাত্র',
        isUnread: true,
      },
      ...prev,
    ]);

    return created;
  };

  // Donor Responds to a request
  const handleRespondToRequest = (
    reqId: string,
    etaMinutes: number,
    transportMode: TransportMode = 'motorcycle'
  ) => {
    // Send to Supabase
    submitDonorResponse({
      requestId: reqId,
      donorName: userProfile.name,
      bloodGroup: userProfile.bloodGroup,
      phone: userProfile.phone,
      etaMinutes,
      transportMode,
      status: 'on_the_way',
    });

    const target = nearbyRequests.find((r) => r.id === reqId) || myRequest;
    if (target) {
      if (myRequest && myRequest.id === reqId) {
        setRespondingDonors((prev) => {
          const exists = prev.find((d) => d.name === userProfile.name);
          if (exists) {
            return prev.map((d) =>
              d.name === userProfile.name
                ? {
                    ...d,
                    etaMinutes,
                    transportMode,
                    transportLabel: getTransportLabel(transportMode),
                    status: 'on_the_way',
                  }
                : d
            );
          }
          return [
            ...prev,
            {
              id: `RESP-${Date.now()}`,
              name: userProfile.name,
              bloodGroup: userProfile.bloodGroup,
              phone: userProfile.phone,
              distanceKm: target.distanceKm,
              etaMinutes,
              transportMode,
              transportLabel: getTransportLabel(transportMode),
              isVerified: true,
              totalDonations: userProfile.totalDonations || 3,
              lastDonationMonths: 4,
              status: 'on_the_way',
            },
          ];
        });
      } else {
        setNearbyRequests((prev) =>
          prev.map((r) =>
            r.id === reqId
              ? {
                  ...r,
                  hasResponded: true,
                  userResponseEta: etaMinutes,
                  userTransportMode: transportMode,
                  respondingDonorsCount: (r.respondingDonorsCount || 0) + 1,
                }
              : r
          )
        );
      }

      setNotifications((prev) => [
        {
          id: `NOTIF-${Date.now()}`,
          category: 'urgent',
          title: 'রক্তদানে আপনার সাড়া সফলভাবে গৃহীত হয়েছে',
          description: `হাসপাতালে পৌঁছানোর আনুমানিক সময়: ${toBengaliDigits(etaMinutes)} মিনিট (${getTransportLabel(transportMode)})। মানবিক সহায়তার জন্য আন্তরিক ধন্যবাদ।`,
          timestamp: 'এইমাত্র',
          isUnread: true,
        },
        ...prev,
      ]);
    }
  };

  // RSVP to camp with duplicate prevention and database sync
  const handleRsvpCamp = async (campId: string) => {
    const currentCamp = camps.find((c) => c.id === campId);
    const willRsvp = !currentCamp?.isRsvp;

    setCamps((prev) =>
      prev.map((c) =>
        c.id === campId
          ? {
              ...c,
              isRsvp: willRsvp,
              registeredCount: willRsvp ? c.registeredCount + 1 : Math.max(0, c.registeredCount - 1),
            }
          : c
      )
    );

    const result = await toggleCampRsvp(campId, userProfile.donorId || 'guest-user');
    if (result.isRsvp) {
      setNotifications((prev) => [
        {
          id: `NOTIF-RSVP-${Date.now()}`,
          category: 'camps',
          title: 'ক্যাম্পেইনে অংশগ্রহণ নিশ্চিত হয়েছে!',
          description: 'রক্তদান ক্যাম্পেইনে আপনার উপস্থিতি সফলভাবে সংরক্ষিত হয়েছে।',
          timestamp: 'এইমাত্র',
          isUnread: true,
        },
        ...prev,
      ]);
    }
  };

  // Confirm specific donor
  const handleConfirmDonor = async (donorId: string) => {
    setRespondingDonors((prev) =>
      prev.map((d) => (d.id === donorId ? { ...d, status: 'confirmed' } : d))
    );

    if (myRequest) {
      const currentFulfilled = (myRequest.bagsFulfilled || 0) + 1;
      const isComplete = currentFulfilled >= myRequest.bagsNeeded;
      const newStatus = isComplete ? 'fulfilled' : 'partially_fulfilled';
      const newStep = isComplete ? 5 : 4;

      setMyRequest({
        ...myRequest,
        bagsFulfilled: currentFulfilled,
        status: newStatus,
        trackingStep: newStep,
      });

      // Sync with Supabase
      await fulfillEmergencyRequest(myRequest.id, donorId);

      setNotifications((prev) => [
        {
          id: `NOTIF-CONFIRM-${Date.now()}`,
          category: 'my-req',
          title: isComplete ? 'রক্ত সংগ্রহ সফলভাবে সম্পন্ন হয়েছে!' : 'রক্তদাতা নিশ্চিত করা হয়েছে',
          description: isComplete
            ? `প্রয়োজনীয় সকল রক্ত (${toBengaliDigits(currentFulfilled)}/${toBengaliDigits(myRequest.bagsNeeded)} ব্যাগ) সংগ্রহ নিশ্চিত হয়েছে।`
            : `রক্তদাতার উপস্থিতি ও রক্তদান গ্রহণ নিশ্চিত হয়েছে (${toBengaliDigits(currentFulfilled)}/${toBengaliDigits(myRequest.bagsNeeded)} ব্যাগ)।`,
          timestamp: 'এইমাত্র',
          isUnread: true,
        },
        ...prev,
      ]);
    }
  };

  // Decline or cancel specific donor response
  const handleDeclineDonor = async (donorId: string) => {
    if (!window.confirm('আপনি কি এই ডোনারের সাড়া বাতিল করতে চান?')) return;
    setRespondingDonors((prev) =>
      prev.map((d) => (d.id === donorId ? { ...d, status: 'declined' } : d))
    );
    await updateDonorResponseStatus(donorId, 'declined');
  };

  // Close or update active emergency request status
  const handleCloseRequest = async () => {
    if (!myRequest) return;

    const action = window.prompt(
      'অনুরোধের বর্তমান অবস্থা নির্বাচন করুন:\n১. সম্পূর্ণ রক্ত পেয়েছি (1 টাইপ করুন - Fulfilled)\n২. আংশিক রক্ত পেয়েছি (2 টাইপ করুন - Partially Fulfilled)\n৩. অনুরোধ বাতিল করুন (3 টাইপ করুন - Cancelled)',
      '1'
    );

    if (action === '1') {
      await updateEmergencyRequestStatus(myRequest.id, 'fulfilled', myRequest.status, myRequest.bagsNeeded);
      setMyRequest((prev) => (prev ? { ...prev, status: 'fulfilled', trackingStep: 5 } : null));
      alert('অভিনন্দন! আপনার রক্তের আবেদন সফলভাবে সম্পন্ন (Fulfilled) হিসেবে সমাপ্ত হয়েছে।');
      setTimeout(() => setMyRequest(null), 1200);
    } else if (action === '2') {
      const fulfilledBags = Math.min(myRequest.bagsNeeded, (myRequest.bagsFulfilled || 0) + 1);
      await updateEmergencyRequestStatus(myRequest.id, 'partially_fulfilled', myRequest.status, fulfilledBags);
      setMyRequest((prev) =>
        prev
          ? {
              ...prev,
              status: 'partially_fulfilled',
              bagsFulfilled: fulfilledBags,
              trackingStep: 3,
            }
          : null
      );
      alert(`আংশিক রক্ত সংগ্রহ আপডেট করা হয়েছে (${toBengaliDigits(fulfilledBags)}/${toBengaliDigits(myRequest.bagsNeeded)} ব্যাগ)।`);
    } else if (action === '3') {
      await updateEmergencyRequestStatus(myRequest.id, 'cancelled', myRequest.status);
      setMyRequest(null);
      alert('অনুরোধটি বাতিল (Cancelled) করা হয়েছে।');
    }
  };

  // Share request
  const handleShareRequest = () => {
    if (navigator.share && myRequest) {
      navigator.share({
        title: `জরুরি রক্ত প্রয়োজন: ${myRequest.bloodGroup}`,
        text: `${myRequest.hospitalName}-এ জরুরি ${myRequest.bloodGroup} রক্ত প্রয়োজন। যোগাযোগ: ${myRequest.contactNumber}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      alert('রক্তের জরুরি অনুরোধের তথ্য ক্লিপবোর্ডে কপি করা হয়েছে!');
    }
  };

  // Direct request to donor from directory
  const handleSendDirectRequest = (donor: Donor) => {
    alert(`${donor.name}-এর কাছে রক্তের সরাসরি অনুরোধ পাঠানো হয়েছে! তিনি সাড়া দিলে নোটিফিকেশন পাবেন।`);
    setNotifications((prev) => [
      {
        id: `NOTIF-${Date.now()}`,
        category: 'my-req',
        title: `${donor.name}-কে সরাসরি অনুরোধ পাঠানো হয়েছে`,
        description: `রক্তের গ্রুপ: ${donor.bloodGroup} • এলাকা: ${donor.location}`,
        timestamp: 'এইমাত্র',
        isUnread: true,
      },
      ...prev,
    ]);
  };

  const isSubPageOpen =
    isNotificationsOpen ||
    isSettingsOpen ||
    isHospitalDirectoryOpen ||
    isAmbulanceDirectoryOpen ||
    isHealthEducationOpen ||
    isHospitalDashboardOpen;

  // Stock inventory snapshot for desktop widget
  const bloodStockSnapshot: { group: BloodGroup; count: number; status: 'available' | 'low' | 'critical' }[] = [
    { group: 'A+', count: 12, status: 'available' },
    { group: 'A-', count: 1, status: 'critical' },
    { group: 'B+', count: 18, status: 'available' },
    { group: 'B-', count: 3, status: 'low' },
    { group: 'O+', count: 15, status: 'available' },
    { group: 'O-', count: 2, status: 'low' },
    { group: 'AB+', count: 6, status: 'available' },
    { group: 'AB-', count: 0, status: 'critical' },
  ];

  const isLiveSupabase = isSupabaseConfigured();

  return (
    <div
      style={{
        fontSize: `calc(1rem * var(--large-screen-scale, 1))`,
      }}
      className="min-h-screen bg-[#F7F7F9] flex flex-col text-[#1B1B1F] selection:bg-[#FDECEF] selection:text-[#C41E3A] pb-32 md:pb-8"
    >
      {/* Offline Mode Banner with Direct Emergency Helplines */}
      {isOffline && (
        <div className="w-full bg-[#FFF8E1] border-b border-[#FFE082] px-3 py-2 text-xs text-[#7A4F01] flex items-center justify-between sticky top-0 z-50 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping shrink-0" />
            <span className="font-semibold text-[11px] sm:text-xs truncate">
              অফলাইন মোড — পূর্বে সংরক্ষিত ক্যাশ ডেটা দেখানো হচ্ছে। জরুরি সহায়তায় কল করুন:
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <a href="tel:16263" className="px-2.5 py-1 rounded-lg bg-[#00744B] text-white font-bold text-[11px] hover:bg-[#005938] transition-colors">
              ১৬২৬৩
            </a>
            <a href="tel:999" className="px-2.5 py-1 rounded-lg bg-[#C41E3A] text-white font-bold text-[11px] hover:bg-[#A3182F] transition-colors">
              ৯৯৯
            </a>
          </div>
        </div>
      )}

      {/* Global Responsive Top Header */}
      {!isSubPageOpen && activeTab !== 'request_form' && (
        <Header
          currentDistrict={currentDistrict}
          onDistrictChange={setCurrentDistrict}
          unreadCount={unreadCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => setActiveTab('profile')}
          onOpenAuth={() => handleOpenAuth('login')}
          isLoggedIn={isLoggedIn}
          donorName={isLoggedIn && userProfile.name ? userProfile.name : 'অতিথি'}
          donorBloodGroup={isLoggedIn ? userProfile.bloodGroup : ''}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onRequestBloodClick={() => setActiveTab('request_form')}
          onOpenHospitalDirectory={() => setIsHospitalDirectoryOpen(true)}
        />
      )}

      {/* Main Body Layout */}
      <div
        className={`w-full flex-1 flex justify-center ${
          !isSubPageOpen && activeTab !== 'request_form' ? 'pt-14 md:pt-16' : 'pt-0'
        }`}
      >
        <div className="w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-0 sm:px-4 lg:px-6 2xl:px-8 py-2 sm:py-5 flex gap-6 items-start">
          
          {/* Primary View Container (Fluid on mobile, centered & spacious on desktop) */}
          <main className="flex-1 min-w-0 w-full">
            {isNotificationsOpen ? (
              <NotificationScreen
                notifications={notifications}
                onBack={() => setIsNotificationsOpen(false)}
                onMarkAllRead={() =>
                  setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })))
                }
                onOpenSettings={() => {
                  setIsNotificationsOpen(false);
                  setIsSettingsOpen(true);
                }}
                onRespondToUrgent={() => {
                  setIsNotificationsOpen(false);
                  setActiveTab('requests');
                }}
              />
            ) : isSettingsOpen ? (
              <SettingsScreen
                userProfile={userProfile}
                onBack={() => setIsSettingsOpen(false)}
                onUpdateProfile={(updates) => updateAuthenticatedUser(updates)}
                onLogout={() => {
                  setIsSettingsOpen(false);
                  handleLogout();
                }}
              />
            ) : isHospitalDirectoryOpen ? (
              <HospitalBloodBankView
                hospitals={hospitals}
                onBack={() => {
                  setIsHospitalDirectoryOpen(false);
                  setSelectedBloodGroupFilter(null);
                }}
                onRequestBlood={() => {
                  setIsHospitalDirectoryOpen(false);
                  setActiveTab('request_form');
                }}
                initialBloodGroup={selectedBloodGroupFilter}
                onOpenHospitalDashboard={() => {
                  setIsHospitalDirectoryOpen(false);
                  setIsHospitalDashboardOpen(true);
                }}
                userRole={userProfile.role}
                currentDistrict={currentDistrict}
              />
            ) : isAmbulanceDirectoryOpen ? (
              <AmbulanceDirectoryView
                ambulances={ambulances}
                onBack={() => setIsAmbulanceDirectoryOpen(false)}
                userRole={userProfile.role}
                onAmbulanceAdded={(newAmb) => setAmbulances((prev) => [newAmb, ...prev])}
              />
            ) : isHealthEducationOpen ? (
              <HealthEducationView
                articles={initialHealthArticles}
                onBack={() => setIsHealthEducationOpen(false)}
              />
            ) : isHospitalDashboardOpen ? (
              <HospitalDashboardView
                onBack={() => setIsHospitalDashboardOpen(false)}
                userProfile={userProfile}
                hospitals={hospitals}
                onStockUpdated={(hospId, group, count) => {
                  setHospitals((prev) =>
                    prev.map((h) => {
                      if (h.id === hospId && h.stocks) {
                        const nextStatus = count >= 5 ? 'adequate' : count >= 2 ? 'limited' : 'empty';
                        return {
                          ...h,
                          stocks: {
                            ...h.stocks,
                            [group]: { count, status: nextStatus },
                          },
                        };
                      }
                      return h;
                    })
                  );
                }}
              />
            ) : activeTab === 'home' ? (
              <HomeScreen
                nearbyRequests={nearbyRequests}
                camps={camps}
                onRequestBloodClick={() => setActiveTab('request_form')}
                onViewMyRequestsClick={() => setActiveTab('requests')}
                onViewAllRequestsClick={() => setActiveTab('requests')}
                onViewAllCampsClick={() => setActiveTab('home')}
                isDonorAvailable={userProfile.isAvailable}
                onToggleDonorAvailable={handleToggleDonorAvailable}
                onOpenDonorResponse={(req) => setSelectedResponseReq(req)}
                activeRequestCount={myRequest ? 1 : 0}
                onRsvpCamp={handleRsvpCamp}
                onOpenCreateCamp={() => setIsCreateCampOpen(true)}
                onOpenHospitalDirectory={() => setIsHospitalDirectoryOpen(true)}
                onOpenAmbulanceDirectory={() => setIsAmbulanceDirectoryOpen(true)}
                onOpenHealthEducation={() => setIsHealthEducationOpen(true)}
                onOpenHospitalDashboard={() => setIsHospitalDashboardOpen(true)}
                onOpenDonorSetup={() => setIsDonorSetupOpen(true)}
                isProfileComplete={userProfile.isProfileComplete}
                onOpenVerificationExplainer={() => setIsVerificationExplainerOpen(true)}
                userName={isLoggedIn && userProfile.name ? userProfile.name : ''}
                userRole={userProfile.role || 'donor'}
              />
            ) : activeTab === 'requests' ? (
              <BloodRequestsView
                myRequest={myRequest}
                nearbyRequests={nearbyRequests}
                respondingDonors={respondingDonors}
                onConfirmDonor={handleConfirmDonor}
                onDeclineDonor={handleDeclineDonor}
                onCloseRequest={handleCloseRequest}
                onShareRequest={handleShareRequest}
                onFindMoreDonors={() => setActiveTab('donors')}
                onTabSelectRequestForm={() => setActiveTab('request_form')}
                onOpenDonorResponse={(req) => setSelectedResponseReq(req)}
                onOpenChat={(donor) => setActiveChatDonor(donor)}
                onOpenReport={(name, uId, reqId) => {
                  setReportTargetName(name);
                  setReportTargetUserId(uId || null);
                  setReportRequestId(reqId || null);
                }}
                onOpenVerificationExplainer={() => setIsVerificationExplainerOpen(true)}
              />
            ) : activeTab === 'request_form' ? (
              <BloodRequestWizard
                onClose={() => setActiveTab('home')}
                onSubmitRequest={handleCreateRequest}
                onViewCreatedRequest={() => setActiveTab('requests')}
                initialDistrict={currentDistrict}
              />
            ) : activeTab === 'donors' ? (
              <DonorDirectoryView
                donors={donors}
                currentDistrict={currentDistrict}
                onDistrictChange={setCurrentDistrict}
                onRequestBloodClick={() => setActiveTab('request_form')}
                onSendDirectRequest={handleSendDirectRequest}
                onOpenAuth={() => handleOpenAuth('login')}
                currentUserId={userProfile.donorId || (cachedUser as any)?.id}
              />
            ) : activeTab === 'profile' ? (
              <UserProfileView
                userProfile={userProfile}
                isLoggedIn={isLoggedIn}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onToggleAvailability={handleToggleDonorAvailable}
                onOpenAuditLog={() => setIsSettingsOpen(true)}
                onOpenAuth={() => handleOpenAuth('login')}
                onLogout={handleLogout}
                onOpenDonorSetup={() => setIsDonorSetupOpen(true)}
                onUpdateProfile={(updates) => updateAuthenticatedUser(updates)}
              />
            ) : null}
          </main>

          {/* Desktop Auxiliary Sidebar (Visible on Laptop / Desktop screens) */}
          {!isSubPageOpen && activeTab !== 'request_form' && (
            <aside className="hidden lg:flex flex-col w-80 shrink-0 gap-4 sticky top-20 self-start">
              {/* Emergency Hotline Banner */}
              <div className="bg-gradient-to-br from-[#9E0027] to-[#C41E3A] text-white rounded-2xl p-4 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm">
                      {language === 'bn' ? 'জরুরি হেল্পলাইন' : 'Emergency Hotline'}
                    </span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                    {language === 'bn' ? '২৪/৭ সক্রিয়' : '24/7 Active'}
                  </span>
                </div>
                <p className="text-xs text-white/90 leading-relaxed mb-3">
                  {language === 'bn'
                    ? 'জরুরি রক্তের সন্ধানে অথবা যেকোনো জরুরি স্বাস্থ্য সহায়তার জন্য সরাসরি যোগাযোগ করুন।'
                    : 'Contact immediately for emergency blood requests or urgent health support.'}
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href="tel:16263"
                    className="flex-1 py-2 rounded-xl bg-white text-[#9E0027] font-extrabold text-xs text-center shadow-xs hover:bg-[#FDECEF] transition-colors"
                  >
                    {formatDigits('16263')} ({language === 'bn' ? 'স্বাস্থ্য বাতায়ন' : 'Health Line'})
                  </a>
                  <a
                    href="tel:999"
                    className="px-3 py-2 rounded-xl bg-black/20 text-white font-extrabold text-xs text-center hover:bg-black/30 transition-colors"
                  >
                    {formatDigits('999')}
                  </a>
                </div>
              </div>

              {/* Live / Cached Blood Stock Snapshot Widget */}
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E4E6EB]/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-[#1B1B1F]">
                        {isLiveSupabase
                          ? (language === 'bn' ? 'লাইভ ব্লাড ব্যাংক স্টক' : 'Live Blood Bank Stock')
                          : (language === 'bn' ? 'ব্লাড ব্যাংক স্টক' : 'Blood Bank Stock')}
                      </h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                          isLiveSupabase
                            ? 'bg-[#E8F5E9] text-[#005938]'
                            : 'bg-amber-100 text-[#9A5B00]'
                        }`}
                      >
                        {isLiveSupabase ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00744B] animate-pulse" />
                            <span>{language === 'bn' ? 'এইমাত্র আপডেট' : 'Updated now'}</span>
                          </>
                        ) : (
                          <span>{language === 'bn' ? 'ক্যাশড ডেটা' : 'Cached Data'}</span>
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-[#5B5F6B] mt-0.5">
                      {currentDistrict} {language === 'bn' ? 'এলাকা' : 'Area'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedBloodGroupFilter(null);
                      setIsHospitalDirectoryOpen(true);
                    }}
                    className="text-xs text-[#C41E3A] font-bold hover:underline cursor-pointer"
                  >
                    {language === 'bn' ? 'বিস্তারিত' : 'Details'}
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {bloodStockSnapshot.map((item) => (
                    <button
                      key={item.group}
                      onClick={() => {
                        setSelectedBloodGroupFilter(item.group as BloodGroup);
                        setIsHospitalDirectoryOpen(true);
                      }}
                      className={`p-2 rounded-xl text-center border cursor-pointer interactive-card transition-all ${
                        item.status === 'critical'
                          ? 'bg-[#FFDAD6]/40 border-[#FFDAD6] text-[#BA1A1A] hover:bg-[#FFDAD6]/60'
                          : item.status === 'low'
                          ? 'bg-amber-50 border-amber-200 text-[#9A5B00] hover:bg-amber-100'
                          : 'bg-[#F7F7F9] border-[#E4E6EB] text-[#1B1B1F] hover:bg-white hover:border-[#C41E3A]'
                      }`}
                      title={language === 'bn' ? `${item.group} ফিল্টার দেখতে ক্লিক করুন` : `Click to view ${item.group} hospitals`}
                    >
                      <span className="font-extrabold text-xs block leading-none">{item.group}</span>
                      <span className="text-xs font-bold block mt-1">
                        {formatDigits(item.count)} <span className="text-[10px] font-normal">{language === 'bn' ? 'ব্যাগ' : 'bags'}</span>
                      </span>
                      <span className="text-[9px] block opacity-80 leading-none mt-0.5">
                        {item.status === 'critical'
                          ? (language === 'bn' ? 'সংকট' : 'Critical')
                          : item.status === 'low'
                          ? (language === 'bn' ? 'কম' : 'Low')
                          : (language === 'bn' ? 'পর্যাপ্ত' : 'Good')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Services Shortcut Card */}
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E4E6EB]/70 space-y-2.5">
                <h4 className="font-bold text-xs text-[#5B5F6B] uppercase tracking-wider">
                  {language === 'bn' ? 'জরুরি সেবা লিংক' : 'Emergency Services'}
                </h4>
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      setSelectedBloodGroupFilter(null);
                      setIsHospitalDirectoryOpen(true);
                    }}
                    className="w-full p-2 rounded-xl hover:bg-[#F7F7F9] flex items-center justify-between text-left transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold text-[#1B1B1F]">
                      <Building2 className="w-4 h-4 text-[#0D58C9]" />
                      <span>
                        {language === 'bn' ? 'হাসপাতাল ও ব্লাড ব্যাংক তালিকা' : 'Hospitals & Blood Banks'}
                      </span>
                    </span>
                    <span className="text-xs text-[#5B5F6B]">
                      {formatDigits(8)} {language === 'bn' ? 'টি' : ''}
                    </span>
                  </button>

                  <button
                    onClick={() => setIsAmbulanceDirectoryOpen(true)}
                    className="w-full p-2 rounded-xl hover:bg-[#F7F7F9] flex items-center justify-between text-left transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold text-[#1B1B1F]">
                      <Truck className="w-4 h-4 text-[#BA1A1A]" />
                      <span>
                        {language === 'bn' ? 'জরুরি অ্যাম্বুলেন্স সেবা' : 'Emergency Ambulance'}
                      </span>
                    </span>
                    <span className="text-xs text-[#5B5F6B]">
                      {formatDigits(6)} {language === 'bn' ? 'টি' : ''}
                    </span>
                  </button>

                  <button
                    onClick={() => setIsHealthEducationOpen(true)}
                    className="w-full p-2 rounded-xl hover:bg-[#F7F7F9] flex items-center justify-between text-left transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold text-[#1B1B1F]">
                      <Heart className="w-4 h-4 text-[#00744B]" />
                      <span>
                        {language === 'bn' ? 'রক্তদানের নিয়ম ও স্বাস্থ্য নির্দেশিকা' : 'Donation Guidelines & Rules'}
                      </span>
                    </span>
                    <span className="text-xs text-[#5B5F6B]">
                      {language === 'bn' ? 'গাইড' : 'Guide'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Trust & Ethics Badge with Suspicious Report Trigger */}
              <div className="p-3.5 bg-[#E8F5E9]/50 rounded-2xl border border-[#C8E6C9] flex flex-col gap-2">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#005938] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs text-[#005938]">
                      {language === 'bn' ? '১০০% স্বেচ্ছাসেবী মানবিক উদ্যোগ' : '100% Voluntary Humanitarian Mission'}
                    </h4>
                    <p className="text-xs text-[#2E7D32] mt-0.5 leading-relaxed">
                      {language === 'bn'
                        ? 'রক্ত কেনাবেচা দণ্ডনীয় অপরাধ। এই প্ল্যাটফর্ম শুধুমাত্র রক্তদাতা ও রোগীর স্বজনদের মাঝে নিঃস্বার্থ মানবিক সংযোগ ঘটিয়ে দেয়।'
                        : 'Commercial trade of blood is illegal. This platform connects selfless donors directly with verified patients.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setReportTargetName('সাধারণ সন্দেহজনক কার্যকলাপ')}
                  className="mt-1 pt-2 border-t border-[#C8E6C9]/80 text-xs font-bold text-[#C41E3A] hover:underline flex items-center gap-1.5 cursor-pointer self-start"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-[#C41E3A]" />
                  <span>{language === 'bn' ? 'সন্দেহজনক অনুরোধ রিপোর্ট করুন' : 'Report Suspicious Request'}</span>
                </button>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Footer: ONLY visible on tablet, laptop, and desktop computer (hidden on mobile phones) */}
      {!isSubPageOpen && activeTab !== 'request_form' && (
        <Footer
          onTabChange={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onRequestBloodClick={() => {
            setActiveTab('request_form');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenHospitalDirectory={() => setIsHospitalDirectoryOpen(true)}
          onOpenAmbulanceDirectory={() => setIsAmbulanceDirectoryOpen(true)}
          onOpenHealthEducation={() => setIsHealthEducationOpen(true)}
          onOpenHospitalDashboard={() => setIsHospitalDashboardOpen(true)}
        />
      )}

      {/* Bottom Navigation: ONLY for mobile screens (md:hidden) */}
      {!isSubPageOpen && activeTab !== 'request_form' && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          activeRequestsCount={myRequest ? 1 : 0}
        />
      )}

      {/* Auth Modal (Phone / Password / OTP) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccessLogin={handleSuccessLogin}
        initialMode={authInitialMode}
        currentDistrict={currentDistrict}
      />

      {/* Donor Response Experience Modal */}
      <DonorResponseModal
        request={selectedResponseReq}
        onClose={() => setSelectedResponseReq(null)}
        onSuccessResponse={(etaMinutes, transportMode) => {
          if (selectedResponseReq) {
            handleRespondToRequest(selectedResponseReq.id, etaMinutes, transportMode);
          }
        }}
      />

      {/* 4-Step Donor Profile Setup Wizard */}
      <DonorProfileSetupWizard
        isOpen={isDonorSetupOpen}
        onClose={() => setIsDonorSetupOpen(false)}
        initialProfile={userProfile}
        onComplete={(updatedUser) => {
          setIsDonorSetupOpen(false);
          setNotifications((prev) => [
            {
              id: `NOTIF-SETUP-${Date.now()}`,
              category: 'my-req',
              title: 'ডোনার প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!',
              description: 'আপনার মোবাইল নম্বর, রক্তের গ্রুপ ও এলাকা নিশ্চিত করা হয়েছে।',
              timestamp: 'এইমাত্র',
              isUnread: true,
            },
            ...prev,
          ]);
        }}
      />

      {/* Safe Emergency Chat Modal */}
      {activeChatDonor && (
        <SafeChatModal
          donorName={activeChatDonor.name}
          donorId={activeChatDonor.id}
          donorBloodGroup={activeChatDonor.bloodGroup}
          requestId={myRequest?.id || 'REQ-LIVE'}
          currentUserId={userProfile.donorId || 'user-current'}
          currentUserName={userProfile.name || 'রোগীর স্বজন'}
          onClose={() => setActiveChatDonor(null)}
          onOpenReport={(name, uId, reqId) => {
            setReportTargetName(name);
            setReportTargetUserId(uId || activeChatDonor.id);
            setReportRequestId(reqId || myRequest?.id || 'REQ-LIVE');
          }}
        />
      )}

      {/* Trust & Safety Report Modal */}
      <ReportModal
        isOpen={!!reportTargetName}
        targetName={reportTargetName || ''}
        targetUserId={reportTargetUserId || undefined}
        requestId={reportRequestId || myRequest?.id || undefined}
        reporterId={userProfile.donorId || 'reporter-user'}
        onClose={() => {
          setReportTargetName(null);
          setReportTargetUserId(null);
          setReportRequestId(null);
        }}
        isAdmin={userProfile.role === 'admin' || userProfile.role === 'hospital_operator'}
      />

      {/* Create Donation Camp Modal */}
      <CreateCampModal
        isOpen={isCreateCampOpen}
        onClose={() => setIsCreateCampOpen(false)}
        onCampCreated={(newCamp) => {
          setCamps((prev) => [newCamp, ...prev]);
          setNotifications((prev) => [
            {
              id: `NOTIF-CAMP-${Date.now()}`,
              category: 'camps',
              title: 'নতুন রক্তদান ক্যাম্পেইন তৈরি হয়েছে',
              description: `${newCamp.organizer} আয়োজিত ক্যাম্পেইনটি সফলভাবে যুক্ত হয়েছে।`,
              timestamp: 'এইমাত্র',
              isUnread: true,
            },
            ...prev,
          ]);
        }}
        currentDistrict={currentDistrict}
      />

      {/* Verification Explainer Bottom Sheet */}
      <VerificationExplainerSheet
        isOpen={isVerificationExplainerOpen}
        onClose={() => setIsVerificationExplainerOpen(false)}
      />

      {/* Quick Search Modal (/ or Ctrl+K / Cmd+K) */}
      <QuickSearchModal
        isOpen={isQuickSearchOpen}
        onClose={() => setIsQuickSearchOpen(false)}
        onSelectDistrict={(dist) => setCurrentDistrict(dist)}
        onSelectBloodGroup={(bg) => {
          setSelectedBloodGroupFilter(bg);
          setIsHospitalDirectoryOpen(true);
        }}
        onOpenHospitalDirectory={() => setIsHospitalDirectoryOpen(true)}
        onRequestBlood={() => setActiveTab('request_form')}
        onOpenAmbulance={() => setIsAmbulanceDirectoryOpen(true)}
      />

      {/* Browser Web Push Notification Permission Banner */}
      <PushNotificationBanner
        district={currentDistrict}
        bloodGroup={userProfile.bloodGroup}
        userId={userProfile.donorId}
      />
    </div>
  );
};
