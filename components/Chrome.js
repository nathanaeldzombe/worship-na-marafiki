import Link from 'next/link';

export function Nav({ active }) {
  const links = [
    ['/library', 'Songs', 'songs'],
    ['/library', 'Languages', 'languages'],
    ['/#about', 'About', 'about'],
  ];
  return (
    <nav className="nav">
      <Link className="nav-logo" href="/">
        Worship <span>na Marafiki</span>
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
      <div className="footer-brand">
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
