import React, { useState } from 'react';

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
  const [imgError, setImgError] = useState(false);

  // Height mappings based on size prop
  const logoHeightClass =
    size === 'sm' ? 'h-9 sm:h-10' :
    size === 'md' ? 'h-12 sm:h-14' :
    size === 'lg' ? 'h-16 sm:h-20' : 'h-20 sm:h-24';

  const iconHeight = size === 'sm' ? 38 : size === 'md' ? 52 : size === 'lg' ? 68 : 84;

  const brandRed = '#E30613';
  const brandBlue = '#0071CE';

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {!imgError ? (
        <img
          src="/assets/images/woodynat_official_logo.jpg"
          alt="WOODYNAT DESIGNERS LTD - Your Reliable Partner in Design and Branding"
          className={`${logoHeightClass} w-auto object-contain rounded-lg transition-transform duration-200 hover:scale-105`}
          onError={() => setImgError(true)}
        />
      ) : (
        <>
          {/* Official Emblem Mark Graphic Fallback */}
          <div className="relative shrink-0 flex flex-col items-center">
            <svg
              height={iconHeight}
              viewBox="0 0 160 170"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-xs transition-transform duration-200 hover:scale-105"
            >
              {/* Red Background Box */}
              <rect x="40" y="20" width="80" height="110" fill={brandRed} rx="3" />
              
              {/* White Oval Backdrop with Blue Fill */}
              <ellipse cx="80" cy="72" rx="46" ry="60" fill="#ffffff" />
              <ellipse cx="80" cy="72" rx="42" ry="56" fill={brandBlue} />

              {/* Oval Outer Accent Ring */}
              <ellipse cx="80" cy="72" rx="46" ry="60" stroke={brandRed} strokeWidth="3" fill="none" />

              {/* Target / Crosshair Symbol on Left Wing */}
              <g transform="translate(24, 60)">
                <circle cx="12" cy="12" r="10" fill="#ffffff" />
                <circle cx="12" cy="12" r="8" fill={brandRed} />
                <circle cx="12" cy="12" r="4" fill="#ffffff" />
                <circle cx="12" cy="12" r="2" fill={brandRed} />
                <line x1="12" y1="0" x2="12" y2="24" stroke="#ffffff" strokeWidth="2" />
                <line x1="0" y1="12" x2="24" y2="12" stroke="#ffffff" strokeWidth="2" />
              </g>

              {/* Stylized White Letter 'N' inside oval */}
              <path
                d="M 52 110 L 52 38 L 74 38 L 108 102 L 108 38 L 122 38 L 122 110 L 100 110 L 66 46 L 66 110 Z"
                fill="#ffffff"
              />

              {/* Accent Arc Ring in Red */}
              <path
                d="M 40 40 C 60 10, 110 10, 130 40 C 145 65, 135 110, 110 132"
                stroke={brandRed}
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />

              {/* "Vogue en Designe" Pillar Badge */}
              <g transform="translate(18, 138)">
                <rect x="0" y="0" width="124" height="24" rx="6" fill="#4B5563" />
                <text
                  x="62"
                  y="16"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="800"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  textAnchor="middle"
                  letterSpacing="0.3"
                >
                  Vogue en Designe
                </text>
              </g>
            </svg>
          </div>

          {/* Official Typography Section */}
          {variant !== 'icon' && (
            <div className="flex flex-col justify-center">
              <div className="flex items-center tracking-tight leading-none font-black text-base sm:text-lg md:text-xl">
                <span style={{ color: brandBlue }} className="font-extrabold uppercase tracking-wide">
                  WOODYNAT
                </span>
                <span style={{ color: brandBlue }} className="font-extrabold uppercase tracking-wide ml-1.5">
                  DESIGNERS LTD
                </span>
              </div>

              {(variant === 'full' || variant === 'compact' || variant === 'white') && (
                <p
                  className={`text-[11px] sm:text-[12px] font-bold mt-1 tracking-tight leading-none ${
                    variant === 'white' ? 'text-slate-300' : 'text-slate-900'
                  }`}
                >
                  Your Reliable Partner in Design and Branding
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Logo;
