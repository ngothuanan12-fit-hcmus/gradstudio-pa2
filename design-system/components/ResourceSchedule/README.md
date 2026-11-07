# ResourceSchedule

Lịch theo ngày của thợ chụp, thợ makeup và phòng chụp. Mỗi người hoặc phòng là một hàng, trục ngang là giờ.

- Truyền vào `title`, `start` và `end` (giờ nguyên), `rows[{id, name, role, lanes, blocks[{from, to, label, kind, lane}]}]`.
- `kind` nhận một trong 4 giá trị: `busy`, `conflict`, `free`, `proposed`. Mỗi loại có kiểu riêng (xem bảng trạng thái trong README chính).
- Khi hai khối chồng lên nhau (khách yêu cầu giờ đang bận), đặt `lanes: 2` cho hàng và `lane: 2` cho khối thứ hai, để không khối nào che khối nào.
- Lưới giờ có thể cuộn ngang **bên trong** khung, và cột tên được giữ cố định. Trang thì không cuộn ngang.
- Ở 360px, cân nhắc thay bằng danh sách theo người, dùng cấu trúc giống `WeekCalendar`.
