import React from 'react';
import type { Page, DashboardTab, AppState } from '../App.tsx';
import type { User } from '../types.ts';

interface HeaderProps {
  isVisible: boolean;
  page: Page;
  user: User | null;
  activeDashboardTab: DashboardTab;
  onNavigate: (page: Page, tab?: DashboardTab) => void;
  onLogin: () => void;
  onLogout: () => void;
  onCreateGroup: () => void;
  onAddCredits: () => void;
}

const NavLink: React.FC<{onClick: () => void, children: React.ReactNode, isActive?: boolean}> = ({ onClick, children, isActive = false }) => (
    <button onClick={onClick} className={`relative font-semibold transition group ${isActive ? 'text-white' : 'text-slate-300 hover:text-white'}`}>
        {children}
        <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-sky-400 transform transition-transform duration-300 ease-out ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
    </button>
);


const Header: React.FC<HeaderProps> = ({ isVisible, page, user, activeDashboardTab, onNavigate, onLogin, onLogout, onCreateGroup, onAddCredits }) => {
  const isLoggedIn = !!user;

  const isMarketplaceActive = page === 'dashboard' && activeDashboardTab === 'explore';
  const isDashboardActive = page === 'dashboard' && activeDashboardTab === 'dashboard';
  const isProfileActive = page === 'profile';
  const isContactUsActive = page === 'contact';
  
  return (
    <header className={`sticky top-6 z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-20">
            
            <div className="absolute inset-0 bg-black/20 backdrop-blur-lg rounded-full shadow-lg border border-white/10 transition-all duration-300 group-hover:border-sky-400/30 group-hover:shadow-sky-500/20" />

            <button 
              onClick={() => onNavigate('home')} 
              className="absolute top-1/2 left-8 -translate-y-1/2 scale-100 z-10 flex items-center space-x-2 transition-all duration-300 ease-in-out transform-gpu hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
              <span className="text-2xl font-bold text-white">SubSynapse</span>
            </button>
          
          <div className="w-[190px] flex-shrink-0" />

          <div className="hidden md:flex flex-1 items-center justify-center space-x-8">
            <NavLink onClick={() => onNavigate('dashboard', 'explore')} isActive={isMarketplaceActive}>Marketplace</NavLink>
            <NavLink onClick={() => onNavigate('dashboard', 'dashboard')} isActive={isDashboardActive}>Dashboard</NavLink>
            <NavLink onClick={() => onNavigate('profile')} isActive={isProfileActive}>Profile</NavLink>
            <NavLink onClick={() => onNavigate('contact')} isActive={isContactUsActive}>Contact Us</NavLink>
          </div>

          <div className="hidden md:flex items-center space-x-4 pr-8">
            {isLoggedIn && user ? (
                <>
                    <button onClick={onAddCredits} className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-full transition duration-300 transform hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                      <span>{user.creditBalance.toLocaleString()} Credits</span>
                    </button>
                    <button onClick={onCreateGroup} className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 px-4 rounded-full transition duration-300 transform hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button onClick={onLogout} className="font-semibold text-slate-300 hover:text-white transition">
                        Logout
                    </button>
                </>
            ) : (
                <>
                    <button onClick={onLogin} className="font-semibold text-slate-300 hover:text-white transition px-4 py-2 active:scale-95">
                        Login
                    </button>
                    <button onClick={onLogin} className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 px-6 rounded-full transition duration-300 transform hover:scale-105 active:scale-95 shadow-lg">
                        Sign Up
                    </button>
                </>
            )}
          </div>
          </div>
        </nav>
      </header>
  );
};

export default Header;