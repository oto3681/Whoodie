import React from 'react';

interface LogoProps {
  variant?: 'full' | 'compact' | 'icon' | 'white';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  className = '',
  size = 'md',
}) => {
  // Sizing helpers
  const iconHeight = size === 'sm' ? 36 : size === 'md' ? 48 : size === 'lg' ? 64 : 80;

  // Exact Brand Colors from Official WoodyNat Logo
  const brandRed = '#e52b2b';
  const brandBlue = '#008ecf';
  const brandDarkText = '#1a1f2c';

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Emblem Graphic */}
      <div className="relative shrink-0 flex flex-col items-center">
        <svg
          height={iconHeight}
          viewBox="0 0 160 170"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-xs transition-transform duration-200 hover:scale-105"
        >
          {/* Red Background Box & Curved Elements */}
          <rect x="40" y="20" width="80" height="110" fill={brandRed} rx="2" />
          
          {/* White Oval Backdrop with Blue Fill */}
          <ellipse cx="80" cy="72" rx="46" ry="60" fill="#ffffff" />
          <ellipse cx="80" cy="72" rx="42" ry="56" fill={brandBlue} />

          {/* White Oval Accent Outer Ring */}
          <ellipse cx="80" cy="72" rx="46" ry="60" stroke={brandRed} strokeWidth="3" fill="none" />

          {/* Target / Crosshair Graphic on Left Wing */}
          <g transform="translate(24, 60)">
            <circle cx="12" cy="12" r="10" fill="#ffffff" />
            <circle cx="12" cy="12" r="8" fill={brandRed} />
            <circle cx="12" cy="12" r="4" fill="#ffffff" />
            <circle cx="12" cy="12" r="2" fill={brandRed} />
            {/* Crosshair Ticks */}
            <line x1="12" y1="0" x2="12" y2="24" stroke="#ffffff" strokeWidth="2" />
            <line x1="0" y1="12" x2="24" y2="12" stroke="#ffffff" strokeWidth="2" />
          </g>

          {/* Stylized White Letter 'N' inside oval */}
          <path
            d="M 52 110 L 52 38 L 74 38 L 108 102 L 108 38 L 122 38 L 122 110 L 100 110 L 66 46 L 66 110 Z"
            fill="#ffffff"
          />

          {/* Accent Oval Ring in Red */}
          <path
            d="M 40 40 C 60 10, 110 10, 130 40 C 145 65, 135 110, 110 132"
            stroke={brandRed}
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />

          {/* "Vogue en Designe" Tag Pillar Badge */}
          <g transform="translate(20, 138)">
            <rect x="0" y="0" width="120" height="24" rx="6" fill="#848a94" />
            <text
              x="60"
              y="16"
              fill="#ffffff"
              fontSize="12"
              fontWeight="800"
              fontFamily="system-ui, sans-serif"
              textAnchor="middle"
              letterSpacing="0.5"
            >
              Vogue en Designe
            </text>
          </g>
        </svg>
      </div>

      {/* Typography Section */}
      {variant !== 'icon' && (
        <div className="flex flex-col justify-center">
          {/* Main Title */}
          <div className="flex items-center tracking-tight leading-none font-black text-sm sm:text-base md:text-lg">
            <span style={{ color: brandBlue }} className="font-extrabold uppercase tracking-wide">
              WOODY
            </span>
            <span style={{ color: brandBlue }} className="font-extrabold uppercase tracking-wide ml-1">
              NAT DESIGNERS LTD
            </span>
          </div>

          {/* Tagline / Subtitle */}
          {(variant === 'full' || variant === 'white') && (
            <p
              className={`text-[10px] sm:text-[11px] font-bold mt-1 tracking-tight leading-none ${
                variant === 'white' ? 'text-slate-300' : 'text-slate-800'
              }`}
            >
              Creativity at its best with high print precision that speaks
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
