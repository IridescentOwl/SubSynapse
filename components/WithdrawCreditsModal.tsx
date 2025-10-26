import React, { useState, useEffect } from 'react';
import GlassmorphicCard from './GlassmorphicCard.tsx';

interface WithdrawCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBalance: number;
  onConfirmWithdrawal: (amount: number, upiId: string) => Promise<void>;
}

const MIN_WITHDRAWAL = 500;

const WithdrawCreditsModal: React.FC<WithdrawCreditsModalProps> = ({ isOpen, onClose, userBalance, onConfirmWithdrawal }) => {
  const [amount, setAmount] = useState<string>('');
  const [upiId, setUpiId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const numericAmount = parseInt(amount);
    if (numericAmount < MIN_WITHDRAWAL) {
      setError(`Minimum withdrawal is ${MIN_WITHDRAWAL} credits.`);
    } else if (numericAmount > userBalance) {
      setError('Withdrawal amount cannot exceed your balance.');
    } else {
      setError('');
    }
  }, [amount, userBalance]);
  
  const handleSubmit = async () => {
    if (error || !amount || !upiId || isSubmitting) return;

    setIsSubmitting(true);
    await onConfirmWithdrawal(parseInt(amount), upiId);
    setIsSubmitting(false);
  };
  
  const handleClose = () => {
      setAmount('');
      setUpiId('');
      setError('');
      onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={handleClose}>
      <GlassmorphicCard 
        className="w-full max-w-md m-4 p-8 relative" 
        onClick={(e) => e.stopPropagation()}
        hasAnimation
        isReady={isOpen}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Withdraw Credits</h2>
        
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Amount to Withdraw</label>
                <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`e.g., ${MIN_WITHDRAWAL}`}
                    min={MIN_WITHDRAWAL}
                    max={userBalance}
                    className="w-full px-4 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder-gray-400 transition"
                />
                <p className="text-xs text-slate-400 mt-1">Your balance: {userBalance.toLocaleString()} Credits</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Your UPI ID</label>
                <input 
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@bank"
                    className="w-full px-4 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder-gray-400 transition"
                />
            </div>
            
            {error && amount && <p className="text-sm text-red-400 text-center">{error}</p>}

            <p className="text-xs text-slate-400 text-center pt-2">
                Withdrawal requests are processed by an admin and may take up to 24-48 hours. The credits will be deducted from your account immediately.
            </p>

            <div className="pt-4">
                <button
                    onClick={handleSubmit}
                    disabled={!!error || !amount || !upiId || isSubmitting}
                    className="w-full font-bold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg text-center bg-sky-500 hover:bg-sky-400 text-white disabled:bg-sky-500/50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Submitting Request...' : `Request Withdrawal`}
                </button>
            </div>
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default WithdrawCreditsModal;