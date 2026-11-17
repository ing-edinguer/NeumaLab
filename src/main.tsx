import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Feature-detect native Popover API before conditionally loading polyfill
if (typeof HTMLElement !== 'undefined' && !Object.hasOwn(HTMLElement.prototype, 'popover')) {
  import('@oddbird/popover-polyfill').catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
