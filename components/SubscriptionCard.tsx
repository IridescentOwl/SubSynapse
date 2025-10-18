import React, { useState, useEffect } from 'react';
import GlassmorphicCard from './GlassmorphicCard';
import Icon from './Icon';
import type { SubscriptionGroup } from '../types';

type ButtonState = 'idle' | 'loading' | 'success';

// FIX: Define SubscriptionCardProps interface
interface SubscriptionCardProps {
  group: SubscriptionGroup;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ group }) => {
  const { name, icon, totalPrice, slotsTotal, slotsFilled, tags } = group;
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const pricePerPerson = (totalPrice / slotsTotal).toFixed(0);
  const slotsAvailable = slotsTotal - slotsFilled;
  const progressPercentage = (slotsFilled / slotsTotal) * 100;
  const isFull = slotsAvailable <= 0;

  const handleJoinClick = () => {
    setButtonState('loading');
    setTimeout(() => {
      setButtonState('success');
      setTimeout(() => setButtonState('idle'), 1500);
    }, 1500);
  };
  
  const getButtonContent = () => {
    if (isFull) return 'Group Full';
    switch (buttonState) {
      case 'loading':
        return <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>;
      case 'success':
        return 'Joined!';
      default:
        return 'Join Group';
    }
  };

  return (
    <GlassmorphicCard className="flex flex-col p-6 group-hover:opacity-60 group-hover:scale-95 hover:!opacity-100 hover:!scale-100 hover:!-translate-y-2">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white/20 mr-4">
          <Icon name={icon} className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-white flex-1 truncate">{name}</h3>
      </div>
      
      <div className="flex items-baseline mb-4">
        <span className="text-3xl font-bold text-sky-300">₹{pricePerPerson}</span>
        <span className="text-slate-300 ml-1.5">/ month</span>
      </div>
      <p className="text-sm text-slate-400 mb-4">
        Total: ₹{totalPrice.toFixed(0)}/month for {slotsTotal} members
      </p>

      <div className="space-y-2 mb-5 flex-grow">
          <div className="flex justify-between items-center text-sm text-slate-300">
            <span>Slots Filled</span>
            <span>{slotsFilled} / {slotsTotal}</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-sky-500 to-indigo-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: isLoaded ? `${progressPercentage}%` : '0%' }}>
            </div>
          </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tags.map(tag => (
          <span key={tag} className="text-xs font-semibold bg-white/10 text-sky-200 px-2.5 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>
      
      <button 
        onClick={handleJoinClick}
        disabled={isFull || buttonState !== 'idle'}
        className={`w-full font-bold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg text-center ${
          isFull 
            ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed' 
            : buttonState === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-sky-500 hover:bg-sky-400 text-white'
        }`}
      >
        {getButtonContent()}
      </button>
    </GlassmorphicCard>
  );
};

export default SubscriptionCard;