import Button from './Button.jsx';
import ChatPanel from './ChatPanel.jsx';
import { messages } from '../data.js';

// The chat on the landing page, seen from Linh's side: her question and the studio's reply that it will check.
// It can be folded away and shows which package is being asked about. Sending has no next page in PA#2, so the
// send button is disabled with a note; the main flow goes on through a link that says who continues.
export default function ChatDock({ open, onToggle, packageName }) {
  return (
    <div className="chat-dock" id="chat">
      <div className="chat-dock-bar">
        <p role="status" id="home-chat-status" tabIndex={-1}>{packageName ? `Đang hỏi về: ${packageName}` : 'Chưa chọn gói nào'}</p>
        <Button variant="secondary" aria-expanded={open} aria-controls="home-chat-box" onClick={onToggle}>
          {open ? 'Thu nhỏ chat' : 'Chat với studio'}
        </Button>
      </div>
      <div id="home-chat-box" hidden={!open}>
        <ChatPanel
          id="home-chat"
          label="Tin nhắn cho studio"
          placeholder="Nhập tin nhắn cho studio"
          messages={messages.slice(0, 2)}
          viewer="customer"
          disabled
          note="Chưa gửi được tin nhắn trong bản mẫu."
        />
      </div>
      <Button variant="secondary" href="quan-ly.html">Nhân viên studio: mở cuộc trò chuyện này</Button>
    </div>
  );
}
