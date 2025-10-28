import React from 'react';
import type { IconName } from '../types.ts';

interface IconProps {
  name: IconName;
  className?: string;
}

const ICON_MAP: Record<IconName, string> = {
  netflix: '/assets/icons/Netflix.svg',
  spotify: '/assets/icons/Spotify.svg',
  youtube: '/assets/icons/Youtube.svg',
  hbo: '/assets/icons/HBO Max.svg',
  chatgpt: '/assets/icons/Chatgpt.svg',
  swiggy: '/assets/icons/Swiggy.svg',
  zomato: '/assets/icons/Zomato.svg',
  applemusic: '/assets/icons/applemusic.svg',
  claude: '/assets/icons/Claude.svg',
  adobe: '/assets/icons/adobe.svg',
  canva: '/assets/icons/canva.svg',
  disney: '/assets/icons/disney.svg',
  office: '/assets/icons/office.svg',
};

const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6' }) => {
  const iconSrc = ICON_MAP[name];
  
  // Use placeholder if icon is not available
  const finalIconSrc = iconSrc || '/assets/icons/placeholder.svg';
  const isPlaceholder = !iconSrc;

  return (
    <div className={`${className} relative cursor-pointer transition-all duration-300 hover:scale-105`}>
      <img 
        src={finalIconSrc} 
        alt={iconSrc ? `${name} logo` : 'placeholder logo'} 
        className={`w-full h-full object-contain transition-all duration-300 ${
          isPlaceholder 
            ? 'opacity-60 hover:opacity-80' 
            : 'hover:brightness-110'
        }`}
        onError={(e) => {
          // Fallback to placeholder if image fails to load
          if (e.currentTarget.src !== '/assets/icons/placeholder.svg') {
            e.currentTarget.src = '/assets/icons/placeholder.svg';
          }
        }}
      />
    </div>
  );
};

export default Icon;