import Button from './Button.jsx';
import ChatPanel from './ChatPanel.jsx';
import { messages } from '../data.js';

// The chat on the landing page: it can be folded away and shows which package is being asked about.
export default function ChatDock({ open, onToggle, packageName }) {
  return (
    <div className="chat-dock" id="chat">
      <div className="chat-dock-bar">
        <p role="status">{packageName ? `Đang hỏi về: ${packageName}` : 'Chưa chọn gói nào'}</p>
        <Button variant="secondary" aria-expanded={open} aria-controls="home-chat-box" onClick={onToggle}>
          {open ? 'Thu nhỏ chat' : 'Chat với studio'}
        </Button>
      </div>
      <div id="home-chat-box" hidden={!open}>
        <ChatPanel
          id="home-chat"
          label="Tin nhắn cho studio"
          placeholder="Nhập tin nhắn cho studio"
          messages={messages.slice(0, 1)}
          action="quan-ly.html"
        />
      </div>
    </div>
  );
}
