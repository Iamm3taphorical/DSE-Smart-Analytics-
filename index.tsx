import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './i18n';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';

console.log("Index.tsx: Hydrating application...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Critical: #root element not found!");
} else {
  const root = createRoot(rootElement);

  // High-level Error Boundary Component
  class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
    constructor(props: any) {
      super(props);
      this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: any) {
      return { hasError: true, error };
    }
    componentDidCatch(error: any, errorInfo: any) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
    render() {
      if (this.state.hasError) {
        return (
          <div style={{ padding: '40px', background: '#09090b', color: '#ef4444', height: '100vh', fontFamily: 'sans-serif' }}>
            <h1 style={{ fontSize: '2rem' }}>Component Crash Detected</h1>
            <p style={{ color: '#fafafa' }}>A critical error occurred while rendering the UI.</p>
            <pre style={{ background: '#1c1c1f', padding: '20px', borderRadius: '8px', overflow: 'auto', border: '1px solid #3f3f46' }}>
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' }}
            >
              Reload Application
            </button>
          </div>
        );
      }
      return this.props.children;
    }
  }

  root.render(
    <ErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  );
  console.log("Index.tsx: Mount successful.");
}