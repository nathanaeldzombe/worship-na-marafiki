// Run the schema against your database.
// Usage (local):  DATABASE_URL="postgres://..." npm run db:setup
// Or just paste db/schema.sql into the Neon SQL editor in the Vercel dashboard.

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  console.error('❌  Set DATABASE_URL first. Example:\n    DATABASE_URL="postgres://..." npm run db:setup');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

// Split on semicolons at line ends, skip comments/empties.
const statements = schema
  .split(/;\s*$/m)
  .map((s) => s.trim())
  .filter((s) => s && !s.startsWith('--'));

console.log(`Running ${statements.length} statements…`);
for (const stmt of statements) {
  try {
    await sql.query(stmt);
  } catch (e) {
    // ignore "already exists" so the script is re-runnable
    if (/already exists/i.test(e.message)) continue;
    console.error('Error on statement:\n', stmt.slice(0, 120), '\n', e.message);
  }
}
console.log('✅  Database ready.');
