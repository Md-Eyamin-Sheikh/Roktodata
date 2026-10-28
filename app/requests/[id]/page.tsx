import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { initialEmergencyRequests } from '@/lib/data';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { EmergencyRequest, BloodGroup } from '@/lib/types';
import {
  Droplet,
  MapPin,
  Clock,
  Phone,
  Hospital,
  ShieldCheck,
  Share2,
  ArrowLeft,
  AlertTriangle,
  User,
  Heart,
} from 'lucide-react';
import { toBengaliDigits } from '@/lib/bengali-utils';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getRequestData(id: string): Promise<EmergencyRequest | null> {
  // Check static / initial emergency requests first
  const localMatch = initialEmergencyRequests.find((r) => r.id === id);
  if (localMatch) return localMatch;

  // Query Supabase server-side
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let query = (supabase as any).from('emergency_requests').select('*');
      if (isUuid) {
        query = query.eq('id', id);
      } else {
        query = query.ilike('id', `%${id}%`);
      }

      const { data, error } = await query.single();
      if (!error && data) {
        return {
          id: data.id,
          bloodGroup: data.blood_group as BloodGroup,
          bagsNeeded: data.bags_needed,
          bagsFulfilled: data.bags_fulfilled || 0,
          componentType: data.component_type || 'whole',
          hospitalName: data.hospital_name,
          location: data.district,
          division: data.division,
          district: data.district,
          distanceKm: 2.1,
          urgency: data.urgency as any,
          urgencyLabel: data.urgency === 'now' ? 'এখনই লাগবে' : 'আজকের মধ্যে',
          patientName: data.patient_name || 'জরুরি রোগী',
          patientRelation: data.patient_relation || 'আত্মীয়',
          reason: data.reason || 'জরুরি রক্তের আবেদন',
          contactNumber: data.contact_phone,
          status: data.status || 'open',
          timeTarget: data.time_target || 'জরুরি',
          createdAt: new Date(data.created_at).toLocaleDateString('bn-BD'),
          hasVerifiedHospital: true,
          isCaseVerified: true,
          trackingStep: data.tracking_step || 1,
          respondingDonorsCount: 0,
        };
      }
    } catch (e) {
      console.warn('Server fetchRequestById error:', e);
    }
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const req = await getRequestData(id);

  if (!req) {
    return {
      title: 'রক্তের অনুরোধ পাওয়া যায়নি | রক্তদাতা',
    };
  }

  const title = `🚨 জরুরি ${req.bloodGroup} রক্ত প্রয়োজন | ${req.hospitalName}, ${req.district}`;
  const description = `${req.patientName}-এর জন্য জরুরি ভিত্তিতে ${toBengaliDigits(req.bagsNeeded)} ব্যাগ ${req.bloodGroup} রক্ত প্রয়োজন (${req.urgencyLabel})। রক্ত দিয়ে জীবন বাঁচান।`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://roktodata.org/requests/${id}`,
      siteName: 'রক্তদাতা (Roktodata)',
      images: [
        {
          url: 'https://roktodata.org/og-blood-request.png',
          width: 1200,
          height: 630,
          alt: `জরুরি রক্তদান - ${req.bloodGroup}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function RequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const req = await getRequestData(id);

  if (!req) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F7F7F9] py-6 px-3 sm:px-4 md:px-6">
      <div className="max-w-2xl mx-auto space-y-4">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/?tab=requests"
            className="flex items-center gap-1.5 text-xs font-bold text-[#5B5F6B] hover:text-[#C41E3A] bg-white px-3 py-1.5 rounded-full border border-[#E4E6EB] shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>সকল অনুরোধে ফিরুন</span>
          </Link>

          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FDECEF] text-[#C41E3A]">
            🚨 জরুরি লাইভ অনুরোধ
          </span>
        </div>

        {/* Giant Emergency Request Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-[#FFDAD9] relative overflow-hidden space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#9E0027] to-[#C41E3A] text-white flex flex-col items-center justify-center shadow-md shrink-0">
                <span className="text-3xl sm:text-4xl font-black leading-none">{req.bloodGroup}</span>
                <span className="text-[9px] uppercase tracking-wider font-extrabold opacity-90 mt-1">
                  {req.componentType === 'platelets' ? 'প্লাটিলেট' : 'রক্ত'}
                </span>
              </div>

              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#C41E3A] uppercase tracking-wider bg-[#FDECEF] px-2.5 py-0.5 rounded-md mb-1">
                  <Clock className="w-3 h-3" />
                  {req.urgencyLabel}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-[#1B1B1F] leading-tight">
                  {toBengaliDigits(req.bagsNeeded)} ব্যাগ {req.bloodGroup} রক্ত প্রয়োজন
                </h1>
                <p className="text-xs text-[#5B5F6B] mt-0.5">
                  রোগী: <strong className="text-[#1B1B1F]">{req.patientName}</strong> ({req.patientRelation})
                </p>
              </div>
            </div>
          </div>

          {/* Hospital & Location Specs */}
          <div className="bg-[#FAF9FB] rounded-2xl p-4 sm:p-5 border border-[#E4E6EB] space-y-3 text-xs sm:text-sm">
            <div className="flex items-start gap-2.5">
              <Hospital className="w-4 h-4 text-[#C41E3A] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-[#5B5F6B] block">হাসপাতাল / স্থান:</span>
                <span className="font-bold text-[#1B1B1F]">{req.hospitalName}</span>
                <span className="text-xs text-[#5B5F6B] block">{req.wardBed || `${req.district} সদর`}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-[#E4E6EB]/60">
              <MapPin className="w-4 h-4 text-[#C41E3A] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-[#5B5F6B] block">জেলা ও বিভাগ:</span>
                <span className="font-bold text-[#1B1B1F]">{req.district}, {req.division}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-[#E4E6EB]/60">
              <AlertTriangle className="w-4 h-4 text-[#E65100] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-[#5B5F6B] block">রক্তের প্রয়োজনীয় কারণ:</span>
                <span className="font-bold text-[#1B1B1F]">{req.reason}</span>
              </div>
            </div>
          </div>

          {/* Medical Disclaimer Banner */}
          <div className="p-3 bg-[#FFF5F6] rounded-xl border border-[#FFDAD6] text-[11px] text-[#9E0027] leading-relaxed">
            <strong>জরুরি সতর্কতা:</strong> রক্ত সম্পূর্ণ বিনামূল্যে স্বেচ্ছায় দান করা হয়। রক্তের বিনিময়ে কোনো টাকা বা উপহার আদান-প্রদান দণ্ডনীয় অপরাধ। রক্তগ্রহণের পূর্বে অনুমোদিত ল্যাবরেটরিতে ক্রস-ম্যাচিং ও স্ক্রিনিং টেস্ট নিশ্চিত করুন।
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={`tel:${req.contactNumber}`}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-[#9E0027] to-[#C41E3A] hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>সরাসরি কল দিন ({req.contactNumber})</span>
            </a>

            <Link
              href={`/?tab=requests&request=${req.id}`}
              className="flex-1 h-12 rounded-2xl bg-[#00744B] hover:bg-[#005938] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all text-center"
            >
              <Heart className="w-4 h-4" />
              <span>রক্তদাতা অ্যাপে সাড়া দিন</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
