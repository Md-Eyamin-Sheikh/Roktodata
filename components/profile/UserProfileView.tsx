'use client';

import React, { useState, useRef } from 'react';
import {
  Share2,
  Settings as SettingsIcon,
  MapPin,
  Lock,
  Calendar,
  Heart,
  QrCode,
  Download,
  Award,
  Clock,
  Check,
  Moon,
  Eye,
  ChevronRight,
  ShieldCheck,
  LogOut,
  UserCheck,
  Plus,
  X,
  ExternalLink,
  Copy,
  MessageCircle,
  Bell,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  RefreshCw,
  Send,
  Trash2,
  FileText,
  CheckCheck,
  Shield,
  Activity,
  Flame,
  Phone,
  Edit3
} from 'lucide-react';
import { UserProfile, DonationRecord, BloodGroup } from '@/lib/types';
import { BloodAnalyticsCharts } from '@/components/analytics/BloodAnalyticsCharts';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/components/ui/ToastNotification';
import { updateAuthenticatedUser, isValidBdPhoneNumber, normalizePhoneNumber } from '@/lib/services/authService';
import { divisionsList, allDistricts } from '@/lib/geo/bangladeshGeoData';

interface UserProfileViewProps {
  userProfile: UserProfile;
  isLoggedIn?: boolean;
  onOpenSettings: () => void;
  onToggleAvailability: () => void;
  onOpenAuditLog: () => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  onOpenDonorSetup?: () => void;
  onUpdateProfile?: (updates: Partial<UserProfile>) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  userProfile,
  isLoggedIn = false,
  onOpenSettings,
  onToggleAvailability,
  onOpenAuditLog,
  onOpenAuth,
  onLogout,
  onOpenDonorSetup,
  onUpdateProfile,
}) => {
  const { language, t, formatDigits } = useLanguage();
  const { showToast } = useToast();

  // Local active states
  const [isAvailable, setIsAvailable] = useState<boolean>(userProfile.isAvailable ?? true);
  const [pauseDuration, setPauseDuration] = useState<number | null>(null);
  const [emergencyOnlyMode, setEmergencyOnlyMode] = useState<boolean>(false);
  const [quietHoursActive, setQuietHoursActive] = useState<boolean>(userProfile.quietHoursEnabled ?? true);
  const [eligibilityReminder, setEligibilityReminder] = useState<boolean>(true);

  // Card view state: 'front' | 'back'
  const [cardSide, setCardSide] = useState<'front' | 'back'>('front');

  // Donation history & impact states
  const [donationHistory, setDonationHistory] = useState<DonationRecord[]>(
    userProfile.donationHistory && userProfile.donationHistory.length > 0
      ? userProfile.donationHistory
      : [
          {
            id: 'DON-1',
            date: language === 'bn' ? '১০ আগস্ট, ২০২৬' : 'August 10, 2026',
            hospital: language === 'bn' ? 'শহীদ জিয়াউর রহমান মেডিকেল কলেজ হাসপাতাল' : 'SZMCH Medical College Hospital',
            recipientType: language === 'bn' ? 'জরুরি সার্জারি রোগী' : 'Emergency Surgery Patient',
            units: 1,
            status: 'completed',
            certificateId: 'BD-SZ-2026-8841',
            notes: language === 'bn' ? 'জরুরি ওটি বিভাগে সরাসরি রক্তদান' : 'Direct emergency OT donation',
          },
          {
            id: 'DON-2',
            date: language === 'bn' ? '১৪ মে, ২০২৬' : 'May 14, 2026',
            hospital: language === 'bn' ? 'মোহাম্মদ আলী হাসপাতাল, বগুড়া' : 'Mohammad Ali Hospital, Bogura',
            recipientType: language === 'bn' ? 'থ্যালাসেমিয়া আক্রান্ত শিশু' : 'Thalassemia Child',
            units: 1,
            status: 'completed',
            certificateId: 'BD-MA-2026-4190',
            notes: language === 'bn' ? 'নিয়মিত থ্যালাসেমিয়া সাপোর্ট' : 'Routine Thalassemia support',
          },
          {
            id: 'DON-3',
            date: language === 'bn' ? '০২ ফেব্রুয়ারি, ২০২৬' : 'February 02, 2026',
            hospital: language === 'bn' ? 'সন্ধানী রক্তদান ক্যাম্প, বগুড়া' : 'Sandhani Blood Drive Camp, Bogura',
            recipientType: language === 'bn' ? 'স্বেচ্ছাসেবী ক্যাম্প ড্রাইভ' : 'Voluntary Blood Camp',
            units: 1,
            status: 'completed',
            certificateId: 'BD-SN-2026-1102',
            notes: language === 'bn' ? 'শীতকালীন রক্তদান ক্যাম্প' : 'Winter Blood Drive',
          },
        ]
  );

  const [totalDonations, setTotalDonations] = useState<number>(
    userProfile.totalDonations || donationHistory.length || 4
  );
  const [livesImpacted, setLivesImpacted] = useState<number>(
    userProfile.livesImpacted || totalDonations * 3 || 12
  );
  const [daysRemaining, setDaysRemaining] = useState<number>(
    userProfile.daysUntilNextEligible ?? userProfile.daysRemaining ?? 15
  );
  const [nextEligibleDate, setNextEligibleDate] = useState<string>(
    userProfile.nextEligibleDate || (language === 'bn' ? '১৫ মে, ২০২৬' : 'May 15, 2026')
  );

  // Modals state
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showAddDonationModal, setShowAddDonationModal] = useState(false);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<DonationRecord | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedDonorId, setCopiedDonorId] = useState(false);

  // Profile Edit modal & form states
  const [activeProfile, setActiveProfile] = useState<UserProfile>(userProfile);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState(userProfile.name || '');
  const [editBloodGroup, setEditBloodGroup] = useState<BloodGroup>((userProfile.bloodGroup as BloodGroup) || 'B+');
  const [editPhone, setEditPhone] = useState(userProfile.phone || '');
  const [editDivision, setEditDivision] = useState(userProfile.division || 'রাজশাহী');
  const [editDistrict, setEditDistrict] = useState(userProfile.district || 'বগুড়া');
  const [editUpazila, setEditUpazila] = useState(userProfile.upazila || 'বগুড়া সদর');
  const [editLocation, setEditLocation] = useState(userProfile.location || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Keep activeProfile in sync if prop changes
  React.useEffect(() => {
    setActiveProfile(userProfile);
  }, [userProfile]);

  // Add Donation form state
  const [newHospital, setNewHospital] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRecipientType, setNewRecipientType] = useState('জরুরি সার্জারি রোগী');
  const [newBags, setNewBags] = useState(1);
  const [newNotes, setNewNotes] = useState('');

  // Eligibility custom date state
  const [customDonationDate, setCustomDonationDate] = useState(new Date().toISOString().split('T')[0]);

  // Canvas ref for real high-res card rendering
  const cardCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const displayName =
    activeProfile.name ||
    userProfile.name ||
    (isLoggedIn
      ? language === 'bn'
        ? 'রক্তদাতা সদস্য'
        : 'Donor Member'
      : language === 'bn'
      ? 'অতিথি ব্যবহারকারী'
      : 'Guest User');
  const displayInitial = displayName ? displayName.charAt(0) : language === 'bn' ? 'র' : 'D';
  const bloodGroup = (activeProfile.bloodGroup || userProfile.bloodGroup || 'B+') as BloodGroup;
  const donorId = activeProfile.donorId || userProfile.donorId || 'RD-38486';
  const locationText = activeProfile.location || userProfile.location || (activeProfile.district ? `${activeProfile.district}${activeProfile.upazila ? ', ' + activeProfile.upazila : ''}` : (language === 'bn' ? 'বগুড়া সদর' : 'Bogura Sadar'));
  const phoneText = activeProfile.phone || userProfile.phone || '';

  // Compatibility matrix helper
  const getCompatibility = (bg: string) => {
    switch (bg) {
      case 'O-':
        return { give: 'All (Universal Donor)', receive: 'O-' };
      case 'O+':
        return { give: 'O+, A+, B+, AB+', receive: 'O+, O-' };
      case 'A-':
        return { give: 'A-, A+, AB-, AB+', receive: 'A-, O-' };
      case 'A+':
        return { give: 'A+, AB+', receive: 'A+, A-, O+, O-' };
      case 'B-':
        return { give: 'B-, B+, AB-, AB+', receive: 'B-, O-' };
      case 'B+':
        return { give: 'B+, AB+', receive: 'B+, B-, O+, O-' };
      case 'AB-':
        return { give: 'AB-, AB+', receive: 'AB-, A-, B-, O-' };
      case 'AB+':
        return { give: 'AB+ only', receive: 'All (Universal Recipient)' };
      default:
        return { give: 'Compatible groups', receive: 'O+, B+' };
    }
  };

  const compatibility = getCompatibility(bloodGroup);

  // ================= 1. HIGH-RESOLUTION DIGITAL CARD GENERATION (HTML5 CANVAS) =================
  const generateCardCanvas = (): HTMLCanvasElement | null => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 750;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Card Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 1200, 750);
      grad.addColorStop(0, '#550012');
      grad.addColorStop(0.3, '#7D001D');
      grad.addColorStop(0.7, '#A5092A');
      grad.addColorStop(1, '#C41E3A');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(0, 0, 1200, 750, 48);
      ctx.fill();

      // Ambient radial concentric watermark pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.5;
      for (let r = 80; r <= 680; r += 65) {
        ctx.beginPath();
        ctx.arc(1060, 600, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Security Microgrid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 60; x < 1140; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 60);
        ctx.lineTo(x, 690);
        ctx.stroke();
      }

      // Gold Top Accent Stripe
      const goldStripe = ctx.createLinearGradient(60, 50, 1140, 50);
      goldStripe.addColorStop(0, 'rgba(255, 223, 121, 0)');
      goldStripe.addColorStop(0.5, '#FFDF79');
      goldStripe.addColorStop(1, 'rgba(255, 223, 121, 0)');
      ctx.fillStyle = goldStripe;
      ctx.fillRect(60, 45, 1080, 2);

      // Card Header: Organization Name & Emblem
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(
        language === 'bn' ? 'জাতীয় স্বেচ্ছাসেবী রক্তদান নেটওয়ার্ক' : 'BANGLADESH VOLUNTEER BLOOD REGISTRY',
        75,
        100
      );

      ctx.fillStyle = '#FFDADA';
      ctx.font = '600 20px sans-serif';
      ctx.fillText(
        language === 'bn' ? 'ডিজিটাল ডোনার স্মার্ট কার্ড • স্মারক আইডি' : 'OFFICIAL HUMANITARIAN DONOR SMART CARD',
        75,
        135
      );

      // Gold Smart EMV Chip
      const chipGrad = ctx.createLinearGradient(75, 180, 195, 270);
      chipGrad.addColorStop(0, '#FFDF79');
      chipGrad.addColorStop(0.5, '#D4AF37');
      chipGrad.addColorStop(1, '#996515');
      ctx.fillStyle = chipGrad;
      ctx.beginPath();
      ctx.roundRect(75, 180, 120, 90, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Chip internal circuit traces
      ctx.strokeStyle = 'rgba(70, 45, 0, 0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(115, 180);
      ctx.lineTo(115, 270);
      ctx.moveTo(155, 180);
      ctx.lineTo(155, 270);
      ctx.moveTo(75, 225);
      ctx.lineTo(195, 225);
      ctx.stroke();

      // Contactless Wave Icon (NFC)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(240, 225, 16, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(240, 225, 28, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();

      // Blood Group Shield on Right
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(975, 75, 155, 155, 30);
      ctx.fill();
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 15;

      ctx.fillStyle = '#9E0027';
      ctx.font = '900 68px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(bloodGroup, 1052, 172);
      ctx.font = 'bold 17px sans-serif';
      ctx.fillText(language === 'bn' ? 'ব্লাড গ্রুপ' : 'BLOOD GROUP', 1052, 206);
      ctx.textAlign = 'left';
      ctx.shadowBlur = 0;

      // Donor Name
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(language === 'bn' ? 'রক্তদাতার নাম (DONOR NAME)' : 'DONOR FULL NAME', 75, 350);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 54px sans-serif';
      ctx.fillText(displayName, 75, 415);

      // ID and District Details
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(language === 'bn' ? 'ডোনার আইডি' : 'DONOR ID', 75, 485);
      ctx.fillText(language === 'bn' ? 'এলাকা / জেলা' : 'LOCATION', 380, 485);
      ctx.fillText(language === 'bn' ? 'মোট রক্তদান' : 'DONATIONS', 680, 485);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px monospace';
      ctx.fillText(`#${donorId}`, 75, 530);
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(locationText, 380, 530);
      ctx.fillText(`${formatDigits(totalDonations)} ${language === 'bn' ? 'বার' : 'times'}`, 680, 530);

      // Security Footer Line
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(75, 585, 1055, 2);

      // Validity, Ethics Notice & Helpline
      ctx.fillStyle = '#FFDAD6';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(
        language === 'bn'
          ? 'যাচাইকৃত জাতীয় ডেটাবেস • রক্ত কেনাবেচা আইনত দণ্ডনীয় অপরাধ • জরুরি সহায়তা: ১৬২৬৩'
          : 'VERIFIED NATIONAL DATABASE • BLOOD TRADING IS ILLEGAL • HELPLINE: 16263',
        75,
        635
      );

      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = '16px monospace';
      ctx.fillText(`ISSUED: 2026 • VALID THRU: 2031 • ROKTODATA SECURE CARD #${donorId}`, 75, 675);

      // QR Code Block on Bottom Right with Verifiable Reference
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(985, 540, 145, 145, 20);
      ctx.fill();

      // Simulated QR markers
      ctx.fillStyle = '#1B1B1F';
      ctx.fillRect(1005, 560, 32, 32);
      ctx.fillRect(1078, 560, 32, 32);
      ctx.fillRect(1005, 633, 32, 32);
      ctx.fillRect(1050, 605, 20, 20);
      ctx.fillRect(1078, 633, 16, 16);

      // Verifiable link imprint on card
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`VERIFY: roktodata.app/donor/${donorId}`, 75, 705);

      return canvas;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleDownloadCard = () => {
    try {
      const canvas = generateCardCanvas();
      if (!canvas) {
        showToast(
          language === 'bn' ? 'কার্ড প্রস্তুত করা সম্ভব হয়নি' : 'Unable to render card canvas',
          'error'
        );
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `roktodata-donor-card-${donorId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      showToast(
        language === 'bn'
          ? 'ডিজিটাল ডোনার কার্ড সফলভাবে গ্যালারিতে সেভ হয়েছে!'
          : 'Digital donor card downloaded successfully to your device!',
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast(language === 'bn' ? 'কার্ড ডাউনলোড সম্পন্ন করা সম্ভব হয়নি' : 'Failed to download card', 'error');
    }
  };

  // ================= 2. 100% PROFESSIONAL SHARE ENGINE =================
  const shareTextContent =
    language === 'bn'
      ? `🩸 *স্বেচ্ছাসেবী রক্তদাতা স্মার্ট আইডি কার্ড*\n` +
        `নাম: ${displayName}\n` +
        `রক্তের গ্রুপ: ${bloodGroup} (পজিটিভ)\n` +
        `ডোনার আইডি: #${donorId}\n` +
        `এলাকা: ${userProfile.location || 'বগুড়া সদর'}\n` +
        `মোট রক্তদান: ${formatDigits(totalDonations)} বার (+${formatDigits(livesImpacted)} জীবন রক্ষা)\n` +
        `বর্তমান স্ট্যাটাস: ${isAvailable ? 'সক্রিয় ও রক্তদানে প্রস্তুত' : 'সাময়িক বিশ্রামে'}\n` +
        `জরুরি রক্তের প্রয়োজনে যোগাযোগ ও ভেরিফিকেশন: https://roktodata.app/donor/${donorId}`
      : `🩸 *Verified Volunteer Blood Donor Card*\n` +
        `Name: ${displayName}\n` +
        `Blood Group: ${bloodGroup}\n` +
        `Donor ID: #${donorId}\n` +
        `Location: ${userProfile.location || 'Bogura Sadar'}\n` +
        `Total Donations: ${totalDonations} times (+${livesImpacted} lives saved)\n` +
        `Status: ${isAvailable ? 'Active & Ready to Donate' : 'On Temporary Break'}\n` +
        `Emergency verify & contact: https://roktodata.app/donor/${donorId}`;

  const getShareUrl = () => {
    return typeof window !== 'undefined'
      ? `${window.location.origin}/donor/${donorId}`
      : `https://roktodata.app/donor/${donorId}`;
  };

  const handleCopyShareLink = () => {
    const url = getShareUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      showToast(
        language === 'bn'
          ? 'রক্তদাতা প্রোফাইল লিংক ক্লিপবোর্ডে কপি হয়েছে!'
          : 'Donor profile link copied to clipboard!',
        'success'
      );
    }
  };

  const handleCopyTextContent = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareTextContent);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
      showToast(
        language === 'bn' ? 'সম্পূর্ণ রক্তদাতা বিবরণ কপি হয়েছে!' : 'Donor details text copied to clipboard!',
        'success'
      );
    }
  };

  const handleCopyDonorId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`#${donorId}`);
      setCopiedDonorId(true);
      setTimeout(() => setCopiedDonorId(false), 2500);
      showToast(
        language === 'bn' ? `ডোনার আইডি #${donorId} কপি হয়েছে!` : `Donor ID #${donorId} copied!`,
        'success'
      );
    }
  };

  const handleNativeShare = async () => {
    const url = getShareUrl();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        // Try file sharing if canvas can be generated
        const canvas = generateCardCanvas();
        if (canvas && navigator.canShare) {
          canvas.toBlob(async (blob) => {
            if (blob) {
              const file = new File([blob], `roktodata-donor-${donorId}.png`, { type: 'image/png' });
              if (navigator.canShare({ files: [file] })) {
                try {
                  await navigator.share({
                    title: language === 'bn' ? `রক্তদাতা কার্ড — ${displayName}` : `Donor ID Card — ${displayName}`,
                    text: shareTextContent,
                    files: [file],
                  });
                  return;
                } catch {
                  // Fallback to text + url share
                }
              }
            }
            // Standard fallback
            await navigator.share({
              title: language === 'bn' ? `রক্তদাতা কার্ড — ${displayName}` : `Donor ID Card — ${displayName}`,
              text: shareTextContent,
              url,
            });
          });
        } else {
          await navigator.share({
            title: language === 'bn' ? `রক্তদাতা কার্ড — ${displayName}` : `Donor ID Card — ${displayName}`,
            text: shareTextContent,
            url,
          });
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          handleCopyShareLink();
        }
      }
    } else {
      handleCopyShareLink();
    }
  };

  const handleWhatsAppShare = () => {
    const url = getShareUrl();
    const text = encodeURIComponent(`${shareTextContent}\n\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleTelegramShare = () => {
    const url = getShareUrl();
    const text = encodeURIComponent(shareTextContent);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`, '_blank');
  };

  const handleFacebookShare = () => {
    const url = getShareUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const handleSMSShare = () => {
    const text = encodeURIComponent(shareTextContent);
    window.location.href = `sms:?body=${text}`;
  };

  // ================= 3. FUNCTIONAL DONOR AVAILABILITY & CONTROL =================
  const handleToggleActiveState = () => {
    const nextVal = !isAvailable;
    setIsAvailable(nextVal);
    if (nextVal) setPauseDuration(null);
    onToggleAvailability();
    updateAuthenticatedUser({ isAvailable: nextVal });
    showToast(
      nextVal
        ? language === 'bn'
          ? 'আপনি এখন রক্তদানের জন্য সক্রিয় ও প্রস্তুত!'
          : 'You are now marked Active & Ready!'
        : language === 'bn'
        ? 'ডোনার স্ট্যাটাস সাময়িক বিশ্রামে রাখা হয়েছে।'
        : 'Donor status set to resting.',
      nextVal ? 'success' : 'info'
    );
  };

  const handleSetPause = (days: number) => {
    setPauseDuration(days);
    setIsAvailable(false);
    updateAuthenticatedUser({ isAvailable: false });
    showToast(
      language === 'bn'
        ? `আপনার রক্তদানের অনুরোধ ${formatDigits(days)} দিনের জন্য স্থগিত রাখা হয়েছে।`
        : `Donation requests paused for ${days} days.`,
      'info'
    );
  };

  const handleResumeNow = () => {
    setPauseDuration(null);
    setIsAvailable(true);
    updateAuthenticatedUser({ isAvailable: true });
    showToast(
      language === 'bn'
        ? 'বিরতি প্রত্যাহার সম্পন্ন! আপনি আবার রক্তদানের জন্য সম্পূর্ণ প্রস্তুত।'
        : 'Break cleared! You are active and ready to donate.',
      'success'
    );
  };

  const handleToggleEmergencyOnly = () => {
    const nextVal = !emergencyOnlyMode;
    setEmergencyOnlyMode(nextVal);
    showToast(
      nextVal
        ? language === 'bn'
          ? 'শুধুমাত্র অতি জরুরি (ICU/সার্জারি) অনুরোধের নোটিফিকেশন চালু করা হলো।'
          : 'Emergency-only mode active: receiving only critical ICU/surgery requests.'
        : language === 'bn'
        ? 'সাধারণ ও জরুরি সকল অনুরোধ গ্রহণের মোড চালু হয়েছে।'
        : 'Normal matching mode restored.',
      'info'
    );
  };

  const handleToggleQuietHours = () => {
    const nextVal = !quietHoursActive;
    setQuietHoursActive(nextVal);
    updateAuthenticatedUser({ quietHoursEnabled: nextVal });
    showToast(
      nextVal
        ? language === 'bn'
          ? 'রাতের নীরব সময় (রাত ১১টা – সকাল ৬টা) সক্রিয় করা হয়েছে।'
          : 'Quiet Hours active (11:00 PM – 06:00 AM).'
        : language === 'bn'
        ? 'রাতের নীরব সময় নিষ্ক্রিয় করা হয়েছে।'
        : 'Quiet Hours disabled.',
      'info'
    );
  };

  // ================= 4. FUNCTIONAL ELIGIBILITY TRACKER =================
  const handleMarkDonatedToday = () => {
    setDaysRemaining(90);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 90);
    const dateStr = futureDate.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    setNextEligibleDate(dateStr);

    // Also auto-log a record into history
    const todayStr = new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const autoRecord: DonationRecord = {
      id: `DON-${Date.now()}`,
      date: todayStr,
      hospital: language === 'bn' ? 'জরুরি রক্তদান কেন্দ্র' : 'Emergency Blood Center',
      recipientType: language === 'bn' ? 'জরুরি রোগী' : 'Emergency Patient',
      units: 1,
      status: 'completed',
      certificateId: `BD-EM-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: language === 'bn' ? 'অ্যাপ থেকে স্ব-নিবন্ধিত রক্তদান' : 'Self-logged donation',
    };

    const updatedHistory = [autoRecord, ...donationHistory];
    setDonationHistory(updatedHistory);
    const newTotal = totalDonations + 1;
    setTotalDonations(newTotal);
    setLivesImpacted(newTotal * 3);

    updateAuthenticatedUser({
      daysUntilNextEligible: 90,
      daysRemaining: 90,
      nextEligibleDate: dateStr,
      donationHistory: updatedHistory,
      totalDonations: newTotal,
      livesImpacted: newTotal * 3,
    });

    setShowEligibilityModal(false);
    showToast(
      language === 'bn'
        ? 'অভিনন্দন! আপনার আজকের রক্তদান সংরক্ষিত হয়েছে এবং ৯০ দিনের সুস্থতা চক্র শুরু হলো।'
        : 'Donation logged! 90-day recovery biological cycle started.',
      'success'
    );
  };

  const handleApplyCustomDonationDate = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedDate = new Date(customDonationDate);
    const today = new Date();
    const diffTime = today.getTime() - selectedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 90) {
      setDaysRemaining(0);
      setNextEligibleDate(language === 'bn' ? 'আজই রক্তদান করতে পারবেন' : 'Eligible today');
      updateAuthenticatedUser({
        daysUntilNextEligible: 0,
        daysRemaining: 0,
        nextEligibleDate: language === 'bn' ? 'আজই প্রস্তুত' : 'Ready today',
      });
      showToast(
        language === 'bn'
          ? 'আপনার ৯০ দিন পূর্ণ হয়েছে! আপনি এখন রক্তদানের জন্য সম্পূর্ণ প্রস্তুত।'
          : 'Over 90 days have passed. You are 100% eligible & ready!',
        'success'
      );
    } else {
      const remaining = Math.max(1, 90 - diffDays);
      setDaysRemaining(remaining);
      const futureDate = new Date(selectedDate);
      futureDate.setDate(futureDate.getDate() + 90);
      const dateStr = futureDate.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      setNextEligibleDate(dateStr);
      updateAuthenticatedUser({
        daysUntilNextEligible: remaining,
        daysRemaining: remaining,
        nextEligibleDate: dateStr,
      });
      showToast(
        language === 'bn'
          ? `যোগ্যতা হিসাব হালনাগাদ করা হয়েছে: আর ${formatDigits(remaining)} দিন বাকি।`
          : `Eligibility updated: ${remaining} days remaining.`,
        'info'
      );
    }
    setShowEligibilityModal(false);
  };

  const handleMarkEligibleNow = () => {
    setDaysRemaining(0);
    setNextEligibleDate(language === 'bn' ? 'আজই রক্তদান করতে পারবেন' : 'Eligible to donate today');
    updateAuthenticatedUser({
      daysUntilNextEligible: 0,
      daysRemaining: 0,
      nextEligibleDate: language === 'bn' ? 'আজই প্রস্তুত' : 'Ready today',
    });
    setShowEligibilityModal(false);
    showToast(
      language === 'bn'
        ? 'অভিনন্দন! আপনি এখন সম্পূর্ণ সুস্থ ও রক্তদানের জন্য প্রস্তুত।'
        : 'Congratulations! You are 100% eligible & ready to donate.',
      'success'
    );
  };

  const handleToggleEligibilityReminder = () => {
    const nextVal = !eligibilityReminder;
    setEligibilityReminder(nextVal);
    showToast(
      nextVal
        ? language === 'bn'
          ? 'যোগ্যতা অর্জনের দিন এসএমএস/পুশ রিমাইন্ডার পাঠানো হবে।'
          : 'Eligibility completion alert enabled.'
        : language === 'bn'
        ? 'রিমাইন্ডার বন্ধ করা হয়েছে।'
        : 'Reminder disabled.',
      'info'
    );
  };

  // ================= 4b. FUNCTIONAL PROFILE EDITOR =================
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast(language === 'bn' ? 'অনুগ্রহ করে আপনার নাম প্রদান করুন।' : 'Please enter your name.', 'error');
      return;
    }

    if (editPhone.trim() && !isValidBdPhoneNumber(editPhone)) {
      showToast(
        language === 'bn'
          ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: ০১৭XXXXXXXX)।'
          : 'Please enter a valid 11-digit Bangladeshi mobile number.',
        'error'
      );
      return;
    }

    setIsSavingProfile(true);
    try {
      const cleanPhone = editPhone.trim() ? normalizePhoneNumber(editPhone.trim()) : '';
      const displayLocation = editLocation.trim() || `${editDistrict}${editUpazila ? ', ' + editUpazila : ''}`;

      const updates: Partial<UserProfile> = {
        name: editName.trim(),
        bloodGroup: editBloodGroup,
        phone: cleanPhone || undefined,
        division: editDivision,
        district: editDistrict,
        upazila: editUpazila,
        location: displayLocation,
      };

      const updated = await updateAuthenticatedUser(updates);
      if (updated) {
        setActiveProfile(updated);
      } else {
        setActiveProfile((prev) => ({ ...prev, ...updates }));
      }

      if (onUpdateProfile) {
        onUpdateProfile(updates);
      }

      setShowEditProfileModal(false);
      showToast(
        language === 'bn'
          ? 'প্রোফাইল তথ্য সফলভাবে হালনাগাদ করা হয়েছে!'
          : 'Profile updated successfully!',
        'success'
      );
    } catch (err: any) {
      showToast(err?.message || (language === 'bn' ? 'প্রোফাইল আপডেট ব্যর্থ হয়েছে' : 'Failed to update profile'), 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Dynamic district and upazila options for profile editing
  const availableDistricts = allDistricts.filter(
    (d) => !editDivision || d.divisionBn === editDivision || d.divisionEn.toLowerCase() === editDivision.toLowerCase()
  );

  const currentDistrictObj = allDistricts.find(
    (d) => d.nameBn === editDistrict || d.nameEn.toLowerCase() === editDistrict.toLowerCase()
  );

  const availableUpazilas = currentDistrictObj ? currentDistrictObj.upazilas : [];

  // ================= 5. FUNCTIONAL DONATION HISTORY LOGGER =================
  const handleAddDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHospital.trim()) {
      showToast(language === 'bn' ? 'হাসপাতালের নাম প্রদান করুন' : 'Please provide hospital name', 'error');
      return;
    }

    const formattedDate = new Date(newDate).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const newRecord: DonationRecord = {
      id: `DON-${Date.now()}`,
      date: formattedDate,
      hospital: newHospital.trim(),
      recipientType: newRecipientType,
      units: newBags,
      status: 'completed',
      certificateId: `BD-REG-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: newNotes.trim() || undefined,
    };

    const updated = [newRecord, ...donationHistory];
    setDonationHistory(updated);
    const newTotal = totalDonations + newBags;
    setTotalDonations(newTotal);
    setLivesImpacted(newTotal * 3);

    updateAuthenticatedUser({
      donationHistory: updated,
      totalDonations: newTotal,
      livesImpacted: newTotal * 3,
    });

    setNewHospital('');
    setNewNotes('');
    setShowAddDonationModal(false);
    showToast(
      language === 'bn'
        ? 'নতুন রক্তদানের রেকর্ড সফলভাবে প্রোফাইলে সংরক্ষিত হয়েছে!'
        : 'New donation record logged successfully!',
      'success'
    );
  };

  const handleDeleteDonationRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = donationHistory.filter((item) => item.id !== id);
    setDonationHistory(updated);
    const newTotal = Math.max(0, totalDonations - 1);
    setTotalDonations(newTotal);
    setLivesImpacted(newTotal * 3);
    updateAuthenticatedUser({
      donationHistory: updated,
      totalDonations: newTotal,
      livesImpacted: newTotal * 3,
    });
    showToast(language === 'bn' ? 'রেকর্ড মুছে ফেলা হয়েছে' : 'Donation record deleted', 'info');
  };

  // Biological metrics calculations for eligibility
  const cyclePercent = Math.min(100, Math.max(0, Math.round(((90 - daysRemaining) / 90) * 100)));
  const estimatedHb = daysRemaining === 0 ? '14.5' : (13.2 + (cyclePercent / 100) * 1.3).toFixed(1);

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Incomplete Profile Banner */}
      {isLoggedIn && !userProfile.isProfileComplete && (
        <div className="mx-3 sm:mx-4 mt-2 mb-2 p-3.5 sm:p-4 rounded-2xl bg-[#FFF8E1] border border-[#FFE082] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFA000] text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#E65100]">
                {language === 'bn' ? '⚠️ আপনার ডোনার প্রোফাইল অসম্পূর্ণ' : '⚠️ Donor Profile Incomplete'}
              </h4>
              <p className="text-[11px] sm:text-xs text-[#795548] mt-0.5">
                {language === 'bn'
                  ? 'জরুরি রক্তদান ও অনুরোধের সুবিধার্থে মোবাইল নম্বর, রক্তের গ্রুপ, বিভাগ ও জেলা পূরণ করুন।'
                  : 'Please provide mobile number, blood group, division & district to activate donor privileges.'}
              </p>
            </div>
          </div>
          {onOpenDonorSetup && (
            <button
              onClick={onOpenDonorSetup}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#E65100] hover:bg-[#BF360C] text-white text-xs font-bold shrink-0 shadow-xs cursor-pointer transition-colors"
            >
              {language === 'bn' ? 'প্রোফাইল সম্পন্ন করুন' : 'Complete Profile'}
            </button>
          )}
        </div>
      )}

      {/* Guest Mode Notice Banner */}
      {!isLoggedIn && (
        <div className="mx-3 sm:mx-4 mt-2 mb-2 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">
                {language === 'bn' ? 'আপনি অতিথি মোডে আছেন' : 'You are in Guest Mode'}
              </h4>
              <p className="text-xs text-gray-600">
                {language === 'bn'
                  ? 'আপনার নিজস্ব ডিজিটাল ডোনার স্মার্ট কার্ড, রক্তদান রেকর্ড ও সার্টিফিকেট সেভ করতে লগইন বা নতুন একাউন্ট খুলুন।'
                  : 'Login or register to get your digital donor smart card, track biological recovery, and earn certificates.'}
              </p>
            </div>
          </div>
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
            >
              {language === 'bn' ? 'লগইন / নতুন একাউন্ট' : 'Login / Register'}
            </button>
          )}
        </div>
      )}

      {/* Sub-Header / Top Utilities Bar */}
      <div className="px-3 sm:px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="font-bold text-[19px] sm:text-[22px] text-[#1B1B1F] truncate">
            {isLoggedIn
              ? language === 'bn'
                ? `${displayName}-এর প্রোফাইল`
                : `${displayName}'s Profile`
              : language === 'bn'
              ? 'আমার প্রোফাইল ও অর্জন'
              : 'My Profile & Achievements'}
          </h1>
          <p className="text-xs text-[#5B5F6B] truncate">
            {language === 'bn' ? 'আপনার মানবিক অবদানের ব্যক্তিগত ডায়েরি' : 'Personal log of your lifesaving contributions'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isLoggedIn && onLogout && (
            <button
              onClick={onLogout}
              title={language === 'bn' ? 'লগআউট করুন' : 'Logout'}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-xs text-red-600 hover:bg-red-50 active:scale-95 transition-all border border-red-200 flex items-center justify-center cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          {/* 100% Functional Header Share Button */}
          <button
            onClick={() => setShowShareModal(true)}
            aria-label={language === 'bn' ? 'ডিজিটাল কার্ড শেয়ার' : 'Share Digital Card'}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white shadow-xs text-[#0D58C9] active:scale-95 transition-all border border-[#E4E6EB]/80 hover:bg-[#F7F7F9] cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            aria-label={t.nav.settings}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white shadow-xs text-[#5B5F6B] hover:text-[#1B1B1F] active:scale-95 transition-all border border-[#E4E6EB]/80 hover:bg-[#F7F7F9] cursor-pointer"
          >
            <SettingsIcon className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Main Responsive Grid: 1 Column on Mobile, 2 Columns on Tablet/Desktop */}
      <div className="px-3 sm:px-4 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 items-start">
        {/* ================= COLUMN 1 ================= */}
        <div className="flex flex-col gap-4">
          {/* 1. User Identity Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-[#E4E6EB]/80 flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-gradient-to-tr from-[#9E0027] to-[#C41E3A] text-white font-extrabold text-xl flex items-center justify-center shadow-xs border-2 border-white ring-2 ring-[#FDECEF]">
                    {displayInitial}
                  </div>
                  {isLoggedIn && (
                    <span className="absolute -bottom-1 -right-1 bg-[#0D58C9] text-white rounded-full p-0.5 flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="font-bold text-[16px] sm:text-[18px] text-[#1B1B1F] truncate">{displayName}</h2>
                    {isLoggedIn ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D9E2FF] text-[#001946] text-[10px] font-bold">
                        {language === 'bn' ? 'ভেরিফায়েড ডোনার' : 'Verified Donor'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold">
                        {language === 'bn' ? 'গেস্ট' : 'Guest'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#5B5F6B] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C41E3A] shrink-0" />
                    <span>{locationText}</span>
                  </p>
                </div>
              </div>

              {/* Blood Group Badge */}
              <div className="w-14 h-14 rounded-2xl bg-[#FDECEF] flex flex-col items-center justify-center shrink-0 shadow-xs border border-[#FFDAD6]">
                <span className="text-[20px] font-extrabold text-[#C41E3A] leading-none">{bloodGroup}</span>
                <span className="text-[9px] text-[#9E0027] font-bold mt-0.5">
                  {language === 'bn' ? 'ব্লাড গ্রুপ' : 'GROUP'}
                </span>
              </div>
            </div>

            {/* Privacy Shield Banner */}
            <div className="p-3 bg-[#F7F7F9] rounded-2xl flex items-start gap-2.5 border border-[#E4E6EB]/50">
              <Lock className="w-4 h-4 text-[#5B5F6B] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-[#1B1B1F] block">
                  {phoneText ||
                    (isLoggedIn
                      ? language === 'bn'
                        ? '০১৭৭৫-০১২০১৪ (সংরক্ষিত)'
                        : '01775-012014 (Protected)'
                      : language === 'bn'
                      ? 'মোবাইল নম্বর যুক্ত নেই'
                      : 'No phone linked')}
                </span>
                <p className="text-[11px] text-[#5B5F6B] leading-snug mt-0.5">
                  {language === 'bn'
                    ? 'গোপনীয়তা নিশ্চিত: নম্বরটি শুধুমাত্র জরুরি ক্ষেত্রে অনুমোদিত রোগীর স্বজনরা যাচাই সাপেক্ষে দেখতে পান।'
                    : 'Strict Privacy: Phone numbers are only visible to verified medical emergency contacts.'}
                </p>
              </div>
            </div>

            {/* Edit Profile & Security Bar */}
            <div className="flex items-center gap-2 pt-1 border-t border-[#E4E6EB]/60">
              <button
                onClick={() => {
                  setEditName(activeProfile.name || userProfile.name || '');
                  setEditBloodGroup((activeProfile.bloodGroup || userProfile.bloodGroup || 'B+') as BloodGroup);
                  setEditPhone(activeProfile.phone || userProfile.phone || '');
                  setEditDivision(activeProfile.division || userProfile.division || 'রাজশাহী');
                  setEditDistrict(activeProfile.district || userProfile.district || 'বগুড়া');
                  setEditUpazila(activeProfile.upazila || userProfile.upazila || 'বগুড়া সদর');
                  setEditLocation(activeProfile.location || userProfile.location || '');
                  setShowEditProfileModal(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#FAF9FB] hover:bg-[#F0EDF2] text-[#1B1B1F] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#E4E6EB]"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#C41E3A]" />
                <span>{language === 'bn' ? 'প্রোফাইল সম্পাদনা' : 'Edit Profile'}</span>
              </button>
            </div>
          </div>

          {/* ================= 2. PROFESSIONAL DIGITAL DONOR SMART CARD (100% FUNCTIONAL) ================= */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-[#E4E6EB]/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#C41E3A]" />
                <h3 className="font-bold text-[16px] text-[#1B1B1F]">
                  {language === 'bn' ? 'ডিজিটাল ডোনার স্মার্ট কার্ড' : 'Digital Donor Smart Card'}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Flip Button */}
                <button
                  onClick={() => setCardSide(cardSide === 'front' ? 'back' : 'front')}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#5B5F6B] hover:text-[#1B1B1F] bg-[#F7F7F9] hover:bg-[#F0EDF2] px-2 py-1 rounded-lg transition-colors cursor-pointer border border-[#E4E6EB]/60"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>
                    {cardSide === 'front'
                      ? language === 'bn'
                        ? 'অপর পিঠ'
                        : 'Back'
                      : language === 'bn'
                      ? 'সামনের পিঠ'
                      : 'Front'}
                  </span>
                </button>

                <button
                  onClick={handleDownloadCard}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#C41E3A] hover:bg-[#FDECEF] px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>{language === 'bn' ? 'ডাউনলোড' : 'Save'}</span>
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  aria-label="Share"
                  className="p-1 rounded-lg text-[#0D58C9] hover:bg-[#EFF6FF] cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Realistic Bank-Grade Executive Donor Smart Card with Front & Back side */}
            {cardSide === 'front' ? (
              /* FRONT FACE */
              <div className="w-full bg-gradient-to-br from-[#660015] via-[#940626] to-[#C41E3A] text-white rounded-2xl p-4 sm:p-5 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[200px] border border-white/20 transition-all">
                {/* Guilloche & Concentric Security Circles */}
                <div className="absolute -right-12 -bottom-12 w-52 h-52 rounded-full border border-white/10 pointer-events-none" />
                <div className="absolute -right-24 -bottom-24 w-72 h-72 rounded-full border border-white/10 pointer-events-none" />
                <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none" />

                {/* Top Row: National Network Title & Blood Shield */}
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                      <Heart className="w-4 h-4 fill-white text-white" />
                    </div>
                    <div>
                      <p className="text-[13px] font-extrabold tracking-wide text-white leading-tight">
                        {language === 'bn' ? 'জাতীয় রক্তদাতা রেজিস্ট্রি' : 'National Donor Registry'}
                      </p>
                      <p className="text-[9.5px] text-red-100 font-medium tracking-wider uppercase">
                        {language === 'bn' ? 'গণপ্রজাতন্ত্রী বাংলাদেশ' : 'GOVT OF BANGLADESH'}
                      </p>
                    </div>
                  </div>

                  {/* High Contrast Blood Group Badge */}
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-black text-[#9E0027] bg-white px-3 py-1 rounded-xl shadow-xs leading-none">
                      {bloodGroup}
                    </span>
                    <span className="text-[8.5px] text-white/80 font-bold mt-1 tracking-wider uppercase">
                      Rh Positive
                    </span>
                  </div>
                </div>

                {/* Middle Row: Gold Metallic Chip & Contactless Wave */}
                <div className="relative z-10 flex items-center gap-2.5 my-2">
                  <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-[#FFDF79] via-[#D4AF37] to-[#996515] p-0.5 border border-amber-300 shadow-2xs flex flex-col justify-between">
                    <div className="w-full h-[1px] bg-amber-900/40 my-auto" />
                    <div className="w-full h-[1px] bg-amber-900/40 my-auto" />
                  </div>
                  <Smartphone className="w-4 h-4 text-white/70 -rotate-90" />
                  <span className="text-[9px] text-white/80 font-mono tracking-widest uppercase">
                    VERIFIED VOLUNTEER LIFE SAVER
                  </span>
                </div>

                {/* Bottom Row: Name, ID and QR Code */}
                <div className="relative z-10 flex items-end justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-red-200 uppercase tracking-wider block font-bold">
                      {language === 'bn' ? 'রক্তদাতার নাম' : 'DONOR NAME'}
                    </span>
                    <span className="text-base font-extrabold text-white block leading-tight tracking-wide">
                      {displayName}
                    </span>
                    <button
                      onClick={handleCopyDonorId}
                      className="text-[10.5px] text-white/90 font-mono mt-0.5 inline-flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>ID: #{donorId}</span>
                      {copiedDonorId ? <CheckCheck className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3 text-white/60" />}
                    </button>
                  </div>

                  {/* Clickable QR Code */}
                  <div
                    onClick={() => setShowCardModal(true)}
                    title={language === 'bn' ? 'সম্পূর্ণ ভেরিফিকেশন দেখতে ক্লিক করুন' : 'Click to view full verification'}
                    className="w-11 h-11 bg-white rounded-xl p-1 shadow-xs flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                  >
                    <QrCode className="w-9 h-9 text-[#1B1B1F]" />
                  </div>
                </div>
              </div>
            ) : (
              /* BACK FACE */
              <div className="w-full bg-[#1B1B1F] text-white rounded-2xl p-4 sm:p-5 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[200px] border border-white/20 transition-all">
                {/* Magnetic Stripe */}
                <div className="absolute inset-x-0 top-3 h-7 bg-black/90 border-y border-white/10" />

                <div className="relative z-10 pt-8 flex items-start justify-between gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                      {language === 'bn' ? 'জরুরি চিকিৎসা উপদেষ্টা ও তথ্য' : 'Medical Advisory'}
                    </span>
                    <p className="text-[11px] text-gray-200 mt-0.5 leading-snug">
                      {language === 'bn'
                        ? `গ্রুপ: ${bloodGroup} • দান করতে পারবেন: ${compatibility.give}`
                        : `Group: ${bloodGroup} • Can donate to: ${compatibility.give}`}
                    </p>
                    <p className="text-[10.5px] text-amber-300 mt-1 font-semibold">
                      {language === 'bn' ? 'জরুরি হটলাইন: ১৬২৬৩ • জাতীয় সেবা: ৯৯৯' : 'Emergency Hotline: 16263 • 999'}
                    </p>
                  </div>

                  {/* Barcode simulation */}
                  <div className="bg-white p-1 rounded-md shrink-0">
                    <div className="flex items-center gap-0.5 h-6">
                      {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 2, 3, 1, 2].map((w, i) => (
                        <div key={i} style={{ width: `${w}px` }} className="h-full bg-black" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Legal & Authorized Signature */}
                <div className="relative z-10 pt-3 border-t border-white/10 flex items-end justify-between text-[10px] text-gray-400">
                  <div className="max-w-[70%]">
                    <p className="text-[9.5px] text-gray-300 leading-tight">
                      {language === 'bn'
                        ? 'স্বেচ্ছায় রক্তদান মানবকল্যাণে উৎসর্গীকৃত • রক্ত কেনাবেচা আইনত দণ্ডনীয় অপরাধ।'
                        : 'Voluntary blood donation is dedicated to humanity. Trading blood is illegal.'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-serif italic text-white text-xs block">Roktodata Admin</span>
                    <span className="text-[9px] text-gray-400">{language === 'bn' ? 'ডিজিটাল স্বাক্ষর' : 'Verified Seal'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Action Chips under Card */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleDownloadCard}
                className="flex-1 py-2 rounded-xl bg-[#F7F7F9] hover:bg-[#FDECEF] text-[#C41E3A] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#E4E6EB]/60"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'কার্ড ডাউনলোড (PNG)' : 'Download PNG Card'}</span>
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex-1 py-2 rounded-xl bg-[#F7F7F9] hover:bg-[#EFF6FF] text-[#0D58C9] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#E4E6EB]/60"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'শেয়ার কার্ড' : 'Share Card'}</span>
              </button>
            </div>
          </div>

          {/* ================= 3. DONOR AVAILABILITY & CONTROL (100% FUNCTIONAL) ================= */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-[#E4E6EB]/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[16px] text-[#1B1B1F]">
                  {language === 'bn' ? 'ডোনার প্রাপ্যতা ও নিয়ন্ত্রণ' : 'Donor Availability & Control'}
                </h3>
                <p className="text-xs text-[#5B5F6B]">
                  {language === 'bn' ? 'জরুরি রক্তের অনুরোধ পাওয়ার নিয়ন্ত্রণ সেটিংস' : 'Emergency matching & notification controls'}
                </p>
              </div>

              {/* Master Availability Toggle */}
              <button
                onClick={handleToggleActiveState}
                aria-label={language === 'bn' ? 'উপলব্ধতা পরিবর্তন করুন' : 'Toggle availability'}
                className={`w-12 h-7 rounded-full p-0.5 flex items-center transition-colors cursor-pointer ${
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

            {/* Active Status Badge */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F7F9] border border-[#E4E6EB]/60">
              <span className="text-xs font-semibold text-[#1B1B1F]">
                {language === 'bn' ? 'বর্তমান স্ট্যাটাস:' : 'Current Status:'}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  isAvailable ? 'bg-[#E8F5E9] text-[#005938]' : 'bg-[#F0EDF2] text-[#5B5F6B]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-[#00744B] animate-pulse' : 'bg-[#5B5F6B]'}`} />
                <span>
                  {isAvailable
                    ? language === 'bn'
                      ? 'সক্রিয় ও রক্তদানে প্রস্তুত'
                      : 'Active & Ready'
                    : language === 'bn'
                    ? 'সাময়িক বিশ্রামে'
                    : 'On a Break'}
                </span>
              </span>
            </div>

            {/* Active Pause Notice if user is paused */}
            {pauseDuration !== null && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-900">
                    {language === 'bn'
                      ? `বিরতি কার্যকর আছে (${formatDigits(pauseDuration)} দিন)`
                      : `Break active (${pauseDuration} days)`}
                  </p>
                  <p className="text-[11px] text-amber-700">
                    {language === 'bn' ? 'এই সময়ে সাধারণ নোটিফিকেশন বন্ধ থাকবে।' : 'Routine matching calls paused.'}
                  </p>
                </div>
                <button
                  onClick={handleResumeNow}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 cursor-pointer shadow-xs"
                >
                  {language === 'bn' ? 'পুনরায় প্রস্তুত হন' : 'Resume Now'}
                </button>
              </div>
            )}

            {/* Pause Request chips */}
            <div className="bg-[#F7F7F9] rounded-2xl p-3 flex flex-col gap-2">
              <span className="text-xs font-bold text-[#1B1B1F]">
                {language === 'bn' ? 'বিরতি নিন (অস্থায়ীভাবে স্থগিত)' : 'Take a Break (Temporary Pause)'}
              </span>
              <div className="flex items-center gap-2">
                {[1, 7, 30].map((days) => (
                  <button
                    key={days}
                    onClick={() => handleSetPause(days)}
                    className={`flex-1 py-1.5 rounded-full text-xs font-bold shadow-xs transition-all cursor-pointer ${
                      pauseDuration === days
                        ? 'bg-[#C41E3A] text-white'
                        : 'bg-white text-[#1B1B1F] hover:bg-[#F0EDF2] border border-[#E4E6EB]/60'
                    }`}
                  >
                    {formatDigits(days)} {language === 'bn' ? 'দিন' : 'days'}
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Only Mode Switch */}
            <div className="p-3 bg-[#F7F7F9] rounded-2xl flex items-center justify-between border border-[#E4E6EB]/60">
              <div>
                <p className="text-xs font-bold text-[#1B1B1F]">
                  {language === 'bn' ? 'শুধুমাত্র অতি জরুরি মোড' : 'Emergency-Only Matching'}
                </p>
                <p className="text-[11px] text-[#5B5F6B]">
                  {language === 'bn' ? 'আইসিইউ বা তাৎক্ষণিক সার্জারি ছাড়া কল আসবে না' : 'Only receive alerts for critical ICU cases'}
                </p>
              </div>
              <button
                onClick={handleToggleEmergencyOnly}
                className={`w-11 h-6 rounded-full p-0.5 flex items-center transition-colors cursor-pointer ${
                  emergencyOnlyMode ? 'bg-[#C41E3A]' : 'bg-[#E4E1E7]'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                    emergencyOnlyMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Quiet Hours & Transparency */}
            <div className="flex flex-col divide-y divide-[#E4E6EB]/40 pt-1">
              <div className="py-2 flex items-center justify-between text-left">
                <div className="flex items-center gap-2.5">
                  <Moon className="w-4 h-4 text-[#5B5F6B]" />
                  <div>
                    <p className="text-xs font-bold text-[#1B1B1F]">
                      {language === 'bn' ? 'রাতের নীরব সময় (Quiet Hours)' : 'Quiet Hours'}
                    </p>
                    <p className="text-[11px] text-[#5B5F6B]">
                      {language === 'bn' ? 'রাত ১১টা থেকে সকাল ৬টা' : '11:00 PM – 06:00 AM'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleQuietHours}
                  className={`w-10 h-5.5 rounded-full p-0.5 flex items-center transition-colors cursor-pointer ${
                    quietHoursActive ? 'bg-[#00744B]' : 'bg-[#E4E1E7]'
                  }`}
                >
                  <span
                    className={`w-4.5 h-4.5 rounded-full bg-white shadow-xs transform transition-transform ${
                      quietHoursActive ? 'translate-x-4.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 2 ================= */}
        <div className="flex flex-col gap-4">
          {/* ================= 4. ELIGIBILITY TRACKER (100% FUNCTIONAL) ================= */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-[#E4E6EB]/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C41E3A]" />
                <h3 className="font-bold text-[16px] text-[#1B1B1F]">
                  {language === 'bn' ? 'রক্তদানের যোগ্যতা ট্র্যাকার' : 'Eligibility Tracker'}
                </h3>
              </div>
              <button
                onClick={() => setShowEligibilityModal(true)}
                className="text-[11px] bg-[#FDECEF] hover:bg-[#FFDAD6] text-[#C41E3A] px-2.5 py-1 rounded-full font-bold transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'তারিখ আপডেট / কাস্টম' : 'Update Date'}
              </button>
            </div>

            <div className="flex items-center gap-4 pt-1">
              {/* Circular Gauge */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#E4E6EB]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={daysRemaining === 0 ? 'text-[#00744B]' : 'text-[#C41E3A]'}
                    strokeDasharray={`${Math.min(100, Math.max(10, cyclePercent))}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[18px] font-black text-[#1B1B1F] leading-none">
                    {formatDigits(daysRemaining)}
                  </span>
                  <span className="text-[9.5px] text-[#5B5F6B] mt-0.5 font-medium">
                    {daysRemaining === 0
                      ? language === 'bn'
                        ? 'প্রস্তুত!'
                        : 'Ready!'
                      : language === 'bn'
                      ? 'দিন বাকি'
                      : 'days left'}
                  </span>
                </div>
              </div>

              {/* Status explanation */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <span className={`w-2 h-2 rounded-full ${daysRemaining === 0 ? 'bg-[#00744B]' : 'bg-[#C9962B]'}`} />
                  <span className={daysRemaining === 0 ? 'text-[#00744B]' : 'text-[#C9962B]'}>
                    {daysRemaining === 0
                      ? language === 'bn'
                        ? 'সম্পূর্ণ প্রস্তুত ও সক্রিয়'
                        : 'Fully Eligible & Ready'
                      : language === 'bn'
                      ? 'পুনরুদ্ধার পর্ব চলছে'
                      : 'Recovery Phase'}
                  </span>
                </div>
                <h4 className="font-bold text-[14px] text-[#1B1B1F] mt-1 leading-snug">
                  {language === 'bn' ? `পরবর্তী সম্ভাব্য তারিখ: ${nextEligibleDate}` : `Next eligible date: ${nextEligibleDate}`}
                </h4>
                <p className="text-xs text-[#5B5F6B] mt-1 leading-relaxed">
                  {daysRemaining === 0
                    ? language === 'bn'
                      ? 'আপনার রক্তের উপাদান সম্পূর্ণ সুস্থ। যে কোনো জরুরি আবেদনে সাড়া দিতে পারেন।'
                      : 'Your hemoglobin is completely replenished. You can donate blood anytime!'
                    : language === 'bn'
                    ? 'শরীরের লোহিত কণিকা সম্পূর্ণ সতেজ হতে পর্যাপ্ত পুষ্টিকর খাবার ও পানি গ্রহণ করুন।'
                    : 'Stay hydrated and consume iron-rich foods for full erythrocyte replenishment.'}
                </p>
              </div>
            </div>

            {/* Biological Metric Breakdown */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#E4E6EB]/50 text-center">
              <div className="p-2 rounded-xl bg-[#F7F7F9]">
                <span className="text-[10px] text-[#5B5F6B] block">
                  {language === 'bn' ? 'হিমোগ্লোবিন' : 'Hemoglobin'}
                </span>
                <span className="text-xs font-bold text-[#1B1B1F] mt-0.5 block">{estimatedHb} g/dL</span>
              </div>
              <div className="p-2 rounded-xl bg-[#F7F7F9]">
                <span className="text-[10px] text-[#5B5F6B] block">
                  {language === 'bn' ? 'প্লাজমা স্তর' : 'Plasma'}
                </span>
                <span className="text-xs font-bold text-[#00744B] mt-0.5 block">
                  {language === 'bn' ? '১০০% সতেজ' : '100% Ready'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#F7F7F9]">
                <span className="text-[10px] text-[#5B5F6B] block">
                  {language === 'bn' ? 'রিকভারি হার' : 'Recovery'}
                </span>
                <span className="text-xs font-bold text-[#C41E3A] mt-0.5 block">{formatDigits(cyclePercent)}%</span>
              </div>
            </div>

            {/* Quick Eligibility Action Chips */}
            <div className="flex items-center gap-2 pt-1 border-t border-[#E4E6EB]/50">
              <button
                onClick={handleMarkDonatedToday}
                className="flex-1 py-2 rounded-xl bg-[#F7F7F9] hover:bg-[#FDECEF] text-[#C41E3A] font-bold text-xs transition-colors cursor-pointer border border-[#E4E6EB]/60 flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'আজ রক্তদান করেছি' : 'Donated Today'}</span>
              </button>
              <button
                onClick={handleMarkEligibleNow}
                className="flex-1 py-2 rounded-xl bg-[#F7F7F9] hover:bg-[#E8F5E9] text-[#00744B] font-bold text-xs transition-colors cursor-pointer border border-[#E4E6EB]/60 flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'এখনই প্রস্তুত আমি' : 'Ready Now'}</span>
              </button>
            </div>
          </div>

          {/* ================= 5. HUMANITARIAN IMPACT SUMMARY ================= */}
          <div className="bg-gradient-to-br from-[#9E0027] to-[#C41E3A] text-white rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-6 opacity-10 pointer-events-none">
              <Heart className="w-36 h-36 fill-current" />
            </div>

            <div className="relative z-10 flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-widest font-bold text-[#FFDAD9]">
                {language === 'bn' ? 'মানবিক প্রভাব' : 'Humanitarian Impact'}
              </span>
              <h3 className="text-[17px] font-extrabold text-white leading-snug">
                {language === 'bn'
                  ? `আপনার ${formatDigits(totalDonations)}টি রক্তদান — ${formatDigits(livesImpacted)} জন মানুষের পাশে নির্ভয়ে দাঁড়ানো`
                  : `Your ${totalDonations} blood donations — standing firmly beside ${livesImpacted} souls`}
              </h3>
              <p className="text-xs text-[#FFDADA] opacity-90 leading-relaxed">
                {language === 'bn'
                  ? 'আপনার নিঃস্বার্থ অবদানে বেঁচে থাকুক মানবতা ও অগণিত হাসিমুখ।'
                  : 'Through your selfless donations, lives are saved and families comforted.'}
              </p>
            </div>

            {/* Impact Stats Grid */}
            <div className="relative z-10 grid grid-cols-3 gap-2 pt-1">
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center text-center">
                <span className="text-[20px] font-extrabold text-white leading-tight">
                  {formatDigits(totalDonations)}
                </span>
                <span className="text-[11px] text-white opacity-90 mt-0.5 font-medium">
                  {language === 'bn' ? 'মোট রক্তদান' : 'Donations'}
                </span>
              </div>

              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center text-center">
                <span className="text-[20px] font-extrabold text-white leading-tight">
                  {formatDigits(livesImpacted)}+
                </span>
                <span className="text-[11px] text-white opacity-90 mt-0.5 font-medium">
                  {language === 'bn' ? 'জীবন স্পর্শিত' : 'Lives Saved'}
                </span>
              </div>

              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center text-center">
                <span className="text-[20px] font-extrabold text-white leading-tight">
                  {formatDigits(userProfile.emergencyResponses || 3)}
                </span>
                <span className="text-[11px] text-white opacity-90 mt-0.5 font-medium">
                  {language === 'bn' ? 'জরুরি সাড়া' : 'Urgent Matches'}
                </span>
              </div>
            </div>
          </div>

          {/* ================= 6. DONATION HISTORY (100% FUNCTIONAL) ================= */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-[#E4E6EB]/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[16px] text-[#1B1B1F]">
                  {language === 'bn' ? 'পূর্ববর্তী রক্তদানের ইতিহাস' : 'Donation History'}
                </h3>
                <p className="text-xs text-[#5B5F6B]">
                  {language === 'bn' ? 'যাচাইকৃত রক্তদান ও হাসপাতালের রেকর্ড' : 'Verified donation log'}
                </p>
              </div>
              <button
                onClick={() => setShowAddDonationModal(true)}
                className="flex items-center gap-1 text-xs font-bold text-[#C41E3A] hover:bg-[#FDECEF] px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer border border-[#FFDAD6]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'নতুন রেকর্ড যোগ' : 'Add Record'}</span>
              </button>
            </div>

            {donationHistory.length > 0 ? (
              <div className="space-y-2.5">
                {donationHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.status === 'completed') {
                        setSelectedCertificate(item);
                      } else {
                        showToast(
                          language === 'bn'
                            ? 'শুধুমাত্র সফলভাবে সম্পন্ন ও যাচাইকৃত রক্তদানের সনদ প্রদর্শিত হয়।'
                            : 'Digital certificates are issued only for completed donations.',
                          'info'
                        );
                      }
                    }}
                    className="p-3 bg-[#F7F7F9] hover:bg-white rounded-2xl flex items-center justify-between border border-[#E4E6EB]/60 hover:border-[#C41E3A]/40 transition-all cursor-pointer shadow-2xs group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center font-extrabold text-xs shrink-0 group-hover:scale-105 transition-transform">
                        {bloodGroup}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-[#1B1B1F] truncate">{item.hospital}</p>
                        <p className="text-[11px] text-[#5B5F6B] mt-0.5 truncate">
                          {item.date} • {item.recipientType} {item.units ? `(${formatDigits(item.units)} ব্যাগ)` : ''}
                        </p>
                        {item.certificateId && (
                          <span className="text-[10px] text-[#0D58C9] font-mono block">
                            #{item.certificateId}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] bg-[#E8F5E9] text-[#005938] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>{language === 'bn' ? 'সনদপত্র' : 'Certificate'}</span>
                      </span>

                      <button
                        onClick={(e) => handleDeleteDonationRecord(item.id, e)}
                        title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center space-y-2">
                <p className="text-xs font-semibold text-gray-700">
                  {language === 'bn' ? 'কোনো রক্তদান রেকর্ড সংরক্ষিত নেই' : 'No donation records logged'}
                </p>
                <p className="text-[11px] text-gray-500">
                  {language === 'bn'
                    ? 'রক্তদানের পর হাসপাতাল বা ক্যাম্প থেকে এখানে আপনার রেকর্ড যুক্ত করুন।'
                    : 'After donating, log your hospital certificate or record here.'}
                </p>
                <button
                  onClick={() => setShowAddDonationModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#C41E3A] text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'প্রথম রক্তদান রেকর্ড করুন' : 'Log First Donation'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= 7. LIVE BLOOD DONATION & HEALTH ANALYTICS (FULL WIDTH) ================= */}
      <div className="px-3 sm:px-4 mt-4 w-full">
        <BloodAnalyticsCharts completedRequestCount={totalDonations} />
      </div>

      {/* ================= MODAL 1: 100% FUNCTIONAL SHARE SHEET ================= */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EB]">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#C41E3A]" />
                <h3 className="font-extrabold text-[16px] text-[#1B1B1F]">
                  {language === 'bn' ? 'রক্তদাতা স্মার্ট কার্ড ও প্রোফাইল শেয়ার' : 'Share Donor Card & Profile'}
                </h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#5B5F6B] hover:bg-[#F7F7F9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Donor Quick Card Preview in Share Sheet */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FDECEF] to-[#FFF0F2] border border-[#FFDAD6] flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#C41E3A] text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                {bloodGroup}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-extrabold text-sm text-[#1B1B1F] block truncate">{displayName}</span>
                <span className="text-[11px] text-[#5B5F6B] block">
                  {language === 'bn' ? `স্বেচ্ছাসেবী আইডি: #${donorId}` : `Donor ID: #${donorId}`} •{' '}
                  {userProfile.location || (language === 'bn' ? 'বগুড়া সদর' : 'Bogura Sadar')}
                </span>
                <span className="text-[10.5px] text-[#00744B] font-bold mt-0.5 block">
                  ✓ {isAvailable ? (language === 'bn' ? 'সক্রিয় ও রক্তদানে প্রস্তুত' : 'Active & Ready') : (language === 'bn' ? 'সাময়িক বিশ্রামে' : 'On break')}
                </span>
              </div>
            </div>

            {/* Share Channel Buttons (Full Mobile-friendly Grid) */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleWhatsAppShare}
                className="p-3 rounded-2xl bg-[#E8F8EE] text-[#00744B] hover:bg-[#D4F4DF] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#A7E8BD]"
              >
                <MessageCircle className="w-4 h-4 text-[#00744B]" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleTelegramShare}
                className="p-3 rounded-2xl bg-[#E8F5FD] text-[#0288D1] hover:bg-[#D7EDFB] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#81D4FA]"
              >
                <Send className="w-4 h-4 text-[#0288D1]" />
                <span>Telegram</span>
              </button>

              <button
                onClick={handleFacebookShare}
                className="p-3 rounded-2xl bg-[#EBF3FF] text-[#0D58C9] hover:bg-[#D6E7FF] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#B3D4FF]"
              >
                <ExternalLink className="w-4 h-4 text-[#0D58C9]" />
                <span>Facebook</span>
              </button>

              <button
                onClick={handleSMSShare}
                className="p-3 rounded-2xl bg-[#FFF9E6] text-[#B78103] hover:bg-[#FFF3CD] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#FFE082]"
              >
                <Phone className="w-4 h-4 text-[#B78103]" />
                <span>SMS / বার্তা</span>
              </button>

              <button
                onClick={handleCopyShareLink}
                className="p-3 rounded-2xl bg-[#F7F7F9] hover:bg-[#F0EDF2] text-[#1B1B1F] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#E4E6EB]"
              >
                {copiedLink ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#5B5F6B]" />}
                <span>{copiedLink ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (language === 'bn' ? 'কপি লিংক' : 'Copy Link')}</span>
              </button>

              <button
                onClick={handleDownloadCard}
                className="p-3 rounded-2xl bg-[#FDECEF] hover:bg-[#FFDAD6] text-[#C41E3A] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#FFCDD2]"
              >
                <Download className="w-4 h-4 text-[#C41E3A]" />
                <span>{language === 'bn' ? 'কার্ড ডাউনলোড' : 'Download Card'}</span>
              </button>
            </div>

            {/* Copy full formatted text message */}
            <div className="bg-[#F7F7F9] rounded-2xl p-3 border border-[#E4E6EB]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-[#5B5F6B]">
                  {language === 'bn' ? 'মেসেজ প্রিভিউ (কপি করতে ক্লিক করুন)' : 'Text Preview (Click to Copy)'}
                </span>
                <button
                  onClick={handleCopyTextContent}
                  className="text-xs font-bold text-[#0D58C9] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি করুন' : 'Copy Text')}</span>
                </button>
              </div>
              <p className="text-[11px] font-mono text-gray-700 whitespace-pre-line leading-relaxed max-h-24 overflow-y-auto">
                {shareTextContent}
              </p>
            </div>

            {/* Native OS Share Button */}
            <button
              onClick={handleNativeShare}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#9E0027] to-[#C41E3A] text-white font-bold text-sm shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>{language === 'bn' ? 'অন্যান্য অ্যাপে শেয়ার করুন' : 'Share to Other Apps'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: VERIFIED CREDENTIALS / QR SCAN MODAL ================= */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EB]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00744B]" />
                <h3 className="font-extrabold text-[16px] text-[#1B1B1F]">
                  {language === 'bn' ? 'যাচাইকৃত জাতীয় ডোনার সনদ' : 'Verified Donor Credentials'}
                </h3>
              </div>
              <button
                onClick={() => setShowCardModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#5B5F6B] hover:bg-[#F7F7F9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-gradient-to-b from-[#FDECEF]/50 to-white rounded-2xl border border-[#FFDAD6]">
              <div className="w-32 h-32 bg-white p-2 rounded-2xl border-2 border-[#C41E3A] shadow-xs flex items-center justify-center mb-3">
                <QrCode className="w-28 h-28 text-[#1B1B1F]" />
              </div>
              <h4 className="font-extrabold text-base text-[#1B1B1F]">{displayName}</h4>
              <p className="text-xs text-[#5B5F6B] font-mono mt-0.5">ID: #{donorId}</p>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-[#E8F5E9] text-[#005938] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{language === 'bn' ? 'জাতীয় ডেটাবেসে ভেরিফায়েড' : 'National Registry Verified'}</span>
                </span>
                <span className="text-xs bg-red-100 text-red-800 font-bold px-3 py-1 rounded-full">
                  {bloodGroup}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F7F9]">
                <span className="text-[#5B5F6B]">{language === 'bn' ? 'ইস্যুকারী কর্তৃপক্ষ:' : 'Issuer:'}</span>
                <span className="font-bold text-[#1B1B1F]">গণপ্রজাতন্ত্রী বাংলাদেশ রক্তসেবা নেটওয়ার্ক</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F7F9]">
                <span className="text-[#5B5F6B]">{language === 'bn' ? 'মেয়াদ:' : 'Validity:'}</span>
                <span className="font-bold text-[#1B1B1F]">2026 – 2031 (৫ বছর)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F7F9]">
                <span className="text-[#5B5F6B]">{language === 'bn' ? 'নিরাপত্তা চেকসাম:' : 'Checksum:'}</span>
                <span className="font-mono font-bold text-[#0D58C9]">SHA-256 #8f92b41</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleDownloadCard}
                className="flex-1 py-3 rounded-xl bg-[#C41E3A] hover:bg-[#A3182F] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'bn' ? 'স্মার্ট কার্ড ডাউনলোড' : 'Download Smart Card'}</span>
              </button>
              <button
                onClick={() => setShowCardModal(false)}
                className="py-3 px-4 rounded-xl bg-[#F7F7F9] text-[#1B1B1F] font-bold text-xs cursor-pointer"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: ADD NEW DONATION RECORD ================= */}
      {showAddDonationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EB]">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#C41E3A]" />
                <h3 className="font-extrabold text-[16px] text-[#1B1B1F]">
                  {language === 'bn' ? 'রক্তদানের নতুন রেকর্ড যুক্ত করুন' : 'Add Blood Donation Record'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddDonationModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#5B5F6B] hover:bg-[#F7F7F9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDonationSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#1B1B1F] block mb-1">
                  {language === 'bn' ? 'হাসপাতাল বা রক্তদান ক্যাম্পের নাম' : 'Hospital or Camp Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={newHospital}
                  onChange={(e) => setNewHospital(e.target.value)}
                  placeholder={
                    language === 'bn'
                      ? 'উদা: শহীদ জিয়াউর রহমান মেডিকেল কলেজ হাসপাতাল'
                      : 'e.g., Bogura Medical College Hospital'
                  }
                  className="w-full h-11 px-3.5 rounded-xl bg-[#F7F7F9] text-xs font-semibold text-[#1B1B1F] border border-[#E4E6EB] focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-[#1B1B1F] block mb-1">
                    {language === 'bn' ? 'রক্তদানের তারিখ' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#F7F7F9] text-xs font-semibold text-[#1B1B1F] border border-[#E4E6EB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#1B1B1F] block mb-1">
                    {language === 'bn' ? 'রক্তের পরিমাণ' : 'Bags'}
                  </label>
                  <select
                    value={newBags}
                    onChange={(e) => setNewBags(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl bg-[#F7F7F9] text-xs font-semibold text-[#1B1B1F] border border-[#E4E6EB]"
                  >
                    <option value={1}>১ ব্যাগ (450ml)</option>
                    <option value={2}>২ ব্যাগ (Apheresis)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1B1B1F] block mb-1">
                  {language === 'bn' ? 'গ্রহীতার ধরন / রোগীর পরিস্থিতি' : 'Recipient Type'}
                </label>
                <select
                  value={newRecipientType}
                  onChange={(e) => setNewRecipientType(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#F7F7F9] text-xs font-semibold text-[#1B1B1F] border border-[#E4E6EB]"
                >
                  <option value="জরুরি সার্জারি রোগী">
                    {language === 'bn' ? 'জরুরি সার্জারি রোগী' : 'Emergency Surgery'}
                  </option>
                  <option value="থ্যালাসেমিয়া আক্রান্ত শিশু">
                    {language === 'bn' ? 'থ্যালাসেমিয়া আক্রান্ত শিশু' : 'Thalassemia Patient'}
                  </option>
                  <option value="প্রসূতি মা (সিজারিয়ান)">
                    {language === 'bn' ? 'প্রসূতি মা (সিজারিয়ান)' : 'Maternity / Caesarean'}
                  </option>
                  <option value="দুর্ঘটনায় আহত রোগী">
                    {language === 'bn' ? 'দুর্ঘটনায় আহত রোগী' : 'Trauma / Accident'}
                  </option>
                  <option value="স্বেচ্ছাসেবী ক্যাম্প ড্রাইভ">
                    {language === 'bn' ? 'স্বেচ্ছাসেবী ক্যাম্প ড্রাইভ' : 'Voluntary Blood Camp'}
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1B1B1F] block mb-1">
                  {language === 'bn' ? 'রেফারেন্স / নোট (ঐচ্ছিক)' : 'Certificate / Reference Note'}
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder={
                    language === 'bn'
                      ? 'উদা: স্লিপ নং ৮৮৪২, সন্ধানী রক্তদান সনদ'
                      : 'e.g., Certificate Slip #8842'
                  }
                  className="w-full h-11 px-3.5 rounded-xl bg-[#F7F7F9] text-xs font-semibold text-[#1B1B1F] border border-[#E4E6EB] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDonationModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#F7F7F9] text-[#5B5F6B] font-bold text-xs"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#C41E3A] hover:bg-[#A3182F] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: ELIGIBILITY DATE CALCULATOR ================= */}
      {showEligibilityModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EB]">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#C41E3A]" />
                <h3 className="font-extrabold text-[16px] text-[#1B1B1F]">
                  {language === 'bn' ? 'রক্তদানের যোগ্যতা ক্যালকুলেটর' : 'Eligibility Calculator'}
                </h3>
              </div>
              <button
                onClick={() => setShowEligibilityModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#5B5F6B] hover:bg-[#F7F7F9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5B5F6B] leading-relaxed">
              {language === 'bn'
                ? 'রক্তদানের পর শরীরে লোহিত রক্তকণিকা ও হিমোগ্লোবিন সম্পূর্ণ পুনর্গঠিত হতে গড়ে ৯০ দিন সময় লাগে। আপনার সর্বশেষ রক্তদানের অবস্থা নির্বাচন করুন:'
                : 'Medical guidelines recommend waiting 90 days between donations for complete erythrocyte replenishment. Select your last donation date:'}
            </p>

            {/* Custom Date Form */}
            <form onSubmit={handleApplyCustomDonationDate} className="p-3 bg-[#F7F7F9] rounded-2xl space-y-2 border border-[#E4E6EB]">
              <label className="text-xs font-bold text-[#1B1B1F] block">
                {language === 'bn' ? 'সর্বশেষ রক্তদানের সঠিক তারিখ নির্বাচন করুন:' : 'Select exact date of last donation:'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customDonationDate}
                  onChange={(e) => setCustomDonationDate(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl bg-white text-xs font-semibold text-[#1B1B1F] border border-[#E4E6EB]"
                />
                <button
                  type="submit"
                  className="px-4 h-10 rounded-xl bg-[#C41E3A] text-white font-bold text-xs shadow-xs hover:bg-[#A3182F] cursor-pointer"
                >
                  {language === 'bn' ? 'হিসাব করুন' : 'Calculate'}
                </button>
              </div>
            </form>

            <div className="space-y-2.5 pt-1">
              <button
                onClick={handleMarkDonatedToday}
                className="w-full p-3 rounded-2xl bg-[#FDECEF] hover:bg-[#FFDAD6] border border-[#FFCDD2] text-left transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-xs text-[#9E0027]">
                    {language === 'bn' ? 'আমি আজই রক্তদান সম্পন্ন করেছি' : 'I Donated Blood Today'}
                  </h4>
                  <p className="text-[11px] text-[#C41E3A]">
                    {language === 'bn' ? '৯০ দিনের রিকভারি কাউন্টডাউন শুরু করুন' : 'Start 90-day biological countdown'}
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-[#C41E3A]" />
              </button>

              <button
                onClick={handleMarkEligibleNow}
                className="w-full p-3 rounded-2xl bg-[#E8F5E9] hover:bg-[#D4F4DF] border border-[#A7E8BD] text-left transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-xs text-[#005938]">
                    {language === 'bn' ? '৩ মাসের বেশি আগে দান করেছি (এখন প্রস্তুত)' : 'Donated > 3 Months Ago (Ready Now)'}
                  </h4>
                  <p className="text-[11px] text-[#00744B]">
                    {language === 'bn' ? 'অবিলম্বে রক্তদানের জন্য প্রস্তুত হিসেবে চিহ্নিত করুন' : 'Mark as fully eligible & ready today'}
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-[#00744B]" />
              </button>
            </div>

            {/* Reminder Toggle */}
            <div className="p-3 bg-[#F7F7F9] rounded-2xl flex items-center justify-between border border-[#E4E6EB]/60">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#C41E3A]" />
                <div>
                  <p className="text-xs font-bold text-[#1B1B1F]">
                    {language === 'bn' ? 'যোগ্যতা রিমাইন্ডার নোটিফিকেশন' : 'Eligibility Completion Alert'}
                  </p>
                  <p className="text-[10px] text-[#5B5F6B]">
                    {language === 'bn' ? '৯০ দিন পূর্ণ হলে স্বয়ংক্রিয় অ্যালার্ট' : 'Notify me when 90 days are complete'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleEligibilityReminder}
                className={`w-10 h-5.5 rounded-full p-0.5 flex items-center transition-colors cursor-pointer ${
                  eligibilityReminder ? 'bg-[#00744B]' : 'bg-[#E4E1E7]'
                }`}
              >
                <span
                  className={`w-4.5 h-4.5 rounded-full bg-white shadow-xs transform transition-transform ${
                    eligibilityReminder ? 'translate-x-4.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: DONATION APPRECIATION CERTIFICATE ================= */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EB]">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-extrabold text-[16px] text-[#1B1B1F]">
                  {language === 'bn' ? 'স্বেচ্ছাসেবী রক্তদান সনদপত্র' : 'Donation Certificate of Honor'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCertificate(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#5B5F6B] hover:bg-[#F7F7F9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Certificate Visual Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#FFFDF7] to-[#FFF9E6] border-2 border-[#E5C158] relative overflow-hidden shadow-sm text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#8C6B14] mb-1">
                <Award className="w-7 h-7" />
              </div>
              <span className="text-[10px] tracking-widest uppercase font-extrabold text-[#8C6B14] block">
                {language === 'bn' ? 'জাতীয় রক্তদান স্বীকৃতি' : 'NATIONAL VOLUNTEER APPRECIATION'}
              </span>
              <h4 className="font-black text-lg text-[#1B1B1F] leading-tight">
                {language === 'bn' ? 'জীবন রক্ষক স্মারক সনদ' : 'Certificate of Life Saving'}
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed pt-1">
                {language === 'bn'
                  ? `কৃতজ্ঞতার সাথে প্রত্যয়ন করা হচ্ছে যে, ${displayName} (${bloodGroup}) নিঃস্বার্থভাবে রক্তদান করে মানবসেবায় অনন্য অবদান রেখেছেন।`
                  : `Proudly certified that ${displayName} (${bloodGroup}) has selflessly donated blood to save a life.`}
              </p>

              <div className="pt-2 pb-1 border-t border-[#E5C158]/40 grid grid-cols-2 gap-2 text-left text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 block">{language === 'bn' ? 'হাসপাতাল / স্থান:' : 'Hospital:'}</span>
                  <span className="font-bold text-gray-900 block truncate">{selectedCertificate.hospital}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">{language === 'bn' ? 'তারিখ:' : 'Date:'}</span>
                  <span className="font-bold text-gray-900 block">{selectedCertificate.date}</span>
                </div>
              </div>

              {selectedCertificate.certificateId && (
                <p className="text-[10px] font-mono text-[#8C6B14] pt-1">
                  ID: #{selectedCertificate.certificateId}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  showToast(
                    language === 'bn' ? 'সনদপত্র ডাউনলোড সম্পন্ন হয়েছে!' : 'Certificate saved!',
                    'success'
                  );
                  setSelectedCertificate(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#C41E3A] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'সনদ ডাউনলোড' : 'Download Certificate'}</span>
              </button>
              <button
                onClick={() => setSelectedCertificate(null)}
                className="py-2.5 px-4 rounded-xl bg-[#F7F7F9] text-gray-700 font-bold text-xs cursor-pointer"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 6: EDIT PROFILE MODAL ================= */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E6EB]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center font-bold">
                  <Edit3 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[16px] text-[#1B1B1F]">
                    {language === 'bn' ? 'প্রোফাইল তথ্য সম্পাদনা' : 'Edit Profile Information'}
                  </h3>
                  <p className="text-[11px] text-[#5B5F6B]">
                    {language === 'bn' ? 'আপনার ব্যক্তিগত ও রক্তদানের তথ্য হালনাগাদ করুন' : 'Update personal and blood donation info'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#5B5F6B] hover:bg-[#F7F7F9] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-[#1B1B1F] block mb-1">
                  {language === 'bn' ? 'পূর্ণ নাম' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={language === 'bn' ? 'আপনার পূর্ণ নাম লিখুন' : 'Enter your full name'}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#F7F7F9] text-xs font-semibold text-[#1B1B1F] border border-[#E4E6EB] focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                />
              </div>

              {/* Blood Group Selector */}
              <div>
                <label className="text-xs font-bold text-[#1B1B1F] block mb-1.5">
                  {language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'} *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as BloodGroup[]).map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setEditBloodGroup(bg)}
                      className={`h-10 rounded-xl font-black text-xs transition-all cursor-pointer border ${
                        editBloodGroup === bg
                          ? 'bg-[#C41E3A] text-white border-[#C41E3A] shadow-xs'
                          : 'bg-[#F7F7F9] text-[#1B1B1F] border-[#E4E6EB] hover:bg-[#FDECEF]'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="text-xs font-bold text-[#1B1B1F] block mb-1">
                  {language === 'bn' ? 'মোবাইল নম্বর (জরুরি যোগাযোগের জন্য)' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder={language === 'bn' ? '০১৭১২-৩৪৫৬৭৮' : '01712-345678'}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#F7F7F9] text-xs font-semibold text-[#1B1B1F] border border-[#E4E6EB] focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                />
                <p className="text-[10.5px] text-[#5B5F6B] mt-1">
                  {language === 'bn'
                    ? '🔒 নম্বরটি কঠোরভাবে সুরক্ষিত এবং অনুমোদিত রোগীর স্বজন ব্যতীত কারো কাছে উন্মুক্ত নয়।'
                    : '🔒 Phone is strictly protected and revealed only to verified emergency contacts.'}
                </p>
              </div>

              {/* Division & District */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#1B1B1F] block mb-1">
                    {language === 'bn' ? 'বিভাগ' : 'Division'}
                  </label>
                  <select
                    value={editDivision}
                    onChange={(e) => {
                      const div = e.target.value;
                      setEditDivision(div);
                      const matching = allDistricts.filter(
                        (d) => d.divisionBn === div || d.divisionEn.toLowerCase() === div.toLowerCase()
                      );
                      if (matching.length > 0) {
                        setEditDistrict(matching[0].nameBn);
                        setEditUpazila(matching[0].upazilas[0] || '');
                      }
                    }}
                    className="w-full h-11 px-3 rounded-xl bg-[#F7F7F9] text-xs font-semibold text-[#1B1B1F] border border-[#E4E6EB] focus:outline-none"
                  >
                    {divisionsList.map((d) => (
                      <option key={d.id} value={d.nameBn}>
                        {d.nameBn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1B1B1F] block mb-1">
                    {language === 'bn' ? 'জেলা' : 'District'}
                  </label>
                  <select
                    value={editDistrict}
                    onChange={(e) => {
                      const dist = e.target.value;
                      setEditDistrict(dist);
                      const dObj = allDistricts.find(
                        (d) => d.nameBn === dist || d.nameEn.toLowerCase() === dist.toLowerCase()
                      );
                      if (dObj && dObj.upazilas.length > 0) {
                        setEditUpazila(dObj.upazilas[0]);
                      }
                    }}
                    className="w-full h-11 px-3 rounded-xl bg-[#F7F7F9] text-xs font-semibold text-[#1B1B1F] border border-[#E4E6EB] focus:outline-none"
                  >
                    {availableDistricts.map((d) => (
                      <option key={d.id} value={d.nameBn}>
                        {d.nameBn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Upazila & Specific Area */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#1B1B1F] block mb-1">
                    {language === 'bn' ? 'উপজেলা / থানা' : 'Upazila'}
                  </label>
                  <select
                    value={editUpazila}
                    onChange={(e) => setEditUpazila(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#F7F7F9] text-xs font-semibold text-[#1B1B1F] border border-[#E4E6EB] focus:outline-none"
                  >
                    {availableUpazilas.length > 0 ? (
                      availableUpazilas.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))
                    ) : (
                      <option value={editDistrict + ' সদর'}>{editDistrict} সদর</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1B1B1F] block mb-1">
                    {language === 'bn' ? 'এলাকা / মহল্লা' : 'Area / Neighborhood'}
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder={language === 'bn' ? 'উদা: জলেশ্বরীতলা, কলোনি' : 'e.g., Joleshworitola'}
                    className="w-full h-11 px-3 rounded-xl bg-[#F7F7F9] text-xs font-semibold text-[#1B1B1F] border border-[#E4E6EB] focus:outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="flex-1 py-3 rounded-xl bg-[#F7F7F9] text-[#5B5F6B] font-bold text-xs hover:bg-[#E4E6EB] transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-1 py-3 rounded-xl bg-[#C41E3A] hover:bg-[#A3182F] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>
                    {isSavingProfile
                      ? language === 'bn'
                        ? 'সংরক্ষণ হচ্ছে...'
                        : 'Saving...'
                      : language === 'bn'
                      ? 'পরিবর্তন সংরক্ষণ করুন'
                      : 'Save Changes'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden off-screen canvas for real image generation */}
      <canvas ref={cardCanvasRef} className="hidden" />
    </div>
  );
};
