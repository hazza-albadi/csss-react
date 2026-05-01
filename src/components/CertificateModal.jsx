import { useRef, useEffect, useState } from 'react';
import { drawCertificate, downloadPNG, downloadPDF } from '../utils/certificate';

export default function CertificateModal({ event, onClose }) {
  const canvasRef = useRef(null);
  const [name, setName] = useState('');

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="إغلاق">✕</button>

        <h2 className="modal-title">شهادة المشاركة</h2>
        {event && <p className="modal-event-name">{event.title}</p>}

        <div className="modal-name-row">
          <input
            className="form-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="أدخل اسمك الكامل…"
            dir="rtl"
            autoFocus
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
