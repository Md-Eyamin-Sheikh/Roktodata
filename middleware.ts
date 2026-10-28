import { NextResponse, type NextRequest } from 'next/server';

// In-memory rate limiting map for API routes
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 120; // 120 requests per minute per IP
const MAX_API_POST_PER_WINDOW = 30; // 30 POSTs per minute per IP

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Immediately skip all internal Next.js paths (_next, _not-found, _document, etc.)
  if (pathname.startsWith('/_')) {
    return NextResponse.next();
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  // Rate Limiting for API routes
  if (pathname.startsWith('/api/')) {
    const now = Date.now();
    const isWrite = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method);
    const limit = isWrite ? MAX_API_POST_PER_WINDOW : MAX_REQUESTS_PER_WINDOW;

    const rateKey = `${ip}:${isWrite ? 'write' : 'read'}`;
    const rateData = ipRequestCounts.get(rateKey);

    if (rateData && now < rateData.resetTime) {
      if (rateData.count >= limit) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error:
              'অতিরিক্ত অনুরোধ পাঠানো হয়েছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন (Rate Limit Exceeded)।',
            code: 'RATE_LIMIT_EXCEEDED',
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Retry-After': '60',
            },
          }
        );
      }
      rateData.count++;
    } else {
      ipRequestCounts.set(rateKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    }

    if (ipRequestCounts.size > 10000) {
      for (const [k, v] of ipRequestCounts.entries()) {
        if (now > v.resetTime) ipRequestCounts.delete(k);
      }
    }
  }

  // Security Headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self)'
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)',
  ],
};
