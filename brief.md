# brief.md — prompts given to our assistants (PA#2, GradStudio)

Team: Ngô Thuận An (23120206), Nguyễn Hữu Khánh (24120340).

The prompts are pasted in order, in the language they were sent. Status lines and notes in English were added by the team. Prompts sent to coding assistants are in Part 1, Part 3A, Part 4 and Part 5; the design system set-up is in Part 2. Part 3 is a draft that was never sent; the prompt actually sent for the two pages is Part 3A. Part 4 is the documentation audit sent on 2026-11-08; Part 5 is the branch and pull-request request sent later that day.

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

### 1.7 Review, division of work and repository (2026-11-07)

> đã xong thiết kế ban đầu trong artifact, bạn xem thử được không

> mình nên chia việc cho thành viên Khánh như thế nào

> về set up góc chụp bạn có cần mình lựa hình để để hiểu và tạo bố cục 3D như thế nào như trong video khong

> Mình chủ yếu sẽ thiết kế landing page còn các trang phần sau mình muốn Khánh làm và mình sẽ duyệt kỹ như cách thầy chấm, mình muốn yêu cầu Khánh thiết kế phần sau thật kỹ cho từng component đặc biệt là status bagde, ...
> Bạn cho mình phần phần chia lại

> Tạo luôn repo cho mình, liên tục cập nhật ai log

> đổi tên file có sai quy định không và nếu Khánh không có link design system thì sao, có thể gửi ở dạng khác vì Khánh có thể dùng agent khác nên mình muốn dùng file để dùng chung dễ dàng hơn

### 1.8 The photographer's story (2026-11-07)

> Mình có thể lấy hình ảnh pov photographer được không

> mình sẽ thích kiểu qua màn hình máy ảnh hơn vì muốn cái nhìn vào là khách hàng nhìn và

> ý tưởng của mình là pov của photographer cầm máy ảnh xong có một cái tay điều chỉnh cho mọi người trong lớp tạo dáng và chụp xong photographer di chuyển góc chụp tiếp tục chụp xong lại di chuyển ra sân trường để có góc chụp khác, giống như một câu chuyện chụp ảnh thật

> làm thử cho mình xem

> https://tracewood.aura.build/ bạn xem thử web này, mình thấy cách này khá hay và có thể áp dụng, bạn xem và nêu cho mình nếu áp dụng cho ý tưởng hiện tại thì câu chuyện chụp ảnh thay đổi bối cảnh thế nào

### 1.9 Skeleton and 3D (2026-11-07)

> Tên file: quan-ly.html

> mình vẫn muốn áp dụng phần 3d như tracewood được không

> bạn xem lại yêu cầu đề có file nào cần vừa làm vừa ghi song song như ai log nữa không

> 1 ok
> 2 chốt
> 3 mình sẽ tự thêm

> đừng xây bối cảnh ngay, chờ mình lấy hình theo gợi ý của bạn đã

> https://unsplash.com/fr/collections/JP8zgj9YQQ4/b%E1%BB%AFa-h%E1%BB%8Dc-cu%E1%BB%91i-c%C3%B9ng
> bạn xem các ảnh cso phù hợp chưa
> lấy ảnh nhớ để nguồn
> link của ảnh professional portrait student: https://unsplash.com/fr/photos/un-diplome-sourit-tenant-des-fleurs-pret-a-celebrer-ILJfgW9YbcI

An also attached that portrait photo.

> Ảnh của Anh Lee từ Pexels: https://www.pexels.com/vi-vn/anh/l-p-h-c-vui-t-i-c-a-h-c-sinh-ha-n-i-33415710/
> Ảnh của Nguyễn Tiến Thịnh từ Pexels: https://www.pexels.com/vi-vn/anh/bu-i-lien-hoan-trong-l-p-h-c-v-i-h-c-sinh-va-bong-bay-36985960/
> Ảnh của Green odette từ Pexels: https://www.pexels.com/vi-vn/anh/h-c-sinh-trung-h-c-an-m-ng-ngoai-tr-i-32292149/
> ảnh nào chưa biết chắc với nguồn nào thì nói mình

An also attached eight photos.

> ảnh chân dung đúng rồi
> Tuổi của người trong 2 ảnh Pexels: hai ảnh có vẻ là học sinh, có thể chưa đủ 18 tuổi, và đồng phục có thể có phù hiệu trường. Pexels không cho biết họ đã đồng ý thế nào. Với bài tập, mình đề xuất ghi rõ "Ảnh minh họa", không viết như thể đây là khách thật của studio phần này nên để lại, chưa xử lý vì mình không thích cách xử lý này
> xem font đúng chưa
> cảnh lớp học 3d làm từng phần nhỏ xem ổn không hoặc cần chỉnh sửa mới làm tiếp
> phần làm này nhớ lưu ý nhắc mình chọn reject nếu có sai vào ai log

> 3 điều cũng tạm ổn rồi, có thể cải thiện để thật hơn
> Nhãn cho ảnh có học sinh trên Pexels: mình giữ nguyên, chưa xử lý, và sẽ nhắc lại trước khi nộp.
> Font: chờ bạn chọn cụ thể là sao
> font thì theo bạn để xuất nhưng trình bày theo câu có các chữ kiểm tra lỗi font để mình xem ổn chưa
> nhớ nhắc mình xóa các phần không cần thiết hoặc chuyển qua thư mục khác để không nộp dư thừa

> font ổn, duyệt phần 1

> mình nghĩ không nên để mô hình người vào mà nên zoom lên bảng xong sẽ có các hình ghim các ảnh thật trên bảng, mỗi hình đại diện cho từng gói chụp luôn, zoom để thấy tổng quan các gói xong zoom từng hình, phần 2 này chắc mình sẽ reject để đổi ý tưởng

> trên bảng chưa nên có chữ ngay mà nên hiện khi cùng với ảnh, zoom vào từng hình bị nhanh quá, chuyển động không còn mượt nữa
> mình có thể commit lên repo để Khánh làm rồi mình tiếp tục làm phần của mình không được không

> bỏ file YEU-CAU-KHANH.md vì mình sẽ gửi tin nhắn

> ảnh cho mỗi gói nên có ảnh khác nhau, sửa lại các câu mô tả, xem trên các web thực tế người ta dùng cách mô tả thế nào và web gốc của nhóm kia có dòng mô tả không, story đang đi từ 1 đến 7 và chỉ nằm một bên trong khi tracewood hay video mình cho bạn xem minh họa chữ thay đổi linh hoạt tùy vào bối cảnh, nhớ ghi lại mình reject hay đồng ý vào ai log

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

## Part 3 — Claude Code: building the pages (draft, not sent)

**Status: DRAFT — NOT SENT.** Kept as the prepared prompt. The prompt actually sent is Part 3A.

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

## Part 3A — OpenCode: the two pages built (sent 2026-11-07)

**Nguyên văn prompt đã gửi.** The message also carried the harness's skill preamble; that is tooling text and is not reproduced here.

```text
1. TÍNH NĂNG
quan-ly.html
- Danh sách hội thoại có ô tìm và lọc trạng thái, có Nguyễn Thùy Linh.
- Chat và form Booking mới.
- Lịch thợ makeup, thợ chụp, phòng và gợi ý giờ trống.
- Yêu cầu 09:00 báo trùng vì Mai bận 08:00–12:00.
- Có nút Gửi báo giá vào chat.
Luồng chính: Chọn 14:00 thêm lời đề xuất vào chat → mô phỏng phản hồi của Linh: Chốt giờ này hoặc Từ chối → chốt thì nút Tạo booking mới bật → bấm sang lich-chup.html.

lich-chup.html
- Tab lọc Tất cả, Chờ cọc, Đã đặt lịch, Hoàn thành, có số lượng và trạng thái rỗng.
- Lịch tuần chọn ngày 24/10.
- Dòng thời gian: 09:00 gạch ngang, makeup 13:00–14:00, chụp 14:00–16:00.
- Thẻ booking GS-1024.
- Bản đồ minh họa.
Luồng chính: Thanh toán cọc 30% mở hộp Mô phỏng thanh toán 540.000đ. Hủy thì giữ nguyên. Thanh toán thành công thì chuyển sang Đã đặt lịch, đổi số trên các tab và hẹn 13:00.

Lưu ý
- Ghi rõ thanh toán là mô phỏng, không có giao dịch thật.
- Nút Xem đường đi ghi vào mục Not wired yet trong PROTOTYPE.md.
- Bỏ các nút Màn 1, 2, 3 và Đặt lại demo.

Dữ liệu mẫu (không tự thêm giá, giờ hay chính sách khác)
- Khách Linh, Admin Thảo, có mặt sớm 10 phút. Linh đồng ý: "Dạ em chốt lịch 14:00 ạ."
- Loại buổi chụp: Tốt nghiệp cá nhân.
- Gói: Gói Tốt nghiệp Premium · 2 giờ · 30 ảnh chỉnh.
- Giá 1.800.000đ, cọc 540.000đ, còn lại 1.260.000đ.
- Ngày 24/10/2026, thợ makeup Mai, thợ chụp Tuấn, Phòng B.
- Tên và giá các dịch vụ theo web gốc: Kỷ yếu lớp từ 350.000đ/người, Tốt nghiệp từ 1.800.000đ, Chân dung/CV từ 690.000đ.
- Đừng dùng tên "Gói Kỷ yếu nhóm" và "Gói Chân dung" trong design-system/components/bundle.js, vì web gốc không có.

2. STATUSBADGE
Yêu cầu
- Mỗi tông khác nhau về độ sáng, kiểu viền và ký hiệu. Xem ở chế độ xám vẫn phân biệt được.
- Luôn có chữ, không dùng badge chỉ có chấm màu.
- Chữ đạt từ 4.5:1 trên nền của chính badge, ở cả hai theme.
- Chữ tối thiểu 14px, không viết cả câu.
- Badge là span, không có hover. Nếu bấm được thì phải là button cao 44px.
- "Chờ khách chọn ảnh" phải xuống dòng ở 360px, không làm vỡ thẻ.

3. COMPONENT KHÁC
- ConversationList: đang chọn, chưa đọc, danh sách rỗng, tên tiếng Việt rất dài. Mỗi dòng là button hoặc a, cao từ 44px.
- ChatPanel: tin của khách và studio, tin rất dài, ô nhập có label, gửi rỗng không tạo tin.
- BookingForm: mọi ô có label thật, lỗi dưới ô kèm aria-invalid, form có action sang lich-chup.html.
- ConflictAlert: nêu rõ ai bận lúc nào. Giờ trống là button có trạng thái đã chọn. Chọn 14:00 thì hết báo lỗi.
- ResourceSchedule: 4 kiểu Bận, Trùng, Trống, Đề xuất. Không che hay cắt chữ: bản xem trước đang cắt "Linh yêu cầu" và "Linh · makeup" trong khối 1 giờ, phải sửa. Ở 360px dùng table thật trong khung cuộn, hoặc đổi thành danh sách.
- WeekCalendar: ngày đang chọn, ngày không có lịch, tab là button, 09:00 cũ gạch ngang, 14:00 là giờ mới.
- BookingSummary: GS-1024, gói, ngày, giờ, tiền thẳng cột, tên gói dài xuống dòng.
- DepositCard: 1.800.000đ, cọc 540.000đ, còn 1.260.000đ.

Khi chép từ design-system/ phải đổi:
- window.GradStudio và React 18 → module import/export và React 19.
- key theo chỉ số trong ChatPanel, ConflictAlert, WeekCalendar → key theo id.
- preventDefault trong BookingForm → bỏ, để form dùng action.
- .gs-sched-grid { min-width: 880px } → cách xử lý 360px nêu ở ResourceSchedule.
- @import font trong CSS → dùng font đã có trong repo.
Trang thật không tải bundle.js, bundle.css hay React từ CDN.

4. BỐ CỤC
- Trang quản lý: 360px một cột, 768px hai cột, 1280px ba cột.
- Mỗi trang một h1, không nhảy cấp heading. Có header, nav, main, footer. Tối đa một nút primary.
- Theme studio. Liên kết tương đối, không dùng /page.html.
- Trước khi tạo Pull Request, tự chạy bảng Done means trong CLAUDE.md.
```

## Part 4 — Documentation compliance audit (sent 2026-11-08)

**Nguyên văn prompt đã gửi.**

```text
## OWNER DIRECTIVE — DOCUMENTATION COMPLIANCE AUDIT

Bạn đã hoàn thành triển khai `quan-ly.html` và `lich-chup.html`. Tuy nhiên, tôi nghi ngờ bạn chưa thực hiện đầy đủ nghĩa vụ documentation theo `CLAUDE.md`.

### 1. Audit trước, sửa sau

Đọc lại `AGENTS.md`, `CLAUDE.md`, `AI-LOG.md`, `brief.md` và `PROTOTYPE.md`.

Kiểm tra `git status`, `git diff` và lịch sử commit liên quan.

Đối chiếu từng yêu cầu documentation trong `CLAUDE.md` với trạng thái thực tế của repository.

Đặc biệt xác minh:

- AI-LOG.md đã ghi lại các bước triển khai, kiểm thử, lỗi và quyết định chưa?
- brief.md đã lưu chính xác các prompt thực sự được gửi chưa?
- PROTOTYPE.md đã phản ánh đúng các tính năng hoàn thành và chưa kết nối chưa?
- Các kết quả kiểm thử trong báo cáo có evidence thực tế hay chỉ là những tuyên bố?
- Checklist Done means đã được thực hiện đầy đủ chưa?

### 2. Khắc phục các thiếu sót

Nếu phát hiện thiếu tài liệu, hãy cập nhật đúng quy định.

Đối với AI-LOG.md:
- Ghi lại những việc thực sự đã làm và kết quả kiểm thử có thể xác minh.
- Nêu rõ lỗi, cách xử lý, quyết định và phần can thiệp của con người.
- Không tự tạo commit hash; đánh dấu chưa commit nếu cần.
- Không backdate, không dựng lại lịch sử.

Đối với brief.md:
- Chỉ ghi nguyên văn prompt thực sự được gửi.
- Giữ đúng thứ tự lịch sử.
- Nếu không truy xuất được prompt gốc, ghi rõ không thể xác minh, tuyệt đối không tự tái tạo nội dung rồi coi là prompt gốc.

### 3. Ngăn tái diễn

Kiểm tra phần Done means trong CLAUDE.md.

Đề xuất bổ sung documentation gate bắt buộc:

- AI-LOG.md được cập nhật sau mỗi bước triển khai có ý nghĩa.
- brief.md được cập nhật sau mỗi prompt thực sự được gửi.
- Trước khi commit hoặc tạo PR, phải đối chiếu hai tài liệu với công việc thực tế.
- Không được tuyên bố hoàn thành nếu chưa thực hiện documentation gate.

Chỉ được sửa CLAUDE.md nếu không mâu thuẫn với các quy định đã có.

### 4. Giới hạn

- Không sửa lại implementation của hai trang.
- Không tự ý tạo commit hoặc Pull Request.
- Không chỉnh sửa lịch sử giả tạo để làm tài liệu trông đầy đủ.
- Không chạy lại toàn bộ test nếu evidence hiện có đã đủ; chỉ kiểm tra bổ sung khi cần.

### 5. Báo cáo cuối

Trả về:
1. Những yêu cầu CLAUDE.md đã tuân thủ.
2. Những yêu cầu đã vi phạm hoặc chưa có evidence.
3. Các tài liệu đã cập nhật và nội dung thay đổi.
4. Documentation gate đã được thiết lập như thế nào.
5. Những vấn đề chưa thể xác minh.

Từ các task tiếp theo, chủ động cập nhật AI-LOG.md và brief.md theo CLAUDE.md, không chờ tôi nhắc lại.
```

## Part 5 — GitHub branch and pull request (sent 2026-11-08)

**Nguyên văn prompt đã gửi.**

```text
Dùng gh cli để tạo cho tôi 1 nhánh develop từ main sau đó tạo branch từ những gì vừa làm commit lên branch sau đó push lên và tạo pull request vào develop viết comment đầy đủ
```

## Still to add

- Prompts sent after Part 5, in order, including any sent by Khánh.
