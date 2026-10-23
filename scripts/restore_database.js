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
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('❌ Error: Service role key required for restoration. Check .env.local');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function runRestore(targetFile) {
  console.log('====================================================');
  console.log('   ROKTODATA DATABASE RESTORATION UTILITY           ');
  console.log('====================================================');

  const filePath = targetFile || path.resolve(__dirname, '../backups/backup_latest.json');
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Backup file not found at: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const backup = JSON.parse(raw);

  console.log(`Restoring from backup created at: ${backup.metadata?.timestamp}`);
  console.log(`Target database: ${url}\n`);

  // Ordered list of tables to respect foreign key constraints
  const orderedTables = [
    'hospitals_and_banks',
    'blood_inventory',
    'ambulances',
    'donation_camps',
    'campaign_rsvps'
  ];

  for (const table of orderedTables) {
    const rows = backup.tables?.[table];
    if (Array.isArray(rows) && rows.length > 0) {
      try {
        const { error } = await supabase.from(table).upsert(rows);
        if (error) {
          console.warn(`⚠️ Restore warning for ${table}:`, error.message);
        } else {
          console.log(`✅ Restored ${table}: ${rows.length} rows`);
        }
      } catch (err) {
        console.warn(`❌ Failed restoring ${table}:`, err.message);
      }
    } else {
      console.log(`ℹ️ ${table}: No records in backup to restore`);
    }
  }

  console.log('\n====================================================');
  console.log('✅ Database restoration test completed.');
  console.log('====================================================');
}

const target = process.argv[2];
runRestore(target).catch(console.error);
