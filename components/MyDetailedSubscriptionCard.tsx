import React, { useState, useEffect } from 'react';
import GlassmorphicCard from './GlassmorphicCard';
import Icon from './Icon';
import type { MySubscription } from '../types';

type ButtonState = 'idle' | 'loading' | 'success';

const daysUntil = (dateStr: string): number => {
    const futureDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    futureDate.setHours(0, 0, 0, 0);
    const diffTime = futureDate.getTime() - today.getTime();
    if (diffTime < 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const MyDetailedSubscriptionCard: React.FC<{ sub: MySubscription }> = ({ sub }) => {
    const { name, icon, myShare, nextPaymentDate, slotsTotal, slotsFilled } = sub;
    const [buttonState, setButtonState] = useState<ButtonState>('idle');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const daysRemaining = daysUntil(nextPaymentDate);
    const cycleLength = 30;
    const daysPassed = cycleLength - daysRemaining;
    const progressPercentage = Math.max(0, Math.min(100, (daysPassed / cycleLength) * 100));
    
    const handleManageClick = () => {
        setButtonState('loading');
        setTimeout(() => {
          setButtonState('success');
          setTimeout(() => setButtonState('idle'), 1500);
        }, 1500);
    };

    const getButtonContent = () => {
        switch (buttonState) {
          case 'loading':
            return <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>;
          case 'success':
            return 'Saved!';
          default:
            return 'Manage Subscription';
        }
    };

    return (
        <GlassmorphicCard className="flex flex-col p-6 group-hover:opacity-60 group-hover:scale-95 hover:!opacity-100 hover:!scale-100 hover:!-translate-y-1">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white/20">
                        <Icon name={icon} className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">{name}</h3>
                        <p className="text-sm text-slate-400">Group Subscription</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-sky-300">₹{myShare.toFixed(0)}</p>
                    <p className="text-slate-300 text-sm">/ month</p>
                </div>
            </div>

            <div className="space-y-3 mb-6 flex-grow">
                <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-300">Next Payment:</span>
                    <span className="font-bold text-white">{nextPaymentDate}</span>
                </div>
                <div>
                    <div className="flex justify-between items-center text-sm text-slate-300 mb-1">
                        <span>Billing Cycle</span>
                        <span>{daysRemaining} days left</span>
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-2.5">
                        <div
                            className="bg-gradient-to-r from-sky-500 to-indigo-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: isLoaded ? `${progressPercentage}%` : '0%' }}
                        ></div>
                    </div>
                </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-300">Group Members:</span>
                    <span className="font-bold text-white">{slotsFilled} / {slotsTotal}</span>
                </div>
            </div>
            
            <button
                onClick={handleManageClick}
                disabled={buttonState !== 'idle'}
                className={`w-full font-semibold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg text-center ${
                    buttonState === 'success'
                        ? 'bg-green-500/80 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
            >
                {getButtonContent()}
            </button>
        </GlassmorphicCard>
    );
};

export default MyDetailedSubscriptionCard;