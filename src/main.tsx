// Safeguard to prevent "TypeError: Cannot set property fetch of #<Window> which has only a getter"
// in sandbox environments/iframes where window.fetch has only a getter.
try {
  const originalFetch = window.fetch || globalThis.fetch || self.fetch;
  if (originalFetch) {
    let currentFetch = originalFetch;
    const getter = () => currentFetch;
    const setter = (val: any) => { currentFetch = val; };

    const targets = [
      window,
      globalThis,
      self,
      typeof Window !== 'undefined' ? Window.prototype : null,
      (window as any).__proto__,
      (globalThis as any).__proto__,
      (self as any).__proto__,
      typeof EventTarget !== 'undefined' ? EventTarget.prototype : null
    ];

    targets.forEach((target) => {
      if (!target) return;
      try {
        Object.defineProperty(target, 'fetch', {
          get: getter,
          set: setter,
          configurable: true,
          enumerable: true
        });
      } catch (err) {}
    });
  }
} catch (e) {}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
