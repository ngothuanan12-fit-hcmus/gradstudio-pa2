import { useRef, useState } from 'react';

// An action button that calls the API (agree, decline, cancel…): one request at a time, guarded by a ref so a second
// press in the same tick sends nothing, and the API's message kept for the screen if it refuses.
export default function useAction() {
  const running = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function run(task) {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError(null);
    try {
      await task();
    } catch (err) {
      setError(err.message);
    } finally {
      running.current = false;
      setBusy(false);
    }
  }

  return { busy, error, run };
}
