import { Link } from 'react-router';
import CustomerLayout from '../layouts/CustomerLayout.jsx';

// Any path that is not a route of the app.
export default function NotFound() {
  return (
    <CustomerLayout title="Không tìm thấy trang: GradStudio">
      <h1 className="page-title">Không tìm thấy trang</h1>
      <p>Địa chỉ này không có trong GradStudio.</p>
      <p>
        <Link to="/">Về trang chủ</Link>
      </p>
    </CustomerLayout>
  );
}
