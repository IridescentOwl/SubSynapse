import React from 'react';
import type { Page, DashboardTab } from '../App';

interface HeaderProps {
  isVisible: boolean;
  page: Page;
  activeDashboardTab: DashboardTab;
  onNavigate: (page: Page, tab?: DashboardTab) => void;
  onLogin: () => void;
  onLogout: () => void;
}

const NavLink: React.FC<{onClick: () => void, children: React.ReactNode, isActive?: boolean}> = ({ onClick, children, isActive = false }) => (
    <button onClick={onClick} className={`relative font-semibold transition group ${isActive ? 'text-white' : 'text-slate-300 hover:text-white'}`}>
        {children}
        <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-sky-400 transform transition-transform duration-300 ease-out ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
    </button>
);


const Header: React.FC<HeaderProps> = ({ isVisible, page, activeDashboardTab, onNavigate, onLogin, onLogout }) => {
  const isLoggedIn = page === 'dashboard' || page === 'profile';

  const isMarketplaceActive = page === 'dashboard' && activeDashboardTab === 'explore';
  const isDashboardActive = page === 'dashboard' && activeDashboardTab === 'dashboard';
  const isProfileActive = page === 'profile';

  return (
    <header className={`sticky top-6 z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 bg-black/20 backdrop-blur-lg rounded-full px-8 shadow-lg border border-white/10">
          <div className="flex-shrink-0">
            <button onClick={() => onNavigate('home')} className="flex items-center space-x-2">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
               </svg>
              <span className="text-2xl font-bold text-white">SubSynapse</span>
            </button>
          </div>
          
          <div className="hidden md:flex flex-1 items-center justify-center space-x-8">
            <NavLink onClick={() => onNavigate('dashboard', 'explore')} isActive={isMarketplaceActive}>Marketplace</NavLink>
            <NavLink onClick={() => onNavigate('dashboard', 'dashboard')} isActive={isDashboardActive}>Dashboard</NavLink>
            <NavLink onClick={() => onNavigate('profile')} isActive={isProfileActive}>Profile</NavLink>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
                <>
                    <button className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 px-6 rounded-full transition duration-300 transform hover:scale-105 shadow-lg">
                        Create Group
                    </button>
                    <button onClick={onLogout} className="font-semibold text-slate-300 hover:text-white transition">
                        Logout
                    </button>
                </>
            ) : (
                <>
                    <button onClick={onLogin} className="font-semibold text-slate-300 hover:text-white transition px-4 py-2">
                        Login
                    </button>
                    <button onClick={onLogin} className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 px-6 rounded-full transition duration-300 transform hover:scale-105 shadow-lg">
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