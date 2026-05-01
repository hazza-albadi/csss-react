import { useEffect, useRef } from 'react';
import { useStore, nextEvent } from '../store';
import { formatDate, formatTime } from '../utils/helpers';

export default function Home({ navigate }) {
  const { data } = useStore();
  const next     = nextEvent(data.events);
  const heroRef  = useRef(null);

  /* Subtle parallax on scroll */
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onScroll = () => {
      const y = window.scrollY;
      el.style.transform = `translateY(${y * 0.28}px)`;
      el.style.opacity   = `${1 - y / 620}`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Stagger reveal for sections */
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io  = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); } }),
      { threshold: 0.13 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const sloganLines = data.content.heroSlogan.split('\n');

  return (
    <>
      {/* ══ HERO ══ */}
      <section className="hero">
        {/* Blobs */}
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />

        <div className="hero-content" ref={heroRef}>
          <span className="hero-badge">
            <span className="badge-pulse" />
            جماعة الأنشطة الطلابية — كلية العلوم
          </span>

          <h1 className="hero-title">
            {sloganLines.map((line, i) => (
              <span key={i} className="hero-line" style={{ animationDelay: `${0.2 + i * 0.18}s` }}>
                {i === 1 ? <mark className="hero-mark">{line}</mark> : line}
              </span>
            ))}
          </h1>

          <p className="hero-sub" style={{ animationDelay: '0.6s' }}>
            {data.content.heroSubtitle}
          </p>

          <div className="hero-cta" style={{ animationDelay: '0.8s' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('events')}>
              استعرض الفعاليات
            </button>
            <button className="btn btn-ghost-light btn-lg" onClick={() => navigate('join')}>
              انضم إلينا
            </button>
          </div>

          {/* Next event chip */}
          {next && (
            <div className="next-event-chip" style={{ animationDelay: '1s' }}>
              <span className="chip-dot" />
              <span className="chip-label">الفعالية القادمة:</span>
              <strong>{next.title}</strong>
              <span className="chip-date">📅 {formatDate(next.date)}</span>
              {next.time && <span className="chip-date">🕐 {formatTime(next.time)}</span>}
              {next.formLink && (
                <a href={next.formLink} target="_blank" rel="noopener noreferrer" className="chip-btn">
                  سجّل
                </a>
              )}
            </div>
          )}
        </div>

        <div className="hero-scroll">
          <span>مرر للأسفل</span>
          <div className="scroll-chevron" />
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section className="stats-section">
        <div className="container stats-grid">
          {data.stats.map((stat, i) => (
            <div key={stat.id} className="stat-card reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="stat-num">{stat.num}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ HIGHLIGHTS ══ */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <h2 className="section-title">إنجازاتنا</h2>
            <p className="section-sub">نفخر بما حققناه معاً</p>
          </div>
          <div className="highlights-grid">
            {data.achievements.map((ach, i) => (
              <div key={ach.id} className="hl-card reveal" style={{ transitionDelay: `${i * 120}ms` }}>
                <div className="hl-icon">
                  {ach.image
                    ? <img src={ach.image} alt={ach.title} className="hl-img" />
                    : ach.icon}
                </div>
                <h3>{ach.title}</h3>
                <p>{ach.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ QUICK NAV ══ */}
      <section className="section section-tinted">
        <div className="container">
          <div className="quick-nav-grid">
            {[
              ['📅', 'الفعاليات',  'استعرض ما هو قادم',    'events'],
              ['🧩', 'اللجان',     'تعرف على فرق العمل',   'join'],
              ['💡', 'عن الجماعة', 'رسالتنا وأهدافنا',      'about'],
              ['📩', 'انضم إلينا', 'ابدأ رحلتك معنا',       'join'],
            ].map(([icon, title, sub, route], i) => (
              <button
                key={i}
                className="qn-card reveal"
                style={{ transitionDelay: `${i * 80}ms` }}
                onClick={() => navigate(route)}
              >
                <span className="qn-icon">{icon}</span>
                <strong>{title}</strong>
                <span>{sub}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
