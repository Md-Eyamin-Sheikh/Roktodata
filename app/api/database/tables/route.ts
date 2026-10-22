import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const url = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !anonKey) {
    return NextResponse.json({
      success: false,
      error: 'Supabase credentials missing',
    }, { status: 500 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';
  const supabase = createClient(url, serviceKey || anonKey);

  try {
    const [
      emergencyRequestsRes,
      hospitalsRes,
      inventoryRes,
      ambulancesRes,
      campsRes,
      districtsRes,
      profilesRes,
      donorProfilesRes,
      responsesRes,
      historyRes,
      notificationsRes,
    ] = await Promise.all([
      supabase.from('emergency_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('hospitals_and_banks').select('*').order('created_at', { ascending: false }),
      supabase.from('blood_inventory').select('*, hospitals_and_banks(name, district)').order('units_available', { ascending: false }),
      supabase.from('ambulances').select('*').order('created_at', { ascending: false }),
      supabase.from('donation_camps').select('*').order('camp_date', { ascending: true }),
      supabase.from('districts').select('*').order('name_bn', { ascending: true }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('donor_profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('donor_responses').select('*').order('created_at', { ascending: false }),
      supabase.from('donation_history').select('*').order('donation_date', { ascending: false }),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }),
    ]);

    const tables = {
      emergency_requests: {
        name: 'জরুরি রক্তের অনুরোধ',
        tableName: 'emergency_requests',
        count: emergencyRequestsRes.data?.length || 0,
        data: emergencyRequestsRes.data || [],
        error: emergencyRequestsRes.error?.message || null,
      },
      hospitals_and_banks: {
        name: 'হাসপাতাল ও ব্লাড ব্যাংক',
        tableName: 'hospitals_and_banks',
        count: hospitalsRes.data?.length || 0,
        data: hospitalsRes.data || [],
        error: hospitalsRes.error?.message || null,
      },
      blood_inventory: {
        name: 'রক্তের স্টক / ইনভেন্টরি',
        tableName: 'blood_inventory',
        count: inventoryRes.data?.length || 0,
        data: inventoryRes.data || [],
        error: inventoryRes.error?.message || null,
      },
      ambulances: {
        name: 'জরুরি অ্যাম্বুলেন্স সেবা',
        tableName: 'ambulances',
        count: ambulancesRes.data?.length || 0,
        data: ambulancesRes.data || [],
        error: ambulancesRes.error?.message || null,
      },
      donation_camps: {
        name: 'রক্তদান ক্যাম্পেইন',
        tableName: 'donation_camps',
        count: campsRes.data?.length || 0,
        data: campsRes.data || [],
        error: campsRes.error?.message || null,
      },
      districts: {
        name: 'জেলা ভৌগোলিক তালিকা',
        tableName: 'districts',
        count: districtsRes.data?.length || 0,
        data: districtsRes.data || [],
        error: districtsRes.error?.message || null,
      },
      profiles: {
        name: 'ব্যবহারকারী প্রোফাইল',
        tableName: 'profiles',
        count: profilesRes.data?.length || 0,
        data: profilesRes.data || [],
        error: profilesRes.error?.message || null,
      },
      donor_profiles: {
        name: 'রক্তদাতা স্ট্যাটাস প্রোফাইল',
        tableName: 'donor_profiles',
        count: donorProfilesRes.data?.length || 0,
        data: donorProfilesRes.data || [],
        error: donorProfilesRes.error?.message || null,
      },
      donor_responses: {
        name: 'ডোনার রেসপন্স ট্র্যাকিং',
        tableName: 'donor_responses',
        count: responsesRes.data?.length || 0,
        data: responsesRes.data || [],
        error: responsesRes.error?.message || null,
      },
      donation_history: {
        name: 'রক্তদানের ইতিহাস ও ব্যাজ',
        tableName: 'donation_history',
        count: historyRes.data?.length || 0,
        data: historyRes.data || [],
        error: historyRes.error?.message || null,
      },
      notifications: {
        name: 'সিস্টেম ও জরুরি নোটিফিকেশন',
        tableName: 'notifications',
        count: notificationsRes.data?.length || 0,
        data: notificationsRes.data || [],
        error: notificationsRes.error?.message || null,
      },
    };

    return NextResponse.json({
      success: true,
      supabaseHost: url,
      timestamp: new Date().toISOString(),
      tables,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to fetch database tables',
    }, { status: 500 });
  }
}
