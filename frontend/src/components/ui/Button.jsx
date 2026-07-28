import React from 'react';

export default function Button({
  children,
  type = 'button',
  disabled,
  isLoading,
  variant = 'primary',
  ...props
}) {
  const baseStyles = "w-full font-sans font-medium text-base py-3 px-4 rounded-[4px] border transition-all duration-200 focus:outline-none flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-60";
  
  const variants = {
    primary: "bg-[var(--color-signal)] text-[var(--color-ink)] border-[var(--color-signal)] hover:bg-[var(--color-signal-dim)] hover:border-[var(--color-signal-dim)] active:opacity-90",
    secondary: "bg-transparent text-[var(--color-ink)] border-[var(--color-hairline)] hover:border-[var(--color-ink)] active:bg-[var(--color-paper-alt)]",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
