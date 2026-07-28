import React from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  error,
  ...props
}) {
  return (
    <div className="w-full flex flex-col mb-6">
      {label && (
        <label
          htmlFor={id}
          className="font-sans text-[10px] text-[var(--color-ink-muted)] mb-1 uppercase tracking-wider font-semibold select-none"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`w-full bg-transparent text-[var(--color-ink)] border-b ${
          error ? 'border-[var(--color-alert)]' : 'border-[var(--color-hairline)]'
        } focus:border-[var(--color-presence)] focus:outline-none py-2 px-0 font-sans text-base transition-all duration-200 placeholder:text-[var(--color-ink-muted)]/30`}
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
