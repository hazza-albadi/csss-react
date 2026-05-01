# جماعة الأنشطة الطلابية — CSSS Platform v2

Premium React platform for the College of Science Student Society at Sultan Qaboos University.

---

## Quick Start

```bash
cd csss-react
npm install
npm run dev
# Open: http://localhost:5173
```

Build for deployment:
```bash
npm run build
# Deploy the dist/ folder anywhere
```

---

## Project Structure

```
csss-react/
├── index.html
├── package.json
├── vite.config.js
├── assets/
│   └── logo.png          ← DROP YOUR LOGO HERE
└── src/
    ├── main.jsx
    ├── App.jsx            # Router + page transitions
    ├── store.js           # All data + localStorage
    ├── styles.css         # Complete design system
    ├── utils/
    │   ├── certificate.js # Canvas cert renderer
    │   └── helpers.js     # Date formatting
    ├── components/
    │   ├── LoadingScreen.jsx
    │   ├── Mascot.jsx     # Animated orb with eye tracking
    │   ├── Nav.jsx
    │   ├── Footer.jsx
    │   └── CertificateModal.jsx
    └── pages/
        ├── Home.jsx       # Cinematic hero + parallax
        ├── About.jsx      # Goal / Mission / Impact
        ├── Join.jsx       # All 5 committees
        ├── Events.jsx     # Upcoming + past + cert modal
        └── Admin.jsx      # Full admin panel (4 tabs)
```

---

## Admin Panel

Navigate to `#admin` in the browser (click "الإدارة" in nav).

| | |
|---|---|
| **Password** | `csss@2025` |
| **Change password** | `src/store.js` → line 5: `ADMIN_PASSWORD` |

### Admin Tabs

| Tab | What you can do |
|---|---|
| **الفعاليات** | Add / edit / delete events, upload images, toggle certificate, upload cert template, set name position |
| **اللجان** | Edit committee descriptions and Google Form links |
| **المحتوى** | Edit hero slogan, about page text, email, Instagram |
| **إدارة المهام** | Notion-style task table — add/edit/delete tasks with status, deadline, committee |

---

## Logo Replacement

Three places to update:

1. **`index.html`** — favicon `<link rel="icon" href="./assets/logo.png">`
2. **`src/components/Nav.jsx`** — find `{/* LOGO REPLACEMENT */}` comment, replace `<div className="nav-logo-svg">...</div>` with `<img src="./assets/logo.png" alt="شعار الجمعية" className="nav-logo-img" />`
3. **`src/components/Footer.jsx`** — find `{/* LOGO REPLACEMENT (footer) */}` comment, replace SVG with `<img>` tag

---

## Brand Colors

Edit CSS variables at top of `src/styles.css`:

```css
--p:  #432D61;  /* Primary purple  */
--a:  #3FA4D3;  /* Accent blue     */
--mu: #BBB0B6;  /* Muted gray      */
--li: #E9E9E9;  /* Light gray      */
```

---

## Google Forms

Update form links:
- **Events**: Admin → الفعاليات → edit event → "رابط Google Form"
- **Committees**: Admin → اللجان → update link per committee

---

## Certificate System

Each event has a "Has Certificate" toggle (Admin → الفعاليات → edit).

When enabled:
- Event card shows "🎓 الشهادة" button
- Modal opens with name input + live canvas preview
- Download PNG or export PDF (browser print)

Upload a custom template: Admin → edit event → "قالب الشهادة"
If no template, a premium auto-generated design is used.

---

## Deployment

**Netlify (easiest):**
1. `npm run build`
2. Drag `dist/` folder to netlify.com

**GitHub Pages:**
```bash
npm run build
# Push dist/ to gh-pages branch or use GitHub Actions
```

**Any static host:** Upload contents of `dist/`

---

## Data Storage

All data lives in `localStorage` (key: `csss_v2`).

To migrate to a real backend (Firebase/Supabase), replace the `getData`/`persist` functions in `src/store.js` — all components use the same `useStore()` hook, so nothing else changes.

---

*جماعة الأنشطة الطلابية بكلية العلوم — جامعة السلطان قابوس*
