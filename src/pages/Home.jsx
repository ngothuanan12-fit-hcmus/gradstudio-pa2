import { useState } from 'react';
import { flushSync } from 'react-dom';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import Button from '../components/Button.jsx';
import ChatDock from '../components/ChatDock.jsx';
import PackageCard from '../components/PackageCard.jsx';
import Story from '../components/Story.jsx';
import { formatVND, packages, processSteps } from '../data.js';
import '../styles/home.css';

export default function Home() {
  const [askingId, setAskingId] = useState(null);
  const asking = packages.find((item) => item.id === askingId);

  function askAbout(id) {
    // The status line must show the new package before it takes focus, so it is read out with it.
    flushSync(() => setAskingId(id));
    // Bring the whole chat window to the top of the screen (smoothly, unless motion is reduced), then move focus
    // without a second jump; focusing alone centres the status line and leaves the message box below the fold.
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('chat').scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
    document.getElementById('home-chat-status').focus({ preventScroll: true });
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

      <section className="home-section chat-section" aria-labelledby="hoi-studio-title">
        <div className="chat-panel">
          <h2 className="section-heading" id="hoi-studio-title">Nhắn cho studio</h2>
          <p>Kể studio bạn muốn chụp gì, ngày nào, đi mấy người. Studio xem lịch thợ chụp, makeup và phòng rồi trả lời trong chat.</p>
          <h3 className="chat-panel-title" id="hoi-goi-title">Bạn muốn hỏi gói nào?</h3>
          <div className="quick-packages" role="group" aria-labelledby="hoi-goi-title">
            {packages.map((item) => (
              <Button
                key={item.id}
                variant={item.id === askingId ? 'primary' : 'secondary'}
                aria-pressed={item.id === askingId}
                onClick={() => askAbout(item.id)}
              >
                <span className="quick-name">{item.name}</span>
                <span className="quick-price">Từ {formatVND(item.price)}{item.unit}</span>
              </Button>
            ))}
          </div>
          <h3 className="chat-panel-title">Nên kể cho studio</h3>
          <ul className="tell-list">
            <li>Buổi chụp gì: kỷ yếu lớp, tốt nghiệp hay chân dung CV</li>
            <li>Ngày bạn muốn chụp</li>
            <li>Đi mấy người</li>
            <li>Có cần makeup hay thuê áo không</li>
          </ul>
        </div>
        <ChatDock packageName={asking?.name} />
      </section>

      <div className="home-section next-screen">
        <p>Màn hình tiếp theo của bản mẫu:</p>
        <Button variant="secondary" href="quan-ly.html">Nhân viên studio: mở cuộc trò chuyện này</Button>
      </div>
    </CustomerLayout>
  );
}
