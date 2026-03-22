import React, { useRef } from 'react';
import { ParsedFile } from '../../types';
import { Button } from '../ui/Button';

interface Props {
  parsedFile: ParsedFile | null;
  activeSheet: string;
  xlReady: boolean;
  onFile: (file: File) => void;
  onSheetChange: (sheet: string) => void;
}

export const FileCard: React.FC<Props> = ({
  parsedFile,
  activeSheet,
  xlReady,
  onFile,
  onSheetChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const rows = parsedFile?.sheets[activeSheet] ?? [];
  const rowCount = rows.length;
  const colCount = Object.keys(rows[0] ?? {}).length;

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
            parsedFile
              ? { background: '#788C5D20', color: '#788C5D' }
              : { background: '#D9775712', color: '#D97757' }
          }
        >
          {parsedFile ? '✓' : '1'}
        </div>
        <span className="font-heading text-[11px] font-bold uppercase tracking-wider text-[#B0AEA5]">
          Spreadsheet Data
        </span>
      </div>

      {/* SheetJS loading warning */}
      {!xlReady && (
        <div
          className="rounded-[8px] px-3 py-2 mb-3 font-mono text-[12px]"
          style={{
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            color: '#92400E',
          }}
        >
          Loading spreadsheet parser…
        </div>
      )}

      {/* File status */}
      {!parsedFile ? (
        <div
          className="rounded-[8px] p-5 mb-4 flex flex-col items-center gap-2"
          style={{ background: '#F3F0E8', border: '1px dashed #D4D0C4' }}
        >
          <span className="text-[24px]">📁</span>
          <span className="font-body text-[13px] text-[#B0AEA5]">
            No file selected
          </span>
          <span className="font-mono text-[11px] text-[#D4D0C4]">
            Supports .xlsx · .xls
          </span>
        </div>
      ) : (
        <div
          className="rounded-[8px] px-4 py-3 mb-4"
          style={{
            background: '#788C5D12',
            border: '1px solid #788C5D38',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[14px]">✅</span>
            <span
              className="font-mono text-[12px] font-bold truncate"
              style={{ color: '#788C5D' }}
            >
              {parsedFile.fileName}
            </span>
          </div>
          <div className="font-mono text-[11px] mt-1" style={{ color: '#6B5E54' }}>
            {rowCount} rows · {colCount} cols ·{' '}
            {parsedFile.sheetNames.length} sheet
            {parsedFile.sheetNames.length > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />

      <Button
        onClick={() => inputRef.current?.click()}
        disabled={!xlReady}
        variant={parsedFile ? 'ghost' : 'primary'}
        className="w-full"
      >
        {parsedFile ? 'Choose a different file' : 'Choose File…'}
      </Button>

      {/* Sheet tabs */}
      {parsedFile && parsedFile.sheetNames.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {parsedFile.sheetNames.map((name) => (
            <button
              key={name}
              onClick={() => onSheetChange(name)}
              className="px-2.5 py-1 rounded-[5px] font-heading text-[11px] font-semibold transition-colors cursor-pointer"
              style={
                name === activeSheet
                  ? {
                      background: '#D9775712',
                      border: '1px solid #D97757',
                      color: '#D97757',
                    }
                  : {
                      background: 'transparent',
                      border: '1px solid #E8E6DC',
                      color: '#B0AEA5',
                    }
              }
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
