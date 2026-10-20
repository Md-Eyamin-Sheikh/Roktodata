import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { initialDonationCamps } from '@/lib/data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get('district');

    const supabase = getSupabaseServerClient();
    if (supabase) {
      let query = supabase.from('donation_camps').select('*').order('camp_date', { ascending: true });

      if (district && district !== 'all') {
        const clean = district.replace(/সদর/g, '').trim();
        query = query.ilike('district', `%${clean}%`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const camps = data.map((c: any) => ({
          id: c.id,
          organizer: c.organizer,
          venue: c.venue,
          dateDay: c.date_day || '২৪',
          dateMonth: c.date_month || 'অক্টোবর',
          time: c.time_slot,
          targetBags: c.target_units,
          registeredCount: c.registered_count || 0,
          description: `আয়োজক: ${c.organizer} • স্থান: ${c.venue} • লক্ষ্যমাত্রা: ${c.target_units} ব্যাগ রক্ত`,
          isRsvp: false,
        }));

        return NextResponse.json({
          success: true,
          source: 'supabase_live',
          data: camps,
        });
      }
    }

    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: initialDonationCamps,
    });
  } catch (error: any) {
    console.error('API /api/camps error:', error);
    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: initialDonationCamps,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { campId } = await req.json();
    if (!campId) {
      return NextResponse.json({ success: false, error: 'ক্যাম্প আইডি আবশ্যক' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    if (supabase) {
      // Increment registered count
      const { data: current } = await (supabase as any)
        .from('donation_camps')
        .select('registered_count')
        .eq('id', campId)
        .single();
      const newCount = ((current as any)?.registered_count || 0) + 1;
      await (supabase as any)
        .from('donation_camps')
        .update({ registered_count: newCount })
        .eq('id', campId);
    }

    return NextResponse.json({
      success: true,
      message: 'ক্যাম্পে আপনার উপস্থিতি ও রক্তদানের আগ্রহ নিশ্চিত করা হয়েছে!',
    });
  } catch (error: any) {
    console.error('API POST /api/camps error:', error);
    return NextResponse.json(
      { success: false, error: 'ক্যাম্প রেজিস্ট্রেশন ব্যর্থ হয়েছে' },
      { status: 500 }
    );
  }
}
