import React from 'react';
import { IconName } from '../types';

interface NeonIconProps {
  name: IconName;
  className?: string;
}

// Neon color mapping for each service following brand colors
const NEON_COLORS: Record<IconName, { primary: string; secondary: string }> = {
  netflix: { primary: '#E50914', secondary: '#ff1f2c' },
  spotify: { primary: '#1DB954', secondary: '#1ed760' },
  youtube: { primary: '#FF0000', secondary: '#ff3333' },
  hbo: { primary: '#8B5CF6', secondary: '#a78bfa' },
  chatgpt: { primary: '#00A67E', secondary: '#20c997' },
  google: { primary: '#4285F4', secondary: '#669df6' },
  swiggy: { primary: '#FC8019', secondary: '#fd9644' },
  zomato: { primary: '#E23744', secondary: '#ff4757' },
  applemusic: { primary: '#FA2D48', secondary: '#ff4757' },
  claude: { primary: '#D97706', secondary: '#f59e0b' },
  figma: { primary: '#F24E1E', secondary: '#ff6b35' },
  adonisjs: { primary: '#5A45FF', secondary: '#7c3aed' },
  perplexity: { primary: '#1FB6FF', secondary: '#3b82f6' },
  protonvpn: { primary: '#6d28d9', secondary: '#8b5cf6' },
  steam: { primary: '#000000', secondary: '#4a5568' },
  warp: { primary: '#FFA500', secondary: '#fbbf24' }
};

const NeonIcon: React.FC<NeonIconProps> = ({ name, className = 'w-6 h-6' }) => {
  const colors = NEON_COLORS[name];
  
  if (!colors) {
    return <div className={`bg-slate-700 rounded ${className}`}></div>;
  }

  const neonStyle = {
    '--color-primary': colors.primary,
    '--color-secondary': colors.secondary,
  } as React.CSSProperties;

  // Special case for perplexity - use direct SVG file without effects
  if (name === 'perplexity') {
    return (
      <div className={className}>
        <img 
          src="/assets/svg icons/perplexity_neon.svg" 
          alt="Perplexity logo" 
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // Define the SVG components inline for better control
  const renderSVG = () => {
    switch (name) {
      case 'netflix':
        return (
          <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <title>Netflix</title>
            <path d="m5.398 0 8.348 23.602c2.346.059 4.856.398 4.856.398L10.113 0H5.398zm8.489 0v9.172l4.715 13.33V0h-4.715zM5.398 1.5V24c1.873-.225 2.81-.312 4.715-.398V14.83L5.398 1.5z"/>
          </svg>
        );
      
      case 'spotify':
        return (
          <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{transform: 'translateX(0)'}}>
            <title>Spotify</title>
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.721.241 1.2zm1.261-3.42c-3.239-1.68-8.521-1.84-11.64-1.02-.539.12-1.08-.18-1.2-.72s.18-1.081.72-1.2c3.841-.84 9.479-.66 13.021 1.14.42.24.6.78.359 1.2-.24.42-.78.6-1.26.36z"/>
          </svg>
        );

      case 'youtube':
        return (
          <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <title>YouTube</title>
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );

      case 'hbo':
        return (
          <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <title>HBO</title>
            <path d="M7.042 16.896H4.414v-3.754H2.708v3.754H.01L0 7.22h2.708v3.6h1.706v-3.6h2.628zm12.043.046C21.795 16.94 24 14.689 24 11.978a4.89 4.89 0 0 0-4.915-4.92c-2.707-.002-4.09 1.991-4.432 2.795.003-1.207-1.187-2.632-2.58-2.634H7.59v9.674l4.181.001c1.686 0 2.886-1.46 2.888-2.713.385.788 1.72 2.762 4.427 2.76zm-7.665-3.936c.387 0 .692.382.692.817 0 .435-.305.817-.692.817h-1.33v-1.634zm.005-3.633c.387 0 .692.382.692.817 0 .435-.305.817-.692.817h-1.33v-1.634z"/>
          </svg>
        );

      case 'chatgpt':
        return (
          <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <title>OpenAI</title>
            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
          </svg>
        );

      case 'google':
        return (
          <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <title>Google</title>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        );

      case 'figma':
        return (
          <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <title>Figma</title>
            <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.354-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.015-4.49-4.491S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 10.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117v-6.038H8.148zm7.704 0c-2.476 0-4.49 2.015-4.49 4.49s2.014 4.491 4.49 4.491 4.49-2.015 4.49-4.491-2.014-4.49-4.49-4.49zm0 7.509c-1.665 0-3.019-1.355-3.019-3.019s1.355-3.019 3.019-3.019 3.019 1.355 3.019 3.019-1.354 3.019-3.019 3.019z"/>
          </svg>
        );

      case 'steam':
        return (
          <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <title>Steam</title>
            <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.624 0 11.99-5.377 11.99-12C23.97 5.377 18.603.001 11.979.001zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.453-.397.951-1.5 1.409-2.454 1.014zm9.55-11.041c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.524 0c0-1.387 1.125-2.512 2.512-2.512s2.512 1.125 2.512 2.512c0 1.387-1.125 2.512-2.512 2.512s-2.512-1.125-2.512-2.512z"/>
          </svg>
        );

      default:
        return (
          <div className="w-full h-full bg-slate-600 rounded flex items-center justify-center text-xs text-white">
            {name}
          </div>
        );
    }
  };

  return (
    <div 
      className={`neon-icon group cursor-pointer transition-all duration-300 overflow-visible`}
      style={{
        ...neonStyle,
        width: 'fit-content',
        height: 'fit-content',
        padding: '4px', // Small padding to prevent glow cutoff
      }}
    >
      <div className={`${className} neon-icon-container flex items-center justify-center`}>
        {/* Glow layer - blurred copy for glow effect */}
        <div className="neon-icon-glow flex items-center justify-center">
          {renderSVG()}
        </div>
        
        {/* Main layer - crisp SVG on top */}
        <div className="neon-icon-main flex items-center justify-center">
          {renderSVG()}
        </div>
      </div>
    </div>
  );
};

export default NeonIcon;