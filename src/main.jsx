import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App';

import { Analytics } from '@vercel/analytics/react';
 
export default function App() {
  return (
    <div>
      {/* ... */}
      <Analytics />
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
