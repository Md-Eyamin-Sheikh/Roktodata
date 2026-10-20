const { createClient } = require('@supabase/supabase-js');

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const url = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!url || !anonKey) {
  console.error('Missing Supabase URL or Anon Key');
  process.exit(1);
}

const supabase = createClient(url, anonKey);

const DONOR_PROFILES_DATA = [
  { name: 'তানভীর আহমেদ', phone: '01712000001', blood: 'A+', division: 'রাজশাহী', district: 'বগুড়া', upazila: 'বগুড়া সদর', totalDonations: 4, lastDate: '2024-06-15' },
  { name: 'সাব্বির হোসেন', phone: '01712000002', blood: 'O+', division: 'ঢাকা', district: 'ঢাকা', upazila: 'মিরপুর', totalDonations: 8, lastDate: '2024-04-10' },
  { name: 'মোছা: নাজমিন আক্তার', phone: '01712000003', blood: 'B+', division: 'রাজশাহী', district: 'বগুড়া', upazila: 'শেরপুর', totalDonations: 2, lastDate: '2024-05-20' },
  { name: 'মাহমুদুল হাসান', phone: '01712000004', blood: 'AB+', division: 'চট্টগ্রাম', district: 'চট্টগ্রাম', upazila: 'পাঁচলাইশ', totalDonations: 6, lastDate: '2024-03-12' },
  { name: 'ফারহানা চৌধুরী', phone: '01712000005', blood: 'O-', division: 'সিলেট', district: 'সিলেট', upazila: 'কোতোয়ালী', totalDonations: 3, lastDate: '2024-07-01' },
  { name: 'রাকিবুল ইসলাম', phone: '01712000006', blood: 'A-', division: 'খুলনা', district: 'খুলনা', upazila: 'সোনাডাঙ্গা', totalDonations: 5, lastDate: '2024-04-28' },
  { name: 'আরিফুল হক', phone: '01712000007', blood: 'B-', division: 'বরিশাল', district: 'বরিশাল', upazila: 'কোতোয়ালী', totalDonations: 1, lastDate: '2024-06-05' },
  { name: 'মেহেদী হাসান রনি', phone: '01712000008', blood: 'AB-', division: 'রংপুর', district: 'রংপুর', upazila: 'কোতোয়ালী', totalDonations: 7, lastDate: '2024-02-18' },
  { name: 'সাদিয়া আফরিন', phone: '01712000009', blood: 'A+', division: 'ময়মনসিংহ', district: 'ময়মনসিংহ', upazila: 'সদর', totalDonations: 3, lastDate: '2024-05-30' },
  { name: 'জহিরুল ইসলাম', phone: '01712000010', blood: 'O+', division: 'রাজশাহী', district: 'বগুড়া', upazila: 'শিবগঞ্জ', totalDonations: 9, lastDate: '2024-03-22' },
  { name: 'তাহমিনা খাতুন', phone: '01712000011', blood: 'B+', division: 'চট্টগ্রাম', district: 'কুমিল্লা', upazila: 'আদর্শ সদর', totalDonations: 4, lastDate: '2024-06-11' },
  { name: 'মো: কাওসার আলম', phone: '01712000012', blood: 'A+', division: 'খুলনা', district: 'যশোর', upazila: 'সদর', totalDonations: 2, lastDate: '2024-07-10' },
  { name: 'নুসরাত জাহান', phone: '01712000013', blood: 'O+', division: 'রংপুর', district: 'দিনাজপুর', upazila: 'সদর', totalDonations: 5, lastDate: '2024-04-05' },
  { name: 'ইমরান খান', phone: '01712000014', blood: 'B+', division: 'রাজশাহী', district: 'রাজশাহী', upazila: 'বোয়ালিয়া', totalDonations: 11, lastDate: '2024-01-15' },
  { name: 'শাহরিয়ার নাফিস', phone: '01712000015', blood: 'AB+', division: 'ঢাকা', district: 'গাজীপুর', upazila: 'সদর', totalDonations: 3, lastDate: '2024-05-18' },
  { name: 'শাহীন আলম', phone: '01712000016', blood: 'O-', division: 'চট্টগ্রাম', district: 'কক্সবাজার', upazila: 'সদর', totalDonations: 4, lastDate: '2024-06-25' }
];

const NOTIFICATIONS_SEED_DATA = [
  { category: 'urgent', title: '🚨 জরুরি রক্তের ডাক: A+ প্রয়োজন', description: 'শহীদ জিয়াউর রহমান মেডিকেল কলেজ হাসপাতাল (শজিমেক), বগুড়ায় ওয়ার্ড ৪-এ জরুরি ২ ব্যাগ A+ রক্ত লাগবে।' },
  { category: 'urgent', title: '🚨 জরুরি ওটি: O+ রক্ত প্রয়োজন', description: 'ঢাকা মেডিকেল কলেজ হাসপাতাল (ঢামেক) ৮ নং আইসিইউ ওয়ার্ডে সিজারিয়ান অপারেশনের জন্য দ্রুত ১ ব্যাগ রক্ত দরকার।' },
  { category: 'my-req', title: '✅ রক্তদাতা প্রস্তুত ও সাড়া দিয়েছেন', description: 'আপনার রক্তের আবেদনে ডোনার তানভীর আহমেদ সাড়া দিয়েছেন। আনুমানিক ২০ মিনিটে হাসপাতালে পৌঁছাবেন।' },
  { category: 'urgent', title: '🚨 প্লেটলেট সংকট: B+ প্লাটিলেট প্রয়োজন', description: 'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয় (BSMMU) হেমাটোলজি বিভাগে ডেঙ্গু রোগীর জন্য জরুরি ৩ ব্যাগ প্লেটলেট।' },
  { category: 'camp', title: '🏕️ স্বেচ্ছায় রক্তদান ক্যাম্পেইন', description: 'আগামীকাল সকাল ৯টায় বগুড়া পৌর পার্ক চত্বরে বাংলাদেশ রেড ক্রিসেন্ট সোসাইটির উদ্যোগে উন্মুক্ত রক্তদান ক্যাম্প অনুষ্ঠিত হবে।' },
  { category: 'urgent', title: '🚨 সড়ক দুর্ঘটনা: O- রক্ত জরুরি', description: 'চট্টগ্রাম মেডিকেল কলেজ হাসপাতালে জরুরি অপারেশনের জন্য জরুরি ভিত্তিতে ২ ব্যাগ ও-নেগেটিভ রক্ত চাওয়া হয়েছে।' },
  { category: 'my-req', title: '📞 ডোনার সরাসরি কল করেছেন', description: 'আপনার জরুরি আবেদনের প্রেক্ষিতে রক্তদাতা সাব্বির হোসেন যোগাযোগ করেছেন এবং হাসপাতালে রওনা হয়েছেন।' },
  { category: 'badge', title: '🏆 নতুন ব্যাজ অর্জিত: গোল্ডেন লাইফসেভার', description: 'অভিনন্দন! আপনার মোট ৫ বার স্বেচ্ছায় রক্তদানের স্বীকৃতিস্বরূপ গোল্ডেন লাইফসেভার ব্যাজ প্রোফাইলে যুক্ত হয়েছে।' },
  { category: 'urgent', title: '🚨 থ্যালাসেমিয়া রোগীর জন্য AB+ রক্ত', description: 'মোহাম্মদ আলী হাসপাতাল, বগুড়ায় ৮ বছর বয়সী শিশুর জন্য আজকের মধ্যে ১ ব্যাগ রক্ত নিশ্চিত করা প্রয়োজন।' },
  { category: 'camp', title: '🏕️ তারুণ্যের রক্তদান উৎসব ২০২৪', description: 'রাজশাহী বিশ্ববিদ্যালয় সিনেট ভবন চত্বরে শুক্রবার দিনব্যাপী বিনামূল্যে রক্তের গ্রুপ পরীক্ষা ও ক্যাম্পেইন।' },
  { category: 'urgent', title: '🚨 কার্ডিয়াক সার্জারি: A- রক্তের আবেদন', description: 'রাজশাহী মেডিকেল কলেজ হাসপাতালে এনজিওগ্রাম পরবর্তী অপারেশনের জন্য জরুরি ২ ব্যাগ এ-নেগেটিভ রক্তের ডাক।' },
  { category: 'my-req', title: '🎉 রক্তের আবেদন সফলভাবে সম্পন্ন হয়েছে', description: 'আপনার অনুরোধকৃত ২ ব্যাগ রক্ত সফলভাবে রোগীর শরীরে সঞ্চালন সম্পন্ন হয়েছে। সংশ্লিষ্ট সকল ডোনারকে ধন্যবাদ।' },
  { category: 'urgent', title: '🚨 বার্ন ইউনিট: B- ফ্রেশ ফ্রোজেন প্লাজমা', description: 'সিলেট ওসমানী মেডিকেল কলেজ হাসপাতালে গুরুতর অগ্নিদগ্ধ রোগীর জরুরি ১ ব্যাগ প্লাজমা থেরাপির প্রয়োজন।' },
  { category: 'camp', title: '🏕️ আন্তর্জাতিক রক্তদাতা দিবস উপলক্ষ্যে কর্মসূচি', description: 'ঢাকা সেন্ট্রাল শহীদ মিনার প্রাঙ্গণে রেড ক্রিসেন্ট ব্লাড সেন্টারের ভ্রাম্যমাণ রক্তদান বাসের অবস্থান।' },
  { category: 'urgent', title: '🚨 নিউরোলজি ইমার্জেন্সি: AB- রক্ত', description: 'খুলনা মেডিকেল কলেজ হাসপাতালে ব্রেন স্ট্রোক অপারেশনের জন্য আজ বিকেল ৪টার মধ্যে রক্ত প্রয়োজন।' },
  { category: 'badge', title: '⭐ কমিউনিটি স্টার ব্যাজ', description: 'নিকটবর্তী ৩ জন মুমূর্ষু রোগীকে তাৎক্ষণিক তথ্য দিয়ে সহায়তা করার জন্য আপনাকে কমিউনিটি স্টার ভূষিত করা হয়েছে।' }
];

async function seedRemainingTables() {
  console.log('--- STARTING COMPREHENSIVE SEEDING FOR REMAINING TABLES ---');

  // Step 1: Create auth users and corresponding profiles
  const createdProfiles = [];
  const createdDonorProfiles = [];

  for (let i = 0; i < DONOR_PROFILES_DATA.length; i++) {
    const item = DONOR_PROFILES_DATA[i];
    const uniqueEmail = `donor_${Date.now()}_${i}@roktodata.app`;

    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: uniqueEmail,
        password: 'Password@Roktodata2024!',
      });

      if (authErr) {
        console.warn(`SignUp failed for ${item.name}:`, authErr.message);
        continue;
      }

      const userId = authData?.user?.id;
      if (!userId) continue;

      // Insert Profile
      const { data: profData, error: profErr } = await supabase.from('profiles').insert([{
        id: userId,
        phone_number: item.phone,
        full_name: item.name,
        blood_group: item.blood,
        division: item.division,
        district: item.district,
        upazila: item.upazila,
        is_verified: true,
        text_size_preference: '100%'
      }]).select();

      if (profErr) {
        console.warn(`Profile insert failed for ${item.name}:`, profErr.message);
        continue;
      }

      createdProfiles.push(profData[0]);

      // Insert Donor Profile
      const { data: dpData, error: dpErr } = await supabase.from('donor_profiles').insert([{
        user_id: userId,
        is_available: true,
        total_donations: item.totalDonations,
        last_donation_date: item.lastDate,
        is_fast_responder: item.totalDonations > 4,
        national_id_verified: true,
        privacy_hide_phone: false
      }]).select();

      if (dpErr) {
        console.warn(`Donor profile insert failed for ${item.name}:`, dpErr.message);
      } else if (dpData && dpData[0]) {
        createdDonorProfiles.push(dpData[0]);
      }
    } catch (e) {
      console.warn(`Error on item ${i}:`, e.message);
    }
  }

  console.log(`✅ Profiles seeded: ${createdProfiles.length}`);
  console.log(`✅ Donor Profiles seeded: ${createdDonorProfiles.length}`);

  // Step 2: Seed Notifications (at least 16 notifications)
  if (createdProfiles.length > 0) {
    const notifRows = NOTIFICATIONS_SEED_DATA.map((n, idx) => {
      const targetUser = createdProfiles[idx % createdProfiles.length];
      return {
        user_id: targetUser.id,
        category: n.category,
        title: n.title,
        description: n.description,
        is_unread: idx < 6 // first 6 are unread
      };
    });

    const { data: nRes, error: nErr } = await supabase.from('notifications').insert(notifRows).select();
    if (nErr) console.warn('Notifications insert error:', nErr.message);
    else console.log(`✅ Notifications seeded: ${nRes?.length}`);
  }

  // Step 3: Seed Donation History (at least 16 records)
  if (createdDonorProfiles.length > 0) {
    const hospitals = [
      'ঢাকা মেডিকেল কলেজ হাসপাতাল',
      'শহীদ জিয়াউর রহমান মেডিকেল কলেজ (শজিমেক)',
      'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয় (BSMMU)',
      'চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল',
      'রেড ক্রিসেন্ট ব্লাড সেন্টার, বগুড়া',
      'রাজশাহী মেডিকেল কলেজ হাসপাতাল'
    ];
    const badges = ['গোল্ডেন ডোনার', 'সিলভার ডোনার', 'লাইফসেভার', 'রেগুলার ডোনার', 'কমিউনিটি হিরো'];

    const historyRows = createdDonorProfiles.map((dp, idx) => ({
      donor_id: dp.id,
      hospital_name: hospitals[idx % hospitals.length],
      donation_date: `2024-0${(idx % 6) + 1}-15`,
      blood_group: DONOR_PROFILES_DATA[idx % DONOR_PROFILES_DATA.length].blood,
      badge_earned: badges[idx % badges.length],
      verified_by_hospital: true
    }));

    const { data: hRes, error: hErr } = await supabase.from('donation_history').insert(historyRows).select();
    if (hErr) console.warn('Donation history error:', hErr.message);
    else console.log(`✅ Donation history seeded: ${hRes?.length}`);
  }

  // Step 4: Seed Donor Responses (at least 16 records linked to emergency requests)
  const { data: emergencyReqs } = await supabase.from('emergency_requests').select('id');
  if (emergencyReqs && emergencyReqs.length > 0 && createdDonorProfiles.length > 0) {
    const responseRows = [];
    const statuses = ['on_the_way', 'arrived', 'completed', 'on_the_way'];

    for (let i = 0; i < Math.max(16, emergencyReqs.length); i++) {
      const req = emergencyReqs[i % emergencyReqs.length];
      const dp = createdDonorProfiles[i % createdDonorProfiles.length];
      responseRows.push({
        request_id: req.id,
        donor_id: dp.id,
        eta_minutes: (i % 5 + 2) * 10,
        status: statuses[i % statuses.length]
      });
    }

    const { data: respRes, error: respErr } = await supabase.from('donor_responses').insert(responseRows).select();
    if (respErr) console.warn('Donor responses error:', respErr.message);
    else console.log(`✅ Donor responses seeded: ${respRes?.length}`);
  }

  // Step 5: Final count across all tables
  console.log('\n====================================================');
  console.log('       FINAL LIVE TABLE ROW COUNTS IN SUPABASE       ');
  console.log('====================================================');
  const allTables = [
    'emergency_requests',
    'hospitals_and_banks',
    'blood_inventory',
    'ambulances',
    'donation_camps',
    'profiles',
    'donor_profiles',
    'notifications',
    'donation_history',
    'donor_responses',
    'districts'
  ];

  for (const t of allTables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    console.log(`📌 Table: ${t.padEnd(20)} Total Rows: ${count ?? 0} (Error: ${error?.message || 'None'})`);
  }
}

seedRemainingTables().catch(console.error);
