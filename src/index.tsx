
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Senior Level Logging & Error Handling
console.log("%c[FinanceFlow]%c Initializing Application...", "color: #6366f1; font-weight: bold", "color: inherit");

const rootElement = document.getElementById('root');

if (!rootElement) {
  const errorMsg = "Critical Error: Root element #root not found in DOM.";
  console.error(errorMsg);
  document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;">${errorMsg}</div>`;
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("React Mounting Failed:", err);
    rootElement.innerHTML = `
      <div style="background: #fff1f2; color: #991b1b; padding: 2rem; border-radius: 1rem; margin: 2rem; border: 1px solid #fecaca; font-family: system-ui;">
        <h1 style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 900;">Falha ao Inicializar App</h1>
        <p style="margin: 0 0 1rem 0; font-size: 0.875rem;">Ocorreu um erro no carregamento do React 19. Verifique o console do desenvolvedor (F12).</p>
        <pre style="background: #000; color: #0f0; padding: 1rem; border-radius: 0.5rem; overflow: auto; font-size: 0.75rem;">${err instanceof Error ? err.stack : String(err)}</pre>
      </div>
    `;
  }
}
