import AdminLayout from '../layouts/AdminLayout.jsx';
import Button from '../components/Button.jsx';

// Placeholder for Khánh's page. The form is the main-flow link to the next page.
export default function QuanLy() {
  return (
    <AdminLayout>
      <h1 className="page-title">Quản lý booking</h1>
      <form action="lich-chup.html">
        <Button type="submit">Tạo booking GS-1024</Button>
      </form>
    </AdminLayout>
  );
}
