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
      style={{ background: '#FFFFFF', border: '1px solid #E8E6DC' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
          style={
            wordCount > 0
              ? { background: '#788C5D20', color: '#788C5D' }
              : { background: '#D9775712', color: '#D97757' }
          }
        >
          {wordCount > 0 ? '✓' : '2'}
        </div>
        <span className="font-heading text-[11px] font-bold uppercase tracking-wider text-[#B0AEA5]">
          Confluence Context
          <span className="font-normal ml-1 text-[#D4D0C4]">(optional)</span>
        </span>
      </div>

      <textarea
        className="w-full rounded-[8px] p-5 font-body text-[13px] resize-y min-h-[120px] outline-none transition-colors placeholder:text-[#D4D0C4]"
        style={{
          background: '#F3F0E8',
          border: value
            ? '1px solid #D97757'
            : '1px solid #E8E6DC',
          color: '#141413',
        }}
        placeholder="Paste text from a Confluence page — sprint goals, team notes, blockers, meeting notes, etc. This context helps the AI generate more relevant insights."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {wordCount > 0 && (
        <p className="mt-2 font-mono text-[11px]" style={{ color: '#788C5D' }}>
          ✓ {wordCount} words
        </p>
      )}
    </div>
  );
};
