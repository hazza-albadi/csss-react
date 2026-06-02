# CSSS Platform v2

React + Vite platform for the College of Science Student Society at Sultan Qaboos University.

## Overview

This project is a single-page React application with:

- Public pages for `Home`, `About`, `Events`, and `Join`
- An admin page at `/admin`
- Local data persistence via `localStorage` by default
- Optional Supabase integration when environment variables are configured
- Certificate participant import support for `.csv`, `.xlsx`, and `.xls`

## Tech Stack

- React 18
- Vite 5
- JavaScript (ES modules, JSX)
- Plain CSS (`src/styles.css`)
- Supabase JavaScript client
- `xlsx` for spreadsheet parsing

## Requirements

- Node.js 18+ recommended
- npm

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run locally

```bash
npm run dev
```

Vite will start a local development server. By default, it is typically available at:

```text
http://localhost:5173
```

### 3. Build for production

```bash
npm run build
```

The production build is generated in `dist/`.

### 4. Preview the production build

```bash
npm run preview
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run vercel-build` | Production build command used for Vercel |

## Environment Variables

Supabase is optional. If the variables below are not set, the app falls back to `localStorage`.

Create a `.env.local` file in the project root with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Relevant implementation:

- `src/lib/supabase.js`
- `src/lib/db.js`

## Data Storage

By default, the app stores its state in browser `localStorage` using the key:

```text
csss_v2
```

When Supabase is configured, the app can read and write remote data through the shared data layer in `src/lib/db.js`.

## Routing

This project uses a custom client-side pathname router in `src/App.jsx`, not `react-router`.

Current routes:

- `/`
- `/about`
- `/events`
- `/join`
- `/admin`

For deployment, `vercel.json` is configured to rewrite unknown routes to `index.html` so these paths work as an SPA.

## Admin Notes

- The admin page lives at `/admin`
- Admin access uses Supabase Auth and the `admins` table
- Google login requires the Google provider to be enabled in the Supabase dashboard
- Run the SQL in `supabase-admins-setup.sql` to create the `admins` table and RLS policies
- Default content, events, committees, tasks, achievements, and stats are also seeded from `src/store.jsx`

## Project Structure

```text
csss-react/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── vercel.json
├── public/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── store.jsx
│   ├── styles.css
│   ├── assets/
│   │   └── society-logo.png
│   ├── components/
│   │   ├── CertificateModal.jsx
│   │   ├── Footer.jsx
│   │   ├── LoadingScreen.jsx
│   │   ├── Mascot.jsx
│   │   └── Nav.jsx
│   ├── lib/
│   │   ├── db.js
│   │   └── supabase.js
│   ├── pages/
│   │   ├── About.jsx
│   │   ├── Admin.jsx
│   │   ├── Events.jsx
│   │   ├── Home.jsx
│   │   └── Join.jsx
│   └── utils/
│       ├── certificate.js
│       └── helpers.js
└── README.md
```

## Certificates and Participant Imports

The certificate flow includes:

- Certificate rendering utilities in `src/utils/certificate.js`
- Certificate modal UI in `src/components/CertificateModal.jsx`
- Spreadsheet and CSV parsing in `src/lib/db.js`

Supported participant import formats:

- `.csv`
- `.xlsx`
- `.xls`

## Deployment

This is a Vite SPA and can be deployed to any static host that supports SPA fallback routing.

Examples:

- Vercel
- Netlify
- GitHub Pages
- Any static host serving the `dist/` directory

Basic deployment flow:

```bash
npm run build
```

Then deploy the generated `dist/` folder.

## Notes

- Styling is centralized in `src/styles.css`
- The project currently uses plain React state/context via `src/store.jsx`
- Supabase support is optional and gracefully disabled when env vars are missing
