'use client';

import React from 'react';
import { Droplet, Phone, ShieldCheck, Heart, Building2, Truck, ExternalLink } from 'lucide-react';
import { NavTab } from './BottomNav';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface FooterProps {
  onTabChange?: (tab: NavTab) => void;
  onRequestBloodClick?: () => void;
  onOpenHospitalDirectory?: () => void;
  onOpenAmbulanceDirectory?: () => void;
  onOpenHealthEducation?: () => void;
  onOpenHospitalDashboard?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onTabChange,
  onRequestBloodClick,
  onOpenHospitalDirectory,
  onOpenAmbulanceDirectory,
  onOpenHealthEducation,
  onOpenHospitalDashboard,
}) => {
  const { language, t, formatDigits } = useLanguage();

  return (
    /* Strictly hidden on mobile phones (<768px), visible ONLY on tablets, laptops, and desktop computers */
    <footer className="hidden md:block w-full bg-white border-t border-[#E4E6EB] text-[#5B5F6B] mt-auto">
      <div className="max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand & Purpose Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#BA1A1A] flex items-center justify-center text-white shadow-xs">
                <Droplet className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-[#1B1B1F] tracking-tight">
                  {t.common.appName}
                </span>
                <span className="text-[10px] block font-semibold text-[#BA1A1A] tracking-wider uppercase">
                  {t.common.appTagline}
                </span>
              </div>
            </div>
            <p className="text-xs text-[#5B5F6B] leading-relaxed">
              {language === 'bn'
                ? 'জরুরি রক্তের সন্ধানে নির্ভরযোগ্য, নিরাপদ ও স্বেচ্ছাসেবী প্ল্যাটফর্ম। মানবিক মূল্যবোধ ও পারস্পরিক সহযোগিতায় মানুষের জীবন বাঁচানোই আমাদের মূল লক্ষ্য।'
                : 'A dependable, secure, and voluntary platform for emergency blood requests. Protecting lives through compassion and community support.'}
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[#005938] text-[11px] font-semibold border border-[#C8E6C9]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {language === 'bn' ? '১০০% অলাভজনক ও মানবিক উদ্যোগ' : '100% Non-Profit & Voluntary'}
              </span>
            </div>
          </div>

          {/* Quick Access Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B1B1F] mb-3.5">
              {language === 'bn' ? 'দ্রুত নেভিগেশন' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onTabChange?.('home')}
                  className="hover:text-[#BA1A1A] transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <span className="w-1 h-1 rounded-full bg-[#BA1A1A]"></span>
                  {t.nav.home}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange?.('requests')}
                  className="hover:text-[#BA1A1A] transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <span className="w-1 h-1 rounded-full bg-[#BA1A1A]"></span>
                  {t.nav.requestsLong}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange?.('donors')}
                  className="hover:text-[#BA1A1A] transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <span className="w-1 h-1 rounded-full bg-[#BA1A1A]"></span>
                  {t.nav.donorsLong}
                </button>
              </li>
              <li>
                <button
                  onClick={onRequestBloodClick}
                  className="hover:text-[#BA1A1A] font-semibold text-[#BA1A1A] transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <span className="w-1 h-1 rounded-full bg-[#BA1A1A]"></span>
                  {t.nav.emergencyAction}
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency & Health Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B1B1F] mb-3.5">
              {language === 'bn' ? 'জরুরি স্বাস্থ্য সেবা' : 'Emergency Health Services'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenHospitalDirectory}
                  className="hover:text-[#BA1A1A] transition-colors flex items-center gap-2 text-left cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#0D58C9]" />
                  {language === 'bn' ? 'হাসপাতাল ও ব্লাড ব্যাংক' : 'Hospitals & Blood Banks'}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAmbulanceDirectory}
                  className="hover:text-[#BA1A1A] transition-colors flex items-center gap-2 text-left cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5 text-[#BA1A1A]" />
                  {language === 'bn' ? 'জরুরি অ্যাম্বুলেন্স সেবা' : 'Emergency Ambulance'}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenHealthEducation}
                  className="hover:text-[#BA1A1A] transition-colors flex items-center gap-2 text-left cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 text-[#00744B]" />
                  {language === 'bn' ? 'রক্তদানের নির্দেশিকা ও নিয়ম' : 'Blood Donation Guidelines'}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenHospitalDashboard}
                  className="hover:text-[#BA1A1A] transition-colors flex items-center gap-2 text-left cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#5B5F6B]" />
                  {language === 'bn' ? 'হাসপাতাল ইনভেন্টরি ড্যাশবোর্ড' : 'Hospital Stock Dashboard'}
                </button>
              </li>
            </ul>
          </div>

          {/* National Helplines & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B1B1F] mb-3.5">
              {language === 'bn' ? 'জাতীয় জরুরি হেল্পলাইন' : 'National Helplines'}
            </h4>
            <div className="space-y-2">
              <a
                href="tel:16263"
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F7F9] hover:bg-[#F0F2F5] transition-colors border border-[#E4E6EB]/60 group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#BA1A1A]/10 text-[#BA1A1A] flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1B1B1F]">{formatDigits('16263')}</div>
                    <div className="text-[10px] text-[#5B5F6B]">
                      {language === 'bn' ? 'স্বাস্থ্য বাতায়ন (২৪/৭)' : 'National Health Line (24/7)'}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-[#BA1A1A] group-hover:underline">
                  {language === 'bn' ? 'কল দিন' : 'Call'}
                </span>
              </a>

              <a
                href="tel:999"
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F7F9] hover:bg-[#F0F2F5] transition-colors border border-[#E4E6EB]/60 group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-black/10 text-[#1B1B1F] flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1B1B1F]">{formatDigits('999')}</div>
                    <div className="text-[10px] text-[#5B5F6B]">
                      {language === 'bn' ? 'জাতীয় জরুরি সেবা' : 'Emergency Services'}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-[#1B1B1F] group-hover:underline">
                  {language === 'bn' ? 'কল দিন' : 'Call'}
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Ethical Notice */}
        <div className="mt-8 pt-6 border-t border-[#E4E6EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#717684]">
          <p>
            © {formatDigits(2026)}{' '}
            <span className="font-semibold text-[#1B1B1F]">
              {language === 'bn' ? 'রক্তদাতা (Roktodata)' : 'Roktodata'}
            </span>
            . {language === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00744B]"></span>
              {language === 'bn' ? 'রক্ত কেনাবেচা আইনত দণ্ডনীয় অপরাধ' : 'Trading blood is strictly prohibited'}
            </span>
            <span>•</span>
            <span>{language === 'bn' ? 'গোপনীয়তা ও ব্যবহারের শর্তাবলী' : 'Privacy & Terms'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
