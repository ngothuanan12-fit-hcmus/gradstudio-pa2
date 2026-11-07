# BookingSummary

Thẻ tổng kết ở bên phải màn hình kết, gồm gói, ngày, giờ và giá.

- Truyền vào `booking` (dạng như `GradStudio.sampleBooking`), `time` (chuỗi, mặc định là từ giờ bắt đầu makeup đến giờ kết thúc chụp), `badge` (thường là `StatusBadge`) và `extra` (thêm cặp `<dt>/<dd>`).
- Màn hình kết dùng theme `studio` (nền sáng). Thẻ dùng `shadow-panel`.
- Giá tổng dùng `price-display` màu `accent`. Chỉ hiển thị con số studio đã cung cấp.
