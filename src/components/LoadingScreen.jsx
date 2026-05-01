import { useEffect, useState } from 'react';

const MESSAGES = ['جاري تحضير تجربتك…', 'تحميل المحتوى…', 'مرحباً بك 🌟'];

export default function LoadingScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [msgIdx,   setMsgIdx]   = useState(0);
  const [fading,   setFading]   = useState(false);

  useEffect(() => {
    /* Progress bar */
    const progInterval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + Math.random() * 16 + 6, 95);
        if (next >= 95) clearInterval(progInterval);
        return next;
      });
    }, 220);

    /* Rotating messages */
    const msgInterval = setInterval(() => {
      setMsgIdx((i) => (i + 1) % MESSAGES.length);
    }, 900);

    /* Finish */
    const finishTimer = setTimeout(() => {
      clearInterval(progInterval);
      clearInterval(msgInterval);
      setProgress(100);
      setTimeout(() => {
        setFading(true);
        setTimeout(onDone, 600);
      }, 350);
    }, 2700);

    return () => {
      clearInterval(progInterval);
      clearInterval(msgInterval);
      clearTimeout(finishTimer);
    };
  }, [onDone]);

  return (
    <div className={`loader${fading ? ' loader--out' : ''}`}>
      {/* Animated orb */}
      <div className="loader-orb-wrap">
        <div className="loader-orb-ring" />
        <svg className="loader-orb" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="loG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#432D61" />
              <stop offset="100%" stopColor="#3FA4D3" />
            </linearGradient>
            <radialGradient id="loR" cx="38%" cy="35%">
              <stop offset="0%" stopColor="#6A4B9A" />
              <stop offset="100%" stopColor="#2D1F42" />
            </radialGradient>
          </defs>
          <circle cx="60" cy="60" r="56" fill="url(#loR)" />
          <circle cx="60" cy="60" r="56" fill="none" stroke="url(#loG)" strokeWidth="1.5" />
          {/* Orbital rings */}
          <ellipse cx="60" cy="60" rx="56" ry="20" fill="none" stroke="rgba(63,164,211,0.4)" strokeWidth="1.5" transform="rotate(-25 60 60)" />
          <ellipse cx="60" cy="60" rx="50" ry="18" fill="none" stroke="rgba(187,176,182,0.2)" strokeWidth="1" transform="rotate(50 60 60)" />
          {/* Eyes */}
          <circle cx="46" cy="58" r="9"  fill="rgba(255,255,255,0.92)" />
          <circle cx="74" cy="58" r="9"  fill="rgba(255,255,255,0.92)" />
          <circle cx="46" cy="58" r="5.5" fill="#432D61" />
          <circle cx="74" cy="58" r="5.5" fill="#432D61" />
          <circle cx="48" cy="55" r="2"  fill="white" opacity="0.9" />
          <circle cx="76" cy="55" r="2"  fill="white" opacity="0.9" />
          {/* Highlight */}
          <ellipse cx="44" cy="42" rx="14" ry="8" fill="rgba(255,255,255,0.1)" transform="rotate(-20 44 42)" />
        </svg>
      </div>

      <p className="loader-msg" key={msgIdx}>{MESSAGES[msgIdx]}</p>

      <div className="loader-bar-wrap">
        <div className="loader-bar" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
