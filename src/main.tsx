import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (error) {
    console.error('Failed to render app:', error);
    rootElement.innerHTML = `
      <div style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; padding: 20px; text-align: center; background: #f8fafc;">
        <h1 style="color: #ef4444;">Error de Inicio</h1>
        <p style="color: #64748b; max-width: 400px;">No se pudo cargar la aplicación. Esto suele deberse a variables de entorno faltantes en Vercel.</p>
        <pre style="background: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 12px; margin-top: 20px; text-align: left; overflow: auto; max-width: 100%;">${error instanceof Error ? error.message : String(error)}</pre>
      </div>
    `;
  }
}
