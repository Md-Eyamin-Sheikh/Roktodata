'use client';

import React from 'react';
import { X, ShieldCheck, Check, Hospital, Users, Smartphone } from 'lucide-react';

interface VerificationExplainerSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VerificationExplainerSheet: React.FC<VerificationExplainerSheetProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E6EB]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#D9E2FF] text-[#0D58C9] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-[16px] text-[#1B1B1F]">ভেরিফায়েড ব্যাজ: এই চিহ্নের মানে কী?</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5B5F6B] hover:bg-[#F7F7F9]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#5B5F6B] leading-relaxed">
          আস্থা ও নিরাপত্তার স্বার্থে রক্তদাতা প্ল্যাটফর্মে ৩টি স্তরে তথ্য কঠোরভাবে যাচাই করা হয়:
        </p>

        <div className="space-y-3 text-xs">
          {/* Level 1 */}
          <div className="p-3 bg-[#F7F7F9] rounded-2xl flex items-start gap-3 border border-[#E4E6EB]/60">
            <div className="w-8 h-8 rounded-xl bg-[#E8F5E9] text-[#00744B] flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-[#1B1B1F]">১. ফোন ও ওটিপি যাচাইকৃত ব্যবহারকারী</h4>
              <p className="text-[11px] text-[#5B5F6B] mt-0.5 leading-snug">
                অ্যাপের প্রতিটি সদস্য ৬-সংখ্যার বায়োমেট্রিক ওটিপি দ্বারা ভেরিফাইড। কোনো ভুয়া বা স্প্যাম অ্যাকাউন্টের সুযোগ নেই।
              </p>
            </div>
          </div>

          {/* Level 2 */}
          <div className="p-3 bg-[#D9E2FF]/30 rounded-2xl flex items-start gap-3 border border-[#D9E2FF]">
            <div className="w-8 h-8 rounded-xl bg-[#0D58C9] text-white flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-[#001946]">২. প্রতিষ্ঠান-যাচাইকৃত ডোনার (নীল ব্যাজ)</h4>
              <p className="text-[11px] text-[#5B5F6B] mt-0.5 leading-snug">
                সন্ধানী, রেড ক্রিসেন্ট বা স্বীকৃত ব্লাড ডোনার ক্লাবের ক্যাম্পেইনে সশরীরে অংশ নেওয়া পরীক্ষিত রক্তদাতা।
              </p>
            </div>
          </div>

          {/* Level 3 */}
          <div className="p-3 bg-[#FDECEF] rounded-2xl flex items-start gap-3 border border-[#FFDADA]">
            <div className="w-8 h-8 rounded-xl bg-[#C41E3A] text-white flex items-center justify-center shrink-0">
              <Hospital className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-[#9E0027]">৩. হাসপাতাল-যাচাইকৃত জরুরি কেস</h4>
              <p className="text-[11px] text-[#5B5F6B] mt-0.5 leading-snug">
                চিকিৎসকের প্রেসক্রিপশন বা রক্তের রিকুইজিশন ফর্ম সংযুক্ত অনুরোধ, যা হাসপাতাল রেজিস্ট্রি দ্বারা অনুমোদিত।
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full h-11 rounded-2xl bg-[#0D58C9] text-white font-bold text-xs"
        >
          বুঝেছি, ধন্যবাদ
        </button>
      </div>
    </div>
  );
};
