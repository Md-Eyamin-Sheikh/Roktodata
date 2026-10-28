import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient, getAuthenticatedUserFromRequest } from '@/lib/supabase/server';
import { initialUserProfile } from '@/lib/data';

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient(req);
    if (supabase) {
      const { user: authUser } = await getAuthenticatedUserFromRequest(req);

      // If user is authenticated, retrieve strictly their profile
      if (authUser?.id) {
        const { data: profile, error: pErr } = await supabase
          .from('profiles')
          .select('*, donor_profiles(*)')
          .eq('id', authUser.id)
          .maybeSingle();

        if (!pErr && profile) {
          const p: any = profile;
          const dp = p.donor_profiles?.[0] || {};

          // Fetch user's donation history
          let donationHistory: any[] = [];
          if (dp.id) {
            const { data: hist } = await supabase
              .from('donation_history')
              .select('*')
              .eq('donor_id', dp.id)
              .order('donation_date', { ascending: false });

            if (hist) {
              donationHistory = hist.map((h: any) => ({
                id: h.id,
                date: h.donation_date,
                location: h.hospital_name,
                units: 1,
                recipientType: 'জরুরি রোগী',
                badgeEarned: h.badge_earned || 'নিয়মিত ডোনার',
                verifiedByHospital: h.verified_by_hospital,
              }));
            }
          }

          const userProfile = {
            name: p.full_name,
            email: authUser.email,
            bloodGroup: p.blood_group,
            donorId: `RD-${p.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`,
            phone: p.phone_number,
            division: p.division,
            district: p.district,
            upazila: p.upazila,
            location: `${p.district}${p.upazila ? ', ' + p.upazila : ''}`,
            userId: p.id,
            isVerified: p.is_verified ?? true,
            isAvailable: dp.is_available ?? true,
            lastDonationDate: dp.last_donation_date || 'নতুন নিবন্ধিত',
            nextEligibleDate: 'এখনই প্রস্তুত',
            daysRemaining: 0,
            totalDonations: dp.total_donations || donationHistory.length || 0,
            livesImpacted: (dp.total_donations || donationHistory.length || 0) * 3,
            emergencyResponses: 0,
            quietHoursEnabled: false,
            quietHoursStart: '২৩:০০',
            quietHoursEnd: '০৬:০০',
            notificationRadiusKm: 15,
            phoneVisibility: 'all_registered' as const,
            language: 'bn' as const,
            role: p.role || 'donor',
            textSize: p.text_size_preference || '100%',
            reducedMotion: false,
            isProfileComplete: Boolean(
              p.phone_number &&
              p.phone_number.length >= 11 &&
              p.blood_group &&
              p.district &&
              p.division
            ),
            badges: [
              { id: 'b1', name: 'নতুন সদস্য', description: 'মানবিক পরিবারের গর্বিত সদস্য', icon: 'Heart', isEarned: true },
            ],
            donationHistory,
          };

          return NextResponse.json({
            success: true,
            source: 'supabase_live',
            data: userProfile,
          });
        }
      }
    }

    // Fallback for guest mode
    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: initialUserProfile,
    });
  } catch (error: any) {
    console.error('API /api/profile error:', error);
    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: initialUserProfile,
    });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'ডাটাবেস সংযোগ অনুপস্থিত।' },
        { status: 503 }
      );
    }

    const { user: authUser } = await getAuthenticatedUserFromRequest(req);
    if (!authUser?.id) {
      return NextResponse.json(
        { success: false, error: 'অননুমোদিত: আপনি শুধুমাত্র নিজের প্রোফাইল পরিবর্তন করতে পারবেন।' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { isAvailable, full_name, phone_number, blood_group, division, district, upazila } = body;

    // Check duplicate phone if phone is being changed
    if (phone_number) {
      const { data: existing } = await (supabase as any)
        .from('profiles')
        .select('id')
        .eq('phone_number', phone_number)
        .neq('id', authUser.id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { success: false, error: 'এই মোবাইল নম্বরটি ইতিমধ্যে অন্য একটি অ্যাকাউন্টে নিবন্ধিত আছে।' },
          { status: 409 }
        );
      }
    }

    // Update public.profiles strictly for authUser.id
    const profileUpdates: any = { updated_at: new Date().toISOString() };
    if (full_name !== undefined) profileUpdates.full_name = full_name;
    if (phone_number !== undefined) profileUpdates.phone_number = phone_number;
    if (blood_group !== undefined) profileUpdates.blood_group = blood_group;
    if (division !== undefined) profileUpdates.division = division;
    if (district !== undefined) profileUpdates.district = district;
    if (upazila !== undefined) profileUpdates.upazila = upazila;

    if (Object.keys(profileUpdates).length > 1) {
      await (supabase as any)
        .from('profiles')
        .update(profileUpdates)
        .eq('id', authUser.id);
    }

    // Update public.donor_profiles strictly for authUser.id
    if (isAvailable !== undefined) {
      await (supabase as any)
        .from('donor_profiles')
        .update({
          is_available: isAvailable,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', authUser.id);
    }

    return NextResponse.json({
      success: true,
      message: 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে।',
    });
  } catch (error: any) {
    console.error('API PATCH /api/profile error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'প্রোফাইল আপডেট ব্যর্থ হয়েছে' },
      { status: 500 }
    );
  }
}
