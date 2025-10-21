import { cn } from '../../lib/utils';
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

// FIX: Refactored props handling to resolve TypeScript error with `className`.
// `className` is now safely accessed from `props` and correctly merged.
export const AuroraBackground = ({
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      {...props}
      className={cn(
        "relative min-h-screen bg-zinc-900 text-slate-50 transition-bg",
        props.className
      )}
    >
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
            after:animate-[aurora_60s_linear_infinite] after:[background-attachment:fixed] after:mix-blend-difference
            pointer-events-none
            absolute -inset-[10px] opacity-40 will-change-transform`,

            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
          )}
        ></div>
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
      {children}
    </div>
  );
};
