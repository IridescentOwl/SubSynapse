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
    ? `transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}` 
    : '';

  return (
    <div 
      {...props}
      className={`bg-black/20 backdrop-blur-lg rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:ring-1 hover:ring-white/20 pointer-events-auto ${animationClasses} ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassmorphicCard;