<div align="center">

# 🩸 রক্তদাতা — Roktodata
### মানবিক রক্তদান প্ল্যাটফর্ম | Humanitarian Blood Donation Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.4.9-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.1-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.11-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Free_Tier-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Google & Facebook Auth](https://img.shields.io/badge/OAuth-Google_%7C_Facebook-4285F4?style=for-the-badge)](https://supabase.com)

> **রক্তদাতা** হলো বাংলাদেশের জন্য নির্মিত একটি প্রিমিয়াম মোবাইল-ফার্স্ট রক্তদান প্ল্যাটফর্ম, যেখানে জরুরি রক্তের প্রয়োজনে রক্তদাতা ও গ্রহীতাকে রিয়েল-টাইমে সংযুক্ত করা হয়।
>
> **Roktodata** is a premium mobile-first blood donation platform built for Bangladesh, connecting blood donors and recipients in real-time during emergencies.

</div>

---

## 📋 সূচিপত্র | Table of Contents

- [প্রজেক্ট পরিচিতি](#-প্রজেক্ট-পরিচিতি--project-overview)
- [প্রযুক্তি স্ট্যাক](#-প্রযুক্তি-স্ট্যাক--tech-stack)
- [১০০% ফ্রি অথেন্টিকেশন আর্কিটেকচার](#-১০০-ফ্রি-অথেন্টিকেশন-আর্কিটেকচার--free-tier-auth)
- [ফিচার সমূহ](#-ফিচার-সমূহ--features)
- [ডেটাবেজ স্কিমা](#-ডেটাবেজ-স্কিমা--database-schema)
- [ফাইল স্ট্রাকচার](#-ফাইল-স্ট্রাকচার--file-structure)
- [ডিজাইন সিস্টেম](#-ডিজাইন-সিস্টেম--design-system)
- [এনভায়রনমেন্ট ভ্যারিয়েবল ও সুপারবেস কনফিগারেশন](#-এনভায়রনমেন্ট-ভ্যারিয়েবল--environment-variables)
- [ইন্সটলেশন ও রান](#-ইন্সটলেশন-ও-রান--installation--running)
- [কোড মেট্রিক্স ও টেকনিক্যাল প্যাটার্ন](#-কোড-মেট্রিক্স)

---

## 🎯 প্রজেক্ট পরিচিতি | Project Overview

রক্তদাতা প্ল্যাটফর্মটি বাংলাদেশের ৬৪টি জেলায় জরুরি রক্তের সংকট মোকাবেলায় ডিজিটাল সমাধান হিসেবে তৈরি করা হয়েছে। এটি একটি সম্পূর্ণ ফুল-স্ট্যাক ও মোবাইল-ফার্স্ট অ্যাপ্লিকেশন যা রক্তদাতা, রক্তগ্রহীতা, হাসপাতাল ও অ্যাম্বুলেন্স সেবাকে এক প্ল্যাটফর্মে একত্রিত করে।

**মূল লক্ষ্য:**
- জরুরি রক্তের প্রয়োজনে কোনো মধ্যস্বত্বভোগী বা খরচ ছাড়া সরাসরি রক্তদাতা খুঁজে দেওয়া
- রক্তদানের ইতিহাস, স্বাস্থ্য তথ্য ও বায়োলজিক্যাল রিকভারি সংরক্ষণ
- হাসপাতাল ও ব্লাড ব্যাংকের রিয়েল-টাইম রক্তের স্টক ট্র্যাকিং
- বাংলা ও ইংরেজি উভয় ভাষায় স্বাচ্ছন্দ্যময় অভিজ্ঞতা প্রদান
- **সম্পূর্ণ ফ্রিতে চালনাযোগ্য**: কোনো পেইড এসএমএস গেটওয়ে বা অতিরিক্ত খরচের প্রয়োজন নেই।

---

## 🛠 প্রযুক্তি স্ট্যাক | Tech Stack

### কোর ফ্রেমওয়ার্ক | Core Frameworks

| প্রযুক্তি | ভার্সন | ব্যবহার |
|---|---|---|
| **Next.js** (App Router) | `^15.4.9` | ফুল-স্ট্যাক React ফ্রেমওয়ার্ক, SSR, রাউটিং |
| **React** | `^19.2.1` | UI লাইব্রেরি, কম্পোনেন্ট-ভিত্তিক আর্কিটেকচার |
| **TypeScript** | `5.9.3` | স্ট্যাটিক টাইপ-চেকিং, ইন্টারফেস ও মডেল ডেফিনিশন |

### স্টাইলিং ও রেসপনসিভনেস | Styling

| প্রযুক্তি | ভার্সন | ব্যবহার |
|---|---|---|
| **Tailwind CSS v4** | `4.1.11` | ইউটিলিটি-ফার্স্ট CSS ফ্রেমওয়ার্ক |
| **@tailwindcss/postcss** | `4.1.11` | PostCSS প্লাগইন |
| **@tailwindcss/typography** | `^0.5.19` | টাইপোগ্রাফি ইউটিলিটি |
| **tw-animate-css** | `^1.4.0` | CSS অ্যানিমেশন ইউটিলিটি |
| **clsx** & **tailwind-merge** | `^2.1.1` / `^3.3.1` | ক্লাস নেম মার্জিং ও কম্বাইনিং |
| **Viewport Scroll Engine** | — | `overflow-x: clip` ভিত্তিক আধুনিক ও বাধাহীন স্ক্রলিং |

### অ্যানিমেশন | Animation

| প্রযুক্তি | ভার্সন | ব্যবহার |
|---|---|---|
| **Motion** (`motion/react`) | `^12.23.24` | ফ্লুয়েন্ট UI অ্যানিমেশন, পেজ ট্রানজিশন, মোডাল |

### ব্যাকএন্ড, ডেটাবেজ ও অথ | Backend & Auth

| প্রযুক্তি | ভার্সন | ব্যবহার |
|---|---|---|
| **Supabase (PostgreSQL 15+)** | `^2.118.0` | ক্লাউড ডেটাবেস, Realtime চ্যানেল, Row Level Security |
| **Supabase Auth (Free Tier)** | `^2.118.0` | ইমেইল/পাসওয়ার্ড, গুগল (Google) ও ফেসবুক (Facebook) OAuth |

### ওয়েব APIs (Native Browser)

| API | ব্যবহার |
|---|---|
| **Web Audio API** | অডিও নোটিফিকেশন, ওসিলেটর-ভিত্তিক চাইম সাউন্ড |
| **Web Share API** | WhatsApp, Telegram, Facebook, SMS-এ ডিরেক্ট শেয়ার |
| **Web Push Notification API** | নেটিভ ব্রাউজার পুশ নোটিফিকেশন |
| **HTML5 Canvas API** | ১২০০×৭৫০ হাই-রেস ডিজিটাল ডোনার স্মার্ট কার্ড তৈরি |
| **Navigator Geolocation API** | GPS দিয়ে নিকটতম জেলা অটো-ডিটেক্ট |
| **Clipboard API** | লিংক, কোড ও টেক্সট ১-ক্লিকে কপি |

---

## 🔐 ১০০% ফ্রি অথেন্টিকেশন আর্কিটেকচার | Free-Tier Auth

একজন শিক্ষার্থী বা ওপেন-সোর্স কমিউনিটির জন্য সম্পূর্ণ বিনামূল্যে প্ল্যাটফর্মটি পরিচালনা করতে এসএমএস ওটিপি-র (Twilio/Paid Gateway) বিকল্প হিসেবে **Supabase Free Tier** ভিত্তিক আধুনিক অথেন্টিকেশন সিস্টেম যুক্ত করা হয়েছে:

```
                            ┌───────────────────────────────────┐
                            │    Roktodata Authentication       │
                            └─────────────────┬─────────────────┘
                                              │
               ┌──────────────────────────────┼──────────────────────────────┐
               ▼                              ▼                              ▼
    ┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
    │     Google OAuth     │      │    Facebook OAuth    │      │   Email & Password   │
    │  (1-Click Social)    │      │  (1-Click Social)    │      │  (Sign In & Sign Up) │
    └──────────┬───────────┘      └──────────┬───────────┘      └──────────┬───────────┘
               │                             │                             │
               └──────────────────────┬──────┴─────────────────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │ Mandatory Mobile Number   │
                        │ & Blood Group Collection  │
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │    Supabase PostgreSQL    │
                        │ (profiles + donor_profile)│
                        └───────────────────────────┘
```

1. **গুগল ও ফেসবুক ১-ক্লিক সাইন ইন (OAuth)**:
   - কোনো পাসওয়ার্ড মনে রাখার ঝামেলা নেই।
   - গুগল ও মেটা ডেভেলপার কনসোলের ফ্রি ক্রেডেনশিয়াল দিয়ে আনলিমিটেড ফ্রি লগইন।
2. **ইমেইল ও পাসওয়ার্ড রেজিস্ট্রেশন**:
   - পূর্ণ নাম, ইমেইল, পাসওয়ার্ড ও মোবাইল নম্বর দিয়ে সরাসরি অ্যাকাউন্ট তৈরি।
3. **বাধ্যতামূলক মোবাইল নম্বর সংগ্রহ (Mandatory Mobile Number)**:
   - রক্তদান একটি জরুরি সেবামূলক কাজ, যেখানে রোগীর স্বজনদের তাৎক্ষণিক ডোনারকে কল করতে হয়।
   - তাই রেজিস্ট্রেশনের সময় এবং সোশ্যাল লগইনকারীদের থেকে প্রথমবারই সচল বাংলাদেশি মোবাইল নম্বর (`০১৭১২-৩৪৫৬৭৮`) ও রক্তের গ্রুপ সংগ্রহ করে ক্লাউড ডেটাবেসে সংরক্ষণ করা হয়।
4. **বিনামূল্যে পাসওয়ার্ড রিকভারি**:
   - পাসওয়ার্ড ভুলে গেলে সরাসরি ইমেইলে সুরক্ষিত রিসেট লিংক পাঠানো হয়।

---

## ✨ ফিচার সমূহ | Features

### 1. 📱 মোবাইল-ফার্স্ট অ্যাপ শেল ও নেভিগেশন
- **বটম নেভিগেশন বার** (মোবাইল): ৫টি ট্যাব — হোম, রিকোয়েস্ট, রক্ত চান (উঁচু সেন্টার FAB), ডোনার ডিরেক্টরি, প্রোফাইল। ফ্রস্টেড গ্লাস (`backdrop-blur-2xl`), পালস ব্যাজ।
- **টপ হেডার**: ফিক্সড, রেসপন্সিভ। ব্র্যান্ড লোগো, জেলা পিল, ডেস্কটপ নেভ লিংক, নোটিফিকেশন বেল, DB এক্সপ্লোরার বাটন।
- **ডেস্কটপ সাইডবার** (lg+): এমার্জেন্সি হটলাইন ব্যানার, লাইভ ব্লাড স্টক উইজেট (৮টি গ্রুপ), কুইক সার্ভিস শর্টকাট।

### 2. 🏠 হোম স্ক্রিন
- ডোনার স্ট্যাটাস টগল (Active ↔ Resting)
- লাইভ পালস বার: ফুলফিলমেন্ট রেট, গড় রেসপন্স টাইম, প্রস্তুত ডোনার কাউন্ট
- কুইক অ্যাকশন গ্রিড: ব্লাড স্টক, অ্যাম্বুলেন্স, হেলথ গাইড, ড্যাশবোর্ড
- চলমান সক্রিয় রিকোয়েস্ট অ্যালার্ট কার্ড ও কাছের জরুরি রিকোয়েস্ট লিস্ট
- আসন্ন রক্তদান ক্যাম্পেইন লিস্ট সহ RSVP টগল

### 3. 🔐 অথেন্টিকেশন সিস্টেম (AuthModal)
- গুগল (Google), ফেসবুক (Facebook) ও ইমেইল (Email) ট্রাই-মেথড সাপোর্ট
- সচল মোবাইল নম্বর ভ্যালিডেশন (`013-019XXXXXXXX`)
- ৮টি ব্লাড গ্রুপের সিলেকশন প্যানেল ও ৬৪ জেলার লোকেশন ট্র্যাকিং
- সোশ্যাল লগইনের জন্য কন্টাক্ট ডিটেইলস অনবোর্ডিং ফ্লো (`complete_contact`)

### 4. 🩸 জরুরি ব্লাড রিকোয়েস্ট — ৫ ধাপের উইজার্ড
- **ধাপ ১**: ব্লাড গ্রুপ, ব্যাগ সংখ্যা, কম্পোনেন্ট টাইপ (Whole/Platelets/Plasma)
- **ধাপ ২**: জেলা (৬৪টি), হাসপাতালের নাম (অটো-সাজেস্ট), ওয়ার্ড/বেড নম্বর
- **ধাপ ৩**: রোগীর তথ্য, কারণ, জরুরিতার মাত্রা (Urgency: Now/Today/24h)
- **ধাপ ৪**: যোগাযোগ নম্বর, প্রেসক্রিপশন ইমেজ ও ভেরিফিকেশন
- **ধাপ ৫**: লাইভ ব্রডকাস্ট ট্র্যাকিং ও রেসপন্ডিং ডোনার মনিটরিং

### 5. 👥 ডোনার ডিরেক্টরি
- ব্লাড গ্রুপ রেশিও বার চার্ট (ট্যাপ করে ফিল্টার)
- নাম, এলাকা, হাসপাতাল ও দূরত্ব দিয়ে সার্চ
- ফিল্টার: আজ উপলব্ধ / শুধু ভেরিফাইড
- ডোনার কার্ড: অ্যাভাটার, ব্লাড গ্রুপ, দূরত্ব, রেসপন্স টাইম, বুকমার্ক

### 6. 👤 ইউজার প্রোফাইল ভিউ ও স্মার্ট আইডি কার্ড
- **ডিজিটাল স্মার্ট ID কার্ড**: ফ্রন্ট (গোল্ডেন চিপ, এনএফসি ও কিউআর) ও ব্যাক (কম্প্যাটিবিলিটি ম্যাট্রিক্স, বারকোড) সহ ফ্লিপ অ্যানিমেশন
- **১২০০×৭৫০ PNG ডাউনলোড**: HTML5 Canvas দিয়ে উচ্চ রেজ্যুলেশনের কার্ড রেন্ডারিং
- **বায়োলজিক্যাল এলিজিবিলিটি ট্র্যাকার**: ৯০ দিনের রিকভারি কাউন্টডাউন ও হিমোগ্লোবিন কার্ভ
- **ডোনেশন হিস্ট্রি ও ডিজিটাল সার্টিফিকেট**: গোল্ডেন-বর্ডার লাইফসেভিং সার্টিফিকেট

### 7. 📊 ব্লাড অ্যানালিটিক্স চার্টস (৪ ক্যাটাগরি)
- ডোনেশন টাইমলাইন + হিমোগ্লোবিন কার্ভ
- গ্রুপ ডিমান্ড বনাম সাপ্লাই
- ২৪ ঘণ্টার রেসপন্স ভেলোসিটি ও পিক আওয়ার
- উপজেলা ভিত্তিক ডোনার ডেনসিটি

### 8. 🏥 হাসপাতাল ও অ্যাম্বুলেন্স ডিরেক্টরি
- ৮টি ব্লাড গ্রুপের হাসপাতালভিত্তিক স্টক মনিটরিং
- ICU, Freezing, AC ও নরমাল অ্যাম্বুলেন্সের ২৪/৭ হটলাইন ও লোকেশন সার্ভিস

---

## 🗄️ ডেটাবেজ স্কিমা | Database Schema

Supabase PostgreSQL ডেটাবেজে ৯টি অপ্টিমাইজড টেবিল ব্যবহৃত হয়:

```
📦 profiles                 — id (UUID), phone_number, full_name, blood_group, division, district, is_verified
📦 donor_profiles           — user_id (FK), is_available, total_donations, last_donation_date, next_eligible_date
📦 emergency_requests       — blood_group, bags_needed, hospital_name, district, urgency, status, contact_phone
📦 donor_responses          — request_id, donor_id, status (accepted/on_the_way/confirmed), eta_minutes
📦 hospitals_and_banks      — name, type, district, address, hotline, operating_hours
📦 blood_inventory          — hospital_id, blood_group, units_available, status
📦 ambulances               — driver_name, service_type, district, phone_number, is_available_24_7
📦 donation_camps           — organizer, venue, district, camp_date, target_units, registered_count
📦 notifications            — user_id, category, title, description, is_unread
```

---

## 📁 ফাইল স্ট্রাকচার | File Structure

```
Roktodata/
├── app/
│   ├── layout.tsx                     # রুট লেআউট, ফন্ট, মেটাডেটা, টোস্ট ও ল্যাঙ্গুয়েজ প্রোভাইডার
│   ├── page.tsx                       # রুট পেজ → <AppShell />
│   └── globals.css                    # Tailwind CSS v4, ডিজাইন ভেরিয়েবল ও বাধাহীন স্ক্রল ইঞ্জিন
├── components/
│   ├── analytics/                     # অ্যানালিটিক্স চার্ট ইঞ্জিন (BloodAnalyticsCharts)
│   ├── auth/
│   │   ├── AuthModal.tsx              # ইমেইল, গুগল, ফেসবুক ও মোবাইল নম্বর অথেন্টিকেশন
│   │   └── DonorProfileSetupWizard.tsx# ডোনার প্রোফাইল সেটআপ উইজার্ড
│   ├── chat/                          # সুরক্ষিত ইন-অ্যাপ চ্যাট মোডাল (SafeChatModal)
│   ├── database/                      # লাইভ সুপাবেস ডিবি এক্সপ্লোরার (LiveDatabaseViewer)
│   ├── directory/                     # হাসপাতাল, ব্লাড ব্যাংক ও অ্যাম্বুলেন্স তালিকা
│   ├── donor-response/                # ডোনার সাড়া প্রদান মোডাল
│   ├── donors/                        # ডোনার ডিরেক্টরি ভিউ
│   ├── education/                     # স্বাস্থ্য নির্দেশিকা ও মিথ বনাম সত্য
│   ├── home/                          # মোবাইল-ফার্স্ট হোম স্ক্রিন ও হিরো সেকশন
│   ├── hospital-dashboard/            # হাসপাতাল ব্লাড ইনভেন্টরি ড্যাশবোর্ড
│   ├── layout/
│   │   └── AppShell.tsx               # মূল অ্যাপ শেল, সেন্ট্রাল স্টেট ও সেশন সিঙ্ক
│   ├── location/                      # ৬৪ জেলার ড্রয়ার ও জিপিএস ডিটেকশন
│   ├── navigation/                    # ফিক্সড হেডার, বটম নেভিগেশন ও ফুটার
│   ├── notifications/                 # নোটিফিকেশন সেন্টার
│   ├── profile/                       # স্মার্ট কার্ড, বায়োলজিক্যাল রিকভারি ও প্রোফাইল
│   ├── report/                        # অ্যান্টি-ফ্রড রিপোর্টিং সিস্টেম
│   ├── request/                       # ৫ ধাপের জরুরি ব্লাড রিকোয়েস্ট উইজার্ড
│   ├── requests/                      # সক্রিয় ব্লাড রিকোয়েস্ট ট্র্যাকিং ভিউ
│   ├── settings/                      # সেটিংস, অডিট লগ ও পছন্দসমূহ
│   ├── ui/                            # গ্লোবাল টোস্ট নোটিফিকেশন সিস্টেম
│   └── verification/                  # ভেরিফিকেশন ব্যাজ নির্দেশিকা
├── lib/
│   ├── geo/bangladeshGeoData.ts       # ৬৪ জেলা, ৮ বিভাগ, উপজেলা ও GPS কোঅর্ডিনেট
│   ├── i18n/                          # দ্বিভাষিক কন্টেক্সট ও বাংলা-ইংরেজি অভিধান
│   ├── services/
│   │   ├── authService.ts             # ইমেইল, গুগল, ফেসবুক, ফোন ভ্যালিডেশন ও সেশন সার্ভিস
│   │   └── bloodService.ts            # হাইব্রিড সুপাবেস কোয়েরি ও অফলাইন সিড সার্ভিস
│   ├── supabase/                      # সুপাবেস ক্লায়েন্ট ফ্যাক্টরি ও ফুল টিএস টাইপস
│   ├── audioUtils.ts                  # ওয়েব অডিও এপিআই সাউন্ড ইঞ্জিন
│   ├── bengali-utils.ts               # বাংলা সংখ্যা ও ফোন কনভার্টার
│   ├── data.ts                        # অফলাইন সিড ডেটা
│   └── types.ts                       # কেন্দ্রীয় TypeScript ইন্টারফেস
├── .env.example                       # এনভায়রনমেন্ট ভ্যারিয়েবল গাইড
├── .gitignore                         # গিটহাবে গোপনীয়তা রক্ষার স্ট্যান্ডার্ড রুলস
├── package.json                       # ডিপেন্ডেন্সি ও স্ক্রিপ্টস
└── README.md                          # সম্পূর্ণ প্রজেক্ট ডকুমেন্টেশন
```

---

## 🔑 এনভায়রনমেন্ট ভ্যারিয়েবল | Environment Variables

`.env.example` থেকে `.env.local` তৈরি করুন:

```env
# Supabase Configuration (আবশ্যিক)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Google Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# App URL
APP_URL="http://localhost:3000"
```

### ⚙️ Supabase ড্যাশবোর্ডে ১-ক্লিক সোশ্যাল লগইন কনফিগারেশন:

1. **Google OAuth**:
   - [Google Cloud Console](https://console.cloud.google.com/)-এ গিয়ে একটি OAuth Client ID তৈরি করুন।
   - Authorized redirect URIs-এ আপনার Supabase Auth কলব্যাক URL দিন: `https://<YOUR-PROJECT-ID>.supabase.co/auth/v1/callback`।
   - Supabase Dashboard > **Authentication** > **Providers** > **Google** অন করে Client ID ও Secret পেস্ট করুন।
2. **Facebook OAuth**:
   - [Meta for Developers](https://developers.facebook.com/)-এ একটি অ্যাপ তৈরি করে Facebook Login সেটআপ করুন।
   - Valid OAuth Redirect URIs-এ `https://<YOUR-PROJECT-ID>.supabase.co/auth/v1/callback` দিন।
   - Supabase Dashboard > **Authentication** > **Providers** > **Facebook**-এ App ID ও Secret সেভ করুন।
3. **Email Auth**:
   - Supabase-এ ডিফল্টভাবেই Email Auth সক্রিয় থাকে।

---

## 🚀 ইন্সটলেশন ও রান | Installation & Running

```bash
# ১. রিপোজিটরি ক্লোন করুন
git clone <repository-url>
cd Roktodata

# ২. ডিপেন্ডেন্সি ইন্সটল করুন
npm install

# ৩. এনভায়রনমেন্ট ফাইল সেটআপ করুন
cp .env.example .env.local

# ৪. ডেভেলপমেন্ট সার্ভার চালু করুন
npm run dev

# ৫. প্রোডাকশন বিল্ড
npm run build
npm start
```

ব্রাউজারে **http://localhost:3000** ওপেন করুন।

---

## 🔧 মূল টেকনিক্যাল প্যাটার্ন

1. **বাধাহীন স্ক্রল ইঞ্জিন**: `globals.css`-এ `overflow-x: clip` ব্যবহার করে মোবাইল ও ডেস্কটপ সব ডিভাইসে সম্পূর্ণ স্বাভাবিক ও বাধাহীন ভিউপোর্ট স্ক্রলিং নিশ্চিত করা হয়েছে।
2. **SSR হাইড্রেশন সেফটি**: `React.useSyncExternalStore` এবং কাস্টম স্টোরেজ ইভেন্ট দিয়ে ক্লায়েন্ট ও সার্ভার রেন্ডারিং মিসম্যাচ দূর করা হয়েছে।
3. **অফলাইন-ফার্স্ট ফলব্যাক**: ইন্টারনেট বা সুপাবেস কানেকশন ছাড়াও সম্পূর্ণ অ্যাপটি লোকাল সিড ডেটা নিয়ে সুন্দরভাবে কাজ করে।
4. **জিরো-লিক গিট সিকিউরিটি**: স্ট্যান্ডার্ড `.gitignore` ফাইলের মাধ্যমে সিক্রেট কী, `.env.local`, লগ ও ওএস ক্যাশ ফাইল গিটহাবে যাওয়া পুরোপুরি সুরক্ষিত।

---

<div align="center">

**রক্তদাতা** — প্রতিটি রক্তের ফোঁটায় একটি জীবন 🩸  
*১০০% মানবিক ও স্বেচ্ছাসেবী উদ্যোগ*

</div>
