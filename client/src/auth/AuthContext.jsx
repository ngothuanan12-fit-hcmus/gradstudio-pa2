import { createContext, useEffect, useMemo, useState } from 'react';
import { api, configureApi, setApiToken } from '../api/client.js';

export const AuthContext = createContext(null);

// The token alone is kept in the browser, under one key, by this module only (CLAUDE.md, NEVER 4), so a screen opened
// directly or after a reload stays signed in. The user and their role always come from the API (`/api/auth/me`),
// never from storage or the URL.
const KEY = 'gradstudio.token';

function readToken() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function keepToken(token) {
  setApiToken(token);
  try {
    if (token) localStorage.setItem(KEY, token);
    else localStorage.removeItem(KEY);
  } catch {
    // Storage blocked (a private window): the sign-in still works until the tab closes.
  }
}

// status: 'checking' (a stored token is being checked), 'signed-in', 'signed-out', or 'error' (the API could not
// answer the check; `retry` asks again).
function startState() {
  const token = readToken();
  setApiToken(token);
  return { status: token ? 'checking' : 'signed-out', user: null, error: null };
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(startState);

  // A request answered 401 means the token no longer works: forget it; protected routes then send the user to sign-in.
  useEffect(() => {
    configureApi({
      onUnauthorized: () => {
        keepToken(null);
        setState({ status: 'signed-out', user: null, error: null });
      },
    });
    return () => configureApi({ onUnauthorized: () => {} });
  }, []);

  useEffect(() => {
    if (state.status !== 'checking') return undefined;
    const controller = new AbortController();
    api('/auth/me', { signal: controller.signal }).then(
      (user) => setState({ status: 'signed-in', user, error: null }),
      (error) => {
        if (controller.signal.aborted) return;
        if (error.status === 401) {
          keepToken(null);
          setState({ status: 'signed-out', user: null, error: null });
        } else {
          setState({ status: 'error', user: null, error });
        }
      },
    );
    return () => controller.abort();
  }, [state.status]);

  const value = useMemo(
    () => ({
      ...state,
      async signIn(email, password) {
        const { token, user } = await api('/auth/login', { method: 'POST', body: { email, password } });
        keepToken(token);
        setState({ status: 'signed-in', user, error: null });
        return user;
      },
      signOut() {
        keepToken(null);
        setState({ status: 'signed-out', user: null, error: null });
      },
      retry() {
        setState({ status: 'checking', user: null, error: null });
      },
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
