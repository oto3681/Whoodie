import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Global uncaught error and unhandled rejection guards
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('[Global Uncaught Error Captured]:', event.error || event.message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Global Unhandled Promise Rejection]:', event.reason);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

