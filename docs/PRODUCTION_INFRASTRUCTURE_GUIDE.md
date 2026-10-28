# রক্তদাতা (Roktodata) — Production Infrastructure & Supabase Free Tier Risk Advisory
**Document Version:** 1.0  
**Target Audience:** Principal Systems Engineer, Lead DevOps, Platform Admins  
**Criticality:** Tier-1 (Life-Critical Humanitarian Emergency Service)

---

## ১. ভূমিকা ও ফ্রি টিয়ারের ঝুঁকি মূল্যায়ন (Executive Summary & Risk Assessment)

রক্তদাতা (Roktodata) একটি জীবন-সংশ্লিষ্ট জরুরি স্বেচ্ছাসেবী প্ল্যাটফর্ম। এখানে একটি রক্তের অনুরোধ কয়েক মিনিটের ব্যবধানে একজন মানুষের জীবন রক্ষা করতে পারে। উন্নয়ন ও প্রোটোটাইপিং পর্যায়ে Supabase-এর ফ্রি টিয়ার চমৎকার হলেও, **লাইভ প্রোডাকশন ডেপ্লয়মেন্টে ফ্রি টিয়ার ব্যবহারের বেশ কিছু সুনির্দিষ্ট কারিগরি ঝুঁকি রয়েছে:**

| ঝুঁকি (Risk Factor) | Supabase ফ্রি টিয়ার সীমা | জীবনরক্ষাকারী সেবায় প্রভাব | প্রশমন কৌশল (Mitigation Strategy) |
|---|---|---|---|
| **ইনঅ্যাক্টিভিটি পজ (Auto-Pause)** | ৭ দিন কোনো API রিকোয়েস্ট না এলে ডেটাবেস সম্পূর্ণ পজ হয়ে যায়। | গভীর রাতে বা কয়েকদিন পর হঠাৎ কোনো জরুরি রক্তের আবেদন এলে ডেটাবেস আনপজ হতে কয়েক মিনিট সময় নিবে বা 503 ত্রুটি দেখাবে। | (ক) কিপ-অ্যালাইভ ক্রন জব (GitHub Actions / Vercel Cron) চালু রাখা।<br>(খ) প্রোডাকশনের জন্য Supabase Pro ($25/mo) আপগ্রেড করা। |
| **ডেটাবেস ব্যাকআপ (Backups)** | দৈনিক পয়েন্ট-ইন-টাইম রিকভারি (PITR) নেই। শুধুমাত্র ম্যানুয়াল ব্যাকআপ। | দুর্ঘটনাবশত ডেটাবেস নষ্ট হলে ডেটা রিকভারি অসম্ভব হতে পারে। | অফ-সাইট অটোমেটেড `pg_dump` ব্যাকআপ স্ক্রিপ্ট (Cloudflare R2 বা AWS S3 তে ব্যাকআপ)। |
| **রিয়েলটাইম সংযোগ সীমা** | সর্বোচ্চ ২০০টি সমসাময়িক (concurrent) কানেকশন এবং মাসে ২০ লাখ মেসেজ। | কোনো জেলায় ডেঙ্গু বা দুর্যোগ পরিস্থিতিতে একসাথে ১০০০ ডোনার অ্যাপে থাকলে সংযোগ ড্রপ করবে। | ডিস্ট্রিক্ট-ভিত্তিক স্কোপড চ্যানেল সাবস্ক্রিপশন এবং পলব্যাক পোলিং। |
| **ব্যান্ডউইথ (Egress Limit)** | প্রতি মাসে ৫ গিগাবাইট (5 GB)। | প্রেসক্রিপশনের ছবি ও ডেটা ট্রাফিকে ৫ জিবি শেষ হলে ট্রাফিক বন্ধ হয়ে যাবে। | প্রেসক্রিপশন ইমেজ কম্প্রেশন (WebP) এবং Cloudflare CDN ক্যাশিং। |

---

## ২. ফ্রি টিয়ার পজ প্রতিরোধ: অটোমেটেড কিপ-অ্যালাইভ (Keep-Alive Cron)

ডেটাবেস ইঞ্জিন যাতে কখনোই স্লিপ মোডে না যায়, সেজন্য একটি স্বয়ংক্রিয় ক্রন জব কনফিগার করা হয়েছে:
- **এন্ডপয়েন্ট:** `GET /api/database/status`
- **ফ্রিকোয়েন্সি:** প্রতি ২৪ ঘণ্টায় একবার স্বয়ংক্রিয়ভাবে পিং পাঠানো হয়।

### GitHub Actions Workflow সেটআপ (`.github/workflows/keep_alive_supabase.yml`):
```yaml
name: Supabase Database Keep-Alive
on:
  schedule:
    - cron: '0 6 * * *' # প্রতিদিন সকাল ৬টা (UTC)
  workflow_dispatch:

jobs:
  ping-database:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Keep-Alive Endpoint
        run: |
          curl -f -s https://roktodata.org/api/database/status || curl -f -s https://roktodata.vercel.app/api/database/status
```

---

## ৩. অফ-সাইট অটোমেটেড ডেটাবেস ব্যাকআপ (Disaster Recovery Plan)

জীবনরক্ষাকারী সেবার মূল স্তম্ভ হলো নির্ভরযোগ্য ডেটা ব্যাকআপ। `scripts/backup_supabase_db.sh` স্ক্রিপ্টটি ব্যবহার করে ক্লাউডফ্লেয়ার R2 বা AWS S3-তে এনক্রিপ্টেড দৈনিক ব্যাকআপ সংরক্ষণ করা যায়:

```bash
#!/usr/bin/env bash
# scripts/backup_supabase_db.sh
# PostgreSQL Dump & Secure Encrypted Cloudflare R2 / S3 Sync
set -eo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/tmp/roktodata_backups"
BACKUP_FILE="${BACKUP_DIR}/roktodata_db_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "Starting Supabase PostgreSQL Backup for Roktodata..."
pg_dump "${SUPABASE_DB_URL}" | gzip > "${BACKUP_FILE}"

echo "Backup created successfully: ${BACKUP_FILE}"
# Sync to secure S3 / R2 Bucket
if [ -n "${BACKUP_S3_BUCKET}" ]; then
  aws s3 cp "${BACKUP_FILE}" "s3://${BACKUP_S3_BUCKET}/backups/${TIMESTAMP}.sql.gz"
  echo "Backup successfully mirrored to off-site cloud storage."
fi
```

---

## ৪. প্রোডাকশন আর্কিটেকচার রিকমেন্ডেশন (Production Upgrade Checklist)

বাস্তব জীবনে মানুষের রক্তের চাহিদা মেটাতে প্ল্যাটফর্মটি যখন ব্যাপকভাবে উন্মুক্ত করা হবে, তখন নিচের ধাপগুলো সম্পন্ন করার জোরালো সুপারিশ করা হলো:

1. **Supabase Pro Tier ($25/mo):**
   - নো অটো-পজ (Zero Inactivity Pauses - 99.9% Uptime SLA)।
   - ৮ জিবি ডেটাবেস সাইজ ও ২৫০ জিবি ইগ্রেস ব্যান্ডউইথ।
   - ৭ দিনের পয়েন্ট-ইন-টাইম রিকভারি (PITR) ব্যাকআপ।
2. **Cloudflare WAF & DDOS Shield:**
   - বাংলাদেশের মোবাইল নেটওয়ার্ক ও ব্রডব্যান্ডের জন্য Cloudflare DNS প্রক্সি।
   - স্প্যাম ও বট আক্রমণ থেকে ফর্ম প্রটেকশনের জন্য Cloudflare Turnstile।
3. **প্রাইভেট VAPID কি ও পুশ নোটিফিকেশন ক্লাউড সার্ভিস:**
   - ব্রাউজার পুশ নোটিফিকেশনের নির্ভরযোগ্য ডেলিভারির জন্য ডেডিকেটেড ব্যাকগ্রাউন্ড ওয়ার্কার।
4. **অডিট ও কমপ্লায়েন্স:**
   - নিয়মিত `/admin` মডারেশন কিউ চেক করে অপ্রয়োজনীয় ও নিষ্পত্তি হওয়া রিপোর্ট আর্কাইভ করা।
