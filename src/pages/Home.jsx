import CustomerLayout from '../layouts/CustomerLayout.jsx';
import ChatPanel from '../components/ChatPanel.jsx';
import { messages } from '../data.js';

// Placeholder for An's landing page. The chat form is the main-flow link to the next page.
export default function Home() {
  return (
    <CustomerLayout current="home">
      <h1 className="page-title">Đi qua một buổi chụp</h1>
      <ChatPanel
        id="home-chat"
        label="Tin nhắn cho studio"
        placeholder="Nhập tin nhắn cho studio"
        messages={messages.slice(0, 1)}
        action="quan-ly.html"
      />
    </CustomerLayout>
  );
}
