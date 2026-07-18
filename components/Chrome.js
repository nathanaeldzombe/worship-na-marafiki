import Link from 'next/link';
import Image from 'next/image';

export function Nav({ active }) {
  const links = [
    ['/library', 'Songs', 'songs'],
    ['/languages', 'Languages', 'languages'],
    ['/#about', 'About', 'about'],
  ];
  return (
    <nav className="nav">
      <Link className="nav-logo" href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Image src="/logo-icon-black.png" alt="Worship na Marafiki" width={40} height={40} priority style={{ width: 40, height: 40 }} />
        <span className="wordmark">Worship <span>na Marafiki</span></span>
      </Link>
      <ul className="nav-links">
        {links.map(([href, label, key]) => (
          <li key={label}>
            <Link href={href} className={active === key ? 'active' : ''}>
              {label}
            </Link>
          </li>
        ))}
        <li>
          <Link href="/submit" className="nav-cta">
            Submit a Song
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export function Footer() {
  return (
    <footer>
      <Image src="/logo-icon-white.png" alt="Worship na Marafiki" width={56} height={56} style={{ width: 56, height: 56, marginBottom: 12, opacity: 0.9 }} />
      <div className="footer-brand wordmark">
        Worship <span>na Marafiki</span>
      </div>
      <div style={{ opacity: 0.5, marginBottom: 12 }}>
        African Praise. Every Language. Every Friend.
      </div>
      <div style={{ fontSize: '0.78rem', opacity: 0.35 }}>
        © {new Date().getFullYear()} Worship na Marafiki. Free for congregational use. · Romans 12:1
      </div>
    </footer>
  );
}
