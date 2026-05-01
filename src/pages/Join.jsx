import { useEffect } from 'react';
import { useStore } from '../store';

const ICONS = {
  rocket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2l-.55-.55M10 17a5 5 0 000-10 5 5 0 000 10z" />
      <path d="M19.5 4.5l-15 15M14 10l2-2" /><circle cx="18" cy="6" r="2" />
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
  finance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  media: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" /><polygon points="10 8 16 12 10 16 10 8" />
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
      <section className="page-hero">
        <div className="blob blob-1 blob-sm" /><div className="blob blob-2 blob-sm" />
        <div className="container text-center">
          <h1 className="page-hero-title reveal">انضم إلينا</h1>
          <p className="page-hero-sub reveal">
            اختر اللجنة التي تناسب مهاراتك وابدأ رحلتك في تحقيق الأثر
          </p>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="section">
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
      <section className="section section-tinted">
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
