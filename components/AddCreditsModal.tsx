import React, { useState, useEffect, useRef } from 'react';
import GlassmorphicCard from './GlassmorphicCard';

declare var QRCode: any;

interface AddCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCredits: (amount: number) => Promise<void>;
}

const creditOptions = [500, 1000, 2500, 5000];
const UPI_ID = 'ndhairyaparikh@oksbi';
const UPI_NAME = 'Ndhairya Parikh';

const AddCreditsModal: React.FC<AddCreditsModalProps> = ({ isOpen, onClose, onAddCredits }) => {
  const [step, setStep] = useState<'select' | 'pay'>('select');
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  // FIX: Use `number` for browser environment's `setInterval` return type and initialize useRef with null.
  const timerRef = useRef<number | null>(null);

  const finalAmount = customAmount ? parseInt(customAmount) : amount;
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${finalAmount.toFixed(2)}&cu=INR`;
  
  useEffect(() => {
    if (step === 'pay' && qrCodeRef.current) {
        // Clear previous QR code
        qrCodeRef.current.innerHTML = '';
        // Generate new QR code
        new QRCode(qrCodeRef.current, {
            text: upiLink,
            width: 200,
            height: 200,
            colorDark: "#0f172a", // Dark color for QR code
            colorLight: "transparent",
        });

        // Start countdown
        setCountdown(120);
        timerRef.current = window.setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }
    return () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };
  }, [step, upiLink]);

  const handleProceedToPay = () => {
    if (finalAmount > 0) {
      setStep('pay');
    }
  };
  
  const handleConfirmPayment = async () => {
    setIsSubmitting(true);
    await onAddCredits(finalAmount);
    setIsSubmitting(false);
    resetAndClose();
  };
  
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setAmount(0);
  };
  
  const resetAndClose = () => {
    setStep('select');
    setAmount(1000);
    setCustomAmount('');
    onClose();
  };

  if (!isOpen) return null;
  
  const isExpired = countdown <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={resetAndClose}>
      <GlassmorphicCard 
        className="w-full max-w-md m-4 p-8 relative" 
        onClick={(e) => e.stopPropagation()}
        hasAnimation
        isReady={isOpen}
      >
        <button onClick={resetAndClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        {step === 'select' ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Add Credits to Your Wallet</h2>
              <div className="space-y-4">
                  <p className="text-slate-300 text-center">Select an amount or enter a custom value.</p>
                  <div className="grid grid-cols-4 gap-4">
                      {creditOptions.map(opt => (
                          <button key={opt} onClick={() => { setAmount(opt); setCustomAmount(''); }} className={`py-3 rounded-lg font-semibold transition ${amount === opt && !customAmount ? 'bg-sky-500 text-white' : 'bg-white/10 hover:bg-white/20'}`}>
                              {opt.toLocaleString()}
                          </button>
                      ))}
                  </div>
                  <input type="number" placeholder="Or enter a custom amount" value={customAmount} onChange={handleCustomChange} className="w-full px-4 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder-gray-400 transition" />
                  <div className="pt-4">
                      <button onClick={handleProceedToPay} disabled={finalAmount <= 0} className="w-full font-bold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg text-center bg-sky-500 hover:bg-sky-400 text-white disabled:bg-sky-500/50 disabled:cursor-not-allowed">
                          Proceed to Pay {finalAmount > 0 ? `(${finalAmount.toLocaleString()} Credits)` : ''}
                      </button>
                  </div>
              </div>
            </>
        ) : (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Scan to Pay</h2>
                <p className="text-slate-300 mb-4">Use any UPI app to pay <span className="font-semibold text-amber-300">{finalAmount} Credits</span>.</p>
                {isExpired ? (
                    <div className="h-[216px] flex flex-col items-center justify-center bg-black/20 rounded-lg text-red-400">
                        <p className="font-semibold">QR Code Expired</p>
                        <button onClick={() => setStep('pay')} className="mt-2 text-sm underline">Generate a new one</button>
                    </div>
                ) : (
                    <div ref={qrCodeRef} className="flex justify-center p-2 bg-white/90 rounded-lg w-[216px] h-[216px] mx-auto"></div>
                )}
                
                {!isExpired && (
                    <p className="text-sm text-slate-400 mt-2">
                        QR code expires in: <span className="font-mono text-amber-300">{Math.floor(countdown / 60)}:{('0' + (countdown % 60)).slice(-2)}</span>
                    </p>
                )}
                
                <a href={upiLink} className="mt-4 inline-block md:hidden w-full font-semibold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg text-center bg-white/10 hover:bg-white/20 text-white">
                    Pay with UPI App
                </a>
                
                <div className="pt-6">
                    <button onClick={handleConfirmPayment} disabled={isSubmitting || isExpired} className="w-full font-bold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg text-center bg-green-500 hover:bg-green-400 text-white disabled:bg-green-500/50 disabled:cursor-not-allowed">
                        {isSubmitting ? 'Confirming...' : 'I Have Paid'}
                    </button>
                    <button onClick={() => setStep('select')} className="text-sm text-slate-400 mt-3 hover:underline">
                        Change Amount
                    </button>
                </div>
            </div>
        )}
      </GlassmorphicCard>
    </div>
  );
};

export default AddCreditsModal;
