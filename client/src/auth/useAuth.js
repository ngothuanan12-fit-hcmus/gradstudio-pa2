import { useContext } from 'react';
import { AuthContext } from './AuthContext.jsx';

// The signed-in user, their status, and signIn / signOut / retry. Every screen reads sign-in through this hook.
export default function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth must be used inside <AuthProvider>');
  return auth;
}
