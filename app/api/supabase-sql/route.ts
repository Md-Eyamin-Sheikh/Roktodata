import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');
    const seedPath = path.join(process.cwd(), 'supabase', 'seed.sql');
    const fixRlsPath = path.join(process.cwd(), 'supabase', 'fix_rls.sql');

    const schema = fs.existsSync(schemaPath) ? fs.readFileSync(schemaPath, 'utf8') : '';
    const seed = fs.existsSync(seedPath) ? fs.readFileSync(seedPath, 'utf8') : '';
    const fixRls = fs.existsSync(fixRlsPath) ? fs.readFileSync(fixRlsPath, 'utf8') : '';

    return NextResponse.json({
      success: true,
      schema,
      seed,
      fixRls,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
