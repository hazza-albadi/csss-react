import { useState, useEffect, useCallback } from 'react';
import { StoreProvider } from './store';
import Nav    from './components/Nav';
import Footer from './components/Footer';
import Mascot from './components/Mascot';
import Home   from './pages/Home';
import About  from './pages/About';
import Join   from './pages/Join';
import Events from './pages/Events';
import Admin  from './pages/Admin';
import { Analytics } from '@vercel/analytics/react';

const PAGES = { home: Home, about: About, events: Events, join: Join, admin: Admin };

/* pathname → page key */
function pathToPage(pathname) {
  const p = pathname.replace(/\/$/, '') || '/';
  const map = { '/': 'home', '/about': 'about', '/events': 'events', '/join': 'join', '/admin': 'admin' };
  return map[p] ?? 'home';
}

/* page key → pathname */
function pageToPath(page) {
  return page === 'home' ? '/' : `/${page}`;
}

export default function App() {
  const [page,    setPage]    = useState(() => pathToPage(window.location.pathname));
  const [exiting, setExiting] = useState(false);

  /* History API router — handles browser back/forward */
  useEffect(() => {
    const sync = () => setPage(pathToPage(window.location.pathname));
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  /* Navigate with page-exit transition */
  const navigate = useCallback((route) => {
    if (route === page) return;
    setExiting(true);
    setTimeout(() => {
      window.history.pushState(null, '', pageToPath(route));
      setPage(route);
      setExiting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 260);
  }, [page]);

  const PageComponent = PAGES[page] ?? Home;

  return (
    <StoreProvider>
      <Nav currentPage={page} navigate={navigate} />

      <div className={`page-transition${exiting ? ' page-transition--exit' : ''}`}>
        <PageComponent navigate={navigate} />
      </div>

      <Footer navigate={navigate} />
      <Mascot />
      <Analytics />
    </StoreProvider>
  );
}
