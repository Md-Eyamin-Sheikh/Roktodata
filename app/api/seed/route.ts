import { NextResponse } from 'next/server';
import { ensureDbSeeded } from '@/lib/db-service';

export async function POST() {
  try {
    await ensureDbSeeded();
    return NextResponse.json({
      success: true,
      message: 'ডেটাবেস সফলভাবে সীড ও প্রস্তুত করা হয়েছে। অপ্রয়োজনীয় ডেটা রিমুভ করে প্রয়োজনীয় ডেটা সক্রিয় আছে।',
    });
  } catch (error) {
    console.error('API /api/seed error:', error);
    return NextResponse.json(
      { success: false, error: 'ডেটাবেস সীড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
