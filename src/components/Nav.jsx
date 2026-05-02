import { useState, useEffect } from 'react';
import societyLogo from '../assets/society-logo.png';

/*
  To change the logo:
  1. Replace the file at /assets/logo.png
  2. Or update the src path below in the <img> tag
*/

/*
  To change the admin password:
  1. Open src/store.jsx
  2. Find: export const ADMIN_PASSWORD = '...'
  3. Replace the value with the new password
*/

/* Admin route intentionally excluded — access via /#admin only */
const NAV_ITEMS = [
  { route: 'home',   label: 'الرئيسية'   },
  { route: 'about',  label: 'عن الجماعة' },
  { route: 'events', label: 'الفعاليات'  },
  { route: 'join',   label: 'انضم إلينا' },
];

export default function Nav({ currentPage, navigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* Close menu on route change */
  useEffect(() => { setMenuOpen(false); }, [currentPage]);

  const handleNav = (route) => { navigate(route); setMenuOpen(false); };

  return (
    <>
      <nav className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
        <div className="nav-inner">

          {/*
            RTL layout: flex row in RTL direction
            First child → far RIGHT (brand/logo)
            Last child  → far LEFT  (hamburger)
          */}

          {/* ── Brand (right side in RTL) ── */}
          <button className="nav-brand" onClick={() => handleNav('home')}>
            {/*
              To change the logo:
              Replace the file "society-logo.png" inside the assets folder
              or update the path in Nav.jsx and Footer.jsx
            */}
            <img
              src={societyLogo}
              alt="شعار الجماعة"
              className="nav-logo-img"
            />
          </button>

          {/* ── Desktop links (center) ── */}
          <ul className="nav-links">
            {NAV_ITEMS.map(({ route, label }) => (
              <li key={route}>
                <button
                  className={`nav-link${currentPage === route ? ' nav-link--active' : ''}`}
                  onClick={() => handleNav(route)}
                >
                  {label}
                  {currentPage === route && <span className="nav-link-dot" />}
                </button>
              </li>
            ))}
          </ul>

          {/* ── Hamburger (left side in RTL) ── */}
          <button
            className={`hamburger${menuOpen ? ' hamburger--open' : ''}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="القائمة"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer (slides in from right) ── */}
      <div className={`mobile-drawer${menuOpen ? ' mobile-drawer--open' : ''}`}>
        <ul>
          {NAV_ITEMS.map(({ route, label }) => (
            <li key={route}>
              <button
                className={`mobile-nav-link${currentPage === route ? ' mobile-nav-link--active' : ''}`}
                onClick={() => handleNav(route)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />}
    </>
  );
}
