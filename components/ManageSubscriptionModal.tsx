import React, { useState } from 'react';
import GlassmorphicCard from './GlassmorphicCard';
import Icon from './Icon';
import type { MySubscription } from '../types';

interface ManageSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: MySubscription;
  onLeaveGroup: (subscriptionId: string, refund: number) => Promise<void>;
}

const daysBetween = (dateStr1: string, dateStr2: string): number => {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    d1.setHours(0,0,0,0);
    d2.setHours(0,0,0,0);
    return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};

const Star: React.FC<{ filled: boolean; onClick: () => void; onMouseEnter: () => void; onMouseLeave: () => void }> = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
  <svg 
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={`w-8 h-8 cursor-pointer transition-colors duration-200 ${filled ? 'text-amber-400' : 'text-slate-600 hover:text-slate-500'}`} 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const CredentialRow: React.FC<{ label: string; value: string; isPassword?: boolean }> = ({ label, value, isPassword = false }) => {
  const [isVisible, setIsVisible] = useState(!isPassword);
  const [copyText, setCopyText] = useState('Copy');

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopyText('Copied!');
    setTimeout(() => setCopyText('Copy'), 1500);
  };

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-semibold text-slate-300">{label}:</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-white bg-black/20 px-2 py-1 rounded">
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


const ManageSubscriptionModal: React.FC<ManageSubscriptionModalProps> = ({ isOpen, onClose, subscription, onLeaveGroup }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isConfirmingLeave, setConfirmingLeave] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  if (!isOpen) return null;

  const calculateRefund = (): number => {
    if (subscription.membershipType === 'temporary' && subscription.endDate) {
      const daysRemaining = daysBetween(new Date().toISOString(), subscription.endDate);
      if (daysRemaining <= 0) return 0;
      
      const pricePerSlot = subscription.totalPrice / subscription.slotsTotal;
      const dailyRate = pricePerSlot / 30; // Assume 30 day cycle for calculation
      return Math.floor(dailyRate * daysRemaining);
    }
    return 0; // No refund for monthly subscriptions in this model
  };

  const refundAmount = calculateRefund();

  const handleConfirmLeave = async () => {
    setIsLeaving(true);
    await onLeaveGroup(subscription.id, refundAmount);
    setIsLeaving(false);
  };
  
  const leaveMessage = () => {
    if (refundAmount > 0) {
      return `You will be refunded ${refundAmount} credits for the remaining time. This action cannot be undone.`;
    }
    return `If you leave, you will lose access at the end of the current billing period. This action cannot be undone.`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <GlassmorphicCard 
        className="w-full max-w-md m-4 p-8 relative" 
        onClick={(e) => e.stopPropagation()}
        hasAnimation
        isReady={isOpen}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-4 mb-6">
          <Icon name={subscription.icon} className="w-12 h-12" />
          <div>
            <h2 className="text-2xl font-bold text-white">{subscription.name}</h2>
            <p className="text-slate-300">Group managed by <span className="font-semibold text-sky-300">{subscription.postedBy.name}</span></p>
          </div>
        </div>

        {isConfirmingLeave ? (
            <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Are you sure?</h3>
                <p className="text-slate-400 mb-6">
                  {leaveMessage()}
                </p>
                <div className="flex justify-center gap-4">
                    <button 
                        onClick={() => setConfirmingLeave(false)}
                        className="font-semibold py-2 px-6 rounded-xl transition duration-300 bg-white/10 hover:bg-white/20 text-white"
                        disabled={isLeaving}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirmLeave}
                        className="font-bold py-2 px-6 rounded-xl transition duration-300 bg-red-600 hover:bg-red-500 text-white flex items-center justify-center min-w-[120px]"
                        disabled={isLeaving}
                    >
                        {isLeaving ? 'Leaving...' : 'Confirm & Leave'}
                    </button>
                </div>
            </div>
        ) : (
            <div className="space-y-6">
                <div className="p-4 bg-black/20 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-3">Access Credentials</h3>
                  <div className="space-y-2">
                    {subscription.credentials?.username ? (
                      <>
                        <CredentialRow label="Username" value={subscription.credentials.username} />
                        <CredentialRow label="Password" value={subscription.credentials.password || ''} isPassword />
                      </>
                    ) : (
                      <p className="text-slate-400 text-center text-sm">Credentials are not available for this group.</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-black/20 rounded-lg">
                    <h3 className="text-lg font-semibold text-center text-white mb-3">Rate Group Manager</h3>
                    <div className="flex justify-center" onMouseLeave={() => setHoverRating(0)}>
                    {[...Array(5)].map((_, i) => (
                        <Star 
                            key={i}
                            filled={(hoverRating || rating) > i}
                            onClick={() => setRating(i + 1)}
                            onMouseEnter={() => setHoverRating(i + 1)}
                            // FIX: Add onMouseLeave to each Star to reset hover state.
                            onMouseLeave={() => setHoverRating(0)}
                        />
                    ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Danger Zone</h3>
                    <button 
                        onClick={() => setConfirmingLeave(true)}
                        className="w-full font-bold py-3 px-6 rounded-xl transition duration-300 bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/50"
                    >
                        Leave Group
                    </button>
                </div>
            </div>
        )}
      </GlassmorphicCard>
    </div>
  );
};

export default ManageSubscriptionModal;