import React from 'react';

interface GlassmorphicCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={`bg-black/20 backdrop-blur-lg rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl pointer-events-auto ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassmorphicCard;