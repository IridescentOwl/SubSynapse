import React, { useState, useMemo } from 'react';
import GlassmorphicCard from './GlassmorphicCard';
import Icon from './Icon';
import type { SubscriptionGroup, MySubscription } from '../types';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: SubscriptionGroup;
  userCredits: number;
  onConfirmJoin: (subscription: MySubscription, cost: number) => Promise<void>;
  onAddCredits: () => void;
}

const CredentialRow: React.FC<{ label: string; value: string; isPassword?: boolean }> = ({ label, value, isPassword = false }) => {
  const [isVisible, setIsVisible] = useState(!isPassword);
  const [copyText, setCopyText] = useState('Copy');

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopyText('Copied!');
    setTimeout(() => setCopyText('Copy'), 1500);
  };

  return (
    <div className="flex items-center justify-between text-sm p-3 bg-black/20 rounded-lg">
      <span className="font-semibold text-slate-300">{label}:</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-white bg-black/30 px-2 py-1 rounded">
          {isVisible ? value : '••••••••••••'}
        </span>
        {isPassword && (
          <button onClick={() => setIsVisible(!isVisible)} className="text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              {isVisible ? <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /> : <path d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.367zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM10 18a8 8 0 100-16 8 8 0 000 16z" />}
            </svg>
          </button>
        )}
        <button onClick={handleCopy} className="text-slate-400 hover:text-white text-xs font-semibold">{copyText}</button>
      </div>
    </div>
  );
};


const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ isOpen, onClose, group, userCredits, onConfirmJoin, onAddCredits }) => {
  const [membershipType, setMembershipType] = useState<'monthly' | 'temporary'>('monthly');
  const [days, setDays] = useState<number>(7);
  const [joinState, setJoinState] = useState<'form' | 'joining' | 'success'>('form');

  const pricePerSlot = useMemo(() => group.totalPrice / group.slotsTotal, [group]);

  const cost = useMemo(() => {
    if (membershipType === 'temporary') {
      const dailyRate = pricePerSlot / 30; // Assume 30 days in a month for calculation
      return Math.ceil(dailyRate * days);
    }
    return Math.ceil(pricePerSlot);
  }, [membershipType, days, pricePerSlot]);
  
  const hasEnoughCredits = userCredits >= cost;

  const handleConfirm = async () => {
    if (!hasEnoughCredits || joinState !== 'form') return;

    setJoinState('joining');

    let newSubscription: MySubscription;
    if (membershipType === 'temporary') {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);
      newSubscription = {
        ...group,
        membershipType: 'temporary',
        myShare: cost,
        endDate: endDate.toISOString(),
      };
    } else {
      const nextPaymentDate = new Date();
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);
      newSubscription = {
        ...group,
        membershipType: 'monthly',
        myShare: cost,
        nextPaymentDate: nextPaymentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      };
    }

    try {
      await onConfirmJoin(newSubscription, cost);
      setJoinState('success');
    } catch (error) {
      console.error("Failed to join group:", error);
      // Optionally show an error message to the user here
      setJoinState('form');
    }
  };

  const resetAndClose = () => {
    setJoinState('form');
    setMembershipType('monthly');
    setDays(7);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={resetAndClose}>
      <GlassmorphicCard 
        className="w-full max-w-lg m-4 p-8 relative" 
        onClick={(e) => e.stopPropagation()}
        hasAnimation
        isReady={isOpen}
      >
        <button onClick={resetAndClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {joinState === 'success' ? (
          <div className="text-center animate-fade-in-down">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Successfully Joined!</h2>
            <p className="text-slate-300 mb-6">Here are your credentials for {group.name}.</p>
            <div className="space-y-3 mb-6">
              <CredentialRow label="Username" value={group.credentials?.username || 'N/A'} />
              <CredentialRow label="Password" value={group.credentials?.password || 'N/A'} isPassword />
            </div>
            <button
              onClick={resetAndClose}
              className="w-full font-bold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg text-center bg-sky-500 hover:bg-sky-400 text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-6">
              <Icon name={group.icon} className="w-12 h-12" />
              <div>
                <h2 className="text-2xl font-bold text-white">Join {group.name}</h2>
                <p className="text-slate-300">Finalize your membership details below.</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Membership Type Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-black/20 rounded-lg">
                <button 
                  onClick={() => setMembershipType('monthly')}
                  className={`py-2 px-4 rounded transition text-sm font-semibold ${membershipType === 'monthly' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:bg-white/10'}`}
                >Monthly Recurring</button>
                <button 
                  onClick={() => setMembershipType('temporary')}
                  className={`py-2 px-4 rounded transition text-sm font-semibold ${membershipType === 'temporary' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:bg-white/10'}`}
                >Temporary Access</button>
              </div>

              {/* Temporary Duration Input */}
              {membershipType === 'temporary' && (
                <div className="animate-fade-in-down">
                  <label className="block text-sm font-medium text-slate-300 mb-2">How many days do you need?</label>
                  <input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-full px-4 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder-gray-400 transition"
                  />
                </div>
              )}

              {/* Cost Summary */}
              <GlassmorphicCard className="p-4 bg-black/30">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-slate-300">Total Cost:</span>
                  <span className="font-bold text-2xl text-sky-300">{cost} Credits</span>
                </div>
                <p className="text-xs text-slate-400 text-right mt-1">
                  {membershipType === 'temporary' ? `for ${days} days of access` : 'billed monthly'}
                </p>
              </GlassmorphicCard>
              
              {/* Credit Balance and Action */}
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-2">Your current balance: <span className="font-semibold text-amber-300">{userCredits.toLocaleString()} Credits</span></p>
                {!hasEnoughCredits && (
                    <div className="text-sm text-red-400 mb-4 p-3 bg-red-500/10 rounded-lg flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                        <span>Insufficient credits.</span>
                        <button onClick={onAddCredits} className="font-semibold underline hover:text-red-300">Add more?</button>
                    </div>
                )}
                <button
                  onClick={handleConfirm}
                  disabled={!hasEnoughCredits || joinState === 'joining'}
                  className={`w-full font-bold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg text-center ${
                      !hasEnoughCredits
                      ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-400 text-white'
                  }`}
                >
                  {joinState === 'joining' ? 'Joining...' : 'Confirm & Join Group'}
                </button>
              </div>
            </div>
          </>
        )}
      </GlassmorphicCard>
    </div>
  );
};

export default JoinGroupModal;
