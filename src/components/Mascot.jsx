import { useRef, useEffect, useState, useCallback } from 'react';

const MESSAGES = [
  'أهلاً وسهلاً! 👋',
  'استكشف فعالياتنا 🚀',
  'العلم يبني المستقبل ⚗️',
  'انضم إلينا اليوم! 🌟',
  'نحن سعداء بوجودك 😊',
  'اكتشف اللجان الخمس 🧩',
];

export default function Mascot() {
  const svgRef       = useRef(null);
  const leftRef      = useRef(null);
  const rightRef     = useRef(null);
  const rafRef       = useRef(null);
  const mouseRef     = useRef({ x: window.innerWidth * 0.85, y: window.innerHeight * 0.8 });

  const [bubble,   setBubble]   = useState(null);
  const [hovered,  setHovered]  = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const msgIdxRef = useRef(0);
  const bubbleTimer = useRef(null);

  /* Eye tracking via RAF */
  useEffect(() => {
    const onMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    document.addEventListener('mousemove', onMove);

    const track = () => {
      const svg = svgRef.current;
      const lp  = leftRef.current;
      const rp  = rightRef.current;
      if (svg && lp && rp) {
        const rect   = svg.getBoundingClientRect();
        const scaleX = rect.width  / 180;
        const scaleY = rect.height / 180;
        const mx     = mouseRef.current.x;
        const my     = mouseRef.current.y;

        [[lp, 75, 88], [rp, 105, 88]].forEach(([el, vbX, vbY]) => {
          const sx  = rect.left + vbX * scaleX;
          const sy  = rect.top  + vbY * scaleY;
          const ang = Math.atan2(my - sy, mx - sx);
          const d   = Math.min(4, Math.hypot(mx - sx, my - sy) * 0.04);
          const dx  = (Math.cos(ang) * d) / scaleX;
          const dy  = (Math.sin(ang) * d) / scaleY;
          el.setAttribute('transform', `translate(${dx.toFixed(2)},${dy.toFixed(2)})`);
        });
      }
      rafRef.current = requestAnimationFrame(track);
    };
    rafRef.current = requestAnimationFrame(track);

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const showBubble = useCallback((msg) => {
    clearTimeout(bubbleTimer.current);
    setBubble(msg);
    bubbleTimer.current = setTimeout(() => setBubble(null), 3200);
  }, []);

  const handleClick = useCallback(() => {
    const msg = MESSAGES[msgIdxRef.current % MESSAGES.length];
    msgIdxRef.current++;
    showBubble(msg);
    setBouncing(true);
    setTimeout(() => setBouncing(false), 600);
  }, [showBubble]);

  /* Auto-greet after 2s */
  useEffect(() => {
    const t = setTimeout(() => showBubble(MESSAGES[0]), 2000);
    return () => clearTimeout(t);
  }, [showBubble]);

  return (
    <div className={`mascot${hovered ? ' mascot--hover' : ''}${bouncing ? ' mascot--bounce' : ''}`}>
      {bubble && <div className="mascot-bubble">{bubble}</div>}

      <svg
        ref={svgRef}
        className="mascot-svg"
        viewBox="0 0 180 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="المساعد التفاعلي"
        role="img"
      >
        <defs>
          <radialGradient id="mOrbG" cx="38%" cy="33%">
            <stop offset="0%"   stopColor="#6A4B9A" />
            <stop offset="100%" stopColor="#2D1F42" />
          </radialGradient>
          <radialGradient id="mGlow" cx="50%" cy="50%">
            <stop offset="0%"   stopColor="rgba(63,164,211,0.35)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="mShadow">
            <feDropShadow dx="0" dy="8" stdDeviation="14" floodColor="#432D61" floodOpacity="0.5" />
          </filter>
          <filter id="mEyeGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Ambient glow */}
        <circle cx="90" cy="95" r="82" fill="url(#mGlow)" />

        {/* Outer ring */}
        <circle cx="90" cy="88" r="78" stroke="rgba(63,164,211,0.12)" strokeWidth="1" />

        {/* Main orb */}
        <circle cx="90" cy="88" r="68" fill="url(#mOrbG)" filter="url(#mShadow)" />

        {/* Highlight */}
        <ellipse cx="68" cy="64" rx="22" ry="12" fill="rgba(255,255,255,0.1)" transform="rotate(-20 68 64)" />

        {/* Orbital ring 1 */}
        <ellipse cx="90" cy="88" rx="78" ry="26" stroke="rgba(63,164,211,0.38)" strokeWidth="1.5" transform="rotate(-28 90 88)" />
        {/* Orbital dot 1 */}
        <circle cx="160" cy="72" r="5" fill="#3FA4D3" filter="url(#mEyeGlow)" />

        {/* Orbital ring 2 */}
        <ellipse cx="90" cy="88" rx="72" ry="22" stroke="rgba(187,176,182,0.2)" strokeWidth="1" transform="rotate(48 90 88)" />
        {/* Orbital dot 2 */}
        <circle cx="28" cy="112" r="4" fill="#BBB0B6" opacity="0.6" />

        {/* Inner rings (subtle) */}
        <circle cx="90" cy="88" r="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        <circle cx="90" cy="88" r="35" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />

        {/* Eye sockets */}
        <circle cx="75"  cy="85" r="11.5" fill="rgba(255,255,255,0.93)" />
        <circle cx="105" cy="85" r="11.5" fill="rgba(255,255,255,0.93)" />

        {/* Left pupil (tracked) */}
        <g ref={leftRef}>
          <circle cx="75"  cy="85" r="7"   fill="#432D61" />
          <circle cx="78"  cy="82" r="2.5" fill="white" opacity="0.9" />
          <circle cx="72"  cy="88" r="1.5" fill="white" opacity="0.35" />
        </g>

        {/* Right pupil (tracked) */}
        <g ref={rightRef}>
          <circle cx="105" cy="85" r="7"   fill="#432D61" />
          <circle cx="108" cy="82" r="2.5" fill="white" opacity="0.9" />
          <circle cx="102" cy="88" r="1.5" fill="white" opacity="0.35" />
        </g>

        {/* Subtle mouth */}
        <path d="M 80 104 Q 90 112 100 104" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
