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
  const svgRef      = useRef(null);
  const leftRef     = useRef(null);
  const rightRef    = useRef(null);
  const rafRef      = useRef(null);
  const mouseRef    = useRef({ x: window.innerWidth * 0.85, y: window.innerHeight * 0.8 });

  const [bubble,   setBubble]   = useState(null);
  const [hovered,  setHovered]  = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const msgIdxRef   = useRef(0);
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
        const scaleY = rect.height / 240;
        const mx     = mouseRef.current.x;
        const my     = mouseRef.current.y;

        [[lp, 74, 59], [rp, 106, 59]].forEach(([el, vbX, vbY]) => {
          const sx  = rect.left + vbX * scaleX;
          const sy  = rect.top  + vbY * scaleY;
          const ang = Math.atan2(my - sy, mx - sx);
          const d   = Math.min(3.5, Math.hypot(mx - sx, my - sy) * 0.04);
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
        viewBox="0 0 180 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="المساعد التفاعلي"
        role="img"
      >
        <defs>
          <linearGradient id="rBodyG" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%"   stopColor="#D6E6F4" />
            <stop offset="50%"  stopColor="#A8C0D8" />
            <stop offset="100%" stopColor="#7A94B0" />
          </linearGradient>
          <linearGradient id="rHeadG" x1="0.25" y1="0" x2="0.75" y2="1">
            <stop offset="0%"   stopColor="#CAD8EC" />
            <stop offset="100%" stopColor="#7C96B4" />
          </linearGradient>
          <linearGradient id="rVisorG" x1="0" y1="0" x2="0.2" y2="1">
            <stop offset="0%"   stopColor="#1C1130" />
            <stop offset="100%" stopColor="#070510" />
          </linearGradient>
          <linearGradient id="rPurpG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#5C3F82" />
            <stop offset="100%" stopColor="#3A2558" />
          </linearGradient>
          <radialGradient id="rEmblemG" cx="45%" cy="35%">
            <stop offset="0%"   stopColor="#A0E0FF" />
            <stop offset="55%"  stopColor="#3FA4D3" />
            <stop offset="100%" stopColor="#1E72A8" />
          </radialGradient>
          <radialGradient id="rHalo" cx="50%" cy="50%">
            <stop offset="0%"   stopColor="rgba(63,164,211,0.22)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="rShadow">
            <feDropShadow dx="0" dy="7" stdDeviation="10" floodColor="#180E2A" floodOpacity="0.65" />
          </filter>
          <filter id="rEyeGlow">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="rGlint">
            <feGaussianBlur stdDeviation="1" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="rChestGlow">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="rAntennaGlow">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Ground shadow halo */}
        <ellipse cx="90" cy="236" rx="46" ry="5" fill="rgba(63,164,211,0.1)" />
        {/* Ambient body glow */}
        <ellipse cx="90" cy="120" rx="70" ry="90" fill="url(#rHalo)" />

        {/* ── LEFT SHOULDER PLATE ── */}
        <path d="M 34 112 L 58 109 L 60 140 L 36 144 Z" fill="url(#rBodyG)" />
        <path d="M 35 113 L 57 110 L 59 139 L 37 143 Z" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.7" />
        <line x1="38" y1="120" x2="57" y2="117" stroke="#432D61" strokeWidth="2" strokeLinecap="round" />
        <line x1="38" y1="127" x2="57" y2="124" stroke="rgba(67,45,97,0.45)" strokeWidth="1.2" strokeLinecap="round" />

        {/* ── RIGHT SHOULDER PLATE ── */}
        <path d="M 146 112 L 122 109 L 120 140 L 144 144 Z" fill="url(#rBodyG)" />
        <path d="M 145 113 L 123 110 L 121 139 L 143 143 Z" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.7" />
        <line x1="142" y1="120" x2="123" y2="117" stroke="#432D61" strokeWidth="2" strokeLinecap="round" />
        <line x1="142" y1="127" x2="123" y2="124" stroke="rgba(67,45,97,0.45)" strokeWidth="1.2" strokeLinecap="round" />

        {/* ── LEFT ARM ── */}
        <rect x="26" y="141" width="28" height="56" rx="12" fill="url(#rBodyG)" />
        <rect x="27" y="142" width="26" height="54" rx="11" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.7" />
        <rect x="28" y="153" width="24" height="6" rx="3" fill="url(#rPurpG)" opacity="0.65" />
        <rect x="28" y="166" width="24" height="4" rx="2" fill="rgba(63,164,211,0.22)" />
        <rect x="28" y="178" width="24" height="4" rx="2" fill="rgba(63,164,211,0.14)" />

        {/* ── RIGHT ARM ── */}
        <rect x="126" y="141" width="28" height="56" rx="12" fill="url(#rBodyG)" />
        <rect x="127" y="142" width="26" height="54" rx="11" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.7" />
        <rect x="128" y="153" width="24" height="6" rx="3" fill="url(#rPurpG)" opacity="0.65" />
        <rect x="128" y="166" width="24" height="4" rx="2" fill="rgba(63,164,211,0.22)" />
        <rect x="128" y="178" width="24" height="4" rx="2" fill="rgba(63,164,211,0.14)" />

        {/* ── TORSO ── */}
        <rect x="54" y="112" width="72" height="76" rx="15" fill="url(#rBodyG)" filter="url(#rShadow)" />
        <rect x="55" y="113" width="70" height="74" rx="14" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />

        {/* Chest accent plate */}
        <rect x="60" y="119" width="60" height="32" rx="9" fill="url(#rPurpG)" />
        <rect x="61" y="120" width="58" height="30" rx="8" fill="none" stroke="rgba(63,164,211,0.5)" strokeWidth="0.9" />

        {/* Chest emblem */}
        <circle cx="90" cy="136" r="12" fill="rgba(63,164,211,0.18)" filter="url(#rChestGlow)" />
        <circle cx="90" cy="136" r="10" fill="url(#rEmblemG)" />
        <circle cx="90" cy="136" r="10" fill="none" stroke="rgba(120,230,255,0.65)" strokeWidth="1.3" />
        <circle cx="90" cy="136" r="5.5" fill="rgba(255,255,255,0.92)" />
        <circle cx="88" cy="134" r="2" fill="rgba(255,255,255,0.6)" />

        {/* Torso lower panel */}
        <line x1="62" y1="158" x2="118" y2="158" stroke="rgba(63,164,211,0.22)" strokeWidth="1" />
        <rect x="70" y="164" width="40" height="9" rx="4.5" fill="rgba(67,45,97,0.4)" />
        <circle cx="80" cy="168.5" r="2.2" fill="#3FA4D3" opacity="0.7" />
        <circle cx="90" cy="168.5" r="2.2" fill="#7DD4F5" opacity="0.85" />
        <circle cx="100" cy="168.5" r="2.2" fill="#3FA4D3" opacity="0.7" />
        <line x1="62" y1="178" x2="118" y2="178" stroke="rgba(255,255,255,0.07)" strokeWidth="0.8" />

        {/* ── NECK ── */}
        <rect x="74" y="100" width="32" height="15" rx="6" fill="url(#rBodyG)" />
        <line x1="74" y1="105" x2="106" y2="105" stroke="rgba(0,0,0,0.14)" strokeWidth="0.9" />
        <line x1="74" y1="110" x2="106" y2="110" stroke="rgba(0,0,0,0.1)" strokeWidth="0.9" />

        {/* ── HEAD ── */}
        <rect x="46" y="16" width="88" height="88" rx="22" fill="url(#rHeadG)" filter="url(#rShadow)" />
        <rect x="47" y="17" width="86" height="86" rx="21" fill="none" stroke="rgba(255,255,255,0.24)" strokeWidth="0.9" />
        {/* Head top accent bar */}
        <rect x="62" y="17" width="56" height="5" rx="2.5" fill="url(#rPurpG)" opacity="0.6" />
        {/* Head side highlight */}
        <rect x="48" y="28" width="5" height="22" rx="2.5" fill="rgba(255,255,255,0.08)" />
        <rect x="127" y="28" width="5" height="22" rx="2.5" fill="rgba(255,255,255,0.08)" />

        {/* ── ANTENNA ── */}
        <line x1="90" y1="6" x2="90" y2="18" stroke="#90AECB" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="90" cy="4" r="5.5" fill="#3FA4D3" filter="url(#rAntennaGlow)" />
        <circle cx="90" cy="4" r="2.8" fill="#C0EEFF" />

        {/* ── LEFT EAR ── */}
        <rect x="36" y="42" width="12" height="34" rx="6" fill="url(#rBodyG)" />
        <rect x="37.5" y="47" width="8" height="7" rx="2.5" fill="rgba(63,164,211,0.58)" />
        <rect x="37.5" y="59" width="8" height="5" rx="2" fill="rgba(67,45,97,0.55)" />
        <rect x="37.5" y="68" width="8" height="5" rx="2" fill="rgba(63,164,211,0.32)" />

        {/* ── RIGHT EAR ── */}
        <rect x="132" y="42" width="12" height="34" rx="6" fill="url(#rBodyG)" />
        <rect x="134.5" y="47" width="8" height="7" rx="2.5" fill="rgba(63,164,211,0.58)" />
        <rect x="134.5" y="59" width="8" height="5" rx="2" fill="rgba(67,45,97,0.55)" />
        <rect x="134.5" y="68" width="8" height="5" rx="2" fill="rgba(63,164,211,0.32)" />

        {/* ── VISOR ── */}
        <rect x="54" y="32" width="72" height="58" rx="15" fill="url(#rVisorG)" />
        <rect x="55" y="33" width="70" height="56" rx="14" fill="none" stroke="rgba(63,164,211,0.2)" strokeWidth="0.8" />
        {/* Visor glare reflection */}
        <path d="M 60 40 Q 82 35 104 41" stroke="rgba(255,255,255,0.055)" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* ── LEFT EYE ── */}
        {/* Eye socket */}
        <rect x="60" y="49" width="26" height="17" rx="8.5" fill="rgba(4,2,10,0.92)" />
        <rect x="61" y="50" width="24" height="15" rx="7.5" fill="rgba(63,164,211,0.07)" />
        {/* LED arc glow (halo layer) */}
        <path d="M 64 65 Q 73 52 82 65" stroke="rgba(63,164,211,0.32)" strokeWidth="7" strokeLinecap="round" fill="none" />
        {/* LED arc bright */}
        <path d="M 64 65 Q 73 52 82 65" stroke="#3FA4D3" strokeWidth="2.6" strokeLinecap="round" fill="none" filter="url(#rEyeGlow)" />

        {/* ── RIGHT EYE ── */}
        <rect x="94" y="49" width="26" height="17" rx="8.5" fill="rgba(4,2,10,0.92)" />
        <rect x="95" y="50" width="24" height="15" rx="7.5" fill="rgba(63,164,211,0.07)" />
        <path d="M 98 65 Q 107 52 116 65" stroke="rgba(63,164,211,0.32)" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M 98 65 Q 107 52 116 65" stroke="#3FA4D3" strokeWidth="2.6" strokeLinecap="round" fill="none" filter="url(#rEyeGlow)" />

        {/* Left eye tracked glint */}
        <g ref={leftRef}>
          <circle cx="74" cy="59" r="3.8" fill="rgba(130,224,255,0.82)" filter="url(#rGlint)" />
          <circle cx="73" cy="58" r="1.7" fill="white" opacity="0.96" />
        </g>

        {/* Right eye tracked glint */}
        <g ref={rightRef}>
          <circle cx="106" cy="59" r="3.8" fill="rgba(130,224,255,0.82)" filter="url(#rGlint)" />
          <circle cx="105" cy="58" r="1.7" fill="white" opacity="0.96" />
        </g>

        {/* ── MOUTH / SPEAKER GRILLE ── */}
        <rect x="66" y="77" width="48" height="11" rx="5.5" fill="rgba(4,2,10,0.72)" />
        <rect x="67" y="78" width="46" height="9" rx="4.5" fill="none" stroke="rgba(63,164,211,0.16)" strokeWidth="0.6" />
        <circle cx="76"  cy="82.5" r="1.7" fill="rgba(63,164,211,0.5)" />
        <circle cx="83"  cy="82.5" r="1.7" fill="rgba(63,164,211,0.5)" />
        <circle cx="90"  cy="82.5" r="1.7" fill="rgba(63,164,211,0.7)" />
        <circle cx="97"  cy="82.5" r="1.7" fill="rgba(63,164,211,0.5)" />
        <circle cx="104" cy="82.5" r="1.7" fill="rgba(63,164,211,0.5)" />
      </svg>
    </div>
  );
}
