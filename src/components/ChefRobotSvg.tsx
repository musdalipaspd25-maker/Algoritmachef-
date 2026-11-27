import React from 'react';
import { RobotMood } from '../types/game';

interface ChefLogoSvgProps {
  className?: string;
}

/**
 * Logo resmi Algorithm Chef: Topi koki dengan lambang roda gigi & blok kode.
 */
export const ChefLogoSvg: React.FC<ChefLogoSvgProps> = ({
  className = 'w-12 h-12',
}) => (
  <svg
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="80" height="80" rx="20" fill="#EA580C" />
    <rect x="4" y="4" width="72" height="72" rx="16" stroke="#FFEDD5" strokeWidth="2" strokeOpacity="0.4" />
    {/* Topi koki */}
    <path
      d="M22 44C17 44 14 39.5 15.5 34.5C17 29.8 21.5 28 24 28C26 21.5 32.2 17 40 17C47.8 17 54 21.5 56 28C58.5 28 63 29.8 64.5 34.5C66 39.5 63 44 58 44H22Z"
      fill="#FFFFFF"
      stroke="#14284B"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <rect
      x="22"
      y="44"
      width="36"
      height="15"
      rx="4"
      fill="#FFF8EE"
      stroke="#14284B"
      strokeWidth="3"
    />
    {/* Roda gigi kecil di topi */}
    <circle cx="40" cy="31" r="6" fill="#FFEDD5" stroke="#EA580C" strokeWidth="2.5" />
    <circle cx="40" cy="31" r="2.2" fill="#14284B" />
    {/* Lambang blok kode < /> di pita topi */}
    <path
      d="M33 49L29.5 51.5L33 54M47 49L50.5 51.5L47 54M41.5 48.5L38.5 54.5"
      stroke="#14284B"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface ChefRobotSvgProps {
  mood?: RobotMood;
  holdingLabel?: string | null;
  className?: string;
}

/**
 * Karakter Robot Koki SVG bergaya flat kartun dengan animasi ringan.
 */
export const ChefRobotSvg: React.FC<ChefRobotSvgProps> = ({
  mood = 'idle',
  holdingLabel = null,
  className = 'w-28 h-28',
}) => {
  const animClass =
    mood === 'working' ? 'animate-robot-work' : 'animate-robot-bob';

  const screenColor =
    mood === 'error'
      ? '#7F1D1D'
      : mood === 'success'
        ? '#065F46'
        : '#1E293B';

  const eyeColor =
    mood === 'error'
      ? '#FCA5A5'
      : mood === 'success'
        ? '#6EE7B7'
        : '#38BDF8';

  return (
    <svg
      viewBox="0 0 120 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animClass}`}
      role="img"
      aria-label={`Robot Koki sedang ${mood}`}
    >
      {/* Topi Koki Robot */}
      <path
        d="M36 38C30 38 27 33 29 27.5C31 22.5 36 21 39 21C41.5 14 49 9 60 9C71 9 78.5 14 81 21C84 21 89 22.5 91 27.5C93 33 90 38 84 38H36Z"
        fill="#FFFFFF"
        stroke="#14284B"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <rect
        x="38"
        y="37"
        width="44"
        height="11"
        rx="4"
        fill="#F97316"
        stroke="#14284B"
        strokeWidth="3"
      />
      <circle cx="60" cy="24" r="5" fill="#FFEDD5" stroke="#EA580C" strokeWidth="2.5" />

      {/* Kepala Robot */}
      <rect
        x="28"
        y="48"
        width="64"
        height="40"
        rx="14"
        fill="#E2E8F0"
        stroke="#14284B"
        strokeWidth="3.5"
      />
      {/* Layar Wajah */}
      <rect x="35" y="55" width="50" height="26" rx="8" fill={screenColor} />

      {/* Mata Ekspresif */}
      {mood === 'error' ? (
        <>
          <path d="M44 63L51 70M51 63L44 70" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
          <path d="M69 63L76 70M76 63L69 70" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
        </>
      ) : mood === 'success' ? (
        <>
          <path d="M43 68C45 64 50 64 52 68" stroke={eyeColor} strokeWidth="3.2" strokeLinecap="round" />
          <path d="M68 68C70 64 75 64 77 68" stroke={eyeColor} strokeWidth="3.2" strokeLinecap="round" />
          <path d="M54 74C57 77 63 77 66 74" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="48" cy="66" r="4.5" fill={eyeColor} />
          <circle cx="72" cy="66" r="4.5" fill={eyeColor} />
          <rect x="53" y="73" width="14" height="3" rx="1.5" fill={eyeColor} opacity="0.85" />
        </>
      )}

      {/* Telinga Antena */}
      <rect x="20" y="61" width="8" height="14" rx="4" fill="#F97316" stroke="#14284B" strokeWidth="2.5" />
      <rect x="92" y="61" width="8" height="14" rx="4" fill="#F97316" stroke="#14284B" strokeWidth="2.5" />

      {/* Badan Robot + Celemek */}
      <rect
        x="34"
        y="90"
        width="52"
        height="30"
        rx="10"
        fill="#CBD5E1"
        stroke="#14284B"
        strokeWidth="3.5"
      />
      <rect
        x="43"
        y="92"
        width="34"
        height="26"
        rx="6"
        fill="#FFFFFF"
        stroke="#14284B"
        strokeWidth="2.5"
      />
      <path d="M52 103H68" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />

      {/* Lengan & Spatula */}
      <path
        d="M34 99C24 99 18 93 18 84"
        stroke="#14284B"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M86 99C96 99 102 93 102 84"
        stroke="#14284B"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Spatula di tangan kanan */}
      <line x1="102" y1="84" x2="108" y2="66" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" />
      <rect x="103" y="55" width="10" height="12" rx="2.5" fill="#94A3B8" stroke="#14284B" strokeWidth="2" />

      {/* Indikator Bahan yang Dipegang */}
      {holdingLabel && (
        <g transform="translate(8, 70)">
          <rect x="0" y="0" width="24" height="20" rx="6" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
          <text
            x="12"
            y="14"
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            fill="#92400E"
          >
            🥣
          </text>
        </g>
      )}
    </svg>
  );
};
