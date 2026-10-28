import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, AlertTriangle, ShieldCheck, Heart } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ব্যবহারের শর্তাবলী (Terms of Service) | রক্তদাতা (Roktodata)',
  description: 'রক্তদাতা প্ল্যাটফর্মের ব্যবহারের নিয়মাবলী, রক্তদানে মানবিক শর্তাবলী এবং আইনি দায়মুক্তি নীতিমালা।',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#F7F7F9] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-[#E4E6EB] p-6 sm:p-10 shadow-xs">
        
        {/* Navigation & Header */}
        <div className="mb-6 flex items-center justify-between border-b border-[#E4E6EB] pb-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-[#C41E3A] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>মূল পাতায় ফিরে যান</span>
          </Link>
          <span className="text-xs text-[#8E929E]">সর্বশেষ আপডেট: অক্টোবর ২০২৬</span>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B1B1F]">
              ব্যবহারের শর্তাবলী (Terms of Service)
            </h1>
            <p className="text-xs sm:text-sm text-[#5B5F6B]">
              রক্তদাতা প্ল্যাটফর্ম ব্যবহারের নিয়মাবলী ও আইনি নীতিমালা
            </p>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-6 text-sm text-[#1B1B1F] leading-relaxed">
          
          <section className="bg-[#FFF5F6] p-5 rounded-2xl border border-[#FFDAD6]">
            <h2 className="text-base font-bold text-[#9E0027] mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>১. রক্ত সম্পূর্ণ বিনামূল্যে — কোনো আর্থিক লেনদেন নিষিদ্ধ</span>
            </h2>
            <p className="text-xs sm:text-sm font-medium">
              রক্ত একটি অমূল্য মানবীয় উপহার। রক্তদাতা প্ল্যাটফর্মে রক্তের জন্য অর্থ দাবি করা, বিক্রয় করা বা মধ্যস্থতার নামে টাকা চাওয়া আইনত দণ্ডনীয় অপরাধ। এমন কোনো অভিযোগ প্রমাণিত হলে ব্যবহারকারীর অ্যাকাউন্ট তাৎক্ষণিক স্থায়ীভাবে নিষিদ্ধ করা হবে এবং আইন প্রয়োগকারী সংস্থাকে রিপোর্ট করা হবে।
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#1B1B1F]">২. আবেদনকারীর দায়িত্ব ও সত্যনিষ্ঠ তথ্য</h2>
            <p className="text-[#5B5F6B]">
              রক্তের আবেদন পোস্ট করার সময় অবশ্যই সঠিক হাসপাতাল, ওয়ার্ড/কেবিন এবং চিকিৎসকের প্রেসক্রিপশন বা রেফারেন্স প্রদান করতে হবে। উদ্দেশ্যপ্রণোদিত মিথ্যা বা কাল্পনিক রক্তের অনুরোধ প্রেরণ কঠোরভাবে নিষিদ্ধ।
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#1B1B1F]">৩. চিকিৎসা পরামর্শ দায়মুক্তি (Medical Disclaimer)</h2>
            <p className="text-[#5B5F6B]">
              রক্তদাতা প্ল্যাটফর্ম কোনো হাসপাতাল বা চিকিৎসা প্রতিষ্ঠান নয়। প্ল্যাটফর্মে প্রদর্শিত রক্তের প্রাপ্যতা, ডোনার প্রোফাইল বা স্বাস্থ্য তথ্য কোনো পেশাদার চিকিৎসা পরামর্শ নয়। রক্তগ্রহণের পূর্বে অনুমোদিত সরকারি বা নিবন্ধিত ল্যাবরেটরিতে বাধ্যতামূলকভাবে রক্তের ক্রস-ম্যাচিং এবং স্ক্রিনিং টেস্ট (এইচআইভি, হেপাটাইটিস বি ও সি, সিফিলিস, ম্যালেরিয়া) সম্পন্ন করার দায়িত্ব রোগী ও রক্তদাতার।
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#1B1B1F]">৪. আচরণবিধি ও অ্যান্টি-হ্যারাসমেন্ট</h2>
            <p className="text-[#5B5F6B]">
              রক্তদাতা বা গ্রহীতার সাথে ইন-অ্যাপ চ্যাট বা ফোনে যেকোনো প্রকার অশালীন বার্তা, হুমকি, যৌন হয়রানি বা অসম্মানজনক আচরণ শূন্য সহনশীলতার (Zero Tolerance) অন্তর্ভুক্ত।
            </p>
          </section>

          <section className="pt-2 border-t border-[#E4E6EB]">
            <p className="text-xs text-[#8E929E]">
              রক্তদাতা প্ল্যাটফর্ম ব্যবহারের মাধ্যমে আপনি এই সকল শর্তাবলী মেনে নিতে সম্মত হচ্ছেন।
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
