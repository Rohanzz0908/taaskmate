import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'dark' | 'light';
  showTagline?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ 
  variant = 'dark', 
  showTagline = false,
  className = '',
  size = 'md'
}) => {
  const isLight = variant === 'light';
  
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl xl:text-2xl',
    lg: 'text-2xl xl:text-3xl',
  };

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 group shrink-0 select-none ${className}`}>
      {/* Original Geometric Taaskmate Icon */}
      <div className={`relative flex items-center justify-center ${iconSizes[size]} rounded-xl ${isLight ? 'bg-white/10 ring-1 ring-white/20' : 'bg-brand-navy shadow-sm'} transition-transform group-hover:scale-105 shrink-0`}>
        <svg viewBox="0 0 36 36" fill="none" className="w-3/4 h-3/4">
          {/* Hexagonal Shield Outline */}
          <path 
            d="M18 3L31 10.5V25.5L18 33L5 25.5V10.5L18 3Z" 
            stroke={isLight ? "#FFFFFF" : "#00C878"} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="opacity-35"
          />
          {/* Dynamic Task Checkmark */}
          <path 
            d="M11 18.5L16 23.5L25 13.5" 
            stroke="#00C878" 
            strokeWidth="3.2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col justify-center leading-none">
        <div className={`font-extrabold tracking-tight ${textSizes[size]} whitespace-nowrap`}>
          <span className={isLight ? 'text-white' : 'text-brand-navy'}>Taask</span>
          <span className="text-brand-green">mate</span>
        </div>
        {showTagline && (
          <span className={`text-[10px] uppercase font-semibold tracking-wider mt-1 ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
            Your Task. Our Expertise.
          </span>
        )}
      </div>
    </Link>
  );
};
