import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SignOutButton from '@/components/SignOutButton';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }) {
  const session = await getSession();
  if (!session) redirect('/signin?next=/panel/upload');

  return (
    <>
      <div
        style={{
          background: 'var(--navy)',
          color: 'rgba(255,255,255,0.7)',
          padding: '8px 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          fontSize: 13,
        }}
      >
        <span>
          Signed in as <strong style={{ color: 'var(--gold-light)' }}>{session.name}</strong>
          {' · '}
          <span style={{ textTransform: 'capitalize' }}>{session.role}</span>
        </span>
        <span style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <Link href="/panel/upload" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
            Upload
          </Link>
          {session.role === 'admin' && (
            <Link href="/panel/accounts" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
              Manage accounts
            </Link>
          )}
          <SignOutButton />
        </span>
      </div>
      {children}
    </>
  );
}
