import React, { useState, useEffect, useRef } from 'react';
import { AuroraBackground } from './components/ui/aurora-background';
import Header from './components/Header';
import HomePage from './HomePage';
import DashboardPage from './DashboardPage';
import ProfilePage from './ProfilePage';
import ManageSubscriptionModal from './components/ManageSubscriptionModal';
import CreateGroupModal from './components/CreateGroupModal';
import type { MySubscription } from './types';

export type Page = 'home' | 'dashboard' | 'profile';
export type DashboardTab = 'explore' | 'dashboard';
export type AppState = 'loading' | 'panning' | 'finished';

function App() {
  const [page, setPage] = useState<Page>('home');
  const [activeDashboardTab, setActiveDashboardTab] = useState<DashboardTab>('explore');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appState, setAppState] = useState<AppState>('loading');
  
  // Modal States
  const [isManageModalOpen, setManageModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<MySubscription | null>(null);

  const lastScrollY = useRef(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setAppState('panning'), 1200);
    const timer2 = setTimeout(() => setAppState('finished'), 2200);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (appState === 'finished') {
        if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
          setIsHeaderVisible(false);
        } else {
          setIsHeaderVisible(true);
        }
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [appState]);

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
  
  const handleNavigate = (newPage: Page, tab: DashboardTab = 'explore') => {
    if ((newPage === 'dashboard' || newPage === 'profile') && !isLoggedIn) {
      setIsLoggedIn(true);
    }
    
    setPage(newPage);
    if (newPage === 'dashboard') {
      setActiveDashboardTab(tab);
    }
    window.scrollTo(0, 0);
  };

  const handleOpenManageModal = (subscription: MySubscription) => {
    setSelectedSubscription(subscription);
    setManageModalOpen(true);
  };

  const handleOpenCreateGroupModal = () => {
    setCreateGroupModalOpen(true);
  };
  
  const renderPage = () => {
    const currentPage = isLoggedIn ? page : 'home';
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            activeTab={activeDashboardTab}
            setActiveTab={setActiveDashboardTab}
            onManageSubscription={handleOpenManageModal}
            />;
      case 'profile':
        return <ProfilePage />;
      case 'home':
      default:
        return <HomePage onGetStarted={handleLogin} isReady={appState === 'finished'} />;
    }
  };

  return (
    <AuroraBackground>
      <div className="relative z-10">
        <Header 
          isVisible={isHeaderVisible}
          page={isLoggedIn ? page : 'home'}
          activeDashboardTab={activeDashboardTab}
          onNavigate={handleNavigate}
          onLogin={handleLogin}
          onLogout={handleLogout}
          appState={appState}
          onCreateGroup={handleOpenCreateGroupModal}
        />
        {appState !== 'loading' && renderPage()}
      </div>
      {selectedSubscription && (
        <ManageSubscriptionModal 
          isOpen={isManageModalOpen}
          onClose={() => setManageModalOpen(false)}
          subscription={selectedSubscription}
        />
      )}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setCreateGroupModalOpen(false)}
      />
    </AuroraBackground>
  );
}

export default App;
