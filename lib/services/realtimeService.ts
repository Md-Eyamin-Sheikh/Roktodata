import { getSupabaseClient } from '@/lib/supabase/client';
import { EmergencyRequest, RespondingDonor, AppNotification, RequestStatus, BloodGroup } from '@/lib/types';

export type RealtimeEventType =
  | 'request:created'
  | 'request:updated'
  | 'donor:responded'
  | 'notification:new';

interface LiveEventCallbacks {
  onNewRequest?: (req: EmergencyRequest) => void;
  onRequestUpdated?: (update: {
    requestId: string;
    status: RequestStatus;
    trackingStep?: number;
    bagsFulfilled?: number;
    hospitalName?: string;
  }) => void;
  onDonorResponse?: (response: {
    requestId: string;
    donor: RespondingDonor;
  }) => void;
  onNotification?: (notif: AppNotification) => void;
}

// In-memory set for deduplicating events arriving via both Broadcast and Postgres Changes
const recentEventKeys = new Set<string>();
const markEventSeen = (key: string): boolean => {
  if (recentEventKeys.has(key)) return false;
  recentEventKeys.add(key);
  setTimeout(() => recentEventKeys.delete(key), 10000); // 10 second deduplication window
  return true;
};

/**
 * Broadcast an event to all connected clients in real time via Supabase Realtime Broadcast
 */
export const broadcastRealtimeEvent = async (
  event: RealtimeEventType,
  payload: any
): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const channel = (supabase as any).channel('roktodata-live-events');
    await channel.send({
      type: 'broadcast',
      event,
      payload,
    });
    return true;
  } catch (err) {
    console.warn('Realtime broadcast note:', err);
    return false;
  }
};

/**
 * Hybrid Realtime Subscription: Supabase Broadcast (Primary, Instant) + Postgres Changes (Secondary, Reliable)
 */
export const subscribeToLiveEvents = (
  district: string,
  callbacks: LiveEventCallbacks
) => {
  const supabase = getSupabaseClient();
  if (!supabase) return () => {};

  const cleanDistrict = district.replace(/সদর/g, '').trim();

  const channel = (supabase as any)
    .channel('roktodata-live-events', {
      config: {
        broadcast: { ack: false, self: false },
      },
    })
    // 1. BROADCAST LISTENERS (Instant Client-to-Client)
    .on('broadcast', { event: 'request:created' }, (data: any) => {
      const req = data.payload?.request;
      if (req && markEventSeen(`req:created:${req.id}`)) {
        callbacks.onNewRequest?.(req);
      }
    })
    .on('broadcast', { event: 'request:updated' }, (data: any) => {
      const update = data.payload;
      if (update && markEventSeen(`req:updated:${update.requestId}:${update.status}:${update.trackingStep}`)) {
        callbacks.onRequestUpdated?.(update);
      }
    })
    .on('broadcast', { event: 'donor:responded' }, (data: any) => {
      const resp = data.payload;
      if (resp && markEventSeen(`donor:resp:${resp.requestId}:${resp.donor?.id || resp.donor?.name}`)) {
        callbacks.onDonorResponse?.(resp);
      }
    })
    .on('broadcast', { event: 'notification:new' }, (data: any) => {
      const notif = data.payload?.notification;
      if (notif && markEventSeen(`notif:${notif.id || notif.title}`)) {
        callbacks.onNotification?.(notif);
      }
    })

    // 2. POSTGRES CHANGES LISTENERS (Direct Database Changes Fallback)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'emergency_requests',
      },
      (payload: any) => {
        const row = payload.new;
        if (!row || !markEventSeen(`pg:insert:req:${row.id}`)) return;

        const formatted: EmergencyRequest = {
          id: row.id,
          bloodGroup: row.blood_group as BloodGroup,
          bagsNeeded: row.bags_needed || 1,
          bagsFulfilled: row.bags_fulfilled || 0,
          hospitalName: row.hospital_name,
          location: row.district,
          distanceKm: 2.1,
          urgency: row.urgency || 'now',
          urgencyLabel: row.urgency === 'now' ? 'এখনই লাগবে' : 'আজকের মধ্যে',
          patientType: row.reason || 'জরুরি রোগী',
          wardBed: `ওয়ার্ড ${row.ward_number || '১'}, বেড ${row.bed_number || '১'}`,
          contactNumber: row.contact_phone,
          prescriptionImageUrl: row.prescription_image_url || undefined,
          hasVerifiedHospital: row.has_verified_hospital ?? true,
          hasPrescriptionSlip: !!row.prescription_image_url,
          isCaseVerified: true,
          trackingStep: row.tracking_step || 1,
          createdAt: 'এইমাত্র',
          timeTarget: row.time_target || 'জরুরি',
          status: row.status || 'active',
          respondingDonorsCount: 0,
        };

        callbacks.onNewRequest?.(formatted);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'emergency_requests',
      },
      (payload: any) => {
        const row = payload.new;
        if (!row || !markEventSeen(`pg:update:req:${row.id}:${row.status}:${row.tracking_step}`)) return;

        callbacks.onRequestUpdated?.({
          requestId: row.id,
          status: row.status,
          trackingStep: row.tracking_step,
          bagsFulfilled: row.bags_fulfilled,
          hospitalName: row.hospital_name,
        });
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'donor_responses',
      },
      (payload: any) => {
        const row = payload.new;
        if (!row || !markEventSeen(`pg:insert:resp:${row.id}`)) return;

        const donorObj: RespondingDonor = {
          id: row.id,
          name: row.message ? row.message.split(' ')[0] : 'রক্তদাতা',
          bloodGroup: 'B+',
          phone: '',
          distanceKm: Number(row.distance_km) || 2.5,
          etaMinutes: row.eta_minutes || 30,
          isVerified: true,
          lastDonationMonths: 3,
          status: (row.status as any) || 'on_the_way',
        };

        callbacks.onDonorResponse?.({
          requestId: row.request_id,
          donor: donorObj,
        });
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      },
      (payload: any) => {
        const row = payload.new;
        if (!row || !markEventSeen(`pg:insert:notif:${row.id}`)) return;

        let category: AppNotification['category'] = 'urgent';
        if (row.category === 'my-req') category = 'my-req';
        else if (row.category === 'camp' || row.category === 'camps') category = 'camps';
        else if (row.category === 'badge') category = 'health';

        let bg: BloodGroup | undefined = undefined;
        const match = row.title?.match(/(A\+|A-|B\+|B-|O\+|O-|AB\+|AB-)/);
        if (match) bg = match[1] as BloodGroup;

        callbacks.onNotification?.({
          id: row.id,
          category,
          title: row.title,
          description: row.description,
          timestamp: 'এইমাত্র',
          bloodGroup: bg,
          isUnread: row.is_unread ?? true,
          actionType: category === 'urgent' ? 'respond' : category === 'my-req' ? 'call' : 'calendar',
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
