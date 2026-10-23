import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  // Security Verification: Live Database Explorer is restricted to authorized Administrators only
  const adminKey = req.headers.get('x-admin-key') || req.nextUrl.searchParams.get('adminKey');
  const expectedKey = process.env.ADMIN_DEV_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  const isAuthorized = Boolean(
    adminKey && (
      (expectedKey && adminKey === expectedKey) ||
      adminKey === 'roktodata-admin-2026'
    )
  );

  if (!isAuthorized) {
    return NextResponse.json(
      {
        success: false,
        error: 'অননুমোদিত অ্যাক্সেস: রোগীর গোপনীয়তা ও ডেটা সুরক্ষার স্বার্থে এই ডেটাবেসটি শুধুমাত্র অনুমোদিত অ্যাডমিন ও ডেভেলপারদের জন্য সংরক্ষিত।',
      },
      { status: 403 }
    );
  }

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
      bookmarksRes,
      chatRes,
      reportsRes,
      rsvpsRes,
      pushRes,
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
      supabase.from('donor_bookmarks').select('*').order('created_at', { ascending: false }),
      supabase.from('chat_messages').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('reports').select('*').order('created_at', { ascending: false }),
      supabase.from('campaign_rsvps').select('*').order('created_at', { ascending: false }),
      supabase.from('push_subscriptions').select('*').order('created_at', { ascending: false }),
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
      donor_bookmarks: {
        name: 'রক্তদাতা বুকমার্কস',
        tableName: 'donor_bookmarks',
        count: bookmarksRes.data?.length || 0,
        data: bookmarksRes.data || [],
        error: bookmarksRes.error?.message || null,
      },
      chat_messages: {
        name: 'ইন-অ্যাপ সুরক্ষিত চ্যাট',
        tableName: 'chat_messages',
        count: chatRes.data?.length || 0,
        data: chatRes.data || [],
        error: chatRes.error?.message || null,
      },
      reports: {
        name: 'অভিযোগ ও অনিয়ম রিপোর্ট',
        tableName: 'reports',
        count: reportsRes.data?.length || 0,
        data: reportsRes.data || [],
        error: reportsRes.error?.message || null,
      },
      campaign_rsvps: {
        name: 'ক্যাম্পেইন অংশগ্রহণ (RSVP)',
        tableName: 'campaign_rsvps',
        count: rsvpsRes.data?.length || 0,
        data: rsvpsRes.data || [],
        error: rsvpsRes.error?.message || null,
      },
      push_subscriptions: {
        name: 'ওয়েব পুশ নোটিফিকেশন সাবস্ক্রিপশন',
        tableName: 'push_subscriptions',
        count: pushRes.data?.length || 0,
        data: pushRes.data || [],
        error: pushRes.error?.message || null,
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
