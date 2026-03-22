import React from 'react';

interface Props {
  message: string;
  detail?: string;
}

export const ErrorBox: React.FC<Props> = ({ message, detail }) => (
  <div
    className="rounded-[8px] p-4 mb-4"
    style={{
      background: '#FEF2F2',
      border: '1px solid #FECACA',
    }}
  >
    <p className="font-mono text-[13px] font-bold" style={{ color: '#DC2626' }}>
      ⚠ {message}
    </p>
    {detail && (
      <details className="mt-2">
        <summary
          className="font-mono text-[12px] cursor-pointer"
          style={{ color: '#6B5E54' }}
        >
          Show details
        </summary>
        <pre
          className="mt-2 font-mono text-[11px] whitespace-pre-wrap break-words"
          style={{ color: '#92400E' }}
        >
          {detail}
        </pre>
      </details>
    )}
  </div>
);
