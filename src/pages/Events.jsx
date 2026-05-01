import { useEffect, useState } from 'react';
import { useStore, isUpcoming } from '../store';
import { formatDate, formatTime, getDay, getMonthShort } from '../utils/helpers';
import CertificateModal from '../components/CertificateModal';

export default function Events() {
  const { data } = useStore();
  const [tab,     setTab]     = useState('upcoming');
  const [certEvt, setCertEvt] = useState(null);

  const upcoming = [...data.events].filter(isUpcoming).sort((a, b) => new Date(a.date) - new Date(b.date));
  const past     = [...data.events].filter((e) => !isUpcoming(e)).sort((a, b) => new Date(b.date) - new Date(a.date));

  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io  = new IntersectionObserver(
      (e) => e.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('revealed'); io.unobserve(en.target); } }),
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [tab]);

  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="page-wrapper">
      {/* ── Page Hero ── */}
      <section className="page-hero">
        <div className="blob blob-1 blob-sm" /><div className="blob blob-2 blob-sm" />
        <div className="container text-center">
          <h1 className="page-hero-title reveal">الفعاليات</h1>
          <p className="page-hero-sub reveal">استعرض فعالياتنا القادمة والسابقة</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Tabs */}
          <div className="events-tabs reveal">
            <button
              className={`events-tab${tab === 'upcoming' ? ' events-tab--active' : ''}`}
              onClick={() => setTab('upcoming')}
            >
              <span className={tab === 'upcoming' ? 'tab-dot' : ''} />
              القادمة ({upcoming.length})
            </button>
            <button
              className={`events-tab${tab === 'past' ? ' events-tab--active' : ''}`}
              onClick={() => setTab('past')}
            >
              السابقة ({past.length})
            </button>
          </div>

          {/* Grid */}
          {list.length > 0 ? (
            <div className="events-grid">
              {list.map((event, i) => (
                <EventCard
                  key={event.id}
                  event={event}
                  featured={tab === 'upcoming' && i === 0}
                  delay={i * 80}
                  onCertificate={() => setCertEvt(event)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state reveal">
              <p className="empty-icon">📭</p>
              <p>لا توجد فعاليات {tab === 'upcoming' ? 'قادمة' : 'سابقة'} حالياً</p>
            </div>
          )}
        </div>
      </section>

      {/* Certificate modal */}
      {certEvt && (
        <CertificateModal event={certEvt} onClose={() => setCertEvt(null)} />
      )}
    </div>
  );
}

/* ── Event Card ── */
function EventCard({ event, featured, delay, onCertificate }) {
  return (
    <article
      className={`event-card reveal${featured ? ' event-card--featured' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Media */}
      <div className="event-media">
        {event.image ? (
          <img src={event.image} alt={event.title} className="event-img" />
        ) : (
          <div className="event-img-placeholder">
            <svg viewBox="0 0 60 60" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5">
              <rect x="5" y="10" width="50" height="40" rx="4" />
              <circle cx="20" cy="24" r="6" />
              <path d="M5 38l15-12 12 10 8-7 15 11" />
            </svg>
          </div>
        )}

        {featured && <span className="featured-badge">✨ الفعالية القادمة</span>}

        <div className="date-badge">
          <span className="date-day">{getDay(event.date)}</span>
          <span className="date-mon">{getMonthShort(event.date)}</span>
        </div>
      </div>

      {/* Body */}
      <div className="event-body">
        <h3 className="event-title">{event.title}</h3>
        <p className="event-desc">{event.description}</p>

        <ul className="event-meta">
          <li>📅 {formatDate(event.date)}</li>
          {event.time     && <li>🕐 {formatTime(event.time)}</li>}
          {event.location && <li>📍 {event.location}</li>}
        </ul>

        <div className="event-actions">
          {isUpcoming(event) && event.formLink && (
            <a
              href={event.formLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
            >
              سجّل الآن
            </a>
          )}
          {event.hasCertificate && (
            <button className="btn btn-outline btn-sm" onClick={onCertificate}>
              🎓 الشهادة
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
