import AdminLayout from '../layouts/AdminLayout.jsx';
import CustomerLayout from '../layouts/CustomerLayout.jsx';

// A screen whose step is not built yet. Says so plainly instead of the general not-found screen, so a user who
// signed in correctly knows the address is right. Replaced by the real screen in its step. `customer` uses the
// customer's layout, for a screen inside the customer's flow.
export default function ComingSoon({ title, step, customer = false }) {
  const Layout = customer ? CustomerLayout : AdminLayout;
  return (
    <Layout title={`${title}: GradStudio`}>
      <h1 className="page-title">{title}</h1>
      <p className="state state-empty">
        Bạn đã đăng nhập đúng. Màn hình này đang được làm (bước {step}) nên chưa có nội dung.
      </p>
    </Layout>
  );
}
