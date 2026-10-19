import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

function initApp() {
  let rootElement = document.getElementById('root');
  if (!rootElement) {
    rootElement = document.createElement('div');
    rootElement.id = 'root';
    rootElement.className = 'h-full w-full';
    document.body.appendChild(rootElement);
  }

  try {
    createRoot(rootElement).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } catch (err) {
    console.error('Fatal initialization error:', err);
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="color:white;background:#09090b;padding:24px;font-family:sans-serif;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
          <h2 style="color:#ef4444;margin-bottom:8px;">M32 Pro Console - เริ่มการทำงาน</h2>
          <p style="color:#a1a1aa;font-size:14px;margin-bottom:16px;">กำลังโหลดระบบคอนโซล กรุณากดปุ่มเพื่อรีโหลดหน้าจอ</p>
          <button onclick="window.location.reload()" style="background:#e11d48;color:white;border:none;padding:12px 24px;border-radius:8px;font-weight:bold;cursor:pointer;">รีโหลดหน้าจอ (RELOAD)</button>
        </div>
      `;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

