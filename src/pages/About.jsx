import { useEffect } from 'react';
import { useStore } from '../store';

export default function About() {
  const { data } = useStore();
  const { aboutGoal, aboutMission, aboutImpact } = data.content;

  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io  = new IntersectionObserver(
      (e) => e.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('revealed'); io.unobserve(en.target); } }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const sections = [
    {
      num: '١', key: 'goal', label: 'الهدف',
      text: aboutGoal,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
        </svg>
      ),
    },
    {
      num: '٢', key: 'mission', label: 'الرسالة',
      text: aboutMission,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
        </svg>
      ),
    },
    {
      num: '٣', key: 'impact', label: 'الأثر',
      text: aboutImpact,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="page-wrapper">
      {/* ── Page Hero ── */}
      <section className="page-hero">
        <div className="blob blob-1 blob-sm" /><div className="blob blob-2 blob-sm" />
        <div className="container text-center">
          <h1 className="page-hero-title reveal">عن الجماعة</h1>
          <p className="page-hero-sub reveal">
            جماعة الأنشطة الطلابية بكلية العلوم — جامعة السلطان قابوس
          </p>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className="section">
        <div className="container">
          <div className="about-intro reveal">
            <p>
              نحن جماعة أنشطة طلابية تعمل تحت مظلة كلية العلوم في جامعة السلطان قابوس.
              نسعى إلى بناء بيئة أكاديمية وإبداعية متكاملة تُمكّن الطلاب من اكتشاف
              إمكاناتهم الحقيقية وتطويرها عبر برامج وشراكات ذات أثر حقيقي.
            </p>
          </div>
        </div>
      </section>

      {/* ── Three pillars ── */}
      <section className="section section-tinted">
        <div className="container">
          <div className="about-pillars">
            {sections.map(({ num, key, label, text, icon }, i) => (
              <div
                key={key}
                className="about-pillar reveal"
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="pillar-num">{num}</div>
                <div className="pillar-icon">{icon}</div>
                <h3 className="pillar-label">{label}</h3>
                <p className="pillar-text">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <h2 className="section-title">قيمنا</h2>
          </div>
          <div className="values-grid">
            {[
              ['🔬', 'العلم',    'نؤمن بالمعرفة ونسعى دائماً للتعلم والاستكشاف'],
              ['🤝', 'التعاون',  'نعمل كفريق متكامل لتحقيق أهداف أكبر'],
              ['💡', 'الإبداع',  'نشجع التفكير المختلف والحلول المبتكرة'],
              ['🌱', 'النمو',    'نؤمن بالتطور المستمر لكل عضو في الجماعة'],
            ].map(([ic, nm, ds], i) => (
              <div key={i} className="value-card reveal" style={{ transitionDelay: `${i * 90}ms` }}>
                <span className="value-icon">{ic}</span>
                <h4>{nm}</h4>
                <p>{ds}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
