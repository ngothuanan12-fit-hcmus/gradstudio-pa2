# Link prototype GradStudio

**Link Figma gốc:**

<https://proxy-swept-63177389.figma.site>

Đường dẫn trực tiếp từng màn:

1. [Màn 1 — Dịch vụ và chat của khách](https://proxy-swept-63177389.figma.site/#/)
2. [Màn 2 — Admin tư vấn và xử lý lịch](https://proxy-swept-63177389.figma.site/#/studio/hoi-thoai)
3. [Màn 3 — Lịch chụp của Linh](https://proxy-swept-63177389.figma.site/#/lich-chup)

## Câu chuyện xuyên suốt và cách xem

Linh muốn chụp tốt nghiệp có makeup ngày **24/10/2026 lúc 09:00**. Studio kiểm tra và thấy thợ makeup Mai đã bận buổi sáng, nên đề xuất **makeup 13:00–14:00, chụp 14:00–16:00**. Linh đồng ý trong chat; Admin tạo booking; Linh xem lại lịch và thanh toán cọc để giữ lịch chính thức.

Ba màn lần lượt thể hiện **khách hỏi dịch vụ → Admin xử lý yêu cầu → khách xem lịch và cọc**. Các nút **Màn 1 / Màn 2 / Màn 3** ở góc dưới giúp người xem chuyển vai trò trong demo. Màn 2 là góc nhìn của Admin Thảo; khách Linh không dùng màn quản trị này.

Prototype dùng dữ liệu mẫu để có thể mở và xem từng màn trực tiếp. Chuyển qua lại giữa các màn không có nghĩa mọi tin nhắn, thay đổi form và trạng thái đều đồng bộ như một hệ thống hoàn chỉnh. Để xem đúng câu chuyện mẫu, đi theo các bước dưới đây; nếu đã thử nhánh khác, dùng **Đặt lại demo** trên Màn 2 hoặc Màn 3 để khôi phục trạng thái ban đầu của màn đó.

## Màn 1 — Khách xem dịch vụ và mở cuộc tư vấn

[Mở Màn 1](https://proxy-swept-63177389.figma.site/#/) · [Xem ảnh Màn 1](01-customer-services-chat.png)

### Màn hình thể hiện điều gì?

Đây là trang dịch vụ nhìn từ phía **khách hàng Linh**. Khách xem phong cách ảnh, các gói và giá tham khảo trước khi hỏi studio. Phần đầu giới thiệu GradStudio; cuộn xuống có thẻ dịch vụ, ảnh mẫu, quy trình và nội dung giới thiệu. Khung chat ở góc trang giúp khách hỏi ngay trong lúc xem dịch vụ. Nguồn ảnh minh họa được ghi trong [IMAGE_SOURCES.md](IMAGE_SOURCES.md).

### Luồng bấm chính

1. Bấm **Xem gói chụp** ở đầu trang. Trang cuộn xuống khu vực các gói dịch vụ.
2. Tại gói **Tốt nghiệp**, bấm **Tư vấn gói này**. Khung chat mở và hiển thị ngữ cảnh đang hỏi về gói Tốt nghiệp. Có thể mở chat trực tiếp bằng **Chat với studio** ở đầu hoặc cuối trang.
3. Đọc cuộc chat mẫu: Linh hỏi **“Gói tốt nghiệp có makeup còn lịch 24/10 lúc 09:00 không?”**, studio trả lời **“Để mình kiểm tra lịch cho bạn nhé”**. Đây là yêu cầu được tiếp tục xử lý ở Màn 2.
4. Có thể nhập vào ô **Nhập tin nhắn…** rồi bấm nút gửi để thêm tin nhắn trong demo. Nội dung nhập thêm không tự biến thành một booking.
5. Bấm **Màn 2** ở góc dưới để chuyển sang vai Admin, xem studio tiếp nhận và kiểm tra lịch cho Linh.

### Các thao tác khác

| Thao tác | Kết quả / ý nghĩa |
| --- | --- |
| Bấm **Thu nhỏ chat**, sau đó **Chat với studio** | Thu gọn rồi mở lại khung tư vấn. |
| Bấm **Tư vấn gói này** ở một gói khác | Đổi ngữ cảnh gói đang hỏi trong khung chat; không tạo booking hay tự chốt giờ. |
| Bấm **Lịch chụp của tôi** trên thanh điều hướng | Mở Màn 3, nơi khách xem booking. Khi mở trực tiếp, màn này có sẵn dữ liệu mẫu. |

## Màn 2 — Admin tư vấn, xử lý trùng lịch và tạo booking

[Mở Màn 2](https://proxy-swept-63177389.figma.site/#/studio/hoi-thoai) · [Xem ảnh Màn 2](02-admin-scheduling.png)

### Màn hình thể hiện điều gì?

Đây là không gian làm việc của **Admin Thảo**, gồm ba cột:

| Vùng | Nội dung và mục đích |
| --- | --- |
| Cột trái | Danh sách hội thoại, ô tìm khách và bộ lọc trạng thái; giúp Admin chọn khách cần tư vấn. Luồng chính dùng hội thoại **Nguyễn Thùy Linh**. |
| Cột giữa | Nội dung chat và form **Booking mới** nằm bên dưới. Admin trao đổi với khách, thống nhất giờ rồi tạo booking gắn với cuộc tư vấn. Cột này có vùng cuộn riêng. |
| Cột phải | Lịch thợ makeup, thợ chụp và phòng, kèm các gợi ý giờ trống. Admin nhìn lịch để biết tài nguyên nào đang bận và khoảng giờ nào đủ điều kiện. |

Yêu cầu **09:00** ban đầu bị trùng vì **Mai đã bận 08:00–12:00**. Vì chưa có giờ phù hợp được Linh đồng ý, nút **Tạo booking** chưa bật. Việc nhìn thấy form không có nghĩa booking đã được tạo.

### Luồng bấm chính

1. Mở hội thoại **Nguyễn Thùy Linh**. Nếu đã thử trước đó, bấm **Đặt lại demo** để trở về yêu cầu 09:00 ban đầu.
2. Xem lịch tài nguyên và phần gợi ý bên phải; bấm **Chọn 14:00**. Chat xuất hiện lời studio đề xuất **makeup 13:00–14:00, chụp 14:00–16:00** và hỏi Linh có chốt giờ này không.
3. Trong phần **Mô phỏng phản hồi của Linh**, bấm **Chốt giờ này**. Đây là thao tác để người xem đóng vai Linh đồng ý ngay trong demo. Chat thêm câu **“Dạ em chốt lịch 14:00 ạ.”**, hội thoại chuyển sang **Đã chốt lịch** và nút **Tạo booking** được bật. **Chỉ bấm Chọn 14:00 thì chưa hoàn tất bước khách đồng ý.**
4. Cuộn **cột giữa** xuống form **Booking mới**. Prototype có thể tự cuộn tới form sau khi chốt; nếu thanh tóm tắt có nút **Xem booking ↓** đang hiện, có thể bấm để tới form.
5. Kiểm tra thông tin: khách Linh; loại buổi chụp **Tốt nghiệp cá nhân**; gói **Gói Tốt nghiệp Premium · 2 giờ · 30 ảnh chỉnh**; ngày **24/10/2026**; giờ bắt đầu **chụp 14:00**; có makeup; giá **1.800.000đ**. Phân công dự kiến là **Mai** makeup, **Tuấn** chụp và **Phòng B**. Makeup bắt đầu sớm hơn giờ chụp một tiếng.
6. Bấm **Tạo booking**. Prototype tạo **GS-1024**, thêm thông báo vào chat và hiển thị trạng thái **Chờ thanh toán cọc 30%**. Khách đã đồng ý giờ, nhưng lịch chỉ được giữ chính thức sau khi cọc thành công.
7. Sau khoảng **2 giây**, prototype tự chuyển sang **Màn 3** để xem booking từ phía Linh. Cũng có thể dùng nút **Màn 3** ở góc dưới để mở màn này.

### Các nhánh và nút cần phân biệt

| Thao tác | Kết quả / cách tiếp tục |
| --- | --- |
| **Chọn 14:00 → Từ chối** | Chat thêm lời Linh từ chối; chưa chuyển sang **Đã chốt lịch** và chưa thể tạo booking. Admin có thể đề xuất một giờ khác. Dùng **Đặt lại demo** nếu muốn quay về và thử lại luồng 14:00. |
| **Gửi báo giá vào chat** | Thêm thẻ báo giá vào cuộc trò chuyện. Nút này không thay cho bước Linh đồng ý và không tạo booking. |
| Nhập tin nhắn trong hội thoại Admin | Thêm lời tư vấn vào chat đang mở. Để demo nhận trạng thái Linh đồng ý, dùng **Chốt giờ này**; tự gõ một câu đồng ý không thay thế nút mô phỏng này. |
| Chọn một gợi ý giờ khác | Thử phương án khác trong cùng màn. Khi theo dõi câu chuyện và ba ảnh chính, dùng phương án **14:00 ngày 24/10** để giữ thông tin xuyên suốt. |
| **Đặt lại demo** | Khôi phục dữ liệu minh họa của Màn 2 để thử lại từ yêu cầu ban đầu. |

**Phân biệt tên:** **Tốt nghiệp cá nhân** là *loại buổi chụp*; **Tốt nghiệp Premium** là *tên gói*. Hai trường này không thay thế cho nhau.

### Lưu ý về ảnh Màn 2 bị cắt

**Ảnh Màn 2 bị cắt, chưa hiển thị đầy đủ form. Vui lòng xem thêm hai ảnh trong [reference/](../reference/README.md) và xem kỹ trên link prototype ở trên.**

Chat và form **Booking mới** cùng nằm trong cột giữa có vùng cuộn riêng. Ảnh ở một vị trí cuộn không thể hiện hết cả đoạn chat lẫn phần cuối form:

- [02b-admin-linh-agrees.png](../reference/02b-admin-linh-agrees.png): cho thấy lời đề xuất và câu Linh đồng ý; phần cuối form còn nằm ngoài khung ảnh.
- [02c-admin-booking-ready.png](../reference/02c-admin-booking-ready.png): cuộn xuống để thấy đầy đủ form và nút **Tạo booking** đã bật; đoạn chat nằm phía trên vùng đang xem.

Hai ảnh bổ sung là **hai vị trí cuộn của cùng Màn 2 sau khi Linh đồng ý**, không phải hai màn mới. Khi xem trực tiếp, đặt con trỏ trong **cột giữa** để cuộn phần chat/form.

## Màn 3 — Khách xem lịch đã thống nhất và thanh toán cọc

[Mở Màn 3](https://proxy-swept-63177389.figma.site/#/lich-chup) · [Xem ảnh Màn 3](03-customer-appointment.png)

### Màn hình thể hiện điều gì?

Linh xem lại booking đã thống nhất với studio, biết mình cần đến lúc nào và cần trả bao nhiêu để giữ lịch:

- **Lịch tuần và dòng thời gian bên trái:** đánh dấu **thứ Bảy, 24/10/2026**; gạch giờ **09:00** để nhắc yêu cầu ban đầu không thực hiện được; hiển thị **makeup với Mai 13:00–14:00** và **chụp với Tuấn 14:00–16:00**. Hướng dẫn có mặt sớm 10 phút áp dụng cho mốc makeup.
- **Thẻ booking bên phải:** mã **GS-1024**, gói **Tốt nghiệp Premium**, bao gồm makeup và 2 giờ chụp; ban đầu có trạng thái **Đã thống nhất lịch · Chờ cọc 30%**.
- **Chi phí:** tổng **1.800.000đ**; cọc 30% là **540.000đ**; còn lại 70% là **1.260.000đ**, **thanh toán sau buổi chụp**.
- **Bản đồ bên dưới:** minh họa vị trí studio; chưa cung cấp tính năng chỉ đường thật.

**13:00 là giờ bắt đầu makeup, 14:00 là giờ bắt đầu chụp.** Hai mốc này cùng thuộc một booking. Linh đã chốt giờ ở bước chat nên màn này cho xem lại lịch và trả cọc.

### Luồng bấm chính

1. Xem ngày, các mốc makeup/chụp, tên gói và số tiền trên booking.
2. Bấm **Thanh toán cọc 30%**. Hộp **Mô phỏng thanh toán** mở ngay trên Màn 3, với khoản cọc **540.000đ**.
3. Chọn một trong hai nhánh:
   - **Hủy:** đóng hộp thanh toán; booking vẫn **Chờ cọc**, nút thanh toán vẫn còn để thử lại.
   - **Thanh toán thành công:** mô phỏng đã trả cọc; booking chuyển sang **Đã đặt lịch**, khoản 540.000đ được đánh dấu **Đã thanh toán** và nút thanh toán được thay bằng lời hẹn Linh đến **13:00 để makeup**.
4. Sau khi cọc thành công, số lượng ở tab **Chờ cọc** giảm về **0**, tab **Đã đặt lịch** tăng lên **1**. Khoản **70% còn lại** vẫn được hiển thị là thanh toán sau buổi chụp.

Đây là thao tác thanh toán mô phỏng, không thực hiện giao dịch tiền thật. Prototype chưa có luồng bấm trả 70% còn lại, chọn ảnh hoặc nhận ảnh.

### Bộ lọc và thao tác xem lại

| Thao tác | Kết quả / ý nghĩa |
| --- | --- |
| **Tất cả / Chờ cọc / Đã đặt lịch / Hoàn thành** | Lọc booking theo trạng thái, không đổi trạng thái booking. Nếu không có kết quả, hiện **Chưa có lịch chụp nào ở mục này.** |
| Bấm **Hoàn thành** khi số lượng là 0 | Xem danh sách trống; không đánh dấu buổi chụp hiện tại là hoàn thành. |
| **Đặt lại demo** | Khôi phục booking mẫu về trạng thái chờ cọc để thử lại hai nhánh thanh toán. |
| **Dịch vụ** trên thanh điều hướng hoặc **Màn 1** | Quay lại trang dịch vụ. |

## Các phần giao diện ngoài luồng minh họa chính

Các mục menu quản trị khác như **Booking, Lịch studio, Tài nguyên, Nhân sự**, menu tài khoản, liên kết thư viện/chân trang và **Xem đường đi** có phần đang là chỗ giữ chỗ hoặc chưa dẫn đến một màn chức năng riêng. Sự xuất hiện của chúng trên giao diện không có nghĩa prototype đã minh họa đầy đủ các chức năng đó. Phạm vi sản phẩm được mô tả riêng trong [PROPOSAL.md](../PROPOSAL.md).
