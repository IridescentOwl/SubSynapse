import React, { useState, useEffect, useRef } from 'react';
import { AuroraBackground } from './components/ui/aurora-background.tsx';
import Header from './components/Header.tsx';
import HomePage from './HomePage.tsx';
import DashboardPage from './DashboardPage.tsx';
import ProfilePage from './ProfilePage.tsx';
import ContactUsPage from './ContactUsPage.tsx';
import TermsAndConditionsPage from './TermsAndConditionsPage.tsx';
import PrivacyPolicyPage from './PrivacyPolicyPage.tsx';
import CancellationAndRefundsPage from './CancellationAndRefundsPage.tsx';
import Footer from './components/Footer.tsx';
import ManageSubscriptionModal from './components/ManageSubscriptionModal.tsx';
import CreateGroupModal from './components/CreateGroupModal.tsx';
import JoinGroupModal from './components/JoinGroupModal.tsx';
import AddCreditsModal from './components/AddCreditsModal.tsx';
import AuthModal from './components/AuthModal.tsx';
import WithdrawCreditsModal from './components/WithdrawCreditsModal.tsx';
import type { MySubscription, SubscriptionGroup } from './types.ts';
import { useAuth } from './AuthContext.tsx';
import * as api from './services/api.ts';


export type Page = 'home' | 'dashboard' | 'profile' | 'contact' | 'terms' | 'privacy' | 'cancellation-refunds';
export type DashboardTab = 'explore' | 'dashboard';
export type AppState = 'loading' | 'panning' | 'finished';

function App() {
  const [page, setPage] = useState<Page>('home');
  const [activeDashboardTab, setActiveDashboardTab] = useState<DashboardTab>('explore');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isReady, setIsReady] = useState(false);
  
  const { user, mySubscriptions, isAuthenticated, addCredits, joinGroup, leaveGroup, createGroup, requestWithdrawal, syncUserData, changePassword, updateProfilePicture, logout } = useAuth();

  // Modal States
  const [isManageModalOpen, setManageModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [isJoinGroupModalOpen, setJoinGroupModalOpen] = useState(false);
  const [isAddCreditsModalOpen, setAddCreditsModalOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [groupToJoin, setGroupToJoin] = useState<SubscriptionGroup | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<MySubscription | null>(null);

  const lastScrollY = useRef(0);

  useEffect(() => {
    // Start content animations immediately after mount
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (isReady) {
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
  }, [isReady]);

  useEffect(() => {
    if (isAuthenticated) {
      setAuthModalOpen(false);
      if (page === 'home') {
        setPage('dashboard');
      }
    } else {
      setPage('home');
    }
  }, [isAuthenticated, page]);

  const handleLogout = () => {
    logout();
    setPage('home');
    window.scrollTo(0, 0);
  };
  
  const handleNavigate = (newPage: Page, tab: DashboardTab = 'explore') => {
    if ((newPage === 'dashboard' || newPage === 'profile') && !isAuthenticated) {
      setAuthModalOpen(true);
      return;
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
  
  const handleOpenJoinModal = (group: SubscriptionGroup) => {
    if (!isAuthenticated) {
        setAuthModalOpen(true);
        return;
    }
    setGroupToJoin(group);
    setJoinGroupModalOpen(true);
  };
  
  const handleJoinGroup = async (subscription: MySubscription, cost: number) => {
    await joinGroup(subscription, cost);
  };

  const handleCloseJoinModalAndSync = () => {
    setJoinGroupModalOpen(false);
    syncUserData();
  }

  const handleLeaveGroup = async (subscriptionId: string, refund: number = 0) => {
    await leaveGroup(subscriptionId, refund);
    setManageModalOpen(false);
  };

  const handleAddCredits = async (amount: number) => {
    await addCredits(amount);
    setAddCreditsModalOpen(false);
  };

  const handleRequestWithdrawal = async (amount: number, upiId: string) => {
    await requestWithdrawal(amount, upiId);
    setWithdrawModalOpen(false);
  };
  
  const handleCreateGroup = async (groupData: Omit<SubscriptionGroup, 'id' | 'postedBy' | 'slotsFilled'>) => {
      try {
          await createGroup(groupData);
          setCreateGroupModalOpen(false);
          // Refresh user data and navigate to explore tab to see the new group
          await syncUserData();
          handleNavigate('dashboard', 'explore');
      } catch (error) {
          // Error is handled in CreateGroupModal
          throw error;
      }
  };

  const handleOpenCreateGroupModal = () => {
    if (!isAuthenticated) {
        setAuthModalOpen(true);
        return;
    }
    setCreateGroupModalOpen(true);
  };
  
  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <DashboardPage 
            activeTab={activeDashboardTab}
            setActiveTab={setActiveDashboardTab}
            mySubscriptions={mySubscriptions || []}
            onManageSubscription={handleOpenManageModal}
            onJoinGroup={handleOpenJoinModal}
            />;
      case 'profile':
        return user ? <ProfilePage 
                        user={user} 
                        onAddCredits={() => setAddCreditsModalOpen(true)} 
                        onWithdrawCredits={() => setWithdrawModalOpen(true)}
                        onChangePassword={changePassword}
                        onUpdateProfilePicture={updateProfilePicture}
                      /> : null;
      case 'contact':
        return <ContactUsPage />;
      case 'terms':
        return <TermsAndConditionsPage />;
      case 'privacy':
        return <PrivacyPolicyPage />;
      case 'cancellation-refunds':
        return <CancellationAndRefundsPage />;
      case 'home':
      default:
        return <HomePage onLogin={() => setAuthModalOpen(true)} isReady={isReady} />;
    }
  };

  return (
    <AuroraBackground>
        <Header 
          isVisible={isHeaderVisible}
          page={isAuthenticated ? page : 'home'}
          user={user}
          activeDashboardTab={activeDashboardTab}
          onNavigate={handleNavigate}
          onLogin={() => setAuthModalOpen(true)}
          onLogout={handleLogout}
          onCreateGroup={handleOpenCreateGroupModal}
          onAddCredits={() => setAddCreditsModalOpen(true)}
        />
        <main className="flex-grow">
          {renderPage()}
        </main>
        <Footer onNavigate={handleNavigate} />
      {selectedSubscription && (
        <ManageSubscriptionModal 
          isOpen={isManageModalOpen}
          onClose={() => setManageModalOpen(false)}
          subscription={selectedSubscription}
          onLeaveGroup={handleLeaveGroup}
        />
      )}
      {groupToJoin && user && (
        <JoinGroupModal
          isOpen={isJoinGroupModalOpen}
          onClose={handleCloseJoinModalAndSync}
          group={groupToJoin}
          userCredits={user.creditBalance}
          onConfirmJoin={handleJoinGroup}
          onAddCredits={() => setAddCreditsModalOpen(true)}
        />
      )}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setCreateGroupModalOpen(false)}
        onCreateGroup={handleCreateGroup}
      />
      <AddCreditsModal
        isOpen={isAddCreditsModalOpen}
        onClose={() => setAddCreditsModalOpen(false)}
        onAddCredits={handleAddCredits}
      />
      {user && (
        <WithdrawCreditsModal
          isOpen={isWithdrawModalOpen}
          onClose={() => setWithdrawModalOpen(false)}
          userBalance={user.creditBalance}
          onConfirmWithdrawal={handleRequestWithdrawal}
        />
      )}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </AuroraBackground>
  );
}

export default App;