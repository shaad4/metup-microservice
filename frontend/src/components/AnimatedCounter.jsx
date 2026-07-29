import React, { useEffect, useState, useRef } from 'react';

/**
 * AnimatedCounter tween-animates integer changes using requestAnimationFrame.
 * This ensures the change from old to new values is smooth and readable.
 * 
 * @param {{ value: number }} props
 */
export function AnimatedCounter({ value }) {
  const [displayValue, setDisplayValue] = useState(value);
  const animationRef = useRef(null);
  
  // Keep track of values across renders
  const startValueRef = useRef(value);
  const targetValueRef = useRef(value);
  const startTimeRef = useRef(0);
  const duration = 500; // Total duration in ms

  useEffect(() => {
    // If the value hasn't changed or it's the initial mount, skip animation
    if (targetValueRef.current === value) {
      setDisplayValue(value);
      startValueRef.current = value;
      return;
    }

    // Set up start and target bounds
    startValueRef.current = displayValue;
    targetValueRef.current = value;
    startTimeRef.current = performance.now();

    const step = (now) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Simple ease-out quadratic tween formula
      const easeOut = progress * (2 - progress);
      const nextVal = startValueRef.current + (targetValueRef.current - startValueRef.current) * easeOut;
      
      setDisplayValue(Math.round(nextVal));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step);
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value]);

  return (
    <span className="tabular-nums font-mono">
      {displayValue}
    </span>
  );
}
