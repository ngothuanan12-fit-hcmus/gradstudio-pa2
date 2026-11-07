# BookingForm

Form “Booking mới” của trang quản lý, gồm khách hàng, gói, ngày, giờ bắt đầu, thợ makeup, thợ chụp và phòng.

- Truyền vào `booking`, `conflict` (bool), `onSubmit` và `children` (thường là `ConflictAlert`, đặt ngay trên các nút hành động).
- Khi `conflict` là true:
  - Ô giờ có viền `danger` 2px và dòng lỗi “⚠ Mai (makeup) bận 08:00–12:00”.
  - Nhãn trạng thái chuyển thành “Trùng lịch”.
  - Nút “Tạo booking” bị vô hiệu cho tới khi chọn một giờ trống.
- Từ 768px, các field xếp 2 cột. Ở 360px, xếp 1 cột.
- Mọi field đều có `<label>` thật. Lỗi đặt ngay dưới field và có `aria-invalid`.
