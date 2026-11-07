# ConversationList

Danh sách hội thoại ở cột trái trang quản lý.

- Truyền vào `items[{id, name, time, last, status, unread}]`, `activeId` và `onSelect(id)`.
- Hội thoại đang mở có nền `surface-raised` và một vạch `accent` 3px ở mép trái.
- Số tin chưa đọc hiện trong vòng tròn `accent`, kèm chữ ẩn “tin chưa đọc”.
- Tin cuối cắt bớt trên một dòng. Trạng thái booking hiện bằng `StatusBadge` cạnh tên khách.
