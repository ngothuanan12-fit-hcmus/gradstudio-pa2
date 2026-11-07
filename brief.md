# brief.md — prompts given to our assistants (PA#2, GradStudio)

Team: Ngô Thuận An (23120206), Nguyễn Hữu Khánh (24120340).

The prompts are pasted in order, in the language they were sent. Status lines and notes in English were added by the team. Prompts sent to Claude Code are in part 1, the design system set-up is in part 2, and the prompt for building the pages is in part 3.

## Part 1 — Claude Code: rules and decisions (sent)

### 1.1 Rules file (2026-11-04)

> Mình nghĩ cần xây dựng rule rõ ràng nếu dùng JavaScript vì môn chủ yếu vẫn dùng JavaScript và bài tập cũng áp dụng, làm rule theo các bài tập đã làm trong thư mục BT và theory

> Xem cả thư mục web có chỗ lưu lưu ý qua các nhận xét nữa

### 1.2 Lecturer's announcement (2026-11-06)

> thầy mình vừa cập nhật lại đề, bạn xem có thay đổi gì trong kế hoạch không

Followed by the lecturer's announcement, pasted in full: "PA#2: your team decides the design, and may use React".

> vẫn không có rubric mới chỉ có thêm đoạn thông báo chỉnh sửa trên thôi vậy nếu muốn học react sớm thì nên chọn react à, bạn xem trong thư mục theory xem để biết nên chọn cái nào

### 1.3 Decision, log and references (2026-11-07)

> chốt react, chưa có repo github, mọi commit hay pr đều không để co author hay generate with, kiểm tra có có cần ai log ngay không thì làm ai log ngay để không bị trừ điểm
> kiếm cho mình các web studio nước ngoài chụp ảnh để mình tham khảo cách làm giao diện và lựa chọn giao diện mình muốn

### 1.4 Slow network and separate pages (2026-11-07)

> có một lưu ý thầy nhắc đến trên lớp là trang web hoạt động mượt mà khi chuyển sang chế độ mạng yếu như bài tập mình đã làm thì sẽ dùng slow 4G và có thể dùng kiểu trang cho khách riêng và trang cho bên quản lý riêng thì đỡ làm phân quyền, theo bạn như vậy thì có đổi công nghệ thay cần lưu ý điều gì
> nhớ liên tục cập nhật ai log khi cần thiết

### 1.5 Design direction (2026-11-07)

> mình cần các thông tin để điền lên claude design để làm giao diện trước, về mô tả thì mình muốn trang landing page theo kiểu 3D, font chữ bạn dùng giống của thủ tục dễ, ý tưởng 3D thì mình có video nhưng chưa biết làm sao để bạn xem

> trong mô tả thì đối tượng là học sinh/sinh viên sắp tốt nghiệp luôn
> trong video thì khi lướt đến đâu thì nhà được xây đến đó và và ghi chú bước đó là bước gì thì phải, mình thì muốn có thể áp dụng cho web của mình là góc chụp set up trong lớp hoặc trong trường chuyển cảnh xem được các góc chụp khách nhau để khách biết quy trình chụp và khung hình chụp có thể có khi dùng dịch vụ thực tế

> bạn vẫn cứ xem video để lấy phong cách, các bố trí sắp xếp chữ, component, hiệu ứng, ... cho phù hợp nữa

### 1.6 Fonts (2026-11-07)

> gợi ý cho mình vài font để mình tìm trên font share

> Gambetta là không lỗi thôi
> áp dụng các font không lỗi theo bạn biết trước

## Part 2 — Claude Design: design system set-up (sent)

Tool: Claude Design, "Set up your design system" form. An confirmed this is the text pasted.

### Company name and blurb

```text
GradStudio: website đặt lịch chụp ảnh tốt nghiệp, kỷ yếu và chân dung cho một studio ở Việt Nam. Khách xem dịch vụ, chat với studio và theo dõi lịch chụp. Studio quản lý hội thoại, booking và lịch của thợ chụp, thợ makeup và phòng chụp.
```

### Any other notes?

```text
Đối tượng: học sinh, sinh viên sắp tốt nghiệp (khách) và nhân viên studio (quản lý). Giao diện tiếng Việt.

Phong cách: trang khách điện ảnh, sang trọng, full màn hình, lấy ảnh làm trung tâm. Trang quản lý sáng, gọn, dễ đọc khi có nhiều dữ liệu. Hai phía dùng chung một bộ màu và chữ. Xem ảnh tham khảo đính kèm để lấy cách bố trí, không chép tên, hình hay nội dung.

Font: Gambetta cho tiêu đề lớn, gồm dòng in nghiêng màu nhấn. Be Vietnam Pro cho nội dung, nút, form, bảng và trang quản lý. Phải hiển thị đúng dấu tiếng Việt.

Ý tưởng chính của landing page: "Đi qua một buổi chụp".
Mở đầu là sơ đồ lớp học vẽ nét phát sáng, có vị trí máy ảnh và đèn. Khách cuộn tới đâu, góc nhìn di chuyển trong bản vẽ nét của lớp học và sân trường tới đó, rồi ảnh thật của góc đó hiện dần lên trên nét vẽ.
Ví dụ minh họa, chưa phải quy trình chính thức của studio:
1. Sơ đồ set chụp: "CHUẨN BỊ / set chụp".
2. Góc bảng lớp: "GÓC BẢNG LỚP / cùng cả nhóm".
3. Góc bàn học: "GÓC BÀN HỌC / ánh sáng cửa sổ".
4. Góc hành lang: "GÓC HÀNH LANG / đi cùng bạn thân".
5. Sân trường: "SÂN TRƯỜNG / cả nhóm áo cử nhân".
6. Màn hình kết nền sáng: "Đặt buổi chụp của bạn".

Thành phần của phần cuộn:
- Góc dưới trái: số bước "03 / 06", tiêu đề hai dòng (dòng trên in hoa màu trắng, dòng dưới in nghiêng màu nhấn), một câu mô tả, vòng tiến độ "Góc 3/5". Có lớp tối dưới chữ để đủ tương phản.
- Góc trên trái: logo chữ GradStudio.
- Góc trên phải: ô "Gói Tốt nghiệp Premium 1.800.000đ" và nút "Chat với studio".
- Bên phải: bản đồ nhỏ các chấm góc chụp, bấm để nhảy tới góc đó.
Sau phần cuộn:
- Phần "Chọn gói của bạn": các gói chụp và tùy chọn makeup, thuê áo. Không tự đặt giá mới.
- Màn hình kết: bên trái là tiêu đề, ô chat và nút gửi; bên phải là thẻ tổng kết gồm gói, ngày, giờ và giá.

Ba màn hình cần có:
1. Trang khách: phần cuộn trên, các gói chụp, màn hình kết có chat.
2. Trang quản lý: danh sách hội thoại, nội dung chat, form "Booking mới", lịch thợ chụp/makeup/phòng, cảnh báo trùng lịch và gợi ý giờ trống.
3. "Lịch chụp của tôi": lịch tuần, thông tin booking, thanh toán cọc 30%.

Dữ liệu mẫu: khách Linh muốn chụp ngày 24/10/2026 lúc 09:00, nhưng thợ makeup Mai bận 08:00–12:00. Studio đề xuất makeup 13:00–14:00, chụp với thợ Tuấn 14:00–16:00 tại Phòng B. Booking GS-1024, Gói Tốt nghiệp Premium 1.800.000đ, cọc 540.000đ, còn lại 1.260.000đ.

Ràng buộc kỹ thuật:
- Thiết kế mobile first ở 360, 768 và 1280 px, không cuộn ngang.
- Sẽ làm bằng React và CSS thuần, không dùng thư viện UI hay thư viện 3D.
- Hình vẽ nét bằng SVG, di chuyển bằng CSS. Không chiếm quyền cuộn trang.
- Ở góc nhìn đầu tiên, toàn bộ hình vẽ phải nằm trong màn hình.
- Trên điện thoại và khi bật prefers-reduced-motion: các bước xếp dọc, mỗi bước một ảnh, không di chuyển góc nhìn.
- Trang phải mượt trên mạng Slow 4G.
- Chữ là văn bản thật, không nằm trong ảnh hay canvas.
- Chữ nội dung từ 16px, tương phản từ 4.5:1, nút cao ít nhất 44px, khoảng cách theo thang 4, 8, 12, 16, 24, 32, 48, 64 px.
```

Suggested attachments: four frames from the reference video and the font files. Team to confirm what was uploaded.

## Part 3 — Claude Code: building the pages

**Status: NOT YET SENT.** Remove this line and record the date when it is sent. Edit the prompt first if needed, and keep here exactly what is sent.

```text
Dựng 3 trang GradStudio bằng React theo thiết kế Claude Design đính kèm và luật trong CLAUDE.md.

Đầu vào:
- Ba màn hình gốc trong docs/pa1/. Giữ các tính năng và thứ tự luồng chính; bố cục, nội dung và màu do nhóm quyết định.
- Mọi khác biệt so với docs/pa1/ phải ghi vào "Changed since PA#1" trong PROTOTYPE.md.

Trang và liên kết:
- index.html: trang khách. Form chat có action tới trang quản lý.
- quan-ly.html: trang quản lý. Form "Tạo booking" có action tới lich-chup.html.
- lich-chup.html: "Lịch chụp của tôi". "Thanh toán cọc 30%" ghi vào "Not wired yet".
- Chỉ dùng đường dẫn tương đối tới file, không dùng /page.html hay thư mục.

Kỹ thuật:
- Vite + React, build 3 file HTML, base './'. Không router, không thêm thư viện, không gọi API. Dữ liệu trong src/data.js.
- CSS thuần với custom properties, thang khoảng cách 4, 8, 12, 16, 24, 32, 48, 64 px. Không !important.
- Mobile first, breakpoint 768 px và 1280 px. Không dùng width cố định gây tràn, không dùng overflow-x: hidden để che tràn.
- Semantic: header, nav, main, footer đúng chỗ; mỗi trang một h1, không nhảy cấp heading; hành động là button, chuyển trang là a href hoặc nút submit của form; mọi input có label nhìn thấy; mọi ảnh có alt.
- Nút và link đứng riêng cao ít nhất 44 px ở 360 px. Chữ nội dung từ 16 px, tương phản từ 4.5:1.
- Có ít nhất một mục dài, ví dụ tên tiếng Việt dài, và mục đó phải xuống dòng.

Done khi:
- npm run lint không có output; npm run build và npm run preview chạy, không có 404.
- Ở 360, 768 và 1280 px: document.documentElement.scrollWidth > document.documentElement.clientWidth in false, và dòng liệt kê phần tử tràn của rubric in [].
- W3C checker báo 0 lỗi; khung Accessibility trong DevTools có đủ landmark, h1, label, alt.
- Slow 4G với Disable cache: trang không trắng, không nhảy bố cục, mọi nút hoạt động.

Làm từng trang, dừng sau mỗi trang để nhóm kiểm tra và commit.
```

## Still to add

- The GradStudio screens in `docs/pa1/`, which Part 3 hands over.
- Any later prompts, in order, including those sent by Khánh.
