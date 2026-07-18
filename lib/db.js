import { neon } from '@neondatabase/serverless';

// Vercel injects DATABASE_URL automatically when you connect a Postgres store.
// Locally, put it in .env.local
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set. Add it in Vercel Storage or .env.local');
}

export const sql = neon(process.env.DATABASE_URL);
