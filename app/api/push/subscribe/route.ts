import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscription, district, bloodGroup, userId } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json(
        { success: false, error: 'অবৈধ পুশ সাবস্ক্রিপশন অবজেক্ট।' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { error } = await (supabase as any)
        .from('push_subscriptions')
        .upsert(
          {
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            district: district || null,
            blood_group: bloodGroup || null,
            user_id: userId || null,
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'endpoint' }
        );

      if (error) {
        console.warn('Supabase push_subscriptions upsert note:', error.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'ব্রাউজার পুশ নোটিফিকেশন সফলভাবে নিবন্ধিত হয়েছে।',
    });
  } catch (error: any) {
    console.error('Error in /api/push/subscribe:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'সাবস্ক্রিপশন ব্যর্থ হয়েছে।' },
      { status: 500 }
    );
  }
}
