const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim().replace(/^['\"]|['\"]$/g, '');
  });
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !serviceKey) {
  console.error('❌ Error: Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function runBackup() {
  console.log('====================================================');
  console.log('   ROKTODATA DATABASE BACKUP & EXPORT UTILITY       ');
  console.log('====================================================');
  console.log('Connected to:', url);

  const tables = [
    'hospitals_and_banks',
    'blood_inventory',
    'ambulances',
    'donation_camps',
    'campaign_rsvps',
    'notifications',
    'emergency_requests',
    'donor_responses'
  ];

  const backupData = {
    metadata: {
      timestamp: new Date().toISOString(),
      sourceUrl: url,
      version: '1.0.0',
    },
    tables: {},
  };

  const backupDir = path.resolve(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase.from(table).select('*');
      if (error) {
        console.warn(`⚠️ Table ${table}: ${error.message}`);
        backupData.tables[table] = [];
      } else {
        backupData.tables[table] = data || [];
        console.log(`✅ Backed up ${table}: ${(data || []).length} rows`);
      }
    } catch (e) {
      console.warn(`⚠️ Error reading ${table}:`, e.message);
      backupData.tables[table] = [];
    }
  }

  const timestampStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupFilePath = path.join(backupDir, `backup_${timestampStr}.json`);
  const latestFilePath = path.join(backupDir, 'backup_latest.json');

  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf8');
  fs.writeFileSync(latestFilePath, JSON.stringify(backupData, null, 2), 'utf8');

  console.log('\n====================================================');
  console.log(`✅ Backup successfully created at:`);
  console.log(`   ${backupFilePath}`);
  console.log(`   ${latestFilePath}`);
  console.log('====================================================');
}

runBackup().catch(console.error);
