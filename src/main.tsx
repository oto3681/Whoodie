import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Global uncaught error and unhandled rejection guards
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.warn('[Handled Runtime Error]:', event.error || event.message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    // Prevent browser from escalating unhandled promise rejections
    if (event.reason) {
      console.warn('[Handled Promise Rejection]:', event.reason);
    }
    event.preventDefault();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

