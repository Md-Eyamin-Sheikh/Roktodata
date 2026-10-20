const { createClient } = require('@supabase/supabase-js');

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const url = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!url || !anonKey) {
  console.error('Supabase URL or Key missing!');
  process.exit(1);
}

const supabase = createClient(url, anonKey);

async function seed() {
  console.log('====================================================');
  console.log('   SEEDING 15+ ROWS FOR SUPABASE DATABASE TABLES     ');
  console.log('====================================================');

  // 1. Seed hospitals_and_banks (16 records)
  const hospitalsData = [
    {
      name: 'ঢাকা মেডিকেল কলেজ হাসপাতাল (ঢামেক)',
      type: 'medical_college',
      division: 'ঢাকা',
      district: 'ঢাকা',
      address: 'বকশীবাজার, ঢাকা ১০০০',
      hotline: '01711000101',
      operating_hours: '২৪/৭ খোলা',
      is_verified: true,
    },
    {
      name: 'শহীদ জিয়াউর রহমান মেডিকেল কলেজ হাসপাতাল (শজিমেক)',
      type: 'medical_college',
      division: 'রাজশাহী',
      district: 'বগুড়া',
      address: 'সিল্ক সিটি বাইপাস রোড, কানুচগাড়ী, বগুড়া',
      hotline: '01713000102',
      operating_hours: '২৪/৭ খোলা',
      is_verified: true,
    },
    {
      name: 'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয় (BSMMU)',
      type: 'medical_college',
      division: 'ঢাকা',
      district: 'ঢাকা',
      address: 'শাহবাগ মোড়, ঢাকা ১০০০',
      hotline: '01711000103',
      operating_hours: '২৪/৭ খোলা',
      is_verified: true,
    },
    {
      name: 'বাংলাদেশ রেড ক্রিসেন্ট সোসাইটি কেন্দ্রীয় ব্লাড ব্যাংক',
      type: 'red_crescent',
      division: 'ঢাকা',
      district: 'ঢাকা',
      address: '৭/৫ ঔরঙ্গজেব রোড, মোহাম্মদপুর, ঢাকা',
      hotline: '01811000104',
      operating_hours: '২৪/৭ খোলা',
      is_verified: true,
    },
    {
      name: 'চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল (চমেক)',
      type: 'medical_college',
      division: 'চট্টগ্রাম',
      district: 'চট্টগ্রাম',
      address: 'কে বি ফজলুল কাদের রোড, পাঁচলাইশ, চট্টগ্রাম',
      hotline: '01819000105',
      operating_hours: '২৪/৭ খোলা',
      is_verified: true,
    },
    {
      name: 'রাজশাহী মেডিকেল কলেজ হাসপাতাল (রামেক)',
      type: 'medical_college',
      division: 'রাজশাহী',
      district: 'রাজশাহী',
      address: 'মেডিকেল কলেজ রোড, লক্ষ্মীপুর, রাজশাহী',
      hotline: '01712000106',
      operating_hours: '২৪/৭ খোলা',
      is_verified: true,
    },
    {
      name: 'সিলেট এম এ জি ওসমানী মেডিকেল কলেজ হাসপাতাল',
      type: 'medical_college',
      division: 'সিলেট',
      district: 'সিলেট',
      address: 'মেডিকেল রোড, কাজলশাহ, সিলেট',
      hotline: '01714000107',
      operating_hours: '২৪/৭ খোলা',
      is_verified: true,
    },
    {
      name: 'খুলনা মেডিকেল কলেজ হাসপাতাল (খুমেক)',
      type: 'medical_college',
      division: 'খুলনা',
      district: 'খুলনা',
      address: 'বয়রা, খুলনা',
      hotline: '01715000108',
      operating_hours: '২৪/৭ খোলা',
      is_verified: true,
    },
    {
      name: 'শেরেবাংলা মেডিকেল কলেজ হাসপাতাল (শেবাচিম)',
      type: 'medical_college',
      division: 'বরিশাল',
      district: 'বরিশাল',
      address: 'বান্দ রোড, বরিশাল',
      hotline: '01716000109',
      operating_hours: '২৪/৭ খোলা',
      is_verified: true,
    },
    {
      name: 'রংপুর মেডিকেল কলেজ হাসপাতাল (রমেক)',
      type: 'medical_college',
      division: 'রংপুর',
      district: 'রংপুর',
      address: 'ধাপ, জেল রোড, রংপুর',
      hotline: '01717000110',
      operating_hours: '২৪/৭ খোলা',
      is_verified: true,
    },
    {
      name: 'ময়মনসিংহ মেডিকেল কলেজ হাসপাতাল (মমেক)',
      type: 'medical_college',
      division: 'ময়মনসিংহ',
      district: 'ময়মনসিংহ',
      address: 'চরপাড়া মোড়, ময়মনসিংহ',
      hotline: '01718000111',
      operating_hours: '২৪/৭ খোলা',
      is_verified: true,
    },
    {
      name: 'রেড ক্রিসেন্ট ব্লাড সেন্টার, বগুড়া',
      type: 'red_crescent',
      division: 'রাজশাহী',
      district: 'বগুড়া',
      address: 'থানামোড়, জলেশ্বরীতলা, বগুড়া',
      hotline: '01722000112',
      operating_hours: 'সকাল ৮টা - রাত ১০টা',
      is_verified: true,
    },
    {
      name: 'কুমিল্লা মেডিকেল কলেজ হাসপাতাল',
      type: 'medical_college',
      division: 'চট্টগ্রাম',
      district: 'কুমিল্লা',
      address: 'কুচাইতলী, কুমিল্লা ৩৫০০',
      hotline: '01823000113',
      operating_hours: '২৪/৭ খোলা',
      is_verified: true,
    },
    {
      name: 'কক্সবাজার জেলা সদর হাসপাতাল',
      type: 'district_hospital',
      division: 'চট্টগ্রাম',
      district: 'কক্সবাজার',
      address: 'হাসপাতাল রোড, কক্সবাজার',
      hotline: '01834000114',
      operating_hours: '২৪/৭ খোলা',
      is_verified: true,
    },
    {
      name: 'যশোর জেনারেল ২৫০ শয্যা হাসপাতাল',
      type: 'district_hospital',
      division: 'খুলনা',
      district: 'যশোর',
      address: 'হাসপাতাল মোড়, যশোর',
      hotline: '01725000115',
      operating_hours: '২৪/৭ খোলা',
      is_verified: true,
    },
    {
      name: 'দিনাজপুর এম আব্দুর রহিম মেডিকেল কলেজ হাসপাতাল',
      type: 'medical_college',
      division: 'রংপুর',
      district: 'দিনাজপুর',
      address: 'দশমাইল রোড, দিনাজপুর',
      hotline: '01726000116',
      operating_hours: '২৪/৭ খোলা',
      is_verified: true,
    }
  ];

  console.log('1. Seeding hospitals_and_banks...');
  const { data: hospRes, error: hospErr } = await supabase.from('hospitals_and_banks').insert(hospitalsData).select();
  if (hospErr) console.warn('Hospitals insert error:', hospErr.message);
  else console.log('✅ Hospitals seeded:', hospRes?.length);

  // 2. Seed blood_inventory (20+ records)
  const { data: currentHospitals } = await supabase.from('hospitals_and_banks').select('id, name');
  if (currentHospitals && currentHospitals.length > 0) {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    const inventoryItems = [];

    currentHospitals.slice(0, 10).forEach((hosp, idx) => {
      // Add 2-3 blood groups per hospital
      const groups = [bloodGroups[idx % 8], bloodGroups[(idx + 3) % 8]];
      groups.forEach((bg) => {
        const units = Math.floor(Math.random() * 8) + 2;
        inventoryItems.push({
          hospital_id: hosp.id,
          blood_group: bg,
          units_available: units,
          status: units > 5 ? 'available' : units > 2 ? 'low' : 'critical',
          last_updated: new Date().toISOString()
        });
      });
    });

    console.log(`2. Seeding blood_inventory (${inventoryItems.length} records)...`);
    const { data: invRes, error: invErr } = await supabase.from('blood_inventory').insert(inventoryItems).select();
    if (invErr) console.warn('Blood inventory error:', invErr.message);
    else console.log('✅ Blood inventory seeded:', invRes?.length);
  }

  // 3. Seed emergency_requests (16 realistic records)
  const requestsData = [
    { blood_group: 'A+', bags_needed: 2, component_type: 'whole', hospital_name: 'শহীদ জিয়াউর রহমান মেডিকেল কলেজ (শজিমেক)', division: 'রাজশাহী', district: 'বগুড়া', location_detail: 'কানুচগাড়ী, সিল্ক সিটি বাইপাস', ward_number: '৪ (সার্জারি)', bed_number: '১২', urgency: 'now', time_target: 'এখনই লাগবে', patient_name: 'আহমেদ উল্লাহ', patient_relation: 'পিতা', reason: 'জরুরি বাইপাস সার্জারি', contact_phone: '01712345678', tracking_step: 2, status: 'active', has_verified_hospital: true },
    { blood_group: 'O+', bags_needed: 1, component_type: 'whole', hospital_name: 'ঢাকা মেডিকেল কলেজ হাসপাতাল', division: 'ঢাকা', district: 'ঢাকা', location_detail: 'বকশীবাজার', ward_number: '৮ (আইসিইউ)', bed_number: '০৩', urgency: 'now', time_target: '১ ঘণ্টার মধ্যে', patient_name: 'সালমা বেগম', patient_relation: 'মাতা', reason: 'সিজারিয়ান জটিলতা ও রক্তক্ষরণ', contact_phone: '01819223344', tracking_step: 1, status: 'active', has_verified_hospital: true },
    { blood_group: 'B+', bags_needed: 3, component_type: 'platelets', hospital_name: 'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয় (BSMMU)', division: 'ঢাকা', district: 'ঢাকা', location_detail: 'শাহবাগ', ward_number: 'হেমাটোলজি', bed_number: '২১', urgency: 'today', time_target: 'আজ বিকেল ৫টার মধ্যে', patient_name: 'তানভীর আহমেদ', patient_relation: 'ভাই', reason: 'ডেঙ্গু হেমোরেজিক প্লাটিলেট স্বল্পতা', contact_phone: '01912334455', tracking_step: 1, status: 'active', has_verified_hospital: true },
    { blood_group: 'O-', bags_needed: 2, component_type: 'whole', hospital_name: 'চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল (চমেক)', division: 'চট্টগ্রাম', district: 'চট্টগ্রাম', location_detail: 'পাঁচলাইশ', ward_number: 'জরুরি ওটি', bed_number: '০৫', urgency: 'now', time_target: 'অতি জরুরি', patient_name: 'মো: জয়নাল আবেদীন', patient_relation: 'চাচা', reason: 'সড়ক দুর্ঘটনা ও অভ্যন্তরীণ রক্তক্ষরণ', contact_phone: '01611223344', tracking_step: 3, status: 'active', has_verified_hospital: true },
    { blood_group: 'AB+', bags_needed: 1, component_type: 'whole', hospital_name: 'মোহাম্মদ আলী হাসপাতাল, বগুড়া', division: 'রাজশাহী', district: 'বগুড়া', location_detail: 'সদর রোড, বগুড়া', ward_number: 'মেডিসিন', bed_number: '০৯', urgency: 'today', time_target: 'আজকের মধ্যে', patient_name: 'নাসরিন সুলতানা', patient_relation: 'স্ত্রী', reason: 'থ্যালাসেমিয়া নিয়মিত রক্ত সঞ্চালন', contact_phone: '01715667788', tracking_step: 1, status: 'active', has_verified_hospital: true },
    { blood_group: 'A-', bags_needed: 2, component_type: 'whole', hospital_name: 'রাজশাহী মেডিকেল কলেজ হাসপাতাল', division: 'রাজশাহী', district: 'রাজশাহী', location_detail: 'লক্ষ্মীপুর মোড়', ward_number: 'কার্ডিওলজি', bed_number: '১৫', urgency: '24-48', time_target: 'আগামীকাল সকাল ১০টা', patient_name: 'রফিকুল ইসলাম', patient_relation: 'দাদা', reason: 'এনজিওগ্রাম পরবর্তী জটিলতা', contact_phone: '01728990011', tracking_step: 2, status: 'active', has_verified_hospital: true },
    { blood_group: 'B-', bags_needed: 1, component_type: 'plasma', hospital_name: 'সিলেট এম এ জি ওসমানী মেডিকেল কলেজ', division: 'সিলেট', district: 'সিলেট', location_detail: 'কাজলশাহ', ward_number: 'পোড়া ও প্লাস্টিক সার্জারি', bed_number: '০৭', urgency: 'now', time_target: 'জরুরিভাবে', patient_name: 'ফারহানা ইসলাম', patient_relation: 'বোন', reason: 'গুরুতর বার্ন ইনজুরি প্লাজমা থেরাপি', contact_phone: '01734556677', tracking_step: 1, status: 'active', has_verified_hospital: true },
    { blood_group: 'AB-', bags_needed: 1, component_type: 'whole', hospital_name: 'খুলনা মেডিকেল কলেজ হাসপাতাল', division: 'খুলনা', district: 'খুলনা', location_detail: 'বয়রা', ward_number: 'নিউরোলজি', bed_number: '০২', urgency: 'today', time_target: 'বিকেল ৪টা', patient_name: 'মিজানুর রহমান', patient_relation: 'সহকর্মী', reason: 'ব্রেন স্ট্রোক জরুরি অপারেশন', contact_phone: '01745667788', tracking_step: 1, status: 'active', has_verified_hospital: true },
    { blood_group: 'O+', bags_needed: 2, component_type: 'whole', hospital_name: 'শেরেবাংলা মেডিকেল কলেজ হাসপাতাল', division: 'বরিশাল', district: 'বরিশাল', location_detail: 'বান্দ রোড', ward_number: 'শিশু ওয়ার্ড', bed_number: '১৮', urgency: 'now', time_target: '২ ঘণ্টার মধ্যে', patient_name: 'আরাফাত হোসেন (৫ বছর)', patient_relation: 'পিতা', reason: 'তীব্র রক্তস্বল্পতা ও এনিমিয়া', contact_phone: '01756778899', tracking_step: 2, status: 'active', has_verified_hospital: true },
    { blood_group: 'A+', bags_needed: 1, component_type: 'whole', hospital_name: 'রংপুর মেডিকেল কলেজ হাসপাতাল', division: 'রংপুর', district: 'রংপুর', location_detail: 'ধাপ, রংপুর', ward_number: 'অর্থোপেডিক', bed_number: '১৪', urgency: 'scheduled', time_target: 'পরশুদিন সকাল ৮টা', patient_name: 'মো: জাহিদ হাসান', patient_relation: 'ভাই', reason: 'হাড় প্রতিস্থাপন অপারেশন', contact_phone: '01767889900', tracking_step: 1, status: 'active', has_verified_hospital: true },
    { blood_group: 'B+', bags_needed: 2, component_type: 'whole', hospital_name: 'ময়মনসিংহ মেডিকেল কলেজ হাসপাতাল', division: 'ময়মনসিংহ', district: 'ময়মনসিংহ', location_detail: 'চরপাড়া', ward_number: 'জরুরি ওটি-২', bed_number: '০৬', urgency: 'now', time_target: 'এখনই', patient_name: 'আকলিমা আক্তার', patient_relation: 'মাতা', reason: 'জরায়ু জটিলতা অপারেশন', contact_phone: '01778990011', tracking_step: 2, status: 'active', has_verified_hospital: true },
    { blood_group: 'O+', bags_needed: 1, component_type: 'whole', hospital_name: 'কুমিল্লা মেডিকেল কলেজ হাসপাতাল', division: 'চট্টগ্রাম', district: 'কুমিল্লা', location_detail: 'কুচাইতলী', ward_number: 'গাইনি', bed_number: '১১', urgency: 'today', time_target: 'আজ রাত ৮টা', patient_name: 'তাহমিনা খাতুন', patient_relation: 'স্বামী', reason: 'প্রসবকালীন রক্তক্ষরণ', contact_phone: '01889001122', tracking_step: 1, status: 'active', has_verified_hospital: true },
    { blood_group: 'A+', bags_needed: 2, component_type: 'whole', hospital_name: 'টিএমএসএস মেডিকেল কলেজ হাসপাতাল', division: 'রাজশাহী', district: 'বগুড়া', location_detail: 'রংপুর রোড, ঠেঙ্গামারা', ward_number: '৩ (ওটি)', bed_number: '০৮', urgency: 'now', time_target: 'দ্রুততম সময়ে', patient_name: 'আব্দুল করিম', patient_relation: 'চাচাতো ভাই', reason: 'কিডনি ডায়ালাইসিস পরবর্তী জরুরি রক্ত', contact_phone: '01790112233', tracking_step: 1, status: 'active', has_verified_hospital: true },
    { blood_group: 'B+', bags_needed: 1, component_type: 'platelets', hospital_name: 'কক্সবাজার জেলা সদর হাসপাতাল', division: 'চট্টগ্রাম', district: 'কক্সবাজার', location_detail: 'হাসপাতাল রোড', ward_number: 'করোনা ও সংক্রামক', bed_number: '০৪', urgency: 'now', time_target: 'জরুরি', patient_name: 'মোহাম্মদ ইউসুফ', patient_relation: 'বন্ধু', reason: 'ডেঙ্গু আক্রান্ত প্লেটলেট সংকট', contact_phone: '01891223344', tracking_step: 3, status: 'active', has_verified_hospital: true },
    { blood_group: 'O-', bags_needed: 1, component_type: 'whole', hospital_name: 'যশোর জেনারেল হাসপাতাল', division: 'খুলনা', district: 'যশোর', location_detail: 'হাসপাতাল মোড়', ward_number: 'ট্রমা সেন্টার', bed_number: '১০', urgency: 'now', time_target: 'এখনই লাগবে', patient_name: 'সুজন কুমার', patient_relation: 'মামা', reason: 'সড়ক দুর্ঘটনায় আঘাতপ্রাপ্ত', contact_phone: '01712332211', tracking_step: 1, status: 'active', has_verified_hospital: true },
    { blood_group: 'AB+', bags_needed: 2, component_type: 'whole', hospital_name: 'দিনাজপুর এম আব্দুর রহিম মেডিকেল কলেজ', division: 'রংপুর', district: 'দিনাজপুর', location_detail: 'দশমাইল রোড', ward_number: 'সার্জারি-২', bed_number: '১৬', urgency: 'today', time_target: 'আজকের মধ্যে', patient_name: 'সোহেল রানা', patient_relation: 'ভাই', reason: 'অন্ত্রের জরুরি অস্ত্রোপচার', contact_phone: '01723443322', tracking_step: 1, status: 'active', has_verified_hospital: true }
  ];

  console.log('3. Seeding emergency_requests...');
  const { data: reqRes, error: reqErr } = await supabase.from('emergency_requests').insert(requestsData).select();
  if (reqErr) console.warn('Requests insert error:', reqErr.message);
  else console.log('✅ Emergency requests seeded:', reqRes?.length);

  // 4. Verify counts for all seeded tables
  console.log('\n--- VERIFYING CURRENT COUNTS ACROSS SUPABASE TABLES ---');
  const tables = ['hospitals_and_banks', 'blood_inventory', 'ambulances', 'donation_camps', 'emergency_requests'];
  for (const t of tables) {
    const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
    console.log(`📌 Table: ${t.padEnd(22)} Total Rows: ${count}`);
  }
}

seed().catch(console.error);
