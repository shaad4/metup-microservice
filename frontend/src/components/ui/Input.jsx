import React from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  error,
  ...props
}) {
  return (
    <div className="w-full flex flex-col mb-4">
      {label && (
        <label
          htmlFor={id}
          className="font-sans text-sm text-[var(--color-ink-muted)] mb-1.5 selection:bg-[var(--color-signal-dim)] select-none"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`w-full bg-[var(--color-paper)] text-[var(--color-ink)] border ${
          error ? 'border-[var(--color-alert)]' : 'border-[var(--color-hairline)]'
        } focus:border-[var(--color-presence)] focus:outline-none py-2.5 px-3 rounded-[4px] font-sans text-base transition-colors duration-200`}
        {...props}
      />
      {error && (
        <span className="font-sans text-xs text-[var(--color-alert)] mt-1.5 leading-normal">
          {error}
        </span>
      )}
    </div>
  );
}
