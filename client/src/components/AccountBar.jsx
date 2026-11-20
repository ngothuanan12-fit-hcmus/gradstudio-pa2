import { startTransition } from 'react';
import { Link } from 'react-router';
import { ROLE_NAME } from '../auth/roles.js';
import useAuth from '../auth/useAuth.js';

// The signed-in user and Đăng xuất, or Đăng nhập for a visitor. Nothing while a stored token is being checked.
// Đăng xuất is a router link to the home page (moving between screens is a link, CLAUDE.md NEVER 5) that also signs out.
// The sign-out runs in a transition, like the router's own navigation, so both land in one render: otherwise a protected
// screen would see 'signed-out' first and send the user to sign-in instead of home.
export default function AccountBar() {
  const auth = useAuth();
  if (auth.status === 'signed-in') {
    return (
      <div className="account-bar">
        <p className="account-who">
          {auth.user.name} · {ROLE_NAME[auth.user.role]}
        </p>
        <Link className="btn btn-secondary" to="/" onClick={() => startTransition(auth.signOut)}>
          Đăng xuất
        </Link>
      </div>
    );
  }
  if (auth.status === 'signed-out') {
    return (
      <Link className="btn btn-secondary" to="/dang-nhap">
        Đăng nhập
      </Link>
    );
  }
  return null;
}
