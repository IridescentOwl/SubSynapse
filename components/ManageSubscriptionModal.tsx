import React, { useState } from 'react';
import GlassmorphicCard from './GlassmorphicCard.tsx';
import Icon from './Icon.tsx';
import type { MySubscription } from '../types.ts';
import { daysBetween } from '../lib/utils.ts';
import CredentialRow from './CredentialRow.tsx';

interface ManageSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: MySubscription;
  onLeaveGroup: (subscriptionId: string, refund: number) => Promise<void>;
}

const Star: React.FC<{ filled: boolean; onClick: () => void; onMouseEnter: () => void; }> = ({ filled, onClick, onMouseEnter }) => (
  <svg 
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    className={`w-8 h-8 cursor-pointer transition-colors duration-200 ${filled ? 'text-amber-400' : 'text-slate-600 hover:text-slate-500'}`} 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

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
