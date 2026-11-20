import { Link, Navigate, useLocation } from 'react-router';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import { HOME } from './roles.js';
import useAuth from './useAuth.js';

// A protected route. Signed out: to sign-in, which brings the user back here (the path travels in the router's state,
// not in the URL). Signed in with another role: turned away with a link to their own home.
export default function RequireRole({ roles, children }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.status === 'checking') {
    return (
      <CustomerLayout title="GradStudio">
        <h1 className="page-title">Đang mở trang</h1>
        <LoadingState label="Đang kiểm tra đăng nhập…" />
      </CustomerLayout>
    );
  }
  if (auth.status === 'error') {
    return (
      <CustomerLayout title="GradStudio">
        <h1 className="page-title">Chưa kiểm tra được đăng nhập</h1>
        <ErrorState error={auth.error} onRetry={auth.retry} />
      </CustomerLayout>
    );
  }
  if (auth.status === 'signed-out') {
    return <Navigate to="/dang-nhap" replace state={{ from: location.pathname + location.search }} />;
  }
  if (!roles.includes(auth.user.role)) {
    return (
      <CustomerLayout title="Không có quyền: GradStudio">
        <h1 className="page-title">Trang này không dành cho tài khoản của bạn</h1>
        <p>Bạn đang đăng nhập với tài khoản {auth.user.name}.</p>
        <p>
          <Link to={HOME[auth.user.role]}>Về trang của bạn</Link>
        </p>
      </CustomerLayout>
    );
  }
  return children;
}
