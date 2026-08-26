import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface LogoProps {
  variant?: 'full' | 'compact' | 'icon' | 'white';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const DEFAULT_IMAGE_SOURCES = [
  '/assets/images/woodynat_official_logo.jpg',
  '/logo.jpg',
  '/logo.png',
  '/assets/images/official_woodynat_logo.jpg',
];

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  className = '',
  size = 'md',
}) => {
  let customLogo = '';
  try {
    const app = useApp();
    customLogo = app?.wpSettings?.siteLogo || '';
  } catch (err) {
    // Fallback if rendered outside provider
  }

  const [imgLoadFailed, setImgLoadFailed] = useState(false);
  const [defaultIdx, setDefaultIdx] = useState(0);
  const [allDefaultsFailed, setAllDefaultsFailed] = useState(false);

  React.useEffect(() => {
    setImgLoadFailed(false);
    setDefaultIdx(0);
    setAllDefaultsFailed(false);
  }, [customLogo]);

  // Size height mappings
  const logoHeightClass =
    size === 'sm' ? 'h-9 sm:h-10 max-h-10' :
    size === 'md' ? 'h-12 sm:h-14 lg:h-16 max-h-16' :
    size === 'lg' ? 'h-18 sm:h-20 lg:h-24 max-h-24' : 
    'h-20 sm:h-24 md:h-28 lg:h-32 max-h-32';

  // For footer / dark backgrounds (variant === 'white')
  const darkBgWrapper = variant === 'white' ? 'bg-white p-2 rounded-xl shadow-md border border-slate-100' : '';

  // 1. If admin uploaded a custom logo and it hasn't failed to load, display the exact uploaded logo
  if (customLogo && !imgLoadFailed) {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 select-none ${darkBgWrapper} ${className}`}>
        <img
          src={customLogo}
          alt="WOODYNAT DESIGNERS LTD - Official Logo"
          className={`${logoHeightClass} w-auto max-w-full object-contain rounded-md transition-transform duration-200 hover:scale-[1.02] shadow-2xs`}
          onError={() => setImgLoadFailed(true)}
        />
      </div>
    );
  }

  // 2. If no custom logo or if custom logo failed to load, use official default logo images
  if (!allDefaultsFailed) {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 select-none ${darkBgWrapper} ${className}`}>
        <img
          key={DEFAULT_IMAGE_SOURCES[defaultIdx] || 'default-logo'}
          src={DEFAULT_IMAGE_SOURCES[defaultIdx]}
          alt="WOODYNAT DESIGNERS LTD - Your Reliable Partner in Design and Branding"
          className={`${logoHeightClass} w-auto max-w-full object-contain rounded-md transition-transform duration-200 hover:scale-[1.02] shadow-2xs`}
          onError={() => {
            if (defaultIdx < DEFAULT_IMAGE_SOURCES.length - 1) {
              setDefaultIdx(prev => prev + 1);
            } else {
              setAllDefaultsFailed(true);
            }
          }}
        />
      </div>
    );
  }

  // 3. High-Definition Vector SVG Fallback
  return (
    <div className={`inline-flex items-center justify-center shrink-0 select-none ${darkBgWrapper} ${className}`}>
      <svg
        viewBox="0 0 560 380"
        className={`${logoHeightClass} w-auto max-w-full object-contain transition-transform duration-200 hover:scale-[1.02]`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="WOODYNAT DESIGNERS LTD - Your Reliable Partner in Design and Branding"
      >
        {/* White Background Box */}
        <rect width="560" height="380" fill="#ffffff" rx="16"/>

        {/* EMBLEM GROUP */}
        <g transform="translate(280, 135)">
          {/* 1. Red Background Box */}
          <rect x="-55" y="-60" width="110" height="142" fill="#ED1C24" rx="4" />

          {/* 2. Tilted Blue Oval with Letter N (Rotated -20 deg) */}
          <g transform="rotate(-20)">
            <ellipse cx="0" cy="0" rx="64" ry="86" fill="none" stroke="#ED1C24" strokeWidth="7" />
            <ellipse cx="0" cy="0" rx="58" ry="80" fill="#ffffff" />
            <ellipse cx="0" cy="0" rx="52" ry="74" fill="#0084D1" />
            <path d="M -32,54 L -32,-48 L -14,-48 L 16,36 L 16,-48 L 32,-48 L 32,54 L 14,54 L -14,-28 L -14,54 Z" fill="#ffffff" />
          </g>

          {/* 3. Target / Crosshair Icon on Left Overlap */}
          <g transform="translate(-76, 18)">
            <circle cx="0" cy="0" r="18" fill="#ffffff" />
            <circle cx="0" cy="0" r="14" fill="#ED1C24" />
            <circle cx="0" cy="0" r="7" fill="#ffffff" />
            <circle cx="0" cy="0" r="3.5" fill="#ED1C24" />
            <line x1="0" y1="-22" x2="0" y2="22" stroke="#ffffff" strokeWidth="3" />
            <line x1="-22" y1="0" x2="22" y2="0" stroke="#ffffff" strokeWidth="3" />
          </g>

          {/* 4. "Vogue en Designe" Dark Gray Pill Badge */}
          <g transform="translate(0, 102)">
            <rect x="-90" y="-15" width="180" height="30" rx="10" fill="#6B7280" />
            <text x="0" y="5" fill="#ffffff" fontSize="16" fontWeight="800" fontFamily="system-ui, -apple-system, sans-serif" textAnchor="middle" letterSpacing="0.3">Vogue en Designe</text>
          </g>
        </g>

        {/* 5. WOODYNAT DESIGNERS LTD */}
        <text x="280" y="300" fill="#0084D1" fontSize="30" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" textAnchor="middle" letterSpacing="0.8">WOODYNAT DESIGNERS LTD</text>

        {/* 6. Tagline: Your Reliable Partner in Design and Branding */}
        <text x="280" y="338" fill="#1F2937" fontSize="17" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" textAnchor="middle" letterSpacing="0.2">Your Reliable Partner in Design and Branding</text>
      </svg>
    </div>
  );
};

export default Logo;


