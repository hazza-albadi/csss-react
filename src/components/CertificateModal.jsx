import { useRef, useEffect, useState } from 'react';
import { drawCertificate, downloadPNG, downloadPDF } from '../utils/certificate';
import { lookupParticipant } from '../lib/db';
import { isSupabaseReady } from '../lib/supabase';
import { useStore } from '../store';

export default function CertificateModal({ event, onClose }) {
  const { data }       = useStore();
  const contactEmail   = data?.content?.contactEmail || '';

  const canvasRef      = useRef(null);
  const [phone,        setPhone]      = useState('');
  const [foundName,    setFoundName]  = useState(null);  // null=not searched, ''=not found, string=found
  const [looking,      setLooking]    = useState(false);
  const [lookErr,      setLookErr]    = useState('');

  /* Draw certificate as soon as we have a confirmed name from the DB */
  useEffect(() => {
    if (canvasRef.current && foundName) {
      drawCertificate(canvasRef.current.getContext('2d'), event, foundName);
    }
  }, [foundName, event]);

  /* Trap scroll */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleLookup = async () => {
    if (!phone.trim()) { setLookErr('أدخل رقم هاتفك للبحث'); return; }
    setLooking(true);
    setLookErr('');
    setFoundName(null);
    try {
      const result = await lookupParticipant(event.id, phone.trim());
      if (result) {
        setFoundName(result.name);
      } else {
        setFoundName('');
        setLookErr(
          'لم يتم العثور على رقم الهاتف في قائمة المشاركين لهذه الفعالية. إذا كنت حاضرًا، يرجى التواصل معنا' +
          (contactEmail ? ` عبر البريد الإلكتروني: ${contactEmail}` : '.')
        );
      }
    } catch {
      setLookErr('تعذّر الاتصال بقاعدة البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLooking(false);
    }
  };

  /* If Supabase not configured, show a contact message */
  if (!isSupabaseReady) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose} aria-label="إغلاق">✕</button>
          <h2 className="modal-title">شهادة المشاركة</h2>
          {event && <p className="modal-event-name">{event.title}</p>}
          <p className="text-muted" style={{ textAlign: 'center', padding: '20px 0' }}>
            للحصول على شهادتك، يرجى التواصل مع إدارة الجماعة
            {contactEmail ? `: ${contactEmail}` : '.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="إغلاق">✕</button>

        <h2 className="modal-title">شهادة المشاركة</h2>
        {event && <p className="modal-event-name">{event.title}</p>}

        {/* ── Phone search (always shown until name is found) ── */}
        {!foundName && (
          <>
            <div className="modal-lookup-row">
              <input
                className="form-input"
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setLookErr(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                placeholder="أدخل رقم هاتفك…"
                dir="ltr"
                autoFocus
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={handleLookup}
                disabled={looking}
                style={{ whiteSpace: 'nowrap' }}
              >
                {looking ? '…' : 'بحث'}
              </button>
            </div>

            {lookErr && (
              <p className="lookup-msg lookup-err">{lookErr}</p>
            )}
          </>
        )}

        {/* ── Certificate preview + download (shown only on successful lookup) ── */}
        {foundName && (
          <>
            <p className="lookup-msg lookup-ok">أهلاً {foundName} — شهادتك جاهزة للتحميل ✓</p>

            <div className="cert-canvas-wrap">
              <canvas ref={canvasRef} width={1200} height={850} className="cert-canvas" />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={() => downloadPNG(canvasRef.current, foundName)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                تحميل PNG
              </button>
              <button
                className="btn btn-outline"
                onClick={() => downloadPDF(canvasRef.current)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                تصدير PDF
              </button>
            </div>

            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 12, width: '100%' }}
              onClick={() => { setFoundName(null); setPhone(''); setLookErr(''); }}
            >
              بحث برقم هاتف آخر
            </button>
          </>
        )}
      </div>
    </div>
  );
}
