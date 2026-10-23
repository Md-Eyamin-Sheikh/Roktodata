/**
 * Web Push Notification Client Service
 */

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Register service worker if supported
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return reg;
  } catch (err) {
    console.warn('Service worker registration failed:', err);
    return null;
  }
}

/**
 * Check if Web Push is supported and permitted
 */
export function getPushPermissionState(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Request permission and subscribe to browser push notifications
 */
export async function subscribeToWebPush(options?: {
  district?: string;
  bloodGroup?: string;
  userId?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { success: false, error: 'এই ব্রাউজারে ওয়েব পুশ সমর্থিত নয়।' };
  }

  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      return { success: false, error: 'পুশ নোটিফিকেশনের অনুমতি প্রদান করা হয়নি।' };
    }

    const reg = await registerServiceWorker();
    if (!reg) {
      return { success: false, error: 'সার্ভিস ওয়ার্কার সক্রিয় করা যায়নি।' };
    }

    await navigator.serviceWorker.ready;

    const vapidKey =
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
      'BGgnEH4Oo-V58QV5KjR2WIEechD8nFuunCkPjlIYYo4otbu0Xj143Nayjf4R1lqZIv2qfVBed8SJnXm8yzFlZAQ';

    let subscription = await reg.pushManager.getSubscription();

    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as any,
      });
    }

    // Send subscription to backend API to save in push_subscriptions table
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        district: options?.district || 'ঢাকা',
        bloodGroup: options?.bloodGroup || null,
        userId: options?.userId || null,
      }),
    });

    const json = await res.json();
    return { success: json.success, error: json.error };
  } catch (err: any) {
    console.error('Failed to subscribe to web push:', err);
    return { success: false, error: err?.message || 'পুশ সাবস্ক্রিপশনে ত্রুটি হয়েছে।' };
  }
}

/**
 * Unsubscribe from browser push notifications
 */
export async function unsubscribeFromWebPush(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      });
    }
    return true;
  } catch (err) {
    console.warn('Unsubscribe error:', err);
    return false;
  }
}
