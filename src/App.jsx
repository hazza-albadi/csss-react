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

const PAGES = { home: Home, about: About, events: Events, join: Join, admin: Admin };

export default function App() {
  const [page,    setPage]    = useState('home');
  const [exiting, setExiting] = useState(false);

  /* Hash router */
  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.slice(1) || 'home';
      setPage(PAGES[hash] ? hash : 'home');
    };
    window.addEventListener('hashchange', sync);
    sync();
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  /* Navigate with page-exit transition */
  const navigate = useCallback((route) => {
    if (route === page) return;
    setExiting(true);
    setTimeout(() => {
      window.location.hash = route;
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
    </StoreProvider>
  );
}
