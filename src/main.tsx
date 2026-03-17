import React, { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '20px', textAlign: 'center', background: '#f8fafc' }}>
          <h1 style={{ color: '#ef4444' }}>Error de Aplicación</h1>
          <p style={{ color: '#64748b', maxWidth: '400px' }}>Ocurrió un error inesperado al renderizar la aplicación.</p>
          <pre style={{ background: '#f1f5f9', padding: '15px', borderRadius: '8px', fontSize: '12px', marginTop: '20px', textAlign: 'left', overflow: 'auto', maxWidth: '100%' }}>
            {this.state.error?.message}
            {'\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
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

