import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { User, MySubscription, SubscriptionGroup } from './types';
import * as api from './services/api';

interface AuthContextType {
  user: User | null;
  mySubscriptions: MySubscription[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  addCredits: (amount: number) => Promise<void>;
  joinGroup: (subscription: MySubscription, cost: number) => Promise<void>;
  leaveGroup: (subscriptionId: string, refund: number) => Promise<void>;
  createGroup: (groupData: Omit<SubscriptionGroup, 'id' | 'postedBy' | 'slotsFilled'>) => Promise<void>;
  requestWithdrawal: (amount: number, upiId: string) => Promise<void>;
  syncUserData: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
  updateProfilePicture: (imageDataUrl: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mySubscriptions, setMySubscriptions] = useState<MySubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const syncUserData = async () => {
    try {
      setIsLoading(true);
      const fetchedUser = await api.fetchAuthenticatedUser();
      if (fetchedUser) {
        setUser(fetchedUser);
        const fetchedSubscriptions = await api.fetchMySubscriptions();
        setMySubscriptions(fetchedSubscriptions);
      } else {
        setUser(null);
        setMySubscriptions([]);
      }
    } catch (error) {
      console.error("Failed to sync user data", error);
      setUser(null);
      setMySubscriptions([]);
      api.logout();
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    syncUserData();
  }, []);
  
  const login = async (email: string, password: string) => {
    const { user } = await api.login(email, password);
    setUser(user);
    await syncUserData(); // fetch subscriptions after login
  };

  const register = async (name: string, email: string, password: string) => {
    const { user } = await api.register(name, email, password);
    setUser(user);
    await syncUserData();
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setMySubscriptions([]);
  };

  const addCredits = async (amount: number) => {
      await api.addCredits(amount);
      await syncUserData();
  };
  
  const requestWithdrawal = async (amount: number, upiId: string) => {
    await api.requestWithdrawal(amount, upiId);
    await syncUserData();
  }

  const joinGroup = async (subscription: MySubscription, cost: number) => {
      // We don't sync here to allow the modal to show its success state.
      // Syncing will be triggered manually when the modal closes.
      await api.joinGroup(subscription, cost);
  };
  
  const leaveGroup = async (subscriptionId: string, refund: number) => {
      await api.leaveGroup(subscriptionId, refund);
      await syncUserData();
  };
  
  const createGroup = async (groupData: Omit<SubscriptionGroup, 'id' | 'postedBy' | 'slotsFilled'>) => {
      await api.createGroup(groupData);
      // No need to sync here, as it doesn't immediately affect the user's subscriptions
  };
  
  const forgotPassword = async (email: string) => {
    await api.forgotPassword(email);
  };
  
  const changePassword = async (oldPass: string, newPass: string) => {
    await api.changePassword(oldPass, newPass);
  };

  const updateProfilePicture = async (imageDataUrl: string) => {
    await api.updateProfilePicture(imageDataUrl);
    await syncUserData();
  };


  return (
    <AuthContext.Provider value={{
      user,
      mySubscriptions,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      addCredits,
      joinGroup,
      leaveGroup,
      createGroup,
      requestWithdrawal,
      syncUserData,
      forgotPassword,
      changePassword,
      updateProfilePicture
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};