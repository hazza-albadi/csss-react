import { useEffect } from 'react';
import { useStore } from '../store';

const ICONS = {
  rocket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 18h6" /><path d="M10 22h4" />
      <path d="M12 2a6 6 0 00-6 6c0 2 1 3.5 2.5 4.8.7.6 1.2 1.5 1.3 2.2h4.4c.1-.7.6-1.6 1.3-2.2C17 11.5 18 10 18 8a6 6 0 00-6-6z" />
    </svg>
  ),
  handshake: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20.42 4.58a5.4 5.4 0 00-7.65 0l-.77.78-.77-.78a5.4 5.4 0 00-7.65 7.65l1.06 1.06L12 21.23l7.77-7.94 1.06-1.06a5.4 5.4 0 000-7.65z" />
    </svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  ),
  media: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  ),
};

export default function Join() {
  const { data } = useStore();

  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io  = new IntersectionObserver(
      (e) => e.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('revealed'); io.unobserve(en.target); } }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="page-wrapper">
      {/* ── Page Hero ── */}
      <section className="page-hero page-hero--compact">
        <div className="blob blob-1 blob-sm" /><div className="blob blob-2 blob-sm" />
        <div className="container text-center">
          <h1 className="page-hero-title reveal">انضم إلينا</h1>
          <p className="page-hero-sub reveal">
            اختر اللجنة التي تناسب مهاراتك وابدأ رحلتك في تحقيق الأثر
          </p>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="section section--join-steps">
        <div className="container">
          <div className="join-steps reveal">
            {[
              ['١', 'اختر اللجنة'],
              ['٢', 'اضغط "انضم"'],
              ['٣', 'أكمل النموذج'],
              ['٤', 'انتظر التواصل'],
            ].map(([n, l], i) => (
              <div key={i} className="join-step">
                <div className="step-circle">{n}</div>
                <p>{l}</p>
                {i < 3 && <div className="step-line" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Committee cards ── */}
      <section className="section section-tinted section--join-committees">
        <div className="container">
          <div className="committees-grid">
            {data.committees.map((c, i) => (
              <div
                key={c.id}
                className="committee-card reveal"
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className="com-top">
                  <div className="com-icon">{ICONS[c.icon] ?? ICONS.target}</div>
                  <div>
                    <h3 className="com-name">{c.name}</h3>
                    <p className="com-name-en">{c.nameEn}</p>
                  </div>
                </div>
                <p className="com-desc">{c.description}</p>
                <a
                  href={c.formLink || 'https://forms.google.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-full"
                >
                  انضم الآن ←
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
