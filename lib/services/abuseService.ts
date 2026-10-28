import { getSupabaseServerClient } from '@/lib/supabase/server';
import { normalizePhoneNumber } from './authService';

interface RateLimitRecord {
  count: number;
  resetAt: number;
  blockedUntil?: number;
}

// In-memory sliding rate limiter (fast & resilient fallback when DB is in free-tier sleep)
const memoryRateLimits = new Map<string, RateLimitRecord>();

// Cache for recent requests to detect spam duplicates
interface RecentRequestRecord {
  id: string;
  phone: string;
  patientName: string;
  hospitalName: string;
  bloodGroup: string;
  timestamp: number;
}
const recentRequests: RecentRequestRecord[] = [];
const DUPLICATE_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours

// Known banned phones in-memory fallback
const bannedPhonesSet = new Set<string>();

export interface AbuseCheckResult {
  isAllowed: boolean;
  reason?: string;
  code?: 'RATE_LIMIT_EXCEEDED' | 'DUPLICATE_REQUEST' | 'PHONE_BANNED' | 'NEW_ACCOUNT_LIMIT';
  retryAfterSeconds?: number;
}

/**
 * Checks if a given identifier (IP or phone) has exceeded allowed thresholds
 */
export async function checkRateLimit(
  identifier: string,
  action: string = 'request_create',
  maxRequests: number = 3,
  windowMs: number = 10 * 60 * 1000 // 10 minutes
): Promise<AbuseCheckResult> {
  const key = `${action}:${identifier}`;
  const now = Date.now();
  const record = memoryRateLimits.get(key);

  if (record) {
    if (record.blockedUntil && now < record.blockedUntil) {
      const waitSec = Math.ceil((record.blockedUntil - now) / 1000);
      return {
        isAllowed: false,
        reason: `অতিরিক্ত চেষ্টার কারণে আপনার সংযোগটি সাময়িকভাবে স্থগিত রয়েছে। আরও ${waitSec} সেকেন্ড পর চেষ্টা করুন।`,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfterSeconds: waitSec,
      };
    }

    if (now < record.resetAt) {
      if (record.count >= maxRequests) {
        // Block for 15 minutes on violation
        record.blockedUntil = now + 15 * 60 * 1000;
        return {
          isAllowed: false,
          reason: `আপনি অল্প সময়ের মধ্যে একাধিকবার আবেদন পাঠিয়েছেন। ডোনারদের অযথা বিভ্রান্তি এড়াতে ১০ মিনিট অপেক্ষা করুন।`,
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfterSeconds: 900,
        };
      }
      record.count += 1;
    } else {
      memoryRateLimits.set(key, { count: 1, resetAt: now + windowMs });
    }
  } else {
    memoryRateLimits.set(key, { count: 1, resetAt: now + windowMs });
  }

  // Cleanup old memory records if map exceeds 5000 items
  if (memoryRateLimits.size > 5000) {
    for (const [k, v] of memoryRateLimits.entries()) {
      if (now > v.resetAt && (!v.blockedUntil || now > v.blockedUntil)) {
        memoryRateLimits.delete(k);
      }
    }
  }

  return { isAllowed: true };
}

/**
 * Checks if an identical or near-identical request was posted within recent hours
 */
export async function detectDuplicateRequest(params: {
  phone: string;
  patientName: string;
  hospitalName: string;
  bloodGroup: string;
}): Promise<AbuseCheckResult> {
  const normalized = normalizePhoneNumber(params.phone);
  const now = Date.now();

  // Prune expired records
  while (recentRequests.length > 0 && now - recentRequests[0].timestamp > DUPLICATE_WINDOW_MS) {
    recentRequests.shift();
  }

  // Check in-memory list
  const cleanPatient = params.patientName.trim().toLowerCase();
  const cleanHospital = params.hospitalName.trim().toLowerCase();

  const foundDuplicate = recentRequests.find((req) => {
    const isSamePhone = req.phone === normalized;
    const isSamePatientHospital =
      req.bloodGroup === params.bloodGroup &&
      (req.patientName.toLowerCase() === cleanPatient ||
        req.hospitalName.toLowerCase().includes(cleanHospital) ||
        cleanHospital.includes(req.hospitalName.toLowerCase()));

    return isSamePhone || isSamePatientHospital;
  });

  if (foundDuplicate) {
    const diffMinutes = Math.round((now - foundDuplicate.timestamp) / (60 * 1000));
    return {
      isAllowed: false,
      reason: `এই মোবাইল নম্বর বা রোগীর নামে ${diffMinutes} মিনিট আগে ইতিমধ্যে একটি রক্তের আবেদন জমা হয়েছে (অনুরোধ আইডি: ${foundDuplicate.id})। ডুপ্লিকেট আবেদন ডোনারদের বিভ্রান্ত করে।`,
      code: 'DUPLICATE_REQUEST',
    };
  }

  // Also query live Supabase emergency_requests table if available
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const twoHoursAgo = new Date(now - DUPLICATE_WINDOW_MS).toISOString();
      const { data } = await (supabase as any)
        .from('emergency_requests')
        .select('id, contact_phone, patient_name, hospital_name, created_at')
        .eq('contact_phone', normalized)
        .eq('status', 'open')
        .gte('created_at', twoHoursAgo)
        .limit(1);

      if (data && data.length > 0) {
        return {
          isAllowed: false,
          reason: `এই নম্বরে ইতিমধ্যে একটি সক্রিয় রক্তের আবেদন চলমান রয়েছে (আইডি: ${data[0].id})। অনুগ্রহ করে পূর্বের অনুরোধটি সম্পূর্ণ বা আপডেট করুন।`,
          code: 'DUPLICATE_REQUEST',
        };
      }
    } catch {
      // Fallback silently to memory check
    }
  }

  return { isAllowed: true };
}

/**
 * Records a created request into recent cache
 */
export function recordNewRequest(req: {
  id: string;
  phone: string;
  patientName: string;
  hospitalName: string;
  bloodGroup: string;
}) {
  recentRequests.push({
    ...req,
    phone: normalizePhoneNumber(req.phone),
    timestamp: Date.now(),
  });
}

/**
 * Checks if a phone number is flagged or banned
 */
export async function isPhoneBanned(phone: string): Promise<boolean> {
  const normalized = normalizePhoneNumber(phone);
  if (bannedPhonesSet.has(normalized)) return true;

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data } = await (supabase as any)
        .from('banned_users')
        .select('id')
        .eq('phone', normalized)
        .limit(1);

      if (data && data.length > 0) {
        bannedPhonesSet.add(normalized);
        return true;
      }
    } catch {
      // Continue
    }
  }

  return false;
}

/**
 * Ban or unban a phone number (used by admin/moderators)
 */
export async function setPhoneBanStatus(
  phone: string,
  isBanned: boolean,
  reason: string = 'Abuse / Fraudulent Request'
) {
  const normalized = normalizePhoneNumber(phone);
  if (isBanned) {
    bannedPhonesSet.add(normalized);
  } else {
    bannedPhonesSet.delete(normalized);
  }

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      if (isBanned) {
        await (supabase as any).from('banned_users').insert({
          phone: normalized,
          reason,
        });
      } else {
        await (supabase as any).from('banned_users').delete().eq('phone', normalized);
      }
    } catch {
      // Ignore
    }
  }
}
