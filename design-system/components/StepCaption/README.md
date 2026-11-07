# StepCaption

Khối chữ ở góc dưới trái của mỗi bước.

Khối gồm, theo thứ tự:
- Chỉ số bước `03 / 06`.
- Tiêu đề hai dòng:
  - `top`: IN HOA, màu `on-photo`.
  - `bottom`: in nghiêng, màu `accent`.
- Mô tả một câu, truyền qua `desc`.
- Vòng tiến độ “Góc 3/5”, truyền qua `angle` và `angles`.

Cách dùng:
- Truyền `top` dưới dạng chữ thường. Component tự chuyển sang in hoa bằng CSS, nhờ vậy trình đọc màn hình vẫn đọc đúng.
- Bước kết thúc không có góc, nên bỏ `angle` và vòng tiến độ sẽ ẩn đi.
- Khối luôn có nền `scrim`, nên chữ đạt ≥10:1 trên mọi ảnh.
- Đặt `as="h2"` (mặc định). Truyền `live` cho đúng **một** khối, là khối đang hiển thị, để trình đọc màn hình đọc khi bước thay đổi.
- Rộng tối đa 560px. Ở 360px, đặt khối ngay dưới ảnh, không đè lên ảnh.
