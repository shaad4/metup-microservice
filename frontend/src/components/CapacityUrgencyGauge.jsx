import React from 'react';
import { AnimatedCounter } from './AnimatedCounter';

/**
 * CapacityUrgencyGauge
 * A high-end radial status gauge for event capacity that dynamically triggers
 * high-urgency themes and animations when spots are running low.
 * 
 * @param {{ currentCount: number, capacity: number, hasEnded?: boolean }} props
 */
export function CapacityUrgencyGauge({ currentCount = 0, capacity = 0, hasEnded = false }) {
  const remaining = Math.max(capacity - currentCount, 0);
  const percentage = capacity > 0 ? Math.min((currentCount / capacity) * 100, 100) : 0;
  const isFull = currentCount >= capacity;

  // SVG parameters
  const radius = 45;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius; // ~282.74
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Urgency states
  let themeColor = 'var(--color-presence)';
  let urgencyTitle = 'Registration Open';
  let bannerBg = 'rgba(31, 92, 85, 0.06)';
  let bannerBorder = 'var(--color-presence)';
  let rotationSpeed = '20s'; // slow, calming
  let pulseAnimation = '';
  let urgencyAlert = `${remaining} spots remaining`;
  let subtext = 'Grab your spot to attend this gathering.';

  if (hasEnded) {
    themeColor = 'var(--color-ink-muted)';
    urgencyTitle = 'Registration Closed';
    bannerBg = 'rgba(107, 104, 96, 0.06)';
    bannerBorder = 'var(--color-hairline)';
    rotationSpeed = '0s';
    urgencyAlert = 'Event has ended';
    subtext = 'This event took place in the past.';
  } else if (isFull) {
    themeColor = 'var(--color-alert)';
    urgencyTitle = 'Sold Out';
    bannerBg = 'rgba(178, 58, 46, 0.06)';
    bannerBorder = 'var(--color-alert)';
    rotationSpeed = '0s';
    urgencyAlert = 'No spots remaining';
    subtext = 'Capacity limit has been reached.';
  } else if (remaining === 1) {
    themeColor = 'var(--color-alert)';
    urgencyTitle = 'Critical Urgency';
    bannerBg = 'rgba(178, 58, 46, 0.08)';
    bannerBorder = 'var(--color-alert)';
    rotationSpeed = '2.5s'; // rapid rotation
    pulseAnimation = 'ws-pulse-border 1.5s infinite';
    urgencyAlert = '🔥 ONLY 1 SPOT LEFT!';
    subtext = 'Someone else is currently viewing this event. Join now!';
  } else if (remaining <= 5) {
    themeColor = 'var(--color-signal)';
    urgencyTitle = 'Selling Fast';
    bannerBg = 'rgba(225, 168, 61, 0.08)';
    bannerBorder = 'var(--color-signal)';
    rotationSpeed = '6s'; // medium rotation
    urgencyAlert = `⚠️ Only ${remaining} spots left!`;
    subtext = 'Secure your reservation before it is full.';
  }

  // Dial ticks SVG
  const renderDialTicks = () => {
    return (
      <circle
        cx="60"
        cy="60"
        r={radius + 6}
        fill="transparent"
        stroke={themeColor}
        strokeWidth="1.5"
        strokeDasharray="1.5 5"
        className="opacity-30 origin-center"
        style={{
          transformOrigin: 'center',
          animation: rotationSpeed !== '0s' ? `ws-rotate-clockwise ${rotationSpeed} linear infinite` : 'none',
        }}
      />
    );
  };

  return (
    <div 
      className="w-full flex flex-col md:flex-row gap-6 items-center p-5 rounded-[6px] border border-[var(--color-hairline)] bg-[var(--color-paper-alt)]/30 box-border transition-all duration-300"
      style={{
        animation: pulseAnimation,
        borderColor: remaining === 1 ? 'var(--color-alert)' : 'var(--color-hairline)'
      }}
    >
      {/* Radial Circle Area */}
      <div className="relative w-[120px] h-[120px] flex items-center justify-center select-none flex-shrink-0">
        
        {/* Pulsing glow background disc (only if urgent) */}
        {(remaining <= 5 && !isFull && !hasEnded) && (
          <div 
            className="absolute inset-2 rounded-full pointer-events-none"
            style={{
              backgroundColor: themeColor,
              animation: 'ws-pulse-glow 2s ease-in-out infinite',
            }}
          />
        )}

        <svg width="120" height="120" viewBox="0 0 120 120" className="absolute top-0 left-0">
          <defs>
            {/* Soft gradient matching theme */}
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={themeColor} />
              <stop offset="100%" stopColor={themeColor} stopOpacity="0.85" />
            </linearGradient>
          </defs>
          
          {/* Ticking dial ring */}
          {!hasEnded && renderDialTicks()}

          {/* Underlay tracking circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke="var(--color-hairline)"
            strokeWidth={strokeWidth}
            className="opacity-40"
          />

          {/* Colored progress gauge circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out origin-center -rotate-90"
            style={{
              transformOrigin: 'center',
            }}
          />
        </svg>

        {/* Text inside the ring */}
        <div className="z-10 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-[8px] uppercase tracking-wider text-[var(--color-ink-muted)] leading-none mb-1">
            Joined
          </span>
          <span className="font-display text-2xl font-bold text-[var(--color-ink)] leading-none flex items-baseline">
            <AnimatedCounter value={currentCount} />
          </span>
          <span className="font-mono text-[9px] text-[var(--color-ink-muted)] mt-1.5 border-t border-[var(--color-hairline)] pt-1 px-1">
            max {capacity}
          </span>
        </div>
      </div>

      {/* Message and Status Panel */}
      <div className="flex-1 flex flex-col justify-center text-center md:text-left">
        <div className="mb-1">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-ink-muted)] font-bold">
            {urgencyTitle}
          </span>
        </div>

        {/* Urgency Alert Label */}
        <div 
          className="inline-block md:self-start px-3 py-1.5 rounded-[4px] border font-sans text-sm font-semibold tracking-tight transition-all duration-300"
          style={{
            backgroundColor: bannerBg,
            borderColor: bannerBorder,
            color: themeColor,
            animation: remaining === 1 ? 'ws-flicker 1.2s infinite' : 'none'
          }}
        >
          {urgencyAlert}
        </div>

        <p className="font-sans text-xs text-[var(--color-ink-muted)] mt-2.5 leading-relaxed m-0 max-w-[340px]">
          {subtext}
        </p>
      </div>
    </div>
  );
}
