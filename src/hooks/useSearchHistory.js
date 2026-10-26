import { useEffect, useState } from 'react';
import { HISTORY_LIMIT } from '../constants.js';

const STORAGE_KEY = 'favorit-history';

function readHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    return Array.isArray(saved)
      ? saved.filter((number) => typeof number === 'string').slice(0, HISTORY_LIMIT)
      : [];
  } catch {
    return [];
  }
}

export default function useSearchHistory(number, status) {
  const [history, setHistory] = useState(readHistory);

  useEffect(() => {
    if (status === 'success' && number) {
      setHistory((previous) =>
        [number, ...previous.filter((item) => item !== number)].slice(0, HISTORY_LIMIT),
      );
    }
  }, [number, status]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Поиск работает и при недоступном localStorage.
    }
  }, [history]);

  return { history, clearHistory: () => setHistory([]) };
}
