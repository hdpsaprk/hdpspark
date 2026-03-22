import { useState, useEffect } from 'react';

const CDN_URL =
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';

export function useSheetJS(): boolean {
  const [ready, setReady] = useState(!!window.XLSX);

  useEffect(() => {
    if (window.XLSX) {
      setReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = CDN_URL;
    script.async = true;
    script.onload = () => setReady(true);
    script.onerror = () => {
      // Retry once on failure
      const retry = document.createElement('script');
      retry.src = CDN_URL;
      retry.async = true;
      retry.onload = () => setReady(true);
      document.head.appendChild(retry);
    };
    document.head.appendChild(script);
  }, []);

  return ready;
}
