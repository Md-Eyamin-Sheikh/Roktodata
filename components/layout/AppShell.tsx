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
import { VerificationExplainerSheet } from '@/components/verification/VerificationExplainerSheet';
import { LiveDatabaseViewer } from '@/components/database/LiveDatabaseViewer';

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
} from '@/lib/types';
import { Phone, ShieldCheck, Heart, Building2, Truck, Plus, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { toBengaliDigits } from '@/lib/bengali-utils';
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
  fetchNotifications,
  markAllNotificationsAsRead,
  subscribeToNotifications,
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
} from '@/lib/services/authService';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export const AppShell: React.FC = () => {
  const { language, t, formatDigits } = useLanguage();

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [currentDistrict, setCurrentDistrict] = useState('বগুড়া সদর');

  // Sub-screens & Modals
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHospitalDirectoryOpen, setIsHospitalDirectoryOpen] = useState(false);
  const [isAmbulanceDirectoryOpen, setIsAmbulanceDirectoryOpen] = useState(false);
  const [isHealthEducationOpen, setIsHealthEducationOpen] = useState(false);
  const [isHospitalDashboardOpen, setIsHospitalDashboardOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDonorSetupOpen, setIsDonorSetupOpen] = useState(false);
  const [isVerificationExplainerOpen, setIsVerificationExplainerOpen] = useState(false);

  // Active chat & reports
  const [activeChatDonor, setActiveChatDonor] = useState<RespondingDonor | null>(null);
  const [reportTargetName, setReportTargetName] = useState<string | null>(null);

  // Data States - SSR-safe external store subscription (eliminates hydration mismatch and cascading renders)
  const cachedUser = React.useSyncExternalStore(
    subscribeAuth,
    getAuthenticatedUser,
    () => null
  );

  const userProfile: UserProfileType = cachedUser || initialUserProfile;
  const isLoggedIn = Boolean(cachedUser && cachedUser.name && cachedUser.phone);
  const [nearbyRequests, setNearbyRequests] = useState<EmergencyRequest[]>(initialEmergencyRequests);
  const [camps, setCamps] = useState<DonationCamp[]>(initialDonationCamps);
  const [donors, setDonors] = useState<Donor[]>(initialDonors);
  const [hospitals, setHospitals] = useState<HospitalBloodBank[]>(initialHospitalsAndBanks);
  const [ambulances, setAmbulances] = useState<AmbulanceService[]>(initialAmbulances);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isDbExplorerOpen, setIsDbExplorerOpen] = useState(false);

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
          if (loadedReqs && loadedReqs.length > 0) setNearbyRequests(loadedReqs);
          if (loadedCamps && loadedCamps.length > 0) setCamps(loadedCamps);
          if (loadedDonors && loadedDonors.length > 0) setDonors(loadedDonors);
          if (loadedHospitals && loadedHospitals.length > 0) setHospitals(loadedHospitals);
          if (loadedAmbulances && loadedAmbulances.length > 0) setAmbulances(loadedAmbulances);
          if (loadedNotifs && loadedNotifs.length > 0) setNotifications(loadedNotifs);
        }
      } catch (err) {
        console.error('Error syncing district data:', err);
      }
    };

    loadDistrictData();

    // 2. Setup Supabase Realtime channel for district broadcast
    const unsubscribeDistrict = subscribeToDistrictEvents(
      currentDistrict,
      (newReq) => {
        if (!isMounted) return;
        playUrgentAlertSound();
        const title = `🚨 নতুন রক্তের আবেদন: ${newReq.blood_group || 'রক্ত'} প্রয়োজন`;
        const desc = `${newReq.hospital_name || 'হাসপাতাল'} থেকে রক্তের আবেদন এসেছে।`;
        triggerNativeNotification(title, desc);
        setNotifications((prev) => [
          {
            id: `NOTIF-REALTIME-${Date.now()}`,
            category: 'urgent',
            title,
            description: desc,
            timestamp: 'এইমাত্র',
            bloodGroup: newReq.blood_group,
            isUnread: true,
          },
          ...prev,
        ]);
      },
      (newResponse) => {
        if (!isMounted) return;
        playNotificationSound();
        const title = '✅ একজন রক্তদাতা সাড়া দিয়েছেন!';
        const desc = `আনুমানিক ${newResponse.eta_minutes || 30} মিনিটে পৌঁছাবেন।`;
        triggerNativeNotification(title, desc);
        setNotifications((prev) => [
          {
            id: `NOTIF-RESP-${Date.now()}`,
            category: 'my-req',
            title,
            description: desc,
            timestamp: 'এইমাত্র',
            isUnread: true,
          },
          ...prev,
        ]);
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

  // My Active Request State (defaults to null for real users until they post an emergency request)
  const [myRequest, setMyRequest] = useState<EmergencyRequest | null>(null);

  // Responding Donors for active request (populated in real-time when donors respond)
  const [respondingDonors, setRespondingDonors] = useState<RespondingDonor[]>([]);

  // Selected Request for Donor Response Modal
  const [selectedResponseReq, setSelectedResponseReq] = useState<EmergencyRequest | null>(null);

  // Unread notifications count
  const unreadCount = notifications.filter((n) => n.isUnread).length;

  // Toggle Donor Availability
  const handleToggleDonorAvailable = () => {
    if (!isLoggedIn) {
      setIsAuthOpen(true);
      return;
    }
    const nextVal = !userProfile.isAvailable;
    setDonorAvailability(userProfile.donorId, nextVal);
    updateAuthenticatedUser({ isAvailable: nextVal });
  };

  // Real login success handler
  const handleSuccessLogin = (user: UserProfileType) => {
    setIsAuthOpen(false);
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
    setNotifications((prev) => [
      {
        id: `NOTIF-LOGOUT-${Date.now()}`,
        category: 'my-req',
        title: 'লগআউট সম্পন্ন হয়েছে',
        description: 'আপনি সফলভাবে অ্যাকাউন্ট থেকে প্রস্থান করেছেন।',
        timestamp: 'এইমাত্র',
        isUnread: true,
      },
      ...prev,
    ]);
  };

  // Submit Blood Request from Wizard
  const handleCreateRequest = async (newReq: Partial<EmergencyRequest>) => {
    const created = await createEmergencyRequest({
      ...newReq,
      location: currentDistrict,
    });

    setMyRequest(created);
    setNearbyRequests((prev) => [created, ...prev]);
    setActiveTab('requests');

    // Add alert notification
    setNotifications((prev) => [
      {
        id: `NOTIF-${Date.now()}`,
        category: 'my-req',
        title: 'আপনার জরুরি রক্তের অনুরোধ প্রকাশিত হয়েছে',
        description: `${created.bloodGroup} রক্তের জন্য নিকটস্থ সকল ডোনারদের কাছে নোটিফিকেশন পাঠানো হয়েছে।`,
        timestamp: 'এইমাত্র',
        isUnread: true,
      },
      ...prev,
    ]);
  };

  // Donor Responds to a request
  const handleRespondToRequest = (reqId: string, etaMinutes: number) => {
    // Send to Supabase
    submitDonorResponse(reqId, userProfile.name, userProfile.bloodGroup, userProfile.phone, etaMinutes);

    const target = nearbyRequests.find((r) => r.id === reqId);
    if (target) {
      if (myRequest && myRequest.id === reqId) {
        setRespondingDonors((prev) => [
          ...prev,
          {
            id: `RESP-${Date.now()}`,
            name: userProfile.name,
            bloodGroup: userProfile.bloodGroup,
            phone: userProfile.phone,
            distanceKm: target.distanceKm,
            etaMinutes,
            isVerified: true,
            lastDonationMonths: 4,
            status: 'on_the_way',
          },
        ]);
      } else {
        setNearbyRequests((prev) =>
          prev.map((r) =>
            r.id === reqId
              ? { ...r, hasResponded: true, userResponseEta: etaMinutes }
              : r
          )
        );
      }

      setNotifications((prev) => [
        {
          id: `NOTIF-${Date.now()}`,
          category: 'urgent',
          title: 'রক্তদানে আপনার সাড়া সফলভাবে গৃহীত হয়েছে',
          description: `হাসপাতালে পৌঁছানোর আনুমানিক সময়: ${etaMinutes} মিনিট। মানবিক সহায়তার জন্য ধন্যবাদ।`,
          timestamp: 'এইমাত্র',
          isUnread: true,
        },
        ...prev,
      ]);
    }
  };

  // RSVP to camp
  const handleRsvpCamp = (campId: string) => {
    setCamps((prev) =>
      prev.map((c) =>
        c.id === campId
          ? {
              ...c,
              isRsvp: !c.isRsvp,
              registeredCount: c.isRsvp ? c.registeredCount - 1 : c.registeredCount + 1,
            }
          : c
      )
    );
  };

  // Confirm specific donor
  const handleConfirmDonor = (donorId: string) => {
    setRespondingDonors((prev) =>
      prev.map((d) => (d.id === donorId ? { ...d, status: 'confirmed' } : d))
    );
    if (myRequest) {
      setMyRequest({ ...myRequest, trackingStep: 4 });
    }
  };

  // Close active request
  const handleCloseRequest = () => {
    if (confirm('অনুরোধ বন্ধ করার কারণ নির্বাচন করুন: রক্ত পেয়েছি / আর প্রয়োজন নেই')) {
      setMyRequest(null);
      alert('অনুরোধটি সফলভাবে সম্পন্ন হিসেবে বন্ধ করা হয়েছে।');
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

  return (
    <div
      style={{
        fontSize:
          userProfile.textSize === '125%'
            ? '1.125rem'
            : userProfile.textSize === '150%'
            ? '1.25rem'
            : '1rem',
      }}
      className="min-h-screen bg-[#F7F7F9] flex flex-col text-[#1B1B1F] selection:bg-[#FDECEF] selection:text-[#C41E3A] pb-20 md:pb-0"
    >
      {/* Global Responsive Top Header */}
      {!isSubPageOpen && activeTab !== 'request_form' && (
        <Header
          currentDistrict={currentDistrict}
          onDistrictChange={setCurrentDistrict}
          unreadCount={unreadCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => setActiveTab('profile')}
          onOpenAuth={() => setIsAuthOpen(true)}
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
          onOpenDbExplorer={() => setIsDbExplorerOpen(true)}
        />
      )}

      {/* Main Body Layout */}
      <div
        className={`w-full flex-1 flex justify-center ${
          !isSubPageOpen && activeTab !== 'request_form' ? 'pt-14 md:pt-16' : 'pt-0'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 py-2 sm:py-5 flex gap-6 items-start">
          
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
                onOpenDbExplorer={() => setIsDbExplorerOpen(true)}
                onLogout={() => {
                  setIsSettingsOpen(false);
                  handleLogout();
                }}
              />
            ) : isHospitalDirectoryOpen ? (
              <HospitalBloodBankView
                hospitals={hospitals}
                onBack={() => setIsHospitalDirectoryOpen(false)}
                onRequestBlood={() => {
                  setIsHospitalDirectoryOpen(false);
                  setActiveTab('request_form');
                }}
              />
            ) : isAmbulanceDirectoryOpen ? (
              <AmbulanceDirectoryView
                ambulances={ambulances}
                onBack={() => setIsAmbulanceDirectoryOpen(false)}
              />
            ) : isHealthEducationOpen ? (
              <HealthEducationView
                articles={initialHealthArticles}
                onBack={() => setIsHealthEducationOpen(false)}
              />
            ) : isHospitalDashboardOpen ? (
              <HospitalDashboardView
                onBack={() => setIsHospitalDashboardOpen(false)}
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
                onOpenHospitalDirectory={() => setIsHospitalDirectoryOpen(true)}
                onOpenAmbulanceDirectory={() => setIsAmbulanceDirectoryOpen(true)}
                onOpenHealthEducation={() => setIsHealthEducationOpen(true)}
                onOpenHospitalDashboard={() => setIsHospitalDashboardOpen(true)}
                onOpenDonorSetup={() => setIsDonorSetupOpen(true)}
                isProfileComplete={userProfile.isProfileComplete}
                onOpenVerificationExplainer={() => setIsVerificationExplainerOpen(true)}
                userName={isLoggedIn && userProfile.name ? userProfile.name : ''}
              />
            ) : activeTab === 'requests' ? (
              <BloodRequestsView
                myRequest={myRequest}
                nearbyRequests={nearbyRequests}
                respondingDonors={respondingDonors}
                onConfirmDonor={handleConfirmDonor}
                onCloseRequest={handleCloseRequest}
                onShareRequest={handleShareRequest}
                onFindMoreDonors={() => setActiveTab('donors')}
                onTabSelectRequestForm={() => setActiveTab('request_form')}
                onOpenChat={(donor) => setActiveChatDonor(donor)}
                onOpenReport={(name) => setReportTargetName(name)}
                onOpenVerificationExplainer={() => setIsVerificationExplainerOpen(true)}
              />
            ) : activeTab === 'request_form' ? (
              <BloodRequestWizard
                onClose={() => setActiveTab('home')}
                onSubmitRequest={handleCreateRequest}
              />
            ) : activeTab === 'donors' ? (
              <DonorDirectoryView
                donors={donors}
                onRequestBloodClick={() => setActiveTab('request_form')}
                onSendDirectRequest={handleSendDirectRequest}
              />
            ) : activeTab === 'profile' ? (
              <UserProfileView
                userProfile={userProfile}
                isLoggedIn={isLoggedIn}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onToggleAvailability={handleToggleDonorAvailable}
                onOpenAuditLog={() => setIsSettingsOpen(true)}
                onOpenAuth={() => setIsAuthOpen(true)}
                onLogout={handleLogout}
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

              {/* Live Blood Stock Snapshot Widget */}
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E4E6EB]/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#1B1B1F]">
                      {language === 'bn' ? 'লাইভ ব্লাড ব্যাংক স্টক' : 'Live Blood Bank Stock'}
                    </h3>
                    <p className="text-[11px] text-[#5B5F6B]">
                      {currentDistrict} {language === 'bn' ? 'এলাকা' : 'Area'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsHospitalDashboardOpen(true)}
                    className="text-[11px] text-[#C41E3A] font-bold hover:underline cursor-pointer"
                  >
                    {language === 'bn' ? 'বিস্তারিত' : 'Details'}
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {bloodStockSnapshot.map((item) => (
                    <div
                      key={item.group}
                      className={`p-2 rounded-xl text-center border ${
                        item.status === 'critical'
                          ? 'bg-[#FFDAD6]/40 border-[#FFDAD6] text-[#BA1A1A]'
                          : item.status === 'low'
                          ? 'bg-amber-50 border-amber-200 text-[#9A5B00]'
                          : 'bg-[#F7F7F9] border-[#E4E6EB] text-[#1B1B1F]'
                      }`}
                    >
                      <span className="font-extrabold text-xs block leading-none">{item.group}</span>
                      <span className="text-[11px] font-bold block mt-1">
                        {formatDigits(item.count)}
                      </span>
                      <span className="text-[9px] block opacity-80 leading-none">
                        {item.status === 'critical'
                          ? (language === 'bn' ? 'সংকট' : 'Critical')
                          : item.status === 'low'
                          ? (language === 'bn' ? 'কম' : 'Low')
                          : (language === 'bn' ? 'পর্যাপ্ত' : 'Good')}
                      </span>
                    </div>
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
                    onClick={() => setIsHospitalDirectoryOpen(true)}
                    className="w-full p-2 rounded-xl hover:bg-[#F7F7F9] flex items-center justify-between text-left transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold text-[#1B1B1F]">
                      <Building2 className="w-4 h-4 text-[#0D58C9]" />
                      <span>
                        {language === 'bn' ? 'হাসপাতাল ও ব্লাড ব্যাংক তালিকা' : 'Hospitals & Blood Banks'}
                      </span>
                    </span>
                    <span className="text-[10px] text-[#5B5F6B]">
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
                    <span className="text-[10px] text-[#5B5F6B]">
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
                    <span className="text-[10px] text-[#5B5F6B]">
                      {language === 'bn' ? 'গাইড' : 'Guide'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Trust & Ethics Badge */}
              <div className="p-3.5 bg-[#E8F5E9]/50 rounded-2xl border border-[#C8E6C9] flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#005938] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-[#005938]">
                    {language === 'bn' ? '১০০% স্বেচ্ছাসেবী মানবিক উদ্যোগ' : '100% Voluntary Humanitarian Mission'}
                  </h4>
                  <p className="text-[11px] text-[#2E7D32] mt-0.5 leading-relaxed">
                    {language === 'bn'
                      ? 'রক্ত কেনাবেচা দণ্ডনীয় অপরাধ। এই প্ল্যাটফর্ম শুধুমাত্র রক্তদাতা ও রোগীর স্বজনদের মাঝে নিঃস্বার্থ মানবিক সংযোগ ঘটিয়ে দেয়।'
                      : 'Commercial trade of blood is illegal. This platform connects selfless donors directly with verified patients.'}
                  </p>
                </div>
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
        currentDistrict={currentDistrict}
      />

      {/* Donor Response Experience Modal */}
      <DonorResponseModal
        request={selectedResponseReq}
        onClose={() => setSelectedResponseReq(null)}
        onSuccessResponse={(etaMinutes) => {
          if (selectedResponseReq) {
            handleRespondToRequest(selectedResponseReq.id, etaMinutes);
          }
        }}
      />

      {/* 4-Step Donor Profile Setup Wizard */}
      <DonorProfileSetupWizard
        isOpen={isDonorSetupOpen}
        onClose={() => setIsDonorSetupOpen(false)}
        onComplete={(updates) => {
          updateAuthenticatedUser(updates);
          alert('ডোনার প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!');
        }}
      />

      {/* Safe Emergency Chat Modal */}
      {activeChatDonor && (
        <SafeChatModal
          donorName={activeChatDonor.name}
          onClose={() => setActiveChatDonor(null)}
          onOpenReport={() => setReportTargetName(activeChatDonor.name)}
        />
      )}

      {/* Trust & Safety Report Modal */}
      <ReportModal
        isOpen={!!reportTargetName}
        targetName={reportTargetName || ''}
        onClose={() => setReportTargetName(null)}
      />

      {/* Verification Explainer Bottom Sheet */}
      <VerificationExplainerSheet
        isOpen={isVerificationExplainerOpen}
        onClose={() => setIsVerificationExplainerOpen(false)}
      />

      {/* Live Supabase Database Tables Viewer */}
      <LiveDatabaseViewer
        isOpen={isDbExplorerOpen}
        onClose={() => setIsDbExplorerOpen(false)}
      />
    </div>
  );
};
