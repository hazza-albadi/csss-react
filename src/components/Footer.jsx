import { useStore } from '../store';
import societyLogo from '../assets/society-logo.png';

const NAV = [
  ['home',   'الرئيسية'],
  ['about',  'عن الجماعة'],
  ['events', 'الفعاليات'],
  ['join',   'انضم إلينا'],
];

export default function Footer({ navigate }) {
  const { data } = useStore();
  const { contactEmail, contactInstagram } = data.content;

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Brand */}
        <div className="footer-brand">
          {/*
            To change the logo:
            Replace the file "society-logo.png" inside the assets folder
            or update the path in Nav.jsx and Footer.jsx
          */}
          <img
            src={societyLogo}
            alt="شعار الجماعة"
            className="footer-logo-img"
          />
        </div>

        {/* Links */}
        <nav className="footer-links">
          {NAV.map(([route, label]) => (
            <button key={route} className="footer-link" onClick={() => navigate(route)}>
              {label}
            </button>
          ))}
        </nav>

        {/* Contact — editable via Admin › المحتوى */}
        <div className="footer-contact">
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className="footer-contact-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              {contactEmail}
            </a>
          )}
          {contactInstagram && (
            <a
              href={`https://instagram.com/${contactInstagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-contact-item"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
              {contactInstagram}
            </a>
          )}
        </div>

        <p className="footer-copy">
          © {new Date().getFullYear()} جماعة الأنشطة الطلابية بكلية العلوم — جميع الحقوق محفوظة
        </p>

        {/*
          SECONDARY LOGO (SQU):
          Optional: place the university logo here.
          <img src="./assets/squ-logo.png" alt="جامعة السلطان قابوس" className="footer-squ" />
        */}
      </div>
    </footer>
  );
}
