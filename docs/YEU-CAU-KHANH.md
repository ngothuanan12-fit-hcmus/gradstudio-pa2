# Yêu cầu cho Khánh: trang quản lý và "Lịch chụp của tôi"

Hạn nộp: 22:00 Chủ nhật 8/11/2026. An làm landing page và duyệt bài của Khánh theo đúng rubric.

## Bắt đầu

1. Chấp nhận lời mời vào repo rồi `git clone` về máy.
2. Đặt tên của bạn **trong repo này**, vì thầy đọc tên trong lịch sử commit:
   `git config user.name "Nguyễn Hữu Khánh"` và `git config user.email "<email của bạn>"`.
3. Đọc theo thứ tự: `CLAUDE.md`, `design-system/README.md`, file này.
4. Mở `design-system/preview.html` trong trình duyệt để xem component (cần mạng).
5. Bảo agent đọc `CLAUDE.md` trước khi làm. Nếu dùng agent khác Claude, nó đọc `AGENTS.md` rồi sang `CLAUDE.md`.
6. Chờ An đẩy khung dự án (Vite, token, font, `Button`, `src/data.js`) rồi mới tạo nhánh.

## Cách dùng design system

`design-system/` chỉ để tham khảo. **Trang thật không tải `bundle.js`, `bundle.css` hay React từ CDN.** Viết lại component thành file trong `src/components/`, mỗi component một file. Khi viết lại phải sửa các điểm sau:

| Trong bundle | Phải đổi thành |
|---|---|
| `window.GradStudio`, React 18 | Module `import`/`export`, React 19 |
| `key` theo chỉ số trong `ChatPanel`, `ConflictAlert`, `WeekCalendar` | `key` theo `id` của dữ liệu |
| `preventDefault` trong `BookingForm` | Bỏ, để form dùng `action` sang `lich-chup.html` |
| `.gs-sched-grid { min-width: 880px }` | `<table>` thật trong khung cuộn, hoặc danh sách ở 360px |
| `@import` font trong CSS | Font trong repo do An thêm |
| `DepositCard` đổi thành "Đã cọc" sau khi bấm | Không giả lập đã trả tiền. Nút ghi trong *Not wired yet* |

Chỉ dùng token có sẵn. Cần token mới thì hỏi An trước. Không tự đặt thêm giá, giờ hay chính sách ngoài đề xuất GradStudio.

## StatusBadge (kỹ nhất)

Design system có 4 tông, còn đề xuất có 9 trạng thái cộng thêm từ chối và hủy. Đề xuất ánh xạ, Khánh chốt với An trước khi code:

| Tông | Trạng thái |
|---|---|
| `neutral` | Yêu cầu mới, Đã chụp, Hoàn thành, Đã hủy, Từ chối |
| `pending` | Đang tư vấn, Chờ khách chọn ảnh, Đang chỉnh |
| `confirmed` | Đã xác nhận, Sắp chụp, Sẵn sàng giao |
| `conflict` | Trùng lịch |

- Mỗi tông khác nhau về độ sáng, kiểu viền và ký hiệu. Xem ở chế độ xám vẫn phân biệt được.
- Luôn có chữ, không dùng badge chỉ có chấm màu.
- Chữ đạt từ 4.5:1 trên nền của chính badge, ở cả hai theme.
- Cỡ chữ tối thiểu 14px, không viết cả câu.
- Badge là `span`, không có hover. Nếu bấm được thì phải là `button` cao 44px.
- "Chờ khách chọn ảnh" phải xuống dòng ở 360px, không làm vỡ thẻ.
- Làm một khu xem đủ mọi trạng thái để An duyệt, nhưng không để trong trang nộp.

## Các component khác

| Component | Phải có |
|---|---|
| `ConversationList` | Đang chọn, chưa đọc, danh sách rỗng, tên tiếng Việt rất dài. Mỗi dòng là `button` hoặc `a` cao từ 44px |
| `ChatPanel` | Tin của khách và studio, tin rất dài, ô nhập có `label`, gửi rỗng không tạo tin |
| `BookingForm` | Mọi ô có `label` thật, lỗi dưới ô kèm `aria-invalid`, form có `action` sang `lich-chup.html` |
| `ConflictAlert` | Nêu rõ ai bận lúc nào. Giờ trống là `button` có trạng thái đã chọn. Chọn 14:00 thì hết báo lỗi |
| `ResourceSchedule` | 4 kiểu Bận, Trùng, Trống, Đề xuất. Không che chữ. Xử lý 360px như bảng trên |
| `WeekCalendar` | Ngày đang chọn, ngày không có lịch, tab là `button`, 09:00 cũ gạch ngang, 14:00 là giờ mới |
| `BookingSummary` | `GS-1024`, gói, ngày, giờ, tiền thẳng cột, tên gói dài xuống dòng |
| `DepositCard` | 1.800.000đ, cọc 540.000đ, còn 1.260.000đ |

## Bố cục trang

- Trang quản lý: 360px một cột, 768px hai cột, 1280px ba cột.
- Mỗi trang: một `h1`, không nhảy cấp heading; có `header`, `nav`, `main`, `footer`; tối đa một nút `primary`.
- Theme `studio`. Liên kết tương đối, không dùng `/page.html`.
- Tên file trang quản lý đang là `hoi-thoai.html`. An có thể đổi thành `quan-ly.html`, nên chờ An chốt trước khi tạo file.

## Quy trình

1. Mỗi trang một nhánh và một Pull Request. Mỗi component một commit, tin nhắn nói rõ đã đổi gì.
2. Commit bài của agent trước, phần bạn sửa commit riêng.
3. Ghi `AI-LOG.md` ngay sau mỗi bước, thêm dòng `Who: Khánh`. Nêu lỗi của AI, kiểm tra nào bắt được, và bạn đã bảo nó gì.
4. Dán prompt bạn đã gửi vào `brief.md` theo đúng thứ tự.
5. Không ghi `Co-Authored-By` hay "Generated with" trong commit và Pull Request.
6. Trước khi tạo Pull Request, tự chạy bảng *Done means* trong `CLAUDE.md`.
7. Bạn phải giải thích được mọi dòng code, vì thầy có thể hỏi trên lớp.

## Mốc thời gian

| Lúc | Việc |
|---|---|
| Tối 7/11 | Chốt bảng badge, làm `StatusBadge` và `BookingForm` |
| 12:00 Chủ nhật | Pull Request trang quản lý |
| 16:00 | Pull Request lịch chụp, sửa xong nhận xét vòng 1 |
| 18:00 | Ảnh `screenshots/` và kết quả W3C `checks/` của 2 trang, thêm `docs/pa1/` và phần `PROTOTYPE.md` của 2 trang |
| 20:00 | Đọc lại toàn bộ code cùng An trước khi nộp |

Nếu trễ, ưu tiên: `StatusBadge`, rồi `BookingForm` và `ConflictAlert`, rồi `ResourceSchedule`, rồi phần còn lại. Báo An sớm nếu thấy không kịp.
