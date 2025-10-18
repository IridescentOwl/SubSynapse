import React from 'react';
import type { IconName } from '../types';

interface IconProps {
  name: IconName;
  className?: string;
}

const GlassmorphicIconWrapper: React.FC<{ outlineColor: string; children: React.ReactNode; className?: string }> = ({ outlineColor, children, className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="glass-blur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
            </filter>
        </defs>
        <g stroke="white" strokeWidth="1.5" filter="url(#glass-blur)" strokeOpacity="0.3">{children}</g>
        <g stroke={outlineColor} strokeWidth="1">{children}</g>
    </svg>
);

const NetflixIcon: React.FC<{className?: string}> = ({className}) => (
    <GlassmorphicIconWrapper outlineColor="#E50914" className={className}>
      <path d="M8.5 18L5.5 6H7.5L10.5 18H8.5Z" strokeLinejoin="round"/>
      <path d="M15.5 18L18.5 6H16.5L13.5 18H15.5Z" strokeLinejoin="round"/>
      <path d="M12 18V6" />
    </GlassmorphicIconWrapper>
);
const SpotifyIcon: React.FC<{className?: string}> = ({className}) => (
    <GlassmorphicIconWrapper outlineColor="#1DB954" className={className}>
      <path d="M6 15C9.86599 13.8266 14.134 13.8266 18 15" strokeLinecap="round"/>
      <path d="M6.5 12C9.96587 11.0503 13.5341 11.0503 17 12" strokeLinecap="round"/>
      <path d="M7 9C10.0965 8.28312 12.9035 8.28312 16 9" strokeLinecap="round"/>
    </GlassmorphicIconWrapper>
);
const YoutubeIcon: React.FC<{className?: string}> = ({className}) => (
    <GlassmorphicIconWrapper outlineColor="#FF0000" className={className}>
        <rect x="3" y="6" width="18" height="12" rx="3" />
        <path d="M10 10L14 12L10 14V10Z" strokeLinejoin="round" />
    </GlassmorphicIconWrapper>
);
const DisneyIcon: React.FC<{className?: string}> = ({className}) => (
    <GlassmorphicIconWrapper outlineColor="#A6DFF1" className={className}>
        <path d="M4 8.25C12 4 20 4 20 8.25" strokeLinecap="round"/>
        <path d="M11 10C9.5 8.5 7 8.5 5.5 10" strokeLinecap="round"/>
    </GlassmorphicIconWrapper>
);
const HboIcon: React.FC<{className?: string}> = ({className}) => (
    <GlassmorphicIconWrapper outlineColor="#9333EA" className={className}>
        <path d="M5 18V6H8V18H5Z"/>
        <path d="M16 18V6H19V18H16Z"/>
        <circle cx="12" cy="12" r="2.5"/>
    </GlassmorphicIconWrapper>
);
const OfficeIcon: React.FC<{className?: string}> = ({className}) => (
    <GlassmorphicIconWrapper outlineColor="#D83B01" className={className}>
        <path d="M6 8V20H18V13L13 8H6Z" strokeLinejoin="round"/>
        <path d="M13 8V13H18" strokeLinejoin="round"/>
    </GlassmorphicIconWrapper>
);
const AdobeIcon: React.FC<{className?: string}> = ({className}) => (
    <GlassmorphicIconWrapper outlineColor="#FF0000" className={className}>
        <path d="M9 21L2 3H5L12 17L19 3H22L15 21H9Z" strokeLinejoin="round" />
    </GlassmorphicIconWrapper>
);
const CanvaIcon: React.FC<{className?: string}> = ({className}) => (
    <GlassmorphicIconWrapper outlineColor="#00C4CC" className={className}>
      <circle cx="12" cy="12" r="8"/>
      <circle cx="12" cy="12" r="4"/>
    </GlassmorphicIconWrapper>
);

const ICONS: Record<IconName, React.FC<{className?: string}>> = {
  netflix: NetflixIcon,
  spotify: SpotifyIcon,
  youtube: YoutubeIcon,
  disney: DisneyIcon,
  hbo: HboIcon,
  office: OfficeIcon,
  adobe: AdobeIcon,
  canva: CanvaIcon
};

const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6' }) => {
  const IconComponent = ICONS[name];
  if (!IconComponent) {
    return null; // or a default icon
  }
  return <IconComponent className={className} />;
};

export default Icon;