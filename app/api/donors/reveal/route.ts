import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient, getAuthenticatedUserFromRequest } from '@/lib/supabase/server';
import { initialDonors } from '@/lib/data';
import { maskPhoneNumber } from '@/lib/bengali-utils';

export async function POST(req: NextRequest) {
  try {
    const { user: authUser, role } = await getAuthenticatedUserFromRequest(req);
    if (!authUser?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'রক্তদাতার সাথে সরাসরি যোগাযোগের জন্য অনুগ্রহ করে প্রথমে লগইন করুন (Authentication Required)।',
          requireAuth: true,
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { donorId, requestId } = body;

    if (!donorId) {
      return NextResponse.json(
        { success: false, error: 'রক্তদাতা আইডি প্রদান করা আবশ্যক।' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient(req);

    // 1. If Supabase is connected, call secure RPC or verify authorization in DB
    if (supabase) {
      try {
        // Try calling the PostgreSQL SECURITY DEFINER RPC function
        const { data: rpcData, error: rpcError } = await (supabase as any).rpc(
          'reveal_donor_contact',
          {
            target_donor_id: donorId,
            request_id: requestId || null,
          }
        );

        if (!rpcError && rpcData && rpcData.length > 0) {
          const res = rpcData[0];
          if (res.success && res.phone_number) {
            return NextResponse.json({
              success: true,
              phone: res.phone_number,
              message: res.message || 'অনুমোদিত ম্যাচ: নম্বর প্রদান করা হয়েছে।',
            });
          } else {
            return NextResponse.json(
              {
                success: false,
                error: res.message || 'অননুমোদিত: শুধুমাত্র সক্রিয় জরুরি রোগী ও যাচাইকৃত ম্যাচে যোগাযোগ প্রকাশ করা হয়।',
              },
              { status: 403 }
            );
          }
        }
      } catch (err: any) {
        console.warn('RPC reveal_donor_contact note:', err?.message);
      }

      // Direct fallback verification query in database if RPC not yet run:
      const isSelf = authUser.id === donorId;
      const isAdmin = role === 'admin';

      let isAuthorizedMatch = isSelf || isAdmin;

      if (!isAuthorizedMatch && requestId) {
        const { data: reqData } = await supabase
          .from('emergency_requests')
          .select('id, requester_id, status')
          .eq('id', requestId)
          .eq('requester_id', authUser.id)
          .maybeSingle();

        if (reqData && (reqData as any).status === 'active') {
          isAuthorizedMatch = true;
        }
      }

      // If still not authorized, check if user has ANY active emergency request
      if (!isAuthorizedMatch) {
        const { data: userReqs } = await supabase
          .from('emergency_requests')
          .select('id')
          .eq('requester_id', authUser.id)
          .eq('status', 'active')
          .limit(1);

        if (userReqs && userReqs.length > 0) {
          isAuthorizedMatch = true;
        }
      }

      if (isAuthorizedMatch) {
        const profileResult = await (supabase as any)
          .from('profiles')
          .select('phone_number, full_name')
          .eq('id', donorId)
          .maybeSingle();

        const donorProfile = profileResult?.data as { phone_number?: string; full_name?: string } | null;

        if (donorProfile?.phone_number) {
          // Record contact reveal audit log in reports table
          try {
            await (supabase as any).from('reports').insert({
              reporter_id: authUser.id,
              target_name: donorProfile.full_name || 'Donor Contact',
              target_phone: maskPhoneNumber(donorProfile.phone_number),
              reason: 'CONTACT_REVEAL_AUDIT',
              details: JSON.stringify({
                caller_id: authUser.id,
                target_donor_id: donorId,
                request_id: requestId || null,
                timestamp: new Date().toISOString(),
              }),
              status: 'resolved',
            });
          } catch (logErr) {
            console.warn('Audit log write error:', logErr);
          }

          return NextResponse.json({
            success: true,
            phone: donorProfile.phone_number,
            message: 'অনুমোদিত জরুরি ম্যাচ: যোগাযোগ নম্বর প্রকাশ করা হলো।',
          });
        }
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'রোগীর পরিচয় ও জরুরি প্রয়োজনের সত্যতা নিশ্চিত না করে রক্তদাতার ব্যক্তিগত মোবাইল নম্বর প্রকাশ করা সম্ভব নয়। অনুগ্রহ করে আগে "জরুরি রক্ত চাই" থেকে আবেদন করুন।',
            code: 'NEEDS_ACTIVE_REQUEST',
          },
          { status: 403 }
        );
      }
    }

    // Fallback for mock/local data
    const match = initialDonors.find((d) => d.id === donorId);
    if (match && match.phone) {
      return NextResponse.json({
        success: true,
        phone: match.phone,
        message: 'জরুরি প্রয়োজনে যোগাযোগ নম্বর উন্মোচন করা হলো।',
      });
    }

    return NextResponse.json(
      { success: false, error: 'রক্তদাতার তথ্য পাওয়া যায়নি।' },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('API /api/donors/reveal error:', error);
    return NextResponse.json(
      { success: false, error: 'সার্ভার প্রক্রিয়াকরণে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
