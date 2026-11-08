import { useState } from 'react';
import { flushSync } from 'react-dom';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import ChatDock from '../components/ChatDock.jsx';
import PackageCard from '../components/PackageCard.jsx';
import Story from '../components/Story.jsx';
import { packages, processSteps } from '../data.js';
import '../styles/home.css';

export default function Home() {
  const [askingId, setAskingId] = useState(null);
  const [chatOpen, setChatOpen] = useState(true);
  const asking = packages.find((item) => item.id === askingId);

  function askAbout(id) {
    // The chat must be open in the page before it can take focus.
    flushSync(() => {
      setAskingId(id);
      setChatOpen(true);
    });
    document.getElementById('home-chat-input').focus();
  }

  return (
    <CustomerLayout current="home" wide>
      <Story />

      <section className="home-section" id="goi-chup" aria-labelledby="goi-chup-title">
        <h2 className="section-heading" id="goi-chup-title">Chọn buổi chụp của bạn</h2>
        <p>Cần makeup, thuê áo, hay muốn chụp kiểu không có trong ba gói này, bạn hỏi studio trong chat.</p>
        <div className="package-list">
          {packages.map((item) => (
            <PackageCard key={item.id} item={item} asking={item.id === askingId} onAsk={askAbout} />
          ))}
        </div>
        <p className="home-note">Giá tham khảo. Giá chốt được ghi trên booking sau khi tư vấn.</p>
      </section>

      <section className="home-section" aria-labelledby="quy-trinh-title">
        <h2 className="section-heading" id="quy-trinh-title">Từ một tin nhắn đến bộ ảnh hoàn chỉnh</h2>
        <ol className="process">
          {processSteps.map((step) => (
            <li key={step.id}>
              <h3 className="process-title">{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-section" aria-labelledby="hoi-studio-title">
        <h2 className="section-heading" id="hoi-studio-title">Ngày ra trường chỉ có một lần</h2>
        <p>Kể studio bạn muốn chụp gì, ngày nào, đi mấy người. Studio xem lịch thợ chụp, makeup và phòng rồi trả lời trong chat.</p>
        <ChatDock open={chatOpen} onToggle={() => setChatOpen(!chatOpen)} packageName={asking?.name} />
      </section>

      <p className="home-section home-note">
        Ảnh: Phú Lucas, Hưng Nguyễn và Darion Dewhirst (Unsplash), Nguyễn Tiến Thịnh (Pexels). Nguồn chi tiết trong docs/IMAGE_SOURCES.md.
      </p>
    </CustomerLayout>
  );
}
