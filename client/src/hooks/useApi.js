import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

// Loads one thing from the API for a screen: one request per path, aborted when the screen closes or the path changes.
// `retry` loads it again without a page reload. While a new request is out the old data stays on screen.
// Pass `null` as the path to wait (for example until the screen knows which booking to load).
export default function useApi(path) {
  const [state, setState] = useState({ status: path === null ? 'idle' : 'loading', data: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (path === null) return undefined;
    const controller = new AbortController();
    setState((s) => ({ ...s, status: 'loading', error: null }));
    api(path, { signal: controller.signal }).then(
      (data) => setState({ status: 'ready', data, error: null }),
      (error) => {
        if (controller.signal.aborted) return;
        setState((s) => ({ ...s, status: 'error', error }));
      },
    );
    return () => controller.abort();
  }, [path, attempt]);

  return {
    ...state,
    retry: () => setAttempt((n) => n + 1),
    // After an action, the screen shows the API's answer without loading again.
    setData: (next) => setState((s) => ({ ...s, data: typeof next === 'function' ? next(s.data) : next })),
  };
}
