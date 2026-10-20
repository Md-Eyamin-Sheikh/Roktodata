export interface UpazilaInfo {
  nameBn: string;
  nameEn: string;
}

export interface DistrictInfo {
  id: string;
  nameBn: string;
  nameEn: string;
  divisionId: string;
  divisionBn: string;
  divisionEn: string;
  lat: number;
  lng: number;
  upazilas: string[];
}

export interface DivisionInfo {
  id: string;
  nameBn: string;
  nameEn: string;
  districtCount: number;
}

export const divisionsList: DivisionInfo[] = [
  { id: 'dhaka', nameBn: 'ঢাকা', nameEn: 'Dhaka', districtCount: 13 },
  { id: 'chattogram', nameBn: 'চট্টগ্রাম', nameEn: 'Chattogram', districtCount: 11 },
  { id: 'rajshahi', nameBn: 'রাজশাহী', nameEn: 'Rajshahi', districtCount: 8 },
  { id: 'khulna', nameBn: 'খুলনা', nameEn: 'Khulna', districtCount: 10 },
  { id: 'barishal', nameBn: 'বরিশাল', nameEn: 'Barishal', districtCount: 6 },
  { id: 'sylhet', nameBn: 'সিলেট', nameEn: 'Sylhet', districtCount: 4 },
  { id: 'rangpur', nameBn: 'রংপুর', nameEn: 'Rangpur', districtCount: 8 },
  { id: 'mymensingh', nameBn: 'ময়মনসিংহ', nameEn: 'Mymensingh', districtCount: 4 },
];

export const allDistricts: DistrictInfo[] = [
  // =================== রাজশাহী বিভাগ (Rajshahi Division) ===================
  {
    id: 'bogura',
    nameBn: 'বগুড়া',
    nameEn: 'Bogura',
    divisionId: 'rajshahi',
    divisionBn: 'রাজশাহী',
    divisionEn: 'Rajshahi',
    lat: 24.8465,
    lng: 89.377,
    upazilas: [
      'বগুড়া সদর',
      'শেরপুর',
      'শিবগঞ্জ',
      'গাবতলী',
      'শাজাহানপুর',
      'কাহালু',
      'দুপচাঁচিয়া',
      'আদমদীঘি',
      'নন্দীগ্রাম',
      'ধুনট',
      'সারিয়াকান্দি',
      'সোনাতলা',
    ],
  },
  {
    id: 'rajshahi_dist',
    nameBn: 'রাজশাহী',
    nameEn: 'Rajshahi',
    divisionId: 'rajshahi',
    divisionBn: 'রাজশাহী',
    divisionEn: 'Rajshahi',
    lat: 24.3745,
    lng: 88.6042,
    upazilas: ['বোয়ালিয়া', 'মতিহার', 'রাজপাড়া', 'শাহ মখদুম', 'পবা', 'গোদাগাড়ী', 'তানোর', 'বাঘা', 'চারঘাট', 'পুঠিয়া', 'দুর্গাপুর', 'বাগমারা', 'মোহনপুর'],
  },
  {
    id: 'pabna',
    nameBn: 'পাবনা',
    nameEn: 'Pabna',
    divisionId: 'rajshahi',
    divisionBn: 'রাজশাহী',
    divisionEn: 'Rajshahi',
    lat: 24.0064,
    lng: 89.2372,
    upazilas: ['পাবনা সদর', 'ঈশ্বরদী', 'সুজানগর', 'সাঁথিয়া', 'চাটমোহর', 'ফরিদপুর', 'ভাঙ্গুড়া', 'বেড়া', 'আটঘরিয়া'],
  },
  {
    id: 'sirajganj',
    nameBn: 'সিরাজগঞ্জ',
    nameEn: 'Sirajganj',
    divisionId: 'rajshahi',
    divisionBn: 'রাজশাহী',
    divisionEn: 'Rajshahi',
    lat: 24.4534,
    lng: 89.7008,
    upazilas: ['সিরাজগঞ্জ সদর', 'শাহজাদপুর', 'উল্লাপাড়া', 'বেলকুচি', 'রায়গঞ্জ', 'তাড়াশ', 'কাজীপুর', 'কামারখন্দ', 'চৌহালী'],
  },
  {
    id: 'naogaon',
    nameBn: 'নওগাঁ',
    nameEn: 'Naogaon',
    divisionId: 'rajshahi',
    divisionBn: 'রাজশাহী',
    divisionEn: 'Rajshahi',
    lat: 24.8103,
    lng: 88.9324,
    upazilas: ['নওগাঁ সদর', 'মহাদেবপুর', 'মান্দা', 'পত্নীতলা', 'বদলগাছী', 'নিয়ামাতপুর', 'ধামইরহাট', 'আত্রাই', 'রানীনগর', 'সাপাহার', 'পোরশা'],
  },
  {
    id: 'natore',
    nameBn: 'নাটোর',
    nameEn: 'Natore',
    divisionId: 'rajshahi',
    divisionBn: 'রাজশাহী',
    divisionEn: 'Rajshahi',
    lat: 24.4102,
    lng: 89.0076,
    upazilas: ['নাটোর সদর', 'সিংড়া', 'বাড়াইগ্রাম', 'গুরুদাসপুর', 'লালপুর', 'বাগাতিপাড়া', 'নলডাঙ্গা'],
  },
  {
    id: 'chapai_nawabganj',
    nameBn: 'চাঁপাইনবাবগঞ্জ',
    nameEn: 'Chapai Nawabganj',
    divisionId: 'rajshahi',
    divisionBn: 'রাজশাহী',
    divisionEn: 'Rajshahi',
    lat: 24.5965,
    lng: 88.2775,
    upazilas: ['চাঁপাইনবাবগঞ্জ সদর', 'শিবগঞ্জ', 'গোমস্তাপুর', 'নাচোল', 'ভোলাহাট'],
  },
  {
    id: 'joypurhat',
    nameBn: 'জয়পুরহাট',
    nameEn: 'Joypurhat',
    divisionId: 'rajshahi',
    divisionBn: 'রাজশাহী',
    divisionEn: 'Rajshahi',
    lat: 25.0947,
    lng: 89.0279,
    upazilas: ['জয়পুরহাট সদর', 'পাঁচবিবি', 'কালাই', 'ক্ষেতলাল', 'আক্কেলপুর'],
  },

  // =================== ঢাকা বিভাগ (Dhaka Division) ===================
  {
    id: 'dhaka_dist',
    nameBn: 'ঢাকা',
    nameEn: 'Dhaka',
    divisionId: 'dhaka',
    divisionBn: 'ঢাকা',
    divisionEn: 'Dhaka',
    lat: 23.8103,
    lng: 90.4125,
    upazilas: [
      'ঢাকা উত্তর',
      'ঢাকা দক্ষিণ',
      'মিরপুর',
      'ধানমন্ডি',
      'গুলশান',
      'উত্তরা',
      'মোহাম্মদপুর',
      'তেজগাঁও',
      'মতিঝিল',
      'সাভার',
      'ধামরাই',
      'কেরানীগঞ্জ',
    ],
  },
  {
    id: 'gazipur',
    nameBn: 'গাজীপুর',
    nameEn: 'Gazipur',
    divisionId: 'dhaka',
    divisionBn: 'ঢাকা',
    divisionEn: 'Dhaka',
    lat: 23.9999,
    lng: 90.4203,
    upazilas: ['গাজীপুর সদর', 'টঙ্গী', 'শ্রীপুর', 'কালিয়াকৈর', 'কাপাসিয়া', 'কালীগঞ্জ'],
  },
  {
    id: 'narayanganj',
    nameBn: 'নারায়ণগঞ্জ',
    nameEn: 'Narayanganj',
    divisionId: 'dhaka',
    divisionBn: 'ঢাকা',
    divisionEn: 'Dhaka',
    lat: 23.6238,
    lng: 90.5000,
    upazilas: ['নারায়ণগঞ্জ সদর', 'সোনারগাঁও', 'রূপগঞ্জ', 'আড়াইহাজার', 'বন্দর'],
  },
  {
    id: 'tangail',
    nameBn: 'টাঙ্গাইল',
    nameEn: 'Tangail',
    divisionId: 'dhaka',
    divisionBn: 'ঢাকা',
    divisionEn: 'Dhaka',
    lat: 24.2513,
    lng: 89.9167,
    upazilas: ['টাঙ্গাইল সদর', 'মির্জাপুর', 'ঘাটাইল', 'মধুপুর', 'কালিহাতী', 'সখিপুর', 'গোপালপুর', 'বাসাইল'],
  },
  {
    id: 'faridpur',
    nameBn: 'ফরিদপুর',
    nameEn: 'Faridpur',
    divisionId: 'dhaka',
    divisionBn: 'ঢাকা',
    divisionEn: 'Dhaka',
    lat: 23.6071,
    lng: 89.8429,
    upazilas: ['ফরিদপুর সদর', 'বোয়ালমারী', 'ভাঙ্গা', 'নগরকান্দা', 'আলফাডাঙ্গা', 'মধুখালী', 'সদরপুর'],
  },
  {
    id: 'manikganj',
    nameBn: 'মানিকগঞ্জ',
    nameEn: 'Manikganj',
    divisionId: 'dhaka',
    divisionBn: 'ঢাকা',
    divisionEn: 'Dhaka',
    lat: 23.8617,
    lng: 90.0003,
    upazilas: ['মানিকগঞ্জ সদর', 'সিংগাইর', 'সাটুরিয়া', 'ঘিওর', 'শিবালয়', 'হরিরামপুর', 'দৌলতপুর'],
  },
  {
    id: 'munshiganj',
    nameBn: 'মুন্সীগঞ্জ',
    nameEn: 'Munshiganj',
    divisionId: 'dhaka',
    divisionBn: 'ঢাকা',
    divisionEn: 'Dhaka',
    lat: 23.5422,
    lng: 90.5305,
    upazilas: ['মুন্সীগঞ্জ সদর', 'শ্রীনগর', 'সিরাজদিখান', 'লৌহজং', 'গজারিয়া', 'টংগিবাড়ী'],
  },
  {
    id: 'narsingdi',
    nameBn: 'নরসিংদী',
    nameEn: 'Narsingdi',
    divisionId: 'dhaka',
    divisionBn: 'ঢাকা',
    divisionEn: 'Dhaka',
    lat: 23.9322,
    lng: 90.7154,
    upazilas: ['নরসিংদী সদর', 'পলাশ', 'রায়পুরা', 'শিবপুর', 'মনোহরদী', 'বেলাবো'],
  },
  {
    id: 'kishoreganj',
    nameBn: 'কিশোরগঞ্জ',
    nameEn: 'Kishoreganj',
    divisionId: 'dhaka',
    divisionBn: 'ঢাকা',
    divisionEn: 'Dhaka',
    lat: 24.4449,
    lng: 90.7766,
    upazilas: ['কিশোরগঞ্জ সদর', 'ভৈরব', 'করিমগঞ্জ', 'বাজিতপুর', 'হোসেনপুর', 'কটিয়াদী', 'তাড়াইল', 'কুলিয়ারচর'],
  },
  {
    id: 'gopalganj',
    nameBn: 'গোপালগঞ্জ',
    nameEn: 'Gopalganj',
    divisionId: 'dhaka',
    divisionBn: 'ঢাকা',
    divisionEn: 'Dhaka',
    lat: 23.0051,
    lng: 89.8266,
    upazilas: ['গোপালগঞ্জ সদর', 'টুঙ্গিপাড়া', 'কাশিয়ানী', 'কোটালীপাড়া', 'মুকসুদপুর'],
  },
  {
    id: 'madaripur',
    nameBn: 'মাদারীপুর',
    nameEn: 'Madaripur',
    divisionId: 'dhaka',
    divisionBn: 'ঢাকা',
    divisionEn: 'Dhaka',
    lat: 23.1641,
    lng: 90.1897,
    upazilas: ['মাদারীপুর সদর', 'শিবচর', 'কালকিনি', 'রাজৈর'],
  },
  {
    id: 'rajbari',
    nameBn: 'রাজবাড়ী',
    nameEn: 'Rajbari',
    divisionId: 'dhaka',
    divisionBn: 'ঢাকা',
    divisionEn: 'Dhaka',
    lat: 23.7574,
    lng: 89.6445,
    upazilas: ['রাজবাড়ী সদর', 'পাংশা', 'বালিয়াকান্দি', 'গোয়ালন্দ', 'কালুখালী'],
  },
  {
    id: 'shariatpur',
    nameBn: 'শরীয়তপুর',
    nameEn: 'Shariatpur',
    divisionId: 'dhaka',
    divisionBn: 'ঢাকা',
    divisionEn: 'Dhaka',
    lat: 23.2423,
    lng: 90.4348,
    upazilas: ['শরীয়তপুর সদর', 'জাজিরা', 'নড়িয়া', 'ডামুড্যা', 'ভেদরগঞ্জ', 'গোসাইরহাট'],
  },

  // =================== চট্টগ্রাম বিভাগ (Chattogram Division) ===================
  {
    id: 'chattogram_dist',
    nameBn: 'চট্টগ্রাম',
    nameEn: 'Chattogram',
    divisionId: 'chattogram',
    divisionBn: 'চট্টগ্রাম',
    divisionEn: 'Chattogram',
    lat: 22.3569,
    lng: 91.7832,
    upazilas: [
      'চট্টগ্রাম সদর',
      'পাহাড়তলী',
      'পাঁচলাইশ',
      'কোতোয়ালী',
      'হালিশহর',
      'খুলশী',
      'সীতাকুণ্ড',
      'মীরসরাই',
      'পটিয়া',
      'হাটহাজারী',
      'রাঙ্গুনিয়া',
      'আনোয়ারা',
      'বোয়ালখালী',
      'সন্দ্বীপ',
    ],
  },
  {
    id: 'coxsbazar',
    nameBn: "কক্সবাজার",
    nameEn: "Cox's Bazar",
    divisionId: 'chattogram',
    divisionBn: 'চট্টগ্রাম',
    divisionEn: 'Chattogram',
    lat: 21.4272,
    lng: 92.0058,
    upazilas: ['কক্সবাজার সদর', 'চকোরিয়া', 'টেকনাফ', 'উখিয়া', 'মহেশখালী', 'রামু', 'পেকুয়া', 'কুতুবদিয়া'],
  },
  {
    id: 'cumilla',
    nameBn: 'কুমিল্লা',
    nameEn: 'Cumilla',
    divisionId: 'chattogram',
    divisionBn: 'চট্টগ্রাম',
    divisionEn: 'Chattogram',
    lat: 23.4682,
    lng: 91.1788,
    upazilas: ['কুমিল্লা সদর', 'লাকসাম', 'দাউদকান্দি', 'চান্দিনা', 'দেবিদ্বার', 'বুড়িচং', 'ব্রাহ্মণপাড়া', 'বরুড়া', 'চৌদ্দগ্রাম', 'মুরাদনগর'],
  },
  {
    id: 'brahmanbaria',
    nameBn: 'ব্রাহ্মণবাড়িয়া',
    nameEn: 'Brahmanbaria',
    divisionId: 'chattogram',
    divisionBn: 'চট্টগ্রাম',
    divisionEn: 'Chattogram',
    lat: 23.9608,
    lng: 91.1115,
    upazilas: ['ব্রাহ্মণবাড়িয়া সদর', 'আশুগঞ্জ', 'সরাইল', 'কসবা', 'নবীনগর', 'নাসিরনগর', 'বাঞ্ছারামপুর', 'আখাউড়া'],
  },
  {
    id: 'chandpur',
    nameBn: 'চাঁদপুর',
    nameEn: 'Chandpur',
    divisionId: 'chattogram',
    divisionBn: 'চট্টগ্রাম',
    divisionEn: 'Chattogram',
    lat: 23.2333,
    lng: 90.6667,
    upazilas: ['চাঁদপুর সদর', 'হাজীগঞ্জ', 'মতলব উত্তর', 'মতলব দক্ষিণ', 'ফরিদগঞ্জ', 'কচুয়া', 'শাহরাস্তি', 'হাইমচর'],
  },
  {
    id: 'noakhali',
    nameBn: 'নোয়াখালী',
    nameEn: 'Noakhali',
    divisionId: 'chattogram',
    divisionBn: 'চট্টগ্রাম',
    divisionEn: 'Chattogram',
    lat: 22.8696,
    lng: 91.0994,
    upazilas: ['নোয়াখালী সদর', 'বেগমগঞ্জ', 'চাটখিল', 'সোনাইমুড়ী', 'সেনবাগ', 'কোম্পানীগঞ্জ', 'হাতিয়া', 'সুবর্ণচর'],
  },
  {
    id: 'feni',
    nameBn: 'ফেনী',
    nameEn: 'Feni',
    divisionId: 'chattogram',
    divisionBn: 'চট্টগ্রাম',
    divisionEn: 'Chattogram',
    lat: 23.0159,
    lng: 91.3976,
    upazilas: ['ফেনী সদর', 'দাগনভূঞা', 'সোনাগাজী', 'ছাগলনাইয়া', 'পরশুরাম', 'ফুলগাজী'],
  },
  {
    id: 'lakshmipur',
    nameBn: 'লক্ষ্মীপুর',
    nameEn: 'Lakshmipur',
    divisionId: 'chattogram',
    divisionBn: 'চট্টগ্রাম',
    divisionEn: 'Chattogram',
    lat: 22.9447,
    lng: 90.8282,
    upazilas: ['লক্ষ্মীপুর সদর', 'রায়পুর', 'রামগঞ্জ', 'রামগতি', 'কমলনগর'],
  },
  {
    id: 'khagrachhari',
    nameBn: 'খাগড়াছড়ি',
    nameEn: 'Khagrachhari',
    divisionId: 'chattogram',
    divisionBn: 'চট্টগ্রাম',
    divisionEn: 'Chattogram',
    lat: 23.1193,
    lng: 91.9847,
    upazilas: ['খাগড়াছড়ি সদর', 'দীঘিনালা', 'পানছড়ি', 'মহালছড়ি', 'মাটিরাঙ্গা', 'রামগড়', 'মানিকছড়ি'],
  },
  {
    id: 'rangamati',
    nameBn: 'রাঙ্গামাটি',
    nameEn: 'Rangamati',
    divisionId: 'chattogram',
    divisionBn: 'চট্টগ্রাম',
    divisionEn: 'Chattogram',
    lat: 22.6533,
    lng: 92.1753,
    upazilas: ['রাঙ্গামাটি সদর', 'কাপ্তাই', 'কাউখালী', 'বাঘাইছড়ি', 'বরকল', 'জুরাইছড়ি', 'নানিয়ারচর', 'লংগদু'],
  },
  {
    id: 'bandarban',
    nameBn: 'বান্দরবান',
    nameEn: 'Bandarban',
    divisionId: 'chattogram',
    divisionBn: 'চট্টগ্রাম',
    divisionEn: 'Chattogram',
    lat: 22.1953,
    lng: 92.2184,
    upazilas: ['বান্দরবান সদর', 'রুমা', 'থানচি', 'রোয়াংছড়ি', 'লামা', 'আলীকদম', 'নাইক্ষ্যংছড়ি'],
  },

  // =================== সিলেট বিভাগ (Sylhet Division) ===================
  {
    id: 'sylhet_dist',
    nameBn: 'সিলেট',
    nameEn: 'Sylhet',
    divisionId: 'sylhet',
    divisionBn: 'সিলেট',
    divisionEn: 'Sylhet',
    lat: 24.8949,
    lng: 91.8687,
    upazilas: ['সিলেট সদর', 'গোলাপগঞ্জ', 'বিয়ানীবাজার', 'দক্ষিণ সুরমা', 'জৈন্তাপুর', 'ফেঞ্চুগঞ্জ', 'বালাগঞ্জ', 'কোম্পানীগঞ্জ', 'বিশ্বনাথ', 'জকিগঞ্জ', 'কানাইঘাট'],
  },
  {
    id: 'moulvibazar',
    nameBn: 'মৌলভীবাজার',
    nameEn: 'Moulvibazar',
    divisionId: 'sylhet',
    divisionBn: 'সিলেট',
    divisionEn: 'Sylhet',
    lat: 24.4829,
    lng: 91.7774,
    upazilas: ['মৌলভীবাজার সদর', 'শ্রীমঙ্গল', 'কমলগঞ্জ', 'কুলাউড়া', 'বড়লেখা', 'রাজনগর', 'জুড়ী'],
  },
  {
    id: 'habiganj',
    nameBn: 'হবিগঞ্জ',
    nameEn: 'Habiganj',
    divisionId: 'sylhet',
    divisionBn: 'সিলেট',
    divisionEn: 'Sylhet',
    lat: 24.3749,
    lng: 91.4155,
    upazilas: ['হবিগঞ্জ সদর', 'মাধবপুর', 'চুনারুঘাট', 'নবীগঞ্জ', 'বাহুবল', 'বানিয়াচং', 'আজমিরীগঞ্জ', 'লাখাই'],
  },
  {
    id: 'sunamganj',
    nameBn: 'সুনামগঞ্জ',
    nameEn: 'Sunamganj',
    divisionId: 'sylhet',
    divisionBn: 'সিলেট',
    divisionEn: 'Sylhet',
    lat: 25.0658,
    lng: 91.3950,
    upazilas: ['সুনামগঞ্জ সদর', 'ছাতক', 'জগন্নাথপুর', 'দোয়ারাবাজার', 'তাহিরপুর', 'দিরাই', 'শাল্লা', 'বিশ্বম্ভরপুর', 'ধর্মপাশা', 'জামালগঞ্জ'],
  },

  // =================== খুলনা বিভাগ (Khulna Division) ===================
  {
    id: 'khulna_dist',
    nameBn: 'খুলনা',
    nameEn: 'Khulna',
    divisionId: 'khulna',
    divisionBn: 'খুলনা',
    divisionEn: 'Khulna',
    lat: 22.8456,
    lng: 89.5403,
    upazilas: ['খুলনা সদর', 'সোনাডাঙ্গা', 'খালিশপুর', 'দৌলতপুর', 'রূপসা', 'ডুমুরিয়া', 'তেরখাদা', 'পাইকগাছা', 'কয়রা', 'বটিয়াঘাটা', 'দাকোপ'],
  },
  {
    id: 'jashore',
    nameBn: 'যশোর',
    nameEn: 'Jashore',
    divisionId: 'khulna',
    divisionBn: 'খুলনা',
    divisionEn: 'Khulna',
    lat: 23.1664,
    lng: 89.2081,
    upazilas: ['যশোর সদর', 'ঝিকরগাছা', 'কেশবপুর', 'মণিরামপুর', 'শার্শা', 'অভয়নগর', 'বাঘারপাড়া', 'চৌগাছা'],
  },
  {
    id: 'kushtia',
    nameBn: 'কুষ্টিয়া',
    nameEn: 'Kushtia',
    divisionId: 'khulna',
    divisionBn: 'খুলনা',
    divisionEn: 'Khulna',
    lat: 23.9013,
    lng: 89.1205,
    upazilas: ['কুষ্টিয়া সদর', 'কুমারখালী', 'মিরপুর', 'ভেড়ামারা', 'দৌলতপুর', 'খোকসা'],
  },
  {
    id: 'satkhira',
    nameBn: 'সাতক্ষীরা',
    nameEn: 'Satkhira',
    divisionId: 'khulna',
    divisionBn: 'খুলনা',
    divisionEn: 'Khulna',
    lat: 22.7185,
    lng: 89.0705,
    upazilas: ['সাতক্ষীরা সদর', 'কলারোয়া', 'তালা', 'কালীগঞ্জ', 'শ্যামনগর', 'আশাশুনি', 'দেবহাটা'],
  },
  {
    id: 'jhenaidah',
    nameBn: 'ঝিনাইদহ',
    nameEn: 'Jhenaidah',
    divisionId: 'khulna',
    divisionBn: 'খুলনা',
    divisionEn: 'Khulna',
    lat: 23.5448,
    lng: 89.1539,
    upazilas: ['ঝিনাইদহ সদর', 'কালীগঞ্জ', 'কোটচাঁদপুর', 'শৈলকুপা', 'মহেশপুর', 'হরিণাকুণ্ডু'],
  },
  {
    id: 'chuadanga',
    nameBn: 'চুয়াডাঙ্গা',
    nameEn: 'Chuadanga',
    divisionId: 'khulna',
    divisionBn: 'খুলনা',
    divisionEn: 'Khulna',
    lat: 23.6402,
    lng: 88.8418,
    upazilas: ['চুয়াডাঙ্গা সদর', 'আলমডাঙ্গা', 'দামুড়হুদা', 'জীবননগর'],
  },
  {
    id: 'magura',
    nameBn: 'মাগুরা',
    nameEn: 'Magura',
    divisionId: 'khulna',
    divisionBn: 'খুলনা',
    divisionEn: 'Khulna',
    lat: 23.4873,
    lng: 89.4198,
    upazilas: ['মাগুরা সদর', 'শ্রীপুর', 'মহম্মদপুর', 'শালিখা'],
  },
  {
    id: 'meherpur',
    nameBn: 'মেহেরপুর',
    nameEn: 'Meherpur',
    divisionId: 'khulna',
    divisionBn: 'খুলনা',
    divisionEn: 'Khulna',
    lat: 23.7725,
    lng: 88.6318,
    upazilas: ['মেহেরপুর সদর', 'গাংনী', 'মুজিবনগর'],
  },
  {
    id: 'narail',
    nameBn: 'নড়াইল',
    nameEn: 'Narail',
    divisionId: 'khulna',
    divisionBn: 'খুলনা',
    divisionEn: 'Khulna',
    lat: 23.1725,
    lng: 89.5127,
    upazilas: ['নড়াইল সদর', 'লোহাগড়া', 'কালিয়া'],
  },
  {
    id: 'bagerhat',
    nameBn: 'বাগেরহাট',
    nameEn: 'Bagerhat',
    divisionId: 'khulna',
    divisionBn: 'খুলনা',
    divisionEn: 'Khulna',
    lat: 22.6516,
    lng: 89.7859,
    upazilas: ['বাগেরহাট সদর', 'মোংলা', 'ফকিরহাট', 'রামপাল', 'মোল্লাহাট', 'কচুয়া', 'চিতলমারী', 'মোরেলগঞ্জ', 'শরণখোলা'],
  },

  // =================== বরিশাল বিভাগ (Barishal Division) ===================
  {
    id: 'barishal_dist',
    nameBn: 'বরিশাল',
    nameEn: 'Barishal',
    divisionId: 'barishal',
    divisionBn: 'বরিশাল',
    divisionEn: 'Barishal',
    lat: 22.7010,
    lng: 90.3535,
    upazilas: ['বরিশাল সদর', 'বাবুগঞ্জ', 'উজিরপুর', 'গৌরনদী', 'আগৈলঝাড়া', 'বানারীপাড়া', 'মুলাদী', 'মেহেন্দিগঞ্জ', 'হিজলা', 'বাকেরগঞ্জ'],
  },
  {
    id: 'patuakhali',
    nameBn: 'পটুয়াখালী',
    nameEn: 'Patuakhali',
    divisionId: 'barishal',
    divisionBn: 'বরিশাল',
    divisionEn: 'Barishal',
    lat: 22.3596,
    lng: 90.3299,
    upazilas: ['পটুয়াখালী সদর', 'কলাপাড়া', 'কুয়াকাটা', 'বাউফল', 'গলাচিপা', 'দশমিনা', 'মির্জাগঞ্জ', 'দুমকি', 'রাঙ্গাবালী'],
  },
  {
    id: 'bhola',
    nameBn: 'ভোলা',
    nameEn: 'Bhola',
    divisionId: 'barishal',
    divisionBn: 'বরিশাল',
    divisionEn: 'Barishal',
    lat: 22.6859,
    lng: 90.6481,
    upazilas: ['ভোলা সদর', 'বোরহানউদ্দিন', 'দৌলতখান', 'লালমোহন', 'চরফ্যাশন', 'তজুমদ্দিন', 'মনপুরা'],
  },
  {
    id: 'pirojpur',
    nameBn: 'পিরোজপুর',
    nameEn: 'Pirojpur',
    divisionId: 'barishal',
    divisionBn: 'বরিশাল',
    divisionEn: 'Barishal',
    lat: 22.5841,
    lng: 89.9720,
    upazilas: ['পিরোজপুর সদর', 'মঠবাড়িয়া', 'ভাণ্ডারিয়া', 'নাজিরপুর', 'নেছারাবাদ (স্বরূপকাঠি)', 'কাউখালী', 'ইন্দুরকানী'],
  },
  {
    id: 'barguna',
    nameBn: 'বরগুনা',
    nameEn: 'Barguna',
    divisionId: 'barishal',
    divisionBn: 'বরিশাল',
    divisionEn: 'Barishal',
    lat: 22.0953,
    lng: 90.1121,
    upazilas: ['বরগুনা সদর', 'আমতলী', 'পাথরঘাটা', 'বেতাগী', 'বামনা', 'তালতলী'],
  },
  {
    id: 'jhalakathi',
    nameBn: 'ঝালকাঠি',
    nameEn: 'Jhalakathi',
    divisionId: 'barishal',
    divisionBn: 'বরিশাল',
    divisionEn: 'Barishal',
    lat: 22.6406,
    lng: 90.1987,
    upazilas: ['ঝালকাঠি সদর', 'নলছিটি', 'রাজাপুর', 'কাঁঠালিয়া'],
  },

  // =================== রংপুর বিভাগ (Rangpur Division) ===================
  {
    id: 'rangpur_dist',
    nameBn: 'রংপুর',
    nameEn: 'Rangpur',
    divisionId: 'rangpur',
    divisionBn: 'রংপুর',
    divisionEn: 'Rangpur',
    lat: 25.7439,
    lng: 89.2752,
    upazilas: ['রংপুর সদর', 'গঙ্গাচড়া', 'তারাগঞ্জ', 'বদরগঞ্জ', 'পীরগাছা', 'পীরগঞ্জ', 'মিঠাপুকুর', 'কাউনিয়া'],
  },
  {
    id: 'dinajpur',
    nameBn: 'দিনাজপুর',
    nameEn: 'Dinajpur',
    divisionId: 'rangpur',
    divisionBn: 'রংপুর',
    divisionEn: 'Rangpur',
    lat: 25.6217,
    lng: 88.6355,
    upazilas: ['দিনাজপুর সদর', 'পার্বতীপুর', 'বীরগঞ্জ', 'বোচাগঞ্জ', 'কাহারোল', 'চিরিরবন্দর', 'ফুলবাড়ী', 'বিরামপুর', 'নবাবগঞ্জ', 'ঘোড়াঘাট', 'হাকিমপুর'],
  },
  {
    id: 'gaibandha',
    nameBn: 'গাইবান্ধা',
    nameEn: 'Gaibandha',
    divisionId: 'rangpur',
    divisionBn: 'রংপুর',
    divisionEn: 'Rangpur',
    lat: 25.3288,
    lng: 89.5430,
    upazilas: ['গাইবান্ধা সদর', 'গোবিন্দগঞ্জ', 'সুন্দরগঞ্জ', 'পলাশবাড়ী', 'সাদুল্লাপুর', 'ফুলছড়ি', 'সাঘাটা'],
  },
  {
    id: 'kurigram',
    nameBn: 'কুড়িগ্রাম',
    nameEn: 'Kurigram',
    divisionId: 'rangpur',
    divisionBn: 'রংপুর',
    divisionEn: 'Rangpur',
    lat: 25.8054,
    lng: 89.6362,
    upazilas: ['কুড়িগ্রাম সদর', 'উলিপুর', 'নাগেশ্বরী', 'ভূরুঙ্গামারী', 'চিলমারী', 'রাজারহাট', 'রৌমারী', 'রাজিবপুর'],
  },
  {
    id: 'nilphamari',
    nameBn: 'নীলফামারী',
    nameEn: 'Nilphamari',
    divisionId: 'rangpur',
    divisionBn: 'রংপুর',
    divisionEn: 'Rangpur',
    lat: 25.9318,
    lng: 88.8560,
    upazilas: ['নীলফামারী সদর', 'সৈয়দপুর', 'ডোমার', 'ডিমলা', 'জলঢাকা', 'কিশোরগঞ্জ'],
  },
  {
    id: 'lalmonirhat',
    nameBn: 'লালমনিরহাট',
    nameEn: 'Lalmonirhat',
    divisionId: 'rangpur',
    divisionBn: 'রংপুর',
    divisionEn: 'Rangpur',
    lat: 25.9923,
    lng: 89.2847,
    upazilas: ['লালমনিরহাট সদর', 'পাটগ্রাম', 'হাতীবান্ধা', 'কালীগঞ্জ', 'আদিতমারী'],
  },
  {
    id: 'thakurgaon',
    nameBn: 'ঠাকুরগাঁও',
    nameEn: 'Thakurgaon',
    divisionId: 'rangpur',
    divisionBn: 'রংপুর',
    divisionEn: 'Rangpur',
    lat: 26.0337,
    lng: 88.4617,
    upazilas: ['ঠাকুরগাঁও সদর', 'পীরগঞ্জ', 'বালিয়াডাঙ্গী', 'রাণীশংকৈল', 'হরিপুর'],
  },
  {
    id: 'panchagarh',
    nameBn: 'পঞ্চগড়',
    nameEn: 'Panchagarh',
    divisionId: 'rangpur',
    divisionBn: 'রংপুর',
    divisionEn: 'Rangpur',
    lat: 26.3411,
    lng: 88.5542,
    upazilas: ['পঞ্চগড় সদর', 'তেঁতুলিয়া', 'বোদা', 'দেবীগঞ্জ', 'আটোয়ারী'],
  },

  // =================== ময়মনসিংহ বিভাগ (Mymensingh Division) ===================
  {
    id: 'mymensingh_dist',
    nameBn: 'ময়মনসিংহ',
    nameEn: 'Mymensingh',
    divisionId: 'mymensingh',
    divisionBn: 'ময়মনসিংহ',
    divisionEn: 'Mymensingh',
    lat: 24.7471,
    lng: 90.4203,
    upazilas: ['ময়মনসিংহ সদর', 'মুক্তাগাছা', 'ত্রিশাল', 'ভালুকা', 'ফুলবাড়িয়া', 'গফরগাঁও', 'গৌরীপুর', 'ঈশ্বরগঞ্জ', 'নান্দাইল', 'হালুয়াঘাট', 'ধোবাউড়া', 'ফুলপুর', 'তারাকান্দা'],
  },
  {
    id: 'jamalpur',
    nameBn: 'জামালপুর',
    nameEn: 'Jamalpur',
    divisionId: 'mymensingh',
    divisionBn: 'ময়মনসিংহ',
    divisionEn: 'Mymensingh',
    lat: 24.9375,
    lng: 89.9378,
    upazilas: ['জামালপুর সদর', 'সরিষাবাড়ী', 'মেলান্দহ', 'মাদারগঞ্জ', 'ইসলামপুর', 'দেওয়ানগঞ্জ', 'বকশীগঞ্জ'],
  },
  {
    id: 'netrokona',
    nameBn: 'নেত্রকোণা',
    nameEn: 'Netrokona',
    divisionId: 'mymensingh',
    divisionBn: 'ময়মনসিংহ',
    divisionEn: 'Mymensingh',
    lat: 24.8709,
    lng: 90.7279,
    upazilas: ['নেত্রকোণা সদর', 'কেন্দুয়া', 'দুর্গাপুর', 'পূর্বধলা', 'মোহনগঞ্জ', 'বারহাট্টা', 'কলমাকান্দা', 'মদন', 'খালিয়াজুড়ী', 'আটপাড়া'],
  },
  {
    id: 'sherpur_dist',
    nameBn: 'শেরপুর',
    nameEn: 'Sherpur',
    divisionId: 'mymensingh',
    divisionBn: 'ময়মনসিংহ',
    divisionEn: 'Mymensingh',
    lat: 25.0205,
    lng: 90.0153,
    upazilas: ['শেরপুর সদর', 'নালিতাবাড়ী', 'নকলা', 'ঝিনাইগাতী', 'শ্রীবরদী'],
  },
];

/**
 * Calculates Haversine distance in kilometers between two GPS points
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds the nearest district based on user GPS latitude & longitude
 */
export function findNearestDistrict(
  userLat: number,
  userLng: number
): { district: DistrictInfo; distanceKm: number } {
  let nearest = allDistricts[0];
  let minDistance = calculateDistanceKm(userLat, userLng, nearest.lat, nearest.lng);

  for (let i = 1; i < allDistricts.length; i++) {
    const d = allDistricts[i];
    const dist = calculateDistanceKm(userLat, userLng, d.lat, d.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = d;
    }
  }

  return { district: nearest, distanceKm: Math.round(minDistance * 10) / 10 };
}

/**
 * Quick search helper across district Bengali name, English name, and Upazilas
 */
export function searchGeoLocations(query: string): {
  districts: DistrictInfo[];
  matchedUpazilas: { upazila: string; district: DistrictInfo }[];
} {
  const clean = query.trim().toLowerCase();
  if (!clean) {
    return { districts: allDistricts, matchedUpazilas: [] };
  }

  const matchedDistricts: DistrictInfo[] = [];
  const matchedUpazilas: { upazila: string; district: DistrictInfo }[] = [];

  for (const d of allDistricts) {
    const matchDistrictBn = d.nameBn.toLowerCase().includes(clean);
    const matchDistrictEn = d.nameEn.toLowerCase().includes(clean);
    const matchDivision = d.divisionBn.toLowerCase().includes(clean) || d.divisionEn.toLowerCase().includes(clean);

    if (matchDistrictBn || matchDistrictEn || matchDivision) {
      matchedDistricts.push(d);
    }

    for (const up of d.upazilas) {
      if (up.toLowerCase().includes(clean)) {
        matchedUpazilas.push({ upazila: up, district: d });
      }
    }
  }

  return { districts: matchedDistricts, matchedUpazilas };
}
