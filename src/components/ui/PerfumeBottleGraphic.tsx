import React from 'react';

interface PerfumeBottleGraphicProps {
  name: string;
  category?: string;
  volume?: string;
  accentColor?: string;
  gradientStyle?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

export const PerfumeBottleGraphic: React.FC<PerfumeBottleGraphicProps> = ({
  name,
  category = 'HOMME',
  volume = '100 ml',
  accentColor = '#D8B08C',
  gradientStyle = 'from-[#1E1610] via-[#0E0C0A] to-[#080809]',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-16 h-20',
    md: 'w-48 h-64',
    lg: 'w-72 h-96',
    hero: 'w-80 h-[420px] md:w-96 md:h-[480px]',
  }[size];

  // Derive subtle secondary tones from accentColor
  const isRose = accentColor === '#C98F78';
  const isGold = accentColor === '#C9A46C';
  const capGradient = isRose
    ? 'url(#roseGoldCap)'
    : isGold
    ? 'url(#pureGoldCap)'
    : 'url(#champagneCap)';

  const liquidFill = isRose
    ? 'rgba(201, 143, 120, 0.28)'
    : isGold
    ? 'rgba(201, 164, 108, 0.25)'
    : 'rgba(216, 176, 140, 0.22)';

  return (
    <div
      className={`relative flex items-center justify-center select-none overflow-hidden ${sizeClasses} ${className}`}
    >
      {/* Background atmospheric ambient aura */}
      <div
        className="absolute inset-0 opacity-40 blur-2xl pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 60%, ${accentColor} 0%, transparent 70%)`,
        }}
      />

      <svg
        viewBox="0 0 300 400"
        className="w-full h-full drop-shadow-2xl relative z-10 transition-transform duration-500 hover:scale-[1.02]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Metallic gradients */}
          <linearGradient id="champagneCap" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FAF5EE" />
            <stop offset="35%" stopColor="#D8B08C" />
            <stop offset="70%" stopColor="#9C7756" />
            <stop offset="100%" stopColor="#E2C1A2" />
          </linearGradient>

          <linearGradient id="roseGoldCap" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDEEE9" />
            <stop offset="35%" stopColor="#C98F78" />
            <stop offset="70%" stopColor="#8A5847" />
            <stop offset="100%" stopColor="#D9A894" />
          </linearGradient>

          <linearGradient id="pureGoldCap" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF9E6" />
            <stop offset="35%" stopColor="#C9A46C" />
            <stop offset="70%" stopColor="#886835" />
            <stop offset="100%" stopColor="#DEC291" />
          </linearGradient>

          {/* Smoked glass body gradient */}
          <linearGradient id="smokedGlass" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#151518" stopOpacity="0.95" />
            <stop offset="15%" stopColor="#25252D" stopOpacity="0.65" />
            <stop offset="50%" stopColor="#0B0B0D" stopOpacity="0.8" />
            <stop offset="85%" stopColor="#25252D" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#151518" stopOpacity="0.95" />
          </linearGradient>

          {/* Fluted reflection highlight */}
          <linearGradient id="verticalReflection" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.25" />
          </linearGradient>

          {/* Base bottom drop shadow filter */}
          <radialGradient id="bottleShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient bottom shadow reflection */}
        <ellipse cx="150" cy="380" rx="85" ry="12" fill="url(#bottleShadow)" />

        {/* CAP TOP JEWEL */}
        <rect
          x="115"
          y="35"
          width="70"
          height="14"
          rx="2"
          fill={capGradient}
          stroke="#443224"
          strokeWidth="0.75"
        />

        {/* CAP MAIN CYLINDER */}
        <rect
          x="122"
          y="48"
          width="56"
          height="55"
          rx="3"
          fill={capGradient}
          stroke="#3A2A1E"
          strokeWidth="0.8"
        />
        {/* Cap fine knurling grooves */}
        <line x1="126" y1="58" x2="174" y2="58" stroke="#3A2A1E" strokeWidth="0.75" strokeOpacity="0.6" />
        <line x1="126" y1="62" x2="174" y2="62" stroke="#FFF" strokeWidth="0.5" strokeOpacity="0.4" />
        <line x1="126" y1="88" x2="174" y2="88" stroke="#3A2A1E" strokeWidth="0.75" strokeOpacity="0.6" />

        {/* SPRAYER COLLAR & NECK */}
        <rect
          x="132"
          y="102"
          width="36"
          height="16"
          rx="1"
          fill={capGradient}
          stroke="#403020"
          strokeWidth="0.5"
        />
        <circle cx="150" cy="110" r="1.5" fill="#1A1A1A" />

        {/* BOTTLE SHOULDERS & MAIN CRYSTAL BODY */}
        {/* Outer thick crystal glass silhouette */}
        <path
          d="M 125 118 
             L 175 118 
             Q 215 125 220 155 
             L 220 355 
             Q 220 368 205 368 
             L 95 368 
             Q 80 368 80 355 
             L 80 155 
             Q 85 125 125 118 Z"
          fill="url(#smokedGlass)"
          stroke={accentColor}
          strokeWidth="1.2"
          strokeOpacity="0.4"
        />

        {/* Liquid core chamber */}
        <path
          d="M 128 135 
             L 172 135 
             Q 202 142 205 165 
             L 205 348 
             Q 205 356 195 356 
             L 105 356 
             Q 95 356 95 348 
             L 95 165 
             Q 98 142 128 135 Z"
          fill={liquidFill}
        />

        {/* Internal dip tube */}
        <line x1="150" y1="118" x2="149" y2="352" stroke={accentColor} strokeWidth="1" strokeOpacity="0.35" />

        {/* Left specular vertical rim light */}
        <path
          d="M 86 160 L 86 350"
          stroke="url(#verticalReflection)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Right subtle rim reflection */}
        <path
          d="M 214 160 L 214 350"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeOpacity="0.2"
          strokeLinecap="round"
        />

        {/* HEAVY LUXURY LABEL */}
        <g transform="translate(100, 185)">
          {/* Label backing with hairline metallic border */}
          <rect
            x="0"
            y="0"
            width="100"
            height="120"
            rx="2"
            fill="#0F0F12"
            stroke={accentColor}
            strokeWidth="0.8"
            strokeOpacity="0.75"
          />

          {/* Inner hairline border */}
          <rect
            x="3"
            y="3"
            width="94"
            height="114"
            rx="1"
            fill="none"
            stroke={accentColor}
            strokeWidth="0.35"
            strokeOpacity="0.4"
          />

          {/* Brand Mark: METANOÏA */}
          <text
            x="50"
            y="26"
            textAnchor="middle"
            fill={accentColor}
            fontFamily="'Cinzel', Georgia, serif"
            fontSize="8.5"
            fontWeight="600"
            letterSpacing="2.5"
          >
            METANOÏA
          </text>

          {/* Fine divider */}
          <line x1="32" y1="33" x2="68" y2="33" stroke={accentColor} strokeWidth="0.5" strokeOpacity="0.5" />

          {/* Perfume Name */}
          <text
            x="50"
            y="52"
            textAnchor="middle"
            fill="#F5F1EB"
            fontFamily="'Cormorant Garamond', Georgia, serif"
            fontSize="10"
            fontWeight="600"
            fontStyle="italic"
            letterSpacing="0.8"
          >
            {name.length > 15 ? name.substring(0, 15) : name}
          </text>

          {/* Subtitle / Concentration */}
          <text
            x="50"
            y="66"
            textAnchor="middle"
            fill="#A7A3A0"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize="5"
            fontWeight="500"
            letterSpacing="1.2"
          >
            EXTRAIT DE PARFUM
          </text>

          {/* Category / Gender note */}
          <text
            x="50"
            y="80"
            textAnchor="middle"
            fill={accentColor}
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize="4.5"
            fontWeight="600"
            letterSpacing="1.5"
          >
            {category}
          </text>

          {/* Origin & Volume */}
          <text
            x="50"
            y="104"
            textAnchor="middle"
            fill="#807D7A"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize="4.2"
            letterSpacing="1"
          >
            {volume} · 3.4 FL. OZ.
          </text>
        </g>

        {/* Bottom thick glass base */}
        <path
          d="M 84 355 L 216 355 L 210 365 L 90 365 Z"
          fill="#1F1F24"
          fillOpacity="0.8"
        />
      </svg>
    </div>
  );
};
