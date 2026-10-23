import { getSupabaseClient } from '@/lib/supabase/client';

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates prescription file type and size limit
 */
export const validatePrescriptionFile = (file: File): FileValidationResult => {
  if (!file) {
    return { isValid: false, error: 'কোনো ফাইল নির্বাচন করা হয়নি।' };
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'অননুমোদিত ফাইলের ধরন। শুধুমাত্র JPG, PNG, WEBP ছবি অথবা PDF ফাইল আপলোড করা যাবে।',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: 'ফাইলের আকার অতিরিক্ত বড়। সর্বোচ্চ ৫ মেগাবাইট (5 MB) আকারের ফাইল আপলোড করুন।',
    };
  }

  return { isValid: true };
};

/**
 * Reads browser file as Base64 Data URL for instant preview and offline resiliency
 */
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export interface PrescriptionUploadResult {
  success: boolean;
  previewUrl: string;
  storagePath?: string;
  signedUrl?: string;
  error?: string;
}

/**
 * Uploads prescription to Supabase Private Bucket 'prescriptions'
 * and generates a secure time-limited Signed URL.
 * Gracefully falls back to localized Data URL preview if offline or storage unavailable.
 */
export const uploadPrescriptionFile = async (
  file: File,
  userId?: string
): Promise<PrescriptionUploadResult> => {
  const validation = validatePrescriptionFile(file);
  if (!validation.isValid) {
    return {
      success: false,
      previewUrl: '',
      error: validation.error,
    };
  }

  let dataUrl = '';
  try {
    dataUrl = await readFileAsDataURL(file);
  } catch {
    return {
      success: false,
      previewUrl: '',
      error: 'ফাইল রিড করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।',
    };
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanUserId = userId ? userId.replace(/[^a-zA-Z0-9_-]/g, '') : 'anon';
      const fileName = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
      const storagePath = `${cleanUserId}/${fileName}`;

      // 1. Upload to Supabase Storage Private Bucket 'prescriptions'
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('prescriptions')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (!uploadErr && uploadData?.path) {
        // 2. Generate secure 24-hour Signed URL
        const { data: signedData, error: signErr } = await supabase.storage
          .from('prescriptions')
          .createSignedUrl(uploadData.path, 60 * 60 * 24);

        return {
          success: true,
          previewUrl: dataUrl,
          storagePath: uploadData.path,
          signedUrl: !signErr && signedData?.signedUrl ? signedData.signedUrl : dataUrl,
        };
      }
    } catch (e: any) {
      console.warn('Supabase prescription upload note:', e?.message);
    }
  }

  // Resilient fallback: return base64 preview
  return {
    success: true,
    previewUrl: dataUrl,
    signedUrl: dataUrl,
  };
};
