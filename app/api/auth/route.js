import { sql } from '@/lib/db';
import {
  hashPassword,
  verifyPassword,
  createSession,
  clearSession,
  getSession,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const user = await getSession();
    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM panel_users`;
    const body = {
      user: user ? { name: user.name, email: user.email, role: user.role } : null,
      needsSetup: count === 0,
    };

    const { searchParams } = new URL(request.url);
    if (searchParams.get('list') === 'users' && user?.role === 'admin') {
      body.users = await sql`
        SELECT id, name, email, role, is_active, created_at
        FROM panel_users ORDER BY created_at
      `;
    }
    return Response.json(body);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const b = await request.json();

    if (b.action === 'logout') {
      clearSession();
      return Response.json({ ok: true });
    }

    if (b.action === 'login') {
      const rows = await sql`
        SELECT * FROM panel_users
        WHERE email = ${(b.email || '').toLowerCase()} AND is_active = TRUE
      `;
      const u = rows[0];
      if (!u || !(await verifyPassword(b.password || '', u.password_hash))) {
        return Response.json({ error: 'Wrong email or password.' }, { status: 401 });
      }
      await createSession(u);
      return Response.json({ ok: true, role: u.role });
    }

    if (b.action === 'register') {
      const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM panel_users`;
      const bootstrap = count === 0;
      let role = 'member';

      if (bootstrap) {
        role = 'admin';
      } else {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
          return Response.json({ error: 'Only an admin can create accounts.' }, { status: 403 });
        }
      }

      const email = (b.email || '').toLowerCase().trim();
      if (!email || !b.password || b.password.length < 8) {
        return Response.json(
          { error: 'Email and a password of at least 8 characters are required.' },
          { status: 400 }
        );
      }
      const existing = await sql`SELECT id FROM panel_users WHERE email = ${email}`;
      if (existing[0]) {
        return Response.json({ error: 'That email already has an account.' }, { status: 409 });
      }

      const hash = await hashPassword(b.password);
      const [u] = await sql`
        INSERT INTO panel_users (email, name, password_hash, role)
        VALUES (${email}, ${b.name || email}, ${hash}, ${role})
        RETURNING id, email, name, role
      `;
      if (bootstrap) await createSession(u);
      return Response.json({ ok: true, role: u.role, created: u.email });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
