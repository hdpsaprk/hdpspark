import React from 'react';
import { ParsedFile } from '../../types';
import { FileCard } from './FileCard';
import { ConfluenceCard } from './ConfluenceCard';
import { Button } from '../ui/Button';

interface Props {
  parsedFile: ParsedFile | null;
  activeSheet: string;
  confluence: string;
  xlReady: boolean;
  loading: boolean;
  onFile: (file: File) => void;
  onSheetChange: (sheet: string) => void;
  onConfluenceChange: (val: string) => void;
  onGenerate: () => void;
  onClear: () => void;
  onDemo: () => void;
}

export const InputForm: React.FC<Props> = ({
  parsedFile,
  activeSheet,
  confluence,
  xlReady,
  loading,
  onFile,
  onSheetChange,
  onConfluenceChange,
  onGenerate,
  onClear,
  onDemo,
}) => {
  const rows = parsedFile?.sheets[activeSheet] ?? [];
  const rowCount = rows.length;
  const colCount = Object.keys(rows[0] ?? {}).length;
  const canGenerate = !!parsedFile && !!activeSheet && xlReady && !loading;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileCard
          parsedFile={parsedFile}
          activeSheet={activeSheet}
          xlReady={xlReady}
          onFile={onFile}
          onSheetChange={onSheetChange}
        />
        <ConfluenceCard value={confluence} onChange={onConfluenceChange} />
      </div>

      {/* Generate CTA row */}
      <div className="flex items-center gap-4 mt-6 flex-wrap">
        <Button onClick={onGenerate} disabled={!canGenerate}>
          Generate Dashboard →
        </Button>
        <Button variant="secondary" onClick={onDemo}>
          Try Demo
        </Button>
        {parsedFile && (
          <Button variant="secondary" onClick={onClear}>
            Clear
          </Button>
        )}
        {parsedFile && (
          <span className="font-mono text-[12px]" style={{ color: '#475569' }}>
            {rowCount} rows · {colCount} cols · &quot;{activeSheet}&quot;
          </span>
        )}
      </div>
    </div>
  );
};
