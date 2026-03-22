import React from 'react';

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

export const Button: React.FC<Props> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
}) => {
  const base =
    'inline-flex items-center justify-center rounded-[8px] transition-colors cursor-pointer';

  let style = '';
  if (variant === 'primary') {
    style = disabled
      ? 'bg-accent/30 text-white/40 cursor-not-allowed font-syne text-[14px] font-bold px-5 py-2.5'
      : 'bg-accent hover:bg-blue-600 text-white font-syne text-[14px] font-bold px-5 py-2.5';
  } else if (variant === 'secondary') {
    style =
      'bg-transparent border border-border-default hover:border-border-hover text-[#64748B] hover:text-[#94A3B8] font-syne text-[13px] font-semibold px-4 py-2';
  } else {
    style =
      'bg-transparent text-[#64748B] hover:text-[#94A3B8] font-syne text-[13px] font-semibold px-3 py-2';
  }

  return (
    <button
      className={`${base} ${style} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
