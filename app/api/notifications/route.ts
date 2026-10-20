import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { initialNotifications } from '@/lib/data';

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const formatted = data.map((n: any) => ({
          id: n.id,
          category: n.category || 'urgent',
          title: n.title,
          description: n.description,
          timestamp: new Date(n.created_at).toLocaleTimeString('bn-BD', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isUnread: n.is_unread ?? true,
          bloodGroup: n.title.includes('A+') ? 'A+' : n.title.includes('B+') ? 'B+' : n.title.includes('O+') ? 'O+' : n.title.includes('O-') ? 'O-' : n.title.includes('AB+') ? 'AB+' : 'A+',
        }));

        return NextResponse.json({
          success: true,
          source: 'supabase_live',
          data: formatted,
        });
      }
    }

    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: initialNotifications,
    });
  } catch (error: any) {
    console.error('API /api/notifications error:', error);
    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: initialNotifications,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, category, bloodGroup } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'শিরোনাম ও বিবরণ আবশ্যক' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    let savedId = `NOTIF-${Date.now()}`;

    if (supabase) {
      // Find a profile id to link if required by FK
      const { data: profs } = await (supabase as any).from('profiles').select('id').limit(1);
      const userId = (profs as any)?.[0]?.id;

      if (userId) {
        const { data: inserted, error } = await (supabase as any)
          .from('notifications')
          .insert({
            user_id: userId,
            title,
            description,
            category: category || 'urgent',
            is_unread: true,
          })
          .select('id')
          .single();

        if (!error && inserted) {
          savedId = (inserted as any).id;
        }
      }
    }

    const newNotification = {
      id: savedId,
      category: category || 'urgent',
      title,
      description,
      timestamp: 'এইমাত্র',
      bloodGroup: bloodGroup || 'B+',
      isUnread: true,
    };

    return NextResponse.json({
      success: true,
      data: newNotification,
      message: 'নোটিফিকেশন সফলভাবে তৈরি ও পাঠানো হয়েছে',
    });
  } catch (error: any) {
    console.error('API POST /api/notifications error:', error);
    return NextResponse.json(
      { success: false, error: 'নোটিফিকেশন তৈরিতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, markAll } = body;
    const supabase = getSupabaseServerClient();

    if (supabase) {
      if (markAll) {
        await (supabase as any)
          .from('notifications')
          .update({ is_unread: false })
          .eq('is_unread', true);
      } else if (id) {
        await (supabase as any)
          .from('notifications')
          .update({ is_unread: false })
          .eq('id', id);
      }
    }

    return NextResponse.json({
      success: true,
      message: markAll ? 'সব নোটিফিকেশন পঠিত হিসেবে চিহ্নিত করা হয়েছে' : 'নোটিফিকেশন পঠিত হিসেবে চিহ্নিত করা হয়েছে',
    });
  } catch (error: any) {
    console.error('API PATCH /api/notifications error:', error);
    return NextResponse.json(
      { success: false, error: 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const supabase = getSupabaseServerClient();
      if (supabase) {
        await (supabase as any).from('notifications').delete().eq('id', id);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'নোটিফিকেশন মুছে ফেলা হয়েছে',
    });
  } catch (error: any) {
    console.error('API DELETE /api/notifications error:', error);
    return NextResponse.json(
      { success: false, error: 'নোটিফিকেশন মুছতে ব্যর্থ হয়েছে' },
      { status: 500 }
    );
  }
}
