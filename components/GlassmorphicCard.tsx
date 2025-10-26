import React, { useState, useEffect } from 'react';

interface GlassmorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  animationDelay?: number;
  hasAnimation?: boolean;
  isReady?: boolean;
}

const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({ 
  children, 
  className = '', 
  animationDelay = 0, 
  hasAnimation = false,
  isReady = true,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(!hasAnimation);

  useEffect(() => {
    // Only trigger the animation if the component is flagged as ready.
    if (hasAnimation && isReady) {
      const timer = setTimeout(() => setIsLoaded(true), animationDelay);
      return () => clearTimeout(timer);
    }
  }, [hasAnimation, isReady, animationDelay]);
  
  const animationClasses = hasAnimation 
    ? `transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${isLoaded ? 'opacity-100 translate-y-0 scale-100 rotate-0' : 'opacity-0 translate-y-8 scale-95 -rotate-1'}` 
    : '';

  return (
    <div 
      {...props}
      className={`bg-black/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/10 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-sky-500/10 hover:ring-1 hover:ring-sky-400/30 hover:scale-[1.02] hover:bg-black/30 hover:border-sky-400/20 pointer-events-auto ${animationClasses} ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassmorphicCard;