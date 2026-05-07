import { useRef, useEffect, useState } from 'react';
import { drawCertificate, downloadPNG, downloadPDF } from '../utils/certificate';
import { lookupParticipant } from '../lib/db';
import { isSupabaseReady } from '../lib/supabase';

export default function CertificateModal({ event, onClose }) {
  const canvasRef = useRef(null);
  const [name,    setName]    = useState('');
  const [phone,   setPhone]   = useState('');
  const [looking, setLooking] = useState(false);
  const [lookMsg, setLookMsg] = useState(null); // { text, ok }

  /* Redraw whenever name or event changes */
  useEffect(() => {
    if (canvasRef.current) {
      drawCertificate(canvasRef.current.getContext('2d'), event, name);
    }
  }, [name, event]);

  /* Trap scroll */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  /* Phone lookup */
  const handleLookup = async () => {
    if (!phone.trim()) { setLookMsg({ text: 'أدخل رقم هاتفك للبحث', ok: false }); return; }
    setLooking(true);
    setLookMsg(null);
    try {
      const result = await lookupParticipant(event.id, phone.trim());
      if (result) {
        setName(result.name);
        setLookMsg({ text: `تم العثور على: ${result.name}`, ok: true });
      } else {
        setLookMsg({ text: 'لم يُعثر على رقم الهاتف في قائمة المشاركين', ok: false });
      }
    } catch {
      setLookMsg({ text: 'تعذّر الاتصال بقاعدة البيانات — أدخل اسمك يدويًا', ok: false });
    } finally {
      setLooking(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="إغلاق">✕</button>

        <h2 className="modal-title">شهادة المشاركة</h2>
        {event && <p className="modal-event-name">{event.title}</p>}

        {/* Phone lookup — only shown when Supabase is configured */}
        {isSupabaseReady && (
          <div className="modal-lookup-row">
            <input
              className="form-input"
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setLookMsg(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              placeholder="رقم الهاتف للبحث عن اسمك…"
              dir="ltr"
            />
            <button
              className="btn btn-outline btn-sm"
              onClick={handleLookup}
              disabled={looking}
              style={{ whiteSpace: 'nowrap' }}
            >
              {looking ? '…' : 'بحث'}
            </button>
          </div>
        )}

        {lookMsg && (
          <p className={`lookup-msg ${lookMsg.ok ? 'lookup-ok' : 'lookup-err'}`}>
            {lookMsg.text}
          </p>
        )}

        {/* Manual name entry */}
        <div className="modal-name-row">
          <input
            className="form-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="أو أدخل اسمك الكامل يدويًا…"
            dir="rtl"
            autoFocus={!isSupabaseReady}
          />
        </div>

        {/* Canvas preview */}
        <div className="cert-canvas-wrap">
          <canvas
            ref={canvasRef}
            width={1200}
            height={850}
            className="cert-canvas"
          />
        </div>

        <div className="modal-actions">
          <button
            className="btn btn-primary"
            onClick={() => downloadPNG(canvasRef.current, name)}
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
      </div>
    </div>
  );
}
