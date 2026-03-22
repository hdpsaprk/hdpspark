import React, { useState } from 'react';
import { ParsedFile, DashboardConfig, AppStep } from './types';
import { useSheetJS } from './hooks/useSheetJS';
import { useLoadingMessages } from './hooks/useLoadingMessages';
import { parseExcel } from './lib/parseExcel';
import { callClaude } from './lib/callClaude';
import { Header } from './components/layout/Header';
import { PageShell } from './components/layout/PageShell';
import { InputForm } from './components/input/InputForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorBox } from './components/ui/ErrorBox';

export default function App() {
  const xlReady = useSheetJS();

  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null);
  const [activeSheet, setActiveSheet] = useState('');
  const [confluence, setConfluence] = useState('');
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardConfig | null>(null);
  const [error, setError] = useState('');
  const [errorDetail, setErrorDetail] = useState('');

  const loadMsg = useLoadingMessages(loading);

  const rows = parsedFile?.sheets[activeSheet] ?? [];
  const step: AppStep = dashboard ? 3 : loading ? 2 : 1;

  async function handleFile(file: File) {
    setError('');
    setErrorDetail('');
    setDashboard(null);
    try {
      const parsed = await parseExcel(file);
      setParsedFile(parsed);
      setActiveSheet(parsed.sheetNames[0] || '');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function handleSheetChange(sheet: string) {
    setActiveSheet(sheet);
    setDashboard(null);
    setError('');
    setErrorDetail('');
  }

  async function handleGenerate() {
    if (!parsedFile || !activeSheet || !rows.length) return;

    if (rows.length === 0) {
      setError(`Sheet '${activeSheet}' contains no data rows`);
      return;
    }

    setLoading(true);
    setError('');
    setErrorDetail('');
    setDashboard(null);

    try {
      const config = await callClaude(rows, confluence, activeSheet);
      setDashboard(config);
    } catch (err) {
      const msg = (err as Error).message || 'Unknown error';
      const parts = msg.split('\n\n');
      setError(parts[0]);
      setErrorDetail(parts.slice(1).join('\n\n'));
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setParsedFile(null);
    setActiveSheet('');
    setConfluence('');
    setDashboard(null);
    setError('');
    setErrorDetail('');
  }

  function handleReset() {
    setDashboard(null);
    setError('');
    setErrorDetail('');
  }

  return (
    <div className="min-h-screen" style={{ background: '#0A0E1A' }}>
      <Header step={step} />
      <PageShell>
        {error && <ErrorBox message={error} detail={errorDetail} />}

        {loading ? (
          <LoadingSpinner message={loadMsg} />
        ) : dashboard ? (
          <Dashboard config={dashboard} onReset={handleReset} />
        ) : (
          <InputForm
            parsedFile={parsedFile}
            activeSheet={activeSheet}
            confluence={confluence}
            xlReady={xlReady}
            loading={loading}
            onFile={handleFile}
            onSheetChange={handleSheetChange}
            onConfluenceChange={setConfluence}
            onGenerate={handleGenerate}
            onClear={handleClear}
          />
        )}
      </PageShell>
    </div>
  );
}
