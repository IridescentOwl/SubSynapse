import React from 'react';
import GlassmorphicCard from './GlassmorphicCard';
import Icon from './Icon';
import type { MySubscription } from '../types';

const daysUntil = (dateStr: string): number => {
    const futureDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    futureDate.setHours(0, 0, 0, 0);
    const diffTime = futureDate.getTime() - today.getTime();
    if (diffTime < 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

interface MyDetailedSubscriptionCardProps {
    sub: MySubscription;
    animationDelay: number;
    onManageClick: () => void;
}

const MyDetailedSubscriptionCard: React.FC<MyDetailedSubscriptionCardProps> = ({ sub, animationDelay, onManageClick }) => {
    const { name, icon, myShare, nextPaymentDate, slotsTotal, slotsFilled, postedBy } = sub;
    const [isProgressBarLoaded, setIsProgressBarLoaded] = React.useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => setIsProgressBarLoaded(true), animationDelay + 200);
        return () => clearTimeout(timer);
    }, [animationDelay]);

    const daysRemaining = daysUntil(nextPaymentDate);
    const cycleLength = 30;
    const daysPassed = cycleLength - daysRemaining;
    const progressPercentage = Math.max(0, Math.min(100, (daysPassed / cycleLength) * 100));

    return (
        <GlassmorphicCard 
            className="flex flex-col p-6 group-hover:opacity-60 group-hover:scale-95 hover:!opacity-100 hover:!scale-100 hover:!-translate-y-1"
            hasAnimation={true}
            animationDelay={animationDelay}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center rounded-lg">
                        <Icon name={icon} className="w-10 h-10" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white text-shadow">{name}</h3>
                        <p className="text-sm text-slate-400">Group Subscription</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-sky-300">₹{myShare.toFixed(0)}</p>
                    <p className="text-slate-300 text-sm">/ month</p>
                </div>
            </div>

            <div className="space-y-3 mb-6 flex-grow">
                 <div className="flex justify-between items-center text-sm border-t border-b border-white/10 py-2">
                    <span className="font-semibold text-slate-300 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Group Owner:
                    </span>
                    <span className="font-bold text-white">{postedBy.name}</span>
                </div>
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
                            style={{ width: isProgressBarLoaded ? `${progressPercentage}%` : '0%' }}
                        ></div>
                    </div>
                </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-300">Group Members:</span>
                    <span className="font-bold text-white">{slotsFilled} / {slotsTotal}</span>
                </div>
            </div>
            
            <button
                onClick={onManageClick}
                className="w-full font-semibold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-center bg-white/10 hover:bg-white/20 text-white"
            >
                Manage Subscription
            </button>
        </GlassmorphicCard>
    );
};

export default MyDetailedSubscriptionCard;
