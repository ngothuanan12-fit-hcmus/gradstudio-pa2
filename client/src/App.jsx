import { Route, Routes } from 'react-router';
import RequireRole from './auth/RequireRole.jsx';
import ComingSoon from './pages/ComingSoon.jsx';
import Conversation from './pages/Conversation.jsx';
import Conversations from './pages/Conversations.jsx';
import Gallery from './pages/Gallery.jsx';
import Home from './pages/Home.jsx';
import LichChup from './pages/LichChup.jsx';
import NotFound from './pages/NotFound.jsx';
import QuanLy from './pages/QuanLy.jsx';
import QuanTri from './pages/QuanTri.jsx';
import SignIn from './pages/SignIn.jsx';

// Every screen has its own path, opened directly or after a reload. The paths are listed in FRONTEND.md, section 4.
// A protected screen sits inside RequireRole with the roles that may open it.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dang-nhap" element={<SignIn />} />
      <Route
        path="/tu-van"
        element={
          <RequireRole roles={['customer']}>
            <Conversations />
          </RequireRole>
        }
      />
      <Route
        path="/tu-van/:id"
        element={
          <RequireRole roles={['customer']}>
            <Conversation />
          </RequireRole>
        }
      />
      <Route
        path="/lich-chup"
        element={
          <RequireRole roles={['customer']}>
            <LichChup />
          </RequireRole>
        }
      />
      <Route
        path="/lich-chup/:id/anh"
        element={
          <RequireRole roles={['customer']}>
            <Gallery />
          </RequireRole>
        }
      />
      {/* The test payment gateway, until step G7 builds it; G9's payment leads here. */}
      <Route
        path="/thanh-toan/:paymentId"
        element={
          <RequireRole roles={['customer']}>
            <ComingSoon title="Cổng thanh toán thử nghiệm" step="G7" customer />
          </RequireRole>
        }
      />
      <Route
        path="/quan-ly"
        element={
          <RequireRole roles={['admin']}>
            <QuanLy />
          </RequireRole>
        }
      />
      <Route
        path="/quan-ly/hoi-thoai/:id"
        element={
          <RequireRole roles={['admin']}>
            <QuanLy />
          </RequireRole>
        }
      />
      {/* Booking management screens, until step G10 builds them; links from G5/G6 lead here. */}
      <Route
        path="/quan-ly/booking"
        element={
          <RequireRole roles={['admin']}>
            <ComingSoon title="Quản lý booking" step="G10" />
          </RequireRole>
        }
      />
      <Route
        path="/quan-ly/booking/:id"
        element={
          <RequireRole roles={['admin']}>
            <ComingSoon title="Chi tiết booking" step="G10" />
          </RequireRole>
        }
      />
      {/* The staff's home, until step G8 builds it. */}
      <Route
        path="/cong-viec"
        element={
          <RequireRole roles={['staff']}>
            <ComingSoon title="Việc của tôi" step="G8" />
          </RequireRole>
        }
      />
      <Route
        path="/quan-tri"
        element={
          <RequireRole roles={['superadmin']}>
            <QuanTri />
          </RequireRole>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
