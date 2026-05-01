import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { route: 'home',   label: 'الرئيسية'   },
  { route: 'about',  label: 'عن الجماعة' },
  { route: 'events', label: 'الفعاليات'  },
  { route: 'join',   label: 'انضم إلينا' },
  { route: 'admin',  label: 'الإدارة'    },
];

export default function Nav({ currentPage, navigate }) {
  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);

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
          {/* ── Hamburger ── */}
          <button
            className={`hamburger${menuOpen ? ' hamburger--open' : ''}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="القائمة"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>

          {/* ── Brand ── */}
          <button className="nav-brand" onClick={() => handleNav('home')}>
            {/*
              LOGO REPLACEMENT:
              Replace the SVG below with:
              <img src="./assets/logo.png" alt="شعار الجمعية" className="nav-logo-img" />

              The logo file should be placed at:  assets/logo.png
              Recommended size: 42×42px display (use 2× for retina: 84×84px source)
            */}
            <div className="nav-logo-svg">
              <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="22" cy="22" r="20" fill="rgba(67,45,97,0.7)" />
                <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(63,164,211,0.5)" strokeWidth="1" />
                <ellipse cx="22" cy="22" rx="20" ry="7" fill="none" stroke="rgba(63,164,211,0.45)" strokeWidth="1.2" transform="rotate(-25 22 22)" />
                <circle cx="22" cy="22" r="6" fill="rgba(63,164,211,0.3)" />
                <circle cx="22" cy="22" r="3" fill="#3FA4D3" />
                <circle cx="38" cy="17" r="2.5" fill="#3FA4D3" />
              </svg>
            </div>
            <div className="nav-brand-text">
              <span className="nav-brand-sub">كلية العلوم — جامعة السلطان قابوس</span>
              <span className="nav-brand-main">جماعة الأنشطة الطلابية</span>
            </div>
          </button>

          {/* ── Desktop links ── */}
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
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
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
