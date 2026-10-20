'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Check, ShieldAlert } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  targetName: string;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  targetName,
  onClose,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('টাকা চাওয়া হয়েছে');
  const [isReported, setIsReported] = useState(false);

  if (!isOpen) return null;

  const reasons = [
    'টাকা বা আর্থিক সুবিধা দাবি করা হয়েছে',
    'ভুয়া বা মনগড়া রক্তের অনুরোধ',
    'অনৈতিক আচরণ বা হয়রানি',
    'ভুল তথ্য বা ভুল ঠিকানা',
    'অন্যান্য অনিয়ম',
  ];

  const handleSubmit = () => {
    setIsReported(true);
    setTimeout(() => {
      setIsReported(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EB]">
          <div className="flex items-center gap-2 text-[#BA1A1A]">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold text-sm text-[#1B1B1F]">অভিযোগ বা অনিয়ম জানান</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#5B5F6B] hover:bg-[#F7F7F9]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isReported ? (
          <div className="py-4 text-center space-y-2">
            <span className="w-12 h-12 rounded-full bg-[#E8F5E9] text-[#00744B] flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </span>
            <h4 className="font-bold text-sm text-[#1B1B1F]">ধন্যবাদ, আমরা বিষয়টি দেখছি।</h4>
            <p className="text-xs text-[#5B5F6B]">
              আমাদের সেফটি টিম দ্রুত পদক্ষেপ গ্রহণ করবে এবং প্রয়োজনে সংশ্লিষ্ট অ্যাকাউন্ট স্থগিত করা হবে।
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-[#5B5F6B]">
              <strong className="text-[#1B1B1F]">{targetName}</strong>-এর বিরুদ্ধে রিপোর্ট করার সুনির্দিষ্ট কারণ নির্বাচন করুন:
            </p>

            <div className="space-y-2">
              {reasons.map((r) => (
                <label
                  key={r}
                  onClick={() => setSelectedReason(r)}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs cursor-pointer transition-all ${
                    selectedReason === r
                      ? 'bg-[#FFDAD6]/40 border-[#BA1A1A] font-bold text-[#BA1A1A]'
                      : 'bg-[#F7F7F9] border-[#E4E6EB] text-[#1B1B1F]'
                  }`}
                >
                  <input
                    type="radio"
                    name="report_reason"
                    checked={selectedReason === r}
                    onChange={() => setSelectedReason(r)}
                    className="accent-[#C41E3A]"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full h-11 rounded-2xl bg-[#BA1A1A] hover:bg-[#93000A] text-white font-bold text-xs shadow-xs"
            >
              রিপোর্ট জমা দিন
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
