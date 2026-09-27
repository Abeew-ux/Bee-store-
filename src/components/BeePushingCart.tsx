import React, { useState } from 'react';
import goldenBeeLogo from '../assets/golden_bee_logo.jpg';

interface BeePushingCartProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  animated?: boolean;
  showText?: boolean;
  variant?: 'badge' | 'avatar' | 'full';
}

export const BeePushingCart: React.FC<BeePushingCartProps> = ({
  className = '',
  size = 'md',
  animated = true,
  showText = false,
  variant = 'badge',
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: 'w-7 h-7',
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
    '2xl': 'w-48 h-48',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div
        className={`relative ${sizeClasses[size]} shrink-0 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 shadow-md shadow-amber-950/20 ${
          animated ? 'hover:scale-105 active:scale-95 transition-all duration-300' : ''
        }`}
      >
        <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center border border-amber-500/40">
          {!imgError ? (
            <img
              src={goldenBeeLogo}
              alt="Golden Bee Store Logo"
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-1">
              <span className="text-xl">🐝</span>
              <span className="text-[8px] font-black text-amber-400 leading-tight">GOLDEN BEE</span>
            </div>
          )}
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="text-base sm:text-lg font-black tracking-tight leading-none text-slate-900 dark:text-white flex items-center gap-1 font-serif">
            GOLDEN <span className="text-amber-500 font-sans">BEE</span>
          </span>
          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-amber-500/90">
            Boutique en Ligne
          </span>
        </div>
      )}
    </div>
  );
};
