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

  const logoHeights = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-12 sm:h-14',
  };

  return (
    <Link to="/" className={`inline-flex items-center group shrink-0 select-none ${className}`}>
      <div className={`transition-transform duration-200 group-hover:scale-105 flex items-center ${isLight ? 'bg-white p-1.5 px-3 rounded-xl shadow-sm' : ''
        }`}>
        <img
          src="/taaskmate-logo.jpg"
          alt="Taaskmate"
          className={`${logoHeights[size]} w-auto object-contain ${!isLight ? 'mix-blend-multiply' : ''}`}
        />
      </div>
      {showTagline && (
        <span className={`text-[10px] uppercase font-semibold tracking-wider ml-2.5 ${isLight ? 'text-gray-400' : 'text-gray-500'} hidden sm:inline-block`}>
          Your Task. Our Expertise.
        </span>
      )}
    </Link>
  );
};
