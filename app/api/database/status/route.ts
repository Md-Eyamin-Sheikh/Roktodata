import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const url = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';

  if (!url || !anonKey) {
    return NextResponse.json({
      success: false,
      isConfigured: false,
      message: 'সুপারবেস এনভায়রনমেন্ট কনফিগারেশন পাওয়া যায়নি।',
    });
  }

  const client = createClient(url, anonKey);

  // 1. Check Tables and Row Counts
  const tables = [
    'profiles',
    'donor_profiles',
    'emergency_requests',
    'donor_responses',
    'hospitals_and_banks',
    'ambulances',
    'donation_camps',
    'blood_inventory',
    'donation_history',
    'notifications',
  ];

  const tableStatus: Record<string, { exists: boolean; count: number; error?: string }> = {};

  for (const table of tables) {
    try {
      const { count, error } = await client
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        tableStatus[table] = { exists: false, count: 0, error: error.message };
      } else {
        tableStatus[table] = { exists: true, count: count || 0 };
      }
    } catch (err: any) {
      tableStatus[table] = { exists: false, count: 0, error: err.message };
    }
  }

  // 2. Test Live Write (INSERT & DELETE probe)
  let writeStatus = {
    canWrite: false,
    details: '',
    errorCode: '',
  };

  const testProbeId = `test-${Date.now()}`;
  try {
    const probe = {
      blood_group: 'O+',
      bags_needed: 1,
      hospital_name: 'ভেরিফিকেশন টেস্ট',
      district: 'ঢাকা',
      urgency: 'now',
      patient_name: 'সিস্টেম ডায়াগনস্টিক টেস্ট',
      contact_phone: '01700000000',
      reason: testProbeId,
      status: 'active',
    };

    const { data, error } = await client
      .from('emergency_requests')
      .insert(probe)
      .select('id, patient_name');

    if (error) {
      writeStatus = {
        canWrite: false,
        details: error.message,
        errorCode: error.code || 'UNKNOWN',
      };
    } else if (data && data.length > 0) {
      writeStatus = {
        canWrite: true,
        details: 'ডেটাবেসে সফলভাবে ডেটা রাইট ও রিড সম্পন্ন হয়েছে!',
        errorCode: 'NONE',
      };
      // Clean up test probe
      await client.from('emergency_requests').delete().eq('id', data[0].id);
    } else {
      writeStatus = {
        canWrite: false,
        details: 'রেকর্ড সংরক্ষিত হয়েছে কিন্তু রেসপন্স রিটার্ন হয়নি।',
        errorCode: 'NO_DATA',
      };
    }
  } catch (err: any) {
    writeStatus = {
      canWrite: false,
      details: err.message || 'অজানা ত্রুটি',
      errorCode: 'EXCEPTION',
    };
  }

  const allTablesExist = Object.values(tableStatus).every((t) => t.exists);

  return NextResponse.json({
    success: true,
    supabaseUrl: url,
    connected: true,
    allTablesExist,
    tableStatus,
    writeStatus,
    timestamp: new Date().toISOString(),
  });
}
