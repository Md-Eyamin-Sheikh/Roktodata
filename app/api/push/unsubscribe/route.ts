import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { success: false, error: 'এন্ডপয়েন্ট প্রদান করা আবশ্যক।' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    if (supabase) {
      await (supabase as any)
        .from('push_subscriptions')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('endpoint', endpoint);
    }

    return NextResponse.json({
      success: true,
      message: 'পুশ নোটিফিকেশন সাবস্ক্রিপশন সফলভাবে বাতিল করা হয়েছে।',
    });
  } catch (error: any) {
    console.error('Error in /api/push/unsubscribe:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'আনসাবস্ক্রাইব ব্যর্থ হয়েছে।' },
      { status: 500 }
    );
  }
}
