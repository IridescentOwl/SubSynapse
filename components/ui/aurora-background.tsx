import { cn } from '../../lib/utils';
import React from 'react';

// FIX: Switched from React.HTMLAttributes to React.HTMLProps to correctly type props.
// This resolves errors related to missing 'className' and 'children' properties by using a more inclusive type that provides them correctly.
// FIX: Changed to a type alias with an intersection to resolve TS errors with property detection.
type AuroraBackgroundProps = {
  showRadialGradient?: boolean;
} & React.HTMLProps<HTMLDivElement>;

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        // Use zinc-900 for the base as it was in the original dark mode implementation
        'relative min-h-screen bg-zinc-900 text-slate-50', 
        className
      )}
      {...props}
    >
      <div
        className={cn(
          // This is the multi-layered effect, adapted for dark-only mode.
          'pointer-events-none absolute -inset-[10px] opacity-40 blur-[10px] will-change-transform',
          '[--aurora:repeating-linear-gradient(100deg,var(--blue-900)_10%,var(--purple-700)_15%,var(--sky-800)_20%,var(--violet-700)_25%,var(--indigo-800)_30%)]',
          '[--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]',
          '[background-image:var(--dark-gradient),var(--aurora)]',
          '[background-size:300%,_200%]',
          '[background-position:50%_50%,50%_50%]',
          'after:absolute after:inset-0 after:content-[""]',
          'after:[background-image:var(--dark-gradient),var(--aurora)]',
          'after:[background-size:200%,_100%]',
          'after:[background-attachment:fixed]',
          'after:mix-blend-difference',
          // Correctly apply the animation with duration and iteration
          'after:animate-[aurora_60s_linear_infinite]',
          
          showRadialGradient &&
            '[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]'
        )}
      />
      {/* CSS properties for the new darker, cohesive colors */}
      <style>{`
        @property --blue-900 { syntax: "<color>"; initial-value: #1e3a8a; inherits: false; }
        @property --purple-700 { syntax: "<color>"; initial-value: #6b21a8; inherits: false; }
        @property --sky-800 { syntax: "<color>"; initial-value: #075985; inherits: false; }
        @property --violet-700 { syntax: "<color>"; initial-value: #5b21b6; inherits: false; }
        @property --indigo-800 { syntax: "<color>"; initial-value: #3730a3; inherits: false; }
        @property --black { syntax: "<color>"; initial-value: #000; inherits: false; }
        @property --transparent { syntax: "<color>"; initial-value: transparent; inherits: false; }
      `}</style>
      {children}
    </div>
  );
};
