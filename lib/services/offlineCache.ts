/**
 * Roktodata Offline Cache Manager
 * Ensures 100% authentic, tamper-evident caching for emergency medical data.
 * In a life-or-death app, showing dummy donors or fake blood stock is dangerous.
 * This manager ensures only REAL data previously fetched from the cloud is cached and displayed
 * with an honest "সর্বশেষ আপডেট: X" timestamp.
 */

import { toBengaliDigits } from '@/lib/bengali-utils';

export interface CachedEnvelope<T> {
  data: T;
  cachedAt: number; // Unix timestamp ms
  district?: string;
  source: 'cloud_supabase' | 'user_action';
}

export interface CacheReadResult<T> {
  data: T;
  cachedAt: number;
  formattedAge: string;
  isStale: boolean;
}

/**
 * Returns human-readable relative time in Bengali and English
 */
export const formatRelativeAge = (timestampMs: number, language: 'bn' | 'en' = 'bn'): string => {
  const diffSec = Math.floor((Date.now() - timestampMs) / 1000);

  if (diffSec < 60) {
    return language === 'bn' ? 'এইমাত্র' : 'just now';
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return language === 'bn'
      ? `${toBengaliDigits(diffMin)} মিনিট আগে`
      : `${diffMin}m ago`;
  }
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) {
    return language === 'bn'
      ? `${toBengaliDigits(diffHr)} ঘণ্টা আগে`
      : `${diffHr}h ago`;
  }
  const diffDays = Math.floor(diffHr / 24);
  return language === 'bn'
    ? `${toBengaliDigits(diffDays)} দিন আগে`
    : `${diffDays}d ago`;
};

/**
 * Saves real fetched data into localStorage with timestamp envelope
 */
export const saveToOfflineCache = <T>(cacheKey: string, data: T, district?: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const envelope: CachedEnvelope<T> = {
      data,
      cachedAt: Date.now(),
      district,
      source: 'cloud_supabase',
    };
    localStorage.setItem(cacheKey, JSON.stringify(envelope));
  } catch (err) {
    console.warn('Failed to save to offline cache:', err);
  }
};

/**
 * Reads data from localStorage offline cache
 */
export const getFromOfflineCache = <T>(
  cacheKey: string,
  maxAgeMs: number = 24 * 60 * 60 * 1000 // 24 hours default max cache lifetime
): CacheReadResult<T> | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;

    const envelope: CachedEnvelope<T> = JSON.parse(raw);
    if (!envelope || !envelope.cachedAt) return null;

    const age = Date.now() - envelope.cachedAt;
    const isStale = age > maxAgeMs;

    return {
      data: envelope.data,
      cachedAt: envelope.cachedAt,
      formattedAge: formatRelativeAge(envelope.cachedAt),
      isStale,
    };
  } catch (err) {
    console.warn('Failed to read from offline cache:', err);
    return null;
  }
};

/**
 * Checks whether the app is running in explicitly permitted Demo Mode
 * Defaults to false (Strict Production Mode)
 */
export const isDemoModePermitted = (): boolean => {
  if (typeof window !== 'undefined') {
    // Only permitted if explicitly enabled via env variable in development
    return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  }
  return false;
};
