import { useEffect, useState } from 'react';
import { useStore, isUpcoming, isRegistrationOpen } from '../store';
import { formatDate, formatTime, getDay, getMonthShort } from '../utils/helpers';
import CertificateModal from '../components/CertificateModal';

export default function Events() {
  const { data } = useStore();
  const [tab,      setTab]      = useState('upcoming');
  const [certEvt,  setCertEvt]  = useState(null);
  const [detailEvt,setDetailEvt]= useState(null);

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
                  onDetails={() => setDetailEvt(event)}
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

      {/* Event detail modal */}
      {detailEvt && (
        <EventDetailModal
          event={detailEvt}
          onClose={() => setDetailEvt(null)}
          onCertificate={() => { setDetailEvt(null); setCertEvt(detailEvt); }}
        />
      )}

      {/* Certificate modal */}
      {certEvt && (
        <CertificateModal event={certEvt} onClose={() => setCertEvt(null)} />
      )}
    </div>
  );
}

/* ── Registration status helpers ── */
function regInfo(event) {
  if (event.registrationStatus === 'closed')
    return { label: 'التسجيل مغلق', type: 'closed' };
  if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline))
    return { label: 'انتهى التسجيل', type: 'expired' };
  return { label: 'التسجيل مفتوح', type: 'open' };
}

/* ── Event Card (unchanged summary layout + details button) ── */
function EventCard({ event, featured, delay, onCertificate, onDetails }) {
  const upcoming = isUpcoming(event);
  const regOpen  = isRegistrationOpen(event);
  const reg      = regInfo(event);

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

        {/* Registration status badge — upcoming events only */}
        {upcoming && (
          <span className={`reg-badge reg-badge--${reg.type}`}>{reg.label}</span>
        )}

        <div className="event-actions">
          {/* Registration button / closed indicator */}
          {upcoming && event.formLink && (
            regOpen
              ? <a href={event.formLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">سجّل الآن</a>
              : <span className="badge badge-muted">{reg.label}</span>
          )}

          {/* Certificate — past events only */}
          {!upcoming && event.hasCertificate && (
            <button className="btn btn-outline btn-sm" onClick={onCertificate}>
              🎓 الشهادة
            </button>
          )}

          {/* Details button — always shown */}
          <button className="btn btn-ghost btn-sm" onClick={onDetails}>
            عرض التفاصيل
          </button>
        </div>
      </div>
    </article>
  );
}

/* ── Event Detail Modal ── */
function EventDetailModal({ event, onClose, onCertificate }) {
  const upcoming = isUpcoming(event);
  const regOpen  = isRegistrationOpen(event);
  const reg      = regInfo(event);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--detail" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="إغلاق">✕</button>

        {/* Full image */}
        {event.image && (
          <div className="event-detail-img-wrap">
            <img src={event.image} alt={event.title} className="event-detail-img" />
          </div>
        )}

        {/* Title */}
        <h2 className="event-detail-title">{event.title}</h2>

        {/* Registration status badge */}
        {upcoming && (
          <span className={`reg-badge reg-badge--${reg.type}`} style={{ marginBottom: 16 }}>
            {reg.label}
          </span>
        )}

        {/* Meta */}
        <ul className="event-detail-meta">
          <li>📅 {formatDate(event.date)}</li>
          {event.time     && <li>🕐 {formatTime(event.time)}</li>}
          {event.location && <li>📍 {event.location}</li>}
          {upcoming && event.registrationDeadline && (
            <li>⏰ آخر موعد للتسجيل: {formatDate(event.registrationDeadline.split('T')[0])}</li>
          )}
        </ul>

        {/* Full description */}
        {event.description && (
          <p className="event-detail-desc">{event.description}</p>
        )}

        {/* Actions */}
        <div className="modal-actions">
          {upcoming && event.formLink && regOpen && (
            <a href={event.formLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              سجّل الآن
            </a>
          )}
          {!upcoming && event.hasCertificate && (
            <button className="btn btn-outline" onClick={onCertificate}>
              🎓 الشهادة
            </button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}
