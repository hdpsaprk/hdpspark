import React from 'react';

interface Props {
  message: string;
}

export const LoadingSpinner: React.FC<Props> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <div
      className="w-9 h-9 rounded-full animate-spin mb-5"
      style={{
        border: '2px solid #1E293B',
        borderTopColor: '#3B82F6',
      }}
    />
    <p className="font-mono text-[13px]" style={{ color: '#64748B' }}>
      {message}
    </p>
    <p className="font-mono text-[11px] mt-2" style={{ color: '#334155' }}>
      Powered by Claude AI
    </p>
  </div>
);
