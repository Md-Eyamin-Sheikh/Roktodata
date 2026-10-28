import React from 'react';
import Link from 'next/link';
import { Trash2, ArrowLeft, ShieldCheck, CheckCircle, Mail } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'অ্যাকাউন্ট ও ডেটা মুছে ফেলার নির্দেশিকা (Data Deletion Instructions) | রক্তদাতা',
  description: 'Facebook, Google এবং রক্তদাতা অ্যাকাউন্ট থেকে ব্যক্তিগত তথ্য মুছে ফেলার সহজ ও নিরাপদ উপায়।',
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F9] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-[#E4E6EB] p-6 sm:p-10 shadow-xs">
        
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between border-b border-[#E4E6EB] pb-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-[#C41E3A] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>মূল পাতায় ফিরে যান</span>
          </Link>
          <span className="text-xs text-[#8E929E]">GDPR & Meta Compliance</span>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B1B1F]">
              ডেটা ও অ্যাকাউন্ট মুছে ফেলা (Data Deletion)
            </h1>
            <p className="text-xs sm:text-sm text-[#5B5F6B]">
              রক্তদাতা প্ল্যাটফর্ম থেকে আপনার সম্পূর্ণ ব্যক্তিগত তথ্য মুছে ফেলার নির্দেশিকা
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-[#1B1B1F] leading-relaxed">
          <p>
            Facebook Platform Terms এবং Google User Data Policy অনুযায়ী, যেকোনো ব্যবহারকারী রক্তদাতা (Roktodata) অ্যাপ্লিকেশন থেকে তাদের নাম, ফোন নম্বর, প্রোফাইল ছবি এবং সম্পর্কিত সমস্ত ডেটা মুছে ফেলার পূর্ণ অধিকার সংরক্ষণ করেন।
          </p>

          <div className="bg-[#FAF9FB] p-5 rounded-2xl border border-[#E4E6EB] space-y-3">
            <h2 className="font-bold text-base text-[#1B1B1F] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#00744B]" />
              <span>পদ্ধতি ১: অ্যাপ সেটিংস থেকে তাৎক্ষণিক অটোমেটিক ডিলিশন (Instant Deletion)</span>
            </h2>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-[#5B5F6B]">
              <li>রক্তদাতা অ্যাপে লগইন করুন।</li>
              <li>নিচের নেভিগেশন বার থেকে <strong>প্রোফাইল</strong> বা <strong>সেটিংস</strong> এ যান।</li>
              <li>নিচে স্ক্রোল করে <strong>&quot;অ্যাকাউন্ট ও সব ডেটা মুছে ফেলুন&quot;</strong> বাটনে চাপ দিন।</li>
              <li>নিশ্চিতকরণ পপআপে সম্মত হলে আপনার প্রোফাইল, ফোন নম্বর ও পুশ টোকেন তাৎক্ষণিকভাবে ডেটাবেস থেকে স্থায়ীভাবে ডিলিট হয়ে যাবে।</li>
            </ol>
          </div>

          <div className="bg-[#FAF9FB] p-5 rounded-2xl border border-[#E4E6EB] space-y-3">
            <h2 className="font-bold text-base text-[#1B1B1F] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#00744B]" />
              <span>পদ্ধতি ২: ফেসবুক বা গুগল অ্যাপ সেটিংস থেকে ডেটা অপসারণ</span>
            </h2>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-[#5B5F6B]">
              <li>আপনার Facebook অ্যাকাউন্টের Settings &amp; Privacy &gt; Settings &gt; <strong>Apps and Websites</strong>-এ প্রবেশ করুন।</li>
              <li>সেখানে <strong>রক্তদাতা (Roktodata)</strong> অ্যাপটি নির্বাচন করে Remove বাটনে চাপ দিন।</li>
              <li>আপনি ডেটা ডিলিশন রিকোয়েস্ট পাঠালে আমাদের সার্ভার স্বয়ংক্রিয়ভাবে একটি কনফার্মেশন কোড তৈরি করবে।</li>
            </ol>
          </div>

          <div className="bg-[#FFF5F6] p-5 rounded-2xl border border-[#FFDAD6] space-y-2">
            <h2 className="font-bold text-sm text-[#9E0027] flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>ম্যানুয়াল ডিলিশন রিকোয়েস্ট (ইমেইলের মাধ্যমে)</span>
            </h2>
            <p className="text-xs text-[#5B5F6B]">
              আপনি যদি কোনো কারণে লগইন করতে না পারেন, তবে আপনার নিবন্ধিত মোবাইল নম্বর বা ইমেইল উল্লেখ করে সরাসরি আমাদের ডাটা সুরক্ষা কর্মকর্তার কাছে ইমেইল পাঠাতে পারেন:
            </p>
            <div className="pt-1 font-mono text-xs text-[#C41E3A] font-bold">
              privacy@roktodata.org (বিষয়: Account &amp; Data Deletion Request)
            </div>
            <p className="text-[11px] text-[#8E929E]">
              ইমেইল প্রাপ্তির ৪৮ ঘণ্টার মধ্যে আপনার সমস্ত তথ্য স্থায়ীভাবে মুছে ফেলা হবে এবং কনফার্মেশন পাঠানো হবে।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
