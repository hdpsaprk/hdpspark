import React from 'react';

interface Props {
  message: string;
}

export const LoadingSpinner: React.FC<Props> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <div
      className="w-9 h-9 rounded-full animate-spin mb-5"
      style={{
        border: '2px solid #E8E6DC',
        borderTopColor: '#D97757',
      }}
    />
    <p className="font-mono text-[13px]" style={{ color: '#6B5E54' }}>
      {message}
    </p>
    <p className="font-mono text-[11px] mt-2" style={{ color: '#B0AEA5' }}>
      Powered by Claude AI
    </p>
  </div>
);
