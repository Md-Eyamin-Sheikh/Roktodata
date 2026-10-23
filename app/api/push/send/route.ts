import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { sendWebPush } from '@/lib/services/webPushServer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title = '🚨 জরুরি রক্তের আবেদন',
      body: messageBody = 'আপনার এলাকায় নতুন রক্তের অনুরোধ এসেছে।',
      url = '/',
      district = null,
      bloodGroup = null,
      userId = null,
    } = body;

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({
        success: true,
        sentCount: 0,
        message: 'সুপারবেস সংযোগ নেই, পুশ নোটিফিকেশন স্কিপ করা হয়েছে।',
      });
    }

    // 1. Query active subscriptions
    let query = (supabase as any)
      .from('push_subscriptions')
      .select('id, endpoint, district, blood_group, user_id')
      .eq('is_active', true);

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (district) {
      const cleanDistrict = district.replace(/সদর/g, '').trim();
      query = query.or(`district.ilike.%${cleanDistrict}%,district.is.null`);
    }

    const { data: subs, error: subsError } = await query;
    if (subsError || !subs || subs.length === 0) {
      return NextResponse.json({
        success: true,
        sentCount: 0,
        message: 'কোনো সক্রিয় পুশ সাবস্ক্রিপশন পাওয়া যায়নি।',
      });
    }

    const payload = {
      title,
      body: messageBody,
      url,
      tag: 'roktodata-urgent',
      timestamp: Date.now(),
    };

    let sentCount = 0;
    const expiredIds: string[] = [];

    // 2. Dispatch push to all matching subscriptions
    await Promise.all(
      subs.map(async (sub: any) => {
        const result = await sendWebPush(sub.endpoint, payload);
        if (result.success) {
          sentCount++;
        } else if (result.expired) {
          expiredIds.push(sub.id);
        }
      })
    );

    // 3. Auto-clean expired / invalid subscriptions (404 / 410 Gone)
    if (expiredIds.length > 0) {
      await (supabase as any)
        .from('push_subscriptions')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .in('id', expiredIds);
    }

    return NextResponse.json({
      success: true,
      totalMatched: subs.length,
      sentCount,
      prunedCount: expiredIds.length,
      message: `${sentCount}টি ডিভাইসে পুশ নোটিফিকেশন সফলভাবে পাঠানো হয়েছে।`,
    });
  } catch (error: any) {
    console.error('Error in /api/push/send:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'পুশ পাঠানো ব্যর্থ হয়েছে।' },
      { status: 500 }
    );
  }
}
