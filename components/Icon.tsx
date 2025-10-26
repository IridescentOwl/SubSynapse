import React from 'react';
import type { IconName } from '../types.ts';

interface IconProps {
  name: IconName;
  className?: string;
}

const ICON_MAP: Record<IconName, string> = {
  netflix: '/assets/svg icons/netflix.svg',
  spotify: '/assets/svg icons/spotify.svg',
  youtube: '/assets/svg icons/youtube.svg',
  hbo: '/assets/svg icons/hbo.svg',
  chatgpt: '/assets/svg icons/chatgpt.svg',
  google: '/assets/svg icons/google.svg',
  swiggy: '/assets/svg icons/swiggy.svg',
  zomato: '/assets/svg icons/zomato.svg',
  applemusic: '/assets/svg icons/applemusic.svg',
  claude: '/assets/svg icons/claude.svg',
  figma: '/assets/svg icons/figma.svg',
  adonisjs: '/assets/svg icons/adonisjs.svg',
  perplexity: '/assets/svg icons/perplexity.svg',
  protonvpn: '/assets/svg icons/protonvpn.svg',
  steam: '/assets/svg icons/steam.svg',
  warp: '/assets/svg icons/warp.svg'
};

// Neon color mapping for each service
const NEON_COLORS: Record<IconName, { glow: string; shadow: string }> = {
  netflix: { glow: '#E50914', shadow: 'rgba(229, 9, 20, 0.6)' },
  spotify: { glow: '#1DB954', shadow: 'rgba(29, 185, 84, 0.6)' },
  youtube: { glow: '#FF0000', shadow: 'rgba(255, 0, 0, 0.6)' },
  hbo: { glow: '#8B5CF6', shadow: 'rgba(139, 92, 246, 0.6)' },
  adobe: { glow: '#FF0000', shadow: 'rgba(255, 0, 0, 0.6)' },
  amazon: { glow: '#FF9900', shadow: 'rgba(255, 153, 0, 0.6)' },
  'apple-music': { glow: '#FA2D48', shadow: 'rgba(250, 45, 72, 0.6)' },
  chatgpt: { glow: '#00A67E', shadow: 'rgba(0, 166, 126, 0.6)' },
  google: { glow: '#4285F4', shadow: 'rgba(66, 133, 244, 0.6)' },
  swiggy: { glow: '#FC8019', shadow: 'rgba(252, 128, 25, 0.6)' },
  zomato: { glow: '#E23744', shadow: 'rgba(226, 55, 68, 0.6)' }
};

const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6' }) => {
  const iconSrc = ICON_MAP[name];
  const colors = NEON_COLORS[name];
  
  if (!iconSrc || !colors) {
    return <div className={`bg-slate-700 rounded ${className}`}></div>;
  }

  return (
    <div className={`${className} relative group cursor-pointer transition-all duration-300 hover:scale-110`}>
      {/* Neon glow effect */}
      <div 
        className="absolute inset-0 blur-md opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:blur-lg"
        style={{
          background: `radial-gradient(circle, ${colors.shadow} 0%, transparent 70%)`,
          filter: `drop-shadow(0 0 10px ${colors.glow}) drop-shadow(0 0 20px ${colors.glow}) drop-shadow(0 0 30px ${colors.glow})`
        }}
      />
      
      {/* Main icon */}
      <img 
        src={iconSrc} 
        alt={`${name} logo`} 
        className="relative z-10 w-full h-full object-contain filter brightness-110 contrast-110 group-hover:brightness-125 transition-all duration-300"
        style={{
          filter: `brightness(1.1) contrast(1.1) drop-shadow(0 0 5px ${colors.glow}) drop-shadow(0 0 10px ${colors.shadow})`
        }}
      />
      
      {/* Additional outer glow on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-all duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle, transparent 30%, ${colors.shadow} 60%, transparent 90%)`,
          filter: `blur(20px)`
        }}
      />
    </div>
  );
};

export default Icon;