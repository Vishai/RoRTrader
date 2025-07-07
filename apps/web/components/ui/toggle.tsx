'use client';

import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, className = '', disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors duration-200 ease-in-out focus:outline-none
        focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-background-primary
        ${checked ? 'bg-accent-primary' : 'bg-background-tertiary'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
}
