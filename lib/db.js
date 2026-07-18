import { neon } from '@neondatabase/serverless';

// Lazily create the connection so `next build` doesn't fail when
// DATABASE_URL isn't set yet (e.g. before you attach the Neon database).
// The real connection is made on the first query, at request time.
let _sql = null;

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Connect a Neon database in the Vercel Storage tab.');
  }
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}

// A tagged-template proxy so existing sql`...` and sql.query(...) calls keep working.
export const sql = new Proxy(function () {}, {
  apply(_target, _thisArg, args) {
    return getSql()(...args);
  },
  get(_target, prop) {
    const client = getSql();
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
