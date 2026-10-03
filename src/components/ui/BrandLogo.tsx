import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  withTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  withTagline = false,
  className = '',
}) => {
  const fontSizes = {
    sm: 'text-base tracking-[0.25em]',
    md: 'text-xl tracking-[0.3em]',
    lg: 'text-3xl md:text-4xl tracking-[0.35em]',
  }[size];

  const subSizes = {
    sm: 'text-[9px] tracking-[0.2em]',
    md: 'text-[10px] tracking-[0.25em]',
    lg: 'text-xs tracking-[0.3em]',
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center select-none text-center ${className}`}>
      {/* Brand title */}
      <span
        className={`font-display font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#FAF5EE] via-[#D8B08C] to-[#C98F78] uppercase drop-shadow-[0_2px_8px_rgba(216,176,140,0.2)] ${fontSizes}`}
      >
        METANOÏA
      </span>

      {/* Sub-label */}
      <div className="flex items-center gap-2 mt-0.5">
        <span className="w-3 h-[1px] bg-gradient-to-r from-transparent to-[#D8B08C]/60" />
        <span className={`font-sans font-light uppercase text-[#C9A46C] ${subSizes}`}>
          PARFUMS
        </span>
        <span className="w-3 h-[1px] bg-gradient-to-l from-transparent to-[#D8B08C]/60" />
      </div>

      {withTagline && (
        <span className="mt-1 text-[9px] tracking-[0.2em] uppercase text-[#A7A3A0]/80 font-light">
          HAUTE PARFUMERIE
        </span>
      )}
    </div>
  );
};
