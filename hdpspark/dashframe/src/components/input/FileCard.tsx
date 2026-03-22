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
      style={{ background: '#161D2E', border: '1px solid #1F2D45' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
          style={
            parsedFile
              ? { background: '#10B98120', color: '#10B981' }
              : { background: '#1E3A5F', color: '#3B82F6' }
          }
        >
          {parsedFile ? '✓' : '1'}
        </div>
        <span className="font-syne text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
          Spreadsheet Data
        </span>
      </div>

      {/* SheetJS loading warning */}
      {!xlReady && (
        <div
          className="rounded-[8px] px-3 py-2 mb-3 font-mono text-[12px]"
          style={{
            background: '#F59E0B12',
            border: '1px solid #F59E0B38',
            color: '#F59E0B',
          }}
        >
          Loading spreadsheet parser…
        </div>
      )}

      {/* File status */}
      {!parsedFile ? (
        <div
          className="rounded-[8px] p-5 mb-4 flex flex-col items-center gap-2"
          style={{ background: '#1E293B', border: '1px dashed #1F2D45' }}
        >
          <span className="text-[24px]">📁</span>
          <span className="font-syne text-[13px] text-[#475569]">
            No file selected
          </span>
          <span className="font-mono text-[11px] text-[#334155]">
            Supports .xlsx · .xls
          </span>
        </div>
      ) : (
        <div
          className="rounded-[8px] px-4 py-3 mb-4"
          style={{
            background: '#10B98112',
            border: '1px solid #10B98138',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[14px]">✅</span>
            <span
              className="font-mono text-[12px] font-bold truncate"
              style={{ color: '#10B981' }}
            >
              {parsedFile.fileName}
            </span>
          </div>
          <div className="font-mono text-[11px] mt-1" style={{ color: '#64748B' }}>
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
              className="px-2.5 py-1 rounded-[5px] font-syne text-[11px] font-semibold transition-colors cursor-pointer"
              style={
                name === activeSheet
                  ? {
                      background: '#1E3A5F',
                      border: '1px solid #3B82F6',
                      color: '#3B82F6',
                    }
                  : {
                      background: 'transparent',
                      border: '1px solid #1F2D45',
                      color: '#475569',
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
