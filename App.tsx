import * as React from 'react';
import { useState } from 'react';
import HeroSection from './components/ui/HeroSection';
import Dashboard from './components/Dashboard';
import LoginModal from './components/LoginModal';
import LanguageToggle from './components/ui/LanguageToggle';
import ThemeToggle from './components/ui/ThemeToggle';
import { User } from './types';

const App: React.FC = () => {
  console.log("App.tsx: Rendering App component...");
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = (user: User) => {
    setUser(user);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div style={{ position: 'fixed', top: 0, right: 0, padding: '5px', background: '#10b981', color: 'white', zIndex: 1000, fontSize: '10px' }}>
        App Component Loaded
      </div>
      {!user ? (
        <>
          {/* Navbar for Landing */}
          <nav className="fixed w-full z-40 top-0 start-0 border-b border-border bg-background/80 backdrop-blur-md">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
              <span className="self-center text-2xl font-bold whitespace-nowrap text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                </div>
                DSE<span className="text-emerald-500">Analytics</span>
              </span>
              <div className="flex items-center md:order-2 space-x-3 md:space-x-4 rtl:space-x-reverse">
                <div className="hidden sm:flex items-center gap-2">
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
                <button
                  onClick={() => setShowLogin(true)}
                  className="text-white bg-secondary hover:bg-accent focus:ring-4 focus:outline-none focus:ring-emerald-800 font-medium rounded-lg text-sm px-4 py-2 text-center border border-border"
                >
                  Log In
                </button>
                <button
                  onClick={() => setShowLogin(true)}
                  className="ml-2 text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:outline-none focus:ring-emerald-800 font-medium rounded-lg text-sm px-4 py-2 text-center"
                >
                  Get Started
                </button>
              </div>
            </div>
          </nav>

          <HeroSection onGetStarted={() => setShowLogin(true)} />

          <LoginModal
            isOpen={showLogin}
            onClose={() => setShowLogin(false)}
            onLoginSuccess={handleLogin}
          />
        </>
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;