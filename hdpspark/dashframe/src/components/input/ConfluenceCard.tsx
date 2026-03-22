import React from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export const ConfluenceCard: React.FC<Props> = ({ value, onChange }) => {
  const wordCount = value.trim()
    ? value.trim().split(/\s+/).length
    : 0;

  return (
    <div
      className="rounded-[12px] p-6"
      style={{ background: '#161D2E', border: '1px solid #1F2D45' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
          style={
            wordCount > 0
              ? { background: '#10B98120', color: '#10B981' }
              : { background: '#1E3A5F', color: '#3B82F6' }
          }
        >
          {wordCount > 0 ? '✓' : '2'}
        </div>
        <span className="font-syne text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
          Confluence Context
          <span className="font-normal ml-1 text-[#334155]">(optional)</span>
        </span>
      </div>

      <textarea
        className="w-full rounded-[8px] p-5 font-syne text-[13px] resize-y min-h-[120px] outline-none transition-colors placeholder:text-[#334155]"
        style={{
          background: '#1E293B',
          border: value
            ? '1px solid #3B82F6'
            : '1px solid #1F2D45',
          color: '#F1F5F9',
        }}
        placeholder="Paste text from a Confluence page — sprint goals, team notes, blockers, meeting notes, etc. This context helps the AI generate more relevant insights."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {wordCount > 0 && (
        <p className="mt-2 font-mono text-[11px]" style={{ color: '#10B981' }}>
          ✓ {wordCount} words
        </p>
      )}
    </div>
  );
};
