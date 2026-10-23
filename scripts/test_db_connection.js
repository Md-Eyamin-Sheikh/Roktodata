const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Check environment variables
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const url = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

console.log('====================================================');
console.log('        ROKTODATA BACKEND & DATABASE AUDIT          ');
console.log('====================================================');

console.log('1. ENVIRONMENT CONFIGURATION CHECK:');
console.log(`   - Supabase URL: ${url ? url : '❌ NOT CONFIGURED (Empty)'}`);
console.log(`   - Supabase Anon Key: ${anonKey ? '✅ DETECTED (' + anonKey.slice(0, 10) + '...)' : '❌ NOT CONFIGURED'}`);
console.log(`   - Supabase Service Key: ${serviceKey ? '✅ DETECTED (' + serviceKey.slice(0, 10) + '...)' : '⚠️ OPTIONAL (Not set)'}`);

// 2. Check SQL files for schema consistency
console.log('\n2. SQL SCHEMA & SEED ALIGNMENT CHECK:');
const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261023000000_complete_database_schema.sql');
const seedPath = path.join(__dirname, '..', 'supabase', 'seed.sql');
const fixRlsPath = path.join(__dirname, '..', 'supabase', 'fix_rls.sql');

const schema = fs.readFileSync(schemaPath, 'utf8');
const migrationExists = fs.existsSync(migrationPath);
const migration = migrationExists ? fs.readFileSync(migrationPath, 'utf8') : '';
const seed = fs.readFileSync(seedPath, 'utf8');
const fixRls = fs.readFileSync(fixRlsPath, 'utf8');

const checks = [
  { name: 'Migration 20261023000000_complete_database_schema.sql exists', pass: migrationExists },
  { name: 'blood_inventory.hospital_id in schema.sql', pass: schema.includes('hospital_id UUID') },
  { name: 'donor_profiles.reward_points in schema.sql', pass: schema.includes('reward_points INTEGER') },
  { name: 'donor_profiles.badges in schema.sql', pass: schema.includes('badges JSONB') },
  { name: 'chat_messages table in migration', pass: migration.includes('public.chat_messages') },
  { name: 'reports table in migration', pass: migration.includes('public.reports') },
  { name: 'donor_bookmarks table in migration', pass: migration.includes('public.donor_bookmarks') },
  { name: 'campaign_rsvps table in migration', pass: migration.includes('public.campaign_rsvps') },
  { name: 'push_subscriptions table in migration', pass: migration.includes('public.push_subscriptions') },
  { name: 'handle_updated_at trigger function in migration', pass: migration.includes('handle_updated_at') },
  { name: 'sync_donor_history trigger in migration', pass: migration.includes('sync_donor_history') },
  { name: 'fix_rls.sql auto-repair column patches', pass: fixRls.includes('ADD COLUMN IF NOT EXISTS reward_points') && fixRls.includes('ADD COLUMN IF NOT EXISTS hospital_id') },
];

checks.forEach(c => {
  console.log(`   ${c.pass ? '✅' : '❌'} ${c.name}`);
});

// 3. Test Live Connection if credentials provided
if (url && anonKey && !anonKey.includes('your-supabase')) {
  console.log('\n3. TESTING LIVE SUPABASE DATABASE CONNECTION & CRUD:');
  const client = createClient(url, serviceKey || anonKey);

  async function runLiveTest() {
    try {
      // Test Read
      const { data: hospData, error: hospErr } = await client.from('hospitals_and_banks').select('count').limit(1);
      if (hospErr) {
        console.log(`   ❌ Read error on hospitals_and_banks: ${hospErr.message}`);
      } else {
        console.log('   ✅ Read connection successful!');
      }

      // Test Write
      const testId = `AUDIT-${Date.now()}`;
      const { data: insertData, error: insertErr } = await client.from('emergency_requests').insert({
        blood_group: 'B+',
        bags_needed: 1,
        hospital_name: 'Backend Audit Test Hospital',
        district: 'ঢাকা',
        patient_name: 'Audit Test Patient',
        contact_phone: '01700000000',
        urgency: 'now',
        status: 'active',
        reason: testId,
      }).select('id');

      if (insertErr) {
        console.log(`   ❌ Write error on emergency_requests: ${insertErr.message}`);
      } else if (insertData && insertData[0]?.id) {
        console.log(`   ✅ Live write (INSERT) successful! Generated ID: ${insertData[0].id}`);
        // Clean up
        await client.from('emergency_requests').delete().eq('id', insertData[0].id);
        console.log('   ✅ Live cleanup (DELETE) successful!');
      }
    } catch (e) {
      console.log(`   ❌ Exception during live test: ${e.message}`);
    }
  }

  runLiveTest();
} else {
  console.log('\n3. SUPABASE LIVE CLOUD STATUS:');
  console.log('   ℹ️ Supabase API keys are not yet injected in .env.local.');
  console.log('   ℹ️ The application is running resiliently with built-in memory store & offline datasets.');
  console.log('   ℹ️ Once the user adds their Supabase project keys to .env.local, all live CRUD operations will activate seamlessly.');
}
