import { createRoot } from 'react-dom/client';
import './index.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <>
    <App />
    {/* Cookie-free RUM (A11 na auditoria): pageviews + Web Vitals reais por
        device. Os scripts são servidos pelo mesmo domínio (/_vercel/*) — a
        nota "zero requests externos" do ADR-021 permanece verdadeira. */}
    <Analytics />
    <SpeedInsights />
  </>,
);
