import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const SIGNED_URL_TTL_SECONDS = 15 * 60; // 15 mins

/**
 * Server-side magic bytes validation
 */
function validateServerMagicBytes(buffer: Buffer): { isValid: boolean; mime?: string; error?: string } {
  if (buffer.length < 4) {
    return { isValid: false, error: 'ফাইলটি খালি বা ক্ষতিগ্রস্ত।' };
  }

  // 1. JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { isValid: true, mime: 'image/jpeg' };
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { isValid: true, mime: 'image/png' };
  }

  // 3. WebP: RIFF ... WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x41 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { isValid: true, mime: 'image/webp' };
  }

  // 4. PDF: %PDF
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return { isValid: true, mime: 'application/pdf' };
  }

  return {
    isValid: false,
    error: 'অননুমোদিত ফাইলের ধরন। শুধুমাত্র প্রকৃত JPG, PNG, WEBP বা PDF প্রেসক্রিপশন গ্রহণযোগ্য।',
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const userId = (formData.get('userId') as string) || 'requester_temp';
    const requestId = (formData.get('requestId') as string) || 'pending';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'কোনো ফাইল আপলোড করা হয়নি।' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'ফাইলের আকার ৫MB এর বেশি হতে পারবে না।' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Strict server-side magic bytes validation
    const magicCheck = validateServerMagicBytes(buffer);
    if (!magicCheck.isValid) {
      return NextResponse.json(
        { success: false, error: magicCheck.error },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        {
          success: true,
          previewUrl: '',
          message: 'অফলাইন মোড: প্রেসক্রিপশন লোকাল সেশনে সংরক্ষিত।',
        },
        { status: 200 }
      );
    }

    const cleanUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '');
    const cleanRequestId = requestId.replace(/[^a-zA-Z0-9_-]/g, '');
    const ext = magicCheck.mime === 'application/pdf' ? 'pdf' : 'jpg';
    const fileName = `rx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const storagePath = `${cleanUserId}/${cleanRequestId}/${fileName}`;

    // Upload to private bucket 'prescriptions'
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('prescriptions')
      .upload(storagePath, buffer, {
        contentType: magicCheck.mime,
        cacheControl: '900',
        upsert: false,
      });

    if (uploadErr) {
      return NextResponse.json(
        { success: false, error: 'স্টোরেজ আপলোড ব্যর্থ: ' + uploadErr.message },
        { status: 500 }
      );
    }

    // Generate short-lived signed URL (15 minutes)
    const { data: signData, error: signErr } = await supabase.storage
      .from('prescriptions')
      .createSignedUrl(uploadData.path, SIGNED_URL_TTL_SECONDS);

    return NextResponse.json({
      success: true,
      storagePath: uploadData.path,
      signedUrl: signData?.signedUrl,
      expiresIn: SIGNED_URL_TTL_SECONDS,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'সার্ভার ত্রুটি: ' + (err?.message || 'অজানা সমস্যা') },
      { status: 500 }
    );
  }
}
