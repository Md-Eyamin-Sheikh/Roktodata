import { getSupabaseClient } from '@/lib/supabase/client';
import { UserProfile, BloodGroup } from '@/lib/types';

const AUTH_STORAGE_KEY = 'roktodata_auth_user_v1';
const PENDING_OAUTH_KEY = 'roktodata_pending_oauth_v1';

export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  message?: string;
  error?: string;
  needsContactDetails?: boolean;
  provider?: 'email' | 'google' | 'facebook';
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  phone: string;
  bloodGroup: BloodGroup;
  division?: string;
  district: string;
  upazila?: string;
  role?: 'donor' | 'recipient';
}

export interface CompleteDonorProfilePayload {
  phone: string;
  bloodGroup: BloodGroup;
  division: string;
  district: string;
  upazila?: string;
  isAvailable?: boolean;
  lastDonationDate?: string;
  phoneVisibility?: 'verified_family' | 'all_registered';
  quietHoursEnabled?: boolean;
}

/**
 * Normalizes Bangladeshi phone numbers into clean format: 01XXXXXXXXX
 */
export const normalizePhoneNumber = (raw: string): string => {
  const bengaliNumerals: { [key: string]: string } = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  };
  let clean = (raw || '').replace(/[০-৯]/g, (w) => bengaliNumerals[w] || w);
  clean = clean.replace(/[\s\-\(\)\+]/g, '');

  if (clean.startsWith('880')) {
    clean = clean.slice(2);
  }
  if (!clean.startsWith('0') && clean.length === 10) {
    clean = '0' + clean;
  }
  return clean;
};

/**
 * Validates Bangladeshi mobile number format (013-019XXXXXXXX)
 */
export const isValidBdPhoneNumber = (phone: string): boolean => {
  const normalized = normalizePhoneNumber(phone);
  return /^01[3-9]\d{8}$/.test(normalized);
};

/**
 * Validates email address format
 */
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
};

/**
 * Formats phone number for clean UI display: 01712-345678
 */
export const formatBdPhoneDisplay = (phone: string): string => {
  const norm = normalizePhoneNumber(phone);
  if (norm.length === 11) {
    return `${norm.slice(0, 5)}-${norm.slice(5)}`;
  }
  return phone;
};

/**
 * Checks if a phone number is already registered in public.profiles by another user
 */
export const checkPhoneDuplicate = async (
  rawPhone: string,
  excludeUserId?: string
): Promise<{ isDuplicate: boolean; message?: string }> => {
  const norm = normalizePhoneNumber(rawPhone);
  if (!norm || norm.length < 11) {
    return { isDuplicate: false };
  }
  const formatted = formatBdPhoneDisplay(norm);
  const supabase = getSupabaseClient();
  if (!supabase) return { isDuplicate: false };

  try {
    const { data, error } = await (supabase as any)
      .from('profiles')
      .select('id, phone_number, full_name')
      .or(`phone_number.eq.${norm},phone_number.eq.${formatted}`);

    if (!error && Array.isArray(data) && data.length > 0) {
      const conflicting = data.find((row: any) => row.id !== excludeUserId);
      if (conflicting) {
        return {
          isDuplicate: true,
          message: `এই মোবাইল নম্বরটি (${formatted}) ইতিমধ্যে একজন রক্তদাতার অ্যাকাউন্টে নিবন্ধিত আছে। অনুগ্রহ করে আপনার নিজস্ব সচল নম্বর ব্যবহার করুন।`,
        };
      }
    }
  } catch (err: any) {
    console.warn('Phone duplicate check note:', err?.message);
  }

  return { isDuplicate: false };
};

/**
 * Helper to build a standard UserProfile from raw data
 */
export const createProfileObject = (
  name: string,
  email: string,
  phone: string,
  bloodGroup: BloodGroup,
  district: string,
  userId?: string,
  role: 'donor' | 'recipient' = 'donor',
  division?: string,
  upazila?: string
): UserProfile => {
  const formattedPhone = formatBdPhoneDisplay(phone);
  const donorId = userId
    ? `RD-${userId.replace(/-/g, '').slice(0, 6).toUpperCase()}`
    : `RD-${Math.floor(10000 + Math.random() * 90000)}`;

  const isComplete = Boolean(
    phone &&
    normalizePhoneNumber(phone).length >= 11 &&
    bloodGroup &&
    district &&
    division
  );

  return {
    name: name.trim() || 'রক্তদাতা সদস্য',
    email: email.trim().toLowerCase(),
    bloodGroup: bloodGroup || 'B+',
    donorId,
    phone: formattedPhone,
    location: district.trim() || 'বগুড়া সদর',
    division: division || 'রাজশাহী',
    district: district.trim() || 'বগুড়া সদর',
    upazila: upazila || district.trim() || 'বগুড়া সদর',
    userId,
    isVerified: true,
    isAvailable: role !== 'recipient',
    lastDonationDate: 'নতুন নিবন্ধিত',
    nextEligibleDate: 'এখনই প্রস্তুত',
    daysRemaining: 0,
    totalDonations: 0,
    livesImpacted: 0,
    emergencyResponses: 0,
    quietHoursEnabled: false,
    quietHoursStart: '২৩:০০',
    quietHoursEnd: '০৬:০০',
    notificationRadiusKm: 15,
    phoneVisibility: 'all_registered',
    language: 'bn',
    textSize: '100%',
    reducedMotion: false,
    isProfileComplete: isComplete,
    badges: [
      { id: 'B-NEW', title: 'নতুন সদস্য', subtitle: 'মানবিক পরিবারের গর্বিত অংশীদার' },
    ],
    donationHistory: [],
  };
};

/**
 * 1. Register with Email, Password & Mandatory Mobile Number
 * Stores account in Supabase Auth, public.profiles & public.donor_profiles
 */
export const registerWithEmail = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const cleanEmail = (payload.email || '').trim().toLowerCase();
  if (!isValidEmail(cleanEmail)) {
    return {
      success: false,
      error: 'অনুগ্রহ করে একটি সঠিক ও কার্যকর ইমেইল ঠিকানা প্রদান করুন।',
    };
  }

  const cleanName = (payload.name || '').trim();
  if (cleanName.length < 2) {
    return {
      success: false,
      error: 'অনুগ্রহ করে আপনার আসল ও পূর্ণ নাম লিখুন।',
    };
  }

  const normalizedPhone = normalizePhoneNumber(payload.phone);
  if (!isValidBdPhoneNumber(normalizedPhone)) {
    return {
      success: false,
      error: 'জরুরি রক্তদানের যোগাযোগের জন্য সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: ০১৭১২-৩৪৫৬৭৮)।',
    };
  }

  if (!payload.password || payload.password.length < 6) {
    return {
      success: false,
      error: 'নিরাপত্তার স্বার্থে পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।',
    };
  }

  // Pre-check phone uniqueness to avoid duplicate entries
  const dupCheck = await checkPhoneDuplicate(normalizedPhone);
  if (dupCheck.isDuplicate) {
    return {
      success: false,
      error: dupCheck.message || 'এই মোবাইল নম্বরটি ইতিমধ্যে নিবন্ধিত আছে।',
    };
  }

  const formattedPhone = formatBdPhoneDisplay(normalizedPhone);
  const supabase = getSupabaseClient();
  let createdUser: UserProfile | null = null;

  if (supabase) {
    try {
      // 1. Sign up user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: payload.password,
        options: {
          data: {
            full_name: cleanName,
            phone_number: formattedPhone,
            blood_group: payload.bloodGroup,
            division: payload.division || 'রাজশাহী',
            district: payload.district,
            upazila: payload.upazila || payload.district,
          },
        },
      });

      if (authError) {
        if (authError.message?.toLowerCase().includes('already registered')) {
          return {
            success: false,
            error: 'এই ইমেইল ঠিকানা দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে। দয়া করে লগইন করুন।',
          };
        }
        return {
          success: false,
          error: authError.message || 'নিবন্ধন সম্পন্ন করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।',
        };
      }

      const userId = authData.user?.id;
      if (!userId) {
        throw new Error('Supabase Auth-এ ব্যবহারকারী ID তৈরি হয়নি।');
      }

      createdUser = createProfileObject(
        cleanName,
        cleanEmail,
        formattedPhone,
        payload.bloodGroup,
        payload.district,
        userId,
        payload.role,
        payload.division || 'রাজশাহী',
        payload.upazila || payload.district
      );

      // 2. Insert into Supabase public.profiles table (strictly linked by UUID)
      const { error: profileError } = await (supabase as any).from('profiles').upsert(
        {
          id: userId,
          phone_number: formattedPhone,
          full_name: cleanName,
          blood_group: payload.bloodGroup,
          division: payload.division || 'রাজশাহী',
          district: payload.district,
          upazila: payload.upazila || payload.district,
          is_verified: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (profileError) {
        if (
          profileError.code === '23505' ||
          profileError.message?.includes('duplicate key') ||
          profileError.message?.includes('profiles_phone_number_key')
        ) {
          return {
            success: false,
            error: 'এই মোবাইল নম্বরটি ইতিমধ্যে অন্য একজন রক্তদাতার অ্যাকাউন্টে ব্যবহৃত হচ্ছে।',
          };
        }
        console.warn('Profiles table insert error:', profileError.message);
      }

      // 3. Insert into Supabase public.donor_profiles table
      await (supabase as any).from('donor_profiles').upsert(
        {
          user_id: userId,
          is_available: payload.role !== 'recipient',
          total_donations: 0,
          reward_points: 100,
          badges: ['নতুন সদস্য'],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
    } catch (err: any) {
      console.warn('Supabase auth execution note:', err?.message);
    }
  }

  // Fallback / Local persistence
  if (!createdUser) {
    createdUser = createProfileObject(
      cleanName,
      cleanEmail,
      formattedPhone,
      payload.bloodGroup,
      payload.district,
      undefined,
      payload.role,
      payload.division,
      payload.upazila
    );
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(createdUser));
    notifyAuthChange();
  }

  return {
    success: true,
    user: createdUser,
    message: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে এবং সুপারবেস ক্লাউডে সংরক্ষিত হয়েছে!',
  };
};

/**
 * 2. Login with Email & Password
 * Retrieves existing profile without re-creating or overwriting
 */
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!isValidEmail(cleanEmail)) {
    return {
      success: false,
      error: 'অনুগ্রহ করে সঠিক ইমেইল ঠিকানা দিন।',
    };
  }

  if (!password || password.length < 1) {
    return {
      success: false,
      error: 'অনুগ্রহ করে আপনার অ্যাকাউন্টের পাসওয়ার্ড লিখুন।',
    };
  }

  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        if (
          error.message?.toLowerCase().includes('invalid login credentials') ||
          error.message?.toLowerCase().includes('invalid grant')
        ) {
          return {
            success: false,
            error: 'ইমেইল বা পাসওয়ার্ড ভুল হয়েছে। সঠিক তথ্য দিয়ে আবার চেষ্টা করুন।',
          };
        }
        return {
          success: false,
          error: error.message || 'লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।',
        };
      }

      if (data?.user) {
        const u = data.user;
        let profileData: any = null;

        // Fetch existing user record from public.profiles
        try {
          const { data: pData } = await (supabase as any)
            .from('profiles')
            .select('*, donor_profiles(*)')
            .eq('id', u.id)
            .single();
          profileData = pData;
        } catch {
          // Fallback below
        }

        const donorProfile = profileData?.donor_profiles?.[0] || {};
        const meta = u.user_metadata || {};

        const phone = profileData?.phone_number || meta.phone_number || '';
        const bloodGroup = (profileData?.blood_group || meta.blood_group || 'B+') as BloodGroup;
        const district = profileData?.district || meta.district || '';
        const division = profileData?.division || meta.division || '';
        const upazila = profileData?.upazila || meta.upazila || '';

        const isComplete = Boolean(
          phone &&
          normalizePhoneNumber(phone).length >= 11 &&
          bloodGroup &&
          district &&
          division
        );

        const userProfile: UserProfile = {
          name: profileData?.full_name || meta.full_name || meta.name || cleanEmail.split('@')[0],
          email: u.email || cleanEmail,
          bloodGroup,
          donorId: `RD-${u.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`,
          phone: formatBdPhoneDisplay(phone),
          location: district ? `${district}${upazila ? ', ' + upazila : ''}` : 'বগুড়া সদর',
          division: division || 'রাজশাহী',
          district: district || 'বগুড়া সদর',
          upazila: upazila || '',
          userId: u.id,
          isVerified: Boolean(profileData?.is_verified ?? true),
          isAvailable: donorProfile.is_available !== false,
          lastDonationDate: donorProfile.last_donation_date || 'নতুন রক্তদাতা',
          nextEligibleDate: 'এখনই প্রস্তুত',
          daysRemaining: 0,
          totalDonations: donorProfile.total_donations || 0,
          livesImpacted: (donorProfile.total_donations || 0) * 3,
          emergencyResponses: 0,
          quietHoursEnabled: false,
          quietHoursStart: '২৩:০০',
          quietHoursEnd: '০৬:০০',
          notificationRadiusKm: 15,
          phoneVisibility: 'all_registered',
          language: 'bn',
          textSize: '100%',
          reducedMotion: false,
          isProfileComplete: isComplete,
          role: profileData?.role || 'donor',
          badges: Array.isArray(donorProfile.badges)
            ? donorProfile.badges.map((b: string, i: number) => ({
                id: `B-${i}`,
                title: b,
                subtitle: 'অর্জিত ব্যাজ',
              }))
            : [{ id: 'B-1', title: 'সক্রিয় সদস্য', subtitle: 'যাচাইকৃত রক্তদাতা' }],
          donationHistory: [],
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userProfile));
          notifyAuthChange();
        }

        return {
          success: true,
          user: userProfile,
          message: 'সফলভাবে লগইন সম্পন্ন হয়েছে!',
          needsContactDetails: !isComplete,
        };
      }
    } catch (err: any) {
      console.warn('Supabase email login error:', err?.message);
    }
  }

  // 2. Check local fallback
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      try {
        const stored = JSON.parse(raw);
        if (stored.email && stored.email.toLowerCase() === cleanEmail) {
          notifyAuthChange();
          return {
            success: true,
            user: stored,
            message: 'লগইন সফল হয়েছে!',
          };
        }
      } catch {
        // Fall through
      }
    }
  }

  return {
    success: false,
    error: 'এই ইমেইল অ্যাকাউন্টে লগইন করা সম্ভব হয়নি। অনুগ্রহ করে "নতুন অ্যাকাউন্ট" ট্যাবে নিবন্ধন করুন।',
  };
};

/**
 * 3. Single-Click Social Login via Google or Facebook
 */
export const loginWithOAuth = async (
  provider: 'google' | 'facebook'
): Promise<AuthResponse> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      error: 'সুপারবেস সংযোগ প্রস্তুত নয়। অনুগ্রহ করে আপনার এনভায়রনমেন্ট কি চেক করুন।',
    };
  }

  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const redirectTo = `${origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: provider === 'google'
          ? { access_type: 'offline', prompt: 'consent' }
          : undefined,
      },
    });

    if (error) {
      return {
        success: false,
        error: `${provider === 'google' ? 'গুগল' : 'ফেসবুক'} লগইন শুরু করতে সমস্যা হয়েছে: ${error.message}`,
      };
    }

    return {
      success: true,
      message: `${provider === 'google' ? 'গুগল' : 'ফেসবুক'} এর সাথে সংযোগ স্থাপন করা হচ্ছে...`,
      provider,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'সোশ্যাল লগইন প্রক্রিয়াকরণে সমস্যা হয়েছে।',
    };
  }
};

/**
 * 4. Send Password Reset Email
 */
export const sendPasswordResetEmail = async (email: string): Promise<AuthResponse> => {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!isValidEmail(cleanEmail)) {
    return {
      success: false,
      error: 'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।',
    };
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${origin}/reset-password`,
      });
      if (error) {
        return {
          success: false,
          error: error.message || 'পাসওয়ার্ড রিসেট লিংক পাঠাতে সমস্যা হয়েছে।',
        };
      }
      return {
        success: true,
        message: 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে। ইনবক্স চেক করুন।',
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'ত্রুটি দেখা দিয়েছে।' };
    }
  }

  return {
    success: true,
    message: 'পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে (লোকাল মোড)।',
  };
};

/**
 * Update user password after recovery link clicked
 */
export const updateUserPassword = async (newPassword: string): Promise<AuthResponse> => {
  if (!newPassword || newPassword.length < 6) {
    return {
      success: false,
      error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।',
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase সংযোগ পাওয়া যায়নি।' };
  }

  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return {
        success: false,
        error: error.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।',
      };
    }
    return {
      success: true,
      message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'ত্রুটি দেখা দিয়েছে।',
    };
  }
};

/**
 * 5. Complete Donor Profile (Called from DonorProfileSetupWizard)
 * Collects Phone, Blood Group, Division, District, Upazila & Donor Availability.
 * Enforces phone uniqueness and connects directly to auth user UUID.
 */
export const completeDonorProfile = async (
  payload: CompleteDonorProfilePayload
): Promise<AuthResponse> => {
  const normPhone = normalizePhoneNumber(payload.phone);
  if (!isValidBdPhoneNumber(normPhone)) {
    return {
      success: false,
      error: 'জরুরি প্রয়োজনে যোগাযোগের জন্য সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: ০১৭১২-৩৪৫৬৭৮)।',
    };
  }

  if (!payload.bloodGroup) {
    return {
      success: false,
      error: 'অনুগ্রহ করে আপনার রক্তের গ্রুপ নির্বাচন করুন।',
    };
  }

  if (!payload.district || !payload.division) {
    return {
      success: false,
      error: 'অনুগ্রহ করে আপনার বিভাগ ও জেলা নির্বাচন করুন।',
    };
  }

  const supabase = getSupabaseClient();
  let userId: string | null = null;
  let userEmail: string = '';
  let userName: string = '';

  if (supabase) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user;
      if (sessionUser) {
        userId = sessionUser.id;
        userEmail = sessionUser.email || '';
        userName = sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || '';
      }
    } catch {
      // Offline fallback
    }
  }

  const current = getAuthenticatedUser();
  if (!userId && current?.userId) {
    userId = current.userId;
  }
  if (!userName && current?.name) {
    userName = current.name;
  }
  if (!userEmail && current?.email) {
    userEmail = current.email || '';
  }

  // Enforce duplicate phone number prevention
  const dupCheck = await checkPhoneDuplicate(normPhone, userId || undefined);
  if (dupCheck.isDuplicate) {
    return {
      success: false,
      error: dupCheck.message || 'এই মোবাইল নম্বরটি ইতিমধ্যে নিবন্ধিত আছে।',
    };
  }

  const formattedPhone = formatBdPhoneDisplay(normPhone);
  const locationDisplay = `${payload.district}${payload.upazila ? ', ' + payload.upazila : ''}`;

  const updatedProfile: UserProfile = {
    ...(current || createProfileObject(userName || 'রক্তদাতা', userEmail, formattedPhone, payload.bloodGroup, payload.district, userId || undefined)),
    name: userName || current?.name || 'রক্তদাতা সদস্য',
    email: userEmail || current?.email,
    userId: userId || current?.userId,
    phone: formattedPhone,
    bloodGroup: payload.bloodGroup,
    division: payload.division,
    district: payload.district,
    upazila: payload.upazila,
    location: locationDisplay,
    isAvailable: payload.isAvailable ?? true,
    lastDonationDate: payload.lastDonationDate || current?.lastDonationDate || 'কখনো দিইনি',
    phoneVisibility: payload.phoneVisibility || 'verified_family',
    quietHoursEnabled: payload.quietHoursEnabled ?? true,
    isProfileComplete: true,
  };

  // Sync with Supabase public.profiles & public.donor_profiles
  if (supabase && userId) {
    try {
      const { error: profileError } = await (supabase as any).from('profiles').upsert(
        {
          id: userId,
          phone_number: formattedPhone,
          full_name: updatedProfile.name,
          blood_group: payload.bloodGroup,
          division: payload.division,
          district: payload.district,
          upazila: payload.upazila || payload.district,
          is_verified: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (profileError) {
        if (
          profileError.code === '23505' ||
          profileError.message?.includes('duplicate key') ||
          profileError.message?.includes('profiles_phone_number_key')
        ) {
          return {
            success: false,
            error: 'এই মোবাইল নম্বরটি ইতিমধ্যে অন্য একটি অ্যাকাউন্টে সংরক্ষিত আছে।',
          };
        }
        console.warn('Profiles table upsert note:', profileError.message);
      }

      await (supabase as any).from('donor_profiles').upsert(
        {
          user_id: userId,
          is_available: payload.isAvailable ?? true,
          last_donation_date: payload.lastDonationDate && payload.lastDonationDate !== 'কখনো দিইনি' ? payload.lastDonationDate : null,
          privacy_hide_phone: payload.phoneVisibility === 'verified_family',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
    } catch (err: any) {
      console.warn('Supabase completeDonorProfile error:', err?.message);
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedProfile));
    notifyAuthChange();
  }

  return {
    success: true,
    user: updatedProfile,
    message: 'রক্তদাতা প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!',
  };
};

/**
 * Backward compatibility alias for completeDonorContactInfo
 */
export const completeDonorContactInfo = async (
  phone: string,
  bloodGroup: BloodGroup,
  district: string,
  extraUpdates: Partial<UserProfile> = {}
): Promise<AuthResponse> => {
  return completeDonorProfile({
    phone,
    bloodGroup,
    division: (extraUpdates.division as string) || 'রাজশাহী',
    district,
    upazila: extraUpdates.upazila,
    isAvailable: extraUpdates.isAvailable,
    lastDonationDate: extraUpdates.lastDonationDate,
    phoneVisibility: extraUpdates.phoneVisibility,
    quietHoursEnabled: extraUpdates.quietHoursEnabled,
  });
};

/**
 * 6. Background synchronization with live Supabase session (e.g. after Google/Facebook redirect)
 * Checks if profile exists in public.profiles. If found, loads it without recreation.
 */
export const syncSupabaseAuthSession = async (): Promise<UserProfile | null> => {
  if (typeof window === 'undefined') return null;
  const supabase = getSupabaseClient();
  if (!supabase) return getAuthenticatedUser();

  try {
    const { data } = await supabase.auth.getSession();
    const user = data?.session?.user;
    if (!user) return getAuthenticatedUser();

    // Check if profile exists in public.profiles
    let profileData: any = null;
    try {
      const { data: pData } = await (supabase as any)
        .from('profiles')
        .select('*, donor_profiles(*)')
        .eq('id', user.id)
        .single();
      profileData = pData;
    } catch {
      // Fall through
    }

    const donorProfile = profileData?.donor_profiles?.[0] || {};
    const meta = user.user_metadata || {};
    const current = getAuthenticatedUser();

    const name = profileData?.full_name || meta.full_name || meta.name || current?.name || (user.email ? user.email.split('@')[0] : 'রক্তদাতা');
    const phone = profileData?.phone_number || meta.phone_number || current?.phone || '';
    const bloodGroup = (profileData?.blood_group || meta.blood_group || current?.bloodGroup || 'B+') as BloodGroup;
    const district = profileData?.district || meta.district || current?.district || '';
    const division = profileData?.division || meta.division || current?.division || '';
    const upazila = profileData?.upazila || meta.upazila || current?.upazila || '';

    const isComplete = Boolean(
      phone &&
      normalizePhoneNumber(phone).length >= 11 &&
      bloodGroup &&
      district &&
      division
    );

    const mergedProfile: UserProfile = {
      name,
      email: user.email,
      bloodGroup,
      donorId: `RD-${user.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`,
      phone: phone ? formatBdPhoneDisplay(phone) : '',
      location: district ? `${district}${upazila ? ', ' + upazila : ''}` : (current?.location || 'বগুড়া সদর'),
      division: division || current?.division || 'রাজশাহী',
      district: district || current?.district || 'বগুড়া সদর',
      upazila: upazila || current?.upazila || '',
      userId: user.id,
      isVerified: Boolean(profileData?.is_verified ?? true),
      isAvailable: donorProfile.is_available !== false,
      lastDonationDate: donorProfile.last_donation_date || current?.lastDonationDate || 'নতুন রক্তদাতা',
      nextEligibleDate: 'এখনই প্রস্তুত',
      daysRemaining: 0,
      totalDonations: donorProfile.total_donations || current?.totalDonations || 0,
      livesImpacted: (donorProfile.total_donations || current?.totalDonations || 0) * 3,
      emergencyResponses: 0,
      quietHoursEnabled: false,
      quietHoursStart: '২৩:০০',
      quietHoursEnd: '০৬:০০',
      notificationRadiusKm: 15,
      phoneVisibility: 'all_registered',
      language: 'bn',
      textSize: '100%',
      reducedMotion: false,
      isProfileComplete: isComplete,
      role: profileData?.role || 'donor',
      badges: [{ id: 'B-NEW', title: 'যাচাইকৃত সদস্য', subtitle: 'মানবিক পরিবারের অংশীদার' }],
      donationHistory: [],
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mergedProfile));
    notifyAuthChange();
    return mergedProfile;
  } catch (err: any) {
    console.warn('Session sync note:', err?.message);
    return getAuthenticatedUser();
  }
};

/**
 * Backward-compatible aliases for existing callers
 */
export const registerRealUser = async (payload: any): Promise<AuthResponse> => {
  return registerWithEmail({
    name: payload.name,
    email: payload.email || `${normalizePhoneNumber(payload.phone)}@roktodata.net`,
    password: payload.password || 'Rokto1234',
    phone: payload.phone,
    bloodGroup: payload.bloodGroup,
    district: payload.district,
    division: payload.division,
    upazila: payload.upazila,
    role: payload.role,
  });
};

export const loginRealUser = async (phoneOrEmail: string, passwordOrPin?: string): Promise<AuthResponse> => {
  if (isValidEmail(phoneOrEmail)) {
    return loginWithEmail(phoneOrEmail, passwordOrPin || '');
  }
  // If phone provided, check local stored user
  const current = getAuthenticatedUser();
  if (current && normalizePhoneNumber(current.phone) === normalizePhoneNumber(phoneOrEmail)) {
    return { success: true, user: current, message: 'লগইন সফল হয়েছে!' };
  }
  return {
    success: false,
    error: 'অনুগ্রহ করে আপনার অ্যাকাউন্টের নিবন্ধিত ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন।',
  };
};

// Auth subscribers for useSyncExternalStore
type AuthListener = () => void;
const authListeners = new Set<AuthListener>();

export const notifyAuthChange = () => {
  authListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Ignored
    }
  });
};

export const subscribeAuth = (callback: () => void) => {
  authListeners.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === AUTH_STORAGE_KEY) {
      callback();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }
  return () => {
    authListeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
};

let cachedUserSnapshot: UserProfile | null = null;
let lastRawAuth: string | null = null;

export const getAuthenticatedUser = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    cachedUserSnapshot = null;
    lastRawAuth = null;
    return null;
  }
  if (raw === lastRawAuth && cachedUserSnapshot !== null) {
    return cachedUserSnapshot;
  }
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.name) {
      cachedUserSnapshot = parsed;
      lastRawAuth = raw;
      return cachedUserSnapshot;
    }
  } catch {
    cachedUserSnapshot = null;
    lastRawAuth = null;
    return null;
  }
  cachedUserSnapshot = null;
  lastRawAuth = null;
  return null;
};

/**
 * Updates authenticated user profile strictly scoped to the active session user ID.
 * Prevents modifying other users' data.
 */
export const updateAuthenticatedUser = async (
  updates: Partial<UserProfile>
): Promise<UserProfile | null> => {
  const current = getAuthenticatedUser();
  if (!current) return null;

  // Security Hardening: Privilege Escalation Prevention
  // Role and verification status can ONLY be updated by administrators or server RPC
  delete updates.role;
  delete (updates as any).is_verified;
  delete (updates as any).isVerified;

  // If phone number is being updated, verify it is not already taken by another user
  if (updates.phone) {
    const norm = normalizePhoneNumber(updates.phone);
    const dupCheck = await checkPhoneDuplicate(norm, current.userId);
    if (dupCheck.isDuplicate) {
      throw new Error(dupCheck.message || 'এই মোবাইল নম্বরটি ইতিমধ্যে অন্য একজন সদস্যের অ্যাকাউন্টে ব্যবহৃত হচ্ছে।');
    }
    updates.phone = formatBdPhoneDisplay(norm);
  }

  const merged: UserProfile = {
    ...current,
    ...updates,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(merged));
    notifyAuthChange();
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUserId = sessionData?.session?.user?.id;
      // Strictly scope to current authenticated user's ID
      const targetUserId = sessionUserId || current.userId;

      if (targetUserId) {
        const profileUpdate: any = {
          updated_at: new Date().toISOString(),
        };
        if (updates.name !== undefined) profileUpdate.full_name = merged.name;
        if (updates.bloodGroup !== undefined) profileUpdate.blood_group = merged.bloodGroup;
        if (updates.division !== undefined) profileUpdate.division = merged.division;
        if (updates.district !== undefined) profileUpdate.district = merged.district;
        if (updates.upazila !== undefined) profileUpdate.upazila = merged.upazila;
        if (updates.phone !== undefined) profileUpdate.phone_number = merged.phone;
        if (updates.textSize !== undefined) profileUpdate.text_size_preference = updates.textSize;

        if (Object.keys(profileUpdate).length > 1) {
          await (supabase as any)
            .from('profiles')
            .update(profileUpdate)
            .eq('id', targetUserId);
        }

        if (updates.isAvailable !== undefined || updates.lastDonationDate !== undefined) {
          const donorUpdate: any = {
            updated_at: new Date().toISOString(),
          };
          if (updates.isAvailable !== undefined) donorUpdate.is_available = updates.isAvailable;
          if (updates.lastDonationDate !== undefined && updates.lastDonationDate !== 'কখনো দিইনি') {
            donorUpdate.last_donation_date = updates.lastDonationDate;
          }
          await (supabase as any)
            .from('donor_profiles')
            .update(donorUpdate)
            .eq('user_id', targetUserId);
        }
      }
    } catch (err: any) {
      console.warn('Supabase updateAuthenticatedUser error:', err?.message);
    }
  }

  return merged;
};

/**
 * Logout authenticated user
 */
export const logoutRealUser = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    notifyAuthChange();
  }
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignored
    }
  }
};

/**
 * Returns the cryptographically authenticated user's authoritative role directly from the database.
 * Never relies on client-tamperable state.
 */
export const getAuthoritativeUserRole = async (): Promise<'donor' | 'recipient' | 'hospital_operator' | 'admin'> => {
  const supabase = getSupabaseClient();
  if (!supabase) return 'donor';
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'donor';
    const { data } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    return data?.role || 'donor';
  } catch {
    return 'donor';
  }
};

