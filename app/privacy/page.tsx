import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, Eye, Trash2, Bell, MapPin, Phone } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'প্রাইভেসি পলিসি (Privacy Policy) | রক্তদাতা (Roktodata)',
  description: 'রক্তদাতা প্ল্যাটফর্মের গোপনীয়তা নীতি, ব্যক্তিগত তথ্যের সুরক্ষা এবং লোকেশন ও ফোন নম্বর ব্যবহারের শর্তাবলী।',
};

export default function PrivacyPolicyPage() {
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
          <span className="text-xs text-[#8E929E]">সর্বশেষ পরিমার্জন: অক্টোবর ২০২৬</span>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B1B1F]">
              গোপনীয়তা নীতি (Privacy Policy)
            </h1>
            <p className="text-xs sm:text-sm text-[#5B5F6B]">
              রক্তদাতা (Roktodata) প্ল্যাটফর্মে আপনার ব্যক্তিগত তথ্যের সর্বোচ্চ নিরাপত্তা ও সুরক্ষা প্রতিশ্রুতি
            </p>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-6 text-sm text-[#1B1B1F] leading-relaxed">
          
          <section className="bg-[#FAF9FB] p-5 rounded-2xl border border-[#E4E6EB]/80">
            <h2 className="text-base font-bold text-[#C41E3A] mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>১. আমাদের মৌলিক নীতি ও উদ্দেশ্য</span>
            </h2>
            <p>
              রক্তদাতা (Roktodata) একটি সম্পূর্ণ অলাভজনক, উন্মুক্ত ও মানবিক রক্তদান সহায়তা প্ল্যাটফর্ম। আমরা কোনো অবস্থাতেই আপনার ব্যক্তিগত তথ্য বাণিজ্যিক উদ্দেশ্যে বিক্রয়, ভাড়া বা বিজ্ঞাপনদাতার কাছে হস্তান্তর করি না। প্ল্যাটফর্মের একমাত্র উদ্দেশ্য হলো জরুরি রক্তের প্রয়োজনে রক্তগ্রহীতা এবং স্বেচ্ছাসেবী রক্তদাতার মধ্যে সংযোগ স্থাপন করা।
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#1B1B1F] flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#C41E3A]" />
              <span>২. ফোন নম্বর ও যোগাযোগের তথ্যের ব্যবহার</span>
            </h2>
            <p>
              নিরাপত্তা এবং অযাচিত স্প্যাম কল প্রতিরোধের জন্য আমাদের প্ল্যাটফর্মে কঠোর সুরক্ষানীতি কার্যকর:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#5B5F6B]">
              <li>রক্তদাতার মোবাইল নম্বর কোনো উন্মুক্ত পাবলিক ডিরেক্টরিতে অবাধে প্রদর্শিত হয় না।</li>
              <li>শুধুমাত্র যাচাইকৃত জরুরি রক্তের অনুরোধে যখন কোনো রক্তদাতা স্বেচ্ছায় সাড়া (Response) দেন বা গ্রহীতা অনুরোধ করেন, তখনই জরুরি যোগাযোগের সুবিধার্থে নম্বর প্রদর্শিত হয়।</li>
              <li>রক্তদানের কাজ সম্পন্ন হলে বা অনুরোধ ক্লোজ হলে যোগাযোগের তথ্য আর দৃশ্যমান থাকে না।</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#1B1B1F] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C41E3A]" />
              <span>৩. লোকেশন (Location) তথ্যের ব্যবহার</span>
            </h2>
            <p>
              রোগীর নিকটস্থ রক্তদাতা খুঁজে বের করার উদ্দেশ্যে ব্যবহারকারীর বিভাগ, জেলা এবং নিকটস্থ হাসপাতাল/উপজেলা নির্বাচন আবশ্যক। ব্যবহারকারীর সম্মতিক্রমে ডিভাইস লোকেশন শুধুমাত্র নিকটবর্তী হাসপাতাল দূরত্বের হিসাব করার জন্য একবারের জন্য ব্যবহার হতে পারে। আমরা কোনো ধরনের ব্যাকগ্রাউন্ড ট্র্যাকিং বা লাইভ লোকেশন মনিটর করি না।
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#1B1B1F] flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#C41E3A]" />
              <span>৪. পুশ নোটিফিকেশন ও ব্রাউজার ডিভাইস টোকেন</span>
            </h2>
            <p>
              আপনার এলাকায় জরুরি রক্তের ডাক পৌঁছানোর জন্য W3C Web Push Notification প্রযুক্তি এবং VAPID এনক্রিপশন ব্যবহার করা হয়। ব্রাউজার থেকে যেকোনো সময় বিজ্ঞপ্তি বন্ধ করা যায়, এবং আনসাবস্ক্রাইব করার সাথে সাথেই সার্ভার থেকে ডিভাইসের টোকেন মুছে ফেলা হয়।
            </p>
          </section>

          <section className="bg-[#FFF5F6] p-5 rounded-2xl border border-[#FFDAD6] space-y-2">
            <h2 className="text-base font-bold text-[#9E0027] flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>৫. অ্যাকাউন্ট ও ডেটা মুছে ফেলার অধিকার (Right to Erasure / GDPR)</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#1B1B1F]">
              যেকোনো নিবন্ধিত ব্যবহারকারী চাইলে যেকোনো মুহূর্তে তাদের অ্যাকাউন্ট, ফোন নম্বর ও সকল অ্যাক্টিভিটি ডেটা স্থায়ীভাবে মুছে ফেলতে পারেন:
            </p>
            <ul className="list-disc pl-5 text-xs text-[#5B5F6B] space-y-1">
              <li>অ্যাপের Settings স্ক্রিনে গিয়ে এক ক্লিকে &quot;অ্যাকাউন্ট ও সব ডেটা মুছে ফেলুন&quot; অপশন ব্যবহার করতে পারেন।</li>
              <li>অথবা আমাদের ডেটা ডিলিশন পেজে গিয়ে আবেদন করতে পারেন: <Link href="/data-deletion" className="text-[#C41E3A] font-bold underline">Data Deletion Instructions</Link></li>
            </ul>
          </section>

          <section className="space-y-2 pt-2 border-t border-[#E4E6EB]">
            <h2 className="text-base font-bold text-[#1B1B1F]">যোগাযোগ</h2>
            <p className="text-xs text-[#5B5F6B]">
              গোপনীয়তা নীতি সম্পর্কিত যেকোনো জিজ্ঞাসা বা ডেটা সুরক্ষার বিষয়ে আমাদের সাথে যোগাযোগ করুন: <a href="mailto:privacy@roktodata.org" className="text-[#C41E3A] font-bold">privacy@roktodata.org</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
