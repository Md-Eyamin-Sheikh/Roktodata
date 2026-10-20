<div align="center">

# 🩸 রক্তদাতা — Roktodata
### মানবিক রক্তদান প্ল্যাটফর্ম | Humanitarian Blood Donation Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.4.9-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.1-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.11-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-2.118.0-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)

> **রক্তদাতা** হলো বাংলাদেশের জন্য নির্মিত একটি প্রিমিয়াম মোবাইল-ফার্স্ট রক্তদান প্ল্যাটফর্ম, যেখানে জরুরি রক্তের প্রয়োজনে দাতা ও গ্রহীতাকে রিয়েল-টাইমে সংযুক্ত করা হয়।
>
> **Roktodata** is a premium mobile-first blood donation platform built for Bangladesh, connecting blood donors and recipients in real-time during emergencies.

</div>

---

## 📋 সূচিপত্র | Table of Contents

- [প্রজেক্ট পরিচিতি](#-প্রজেক্ট-পরিচিতি--project-overview)
- [প্রযুক্তি স্ট্যাক](#-প্রযুক্তি-স্ট্যাক--tech-stack)
- [ফিচার সমূহ](#-ফিচার-সমূহ--features)
- [ডেটাবেজ স্কিমা](#-ডেটাবেজ-স্কিমা--database-schema)
- [ফাইল স্ট্রাকচার](#-ফাইল-স্ট্রাকচার--file-structure)
- [ডিজাইন সিস্টেম](#-ডিজাইন-সিস্টেম--design-system)
- [এনভায়রনমেন্ট ভ্যারিয়েবল](#-এনভায়রনমেন্ট-ভ্যারিয়েবল--environment-variables)
- [ইন্সটলেশন ও রান](#-ইন্সটলেশন-ও-রান--installation--running)
- [কোড মেট্রিক্স](#-কোড-মেট্রিক্স)

---

## 🎯 প্রজেক্ট পরিচিতি | Project Overview

রক্তদাতা প্ল্যাটফর্মটি বাংলাদেশের ৬৪টি জেলায় জরুরি রক্তের সংকট মোকাবেলায় ডিজিটাল সমাধান হিসেবে তৈরি করা হয়েছে। এটি একটি সম্পূর্ণ ফুল-স্ট্যাক অ্যাপ্লিকেশন যা রক্তদাতা, রক্তগ্রহীতা, হাসপাতাল ও অ্যাম্বুলেন্স সেবাকে এক প্ল্যাটফর্মে একত্রিত করে।

The Roktodata platform is a full-stack digital solution to address blood emergencies across all 64 districts of Bangladesh. It unifies blood donors, recipients, hospitals, and ambulance services under one platform.

**মূল লক্ষ্য:**
- জরুরি রক্তের প্রয়োজনে দ্রুত দাতা খুঁজে দেওয়া
- রক্তদানের ইতিহাস ও স্বাস্থ্য তথ্য সংরক্ষণ
- হাসপাতাল ও ব্লাড ব্যাংকের স্টক ট্র্যাকিং
- বাংলা ও ইংরেজি উভয় ভাষায় সেবা প্রদান

---

## 🛠 প্রযুক্তি স্ট্যাক | Tech Stack

### কোর ফ্রেমওয়ার্ক | Core Frameworks

| প্রযুক্তি | ভার্সন | ব্যবহার |
|---|---|---|
| **Next.js** (App Router) | `^15.4.9` | ফুল-স্ট্যাক React ফ্রেমওয়ার্ক, SSR, রাউটিং |
| **React** | `^19.2.1` | UI লাইব্রেরি, কম্পোনেন্ট-ভিত্তিক আর্কিটেকচার |
| **TypeScript** | `5.9.3` | স্ট্যাটিক টাইপ-চেকিং, ইন্টারফেস ও মডেল ডেফিনিশন |

### স্টাইলিং | Styling

| প্রযুক্তি | ভার্সন | ব্যবহার |
|---|---|---|
| **Tailwind CSS v4** | `4.1.11` | ইউটিলিটি-ফার্স্ট CSS ফ্রেমওয়ার্ক |
| **@tailwindcss/postcss** | `4.1.11` | PostCSS প্লাগইন |
| **@tailwindcss/typography** | `^0.5.19` | টাইপোগ্রাফি ইউটিলিটি |
| **tw-animate-css** | `^1.4.0` | CSS অ্যানিমেশন ইউটিলিটি |
| **clsx** | `^2.1.1` | ক্লাস নেম কম্বাইনিং |
| **tailwind-merge** | `^3.3.1` | Tailwind ক্লাস মার্জ করা |
| **class-variance-authority** | `^0.7.1` | ভেরিয়েন্ট-ভিত্তিক কম্পোনেন্ট স্টাইলিং |

### অ্যানিমেশন | Animation

| প্রযুক্তি | ভার্সন | ব্যবহার |
|---|---|---|
| **Motion** (`motion/react`) | `^12.23.24` | ফ্লুয়েন্ট UI অ্যানিমেশন, পেজ ট্রানজিশন, মোডাল |

### ব্যাকএন্ড ও ডেটাবেজ | Backend & Database

| প্রযুক্তি | ভার্সন | ব্যবহার |
|---|---|---|
| **Supabase** | `^2.118.0` | PostgreSQL DB, Realtime, Auth, Row Level Security |
| **Mongoose** | `^9.11.2` | MongoDB ORM (referenced) |

### AI ও এক্সটার্নাল সার্ভিস | AI & External Services

| প্রযুক্তি | ভার্সন | ব্যবহার |
|---|---|---|
| **@google/genai** | `^2.4.0` | Google Gemini AI API ইন্টিগ্রেশন |
| **Firebase Tools** | `^15.0.0` | ডেপ্লয়মেন্ট টুলস |

### আইকন ও ফন্ট | Icons & Fonts

| প্রযুক্তি | ভার্সন | ব্যবহার |
|---|---|---|
| **Lucide React** | `^0.553.0` | SVG আইকন লাইব্রেরি |
| **Google Fonts: Noto Sans Bengali** | — | বাংলা ফন্ট |
| **Google Fonts: Inter** | — | ইংরেজি ফন্ট |

### ফর্ম ও ভ্যালিডেশন | Forms & Validation

| প্রযুক্তি | ভার্সন | ব্যবহার |
|---|---|---|
| **@hookform/resolvers** | `^5.2.1` | React Hook Form রিজলভার |

### ওয়েব APIs (Native Browser)

| API | ব্যবহার |
|---|---|
| **Web Audio API** | অডিও নোটিফিকেশন, ওসিলেটর-ভিত্তিক চাইম সাউন্ড |
| **Web Share API** | WhatsApp, Telegram, Facebook, SMS-এ শেয়ার |
| **Web Push Notification API** | নেটিভ ব্রাউজার পুশ নোটিফিকেশন |
| **HTML5 Canvas API** | ১২০০×৭৫০ PNG ডোনার কার্ড তৈরি |
| **Navigator Geolocation API** | GPS দিয়ে জেলা অটো-ডিটেক্ট |
| **Clipboard API** | লিংক ও টেক্সট কপি |

### স্টেট ম্যানেজমেন্ট | State Management

| পদ্ধতি | ব্যবহার |
|---|---|
| **`React.useSyncExternalStore`** | SSR-সেফ গ্লোবাল স্টেট (Auth, Language) |
| **Custom Event Listeners** | কম্পোনেন্টের মধ্যে ইভেন্ট ব্রডকাস্ট |
| **localStorage** | অফলাইন ডেটা ক্যাশ, ভাষা ও সেশন স্টোরেজ |

### ডেভ টুলস | Dev Tools

| প্রযুক্তি | ভার্সন |
|---|---|
| **ESLint** | `9.39.1` |
| **eslint-config-next** | `16.0.8` |
| **PostCSS** | `^8.5.6` |
| **Autoprefixer** | `^10.4.21` |

---

## ✨ ফিচার সমূহ | Features

### 1. 📱 মোবাইল-ফার্স্ট অ্যাপ শেল ও নেভিগেশন

- **বটম নেভিগেশন বার** (মোবাইল): ৫টি ট্যাব — হোম, রিকোয়েস্ট, রক্ত চাও (উঁচু সেন্টার FAB), ডোনার ডিরেক্টরি, প্রোফাইল। ফ্রস্টেড গ্লাস (`backdrop-blur-2xl`), অ্যানিমেটেড অ্যাক্টিভ ইন্ডিকেটর, পালস ব্যাজ।
- **টপ হেডার**: ফিক্সড, রেসপন্সিভ। ব্র্যান্ড লোগো, জেলা পিল, ডেস্কটপ নেভ লিংক, ল্যাঙ্গুয়েজ সুইচার, নোটিফিকেশন বেল, DB এক্সপ্লোরার বাটন।
- **ফুটার**: শুধু ট্যাবলেট/ডেস্কটপে দেখায়।
- **ডেস্কটপ সাইডবার** (lg+): এমার্জেন্সি হটলাইন ব্যানার, লাইভ ব্লাড স্টক উইজেট (৮টি গ্রুপ), কুইক সার্ভিস শর্টকাট।

---

### 2. 🏠 হোম স্ক্রিন

- ওয়েলকাম হেডার সহ ডোনার স্ট্যাটাস টগল (Active ↔ Resting)
- লাইভ পালস বার: ফুলফিলমেন্ট রেট, গড় রেসপন্স টাইম, রেডি ডোনার কাউন্ট
- কুইক অ্যাকশন গ্রিড: ব্লাড স্টক, অ্যাম্বুলেন্স, হেলথ গাইড, ড্যাশবোর্ড
- চলমান সক্রিয় রিকোয়েস্ট অ্যালার্ট কার্ড
- কাছের জরুরি রিকোয়েস্ট লিস্ট (জেলা ভিত্তিক রিয়েল-টাইম ফিল্টার)
- আসন্ন ডোনেশন ক্যাম্প লিস্ট সহ RSVP টগল

---

### 3. 🔐 অথেন্টিকেশন সিস্টেম

- **AuthModal**: ফোন নম্বর + OTP দিয়ে লগইন ও রেজিস্ট্রেশন
- **OTP ফ্লো**: ৬ ডিজিটের ক্রিপ্টোগ্রাফিক OTP, Supabase SMS (Twilio) গেটওয়ে, ডেভ মোডে UI-তে OTP প্রদর্শন
- **রেজিস্ট্রেশন**: `profiles` ও `donor_profiles` টেবিলে সেভ + localStorage ক্যাশ
- **লগইন**: Supabase প্রথম, ব্যর্থ হলে localStorage ফলব্যাক
- **সেশন**: `useSyncExternalStore` দিয়ে SSR-সেফ অথ লিসেনার
- **ডোনার প্রোফাইল সেটআপ উইজার্ড**: রেজিস্ট্রেশনের পর বিস্তারিত তথ্য সংগ্রহ

---

### 4. 🩸 জরুরি ব্লাড রিকোয়েস্ট — ৫ ধাপের উইজার্ড

| ধাপ | বিবরণ |
|---|---|
| **ধাপ ১** | ব্লাড গ্রুপ, ব্যাগ সংখ্যা, কম্পোনেন্ট টাইপ (হোল/প্লেটলেটস/প্লাজমা) |
| **ধাপ ২** | জেলা (৬৪টি), হাসপাতালের নাম (অটো-সাজেস্ট), ওয়ার্ড/বেড নম্বর |
| **ধাপ ৩** | রোগীর তথ্য, কারণ, জরুরিতার মাত্রা |
| **ধাপ ৪** | যোগাযোগ নম্বর, প্রেসক্রিপশন ইমেজ URL, প্রাইভেসি নোটিস |
| **ধাপ ৫** | লাইভ ব্রডকাস্ট ট্র্যাকিং (রিয়েল-টাইম রেসপন্ডিং ডোনার) |

Supabase `emergency_requests` টেবিলে রেকর্ড সংরক্ষণ করা হয়।

---

### 5. 📋 ব্লাড রিকোয়েস্ট ভিউ

- আমার সক্রিয় রিকোয়েস্ট কার্ড সহ ৫-ধাপের প্রগ্রেস ট্র্যাকার
- রেসপন্ডিং ডোনার লিস্ট: নাম, দূরত্ব, ETA, ভেরিফাইড ব্যাজ, কল/চ্যাট/কনফার্ম বাটন
- কাছের রিকোয়েস্ট লিস্ট সহ ব্লাড গ্রুপ ও দূরত্ব ফিল্টার
- ডোনার রেসপন্স কনফার্মেশন ফ্লো
- চ্যাট ও ফ্রড রিপোর্ট ইন্টিগ্রেশন
- **ভেলোসিটি বার**: রিকোয়েস্ট পূরণের গতি মেট্রিক্স

---

### 6. 👥 ডোনার ডিরেক্টরি

- ব্লাড গ্রুপ রেশিও বার চার্ট (ট্যাপ করে ফিল্টার)
- নাম/এলাকা/হাসপাতাল দিয়ে সার্চ
- ফিল্টার: আজ উপলব্ধ / শুধু ভেরিফাইড
- ডোনার কার্ড: অ্যাভাটার, ব্লাড গ্রুপ, দূরত্ব, সর্বশেষ ডোনেশন, রেসপন্স টাইম, বুকমার্ক
- প্রতি ডোনারের জন্য সরাসরি রিকোয়েস্ট বাটন
- Supabase লাইভ ডেটা সহ লোকাল সিড ফলব্যাক

---

### 7. 👤 ইউজার প্রোফাইল ভিউ (সবচেয়ে জটিল — ২১৬৭ লাইন)

#### 🪪 ডিজিটাল স্মার্ট ID কার্ড
- **সামনের পাতা**: গ্রেডিয়েন্ট + গোল্ড চিপ + NFC + QR + ব্লাড গ্রুপ শিল্ড + ডোনার তথ্য
- **পেছনের পাতা**: ম্যাগ স্ট্রাইপ + কম্প্যাটিবিলিটি ম্যাট্রিক্স + বারকোড + সিগনেচার
- **ফ্লিপ অ্যানিমেশন**: কার্ডের সামনে-পেছন দেখতে

#### 🖼 ১২০০×৭৫০ PNG ডাউনলোড
- HTML5 Canvas দিয়ে ফুল রেন্ডারিং (মাইক্রোগ্রিড, ওয়াটারমার্ক, গ্রেডিয়েন্ট, চিপ সার্কিট ট্রেস)

#### 📤 মাল্টি-চ্যানেল শেয়ার ইঞ্জিন
- WhatsApp, Telegram, Facebook, SMS, Web Share API (ফাইলসহ), লিংক কপি, টেক্সট কপি

#### ⏱ বায়োলজিক্যাল এলিজিবিলিটি ট্র্যাকার
- ৯০ দিনের রিকভারি কাউন্টডাউন সার্কুলার গেজ
- "আজ ডোনেট করলাম" বাটন, কাস্টম ডেট ক্যালকুলেটর
- "এখনই প্রস্তুত" ওভাররাইড, এলিজিবিলিটি রিমাইন্ডার টগল

#### 🔛 ডোনার অ্যাভেইলেবিলিটি কন্ট্রোল
- Active/Resting মাস্টার টগল
- ১/৭/৩০ দিন বা কাস্টম বিরতি, Resume Now
- Emergency-only মোড
- নোটিফিকেশন রেডিয়াস (৫/১৫/২৫ কিমি)
- Quiet Hours (রাত ১১টা–সকাল ৬টা)

#### 📜 ডোনেশন হিস্ট্রি লগার
- নতুন রেকর্ড যোগ (হাসপাতাল, তারিখ, গ্রহীতার ধরন, ব্যাগ, নোট)
- রেকর্ড মুছুন, অটো সার্টিফিকেট ID জেনারেশন

#### 🏆 জীবন রক্ষার সার্টিফিকেট
- প্রতি ডোনেশনের জন্য গোল্ডেন-বর্ডার ডিজিটাল সার্টিফিকেট মোডাল

---

### 8. 📊 ব্লাড অ্যানালিটিক্স চার্টস (৪ ক্যাটাগরি)

| চার্ট | বিবরণ |
|---|---|
| **ডোনেশন টাইমলাইন + হিমোগ্লোবিন কার্ভ** | মাসিক ডোনেশন বার + Hb রিকভারি পার্সেন্টেজ ওয়েভ |
| **গ্রুপ ডিমান্ড বনাম সাপ্লাই** | ৮টি ব্লাড গ্রুপ, ডেফিসিট অ্যালার্ট, অনুমানিত অপেক্ষার সময় |
| **২৪ ঘণ্টার রেসপন্স ভেলোসিটি + পিক আওয়ার** | ঘণ্টা-ভিত্তিক রেসপন্স স্পিড চার্ট |
| **উপজেলা ব্লাড ডেনসিটি** | উপজেলা ভিত্তিক ডোনার কনসেন্ট্রেশন ও ফিল রেট |

**টাইম ফিল্টার**: আজ / সপ্তাহ / মাস / ২০২৬

---

### 9. 🏥 হাসপাতাল ও ব্লাড ব্যাংক ড্যাশবোর্ড

- ৩টি সিড হাসপাতাল + Supabase লাইভ হাসপাতাল
- প্রতি হাসপাতালে ৮টি ব্লাড গ্রুপের ইনভেন্টরি (adequate/limited/empty স্ট্যাটাস)
- ইন্টারঅ্যাক্টিভ ইনভেন্টরি গ্রাফ, ৫-ব্যাগ সেফ রিজার্ভ থ্রেশহোল্ড

---

### 10. 🚑 অ্যাম্বুলেন্স ডিরেক্টরি

- ICU, ফ্রিজিং, AC, নরমাল টাইপের অ্যাম্বুলেন্স
- ২৪/৭ অ্যাভেইলেবিলিটি ব্যাজ, ফোন লিংক
- Supabase লাইভ + লোকাল ফলব্যাক (জাতীয় ৯৯৯ ইমার্জেন্সি লাইনসহ)

---

### 11. ❤️ স্বাস্থ্য শিক্ষা কেন্দ্র

- ৩টি আর্টিকেল ক্যাটাগরি: যোগ্যতার মানদণ্ড, আগে/পরের টিপস, মিথ বনাম তথ্য
- এক্সপান্ডেবল ডিটেইল কার্ড

---

### 12. 🔔 নোটিফিকেশন সেন্টার

- ক্যাটাগরি: জরুরি, আমার রিকোয়েস্ট, ক্যাম্প, স্বাস্থ্য, সিস্টেম
- সব পঠিত মার্ক, প্রতি নোটিফিকেশনে অ্যাকশন (কল, রেসপন্ড, ক্যালেন্ডার, ডিটেইলস)
- **রিয়েল-টাইম**: Supabase `postgres_changes` সাবস্ক্রিপশন
- নেটিভ ব্রাউজার পুশ নোটিফিকেশন সাপোর্ট

---

### 13. ⚙️ সেটিংস স্ক্রিন

- ভাষা টগল (বাংলা/ইংরেজি), টেক্সট সাইজ (১০০%/১২৫%/১৫০%), রিডিউসড মোশন
- ফোন দৃশ্যমানতা (শুধু ভেরিফাইড পরিবার / সকল রেজিস্টার্ড)
- অডিট লগ ভিউয়ার
- অভিযোগ/ফ্রড রিপোর্ট ফর্ম
- প্রোফাইল আপডেট (নাম, ব্লাড গ্রুপ, লোকেশন)
- লগআউট

---

### 14. 🌍 জেলা সিলেক্টর

- বাংলাদেশের সকল ৬৪টি জেলা, ৮টি বিভাগ, প্রতি জেলার উপজেলা (সম্পূর্ণ জিও ডেটা)
- এক ক্লিকে GPS অটো-ডিটেক্ট
- রিয়েল-টাইম Supabase ব্যাজ: প্রতি জেলায় সক্রিয় রিকোয়েস্ট + প্রস্তুত ডোনার সংখ্যা
- জেলা সার্চ/ফিল্টার

---

### 15. 📡 রিয়েল-টাইম Supabase ইন্টিগ্রেশন

- **Postgres Realtime চ্যানেল**: `district-{name}` চ্যানেলে নতুন ইমার্জেন্সি রিকোয়েস্ট ও ডোনার রেসপন্স
- **`global-notifications`** চ্যানেল: সিস্টেম-ওয়াইড নোটিফিকেশন
- **অডিও অ্যালার্ট**: `playNotificationSound()` (sine chime) + `playUrgentAlertSound()` (triangle+sine dual-tone)

---

### 16. 🌐 দ্বিভাষিক ইঞ্জিন (বাংলা ↔ ইংরেজি)

- `useSyncExternalStore`-ভিত্তিক `LanguageContext` — SSR-সেফ
- localStorage-এ পার্সিস্টেন্ট (`roktodata_lang`) সহ কাস্টম ইভেন্ট ব্রডকাস্ট
- **সম্পূর্ণ অনুবাদ অভিধান**: common, nav, home, requests, donors, profile, notifications, analytics সেকশন
- **বাংলা সংখ্যা কনভার্টার**: `toBengaliDigits`, `toEnglishDigits`, `formatDigits`, `formatBengaliPhone`

---

### 17. 💬 সেফ চ্যাট মোডাল

- ব্লাড রিকোয়েস্টার ও রেসপন্ডিং ডোনারের মধ্যে ইন-অ্যাপ সুরক্ষিত মেসেজিং
- চ্যাট থেকে সরাসরি রিপোর্ট/ফ্ল্যাগ করার সুবিধা

---

### 18. 🛡️ ভেরিফিকেশন ও ট্রাস্ট সিস্টেম

- **VerificationExplainerSheet**: NID/মেডিকেল ভেরিফিকেশন ব্যাজের ব্যাখ্যা
- **ReportModal**: অ্যান্টি-ফ্রড, অসদাচরণ রিপোর্টিং সিস্টেম
- **LiveDatabaseViewer**: Supabase লাইভ DB টেবিল ইন্সপেক্টর (ডেভ টুল)
- **অডিট লগ**: কোন অ্যাপ্রুভড হাসপাতাল কোঅর্ডিনেটর ডোনার ডেটা অ্যাক্সেস করেছে

---

## 🗄️ ডেটাবেজ স্কিমা | Database Schema

Supabase PostgreSQL ডেটাবেজে নিচের টেবিলগুলো ব্যবহার করা হয়েছে:

```
📦 profiles
   ├── phone_number      — ফোন নম্বর (প্রাথমিক পরিচয়)
   ├── full_name         — পূর্ণ নাম
   ├── blood_group       — রক্তের গ্রুপ
   ├── division          — বিভাগ
   ├── district          — জেলা
   ├── upazila           — উপজেলা
   └── is_verified       — NID/মেডিকেল ভেরিফাইড কিনা

📦 donor_profiles
   ├── user_id (FK)           — profiles টেবিলের রেফারেন্স
   ├── is_available           — এখন রক্ত দিতে পারবেন কিনা
   ├── total_donations        — মোট রক্তদানের সংখ্যা
   ├── last_donation_date     — সর্বশেষ রক্তদানের তারিখ
   ├── next_eligible_date     — পরবর্তী যোগ্যতার তারিখ
   ├── is_fast_responder      — দ্রুত সাড়া দেন কিনা
   ├── national_id_verified   — NID ভেরিফাইড কিনা
   └── privacy_hide_phone     — ফোন গোপন রাখবেন কিনা

📦 emergency_requests
   ├── blood_group            — প্রয়োজনীয় ব্লাড গ্রুপ
   ├── bags_needed            — ব্যাগের সংখ্যা
   ├── component_type         — whole/platelets/plasma
   ├── hospital_name          — হাসপাতালের নাম
   ├── district               — জেলা
   ├── urgency                — জরুরিতার মাত্রা
   ├── status                 — বর্তমান অবস্থা
   ├── tracking_step          — উইজার্ডের ধাপ (১-৫)
   ├── contact_phone          — যোগাযোগ নম্বর
   ├── prescription_image_url — প্রেসক্রিপশনের ছবি
   └── expires_at             — মেয়াদ উত্তীর্ণের সময়

📦 donor_responses
   ├── request_id   — emergency_requests এর রেফারেন্স
   ├── donor_id     — profiles এর রেফারেন্স
   ├── status       — accepted/on_the_way/confirmed/completed/declined
   └── eta_minutes  — আনুমানিক আসার সময় (মিনিটে)

📦 hospitals_and_banks
   ├── name, type, district, address, hotline, operating_hours

📦 blood_inventory
   ├── hospital_id, blood_group, units_available
   └── status       — available/low/critical

📦 ambulances
   ├── driver_name, service_type, district, phone_number
   └── is_available_24_7

📦 donation_camps
   ├── organizer, venue, district, camp_date
   ├── target_units, registered_count

📦 notifications
   ├── user_id, category, title, description
   └── is_unread
```

---

## 📁 ফাইল স্ট্রাকচার | File Structure

```
Roktodata/
│
├── app/
│   ├── layout.tsx                          # রুট লেআউট, Google Fonts, মেটাডেটা, প্রোভাইডার
│   ├── page.tsx                            # মূল এন্ট্রি পয়েন্ট → <AppShell /> রেন্ডার
│   └── globals.css                         # Tailwind CSS v4 গ্লোবালস, CSS ভেরিয়েবল
│
├── components/
│   ├── analytics/
│   │   └── BloodAnalyticsCharts.tsx        # ৪ ধরনের অ্যানালিটিক্স চার্ট ইঞ্জিন
│   ├── auth/
│   │   ├── AuthModal.tsx                   # ফোন OTP/লগইন/রেজিস্ট্রেশন মোডাল (৬৩১ লাইন)
│   │   └── DonorProfileSetupWizard.tsx     # ডোনার প্রোফাইল সেটআপ উইজার্ড
│   ├── chat/
│   │   └── SafeChatModal.tsx               # সুরক্ষিত ইন-অ্যাপ চ্যাট মোডাল
│   ├── database/
│   │   └── LiveDatabaseViewer.tsx          # Supabase লাইভ DB টেবিল এক্সপ্লোরার
│   ├── directory/
│   │   ├── HospitalBloodBankView.tsx       # হাসপাতাল ও ব্লাড ব্যাংক ডিরেক্টরি
│   │   └── AmbulanceDirectoryView.tsx      # অ্যাম্বুলেন্স সার্ভিস ডিরেক্টরি
│   ├── donor-response/
│   │   └── DonorResponseModal.tsx          # ডোনার রেসপন্স ফ্লো মোডাল
│   ├── donors/
│   │   └── DonorDirectoryView.tsx          # ডোনার ডিরেক্টরি সহ গ্রুপ রেশিও চার্ট
│   ├── education/
│   │   └── HealthEducationView.tsx         # স্বাস্থ্য শিক্ষা আর্টিকেল
│   ├── home/
│   │   └── HomeScreen.tsx                  # মোবাইল-ফার্স্ট হোম স্ক্রিন
│   ├── hospital-dashboard/
│   │   └── HospitalDashboardView.tsx       # হাসপাতাল ব্লাড ইনভেন্টরি ড্যাশবোর্ড
│   ├── layout/
│   │   └── AppShell.tsx                    # মূল অ্যাপ কন্টেইনার, সকল স্টেট, রাউটিং (৮১১ লাইন)
│   ├── location/
│   │   └── DistrictSelectorModal.tsx       # ৬৪-জেলার ড্রয়ার সহ GPS ডিটেকশন
│   ├── navigation/
│   │   ├── Header.tsx                      # রেসপন্সিভ হেডার (২৭৮ লাইন)
│   │   ├── BottomNav.tsx                   # ফ্রস্টেড গ্লাস বটম নেভ (১২৮ লাইন)
│   │   └── Footer.tsx                      # ডেস্কটপ/ট্যাবলেট ফুটার
│   ├── notifications/
│   │   └── NotificationScreen.tsx          # নোটিফিকেশন সেন্টার মোডাল
│   ├── profile/
│   │   └── UserProfileView.tsx             # সম্পূর্ণ প্রোফাইল: স্মার্ট কার্ড, ইতিহাস, শেয়ার (২১৬৭ লাইন)
│   ├── report/
│   │   └── ReportModal.tsx                 # অ্যান্টি-ফ্রড রিপোর্টিং সিস্টেম
│   ├── request/
│   │   └── BloodRequestWizard.tsx          # ৫-ধাপের জরুরি ব্লাড রিকোয়েস্ট উইজার্ড
│   ├── requests/
│   │   └── BloodRequestsView.tsx           # সক্রিয় ব্লাড রিকোয়েস্ট লিস্ট ও ভেলোসিটি বার
│   ├── settings/
│   │   └── SettingsScreen.tsx              # সেটিংস, অডিট লগ, হেল্প সেন্টার
│   ├── ui/
│   │   └── ToastNotification.tsx           # প্রিমিয়াম টোস্ট নোটিফিকেশন সিস্টেম
│   └── verification/
│       └── VerificationExplainerSheet.tsx  # NID/মেডিকেল ব্যাজ এক্সপ্লেইনার
│
├── lib/
│   ├── i18n/
│   │   ├── LanguageContext.tsx             # দ্বিভাষিক কন্টেক্সট (৯৬ লাইন)
│   │   └── translations.ts                 # বাংলা ⇄ ইংরেজি অভিধান (৪১৫ লাইন)
│   ├── geo/
│   │   └── bangladeshGeoData.ts            # ৬৪ জেলা, ৮ বিভাগ, উপজেলা, GPS স্থানাঙ্ক (৮৭৬ লাইন)
│   ├── services/
│   │   ├── authService.ts                  # OTP, রেজিস্ট্রেশন, লগইন, সেশন (৪৯৮ লাইন)
│   │   └── bloodService.ts                 # হাইব্রিড ডেটা সার্ভিস (৯৫০ লাইন)
│   ├── supabase/
│   │   ├── client.ts                       # Singleton Supabase ক্লায়েন্ট ফ্যাক্টরি (৪৫ লাইন)
│   │   └── types.ts                        # সম্পূর্ণ Supabase DB স্কিমা TypeScript টাইপস (২৭৬ লাইন)
│   ├── bengali-utils.ts                    # বাংলা ডিজিট/ফোন/ডেট কনভার্টার (৪৭ লাইন)
│   ├── audioUtils.ts                       # Web Audio API নোটিফিকেশন সাউন্ড (১৩০ লাইন)
│   ├── data.ts                             # লোকাল সিড ডেটা (৫৬৭ লাইন)
│   └── types.ts                            # কেন্দ্রীয় TypeScript মডেল (১৮৫ লাইন)
│
├── .env.example                            # এনভায়রনমেন্ট ভ্যারিয়েবল ডকুমেন্টেশন
├── metadata.json                           # AI Studio অ্যাপ মেটাডেটা
├── package.json                            # ডিপেন্ডেন্সি ও স্ক্রিপ্ট
└── README.md                               # এই ফাইলটি
```

---

## 🎨 ডিজাইন সিস্টেম | Design System

প্রজেক্টটিতে কাস্টম CSS ভেরিয়েবল দিয়ে একটি সুসংগত ডিজাইন টোকেন সিস্টেম তৈরি করা হয়েছে:

```css
/* প্রাথমিক রঙ — Primary */
--primary:            #9e0027   /* গাঢ় লাল — ব্র্যান্ড কালার */
--primary-container:  #c41e3a   /* ক্রিমসন রেড */
--crimson-pressed:    #a3182f   /* প্রেসড স্টেট */
--rose-tint:          #fdecef   /* হালকা গোলাপি ব্যাকগ্রাউন্ড */

/* সেকেন্ডারি ও টার্শিয়ারি */
--secondary:          #0d58c9   /* নীল */
--secondary-fixed:    #d9e2ff   /* হালকা নীল */
--tertiary:           #005938   /* সবুজ */
--tertiary-container: #00744b   /* গাঢ় সবুজ */

/* নিউট্রাল ও ব্যাকগ্রাউন্ড */
--canvas:             #f7f7f9   /* অ্যাপ ব্যাকগ্রাউন্ড */
--surface:            #ffffff   /* কার্ড সার্ফেস */
--on-surface:         #1b1b1f   /* মূল টেক্সট */
--slate-muted:        #5b5f6b   /* মিউটেড টেক্সট */
--border-subtle:      #e4e6eb   /* বর্ডার */

/* স্ট্যাটাস কালার */
--status-amber:       #e89a00   /* সতর্কতা */
--accent-gold:        #c9962b   /* গোল্ড অ্যাকসেন্ট */
```

**ডিজাইন প্রিন্সিপাল:**
- মোবাইল-ফার্স্ট রেসপন্সিভ লেআউট
- ফ্রস্টেড গ্লাস ইফেক্ট (`backdrop-blur`)
- পালস অ্যানিমেশন জরুরি অ্যালার্টের জন্য
- বাংলা ও ইংরেজি ফন্টের সমন্বয়
- উচ্চ কন্ট্রাস্ট রঙ অ্যাক্সেসিবিলিটির জন্য

---

## 🔑 এনভায়রনমেন্ট ভ্যারিয়েবল | Environment Variables

`.env.example` ফাইল থেকে `.env.local` তৈরি করুন:

```env
# Google Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# অ্যাপ URL
APP_URL="your-app-url"

# MongoDB (রেফারেন্স)
MONGODB_URI="mongodb+srv://..."

# JWT
JWT_SECRET="your-secure-jwt-secret"

# Supabase (আবশ্যিক)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

> **গুরুত্বপূর্ণ**: Supabase ভ্যারিয়েবল ছাড়াও অ্যাপটি চলবে — লোকাল সিড ডেটা ফলব্যাক হিসেবে ব্যবহার হবে।

---

## 🚀 ইন্সটলেশন ও রান | Installation & Running

```bash
# রিপোজিটরি ক্লোন করুন
git clone <repository-url>
cd Roktodata

# ডিপেন্ডেন্সি ইন্সটল করুন
npm install

# এনভায়রনমেন্ট ভ্যারিয়েবল সেট করুন
cp .env.example .env.local
# .env.local ফাইলটি এডিট করে আপনার কী গুলো দিন

# ডেভেলপমেন্ট সার্ভার চালু করুন
npm run dev

# প্রোডাকশন বিল্ড
npm run build
npm start

# লিন্ট চেক
npm run lint

# ক্লিন বিল্ড
npm run clean
```

অ্যাপটি **http://localhost:3000** এ চলবে।

---

## 📊 কোড মেট্রিক্স

| মেট্রিক | মান |
|---|---|
| **মোট সোর্স ফাইল** | ৩৫+ TSX/TS ফাইল |
| **সর্ববৃহৎ ফাইল** | `UserProfileView.tsx` — ২১৬৭ লাইন |
| **মোট আনুমানিক লাইন** | ১০,০০০+ লাইন |
| **প্রধান ভাষা** | TypeScript + TSX (১০০%) |
| **স্টাইলিং** | Tailwind CSS v4 ইউটিলিটি ক্লাস (১০০%) |
| **ডেটাবেজ টেবিল** | ৯টি |
| **কম্পোনেন্ট সংখ্যা** | ২৫+ রিউজেবল কম্পোনেন্ট |

| ফাইল | লাইন | বিবরণ |
|---|---|---|
| `UserProfileView.tsx` | ২,১৬৭ | সবচেয়ে জটিল কম্পোনেন্ট |
| `bloodService.ts` | ৯৫০ | হাইব্রিড ডেটা সার্ভিস |
| `bangladeshGeoData.ts` | ৮৭৬ | সম্পূর্ণ বাংলাদেশ ভৌগোলিক ডেটা |
| `AppShell.tsx` | ৮১১ | মূল অ্যাপ শেল ও স্টেট |
| `AuthModal.tsx` | ৬৩১ | অথেন্টিকেশন সিস্টেম |
| `data.ts` | ৫৬৭ | লোকাল সিড ডেটা |
| `authService.ts` | ৪৯৮ | অথ সার্ভিস লজিক |
| `translations.ts` | ৪১৫ | দ্বিভাষিক অনুবাদ |

---

## 🔧 মূল টেকনিক্যাল প্যাটার্ন | Key Technical Patterns

1. **SSR হাইড্রেশন সেফটি**: সব রিঅ্যাক্টিভ স্টেট `React.useSyncExternalStore` ও কাস্টম ইভেন্ট লিসেনার দিয়ে — সার্ভার ও ক্লায়েন্টের মধ্যে হাইড্রেশন মিসম্যাচ থাকে না।

2. **অফলাইন-ফার্স্ট ফলব্যাক**: সব Supabase কোয়েরিতে লোকাল সিড ডেটা ফলব্যাক — DB সংযোগ ছাড়াও অ্যাপ ১০০% কাজ করে।

3. **Singleton Supabase ক্লায়েন্ট**: `getSupabaseClient()` env ভেরিয়েবল না থাকলে `null` রিটার্ন করে, পুরো অ্যাপে ব্যবহৃত।

4. **জেলা-ভিত্তিক রাউটিং**: সব ডেটা (রিকোয়েস্ট, ডোনার, হাসপাতাল, অ্যাম্বুলেন্স, ক্যাম্প) `AppShell`-এর `currentDistrict` স্টেট দিয়ে ফিল্টার হয়।

5. **অডিও সিস্টেম**: `AudioContext` singleton সহ oscillator-ভিত্তিক চাইম (কোনো অডিও ফাইল দরকার নেই)।

6. **Canvas PNG কার্ড**: `document.createElement('canvas')` দিয়ে ১২০০×৭৫০ ডোনার কার্ড রেন্ডার করে PNG হিসেবে ডাউনলোড।

7. **বাংলা সংখ্যা**: কাস্টম `toBengaliDigits`/`formatDigits` ইউটিলিটি সংখ্যা প্রদর্শনে ব্যবহৃত।

---

<div align="center">

**রক্তদাতা** — প্রতিটি রক্তের ফোঁটায় একটি জীবন 🩸

*Built with ❤️ for Bangladesh*

</div>
