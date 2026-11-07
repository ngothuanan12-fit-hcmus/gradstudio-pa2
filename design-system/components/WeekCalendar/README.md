# WeekCalendar

Lịch tuần trong “Lịch chụp của tôi”, gồm 7 ngày (T2–CN) và danh sách lịch hẹn của ngày đang chọn.

- Truyền vào `title` (ví dụ “19 – 25/10/2026”), `days[{dow, num, events[{from, to, title, where}]}]`, `selected`, `onPrev` và `onNext`.
- Ngày có lịch có số ngày nằm trong vòng tròn `accent`. Ngày đang chọn có vạch `accent` ở cạnh dưới.
- Các ngày là `role="tab"`. Danh sách lịch hẹn là `tabpanel`.
- Mỗi lịch hẹn ghi giờ, việc gì, với ai và ở đâu: “14:00–16:00 · Chụp với Tuấn · GS-1024 · Phòng B”.
