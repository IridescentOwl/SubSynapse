import React from 'react';
import GlassmorphicCard from './GlassmorphicCard.tsx';
import Icon from './Icon.tsx';
import type { SubscriptionGroup } from '../types.ts';

interface SubscriptionCardProps {
  group: SubscriptionGroup;
  animationDelay: number;
  onJoinGroup: (group: SubscriptionGroup) => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ group, animationDelay, onJoinGroup }) => {
  const { name, icon, totalPrice, slotsTotal, slotsFilled, tags, postedBy } = group;
  const [isProgressBarLoaded, setIsProgressBarLoaded] = React.useState(false);

  React.useEffect(() => {
    // Animate progress bar slightly after the card has animated in
    const timer = setTimeout(() => setIsProgressBarLoaded(true), animationDelay + 200);
    return () => clearTimeout(timer);
  }, [animationDelay]);

  const pricePerPerson = (totalPrice / slotsTotal).toFixed(0);
  const slotsAvailable = slotsTotal - slotsFilled;
  const progressPercentage = (slotsFilled / slotsTotal) * 100;
  const isFull = slotsAvailable <= 0;

  return (
    <GlassmorphicCard 
        className="flex flex-col p-6 group-hover:opacity-60 group-hover:scale-95 hover:!opacity-100 hover:!scale-100 hover:!-translate-y-2"
        hasAnimation={true}
        animationDelay={animationDelay}
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 flex items-center justify-center rounded-lg mr-4">
          <Icon name={icon} className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-white flex-1 truncate text-shadow">{name}</h3>
      </div>
      
      <div className="flex items-center justify-between text-xs text-slate-300 mb-4 border-t border-white/10 pt-3 mt-1">
        <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">{postedBy.name}</span>
        </div>
        <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-bold text-amber-400">{postedBy.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="flex items-baseline mb-4">
        <span className="text-3xl font-bold text-sky-300">{pricePerPerson}</span>
        <span className="text-slate-300 ml-1.5">Credits/month</span>
      </div>
      <p className="text-sm text-slate-400 mb-4">
        Total: {totalPrice.toFixed(0)} Credits/month for {slotsTotal} members
      </p>

      <div className="space-y-2 mb-5 flex-grow">
          <div className="flex justify-between items-center text-sm text-slate-300">
            <span>Slots Filled</span>
            <span>{slotsFilled} / {slotsTotal}</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-sky-500 to-indigo-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: isProgressBarLoaded ? `${progressPercentage}%` : '0%' }}>
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
        onClick={() => onJoinGroup(group)}
        disabled={isFull}
        className={`w-full font-bold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg text-center ${
          isFull 
            ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed' 
            : 'bg-sky-500 hover:bg-sky-400 text-white'
        }`}
      >
        {isFull ? 'Group Full' : 'Join Group'}
      </button>
    </GlassmorphicCard>
  );
};

export default SubscriptionCard;