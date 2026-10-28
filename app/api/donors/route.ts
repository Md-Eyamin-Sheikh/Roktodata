import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { initialDonors } from '@/lib/data';
import { maskPhoneNumber } from '@/lib/bengali-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bloodGroup = searchParams.get('bloodGroup');
    const search = searchParams.get('q');
    const availableOnly = searchParams.get('available') === 'true';
    const district = searchParams.get('district');

    const supabase = getSupabaseServerClient();
    if (supabase) {
      let query = supabase.from('profiles').select('*, donor_profiles(*)');

      if (district && district !== 'all') {
        const clean = district.replace(/সদর/g, '').trim();
        query = query.ilike('district', `%${clean}%`);
      }

      if (bloodGroup && bloodGroup !== 'all') {
        query = query.eq('blood_group', bloodGroup);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        let donors = data.map((p: any) => {
          const dp = p.donor_profiles?.[0] || {};
          return {
            id: p.id,
            name: p.full_name,
            avatarText: p.full_name.charAt(0),
            bloodGroup: p.blood_group,
            location: `${p.district}${p.upazila ? ', ' + p.upazila : ''}`,
            distanceKm: 2.5,
            isAvailableToday: dp.is_available !== false,
            isVerified: p.is_verified ?? true,
            totalDonations: dp.total_donations || 1,
            lastDonationDate: dp.last_donation_date || '৩ মাস আগে',
            responseTimeMinutes: dp.is_fast_responder ? 'সাধারণত ১০ মিনিটের মধ্যে' : '১৫-২০ মিনিট',
            // Server-side Phone Masking (Zero-Trust Privacy)
            phone: maskPhoneNumber(p.phone_number),
            phoneMasked: maskPhoneNumber(p.phone_number),
            isPhoneRevealed: false,
            isBookmarked: false,
          };
        });

        if (search) {
          const q = search.toLowerCase();
          donors = donors.filter(
            (d) =>
              d.name.toLowerCase().includes(q) ||
              d.location.toLowerCase().includes(q) ||
              d.bloodGroup.toLowerCase().includes(q)
          );
        }

        if (availableOnly) {
          donors = donors.filter((d) => d.isAvailableToday);
        }

        return NextResponse.json({
          success: true,
          source: 'supabase_live',
          data: donors,
        });
      }
    }

    // Fallback to enriched local donors with server-side phone masking
    let donors = initialDonors.map((d) => ({
      ...d,
      phone: maskPhoneNumber(d.phone),
      phoneMasked: maskPhoneNumber(d.phone),
      isPhoneRevealed: false,
    }));
    if (bloodGroup && bloodGroup !== 'all') {
      donors = donors.filter((d) => d.bloodGroup === bloodGroup);
    }
    if (search) {
      const q = search.toLowerCase();
      donors = donors.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q) ||
          d.bloodGroup.toLowerCase().includes(q)
      );
    }
    if (availableOnly) {
      donors = donors.filter((d) => d.isAvailableToday);
    }

    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: donors,
    });
  } catch (error: any) {
    console.error('API /api/donors error:', error);
    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: initialDonors,
    });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, isAvailable } = body;
    const supabase = getSupabaseServerClient();

    if (supabase && userId) {
      await (supabase as any)
        .from('donor_profiles')
        .update({ is_available: isAvailable })
        .eq('user_id', userId);
    }

    return NextResponse.json({
      success: true,
      data: { isAvailable },
      message: `রক্তদান স্ট্যাটাস ${isAvailable ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে`,
    });
  } catch (error: any) {
    console.error('API PATCH /api/donors error:', error);
    return NextResponse.json(
      { success: false, error: 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে' },
      { status: 500 }
    );
  }
}
