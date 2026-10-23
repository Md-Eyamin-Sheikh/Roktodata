import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { sendWebPush } from '@/lib/services/webPushServer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      requestId,
      donorName = 'রক্তদাতা',
      bloodGroup = 'B+',
      phone = '',
      etaMinutes = 30,
      message = '',
    } = body;

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: 'অনুরোধ আইডি আবশ্যক।' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    let savedId = `RESP-${Date.now()}`;

    if (supabase) {
      // 1. Resolve donor_id from donor_profiles
      let donorId: string | null = null;
      const { data: dp } = await (supabase as any)
        .from('donor_profiles')
        .select('id')
        .limit(1);

      if (dp && dp[0]?.id) {
        donorId = dp[0].id;
      }

      if (donorId) {
        const { data: upserted, error } = await (supabase as any)
          .from('donor_responses')
          .upsert(
            {
              request_id: requestId,
              donor_id: donorId,
              eta_minutes: Number(etaMinutes) || 30,
              status: 'on_the_way',
              message: message || `${donorName} (${bloodGroup}) সাড়া দিয়েছেন। আনুমানিক ${etaMinutes} মিনিটে পৌঁছাবেন।`,
            },
            { onConflict: 'request_id,donor_id' }
          )
          .select('id')
          .single();

        if (!error && upserted) {
          savedId = upserted.id;
        }

        // 2. Find request details to notify requester
        const { data: reqData } = await (supabase as any)
          .from('emergency_requests')
          .select('requester_id, hospital_name, district')
          .eq('id', requestId)
          .single();

        // 3. Create In-App Notification
        await (supabase as any).from('notifications').insert({
          user_id: reqData?.requester_id || null,
          category: 'my-req',
          title: '🩸 রক্তদাতা সাড়া দিয়েছেন!',
          description: `${donorName} (${bloodGroup}) আপনার রক্তের আবেদনে সাড়া দিয়েছেন। আনুমানিক ${etaMinutes} মিনিটে পৌঁছাবেন। যোগাযোগ: ${phone}`,
          blood_group: bloodGroup,
          action_type: 'call',
          action_url: phone ? `tel:${phone}` : null,
          is_unread: true,
        });

        // 4. Send Web Push to requester (if user_id present)
        if (reqData?.requester_id) {
          const { data: subs } = await (supabase as any)
            .from('push_subscriptions')
            .select('endpoint')
            .eq('user_id', reqData.requester_id)
            .eq('is_active', true);

          if (subs && subs.length > 0) {
            await Promise.all(
              subs.map((s: any) =>
                sendWebPush(s.endpoint, {
                  title: '🩸 রক্তদাতা সাড়া দিয়েছেন!',
                  body: `${donorName} (${bloodGroup}) আপনার রক্তের আবেদনে সাড়া দিয়েছেন। আনুমানিক ${etaMinutes} মিনিটে পৌঁছাবেন।`,
                  url: '/',
                })
              )
            );
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: savedId,
        requestId,
        donorName,
        bloodGroup,
        phone,
        etaMinutes,
        status: 'on_the_way',
      },
      message: 'ডোনার সাড়া সফলভাবে গৃহীত হয়েছে।',
    });
  } catch (err: any) {
    console.error('Error in /api/requests/respond:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'সাড়া প্রদান প্রক্রিয়াকরণে ত্রুটি হয়েছে।' },
      { status: 500 }
    );
  }
}
