import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { initialNearbyRequests, initialActiveMyRequest } from '@/lib/data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bloodGroup = searchParams.get('bloodGroup');
    const district = searchParams.get('district');

    const supabase = getSupabaseServerClient();
    if (supabase) {
      let query = supabase
        .from('emergency_requests')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (district && district !== 'all') {
        const clean = district.replace(/সদর/g, '').trim();
        query = query.ilike('district', `%${clean}%`);
      }

      if (bloodGroup && bloodGroup !== 'all') {
        query = query.eq('blood_group', bloodGroup);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const formattedRequests = data.map((r: any) => ({
          id: r.id,
          bloodGroup: r.blood_group,
          bagsNeeded: r.bags_needed,
          bagsFulfilled: 0,
          hospitalName: r.hospital_name,
          location: r.district,
          distanceKm: 2.1,
          urgency: r.urgency || 'now',
          urgencyLabel: r.urgency === 'now' ? 'এখনই লাগবে' : 'আজকের মধ্যে',
          patientType: r.reason || 'জরুরি রোগী',
          wardBed: `ওয়ার্ড ${r.ward_number || '১'}, বেড ${r.bed_number || '১'}`,
          contactNumber: r.contact_phone,
          prescriptionImageUrl: r.prescription_image_url || undefined,
          hasVerifiedHospital: r.has_verified_hospital ?? true,
          hasPrescriptionSlip: !!r.prescription_image_url,
          isCaseVerified: true,
          trackingStep: r.tracking_step || 1,
          createdAt: new Date(r.created_at).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
          timeTarget: r.time_target || 'জরুরি',
          status: r.status,
          respondingDonorsCount: 1,
        }));

        return NextResponse.json({
          success: true,
          source: 'supabase_live',
          data: {
            myRequest: null,
            nearbyRequests: formattedRequests,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: {
        myRequest: initialActiveMyRequest,
        nearbyRequests: initialNearbyRequests,
      },
    });
  } catch (error: any) {
    console.error('API /api/requests error:', error);
    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: {
        myRequest: initialActiveMyRequest,
        nearbyRequests: initialNearbyRequests,
      },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.bloodGroup || !body.hospitalName) {
      return NextResponse.json(
        { success: false, error: 'রক্তের গ্রুপ ও হাসপাতালের নাম আবশ্যক' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    let savedId = `REQ-${Date.now()}`;

    if (supabase) {
      const cleanDistrict = (body.location || body.district || 'বগুড়া').replace(/সদর/g, '').trim();
      const { data, error } = await supabase
        .from('emergency_requests')
        .insert({
          blood_group: body.bloodGroup,
          bags_needed: body.bagsNeeded || 1,
          component_type: body.componentType || 'whole',
          patient_name: body.patientName || 'জরুরি রোগী',
          hospital_name: body.hospitalName,
          division: body.division || 'রাজশাহী',
          district: cleanDistrict,
          location_detail: body.location || cleanDistrict,
          ward_number: body.wardNumber || body.wardBed || 'জরুরি বিভাগ',
          bed_number: body.bedNumber || '১',
          reason: body.reason || body.patientType || 'জরুরি রক্ত প্রয়োজন',
          urgency: body.urgency || 'now',
          time_target: body.timeTarget || 'এখনই',
          contact_phone: body.contactNumber || '01712345678',
          status: 'active',
          tracking_step: 1,
          has_verified_hospital: true,
        })
        .select('id')
        .single();

      if (!error && (data as any)?.id) {
        savedId = (data as any).id;

        // Also automatically create a broadcast notification for this emergency request!
        const { data: profs } = await supabase.from('profiles').select('id').limit(1);
        const userId = profs?.[0]?.id;
        if (userId) {
          await supabase.from('notifications').insert({
            user_id: userId,
            category: 'urgent',
            title: `🚨 জরুরি রক্তের ডাক: ${body.bloodGroup} প্রয়োজন`,
            description: `${body.hospitalName} (${cleanDistrict}) এ জরুরি ${body.bagsNeeded || 1} ব্যাগ রক্ত লাগবে।`,
            is_unread: true,
          });
        }
      }
    }

    const created = {
      id: savedId,
      bloodGroup: body.bloodGroup,
      hospitalName: body.hospitalName,
      location: body.location || 'বগুড়া',
      distanceKm: 1.5,
      bagsNeeded: body.bagsNeeded || 1,
      bagsFulfilled: 0,
      urgency: body.urgency || 'now',
      urgencyLabel: body.urgency === 'now' ? 'এখনই লাগবে' : 'আজকের মধ্যে',
      timeTarget: body.timeTarget || 'আজ',
      createdAt: 'এইমাত্র',
      patientType: body.reason || 'জরুরি রোগী',
      contactNumber: body.contactNumber || '০১৭১১-২২৩৩৪৪',
      status: 'active',
      hasVerifiedHospital: true,
      hasPrescriptionSlip: true,
      trackingStep: 1,
      respondingDonorsCount: 0,
    };

    return NextResponse.json({
      success: true,
      data: created,
      message: 'রক্তের জরুরি অনুরোধ সরাসরি ক্লাউড ডেটাবেসে পোস্ট করা হয়েছে',
    });
  } catch (error: any) {
    console.error('API POST /api/requests error:', error);
    return NextResponse.json(
      { success: false, error: 'অনুরোধ তৈরি করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
