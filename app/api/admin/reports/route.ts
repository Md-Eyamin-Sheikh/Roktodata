import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { FraudReportItem, ReportStatus } from '@/lib/types';
import { setPhoneBanStatus } from '@/lib/services/abuseService';

// In-memory fallback reports when Supabase DB is unconfigured or pausing
let fallbackReports: FraudReportItem[] = [
  {
    id: 'REP-101',
    reporterId: 'USR-8821',
    targetName: 'রফিক হোসেন (রোগীর প্রতিনিধি)',
    targetUserId: 'USR-9901',
    targetPhone: '01711009988',
    requestId: 'REQ-1002',
    reason: 'money_demanded',
    description: 'হাসপাতালে রক্তের জন্য পৌঁছানোর পর ডোনারের কাছ থেকে যাতায়াত খরচের নামে ২০০০ টাকা দাবি করা হয়েছে।',
    status: 'pending',
    createdAt: 'আজ দুপুর ১২:৩০',
  },
  {
    id: 'REP-102',
    reporterId: 'USR-4412',
    targetName: 'বগুড়া পপুলার হেলথ সেন্টার',
    targetUserId: 'USR-3311',
    targetPhone: '01822334455',
    requestId: 'REQ-1005',
    reason: 'fake_request',
    description: 'রোগীর কোনো খোঁজ নেই। ওয়ার্ডে গিয়ে জানা গেল এই নামে কেউ ভর্তি ছিল না।',
    status: 'reviewing',
    adminNotes: 'ওয়ার্ড মাস্টারের সাথে ফোনে যোগাযোগ করা হয়েছে। তদন্ত চলছে।',
    createdAt: 'গতকাল সন্ধ্যা ০৭:১৫',
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        let query = (supabase as any)
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false });

        if (statusFilter && statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const formatted: FraudReportItem[] = data.map((r: any) => ({
            id: r.id,
            reporterId: r.reporter_id || 'anonymous',
            targetName: r.target_name,
            targetUserId: r.target_user_id || undefined,
            targetPhone: r.target_phone || undefined,
            requestId: r.request_id || undefined,
            reason: r.reason,
            description: r.details || r.description || '',
            proofUrl: r.proof_url || undefined,
            status: r.status || 'pending',
            adminNotes: r.admin_notes || undefined,
            createdAt: new Date(r.created_at).toLocaleString('bn-BD'),
          }));

          return NextResponse.json({ success: true, reports: formatted });
        }
      } catch (dbErr) {
        console.warn('Supabase reports fetch fallback:', dbErr);
      }
    }

    // Return in-memory fallback
    let filtered = fallbackReports;
    if (statusFilter && statusFilter !== 'all') {
      filtered = fallbackReports.filter((r) => r.status === statusFilter);
    }

    return NextResponse.json({ success: true, reports: filtered });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'রিপোর্ট তালিকা লোড ব্যর্থ হয়েছে।' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportId, status, adminNotes, shouldBanTarget = false, targetPhone } = body;

    if (!reportId || !status) {
      return NextResponse.json(
        { success: false, error: 'রিপোর্ট আইডি এবং স্ট্যাটাস আবশ্যক।' },
        { status: 400 }
      );
    }

    // Ban target phone if requested
    if (shouldBanTarget && targetPhone) {
      await setPhoneBanStatus(targetPhone, true, `Report ${reportId}: ${adminNotes || 'Fraudulent activity'}`);
    }

    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { error } = await (supabase as any)
          .from('reports')
          .update({
            status,
            admin_notes: adminNotes || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', reportId);

        if (!error) {
          return NextResponse.json({
            success: true,
            message: 'রিপোর্ট স্ট্যাটাস ও অ্যাডমিন নোট সফলভাবে আপডেট করা হয়েছে।',
          });
        }
      } catch (dbErr) {
        console.warn('Supabase report update fallback:', dbErr);
      }
    }

    // Update in-memory fallback
    const idx = fallbackReports.findIndex((r) => r.id === reportId);
    if (idx !== -1) {
      fallbackReports[idx] = {
        ...fallbackReports[idx],
        status: status as ReportStatus,
        adminNotes: adminNotes || fallbackReports[idx].adminNotes,
      };
    }

    return NextResponse.json({
      success: true,
      message: 'রিপোর্ট স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'আপডেট করতে ব্যর্থ হয়েছে।' },
      { status: 500 }
    );
  }
}
