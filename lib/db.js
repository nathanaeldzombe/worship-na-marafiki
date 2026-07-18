import { neon } from '@neondatabase/serverless';

let _sql = null;

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Connect a Neon database in the Vercel Storage tab.');
  }
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

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
