import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './Client/ClientsComponent/ErrorBoundary'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Collapse accidental repeated slashes in the path (e.g. a mistyped or
// mis-built link landing on "/GreenCards//admin/auth") into a single
// slash before the router ever sees it — "//" is never intentional in
// a path, and left alone it silently breaks basename stripping.
(function normalizeDuplicateSlashes() {
  const { pathname, search, hash } = window.location;
  const normalized = pathname.replace(/\/{2,}/g, '/');
  if (normalized !== pathname) {
    window.history.replaceState(null, '', normalized + search + hash);
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* reducedMotion="user" makes every motion.* component in the app
        automatically honor the OS-level prefers-reduced-motion setting */}
    <MotionConfig reducedMotion="user">
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </MotionConfig>
  </StrictMode>,
)

