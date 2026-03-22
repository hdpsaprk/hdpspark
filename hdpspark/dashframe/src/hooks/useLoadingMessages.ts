import { useState, useEffect, useRef } from 'react';

const MESSAGES = [
  'Parsing data structure…',
  'Identifying key metrics…',
  'Designing charts…',
  'Extracting insights…',
  'Building dashboard…',
];

export function useLoadingMessages(active: boolean): string {
  const [msg, setMsg] = useState(MESSAGES[0]);
  const idx = useRef(0);

  useEffect(() => {
    if (!active) return;
    idx.current = 0;
    setMsg(MESSAGES[0]);
    const iv = setInterval(() => {
      idx.current = (idx.current + 1) % MESSAGES.length;
      setMsg(MESSAGES[idx.current]);
    }, 1900);
    return () => clearInterval(iv);
  }, [active]);

  return msg;
}
