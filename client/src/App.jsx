import { Route, Routes } from 'react-router';
import RequireRole from './auth/RequireRole.jsx';
import Home from './pages/Home.jsx';
import LichChup from './pages/LichChup.jsx';
import NotFound from './pages/NotFound.jsx';
import QuanLy from './pages/QuanLy.jsx';

// Every screen has its own path, opened directly or after a reload. The paths are listed in FRONTEND.md, section 4.
// A protected screen sits inside RequireRole with the roles that may open it.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
