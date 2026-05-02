/* ─── Certificate canvas renderer ───────────────────────────── */

export function drawCertificate(ctx, event, name) {
  if (!ctx) return;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.clearRect(0, 0, W, H);

  if (event?.certificateTemplate) {
    drawFromTemplate(ctx, event, name, W, H);
  } else {
    drawGenerated(ctx, event, name, W, H);
  }
}

function drawFromTemplate(ctx, event, name, W, H) {
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(img, 0, 0, W, H);
    if (name) {
      const nx  = ((event.nameX  ?? 50) / 100) * W;
      const ny  = ((event.nameY  ?? 55) / 100) * H;
      const fs  = event.nameFontSize ?? 52;
      ctx.textAlign    = 'center';
      ctx.direction    = 'rtl';
      ctx.font         = `bold ${fs}px "Thmanyah Sans", Arial, sans-serif`;
      ctx.fillStyle    = event.nameColor || '#432D61';
      ctx.fillText(name, nx, ny);
    }
  };
  img.src = event.certificateTemplate;
}

function drawGenerated(ctx, event, name, W, H) {
  /* Background */
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,   '#0E0A16');
  bg.addColorStop(0.5, '#2D1F42');
  bg.addColorStop(1,   '#1A3550');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  /* Soft blobs */
  const blobs = [
    { x: 0,   y: 0,   r: 350, c: 'rgba(67,45,97,0.4)'  },
    { x: W,   y: H,   r: 400, c: 'rgba(63,164,211,0.2)' },
    { x: W/2, y: H*0.3, r: 300, c: 'rgba(63,164,211,0.08)' },
  ];
  blobs.forEach(({ x, y, r, c }) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, c);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  /* Outer border */
  const pad = 30;
  ctx.strokeStyle = 'rgba(63,164,211,0.5)';
  ctx.lineWidth   = 2.5;
  roundRect(ctx, pad, pad, W - pad * 2, H - pad * 2, 28);
  ctx.stroke();

  /* Inner border */
  const ip = 46;
  ctx.strokeStyle = 'rgba(63,164,211,0.18)';
  ctx.lineWidth   = 1;
  roundRect(ctx, ip, ip, W - ip * 2, H - ip * 2, 18);
  ctx.stroke();

  /* Corner ornaments */
  drawCorners(ctx, W, H);

  /* Header */
  ctx.textAlign  = 'center';
  ctx.direction  = 'rtl';
  ctx.font       = '500 26px "Thmanyah Sans", Arial, sans-serif';
  ctx.fillStyle  = '#3FA4D3';
  ctx.fillText('جامعة السلطان قابوس — كلية العلوم', W / 2, 108);

  dividerLine(ctx, W, 128);

  /* Main title */
  ctx.font      = 'bold 68px "Thmanyah Sans", Arial, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('شهادة مشاركة', W / 2, 218);

  /* Title accent line */
  const tg = ctx.createLinearGradient(W * 0.28, 0, W * 0.72, 0);
  tg.addColorStop(0,   '#432D61');
  tg.addColorStop(0.5, '#3FA4D3');
  tg.addColorStop(1,   '#432D61');
  ctx.strokeStyle = tg;
  ctx.lineWidth   = 4;
  ctx.beginPath();
  ctx.moveTo(W * 0.28, 238);
  ctx.lineTo(W * 0.72, 238);
  ctx.stroke();

  /* Subtitle */
  ctx.font      = '400 28px "Thmanyah Sans", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fillText('تُشهد جماعة الأنشطة الطلابية بكلية العلوم بأن', W / 2, 302);

  /* Name area */
  const naY = 340, naH = 120, naP = 70;
  const naG = ctx.createLinearGradient(naP, naY, W - naP, naY + naH);
  naG.addColorStop(0,   'rgba(63,164,211,0.1)');
  naG.addColorStop(0.5, 'rgba(63,164,211,0.2)');
  naG.addColorStop(1,   'rgba(67,45,97,0.1)');
  ctx.fillStyle = naG;
  roundRect(ctx, naP, naY, W - naP * 2, naH, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(63,164,211,0.45)';
  ctx.lineWidth   = 1.5;
  roundRect(ctx, naP, naY, W - naP * 2, naH, 18);
  ctx.stroke();

  const displayName = name || 'اسم المشارك';
  const fs = fitFont(ctx, displayName, W - naP * 2 - 80, 58, 22);
  ctx.font      = `bold ${fs}px "Thmanyah Sans", Arial, sans-serif`;
  ctx.fillStyle = name ? (event.nameColor || '#FFFFFF') : 'rgba(255,255,255,0.28)';
  ctx.fillText(displayName, W / 2, naY + naH / 2 + fs * 0.36);

  /* Event info */
  ctx.font      = '400 26px "Thmanyah Sans", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.68)';
  ctx.fillText(
    event ? `على مشاركته في فعالية: "${event.title}"` : 'على مشاركته في الفعالية',
    W / 2, 508
  );

  if (event?.date) {
    ctx.font      = '400 22px "Thmanyah Sans", Arial, sans-serif';
    ctx.fillStyle = '#3FA4D3';
    ctx.fillText(
      `بتاريخ ${new Date(event.date + 'T00:00:00').toLocaleDateString('ar-OM', { year:'numeric', month:'long', day:'numeric' })}`,
      W / 2, 548
    );
  }

  /* Signatures */
  drawSignatures(ctx, W, H);
  drawDecorDots(ctx, W, H);
}

/* ─── Helpers ─────────────────────────────────────────────── */

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function dividerLine(ctx, W, y) {
  const g = ctx.createLinearGradient(W * 0.15, 0, W * 0.85, 0);
  g.addColorStop(0,   'transparent');
  g.addColorStop(0.5, 'rgba(63,164,211,0.5)');
  g.addColorStop(1,   'transparent');
  ctx.strokeStyle = g;
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.moveTo(W * 0.15, y);
  ctx.lineTo(W * 0.85, y);
  ctx.stroke();
}

function drawCorners(ctx, W, H) {
  const sz = 55;
  [[58, 58, 1, 1], [W - 58, 58, -1, 1], [58, H - 58, 1, -1], [W - 58, H - 58, -1, -1]]
    .forEach(([x, y, rx, ry]) => {
      ctx.strokeStyle = '#3FA4D3';
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + ry * sz);
      ctx.lineTo(x, y);
      ctx.lineTo(x + rx * sz, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + rx * 9, y + ry * 9, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(63,164,211,0.6)';
      ctx.fill();
    });
}

function drawSignatures(ctx, W, H) {
  const y = H - 130;
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  [[W * 0.12, W * 0.38], [W * 0.62, W * 0.88]].forEach(([x1, x2]) => {
    ctx.beginPath(); ctx.moveTo(x1, y + 56); ctx.lineTo(x2, y + 56); ctx.stroke();
  });
  ctx.font      = '400 20px "Thmanyah Sans", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillText('رئيس الجماعة', W * 0.25, y + 80);
  ctx.fillText('المشرف الأكاديمي', W * 0.75, y + 80);
  ctx.font      = '400 17px "Thmanyah Sans", Arial, sans-serif';
  ctx.fillStyle = '#3FA4D3';
  ctx.fillText('جماعة الأنشطة الطلابية | كلية العلوم | جامعة السلطان قابوس', W / 2, H - 46);
}

function drawDecorDots(ctx, W, H) {
  [
    [0.07, 0.22, '#3FA4D3', 3.5], [0.93, 0.3, '#432D61', 4],
    [0.04, 0.65, '#BBB0B6', 2.5], [0.96, 0.7, '#3FA4D3', 3],
  ].forEach(([px, py, c, r]) => {
    ctx.beginPath();
    ctx.arc(px * W, py * H, r, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  });
}

function fitFont(ctx, text, maxW, maxPx, minPx) {
  let s = maxPx;
  while (s > minPx) {
    ctx.font = `bold ${s}px "Thmanyah Sans", Arial, sans-serif`;
    if (ctx.measureText(text).width <= maxW) return s;
    s -= 2;
  }
  return minPx;
}

/* ─── Download helpers ──────────────────────────────────────── */

export function downloadPNG(canvas, name) {
  const link = document.createElement('a');
  link.download = `شهادة_${(name || 'certificate').replace(/\s+/g, '_')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function downloadPDF(canvas) {
  const dataUrl = canvas.toDataURL('image/png');
  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html dir="rtl"><head><title>شهادة</title>
    <style>*{margin:0;padding:0;box-sizing:border-box}body{background:#fff}
    img{width:100%;height:auto;display:block}
    @media print{@page{size:A4 landscape;margin:0}img{width:100vw}}</style>
    </head><body><img src="${dataUrl}"/>
    <script>window.onload=()=>window.print()<\/script></body></html>`);
  win.document.close();
}
