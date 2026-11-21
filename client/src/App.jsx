import { Route, Routes } from 'react-router';
import RequireRole from './auth/RequireRole.jsx';
import ComingSoon from './pages/ComingSoon.jsx';
import Conversation from './pages/Conversation.jsx';
import Conversations from './pages/Conversations.jsx';
import Home from './pages/Home.jsx';
import LichChup from './pages/LichChup.jsx';
import NotFound from './pages/NotFound.jsx';
import QuanLy from './pages/QuanLy.jsx';
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
        path="/quan-ly"
        element={
          <RequireRole roles={['admin']}>
            <QuanLy />
          </RequireRole>
        }
      />
      {/* Homes of the staff and the Superadmin, until steps G8 and G11 build them. */}
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
            <ComingSoon title="Quản trị hệ thống" step="G11" />
          </RequireRole>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
