import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({
      status: 'unconfigured',
      connected: false,
      message: 'Supabase এনভায়রনমেন্ট ভেরিয়েবল সেট করা নেই। অ্যাপটি ইন-মেমোরি মোডে চলছে।',
      latencyMs: 0,
      timestamp: new Date().toISOString(),
      freeTierAdvisory: {
        isFreeTier: true,
        pauseRisk: 'High if inactive for 7 days',
        recommendation: 'Use GitHub Actions keep-alive ping or upgrade to Pro tier for 24/7 SLA.',
      },
    });
  }

  try {
    // Keep-alive query: selects single row to keep PostgreSQL engine warm
    const { data, error } = await (supabase as any)
      .from('districts')
      .select('id')
      .limit(1);

    const latencyMs = Date.now() - startTime;

    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          connected: false,
          error: error.message,
          latencyMs,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      connected: true,
      latencyMs,
      timestamp: new Date().toISOString(),
      database: 'PostgreSQL (Supabase Live)',
      freeTierStatus: {
        keepAliveActive: true,
        lastKeepAlive: new Date().toISOString(),
        recommendations: [
          'জীবনরক্ষাকারী জরুরি সেবার জন্য Supabase Pro ($25/mo) প্ল্যান সক্রিয় করার পরামর্শ দেওয়া হচ্ছে।',
          'নিয়মিত অফ-সাইট ডেটাবেস ব্যাকআপ ব্যাকগ্রাউন্ড স্ক্রিপ্ট চালানো নিশ্চিত করুন।',
          'রিয়েলটাইম সংযোগ সীমা (২০০ টি ডিভাইস) অতিক্রম প্রতিরোধে ডিস্ট্রিক্ট লেভেল চ্যানেল সাবস্ক্রিপশন ব্যবহার করুন।',
        ],
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'exception',
        connected: false,
        error: err?.message || 'Database ping exception',
        latencyMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
