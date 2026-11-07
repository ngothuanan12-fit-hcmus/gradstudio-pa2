# Button

Nút hành động. Có 3 biến thể: `primary` (nền `accent`), `secondary` (viền `line-strong`) và `ghost`.

- Mỗi màn hình có tối đa **một** nút `primary`, dành cho việc chính của màn hình đó (“Đặt buổi chụp”, “Tạo booking GS-1024”, “Thanh toán 540.000đ”).
- Nhãn nút bắt đầu bằng động từ và chỉ viết hoa chữ cái đầu câu. Không viết toàn bộ bằng chữ in hoa.
- `size="sm"` cao 44px, chỉ dùng trong bảng và các nhóm chip. Mặc định nút cao 48px.
- Truyền `href` thì nút render thành `<a>`. Nếu không, nút là `<button type="button">`. Muốn gửi form thì truyền `type="submit"`.
- Truyền `icon` là SVG 20px, đặt trước nhãn. Nút chỉ có icon thì bắt buộc có `aria-label`.
- Khi không thao tác được, dùng `disabled` và giải thích lý do ngay cạnh nút (xem `BookingForm`).
