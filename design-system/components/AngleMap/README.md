# AngleMap

Bản đồ nhỏ gồm các chấm góc chụp ở bên phải phần cuộn. Bấm vào một chấm để nhảy tới góc đó.

- Truyền vào `items` (mặc định là các bước có `angle` trong `GradStudio.journeySteps`), `current` (số góc) và `onSelect(n, step)`.
- Trong `onSelect`, gọi `scrollIntoView` lên `<article>` của bước. Không tự di chuyển góc nhìn: `IntersectionObserver` sẽ cập nhật `current`.
- Chấm đang chọn tô `accent`. Các chấm đã qua tô đặc `chalk`. Nhãn hiện ra khi hover, khi focus và ở chấm đang chọn.
- Mỗi nút có vùng bấm 44×44 và nhãn ẩn đầy đủ cho trình đọc màn hình.
- Dưới 768px: không dùng component này dạng dọc. Thay bằng mục lục ngang.
