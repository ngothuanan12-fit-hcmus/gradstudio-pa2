# ChatPanel

Ô chat dùng ở hai nơi: màn hình kết bên phía khách, và cột giữa trang quản lý.

- Truyền vào `messages[{who, me, text, time}]`, `onSend(text)`, `placeholder`, `height` và `id` (bắt buộc khi có nhiều ô chat trên cùng trang).
- Tin của mình (`me`) nằm bên phải, nền `accent-soft`. Tin của bên kia nằm bên trái, nền `surface-raised`, có tên người gửi.
- Danh sách tin có `role="log"` và `aria-live="polite"`. Ô nhập có nhãn ẩn, nút gửi có chữ “Gửi”, không chỉ có icon.
- Nội dung tin dùng `body` 16px. Giờ gửi dùng `meta` 14px.
