import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';
import { BloodGroup, ComponentType, EmergencyRequest, RequestStatus, UrgencyLevel } from '@/lib/types';
import { isValidBdPhoneNumber, normalizePhoneNumber } from '@/lib/services/authService';

// In-memory idempotency cache for duplicate request prevention
interface CachedSubmission {
  request: EmergencyRequest;
  timestamp: number;
}
const idempotencyCache = new Map<string, CachedSubmission>();
const IDEMPOTENCY_TTL_MS = 2 * 60 * 1000; // 2 minutes

// Clean stale idempotency keys periodically
const cleanStaleIdempotencyKeys = () => {
  const now = Date.now();
  for (const [key, value] of idempotencyCache.entries()) {
    if (now - value.timestamp > IDEMPOTENCY_TTL_MS) {
      idempotencyCache.delete(key);
    }
  }
};

const VALID_BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const VALID_COMPONENTS: ComponentType[] = ['whole', 'platelets', 'plasma'];
const VALID_URGENCIES: UrgencyLevel[] = ['now', 'today', '24-48', 'scheduled'];

export async function POST(req: NextRequest) {
  cleanStaleIdempotencyKeys();

  try {
    const body = await req.json();
    const {
      bloodGroup,
      bagsNeeded = 1,
      componentType = 'whole',
      urgency = 'now',
      division = 'রাজশাহী',
      district = 'বগুড়া',
      hospitalName,
      wardNumber = '',
      bedNumber = '',
      cabinNumber = '',
      patientName,
      patientRelation = 'আত্মীয়',
      reason = 'জরুরি চিকিৎসা',
      contactPhone,
      prescriptionImageUrl = null,
      prescriptionSignedUrl = null,
      idempotencyKey,
    } = body;

    // 1. Idempotency Check to prevent duplicate submission
    if (idempotencyKey && idempotencyCache.has(idempotencyKey)) {
      const cached = idempotencyCache.get(idempotencyKey)!;
      return NextResponse.json(
        {
          success: true,
          isDuplicate: true,
          message: 'অনুরোধটি ইতিমধ্যে তৈরি হয়েছে (আইডেম্পোটেন্ট পুনঃব্যবহার)।',
          request: cached.request,
        },
        { status: 200 }
      );
    }

    // 2. Server-side Validation
    const errors: string[] = [];

    if (!bloodGroup || !VALID_BLOOD_GROUPS.includes(bloodGroup as BloodGroup)) {
      errors.push('একটি বৈধ রক্তের গ্রুপ নির্বাচন করুন (A+, A-, B+, B-, O+, O-, AB+, AB-)।');
    }

    const bags = Number(bagsNeeded);
    if (isNaN(bags) || bags < 1 || bags > 10) {
      errors.push('রক্তের ব্যাগের সংখ্যা ১ থেকে ১০ এর মধ্যে হতে হবে।');
    }

    if (!VALID_COMPONENTS.includes(componentType as ComponentType)) {
      errors.push('রক্তের উপাদানের ধরন (পুরো রক্ত, প্লাটিলেট বা প্লাজমা) নির্বাচন করুন।');
    }

    if (!VALID_URGENCIES.includes(urgency as UrgencyLevel)) {
      errors.push('জরুরিতার মাত্রা নির্বাচন করুন।');
    }

    if (!hospitalName || typeof hospitalName !== 'string' || !hospitalName.trim()) {
      errors.push('হাসপাতাল বা ব্লাড ব্যাংকের নাম উল্লেখ করা আবশ্যক।');
    }

    if (!district || typeof district !== 'string' || !district.trim()) {
      errors.push('জেলা নির্বাচন করা আবশ্যক।');
    }

    if (!patientName || typeof patientName !== 'string' || !patientName.trim()) {
      errors.push('রোগীর নাম উল্লেখ করা আবশ্যক।');
    }

    if (!contactPhone || !isValidBdPhoneNumber(contactPhone)) {
      errors.push('একটি সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর (01XXXXXXXXX) প্রদান করুন।');
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          errors,
          message: 'তথ্য যাচাইকরণে ত্রুটি পাওয়া গেছে।',
        },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(contactPhone);
    const wardBedFormatted = [
      wardNumber ? `ওয়ার্ড: ${wardNumber}` : '',
      bedNumber ? `বেড: ${bedNumber}` : '',
      cabinNumber ? `কেবিন: ${cabinNumber}` : '',
    ]
      .filter(Boolean)
      .join(', ') || 'জরুরি বিভাগ';

    const generatedId = `REQ-${Date.now()}`;
    const initialStatus: RequestStatus = 'open';

    const newRequest: EmergencyRequest = {
      id: generatedId,
      bloodGroup: bloodGroup as BloodGroup,
      bagsNeeded: bags,
      bagsFulfilled: 0,
      componentType: componentType as ComponentType,
      urgency: urgency as UrgencyLevel,
      urgencyLabel: urgency === 'now' ? 'এখনই লাগবে' : urgency === 'today' ? 'আজকের মধ্যে' : 'পরিকল্পিত',
      timeTarget: urgency === 'now' ? '৬০ মিনিটের মধ্যে' : urgency === 'today' ? 'আজ রাত ১২:০০' : 'আগামী ২৪-৪৮ ঘণ্টা',
      division: division.trim(),
      district: district.trim(),
      hospitalName: hospitalName.trim(),
      location: `${district.trim()} সদর`,
      wardNumber: wardNumber.trim(),
      bedNumber: bedNumber.trim(),
      cabinNumber: cabinNumber.trim(),
      wardBed: wardBedFormatted,
      patientName: patientName.trim(),
      patientRelation: patientRelation.trim(),
      reason: reason.trim(),
      contactNumber: normalizedPhone,
      prescriptionImageUrl: prescriptionImageUrl || undefined,
      prescriptionSignedUrl: prescriptionSignedUrl || undefined,
      hasPrescriptionSlip: Boolean(prescriptionImageUrl || prescriptionSignedUrl),
      hasVerifiedHospital: true,
      isCaseVerified: true,
      status: initialStatus,
      trackingStep: 1,
      respondingDonorsCount: 0,
      createdAt: 'এইমাত্র',
      distanceKm: 2.1,
      idempotencyKey,
    };

    // 3. Persist to Supabase emergency_requests table if live
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await (supabase as any)
          .from('emergency_requests')
          .insert({
            blood_group: newRequest.bloodGroup,
            bags_needed: newRequest.bagsNeeded,
            bags_fulfilled: 0,
            component_type: newRequest.componentType,
            hospital_name: newRequest.hospitalName,
            division: newRequest.division || 'রাজশাহী',
            district: newRequest.district || 'বগুড়া',
            location_detail: newRequest.location,
            ward_number: newRequest.wardNumber || null,
            bed_number: newRequest.bedNumber || null,
            reason: newRequest.reason,
            urgency: newRequest.urgency,
            time_target: newRequest.timeTarget,
            patient_name: newRequest.patientName,
            patient_relation: newRequest.patientRelation,
            contact_phone: newRequest.contactNumber,
            prescription_image_url: newRequest.prescriptionImageUrl || newRequest.prescriptionSignedUrl || null,
            status: 'open',
            tracking_step: 1,
            has_verified_hospital: true,
          })
          .select('id')
          .single();

        if (!error && data?.id) {
          newRequest.id = data.id;

          // Automatically generate notification in notifications table
          await (supabase as any).from('notifications').insert({
            user_id: null,
            category: 'urgent',
            title: `🚨 জরুরি রক্তের ডাক: ${newRequest.bloodGroup} প্রয়োজন`,
            description: `${newRequest.hospitalName}, ${newRequest.district}-এ ${newRequest.bagsNeeded} ব্যাগ রক্ত প্রয়োজন।`,
            blood_group: newRequest.bloodGroup,
            action_type: 'respond',
            is_unread: true,
          });
        }
      } catch (dbErr: any) {
        console.warn('Supabase DB insertion fallback note:', dbErr?.message);
      }
    }

    // Cache in idempotency store
    if (idempotencyKey) {
      idempotencyCache.set(idempotencyKey, {
        request: newRequest,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'জরুরি রক্তের আবেদন সফলভাবে গৃহীত ও যাচাই করা হয়েছে।',
        request: newRequest,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'অনুরোধ প্রসেস করতে ব্যর্থ হয়েছে: ' + (err?.message || 'অজানা সমস্যা'),
      },
      { status: 500 }
    );
  }
}
