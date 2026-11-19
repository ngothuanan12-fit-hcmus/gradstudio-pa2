import ChatPanel from './ChatPanel.jsx';
import { messages } from '../data.js';

// The chat on the landing page, seen from Linh's side: her question and the studio's reply that it will check.
// It looks like a live chat window but stays in the page and always open (never floating over content): a header
// with the studio and which package is being asked about, the conversation, the message box. Sending has no next
// page in PA#2, so the send button is disabled with a note.
export default function ChatDock({ packageName }) {
  return (
    <div className="chat-dock" id="chat">
      <div className="chat-dock-bar">
        <span className="chat-avatar" aria-hidden="true">GS</span>
        <div className="chat-dock-who">
          <p className="chat-dock-name">GradStudio</p>
          <p role="status" id="home-chat-status" tabIndex={-1}>{packageName ? `Đang hỏi về: ${packageName}` : 'Chưa chọn gói nào'}</p>
        </div>
      </div>
      <ChatPanel
        id="home-chat"
        label="Tin nhắn cho studio"
        placeholder="Nhập tin nhắn"
        messages={messages.slice(0, 2)}
        viewer="customer"
        disabled
        note="Chưa gửi được tin nhắn trong bản mẫu."
      />
    </div>
  );
}
