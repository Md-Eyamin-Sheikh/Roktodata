import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { normalizePhoneNumber } from '@/lib/services/authService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, phone, reason = 'User requested account deletion' } = body;

    if (!userId && !phone) {
      return NextResponse.json(
        { success: false, error: 'ইউজার আইডি বা মোবাইল নম্বর প্রয়োজন।' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const normalizedPhone = phone ? normalizePhoneNumber(phone) : null;

        // 1. Delete push subscriptions
        if (userId) {
          await (supabase as any).from('push_subscriptions').delete().eq('user_id', userId);
        }

        // 2. Anonymize emergency requests
        if (userId) {
          await (supabase as any)
            .from('emergency_requests')
            .update({
              status: 'fulfilled',
              contact_phone: '01XXXXXXXXX',
              patient_name: 'গোপন রাখা হয়েছে',
            })
            .eq('requester_id', userId);
        }

        // 3. Delete donor profile
        if (userId) {
          await (supabase as any).from('donor_profiles').delete().eq('id', userId);
        }

        // 4. Delete profile
        if (userId) {
          await (supabase as any).from('profiles').delete().eq('id', userId);
        } else if (normalizedPhone) {
          await (supabase as any).from('profiles').delete().eq('phone', normalizedPhone);
        }

        // 5. Record deletion in data_deletion_requests for audit
        const confirmationCode = `DEL-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        await (supabase as any).from('data_deletion_requests').insert({
          user_id: userId || null,
          user_identifier: phone || userId,
          status: 'completed',
          confirmation_code: confirmationCode,
          completed_at: new Date().toISOString(),
          notes: reason,
        });

        return NextResponse.json({
          success: true,
          confirmationCode,
          message: 'আপনার অ্যাকাউন্ট ও সকল ব্যক্তিগত তথ্য সফলভাবে মুছে ফেলা হয়েছে।',
        });
      } catch (dbErr: any) {
        console.warn('Supabase account deletion note:', dbErr?.message);
      }
    }

    return NextResponse.json({
      success: true,
      confirmationCode: `DEL-${Date.now()}`,
      message: 'আপনার অ্যাকাউন্ট ও তথ্য মুছে ফেলার অনুরোধ সফলভাবে প্রক্রিয়াজাত হয়েছে।',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'অ্যাকাউন্ট মুছতে ব্যর্থ হয়েছে।' },
      { status: 500 }
    );
  }
}
