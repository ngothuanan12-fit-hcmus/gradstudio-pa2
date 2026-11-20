import { Route, Routes } from 'react-router';
import Home from './pages/Home.jsx';
import LichChup from './pages/LichChup.jsx';
import NotFound from './pages/NotFound.jsx';
import QuanLy from './pages/QuanLy.jsx';

// Every screen has its own path, opened directly or after a reload. The paths are listed in FRONTEND.md, section 4.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/lich-chup" element={<LichChup />} />
      <Route path="/quan-ly" element={<QuanLy />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
