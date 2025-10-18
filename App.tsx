import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './HomePage';
import DashboardPage from './DashboardPage';
import ProfilePage from './ProfilePage';
import { AuroraBackground } from './components/ui/aurora-background';

export type Page = 'home' | 'dashboard' | 'profile';
export type DashboardTab = 'explore' | 'dashboard';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('home');
  const [activeDashboardTab, setActiveDashboardTab] = useState<DashboardTab>('explore');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  const handleScroll = () => {
    // Hide header on scroll down, show on scroll up
    if (window.scrollY > lastScrollY && window.scrollY > 100) {
      setIsHeaderVisible(false);
    } else {
      setIsHeaderVisible(true);
    }
    setLastScrollY(window.scrollY); 
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleNavigate = (newPage: Page, tab?: DashboardTab) => {
    // In a real app, you'd show a login modal. Here, we'll auto-login for demo.
    if (!isLoggedIn && (newPage === 'dashboard' || newPage === 'profile')) {
      setIsLoggedIn(true);
    }
    setPage(newPage);
    if (tab) {
      setActiveDashboardTab(tab);
    }
    window.scrollTo(0, 0);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setPage('dashboard');
    setActiveDashboardTab('explore');
    window.scrollTo(0, 0);
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setPage('home');
    window.scrollTo(0, 0);
  };
  
  const renderPage = () => {
    if (page === 'home') {
      return <HomePage onGetStarted={handleLogin} />;
    }

    if (isLoggedIn) {
      switch (page) {
        case 'dashboard':
          return <DashboardPage searchTerm={searchTerm} setSearchTerm={setSearchTerm} activeTab={activeDashboardTab} setActiveTab={setActiveDashboardTab} />;
        case 'profile':
          return <ProfilePage />;
      }
    }
    
    // Fallback to home if trying to access a protected page while not logged in.
    return <HomePage onGetStarted={handleLogin} />;
  };

  return (
    <AuroraBackground>
        <div className="relative z-10 min-h-screen">
          <Header
            isVisible={isHeaderVisible}
            page={isLoggedIn ? page : 'home'}
            activeDashboardTab={activeDashboardTab}
            onNavigate={handleNavigate}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />
          {renderPage()}
        </div>
    </AuroraBackground>
  );
};

export default App;
