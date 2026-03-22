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
      ? 'bg-[#D97757]/30 text-white/50 cursor-not-allowed font-heading text-[14px] font-bold px-5 py-2.5'
      : 'bg-[#D97757] hover:bg-[#C4623F] text-white font-heading text-[14px] font-bold px-5 py-2.5';
  } else if (variant === 'secondary') {
    style =
      'bg-transparent border border-[#E8E6DC] hover:border-[#D4D0C4] text-[#6B5E54] hover:text-[#141413] font-heading text-[13px] font-semibold px-4 py-2';
  } else {
    style =
      'bg-transparent text-[#6B5E54] hover:text-[#141413] font-heading text-[13px] font-semibold px-3 py-2';
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
