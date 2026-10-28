'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Global Application Error:', error);
  }, [error]);

  return (
    <html lang="bn">
      <body className="min-h-screen bg-[#F7F7F9] flex flex-col items-center justify-center p-4 text-center font-sans">
        <div className="w-16 h-16 rounded-3xl bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center shadow-xs mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-[#1B1B1F] mb-2">
          একটি সিস্টেম ত্রুটি ঘটেছে
        </h1>

        <p className="text-sm text-[#5B5F6B] max-w-md mb-2 leading-relaxed">
          রক্তদাতা অ্যাপ্লিকেশনটি লোড করার সময় একটি ত্রুটি ঘটেছে। দয়া করে পেজটি রিফ্রেশ করুন অথবা হোমপেজে ফিরে যান।
        </p>

        {error.digest && (
          <span className="text-[11px] font-mono text-[#8E929E] bg-[#E4E6EB]/50 px-2 py-1 rounded-md mb-6">
            Error Reference: {error.digest}
          </span>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C41E3A] hover:bg-[#A3182F] text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>পুনরায় চেষ্টা করুন</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#F0EDF2] text-[#1B1B1F] border border-[#E4E6EB] font-bold text-sm shadow-2xs transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>হোমপেজে ফিরে যান</span>
          </Link>
        </div>
      </body>
    </html>
  );
}
