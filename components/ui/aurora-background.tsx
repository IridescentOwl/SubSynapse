import { cn } from '../../lib/utils.ts';
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
  className?: string;
}

export const AuroraBackground = ({
  children,
  className,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      {...props}
      className={cn(
        "relative min-h-screen text-slate-50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800",
        className
      )}
    >
      {/* Aurora animation layer */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            `
            [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
            [--aurora:repeating-linear-gradient(100deg,var(--purple)_10%,var(--violet)_15%,var(--blue)_20%,var(--cyan)_25%,var(--pink)_30%)]
            [background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[10px] invert-0
            after:content-[""] after:absolute after:inset-0 after:[background-image:var(--dark-gradient),var(--aurora)]
            after:[background-size:200%,_100%] 
            motion-safe:after:animate-[aurora_120s_linear_infinite] motion-reduce:after:animate-none after:[background-attachment:fixed] after:mix-blend-difference
            pointer-events-none
            absolute -inset-[10px] opacity-25 will-change-transform`,

            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
          )}
        ></div>
      </div>
      
      {/* Subtle overlay for better content readability */}
      <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[0.5px] z-20" />
      
      {/* Content layer */}
      <div className="relative z-30 pattern-dots">
        {children}
      </div>
      
      {/* This style block is necessary to define the CSS variables for the gradient colors. */}
      <style>{`
        @property --purple { syntax: "<color>"; initial-value: #9333ea; inherits: false; }
        @property --violet { syntax: "<color>"; initial-value: #7c3aed; inherits: false; }
        @property --blue { syntax: "<color>"; initial-value: #2563eb; inherits: false; }
        @property --cyan { syntax: "<color>"; initial-value: #0891b2; inherits: false; }
        @property --pink { syntax: "<color>"; initial-value: #db2777; inherits: false; }
        @property --black { syntax: "<color>"; initial-value: #000; inherits: false; }
        @property --transparent { syntax: "<color>"; initial-value: transparent; inherits: false; }
      `}</style>
    </div>
  );
};