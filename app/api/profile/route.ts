import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { initialUserProfile } from '@/lib/data';

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('*, donor_profiles(*)')
        .limit(1);

      if (!pErr && profiles && profiles.length > 0) {
        const p: any = profiles[0];
        const dp = p.donor_profiles?.[0] || {};

        // Fetch donation history
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
          bloodGroup: p.blood_group,
          donorId: p.id ? `RD-${p.id.slice(0, 6).toUpperCase()}` : 'RD-00102',
          phone: p.phone_number,
          location: `${p.district}${p.upazila ? ', ' + p.upazila : ''}`,
          isVerified: p.is_verified ?? true,
          isAvailable: dp.is_available ?? true,
          lastDonationDate: dp.last_donation_date || '২০২৪-০৫-১০',
          nextEligibleDate: 'এখনই রক্ত দিতে প্রস্তুত',
          daysRemaining: 0,
          totalDonations: dp.total_donations || donationHistory.length || 5,
          livesImpacted: (dp.total_donations || donationHistory.length || 5) * 3,
          emergencyResponses: 4,
          quietHoursEnabled: false,
          quietHoursStart: '২৩:০০',
          quietHoursEnd: '০৬:০০',
          notificationRadiusKm: 25,
          phoneVisibility: 'all_registered' as const,
          language: 'bn' as const,
          textSize: p.text_size_preference || '100%',
          reducedMotion: false,
          isProfileComplete: true,
          badges: [
            { id: 'b1', name: 'লাইফসেভার', description: '৫ বার রক্তদান সম্পন্ন', icon: 'Heart', isEarned: true },
            { id: 'b2', name: 'গোল্ডেন ডোনার', description: '১০ বার সফল রক্তদান', icon: 'Award', isEarned: (dp.total_donations || 0) >= 10 },
            { id: 'b3', name: 'কমিউনিটি হিরো', description: 'জরুরি পরিস্থিতিতে দ্রুত সাড়া', icon: 'Shield', isEarned: true },
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
    const body = await req.json();
    const { isAvailable } = body;
    const supabase = getSupabaseServerClient();

    if (supabase) {
      const { data: dps } = await (supabase as any).from('donor_profiles').select('id, user_id').limit(1);
      if (dps && dps[0]) {
        await (supabase as any)
          .from('donor_profiles')
          .update({ is_available: isAvailable })
          .eq('id', (dps[0] as any).id);
      }
    }

    return NextResponse.json({
      success: true,
      isAvailable,
      message: `রক্তদান প্রাপ্যতা স্ট্যাটাস ${isAvailable ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে`,
    });
  } catch (error: any) {
    console.error('API PATCH /api/profile error:', error);
    return NextResponse.json(
      { success: false, error: 'প্রোফাইল আপডেট ব্যর্থ হয়েছে' },
      { status: 500 }
    );
  }
}
